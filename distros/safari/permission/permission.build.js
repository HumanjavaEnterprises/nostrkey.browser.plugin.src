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

  // src/permission/permission.js
  init_process();

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

  // src/permission/permission.js
  var state = {
    host: "",
    permission: "",
    key: "",
    event: null,
    remember: false,
    profileType: "local",
    queuePosition: 0,
    queueTotal: 0
  };
  function getHumanPermission(perm) {
    switch (perm) {
      case "getPubKey":
        return "Read public key";
      case "signEvent":
        return "Sign event";
      case "getRelays":
        return "Read relay list";
      case "nip04.encrypt":
        return "Encrypt private message (NIP-04)";
      case "nip04.decrypt":
        return "Decrypt private message (NIP-04)";
      case "nip44.encrypt":
        return "Encrypt private message (NIP-44)";
      case "nip44.decrypt":
        return "Decrypt private message (NIP-44)";
      default:
        return perm;
    }
  }
  function getEventInfo() {
    if (state.permission !== "signEvent" || !state.event) return {};
    const found = KINDS.find(([kind2]) => kind2 === state.event.kind);
    const [kind, desc, nip] = found || ["Unknown", "Unknown", "https://github.com/nostr-protocol/nips"];
    return { kind, desc, nip };
  }
  function render() {
    const hostEl = document.getElementById("perm-host");
    const permEl = document.getElementById("perm-type");
    const bunkerNotice = document.getElementById("bunker-notice");
    const eventKindRow = document.getElementById("event-kind-row");
    const eventPreview = document.getElementById("event-preview");
    const eventPreviewPre = document.getElementById("event-preview-pre");
    const eventKindLink = document.getElementById("event-kind-link");
    const byKindLabel = document.getElementById("by-kind-label");
    if (hostEl) hostEl.textContent = state.host;
    if (permEl) permEl.textContent = getHumanPermission(state.permission);
    const queueEl = document.getElementById("perm-queue");
    if (queueEl) {
      queueEl.textContent = state.queueTotal > 1 ? `(${state.queuePosition} of ${state.queueTotal})` : "";
    }
    if (bunkerNotice) {
      bunkerNotice.style.display = state.profileType === "bunker" ? "block" : "none";
    }
    const isSigningEvent = state.permission === "signEvent";
    if (eventKindRow) {
      eventKindRow.style.display = isSigningEvent ? "block" : "none";
    }
    if (eventPreview) {
      eventPreview.style.display = isSigningEvent ? "block" : "none";
    }
    if (byKindLabel) {
      byKindLabel.style.display = isSigningEvent ? "inline" : "none";
    }
    if (isSigningEvent) {
      const info = getEventInfo();
      if (eventKindLink) {
        eventKindLink.textContent = info.desc;
        eventKindLink.href = info.nip;
      }
      if (eventPreviewPre) {
        eventPreviewPre.textContent = JSON.stringify(state.event, null, 2);
      }
    }
  }
  async function allow() {
    console.log("allowing");
    await api.runtime.sendMessage({
      kind: "allowed",
      payload: state.key,
      origKind: state.permission,
      event: state.event,
      remember: state.remember,
      host: state.host
    });
    console.log("closing");
    await closeTab();
  }
  async function deny() {
    await api.runtime.sendMessage({
      kind: "denied",
      payload: state.key,
      origKind: state.permission,
      event: state.event,
      remember: state.remember,
      host: state.host
    });
    await closeTab();
  }
  async function closeTab() {
    const tab = await api.tabs.getCurrent();
    console.log("closing current tab: ", tab.id);
    await api.tabs.update(tab.openerTabId, { active: true });
    window.close();
  }
  async function openNip() {
    const info = getEventInfo();
    if (info.nip) {
      await api.tabs.create({ url: info.nip, active: true });
    }
  }
  async function init() {
    const qs = new URLSearchParams(location.search);
    console.log(location.search);
    state.host = qs.get("host");
    state.permission = qs.get("kind");
    state.key = qs.get("uuid");
    state.event = JSON.parse(qs.get("payload"));
    state.queuePosition = parseInt(qs.get("queuePosition")) || 0;
    state.queueTotal = parseInt(qs.get("queueTotal")) || 0;
    state.profileType = await api.runtime.sendMessage({
      kind: "getProfileType"
    });
    render();
    document.getElementById("allow-btn")?.addEventListener("click", allow);
    document.getElementById("deny-btn")?.addEventListener("click", deny);
    document.getElementById("remember")?.addEventListener("change", (e) => {
      state.remember = e.target.checked;
    });
    document.getElementById("event-kind-link")?.addEventListener("click", (e) => {
      e.preventDefault();
      openNip();
    });
  }
  window.addEventListener("beforeunload", () => {
    api.runtime.sendMessage({ kind: "closePrompt" });
    return true;
  });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3F1aWNrLWZvcm1hdC11bmVzY2FwZWQvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Bpbm8vYnJvd3Nlci5qcyIsICJub2RlLXN0dWI6Y3J5cHRvIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9iZWNoMzIvZGlzdC9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCAiLi4vLi4vLi4vc3JjL3Blcm1pc3Npb24vcGVybWlzc2lvbi5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL3V0aWxzLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbC5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL2NyeXB0by5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL3NlZWRwaHJhc2UuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0Bub2JsZS9oYXNoZXMvc3JjL3V0aWxzLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abm9ibGUvaGFzaGVzL3NyYy9zaGEyLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abm9ibGUvaGFzaGVzL3NyYy9fbWQudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvaW5kZXgudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvdHlwZXMvaW5kZXgudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvdHlwZXMvYmFzZS50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy90eXBlcy9wcm90b2NvbC50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL2Rpc3QvZXNtL3R5cGVzL21lc3NhZ2VzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL3R5cGVzL2d1YXJkcy50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy90eXBlcy9uaXA0Ni50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy9jcnlwdG8udHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0Bub2JsZS9jdXJ2ZXMvc3JjL3NlY3AyNTZrMS50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG5vYmxlL2N1cnZlcy9zcmMvYWJzdHJhY3QvY3VydmUudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0Bub2JsZS9jdXJ2ZXMvc3JjL3V0aWxzLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abm9ibGUvY3VydmVzL3NyYy9hYnN0cmFjdC9tb2R1bGFyLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abm9ibGUvY3VydmVzL3NyYy9hYnN0cmFjdC93ZWllcnN0cmFzcy50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy91dGlscy9sb2dnZXIudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvZW5jb2RpbmcvYmFzZTY0LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL3ZhbGlkYXRpb24vaW5kZXgudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvZXZlbnQvaW5kZXgudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvZXZlbnQvY3JlYXRpb24udHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvZXZlbnQvc2lnbmluZy50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy9uaXBzL25pcC0wNC50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy9uaXBzL25pcC0wMS50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy9uaXBzL25pcC0xOS50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy9uaXBzL25pcC0yNi50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy9uaXBzL25pcC00NC50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy9uaXBzL25pcC00Ni50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy9uaXBzL25pcC00OS50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy91dGlscy9lbmNvZGluZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBNaW5pbWFsIHByb2Nlc3Mgc2hpbSBmb3IgYnJvd3NlciBjb250ZXh0LlxuICogTm9kZS5qcyBsaWJyYXJpZXMgYnVuZGxlZCB2aWEgbm9zdHItY3J5cHRvLXV0aWxzIChjcnlwdG8tYnJvd3NlcmlmeSxcbiAqIHJlYWRhYmxlLXN0cmVhbSwgZXRjLikgcmVmZXJlbmNlIHRoZSBnbG9iYWwgYHByb2Nlc3NgIG9iamVjdC5cbiAqIFRoaXMgcHJvdmlkZXMganVzdCBlbm91Z2ggZm9yIHRoZW0gdG8gd29yayBpbiBhIGJyb3dzZXIgZXh0ZW5zaW9uLlxuICovXG5leHBvcnQgdmFyIHByb2Nlc3MgPSB7XG4gICAgZW52OiB7IE5PREVfRU5WOiAncHJvZHVjdGlvbicsIExPR19MRVZFTDogJ3dhcm4nIH0sXG4gICAgYnJvd3NlcjogdHJ1ZSxcbiAgICB2ZXJzaW9uOiAnJyxcbiAgICBzdGRvdXQ6IG51bGwsXG4gICAgc3RkZXJyOiBudWxsLFxuICAgIG5leHRUaWNrOiBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uICgpIHsgZm4uYXBwbHkobnVsbCwgYXJncyk7IH0pO1xuICAgIH0sXG59O1xuIiwgIid1c2Ugc3RyaWN0J1xuZnVuY3Rpb24gdHJ5U3RyaW5naWZ5IChvKSB7XG4gIHRyeSB7IHJldHVybiBKU09OLnN0cmluZ2lmeShvKSB9IGNhdGNoKGUpIHsgcmV0dXJuICdcIltDaXJjdWxhcl1cIicgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZvcm1hdFxuXG5mdW5jdGlvbiBmb3JtYXQoZiwgYXJncywgb3B0cykge1xuICB2YXIgc3MgPSAob3B0cyAmJiBvcHRzLnN0cmluZ2lmeSkgfHwgdHJ5U3RyaW5naWZ5XG4gIHZhciBvZmZzZXQgPSAxXG4gIGlmICh0eXBlb2YgZiA9PT0gJ29iamVjdCcgJiYgZiAhPT0gbnVsbCkge1xuICAgIHZhciBsZW4gPSBhcmdzLmxlbmd0aCArIG9mZnNldFxuICAgIGlmIChsZW4gPT09IDEpIHJldHVybiBmXG4gICAgdmFyIG9iamVjdHMgPSBuZXcgQXJyYXkobGVuKVxuICAgIG9iamVjdHNbMF0gPSBzcyhmKVxuICAgIGZvciAodmFyIGluZGV4ID0gMTsgaW5kZXggPCBsZW47IGluZGV4KyspIHtcbiAgICAgIG9iamVjdHNbaW5kZXhdID0gc3MoYXJnc1tpbmRleF0pXG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKVxuICB9XG4gIGlmICh0eXBlb2YgZiAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZlxuICB9XG4gIHZhciBhcmdMZW4gPSBhcmdzLmxlbmd0aFxuICBpZiAoYXJnTGVuID09PSAwKSByZXR1cm4gZlxuICB2YXIgc3RyID0gJydcbiAgdmFyIGEgPSAxIC0gb2Zmc2V0XG4gIHZhciBsYXN0UG9zID0gLTFcbiAgdmFyIGZsZW4gPSAoZiAmJiBmLmxlbmd0aCkgfHwgMFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGZsZW47KSB7XG4gICAgaWYgKGYuY2hhckNvZGVBdChpKSA9PT0gMzcgJiYgaSArIDEgPCBmbGVuKSB7XG4gICAgICBsYXN0UG9zID0gbGFzdFBvcyA+IC0xID8gbGFzdFBvcyA6IDBcbiAgICAgIHN3aXRjaCAoZi5jaGFyQ29kZUF0KGkgKyAxKSkge1xuICAgICAgICBjYXNlIDEwMDogLy8gJ2QnXG4gICAgICAgIGNhc2UgMTAyOiAvLyAnZidcbiAgICAgICAgICBpZiAoYSA+PSBhcmdMZW4pXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGlmIChhcmdzW2FdID09IG51bGwpICBicmVha1xuICAgICAgICAgIGlmIChsYXN0UG9zIDwgaSlcbiAgICAgICAgICAgIHN0ciArPSBmLnNsaWNlKGxhc3RQb3MsIGkpXG4gICAgICAgICAgc3RyICs9IE51bWJlcihhcmdzW2FdKVxuICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgIGkrK1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMTA1OiAvLyAnaSdcbiAgICAgICAgICBpZiAoYSA+PSBhcmdMZW4pXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGlmIChhcmdzW2FdID09IG51bGwpICBicmVha1xuICAgICAgICAgIGlmIChsYXN0UG9zIDwgaSlcbiAgICAgICAgICAgIHN0ciArPSBmLnNsaWNlKGxhc3RQb3MsIGkpXG4gICAgICAgICAgc3RyICs9IE1hdGguZmxvb3IoTnVtYmVyKGFyZ3NbYV0pKVxuICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgIGkrK1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgNzk6IC8vICdPJ1xuICAgICAgICBjYXNlIDExMTogLy8gJ28nXG4gICAgICAgIGNhc2UgMTA2OiAvLyAnaidcbiAgICAgICAgICBpZiAoYSA+PSBhcmdMZW4pXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGlmIChhcmdzW2FdID09PSB1bmRlZmluZWQpIGJyZWFrXG4gICAgICAgICAgaWYgKGxhc3RQb3MgPCBpKVxuICAgICAgICAgICAgc3RyICs9IGYuc2xpY2UobGFzdFBvcywgaSlcbiAgICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBhcmdzW2FdXG4gICAgICAgICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBzdHIgKz0gJ1xcJycgKyBhcmdzW2FdICsgJ1xcJydcbiAgICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgc3RyICs9IGFyZ3NbYV0ubmFtZSB8fCAnPGFub255bW91cz4nXG4gICAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgICAgc3RyICs9IHNzKGFyZ3NbYV0pXG4gICAgICAgICAgbGFzdFBvcyA9IGkgKyAyXG4gICAgICAgICAgaSsrXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAxMTU6IC8vICdzJ1xuICAgICAgICAgIGlmIChhID49IGFyZ0xlbilcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgaWYgKGxhc3RQb3MgPCBpKVxuICAgICAgICAgICAgc3RyICs9IGYuc2xpY2UobGFzdFBvcywgaSlcbiAgICAgICAgICBzdHIgKz0gU3RyaW5nKGFyZ3NbYV0pXG4gICAgICAgICAgbGFzdFBvcyA9IGkgKyAyXG4gICAgICAgICAgaSsrXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAzNzogLy8gJyUnXG4gICAgICAgICAgaWYgKGxhc3RQb3MgPCBpKVxuICAgICAgICAgICAgc3RyICs9IGYuc2xpY2UobGFzdFBvcywgaSlcbiAgICAgICAgICBzdHIgKz0gJyUnXG4gICAgICAgICAgbGFzdFBvcyA9IGkgKyAyXG4gICAgICAgICAgaSsrXG4gICAgICAgICAgYS0tXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgICsrYVxuICAgIH1cbiAgICArK2lcbiAgfVxuICBpZiAobGFzdFBvcyA9PT0gLTEpXG4gICAgcmV0dXJuIGZcbiAgZWxzZSBpZiAobGFzdFBvcyA8IGZsZW4pIHtcbiAgICBzdHIgKz0gZi5zbGljZShsYXN0UG9zKVxuICB9XG5cbiAgcmV0dXJuIHN0clxufVxuIiwgIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBmb3JtYXQgPSByZXF1aXJlKCdxdWljay1mb3JtYXQtdW5lc2NhcGVkJylcblxubW9kdWxlLmV4cG9ydHMgPSBwaW5vXG5cbmNvbnN0IF9jb25zb2xlID0gcGZHbG9iYWxUaGlzT3JGYWxsYmFjaygpLmNvbnNvbGUgfHwge31cbmNvbnN0IHN0ZFNlcmlhbGl6ZXJzID0ge1xuICBtYXBIdHRwUmVxdWVzdDogbW9jayxcbiAgbWFwSHR0cFJlc3BvbnNlOiBtb2NrLFxuICB3cmFwUmVxdWVzdFNlcmlhbGl6ZXI6IHBhc3N0aHJvdWdoLFxuICB3cmFwUmVzcG9uc2VTZXJpYWxpemVyOiBwYXNzdGhyb3VnaCxcbiAgd3JhcEVycm9yU2VyaWFsaXplcjogcGFzc3Rocm91Z2gsXG4gIHJlcTogbW9jayxcbiAgcmVzOiBtb2NrLFxuICBlcnI6IGFzRXJyVmFsdWUsXG4gIGVycldpdGhDYXVzZTogYXNFcnJWYWx1ZVxufVxuZnVuY3Rpb24gbGV2ZWxUb1ZhbHVlIChsZXZlbCwgbG9nZ2VyKSB7XG4gIHJldHVybiBsZXZlbCA9PT0gJ3NpbGVudCdcbiAgICA/IEluZmluaXR5XG4gICAgOiBsb2dnZXIubGV2ZWxzLnZhbHVlc1tsZXZlbF1cbn1cbmNvbnN0IGJhc2VMb2dGdW5jdGlvblN5bWJvbCA9IFN5bWJvbCgncGluby5sb2dGdW5jcycpXG5jb25zdCBoaWVyYXJjaHlTeW1ib2wgPSBTeW1ib2woJ3Bpbm8uaGllcmFyY2h5JylcblxuY29uc3QgbG9nRmFsbGJhY2tNYXAgPSB7XG4gIGVycm9yOiAnbG9nJyxcbiAgZmF0YWw6ICdlcnJvcicsXG4gIHdhcm46ICdlcnJvcicsXG4gIGluZm86ICdsb2cnLFxuICBkZWJ1ZzogJ2xvZycsXG4gIHRyYWNlOiAnbG9nJ1xufVxuXG5mdW5jdGlvbiBhcHBlbmRDaGlsZExvZ2dlciAocGFyZW50TG9nZ2VyLCBjaGlsZExvZ2dlcikge1xuICBjb25zdCBuZXdFbnRyeSA9IHtcbiAgICBsb2dnZXI6IGNoaWxkTG9nZ2VyLFxuICAgIHBhcmVudDogcGFyZW50TG9nZ2VyW2hpZXJhcmNoeVN5bWJvbF1cbiAgfVxuICBjaGlsZExvZ2dlcltoaWVyYXJjaHlTeW1ib2xdID0gbmV3RW50cnlcbn1cblxuZnVuY3Rpb24gc2V0dXBCYXNlTG9nRnVuY3Rpb25zIChsb2dnZXIsIGxldmVscywgcHJvdG8pIHtcbiAgY29uc3QgbG9nRnVuY3Rpb25zID0ge31cbiAgbGV2ZWxzLmZvckVhY2gobGV2ZWwgPT4ge1xuICAgIGxvZ0Z1bmN0aW9uc1tsZXZlbF0gPSBwcm90b1tsZXZlbF0gPyBwcm90b1tsZXZlbF0gOiAoX2NvbnNvbGVbbGV2ZWxdIHx8IF9jb25zb2xlW2xvZ0ZhbGxiYWNrTWFwW2xldmVsXSB8fCAnbG9nJ10gfHwgbm9vcClcbiAgfSlcbiAgbG9nZ2VyW2Jhc2VMb2dGdW5jdGlvblN5bWJvbF0gPSBsb2dGdW5jdGlvbnNcbn1cblxuZnVuY3Rpb24gc2hvdWxkU2VyaWFsaXplIChzZXJpYWxpemUsIHNlcmlhbGl6ZXJzKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHNlcmlhbGl6ZSkpIHtcbiAgICBjb25zdCBoYXNUb0ZpbHRlciA9IHNlcmlhbGl6ZS5maWx0ZXIoZnVuY3Rpb24gKGspIHtcbiAgICAgIHJldHVybiBrICE9PSAnIXN0ZFNlcmlhbGl6ZXJzLmVycidcbiAgICB9KVxuICAgIHJldHVybiBoYXNUb0ZpbHRlclxuICB9IGVsc2UgaWYgKHNlcmlhbGl6ZSA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhzZXJpYWxpemVycylcbiAgfVxuXG4gIHJldHVybiBmYWxzZVxufVxuXG5mdW5jdGlvbiBwaW5vIChvcHRzKSB7XG4gIG9wdHMgPSBvcHRzIHx8IHt9XG4gIG9wdHMuYnJvd3NlciA9IG9wdHMuYnJvd3NlciB8fCB7fVxuXG4gIGNvbnN0IHRyYW5zbWl0ID0gb3B0cy5icm93c2VyLnRyYW5zbWl0XG4gIGlmICh0cmFuc21pdCAmJiB0eXBlb2YgdHJhbnNtaXQuc2VuZCAhPT0gJ2Z1bmN0aW9uJykgeyB0aHJvdyBFcnJvcigncGlubzogdHJhbnNtaXQgb3B0aW9uIG11c3QgaGF2ZSBhIHNlbmQgZnVuY3Rpb24nKSB9XG5cbiAgY29uc3QgcHJvdG8gPSBvcHRzLmJyb3dzZXIud3JpdGUgfHwgX2NvbnNvbGVcbiAgaWYgKG9wdHMuYnJvd3Nlci53cml0ZSkgb3B0cy5icm93c2VyLmFzT2JqZWN0ID0gdHJ1ZVxuICBjb25zdCBzZXJpYWxpemVycyA9IG9wdHMuc2VyaWFsaXplcnMgfHwge31cbiAgY29uc3Qgc2VyaWFsaXplID0gc2hvdWxkU2VyaWFsaXplKG9wdHMuYnJvd3Nlci5zZXJpYWxpemUsIHNlcmlhbGl6ZXJzKVxuICBsZXQgc3RkRXJyU2VyaWFsaXplID0gb3B0cy5icm93c2VyLnNlcmlhbGl6ZVxuXG4gIGlmIChcbiAgICBBcnJheS5pc0FycmF5KG9wdHMuYnJvd3Nlci5zZXJpYWxpemUpICYmXG4gICAgb3B0cy5icm93c2VyLnNlcmlhbGl6ZS5pbmRleE9mKCchc3RkU2VyaWFsaXplcnMuZXJyJykgPiAtMVxuICApIHN0ZEVyclNlcmlhbGl6ZSA9IGZhbHNlXG5cbiAgY29uc3QgY3VzdG9tTGV2ZWxzID0gT2JqZWN0LmtleXMob3B0cy5jdXN0b21MZXZlbHMgfHwge30pXG4gIGNvbnN0IGxldmVscyA9IFsnZXJyb3InLCAnZmF0YWwnLCAnd2FybicsICdpbmZvJywgJ2RlYnVnJywgJ3RyYWNlJ10uY29uY2F0KGN1c3RvbUxldmVscylcblxuICBpZiAodHlwZW9mIHByb3RvID09PSAnZnVuY3Rpb24nKSB7XG4gICAgbGV2ZWxzLmZvckVhY2goZnVuY3Rpb24gKGxldmVsKSB7XG4gICAgICBwcm90b1tsZXZlbF0gPSBwcm90b1xuICAgIH0pXG4gIH1cbiAgaWYgKG9wdHMuZW5hYmxlZCA9PT0gZmFsc2UgfHwgb3B0cy5icm93c2VyLmRpc2FibGVkKSBvcHRzLmxldmVsID0gJ3NpbGVudCdcbiAgY29uc3QgbGV2ZWwgPSBvcHRzLmxldmVsIHx8ICdpbmZvJ1xuICBjb25zdCBsb2dnZXIgPSBPYmplY3QuY3JlYXRlKHByb3RvKVxuICBpZiAoIWxvZ2dlci5sb2cpIGxvZ2dlci5sb2cgPSBub29wXG5cbiAgc2V0dXBCYXNlTG9nRnVuY3Rpb25zKGxvZ2dlciwgbGV2ZWxzLCBwcm90bylcbiAgLy8gc2V0dXAgcm9vdCBoaWVyYXJjaHkgZW50cnlcbiAgYXBwZW5kQ2hpbGRMb2dnZXIoe30sIGxvZ2dlcilcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkobG9nZ2VyLCAnbGV2ZWxWYWwnLCB7XG4gICAgZ2V0OiBnZXRMZXZlbFZhbFxuICB9KVxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkobG9nZ2VyLCAnbGV2ZWwnLCB7XG4gICAgZ2V0OiBnZXRMZXZlbCxcbiAgICBzZXQ6IHNldExldmVsXG4gIH0pXG5cbiAgY29uc3Qgc2V0T3B0cyA9IHtcbiAgICB0cmFuc21pdCxcbiAgICBzZXJpYWxpemUsXG4gICAgYXNPYmplY3Q6IG9wdHMuYnJvd3Nlci5hc09iamVjdCxcbiAgICBhc09iamVjdEJpbmRpbmdzT25seTogb3B0cy5icm93c2VyLmFzT2JqZWN0QmluZGluZ3NPbmx5LFxuICAgIGZvcm1hdHRlcnM6IG9wdHMuYnJvd3Nlci5mb3JtYXR0ZXJzLFxuICAgIHJlcG9ydENhbGxlcjogb3B0cy5icm93c2VyLnJlcG9ydENhbGxlcixcbiAgICBsZXZlbHMsXG4gICAgdGltZXN0YW1wOiBnZXRUaW1lRnVuY3Rpb24ob3B0cyksXG4gICAgbWVzc2FnZUtleTogb3B0cy5tZXNzYWdlS2V5IHx8ICdtc2cnLFxuICAgIG9uQ2hpbGQ6IG9wdHMub25DaGlsZCB8fCBub29wXG4gIH1cbiAgbG9nZ2VyLmxldmVscyA9IGdldExldmVscyhvcHRzKVxuICBsb2dnZXIubGV2ZWwgPSBsZXZlbFxuXG4gIGxvZ2dlci5pc0xldmVsRW5hYmxlZCA9IGZ1bmN0aW9uIChsZXZlbCkge1xuICAgIGlmICghdGhpcy5sZXZlbHMudmFsdWVzW2xldmVsXSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubGV2ZWxzLnZhbHVlc1tsZXZlbF0gPj0gdGhpcy5sZXZlbHMudmFsdWVzW3RoaXMubGV2ZWxdXG4gIH1cbiAgbG9nZ2VyLnNldE1heExpc3RlbmVycyA9IGxvZ2dlci5nZXRNYXhMaXN0ZW5lcnMgPVxuICBsb2dnZXIuZW1pdCA9IGxvZ2dlci5hZGRMaXN0ZW5lciA9IGxvZ2dlci5vbiA9XG4gIGxvZ2dlci5wcmVwZW5kTGlzdGVuZXIgPSBsb2dnZXIub25jZSA9XG4gIGxvZ2dlci5wcmVwZW5kT25jZUxpc3RlbmVyID0gbG9nZ2VyLnJlbW92ZUxpc3RlbmVyID1cbiAgbG9nZ2VyLnJlbW92ZUFsbExpc3RlbmVycyA9IGxvZ2dlci5saXN0ZW5lcnMgPVxuICBsb2dnZXIubGlzdGVuZXJDb3VudCA9IGxvZ2dlci5ldmVudE5hbWVzID1cbiAgbG9nZ2VyLndyaXRlID0gbG9nZ2VyLmZsdXNoID0gbm9vcFxuICBsb2dnZXIuc2VyaWFsaXplcnMgPSBzZXJpYWxpemVyc1xuICBsb2dnZXIuX3NlcmlhbGl6ZSA9IHNlcmlhbGl6ZVxuICBsb2dnZXIuX3N0ZEVyclNlcmlhbGl6ZSA9IHN0ZEVyclNlcmlhbGl6ZVxuICBsb2dnZXIuY2hpbGQgPSBmdW5jdGlvbiAoLi4uYXJncykgeyByZXR1cm4gY2hpbGQuY2FsbCh0aGlzLCBzZXRPcHRzLCAuLi5hcmdzKSB9XG5cbiAgaWYgKHRyYW5zbWl0KSBsb2dnZXIuX2xvZ0V2ZW50ID0gY3JlYXRlTG9nRXZlbnRTaGFwZSgpXG5cbiAgZnVuY3Rpb24gZ2V0TGV2ZWxWYWwgKCkge1xuICAgIHJldHVybiBsZXZlbFRvVmFsdWUodGhpcy5sZXZlbCwgdGhpcylcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExldmVsICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbGV2ZWxcbiAgfVxuICBmdW5jdGlvbiBzZXRMZXZlbCAobGV2ZWwpIHtcbiAgICBpZiAobGV2ZWwgIT09ICdzaWxlbnQnICYmICF0aGlzLmxldmVscy52YWx1ZXNbbGV2ZWxdKSB7XG4gICAgICB0aHJvdyBFcnJvcigndW5rbm93biBsZXZlbCAnICsgbGV2ZWwpXG4gICAgfVxuICAgIHRoaXMuX2xldmVsID0gbGV2ZWxcblxuICAgIHNldCh0aGlzLCBzZXRPcHRzLCBsb2dnZXIsICdlcnJvcicpIC8vIDwtLSBtdXN0IHN0YXkgZmlyc3RcbiAgICBzZXQodGhpcywgc2V0T3B0cywgbG9nZ2VyLCAnZmF0YWwnKVxuICAgIHNldCh0aGlzLCBzZXRPcHRzLCBsb2dnZXIsICd3YXJuJylcbiAgICBzZXQodGhpcywgc2V0T3B0cywgbG9nZ2VyLCAnaW5mbycpXG4gICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgJ2RlYnVnJylcbiAgICBzZXQodGhpcywgc2V0T3B0cywgbG9nZ2VyLCAndHJhY2UnKVxuXG4gICAgY3VzdG9tTGV2ZWxzLmZvckVhY2goKGxldmVsKSA9PiB7XG4gICAgICBzZXQodGhpcywgc2V0T3B0cywgbG9nZ2VyLCBsZXZlbClcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gY2hpbGQgKHNldE9wdHMsIGJpbmRpbmdzLCBjaGlsZE9wdGlvbnMpIHtcbiAgICBpZiAoIWJpbmRpbmdzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ21pc3NpbmcgYmluZGluZ3MgZm9yIGNoaWxkIFBpbm8nKVxuICAgIH1cbiAgICBjaGlsZE9wdGlvbnMgPSBjaGlsZE9wdGlvbnMgfHwge31cbiAgICBpZiAoc2VyaWFsaXplICYmIGJpbmRpbmdzLnNlcmlhbGl6ZXJzKSB7XG4gICAgICBjaGlsZE9wdGlvbnMuc2VyaWFsaXplcnMgPSBiaW5kaW5ncy5zZXJpYWxpemVyc1xuICAgIH1cbiAgICBjb25zdCBjaGlsZE9wdGlvbnNTZXJpYWxpemVycyA9IGNoaWxkT3B0aW9ucy5zZXJpYWxpemVyc1xuICAgIGlmIChzZXJpYWxpemUgJiYgY2hpbGRPcHRpb25zU2VyaWFsaXplcnMpIHtcbiAgICAgIHZhciBjaGlsZFNlcmlhbGl6ZXJzID0gT2JqZWN0LmFzc2lnbih7fSwgc2VyaWFsaXplcnMsIGNoaWxkT3B0aW9uc1NlcmlhbGl6ZXJzKVxuICAgICAgdmFyIGNoaWxkU2VyaWFsaXplID0gb3B0cy5icm93c2VyLnNlcmlhbGl6ZSA9PT0gdHJ1ZVxuICAgICAgICA/IE9iamVjdC5rZXlzKGNoaWxkU2VyaWFsaXplcnMpXG4gICAgICAgIDogc2VyaWFsaXplXG4gICAgICBkZWxldGUgYmluZGluZ3Muc2VyaWFsaXplcnNcbiAgICAgIGFwcGx5U2VyaWFsaXplcnMoW2JpbmRpbmdzXSwgY2hpbGRTZXJpYWxpemUsIGNoaWxkU2VyaWFsaXplcnMsIHRoaXMuX3N0ZEVyclNlcmlhbGl6ZSlcbiAgICB9XG4gICAgZnVuY3Rpb24gQ2hpbGQgKHBhcmVudCkge1xuICAgICAgdGhpcy5fY2hpbGRMZXZlbCA9IChwYXJlbnQuX2NoaWxkTGV2ZWwgfCAwKSArIDFcblxuICAgICAgLy8gbWFrZSBzdXJlIGJpbmRpbmdzIGFyZSBhdmFpbGFibGUgaW4gdGhlIGBzZXRgIGZ1bmN0aW9uXG4gICAgICB0aGlzLmJpbmRpbmdzID0gYmluZGluZ3NcblxuICAgICAgaWYgKGNoaWxkU2VyaWFsaXplcnMpIHtcbiAgICAgICAgdGhpcy5zZXJpYWxpemVycyA9IGNoaWxkU2VyaWFsaXplcnNcbiAgICAgICAgdGhpcy5fc2VyaWFsaXplID0gY2hpbGRTZXJpYWxpemVcbiAgICAgIH1cbiAgICAgIGlmICh0cmFuc21pdCkge1xuICAgICAgICB0aGlzLl9sb2dFdmVudCA9IGNyZWF0ZUxvZ0V2ZW50U2hhcGUoXG4gICAgICAgICAgW10uY29uY2F0KHBhcmVudC5fbG9nRXZlbnQuYmluZGluZ3MsIGJpbmRpbmdzKVxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICAgIENoaWxkLnByb3RvdHlwZSA9IHRoaXNcbiAgICBjb25zdCBuZXdMb2dnZXIgPSBuZXcgQ2hpbGQodGhpcylcblxuICAgIC8vIG11c3QgaGFwcGVuIGJlZm9yZSB0aGUgbGV2ZWwgaXMgYXNzaWduZWRcbiAgICBhcHBlbmRDaGlsZExvZ2dlcih0aGlzLCBuZXdMb2dnZXIpXG4gICAgbmV3TG9nZ2VyLmNoaWxkID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHsgcmV0dXJuIGNoaWxkLmNhbGwodGhpcywgc2V0T3B0cywgLi4uYXJncykgfVxuICAgIC8vIHJlcXVpcmVkIHRvIGFjdHVhbGx5IGluaXRpYWxpemUgdGhlIGxvZ2dlciBmdW5jdGlvbnMgZm9yIGFueSBnaXZlbiBjaGlsZFxuICAgIG5ld0xvZ2dlci5sZXZlbCA9IGNoaWxkT3B0aW9ucy5sZXZlbCB8fCB0aGlzLmxldmVsIC8vIGFsbG93IGxldmVsIHRvIGJlIHNldCBieSBjaGlsZE9wdGlvbnNcbiAgICBzZXRPcHRzLm9uQ2hpbGQobmV3TG9nZ2VyKVxuXG4gICAgcmV0dXJuIG5ld0xvZ2dlclxuICB9XG4gIHJldHVybiBsb2dnZXJcbn1cblxuZnVuY3Rpb24gZ2V0TGV2ZWxzIChvcHRzKSB7XG4gIGNvbnN0IGN1c3RvbUxldmVscyA9IG9wdHMuY3VzdG9tTGV2ZWxzIHx8IHt9XG5cbiAgY29uc3QgdmFsdWVzID0gT2JqZWN0LmFzc2lnbih7fSwgcGluby5sZXZlbHMudmFsdWVzLCBjdXN0b21MZXZlbHMpXG4gIGNvbnN0IGxhYmVscyA9IE9iamVjdC5hc3NpZ24oe30sIHBpbm8ubGV2ZWxzLmxhYmVscywgaW52ZXJ0T2JqZWN0KGN1c3RvbUxldmVscykpXG5cbiAgcmV0dXJuIHtcbiAgICB2YWx1ZXMsXG4gICAgbGFiZWxzXG4gIH1cbn1cblxuZnVuY3Rpb24gaW52ZXJ0T2JqZWN0IChvYmopIHtcbiAgY29uc3QgaW52ZXJ0ZWQgPSB7fVxuICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGludmVydGVkW29ialtrZXldXSA9IGtleVxuICB9KVxuICByZXR1cm4gaW52ZXJ0ZWRcbn1cblxucGluby5sZXZlbHMgPSB7XG4gIHZhbHVlczoge1xuICAgIGZhdGFsOiA2MCxcbiAgICBlcnJvcjogNTAsXG4gICAgd2FybjogNDAsXG4gICAgaW5mbzogMzAsXG4gICAgZGVidWc6IDIwLFxuICAgIHRyYWNlOiAxMFxuICB9LFxuICBsYWJlbHM6IHtcbiAgICAxMDogJ3RyYWNlJyxcbiAgICAyMDogJ2RlYnVnJyxcbiAgICAzMDogJ2luZm8nLFxuICAgIDQwOiAnd2FybicsXG4gICAgNTA6ICdlcnJvcicsXG4gICAgNjA6ICdmYXRhbCdcbiAgfVxufVxuXG5waW5vLnN0ZFNlcmlhbGl6ZXJzID0gc3RkU2VyaWFsaXplcnNcbnBpbm8uc3RkVGltZUZ1bmN0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHsgbnVsbFRpbWUsIGVwb2NoVGltZSwgdW5peFRpbWUsIGlzb1RpbWUgfSlcblxuZnVuY3Rpb24gZ2V0QmluZGluZ0NoYWluIChsb2dnZXIpIHtcbiAgY29uc3QgYmluZGluZ3MgPSBbXVxuICBpZiAobG9nZ2VyLmJpbmRpbmdzKSB7XG4gICAgYmluZGluZ3MucHVzaChsb2dnZXIuYmluZGluZ3MpXG4gIH1cblxuICAvLyB0cmF2ZXJzZSB1cCB0aGUgdHJlZSB0byBnZXQgYWxsIGJpbmRpbmdzXG4gIGxldCBoaWVyYXJjaHkgPSBsb2dnZXJbaGllcmFyY2h5U3ltYm9sXVxuICB3aGlsZSAoaGllcmFyY2h5LnBhcmVudCkge1xuICAgIGhpZXJhcmNoeSA9IGhpZXJhcmNoeS5wYXJlbnRcbiAgICBpZiAoaGllcmFyY2h5LmxvZ2dlci5iaW5kaW5ncykge1xuICAgICAgYmluZGluZ3MucHVzaChoaWVyYXJjaHkubG9nZ2VyLmJpbmRpbmdzKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBiaW5kaW5ncy5yZXZlcnNlKClcbn1cblxuZnVuY3Rpb24gc2V0IChzZWxmLCBvcHRzLCByb290TG9nZ2VyLCBsZXZlbCkge1xuICAvLyBvdmVycmlkZSB0aGUgY3VycmVudCBsb2cgZnVuY3Rpb25zIHdpdGggZWl0aGVyIGBub29wYCBvciB0aGUgYmFzZSBsb2cgZnVuY3Rpb25cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlbGYsIGxldmVsLCB7XG4gICAgdmFsdWU6IChsZXZlbFRvVmFsdWUoc2VsZi5sZXZlbCwgcm9vdExvZ2dlcikgPiBsZXZlbFRvVmFsdWUobGV2ZWwsIHJvb3RMb2dnZXIpXG4gICAgICA/IG5vb3BcbiAgICAgIDogcm9vdExvZ2dlcltiYXNlTG9nRnVuY3Rpb25TeW1ib2xdW2xldmVsXSksXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSlcblxuICBpZiAoc2VsZltsZXZlbF0gPT09IG5vb3ApIHtcbiAgICBpZiAoIW9wdHMudHJhbnNtaXQpIHJldHVyblxuXG4gICAgY29uc3QgdHJhbnNtaXRMZXZlbCA9IG9wdHMudHJhbnNtaXQubGV2ZWwgfHwgc2VsZi5sZXZlbFxuICAgIGNvbnN0IHRyYW5zbWl0VmFsdWUgPSBsZXZlbFRvVmFsdWUodHJhbnNtaXRMZXZlbCwgcm9vdExvZ2dlcilcbiAgICBjb25zdCBtZXRob2RWYWx1ZSA9IGxldmVsVG9WYWx1ZShsZXZlbCwgcm9vdExvZ2dlcilcbiAgICBpZiAobWV0aG9kVmFsdWUgPCB0cmFuc21pdFZhbHVlKSByZXR1cm5cbiAgfVxuXG4gIC8vIG1ha2Ugc3VyZSB0aGUgbG9nIGZvcm1hdCBpcyBjb3JyZWN0XG4gIHNlbGZbbGV2ZWxdID0gY3JlYXRlV3JhcChzZWxmLCBvcHRzLCByb290TG9nZ2VyLCBsZXZlbClcblxuICAvLyBwcmVwZW5kIGJpbmRpbmdzIGlmIGl0IGlzIG5vdCB0aGUgcm9vdCBsb2dnZXJcbiAgY29uc3QgYmluZGluZ3MgPSBnZXRCaW5kaW5nQ2hhaW4oc2VsZilcbiAgaWYgKGJpbmRpbmdzLmxlbmd0aCA9PT0gMCkge1xuICAgIC8vIGVhcmx5IGV4aXQgaW4gY2FzZSBmb3Igcm9vdExvZ2dlclxuICAgIHJldHVyblxuICB9XG4gIHNlbGZbbGV2ZWxdID0gcHJlcGVuZEJpbmRpbmdzSW5Bcmd1bWVudHMoYmluZGluZ3MsIHNlbGZbbGV2ZWxdKVxufVxuXG5mdW5jdGlvbiBwcmVwZW5kQmluZGluZ3NJbkFyZ3VtZW50cyAoYmluZGluZ3MsIGxvZ0Z1bmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbG9nRnVuYy5hcHBseSh0aGlzLCBbLi4uYmluZGluZ3MsIC4uLmFyZ3VtZW50c10pXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlV3JhcCAoc2VsZiwgb3B0cywgcm9vdExvZ2dlciwgbGV2ZWwpIHtcbiAgcmV0dXJuIChmdW5jdGlvbiAod3JpdGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gTE9HICgpIHtcbiAgICAgIGNvbnN0IHRzID0gb3B0cy50aW1lc3RhbXAoKVxuICAgICAgY29uc3QgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKVxuICAgICAgY29uc3QgcHJvdG8gPSAoT2JqZWN0LmdldFByb3RvdHlwZU9mICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSA9PT0gX2NvbnNvbGUpID8gX2NvbnNvbGUgOiB0aGlzXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV1cblxuICAgICAgdmFyIGFyZ3NJc1NlcmlhbGl6ZWQgPSBmYWxzZVxuICAgICAgaWYgKG9wdHMuc2VyaWFsaXplKSB7XG4gICAgICAgIGFwcGx5U2VyaWFsaXplcnMoYXJncywgdGhpcy5fc2VyaWFsaXplLCB0aGlzLnNlcmlhbGl6ZXJzLCB0aGlzLl9zdGRFcnJTZXJpYWxpemUpXG4gICAgICAgIGFyZ3NJc1NlcmlhbGl6ZWQgPSB0cnVlXG4gICAgICB9XG4gICAgICBpZiAob3B0cy5hc09iamVjdCB8fCBvcHRzLmZvcm1hdHRlcnMpIHtcbiAgICAgICAgY29uc3Qgb3V0ID0gYXNPYmplY3QodGhpcywgbGV2ZWwsIGFyZ3MsIHRzLCBvcHRzKVxuICAgICAgICBpZiAob3B0cy5yZXBvcnRDYWxsZXIgJiYgb3V0ICYmIG91dC5sZW5ndGggPiAwICYmIG91dFswXSAmJiB0eXBlb2Ygb3V0WzBdID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjYWxsZXIgPSBnZXRDYWxsZXJMb2NhdGlvbigpXG4gICAgICAgICAgICBpZiAoY2FsbGVyKSBvdXRbMF0uY2FsbGVyID0gY2FsbGVyXG4gICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgfVxuICAgICAgICB3cml0ZS5jYWxsKHByb3RvLCAuLi5vdXQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAob3B0cy5yZXBvcnRDYWxsZXIpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY2FsbGVyID0gZ2V0Q2FsbGVyTG9jYXRpb24oKVxuICAgICAgICAgICAgaWYgKGNhbGxlcikgYXJncy5wdXNoKGNhbGxlcilcbiAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICB9XG4gICAgICAgIHdyaXRlLmFwcGx5KHByb3RvLCBhcmdzKVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0cy50cmFuc21pdCkge1xuICAgICAgICBjb25zdCB0cmFuc21pdExldmVsID0gb3B0cy50cmFuc21pdC5sZXZlbCB8fCBzZWxmLl9sZXZlbFxuICAgICAgICBjb25zdCB0cmFuc21pdFZhbHVlID0gbGV2ZWxUb1ZhbHVlKHRyYW5zbWl0TGV2ZWwsIHJvb3RMb2dnZXIpXG4gICAgICAgIGNvbnN0IG1ldGhvZFZhbHVlID0gbGV2ZWxUb1ZhbHVlKGxldmVsLCByb290TG9nZ2VyKVxuICAgICAgICBpZiAobWV0aG9kVmFsdWUgPCB0cmFuc21pdFZhbHVlKSByZXR1cm5cbiAgICAgICAgdHJhbnNtaXQodGhpcywge1xuICAgICAgICAgIHRzLFxuICAgICAgICAgIG1ldGhvZExldmVsOiBsZXZlbCxcbiAgICAgICAgICBtZXRob2RWYWx1ZSxcbiAgICAgICAgICB0cmFuc21pdExldmVsLFxuICAgICAgICAgIHRyYW5zbWl0VmFsdWU6IHJvb3RMb2dnZXIubGV2ZWxzLnZhbHVlc1tvcHRzLnRyYW5zbWl0LmxldmVsIHx8IHNlbGYuX2xldmVsXSxcbiAgICAgICAgICBzZW5kOiBvcHRzLnRyYW5zbWl0LnNlbmQsXG4gICAgICAgICAgdmFsOiBsZXZlbFRvVmFsdWUoc2VsZi5fbGV2ZWwsIHJvb3RMb2dnZXIpXG4gICAgICAgIH0sIGFyZ3MsIGFyZ3NJc1NlcmlhbGl6ZWQpXG4gICAgICB9XG4gICAgfVxuICB9KShzZWxmW2Jhc2VMb2dGdW5jdGlvblN5bWJvbF1bbGV2ZWxdKVxufVxuXG5mdW5jdGlvbiBhc09iamVjdCAobG9nZ2VyLCBsZXZlbCwgYXJncywgdHMsIG9wdHMpIHtcbiAgY29uc3Qge1xuICAgIGxldmVsOiBsZXZlbEZvcm1hdHRlcixcbiAgICBsb2c6IGxvZ09iamVjdEZvcm1hdHRlciA9IChvYmopID0+IG9ialxuICB9ID0gb3B0cy5mb3JtYXR0ZXJzIHx8IHt9XG4gIGNvbnN0IGFyZ3NDbG9uZWQgPSBhcmdzLnNsaWNlKClcbiAgbGV0IG1zZyA9IGFyZ3NDbG9uZWRbMF1cbiAgY29uc3QgbG9nT2JqZWN0ID0ge31cblxuICBsZXQgbHZsID0gKGxvZ2dlci5fY2hpbGRMZXZlbCB8IDApICsgMVxuICBpZiAobHZsIDwgMSkgbHZsID0gMVxuXG4gIGlmICh0cykge1xuICAgIGxvZ09iamVjdC50aW1lID0gdHNcbiAgfVxuXG4gIGlmIChsZXZlbEZvcm1hdHRlcikge1xuICAgIGNvbnN0IGZvcm1hdHRlZExldmVsID0gbGV2ZWxGb3JtYXR0ZXIobGV2ZWwsIGxvZ2dlci5sZXZlbHMudmFsdWVzW2xldmVsXSlcbiAgICBPYmplY3QuYXNzaWduKGxvZ09iamVjdCwgZm9ybWF0dGVkTGV2ZWwpXG4gIH0gZWxzZSB7XG4gICAgbG9nT2JqZWN0LmxldmVsID0gbG9nZ2VyLmxldmVscy52YWx1ZXNbbGV2ZWxdXG4gIH1cblxuICBpZiAob3B0cy5hc09iamVjdEJpbmRpbmdzT25seSkge1xuICAgIGlmIChtc2cgIT09IG51bGwgJiYgdHlwZW9mIG1zZyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHdoaWxlIChsdmwtLSAmJiB0eXBlb2YgYXJnc0Nsb25lZFswXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihsb2dPYmplY3QsIGFyZ3NDbG9uZWQuc2hpZnQoKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBmb3JtYXR0ZWRMb2dPYmplY3QgPSBsb2dPYmplY3RGb3JtYXR0ZXIobG9nT2JqZWN0KVxuICAgIHJldHVybiBbZm9ybWF0dGVkTG9nT2JqZWN0LCAuLi5hcmdzQ2xvbmVkXVxuICB9IGVsc2Uge1xuICAgIC8vIGRlbGliZXJhdGUsIGNhdGNoaW5nIG9iamVjdHMsIGFycmF5c1xuICAgIGlmIChtc2cgIT09IG51bGwgJiYgdHlwZW9mIG1zZyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHdoaWxlIChsdmwtLSAmJiB0eXBlb2YgYXJnc0Nsb25lZFswXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihsb2dPYmplY3QsIGFyZ3NDbG9uZWQuc2hpZnQoKSlcbiAgICAgIH1cbiAgICAgIG1zZyA9IGFyZ3NDbG9uZWQubGVuZ3RoID8gZm9ybWF0KGFyZ3NDbG9uZWQuc2hpZnQoKSwgYXJnc0Nsb25lZCkgOiB1bmRlZmluZWRcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtc2cgPT09ICdzdHJpbmcnKSBtc2cgPSBmb3JtYXQoYXJnc0Nsb25lZC5zaGlmdCgpLCBhcmdzQ2xvbmVkKVxuICAgIGlmIChtc2cgIT09IHVuZGVmaW5lZCkgbG9nT2JqZWN0W29wdHMubWVzc2FnZUtleV0gPSBtc2dcblxuICAgIGNvbnN0IGZvcm1hdHRlZExvZ09iamVjdCA9IGxvZ09iamVjdEZvcm1hdHRlcihsb2dPYmplY3QpXG4gICAgcmV0dXJuIFtmb3JtYXR0ZWRMb2dPYmplY3RdXG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlTZXJpYWxpemVycyAoYXJncywgc2VyaWFsaXplLCBzZXJpYWxpemVycywgc3RkRXJyU2VyaWFsaXplKSB7XG4gIGZvciAoY29uc3QgaSBpbiBhcmdzKSB7XG4gICAgaWYgKHN0ZEVyclNlcmlhbGl6ZSAmJiBhcmdzW2ldIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIGFyZ3NbaV0gPSBwaW5vLnN0ZFNlcmlhbGl6ZXJzLmVycihhcmdzW2ldKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZ3NbaV0gPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KGFyZ3NbaV0pICYmIHNlcmlhbGl6ZSkge1xuICAgICAgZm9yIChjb25zdCBrIGluIGFyZ3NbaV0pIHtcbiAgICAgICAgaWYgKHNlcmlhbGl6ZS5pbmRleE9mKGspID4gLTEgJiYgayBpbiBzZXJpYWxpemVycykge1xuICAgICAgICAgIGFyZ3NbaV1ba10gPSBzZXJpYWxpemVyc1trXShhcmdzW2ldW2tdKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHRyYW5zbWl0IChsb2dnZXIsIG9wdHMsIGFyZ3MsIGFyZ3NJc1NlcmlhbGl6ZWQgPSBmYWxzZSkge1xuICBjb25zdCBzZW5kID0gb3B0cy5zZW5kXG4gIGNvbnN0IHRzID0gb3B0cy50c1xuICBjb25zdCBtZXRob2RMZXZlbCA9IG9wdHMubWV0aG9kTGV2ZWxcbiAgY29uc3QgbWV0aG9kVmFsdWUgPSBvcHRzLm1ldGhvZFZhbHVlXG4gIGNvbnN0IHZhbCA9IG9wdHMudmFsXG4gIGNvbnN0IGJpbmRpbmdzID0gbG9nZ2VyLl9sb2dFdmVudC5iaW5kaW5nc1xuXG4gIGlmICghYXJnc0lzU2VyaWFsaXplZCkge1xuICAgIGFwcGx5U2VyaWFsaXplcnMoXG4gICAgICBhcmdzLFxuICAgICAgbG9nZ2VyLl9zZXJpYWxpemUgfHwgT2JqZWN0LmtleXMobG9nZ2VyLnNlcmlhbGl6ZXJzKSxcbiAgICAgIGxvZ2dlci5zZXJpYWxpemVycyxcbiAgICAgIGxvZ2dlci5fc3RkRXJyU2VyaWFsaXplID09PSB1bmRlZmluZWQgPyB0cnVlIDogbG9nZ2VyLl9zdGRFcnJTZXJpYWxpemVcbiAgICApXG4gIH1cblxuICBsb2dnZXIuX2xvZ0V2ZW50LnRzID0gdHNcbiAgbG9nZ2VyLl9sb2dFdmVudC5tZXNzYWdlcyA9IGFyZ3MuZmlsdGVyKGZ1bmN0aW9uIChhcmcpIHtcbiAgICAvLyBiaW5kaW5ncyBjYW4gb25seSBiZSBvYmplY3RzLCBzbyByZWZlcmVuY2UgZXF1YWxpdHkgY2hlY2sgdmlhIGluZGV4T2YgaXMgZmluZVxuICAgIHJldHVybiBiaW5kaW5ncy5pbmRleE9mKGFyZykgPT09IC0xXG4gIH0pXG5cbiAgbG9nZ2VyLl9sb2dFdmVudC5sZXZlbC5sYWJlbCA9IG1ldGhvZExldmVsXG4gIGxvZ2dlci5fbG9nRXZlbnQubGV2ZWwudmFsdWUgPSBtZXRob2RWYWx1ZVxuXG4gIHNlbmQobWV0aG9kTGV2ZWwsIGxvZ2dlci5fbG9nRXZlbnQsIHZhbClcblxuICBsb2dnZXIuX2xvZ0V2ZW50ID0gY3JlYXRlTG9nRXZlbnRTaGFwZShiaW5kaW5ncylcbn1cblxuZnVuY3Rpb24gY3JlYXRlTG9nRXZlbnRTaGFwZSAoYmluZGluZ3MpIHtcbiAgcmV0dXJuIHtcbiAgICB0czogMCxcbiAgICBtZXNzYWdlczogW10sXG4gICAgYmluZGluZ3M6IGJpbmRpbmdzIHx8IFtdLFxuICAgIGxldmVsOiB7IGxhYmVsOiAnJywgdmFsdWU6IDAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFzRXJyVmFsdWUgKGVycikge1xuICBjb25zdCBvYmogPSB7XG4gICAgdHlwZTogZXJyLmNvbnN0cnVjdG9yLm5hbWUsXG4gICAgbXNnOiBlcnIubWVzc2FnZSxcbiAgICBzdGFjazogZXJyLnN0YWNrXG4gIH1cbiAgZm9yIChjb25zdCBrZXkgaW4gZXJyKSB7XG4gICAgaWYgKG9ialtrZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG9ialtrZXldID0gZXJyW2tleV1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9ialxufVxuXG5mdW5jdGlvbiBnZXRUaW1lRnVuY3Rpb24gKG9wdHMpIHtcbiAgaWYgKHR5cGVvZiBvcHRzLnRpbWVzdGFtcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBvcHRzLnRpbWVzdGFtcFxuICB9XG4gIGlmIChvcHRzLnRpbWVzdGFtcCA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gbnVsbFRpbWVcbiAgfVxuICByZXR1cm4gZXBvY2hUaW1lXG59XG5cbmZ1bmN0aW9uIG1vY2sgKCkgeyByZXR1cm4ge30gfVxuZnVuY3Rpb24gcGFzc3Rocm91Z2ggKGEpIHsgcmV0dXJuIGEgfVxuZnVuY3Rpb24gbm9vcCAoKSB7fVxuXG5mdW5jdGlvbiBudWxsVGltZSAoKSB7IHJldHVybiBmYWxzZSB9XG5mdW5jdGlvbiBlcG9jaFRpbWUgKCkgeyByZXR1cm4gRGF0ZS5ub3coKSB9XG5mdW5jdGlvbiB1bml4VGltZSAoKSB7IHJldHVybiBNYXRoLnJvdW5kKERhdGUubm93KCkgLyAxMDAwLjApIH1cbmZ1bmN0aW9uIGlzb1RpbWUgKCkgeyByZXR1cm4gbmV3IERhdGUoRGF0ZS5ub3coKSkudG9JU09TdHJpbmcoKSB9IC8vIHVzaW5nIERhdGUubm93KCkgZm9yIHRlc3RhYmlsaXR5XG5cbi8qIGVzbGludC1kaXNhYmxlICovXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZnVuY3Rpb24gcGZHbG9iYWxUaGlzT3JGYWxsYmFjayAoKSB7XG4gIGZ1bmN0aW9uIGRlZmQgKG8pIHsgcmV0dXJuIHR5cGVvZiBvICE9PSAndW5kZWZpbmVkJyAmJiBvIH1cbiAgdHJ5IHtcbiAgICBpZiAodHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnKSByZXR1cm4gZ2xvYmFsVGhpc1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3QucHJvdG90eXBlLCAnZ2xvYmFsVGhpcycsIHtcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICBkZWxldGUgT2JqZWN0LnByb3RvdHlwZS5nbG9iYWxUaGlzXG4gICAgICAgIHJldHVybiAodGhpcy5nbG9iYWxUaGlzID0gdGhpcylcbiAgICAgIH0sXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuICAgIHJldHVybiBnbG9iYWxUaGlzXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZGVmZChzZWxmKSB8fCBkZWZkKHdpbmRvdykgfHwgZGVmZCh0aGlzKSB8fCB7fVxuICB9XG59XG4vKiBlc2xpbnQtZW5hYmxlICovXG5cbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBwaW5vXG5tb2R1bGUuZXhwb3J0cy5waW5vID0gcGlub1xuXG4vLyBBdHRlbXB0IHRvIGV4dHJhY3QgdGhlIHVzZXIgY2FsbHNpdGUgKGZpbGU6bGluZTpjb2x1bW4pXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZnVuY3Rpb24gZ2V0Q2FsbGVyTG9jYXRpb24gKCkge1xuICBjb25zdCBzdGFjayA9IChuZXcgRXJyb3IoKSkuc3RhY2tcbiAgaWYgKCFzdGFjaykgcmV0dXJuIG51bGxcbiAgY29uc3QgbGluZXMgPSBzdGFjay5zcGxpdCgnXFxuJylcbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGwgPSBsaW5lc1tpXS50cmltKClcbiAgICAvLyBza2lwIGZyYW1lcyBmcm9tIHRoaXMgZmlsZSBhbmQgaW50ZXJuYWxzXG4gICAgaWYgKC8oXmF0XFxzKyk/KGNyZWF0ZVdyYXB8TE9HfHNldFxccypcXCh8YXNPYmplY3R8T2JqZWN0XFwuYXBwbHl8RnVuY3Rpb25cXC5hcHBseSkvLnRlc3QobCkpIGNvbnRpbnVlXG4gICAgaWYgKGwuaW5kZXhPZignYnJvd3Nlci5qcycpICE9PSAtMSkgY29udGludWVcbiAgICBpZiAobC5pbmRleE9mKCdub2RlOmludGVybmFsJykgIT09IC0xKSBjb250aW51ZVxuICAgIGlmIChsLmluZGV4T2YoJ25vZGVfbW9kdWxlcycpICE9PSAtMSkgY29udGludWVcbiAgICAvLyB0cnkgZm9ybWF0cyBsaWtlOiBhdCBmdW5jIChmaWxlOmxpbmU6Y29sKSBvciBhdCBmaWxlOmxpbmU6Y29sXG4gICAgbGV0IG0gPSBsLm1hdGNoKC9cXCgoLio/KTooXFxkKyk6KFxcZCspXFwpLylcbiAgICBpZiAoIW0pIG0gPSBsLm1hdGNoKC9hdFxccysoLio/KTooXFxkKyk6KFxcZCspLylcbiAgICBpZiAobSkge1xuICAgICAgY29uc3QgZmlsZSA9IG1bMV1cbiAgICAgIGNvbnN0IGxpbmUgPSBtWzJdXG4gICAgICBjb25zdCBjb2wgPSBtWzNdXG4gICAgICByZXR1cm4gZmlsZSArICc6JyArIGxpbmUgKyAnOicgKyBjb2xcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cbiIsICJtb2R1bGUuZXhwb3J0cyA9IHt9OyIsICIndXNlIHN0cmljdCc7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmJlY2gzMm0gPSBleHBvcnRzLmJlY2gzMiA9IHZvaWQgMDtcbmNvbnN0IEFMUEhBQkVUID0gJ3FwenJ5OXg4Z2YydHZkdzBzM2puNTRraGNlNm11YTdsJztcbmNvbnN0IEFMUEhBQkVUX01BUCA9IHt9O1xuZm9yIChsZXQgeiA9IDA7IHogPCBBTFBIQUJFVC5sZW5ndGg7IHorKykge1xuICAgIGNvbnN0IHggPSBBTFBIQUJFVC5jaGFyQXQoeik7XG4gICAgQUxQSEFCRVRfTUFQW3hdID0gejtcbn1cbmZ1bmN0aW9uIHBvbHltb2RTdGVwKHByZSkge1xuICAgIGNvbnN0IGIgPSBwcmUgPj4gMjU7XG4gICAgcmV0dXJuICgoKHByZSAmIDB4MWZmZmZmZikgPDwgNSkgXlxuICAgICAgICAoLSgoYiA+PiAwKSAmIDEpICYgMHgzYjZhNTdiMikgXlxuICAgICAgICAoLSgoYiA+PiAxKSAmIDEpICYgMHgyNjUwOGU2ZCkgXlxuICAgICAgICAoLSgoYiA+PiAyKSAmIDEpICYgMHgxZWExMTlmYSkgXlxuICAgICAgICAoLSgoYiA+PiAzKSAmIDEpICYgMHgzZDQyMzNkZCkgXlxuICAgICAgICAoLSgoYiA+PiA0KSAmIDEpICYgMHgyYTE0NjJiMykpO1xufVxuZnVuY3Rpb24gcHJlZml4Q2hrKHByZWZpeCkge1xuICAgIGxldCBjaGsgPSAxO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJlZml4Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGMgPSBwcmVmaXguY2hhckNvZGVBdChpKTtcbiAgICAgICAgaWYgKGMgPCAzMyB8fCBjID4gMTI2KVxuICAgICAgICAgICAgcmV0dXJuICdJbnZhbGlkIHByZWZpeCAoJyArIHByZWZpeCArICcpJztcbiAgICAgICAgY2hrID0gcG9seW1vZFN0ZXAoY2hrKSBeIChjID4+IDUpO1xuICAgIH1cbiAgICBjaGsgPSBwb2x5bW9kU3RlcChjaGspO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJlZml4Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IHYgPSBwcmVmaXguY2hhckNvZGVBdChpKTtcbiAgICAgICAgY2hrID0gcG9seW1vZFN0ZXAoY2hrKSBeICh2ICYgMHgxZik7XG4gICAgfVxuICAgIHJldHVybiBjaGs7XG59XG5mdW5jdGlvbiBjb252ZXJ0KGRhdGEsIGluQml0cywgb3V0Qml0cywgcGFkKSB7XG4gICAgbGV0IHZhbHVlID0gMDtcbiAgICBsZXQgYml0cyA9IDA7XG4gICAgY29uc3QgbWF4ViA9ICgxIDw8IG91dEJpdHMpIC0gMTtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFsdWUgPSAodmFsdWUgPDwgaW5CaXRzKSB8IGRhdGFbaV07XG4gICAgICAgIGJpdHMgKz0gaW5CaXRzO1xuICAgICAgICB3aGlsZSAoYml0cyA+PSBvdXRCaXRzKSB7XG4gICAgICAgICAgICBiaXRzIC09IG91dEJpdHM7XG4gICAgICAgICAgICByZXN1bHQucHVzaCgodmFsdWUgPj4gYml0cykgJiBtYXhWKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAocGFkKSB7XG4gICAgICAgIGlmIChiaXRzID4gMCkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goKHZhbHVlIDw8IChvdXRCaXRzIC0gYml0cykpICYgbWF4Vik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChiaXRzID49IGluQml0cylcbiAgICAgICAgICAgIHJldHVybiAnRXhjZXNzIHBhZGRpbmcnO1xuICAgICAgICBpZiAoKHZhbHVlIDw8IChvdXRCaXRzIC0gYml0cykpICYgbWF4VilcbiAgICAgICAgICAgIHJldHVybiAnTm9uLXplcm8gcGFkZGluZyc7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiB0b1dvcmRzKGJ5dGVzKSB7XG4gICAgcmV0dXJuIGNvbnZlcnQoYnl0ZXMsIDgsIDUsIHRydWUpO1xufVxuZnVuY3Rpb24gZnJvbVdvcmRzVW5zYWZlKHdvcmRzKSB7XG4gICAgY29uc3QgcmVzID0gY29udmVydCh3b3JkcywgNSwgOCwgZmFsc2UpO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJlcykpXG4gICAgICAgIHJldHVybiByZXM7XG59XG5mdW5jdGlvbiBmcm9tV29yZHMod29yZHMpIHtcbiAgICBjb25zdCByZXMgPSBjb252ZXJ0KHdvcmRzLCA1LCA4LCBmYWxzZSk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocmVzKSlcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB0aHJvdyBuZXcgRXJyb3IocmVzKTtcbn1cbmZ1bmN0aW9uIGdldExpYnJhcnlGcm9tRW5jb2RpbmcoZW5jb2RpbmcpIHtcbiAgICBsZXQgRU5DT0RJTkdfQ09OU1Q7XG4gICAgaWYgKGVuY29kaW5nID09PSAnYmVjaDMyJykge1xuICAgICAgICBFTkNPRElOR19DT05TVCA9IDE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBFTkNPRElOR19DT05TVCA9IDB4MmJjODMwYTM7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGVuY29kZShwcmVmaXgsIHdvcmRzLCBMSU1JVCkge1xuICAgICAgICBMSU1JVCA9IExJTUlUIHx8IDkwO1xuICAgICAgICBpZiAocHJlZml4Lmxlbmd0aCArIDcgKyB3b3Jkcy5sZW5ndGggPiBMSU1JVClcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4Y2VlZHMgbGVuZ3RoIGxpbWl0Jyk7XG4gICAgICAgIHByZWZpeCA9IHByZWZpeC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAvLyBkZXRlcm1pbmUgY2hrIG1vZFxuICAgICAgICBsZXQgY2hrID0gcHJlZml4Q2hrKHByZWZpeCk7XG4gICAgICAgIGlmICh0eXBlb2YgY2hrID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihjaGspO1xuICAgICAgICBsZXQgcmVzdWx0ID0gcHJlZml4ICsgJzEnO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdvcmRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjb25zdCB4ID0gd29yZHNbaV07XG4gICAgICAgICAgICBpZiAoeCA+PiA1ICE9PSAwKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm9uIDUtYml0IHdvcmQnKTtcbiAgICAgICAgICAgIGNoayA9IHBvbHltb2RTdGVwKGNoaykgXiB4O1xuICAgICAgICAgICAgcmVzdWx0ICs9IEFMUEhBQkVULmNoYXJBdCh4KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7ICsraSkge1xuICAgICAgICAgICAgY2hrID0gcG9seW1vZFN0ZXAoY2hrKTtcbiAgICAgICAgfVxuICAgICAgICBjaGsgXj0gRU5DT0RJTkdfQ09OU1Q7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgKytpKSB7XG4gICAgICAgICAgICBjb25zdCB2ID0gKGNoayA+PiAoKDUgLSBpKSAqIDUpKSAmIDB4MWY7XG4gICAgICAgICAgICByZXN1bHQgKz0gQUxQSEFCRVQuY2hhckF0KHYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIF9fZGVjb2RlKHN0ciwgTElNSVQpIHtcbiAgICAgICAgTElNSVQgPSBMSU1JVCB8fCA5MDtcbiAgICAgICAgaWYgKHN0ci5sZW5ndGggPCA4KVxuICAgICAgICAgICAgcmV0dXJuIHN0ciArICcgdG9vIHNob3J0JztcbiAgICAgICAgaWYgKHN0ci5sZW5ndGggPiBMSU1JVClcbiAgICAgICAgICAgIHJldHVybiAnRXhjZWVkcyBsZW5ndGggbGltaXQnO1xuICAgICAgICAvLyBkb24ndCBhbGxvdyBtaXhlZCBjYXNlXG4gICAgICAgIGNvbnN0IGxvd2VyZWQgPSBzdHIudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgdXBwZXJlZCA9IHN0ci50b1VwcGVyQ2FzZSgpO1xuICAgICAgICBpZiAoc3RyICE9PSBsb3dlcmVkICYmIHN0ciAhPT0gdXBwZXJlZClcbiAgICAgICAgICAgIHJldHVybiAnTWl4ZWQtY2FzZSBzdHJpbmcgJyArIHN0cjtcbiAgICAgICAgc3RyID0gbG93ZXJlZDtcbiAgICAgICAgY29uc3Qgc3BsaXQgPSBzdHIubGFzdEluZGV4T2YoJzEnKTtcbiAgICAgICAgaWYgKHNwbGl0ID09PSAtMSlcbiAgICAgICAgICAgIHJldHVybiAnTm8gc2VwYXJhdG9yIGNoYXJhY3RlciBmb3IgJyArIHN0cjtcbiAgICAgICAgaWYgKHNwbGl0ID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuICdNaXNzaW5nIHByZWZpeCBmb3IgJyArIHN0cjtcbiAgICAgICAgY29uc3QgcHJlZml4ID0gc3RyLnNsaWNlKDAsIHNwbGl0KTtcbiAgICAgICAgY29uc3Qgd29yZENoYXJzID0gc3RyLnNsaWNlKHNwbGl0ICsgMSk7XG4gICAgICAgIGlmICh3b3JkQ2hhcnMubGVuZ3RoIDwgNilcbiAgICAgICAgICAgIHJldHVybiAnRGF0YSB0b28gc2hvcnQnO1xuICAgICAgICBsZXQgY2hrID0gcHJlZml4Q2hrKHByZWZpeCk7XG4gICAgICAgIGlmICh0eXBlb2YgY2hrID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgIHJldHVybiBjaGs7XG4gICAgICAgIGNvbnN0IHdvcmRzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd29yZENoYXJzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjb25zdCBjID0gd29yZENoYXJzLmNoYXJBdChpKTtcbiAgICAgICAgICAgIGNvbnN0IHYgPSBBTFBIQUJFVF9NQVBbY107XG4gICAgICAgICAgICBpZiAodiA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIHJldHVybiAnVW5rbm93biBjaGFyYWN0ZXIgJyArIGM7XG4gICAgICAgICAgICBjaGsgPSBwb2x5bW9kU3RlcChjaGspIF4gdjtcbiAgICAgICAgICAgIC8vIG5vdCBpbiB0aGUgY2hlY2tzdW0/XG4gICAgICAgICAgICBpZiAoaSArIDYgPj0gd29yZENoYXJzLmxlbmd0aClcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIHdvcmRzLnB1c2godik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoayAhPT0gRU5DT0RJTkdfQ09OU1QpXG4gICAgICAgICAgICByZXR1cm4gJ0ludmFsaWQgY2hlY2tzdW0gZm9yICcgKyBzdHI7XG4gICAgICAgIHJldHVybiB7IHByZWZpeCwgd29yZHMgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZGVjb2RlVW5zYWZlKHN0ciwgTElNSVQpIHtcbiAgICAgICAgY29uc3QgcmVzID0gX19kZWNvZGUoc3RyLCBMSU1JVCk7XG4gICAgICAgIGlmICh0eXBlb2YgcmVzID09PSAnb2JqZWN0JylcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRlY29kZShzdHIsIExJTUlUKSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IF9fZGVjb2RlKHN0ciwgTElNSVQpO1xuICAgICAgICBpZiAodHlwZW9mIHJlcyA9PT0gJ29iamVjdCcpXG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVjb2RlVW5zYWZlLFxuICAgICAgICBkZWNvZGUsXG4gICAgICAgIGVuY29kZSxcbiAgICAgICAgdG9Xb3JkcyxcbiAgICAgICAgZnJvbVdvcmRzVW5zYWZlLFxuICAgICAgICBmcm9tV29yZHMsXG4gICAgfTtcbn1cbmV4cG9ydHMuYmVjaDMyID0gZ2V0TGlicmFyeUZyb21FbmNvZGluZygnYmVjaDMyJyk7XG5leHBvcnRzLmJlY2gzMm0gPSBnZXRMaWJyYXJ5RnJvbUVuY29kaW5nKCdiZWNoMzJtJyk7XG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydHMuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcbmV4cG9ydHMudG9CeXRlQXJyYXkgPSB0b0J5dGVBcnJheVxuZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gZnJvbUJ5dGVBcnJheVxuXG52YXIgbG9va3VwID0gW11cbnZhciByZXZMb29rdXAgPSBbXVxudmFyIEFyciA9IHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJyA/IFVpbnQ4QXJyYXkgOiBBcnJheVxuXG52YXIgY29kZSA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJ1xuZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNvZGUubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgbG9va3VwW2ldID0gY29kZVtpXVxuICByZXZMb29rdXBbY29kZS5jaGFyQ29kZUF0KGkpXSA9IGlcbn1cblxuLy8gU3VwcG9ydCBkZWNvZGluZyBVUkwtc2FmZSBiYXNlNjQgc3RyaW5ncywgYXMgTm9kZS5qcyBkb2VzLlxuLy8gU2VlOiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CYXNlNjQjVVJMX2FwcGxpY2F0aW9uc1xucmV2TG9va3VwWyctJy5jaGFyQ29kZUF0KDApXSA9IDYyXG5yZXZMb29rdXBbJ18nLmNoYXJDb2RlQXQoMCldID0gNjNcblxuZnVuY3Rpb24gZ2V0TGVucyAoYjY0KSB7XG4gIHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cbiAgaWYgKGxlbiAlIDQgPiAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0JylcbiAgfVxuXG4gIC8vIFRyaW0gb2ZmIGV4dHJhIGJ5dGVzIGFmdGVyIHBsYWNlaG9sZGVyIGJ5dGVzIGFyZSBmb3VuZFxuICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9iZWF0Z2FtbWl0L2Jhc2U2NC1qcy9pc3N1ZXMvNDJcbiAgdmFyIHZhbGlkTGVuID0gYjY0LmluZGV4T2YoJz0nKVxuICBpZiAodmFsaWRMZW4gPT09IC0xKSB2YWxpZExlbiA9IGxlblxuXG4gIHZhciBwbGFjZUhvbGRlcnNMZW4gPSB2YWxpZExlbiA9PT0gbGVuXG4gICAgPyAwXG4gICAgOiA0IC0gKHZhbGlkTGVuICUgNClcblxuICByZXR1cm4gW3ZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW5dXG59XG5cbi8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoYjY0KSB7XG4gIHZhciBsZW5zID0gZ2V0TGVucyhiNjQpXG4gIHZhciB2YWxpZExlbiA9IGxlbnNbMF1cbiAgdmFyIHBsYWNlSG9sZGVyc0xlbiA9IGxlbnNbMV1cbiAgcmV0dXJuICgodmFsaWRMZW4gKyBwbGFjZUhvbGRlcnNMZW4pICogMyAvIDQpIC0gcGxhY2VIb2xkZXJzTGVuXG59XG5cbmZ1bmN0aW9uIF9ieXRlTGVuZ3RoIChiNjQsIHZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW4pIHtcbiAgcmV0dXJuICgodmFsaWRMZW4gKyBwbGFjZUhvbGRlcnNMZW4pICogMyAvIDQpIC0gcGxhY2VIb2xkZXJzTGVuXG59XG5cbmZ1bmN0aW9uIHRvQnl0ZUFycmF5IChiNjQpIHtcbiAgdmFyIHRtcFxuICB2YXIgbGVucyA9IGdldExlbnMoYjY0KVxuICB2YXIgdmFsaWRMZW4gPSBsZW5zWzBdXG4gIHZhciBwbGFjZUhvbGRlcnNMZW4gPSBsZW5zWzFdXG5cbiAgdmFyIGFyciA9IG5ldyBBcnIoX2J5dGVMZW5ndGgoYjY0LCB2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuKSlcblxuICB2YXIgY3VyQnl0ZSA9IDBcblxuICAvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG4gIHZhciBsZW4gPSBwbGFjZUhvbGRlcnNMZW4gPiAwXG4gICAgPyB2YWxpZExlbiAtIDRcbiAgICA6IHZhbGlkTGVuXG5cbiAgdmFyIGlcbiAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSArPSA0KSB7XG4gICAgdG1wID1cbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDE4KSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgMTIpIHxcbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDIpXSA8PCA2KSB8XG4gICAgICByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDMpXVxuICAgIGFycltjdXJCeXRlKytdID0gKHRtcCA+PiAxNikgJiAweEZGXG4gICAgYXJyW2N1ckJ5dGUrK10gPSAodG1wID4+IDgpICYgMHhGRlxuICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMHhGRlxuICB9XG5cbiAgaWYgKHBsYWNlSG9sZGVyc0xlbiA9PT0gMikge1xuICAgIHRtcCA9XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAyKSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPj4gNClcbiAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIGlmIChwbGFjZUhvbGRlcnNMZW4gPT09IDEpIHtcbiAgICB0bXAgPVxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMTApIHxcbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA8PCA0KSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPj4gMilcbiAgICBhcnJbY3VyQnl0ZSsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICByZXR1cm4gYXJyXG59XG5cbmZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG4gIHJldHVybiBsb29rdXBbbnVtID4+IDE4ICYgMHgzRl0gK1xuICAgIGxvb2t1cFtudW0gPj4gMTIgJiAweDNGXSArXG4gICAgbG9va3VwW251bSA+PiA2ICYgMHgzRl0gK1xuICAgIGxvb2t1cFtudW0gJiAweDNGXVxufVxuXG5mdW5jdGlvbiBlbmNvZGVDaHVuayAodWludDgsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHRtcFxuICB2YXIgb3V0cHV0ID0gW11cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpICs9IDMpIHtcbiAgICB0bXAgPVxuICAgICAgKCh1aW50OFtpXSA8PCAxNikgJiAweEZGMDAwMCkgK1xuICAgICAgKCh1aW50OFtpICsgMV0gPDwgOCkgJiAweEZGMDApICtcbiAgICAgICh1aW50OFtpICsgMl0gJiAweEZGKVxuICAgIG91dHB1dC5wdXNoKHRyaXBsZXRUb0Jhc2U2NCh0bXApKVxuICB9XG4gIHJldHVybiBvdXRwdXQuam9pbignJylcbn1cblxuZnVuY3Rpb24gZnJvbUJ5dGVBcnJheSAodWludDgpIHtcbiAgdmFyIHRtcFxuICB2YXIgbGVuID0gdWludDgubGVuZ3RoXG4gIHZhciBleHRyYUJ5dGVzID0gbGVuICUgMyAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuICB2YXIgcGFydHMgPSBbXVxuICB2YXIgbWF4Q2h1bmtMZW5ndGggPSAxNjM4MyAvLyBtdXN0IGJlIG11bHRpcGxlIG9mIDNcblxuICAvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG4gIGZvciAodmFyIGkgPSAwLCBsZW4yID0gbGVuIC0gZXh0cmFCeXRlczsgaSA8IGxlbjI7IGkgKz0gbWF4Q2h1bmtMZW5ndGgpIHtcbiAgICBwYXJ0cy5wdXNoKGVuY29kZUNodW5rKHVpbnQ4LCBpLCAoaSArIG1heENodW5rTGVuZ3RoKSA+IGxlbjIgPyBsZW4yIDogKGkgKyBtYXhDaHVua0xlbmd0aCkpKVxuICB9XG5cbiAgLy8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuICBpZiAoZXh0cmFCeXRlcyA9PT0gMSkge1xuICAgIHRtcCA9IHVpbnQ4W2xlbiAtIDFdXG4gICAgcGFydHMucHVzaChcbiAgICAgIGxvb2t1cFt0bXAgPj4gMl0gK1xuICAgICAgbG9va3VwWyh0bXAgPDwgNCkgJiAweDNGXSArXG4gICAgICAnPT0nXG4gICAgKVxuICB9IGVsc2UgaWYgKGV4dHJhQnl0ZXMgPT09IDIpIHtcbiAgICB0bXAgPSAodWludDhbbGVuIC0gMl0gPDwgOCkgKyB1aW50OFtsZW4gLSAxXVxuICAgIHBhcnRzLnB1c2goXG4gICAgICBsb29rdXBbdG1wID4+IDEwXSArXG4gICAgICBsb29rdXBbKHRtcCA+PiA0KSAmIDB4M0ZdICtcbiAgICAgIGxvb2t1cFsodG1wIDw8IDIpICYgMHgzRl0gK1xuICAgICAgJz0nXG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJycpXG59XG4iLCAiLyohIGllZWU3NTQuIEJTRC0zLUNsYXVzZSBMaWNlbnNlLiBGZXJvc3MgQWJvdWtoYWRpamVoIDxodHRwczovL2Zlcm9zcy5vcmcvb3BlbnNvdXJjZT4gKi9cbmV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtXG4gIHZhciBlTGVuID0gKG5CeXRlcyAqIDgpIC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gKGUgKiAyNTYpICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gKG0gKiAyNTYpICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgY1xuICB2YXIgZUxlbiA9IChuQnl0ZXMgKiA4KSAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAoKHZhbHVlICogYykgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cbiIsICIvKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxodHRwczovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLXByb3RvICovXG5cbid1c2Ugc3RyaWN0J1xuXG5jb25zdCBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxuY29uc3QgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuY29uc3QgY3VzdG9tSW5zcGVjdFN5bWJvbCA9XG4gICh0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBTeW1ib2xbJ2ZvciddID09PSAnZnVuY3Rpb24nKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGRvdC1ub3RhdGlvblxuICAgID8gU3ltYm9sWydmb3InXSgnbm9kZWpzLnV0aWwuaW5zcGVjdC5jdXN0b20nKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGRvdC1ub3RhdGlvblxuICAgIDogbnVsbFxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gU2xvd0J1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5cbmNvbnN0IEtfTUFYX0xFTkdUSCA9IDB4N2ZmZmZmZmZcbmV4cG9ydHMua01heExlbmd0aCA9IEtfTUFYX0xFTkdUSFxuXG4vKipcbiAqIElmIGBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVGA6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBQcmludCB3YXJuaW5nIGFuZCByZWNvbW1lbmQgdXNpbmcgYGJ1ZmZlcmAgdjQueCB3aGljaCBoYXMgYW4gT2JqZWN0XG4gKiAgICAgICAgICAgICAgIGltcGxlbWVudGF0aW9uIChtb3N0IGNvbXBhdGlibGUsIGV2ZW4gSUU2KVxuICpcbiAqIEJyb3dzZXJzIHRoYXQgc3VwcG9ydCB0eXBlZCBhcnJheXMgYXJlIElFIDEwKywgRmlyZWZveCA0KywgQ2hyb21lIDcrLCBTYWZhcmkgNS4xKyxcbiAqIE9wZXJhIDExLjYrLCBpT1MgNC4yKy5cbiAqXG4gKiBXZSByZXBvcnQgdGhhdCB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IHR5cGVkIGFycmF5cyBpZiB0aGUgYXJlIG5vdCBzdWJjbGFzc2FibGVcbiAqIHVzaW5nIF9fcHJvdG9fXy4gRmlyZWZveCA0LTI5IGxhY2tzIHN1cHBvcnQgZm9yIGFkZGluZyBuZXcgcHJvcGVydGllcyB0byBgVWludDhBcnJheWBcbiAqIChTZWU6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOCkuIElFIDEwIGxhY2tzIHN1cHBvcnRcbiAqIGZvciBfX3Byb3RvX18gYW5kIGhhcyBhIGJ1Z2d5IHR5cGVkIGFycmF5IGltcGxlbWVudGF0aW9uLlxuICovXG5CdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCA9IHR5cGVkQXJyYXlTdXBwb3J0KClcblxuaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCAmJiB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgY29uc29sZS5lcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xuICBjb25zb2xlLmVycm9yKFxuICAgICdUaGlzIGJyb3dzZXIgbGFja3MgdHlwZWQgYXJyYXkgKFVpbnQ4QXJyYXkpIHN1cHBvcnQgd2hpY2ggaXMgcmVxdWlyZWQgYnkgJyArXG4gICAgJ2BidWZmZXJgIHY1LnguIFVzZSBgYnVmZmVyYCB2NC54IGlmIHlvdSByZXF1aXJlIG9sZCBicm93c2VyIHN1cHBvcnQuJ1xuICApXG59XG5cbmZ1bmN0aW9uIHR5cGVkQXJyYXlTdXBwb3J0ICgpIHtcbiAgLy8gQ2FuIHR5cGVkIGFycmF5IGluc3RhbmNlcyBjYW4gYmUgYXVnbWVudGVkP1xuICB0cnkge1xuICAgIGNvbnN0IGFyciA9IG5ldyBVaW50OEFycmF5KDEpXG4gICAgY29uc3QgcHJvdG8gPSB7IGZvbzogZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfSB9XG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHByb3RvLCBVaW50OEFycmF5LnByb3RvdHlwZSlcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoYXJyLCBwcm90bylcbiAgICByZXR1cm4gYXJyLmZvbygpID09PSA0MlxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEJ1ZmZlci5wcm90b3R5cGUsICdwYXJlbnQnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKHRoaXMpKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyXG4gIH1cbn0pXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIucHJvdG90eXBlLCAnb2Zmc2V0Jywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0aGlzKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHJldHVybiB0aGlzLmJ5dGVPZmZzZXRcbiAgfVxufSlcblxuZnVuY3Rpb24gY3JlYXRlQnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKGxlbmd0aCA+IEtfTUFYX0xFTkdUSCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgXCInICsgbGVuZ3RoICsgJ1wiIGlzIGludmFsaWQgZm9yIG9wdGlvbiBcInNpemVcIicpXG4gIH1cbiAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAgY29uc3QgYnVmID0gbmV3IFVpbnQ4QXJyYXkobGVuZ3RoKVxuICBPYmplY3Quc2V0UHJvdG90eXBlT2YoYnVmLCBCdWZmZXIucHJvdG90eXBlKVxuICByZXR1cm4gYnVmXG59XG5cbi8qKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBoYXZlIHRoZWlyXG4gKiBwcm90b3R5cGUgY2hhbmdlZCB0byBgQnVmZmVyLnByb3RvdHlwZWAuIEZ1cnRoZXJtb3JlLCBgQnVmZmVyYCBpcyBhIHN1YmNsYXNzIG9mXG4gKiBgVWludDhBcnJheWAsIHNvIHRoZSByZXR1cm5lZCBpbnN0YW5jZXMgd2lsbCBoYXZlIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBtZXRob2RzXG4gKiBhbmQgdGhlIGBVaW50OEFycmF5YCBtZXRob2RzLiBTcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdFxuICogcmV0dXJucyBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBUaGUgYFVpbnQ4QXJyYXlgIHByb3RvdHlwZSByZW1haW5zIHVubW9kaWZpZWQuXG4gKi9cblxuZnVuY3Rpb24gQnVmZmVyIChhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICAvLyBDb21tb24gY2FzZS5cbiAgaWYgKHR5cGVvZiBhcmcgPT09ICdudW1iZXInKSB7XG4gICAgaWYgKHR5cGVvZiBlbmNvZGluZ09yT2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgJ1RoZSBcInN0cmluZ1wiIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBzdHJpbmcuIFJlY2VpdmVkIHR5cGUgbnVtYmVyJ1xuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gYWxsb2NVbnNhZmUoYXJnKVxuICB9XG4gIHJldHVybiBmcm9tKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyIC8vIG5vdCB1c2VkIGJ5IHRoaXMgaW1wbGVtZW50YXRpb25cblxuZnVuY3Rpb24gZnJvbSAodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmcm9tU3RyaW5nKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0KVxuICB9XG5cbiAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZnJvbUFycmF5Vmlldyh2YWx1ZSlcbiAgfVxuXG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgZmlyc3QgYXJndW1lbnQgbXVzdCBiZSBvbmUgb2YgdHlwZSBzdHJpbmcsIEJ1ZmZlciwgQXJyYXlCdWZmZXIsIEFycmF5LCAnICtcbiAgICAgICdvciBBcnJheS1saWtlIE9iamVjdC4gUmVjZWl2ZWQgdHlwZSAnICsgKHR5cGVvZiB2YWx1ZSlcbiAgICApXG4gIH1cblxuICBpZiAoaXNJbnN0YW5jZSh2YWx1ZSwgQXJyYXlCdWZmZXIpIHx8XG4gICAgICAodmFsdWUgJiYgaXNJbnN0YW5jZSh2YWx1ZS5idWZmZXIsIEFycmF5QnVmZmVyKSkpIHtcbiAgICByZXR1cm4gZnJvbUFycmF5QnVmZmVyKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICBpZiAodHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgKGlzSW5zdGFuY2UodmFsdWUsIFNoYXJlZEFycmF5QnVmZmVyKSB8fFxuICAgICAgKHZhbHVlICYmIGlzSW5zdGFuY2UodmFsdWUuYnVmZmVyLCBTaGFyZWRBcnJheUJ1ZmZlcikpKSkge1xuICAgIHJldHVybiBmcm9tQXJyYXlCdWZmZXIodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJ2YWx1ZVwiIGFyZ3VtZW50IG11c3Qgbm90IGJlIG9mIHR5cGUgbnVtYmVyLiBSZWNlaXZlZCB0eXBlIG51bWJlcidcbiAgICApXG4gIH1cblxuICBjb25zdCB2YWx1ZU9mID0gdmFsdWUudmFsdWVPZiAmJiB2YWx1ZS52YWx1ZU9mKClcbiAgaWYgKHZhbHVlT2YgIT0gbnVsbCAmJiB2YWx1ZU9mICE9PSB2YWx1ZSkge1xuICAgIHJldHVybiBCdWZmZXIuZnJvbSh2YWx1ZU9mLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICBjb25zdCBiID0gZnJvbU9iamVjdCh2YWx1ZSlcbiAgaWYgKGIpIHJldHVybiBiXG5cbiAgaWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1ByaW1pdGl2ZSAhPSBudWxsICYmXG4gICAgICB0eXBlb2YgdmFsdWVbU3ltYm9sLnRvUHJpbWl0aXZlXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBCdWZmZXIuZnJvbSh2YWx1ZVtTeW1ib2wudG9QcmltaXRpdmVdKCdzdHJpbmcnKSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAnVGhlIGZpcnN0IGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgc3RyaW5nLCBCdWZmZXIsIEFycmF5QnVmZmVyLCBBcnJheSwgJyArXG4gICAgJ29yIEFycmF5LWxpa2UgT2JqZWN0LiBSZWNlaXZlZCB0eXBlICcgKyAodHlwZW9mIHZhbHVlKVxuICApXG59XG5cbi8qKlxuICogRnVuY3Rpb25hbGx5IGVxdWl2YWxlbnQgdG8gQnVmZmVyKGFyZywgZW5jb2RpbmcpIGJ1dCB0aHJvd3MgYSBUeXBlRXJyb3JcbiAqIGlmIHZhbHVlIGlzIGEgbnVtYmVyLlxuICogQnVmZmVyLmZyb20oc3RyWywgZW5jb2RpbmddKVxuICogQnVmZmVyLmZyb20oYXJyYXkpXG4gKiBCdWZmZXIuZnJvbShidWZmZXIpXG4gKiBCdWZmZXIuZnJvbShhcnJheUJ1ZmZlclssIGJ5dGVPZmZzZXRbLCBsZW5ndGhdXSlcbiAqKi9cbkJ1ZmZlci5mcm9tID0gZnVuY3Rpb24gKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGZyb20odmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuLy8gTm90ZTogQ2hhbmdlIHByb3RvdHlwZSAqYWZ0ZXIqIEJ1ZmZlci5mcm9tIGlzIGRlZmluZWQgdG8gd29ya2Fyb3VuZCBDaHJvbWUgYnVnOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvcHVsbC8xNDhcbk9iamVjdC5zZXRQcm90b3R5cGVPZihCdWZmZXIucHJvdG90eXBlLCBVaW50OEFycmF5LnByb3RvdHlwZSlcbk9iamVjdC5zZXRQcm90b3R5cGVPZihCdWZmZXIsIFVpbnQ4QXJyYXkpXG5cbmZ1bmN0aW9uIGFzc2VydFNpemUgKHNpemUpIHtcbiAgaWYgKHR5cGVvZiBzaXplICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wic2l6ZVwiIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBudW1iZXInKVxuICB9IGVsc2UgaWYgKHNpemUgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RoZSB2YWx1ZSBcIicgKyBzaXplICsgJ1wiIGlzIGludmFsaWQgZm9yIG9wdGlvbiBcInNpemVcIicpXG4gIH1cbn1cblxuZnVuY3Rpb24gYWxsb2MgKHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIGFzc2VydFNpemUoc2l6ZSlcbiAgaWYgKHNpemUgPD0gMCkge1xuICAgIHJldHVybiBjcmVhdGVCdWZmZXIoc2l6ZSlcbiAgfVxuICBpZiAoZmlsbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gT25seSBwYXkgYXR0ZW50aW9uIHRvIGVuY29kaW5nIGlmIGl0J3MgYSBzdHJpbmcuIFRoaXNcbiAgICAvLyBwcmV2ZW50cyBhY2NpZGVudGFsbHkgc2VuZGluZyBpbiBhIG51bWJlciB0aGF0IHdvdWxkXG4gICAgLy8gYmUgaW50ZXJwcmV0ZWQgYXMgYSBzdGFydCBvZmZzZXQuXG4gICAgcmV0dXJuIHR5cGVvZiBlbmNvZGluZyA9PT0gJ3N0cmluZydcbiAgICAgID8gY3JlYXRlQnVmZmVyKHNpemUpLmZpbGwoZmlsbCwgZW5jb2RpbmcpXG4gICAgICA6IGNyZWF0ZUJ1ZmZlcihzaXplKS5maWxsKGZpbGwpXG4gIH1cbiAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcihzaXplKVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqIGFsbG9jKHNpemVbLCBmaWxsWywgZW5jb2RpbmddXSlcbiAqKi9cbkJ1ZmZlci5hbGxvYyA9IGZ1bmN0aW9uIChzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICByZXR1cm4gYWxsb2Moc2l6ZSwgZmlsbCwgZW5jb2RpbmcpXG59XG5cbmZ1bmN0aW9uIGFsbG9jVW5zYWZlIChzaXplKSB7XG4gIGFzc2VydFNpemUoc2l6ZSlcbiAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcihzaXplIDwgMCA/IDAgOiBjaGVja2VkKHNpemUpIHwgMClcbn1cblxuLyoqXG4gKiBFcXVpdmFsZW50IHRvIEJ1ZmZlcihudW0pLCBieSBkZWZhdWx0IGNyZWF0ZXMgYSBub24temVyby1maWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICogKi9cbkJ1ZmZlci5hbGxvY1Vuc2FmZSA9IGZ1bmN0aW9uIChzaXplKSB7XG4gIHJldHVybiBhbGxvY1Vuc2FmZShzaXplKVxufVxuLyoqXG4gKiBFcXVpdmFsZW50IHRvIFNsb3dCdWZmZXIobnVtKSwgYnkgZGVmYXVsdCBjcmVhdGVzIGEgbm9uLXplcm8tZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqL1xuQnVmZmVyLmFsbG9jVW5zYWZlU2xvdyA9IGZ1bmN0aW9uIChzaXplKSB7XG4gIHJldHVybiBhbGxvY1Vuc2FmZShzaXplKVxufVxuXG5mdW5jdGlvbiBmcm9tU3RyaW5nIChzdHJpbmcsIGVuY29kaW5nKSB7XG4gIGlmICh0eXBlb2YgZW5jb2RpbmcgIT09ICdzdHJpbmcnIHx8IGVuY29kaW5nID09PSAnJykge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gIH1cblxuICBpZiAoIUJ1ZmZlci5pc0VuY29kaW5nKGVuY29kaW5nKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgfVxuXG4gIGNvbnN0IGxlbmd0aCA9IGJ5dGVMZW5ndGgoc3RyaW5nLCBlbmNvZGluZykgfCAwXG4gIGxldCBidWYgPSBjcmVhdGVCdWZmZXIobGVuZ3RoKVxuXG4gIGNvbnN0IGFjdHVhbCA9IGJ1Zi53cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuXG4gIGlmIChhY3R1YWwgIT09IGxlbmd0aCkge1xuICAgIC8vIFdyaXRpbmcgYSBoZXggc3RyaW5nLCBmb3IgZXhhbXBsZSwgdGhhdCBjb250YWlucyBpbnZhbGlkIGNoYXJhY3RlcnMgd2lsbFxuICAgIC8vIGNhdXNlIGV2ZXJ5dGhpbmcgYWZ0ZXIgdGhlIGZpcnN0IGludmFsaWQgY2hhcmFjdGVyIHRvIGJlIGlnbm9yZWQuIChlLmcuXG4gICAgLy8gJ2FieHhjZCcgd2lsbCBiZSB0cmVhdGVkIGFzICdhYicpXG4gICAgYnVmID0gYnVmLnNsaWNlKDAsIGFjdHVhbClcbiAgfVxuXG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5TGlrZSAoYXJyYXkpIHtcbiAgY29uc3QgbGVuZ3RoID0gYXJyYXkubGVuZ3RoIDwgMCA/IDAgOiBjaGVja2VkKGFycmF5Lmxlbmd0aCkgfCAwXG4gIGNvbnN0IGJ1ZiA9IGNyZWF0ZUJ1ZmZlcihsZW5ndGgpXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICBidWZbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5VmlldyAoYXJyYXlWaWV3KSB7XG4gIGlmIChpc0luc3RhbmNlKGFycmF5VmlldywgVWludDhBcnJheSkpIHtcbiAgICBjb25zdCBjb3B5ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlWaWV3KVxuICAgIHJldHVybiBmcm9tQXJyYXlCdWZmZXIoY29weS5idWZmZXIsIGNvcHkuYnl0ZU9mZnNldCwgY29weS5ieXRlTGVuZ3RoKVxuICB9XG4gIHJldHVybiBmcm9tQXJyYXlMaWtlKGFycmF5Vmlldylcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5QnVmZmVyIChhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmIChieXRlT2Zmc2V0IDwgMCB8fCBhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcIm9mZnNldFwiIGlzIG91dHNpZGUgb2YgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBpZiAoYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQgKyAobGVuZ3RoIHx8IDApKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1wibGVuZ3RoXCIgaXMgb3V0c2lkZSBvZiBidWZmZXIgYm91bmRzJylcbiAgfVxuXG4gIGxldCBidWZcbiAgaWYgKGJ5dGVPZmZzZXQgPT09IHVuZGVmaW5lZCAmJiBsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5KVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQpXG4gIH0gZWxzZSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIE9iamVjdC5zZXRQcm90b3R5cGVPZihidWYsIEJ1ZmZlci5wcm90b3R5cGUpXG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG5mdW5jdGlvbiBmcm9tT2JqZWN0IChvYmopIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihvYmopKSB7XG4gICAgY29uc3QgbGVuID0gY2hlY2tlZChvYmoubGVuZ3RoKSB8IDBcbiAgICBjb25zdCBidWYgPSBjcmVhdGVCdWZmZXIobGVuKVxuXG4gICAgaWYgKGJ1Zi5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBidWZcbiAgICB9XG5cbiAgICBvYmouY29weShidWYsIDAsIDAsIGxlbilcbiAgICByZXR1cm4gYnVmXG4gIH1cblxuICBpZiAob2JqLmxlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHR5cGVvZiBvYmoubGVuZ3RoICE9PSAnbnVtYmVyJyB8fCBudW1iZXJJc05hTihvYmoubGVuZ3RoKSkge1xuICAgICAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcigwKVxuICAgIH1cbiAgICByZXR1cm4gZnJvbUFycmF5TGlrZShvYmopXG4gIH1cblxuICBpZiAob2JqLnR5cGUgPT09ICdCdWZmZXInICYmIEFycmF5LmlzQXJyYXkob2JqLmRhdGEpKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheUxpa2Uob2JqLmRhdGEpXG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tlZCAobGVuZ3RoKSB7XG4gIC8vIE5vdGU6IGNhbm5vdCB1c2UgYGxlbmd0aCA8IEtfTUFYX0xFTkdUSGAgaGVyZSBiZWNhdXNlIHRoYXQgZmFpbHMgd2hlblxuICAvLyBsZW5ndGggaXMgTmFOICh3aGljaCBpcyBvdGhlcndpc2UgY29lcmNlZCB0byB6ZXJvLilcbiAgaWYgKGxlbmd0aCA+PSBLX01BWF9MRU5HVEgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byBhbGxvY2F0ZSBCdWZmZXIgbGFyZ2VyIHRoYW4gbWF4aW11bSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnc2l6ZTogMHgnICsgS19NQVhfTEVOR1RILnRvU3RyaW5nKDE2KSArICcgYnl0ZXMnKVxuICB9XG4gIHJldHVybiBsZW5ndGggfCAwXG59XG5cbmZ1bmN0aW9uIFNsb3dCdWZmZXIgKGxlbmd0aCkge1xuICBpZiAoK2xlbmd0aCAhPSBsZW5ndGgpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBlcWVxZXFcbiAgICBsZW5ndGggPSAwXG4gIH1cbiAgcmV0dXJuIEJ1ZmZlci5hbGxvYygrbGVuZ3RoKVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiBpc0J1ZmZlciAoYikge1xuICByZXR1cm4gYiAhPSBudWxsICYmIGIuX2lzQnVmZmVyID09PSB0cnVlICYmXG4gICAgYiAhPT0gQnVmZmVyLnByb3RvdHlwZSAvLyBzbyBCdWZmZXIuaXNCdWZmZXIoQnVmZmVyLnByb3RvdHlwZSkgd2lsbCBiZSBmYWxzZVxufVxuXG5CdWZmZXIuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKGEsIGIpIHtcbiAgaWYgKGlzSW5zdGFuY2UoYSwgVWludDhBcnJheSkpIGEgPSBCdWZmZXIuZnJvbShhLCBhLm9mZnNldCwgYS5ieXRlTGVuZ3RoKVxuICBpZiAoaXNJbnN0YW5jZShiLCBVaW50OEFycmF5KSkgYiA9IEJ1ZmZlci5mcm9tKGIsIGIub2Zmc2V0LCBiLmJ5dGVMZW5ndGgpXG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGEpIHx8ICFCdWZmZXIuaXNCdWZmZXIoYikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBcImJ1ZjFcIiwgXCJidWYyXCIgYXJndW1lbnRzIG11c3QgYmUgb25lIG9mIHR5cGUgQnVmZmVyIG9yIFVpbnQ4QXJyYXknXG4gICAgKVxuICB9XG5cbiAgaWYgKGEgPT09IGIpIHJldHVybiAwXG5cbiAgbGV0IHggPSBhLmxlbmd0aFxuICBsZXQgeSA9IGIubGVuZ3RoXG5cbiAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IE1hdGgubWluKHgsIHkpOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAoYVtpXSAhPT0gYltpXSkge1xuICAgICAgeCA9IGFbaV1cbiAgICAgIHkgPSBiW2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiBpc0VuY29kaW5nIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdsYXRpbjEnOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIGNvbmNhdCAobGlzdCwgbGVuZ3RoKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShsaXN0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gIH1cblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gQnVmZmVyLmFsbG9jKDApXG4gIH1cblxuICBsZXQgaVxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBsZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgIGxlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvY1Vuc2FmZShsZW5ndGgpXG4gIGxldCBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgbGV0IGJ1ZiA9IGxpc3RbaV1cbiAgICBpZiAoaXNJbnN0YW5jZShidWYsIFVpbnQ4QXJyYXkpKSB7XG4gICAgICBpZiAocG9zICsgYnVmLmxlbmd0aCA+IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkgYnVmID0gQnVmZmVyLmZyb20oYnVmKVxuICAgICAgICBidWYuY29weShidWZmZXIsIHBvcylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFVpbnQ4QXJyYXkucHJvdG90eXBlLnNldC5jYWxsKFxuICAgICAgICAgIGJ1ZmZlcixcbiAgICAgICAgICBidWYsXG4gICAgICAgICAgcG9zXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0XCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJylcbiAgICB9IGVsc2Uge1xuICAgICAgYnVmLmNvcHkoYnVmZmVyLCBwb3MpXG4gICAgfVxuICAgIHBvcyArPSBidWYubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZmZlclxufVxuXG5mdW5jdGlvbiBieXRlTGVuZ3RoIChzdHJpbmcsIGVuY29kaW5nKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIoc3RyaW5nKSkge1xuICAgIHJldHVybiBzdHJpbmcubGVuZ3RoXG4gIH1cbiAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhzdHJpbmcpIHx8IGlzSW5zdGFuY2Uoc3RyaW5nLCBBcnJheUJ1ZmZlcikpIHtcbiAgICByZXR1cm4gc3RyaW5nLmJ5dGVMZW5ndGhcbiAgfVxuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBcInN0cmluZ1wiIGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgc3RyaW5nLCBCdWZmZXIsIG9yIEFycmF5QnVmZmVyLiAnICtcbiAgICAgICdSZWNlaXZlZCB0eXBlICcgKyB0eXBlb2Ygc3RyaW5nXG4gICAgKVxuICB9XG5cbiAgY29uc3QgbGVuID0gc3RyaW5nLmxlbmd0aFxuICBjb25zdCBtdXN0TWF0Y2ggPSAoYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdID09PSB0cnVlKVxuICBpZiAoIW11c3RNYXRjaCAmJiBsZW4gPT09IDApIHJldHVybiAwXG5cbiAgLy8gVXNlIGEgZm9yIGxvb3AgdG8gYXZvaWQgcmVjdXJzaW9uXG4gIGxldCBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxlblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIGxlbiAqIDJcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBsZW4gPj4+IDFcbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRUb0J5dGVzKHN0cmluZykubGVuZ3RoXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHtcbiAgICAgICAgICByZXR1cm4gbXVzdE1hdGNoID8gLTEgOiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aCAvLyBhc3N1bWUgdXRmOFxuICAgICAgICB9XG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcblxuZnVuY3Rpb24gc2xvd1RvU3RyaW5nIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICBsZXQgbG93ZXJlZENhc2UgPSBmYWxzZVxuXG4gIC8vIE5vIG5lZWQgdG8gdmVyaWZ5IHRoYXQgXCJ0aGlzLmxlbmd0aCA8PSBNQVhfVUlOVDMyXCIgc2luY2UgaXQncyBhIHJlYWQtb25seVxuICAvLyBwcm9wZXJ0eSBvZiBhIHR5cGVkIGFycmF5LlxuXG4gIC8vIFRoaXMgYmVoYXZlcyBuZWl0aGVyIGxpa2UgU3RyaW5nIG5vciBVaW50OEFycmF5IGluIHRoYXQgd2Ugc2V0IHN0YXJ0L2VuZFxuICAvLyB0byB0aGVpciB1cHBlci9sb3dlciBib3VuZHMgaWYgdGhlIHZhbHVlIHBhc3NlZCBpcyBvdXQgb2YgcmFuZ2UuXG4gIC8vIHVuZGVmaW5lZCBpcyBoYW5kbGVkIHNwZWNpYWxseSBhcyBwZXIgRUNNQS0yNjIgNnRoIEVkaXRpb24sXG4gIC8vIFNlY3Rpb24gMTMuMy4zLjcgUnVudGltZSBTZW1hbnRpY3M6IEtleWVkQmluZGluZ0luaXRpYWxpemF0aW9uLlxuICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCB8fCBzdGFydCA8IDApIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICAvLyBSZXR1cm4gZWFybHkgaWYgc3RhcnQgPiB0aGlzLmxlbmd0aC4gRG9uZSBoZXJlIHRvIHByZXZlbnQgcG90ZW50aWFsIHVpbnQzMlxuICAvLyBjb2VyY2lvbiBmYWlsIGJlbG93LlxuICBpZiAoc3RhcnQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkIHx8IGVuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgfVxuXG4gIGlmIChlbmQgPD0gMCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgLy8gRm9yY2UgY29lcmNpb24gdG8gdWludDMyLiBUaGlzIHdpbGwgYWxzbyBjb2VyY2UgZmFsc2V5L05hTiB2YWx1ZXMgdG8gMC5cbiAgZW5kID4+Pj0gMFxuICBzdGFydCA+Pj49IDBcblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsYXRpbjFTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHV0ZjE2bGVTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoZW5jb2RpbmcgKyAnJykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuLy8gVGhpcyBwcm9wZXJ0eSBpcyB1c2VkIGJ5IGBCdWZmZXIuaXNCdWZmZXJgIChhbmQgdGhlIGBpcy1idWZmZXJgIG5wbSBwYWNrYWdlKVxuLy8gdG8gZGV0ZWN0IGEgQnVmZmVyIGluc3RhbmNlLiBJdCdzIG5vdCBwb3NzaWJsZSB0byB1c2UgYGluc3RhbmNlb2YgQnVmZmVyYFxuLy8gcmVsaWFibHkgaW4gYSBicm93c2VyaWZ5IGNvbnRleHQgYmVjYXVzZSB0aGVyZSBjb3VsZCBiZSBtdWx0aXBsZSBkaWZmZXJlbnRcbi8vIGNvcGllcyBvZiB0aGUgJ2J1ZmZlcicgcGFja2FnZSBpbiB1c2UuIFRoaXMgbWV0aG9kIHdvcmtzIGV2ZW4gZm9yIEJ1ZmZlclxuLy8gaW5zdGFuY2VzIHRoYXQgd2VyZSBjcmVhdGVkIGZyb20gYW5vdGhlciBjb3B5IG9mIHRoZSBgYnVmZmVyYCBwYWNrYWdlLlxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9pc3N1ZXMvMTU0XG5CdWZmZXIucHJvdG90eXBlLl9pc0J1ZmZlciA9IHRydWVcblxuZnVuY3Rpb24gc3dhcCAoYiwgbiwgbSkge1xuICBjb25zdCBpID0gYltuXVxuICBiW25dID0gYlttXVxuICBiW21dID0gaVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXAxNiA9IGZ1bmN0aW9uIHN3YXAxNiAoKSB7XG4gIGNvbnN0IGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSAyICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAxNi1iaXRzJylcbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSArPSAyKSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgMSlcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXAzMiA9IGZ1bmN0aW9uIHN3YXAzMiAoKSB7XG4gIGNvbnN0IGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA0ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAzMi1iaXRzJylcbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSArPSA0KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgMylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgMilcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXA2NCA9IGZ1bmN0aW9uIHN3YXA2NCAoKSB7XG4gIGNvbnN0IGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA4ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA2NC1iaXRzJylcbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSArPSA4KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgNylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgNilcbiAgICBzd2FwKHRoaXMsIGkgKyAyLCBpICsgNSlcbiAgICBzd2FwKHRoaXMsIGkgKyAzLCBpICsgNClcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcgKCkge1xuICBjb25zdCBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuZ3RoID09PSAwKSByZXR1cm4gJydcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHJldHVybiB1dGY4U2xpY2UodGhpcywgMCwgbGVuZ3RoKVxuICByZXR1cm4gc2xvd1RvU3RyaW5nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0xvY2FsZVN0cmluZyA9IEJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmdcblxuQnVmZmVyLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiBlcXVhbHMgKGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXInKVxuICBpZiAodGhpcyA9PT0gYikgcmV0dXJuIHRydWVcbiAgcmV0dXJuIEJ1ZmZlci5jb21wYXJlKHRoaXMsIGIpID09PSAwXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uIGluc3BlY3QgKCkge1xuICBsZXQgc3RyID0gJydcbiAgY29uc3QgbWF4ID0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFU1xuICBzdHIgPSB0aGlzLnRvU3RyaW5nKCdoZXgnLCAwLCBtYXgpLnJlcGxhY2UoLyguezJ9KS9nLCAnJDEgJykudHJpbSgpXG4gIGlmICh0aGlzLmxlbmd0aCA+IG1heCkgc3RyICs9ICcgLi4uICdcbiAgcmV0dXJuICc8QnVmZmVyICcgKyBzdHIgKyAnPidcbn1cbmlmIChjdXN0b21JbnNwZWN0U3ltYm9sKSB7XG4gIEJ1ZmZlci5wcm90b3R5cGVbY3VzdG9tSW5zcGVjdFN5bWJvbF0gPSBCdWZmZXIucHJvdG90eXBlLmluc3BlY3Rcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAodGFyZ2V0LCBzdGFydCwgZW5kLCB0aGlzU3RhcnQsIHRoaXNFbmQpIHtcbiAgaWYgKGlzSW5zdGFuY2UodGFyZ2V0LCBVaW50OEFycmF5KSkge1xuICAgIHRhcmdldCA9IEJ1ZmZlci5mcm9tKHRhcmdldCwgdGFyZ2V0Lm9mZnNldCwgdGFyZ2V0LmJ5dGVMZW5ndGgpXG4gIH1cbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGFyZ2V0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIFwidGFyZ2V0XCIgYXJndW1lbnQgbXVzdCBiZSBvbmUgb2YgdHlwZSBCdWZmZXIgb3IgVWludDhBcnJheS4gJyArXG4gICAgICAnUmVjZWl2ZWQgdHlwZSAnICsgKHR5cGVvZiB0YXJnZXQpXG4gICAgKVxuICB9XG5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICBpZiAoZW5kID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmQgPSB0YXJnZXQgPyB0YXJnZXQubGVuZ3RoIDogMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNTdGFydCA9IDBcbiAgfVxuICBpZiAodGhpc0VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc0VuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoc3RhcnQgPCAwIHx8IGVuZCA+IHRhcmdldC5sZW5ndGggfHwgdGhpc1N0YXJ0IDwgMCB8fCB0aGlzRW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCAmJiBzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCkge1xuICAgIHJldHVybiAtMVxuICB9XG4gIGlmIChzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMVxuICB9XG5cbiAgc3RhcnQgPj4+PSAwXG4gIGVuZCA+Pj49IDBcbiAgdGhpc1N0YXJ0ID4+Pj0gMFxuICB0aGlzRW5kID4+Pj0gMFxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQpIHJldHVybiAwXG5cbiAgbGV0IHggPSB0aGlzRW5kIC0gdGhpc1N0YXJ0XG4gIGxldCB5ID0gZW5kIC0gc3RhcnRcbiAgY29uc3QgbGVuID0gTWF0aC5taW4oeCwgeSlcblxuICBjb25zdCB0aGlzQ29weSA9IHRoaXMuc2xpY2UodGhpc1N0YXJ0LCB0aGlzRW5kKVxuICBjb25zdCB0YXJnZXRDb3B5ID0gdGFyZ2V0LnNsaWNlKHN0YXJ0LCBlbmQpXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIGlmICh0aGlzQ29weVtpXSAhPT0gdGFyZ2V0Q29weVtpXSkge1xuICAgICAgeCA9IHRoaXNDb3B5W2ldXG4gICAgICB5ID0gdGFyZ2V0Q29weVtpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbi8vIEZpbmRzIGVpdGhlciB0aGUgZmlyc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0ID49IGBieXRlT2Zmc2V0YCxcbi8vIE9SIHRoZSBsYXN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA8PSBgYnl0ZU9mZnNldGAuXG4vL1xuLy8gQXJndW1lbnRzOlxuLy8gLSBidWZmZXIgLSBhIEJ1ZmZlciB0byBzZWFyY2hcbi8vIC0gdmFsIC0gYSBzdHJpbmcsIEJ1ZmZlciwgb3IgbnVtYmVyXG4vLyAtIGJ5dGVPZmZzZXQgLSBhbiBpbmRleCBpbnRvIGBidWZmZXJgOyB3aWxsIGJlIGNsYW1wZWQgdG8gYW4gaW50MzJcbi8vIC0gZW5jb2RpbmcgLSBhbiBvcHRpb25hbCBlbmNvZGluZywgcmVsZXZhbnQgaXMgdmFsIGlzIGEgc3RyaW5nXG4vLyAtIGRpciAtIHRydWUgZm9yIGluZGV4T2YsIGZhbHNlIGZvciBsYXN0SW5kZXhPZlxuZnVuY3Rpb24gYmlkaXJlY3Rpb25hbEluZGV4T2YgKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIC8vIEVtcHR5IGJ1ZmZlciBtZWFucyBubyBtYXRjaFxuICBpZiAoYnVmZmVyLmxlbmd0aCA9PT0gMCkgcmV0dXJuIC0xXG5cbiAgLy8gTm9ybWFsaXplIGJ5dGVPZmZzZXRcbiAgaWYgKHR5cGVvZiBieXRlT2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gYnl0ZU9mZnNldFxuICAgIGJ5dGVPZmZzZXQgPSAwXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA+IDB4N2ZmZmZmZmYpIHtcbiAgICBieXRlT2Zmc2V0ID0gMHg3ZmZmZmZmZlxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAtMHg4MDAwMDAwMCkge1xuICAgIGJ5dGVPZmZzZXQgPSAtMHg4MDAwMDAwMFxuICB9XG4gIGJ5dGVPZmZzZXQgPSArYnl0ZU9mZnNldCAvLyBDb2VyY2UgdG8gTnVtYmVyLlxuICBpZiAobnVtYmVySXNOYU4oYnl0ZU9mZnNldCkpIHtcbiAgICAvLyBieXRlT2Zmc2V0OiBpdCBpdCdzIHVuZGVmaW5lZCwgbnVsbCwgTmFOLCBcImZvb1wiLCBldGMsIHNlYXJjaCB3aG9sZSBidWZmZXJcbiAgICBieXRlT2Zmc2V0ID0gZGlyID8gMCA6IChidWZmZXIubGVuZ3RoIC0gMSlcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0OiBuZWdhdGl2ZSBvZmZzZXRzIHN0YXJ0IGZyb20gdGhlIGVuZCBvZiB0aGUgYnVmZmVyXG4gIGlmIChieXRlT2Zmc2V0IDwgMCkgYnl0ZU9mZnNldCA9IGJ1ZmZlci5sZW5ndGggKyBieXRlT2Zmc2V0XG4gIGlmIChieXRlT2Zmc2V0ID49IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICBpZiAoZGlyKSByZXR1cm4gLTFcbiAgICBlbHNlIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoIC0gMVxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAwKSB7XG4gICAgaWYgKGRpcikgYnl0ZU9mZnNldCA9IDBcbiAgICBlbHNlIHJldHVybiAtMVxuICB9XG5cbiAgLy8gTm9ybWFsaXplIHZhbFxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWwgPSBCdWZmZXIuZnJvbSh2YWwsIGVuY29kaW5nKVxuICB9XG5cbiAgLy8gRmluYWxseSwgc2VhcmNoIGVpdGhlciBpbmRleE9mIChpZiBkaXIgaXMgdHJ1ZSkgb3IgbGFzdEluZGV4T2ZcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcih2YWwpKSB7XG4gICAgLy8gU3BlY2lhbCBjYXNlOiBsb29raW5nIGZvciBlbXB0eSBzdHJpbmcvYnVmZmVyIGFsd2F5cyBmYWlsc1xuICAgIGlmICh2YWwubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gLTFcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZihidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcilcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHZhbCA9IHZhbCAmIDB4RkYgLy8gU2VhcmNoIGZvciBhIGJ5dGUgdmFsdWUgWzAtMjU1XVxuICAgIGlmICh0eXBlb2YgVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKGRpcikge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmxhc3RJbmRleE9mLmNhbGwoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCBbdmFsXSwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcilcbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZhbCBtdXN0IGJlIHN0cmluZywgbnVtYmVyIG9yIEJ1ZmZlcicpXG59XG5cbmZ1bmN0aW9uIGFycmF5SW5kZXhPZiAoYXJyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpIHtcbiAgbGV0IGluZGV4U2l6ZSA9IDFcbiAgbGV0IGFyckxlbmd0aCA9IGFyci5sZW5ndGhcbiAgbGV0IHZhbExlbmd0aCA9IHZhbC5sZW5ndGhcblxuICBpZiAoZW5jb2RpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgaWYgKGVuY29kaW5nID09PSAndWNzMicgfHwgZW5jb2RpbmcgPT09ICd1Y3MtMicgfHxcbiAgICAgICAgZW5jb2RpbmcgPT09ICd1dGYxNmxlJyB8fCBlbmNvZGluZyA9PT0gJ3V0Zi0xNmxlJykge1xuICAgICAgaWYgKGFyci5sZW5ndGggPCAyIHx8IHZhbC5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiAtMVxuICAgICAgfVxuICAgICAgaW5kZXhTaXplID0gMlxuICAgICAgYXJyTGVuZ3RoIC89IDJcbiAgICAgIHZhbExlbmd0aCAvPSAyXG4gICAgICBieXRlT2Zmc2V0IC89IDJcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWFkIChidWYsIGkpIHtcbiAgICBpZiAoaW5kZXhTaXplID09PSAxKSB7XG4gICAgICByZXR1cm4gYnVmW2ldXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBidWYucmVhZFVJbnQxNkJFKGkgKiBpbmRleFNpemUpXG4gICAgfVxuICB9XG5cbiAgbGV0IGlcbiAgaWYgKGRpcikge1xuICAgIGxldCBmb3VuZEluZGV4ID0gLTFcbiAgICBmb3IgKGkgPSBieXRlT2Zmc2V0OyBpIDwgYXJyTGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChyZWFkKGFyciwgaSkgPT09IHJlYWQodmFsLCBmb3VuZEluZGV4ID09PSAtMSA/IDAgOiBpIC0gZm91bmRJbmRleCkpIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggPT09IC0xKSBmb3VuZEluZGV4ID0gaVxuICAgICAgICBpZiAoaSAtIGZvdW5kSW5kZXggKyAxID09PSB2YWxMZW5ndGgpIHJldHVybiBmb3VuZEluZGV4ICogaW5kZXhTaXplXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZm91bmRJbmRleCAhPT0gLTEpIGkgLT0gaSAtIGZvdW5kSW5kZXhcbiAgICAgICAgZm91bmRJbmRleCA9IC0xXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChieXRlT2Zmc2V0ICsgdmFsTGVuZ3RoID4gYXJyTGVuZ3RoKSBieXRlT2Zmc2V0ID0gYXJyTGVuZ3RoIC0gdmFsTGVuZ3RoXG4gICAgZm9yIChpID0gYnl0ZU9mZnNldDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGxldCBmb3VuZCA9IHRydWVcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdmFsTGVuZ3RoOyBqKyspIHtcbiAgICAgICAgaWYgKHJlYWQoYXJyLCBpICsgaikgIT09IHJlYWQodmFsLCBqKSkge1xuICAgICAgICAgIGZvdW5kID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZm91bmQpIHJldHVybiBpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIC0xXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5jbHVkZXMgPSBmdW5jdGlvbiBpbmNsdWRlcyAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gdGhpcy5pbmRleE9mKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpICE9PSAtMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiBpbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCB0cnVlKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmxhc3RJbmRleE9mID0gZnVuY3Rpb24gbGFzdEluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGJpZGlyZWN0aW9uYWxJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGZhbHNlKVxufVxuXG5mdW5jdGlvbiBoZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgY29uc3QgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGxldCBpXG4gIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBpZiAobnVtYmVySXNOYU4ocGFyc2VkKSkgcmV0dXJuIGlcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBwYXJzZWRcbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiB1dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBhc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGJhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiB1Y3MyV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcpXG4gIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgb2Zmc2V0WywgbGVuZ3RoXVssIGVuY29kaW5nXSlcbiAgfSBlbHNlIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gICAgaWYgKGlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGxlbmd0aCA9IGxlbmd0aCA+Pj4gMFxuICAgICAgaWYgKGVuY29kaW5nID09PSB1bmRlZmluZWQpIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgfSBlbHNlIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ0J1ZmZlci53cml0ZShzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXRbLCBsZW5ndGhdKSBpcyBubyBsb25nZXIgc3VwcG9ydGVkJ1xuICAgIClcbiAgfVxuXG4gIGNvbnN0IHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCB8fCBsZW5ndGggPiByZW1haW5pbmcpIGxlbmd0aCA9IHJlbWFpbmluZ1xuXG4gIGlmICgoc3RyaW5nLmxlbmd0aCA+IDAgJiYgKGxlbmd0aCA8IDAgfHwgb2Zmc2V0IDwgMCkpIHx8IG9mZnNldCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gd3JpdGUgb3V0c2lkZSBidWZmZXIgYm91bmRzJylcbiAgfVxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG5cbiAgbGV0IGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBoZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGFzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgLy8gV2FybmluZzogbWF4TGVuZ3RoIG5vdCB0YWtlbiBpbnRvIGFjY291bnQgaW4gYmFzZTY0V3JpdGVcbiAgICAgICAgcmV0dXJuIGJhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1Y3MyV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gdG9KU09OICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG5mdW5jdGlvbiBiYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuICBjb25zdCByZXMgPSBbXVxuXG4gIGxldCBpID0gc3RhcnRcbiAgd2hpbGUgKGkgPCBlbmQpIHtcbiAgICBjb25zdCBmaXJzdEJ5dGUgPSBidWZbaV1cbiAgICBsZXQgY29kZVBvaW50ID0gbnVsbFxuICAgIGxldCBieXRlc1BlclNlcXVlbmNlID0gKGZpcnN0Qnl0ZSA+IDB4RUYpXG4gICAgICA/IDRcbiAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4REYpXG4gICAgICAgICAgPyAzXG4gICAgICAgICAgOiAoZmlyc3RCeXRlID4gMHhCRilcbiAgICAgICAgICAgICAgPyAyXG4gICAgICAgICAgICAgIDogMVxuXG4gICAgaWYgKGkgKyBieXRlc1BlclNlcXVlbmNlIDw9IGVuZCkge1xuICAgICAgbGV0IHNlY29uZEJ5dGUsIHRoaXJkQnl0ZSwgZm91cnRoQnl0ZSwgdGVtcENvZGVQb2ludFxuXG4gICAgICBzd2l0Y2ggKGJ5dGVzUGVyU2VxdWVuY2UpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGlmIChmaXJzdEJ5dGUgPCAweDgwKSB7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPSBmaXJzdEJ5dGVcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHgxRikgPDwgMHg2IHwgKHNlY29uZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4QyB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKHRoaXJkQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0ZGICYmICh0ZW1wQ29kZVBvaW50IDwgMHhEODAwIHx8IHRlbXBDb2RlUG9pbnQgPiAweERGRkYpKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGZvdXJ0aEJ5dGUgPSBidWZbaSArIDNdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwICYmIChmb3VydGhCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweDEyIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweEMgfCAodGhpcmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKGZvdXJ0aEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweEZGRkYgJiYgdGVtcENvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvZGVQb2ludCA9PT0gbnVsbCkge1xuICAgICAgLy8gd2UgZGlkIG5vdCBnZW5lcmF0ZSBhIHZhbGlkIGNvZGVQb2ludCBzbyBpbnNlcnQgYVxuICAgICAgLy8gcmVwbGFjZW1lbnQgY2hhciAoVStGRkZEKSBhbmQgYWR2YW5jZSBvbmx5IDEgYnl0ZVxuICAgICAgY29kZVBvaW50ID0gMHhGRkZEXG4gICAgICBieXRlc1BlclNlcXVlbmNlID0gMVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50ID4gMHhGRkZGKSB7XG4gICAgICAvLyBlbmNvZGUgdG8gdXRmMTYgKHN1cnJvZ2F0ZSBwYWlyIGRhbmNlKVxuICAgICAgY29kZVBvaW50IC09IDB4MTAwMDBcbiAgICAgIHJlcy5wdXNoKGNvZGVQb2ludCA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMClcbiAgICAgIGNvZGVQb2ludCA9IDB4REMwMCB8IGNvZGVQb2ludCAmIDB4M0ZGXG4gICAgfVxuXG4gICAgcmVzLnB1c2goY29kZVBvaW50KVxuICAgIGkgKz0gYnl0ZXNQZXJTZXF1ZW5jZVxuICB9XG5cbiAgcmV0dXJuIGRlY29kZUNvZGVQb2ludHNBcnJheShyZXMpXG59XG5cbi8vIEJhc2VkIG9uIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIyNzQ3MjcyLzY4MDc0MiwgdGhlIGJyb3dzZXIgd2l0aFxuLy8gdGhlIGxvd2VzdCBsaW1pdCBpcyBDaHJvbWUsIHdpdGggMHgxMDAwMCBhcmdzLlxuLy8gV2UgZ28gMSBtYWduaXR1ZGUgbGVzcywgZm9yIHNhZmV0eVxuY29uc3QgTUFYX0FSR1VNRU5UU19MRU5HVEggPSAweDEwMDBcblxuZnVuY3Rpb24gZGVjb2RlQ29kZVBvaW50c0FycmF5IChjb2RlUG9pbnRzKSB7XG4gIGNvbnN0IGxlbiA9IGNvZGVQb2ludHMubGVuZ3RoXG4gIGlmIChsZW4gPD0gTUFYX0FSR1VNRU5UU19MRU5HVEgpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShTdHJpbmcsIGNvZGVQb2ludHMpIC8vIGF2b2lkIGV4dHJhIHNsaWNlKClcbiAgfVxuXG4gIC8vIERlY29kZSBpbiBjaHVua3MgdG8gYXZvaWQgXCJjYWxsIHN0YWNrIHNpemUgZXhjZWVkZWRcIi5cbiAgbGV0IHJlcyA9ICcnXG4gIGxldCBpID0gMFxuICB3aGlsZSAoaSA8IGxlbikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFxuICAgICAgU3RyaW5nLFxuICAgICAgY29kZVBvaW50cy5zbGljZShpLCBpICs9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKVxuICAgIClcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBsZXQgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldICYgMHg3RilcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGxhdGluMVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgbGV0IHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGhleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgY29uc3QgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIGxldCBvdXQgPSAnJ1xuICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIG91dCArPSBoZXhTbGljZUxvb2t1cFRhYmxlW2J1ZltpXV1cbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGNvbnN0IGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIGxldCByZXMgPSAnJ1xuICAvLyBJZiBieXRlcy5sZW5ndGggaXMgb2RkLCB0aGUgbGFzdCA4IGJpdHMgbXVzdCBiZSBpZ25vcmVkIChzYW1lIGFzIG5vZGUuanMpXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoIC0gMTsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyAoYnl0ZXNbaSArIDFdICogMjU2KSlcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiBzbGljZSAoc3RhcnQsIGVuZCkge1xuICBjb25zdCBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IH5+c3RhcnRcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW4gOiB+fmVuZFxuXG4gIGlmIChzdGFydCA8IDApIHtcbiAgICBzdGFydCArPSBsZW5cbiAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgfSBlbHNlIGlmIChzdGFydCA+IGxlbikge1xuICAgIHN0YXJ0ID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgMCkge1xuICAgIGVuZCArPSBsZW5cbiAgICBpZiAoZW5kIDwgMCkgZW5kID0gMFxuICB9IGVsc2UgaWYgKGVuZCA+IGxlbikge1xuICAgIGVuZCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIGNvbnN0IG5ld0J1ZiA9IHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZClcbiAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAgT2JqZWN0LnNldFByb3RvdHlwZU9mKG5ld0J1ZiwgQnVmZmVyLnByb3RvdHlwZSlcblxuICByZXR1cm4gbmV3QnVmXG59XG5cbi8qXG4gKiBOZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGJ1ZmZlciBpc24ndCB0cnlpbmcgdG8gd3JpdGUgb3V0IG9mIGJvdW5kcy5cbiAqL1xuZnVuY3Rpb24gY2hlY2tPZmZzZXQgKG9mZnNldCwgZXh0LCBsZW5ndGgpIHtcbiAgaWYgKChvZmZzZXQgJSAxKSAhPT0gMCB8fCBvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb2Zmc2V0IGlzIG5vdCB1aW50JylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RyeWluZyB0byBhY2Nlc3MgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVaW50TEUgPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludExFID0gZnVuY3Rpb24gcmVhZFVJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICBsZXQgdmFsID0gdGhpc1tvZmZzZXRdXG4gIGxldCBtdWwgPSAxXG4gIGxldCBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVpbnRCRSA9XG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50QkUgPSBmdW5jdGlvbiByZWFkVUludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcbiAgfVxuXG4gIGxldCB2YWwgPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF1cbiAgbGV0IG11bCA9IDFcbiAgd2hpbGUgKGJ5dGVMZW5ndGggPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVaW50OCA9XG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIHJlYWRVSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVaW50MTZMRSA9XG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVpbnQxNkJFID1cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCA4KSB8IHRoaXNbb2Zmc2V0ICsgMV1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludDMyTEUgPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiByZWFkVUludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICgodGhpc1tvZmZzZXRdKSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikpICtcbiAgICAgICh0aGlzW29mZnNldCArIDNdICogMHgxMDAwMDAwKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVaW50MzJCRSA9XG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSAqIDB4MTAwMDAwMCkgK1xuICAgICgodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICB0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRCaWdVSW50NjRMRSA9IGRlZmluZUJpZ0ludE1ldGhvZChmdW5jdGlvbiByZWFkQmlnVUludDY0TEUgKG9mZnNldCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgdmFsaWRhdGVOdW1iZXIob2Zmc2V0LCAnb2Zmc2V0JylcbiAgY29uc3QgZmlyc3QgPSB0aGlzW29mZnNldF1cbiAgY29uc3QgbGFzdCA9IHRoaXNbb2Zmc2V0ICsgN11cbiAgaWYgKGZpcnN0ID09PSB1bmRlZmluZWQgfHwgbGFzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYm91bmRzRXJyb3Iob2Zmc2V0LCB0aGlzLmxlbmd0aCAtIDgpXG4gIH1cblxuICBjb25zdCBsbyA9IGZpcnN0ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogOCArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDE2ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogMjRcblxuICBjb25zdCBoaSA9IHRoaXNbKytvZmZzZXRdICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogOCArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDE2ICtcbiAgICBsYXN0ICogMiAqKiAyNFxuXG4gIHJldHVybiBCaWdJbnQobG8pICsgKEJpZ0ludChoaSkgPDwgQmlnSW50KDMyKSlcbn0pXG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEJpZ1VJbnQ2NEJFID0gZGVmaW5lQmlnSW50TWV0aG9kKGZ1bmN0aW9uIHJlYWRCaWdVSW50NjRCRSAob2Zmc2V0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICB2YWxpZGF0ZU51bWJlcihvZmZzZXQsICdvZmZzZXQnKVxuICBjb25zdCBmaXJzdCA9IHRoaXNbb2Zmc2V0XVxuICBjb25zdCBsYXN0ID0gdGhpc1tvZmZzZXQgKyA3XVxuICBpZiAoZmlyc3QgPT09IHVuZGVmaW5lZCB8fCBsYXN0ID09PSB1bmRlZmluZWQpIHtcbiAgICBib3VuZHNFcnJvcihvZmZzZXQsIHRoaXMubGVuZ3RoIC0gOClcbiAgfVxuXG4gIGNvbnN0IGhpID0gZmlyc3QgKiAyICoqIDI0ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogMTYgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiA4ICtcbiAgICB0aGlzWysrb2Zmc2V0XVxuXG4gIGNvbnN0IGxvID0gdGhpc1srK29mZnNldF0gKiAyICoqIDI0ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogMTYgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiA4ICtcbiAgICBsYXN0XG5cbiAgcmV0dXJuIChCaWdJbnQoaGkpIDw8IEJpZ0ludCgzMikpICsgQmlnSW50KGxvKVxufSlcblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50TEUgPSBmdW5jdGlvbiByZWFkSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgbGV0IHZhbCA9IHRoaXNbb2Zmc2V0XVxuICBsZXQgbXVsID0gMVxuICBsZXQgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludEJFID0gZnVuY3Rpb24gcmVhZEludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIGxldCBpID0gYnl0ZUxlbmd0aFxuICBsZXQgbXVsID0gMVxuICBsZXQgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWldXG4gIHdoaWxlIChpID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0taV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gcmVhZEludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIGlmICghKHRoaXNbb2Zmc2V0XSAmIDB4ODApKSByZXR1cm4gKHRoaXNbb2Zmc2V0XSlcbiAgcmV0dXJuICgoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTEpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiByZWFkSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgY29uc3QgdmFsID0gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gcmVhZEludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIGNvbnN0IHZhbCA9IHRoaXNbb2Zmc2V0ICsgMV0gfCAodGhpc1tvZmZzZXRdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdKSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10gPDwgMjQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiByZWFkSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCAyNCkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRCaWdJbnQ2NExFID0gZGVmaW5lQmlnSW50TWV0aG9kKGZ1bmN0aW9uIHJlYWRCaWdJbnQ2NExFIChvZmZzZXQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIHZhbGlkYXRlTnVtYmVyKG9mZnNldCwgJ29mZnNldCcpXG4gIGNvbnN0IGZpcnN0ID0gdGhpc1tvZmZzZXRdXG4gIGNvbnN0IGxhc3QgPSB0aGlzW29mZnNldCArIDddXG4gIGlmIChmaXJzdCA9PT0gdW5kZWZpbmVkIHx8IGxhc3QgPT09IHVuZGVmaW5lZCkge1xuICAgIGJvdW5kc0Vycm9yKG9mZnNldCwgdGhpcy5sZW5ndGggLSA4KVxuICB9XG5cbiAgY29uc3QgdmFsID0gdGhpc1tvZmZzZXQgKyA0XSArXG4gICAgdGhpc1tvZmZzZXQgKyA1XSAqIDIgKiogOCArXG4gICAgdGhpc1tvZmZzZXQgKyA2XSAqIDIgKiogMTYgK1xuICAgIChsYXN0IDw8IDI0KSAvLyBPdmVyZmxvd1xuXG4gIHJldHVybiAoQmlnSW50KHZhbCkgPDwgQmlnSW50KDMyKSkgK1xuICAgIEJpZ0ludChmaXJzdCArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDggK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAxNiArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDI0KVxufSlcblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkQmlnSW50NjRCRSA9IGRlZmluZUJpZ0ludE1ldGhvZChmdW5jdGlvbiByZWFkQmlnSW50NjRCRSAob2Zmc2V0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICB2YWxpZGF0ZU51bWJlcihvZmZzZXQsICdvZmZzZXQnKVxuICBjb25zdCBmaXJzdCA9IHRoaXNbb2Zmc2V0XVxuICBjb25zdCBsYXN0ID0gdGhpc1tvZmZzZXQgKyA3XVxuICBpZiAoZmlyc3QgPT09IHVuZGVmaW5lZCB8fCBsYXN0ID09PSB1bmRlZmluZWQpIHtcbiAgICBib3VuZHNFcnJvcihvZmZzZXQsIHRoaXMubGVuZ3RoIC0gOClcbiAgfVxuXG4gIGNvbnN0IHZhbCA9IChmaXJzdCA8PCAyNCkgKyAvLyBPdmVyZmxvd1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAxNiArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDggK1xuICAgIHRoaXNbKytvZmZzZXRdXG5cbiAgcmV0dXJuIChCaWdJbnQodmFsKSA8PCBCaWdJbnQoMzIpKSArXG4gICAgQmlnSW50KHRoaXNbKytvZmZzZXRdICogMiAqKiAyNCArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDE2ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogOCArXG4gICAgbGFzdClcbn0pXG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiByZWFkRmxvYXRMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gcmVhZEZsb2F0QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gcmVhZERvdWJsZUxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gcmVhZERvdWJsZUJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDUyLCA4KVxufVxuXG5mdW5jdGlvbiBjaGVja0ludCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiYnVmZmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlciBpbnN0YW5jZScpXG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1widmFsdWVcIiBhcmd1bWVudCBpcyBvdXQgb2YgYm91bmRzJylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVWludExFID1cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjb25zdCBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIGxldCBtdWwgPSAxXG4gIGxldCBpID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVaW50QkUgPVxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlVUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNvbnN0IG1heEJ5dGVzID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpIC0gMVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG1heEJ5dGVzLCAwKVxuICB9XG5cbiAgbGV0IGkgPSBieXRlTGVuZ3RoIC0gMVxuICBsZXQgbXVsID0gMVxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVpbnQ4ID1cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uIHdyaXRlVUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweGZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVWludDE2TEUgPVxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVpbnQxNkJFID1cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVaW50MzJMRSA9XG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVWludDMyQkUgPVxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuZnVuY3Rpb24gd3J0QmlnVUludDY0TEUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbWluLCBtYXgpIHtcbiAgY2hlY2tJbnRCSSh2YWx1ZSwgbWluLCBtYXgsIGJ1Ziwgb2Zmc2V0LCA3KVxuXG4gIGxldCBsbyA9IE51bWJlcih2YWx1ZSAmIEJpZ0ludCgweGZmZmZmZmZmKSlcbiAgYnVmW29mZnNldCsrXSA9IGxvXG4gIGxvID0gbG8gPj4gOFxuICBidWZbb2Zmc2V0KytdID0gbG9cbiAgbG8gPSBsbyA+PiA4XG4gIGJ1ZltvZmZzZXQrK10gPSBsb1xuICBsbyA9IGxvID4+IDhcbiAgYnVmW29mZnNldCsrXSA9IGxvXG4gIGxldCBoaSA9IE51bWJlcih2YWx1ZSA+PiBCaWdJbnQoMzIpICYgQmlnSW50KDB4ZmZmZmZmZmYpKVxuICBidWZbb2Zmc2V0KytdID0gaGlcbiAgaGkgPSBoaSA+PiA4XG4gIGJ1ZltvZmZzZXQrK10gPSBoaVxuICBoaSA9IGhpID4+IDhcbiAgYnVmW29mZnNldCsrXSA9IGhpXG4gIGhpID0gaGkgPj4gOFxuICBidWZbb2Zmc2V0KytdID0gaGlcbiAgcmV0dXJuIG9mZnNldFxufVxuXG5mdW5jdGlvbiB3cnRCaWdVSW50NjRCRSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBtaW4sIG1heCkge1xuICBjaGVja0ludEJJKHZhbHVlLCBtaW4sIG1heCwgYnVmLCBvZmZzZXQsIDcpXG5cbiAgbGV0IGxvID0gTnVtYmVyKHZhbHVlICYgQmlnSW50KDB4ZmZmZmZmZmYpKVxuICBidWZbb2Zmc2V0ICsgN10gPSBsb1xuICBsbyA9IGxvID4+IDhcbiAgYnVmW29mZnNldCArIDZdID0gbG9cbiAgbG8gPSBsbyA+PiA4XG4gIGJ1ZltvZmZzZXQgKyA1XSA9IGxvXG4gIGxvID0gbG8gPj4gOFxuICBidWZbb2Zmc2V0ICsgNF0gPSBsb1xuICBsZXQgaGkgPSBOdW1iZXIodmFsdWUgPj4gQmlnSW50KDMyKSAmIEJpZ0ludCgweGZmZmZmZmZmKSlcbiAgYnVmW29mZnNldCArIDNdID0gaGlcbiAgaGkgPSBoaSA+PiA4XG4gIGJ1ZltvZmZzZXQgKyAyXSA9IGhpXG4gIGhpID0gaGkgPj4gOFxuICBidWZbb2Zmc2V0ICsgMV0gPSBoaVxuICBoaSA9IGhpID4+IDhcbiAgYnVmW29mZnNldF0gPSBoaVxuICByZXR1cm4gb2Zmc2V0ICsgOFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlQmlnVUludDY0TEUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gd3JpdGVCaWdVSW50NjRMRSAodmFsdWUsIG9mZnNldCA9IDApIHtcbiAgcmV0dXJuIHdydEJpZ1VJbnQ2NExFKHRoaXMsIHZhbHVlLCBvZmZzZXQsIEJpZ0ludCgwKSwgQmlnSW50KCcweGZmZmZmZmZmZmZmZmZmZmYnKSlcbn0pXG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVCaWdVSW50NjRCRSA9IGRlZmluZUJpZ0ludE1ldGhvZChmdW5jdGlvbiB3cml0ZUJpZ1VJbnQ2NEJFICh2YWx1ZSwgb2Zmc2V0ID0gMCkge1xuICByZXR1cm4gd3J0QmlnVUludDY0QkUodGhpcywgdmFsdWUsIG9mZnNldCwgQmlnSW50KDApLCBCaWdJbnQoJzB4ZmZmZmZmZmZmZmZmZmZmZicpKVxufSlcblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludExFID0gZnVuY3Rpb24gd3JpdGVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjb25zdCBsaW1pdCA9IE1hdGgucG93KDIsICg4ICogYnl0ZUxlbmd0aCkgLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICBsZXQgaSA9IDBcbiAgbGV0IG11bCA9IDFcbiAgbGV0IHN1YiA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgaWYgKHZhbHVlIDwgMCAmJiBzdWIgPT09IDAgJiYgdGhpc1tvZmZzZXQgKyBpIC0gMV0gIT09IDApIHtcbiAgICAgIHN1YiA9IDFcbiAgICB9XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludEJFID0gZnVuY3Rpb24gd3JpdGVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjb25zdCBsaW1pdCA9IE1hdGgucG93KDIsICg4ICogYnl0ZUxlbmd0aCkgLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICBsZXQgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIGxldCBtdWwgPSAxXG4gIGxldCBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0ICsgaV0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKC0taSA+PSAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgaWYgKHZhbHVlIDwgMCAmJiBzdWIgPT09IDAgJiYgdGhpc1tvZmZzZXQgKyBpICsgMV0gIT09IDApIHtcbiAgICAgIHN1YiA9IDFcbiAgICB9XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiB3cml0ZUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweDdmLCAtMHg4MClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmICsgdmFsdWUgKyAxXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiB3cml0ZUludDMyTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDFcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlQmlnSW50NjRMRSA9IGRlZmluZUJpZ0ludE1ldGhvZChmdW5jdGlvbiB3cml0ZUJpZ0ludDY0TEUgKHZhbHVlLCBvZmZzZXQgPSAwKSB7XG4gIHJldHVybiB3cnRCaWdVSW50NjRMRSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAtQmlnSW50KCcweDgwMDAwMDAwMDAwMDAwMDAnKSwgQmlnSW50KCcweDdmZmZmZmZmZmZmZmZmZmYnKSlcbn0pXG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVCaWdJbnQ2NEJFID0gZGVmaW5lQmlnSW50TWV0aG9kKGZ1bmN0aW9uIHdyaXRlQmlnSW50NjRCRSAodmFsdWUsIG9mZnNldCA9IDApIHtcbiAgcmV0dXJuIHdydEJpZ1VJbnQ2NEJFKHRoaXMsIHZhbHVlLCBvZmZzZXQsIC1CaWdJbnQoJzB4ODAwMDAwMDAwMDAwMDAwMCcpLCBCaWdJbnQoJzB4N2ZmZmZmZmZmZmZmZmZmZicpKVxufSlcblxuZnVuY3Rpb24gY2hlY2tJRUVFNzU0IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxuICBpZiAob2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDQsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gd3JpdGVGbG9hdEJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA4LCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxuICByZXR1cm4gb2Zmc2V0ICsgOFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uIGNvcHkgKHRhcmdldCwgdGFyZ2V0U3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGFyZ2V0KSkgdGhyb3cgbmV3IFR5cGVFcnJvcignYXJndW1lbnQgc2hvdWxkIGJlIGEgQnVmZmVyJylcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldFN0YXJ0ID49IHRhcmdldC5sZW5ndGgpIHRhcmdldFN0YXJ0ID0gdGFyZ2V0Lmxlbmd0aFxuICBpZiAoIXRhcmdldFN0YXJ0KSB0YXJnZXRTdGFydCA9IDBcbiAgaWYgKGVuZCA+IDAgJiYgZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm4gMFxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCB0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGlmICh0YXJnZXRTdGFydCA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcigndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIH1cbiAgaWYgKHN0YXJ0IDwgMCB8fCBzdGFydCA+PSB0aGlzLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG4gIGlmIChlbmQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCA8IGVuZCAtIHN0YXJ0KSB7XG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0ICsgc3RhcnRcbiAgfVxuXG4gIGNvbnN0IGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCAmJiB0eXBlb2YgVWludDhBcnJheS5wcm90b3R5cGUuY29weVdpdGhpbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIFVzZSBidWlsdC1pbiB3aGVuIGF2YWlsYWJsZSwgbWlzc2luZyBmcm9tIElFMTFcbiAgICB0aGlzLmNvcHlXaXRoaW4odGFyZ2V0U3RhcnQsIHN0YXJ0LCBlbmQpXG4gIH0gZWxzZSB7XG4gICAgVWludDhBcnJheS5wcm90b3R5cGUuc2V0LmNhbGwoXG4gICAgICB0YXJnZXQsXG4gICAgICB0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpLFxuICAgICAgdGFyZ2V0U3RhcnRcbiAgICApXG4gIH1cblxuICByZXR1cm4gbGVuXG59XG5cbi8vIFVzYWdlOlxuLy8gICAgYnVmZmVyLmZpbGwobnVtYmVyWywgb2Zmc2V0WywgZW5kXV0pXG4vLyAgICBidWZmZXIuZmlsbChidWZmZXJbLCBvZmZzZXRbLCBlbmRdXSlcbi8vICAgIGJ1ZmZlci5maWxsKHN0cmluZ1ssIG9mZnNldFssIGVuZF1dWywgZW5jb2RpbmddKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gZmlsbCAodmFsLCBzdGFydCwgZW5kLCBlbmNvZGluZykge1xuICAvLyBIYW5kbGUgc3RyaW5nIGNhc2VzOlxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAodHlwZW9mIHN0YXJ0ID09PSAnc3RyaW5nJykge1xuICAgICAgZW5jb2RpbmcgPSBzdGFydFxuICAgICAgc3RhcnQgPSAwXG4gICAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGVuZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gZW5kXG4gICAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICAgIH1cbiAgICBpZiAoZW5jb2RpbmcgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgZW5jb2RpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdlbmNvZGluZyBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBlbmNvZGluZyA9PT0gJ3N0cmluZycgJiYgIUJ1ZmZlci5pc0VuY29kaW5nKGVuY29kaW5nKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgIH1cbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMSkge1xuICAgICAgY29uc3QgY29kZSA9IHZhbC5jaGFyQ29kZUF0KDApXG4gICAgICBpZiAoKGVuY29kaW5nID09PSAndXRmOCcgJiYgY29kZSA8IDEyOCkgfHxcbiAgICAgICAgICBlbmNvZGluZyA9PT0gJ2xhdGluMScpIHtcbiAgICAgICAgLy8gRmFzdCBwYXRoOiBJZiBgdmFsYCBmaXRzIGludG8gYSBzaW5nbGUgYnl0ZSwgdXNlIHRoYXQgbnVtZXJpYyB2YWx1ZS5cbiAgICAgICAgdmFsID0gY29kZVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHZhbCA9IHZhbCAmIDI1NVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdib29sZWFuJykge1xuICAgIHZhbCA9IE51bWJlcih2YWwpXG4gIH1cblxuICAvLyBJbnZhbGlkIHJhbmdlcyBhcmUgbm90IHNldCB0byBhIGRlZmF1bHQsIHNvIGNhbiByYW5nZSBjaGVjayBlYXJseS5cbiAgaWYgKHN0YXJ0IDwgMCB8fCB0aGlzLmxlbmd0aCA8IHN0YXJ0IHx8IHRoaXMubGVuZ3RoIDwgZW5kKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ091dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHN0YXJ0ID0gc3RhcnQgPj4+IDBcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyB0aGlzLmxlbmd0aCA6IGVuZCA+Pj4gMFxuXG4gIGlmICghdmFsKSB2YWwgPSAwXG5cbiAgbGV0IGlcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgZm9yIChpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgICAgdGhpc1tpXSA9IHZhbFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zdCBieXRlcyA9IEJ1ZmZlci5pc0J1ZmZlcih2YWwpXG4gICAgICA/IHZhbFxuICAgICAgOiBCdWZmZXIuZnJvbSh2YWwsIGVuY29kaW5nKVxuICAgIGNvbnN0IGxlbiA9IGJ5dGVzLmxlbmd0aFxuICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSB2YWx1ZSBcIicgKyB2YWwgK1xuICAgICAgICAnXCIgaXMgaW52YWxpZCBmb3IgYXJndW1lbnQgXCJ2YWx1ZVwiJylcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IGVuZCAtIHN0YXJ0OyArK2kpIHtcbiAgICAgIHRoaXNbaSArIHN0YXJ0XSA9IGJ5dGVzW2kgJSBsZW5dXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLy8gQ1VTVE9NIEVSUk9SU1xuLy8gPT09PT09PT09PT09PVxuXG4vLyBTaW1wbGlmaWVkIHZlcnNpb25zIGZyb20gTm9kZSwgY2hhbmdlZCBmb3IgQnVmZmVyLW9ubHkgdXNhZ2VcbmNvbnN0IGVycm9ycyA9IHt9XG5mdW5jdGlvbiBFIChzeW0sIGdldE1lc3NhZ2UsIEJhc2UpIHtcbiAgZXJyb3JzW3N5bV0gPSBjbGFzcyBOb2RlRXJyb3IgZXh0ZW5kcyBCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgICBzdXBlcigpXG5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnbWVzc2FnZScsIHtcbiAgICAgICAgdmFsdWU6IGdldE1lc3NhZ2UuYXBwbHkodGhpcywgYXJndW1lbnRzKSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfSlcblxuICAgICAgLy8gQWRkIHRoZSBlcnJvciBjb2RlIHRvIHRoZSBuYW1lIHRvIGluY2x1ZGUgaXQgaW4gdGhlIHN0YWNrIHRyYWNlLlxuICAgICAgdGhpcy5uYW1lID0gYCR7dGhpcy5uYW1lfSBbJHtzeW19XWBcbiAgICAgIC8vIEFjY2VzcyB0aGUgc3RhY2sgdG8gZ2VuZXJhdGUgdGhlIGVycm9yIG1lc3NhZ2UgaW5jbHVkaW5nIHRoZSBlcnJvciBjb2RlXG4gICAgICAvLyBmcm9tIHRoZSBuYW1lLlxuICAgICAgdGhpcy5zdGFjayAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC1leHByZXNzaW9uc1xuICAgICAgLy8gUmVzZXQgdGhlIG5hbWUgdG8gdGhlIGFjdHVhbCBuYW1lLlxuICAgICAgZGVsZXRlIHRoaXMubmFtZVxuICAgIH1cblxuICAgIGdldCBjb2RlICgpIHtcbiAgICAgIHJldHVybiBzeW1cbiAgICB9XG5cbiAgICBzZXQgY29kZSAodmFsdWUpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnY29kZScsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdG9TdHJpbmcgKCkge1xuICAgICAgcmV0dXJuIGAke3RoaXMubmFtZX0gWyR7c3ltfV06ICR7dGhpcy5tZXNzYWdlfWBcbiAgICB9XG4gIH1cbn1cblxuRSgnRVJSX0JVRkZFUl9PVVRfT0ZfQk9VTkRTJyxcbiAgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBpZiAobmFtZSkge1xuICAgICAgcmV0dXJuIGAke25hbWV9IGlzIG91dHNpZGUgb2YgYnVmZmVyIGJvdW5kc2BcbiAgICB9XG5cbiAgICByZXR1cm4gJ0F0dGVtcHQgdG8gYWNjZXNzIG1lbW9yeSBvdXRzaWRlIGJ1ZmZlciBib3VuZHMnXG4gIH0sIFJhbmdlRXJyb3IpXG5FKCdFUlJfSU5WQUxJRF9BUkdfVFlQRScsXG4gIGZ1bmN0aW9uIChuYW1lLCBhY3R1YWwpIHtcbiAgICByZXR1cm4gYFRoZSBcIiR7bmFtZX1cIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgbnVtYmVyLiBSZWNlaXZlZCB0eXBlICR7dHlwZW9mIGFjdHVhbH1gXG4gIH0sIFR5cGVFcnJvcilcbkUoJ0VSUl9PVVRfT0ZfUkFOR0UnLFxuICBmdW5jdGlvbiAoc3RyLCByYW5nZSwgaW5wdXQpIHtcbiAgICBsZXQgbXNnID0gYFRoZSB2YWx1ZSBvZiBcIiR7c3RyfVwiIGlzIG91dCBvZiByYW5nZS5gXG4gICAgbGV0IHJlY2VpdmVkID0gaW5wdXRcbiAgICBpZiAoTnVtYmVyLmlzSW50ZWdlcihpbnB1dCkgJiYgTWF0aC5hYnMoaW5wdXQpID4gMiAqKiAzMikge1xuICAgICAgcmVjZWl2ZWQgPSBhZGROdW1lcmljYWxTZXBhcmF0b3IoU3RyaW5nKGlucHV0KSlcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ2JpZ2ludCcpIHtcbiAgICAgIHJlY2VpdmVkID0gU3RyaW5nKGlucHV0KVxuICAgICAgaWYgKGlucHV0ID4gQmlnSW50KDIpICoqIEJpZ0ludCgzMikgfHwgaW5wdXQgPCAtKEJpZ0ludCgyKSAqKiBCaWdJbnQoMzIpKSkge1xuICAgICAgICByZWNlaXZlZCA9IGFkZE51bWVyaWNhbFNlcGFyYXRvcihyZWNlaXZlZClcbiAgICAgIH1cbiAgICAgIHJlY2VpdmVkICs9ICduJ1xuICAgIH1cbiAgICBtc2cgKz0gYCBJdCBtdXN0IGJlICR7cmFuZ2V9LiBSZWNlaXZlZCAke3JlY2VpdmVkfWBcbiAgICByZXR1cm4gbXNnXG4gIH0sIFJhbmdlRXJyb3IpXG5cbmZ1bmN0aW9uIGFkZE51bWVyaWNhbFNlcGFyYXRvciAodmFsKSB7XG4gIGxldCByZXMgPSAnJ1xuICBsZXQgaSA9IHZhbC5sZW5ndGhcbiAgY29uc3Qgc3RhcnQgPSB2YWxbMF0gPT09ICctJyA/IDEgOiAwXG4gIGZvciAoOyBpID49IHN0YXJ0ICsgNDsgaSAtPSAzKSB7XG4gICAgcmVzID0gYF8ke3ZhbC5zbGljZShpIC0gMywgaSl9JHtyZXN9YFxuICB9XG4gIHJldHVybiBgJHt2YWwuc2xpY2UoMCwgaSl9JHtyZXN9YFxufVxuXG4vLyBDSEVDSyBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBjaGVja0JvdW5kcyAoYnVmLCBvZmZzZXQsIGJ5dGVMZW5ndGgpIHtcbiAgdmFsaWRhdGVOdW1iZXIob2Zmc2V0LCAnb2Zmc2V0JylcbiAgaWYgKGJ1ZltvZmZzZXRdID09PSB1bmRlZmluZWQgfHwgYnVmW29mZnNldCArIGJ5dGVMZW5ndGhdID09PSB1bmRlZmluZWQpIHtcbiAgICBib3VuZHNFcnJvcihvZmZzZXQsIGJ1Zi5sZW5ndGggLSAoYnl0ZUxlbmd0aCArIDEpKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrSW50QkkgKHZhbHVlLCBtaW4sIG1heCwgYnVmLCBvZmZzZXQsIGJ5dGVMZW5ndGgpIHtcbiAgaWYgKHZhbHVlID4gbWF4IHx8IHZhbHVlIDwgbWluKSB7XG4gICAgY29uc3QgbiA9IHR5cGVvZiBtaW4gPT09ICdiaWdpbnQnID8gJ24nIDogJydcbiAgICBsZXQgcmFuZ2VcbiAgICBpZiAoYnl0ZUxlbmd0aCA+IDMpIHtcbiAgICAgIGlmIChtaW4gPT09IDAgfHwgbWluID09PSBCaWdJbnQoMCkpIHtcbiAgICAgICAgcmFuZ2UgPSBgPj0gMCR7bn0gYW5kIDwgMiR7bn0gKiogJHsoYnl0ZUxlbmd0aCArIDEpICogOH0ke259YFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmFuZ2UgPSBgPj0gLSgyJHtufSAqKiAkeyhieXRlTGVuZ3RoICsgMSkgKiA4IC0gMX0ke259KSBhbmQgPCAyICoqIGAgK1xuICAgICAgICAgICAgICAgIGAkeyhieXRlTGVuZ3RoICsgMSkgKiA4IC0gMX0ke259YFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByYW5nZSA9IGA+PSAke21pbn0ke259IGFuZCA8PSAke21heH0ke259YFxuICAgIH1cbiAgICB0aHJvdyBuZXcgZXJyb3JzLkVSUl9PVVRfT0ZfUkFOR0UoJ3ZhbHVlJywgcmFuZ2UsIHZhbHVlKVxuICB9XG4gIGNoZWNrQm91bmRzKGJ1Ziwgb2Zmc2V0LCBieXRlTGVuZ3RoKVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZU51bWJlciAodmFsdWUsIG5hbWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgZXJyb3JzLkVSUl9JTlZBTElEX0FSR19UWVBFKG5hbWUsICdudW1iZXInLCB2YWx1ZSlcbiAgfVxufVxuXG5mdW5jdGlvbiBib3VuZHNFcnJvciAodmFsdWUsIGxlbmd0aCwgdHlwZSkge1xuICBpZiAoTWF0aC5mbG9vcih2YWx1ZSkgIT09IHZhbHVlKSB7XG4gICAgdmFsaWRhdGVOdW1iZXIodmFsdWUsIHR5cGUpXG4gICAgdGhyb3cgbmV3IGVycm9ycy5FUlJfT1VUX09GX1JBTkdFKHR5cGUgfHwgJ29mZnNldCcsICdhbiBpbnRlZ2VyJywgdmFsdWUpXG4gIH1cblxuICBpZiAobGVuZ3RoIDwgMCkge1xuICAgIHRocm93IG5ldyBlcnJvcnMuRVJSX0JVRkZFUl9PVVRfT0ZfQk9VTkRTKClcbiAgfVxuXG4gIHRocm93IG5ldyBlcnJvcnMuRVJSX09VVF9PRl9SQU5HRSh0eXBlIHx8ICdvZmZzZXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYD49ICR7dHlwZSA/IDEgOiAwfSBhbmQgPD0gJHtsZW5ndGh9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlKVxufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbmNvbnN0IElOVkFMSURfQkFTRTY0X1JFID0gL1teKy8wLTlBLVphLXotX10vZ1xuXG5mdW5jdGlvbiBiYXNlNjRjbGVhbiAoc3RyKSB7XG4gIC8vIE5vZGUgdGFrZXMgZXF1YWwgc2lnbnMgYXMgZW5kIG9mIHRoZSBCYXNlNjQgZW5jb2RpbmdcbiAgc3RyID0gc3RyLnNwbGl0KCc9JylbMF1cbiAgLy8gTm9kZSBzdHJpcHMgb3V0IGludmFsaWQgY2hhcmFjdGVycyBsaWtlIFxcbiBhbmQgXFx0IGZyb20gdGhlIHN0cmluZywgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHN0ciA9IHN0ci50cmltKCkucmVwbGFjZShJTlZBTElEX0JBU0U2NF9SRSwgJycpXG4gIC8vIE5vZGUgY29udmVydHMgc3RyaW5ncyB3aXRoIGxlbmd0aCA8IDIgdG8gJydcbiAgaWYgKHN0ci5sZW5ndGggPCAyKSByZXR1cm4gJydcbiAgLy8gTm9kZSBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgYmFzZTY0IHN0cmluZ3MgKG1pc3NpbmcgdHJhaWxpbmcgPT09KSwgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHdoaWxlIChzdHIubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgIHN0ciA9IHN0ciArICc9J1xuICB9XG4gIHJldHVybiBzdHJcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cmluZywgdW5pdHMpIHtcbiAgdW5pdHMgPSB1bml0cyB8fCBJbmZpbml0eVxuICBsZXQgY29kZVBvaW50XG4gIGNvbnN0IGxlbmd0aCA9IHN0cmluZy5sZW5ndGhcbiAgbGV0IGxlYWRTdXJyb2dhdGUgPSBudWxsXG4gIGNvbnN0IGJ5dGVzID0gW11cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgY29kZVBvaW50ID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcblxuICAgIC8vIGlzIHN1cnJvZ2F0ZSBjb21wb25lbnRcbiAgICBpZiAoY29kZVBvaW50ID4gMHhEN0ZGICYmIGNvZGVQb2ludCA8IDB4RTAwMCkge1xuICAgICAgLy8gbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICghbGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgICAvLyBubyBsZWFkIHlldFxuICAgICAgICBpZiAoY29kZVBvaW50ID4gMHhEQkZGKSB7XG4gICAgICAgICAgLy8gdW5leHBlY3RlZCB0cmFpbFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSBpZiAoaSArIDEgPT09IGxlbmd0aCkge1xuICAgICAgICAgIC8vIHVucGFpcmVkIGxlYWRcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdmFsaWQgbGVhZFxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gMiBsZWFkcyBpbiBhIHJvd1xuICAgICAgaWYgKGNvZGVQb2ludCA8IDB4REMwMCkge1xuICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyB2YWxpZCBzdXJyb2dhdGUgcGFpclxuICAgICAgY29kZVBvaW50ID0gKGxlYWRTdXJyb2dhdGUgLSAweEQ4MDAgPDwgMTAgfCBjb2RlUG9pbnQgLSAweERDMDApICsgMHgxMDAwMFxuICAgIH0gZWxzZSBpZiAobGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgLy8gdmFsaWQgYm1wIGNoYXIsIGJ1dCBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgfVxuXG4gICAgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcblxuICAgIC8vIGVuY29kZSB1dGY4XG4gICAgaWYgKGNvZGVQb2ludCA8IDB4ODApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMSkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChjb2RlUG9pbnQpXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDgwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2IHwgMHhDMCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyB8IDB4RTAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDQpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDEyIHwgMHhGMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb2RlIHBvaW50JylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnl0ZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgY29uc3QgYnl0ZUFycmF5ID0gW11cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyLCB1bml0cykge1xuICBsZXQgYywgaGksIGxvXG4gIGNvbnN0IGJ5dGVBcnJheSA9IFtdXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG5cbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShiYXNlNjRjbGVhbihzdHIpKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgbGV0IGlcbiAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKSBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbi8vIEFycmF5QnVmZmVyIG9yIFVpbnQ4QXJyYXkgb2JqZWN0cyBmcm9tIG90aGVyIGNvbnRleHRzIChpLmUuIGlmcmFtZXMpIGRvIG5vdCBwYXNzXG4vLyB0aGUgYGluc3RhbmNlb2ZgIGNoZWNrIGJ1dCB0aGV5IHNob3VsZCBiZSB0cmVhdGVkIGFzIG9mIHRoYXQgdHlwZS5cbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvaXNzdWVzLzE2NlxuZnVuY3Rpb24gaXNJbnN0YW5jZSAob2JqLCB0eXBlKSB7XG4gIHJldHVybiBvYmogaW5zdGFuY2VvZiB0eXBlIHx8XG4gICAgKG9iaiAhPSBudWxsICYmIG9iai5jb25zdHJ1Y3RvciAhPSBudWxsICYmIG9iai5jb25zdHJ1Y3Rvci5uYW1lICE9IG51bGwgJiZcbiAgICAgIG9iai5jb25zdHJ1Y3Rvci5uYW1lID09PSB0eXBlLm5hbWUpXG59XG5mdW5jdGlvbiBudW1iZXJJc05hTiAob2JqKSB7XG4gIC8vIEZvciBJRTExIHN1cHBvcnRcbiAgcmV0dXJuIG9iaiAhPT0gb2JqIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2VsZi1jb21wYXJlXG59XG5cbi8vIENyZWF0ZSBsb29rdXAgdGFibGUgZm9yIGB0b1N0cmluZygnaGV4JylgXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL2lzc3Vlcy8yMTlcbmNvbnN0IGhleFNsaWNlTG9va3VwVGFibGUgPSAoZnVuY3Rpb24gKCkge1xuICBjb25zdCBhbHBoYWJldCA9ICcwMTIzNDU2Nzg5YWJjZGVmJ1xuICBjb25zdCB0YWJsZSA9IG5ldyBBcnJheSgyNTYpXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTY7ICsraSkge1xuICAgIGNvbnN0IGkxNiA9IGkgKiAxNlxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgMTY7ICsraikge1xuICAgICAgdGFibGVbaTE2ICsgal0gPSBhbHBoYWJldFtpXSArIGFscGhhYmV0W2pdXG4gICAgfVxuICB9XG4gIHJldHVybiB0YWJsZVxufSkoKVxuXG4vLyBSZXR1cm4gbm90IGZ1bmN0aW9uIHdpdGggRXJyb3IgaWYgQmlnSW50IG5vdCBzdXBwb3J0ZWRcbmZ1bmN0aW9uIGRlZmluZUJpZ0ludE1ldGhvZCAoZm4pIHtcbiAgcmV0dXJuIHR5cGVvZiBCaWdJbnQgPT09ICd1bmRlZmluZWQnID8gQnVmZmVyQmlnSW50Tm90RGVmaW5lZCA6IGZuXG59XG5cbmZ1bmN0aW9uIEJ1ZmZlckJpZ0ludE5vdERlZmluZWQgKCkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ0JpZ0ludCBub3Qgc3VwcG9ydGVkJylcbn1cbiIsICJpbXBvcnQgeyBLSU5EUyB9IGZyb20gJy4uL3V0aWxpdGllcy91dGlscyc7XG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG5cbmNvbnN0IHN0YXRlID0ge1xuICAgIGhvc3Q6ICcnLFxuICAgIHBlcm1pc3Npb246ICcnLFxuICAgIGtleTogJycsXG4gICAgZXZlbnQ6IG51bGwsXG4gICAgcmVtZW1iZXI6IGZhbHNlLFxuICAgIHByb2ZpbGVUeXBlOiAnbG9jYWwnLFxuICAgIHF1ZXVlUG9zaXRpb246IDAsXG4gICAgcXVldWVUb3RhbDogMCxcbn07XG5cbmZ1bmN0aW9uIGdldEh1bWFuUGVybWlzc2lvbihwZXJtKSB7XG4gICAgc3dpdGNoIChwZXJtKSB7XG4gICAgICAgIGNhc2UgJ2dldFB1YktleSc6IHJldHVybiAnUmVhZCBwdWJsaWMga2V5JztcbiAgICAgICAgY2FzZSAnc2lnbkV2ZW50JzogcmV0dXJuICdTaWduIGV2ZW50JztcbiAgICAgICAgY2FzZSAnZ2V0UmVsYXlzJzogcmV0dXJuICdSZWFkIHJlbGF5IGxpc3QnO1xuICAgICAgICBjYXNlICduaXAwNC5lbmNyeXB0JzogcmV0dXJuICdFbmNyeXB0IHByaXZhdGUgbWVzc2FnZSAoTklQLTA0KSc7XG4gICAgICAgIGNhc2UgJ25pcDA0LmRlY3J5cHQnOiByZXR1cm4gJ0RlY3J5cHQgcHJpdmF0ZSBtZXNzYWdlIChOSVAtMDQpJztcbiAgICAgICAgY2FzZSAnbmlwNDQuZW5jcnlwdCc6IHJldHVybiAnRW5jcnlwdCBwcml2YXRlIG1lc3NhZ2UgKE5JUC00NCknO1xuICAgICAgICBjYXNlICduaXA0NC5kZWNyeXB0JzogcmV0dXJuICdEZWNyeXB0IHByaXZhdGUgbWVzc2FnZSAoTklQLTQ0KSc7XG4gICAgICAgIGRlZmF1bHQ6IHJldHVybiBwZXJtO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0RXZlbnRJbmZvKCkge1xuICAgIGlmIChzdGF0ZS5wZXJtaXNzaW9uICE9PSAnc2lnbkV2ZW50JyB8fCAhc3RhdGUuZXZlbnQpIHJldHVybiB7fTtcbiAgICBjb25zdCBmb3VuZCA9IEtJTkRTLmZpbmQoKFtraW5kXSkgPT4ga2luZCA9PT0gc3RhdGUuZXZlbnQua2luZCk7XG4gICAgY29uc3QgW2tpbmQsIGRlc2MsIG5pcF0gPSBmb3VuZCB8fCBbJ1Vua25vd24nLCAnVW5rbm93bicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcyddO1xuICAgIHJldHVybiB7IGtpbmQsIGRlc2MsIG5pcCB9O1xufVxuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgY29uc3QgaG9zdEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Blcm0taG9zdCcpO1xuICAgIGNvbnN0IHBlcm1FbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwZXJtLXR5cGUnKTtcbiAgICBjb25zdCBidW5rZXJOb3RpY2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnVua2VyLW5vdGljZScpO1xuICAgIGNvbnN0IGV2ZW50S2luZFJvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdldmVudC1raW5kLXJvdycpO1xuICAgIGNvbnN0IGV2ZW50UHJldmlldyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdldmVudC1wcmV2aWV3Jyk7XG4gICAgY29uc3QgZXZlbnRQcmV2aWV3UHJlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V2ZW50LXByZXZpZXctcHJlJyk7XG4gICAgY29uc3QgZXZlbnRLaW5kTGluayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdldmVudC1raW5kLWxpbmsnKTtcbiAgICBjb25zdCBieUtpbmRMYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdieS1raW5kLWxhYmVsJyk7XG5cbiAgICBpZiAoaG9zdEVsKSBob3N0RWwudGV4dENvbnRlbnQgPSBzdGF0ZS5ob3N0O1xuICAgIGlmIChwZXJtRWwpIHBlcm1FbC50ZXh0Q29udGVudCA9IGdldEh1bWFuUGVybWlzc2lvbihzdGF0ZS5wZXJtaXNzaW9uKTtcblxuICAgIGNvbnN0IHF1ZXVlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGVybS1xdWV1ZScpO1xuICAgIGlmIChxdWV1ZUVsKSB7XG4gICAgICAgIHF1ZXVlRWwudGV4dENvbnRlbnQgPSBzdGF0ZS5xdWV1ZVRvdGFsID4gMSA/IGAoJHtzdGF0ZS5xdWV1ZVBvc2l0aW9ufSBvZiAke3N0YXRlLnF1ZXVlVG90YWx9KWAgOiAnJztcbiAgICB9XG5cbiAgICBpZiAoYnVua2VyTm90aWNlKSB7XG4gICAgICAgIGJ1bmtlck5vdGljZS5zdHlsZS5kaXNwbGF5ID0gc3RhdGUucHJvZmlsZVR5cGUgPT09ICdidW5rZXInID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICB9XG5cbiAgICBjb25zdCBpc1NpZ25pbmdFdmVudCA9IHN0YXRlLnBlcm1pc3Npb24gPT09ICdzaWduRXZlbnQnO1xuICAgIGlmIChldmVudEtpbmRSb3cpIHtcbiAgICAgICAgZXZlbnRLaW5kUm93LnN0eWxlLmRpc3BsYXkgPSBpc1NpZ25pbmdFdmVudCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxuICAgIGlmIChldmVudFByZXZpZXcpIHtcbiAgICAgICAgZXZlbnRQcmV2aWV3LnN0eWxlLmRpc3BsYXkgPSBpc1NpZ25pbmdFdmVudCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxuICAgIGlmIChieUtpbmRMYWJlbCkge1xuICAgICAgICBieUtpbmRMYWJlbC5zdHlsZS5kaXNwbGF5ID0gaXNTaWduaW5nRXZlbnQgPyAnaW5saW5lJyA6ICdub25lJztcbiAgICB9XG5cbiAgICBpZiAoaXNTaWduaW5nRXZlbnQpIHtcbiAgICAgICAgY29uc3QgaW5mbyA9IGdldEV2ZW50SW5mbygpO1xuICAgICAgICBpZiAoZXZlbnRLaW5kTGluaykge1xuICAgICAgICAgICAgZXZlbnRLaW5kTGluay50ZXh0Q29udGVudCA9IGluZm8uZGVzYztcbiAgICAgICAgICAgIGV2ZW50S2luZExpbmsuaHJlZiA9IGluZm8ubmlwO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudFByZXZpZXdQcmUpIHtcbiAgICAgICAgICAgIGV2ZW50UHJldmlld1ByZS50ZXh0Q29udGVudCA9IEpTT04uc3RyaW5naWZ5KHN0YXRlLmV2ZW50LCBudWxsLCAyKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gYWxsb3coKSB7XG4gICAgY29uc29sZS5sb2coJ2FsbG93aW5nJyk7XG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBraW5kOiAnYWxsb3dlZCcsXG4gICAgICAgIHBheWxvYWQ6IHN0YXRlLmtleSxcbiAgICAgICAgb3JpZ0tpbmQ6IHN0YXRlLnBlcm1pc3Npb24sXG4gICAgICAgIGV2ZW50OiBzdGF0ZS5ldmVudCxcbiAgICAgICAgcmVtZW1iZXI6IHN0YXRlLnJlbWVtYmVyLFxuICAgICAgICBob3N0OiBzdGF0ZS5ob3N0LFxuICAgIH0pO1xuICAgIGNvbnNvbGUubG9nKCdjbG9zaW5nJyk7XG4gICAgYXdhaXQgY2xvc2VUYWIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZGVueSgpIHtcbiAgICBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIGtpbmQ6ICdkZW5pZWQnLFxuICAgICAgICBwYXlsb2FkOiBzdGF0ZS5rZXksXG4gICAgICAgIG9yaWdLaW5kOiBzdGF0ZS5wZXJtaXNzaW9uLFxuICAgICAgICBldmVudDogc3RhdGUuZXZlbnQsXG4gICAgICAgIHJlbWVtYmVyOiBzdGF0ZS5yZW1lbWJlcixcbiAgICAgICAgaG9zdDogc3RhdGUuaG9zdCxcbiAgICB9KTtcbiAgICBhd2FpdCBjbG9zZVRhYigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjbG9zZVRhYigpIHtcbiAgICBjb25zdCB0YWIgPSBhd2FpdCBhcGkudGFicy5nZXRDdXJyZW50KCk7XG4gICAgY29uc29sZS5sb2coJ2Nsb3NpbmcgY3VycmVudCB0YWI6ICcsIHRhYi5pZCk7XG4gICAgYXdhaXQgYXBpLnRhYnMudXBkYXRlKHRhYi5vcGVuZXJUYWJJZCwgeyBhY3RpdmU6IHRydWUgfSk7XG4gICAgd2luZG93LmNsb3NlKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIG9wZW5OaXAoKSB7XG4gICAgY29uc3QgaW5mbyA9IGdldEV2ZW50SW5mbygpO1xuICAgIGlmIChpbmZvLm5pcCkge1xuICAgICAgICBhd2FpdCBhcGkudGFicy5jcmVhdGUoeyB1cmw6IGluZm8ubmlwLCBhY3RpdmU6IHRydWUgfSk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBpbml0KCkge1xuICAgIGNvbnN0IHFzID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhsb2NhdGlvbi5zZWFyY2gpO1xuICAgIGNvbnNvbGUubG9nKGxvY2F0aW9uLnNlYXJjaCk7XG4gICAgc3RhdGUuaG9zdCA9IHFzLmdldCgnaG9zdCcpO1xuICAgIHN0YXRlLnBlcm1pc3Npb24gPSBxcy5nZXQoJ2tpbmQnKTtcbiAgICBzdGF0ZS5rZXkgPSBxcy5nZXQoJ3V1aWQnKTtcbiAgICBzdGF0ZS5ldmVudCA9IEpTT04ucGFyc2UocXMuZ2V0KCdwYXlsb2FkJykpO1xuICAgIHN0YXRlLnF1ZXVlUG9zaXRpb24gPSBwYXJzZUludChxcy5nZXQoJ3F1ZXVlUG9zaXRpb24nKSkgfHwgMDtcbiAgICBzdGF0ZS5xdWV1ZVRvdGFsID0gcGFyc2VJbnQocXMuZ2V0KCdxdWV1ZVRvdGFsJykpIHx8IDA7XG5cbiAgICBzdGF0ZS5wcm9maWxlVHlwZSA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ2dldFByb2ZpbGVUeXBlJyxcbiAgICB9KTtcblxuICAgIHJlbmRlcigpO1xuXG4gICAgLy8gQmluZCBldmVudHNcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWxsb3ctYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYWxsb3cpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZW55LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRlbnkpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZW1lbWJlcicpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5yZW1lbWJlciA9IGUudGFyZ2V0LmNoZWNrZWQ7XG4gICAgfSk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V2ZW50LWtpbmQtbGluaycpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgb3Blbk5pcCgpO1xuICAgIH0pO1xufVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJywgKCkgPT4ge1xuICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2Nsb3NlUHJvbXB0JyB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbn0pO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdCk7XG4iLCAiaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7IGVuY3J5cHQsIGRlY3J5cHQsIGhhc2hQYXNzd29yZCwgdmVyaWZ5UGFzc3dvcmQgfSBmcm9tICcuL2NyeXB0byc7XG5pbXBvcnQgeyBsb29rc0xpa2VTZWVkUGhyYXNlLCBpc1ZhbGlkU2VlZFBocmFzZSB9IGZyb20gJy4vc2VlZHBocmFzZSc7XG5cbmNvbnN0IERCX1ZFUlNJT04gPSA2O1xuY29uc3Qgc3RvcmFnZSA9IGFwaS5zdG9yYWdlLmxvY2FsO1xuZXhwb3J0IGNvbnN0IFJFQ09NTUVOREVEX1JFTEFZUyA9IFtcbiAgICBuZXcgVVJMKCd3c3M6Ly9yZWxheS5kYW11cy5pbycpLFxuICAgIG5ldyBVUkwoJ3dzczovL3JlbGF5LnByaW1hbC5uZXQnKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9yZWxheS5zbm9ydC5zb2NpYWwnKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9yZWxheS5nZXRhbGJ5LmNvbS92MScpLFxuICAgIG5ldyBVUkwoJ3dzczovL25vcy5sb2wnKSxcbl07XG4vLyBwcmV0dGllci1pZ25vcmVcbmV4cG9ydCBjb25zdCBLSU5EUyA9IFtcbiAgICBbMCwgJ01ldGFkYXRhJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzAxLm1kJ10sXG4gICAgWzEsICdUZXh0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzAxLm1kJ10sXG4gICAgWzIsICdSZWNvbW1lbmQgUmVsYXknLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDEubWQnXSxcbiAgICBbMywgJ0NvbnRhY3RzJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzAyLm1kJ10sXG4gICAgWzQsICdFbmNyeXB0ZWQgRGlyZWN0IE1lc3NhZ2VzJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzA0Lm1kJ10sXG4gICAgWzUsICdFdmVudCBEZWxldGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wOS5tZCddLFxuICAgIFs2LCAnUmVwb3N0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzE4Lm1kJ10sXG4gICAgWzcsICdSZWFjdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yNS5tZCddLFxuICAgIFs4LCAnQmFkZ2UgQXdhcmQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTgubWQnXSxcbiAgICBbMTYsICdHZW5lcmljIFJlcG9zdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8xOC5tZCddLFxuICAgIFs0MCwgJ0NoYW5uZWwgQ3JlYXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjgubWQnXSxcbiAgICBbNDEsICdDaGFubmVsIE1ldGFkYXRhJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzQyLCAnQ2hhbm5lbCBNZXNzYWdlJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzQzLCAnQ2hhbm5lbCBIaWRlIE1lc3NhZ2UnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjgubWQnXSxcbiAgICBbNDQsICdDaGFubmVsIE11dGUgVXNlcicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFsxMDYzLCAnRmlsZSBNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci85NC5tZCddLFxuICAgIFsxMzExLCAnTGl2ZSBDaGF0IE1lc3NhZ2UnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTMubWQnXSxcbiAgICBbMTk4NCwgJ1JlcG9ydGluZycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Ni5tZCddLFxuICAgIFsxOTg1LCAnTGFiZWwnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMzIubWQnXSxcbiAgICBbNDU1MCwgJ0NvbW11bml0eSBQb3N0IEFwcHJvdmFsJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzcyLm1kJ10sXG4gICAgWzcwMDAsICdKb2IgRmVlZGJhY2snLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvOTAubWQnXSxcbiAgICBbOTA0MSwgJ1phcCBHb2FsJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzc1Lm1kJ10sXG4gICAgWzk3MzQsICdaYXAgUmVxdWVzdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Ny5tZCddLFxuICAgIFs5NzM1LCAnWmFwJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU3Lm1kJ10sXG4gICAgWzEwMDAwLCAnTXV0ZSBMaXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUxLm1kJ10sXG4gICAgWzEwMDAxLCAnUGluIExpc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTEubWQnXSxcbiAgICBbMTAwMDIsICdSZWxheSBMaXN0IE1ldGFkYXRhJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzY1Lm1kJ10sXG4gICAgWzEzMTk0LCAnV2FsbGV0IEluZm8nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDcubWQnXSxcbiAgICBbMjIyNDIsICdDbGllbnQgQXV0aGVudGljYXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDIubWQnXSxcbiAgICBbMjMxOTQsICdXYWxsZXQgUmVxdWVzdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci80Ny5tZCddLFxuICAgIFsyMzE5NSwgJ1dhbGxldCBSZXNwb25zZScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci80Ny5tZCddLFxuICAgIFsyNDEzMywgJ05vc3RyIENvbm5lY3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDYubWQnXSxcbiAgICBbMjcyMzUsICdIVFRQIEF1dGgnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvOTgubWQnXSxcbiAgICBbMzAwMDAsICdDYXRlZ29yaXplZCBQZW9wbGUgTGlzdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81MS5tZCddLFxuICAgIFszMDAwMSwgJ0NhdGVnb3JpemVkIEJvb2ttYXJrIExpc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTEubWQnXSxcbiAgICBbMzAwMDgsICdQcm9maWxlIEJhZGdlcycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81OC5tZCddLFxuICAgIFszMDAwOSwgJ0JhZGdlIERlZmluaXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTgubWQnXSxcbiAgICBbMzAwMTcsICdDcmVhdGUgb3IgdXBkYXRlIGEgc3RhbGwnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMTUubWQnXSxcbiAgICBbMzAwMTgsICdDcmVhdGUgb3IgdXBkYXRlIGEgcHJvZHVjdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8xNS5tZCddLFxuICAgIFszMDAyMywgJ0xvbmctRm9ybSBDb250ZW50JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzIzLm1kJ10sXG4gICAgWzMwMDI0LCAnRHJhZnQgTG9uZy1mb3JtIENvbnRlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjMubWQnXSxcbiAgICBbMzAwNzgsICdBcHBsaWNhdGlvbi1zcGVjaWZpYyBEYXRhJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzc4Lm1kJ10sXG4gICAgWzMwMzExLCAnTGl2ZSBFdmVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81My5tZCddLFxuICAgIFszMDMxNSwgJ1VzZXIgU3RhdHVzZXMnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMzgubWQnXSxcbiAgICBbMzA0MDIsICdDbGFzc2lmaWVkIExpc3RpbmcnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvOTkubWQnXSxcbiAgICBbMzA0MDMsICdEcmFmdCBDbGFzc2lmaWVkIExpc3RpbmcnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvOTkubWQnXSxcbiAgICBbMzE5MjIsICdEYXRlLUJhc2VkIENhbGVuZGFyIEV2ZW50JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUyLm1kJ10sXG4gICAgWzMxOTIzLCAnVGltZS1CYXNlZCBDYWxlbmRhciBFdmVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Mi5tZCddLFxuICAgIFszMTkyNCwgJ0NhbGVuZGFyJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUyLm1kJ10sXG4gICAgWzMxOTI1LCAnQ2FsZW5kYXIgRXZlbnQgUlNWUCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Mi5tZCddLFxuICAgIFszMTk4OSwgJ0hhbmRsZXIgcmVjb21tZW5kYXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvODkubWQnXSxcbiAgICBbMzE5OTAsICdIYW5kbGVyIGluZm9ybWF0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzg5Lm1kJ10sXG4gICAgWzM0NTUwLCAnQ29tbXVuaXR5IERlZmluaXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNzIubWQnXSxcbl07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAgIGF3YWl0IGdldE9yU2V0RGVmYXVsdCgncHJvZmlsZUluZGV4JywgMCk7XG4gICAgYXdhaXQgZ2V0T3JTZXREZWZhdWx0KCdwcm9maWxlcycsIFthd2FpdCBnZW5lcmF0ZVByb2ZpbGUoKV0pO1xuICAgIGxldCB2ZXJzaW9uID0gKGF3YWl0IHN0b3JhZ2UuZ2V0KHsgdmVyc2lvbjogMCB9KSkudmVyc2lvbjtcbiAgICBjb25zb2xlLmxvZygnREIgdmVyc2lvbjogJywgdmVyc2lvbik7XG4gICAgd2hpbGUgKHZlcnNpb24gPCBEQl9WRVJTSU9OKSB7XG4gICAgICAgIHZlcnNpb24gPSBhd2FpdCBtaWdyYXRlKHZlcnNpb24sIERCX1ZFUlNJT04pO1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHZlcnNpb24gfSk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBtaWdyYXRlKHZlcnNpb24sIGdvYWwpIHtcbiAgICBpZiAodmVyc2lvbiA9PT0gMCkge1xuICAgICAgICBjb25zb2xlLmxvZygnTWlncmF0aW5nIHRvIHZlcnNpb24gMS4nKTtcbiAgICAgICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICAgICAgcHJvZmlsZXMuZm9yRWFjaChwcm9maWxlID0+IChwcm9maWxlLmhvc3RzID0ge30pKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSAxKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdtaWdyYXRpbmcgdG8gdmVyc2lvbiAyLicpO1xuICAgICAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xuICAgICAgICByZXR1cm4gdmVyc2lvbiArIDE7XG4gICAgfVxuXG4gICAgaWYgKHZlcnNpb24gPT09IDIpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ01pZ3JhdGluZyB0byB2ZXJzaW9uIDMuJyk7XG4gICAgICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgICAgIHByb2ZpbGVzLmZvckVhY2gocHJvZmlsZSA9PiAocHJvZmlsZS5yZWxheVJlbWluZGVyID0gdHJ1ZSkpO1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xuICAgICAgICByZXR1cm4gdmVyc2lvbiArIDE7XG4gICAgfVxuXG4gICAgaWYgKHZlcnNpb24gPT09IDMpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ01pZ3JhdGluZyB0byB2ZXJzaW9uIDQgKGVuY3J5cHRpb24gc3VwcG9ydCkuJyk7XG4gICAgICAgIC8vIE5vIGRhdGEgdHJhbnNmb3JtYXRpb24gbmVlZGVkIFx1MjAxNCBleGlzdGluZyBwbGFpbnRleHQga2V5cyBzdGF5IGFzLWlzLlxuICAgICAgICAvLyBFbmNyeXB0aW9uIG9ubHkgYWN0aXZhdGVzIHdoZW4gdGhlIHVzZXIgc2V0cyBhIG1hc3RlciBwYXNzd29yZC5cbiAgICAgICAgLy8gV2UganVzdCBlbnN1cmUgdGhlIGlzRW5jcnlwdGVkIGZsYWcgZXhpc3RzIGFuZCBkZWZhdWx0cyB0byBmYWxzZS5cbiAgICAgICAgbGV0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IGlzRW5jcnlwdGVkOiBmYWxzZSB9KTtcbiAgICAgICAgaWYgKCFkYXRhLmlzRW5jcnlwdGVkKSB7XG4gICAgICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IGlzRW5jcnlwdGVkOiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmVyc2lvbiArIDE7XG4gICAgfVxuXG4gICAgaWYgKHZlcnNpb24gPT09IDQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ01pZ3JhdGluZyB0byB2ZXJzaW9uIDUgKE5JUC00NiBidW5rZXIgc3VwcG9ydCkuJyk7XG4gICAgICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgICAgIHByb2ZpbGVzLmZvckVhY2gocHJvZmlsZSA9PiB7XG4gICAgICAgICAgICBpZiAoIXByb2ZpbGUudHlwZSkgcHJvZmlsZS50eXBlID0gJ2xvY2FsJztcbiAgICAgICAgICAgIGlmIChwcm9maWxlLmJ1bmtlclVybCA9PT0gdW5kZWZpbmVkKSBwcm9maWxlLmJ1bmtlclVybCA9IG51bGw7XG4gICAgICAgICAgICBpZiAocHJvZmlsZS5yZW1vdGVQdWJrZXkgPT09IHVuZGVmaW5lZCkgcHJvZmlsZS5yZW1vdGVQdWJrZXkgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSA1KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiA2IChwbGF0Zm9ybSBzeW5jIHN1cHBvcnQpLicpO1xuICAgICAgICBjb25zdCBub3cgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcbiAgICAgICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICAgICAgcHJvZmlsZXMuZm9yRWFjaChwcm9maWxlID0+IHtcbiAgICAgICAgICAgIGlmIChwcm9maWxlLnVwZGF0ZWRBdCA9PT0gdW5kZWZpbmVkKSBwcm9maWxlLnVwZGF0ZWRBdCA9IG5vdztcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMsIHBsYXRmb3JtU3luY0VuYWJsZWQ6IHRydWUgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQcm9maWxlcygpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBzdG9yYWdlLmdldCh7IHByb2ZpbGVzOiBbXSB9KTtcbiAgICByZXR1cm4gcHJvZmlsZXMucHJvZmlsZXM7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQcm9maWxlKGluZGV4KSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICByZXR1cm4gcHJvZmlsZXNbaW5kZXhdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZU5hbWVzKCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLm1hcChwID0+IHAubmFtZSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQcm9maWxlSW5kZXgoKSB7XG4gICAgY29uc3QgaW5kZXggPSBhd2FpdCBzdG9yYWdlLmdldCh7IHByb2ZpbGVJbmRleDogMCB9KTtcbiAgICByZXR1cm4gaW5kZXgucHJvZmlsZUluZGV4O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UHJvZmlsZUluZGV4KHByb2ZpbGVJbmRleCkge1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZUluZGV4IH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlUHJvZmlsZShpbmRleCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgbGV0IHByb2ZpbGVJbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIHByb2ZpbGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgaWYgKHByb2ZpbGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIGF3YWl0IGNsZWFyRGF0YSgpOyAvLyBJZiB3ZSBoYXZlIGRlbGV0ZWQgYWxsIG9mIHRoZSBwcm9maWxlcywgbGV0J3MganVzdCBzdGFydCBmcmVzaCB3aXRoIGFsbCBuZXcgZGF0YVxuICAgICAgICBhd2FpdCBpbml0aWFsaXplKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgdGhlIGluZGV4IGRlbGV0ZWQgd2FzIHRoZSBhY3RpdmUgcHJvZmlsZSwgY2hhbmdlIHRoZSBhY3RpdmUgcHJvZmlsZSB0byB0aGUgbmV4dCBvbmVcbiAgICAgICAgbGV0IG5ld0luZGV4ID1cbiAgICAgICAgICAgIHByb2ZpbGVJbmRleCA9PT0gaW5kZXggPyBNYXRoLm1heChpbmRleCAtIDEsIDApIDogcHJvZmlsZUluZGV4O1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzLCBwcm9maWxlSW5kZXg6IG5ld0luZGV4IH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyRGF0YSgpIHtcbiAgICBsZXQgaWdub3JlSW5zdGFsbEhvb2sgPSBhd2FpdCBzdG9yYWdlLmdldCh7IGlnbm9yZUluc3RhbGxIb29rOiBmYWxzZSB9KTtcbiAgICBhd2FpdCBzdG9yYWdlLmNsZWFyKCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoaWdub3JlSW5zdGFsbEhvb2spO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVByaXZhdGVLZXkoKSB7XG4gICAgcmV0dXJuIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2dlbmVyYXRlUHJpdmF0ZUtleScgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVByb2ZpbGUobmFtZSA9ICdEZWZhdWx0IE5vc3RyIFByb2ZpbGUnLCB0eXBlID0gJ2xvY2FsJykge1xuICAgIHJldHVybiB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIHByaXZLZXk6IHR5cGUgPT09ICdsb2NhbCcgPyBhd2FpdCBnZW5lcmF0ZVByaXZhdGVLZXkoKSA6ICcnLFxuICAgICAgICBob3N0czoge30sXG4gICAgICAgIHJlbGF5czogUkVDT01NRU5ERURfUkVMQVlTLm1hcChyID0+ICh7IHVybDogci5ocmVmLCByZWFkOiB0cnVlLCB3cml0ZTogdHJ1ZSB9KSksXG4gICAgICAgIHJlbGF5UmVtaW5kZXI6IGZhbHNlLFxuICAgICAgICB0eXBlLFxuICAgICAgICBidW5rZXJVcmw6IG51bGwsXG4gICAgICAgIHJlbW90ZVB1YmtleTogbnVsbCxcbiAgICAgICAgdXBkYXRlZEF0OiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSxcbiAgICB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRPclNldERlZmF1bHQoa2V5LCBkZWYpIHtcbiAgICBsZXQgdmFsID0gKGF3YWl0IHN0b3JhZ2UuZ2V0KGtleSkpW2tleV07XG4gICAgaWYgKHZhbCA9PSBudWxsIHx8IHZhbCA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBba2V5XTogZGVmIH0pO1xuICAgICAgICByZXR1cm4gZGVmO1xuICAgIH1cblxuICAgIHJldHVybiB2YWw7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUHJvZmlsZU5hbWUoaW5kZXgsIHByb2ZpbGVOYW1lKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBwcm9maWxlc1tpbmRleF0ubmFtZSA9IHByb2ZpbGVOYW1lO1xuICAgIHByb2ZpbGVzW2luZGV4XS51cGRhdGVkQXQgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVByaXZhdGVLZXkoaW5kZXgsIHByaXZhdGVLZXkpIHtcbiAgICBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIGtpbmQ6ICdzYXZlUHJpdmF0ZUtleScsXG4gICAgICAgIHBheWxvYWQ6IFtpbmRleCwgcHJpdmF0ZUtleV0sXG4gICAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBuZXdQcm9maWxlKCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgY29uc3QgbmV3UHJvZmlsZSA9IGF3YWl0IGdlbmVyYXRlUHJvZmlsZSgnTmV3IFByb2ZpbGUnKTtcbiAgICBwcm9maWxlcy5wdXNoKG5ld1Byb2ZpbGUpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLmxlbmd0aCAtIDE7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBuZXdCdW5rZXJQcm9maWxlKG5hbWUgPSAnTmV3IEJ1bmtlcicsIGJ1bmtlclVybCA9IG51bGwpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBnZW5lcmF0ZVByb2ZpbGUobmFtZSwgJ2J1bmtlcicpO1xuICAgIHByb2ZpbGUuYnVua2VyVXJsID0gYnVua2VyVXJsO1xuICAgIHByb2ZpbGVzLnB1c2gocHJvZmlsZSk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICByZXR1cm4gcHJvZmlsZXMubGVuZ3RoIC0gMTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFJlbGF5cyhwcm9maWxlSW5kZXgpIHtcbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUocHJvZmlsZUluZGV4KTtcbiAgICByZXR1cm4gcHJvZmlsZS5yZWxheXMgfHwgW107XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUmVsYXlzKHByb2ZpbGVJbmRleCwgcmVsYXlzKSB7XG4gICAgLy8gSGF2aW5nIGFuIEFscGluZSBwcm94eSBvYmplY3QgYXMgYSBzdWItb2JqZWN0IGRvZXMgbm90IHNlcmlhbGl6ZSBjb3JyZWN0bHkgaW4gc3RvcmFnZSxcbiAgICAvLyBzbyB3ZSBhcmUgcHJlLXNlcmlhbGl6aW5nIGhlcmUgYmVmb3JlIGFzc2lnbmluZyBpdCB0byB0aGUgcHJvZmlsZSwgc28gdGhlIHByb3h5XG4gICAgLy8gb2JqIGRvZXNuJ3QgYnVnIG91dC5cbiAgICBsZXQgZml4ZWRSZWxheXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHJlbGF5cykpO1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgbGV0IHByb2ZpbGUgPSBwcm9maWxlc1twcm9maWxlSW5kZXhdO1xuICAgIHByb2ZpbGUucmVsYXlzID0gZml4ZWRSZWxheXM7XG4gICAgcHJvZmlsZS51cGRhdGVkQXQgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0KGl0ZW0pIHtcbiAgICByZXR1cm4gKGF3YWl0IHN0b3JhZ2UuZ2V0KGl0ZW0pKVtpdGVtXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBlcm1pc3Npb25zKGluZGV4ID0gbnVsbCkge1xuICAgIGlmIChpbmRleCA9PSBudWxsKSB7XG4gICAgICAgIGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgfVxuICAgIGxldCBwcm9maWxlID0gYXdhaXQgZ2V0UHJvZmlsZShpbmRleCk7XG4gICAgbGV0IGhvc3RzID0gYXdhaXQgcHJvZmlsZS5ob3N0cztcbiAgICByZXR1cm4gaG9zdHM7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZXJtaXNzaW9uKGhvc3QsIGFjdGlvbikge1xuICAgIGxldCBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIGxldCBwcm9maWxlID0gYXdhaXQgZ2V0UHJvZmlsZShpbmRleCk7XG4gICAgcmV0dXJuIHByb2ZpbGU/Lmhvc3RzPy5baG9zdF0/LlthY3Rpb25dIHx8ICdhc2snO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UGVybWlzc2lvbihob3N0LCBhY3Rpb24sIHBlcm0sIGluZGV4ID0gbnVsbCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgaWYgKCFpbmRleCkge1xuICAgICAgICBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIH1cbiAgICBsZXQgcHJvZmlsZSA9IHByb2ZpbGVzW2luZGV4XTtcbiAgICBsZXQgbmV3UGVybXMgPSBwcm9maWxlLmhvc3RzW2hvc3RdIHx8IHt9O1xuICAgIG5ld1Blcm1zID0geyAuLi5uZXdQZXJtcywgW2FjdGlvbl06IHBlcm0gfTtcbiAgICBwcm9maWxlLmhvc3RzW2hvc3RdID0gbmV3UGVybXM7XG4gICAgcHJvZmlsZS51cGRhdGVkQXQgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcbiAgICBwcm9maWxlc1tpbmRleF0gPSBwcm9maWxlO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBodW1hblBlcm1pc3Npb24ocCkge1xuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2Ugd2hlcmUgZXZlbnQgc2lnbmluZyBpbmNsdWRlcyBhIGtpbmQgbnVtYmVyXG4gICAgaWYgKHAuc3RhcnRzV2l0aCgnc2lnbkV2ZW50OicpKSB7XG4gICAgICAgIGxldCBbZSwgbl0gPSBwLnNwbGl0KCc6Jyk7XG4gICAgICAgIG4gPSBwYXJzZUludChuKTtcbiAgICAgICAgbGV0IG5uYW1lID0gS0lORFMuZmluZChrID0+IGtbMF0gPT09IG4pPy5bMV0gfHwgYFVua25vd24gKEtpbmQgJHtufSlgO1xuICAgICAgICByZXR1cm4gYFNpZ24gZXZlbnQ6ICR7bm5hbWV9YDtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHApIHtcbiAgICAgICAgY2FzZSAnZ2V0UHViS2V5JzpcbiAgICAgICAgICAgIHJldHVybiAnUmVhZCBwdWJsaWMga2V5JztcbiAgICAgICAgY2FzZSAnc2lnbkV2ZW50JzpcbiAgICAgICAgICAgIHJldHVybiAnU2lnbiBldmVudCc7XG4gICAgICAgIGNhc2UgJ2dldFJlbGF5cyc6XG4gICAgICAgICAgICByZXR1cm4gJ1JlYWQgcmVsYXkgbGlzdCc7XG4gICAgICAgIGNhc2UgJ25pcDA0LmVuY3J5cHQnOlxuICAgICAgICAgICAgcmV0dXJuICdFbmNyeXB0IHByaXZhdGUgbWVzc2FnZSAoTklQLTA0KSc7XG4gICAgICAgIGNhc2UgJ25pcDA0LmRlY3J5cHQnOlxuICAgICAgICAgICAgcmV0dXJuICdEZWNyeXB0IHByaXZhdGUgbWVzc2FnZSAoTklQLTA0KSc7XG4gICAgICAgIGNhc2UgJ25pcDQ0LmVuY3J5cHQnOlxuICAgICAgICAgICAgcmV0dXJuICdFbmNyeXB0IHByaXZhdGUgbWVzc2FnZSAoTklQLTQ0KSc7XG4gICAgICAgIGNhc2UgJ25pcDQ0LmRlY3J5cHQnOlxuICAgICAgICAgICAgcmV0dXJuICdEZWNyeXB0IHByaXZhdGUgbWVzc2FnZSAoTklQLTQ0KSc7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gJ1Vua25vd24nO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlS2V5KGtleSkge1xuICAgIGNvbnN0IGhleE1hdGNoID0gL15bXFxkYS1mXXs2NH0kL2kudGVzdChrZXkpO1xuICAgIGNvbnN0IGIzMk1hdGNoID0gL15uc2VjMVtxcHpyeTl4OGdmMnR2ZHcwczNqbjU0a2hjZTZtdWE3bF17NTh9JC8udGVzdChrZXkpO1xuXG4gICAgcmV0dXJuIGhleE1hdGNoIHx8IGIzMk1hdGNoIHx8IGlzTmNyeXB0c2VjKGtleSkgfHwgaXNWYWxpZFNlZWRQaHJhc2Uoa2V5KTtcbn1cblxuZXhwb3J0IHsgbG9va3NMaWtlU2VlZFBocmFzZSB9O1xuZXhwb3J0IGNvbnN0IGlzU2VlZFBocmFzZSA9IGlzVmFsaWRTZWVkUGhyYXNlO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNOY3J5cHRzZWMoa2V5KSB7XG4gICAgcmV0dXJuIC9ebmNyeXB0c2VjMVtxcHpyeTl4OGdmMnR2ZHcwczNqbjU0a2hjZTZtdWE3bF0rJC8udGVzdChrZXkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmVhdHVyZShuYW1lKSB7XG4gICAgbGV0IGZuYW1lID0gYGZlYXR1cmU6JHtuYW1lfWA7XG4gICAgbGV0IGYgPSBhd2FpdCBhcGkuc3RvcmFnZS5sb2NhbC5nZXQoeyBbZm5hbWVdOiBmYWxzZSB9KTtcbiAgICByZXR1cm4gZltmbmFtZV07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWxheVJlbWluZGVyKCkge1xuICAgIGxldCBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIGxldCBwcm9maWxlID0gYXdhaXQgZ2V0UHJvZmlsZShpbmRleCk7XG4gICAgcmV0dXJuIHByb2ZpbGUucmVsYXlSZW1pbmRlcjtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRvZ2dsZVJlbGF5UmVtaW5kZXIoKSB7XG4gICAgbGV0IGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBwcm9maWxlc1tpbmRleF0ucmVsYXlSZW1pbmRlciA9IGZhbHNlO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXROcHViKCkge1xuICAgIGxldCBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIHJldHVybiBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIGtpbmQ6ICdnZXROcHViJyxcbiAgICAgICAgcGF5bG9hZDogaW5kZXgsXG4gICAgfSk7XG59XG5cbi8vIC0tLSBNYXN0ZXIgcGFzc3dvcmQgZW5jcnlwdGlvbiBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIG1hc3RlciBwYXNzd29yZCBlbmNyeXB0aW9uIGlzIGFjdGl2ZS5cbiAqXG4gKiBEZWZlbnNpdmU6IGNoZWNrcyBtdWx0aXBsZSBpbmRpY2F0b3JzLCBub3QganVzdCB0aGUgYm9vbGVhbiBmbGFnLlxuICogSWYgcGFzc3dvcmRIYXNoIG9yIGVuY3J5cHRlZCBrZXkgYmxvYnMgZXhpc3QgYnV0IHRoZSBpc0VuY3J5cHRlZCBmbGFnXG4gKiBpcyBmYWxzZSAoaW5jb25zaXN0ZW50IHN0YXRlIGZyb20gc2VydmljZSB3b3JrZXIgY3Jhc2gsIHJhY2UgY29uZGl0aW9uLFxuICogZXRjLiksIHNlbGYtaGVhbHMgYnkgc2V0dGluZyB0aGUgZmxhZyBiYWNrIHRvIHRydWUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpc0VuY3J5cHRlZCgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UsIHBhc3N3b3JkSGFzaDogbnVsbCwgcHJvZmlsZXM6IFtdIH0pO1xuICAgIGlmIChkYXRhLmlzRW5jcnlwdGVkKSByZXR1cm4gdHJ1ZTtcblxuICAgIC8vIEZhbGxiYWNrIDE6IHBhc3N3b3JkSGFzaCBleGlzdHMgYnV0IGZsYWcgaXMgc3RhbGVcbiAgICBpZiAoZGF0YS5wYXNzd29yZEhhc2gpIHtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBpc0VuY3J5cHRlZDogdHJ1ZSB9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gRmFsbGJhY2sgMjogZW5jcnlwdGVkIGJsb2JzIGV4aXN0IGluIHByb2ZpbGVzIGJ1dCBmbGFnICsgaGFzaCBhcmUgbWlzc2luZ1xuICAgIGZvciAoY29uc3QgcHJvZmlsZSBvZiBkYXRhLnByb2ZpbGVzKSB7XG4gICAgICAgIGlmIChpc0VuY3J5cHRlZEJsb2IocHJvZmlsZS5wcml2S2V5KSkge1xuICAgICAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBpc0VuY3J5cHRlZDogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFN0b3JlIHRoZSBwYXNzd29yZCB2ZXJpZmljYXRpb24gaGFzaCAobmV2ZXIgdGhlIHBhc3N3b3JkIGl0c2VsZikuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRQYXNzd29yZEhhc2gocGFzc3dvcmQpIHtcbiAgICBjb25zdCB7IGhhc2gsIHNhbHQgfSA9IGF3YWl0IGhhc2hQYXNzd29yZChwYXNzd29yZCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoe1xuICAgICAgICBwYXNzd29yZEhhc2g6IGhhc2gsXG4gICAgICAgIHBhc3N3b3JkU2FsdDogc2FsdCxcbiAgICAgICAgaXNFbmNyeXB0ZWQ6IHRydWUsXG4gICAgfSk7XG59XG5cbi8qKlxuICogVmVyaWZ5IGEgcGFzc3dvcmQgYWdhaW5zdCB0aGUgc3RvcmVkIGhhc2guXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja1Bhc3N3b3JkKHBhc3N3b3JkKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHtcbiAgICAgICAgcGFzc3dvcmRIYXNoOiBudWxsLFxuICAgICAgICBwYXNzd29yZFNhbHQ6IG51bGwsXG4gICAgfSk7XG4gICAgaWYgKCFkYXRhLnBhc3N3b3JkSGFzaCB8fCAhZGF0YS5wYXNzd29yZFNhbHQpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdmVyaWZ5UGFzc3dvcmQocGFzc3dvcmQsIGRhdGEucGFzc3dvcmRIYXNoLCBkYXRhLnBhc3N3b3JkU2FsdCk7XG59XG5cbi8qKlxuICogUmVtb3ZlIG1hc3RlciBwYXNzd29yZCBwcm90ZWN0aW9uIFx1MjAxNCBjbGVhcnMgaGFzaCBhbmQgZGVjcnlwdHMgYWxsIGtleXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZW1vdmVQYXNzd29yZFByb3RlY3Rpb24ocGFzc3dvcmQpIHtcbiAgICBjb25zdCB2YWxpZCA9IGF3YWl0IGNoZWNrUGFzc3dvcmQocGFzc3dvcmQpO1xuICAgIGlmICghdmFsaWQpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwYXNzd29yZCcpO1xuXG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb2ZpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9maWxlc1tpXS50eXBlID09PSAnYnVua2VyJykgY29udGludWU7XG4gICAgICAgIGlmIChpc0VuY3J5cHRlZEJsb2IocHJvZmlsZXNbaV0ucHJpdktleSkpIHtcbiAgICAgICAgICAgIHByb2ZpbGVzW2ldLnByaXZLZXkgPSBhd2FpdCBkZWNyeXB0KHByb2ZpbGVzW2ldLnByaXZLZXksIHBhc3N3b3JkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7XG4gICAgICAgIHByb2ZpbGVzLFxuICAgICAgICBpc0VuY3J5cHRlZDogZmFsc2UsXG4gICAgICAgIHBhc3N3b3JkSGFzaDogbnVsbCxcbiAgICAgICAgcGFzc3dvcmRTYWx0OiBudWxsLFxuICAgIH0pO1xufVxuXG4vKipcbiAqIEVuY3J5cHQgYWxsIHByb2ZpbGUgcHJpdmF0ZSBrZXlzIHdpdGggYSBtYXN0ZXIgcGFzc3dvcmQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0QWxsS2V5cyhwYXNzd29yZCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9maWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJvZmlsZXNbaV0udHlwZSA9PT0gJ2J1bmtlcicpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoIWlzRW5jcnlwdGVkQmxvYihwcm9maWxlc1tpXS5wcml2S2V5KSkge1xuICAgICAgICAgICAgcHJvZmlsZXNbaV0ucHJpdktleSA9IGF3YWl0IGVuY3J5cHQocHJvZmlsZXNbaV0ucHJpdktleSwgcGFzc3dvcmQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGF3YWl0IHNldFBhc3N3b3JkSGFzaChwYXNzd29yZCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuLyoqXG4gKiBSZS1lbmNyeXB0IGFsbCBrZXlzIHdpdGggYSBuZXcgcGFzc3dvcmQgKHJlcXVpcmVzIHRoZSBvbGQgcGFzc3dvcmQpLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hhbmdlUGFzc3dvcmRGb3JLZXlzKG9sZFBhc3N3b3JkLCBuZXdQYXNzd29yZCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9maWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJvZmlsZXNbaV0udHlwZSA9PT0gJ2J1bmtlcicpIGNvbnRpbnVlO1xuICAgICAgICBsZXQgaGV4ID0gcHJvZmlsZXNbaV0ucHJpdktleTtcbiAgICAgICAgaWYgKGlzRW5jcnlwdGVkQmxvYihoZXgpKSB7XG4gICAgICAgICAgICBoZXggPSBhd2FpdCBkZWNyeXB0KGhleCwgb2xkUGFzc3dvcmQpO1xuICAgICAgICB9XG4gICAgICAgIHByb2ZpbGVzW2ldLnByaXZLZXkgPSBhd2FpdCBlbmNyeXB0KGhleCwgbmV3UGFzc3dvcmQpO1xuICAgIH1cbiAgICBjb25zdCB7IGhhc2gsIHNhbHQgfSA9IGF3YWl0IGhhc2hQYXNzd29yZChuZXdQYXNzd29yZCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoe1xuICAgICAgICBwcm9maWxlcyxcbiAgICAgICAgcGFzc3dvcmRIYXNoOiBoYXNoLFxuICAgICAgICBwYXNzd29yZFNhbHQ6IHNhbHQsXG4gICAgICAgIGlzRW5jcnlwdGVkOiB0cnVlLFxuICAgIH0pO1xufVxuXG4vKipcbiAqIERlY3J5cHQgYSBzaW5nbGUgcHJvZmlsZSdzIHByaXZhdGUga2V5LCByZXR1cm5pbmcgdGhlIGhleCBzdHJpbmcuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREZWNyeXB0ZWRQcml2S2V5KHByb2ZpbGUsIHBhc3N3b3JkKSB7XG4gICAgaWYgKHByb2ZpbGUudHlwZSA9PT0gJ2J1bmtlcicpIHJldHVybiAnJztcbiAgICBpZiAoaXNFbmNyeXB0ZWRCbG9iKHByb2ZpbGUucHJpdktleSkpIHtcbiAgICAgICAgcmV0dXJuIGRlY3J5cHQocHJvZmlsZS5wcml2S2V5LCBwYXNzd29yZCk7XG4gICAgfVxuICAgIHJldHVybiBwcm9maWxlLnByaXZLZXk7XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBhIHN0b3JlZCB2YWx1ZSBsb29rcyBsaWtlIGFuIGVuY3J5cHRlZCBibG9iLlxuICogRW5jcnlwdGVkIGJsb2JzIGFyZSBKU09OIHN0cmluZ3MgY29udGFpbmluZyB7c2FsdCwgaXYsIGNpcGhlcnRleHR9LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFbmNyeXB0ZWRCbG9iKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuICEhKHBhcnNlZC5zYWx0ICYmIHBhcnNlZC5pdiAmJiBwYXJzZWQuY2lwaGVydGV4dCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iLCAiLyoqXG4gKiBCcm93c2VyIEFQSSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBDaHJvbWUgLyBTYWZhcmkgLyBGaXJlZm94LlxuICpcbiAqIFNhZmFyaSBhbmQgRmlyZWZveCBleHBvc2UgYGJyb3dzZXIuKmAgKFByb21pc2UtYmFzZWQsIFdlYkV4dGVuc2lvbiBzdGFuZGFyZCkuXG4gKiBDaHJvbWUgZXhwb3NlcyBgY2hyb21lLipgIChjYWxsYmFjay1iYXNlZCBoaXN0b3JpY2FsbHksIGJ1dCBNVjMgc3VwcG9ydHNcbiAqIHByb21pc2VzIG9uIG1vc3QgQVBJcykuIEluIGEgc2VydmljZS13b3JrZXIgY29udGV4dCBgYnJvd3NlcmAgaXMgdW5kZWZpbmVkXG4gKiBvbiBDaHJvbWUsIHNvIHdlIG5vcm1hbGlzZSBldmVyeXRoaW5nIGhlcmUuXG4gKlxuICogVXNhZ2U6ICBpbXBvcnQgeyBhcGkgfSBmcm9tICcuL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbiAqICAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uKVxuICpcbiAqIFRoZSBleHBvcnRlZCBgYXBpYCBvYmplY3QgbWlycm9ycyB0aGUgc3Vic2V0IG9mIHRoZSBXZWJFeHRlbnNpb24gQVBJIHRoYXRcbiAqIE5vc3RyS2V5IGFjdHVhbGx5IHVzZXMsIHdpdGggZXZlcnkgbWV0aG9kIHJldHVybmluZyBhIFByb21pc2UuXG4gKi9cblxuLy8gRGV0ZWN0IHdoaWNoIGdsb2JhbCBuYW1lc3BhY2UgaXMgYXZhaWxhYmxlLlxuY29uc3QgX2Jyb3dzZXIgPVxuICAgIHR5cGVvZiBicm93c2VyICE9PSAndW5kZWZpbmVkJyA/IGJyb3dzZXIgOlxuICAgIHR5cGVvZiBjaHJvbWUgICE9PSAndW5kZWZpbmVkJyA/IGNocm9tZSAgOlxuICAgIG51bGw7XG5cbmlmICghX2Jyb3dzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jyb3dzZXItcG9seWZpbGw6IE5vIGV4dGVuc2lvbiBBUEkgbmFtZXNwYWNlIGZvdW5kIChuZWl0aGVyIGJyb3dzZXIgbm9yIGNocm9tZSkuJyk7XG59XG5cbi8qKlxuICogVHJ1ZSB3aGVuIHJ1bm5pbmcgb24gQ2hyb21lIChvciBhbnkgQ2hyb21pdW0tYmFzZWQgYnJvd3NlciB0aGF0IG9ubHlcbiAqIGV4cG9zZXMgdGhlIGBjaHJvbWVgIG5hbWVzcGFjZSkuXG4gKi9cbmNvbnN0IGlzQ2hyb21lID0gdHlwZW9mIGJyb3dzZXIgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnO1xuXG4vKipcbiAqIFdyYXAgYSBDaHJvbWUgY2FsbGJhY2stc3R5bGUgbWV0aG9kIHNvIGl0IHJldHVybnMgYSBQcm9taXNlLlxuICogSWYgdGhlIG1ldGhvZCBhbHJlYWR5IHJldHVybnMgYSBwcm9taXNlIChNVjMpIHdlIGp1c3QgcGFzcyB0aHJvdWdoLlxuICovXG5mdW5jdGlvbiBwcm9taXNpZnkoY29udGV4dCwgbWV0aG9kKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgIC8vIE1WMyBDaHJvbWUgQVBJcyByZXR1cm4gcHJvbWlzZXMgd2hlbiBubyBjYWxsYmFjayBpcyBzdXBwbGllZC5cbiAgICAgICAgLy8gV2UgdHJ5IHRoZSBwcm9taXNlIHBhdGggZmlyc3Q7IGlmIHRoZSBydW50aW1lIHNpZ25hbHMgYW4gZXJyb3JcbiAgICAgICAgLy8gdmlhIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvciBpbnNpZGUgYSBjYWxsYmFjayB3ZSBjYXRjaCB0aGF0IHRvby5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIGNhbGxiYWNrIHdyYXBwaW5nXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbWV0aG9kLmFwcGx5KGNvbnRleHQsIFtcbiAgICAgICAgICAgICAgICAuLi5hcmdzLFxuICAgICAgICAgICAgICAgICguLi5jYkFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9icm93c2VyLnJ1bnRpbWUgJiYgX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjYkFyZ3MubGVuZ3RoIDw9IDEgPyBjYkFyZ3NbMF0gOiBjYkFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHRoZSB1bmlmaWVkIGBhcGlgIG9iamVjdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IGFwaSA9IHt9O1xuXG4vLyAtLS0gcnVudGltZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5ydW50aW1lID0ge1xuICAgIC8qKlxuICAgICAqIHNlbmRNZXNzYWdlIFx1MjAxMyBhbHdheXMgcmV0dXJucyBhIFByb21pc2UuXG4gICAgICovXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1lc3NhZ2UgXHUyMDEzIHRoaW4gd3JhcHBlciBzbyBjYWxsZXJzIHVzZSBhIGNvbnNpc3RlbnQgcmVmZXJlbmNlLlxuICAgICAqIFRoZSBsaXN0ZW5lciBzaWduYXR1cmUgaXMgKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKS5cbiAgICAgKiBPbiBDaHJvbWUgdGhlIGxpc3RlbmVyIGNhbiByZXR1cm4gYHRydWVgIHRvIGtlZXAgdGhlIGNoYW5uZWwgb3BlbixcbiAgICAgKiBvciByZXR1cm4gYSBQcm9taXNlIChNVjMpLiAgU2FmYXJpIC8gRmlyZWZveCBleHBlY3QgYSBQcm9taXNlIHJldHVybi5cbiAgICAgKi9cbiAgICBvbk1lc3NhZ2U6IF9icm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLFxuXG4gICAgLyoqXG4gICAgICogZ2V0VVJMIFx1MjAxMyBzeW5jaHJvbm91cyBvbiBhbGwgYnJvd3NlcnMuXG4gICAgICovXG4gICAgZ2V0VVJMKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuZ2V0VVJMKHBhdGgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvcGVuT3B0aW9uc1BhZ2VcbiAgICAgKi9cbiAgICBvcGVuT3B0aW9uc1BhZ2UoKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UpKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSB0aGUgaWQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAqL1xuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuaWQ7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBzdG9yYWdlLmxvY2FsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnN0b3JhZ2UgPSB7XG4gICAgbG9jYWw6IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc3luYyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTnVsbCB3aGVuIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBzeW5jIChvbGRlciBTYWZhcmksIGV0Yy4pXG4gICAgc3luYzogX2Jyb3dzZXIuc3RvcmFnZT8uc3luYyA/IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSB7XG4gICAgICAgICAgICAgICAgLy8gU2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCBnZXRCeXRlc0luVXNlIFx1MjAxNCByZXR1cm4gMFxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgIi8qKlxuICogRW5jcnlwdGlvbiB1dGlsaXRpZXMgZm9yIE5vc3RyS2V5IG1hc3RlciBwYXNzd29yZCBmZWF0dXJlLlxuICpcbiAqIFVzZXMgV2ViIENyeXB0byBBUEkgKGNyeXB0by5zdWJ0bGUpIGV4Y2x1c2l2ZWx5IFx1MjAxNCBubyBleHRlcm5hbCBsaWJyYXJpZXMuXG4gKiAtIFBCS0RGMiB3aXRoIDYwMCwwMDAgaXRlcmF0aW9ucyAoT1dBU1AgMjAyMyByZWNvbW1lbmRhdGlvbilcbiAqIC0gQUVTLTI1Ni1HQ00gZm9yIGF1dGhlbnRpY2F0ZWQgZW5jcnlwdGlvblxuICogLSBSYW5kb20gc2FsdCAoMTYgYnl0ZXMpIGFuZCBJViAoMTIgYnl0ZXMpIHBlciBvcGVyYXRpb25cbiAqIC0gQWxsIGJpbmFyeSBkYXRhIGVuY29kZWQgYXMgYmFzZTY0IGZvciBKU09OIHN0b3JhZ2UgY29tcGF0aWJpbGl0eVxuICovXG5cbmNvbnN0IFBCS0RGMl9JVEVSQVRJT05TID0gNjAwXzAwMDtcbmNvbnN0IFNBTFRfQllURVMgPSAxNjtcbmNvbnN0IElWX0JZVEVTID0gMTI7XG5cbi8vIC0tLSBCYXNlNjQgaGVscGVycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gYXJyYXlCdWZmZXJUb0Jhc2U2NChidWZmZXIpIHtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgbGV0IGJpbmFyeSA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYmluYXJ5ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gYnRvYShiaW5hcnkpO1xufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0FycmF5QnVmZmVyKGJhc2U2NCkge1xuICAgIGNvbnN0IGJpbmFyeSA9IGF0b2IoYmFzZTY0KTtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJpbmFyeS5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmluYXJ5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGJ5dGVzW2ldID0gYmluYXJ5LmNoYXJDb2RlQXQoaSk7XG4gICAgfVxuICAgIHJldHVybiBieXRlcy5idWZmZXI7XG59XG5cbi8vIC0tLSBLZXkgZGVyaXZhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBEZXJpdmUgYW4gQUVTLTI1Ni1HQ00gQ3J5cHRvS2V5IGZyb20gYSBwYXNzd29yZCBhbmQgc2FsdCB1c2luZyBQQktERjIuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcnxVaW50OEFycmF5fSBzYWx0IC0gMTYtYnl0ZSBzYWx0XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxDcnlwdG9LZXk+fSBBRVMtMjU2LUdDTSBrZXlcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlcml2ZUtleShwYXNzd29yZCwgc2FsdCkge1xuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGtleU1hdGVyaWFsID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLFxuICAgICAgICBlbmMuZW5jb2RlKHBhc3N3b3JkKSxcbiAgICAgICAgJ1BCS0RGMicsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBbJ2Rlcml2ZUtleSddXG4gICAgKTtcblxuICAgIHJldHVybiBjcnlwdG8uc3VidGxlLmRlcml2ZUtleShcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1BCS0RGMicsXG4gICAgICAgICAgICBzYWx0OiBzYWx0IGluc3RhbmNlb2YgVWludDhBcnJheSA/IHNhbHQgOiBuZXcgVWludDhBcnJheShzYWx0KSxcbiAgICAgICAgICAgIGl0ZXJhdGlvbnM6IFBCS0RGMl9JVEVSQVRJT05TLFxuICAgICAgICAgICAgaGFzaDogJ1NIQS0yNTYnLFxuICAgICAgICB9LFxuICAgICAgICBrZXlNYXRlcmlhbCxcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGxlbmd0aDogMjU2IH0sXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddXG4gICAgKTtcbn1cblxuLy8gLS0tIEVuY3J5cHQgd2l0aCBwcmUtZGVyaXZlZCBrZXkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEVuY3J5cHQgYSBwbGFpbnRleHQgc3RyaW5nIHVzaW5nIGEgcHJlLWRlcml2ZWQgQ3J5cHRvS2V5IGFuZCBpdHMgc2FsdC5cbiAqXG4gKiBUaGlzIGF2b2lkcyBob2xkaW5nIHRoZSByYXcgcGFzc3dvcmQgaW4gbWVtb3J5IFx1MjAxNCB0aGUgY2FsbGVyIGRlcml2ZXMgdGhlXG4gKiBrZXkgb25jZSAodmlhIGRlcml2ZUtleSkgYW5kIHJldXNlcyBpdCBmb3IgdGhlIHNlc3Npb24uICBUaGUgb3V0cHV0XG4gKiBmb3JtYXQgaXMgaWRlbnRpY2FsIHRvIGVuY3J5cHQoKSwgc28gZGVjcnlwdCgpIGNhbiBzdGlsbCBiZSB1c2VkIHdpdGhcbiAqIHRoZSBvcmlnaW5hbCBwYXNzd29yZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGxhaW50ZXh0ICAgICAgICAgIC0gVGhlIGRhdGEgdG8gZW5jcnlwdFxuICogQHBhcmFtIHtDcnlwdG9LZXl9IGtleSAgICAgICAgICAgICAtIEFFUy0yNTYtR0NNIGtleSBmcm9tIGRlcml2ZUtleSgpXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IHNhbHQgICAgICAgICAgIC0gVGhlIHNhbHQgdGhhdCB3YXMgdXNlZCB0byBkZXJpdmUgYGtleWBcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IEpTT04gc3RyaW5nOiB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gKGFsbCBiYXNlNjQpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0V2l0aEtleShwbGFpbnRleHQsIGtleSwgc2FsdCkge1xuICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShJVl9CWVRFUykpO1xuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGVuYy5lbmNvZGUocGxhaW50ZXh0KVxuICAgICk7XG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgICAgICBpdjogYXJyYXlCdWZmZXJUb0Jhc2U2NChpdiksXG4gICAgICAgIGNpcGhlcnRleHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoY2lwaGVydGV4dCksXG4gICAgfSk7XG59XG5cbi8vIC0tLSBFbmNyeXB0IC8gRGVjcnlwdCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFbmNyeXB0IGEgcGxhaW50ZXh0IHN0cmluZyB3aXRoIGEgcGFzc3dvcmQuXG4gKlxuICogR2VuZXJhdGVzIGEgcmFuZG9tIHNhbHQgKDE2IGJ5dGVzKSBhbmQgSVYgKDEyIGJ5dGVzKSwgZGVyaXZlcyBhblxuICogQUVTLTI1Ni1HQ00ga2V5IHZpYSBQQktERjIsIGFuZCByZXR1cm5zIGEgSlNPTiBzdHJpbmcgY29udGFpbmluZ1xuICogYmFzZTY0LWVuY29kZWQgc2FsdCwgaXYsIGFuZCBjaXBoZXJ0ZXh0LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwbGFpbnRleHQgLSBUaGUgZGF0YSB0byBlbmNyeXB0IChlLmcuIGhleCBwcml2YXRlIGtleSlcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBKU09OIHN0cmluZzogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9IChhbGwgYmFzZTY0KVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdChwbGFpbnRleHQsIHBhc3N3b3JkKSB7XG4gICAgY29uc3Qgc2FsdCA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoU0FMVF9CWVRFUykpO1xuICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShJVl9CWVRFUykpO1xuICAgIGNvbnN0IGtleSA9IGF3YWl0IGRlcml2ZUtleShwYXNzd29yZCwgc2FsdCk7XG5cbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBlbmMuZW5jb2RlKHBsYWludGV4dClcbiAgICApO1xuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICAgICAgaXY6IGFycmF5QnVmZmVyVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG4vKipcbiAqIERlY3J5cHQgZGF0YSB0aGF0IHdhcyBlbmNyeXB0ZWQgd2l0aCBgZW5jcnlwdCgpYC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZW5jcnlwdGVkRGF0YSAtIEpTT04gc3RyaW5nIGZyb20gZW5jcnlwdCgpXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgICAgICAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IFRoZSBvcmlnaW5hbCBwbGFpbnRleHRcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgcGFzc3dvcmQgaXMgd3Jvbmcgb3IgZGF0YSBpcyB0YW1wZXJlZCB3aXRoXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0KGVuY3J5cHRlZERhdGEsIHBhc3N3b3JkKSB7XG4gICAgY29uc3QgeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcblxuICAgIGNvbnN0IHNhbHRCdWYgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKHNhbHQpKTtcbiAgICBjb25zdCBpdkJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoaXYpKTtcbiAgICBjb25zdCBjdEJ1ZiA9IGJhc2U2NFRvQXJyYXlCdWZmZXIoY2lwaGVydGV4dCk7XG5cbiAgICBjb25zdCBrZXkgPSBhd2FpdCBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHRCdWYpO1xuXG4gICAgY29uc3QgcGxhaW5CdWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdjogaXZCdWYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBjdEJ1ZlxuICAgICk7XG5cbiAgICBjb25zdCBkZWMgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICByZXR1cm4gZGVjLmRlY29kZShwbGFpbkJ1Zik7XG59XG5cbi8vIC0tLSBQYXNzd29yZCBoYXNoaW5nIChmb3IgdmVyaWZpY2F0aW9uKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBIYXNoIGEgcGFzc3dvcmQgd2l0aCBQQktERjIgZm9yIHZlcmlmaWNhdGlvbiBwdXJwb3Nlcy5cbiAqXG4gKiBUaGlzIHByb2R1Y2VzIGEgc2VwYXJhdGUgaGFzaCAobm90IHRoZSBlbmNyeXB0aW9uIGtleSkgdGhhdCBjYW4gYmUgc3RvcmVkXG4gKiB0byB2ZXJpZnkgdGhlIHBhc3N3b3JkIHdpdGhvdXQgbmVlZGluZyB0byBhdHRlbXB0IGRlY3J5cHRpb24uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHBhcmFtIHtVaW50OEFycmF5fSBbc2FsdF0gLSBPcHRpb25hbCBzYWx0OyBnZW5lcmF0ZWQgaWYgb21pdHRlZFxuICogQHJldHVybnMge1Byb21pc2U8eyBoYXNoOiBzdHJpbmcsIHNhbHQ6IHN0cmluZyB9Pn0gYmFzZTY0LWVuY29kZWQgaGFzaCBhbmQgc2FsdFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFzaFBhc3N3b3JkKHBhc3N3b3JkLCBzYWx0KSB7XG4gICAgaWYgKCFzYWx0KSB7XG4gICAgICAgIHNhbHQgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KFNBTFRfQllURVMpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzYWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgICBzYWx0ID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihzYWx0KSk7XG4gICAgfVxuXG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3Qga2V5TWF0ZXJpYWwgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgJ3JhdycsXG4gICAgICAgIGVuYy5lbmNvZGUocGFzc3dvcmQpLFxuICAgICAgICAnUEJLREYyJyxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFsnZGVyaXZlQml0cyddXG4gICAgKTtcblxuICAgIGNvbnN0IGhhc2hCaXRzID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZXJpdmVCaXRzKFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnUEJLREYyJyxcbiAgICAgICAgICAgIHNhbHQsXG4gICAgICAgICAgICBpdGVyYXRpb25zOiBQQktERjJfSVRFUkFUSU9OUyxcbiAgICAgICAgICAgIGhhc2g6ICdTSEEtMjU2JyxcbiAgICAgICAgfSxcbiAgICAgICAga2V5TWF0ZXJpYWwsXG4gICAgICAgIDI1NlxuICAgICk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBoYXNoOiBhcnJheUJ1ZmZlclRvQmFzZTY0KGhhc2hCaXRzKSxcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICB9O1xufVxuXG4vKipcbiAqIFZlcmlmeSBhIHBhc3N3b3JkIGFnYWluc3QgYSBzdG9yZWQgaGFzaC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgICAtIFRoZSBwYXNzd29yZCB0byB2ZXJpZnlcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdG9yZWRIYXNoIC0gYmFzZTY0LWVuY29kZWQgaGFzaCBmcm9tIGhhc2hQYXNzd29yZCgpXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RvcmVkU2FsdCAtIGJhc2U2NC1lbmNvZGVkIHNhbHQgZnJvbSBoYXNoUGFzc3dvcmQoKVxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59IFRydWUgaWYgdGhlIHBhc3N3b3JkIG1hdGNoZXNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeVBhc3N3b3JkKHBhc3N3b3JkLCBzdG9yZWRIYXNoLCBzdG9yZWRTYWx0KSB7XG4gICAgY29uc3QgeyBoYXNoIH0gPSBhd2FpdCBoYXNoUGFzc3dvcmQocGFzc3dvcmQsIHN0b3JlZFNhbHQpO1xuICAgIHJldHVybiBoYXNoID09PSBzdG9yZWRIYXNoO1xufVxuIiwgIi8qKlxuICogQklQMzkgU2VlZCBQaHJhc2UgdXRpbGl0aWVzIGZvciBOb3N0cktleS5cbiAqXG4gKiBJbXBsZW1lbnRzIHRoZSBzYW1lIGFsZ29yaXRobSBhcyBgbm9zdHItbnNlYy1zZWVkcGhyYXNlYDpcbiAqIHRoZSAzMi1ieXRlIHByaXZhdGUga2V5IElTIHRoZSBCSVAzOSBlbnRyb3B5IChiaWRpcmVjdGlvbmFsIGVuY29kaW5nKS5cbiAqXG4gKiBVc2VzIEBzY3VyZS9iaXAzOSAoYWxyZWFkeSBhIHRyYW5zaXRpdmUgZGVwIG9mIG5vc3RyLXRvb2xzKS5cbiAqL1xuXG5pbXBvcnQgeyBlbnRyb3B5VG9NbmVtb25pYywgbW5lbW9uaWNUb0VudHJvcHksIHZhbGlkYXRlTW5lbW9uaWMgfSBmcm9tICdAc2N1cmUvYmlwMzknO1xuaW1wb3J0IHsgd29yZGxpc3QgfSBmcm9tICdAc2N1cmUvYmlwMzkvd29yZGxpc3RzL2VuZ2xpc2guanMnO1xuaW1wb3J0IHsgaGV4VG9CeXRlcywgYnl0ZXNUb0hleCwgZ2V0UHVibGljS2V5U3luYyB9IGZyb20gJ25vc3RyLWNyeXB0by11dGlscyc7XG5cbi8qKlxuICogQ29udmVydCBhIGhleCBwcml2YXRlIGtleSB0byBhIDI0LXdvcmQgQklQMzkgbW5lbW9uaWMuXG4gKiBAcGFyYW0ge3N0cmluZ30gaGV4S2V5IC0gNjQtY2hhciBoZXggcHJpdmF0ZSBrZXlcbiAqIEByZXR1cm5zIHtzdHJpbmd9IDI0LXdvcmQgbW5lbW9uaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGtleVRvU2VlZFBocmFzZShoZXhLZXkpIHtcbiAgICBjb25zdCBieXRlcyA9IGhleFRvQnl0ZXMoaGV4S2V5KTtcbiAgICByZXR1cm4gZW50cm9weVRvTW5lbW9uaWMoYnl0ZXMsIHdvcmRsaXN0KTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgQklQMzkgbW5lbW9uaWMgYmFjayB0byBhIGhleCBwcml2YXRlIGtleSArIGRlcml2ZWQgcHVia2V5LlxuICogQHBhcmFtIHtzdHJpbmd9IHBocmFzZSAtIDI0LXdvcmQgbW5lbW9uaWNcbiAqIEByZXR1cm5zIHt7IGhleEtleTogc3RyaW5nLCBwdWJLZXk6IHN0cmluZyB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VlZFBocmFzZVRvS2V5KHBocmFzZSkge1xuICAgIGNvbnN0IGVudHJvcHkgPSBtbmVtb25pY1RvRW50cm9weShwaHJhc2UudHJpbSgpLnRvTG93ZXJDYXNlKCksIHdvcmRsaXN0KTtcbiAgICBjb25zdCBoZXhLZXkgPSBieXRlc1RvSGV4KGVudHJvcHkpO1xuICAgIGNvbnN0IHB1YktleSA9IGdldFB1YmxpY0tleVN5bmMoaGV4S2V5KTtcbiAgICByZXR1cm4geyBoZXhLZXksIHB1YktleSB9O1xufVxuXG4vKipcbiAqIFZhbGlkYXRlIGEgQklQMzkgbW5lbW9uaWMgKGNoZWNrc3VtICsgd29yZGxpc3QpLlxuICogQHBhcmFtIHtzdHJpbmd9IHBocmFzZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkU2VlZFBocmFzZShwaHJhc2UpIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVNbmVtb25pYyhwaHJhc2UudHJpbSgpLnRvTG93ZXJDYXNlKCksIHdvcmRsaXN0KTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBGYXN0IGhldXJpc3RpYzogZG9lcyB0aGUgaW5wdXQgbG9vayBsaWtlIGl0IGNvdWxkIGJlIGEgc2VlZCBwaHJhc2U/XG4gKiAoMTIrIHNwYWNlLXNlcGFyYXRlZCBhbHBoYWJldGljIHdvcmRzKVxuICogQHBhcmFtIHtzdHJpbmd9IGlucHV0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvb2tzTGlrZVNlZWRQaHJhc2UoaW5wdXQpIHtcbiAgICBpZiAoIWlucHV0IHx8IHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCB3b3JkcyA9IGlucHV0LnRyaW0oKS5zcGxpdCgvXFxzKy8pO1xuICAgIHJldHVybiB3b3Jkcy5sZW5ndGggPj0gMTIgJiYgd29yZHMuZXZlcnkodyA9PiAvXlthLXpBLVpdKyQvLnRlc3QodykpO1xufVxuIiwgIi8qKlxuICogVXRpbGl0aWVzIGZvciBoZXgsIGJ5dGVzLCBDU1BSTkcuXG4gKiBAbW9kdWxlXG4gKi9cbi8qISBub2JsZS1oYXNoZXMgLSBNSVQgTGljZW5zZSAoYykgMjAyMiBQYXVsIE1pbGxlciAocGF1bG1pbGxyLmNvbSkgKi9cbi8qKiBDaGVja3MgaWYgc29tZXRoaW5nIGlzIFVpbnQ4QXJyYXkuIEJlIGNhcmVmdWw6IG5vZGVqcyBCdWZmZXIgd2lsbCByZXR1cm4gdHJ1ZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0J5dGVzKGE6IHVua25vd24pOiBhIGlzIFVpbnQ4QXJyYXkge1xuICByZXR1cm4gYSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgfHwgKEFycmF5QnVmZmVyLmlzVmlldyhhKSAmJiBhLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdVaW50OEFycmF5Jyk7XG59XG5cbi8qKiBBc3NlcnRzIHNvbWV0aGluZyBpcyBwb3NpdGl2ZSBpbnRlZ2VyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFudW1iZXIobjogbnVtYmVyLCB0aXRsZTogc3RyaW5nID0gJycpOiB2b2lkIHtcbiAgaWYgKCFOdW1iZXIuaXNTYWZlSW50ZWdlcihuKSB8fCBuIDwgMCkge1xuICAgIGNvbnN0IHByZWZpeCA9IHRpdGxlICYmIGBcIiR7dGl0bGV9XCIgYDtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7cHJlZml4fWV4cGVjdGVkIGludGVnZXIgPj0gMCwgZ290ICR7bn1gKTtcbiAgfVxufVxuXG4vKiogQXNzZXJ0cyBzb21ldGhpbmcgaXMgVWludDhBcnJheS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhYnl0ZXModmFsdWU6IFVpbnQ4QXJyYXksIGxlbmd0aD86IG51bWJlciwgdGl0bGU6IHN0cmluZyA9ICcnKTogVWludDhBcnJheSB7XG4gIGNvbnN0IGJ5dGVzID0gaXNCeXRlcyh2YWx1ZSk7XG4gIGNvbnN0IGxlbiA9IHZhbHVlPy5sZW5ndGg7XG4gIGNvbnN0IG5lZWRzTGVuID0gbGVuZ3RoICE9PSB1bmRlZmluZWQ7XG4gIGlmICghYnl0ZXMgfHwgKG5lZWRzTGVuICYmIGxlbiAhPT0gbGVuZ3RoKSkge1xuICAgIGNvbnN0IHByZWZpeCA9IHRpdGxlICYmIGBcIiR7dGl0bGV9XCIgYDtcbiAgICBjb25zdCBvZkxlbiA9IG5lZWRzTGVuID8gYCBvZiBsZW5ndGggJHtsZW5ndGh9YCA6ICcnO1xuICAgIGNvbnN0IGdvdCA9IGJ5dGVzID8gYGxlbmd0aD0ke2xlbn1gIDogYHR5cGU9JHt0eXBlb2YgdmFsdWV9YDtcbiAgICB0aHJvdyBuZXcgRXJyb3IocHJlZml4ICsgJ2V4cGVjdGVkIFVpbnQ4QXJyYXknICsgb2ZMZW4gKyAnLCBnb3QgJyArIGdvdCk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG4vKiogQXNzZXJ0cyBzb21ldGhpbmcgaXMgaGFzaCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFoYXNoKGg6IENIYXNoKTogdm9pZCB7XG4gIGlmICh0eXBlb2YgaCAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgaC5jcmVhdGUgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdIYXNoIG11c3Qgd3JhcHBlZCBieSB1dGlscy5jcmVhdGVIYXNoZXInKTtcbiAgYW51bWJlcihoLm91dHB1dExlbik7XG4gIGFudW1iZXIoaC5ibG9ja0xlbik7XG59XG5cbi8qKiBBc3NlcnRzIGEgaGFzaCBpbnN0YW5jZSBoYXMgbm90IGJlZW4gZGVzdHJveWVkIC8gZmluaXNoZWQgKi9cbmV4cG9ydCBmdW5jdGlvbiBhZXhpc3RzKGluc3RhbmNlOiBhbnksIGNoZWNrRmluaXNoZWQgPSB0cnVlKTogdm9pZCB7XG4gIGlmIChpbnN0YW5jZS5kZXN0cm95ZWQpIHRocm93IG5ldyBFcnJvcignSGFzaCBpbnN0YW5jZSBoYXMgYmVlbiBkZXN0cm95ZWQnKTtcbiAgaWYgKGNoZWNrRmluaXNoZWQgJiYgaW5zdGFuY2UuZmluaXNoZWQpIHRocm93IG5ldyBFcnJvcignSGFzaCNkaWdlc3QoKSBoYXMgYWxyZWFkeSBiZWVuIGNhbGxlZCcpO1xufVxuXG4vKiogQXNzZXJ0cyBvdXRwdXQgaXMgcHJvcGVybHktc2l6ZWQgYnl0ZSBhcnJheSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFvdXRwdXQob3V0OiBhbnksIGluc3RhbmNlOiBhbnkpOiB2b2lkIHtcbiAgYWJ5dGVzKG91dCwgdW5kZWZpbmVkLCAnZGlnZXN0SW50bygpIG91dHB1dCcpO1xuICBjb25zdCBtaW4gPSBpbnN0YW5jZS5vdXRwdXRMZW47XG4gIGlmIChvdXQubGVuZ3RoIDwgbWluKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcImRpZ2VzdEludG8oKSBvdXRwdXRcIiBleHBlY3RlZCB0byBiZSBvZiBsZW5ndGggPj0nICsgbWluKTtcbiAgfVxufVxuXG4vKiogR2VuZXJpYyB0eXBlIGVuY29tcGFzc2luZyA4LzE2LzMyLWJ5dGUgYXJyYXlzIC0gYnV0IG5vdCA2NC1ieXRlLiAqL1xuLy8gcHJldHRpZXItaWdub3JlXG5leHBvcnQgdHlwZSBUeXBlZEFycmF5ID0gSW50OEFycmF5IHwgVWludDhDbGFtcGVkQXJyYXkgfCBVaW50OEFycmF5IHxcbiAgVWludDE2QXJyYXkgfCBJbnQxNkFycmF5IHwgVWludDMyQXJyYXkgfCBJbnQzMkFycmF5O1xuXG4vKiogQ2FzdCB1OCAvIHUxNiAvIHUzMiB0byB1OC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1OChhcnI6IFR5cGVkQXJyYXkpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGFyci5idWZmZXIsIGFyci5ieXRlT2Zmc2V0LCBhcnIuYnl0ZUxlbmd0aCk7XG59XG5cbi8qKiBDYXN0IHU4IC8gdTE2IC8gdTMyIHRvIHUzMi4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1MzIoYXJyOiBUeXBlZEFycmF5KTogVWludDMyQXJyYXkge1xuICByZXR1cm4gbmV3IFVpbnQzMkFycmF5KGFyci5idWZmZXIsIGFyci5ieXRlT2Zmc2V0LCBNYXRoLmZsb29yKGFyci5ieXRlTGVuZ3RoIC8gNCkpO1xufVxuXG4vKiogWmVyb2l6ZSBhIGJ5dGUgYXJyYXkuIFdhcm5pbmc6IEpTIHByb3ZpZGVzIG5vIGd1YXJhbnRlZXMuICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYW4oLi4uYXJyYXlzOiBUeXBlZEFycmF5W10pOiB2b2lkIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheXMubGVuZ3RoOyBpKyspIHtcbiAgICBhcnJheXNbaV0uZmlsbCgwKTtcbiAgfVxufVxuXG4vKiogQ3JlYXRlIERhdGFWaWV3IG9mIGFuIGFycmF5IGZvciBlYXN5IGJ5dGUtbGV2ZWwgbWFuaXB1bGF0aW9uLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVZpZXcoYXJyOiBUeXBlZEFycmF5KTogRGF0YVZpZXcge1xuICByZXR1cm4gbmV3IERhdGFWaWV3KGFyci5idWZmZXIsIGFyci5ieXRlT2Zmc2V0LCBhcnIuYnl0ZUxlbmd0aCk7XG59XG5cbi8qKiBUaGUgcm90YXRlIHJpZ2h0IChjaXJjdWxhciByaWdodCBzaGlmdCkgb3BlcmF0aW9uIGZvciB1aW50MzIgKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RyKHdvcmQ6IG51bWJlciwgc2hpZnQ6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiAod29yZCA8PCAoMzIgLSBzaGlmdCkpIHwgKHdvcmQgPj4+IHNoaWZ0KTtcbn1cblxuLyoqIFRoZSByb3RhdGUgbGVmdCAoY2lyY3VsYXIgbGVmdCBzaGlmdCkgb3BlcmF0aW9uIGZvciB1aW50MzIgKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RsKHdvcmQ6IG51bWJlciwgc2hpZnQ6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiAod29yZCA8PCBzaGlmdCkgfCAoKHdvcmQgPj4+ICgzMiAtIHNoaWZ0KSkgPj4+IDApO1xufVxuXG4vKiogSXMgY3VycmVudCBwbGF0Zm9ybSBsaXR0bGUtZW5kaWFuPyBNb3N0IGFyZS4gQmlnLUVuZGlhbiBwbGF0Zm9ybTogSUJNICovXG5leHBvcnQgY29uc3QgaXNMRTogYm9vbGVhbiA9IC8qIEBfX1BVUkVfXyAqLyAoKCkgPT5cbiAgbmV3IFVpbnQ4QXJyYXkobmV3IFVpbnQzMkFycmF5KFsweDExMjIzMzQ0XSkuYnVmZmVyKVswXSA9PT0gMHg0NCkoKTtcblxuLyoqIFRoZSBieXRlIHN3YXAgb3BlcmF0aW9uIGZvciB1aW50MzIgKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlU3dhcCh3b3JkOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gKFxuICAgICgod29yZCA8PCAyNCkgJiAweGZmMDAwMDAwKSB8XG4gICAgKCh3b3JkIDw8IDgpICYgMHhmZjAwMDApIHxcbiAgICAoKHdvcmQgPj4+IDgpICYgMHhmZjAwKSB8XG4gICAgKCh3b3JkID4+PiAyNCkgJiAweGZmKVxuICApO1xufVxuLyoqIENvbmRpdGlvbmFsbHkgYnl0ZSBzd2FwIGlmIG9uIGEgYmlnLWVuZGlhbiBwbGF0Zm9ybSAqL1xuZXhwb3J0IGNvbnN0IHN3YXA4SWZCRTogKG46IG51bWJlcikgPT4gbnVtYmVyID0gaXNMRVxuICA/IChuOiBudW1iZXIpID0+IG5cbiAgOiAobjogbnVtYmVyKSA9PiBieXRlU3dhcChuKTtcblxuLyoqIEluIHBsYWNlIGJ5dGUgc3dhcCBmb3IgVWludDMyQXJyYXkgKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlU3dhcDMyKGFycjogVWludDMyQXJyYXkpOiBVaW50MzJBcnJheSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgYXJyW2ldID0gYnl0ZVN3YXAoYXJyW2ldKTtcbiAgfVxuICByZXR1cm4gYXJyO1xufVxuXG5leHBvcnQgY29uc3Qgc3dhcDMySWZCRTogKHU6IFVpbnQzMkFycmF5KSA9PiBVaW50MzJBcnJheSA9IGlzTEVcbiAgPyAodTogVWludDMyQXJyYXkpID0+IHVcbiAgOiBieXRlU3dhcDMyO1xuXG4vLyBCdWlsdC1pbiBoZXggY29udmVyc2lvbiBodHRwczovL2Nhbml1c2UuY29tL21kbi1qYXZhc2NyaXB0X2J1aWx0aW5zX3VpbnQ4YXJyYXlfZnJvbWhleFxuY29uc3QgaGFzSGV4QnVpbHRpbjogYm9vbGVhbiA9IC8qIEBfX1BVUkVfXyAqLyAoKCkgPT5cbiAgLy8gQHRzLWlnbm9yZVxuICB0eXBlb2YgVWludDhBcnJheS5mcm9tKFtdKS50b0hleCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgVWludDhBcnJheS5mcm9tSGV4ID09PSAnZnVuY3Rpb24nKSgpO1xuXG4vLyBBcnJheSB3aGVyZSBpbmRleCAweGYwICgyNDApIGlzIG1hcHBlZCB0byBzdHJpbmcgJ2YwJ1xuY29uc3QgaGV4ZXMgPSAvKiBAX19QVVJFX18gKi8gQXJyYXkuZnJvbSh7IGxlbmd0aDogMjU2IH0sIChfLCBpKSA9PlxuICBpLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpXG4pO1xuXG4vKipcbiAqIENvbnZlcnQgYnl0ZSBhcnJheSB0byBoZXggc3RyaW5nLiBVc2VzIGJ1aWx0LWluIGZ1bmN0aW9uLCB3aGVuIGF2YWlsYWJsZS5cbiAqIEBleGFtcGxlIGJ5dGVzVG9IZXgoVWludDhBcnJheS5mcm9tKFsweGNhLCAweGZlLCAweDAxLCAweDIzXSkpIC8vICdjYWZlMDEyMydcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVzVG9IZXgoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICBhYnl0ZXMoYnl0ZXMpO1xuICAvLyBAdHMtaWdub3JlXG4gIGlmIChoYXNIZXhCdWlsdGluKSByZXR1cm4gYnl0ZXMudG9IZXgoKTtcbiAgLy8gcHJlLWNhY2hpbmcgaW1wcm92ZXMgdGhlIHNwZWVkIDZ4XG4gIGxldCBoZXggPSAnJztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKykge1xuICAgIGhleCArPSBoZXhlc1tieXRlc1tpXV07XG4gIH1cbiAgcmV0dXJuIGhleDtcbn1cblxuLy8gV2UgdXNlIG9wdGltaXplZCB0ZWNobmlxdWUgdG8gY29udmVydCBoZXggc3RyaW5nIHRvIGJ5dGUgYXJyYXlcbmNvbnN0IGFzY2lpcyA9IHsgXzA6IDQ4LCBfOTogNTcsIEE6IDY1LCBGOiA3MCwgYTogOTcsIGY6IDEwMiB9IGFzIGNvbnN0O1xuZnVuY3Rpb24gYXNjaWlUb0Jhc2UxNihjaDogbnVtYmVyKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGNoID49IGFzY2lpcy5fMCAmJiBjaCA8PSBhc2NpaXMuXzkpIHJldHVybiBjaCAtIGFzY2lpcy5fMDsgLy8gJzInID0+IDUwLTQ4XG4gIGlmIChjaCA+PSBhc2NpaXMuQSAmJiBjaCA8PSBhc2NpaXMuRikgcmV0dXJuIGNoIC0gKGFzY2lpcy5BIC0gMTApOyAvLyAnQicgPT4gNjYtKDY1LTEwKVxuICBpZiAoY2ggPj0gYXNjaWlzLmEgJiYgY2ggPD0gYXNjaWlzLmYpIHJldHVybiBjaCAtIChhc2NpaXMuYSAtIDEwKTsgLy8gJ2InID0+IDk4LSg5Ny0xMClcbiAgcmV0dXJuO1xufVxuXG4vKipcbiAqIENvbnZlcnQgaGV4IHN0cmluZyB0byBieXRlIGFycmF5LiBVc2VzIGJ1aWx0LWluIGZ1bmN0aW9uLCB3aGVuIGF2YWlsYWJsZS5cbiAqIEBleGFtcGxlIGhleFRvQnl0ZXMoJ2NhZmUwMTIzJykgLy8gVWludDhBcnJheS5mcm9tKFsweGNhLCAweGZlLCAweDAxLCAweDIzXSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhleFRvQnl0ZXMoaGV4OiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgaWYgKHR5cGVvZiBoZXggIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ2hleCBzdHJpbmcgZXhwZWN0ZWQsIGdvdCAnICsgdHlwZW9mIGhleCk7XG4gIC8vIEB0cy1pZ25vcmVcbiAgaWYgKGhhc0hleEJ1aWx0aW4pIHJldHVybiBVaW50OEFycmF5LmZyb21IZXgoaGV4KTtcbiAgY29uc3QgaGwgPSBoZXgubGVuZ3RoO1xuICBjb25zdCBhbCA9IGhsIC8gMjtcbiAgaWYgKGhsICUgMikgdGhyb3cgbmV3IEVycm9yKCdoZXggc3RyaW5nIGV4cGVjdGVkLCBnb3QgdW5wYWRkZWQgaGV4IG9mIGxlbmd0aCAnICsgaGwpO1xuICBjb25zdCBhcnJheSA9IG5ldyBVaW50OEFycmF5KGFsKTtcbiAgZm9yIChsZXQgYWkgPSAwLCBoaSA9IDA7IGFpIDwgYWw7IGFpKyssIGhpICs9IDIpIHtcbiAgICBjb25zdCBuMSA9IGFzY2lpVG9CYXNlMTYoaGV4LmNoYXJDb2RlQXQoaGkpKTtcbiAgICBjb25zdCBuMiA9IGFzY2lpVG9CYXNlMTYoaGV4LmNoYXJDb2RlQXQoaGkgKyAxKSk7XG4gICAgaWYgKG4xID09PSB1bmRlZmluZWQgfHwgbjIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgY2hhciA9IGhleFtoaV0gKyBoZXhbaGkgKyAxXTtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaGV4IHN0cmluZyBleHBlY3RlZCwgZ290IG5vbi1oZXggY2hhcmFjdGVyIFwiJyArIGNoYXIgKyAnXCIgYXQgaW5kZXggJyArIGhpKTtcbiAgICB9XG4gICAgYXJyYXlbYWldID0gbjEgKiAxNiArIG4yOyAvLyBtdWx0aXBseSBmaXJzdCBvY3RldCwgZS5nLiAnYTMnID0+IDEwKjE2KzMgPT4gMTYwICsgMyA9PiAxNjNcbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbi8qKlxuICogVGhlcmUgaXMgbm8gc2V0SW1tZWRpYXRlIGluIGJyb3dzZXIgYW5kIHNldFRpbWVvdXQgaXMgc2xvdy5cbiAqIENhbGwgb2YgYXN5bmMgZm4gd2lsbCByZXR1cm4gUHJvbWlzZSwgd2hpY2ggd2lsbCBiZSBmdWxsZmlsZWQgb25seSBvblxuICogbmV4dCBzY2hlZHVsZXIgcXVldWUgcHJvY2Vzc2luZyBzdGVwIGFuZCB0aGlzIGlzIGV4YWN0bHkgd2hhdCB3ZSBuZWVkLlxuICovXG5leHBvcnQgY29uc3QgbmV4dFRpY2sgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7fTtcblxuLyoqIFJldHVybnMgY29udHJvbCB0byB0aHJlYWQgZWFjaCAndGljaycgbXMgdG8gYXZvaWQgYmxvY2tpbmcuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXN5bmNMb29wKFxuICBpdGVyczogbnVtYmVyLFxuICB0aWNrOiBudW1iZXIsXG4gIGNiOiAoaTogbnVtYmVyKSA9PiB2b2lkXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgbGV0IHRzID0gRGF0ZS5ub3coKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyczsgaSsrKSB7XG4gICAgY2IoaSk7XG4gICAgLy8gRGF0ZS5ub3coKSBpcyBub3QgbW9ub3RvbmljLCBzbyBpbiBjYXNlIGlmIGNsb2NrIGdvZXMgYmFja3dhcmRzIHdlIHJldHVybiByZXR1cm4gY29udHJvbCB0b29cbiAgICBjb25zdCBkaWZmID0gRGF0ZS5ub3coKSAtIHRzO1xuICAgIGlmIChkaWZmID49IDAgJiYgZGlmZiA8IHRpY2spIGNvbnRpbnVlO1xuICAgIGF3YWl0IG5leHRUaWNrKCk7XG4gICAgdHMgKz0gZGlmZjtcbiAgfVxufVxuXG4vLyBHbG9iYWwgc3ltYm9scywgYnV0IHRzIGRvZXNuJ3Qgc2VlIHRoZW06IGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMzE1MzVcbmRlY2xhcmUgY29uc3QgVGV4dEVuY29kZXI6IGFueTtcblxuLyoqXG4gKiBDb252ZXJ0cyBzdHJpbmcgdG8gYnl0ZXMgdXNpbmcgVVRGOCBlbmNvZGluZy5cbiAqIEJ1aWx0LWluIGRvZXNuJ3QgdmFsaWRhdGUgaW5wdXQgdG8gYmUgc3RyaW5nOiB3ZSBkbyB0aGUgY2hlY2suXG4gKiBAZXhhbXBsZSB1dGY4VG9CeXRlcygnYWJjJykgLy8gVWludDhBcnJheS5mcm9tKFs5NywgOTgsIDk5XSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHV0ZjhUb0J5dGVzKHN0cjogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdzdHJpbmcgZXhwZWN0ZWQnKTtcbiAgcmV0dXJuIG5ldyBVaW50OEFycmF5KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzdHIpKTsgLy8gaHR0cHM6Ly9idWd6aWwubGEvMTY4MTgwOVxufVxuXG4vKiogS0RGcyBjYW4gYWNjZXB0IHN0cmluZyBvciBVaW50OEFycmF5IGZvciB1c2VyIGNvbnZlbmllbmNlLiAqL1xuZXhwb3J0IHR5cGUgS0RGSW5wdXQgPSBzdHJpbmcgfCBVaW50OEFycmF5O1xuXG4vKipcbiAqIEhlbHBlciBmb3IgS0RGczogY29uc3VtZXMgdWludDhhcnJheSBvciBzdHJpbmcuXG4gKiBXaGVuIHN0cmluZyBpcyBwYXNzZWQsIGRvZXMgdXRmOCBkZWNvZGluZywgdXNpbmcgVGV4dERlY29kZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBrZGZJbnB1dFRvQnl0ZXMoZGF0YTogS0RGSW5wdXQsIGVycm9yVGl0bGUgPSAnJyk6IFVpbnQ4QXJyYXkge1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSByZXR1cm4gdXRmOFRvQnl0ZXMoZGF0YSk7XG4gIHJldHVybiBhYnl0ZXMoZGF0YSwgdW5kZWZpbmVkLCBlcnJvclRpdGxlKTtcbn1cblxuLyoqIENvcGllcyBzZXZlcmFsIFVpbnQ4QXJyYXlzIGludG8gb25lLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmNhdEJ5dGVzKC4uLmFycmF5czogVWludDhBcnJheVtdKTogVWludDhBcnJheSB7XG4gIGxldCBzdW0gPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5cy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGEgPSBhcnJheXNbaV07XG4gICAgYWJ5dGVzKGEpO1xuICAgIHN1bSArPSBhLmxlbmd0aDtcbiAgfVxuICBjb25zdCByZXMgPSBuZXcgVWludDhBcnJheShzdW0pO1xuICBmb3IgKGxldCBpID0gMCwgcGFkID0gMDsgaSA8IGFycmF5cy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGEgPSBhcnJheXNbaV07XG4gICAgcmVzLnNldChhLCBwYWQpO1xuICAgIHBhZCArPSBhLmxlbmd0aDtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG50eXBlIEVtcHR5T2JqID0ge307XG4vKiogTWVyZ2VzIGRlZmF1bHQgb3B0aW9ucyBhbmQgcGFzc2VkIG9wdGlvbnMuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tPcHRzPFQxIGV4dGVuZHMgRW1wdHlPYmosIFQyIGV4dGVuZHMgRW1wdHlPYmo+KFxuICBkZWZhdWx0czogVDEsXG4gIG9wdHM/OiBUMlxuKTogVDEgJiBUMiB7XG4gIGlmIChvcHRzICE9PSB1bmRlZmluZWQgJiYge30udG9TdHJpbmcuY2FsbChvcHRzKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdvcHRpb25zIG11c3QgYmUgb2JqZWN0IG9yIHVuZGVmaW5lZCcpO1xuICBjb25zdCBtZXJnZWQgPSBPYmplY3QuYXNzaWduKGRlZmF1bHRzLCBvcHRzKTtcbiAgcmV0dXJuIG1lcmdlZCBhcyBUMSAmIFQyO1xufVxuXG4vKiogQ29tbW9uIGludGVyZmFjZSBmb3IgYWxsIGhhc2hlcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSGFzaDxUPiB7XG4gIGJsb2NrTGVuOiBudW1iZXI7IC8vIEJ5dGVzIHBlciBibG9ja1xuICBvdXRwdXRMZW46IG51bWJlcjsgLy8gQnl0ZXMgaW4gb3V0cHV0XG4gIHVwZGF0ZShidWY6IFVpbnQ4QXJyYXkpOiB0aGlzO1xuICBkaWdlc3RJbnRvKGJ1ZjogVWludDhBcnJheSk6IHZvaWQ7XG4gIGRpZ2VzdCgpOiBVaW50OEFycmF5O1xuICBkZXN0cm95KCk6IHZvaWQ7XG4gIF9jbG9uZUludG8odG8/OiBUKTogVDtcbiAgY2xvbmUoKTogVDtcbn1cblxuLyoqIFBzZXVkb1JhbmRvbSAobnVtYmVyKSBHZW5lcmF0b3IgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUFJHIHtcbiAgYWRkRW50cm9weShzZWVkOiBVaW50OEFycmF5KTogdm9pZDtcbiAgcmFuZG9tQnl0ZXMobGVuZ3RoOiBudW1iZXIpOiBVaW50OEFycmF5O1xuICBjbGVhbigpOiB2b2lkO1xufVxuXG4vKipcbiAqIFhPRjogc3RyZWFtaW5nIEFQSSB0byByZWFkIGRpZ2VzdCBpbiBjaHVua3MuXG4gKiBTYW1lIGFzICdzcXVlZXplJyBpbiBrZWNjYWsvazEyIGFuZCAnc2VlaycgaW4gYmxha2UzLCBidXQgbW9yZSBnZW5lcmljIG5hbWUuXG4gKiBXaGVuIGhhc2ggdXNlZCBpbiBYT0YgbW9kZSBpdCBpcyB1cCB0byB1c2VyIHRvIGNhbGwgJy5kZXN0cm95JyBhZnRlcndhcmRzLCBzaW5jZSB3ZSBjYW5ub3RcbiAqIGRlc3Ryb3kgc3RhdGUsIG5leHQgY2FsbCBjYW4gcmVxdWlyZSBtb3JlIGJ5dGVzLlxuICovXG5leHBvcnQgdHlwZSBIYXNoWE9GPFQgZXh0ZW5kcyBIYXNoPFQ+PiA9IEhhc2g8VD4gJiB7XG4gIHhvZihieXRlczogbnVtYmVyKTogVWludDhBcnJheTsgLy8gUmVhZCAnYnl0ZXMnIGJ5dGVzIGZyb20gZGlnZXN0IHN0cmVhbVxuICB4b2ZJbnRvKGJ1ZjogVWludDhBcnJheSk6IFVpbnQ4QXJyYXk7IC8vIHJlYWQgYnVmLmxlbmd0aCBieXRlcyBmcm9tIGRpZ2VzdCBzdHJlYW0gaW50byBidWZcbn07XG5cbi8qKiBIYXNoIGNvbnN0cnVjdG9yICovXG5leHBvcnQgdHlwZSBIYXNoZXJDb25zPFQsIE9wdHMgPSB1bmRlZmluZWQ+ID0gT3B0cyBleHRlbmRzIHVuZGVmaW5lZCA/ICgpID0+IFQgOiAob3B0cz86IE9wdHMpID0+IFQ7XG4vKiogT3B0aW9uYWwgaGFzaCBwYXJhbXMuICovXG5leHBvcnQgdHlwZSBIYXNoSW5mbyA9IHtcbiAgb2lkPzogVWludDhBcnJheTsgLy8gREVSIGVuY29kZWQgT0lEIGluIGJ5dGVzXG59O1xuLyoqIEhhc2ggZnVuY3Rpb24gKi9cbmV4cG9ydCB0eXBlIENIYXNoPFQgZXh0ZW5kcyBIYXNoPFQ+ID0gSGFzaDxhbnk+LCBPcHRzID0gdW5kZWZpbmVkPiA9IHtcbiAgb3V0cHV0TGVuOiBudW1iZXI7XG4gIGJsb2NrTGVuOiBudW1iZXI7XG59ICYgSGFzaEluZm8gJlxuICAoT3B0cyBleHRlbmRzIHVuZGVmaW5lZFxuICAgID8ge1xuICAgICAgICAobXNnOiBVaW50OEFycmF5KTogVWludDhBcnJheTtcbiAgICAgICAgY3JlYXRlKCk6IFQ7XG4gICAgICB9XG4gICAgOiB7XG4gICAgICAgIChtc2c6IFVpbnQ4QXJyYXksIG9wdHM/OiBPcHRzKTogVWludDhBcnJheTtcbiAgICAgICAgY3JlYXRlKG9wdHM/OiBPcHRzKTogVDtcbiAgICAgIH0pO1xuLyoqIFhPRiB3aXRoIG91dHB1dCAqL1xuZXhwb3J0IHR5cGUgQ0hhc2hYT0Y8VCBleHRlbmRzIEhhc2hYT0Y8VD4gPSBIYXNoWE9GPGFueT4sIE9wdHMgPSB1bmRlZmluZWQ+ID0gQ0hhc2g8VCwgT3B0cz47XG5cbi8qKiBDcmVhdGVzIGZ1bmN0aW9uIHdpdGggb3V0cHV0TGVuLCBibG9ja0xlbiwgY3JlYXRlIHByb3BlcnRpZXMgZnJvbSBhIGNsYXNzIGNvbnN0cnVjdG9yLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhhc2hlcjxUIGV4dGVuZHMgSGFzaDxUPiwgT3B0cyA9IHVuZGVmaW5lZD4oXG4gIGhhc2hDb25zOiBIYXNoZXJDb25zPFQsIE9wdHM+LFxuICBpbmZvOiBIYXNoSW5mbyA9IHt9XG4pOiBDSGFzaDxULCBPcHRzPiB7XG4gIGNvbnN0IGhhc2hDOiBhbnkgPSAobXNnOiBVaW50OEFycmF5LCBvcHRzPzogT3B0cykgPT4gaGFzaENvbnMob3B0cykudXBkYXRlKG1zZykuZGlnZXN0KCk7XG4gIGNvbnN0IHRtcCA9IGhhc2hDb25zKHVuZGVmaW5lZCk7XG4gIGhhc2hDLm91dHB1dExlbiA9IHRtcC5vdXRwdXRMZW47XG4gIGhhc2hDLmJsb2NrTGVuID0gdG1wLmJsb2NrTGVuO1xuICBoYXNoQy5jcmVhdGUgPSAob3B0cz86IE9wdHMpID0+IGhhc2hDb25zKG9wdHMpO1xuICBPYmplY3QuYXNzaWduKGhhc2hDLCBpbmZvKTtcbiAgcmV0dXJuIE9iamVjdC5mcmVlemUoaGFzaEMpO1xufVxuXG4vKiogQ3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIFBSTkcuIFVzZXMgaW50ZXJuYWwgT1MtbGV2ZWwgYGNyeXB0by5nZXRSYW5kb21WYWx1ZXNgLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbUJ5dGVzKGJ5dGVzTGVuZ3RoID0gMzIpOiBVaW50OEFycmF5IHtcbiAgY29uc3QgY3IgPSB0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcgPyAoZ2xvYmFsVGhpcyBhcyBhbnkpLmNyeXB0byA6IG51bGw7XG4gIGlmICh0eXBlb2YgY3I/LmdldFJhbmRvbVZhbHVlcyAhPT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyeXB0by5nZXRSYW5kb21WYWx1ZXMgbXVzdCBiZSBkZWZpbmVkJyk7XG4gIHJldHVybiBjci5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoYnl0ZXNMZW5ndGgpKTtcbn1cblxuLyoqIENyZWF0ZXMgT0lEIG9wdHMgZm9yIE5JU1QgaGFzaGVzLCB3aXRoIHByZWZpeCAwNiAwOSA2MCA4NiA0OCAwMSA2NSAwMyAwNCAwMi4gKi9cbmV4cG9ydCBjb25zdCBvaWROaXN0ID0gKHN1ZmZpeDogbnVtYmVyKTogUmVxdWlyZWQ8SGFzaEluZm8+ID0+ICh7XG4gIG9pZDogVWludDhBcnJheS5mcm9tKFsweDA2LCAweDA5LCAweDYwLCAweDg2LCAweDQ4LCAweDAxLCAweDY1LCAweDAzLCAweDA0LCAweDAyLCBzdWZmaXhdKSxcbn0pO1xuIiwgIi8qKlxuICogU0hBMiBoYXNoIGZ1bmN0aW9uLiBBLmsuYS4gc2hhMjU2LCBzaGEzODQsIHNoYTUxMiwgc2hhNTEyXzIyNCwgc2hhNTEyXzI1Ni5cbiAqIFNIQTI1NiBpcyB0aGUgZmFzdGVzdCBoYXNoIGltcGxlbWVudGFibGUgaW4gSlMsIGV2ZW4gZmFzdGVyIHRoYW4gQmxha2UzLlxuICogQ2hlY2sgb3V0IFtSRkMgNDYzNF0oaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzQ2MzQpIGFuZFxuICogW0ZJUFMgMTgwLTRdKGh0dHBzOi8vbnZscHVicy5uaXN0Lmdvdi9uaXN0cHVicy9GSVBTL05JU1QuRklQUy4xODAtNC5wZGYpLlxuICogQG1vZHVsZVxuICovXG5pbXBvcnQgeyBDaGksIEhhc2hNRCwgTWFqLCBTSEEyMjRfSVYsIFNIQTI1Nl9JViwgU0hBMzg0X0lWLCBTSEE1MTJfSVYgfSBmcm9tICcuL19tZC50cyc7XG5pbXBvcnQgKiBhcyB1NjQgZnJvbSAnLi9fdTY0LnRzJztcbmltcG9ydCB7IHR5cGUgQ0hhc2gsIGNsZWFuLCBjcmVhdGVIYXNoZXIsIG9pZE5pc3QsIHJvdHIgfSBmcm9tICcuL3V0aWxzLnRzJztcblxuLyoqXG4gKiBSb3VuZCBjb25zdGFudHM6XG4gKiBGaXJzdCAzMiBiaXRzIG9mIGZyYWN0aW9uYWwgcGFydHMgb2YgdGhlIGN1YmUgcm9vdHMgb2YgdGhlIGZpcnN0IDY0IHByaW1lcyAyLi4zMTEpXG4gKi9cbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgU0hBMjU2X0sgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4NDI4YTJmOTgsIDB4NzEzNzQ0OTEsIDB4YjVjMGZiY2YsIDB4ZTliNWRiYTUsIDB4Mzk1NmMyNWIsIDB4NTlmMTExZjEsIDB4OTIzZjgyYTQsIDB4YWIxYzVlZDUsXG4gIDB4ZDgwN2FhOTgsIDB4MTI4MzViMDEsIDB4MjQzMTg1YmUsIDB4NTUwYzdkYzMsIDB4NzJiZTVkNzQsIDB4ODBkZWIxZmUsIDB4OWJkYzA2YTcsIDB4YzE5YmYxNzQsXG4gIDB4ZTQ5YjY5YzEsIDB4ZWZiZTQ3ODYsIDB4MGZjMTlkYzYsIDB4MjQwY2ExY2MsIDB4MmRlOTJjNmYsIDB4NGE3NDg0YWEsIDB4NWNiMGE5ZGMsIDB4NzZmOTg4ZGEsXG4gIDB4OTgzZTUxNTIsIDB4YTgzMWM2NmQsIDB4YjAwMzI3YzgsIDB4YmY1OTdmYzcsIDB4YzZlMDBiZjMsIDB4ZDVhNzkxNDcsIDB4MDZjYTYzNTEsIDB4MTQyOTI5NjcsXG4gIDB4MjdiNzBhODUsIDB4MmUxYjIxMzgsIDB4NGQyYzZkZmMsIDB4NTMzODBkMTMsIDB4NjUwYTczNTQsIDB4NzY2YTBhYmIsIDB4ODFjMmM5MmUsIDB4OTI3MjJjODUsXG4gIDB4YTJiZmU4YTEsIDB4YTgxYTY2NGIsIDB4YzI0YjhiNzAsIDB4Yzc2YzUxYTMsIDB4ZDE5MmU4MTksIDB4ZDY5OTA2MjQsIDB4ZjQwZTM1ODUsIDB4MTA2YWEwNzAsXG4gIDB4MTlhNGMxMTYsIDB4MWUzNzZjMDgsIDB4Mjc0ODc3NGMsIDB4MzRiMGJjYjUsIDB4MzkxYzBjYjMsIDB4NGVkOGFhNGEsIDB4NWI5Y2NhNGYsIDB4NjgyZTZmZjMsXG4gIDB4NzQ4ZjgyZWUsIDB4NzhhNTYzNmYsIDB4ODRjODc4MTQsIDB4OGNjNzAyMDgsIDB4OTBiZWZmZmEsIDB4YTQ1MDZjZWIsIDB4YmVmOWEzZjcsIDB4YzY3MTc4ZjJcbl0pO1xuXG4vKiogUmV1c2FibGUgdGVtcG9yYXJ5IGJ1ZmZlci4gXCJXXCIgY29tZXMgc3RyYWlnaHQgZnJvbSBzcGVjLiAqL1xuY29uc3QgU0hBMjU2X1cgPSAvKiBAX19QVVJFX18gKi8gbmV3IFVpbnQzMkFycmF5KDY0KTtcblxuLyoqIEludGVybmFsIDMyLWJ5dGUgYmFzZSBTSEEyIGhhc2ggY2xhc3MuICovXG5hYnN0cmFjdCBjbGFzcyBTSEEyXzMyQjxUIGV4dGVuZHMgU0hBMl8zMkI8VD4+IGV4dGVuZHMgSGFzaE1EPFQ+IHtcbiAgLy8gV2UgY2Fubm90IHVzZSBhcnJheSBoZXJlIHNpbmNlIGFycmF5IGFsbG93cyBpbmRleGluZyBieSB2YXJpYWJsZVxuICAvLyB3aGljaCBtZWFucyBvcHRpbWl6ZXIvY29tcGlsZXIgY2Fubm90IHVzZSByZWdpc3RlcnMuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBBOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBCOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBDOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBEOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBFOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBGOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBHOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBIOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Iob3V0cHV0TGVuOiBudW1iZXIpIHtcbiAgICBzdXBlcig2NCwgb3V0cHV0TGVuLCA4LCBmYWxzZSk7XG4gIH1cbiAgcHJvdGVjdGVkIGdldCgpOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdIHtcbiAgICBjb25zdCB7IEEsIEIsIEMsIEQsIEUsIEYsIEcsIEggfSA9IHRoaXM7XG4gICAgcmV0dXJuIFtBLCBCLCBDLCBELCBFLCBGLCBHLCBIXTtcbiAgfVxuICAvLyBwcmV0dGllci1pZ25vcmVcbiAgcHJvdGVjdGVkIHNldChcbiAgICBBOiBudW1iZXIsIEI6IG51bWJlciwgQzogbnVtYmVyLCBEOiBudW1iZXIsIEU6IG51bWJlciwgRjogbnVtYmVyLCBHOiBudW1iZXIsIEg6IG51bWJlclxuICApOiB2b2lkIHtcbiAgICB0aGlzLkEgPSBBIHwgMDtcbiAgICB0aGlzLkIgPSBCIHwgMDtcbiAgICB0aGlzLkMgPSBDIHwgMDtcbiAgICB0aGlzLkQgPSBEIHwgMDtcbiAgICB0aGlzLkUgPSBFIHwgMDtcbiAgICB0aGlzLkYgPSBGIHwgMDtcbiAgICB0aGlzLkcgPSBHIHwgMDtcbiAgICB0aGlzLkggPSBIIHwgMDtcbiAgfVxuICBwcm90ZWN0ZWQgcHJvY2Vzcyh2aWV3OiBEYXRhVmlldywgb2Zmc2V0OiBudW1iZXIpOiB2b2lkIHtcbiAgICAvLyBFeHRlbmQgdGhlIGZpcnN0IDE2IHdvcmRzIGludG8gdGhlIHJlbWFpbmluZyA0OCB3b3JkcyB3WzE2Li42M10gb2YgdGhlIG1lc3NhZ2Ugc2NoZWR1bGUgYXJyYXlcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2OyBpKyssIG9mZnNldCArPSA0KSBTSEEyNTZfV1tpXSA9IHZpZXcuZ2V0VWludDMyKG9mZnNldCwgZmFsc2UpO1xuICAgIGZvciAobGV0IGkgPSAxNjsgaSA8IDY0OyBpKyspIHtcbiAgICAgIGNvbnN0IFcxNSA9IFNIQTI1Nl9XW2kgLSAxNV07XG4gICAgICBjb25zdCBXMiA9IFNIQTI1Nl9XW2kgLSAyXTtcbiAgICAgIGNvbnN0IHMwID0gcm90cihXMTUsIDcpIF4gcm90cihXMTUsIDE4KSBeIChXMTUgPj4+IDMpO1xuICAgICAgY29uc3QgczEgPSByb3RyKFcyLCAxNykgXiByb3RyKFcyLCAxOSkgXiAoVzIgPj4+IDEwKTtcbiAgICAgIFNIQTI1Nl9XW2ldID0gKHMxICsgU0hBMjU2X1dbaSAtIDddICsgczAgKyBTSEEyNTZfV1tpIC0gMTZdKSB8IDA7XG4gICAgfVxuICAgIC8vIENvbXByZXNzaW9uIGZ1bmN0aW9uIG1haW4gbG9vcCwgNjQgcm91bmRzXG4gICAgbGV0IHsgQSwgQiwgQywgRCwgRSwgRiwgRywgSCB9ID0gdGhpcztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY0OyBpKyspIHtcbiAgICAgIGNvbnN0IHNpZ21hMSA9IHJvdHIoRSwgNikgXiByb3RyKEUsIDExKSBeIHJvdHIoRSwgMjUpO1xuICAgICAgY29uc3QgVDEgPSAoSCArIHNpZ21hMSArIENoaShFLCBGLCBHKSArIFNIQTI1Nl9LW2ldICsgU0hBMjU2X1dbaV0pIHwgMDtcbiAgICAgIGNvbnN0IHNpZ21hMCA9IHJvdHIoQSwgMikgXiByb3RyKEEsIDEzKSBeIHJvdHIoQSwgMjIpO1xuICAgICAgY29uc3QgVDIgPSAoc2lnbWEwICsgTWFqKEEsIEIsIEMpKSB8IDA7XG4gICAgICBIID0gRztcbiAgICAgIEcgPSBGO1xuICAgICAgRiA9IEU7XG4gICAgICBFID0gKEQgKyBUMSkgfCAwO1xuICAgICAgRCA9IEM7XG4gICAgICBDID0gQjtcbiAgICAgIEIgPSBBO1xuICAgICAgQSA9IChUMSArIFQyKSB8IDA7XG4gICAgfVxuICAgIC8vIEFkZCB0aGUgY29tcHJlc3NlZCBjaHVuayB0byB0aGUgY3VycmVudCBoYXNoIHZhbHVlXG4gICAgQSA9IChBICsgdGhpcy5BKSB8IDA7XG4gICAgQiA9IChCICsgdGhpcy5CKSB8IDA7XG4gICAgQyA9IChDICsgdGhpcy5DKSB8IDA7XG4gICAgRCA9IChEICsgdGhpcy5EKSB8IDA7XG4gICAgRSA9IChFICsgdGhpcy5FKSB8IDA7XG4gICAgRiA9IChGICsgdGhpcy5GKSB8IDA7XG4gICAgRyA9IChHICsgdGhpcy5HKSB8IDA7XG4gICAgSCA9IChIICsgdGhpcy5IKSB8IDA7XG4gICAgdGhpcy5zZXQoQSwgQiwgQywgRCwgRSwgRiwgRywgSCk7XG4gIH1cbiAgcHJvdGVjdGVkIHJvdW5kQ2xlYW4oKTogdm9pZCB7XG4gICAgY2xlYW4oU0hBMjU2X1cpO1xuICB9XG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5zZXQoMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCk7XG4gICAgY2xlYW4odGhpcy5idWZmZXIpO1xuICB9XG59XG5cbi8qKiBJbnRlcm5hbCBTSEEyLTI1NiBoYXNoIGNsYXNzLiAqL1xuZXhwb3J0IGNsYXNzIF9TSEEyNTYgZXh0ZW5kcyBTSEEyXzMyQjxfU0hBMjU2PiB7XG4gIC8vIFdlIGNhbm5vdCB1c2UgYXJyYXkgaGVyZSBzaW5jZSBhcnJheSBhbGxvd3MgaW5kZXhpbmcgYnkgdmFyaWFibGVcbiAgLy8gd2hpY2ggbWVhbnMgb3B0aW1pemVyL2NvbXBpbGVyIGNhbm5vdCB1c2UgcmVnaXN0ZXJzLlxuICBwcm90ZWN0ZWQgQTogbnVtYmVyID0gU0hBMjU2X0lWWzBdIHwgMDtcbiAgcHJvdGVjdGVkIEI6IG51bWJlciA9IFNIQTI1Nl9JVlsxXSB8IDA7XG4gIHByb3RlY3RlZCBDOiBudW1iZXIgPSBTSEEyNTZfSVZbMl0gfCAwO1xuICBwcm90ZWN0ZWQgRDogbnVtYmVyID0gU0hBMjU2X0lWWzNdIHwgMDtcbiAgcHJvdGVjdGVkIEU6IG51bWJlciA9IFNIQTI1Nl9JVls0XSB8IDA7XG4gIHByb3RlY3RlZCBGOiBudW1iZXIgPSBTSEEyNTZfSVZbNV0gfCAwO1xuICBwcm90ZWN0ZWQgRzogbnVtYmVyID0gU0hBMjU2X0lWWzZdIHwgMDtcbiAgcHJvdGVjdGVkIEg6IG51bWJlciA9IFNIQTI1Nl9JVls3XSB8IDA7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKDMyKTtcbiAgfVxufVxuXG4vKiogSW50ZXJuYWwgU0hBMi0yMjQgaGFzaCBjbGFzcy4gKi9cbmV4cG9ydCBjbGFzcyBfU0hBMjI0IGV4dGVuZHMgU0hBMl8zMkI8X1NIQTIyND4ge1xuICBwcm90ZWN0ZWQgQTogbnVtYmVyID0gU0hBMjI0X0lWWzBdIHwgMDtcbiAgcHJvdGVjdGVkIEI6IG51bWJlciA9IFNIQTIyNF9JVlsxXSB8IDA7XG4gIHByb3RlY3RlZCBDOiBudW1iZXIgPSBTSEEyMjRfSVZbMl0gfCAwO1xuICBwcm90ZWN0ZWQgRDogbnVtYmVyID0gU0hBMjI0X0lWWzNdIHwgMDtcbiAgcHJvdGVjdGVkIEU6IG51bWJlciA9IFNIQTIyNF9JVls0XSB8IDA7XG4gIHByb3RlY3RlZCBGOiBudW1iZXIgPSBTSEEyMjRfSVZbNV0gfCAwO1xuICBwcm90ZWN0ZWQgRzogbnVtYmVyID0gU0hBMjI0X0lWWzZdIHwgMDtcbiAgcHJvdGVjdGVkIEg6IG51bWJlciA9IFNIQTIyNF9JVls3XSB8IDA7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKDI4KTtcbiAgfVxufVxuXG4vLyBTSEEyLTUxMiBpcyBzbG93ZXIgdGhhbiBzaGEyNTYgaW4ganMgYmVjYXVzZSB1NjQgb3BlcmF0aW9ucyBhcmUgc2xvdy5cblxuLy8gUm91bmQgY29udGFudHNcbi8vIEZpcnN0IDMyIGJpdHMgb2YgdGhlIGZyYWN0aW9uYWwgcGFydHMgb2YgdGhlIGN1YmUgcm9vdHMgb2YgdGhlIGZpcnN0IDgwIHByaW1lcyAyLi40MDlcbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgSzUxMiA9IC8qIEBfX1BVUkVfXyAqLyAoKCkgPT4gdTY0LnNwbGl0KFtcbiAgJzB4NDI4YTJmOThkNzI4YWUyMicsICcweDcxMzc0NDkxMjNlZjY1Y2QnLCAnMHhiNWMwZmJjZmVjNGQzYjJmJywgJzB4ZTliNWRiYTU4MTg5ZGJiYycsXG4gICcweDM5NTZjMjViZjM0OGI1MzgnLCAnMHg1OWYxMTFmMWI2MDVkMDE5JywgJzB4OTIzZjgyYTRhZjE5NGY5YicsICcweGFiMWM1ZWQ1ZGE2ZDgxMTgnLFxuICAnMHhkODA3YWE5OGEzMDMwMjQyJywgJzB4MTI4MzViMDE0NTcwNmZiZScsICcweDI0MzE4NWJlNGVlNGIyOGMnLCAnMHg1NTBjN2RjM2Q1ZmZiNGUyJyxcbiAgJzB4NzJiZTVkNzRmMjdiODk2ZicsICcweDgwZGViMWZlM2IxNjk2YjEnLCAnMHg5YmRjMDZhNzI1YzcxMjM1JywgJzB4YzE5YmYxNzRjZjY5MjY5NCcsXG4gICcweGU0OWI2OWMxOWVmMTRhZDInLCAnMHhlZmJlNDc4NjM4NGYyNWUzJywgJzB4MGZjMTlkYzY4YjhjZDViNScsICcweDI0MGNhMWNjNzdhYzljNjUnLFxuICAnMHgyZGU5MmM2ZjU5MmIwMjc1JywgJzB4NGE3NDg0YWE2ZWE2ZTQ4MycsICcweDVjYjBhOWRjYmQ0MWZiZDQnLCAnMHg3NmY5ODhkYTgzMTE1M2I1JyxcbiAgJzB4OTgzZTUxNTJlZTY2ZGZhYicsICcweGE4MzFjNjZkMmRiNDMyMTAnLCAnMHhiMDAzMjdjODk4ZmIyMTNmJywgJzB4YmY1OTdmYzdiZWVmMGVlNCcsXG4gICcweGM2ZTAwYmYzM2RhODhmYzInLCAnMHhkNWE3OTE0NzkzMGFhNzI1JywgJzB4MDZjYTYzNTFlMDAzODI2ZicsICcweDE0MjkyOTY3MGEwZTZlNzAnLFxuICAnMHgyN2I3MGE4NTQ2ZDIyZmZjJywgJzB4MmUxYjIxMzg1YzI2YzkyNicsICcweDRkMmM2ZGZjNWFjNDJhZWQnLCAnMHg1MzM4MGQxMzlkOTViM2RmJyxcbiAgJzB4NjUwYTczNTQ4YmFmNjNkZScsICcweDc2NmEwYWJiM2M3N2IyYTgnLCAnMHg4MWMyYzkyZTQ3ZWRhZWU2JywgJzB4OTI3MjJjODUxNDgyMzUzYicsXG4gICcweGEyYmZlOGExNGNmMTAzNjQnLCAnMHhhODFhNjY0YmJjNDIzMDAxJywgJzB4YzI0YjhiNzBkMGY4OTc5MScsICcweGM3NmM1MWEzMDY1NGJlMzAnLFxuICAnMHhkMTkyZTgxOWQ2ZWY1MjE4JywgJzB4ZDY5OTA2MjQ1NTY1YTkxMCcsICcweGY0MGUzNTg1NTc3MTIwMmEnLCAnMHgxMDZhYTA3MDMyYmJkMWI4JyxcbiAgJzB4MTlhNGMxMTZiOGQyZDBjOCcsICcweDFlMzc2YzA4NTE0MWFiNTMnLCAnMHgyNzQ4Nzc0Y2RmOGVlYjk5JywgJzB4MzRiMGJjYjVlMTliNDhhOCcsXG4gICcweDM5MWMwY2IzYzVjOTVhNjMnLCAnMHg0ZWQ4YWE0YWUzNDE4YWNiJywgJzB4NWI5Y2NhNGY3NzYzZTM3MycsICcweDY4MmU2ZmYzZDZiMmI4YTMnLFxuICAnMHg3NDhmODJlZTVkZWZiMmZjJywgJzB4NzhhNTYzNmY0MzE3MmY2MCcsICcweDg0Yzg3ODE0YTFmMGFiNzInLCAnMHg4Y2M3MDIwODFhNjQzOWVjJyxcbiAgJzB4OTBiZWZmZmEyMzYzMWUyOCcsICcweGE0NTA2Y2ViZGU4MmJkZTknLCAnMHhiZWY5YTNmN2IyYzY3OTE1JywgJzB4YzY3MTc4ZjJlMzcyNTMyYicsXG4gICcweGNhMjczZWNlZWEyNjYxOWMnLCAnMHhkMTg2YjhjNzIxYzBjMjA3JywgJzB4ZWFkYTdkZDZjZGUwZWIxZScsICcweGY1N2Q0ZjdmZWU2ZWQxNzgnLFxuICAnMHgwNmYwNjdhYTcyMTc2ZmJhJywgJzB4MGE2MzdkYzVhMmM4OThhNicsICcweDExM2Y5ODA0YmVmOTBkYWUnLCAnMHgxYjcxMGIzNTEzMWM0NzFiJyxcbiAgJzB4MjhkYjc3ZjUyMzA0N2Q4NCcsICcweDMyY2FhYjdiNDBjNzI0OTMnLCAnMHgzYzllYmUwYTE1YzliZWJjJywgJzB4NDMxZDY3YzQ5YzEwMGQ0YycsXG4gICcweDRjYzVkNGJlY2IzZTQyYjYnLCAnMHg1OTdmMjk5Y2ZjNjU3ZTJhJywgJzB4NWZjYjZmYWIzYWQ2ZmFlYycsICcweDZjNDQxOThjNGE0NzU4MTcnXG5dLm1hcChuID0+IEJpZ0ludChuKSkpKSgpO1xuY29uc3QgU0hBNTEyX0toID0gLyogQF9fUFVSRV9fICovICgoKSA9PiBLNTEyWzBdKSgpO1xuY29uc3QgU0hBNTEyX0tsID0gLyogQF9fUFVSRV9fICovICgoKSA9PiBLNTEyWzFdKSgpO1xuXG4vLyBSZXVzYWJsZSB0ZW1wb3JhcnkgYnVmZmVyc1xuY29uc3QgU0hBNTEyX1dfSCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgVWludDMyQXJyYXkoODApO1xuY29uc3QgU0hBNTEyX1dfTCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgVWludDMyQXJyYXkoODApO1xuXG4vKiogSW50ZXJuYWwgNjQtYnl0ZSBiYXNlIFNIQTIgaGFzaCBjbGFzcy4gKi9cbmFic3RyYWN0IGNsYXNzIFNIQTJfNjRCPFQgZXh0ZW5kcyBTSEEyXzY0QjxUPj4gZXh0ZW5kcyBIYXNoTUQ8VD4ge1xuICAvLyBXZSBjYW5ub3QgdXNlIGFycmF5IGhlcmUgc2luY2UgYXJyYXkgYWxsb3dzIGluZGV4aW5nIGJ5IHZhcmlhYmxlXG4gIC8vIHdoaWNoIG1lYW5zIG9wdGltaXplci9jb21waWxlciBjYW5ub3QgdXNlIHJlZ2lzdGVycy5cbiAgLy8gaCAtLSBoaWdoIDMyIGJpdHMsIGwgLS0gbG93IDMyIGJpdHNcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEFoOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBBbDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgQmg6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEJsOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBDaDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgQ2w6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IERoOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBEbDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgRWg6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEVsOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBGaDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgRmw6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEdoOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBHbDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgSGg6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEhsOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Iob3V0cHV0TGVuOiBudW1iZXIpIHtcbiAgICBzdXBlcigxMjgsIG91dHB1dExlbiwgMTYsIGZhbHNlKTtcbiAgfVxuICAvLyBwcmV0dGllci1pZ25vcmVcbiAgcHJvdGVjdGVkIGdldCgpOiBbXG4gICAgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsXG4gICAgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJcbiAgXSB7XG4gICAgY29uc3QgeyBBaCwgQWwsIEJoLCBCbCwgQ2gsIENsLCBEaCwgRGwsIEVoLCBFbCwgRmgsIEZsLCBHaCwgR2wsIEhoLCBIbCB9ID0gdGhpcztcbiAgICByZXR1cm4gW0FoLCBBbCwgQmgsIEJsLCBDaCwgQ2wsIERoLCBEbCwgRWgsIEVsLCBGaCwgRmwsIEdoLCBHbCwgSGgsIEhsXTtcbiAgfVxuICAvLyBwcmV0dGllci1pZ25vcmVcbiAgcHJvdGVjdGVkIHNldChcbiAgICBBaDogbnVtYmVyLCBBbDogbnVtYmVyLCBCaDogbnVtYmVyLCBCbDogbnVtYmVyLCBDaDogbnVtYmVyLCBDbDogbnVtYmVyLCBEaDogbnVtYmVyLCBEbDogbnVtYmVyLFxuICAgIEVoOiBudW1iZXIsIEVsOiBudW1iZXIsIEZoOiBudW1iZXIsIEZsOiBudW1iZXIsIEdoOiBudW1iZXIsIEdsOiBudW1iZXIsIEhoOiBudW1iZXIsIEhsOiBudW1iZXJcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5BaCA9IEFoIHwgMDtcbiAgICB0aGlzLkFsID0gQWwgfCAwO1xuICAgIHRoaXMuQmggPSBCaCB8IDA7XG4gICAgdGhpcy5CbCA9IEJsIHwgMDtcbiAgICB0aGlzLkNoID0gQ2ggfCAwO1xuICAgIHRoaXMuQ2wgPSBDbCB8IDA7XG4gICAgdGhpcy5EaCA9IERoIHwgMDtcbiAgICB0aGlzLkRsID0gRGwgfCAwO1xuICAgIHRoaXMuRWggPSBFaCB8IDA7XG4gICAgdGhpcy5FbCA9IEVsIHwgMDtcbiAgICB0aGlzLkZoID0gRmggfCAwO1xuICAgIHRoaXMuRmwgPSBGbCB8IDA7XG4gICAgdGhpcy5HaCA9IEdoIHwgMDtcbiAgICB0aGlzLkdsID0gR2wgfCAwO1xuICAgIHRoaXMuSGggPSBIaCB8IDA7XG4gICAgdGhpcy5IbCA9IEhsIHwgMDtcbiAgfVxuICBwcm90ZWN0ZWQgcHJvY2Vzcyh2aWV3OiBEYXRhVmlldywgb2Zmc2V0OiBudW1iZXIpOiB2b2lkIHtcbiAgICAvLyBFeHRlbmQgdGhlIGZpcnN0IDE2IHdvcmRzIGludG8gdGhlIHJlbWFpbmluZyA2NCB3b3JkcyB3WzE2Li43OV0gb2YgdGhlIG1lc3NhZ2Ugc2NoZWR1bGUgYXJyYXlcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2OyBpKyssIG9mZnNldCArPSA0KSB7XG4gICAgICBTSEE1MTJfV19IW2ldID0gdmlldy5nZXRVaW50MzIob2Zmc2V0KTtcbiAgICAgIFNIQTUxMl9XX0xbaV0gPSB2aWV3LmdldFVpbnQzMigob2Zmc2V0ICs9IDQpKTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDE2OyBpIDwgODA7IGkrKykge1xuICAgICAgLy8gczAgOj0gKHdbaS0xNV0gcmlnaHRyb3RhdGUgMSkgeG9yICh3W2ktMTVdIHJpZ2h0cm90YXRlIDgpIHhvciAod1tpLTE1XSByaWdodHNoaWZ0IDcpXG4gICAgICBjb25zdCBXMTVoID0gU0hBNTEyX1dfSFtpIC0gMTVdIHwgMDtcbiAgICAgIGNvbnN0IFcxNWwgPSBTSEE1MTJfV19MW2kgLSAxNV0gfCAwO1xuICAgICAgY29uc3QgczBoID0gdTY0LnJvdHJTSChXMTVoLCBXMTVsLCAxKSBeIHU2NC5yb3RyU0goVzE1aCwgVzE1bCwgOCkgXiB1NjQuc2hyU0goVzE1aCwgVzE1bCwgNyk7XG4gICAgICBjb25zdCBzMGwgPSB1NjQucm90clNMKFcxNWgsIFcxNWwsIDEpIF4gdTY0LnJvdHJTTChXMTVoLCBXMTVsLCA4KSBeIHU2NC5zaHJTTChXMTVoLCBXMTVsLCA3KTtcbiAgICAgIC8vIHMxIDo9ICh3W2ktMl0gcmlnaHRyb3RhdGUgMTkpIHhvciAod1tpLTJdIHJpZ2h0cm90YXRlIDYxKSB4b3IgKHdbaS0yXSByaWdodHNoaWZ0IDYpXG4gICAgICBjb25zdCBXMmggPSBTSEE1MTJfV19IW2kgLSAyXSB8IDA7XG4gICAgICBjb25zdCBXMmwgPSBTSEE1MTJfV19MW2kgLSAyXSB8IDA7XG4gICAgICBjb25zdCBzMWggPSB1NjQucm90clNIKFcyaCwgVzJsLCAxOSkgXiB1NjQucm90ckJIKFcyaCwgVzJsLCA2MSkgXiB1NjQuc2hyU0goVzJoLCBXMmwsIDYpO1xuICAgICAgY29uc3QgczFsID0gdTY0LnJvdHJTTChXMmgsIFcybCwgMTkpIF4gdTY0LnJvdHJCTChXMmgsIFcybCwgNjEpIF4gdTY0LnNoclNMKFcyaCwgVzJsLCA2KTtcbiAgICAgIC8vIFNIQTI1Nl9XW2ldID0gczAgKyBzMSArIFNIQTI1Nl9XW2kgLSA3XSArIFNIQTI1Nl9XW2kgLSAxNl07XG4gICAgICBjb25zdCBTVU1sID0gdTY0LmFkZDRMKHMwbCwgczFsLCBTSEE1MTJfV19MW2kgLSA3XSwgU0hBNTEyX1dfTFtpIC0gMTZdKTtcbiAgICAgIGNvbnN0IFNVTWggPSB1NjQuYWRkNEgoU1VNbCwgczBoLCBzMWgsIFNIQTUxMl9XX0hbaSAtIDddLCBTSEE1MTJfV19IW2kgLSAxNl0pO1xuICAgICAgU0hBNTEyX1dfSFtpXSA9IFNVTWggfCAwO1xuICAgICAgU0hBNTEyX1dfTFtpXSA9IFNVTWwgfCAwO1xuICAgIH1cbiAgICBsZXQgeyBBaCwgQWwsIEJoLCBCbCwgQ2gsIENsLCBEaCwgRGwsIEVoLCBFbCwgRmgsIEZsLCBHaCwgR2wsIEhoLCBIbCB9ID0gdGhpcztcbiAgICAvLyBDb21wcmVzc2lvbiBmdW5jdGlvbiBtYWluIGxvb3AsIDgwIHJvdW5kc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODA7IGkrKykge1xuICAgICAgLy8gUzEgOj0gKGUgcmlnaHRyb3RhdGUgMTQpIHhvciAoZSByaWdodHJvdGF0ZSAxOCkgeG9yIChlIHJpZ2h0cm90YXRlIDQxKVxuICAgICAgY29uc3Qgc2lnbWExaCA9IHU2NC5yb3RyU0goRWgsIEVsLCAxNCkgXiB1NjQucm90clNIKEVoLCBFbCwgMTgpIF4gdTY0LnJvdHJCSChFaCwgRWwsIDQxKTtcbiAgICAgIGNvbnN0IHNpZ21hMWwgPSB1NjQucm90clNMKEVoLCBFbCwgMTQpIF4gdTY0LnJvdHJTTChFaCwgRWwsIDE4KSBeIHU2NC5yb3RyQkwoRWgsIEVsLCA0MSk7XG4gICAgICAvL2NvbnN0IFQxID0gKEggKyBzaWdtYTEgKyBDaGkoRSwgRiwgRykgKyBTSEEyNTZfS1tpXSArIFNIQTI1Nl9XW2ldKSB8IDA7XG4gICAgICBjb25zdCBDSEloID0gKEVoICYgRmgpIF4gKH5FaCAmIEdoKTtcbiAgICAgIGNvbnN0IENISWwgPSAoRWwgJiBGbCkgXiAofkVsICYgR2wpO1xuICAgICAgLy8gVDEgPSBIICsgc2lnbWExICsgQ2hpKEUsIEYsIEcpICsgU0hBNTEyX0tbaV0gKyBTSEE1MTJfV1tpXVxuICAgICAgLy8gcHJldHRpZXItaWdub3JlXG4gICAgICBjb25zdCBUMWxsID0gdTY0LmFkZDVMKEhsLCBzaWdtYTFsLCBDSElsLCBTSEE1MTJfS2xbaV0sIFNIQTUxMl9XX0xbaV0pO1xuICAgICAgY29uc3QgVDFoID0gdTY0LmFkZDVIKFQxbGwsIEhoLCBzaWdtYTFoLCBDSEloLCBTSEE1MTJfS2hbaV0sIFNIQTUxMl9XX0hbaV0pO1xuICAgICAgY29uc3QgVDFsID0gVDFsbCB8IDA7XG4gICAgICAvLyBTMCA6PSAoYSByaWdodHJvdGF0ZSAyOCkgeG9yIChhIHJpZ2h0cm90YXRlIDM0KSB4b3IgKGEgcmlnaHRyb3RhdGUgMzkpXG4gICAgICBjb25zdCBzaWdtYTBoID0gdTY0LnJvdHJTSChBaCwgQWwsIDI4KSBeIHU2NC5yb3RyQkgoQWgsIEFsLCAzNCkgXiB1NjQucm90ckJIKEFoLCBBbCwgMzkpO1xuICAgICAgY29uc3Qgc2lnbWEwbCA9IHU2NC5yb3RyU0woQWgsIEFsLCAyOCkgXiB1NjQucm90ckJMKEFoLCBBbCwgMzQpIF4gdTY0LnJvdHJCTChBaCwgQWwsIDM5KTtcbiAgICAgIGNvbnN0IE1BSmggPSAoQWggJiBCaCkgXiAoQWggJiBDaCkgXiAoQmggJiBDaCk7XG4gICAgICBjb25zdCBNQUpsID0gKEFsICYgQmwpIF4gKEFsICYgQ2wpIF4gKEJsICYgQ2wpO1xuICAgICAgSGggPSBHaCB8IDA7XG4gICAgICBIbCA9IEdsIHwgMDtcbiAgICAgIEdoID0gRmggfCAwO1xuICAgICAgR2wgPSBGbCB8IDA7XG4gICAgICBGaCA9IEVoIHwgMDtcbiAgICAgIEZsID0gRWwgfCAwO1xuICAgICAgKHsgaDogRWgsIGw6IEVsIH0gPSB1NjQuYWRkKERoIHwgMCwgRGwgfCAwLCBUMWggfCAwLCBUMWwgfCAwKSk7XG4gICAgICBEaCA9IENoIHwgMDtcbiAgICAgIERsID0gQ2wgfCAwO1xuICAgICAgQ2ggPSBCaCB8IDA7XG4gICAgICBDbCA9IEJsIHwgMDtcbiAgICAgIEJoID0gQWggfCAwO1xuICAgICAgQmwgPSBBbCB8IDA7XG4gICAgICBjb25zdCBBbGwgPSB1NjQuYWRkM0woVDFsLCBzaWdtYTBsLCBNQUpsKTtcbiAgICAgIEFoID0gdTY0LmFkZDNIKEFsbCwgVDFoLCBzaWdtYTBoLCBNQUpoKTtcbiAgICAgIEFsID0gQWxsIHwgMDtcbiAgICB9XG4gICAgLy8gQWRkIHRoZSBjb21wcmVzc2VkIGNodW5rIHRvIHRoZSBjdXJyZW50IGhhc2ggdmFsdWVcbiAgICAoeyBoOiBBaCwgbDogQWwgfSA9IHU2NC5hZGQodGhpcy5BaCB8IDAsIHRoaXMuQWwgfCAwLCBBaCB8IDAsIEFsIHwgMCkpO1xuICAgICh7IGg6IEJoLCBsOiBCbCB9ID0gdTY0LmFkZCh0aGlzLkJoIHwgMCwgdGhpcy5CbCB8IDAsIEJoIHwgMCwgQmwgfCAwKSk7XG4gICAgKHsgaDogQ2gsIGw6IENsIH0gPSB1NjQuYWRkKHRoaXMuQ2ggfCAwLCB0aGlzLkNsIHwgMCwgQ2ggfCAwLCBDbCB8IDApKTtcbiAgICAoeyBoOiBEaCwgbDogRGwgfSA9IHU2NC5hZGQodGhpcy5EaCB8IDAsIHRoaXMuRGwgfCAwLCBEaCB8IDAsIERsIHwgMCkpO1xuICAgICh7IGg6IEVoLCBsOiBFbCB9ID0gdTY0LmFkZCh0aGlzLkVoIHwgMCwgdGhpcy5FbCB8IDAsIEVoIHwgMCwgRWwgfCAwKSk7XG4gICAgKHsgaDogRmgsIGw6IEZsIH0gPSB1NjQuYWRkKHRoaXMuRmggfCAwLCB0aGlzLkZsIHwgMCwgRmggfCAwLCBGbCB8IDApKTtcbiAgICAoeyBoOiBHaCwgbDogR2wgfSA9IHU2NC5hZGQodGhpcy5HaCB8IDAsIHRoaXMuR2wgfCAwLCBHaCB8IDAsIEdsIHwgMCkpO1xuICAgICh7IGg6IEhoLCBsOiBIbCB9ID0gdTY0LmFkZCh0aGlzLkhoIHwgMCwgdGhpcy5IbCB8IDAsIEhoIHwgMCwgSGwgfCAwKSk7XG4gICAgdGhpcy5zZXQoQWgsIEFsLCBCaCwgQmwsIENoLCBDbCwgRGgsIERsLCBFaCwgRWwsIEZoLCBGbCwgR2gsIEdsLCBIaCwgSGwpO1xuICB9XG4gIHByb3RlY3RlZCByb3VuZENsZWFuKCk6IHZvaWQge1xuICAgIGNsZWFuKFNIQTUxMl9XX0gsIFNIQTUxMl9XX0wpO1xuICB9XG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgY2xlYW4odGhpcy5idWZmZXIpO1xuICAgIHRoaXMuc2V0KDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDApO1xuICB9XG59XG5cbi8qKiBJbnRlcm5hbCBTSEEyLTUxMiBoYXNoIGNsYXNzLiAqL1xuZXhwb3J0IGNsYXNzIF9TSEE1MTIgZXh0ZW5kcyBTSEEyXzY0QjxfU0hBNTEyPiB7XG4gIHByb3RlY3RlZCBBaDogbnVtYmVyID0gU0hBNTEyX0lWWzBdIHwgMDtcbiAgcHJvdGVjdGVkIEFsOiBudW1iZXIgPSBTSEE1MTJfSVZbMV0gfCAwO1xuICBwcm90ZWN0ZWQgQmg6IG51bWJlciA9IFNIQTUxMl9JVlsyXSB8IDA7XG4gIHByb3RlY3RlZCBCbDogbnVtYmVyID0gU0hBNTEyX0lWWzNdIHwgMDtcbiAgcHJvdGVjdGVkIENoOiBudW1iZXIgPSBTSEE1MTJfSVZbNF0gfCAwO1xuICBwcm90ZWN0ZWQgQ2w6IG51bWJlciA9IFNIQTUxMl9JVls1XSB8IDA7XG4gIHByb3RlY3RlZCBEaDogbnVtYmVyID0gU0hBNTEyX0lWWzZdIHwgMDtcbiAgcHJvdGVjdGVkIERsOiBudW1iZXIgPSBTSEE1MTJfSVZbN10gfCAwO1xuICBwcm90ZWN0ZWQgRWg6IG51bWJlciA9IFNIQTUxMl9JVls4XSB8IDA7XG4gIHByb3RlY3RlZCBFbDogbnVtYmVyID0gU0hBNTEyX0lWWzldIHwgMDtcbiAgcHJvdGVjdGVkIEZoOiBudW1iZXIgPSBTSEE1MTJfSVZbMTBdIHwgMDtcbiAgcHJvdGVjdGVkIEZsOiBudW1iZXIgPSBTSEE1MTJfSVZbMTFdIHwgMDtcbiAgcHJvdGVjdGVkIEdoOiBudW1iZXIgPSBTSEE1MTJfSVZbMTJdIHwgMDtcbiAgcHJvdGVjdGVkIEdsOiBudW1iZXIgPSBTSEE1MTJfSVZbMTNdIHwgMDtcbiAgcHJvdGVjdGVkIEhoOiBudW1iZXIgPSBTSEE1MTJfSVZbMTRdIHwgMDtcbiAgcHJvdGVjdGVkIEhsOiBudW1iZXIgPSBTSEE1MTJfSVZbMTVdIHwgMDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcig2NCk7XG4gIH1cbn1cblxuLyoqIEludGVybmFsIFNIQTItMzg0IGhhc2ggY2xhc3MuICovXG5leHBvcnQgY2xhc3MgX1NIQTM4NCBleHRlbmRzIFNIQTJfNjRCPF9TSEEzODQ+IHtcbiAgcHJvdGVjdGVkIEFoOiBudW1iZXIgPSBTSEEzODRfSVZbMF0gfCAwO1xuICBwcm90ZWN0ZWQgQWw6IG51bWJlciA9IFNIQTM4NF9JVlsxXSB8IDA7XG4gIHByb3RlY3RlZCBCaDogbnVtYmVyID0gU0hBMzg0X0lWWzJdIHwgMDtcbiAgcHJvdGVjdGVkIEJsOiBudW1iZXIgPSBTSEEzODRfSVZbM10gfCAwO1xuICBwcm90ZWN0ZWQgQ2g6IG51bWJlciA9IFNIQTM4NF9JVls0XSB8IDA7XG4gIHByb3RlY3RlZCBDbDogbnVtYmVyID0gU0hBMzg0X0lWWzVdIHwgMDtcbiAgcHJvdGVjdGVkIERoOiBudW1iZXIgPSBTSEEzODRfSVZbNl0gfCAwO1xuICBwcm90ZWN0ZWQgRGw6IG51bWJlciA9IFNIQTM4NF9JVls3XSB8IDA7XG4gIHByb3RlY3RlZCBFaDogbnVtYmVyID0gU0hBMzg0X0lWWzhdIHwgMDtcbiAgcHJvdGVjdGVkIEVsOiBudW1iZXIgPSBTSEEzODRfSVZbOV0gfCAwO1xuICBwcm90ZWN0ZWQgRmg6IG51bWJlciA9IFNIQTM4NF9JVlsxMF0gfCAwO1xuICBwcm90ZWN0ZWQgRmw6IG51bWJlciA9IFNIQTM4NF9JVlsxMV0gfCAwO1xuICBwcm90ZWN0ZWQgR2g6IG51bWJlciA9IFNIQTM4NF9JVlsxMl0gfCAwO1xuICBwcm90ZWN0ZWQgR2w6IG51bWJlciA9IFNIQTM4NF9JVlsxM10gfCAwO1xuICBwcm90ZWN0ZWQgSGg6IG51bWJlciA9IFNIQTM4NF9JVlsxNF0gfCAwO1xuICBwcm90ZWN0ZWQgSGw6IG51bWJlciA9IFNIQTM4NF9JVlsxNV0gfCAwO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKDQ4KTtcbiAgfVxufVxuXG4vKipcbiAqIFRydW5jYXRlZCBTSEE1MTIvMjU2IGFuZCBTSEE1MTIvMjI0LlxuICogU0hBNTEyX0lWIGlzIFhPUmVkIHdpdGggMHhhNWE1YTVhNWE1YTVhNWE1LCB0aGVuIHVzZWQgYXMgXCJpbnRlcm1lZGlhcnlcIiBJViBvZiBTSEE1MTIvdC5cbiAqIFRoZW4gdCBoYXNoZXMgc3RyaW5nIHRvIHByb2R1Y2UgcmVzdWx0IElWLlxuICogU2VlIGB0ZXN0L21pc2Mvc2hhMi1nZW4taXYuanNgLlxuICovXG5cbi8qKiBTSEE1MTIvMjI0IElWICovXG5jb25zdCBUMjI0X0lWID0gLyogQF9fUFVSRV9fICovIFVpbnQzMkFycmF5LmZyb20oW1xuICAweDhjM2QzN2M4LCAweDE5NTQ0ZGEyLCAweDczZTE5OTY2LCAweDg5ZGNkNGQ2LCAweDFkZmFiN2FlLCAweDMyZmY5YzgyLCAweDY3OWRkNTE0LCAweDU4MmY5ZmNmLFxuICAweDBmNmQyYjY5LCAweDdiZDQ0ZGE4LCAweDc3ZTM2ZjczLCAweDA0YzQ4OTQyLCAweDNmOWQ4NWE4LCAweDZhMWQzNmM4LCAweDExMTJlNmFkLCAweDkxZDY5MmExLFxuXSk7XG5cbi8qKiBTSEE1MTIvMjU2IElWICovXG5jb25zdCBUMjU2X0lWID0gLyogQF9fUFVSRV9fICovIFVpbnQzMkFycmF5LmZyb20oW1xuICAweDIyMzEyMTk0LCAweGZjMmJmNzJjLCAweDlmNTU1ZmEzLCAweGM4NGM2NGMyLCAweDIzOTNiODZiLCAweDZmNTNiMTUxLCAweDk2Mzg3NzE5LCAweDU5NDBlYWJkLFxuICAweDk2MjgzZWUyLCAweGE4OGVmZmUzLCAweGJlNWUxZTI1LCAweDUzODYzOTkyLCAweDJiMDE5OWZjLCAweDJjODViOGFhLCAweDBlYjcyZGRjLCAweDgxYzUyY2EyLFxuXSk7XG5cbi8qKiBJbnRlcm5hbCBTSEEyLTUxMi8yMjQgaGFzaCBjbGFzcy4gKi9cbmV4cG9ydCBjbGFzcyBfU0hBNTEyXzIyNCBleHRlbmRzIFNIQTJfNjRCPF9TSEE1MTJfMjI0PiB7XG4gIHByb3RlY3RlZCBBaDogbnVtYmVyID0gVDIyNF9JVlswXSB8IDA7XG4gIHByb3RlY3RlZCBBbDogbnVtYmVyID0gVDIyNF9JVlsxXSB8IDA7XG4gIHByb3RlY3RlZCBCaDogbnVtYmVyID0gVDIyNF9JVlsyXSB8IDA7XG4gIHByb3RlY3RlZCBCbDogbnVtYmVyID0gVDIyNF9JVlszXSB8IDA7XG4gIHByb3RlY3RlZCBDaDogbnVtYmVyID0gVDIyNF9JVls0XSB8IDA7XG4gIHByb3RlY3RlZCBDbDogbnVtYmVyID0gVDIyNF9JVls1XSB8IDA7XG4gIHByb3RlY3RlZCBEaDogbnVtYmVyID0gVDIyNF9JVls2XSB8IDA7XG4gIHByb3RlY3RlZCBEbDogbnVtYmVyID0gVDIyNF9JVls3XSB8IDA7XG4gIHByb3RlY3RlZCBFaDogbnVtYmVyID0gVDIyNF9JVls4XSB8IDA7XG4gIHByb3RlY3RlZCBFbDogbnVtYmVyID0gVDIyNF9JVls5XSB8IDA7XG4gIHByb3RlY3RlZCBGaDogbnVtYmVyID0gVDIyNF9JVlsxMF0gfCAwO1xuICBwcm90ZWN0ZWQgRmw6IG51bWJlciA9IFQyMjRfSVZbMTFdIHwgMDtcbiAgcHJvdGVjdGVkIEdoOiBudW1iZXIgPSBUMjI0X0lWWzEyXSB8IDA7XG4gIHByb3RlY3RlZCBHbDogbnVtYmVyID0gVDIyNF9JVlsxM10gfCAwO1xuICBwcm90ZWN0ZWQgSGg6IG51bWJlciA9IFQyMjRfSVZbMTRdIHwgMDtcbiAgcHJvdGVjdGVkIEhsOiBudW1iZXIgPSBUMjI0X0lWWzE1XSB8IDA7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoMjgpO1xuICB9XG59XG5cbi8qKiBJbnRlcm5hbCBTSEEyLTUxMi8yNTYgaGFzaCBjbGFzcy4gKi9cbmV4cG9ydCBjbGFzcyBfU0hBNTEyXzI1NiBleHRlbmRzIFNIQTJfNjRCPF9TSEE1MTJfMjU2PiB7XG4gIHByb3RlY3RlZCBBaDogbnVtYmVyID0gVDI1Nl9JVlswXSB8IDA7XG4gIHByb3RlY3RlZCBBbDogbnVtYmVyID0gVDI1Nl9JVlsxXSB8IDA7XG4gIHByb3RlY3RlZCBCaDogbnVtYmVyID0gVDI1Nl9JVlsyXSB8IDA7XG4gIHByb3RlY3RlZCBCbDogbnVtYmVyID0gVDI1Nl9JVlszXSB8IDA7XG4gIHByb3RlY3RlZCBDaDogbnVtYmVyID0gVDI1Nl9JVls0XSB8IDA7XG4gIHByb3RlY3RlZCBDbDogbnVtYmVyID0gVDI1Nl9JVls1XSB8IDA7XG4gIHByb3RlY3RlZCBEaDogbnVtYmVyID0gVDI1Nl9JVls2XSB8IDA7XG4gIHByb3RlY3RlZCBEbDogbnVtYmVyID0gVDI1Nl9JVls3XSB8IDA7XG4gIHByb3RlY3RlZCBFaDogbnVtYmVyID0gVDI1Nl9JVls4XSB8IDA7XG4gIHByb3RlY3RlZCBFbDogbnVtYmVyID0gVDI1Nl9JVls5XSB8IDA7XG4gIHByb3RlY3RlZCBGaDogbnVtYmVyID0gVDI1Nl9JVlsxMF0gfCAwO1xuICBwcm90ZWN0ZWQgRmw6IG51bWJlciA9IFQyNTZfSVZbMTFdIHwgMDtcbiAgcHJvdGVjdGVkIEdoOiBudW1iZXIgPSBUMjU2X0lWWzEyXSB8IDA7XG4gIHByb3RlY3RlZCBHbDogbnVtYmVyID0gVDI1Nl9JVlsxM10gfCAwO1xuICBwcm90ZWN0ZWQgSGg6IG51bWJlciA9IFQyNTZfSVZbMTRdIHwgMDtcbiAgcHJvdGVjdGVkIEhsOiBudW1iZXIgPSBUMjU2X0lWWzE1XSB8IDA7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoMzIpO1xuICB9XG59XG5cbi8qKlxuICogU0hBMi0yNTYgaGFzaCBmdW5jdGlvbiBmcm9tIFJGQyA0NjM0LiBJbiBKUyBpdCdzIHRoZSBmYXN0ZXN0OiBldmVuIGZhc3RlciB0aGFuIEJsYWtlMy4gU29tZSBpbmZvOlxuICpcbiAqIC0gVHJ5aW5nIDJeMTI4IGhhc2hlcyB3b3VsZCBnZXQgNTAlIGNoYW5jZSBvZiBjb2xsaXNpb24sIHVzaW5nIGJpcnRoZGF5IGF0dGFjay5cbiAqIC0gQlRDIG5ldHdvcmsgaXMgZG9pbmcgMl43MCBoYXNoZXMvc2VjICgyXjk1IGhhc2hlcy95ZWFyKSBhcyBwZXIgMjAyNS5cbiAqIC0gRWFjaCBzaGEyNTYgaGFzaCBpcyBleGVjdXRpbmcgMl4xOCBiaXQgb3BlcmF0aW9ucy5cbiAqIC0gR29vZCAyMDI0IEFTSUNzIGNhbiBkbyAyMDBUaC9zZWMgd2l0aCAzNTAwIHdhdHRzIG9mIHBvd2VyLCBjb3JyZXNwb25kaW5nIHRvIDJeMzYgaGFzaGVzL2pvdWxlLlxuICovXG5leHBvcnQgY29uc3Qgc2hhMjU2OiBDSGFzaDxfU0hBMjU2PiA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVIYXNoZXIoXG4gICgpID0+IG5ldyBfU0hBMjU2KCksXG4gIC8qIEBfX1BVUkVfXyAqLyBvaWROaXN0KDB4MDEpXG4pO1xuLyoqIFNIQTItMjI0IGhhc2ggZnVuY3Rpb24gZnJvbSBSRkMgNDYzNCAqL1xuZXhwb3J0IGNvbnN0IHNoYTIyNDogQ0hhc2g8X1NIQTIyND4gPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlSGFzaGVyKFxuICAoKSA9PiBuZXcgX1NIQTIyNCgpLFxuICAvKiBAX19QVVJFX18gKi8gb2lkTmlzdCgweDA0KVxuKTtcblxuLyoqIFNIQTItNTEyIGhhc2ggZnVuY3Rpb24gZnJvbSBSRkMgNDYzNC4gKi9cbmV4cG9ydCBjb25zdCBzaGE1MTI6IENIYXNoPF9TSEE1MTI+ID0gLyogQF9fUFVSRV9fICovIGNyZWF0ZUhhc2hlcihcbiAgKCkgPT4gbmV3IF9TSEE1MTIoKSxcbiAgLyogQF9fUFVSRV9fICovIG9pZE5pc3QoMHgwMylcbik7XG4vKiogU0hBMi0zODQgaGFzaCBmdW5jdGlvbiBmcm9tIFJGQyA0NjM0LiAqL1xuZXhwb3J0IGNvbnN0IHNoYTM4NDogQ0hhc2g8X1NIQTM4ND4gPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlSGFzaGVyKFxuICAoKSA9PiBuZXcgX1NIQTM4NCgpLFxuICAvKiBAX19QVVJFX18gKi8gb2lkTmlzdCgweDAyKVxuKTtcblxuLyoqXG4gKiBTSEEyLTUxMi8yNTYgXCJ0cnVuY2F0ZWRcIiBoYXNoIGZ1bmN0aW9uLCB3aXRoIGltcHJvdmVkIHJlc2lzdGFuY2UgdG8gbGVuZ3RoIGV4dGVuc2lvbiBhdHRhY2tzLlxuICogU2VlIHRoZSBwYXBlciBvbiBbdHJ1bmNhdGVkIFNIQTUxMl0oaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxMC81NDgucGRmKS5cbiAqL1xuZXhwb3J0IGNvbnN0IHNoYTUxMl8yNTY6IENIYXNoPF9TSEE1MTJfMjU2PiA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVIYXNoZXIoXG4gICgpID0+IG5ldyBfU0hBNTEyXzI1NigpLFxuICAvKiBAX19QVVJFX18gKi8gb2lkTmlzdCgweDA2KVxuKTtcbi8qKlxuICogU0hBMi01MTIvMjI0IFwidHJ1bmNhdGVkXCIgaGFzaCBmdW5jdGlvbiwgd2l0aCBpbXByb3ZlZCByZXNpc3RhbmNlIHRvIGxlbmd0aCBleHRlbnNpb24gYXR0YWNrcy5cbiAqIFNlZSB0aGUgcGFwZXIgb24gW3RydW5jYXRlZCBTSEE1MTJdKGh0dHBzOi8vZXByaW50LmlhY3Iub3JnLzIwMTAvNTQ4LnBkZikuXG4gKi9cbmV4cG9ydCBjb25zdCBzaGE1MTJfMjI0OiBDSGFzaDxfU0hBNTEyXzIyND4gPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlSGFzaGVyKFxuICAoKSA9PiBuZXcgX1NIQTUxMl8yMjQoKSxcbiAgLyogQF9fUFVSRV9fICovIG9pZE5pc3QoMHgwNSlcbik7XG4iLCAiLyoqXG4gKiBJbnRlcm5hbCBNZXJrbGUtRGFtZ2FyZCBoYXNoIHV0aWxzLlxuICogQG1vZHVsZVxuICovXG5pbXBvcnQgeyBhYnl0ZXMsIGFleGlzdHMsIGFvdXRwdXQsIGNsZWFuLCBjcmVhdGVWaWV3LCB0eXBlIEhhc2ggfSBmcm9tICcuL3V0aWxzLnRzJztcblxuLyoqIENob2ljZTogYSA/IGIgOiBjICovXG5leHBvcnQgZnVuY3Rpb24gQ2hpKGE6IG51bWJlciwgYjogbnVtYmVyLCBjOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gKGEgJiBiKSBeICh+YSAmIGMpO1xufVxuXG4vKiogTWFqb3JpdHkgZnVuY3Rpb24sIHRydWUgaWYgYW55IHR3byBpbnB1dHMgaXMgdHJ1ZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNYWooYTogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiAoYSAmIGIpIF4gKGEgJiBjKSBeIChiICYgYyk7XG59XG5cbi8qKlxuICogTWVya2xlLURhbWdhcmQgaGFzaCBjb25zdHJ1Y3Rpb24gYmFzZSBjbGFzcy5cbiAqIENvdWxkIGJlIHVzZWQgdG8gY3JlYXRlIE1ENSwgUklQRU1ELCBTSEExLCBTSEEyLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSGFzaE1EPFQgZXh0ZW5kcyBIYXNoTUQ8VD4+IGltcGxlbWVudHMgSGFzaDxUPiB7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBwcm9jZXNzKGJ1ZjogRGF0YVZpZXcsIG9mZnNldDogbnVtYmVyKTogdm9pZDtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IGdldCgpOiBudW1iZXJbXTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHNldCguLi5hcmdzOiBudW1iZXJbXSk6IHZvaWQ7XG4gIGFic3RyYWN0IGRlc3Ryb3koKTogdm9pZDtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJvdW5kQ2xlYW4oKTogdm9pZDtcblxuICByZWFkb25seSBibG9ja0xlbjogbnVtYmVyO1xuICByZWFkb25seSBvdXRwdXRMZW46IG51bWJlcjtcbiAgcmVhZG9ubHkgcGFkT2Zmc2V0OiBudW1iZXI7XG4gIHJlYWRvbmx5IGlzTEU6IGJvb2xlYW47XG5cbiAgLy8gRm9yIHBhcnRpYWwgdXBkYXRlcyBsZXNzIHRoYW4gYmxvY2sgc2l6ZVxuICBwcm90ZWN0ZWQgYnVmZmVyOiBVaW50OEFycmF5O1xuICBwcm90ZWN0ZWQgdmlldzogRGF0YVZpZXc7XG4gIHByb3RlY3RlZCBmaW5pc2hlZCA9IGZhbHNlO1xuICBwcm90ZWN0ZWQgbGVuZ3RoID0gMDtcbiAgcHJvdGVjdGVkIHBvcyA9IDA7XG4gIHByb3RlY3RlZCBkZXN0cm95ZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihibG9ja0xlbjogbnVtYmVyLCBvdXRwdXRMZW46IG51bWJlciwgcGFkT2Zmc2V0OiBudW1iZXIsIGlzTEU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLmJsb2NrTGVuID0gYmxvY2tMZW47XG4gICAgdGhpcy5vdXRwdXRMZW4gPSBvdXRwdXRMZW47XG4gICAgdGhpcy5wYWRPZmZzZXQgPSBwYWRPZmZzZXQ7XG4gICAgdGhpcy5pc0xFID0gaXNMRTtcbiAgICB0aGlzLmJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGJsb2NrTGVuKTtcbiAgICB0aGlzLnZpZXcgPSBjcmVhdGVWaWV3KHRoaXMuYnVmZmVyKTtcbiAgfVxuICB1cGRhdGUoZGF0YTogVWludDhBcnJheSk6IHRoaXMge1xuICAgIGFleGlzdHModGhpcyk7XG4gICAgYWJ5dGVzKGRhdGEpO1xuICAgIGNvbnN0IHsgdmlldywgYnVmZmVyLCBibG9ja0xlbiB9ID0gdGhpcztcbiAgICBjb25zdCBsZW4gPSBkYXRhLmxlbmd0aDtcbiAgICBmb3IgKGxldCBwb3MgPSAwOyBwb3MgPCBsZW47ICkge1xuICAgICAgY29uc3QgdGFrZSA9IE1hdGgubWluKGJsb2NrTGVuIC0gdGhpcy5wb3MsIGxlbiAtIHBvcyk7XG4gICAgICAvLyBGYXN0IHBhdGg6IHdlIGhhdmUgYXQgbGVhc3Qgb25lIGJsb2NrIGluIGlucHV0LCBjYXN0IGl0IHRvIHZpZXcgYW5kIHByb2Nlc3NcbiAgICAgIGlmICh0YWtlID09PSBibG9ja0xlbikge1xuICAgICAgICBjb25zdCBkYXRhVmlldyA9IGNyZWF0ZVZpZXcoZGF0YSk7XG4gICAgICAgIGZvciAoOyBibG9ja0xlbiA8PSBsZW4gLSBwb3M7IHBvcyArPSBibG9ja0xlbikgdGhpcy5wcm9jZXNzKGRhdGFWaWV3LCBwb3MpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGJ1ZmZlci5zZXQoZGF0YS5zdWJhcnJheShwb3MsIHBvcyArIHRha2UpLCB0aGlzLnBvcyk7XG4gICAgICB0aGlzLnBvcyArPSB0YWtlO1xuICAgICAgcG9zICs9IHRha2U7XG4gICAgICBpZiAodGhpcy5wb3MgPT09IGJsb2NrTGVuKSB7XG4gICAgICAgIHRoaXMucHJvY2Vzcyh2aWV3LCAwKTtcbiAgICAgICAgdGhpcy5wb3MgPSAwO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmxlbmd0aCArPSBkYXRhLmxlbmd0aDtcbiAgICB0aGlzLnJvdW5kQ2xlYW4oKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBkaWdlc3RJbnRvKG91dDogVWludDhBcnJheSk6IHZvaWQge1xuICAgIGFleGlzdHModGhpcyk7XG4gICAgYW91dHB1dChvdXQsIHRoaXMpO1xuICAgIHRoaXMuZmluaXNoZWQgPSB0cnVlO1xuICAgIC8vIFBhZGRpbmdcbiAgICAvLyBXZSBjYW4gYXZvaWQgYWxsb2NhdGlvbiBvZiBidWZmZXIgZm9yIHBhZGRpbmcgY29tcGxldGVseSBpZiBpdFxuICAgIC8vIHdhcyBwcmV2aW91c2x5IG5vdCBhbGxvY2F0ZWQgaGVyZS4gQnV0IGl0IHdvbid0IGNoYW5nZSBwZXJmb3JtYW5jZS5cbiAgICBjb25zdCB7IGJ1ZmZlciwgdmlldywgYmxvY2tMZW4sIGlzTEUgfSA9IHRoaXM7XG4gICAgbGV0IHsgcG9zIH0gPSB0aGlzO1xuICAgIC8vIGFwcGVuZCB0aGUgYml0ICcxJyB0byB0aGUgbWVzc2FnZVxuICAgIGJ1ZmZlcltwb3MrK10gPSAwYjEwMDAwMDAwO1xuICAgIGNsZWFuKHRoaXMuYnVmZmVyLnN1YmFycmF5KHBvcykpO1xuICAgIC8vIHdlIGhhdmUgbGVzcyB0aGFuIHBhZE9mZnNldCBsZWZ0IGluIGJ1ZmZlciwgc28gd2UgY2Fubm90IHB1dCBsZW5ndGggaW5cbiAgICAvLyBjdXJyZW50IGJsb2NrLCBuZWVkIHByb2Nlc3MgaXQgYW5kIHBhZCBhZ2FpblxuICAgIGlmICh0aGlzLnBhZE9mZnNldCA+IGJsb2NrTGVuIC0gcG9zKSB7XG4gICAgICB0aGlzLnByb2Nlc3ModmlldywgMCk7XG4gICAgICBwb3MgPSAwO1xuICAgIH1cbiAgICAvLyBQYWQgdW50aWwgZnVsbCBibG9jayBieXRlIHdpdGggemVyb3NcbiAgICBmb3IgKGxldCBpID0gcG9zOyBpIDwgYmxvY2tMZW47IGkrKykgYnVmZmVyW2ldID0gMDtcbiAgICAvLyBOb3RlOiBzaGE1MTIgcmVxdWlyZXMgbGVuZ3RoIHRvIGJlIDEyOGJpdCBpbnRlZ2VyLCBidXQgbGVuZ3RoIGluIEpTIHdpbGwgb3ZlcmZsb3cgYmVmb3JlIHRoYXRcbiAgICAvLyBZb3UgbmVlZCB0byB3cml0ZSBhcm91bmQgMiBleGFieXRlcyAodTY0X21heCAvIDggLyAoMTAyNCoqNikpIGZvciB0aGlzIHRvIGhhcHBlbi5cbiAgICAvLyBTbyB3ZSBqdXN0IHdyaXRlIGxvd2VzdCA2NCBiaXRzIG9mIHRoYXQgdmFsdWUuXG4gICAgdmlldy5zZXRCaWdVaW50NjQoYmxvY2tMZW4gLSA4LCBCaWdJbnQodGhpcy5sZW5ndGggKiA4KSwgaXNMRSk7XG4gICAgdGhpcy5wcm9jZXNzKHZpZXcsIDApO1xuICAgIGNvbnN0IG92aWV3ID0gY3JlYXRlVmlldyhvdXQpO1xuICAgIGNvbnN0IGxlbiA9IHRoaXMub3V0cHV0TGVuO1xuICAgIC8vIE5PVEU6IHdlIGRvIGRpdmlzaW9uIGJ5IDQgbGF0ZXIsIHdoaWNoIG11c3QgYmUgZnVzZWQgaW4gc2luZ2xlIG9wIHdpdGggbW9kdWxvIGJ5IEpJVFxuICAgIGlmIChsZW4gJSA0KSB0aHJvdyBuZXcgRXJyb3IoJ19zaGEyOiBvdXRwdXRMZW4gbXVzdCBiZSBhbGlnbmVkIHRvIDMyYml0Jyk7XG4gICAgY29uc3Qgb3V0TGVuID0gbGVuIC8gNDtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZ2V0KCk7XG4gICAgaWYgKG91dExlbiA+IHN0YXRlLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdfc2hhMjogb3V0cHV0TGVuIGJpZ2dlciB0aGFuIHN0YXRlJyk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRMZW47IGkrKykgb3ZpZXcuc2V0VWludDMyKDQgKiBpLCBzdGF0ZVtpXSwgaXNMRSk7XG4gIH1cbiAgZGlnZXN0KCk6IFVpbnQ4QXJyYXkge1xuICAgIGNvbnN0IHsgYnVmZmVyLCBvdXRwdXRMZW4gfSA9IHRoaXM7XG4gICAgdGhpcy5kaWdlc3RJbnRvKGJ1ZmZlcik7XG4gICAgY29uc3QgcmVzID0gYnVmZmVyLnNsaWNlKDAsIG91dHB1dExlbik7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICBfY2xvbmVJbnRvKHRvPzogVCk6IFQge1xuICAgIHRvIHx8PSBuZXcgKHRoaXMuY29uc3RydWN0b3IgYXMgYW55KSgpIGFzIFQ7XG4gICAgdG8uc2V0KC4uLnRoaXMuZ2V0KCkpO1xuICAgIGNvbnN0IHsgYmxvY2tMZW4sIGJ1ZmZlciwgbGVuZ3RoLCBmaW5pc2hlZCwgZGVzdHJveWVkLCBwb3MgfSA9IHRoaXM7XG4gICAgdG8uZGVzdHJveWVkID0gZGVzdHJveWVkO1xuICAgIHRvLmZpbmlzaGVkID0gZmluaXNoZWQ7XG4gICAgdG8ubGVuZ3RoID0gbGVuZ3RoO1xuICAgIHRvLnBvcyA9IHBvcztcbiAgICBpZiAobGVuZ3RoICUgYmxvY2tMZW4pIHRvLmJ1ZmZlci5zZXQoYnVmZmVyKTtcbiAgICByZXR1cm4gdG8gYXMgdW5rbm93biBhcyBhbnk7XG4gIH1cbiAgY2xvbmUoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX2Nsb25lSW50bygpO1xuICB9XG59XG5cbi8qKlxuICogSW5pdGlhbCBTSEEtMiBzdGF0ZTogZnJhY3Rpb25hbCBwYXJ0cyBvZiBzcXVhcmUgcm9vdHMgb2YgZmlyc3QgMTYgcHJpbWVzIDIuLjUzLlxuICogQ2hlY2sgb3V0IGB0ZXN0L21pc2Mvc2hhMi1nZW4taXYuanNgIGZvciByZWNvbXB1dGF0aW9uIGd1aWRlLlxuICovXG5cbi8qKiBJbml0aWFsIFNIQTI1NiBzdGF0ZS4gQml0cyAwLi4zMiBvZiBmcmFjIHBhcnQgb2Ygc3FydCBvZiBwcmltZXMgMi4uMTkgKi9cbmV4cG9ydCBjb25zdCBTSEEyNTZfSVY6IFVpbnQzMkFycmF5ID0gLyogQF9fUFVSRV9fICovIFVpbnQzMkFycmF5LmZyb20oW1xuICAweDZhMDllNjY3LCAweGJiNjdhZTg1LCAweDNjNmVmMzcyLCAweGE1NGZmNTNhLCAweDUxMGU1MjdmLCAweDliMDU2ODhjLCAweDFmODNkOWFiLCAweDViZTBjZDE5LFxuXSk7XG5cbi8qKiBJbml0aWFsIFNIQTIyNCBzdGF0ZS4gQml0cyAzMi4uNjQgb2YgZnJhYyBwYXJ0IG9mIHNxcnQgb2YgcHJpbWVzIDIzLi41MyAqL1xuZXhwb3J0IGNvbnN0IFNIQTIyNF9JVjogVWludDMyQXJyYXkgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4YzEwNTllZDgsIDB4MzY3Y2Q1MDcsIDB4MzA3MGRkMTcsIDB4ZjcwZTU5MzksIDB4ZmZjMDBiMzEsIDB4Njg1ODE1MTEsIDB4NjRmOThmYTcsIDB4YmVmYTRmYTQsXG5dKTtcblxuLyoqIEluaXRpYWwgU0hBMzg0IHN0YXRlLiBCaXRzIDAuLjY0IG9mIGZyYWMgcGFydCBvZiBzcXJ0IG9mIHByaW1lcyAyMy4uNTMgKi9cbmV4cG9ydCBjb25zdCBTSEEzODRfSVY6IFVpbnQzMkFycmF5ID0gLyogQF9fUFVSRV9fICovIFVpbnQzMkFycmF5LmZyb20oW1xuICAweGNiYmI5ZDVkLCAweGMxMDU5ZWQ4LCAweDYyOWEyOTJhLCAweDM2N2NkNTA3LCAweDkxNTkwMTVhLCAweDMwNzBkZDE3LCAweDE1MmZlY2Q4LCAweGY3MGU1OTM5LFxuICAweDY3MzMyNjY3LCAweGZmYzAwYjMxLCAweDhlYjQ0YTg3LCAweDY4NTgxNTExLCAweGRiMGMyZTBkLCAweDY0Zjk4ZmE3LCAweDQ3YjU0ODFkLCAweGJlZmE0ZmE0LFxuXSk7XG5cbi8qKiBJbml0aWFsIFNIQTUxMiBzdGF0ZS4gQml0cyAwLi42NCBvZiBmcmFjIHBhcnQgb2Ygc3FydCBvZiBwcmltZXMgMi4uMTkgKi9cbmV4cG9ydCBjb25zdCBTSEE1MTJfSVY6IFVpbnQzMkFycmF5ID0gLyogQF9fUFVSRV9fICovIFVpbnQzMkFycmF5LmZyb20oW1xuICAweDZhMDllNjY3LCAweGYzYmNjOTA4LCAweGJiNjdhZTg1LCAweDg0Y2FhNzNiLCAweDNjNmVmMzcyLCAweGZlOTRmODJiLCAweGE1NGZmNTNhLCAweDVmMWQzNmYxLFxuICAweDUxMGU1MjdmLCAweGFkZTY4MmQxLCAweDliMDU2ODhjLCAweDJiM2U2YzFmLCAweDFmODNkOWFiLCAweGZiNDFiZDZiLCAweDViZTBjZDE5LCAweDEzN2UyMTc5LFxuXSk7XG4iLCAiLyoqXG4gKiBAbW9kdWxlIG5vc3RyLWNyeXB0by11dGlsc1xuICogQGRlc2NyaXB0aW9uIENvcmUgY3J5cHRvZ3JhcGhpYyB1dGlsaXRpZXMgZm9yIE5vc3RyIHByb3RvY29sXG4gKi9cblxuLy8gQ29yZSB0eXBlc1xuZXhwb3J0IHR5cGUge1xuICBOb3N0ckV2ZW50LFxuICBVbnNpZ25lZE5vc3RyRXZlbnQsXG4gIFNpZ25lZE5vc3RyRXZlbnQsXG4gIE5vc3RyRmlsdGVyLFxuICBOb3N0clN1YnNjcmlwdGlvbixcbiAgUHVibGljS2V5LFxuICBLZXlQYWlyLFxuICBOb3N0ck1lc3NhZ2VUdXBsZSxcbn0gZnJvbSAnLi90eXBlcyc7XG5cbi8vIEV2ZW50IGtpbmRzLCBtZXNzYWdlIHR5cGVzLCBhbmQgTklQLTQ2IHR5cGVzXG5leHBvcnQgeyBOb3N0ckV2ZW50S2luZCwgTm9zdHJNZXNzYWdlVHlwZSwgTmlwNDZNZXRob2QgfSBmcm9tICcuL3R5cGVzJztcbmV4cG9ydCB0eXBlIHtcbiAgTmlwNDZSZXF1ZXN0LFxuICBOaXA0NlJlc3BvbnNlLFxuICBOaXA0NlNlc3Npb24sXG4gIE5pcDQ2U2Vzc2lvbkluZm8sXG4gIEJ1bmtlclVSSSxcbiAgQnVua2VyVmFsaWRhdGlvblJlc3VsdCxcbn0gZnJvbSAnLi90eXBlcyc7XG5cbi8vIENvcmUgY3J5cHRvIGZ1bmN0aW9uc1xuZXhwb3J0IHtcbiAgZ2VuZXJhdGVLZXlQYWlyLFxuICBnZXRQdWJsaWNLZXksXG4gIGdldFB1YmxpY0tleVN5bmMsXG4gIHZhbGlkYXRlS2V5UGFpcixcbiAgY3JlYXRlRXZlbnQsXG4gIHNpZ25FdmVudCxcbiAgZmluYWxpemVFdmVudCxcbiAgdmVyaWZ5U2lnbmF0dXJlLFxuICBlbmNyeXB0LFxuICBkZWNyeXB0LFxufSBmcm9tICcuL2NyeXB0byc7XG5cbi8vIFZhbGlkYXRpb24gZnVuY3Rpb25zXG5leHBvcnQge1xuICB2YWxpZGF0ZUV2ZW50LFxuICB2YWxpZGF0ZUV2ZW50SWQsXG4gIHZhbGlkYXRlRXZlbnRTaWduYXR1cmUsXG4gIHZhbGlkYXRlU2lnbmVkRXZlbnQsXG4gIHZhbGlkYXRlRXZlbnRCYXNlLFxuICB2YWxpZGF0ZUZpbHRlcixcbiAgdmFsaWRhdGVTdWJzY3JpcHRpb24sXG4gIHZhbGlkYXRlUmVzcG9uc2UsXG59IGZyb20gJy4vdmFsaWRhdGlvbic7XG5cbi8vIEV2ZW50IGZ1bmN0aW9uc1xuZXhwb3J0IHtcbiAgY2FsY3VsYXRlRXZlbnRJZCxcbn0gZnJvbSAnLi9ldmVudCc7XG5cbi8vIE5JUC0wNCBlbmNyeXB0aW9uXG5leHBvcnQge1xuICBjb21wdXRlU2hhcmVkU2VjcmV0LFxuICBlbmNyeXB0TWVzc2FnZSxcbiAgZGVjcnlwdE1lc3NhZ2UsXG59IGZyb20gJy4vbmlwcy9uaXAtMDQnO1xuXG4vLyBSZS1leHBvcnQgTklQc1xuZXhwb3J0ICogYXMgbmlwMDEgZnJvbSAnLi9uaXBzL25pcC0wMSc7XG5leHBvcnQgKiBhcyBuaXAwNCBmcm9tICcuL25pcHMvbmlwLTA0JztcbmV4cG9ydCAqIGFzIG5pcDE5IGZyb20gJy4vbmlwcy9uaXAtMTknO1xuZXhwb3J0ICogYXMgbmlwMjYgZnJvbSAnLi9uaXBzL25pcC0yNic7XG5leHBvcnQgKiBhcyBuaXA0NCBmcm9tICcuL25pcHMvbmlwLTQ0JztcbmV4cG9ydCAqIGFzIG5pcDQ2IGZyb20gJy4vbmlwcy9uaXAtNDYnO1xuZXhwb3J0ICogYXMgbmlwNDkgZnJvbSAnLi9uaXBzL25pcC00OSc7XG5cbi8vIFV0aWxzXG5leHBvcnQge1xuICBoZXhUb0J5dGVzLFxuICBieXRlc1RvSGV4LFxuICB1dGY4VG9CeXRlcyxcbiAgYnl0ZXNUb1V0ZjgsXG59IGZyb20gJy4vdXRpbHMvZW5jb2RpbmcnO1xuIiwgIi8qKlxuICogQG1vZHVsZSB0eXBlc1xuICogQGRlc2NyaXB0aW9uIFR5cGUgZGVmaW5pdGlvbnMgZm9yIE5vc3RyXG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBQdWJsaWNLZXlEZXRhaWxzIHtcbiAgaGV4OiBzdHJpbmc7XG4gIGJ5dGVzOiBVaW50OEFycmF5O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEtleVBhaXIge1xuICBwcml2YXRlS2V5OiBzdHJpbmc7XG4gIHB1YmxpY0tleTogUHVibGljS2V5RGV0YWlscztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOb3N0ckV2ZW50IHtcbiAga2luZDogbnVtYmVyO1xuICBjcmVhdGVkX2F0OiBudW1iZXI7XG4gIHRhZ3M6IHN0cmluZ1tdW107XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgcHVia2V5OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmVkTm9zdHJFdmVudCBleHRlbmRzIE5vc3RyRXZlbnQge1xuICBpZDogc3RyaW5nO1xuICBzaWc6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQdWJsaWNLZXkge1xuICBoZXg6IHN0cmluZztcbiAgYnl0ZXM/OiBVaW50OEFycmF5O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRpb25SZXN1bHQge1xuICBpc1ZhbGlkOiBib29sZWFuO1xuICBlcnJvcj86IHN0cmluZztcbn1cblxuZXhwb3J0IGVudW0gTm9zdHJFdmVudEtpbmQge1xuICBTRVRfTUVUQURBVEEgPSAwLFxuICBURVhUX05PVEUgPSAxLFxuICBSRUNPTU1FTkRfU0VSVkVSID0gMixcbiAgQ09OVEFDVF9MSVNUID0gMyxcbiAgRU5DUllQVEVEX0RJUkVDVF9NRVNTQUdFID0gNCxcbiAgREVMRVRFID0gNSxcbiAgUkVQT1NUID0gNixcbiAgUkVBQ1RJT04gPSA3LFxuICBCQURHRV9BV0FSRCA9IDgsXG4gIENIQU5ORUxfQ1JFQVRFID0gNDAsXG4gIENIQU5ORUxfTUVUQURBVEEgPSA0MSxcbiAgQ0hBTk5FTF9NRVNTQUdFID0gNDIsXG4gIENIQU5ORUxfSElERV9NRVNTQUdFID0gNDMsXG4gIENIQU5ORUxfTVVURV9VU0VSID0gNDQsXG4gIENIQU5ORUxfUkVTRVJWRSA9IDQ1LFxuICBSRVBPUlRJTkcgPSAxOTg0LFxuICBaQVBfUkVRVUVTVCA9IDk3MzQsXG4gIFpBUCA9IDk3MzUsXG4gIE1VVEVfTElTVCA9IDEwMDAwLFxuICBQSU5fTElTVCA9IDEwMDAxLFxuICBSRUxBWV9MSVNUX01FVEFEQVRBID0gMTAwMDIsXG4gIENMSUVOVF9BVVRIID0gMjIyNDIsXG4gIEFVVEhfUkVTUE9OU0UgPSAyMjI0MyxcbiAgTk9TVFJfQ09OTkVDVCA9IDI0MTMzLFxuICBDQVRFR09SSVpFRF9QRU9QTEUgPSAzMDAwMCxcbiAgQ0FURUdPUklaRURfQk9PS01BUktTID0gMzAwMDEsXG4gIFBST0ZJTEVfQkFER0VTID0gMzAwMDgsXG4gIEJBREdFX0RFRklOSVRJT04gPSAzMDAwOSxcbiAgTE9OR19GT1JNID0gMzAwMjMsXG4gIEFQUExJQ0FUSU9OX1NQRUNJRklDID0gMzAwNzhcbn1cblxuLyoqXG4gKiBSZS1leHBvcnQgYWxsIHR5cGVzIGZyb20gYmFzZSBtb2R1bGVcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICovXG5leHBvcnQgKiBmcm9tICcuL2Jhc2UnO1xuXG4vKiogUmUtZXhwb3J0IHByb3RvY29sIHR5cGVzICovXG5leHBvcnQgKiBmcm9tICcuL3Byb3RvY29sJztcblxuLyoqIFJlLWV4cG9ydCBtZXNzYWdlIHR5cGVzICovXG5leHBvcnQgKiBmcm9tICcuL21lc3NhZ2VzJztcblxuLyoqIFJlLWV4cG9ydCB0eXBlIGd1YXJkcyAqL1xuZXhwb3J0ICogZnJvbSAnLi9ndWFyZHMnO1xuXG4vLyBSZS1leHBvcnQgTklQLTE5IHR5cGVzXG5leHBvcnQgdHlwZSB7XG4gIE5pcDE5RGF0YVR5cGVcbn0gZnJvbSAnLi4vbmlwcy9uaXAtMTknO1xuXG4vKiogUmUtZXhwb3J0IE5JUC00NiB0eXBlcyAqL1xuZXhwb3J0ICogZnJvbSAnLi9uaXA0Nic7XG4iLCAiLyoqXG4gKiBAbW9kdWxlIHR5cGVzL2Jhc2VcbiAqIEBkZXNjcmlwdGlvbiBDb3JlIHR5cGUgZGVmaW5pdGlvbnMgZm9yIE5vc3RyIHByb3RvY29sXG4gKi9cblxuLy8gS2V5IFR5cGVzXG5leHBvcnQgdHlwZSBQdWJsaWNLZXlIZXggPSBzdHJpbmc7XG5leHBvcnQgdHlwZSBQcml2YXRlS2V5SGV4ID0gc3RyaW5nO1xuXG5leHBvcnQgaW50ZXJmYWNlIFB1YmxpY0tleURldGFpbHMge1xuICAvKiogUHVibGljIGtleSBpbiBoZXggZm9ybWF0ICovXG4gIGhleDogc3RyaW5nO1xuICAvKiogTklQLTA1IGlkZW50aWZpZXIgKi9cbiAgbmlwMDU6IHN0cmluZztcbiAgLyoqIFB1YmxpYyBrZXkgaW4gYnl0ZXMgZm9ybWF0ICovXG4gIGJ5dGVzOiBVaW50OEFycmF5O1xufVxuXG5leHBvcnQgdHlwZSBQdWJsaWNLZXkgPSBQdWJsaWNLZXlIZXggfCBQdWJsaWNLZXlEZXRhaWxzO1xuXG5leHBvcnQgaW50ZXJmYWNlIEtleVBhaXIge1xuICAvKiogUHJpdmF0ZSBrZXkgaW4gaGV4IGZvcm1hdCAqL1xuICBwcml2YXRlS2V5OiBQcml2YXRlS2V5SGV4O1xuICAvKiogUHVibGljIGtleSBkZXRhaWxzICovXG4gIHB1YmxpY0tleTogUHVibGljS2V5RGV0YWlscztcbn1cblxuLy8gRXZlbnQgVHlwZXNcbmV4cG9ydCBlbnVtIE5vc3RyRXZlbnRLaW5kIHtcbiAgLy8gTklQLTAxOiBDb3JlIFByb3RvY29sXG4gIFNFVF9NRVRBREFUQSA9IDAsXG4gIFRFWFRfTk9URSA9IDEsXG4gIFJFQ09NTUVORF9TRVJWRVIgPSAyLFxuICBDT05UQUNUUyA9IDMsXG4gIEVOQ1JZUFRFRF9ESVJFQ1RfTUVTU0FHRSA9IDQsXG4gIEVWRU5UX0RFTEVUSU9OID0gNSxcbiAgUkVQT1NUID0gNixcbiAgUkVBQ1RJT04gPSA3LFxuXG4gIC8vIE5JUC0yODogUHVibGljIENoYXRcbiAgQ0hBTk5FTF9DUkVBVElPTiA9IDQwLFxuICBDSEFOTkVMX01FVEFEQVRBID0gNDEsXG4gIENIQU5ORUxfTUVTU0FHRSA9IDQyLFxuICBDSEFOTkVMX0hJREVfTUVTU0FHRSA9IDQzLFxuICBDSEFOTkVMX01VVEVfVVNFUiA9IDQ0LFxuXG4gIC8vIE5JUC00MjogQXV0aGVudGljYXRpb25cbiAgQVVUSCA9IDIyMjQyLFxuICBBVVRIX1JFU1BPTlNFID0gMjIyNDNcbn1cblxuLyoqIEJhc2UgaW50ZXJmYWNlIGZvciBhbGwgTm9zdHIgZXZlbnRzICovXG5leHBvcnQgaW50ZXJmYWNlIEJhc2VOb3N0ckV2ZW50IHtcbiAgLyoqIEV2ZW50IGtpbmQgYXMgZGVmaW5lZCBpbiBOSVBzICovXG4gIGtpbmQ6IG51bWJlcjtcbiAgLyoqIENvbnRlbnQgb2YgdGhlIGV2ZW50ICovXG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgLyoqIEFycmF5IG9mIHRhZ3MgKi9cbiAgdGFnczogc3RyaW5nW11bXTtcbiAgLyoqIFVuaXggdGltZXN0YW1wIGluIHNlY29uZHMgKi9cbiAgY3JlYXRlZF9hdDogbnVtYmVyO1xufVxuXG4vKiogSW50ZXJmYWNlIGZvciBldmVudHMgdGhhdCBoYXZlbid0IGJlZW4gc2lnbmVkIHlldCAqL1xuZXhwb3J0IGludGVyZmFjZSBVbnNpZ25lZE5vc3RyRXZlbnQgZXh0ZW5kcyBCYXNlTm9zdHJFdmVudCB7XG4gIC8qKiBPcHRpb25hbCBwdWJsaWMga2V5ICovXG4gIHB1YmtleT86IHN0cmluZztcbn1cblxuLyoqIEludGVyZmFjZSBmb3Igc2lnbmVkIGV2ZW50cyAqL1xuZXhwb3J0IGludGVyZmFjZSBTaWduZWROb3N0ckV2ZW50IGV4dGVuZHMgQmFzZU5vc3RyRXZlbnQge1xuICAvKiogUHVibGljIGtleSBvZiB0aGUgZXZlbnQgY3JlYXRvciAqL1xuICBwdWJrZXk6IHN0cmluZztcbiAgLyoqIEV2ZW50IElEIChzaGEyNTYgb2YgdGhlIHNlcmlhbGl6ZWQgZXZlbnQpICovXG4gIGlkOiBzdHJpbmc7XG4gIC8qKiBTY2hub3JyIHNpZ25hdHVyZSBvZiB0aGUgZXZlbnQgSUQgKi9cbiAgc2lnOiBzdHJpbmc7XG59XG5cbi8qKiBBbGlhcyBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSAqL1xuZXhwb3J0IHR5cGUgTm9zdHJFdmVudCA9IFNpZ25lZE5vc3RyRXZlbnQ7XG5cbi8qKiBUeXBlIGZvciBjcmVhdGluZyBuZXcgZXZlbnRzICovXG5leHBvcnQgdHlwZSBVbnNpZ25lZEV2ZW50ID0gT21pdDxOb3N0ckV2ZW50LCAnaWQnIHwgJ3NpZyc+O1xuXG4vLyBGaWx0ZXIgVHlwZXNcbmV4cG9ydCBpbnRlcmZhY2UgTm9zdHJGaWx0ZXIge1xuICBpZHM/OiBzdHJpbmdbXTtcbiAgYXV0aG9ycz86IHN0cmluZ1tdO1xuICBraW5kcz86IE5vc3RyRXZlbnRLaW5kW107XG4gIHNpbmNlPzogbnVtYmVyO1xuICB1bnRpbD86IG51bWJlcjtcbiAgbGltaXQ/OiBudW1iZXI7XG4gICcjZSc/OiBzdHJpbmdbXTtcbiAgJyNwJz86IHN0cmluZ1tdO1xuICBzZWFyY2g/OiBzdHJpbmc7XG4gIC8qKiBTdXBwb3J0IGZvciBhcmJpdHJhcnkgdGFncyAoTklQLTEyKSAqL1xuICBba2V5OiBgIyR7c3RyaW5nfWBdOiBzdHJpbmdbXSB8IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOb3N0clN1YnNjcmlwdGlvbiB7XG4gIGlkOiBzdHJpbmc7XG4gIGZpbHRlcnM6IE5vc3RyRmlsdGVyW107XG59XG5cbi8vIE1lc3NhZ2UgVHlwZXNcbmV4cG9ydCBlbnVtIE5vc3RyTWVzc2FnZVR5cGUge1xuICBFVkVOVCA9ICdFVkVOVCcsXG4gIE5PVElDRSA9ICdOT1RJQ0UnLFxuICBPSyA9ICdPSycsXG4gIEVPU0UgPSAnRU9TRScsXG4gIFJFUSA9ICdSRVEnLFxuICBDTE9TRSA9ICdDTE9TRScsXG4gIEFVVEggPSAnQVVUSCdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOb3N0ck1lc3NhZ2Uge1xuICB0eXBlOiBOb3N0ck1lc3NhZ2VUeXBlO1xuICBldmVudD86IFNpZ25lZE5vc3RyRXZlbnQ7XG4gIHN1YnNjcmlwdGlvbklkPzogc3RyaW5nO1xuICBmaWx0ZXJzPzogTm9zdHJGaWx0ZXJbXTtcbiAgZXZlbnRJZD86IHN0cmluZztcbiAgYWNjZXB0ZWQ/OiBib29sZWFuO1xuICBtZXNzYWdlPzogc3RyaW5nO1xuICBjb3VudD86IG51bWJlcjtcbiAgcGF5bG9hZD86IHN0cmluZyB8IChzdHJpbmcgfCBib29sZWFuKVtdOyAgXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTm9zdHJSZXNwb25zZSB7XG4gIHR5cGU6IE5vc3RyTWVzc2FnZVR5cGU7XG4gIGV2ZW50PzogU2lnbmVkTm9zdHJFdmVudDtcbiAgc3Vic2NyaXB0aW9uSWQ/OiBzdHJpbmc7XG4gIGZpbHRlcnM/OiBOb3N0ckZpbHRlcltdO1xuICBldmVudElkPzogc3RyaW5nO1xuICBhY2NlcHRlZD86IGJvb2xlYW47XG4gIG1lc3NhZ2U/OiBzdHJpbmc7XG4gIGNvdW50PzogbnVtYmVyO1xufVxuXG4vLyBVdGlsaXR5IFR5cGVzXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRpb25SZXN1bHQge1xuICBpc1ZhbGlkOiBib29sZWFuO1xuICBlcnJvcj86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOb3N0ckVycm9yIHtcbiAgY29kZTogc3RyaW5nO1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIGRldGFpbHM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgdHlwZXMvcHJvdG9jb2xcbiAqIEBkZXNjcmlwdGlvbiBOb3N0ciBwcm90b2NvbCB0eXBlc1xuICovXG5cbmltcG9ydCB0eXBlIHsgXG4gIE5vc3RyRmlsdGVyLCBcbiAgUHVibGljS2V5LFxuICBOb3N0ck1lc3NhZ2VUeXBlLFxuICBOb3N0clN1YnNjcmlwdGlvbixcbiAgTm9zdHJSZXNwb25zZSxcbiAgTm9zdHJFcnJvclxufSBmcm9tICcuL2Jhc2UuanMnO1xuXG4vLyBSZS1leHBvcnQgdHlwZXMgZnJvbSBiYXNlIHRoYXQgYXJlIHVzZWQgaW4gdGhpcyBtb2R1bGVcbmV4cG9ydCB0eXBlIHsgXG4gIE5vc3RyRmlsdGVyLCBcbiAgUHVibGljS2V5LFxuICBOb3N0ck1lc3NhZ2VUeXBlLFxuICBOb3N0clN1YnNjcmlwdGlvbixcbiAgTm9zdHJSZXNwb25zZSxcbiAgTm9zdHJFcnJvclxufTtcbiIsICJleHBvcnQge307XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tZXNzYWdlcy5qcy5tYXAiLCAiLyoqXG4gKiBAbW9kdWxlIHR5cGVzL2d1YXJkc1xuICogQGRlc2NyaXB0aW9uIFR5cGUgZ3VhcmQgZnVuY3Rpb25zIGZvciBOb3N0ciB0eXBlc1xuICovXG5cbmltcG9ydCB7IE5vc3RyRXZlbnQsIFNpZ25lZE5vc3RyRXZlbnQsIE5vc3RyRmlsdGVyLCBOb3N0clN1YnNjcmlwdGlvbiwgTm9zdHJSZXNwb25zZSwgTm9zdHJFcnJvciB9IGZyb20gJy4vYmFzZSc7XG5cbi8qKlxuICogVHlwZSBndWFyZCBmb3IgTm9zdHJFdmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOb3N0ckV2ZW50KGV2ZW50OiB1bmtub3duKTogZXZlbnQgaXMgTm9zdHJFdmVudCB7XG4gIGlmICh0eXBlb2YgZXZlbnQgIT09ICdvYmplY3QnIHx8IGV2ZW50ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgdmFsaWRFdmVudCA9IGV2ZW50IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIC8vIFJlcXVpcmVkIGZpZWxkc1xuICBpZiAodHlwZW9mIHZhbGlkRXZlbnQua2luZCAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIodmFsaWRFdmVudC5raW5kKSB8fCB2YWxpZEV2ZW50LmtpbmQgPCAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWxpZEV2ZW50LmNvbnRlbnQgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWxpZEV2ZW50LmNyZWF0ZWRfYXQgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKHZhbGlkRXZlbnQuY3JlYXRlZF9hdCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBDaGVjayBwdWJrZXkgc3RydWN0dXJlXG4gIGlmICh2YWxpZEV2ZW50LnB1YmtleSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHR5cGVvZiB2YWxpZEV2ZW50LnB1YmtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmICghdmFsaWRFdmVudC5wdWJrZXkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbGlkRXZlbnQucHVia2V5ID09PSAnb2JqZWN0JyAmJiB2YWxpZEV2ZW50LnB1YmtleSAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgcHVia2V5ID0gdmFsaWRFdmVudC5wdWJrZXkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICBpZiAodHlwZW9mIHB1YmtleS5oZXggIT09ICdzdHJpbmcnIHx8ICFwdWJrZXkuaGV4KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8vIENoZWNrIHRhZ3MgYXJyYXlcbiAgaWYgKCFBcnJheS5pc0FycmF5KHZhbGlkRXZlbnQudGFncykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBDaGVjayB0YWcgYXJyYXkgZWxlbWVudHNcbiAgaWYgKCF2YWxpZEV2ZW50LnRhZ3MuZXZlcnkodGFnID0+IEFycmF5LmlzQXJyYXkodGFnKSAmJiB0YWcuZXZlcnkoaXRlbSA9PiB0eXBlb2YgaXRlbSA9PT0gJ3N0cmluZycpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFR5cGUgZ3VhcmQgZm9yIFNpZ25lZE5vc3RyRXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU2lnbmVkTm9zdHJFdmVudChldmVudDogdW5rbm93bik6IGV2ZW50IGlzIFNpZ25lZE5vc3RyRXZlbnQge1xuICBpZiAoIWV2ZW50IHx8IHR5cGVvZiBldmVudCAhPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBzaWduZWRFdmVudCA9IGV2ZW50IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIC8vIENoZWNrIHJlcXVpcmVkIGZpZWxkcyBmcm9tIE5vc3RyRXZlbnRcbiAgaWYgKCFpc05vc3RyRXZlbnQoZXZlbnQpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ2hlY2sgcHVia2V5IGlzIHByZXNlbnQgYW5kIHZhbGlkXG4gIGlmICh0eXBlb2Ygc2lnbmVkRXZlbnQucHVia2V5ID09PSAnc3RyaW5nJykge1xuICAgIGlmICghc2lnbmVkRXZlbnQucHVia2V5KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiBzaWduZWRFdmVudC5wdWJrZXkgPT09ICdvYmplY3QnICYmIHNpZ25lZEV2ZW50LnB1YmtleSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IHB1YmtleSA9IHNpZ25lZEV2ZW50LnB1YmtleSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBpZiAodHlwZW9mIHB1YmtleS5oZXggIT09ICdzdHJpbmcnIHx8ICFwdWJrZXkuaGV4KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENoZWNrIGlkIGZpZWxkXG4gIGlmICh0eXBlb2Ygc2lnbmVkRXZlbnQuaWQgIT09ICdzdHJpbmcnIHx8ICFzaWduZWRFdmVudC5pZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENoZWNrIHNpZyBmaWVsZFxuICBpZiAodHlwZW9mIHNpZ25lZEV2ZW50LnNpZyAhPT0gJ3N0cmluZycgfHwgIXNpZ25lZEV2ZW50LnNpZykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFR5cGUgZ3VhcmQgZm9yIE5vc3RyRmlsdGVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05vc3RyRmlsdGVyKGZpbHRlcjogdW5rbm93bik6IGZpbHRlciBpcyBOb3N0ckZpbHRlciB7XG4gIGlmICh0eXBlb2YgZmlsdGVyICE9PSAnb2JqZWN0JyB8fCBmaWx0ZXIgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCB2YWxpZEZpbHRlciA9IGZpbHRlciBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgY29uc3QgdmFsaWRLZXlzID0gWydpZHMnLCAnYXV0aG9ycycsICdraW5kcycsICdzaW5jZScsICd1bnRpbCcsICdsaW1pdCcsICcjZScsICcjcCcsICcjdCddO1xuICBjb25zdCBmaWx0ZXJLZXlzID0gT2JqZWN0LmtleXModmFsaWRGaWx0ZXIpO1xuXG4gIC8vIENoZWNrIGlmIGFsbCBrZXlzIGluIHRoZSBmaWx0ZXIgYXJlIHZhbGlkXG4gIGlmICghZmlsdGVyS2V5cy5ldmVyeShrZXkgPT4gdmFsaWRLZXlzLmluY2x1ZGVzKGtleSkpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgYXJyYXkgZmllbGRzXG4gIGlmICh2YWxpZEZpbHRlci5pZHMgIT09IHVuZGVmaW5lZCAmJiAoIUFycmF5LmlzQXJyYXkodmFsaWRGaWx0ZXIuaWRzKSB8fCAhdmFsaWRGaWx0ZXIuaWRzLmV2ZXJ5KGlkID0+IHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodmFsaWRGaWx0ZXIuYXV0aG9ycyAhPT0gdW5kZWZpbmVkICYmICghQXJyYXkuaXNBcnJheSh2YWxpZEZpbHRlci5hdXRob3JzKSB8fCAhdmFsaWRGaWx0ZXIuYXV0aG9ycy5ldmVyeShhdXRob3IgPT4gdHlwZW9mIGF1dGhvciA9PT0gJ3N0cmluZycpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodmFsaWRGaWx0ZXIua2luZHMgIT09IHVuZGVmaW5lZCAmJiAoIUFycmF5LmlzQXJyYXkodmFsaWRGaWx0ZXIua2luZHMpIHx8ICF2YWxpZEZpbHRlci5raW5kcy5ldmVyeShraW5kID0+IHR5cGVvZiBraW5kID09PSAnbnVtYmVyJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKGtpbmQpICYmIGtpbmQgPj0gMCkpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh2YWxpZEZpbHRlclsnI2UnXSAhPT0gdW5kZWZpbmVkICYmICghQXJyYXkuaXNBcnJheSh2YWxpZEZpbHRlclsnI2UnXSkgfHwgIXZhbGlkRmlsdGVyWycjZSddLmV2ZXJ5KGUgPT4gdHlwZW9mIGUgPT09ICdzdHJpbmcnKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHZhbGlkRmlsdGVyWycjcCddICE9PSB1bmRlZmluZWQgJiYgKCFBcnJheS5pc0FycmF5KHZhbGlkRmlsdGVyWycjcCddKSB8fCAhdmFsaWRGaWx0ZXJbJyNwJ10uZXZlcnkocCA9PiB0eXBlb2YgcCA9PT0gJ3N0cmluZycpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodmFsaWRGaWx0ZXJbJyN0J10gIT09IHVuZGVmaW5lZCAmJiAoIUFycmF5LmlzQXJyYXkodmFsaWRGaWx0ZXJbJyN0J10pIHx8ICF2YWxpZEZpbHRlclsnI3QnXS5ldmVyeSh0ID0+IHR5cGVvZiB0ID09PSAnc3RyaW5nJykpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgbnVtYmVyIGZpZWxkc1xuICBpZiAodmFsaWRGaWx0ZXIuc2luY2UgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdmFsaWRGaWx0ZXIuc2luY2UgIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIGlmICh2YWxpZEZpbHRlci51bnRpbCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB2YWxpZEZpbHRlci51bnRpbCAhPT0gJ251bWJlcicpIHJldHVybiBmYWxzZTtcbiAgaWYgKHZhbGlkRmlsdGVyLmxpbWl0ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHZhbGlkRmlsdGVyLmxpbWl0ICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFR5cGUgZ3VhcmQgZm9yIE5vc3RyU3Vic2NyaXB0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05vc3RyU3Vic2NyaXB0aW9uKHN1YjogdW5rbm93bik6IHN1YiBpcyBOb3N0clN1YnNjcmlwdGlvbiB7XG4gIGlmICh0eXBlb2Ygc3ViICE9PSAnb2JqZWN0JyB8fCBzdWIgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCB2YWxpZFN1YiA9IHN1YiBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICBpZiAodHlwZW9mIHZhbGlkU3ViLmlkICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghQXJyYXkuaXNBcnJheSh2YWxpZFN1Yi5maWx0ZXJzKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghdmFsaWRTdWIuZmlsdGVycy5ldmVyeShmaWx0ZXIgPT4gaXNOb3N0ckZpbHRlcihmaWx0ZXIpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFR5cGUgZ3VhcmQgZm9yIE5vc3RyUmVzcG9uc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTm9zdHJSZXNwb25zZShyZXNwb25zZTogdW5rbm93bik6IHJlc3BvbnNlIGlzIE5vc3RyUmVzcG9uc2Uge1xuICBpZiAodHlwZW9mIHJlc3BvbnNlICE9PSAnb2JqZWN0JyB8fCByZXNwb25zZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHZhbGlkUmVzcG9uc2UgPSByZXNwb25zZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICBpZiAodHlwZW9mIHZhbGlkUmVzcG9uc2UudHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodmFsaWRSZXNwb25zZS5zdWJzY3JpcHRpb25JZCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB2YWxpZFJlc3BvbnNlLnN1YnNjcmlwdGlvbklkICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh2YWxpZFJlc3BvbnNlLmV2ZW50ICE9PSB1bmRlZmluZWQgJiYgIWlzU2lnbmVkTm9zdHJFdmVudCh2YWxpZFJlc3BvbnNlLmV2ZW50KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh2YWxpZFJlc3BvbnNlLm1lc3NhZ2UgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdmFsaWRSZXNwb25zZS5tZXNzYWdlICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFR5cGUgZ3VhcmQgZm9yIE5vc3RyRXJyb3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTm9zdHJFcnJvcihlcnJvcjogdW5rbm93bik6IGVycm9yIGlzIE5vc3RyRXJyb3Ige1xuICBpZiAodHlwZW9mIGVycm9yICE9PSAnb2JqZWN0JyB8fCBlcnJvciA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHZhbGlkRXJyb3IgPSBlcnJvciBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB2YWxpZEVycm9yLnR5cGUgPT09ICdzdHJpbmcnICYmXG4gICAgdHlwZW9mIHZhbGlkRXJyb3IubWVzc2FnZSA9PT0gJ3N0cmluZydcbiAgKTtcbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgdHlwZXMvbmlwNDZcbiAqIEBkZXNjcmlwdGlvbiBUeXBlIGRlZmluaXRpb25zIGZvciBOSVAtNDYgKE5vc3RyIENvbm5lY3QgLyBSZW1vdGUgU2lnbmluZylcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDYubWRcbiAqL1xuXG4vKipcbiAqIE5JUC00NiByZW1vdGUgc2lnbmluZyBtZXRob2RzXG4gKi9cbmV4cG9ydCBlbnVtIE5pcDQ2TWV0aG9kIHtcbiAgQ09OTkVDVCA9ICdjb25uZWN0JyxcbiAgUElORyA9ICdwaW5nJyxcbiAgR0VUX1BVQkxJQ19LRVkgPSAnZ2V0X3B1YmxpY19rZXknLFxuICBTSUdOX0VWRU5UID0gJ3NpZ25fZXZlbnQnLFxuICBOSVAwNF9FTkNSWVBUID0gJ25pcDA0X2VuY3J5cHQnLFxuICBOSVAwNF9ERUNSWVBUID0gJ25pcDA0X2RlY3J5cHQnLFxuICBOSVA0NF9FTkNSWVBUID0gJ25pcDQ0X2VuY3J5cHQnLFxuICBOSVA0NF9ERUNSWVBUID0gJ25pcDQ0X2RlY3J5cHQnLFxuICBHRVRfUkVMQVlTID0gJ2dldF9yZWxheXMnLFxufVxuXG4vKipcbiAqIFBhcnNlZCBidW5rZXI6Ly8gVVJJXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQnVua2VyVVJJIHtcbiAgLyoqIFJlbW90ZSBzaWduZXIncyBwdWJsaWMga2V5IChoZXgpICovXG4gIHJlbW90ZVB1YmtleTogc3RyaW5nO1xuICAvKiogUmVsYXkgVVJMcyBmb3IgY29tbXVuaWNhdGlvbiAqL1xuICByZWxheXM6IHN0cmluZ1tdO1xuICAvKiogT3B0aW9uYWwgc2VjcmV0IGZvciBpbml0aWFsIGNvbm5lY3Rpb24gKi9cbiAgc2VjcmV0Pzogc3RyaW5nO1xufVxuXG4vKipcbiAqIE5JUC00NiBKU09OLVJQQyByZXF1ZXN0IChjbGllbnQgLT4gc2lnbmVyKVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5pcDQ2UmVxdWVzdCB7XG4gIGlkOiBzdHJpbmc7XG4gIG1ldGhvZDogTmlwNDZNZXRob2QgfCBzdHJpbmc7XG4gIHBhcmFtczogc3RyaW5nW107XG59XG5cbi8qKlxuICogTklQLTQ2IEpTT04tUlBDIHJlc3BvbnNlIChzaWduZXIgLT4gY2xpZW50KVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5pcDQ2UmVzcG9uc2Uge1xuICBpZDogc3RyaW5nO1xuICByZXN1bHQ/OiBzdHJpbmc7XG4gIGVycm9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEEgTklQLTQ2IHNlc3Npb24gY29udGFpbmluZyB0aGUgZXBoZW1lcmFsIGtleXBhaXIgYW5kIGNvbnZlcnNhdGlvbiBrZXlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOaXA0NlNlc3Npb24ge1xuICAvKiogQ2xpZW50J3MgZXBoZW1lcmFsIHByaXZhdGUga2V5IChoZXgpICovXG4gIGNsaWVudFNlY3JldEtleTogc3RyaW5nO1xuICAvKiogQ2xpZW50J3MgZXBoZW1lcmFsIHB1YmxpYyBrZXkgKGhleCkgKi9cbiAgY2xpZW50UHVia2V5OiBzdHJpbmc7XG4gIC8qKiBSZW1vdGUgc2lnbmVyJ3MgcHVibGljIGtleSAoaGV4KSAqL1xuICByZW1vdGVQdWJrZXk6IHN0cmluZztcbiAgLyoqIE5JUC00NCBjb252ZXJzYXRpb24ga2V5IChkZXJpdmVkIGZyb20gRUNESCkgKi9cbiAgY29udmVyc2F0aW9uS2V5OiBVaW50OEFycmF5O1xufVxuXG4vKipcbiAqIFB1YmxpYyBzZXNzaW9uIGluZm8gKHNhZmUgdG8gZXhwb3NlOyBleGNsdWRlcyBwcml2YXRlIGtleSBhbmQgY29udmVyc2F0aW9uIGtleSlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOaXA0NlNlc3Npb25JbmZvIHtcbiAgY2xpZW50UHVia2V5OiBzdHJpbmc7XG4gIHJlbW90ZVB1YmtleTogc3RyaW5nO1xufVxuXG4vKipcbiAqIFJlc3VsdCBvZiB2YWxpZGF0aW5nIGEgYnVua2VyOi8vIFVSSVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEJ1bmtlclZhbGlkYXRpb25SZXN1bHQge1xuICBpc1ZhbGlkOiBib29sZWFuO1xuICBlcnJvcj86IHN0cmluZztcbiAgdXJpPzogQnVua2VyVVJJO1xufVxuIiwgIi8qKlxuICogQG1vZHVsZSBjcnlwdG9cbiAqIEBkZXNjcmlwdGlvbiBDcnlwdG9ncmFwaGljIHV0aWxpdGllcyBmb3IgTm9zdHJcbiAqIFxuICogSU1QT1JUQU5UOiBOb3N0ciBQcm90b2NvbCBDcnlwdG9ncmFwaGljIFJlcXVpcmVtZW50c1xuICogV2hpbGUgc2VjcDI1NmsxIGlzIHRoZSB1bmRlcmx5aW5nIGVsbGlwdGljIGN1cnZlIHVzZWQgYnkgTm9zdHIsIHRoZSBwcm90b2NvbCBzcGVjaWZpY2FsbHlcbiAqIHJlcXVpcmVzIHNjaG5vcnIgc2lnbmF0dXJlcyBhcyBkZWZpbmVkIGluIE5JUC0wMS4gVGhpcyBtZWFuczpcbiAqIFxuICogMS4gQWx3YXlzIHVzZSBzY2hub3JyLXNwZWNpZmljIGZ1bmN0aW9uczpcbiAqICAgIC0gc2Nobm9yci5nZXRQdWJsaWNLZXkoKSBmb3IgcHVibGljIGtleSBnZW5lcmF0aW9uXG4gKiAgICAtIHNjaG5vcnIuc2lnbigpIGZvciBzaWduaW5nXG4gKiAgICAtIHNjaG5vcnIudmVyaWZ5KCkgZm9yIHZlcmlmaWNhdGlvblxuICogXG4gKiAyLiBBdm9pZCB1c2luZyBzZWNwMjU2azEgZnVuY3Rpb25zIGRpcmVjdGx5OlxuICogICAgLSBET04nVCB1c2Ugc2VjcDI1NmsxLmdldFB1YmxpY0tleSgpXG4gKiAgICAtIERPTidUIHVzZSBzZWNwMjU2azEuc2lnbigpXG4gKiAgICAtIERPTidUIHVzZSBzZWNwMjU2azEudmVyaWZ5KClcbiAqIFxuICogV2hpbGUgYm90aCBtaWdodCB3b3JrIGluIHNvbWUgY2FzZXMgKGFzIHRoZXkgdXNlIHRoZSBzYW1lIGN1cnZlKSwgdGhlIHNjaG5vcnIgc2lnbmF0dXJlXG4gKiBzY2hlbWUgaGFzIHNwZWNpZmljIHJlcXVpcmVtZW50cyBmb3Iga2V5IGFuZCBzaWduYXR1cmUgZm9ybWF0cyB0aGF0IGFyZW4ndCBndWFyYW50ZWVkXG4gKiB3aGVuIHVzaW5nIHRoZSBsb3dlci1sZXZlbCBzZWNwMjU2azEgZnVuY3Rpb25zIGRpcmVjdGx5LlxuICovXG5cbmltcG9ydCB7IHNjaG5vcnIsIHNlY3AyNTZrMSB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbmltcG9ydCB7IGJ5dGVzVG9IZXgsIGhleFRvQnl0ZXMsIHJhbmRvbUJ5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBzaGEyNTYgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3NoYTIuanMnO1xuaW1wb3J0IHsgS2V5UGFpciwgUHVibGljS2V5RGV0YWlscywgTm9zdHJFdmVudCwgU2lnbmVkTm9zdHJFdmVudCwgUHVibGljS2V5IH0gZnJvbSAnLi90eXBlcy9pbmRleCc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuL3V0aWxzL2xvZ2dlcic7XG5pbXBvcnQgeyBieXRlc1RvQmFzZTY0LCBiYXNlNjRUb0J5dGVzIH0gZnJvbSAnLi9lbmNvZGluZy9iYXNlNjQnO1xuXG5cbi8qKlxuICogQ3VzdG9tIGNyeXB0byBpbnRlcmZhY2UgZm9yIGNyb3NzLXBsYXRmb3JtIGNvbXBhdGliaWxpdHlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDcnlwdG9TdWJ0bGUge1xuICBzdWJ0bGU6IHtcbiAgICBnZW5lcmF0ZUtleShcbiAgICAgIGFsZ29yaXRobTogUnNhSGFzaGVkS2V5R2VuUGFyYW1zIHwgRWNLZXlHZW5QYXJhbXMsXG4gICAgICBleHRyYWN0YWJsZTogYm9vbGVhbixcbiAgICAgIGtleVVzYWdlczogcmVhZG9ubHkgS2V5VXNhZ2VbXVxuICAgICk6IFByb21pc2U8Q3J5cHRvS2V5UGFpcj47XG4gICAgaW1wb3J0S2V5KFxuICAgICAgZm9ybWF0OiAncmF3JyB8ICdwa2NzOCcgfCAnc3BraScsXG4gICAgICBrZXlEYXRhOiBBcnJheUJ1ZmZlcixcbiAgICAgIGFsZ29yaXRobTogUnNhSGFzaGVkSW1wb3J0UGFyYW1zIHwgRWNLZXlJbXBvcnRQYXJhbXMgfCBBZXNLZXlBbGdvcml0aG0sXG4gICAgICBleHRyYWN0YWJsZTogYm9vbGVhbixcbiAgICAgIGtleVVzYWdlczogcmVhZG9ubHkgS2V5VXNhZ2VbXVxuICAgICk6IFByb21pc2U8Q3J5cHRvS2V5PjtcbiAgICBlbmNyeXB0KFxuICAgICAgYWxnb3JpdGhtOiB7IG5hbWU6IHN0cmluZzsgaXY6IFVpbnQ4QXJyYXkgfSxcbiAgICAgIGtleTogQ3J5cHRvS2V5LFxuICAgICAgZGF0YTogQXJyYXlCdWZmZXJcbiAgICApOiBQcm9taXNlPEFycmF5QnVmZmVyPjtcbiAgICBkZWNyeXB0KFxuICAgICAgYWxnb3JpdGhtOiB7IG5hbWU6IHN0cmluZzsgaXY6IFVpbnQ4QXJyYXkgfSxcbiAgICAgIGtleTogQ3J5cHRvS2V5LFxuICAgICAgZGF0YTogQXJyYXlCdWZmZXJcbiAgICApOiBQcm9taXNlPEFycmF5QnVmZmVyPjtcbiAgfTtcbiAgZ2V0UmFuZG9tVmFsdWVzPFQgZXh0ZW5kcyBVaW50OEFycmF5IHwgSW50OEFycmF5IHwgVWludDE2QXJyYXkgfCBJbnQxNkFycmF5IHwgVWludDMyQXJyYXkgfCBJbnQzMkFycmF5PihhcnJheTogVCk6IFQ7XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIFdpbmRvdyB7XG4gICAgY3J5cHRvOiBDcnlwdG9TdWJ0bGU7XG4gIH1cbiAgaW50ZXJmYWNlIEdsb2JhbCB7XG4gICAgY3J5cHRvOiBDcnlwdG9TdWJ0bGU7XG4gIH1cbn1cblxuLy8gR2V0IHRoZSBhcHByb3ByaWF0ZSBjcnlwdG8gaW1wbGVtZW50YXRpb25cbmNvbnN0IGdldENyeXB0byA9IGFzeW5jICgpOiBQcm9taXNlPENyeXB0b1N1YnRsZT4gPT4ge1xuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNyeXB0bykge1xuICAgIHJldHVybiB3aW5kb3cuY3J5cHRvO1xuICB9XG4gIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyAmJiAoZ2xvYmFsIGFzIEdsb2JhbCkuY3J5cHRvKSB7XG4gICAgcmV0dXJuIChnbG9iYWwgYXMgR2xvYmFsKS5jcnlwdG87XG4gIH1cbiAgdHJ5IHtcbiAgICBjb25zdCBjcnlwdG9Nb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ2NyeXB0bycpO1xuICAgIGlmIChjcnlwdG9Nb2R1bGUud2ViY3J5cHRvKSB7XG4gICAgICByZXR1cm4gY3J5cHRvTW9kdWxlLndlYmNyeXB0byBhcyBDcnlwdG9TdWJ0bGU7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICBsb2dnZXIuZGVidWcoJ05vZGUgY3J5cHRvIG5vdCBhdmFpbGFibGUnKTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignTm8gV2ViQ3J5cHRvIGltcGxlbWVudGF0aW9uIGF2YWlsYWJsZScpO1xufTtcblxuLyoqXG4gKiBDcnlwdG8gaW1wbGVtZW50YXRpb24gdGhhdCB3b3JrcyBpbiBib3RoIE5vZGUuanMgYW5kIGJyb3dzZXIgZW52aXJvbm1lbnRzXG4gKi9cbmNsYXNzIEN1c3RvbUNyeXB0byB7XG4gIHByaXZhdGUgY3J5cHRvSW5zdGFuY2U6IENyeXB0b1N1YnRsZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGluaXRQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaW5pdFByb21pc2UgPSB0aGlzLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmNyeXB0b0luc3RhbmNlID0gYXdhaXQgZ2V0Q3J5cHRvKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGVuc3VyZUluaXRpYWxpemVkKCk6IFByb21pc2U8Q3J5cHRvU3VidGxlPiB7XG4gICAgYXdhaXQgdGhpcy5pbml0UHJvbWlzZTtcbiAgICBpZiAoIXRoaXMuY3J5cHRvSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ3J5cHRvIGltcGxlbWVudGF0aW9uIG5vdCBpbml0aWFsaXplZCcpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jcnlwdG9JbnN0YW5jZTtcbiAgfVxuXG4gIGFzeW5jIGdldFN1YnRsZSgpOiBQcm9taXNlPENyeXB0b1N1YnRsZVsnc3VidGxlJ10+IHtcbiAgICBjb25zdCBjcnlwdG8gPSBhd2FpdCB0aGlzLmVuc3VyZUluaXRpYWxpemVkKCk7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGU7XG4gIH1cblxuICBhc3luYyBnZXRSYW5kb21WYWx1ZXM8VCBleHRlbmRzIFVpbnQ4QXJyYXkgfCBJbnQ4QXJyYXkgfCBVaW50MTZBcnJheSB8IEludDE2QXJyYXkgfCBVaW50MzJBcnJheSB8IEludDMyQXJyYXk+KGFycmF5OiBUKTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgY3J5cHRvID0gYXdhaXQgdGhpcy5lbnN1cmVJbml0aWFsaXplZCgpO1xuICAgIHJldHVybiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGFycmF5KTtcbiAgfVxufVxuXG4vLyBDcmVhdGUgYW5kIGV4cG9ydCBkZWZhdWx0IGluc3RhbmNlXG5leHBvcnQgY29uc3QgY3VzdG9tQ3J5cHRvID0gbmV3IEN1c3RvbUNyeXB0bygpO1xuXG4vLyBFeHBvcnQgc2Nobm9yciBmdW5jdGlvbnNcbmV4cG9ydCBjb25zdCBzaWduU2Nobm9yciA9IHNjaG5vcnIuc2lnbjtcbmV4cG9ydCBjb25zdCB2ZXJpZnlTY2hub3JyU2lnbmF0dXJlID0gc2Nobm9yci52ZXJpZnk7XG5cbi8qKlxuICogR2V0cyB0aGUgY29tcHJlc3NlZCBwdWJsaWMga2V5ICgzMyBieXRlcyB3aXRoIHByZWZpeClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbXByZXNzZWRQdWJsaWNLZXkocHJpdmF0ZUtleUJ5dGVzOiBVaW50OEFycmF5KTogVWludDhBcnJheSB7XG4gIHJldHVybiBzZWNwMjU2azEuZ2V0UHVibGljS2V5KHByaXZhdGVLZXlCeXRlcywgdHJ1ZSk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgc2Nobm9yciBwdWJsaWMga2V5ICgzMiBieXRlcyB4LWNvb3JkaW5hdGUpIGFzIHBlciBCSVAzNDBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNjaG5vcnJQdWJsaWNLZXkocHJpdmF0ZUtleUJ5dGVzOiBVaW50OEFycmF5KTogVWludDhBcnJheSB7XG4gIHJldHVybiBzY2hub3JyLmdldFB1YmxpY0tleShwcml2YXRlS2V5Qnl0ZXMpO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIG5ldyBrZXkgcGFpclxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVLZXlQYWlyKCk6IFByb21pc2U8S2V5UGFpcj4ge1xuICBjb25zdCBwcml2YXRlS2V5Qnl0ZXMgPSByYW5kb21CeXRlcygzMik7XG4gIGNvbnN0IHByaXZhdGVLZXkgPSBieXRlc1RvSGV4KHByaXZhdGVLZXlCeXRlcyk7XG4gIHByaXZhdGVLZXlCeXRlcy5maWxsKDApOyAvLyB6ZXJvIHNvdXJjZSBtYXRlcmlhbFxuICBjb25zdCBwdWJsaWNLZXkgPSBhd2FpdCBnZXRQdWJsaWNLZXkocHJpdmF0ZUtleSk7XG5cbiAgcmV0dXJuIHtcbiAgICBwcml2YXRlS2V5LFxuICAgIHB1YmxpY0tleVxuICB9O1xufVxuXG4vKipcbiAqIEdldHMgYSBwdWJsaWMga2V5IGZyb20gYSBwcml2YXRlIGtleVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHVibGljS2V5KHByaXZhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8UHVibGljS2V5RGV0YWlscz4ge1xuICB0cnkge1xuICAgIGNvbnN0IHByaXZhdGVLZXlCeXRlcyA9IGhleFRvQnl0ZXMocHJpdmF0ZUtleSk7XG4gICAgY29uc3QgcHVibGljS2V5Qnl0ZXMgPSBzY2hub3JyLmdldFB1YmxpY0tleShwcml2YXRlS2V5Qnl0ZXMpO1xuICAgIHJldHVybiB7XG4gICAgICBoZXg6IGJ5dGVzVG9IZXgocHVibGljS2V5Qnl0ZXMpLFxuICAgICAgYnl0ZXM6IHB1YmxpY0tleUJ5dGVzXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGdldCBwdWJsaWMga2V5Jyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBrZXkgcGFpclxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmFsaWRhdGVLZXlQYWlyKGtleVBhaXI6IEtleVBhaXIpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBkZXJpdmVkUHViS2V5ID0gYXdhaXQgZ2V0UHVibGljS2V5KGtleVBhaXIucHJpdmF0ZUtleSk7XG4gICAgcmV0dXJuIGRlcml2ZWRQdWJLZXkuaGV4ID09PSBrZXlQYWlyLnB1YmxpY0tleS5oZXg7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2YWxpZGF0ZSBrZXkgcGFpcicpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUV2ZW50KGV2ZW50OiBQYXJ0aWFsPE5vc3RyRXZlbnQ+KTogTm9zdHJFdmVudCB7XG4gIGNvbnN0IHRpbWVzdGFtcCA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xuXG4gIHJldHVybiB7XG4gICAgLi4uZXZlbnQsXG4gICAgY3JlYXRlZF9hdDogZXZlbnQuY3JlYXRlZF9hdCB8fCB0aW1lc3RhbXAsXG4gICAgdGFnczogZXZlbnQudGFncyB8fCBbXSxcbiAgICBjb250ZW50OiBldmVudC5jb250ZW50IHx8ICcnLFxuICAgIGtpbmQ6IGV2ZW50LmtpbmQgfHwgMVxuICB9IGFzIE5vc3RyRXZlbnQ7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGEgcHJpdmF0ZSBrZXkgdG8gaGV4IHN0cmluZyAoYWNjZXB0cyBib3RoIGhleCBzdHJpbmcgYW5kIFVpbnQ4QXJyYXkpXG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZVByaXZhdGVLZXkocHJpdmF0ZUtleTogc3RyaW5nIHwgVWludDhBcnJheSk6IHN0cmluZyB7XG4gIGlmIChwcml2YXRlS2V5IGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgIHJldHVybiBieXRlc1RvSGV4KHByaXZhdGVLZXkpO1xuICB9XG4gIHJldHVybiBwcml2YXRlS2V5O1xufVxuXG4vKipcbiAqIFNpZ25zIGFuIGV2ZW50XG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byBzaWduXG4gKiBAcGFyYW0gcHJpdmF0ZUtleSAtIFByaXZhdGUga2V5IGFzIGhleCBzdHJpbmcgb3IgVWludDhBcnJheVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2lnbkV2ZW50KGV2ZW50OiBOb3N0ckV2ZW50LCBwcml2YXRlS2V5OiBzdHJpbmcgfCBVaW50OEFycmF5KTogUHJvbWlzZTxTaWduZWROb3N0ckV2ZW50PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcHJpdmF0ZUtleUhleCA9IG5vcm1hbGl6ZVByaXZhdGVLZXkocHJpdmF0ZUtleSk7XG5cbiAgICAvLyBTZXJpYWxpemUgZXZlbnQgZm9yIHNpZ25pbmcgKE5JUC0wMSBmb3JtYXQpXG4gICAgY29uc3Qgc2VyaWFsaXplZCA9IEpTT04uc3RyaW5naWZ5KFtcbiAgICAgIDAsXG4gICAgICBldmVudC5wdWJrZXksXG4gICAgICBldmVudC5jcmVhdGVkX2F0LFxuICAgICAgZXZlbnQua2luZCxcbiAgICAgIGV2ZW50LnRhZ3MsXG4gICAgICBldmVudC5jb250ZW50XG4gICAgXSk7XG5cbiAgICAvLyBDYWxjdWxhdGUgZXZlbnQgaGFzaFxuICAgIGNvbnN0IGV2ZW50SGFzaCA9IHNoYTI1NihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc2VyaWFsaXplZCkpO1xuXG4gICAgLy8gQ29udmVydCBwcml2YXRlIGtleSB0byBieXRlcyBhbmQgc2lnblxuICAgIGNvbnN0IHByaXZhdGVLZXlCeXRlcyA9IGhleFRvQnl0ZXMocHJpdmF0ZUtleUhleCk7XG4gICAgY29uc3Qgc2lnbmF0dXJlQnl0ZXMgPSBzY2hub3JyLnNpZ24oZXZlbnRIYXNoLCBwcml2YXRlS2V5Qnl0ZXMpO1xuXG4gICAgLy8gQ3JlYXRlIHNpZ25lZCBldmVudFxuICAgIHJldHVybiB7XG4gICAgICAuLi5ldmVudCxcbiAgICAgIGlkOiBieXRlc1RvSGV4KGV2ZW50SGFzaCksXG4gICAgICBzaWc6IGJ5dGVzVG9IZXgoc2lnbmF0dXJlQnl0ZXMpXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHNpZ24gZXZlbnQnKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIEdldHMgYSBwdWJsaWMga2V5IGhleCBzdHJpbmcgZnJvbSBhIHByaXZhdGUga2V5IChzeW5jaHJvbm91cylcbiAqIEBwYXJhbSBwcml2YXRlS2V5IC0gUHJpdmF0ZSBrZXkgYXMgaGV4IHN0cmluZyBvciBVaW50OEFycmF5XG4gKiBAcmV0dXJucyBIZXgtZW5jb2RlZCBwdWJsaWMga2V5ICgzMi1ieXRlIHgtb25seSBzY2hub3JyIGtleSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFB1YmxpY0tleVN5bmMocHJpdmF0ZUtleTogc3RyaW5nIHwgVWludDhBcnJheSk6IHN0cmluZyB7XG4gIGNvbnN0IHByaXZhdGVLZXlCeXRlcyA9IHByaXZhdGVLZXkgaW5zdGFuY2VvZiBVaW50OEFycmF5XG4gICAgPyBwcml2YXRlS2V5XG4gICAgOiBoZXhUb0J5dGVzKHByaXZhdGVLZXkpO1xuICBjb25zdCBwdWJsaWNLZXlCeXRlcyA9IHNjaG5vcnIuZ2V0UHVibGljS2V5KHByaXZhdGVLZXlCeXRlcyk7XG4gIHJldHVybiBieXRlc1RvSGV4KHB1YmxpY0tleUJ5dGVzKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzLCBoYXNoZXMsIGFuZCBzaWducyBhIE5vc3RyIGV2ZW50IGluIG9uZSBzdGVwXG4gKiBAcGFyYW0gZXZlbnQgLSBQYXJ0aWFsIGV2ZW50IChraW5kLCBjb250ZW50LCB0YWdzIHJlcXVpcmVkOyBwdWJrZXkgZGVyaXZlZCBpZiBtaXNzaW5nKVxuICogQHBhcmFtIHByaXZhdGVLZXkgLSBQcml2YXRlIGtleSBhcyBoZXggc3RyaW5nIG9yIFVpbnQ4QXJyYXlcbiAqIEByZXR1cm5zIEZ1bGx5IHNpZ25lZCBldmVudCB3aXRoIGlkLCBwdWJrZXksIGFuZCBzaWdcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbmFsaXplRXZlbnQoXG4gIGV2ZW50OiBQYXJ0aWFsPE5vc3RyRXZlbnQ+LFxuICBwcml2YXRlS2V5OiBzdHJpbmcgfCBVaW50OEFycmF5XG4pOiBQcm9taXNlPFNpZ25lZE5vc3RyRXZlbnQ+IHtcbiAgY29uc3QgcHVia2V5ID0gZXZlbnQucHVia2V5IHx8IGdldFB1YmxpY0tleVN5bmMocHJpdmF0ZUtleSk7XG4gIGNvbnN0IHRpbWVzdGFtcCA9IGV2ZW50LmNyZWF0ZWRfYXQgfHwgTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG5cbiAgY29uc3QgZnVsbEV2ZW50OiBOb3N0ckV2ZW50ID0ge1xuICAgIGtpbmQ6IGV2ZW50LmtpbmQgfHwgMSxcbiAgICBjcmVhdGVkX2F0OiB0aW1lc3RhbXAsXG4gICAgdGFnczogZXZlbnQudGFncyB8fCBbXSxcbiAgICBjb250ZW50OiBldmVudC5jb250ZW50IHx8ICcnLFxuICAgIHB1YmtleSxcbiAgfTtcblxuICByZXR1cm4gc2lnbkV2ZW50KGZ1bGxFdmVudCwgcHJpdmF0ZUtleSk7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgYW4gZXZlbnQgc2lnbmF0dXJlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2ZXJpZnlTaWduYXR1cmUoZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdHJ5IHtcbiAgICAvLyBTZXJpYWxpemUgZXZlbnQgZm9yIHZlcmlmaWNhdGlvbiAoTklQLTAxIGZvcm1hdClcbiAgICBjb25zdCBzZXJpYWxpemVkID0gSlNPTi5zdHJpbmdpZnkoW1xuICAgICAgMCxcbiAgICAgIGV2ZW50LnB1YmtleSxcbiAgICAgIGV2ZW50LmNyZWF0ZWRfYXQsXG4gICAgICBldmVudC5raW5kLFxuICAgICAgZXZlbnQudGFncyxcbiAgICAgIGV2ZW50LmNvbnRlbnRcbiAgICBdKTtcblxuICAgIC8vIENhbGN1bGF0ZSBldmVudCBoYXNoXG4gICAgY29uc3QgZXZlbnRIYXNoID0gc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZXJpYWxpemVkKSk7XG5cbiAgICAvLyBWZXJpZnkgZXZlbnQgSURcbiAgICBjb25zdCBjYWxjdWxhdGVkSWQgPSBieXRlc1RvSGV4KGV2ZW50SGFzaCk7XG4gICAgaWYgKGNhbGN1bGF0ZWRJZCAhPT0gZXZlbnQuaWQpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignRXZlbnQgSUQgbWlzbWF0Y2gnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBDb252ZXJ0IGhleCBzdHJpbmdzIHRvIGJ5dGVzXG4gICAgY29uc3Qgc2lnbmF0dXJlQnl0ZXMgPSBoZXhUb0J5dGVzKGV2ZW50LnNpZyk7XG4gICAgY29uc3QgcHVia2V5Qnl0ZXMgPSBoZXhUb0J5dGVzKGV2ZW50LnB1YmtleSk7XG5cbiAgICAvLyBWZXJpZnkgc2lnbmF0dXJlXG4gICAgcmV0dXJuIHNjaG5vcnIudmVyaWZ5KHNpZ25hdHVyZUJ5dGVzLCBldmVudEhhc2gsIHB1YmtleUJ5dGVzKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZlcmlmeSBzaWduYXR1cmUnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBFbmNyeXB0cyBhIG1lc3NhZ2UgdXNpbmcgTklQLTA0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0KFxuICBtZXNzYWdlOiBzdHJpbmcsXG4gIHJlY2lwaWVudFB1YktleTogUHVibGljS2V5IHwgc3RyaW5nLFxuICBzZW5kZXJQcml2S2V5OiBzdHJpbmdcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVjaXBpZW50UHViS2V5SGV4ID0gdHlwZW9mIHJlY2lwaWVudFB1YktleSA9PT0gJ3N0cmluZycgPyByZWNpcGllbnRQdWJLZXkgOiByZWNpcGllbnRQdWJLZXkuaGV4O1xuICAgIGNvbnN0IHNoYXJlZFBvaW50ID0gc2VjcDI1NmsxLmdldFNoYXJlZFNlY3JldChoZXhUb0J5dGVzKHNlbmRlclByaXZLZXkpLCBoZXhUb0J5dGVzKHJlY2lwaWVudFB1YktleUhleCkpO1xuICAgIGNvbnN0IHNoYXJlZFggPSBzaGFyZWRQb2ludC5zbGljZSgxLCAzMyk7XG5cbiAgICAvLyBHZW5lcmF0ZSByYW5kb20gSVZcbiAgICBjb25zdCBpdiA9IHJhbmRvbUJ5dGVzKDE2KTtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBjdXN0b21DcnlwdG8uZ2V0U3VidGxlKCkudGhlbigoc3VidGxlKSA9PiBzdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgJ3JhdycsXG4gICAgICBzaGFyZWRYLmJ1ZmZlcixcbiAgICAgIHsgbmFtZTogJ0FFUy1DQkMnLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgZmFsc2UsXG4gICAgICBbJ2VuY3J5cHQnXVxuICAgICkpO1xuXG4gICAgLy8gWmVybyBzaGFyZWQgc2VjcmV0IG1hdGVyaWFsIG5vdyB0aGF0IEFFUyBrZXkgaXMgaW1wb3J0ZWRcbiAgICBzaGFyZWRYLmZpbGwoMCk7XG4gICAgc2hhcmVkUG9pbnQuZmlsbCgwKTtcblxuICAgIC8vIEVuY3J5cHQgdGhlIG1lc3NhZ2VcbiAgICBjb25zdCBkYXRhID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKG1lc3NhZ2UpO1xuICAgIGNvbnN0IGVuY3J5cHRlZCA9IGF3YWl0IGN1c3RvbUNyeXB0by5nZXRTdWJ0bGUoKS50aGVuKChzdWJ0bGUpID0+IHN1YnRsZS5lbmNyeXB0KFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGl2IH0sXG4gICAgICBrZXksXG4gICAgICBkYXRhLmJ1ZmZlclxuICAgICkpO1xuXG4gICAgLy8gTklQLTA0IHN0YW5kYXJkIGZvcm1hdDogYmFzZTY0KGNpcGhlcnRleHQpICsgXCI/aXY9XCIgKyBiYXNlNjQoaXYpXG4gICAgY29uc3QgY2lwaGVydGV4dEJhc2U2NCA9IGJ5dGVzVG9CYXNlNjQobmV3IFVpbnQ4QXJyYXkoZW5jcnlwdGVkKSk7XG4gICAgY29uc3QgaXZCYXNlNjQgPSBieXRlc1RvQmFzZTY0KGl2KTtcblxuICAgIHJldHVybiBjaXBoZXJ0ZXh0QmFzZTY0ICsgJz9pdj0nICsgaXZCYXNlNjQ7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBlbmNyeXB0IG1lc3NhZ2UnKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIERlY3J5cHRzIGEgbWVzc2FnZSB1c2luZyBOSVAtMDRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHQoXG4gIGVuY3J5cHRlZE1lc3NhZ2U6IHN0cmluZyxcbiAgc2VuZGVyUHViS2V5OiBQdWJsaWNLZXkgfCBzdHJpbmcsXG4gIHJlY2lwaWVudFByaXZLZXk6IHN0cmluZ1xuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzZW5kZXJQdWJLZXlIZXggPSB0eXBlb2Ygc2VuZGVyUHViS2V5ID09PSAnc3RyaW5nJyA/IHNlbmRlclB1YktleSA6IHNlbmRlclB1YktleS5oZXg7XG4gICAgY29uc3Qgc2hhcmVkUG9pbnQgPSBzZWNwMjU2azEuZ2V0U2hhcmVkU2VjcmV0KGhleFRvQnl0ZXMocmVjaXBpZW50UHJpdktleSksIGhleFRvQnl0ZXMoc2VuZGVyUHViS2V5SGV4KSk7XG4gICAgY29uc3Qgc2hhcmVkWCA9IHNoYXJlZFBvaW50LnNsaWNlKDEsIDMzKTtcblxuICAgIC8vIFBhcnNlIE5JUC0wNCBzdGFuZGFyZCBmb3JtYXQ6IGJhc2U2NChjaXBoZXJ0ZXh0KSArIFwiP2l2PVwiICsgYmFzZTY0KGl2KVxuICAgIC8vIEFsc28gc3VwcG9ydCBsZWdhY3kgaGV4IGZvcm1hdCAoaXYgKyBjaXBoZXJ0ZXh0IGNvbmNhdGVuYXRlZCkgYXMgZmFsbGJhY2tcbiAgICBsZXQgaXY6IFVpbnQ4QXJyYXk7XG4gICAgbGV0IGNpcGhlcnRleHQ6IFVpbnQ4QXJyYXk7XG5cbiAgICBpZiAoZW5jcnlwdGVkTWVzc2FnZS5pbmNsdWRlcygnP2l2PScpKSB7XG4gICAgICAvLyBOSVAtMDQgc3RhbmRhcmQgZm9ybWF0XG4gICAgICBjb25zdCBbY2lwaGVydGV4dEJhc2U2NCwgaXZCYXNlNjRdID0gZW5jcnlwdGVkTWVzc2FnZS5zcGxpdCgnP2l2PScpO1xuICAgICAgY2lwaGVydGV4dCA9IGJhc2U2NFRvQnl0ZXMoY2lwaGVydGV4dEJhc2U2NCk7XG4gICAgICBpdiA9IGJhc2U2NFRvQnl0ZXMoaXZCYXNlNjQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBMZWdhY3kgaGV4IGZvcm1hdCBmYWxsYmFjazogZmlyc3QgMTYgYnl0ZXMgYXJlIElWLCByZXN0IGlzIGNpcGhlcnRleHRcbiAgICAgIGNvbnN0IGVuY3J5cHRlZCA9IGhleFRvQnl0ZXMoZW5jcnlwdGVkTWVzc2FnZSk7XG4gICAgICBpdiA9IGVuY3J5cHRlZC5zbGljZSgwLCAxNik7XG4gICAgICBjaXBoZXJ0ZXh0ID0gZW5jcnlwdGVkLnNsaWNlKDE2KTtcbiAgICB9XG5cbiAgICBjb25zdCBrZXkgPSBhd2FpdCBjdXN0b21DcnlwdG8uZ2V0U3VidGxlKCkudGhlbigoc3VidGxlKSA9PiBzdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgJ3JhdycsXG4gICAgICBzaGFyZWRYLmJ1ZmZlcixcbiAgICAgIHsgbmFtZTogJ0FFUy1DQkMnLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgZmFsc2UsXG4gICAgICBbJ2RlY3J5cHQnXVxuICAgICkpO1xuXG4gICAgLy8gWmVybyBzaGFyZWQgc2VjcmV0IG1hdGVyaWFsIG5vdyB0aGF0IEFFUyBrZXkgaXMgaW1wb3J0ZWRcbiAgICBzaGFyZWRYLmZpbGwoMCk7XG4gICAgc2hhcmVkUG9pbnQuZmlsbCgwKTtcblxuICAgIGNvbnN0IGRlY3J5cHRlZCA9IGF3YWl0IGN1c3RvbUNyeXB0by5nZXRTdWJ0bGUoKS50aGVuKChzdWJ0bGUpID0+IHN1YnRsZS5kZWNyeXB0KFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGl2IH0sXG4gICAgICBrZXksXG4gICAgICBjaXBoZXJ0ZXh0LmJ1ZmZlciBhcyBBcnJheUJ1ZmZlclxuICAgICkpO1xuXG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShkZWNyeXB0ZWQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gZGVjcnlwdCBtZXNzYWdlJyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cbiIsICIvKipcbiAqIFNFQ0cgc2VjcDI1NmsxLiBTZWUgW3BkZl0oaHR0cHM6Ly93d3cuc2VjZy5vcmcvc2VjMi12Mi5wZGYpLlxuICpcbiAqIEJlbG9uZ3MgdG8gS29ibGl0eiBjdXJ2ZXM6IGl0IGhhcyBlZmZpY2llbnRseS1jb21wdXRhYmxlIEdMViBlbmRvbW9ycGhpc20gXHUwM0M4LFxuICogY2hlY2sgb3V0IHtAbGluayBFbmRvbW9ycGhpc21PcHRzfS4gU2VlbXMgdG8gYmUgcmlnaWQgKG5vdCBiYWNrZG9vcmVkKS5cbiAqIEBtb2R1bGVcbiAqL1xuLyohIG5vYmxlLWN1cnZlcyAtIE1JVCBMaWNlbnNlIChjKSAyMDIyIFBhdWwgTWlsbGVyIChwYXVsbWlsbHIuY29tKSAqL1xuaW1wb3J0IHsgc2hhMjU2IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGEyLmpzJztcbmltcG9ydCB7IHJhbmRvbUJ5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBjcmVhdGVLZXlnZW4sIHR5cGUgQ3VydmVMZW5ndGhzIH0gZnJvbSAnLi9hYnN0cmFjdC9jdXJ2ZS50cyc7XG5pbXBvcnQgeyBjcmVhdGVIYXNoZXIsIHR5cGUgSDJDSGFzaGVyLCBpc29nZW55TWFwIH0gZnJvbSAnLi9hYnN0cmFjdC9oYXNoLXRvLWN1cnZlLnRzJztcbmltcG9ydCB7IEZpZWxkLCBtYXBIYXNoVG9GaWVsZCwgcG93MiB9IGZyb20gJy4vYWJzdHJhY3QvbW9kdWxhci50cyc7XG5pbXBvcnQge1xuICB0eXBlIEVDRFNBLFxuICBlY2RzYSxcbiAgdHlwZSBFbmRvbW9ycGhpc21PcHRzLFxuICBtYXBUb0N1cnZlU2ltcGxlU1dVLFxuICB0eXBlIFdlaWVyc3RyYXNzUG9pbnQgYXMgUG9pbnRUeXBlLFxuICB3ZWllcnN0cmFzcyxcbiAgdHlwZSBXZWllcnN0cmFzc09wdHMsXG4gIHR5cGUgV2VpZXJzdHJhc3NQb2ludENvbnMsXG59IGZyb20gJy4vYWJzdHJhY3Qvd2VpZXJzdHJhc3MudHMnO1xuaW1wb3J0IHsgYWJ5dGVzLCBhc2NpaVRvQnl0ZXMsIGJ5dGVzVG9OdW1iZXJCRSwgY29uY2F0Qnl0ZXMgfSBmcm9tICcuL3V0aWxzLnRzJztcblxuLy8gU2VlbXMgbGlrZSBnZW5lcmF0b3Igd2FzIHByb2R1Y2VkIGZyb20gc29tZSBzZWVkOlxuLy8gYFBvaW50azEuQkFTRS5tdWx0aXBseShQb2ludGsxLkZuLmludigybiwgTikpLnRvQWZmaW5lKCkueGBcbi8vIC8vIGdpdmVzIHNob3J0IHggMHgzYjc4Y2U1NjNmODlhMGVkOTQxNGY1YWEyOGFkMGQ5NmQ2Nzk1ZjljNjNuXG5jb25zdCBzZWNwMjU2azFfQ1VSVkU6IFdlaWVyc3RyYXNzT3B0czxiaWdpbnQ+ID0ge1xuICBwOiBCaWdJbnQoJzB4ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmVmZmZmZmMyZicpLFxuICBuOiBCaWdJbnQoJzB4ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmViYWFlZGNlNmFmNDhhMDNiYmZkMjVlOGNkMDM2NDE0MScpLFxuICBoOiBCaWdJbnQoMSksXG4gIGE6IEJpZ0ludCgwKSxcbiAgYjogQmlnSW50KDcpLFxuICBHeDogQmlnSW50KCcweDc5YmU2NjdlZjlkY2JiYWM1NWEwNjI5NWNlODcwYjA3MDI5YmZjZGIyZGNlMjhkOTU5ZjI4MTViMTZmODE3OTgnKSxcbiAgR3k6IEJpZ0ludCgnMHg0ODNhZGE3NzI2YTNjNDY1NWRhNGZiZmMwZTExMDhhOGZkMTdiNDQ4YTY4NTU0MTk5YzQ3ZDA4ZmZiMTBkNGI4JyksXG59O1xuXG5jb25zdCBzZWNwMjU2azFfRU5ETzogRW5kb21vcnBoaXNtT3B0cyA9IHtcbiAgYmV0YTogQmlnSW50KCcweDdhZTk2YTJiNjU3YzA3MTA2ZTY0NDc5ZWFjMzQzNGU5OWNmMDQ5NzUxMmY1ODk5NWMxMzk2YzI4NzE5NTAxZWUnKSxcbiAgYmFzaXNlczogW1xuICAgIFtCaWdJbnQoJzB4MzA4NmQyMjFhN2Q0NmJjZGU4NmM5MGU0OTI4NGViMTUnKSwgLUJpZ0ludCgnMHhlNDQzN2VkNjAxMGU4ODI4NmY1NDdmYTkwYWJmZTRjMycpXSxcbiAgICBbQmlnSW50KCcweDExNGNhNTBmN2E4ZTJmM2Y2NTdjMTEwOGQ5ZDQ0Y2ZkOCcpLCBCaWdJbnQoJzB4MzA4NmQyMjFhN2Q0NmJjZGU4NmM5MGU0OTI4NGViMTUnKV0sXG4gIF0sXG59O1xuXG5jb25zdCBfMG4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDApO1xuY29uc3QgXzJuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgyKTtcblxuLyoqXG4gKiBcdTIyMUFuID0gbl4oKHArMSkvNCkgZm9yIGZpZWxkcyBwID0gMyBtb2QgNC4gV2UgdW53cmFwIHRoZSBsb29wIGFuZCBtdWx0aXBseSBiaXQtYnktYml0LlxuICogKFArMW4vNG4pLnRvU3RyaW5nKDIpIHdvdWxkIHByb2R1Y2UgYml0cyBbMjIzeCAxLCAwLCAyMnggMSwgNHggMCwgMTEsIDAwXVxuICovXG5mdW5jdGlvbiBzcXJ0TW9kKHk6IGJpZ2ludCk6IGJpZ2ludCB7XG4gIGNvbnN0IFAgPSBzZWNwMjU2azFfQ1VSVkUucDtcbiAgLy8gcHJldHRpZXItaWdub3JlXG4gIGNvbnN0IF8zbiA9IEJpZ0ludCgzKSwgXzZuID0gQmlnSW50KDYpLCBfMTFuID0gQmlnSW50KDExKSwgXzIybiA9IEJpZ0ludCgyMik7XG4gIC8vIHByZXR0aWVyLWlnbm9yZVxuICBjb25zdCBfMjNuID0gQmlnSW50KDIzKSwgXzQ0biA9IEJpZ0ludCg0NCksIF84OG4gPSBCaWdJbnQoODgpO1xuICBjb25zdCBiMiA9ICh5ICogeSAqIHkpICUgUDsgLy8geF4zLCAxMVxuICBjb25zdCBiMyA9IChiMiAqIGIyICogeSkgJSBQOyAvLyB4XjdcbiAgY29uc3QgYjYgPSAocG93MihiMywgXzNuLCBQKSAqIGIzKSAlIFA7XG4gIGNvbnN0IGI5ID0gKHBvdzIoYjYsIF8zbiwgUCkgKiBiMykgJSBQO1xuICBjb25zdCBiMTEgPSAocG93MihiOSwgXzJuLCBQKSAqIGIyKSAlIFA7XG4gIGNvbnN0IGIyMiA9IChwb3cyKGIxMSwgXzExbiwgUCkgKiBiMTEpICUgUDtcbiAgY29uc3QgYjQ0ID0gKHBvdzIoYjIyLCBfMjJuLCBQKSAqIGIyMikgJSBQO1xuICBjb25zdCBiODggPSAocG93MihiNDQsIF80NG4sIFApICogYjQ0KSAlIFA7XG4gIGNvbnN0IGIxNzYgPSAocG93MihiODgsIF84OG4sIFApICogYjg4KSAlIFA7XG4gIGNvbnN0IGIyMjAgPSAocG93MihiMTc2LCBfNDRuLCBQKSAqIGI0NCkgJSBQO1xuICBjb25zdCBiMjIzID0gKHBvdzIoYjIyMCwgXzNuLCBQKSAqIGIzKSAlIFA7XG4gIGNvbnN0IHQxID0gKHBvdzIoYjIyMywgXzIzbiwgUCkgKiBiMjIpICUgUDtcbiAgY29uc3QgdDIgPSAocG93Mih0MSwgXzZuLCBQKSAqIGIyKSAlIFA7XG4gIGNvbnN0IHJvb3QgPSBwb3cyKHQyLCBfMm4sIFApO1xuICBpZiAoIUZwazEuZXFsKEZwazEuc3FyKHJvb3QpLCB5KSkgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBzcXVhcmUgcm9vdCcpO1xuICByZXR1cm4gcm9vdDtcbn1cblxuY29uc3QgRnBrMSA9IEZpZWxkKHNlY3AyNTZrMV9DVVJWRS5wLCB7IHNxcnQ6IHNxcnRNb2QgfSk7XG5jb25zdCBQb2ludGsxID0gLyogQF9fUFVSRV9fICovIHdlaWVyc3RyYXNzKHNlY3AyNTZrMV9DVVJWRSwge1xuICBGcDogRnBrMSxcbiAgZW5kbzogc2VjcDI1NmsxX0VORE8sXG59KTtcblxuLyoqXG4gKiBzZWNwMjU2azEgY3VydmU6IEVDRFNBIGFuZCBFQ0RIIG1ldGhvZHMuXG4gKlxuICogVXNlcyBzaGEyNTYgdG8gaGFzaCBtZXNzYWdlcy4gVG8gdXNlIGEgZGlmZmVyZW50IGhhc2gsXG4gKiBwYXNzIGB7IHByZWhhc2g6IGZhbHNlIH1gIHRvIHNpZ24gLyB2ZXJpZnkuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYGpzXG4gKiBpbXBvcnQgeyBzZWNwMjU2azEgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG4gKiBjb25zdCB7IHNlY3JldEtleSwgcHVibGljS2V5IH0gPSBzZWNwMjU2azEua2V5Z2VuKCk7XG4gKiAvLyBjb25zdCBwdWJsaWNLZXkgPSBzZWNwMjU2azEuZ2V0UHVibGljS2V5KHNlY3JldEtleSk7XG4gKiBjb25zdCBtc2cgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoJ2hlbGxvIG5vYmxlJyk7XG4gKiBjb25zdCBzaWcgPSBzZWNwMjU2azEuc2lnbihtc2csIHNlY3JldEtleSk7XG4gKiBjb25zdCBpc1ZhbGlkID0gc2VjcDI1NmsxLnZlcmlmeShzaWcsIG1zZywgcHVibGljS2V5KTtcbiAqIC8vIGNvbnN0IHNpZ0tlY2NhayA9IHNlY3AyNTZrMS5zaWduKGtlY2NhazI1Nihtc2cpLCBzZWNyZXRLZXksIHsgcHJlaGFzaDogZmFsc2UgfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IHNlY3AyNTZrMTogRUNEU0EgPSAvKiBAX19QVVJFX18gKi8gZWNkc2EoUG9pbnRrMSwgc2hhMjU2KTtcblxuLy8gU2Nobm9yciBzaWduYXR1cmVzIGFyZSBzdXBlcmlvciB0byBFQ0RTQSBmcm9tIGFib3ZlLiBCZWxvdyBpcyBTY2hub3JyLXNwZWNpZmljIEJJUDAzNDAgY29kZS5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iaXRjb2luL2JpcHMvYmxvYi9tYXN0ZXIvYmlwLTAzNDAubWVkaWF3aWtpXG4vKiogQW4gb2JqZWN0IG1hcHBpbmcgdGFncyB0byB0aGVpciB0YWdnZWQgaGFzaCBwcmVmaXggb2YgW1NIQTI1Nih0YWcpIHwgU0hBMjU2KHRhZyldICovXG5jb25zdCBUQUdHRURfSEFTSF9QUkVGSVhFUzogeyBbdGFnOiBzdHJpbmddOiBVaW50OEFycmF5IH0gPSB7fTtcbmZ1bmN0aW9uIHRhZ2dlZEhhc2godGFnOiBzdHJpbmcsIC4uLm1lc3NhZ2VzOiBVaW50OEFycmF5W10pOiBVaW50OEFycmF5IHtcbiAgbGV0IHRhZ1AgPSBUQUdHRURfSEFTSF9QUkVGSVhFU1t0YWddO1xuICBpZiAodGFnUCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgdGFnSCA9IHNoYTI1Nihhc2NpaVRvQnl0ZXModGFnKSk7XG4gICAgdGFnUCA9IGNvbmNhdEJ5dGVzKHRhZ0gsIHRhZ0gpO1xuICAgIFRBR0dFRF9IQVNIX1BSRUZJWEVTW3RhZ10gPSB0YWdQO1xuICB9XG4gIHJldHVybiBzaGEyNTYoY29uY2F0Qnl0ZXModGFnUCwgLi4ubWVzc2FnZXMpKTtcbn1cblxuLy8gRUNEU0EgY29tcGFjdCBwb2ludHMgYXJlIDMzLWJ5dGUuIFNjaG5vcnIgaXMgMzI6IHdlIHN0cmlwIGZpcnN0IGJ5dGUgMHgwMiBvciAweDAzXG5jb25zdCBwb2ludFRvQnl0ZXMgPSAocG9pbnQ6IFBvaW50VHlwZTxiaWdpbnQ+KSA9PiBwb2ludC50b0J5dGVzKHRydWUpLnNsaWNlKDEpO1xuY29uc3QgaGFzRXZlbiA9ICh5OiBiaWdpbnQpID0+IHkgJSBfMm4gPT09IF8wbjtcblxuLy8gQ2FsY3VsYXRlIHBvaW50LCBzY2FsYXIgYW5kIGJ5dGVzXG5mdW5jdGlvbiBzY2hub3JyR2V0RXh0UHViS2V5KHByaXY6IFVpbnQ4QXJyYXkpIHtcbiAgY29uc3QgeyBGbiwgQkFTRSB9ID0gUG9pbnRrMTtcbiAgY29uc3QgZF8gPSBGbi5mcm9tQnl0ZXMocHJpdik7XG4gIGNvbnN0IHAgPSBCQVNFLm11bHRpcGx5KGRfKTsgLy8gUCA9IGQnXHUyMkM1RzsgMCA8IGQnIDwgbiBjaGVjayBpcyBkb25lIGluc2lkZVxuICBjb25zdCBzY2FsYXIgPSBoYXNFdmVuKHAueSkgPyBkXyA6IEZuLm5lZyhkXyk7XG4gIHJldHVybiB7IHNjYWxhciwgYnl0ZXM6IHBvaW50VG9CeXRlcyhwKSB9O1xufVxuLyoqXG4gKiBsaWZ0X3ggZnJvbSBCSVAzNDAuIENvbnZlcnQgMzItYnl0ZSB4IGNvb3JkaW5hdGUgdG8gZWxsaXB0aWMgY3VydmUgcG9pbnQuXG4gKiBAcmV0dXJucyB2YWxpZCBwb2ludCBjaGVja2VkIGZvciBiZWluZyBvbi1jdXJ2ZVxuICovXG5mdW5jdGlvbiBsaWZ0X3goeDogYmlnaW50KTogUG9pbnRUeXBlPGJpZ2ludD4ge1xuICBjb25zdCBGcCA9IEZwazE7XG4gIGlmICghRnAuaXNWYWxpZE5vdDAoeCkpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCB4OiBGYWlsIGlmIHggXHUyMjY1IHAnKTtcbiAgY29uc3QgeHggPSBGcC5jcmVhdGUoeCAqIHgpO1xuICBjb25zdCBjID0gRnAuY3JlYXRlKHh4ICogeCArIEJpZ0ludCg3KSk7IC8vIExldCBjID0geFx1MDBCMyArIDcgbW9kIHAuXG4gIGxldCB5ID0gRnAuc3FydChjKTsgLy8gTGV0IHkgPSBjXihwKzEpLzQgbW9kIHAuIFNhbWUgYXMgc3FydCgpLlxuICAvLyBSZXR1cm4gdGhlIHVuaXF1ZSBwb2ludCBQIHN1Y2ggdGhhdCB4KFApID0geCBhbmRcbiAgLy8geShQKSA9IHkgaWYgeSBtb2QgMiA9IDAgb3IgeShQKSA9IHAteSBvdGhlcndpc2UuXG4gIGlmICghaGFzRXZlbih5KSkgeSA9IEZwLm5lZyh5KTtcbiAgY29uc3QgcCA9IFBvaW50azEuZnJvbUFmZmluZSh7IHgsIHkgfSk7XG4gIHAuYXNzZXJ0VmFsaWRpdHkoKTtcbiAgcmV0dXJuIHA7XG59XG5jb25zdCBudW0gPSBieXRlc1RvTnVtYmVyQkU7XG4vKipcbiAqIENyZWF0ZSB0YWdnZWQgaGFzaCwgY29udmVydCBpdCB0byBiaWdpbnQsIHJlZHVjZSBtb2R1bG8tbi5cbiAqL1xuZnVuY3Rpb24gY2hhbGxlbmdlKC4uLmFyZ3M6IFVpbnQ4QXJyYXlbXSk6IGJpZ2ludCB7XG4gIHJldHVybiBQb2ludGsxLkZuLmNyZWF0ZShudW0odGFnZ2VkSGFzaCgnQklQMDM0MC9jaGFsbGVuZ2UnLCAuLi5hcmdzKSkpO1xufVxuXG4vKipcbiAqIFNjaG5vcnIgcHVibGljIGtleSBpcyBqdXN0IGB4YCBjb29yZGluYXRlIG9mIFBvaW50IGFzIHBlciBCSVAzNDAuXG4gKi9cbmZ1bmN0aW9uIHNjaG5vcnJHZXRQdWJsaWNLZXkoc2VjcmV0S2V5OiBVaW50OEFycmF5KTogVWludDhBcnJheSB7XG4gIHJldHVybiBzY2hub3JyR2V0RXh0UHViS2V5KHNlY3JldEtleSkuYnl0ZXM7IC8vIGQnPWludChzaykuIEZhaWwgaWYgZCc9MCBvciBkJ1x1MjI2NW4uIFJldCBieXRlcyhkJ1x1MjJDNUcpXG59XG5cbi8qKlxuICogQ3JlYXRlcyBTY2hub3JyIHNpZ25hdHVyZSBhcyBwZXIgQklQMzQwLiBWZXJpZmllcyBpdHNlbGYgYmVmb3JlIHJldHVybmluZyBhbnl0aGluZy5cbiAqIGF1eFJhbmQgaXMgb3B0aW9uYWwgYW5kIGlzIG5vdCB0aGUgc29sZSBzb3VyY2Ugb2YgayBnZW5lcmF0aW9uOiBiYWQgQ1NQUk5HIHdvbid0IGJlIGRhbmdlcm91cy5cbiAqL1xuZnVuY3Rpb24gc2Nobm9yclNpZ24oXG4gIG1lc3NhZ2U6IFVpbnQ4QXJyYXksXG4gIHNlY3JldEtleTogVWludDhBcnJheSxcbiAgYXV4UmFuZDogVWludDhBcnJheSA9IHJhbmRvbUJ5dGVzKDMyKVxuKTogVWludDhBcnJheSB7XG4gIGNvbnN0IHsgRm4gfSA9IFBvaW50azE7XG4gIGNvbnN0IG0gPSBhYnl0ZXMobWVzc2FnZSwgdW5kZWZpbmVkLCAnbWVzc2FnZScpO1xuICBjb25zdCB7IGJ5dGVzOiBweCwgc2NhbGFyOiBkIH0gPSBzY2hub3JyR2V0RXh0UHViS2V5KHNlY3JldEtleSk7IC8vIGNoZWNrcyBmb3IgaXNXaXRoaW5DdXJ2ZU9yZGVyXG4gIGNvbnN0IGEgPSBhYnl0ZXMoYXV4UmFuZCwgMzIsICdhdXhSYW5kJyk7IC8vIEF1eGlsaWFyeSByYW5kb20gZGF0YSBhOiBhIDMyLWJ5dGUgYXJyYXlcbiAgY29uc3QgdCA9IEZuLnRvQnl0ZXMoZCBeIG51bSh0YWdnZWRIYXNoKCdCSVAwMzQwL2F1eCcsIGEpKSk7IC8vIExldCB0IGJlIHRoZSBieXRlLXdpc2UgeG9yIG9mIGJ5dGVzKGQpIGFuZCBoYXNoL2F1eChhKVxuICBjb25zdCByYW5kID0gdGFnZ2VkSGFzaCgnQklQMDM0MC9ub25jZScsIHQsIHB4LCBtKTsgLy8gTGV0IHJhbmQgPSBoYXNoL25vbmNlKHQgfHwgYnl0ZXMoUCkgfHwgbSlcbiAgLy8gTGV0IGsnID0gaW50KHJhbmQpIG1vZCBuLiBGYWlsIGlmIGsnID0gMC4gTGV0IFIgPSBrJ1x1MjJDNUdcbiAgY29uc3QgeyBieXRlczogcngsIHNjYWxhcjogayB9ID0gc2Nobm9yckdldEV4dFB1YktleShyYW5kKTtcbiAgY29uc3QgZSA9IGNoYWxsZW5nZShyeCwgcHgsIG0pOyAvLyBMZXQgZSA9IGludChoYXNoL2NoYWxsZW5nZShieXRlcyhSKSB8fCBieXRlcyhQKSB8fCBtKSkgbW9kIG4uXG4gIGNvbnN0IHNpZyA9IG5ldyBVaW50OEFycmF5KDY0KTsgLy8gTGV0IHNpZyA9IGJ5dGVzKFIpIHx8IGJ5dGVzKChrICsgZWQpIG1vZCBuKS5cbiAgc2lnLnNldChyeCwgMCk7XG4gIHNpZy5zZXQoRm4udG9CeXRlcyhGbi5jcmVhdGUoayArIGUgKiBkKSksIDMyKTtcbiAgLy8gSWYgVmVyaWZ5KGJ5dGVzKFApLCBtLCBzaWcpIChzZWUgYmVsb3cpIHJldHVybnMgZmFpbHVyZSwgYWJvcnRcbiAgaWYgKCFzY2hub3JyVmVyaWZ5KHNpZywgbSwgcHgpKSB0aHJvdyBuZXcgRXJyb3IoJ3NpZ246IEludmFsaWQgc2lnbmF0dXJlIHByb2R1Y2VkJyk7XG4gIHJldHVybiBzaWc7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgU2Nobm9yciBzaWduYXR1cmUuXG4gKiBXaWxsIHN3YWxsb3cgZXJyb3JzICYgcmV0dXJuIGZhbHNlIGV4Y2VwdCBmb3IgaW5pdGlhbCB0eXBlIHZhbGlkYXRpb24gb2YgYXJndW1lbnRzLlxuICovXG5mdW5jdGlvbiBzY2hub3JyVmVyaWZ5KHNpZ25hdHVyZTogVWludDhBcnJheSwgbWVzc2FnZTogVWludDhBcnJheSwgcHVibGljS2V5OiBVaW50OEFycmF5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHsgRnAsIEZuLCBCQVNFIH0gPSBQb2ludGsxO1xuICBjb25zdCBzaWcgPSBhYnl0ZXMoc2lnbmF0dXJlLCA2NCwgJ3NpZ25hdHVyZScpO1xuICBjb25zdCBtID0gYWJ5dGVzKG1lc3NhZ2UsIHVuZGVmaW5lZCwgJ21lc3NhZ2UnKTtcbiAgY29uc3QgcHViID0gYWJ5dGVzKHB1YmxpY0tleSwgMzIsICdwdWJsaWNLZXknKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBQID0gbGlmdF94KG51bShwdWIpKTsgLy8gUCA9IGxpZnRfeChpbnQocGspKTsgZmFpbCBpZiB0aGF0IGZhaWxzXG4gICAgY29uc3QgciA9IG51bShzaWcuc3ViYXJyYXkoMCwgMzIpKTsgLy8gTGV0IHIgPSBpbnQoc2lnWzA6MzJdKTsgZmFpbCBpZiByIFx1MjI2NSBwLlxuICAgIGlmICghRnAuaXNWYWxpZE5vdDAocikpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBzID0gbnVtKHNpZy5zdWJhcnJheSgzMiwgNjQpKTsgLy8gTGV0IHMgPSBpbnQoc2lnWzMyOjY0XSk7IGZhaWwgaWYgcyBcdTIyNjUgbi5cbiAgICBpZiAoIUZuLmlzVmFsaWROb3QwKHMpKSByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBlID0gY2hhbGxlbmdlKEZuLnRvQnl0ZXMociksIHBvaW50VG9CeXRlcyhQKSwgbSk7IC8vIGludChjaGFsbGVuZ2UoYnl0ZXMocil8fGJ5dGVzKFApfHxtKSklblxuICAgIC8vIFIgPSBzXHUyMkM1RyAtIGVcdTIyQzVQLCB3aGVyZSAtZVAgPT0gKG4tZSlQXG4gICAgY29uc3QgUiA9IEJBU0UubXVsdGlwbHlVbnNhZmUocykuYWRkKFAubXVsdGlwbHlVbnNhZmUoRm4ubmVnKGUpKSk7XG4gICAgY29uc3QgeyB4LCB5IH0gPSBSLnRvQWZmaW5lKCk7XG4gICAgLy8gRmFpbCBpZiBpc19pbmZpbml0ZShSKSAvIG5vdCBoYXNfZXZlbl95KFIpIC8geChSKSBcdTIyNjAgci5cbiAgICBpZiAoUi5pczAoKSB8fCAhaGFzRXZlbih5KSB8fCB4ICE9PSByKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFNlY3BTY2hub3JyID0ge1xuICBrZXlnZW46IChzZWVkPzogVWludDhBcnJheSkgPT4geyBzZWNyZXRLZXk6IFVpbnQ4QXJyYXk7IHB1YmxpY0tleTogVWludDhBcnJheSB9O1xuICBnZXRQdWJsaWNLZXk6IHR5cGVvZiBzY2hub3JyR2V0UHVibGljS2V5O1xuICBzaWduOiB0eXBlb2Ygc2Nobm9yclNpZ247XG4gIHZlcmlmeTogdHlwZW9mIHNjaG5vcnJWZXJpZnk7XG4gIFBvaW50OiBXZWllcnN0cmFzc1BvaW50Q29uczxiaWdpbnQ+O1xuICB1dGlsczoge1xuICAgIHJhbmRvbVNlY3JldEtleTogKHNlZWQ/OiBVaW50OEFycmF5KSA9PiBVaW50OEFycmF5O1xuICAgIHBvaW50VG9CeXRlczogKHBvaW50OiBQb2ludFR5cGU8YmlnaW50PikgPT4gVWludDhBcnJheTtcbiAgICBsaWZ0X3g6IHR5cGVvZiBsaWZ0X3g7XG4gICAgdGFnZ2VkSGFzaDogdHlwZW9mIHRhZ2dlZEhhc2g7XG4gIH07XG4gIGxlbmd0aHM6IEN1cnZlTGVuZ3Rocztcbn07XG4vKipcbiAqIFNjaG5vcnIgc2lnbmF0dXJlcyBvdmVyIHNlY3AyNTZrMS5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9iaXRjb2luL2JpcHMvYmxvYi9tYXN0ZXIvYmlwLTAzNDAubWVkaWF3aWtpXG4gKiBAZXhhbXBsZVxuICogYGBganNcbiAqIGltcG9ydCB7IHNjaG5vcnIgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG4gKiBjb25zdCB7IHNlY3JldEtleSwgcHVibGljS2V5IH0gPSBzY2hub3JyLmtleWdlbigpO1xuICogLy8gY29uc3QgcHVibGljS2V5ID0gc2Nobm9yci5nZXRQdWJsaWNLZXkoc2VjcmV0S2V5KTtcbiAqIGNvbnN0IG1zZyA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZSgnaGVsbG8nKTtcbiAqIGNvbnN0IHNpZyA9IHNjaG5vcnIuc2lnbihtc2csIHNlY3JldEtleSk7XG4gKiBjb25zdCBpc1ZhbGlkID0gc2Nobm9yci52ZXJpZnkoc2lnLCBtc2csIHB1YmxpY0tleSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IHNjaG5vcnI6IFNlY3BTY2hub3JyID0gLyogQF9fUFVSRV9fICovICgoKSA9PiB7XG4gIGNvbnN0IHNpemUgPSAzMjtcbiAgY29uc3Qgc2VlZExlbmd0aCA9IDQ4O1xuICBjb25zdCByYW5kb21TZWNyZXRLZXkgPSAoc2VlZCA9IHJhbmRvbUJ5dGVzKHNlZWRMZW5ndGgpKTogVWludDhBcnJheSA9PiB7XG4gICAgcmV0dXJuIG1hcEhhc2hUb0ZpZWxkKHNlZWQsIHNlY3AyNTZrMV9DVVJWRS5uKTtcbiAgfTtcbiAgcmV0dXJuIHtcbiAgICBrZXlnZW46IGNyZWF0ZUtleWdlbihyYW5kb21TZWNyZXRLZXksIHNjaG5vcnJHZXRQdWJsaWNLZXkpLFxuICAgIGdldFB1YmxpY0tleTogc2Nobm9yckdldFB1YmxpY0tleSxcbiAgICBzaWduOiBzY2hub3JyU2lnbixcbiAgICB2ZXJpZnk6IHNjaG5vcnJWZXJpZnksXG4gICAgUG9pbnQ6IFBvaW50azEsXG4gICAgdXRpbHM6IHtcbiAgICAgIHJhbmRvbVNlY3JldEtleSxcbiAgICAgIHRhZ2dlZEhhc2gsXG4gICAgICBsaWZ0X3gsXG4gICAgICBwb2ludFRvQnl0ZXMsXG4gICAgfSxcbiAgICBsZW5ndGhzOiB7XG4gICAgICBzZWNyZXRLZXk6IHNpemUsXG4gICAgICBwdWJsaWNLZXk6IHNpemUsXG4gICAgICBwdWJsaWNLZXlIYXNQcmVmaXg6IGZhbHNlLFxuICAgICAgc2lnbmF0dXJlOiBzaXplICogMixcbiAgICAgIHNlZWQ6IHNlZWRMZW5ndGgsXG4gICAgfSxcbiAgfTtcbn0pKCk7XG5cbmNvbnN0IGlzb01hcCA9IC8qIEBfX1BVUkVfXyAqLyAoKCkgPT5cbiAgaXNvZ2VueU1hcChcbiAgICBGcGsxLFxuICAgIFtcbiAgICAgIC8vIHhOdW1cbiAgICAgIFtcbiAgICAgICAgJzB4OGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGRhYWFhYThjNycsXG4gICAgICAgICcweDdkM2Q0YzgwYmMzMjFkNWI5ZjMxNWNlYTdmZDQ0YzVkNTk1ZDJmYzBiZjYzYjkyZGZmZjEwNDRmMTdjNjU4MScsXG4gICAgICAgICcweDUzNGMzMjhkMjNmMjM0ZTZlMmE0MTNkZWNhMjVjYWVjZTQ1MDYxNDQwMzdjNDAzMTRlY2JkMGI1M2Q5ZGQyNjInLFxuICAgICAgICAnMHg4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZGFhYWFhODhjJyxcbiAgICAgIF0sXG4gICAgICAvLyB4RGVuXG4gICAgICBbXG4gICAgICAgICcweGQzNTc3MTE5M2Q5NDkxOGE5Y2EzNGNjYmI3YjY0MGRkODZjZDQwOTU0MmY4NDg3ZDlmZTZiNzQ1NzgxZWI0OWInLFxuICAgICAgICAnMHhlZGFkYzZmNjQzODNkYzFkZjdjNGIyZDUxYjU0MjI1NDA2ZDM2YjY0MWY1ZTQxYmJjNTJhNTY2MTJhOGM2ZDE0JyxcbiAgICAgICAgJzB4MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMScsIC8vIExBU1QgMVxuICAgICAgXSxcbiAgICAgIC8vIHlOdW1cbiAgICAgIFtcbiAgICAgICAgJzB4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGI4ZTM4ZTIzYycsXG4gICAgICAgICcweGM3NWUwYzMyZDVjYjdjMGZhOWQwYTU0YjEyYTBhNmQ1NjQ3YWIwNDZkNjg2ZGE2ZmRmZmM5MGZjMjAxZDcxYTMnLFxuICAgICAgICAnMHgyOWE2MTk0NjkxZjkxYTczNzE1MjA5ZWY2NTEyZTU3NjcyMjgzMGEyMDFiZTIwMThhNzY1ZTg1YTllY2VlOTMxJyxcbiAgICAgICAgJzB4MmY2ODRiZGExMmY2ODRiZGExMmY2ODRiZGExMmY2ODRiZGExMmY2ODRiZGExMmY2ODRiZGExMmYzOGUzOGQ4NCcsXG4gICAgICBdLFxuICAgICAgLy8geURlblxuICAgICAgW1xuICAgICAgICAnMHhmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZWZmZmZmOTNiJyxcbiAgICAgICAgJzB4N2EwNjUzNGJiOGJkYjQ5ZmQ1ZTllNjYzMjcyMmMyOTg5NDY3YzFiZmM4ZThkOTc4ZGZiNDI1ZDI2ODVjMjU3MycsXG4gICAgICAgICcweDY0ODRhYTcxNjU0NWNhMmNmM2E3MGMzZmE4ZmUzMzdlMGEzZDIxMTYyZjBkNjI5OWE3YmY4MTkyYmZkMmE3NmYnLFxuICAgICAgICAnMHgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxJywgLy8gTEFTVCAxXG4gICAgICBdLFxuICAgIF0ubWFwKChpKSA9PiBpLm1hcCgoaikgPT4gQmlnSW50KGopKSkgYXMgW2JpZ2ludFtdLCBiaWdpbnRbXSwgYmlnaW50W10sIGJpZ2ludFtdXVxuICApKSgpO1xuY29uc3QgbWFwU1dVID0gLyogQF9fUFVSRV9fICovICgoKSA9PlxuICBtYXBUb0N1cnZlU2ltcGxlU1dVKEZwazEsIHtcbiAgICBBOiBCaWdJbnQoJzB4M2Y4NzMxYWJkZDY2MWFkY2EwOGE1NTU4ZjBmNWQyNzJlOTUzZDM2M2NiNmYwZTVkNDA1NDQ3YzAxYTQ0NDUzMycpLFxuICAgIEI6IEJpZ0ludCgnMTc3MScpLFxuICAgIFo6IEZwazEuY3JlYXRlKEJpZ0ludCgnLTExJykpLFxuICB9KSkoKTtcblxuLyoqIEhhc2hpbmcgLyBlbmNvZGluZyB0byBzZWNwMjU2azEgcG9pbnRzIC8gZmllbGQuIFJGQyA5MzgwIG1ldGhvZHMuICovXG5leHBvcnQgY29uc3Qgc2VjcDI1NmsxX2hhc2hlcjogSDJDSGFzaGVyPFdlaWVyc3RyYXNzUG9pbnRDb25zPGJpZ2ludD4+ID0gLyogQF9fUFVSRV9fICovICgoKSA9PlxuICBjcmVhdGVIYXNoZXIoXG4gICAgUG9pbnRrMSxcbiAgICAoc2NhbGFyczogYmlnaW50W10pID0+IHtcbiAgICAgIGNvbnN0IHsgeCwgeSB9ID0gbWFwU1dVKEZwazEuY3JlYXRlKHNjYWxhcnNbMF0pKTtcbiAgICAgIHJldHVybiBpc29NYXAoeCwgeSk7XG4gICAgfSxcbiAgICB7XG4gICAgICBEU1Q6ICdzZWNwMjU2azFfWE1EOlNIQS0yNTZfU1NXVV9ST18nLFxuICAgICAgZW5jb2RlRFNUOiAnc2VjcDI1NmsxX1hNRDpTSEEtMjU2X1NTV1VfTlVfJyxcbiAgICAgIHA6IEZwazEuT1JERVIsXG4gICAgICBtOiAxLFxuICAgICAgazogMTI4LFxuICAgICAgZXhwYW5kOiAneG1kJyxcbiAgICAgIGhhc2g6IHNoYTI1NixcbiAgICB9XG4gICkpKCk7XG4iLCAiLyoqXG4gKiBNZXRob2RzIGZvciBlbGxpcHRpYyBjdXJ2ZSBtdWx0aXBsaWNhdGlvbiBieSBzY2FsYXJzLlxuICogQ29udGFpbnMgd05BRiwgcGlwcGVuZ2VyLlxuICogQG1vZHVsZVxuICovXG4vKiEgbm9ibGUtY3VydmVzIC0gTUlUIExpY2Vuc2UgKGMpIDIwMjIgUGF1bCBNaWxsZXIgKHBhdWxtaWxsci5jb20pICovXG5pbXBvcnQgeyBiaXRMZW4sIGJpdE1hc2ssIHR5cGUgU2lnbmVyIH0gZnJvbSAnLi4vdXRpbHMudHMnO1xuaW1wb3J0IHsgRmllbGQsIEZwSW52ZXJ0QmF0Y2gsIHZhbGlkYXRlRmllbGQsIHR5cGUgSUZpZWxkIH0gZnJvbSAnLi9tb2R1bGFyLnRzJztcblxuY29uc3QgXzBuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgwKTtcbmNvbnN0IF8xbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMSk7XG5cbmV4cG9ydCB0eXBlIEFmZmluZVBvaW50PFQ+ID0ge1xuICB4OiBUO1xuICB5OiBUO1xufSAmIHsgWj86IG5ldmVyIH07XG5cbi8vIFdlIGNhbid0IFwiYWJzdHJhY3Qgb3V0XCIgY29vcmRpbmF0ZXMgKFgsIFksIFo7IGFuZCBUIGluIEVkd2FyZHMpOiBhcmd1bWVudCBuYW1lcyBvZiBjb25zdHJ1Y3RvclxuLy8gYXJlIG5vdCBhY2Nlc3NpYmxlLiBTZWUgVHlwZXNjcmlwdCBnaC01NjA5MywgZ2gtNDE1OTQuXG4vL1xuLy8gV2UgaGF2ZSB0byB1c2UgcmVjdXJzaXZlIHR5cGVzLCBzbyBpdCB3aWxsIHJldHVybiBhY3R1YWwgcG9pbnQsIG5vdCBjb25zdGFpbmVkIGBDdXJ2ZVBvaW50YC5cbi8vIElmLCBhdCBhbnkgcG9pbnQsIFAgaXMgYGFueWAsIGl0IHdpbGwgZXJhc2UgYWxsIHR5cGVzIGFuZCByZXBsYWNlIGl0XG4vLyB3aXRoIGBhbnlgLCBiZWNhdXNlIG9mIHJlY3Vyc2lvbiwgYGFueSBpbXBsZW1lbnRzIEN1cnZlUG9pbnRgLFxuLy8gYnV0IHdlIGxvc2UgYWxsIGNvbnN0cmFpbnMgb24gbWV0aG9kcy5cblxuLyoqIEJhc2UgaW50ZXJmYWNlIGZvciBhbGwgZWxsaXB0aWMgY3VydmUgUG9pbnRzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDdXJ2ZVBvaW50PEYsIFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PEYsIFA+PiB7XG4gIC8qKiBBZmZpbmUgeCBjb29yZGluYXRlLiBEaWZmZXJlbnQgZnJvbSBwcm9qZWN0aXZlIC8gZXh0ZW5kZWQgWCBjb29yZGluYXRlLiAqL1xuICB4OiBGO1xuICAvKiogQWZmaW5lIHkgY29vcmRpbmF0ZS4gRGlmZmVyZW50IGZyb20gcHJvamVjdGl2ZSAvIGV4dGVuZGVkIFkgY29vcmRpbmF0ZS4gKi9cbiAgeTogRjtcbiAgWj86IEY7XG4gIGRvdWJsZSgpOiBQO1xuICBuZWdhdGUoKTogUDtcbiAgYWRkKG90aGVyOiBQKTogUDtcbiAgc3VidHJhY3Qob3RoZXI6IFApOiBQO1xuICBlcXVhbHMob3RoZXI6IFApOiBib29sZWFuO1xuICBtdWx0aXBseShzY2FsYXI6IGJpZ2ludCk6IFA7XG4gIGFzc2VydFZhbGlkaXR5KCk6IHZvaWQ7XG4gIGNsZWFyQ29mYWN0b3IoKTogUDtcbiAgaXMwKCk6IGJvb2xlYW47XG4gIGlzVG9yc2lvbkZyZWUoKTogYm9vbGVhbjtcbiAgaXNTbWFsbE9yZGVyKCk6IGJvb2xlYW47XG4gIG11bHRpcGx5VW5zYWZlKHNjYWxhcjogYmlnaW50KTogUDtcbiAgLyoqXG4gICAqIE1hc3NpdmVseSBzcGVlZHMgdXAgYHAubXVsdGlwbHkobilgIGJ5IHVzaW5nIHByZWNvbXB1dGUgdGFibGVzIChjYWNoaW5nKS4gU2VlIHtAbGluayB3TkFGfS5cbiAgICogQHBhcmFtIGlzTGF6eSBjYWxjdWxhdGUgY2FjaGUgbm93LiBEZWZhdWx0ICh0cnVlKSBlbnN1cmVzIGl0J3MgZGVmZXJyZWQgdG8gZmlyc3QgYG11bHRpcGx5KClgXG4gICAqL1xuICBwcmVjb21wdXRlKHdpbmRvd1NpemU/OiBudW1iZXIsIGlzTGF6eT86IGJvb2xlYW4pOiBQO1xuICAvKiogQ29udmVydHMgcG9pbnQgdG8gMkQgeHkgYWZmaW5lIGNvb3JkaW5hdGVzICovXG4gIHRvQWZmaW5lKGludmVydGVkWj86IEYpOiBBZmZpbmVQb2ludDxGPjtcbiAgdG9CeXRlcygpOiBVaW50OEFycmF5O1xuICB0b0hleCgpOiBzdHJpbmc7XG59XG5cbi8qKiBCYXNlIGludGVyZmFjZSBmb3IgYWxsIGVsbGlwdGljIGN1cnZlIFBvaW50IGNvbnN0cnVjdG9ycy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ3VydmVQb2ludENvbnM8UCBleHRlbmRzIEN1cnZlUG9pbnQ8YW55LCBQPj4ge1xuICBbU3ltYm9sLmhhc0luc3RhbmNlXTogKGl0ZW06IHVua25vd24pID0+IGJvb2xlYW47XG4gIEJBU0U6IFA7XG4gIFpFUk86IFA7XG4gIC8qKiBGaWVsZCBmb3IgYmFzaWMgY3VydmUgbWF0aCAqL1xuICBGcDogSUZpZWxkPFBfRjxQPj47XG4gIC8qKiBTY2FsYXIgZmllbGQsIGZvciBzY2FsYXJzIGluIG11bHRpcGx5IGFuZCBvdGhlcnMgKi9cbiAgRm46IElGaWVsZDxiaWdpbnQ+O1xuICAvKiogQ3JlYXRlcyBwb2ludCBmcm9tIHgsIHkuIERvZXMgTk9UIHZhbGlkYXRlIGlmIHRoZSBwb2ludCBpcyB2YWxpZC4gVXNlIGAuYXNzZXJ0VmFsaWRpdHkoKWAuICovXG4gIGZyb21BZmZpbmUocDogQWZmaW5lUG9pbnQ8UF9GPFA+Pik6IFA7XG4gIGZyb21CeXRlcyhieXRlczogVWludDhBcnJheSk6IFA7XG4gIGZyb21IZXgoaGV4OiBzdHJpbmcpOiBQO1xufVxuXG4vLyBUeXBlIGluZmVyZW5jZSBoZWxwZXJzOiBQQyAtIFBvaW50Q29uc3RydWN0b3IsIFAgLSBQb2ludCwgRnAgLSBGaWVsZCBlbGVtZW50XG4vLyBTaG9ydCBuYW1lcywgYmVjYXVzZSB3ZSB1c2UgdGhlbSBhIGxvdCBpbiByZXN1bHQgdHlwZXM6XG4vLyAqIHdlIGNhbid0IGRvICdQID0gR2V0Q3VydmVQb2ludDxQQz4nOiB0aGlzIGlzIGRlZmF1bHQgdmFsdWUgYW5kIGRvZXNuJ3QgY29uc3RyYWluIGFueXRoaW5nXG4vLyAqIHdlIGNhbid0IGRvICd0eXBlIFggPSBHZXRDdXJ2ZVBvaW50PFBDPic6IGl0IHdvbid0IGJlIGFjY2VzaWJsZSBmb3IgYXJndW1lbnRzL3JldHVybiB0eXBlc1xuLy8gKiBgQ3VydmVQb2ludENvbnM8UCBleHRlbmRzIEN1cnZlUG9pbnQ8YW55LCBQPj5gIGNvbnN0cmFpbnRzIGZyb20gaW50ZXJmYWNlIGRlZmluaXRpb25cbi8vICAgd29uJ3QgcHJvcGFnYXRlLCBpZiBgUEMgZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxhbnk+YDogdGhlIFAgd291bGQgYmUgJ2FueScsIHdoaWNoIGlzIGluY29ycmVjdFxuLy8gKiBQQyBjb3VsZCBiZSBzdXBlciBzcGVjaWZpYyB3aXRoIHN1cGVyIHNwZWNpZmljIFAsIHdoaWNoIGltcGxlbWVudHMgQ3VydmVQb2ludDxhbnksIFA+LlxuLy8gICB0aGlzIG1lYW5zIHdlIG5lZWQgdG8gZG8gc3R1ZmYgbGlrZVxuLy8gICBgZnVuY3Rpb24gdGVzdDxQIGV4dGVuZHMgQ3VydmVQb2ludDxhbnksIFA+LCBQQyBleHRlbmRzIEN1cnZlUG9pbnRDb25zPFA+PihgXG4vLyAgIGlmIHdlIHdhbnQgdHlwZSBzYWZldHkgYXJvdW5kIFAsIG90aGVyd2lzZSBQQ19QPFBDPiB3aWxsIGJlIGFueVxuXG4vKiogUmV0dXJucyBGcCB0eXBlIGZyb20gUG9pbnQgKFBfRjxQPiA9PSBQLkYpICovXG5leHBvcnQgdHlwZSBQX0Y8UCBleHRlbmRzIEN1cnZlUG9pbnQ8YW55LCBQPj4gPSBQIGV4dGVuZHMgQ3VydmVQb2ludDxpbmZlciBGLCBQPiA/IEYgOiBuZXZlcjtcbi8qKiBSZXR1cm5zIEZwIHR5cGUgZnJvbSBQb2ludENvbnMgKFBDX0Y8UEM+ID09IFBDLlAuRikgKi9cbmV4cG9ydCB0eXBlIFBDX0Y8UEMgZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxDdXJ2ZVBvaW50PGFueSwgYW55Pj4+ID0gUENbJ0ZwJ11bJ1pFUk8nXTtcbi8qKiBSZXR1cm5zIFBvaW50IHR5cGUgZnJvbSBQb2ludENvbnMgKFBDX1A8UEM+ID09IFBDLlApICovXG5leHBvcnQgdHlwZSBQQ19QPFBDIGV4dGVuZHMgQ3VydmVQb2ludENvbnM8Q3VydmVQb2ludDxhbnksIGFueT4+PiA9IFBDWydaRVJPJ107XG5cbi8vIFVnbHkgaGFjayB0byBnZXQgcHJvcGVyIHR5cGUgaW5mZXJlbmNlLCBiZWNhdXNlIGluIHR5cGVzY3JpcHQgZmFpbHMgdG8gaW5mZXIgcmVzdXJzaXZlbHkuXG4vLyBUaGUgaGFjayBhbGxvd3MgdG8gZG8gdXAgdG8gMTAgY2hhaW5lZCBvcGVyYXRpb25zIHdpdGhvdXQgYXBwbHlpbmcgdHlwZSBlcmFzdXJlLlxuLy9cbi8vIFR5cGVzIHdoaWNoIHdvbid0IHdvcms6XG4vLyAqIGBDdXJ2ZVBvaW50Q29uczxDdXJ2ZVBvaW50PGFueSwgYW55Pj5gLCB3aWxsIHJldHVybiBgYW55YCBhZnRlciAxIG9wZXJhdGlvblxuLy8gKiBgQ3VydmVQb2ludENvbnM8YW55PjogV2VpZXJzdHJhc3NQb2ludENvbnM8YmlnaW50PiBleHRlbmRzIEN1cnZlUG9pbnRDb25zPGFueT4gPSBmYWxzZWBcbi8vICogYFAgZXh0ZW5kcyBDdXJ2ZVBvaW50LCBQQyBleHRlbmRzIEN1cnZlUG9pbnRDb25zPFA+YFxuLy8gICAgICogSXQgY2FuJ3QgaW5mZXIgUCBmcm9tIFBDIGFsb25lXG4vLyAgICAgKiBUb28gbWFueSByZWxhdGlvbnMgYmV0d2VlbiBGLCBQICYgUENcbi8vICAgICAqIEl0IHdpbGwgaW5mZXIgUC9GIGlmIGBhcmc6IEN1cnZlUG9pbnRDb25zPEYsIFA+YCwgYnV0IHdpbGwgZmFpbCBpZiBQQyBpcyBnZW5lcmljXG4vLyAgICAgKiBJdCB3aWxsIHdvcmsgY29ycmVjdGx5IGlmIHRoZXJlIGlzIGFuIGFkZGl0aW9uYWwgYXJndW1lbnQgb2YgdHlwZSBQXG4vLyAgICAgKiBCdXQgZ2VuZXJhbGx5LCB3ZSBkb24ndCB3YW50IHRvIHBhcmFtZXRyaXplIGBDdXJ2ZVBvaW50Q29uc2Agb3ZlciBgRmA6IGl0IHdpbGwgY29tcGxpY2F0ZVxuLy8gICAgICAgdHlwZXMsIG1ha2luZyB0aGVtIHVuLWluZmVyYWJsZVxuLy8gcHJldHRpZXItaWdub3JlXG5leHBvcnQgdHlwZSBQQ19BTlkgPSBDdXJ2ZVBvaW50Q29uczxcbiAgQ3VydmVQb2ludDxhbnksXG4gIEN1cnZlUG9pbnQ8YW55LFxuICBDdXJ2ZVBvaW50PGFueSxcbiAgQ3VydmVQb2ludDxhbnksXG4gIEN1cnZlUG9pbnQ8YW55LFxuICBDdXJ2ZVBvaW50PGFueSxcbiAgQ3VydmVQb2ludDxhbnksXG4gIEN1cnZlUG9pbnQ8YW55LFxuICBDdXJ2ZVBvaW50PGFueSxcbiAgQ3VydmVQb2ludDxhbnksIGFueT5cbiAgPj4+Pj4+Pj4+XG4+O1xuXG5leHBvcnQgaW50ZXJmYWNlIEN1cnZlTGVuZ3RocyB7XG4gIHNlY3JldEtleT86IG51bWJlcjtcbiAgcHVibGljS2V5PzogbnVtYmVyO1xuICBwdWJsaWNLZXlVbmNvbXByZXNzZWQ/OiBudW1iZXI7XG4gIHB1YmxpY0tleUhhc1ByZWZpeD86IGJvb2xlYW47XG4gIHNpZ25hdHVyZT86IG51bWJlcjtcbiAgc2VlZD86IG51bWJlcjtcbn1cblxuZXhwb3J0IHR5cGUgTWFwcGVyPFQ+ID0gKGk6IFRbXSkgPT4gVFtdO1xuXG5leHBvcnQgZnVuY3Rpb24gbmVnYXRlQ3Q8VCBleHRlbmRzIHsgbmVnYXRlOiAoKSA9PiBUIH0+KGNvbmRpdGlvbjogYm9vbGVhbiwgaXRlbTogVCk6IFQge1xuICBjb25zdCBuZWcgPSBpdGVtLm5lZ2F0ZSgpO1xuICByZXR1cm4gY29uZGl0aW9uID8gbmVnIDogaXRlbTtcbn1cblxuLyoqXG4gKiBUYWtlcyBhIGJ1bmNoIG9mIFByb2plY3RpdmUgUG9pbnRzIGJ1dCBleGVjdXRlcyBvbmx5IG9uZVxuICogaW52ZXJzaW9uIG9uIGFsbCBvZiB0aGVtLiBJbnZlcnNpb24gaXMgdmVyeSBzbG93IG9wZXJhdGlvbixcbiAqIHNvIHRoaXMgaW1wcm92ZXMgcGVyZm9ybWFuY2UgbWFzc2l2ZWx5LlxuICogT3B0aW1pemF0aW9uOiBjb252ZXJ0cyBhIGxpc3Qgb2YgcHJvamVjdGl2ZSBwb2ludHMgdG8gYSBsaXN0IG9mIGlkZW50aWNhbCBwb2ludHMgd2l0aCBaPTEuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVaPFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PGFueSwgUD4sIFBDIGV4dGVuZHMgQ3VydmVQb2ludENvbnM8UD4+KFxuICBjOiBQQyxcbiAgcG9pbnRzOiBQW11cbik6IFBbXSB7XG4gIGNvbnN0IGludmVydGVkWnMgPSBGcEludmVydEJhdGNoKFxuICAgIGMuRnAsXG4gICAgcG9pbnRzLm1hcCgocCkgPT4gcC5aISlcbiAgKTtcbiAgcmV0dXJuIHBvaW50cy5tYXAoKHAsIGkpID0+IGMuZnJvbUFmZmluZShwLnRvQWZmaW5lKGludmVydGVkWnNbaV0pKSk7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlVyhXOiBudW1iZXIsIGJpdHM6IG51bWJlcikge1xuICBpZiAoIU51bWJlci5pc1NhZmVJbnRlZ2VyKFcpIHx8IFcgPD0gMCB8fCBXID4gYml0cylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgd2luZG93IHNpemUsIGV4cGVjdGVkIFsxLi4nICsgYml0cyArICddLCBnb3QgVz0nICsgVyk7XG59XG5cbi8qKiBJbnRlcm5hbCB3TkFGIG9wdHMgZm9yIHNwZWNpZmljIFcgYW5kIHNjYWxhckJpdHMgKi9cbnR5cGUgV09wdHMgPSB7XG4gIHdpbmRvd3M6IG51bWJlcjtcbiAgd2luZG93U2l6ZTogbnVtYmVyO1xuICBtYXNrOiBiaWdpbnQ7XG4gIG1heE51bWJlcjogbnVtYmVyO1xuICBzaGlmdEJ5OiBiaWdpbnQ7XG59O1xuXG5mdW5jdGlvbiBjYWxjV09wdHMoVzogbnVtYmVyLCBzY2FsYXJCaXRzOiBudW1iZXIpOiBXT3B0cyB7XG4gIHZhbGlkYXRlVyhXLCBzY2FsYXJCaXRzKTtcbiAgY29uc3Qgd2luZG93cyA9IE1hdGguY2VpbChzY2FsYXJCaXRzIC8gVykgKyAxOyAvLyBXPTggMzMuIE5vdCAzMiwgYmVjYXVzZSB3ZSBza2lwIHplcm9cbiAgY29uc3Qgd2luZG93U2l6ZSA9IDIgKiogKFcgLSAxKTsgLy8gVz04IDEyOC4gTm90IDI1NiwgYmVjYXVzZSB3ZSBza2lwIHplcm9cbiAgY29uc3QgbWF4TnVtYmVyID0gMiAqKiBXOyAvLyBXPTggMjU2XG4gIGNvbnN0IG1hc2sgPSBiaXRNYXNrKFcpOyAvLyBXPTggMjU1ID09IG1hc2sgMGIxMTExMTExMVxuICBjb25zdCBzaGlmdEJ5ID0gQmlnSW50KFcpOyAvLyBXPTggOFxuICByZXR1cm4geyB3aW5kb3dzLCB3aW5kb3dTaXplLCBtYXNrLCBtYXhOdW1iZXIsIHNoaWZ0QnkgfTtcbn1cblxuZnVuY3Rpb24gY2FsY09mZnNldHMobjogYmlnaW50LCB3aW5kb3c6IG51bWJlciwgd09wdHM6IFdPcHRzKSB7XG4gIGNvbnN0IHsgd2luZG93U2l6ZSwgbWFzaywgbWF4TnVtYmVyLCBzaGlmdEJ5IH0gPSB3T3B0cztcbiAgbGV0IHdiaXRzID0gTnVtYmVyKG4gJiBtYXNrKTsgLy8gZXh0cmFjdCBXIGJpdHMuXG4gIGxldCBuZXh0TiA9IG4gPj4gc2hpZnRCeTsgLy8gc2hpZnQgbnVtYmVyIGJ5IFcgYml0cy5cblxuICAvLyBXaGF0IGFjdHVhbGx5IGhhcHBlbnMgaGVyZTpcbiAgLy8gY29uc3QgaGlnaGVzdEJpdCA9IE51bWJlcihtYXNrIF4gKG1hc2sgPj4gMW4pKTtcbiAgLy8gbGV0IHdiaXRzMiA9IHdiaXRzIC0gMTsgLy8gc2tpcCB6ZXJvXG4gIC8vIGlmICh3Yml0czIgJiBoaWdoZXN0Qml0KSB7IHdiaXRzMiBePSBOdW1iZXIobWFzayk7IC8vICh+KTtcblxuICAvLyBzcGxpdCBpZiBiaXRzID4gbWF4OiArMjI0ID0+IDI1Ni0zMlxuICBpZiAod2JpdHMgPiB3aW5kb3dTaXplKSB7XG4gICAgLy8gd2Ugc2tpcCB6ZXJvLCB3aGljaCBtZWFucyBpbnN0ZWFkIG9mIGA+PSBzaXplLTFgLCB3ZSBkbyBgPiBzaXplYFxuICAgIHdiaXRzIC09IG1heE51bWJlcjsgLy8gLTMyLCBjYW4gYmUgbWF4TnVtYmVyIC0gd2JpdHMsIGJ1dCB0aGVuIHdlIG5lZWQgdG8gc2V0IGlzTmVnIGhlcmUuXG4gICAgbmV4dE4gKz0gXzFuOyAvLyArMjU2IChjYXJyeSlcbiAgfVxuICBjb25zdCBvZmZzZXRTdGFydCA9IHdpbmRvdyAqIHdpbmRvd1NpemU7XG4gIGNvbnN0IG9mZnNldCA9IG9mZnNldFN0YXJ0ICsgTWF0aC5hYnMod2JpdHMpIC0gMTsgLy8gLTEgYmVjYXVzZSB3ZSBza2lwIHplcm9cbiAgY29uc3QgaXNaZXJvID0gd2JpdHMgPT09IDA7IC8vIGlzIGN1cnJlbnQgd2luZG93IHNsaWNlIGEgMD9cbiAgY29uc3QgaXNOZWcgPSB3Yml0cyA8IDA7IC8vIGlzIGN1cnJlbnQgd2luZG93IHNsaWNlIG5lZ2F0aXZlP1xuICBjb25zdCBpc05lZ0YgPSB3aW5kb3cgJSAyICE9PSAwOyAvLyBmYWtlIHJhbmRvbSBzdGF0ZW1lbnQgZm9yIG5vaXNlXG4gIGNvbnN0IG9mZnNldEYgPSBvZmZzZXRTdGFydDsgLy8gZmFrZSBvZmZzZXQgZm9yIG5vaXNlXG4gIHJldHVybiB7IG5leHROLCBvZmZzZXQsIGlzWmVybywgaXNOZWcsIGlzTmVnRiwgb2Zmc2V0RiB9O1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZU1TTVBvaW50cyhwb2ludHM6IGFueVtdLCBjOiBhbnkpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHBvaW50cykpIHRocm93IG5ldyBFcnJvcignYXJyYXkgZXhwZWN0ZWQnKTtcbiAgcG9pbnRzLmZvckVhY2goKHAsIGkpID0+IHtcbiAgICBpZiAoIShwIGluc3RhbmNlb2YgYykpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBwb2ludCBhdCBpbmRleCAnICsgaSk7XG4gIH0pO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVNU01TY2FsYXJzKHNjYWxhcnM6IGFueVtdLCBmaWVsZDogYW55KSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShzY2FsYXJzKSkgdGhyb3cgbmV3IEVycm9yKCdhcnJheSBvZiBzY2FsYXJzIGV4cGVjdGVkJyk7XG4gIHNjYWxhcnMuZm9yRWFjaCgocywgaSkgPT4ge1xuICAgIGlmICghZmllbGQuaXNWYWxpZChzKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHNjYWxhciBhdCBpbmRleCAnICsgaSk7XG4gIH0pO1xufVxuXG4vLyBTaW5jZSBwb2ludHMgaW4gZGlmZmVyZW50IGdyb3VwcyBjYW5ub3QgYmUgZXF1YWwgKGRpZmZlcmVudCBvYmplY3QgY29uc3RydWN0b3IpLFxuLy8gd2UgY2FuIGhhdmUgc2luZ2xlIHBsYWNlIHRvIHN0b3JlIHByZWNvbXB1dGVzLlxuLy8gQWxsb3dzIHRvIG1ha2UgcG9pbnRzIGZyb3plbiAvIGltbXV0YWJsZS5cbmNvbnN0IHBvaW50UHJlY29tcHV0ZXMgPSBuZXcgV2Vha01hcDxhbnksIGFueVtdPigpO1xuY29uc3QgcG9pbnRXaW5kb3dTaXplcyA9IG5ldyBXZWFrTWFwPGFueSwgbnVtYmVyPigpO1xuXG5mdW5jdGlvbiBnZXRXKFA6IGFueSk6IG51bWJlciB7XG4gIC8vIFRvIGRpc2FibGUgcHJlY29tcHV0ZXM6XG4gIC8vIHJldHVybiAxO1xuICByZXR1cm4gcG9pbnRXaW5kb3dTaXplcy5nZXQoUCkgfHwgMTtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0MChuOiBiaWdpbnQpOiB2b2lkIHtcbiAgaWYgKG4gIT09IF8wbikgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHdOQUYnKTtcbn1cblxuLyoqXG4gKiBFbGxpcHRpYyBjdXJ2ZSBtdWx0aXBsaWNhdGlvbiBvZiBQb2ludCBieSBzY2FsYXIuIEZyYWdpbGUuXG4gKiBUYWJsZSBnZW5lcmF0aW9uIHRha2VzICoqMzBNQiBvZiByYW0gYW5kIDEwbXMgb24gaGlnaC1lbmQgQ1BVKiosXG4gKiBidXQgbWF5IHRha2UgbXVjaCBsb25nZXIgb24gc2xvdyBkZXZpY2VzLiBBY3R1YWwgZ2VuZXJhdGlvbiB3aWxsIGhhcHBlbiBvblxuICogZmlyc3QgY2FsbCBvZiBgbXVsdGlwbHkoKWAuIEJ5IGRlZmF1bHQsIGBCQVNFYCBwb2ludCBpcyBwcmVjb21wdXRlZC5cbiAqXG4gKiBTY2FsYXJzIHNob3VsZCBhbHdheXMgYmUgbGVzcyB0aGFuIGN1cnZlIG9yZGVyOiB0aGlzIHNob3VsZCBiZSBjaGVja2VkIGluc2lkZSBvZiBhIGN1cnZlIGl0c2VsZi5cbiAqIENyZWF0ZXMgcHJlY29tcHV0YXRpb24gdGFibGVzIGZvciBmYXN0IG11bHRpcGxpY2F0aW9uOlxuICogLSBwcml2YXRlIHNjYWxhciBpcyBzcGxpdCBieSBmaXhlZCBzaXplIHdpbmRvd3Mgb2YgVyBiaXRzXG4gKiAtIGV2ZXJ5IHdpbmRvdyBwb2ludCBpcyBjb2xsZWN0ZWQgZnJvbSB3aW5kb3cncyB0YWJsZSAmIGFkZGVkIHRvIGFjY3VtdWxhdG9yXG4gKiAtIHNpbmNlIHdpbmRvd3MgYXJlIGRpZmZlcmVudCwgc2FtZSBwb2ludCBpbnNpZGUgdGFibGVzIHdvbid0IGJlIGFjY2Vzc2VkIG1vcmUgdGhhbiBvbmNlIHBlciBjYWxjXG4gKiAtIGVhY2ggbXVsdGlwbGljYXRpb24gaXMgJ01hdGguY2VpbChDVVJWRV9PUkRFUiAvIFx1RDgzNVx1REM0QSkgKyAxJyBwb2ludCBhZGRpdGlvbnMgKGZpeGVkIGZvciBhbnkgc2NhbGFyKVxuICogLSArMSB3aW5kb3cgaXMgbmVjY2Vzc2FyeSBmb3Igd05BRlxuICogLSB3TkFGIHJlZHVjZXMgdGFibGUgc2l6ZTogMnggbGVzcyBtZW1vcnkgKyAyeCBmYXN0ZXIgZ2VuZXJhdGlvbiwgYnV0IDEwJSBzbG93ZXIgbXVsdGlwbGljYXRpb25cbiAqXG4gKiBAdG9kbyBSZXNlYXJjaCByZXR1cm5pbmcgMmQgSlMgYXJyYXkgb2Ygd2luZG93cywgaW5zdGVhZCBvZiBhIHNpbmdsZSB3aW5kb3cuXG4gKiBUaGlzIHdvdWxkIGFsbG93IHdpbmRvd3MgdG8gYmUgaW4gZGlmZmVyZW50IG1lbW9yeSBsb2NhdGlvbnNcbiAqL1xuZXhwb3J0IGNsYXNzIHdOQUY8UEMgZXh0ZW5kcyBQQ19BTlk+IHtcbiAgcHJpdmF0ZSByZWFkb25seSBCQVNFOiBQQ19QPFBDPjtcbiAgcHJpdmF0ZSByZWFkb25seSBaRVJPOiBQQ19QPFBDPjtcbiAgcHJpdmF0ZSByZWFkb25seSBGbjogUENbJ0ZuJ107XG4gIHJlYWRvbmx5IGJpdHM6IG51bWJlcjtcblxuICAvLyBQYXJhbWV0cml6ZWQgd2l0aCBhIGdpdmVuIFBvaW50IGNsYXNzIChub3QgaW5kaXZpZHVhbCBwb2ludClcbiAgY29uc3RydWN0b3IoUG9pbnQ6IFBDLCBiaXRzOiBudW1iZXIpIHtcbiAgICB0aGlzLkJBU0UgPSBQb2ludC5CQVNFO1xuICAgIHRoaXMuWkVSTyA9IFBvaW50LlpFUk87XG4gICAgdGhpcy5GbiA9IFBvaW50LkZuO1xuICAgIHRoaXMuYml0cyA9IGJpdHM7XG4gIH1cblxuICAvLyBub24tY29uc3QgdGltZSBtdWx0aXBsaWNhdGlvbiBsYWRkZXJcbiAgX3Vuc2FmZUxhZGRlcihlbG06IFBDX1A8UEM+LCBuOiBiaWdpbnQsIHA6IFBDX1A8UEM+ID0gdGhpcy5aRVJPKTogUENfUDxQQz4ge1xuICAgIGxldCBkOiBQQ19QPFBDPiA9IGVsbTtcbiAgICB3aGlsZSAobiA+IF8wbikge1xuICAgICAgaWYgKG4gJiBfMW4pIHAgPSBwLmFkZChkKTtcbiAgICAgIGQgPSBkLmRvdWJsZSgpO1xuICAgICAgbiA+Pj0gXzFuO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgd05BRiBwcmVjb21wdXRhdGlvbiB3aW5kb3cuIFVzZWQgZm9yIGNhY2hpbmcuXG4gICAqIERlZmF1bHQgd2luZG93IHNpemUgaXMgc2V0IGJ5IGB1dGlscy5wcmVjb21wdXRlKClgIGFuZCBpcyBlcXVhbCB0byA4LlxuICAgKiBOdW1iZXIgb2YgcHJlY29tcHV0ZWQgcG9pbnRzIGRlcGVuZHMgb24gdGhlIGN1cnZlIHNpemU6XG4gICAqIDJeKFx1RDgzNVx1REM0QVx1MjIxMjEpICogKE1hdGguY2VpbChcdUQ4MzVcdURDNUIgLyBcdUQ4MzVcdURDNEEpICsgMSksIHdoZXJlOlxuICAgKiAtIFx1RDgzNVx1REM0QSBpcyB0aGUgd2luZG93IHNpemVcbiAgICogLSBcdUQ4MzVcdURDNUIgaXMgdGhlIGJpdGxlbmd0aCBvZiB0aGUgY3VydmUgb3JkZXIuXG4gICAqIEZvciBhIDI1Ni1iaXQgY3VydmUgYW5kIHdpbmRvdyBzaXplIDgsIHRoZSBudW1iZXIgb2YgcHJlY29tcHV0ZWQgcG9pbnRzIGlzIDEyOCAqIDMzID0gNDIyNC5cbiAgICogQHBhcmFtIHBvaW50IFBvaW50IGluc3RhbmNlXG4gICAqIEBwYXJhbSBXIHdpbmRvdyBzaXplXG4gICAqIEByZXR1cm5zIHByZWNvbXB1dGVkIHBvaW50IHRhYmxlcyBmbGF0dGVuZWQgdG8gYSBzaW5nbGUgYXJyYXlcbiAgICovXG4gIHByaXZhdGUgcHJlY29tcHV0ZVdpbmRvdyhwb2ludDogUENfUDxQQz4sIFc6IG51bWJlcik6IFBDX1A8UEM+W10ge1xuICAgIGNvbnN0IHsgd2luZG93cywgd2luZG93U2l6ZSB9ID0gY2FsY1dPcHRzKFcsIHRoaXMuYml0cyk7XG4gICAgY29uc3QgcG9pbnRzOiBQQ19QPFBDPltdID0gW107XG4gICAgbGV0IHA6IFBDX1A8UEM+ID0gcG9pbnQ7XG4gICAgbGV0IGJhc2UgPSBwO1xuICAgIGZvciAobGV0IHdpbmRvdyA9IDA7IHdpbmRvdyA8IHdpbmRvd3M7IHdpbmRvdysrKSB7XG4gICAgICBiYXNlID0gcDtcbiAgICAgIHBvaW50cy5wdXNoKGJhc2UpO1xuICAgICAgLy8gaT0xLCBiYyB3ZSBza2lwIDBcbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgd2luZG93U2l6ZTsgaSsrKSB7XG4gICAgICAgIGJhc2UgPSBiYXNlLmFkZChwKTtcbiAgICAgICAgcG9pbnRzLnB1c2goYmFzZSk7XG4gICAgICB9XG4gICAgICBwID0gYmFzZS5kb3VibGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHBvaW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRzIGVjIG11bHRpcGxpY2F0aW9uIHVzaW5nIHByZWNvbXB1dGVkIHRhYmxlcyBhbmQgdy1hcnkgbm9uLWFkamFjZW50IGZvcm0uXG4gICAqIE1vcmUgY29tcGFjdCBpbXBsZW1lbnRhdGlvbjpcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3BhdWxtaWxsci9ub2JsZS1zZWNwMjU2azEvYmxvYi80N2NiMTY2OWI2ZTUwNmFkNjZiMzVmZTdkNzYxMzJhZTk3NDY1ZGEyL2luZGV4LnRzI0w1MDItTDU0MVxuICAgKiBAcmV0dXJucyByZWFsIGFuZCBmYWtlIChmb3IgY29uc3QtdGltZSkgcG9pbnRzXG4gICAqL1xuICBwcml2YXRlIHdOQUYoVzogbnVtYmVyLCBwcmVjb21wdXRlczogUENfUDxQQz5bXSwgbjogYmlnaW50KTogeyBwOiBQQ19QPFBDPjsgZjogUENfUDxQQz4gfSB7XG4gICAgLy8gU2NhbGFyIHNob3VsZCBiZSBzbWFsbGVyIHRoYW4gZmllbGQgb3JkZXJcbiAgICBpZiAoIXRoaXMuRm4uaXNWYWxpZChuKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHNjYWxhcicpO1xuICAgIC8vIEFjY3VtdWxhdG9yc1xuICAgIGxldCBwID0gdGhpcy5aRVJPO1xuICAgIGxldCBmID0gdGhpcy5CQVNFO1xuICAgIC8vIFRoaXMgY29kZSB3YXMgZmlyc3Qgd3JpdHRlbiB3aXRoIGFzc3VtcHRpb24gdGhhdCAnZicgYW5kICdwJyB3aWxsIG5ldmVyIGJlIGluZmluaXR5IHBvaW50OlxuICAgIC8vIHNpbmNlIGVhY2ggYWRkaXRpb24gaXMgbXVsdGlwbGllZCBieSAyICoqIFcsIGl0IGNhbm5vdCBjYW5jZWwgZWFjaCBvdGhlci4gSG93ZXZlcixcbiAgICAvLyB0aGVyZSBpcyBuZWdhdGUgbm93OiBpdCBpcyBwb3NzaWJsZSB0aGF0IG5lZ2F0ZWQgZWxlbWVudCBmcm9tIGxvdyB2YWx1ZVxuICAgIC8vIHdvdWxkIGJlIHRoZSBzYW1lIGFzIGhpZ2ggZWxlbWVudCwgd2hpY2ggd2lsbCBjcmVhdGUgY2FycnkgaW50byBuZXh0IHdpbmRvdy5cbiAgICAvLyBJdCdzIG5vdCBvYnZpb3VzIGhvdyB0aGlzIGNhbiBmYWlsLCBidXQgc3RpbGwgd29ydGggaW52ZXN0aWdhdGluZyBsYXRlci5cbiAgICBjb25zdCB3byA9IGNhbGNXT3B0cyhXLCB0aGlzLmJpdHMpO1xuICAgIGZvciAobGV0IHdpbmRvdyA9IDA7IHdpbmRvdyA8IHdvLndpbmRvd3M7IHdpbmRvdysrKSB7XG4gICAgICAvLyAobiA9PT0gXzBuKSBpcyBoYW5kbGVkIGFuZCBub3QgZWFybHktZXhpdGVkLiBpc0V2ZW4gYW5kIG9mZnNldEYgYXJlIHVzZWQgZm9yIG5vaXNlXG4gICAgICBjb25zdCB7IG5leHROLCBvZmZzZXQsIGlzWmVybywgaXNOZWcsIGlzTmVnRiwgb2Zmc2V0RiB9ID0gY2FsY09mZnNldHMobiwgd2luZG93LCB3byk7XG4gICAgICBuID0gbmV4dE47XG4gICAgICBpZiAoaXNaZXJvKSB7XG4gICAgICAgIC8vIGJpdHMgYXJlIDA6IGFkZCBnYXJiYWdlIHRvIGZha2UgcG9pbnRcbiAgICAgICAgLy8gSW1wb3J0YW50IHBhcnQgZm9yIGNvbnN0LXRpbWUgZ2V0UHVibGljS2V5OiBhZGQgcmFuZG9tIFwibm9pc2VcIiBwb2ludCB0byBmLlxuICAgICAgICBmID0gZi5hZGQobmVnYXRlQ3QoaXNOZWdGLCBwcmVjb21wdXRlc1tvZmZzZXRGXSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYml0cyBhcmUgMTogYWRkIHRvIHJlc3VsdCBwb2ludFxuICAgICAgICBwID0gcC5hZGQobmVnYXRlQ3QoaXNOZWcsIHByZWNvbXB1dGVzW29mZnNldF0pKTtcbiAgICAgIH1cbiAgICB9XG4gICAgYXNzZXJ0MChuKTtcbiAgICAvLyBSZXR1cm4gYm90aCByZWFsIGFuZCBmYWtlIHBvaW50czogSklUIHdvbid0IGVsaW1pbmF0ZSBmLlxuICAgIC8vIEF0IHRoaXMgcG9pbnQgdGhlcmUgaXMgYSB3YXkgdG8gRiBiZSBpbmZpbml0eS1wb2ludCBldmVuIGlmIHAgaXMgbm90LFxuICAgIC8vIHdoaWNoIG1ha2VzIGl0IGxlc3MgY29uc3QtdGltZTogYXJvdW5kIDEgYmlnaW50IG11bHRpcGx5LlxuICAgIHJldHVybiB7IHAsIGYgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRzIGVjIHVuc2FmZSAobm9uIGNvbnN0LXRpbWUpIG11bHRpcGxpY2F0aW9uIHVzaW5nIHByZWNvbXB1dGVkIHRhYmxlcyBhbmQgdy1hcnkgbm9uLWFkamFjZW50IGZvcm0uXG4gICAqIEBwYXJhbSBhY2MgYWNjdW11bGF0b3IgcG9pbnQgdG8gYWRkIHJlc3VsdCBvZiBtdWx0aXBsaWNhdGlvblxuICAgKiBAcmV0dXJucyBwb2ludFxuICAgKi9cbiAgcHJpdmF0ZSB3TkFGVW5zYWZlKFxuICAgIFc6IG51bWJlcixcbiAgICBwcmVjb21wdXRlczogUENfUDxQQz5bXSxcbiAgICBuOiBiaWdpbnQsXG4gICAgYWNjOiBQQ19QPFBDPiA9IHRoaXMuWkVST1xuICApOiBQQ19QPFBDPiB7XG4gICAgY29uc3Qgd28gPSBjYWxjV09wdHMoVywgdGhpcy5iaXRzKTtcbiAgICBmb3IgKGxldCB3aW5kb3cgPSAwOyB3aW5kb3cgPCB3by53aW5kb3dzOyB3aW5kb3crKykge1xuICAgICAgaWYgKG4gPT09IF8wbikgYnJlYWs7IC8vIEVhcmx5LWV4aXQsIHNraXAgMCB2YWx1ZVxuICAgICAgY29uc3QgeyBuZXh0Tiwgb2Zmc2V0LCBpc1plcm8sIGlzTmVnIH0gPSBjYWxjT2Zmc2V0cyhuLCB3aW5kb3csIHdvKTtcbiAgICAgIG4gPSBuZXh0TjtcbiAgICAgIGlmIChpc1plcm8pIHtcbiAgICAgICAgLy8gV2luZG93IGJpdHMgYXJlIDA6IHNraXAgcHJvY2Vzc2luZy5cbiAgICAgICAgLy8gTW92ZSB0byBuZXh0IHdpbmRvdy5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBpdGVtID0gcHJlY29tcHV0ZXNbb2Zmc2V0XTtcbiAgICAgICAgYWNjID0gYWNjLmFkZChpc05lZyA/IGl0ZW0ubmVnYXRlKCkgOiBpdGVtKTsgLy8gUmUtdXNpbmcgYWNjIGFsbG93cyB0byBzYXZlIGFkZHMgaW4gTVNNXG4gICAgICB9XG4gICAgfVxuICAgIGFzc2VydDAobik7XG4gICAgcmV0dXJuIGFjYztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UHJlY29tcHV0ZXMoVzogbnVtYmVyLCBwb2ludDogUENfUDxQQz4sIHRyYW5zZm9ybT86IE1hcHBlcjxQQ19QPFBDPj4pOiBQQ19QPFBDPltdIHtcbiAgICAvLyBDYWxjdWxhdGUgcHJlY29tcHV0ZXMgb24gYSBmaXJzdCBydW4sIHJldXNlIHRoZW0gYWZ0ZXJcbiAgICBsZXQgY29tcCA9IHBvaW50UHJlY29tcHV0ZXMuZ2V0KHBvaW50KTtcbiAgICBpZiAoIWNvbXApIHtcbiAgICAgIGNvbXAgPSB0aGlzLnByZWNvbXB1dGVXaW5kb3cocG9pbnQsIFcpIGFzIFBDX1A8UEM+W107XG4gICAgICBpZiAoVyAhPT0gMSkge1xuICAgICAgICAvLyBEb2luZyB0cmFuc2Zvcm0gb3V0c2lkZSBvZiBpZiBicmluZ3MgMTUlIHBlcmYgaGl0XG4gICAgICAgIGlmICh0eXBlb2YgdHJhbnNmb3JtID09PSAnZnVuY3Rpb24nKSBjb21wID0gdHJhbnNmb3JtKGNvbXApO1xuICAgICAgICBwb2ludFByZWNvbXB1dGVzLnNldChwb2ludCwgY29tcCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb21wO1xuICB9XG5cbiAgY2FjaGVkKFxuICAgIHBvaW50OiBQQ19QPFBDPixcbiAgICBzY2FsYXI6IGJpZ2ludCxcbiAgICB0cmFuc2Zvcm0/OiBNYXBwZXI8UENfUDxQQz4+XG4gICk6IHsgcDogUENfUDxQQz47IGY6IFBDX1A8UEM+IH0ge1xuICAgIGNvbnN0IFcgPSBnZXRXKHBvaW50KTtcbiAgICByZXR1cm4gdGhpcy53TkFGKFcsIHRoaXMuZ2V0UHJlY29tcHV0ZXMoVywgcG9pbnQsIHRyYW5zZm9ybSksIHNjYWxhcik7XG4gIH1cblxuICB1bnNhZmUocG9pbnQ6IFBDX1A8UEM+LCBzY2FsYXI6IGJpZ2ludCwgdHJhbnNmb3JtPzogTWFwcGVyPFBDX1A8UEM+PiwgcHJldj86IFBDX1A8UEM+KTogUENfUDxQQz4ge1xuICAgIGNvbnN0IFcgPSBnZXRXKHBvaW50KTtcbiAgICBpZiAoVyA9PT0gMSkgcmV0dXJuIHRoaXMuX3Vuc2FmZUxhZGRlcihwb2ludCwgc2NhbGFyLCBwcmV2KTsgLy8gRm9yIFc9MSBsYWRkZXIgaXMgfngyIGZhc3RlclxuICAgIHJldHVybiB0aGlzLndOQUZVbnNhZmUoVywgdGhpcy5nZXRQcmVjb21wdXRlcyhXLCBwb2ludCwgdHJhbnNmb3JtKSwgc2NhbGFyLCBwcmV2KTtcbiAgfVxuXG4gIC8vIFdlIGNhbGN1bGF0ZSBwcmVjb21wdXRlcyBmb3IgZWxsaXB0aWMgY3VydmUgcG9pbnQgbXVsdGlwbGljYXRpb25cbiAgLy8gdXNpbmcgd2luZG93ZWQgbWV0aG9kLiBUaGlzIHNwZWNpZmllcyB3aW5kb3cgc2l6ZSBhbmRcbiAgLy8gc3RvcmVzIHByZWNvbXB1dGVkIHZhbHVlcy4gVXN1YWxseSBvbmx5IGJhc2UgcG9pbnQgd291bGQgYmUgcHJlY29tcHV0ZWQuXG4gIGNyZWF0ZUNhY2hlKFA6IFBDX1A8UEM+LCBXOiBudW1iZXIpOiB2b2lkIHtcbiAgICB2YWxpZGF0ZVcoVywgdGhpcy5iaXRzKTtcbiAgICBwb2ludFdpbmRvd1NpemVzLnNldChQLCBXKTtcbiAgICBwb2ludFByZWNvbXB1dGVzLmRlbGV0ZShQKTtcbiAgfVxuXG4gIGhhc0NhY2hlKGVsbTogUENfUDxQQz4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gZ2V0VyhlbG0pICE9PSAxO1xuICB9XG59XG5cbi8qKlxuICogRW5kb21vcnBoaXNtLXNwZWNpZmljIG11bHRpcGxpY2F0aW9uIGZvciBLb2JsaXR6IGN1cnZlcy5cbiAqIENvc3Q6IDEyOCBkYmwsIDAtMjU2IGFkZHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWxFbmRvVW5zYWZlPFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PGFueSwgUD4sIFBDIGV4dGVuZHMgQ3VydmVQb2ludENvbnM8UD4+KFxuICBQb2ludDogUEMsXG4gIHBvaW50OiBQLFxuICBrMTogYmlnaW50LFxuICBrMjogYmlnaW50XG4pOiB7IHAxOiBQOyBwMjogUCB9IHtcbiAgbGV0IGFjYyA9IHBvaW50O1xuICBsZXQgcDEgPSBQb2ludC5aRVJPO1xuICBsZXQgcDIgPSBQb2ludC5aRVJPO1xuICB3aGlsZSAoazEgPiBfMG4gfHwgazIgPiBfMG4pIHtcbiAgICBpZiAoazEgJiBfMW4pIHAxID0gcDEuYWRkKGFjYyk7XG4gICAgaWYgKGsyICYgXzFuKSBwMiA9IHAyLmFkZChhY2MpO1xuICAgIGFjYyA9IGFjYy5kb3VibGUoKTtcbiAgICBrMSA+Pj0gXzFuO1xuICAgIGsyID4+PSBfMW47XG4gIH1cbiAgcmV0dXJuIHsgcDEsIHAyIH07XG59XG5cbi8qKlxuICogUGlwcGVuZ2VyIGFsZ29yaXRobSBmb3IgbXVsdGktc2NhbGFyIG11bHRpcGxpY2F0aW9uIChNU00sIFBhICsgUWIgKyBSYyArIC4uLikuXG4gKiAzMHggZmFzdGVyIHZzIG5haXZlIGFkZGl0aW9uIG9uIEw9NDA5NiwgMTB4IGZhc3RlciB0aGFuIHByZWNvbXB1dGVzLlxuICogRm9yIE49MjU0Yml0LCBMPTEsIGl0IGRvZXM6IDEwMjQgQUREICsgMjU0IERCTC4gRm9yIEw9NTogMTUzNiBBREQgKyAyNTQgREJMLlxuICogQWxnb3JpdGhtaWNhbGx5IGNvbnN0YW50LXRpbWUgKGZvciBzYW1lIEwpLCBldmVuIHdoZW4gMSBwb2ludCArIHNjYWxhciwgb3Igd2hlbiBzY2FsYXIgPSAwLlxuICogQHBhcmFtIGMgQ3VydmUgUG9pbnQgY29uc3RydWN0b3JcbiAqIEBwYXJhbSBmaWVsZE4gZmllbGQgb3ZlciBDVVJWRS5OIC0gaW1wb3J0YW50IHRoYXQgaXQncyBub3Qgb3ZlciBDVVJWRS5QXG4gKiBAcGFyYW0gcG9pbnRzIGFycmF5IG9mIEwgY3VydmUgcG9pbnRzXG4gKiBAcGFyYW0gc2NhbGFycyBhcnJheSBvZiBMIHNjYWxhcnMgKGFrYSBzZWNyZXQga2V5cyAvIGJpZ2ludHMpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwaXBwZW5nZXI8UCBleHRlbmRzIEN1cnZlUG9pbnQ8YW55LCBQPiwgUEMgZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxQPj4oXG4gIGM6IFBDLFxuICBwb2ludHM6IFBbXSxcbiAgc2NhbGFyczogYmlnaW50W11cbik6IFAge1xuICAvLyBJZiB3ZSBzcGxpdCBzY2FsYXJzIGJ5IHNvbWUgd2luZG93IChsZXQncyBzYXkgOCBiaXRzKSwgZXZlcnkgY2h1bmsgd2lsbCBvbmx5XG4gIC8vIHRha2UgMjU2IGJ1Y2tldHMgZXZlbiBpZiB0aGVyZSBhcmUgNDA5NiBzY2FsYXJzLCBhbHNvIHJlLXVzZXMgZG91YmxlLlxuICAvLyBUT0RPOlxuICAvLyAtIGh0dHBzOi8vZXByaW50LmlhY3Iub3JnLzIwMjQvNzUwLnBkZlxuICAvLyAtIGh0dHBzOi8vdGNoZXMuaWFjci5vcmcvaW5kZXgucGhwL1RDSEVTL2FydGljbGUvdmlldy8xMDI4N1xuICAvLyAwIGlzIGFjY2VwdGVkIGluIHNjYWxhcnNcbiAgY29uc3QgZmllbGROID0gYy5GbjtcbiAgdmFsaWRhdGVNU01Qb2ludHMocG9pbnRzLCBjKTtcbiAgdmFsaWRhdGVNU01TY2FsYXJzKHNjYWxhcnMsIGZpZWxkTik7XG4gIGNvbnN0IHBsZW5ndGggPSBwb2ludHMubGVuZ3RoO1xuICBjb25zdCBzbGVuZ3RoID0gc2NhbGFycy5sZW5ndGg7XG4gIGlmIChwbGVuZ3RoICE9PSBzbGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ2FycmF5cyBvZiBwb2ludHMgYW5kIHNjYWxhcnMgbXVzdCBoYXZlIGVxdWFsIGxlbmd0aCcpO1xuICAvLyBpZiAocGxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdhcnJheSBtdXN0IGJlIG9mIGxlbmd0aCA+PSAyJyk7XG4gIGNvbnN0IHplcm8gPSBjLlpFUk87XG4gIGNvbnN0IHdiaXRzID0gYml0TGVuKEJpZ0ludChwbGVuZ3RoKSk7XG4gIGxldCB3aW5kb3dTaXplID0gMTsgLy8gYml0c1xuICBpZiAod2JpdHMgPiAxMikgd2luZG93U2l6ZSA9IHdiaXRzIC0gMztcbiAgZWxzZSBpZiAod2JpdHMgPiA0KSB3aW5kb3dTaXplID0gd2JpdHMgLSAyO1xuICBlbHNlIGlmICh3Yml0cyA+IDApIHdpbmRvd1NpemUgPSAyO1xuICBjb25zdCBNQVNLID0gYml0TWFzayh3aW5kb3dTaXplKTtcbiAgY29uc3QgYnVja2V0cyA9IG5ldyBBcnJheShOdW1iZXIoTUFTSykgKyAxKS5maWxsKHplcm8pOyAvLyArMSBmb3IgemVybyBhcnJheVxuICBjb25zdCBsYXN0Qml0cyA9IE1hdGguZmxvb3IoKGZpZWxkTi5CSVRTIC0gMSkgLyB3aW5kb3dTaXplKSAqIHdpbmRvd1NpemU7XG4gIGxldCBzdW0gPSB6ZXJvO1xuICBmb3IgKGxldCBpID0gbGFzdEJpdHM7IGkgPj0gMDsgaSAtPSB3aW5kb3dTaXplKSB7XG4gICAgYnVja2V0cy5maWxsKHplcm8pO1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgc2xlbmd0aDsgaisrKSB7XG4gICAgICBjb25zdCBzY2FsYXIgPSBzY2FsYXJzW2pdO1xuICAgICAgY29uc3Qgd2JpdHMgPSBOdW1iZXIoKHNjYWxhciA+PiBCaWdJbnQoaSkpICYgTUFTSyk7XG4gICAgICBidWNrZXRzW3diaXRzXSA9IGJ1Y2tldHNbd2JpdHNdLmFkZChwb2ludHNbal0pO1xuICAgIH1cbiAgICBsZXQgcmVzSSA9IHplcm87IC8vIG5vdCB1c2luZyB0aGlzIHdpbGwgZG8gc21hbGwgc3BlZWQtdXAsIGJ1dCB3aWxsIGxvc2UgY3RcbiAgICAvLyBTa2lwIGZpcnN0IGJ1Y2tldCwgYmVjYXVzZSBpdCBpcyB6ZXJvXG4gICAgZm9yIChsZXQgaiA9IGJ1Y2tldHMubGVuZ3RoIC0gMSwgc3VtSSA9IHplcm87IGogPiAwOyBqLS0pIHtcbiAgICAgIHN1bUkgPSBzdW1JLmFkZChidWNrZXRzW2pdKTtcbiAgICAgIHJlc0kgPSByZXNJLmFkZChzdW1JKTtcbiAgICB9XG4gICAgc3VtID0gc3VtLmFkZChyZXNJKTtcbiAgICBpZiAoaSAhPT0gMCkgZm9yIChsZXQgaiA9IDA7IGogPCB3aW5kb3dTaXplOyBqKyspIHN1bSA9IHN1bS5kb3VibGUoKTtcbiAgfVxuICByZXR1cm4gc3VtIGFzIFA7XG59XG4vKipcbiAqIFByZWNvbXB1dGVkIG11bHRpLXNjYWxhciBtdWx0aXBsaWNhdGlvbiAoTVNNLCBQYSArIFFiICsgUmMgKyAuLi4pLlxuICogQHBhcmFtIGMgQ3VydmUgUG9pbnQgY29uc3RydWN0b3JcbiAqIEBwYXJhbSBmaWVsZE4gZmllbGQgb3ZlciBDVVJWRS5OIC0gaW1wb3J0YW50IHRoYXQgaXQncyBub3Qgb3ZlciBDVVJWRS5QXG4gKiBAcGFyYW0gcG9pbnRzIGFycmF5IG9mIEwgY3VydmUgcG9pbnRzXG4gKiBAcmV0dXJucyBmdW5jdGlvbiB3aGljaCBtdWx0aXBsaWVzIHBvaW50cyB3aXRoIHNjYWFyc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcHJlY29tcHV0ZU1TTVVuc2FmZTxQIGV4dGVuZHMgQ3VydmVQb2ludDxhbnksIFA+LCBQQyBleHRlbmRzIEN1cnZlUG9pbnRDb25zPFA+PihcbiAgYzogUEMsXG4gIHBvaW50czogUFtdLFxuICB3aW5kb3dTaXplOiBudW1iZXJcbik6IChzY2FsYXJzOiBiaWdpbnRbXSkgPT4gUCB7XG4gIC8qKlxuICAgKiBQZXJmb3JtYW5jZSBBbmFseXNpcyBvZiBXaW5kb3ctYmFzZWQgUHJlY29tcHV0YXRpb25cbiAgICpcbiAgICogQmFzZSBDYXNlICgyNTYtYml0IHNjYWxhciwgOC1iaXQgd2luZG93KTpcbiAgICogLSBTdGFuZGFyZCBwcmVjb21wdXRhdGlvbiByZXF1aXJlczpcbiAgICogICAtIDMxIGFkZGl0aW9ucyBwZXIgc2NhbGFyIFx1MDBENyAyNTYgc2NhbGFycyA9IDcsOTM2IG9wc1xuICAgKiAgIC0gUGx1cyAyNTUgc3VtbWFyeSBhZGRpdGlvbnMgPSA4LDE5MSB0b3RhbCBvcHNcbiAgICogICBOb3RlOiBTdW1tYXJ5IGFkZGl0aW9ucyBjYW4gYmUgb3B0aW1pemVkIHZpYSBhY2N1bXVsYXRvclxuICAgKlxuICAgKiBDaHVua2VkIFByZWNvbXB1dGF0aW9uIEFuYWx5c2lzOlxuICAgKiAtIFVzaW5nIDMyIGNodW5rcyByZXF1aXJlczpcbiAgICogICAtIDI1NSBhZGRpdGlvbnMgcGVyIGNodW5rXG4gICAqICAgLSAyNTYgZG91YmxpbmdzXG4gICAqICAgLSBUb3RhbDogKDI1NSBcdTAwRDcgMzIpICsgMjU2ID0gOCw0MTYgb3BzXG4gICAqXG4gICAqIE1lbW9yeSBVc2FnZSBDb21wYXJpc29uOlxuICAgKiBXaW5kb3cgU2l6ZSB8IFN0YW5kYXJkIFBvaW50cyB8IENodW5rZWQgUG9pbnRzXG4gICAqIC0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLS1cbiAgICogICAgIDQtYml0ICAgfCAgICAgNTIwICAgICAgICAgfCAgICAgIDE1XG4gICAqICAgICA4LWJpdCAgIHwgICAgNCwyMjQgICAgICAgIHwgICAgIDI1NVxuICAgKiAgICAxMC1iaXQgICB8ICAgMTMsODI0ICAgICAgICB8ICAgMSwwMjNcbiAgICogICAgMTYtYml0ICAgfCAgNTU3LDA1NiAgICAgICAgfCAgNjUsNTM1XG4gICAqXG4gICAqIEtleSBBZHZhbnRhZ2VzOlxuICAgKiAxLiBFbmFibGVzIGxhcmdlciB3aW5kb3cgc2l6ZXMgZHVlIHRvIHJlZHVjZWQgbWVtb3J5IG92ZXJoZWFkXG4gICAqIDIuIE1vcmUgZWZmaWNpZW50IGZvciBzbWFsbGVyIHNjYWxhciBjb3VudHM6XG4gICAqICAgIC0gMTYgY2h1bmtzOiAoMTYgXHUwMEQ3IDI1NSkgKyAyNTYgPSA0LDMzNiBvcHNcbiAgICogICAgLSB+MnggZmFzdGVyIHRoYW4gc3RhbmRhcmQgOCwxOTEgb3BzXG4gICAqXG4gICAqIExpbWl0YXRpb25zOlxuICAgKiAtIE5vdCBzdWl0YWJsZSBmb3IgcGxhaW4gcHJlY29tcHV0ZXMgKHJlcXVpcmVzIDI1NiBjb25zdGFudCBkb3VibGluZ3MpXG4gICAqIC0gUGVyZm9ybWFuY2UgZGVncmFkZXMgd2l0aCBsYXJnZXIgc2NhbGFyIGNvdW50czpcbiAgICogICAtIE9wdGltYWwgZm9yIH4yNTYgc2NhbGFyc1xuICAgKiAgIC0gTGVzcyBlZmZpY2llbnQgZm9yIDQwOTYrIHNjYWxhcnMgKFBpcHBlbmdlciBwcmVmZXJyZWQpXG4gICAqL1xuICBjb25zdCBmaWVsZE4gPSBjLkZuO1xuICB2YWxpZGF0ZVcod2luZG93U2l6ZSwgZmllbGROLkJJVFMpO1xuICB2YWxpZGF0ZU1TTVBvaW50cyhwb2ludHMsIGMpO1xuICBjb25zdCB6ZXJvID0gYy5aRVJPO1xuICBjb25zdCB0YWJsZVNpemUgPSAyICoqIHdpbmRvd1NpemUgLSAxOyAvLyB0YWJsZSBzaXplICh3aXRob3V0IHplcm8pXG4gIGNvbnN0IGNodW5rcyA9IE1hdGguY2VpbChmaWVsZE4uQklUUyAvIHdpbmRvd1NpemUpOyAvLyBjaHVua3Mgb2YgaXRlbVxuICBjb25zdCBNQVNLID0gYml0TWFzayh3aW5kb3dTaXplKTtcbiAgY29uc3QgdGFibGVzID0gcG9pbnRzLm1hcCgocDogUCkgPT4ge1xuICAgIGNvbnN0IHJlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwLCBhY2MgPSBwOyBpIDwgdGFibGVTaXplOyBpKyspIHtcbiAgICAgIHJlcy5wdXNoKGFjYyk7XG4gICAgICBhY2MgPSBhY2MuYWRkKHApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9KTtcbiAgcmV0dXJuIChzY2FsYXJzOiBiaWdpbnRbXSk6IFAgPT4ge1xuICAgIHZhbGlkYXRlTVNNU2NhbGFycyhzY2FsYXJzLCBmaWVsZE4pO1xuICAgIGlmIChzY2FsYXJzLmxlbmd0aCA+IHBvaW50cy5sZW5ndGgpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FycmF5IG9mIHNjYWxhcnMgbXVzdCBiZSBzbWFsbGVyIHRoYW4gYXJyYXkgb2YgcG9pbnRzJyk7XG4gICAgbGV0IHJlcyA9IHplcm87XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaHVua3M7IGkrKykge1xuICAgICAgLy8gTm8gbmVlZCB0byBkb3VibGUgaWYgYWNjdW11bGF0b3IgaXMgc3RpbGwgemVyby5cbiAgICAgIGlmIChyZXMgIT09IHplcm8pIGZvciAobGV0IGogPSAwOyBqIDwgd2luZG93U2l6ZTsgaisrKSByZXMgPSByZXMuZG91YmxlKCk7XG4gICAgICBjb25zdCBzaGlmdEJ5ID0gQmlnSW50KGNodW5rcyAqIHdpbmRvd1NpemUgLSAoaSArIDEpICogd2luZG93U2l6ZSk7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNjYWxhcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3QgbiA9IHNjYWxhcnNbal07XG4gICAgICAgIGNvbnN0IGN1cnIgPSBOdW1iZXIoKG4gPj4gc2hpZnRCeSkgJiBNQVNLKTtcbiAgICAgICAgaWYgKCFjdXJyKSBjb250aW51ZTsgLy8gc2tpcCB6ZXJvIHNjYWxhcnMgY2h1bmtzXG4gICAgICAgIHJlcyA9IHJlcy5hZGQodGFibGVzW2pdW2N1cnIgLSAxXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIFZhbGlkQ3VydmVQYXJhbXM8VD4gPSB7XG4gIHA6IGJpZ2ludDtcbiAgbjogYmlnaW50O1xuICBoOiBiaWdpbnQ7XG4gIGE6IFQ7XG4gIGI/OiBUO1xuICBkPzogVDtcbiAgR3g6IFQ7XG4gIEd5OiBUO1xufTtcblxuZnVuY3Rpb24gY3JlYXRlRmllbGQ8VD4ob3JkZXI6IGJpZ2ludCwgZmllbGQ/OiBJRmllbGQ8VD4sIGlzTEU/OiBib29sZWFuKTogSUZpZWxkPFQ+IHtcbiAgaWYgKGZpZWxkKSB7XG4gICAgaWYgKGZpZWxkLk9SREVSICE9PSBvcmRlcikgdGhyb3cgbmV3IEVycm9yKCdGaWVsZC5PUkRFUiBtdXN0IG1hdGNoIG9yZGVyOiBGcCA9PSBwLCBGbiA9PSBuJyk7XG4gICAgdmFsaWRhdGVGaWVsZChmaWVsZCk7XG4gICAgcmV0dXJuIGZpZWxkO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBGaWVsZChvcmRlciwgeyBpc0xFIH0pIGFzIHVua25vd24gYXMgSUZpZWxkPFQ+O1xuICB9XG59XG5leHBvcnQgdHlwZSBGcEZuPFQ+ID0geyBGcDogSUZpZWxkPFQ+OyBGbjogSUZpZWxkPGJpZ2ludD4gfTtcblxuLyoqIFZhbGlkYXRlcyBDVVJWRSBvcHRzIGFuZCBjcmVhdGVzIGZpZWxkcyAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUN1cnZlRmllbGRzPFQ+KFxuICB0eXBlOiAnd2VpZXJzdHJhc3MnIHwgJ2Vkd2FyZHMnLFxuICBDVVJWRTogVmFsaWRDdXJ2ZVBhcmFtczxUPixcbiAgY3VydmVPcHRzOiBQYXJ0aWFsPEZwRm48VD4+ID0ge30sXG4gIEZwRm5MRT86IGJvb2xlYW5cbik6IEZwRm48VD4gJiB7IENVUlZFOiBWYWxpZEN1cnZlUGFyYW1zPFQ+IH0ge1xuICBpZiAoRnBGbkxFID09PSB1bmRlZmluZWQpIEZwRm5MRSA9IHR5cGUgPT09ICdlZHdhcmRzJztcbiAgaWYgKCFDVVJWRSB8fCB0eXBlb2YgQ1VSVkUgIT09ICdvYmplY3QnKSB0aHJvdyBuZXcgRXJyb3IoYGV4cGVjdGVkIHZhbGlkICR7dHlwZX0gQ1VSVkUgb2JqZWN0YCk7XG4gIGZvciAoY29uc3QgcCBvZiBbJ3AnLCAnbicsICdoJ10gYXMgY29uc3QpIHtcbiAgICBjb25zdCB2YWwgPSBDVVJWRVtwXTtcbiAgICBpZiAoISh0eXBlb2YgdmFsID09PSAnYmlnaW50JyAmJiB2YWwgPiBfMG4pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDVVJWRS4ke3B9IG11c3QgYmUgcG9zaXRpdmUgYmlnaW50YCk7XG4gIH1cbiAgY29uc3QgRnAgPSBjcmVhdGVGaWVsZChDVVJWRS5wLCBjdXJ2ZU9wdHMuRnAsIEZwRm5MRSk7XG4gIGNvbnN0IEZuID0gY3JlYXRlRmllbGQoQ1VSVkUubiwgY3VydmVPcHRzLkZuLCBGcEZuTEUpO1xuICBjb25zdCBfYjogJ2InIHwgJ2QnID0gdHlwZSA9PT0gJ3dlaWVyc3RyYXNzJyA/ICdiJyA6ICdkJztcbiAgY29uc3QgcGFyYW1zID0gWydHeCcsICdHeScsICdhJywgX2JdIGFzIGNvbnN0O1xuICBmb3IgKGNvbnN0IHAgb2YgcGFyYW1zKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGlmICghRnAuaXNWYWxpZChDVVJWRVtwXSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENVUlZFLiR7cH0gbXVzdCBiZSB2YWxpZCBmaWVsZCBlbGVtZW50IG9mIENVUlZFLkZwYCk7XG4gIH1cbiAgQ1VSVkUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5hc3NpZ24oe30sIENVUlZFKSk7XG4gIHJldHVybiB7IENVUlZFLCBGcCwgRm4gfTtcbn1cblxudHlwZSBLZXlnZW5GbiA9IChcbiAgc2VlZD86IFVpbnQ4QXJyYXksXG4gIGlzQ29tcHJlc3NlZD86IGJvb2xlYW5cbikgPT4geyBzZWNyZXRLZXk6IFVpbnQ4QXJyYXk7IHB1YmxpY0tleTogVWludDhBcnJheSB9O1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUtleWdlbihcbiAgcmFuZG9tU2VjcmV0S2V5OiBGdW5jdGlvbixcbiAgZ2V0UHVibGljS2V5OiBTaWduZXJbJ2dldFB1YmxpY0tleSddXG4pOiBLZXlnZW5GbiB7XG4gIHJldHVybiBmdW5jdGlvbiBrZXlnZW4oc2VlZD86IFVpbnQ4QXJyYXkpIHtcbiAgICBjb25zdCBzZWNyZXRLZXkgPSByYW5kb21TZWNyZXRLZXkoc2VlZCk7XG4gICAgcmV0dXJuIHsgc2VjcmV0S2V5LCBwdWJsaWNLZXk6IGdldFB1YmxpY0tleShzZWNyZXRLZXkpIH07XG4gIH07XG59XG4iLCAiLyoqXG4gKiBIZXgsIGJ5dGVzIGFuZCBudW1iZXIgdXRpbGl0aWVzLlxuICogQG1vZHVsZVxuICovXG4vKiEgbm9ibGUtY3VydmVzIC0gTUlUIExpY2Vuc2UgKGMpIDIwMjIgUGF1bCBNaWxsZXIgKHBhdWxtaWxsci5jb20pICovXG5pbXBvcnQge1xuICBhYnl0ZXMgYXMgYWJ5dGVzXyxcbiAgYW51bWJlcixcbiAgYnl0ZXNUb0hleCBhcyBieXRlc1RvSGV4XyxcbiAgY29uY2F0Qnl0ZXMgYXMgY29uY2F0Qnl0ZXNfLFxuICBoZXhUb0J5dGVzIGFzIGhleFRvQnl0ZXNfLFxufSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmV4cG9ydCB7XG4gIGFieXRlcyxcbiAgYW51bWJlcixcbiAgYnl0ZXNUb0hleCxcbiAgY29uY2F0Qnl0ZXMsXG4gIGhleFRvQnl0ZXMsXG4gIGlzQnl0ZXMsXG4gIHJhbmRvbUJ5dGVzLFxufSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmNvbnN0IF8wbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMCk7XG5jb25zdCBfMW4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDEpO1xuXG5leHBvcnQgdHlwZSBDSGFzaCA9IHtcbiAgKG1lc3NhZ2U6IFVpbnQ4QXJyYXkpOiBVaW50OEFycmF5O1xuICBibG9ja0xlbjogbnVtYmVyO1xuICBvdXRwdXRMZW46IG51bWJlcjtcbiAgY3JlYXRlKG9wdHM/OiB7IGRrTGVuPzogbnVtYmVyIH0pOiBhbnk7IC8vIEZvciBzaGFrZVxufTtcbmV4cG9ydCB0eXBlIEZIYXNoID0gKG1lc3NhZ2U6IFVpbnQ4QXJyYXkpID0+IFVpbnQ4QXJyYXk7XG5leHBvcnQgZnVuY3Rpb24gYWJvb2wodmFsdWU6IGJvb2xlYW4sIHRpdGxlOiBzdHJpbmcgPSAnJyk6IGJvb2xlYW4ge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnYm9vbGVhbicpIHtcbiAgICBjb25zdCBwcmVmaXggPSB0aXRsZSAmJiBgXCIke3RpdGxlfVwiIGA7XG4gICAgdGhyb3cgbmV3IEVycm9yKHByZWZpeCArICdleHBlY3RlZCBib29sZWFuLCBnb3QgdHlwZT0nICsgdHlwZW9mIHZhbHVlKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbi8vIFVzZWQgaW4gd2VpZXJzdHJhc3MsIGRlclxuZnVuY3Rpb24gYWJpZ251bWJlcihuOiBudW1iZXIgfCBiaWdpbnQpIHtcbiAgaWYgKHR5cGVvZiBuID09PSAnYmlnaW50Jykge1xuICAgIGlmICghaXNQb3NCaWcobikpIHRocm93IG5ldyBFcnJvcigncG9zaXRpdmUgYmlnaW50IGV4cGVjdGVkLCBnb3QgJyArIG4pO1xuICB9IGVsc2UgYW51bWJlcihuKTtcbiAgcmV0dXJuIG47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc2FmZW51bWJlcih2YWx1ZTogbnVtYmVyLCB0aXRsZTogc3RyaW5nID0gJycpOiB2b2lkIHtcbiAgaWYgKCFOdW1iZXIuaXNTYWZlSW50ZWdlcih2YWx1ZSkpIHtcbiAgICBjb25zdCBwcmVmaXggPSB0aXRsZSAmJiBgXCIke3RpdGxlfVwiIGA7XG4gICAgdGhyb3cgbmV3IEVycm9yKHByZWZpeCArICdleHBlY3RlZCBzYWZlIGludGVnZXIsIGdvdCB0eXBlPScgKyB0eXBlb2YgdmFsdWUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBudW1iZXJUb0hleFVucGFkZGVkKG51bTogbnVtYmVyIHwgYmlnaW50KTogc3RyaW5nIHtcbiAgY29uc3QgaGV4ID0gYWJpZ251bWJlcihudW0pLnRvU3RyaW5nKDE2KTtcbiAgcmV0dXJuIGhleC5sZW5ndGggJiAxID8gJzAnICsgaGV4IDogaGV4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGV4VG9OdW1iZXIoaGV4OiBzdHJpbmcpOiBiaWdpbnQge1xuICBpZiAodHlwZW9mIGhleCAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignaGV4IHN0cmluZyBleHBlY3RlZCwgZ290ICcgKyB0eXBlb2YgaGV4KTtcbiAgcmV0dXJuIGhleCA9PT0gJycgPyBfMG4gOiBCaWdJbnQoJzB4JyArIGhleCk7IC8vIEJpZyBFbmRpYW5cbn1cblxuLy8gQkU6IEJpZyBFbmRpYW4sIExFOiBMaXR0bGUgRW5kaWFuXG5leHBvcnQgZnVuY3Rpb24gYnl0ZXNUb051bWJlckJFKGJ5dGVzOiBVaW50OEFycmF5KTogYmlnaW50IHtcbiAgcmV0dXJuIGhleFRvTnVtYmVyKGJ5dGVzVG9IZXhfKGJ5dGVzKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gYnl0ZXNUb051bWJlckxFKGJ5dGVzOiBVaW50OEFycmF5KTogYmlnaW50IHtcbiAgcmV0dXJuIGhleFRvTnVtYmVyKGJ5dGVzVG9IZXhfKGNvcHlCeXRlcyhhYnl0ZXNfKGJ5dGVzKSkucmV2ZXJzZSgpKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBudW1iZXJUb0J5dGVzQkUobjogbnVtYmVyIHwgYmlnaW50LCBsZW46IG51bWJlcik6IFVpbnQ4QXJyYXkge1xuICBhbnVtYmVyKGxlbik7XG4gIG4gPSBhYmlnbnVtYmVyKG4pO1xuICBjb25zdCByZXMgPSBoZXhUb0J5dGVzXyhuLnRvU3RyaW5nKDE2KS5wYWRTdGFydChsZW4gKiAyLCAnMCcpKTtcbiAgaWYgKHJlcy5sZW5ndGggIT09IGxlbikgdGhyb3cgbmV3IEVycm9yKCdudW1iZXIgdG9vIGxhcmdlJyk7XG4gIHJldHVybiByZXM7XG59XG5leHBvcnQgZnVuY3Rpb24gbnVtYmVyVG9CeXRlc0xFKG46IG51bWJlciB8IGJpZ2ludCwgbGVuOiBudW1iZXIpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIG51bWJlclRvQnl0ZXNCRShuLCBsZW4pLnJldmVyc2UoKTtcbn1cbi8vIFVucGFkZGVkLCByYXJlbHkgdXNlZFxuZXhwb3J0IGZ1bmN0aW9uIG51bWJlclRvVmFyQnl0ZXNCRShuOiBudW1iZXIgfCBiaWdpbnQpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIGhleFRvQnl0ZXNfKG51bWJlclRvSGV4VW5wYWRkZWQoYWJpZ251bWJlcihuKSkpO1xufVxuXG4vLyBDb21wYXJlcyAyIHU4YS1zIGluIGtpbmRhIGNvbnN0YW50IHRpbWVcbmV4cG9ydCBmdW5jdGlvbiBlcXVhbEJ5dGVzKGE6IFVpbnQ4QXJyYXksIGI6IFVpbnQ4QXJyYXkpOiBib29sZWFuIHtcbiAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICBsZXQgZGlmZiA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykgZGlmZiB8PSBhW2ldIF4gYltpXTtcbiAgcmV0dXJuIGRpZmYgPT09IDA7XG59XG5cbi8qKlxuICogQ29waWVzIFVpbnQ4QXJyYXkuIFdlIGNhbid0IHVzZSB1OGEuc2xpY2UoKSwgYmVjYXVzZSB1OGEgY2FuIGJlIEJ1ZmZlcixcbiAqIGFuZCBCdWZmZXIjc2xpY2UgY3JlYXRlcyBtdXRhYmxlIGNvcHkuIE5ldmVyIHVzZSBCdWZmZXJzIVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weUJ5dGVzKGJ5dGVzOiBVaW50OEFycmF5KTogVWludDhBcnJheSB7XG4gIHJldHVybiBVaW50OEFycmF5LmZyb20oYnl0ZXMpO1xufVxuXG4vKipcbiAqIERlY29kZXMgNy1iaXQgQVNDSUkgc3RyaW5nIHRvIFVpbnQ4QXJyYXksIHRocm93cyBvbiBub24tYXNjaWkgc3ltYm9sc1xuICogU2hvdWxkIGJlIHNhZmUgdG8gdXNlIGZvciB0aGluZ3MgZXhwZWN0ZWQgdG8gYmUgQVNDSUkuXG4gKiBSZXR1cm5zIGV4YWN0IHNhbWUgcmVzdWx0IGFzIGBUZXh0RW5jb2RlcmAgZm9yIEFTQ0lJIG9yIHRocm93cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzY2lpVG9CeXRlcyhhc2NpaTogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIHJldHVybiBVaW50OEFycmF5LmZyb20oYXNjaWksIChjLCBpKSA9PiB7XG4gICAgY29uc3QgY2hhckNvZGUgPSBjLmNoYXJDb2RlQXQoMCk7XG4gICAgaWYgKGMubGVuZ3RoICE9PSAxIHx8IGNoYXJDb2RlID4gMTI3KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBzdHJpbmcgY29udGFpbnMgbm9uLUFTQ0lJIGNoYXJhY3RlciBcIiR7YXNjaWlbaV19XCIgd2l0aCBjb2RlICR7Y2hhckNvZGV9IGF0IHBvc2l0aW9uICR7aX1gXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gY2hhckNvZGU7XG4gIH0pO1xufVxuXG4vLyBJcyBwb3NpdGl2ZSBiaWdpbnRcbmNvbnN0IGlzUG9zQmlnID0gKG46IGJpZ2ludCkgPT4gdHlwZW9mIG4gPT09ICdiaWdpbnQnICYmIF8wbiA8PSBuO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5SYW5nZShuOiBiaWdpbnQsIG1pbjogYmlnaW50LCBtYXg6IGJpZ2ludCk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNQb3NCaWcobikgJiYgaXNQb3NCaWcobWluKSAmJiBpc1Bvc0JpZyhtYXgpICYmIG1pbiA8PSBuICYmIG4gPCBtYXg7XG59XG5cbi8qKlxuICogQXNzZXJ0cyBtaW4gPD0gbiA8IG1heC4gTk9URTogSXQncyA8IG1heCBhbmQgbm90IDw9IG1heC5cbiAqIEBleGFtcGxlXG4gKiBhSW5SYW5nZSgneCcsIHgsIDFuLCAyNTZuKTsgLy8gd291bGQgYXNzdW1lIHggaXMgaW4gKDFuLi4yNTVuKVxuICovXG5leHBvcnQgZnVuY3Rpb24gYUluUmFuZ2UodGl0bGU6IHN0cmluZywgbjogYmlnaW50LCBtaW46IGJpZ2ludCwgbWF4OiBiaWdpbnQpOiB2b2lkIHtcbiAgLy8gV2h5IG1pbiA8PSBuIDwgbWF4IGFuZCBub3QgYSAobWluIDwgbiA8IG1heCkgT1IgYiAobWluIDw9IG4gPD0gbWF4KT9cbiAgLy8gY29uc2lkZXIgUD0yNTZuLCBtaW49MG4sIG1heD1QXG4gIC8vIC0gYSBmb3IgbWluPTAgd291bGQgcmVxdWlyZSAtMTogICAgICAgICAgYGluUmFuZ2UoJ3gnLCB4LCAtMW4sIFApYFxuICAvLyAtIGIgd291bGQgY29tbW9ubHkgcmVxdWlyZSBzdWJ0cmFjdGlvbjogIGBpblJhbmdlKCd4JywgeCwgMG4sIFAgLSAxbilgXG4gIC8vIC0gb3VyIHdheSBpcyB0aGUgY2xlYW5lc3Q6ICAgICAgICAgICAgICAgYGluUmFuZ2UoJ3gnLCB4LCAwbiwgUClcbiAgaWYgKCFpblJhbmdlKG4sIG1pbiwgbWF4KSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2V4cGVjdGVkIHZhbGlkICcgKyB0aXRsZSArICc6ICcgKyBtaW4gKyAnIDw9IG4gPCAnICsgbWF4ICsgJywgZ290ICcgKyBuKTtcbn1cblxuLy8gQml0IG9wZXJhdGlvbnNcblxuLyoqXG4gKiBDYWxjdWxhdGVzIGFtb3VudCBvZiBiaXRzIGluIGEgYmlnaW50LlxuICogU2FtZSBhcyBgbi50b1N0cmluZygyKS5sZW5ndGhgXG4gKiBUT0RPOiBtZXJnZSB3aXRoIG5MZW5ndGggaW4gbW9kdWxhclxuICovXG5leHBvcnQgZnVuY3Rpb24gYml0TGVuKG46IGJpZ2ludCk6IG51bWJlciB7XG4gIGxldCBsZW47XG4gIGZvciAobGVuID0gMDsgbiA+IF8wbjsgbiA+Pj0gXzFuLCBsZW4gKz0gMSk7XG4gIHJldHVybiBsZW47XG59XG5cbi8qKlxuICogR2V0cyBzaW5nbGUgYml0IGF0IHBvc2l0aW9uLlxuICogTk9URTogZmlyc3QgYml0IHBvc2l0aW9uIGlzIDAgKHNhbWUgYXMgYXJyYXlzKVxuICogU2FtZSBhcyBgISErQXJyYXkuZnJvbShuLnRvU3RyaW5nKDIpKS5yZXZlcnNlKClbcG9zXWBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpdEdldChuOiBiaWdpbnQsIHBvczogbnVtYmVyKTogYmlnaW50IHtcbiAgcmV0dXJuIChuID4+IEJpZ0ludChwb3MpKSAmIF8xbjtcbn1cblxuLyoqXG4gKiBTZXRzIHNpbmdsZSBiaXQgYXQgcG9zaXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaXRTZXQobjogYmlnaW50LCBwb3M6IG51bWJlciwgdmFsdWU6IGJvb2xlYW4pOiBiaWdpbnQge1xuICByZXR1cm4gbiB8ICgodmFsdWUgPyBfMW4gOiBfMG4pIDw8IEJpZ0ludChwb3MpKTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgbWFzayBmb3IgTiBiaXRzLiBOb3QgdXNpbmcgKiogb3BlcmF0b3Igd2l0aCBiaWdpbnRzIGJlY2F1c2Ugb2Ygb2xkIGVuZ2luZXMuXG4gKiBTYW1lIGFzIEJpZ0ludChgMGIke0FycmF5KGkpLmZpbGwoJzEnKS5qb2luKCcnKX1gKVxuICovXG5leHBvcnQgY29uc3QgYml0TWFzayA9IChuOiBudW1iZXIpOiBiaWdpbnQgPT4gKF8xbiA8PCBCaWdJbnQobikpIC0gXzFuO1xuXG4vLyBEUkJHXG5cbnR5cGUgUHJlZDxUPiA9ICh2OiBVaW50OEFycmF5KSA9PiBUIHwgdW5kZWZpbmVkO1xuLyoqXG4gKiBNaW5pbWFsIEhNQUMtRFJCRyBmcm9tIE5JU1QgODAwLTkwIGZvciBSRkM2OTc5IHNpZ3MuXG4gKiBAcmV0dXJucyBmdW5jdGlvbiB0aGF0IHdpbGwgY2FsbCBEUkJHIHVudGlsIDJuZCBhcmcgcmV0dXJucyBzb21ldGhpbmcgbWVhbmluZ2Z1bFxuICogQGV4YW1wbGVcbiAqICAgY29uc3QgZHJiZyA9IGNyZWF0ZUhtYWNEUkJHPEtleT4oMzIsIDMyLCBobWFjKTtcbiAqICAgZHJiZyhzZWVkLCBieXRlc1RvS2V5KTsgLy8gYnl0ZXNUb0tleSBtdXN0IHJldHVybiBLZXkgb3IgdW5kZWZpbmVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIbWFjRHJiZzxUPihcbiAgaGFzaExlbjogbnVtYmVyLFxuICBxQnl0ZUxlbjogbnVtYmVyLFxuICBobWFjRm46IChrZXk6IFVpbnQ4QXJyYXksIG1lc3NhZ2U6IFVpbnQ4QXJyYXkpID0+IFVpbnQ4QXJyYXlcbik6IChzZWVkOiBVaW50OEFycmF5LCBwcmVkaWNhdGU6IFByZWQ8VD4pID0+IFQge1xuICBhbnVtYmVyKGhhc2hMZW4sICdoYXNoTGVuJyk7XG4gIGFudW1iZXIocUJ5dGVMZW4sICdxQnl0ZUxlbicpO1xuICBpZiAodHlwZW9mIGhtYWNGbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IEVycm9yKCdobWFjRm4gbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gIGNvbnN0IHU4biA9IChsZW46IG51bWJlcik6IFVpbnQ4QXJyYXkgPT4gbmV3IFVpbnQ4QXJyYXkobGVuKTsgLy8gY3JlYXRlcyBVaW50OEFycmF5XG4gIGNvbnN0IE5VTEwgPSBVaW50OEFycmF5Lm9mKCk7XG4gIGNvbnN0IGJ5dGUwID0gVWludDhBcnJheS5vZigweDAwKTtcbiAgY29uc3QgYnl0ZTEgPSBVaW50OEFycmF5Lm9mKDB4MDEpO1xuICBjb25zdCBfbWF4RHJiZ0l0ZXJzID0gMTAwMDtcblxuICAvLyBTdGVwIEIsIFN0ZXAgQzogc2V0IGhhc2hMZW4gdG8gOCpjZWlsKGhsZW4vOClcbiAgbGV0IHYgPSB1OG4oaGFzaExlbik7IC8vIE1pbmltYWwgbm9uLWZ1bGwtc3BlYyBITUFDLURSQkcgZnJvbSBOSVNUIDgwMC05MCBmb3IgUkZDNjk3OSBzaWdzLlxuICBsZXQgayA9IHU4bihoYXNoTGVuKTsgLy8gU3RlcHMgQiBhbmQgQyBvZiBSRkM2OTc5IDMuMjogc2V0IGhhc2hMZW4sIGluIG91ciBjYXNlIGFsd2F5cyBzYW1lXG4gIGxldCBpID0gMDsgLy8gSXRlcmF0aW9ucyBjb3VudGVyLCB3aWxsIHRocm93IHdoZW4gb3ZlciAxMDAwXG4gIGNvbnN0IHJlc2V0ID0gKCkgPT4ge1xuICAgIHYuZmlsbCgxKTtcbiAgICBrLmZpbGwoMCk7XG4gICAgaSA9IDA7XG4gIH07XG4gIGNvbnN0IGggPSAoLi4ubXNnczogVWludDhBcnJheVtdKSA9PiBobWFjRm4oaywgY29uY2F0Qnl0ZXNfKHYsIC4uLm1zZ3MpKTsgLy8gaG1hYyhrKSh2LCAuLi52YWx1ZXMpXG4gIGNvbnN0IHJlc2VlZCA9IChzZWVkOiBVaW50OEFycmF5ID0gTlVMTCkgPT4ge1xuICAgIC8vIEhNQUMtRFJCRyByZXNlZWQoKSBmdW5jdGlvbi4gU3RlcHMgRC1HXG4gICAgayA9IGgoYnl0ZTAsIHNlZWQpOyAvLyBrID0gaG1hYyhrIHx8IHYgfHwgMHgwMCB8fCBzZWVkKVxuICAgIHYgPSBoKCk7IC8vIHYgPSBobWFjKGsgfHwgdilcbiAgICBpZiAoc2VlZC5sZW5ndGggPT09IDApIHJldHVybjtcbiAgICBrID0gaChieXRlMSwgc2VlZCk7IC8vIGsgPSBobWFjKGsgfHwgdiB8fCAweDAxIHx8IHNlZWQpXG4gICAgdiA9IGgoKTsgLy8gdiA9IGhtYWMoayB8fCB2KVxuICB9O1xuICBjb25zdCBnZW4gPSAoKSA9PiB7XG4gICAgLy8gSE1BQy1EUkJHIGdlbmVyYXRlKCkgZnVuY3Rpb25cbiAgICBpZiAoaSsrID49IF9tYXhEcmJnSXRlcnMpIHRocm93IG5ldyBFcnJvcignZHJiZzogdHJpZWQgbWF4IGFtb3VudCBvZiBpdGVyYXRpb25zJyk7XG4gICAgbGV0IGxlbiA9IDA7XG4gICAgY29uc3Qgb3V0OiBVaW50OEFycmF5W10gPSBbXTtcbiAgICB3aGlsZSAobGVuIDwgcUJ5dGVMZW4pIHtcbiAgICAgIHYgPSBoKCk7XG4gICAgICBjb25zdCBzbCA9IHYuc2xpY2UoKTtcbiAgICAgIG91dC5wdXNoKHNsKTtcbiAgICAgIGxlbiArPSB2Lmxlbmd0aDtcbiAgICB9XG4gICAgcmV0dXJuIGNvbmNhdEJ5dGVzXyguLi5vdXQpO1xuICB9O1xuICBjb25zdCBnZW5VbnRpbCA9IChzZWVkOiBVaW50OEFycmF5LCBwcmVkOiBQcmVkPFQ+KTogVCA9PiB7XG4gICAgcmVzZXQoKTtcbiAgICByZXNlZWQoc2VlZCk7IC8vIFN0ZXBzIEQtR1xuICAgIGxldCByZXM6IFQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7IC8vIFN0ZXAgSDogZ3JpbmQgdW50aWwgayBpcyBpbiBbMS4ubi0xXVxuICAgIHdoaWxlICghKHJlcyA9IHByZWQoZ2VuKCkpKSkgcmVzZWVkKCk7XG4gICAgcmVzZXQoKTtcbiAgICByZXR1cm4gcmVzO1xuICB9O1xuICByZXR1cm4gZ2VuVW50aWw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZU9iamVjdChcbiAgb2JqZWN0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+LFxuICBmaWVsZHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fSxcbiAgb3B0RmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge31cbik6IHZvaWQge1xuICBpZiAoIW9iamVjdCB8fCB0eXBlb2Ygb2JqZWN0ICE9PSAnb2JqZWN0JykgdGhyb3cgbmV3IEVycm9yKCdleHBlY3RlZCB2YWxpZCBvcHRpb25zIG9iamVjdCcpO1xuICB0eXBlIEl0ZW0gPSBrZXlvZiB0eXBlb2Ygb2JqZWN0O1xuICBmdW5jdGlvbiBjaGVja0ZpZWxkKGZpZWxkTmFtZTogSXRlbSwgZXhwZWN0ZWRUeXBlOiBzdHJpbmcsIGlzT3B0OiBib29sZWFuKSB7XG4gICAgY29uc3QgdmFsID0gb2JqZWN0W2ZpZWxkTmFtZV07XG4gICAgaWYgKGlzT3B0ICYmIHZhbCA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgY29uc3QgY3VycmVudCA9IHR5cGVvZiB2YWw7XG4gICAgaWYgKGN1cnJlbnQgIT09IGV4cGVjdGVkVHlwZSB8fCB2YWwgPT09IG51bGwpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHBhcmFtIFwiJHtmaWVsZE5hbWV9XCIgaXMgaW52YWxpZDogZXhwZWN0ZWQgJHtleHBlY3RlZFR5cGV9LCBnb3QgJHtjdXJyZW50fWApO1xuICB9XG4gIGNvbnN0IGl0ZXIgPSAoZjogdHlwZW9mIGZpZWxkcywgaXNPcHQ6IGJvb2xlYW4pID0+XG4gICAgT2JqZWN0LmVudHJpZXMoZikuZm9yRWFjaCgoW2ssIHZdKSA9PiBjaGVja0ZpZWxkKGssIHYsIGlzT3B0KSk7XG4gIGl0ZXIoZmllbGRzLCBmYWxzZSk7XG4gIGl0ZXIob3B0RmllbGRzLCB0cnVlKTtcbn1cblxuLyoqXG4gKiB0aHJvd3Mgbm90IGltcGxlbWVudGVkIGVycm9yXG4gKi9cbmV4cG9ydCBjb25zdCBub3RJbXBsZW1lbnRlZCA9ICgpOiBuZXZlciA9PiB7XG4gIHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7XG59O1xuXG4vKipcbiAqIE1lbW9pemVzIChjYWNoZXMpIGNvbXB1dGF0aW9uIHJlc3VsdC5cbiAqIFVzZXMgV2Vha01hcDogdGhlIHZhbHVlIGlzIGdvaW5nIGF1dG8tY2xlYW5lZCBieSBHQyBhZnRlciBsYXN0IHJlZmVyZW5jZSBpcyByZW1vdmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVtb2l6ZWQ8VCBleHRlbmRzIG9iamVjdCwgUiwgTyBleHRlbmRzIGFueVtdPihcbiAgZm46IChhcmc6IFQsIC4uLmFyZ3M6IE8pID0+IFJcbik6IChhcmc6IFQsIC4uLmFyZ3M6IE8pID0+IFIge1xuICBjb25zdCBtYXAgPSBuZXcgV2Vha01hcDxULCBSPigpO1xuICByZXR1cm4gKGFyZzogVCwgLi4uYXJnczogTyk6IFIgPT4ge1xuICAgIGNvbnN0IHZhbCA9IG1hcC5nZXQoYXJnKTtcbiAgICBpZiAodmFsICE9PSB1bmRlZmluZWQpIHJldHVybiB2YWw7XG4gICAgY29uc3QgY29tcHV0ZWQgPSBmbihhcmcsIC4uLmFyZ3MpO1xuICAgIG1hcC5zZXQoYXJnLCBjb21wdXRlZCk7XG4gICAgcmV0dXJuIGNvbXB1dGVkO1xuICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENyeXB0b0tleXMge1xuICBsZW5ndGhzOiB7IHNlZWQ/OiBudW1iZXI7IHB1YmxpYz86IG51bWJlcjsgc2VjcmV0PzogbnVtYmVyIH07XG4gIGtleWdlbjogKHNlZWQ/OiBVaW50OEFycmF5KSA9PiB7IHNlY3JldEtleTogVWludDhBcnJheTsgcHVibGljS2V5OiBVaW50OEFycmF5IH07XG4gIGdldFB1YmxpY0tleTogKHNlY3JldEtleTogVWludDhBcnJheSkgPT4gVWludDhBcnJheTtcbn1cblxuLyoqIEdlbmVyaWMgaW50ZXJmYWNlIGZvciBzaWduYXR1cmVzLiBIYXMga2V5Z2VuLCBzaWduIGFuZCB2ZXJpZnkuICovXG5leHBvcnQgaW50ZXJmYWNlIFNpZ25lciBleHRlbmRzIENyeXB0b0tleXMge1xuICAvLyBJbnRlcmZhY2VzIGFyZSBmdW4uIFdlIGNhbm5vdCBqdXN0IGFkZCBuZXcgZmllbGRzIHdpdGhvdXQgY29weWluZyBvbGQgb25lcy5cbiAgbGVuZ3Roczoge1xuICAgIHNlZWQ/OiBudW1iZXI7XG4gICAgcHVibGljPzogbnVtYmVyO1xuICAgIHNlY3JldD86IG51bWJlcjtcbiAgICBzaWduUmFuZD86IG51bWJlcjtcbiAgICBzaWduYXR1cmU/OiBudW1iZXI7XG4gIH07XG4gIHNpZ246IChtc2c6IFVpbnQ4QXJyYXksIHNlY3JldEtleTogVWludDhBcnJheSkgPT4gVWludDhBcnJheTtcbiAgdmVyaWZ5OiAoc2lnOiBVaW50OEFycmF5LCBtc2c6IFVpbnQ4QXJyYXksIHB1YmxpY0tleTogVWludDhBcnJheSkgPT4gYm9vbGVhbjtcbn1cbiIsICIvKipcbiAqIFV0aWxzIGZvciBtb2R1bGFyIGRpdmlzaW9uIGFuZCBmaWVsZHMuXG4gKiBGaWVsZCBvdmVyIDExIGlzIGEgZmluaXRlIChHYWxvaXMpIGZpZWxkIGlzIGludGVnZXIgbnVtYmVyIG9wZXJhdGlvbnMgYG1vZCAxMWAuXG4gKiBUaGVyZSBpcyBubyBkaXZpc2lvbjogaXQgaXMgcmVwbGFjZWQgYnkgbW9kdWxhciBtdWx0aXBsaWNhdGl2ZSBpbnZlcnNlLlxuICogQG1vZHVsZVxuICovXG4vKiEgbm9ibGUtY3VydmVzIC0gTUlUIExpY2Vuc2UgKGMpIDIwMjIgUGF1bCBNaWxsZXIgKHBhdWxtaWxsci5jb20pICovXG5pbXBvcnQge1xuICBhYnl0ZXMsXG4gIGFudW1iZXIsXG4gIGJ5dGVzVG9OdW1iZXJCRSxcbiAgYnl0ZXNUb051bWJlckxFLFxuICBudW1iZXJUb0J5dGVzQkUsXG4gIG51bWJlclRvQnl0ZXNMRSxcbiAgdmFsaWRhdGVPYmplY3QsXG59IGZyb20gJy4uL3V0aWxzLnRzJztcblxuLy8gTnVtYmVycyBhcmVuJ3QgdXNlZCBpbiB4MjU1MTkgLyB4NDQ4IGJ1aWxkc1xuLy8gcHJldHRpZXItaWdub3JlXG5jb25zdCBfMG4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDApLCBfMW4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDEpLCBfMm4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDIpO1xuLy8gcHJldHRpZXItaWdub3JlXG5jb25zdCBfM24gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDMpLCBfNG4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDQpLCBfNW4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDUpO1xuLy8gcHJldHRpZXItaWdub3JlXG5jb25zdCBfN24gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDcpLCBfOG4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDgpLCBfOW4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDkpO1xuY29uc3QgXzE2biA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMTYpO1xuXG4vLyBDYWxjdWxhdGVzIGEgbW9kdWxvIGJcbmV4cG9ydCBmdW5jdGlvbiBtb2QoYTogYmlnaW50LCBiOiBiaWdpbnQpOiBiaWdpbnQge1xuICBjb25zdCByZXN1bHQgPSBhICUgYjtcbiAgcmV0dXJuIHJlc3VsdCA+PSBfMG4gPyByZXN1bHQgOiBiICsgcmVzdWx0O1xufVxuLyoqXG4gKiBFZmZpY2llbnRseSByYWlzZSBudW0gdG8gcG93ZXIgYW5kIGRvIG1vZHVsYXIgZGl2aXNpb24uXG4gKiBVbnNhZmUgaW4gc29tZSBjb250ZXh0czogdXNlcyBsYWRkZXIsIHNvIGNhbiBleHBvc2UgYmlnaW50IGJpdHMuXG4gKiBAZXhhbXBsZVxuICogcG93KDJuLCA2biwgMTFuKSAvLyA2NG4gJSAxMW4gPT0gOW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBvdyhudW06IGJpZ2ludCwgcG93ZXI6IGJpZ2ludCwgbW9kdWxvOiBiaWdpbnQpOiBiaWdpbnQge1xuICByZXR1cm4gRnBQb3coRmllbGQobW9kdWxvKSwgbnVtLCBwb3dlcik7XG59XG5cbi8qKiBEb2VzIGB4XigyXnBvd2VyKWAgbW9kIHAuIGBwb3cyKDMwLCA0KWAgPT0gYDMwXigyXjQpYCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBvdzIoeDogYmlnaW50LCBwb3dlcjogYmlnaW50LCBtb2R1bG86IGJpZ2ludCk6IGJpZ2ludCB7XG4gIGxldCByZXMgPSB4O1xuICB3aGlsZSAocG93ZXItLSA+IF8wbikge1xuICAgIHJlcyAqPSByZXM7XG4gICAgcmVzICU9IG1vZHVsbztcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIEludmVyc2VzIG51bWJlciBvdmVyIG1vZHVsby5cbiAqIEltcGxlbWVudGVkIHVzaW5nIFtFdWNsaWRlYW4gR0NEXShodHRwczovL2JyaWxsaWFudC5vcmcvd2lraS9leHRlbmRlZC1ldWNsaWRlYW4tYWxnb3JpdGhtLykuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQobnVtYmVyOiBiaWdpbnQsIG1vZHVsbzogYmlnaW50KTogYmlnaW50IHtcbiAgaWYgKG51bWJlciA9PT0gXzBuKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmVydDogZXhwZWN0ZWQgbm9uLXplcm8gbnVtYmVyJyk7XG4gIGlmIChtb2R1bG8gPD0gXzBuKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmVydDogZXhwZWN0ZWQgcG9zaXRpdmUgbW9kdWx1cywgZ290ICcgKyBtb2R1bG8pO1xuICAvLyBGZXJtYXQncyBsaXR0bGUgdGhlb3JlbSBcIkNULWxpa2VcIiB2ZXJzaW9uIGludihuKSA9IG5eKG0tMikgbW9kIG0gaXMgMzB4IHNsb3dlci5cbiAgbGV0IGEgPSBtb2QobnVtYmVyLCBtb2R1bG8pO1xuICBsZXQgYiA9IG1vZHVsbztcbiAgLy8gcHJldHRpZXItaWdub3JlXG4gIGxldCB4ID0gXzBuLCB5ID0gXzFuLCB1ID0gXzFuLCB2ID0gXzBuO1xuICB3aGlsZSAoYSAhPT0gXzBuKSB7XG4gICAgLy8gSklUIGFwcGxpZXMgb3B0aW1pemF0aW9uIGlmIHRob3NlIHR3byBsaW5lcyBmb2xsb3cgZWFjaCBvdGhlclxuICAgIGNvbnN0IHEgPSBiIC8gYTtcbiAgICBjb25zdCByID0gYiAlIGE7XG4gICAgY29uc3QgbSA9IHggLSB1ICogcTtcbiAgICBjb25zdCBuID0geSAtIHYgKiBxO1xuICAgIC8vIHByZXR0aWVyLWlnbm9yZVxuICAgIGIgPSBhLCBhID0gciwgeCA9IHUsIHkgPSB2LCB1ID0gbSwgdiA9IG47XG4gIH1cbiAgY29uc3QgZ2NkID0gYjtcbiAgaWYgKGdjZCAhPT0gXzFuKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmVydDogZG9lcyBub3QgZXhpc3QnKTtcbiAgcmV0dXJuIG1vZCh4LCBtb2R1bG8pO1xufVxuXG5mdW5jdGlvbiBhc3NlcnRJc1NxdWFyZTxUPihGcDogSUZpZWxkPFQ+LCByb290OiBULCBuOiBUKTogdm9pZCB7XG4gIGlmICghRnAuZXFsKEZwLnNxcihyb290KSwgbikpIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgc3F1YXJlIHJvb3QnKTtcbn1cblxuLy8gTm90IGFsbCByb290cyBhcmUgcG9zc2libGUhIEV4YW1wbGUgd2hpY2ggd2lsbCB0aHJvdzpcbi8vIGNvbnN0IE5VTSA9XG4vLyBuID0gNzIwNTc1OTQwMzc5Mjc4MTZuO1xuLy8gRnAgPSBGaWVsZChCaWdJbnQoJzB4MWEwMTExZWEzOTdmZTY5YTRiMWJhN2I2NDM0YmFjZDc2NDc3NGI4NGYzODUxMmJmNjczMGQyYTBmNmIwZjYyNDFlYWJmZmZlYjE1M2ZmZmZiOWZlZmZmZmZmZmZhYWFiJykpO1xuZnVuY3Rpb24gc3FydDNtb2Q0PFQ+KEZwOiBJRmllbGQ8VD4sIG46IFQpIHtcbiAgY29uc3QgcDFkaXY0ID0gKEZwLk9SREVSICsgXzFuKSAvIF80bjtcbiAgY29uc3Qgcm9vdCA9IEZwLnBvdyhuLCBwMWRpdjQpO1xuICBhc3NlcnRJc1NxdWFyZShGcCwgcm9vdCwgbik7XG4gIHJldHVybiByb290O1xufVxuXG5mdW5jdGlvbiBzcXJ0NW1vZDg8VD4oRnA6IElGaWVsZDxUPiwgbjogVCkge1xuICBjb25zdCBwNWRpdjggPSAoRnAuT1JERVIgLSBfNW4pIC8gXzhuO1xuICBjb25zdCBuMiA9IEZwLm11bChuLCBfMm4pO1xuICBjb25zdCB2ID0gRnAucG93KG4yLCBwNWRpdjgpO1xuICBjb25zdCBudiA9IEZwLm11bChuLCB2KTtcbiAgY29uc3QgaSA9IEZwLm11bChGcC5tdWwobnYsIF8ybiksIHYpO1xuICBjb25zdCByb290ID0gRnAubXVsKG52LCBGcC5zdWIoaSwgRnAuT05FKSk7XG4gIGFzc2VydElzU3F1YXJlKEZwLCByb290LCBuKTtcbiAgcmV0dXJuIHJvb3Q7XG59XG5cbi8vIEJhc2VkIG9uIFJGQzkzODAsIEtvbmcgYWxnb3JpdGhtXG4vLyBwcmV0dGllci1pZ25vcmVcbmZ1bmN0aW9uIHNxcnQ5bW9kMTYoUDogYmlnaW50KTogPFQ+KEZwOiBJRmllbGQ8VD4sIG46IFQpID0+IFQge1xuICBjb25zdCBGcF8gPSBGaWVsZChQKTtcbiAgY29uc3QgdG4gPSB0b25lbGxpU2hhbmtzKFApO1xuICBjb25zdCBjMSA9IHRuKEZwXywgRnBfLm5lZyhGcF8uT05FKSk7Ly8gIDEuIGMxID0gc3FydCgtMSkgaW4gRiwgaS5lLiwgKGMxXjIpID09IC0xIGluIEZcbiAgY29uc3QgYzIgPSB0bihGcF8sIGMxKTsgICAgICAgICAgICAgIC8vICAyLiBjMiA9IHNxcnQoYzEpIGluIEYsIGkuZS4sIChjMl4yKSA9PSBjMSBpbiBGXG4gIGNvbnN0IGMzID0gdG4oRnBfLCBGcF8ubmVnKGMxKSk7ICAgICAvLyAgMy4gYzMgPSBzcXJ0KC1jMSkgaW4gRiwgaS5lLiwgKGMzXjIpID09IC1jMSBpbiBGXG4gIGNvbnN0IGM0ID0gKFAgKyBfN24pIC8gXzE2bjsgICAgICAgICAvLyAgNC4gYzQgPSAocSArIDcpIC8gMTYgICAgICAgICMgSW50ZWdlciBhcml0aG1ldGljXG4gIHJldHVybiA8VD4oRnA6IElGaWVsZDxUPiwgbjogVCkgPT4ge1xuICAgIGxldCB0djEgPSBGcC5wb3cobiwgYzQpOyAgICAgICAgICAgLy8gIDEuIHR2MSA9IHheYzRcbiAgICBsZXQgdHYyID0gRnAubXVsKHR2MSwgYzEpOyAgICAgICAgIC8vICAyLiB0djIgPSBjMSAqIHR2MVxuICAgIGNvbnN0IHR2MyA9IEZwLm11bCh0djEsIGMyKTsgICAgICAgLy8gIDMuIHR2MyA9IGMyICogdHYxXG4gICAgY29uc3QgdHY0ID0gRnAubXVsKHR2MSwgYzMpOyAgICAgICAvLyAgNC4gdHY0ID0gYzMgKiB0djFcbiAgICBjb25zdCBlMSA9IEZwLmVxbChGcC5zcXIodHYyKSwgbik7IC8vICA1LiAgZTEgPSAodHYyXjIpID09IHhcbiAgICBjb25zdCBlMiA9IEZwLmVxbChGcC5zcXIodHYzKSwgbik7IC8vICA2LiAgZTIgPSAodHYzXjIpID09IHhcbiAgICB0djEgPSBGcC5jbW92KHR2MSwgdHYyLCBlMSk7ICAgICAgIC8vICA3LiB0djEgPSBDTU9WKHR2MSwgdHYyLCBlMSkgICMgU2VsZWN0IHR2MiBpZiAodHYyXjIpID09IHhcbiAgICB0djIgPSBGcC5jbW92KHR2NCwgdHYzLCBlMik7ICAgICAgIC8vICA4LiB0djIgPSBDTU9WKHR2NCwgdHYzLCBlMikgICMgU2VsZWN0IHR2MyBpZiAodHYzXjIpID09IHhcbiAgICBjb25zdCBlMyA9IEZwLmVxbChGcC5zcXIodHYyKSwgbik7IC8vICA5LiAgZTMgPSAodHYyXjIpID09IHhcbiAgICBjb25zdCByb290ID0gRnAuY21vdih0djEsIHR2MiwgZTMpOy8vIDEwLiAgeiA9IENNT1YodHYxLCB0djIsIGUzKSAgICMgU2VsZWN0IHNxcnQgZnJvbSB0djEgJiB0djJcbiAgICBhc3NlcnRJc1NxdWFyZShGcCwgcm9vdCwgbik7XG4gICAgcmV0dXJuIHJvb3Q7XG4gIH07XG59XG5cbi8qKlxuICogVG9uZWxsaS1TaGFua3Mgc3F1YXJlIHJvb3Qgc2VhcmNoIGFsZ29yaXRobS5cbiAqIDEuIGh0dHBzOi8vZXByaW50LmlhY3Iub3JnLzIwMTIvNjg1LnBkZiAocGFnZSAxMilcbiAqIDIuIFNxdWFyZSBSb290cyBmcm9tIDE7IDI0LCA1MSwgMTAgdG8gRGFuIFNoYW5rc1xuICogQHBhcmFtIFAgZmllbGQgb3JkZXJcbiAqIEByZXR1cm5zIGZ1bmN0aW9uIHRoYXQgdGFrZXMgZmllbGQgRnAgKGNyZWF0ZWQgZnJvbSBQKSBhbmQgbnVtYmVyIG5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvbmVsbGlTaGFua3MoUDogYmlnaW50KTogPFQ+KEZwOiBJRmllbGQ8VD4sIG46IFQpID0+IFQge1xuICAvLyBJbml0aWFsaXphdGlvbiAocHJlY29tcHV0YXRpb24pLlxuICAvLyBDYWNoaW5nIGluaXRpYWxpemF0aW9uIGNvdWxkIGJvb3N0IHBlcmYgYnkgNyUuXG4gIGlmIChQIDwgXzNuKSB0aHJvdyBuZXcgRXJyb3IoJ3NxcnQgaXMgbm90IGRlZmluZWQgZm9yIHNtYWxsIGZpZWxkJyk7XG4gIC8vIEZhY3RvciBQIC0gMSA9IFEgKiAyXlMsIHdoZXJlIFEgaXMgb2RkXG4gIGxldCBRID0gUCAtIF8xbjtcbiAgbGV0IFMgPSAwO1xuICB3aGlsZSAoUSAlIF8ybiA9PT0gXzBuKSB7XG4gICAgUSAvPSBfMm47XG4gICAgUysrO1xuICB9XG5cbiAgLy8gRmluZCB0aGUgZmlyc3QgcXVhZHJhdGljIG5vbi1yZXNpZHVlIFogPj0gMlxuICBsZXQgWiA9IF8ybjtcbiAgY29uc3QgX0ZwID0gRmllbGQoUCk7XG4gIHdoaWxlIChGcExlZ2VuZHJlKF9GcCwgWikgPT09IDEpIHtcbiAgICAvLyBCYXNpYyBwcmltYWxpdHkgdGVzdCBmb3IgUC4gQWZ0ZXIgeCBpdGVyYXRpb25zLCBjaGFuY2Ugb2ZcbiAgICAvLyBub3QgZmluZGluZyBxdWFkcmF0aWMgbm9uLXJlc2lkdWUgaXMgMl54LCBzbyAyXjEwMDAuXG4gICAgaWYgKForKyA+IDEwMDApIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgc3F1YXJlIHJvb3Q6IHByb2JhYmx5IG5vbi1wcmltZSBQJyk7XG4gIH1cbiAgLy8gRmFzdC1wYXRoOyB1c3VhbGx5IGRvbmUgYmVmb3JlIFosIGJ1dCB3ZSBkbyBcInByaW1hbGl0eSB0ZXN0XCIuXG4gIGlmIChTID09PSAxKSByZXR1cm4gc3FydDNtb2Q0O1xuXG4gIC8vIFNsb3ctcGF0aFxuICAvLyBUT0RPOiB0ZXN0IG9uIEZwMiBhbmQgb3RoZXJzXG4gIGxldCBjYyA9IF9GcC5wb3coWiwgUSk7IC8vIGMgPSB6XlFcbiAgY29uc3QgUTFkaXYyID0gKFEgKyBfMW4pIC8gXzJuO1xuICByZXR1cm4gZnVuY3Rpb24gdG9uZWxsaVNsb3c8VD4oRnA6IElGaWVsZDxUPiwgbjogVCk6IFQge1xuICAgIGlmIChGcC5pczAobikpIHJldHVybiBuO1xuICAgIC8vIENoZWNrIGlmIG4gaXMgYSBxdWFkcmF0aWMgcmVzaWR1ZSB1c2luZyBMZWdlbmRyZSBzeW1ib2xcbiAgICBpZiAoRnBMZWdlbmRyZShGcCwgbikgIT09IDEpIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgc3F1YXJlIHJvb3QnKTtcblxuICAgIC8vIEluaXRpYWxpemUgdmFyaWFibGVzIGZvciB0aGUgbWFpbiBsb29wXG4gICAgbGV0IE0gPSBTO1xuICAgIGxldCBjID0gRnAubXVsKEZwLk9ORSwgY2MpOyAvLyBjID0gel5RLCBtb3ZlIGNjIGZyb20gZmllbGQgX0ZwIGludG8gZmllbGQgRnBcbiAgICBsZXQgdCA9IEZwLnBvdyhuLCBRKTsgLy8gdCA9IG5eUSwgZmlyc3QgZ3Vlc3MgYXQgdGhlIGZ1ZGdlIGZhY3RvclxuICAgIGxldCBSID0gRnAucG93KG4sIFExZGl2Mik7IC8vIFIgPSBuXigoUSsxKS8yKSwgZmlyc3QgZ3Vlc3MgYXQgdGhlIHNxdWFyZSByb290XG5cbiAgICAvLyBNYWluIGxvb3BcbiAgICAvLyB3aGlsZSB0ICE9IDFcbiAgICB3aGlsZSAoIUZwLmVxbCh0LCBGcC5PTkUpKSB7XG4gICAgICBpZiAoRnAuaXMwKHQpKSByZXR1cm4gRnAuWkVSTzsgLy8gaWYgdD0wIHJldHVybiBSPTBcbiAgICAgIGxldCBpID0gMTtcblxuICAgICAgLy8gRmluZCB0aGUgc21hbGxlc3QgaSA+PSAxIHN1Y2ggdGhhdCB0XigyXmkpIFx1MjI2MSAxIChtb2QgUClcbiAgICAgIGxldCB0X3RtcCA9IEZwLnNxcih0KTsgLy8gdF4oMl4xKVxuICAgICAgd2hpbGUgKCFGcC5lcWwodF90bXAsIEZwLk9ORSkpIHtcbiAgICAgICAgaSsrO1xuICAgICAgICB0X3RtcCA9IEZwLnNxcih0X3RtcCk7IC8vIHReKDJeMikuLi5cbiAgICAgICAgaWYgKGkgPT09IE0pIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgc3F1YXJlIHJvb3QnKTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBleHBvbmVudCBmb3IgYjogMl4oTSAtIGkgLSAxKVxuICAgICAgY29uc3QgZXhwb25lbnQgPSBfMW4gPDwgQmlnSW50KE0gLSBpIC0gMSk7IC8vIGJpZ2ludCBpcyBpbXBvcnRhbnRcbiAgICAgIGNvbnN0IGIgPSBGcC5wb3coYywgZXhwb25lbnQpOyAvLyBiID0gMl4oTSAtIGkgLSAxKVxuXG4gICAgICAvLyBVcGRhdGUgdmFyaWFibGVzXG4gICAgICBNID0gaTtcbiAgICAgIGMgPSBGcC5zcXIoYik7IC8vIGMgPSBiXjJcbiAgICAgIHQgPSBGcC5tdWwodCwgYyk7IC8vIHQgPSAodCAqIGJeMilcbiAgICAgIFIgPSBGcC5tdWwoUiwgYik7IC8vIFIgPSBSKmJcbiAgICB9XG4gICAgcmV0dXJuIFI7XG4gIH07XG59XG5cbi8qKlxuICogU3F1YXJlIHJvb3QgZm9yIGEgZmluaXRlIGZpZWxkLiBXaWxsIHRyeSBvcHRpbWl6ZWQgdmVyc2lvbnMgZmlyc3Q6XG4gKlxuICogMS4gUCBcdTIyNjEgMyAobW9kIDQpXG4gKiAyLiBQIFx1MjI2MSA1IChtb2QgOClcbiAqIDMuIFAgXHUyMjYxIDkgKG1vZCAxNilcbiAqIDQuIFRvbmVsbGktU2hhbmtzIGFsZ29yaXRobVxuICpcbiAqIERpZmZlcmVudCBhbGdvcml0aG1zIGNhbiBnaXZlIGRpZmZlcmVudCByb290cywgaXQgaXMgdXAgdG8gdXNlciB0byBkZWNpZGUgd2hpY2ggb25lIHRoZXkgd2FudC5cbiAqIEZvciBleGFtcGxlIHRoZXJlIGlzIEZwU3FydE9kZC9GcFNxcnRFdmVuIHRvIGNob2ljZSByb290IGJhc2VkIG9uIG9kZG5lc3MgKHVzZWQgZm9yIGhhc2gtdG8tY3VydmUpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gRnBTcXJ0KFA6IGJpZ2ludCk6IDxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKSA9PiBUIHtcbiAgLy8gUCBcdTIyNjEgMyAobW9kIDQpID0+IFx1MjIxQW4gPSBuXigoUCsxKS80KVxuICBpZiAoUCAlIF80biA9PT0gXzNuKSByZXR1cm4gc3FydDNtb2Q0O1xuICAvLyBQIFx1MjI2MSA1IChtb2QgOCkgPT4gQXRraW4gYWxnb3JpdGhtLCBwYWdlIDEwIG9mIGh0dHBzOi8vZXByaW50LmlhY3Iub3JnLzIwMTIvNjg1LnBkZlxuICBpZiAoUCAlIF84biA9PT0gXzVuKSByZXR1cm4gc3FydDVtb2Q4O1xuICAvLyBQIFx1MjI2MSA5IChtb2QgMTYpID0+IEtvbmcgYWxnb3JpdGhtLCBwYWdlIDExIG9mIGh0dHBzOi8vZXByaW50LmlhY3Iub3JnLzIwMTIvNjg1LnBkZiAoYWxnb3JpdGhtIDQpXG4gIGlmIChQICUgXzE2biA9PT0gXzluKSByZXR1cm4gc3FydDltb2QxNihQKTtcbiAgLy8gVG9uZWxsaS1TaGFua3MgYWxnb3JpdGhtXG4gIHJldHVybiB0b25lbGxpU2hhbmtzKFApO1xufVxuXG4vLyBMaXR0bGUtZW5kaWFuIGNoZWNrIGZvciBmaXJzdCBMRSBiaXQgKGxhc3QgQkUgYml0KTtcbmV4cG9ydCBjb25zdCBpc05lZ2F0aXZlTEUgPSAobnVtOiBiaWdpbnQsIG1vZHVsbzogYmlnaW50KTogYm9vbGVhbiA9PlxuICAobW9kKG51bSwgbW9kdWxvKSAmIF8xbikgPT09IF8xbjtcblxuLyoqIEZpZWxkIGlzIG5vdCBhbHdheXMgb3ZlciBwcmltZTogZm9yIGV4YW1wbGUsIEZwMiBoYXMgT1JERVIocSk9cF5tLiAqL1xuZXhwb3J0IGludGVyZmFjZSBJRmllbGQ8VD4ge1xuICBPUkRFUjogYmlnaW50O1xuICBCWVRFUzogbnVtYmVyO1xuICBCSVRTOiBudW1iZXI7XG4gIGlzTEU6IGJvb2xlYW47XG4gIFpFUk86IFQ7XG4gIE9ORTogVDtcbiAgLy8gMS1hcmdcbiAgY3JlYXRlOiAobnVtOiBUKSA9PiBUO1xuICBpc1ZhbGlkOiAobnVtOiBUKSA9PiBib29sZWFuO1xuICBpczA6IChudW06IFQpID0+IGJvb2xlYW47XG4gIGlzVmFsaWROb3QwOiAobnVtOiBUKSA9PiBib29sZWFuO1xuICBuZWcobnVtOiBUKTogVDtcbiAgaW52KG51bTogVCk6IFQ7XG4gIHNxcnQobnVtOiBUKTogVDtcbiAgc3FyKG51bTogVCk6IFQ7XG4gIC8vIDItYXJnc1xuICBlcWwobGhzOiBULCByaHM6IFQpOiBib29sZWFuO1xuICBhZGQobGhzOiBULCByaHM6IFQpOiBUO1xuICBzdWIobGhzOiBULCByaHM6IFQpOiBUO1xuICBtdWwobGhzOiBULCByaHM6IFQgfCBiaWdpbnQpOiBUO1xuICBwb3cobGhzOiBULCBwb3dlcjogYmlnaW50KTogVDtcbiAgZGl2KGxoczogVCwgcmhzOiBUIHwgYmlnaW50KTogVDtcbiAgLy8gTiBmb3IgTm9uTm9ybWFsaXplZCAoZm9yIG5vdylcbiAgYWRkTihsaHM6IFQsIHJoczogVCk6IFQ7XG4gIHN1Yk4obGhzOiBULCByaHM6IFQpOiBUO1xuICBtdWxOKGxoczogVCwgcmhzOiBUIHwgYmlnaW50KTogVDtcbiAgc3FyTihudW06IFQpOiBUO1xuXG4gIC8vIE9wdGlvbmFsXG4gIC8vIFNob3VsZCBiZSBzYW1lIGFzIHNnbjAgZnVuY3Rpb24gaW5cbiAgLy8gW1JGQzkzODBdKGh0dHBzOi8vd3d3LnJmYy1lZGl0b3Iub3JnL3JmYy9yZmM5MzgwI3NlY3Rpb24tNC4xKS5cbiAgLy8gTk9URTogc2duMCBpcyAnbmVnYXRpdmUgaW4gTEUnLCB3aGljaCBpcyBzYW1lIGFzIG9kZC4gQW5kIG5lZ2F0aXZlIGluIExFIGlzIGtpbmRhIHN0cmFuZ2UgZGVmaW5pdGlvbiBhbnl3YXkuXG4gIGlzT2RkPyhudW06IFQpOiBib29sZWFuOyAvLyBPZGQgaW5zdGVhZCBvZiBldmVuIHNpbmNlIHdlIGhhdmUgaXQgZm9yIEZwMlxuICAvLyBsZWdlbmRyZT8obnVtOiBUKTogVDtcbiAgaW52ZXJ0QmF0Y2g6IChsc3Q6IFRbXSkgPT4gVFtdO1xuICB0b0J5dGVzKG51bTogVCk6IFVpbnQ4QXJyYXk7XG4gIGZyb21CeXRlcyhieXRlczogVWludDhBcnJheSwgc2tpcFZhbGlkYXRpb24/OiBib29sZWFuKTogVDtcbiAgLy8gSWYgYyBpcyBGYWxzZSwgQ01PViByZXR1cm5zIGEsIG90aGVyd2lzZSBpdCByZXR1cm5zIGIuXG4gIGNtb3YoYTogVCwgYjogVCwgYzogYm9vbGVhbik6IFQ7XG59XG4vLyBwcmV0dGllci1pZ25vcmVcbmNvbnN0IEZJRUxEX0ZJRUxEUyA9IFtcbiAgJ2NyZWF0ZScsICdpc1ZhbGlkJywgJ2lzMCcsICduZWcnLCAnaW52JywgJ3NxcnQnLCAnc3FyJyxcbiAgJ2VxbCcsICdhZGQnLCAnc3ViJywgJ211bCcsICdwb3cnLCAnZGl2JyxcbiAgJ2FkZE4nLCAnc3ViTicsICdtdWxOJywgJ3Nxck4nXG5dIGFzIGNvbnN0O1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRmllbGQ8VD4oZmllbGQ6IElGaWVsZDxUPik6IElGaWVsZDxUPiB7XG4gIGNvbnN0IGluaXRpYWwgPSB7XG4gICAgT1JERVI6ICdiaWdpbnQnLFxuICAgIEJZVEVTOiAnbnVtYmVyJyxcbiAgICBCSVRTOiAnbnVtYmVyJyxcbiAgfSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICBjb25zdCBvcHRzID0gRklFTERfRklFTERTLnJlZHVjZSgobWFwLCB2YWw6IHN0cmluZykgPT4ge1xuICAgIG1hcFt2YWxdID0gJ2Z1bmN0aW9uJztcbiAgICByZXR1cm4gbWFwO1xuICB9LCBpbml0aWFsKTtcbiAgdmFsaWRhdGVPYmplY3QoZmllbGQsIG9wdHMpO1xuICAvLyBjb25zdCBtYXggPSAxNjM4NDtcbiAgLy8gaWYgKGZpZWxkLkJZVEVTIDwgMSB8fCBmaWVsZC5CWVRFUyA+IG1heCkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpZWxkJyk7XG4gIC8vIGlmIChmaWVsZC5CSVRTIDwgMSB8fCBmaWVsZC5CSVRTID4gOCAqIG1heCkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpZWxkJyk7XG4gIHJldHVybiBmaWVsZDtcbn1cblxuLy8gR2VuZXJpYyBmaWVsZCBmdW5jdGlvbnNcblxuLyoqXG4gKiBTYW1lIGFzIGBwb3dgIGJ1dCBmb3IgRnA6IG5vbi1jb25zdGFudC10aW1lLlxuICogVW5zYWZlIGluIHNvbWUgY29udGV4dHM6IHVzZXMgbGFkZGVyLCBzbyBjYW4gZXhwb3NlIGJpZ2ludCBiaXRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gRnBQb3c8VD4oRnA6IElGaWVsZDxUPiwgbnVtOiBULCBwb3dlcjogYmlnaW50KTogVCB7XG4gIGlmIChwb3dlciA8IF8wbikgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGV4cG9uZW50LCBuZWdhdGl2ZXMgdW5zdXBwb3J0ZWQnKTtcbiAgaWYgKHBvd2VyID09PSBfMG4pIHJldHVybiBGcC5PTkU7XG4gIGlmIChwb3dlciA9PT0gXzFuKSByZXR1cm4gbnVtO1xuICBsZXQgcCA9IEZwLk9ORTtcbiAgbGV0IGQgPSBudW07XG4gIHdoaWxlIChwb3dlciA+IF8wbikge1xuICAgIGlmIChwb3dlciAmIF8xbikgcCA9IEZwLm11bChwLCBkKTtcbiAgICBkID0gRnAuc3FyKGQpO1xuICAgIHBvd2VyID4+PSBfMW47XG4gIH1cbiAgcmV0dXJuIHA7XG59XG5cbi8qKlxuICogRWZmaWNpZW50bHkgaW52ZXJ0IGFuIGFycmF5IG9mIEZpZWxkIGVsZW1lbnRzLlxuICogRXhjZXB0aW9uLWZyZWUuIFdpbGwgcmV0dXJuIGB1bmRlZmluZWRgIGZvciAwIGVsZW1lbnRzLlxuICogQHBhcmFtIHBhc3NaZXJvIG1hcCAwIHRvIDAgKGluc3RlYWQgb2YgdW5kZWZpbmVkKVxuICovXG5leHBvcnQgZnVuY3Rpb24gRnBJbnZlcnRCYXRjaDxUPihGcDogSUZpZWxkPFQ+LCBudW1zOiBUW10sIHBhc3NaZXJvID0gZmFsc2UpOiBUW10ge1xuICBjb25zdCBpbnZlcnRlZCA9IG5ldyBBcnJheShudW1zLmxlbmd0aCkuZmlsbChwYXNzWmVybyA/IEZwLlpFUk8gOiB1bmRlZmluZWQpO1xuICAvLyBXYWxrIGZyb20gZmlyc3QgdG8gbGFzdCwgbXVsdGlwbHkgdGhlbSBieSBlYWNoIG90aGVyIE1PRCBwXG4gIGNvbnN0IG11bHRpcGxpZWRBY2MgPSBudW1zLnJlZHVjZSgoYWNjLCBudW0sIGkpID0+IHtcbiAgICBpZiAoRnAuaXMwKG51bSkpIHJldHVybiBhY2M7XG4gICAgaW52ZXJ0ZWRbaV0gPSBhY2M7XG4gICAgcmV0dXJuIEZwLm11bChhY2MsIG51bSk7XG4gIH0sIEZwLk9ORSk7XG4gIC8vIEludmVydCBsYXN0IGVsZW1lbnRcbiAgY29uc3QgaW52ZXJ0ZWRBY2MgPSBGcC5pbnYobXVsdGlwbGllZEFjYyk7XG4gIC8vIFdhbGsgZnJvbSBsYXN0IHRvIGZpcnN0LCBtdWx0aXBseSB0aGVtIGJ5IGludmVydGVkIGVhY2ggb3RoZXIgTU9EIHBcbiAgbnVtcy5yZWR1Y2VSaWdodCgoYWNjLCBudW0sIGkpID0+IHtcbiAgICBpZiAoRnAuaXMwKG51bSkpIHJldHVybiBhY2M7XG4gICAgaW52ZXJ0ZWRbaV0gPSBGcC5tdWwoYWNjLCBpbnZlcnRlZFtpXSk7XG4gICAgcmV0dXJuIEZwLm11bChhY2MsIG51bSk7XG4gIH0sIGludmVydGVkQWNjKTtcbiAgcmV0dXJuIGludmVydGVkO1xufVxuXG4vLyBUT0RPOiByZW1vdmVcbmV4cG9ydCBmdW5jdGlvbiBGcERpdjxUPihGcDogSUZpZWxkPFQ+LCBsaHM6IFQsIHJoczogVCB8IGJpZ2ludCk6IFQge1xuICByZXR1cm4gRnAubXVsKGxocywgdHlwZW9mIHJocyA9PT0gJ2JpZ2ludCcgPyBpbnZlcnQocmhzLCBGcC5PUkRFUikgOiBGcC5pbnYocmhzKSk7XG59XG5cbi8qKlxuICogTGVnZW5kcmUgc3ltYm9sLlxuICogTGVnZW5kcmUgY29uc3RhbnQgaXMgdXNlZCB0byBjYWxjdWxhdGUgTGVnZW5kcmUgc3ltYm9sIChhIHwgcClcbiAqIHdoaWNoIGRlbm90ZXMgdGhlIHZhbHVlIG9mIGFeKChwLTEpLzIpIChtb2QgcCkuXG4gKlxuICogKiAoYSB8IHApIFx1MjI2MSAxICAgIGlmIGEgaXMgYSBzcXVhcmUgKG1vZCBwKSwgcXVhZHJhdGljIHJlc2lkdWVcbiAqICogKGEgfCBwKSBcdTIyNjEgLTEgICBpZiBhIGlzIG5vdCBhIHNxdWFyZSAobW9kIHApLCBxdWFkcmF0aWMgbm9uIHJlc2lkdWVcbiAqICogKGEgfCBwKSBcdTIyNjEgMCAgICBpZiBhIFx1MjI2MSAwIChtb2QgcClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZwTGVnZW5kcmU8VD4oRnA6IElGaWVsZDxUPiwgbjogVCk6IC0xIHwgMCB8IDEge1xuICAvLyBXZSBjYW4gdXNlIDNyZCBhcmd1bWVudCBhcyBvcHRpb25hbCBjYWNoZSBvZiB0aGlzIHZhbHVlXG4gIC8vIGJ1dCBzZWVtcyB1bm5lZWRlZCBmb3Igbm93LiBUaGUgb3BlcmF0aW9uIGlzIHZlcnkgZmFzdC5cbiAgY29uc3QgcDFtb2QyID0gKEZwLk9SREVSIC0gXzFuKSAvIF8ybjtcbiAgY29uc3QgcG93ZXJlZCA9IEZwLnBvdyhuLCBwMW1vZDIpO1xuICBjb25zdCB5ZXMgPSBGcC5lcWwocG93ZXJlZCwgRnAuT05FKTtcbiAgY29uc3QgemVybyA9IEZwLmVxbChwb3dlcmVkLCBGcC5aRVJPKTtcbiAgY29uc3Qgbm8gPSBGcC5lcWwocG93ZXJlZCwgRnAubmVnKEZwLk9ORSkpO1xuICBpZiAoIXllcyAmJiAhemVybyAmJiAhbm8pIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBMZWdlbmRyZSBzeW1ib2wgcmVzdWx0Jyk7XG4gIHJldHVybiB5ZXMgPyAxIDogemVybyA/IDAgOiAtMTtcbn1cblxuLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIFRydWUgd2hlbmV2ZXIgdGhlIHZhbHVlIHggaXMgYSBzcXVhcmUgaW4gdGhlIGZpZWxkIEYuXG5leHBvcnQgZnVuY3Rpb24gRnBJc1NxdWFyZTxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKTogYm9vbGVhbiB7XG4gIGNvbnN0IGwgPSBGcExlZ2VuZHJlKEZwLCBuKTtcbiAgcmV0dXJuIGwgPT09IDE7XG59XG5cbmV4cG9ydCB0eXBlIE5MZW5ndGggPSB7IG5CeXRlTGVuZ3RoOiBudW1iZXI7IG5CaXRMZW5ndGg6IG51bWJlciB9O1xuLy8gQ1VSVkUubiBsZW5ndGhzXG5leHBvcnQgZnVuY3Rpb24gbkxlbmd0aChuOiBiaWdpbnQsIG5CaXRMZW5ndGg/OiBudW1iZXIpOiBOTGVuZ3RoIHtcbiAgLy8gQml0IHNpemUsIGJ5dGUgc2l6ZSBvZiBDVVJWRS5uXG4gIGlmIChuQml0TGVuZ3RoICE9PSB1bmRlZmluZWQpIGFudW1iZXIobkJpdExlbmd0aCk7XG4gIGNvbnN0IF9uQml0TGVuZ3RoID0gbkJpdExlbmd0aCAhPT0gdW5kZWZpbmVkID8gbkJpdExlbmd0aCA6IG4udG9TdHJpbmcoMikubGVuZ3RoO1xuICBjb25zdCBuQnl0ZUxlbmd0aCA9IE1hdGguY2VpbChfbkJpdExlbmd0aCAvIDgpO1xuICByZXR1cm4geyBuQml0TGVuZ3RoOiBfbkJpdExlbmd0aCwgbkJ5dGVMZW5ndGggfTtcbn1cblxudHlwZSBGcEZpZWxkID0gSUZpZWxkPGJpZ2ludD4gJiBSZXF1aXJlZDxQaWNrPElGaWVsZDxiaWdpbnQ+LCAnaXNPZGQnPj47XG50eXBlIFNxcnRGbiA9IChuOiBiaWdpbnQpID0+IGJpZ2ludDtcbnR5cGUgRmllbGRPcHRzID0gUGFydGlhbDx7XG4gIGlzTEU6IGJvb2xlYW47XG4gIEJJVFM6IG51bWJlcjtcbiAgc3FydDogU3FydEZuO1xuICBhbGxvd2VkTGVuZ3Rocz86IHJlYWRvbmx5IG51bWJlcltdOyAvLyBmb3IgUDUyMSAoYWRkcyBwYWRkaW5nIGZvciBzbWFsbGVyIHNpemVzKVxuICBtb2RGcm9tQnl0ZXM6IGJvb2xlYW47IC8vIGJsczEyLTM4MSByZXF1aXJlcyBtb2QobikgaW5zdGVhZCBvZiByZWplY3Rpbmcga2V5cyA+PSBuXG59PjtcbmNsYXNzIF9GaWVsZCBpbXBsZW1lbnRzIElGaWVsZDxiaWdpbnQ+IHtcbiAgcmVhZG9ubHkgT1JERVI6IGJpZ2ludDtcbiAgcmVhZG9ubHkgQklUUzogbnVtYmVyO1xuICByZWFkb25seSBCWVRFUzogbnVtYmVyO1xuICByZWFkb25seSBpc0xFOiBib29sZWFuO1xuICByZWFkb25seSBaRVJPID0gXzBuO1xuICByZWFkb25seSBPTkUgPSBfMW47XG4gIHJlYWRvbmx5IF9sZW5ndGhzPzogbnVtYmVyW107XG4gIHByaXZhdGUgX3NxcnQ6IFJldHVyblR5cGU8dHlwZW9mIEZwU3FydD4gfCB1bmRlZmluZWQ7IC8vIGNhY2hlZCBzcXJ0XG4gIHByaXZhdGUgcmVhZG9ubHkgX21vZD86IGJvb2xlYW47XG4gIGNvbnN0cnVjdG9yKE9SREVSOiBiaWdpbnQsIG9wdHM6IEZpZWxkT3B0cyA9IHt9KSB7XG4gICAgaWYgKE9SREVSIDw9IF8wbikgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpZWxkOiBleHBlY3RlZCBPUkRFUiA+IDAsIGdvdCAnICsgT1JERVIpO1xuICAgIGxldCBfbmJpdExlbmd0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuaXNMRSA9IGZhbHNlO1xuICAgIGlmIChvcHRzICE9IG51bGwgJiYgdHlwZW9mIG9wdHMgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAodHlwZW9mIG9wdHMuQklUUyA9PT0gJ251bWJlcicpIF9uYml0TGVuZ3RoID0gb3B0cy5CSVRTO1xuICAgICAgaWYgKHR5cGVvZiBvcHRzLnNxcnQgPT09ICdmdW5jdGlvbicpIHRoaXMuc3FydCA9IG9wdHMuc3FydDtcbiAgICAgIGlmICh0eXBlb2Ygb3B0cy5pc0xFID09PSAnYm9vbGVhbicpIHRoaXMuaXNMRSA9IG9wdHMuaXNMRTtcbiAgICAgIGlmIChvcHRzLmFsbG93ZWRMZW5ndGhzKSB0aGlzLl9sZW5ndGhzID0gb3B0cy5hbGxvd2VkTGVuZ3Rocz8uc2xpY2UoKTtcbiAgICAgIGlmICh0eXBlb2Ygb3B0cy5tb2RGcm9tQnl0ZXMgPT09ICdib29sZWFuJykgdGhpcy5fbW9kID0gb3B0cy5tb2RGcm9tQnl0ZXM7XG4gICAgfVxuICAgIGNvbnN0IHsgbkJpdExlbmd0aCwgbkJ5dGVMZW5ndGggfSA9IG5MZW5ndGgoT1JERVIsIF9uYml0TGVuZ3RoKTtcbiAgICBpZiAobkJ5dGVMZW5ndGggPiAyMDQ4KSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmllbGQ6IGV4cGVjdGVkIE9SREVSIG9mIDw9IDIwNDggYnl0ZXMnKTtcbiAgICB0aGlzLk9SREVSID0gT1JERVI7XG4gICAgdGhpcy5CSVRTID0gbkJpdExlbmd0aDtcbiAgICB0aGlzLkJZVEVTID0gbkJ5dGVMZW5ndGg7XG4gICAgdGhpcy5fc3FydCA9IHVuZGVmaW5lZDtcbiAgICBPYmplY3QucHJldmVudEV4dGVuc2lvbnModGhpcyk7XG4gIH1cblxuICBjcmVhdGUobnVtOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbW9kKG51bSwgdGhpcy5PUkRFUik7XG4gIH1cbiAgaXNWYWxpZChudW06IGJpZ2ludCkge1xuICAgIGlmICh0eXBlb2YgbnVtICE9PSAnYmlnaW50JylcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmaWVsZCBlbGVtZW50OiBleHBlY3RlZCBiaWdpbnQsIGdvdCAnICsgdHlwZW9mIG51bSk7XG4gICAgcmV0dXJuIF8wbiA8PSBudW0gJiYgbnVtIDwgdGhpcy5PUkRFUjsgLy8gMCBpcyB2YWxpZCBlbGVtZW50LCBidXQgaXQncyBub3QgaW52ZXJ0aWJsZVxuICB9XG4gIGlzMChudW06IGJpZ2ludCkge1xuICAgIHJldHVybiBudW0gPT09IF8wbjtcbiAgfVxuICAvLyBpcyB2YWxpZCBhbmQgaW52ZXJ0aWJsZVxuICBpc1ZhbGlkTm90MChudW06IGJpZ2ludCkge1xuICAgIHJldHVybiAhdGhpcy5pczAobnVtKSAmJiB0aGlzLmlzVmFsaWQobnVtKTtcbiAgfVxuICBpc09kZChudW06IGJpZ2ludCkge1xuICAgIHJldHVybiAobnVtICYgXzFuKSA9PT0gXzFuO1xuICB9XG4gIG5lZyhudW06IGJpZ2ludCkge1xuICAgIHJldHVybiBtb2QoLW51bSwgdGhpcy5PUkRFUik7XG4gIH1cbiAgZXFsKGxoczogYmlnaW50LCByaHM6IGJpZ2ludCkge1xuICAgIHJldHVybiBsaHMgPT09IHJocztcbiAgfVxuXG4gIHNxcihudW06IGJpZ2ludCkge1xuICAgIHJldHVybiBtb2QobnVtICogbnVtLCB0aGlzLk9SREVSKTtcbiAgfVxuICBhZGQobGhzOiBiaWdpbnQsIHJoczogYmlnaW50KSB7XG4gICAgcmV0dXJuIG1vZChsaHMgKyByaHMsIHRoaXMuT1JERVIpO1xuICB9XG4gIHN1YihsaHM6IGJpZ2ludCwgcmhzOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbW9kKGxocyAtIHJocywgdGhpcy5PUkRFUik7XG4gIH1cbiAgbXVsKGxoczogYmlnaW50LCByaHM6IGJpZ2ludCkge1xuICAgIHJldHVybiBtb2QobGhzICogcmhzLCB0aGlzLk9SREVSKTtcbiAgfVxuICBwb3cobnVtOiBiaWdpbnQsIHBvd2VyOiBiaWdpbnQpOiBiaWdpbnQge1xuICAgIHJldHVybiBGcFBvdyh0aGlzLCBudW0sIHBvd2VyKTtcbiAgfVxuICBkaXYobGhzOiBiaWdpbnQsIHJoczogYmlnaW50KSB7XG4gICAgcmV0dXJuIG1vZChsaHMgKiBpbnZlcnQocmhzLCB0aGlzLk9SREVSKSwgdGhpcy5PUkRFUik7XG4gIH1cblxuICAvLyBTYW1lIGFzIGFib3ZlLCBidXQgZG9lc24ndCBub3JtYWxpemVcbiAgc3FyTihudW06IGJpZ2ludCkge1xuICAgIHJldHVybiBudW0gKiBudW07XG4gIH1cbiAgYWRkTihsaHM6IGJpZ2ludCwgcmhzOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbGhzICsgcmhzO1xuICB9XG4gIHN1Yk4obGhzOiBiaWdpbnQsIHJoczogYmlnaW50KSB7XG4gICAgcmV0dXJuIGxocyAtIHJocztcbiAgfVxuICBtdWxOKGxoczogYmlnaW50LCByaHM6IGJpZ2ludCkge1xuICAgIHJldHVybiBsaHMgKiByaHM7XG4gIH1cblxuICBpbnYobnVtOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gaW52ZXJ0KG51bSwgdGhpcy5PUkRFUik7XG4gIH1cbiAgc3FydChudW06IGJpZ2ludCk6IGJpZ2ludCB7XG4gICAgLy8gQ2FjaGluZyBfc3FydCBzcGVlZHMgdXAgc3FydDltb2QxNiBieSA1eCBhbmQgdG9ubmVsaS1zaGFua3MgYnkgMTAlXG4gICAgaWYgKCF0aGlzLl9zcXJ0KSB0aGlzLl9zcXJ0ID0gRnBTcXJ0KHRoaXMuT1JERVIpO1xuICAgIHJldHVybiB0aGlzLl9zcXJ0KHRoaXMsIG51bSk7XG4gIH1cbiAgdG9CeXRlcyhudW06IGJpZ2ludCkge1xuICAgIHJldHVybiB0aGlzLmlzTEUgPyBudW1iZXJUb0J5dGVzTEUobnVtLCB0aGlzLkJZVEVTKSA6IG51bWJlclRvQnl0ZXNCRShudW0sIHRoaXMuQllURVMpO1xuICB9XG4gIGZyb21CeXRlcyhieXRlczogVWludDhBcnJheSwgc2tpcFZhbGlkYXRpb24gPSBmYWxzZSkge1xuICAgIGFieXRlcyhieXRlcyk7XG4gICAgY29uc3QgeyBfbGVuZ3RoczogYWxsb3dlZExlbmd0aHMsIEJZVEVTLCBpc0xFLCBPUkRFUiwgX21vZDogbW9kRnJvbUJ5dGVzIH0gPSB0aGlzO1xuICAgIGlmIChhbGxvd2VkTGVuZ3Rocykge1xuICAgICAgaWYgKCFhbGxvd2VkTGVuZ3Rocy5pbmNsdWRlcyhieXRlcy5sZW5ndGgpIHx8IGJ5dGVzLmxlbmd0aCA+IEJZVEVTKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnRmllbGQuZnJvbUJ5dGVzOiBleHBlY3RlZCAnICsgYWxsb3dlZExlbmd0aHMgKyAnIGJ5dGVzLCBnb3QgJyArIGJ5dGVzLmxlbmd0aFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgY29uc3QgcGFkZGVkID0gbmV3IFVpbnQ4QXJyYXkoQllURVMpO1xuICAgICAgLy8gaXNMRSBhZGQgMCB0byByaWdodCwgIWlzTEUgdG8gdGhlIGxlZnQuXG4gICAgICBwYWRkZWQuc2V0KGJ5dGVzLCBpc0xFID8gMCA6IHBhZGRlZC5sZW5ndGggLSBieXRlcy5sZW5ndGgpO1xuICAgICAgYnl0ZXMgPSBwYWRkZWQ7XG4gICAgfVxuICAgIGlmIChieXRlcy5sZW5ndGggIT09IEJZVEVTKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaWVsZC5mcm9tQnl0ZXM6IGV4cGVjdGVkICcgKyBCWVRFUyArICcgYnl0ZXMsIGdvdCAnICsgYnl0ZXMubGVuZ3RoKTtcbiAgICBsZXQgc2NhbGFyID0gaXNMRSA/IGJ5dGVzVG9OdW1iZXJMRShieXRlcykgOiBieXRlc1RvTnVtYmVyQkUoYnl0ZXMpO1xuICAgIGlmIChtb2RGcm9tQnl0ZXMpIHNjYWxhciA9IG1vZChzY2FsYXIsIE9SREVSKTtcbiAgICBpZiAoIXNraXBWYWxpZGF0aW9uKVxuICAgICAgaWYgKCF0aGlzLmlzVmFsaWQoc2NhbGFyKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpZWxkIGVsZW1lbnQ6IG91dHNpZGUgb2YgcmFuZ2UgMC4uT1JERVInKTtcbiAgICAvLyBOT1RFOiB3ZSBkb24ndCB2YWxpZGF0ZSBzY2FsYXIgaGVyZSwgcGxlYXNlIHVzZSBpc1ZhbGlkLiBUaGlzIGRvbmUgc3VjaCB3YXkgYmVjYXVzZSBzb21lXG4gICAgLy8gcHJvdG9jb2wgbWF5IGFsbG93IG5vbi1yZWR1Y2VkIHNjYWxhciB0aGF0IHJlZHVjZWQgbGF0ZXIgb3IgY2hhbmdlZCBzb21lIG90aGVyIHdheS5cbiAgICByZXR1cm4gc2NhbGFyO1xuICB9XG4gIC8vIFRPRE86IHdlIGRvbid0IG5lZWQgaXQgaGVyZSwgbW92ZSBvdXQgdG8gc2VwYXJhdGUgZm5cbiAgaW52ZXJ0QmF0Y2gobHN0OiBiaWdpbnRbXSk6IGJpZ2ludFtdIHtcbiAgICByZXR1cm4gRnBJbnZlcnRCYXRjaCh0aGlzLCBsc3QpO1xuICB9XG4gIC8vIFdlIGNhbid0IG1vdmUgdGhpcyBvdXQgYmVjYXVzZSBGcDYsIEZwMTIgaW1wbGVtZW50IGl0XG4gIC8vIGFuZCBpdCdzIHVuY2xlYXIgd2hhdCB0byByZXR1cm4gaW4gdGhlcmUuXG4gIGNtb3YoYTogYmlnaW50LCBiOiBiaWdpbnQsIGNvbmRpdGlvbjogYm9vbGVhbikge1xuICAgIHJldHVybiBjb25kaXRpb24gPyBiIDogYTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBmaW5pdGUgZmllbGQuIE1ham9yIHBlcmZvcm1hbmNlIG9wdGltaXphdGlvbnM6XG4gKiAqIDEuIERlbm9ybWFsaXplZCBvcGVyYXRpb25zIGxpa2UgbXVsTiBpbnN0ZWFkIG9mIG11bC5cbiAqICogMi4gSWRlbnRpY2FsIG9iamVjdCBzaGFwZTogbmV2ZXIgYWRkIG9yIHJlbW92ZSBrZXlzLlxuICogKiAzLiBgT2JqZWN0LmZyZWV6ZWAuXG4gKiBGcmFnaWxlOiBhbHdheXMgcnVuIGEgYmVuY2htYXJrIG9uIGEgY2hhbmdlLlxuICogU2VjdXJpdHkgbm90ZTogb3BlcmF0aW9ucyBkb24ndCBjaGVjayAnaXNWYWxpZCcgZm9yIGFsbCBlbGVtZW50cyBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucyxcbiAqIGl0IGlzIGNhbGxlciByZXNwb25zaWJpbGl0eSB0byBjaGVjayB0aGlzLlxuICogVGhpcyBpcyBsb3ctbGV2ZWwgY29kZSwgcGxlYXNlIG1ha2Ugc3VyZSB5b3Uga25vdyB3aGF0IHlvdSdyZSBkb2luZy5cbiAqXG4gKiBOb3RlIGFib3V0IGZpZWxkIHByb3BlcnRpZXM6XG4gKiAqIENIQVJBQ1RFUklTVElDIHAgPSBwcmltZSBudW1iZXIsIG51bWJlciBvZiBlbGVtZW50cyBpbiBtYWluIHN1Ymdyb3VwLlxuICogKiBPUkRFUiBxID0gc2ltaWxhciB0byBjb2ZhY3RvciBpbiBjdXJ2ZXMsIG1heSBiZSBjb21wb3NpdGUgYHEgPSBwXm1gLlxuICpcbiAqIEBwYXJhbSBPUkRFUiBmaWVsZCBvcmRlciwgcHJvYmFibHkgcHJpbWUsIG9yIGNvdWxkIGJlIGNvbXBvc2l0ZVxuICogQHBhcmFtIGJpdExlbiBob3cgbWFueSBiaXRzIHRoZSBmaWVsZCBjb25zdW1lc1xuICogQHBhcmFtIGlzTEUgKGRlZmF1bHQ6IGZhbHNlKSBpZiBlbmNvZGluZyAvIGRlY29kaW5nIHNob3VsZCBiZSBpbiBsaXR0bGUtZW5kaWFuXG4gKiBAcGFyYW0gcmVkZWYgb3B0aW9uYWwgZmFzdGVyIHJlZGVmaW5pdGlvbnMgb2Ygc3FydCBhbmQgb3RoZXIgbWV0aG9kc1xuICovXG5leHBvcnQgZnVuY3Rpb24gRmllbGQoT1JERVI6IGJpZ2ludCwgb3B0czogRmllbGRPcHRzID0ge30pOiBSZWFkb25seTxGcEZpZWxkPiB7XG4gIHJldHVybiBuZXcgX0ZpZWxkKE9SREVSLCBvcHRzKTtcbn1cblxuLy8gR2VuZXJpYyByYW5kb20gc2NhbGFyLCB3ZSBjYW4gZG8gc2FtZSBmb3Igb3RoZXIgZmllbGRzIGlmIHZpYSBGcDIubXVsKEZwMi5PTkUsIEZwMi5yYW5kb20pP1xuLy8gVGhpcyBhbGxvd3MgdW5zYWZlIG1ldGhvZHMgbGlrZSBpZ25vcmUgYmlhcyBvciB6ZXJvLiBUaGVzZSB1bnNhZmUsIGJ1dCBvZnRlbiB1c2VkIGluIGRpZmZlcmVudCBwcm90b2NvbHMgKGlmIGRldGVybWluaXN0aWMgUk5HKS5cbi8vIHdoaWNoIG1lYW4gd2UgY2Fubm90IGZvcmNlIHRoaXMgdmlhIG9wdHMuXG4vLyBOb3Qgc3VyZSB3aGF0IHRvIGRvIHdpdGggcmFuZG9tQnl0ZXMsIHdlIGNhbiBhY2NlcHQgaXQgaW5zaWRlIG9wdHMgaWYgd2FudGVkLlxuLy8gUHJvYmFibHkgbmVlZCB0byBleHBvcnQgZ2V0TWluSGFzaExlbmd0aCBzb21ld2hlcmU/XG4vLyByYW5kb20oYnl0ZXM/OiBVaW50OEFycmF5LCB1bnNhZmVBbGxvd1plcm8gPSBmYWxzZSwgdW5zYWZlQWxsb3dCaWFzID0gZmFsc2UpIHtcbi8vICAgY29uc3QgTEVOID0gIXVuc2FmZUFsbG93QmlhcyA/IGdldE1pbkhhc2hMZW5ndGgoT1JERVIpIDogQllURVM7XG4vLyAgIGlmIChieXRlcyA9PT0gdW5kZWZpbmVkKSBieXRlcyA9IHJhbmRvbUJ5dGVzKExFTik7IC8vIF9vcHRzLnJhbmRvbUJ5dGVzP1xuLy8gICBjb25zdCBudW0gPSBpc0xFID8gYnl0ZXNUb051bWJlckxFKGJ5dGVzKSA6IGJ5dGVzVG9OdW1iZXJCRShieXRlcyk7XG4vLyAgIC8vIGBtb2QoeCwgMTEpYCBjYW4gc29tZXRpbWVzIHByb2R1Y2UgMC4gYG1vZCh4LCAxMCkgKyAxYCBpcyB0aGUgc2FtZSwgYnV0IG5vIDBcbi8vICAgY29uc3QgcmVkdWNlZCA9IHVuc2FmZUFsbG93WmVybyA/IG1vZChudW0sIE9SREVSKSA6IG1vZChudW0sIE9SREVSIC0gXzFuKSArIF8xbjtcbi8vICAgcmV0dXJuIHJlZHVjZWQ7XG4vLyB9LFxuXG5leHBvcnQgZnVuY3Rpb24gRnBTcXJ0T2RkPFQ+KEZwOiBJRmllbGQ8VD4sIGVsbTogVCk6IFQge1xuICBpZiAoIUZwLmlzT2RkKSB0aHJvdyBuZXcgRXJyb3IoXCJGaWVsZCBkb2Vzbid0IGhhdmUgaXNPZGRcIik7XG4gIGNvbnN0IHJvb3QgPSBGcC5zcXJ0KGVsbSk7XG4gIHJldHVybiBGcC5pc09kZChyb290KSA/IHJvb3QgOiBGcC5uZWcocm9vdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBGcFNxcnRFdmVuPFQ+KEZwOiBJRmllbGQ8VD4sIGVsbTogVCk6IFQge1xuICBpZiAoIUZwLmlzT2RkKSB0aHJvdyBuZXcgRXJyb3IoXCJGaWVsZCBkb2Vzbid0IGhhdmUgaXNPZGRcIik7XG4gIGNvbnN0IHJvb3QgPSBGcC5zcXJ0KGVsbSk7XG4gIHJldHVybiBGcC5pc09kZChyb290KSA/IEZwLm5lZyhyb290KSA6IHJvb3Q7XG59XG5cbi8qKlxuICogUmV0dXJucyB0b3RhbCBudW1iZXIgb2YgYnl0ZXMgY29uc3VtZWQgYnkgdGhlIGZpZWxkIGVsZW1lbnQuXG4gKiBGb3IgZXhhbXBsZSwgMzIgYnl0ZXMgZm9yIHVzdWFsIDI1Ni1iaXQgd2VpZXJzdHJhc3MgY3VydmUuXG4gKiBAcGFyYW0gZmllbGRPcmRlciBudW1iZXIgb2YgZmllbGQgZWxlbWVudHMsIHVzdWFsbHkgQ1VSVkUublxuICogQHJldHVybnMgYnl0ZSBsZW5ndGggb2YgZmllbGRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEZpZWxkQnl0ZXNMZW5ndGgoZmllbGRPcmRlcjogYmlnaW50KTogbnVtYmVyIHtcbiAgaWYgKHR5cGVvZiBmaWVsZE9yZGVyICE9PSAnYmlnaW50JykgdGhyb3cgbmV3IEVycm9yKCdmaWVsZCBvcmRlciBtdXN0IGJlIGJpZ2ludCcpO1xuICBjb25zdCBiaXRMZW5ndGggPSBmaWVsZE9yZGVyLnRvU3RyaW5nKDIpLmxlbmd0aDtcbiAgcmV0dXJuIE1hdGguY2VpbChiaXRMZW5ndGggLyA4KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIG1pbmltYWwgYW1vdW50IG9mIGJ5dGVzIHRoYXQgY2FuIGJlIHNhZmVseSByZWR1Y2VkXG4gKiBieSBmaWVsZCBvcmRlci5cbiAqIFNob3VsZCBiZSAyXi0xMjggZm9yIDEyOC1iaXQgY3VydmUgc3VjaCBhcyBQMjU2LlxuICogQHBhcmFtIGZpZWxkT3JkZXIgbnVtYmVyIG9mIGZpZWxkIGVsZW1lbnRzLCB1c3VhbGx5IENVUlZFLm5cbiAqIEByZXR1cm5zIGJ5dGUgbGVuZ3RoIG9mIHRhcmdldCBoYXNoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRNaW5IYXNoTGVuZ3RoKGZpZWxkT3JkZXI6IGJpZ2ludCk6IG51bWJlciB7XG4gIGNvbnN0IGxlbmd0aCA9IGdldEZpZWxkQnl0ZXNMZW5ndGgoZmllbGRPcmRlcik7XG4gIHJldHVybiBsZW5ndGggKyBNYXRoLmNlaWwobGVuZ3RoIC8gMik7XG59XG5cbi8qKlxuICogXCJDb25zdGFudC10aW1lXCIgcHJpdmF0ZSBrZXkgZ2VuZXJhdGlvbiB1dGlsaXR5LlxuICogQ2FuIHRha2UgKG4gKyBuLzIpIG9yIG1vcmUgYnl0ZXMgb2YgdW5pZm9ybSBpbnB1dCBlLmcuIGZyb20gQ1NQUk5HIG9yIEtERlxuICogYW5kIGNvbnZlcnQgdGhlbSBpbnRvIHByaXZhdGUgc2NhbGFyLCB3aXRoIHRoZSBtb2R1bG8gYmlhcyBiZWluZyBuZWdsaWdpYmxlLlxuICogTmVlZHMgYXQgbGVhc3QgNDggYnl0ZXMgb2YgaW5wdXQgZm9yIDMyLWJ5dGUgcHJpdmF0ZSBrZXkuXG4gKiBodHRwczovL3Jlc2VhcmNoLmt1ZGVsc2tpc2VjdXJpdHkuY29tLzIwMjAvMDcvMjgvdGhlLWRlZmluaXRpdmUtZ3VpZGUtdG8tbW9kdWxvLWJpYXMtYW5kLWhvdy10by1hdm9pZC1pdC9cbiAqIEZJUFMgMTg2LTUsIEEuMiBodHRwczovL2NzcmMubmlzdC5nb3YvcHVibGljYXRpb25zL2RldGFpbC9maXBzLzE4Ni81L2ZpbmFsXG4gKiBSRkMgOTM4MCwgaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzkzODAjc2VjdGlvbi01XG4gKiBAcGFyYW0gaGFzaCBoYXNoIG91dHB1dCBmcm9tIFNIQTMgb3IgYSBzaW1pbGFyIGZ1bmN0aW9uXG4gKiBAcGFyYW0gZ3JvdXBPcmRlciBzaXplIG9mIHN1Ymdyb3VwIC0gKGUuZy4gc2VjcDI1NmsxLlBvaW50LkZuLk9SREVSKVxuICogQHBhcmFtIGlzTEUgaW50ZXJwcmV0IGhhc2ggYnl0ZXMgYXMgTEUgbnVtXG4gKiBAcmV0dXJucyB2YWxpZCBwcml2YXRlIHNjYWxhclxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFwSGFzaFRvRmllbGQoa2V5OiBVaW50OEFycmF5LCBmaWVsZE9yZGVyOiBiaWdpbnQsIGlzTEUgPSBmYWxzZSk6IFVpbnQ4QXJyYXkge1xuICBhYnl0ZXMoa2V5KTtcbiAgY29uc3QgbGVuID0ga2V5Lmxlbmd0aDtcbiAgY29uc3QgZmllbGRMZW4gPSBnZXRGaWVsZEJ5dGVzTGVuZ3RoKGZpZWxkT3JkZXIpO1xuICBjb25zdCBtaW5MZW4gPSBnZXRNaW5IYXNoTGVuZ3RoKGZpZWxkT3JkZXIpO1xuICAvLyBObyBzbWFsbCBudW1iZXJzOiBuZWVkIHRvIHVuZGVyc3RhbmQgYmlhcyBzdG9yeS4gTm8gaHVnZSBudW1iZXJzOiBlYXNpZXIgdG8gZGV0ZWN0IEpTIHRpbWluZ3MuXG4gIGlmIChsZW4gPCAxNiB8fCBsZW4gPCBtaW5MZW4gfHwgbGVuID4gMTAyNClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2V4cGVjdGVkICcgKyBtaW5MZW4gKyAnLTEwMjQgYnl0ZXMgb2YgaW5wdXQsIGdvdCAnICsgbGVuKTtcbiAgY29uc3QgbnVtID0gaXNMRSA/IGJ5dGVzVG9OdW1iZXJMRShrZXkpIDogYnl0ZXNUb051bWJlckJFKGtleSk7XG4gIC8vIGBtb2QoeCwgMTEpYCBjYW4gc29tZXRpbWVzIHByb2R1Y2UgMC4gYG1vZCh4LCAxMCkgKyAxYCBpcyB0aGUgc2FtZSwgYnV0IG5vIDBcbiAgY29uc3QgcmVkdWNlZCA9IG1vZChudW0sIGZpZWxkT3JkZXIgLSBfMW4pICsgXzFuO1xuICByZXR1cm4gaXNMRSA/IG51bWJlclRvQnl0ZXNMRShyZWR1Y2VkLCBmaWVsZExlbikgOiBudW1iZXJUb0J5dGVzQkUocmVkdWNlZCwgZmllbGRMZW4pO1xufVxuIiwgIi8qKlxuICogU2hvcnQgV2VpZXJzdHJhc3MgY3VydmUgbWV0aG9kcy4gVGhlIGZvcm11bGEgaXM6IHlcdTAwQjIgPSB4XHUwMEIzICsgYXggKyBiLlxuICpcbiAqICMjIyBEZXNpZ24gcmF0aW9uYWxlIGZvciB0eXBlc1xuICpcbiAqICogSW50ZXJhY3Rpb24gYmV0d2VlbiBjbGFzc2VzIGZyb20gZGlmZmVyZW50IGN1cnZlcyBzaG91bGQgZmFpbDpcbiAqICAgYGsyNTYuUG9pbnQuQkFTRS5hZGQocDI1Ni5Qb2ludC5CQVNFKWBcbiAqICogRm9yIHRoaXMgcHVycG9zZSB3ZSB3YW50IHRvIHVzZSBgaW5zdGFuY2VvZmAgb3BlcmF0b3IsIHdoaWNoIGlzIGZhc3QgYW5kIHdvcmtzIGR1cmluZyBydW50aW1lXG4gKiAqIERpZmZlcmVudCBjYWxscyBvZiBgY3VydmUoKWAgd291bGQgcmV0dXJuIGRpZmZlcmVudCBjbGFzc2VzIC1cbiAqICAgYGN1cnZlKHBhcmFtcykgIT09IGN1cnZlKHBhcmFtcylgOiBpZiBzb21lYm9keSBkZWNpZGVkIHRvIG1vbmtleS1wYXRjaCB0aGVpciBjdXJ2ZSxcbiAqICAgaXQgd29uJ3QgYWZmZWN0IG90aGVyc1xuICpcbiAqIFR5cGVTY3JpcHQgY2FuJ3QgaW5mZXIgdHlwZXMgZm9yIGNsYXNzZXMgY3JlYXRlZCBpbnNpZGUgYSBmdW5jdGlvbi4gQ2xhc3NlcyBpcyBvbmUgaW5zdGFuY2VcbiAqIG9mIG5vbWluYXRpdmUgdHlwZXMgaW4gVHlwZVNjcmlwdCBhbmQgaW50ZXJmYWNlcyBvbmx5IGNoZWNrIGZvciBzaGFwZSwgc28gaXQncyBoYXJkIHRvIGNyZWF0ZVxuICogdW5pcXVlIHR5cGUgZm9yIGV2ZXJ5IGZ1bmN0aW9uIGNhbGwuXG4gKlxuICogV2UgY2FuIHVzZSBnZW5lcmljIHR5cGVzIHZpYSBzb21lIHBhcmFtLCBsaWtlIGN1cnZlIG9wdHMsIGJ1dCB0aGF0IHdvdWxkOlxuICogICAgIDEuIEVuYWJsZSBpbnRlcmFjdGlvbiBiZXR3ZWVuIGBjdXJ2ZShwYXJhbXMpYCBhbmQgYGN1cnZlKHBhcmFtcylgIChjdXJ2ZXMgb2Ygc2FtZSBwYXJhbXMpXG4gKiAgICAgd2hpY2ggaXMgaGFyZCB0byBkZWJ1Zy5cbiAqICAgICAyLiBQYXJhbXMgY2FuIGJlIGdlbmVyaWMgYW5kIHdlIGNhbid0IGVuZm9yY2UgdGhlbSB0byBiZSBjb25zdGFudCB2YWx1ZTpcbiAqICAgICBpZiBzb21lYm9keSBjcmVhdGVzIGN1cnZlIGZyb20gbm9uLWNvbnN0YW50IHBhcmFtcyxcbiAqICAgICBpdCB3b3VsZCBiZSBhbGxvd2VkIHRvIGludGVyYWN0IHdpdGggb3RoZXIgY3VydmVzIHdpdGggbm9uLWNvbnN0YW50IHBhcmFtc1xuICpcbiAqIEB0b2RvIGh0dHBzOi8vd3d3LnR5cGVzY3JpcHRsYW5nLm9yZy9kb2NzL2hhbmRib29rL3JlbGVhc2Utbm90ZXMvdHlwZXNjcmlwdC0yLTcuaHRtbCN1bmlxdWUtc3ltYm9sXG4gKiBAbW9kdWxlXG4gKi9cbi8qISBub2JsZS1jdXJ2ZXMgLSBNSVQgTGljZW5zZSAoYykgMjAyMiBQYXVsIE1pbGxlciAocGF1bG1pbGxyLmNvbSkgKi9cbmltcG9ydCB7IGhtYWMgYXMgbm9ibGVIbWFjIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9obWFjLmpzJztcbmltcG9ydCB7IGFoYXNoIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQge1xuICBhYm9vbCxcbiAgYWJ5dGVzLFxuICBhSW5SYW5nZSxcbiAgYml0TGVuLFxuICBiaXRNYXNrLFxuICBieXRlc1RvSGV4LFxuICBieXRlc1RvTnVtYmVyQkUsXG4gIGNvbmNhdEJ5dGVzLFxuICBjcmVhdGVIbWFjRHJiZyxcbiAgaGV4VG9CeXRlcyxcbiAgaXNCeXRlcyxcbiAgbWVtb2l6ZWQsXG4gIG51bWJlclRvSGV4VW5wYWRkZWQsXG4gIHZhbGlkYXRlT2JqZWN0LFxuICByYW5kb21CeXRlcyBhcyB3Y1JhbmRvbUJ5dGVzLFxuICB0eXBlIENIYXNoLFxuICB0eXBlIFNpZ25lcixcbn0gZnJvbSAnLi4vdXRpbHMudHMnO1xuaW1wb3J0IHtcbiAgY3JlYXRlQ3VydmVGaWVsZHMsXG4gIGNyZWF0ZUtleWdlbixcbiAgbXVsRW5kb1Vuc2FmZSxcbiAgbmVnYXRlQ3QsXG4gIG5vcm1hbGl6ZVosXG4gIHdOQUYsXG4gIHR5cGUgQWZmaW5lUG9pbnQsXG4gIHR5cGUgQ3VydmVMZW5ndGhzLFxuICB0eXBlIEN1cnZlUG9pbnQsXG4gIHR5cGUgQ3VydmVQb2ludENvbnMsXG59IGZyb20gJy4vY3VydmUudHMnO1xuaW1wb3J0IHtcbiAgRnBJbnZlcnRCYXRjaCxcbiAgZ2V0TWluSGFzaExlbmd0aCxcbiAgbWFwSGFzaFRvRmllbGQsXG4gIHZhbGlkYXRlRmllbGQsXG4gIHR5cGUgSUZpZWxkLFxufSBmcm9tICcuL21vZHVsYXIudHMnO1xuXG5leHBvcnQgdHlwZSB7IEFmZmluZVBvaW50IH07XG5cbnR5cGUgRW5kb0Jhc2lzID0gW1tiaWdpbnQsIGJpZ2ludF0sIFtiaWdpbnQsIGJpZ2ludF1dO1xuLyoqXG4gKiBXaGVuIFdlaWVyc3RyYXNzIGN1cnZlIGhhcyBgYT0wYCwgaXQgYmVjb21lcyBLb2JsaXR6IGN1cnZlLlxuICogS29ibGl0eiBjdXJ2ZXMgYWxsb3cgdXNpbmcgKiplZmZpY2llbnRseS1jb21wdXRhYmxlIEdMViBlbmRvbW9ycGhpc20gXHUwM0M4KiouXG4gKiBFbmRvbW9ycGhpc20gdXNlcyAyeCBsZXNzIFJBTSwgc3BlZWRzIHVwIHByZWNvbXB1dGF0aW9uIGJ5IDJ4IGFuZCBFQ0RIIC8ga2V5IHJlY292ZXJ5IGJ5IDIwJS5cbiAqIEZvciBwcmVjb21wdXRlZCB3TkFGIGl0IHRyYWRlcyBvZmYgMS8yIGluaXQgdGltZSAmIDEvMyByYW0gZm9yIDIwJSBwZXJmIGhpdC5cbiAqXG4gKiBFbmRvbW9ycGhpc20gY29uc2lzdHMgb2YgYmV0YSwgbGFtYmRhIGFuZCBzcGxpdFNjYWxhcjpcbiAqXG4gKiAxLiBHTFYgZW5kb21vcnBoaXNtIFx1MDNDOCB0cmFuc2Zvcm1zIGEgcG9pbnQ6IGBQID0gKHgsIHkpIFx1MjFBNiBcdTAzQzgoUCkgPSAoXHUwM0IyXHUwMEI3eCBtb2QgcCwgeSlgXG4gKiAyLiBHTFYgc2NhbGFyIGRlY29tcG9zaXRpb24gdHJhbnNmb3JtcyBhIHNjYWxhcjogYGsgXHUyMjYxIGtcdTIwODEgKyBrXHUyMDgyXHUwMEI3XHUwM0JCIChtb2QgbilgXG4gKiAzLiBUaGVuIHRoZXNlIGFyZSBjb21iaW5lZDogYGtcdTAwQjdQID0ga1x1MjA4MVx1MDBCN1AgKyBrXHUyMDgyXHUwMEI3XHUwM0M4KFApYFxuICogNC4gVHdvIDEyOC1iaXQgcG9pbnQtYnktc2NhbGFyIG11bHRpcGxpY2F0aW9ucyArIG9uZSBwb2ludCBhZGRpdGlvbiBpcyBmYXN0ZXIgdGhhblxuICogICAgb25lIDI1Ni1iaXQgbXVsdGlwbGljYXRpb24uXG4gKlxuICogd2hlcmVcbiAqICogYmV0YTogXHUwM0IyIFx1MjIwOCBGXHUyMDlBIHdpdGggXHUwM0IyXHUwMEIzID0gMSwgXHUwM0IyIFx1MjI2MCAxXG4gKiAqIGxhbWJkYTogXHUwM0JCIFx1MjIwOCBGXHUyMDk5IHdpdGggXHUwM0JCXHUwMEIzID0gMSwgXHUwM0JCIFx1MjI2MCAxXG4gKiAqIHNwbGl0U2NhbGFyIGRlY29tcG9zZXMgayBcdTIxQTYga1x1MjA4MSwga1x1MjA4MiwgYnkgdXNpbmcgcmVkdWNlZCBiYXNpcyB2ZWN0b3JzLlxuICogICBHYXVzcyBsYXR0aWNlIHJlZHVjdGlvbiBjYWxjdWxhdGVzIHRoZW0gZnJvbSBpbml0aWFsIGJhc2lzIHZlY3RvcnMgYChuLCAwKSwgKC1cdTAzQkIsIDApYFxuICpcbiAqIENoZWNrIG91dCBgdGVzdC9taXNjL2VuZG9tb3JwaGlzbS5qc2AgYW5kXG4gKiBbZ2lzdF0oaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vcGF1bG1pbGxyL2ViNjcwODA2NzkzZTg0ZGY2MjhhN2M0MzRhODczMDY2KS5cbiAqL1xuZXhwb3J0IHR5cGUgRW5kb21vcnBoaXNtT3B0cyA9IHtcbiAgYmV0YTogYmlnaW50O1xuICBiYXNpc2VzPzogRW5kb0Jhc2lzO1xuICBzcGxpdFNjYWxhcj86IChrOiBiaWdpbnQpID0+IHsgazFuZWc6IGJvb2xlYW47IGsxOiBiaWdpbnQ7IGsybmVnOiBib29sZWFuOyBrMjogYmlnaW50IH07XG59O1xuLy8gV2UgY29uc3RydWN0IGJhc2lzIGluIHN1Y2ggd2F5IHRoYXQgZGVuIGlzIGFsd2F5cyBwb3NpdGl2ZSBhbmQgZXF1YWxzIG4sIGJ1dCBudW0gc2lnbiBkZXBlbmRzIG9uIGJhc2lzIChub3Qgb24gc2VjcmV0IHZhbHVlKVxuY29uc3QgZGl2TmVhcmVzdCA9IChudW06IGJpZ2ludCwgZGVuOiBiaWdpbnQpID0+IChudW0gKyAobnVtID49IDAgPyBkZW4gOiAtZGVuKSAvIF8ybikgLyBkZW47XG5cbmV4cG9ydCB0eXBlIFNjYWxhckVuZG9QYXJ0cyA9IHsgazFuZWc6IGJvb2xlYW47IGsxOiBiaWdpbnQ7IGsybmVnOiBib29sZWFuOyBrMjogYmlnaW50IH07XG5cbi8qKlxuICogU3BsaXRzIHNjYWxhciBmb3IgR0xWIGVuZG9tb3JwaGlzbS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9zcGxpdEVuZG9TY2FsYXIoazogYmlnaW50LCBiYXNpczogRW5kb0Jhc2lzLCBuOiBiaWdpbnQpOiBTY2FsYXJFbmRvUGFydHMge1xuICAvLyBTcGxpdCBzY2FsYXIgaW50byB0d28gc3VjaCB0aGF0IHBhcnQgaXMgfmhhbGYgYml0czogYGFicyhwYXJ0KSA8IHNxcnQoTilgXG4gIC8vIFNpbmNlIHBhcnQgY2FuIGJlIG5lZ2F0aXZlLCB3ZSBuZWVkIHRvIGRvIHRoaXMgb24gcG9pbnQuXG4gIC8vIFRPRE86IHZlcmlmeVNjYWxhciBmdW5jdGlvbiB3aGljaCBjb25zdW1lcyBsYW1iZGFcbiAgY29uc3QgW1thMSwgYjFdLCBbYTIsIGIyXV0gPSBiYXNpcztcbiAgY29uc3QgYzEgPSBkaXZOZWFyZXN0KGIyICogaywgbik7XG4gIGNvbnN0IGMyID0gZGl2TmVhcmVzdCgtYjEgKiBrLCBuKTtcbiAgLy8gfGsxfC98azJ8IGlzIDwgc3FydChOKSwgYnV0IGNhbiBiZSBuZWdhdGl2ZS5cbiAgLy8gSWYgd2UgZG8gYGsxIG1vZCBOYCwgd2UnbGwgZ2V0IGJpZyBzY2FsYXIgKGA+IHNxcnQoTilgKTogc28sIHdlIGRvIGNoZWFwZXIgbmVnYXRpb24gaW5zdGVhZC5cbiAgbGV0IGsxID0gayAtIGMxICogYTEgLSBjMiAqIGEyO1xuICBsZXQgazIgPSAtYzEgKiBiMSAtIGMyICogYjI7XG4gIGNvbnN0IGsxbmVnID0gazEgPCBfMG47XG4gIGNvbnN0IGsybmVnID0gazIgPCBfMG47XG4gIGlmIChrMW5lZykgazEgPSAtazE7XG4gIGlmIChrMm5lZykgazIgPSAtazI7XG4gIC8vIERvdWJsZSBjaGVjayB0aGF0IHJlc3VsdGluZyBzY2FsYXIgbGVzcyB0aGFuIGhhbGYgYml0cyBvZiBOOiBvdGhlcndpc2Ugd05BRiB3aWxsIGZhaWwuXG4gIC8vIFRoaXMgc2hvdWxkIG9ubHkgaGFwcGVuIG9uIHdyb25nIGJhc2lzZXMuIEFsc28sIG1hdGggaW5zaWRlIGlzIHRvbyBjb21wbGV4IGFuZCBJIGRvbid0IHRydXN0IGl0LlxuICBjb25zdCBNQVhfTlVNID0gYml0TWFzayhNYXRoLmNlaWwoYml0TGVuKG4pIC8gMikpICsgXzFuOyAvLyBIYWxmIGJpdHMgb2YgTlxuICBpZiAoazEgPCBfMG4gfHwgazEgPj0gTUFYX05VTSB8fCBrMiA8IF8wbiB8fCBrMiA+PSBNQVhfTlVNKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzcGxpdFNjYWxhciAoZW5kb21vcnBoaXNtKTogZmFpbGVkLCBrPScgKyBrKTtcbiAgfVxuICByZXR1cm4geyBrMW5lZywgazEsIGsybmVnLCBrMiB9O1xufVxuXG4vKipcbiAqIE9wdGlvbiB0byBlbmFibGUgaGVkZ2VkIHNpZ25hdHVyZXMgd2l0aCBpbXByb3ZlZCBzZWN1cml0eS5cbiAqXG4gKiAqIFJhbmRvbWx5IGdlbmVyYXRlZCBrIGlzIGJhZCwgYmVjYXVzZSBicm9rZW4gQ1NQUk5HIHdvdWxkIGxlYWsgcHJpdmF0ZSBrZXlzLlxuICogKiBEZXRlcm1pbmlzdGljIGsgKFJGQzY5NzkpIGlzIGJldHRlcjsgYnV0IGlzIHN1c3BlY3RpYmxlIHRvIGZhdWx0IGF0dGFja3MuXG4gKlxuICogV2UgYWxsb3cgdXNpbmcgdGVjaG5pcXVlIGRlc2NyaWJlZCBpbiBSRkM2OTc5IDMuNjogYWRkaXRpb25hbCBrJywgYS5rLmEuIGFkZGluZyByYW5kb21uZXNzXG4gKiB0byBkZXRlcm1pbmlzdGljIHNpZy4gSWYgQ1NQUk5HIGlzIGJyb2tlbiAmIHJhbmRvbW5lc3MgaXMgd2VhaywgaXQgd291bGQgU1RJTEwgYmUgYXMgc2VjdXJlXG4gKiBhcyBvcmRpbmFyeSBzaWcgd2l0aG91dCBFeHRyYUVudHJvcHkuXG4gKlxuICogKiBgdHJ1ZWAgbWVhbnMgXCJmZXRjaCBkYXRhLCBmcm9tIENTUFJORywgaW5jb3Jwb3JhdGUgaXQgaW50byBrIGdlbmVyYXRpb25cIlxuICogKiBgZmFsc2VgIG1lYW5zIFwiZGlzYWJsZSBleHRyYSBlbnRyb3B5LCB1c2UgcHVyZWx5IGRldGVybWluaXN0aWMga1wiXG4gKiAqIGBVaW50OEFycmF5YCBwYXNzZWQgbWVhbnMgXCJpbmNvcnBvcmF0ZSBmb2xsb3dpbmcgZGF0YSBpbnRvIGsgZ2VuZXJhdGlvblwiXG4gKlxuICogaHR0cHM6Ly9wYXVsbWlsbHIuY29tL3Bvc3RzL2RldGVybWluaXN0aWMtc2lnbmF0dXJlcy9cbiAqL1xuZXhwb3J0IHR5cGUgRUNEU0FFeHRyYUVudHJvcHkgPSBib29sZWFuIHwgVWludDhBcnJheTtcbi8qKlxuICogLSBgY29tcGFjdGAgaXMgdGhlIGRlZmF1bHQgZm9ybWF0XG4gKiAtIGByZWNvdmVyZWRgIGlzIHRoZSBzYW1lIGFzIGNvbXBhY3QsIGJ1dCB3aXRoIGFuIGV4dHJhIGJ5dGUgaW5kaWNhdGluZyByZWNvdmVyeSBieXRlXG4gKiAtIGBkZXJgIGlzIEFTTi4xIERFUiBlbmNvZGluZ1xuICovXG5leHBvcnQgdHlwZSBFQ0RTQVNpZ25hdHVyZUZvcm1hdCA9ICdjb21wYWN0JyB8ICdyZWNvdmVyZWQnIHwgJ2Rlcic7XG4vKipcbiAqIC0gYHByZWhhc2hgOiAoZGVmYXVsdDogdHJ1ZSkgaW5kaWNhdGVzIHdoZXRoZXIgdG8gZG8gc2hhMjU2KG1lc3NhZ2UpLlxuICogICBXaGVuIGEgY3VzdG9tIGhhc2ggaXMgdXNlZCwgaXQgbXVzdCBiZSBzZXQgdG8gYGZhbHNlYC5cbiAqL1xuZXhwb3J0IHR5cGUgRUNEU0FSZWNvdmVyT3B0cyA9IHtcbiAgcHJlaGFzaD86IGJvb2xlYW47XG59O1xuLyoqXG4gKiAtIGBwcmVoYXNoYDogKGRlZmF1bHQ6IHRydWUpIGluZGljYXRlcyB3aGV0aGVyIHRvIGRvIHNoYTI1NihtZXNzYWdlKS5cbiAqICAgV2hlbiBhIGN1c3RvbSBoYXNoIGlzIHVzZWQsIGl0IG11c3QgYmUgc2V0IHRvIGBmYWxzZWAuXG4gKiAtIGBsb3dTYDogKGRlZmF1bHQ6IHRydWUpIHByb2hpYml0cyBzaWduYXR1cmVzIHdoaWNoIGhhdmUgKHNpZy5zID49IENVUlZFLm4vMm4pLlxuICogICBDb21wYXRpYmxlIHdpdGggQlRDL0VUSC4gU2V0dGluZyBgbG93UzogZmFsc2VgIGFsbG93cyB0byBjcmVhdGUgbWFsbGVhYmxlIHNpZ25hdHVyZXMsXG4gKiAgIHdoaWNoIGlzIGRlZmF1bHQgb3BlbnNzbCBiZWhhdmlvci5cbiAqICAgTm9uLW1hbGxlYWJsZSBzaWduYXR1cmVzIGNhbiBzdGlsbCBiZSBzdWNjZXNzZnVsbHkgdmVyaWZpZWQgaW4gb3BlbnNzbC5cbiAqIC0gYGZvcm1hdGA6IChkZWZhdWx0OiAnY29tcGFjdCcpICdjb21wYWN0JyBvciAncmVjb3ZlcmVkJyB3aXRoIHJlY292ZXJ5IGJ5dGVcbiAqL1xuZXhwb3J0IHR5cGUgRUNEU0FWZXJpZnlPcHRzID0ge1xuICBwcmVoYXNoPzogYm9vbGVhbjtcbiAgbG93Uz86IGJvb2xlYW47XG4gIGZvcm1hdD86IEVDRFNBU2lnbmF0dXJlRm9ybWF0O1xufTtcbi8qKlxuICogLSBgcHJlaGFzaGA6IChkZWZhdWx0OiB0cnVlKSBpbmRpY2F0ZXMgd2hldGhlciB0byBkbyBzaGEyNTYobWVzc2FnZSkuXG4gKiAgIFdoZW4gYSBjdXN0b20gaGFzaCBpcyB1c2VkLCBpdCBtdXN0IGJlIHNldCB0byBgZmFsc2VgLlxuICogLSBgbG93U2A6IChkZWZhdWx0OiB0cnVlKSBwcm9oaWJpdHMgc2lnbmF0dXJlcyB3aGljaCBoYXZlIChzaWcucyA+PSBDVVJWRS5uLzJuKS5cbiAqICAgQ29tcGF0aWJsZSB3aXRoIEJUQy9FVEguIFNldHRpbmcgYGxvd1M6IGZhbHNlYCBhbGxvd3MgdG8gY3JlYXRlIG1hbGxlYWJsZSBzaWduYXR1cmVzLFxuICogICB3aGljaCBpcyBkZWZhdWx0IG9wZW5zc2wgYmVoYXZpb3IuXG4gKiAgIE5vbi1tYWxsZWFibGUgc2lnbmF0dXJlcyBjYW4gc3RpbGwgYmUgc3VjY2Vzc2Z1bGx5IHZlcmlmaWVkIGluIG9wZW5zc2wuXG4gKiAtIGBmb3JtYXRgOiAoZGVmYXVsdDogJ2NvbXBhY3QnKSAnY29tcGFjdCcgb3IgJ3JlY292ZXJlZCcgd2l0aCByZWNvdmVyeSBieXRlXG4gKiAtIGBleHRyYUVudHJvcHlgOiAoZGVmYXVsdDogZmFsc2UpIGNyZWF0ZXMgc2lncyB3aXRoIGluY3JlYXNlZCBzZWN1cml0eSwgc2VlIHtAbGluayBFQ0RTQUV4dHJhRW50cm9weX1cbiAqL1xuZXhwb3J0IHR5cGUgRUNEU0FTaWduT3B0cyA9IHtcbiAgcHJlaGFzaD86IGJvb2xlYW47XG4gIGxvd1M/OiBib29sZWFuO1xuICBmb3JtYXQ/OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdDtcbiAgZXh0cmFFbnRyb3B5PzogRUNEU0FFeHRyYUVudHJvcHk7XG59O1xuXG5mdW5jdGlvbiB2YWxpZGF0ZVNpZ0Zvcm1hdChmb3JtYXQ6IHN0cmluZyk6IEVDRFNBU2lnbmF0dXJlRm9ybWF0IHtcbiAgaWYgKCFbJ2NvbXBhY3QnLCAncmVjb3ZlcmVkJywgJ2RlciddLmluY2x1ZGVzKGZvcm1hdCkpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdTaWduYXR1cmUgZm9ybWF0IG11c3QgYmUgXCJjb21wYWN0XCIsIFwicmVjb3ZlcmVkXCIsIG9yIFwiZGVyXCInKTtcbiAgcmV0dXJuIGZvcm1hdCBhcyBFQ0RTQVNpZ25hdHVyZUZvcm1hdDtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVTaWdPcHRzPFQgZXh0ZW5kcyBFQ0RTQVNpZ25PcHRzLCBEIGV4dGVuZHMgUmVxdWlyZWQ8RUNEU0FTaWduT3B0cz4+KFxuICBvcHRzOiBULFxuICBkZWY6IERcbik6IFJlcXVpcmVkPEVDRFNBU2lnbk9wdHM+IHtcbiAgY29uc3Qgb3B0c246IEVDRFNBU2lnbk9wdHMgPSB7fTtcbiAgZm9yIChsZXQgb3B0TmFtZSBvZiBPYmplY3Qua2V5cyhkZWYpKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIG9wdHNuW29wdE5hbWVdID0gb3B0c1tvcHROYW1lXSA9PT0gdW5kZWZpbmVkID8gZGVmW29wdE5hbWVdIDogb3B0c1tvcHROYW1lXTtcbiAgfVxuICBhYm9vbChvcHRzbi5sb3dTISwgJ2xvd1MnKTtcbiAgYWJvb2wob3B0c24ucHJlaGFzaCEsICdwcmVoYXNoJyk7XG4gIGlmIChvcHRzbi5mb3JtYXQgIT09IHVuZGVmaW5lZCkgdmFsaWRhdGVTaWdGb3JtYXQob3B0c24uZm9ybWF0KTtcbiAgcmV0dXJuIG9wdHNuIGFzIFJlcXVpcmVkPEVDRFNBU2lnbk9wdHM+O1xufVxuXG4vKiogSW5zdGFuY2UgbWV0aG9kcyBmb3IgM0QgWFlaIHByb2plY3RpdmUgcG9pbnRzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBXZWllcnN0cmFzc1BvaW50PFQ+IGV4dGVuZHMgQ3VydmVQb2ludDxULCBXZWllcnN0cmFzc1BvaW50PFQ+PiB7XG4gIC8qKiBwcm9qZWN0aXZlIFggY29vcmRpbmF0ZS4gRGlmZmVyZW50IGZyb20gYWZmaW5lIHguICovXG4gIHJlYWRvbmx5IFg6IFQ7XG4gIC8qKiBwcm9qZWN0aXZlIFkgY29vcmRpbmF0ZS4gRGlmZmVyZW50IGZyb20gYWZmaW5lIHkuICovXG4gIHJlYWRvbmx5IFk6IFQ7XG4gIC8qKiBwcm9qZWN0aXZlIHogY29vcmRpbmF0ZSAqL1xuICByZWFkb25seSBaOiBUO1xuICAvKiogYWZmaW5lIHggY29vcmRpbmF0ZS4gRGlmZmVyZW50IGZyb20gcHJvamVjdGl2ZSBYLiAqL1xuICBnZXQgeCgpOiBUO1xuICAvKiogYWZmaW5lIHkgY29vcmRpbmF0ZS4gRGlmZmVyZW50IGZyb20gcHJvamVjdGl2ZSBZLiAqL1xuICBnZXQgeSgpOiBUO1xuICAvKiogRW5jb2RlcyBwb2ludCB1c2luZyBJRUVFIFAxMzYzIChERVIpIGVuY29kaW5nLiBGaXJzdCBieXRlIGlzIDIvMy80LiBEZWZhdWx0ID0gaXNDb21wcmVzc2VkLiAqL1xuICB0b0J5dGVzKGlzQ29tcHJlc3NlZD86IGJvb2xlYW4pOiBVaW50OEFycmF5O1xuICB0b0hleChpc0NvbXByZXNzZWQ/OiBib29sZWFuKTogc3RyaW5nO1xufVxuXG4vKiogU3RhdGljIG1ldGhvZHMgZm9yIDNEIFhZWiBwcm9qZWN0aXZlIHBvaW50cy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV2VpZXJzdHJhc3NQb2ludENvbnM8VD4gZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxXZWllcnN0cmFzc1BvaW50PFQ+PiB7XG4gIC8qKiBEb2VzIE5PVCB2YWxpZGF0ZSBpZiB0aGUgcG9pbnQgaXMgdmFsaWQuIFVzZSBgLmFzc2VydFZhbGlkaXR5KClgLiAqL1xuICBuZXcgKFg6IFQsIFk6IFQsIFo6IFQpOiBXZWllcnN0cmFzc1BvaW50PFQ+O1xuICBDVVJWRSgpOiBXZWllcnN0cmFzc09wdHM8VD47XG59XG5cbi8qKlxuICogV2VpZXJzdHJhc3MgY3VydmUgb3B0aW9ucy5cbiAqXG4gKiAqIHA6IHByaW1lIGNoYXJhY3RlcmlzdGljIChvcmRlcikgb2YgZmluaXRlIGZpZWxkLCBpbiB3aGljaCBhcml0aG1ldGljcyBpcyBkb25lXG4gKiAqIG46IG9yZGVyIG9mIHByaW1lIHN1Ymdyb3VwIGEuay5hIHRvdGFsIGFtb3VudCBvZiB2YWxpZCBjdXJ2ZSBwb2ludHNcbiAqICogaDogY29mYWN0b3IsIHVzdWFsbHkgMS4gaCpuIGlzIGdyb3VwIG9yZGVyOyBuIGlzIHN1Ymdyb3VwIG9yZGVyXG4gKiAqIGE6IGZvcm11bGEgcGFyYW0sIG11c3QgYmUgaW4gZmllbGQgb2YgcFxuICogKiBiOiBmb3JtdWxhIHBhcmFtLCBtdXN0IGJlIGluIGZpZWxkIG9mIHBcbiAqICogR3g6IHggY29vcmRpbmF0ZSBvZiBnZW5lcmF0b3IgcG9pbnQgYS5rLmEuIGJhc2UgcG9pbnRcbiAqICogR3k6IHkgY29vcmRpbmF0ZSBvZiBnZW5lcmF0b3IgcG9pbnRcbiAqL1xuZXhwb3J0IHR5cGUgV2VpZXJzdHJhc3NPcHRzPFQ+ID0gUmVhZG9ubHk8e1xuICBwOiBiaWdpbnQ7XG4gIG46IGJpZ2ludDtcbiAgaDogYmlnaW50O1xuICBhOiBUO1xuICBiOiBUO1xuICBHeDogVDtcbiAgR3k6IFQ7XG59PjtcblxuLy8gV2hlbiBhIGNvZmFjdG9yICE9IDEsIHRoZXJlIGNhbiBiZSBhbiBlZmZlY3RpdmUgbWV0aG9kcyB0bzpcbi8vIDEuIERldGVybWluZSB3aGV0aGVyIGEgcG9pbnQgaXMgdG9yc2lvbi1mcmVlXG4vLyAyLiBDbGVhciB0b3JzaW9uIGNvbXBvbmVudFxuZXhwb3J0IHR5cGUgV2VpZXJzdHJhc3NFeHRyYU9wdHM8VD4gPSBQYXJ0aWFsPHtcbiAgRnA6IElGaWVsZDxUPjtcbiAgRm46IElGaWVsZDxiaWdpbnQ+O1xuICBhbGxvd0luZmluaXR5UG9pbnQ6IGJvb2xlYW47XG4gIGVuZG86IEVuZG9tb3JwaGlzbU9wdHM7XG4gIGlzVG9yc2lvbkZyZWU6IChjOiBXZWllcnN0cmFzc1BvaW50Q29uczxUPiwgcG9pbnQ6IFdlaWVyc3RyYXNzUG9pbnQ8VD4pID0+IGJvb2xlYW47XG4gIGNsZWFyQ29mYWN0b3I6IChjOiBXZWllcnN0cmFzc1BvaW50Q29uczxUPiwgcG9pbnQ6IFdlaWVyc3RyYXNzUG9pbnQ8VD4pID0+IFdlaWVyc3RyYXNzUG9pbnQ8VD47XG4gIGZyb21CeXRlczogKGJ5dGVzOiBVaW50OEFycmF5KSA9PiBBZmZpbmVQb2ludDxUPjtcbiAgdG9CeXRlczogKFxuICAgIGM6IFdlaWVyc3RyYXNzUG9pbnRDb25zPFQ+LFxuICAgIHBvaW50OiBXZWllcnN0cmFzc1BvaW50PFQ+LFxuICAgIGlzQ29tcHJlc3NlZDogYm9vbGVhblxuICApID0+IFVpbnQ4QXJyYXk7XG59PjtcblxuLyoqXG4gKiBPcHRpb25zIGZvciBFQ0RTQSBzaWduYXR1cmVzIG92ZXIgYSBXZWllcnN0cmFzcyBjdXJ2ZS5cbiAqXG4gKiAqIGxvd1M6IChkZWZhdWx0OiB0cnVlKSB3aGV0aGVyIHByb2R1Y2VkIC8gdmVyaWZpZWQgc2lnbmF0dXJlcyBvY2N1cHkgbG93IGhhbGYgb2YgZWNkc2FPcHRzLnAuIFByZXZlbnRzIG1hbGxlYWJpbGl0eS5cbiAqICogaG1hYzogKGRlZmF1bHQ6IG5vYmxlLWhhc2hlcyBobWFjKSBmdW5jdGlvbiwgd291bGQgYmUgdXNlZCB0byBpbml0IGhtYWMtZHJiZyBmb3IgayBnZW5lcmF0aW9uLlxuICogKiByYW5kb21CeXRlczogKGRlZmF1bHQ6IHdlYmNyeXB0byBvcy1sZXZlbCBDU1BSTkcpIGN1c3RvbSBtZXRob2QgZm9yIGZldGNoaW5nIHNlY3VyZSByYW5kb21uZXNzLlxuICogKiBiaXRzMmludCwgYml0czJpbnRfbW9kTjogdXNlZCBpbiBzaWdzLCBzb21ldGltZXMgb3ZlcnJpZGRlbiBieSBjdXJ2ZXNcbiAqL1xuZXhwb3J0IHR5cGUgRUNEU0FPcHRzID0gUGFydGlhbDx7XG4gIGxvd1M6IGJvb2xlYW47XG4gIGhtYWM6IChrZXk6IFVpbnQ4QXJyYXksIG1lc3NhZ2U6IFVpbnQ4QXJyYXkpID0+IFVpbnQ4QXJyYXk7XG4gIHJhbmRvbUJ5dGVzOiAoYnl0ZXNMZW5ndGg/OiBudW1iZXIpID0+IFVpbnQ4QXJyYXk7XG4gIGJpdHMyaW50OiAoYnl0ZXM6IFVpbnQ4QXJyYXkpID0+IGJpZ2ludDtcbiAgYml0czJpbnRfbW9kTjogKGJ5dGVzOiBVaW50OEFycmF5KSA9PiBiaWdpbnQ7XG59PjtcblxuLyoqXG4gKiBFbGxpcHRpYyBDdXJ2ZSBEaWZmaWUtSGVsbG1hbiBpbnRlcmZhY2UuXG4gKiBQcm92aWRlcyBrZXlnZW4sIHNlY3JldC10by1wdWJsaWMgY29udmVyc2lvbiwgY2FsY3VsYXRpbmcgc2hhcmVkIHNlY3JldHMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRUNESCB7XG4gIGtleWdlbjogKHNlZWQ/OiBVaW50OEFycmF5KSA9PiB7IHNlY3JldEtleTogVWludDhBcnJheTsgcHVibGljS2V5OiBVaW50OEFycmF5IH07XG4gIGdldFB1YmxpY0tleTogKHNlY3JldEtleTogVWludDhBcnJheSwgaXNDb21wcmVzc2VkPzogYm9vbGVhbikgPT4gVWludDhBcnJheTtcbiAgZ2V0U2hhcmVkU2VjcmV0OiAoXG4gICAgc2VjcmV0S2V5QTogVWludDhBcnJheSxcbiAgICBwdWJsaWNLZXlCOiBVaW50OEFycmF5LFxuICAgIGlzQ29tcHJlc3NlZD86IGJvb2xlYW5cbiAgKSA9PiBVaW50OEFycmF5O1xuICBQb2ludDogV2VpZXJzdHJhc3NQb2ludENvbnM8YmlnaW50PjtcbiAgdXRpbHM6IHtcbiAgICBpc1ZhbGlkU2VjcmV0S2V5OiAoc2VjcmV0S2V5OiBVaW50OEFycmF5KSA9PiBib29sZWFuO1xuICAgIGlzVmFsaWRQdWJsaWNLZXk6IChwdWJsaWNLZXk6IFVpbnQ4QXJyYXksIGlzQ29tcHJlc3NlZD86IGJvb2xlYW4pID0+IGJvb2xlYW47XG4gICAgcmFuZG9tU2VjcmV0S2V5OiAoc2VlZD86IFVpbnQ4QXJyYXkpID0+IFVpbnQ4QXJyYXk7XG4gIH07XG4gIGxlbmd0aHM6IEN1cnZlTGVuZ3Rocztcbn1cblxuLyoqXG4gKiBFQ0RTQSBpbnRlcmZhY2UuXG4gKiBPbmx5IHN1cHBvcnRlZCBmb3IgcHJpbWUgZmllbGRzLCBub3QgRnAyIChleHRlbnNpb24gZmllbGRzKS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFQ0RTQSBleHRlbmRzIEVDREgge1xuICBzaWduOiAobWVzc2FnZTogVWludDhBcnJheSwgc2VjcmV0S2V5OiBVaW50OEFycmF5LCBvcHRzPzogRUNEU0FTaWduT3B0cykgPT4gVWludDhBcnJheTtcbiAgdmVyaWZ5OiAoXG4gICAgc2lnbmF0dXJlOiBVaW50OEFycmF5LFxuICAgIG1lc3NhZ2U6IFVpbnQ4QXJyYXksXG4gICAgcHVibGljS2V5OiBVaW50OEFycmF5LFxuICAgIG9wdHM/OiBFQ0RTQVZlcmlmeU9wdHNcbiAgKSA9PiBib29sZWFuO1xuICByZWNvdmVyUHVibGljS2V5KHNpZ25hdHVyZTogVWludDhBcnJheSwgbWVzc2FnZTogVWludDhBcnJheSwgb3B0cz86IEVDRFNBUmVjb3Zlck9wdHMpOiBVaW50OEFycmF5O1xuICBTaWduYXR1cmU6IEVDRFNBU2lnbmF0dXJlQ29ucztcbn1cbmV4cG9ydCBjbGFzcyBERVJFcnIgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG0gPSAnJykge1xuICAgIHN1cGVyKG0pO1xuICB9XG59XG5leHBvcnQgdHlwZSBJREVSID0ge1xuICAvLyBhc24uMSBERVIgZW5jb2RpbmcgdXRpbHNcbiAgRXJyOiB0eXBlb2YgREVSRXJyO1xuICAvLyBCYXNpYyBidWlsZGluZyBibG9jayBpcyBUTFYgKFRhZy1MZW5ndGgtVmFsdWUpXG4gIF90bHY6IHtcbiAgICBlbmNvZGU6ICh0YWc6IG51bWJlciwgZGF0YTogc3RyaW5nKSA9PiBzdHJpbmc7XG4gICAgLy8gdiAtIHZhbHVlLCBsIC0gbGVmdCBieXRlcyAodW5wYXJzZWQpXG4gICAgZGVjb2RlKHRhZzogbnVtYmVyLCBkYXRhOiBVaW50OEFycmF5KTogeyB2OiBVaW50OEFycmF5OyBsOiBVaW50OEFycmF5IH07XG4gIH07XG4gIC8vIGh0dHBzOi8vY3J5cHRvLnN0YWNrZXhjaGFuZ2UuY29tL2EvNTc3MzQgTGVmdG1vc3QgYml0IG9mIGZpcnN0IGJ5dGUgaXMgJ25lZ2F0aXZlJyBmbGFnLFxuICAvLyBzaW5jZSB3ZSBhbHdheXMgdXNlIHBvc2l0aXZlIGludGVnZXJzIGhlcmUuIEl0IG11c3QgYWx3YXlzIGJlIGVtcHR5OlxuICAvLyAtIGFkZCB6ZXJvIGJ5dGUgaWYgZXhpc3RzXG4gIC8vIC0gaWYgbmV4dCBieXRlIGRvZXNuJ3QgaGF2ZSBhIGZsYWcsIGxlYWRpbmcgemVybyBpcyBub3QgYWxsb3dlZCAobWluaW1hbCBlbmNvZGluZylcbiAgX2ludDoge1xuICAgIGVuY29kZShudW06IGJpZ2ludCk6IHN0cmluZztcbiAgICBkZWNvZGUoZGF0YTogVWludDhBcnJheSk6IGJpZ2ludDtcbiAgfTtcbiAgdG9TaWcoaGV4OiBzdHJpbmcgfCBVaW50OEFycmF5KTogeyByOiBiaWdpbnQ7IHM6IGJpZ2ludCB9O1xuICBoZXhGcm9tU2lnKHNpZzogeyByOiBiaWdpbnQ7IHM6IGJpZ2ludCB9KTogc3RyaW5nO1xufTtcbi8qKlxuICogQVNOLjEgREVSIGVuY29kaW5nIHV0aWxpdGllcy4gQVNOIGlzIHZlcnkgY29tcGxleCAmIGZyYWdpbGUuIEZvcm1hdDpcbiAqXG4gKiAgICAgWzB4MzAgKFNFUVVFTkNFKSwgYnl0ZWxlbmd0aCwgMHgwMiAoSU5URUdFUiksIGludExlbmd0aCwgUiwgMHgwMiAoSU5URUdFUiksIGludExlbmd0aCwgU11cbiAqXG4gKiBEb2NzOiBodHRwczovL2xldHNlbmNyeXB0Lm9yZy9kb2NzL2Etd2FybS13ZWxjb21lLXRvLWFzbjEtYW5kLWRlci8sIGh0dHBzOi8vbHVjYS5udG9wLm9yZy9UZWFjaGluZy9BcHB1bnRpL2FzbjEuaHRtbFxuICovXG5leHBvcnQgY29uc3QgREVSOiBJREVSID0ge1xuICAvLyBhc24uMSBERVIgZW5jb2RpbmcgdXRpbHNcbiAgRXJyOiBERVJFcnIsXG4gIC8vIEJhc2ljIGJ1aWxkaW5nIGJsb2NrIGlzIFRMViAoVGFnLUxlbmd0aC1WYWx1ZSlcbiAgX3Rsdjoge1xuICAgIGVuY29kZTogKHRhZzogbnVtYmVyLCBkYXRhOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgICAgY29uc3QgeyBFcnI6IEUgfSA9IERFUjtcbiAgICAgIGlmICh0YWcgPCAwIHx8IHRhZyA+IDI1NikgdGhyb3cgbmV3IEUoJ3Rsdi5lbmNvZGU6IHdyb25nIHRhZycpO1xuICAgICAgaWYgKGRhdGEubGVuZ3RoICYgMSkgdGhyb3cgbmV3IEUoJ3Rsdi5lbmNvZGU6IHVucGFkZGVkIGRhdGEnKTtcbiAgICAgIGNvbnN0IGRhdGFMZW4gPSBkYXRhLmxlbmd0aCAvIDI7XG4gICAgICBjb25zdCBsZW4gPSBudW1iZXJUb0hleFVucGFkZGVkKGRhdGFMZW4pO1xuICAgICAgaWYgKChsZW4ubGVuZ3RoIC8gMikgJiAwYjEwMDBfMDAwMCkgdGhyb3cgbmV3IEUoJ3Rsdi5lbmNvZGU6IGxvbmcgZm9ybSBsZW5ndGggdG9vIGJpZycpO1xuICAgICAgLy8gbGVuZ3RoIG9mIGxlbmd0aCB3aXRoIGxvbmcgZm9ybSBmbGFnXG4gICAgICBjb25zdCBsZW5MZW4gPSBkYXRhTGVuID4gMTI3ID8gbnVtYmVyVG9IZXhVbnBhZGRlZCgobGVuLmxlbmd0aCAvIDIpIHwgMGIxMDAwXzAwMDApIDogJyc7XG4gICAgICBjb25zdCB0ID0gbnVtYmVyVG9IZXhVbnBhZGRlZCh0YWcpO1xuICAgICAgcmV0dXJuIHQgKyBsZW5MZW4gKyBsZW4gKyBkYXRhO1xuICAgIH0sXG4gICAgLy8gdiAtIHZhbHVlLCBsIC0gbGVmdCBieXRlcyAodW5wYXJzZWQpXG4gICAgZGVjb2RlKHRhZzogbnVtYmVyLCBkYXRhOiBVaW50OEFycmF5KTogeyB2OiBVaW50OEFycmF5OyBsOiBVaW50OEFycmF5IH0ge1xuICAgICAgY29uc3QgeyBFcnI6IEUgfSA9IERFUjtcbiAgICAgIGxldCBwb3MgPSAwO1xuICAgICAgaWYgKHRhZyA8IDAgfHwgdGFnID4gMjU2KSB0aHJvdyBuZXcgRSgndGx2LmVuY29kZTogd3JvbmcgdGFnJyk7XG4gICAgICBpZiAoZGF0YS5sZW5ndGggPCAyIHx8IGRhdGFbcG9zKytdICE9PSB0YWcpIHRocm93IG5ldyBFKCd0bHYuZGVjb2RlOiB3cm9uZyB0bHYnKTtcbiAgICAgIGNvbnN0IGZpcnN0ID0gZGF0YVtwb3MrK107XG4gICAgICBjb25zdCBpc0xvbmcgPSAhIShmaXJzdCAmIDBiMTAwMF8wMDAwKTsgLy8gRmlyc3QgYml0IG9mIGZpcnN0IGxlbmd0aCBieXRlIGlzIGZsYWcgZm9yIHNob3J0L2xvbmcgZm9ybVxuICAgICAgbGV0IGxlbmd0aCA9IDA7XG4gICAgICBpZiAoIWlzTG9uZykgbGVuZ3RoID0gZmlyc3Q7XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gTG9uZyBmb3JtOiBbbG9uZ0ZsYWcoMWJpdCksIGxlbmd0aExlbmd0aCg3Yml0KSwgbGVuZ3RoIChCRSldXG4gICAgICAgIGNvbnN0IGxlbkxlbiA9IGZpcnN0ICYgMGIwMTExXzExMTE7XG4gICAgICAgIGlmICghbGVuTGVuKSB0aHJvdyBuZXcgRSgndGx2LmRlY29kZShsb25nKTogaW5kZWZpbml0ZSBsZW5ndGggbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICBpZiAobGVuTGVuID4gNCkgdGhyb3cgbmV3IEUoJ3Rsdi5kZWNvZGUobG9uZyk6IGJ5dGUgbGVuZ3RoIGlzIHRvbyBiaWcnKTsgLy8gdGhpcyB3aWxsIG92ZXJmbG93IHUzMiBpbiBqc1xuICAgICAgICBjb25zdCBsZW5ndGhCeXRlcyA9IGRhdGEuc3ViYXJyYXkocG9zLCBwb3MgKyBsZW5MZW4pO1xuICAgICAgICBpZiAobGVuZ3RoQnl0ZXMubGVuZ3RoICE9PSBsZW5MZW4pIHRocm93IG5ldyBFKCd0bHYuZGVjb2RlOiBsZW5ndGggYnl0ZXMgbm90IGNvbXBsZXRlJyk7XG4gICAgICAgIGlmIChsZW5ndGhCeXRlc1swXSA9PT0gMCkgdGhyb3cgbmV3IEUoJ3Rsdi5kZWNvZGUobG9uZyk6IHplcm8gbGVmdG1vc3QgYnl0ZScpO1xuICAgICAgICBmb3IgKGNvbnN0IGIgb2YgbGVuZ3RoQnl0ZXMpIGxlbmd0aCA9IChsZW5ndGggPDwgOCkgfCBiO1xuICAgICAgICBwb3MgKz0gbGVuTGVuO1xuICAgICAgICBpZiAobGVuZ3RoIDwgMTI4KSB0aHJvdyBuZXcgRSgndGx2LmRlY29kZShsb25nKTogbm90IG1pbmltYWwgZW5jb2RpbmcnKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHYgPSBkYXRhLnN1YmFycmF5KHBvcywgcG9zICsgbGVuZ3RoKTtcbiAgICAgIGlmICh2Lmxlbmd0aCAhPT0gbGVuZ3RoKSB0aHJvdyBuZXcgRSgndGx2LmRlY29kZTogd3JvbmcgdmFsdWUgbGVuZ3RoJyk7XG4gICAgICByZXR1cm4geyB2LCBsOiBkYXRhLnN1YmFycmF5KHBvcyArIGxlbmd0aCkgfTtcbiAgICB9LFxuICB9LFxuICAvLyBodHRwczovL2NyeXB0by5zdGFja2V4Y2hhbmdlLmNvbS9hLzU3NzM0IExlZnRtb3N0IGJpdCBvZiBmaXJzdCBieXRlIGlzICduZWdhdGl2ZScgZmxhZyxcbiAgLy8gc2luY2Ugd2UgYWx3YXlzIHVzZSBwb3NpdGl2ZSBpbnRlZ2VycyBoZXJlLiBJdCBtdXN0IGFsd2F5cyBiZSBlbXB0eTpcbiAgLy8gLSBhZGQgemVybyBieXRlIGlmIGV4aXN0c1xuICAvLyAtIGlmIG5leHQgYnl0ZSBkb2Vzbid0IGhhdmUgYSBmbGFnLCBsZWFkaW5nIHplcm8gaXMgbm90IGFsbG93ZWQgKG1pbmltYWwgZW5jb2RpbmcpXG4gIF9pbnQ6IHtcbiAgICBlbmNvZGUobnVtOiBiaWdpbnQpOiBzdHJpbmcge1xuICAgICAgY29uc3QgeyBFcnI6IEUgfSA9IERFUjtcbiAgICAgIGlmIChudW0gPCBfMG4pIHRocm93IG5ldyBFKCdpbnRlZ2VyOiBuZWdhdGl2ZSBpbnRlZ2VycyBhcmUgbm90IGFsbG93ZWQnKTtcbiAgICAgIGxldCBoZXggPSBudW1iZXJUb0hleFVucGFkZGVkKG51bSk7XG4gICAgICAvLyBQYWQgd2l0aCB6ZXJvIGJ5dGUgaWYgbmVnYXRpdmUgZmxhZyBpcyBwcmVzZW50XG4gICAgICBpZiAoTnVtYmVyLnBhcnNlSW50KGhleFswXSwgMTYpICYgMGIxMDAwKSBoZXggPSAnMDAnICsgaGV4O1xuICAgICAgaWYgKGhleC5sZW5ndGggJiAxKSB0aHJvdyBuZXcgRSgndW5leHBlY3RlZCBERVIgcGFyc2luZyBhc3NlcnRpb246IHVucGFkZGVkIGhleCcpO1xuICAgICAgcmV0dXJuIGhleDtcbiAgICB9LFxuICAgIGRlY29kZShkYXRhOiBVaW50OEFycmF5KTogYmlnaW50IHtcbiAgICAgIGNvbnN0IHsgRXJyOiBFIH0gPSBERVI7XG4gICAgICBpZiAoZGF0YVswXSAmIDBiMTAwMF8wMDAwKSB0aHJvdyBuZXcgRSgnaW52YWxpZCBzaWduYXR1cmUgaW50ZWdlcjogbmVnYXRpdmUnKTtcbiAgICAgIGlmIChkYXRhWzBdID09PSAweDAwICYmICEoZGF0YVsxXSAmIDBiMTAwMF8wMDAwKSlcbiAgICAgICAgdGhyb3cgbmV3IEUoJ2ludmFsaWQgc2lnbmF0dXJlIGludGVnZXI6IHVubmVjZXNzYXJ5IGxlYWRpbmcgemVybycpO1xuICAgICAgcmV0dXJuIGJ5dGVzVG9OdW1iZXJCRShkYXRhKTtcbiAgICB9LFxuICB9LFxuICB0b1NpZyhieXRlczogVWludDhBcnJheSk6IHsgcjogYmlnaW50OyBzOiBiaWdpbnQgfSB7XG4gICAgLy8gcGFyc2UgREVSIHNpZ25hdHVyZVxuICAgIGNvbnN0IHsgRXJyOiBFLCBfaW50OiBpbnQsIF90bHY6IHRsdiB9ID0gREVSO1xuICAgIGNvbnN0IGRhdGEgPSBhYnl0ZXMoYnl0ZXMsIHVuZGVmaW5lZCwgJ3NpZ25hdHVyZScpO1xuICAgIGNvbnN0IHsgdjogc2VxQnl0ZXMsIGw6IHNlcUxlZnRCeXRlcyB9ID0gdGx2LmRlY29kZSgweDMwLCBkYXRhKTtcbiAgICBpZiAoc2VxTGVmdEJ5dGVzLmxlbmd0aCkgdGhyb3cgbmV3IEUoJ2ludmFsaWQgc2lnbmF0dXJlOiBsZWZ0IGJ5dGVzIGFmdGVyIHBhcnNpbmcnKTtcbiAgICBjb25zdCB7IHY6IHJCeXRlcywgbDogckxlZnRCeXRlcyB9ID0gdGx2LmRlY29kZSgweDAyLCBzZXFCeXRlcyk7XG4gICAgY29uc3QgeyB2OiBzQnl0ZXMsIGw6IHNMZWZ0Qnl0ZXMgfSA9IHRsdi5kZWNvZGUoMHgwMiwgckxlZnRCeXRlcyk7XG4gICAgaWYgKHNMZWZ0Qnl0ZXMubGVuZ3RoKSB0aHJvdyBuZXcgRSgnaW52YWxpZCBzaWduYXR1cmU6IGxlZnQgYnl0ZXMgYWZ0ZXIgcGFyc2luZycpO1xuICAgIHJldHVybiB7IHI6IGludC5kZWNvZGUockJ5dGVzKSwgczogaW50LmRlY29kZShzQnl0ZXMpIH07XG4gIH0sXG4gIGhleEZyb21TaWcoc2lnOiB7IHI6IGJpZ2ludDsgczogYmlnaW50IH0pOiBzdHJpbmcge1xuICAgIGNvbnN0IHsgX3RsdjogdGx2LCBfaW50OiBpbnQgfSA9IERFUjtcbiAgICBjb25zdCBycyA9IHRsdi5lbmNvZGUoMHgwMiwgaW50LmVuY29kZShzaWcucikpO1xuICAgIGNvbnN0IHNzID0gdGx2LmVuY29kZSgweDAyLCBpbnQuZW5jb2RlKHNpZy5zKSk7XG4gICAgY29uc3Qgc2VxID0gcnMgKyBzcztcbiAgICByZXR1cm4gdGx2LmVuY29kZSgweDMwLCBzZXEpO1xuICB9LFxufTtcblxuLy8gQmUgZnJpZW5kbHkgdG8gYmFkIEVDTUFTY3JpcHQgcGFyc2VycyBieSBub3QgdXNpbmcgYmlnaW50IGxpdGVyYWxzXG4vLyBwcmV0dGllci1pZ25vcmVcbmNvbnN0IF8wbiA9IEJpZ0ludCgwKSwgXzFuID0gQmlnSW50KDEpLCBfMm4gPSBCaWdJbnQoMiksIF8zbiA9IEJpZ0ludCgzKSwgXzRuID0gQmlnSW50KDQpO1xuXG4vKipcbiAqIENyZWF0ZXMgd2VpZXJzdHJhc3MgUG9pbnQgY29uc3RydWN0b3IsIGJhc2VkIG9uIHNwZWNpZmllZCBjdXJ2ZSBvcHRpb25zLlxuICpcbiAqIFNlZSB7QGxpbmsgV2VpZXJzdHJhc3NPcHRzfS5cbiAqXG4gKiBAZXhhbXBsZVxuYGBganNcbmNvbnN0IG9wdHMgPSB7XG4gIHA6IDB4ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmVmZmZmYWM3M24sXG4gIG46IDB4MTAwMDAwMDAwMDAwMDAwMDAwMDAxYjhmYTE2ZGZhYjlhY2ExNmI2YjNuLFxuICBoOiAxbixcbiAgYTogMG4sXG4gIGI6IDduLFxuICBHeDogMHgzYjRjMzgyY2UzN2FhMTkyYTQwMTllNzYzMDM2ZjRmNWRkNGQ3ZWJibixcbiAgR3k6IDB4OTM4Y2Y5MzUzMThmZGNlZDZiYzI4Mjg2NTMxNzMzYzNmMDNjNGZlZW4sXG59O1xuY29uc3Qgc2VjcDE2MGsxX1BvaW50ID0gd2VpZXJzdHJhc3Mob3B0cyk7XG5gYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdlaWVyc3RyYXNzPFQ+KFxuICBwYXJhbXM6IFdlaWVyc3RyYXNzT3B0czxUPixcbiAgZXh0cmFPcHRzOiBXZWllcnN0cmFzc0V4dHJhT3B0czxUPiA9IHt9XG4pOiBXZWllcnN0cmFzc1BvaW50Q29uczxUPiB7XG4gIGNvbnN0IHZhbGlkYXRlZCA9IGNyZWF0ZUN1cnZlRmllbGRzKCd3ZWllcnN0cmFzcycsIHBhcmFtcywgZXh0cmFPcHRzKTtcbiAgY29uc3QgeyBGcCwgRm4gfSA9IHZhbGlkYXRlZDtcbiAgbGV0IENVUlZFID0gdmFsaWRhdGVkLkNVUlZFIGFzIFdlaWVyc3RyYXNzT3B0czxUPjtcbiAgY29uc3QgeyBoOiBjb2ZhY3RvciwgbjogQ1VSVkVfT1JERVIgfSA9IENVUlZFO1xuICB2YWxpZGF0ZU9iamVjdChcbiAgICBleHRyYU9wdHMsXG4gICAge30sXG4gICAge1xuICAgICAgYWxsb3dJbmZpbml0eVBvaW50OiAnYm9vbGVhbicsXG4gICAgICBjbGVhckNvZmFjdG9yOiAnZnVuY3Rpb24nLFxuICAgICAgaXNUb3JzaW9uRnJlZTogJ2Z1bmN0aW9uJyxcbiAgICAgIGZyb21CeXRlczogJ2Z1bmN0aW9uJyxcbiAgICAgIHRvQnl0ZXM6ICdmdW5jdGlvbicsXG4gICAgICBlbmRvOiAnb2JqZWN0JyxcbiAgICB9XG4gICk7XG5cbiAgY29uc3QgeyBlbmRvIH0gPSBleHRyYU9wdHM7XG4gIGlmIChlbmRvKSB7XG4gICAgLy8gdmFsaWRhdGVPYmplY3QoZW5kbywgeyBiZXRhOiAnYmlnaW50Jywgc3BsaXRTY2FsYXI6ICdmdW5jdGlvbicgfSk7XG4gICAgaWYgKCFGcC5pczAoQ1VSVkUuYSkgfHwgdHlwZW9mIGVuZG8uYmV0YSAhPT0gJ2JpZ2ludCcgfHwgIUFycmF5LmlzQXJyYXkoZW5kby5iYXNpc2VzKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGVuZG86IGV4cGVjdGVkIFwiYmV0YVwiOiBiaWdpbnQgYW5kIFwiYmFzaXNlc1wiOiBhcnJheScpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGxlbmd0aHMgPSBnZXRXTGVuZ3RocyhGcCwgRm4pO1xuXG4gIGZ1bmN0aW9uIGFzc2VydENvbXByZXNzaW9uSXNTdXBwb3J0ZWQoKSB7XG4gICAgaWYgKCFGcC5pc09kZCkgdGhyb3cgbmV3IEVycm9yKCdjb21wcmVzc2lvbiBpcyBub3Qgc3VwcG9ydGVkOiBGaWVsZCBkb2VzIG5vdCBoYXZlIC5pc09kZCgpJyk7XG4gIH1cblxuICAvLyBJbXBsZW1lbnRzIElFRUUgUDEzNjMgcG9pbnQgZW5jb2RpbmdcbiAgZnVuY3Rpb24gcG9pbnRUb0J5dGVzKFxuICAgIF9jOiBXZWllcnN0cmFzc1BvaW50Q29uczxUPixcbiAgICBwb2ludDogV2VpZXJzdHJhc3NQb2ludDxUPixcbiAgICBpc0NvbXByZXNzZWQ6IGJvb2xlYW5cbiAgKTogVWludDhBcnJheSB7XG4gICAgY29uc3QgeyB4LCB5IH0gPSBwb2ludC50b0FmZmluZSgpO1xuICAgIGNvbnN0IGJ4ID0gRnAudG9CeXRlcyh4KTtcbiAgICBhYm9vbChpc0NvbXByZXNzZWQsICdpc0NvbXByZXNzZWQnKTtcbiAgICBpZiAoaXNDb21wcmVzc2VkKSB7XG4gICAgICBhc3NlcnRDb21wcmVzc2lvbklzU3VwcG9ydGVkKCk7XG4gICAgICBjb25zdCBoYXNFdmVuWSA9ICFGcC5pc09kZCEoeSk7XG4gICAgICByZXR1cm4gY29uY2F0Qnl0ZXMocHByZWZpeChoYXNFdmVuWSksIGJ4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbmNhdEJ5dGVzKFVpbnQ4QXJyYXkub2YoMHgwNCksIGJ4LCBGcC50b0J5dGVzKHkpKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gcG9pbnRGcm9tQnl0ZXMoYnl0ZXM6IFVpbnQ4QXJyYXkpIHtcbiAgICBhYnl0ZXMoYnl0ZXMsIHVuZGVmaW5lZCwgJ1BvaW50Jyk7XG4gICAgY29uc3QgeyBwdWJsaWNLZXk6IGNvbXAsIHB1YmxpY0tleVVuY29tcHJlc3NlZDogdW5jb21wIH0gPSBsZW5ndGhzOyAvLyBlLmcuIGZvciAzMi1ieXRlOiAzMywgNjVcbiAgICBjb25zdCBsZW5ndGggPSBieXRlcy5sZW5ndGg7XG4gICAgY29uc3QgaGVhZCA9IGJ5dGVzWzBdO1xuICAgIGNvbnN0IHRhaWwgPSBieXRlcy5zdWJhcnJheSgxKTtcbiAgICAvLyBObyBhY3R1YWwgdmFsaWRhdGlvbiBpcyBkb25lIGhlcmU6IHVzZSAuYXNzZXJ0VmFsaWRpdHkoKVxuICAgIGlmIChsZW5ndGggPT09IGNvbXAgJiYgKGhlYWQgPT09IDB4MDIgfHwgaGVhZCA9PT0gMHgwMykpIHtcbiAgICAgIGNvbnN0IHggPSBGcC5mcm9tQnl0ZXModGFpbCk7XG4gICAgICBpZiAoIUZwLmlzVmFsaWQoeCkpIHRocm93IG5ldyBFcnJvcignYmFkIHBvaW50OiBpcyBub3Qgb24gY3VydmUsIHdyb25nIHgnKTtcbiAgICAgIGNvbnN0IHkyID0gd2VpZXJzdHJhc3NFcXVhdGlvbih4KTsgLy8geVx1MDBCMiA9IHhcdTAwQjMgKyBheCArIGJcbiAgICAgIGxldCB5OiBUO1xuICAgICAgdHJ5IHtcbiAgICAgICAgeSA9IEZwLnNxcnQoeTIpOyAvLyB5ID0geVx1MDBCMiBeIChwKzEpLzRcbiAgICAgIH0gY2F0Y2ggKHNxcnRFcnJvcikge1xuICAgICAgICBjb25zdCBlcnIgPSBzcXJ0RXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/ICc6ICcgKyBzcXJ0RXJyb3IubWVzc2FnZSA6ICcnO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBwb2ludDogaXMgbm90IG9uIGN1cnZlLCBzcXJ0IGVycm9yJyArIGVycik7XG4gICAgICB9XG4gICAgICBhc3NlcnRDb21wcmVzc2lvbklzU3VwcG9ydGVkKCk7XG4gICAgICBjb25zdCBldmVuWSA9IEZwLmlzT2RkISh5KTtcbiAgICAgIGNvbnN0IGV2ZW5IID0gKGhlYWQgJiAxKSA9PT0gMTsgLy8gRUNEU0Etc3BlY2lmaWNcbiAgICAgIGlmIChldmVuSCAhPT0gZXZlblkpIHkgPSBGcC5uZWcoeSk7XG4gICAgICByZXR1cm4geyB4LCB5IH07XG4gICAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuY29tcCAmJiBoZWFkID09PSAweDA0KSB7XG4gICAgICAvLyBUT0RPOiBtb3JlIGNoZWNrc1xuICAgICAgY29uc3QgTCA9IEZwLkJZVEVTO1xuICAgICAgY29uc3QgeCA9IEZwLmZyb21CeXRlcyh0YWlsLnN1YmFycmF5KDAsIEwpKTtcbiAgICAgIGNvbnN0IHkgPSBGcC5mcm9tQnl0ZXModGFpbC5zdWJhcnJheShMLCBMICogMikpO1xuICAgICAgaWYgKCFpc1ZhbGlkWFkoeCwgeSkpIHRocm93IG5ldyBFcnJvcignYmFkIHBvaW50OiBpcyBub3Qgb24gY3VydmUnKTtcbiAgICAgIHJldHVybiB7IHgsIHkgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgYmFkIHBvaW50OiBnb3QgbGVuZ3RoICR7bGVuZ3RofSwgZXhwZWN0ZWQgY29tcHJlc3NlZD0ke2NvbXB9IG9yIHVuY29tcHJlc3NlZD0ke3VuY29tcH1gXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGVuY29kZVBvaW50ID0gZXh0cmFPcHRzLnRvQnl0ZXMgfHwgcG9pbnRUb0J5dGVzO1xuICBjb25zdCBkZWNvZGVQb2ludCA9IGV4dHJhT3B0cy5mcm9tQnl0ZXMgfHwgcG9pbnRGcm9tQnl0ZXM7XG4gIGZ1bmN0aW9uIHdlaWVyc3RyYXNzRXF1YXRpb24oeDogVCk6IFQge1xuICAgIGNvbnN0IHgyID0gRnAuc3FyKHgpOyAvLyB4ICogeFxuICAgIGNvbnN0IHgzID0gRnAubXVsKHgyLCB4KTsgLy8geFx1MDBCMiAqIHhcbiAgICByZXR1cm4gRnAuYWRkKEZwLmFkZCh4MywgRnAubXVsKHgsIENVUlZFLmEpKSwgQ1VSVkUuYik7IC8vIHhcdTAwQjMgKyBhICogeCArIGJcbiAgfVxuXG4gIC8vIFRPRE86IG1vdmUgdG9wLWxldmVsXG4gIC8qKiBDaGVja3Mgd2hldGhlciBlcXVhdGlvbiBob2xkcyBmb3IgZ2l2ZW4geCwgeTogeVx1MDBCMiA9PSB4XHUwMEIzICsgYXggKyBiICovXG4gIGZ1bmN0aW9uIGlzVmFsaWRYWSh4OiBULCB5OiBUKTogYm9vbGVhbiB7XG4gICAgY29uc3QgbGVmdCA9IEZwLnNxcih5KTsgLy8geVx1MDBCMlxuICAgIGNvbnN0IHJpZ2h0ID0gd2VpZXJzdHJhc3NFcXVhdGlvbih4KTsgLy8geFx1MDBCMyArIGF4ICsgYlxuICAgIHJldHVybiBGcC5lcWwobGVmdCwgcmlnaHQpO1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgd2hldGhlciB0aGUgcGFzc2VkIGN1cnZlIHBhcmFtcyBhcmUgdmFsaWQuXG4gIC8vIFRlc3QgMTogZXF1YXRpb24geVx1MDBCMiA9IHhcdTAwQjMgKyBheCArIGIgc2hvdWxkIHdvcmsgZm9yIGdlbmVyYXRvciBwb2ludC5cbiAgaWYgKCFpc1ZhbGlkWFkoQ1VSVkUuR3gsIENVUlZFLkd5KSkgdGhyb3cgbmV3IEVycm9yKCdiYWQgY3VydmUgcGFyYW1zOiBnZW5lcmF0b3IgcG9pbnQnKTtcblxuICAvLyBUZXN0IDI6IGRpc2NyaW1pbmFudCBcdTAzOTQgcGFydCBzaG91bGQgYmUgbm9uLXplcm86IDRhXHUwMEIzICsgMjdiXHUwMEIyICE9IDAuXG4gIC8vIEd1YXJhbnRlZXMgY3VydmUgaXMgZ2VudXMtMSwgc21vb3RoIChub24tc2luZ3VsYXIpLlxuICBjb25zdCBfNGEzID0gRnAubXVsKEZwLnBvdyhDVVJWRS5hLCBfM24pLCBfNG4pO1xuICBjb25zdCBfMjdiMiA9IEZwLm11bChGcC5zcXIoQ1VSVkUuYiksIEJpZ0ludCgyNykpO1xuICBpZiAoRnAuaXMwKEZwLmFkZChfNGEzLCBfMjdiMikpKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBjdXJ2ZSBwYXJhbXM6IGEgb3IgYicpO1xuXG4gIC8qKiBBc3NlcnRzIGNvb3JkaW5hdGUgaXMgdmFsaWQ6IDAgPD0gbiA8IEZwLk9SREVSLiAqL1xuICBmdW5jdGlvbiBhY29vcmQodGl0bGU6IHN0cmluZywgbjogVCwgYmFuWmVybyA9IGZhbHNlKSB7XG4gICAgaWYgKCFGcC5pc1ZhbGlkKG4pIHx8IChiYW5aZXJvICYmIEZwLmlzMChuKSkpIHRocm93IG5ldyBFcnJvcihgYmFkIHBvaW50IGNvb3JkaW5hdGUgJHt0aXRsZX1gKTtcbiAgICByZXR1cm4gbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFwcmpwb2ludChvdGhlcjogdW5rbm93bikge1xuICAgIGlmICghKG90aGVyIGluc3RhbmNlb2YgUG9pbnQpKSB0aHJvdyBuZXcgRXJyb3IoJ1dlaWVyc3RyYXNzIFBvaW50IGV4cGVjdGVkJyk7XG4gIH1cblxuICBmdW5jdGlvbiBzcGxpdEVuZG9TY2FsYXJOKGs6IGJpZ2ludCkge1xuICAgIGlmICghZW5kbyB8fCAhZW5kby5iYXNpc2VzKSB0aHJvdyBuZXcgRXJyb3IoJ25vIGVuZG8nKTtcbiAgICByZXR1cm4gX3NwbGl0RW5kb1NjYWxhcihrLCBlbmRvLmJhc2lzZXMsIEZuLk9SREVSKTtcbiAgfVxuXG4gIC8vIE1lbW9pemVkIHRvQWZmaW5lIC8gdmFsaWRpdHkgY2hlY2suIFRoZXkgYXJlIGhlYXZ5LiBQb2ludHMgYXJlIGltbXV0YWJsZS5cblxuICAvLyBDb252ZXJ0cyBQcm9qZWN0aXZlIHBvaW50IHRvIGFmZmluZSAoeCwgeSkgY29vcmRpbmF0ZXMuXG4gIC8vIENhbiBhY2NlcHQgcHJlY29tcHV0ZWQgWl4tMSAtIGZvciBleGFtcGxlLCBmcm9tIGludmVydEJhdGNoLlxuICAvLyAoWCwgWSwgWikgXHUyMjBCICh4PVgvWiwgeT1ZL1opXG4gIGNvbnN0IHRvQWZmaW5lTWVtbyA9IG1lbW9pemVkKChwOiBQb2ludCwgaXo/OiBUKTogQWZmaW5lUG9pbnQ8VD4gPT4ge1xuICAgIGNvbnN0IHsgWCwgWSwgWiB9ID0gcDtcbiAgICAvLyBGYXN0LXBhdGggZm9yIG5vcm1hbGl6ZWQgcG9pbnRzXG4gICAgaWYgKEZwLmVxbChaLCBGcC5PTkUpKSByZXR1cm4geyB4OiBYLCB5OiBZIH07XG4gICAgY29uc3QgaXMwID0gcC5pczAoKTtcbiAgICAvLyBJZiBpbnZaIHdhcyAwLCB3ZSByZXR1cm4gemVybyBwb2ludC4gSG93ZXZlciB3ZSBzdGlsbCB3YW50IHRvIGV4ZWN1dGVcbiAgICAvLyBhbGwgb3BlcmF0aW9ucywgc28gd2UgcmVwbGFjZSBpbnZaIHdpdGggYSByYW5kb20gbnVtYmVyLCAxLlxuICAgIGlmIChpeiA9PSBudWxsKSBpeiA9IGlzMCA/IEZwLk9ORSA6IEZwLmludihaKTtcbiAgICBjb25zdCB4ID0gRnAubXVsKFgsIGl6KTtcbiAgICBjb25zdCB5ID0gRnAubXVsKFksIGl6KTtcbiAgICBjb25zdCB6eiA9IEZwLm11bChaLCBpeik7XG4gICAgaWYgKGlzMCkgcmV0dXJuIHsgeDogRnAuWkVSTywgeTogRnAuWkVSTyB9O1xuICAgIGlmICghRnAuZXFsKHp6LCBGcC5PTkUpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludlogd2FzIGludmFsaWQnKTtcbiAgICByZXR1cm4geyB4LCB5IH07XG4gIH0pO1xuICAvLyBOT1RFOiBvbiBleGNlcHRpb24gdGhpcyB3aWxsIGNyYXNoICdjYWNoZWQnIGFuZCBubyB2YWx1ZSB3aWxsIGJlIHNldC5cbiAgLy8gT3RoZXJ3aXNlIHRydWUgd2lsbCBiZSByZXR1cm5cbiAgY29uc3QgYXNzZXJ0VmFsaWRNZW1vID0gbWVtb2l6ZWQoKHA6IFBvaW50KSA9PiB7XG4gICAgaWYgKHAuaXMwKCkpIHtcbiAgICAgIC8vICgwLCAxLCAwKSBha2EgWkVSTyBpcyBpbnZhbGlkIGluIG1vc3QgY29udGV4dHMuXG4gICAgICAvLyBJbiBCTFMsIFpFUk8gY2FuIGJlIHNlcmlhbGl6ZWQsIHNvIHdlIGFsbG93IGl0LlxuICAgICAgLy8gKDAsIDAsIDApIGlzIGludmFsaWQgcmVwcmVzZW50YXRpb24gb2YgWkVSTy5cbiAgICAgIGlmIChleHRyYU9wdHMuYWxsb3dJbmZpbml0eVBvaW50ICYmICFGcC5pczAocC5ZKSkgcmV0dXJuO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdiYWQgcG9pbnQ6IFpFUk8nKTtcbiAgICB9XG4gICAgLy8gU29tZSAzcmQtcGFydHkgdGVzdCB2ZWN0b3JzIHJlcXVpcmUgZGlmZmVyZW50IHdvcmRpbmcgYmV0d2VlbiBoZXJlICYgYGZyb21Db21wcmVzc2VkSGV4YFxuICAgIGNvbnN0IHsgeCwgeSB9ID0gcC50b0FmZmluZSgpO1xuICAgIGlmICghRnAuaXNWYWxpZCh4KSB8fCAhRnAuaXNWYWxpZCh5KSkgdGhyb3cgbmV3IEVycm9yKCdiYWQgcG9pbnQ6IHggb3IgeSBub3QgZmllbGQgZWxlbWVudHMnKTtcbiAgICBpZiAoIWlzVmFsaWRYWSh4LCB5KSkgdGhyb3cgbmV3IEVycm9yKCdiYWQgcG9pbnQ6IGVxdWF0aW9uIGxlZnQgIT0gcmlnaHQnKTtcbiAgICBpZiAoIXAuaXNUb3JzaW9uRnJlZSgpKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBwb2ludDogbm90IGluIHByaW1lLW9yZGVyIHN1Ymdyb3VwJyk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGZpbmlzaEVuZG8oXG4gICAgZW5kb0JldGE6IEVuZG9tb3JwaGlzbU9wdHNbJ2JldGEnXSxcbiAgICBrMXA6IFBvaW50LFxuICAgIGsycDogUG9pbnQsXG4gICAgazFuZWc6IGJvb2xlYW4sXG4gICAgazJuZWc6IGJvb2xlYW5cbiAgKSB7XG4gICAgazJwID0gbmV3IFBvaW50KEZwLm11bChrMnAuWCwgZW5kb0JldGEpLCBrMnAuWSwgazJwLlopO1xuICAgIGsxcCA9IG5lZ2F0ZUN0KGsxbmVnLCBrMXApO1xuICAgIGsycCA9IG5lZ2F0ZUN0KGsybmVnLCBrMnApO1xuICAgIHJldHVybiBrMXAuYWRkKGsycCk7XG4gIH1cblxuICAvKipcbiAgICogUHJvamVjdGl2ZSBQb2ludCB3b3JrcyBpbiAzZCAvIHByb2plY3RpdmUgKGhvbW9nZW5lb3VzKSBjb29yZGluYXRlczooWCwgWSwgWikgXHUyMjBCICh4PVgvWiwgeT1ZL1opLlxuICAgKiBEZWZhdWx0IFBvaW50IHdvcmtzIGluIDJkIC8gYWZmaW5lIGNvb3JkaW5hdGVzOiAoeCwgeSkuXG4gICAqIFdlJ3JlIGRvaW5nIGNhbGN1bGF0aW9ucyBpbiBwcm9qZWN0aXZlLCBiZWNhdXNlIGl0cyBvcGVyYXRpb25zIGRvbid0IHJlcXVpcmUgY29zdGx5IGludmVyc2lvbi5cbiAgICovXG4gIGNsYXNzIFBvaW50IGltcGxlbWVudHMgV2VpZXJzdHJhc3NQb2ludDxUPiB7XG4gICAgLy8gYmFzZSAvIGdlbmVyYXRvciBwb2ludFxuICAgIHN0YXRpYyByZWFkb25seSBCQVNFID0gbmV3IFBvaW50KENVUlZFLkd4LCBDVVJWRS5HeSwgRnAuT05FKTtcbiAgICAvLyB6ZXJvIC8gaW5maW5pdHkgLyBpZGVudGl0eSBwb2ludFxuICAgIHN0YXRpYyByZWFkb25seSBaRVJPID0gbmV3IFBvaW50KEZwLlpFUk8sIEZwLk9ORSwgRnAuWkVSTyk7IC8vIDAsIDEsIDBcbiAgICAvLyBtYXRoIGZpZWxkXG4gICAgc3RhdGljIHJlYWRvbmx5IEZwID0gRnA7XG4gICAgLy8gc2NhbGFyIGZpZWxkXG4gICAgc3RhdGljIHJlYWRvbmx5IEZuID0gRm47XG5cbiAgICByZWFkb25seSBYOiBUO1xuICAgIHJlYWRvbmx5IFk6IFQ7XG4gICAgcmVhZG9ubHkgWjogVDtcblxuICAgIC8qKiBEb2VzIE5PVCB2YWxpZGF0ZSBpZiB0aGUgcG9pbnQgaXMgdmFsaWQuIFVzZSBgLmFzc2VydFZhbGlkaXR5KClgLiAqL1xuICAgIGNvbnN0cnVjdG9yKFg6IFQsIFk6IFQsIFo6IFQpIHtcbiAgICAgIHRoaXMuWCA9IGFjb29yZCgneCcsIFgpO1xuICAgICAgdGhpcy5ZID0gYWNvb3JkKCd5JywgWSwgdHJ1ZSk7XG4gICAgICB0aGlzLlogPSBhY29vcmQoJ3onLCBaKTtcbiAgICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gICAgfVxuXG4gICAgc3RhdGljIENVUlZFKCk6IFdlaWVyc3RyYXNzT3B0czxUPiB7XG4gICAgICByZXR1cm4gQ1VSVkU7XG4gICAgfVxuXG4gICAgLyoqIERvZXMgTk9UIHZhbGlkYXRlIGlmIHRoZSBwb2ludCBpcyB2YWxpZC4gVXNlIGAuYXNzZXJ0VmFsaWRpdHkoKWAuICovXG4gICAgc3RhdGljIGZyb21BZmZpbmUocDogQWZmaW5lUG9pbnQ8VD4pOiBQb2ludCB7XG4gICAgICBjb25zdCB7IHgsIHkgfSA9IHAgfHwge307XG4gICAgICBpZiAoIXAgfHwgIUZwLmlzVmFsaWQoeCkgfHwgIUZwLmlzVmFsaWQoeSkpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBhZmZpbmUgcG9pbnQnKTtcbiAgICAgIGlmIChwIGluc3RhbmNlb2YgUG9pbnQpIHRocm93IG5ldyBFcnJvcigncHJvamVjdGl2ZSBwb2ludCBub3QgYWxsb3dlZCcpO1xuICAgICAgLy8gKDAsIDApIHdvdWxkJ3ZlIHByb2R1Y2VkICgwLCAwLCAxKSAtIGluc3RlYWQsIHdlIG5lZWQgKDAsIDEsIDApXG4gICAgICBpZiAoRnAuaXMwKHgpICYmIEZwLmlzMCh5KSkgcmV0dXJuIFBvaW50LlpFUk87XG4gICAgICByZXR1cm4gbmV3IFBvaW50KHgsIHksIEZwLk9ORSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGZyb21CeXRlcyhieXRlczogVWludDhBcnJheSk6IFBvaW50IHtcbiAgICAgIGNvbnN0IFAgPSBQb2ludC5mcm9tQWZmaW5lKGRlY29kZVBvaW50KGFieXRlcyhieXRlcywgdW5kZWZpbmVkLCAncG9pbnQnKSkpO1xuICAgICAgUC5hc3NlcnRWYWxpZGl0eSgpO1xuICAgICAgcmV0dXJuIFA7XG4gICAgfVxuXG4gICAgc3RhdGljIGZyb21IZXgoaGV4OiBzdHJpbmcpOiBQb2ludCB7XG4gICAgICByZXR1cm4gUG9pbnQuZnJvbUJ5dGVzKGhleFRvQnl0ZXMoaGV4KSk7XG4gICAgfVxuXG4gICAgZ2V0IHgoKTogVCB7XG4gICAgICByZXR1cm4gdGhpcy50b0FmZmluZSgpLng7XG4gICAgfVxuICAgIGdldCB5KCk6IFQge1xuICAgICAgcmV0dXJuIHRoaXMudG9BZmZpbmUoKS55O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHdpbmRvd1NpemVcbiAgICAgKiBAcGFyYW0gaXNMYXp5IHRydWUgd2lsbCBkZWZlciB0YWJsZSBjb21wdXRhdGlvbiB1bnRpbCB0aGUgZmlyc3QgbXVsdGlwbGljYXRpb25cbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIHByZWNvbXB1dGUod2luZG93U2l6ZTogbnVtYmVyID0gOCwgaXNMYXp5ID0gdHJ1ZSk6IFBvaW50IHtcbiAgICAgIHduYWYuY3JlYXRlQ2FjaGUodGhpcywgd2luZG93U2l6ZSk7XG4gICAgICBpZiAoIWlzTGF6eSkgdGhpcy5tdWx0aXBseShfM24pOyAvLyByYW5kb20gbnVtYmVyXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyBUT0RPOiByZXR1cm4gYHRoaXNgXG4gICAgLyoqIEEgcG9pbnQgb24gY3VydmUgaXMgdmFsaWQgaWYgaXQgY29uZm9ybXMgdG8gZXF1YXRpb24uICovXG4gICAgYXNzZXJ0VmFsaWRpdHkoKTogdm9pZCB7XG4gICAgICBhc3NlcnRWYWxpZE1lbW8odGhpcyk7XG4gICAgfVxuXG4gICAgaGFzRXZlblkoKTogYm9vbGVhbiB7XG4gICAgICBjb25zdCB7IHkgfSA9IHRoaXMudG9BZmZpbmUoKTtcbiAgICAgIGlmICghRnAuaXNPZGQpIHRocm93IG5ldyBFcnJvcihcIkZpZWxkIGRvZXNuJ3Qgc3VwcG9ydCBpc09kZFwiKTtcbiAgICAgIHJldHVybiAhRnAuaXNPZGQoeSk7XG4gICAgfVxuXG4gICAgLyoqIENvbXBhcmUgb25lIHBvaW50IHRvIGFub3RoZXIuICovXG4gICAgZXF1YWxzKG90aGVyOiBQb2ludCk6IGJvb2xlYW4ge1xuICAgICAgYXByanBvaW50KG90aGVyKTtcbiAgICAgIGNvbnN0IHsgWDogWDEsIFk6IFkxLCBaOiBaMSB9ID0gdGhpcztcbiAgICAgIGNvbnN0IHsgWDogWDIsIFk6IFkyLCBaOiBaMiB9ID0gb3RoZXI7XG4gICAgICBjb25zdCBVMSA9IEZwLmVxbChGcC5tdWwoWDEsIFoyKSwgRnAubXVsKFgyLCBaMSkpO1xuICAgICAgY29uc3QgVTIgPSBGcC5lcWwoRnAubXVsKFkxLCBaMiksIEZwLm11bChZMiwgWjEpKTtcbiAgICAgIHJldHVybiBVMSAmJiBVMjtcbiAgICB9XG5cbiAgICAvKiogRmxpcHMgcG9pbnQgdG8gb25lIGNvcnJlc3BvbmRpbmcgdG8gKHgsIC15KSBpbiBBZmZpbmUgY29vcmRpbmF0ZXMuICovXG4gICAgbmVnYXRlKCk6IFBvaW50IHtcbiAgICAgIHJldHVybiBuZXcgUG9pbnQodGhpcy5YLCBGcC5uZWcodGhpcy5ZKSwgdGhpcy5aKTtcbiAgICB9XG5cbiAgICAvLyBSZW5lcy1Db3N0ZWxsby1CYXRpbmEgZXhjZXB0aW9uLWZyZWUgZG91YmxpbmcgZm9ybXVsYS5cbiAgICAvLyBUaGVyZSBpcyAzMCUgZmFzdGVyIEphY29iaWFuIGZvcm11bGEsIGJ1dCBpdCBpcyBub3QgY29tcGxldGUuXG4gICAgLy8gaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxNS8xMDYwLCBhbGdvcml0aG0gM1xuICAgIC8vIENvc3Q6IDhNICsgM1MgKyAzKmEgKyAyKmIzICsgMTVhZGQuXG4gICAgZG91YmxlKCkge1xuICAgICAgY29uc3QgeyBhLCBiIH0gPSBDVVJWRTtcbiAgICAgIGNvbnN0IGIzID0gRnAubXVsKGIsIF8zbik7XG4gICAgICBjb25zdCB7IFg6IFgxLCBZOiBZMSwgWjogWjEgfSA9IHRoaXM7XG4gICAgICBsZXQgWDMgPSBGcC5aRVJPLCBZMyA9IEZwLlpFUk8sIFozID0gRnAuWkVSTzsgLy8gcHJldHRpZXItaWdub3JlXG4gICAgICBsZXQgdDAgPSBGcC5tdWwoWDEsIFgxKTsgLy8gc3RlcCAxXG4gICAgICBsZXQgdDEgPSBGcC5tdWwoWTEsIFkxKTtcbiAgICAgIGxldCB0MiA9IEZwLm11bChaMSwgWjEpO1xuICAgICAgbGV0IHQzID0gRnAubXVsKFgxLCBZMSk7XG4gICAgICB0MyA9IEZwLmFkZCh0MywgdDMpOyAvLyBzdGVwIDVcbiAgICAgIFozID0gRnAubXVsKFgxLCBaMSk7XG4gICAgICBaMyA9IEZwLmFkZChaMywgWjMpO1xuICAgICAgWDMgPSBGcC5tdWwoYSwgWjMpO1xuICAgICAgWTMgPSBGcC5tdWwoYjMsIHQyKTtcbiAgICAgIFkzID0gRnAuYWRkKFgzLCBZMyk7IC8vIHN0ZXAgMTBcbiAgICAgIFgzID0gRnAuc3ViKHQxLCBZMyk7XG4gICAgICBZMyA9IEZwLmFkZCh0MSwgWTMpO1xuICAgICAgWTMgPSBGcC5tdWwoWDMsIFkzKTtcbiAgICAgIFgzID0gRnAubXVsKHQzLCBYMyk7XG4gICAgICBaMyA9IEZwLm11bChiMywgWjMpOyAvLyBzdGVwIDE1XG4gICAgICB0MiA9IEZwLm11bChhLCB0Mik7XG4gICAgICB0MyA9IEZwLnN1Yih0MCwgdDIpO1xuICAgICAgdDMgPSBGcC5tdWwoYSwgdDMpO1xuICAgICAgdDMgPSBGcC5hZGQodDMsIFozKTtcbiAgICAgIFozID0gRnAuYWRkKHQwLCB0MCk7IC8vIHN0ZXAgMjBcbiAgICAgIHQwID0gRnAuYWRkKFozLCB0MCk7XG4gICAgICB0MCA9IEZwLmFkZCh0MCwgdDIpO1xuICAgICAgdDAgPSBGcC5tdWwodDAsIHQzKTtcbiAgICAgIFkzID0gRnAuYWRkKFkzLCB0MCk7XG4gICAgICB0MiA9IEZwLm11bChZMSwgWjEpOyAvLyBzdGVwIDI1XG4gICAgICB0MiA9IEZwLmFkZCh0MiwgdDIpO1xuICAgICAgdDAgPSBGcC5tdWwodDIsIHQzKTtcbiAgICAgIFgzID0gRnAuc3ViKFgzLCB0MCk7XG4gICAgICBaMyA9IEZwLm11bCh0MiwgdDEpO1xuICAgICAgWjMgPSBGcC5hZGQoWjMsIFozKTsgLy8gc3RlcCAzMFxuICAgICAgWjMgPSBGcC5hZGQoWjMsIFozKTtcbiAgICAgIHJldHVybiBuZXcgUG9pbnQoWDMsIFkzLCBaMyk7XG4gICAgfVxuXG4gICAgLy8gUmVuZXMtQ29zdGVsbG8tQmF0aW5hIGV4Y2VwdGlvbi1mcmVlIGFkZGl0aW9uIGZvcm11bGEuXG4gICAgLy8gVGhlcmUgaXMgMzAlIGZhc3RlciBKYWNvYmlhbiBmb3JtdWxhLCBidXQgaXQgaXMgbm90IGNvbXBsZXRlLlxuICAgIC8vIGh0dHBzOi8vZXByaW50LmlhY3Iub3JnLzIwMTUvMTA2MCwgYWxnb3JpdGhtIDFcbiAgICAvLyBDb3N0OiAxMk0gKyAwUyArIDMqYSArIDMqYjMgKyAyM2FkZC5cbiAgICBhZGQob3RoZXI6IFBvaW50KTogUG9pbnQge1xuICAgICAgYXByanBvaW50KG90aGVyKTtcbiAgICAgIGNvbnN0IHsgWDogWDEsIFk6IFkxLCBaOiBaMSB9ID0gdGhpcztcbiAgICAgIGNvbnN0IHsgWDogWDIsIFk6IFkyLCBaOiBaMiB9ID0gb3RoZXI7XG4gICAgICBsZXQgWDMgPSBGcC5aRVJPLCBZMyA9IEZwLlpFUk8sIFozID0gRnAuWkVSTzsgLy8gcHJldHRpZXItaWdub3JlXG4gICAgICBjb25zdCBhID0gQ1VSVkUuYTtcbiAgICAgIGNvbnN0IGIzID0gRnAubXVsKENVUlZFLmIsIF8zbik7XG4gICAgICBsZXQgdDAgPSBGcC5tdWwoWDEsIFgyKTsgLy8gc3RlcCAxXG4gICAgICBsZXQgdDEgPSBGcC5tdWwoWTEsIFkyKTtcbiAgICAgIGxldCB0MiA9IEZwLm11bChaMSwgWjIpO1xuICAgICAgbGV0IHQzID0gRnAuYWRkKFgxLCBZMSk7XG4gICAgICBsZXQgdDQgPSBGcC5hZGQoWDIsIFkyKTsgLy8gc3RlcCA1XG4gICAgICB0MyA9IEZwLm11bCh0MywgdDQpO1xuICAgICAgdDQgPSBGcC5hZGQodDAsIHQxKTtcbiAgICAgIHQzID0gRnAuc3ViKHQzLCB0NCk7XG4gICAgICB0NCA9IEZwLmFkZChYMSwgWjEpO1xuICAgICAgbGV0IHQ1ID0gRnAuYWRkKFgyLCBaMik7IC8vIHN0ZXAgMTBcbiAgICAgIHQ0ID0gRnAubXVsKHQ0LCB0NSk7XG4gICAgICB0NSA9IEZwLmFkZCh0MCwgdDIpO1xuICAgICAgdDQgPSBGcC5zdWIodDQsIHQ1KTtcbiAgICAgIHQ1ID0gRnAuYWRkKFkxLCBaMSk7XG4gICAgICBYMyA9IEZwLmFkZChZMiwgWjIpOyAvLyBzdGVwIDE1XG4gICAgICB0NSA9IEZwLm11bCh0NSwgWDMpO1xuICAgICAgWDMgPSBGcC5hZGQodDEsIHQyKTtcbiAgICAgIHQ1ID0gRnAuc3ViKHQ1LCBYMyk7XG4gICAgICBaMyA9IEZwLm11bChhLCB0NCk7XG4gICAgICBYMyA9IEZwLm11bChiMywgdDIpOyAvLyBzdGVwIDIwXG4gICAgICBaMyA9IEZwLmFkZChYMywgWjMpO1xuICAgICAgWDMgPSBGcC5zdWIodDEsIFozKTtcbiAgICAgIFozID0gRnAuYWRkKHQxLCBaMyk7XG4gICAgICBZMyA9IEZwLm11bChYMywgWjMpO1xuICAgICAgdDEgPSBGcC5hZGQodDAsIHQwKTsgLy8gc3RlcCAyNVxuICAgICAgdDEgPSBGcC5hZGQodDEsIHQwKTtcbiAgICAgIHQyID0gRnAubXVsKGEsIHQyKTtcbiAgICAgIHQ0ID0gRnAubXVsKGIzLCB0NCk7XG4gICAgICB0MSA9IEZwLmFkZCh0MSwgdDIpO1xuICAgICAgdDIgPSBGcC5zdWIodDAsIHQyKTsgLy8gc3RlcCAzMFxuICAgICAgdDIgPSBGcC5tdWwoYSwgdDIpO1xuICAgICAgdDQgPSBGcC5hZGQodDQsIHQyKTtcbiAgICAgIHQwID0gRnAubXVsKHQxLCB0NCk7XG4gICAgICBZMyA9IEZwLmFkZChZMywgdDApO1xuICAgICAgdDAgPSBGcC5tdWwodDUsIHQ0KTsgLy8gc3RlcCAzNVxuICAgICAgWDMgPSBGcC5tdWwodDMsIFgzKTtcbiAgICAgIFgzID0gRnAuc3ViKFgzLCB0MCk7XG4gICAgICB0MCA9IEZwLm11bCh0MywgdDEpO1xuICAgICAgWjMgPSBGcC5tdWwodDUsIFozKTtcbiAgICAgIFozID0gRnAuYWRkKFozLCB0MCk7IC8vIHN0ZXAgNDBcbiAgICAgIHJldHVybiBuZXcgUG9pbnQoWDMsIFkzLCBaMyk7XG4gICAgfVxuXG4gICAgc3VidHJhY3Qob3RoZXI6IFBvaW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGQob3RoZXIubmVnYXRlKCkpO1xuICAgIH1cblxuICAgIGlzMCgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLmVxdWFscyhQb2ludC5aRVJPKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb25zdGFudCB0aW1lIG11bHRpcGxpY2F0aW9uLlxuICAgICAqIFVzZXMgd05BRiBtZXRob2QuIFdpbmRvd2VkIG1ldGhvZCBtYXkgYmUgMTAlIGZhc3RlcixcbiAgICAgKiBidXQgdGFrZXMgMnggbG9uZ2VyIHRvIGdlbmVyYXRlIGFuZCBjb25zdW1lcyAyeCBtZW1vcnkuXG4gICAgICogVXNlcyBwcmVjb21wdXRlcyB3aGVuIGF2YWlsYWJsZS5cbiAgICAgKiBVc2VzIGVuZG9tb3JwaGlzbSBmb3IgS29ibGl0eiBjdXJ2ZXMuXG4gICAgICogQHBhcmFtIHNjYWxhciBieSB3aGljaCB0aGUgcG9pbnQgd291bGQgYmUgbXVsdGlwbGllZFxuICAgICAqIEByZXR1cm5zIE5ldyBwb2ludFxuICAgICAqL1xuICAgIG11bHRpcGx5KHNjYWxhcjogYmlnaW50KTogUG9pbnQge1xuICAgICAgY29uc3QgeyBlbmRvIH0gPSBleHRyYU9wdHM7XG4gICAgICBpZiAoIUZuLmlzVmFsaWROb3QwKHNjYWxhcikpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzY2FsYXI6IG91dCBvZiByYW5nZScpOyAvLyAwIGlzIGludmFsaWRcbiAgICAgIGxldCBwb2ludDogUG9pbnQsIGZha2U6IFBvaW50OyAvLyBGYWtlIHBvaW50IGlzIHVzZWQgdG8gY29uc3QtdGltZSBtdWx0XG4gICAgICBjb25zdCBtdWwgPSAobjogYmlnaW50KSA9PiB3bmFmLmNhY2hlZCh0aGlzLCBuLCAocCkgPT4gbm9ybWFsaXplWihQb2ludCwgcCkpO1xuICAgICAgLyoqIFNlZSBkb2NzIGZvciB7QGxpbmsgRW5kb21vcnBoaXNtT3B0c30gKi9cbiAgICAgIGlmIChlbmRvKSB7XG4gICAgICAgIGNvbnN0IHsgazFuZWcsIGsxLCBrMm5lZywgazIgfSA9IHNwbGl0RW5kb1NjYWxhck4oc2NhbGFyKTtcbiAgICAgICAgY29uc3QgeyBwOiBrMXAsIGY6IGsxZiB9ID0gbXVsKGsxKTtcbiAgICAgICAgY29uc3QgeyBwOiBrMnAsIGY6IGsyZiB9ID0gbXVsKGsyKTtcbiAgICAgICAgZmFrZSA9IGsxZi5hZGQoazJmKTtcbiAgICAgICAgcG9pbnQgPSBmaW5pc2hFbmRvKGVuZG8uYmV0YSwgazFwLCBrMnAsIGsxbmVnLCBrMm5lZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB7IHAsIGYgfSA9IG11bChzY2FsYXIpO1xuICAgICAgICBwb2ludCA9IHA7XG4gICAgICAgIGZha2UgPSBmO1xuICAgICAgfVxuICAgICAgLy8gTm9ybWFsaXplIGB6YCBmb3IgYm90aCBwb2ludHMsIGJ1dCByZXR1cm4gb25seSByZWFsIG9uZVxuICAgICAgcmV0dXJuIG5vcm1hbGl6ZVooUG9pbnQsIFtwb2ludCwgZmFrZV0pWzBdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE5vbi1jb25zdGFudC10aW1lIG11bHRpcGxpY2F0aW9uLiBVc2VzIGRvdWJsZS1hbmQtYWRkIGFsZ29yaXRobS5cbiAgICAgKiBJdCdzIGZhc3RlciwgYnV0IHNob3VsZCBvbmx5IGJlIHVzZWQgd2hlbiB5b3UgZG9uJ3QgY2FyZSBhYm91dFxuICAgICAqIGFuIGV4cG9zZWQgc2VjcmV0IGtleSBlLmcuIHNpZyB2ZXJpZmljYXRpb24sIHdoaWNoIHdvcmtzIG92ZXIgKnB1YmxpYyoga2V5cy5cbiAgICAgKi9cbiAgICBtdWx0aXBseVVuc2FmZShzYzogYmlnaW50KTogUG9pbnQge1xuICAgICAgY29uc3QgeyBlbmRvIH0gPSBleHRyYU9wdHM7XG4gICAgICBjb25zdCBwID0gdGhpcyBhcyBQb2ludDtcbiAgICAgIGlmICghRm4uaXNWYWxpZChzYykpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzY2FsYXI6IG91dCBvZiByYW5nZScpOyAvLyAwIGlzIHZhbGlkXG4gICAgICBpZiAoc2MgPT09IF8wbiB8fCBwLmlzMCgpKSByZXR1cm4gUG9pbnQuWkVSTzsgLy8gMFxuICAgICAgaWYgKHNjID09PSBfMW4pIHJldHVybiBwOyAvLyAxXG4gICAgICBpZiAod25hZi5oYXNDYWNoZSh0aGlzKSkgcmV0dXJuIHRoaXMubXVsdGlwbHkoc2MpOyAvLyBwcmVjb21wdXRlc1xuICAgICAgLy8gV2UgZG9uJ3QgaGF2ZSBtZXRob2QgZm9yIGRvdWJsZSBzY2FsYXIgbXVsdGlwbGljYXRpb24gKGFQICsgYlEpOlxuICAgICAgLy8gRXZlbiB3aXRoIHVzaW5nIFN0cmF1c3MtU2hhbWlyIHRyaWNrLCBpdCdzIDM1JSBzbG93ZXIgdGhhbiBuYVx1MDBFRnZlIG11bCthZGQuXG4gICAgICBpZiAoZW5kbykge1xuICAgICAgICBjb25zdCB7IGsxbmVnLCBrMSwgazJuZWcsIGsyIH0gPSBzcGxpdEVuZG9TY2FsYXJOKHNjKTtcbiAgICAgICAgY29uc3QgeyBwMSwgcDIgfSA9IG11bEVuZG9VbnNhZmUoUG9pbnQsIHAsIGsxLCBrMik7IC8vIDMwJSBmYXN0ZXIgdnMgd25hZi51bnNhZmVcbiAgICAgICAgcmV0dXJuIGZpbmlzaEVuZG8oZW5kby5iZXRhLCBwMSwgcDIsIGsxbmVnLCBrMm5lZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gd25hZi51bnNhZmUocCwgc2MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIFByb2plY3RpdmUgcG9pbnQgdG8gYWZmaW5lICh4LCB5KSBjb29yZGluYXRlcy5cbiAgICAgKiBAcGFyYW0gaW52ZXJ0ZWRaIFpeLTEgKGludmVydGVkIHplcm8pIC0gb3B0aW9uYWwsIHByZWNvbXB1dGF0aW9uIGlzIHVzZWZ1bCBmb3IgaW52ZXJ0QmF0Y2hcbiAgICAgKi9cbiAgICB0b0FmZmluZShpbnZlcnRlZFo/OiBUKTogQWZmaW5lUG9pbnQ8VD4ge1xuICAgICAgcmV0dXJuIHRvQWZmaW5lTWVtbyh0aGlzLCBpbnZlcnRlZFopO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyB3aGV0aGVyIFBvaW50IGlzIGZyZWUgb2YgdG9yc2lvbiBlbGVtZW50cyAoaXMgaW4gcHJpbWUgc3ViZ3JvdXApLlxuICAgICAqIEFsd2F5cyB0b3JzaW9uLWZyZWUgZm9yIGNvZmFjdG9yPTEgY3VydmVzLlxuICAgICAqL1xuICAgIGlzVG9yc2lvbkZyZWUoKTogYm9vbGVhbiB7XG4gICAgICBjb25zdCB7IGlzVG9yc2lvbkZyZWUgfSA9IGV4dHJhT3B0cztcbiAgICAgIGlmIChjb2ZhY3RvciA9PT0gXzFuKSByZXR1cm4gdHJ1ZTtcbiAgICAgIGlmIChpc1RvcnNpb25GcmVlKSByZXR1cm4gaXNUb3JzaW9uRnJlZShQb2ludCwgdGhpcyk7XG4gICAgICByZXR1cm4gd25hZi51bnNhZmUodGhpcywgQ1VSVkVfT1JERVIpLmlzMCgpO1xuICAgIH1cblxuICAgIGNsZWFyQ29mYWN0b3IoKTogUG9pbnQge1xuICAgICAgY29uc3QgeyBjbGVhckNvZmFjdG9yIH0gPSBleHRyYU9wdHM7XG4gICAgICBpZiAoY29mYWN0b3IgPT09IF8xbikgcmV0dXJuIHRoaXM7IC8vIEZhc3QtcGF0aFxuICAgICAgaWYgKGNsZWFyQ29mYWN0b3IpIHJldHVybiBjbGVhckNvZmFjdG9yKFBvaW50LCB0aGlzKSBhcyBQb2ludDtcbiAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5VW5zYWZlKGNvZmFjdG9yKTtcbiAgICB9XG5cbiAgICBpc1NtYWxsT3JkZXIoKTogYm9vbGVhbiB7XG4gICAgICAvLyBjYW4gd2UgdXNlIHRoaXMuY2xlYXJDb2ZhY3RvcigpP1xuICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbHlVbnNhZmUoY29mYWN0b3IpLmlzMCgpO1xuICAgIH1cblxuICAgIHRvQnl0ZXMoaXNDb21wcmVzc2VkID0gdHJ1ZSk6IFVpbnQ4QXJyYXkge1xuICAgICAgYWJvb2woaXNDb21wcmVzc2VkLCAnaXNDb21wcmVzc2VkJyk7XG4gICAgICB0aGlzLmFzc2VydFZhbGlkaXR5KCk7XG4gICAgICByZXR1cm4gZW5jb2RlUG9pbnQoUG9pbnQsIHRoaXMsIGlzQ29tcHJlc3NlZCk7XG4gICAgfVxuXG4gICAgdG9IZXgoaXNDb21wcmVzc2VkID0gdHJ1ZSk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gYnl0ZXNUb0hleCh0aGlzLnRvQnl0ZXMoaXNDb21wcmVzc2VkKSk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICByZXR1cm4gYDxQb2ludCAke3RoaXMuaXMwKCkgPyAnWkVSTycgOiB0aGlzLnRvSGV4KCl9PmA7XG4gICAgfVxuICB9XG4gIGNvbnN0IGJpdHMgPSBGbi5CSVRTO1xuICBjb25zdCB3bmFmID0gbmV3IHdOQUYoUG9pbnQsIGV4dHJhT3B0cy5lbmRvID8gTWF0aC5jZWlsKGJpdHMgLyAyKSA6IGJpdHMpO1xuICBQb2ludC5CQVNFLnByZWNvbXB1dGUoOCk7IC8vIEVuYWJsZSBwcmVjb21wdXRlcy4gU2xvd3MgZG93biBmaXJzdCBwdWJsaWNLZXkgY29tcHV0YXRpb24gYnkgMjBtcy5cbiAgcmV0dXJuIFBvaW50O1xufVxuXG4vKiogTWV0aG9kcyBvZiBFQ0RTQSBzaWduYXR1cmUgaW5zdGFuY2UuICovXG5leHBvcnQgaW50ZXJmYWNlIEVDRFNBU2lnbmF0dXJlIHtcbiAgcmVhZG9ubHkgcjogYmlnaW50O1xuICByZWFkb25seSBzOiBiaWdpbnQ7XG4gIHJlYWRvbmx5IHJlY292ZXJ5PzogbnVtYmVyO1xuICBhZGRSZWNvdmVyeUJpdChyZWNvdmVyeTogbnVtYmVyKTogRUNEU0FTaWduYXR1cmUgJiB7IHJlYWRvbmx5IHJlY292ZXJ5OiBudW1iZXIgfTtcbiAgaGFzSGlnaFMoKTogYm9vbGVhbjtcbiAgcmVjb3ZlclB1YmxpY0tleShtZXNzYWdlSGFzaDogVWludDhBcnJheSk6IFdlaWVyc3RyYXNzUG9pbnQ8YmlnaW50PjtcbiAgdG9CeXRlcyhmb3JtYXQ/OiBzdHJpbmcpOiBVaW50OEFycmF5O1xuICB0b0hleChmb3JtYXQ/OiBzdHJpbmcpOiBzdHJpbmc7XG59XG4vKiogTWV0aG9kcyBvZiBFQ0RTQSBzaWduYXR1cmUgY29uc3RydWN0b3IuICovXG5leHBvcnQgdHlwZSBFQ0RTQVNpZ25hdHVyZUNvbnMgPSB7XG4gIG5ldyAocjogYmlnaW50LCBzOiBiaWdpbnQsIHJlY292ZXJ5PzogbnVtYmVyKTogRUNEU0FTaWduYXR1cmU7XG4gIGZyb21CeXRlcyhieXRlczogVWludDhBcnJheSwgZm9ybWF0PzogRUNEU0FTaWduYXR1cmVGb3JtYXQpOiBFQ0RTQVNpZ25hdHVyZTtcbiAgZnJvbUhleChoZXg6IHN0cmluZywgZm9ybWF0PzogRUNEU0FTaWduYXR1cmVGb3JtYXQpOiBFQ0RTQVNpZ25hdHVyZTtcbn07XG5cbi8vIFBvaW50cyBzdGFydCB3aXRoIGJ5dGUgMHgwMiB3aGVuIHkgaXMgZXZlbjsgb3RoZXJ3aXNlIDB4MDNcbmZ1bmN0aW9uIHBwcmVmaXgoaGFzRXZlblk6IGJvb2xlYW4pOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIFVpbnQ4QXJyYXkub2YoaGFzRXZlblkgPyAweDAyIDogMHgwMyk7XG59XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgdGhlIFNoYWxsdWUgYW5kIHZhbiBkZSBXb2VzdGlqbmUgbWV0aG9kIGZvciBhbnkgd2VpZXJzdHJhc3MgY3VydmUuXG4gKiBUT0RPOiBjaGVjayBpZiB0aGVyZSBpcyBhIHdheSB0byBtZXJnZSB0aGlzIHdpdGggdXZSYXRpbyBpbiBFZHdhcmRzOyBtb3ZlIHRvIG1vZHVsYXIuXG4gKiBiID0gVHJ1ZSBhbmQgeSA9IHNxcnQodSAvIHYpIGlmICh1IC8gdikgaXMgc3F1YXJlIGluIEYsIGFuZFxuICogYiA9IEZhbHNlIGFuZCB5ID0gc3FydChaICogKHUgLyB2KSkgb3RoZXJ3aXNlLlxuICogQHBhcmFtIEZwXG4gKiBAcGFyYW0gWlxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNXVUZwU3FydFJhdGlvPFQ+KFxuICBGcDogSUZpZWxkPFQ+LFxuICBaOiBUXG4pOiAodTogVCwgdjogVCkgPT4geyBpc1ZhbGlkOiBib29sZWFuOyB2YWx1ZTogVCB9IHtcbiAgLy8gR2VuZXJpYyBpbXBsZW1lbnRhdGlvblxuICBjb25zdCBxID0gRnAuT1JERVI7XG4gIGxldCBsID0gXzBuO1xuICBmb3IgKGxldCBvID0gcSAtIF8xbjsgbyAlIF8ybiA9PT0gXzBuOyBvIC89IF8ybikgbCArPSBfMW47XG4gIGNvbnN0IGMxID0gbDsgLy8gMS4gYzEsIHRoZSBsYXJnZXN0IGludGVnZXIgc3VjaCB0aGF0IDJeYzEgZGl2aWRlcyBxIC0gMS5cbiAgLy8gV2UgbmVlZCAybiAqKiBjMSBhbmQgMm4gKiogKGMxLTEpLiBXZSBjYW4ndCB1c2UgKio7IGJ1dCB3ZSBjYW4gdXNlIDw8LlxuICAvLyAybiAqKiBjMSA9PSAybiA8PCAoYzEtMSlcbiAgY29uc3QgXzJuX3Bvd19jMV8xID0gXzJuIDw8IChjMSAtIF8xbiAtIF8xbik7XG4gIGNvbnN0IF8ybl9wb3dfYzEgPSBfMm5fcG93X2MxXzEgKiBfMm47XG4gIGNvbnN0IGMyID0gKHEgLSBfMW4pIC8gXzJuX3Bvd19jMTsgLy8gMi4gYzIgPSAocSAtIDEpIC8gKDJeYzEpICAjIEludGVnZXIgYXJpdGhtZXRpY1xuICBjb25zdCBjMyA9IChjMiAtIF8xbikgLyBfMm47IC8vIDMuIGMzID0gKGMyIC0gMSkgLyAyICAgICAgICAgICAgIyBJbnRlZ2VyIGFyaXRobWV0aWNcbiAgY29uc3QgYzQgPSBfMm5fcG93X2MxIC0gXzFuOyAvLyA0LiBjNCA9IDJeYzEgLSAxICAgICAgICAgICAgICAgICMgSW50ZWdlciBhcml0aG1ldGljXG4gIGNvbnN0IGM1ID0gXzJuX3Bvd19jMV8xOyAvLyA1LiBjNSA9IDJeKGMxIC0gMSkgICAgICAgICAgICAgICAgICAjIEludGVnZXIgYXJpdGhtZXRpY1xuICBjb25zdCBjNiA9IEZwLnBvdyhaLCBjMik7IC8vIDYuIGM2ID0gWl5jMlxuICBjb25zdCBjNyA9IEZwLnBvdyhaLCAoYzIgKyBfMW4pIC8gXzJuKTsgLy8gNy4gYzcgPSBaXigoYzIgKyAxKSAvIDIpXG4gIGxldCBzcXJ0UmF0aW8gPSAodTogVCwgdjogVCk6IHsgaXNWYWxpZDogYm9vbGVhbjsgdmFsdWU6IFQgfSA9PiB7XG4gICAgbGV0IHR2MSA9IGM2OyAvLyAxLiB0djEgPSBjNlxuICAgIGxldCB0djIgPSBGcC5wb3codiwgYzQpOyAvLyAyLiB0djIgPSB2XmM0XG4gICAgbGV0IHR2MyA9IEZwLnNxcih0djIpOyAvLyAzLiB0djMgPSB0djJeMlxuICAgIHR2MyA9IEZwLm11bCh0djMsIHYpOyAvLyA0LiB0djMgPSB0djMgKiB2XG4gICAgbGV0IHR2NSA9IEZwLm11bCh1LCB0djMpOyAvLyA1LiB0djUgPSB1ICogdHYzXG4gICAgdHY1ID0gRnAucG93KHR2NSwgYzMpOyAvLyA2LiB0djUgPSB0djVeYzNcbiAgICB0djUgPSBGcC5tdWwodHY1LCB0djIpOyAvLyA3LiB0djUgPSB0djUgKiB0djJcbiAgICB0djIgPSBGcC5tdWwodHY1LCB2KTsgLy8gOC4gdHYyID0gdHY1ICogdlxuICAgIHR2MyA9IEZwLm11bCh0djUsIHUpOyAvLyA5LiB0djMgPSB0djUgKiB1XG4gICAgbGV0IHR2NCA9IEZwLm11bCh0djMsIHR2Mik7IC8vIDEwLiB0djQgPSB0djMgKiB0djJcbiAgICB0djUgPSBGcC5wb3codHY0LCBjNSk7IC8vIDExLiB0djUgPSB0djReYzVcbiAgICBsZXQgaXNRUiA9IEZwLmVxbCh0djUsIEZwLk9ORSk7IC8vIDEyLiBpc1FSID0gdHY1ID09IDFcbiAgICB0djIgPSBGcC5tdWwodHYzLCBjNyk7IC8vIDEzLiB0djIgPSB0djMgKiBjN1xuICAgIHR2NSA9IEZwLm11bCh0djQsIHR2MSk7IC8vIDE0LiB0djUgPSB0djQgKiB0djFcbiAgICB0djMgPSBGcC5jbW92KHR2MiwgdHYzLCBpc1FSKTsgLy8gMTUuIHR2MyA9IENNT1YodHYyLCB0djMsIGlzUVIpXG4gICAgdHY0ID0gRnAuY21vdih0djUsIHR2NCwgaXNRUik7IC8vIDE2LiB0djQgPSBDTU9WKHR2NSwgdHY0LCBpc1FSKVxuICAgIC8vIDE3LiBmb3IgaSBpbiAoYzEsIGMxIC0gMSwgLi4uLCAyKTpcbiAgICBmb3IgKGxldCBpID0gYzE7IGkgPiBfMW47IGktLSkge1xuICAgICAgbGV0IHR2NSA9IGkgLSBfMm47IC8vIDE4LiAgICB0djUgPSBpIC0gMlxuICAgICAgdHY1ID0gXzJuIDw8ICh0djUgLSBfMW4pOyAvLyAxOS4gICAgdHY1ID0gMl50djVcbiAgICAgIGxldCB0dnY1ID0gRnAucG93KHR2NCwgdHY1KTsgLy8gMjAuICAgIHR2NSA9IHR2NF50djVcbiAgICAgIGNvbnN0IGUxID0gRnAuZXFsKHR2djUsIEZwLk9ORSk7IC8vIDIxLiAgICBlMSA9IHR2NSA9PSAxXG4gICAgICB0djIgPSBGcC5tdWwodHYzLCB0djEpOyAvLyAyMi4gICAgdHYyID0gdHYzICogdHYxXG4gICAgICB0djEgPSBGcC5tdWwodHYxLCB0djEpOyAvLyAyMy4gICAgdHYxID0gdHYxICogdHYxXG4gICAgICB0dnY1ID0gRnAubXVsKHR2NCwgdHYxKTsgLy8gMjQuICAgIHR2NSA9IHR2NCAqIHR2MVxuICAgICAgdHYzID0gRnAuY21vdih0djIsIHR2MywgZTEpOyAvLyAyNS4gICAgdHYzID0gQ01PVih0djIsIHR2MywgZTEpXG4gICAgICB0djQgPSBGcC5jbW92KHR2djUsIHR2NCwgZTEpOyAvLyAyNi4gICAgdHY0ID0gQ01PVih0djUsIHR2NCwgZTEpXG4gICAgfVxuICAgIHJldHVybiB7IGlzVmFsaWQ6IGlzUVIsIHZhbHVlOiB0djMgfTtcbiAgfTtcbiAgaWYgKEZwLk9SREVSICUgXzRuID09PSBfM24pIHtcbiAgICAvLyBzcXJ0X3JhdGlvXzNtb2Q0KHUsIHYpXG4gICAgY29uc3QgYzEgPSAoRnAuT1JERVIgLSBfM24pIC8gXzRuOyAvLyAxLiBjMSA9IChxIC0gMykgLyA0ICAgICAjIEludGVnZXIgYXJpdGhtZXRpY1xuICAgIGNvbnN0IGMyID0gRnAuc3FydChGcC5uZWcoWikpOyAvLyAyLiBjMiA9IHNxcnQoLVopXG4gICAgc3FydFJhdGlvID0gKHU6IFQsIHY6IFQpID0+IHtcbiAgICAgIGxldCB0djEgPSBGcC5zcXIodik7IC8vIDEuIHR2MSA9IHZeMlxuICAgICAgY29uc3QgdHYyID0gRnAubXVsKHUsIHYpOyAvLyAyLiB0djIgPSB1ICogdlxuICAgICAgdHYxID0gRnAubXVsKHR2MSwgdHYyKTsgLy8gMy4gdHYxID0gdHYxICogdHYyXG4gICAgICBsZXQgeTEgPSBGcC5wb3codHYxLCBjMSk7IC8vIDQuIHkxID0gdHYxXmMxXG4gICAgICB5MSA9IEZwLm11bCh5MSwgdHYyKTsgLy8gNS4geTEgPSB5MSAqIHR2MlxuICAgICAgY29uc3QgeTIgPSBGcC5tdWwoeTEsIGMyKTsgLy8gNi4geTIgPSB5MSAqIGMyXG4gICAgICBjb25zdCB0djMgPSBGcC5tdWwoRnAuc3FyKHkxKSwgdik7IC8vIDcuIHR2MyA9IHkxXjI7IDguIHR2MyA9IHR2MyAqIHZcbiAgICAgIGNvbnN0IGlzUVIgPSBGcC5lcWwodHYzLCB1KTsgLy8gOS4gaXNRUiA9IHR2MyA9PSB1XG4gICAgICBsZXQgeSA9IEZwLmNtb3YoeTIsIHkxLCBpc1FSKTsgLy8gMTAuIHkgPSBDTU9WKHkyLCB5MSwgaXNRUilcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGlzUVIsIHZhbHVlOiB5IH07IC8vIDExLiByZXR1cm4gKGlzUVIsIHkpIGlzUVIgPyB5IDogeSpjMlxuICAgIH07XG4gIH1cbiAgLy8gTm8gY3VydmVzIHVzZXMgdGhhdFxuICAvLyBpZiAoRnAuT1JERVIgJSBfOG4gPT09IF81bikgLy8gc3FydF9yYXRpb181bW9kOFxuICByZXR1cm4gc3FydFJhdGlvO1xufVxuLyoqXG4gKiBTaW1wbGlmaWVkIFNoYWxsdWUtdmFuIGRlIFdvZXN0aWpuZS1VbGFzIE1ldGhvZFxuICogaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzkzODAjc2VjdGlvbi02LjYuMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFwVG9DdXJ2ZVNpbXBsZVNXVTxUPihcbiAgRnA6IElGaWVsZDxUPixcbiAgb3B0czoge1xuICAgIEE6IFQ7XG4gICAgQjogVDtcbiAgICBaOiBUO1xuICB9XG4pOiAodTogVCkgPT4geyB4OiBUOyB5OiBUIH0ge1xuICB2YWxpZGF0ZUZpZWxkKEZwKTtcbiAgY29uc3QgeyBBLCBCLCBaIH0gPSBvcHRzO1xuICBpZiAoIUZwLmlzVmFsaWQoQSkgfHwgIUZwLmlzVmFsaWQoQikgfHwgIUZwLmlzVmFsaWQoWikpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdtYXBUb0N1cnZlU2ltcGxlU1dVOiBpbnZhbGlkIG9wdHMnKTtcbiAgY29uc3Qgc3FydFJhdGlvID0gU1dVRnBTcXJ0UmF0aW8oRnAsIFopO1xuICBpZiAoIUZwLmlzT2RkKSB0aHJvdyBuZXcgRXJyb3IoJ0ZpZWxkIGRvZXMgbm90IGhhdmUgLmlzT2RkKCknKTtcbiAgLy8gSW5wdXQ6IHUsIGFuIGVsZW1lbnQgb2YgRi5cbiAgLy8gT3V0cHV0OiAoeCwgeSksIGEgcG9pbnQgb24gRS5cbiAgcmV0dXJuICh1OiBUKTogeyB4OiBUOyB5OiBUIH0gPT4ge1xuICAgIC8vIHByZXR0aWVyLWlnbm9yZVxuICAgIGxldCB0djEsIHR2MiwgdHYzLCB0djQsIHR2NSwgdHY2LCB4LCB5O1xuICAgIHR2MSA9IEZwLnNxcih1KTsgLy8gMS4gIHR2MSA9IHVeMlxuICAgIHR2MSA9IEZwLm11bCh0djEsIFopOyAvLyAyLiAgdHYxID0gWiAqIHR2MVxuICAgIHR2MiA9IEZwLnNxcih0djEpOyAvLyAzLiAgdHYyID0gdHYxXjJcbiAgICB0djIgPSBGcC5hZGQodHYyLCB0djEpOyAvLyA0LiAgdHYyID0gdHYyICsgdHYxXG4gICAgdHYzID0gRnAuYWRkKHR2MiwgRnAuT05FKTsgLy8gNS4gIHR2MyA9IHR2MiArIDFcbiAgICB0djMgPSBGcC5tdWwodHYzLCBCKTsgLy8gNi4gIHR2MyA9IEIgKiB0djNcbiAgICB0djQgPSBGcC5jbW92KFosIEZwLm5lZyh0djIpLCAhRnAuZXFsKHR2MiwgRnAuWkVSTykpOyAvLyA3LiAgdHY0ID0gQ01PVihaLCAtdHYyLCB0djIgIT0gMClcbiAgICB0djQgPSBGcC5tdWwodHY0LCBBKTsgLy8gOC4gIHR2NCA9IEEgKiB0djRcbiAgICB0djIgPSBGcC5zcXIodHYzKTsgLy8gOS4gIHR2MiA9IHR2M14yXG4gICAgdHY2ID0gRnAuc3FyKHR2NCk7IC8vIDEwLiB0djYgPSB0djReMlxuICAgIHR2NSA9IEZwLm11bCh0djYsIEEpOyAvLyAxMS4gdHY1ID0gQSAqIHR2NlxuICAgIHR2MiA9IEZwLmFkZCh0djIsIHR2NSk7IC8vIDEyLiB0djIgPSB0djIgKyB0djVcbiAgICB0djIgPSBGcC5tdWwodHYyLCB0djMpOyAvLyAxMy4gdHYyID0gdHYyICogdHYzXG4gICAgdHY2ID0gRnAubXVsKHR2NiwgdHY0KTsgLy8gMTQuIHR2NiA9IHR2NiAqIHR2NFxuICAgIHR2NSA9IEZwLm11bCh0djYsIEIpOyAvLyAxNS4gdHY1ID0gQiAqIHR2NlxuICAgIHR2MiA9IEZwLmFkZCh0djIsIHR2NSk7IC8vIDE2LiB0djIgPSB0djIgKyB0djVcbiAgICB4ID0gRnAubXVsKHR2MSwgdHYzKTsgLy8gMTcuICAgeCA9IHR2MSAqIHR2M1xuICAgIGNvbnN0IHsgaXNWYWxpZCwgdmFsdWUgfSA9IHNxcnRSYXRpbyh0djIsIHR2Nik7IC8vIDE4LiAoaXNfZ3gxX3NxdWFyZSwgeTEpID0gc3FydF9yYXRpbyh0djIsIHR2NilcbiAgICB5ID0gRnAubXVsKHR2MSwgdSk7IC8vIDE5LiAgIHkgPSB0djEgKiB1ICAtPiBaICogdV4zICogeTFcbiAgICB5ID0gRnAubXVsKHksIHZhbHVlKTsgLy8gMjAuICAgeSA9IHkgKiB5MVxuICAgIHggPSBGcC5jbW92KHgsIHR2MywgaXNWYWxpZCk7IC8vIDIxLiAgIHggPSBDTU9WKHgsIHR2MywgaXNfZ3gxX3NxdWFyZSlcbiAgICB5ID0gRnAuY21vdih5LCB2YWx1ZSwgaXNWYWxpZCk7IC8vIDIyLiAgIHkgPSBDTU9WKHksIHkxLCBpc19neDFfc3F1YXJlKVxuICAgIGNvbnN0IGUxID0gRnAuaXNPZGQhKHUpID09PSBGcC5pc09kZCEoeSk7IC8vIDIzLiAgZTEgPSBzZ24wKHUpID09IHNnbjAoeSlcbiAgICB5ID0gRnAuY21vdihGcC5uZWcoeSksIHksIGUxKTsgLy8gMjQuICAgeSA9IENNT1YoLXksIHksIGUxKVxuICAgIGNvbnN0IHR2NF9pbnYgPSBGcEludmVydEJhdGNoKEZwLCBbdHY0XSwgdHJ1ZSlbMF07XG4gICAgeCA9IEZwLm11bCh4LCB0djRfaW52KTsgLy8gMjUuICAgeCA9IHggLyB0djRcbiAgICByZXR1cm4geyB4LCB5IH07XG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFdMZW5ndGhzPFQ+KEZwOiBJRmllbGQ8VD4sIEZuOiBJRmllbGQ8YmlnaW50Pikge1xuICByZXR1cm4ge1xuICAgIHNlY3JldEtleTogRm4uQllURVMsXG4gICAgcHVibGljS2V5OiAxICsgRnAuQllURVMsXG4gICAgcHVibGljS2V5VW5jb21wcmVzc2VkOiAxICsgMiAqIEZwLkJZVEVTLFxuICAgIHB1YmxpY0tleUhhc1ByZWZpeDogdHJ1ZSxcbiAgICBzaWduYXR1cmU6IDIgKiBGbi5CWVRFUyxcbiAgfTtcbn1cblxuLyoqXG4gKiBTb21ldGltZXMgdXNlcnMgb25seSBuZWVkIGdldFB1YmxpY0tleSwgZ2V0U2hhcmVkU2VjcmV0LCBhbmQgc2VjcmV0IGtleSBoYW5kbGluZy5cbiAqIFRoaXMgaGVscGVyIGVuc3VyZXMgbm8gc2lnbmF0dXJlIGZ1bmN0aW9uYWxpdHkgaXMgcHJlc2VudC4gTGVzcyBjb2RlLCBzbWFsbGVyIGJ1bmRsZSBzaXplLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZWNkaChcbiAgUG9pbnQ6IFdlaWVyc3RyYXNzUG9pbnRDb25zPGJpZ2ludD4sXG4gIGVjZGhPcHRzOiB7IHJhbmRvbUJ5dGVzPzogKGJ5dGVzTGVuZ3RoPzogbnVtYmVyKSA9PiBVaW50OEFycmF5IH0gPSB7fVxuKTogRUNESCB7XG4gIGNvbnN0IHsgRm4gfSA9IFBvaW50O1xuICBjb25zdCByYW5kb21CeXRlc18gPSBlY2RoT3B0cy5yYW5kb21CeXRlcyB8fCB3Y1JhbmRvbUJ5dGVzO1xuICBjb25zdCBsZW5ndGhzID0gT2JqZWN0LmFzc2lnbihnZXRXTGVuZ3RocyhQb2ludC5GcCwgRm4pLCB7IHNlZWQ6IGdldE1pbkhhc2hMZW5ndGgoRm4uT1JERVIpIH0pO1xuXG4gIGZ1bmN0aW9uIGlzVmFsaWRTZWNyZXRLZXkoc2VjcmV0S2V5OiBVaW50OEFycmF5KSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG51bSA9IEZuLmZyb21CeXRlcyhzZWNyZXRLZXkpO1xuICAgICAgcmV0dXJuIEZuLmlzVmFsaWROb3QwKG51bSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpc1ZhbGlkUHVibGljS2V5KHB1YmxpY0tleTogVWludDhBcnJheSwgaXNDb21wcmVzc2VkPzogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgcHVibGljS2V5OiBjb21wLCBwdWJsaWNLZXlVbmNvbXByZXNzZWQgfSA9IGxlbmd0aHM7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGwgPSBwdWJsaWNLZXkubGVuZ3RoO1xuICAgICAgaWYgKGlzQ29tcHJlc3NlZCA9PT0gdHJ1ZSAmJiBsICE9PSBjb21wKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoaXNDb21wcmVzc2VkID09PSBmYWxzZSAmJiBsICE9PSBwdWJsaWNLZXlVbmNvbXByZXNzZWQpIHJldHVybiBmYWxzZTtcbiAgICAgIHJldHVybiAhIVBvaW50LmZyb21CeXRlcyhwdWJsaWNLZXkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFByb2R1Y2VzIGNyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSBzZWNyZXQga2V5IGZyb20gcmFuZG9tIG9mIHNpemVcbiAgICogKGdyb3VwTGVuICsgY2VpbChncm91cExlbiAvIDIpKSB3aXRoIG1vZHVsbyBiaWFzIGJlaW5nIG5lZ2xpZ2libGUuXG4gICAqL1xuICBmdW5jdGlvbiByYW5kb21TZWNyZXRLZXkoc2VlZCA9IHJhbmRvbUJ5dGVzXyhsZW5ndGhzLnNlZWQpKTogVWludDhBcnJheSB7XG4gICAgcmV0dXJuIG1hcEhhc2hUb0ZpZWxkKGFieXRlcyhzZWVkLCBsZW5ndGhzLnNlZWQsICdzZWVkJyksIEZuLk9SREVSKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyBwdWJsaWMga2V5IGZvciBhIHNlY3JldCBrZXkuIENoZWNrcyBmb3IgdmFsaWRpdHkgb2YgdGhlIHNlY3JldCBrZXkuXG4gICAqIEBwYXJhbSBpc0NvbXByZXNzZWQgd2hldGhlciB0byByZXR1cm4gY29tcGFjdCAoZGVmYXVsdCksIG9yIGZ1bGwga2V5XG4gICAqIEByZXR1cm5zIFB1YmxpYyBrZXksIGZ1bGwgd2hlbiBpc0NvbXByZXNzZWQ9ZmFsc2U7IHNob3J0IHdoZW4gaXNDb21wcmVzc2VkPXRydWVcbiAgICovXG4gIGZ1bmN0aW9uIGdldFB1YmxpY0tleShzZWNyZXRLZXk6IFVpbnQ4QXJyYXksIGlzQ29tcHJlc3NlZCA9IHRydWUpOiBVaW50OEFycmF5IHtcbiAgICByZXR1cm4gUG9pbnQuQkFTRS5tdWx0aXBseShGbi5mcm9tQnl0ZXMoc2VjcmV0S2V5KSkudG9CeXRlcyhpc0NvbXByZXNzZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFF1aWNrIGFuZCBkaXJ0eSBjaGVjayBmb3IgaXRlbSBiZWluZyBwdWJsaWMga2V5LiBEb2VzIG5vdCB2YWxpZGF0ZSBoZXgsIG9yIGJlaW5nIG9uLWN1cnZlLlxuICAgKi9cbiAgZnVuY3Rpb24gaXNQcm9iUHViKGl0ZW06IFVpbnQ4QXJyYXkpOiBib29sZWFuIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCB7IHNlY3JldEtleSwgcHVibGljS2V5LCBwdWJsaWNLZXlVbmNvbXByZXNzZWQgfSA9IGxlbmd0aHM7XG4gICAgaWYgKCFpc0J5dGVzKGl0ZW0pKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgIGlmICgoJ19sZW5ndGhzJyBpbiBGbiAmJiBGbi5fbGVuZ3RocykgfHwgc2VjcmV0S2V5ID09PSBwdWJsaWNLZXkpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgY29uc3QgbCA9IGFieXRlcyhpdGVtLCB1bmRlZmluZWQsICdrZXknKS5sZW5ndGg7XG4gICAgcmV0dXJuIGwgPT09IHB1YmxpY0tleSB8fCBsID09PSBwdWJsaWNLZXlVbmNvbXByZXNzZWQ7XG4gIH1cblxuICAvKipcbiAgICogRUNESCAoRWxsaXB0aWMgQ3VydmUgRGlmZmllIEhlbGxtYW4pLlxuICAgKiBDb21wdXRlcyBzaGFyZWQgcHVibGljIGtleSBmcm9tIHNlY3JldCBrZXkgQSBhbmQgcHVibGljIGtleSBCLlxuICAgKiBDaGVja3M6IDEpIHNlY3JldCBrZXkgdmFsaWRpdHkgMikgc2hhcmVkIGtleSBpcyBvbi1jdXJ2ZS5cbiAgICogRG9lcyBOT1QgaGFzaCB0aGUgcmVzdWx0LlxuICAgKiBAcGFyYW0gaXNDb21wcmVzc2VkIHdoZXRoZXIgdG8gcmV0dXJuIGNvbXBhY3QgKGRlZmF1bHQpLCBvciBmdWxsIGtleVxuICAgKiBAcmV0dXJucyBzaGFyZWQgcHVibGljIGtleVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0U2hhcmVkU2VjcmV0KFxuICAgIHNlY3JldEtleUE6IFVpbnQ4QXJyYXksXG4gICAgcHVibGljS2V5QjogVWludDhBcnJheSxcbiAgICBpc0NvbXByZXNzZWQgPSB0cnVlXG4gICk6IFVpbnQ4QXJyYXkge1xuICAgIGlmIChpc1Byb2JQdWIoc2VjcmV0S2V5QSkgPT09IHRydWUpIHRocm93IG5ldyBFcnJvcignZmlyc3QgYXJnIG11c3QgYmUgcHJpdmF0ZSBrZXknKTtcbiAgICBpZiAoaXNQcm9iUHViKHB1YmxpY0tleUIpID09PSBmYWxzZSkgdGhyb3cgbmV3IEVycm9yKCdzZWNvbmQgYXJnIG11c3QgYmUgcHVibGljIGtleScpO1xuICAgIGNvbnN0IHMgPSBGbi5mcm9tQnl0ZXMoc2VjcmV0S2V5QSk7XG4gICAgY29uc3QgYiA9IFBvaW50LmZyb21CeXRlcyhwdWJsaWNLZXlCKTsgLy8gY2hlY2tzIGZvciBiZWluZyBvbi1jdXJ2ZVxuICAgIHJldHVybiBiLm11bHRpcGx5KHMpLnRvQnl0ZXMoaXNDb21wcmVzc2VkKTtcbiAgfVxuXG4gIGNvbnN0IHV0aWxzID0ge1xuICAgIGlzVmFsaWRTZWNyZXRLZXksXG4gICAgaXNWYWxpZFB1YmxpY0tleSxcbiAgICByYW5kb21TZWNyZXRLZXksXG4gIH07XG4gIGNvbnN0IGtleWdlbiA9IGNyZWF0ZUtleWdlbihyYW5kb21TZWNyZXRLZXksIGdldFB1YmxpY0tleSk7XG5cbiAgcmV0dXJuIE9iamVjdC5mcmVlemUoeyBnZXRQdWJsaWNLZXksIGdldFNoYXJlZFNlY3JldCwga2V5Z2VuLCBQb2ludCwgdXRpbHMsIGxlbmd0aHMgfSk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBFQ0RTQSBzaWduaW5nIGludGVyZmFjZSBmb3IgZ2l2ZW4gZWxsaXB0aWMgY3VydmUgYFBvaW50YCBhbmQgYGhhc2hgIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSBQb2ludCBjcmVhdGVkIHVzaW5nIHtAbGluayB3ZWllcnN0cmFzc30gZnVuY3Rpb25cbiAqIEBwYXJhbSBoYXNoIHVzZWQgZm9yIDEpIG1lc3NhZ2UgcHJlaGFzaC1pbmcgMikgayBnZW5lcmF0aW9uIGluIGBzaWduYCwgdXNpbmcgaG1hY19kcmJnKGhhc2gpXG4gKiBAcGFyYW0gZWNkc2FPcHRzIHJhcmVseSBuZWVkZWQsIHNlZSB7QGxpbmsgRUNEU0FPcHRzfVxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGBqc1xuICogY29uc3QgcDI1Nl9Qb2ludCA9IHdlaWVyc3RyYXNzKC4uLik7XG4gKiBjb25zdCBwMjU2X3NoYTI1NiA9IGVjZHNhKHAyNTZfUG9pbnQsIHNoYTI1Nik7XG4gKiBjb25zdCBwMjU2X3NoYTIyNCA9IGVjZHNhKHAyNTZfUG9pbnQsIHNoYTIyNCk7XG4gKiBjb25zdCBwMjU2X3NoYTIyNF9yID0gZWNkc2EocDI1Nl9Qb2ludCwgc2hhMjI0LCB7IHJhbmRvbUJ5dGVzOiAobGVuZ3RoKSA9PiB7IC4uLiB9IH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlY2RzYShcbiAgUG9pbnQ6IFdlaWVyc3RyYXNzUG9pbnRDb25zPGJpZ2ludD4sXG4gIGhhc2g6IENIYXNoLFxuICBlY2RzYU9wdHM6IEVDRFNBT3B0cyA9IHt9XG4pOiBFQ0RTQSB7XG4gIGFoYXNoKGhhc2gpO1xuICB2YWxpZGF0ZU9iamVjdChcbiAgICBlY2RzYU9wdHMsXG4gICAge30sXG4gICAge1xuICAgICAgaG1hYzogJ2Z1bmN0aW9uJyxcbiAgICAgIGxvd1M6ICdib29sZWFuJyxcbiAgICAgIHJhbmRvbUJ5dGVzOiAnZnVuY3Rpb24nLFxuICAgICAgYml0czJpbnQ6ICdmdW5jdGlvbicsXG4gICAgICBiaXRzMmludF9tb2ROOiAnZnVuY3Rpb24nLFxuICAgIH1cbiAgKTtcbiAgZWNkc2FPcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgZWNkc2FPcHRzKTtcbiAgY29uc3QgcmFuZG9tQnl0ZXMgPSBlY2RzYU9wdHMucmFuZG9tQnl0ZXMgfHwgd2NSYW5kb21CeXRlcztcbiAgY29uc3QgaG1hYyA9IGVjZHNhT3B0cy5obWFjIHx8ICgoa2V5LCBtc2cpID0+IG5vYmxlSG1hYyhoYXNoLCBrZXksIG1zZykpO1xuXG4gIGNvbnN0IHsgRnAsIEZuIH0gPSBQb2ludDtcbiAgY29uc3QgeyBPUkRFUjogQ1VSVkVfT1JERVIsIEJJVFM6IGZuQml0cyB9ID0gRm47XG4gIGNvbnN0IHsga2V5Z2VuLCBnZXRQdWJsaWNLZXksIGdldFNoYXJlZFNlY3JldCwgdXRpbHMsIGxlbmd0aHMgfSA9IGVjZGgoUG9pbnQsIGVjZHNhT3B0cyk7XG4gIGNvbnN0IGRlZmF1bHRTaWdPcHRzOiBSZXF1aXJlZDxFQ0RTQVNpZ25PcHRzPiA9IHtcbiAgICBwcmVoYXNoOiB0cnVlLFxuICAgIGxvd1M6IHR5cGVvZiBlY2RzYU9wdHMubG93UyA9PT0gJ2Jvb2xlYW4nID8gZWNkc2FPcHRzLmxvd1MgOiB0cnVlLFxuICAgIGZvcm1hdDogJ2NvbXBhY3QnIGFzIEVDRFNBU2lnbmF0dXJlRm9ybWF0LFxuICAgIGV4dHJhRW50cm9weTogZmFsc2UsXG4gIH07XG4gIGNvbnN0IGhhc0xhcmdlQ29mYWN0b3IgPSBDVVJWRV9PUkRFUiAqIF8ybiA8IEZwLk9SREVSOyAvLyBXb24ndCBDVVJWRSgpLmggPiAybiBiZSBtb3JlIGVmZmVjdGl2ZT9cblxuICBmdW5jdGlvbiBpc0JpZ2dlclRoYW5IYWxmT3JkZXIobnVtYmVyOiBiaWdpbnQpIHtcbiAgICBjb25zdCBIQUxGID0gQ1VSVkVfT1JERVIgPj4gXzFuO1xuICAgIHJldHVybiBudW1iZXIgPiBIQUxGO1xuICB9XG4gIGZ1bmN0aW9uIHZhbGlkYXRlUlModGl0bGU6IHN0cmluZywgbnVtOiBiaWdpbnQpOiBiaWdpbnQge1xuICAgIGlmICghRm4uaXNWYWxpZE5vdDAobnVtKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBzaWduYXR1cmUgJHt0aXRsZX06IG91dCBvZiByYW5nZSAxLi5Qb2ludC5Gbi5PUkRFUmApO1xuICAgIHJldHVybiBudW07XG4gIH1cbiAgZnVuY3Rpb24gYXNzZXJ0U21hbGxDb2ZhY3RvcigpOiB2b2lkIHtcbiAgICAvLyBFQ0RTQSByZWNvdmVyeSBpcyBoYXJkIGZvciBjb2ZhY3RvciA+IDEgY3VydmVzLlxuICAgIC8vIEluIHNpZ24sIGByID0gcS54IG1vZCBuYCwgYW5kIGhlcmUgd2UgcmVjb3ZlciBxLnggZnJvbSByLlxuICAgIC8vIFdoaWxlIHJlY292ZXJpbmcgcS54ID49IG4sIHdlIG5lZWQgdG8gYWRkIHIrbiBmb3IgY29mYWN0b3I9MSBjdXJ2ZXMuXG4gICAgLy8gSG93ZXZlciwgZm9yIGNvZmFjdG9yPjEsIHIrbiBtYXkgbm90IGdldCBxLng6XG4gICAgLy8gcituKmkgd291bGQgbmVlZCB0byBiZSBkb25lIGluc3RlYWQgd2hlcmUgaSBpcyB1bmtub3duLlxuICAgIC8vIFRvIGVhc2lseSBnZXQgaSwgd2UgZWl0aGVyIG5lZWQgdG86XG4gICAgLy8gYS4gaW5jcmVhc2UgYW1vdW50IG9mIHZhbGlkIHJlY2lkIHZhbHVlcyAoNCwgNS4uLik7IE9SXG4gICAgLy8gYi4gcHJvaGliaXQgbm9uLXByaW1lLW9yZGVyIHNpZ25hdHVyZXMgKHJlY2lkID4gMSkuXG4gICAgaWYgKGhhc0xhcmdlQ29mYWN0b3IpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wicmVjb3ZlcmVkXCIgc2lnIHR5cGUgaXMgbm90IHN1cHBvcnRlZCBmb3IgY29mYWN0b3IgPjIgY3VydmVzJyk7XG4gIH1cbiAgZnVuY3Rpb24gdmFsaWRhdGVTaWdMZW5ndGgoYnl0ZXM6IFVpbnQ4QXJyYXksIGZvcm1hdDogRUNEU0FTaWduYXR1cmVGb3JtYXQpIHtcbiAgICB2YWxpZGF0ZVNpZ0Zvcm1hdChmb3JtYXQpO1xuICAgIGNvbnN0IHNpemUgPSBsZW5ndGhzLnNpZ25hdHVyZSE7XG4gICAgY29uc3Qgc2l6ZXIgPSBmb3JtYXQgPT09ICdjb21wYWN0JyA/IHNpemUgOiBmb3JtYXQgPT09ICdyZWNvdmVyZWQnID8gc2l6ZSArIDEgOiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIGFieXRlcyhieXRlcywgc2l6ZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVDRFNBIHNpZ25hdHVyZSB3aXRoIGl0cyAociwgcykgcHJvcGVydGllcy4gU3VwcG9ydHMgY29tcGFjdCwgcmVjb3ZlcmVkICYgREVSIHJlcHJlc2VudGF0aW9ucy5cbiAgICovXG4gIGNsYXNzIFNpZ25hdHVyZSBpbXBsZW1lbnRzIEVDRFNBU2lnbmF0dXJlIHtcbiAgICByZWFkb25seSByOiBiaWdpbnQ7XG4gICAgcmVhZG9ubHkgczogYmlnaW50O1xuICAgIHJlYWRvbmx5IHJlY292ZXJ5PzogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IocjogYmlnaW50LCBzOiBiaWdpbnQsIHJlY292ZXJ5PzogbnVtYmVyKSB7XG4gICAgICB0aGlzLnIgPSB2YWxpZGF0ZVJTKCdyJywgcik7IC8vIHIgaW4gWzEuLk4tMV07XG4gICAgICB0aGlzLnMgPSB2YWxpZGF0ZVJTKCdzJywgcyk7IC8vIHMgaW4gWzEuLk4tMV07XG4gICAgICBpZiAocmVjb3ZlcnkgIT0gbnVsbCkge1xuICAgICAgICBhc3NlcnRTbWFsbENvZmFjdG9yKCk7XG4gICAgICAgIGlmICghWzAsIDEsIDIsIDNdLmluY2x1ZGVzKHJlY292ZXJ5KSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHJlY292ZXJ5IGlkJyk7XG4gICAgICAgIHRoaXMucmVjb3ZlcnkgPSByZWNvdmVyeTtcbiAgICAgIH1cbiAgICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGZyb21CeXRlcyhcbiAgICAgIGJ5dGVzOiBVaW50OEFycmF5LFxuICAgICAgZm9ybWF0OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCA9IGRlZmF1bHRTaWdPcHRzLmZvcm1hdFxuICAgICk6IFNpZ25hdHVyZSB7XG4gICAgICB2YWxpZGF0ZVNpZ0xlbmd0aChieXRlcywgZm9ybWF0KTtcbiAgICAgIGxldCByZWNpZDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgICAgaWYgKGZvcm1hdCA9PT0gJ2RlcicpIHtcbiAgICAgICAgY29uc3QgeyByLCBzIH0gPSBERVIudG9TaWcoYWJ5dGVzKGJ5dGVzKSk7XG4gICAgICAgIHJldHVybiBuZXcgU2lnbmF0dXJlKHIsIHMpO1xuICAgICAgfVxuICAgICAgaWYgKGZvcm1hdCA9PT0gJ3JlY292ZXJlZCcpIHtcbiAgICAgICAgcmVjaWQgPSBieXRlc1swXTtcbiAgICAgICAgZm9ybWF0ID0gJ2NvbXBhY3QnO1xuICAgICAgICBieXRlcyA9IGJ5dGVzLnN1YmFycmF5KDEpO1xuICAgICAgfVxuICAgICAgY29uc3QgTCA9IGxlbmd0aHMuc2lnbmF0dXJlISAvIDI7XG4gICAgICBjb25zdCByID0gYnl0ZXMuc3ViYXJyYXkoMCwgTCk7XG4gICAgICBjb25zdCBzID0gYnl0ZXMuc3ViYXJyYXkoTCwgTCAqIDIpO1xuICAgICAgcmV0dXJuIG5ldyBTaWduYXR1cmUoRm4uZnJvbUJ5dGVzKHIpLCBGbi5mcm9tQnl0ZXMocyksIHJlY2lkKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZnJvbUhleChoZXg6IHN0cmluZywgZm9ybWF0PzogRUNEU0FTaWduYXR1cmVGb3JtYXQpIHtcbiAgICAgIHJldHVybiB0aGlzLmZyb21CeXRlcyhoZXhUb0J5dGVzKGhleCksIGZvcm1hdCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3NlcnRSZWNvdmVyeSgpOiBudW1iZXIge1xuICAgICAgY29uc3QgeyByZWNvdmVyeSB9ID0gdGhpcztcbiAgICAgIGlmIChyZWNvdmVyeSA9PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcmVjb3ZlcnkgaWQ6IG11c3QgYmUgcHJlc2VudCcpO1xuICAgICAgcmV0dXJuIHJlY292ZXJ5O1xuICAgIH1cblxuICAgIGFkZFJlY292ZXJ5Qml0KHJlY292ZXJ5OiBudW1iZXIpOiBSZWNvdmVyZWRTaWduYXR1cmUge1xuICAgICAgcmV0dXJuIG5ldyBTaWduYXR1cmUodGhpcy5yLCB0aGlzLnMsIHJlY292ZXJ5KSBhcyBSZWNvdmVyZWRTaWduYXR1cmU7XG4gICAgfVxuXG4gICAgcmVjb3ZlclB1YmxpY0tleShtZXNzYWdlSGFzaDogVWludDhBcnJheSk6IFdlaWVyc3RyYXNzUG9pbnQ8YmlnaW50PiB7XG4gICAgICBjb25zdCB7IHIsIHMgfSA9IHRoaXM7XG4gICAgICBjb25zdCByZWNvdmVyeSA9IHRoaXMuYXNzZXJ0UmVjb3ZlcnkoKTtcbiAgICAgIGNvbnN0IHJhZGogPSByZWNvdmVyeSA9PT0gMiB8fCByZWNvdmVyeSA9PT0gMyA/IHIgKyBDVVJWRV9PUkRFUiA6IHI7XG4gICAgICBpZiAoIUZwLmlzVmFsaWQocmFkaikpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCByZWNvdmVyeSBpZDogc2lnLnIrY3VydmUubiAhPSBSLngnKTtcbiAgICAgIGNvbnN0IHggPSBGcC50b0J5dGVzKHJhZGopO1xuICAgICAgY29uc3QgUiA9IFBvaW50LmZyb21CeXRlcyhjb25jYXRCeXRlcyhwcHJlZml4KChyZWNvdmVyeSAmIDEpID09PSAwKSwgeCkpO1xuICAgICAgY29uc3QgaXIgPSBGbi5pbnYocmFkaik7IC8vIHJeLTFcbiAgICAgIGNvbnN0IGggPSBiaXRzMmludF9tb2ROKGFieXRlcyhtZXNzYWdlSGFzaCwgdW5kZWZpbmVkLCAnbXNnSGFzaCcpKTsgLy8gVHJ1bmNhdGUgaGFzaFxuICAgICAgY29uc3QgdTEgPSBGbi5jcmVhdGUoLWggKiBpcik7IC8vIC1ocl4tMVxuICAgICAgY29uc3QgdTIgPSBGbi5jcmVhdGUocyAqIGlyKTsgLy8gc3JeLTFcbiAgICAgIC8vIChzcl4tMSlSLShocl4tMSlHID0gLShocl4tMSlHICsgKHNyXi0xKS4gdW5zYWZlIGlzIGZpbmU6IHRoZXJlIGlzIG5vIHByaXZhdGUgZGF0YS5cbiAgICAgIGNvbnN0IFEgPSBQb2ludC5CQVNFLm11bHRpcGx5VW5zYWZlKHUxKS5hZGQoUi5tdWx0aXBseVVuc2FmZSh1MikpO1xuICAgICAgaWYgKFEuaXMwKCkpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCByZWNvdmVyeTogcG9pbnQgYXQgaW5maW5pZnknKTtcbiAgICAgIFEuYXNzZXJ0VmFsaWRpdHkoKTtcbiAgICAgIHJldHVybiBRO1xuICAgIH1cblxuICAgIC8vIFNpZ25hdHVyZXMgc2hvdWxkIGJlIGxvdy1zLCB0byBwcmV2ZW50IG1hbGxlYWJpbGl0eS5cbiAgICBoYXNIaWdoUygpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiBpc0JpZ2dlclRoYW5IYWxmT3JkZXIodGhpcy5zKTtcbiAgICB9XG5cbiAgICB0b0J5dGVzKGZvcm1hdDogRUNEU0FTaWduYXR1cmVGb3JtYXQgPSBkZWZhdWx0U2lnT3B0cy5mb3JtYXQpIHtcbiAgICAgIHZhbGlkYXRlU2lnRm9ybWF0KGZvcm1hdCk7XG4gICAgICBpZiAoZm9ybWF0ID09PSAnZGVyJykgcmV0dXJuIGhleFRvQnl0ZXMoREVSLmhleEZyb21TaWcodGhpcykpO1xuICAgICAgY29uc3QgeyByLCBzIH0gPSB0aGlzO1xuICAgICAgY29uc3QgcmIgPSBGbi50b0J5dGVzKHIpO1xuICAgICAgY29uc3Qgc2IgPSBGbi50b0J5dGVzKHMpO1xuICAgICAgaWYgKGZvcm1hdCA9PT0gJ3JlY292ZXJlZCcpIHtcbiAgICAgICAgYXNzZXJ0U21hbGxDb2ZhY3RvcigpO1xuICAgICAgICByZXR1cm4gY29uY2F0Qnl0ZXMoVWludDhBcnJheS5vZih0aGlzLmFzc2VydFJlY292ZXJ5KCkpLCByYiwgc2IpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbmNhdEJ5dGVzKHJiLCBzYik7XG4gICAgfVxuXG4gICAgdG9IZXgoZm9ybWF0PzogRUNEU0FTaWduYXR1cmVGb3JtYXQpIHtcbiAgICAgIHJldHVybiBieXRlc1RvSGV4KHRoaXMudG9CeXRlcyhmb3JtYXQpKTtcbiAgICB9XG4gIH1cbiAgdHlwZSBSZWNvdmVyZWRTaWduYXR1cmUgPSBTaWduYXR1cmUgJiB7IHJlY292ZXJ5OiBudW1iZXIgfTtcblxuICAvLyBSRkM2OTc5OiBlbnN1cmUgRUNEU0EgbXNnIGlzIFggYnl0ZXMgYW5kIDwgTi4gUkZDIHN1Z2dlc3RzIG9wdGlvbmFsIHRydW5jYXRpbmcgdmlhIGJpdHMyb2N0ZXRzLlxuICAvLyBGSVBTIDE4Ni00IDQuNiBzdWdnZXN0cyB0aGUgbGVmdG1vc3QgbWluKG5CaXRMZW4sIG91dExlbikgYml0cywgd2hpY2ggbWF0Y2hlcyBiaXRzMmludC5cbiAgLy8gYml0czJpbnQgY2FuIHByb2R1Y2UgcmVzPk4sIHdlIGNhbiBkbyBtb2QocmVzLCBOKSBzaW5jZSB0aGUgYml0TGVuIGlzIHRoZSBzYW1lLlxuICAvLyBpbnQyb2N0ZXRzIGNhbid0IGJlIHVzZWQ7IHBhZHMgc21hbGwgbXNncyB3aXRoIDA6IHVuYWNjZXB0YXRibGUgZm9yIHRydW5jIGFzIHBlciBSRkMgdmVjdG9yc1xuICBjb25zdCBiaXRzMmludCA9XG4gICAgZWNkc2FPcHRzLmJpdHMyaW50IHx8XG4gICAgZnVuY3Rpb24gYml0czJpbnRfZGVmKGJ5dGVzOiBVaW50OEFycmF5KTogYmlnaW50IHtcbiAgICAgIC8vIE91ciBjdXN0b20gY2hlY2sgXCJqdXN0IGluIGNhc2VcIiwgZm9yIHByb3RlY3Rpb24gYWdhaW5zdCBEb1NcbiAgICAgIGlmIChieXRlcy5sZW5ndGggPiA4MTkyKSB0aHJvdyBuZXcgRXJyb3IoJ2lucHV0IGlzIHRvbyBsYXJnZScpO1xuICAgICAgLy8gRm9yIGN1cnZlcyB3aXRoIG5CaXRMZW5ndGggJSA4ICE9PSAwOiBiaXRzMm9jdGV0cyhiaXRzMm9jdGV0cyhtKSkgIT09IGJpdHMyb2N0ZXRzKG0pXG4gICAgICAvLyBmb3Igc29tZSBjYXNlcywgc2luY2UgYnl0ZXMubGVuZ3RoICogOCBpcyBub3QgYWN0dWFsIGJpdExlbmd0aC5cbiAgICAgIGNvbnN0IG51bSA9IGJ5dGVzVG9OdW1iZXJCRShieXRlcyk7IC8vIGNoZWNrIGZvciA9PSB1OCBkb25lIGhlcmVcbiAgICAgIGNvbnN0IGRlbHRhID0gYnl0ZXMubGVuZ3RoICogOCAtIGZuQml0czsgLy8gdHJ1bmNhdGUgdG8gbkJpdExlbmd0aCBsZWZ0bW9zdCBiaXRzXG4gICAgICByZXR1cm4gZGVsdGEgPiAwID8gbnVtID4+IEJpZ0ludChkZWx0YSkgOiBudW07XG4gICAgfTtcbiAgY29uc3QgYml0czJpbnRfbW9kTiA9XG4gICAgZWNkc2FPcHRzLmJpdHMyaW50X21vZE4gfHxcbiAgICBmdW5jdGlvbiBiaXRzMmludF9tb2ROX2RlZihieXRlczogVWludDhBcnJheSk6IGJpZ2ludCB7XG4gICAgICByZXR1cm4gRm4uY3JlYXRlKGJpdHMyaW50KGJ5dGVzKSk7IC8vIGNhbid0IHVzZSBieXRlc1RvTnVtYmVyQkUgaGVyZVxuICAgIH07XG4gIC8vIFBhZHMgb3V0cHV0IHdpdGggemVybyBhcyBwZXIgc3BlY1xuICBjb25zdCBPUkRFUl9NQVNLID0gYml0TWFzayhmbkJpdHMpO1xuICAvKiogQ29udmVydHMgdG8gYnl0ZXMuIENoZWNrcyBpZiBudW0gaW4gYFswLi5PUkRFUl9NQVNLLTFdYCBlLmcuOiBgWzAuLjJeMjU2LTFdYC4gKi9cbiAgZnVuY3Rpb24gaW50Mm9jdGV0cyhudW06IGJpZ2ludCk6IFVpbnQ4QXJyYXkge1xuICAgIC8vIElNUE9SVEFOVDogdGhlIGNoZWNrIGVuc3VyZXMgd29ya2luZyBmb3IgY2FzZSBgRm4uQllURVMgIT0gRm4uQklUUyAqIDhgXG4gICAgYUluUmFuZ2UoJ251bSA8IDJeJyArIGZuQml0cywgbnVtLCBfMG4sIE9SREVSX01BU0spO1xuICAgIHJldHVybiBGbi50b0J5dGVzKG51bSk7XG4gIH1cblxuICBmdW5jdGlvbiB2YWxpZGF0ZU1zZ0FuZEhhc2gobWVzc2FnZTogVWludDhBcnJheSwgcHJlaGFzaDogYm9vbGVhbikge1xuICAgIGFieXRlcyhtZXNzYWdlLCB1bmRlZmluZWQsICdtZXNzYWdlJyk7XG4gICAgcmV0dXJuIHByZWhhc2ggPyBhYnl0ZXMoaGFzaChtZXNzYWdlKSwgdW5kZWZpbmVkLCAncHJlaGFzaGVkIG1lc3NhZ2UnKSA6IG1lc3NhZ2U7XG4gIH1cblxuICAvKipcbiAgICogU3RlcHMgQSwgRCBvZiBSRkM2OTc5IDMuMi5cbiAgICogQ3JlYXRlcyBSRkM2OTc5IHNlZWQ7IGNvbnZlcnRzIG1zZy9wcml2S2V5IHRvIG51bWJlcnMuXG4gICAqIFVzZWQgb25seSBpbiBzaWduLCBub3QgaW4gdmVyaWZ5LlxuICAgKlxuICAgKiBXYXJuaW5nOiB3ZSBjYW5ub3QgYXNzdW1lIGhlcmUgdGhhdCBtZXNzYWdlIGhhcyBzYW1lIGFtb3VudCBvZiBieXRlcyBhcyBjdXJ2ZSBvcmRlcixcbiAgICogdGhpcyB3aWxsIGJlIGludmFsaWQgYXQgbGVhc3QgZm9yIFA1MjEuIEFsc28gaXQgY2FuIGJlIGJpZ2dlciBmb3IgUDIyNCArIFNIQTI1Ni5cbiAgICovXG4gIGZ1bmN0aW9uIHByZXBTaWcobWVzc2FnZTogVWludDhBcnJheSwgc2VjcmV0S2V5OiBVaW50OEFycmF5LCBvcHRzOiBFQ0RTQVNpZ25PcHRzKSB7XG4gICAgY29uc3QgeyBsb3dTLCBwcmVoYXNoLCBleHRyYUVudHJvcHkgfSA9IHZhbGlkYXRlU2lnT3B0cyhvcHRzLCBkZWZhdWx0U2lnT3B0cyk7XG4gICAgbWVzc2FnZSA9IHZhbGlkYXRlTXNnQW5kSGFzaChtZXNzYWdlLCBwcmVoYXNoKTsgLy8gUkZDNjk3OSAzLjIgQTogaDEgPSBIKG0pXG4gICAgLy8gV2UgY2FuJ3QgbGF0ZXIgY2FsbCBiaXRzMm9jdGV0cywgc2luY2UgbmVzdGVkIGJpdHMyaW50IGlzIGJyb2tlbiBmb3IgY3VydmVzXG4gICAgLy8gd2l0aCBmbkJpdHMgJSA4ICE9PSAwLiBCZWNhdXNlIG9mIHRoYXQsIHdlIHVud3JhcCBpdCBoZXJlIGFzIGludDJvY3RldHMgY2FsbC5cbiAgICAvLyBjb25zdCBiaXRzMm9jdGV0cyA9IChiaXRzKSA9PiBpbnQyb2N0ZXRzKGJpdHMyaW50X21vZE4oYml0cykpXG4gICAgY29uc3QgaDFpbnQgPSBiaXRzMmludF9tb2ROKG1lc3NhZ2UpO1xuICAgIGNvbnN0IGQgPSBGbi5mcm9tQnl0ZXMoc2VjcmV0S2V5KTsgLy8gdmFsaWRhdGUgc2VjcmV0IGtleSwgY29udmVydCB0byBiaWdpbnRcbiAgICBpZiAoIUZuLmlzVmFsaWROb3QwKGQpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcHJpdmF0ZSBrZXknKTtcbiAgICBjb25zdCBzZWVkQXJncyA9IFtpbnQyb2N0ZXRzKGQpLCBpbnQyb2N0ZXRzKGgxaW50KV07XG4gICAgLy8gZXh0cmFFbnRyb3B5LiBSRkM2OTc5IDMuNjogYWRkaXRpb25hbCBrJyAob3B0aW9uYWwpLlxuICAgIGlmIChleHRyYUVudHJvcHkgIT0gbnVsbCAmJiBleHRyYUVudHJvcHkgIT09IGZhbHNlKSB7XG4gICAgICAvLyBLID0gSE1BQ19LKFYgfHwgMHgwMCB8fCBpbnQyb2N0ZXRzKHgpIHx8IGJpdHMyb2N0ZXRzKGgxKSB8fCBrJylcbiAgICAgIC8vIGdlbiByYW5kb20gYnl0ZXMgT1IgcGFzcyBhcy1pc1xuICAgICAgY29uc3QgZSA9IGV4dHJhRW50cm9weSA9PT0gdHJ1ZSA/IHJhbmRvbUJ5dGVzKGxlbmd0aHMuc2VjcmV0S2V5KSA6IGV4dHJhRW50cm9weTtcbiAgICAgIHNlZWRBcmdzLnB1c2goYWJ5dGVzKGUsIHVuZGVmaW5lZCwgJ2V4dHJhRW50cm9weScpKTsgLy8gY2hlY2sgZm9yIGJlaW5nIGJ5dGVzXG4gICAgfVxuICAgIGNvbnN0IHNlZWQgPSBjb25jYXRCeXRlcyguLi5zZWVkQXJncyk7IC8vIFN0ZXAgRCBvZiBSRkM2OTc5IDMuMlxuICAgIGNvbnN0IG0gPSBoMWludDsgLy8gbm8gbmVlZCB0byBjYWxsIGJpdHMyaW50IHNlY29uZCB0aW1lIGhlcmUsIGl0IGlzIGluc2lkZSB0cnVuY2F0ZUhhc2ghXG4gICAgLy8gQ29udmVydHMgc2lnbmF0dXJlIHBhcmFtcyBpbnRvIHBvaW50IHcgci9zLCBjaGVja3MgcmVzdWx0IGZvciB2YWxpZGl0eS5cbiAgICAvLyBUbyB0cmFuc2Zvcm0gayA9PiBTaWduYXR1cmU6XG4gICAgLy8gcSA9IGtcdTIyQzVHXG4gICAgLy8gciA9IHEueCBtb2QgblxuICAgIC8vIHMgPSBrXi0xKG0gKyByZCkgbW9kIG5cbiAgICAvLyBDYW4gdXNlIHNjYWxhciBibGluZGluZyBiXi0xKGJtICsgYmRyKSB3aGVyZSBiIFx1MjIwOCBbMSxxXHUyMjEyMV0gYWNjb3JkaW5nIHRvXG4gICAgLy8gaHR0cHM6Ly90Y2hlcy5pYWNyLm9yZy9pbmRleC5waHAvVENIRVMvYXJ0aWNsZS92aWV3LzczMzcvNjUwOS4gV2UndmUgZGVjaWRlZCBhZ2FpbnN0IGl0OlxuICAgIC8vIGEpIGRlcGVuZGVuY3kgb24gQ1NQUk5HIGIpIDE1JSBzbG93ZG93biBjKSBkb2Vzbid0IHJlYWxseSBoZWxwIHNpbmNlIGJpZ2ludHMgYXJlIG5vdCBDVFxuICAgIGZ1bmN0aW9uIGsyc2lnKGtCeXRlczogVWludDhBcnJheSk6IFNpZ25hdHVyZSB8IHVuZGVmaW5lZCB7XG4gICAgICAvLyBSRkMgNjk3OSBTZWN0aW9uIDMuMiwgc3RlcCAzOiBrID0gYml0czJpbnQoVClcbiAgICAgIC8vIEltcG9ydGFudDogYWxsIG1vZCgpIGNhbGxzIGhlcmUgbXVzdCBiZSBkb25lIG92ZXIgTlxuICAgICAgY29uc3QgayA9IGJpdHMyaW50KGtCeXRlcyk7IC8vIENhbm5vdCB1c2UgZmllbGRzIG1ldGhvZHMsIHNpbmNlIGl0IGlzIGdyb3VwIGVsZW1lbnRcbiAgICAgIGlmICghRm4uaXNWYWxpZE5vdDAoaykpIHJldHVybjsgLy8gVmFsaWQgc2NhbGFycyAoaW5jbHVkaW5nIGspIG11c3QgYmUgaW4gMS4uTi0xXG4gICAgICBjb25zdCBpayA9IEZuLmludihrKTsgLy8ga14tMSBtb2QgblxuICAgICAgY29uc3QgcSA9IFBvaW50LkJBU0UubXVsdGlwbHkoaykudG9BZmZpbmUoKTsgLy8gcSA9IGtcdTIyQzVHXG4gICAgICBjb25zdCByID0gRm4uY3JlYXRlKHEueCk7IC8vIHIgPSBxLnggbW9kIG5cbiAgICAgIGlmIChyID09PSBfMG4pIHJldHVybjtcbiAgICAgIGNvbnN0IHMgPSBGbi5jcmVhdGUoaWsgKiBGbi5jcmVhdGUobSArIHIgKiBkKSk7IC8vIHMgPSBrXi0xKG0gKyByZCkgbW9kIG5cbiAgICAgIGlmIChzID09PSBfMG4pIHJldHVybjtcbiAgICAgIGxldCByZWNvdmVyeSA9IChxLnggPT09IHIgPyAwIDogMikgfCBOdW1iZXIocS55ICYgXzFuKTsgLy8gcmVjb3ZlcnkgYml0ICgyIG9yIDMgd2hlbiBxLng+bilcbiAgICAgIGxldCBub3JtUyA9IHM7XG4gICAgICBpZiAobG93UyAmJiBpc0JpZ2dlclRoYW5IYWxmT3JkZXIocykpIHtcbiAgICAgICAgbm9ybVMgPSBGbi5uZWcocyk7IC8vIGlmIGxvd1Mgd2FzIHBhc3NlZCwgZW5zdXJlIHMgaXMgYWx3YXlzIGluIHRoZSBib3R0b20gaGFsZiBvZiBOXG4gICAgICAgIHJlY292ZXJ5IF49IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFNpZ25hdHVyZShyLCBub3JtUywgaGFzTGFyZ2VDb2ZhY3RvciA/IHVuZGVmaW5lZCA6IHJlY292ZXJ5KTtcbiAgICB9XG4gICAgcmV0dXJuIHsgc2VlZCwgazJzaWcgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaWducyBtZXNzYWdlIGhhc2ggd2l0aCBhIHNlY3JldCBrZXkuXG4gICAqXG4gICAqIGBgYFxuICAgKiBzaWduKG0sIGQpIHdoZXJlXG4gICAqICAgayA9IHJmYzY5NzlfaG1hY19kcmJnKG0sIGQpXG4gICAqICAgKHgsIHkpID0gRyBcdTAwRDcga1xuICAgKiAgIHIgPSB4IG1vZCBuXG4gICAqICAgcyA9IChtICsgZHIpIC8gayBtb2QgblxuICAgKiBgYGBcbiAgICovXG4gIGZ1bmN0aW9uIHNpZ24obWVzc2FnZTogVWludDhBcnJheSwgc2VjcmV0S2V5OiBVaW50OEFycmF5LCBvcHRzOiBFQ0RTQVNpZ25PcHRzID0ge30pOiBVaW50OEFycmF5IHtcbiAgICBjb25zdCB7IHNlZWQsIGsyc2lnIH0gPSBwcmVwU2lnKG1lc3NhZ2UsIHNlY3JldEtleSwgb3B0cyk7IC8vIFN0ZXBzIEEsIEQgb2YgUkZDNjk3OSAzLjIuXG4gICAgY29uc3QgZHJiZyA9IGNyZWF0ZUhtYWNEcmJnPFNpZ25hdHVyZT4oaGFzaC5vdXRwdXRMZW4sIEZuLkJZVEVTLCBobWFjKTtcbiAgICBjb25zdCBzaWcgPSBkcmJnKHNlZWQsIGsyc2lnKTsgLy8gU3RlcHMgQiwgQywgRCwgRSwgRiwgR1xuICAgIHJldHVybiBzaWcudG9CeXRlcyhvcHRzLmZvcm1hdCk7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgYSBzaWduYXR1cmUgYWdhaW5zdCBtZXNzYWdlIGFuZCBwdWJsaWMga2V5LlxuICAgKiBSZWplY3RzIGxvd1Mgc2lnbmF0dXJlcyBieSBkZWZhdWx0OiBzZWUge0BsaW5rIEVDRFNBVmVyaWZ5T3B0c30uXG4gICAqIEltcGxlbWVudHMgc2VjdGlvbiA0LjEuNCBmcm9tIGh0dHBzOi8vd3d3LnNlY2cub3JnL3NlYzEtdjIucGRmOlxuICAgKlxuICAgKiBgYGBcbiAgICogdmVyaWZ5KHIsIHMsIGgsIFApIHdoZXJlXG4gICAqICAgdTEgPSBoc14tMSBtb2QgblxuICAgKiAgIHUyID0gcnNeLTEgbW9kIG5cbiAgICogICBSID0gdTFcdTIyQzVHICsgdTJcdTIyQzVQXG4gICAqICAgbW9kKFIueCwgbikgPT0gclxuICAgKiBgYGBcbiAgICovXG4gIGZ1bmN0aW9uIHZlcmlmeShcbiAgICBzaWduYXR1cmU6IFVpbnQ4QXJyYXksXG4gICAgbWVzc2FnZTogVWludDhBcnJheSxcbiAgICBwdWJsaWNLZXk6IFVpbnQ4QXJyYXksXG4gICAgb3B0czogRUNEU0FWZXJpZnlPcHRzID0ge31cbiAgKTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyBsb3dTLCBwcmVoYXNoLCBmb3JtYXQgfSA9IHZhbGlkYXRlU2lnT3B0cyhvcHRzLCBkZWZhdWx0U2lnT3B0cyk7XG4gICAgcHVibGljS2V5ID0gYWJ5dGVzKHB1YmxpY0tleSwgdW5kZWZpbmVkLCAncHVibGljS2V5Jyk7XG4gICAgbWVzc2FnZSA9IHZhbGlkYXRlTXNnQW5kSGFzaChtZXNzYWdlLCBwcmVoYXNoKTtcbiAgICBpZiAoIWlzQnl0ZXMoc2lnbmF0dXJlIGFzIGFueSkpIHtcbiAgICAgIGNvbnN0IGVuZCA9IHNpZ25hdHVyZSBpbnN0YW5jZW9mIFNpZ25hdHVyZSA/ICcsIHVzZSBzaWcudG9CeXRlcygpJyA6ICcnO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd2ZXJpZnkgZXhwZWN0cyBVaW50OEFycmF5IHNpZ25hdHVyZScgKyBlbmQpO1xuICAgIH1cbiAgICB2YWxpZGF0ZVNpZ0xlbmd0aChzaWduYXR1cmUsIGZvcm1hdCk7IC8vIGV4ZWN1dGUgdGhpcyB0d2ljZSBiZWNhdXNlIHdlIHdhbnQgbG91ZCBlcnJvclxuICAgIHRyeSB7XG4gICAgICBjb25zdCBzaWcgPSBTaWduYXR1cmUuZnJvbUJ5dGVzKHNpZ25hdHVyZSwgZm9ybWF0KTtcbiAgICAgIGNvbnN0IFAgPSBQb2ludC5mcm9tQnl0ZXMocHVibGljS2V5KTtcbiAgICAgIGlmIChsb3dTICYmIHNpZy5oYXNIaWdoUygpKSByZXR1cm4gZmFsc2U7XG4gICAgICBjb25zdCB7IHIsIHMgfSA9IHNpZztcbiAgICAgIGNvbnN0IGggPSBiaXRzMmludF9tb2ROKG1lc3NhZ2UpOyAvLyBtb2Qgbiwgbm90IG1vZCBwXG4gICAgICBjb25zdCBpcyA9IEZuLmludihzKTsgLy8gc14tMSBtb2QgblxuICAgICAgY29uc3QgdTEgPSBGbi5jcmVhdGUoaCAqIGlzKTsgLy8gdTEgPSBoc14tMSBtb2QgblxuICAgICAgY29uc3QgdTIgPSBGbi5jcmVhdGUociAqIGlzKTsgLy8gdTIgPSByc14tMSBtb2QgblxuICAgICAgY29uc3QgUiA9IFBvaW50LkJBU0UubXVsdGlwbHlVbnNhZmUodTEpLmFkZChQLm11bHRpcGx5VW5zYWZlKHUyKSk7IC8vIHUxXHUyMkM1RyArIHUyXHUyMkM1UFxuICAgICAgaWYgKFIuaXMwKCkpIHJldHVybiBmYWxzZTtcbiAgICAgIGNvbnN0IHYgPSBGbi5jcmVhdGUoUi54KTsgLy8gdiA9IHIueCBtb2QgblxuICAgICAgcmV0dXJuIHYgPT09IHI7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY292ZXJQdWJsaWNLZXkoXG4gICAgc2lnbmF0dXJlOiBVaW50OEFycmF5LFxuICAgIG1lc3NhZ2U6IFVpbnQ4QXJyYXksXG4gICAgb3B0czogRUNEU0FSZWNvdmVyT3B0cyA9IHt9XG4gICk6IFVpbnQ4QXJyYXkge1xuICAgIGNvbnN0IHsgcHJlaGFzaCB9ID0gdmFsaWRhdGVTaWdPcHRzKG9wdHMsIGRlZmF1bHRTaWdPcHRzKTtcbiAgICBtZXNzYWdlID0gdmFsaWRhdGVNc2dBbmRIYXNoKG1lc3NhZ2UsIHByZWhhc2gpO1xuICAgIHJldHVybiBTaWduYXR1cmUuZnJvbUJ5dGVzKHNpZ25hdHVyZSwgJ3JlY292ZXJlZCcpLnJlY292ZXJQdWJsaWNLZXkobWVzc2FnZSkudG9CeXRlcygpO1xuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5mcmVlemUoe1xuICAgIGtleWdlbixcbiAgICBnZXRQdWJsaWNLZXksXG4gICAgZ2V0U2hhcmVkU2VjcmV0LFxuICAgIHV0aWxzLFxuICAgIGxlbmd0aHMsXG4gICAgUG9pbnQsXG4gICAgc2lnbixcbiAgICB2ZXJpZnksXG4gICAgcmVjb3ZlclB1YmxpY0tleSxcbiAgICBTaWduYXR1cmUsXG4gICAgaGFzaCxcbiAgfSkgc2F0aXNmaWVzIFNpZ25lcjtcbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgbG9nZ2VyXG4gKiBAZGVzY3JpcHRpb24gTG9nZ2VyIHV0aWxpdHkgZm9yIHRoZSBhcHBsaWNhdGlvblxuICovXG5cbmVudW0gTG9nTGV2ZWwge1xuICBERUJVRyxcbiAgSU5GTyxcbiAgV0FSTixcbiAgRVJST1Jcbn1cblxuaW1wb3J0IHBpbm8gZnJvbSAncGlubyc7XG5cbi8qKlxuICogQ3JlYXRlIGEgbG9nZ2VyIGluc3RhbmNlIHdpdGggY29uc2lzdGVudCBjb25maWd1cmF0aW9uXG4gKiBAcGFyYW0gbmFtZSAtIENvbXBvbmVudCBvciBtb2R1bGUgbmFtZSBmb3IgdGhlIGxvZ2dlclxuICogQHJldHVybnMgQ29uZmlndXJlZCBwaW5vIGxvZ2dlciBpbnN0YW5jZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTG9nZ2VyKG5hbWU6IHN0cmluZyk6IHBpbm8uTG9nZ2VyIHtcbiAgcmV0dXJuIHBpbm8oe1xuICAgIG5hbWUsXG4gICAgbGV2ZWw6IHByb2Nlc3MuZW52LkxPR19MRVZFTCB8fCAnaW5mbycsXG4gICAgdHJhbnNwb3J0OiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyA/IHtcbiAgICAgIHRhcmdldDogJ3Bpbm8tcHJldHR5JyxcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgY29sb3JpemU6IHRydWUsXG4gICAgICAgIHRyYW5zbGF0ZVRpbWU6ICdISDpNTTpzcycsXG4gICAgICAgIGlnbm9yZTogJ3BpZCxob3N0bmFtZScsXG4gICAgICB9XG4gICAgfSA6IHVuZGVmaW5lZCxcbiAgICBmb3JtYXR0ZXJzOiB7XG4gICAgICBsZXZlbDogKGxhYmVsKSA9PiB7XG4gICAgICAgIHJldHVybiB7IGxldmVsOiBsYWJlbC50b1VwcGVyQ2FzZSgpIH07XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBTaW1wbGUgbG9nIGZ1bmN0aW9uIGZvciBiYXNpYyBsb2dnaW5nIG5lZWRzXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gbG9nXG4gKiBAcGFyYW0gZGF0YSAtIE9wdGlvbmFsIGRhdGEgdG8gaW5jbHVkZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9nKG1lc3NhZ2U6IHN0cmluZywgZGF0YT86IHVua25vd24pOiB2b2lkIHtcbiAgY29uc29sZS5sb2cobWVzc2FnZSwgZGF0YSk7XG59XG5cbi8qKlxuICogRGVmYXVsdCBsb2dnZXIgaW5zdGFuY2UgZm9yIHRoZSBhcHBsaWNhdGlvblxuICogSW5jbHVkZXMgZW5oYW5jZWQgZXJyb3IgaGFuZGxpbmcgYW5kIGZvcm1hdHRpbmdcbiAqL1xuZXhwb3J0IGNvbnN0IGxvZ2dlcjogcGluby5Mb2dnZXIgPSBwaW5vKHtcbiAgbmFtZTogJ25vc3RyLWNyeXB0by11dGlscycsXG4gIGxldmVsOiBwcm9jZXNzLmVudi5MT0dfTEVWRUwgfHwgJ2luZm8nLFxuICB0cmFuc3BvcnQ6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnID8ge1xuICAgIHRhcmdldDogJ3Bpbm8tcHJldHR5JyxcbiAgICBvcHRpb25zOiB7XG4gICAgICBjb2xvcml6ZTogdHJ1ZSxcbiAgICAgIHRyYW5zbGF0ZVRpbWU6ICdISDpNTTpzcycsXG4gICAgICBpZ25vcmU6ICdwaWQsaG9zdG5hbWUnLFxuICAgIH1cbiAgfSA6IHVuZGVmaW5lZCxcbiAgZm9ybWF0dGVyczoge1xuICAgIGxldmVsOiAobGFiZWwpID0+IHtcbiAgICAgIHJldHVybiB7IGxldmVsOiBsYWJlbC50b1VwcGVyQ2FzZSgpIH07XG4gICAgfSxcbiAgICBsb2c6IChvYmo6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiB7XG4gICAgICAvLyBDb252ZXJ0IGVycm9yIG9iamVjdHMgdG8gc3RyaW5ncyBmb3IgYmV0dGVyIGxvZ2dpbmdcbiAgICAgIGlmIChvYmogJiYgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgJ2VycicgaW4gb2JqKSB7XG4gICAgICAgIGNvbnN0IG5ld09iaiA9IHsgLi4ub2JqIH07XG4gICAgICAgIGlmIChuZXdPYmouZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICBjb25zdCBlcnIgPSBuZXdPYmouZXJyIGFzIEVycm9yO1xuICAgICAgICAgIG5ld09iai5lcnIgPSB7XG4gICAgICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgIHN0YWNrOiBlcnIuc3RhY2ssXG4gICAgICAgICAgICBuYW1lOiBlcnIubmFtZSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXdPYmo7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgfVxufSk7XG5cbmV4cG9ydCBjbGFzcyBDdXN0b21Mb2dnZXIge1xuICBwcml2YXRlIF9sZXZlbDogTG9nTGV2ZWw7XG5cbiAgY29uc3RydWN0b3IobGV2ZWw6IExvZ0xldmVsID0gTG9nTGV2ZWwuSU5GTykge1xuICAgIHRoaXMuX2xldmVsID0gbGV2ZWw7XG4gIH1cblxuICBzZXRMZXZlbChsZXZlbDogTG9nTGV2ZWwpOiB2b2lkIHtcbiAgICB0aGlzLl9sZXZlbCA9IGxldmVsO1xuICB9XG5cbiAgcHJpdmF0ZSBfbG9nKGxldmVsOiBMb2dMZXZlbCwgbWVzc2FnZTogc3RyaW5nLCBjb250ZXh0PzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkIHtcbiAgICBpZiAobGV2ZWwgPj0gdGhpcy5fbGV2ZWwpIHtcbiAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgIGNvbnN0IGxldmVsTmFtZSA9IExvZ0xldmVsW2xldmVsXTtcbiAgICAgIGNvbnN0IGNvbnRleHRTdHIgPSBjb250ZXh0ID8gYCAke0pTT04uc3RyaW5naWZ5KGNvbnRleHQpfWAgOiAnJztcbiAgICAgIGNvbnNvbGUubG9nKGBbJHt0aW1lc3RhbXB9XSAke2xldmVsTmFtZX06ICR7bWVzc2FnZX0ke2NvbnRleHRTdHJ9YCk7XG4gICAgfVxuICB9XG5cbiAgZGVidWcobWVzc2FnZTogc3RyaW5nLCBjb250ZXh0PzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkIHtcbiAgICB0aGlzLl9sb2coTG9nTGV2ZWwuREVCVUcsIG1lc3NhZ2UsIGNvbnRleHQpO1xuICB9XG5cbiAgaW5mbyhtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQge1xuICAgIHRoaXMuX2xvZyhMb2dMZXZlbC5JTkZPLCBtZXNzYWdlLCBjb250ZXh0KTtcbiAgfVxuXG4gIHdhcm4obWVzc2FnZTogc3RyaW5nLCBjb250ZXh0PzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkIHtcbiAgICB0aGlzLl9sb2coTG9nTGV2ZWwuV0FSTiwgbWVzc2FnZSwgY29udGV4dCk7XG4gIH1cblxuICBlcnJvcihtZXNzYWdlOiBzdHJpbmcgfCBFcnJvciB8IHVua25vd24sIGNvbnRleHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQge1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IG1lc3NhZ2UgaW5zdGFuY2VvZiBFcnJvciA/IG1lc3NhZ2UubWVzc2FnZSA6IFN0cmluZyhtZXNzYWdlKTtcbiAgICB0aGlzLl9sb2coTG9nTGV2ZWwuRVJST1IsIGVycm9yTWVzc2FnZSwgY29udGV4dCk7XG4gIH1cbn1cblxuLy8gUmUtZXhwb3J0IHRoZSBMb2dnZXIgdHlwZSBmb3IgdXNlIGluIG90aGVyIGZpbGVzXG5leHBvcnQgdHlwZSB7IExvZ2dlciB9IGZyb20gJ3Bpbm8nO1xuIiwgIi8qKlxuICogQmFzZTY0IGVuY29kaW5nIHV0aWxpdGllcyBmb3IgTm9zdHJcbiAqIFByb3ZpZGVzIGNvbnNpc3RlbnQgYmFzZTY0IGVuY29kaW5nL2RlY29kaW5nIGFjcm9zcyBhbGwgTm9zdHItcmVsYXRlZCBwcm9qZWN0c1xuICogVXNlcyBicm93c2VyLWNvbXBhdGlibGUgQVBJcyAobm8gTm9kZS5qcyBCdWZmZXIgZGVwZW5kZW5jeSlcbiAqL1xuXG4vKipcbiAqIENvbnZlcnQgc3RyaW5nIHRvIGJhc2U2NFxuICogQHBhcmFtIHN0ciBTdHJpbmcgdG8gY29udmVydFxuICogQHJldHVybnMgQmFzZTY0IHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nVG9CYXNlNjQoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBieXRlcyA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzdHIpO1xuICByZXR1cm4gYnl0ZXNUb0Jhc2U2NChieXRlcyk7XG59XG5cbi8qKlxuICogQ29udmVydCBiYXNlNjQgdG8gc3RyaW5nXG4gKiBAcGFyYW0gYmFzZTY0IEJhc2U2NCBzdHJpbmcgdG8gY29udmVydFxuICogQHJldHVybnMgVVRGLTggc3RyaW5nXG4gKiBAdGhyb3dzIEVycm9yIGlmIGJhc2U2NCBzdHJpbmcgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9TdHJpbmcoYmFzZTY0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIWlzVmFsaWRCYXNlNjQoYmFzZTY0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBiYXNlNjQgc3RyaW5nJyk7XG4gIH1cbiAgY29uc3QgYnl0ZXMgPSBiYXNlNjRUb0J5dGVzKGJhc2U2NCk7XG4gIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoYnl0ZXMpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgVWludDhBcnJheSB0byBiYXNlNjRcbiAqIEBwYXJhbSBidWZmZXIgVWludDhBcnJheSB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBCYXNlNjQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWZmZXJUb0Jhc2U2NChidWZmZXI6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICByZXR1cm4gYnl0ZXNUb0Jhc2U2NChidWZmZXIpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYmFzZTY0IHRvIFVpbnQ4QXJyYXlcbiAqIEBwYXJhbSBiYXNlNjQgQmFzZTY0IHN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBVaW50OEFycmF5XG4gKiBAdGhyb3dzIEVycm9yIGlmIGJhc2U2NCBzdHJpbmcgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9CdWZmZXIoYmFzZTY0OiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgaWYgKCFpc1ZhbGlkQmFzZTY0KGJhc2U2NCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYmFzZTY0IHN0cmluZycpO1xuICB9XG4gIHJldHVybiBiYXNlNjRUb0J5dGVzKGJhc2U2NCk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgc3RyaW5nIGlzIHZhbGlkIGJhc2U2NFxuICogQHBhcmFtIGJhc2U2NCBTdHJpbmcgdG8gY2hlY2tcbiAqIEByZXR1cm5zIFRydWUgaWYgdmFsaWQgYmFzZTY0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkQmFzZTY0KGJhc2U2NDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEJvb2xlYW4oYmFzZTY0Lm1hdGNoKC9eW0EtWmEtejAtOSsvXSo9ezAsMn0kLykpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0IGJhc2U2NCB0byBVUkwtc2FmZSBiYXNlNjRcbiAqIEBwYXJhbSBiYXNlNjQgU3RhbmRhcmQgYmFzZTY0IHN0cmluZ1xuICogQHJldHVybnMgVVJMLXNhZmUgYmFzZTY0IHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gdG9CYXNlNjRVcmwoYmFzZTY0OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYmFzZTY0LnJlcGxhY2UoL1xcKy9nLCAnLScpLnJlcGxhY2UoL1xcLy9nLCAnXycpLnJlcGxhY2UoLz0rJC8sICcnKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IFVSTC1zYWZlIGJhc2U2NCB0byBzdGFuZGFyZCBiYXNlNjRcbiAqIEBwYXJhbSBiYXNlNjR1cmwgVVJMLXNhZmUgYmFzZTY0IHN0cmluZ1xuICogQHJldHVybnMgU3RhbmRhcmQgYmFzZTY0IHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbUJhc2U2NFVybChiYXNlNjR1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGJhc2U2NCA9IGJhc2U2NHVybC5yZXBsYWNlKC8tL2csICcrJykucmVwbGFjZSgvXy9nLCAnLycpO1xuICBjb25zdCBwYWRkaW5nID0gJz0nLnJlcGVhdCgoNCAtIGJhc2U2NC5sZW5ndGggJSA0KSAlIDQpO1xuICByZXR1cm4gYmFzZTY0ICsgcGFkZGluZztcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGhleCBzdHJpbmcgdG8gYmFzZTY0XG4gKiBAcGFyYW0gaGV4IEhleCBzdHJpbmcgdG8gY29udmVydFxuICogQHJldHVybnMgQmFzZTY0IHN0cmluZ1xuICogQHRocm93cyBFcnJvciBpZiBoZXggc3RyaW5nIGlzIGludmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhleFRvQmFzZTY0KGhleDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKCFoZXgubWF0Y2goL15bMC05YS1mQS1GXSokLykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaGV4IHN0cmluZycpO1xuICB9XG4gIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoaGV4Lmxlbmd0aCAvIDIpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGhleC5sZW5ndGg7IGkgKz0gMikge1xuICAgIGJ5dGVzW2kgLyAyXSA9IHBhcnNlSW50KGhleC5zdWJzdHJpbmcoaSwgaSArIDIpLCAxNik7XG4gIH1cbiAgcmV0dXJuIGJ5dGVzVG9CYXNlNjQoYnl0ZXMpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYmFzZTY0IHRvIGhleCBzdHJpbmdcbiAqIEBwYXJhbSBiYXNlNjQgQmFzZTY0IHN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBIZXggc3RyaW5nXG4gKiBAdGhyb3dzIEVycm9yIGlmIGJhc2U2NCBzdHJpbmcgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9IZXgoYmFzZTY0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIWlzVmFsaWRCYXNlNjQoYmFzZTY0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBiYXNlNjQgc3RyaW5nJyk7XG4gIH1cbiAgY29uc3QgYnl0ZXMgPSBiYXNlNjRUb0J5dGVzKGJhc2U2NCk7XG4gIHJldHVybiBBcnJheS5mcm9tKGJ5dGVzKS5tYXAoYiA9PiBiLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpKS5qb2luKCcnKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYmFzZTY0IHN0cmluZyBmcm9tIGJ5dGUgYXJyYXlcbiAqIEBwYXJhbSBieXRlcyBCeXRlIGFycmF5XG4gKiBAcmV0dXJucyBCYXNlNjQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvQmFzZTY0KGJ5dGVzOiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgbGV0IGJpbmFyeSA9ICcnO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgYmluYXJ5ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0pO1xuICB9XG4gIHJldHVybiBidG9hKGJpbmFyeSk7XG59XG5cbi8qKlxuICogQ29udmVydCBiYXNlNjQgdG8gYnl0ZSBhcnJheVxuICogQHBhcmFtIGJhc2U2NCBCYXNlNjQgc3RyaW5nXG4gKiBAcmV0dXJucyBCeXRlIGFycmF5XG4gKiBAdGhyb3dzIEVycm9yIGlmIGJhc2U2NCBzdHJpbmcgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyhiYXNlNjQ6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICBpZiAoIWlzVmFsaWRCYXNlNjQoYmFzZTY0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBiYXNlNjQgc3RyaW5nJyk7XG4gIH1cbiAgY29uc3QgYmluYXJ5ID0gYXRvYihiYXNlNjQpO1xuICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJpbmFyeS5sZW5ndGgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykge1xuICAgIGJ5dGVzW2ldID0gYmluYXJ5LmNoYXJDb2RlQXQoaSk7XG4gIH1cbiAgcmV0dXJuIGJ5dGVzO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZSBwYWRkZWQgbGVuZ3RoIGZvciBiYXNlNjQgc3RyaW5nXG4gKiBAcGFyYW0gZGF0YUxlbmd0aCBMZW5ndGggb2YgcmF3IGRhdGFcbiAqIEByZXR1cm5zIExlbmd0aCBvZiBwYWRkZWQgYmFzZTY0IHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlQmFzZTY0TGVuZ3RoKGRhdGFMZW5ndGg6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLmNlaWwoZGF0YUxlbmd0aCAvIDMpICogNDtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYmFzZTY0IHBhZGRpbmdcbiAqIEBwYXJhbSBiYXNlNjQgQmFzZTY0IHN0cmluZ1xuICogQHJldHVybnMgQmFzZTY0IHN0cmluZyB3aXRob3V0IHBhZGRpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUJhc2U2NFBhZGRpbmcoYmFzZTY0OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYmFzZTY0LnJlcGxhY2UoLz0rJC8sICcnKTtcbn1cblxuLyoqXG4gKiBBZGQgYmFzZTY0IHBhZGRpbmdcbiAqIEBwYXJhbSBiYXNlNjQgQmFzZTY0IHN0cmluZyB3aXRob3V0IHBhZGRpbmdcbiAqIEByZXR1cm5zIFByb3Blcmx5IHBhZGRlZCBiYXNlNjQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRCYXNlNjRQYWRkaW5nKGJhc2U2NDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgcGFkZGluZyA9ICc9Jy5yZXBlYXQoKDQgLSBiYXNlNjQubGVuZ3RoICUgNCkgJSA0KTtcbiAgcmV0dXJuIGJhc2U2NCArIHBhZGRpbmc7XG59XG4iLCAiLyoqXG4gKiBAbW9kdWxlIHZhbGlkYXRpb25cbiAqIEBkZXNjcmlwdGlvbiBWYWxpZGF0aW9uIHV0aWxpdGllcyBmb3IgTm9zdHIgZXZlbnRzLCBtZXNzYWdlcywgYW5kIHJlbGF0ZWQgZGF0YSBzdHJ1Y3R1cmVzLlxuICogUHJvdmlkZXMgZnVuY3Rpb25zIHRvIHZhbGlkYXRlIGV2ZW50cywgc2lnbmF0dXJlcywgZmlsdGVycywgYW5kIHN1YnNjcmlwdGlvbnMgYWNjb3JkaW5nIHRvIHRoZSBOb3N0ciBwcm90b2NvbC5cbiAqL1xuXG5pbXBvcnQgeyBcbiAgTm9zdHJFdmVudCwgXG4gIFNpZ25lZE5vc3RyRXZlbnQsIFxuICBOb3N0ckZpbHRlciwgXG4gIE5vc3RyU3Vic2NyaXB0aW9uLCBcbiAgVmFsaWRhdGlvblJlc3VsdCwgXG4gIFB1YmxpY0tleSxcbiAgTm9zdHJNZXNzYWdlVHlwZVxufSBmcm9tICcuLi90eXBlcy9pbmRleCc7XG5cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XG5cbmltcG9ydCB7IHNoYTI1NiB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvc2hhMi5qcyc7XG5pbXBvcnQgeyBieXRlc1RvSGV4IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBzY2hub3JyIH0gZnJvbSAnQG5vYmxlL2N1cnZlcy9zZWNwMjU2azEuanMnO1xuXG4vKipcbiAqIEdldHMgdGhlIGhleCBzdHJpbmcgZnJvbSBhIFB1YmxpY0tleSBvciBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gZ2V0UHVibGljS2V5SGV4KHB1YmtleTogUHVibGljS2V5IHwgc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHR5cGVvZiBwdWJrZXkgPT09ICdzdHJpbmcnID8gcHVia2V5IDogcHVia2V5LmhleDtcbn1cblxuZnVuY3Rpb24gaGV4VG9CeXRlcyhoZXg6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoaGV4Lm1hdGNoKC8uezEsMn0vZykhLm1hcChieXRlID0+IHBhcnNlSW50KGJ5dGUsIDE2KSkpO1xufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIE5vc3RyIGV2ZW50IElEIGJ5IGNoZWNraW5nIGlmIGl0IG1hdGNoZXMgdGhlIFNIQS0yNTYgaGFzaCBvZiB0aGUgY2Fub25pY2FsIGV2ZW50IHNlcmlhbGl6YXRpb24uXG4gKiBcbiAqIEBwYXJhbSB7U2lnbmVkTm9zdHJFdmVudH0gZXZlbnQgLSBUaGUgZXZlbnQgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtWYWxpZGF0aW9uUmVzdWx0fSBPYmplY3QgY29udGFpbmluZyB2YWxpZGF0aW9uIHJlc3VsdCBhbmQgYW55IGVycm9yIG1lc3NhZ2VcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCByZXN1bHQgPSB2YWxpZGF0ZUV2ZW50SWQoZXZlbnQpO1xuICogaWYgKCFyZXN1bHQuaXNWYWxpZCkge1xuICogICBjb25zb2xlLmVycm9yKHJlc3VsdC5lcnJvcik7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRXZlbnRJZChldmVudDogU2lnbmVkTm9zdHJFdmVudCk6IFZhbGlkYXRpb25SZXN1bHQge1xuICB0cnkge1xuICAgIGNvbnN0IHNlcmlhbGl6ZWQgPSBKU09OLnN0cmluZ2lmeShbXG4gICAgICAwLFxuICAgICAgZ2V0UHVibGljS2V5SGV4KGV2ZW50LnB1YmtleSksXG4gICAgICBldmVudC5jcmVhdGVkX2F0LFxuICAgICAgZXZlbnQua2luZCxcbiAgICAgIGV2ZW50LnRhZ3MsXG4gICAgICBldmVudC5jb250ZW50XG4gICAgXSk7XG4gICAgY29uc3QgaGFzaCA9IGJ5dGVzVG9IZXgoc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZXJpYWxpemVkKSkpO1xuICAgIHJldHVybiB7XG4gICAgICBpc1ZhbGlkOiBoYXNoID09PSBldmVudC5pZCxcbiAgICAgIGVycm9yOiBoYXNoID09PSBldmVudC5pZCA/IHVuZGVmaW5lZCA6ICdJbnZhbGlkIGV2ZW50IElEJ1xuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2YWxpZGF0ZSBldmVudCBJRCcpO1xuICAgIHJldHVybiB7XG4gICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgIGVycm9yOiAnRmFpbGVkIHRvIHZhbGlkYXRlIGV2ZW50IElEJ1xuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBOb3N0ciBldmVudCBzaWduYXR1cmUgdXNpbmcgU2Nobm9yciBzaWduYXR1cmUgdmVyaWZpY2F0aW9uLlxuICogXG4gKiBAcGFyYW0ge1NpZ25lZE5vc3RyRXZlbnR9IGV2ZW50IC0gVGhlIGV2ZW50IHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyB7VmFsaWRhdGlvblJlc3VsdH0gT2JqZWN0IGNvbnRhaW5pbmcgdmFsaWRhdGlvbiByZXN1bHQgYW5kIGFueSBlcnJvciBtZXNzYWdlXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgcmVzdWx0ID0gdmFsaWRhdGVFdmVudFNpZ25hdHVyZShldmVudCk7XG4gKiBpZiAoIXJlc3VsdC5pc1ZhbGlkKSB7XG4gKiAgIGNvbnNvbGUuZXJyb3IocmVzdWx0LmVycm9yKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVFdmVudFNpZ25hdHVyZShldmVudDogU2lnbmVkTm9zdHJFdmVudCk6IFZhbGlkYXRpb25SZXN1bHQge1xuICB0cnkge1xuICAgIC8vIFZlcmlmeSB0aGUgc2lnbmF0dXJlXG4gICAgY29uc3Qgc2VyaWFsaXplZCA9IEpTT04uc3RyaW5naWZ5KFtcbiAgICAgIDAsXG4gICAgICBnZXRQdWJsaWNLZXlIZXgoZXZlbnQucHVia2V5KSxcbiAgICAgIGV2ZW50LmNyZWF0ZWRfYXQsXG4gICAgICBldmVudC5raW5kLFxuICAgICAgZXZlbnQudGFncyxcbiAgICAgIGV2ZW50LmNvbnRlbnRcbiAgICBdKTtcbiAgICBjb25zdCBoYXNoID0gc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZXJpYWxpemVkKSk7XG4gICAgY29uc3QgcHVia2V5SGV4ID0gZ2V0UHVibGljS2V5SGV4KGV2ZW50LnB1YmtleSk7XG4gICAgY29uc3QgcHVia2V5Qnl0ZXMgPSBoZXhUb0J5dGVzKHB1YmtleUhleCk7XG4gICAgY29uc3QgaXNWYWxpZCA9IHNjaG5vcnIudmVyaWZ5KGhleFRvQnl0ZXMoZXZlbnQuc2lnKSwgaGFzaCwgcHVia2V5Qnl0ZXMpO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBpc1ZhbGlkLFxuICAgICAgZXJyb3I6IGlzVmFsaWQgPyB1bmRlZmluZWQgOiAnSW52YWxpZCBzaWduYXR1cmUnXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZhbGlkYXRlIGV2ZW50IHNpZ25hdHVyZScpO1xuICAgIHJldHVybiB7XG4gICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgIGVycm9yOiAnRmFpbGVkIHRvIHZhbGlkYXRlIGV2ZW50IHNpZ25hdHVyZSdcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgY29tcGxldGUgTm9zdHIgZXZlbnQgYnkgY2hlY2tpbmcgaXRzIHN0cnVjdHVyZSwgdGltZXN0YW1wcywgSUQsIGFuZCBzaWduYXR1cmUuXG4gKiBcbiAqIEBwYXJhbSB7U2lnbmVkTm9zdHJFdmVudH0gZXZlbnQgLSBUaGUgZXZlbnQgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtWYWxpZGF0aW9uUmVzdWx0fSBPYmplY3QgY29udGFpbmluZyB2YWxpZGF0aW9uIHJlc3VsdCBhbmQgYW55IGVycm9yIG1lc3NhZ2VcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCByZXN1bHQgPSB2YWxpZGF0ZUV2ZW50KGV2ZW50KTtcbiAqIGlmICghcmVzdWx0LmlzVmFsaWQpIHtcbiAqICAgY29uc29sZS5lcnJvcihyZXN1bHQuZXJyb3IpO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUV2ZW50KGV2ZW50OiBTaWduZWROb3N0ckV2ZW50KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gIC8vIEZpcnN0IHZhbGlkYXRlIHRoZSBldmVudCBzdHJ1Y3R1cmVcbiAgY29uc3QgYmFzZVZhbGlkYXRpb24gPSB2YWxpZGF0ZUV2ZW50QmFzZShldmVudCk7XG4gIGlmICghYmFzZVZhbGlkYXRpb24uaXNWYWxpZCkge1xuICAgIHJldHVybiBiYXNlVmFsaWRhdGlvbjtcbiAgfVxuXG4gIC8vIFRoZW4gdmFsaWRhdGUgdGhlIGV2ZW50IElEXG4gIGNvbnN0IGlkVmFsaWRhdGlvbiA9IHZhbGlkYXRlRXZlbnRJZChldmVudCk7XG4gIGlmICghaWRWYWxpZGF0aW9uLmlzVmFsaWQpIHtcbiAgICByZXR1cm4gaWRWYWxpZGF0aW9uO1xuICB9XG5cbiAgLy8gRmluYWxseSB2YWxpZGF0ZSB0aGUgc2lnbmF0dXJlXG4gIHJldHVybiB2YWxpZGF0ZUV2ZW50U2lnbmF0dXJlKGV2ZW50KTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBzaWduZWQgTm9zdHIgZXZlbnQgYnkgY2hlY2tpbmcgaXRzIHN0cnVjdHVyZSBhbmQgc2lnbmF0dXJlIGZvcm1hdC5cbiAqIFxuICogQHBhcmFtIHtTaWduZWROb3N0ckV2ZW50fSBldmVudCAtIFRoZSBldmVudCB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge1ZhbGlkYXRpb25SZXN1bHR9IE9iamVjdCBjb250YWluaW5nIHZhbGlkYXRpb24gcmVzdWx0IGFuZCBhbnkgZXJyb3IgbWVzc2FnZVxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IHJlc3VsdCA9IHZhbGlkYXRlU2lnbmVkRXZlbnQoZXZlbnQpO1xuICogaWYgKCFyZXN1bHQuaXNWYWxpZCkge1xuICogICBjb25zb2xlLmVycm9yKHJlc3VsdC5lcnJvcik7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU2lnbmVkRXZlbnQoZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgdHJ5IHtcbiAgICAvLyBDaGVjayBiYXNpYyBldmVudCBzdHJ1Y3R1cmVcbiAgICBjb25zdCBiYXNlVmFsaWRhdGlvbiA9IHZhbGlkYXRlRXZlbnRCYXNlKGV2ZW50KTtcbiAgICBpZiAoIWJhc2VWYWxpZGF0aW9uLmlzVmFsaWQpIHtcbiAgICAgIHJldHVybiBiYXNlVmFsaWRhdGlvbjtcbiAgICB9XG5cbiAgICAvLyBHZXQgcHVia2V5IGhleFxuICAgIGNvbnN0IHB1YmtleUhleCA9IGdldFB1YmxpY0tleUhleChldmVudC5wdWJrZXkpO1xuXG4gICAgLy8gVmFsaWRhdGUgcHVia2V5IGZvcm1hdFxuICAgIGlmICghcHVia2V5SGV4IHx8IHR5cGVvZiBwdWJrZXlIZXggIT09ICdzdHJpbmcnIHx8IHB1YmtleUhleC5sZW5ndGggIT09IDY0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6ICdJbnZhbGlkIHB1YmxpYyBrZXkgZm9ybWF0J1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBzaWduYXR1cmUgZm9ybWF0XG4gICAgaWYgKCFldmVudC5zaWcgfHwgdHlwZW9mIGV2ZW50LnNpZyAhPT0gJ3N0cmluZycgfHwgZXZlbnQuc2lnLmxlbmd0aCAhPT0gMTI4KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6ICdJbnZhbGlkIHNpZ25hdHVyZSBmb3JtYXQnXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIElEIGZvcm1hdFxuICAgIGlmICghZXZlbnQuaWQgfHwgdHlwZW9mIGV2ZW50LmlkICE9PSAnc3RyaW5nJyB8fCBldmVudC5pZC5sZW5ndGggIT09IDY0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6ICdJbnZhbGlkIGV2ZW50IElEIGZvcm1hdCdcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gdmFsaWRhdGUgc2lnbmVkIGV2ZW50Jyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gdmFsaWRhdGUgc2lnbmVkIGV2ZW50J1xuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBOb3N0ciBldmVudCBieSBjaGVja2luZyBpdHMgc3RydWN0dXJlIGFuZCBmaWVsZHMuXG4gKiBAcGFyYW0gZXZlbnQgLSBUaGUgZXZlbnQgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIFZhbGlkYXRpb24gcmVzdWx0IGFuZCBhbnkgZXJyb3IgbWVzc2FnZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVFdmVudEJhc2UoZXZlbnQ6IE5vc3RyRXZlbnQgfCBTaWduZWROb3N0ckV2ZW50KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gIC8vIENoZWNrIHJlcXVpcmVkIGZpZWxkc1xuICBpZiAoIWV2ZW50IHx8IHR5cGVvZiBldmVudCAhPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGV2ZW50IHN0cnVjdHVyZScgfTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIGtpbmRcbiAgaWYgKHR5cGVvZiBldmVudC5raW5kICE9PSAnbnVtYmVyJyB8fCBldmVudC5raW5kIDwgMCkge1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0V2ZW50IGtpbmQgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyJyB9O1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgdGltZXN0YW1wXG4gIGNvbnN0IG5vdyA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xuICBpZiAodHlwZW9mIGV2ZW50LmNyZWF0ZWRfYXQgIT09ICdudW1iZXInIHx8IGV2ZW50LmNyZWF0ZWRfYXQgPiBub3cgKyA2MCkge1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0V2ZW50IHRpbWVzdGFtcCBjYW5ub3QgYmUgaW4gdGhlIGZ1dHVyZScgfTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIGNvbnRlbnRcbiAgaWYgKHR5cGVvZiBldmVudC5jb250ZW50ICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0V2ZW50IGNvbnRlbnQgbXVzdCBiZSBhIHN0cmluZycgfTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIHB1YmtleSBmb3JtYXRcbiAgaWYgKCFldmVudC5wdWJrZXkpIHtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdNaXNzaW5nIHB1YmxpYyBrZXknIH07XG4gIH1cblxuICAvLyBHZXQgcHVia2V5IGhleFxuICBjb25zdCBwdWJrZXlIZXggPSBnZXRQdWJsaWNLZXlIZXgoZXZlbnQucHVia2V5KTtcbiAgaWYgKHR5cGVvZiBwdWJrZXlIZXggIT09ICdzdHJpbmcnIHx8ICEvXlswLTlhLWZdezY0fSQvLnRlc3QocHVia2V5SGV4KSkge1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcHVibGljIGtleSBmb3JtYXQnIH07XG4gIH1cblxuICAvLyBWYWxpZGF0ZSB0YWdzXG4gIGlmICghQXJyYXkuaXNBcnJheShldmVudC50YWdzKSkge1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0V2ZW50IHRhZ3MgbXVzdCBiZSBhbiBhcnJheScgfTtcbiAgfVxuXG4gIGZvciAoY29uc3QgdGFnIG9mIGV2ZW50LnRhZ3MpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodGFnKSkge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRWFjaCB0YWcgbXVzdCBiZSBhbiBhcnJheScgfTtcbiAgICB9XG4gICAgaWYgKHRhZy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0VtcHR5IHRhZ3MgYXJlIG5vdCBhbGxvd2VkJyB9O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRhZ1swXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ1RhZyBpZGVudGlmaWVyIG11c3QgYmUgYSBzdHJpbmcnIH07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSB9O1xufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIE5vc3RyIGZpbHRlciBieSBjaGVja2luZyBpdHMgc3RydWN0dXJlIGFuZCBmaWVsZHMuXG4gKiBcbiAqIEBwYXJhbSB7Tm9zdHJGaWx0ZXJ9IGZpbHRlciAtIFRoZSBmaWx0ZXIgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtWYWxpZGF0aW9uUmVzdWx0fSBPYmplY3QgY29udGFpbmluZyB2YWxpZGF0aW9uIHJlc3VsdCBhbmQgYW55IGVycm9yIG1lc3NhZ2VcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCByZXN1bHQgPSB2YWxpZGF0ZUZpbHRlcihmaWx0ZXIpO1xuICogaWYgKCFyZXN1bHQuaXNWYWxpZCkge1xuICogICBjb25zb2xlLmVycm9yKHJlc3VsdC5lcnJvcik7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRmlsdGVyKGZpbHRlcjogTm9zdHJGaWx0ZXIpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBmaWx0ZXIgc3RydWN0dXJlXG4gICAgaWYgKCFmaWx0ZXIgfHwgdHlwZW9mIGZpbHRlciAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgZmlsdGVyIHN0cnVjdHVyZScgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBpZHMgYXJyYXkgaWYgcHJlc2VudFxuICAgIGlmIChmaWx0ZXIuaWRzICYmICghQXJyYXkuaXNBcnJheShmaWx0ZXIuaWRzKSB8fCAhZmlsdGVyLmlkcy5ldmVyeShpZCA9PiB0eXBlb2YgaWQgPT09ICdzdHJpbmcnKSkpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZpbHRlciBpZHMgbXVzdCBiZSBhbiBhcnJheSBvZiBzdHJpbmdzJyB9O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGF1dGhvcnMgYXJyYXkgaWYgcHJlc2VudFxuICAgIGlmIChmaWx0ZXIuYXV0aG9ycyAmJiAoIUFycmF5LmlzQXJyYXkoZmlsdGVyLmF1dGhvcnMpIHx8ICFmaWx0ZXIuYXV0aG9ycy5ldmVyeShhdXRob3IgPT4gdHlwZW9mIGF1dGhvciA9PT0gJ3N0cmluZycpKSkge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmlsdGVyIGF1dGhvcnMgbXVzdCBiZSBhbiBhcnJheSBvZiBzdHJpbmdzJyB9O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGtpbmRzIGFycmF5IGlmIHByZXNlbnRcbiAgICBpZiAoZmlsdGVyLmtpbmRzKSB7XG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoZmlsdGVyLmtpbmRzKSkge1xuICAgICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGaWx0ZXIga2luZHMgbXVzdCBiZSBhbiBhcnJheSBvZiBudW1iZXJzJyB9O1xuICAgICAgfVxuICAgICAgaWYgKCFmaWx0ZXIua2luZHMuZXZlcnkoa2luZCA9PiB0eXBlb2Yga2luZCA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzSW50ZWdlcihraW5kKSAmJiBraW5kID49IDApKSB7XG4gICAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZpbHRlciBraW5kcyBtdXN0IGJlIG5vbi1uZWdhdGl2ZSBpbnRlZ2VycycgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSB0aW1lc3RhbXBzXG4gICAgaWYgKGZpbHRlci5zaW5jZSAmJiB0eXBlb2YgZmlsdGVyLnNpbmNlICE9PSAnbnVtYmVyJykge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmlsdGVyIHNpbmNlIG11c3QgYmUgYSBudW1iZXInIH07XG4gICAgfVxuICAgIGlmIChmaWx0ZXIudW50aWwgJiYgdHlwZW9mIGZpbHRlci51bnRpbCAhPT0gJ251bWJlcicpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZpbHRlciB1bnRpbCBtdXN0IGJlIGEgbnVtYmVyJyB9O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGxpbWl0XG4gICAgaWYgKGZpbHRlci5saW1pdCAmJiB0eXBlb2YgZmlsdGVyLmxpbWl0ICE9PSAnbnVtYmVyJykge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmlsdGVyIGxpbWl0IG11c3QgYmUgYSBudW1iZXInIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgc2VhcmNoXG4gICAgaWYgKGZpbHRlci5zZWFyY2ggJiYgdHlwZW9mIGZpbHRlci5zZWFyY2ggIT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGaWx0ZXIgc2VhcmNoIG11c3QgYmUgYSBzdHJpbmcnIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gdmFsaWRhdGUgZmlsdGVyJyk7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmFpbGVkIHRvIHZhbGlkYXRlIGZpbHRlcicgfTtcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIE5vc3RyIHN1YnNjcmlwdGlvbiBieSBjaGVja2luZyBpdHMgc3RydWN0dXJlIGFuZCBmaWx0ZXJzLlxuICogXG4gKiBAcGFyYW0ge05vc3RyU3Vic2NyaXB0aW9ufSBzdWJzY3JpcHRpb24gLSBUaGUgc3Vic2NyaXB0aW9uIHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyB7VmFsaWRhdGlvblJlc3VsdH0gT2JqZWN0IGNvbnRhaW5pbmcgdmFsaWRhdGlvbiByZXN1bHQgYW5kIGFueSBlcnJvciBtZXNzYWdlXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgcmVzdWx0ID0gdmFsaWRhdGVTdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uKTtcbiAqIGlmICghcmVzdWx0LmlzVmFsaWQpIHtcbiAqICAgY29uc29sZS5lcnJvcihyZXN1bHQuZXJyb3IpO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVN1YnNjcmlwdGlvbihzdWJzY3JpcHRpb246IE5vc3RyU3Vic2NyaXB0aW9uKTogVmFsaWRhdGlvblJlc3VsdCB7XG4gIHRyeSB7XG4gICAgLy8gVmFsaWRhdGUgc3Vic2NyaXB0aW9uIHN0cnVjdHVyZVxuICAgIGlmICghc3Vic2NyaXB0aW9uIHx8IHR5cGVvZiBzdWJzY3JpcHRpb24gIT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHN1YnNjcmlwdGlvbiBzdHJ1Y3R1cmUnIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgc3Vic2NyaXB0aW9uIElEXG4gICAgaWYgKCFzdWJzY3JpcHRpb24uaWQgfHwgdHlwZW9mIHN1YnNjcmlwdGlvbi5pZCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ1N1YnNjcmlwdGlvbiBtdXN0IGhhdmUgYSBzdHJpbmcgSUQnIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgZmlsdGVycyBhcnJheVxuICAgIGlmICghQXJyYXkuaXNBcnJheShzdWJzY3JpcHRpb24uZmlsdGVycykpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ1N1YnNjcmlwdGlvbiBmaWx0ZXJzIG11c3QgYmUgYW4gYXJyYXknIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgZWFjaCBmaWx0ZXJcbiAgICBmb3IgKGNvbnN0IGZpbHRlciBvZiBzdWJzY3JpcHRpb24uZmlsdGVycykge1xuICAgICAgY29uc3QgZmlsdGVyVmFsaWRhdGlvbiA9IHZhbGlkYXRlRmlsdGVyKGZpbHRlcik7XG4gICAgICBpZiAoIWZpbHRlclZhbGlkYXRpb24uaXNWYWxpZCkge1xuICAgICAgICByZXR1cm4gZmlsdGVyVmFsaWRhdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2YWxpZGF0ZSBzdWJzY3JpcHRpb24nKTtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGYWlsZWQgdG8gdmFsaWRhdGUgc3Vic2NyaXB0aW9uJyB9O1xuICB9XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgTm9zdHIgcmVsYXkgcmVzcG9uc2UgbWVzc2FnZS5cbiAqIFxuICogQHBhcmFtIHt1bmtub3dufSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtWYWxpZGF0aW9uUmVzdWx0fSBPYmplY3QgY29udGFpbmluZyB2YWxpZGF0aW9uIHJlc3VsdCBhbmQgYW55IGVycm9yIG1lc3NhZ2VcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCByZXN1bHQgPSB2YWxpZGF0ZVJlc3BvbnNlKFsnRVZFTlQnLCBldmVudE9ial0pO1xuICogaWYgKCFyZXN1bHQuaXNWYWxpZCkge1xuICogICBjb25zb2xlLmVycm9yKHJlc3VsdC5lcnJvcik7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlUmVzcG9uc2UobWVzc2FnZTogdW5rbm93bik6IFZhbGlkYXRpb25SZXN1bHQge1xuICAvLyBDaGVjayBpZiBtZXNzYWdlIGlzIGFuIGFycmF5XG4gIGlmICghQXJyYXkuaXNBcnJheShtZXNzYWdlKSkge1xuICAgIHJldHVybiB7XG4gICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgIGVycm9yOiAnSW52YWxpZCBtZXNzYWdlIGZvcm1hdDogbXVzdCBiZSBhbiBhcnJheSdcbiAgICB9O1xuICB9XG5cbiAgLy8gQ2hlY2sgaWYgbWVzc2FnZSBoYXMgYXQgbGVhc3Qgb25lIGVsZW1lbnRcbiAgaWYgKG1lc3NhZ2UubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdJbnZhbGlkIG1lc3NhZ2UgZm9ybWF0OiBhcnJheSBpcyBlbXB0eSdcbiAgICB9O1xuICB9XG5cbiAgLy8gQ2hlY2sgaWYgZmlyc3QgZWxlbWVudCBpcyBhIHZhbGlkIG1lc3NhZ2UgdHlwZVxuICBjb25zdCB0eXBlID0gbWVzc2FnZVswXTtcbiAgaWYgKCFPYmplY3QudmFsdWVzKE5vc3RyTWVzc2FnZVR5cGUpLmluY2x1ZGVzKHR5cGUgYXMgTm9zdHJNZXNzYWdlVHlwZSkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICBlcnJvcjogYEludmFsaWQgbWVzc2FnZSB0eXBlOiAke3R5cGV9YFxuICAgIH07XG4gIH1cblxuICAvLyBUeXBlLXNwZWNpZmljIHZhbGlkYXRpb25cbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSBOb3N0ck1lc3NhZ2VUeXBlLkVWRU5UOlxuICAgICAgaWYgKG1lc3NhZ2UubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6ICdFVkVOVCBtZXNzYWdlIG11c3QgaGF2ZSBleGFjdGx5IDIgZWxlbWVudHMnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsaWRhdGVTaWduZWRFdmVudChtZXNzYWdlWzFdIGFzIFNpZ25lZE5vc3RyRXZlbnQpO1xuXG4gICAgY2FzZSBOb3N0ck1lc3NhZ2VUeXBlLk5PVElDRTpcbiAgICAgIGlmIChtZXNzYWdlLmxlbmd0aCAhPT0gMiB8fCB0eXBlb2YgbWVzc2FnZVsxXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogJ05PVElDRSBtZXNzYWdlIG11c3QgaGF2ZSBleGFjdGx5IDIgZWxlbWVudHMgd2l0aCBhIHN0cmluZyBtZXNzYWdlJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSB9O1xuXG4gICAgY2FzZSBOb3N0ck1lc3NhZ2VUeXBlLk9LOlxuICAgICAgaWYgKG1lc3NhZ2UubGVuZ3RoICE9PSA0IHx8IFxuICAgICAgICAgIHR5cGVvZiBtZXNzYWdlWzFdICE9PSAnc3RyaW5nJyB8fCBcbiAgICAgICAgICB0eXBlb2YgbWVzc2FnZVsyXSAhPT0gJ2Jvb2xlYW4nIHx8IFxuICAgICAgICAgIHR5cGVvZiBtZXNzYWdlWzNdICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiAnT0sgbWVzc2FnZSBtdXN0IGhhdmUgZXhhY3RseSA0IGVsZW1lbnRzOiBbdHlwZSwgZXZlbnRJZCwgc3VjY2VzcywgbWVzc2FnZV0nXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG5cbiAgICBjYXNlIE5vc3RyTWVzc2FnZVR5cGUuRU9TRTpcbiAgICAgIGlmIChtZXNzYWdlLmxlbmd0aCAhPT0gMiB8fCB0eXBlb2YgbWVzc2FnZVsxXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogJ0VPU0UgbWVzc2FnZSBtdXN0IGhhdmUgZXhhY3RseSAyIGVsZW1lbnRzIHdpdGggYSBzdWJzY3JpcHRpb24gSUQnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG5cbiAgICBjYXNlIE5vc3RyTWVzc2FnZVR5cGUuUkVROlxuICAgICAgaWYgKG1lc3NhZ2UubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiAnUkVRIG1lc3NhZ2UgbXVzdCBoYXZlIGF0IGxlYXN0IDIgZWxlbWVudHMnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG1lc3NhZ2VbMV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6ICdSRVEgbWVzc2FnZSBtdXN0IGhhdmUgYSBzdHJpbmcgc3Vic2NyaXB0aW9uIElEJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgLy8gVmFsaWRhdGUgZWFjaCBmaWx0ZXIgaWYgcHJlc2VudFxuICAgICAgZm9yIChsZXQgaSA9IDI7IGkgPCBtZXNzYWdlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGZpbHRlclJlc3VsdCA9IHZhbGlkYXRlRmlsdGVyKG1lc3NhZ2VbaV0gYXMgTm9zdHJGaWx0ZXIpO1xuICAgICAgICBpZiAoIWZpbHRlclJlc3VsdC5pc1ZhbGlkKSB7XG4gICAgICAgICAgcmV0dXJuIGZpbHRlclJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSB9O1xuXG4gICAgY2FzZSBOb3N0ck1lc3NhZ2VUeXBlLkNMT1NFOlxuICAgICAgaWYgKG1lc3NhZ2UubGVuZ3RoICE9PSAyIHx8IHR5cGVvZiBtZXNzYWdlWzFdICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiAnQ0xPU0UgbWVzc2FnZSBtdXN0IGhhdmUgZXhhY3RseSAyIGVsZW1lbnRzIHdpdGggYSBzdWJzY3JpcHRpb24gSUQnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG5cbiAgICBjYXNlIE5vc3RyTWVzc2FnZVR5cGUuQVVUSDpcbiAgICAgIGlmIChtZXNzYWdlLmxlbmd0aCAhPT0gMikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiAnQVVUSCBtZXNzYWdlIG11c3QgaGF2ZSBleGFjdGx5IDIgZWxlbWVudHMnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsaWRhdGVTaWduZWRFdmVudChtZXNzYWdlWzFdIGFzIFNpZ25lZE5vc3RyRXZlbnQpO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICBlcnJvcjogYFVuc3VwcG9ydGVkIG1lc3NhZ2UgdHlwZTogJHt0eXBlfWBcbiAgICAgIH07XG4gIH1cbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgZXZlbnRcbiAqIEBkZXNjcmlwdGlvbiBFdmVudCBoYW5kbGluZyB1dGlsaXRpZXMgZm9yIE5vc3RyXG4gKi9cblxuZXhwb3J0IHsgY3JlYXRlRXZlbnQsIHNlcmlhbGl6ZUV2ZW50LCBnZXRFdmVudEhhc2ggfSBmcm9tICcuL2NyZWF0aW9uJztcbmV4cG9ydCB7IHZhbGlkYXRlRXZlbnQsIGNhbGN1bGF0ZUV2ZW50SWQgfSBmcm9tICcuL3NpZ25pbmcnO1xuIiwgIi8qKlxuICogQG1vZHVsZSBldmVudC9jcmVhdGlvblxuICogQGRlc2NyaXB0aW9uIEV2ZW50IGNyZWF0aW9uIGFuZCBzZXJpYWxpemF0aW9uIHV0aWxpdGllcyBmb3IgTm9zdHJcbiAqL1xuXG5pbXBvcnQgeyBzaGEyNTYgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3NoYTIuanMnO1xuaW1wb3J0IHsgYnl0ZXNUb0hleCB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcbmltcG9ydCB0eXBlIHsgTm9zdHJFdmVudCwgTm9zdHJFdmVudEtpbmQgfSBmcm9tICcuLi90eXBlcy9pbmRleCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBOb3N0ciBldmVudCB3aXRoIHRoZSBzcGVjaWZpZWQgcGFyYW1ldGVyc1xuICogQHBhcmFtIHBhcmFtcyAtIEV2ZW50IHBhcmFtZXRlcnNcbiAqIEByZXR1cm5zIENyZWF0ZWQgZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUV2ZW50KHBhcmFtczoge1xuICBraW5kOiBOb3N0ckV2ZW50S2luZDtcbiAgY29udGVudDogc3RyaW5nO1xuICB0YWdzPzogc3RyaW5nW11bXTtcbiAgY3JlYXRlZF9hdD86IG51bWJlcjtcbiAgcHVia2V5Pzogc3RyaW5nO1xufSk6IE5vc3RyRXZlbnQge1xuICBjb25zdCB7IFxuICAgIGtpbmQsIFxuICAgIGNvbnRlbnQsIFxuICAgIHRhZ3MgPSBbXSwgXG4gICAgY3JlYXRlZF9hdCA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApLCBcbiAgICBwdWJrZXkgPSAnJyBcbiAgfSA9IHBhcmFtcztcbiAgXG4gIHJldHVybiB7XG4gICAga2luZCxcbiAgICBjb250ZW50LFxuICAgIHRhZ3MsXG4gICAgY3JlYXRlZF9hdCxcbiAgICBwdWJrZXksXG4gIH07XG59XG5cbi8qKlxuICogU2VyaWFsaXplcyBhIE5vc3RyIGV2ZW50IGZvciBzaWduaW5nL2hhc2hpbmcgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIHNlcmlhbGl6ZVxuICogQHJldHVybnMgU2VyaWFsaXplZCBldmVudCBKU09OIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplRXZlbnQoZXZlbnQ6IE5vc3RyRXZlbnQpOiBzdHJpbmcge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoW1xuICAgIDAsXG4gICAgZXZlbnQucHVia2V5LFxuICAgIGV2ZW50LmNyZWF0ZWRfYXQsXG4gICAgZXZlbnQua2luZCxcbiAgICBldmVudC50YWdzLFxuICAgIGV2ZW50LmNvbnRlbnRcbiAgXSk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgaGFzaCBvZiBhIE5vc3RyIGV2ZW50IChOSVAtMDEpXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byBoYXNoXG4gKiBAcmV0dXJucyBFdmVudCBoYXNoIGluIGhleCBmb3JtYXRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEV2ZW50SGFzaChldmVudDogTm9zdHJFdmVudCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2VyaWFsaXplZCA9IHNlcmlhbGl6ZUV2ZW50KGV2ZW50KTtcbiAgICBjb25zdCBoYXNoID0gYXdhaXQgc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZXJpYWxpemVkKSk7XG4gICAgcmV0dXJuIGJ5dGVzVG9IZXgoaGFzaCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBnZXQgZXZlbnQgaGFzaCcpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG4iLCAiLyoqXG4gKiBAbW9kdWxlIGV2ZW50L3NpZ25pbmdcbiAqIEBkZXNjcmlwdGlvbiBFdmVudCBzaWduaW5nIGFuZCB2ZXJpZmljYXRpb24gdXRpbGl0aWVzIGZvciBOb3N0clxuICovXG5cbmltcG9ydCB7IHNjaG5vcnIgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG5pbXBvcnQgeyBieXRlc1RvSGV4LCBoZXhUb0J5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi91dGlscy9sb2dnZXInO1xuaW1wb3J0IHsgZ2V0RXZlbnRIYXNoIH0gZnJvbSAnLi9jcmVhdGlvbic7XG5pbXBvcnQgdHlwZSB7IE5vc3RyRXZlbnQsIFNpZ25lZE5vc3RyRXZlbnQgfSBmcm9tICcuLi90eXBlcyc7XG5cbi8qKlxuICogU2lnbnMgYSBOb3N0ciBldmVudCB3aXRoIGEgcHJpdmF0ZSBrZXkgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIHNpZ25cbiAqIEBwYXJhbSBwcml2YXRlS2V5IC0gUHJpdmF0ZSBrZXkgaW4gaGV4IGZvcm1hdFxuICogQHJldHVybnMgU2lnbmVkIGV2ZW50XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzaWduRXZlbnQoXG4gIGV2ZW50OiBOb3N0ckV2ZW50LCBcbiAgcHJpdmF0ZUtleTogc3RyaW5nXG4pOiBQcm9taXNlPFNpZ25lZE5vc3RyRXZlbnQ+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBoYXNoID0gYXdhaXQgZ2V0RXZlbnRIYXNoKGV2ZW50KTtcbiAgICBjb25zdCBzaWcgPSBzY2hub3JyLnNpZ24oaGV4VG9CeXRlcyhoYXNoKSwgaGV4VG9CeXRlcyhwcml2YXRlS2V5KSk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmV2ZW50LFxuICAgICAgaWQ6IGhhc2gsXG4gICAgICBzaWc6IGJ5dGVzVG9IZXgoc2lnKSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gc2lnbiBldmVudCcpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhlIHNpZ25hdHVyZSBvZiBhIHNpZ25lZCBOb3N0ciBldmVudCAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gdmVyaWZ5XG4gKiBAcmV0dXJucyBUcnVlIGlmIHNpZ25hdHVyZSBpcyB2YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5U2lnbmF0dXJlKGV2ZW50OiBTaWduZWROb3N0ckV2ZW50KTogYm9vbGVhbiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHNjaG5vcnIudmVyaWZ5KFxuICAgICAgaGV4VG9CeXRlcyhldmVudC5zaWcpLFxuICAgICAgaGV4VG9CeXRlcyhldmVudC5pZCksXG4gICAgICBoZXhUb0J5dGVzKGV2ZW50LnB1YmtleSlcbiAgICApO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gdmVyaWZ5IHNpZ25hdHVyZScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIE5vc3RyIGV2ZW50XG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byB2YWxpZGF0ZVxuICogQHJldHVybnMgVHJ1ZSBpZiBldmVudCBpcyB2YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVFdmVudChldmVudDogU2lnbmVkTm9zdHJFdmVudCk6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIC8vIENoZWNrIHJlcXVpcmVkIGZpZWxkc1xuICAgIGlmICghZXZlbnQuaWQgfHwgIWV2ZW50LnB1YmtleSB8fCAhZXZlbnQuc2lnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gVmVyaWZ5IHNpZ25hdHVyZVxuICAgIHJldHVybiB2ZXJpZnlTaWduYXR1cmUoZXZlbnQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdFcnJvciB2YWxpZGF0aW5nIGV2ZW50Jyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXZlbnQgSUQgZm9yIGEgTm9zdHIgZXZlbnRcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIGNhbGN1bGF0ZSBJRCBmb3JcbiAqIEByZXR1cm5zIEV2ZW50IElEXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVFdmVudElkKGV2ZW50OiBOb3N0ckV2ZW50KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIGdldEV2ZW50SGFzaChldmVudCk7XG59XG4iLCAiLyoqXG4gKiBAbW9kdWxlIG5pcHMvbmlwLTA0XG4gKiBAZGVzY3JpcHRpb24gSW1wbGVtZW50YXRpb24gb2YgTklQLTA0IChFbmNyeXB0ZWQgRGlyZWN0IE1lc3NhZ2VzKVxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wNC5tZFxuICovXG5cbmltcG9ydCB7IHNlY3AyNTZrMSB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbmltcG9ydCB7IGhleFRvQnl0ZXMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XG5pbXBvcnQgeyBieXRlc1RvQmFzZTY0LCBiYXNlNjRUb0J5dGVzIH0gZnJvbSAnLi4vZW5jb2RpbmcvYmFzZTY0JztcbmltcG9ydCB0eXBlIHsgQ3J5cHRvU3VidGxlIH0gZnJvbSAnLi4vY3J5cHRvJztcblxuXG4vLyBDb25maWd1cmUgY3J5cHRvIGZvciBOb2RlLmpzIGFuZCB0ZXN0IGVudmlyb25tZW50c1xuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgV2luZG93IHtcbiAgICBjcnlwdG86IENyeXB0b1N1YnRsZTtcbiAgfVxuICBpbnRlcmZhY2UgR2xvYmFsIHtcbiAgICBjcnlwdG86IENyeXB0b1N1YnRsZTtcbiAgfVxufVxuXG5jb25zdCBnZXRDcnlwdG8gPSBhc3luYyAoKTogUHJvbWlzZTxDcnlwdG9TdWJ0bGU+ID0+IHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5jcnlwdG8pIHtcbiAgICByZXR1cm4gd2luZG93LmNyeXB0bztcbiAgfVxuICBpZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgJiYgKGdsb2JhbCBhcyBHbG9iYWwpLmNyeXB0bykge1xuICAgIHJldHVybiAoZ2xvYmFsIGFzIEdsb2JhbCkuY3J5cHRvO1xuICB9XG4gIHRyeSB7XG4gICAgY29uc3QgY3J5cHRvTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdjcnlwdG8nKTtcbiAgICBpZiAoY3J5cHRvTW9kdWxlLndlYmNyeXB0bykge1xuICAgICAgcmV0dXJuIGNyeXB0b01vZHVsZS53ZWJjcnlwdG8gYXMgQ3J5cHRvU3VidGxlO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdOb2RlIGNyeXB0byBub3QgYXZhaWxhYmxlJyk7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoJ05vIFdlYkNyeXB0byBpbXBsZW1lbnRhdGlvbiBhdmFpbGFibGUnKTtcbn07XG5cbmNsYXNzIENyeXB0b0ltcGxlbWVudGF0aW9uIHtcbiAgcHJpdmF0ZSBjcnlwdG9JbnN0YW5jZTogQ3J5cHRvU3VidGxlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgaW5pdFByb21pc2U6IFByb21pc2U8dm9pZD47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5pbml0UHJvbWlzZSA9IHRoaXMuaW5pdGlhbGl6ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbml0aWFsaXplKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuY3J5cHRvSW5zdGFuY2UgPSBhd2FpdCBnZXRDcnlwdG8oKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZW5zdXJlSW5pdGlhbGl6ZWQoKTogUHJvbWlzZTxDcnlwdG9TdWJ0bGU+IHtcbiAgICBhd2FpdCB0aGlzLmluaXRQcm9taXNlO1xuICAgIGlmICghdGhpcy5jcnlwdG9JbnN0YW5jZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDcnlwdG8gaW1wbGVtZW50YXRpb24gbm90IGluaXRpYWxpemVkJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNyeXB0b0luc3RhbmNlO1xuICB9XG5cbiAgYXN5bmMgZ2V0U3VidGxlKCk6IFByb21pc2U8Q3J5cHRvU3VidGxlWydzdWJ0bGUnXT4ge1xuICAgIGNvbnN0IGNyeXB0byA9IGF3YWl0IHRoaXMuZW5zdXJlSW5pdGlhbGl6ZWQoKTtcbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZTtcbiAgfVxuXG4gIGFzeW5jIGdldFJhbmRvbVZhbHVlczxUIGV4dGVuZHMgVWludDhBcnJheSB8IEludDhBcnJheSB8IFVpbnQxNkFycmF5IHwgSW50MTZBcnJheSB8IFVpbnQzMkFycmF5IHwgSW50MzJBcnJheT4oYXJyYXk6IFQpOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBjcnlwdG8gPSBhd2FpdCB0aGlzLmVuc3VyZUluaXRpYWxpemVkKCk7XG4gICAgcmV0dXJuIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoYXJyYXkpO1xuICB9XG59XG5cbmNvbnN0IGNyeXB0b0ltcGwgPSBuZXcgQ3J5cHRvSW1wbGVtZW50YXRpb24oKTtcblxuaW50ZXJmYWNlIFNoYXJlZFNlY3JldCB7XG4gIHNoYXJlZFNlY3JldDogVWludDhBcnJheTtcbn1cblxuLyoqXG4gKiBFbmNyeXB0cyBhIG1lc3NhZ2UgdXNpbmcgTklQLTA0IGVuY3J5cHRpb25cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBlbmNyeXB0XG4gKiBAcGFyYW0gc2VuZGVyUHJpdktleSAtIFNlbmRlcidzIHByaXZhdGUga2V5XG4gKiBAcGFyYW0gcmVjaXBpZW50UHViS2V5IC0gUmVjaXBpZW50J3MgcHVibGljIGtleVxuICogQHJldHVybnMgRW5jcnlwdGVkIG1lc3NhZ2Ugc3RyaW5nXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0TWVzc2FnZShcbiAgbWVzc2FnZTogc3RyaW5nLFxuICBzZW5kZXJQcml2S2V5OiBzdHJpbmcsXG4gIHJlY2lwaWVudFB1YktleTogc3RyaW5nXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICB0cnkge1xuICAgIGlmICghbWVzc2FnZSB8fCAhc2VuZGVyUHJpdktleSB8fCAhcmVjaXBpZW50UHViS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5wdXQgcGFyYW1ldGVycycpO1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGtleXNcbiAgICBpZiAoIS9eWzAtOWEtZl17NjR9JC9pLnRlc3Qoc2VuZGVyUHJpdktleSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwcml2YXRlIGtleSBmb3JtYXQnKTtcbiAgICB9XG5cbiAgICAvLyBFbnN1cmUgcHVibGljIGtleSBpcyBpbiBjb3JyZWN0IGZvcm1hdFxuICAgIGNvbnN0IHB1YktleUhleCA9IHJlY2lwaWVudFB1YktleS5zdGFydHNXaXRoKCcwMicpIHx8IHJlY2lwaWVudFB1YktleS5zdGFydHNXaXRoKCcwMycpIFxuICAgICAgPyByZWNpcGllbnRQdWJLZXkgXG4gICAgICA6ICcwMicgKyByZWNpcGllbnRQdWJLZXk7XG5cbiAgICAvLyBHZW5lcmF0ZSBzaGFyZWQgc2VjcmV0XG4gICAgY29uc3Qgc2hhcmVkUG9pbnQgPSBzZWNwMjU2azEuZ2V0U2hhcmVkU2VjcmV0KGhleFRvQnl0ZXMoc2VuZGVyUHJpdktleSksIGhleFRvQnl0ZXMocHViS2V5SGV4KSk7XG4gICAgY29uc3Qgc2hhcmVkWCA9IHNoYXJlZFBvaW50LnNsaWNlKDEsIDMzKTsgLy8gVXNlIG9ubHkgeC1jb29yZGluYXRlXG5cbiAgICAvLyBJbXBvcnQga2V5IGZvciBBRVNcbiAgICBjb25zdCBzaGFyZWRLZXkgPSBhd2FpdCAoYXdhaXQgY3J5cHRvSW1wbC5nZXRTdWJ0bGUoKSkuaW1wb3J0S2V5KFxuICAgICAgJ3JhdycsXG4gICAgICBzaGFyZWRYLmJ1ZmZlcixcbiAgICAgIHsgbmFtZTogJ0FFUy1DQkMnLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgZmFsc2UsXG4gICAgICBbJ2VuY3J5cHQnXVxuICAgICk7XG5cbiAgICAvLyBaZXJvIHNoYXJlZCBzZWNyZXQgbWF0ZXJpYWwgbm93IHRoYXQgQUVTIGtleSBpcyBpbXBvcnRlZFxuICAgIHNoYXJlZFguZmlsbCgwKTtcbiAgICBzaGFyZWRQb2ludC5maWxsKDApO1xuXG4gICAgLy8gR2VuZXJhdGUgSVYgYW5kIGVuY3J5cHRcbiAgICBjb25zdCBpdiA9IG5ldyBVaW50OEFycmF5KDE2KTtcbiAgICBhd2FpdCBjcnlwdG9JbXBsLmdldFJhbmRvbVZhbHVlcyhpdik7XG5cbiAgICBjb25zdCBlbmNvZGVkID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKG1lc3NhZ2UpO1xuICAgIGNvbnN0IGVuY3J5cHRlZCA9IGF3YWl0IChhd2FpdCBjcnlwdG9JbXBsLmdldFN1YnRsZSgpKS5lbmNyeXB0KFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGl2IH0sXG4gICAgICBzaGFyZWRLZXksXG4gICAgICBlbmNvZGVkLmJ1ZmZlclxuICAgICk7XG5cbiAgICAvLyBOSVAtMDQgc3RhbmRhcmQgZm9ybWF0OiBiYXNlNjQoY2lwaGVydGV4dCkgKyBcIj9pdj1cIiArIGJhc2U2NChpdilcbiAgICBjb25zdCBjaXBoZXJ0ZXh0QmFzZTY0ID0gYnl0ZXNUb0Jhc2U2NChuZXcgVWludDhBcnJheShlbmNyeXB0ZWQpKTtcbiAgICBjb25zdCBpdkJhc2U2NCA9IGJ5dGVzVG9CYXNlNjQoaXYpO1xuXG4gICAgcmV0dXJuIGNpcGhlcnRleHRCYXNlNjQgKyAnP2l2PScgKyBpdkJhc2U2NDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGVuY3J5cHQgbWVzc2FnZScpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogRGVjcnlwdHMgYSBtZXNzYWdlIHVzaW5nIE5JUC0wNCBkZWNyeXB0aW9uXG4gKiBAcGFyYW0gZW5jcnlwdGVkTWVzc2FnZSAtIEVuY3J5cHRlZCBtZXNzYWdlIHN0cmluZ1xuICogQHBhcmFtIHJlY2lwaWVudFByaXZLZXkgLSBSZWNpcGllbnQncyBwcml2YXRlIGtleVxuICogQHBhcmFtIHNlbmRlclB1YktleSAtIFNlbmRlcidzIHB1YmxpYyBrZXlcbiAqIEByZXR1cm5zIERlY3J5cHRlZCBtZXNzYWdlIHN0cmluZ1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdE1lc3NhZ2UoXG4gIGVuY3J5cHRlZE1lc3NhZ2U6IHN0cmluZyxcbiAgcmVjaXBpZW50UHJpdktleTogc3RyaW5nLFxuICBzZW5kZXJQdWJLZXk6IHN0cmluZ1xuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBpZiAoIWVuY3J5cHRlZE1lc3NhZ2UgfHwgIXJlY2lwaWVudFByaXZLZXkgfHwgIXNlbmRlclB1YktleSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0IHBhcmFtZXRlcnMnKTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBrZXlzXG4gICAgaWYgKCEvXlswLTlhLWZdezY0fSQvaS50ZXN0KHJlY2lwaWVudFByaXZLZXkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcHJpdmF0ZSBrZXkgZm9ybWF0Jyk7XG4gICAgfVxuXG4gICAgLy8gRW5zdXJlIHB1YmxpYyBrZXkgaXMgaW4gY29ycmVjdCBmb3JtYXRcbiAgICBjb25zdCBwdWJLZXlIZXggPSBzZW5kZXJQdWJLZXkuc3RhcnRzV2l0aCgnMDInKSB8fCBzZW5kZXJQdWJLZXkuc3RhcnRzV2l0aCgnMDMnKVxuICAgICAgPyBzZW5kZXJQdWJLZXlcbiAgICAgIDogJzAyJyArIHNlbmRlclB1YktleTtcblxuICAgIC8vIEdlbmVyYXRlIHNoYXJlZCBzZWNyZXRcbiAgICBjb25zdCBzaGFyZWRQb2ludCA9IHNlY3AyNTZrMS5nZXRTaGFyZWRTZWNyZXQoaGV4VG9CeXRlcyhyZWNpcGllbnRQcml2S2V5KSwgaGV4VG9CeXRlcyhwdWJLZXlIZXgpKTtcbiAgICBjb25zdCBzaGFyZWRYID0gc2hhcmVkUG9pbnQuc2xpY2UoMSwgMzMpOyAvLyBVc2Ugb25seSB4LWNvb3JkaW5hdGVcblxuICAgIC8vIEltcG9ydCBrZXkgZm9yIEFFU1xuICAgIGNvbnN0IHNoYXJlZEtleSA9IGF3YWl0IChhd2FpdCBjcnlwdG9JbXBsLmdldFN1YnRsZSgpKS5pbXBvcnRLZXkoXG4gICAgICAncmF3JyxcbiAgICAgIHNoYXJlZFguYnVmZmVyLFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGxlbmd0aDogMjU2IH0sXG4gICAgICBmYWxzZSxcbiAgICAgIFsnZGVjcnlwdCddXG4gICAgKTtcblxuICAgIC8vIFplcm8gc2hhcmVkIHNlY3JldCBtYXRlcmlhbCBub3cgdGhhdCBBRVMga2V5IGlzIGltcG9ydGVkXG4gICAgc2hhcmVkWC5maWxsKDApO1xuICAgIHNoYXJlZFBvaW50LmZpbGwoMCk7XG5cbiAgICAvLyBQYXJzZSBOSVAtMDQgc3RhbmRhcmQgZm9ybWF0OiBiYXNlNjQoY2lwaGVydGV4dCkgKyBcIj9pdj1cIiArIGJhc2U2NChpdilcbiAgICAvLyBBbHNvIHN1cHBvcnQgbGVnYWN5IGhleCBmb3JtYXQgKGl2ICsgY2lwaGVydGV4dCBjb25jYXRlbmF0ZWQpIGFzIGZhbGxiYWNrXG4gICAgbGV0IGl2OiBVaW50OEFycmF5O1xuICAgIGxldCBjaXBoZXJ0ZXh0OiBVaW50OEFycmF5O1xuXG4gICAgaWYgKGVuY3J5cHRlZE1lc3NhZ2UuaW5jbHVkZXMoJz9pdj0nKSkge1xuICAgICAgLy8gTklQLTA0IHN0YW5kYXJkIGZvcm1hdFxuICAgICAgY29uc3QgW2NpcGhlcnRleHRCYXNlNjQsIGl2QmFzZTY0XSA9IGVuY3J5cHRlZE1lc3NhZ2Uuc3BsaXQoJz9pdj0nKTtcbiAgICAgIGNpcGhlcnRleHQgPSBiYXNlNjRUb0J5dGVzKGNpcGhlcnRleHRCYXNlNjQpO1xuICAgICAgaXYgPSBiYXNlNjRUb0J5dGVzKGl2QmFzZTY0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTGVnYWN5IGhleCBmb3JtYXQgZmFsbGJhY2s6IGZpcnN0IDE2IGJ5dGVzIGFyZSBJViwgcmVzdCBpcyBjaXBoZXJ0ZXh0XG4gICAgICBjb25zdCBlbmNyeXB0ZWQgPSBoZXhUb0J5dGVzKGVuY3J5cHRlZE1lc3NhZ2UpO1xuICAgICAgaXYgPSBlbmNyeXB0ZWQuc2xpY2UoMCwgMTYpO1xuICAgICAgY2lwaGVydGV4dCA9IGVuY3J5cHRlZC5zbGljZSgxNik7XG4gICAgfVxuXG4gICAgLy8gRGVjcnlwdFxuICAgIGNvbnN0IGRlY3J5cHRlZCA9IGF3YWl0IChhd2FpdCBjcnlwdG9JbXBsLmdldFN1YnRsZSgpKS5kZWNyeXB0KFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGl2IH0sXG4gICAgICBzaGFyZWRLZXksXG4gICAgICBjaXBoZXJ0ZXh0LmJ1ZmZlciBhcyBBcnJheUJ1ZmZlclxuICAgICk7XG5cbiAgICByZXR1cm4gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGRlY3J5cHRlZCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBkZWNyeXB0IG1lc3NhZ2UnKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHNoYXJlZCBzZWNyZXQgZm9yIE5JUC0wNCBlbmNyeXB0aW9uXG4gKiBAcGFyYW0gcHJpdmF0ZUtleSAtIFByaXZhdGUga2V5XG4gKiBAcGFyYW0gcHVibGljS2V5IC0gUHVibGljIGtleVxuICogQHJldHVybnMgU2hhcmVkIHNlY3JldFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTaGFyZWRTZWNyZXQoXG4gIHByaXZhdGVLZXk6IHN0cmluZyxcbiAgcHVibGljS2V5OiBzdHJpbmdcbik6IFNoYXJlZFNlY3JldCB7XG4gIHRyeSB7XG4gICAgaWYgKCFwcml2YXRlS2V5IHx8ICFwdWJsaWNLZXkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnB1dCBwYXJhbWV0ZXJzJyk7XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUga2V5c1xuICAgIGlmICghL15bMC05YS1mXXs2NH0kL2kudGVzdChwcml2YXRlS2V5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHByaXZhdGUga2V5IGZvcm1hdCcpO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSBwdWJsaWMga2V5IGlzIGluIGNvcnJlY3QgZm9ybWF0XG4gICAgY29uc3QgcHViS2V5SGV4ID0gcHVibGljS2V5LnN0YXJ0c1dpdGgoJzAyJykgfHwgcHVibGljS2V5LnN0YXJ0c1dpdGgoJzAzJylcbiAgICAgID8gcHVibGljS2V5XG4gICAgICA6ICcwMicgKyBwdWJsaWNLZXk7XG5cbiAgICAvLyBHZW5lcmF0ZSBzaGFyZWQgc2VjcmV0XG4gICAgY29uc3Qgc2hhcmVkUG9pbnQgPSBzZWNwMjU2azEuZ2V0U2hhcmVkU2VjcmV0KGhleFRvQnl0ZXMocHJpdmF0ZUtleSksIGhleFRvQnl0ZXMocHViS2V5SGV4KSk7XG4gICAgcmV0dXJuIHsgc2hhcmVkU2VjcmV0OiBzaGFyZWRQb2ludC5zbGljZSgxLCAzMykgfTsgLy8gUmV0dXJuIG9ubHkgeC1jb29yZGluYXRlXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBnZW5lcmF0ZSBzaGFyZWQgc2VjcmV0Jyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuZXhwb3J0IHsgZ2VuZXJhdGVTaGFyZWRTZWNyZXQgYXMgY29tcHV0ZVNoYXJlZFNlY3JldCB9O1xuIiwgIi8qKlxuICogQG1vZHVsZSBuaXBzL25pcC0wMVxuICogQGRlc2NyaXB0aW9uIEltcGxlbWVudGF0aW9uIG9mIE5JUC0wMTogQmFzaWMgUHJvdG9jb2wgRmxvdyBEZXNjcmlwdGlvblxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMS5tZFxuICovXG5cbmltcG9ydCB7IHNjaG5vcnIgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG5pbXBvcnQgeyBzaGEyNTYgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3NoYTIuanMnO1xuaW1wb3J0IHsgYnl0ZXNUb0hleCwgaGV4VG9CeXRlcyB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcbmltcG9ydCB0eXBlIHsgTm9zdHJFdmVudCwgU2lnbmVkTm9zdHJFdmVudCB9IGZyb20gJy4uL3R5cGVzJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IE5vc3RyIGV2ZW50IHdpdGggdGhlIHNwZWNpZmllZCBwYXJhbWV0ZXJzIChOSVAtMDEpXG4gKiBAcGFyYW0gcGFyYW1zIC0gRXZlbnQgcGFyYW1ldGVyc1xuICogQHJldHVybnMgQ3JlYXRlZCBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXZlbnQocGFyYW1zOiB7XG4gIGtpbmQ6IG51bWJlcjtcbiAgY29udGVudDogc3RyaW5nO1xuICB0YWdzPzogc3RyaW5nW11bXTtcbiAgY3JlYXRlZF9hdD86IG51bWJlcjtcbiAgcHVia2V5Pzogc3RyaW5nO1xufSk6IE5vc3RyRXZlbnQge1xuICBjb25zdCB7IFxuICAgIGtpbmQsIFxuICAgIGNvbnRlbnQsIFxuICAgIHRhZ3MgPSBbXSwgXG4gICAgY3JlYXRlZF9hdCA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApLCBcbiAgICBwdWJrZXkgPSAnJyBcbiAgfSA9IHBhcmFtcztcbiAgXG4gIHJldHVybiB7XG4gICAga2luZCxcbiAgICBjb250ZW50LFxuICAgIHRhZ3MsXG4gICAgY3JlYXRlZF9hdCxcbiAgICBwdWJrZXksXG4gIH07XG59XG5cbi8qKlxuICogU2VyaWFsaXplcyBhIE5vc3RyIGV2ZW50IGZvciBzaWduaW5nL2hhc2hpbmcgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIHNlcmlhbGl6ZVxuICogQHJldHVybnMgU2VyaWFsaXplZCBldmVudCBKU09OIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplRXZlbnQoZXZlbnQ6IE5vc3RyRXZlbnQpOiBzdHJpbmcge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoW1xuICAgIDAsXG4gICAgZXZlbnQucHVia2V5LFxuICAgIGV2ZW50LmNyZWF0ZWRfYXQsXG4gICAgZXZlbnQua2luZCxcbiAgICBldmVudC50YWdzLFxuICAgIGV2ZW50LmNvbnRlbnRcbiAgXSk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgaGFzaCBvZiBhIE5vc3RyIGV2ZW50IChOSVAtMDEpXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byBoYXNoXG4gKiBAcmV0dXJucyBFdmVudCBoYXNoIGluIGhleCBmb3JtYXRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEV2ZW50SGFzaChldmVudDogTm9zdHJFdmVudCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2VyaWFsaXplZCA9IHNlcmlhbGl6ZUV2ZW50KGV2ZW50KTtcbiAgICBjb25zdCBoYXNoID0gc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZXJpYWxpemVkKSk7XG4gICAgcmV0dXJuIGJ5dGVzVG9IZXgoaGFzaCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBnZXQgZXZlbnQgaGFzaCcpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogU2lnbnMgYSBOb3N0ciBldmVudCB3aXRoIGEgcHJpdmF0ZSBrZXkgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIHNpZ25cbiAqIEBwYXJhbSBwcml2YXRlS2V5IC0gUHJpdmF0ZSBrZXkgaW4gaGV4IGZvcm1hdFxuICogQHJldHVybnMgU2lnbmVkIGV2ZW50XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzaWduRXZlbnQoXG4gIGV2ZW50OiBOb3N0ckV2ZW50LCBcbiAgcHJpdmF0ZUtleTogc3RyaW5nXG4pOiBQcm9taXNlPFNpZ25lZE5vc3RyRXZlbnQ+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBoYXNoID0gYXdhaXQgZ2V0RXZlbnRIYXNoKGV2ZW50KTtcbiAgICBjb25zdCBzaWcgPSBzY2hub3JyLnNpZ24oaGV4VG9CeXRlcyhoYXNoKSwgaGV4VG9CeXRlcyhwcml2YXRlS2V5KSk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmV2ZW50LFxuICAgICAgaWQ6IGhhc2gsXG4gICAgICBzaWc6IGJ5dGVzVG9IZXgoc2lnKSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gc2lnbiBldmVudCcpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhlIHNpZ25hdHVyZSBvZiBhIHNpZ25lZCBOb3N0ciBldmVudCAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gdmVyaWZ5XG4gKiBAcmV0dXJucyBUcnVlIGlmIHNpZ25hdHVyZSBpcyB2YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5U2lnbmF0dXJlKGV2ZW50OiBTaWduZWROb3N0ckV2ZW50KTogYm9vbGVhbiB7XG4gIHRyeSB7XG4gICAgLy8gVmVyaWZ5IGV2ZW50IElEXG4gICAgY29uc3QgZXhwZWN0ZWRJZCA9IGNhbGN1bGF0ZUV2ZW50SWQoZXZlbnQpO1xuICAgIGlmIChldmVudC5pZCAhPT0gZXhwZWN0ZWRJZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFZlcmlmeSBzaWduYXR1cmVcbiAgICByZXR1cm4gc2Nobm9yci52ZXJpZnkoXG4gICAgICBoZXhUb0J5dGVzKGV2ZW50LnNpZyksXG4gICAgICBoZXhUb0J5dGVzKGV2ZW50LmlkKSxcbiAgICAgIGhleFRvQnl0ZXMoZXZlbnQucHVia2V5KVxuICAgICk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2ZXJpZnkgc2lnbmF0dXJlJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXZlbnQgSUQgYWNjb3JkaW5nIHRvIE5JUC0wMVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gY2FsY3VsYXRlIElEIGZvclxuICogQHJldHVybnMgRXZlbnQgSUQgaW4gaGV4IGZvcm1hdFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlRXZlbnRJZChldmVudDogTm9zdHJFdmVudCk6IHN0cmluZyB7XG4gIGNvbnN0IHNlcmlhbGl6ZWQgPSBzZXJpYWxpemVFdmVudChldmVudCk7XG4gIGNvbnN0IGhhc2ggPSBzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlcmlhbGl6ZWQpKTtcbiAgcmV0dXJuIGJ5dGVzVG9IZXgoaGFzaCk7XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgTm9zdHIgZXZlbnQgc3RydWN0dXJlIChOSVAtMDEpXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byB2YWxpZGF0ZVxuICogQHJldHVybnMgVHJ1ZSBpZiBldmVudCBzdHJ1Y3R1cmUgaXMgdmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRXZlbnQoZXZlbnQ6IE5vc3RyRXZlbnQpOiBib29sZWFuIHtcbiAgdHJ5IHtcbiAgICBpZiAodHlwZW9mIGV2ZW50LmNvbnRlbnQgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHR5cGVvZiBldmVudC5jcmVhdGVkX2F0ICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICAgIGlmICh0eXBlb2YgZXZlbnQua2luZCAhPT0gJ251bWJlcicpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZXZlbnQudGFncykpIHJldHVybiBmYWxzZTtcbiAgICBpZiAodHlwZW9mIGV2ZW50LnB1YmtleSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICBcbiAgICAvLyBWYWxpZGF0ZSB0YWdzIHN0cnVjdHVyZVxuICAgIGZvciAoY29uc3QgdGFnIG9mIGV2ZW50LnRhZ3MpIHtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheSh0YWcpKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAodGFnLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKHR5cGVvZiB0YWdbMF0gIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gdmFsaWRhdGUgZXZlbnQnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiIsICIvKipcbiAqIE5JUC0xOTogYmVjaDMyLWVuY29kZWQgZW50aXRpZXNcbiAqIEltcGxlbWVudHMgZW5jb2RpbmcgYW5kIGRlY29kaW5nIG9mIE5vc3RyIGVudGl0aWVzIHVzaW5nIGJlY2gzMiBmb3JtYXRcbiAqL1xuXG5pbXBvcnQgeyBiZWNoMzIgfSBmcm9tICdiZWNoMzInO1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyJztcblxuZXhwb3J0IHR5cGUgTmlwMTlEYXRhVHlwZSA9ICducHViJyB8ICduc2VjJyB8ICdub3RlJyB8ICducHJvZmlsZScgfCAnbmV2ZW50JyB8ICduYWRkcicgfCAnbnJlbGF5JztcblxuY29uc3QgVkFMSURfUFJFRklYRVM6IE5pcDE5RGF0YVR5cGVbXSA9IFsnbnB1YicsICduc2VjJywgJ25vdGUnLCAnbnByb2ZpbGUnLCAnbmV2ZW50JywgJ25hZGRyJywgJ25yZWxheSddO1xuXG5leHBvcnQgaW50ZXJmYWNlIE5pcDE5RGF0YSB7XG4gIHR5cGU6IE5pcDE5RGF0YVR5cGU7XG4gIGRhdGE6IHN0cmluZztcbiAgcmVsYXlzPzogc3RyaW5nW107XG4gIGF1dGhvcj86IHN0cmluZztcbiAga2luZD86IG51bWJlcjtcbiAgaWRlbnRpZmllcj86IHN0cmluZzsgLy8gRm9yIG5hZGRyXG59XG5cbi8vIFRMViB0eXBlIGNvbnN0YW50c1xuY29uc3QgVExWX1RZUEVTID0ge1xuICBTUEVDSUFMOiAwLCAgIC8vIE1haW4gZGF0YSAoaGV4KVxuICBSRUxBWTogMSwgICAgIC8vIFJlbGF5IFVSTCAodXRmOClcbiAgQVVUSE9SOiAyLCAgICAvLyBBdXRob3IgcHVia2V5IChoZXgpXG4gIEtJTkQ6IDMsICAgICAgLy8gRXZlbnQga2luZCAodWludDgpXG4gIElERU5USUZJRVI6IDQgLy8gSWRlbnRpZmllciAodXRmOClcbn0gYXMgY29uc3Q7XG5cbi8qKlxuICogRW5jb2RlIGEgcHVibGljIGtleSBhcyBhbiBucHViXG4gKiBAcGFyYW0gcHVia2V5IFB1YmxpYyBrZXkgaW4gaGV4IGZvcm1hdFxuICogQHJldHVybnMgYmVjaDMyLWVuY29kZWQgbnB1YiBzdHJpbmdcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBwdWJrZXkgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbnB1YkVuY29kZShwdWJrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gIHZhbGlkYXRlSGV4U3RyaW5nKHB1YmtleSwgNjQpO1xuICBjb25zdCBkYXRhID0gQnVmZmVyLmZyb20ocHVia2V5LCAnaGV4Jyk7XG4gIGNvbnN0IHdvcmRzID0gYmVjaDMyLnRvV29yZHMoZGF0YSk7XG4gIHJldHVybiBiZWNoMzIuZW5jb2RlKCducHViJywgd29yZHMsIDEwMDApO1xufVxuXG4vKipcbiAqIEVuY29kZSBhIHByaXZhdGUga2V5IGFzIGFuIG5zZWNcbiAqIEBwYXJhbSBwcml2a2V5IFByaXZhdGUga2V5IGluIGhleCBmb3JtYXRcbiAqIEByZXR1cm5zIGJlY2gzMi1lbmNvZGVkIG5zZWMgc3RyaW5nXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgcHJpdmtleSBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuc2VjRW5jb2RlKHByaXZrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gIHZhbGlkYXRlSGV4U3RyaW5nKHByaXZrZXksIDY0KTtcbiAgY29uc3QgZGF0YSA9IEJ1ZmZlci5mcm9tKHByaXZrZXksICdoZXgnKTtcbiAgY29uc3Qgd29yZHMgPSBiZWNoMzIudG9Xb3JkcyhkYXRhKTtcbiAgcmV0dXJuIGJlY2gzMi5lbmNvZGUoJ25zZWMnLCB3b3JkcywgMTAwMCk7XG59XG5cbi8qKlxuICogRW5jb2RlIGFuIGV2ZW50IElEIGFzIGEgbm90ZVxuICogQHBhcmFtIGV2ZW50SWQgRXZlbnQgSUQgaW4gaGV4IGZvcm1hdFxuICogQHJldHVybnMgYmVjaDMyLWVuY29kZWQgbm90ZSBzdHJpbmdcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBldmVudElkIGlzIGludmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vdGVFbmNvZGUoZXZlbnRJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVIZXhTdHJpbmcoZXZlbnRJZCwgNjQpO1xuICBjb25zdCBkYXRhID0gQnVmZmVyLmZyb20oZXZlbnRJZCwgJ2hleCcpO1xuICBjb25zdCB3b3JkcyA9IGJlY2gzMi50b1dvcmRzKGRhdGEpO1xuICByZXR1cm4gYmVjaDMyLmVuY29kZSgnbm90ZScsIHdvcmRzLCAxMDAwKTtcbn1cblxuLyoqXG4gKiBFbmNvZGUgcHJvZmlsZSBpbmZvcm1hdGlvblxuICogQHBhcmFtIHB1YmtleSBQdWJsaWMga2V5IGluIGhleCBmb3JtYXRcbiAqIEBwYXJhbSByZWxheXMgT3B0aW9uYWwgcmVsYXkgVVJMc1xuICogQHJldHVybnMgYmVjaDMyLWVuY29kZWQgbnByb2ZpbGUgc3RyaW5nXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgcHVia2V5IGlzIGludmFsaWQgb3IgcmVsYXlzIGFyZSBtYWxmb3JtZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5wcm9maWxlRW5jb2RlKHB1YmtleTogc3RyaW5nLCByZWxheXM/OiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gIHZhbGlkYXRlSGV4U3RyaW5nKHB1YmtleSwgNjQpO1xuICBpZiAocmVsYXlzKSB7XG4gICAgcmVsYXlzLmZvckVhY2godmFsaWRhdGVSZWxheVVybCk7XG4gIH1cblxuICBjb25zdCBkYXRhID0gZW5jb2RlVExWKHtcbiAgICB0eXBlOiAnbnByb2ZpbGUnLFxuICAgIGRhdGE6IHB1YmtleSxcbiAgICByZWxheXNcbiAgfSk7XG4gIHJldHVybiBiZWNoMzIuZW5jb2RlKCducHJvZmlsZScsIGRhdGEsIDEwMDApO1xufVxuXG4vKipcbiAqIEVuY29kZSBldmVudCBpbmZvcm1hdGlvblxuICogQHBhcmFtIGV2ZW50SWQgRXZlbnQgSUQgaW4gaGV4IGZvcm1hdFxuICogQHBhcmFtIHJlbGF5cyBPcHRpb25hbCByZWxheSBVUkxzXG4gKiBAcGFyYW0gYXV0aG9yIE9wdGlvbmFsIGF1dGhvciBwdWJsaWMga2V5XG4gKiBAcGFyYW0ga2luZCBPcHRpb25hbCBldmVudCBraW5kXG4gKiBAcmV0dXJucyBiZWNoMzItZW5jb2RlZCBuZXZlbnQgc3RyaW5nXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgcGFyYW1ldGVycyBhcmUgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmV2ZW50RW5jb2RlKFxuICBldmVudElkOiBzdHJpbmcsXG4gIHJlbGF5cz86IHN0cmluZ1tdLFxuICBhdXRob3I/OiBzdHJpbmcsXG4gIGtpbmQ/OiBudW1iZXJcbik6IHN0cmluZyB7XG4gIHZhbGlkYXRlSGV4U3RyaW5nKGV2ZW50SWQsIDY0KTtcbiAgaWYgKHJlbGF5cykge1xuICAgIHJlbGF5cy5mb3JFYWNoKHZhbGlkYXRlUmVsYXlVcmwpO1xuICB9XG4gIGlmIChhdXRob3IpIHtcbiAgICB2YWxpZGF0ZUhleFN0cmluZyhhdXRob3IsIDY0KTtcbiAgfVxuICBpZiAoa2luZCAhPT0gdW5kZWZpbmVkICYmICFOdW1iZXIuaXNJbnRlZ2VyKGtpbmQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGV2ZW50IGtpbmQnKTtcbiAgfVxuXG4gIGNvbnN0IGRhdGEgPSBlbmNvZGVUTFYoe1xuICAgIHR5cGU6ICduZXZlbnQnLFxuICAgIGRhdGE6IGV2ZW50SWQsXG4gICAgcmVsYXlzLFxuICAgIGF1dGhvcixcbiAgICBraW5kXG4gIH0pO1xuICByZXR1cm4gYmVjaDMyLmVuY29kZSgnbmV2ZW50JywgZGF0YSwgMTAwMCk7XG59XG5cbi8qKlxuICogRW5jb2RlIGFuIGFkZHJlc3MgKE5JUC0zMylcbiAqIEBwYXJhbSBwdWJrZXkgQXV0aG9yJ3MgcHVibGljIGtleVxuICogQHBhcmFtIGtpbmQgRXZlbnQga2luZFxuICogQHBhcmFtIGlkZW50aWZpZXIgU3RyaW5nIGlkZW50aWZpZXJcbiAqIEBwYXJhbSByZWxheXMgT3B0aW9uYWwgcmVsYXkgVVJMc1xuICogQHJldHVybnMgYmVjaDMyLWVuY29kZWQgbmFkZHIgc3RyaW5nXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgcGFyYW1ldGVycyBhcmUgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmFkZHJFbmNvZGUoXG4gIHB1YmtleTogc3RyaW5nLFxuICBraW5kOiBudW1iZXIsXG4gIGlkZW50aWZpZXI6IHN0cmluZyxcbiAgcmVsYXlzPzogc3RyaW5nW11cbik6IHN0cmluZyB7XG4gIHZhbGlkYXRlSGV4U3RyaW5nKHB1YmtleSwgNjQpO1xuICBpZiAoIU51bWJlci5pc0ludGVnZXIoa2luZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZXZlbnQga2luZCcpO1xuICB9XG4gIGlmICghaWRlbnRpZmllcikge1xuICAgIHRocm93IG5ldyBFcnJvcignSWRlbnRpZmllciBpcyByZXF1aXJlZCcpO1xuICB9XG4gIGlmIChyZWxheXMpIHtcbiAgICByZWxheXMuZm9yRWFjaCh2YWxpZGF0ZVJlbGF5VXJsKTtcbiAgfVxuXG4gIGNvbnN0IGRhdGEgPSBlbmNvZGVUTFYoe1xuICAgIHR5cGU6ICduYWRkcicsXG4gICAgZGF0YTogcHVia2V5LFxuICAgIGtpbmQsXG4gICAgaWRlbnRpZmllcixcbiAgICByZWxheXNcbiAgfSk7XG4gIHJldHVybiBiZWNoMzIuZW5jb2RlKCduYWRkcicsIGRhdGEsIDEwMDApO1xufVxuXG4vKipcbiAqIEVuY29kZSBhIHJlbGF5IFVSTFxuICogQHBhcmFtIHVybCBSZWxheSBVUkxcbiAqIEByZXR1cm5zIGJlY2gzMi1lbmNvZGVkIG5yZWxheSBzdHJpbmdcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBVUkwgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbnJlbGF5RW5jb2RlKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVSZWxheVVybCh1cmwpO1xuICBjb25zdCBkYXRhID0gQnVmZmVyLmZyb20odXJsLCAndXRmOCcpO1xuICBjb25zdCB3b3JkcyA9IGJlY2gzMi50b1dvcmRzKGRhdGEpO1xuICByZXR1cm4gYmVjaDMyLmVuY29kZSgnbnJlbGF5Jywgd29yZHMsIDEwMDApO1xufVxuXG4vKipcbiAqIERlY29kZSBhIGJlY2gzMi1lbmNvZGVkIE5vc3RyIGVudGl0eVxuICogQHBhcmFtIHN0ciBiZWNoMzItZW5jb2RlZCBzdHJpbmdcbiAqIEByZXR1cm5zIERlY29kZWQgZGF0YSB3aXRoIHR5cGUgYW5kIG1ldGFkYXRhXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgc3RyaW5nIGlzIGludmFsaWQgb3IgbWFsZm9ybWVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGUoc3RyOiBzdHJpbmcpOiBOaXAxOURhdGEge1xuICBpZiAoIXN0ci5pbmNsdWRlcygnMScpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJlY2gzMiBzdHJpbmcnKTtcbiAgfVxuXG4gIGNvbnN0IHByZWZpeCA9IHN0ci5zcGxpdCgnMScpWzBdLnRvTG93ZXJDYXNlKCk7XG4gIGlmICghVkFMSURfUFJFRklYRVMuaW5jbHVkZXMocHJlZml4IGFzIE5pcDE5RGF0YVR5cGUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHByZWZpeCcpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBkZWNvZGVkID0gYmVjaDMyLmRlY29kZShzdHIsIDEwMDApO1xuICAgIGNvbnN0IGRhdGEgPSBCdWZmZXIuZnJvbShiZWNoMzIuZnJvbVdvcmRzKGRlY29kZWQud29yZHMpKTtcblxuICAgIC8vIEZvciBucmVsYXkgdHlwZVxuICAgIGxldCB1cmw6IHN0cmluZztcbiAgICAvLyBGb3IgVExWIHR5cGVzXG4gICAgbGV0IGRlY29kZWREYXRhOiBOaXAxOURhdGE7XG5cbiAgICBzd2l0Y2ggKGRlY29kZWQucHJlZml4KSB7XG4gICAgICBjYXNlICducHViJzpcbiAgICAgIGNhc2UgJ25zZWMnOlxuICAgICAgY2FzZSAnbm90ZSc6XG4gICAgICAgIHZhbGlkYXRlSGV4U3RyaW5nKGRhdGEudG9TdHJpbmcoJ2hleCcpLCA2NCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdHlwZTogZGVjb2RlZC5wcmVmaXggYXMgTmlwMTlEYXRhVHlwZSxcbiAgICAgICAgICBkYXRhOiBkYXRhLnRvU3RyaW5nKCdoZXgnKVxuICAgICAgICB9O1xuICAgICAgY2FzZSAnbnJlbGF5JzpcbiAgICAgICAgdXJsID0gZGF0YS50b1N0cmluZygndXRmOCcpO1xuICAgICAgICB2YWxpZGF0ZVJlbGF5VXJsKHVybCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdHlwZTogJ25yZWxheScsXG4gICAgICAgICAgZGF0YTogdXJsXG4gICAgICAgIH07XG4gICAgICBjYXNlICducHJvZmlsZSc6XG4gICAgICBjYXNlICduZXZlbnQnOlxuICAgICAgY2FzZSAnbmFkZHInOlxuICAgICAgICBkZWNvZGVkRGF0YSA9IGRlY29kZVRMVihkZWNvZGVkLnByZWZpeCBhcyBOaXAxOURhdGFUeXBlLCBkYXRhKTtcbiAgICAgICAgcmV0dXJuIGRlY29kZWREYXRhO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHByZWZpeCcpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBiZWNoMzIgc3RyaW5nJyk7XG4gIH1cbn1cblxuLy8gSGVscGVyIGZ1bmN0aW9uc1xuXG5mdW5jdGlvbiB2YWxpZGF0ZUhleFN0cmluZyhzdHI6IHN0cmluZywgbGVuZ3RoPzogbnVtYmVyKTogdm9pZCB7XG4gIGlmICghL15bMC05YS1mQS1GXSskLy50ZXN0KHN0cikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaGV4IHN0cmluZycpO1xuICB9XG4gIGlmIChsZW5ndGggJiYgc3RyLmxlbmd0aCAhPT0gbGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGhleCBzdHJpbmcgbGVuZ3RoIChleHBlY3RlZCAke2xlbmd0aH0pYCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVSZWxheVVybCh1cmw6IHN0cmluZyk6IHZvaWQge1xuICB0cnkge1xuICAgIGNvbnN0IHBhcnNlZCA9IG5ldyBVUkwodXJsKTtcbiAgICBpZiAoIVsnd3M6JywgJ3dzczonXS5pbmNsdWRlcyhwYXJzZWQucHJvdG9jb2wpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcmVsYXkgVVJMIHByb3RvY29sJyk7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcmVsYXkgVVJMJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZW5jb2RlVExWKGRhdGE6IE5pcDE5RGF0YSk6IG51bWJlcltdIHtcbiAgY29uc3QgcmVzdWx0OiBudW1iZXJbXSA9IFtdO1xuICBcbiAgLy8gU3BlY2lhbCAodHlwZSAwKTogbWFpbiBkYXRhXG4gIGNvbnN0IGJ5dGVzID0gQnVmZmVyLmZyb20oZGF0YS5kYXRhLCAnaGV4Jyk7XG4gIHJlc3VsdC5wdXNoKFRMVl9UWVBFUy5TUEVDSUFMLCBieXRlcy5sZW5ndGgpO1xuICByZXN1bHQucHVzaCguLi5ieXRlcyk7XG5cbiAgLy8gUmVsYXkgKHR5cGUgMSk6IHJlbGF5IFVSTHNcbiAgaWYgKGRhdGEucmVsYXlzPy5sZW5ndGgpIHtcbiAgICBmb3IgKGNvbnN0IHJlbGF5IG9mIGRhdGEucmVsYXlzKSB7XG4gICAgICBjb25zdCByZWxheUJ5dGVzID0gQnVmZmVyLmZyb20ocmVsYXksICd1dGY4Jyk7XG4gICAgICByZXN1bHQucHVzaChUTFZfVFlQRVMuUkVMQVksIHJlbGF5Qnl0ZXMubGVuZ3RoKTtcbiAgICAgIHJlc3VsdC5wdXNoKC4uLnJlbGF5Qnl0ZXMpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEF1dGhvciAodHlwZSAyKTogYXV0aG9yIHB1YmtleVxuICBpZiAoZGF0YS5hdXRob3IpIHtcbiAgICBjb25zdCBhdXRob3JCeXRlcyA9IEJ1ZmZlci5mcm9tKGRhdGEuYXV0aG9yLCAnaGV4Jyk7XG4gICAgcmVzdWx0LnB1c2goVExWX1RZUEVTLkFVVEhPUiwgYXV0aG9yQnl0ZXMubGVuZ3RoKTtcbiAgICByZXN1bHQucHVzaCguLi5hdXRob3JCeXRlcyk7XG4gIH1cblxuICAvLyBLaW5kICh0eXBlIDMpOiBldmVudCBraW5kXG4gIGlmIChkYXRhLmtpbmQgIT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IGtpbmRCeXRlcyA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICBraW5kQnl0ZXMud3JpdGVVSW50MzJCRShkYXRhLmtpbmQpO1xuICAgIHJlc3VsdC5wdXNoKFRMVl9UWVBFUy5LSU5ELCBraW5kQnl0ZXMubGVuZ3RoKTtcbiAgICByZXN1bHQucHVzaCguLi5raW5kQnl0ZXMpO1xuICB9XG5cbiAgLy8gSWRlbnRpZmllciAodHlwZSA0KTogZm9yIG5hZGRyXG4gIGlmIChkYXRhLmlkZW50aWZpZXIpIHtcbiAgICBjb25zdCBpZGVudGlmaWVyQnl0ZXMgPSBCdWZmZXIuZnJvbShkYXRhLmlkZW50aWZpZXIsICd1dGY4Jyk7XG4gICAgcmVzdWx0LnB1c2goVExWX1RZUEVTLklERU5USUZJRVIsIGlkZW50aWZpZXJCeXRlcy5sZW5ndGgpO1xuICAgIHJlc3VsdC5wdXNoKC4uLmlkZW50aWZpZXJCeXRlcyk7XG4gIH1cblxuICByZXR1cm4gYmVjaDMyLnRvV29yZHMoQnVmZmVyLmZyb20ocmVzdWx0KSk7XG59XG5cbmZ1bmN0aW9uIGRlY29kZVRMVihwcmVmaXg6IE5pcDE5RGF0YVR5cGUsIGRhdGE6IEJ1ZmZlcik6IE5pcDE5RGF0YSB7XG4gIGNvbnN0IHJlc3VsdDogTmlwMTlEYXRhID0ge1xuICAgIHR5cGU6IHByZWZpeCxcbiAgICBkYXRhOiAnJyxcbiAgICByZWxheXM6IFtdXG4gIH07XG5cbiAgbGV0IGkgPSAwO1xuICAvLyBGb3IgcmVsYXkgdHlwZVxuICBsZXQgcmVsYXk6IHN0cmluZztcblxuICB3aGlsZSAoaSA8IGRhdGEubGVuZ3RoKSB7XG4gICAgY29uc3QgdHlwZSA9IGRhdGFbaV07XG4gICAgY29uc3QgbGVuZ3RoID0gZGF0YVtpICsgMV07XG4gICAgXG4gICAgaWYgKGkgKyAyICsgbGVuZ3RoID4gZGF0YS5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBUTFYgZGF0YScpO1xuICAgIH1cbiAgICBcbiAgICBjb25zdCB2YWx1ZSA9IGRhdGEuc2xpY2UoaSArIDIsIGkgKyAyICsgbGVuZ3RoKTtcblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSBUTFZfVFlQRVMuU1BFQ0lBTDpcbiAgICAgICAgcmVzdWx0LmRhdGEgPSB2YWx1ZS50b1N0cmluZygnaGV4Jyk7XG4gICAgICAgIHZhbGlkYXRlSGV4U3RyaW5nKHJlc3VsdC5kYXRhLCA2NCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUTFZfVFlQRVMuUkVMQVk6XG4gICAgICAgIHJlbGF5ID0gdmFsdWUudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgdmFsaWRhdGVSZWxheVVybChyZWxheSk7XG4gICAgICAgIHJlc3VsdC5yZWxheXMgPSByZXN1bHQucmVsYXlzIHx8IFtdO1xuICAgICAgICByZXN1bHQucmVsYXlzLnB1c2gocmVsYXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVExWX1RZUEVTLkFVVEhPUjpcbiAgICAgICAgcmVzdWx0LmF1dGhvciA9IHZhbHVlLnRvU3RyaW5nKCdoZXgnKTtcbiAgICAgICAgdmFsaWRhdGVIZXhTdHJpbmcocmVzdWx0LmF1dGhvciwgNjQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVExWX1RZUEVTLktJTkQ6XG4gICAgICAgIHJlc3VsdC5raW5kID0gdmFsdWUucmVhZFVJbnQzMkJFKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUTFZfVFlQRVMuSURFTlRJRklFUjpcbiAgICAgICAgcmVzdWx0LmlkZW50aWZpZXIgPSB2YWx1ZS50b1N0cmluZygndXRmOCcpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIFNraXAgdW5rbm93biBUTFYgdHlwZXNcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaSArPSAyICsgbGVuZ3RoO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiIsICIvKipcbiAqIE5JUC0yNjogRGVsZWdhdGVkIEV2ZW50IFNpZ25pbmdcbiAqIEltcGxlbWVudHMgZGVsZWdhdGlvbiBvZiBldmVudCBzaWduaW5nIGNhcGFiaWxpdGllc1xuICovXG5cbmltcG9ydCB7IHNoYTI1NiB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvc2hhMi5qcyc7XG5pbXBvcnQgeyBOb3N0ckV2ZW50IH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgc2lnblNjaG5vcnIsIHZlcmlmeVNjaG5vcnJTaWduYXR1cmUgfSBmcm9tICcuLi9jcnlwdG8nO1xuaW1wb3J0IHsgYnl0ZXNUb0hleCwgaGV4VG9CeXRlcyB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgc2Nobm9yciB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBEZWxlZ2F0aW9uQ29uZGl0aW9ucyB7XG4gIGtpbmQ/OiBudW1iZXI7XG4gIHNpbmNlPzogbnVtYmVyO1xuICB1bnRpbD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZWxlZ2F0aW9uIHtcbiAgZGVsZWdhdG9yOiBzdHJpbmc7XG4gIGRlbGVnYXRlZTogc3RyaW5nO1xuICBjb25kaXRpb25zOiBEZWxlZ2F0aW9uQ29uZGl0aW9ucztcbiAgdG9rZW46IHN0cmluZztcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBkZWxlZ2F0aW9uIHRva2VuXG4gKiBAcGFyYW0gZGVsZWdhdG9yUHJpdmF0ZUtleSBEZWxlZ2F0b3IncyBwcml2YXRlIGtleSAodXNlZCBmb3Igc2lnbmluZyBvbmx5LCBuZXZlciByZXR1cm5lZClcbiAqIEBwYXJhbSBkZWxlZ2F0ZWUgRGVsZWdhdGVlJ3MgcHVibGljIGtleVxuICogQHBhcmFtIGNvbmRpdGlvbnMgRGVsZWdhdGlvbiBjb25kaXRpb25zXG4gKiBAcmV0dXJucyBEZWxlZ2F0aW9uIHRva2VuIChkZWxlZ2F0b3IgZmllbGQgY29udGFpbnMgdGhlIFBVQkxJQyBrZXksIG5vdCB0aGUgcHJpdmF0ZSBrZXkpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEZWxlZ2F0aW9uKFxuICBkZWxlZ2F0b3JQcml2YXRlS2V5OiBzdHJpbmcsXG4gIGRlbGVnYXRlZTogc3RyaW5nLFxuICBjb25kaXRpb25zOiBEZWxlZ2F0aW9uQ29uZGl0aW9uc1xuKTogRGVsZWdhdGlvbiB7XG4gIGNvbnN0IGNvbmRpdGlvbnNTdHJpbmcgPSBzZXJpYWxpemVDb25kaXRpb25zKGNvbmRpdGlvbnMpO1xuICBjb25zdCB0b2tlbiA9IHNpZ25EZWxlZ2F0aW9uKGRlbGVnYXRvclByaXZhdGVLZXksIGRlbGVnYXRlZSwgY29uZGl0aW9uc1N0cmluZyk7XG5cbiAgLy8gRGVyaXZlIHRoZSBwdWJsaWMga2V5IGZyb20gdGhlIHByaXZhdGUga2V5IFx1MjAxNCBORVZFUiByZXR1cm4gdGhlIHByaXZhdGUga2V5XG4gIGNvbnN0IGRlbGVnYXRvclB1YmxpY0tleSA9IGJ5dGVzVG9IZXgoc2Nobm9yci5nZXRQdWJsaWNLZXkoaGV4VG9CeXRlcyhkZWxlZ2F0b3JQcml2YXRlS2V5KSkpO1xuXG4gIHJldHVybiB7XG4gICAgZGVsZWdhdG9yOiBkZWxlZ2F0b3JQdWJsaWNLZXksXG4gICAgZGVsZWdhdGVlLFxuICAgIGNvbmRpdGlvbnMsXG4gICAgdG9rZW5cbiAgfTtcbn1cblxuLyoqXG4gKiBWZXJpZnkgYSBkZWxlZ2F0aW9uIHRva2VuXG4gKiBAcGFyYW0gZGVsZWdhdGlvbiBEZWxlZ2F0aW9uIHRvIHZlcmlmeVxuICogQHJldHVybnMgVHJ1ZSBpZiB2YWxpZCwgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2ZXJpZnlEZWxlZ2F0aW9uKGRlbGVnYXRpb246IERlbGVnYXRpb24pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgY29uZGl0aW9uc1N0cmluZyA9IHNlcmlhbGl6ZUNvbmRpdGlvbnMoZGVsZWdhdGlvbi5jb25kaXRpb25zKTtcbiAgcmV0dXJuIGF3YWl0IHZlcmlmeURlbGVnYXRpb25TaWduYXR1cmUoXG4gICAgZGVsZWdhdGlvbi5kZWxlZ2F0b3IsXG4gICAgZGVsZWdhdGlvbi5kZWxlZ2F0ZWUsXG4gICAgY29uZGl0aW9uc1N0cmluZyxcbiAgICBkZWxlZ2F0aW9uLnRva2VuXG4gICk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYW4gZXZlbnQgbWVldHMgZGVsZWdhdGlvbiBjb25kaXRpb25zXG4gKiBAcGFyYW0gZXZlbnQgRXZlbnQgdG8gY2hlY2tcbiAqIEBwYXJhbSBjb25kaXRpb25zIERlbGVnYXRpb24gY29uZGl0aW9uc1xuICogQHJldHVybnMgVHJ1ZSBpZiBjb25kaXRpb25zIGFyZSBtZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrRGVsZWdhdGlvbkNvbmRpdGlvbnMoXG4gIGV2ZW50OiBOb3N0ckV2ZW50LFxuICBjb25kaXRpb25zOiBEZWxlZ2F0aW9uQ29uZGl0aW9uc1xuKTogYm9vbGVhbiB7XG4gIGlmIChjb25kaXRpb25zLmtpbmQgIT09IHVuZGVmaW5lZCAmJiBldmVudC5raW5kICE9PSBjb25kaXRpb25zLmtpbmQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoY29uZGl0aW9ucy5zaW5jZSAhPT0gdW5kZWZpbmVkICYmIGV2ZW50LmNyZWF0ZWRfYXQgPCBjb25kaXRpb25zLnNpbmNlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGNvbmRpdGlvbnMudW50aWwgIT09IHVuZGVmaW5lZCAmJiBldmVudC5jcmVhdGVkX2F0ID4gY29uZGl0aW9ucy51bnRpbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIEFkZCBkZWxlZ2F0aW9uIHRhZyB0byBhbiBldmVudFxuICogQHBhcmFtIGV2ZW50IEV2ZW50IHRvIGFkZCBkZWxlZ2F0aW9uIHRvXG4gKiBAcGFyYW0gZGVsZWdhdGlvbiBEZWxlZ2F0aW9uIHRvIGFkZFxuICogQHJldHVybnMgVXBkYXRlZCBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkRGVsZWdhdGlvblRhZyhcbiAgZXZlbnQ6IE5vc3RyRXZlbnQsXG4gIGRlbGVnYXRpb246IERlbGVnYXRpb25cbik6IE5vc3RyRXZlbnQge1xuICBjb25zdCB0YWcgPSBbXG4gICAgJ2RlbGVnYXRpb24nLFxuICAgIGRlbGVnYXRpb24uZGVsZWdhdG9yLFxuICAgIHNlcmlhbGl6ZUNvbmRpdGlvbnMoZGVsZWdhdGlvbi5jb25kaXRpb25zKSxcbiAgICBkZWxlZ2F0aW9uLnRva2VuXG4gIF07XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5ldmVudCxcbiAgICB0YWdzOiBbLi4uZXZlbnQudGFncywgdGFnXVxuICB9O1xufVxuXG4vKipcbiAqIEV4dHJhY3QgZGVsZWdhdGlvbiBmcm9tIGFuIGV2ZW50XG4gKiBAcGFyYW0gZXZlbnQgRXZlbnQgdG8gZXh0cmFjdCBkZWxlZ2F0aW9uIGZyb21cbiAqIEByZXR1cm5zIERlbGVnYXRpb24gb3IgbnVsbCBpZiBub3QgZm91bmRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3REZWxlZ2F0aW9uKGV2ZW50OiBOb3N0ckV2ZW50KTogRGVsZWdhdGlvbiB8IG51bGwge1xuICBjb25zdCB0YWcgPSBldmVudC50YWdzLmZpbmQodCA9PiB0WzBdID09PSAnZGVsZWdhdGlvbicpO1xuICBpZiAoIXRhZyB8fCB0YWcubGVuZ3RoICE9PSA0KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGRlbGVnYXRvcjogdGFnWzFdLFxuICAgIGRlbGVnYXRlZTogZXZlbnQucHVia2V5LFxuICAgIGNvbmRpdGlvbnM6IHBhcnNlQ29uZGl0aW9ucyh0YWdbMl0pLFxuICAgIHRva2VuOiB0YWdbM11cbiAgfTtcbn1cblxuLy8gSGVscGVyIGZ1bmN0aW9uc1xuZnVuY3Rpb24gc2VyaWFsaXplQ29uZGl0aW9ucyhjb25kaXRpb25zOiBEZWxlZ2F0aW9uQ29uZGl0aW9ucyk6IHN0cmluZyB7XG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIGlmIChjb25kaXRpb25zLmtpbmQgIT09IHVuZGVmaW5lZCkge1xuICAgIHBhcnRzLnB1c2goYGtpbmQ9JHtjb25kaXRpb25zLmtpbmR9YCk7XG4gIH1cbiAgaWYgKGNvbmRpdGlvbnMuc2luY2UgIT09IHVuZGVmaW5lZCkge1xuICAgIHBhcnRzLnB1c2goYGNyZWF0ZWRfYXQ+JHtjb25kaXRpb25zLnNpbmNlfWApO1xuICB9XG4gIGlmIChjb25kaXRpb25zLnVudGlsICE9PSB1bmRlZmluZWQpIHtcbiAgICBwYXJ0cy5wdXNoKGBjcmVhdGVkX2F0PCR7Y29uZGl0aW9ucy51bnRpbH1gKTtcbiAgfVxuXG4gIHJldHVybiBwYXJ0cy5qb2luKCcmJyk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlQ29uZGl0aW9ucyhjb25kaXRpb25zU3RyaW5nOiBzdHJpbmcpOiBEZWxlZ2F0aW9uQ29uZGl0aW9ucyB7XG4gIGNvbnN0IGNvbmRpdGlvbnM6IERlbGVnYXRpb25Db25kaXRpb25zID0ge307XG4gIGNvbnN0IHBhcnRzID0gY29uZGl0aW9uc1N0cmluZy5zcGxpdCgnJicpO1xuXG4gIGZvciAoY29uc3QgcGFydCBvZiBwYXJ0cykge1xuICAgIGlmIChwYXJ0LnN0YXJ0c1dpdGgoJ2tpbmQ9JykpIHtcbiAgICAgIGNvbmRpdGlvbnMua2luZCA9IHBhcnNlSW50KHBhcnQuc2xpY2UoNSkpO1xuICAgIH0gZWxzZSBpZiAocGFydC5zdGFydHNXaXRoKCdjcmVhdGVkX2F0PicpKSB7XG4gICAgICBjb25kaXRpb25zLnNpbmNlID0gcGFyc2VJbnQocGFydC5zbGljZSgxMSkpO1xuICAgIH0gZWxzZSBpZiAocGFydC5zdGFydHNXaXRoKCdjcmVhdGVkX2F0PCcpKSB7XG4gICAgICBjb25kaXRpb25zLnVudGlsID0gcGFyc2VJbnQocGFydC5zbGljZSgxMSkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb25kaXRpb25zO1xufVxuXG5mdW5jdGlvbiBzaWduRGVsZWdhdGlvbihcbiAgZGVsZWdhdG9yOiBzdHJpbmcsXG4gIGRlbGVnYXRlZTogc3RyaW5nLFxuICBjb25kaXRpb25zOiBzdHJpbmdcbik6IHN0cmluZyB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBgbm9zdHI6ZGVsZWdhdGlvbjoke2RlbGVnYXRlZX06JHtjb25kaXRpb25zfWA7XG4gIGNvbnN0IGhhc2ggPSBzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKG1lc3NhZ2UpKTtcbiAgY29uc3Qgc2lnbmF0dXJlID0gc2lnblNjaG5vcnIoaGFzaCwgaGV4VG9CeXRlcyhkZWxlZ2F0b3IpKTtcbiAgcmV0dXJuIGJ5dGVzVG9IZXgoc2lnbmF0dXJlKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdmVyaWZ5RGVsZWdhdGlvblNpZ25hdHVyZShcbiAgZGVsZWdhdG9yOiBzdHJpbmcsXG4gIGRlbGVnYXRlZTogc3RyaW5nLFxuICBjb25kaXRpb25zOiBzdHJpbmcsXG4gIHNpZ25hdHVyZTogc3RyaW5nXG4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgbXNnSGFzaCA9IHNoYTI1NihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoYG5vc3RyOmRlbGVnYXRpb246JHtkZWxlZ2F0ZWV9OiR7Y29uZGl0aW9uc31gKSk7XG5cbiAgcmV0dXJuIHZlcmlmeVNjaG5vcnJTaWduYXR1cmUoaGV4VG9CeXRlcyhzaWduYXR1cmUpLCBtc2dIYXNoLCBoZXhUb0J5dGVzKGRlbGVnYXRvcikpO1xufVxuIiwgIi8qKlxuICogQG1vZHVsZSBuaXBzL25pcC00NFxuICogQGRlc2NyaXB0aW9uIEltcGxlbWVudGF0aW9uIG9mIE5JUC00NCAoVmVyc2lvbmVkIEVuY3J5cHRlZCBQYXlsb2FkcylcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDQubWRcbiAqL1xuXG5pbXBvcnQgeyBjaGFjaGEyMCB9IGZyb20gJ0Bub2JsZS9jaXBoZXJzL2NoYWNoYS5qcyc7XG5pbXBvcnQgeyBlcXVhbEJ5dGVzIH0gZnJvbSAnQG5vYmxlL2NpcGhlcnMvdXRpbHMuanMnO1xuaW1wb3J0IHsgc2VjcDI1NmsxIH0gZnJvbSAnQG5vYmxlL2N1cnZlcy9zZWNwMjU2azEuanMnO1xuaW1wb3J0IHsgZXh0cmFjdCBhcyBoa2RmX2V4dHJhY3QsIGV4cGFuZCBhcyBoa2RmX2V4cGFuZCB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvaGtkZi5qcyc7XG5pbXBvcnQgeyBobWFjIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9obWFjLmpzJztcbmltcG9ydCB7IHNoYTI1NiB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvc2hhMi5qcyc7XG5pbXBvcnQgeyBjb25jYXRCeXRlcywgaGV4VG9CeXRlcywgcmFuZG9tQnl0ZXMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IGJhc2U2NCB9IGZyb20gJ0BzY3VyZS9iYXNlJztcblxuY29uc3QgdXRmOEVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcbmNvbnN0IHV0ZjhEZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCk7XG5cbmNvbnN0IG1pblBsYWludGV4dFNpemUgPSAxO1xuY29uc3QgbWF4UGxhaW50ZXh0U2l6ZSA9IDY1NTM1O1xuXG4vKipcbiAqIENhbGN1bGF0ZSBwYWRkZWQgbGVuZ3RoIGZvciBOSVAtNDQgbWVzc2FnZSBwYWRkaW5nXG4gKi9cbmZ1bmN0aW9uIGNhbGNQYWRkZWRMZW4obGVuOiBudW1iZXIpOiBudW1iZXIge1xuICBpZiAoIU51bWJlci5pc1NhZmVJbnRlZ2VyKGxlbikgfHwgbGVuIDwgMSkgdGhyb3cgbmV3IEVycm9yKCdleHBlY3RlZCBwb3NpdGl2ZSBpbnRlZ2VyJyk7XG4gIGlmIChsZW4gPD0gMzIpIHJldHVybiAzMjtcbiAgY29uc3QgbmV4dFBvd2VyID0gMSA8PCAoTWF0aC5mbG9vcihNYXRoLmxvZzIobGVuIC0gMSkpICsgMSk7XG4gIGNvbnN0IGNodW5rID0gbmV4dFBvd2VyIDw9IDI1NiA/IDMyIDogbmV4dFBvd2VyIC8gODtcbiAgcmV0dXJuIGNodW5rICogKE1hdGguZmxvb3IoKGxlbiAtIDEpIC8gY2h1bmspICsgMSk7XG59XG5cbi8qKlxuICogUGFkIHBsYWludGV4dCBwZXIgTklQLTQ0IHNwZWNcbiAqL1xuZnVuY3Rpb24gcGFkKHBsYWludGV4dDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIGNvbnN0IHVucGFkZGVkID0gdXRmOEVuY29kZXIuZW5jb2RlKHBsYWludGV4dCk7XG4gIGNvbnN0IHVucGFkZGVkTGVuID0gdW5wYWRkZWQubGVuZ3RoO1xuICBpZiAodW5wYWRkZWRMZW4gPCBtaW5QbGFpbnRleHRTaXplIHx8IHVucGFkZGVkTGVuID4gbWF4UGxhaW50ZXh0U2l6ZSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcGxhaW50ZXh0IGxlbmd0aDogbXVzdCBiZSBiZXR3ZWVuIDEgYW5kIDY1NTM1IGJ5dGVzJyk7XG4gIGNvbnN0IHByZWZpeCA9IG5ldyBVaW50OEFycmF5KDIpO1xuICBuZXcgRGF0YVZpZXcocHJlZml4LmJ1ZmZlcikuc2V0VWludDE2KDAsIHVucGFkZGVkTGVuLCBmYWxzZSk7IC8vIGJpZy1lbmRpYW5cbiAgY29uc3Qgc3VmZml4ID0gbmV3IFVpbnQ4QXJyYXkoY2FsY1BhZGRlZExlbih1bnBhZGRlZExlbikgLSB1bnBhZGRlZExlbik7XG4gIHJldHVybiBjb25jYXRCeXRlcyhwcmVmaXgsIHVucGFkZGVkLCBzdWZmaXgpO1xufVxuXG4vKipcbiAqIFVucGFkIGRlY3J5cHRlZCBtZXNzYWdlIHBlciBOSVAtNDQgc3BlY1xuICovXG5mdW5jdGlvbiB1bnBhZChwYWRkZWQ6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICBjb25zdCB1bnBhZGRlZExlbiA9IG5ldyBEYXRhVmlldyhwYWRkZWQuYnVmZmVyLCBwYWRkZWQuYnl0ZU9mZnNldCkuZ2V0VWludDE2KDAsIGZhbHNlKTtcbiAgY29uc3QgdW5wYWRkZWQgPSBwYWRkZWQuc3ViYXJyYXkoMiwgMiArIHVucGFkZGVkTGVuKTtcbiAgaWYgKFxuICAgIHVucGFkZGVkTGVuIDwgbWluUGxhaW50ZXh0U2l6ZSB8fFxuICAgIHVucGFkZGVkTGVuID4gbWF4UGxhaW50ZXh0U2l6ZSB8fFxuICAgIHVucGFkZGVkLmxlbmd0aCAhPT0gdW5wYWRkZWRMZW4gfHxcbiAgICBwYWRkZWQubGVuZ3RoICE9PSAyICsgY2FsY1BhZGRlZExlbih1bnBhZGRlZExlbilcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHBhZGRpbmcnKTtcbiAgfVxuICByZXR1cm4gdXRmOERlY29kZXIuZGVjb2RlKHVucGFkZGVkKTtcbn1cblxuLyoqXG4gKiBEZXJpdmUgY29udmVyc2F0aW9uIGtleSBmcm9tIHByaXZhdGUga2V5IGFuZCBwdWJsaWMga2V5IHVzaW5nIEVDREggKyBIS0RGXG4gKi9cbmZ1bmN0aW9uIGdldENvbnZlcnNhdGlvbktleShwcml2a2V5QTogVWludDhBcnJheSwgcHVia2V5Qjogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIGNvbnN0IHNoYXJlZFBvaW50ID0gc2VjcDI1NmsxLmdldFNoYXJlZFNlY3JldChwcml2a2V5QSwgaGV4VG9CeXRlcygnMDInICsgcHVia2V5QikpO1xuICBjb25zdCBzaGFyZWRYID0gc2hhcmVkUG9pbnQuc3ViYXJyYXkoMSwgMzMpO1xuICByZXR1cm4gaGtkZl9leHRyYWN0KHNoYTI1Niwgc2hhcmVkWCwgdXRmOEVuY29kZXIuZW5jb2RlKCduaXA0NC12MicpKTtcbn1cblxuLyoqXG4gKiBEZXJpdmUgbWVzc2FnZSBrZXlzIChjaGFjaGEga2V5LCBjaGFjaGEgbm9uY2UsIGhtYWMga2V5KSBmcm9tIGNvbnZlcnNhdGlvbiBrZXkgYW5kIG5vbmNlXG4gKi9cbmZ1bmN0aW9uIGdldE1lc3NhZ2VLZXlzKGNvbnZlcnNhdGlvbktleTogVWludDhBcnJheSwgbm9uY2U6IFVpbnQ4QXJyYXkpOiB7XG4gIGNoYWNoYV9rZXk6IFVpbnQ4QXJyYXk7XG4gIGNoYWNoYV9ub25jZTogVWludDhBcnJheTtcbiAgaG1hY19rZXk6IFVpbnQ4QXJyYXk7XG59IHtcbiAgY29uc3Qga2V5cyA9IGhrZGZfZXhwYW5kKHNoYTI1NiwgY29udmVyc2F0aW9uS2V5LCBub25jZSwgNzYpO1xuICByZXR1cm4ge1xuICAgIGNoYWNoYV9rZXk6IGtleXMuc3ViYXJyYXkoMCwgMzIpLFxuICAgIGNoYWNoYV9ub25jZToga2V5cy5zdWJhcnJheSgzMiwgNDQpLFxuICAgIGhtYWNfa2V5OiBrZXlzLnN1YmFycmF5KDQ0LCA3NiksXG4gIH07XG59XG5cbi8qKlxuICogRW5jcnlwdCBwbGFpbnRleHQgdXNpbmcgTklQLTQ0IHYyXG4gKiBAcGFyYW0gcGxhaW50ZXh0IC0gVGhlIG1lc3NhZ2UgdG8gZW5jcnlwdFxuICogQHBhcmFtIGNvbnZlcnNhdGlvbktleSAtIDMyLWJ5dGUgY29udmVyc2F0aW9uIGtleSBmcm9tIGdldENvbnZlcnNhdGlvbktleVxuICogQHBhcmFtIG5vbmNlIC0gT3B0aW9uYWwgMzItYnl0ZSBub25jZSAocmFuZG9tIGlmIG5vdCBwcm92aWRlZClcbiAqIEByZXR1cm5zIEJhc2U2NC1lbmNvZGVkIGVuY3J5cHRlZCBwYXlsb2FkXG4gKi9cbmZ1bmN0aW9uIGVuY3J5cHQocGxhaW50ZXh0OiBzdHJpbmcsIGNvbnZlcnNhdGlvbktleTogVWludDhBcnJheSwgbm9uY2U6IFVpbnQ4QXJyYXkgPSByYW5kb21CeXRlcygzMikpOiBzdHJpbmcge1xuICBjb25zdCB7IGNoYWNoYV9rZXksIGNoYWNoYV9ub25jZSwgaG1hY19rZXkgfSA9IGdldE1lc3NhZ2VLZXlzKGNvbnZlcnNhdGlvbktleSwgbm9uY2UpO1xuICBjb25zdCBwYWRkZWQgPSBwYWQocGxhaW50ZXh0KTtcbiAgY29uc3QgY2lwaGVydGV4dCA9IGNoYWNoYTIwKGNoYWNoYV9rZXksIGNoYWNoYV9ub25jZSwgcGFkZGVkKTtcbiAgY29uc3QgbWFjID0gaG1hYyhzaGEyNTYsIGhtYWNfa2V5LCBjb25jYXRCeXRlcyhub25jZSwgY2lwaGVydGV4dCkpO1xuICByZXR1cm4gYmFzZTY0LmVuY29kZShjb25jYXRCeXRlcyhuZXcgVWludDhBcnJheShbMl0pLCBub25jZSwgY2lwaGVydGV4dCwgbWFjKSk7XG59XG5cbi8qKlxuICogRGVjcnlwdCBhIE5JUC00NCB2MiBwYXlsb2FkXG4gKiBAcGFyYW0gcGF5bG9hZCAtIEJhc2U2NC1lbmNvZGVkIGVuY3J5cHRlZCBwYXlsb2FkXG4gKiBAcGFyYW0gY29udmVyc2F0aW9uS2V5IC0gMzItYnl0ZSBjb252ZXJzYXRpb24ga2V5IGZyb20gZ2V0Q29udmVyc2F0aW9uS2V5XG4gKiBAcmV0dXJucyBEZWNyeXB0ZWQgcGxhaW50ZXh0IHN0cmluZ1xuICovXG5mdW5jdGlvbiBkZWNyeXB0KHBheWxvYWQ6IHN0cmluZywgY29udmVyc2F0aW9uS2V5OiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgY29uc3QgZGF0YSA9IGJhc2U2NC5kZWNvZGUocGF5bG9hZCk7XG4gIGNvbnN0IHZlcnNpb24gPSBkYXRhWzBdO1xuICBpZiAodmVyc2lvbiAhPT0gMikgdGhyb3cgbmV3IEVycm9yKGB1bmtub3duIGVuY3J5cHRpb24gdmVyc2lvbjogJHt2ZXJzaW9ufWApO1xuICBpZiAoZGF0YS5sZW5ndGggPCA5OSB8fCBkYXRhLmxlbmd0aCA+IDY1NjAzKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcGF5bG9hZCBzaXplJyk7XG4gIGNvbnN0IG5vbmNlID0gZGF0YS5zdWJhcnJheSgxLCAzMyk7XG4gIGNvbnN0IGNpcGhlcnRleHQgPSBkYXRhLnN1YmFycmF5KDMzLCBkYXRhLmxlbmd0aCAtIDMyKTtcbiAgY29uc3QgbWFjID0gZGF0YS5zdWJhcnJheShkYXRhLmxlbmd0aCAtIDMyKTtcbiAgY29uc3QgeyBjaGFjaGFfa2V5LCBjaGFjaGFfbm9uY2UsIGhtYWNfa2V5IH0gPSBnZXRNZXNzYWdlS2V5cyhjb252ZXJzYXRpb25LZXksIG5vbmNlKTtcbiAgY29uc3QgZXhwZWN0ZWRNYWMgPSBobWFjKHNoYTI1NiwgaG1hY19rZXksIGNvbmNhdEJ5dGVzKG5vbmNlLCBjaXBoZXJ0ZXh0KSk7XG4gIGlmICghZXF1YWxCeXRlcyhtYWMsIGV4cGVjdGVkTWFjKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIE1BQycpO1xuICBjb25zdCBwYWRkZWQgPSBjaGFjaGEyMChjaGFjaGFfa2V5LCBjaGFjaGFfbm9uY2UsIGNpcGhlcnRleHQpO1xuICByZXR1cm4gdW5wYWQocGFkZGVkKTtcbn1cblxuLyoqXG4gKiB2MiBBUEkgb2JqZWN0IG1hdGNoaW5nIG5vc3RyLXRvb2xzIHNoYXBlIGZvciBjb21wYXRpYmlsaXR5XG4gKi9cbmV4cG9ydCBjb25zdCB2MiA9IHtcbiAgdXRpbHM6IHtcbiAgICBnZXRDb252ZXJzYXRpb25LZXksXG4gICAgY2FsY1BhZGRlZExlbixcbiAgfSxcbiAgZW5jcnlwdCxcbiAgZGVjcnlwdCxcbn07XG5cbmV4cG9ydCB7IGdldENvbnZlcnNhdGlvbktleSwgZW5jcnlwdCwgZGVjcnlwdCwgY2FsY1BhZGRlZExlbiB9O1xuIiwgIi8qKlxuICogQG1vZHVsZSBuaXBzL25pcC00NlxuICogQGRlc2NyaXB0aW9uIEltcGxlbWVudGF0aW9uIG9mIE5JUC00NiAoTm9zdHIgQ29ubmVjdCAvIFJlbW90ZSBTaWduaW5nKVxuICpcbiAqIFB1cmUgcHJvdG9jb2wgbGF5ZXIgXHUyMDE0IGNyeXB0bywgZW5jb2RpbmcsIG1lc3NhZ2UgZm9ybWF0dGluZy5cbiAqIE5vIFdlYlNvY2tldCwgbm8gcmVsYXkgY29ubmVjdGlvbnMsIG5vIEkvTy5cbiAqIENvbnN1bWVycyBwcm92aWRlIHRoZWlyIG93biB0cmFuc3BvcnQuXG4gKlxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci80Ni5tZFxuICovXG5cbmltcG9ydCB7IHNjaG5vcnIgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG5pbXBvcnQgeyBieXRlc1RvSGV4LCBoZXhUb0J5dGVzLCByYW5kb21CeXRlcyB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgc2hhMjU2IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGEyLmpzJztcbmltcG9ydCB7XG4gIGdldENvbnZlcnNhdGlvbktleSBhcyBuaXA0NEdldENvbnZlcnNhdGlvbktleSxcbiAgZW5jcnlwdCBhcyBuaXA0NEVuY3J5cHQsXG4gIGRlY3J5cHQgYXMgbmlwNDREZWNyeXB0LFxufSBmcm9tICcuL25pcC00NCc7XG5pbXBvcnQgdHlwZSB7XG4gIEJ1bmtlclVSSSxcbiAgQnVua2VyVmFsaWRhdGlvblJlc3VsdCxcbiAgTmlwNDZSZXF1ZXN0LFxuICBOaXA0NlJlc3BvbnNlLFxuICBOaXA0NlNlc3Npb24sXG4gIE5pcDQ2U2Vzc2lvbkluZm8sXG4gIFNpZ25lZE5vc3RyRXZlbnQsXG59IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IE5pcDQ2TWV0aG9kIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgMS4gQnVua2VyIFVSSSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBQYXJzZSBhIGJ1bmtlcjovLyBVUkkgaW50byBpdHMgY29tcG9uZW50c1xuICogQHBhcmFtIHVyaSAtIGJ1bmtlcjovLyZsdDtyZW1vdGUtcHVia2V5Jmd0Oz9yZWxheT0uLi4mc2VjcmV0PS4uLlxuICogQHJldHVybnMgUGFyc2VkIEJ1bmtlclVSSSBvciB0aHJvd3Mgb24gaW52YWxpZCBpbnB1dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCdW5rZXJVUkkodXJpOiBzdHJpbmcpOiBCdW5rZXJVUkkge1xuICBpZiAoIXVyaS5zdGFydHNXaXRoKCdidW5rZXI6Ly8nKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBidW5rZXIgVVJJOiBtdXN0IHN0YXJ0IHdpdGggYnVua2VyOi8vJyk7XG4gIH1cblxuICBjb25zdCB1cmwgPSBuZXcgVVJMKHVyaS5yZXBsYWNlKCdidW5rZXI6Ly8nLCAnaHR0cHM6Ly8nKSk7XG4gIGNvbnN0IHJlbW90ZVB1YmtleSA9IHVybC5ob3N0bmFtZTtcblxuICBpZiAoIS9eWzAtOWEtZl17NjR9JC8udGVzdChyZW1vdGVQdWJrZXkpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGJ1bmtlciBVUkk6IHJlbW90ZSBwdWJrZXkgbXVzdCBiZSA2NCBoZXggY2hhcmFjdGVycycpO1xuICB9XG5cbiAgY29uc3QgcmVsYXlzID0gdXJsLnNlYXJjaFBhcmFtcy5nZXRBbGwoJ3JlbGF5Jyk7XG4gIGlmIChyZWxheXMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGJ1bmtlciBVUkk6IGF0IGxlYXN0IG9uZSByZWxheSBpcyByZXF1aXJlZCcpO1xuICB9XG5cbiAgY29uc3Qgc2VjcmV0ID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ3NlY3JldCcpIHx8IHVuZGVmaW5lZDtcblxuICByZXR1cm4geyByZW1vdGVQdWJrZXksIHJlbGF5cywgc2VjcmV0IH07XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgYnVua2VyOi8vIFVSSSBzdHJpbmdcbiAqIEBwYXJhbSByZW1vdGVQdWJrZXkgLSBSZW1vdGUgc2lnbmVyJ3MgcHVibGljIGtleSAoaGV4KVxuICogQHBhcmFtIHJlbGF5cyAtIFJlbGF5IFVSTHNcbiAqIEBwYXJhbSBzZWNyZXQgLSBPcHRpb25hbCBjb25uZWN0aW9uIHNlY3JldFxuICogQHJldHVybnMgYnVua2VyOi8vIFVSSSBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJ1bmtlclVSSShyZW1vdGVQdWJrZXk6IHN0cmluZywgcmVsYXlzOiBzdHJpbmdbXSwgc2VjcmV0Pzogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKCEvXlswLTlhLWZdezY0fSQvLnRlc3QocmVtb3RlUHVia2V5KSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVtb3RlUHVia2V5IG11c3QgYmUgNjQgaGV4IGNoYXJhY3RlcnMnKTtcbiAgfVxuICBpZiAocmVsYXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignYXQgbGVhc3Qgb25lIHJlbGF5IGlzIHJlcXVpcmVkJyk7XG4gIH1cblxuICBjb25zdCBwYXJhbXMgPSByZWxheXMubWFwKHIgPT4gYHJlbGF5PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHIpfWApO1xuICBpZiAoc2VjcmV0KSB7XG4gICAgcGFyYW1zLnB1c2goYHNlY3JldD0ke2VuY29kZVVSSUNvbXBvbmVudChzZWNyZXQpfWApO1xuICB9XG5cbiAgcmV0dXJuIGBidW5rZXI6Ly8ke3JlbW90ZVB1YmtleX0/JHtwYXJhbXMuam9pbignJicpfWA7XG59XG5cbi8qKlxuICogVmFsaWRhdGUgYSBidW5rZXI6Ly8gVVJJIGFuZCByZXR1cm4gc3RydWN0dXJlZCByZXN1bHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQnVua2VyVVJJKHVyaTogc3RyaW5nKTogQnVua2VyVmFsaWRhdGlvblJlc3VsdCB7XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2VCdW5rZXJVUkkodXJpKTtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlLCB1cmk6IHBhcnNlZCB9O1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAoZSBhcyBFcnJvcikubWVzc2FnZSB9O1xuICB9XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMCAyLiBTZXNzaW9uIE1hbmFnZW1lbnQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IE5JUC00NiBzZXNzaW9uIHdpdGggYW4gZXBoZW1lcmFsIGtleXBhaXJcbiAqIEBwYXJhbSByZW1vdGVQdWJrZXkgLSBSZW1vdGUgc2lnbmVyJ3MgcHVibGljIGtleSAoaGV4KVxuICogQHJldHVybnMgU2Vzc2lvbiBjb250YWluaW5nIGVwaGVtZXJhbCBrZXlzIGFuZCBOSVAtNDQgY29udmVyc2F0aW9uIGtleVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2Vzc2lvbihyZW1vdGVQdWJrZXk6IHN0cmluZyk6IE5pcDQ2U2Vzc2lvbiB7XG4gIGlmICghL15bMC05YS1mXXs2NH0kLy50ZXN0KHJlbW90ZVB1YmtleSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlbW90ZVB1YmtleSBtdXN0IGJlIDY0IGhleCBjaGFyYWN0ZXJzJyk7XG4gIH1cblxuICBjb25zdCBjbGllbnRTZWNyZXRLZXlCeXRlcyA9IHJhbmRvbUJ5dGVzKDMyKTtcbiAgY29uc3QgY2xpZW50U2VjcmV0S2V5ID0gYnl0ZXNUb0hleChjbGllbnRTZWNyZXRLZXlCeXRlcyk7XG4gIGNvbnN0IGNsaWVudFB1YmtleUJ5dGVzID0gc2Nobm9yci5nZXRQdWJsaWNLZXkoY2xpZW50U2VjcmV0S2V5Qnl0ZXMpO1xuICBjb25zdCBjbGllbnRQdWJrZXkgPSBieXRlc1RvSGV4KGNsaWVudFB1YmtleUJ5dGVzKTtcblxuICBjb25zdCBjb252ZXJzYXRpb25LZXkgPSBuaXA0NEdldENvbnZlcnNhdGlvbktleShjbGllbnRTZWNyZXRLZXlCeXRlcywgcmVtb3RlUHVia2V5KTtcblxuICByZXR1cm4ge1xuICAgIGNsaWVudFNlY3JldEtleSxcbiAgICBjbGllbnRQdWJrZXksXG4gICAgcmVtb3RlUHVia2V5LFxuICAgIGNvbnZlcnNhdGlvbktleSxcbiAgfTtcbn1cblxuLyoqXG4gKiBSZXN0b3JlIGEgc2Vzc2lvbiBmcm9tIGEgcHJldmlvdXNseSBzYXZlZCBlcGhlbWVyYWwgcHJpdmF0ZSBrZXlcbiAqIEBwYXJhbSBjbGllbnRTZWNyZXRLZXkgLSBIZXgtZW5jb2RlZCBlcGhlbWVyYWwgcHJpdmF0ZSBrZXlcbiAqIEBwYXJhbSByZW1vdGVQdWJrZXkgLSBSZW1vdGUgc2lnbmVyJ3MgcHVibGljIGtleSAoaGV4KVxuICogQHJldHVybnMgUmVzdG9yZWQgc2Vzc2lvblxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzdG9yZVNlc3Npb24oY2xpZW50U2VjcmV0S2V5OiBzdHJpbmcsIHJlbW90ZVB1YmtleTogc3RyaW5nKTogTmlwNDZTZXNzaW9uIHtcbiAgY29uc3QgY2xpZW50U2VjcmV0S2V5Qnl0ZXMgPSBoZXhUb0J5dGVzKGNsaWVudFNlY3JldEtleSk7XG4gIGNvbnN0IGNsaWVudFB1YmtleUJ5dGVzID0gc2Nobm9yci5nZXRQdWJsaWNLZXkoY2xpZW50U2VjcmV0S2V5Qnl0ZXMpO1xuICBjb25zdCBjbGllbnRQdWJrZXkgPSBieXRlc1RvSGV4KGNsaWVudFB1YmtleUJ5dGVzKTtcblxuICBjb25zdCBjb252ZXJzYXRpb25LZXkgPSBuaXA0NEdldENvbnZlcnNhdGlvbktleShjbGllbnRTZWNyZXRLZXlCeXRlcywgcmVtb3RlUHVia2V5KTtcblxuICByZXR1cm4ge1xuICAgIGNsaWVudFNlY3JldEtleSxcbiAgICBjbGllbnRQdWJrZXksXG4gICAgcmVtb3RlUHVia2V5LFxuICAgIGNvbnZlcnNhdGlvbktleSxcbiAgfTtcbn1cblxuLyoqXG4gKiBHZXQgcHVibGljIHNlc3Npb24gaW5mbyAoc2FmZSB0byBleHBvc2UpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXNzaW9uSW5mbyhzZXNzaW9uOiBOaXA0NlNlc3Npb24pOiBOaXA0NlNlc3Npb25JbmZvIHtcbiAgcmV0dXJuIHtcbiAgICBjbGllbnRQdWJrZXk6IHNlc3Npb24uY2xpZW50UHVia2V5LFxuICAgIHJlbW90ZVB1YmtleTogc2Vzc2lvbi5yZW1vdGVQdWJrZXksXG4gIH07XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMCAzLiBKU09OLVJQQyBNZXNzYWdlcyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBDcmVhdGUgYSBOSVAtNDYgSlNPTi1SUEMgcmVxdWVzdFxuICogQHBhcmFtIG1ldGhvZCAtIFJQQyBtZXRob2QgbmFtZVxuICogQHBhcmFtIHBhcmFtcyAtIEFycmF5IG9mIHN0cmluZyBwYXJhbWV0ZXJzXG4gKiBAcGFyYW0gaWQgLSBPcHRpb25hbCByZXF1ZXN0IElEIChyYW5kb20gaWYgbm90IHByb3ZpZGVkKVxuICogQHJldHVybnMgSlNPTi1SUEMgcmVxdWVzdCBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJlcXVlc3QobWV0aG9kOiBOaXA0Nk1ldGhvZCB8IHN0cmluZywgcGFyYW1zOiBzdHJpbmdbXSwgaWQ/OiBzdHJpbmcpOiBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4ge1xuICAgIGlkOiBpZCB8fCBieXRlc1RvSGV4KHJhbmRvbUJ5dGVzKDE2KSksXG4gICAgbWV0aG9kLFxuICAgIHBhcmFtcyxcbiAgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBOSVAtNDYgSlNPTi1SUEMgcmVzcG9uc2VcbiAqIEBwYXJhbSBpZCAtIFJlcXVlc3QgSUQgYmVpbmcgcmVzcG9uZGVkIHRvXG4gKiBAcGFyYW0gcmVzdWx0IC0gUmVzdWx0IHN0cmluZyAob24gc3VjY2VzcylcbiAqIEBwYXJhbSBlcnJvciAtIEVycm9yIHN0cmluZyAob24gZmFpbHVyZSlcbiAqIEByZXR1cm5zIEpTT04tUlBDIHJlc3BvbnNlIG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmVzcG9uc2UoaWQ6IHN0cmluZywgcmVzdWx0Pzogc3RyaW5nLCBlcnJvcj86IHN0cmluZyk6IE5pcDQ2UmVzcG9uc2Uge1xuICBjb25zdCByZXNwb25zZTogTmlwNDZSZXNwb25zZSA9IHsgaWQgfTtcbiAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSByZXNwb25zZS5yZXN1bHQgPSByZXN1bHQ7XG4gIGlmIChlcnJvciAhPT0gdW5kZWZpbmVkKSByZXNwb25zZS5lcnJvciA9IGVycm9yO1xuICByZXR1cm4gcmVzcG9uc2U7XG59XG5cbi8qKlxuICogUGFyc2UgYSBKU09OIHN0cmluZyBpbnRvIGEgTklQLTQ2IHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSBqc29uIC0gSlNPTiBzdHJpbmcgdG8gcGFyc2VcbiAqIEByZXR1cm5zIFBhcnNlZCByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVBheWxvYWQoanNvbjogc3RyaW5nKTogTmlwNDZSZXF1ZXN0IHwgTmlwNDZSZXNwb25zZSB7XG4gIGNvbnN0IG9iaiA9IEpTT04ucGFyc2UoanNvbikgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGlmICh0eXBlb2Ygb2JqLmlkICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBOSVAtNDYgcGF5bG9hZDogbWlzc2luZyBpZCcpO1xuICB9XG4gIHJldHVybiBvYmogYXMgdW5rbm93biBhcyBOaXA0NlJlcXVlc3QgfCBOaXA0NlJlc3BvbnNlO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgcGF5bG9hZCBpcyBhIE5JUC00NiByZXF1ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1JlcXVlc3QocGF5bG9hZDogTmlwNDZSZXF1ZXN0IHwgTmlwNDZSZXNwb25zZSk6IHBheWxvYWQgaXMgTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuICdtZXRob2QnIGluIHBheWxvYWQgJiYgJ3BhcmFtcycgaW4gcGF5bG9hZDtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhIHBheWxvYWQgaXMgYSBOSVAtNDYgcmVzcG9uc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUmVzcG9uc2UocGF5bG9hZDogTmlwNDZSZXF1ZXN0IHwgTmlwNDZSZXNwb25zZSk6IHBheWxvYWQgaXMgTmlwNDZSZXNwb25zZSB7XG4gIHJldHVybiAncmVzdWx0JyBpbiBwYXlsb2FkIHx8ICdlcnJvcicgaW4gcGF5bG9hZDtcbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwIDQuIEV2ZW50IFdyYXBwaW5nIChLaW5kIDI0MTMzKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBFbmNyeXB0IGFuZCB3cmFwIGEgTklQLTQ2IHBheWxvYWQgaW50byBhIGtpbmQgMjQxMzMgc2lnbmVkIGV2ZW50XG4gKiBAcGFyYW0gcGF5bG9hZCAtIEpTT04tUlBDIHJlcXVlc3Qgb3IgcmVzcG9uc2UgdG8gZW5jcnlwdFxuICogQHBhcmFtIHNlc3Npb24gLSBOSVAtNDYgc2Vzc2lvblxuICogQHBhcmFtIHJlY2lwaWVudFB1YmtleSAtIFRoZSByZWNpcGllbnQncyBwdWJrZXkgKGhleClcbiAqIEByZXR1cm5zIFNpZ25lZCBraW5kIDI0MTMzIGV2ZW50XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cmFwRXZlbnQoXG4gIHBheWxvYWQ6IE5pcDQ2UmVxdWVzdCB8IE5pcDQ2UmVzcG9uc2UsXG4gIHNlc3Npb246IE5pcDQ2U2Vzc2lvbixcbiAgcmVjaXBpZW50UHVia2V5OiBzdHJpbmdcbik6IFByb21pc2U8U2lnbmVkTm9zdHJFdmVudD4ge1xuICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkocGF5bG9hZCk7XG4gIGNvbnN0IGVuY3J5cHRlZCA9IG5pcDQ0RW5jcnlwdChqc29uLCBzZXNzaW9uLmNvbnZlcnNhdGlvbktleSk7XG5cbiAgY29uc3QgY3JlYXRlZF9hdCA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xuICBjb25zdCBldmVudCA9IHtcbiAgICBraW5kOiAyNDEzMyxcbiAgICBjcmVhdGVkX2F0LFxuICAgIHRhZ3M6IFtbJ3AnLCByZWNpcGllbnRQdWJrZXldXSxcbiAgICBjb250ZW50OiBlbmNyeXB0ZWQsXG4gICAgcHVia2V5OiBzZXNzaW9uLmNsaWVudFB1YmtleSxcbiAgfTtcblxuICAvLyBTZXJpYWxpemUgZm9yIE5JUC0wMSBldmVudCBJRFxuICBjb25zdCBzZXJpYWxpemVkID0gSlNPTi5zdHJpbmdpZnkoW1xuICAgIDAsXG4gICAgZXZlbnQucHVia2V5LFxuICAgIGV2ZW50LmNyZWF0ZWRfYXQsXG4gICAgZXZlbnQua2luZCxcbiAgICBldmVudC50YWdzLFxuICAgIGV2ZW50LmNvbnRlbnQsXG4gIF0pO1xuXG4gIGNvbnN0IGV2ZW50SGFzaCA9IHNoYTI1NihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc2VyaWFsaXplZCkpO1xuICBjb25zdCBwcml2YXRlS2V5Qnl0ZXMgPSBoZXhUb0J5dGVzKHNlc3Npb24uY2xpZW50U2VjcmV0S2V5KTtcbiAgY29uc3Qgc2lnbmF0dXJlQnl0ZXMgPSBzY2hub3JyLnNpZ24oZXZlbnRIYXNoLCBwcml2YXRlS2V5Qnl0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgLi4uZXZlbnQsXG4gICAgaWQ6IGJ5dGVzVG9IZXgoZXZlbnRIYXNoKSxcbiAgICBzaWc6IGJ5dGVzVG9IZXgoc2lnbmF0dXJlQnl0ZXMpLFxuICB9O1xufVxuXG4vKipcbiAqIERlY3J5cHQgYW5kIHBhcnNlIGEga2luZCAyNDEzMyBldmVudFxuICogQHBhcmFtIGV2ZW50IC0gU2lnbmVkIGtpbmQgMjQxMzMgZXZlbnRcbiAqIEBwYXJhbSBzZXNzaW9uIC0gTklQLTQ2IHNlc3Npb25cbiAqIEByZXR1cm5zIERlY3J5cHRlZCBKU09OLVJQQyByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bndyYXBFdmVudChcbiAgZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQsXG4gIHNlc3Npb246IE5pcDQ2U2Vzc2lvblxuKTogTmlwNDZSZXF1ZXN0IHwgTmlwNDZSZXNwb25zZSB7XG4gIGlmIChldmVudC5raW5kICE9PSAyNDEzMykge1xuICAgIHRocm93IG5ldyBFcnJvcihgZXhwZWN0ZWQga2luZCAyNDEzMywgZ290ICR7ZXZlbnQua2luZH1gKTtcbiAgfVxuXG4gIGNvbnN0IGpzb24gPSBuaXA0NERlY3J5cHQoZXZlbnQuY29udGVudCwgc2Vzc2lvbi5jb252ZXJzYXRpb25LZXkpO1xuICByZXR1cm4gcGFyc2VQYXlsb2FkKGpzb24pO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgNS4gQ29udmVuaWVuY2UgUmVxdWVzdCBDcmVhdG9ycyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBDcmVhdGUgYSAnY29ubmVjdCcgcmVxdWVzdFxuICogQHBhcmFtIHJlbW90ZVB1YmtleSAtIFJlbW90ZSBzaWduZXIncyBwdWJrZXlcbiAqIEBwYXJhbSBzZWNyZXQgLSBPcHRpb25hbCBjb25uZWN0aW9uIHNlY3JldCBmcm9tIGJ1bmtlciBVUklcbiAqIEBwYXJhbSBwZXJtaXNzaW9ucyAtIE9wdGlvbmFsIGNvbW1hLXNlcGFyYXRlZCBwZXJtaXNzaW9uIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gY29ubmVjdFJlcXVlc3QocmVtb3RlUHVia2V5OiBzdHJpbmcsIHNlY3JldD86IHN0cmluZywgcGVybWlzc2lvbnM/OiBzdHJpbmcpOiBOaXA0NlJlcXVlc3Qge1xuICBjb25zdCBwYXJhbXMgPSBbcmVtb3RlUHVia2V5XTtcbiAgaWYgKHNlY3JldCkgcGFyYW1zLnB1c2goc2VjcmV0KTtcbiAgZWxzZSBpZiAocGVybWlzc2lvbnMpIHBhcmFtcy5wdXNoKCcnKTtcbiAgaWYgKHBlcm1pc3Npb25zKSBwYXJhbXMucHVzaChwZXJtaXNzaW9ucyk7XG4gIHJldHVybiBjcmVhdGVSZXF1ZXN0KE5pcDQ2TWV0aG9kLkNPTk5FQ1QsIHBhcmFtcyk7XG59XG5cbi8qKiBDcmVhdGUgYSAncGluZycgcmVxdWVzdCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBpbmdSZXF1ZXN0KCk6IE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiBjcmVhdGVSZXF1ZXN0KE5pcDQ2TWV0aG9kLlBJTkcsIFtdKTtcbn1cblxuLyoqIENyZWF0ZSBhICdnZXRfcHVibGljX2tleScgcmVxdWVzdCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFB1YmxpY0tleVJlcXVlc3QoKTogTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuR0VUX1BVQkxJQ19LRVksIFtdKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSAnc2lnbl9ldmVudCcgcmVxdWVzdFxuICogQHBhcmFtIGV2ZW50SnNvbiAtIEpTT04tc3RyaW5naWZpZWQgdW5zaWduZWQgZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNpZ25FdmVudFJlcXVlc3QoZXZlbnRKc29uOiBzdHJpbmcpOiBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gY3JlYXRlUmVxdWVzdChOaXA0Nk1ldGhvZC5TSUdOX0VWRU5ULCBbZXZlbnRKc29uXSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgJ25pcDA0X2VuY3J5cHQnIHJlcXVlc3RcbiAqIEBwYXJhbSB0aGlyZFBhcnR5UHVia2V5IC0gUHVibGljIGtleSBvZiB0aGUgbWVzc2FnZSByZWNpcGllbnRcbiAqIEBwYXJhbSBwbGFpbnRleHQgLSBNZXNzYWdlIHRvIGVuY3J5cHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5pcDA0RW5jcnlwdFJlcXVlc3QodGhpcmRQYXJ0eVB1YmtleTogc3RyaW5nLCBwbGFpbnRleHQ6IHN0cmluZyk6IE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiBjcmVhdGVSZXF1ZXN0KE5pcDQ2TWV0aG9kLk5JUDA0X0VOQ1JZUFQsIFt0aGlyZFBhcnR5UHVia2V5LCBwbGFpbnRleHRdKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSAnbmlwMDRfZGVjcnlwdCcgcmVxdWVzdFxuICogQHBhcmFtIHRoaXJkUGFydHlQdWJrZXkgLSBQdWJsaWMga2V5IG9mIHRoZSBtZXNzYWdlIHNlbmRlclxuICogQHBhcmFtIGNpcGhlcnRleHQgLSBFbmNyeXB0ZWQgbWVzc2FnZSB0byBkZWNyeXB0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuaXAwNERlY3J5cHRSZXF1ZXN0KHRoaXJkUGFydHlQdWJrZXk6IHN0cmluZywgY2lwaGVydGV4dDogc3RyaW5nKTogTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuTklQMDRfREVDUllQVCwgW3RoaXJkUGFydHlQdWJrZXksIGNpcGhlcnRleHRdKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSAnbmlwNDRfZW5jcnlwdCcgcmVxdWVzdFxuICogQHBhcmFtIHRoaXJkUGFydHlQdWJrZXkgLSBQdWJsaWMga2V5IG9mIHRoZSBtZXNzYWdlIHJlY2lwaWVudFxuICogQHBhcmFtIHBsYWludGV4dCAtIE1lc3NhZ2UgdG8gZW5jcnlwdFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmlwNDRFbmNyeXB0UmVxdWVzdCh0aGlyZFBhcnR5UHVia2V5OiBzdHJpbmcsIHBsYWludGV4dDogc3RyaW5nKTogTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuTklQNDRfRU5DUllQVCwgW3RoaXJkUGFydHlQdWJrZXksIHBsYWludGV4dF0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhICduaXA0NF9kZWNyeXB0JyByZXF1ZXN0XG4gKiBAcGFyYW0gdGhpcmRQYXJ0eVB1YmtleSAtIFB1YmxpYyBrZXkgb2YgdGhlIG1lc3NhZ2Ugc2VuZGVyXG4gKiBAcGFyYW0gY2lwaGVydGV4dCAtIEVuY3J5cHRlZCBtZXNzYWdlIHRvIGRlY3J5cHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5pcDQ0RGVjcnlwdFJlcXVlc3QodGhpcmRQYXJ0eVB1YmtleTogc3RyaW5nLCBjaXBoZXJ0ZXh0OiBzdHJpbmcpOiBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gY3JlYXRlUmVxdWVzdChOaXA0Nk1ldGhvZC5OSVA0NF9ERUNSWVBULCBbdGhpcmRQYXJ0eVB1YmtleSwgY2lwaGVydGV4dF0pO1xufVxuXG4vKiogQ3JlYXRlIGEgJ2dldF9yZWxheXMnIHJlcXVlc3QgKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZWxheXNSZXF1ZXN0KCk6IE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiBjcmVhdGVSZXF1ZXN0KE5pcDQ2TWV0aG9kLkdFVF9SRUxBWVMsIFtdKTtcbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwIDYuIEZpbHRlciBIZWxwZXIgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKlxuICogQ3JlYXRlIGEgTm9zdHIgZmlsdGVyIGZvciBzdWJzY3JpYmluZyB0byBOSVAtNDYgcmVzcG9uc2UgZXZlbnRzXG4gKiBAcGFyYW0gY2xpZW50UHVia2V5IC0gT3VyIGVwaGVtZXJhbCBwdWJsaWMga2V5IChoZXgpXG4gKiBAcGFyYW0gc2luY2UgLSBPcHRpb25hbCBzaW5jZSB0aW1lc3RhbXBcbiAqIEByZXR1cm5zIEZpbHRlciBvYmplY3QgZm9yIGtpbmQgMjQxMzMgZXZlbnRzIHRhZ2dlZCB0byB1c1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmVzcG9uc2VGaWx0ZXIoXG4gIGNsaWVudFB1YmtleTogc3RyaW5nLFxuICBzaW5jZT86IG51bWJlclxuKTogeyBraW5kczogbnVtYmVyW107ICcjcCc6IHN0cmluZ1tdOyBzaW5jZT86IG51bWJlciB9IHtcbiAgY29uc3QgZmlsdGVyOiB7IGtpbmRzOiBudW1iZXJbXTsgJyNwJzogc3RyaW5nW107IHNpbmNlPzogbnVtYmVyIH0gPSB7XG4gICAga2luZHM6IFsyNDEzM10sXG4gICAgJyNwJzogW2NsaWVudFB1YmtleV0sXG4gIH07XG4gIGlmIChzaW5jZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZmlsdGVyLnNpbmNlID0gc2luY2U7XG4gIH1cbiAgcmV0dXJuIGZpbHRlcjtcbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgbmlwcy9uaXAtNDlcbiAqIEBkZXNjcmlwdGlvbiBJbXBsZW1lbnRhdGlvbiBvZiBOSVAtNDkgKFByaXZhdGUgS2V5IEVuY3J5cHRpb24gLyBuY3J5cHRzZWMpXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ5Lm1kXG4gKi9cblxuaW1wb3J0IHsgeGNoYWNoYTIwcG9seTEzMDUgfSBmcm9tICdAbm9ibGUvY2lwaGVycy9jaGFjaGEuanMnO1xuaW1wb3J0IHsgc2NyeXB0IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zY3J5cHQuanMnO1xuaW1wb3J0IHsgY29uY2F0Qnl0ZXMsIHJhbmRvbUJ5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBiZWNoMzIgYXMgc2N1cmVCZWNoMzIgfSBmcm9tICdAc2N1cmUvYmFzZSc7XG5cbnR5cGUgS2V5U2VjdXJpdHlCeXRlID0gMHgwMCB8IDB4MDEgfCAweDAyO1xuXG4vKipcbiAqIEVuY3J5cHQgYSBOb3N0ciBwcml2YXRlIGtleSB3aXRoIGEgcGFzc3dvcmQsIHByb2R1Y2luZyBhbiBuY3J5cHRzZWMgYmVjaDMyIHN0cmluZ1xuICogQHBhcmFtIHNlYyAtIDMyLWJ5dGUgc2VjcmV0IGtleVxuICogQHBhcmFtIHBhc3N3b3JkIC0gUGFzc3dvcmQgZm9yIGVuY3J5cHRpb25cbiAqIEBwYXJhbSBsb2duIC0gU2NyeXB0IGxvZzIoTikgcGFyYW1ldGVyIChkZWZhdWx0OiAxNiwgbWVhbmluZyBOPTY1NTM2KVxuICogQHBhcmFtIGtzYiAtIEtleSBzZWN1cml0eSBieXRlOiAweDAwPXVua25vd24sIDB4MDE9dW5zYWZlLCAweDAyPXNhZmUgKGRlZmF1bHQ6IDB4MDIpXG4gKiBAcmV0dXJucyBiZWNoMzItZW5jb2RlZCBuY3J5cHRzZWMgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmNyeXB0KFxuICBzZWM6IFVpbnQ4QXJyYXksXG4gIHBhc3N3b3JkOiBzdHJpbmcsXG4gIGxvZ246IG51bWJlciA9IDE2LFxuICBrc2I6IEtleVNlY3VyaXR5Qnl0ZSA9IDB4MDJcbik6IHN0cmluZyB7XG4gIGNvbnN0IHNhbHQgPSByYW5kb21CeXRlcygxNik7XG4gIGNvbnN0IG4gPSAyICoqIGxvZ247XG4gIGNvbnN0IG5vcm1hbGl6ZWRQYXNzd29yZCA9IHBhc3N3b3JkLm5vcm1hbGl6ZSgnTkZLQycpO1xuICBjb25zdCBrZXkgPSBzY3J5cHQobm9ybWFsaXplZFBhc3N3b3JkLCBzYWx0LCB7IE46IG4sIHI6IDgsIHA6IDEsIGRrTGVuOiAzMiB9KTtcbiAgY29uc3Qgbm9uY2UgPSByYW5kb21CeXRlcygyNCk7XG4gIGNvbnN0IGFhZCA9IFVpbnQ4QXJyYXkuZnJvbShba3NiXSk7XG4gIGNvbnN0IGNpcGhlciA9IHhjaGFjaGEyMHBvbHkxMzA1KGtleSwgbm9uY2UsIGFhZCk7XG4gIGNvbnN0IGNpcGhlcnRleHQgPSBjaXBoZXIuZW5jcnlwdChzZWMpO1xuICAvLyBCaW5hcnkgZm9ybWF0OiB2ZXJzaW9uKDEpICsgbG9nbigxKSArIHNhbHQoMTYpICsgbm9uY2UoMjQpICsga3NiKDEpICsgY2lwaGVydGV4dCg0OCA9IDMyICsgMTYgdGFnKVxuICBjb25zdCBwYXlsb2FkID0gY29uY2F0Qnl0ZXMoXG4gICAgVWludDhBcnJheS5mcm9tKFsweDAyXSksXG4gICAgVWludDhBcnJheS5mcm9tKFtsb2duXSksXG4gICAgc2FsdCxcbiAgICBub25jZSxcbiAgICBhYWQsXG4gICAgY2lwaGVydGV4dFxuICApO1xuICBjb25zdCB3b3JkcyA9IHNjdXJlQmVjaDMyLnRvV29yZHMocGF5bG9hZCk7XG4gIHJldHVybiBzY3VyZUJlY2gzMi5lbmNvZGUoJ25jcnlwdHNlYycsIHdvcmRzLCAyMDApO1xufVxuXG4vKipcbiAqIERlY3J5cHQgYW4gbmNyeXB0c2VjIGJlY2gzMiBzdHJpbmcgYmFjayB0byB0aGUgMzItYnl0ZSBzZWNyZXQga2V5XG4gKiBAcGFyYW0gbmNyeXB0c2VjIC0gYmVjaDMyLWVuY29kZWQgbmNyeXB0c2VjIHN0cmluZ1xuICogQHBhcmFtIHBhc3N3b3JkIC0gUGFzc3dvcmQgdXNlZCBmb3IgZW5jcnlwdGlvblxuICogQHJldHVybnMgMzItYnl0ZSBzZWNyZXQga2V5IGFzIFVpbnQ4QXJyYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY3J5cHQobmNyeXB0c2VjOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgY29uc3QgeyBwcmVmaXgsIHdvcmRzIH0gPSBzY3VyZUJlY2gzMi5kZWNvZGUobmNyeXB0c2VjIGFzIGAke3N0cmluZ30xJHtzdHJpbmd9YCwgMjAwKTtcbiAgaWYgKHByZWZpeCAhPT0gJ25jcnlwdHNlYycpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBuY3J5cHRzZWMgcHJlZml4Jyk7XG4gIGNvbnN0IGRhdGEgPSBuZXcgVWludDhBcnJheShzY3VyZUJlY2gzMi5mcm9tV29yZHMod29yZHMpKTtcbiAgY29uc3QgdmVyc2lvbiA9IGRhdGFbMF07XG4gIGlmICh2ZXJzaW9uICE9PSAweDAyKSB0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gbmNyeXB0c2VjIHZlcnNpb246ICR7dmVyc2lvbn1gKTtcbiAgY29uc3QgbG9nbiA9IGRhdGFbMV07XG4gIGNvbnN0IHNhbHQgPSBkYXRhLnN1YmFycmF5KDIsIDE4KTtcbiAgY29uc3Qgbm9uY2UgPSBkYXRhLnN1YmFycmF5KDE4LCA0Mik7XG4gIGNvbnN0IGtzYiA9IGRhdGFbNDJdO1xuICBjb25zdCBjaXBoZXJ0ZXh0ID0gZGF0YS5zdWJhcnJheSg0Myk7XG4gIGNvbnN0IG4gPSAyICoqIGxvZ247XG4gIGNvbnN0IG5vcm1hbGl6ZWRQYXNzd29yZCA9IHBhc3N3b3JkLm5vcm1hbGl6ZSgnTkZLQycpO1xuICBjb25zdCBrZXkgPSBzY3J5cHQobm9ybWFsaXplZFBhc3N3b3JkLCBzYWx0LCB7IE46IG4sIHI6IDgsIHA6IDEsIGRrTGVuOiAzMiB9KTtcbiAgY29uc3QgYWFkID0gVWludDhBcnJheS5mcm9tKFtrc2JdKTtcbiAgY29uc3QgY2lwaGVyID0geGNoYWNoYTIwcG9seTEzMDUoa2V5LCBub25jZSwgYWFkKTtcbiAgcmV0dXJuIGNpcGhlci5kZWNyeXB0KGNpcGhlcnRleHQpO1xufVxuIiwgIi8qKlxuICogVXRpbGl0eSBmdW5jdGlvbnMgZm9yIGVuY29kaW5nIGFuZCBkZWNvZGluZyBkYXRhXG4gKi9cblxuLyoqXG4gKiBDb252ZXJ0IGEgaGV4IHN0cmluZyB0byBVaW50OEFycmF5XG4gKiBAcGFyYW0gaGV4IEhleCBzdHJpbmcgdG8gY29udmVydFxuICogQHJldHVybnMgVWludDhBcnJheSBvZiBieXRlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gaGV4VG9CeXRlcyhoZXg6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoaGV4Lmxlbmd0aCAvIDIpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGV4Lmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIGJ5dGVzW2kgLyAyXSA9IHBhcnNlSW50KGhleC5zbGljZShpLCBpICsgMiksIDE2KTtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVzO1xufVxuXG4vKipcbiAqIENvbnZlcnQgVWludDhBcnJheSB0byBoZXggc3RyaW5nXG4gKiBAcGFyYW0gYnl0ZXMgVWludDhBcnJheSB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBIZXggc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvSGV4KGJ5dGVzOiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShieXRlcylcbiAgICAgICAgLm1hcChiID0+IGIudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpXG4gICAgICAgIC5qb2luKCcnKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgVVRGLTggc3RyaW5nIHRvIFVpbnQ4QXJyYXlcbiAqIEBwYXJhbSBzdHIgVVRGLTggc3RyaW5nIHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIFVpbnQ4QXJyYXkgb2YgYnl0ZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHV0ZjhUb0J5dGVzKHN0cjogc3RyaW5nKTogVWludDhBcnJheSB7XG4gICAgcmV0dXJuIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzdHIpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgVWludDhBcnJheSB0byBVVEYtOCBzdHJpbmdcbiAqIEBwYXJhbSBieXRlcyBVaW50OEFycmF5IHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIFVURi04IHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gYnl0ZXNUb1V0ZjgoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoYnl0ZXMpO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE1BTVc7QUFOWDtBQUFBO0FBTU8sTUFBSSxVQUFVO0FBQUEsUUFDakIsS0FBSyxFQUFFLFVBQVUsY0FBYyxXQUFXLE9BQU87QUFBQSxRQUNqRCxTQUFTO0FBQUEsUUFDVCxTQUFTO0FBQUEsUUFDVCxRQUFRO0FBQUEsUUFDUixRQUFRO0FBQUEsUUFDUixVQUFVLFNBQVUsSUFBSTtBQUNwQixjQUFJLE9BQU8sTUFBTSxVQUFVLE1BQU0sS0FBSyxXQUFXLENBQUM7QUFDbEQsa0JBQVEsUUFBUSxFQUFFLEtBQUssV0FBWTtBQUFFLGVBQUcsTUFBTSxNQUFNLElBQUk7QUFBQSxVQUFHLENBQUM7QUFBQSxRQUNoRTtBQUFBLE1BQ0o7QUFBQTtBQUFBOzs7QUNoQkE7QUFBQTtBQUFBO0FBQUE7QUFDQSxlQUFTLGFBQWMsR0FBRztBQUN4QixZQUFJO0FBQUUsaUJBQU8sS0FBSyxVQUFVLENBQUM7QUFBQSxRQUFFLFNBQVEsR0FBRztBQUFFLGlCQUFPO0FBQUEsUUFBZTtBQUFBLE1BQ3BFO0FBRUEsYUFBTyxVQUFVO0FBRWpCLGVBQVMsT0FBTyxHQUFHLE1BQU0sTUFBTTtBQUM3QixZQUFJLEtBQU0sUUFBUSxLQUFLLGFBQWM7QUFDckMsWUFBSSxTQUFTO0FBQ2IsWUFBSSxPQUFPLE1BQU0sWUFBWSxNQUFNLE1BQU07QUFDdkMsY0FBSSxNQUFNLEtBQUssU0FBUztBQUN4QixjQUFJLFFBQVEsRUFBRyxRQUFPO0FBQ3RCLGNBQUksVUFBVSxJQUFJLE1BQU0sR0FBRztBQUMzQixrQkFBUSxDQUFDLElBQUksR0FBRyxDQUFDO0FBQ2pCLG1CQUFTLFFBQVEsR0FBRyxRQUFRLEtBQUssU0FBUztBQUN4QyxvQkFBUSxLQUFLLElBQUksR0FBRyxLQUFLLEtBQUssQ0FBQztBQUFBLFVBQ2pDO0FBQ0EsaUJBQU8sUUFBUSxLQUFLLEdBQUc7QUFBQSxRQUN6QjtBQUNBLFlBQUksT0FBTyxNQUFNLFVBQVU7QUFDekIsaUJBQU87QUFBQSxRQUNUO0FBQ0EsWUFBSSxTQUFTLEtBQUs7QUFDbEIsWUFBSSxXQUFXLEVBQUcsUUFBTztBQUN6QixZQUFJLE1BQU07QUFDVixZQUFJLElBQUksSUFBSTtBQUNaLFlBQUksVUFBVTtBQUNkLFlBQUksT0FBUSxLQUFLLEVBQUUsVUFBVztBQUM5QixpQkFBUyxJQUFJLEdBQUcsSUFBSSxRQUFPO0FBQ3pCLGNBQUksRUFBRSxXQUFXLENBQUMsTUFBTSxNQUFNLElBQUksSUFBSSxNQUFNO0FBQzFDLHNCQUFVLFVBQVUsS0FBSyxVQUFVO0FBQ25DLG9CQUFRLEVBQUUsV0FBVyxJQUFJLENBQUMsR0FBRztBQUFBLGNBQzNCLEtBQUs7QUFBQTtBQUFBLGNBQ0wsS0FBSztBQUNILG9CQUFJLEtBQUs7QUFDUDtBQUNGLG9CQUFJLEtBQUssQ0FBQyxLQUFLLEtBQU87QUFDdEIsb0JBQUksVUFBVTtBQUNaLHlCQUFPLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDM0IsdUJBQU8sT0FBTyxLQUFLLENBQUMsQ0FBQztBQUNyQiwwQkFBVSxJQUFJO0FBQ2Q7QUFDQTtBQUFBLGNBQ0YsS0FBSztBQUNILG9CQUFJLEtBQUs7QUFDUDtBQUNGLG9CQUFJLEtBQUssQ0FBQyxLQUFLLEtBQU87QUFDdEIsb0JBQUksVUFBVTtBQUNaLHlCQUFPLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDM0IsdUJBQU8sS0FBSyxNQUFNLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNqQywwQkFBVSxJQUFJO0FBQ2Q7QUFDQTtBQUFBLGNBQ0YsS0FBSztBQUFBO0FBQUEsY0FDTCxLQUFLO0FBQUE7QUFBQSxjQUNMLEtBQUs7QUFDSCxvQkFBSSxLQUFLO0FBQ1A7QUFDRixvQkFBSSxLQUFLLENBQUMsTUFBTSxPQUFXO0FBQzNCLG9CQUFJLFVBQVU7QUFDWix5QkFBTyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQzNCLG9CQUFJLE9BQU8sT0FBTyxLQUFLLENBQUM7QUFDeEIsb0JBQUksU0FBUyxVQUFVO0FBQ3JCLHlCQUFPLE1BQU8sS0FBSyxDQUFDLElBQUk7QUFDeEIsNEJBQVUsSUFBSTtBQUNkO0FBQ0E7QUFBQSxnQkFDRjtBQUNBLG9CQUFJLFNBQVMsWUFBWTtBQUN2Qix5QkFBTyxLQUFLLENBQUMsRUFBRSxRQUFRO0FBQ3ZCLDRCQUFVLElBQUk7QUFDZDtBQUNBO0FBQUEsZ0JBQ0Y7QUFDQSx1QkFBTyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ2pCLDBCQUFVLElBQUk7QUFDZDtBQUNBO0FBQUEsY0FDRixLQUFLO0FBQ0gsb0JBQUksS0FBSztBQUNQO0FBQ0Ysb0JBQUksVUFBVTtBQUNaLHlCQUFPLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDM0IsdUJBQU8sT0FBTyxLQUFLLENBQUMsQ0FBQztBQUNyQiwwQkFBVSxJQUFJO0FBQ2Q7QUFDQTtBQUFBLGNBQ0YsS0FBSztBQUNILG9CQUFJLFVBQVU7QUFDWix5QkFBTyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQzNCLHVCQUFPO0FBQ1AsMEJBQVUsSUFBSTtBQUNkO0FBQ0E7QUFDQTtBQUFBLFlBQ0o7QUFDQSxjQUFFO0FBQUEsVUFDSjtBQUNBLFlBQUU7QUFBQSxRQUNKO0FBQ0EsWUFBSSxZQUFZO0FBQ2QsaUJBQU87QUFBQSxpQkFDQSxVQUFVLE1BQU07QUFDdkIsaUJBQU8sRUFBRSxNQUFNLE9BQU87QUFBQSxRQUN4QjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBQUE7QUFBQTs7O0FDNUdBO0FBQUE7QUFBQTtBQUFBO0FBRUEsVUFBTSxTQUFTO0FBRWYsYUFBTyxVQUFVQTtBQUVqQixVQUFNLFdBQVcsdUJBQXVCLEVBQUUsV0FBVyxDQUFDO0FBQ3RELFVBQU0saUJBQWlCO0FBQUEsUUFDckIsZ0JBQWdCO0FBQUEsUUFDaEIsaUJBQWlCO0FBQUEsUUFDakIsdUJBQXVCO0FBQUEsUUFDdkIsd0JBQXdCO0FBQUEsUUFDeEIscUJBQXFCO0FBQUEsUUFDckIsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsY0FBYztBQUFBLE1BQ2hCO0FBQ0EsZUFBUyxhQUFjLE9BQU9DLFNBQVE7QUFDcEMsZUFBTyxVQUFVLFdBQ2IsV0FDQUEsUUFBTyxPQUFPLE9BQU8sS0FBSztBQUFBLE1BQ2hDO0FBQ0EsVUFBTSx3QkFBd0IsdUJBQU8sZUFBZTtBQUNwRCxVQUFNLGtCQUFrQix1QkFBTyxnQkFBZ0I7QUFFL0MsVUFBTSxpQkFBaUI7QUFBQSxRQUNyQixPQUFPO0FBQUEsUUFDUCxPQUFPO0FBQUEsUUFDUCxNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsUUFDTixPQUFPO0FBQUEsUUFDUCxPQUFPO0FBQUEsTUFDVDtBQUVBLGVBQVMsa0JBQW1CLGNBQWMsYUFBYTtBQUNyRCxjQUFNLFdBQVc7QUFBQSxVQUNmLFFBQVE7QUFBQSxVQUNSLFFBQVEsYUFBYSxlQUFlO0FBQUEsUUFDdEM7QUFDQSxvQkFBWSxlQUFlLElBQUk7QUFBQSxNQUNqQztBQUVBLGVBQVMsc0JBQXVCQSxTQUFRLFFBQVEsT0FBTztBQUNyRCxjQUFNLGVBQWUsQ0FBQztBQUN0QixlQUFPLFFBQVEsV0FBUztBQUN0Qix1QkFBYSxLQUFLLElBQUksTUFBTSxLQUFLLElBQUksTUFBTSxLQUFLLElBQUssU0FBUyxLQUFLLEtBQUssU0FBUyxlQUFlLEtBQUssS0FBSyxLQUFLLEtBQUs7QUFBQSxRQUN0SCxDQUFDO0FBQ0QsUUFBQUEsUUFBTyxxQkFBcUIsSUFBSTtBQUFBLE1BQ2xDO0FBRUEsZUFBUyxnQkFBaUIsV0FBVyxhQUFhO0FBQ2hELFlBQUksTUFBTSxRQUFRLFNBQVMsR0FBRztBQUM1QixnQkFBTSxjQUFjLFVBQVUsT0FBTyxTQUFVLEdBQUc7QUFDaEQsbUJBQU8sTUFBTTtBQUFBLFVBQ2YsQ0FBQztBQUNELGlCQUFPO0FBQUEsUUFDVCxXQUFXLGNBQWMsTUFBTTtBQUM3QixpQkFBTyxPQUFPLEtBQUssV0FBVztBQUFBLFFBQ2hDO0FBRUEsZUFBTztBQUFBLE1BQ1Q7QUFFQSxlQUFTRCxNQUFNLE1BQU07QUFDbkIsZUFBTyxRQUFRLENBQUM7QUFDaEIsYUFBSyxVQUFVLEtBQUssV0FBVyxDQUFDO0FBRWhDLGNBQU1FLFlBQVcsS0FBSyxRQUFRO0FBQzlCLFlBQUlBLGFBQVksT0FBT0EsVUFBUyxTQUFTLFlBQVk7QUFBRSxnQkFBTSxNQUFNLGlEQUFpRDtBQUFBLFFBQUU7QUFFdEgsY0FBTSxRQUFRLEtBQUssUUFBUSxTQUFTO0FBQ3BDLFlBQUksS0FBSyxRQUFRLE1BQU8sTUFBSyxRQUFRLFdBQVc7QUFDaEQsY0FBTSxjQUFjLEtBQUssZUFBZSxDQUFDO0FBQ3pDLGNBQU0sWUFBWSxnQkFBZ0IsS0FBSyxRQUFRLFdBQVcsV0FBVztBQUNyRSxZQUFJLGtCQUFrQixLQUFLLFFBQVE7QUFFbkMsWUFDRSxNQUFNLFFBQVEsS0FBSyxRQUFRLFNBQVMsS0FDcEMsS0FBSyxRQUFRLFVBQVUsUUFBUSxxQkFBcUIsSUFBSSxHQUN4RCxtQkFBa0I7QUFFcEIsY0FBTSxlQUFlLE9BQU8sS0FBSyxLQUFLLGdCQUFnQixDQUFDLENBQUM7QUFDeEQsY0FBTSxTQUFTLENBQUMsU0FBUyxTQUFTLFFBQVEsUUFBUSxTQUFTLE9BQU8sRUFBRSxPQUFPLFlBQVk7QUFFdkYsWUFBSSxPQUFPLFVBQVUsWUFBWTtBQUMvQixpQkFBTyxRQUFRLFNBQVVDLFFBQU87QUFDOUIsa0JBQU1BLE1BQUssSUFBSTtBQUFBLFVBQ2pCLENBQUM7QUFBQSxRQUNIO0FBQ0EsWUFBSSxLQUFLLFlBQVksU0FBUyxLQUFLLFFBQVEsU0FBVSxNQUFLLFFBQVE7QUFDbEUsY0FBTSxRQUFRLEtBQUssU0FBUztBQUM1QixjQUFNRixVQUFTLE9BQU8sT0FBTyxLQUFLO0FBQ2xDLFlBQUksQ0FBQ0EsUUFBTyxJQUFLLENBQUFBLFFBQU8sTUFBTTtBQUU5Qiw4QkFBc0JBLFNBQVEsUUFBUSxLQUFLO0FBRTNDLDBCQUFrQixDQUFDLEdBQUdBLE9BQU07QUFFNUIsZUFBTyxlQUFlQSxTQUFRLFlBQVk7QUFBQSxVQUN4QyxLQUFLO0FBQUEsUUFDUCxDQUFDO0FBQ0QsZUFBTyxlQUFlQSxTQUFRLFNBQVM7QUFBQSxVQUNyQyxLQUFLO0FBQUEsVUFDTCxLQUFLO0FBQUEsUUFDUCxDQUFDO0FBRUQsY0FBTSxVQUFVO0FBQUEsVUFDZCxVQUFBQztBQUFBLFVBQ0E7QUFBQSxVQUNBLFVBQVUsS0FBSyxRQUFRO0FBQUEsVUFDdkIsc0JBQXNCLEtBQUssUUFBUTtBQUFBLFVBQ25DLFlBQVksS0FBSyxRQUFRO0FBQUEsVUFDekIsY0FBYyxLQUFLLFFBQVE7QUFBQSxVQUMzQjtBQUFBLFVBQ0EsV0FBVyxnQkFBZ0IsSUFBSTtBQUFBLFVBQy9CLFlBQVksS0FBSyxjQUFjO0FBQUEsVUFDL0IsU0FBUyxLQUFLLFdBQVc7QUFBQSxRQUMzQjtBQUNBLFFBQUFELFFBQU8sU0FBUyxVQUFVLElBQUk7QUFDOUIsUUFBQUEsUUFBTyxRQUFRO0FBRWYsUUFBQUEsUUFBTyxpQkFBaUIsU0FBVUUsUUFBTztBQUN2QyxjQUFJLENBQUMsS0FBSyxPQUFPLE9BQU9BLE1BQUssR0FBRztBQUM5QixtQkFBTztBQUFBLFVBQ1Q7QUFFQSxpQkFBTyxLQUFLLE9BQU8sT0FBT0EsTUFBSyxLQUFLLEtBQUssT0FBTyxPQUFPLEtBQUssS0FBSztBQUFBLFFBQ25FO0FBQ0EsUUFBQUYsUUFBTyxrQkFBa0JBLFFBQU8sa0JBQ2hDQSxRQUFPLE9BQU9BLFFBQU8sY0FBY0EsUUFBTyxLQUMxQ0EsUUFBTyxrQkFBa0JBLFFBQU8sT0FDaENBLFFBQU8sc0JBQXNCQSxRQUFPLGlCQUNwQ0EsUUFBTyxxQkFBcUJBLFFBQU8sWUFDbkNBLFFBQU8sZ0JBQWdCQSxRQUFPLGFBQzlCQSxRQUFPLFFBQVFBLFFBQU8sUUFBUTtBQUM5QixRQUFBQSxRQUFPLGNBQWM7QUFDckIsUUFBQUEsUUFBTyxhQUFhO0FBQ3BCLFFBQUFBLFFBQU8sbUJBQW1CO0FBQzFCLFFBQUFBLFFBQU8sUUFBUSxZQUFhLE1BQU07QUFBRSxpQkFBTyxNQUFNLEtBQUssTUFBTSxTQUFTLEdBQUcsSUFBSTtBQUFBLFFBQUU7QUFFOUUsWUFBSUMsVUFBVSxDQUFBRCxRQUFPLFlBQVksb0JBQW9CO0FBRXJELGlCQUFTLGNBQWU7QUFDdEIsaUJBQU8sYUFBYSxLQUFLLE9BQU8sSUFBSTtBQUFBLFFBQ3RDO0FBRUEsaUJBQVMsV0FBWTtBQUNuQixpQkFBTyxLQUFLO0FBQUEsUUFDZDtBQUNBLGlCQUFTLFNBQVVFLFFBQU87QUFDeEIsY0FBSUEsV0FBVSxZQUFZLENBQUMsS0FBSyxPQUFPLE9BQU9BLE1BQUssR0FBRztBQUNwRCxrQkFBTSxNQUFNLG1CQUFtQkEsTUFBSztBQUFBLFVBQ3RDO0FBQ0EsZUFBSyxTQUFTQTtBQUVkLGNBQUksTUFBTSxTQUFTRixTQUFRLE9BQU87QUFDbEMsY0FBSSxNQUFNLFNBQVNBLFNBQVEsT0FBTztBQUNsQyxjQUFJLE1BQU0sU0FBU0EsU0FBUSxNQUFNO0FBQ2pDLGNBQUksTUFBTSxTQUFTQSxTQUFRLE1BQU07QUFDakMsY0FBSSxNQUFNLFNBQVNBLFNBQVEsT0FBTztBQUNsQyxjQUFJLE1BQU0sU0FBU0EsU0FBUSxPQUFPO0FBRWxDLHVCQUFhLFFBQVEsQ0FBQ0UsV0FBVTtBQUM5QixnQkFBSSxNQUFNLFNBQVNGLFNBQVFFLE1BQUs7QUFBQSxVQUNsQyxDQUFDO0FBQUEsUUFDSDtBQUVBLGlCQUFTLE1BQU9DLFVBQVMsVUFBVSxjQUFjO0FBQy9DLGNBQUksQ0FBQyxVQUFVO0FBQ2Isa0JBQU0sSUFBSSxNQUFNLGlDQUFpQztBQUFBLFVBQ25EO0FBQ0EseUJBQWUsZ0JBQWdCLENBQUM7QUFDaEMsY0FBSSxhQUFhLFNBQVMsYUFBYTtBQUNyQyx5QkFBYSxjQUFjLFNBQVM7QUFBQSxVQUN0QztBQUNBLGdCQUFNLDBCQUEwQixhQUFhO0FBQzdDLGNBQUksYUFBYSx5QkFBeUI7QUFDeEMsZ0JBQUksbUJBQW1CLE9BQU8sT0FBTyxDQUFDLEdBQUcsYUFBYSx1QkFBdUI7QUFDN0UsZ0JBQUksaUJBQWlCLEtBQUssUUFBUSxjQUFjLE9BQzVDLE9BQU8sS0FBSyxnQkFBZ0IsSUFDNUI7QUFDSixtQkFBTyxTQUFTO0FBQ2hCLDZCQUFpQixDQUFDLFFBQVEsR0FBRyxnQkFBZ0Isa0JBQWtCLEtBQUssZ0JBQWdCO0FBQUEsVUFDdEY7QUFDQSxtQkFBUyxNQUFPLFFBQVE7QUFDdEIsaUJBQUssZUFBZSxPQUFPLGNBQWMsS0FBSztBQUc5QyxpQkFBSyxXQUFXO0FBRWhCLGdCQUFJLGtCQUFrQjtBQUNwQixtQkFBSyxjQUFjO0FBQ25CLG1CQUFLLGFBQWE7QUFBQSxZQUNwQjtBQUNBLGdCQUFJRixXQUFVO0FBQ1osbUJBQUssWUFBWTtBQUFBLGdCQUNmLENBQUMsRUFBRSxPQUFPLE9BQU8sVUFBVSxVQUFVLFFBQVE7QUFBQSxjQUMvQztBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQ0EsZ0JBQU0sWUFBWTtBQUNsQixnQkFBTSxZQUFZLElBQUksTUFBTSxJQUFJO0FBR2hDLDRCQUFrQixNQUFNLFNBQVM7QUFDakMsb0JBQVUsUUFBUSxZQUFhLE1BQU07QUFBRSxtQkFBTyxNQUFNLEtBQUssTUFBTUUsVUFBUyxHQUFHLElBQUk7QUFBQSxVQUFFO0FBRWpGLG9CQUFVLFFBQVEsYUFBYSxTQUFTLEtBQUs7QUFDN0MsVUFBQUEsU0FBUSxRQUFRLFNBQVM7QUFFekIsaUJBQU87QUFBQSxRQUNUO0FBQ0EsZUFBT0g7QUFBQSxNQUNUO0FBRUEsZUFBUyxVQUFXLE1BQU07QUFDeEIsY0FBTSxlQUFlLEtBQUssZ0JBQWdCLENBQUM7QUFFM0MsY0FBTSxTQUFTLE9BQU8sT0FBTyxDQUFDLEdBQUdELE1BQUssT0FBTyxRQUFRLFlBQVk7QUFDakUsY0FBTSxTQUFTLE9BQU8sT0FBTyxDQUFDLEdBQUdBLE1BQUssT0FBTyxRQUFRLGFBQWEsWUFBWSxDQUFDO0FBRS9FLGVBQU87QUFBQSxVQUNMO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBRUEsZUFBUyxhQUFjLEtBQUs7QUFDMUIsY0FBTSxXQUFXLENBQUM7QUFDbEIsZUFBTyxLQUFLLEdBQUcsRUFBRSxRQUFRLFNBQVUsS0FBSztBQUN0QyxtQkFBUyxJQUFJLEdBQUcsQ0FBQyxJQUFJO0FBQUEsUUFDdkIsQ0FBQztBQUNELGVBQU87QUFBQSxNQUNUO0FBRUEsTUFBQUEsTUFBSyxTQUFTO0FBQUEsUUFDWixRQUFRO0FBQUEsVUFDTixPQUFPO0FBQUEsVUFDUCxPQUFPO0FBQUEsVUFDUCxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsVUFDTixPQUFPO0FBQUEsVUFDUCxPQUFPO0FBQUEsUUFDVDtBQUFBLFFBQ0EsUUFBUTtBQUFBLFVBQ04sSUFBSTtBQUFBLFVBQ0osSUFBSTtBQUFBLFVBQ0osSUFBSTtBQUFBLFVBQ0osSUFBSTtBQUFBLFVBQ0osSUFBSTtBQUFBLFVBQ0osSUFBSTtBQUFBLFFBQ047QUFBQSxNQUNGO0FBRUEsTUFBQUEsTUFBSyxpQkFBaUI7QUFDdEIsTUFBQUEsTUFBSyxtQkFBbUIsT0FBTyxPQUFPLENBQUMsR0FBRyxFQUFFLFVBQVUsV0FBVyxVQUFVLFFBQVEsQ0FBQztBQUVwRixlQUFTLGdCQUFpQkMsU0FBUTtBQUNoQyxjQUFNLFdBQVcsQ0FBQztBQUNsQixZQUFJQSxRQUFPLFVBQVU7QUFDbkIsbUJBQVMsS0FBS0EsUUFBTyxRQUFRO0FBQUEsUUFDL0I7QUFHQSxZQUFJLFlBQVlBLFFBQU8sZUFBZTtBQUN0QyxlQUFPLFVBQVUsUUFBUTtBQUN2QixzQkFBWSxVQUFVO0FBQ3RCLGNBQUksVUFBVSxPQUFPLFVBQVU7QUFDN0IscUJBQVMsS0FBSyxVQUFVLE9BQU8sUUFBUTtBQUFBLFVBQ3pDO0FBQUEsUUFDRjtBQUVBLGVBQU8sU0FBUyxRQUFRO0FBQUEsTUFDMUI7QUFFQSxlQUFTLElBQUtJLE9BQU0sTUFBTSxZQUFZLE9BQU87QUFFM0MsZUFBTyxlQUFlQSxPQUFNLE9BQU87QUFBQSxVQUNqQyxPQUFRLGFBQWFBLE1BQUssT0FBTyxVQUFVLElBQUksYUFBYSxPQUFPLFVBQVUsSUFDekUsT0FDQSxXQUFXLHFCQUFxQixFQUFFLEtBQUs7QUFBQSxVQUMzQyxVQUFVO0FBQUEsVUFDVixZQUFZO0FBQUEsVUFDWixjQUFjO0FBQUEsUUFDaEIsQ0FBQztBQUVELFlBQUlBLE1BQUssS0FBSyxNQUFNLE1BQU07QUFDeEIsY0FBSSxDQUFDLEtBQUssU0FBVTtBQUVwQixnQkFBTSxnQkFBZ0IsS0FBSyxTQUFTLFNBQVNBLE1BQUs7QUFDbEQsZ0JBQU0sZ0JBQWdCLGFBQWEsZUFBZSxVQUFVO0FBQzVELGdCQUFNLGNBQWMsYUFBYSxPQUFPLFVBQVU7QUFDbEQsY0FBSSxjQUFjLGNBQWU7QUFBQSxRQUNuQztBQUdBLFFBQUFBLE1BQUssS0FBSyxJQUFJLFdBQVdBLE9BQU0sTUFBTSxZQUFZLEtBQUs7QUFHdEQsY0FBTSxXQUFXLGdCQUFnQkEsS0FBSTtBQUNyQyxZQUFJLFNBQVMsV0FBVyxHQUFHO0FBRXpCO0FBQUEsUUFDRjtBQUNBLFFBQUFBLE1BQUssS0FBSyxJQUFJLDJCQUEyQixVQUFVQSxNQUFLLEtBQUssQ0FBQztBQUFBLE1BQ2hFO0FBRUEsZUFBUywyQkFBNEIsVUFBVSxTQUFTO0FBQ3RELGVBQU8sV0FBWTtBQUNqQixpQkFBTyxRQUFRLE1BQU0sTUFBTSxDQUFDLEdBQUcsVUFBVSxHQUFHLFNBQVMsQ0FBQztBQUFBLFFBQ3hEO0FBQUEsTUFDRjtBQUVBLGVBQVMsV0FBWUEsT0FBTSxNQUFNLFlBQVksT0FBTztBQUNsRCxlQUFRLDBCQUFVLE9BQU87QUFDdkIsaUJBQU8sU0FBUyxNQUFPO0FBQ3JCLGtCQUFNLEtBQUssS0FBSyxVQUFVO0FBQzFCLGtCQUFNLE9BQU8sSUFBSSxNQUFNLFVBQVUsTUFBTTtBQUN2QyxrQkFBTSxRQUFTLE9BQU8sa0JBQWtCLE9BQU8sZUFBZSxJQUFJLE1BQU0sV0FBWSxXQUFXO0FBQy9GLHFCQUFTLElBQUksR0FBRyxJQUFJLEtBQUssUUFBUSxJQUFLLE1BQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQztBQUUzRCxnQkFBSSxtQkFBbUI7QUFDdkIsZ0JBQUksS0FBSyxXQUFXO0FBQ2xCLCtCQUFpQixNQUFNLEtBQUssWUFBWSxLQUFLLGFBQWEsS0FBSyxnQkFBZ0I7QUFDL0UsaUNBQW1CO0FBQUEsWUFDckI7QUFDQSxnQkFBSSxLQUFLLFlBQVksS0FBSyxZQUFZO0FBQ3BDLG9CQUFNLE1BQU0sU0FBUyxNQUFNLE9BQU8sTUFBTSxJQUFJLElBQUk7QUFDaEQsa0JBQUksS0FBSyxnQkFBZ0IsT0FBTyxJQUFJLFNBQVMsS0FBSyxJQUFJLENBQUMsS0FBSyxPQUFPLElBQUksQ0FBQyxNQUFNLFVBQVU7QUFDdEYsb0JBQUk7QUFDRix3QkFBTSxTQUFTLGtCQUFrQjtBQUNqQyxzQkFBSSxPQUFRLEtBQUksQ0FBQyxFQUFFLFNBQVM7QUFBQSxnQkFDOUIsU0FBUyxHQUFHO0FBQUEsZ0JBQUM7QUFBQSxjQUNmO0FBQ0Esb0JBQU0sS0FBSyxPQUFPLEdBQUcsR0FBRztBQUFBLFlBQzFCLE9BQU87QUFDTCxrQkFBSSxLQUFLLGNBQWM7QUFDckIsb0JBQUk7QUFDRix3QkFBTSxTQUFTLGtCQUFrQjtBQUNqQyxzQkFBSSxPQUFRLE1BQUssS0FBSyxNQUFNO0FBQUEsZ0JBQzlCLFNBQVMsR0FBRztBQUFBLGdCQUFDO0FBQUEsY0FDZjtBQUNBLG9CQUFNLE1BQU0sT0FBTyxJQUFJO0FBQUEsWUFDekI7QUFFQSxnQkFBSSxLQUFLLFVBQVU7QUFDakIsb0JBQU0sZ0JBQWdCLEtBQUssU0FBUyxTQUFTQSxNQUFLO0FBQ2xELG9CQUFNLGdCQUFnQixhQUFhLGVBQWUsVUFBVTtBQUM1RCxvQkFBTSxjQUFjLGFBQWEsT0FBTyxVQUFVO0FBQ2xELGtCQUFJLGNBQWMsY0FBZTtBQUNqQyx1QkFBUyxNQUFNO0FBQUEsZ0JBQ2I7QUFBQSxnQkFDQSxhQUFhO0FBQUEsZ0JBQ2I7QUFBQSxnQkFDQTtBQUFBLGdCQUNBLGVBQWUsV0FBVyxPQUFPLE9BQU8sS0FBSyxTQUFTLFNBQVNBLE1BQUssTUFBTTtBQUFBLGdCQUMxRSxNQUFNLEtBQUssU0FBUztBQUFBLGdCQUNwQixLQUFLLGFBQWFBLE1BQUssUUFBUSxVQUFVO0FBQUEsY0FDM0MsR0FBRyxNQUFNLGdCQUFnQjtBQUFBLFlBQzNCO0FBQUEsVUFDRjtBQUFBLFFBQ0YsR0FBR0EsTUFBSyxxQkFBcUIsRUFBRSxLQUFLLENBQUM7QUFBQSxNQUN2QztBQUVBLGVBQVMsU0FBVUosU0FBUSxPQUFPLE1BQU0sSUFBSSxNQUFNO0FBQ2hELGNBQU07QUFBQSxVQUNKLE9BQU87QUFBQSxVQUNQLEtBQUsscUJBQXFCLENBQUMsUUFBUTtBQUFBLFFBQ3JDLElBQUksS0FBSyxjQUFjLENBQUM7QUFDeEIsY0FBTSxhQUFhLEtBQUssTUFBTTtBQUM5QixZQUFJLE1BQU0sV0FBVyxDQUFDO0FBQ3RCLGNBQU0sWUFBWSxDQUFDO0FBRW5CLFlBQUksT0FBT0EsUUFBTyxjQUFjLEtBQUs7QUFDckMsWUFBSSxNQUFNLEVBQUcsT0FBTTtBQUVuQixZQUFJLElBQUk7QUFDTixvQkFBVSxPQUFPO0FBQUEsUUFDbkI7QUFFQSxZQUFJLGdCQUFnQjtBQUNsQixnQkFBTSxpQkFBaUIsZUFBZSxPQUFPQSxRQUFPLE9BQU8sT0FBTyxLQUFLLENBQUM7QUFDeEUsaUJBQU8sT0FBTyxXQUFXLGNBQWM7QUFBQSxRQUN6QyxPQUFPO0FBQ0wsb0JBQVUsUUFBUUEsUUFBTyxPQUFPLE9BQU8sS0FBSztBQUFBLFFBQzlDO0FBRUEsWUFBSSxLQUFLLHNCQUFzQjtBQUM3QixjQUFJLFFBQVEsUUFBUSxPQUFPLFFBQVEsVUFBVTtBQUMzQyxtQkFBTyxTQUFTLE9BQU8sV0FBVyxDQUFDLE1BQU0sVUFBVTtBQUNqRCxxQkFBTyxPQUFPLFdBQVcsV0FBVyxNQUFNLENBQUM7QUFBQSxZQUM3QztBQUFBLFVBQ0Y7QUFFQSxnQkFBTSxxQkFBcUIsbUJBQW1CLFNBQVM7QUFDdkQsaUJBQU8sQ0FBQyxvQkFBb0IsR0FBRyxVQUFVO0FBQUEsUUFDM0MsT0FBTztBQUVMLGNBQUksUUFBUSxRQUFRLE9BQU8sUUFBUSxVQUFVO0FBQzNDLG1CQUFPLFNBQVMsT0FBTyxXQUFXLENBQUMsTUFBTSxVQUFVO0FBQ2pELHFCQUFPLE9BQU8sV0FBVyxXQUFXLE1BQU0sQ0FBQztBQUFBLFlBQzdDO0FBQ0Esa0JBQU0sV0FBVyxTQUFTLE9BQU8sV0FBVyxNQUFNLEdBQUcsVUFBVSxJQUFJO0FBQUEsVUFDckUsV0FBVyxPQUFPLFFBQVEsU0FBVSxPQUFNLE9BQU8sV0FBVyxNQUFNLEdBQUcsVUFBVTtBQUMvRSxjQUFJLFFBQVEsT0FBVyxXQUFVLEtBQUssVUFBVSxJQUFJO0FBRXBELGdCQUFNLHFCQUFxQixtQkFBbUIsU0FBUztBQUN2RCxpQkFBTyxDQUFDLGtCQUFrQjtBQUFBLFFBQzVCO0FBQUEsTUFDRjtBQUVBLGVBQVMsaUJBQWtCLE1BQU0sV0FBVyxhQUFhLGlCQUFpQjtBQUN4RSxtQkFBVyxLQUFLLE1BQU07QUFDcEIsY0FBSSxtQkFBbUIsS0FBSyxDQUFDLGFBQWEsT0FBTztBQUMvQyxpQkFBSyxDQUFDLElBQUlELE1BQUssZUFBZSxJQUFJLEtBQUssQ0FBQyxDQUFDO0FBQUEsVUFDM0MsV0FBVyxPQUFPLEtBQUssQ0FBQyxNQUFNLFlBQVksQ0FBQyxNQUFNLFFBQVEsS0FBSyxDQUFDLENBQUMsS0FBSyxXQUFXO0FBQzlFLHVCQUFXLEtBQUssS0FBSyxDQUFDLEdBQUc7QUFDdkIsa0JBQUksVUFBVSxRQUFRLENBQUMsSUFBSSxNQUFNLEtBQUssYUFBYTtBQUNqRCxxQkFBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLFlBQVksQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUFBLGNBQ3hDO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUVBLGVBQVMsU0FBVUMsU0FBUSxNQUFNLE1BQU0sbUJBQW1CLE9BQU87QUFDL0QsY0FBTSxPQUFPLEtBQUs7QUFDbEIsY0FBTSxLQUFLLEtBQUs7QUFDaEIsY0FBTSxjQUFjLEtBQUs7QUFDekIsY0FBTSxjQUFjLEtBQUs7QUFDekIsY0FBTSxNQUFNLEtBQUs7QUFDakIsY0FBTSxXQUFXQSxRQUFPLFVBQVU7QUFFbEMsWUFBSSxDQUFDLGtCQUFrQjtBQUNyQjtBQUFBLFlBQ0U7QUFBQSxZQUNBQSxRQUFPLGNBQWMsT0FBTyxLQUFLQSxRQUFPLFdBQVc7QUFBQSxZQUNuREEsUUFBTztBQUFBLFlBQ1BBLFFBQU8scUJBQXFCLFNBQVksT0FBT0EsUUFBTztBQUFBLFVBQ3hEO0FBQUEsUUFDRjtBQUVBLFFBQUFBLFFBQU8sVUFBVSxLQUFLO0FBQ3RCLFFBQUFBLFFBQU8sVUFBVSxXQUFXLEtBQUssT0FBTyxTQUFVLEtBQUs7QUFFckQsaUJBQU8sU0FBUyxRQUFRLEdBQUcsTUFBTTtBQUFBLFFBQ25DLENBQUM7QUFFRCxRQUFBQSxRQUFPLFVBQVUsTUFBTSxRQUFRO0FBQy9CLFFBQUFBLFFBQU8sVUFBVSxNQUFNLFFBQVE7QUFFL0IsYUFBSyxhQUFhQSxRQUFPLFdBQVcsR0FBRztBQUV2QyxRQUFBQSxRQUFPLFlBQVksb0JBQW9CLFFBQVE7QUFBQSxNQUNqRDtBQUVBLGVBQVMsb0JBQXFCLFVBQVU7QUFDdEMsZUFBTztBQUFBLFVBQ0wsSUFBSTtBQUFBLFVBQ0osVUFBVSxDQUFDO0FBQUEsVUFDWCxVQUFVLFlBQVksQ0FBQztBQUFBLFVBQ3ZCLE9BQU8sRUFBRSxPQUFPLElBQUksT0FBTyxFQUFFO0FBQUEsUUFDL0I7QUFBQSxNQUNGO0FBRUEsZUFBUyxXQUFZLEtBQUs7QUFDeEIsY0FBTSxNQUFNO0FBQUEsVUFDVixNQUFNLElBQUksWUFBWTtBQUFBLFVBQ3RCLEtBQUssSUFBSTtBQUFBLFVBQ1QsT0FBTyxJQUFJO0FBQUEsUUFDYjtBQUNBLG1CQUFXLE9BQU8sS0FBSztBQUNyQixjQUFJLElBQUksR0FBRyxNQUFNLFFBQVc7QUFDMUIsZ0JBQUksR0FBRyxJQUFJLElBQUksR0FBRztBQUFBLFVBQ3BCO0FBQUEsUUFDRjtBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxnQkFBaUIsTUFBTTtBQUM5QixZQUFJLE9BQU8sS0FBSyxjQUFjLFlBQVk7QUFDeEMsaUJBQU8sS0FBSztBQUFBLFFBQ2Q7QUFDQSxZQUFJLEtBQUssY0FBYyxPQUFPO0FBQzVCLGlCQUFPO0FBQUEsUUFDVDtBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxPQUFRO0FBQUUsZUFBTyxDQUFDO0FBQUEsTUFBRTtBQUM3QixlQUFTLFlBQWEsR0FBRztBQUFFLGVBQU87QUFBQSxNQUFFO0FBQ3BDLGVBQVMsT0FBUTtBQUFBLE1BQUM7QUFFbEIsZUFBUyxXQUFZO0FBQUUsZUFBTztBQUFBLE1BQU07QUFDcEMsZUFBUyxZQUFhO0FBQUUsZUFBTyxLQUFLLElBQUk7QUFBQSxNQUFFO0FBQzFDLGVBQVMsV0FBWTtBQUFFLGVBQU8sS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLEdBQU07QUFBQSxNQUFFO0FBQzlELGVBQVMsVUFBVztBQUFFLGVBQU8sSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLEVBQUUsWUFBWTtBQUFBLE1BQUU7QUFJaEUsZUFBUyx5QkFBMEI7QUFDakMsaUJBQVMsS0FBTSxHQUFHO0FBQUUsaUJBQU8sT0FBTyxNQUFNLGVBQWU7QUFBQSxRQUFFO0FBQ3pELFlBQUk7QUFDRixjQUFJLE9BQU8sZUFBZSxZQUFhLFFBQU87QUFDOUMsaUJBQU8sZUFBZSxPQUFPLFdBQVcsY0FBYztBQUFBLFlBQ3BELEtBQUssV0FBWTtBQUNmLHFCQUFPLE9BQU8sVUFBVTtBQUN4QixxQkFBUSxLQUFLLGFBQWE7QUFBQSxZQUM1QjtBQUFBLFlBQ0EsY0FBYztBQUFBLFVBQ2hCLENBQUM7QUFDRCxpQkFBTztBQUFBLFFBQ1QsU0FBUyxHQUFHO0FBQ1YsaUJBQU8sS0FBSyxJQUFJLEtBQUssS0FBSyxNQUFNLEtBQUssS0FBSyxJQUFJLEtBQUssQ0FBQztBQUFBLFFBQ3REO0FBQUEsTUFDRjtBQUdBLGFBQU8sUUFBUSxVQUFVRDtBQUN6QixhQUFPLFFBQVEsT0FBT0E7QUFJdEIsZUFBUyxvQkFBcUI7QUFDNUIsY0FBTSxRQUFTLElBQUksTUFBTSxFQUFHO0FBQzVCLFlBQUksQ0FBQyxNQUFPLFFBQU87QUFDbkIsY0FBTSxRQUFRLE1BQU0sTUFBTSxJQUFJO0FBQzlCLGlCQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sUUFBUSxLQUFLO0FBQ3JDLGdCQUFNLElBQUksTUFBTSxDQUFDLEVBQUUsS0FBSztBQUV4QixjQUFJLDRFQUE0RSxLQUFLLENBQUMsRUFBRztBQUN6RixjQUFJLEVBQUUsUUFBUSxZQUFZLE1BQU0sR0FBSTtBQUNwQyxjQUFJLEVBQUUsUUFBUSxlQUFlLE1BQU0sR0FBSTtBQUN2QyxjQUFJLEVBQUUsUUFBUSxjQUFjLE1BQU0sR0FBSTtBQUV0QyxjQUFJLElBQUksRUFBRSxNQUFNLHVCQUF1QjtBQUN2QyxjQUFJLENBQUMsRUFBRyxLQUFJLEVBQUUsTUFBTSx3QkFBd0I7QUFDNUMsY0FBSSxHQUFHO0FBQ0wsa0JBQU0sT0FBTyxFQUFFLENBQUM7QUFDaEIsa0JBQU0sT0FBTyxFQUFFLENBQUM7QUFDaEIsa0JBQU0sTUFBTSxFQUFFLENBQUM7QUFDZixtQkFBTyxPQUFPLE1BQU0sT0FBTyxNQUFNO0FBQUEsVUFDbkM7QUFBQSxRQUNGO0FBQ0EsZUFBTztBQUFBLE1BQ1Q7QUFBQTtBQUFBOzs7QUNsaUJBO0FBQUE7QUFBQTtBQUFBLGFBQU8sVUFBVSxDQUFDO0FBQUE7QUFBQTs7O0FDQWxCO0FBQUE7QUFBQTtBQUFBO0FBQ0EsYUFBTyxlQUFlLFNBQVMsY0FBYyxFQUFFLE9BQU8sS0FBSyxDQUFDO0FBQzVELGNBQVEsVUFBVSxRQUFRLFNBQVM7QUFDbkMsVUFBTSxXQUFXO0FBQ2pCLFVBQU0sZUFBZSxDQUFDO0FBQ3RCLGVBQVMsSUFBSSxHQUFHLElBQUksU0FBUyxRQUFRLEtBQUs7QUFDdEMsY0FBTSxJQUFJLFNBQVMsT0FBTyxDQUFDO0FBQzNCLHFCQUFhLENBQUMsSUFBSTtBQUFBLE1BQ3RCO0FBQ0EsZUFBUyxZQUFZLEtBQUs7QUFDdEIsY0FBTSxJQUFJLE9BQU87QUFDakIsZ0JBQVUsTUFBTSxhQUFjLElBQ3pCLEVBQUcsS0FBSyxJQUFLLEtBQUssWUFDbEIsRUFBRyxLQUFLLElBQUssS0FBSyxZQUNsQixFQUFHLEtBQUssSUFBSyxLQUFLLFlBQ2xCLEVBQUcsS0FBSyxJQUFLLEtBQUssYUFDbEIsRUFBRyxLQUFLLElBQUssS0FBSztBQUFBLE1BQzNCO0FBQ0EsZUFBUyxVQUFVLFFBQVE7QUFDdkIsWUFBSSxNQUFNO0FBQ1YsaUJBQVMsSUFBSSxHQUFHLElBQUksT0FBTyxRQUFRLEVBQUUsR0FBRztBQUNwQyxnQkFBTSxJQUFJLE9BQU8sV0FBVyxDQUFDO0FBQzdCLGNBQUksSUFBSSxNQUFNLElBQUk7QUFDZCxtQkFBTyxxQkFBcUIsU0FBUztBQUN6QyxnQkFBTSxZQUFZLEdBQUcsSUFBSyxLQUFLO0FBQUEsUUFDbkM7QUFDQSxjQUFNLFlBQVksR0FBRztBQUNyQixpQkFBUyxJQUFJLEdBQUcsSUFBSSxPQUFPLFFBQVEsRUFBRSxHQUFHO0FBQ3BDLGdCQUFNLElBQUksT0FBTyxXQUFXLENBQUM7QUFDN0IsZ0JBQU0sWUFBWSxHQUFHLElBQUssSUFBSTtBQUFBLFFBQ2xDO0FBQ0EsZUFBTztBQUFBLE1BQ1g7QUFDQSxlQUFTLFFBQVEsTUFBTSxRQUFRLFNBQVMsS0FBSztBQUN6QyxZQUFJLFFBQVE7QUFDWixZQUFJLE9BQU87QUFDWCxjQUFNLFFBQVEsS0FBSyxXQUFXO0FBQzlCLGNBQU0sU0FBUyxDQUFDO0FBQ2hCLGlCQUFTLElBQUksR0FBRyxJQUFJLEtBQUssUUFBUSxFQUFFLEdBQUc7QUFDbEMsa0JBQVMsU0FBUyxTQUFVLEtBQUssQ0FBQztBQUNsQyxrQkFBUTtBQUNSLGlCQUFPLFFBQVEsU0FBUztBQUNwQixvQkFBUTtBQUNSLG1CQUFPLEtBQU0sU0FBUyxPQUFRLElBQUk7QUFBQSxVQUN0QztBQUFBLFFBQ0o7QUFDQSxZQUFJLEtBQUs7QUFDTCxjQUFJLE9BQU8sR0FBRztBQUNWLG1CQUFPLEtBQU0sU0FBVSxVQUFVLE9BQVMsSUFBSTtBQUFBLFVBQ2xEO0FBQUEsUUFDSixPQUNLO0FBQ0QsY0FBSSxRQUFRO0FBQ1IsbUJBQU87QUFDWCxjQUFLLFNBQVUsVUFBVSxPQUFTO0FBQzlCLG1CQUFPO0FBQUEsUUFDZjtBQUNBLGVBQU87QUFBQSxNQUNYO0FBQ0EsZUFBUyxRQUFRLE9BQU87QUFDcEIsZUFBTyxRQUFRLE9BQU8sR0FBRyxHQUFHLElBQUk7QUFBQSxNQUNwQztBQUNBLGVBQVMsZ0JBQWdCLE9BQU87QUFDNUIsY0FBTSxNQUFNLFFBQVEsT0FBTyxHQUFHLEdBQUcsS0FBSztBQUN0QyxZQUFJLE1BQU0sUUFBUSxHQUFHO0FBQ2pCLGlCQUFPO0FBQUEsTUFDZjtBQUNBLGVBQVMsVUFBVSxPQUFPO0FBQ3RCLGNBQU0sTUFBTSxRQUFRLE9BQU8sR0FBRyxHQUFHLEtBQUs7QUFDdEMsWUFBSSxNQUFNLFFBQVEsR0FBRztBQUNqQixpQkFBTztBQUNYLGNBQU0sSUFBSSxNQUFNLEdBQUc7QUFBQSxNQUN2QjtBQUNBLGVBQVMsdUJBQXVCLFVBQVU7QUFDdEMsWUFBSTtBQUNKLFlBQUksYUFBYSxVQUFVO0FBQ3ZCLDJCQUFpQjtBQUFBLFFBQ3JCLE9BQ0s7QUFDRCwyQkFBaUI7QUFBQSxRQUNyQjtBQUNBLGlCQUFTLE9BQU8sUUFBUSxPQUFPLE9BQU87QUFDbEMsa0JBQVEsU0FBUztBQUNqQixjQUFJLE9BQU8sU0FBUyxJQUFJLE1BQU0sU0FBUztBQUNuQyxrQkFBTSxJQUFJLFVBQVUsc0JBQXNCO0FBQzlDLG1CQUFTLE9BQU8sWUFBWTtBQUU1QixjQUFJLE1BQU0sVUFBVSxNQUFNO0FBQzFCLGNBQUksT0FBTyxRQUFRO0FBQ2Ysa0JBQU0sSUFBSSxNQUFNLEdBQUc7QUFDdkIsY0FBSSxTQUFTLFNBQVM7QUFDdEIsbUJBQVMsSUFBSSxHQUFHLElBQUksTUFBTSxRQUFRLEVBQUUsR0FBRztBQUNuQyxrQkFBTSxJQUFJLE1BQU0sQ0FBQztBQUNqQixnQkFBSSxLQUFLLE1BQU07QUFDWCxvQkFBTSxJQUFJLE1BQU0sZ0JBQWdCO0FBQ3BDLGtCQUFNLFlBQVksR0FBRyxJQUFJO0FBQ3pCLHNCQUFVLFNBQVMsT0FBTyxDQUFDO0FBQUEsVUFDL0I7QUFDQSxtQkFBUyxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRztBQUN4QixrQkFBTSxZQUFZLEdBQUc7QUFBQSxVQUN6QjtBQUNBLGlCQUFPO0FBQ1AsbUJBQVMsSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUc7QUFDeEIsa0JBQU0sSUFBSyxRQUFTLElBQUksS0FBSyxJQUFNO0FBQ25DLHNCQUFVLFNBQVMsT0FBTyxDQUFDO0FBQUEsVUFDL0I7QUFDQSxpQkFBTztBQUFBLFFBQ1g7QUFDQSxpQkFBUyxTQUFTLEtBQUssT0FBTztBQUMxQixrQkFBUSxTQUFTO0FBQ2pCLGNBQUksSUFBSSxTQUFTO0FBQ2IsbUJBQU8sTUFBTTtBQUNqQixjQUFJLElBQUksU0FBUztBQUNiLG1CQUFPO0FBRVgsZ0JBQU0sVUFBVSxJQUFJLFlBQVk7QUFDaEMsZ0JBQU0sVUFBVSxJQUFJLFlBQVk7QUFDaEMsY0FBSSxRQUFRLFdBQVcsUUFBUTtBQUMzQixtQkFBTyx1QkFBdUI7QUFDbEMsZ0JBQU07QUFDTixnQkFBTSxRQUFRLElBQUksWUFBWSxHQUFHO0FBQ2pDLGNBQUksVUFBVTtBQUNWLG1CQUFPLGdDQUFnQztBQUMzQyxjQUFJLFVBQVU7QUFDVixtQkFBTyx3QkFBd0I7QUFDbkMsZ0JBQU0sU0FBUyxJQUFJLE1BQU0sR0FBRyxLQUFLO0FBQ2pDLGdCQUFNLFlBQVksSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUNyQyxjQUFJLFVBQVUsU0FBUztBQUNuQixtQkFBTztBQUNYLGNBQUksTUFBTSxVQUFVLE1BQU07QUFDMUIsY0FBSSxPQUFPLFFBQVE7QUFDZixtQkFBTztBQUNYLGdCQUFNLFFBQVEsQ0FBQztBQUNmLG1CQUFTLElBQUksR0FBRyxJQUFJLFVBQVUsUUFBUSxFQUFFLEdBQUc7QUFDdkMsa0JBQU0sSUFBSSxVQUFVLE9BQU8sQ0FBQztBQUM1QixrQkFBTSxJQUFJLGFBQWEsQ0FBQztBQUN4QixnQkFBSSxNQUFNO0FBQ04scUJBQU8sdUJBQXVCO0FBQ2xDLGtCQUFNLFlBQVksR0FBRyxJQUFJO0FBRXpCLGdCQUFJLElBQUksS0FBSyxVQUFVO0FBQ25CO0FBQ0osa0JBQU0sS0FBSyxDQUFDO0FBQUEsVUFDaEI7QUFDQSxjQUFJLFFBQVE7QUFDUixtQkFBTywwQkFBMEI7QUFDckMsaUJBQU8sRUFBRSxRQUFRLE1BQU07QUFBQSxRQUMzQjtBQUNBLGlCQUFTLGFBQWEsS0FBSyxPQUFPO0FBQzlCLGdCQUFNLE1BQU0sU0FBUyxLQUFLLEtBQUs7QUFDL0IsY0FBSSxPQUFPLFFBQVE7QUFDZixtQkFBTztBQUFBLFFBQ2Y7QUFDQSxpQkFBUyxPQUFPLEtBQUssT0FBTztBQUN4QixnQkFBTSxNQUFNLFNBQVMsS0FBSyxLQUFLO0FBQy9CLGNBQUksT0FBTyxRQUFRO0FBQ2YsbUJBQU87QUFDWCxnQkFBTSxJQUFJLE1BQU0sR0FBRztBQUFBLFFBQ3ZCO0FBQ0EsZUFBTztBQUFBLFVBQ0g7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQ0EsY0FBUSxTQUFTLHVCQUF1QixRQUFRO0FBQ2hELGNBQVEsVUFBVSx1QkFBdUIsU0FBUztBQUFBO0FBQUE7OztBQ3pLbEQ7QUFBQTtBQUFBO0FBQUE7QUFFQSxjQUFRLGFBQWE7QUFDckIsY0FBUSxjQUFjO0FBQ3RCLGNBQVEsZ0JBQWdCO0FBRXhCLFVBQUksU0FBUyxDQUFDO0FBQ2QsVUFBSSxZQUFZLENBQUM7QUFDakIsVUFBSSxNQUFNLE9BQU8sZUFBZSxjQUFjLGFBQWE7QUFFM0QsVUFBSSxPQUFPO0FBQ1gsV0FBUyxJQUFJLEdBQUcsTUFBTSxLQUFLLFFBQVEsSUFBSSxLQUFLLEVBQUUsR0FBRztBQUMvQyxlQUFPLENBQUMsSUFBSSxLQUFLLENBQUM7QUFDbEIsa0JBQVUsS0FBSyxXQUFXLENBQUMsQ0FBQyxJQUFJO0FBQUEsTUFDbEM7QUFIUztBQUFPO0FBT2hCLGdCQUFVLElBQUksV0FBVyxDQUFDLENBQUMsSUFBSTtBQUMvQixnQkFBVSxJQUFJLFdBQVcsQ0FBQyxDQUFDLElBQUk7QUFFL0IsZUFBUyxRQUFTLEtBQUs7QUFDckIsWUFBSU0sT0FBTSxJQUFJO0FBRWQsWUFBSUEsT0FBTSxJQUFJLEdBQUc7QUFDZixnQkFBTSxJQUFJLE1BQU0sZ0RBQWdEO0FBQUEsUUFDbEU7QUFJQSxZQUFJLFdBQVcsSUFBSSxRQUFRLEdBQUc7QUFDOUIsWUFBSSxhQUFhLEdBQUksWUFBV0E7QUFFaEMsWUFBSSxrQkFBa0IsYUFBYUEsT0FDL0IsSUFDQSxJQUFLLFdBQVc7QUFFcEIsZUFBTyxDQUFDLFVBQVUsZUFBZTtBQUFBLE1BQ25DO0FBR0EsZUFBUyxXQUFZLEtBQUs7QUFDeEIsWUFBSSxPQUFPLFFBQVEsR0FBRztBQUN0QixZQUFJLFdBQVcsS0FBSyxDQUFDO0FBQ3JCLFlBQUksa0JBQWtCLEtBQUssQ0FBQztBQUM1QixnQkFBUyxXQUFXLG1CQUFtQixJQUFJLElBQUs7QUFBQSxNQUNsRDtBQUVBLGVBQVMsWUFBYSxLQUFLLFVBQVUsaUJBQWlCO0FBQ3BELGdCQUFTLFdBQVcsbUJBQW1CLElBQUksSUFBSztBQUFBLE1BQ2xEO0FBRUEsZUFBUyxZQUFhLEtBQUs7QUFDekIsWUFBSTtBQUNKLFlBQUksT0FBTyxRQUFRLEdBQUc7QUFDdEIsWUFBSSxXQUFXLEtBQUssQ0FBQztBQUNyQixZQUFJLGtCQUFrQixLQUFLLENBQUM7QUFFNUIsWUFBSSxNQUFNLElBQUksSUFBSSxZQUFZLEtBQUssVUFBVSxlQUFlLENBQUM7QUFFN0QsWUFBSSxVQUFVO0FBR2QsWUFBSUEsT0FBTSxrQkFBa0IsSUFDeEIsV0FBVyxJQUNYO0FBRUosWUFBSUM7QUFDSixhQUFLQSxLQUFJLEdBQUdBLEtBQUlELE1BQUtDLE1BQUssR0FBRztBQUMzQixnQkFDRyxVQUFVLElBQUksV0FBV0EsRUFBQyxDQUFDLEtBQUssS0FDaEMsVUFBVSxJQUFJLFdBQVdBLEtBQUksQ0FBQyxDQUFDLEtBQUssS0FDcEMsVUFBVSxJQUFJLFdBQVdBLEtBQUksQ0FBQyxDQUFDLEtBQUssSUFDckMsVUFBVSxJQUFJLFdBQVdBLEtBQUksQ0FBQyxDQUFDO0FBQ2pDLGNBQUksU0FBUyxJQUFLLE9BQU8sS0FBTTtBQUMvQixjQUFJLFNBQVMsSUFBSyxPQUFPLElBQUs7QUFDOUIsY0FBSSxTQUFTLElBQUksTUFBTTtBQUFBLFFBQ3pCO0FBRUEsWUFBSSxvQkFBb0IsR0FBRztBQUN6QixnQkFDRyxVQUFVLElBQUksV0FBV0EsRUFBQyxDQUFDLEtBQUssSUFDaEMsVUFBVSxJQUFJLFdBQVdBLEtBQUksQ0FBQyxDQUFDLEtBQUs7QUFDdkMsY0FBSSxTQUFTLElBQUksTUFBTTtBQUFBLFFBQ3pCO0FBRUEsWUFBSSxvQkFBb0IsR0FBRztBQUN6QixnQkFDRyxVQUFVLElBQUksV0FBV0EsRUFBQyxDQUFDLEtBQUssS0FDaEMsVUFBVSxJQUFJLFdBQVdBLEtBQUksQ0FBQyxDQUFDLEtBQUssSUFDcEMsVUFBVSxJQUFJLFdBQVdBLEtBQUksQ0FBQyxDQUFDLEtBQUs7QUFDdkMsY0FBSSxTQUFTLElBQUssT0FBTyxJQUFLO0FBQzlCLGNBQUksU0FBUyxJQUFJLE1BQU07QUFBQSxRQUN6QjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxnQkFBaUJDLE1BQUs7QUFDN0IsZUFBTyxPQUFPQSxRQUFPLEtBQUssRUFBSSxJQUM1QixPQUFPQSxRQUFPLEtBQUssRUFBSSxJQUN2QixPQUFPQSxRQUFPLElBQUksRUFBSSxJQUN0QixPQUFPQSxPQUFNLEVBQUk7QUFBQSxNQUNyQjtBQUVBLGVBQVMsWUFBYSxPQUFPLE9BQU8sS0FBSztBQUN2QyxZQUFJO0FBQ0osWUFBSSxTQUFTLENBQUM7QUFDZCxpQkFBU0QsS0FBSSxPQUFPQSxLQUFJLEtBQUtBLE1BQUssR0FBRztBQUNuQyxpQkFDSSxNQUFNQSxFQUFDLEtBQUssS0FBTSxhQUNsQixNQUFNQSxLQUFJLENBQUMsS0FBSyxJQUFLLFVBQ3RCLE1BQU1BLEtBQUksQ0FBQyxJQUFJO0FBQ2xCLGlCQUFPLEtBQUssZ0JBQWdCLEdBQUcsQ0FBQztBQUFBLFFBQ2xDO0FBQ0EsZUFBTyxPQUFPLEtBQUssRUFBRTtBQUFBLE1BQ3ZCO0FBRUEsZUFBUyxjQUFlLE9BQU87QUFDN0IsWUFBSTtBQUNKLFlBQUlELE9BQU0sTUFBTTtBQUNoQixZQUFJLGFBQWFBLE9BQU07QUFDdkIsWUFBSSxRQUFRLENBQUM7QUFDYixZQUFJLGlCQUFpQjtBQUdyQixpQkFBU0MsS0FBSSxHQUFHRSxRQUFPSCxPQUFNLFlBQVlDLEtBQUlFLE9BQU1GLE1BQUssZ0JBQWdCO0FBQ3RFLGdCQUFNLEtBQUssWUFBWSxPQUFPQSxJQUFJQSxLQUFJLGlCQUFrQkUsUUFBT0EsUUFBUUYsS0FBSSxjQUFlLENBQUM7QUFBQSxRQUM3RjtBQUdBLFlBQUksZUFBZSxHQUFHO0FBQ3BCLGdCQUFNLE1BQU1ELE9BQU0sQ0FBQztBQUNuQixnQkFBTTtBQUFBLFlBQ0osT0FBTyxPQUFPLENBQUMsSUFDZixPQUFRLE9BQU8sSUFBSyxFQUFJLElBQ3hCO0FBQUEsVUFDRjtBQUFBLFFBQ0YsV0FBVyxlQUFlLEdBQUc7QUFDM0IsaUJBQU8sTUFBTUEsT0FBTSxDQUFDLEtBQUssS0FBSyxNQUFNQSxPQUFNLENBQUM7QUFDM0MsZ0JBQU07QUFBQSxZQUNKLE9BQU8sT0FBTyxFQUFFLElBQ2hCLE9BQVEsT0FBTyxJQUFLLEVBQUksSUFDeEIsT0FBUSxPQUFPLElBQUssRUFBSSxJQUN4QjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBRUEsZUFBTyxNQUFNLEtBQUssRUFBRTtBQUFBLE1BQ3RCO0FBQUE7QUFBQTs7O0FDckpBO0FBQUE7QUFBQTtBQUNBLGNBQVEsT0FBTyxTQUFVLFFBQVEsUUFBUSxNQUFNLE1BQU0sUUFBUTtBQUMzRCxZQUFJLEdBQUc7QUFDUCxZQUFJLE9BQVEsU0FBUyxJQUFLLE9BQU87QUFDakMsWUFBSSxRQUFRLEtBQUssUUFBUTtBQUN6QixZQUFJLFFBQVEsUUFBUTtBQUNwQixZQUFJLFFBQVE7QUFDWixZQUFJLElBQUksT0FBUSxTQUFTLElBQUs7QUFDOUIsWUFBSSxJQUFJLE9BQU8sS0FBSztBQUNwQixZQUFJLElBQUksT0FBTyxTQUFTLENBQUM7QUFFekIsYUFBSztBQUVMLFlBQUksS0FBTSxLQUFNLENBQUMsU0FBVTtBQUMzQixjQUFPLENBQUM7QUFDUixpQkFBUztBQUNULGVBQU8sUUFBUSxHQUFHLElBQUssSUFBSSxNQUFPLE9BQU8sU0FBUyxDQUFDLEdBQUcsS0FBSyxHQUFHLFNBQVMsR0FBRztBQUFBLFFBQUM7QUFFM0UsWUFBSSxLQUFNLEtBQU0sQ0FBQyxTQUFVO0FBQzNCLGNBQU8sQ0FBQztBQUNSLGlCQUFTO0FBQ1QsZUFBTyxRQUFRLEdBQUcsSUFBSyxJQUFJLE1BQU8sT0FBTyxTQUFTLENBQUMsR0FBRyxLQUFLLEdBQUcsU0FBUyxHQUFHO0FBQUEsUUFBQztBQUUzRSxZQUFJLE1BQU0sR0FBRztBQUNYLGNBQUksSUFBSTtBQUFBLFFBQ1YsV0FBVyxNQUFNLE1BQU07QUFDckIsaUJBQU8sSUFBSSxPQUFRLElBQUksS0FBSyxLQUFLO0FBQUEsUUFDbkMsT0FBTztBQUNMLGNBQUksSUFBSSxLQUFLLElBQUksR0FBRyxJQUFJO0FBQ3hCLGNBQUksSUFBSTtBQUFBLFFBQ1Y7QUFDQSxnQkFBUSxJQUFJLEtBQUssS0FBSyxJQUFJLEtBQUssSUFBSSxHQUFHLElBQUksSUFBSTtBQUFBLE1BQ2hEO0FBRUEsY0FBUSxRQUFRLFNBQVUsUUFBUSxPQUFPLFFBQVEsTUFBTSxNQUFNLFFBQVE7QUFDbkUsWUFBSSxHQUFHLEdBQUc7QUFDVixZQUFJLE9BQVEsU0FBUyxJQUFLLE9BQU87QUFDakMsWUFBSSxRQUFRLEtBQUssUUFBUTtBQUN6QixZQUFJLFFBQVEsUUFBUTtBQUNwQixZQUFJLEtBQU0sU0FBUyxLQUFLLEtBQUssSUFBSSxHQUFHLEdBQUcsSUFBSSxLQUFLLElBQUksR0FBRyxHQUFHLElBQUk7QUFDOUQsWUFBSSxJQUFJLE9BQU8sSUFBSyxTQUFTO0FBQzdCLFlBQUksSUFBSSxPQUFPLElBQUk7QUFDbkIsWUFBSSxJQUFJLFFBQVEsS0FBTSxVQUFVLEtBQUssSUFBSSxRQUFRLElBQUssSUFBSTtBQUUxRCxnQkFBUSxLQUFLLElBQUksS0FBSztBQUV0QixZQUFJLE1BQU0sS0FBSyxLQUFLLFVBQVUsVUFBVTtBQUN0QyxjQUFJLE1BQU0sS0FBSyxJQUFJLElBQUk7QUFDdkIsY0FBSTtBQUFBLFFBQ04sT0FBTztBQUNMLGNBQUksS0FBSyxNQUFNLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxHQUFHO0FBQ3pDLGNBQUksU0FBUyxJQUFJLEtBQUssSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUc7QUFDckM7QUFDQSxpQkFBSztBQUFBLFVBQ1A7QUFDQSxjQUFJLElBQUksU0FBUyxHQUFHO0FBQ2xCLHFCQUFTLEtBQUs7QUFBQSxVQUNoQixPQUFPO0FBQ0wscUJBQVMsS0FBSyxLQUFLLElBQUksR0FBRyxJQUFJLEtBQUs7QUFBQSxVQUNyQztBQUNBLGNBQUksUUFBUSxLQUFLLEdBQUc7QUFDbEI7QUFDQSxpQkFBSztBQUFBLFVBQ1A7QUFFQSxjQUFJLElBQUksU0FBUyxNQUFNO0FBQ3JCLGdCQUFJO0FBQ0osZ0JBQUk7QUFBQSxVQUNOLFdBQVcsSUFBSSxTQUFTLEdBQUc7QUFDekIsaUJBQU0sUUFBUSxJQUFLLEtBQUssS0FBSyxJQUFJLEdBQUcsSUFBSTtBQUN4QyxnQkFBSSxJQUFJO0FBQUEsVUFDVixPQUFPO0FBQ0wsZ0JBQUksUUFBUSxLQUFLLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxLQUFLLElBQUksR0FBRyxJQUFJO0FBQ3JELGdCQUFJO0FBQUEsVUFDTjtBQUFBLFFBQ0Y7QUFFQSxlQUFPLFFBQVEsR0FBRyxPQUFPLFNBQVMsQ0FBQyxJQUFJLElBQUksS0FBTSxLQUFLLEdBQUcsS0FBSyxLQUFLLFFBQVEsR0FBRztBQUFBLFFBQUM7QUFFL0UsWUFBSyxLQUFLLE9BQVE7QUFDbEIsZ0JBQVE7QUFDUixlQUFPLE9BQU8sR0FBRyxPQUFPLFNBQVMsQ0FBQyxJQUFJLElBQUksS0FBTSxLQUFLLEdBQUcsS0FBSyxLQUFLLFFBQVEsR0FBRztBQUFBLFFBQUM7QUFFOUUsZUFBTyxTQUFTLElBQUksQ0FBQyxLQUFLLElBQUk7QUFBQSxNQUNoQztBQUFBO0FBQUE7OztBQ3BGQTtBQUFBO0FBQUE7QUFBQTtBQVVBLFVBQU0sU0FBUztBQUNmLFVBQU0sVUFBVTtBQUNoQixVQUFNLHNCQUNILE9BQU8sV0FBVyxjQUFjLE9BQU8sT0FBTyxLQUFLLE1BQU0sYUFDdEQsT0FBTyxLQUFLLEVBQUUsNEJBQTRCLElBQzFDO0FBRU4sY0FBUSxTQUFTSTtBQUNqQixjQUFRLGFBQWE7QUFDckIsY0FBUSxvQkFBb0I7QUFFNUIsVUFBTSxlQUFlO0FBQ3JCLGNBQVEsYUFBYTtBQWdCckIsTUFBQUEsUUFBTyxzQkFBc0Isa0JBQWtCO0FBRS9DLFVBQUksQ0FBQ0EsUUFBTyx1QkFBdUIsT0FBTyxZQUFZLGVBQ2xELE9BQU8sUUFBUSxVQUFVLFlBQVk7QUFDdkMsZ0JBQVE7QUFBQSxVQUNOO0FBQUEsUUFFRjtBQUFBLE1BQ0Y7QUFFQSxlQUFTLG9CQUFxQjtBQUU1QixZQUFJO0FBQ0YsZ0JBQU0sTUFBTSxJQUFJLFdBQVcsQ0FBQztBQUM1QixnQkFBTSxRQUFRLEVBQUUsS0FBSyxXQUFZO0FBQUUsbUJBQU87QUFBQSxVQUFHLEVBQUU7QUFDL0MsaUJBQU8sZUFBZSxPQUFPLFdBQVcsU0FBUztBQUNqRCxpQkFBTyxlQUFlLEtBQUssS0FBSztBQUNoQyxpQkFBTyxJQUFJLElBQUksTUFBTTtBQUFBLFFBQ3ZCLFNBQVMsR0FBRztBQUNWLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFFQSxhQUFPLGVBQWVBLFFBQU8sV0FBVyxVQUFVO0FBQUEsUUFDaEQsWUFBWTtBQUFBLFFBQ1osS0FBSyxXQUFZO0FBQ2YsY0FBSSxDQUFDQSxRQUFPLFNBQVMsSUFBSSxFQUFHLFFBQU87QUFDbkMsaUJBQU8sS0FBSztBQUFBLFFBQ2Q7QUFBQSxNQUNGLENBQUM7QUFFRCxhQUFPLGVBQWVBLFFBQU8sV0FBVyxVQUFVO0FBQUEsUUFDaEQsWUFBWTtBQUFBLFFBQ1osS0FBSyxXQUFZO0FBQ2YsY0FBSSxDQUFDQSxRQUFPLFNBQVMsSUFBSSxFQUFHLFFBQU87QUFDbkMsaUJBQU8sS0FBSztBQUFBLFFBQ2Q7QUFBQSxNQUNGLENBQUM7QUFFRCxlQUFTLGFBQWMsUUFBUTtBQUM3QixZQUFJLFNBQVMsY0FBYztBQUN6QixnQkFBTSxJQUFJLFdBQVcsZ0JBQWdCLFNBQVMsZ0NBQWdDO0FBQUEsUUFDaEY7QUFFQSxjQUFNLE1BQU0sSUFBSSxXQUFXLE1BQU07QUFDakMsZUFBTyxlQUFlLEtBQUtBLFFBQU8sU0FBUztBQUMzQyxlQUFPO0FBQUEsTUFDVDtBQVlBLGVBQVNBLFFBQVEsS0FBSyxrQkFBa0IsUUFBUTtBQUU5QyxZQUFJLE9BQU8sUUFBUSxVQUFVO0FBQzNCLGNBQUksT0FBTyxxQkFBcUIsVUFBVTtBQUN4QyxrQkFBTSxJQUFJO0FBQUEsY0FDUjtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQ0EsaUJBQU8sWUFBWSxHQUFHO0FBQUEsUUFDeEI7QUFDQSxlQUFPLEtBQUssS0FBSyxrQkFBa0IsTUFBTTtBQUFBLE1BQzNDO0FBRUEsTUFBQUEsUUFBTyxXQUFXO0FBRWxCLGVBQVMsS0FBTSxPQUFPLGtCQUFrQixRQUFRO0FBQzlDLFlBQUksT0FBTyxVQUFVLFVBQVU7QUFDN0IsaUJBQU8sV0FBVyxPQUFPLGdCQUFnQjtBQUFBLFFBQzNDO0FBRUEsWUFBSSxZQUFZLE9BQU8sS0FBSyxHQUFHO0FBQzdCLGlCQUFPLGNBQWMsS0FBSztBQUFBLFFBQzVCO0FBRUEsWUFBSSxTQUFTLE1BQU07QUFDakIsZ0JBQU0sSUFBSTtBQUFBLFlBQ1Isb0hBQzBDLE9BQU87QUFBQSxVQUNuRDtBQUFBLFFBQ0Y7QUFFQSxZQUFJLFdBQVcsT0FBTyxXQUFXLEtBQzVCLFNBQVMsV0FBVyxNQUFNLFFBQVEsV0FBVyxHQUFJO0FBQ3BELGlCQUFPLGdCQUFnQixPQUFPLGtCQUFrQixNQUFNO0FBQUEsUUFDeEQ7QUFFQSxZQUFJLE9BQU8sc0JBQXNCLGdCQUM1QixXQUFXLE9BQU8saUJBQWlCLEtBQ25DLFNBQVMsV0FBVyxNQUFNLFFBQVEsaUJBQWlCLElBQUs7QUFDM0QsaUJBQU8sZ0JBQWdCLE9BQU8sa0JBQWtCLE1BQU07QUFBQSxRQUN4RDtBQUVBLFlBQUksT0FBTyxVQUFVLFVBQVU7QUFDN0IsZ0JBQU0sSUFBSTtBQUFBLFlBQ1I7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUVBLGNBQU0sVUFBVSxNQUFNLFdBQVcsTUFBTSxRQUFRO0FBQy9DLFlBQUksV0FBVyxRQUFRLFlBQVksT0FBTztBQUN4QyxpQkFBT0EsUUFBTyxLQUFLLFNBQVMsa0JBQWtCLE1BQU07QUFBQSxRQUN0RDtBQUVBLGNBQU0sSUFBSSxXQUFXLEtBQUs7QUFDMUIsWUFBSSxFQUFHLFFBQU87QUFFZCxZQUFJLE9BQU8sV0FBVyxlQUFlLE9BQU8sZUFBZSxRQUN2RCxPQUFPLE1BQU0sT0FBTyxXQUFXLE1BQU0sWUFBWTtBQUNuRCxpQkFBT0EsUUFBTyxLQUFLLE1BQU0sT0FBTyxXQUFXLEVBQUUsUUFBUSxHQUFHLGtCQUFrQixNQUFNO0FBQUEsUUFDbEY7QUFFQSxjQUFNLElBQUk7QUFBQSxVQUNSLG9IQUMwQyxPQUFPO0FBQUEsUUFDbkQ7QUFBQSxNQUNGO0FBVUEsTUFBQUEsUUFBTyxPQUFPLFNBQVUsT0FBTyxrQkFBa0IsUUFBUTtBQUN2RCxlQUFPLEtBQUssT0FBTyxrQkFBa0IsTUFBTTtBQUFBLE1BQzdDO0FBSUEsYUFBTyxlQUFlQSxRQUFPLFdBQVcsV0FBVyxTQUFTO0FBQzVELGFBQU8sZUFBZUEsU0FBUSxVQUFVO0FBRXhDLGVBQVMsV0FBWSxNQUFNO0FBQ3pCLFlBQUksT0FBTyxTQUFTLFVBQVU7QUFDNUIsZ0JBQU0sSUFBSSxVQUFVLHdDQUF3QztBQUFBLFFBQzlELFdBQVcsT0FBTyxHQUFHO0FBQ25CLGdCQUFNLElBQUksV0FBVyxnQkFBZ0IsT0FBTyxnQ0FBZ0M7QUFBQSxRQUM5RTtBQUFBLE1BQ0Y7QUFFQSxlQUFTLE1BQU8sTUFBTSxNQUFNLFVBQVU7QUFDcEMsbUJBQVcsSUFBSTtBQUNmLFlBQUksUUFBUSxHQUFHO0FBQ2IsaUJBQU8sYUFBYSxJQUFJO0FBQUEsUUFDMUI7QUFDQSxZQUFJLFNBQVMsUUFBVztBQUl0QixpQkFBTyxPQUFPLGFBQWEsV0FDdkIsYUFBYSxJQUFJLEVBQUUsS0FBSyxNQUFNLFFBQVEsSUFDdEMsYUFBYSxJQUFJLEVBQUUsS0FBSyxJQUFJO0FBQUEsUUFDbEM7QUFDQSxlQUFPLGFBQWEsSUFBSTtBQUFBLE1BQzFCO0FBTUEsTUFBQUEsUUFBTyxRQUFRLFNBQVUsTUFBTSxNQUFNLFVBQVU7QUFDN0MsZUFBTyxNQUFNLE1BQU0sTUFBTSxRQUFRO0FBQUEsTUFDbkM7QUFFQSxlQUFTLFlBQWEsTUFBTTtBQUMxQixtQkFBVyxJQUFJO0FBQ2YsZUFBTyxhQUFhLE9BQU8sSUFBSSxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUM7QUFBQSxNQUN0RDtBQUtBLE1BQUFBLFFBQU8sY0FBYyxTQUFVLE1BQU07QUFDbkMsZUFBTyxZQUFZLElBQUk7QUFBQSxNQUN6QjtBQUlBLE1BQUFBLFFBQU8sa0JBQWtCLFNBQVUsTUFBTTtBQUN2QyxlQUFPLFlBQVksSUFBSTtBQUFBLE1BQ3pCO0FBRUEsZUFBUyxXQUFZLFFBQVEsVUFBVTtBQUNyQyxZQUFJLE9BQU8sYUFBYSxZQUFZLGFBQWEsSUFBSTtBQUNuRCxxQkFBVztBQUFBLFFBQ2I7QUFFQSxZQUFJLENBQUNBLFFBQU8sV0FBVyxRQUFRLEdBQUc7QUFDaEMsZ0JBQU0sSUFBSSxVQUFVLHVCQUF1QixRQUFRO0FBQUEsUUFDckQ7QUFFQSxjQUFNLFNBQVMsV0FBVyxRQUFRLFFBQVEsSUFBSTtBQUM5QyxZQUFJLE1BQU0sYUFBYSxNQUFNO0FBRTdCLGNBQU0sU0FBUyxJQUFJLE1BQU0sUUFBUSxRQUFRO0FBRXpDLFlBQUksV0FBVyxRQUFRO0FBSXJCLGdCQUFNLElBQUksTUFBTSxHQUFHLE1BQU07QUFBQSxRQUMzQjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxjQUFlLE9BQU87QUFDN0IsY0FBTSxTQUFTLE1BQU0sU0FBUyxJQUFJLElBQUksUUFBUSxNQUFNLE1BQU0sSUFBSTtBQUM5RCxjQUFNLE1BQU0sYUFBYSxNQUFNO0FBQy9CLGlCQUFTLElBQUksR0FBRyxJQUFJLFFBQVEsS0FBSyxHQUFHO0FBQ2xDLGNBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJO0FBQUEsUUFDdEI7QUFDQSxlQUFPO0FBQUEsTUFDVDtBQUVBLGVBQVMsY0FBZSxXQUFXO0FBQ2pDLFlBQUksV0FBVyxXQUFXLFVBQVUsR0FBRztBQUNyQyxnQkFBTSxPQUFPLElBQUksV0FBVyxTQUFTO0FBQ3JDLGlCQUFPLGdCQUFnQixLQUFLLFFBQVEsS0FBSyxZQUFZLEtBQUssVUFBVTtBQUFBLFFBQ3RFO0FBQ0EsZUFBTyxjQUFjLFNBQVM7QUFBQSxNQUNoQztBQUVBLGVBQVMsZ0JBQWlCLE9BQU8sWUFBWSxRQUFRO0FBQ25ELFlBQUksYUFBYSxLQUFLLE1BQU0sYUFBYSxZQUFZO0FBQ25ELGdCQUFNLElBQUksV0FBVyxzQ0FBc0M7QUFBQSxRQUM3RDtBQUVBLFlBQUksTUFBTSxhQUFhLGNBQWMsVUFBVSxJQUFJO0FBQ2pELGdCQUFNLElBQUksV0FBVyxzQ0FBc0M7QUFBQSxRQUM3RDtBQUVBLFlBQUk7QUFDSixZQUFJLGVBQWUsVUFBYSxXQUFXLFFBQVc7QUFDcEQsZ0JBQU0sSUFBSSxXQUFXLEtBQUs7QUFBQSxRQUM1QixXQUFXLFdBQVcsUUFBVztBQUMvQixnQkFBTSxJQUFJLFdBQVcsT0FBTyxVQUFVO0FBQUEsUUFDeEMsT0FBTztBQUNMLGdCQUFNLElBQUksV0FBVyxPQUFPLFlBQVksTUFBTTtBQUFBLFFBQ2hEO0FBR0EsZUFBTyxlQUFlLEtBQUtBLFFBQU8sU0FBUztBQUUzQyxlQUFPO0FBQUEsTUFDVDtBQUVBLGVBQVMsV0FBWSxLQUFLO0FBQ3hCLFlBQUlBLFFBQU8sU0FBUyxHQUFHLEdBQUc7QUFDeEIsZ0JBQU0sTUFBTSxRQUFRLElBQUksTUFBTSxJQUFJO0FBQ2xDLGdCQUFNLE1BQU0sYUFBYSxHQUFHO0FBRTVCLGNBQUksSUFBSSxXQUFXLEdBQUc7QUFDcEIsbUJBQU87QUFBQSxVQUNUO0FBRUEsY0FBSSxLQUFLLEtBQUssR0FBRyxHQUFHLEdBQUc7QUFDdkIsaUJBQU87QUFBQSxRQUNUO0FBRUEsWUFBSSxJQUFJLFdBQVcsUUFBVztBQUM1QixjQUFJLE9BQU8sSUFBSSxXQUFXLFlBQVksWUFBWSxJQUFJLE1BQU0sR0FBRztBQUM3RCxtQkFBTyxhQUFhLENBQUM7QUFBQSxVQUN2QjtBQUNBLGlCQUFPLGNBQWMsR0FBRztBQUFBLFFBQzFCO0FBRUEsWUFBSSxJQUFJLFNBQVMsWUFBWSxNQUFNLFFBQVEsSUFBSSxJQUFJLEdBQUc7QUFDcEQsaUJBQU8sY0FBYyxJQUFJLElBQUk7QUFBQSxRQUMvQjtBQUFBLE1BQ0Y7QUFFQSxlQUFTLFFBQVMsUUFBUTtBQUd4QixZQUFJLFVBQVUsY0FBYztBQUMxQixnQkFBTSxJQUFJLFdBQVcsNERBQ2EsYUFBYSxTQUFTLEVBQUUsSUFBSSxRQUFRO0FBQUEsUUFDeEU7QUFDQSxlQUFPLFNBQVM7QUFBQSxNQUNsQjtBQUVBLGVBQVMsV0FBWSxRQUFRO0FBQzNCLFlBQUksQ0FBQyxVQUFVLFFBQVE7QUFDckIsbUJBQVM7QUFBQSxRQUNYO0FBQ0EsZUFBT0EsUUFBTyxNQUFNLENBQUMsTUFBTTtBQUFBLE1BQzdCO0FBRUEsTUFBQUEsUUFBTyxXQUFXLFNBQVMsU0FBVSxHQUFHO0FBQ3RDLGVBQU8sS0FBSyxRQUFRLEVBQUUsY0FBYyxRQUNsQyxNQUFNQSxRQUFPO0FBQUEsTUFDakI7QUFFQSxNQUFBQSxRQUFPLFVBQVUsU0FBUyxRQUFTLEdBQUcsR0FBRztBQUN2QyxZQUFJLFdBQVcsR0FBRyxVQUFVLEVBQUcsS0FBSUEsUUFBTyxLQUFLLEdBQUcsRUFBRSxRQUFRLEVBQUUsVUFBVTtBQUN4RSxZQUFJLFdBQVcsR0FBRyxVQUFVLEVBQUcsS0FBSUEsUUFBTyxLQUFLLEdBQUcsRUFBRSxRQUFRLEVBQUUsVUFBVTtBQUN4RSxZQUFJLENBQUNBLFFBQU8sU0FBUyxDQUFDLEtBQUssQ0FBQ0EsUUFBTyxTQUFTLENBQUMsR0FBRztBQUM5QyxnQkFBTSxJQUFJO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBRUEsWUFBSSxNQUFNLEVBQUcsUUFBTztBQUVwQixZQUFJLElBQUksRUFBRTtBQUNWLFlBQUksSUFBSSxFQUFFO0FBRVYsaUJBQVMsSUFBSSxHQUFHLE1BQU0sS0FBSyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksS0FBSyxFQUFFLEdBQUc7QUFDbEQsY0FBSSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRztBQUNqQixnQkFBSSxFQUFFLENBQUM7QUFDUCxnQkFBSSxFQUFFLENBQUM7QUFDUDtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBRUEsWUFBSSxJQUFJLEVBQUcsUUFBTztBQUNsQixZQUFJLElBQUksRUFBRyxRQUFPO0FBQ2xCLGVBQU87QUFBQSxNQUNUO0FBRUEsTUFBQUEsUUFBTyxhQUFhLFNBQVMsV0FBWSxVQUFVO0FBQ2pELGdCQUFRLE9BQU8sUUFBUSxFQUFFLFlBQVksR0FBRztBQUFBLFVBQ3RDLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFDSCxtQkFBTztBQUFBLFVBQ1Q7QUFDRSxtQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNGO0FBRUEsTUFBQUEsUUFBTyxTQUFTLFNBQVMsT0FBUSxNQUFNLFFBQVE7QUFDN0MsWUFBSSxDQUFDLE1BQU0sUUFBUSxJQUFJLEdBQUc7QUFDeEIsZ0JBQU0sSUFBSSxVQUFVLDZDQUE2QztBQUFBLFFBQ25FO0FBRUEsWUFBSSxLQUFLLFdBQVcsR0FBRztBQUNyQixpQkFBT0EsUUFBTyxNQUFNLENBQUM7QUFBQSxRQUN2QjtBQUVBLFlBQUk7QUFDSixZQUFJLFdBQVcsUUFBVztBQUN4QixtQkFBUztBQUNULGVBQUssSUFBSSxHQUFHLElBQUksS0FBSyxRQUFRLEVBQUUsR0FBRztBQUNoQyxzQkFBVSxLQUFLLENBQUMsRUFBRTtBQUFBLFVBQ3BCO0FBQUEsUUFDRjtBQUVBLGNBQU0sU0FBU0EsUUFBTyxZQUFZLE1BQU07QUFDeEMsWUFBSSxNQUFNO0FBQ1YsYUFBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLFFBQVEsRUFBRSxHQUFHO0FBQ2hDLGNBQUksTUFBTSxLQUFLLENBQUM7QUFDaEIsY0FBSSxXQUFXLEtBQUssVUFBVSxHQUFHO0FBQy9CLGdCQUFJLE1BQU0sSUFBSSxTQUFTLE9BQU8sUUFBUTtBQUNwQyxrQkFBSSxDQUFDQSxRQUFPLFNBQVMsR0FBRyxFQUFHLE9BQU1BLFFBQU8sS0FBSyxHQUFHO0FBQ2hELGtCQUFJLEtBQUssUUFBUSxHQUFHO0FBQUEsWUFDdEIsT0FBTztBQUNMLHlCQUFXLFVBQVUsSUFBSTtBQUFBLGdCQUN2QjtBQUFBLGdCQUNBO0FBQUEsZ0JBQ0E7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUFBLFVBQ0YsV0FBVyxDQUFDQSxRQUFPLFNBQVMsR0FBRyxHQUFHO0FBQ2hDLGtCQUFNLElBQUksVUFBVSw2Q0FBNkM7QUFBQSxVQUNuRSxPQUFPO0FBQ0wsZ0JBQUksS0FBSyxRQUFRLEdBQUc7QUFBQSxVQUN0QjtBQUNBLGlCQUFPLElBQUk7QUFBQSxRQUNiO0FBQ0EsZUFBTztBQUFBLE1BQ1Q7QUFFQSxlQUFTLFdBQVksUUFBUSxVQUFVO0FBQ3JDLFlBQUlBLFFBQU8sU0FBUyxNQUFNLEdBQUc7QUFDM0IsaUJBQU8sT0FBTztBQUFBLFFBQ2hCO0FBQ0EsWUFBSSxZQUFZLE9BQU8sTUFBTSxLQUFLLFdBQVcsUUFBUSxXQUFXLEdBQUc7QUFDakUsaUJBQU8sT0FBTztBQUFBLFFBQ2hCO0FBQ0EsWUFBSSxPQUFPLFdBQVcsVUFBVTtBQUM5QixnQkFBTSxJQUFJO0FBQUEsWUFDUiw2RkFDbUIsT0FBTztBQUFBLFVBQzVCO0FBQUEsUUFDRjtBQUVBLGNBQU0sTUFBTSxPQUFPO0FBQ25CLGNBQU0sWUFBYSxVQUFVLFNBQVMsS0FBSyxVQUFVLENBQUMsTUFBTTtBQUM1RCxZQUFJLENBQUMsYUFBYSxRQUFRLEVBQUcsUUFBTztBQUdwQyxZQUFJLGNBQWM7QUFDbEIsbUJBQVM7QUFDUCxrQkFBUSxVQUFVO0FBQUEsWUFDaEIsS0FBSztBQUFBLFlBQ0wsS0FBSztBQUFBLFlBQ0wsS0FBSztBQUNILHFCQUFPO0FBQUEsWUFDVCxLQUFLO0FBQUEsWUFDTCxLQUFLO0FBQ0gscUJBQU9DLGFBQVksTUFBTSxFQUFFO0FBQUEsWUFDN0IsS0FBSztBQUFBLFlBQ0wsS0FBSztBQUFBLFlBQ0wsS0FBSztBQUFBLFlBQ0wsS0FBSztBQUNILHFCQUFPLE1BQU07QUFBQSxZQUNmLEtBQUs7QUFDSCxxQkFBTyxRQUFRO0FBQUEsWUFDakIsS0FBSztBQUNILHFCQUFPQyxlQUFjLE1BQU0sRUFBRTtBQUFBLFlBQy9CO0FBQ0Usa0JBQUksYUFBYTtBQUNmLHVCQUFPLFlBQVksS0FBS0QsYUFBWSxNQUFNLEVBQUU7QUFBQSxjQUM5QztBQUNBLDBCQUFZLEtBQUssVUFBVSxZQUFZO0FBQ3ZDLDRCQUFjO0FBQUEsVUFDbEI7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUNBLE1BQUFELFFBQU8sYUFBYTtBQUVwQixlQUFTLGFBQWMsVUFBVSxPQUFPLEtBQUs7QUFDM0MsWUFBSSxjQUFjO0FBU2xCLFlBQUksVUFBVSxVQUFhLFFBQVEsR0FBRztBQUNwQyxrQkFBUTtBQUFBLFFBQ1Y7QUFHQSxZQUFJLFFBQVEsS0FBSyxRQUFRO0FBQ3ZCLGlCQUFPO0FBQUEsUUFDVDtBQUVBLFlBQUksUUFBUSxVQUFhLE1BQU0sS0FBSyxRQUFRO0FBQzFDLGdCQUFNLEtBQUs7QUFBQSxRQUNiO0FBRUEsWUFBSSxPQUFPLEdBQUc7QUFDWixpQkFBTztBQUFBLFFBQ1Q7QUFHQSxpQkFBUztBQUNULG1CQUFXO0FBRVgsWUFBSSxPQUFPLE9BQU87QUFDaEIsaUJBQU87QUFBQSxRQUNUO0FBRUEsWUFBSSxDQUFDLFNBQVUsWUFBVztBQUUxQixlQUFPLE1BQU07QUFDWCxrQkFBUSxVQUFVO0FBQUEsWUFDaEIsS0FBSztBQUNILHFCQUFPLFNBQVMsTUFBTSxPQUFPLEdBQUc7QUFBQSxZQUVsQyxLQUFLO0FBQUEsWUFDTCxLQUFLO0FBQ0gscUJBQU8sVUFBVSxNQUFNLE9BQU8sR0FBRztBQUFBLFlBRW5DLEtBQUs7QUFDSCxxQkFBTyxXQUFXLE1BQU0sT0FBTyxHQUFHO0FBQUEsWUFFcEMsS0FBSztBQUFBLFlBQ0wsS0FBSztBQUNILHFCQUFPLFlBQVksTUFBTSxPQUFPLEdBQUc7QUFBQSxZQUVyQyxLQUFLO0FBQ0gscUJBQU8sWUFBWSxNQUFNLE9BQU8sR0FBRztBQUFBLFlBRXJDLEtBQUs7QUFBQSxZQUNMLEtBQUs7QUFBQSxZQUNMLEtBQUs7QUFBQSxZQUNMLEtBQUs7QUFDSCxxQkFBTyxhQUFhLE1BQU0sT0FBTyxHQUFHO0FBQUEsWUFFdEM7QUFDRSxrQkFBSSxZQUFhLE9BQU0sSUFBSSxVQUFVLHVCQUF1QixRQUFRO0FBQ3BFLDBCQUFZLFdBQVcsSUFBSSxZQUFZO0FBQ3ZDLDRCQUFjO0FBQUEsVUFDbEI7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQVFBLE1BQUFBLFFBQU8sVUFBVSxZQUFZO0FBRTdCLGVBQVMsS0FBTSxHQUFHLEdBQUcsR0FBRztBQUN0QixjQUFNLElBQUksRUFBRSxDQUFDO0FBQ2IsVUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ1YsVUFBRSxDQUFDLElBQUk7QUFBQSxNQUNUO0FBRUEsTUFBQUEsUUFBTyxVQUFVLFNBQVMsU0FBUyxTQUFVO0FBQzNDLGNBQU0sTUFBTSxLQUFLO0FBQ2pCLFlBQUksTUFBTSxNQUFNLEdBQUc7QUFDakIsZ0JBQU0sSUFBSSxXQUFXLDJDQUEyQztBQUFBLFFBQ2xFO0FBQ0EsaUJBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxLQUFLLEdBQUc7QUFDL0IsZUFBSyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQUEsUUFDckI7QUFDQSxlQUFPO0FBQUEsTUFDVDtBQUVBLE1BQUFBLFFBQU8sVUFBVSxTQUFTLFNBQVMsU0FBVTtBQUMzQyxjQUFNLE1BQU0sS0FBSztBQUNqQixZQUFJLE1BQU0sTUFBTSxHQUFHO0FBQ2pCLGdCQUFNLElBQUksV0FBVywyQ0FBMkM7QUFBQSxRQUNsRTtBQUNBLGlCQUFTLElBQUksR0FBRyxJQUFJLEtBQUssS0FBSyxHQUFHO0FBQy9CLGVBQUssTUFBTSxHQUFHLElBQUksQ0FBQztBQUNuQixlQUFLLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztBQUFBLFFBQ3pCO0FBQ0EsZUFBTztBQUFBLE1BQ1Q7QUFFQSxNQUFBQSxRQUFPLFVBQVUsU0FBUyxTQUFTLFNBQVU7QUFDM0MsY0FBTSxNQUFNLEtBQUs7QUFDakIsWUFBSSxNQUFNLE1BQU0sR0FBRztBQUNqQixnQkFBTSxJQUFJLFdBQVcsMkNBQTJDO0FBQUEsUUFDbEU7QUFDQSxpQkFBUyxJQUFJLEdBQUcsSUFBSSxLQUFLLEtBQUssR0FBRztBQUMvQixlQUFLLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkIsZUFBSyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFDdkIsZUFBSyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFDdkIsZUFBSyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFBQSxRQUN6QjtBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsTUFBQUEsUUFBTyxVQUFVLFdBQVcsU0FBUyxXQUFZO0FBQy9DLGNBQU0sU0FBUyxLQUFLO0FBQ3BCLFlBQUksV0FBVyxFQUFHLFFBQU87QUFDekIsWUFBSSxVQUFVLFdBQVcsRUFBRyxRQUFPLFVBQVUsTUFBTSxHQUFHLE1BQU07QUFDNUQsZUFBTyxhQUFhLE1BQU0sTUFBTSxTQUFTO0FBQUEsTUFDM0M7QUFFQSxNQUFBQSxRQUFPLFVBQVUsaUJBQWlCQSxRQUFPLFVBQVU7QUFFbkQsTUFBQUEsUUFBTyxVQUFVLFNBQVMsU0FBUyxPQUFRLEdBQUc7QUFDNUMsWUFBSSxDQUFDQSxRQUFPLFNBQVMsQ0FBQyxFQUFHLE9BQU0sSUFBSSxVQUFVLDJCQUEyQjtBQUN4RSxZQUFJLFNBQVMsRUFBRyxRQUFPO0FBQ3ZCLGVBQU9BLFFBQU8sUUFBUSxNQUFNLENBQUMsTUFBTTtBQUFBLE1BQ3JDO0FBRUEsTUFBQUEsUUFBTyxVQUFVLFVBQVUsU0FBUyxVQUFXO0FBQzdDLFlBQUksTUFBTTtBQUNWLGNBQU0sTUFBTSxRQUFRO0FBQ3BCLGNBQU0sS0FBSyxTQUFTLE9BQU8sR0FBRyxHQUFHLEVBQUUsUUFBUSxXQUFXLEtBQUssRUFBRSxLQUFLO0FBQ2xFLFlBQUksS0FBSyxTQUFTLElBQUssUUFBTztBQUM5QixlQUFPLGFBQWEsTUFBTTtBQUFBLE1BQzVCO0FBQ0EsVUFBSSxxQkFBcUI7QUFDdkIsUUFBQUEsUUFBTyxVQUFVLG1CQUFtQixJQUFJQSxRQUFPLFVBQVU7QUFBQSxNQUMzRDtBQUVBLE1BQUFBLFFBQU8sVUFBVSxVQUFVLFNBQVMsUUFBUyxRQUFRLE9BQU8sS0FBSyxXQUFXLFNBQVM7QUFDbkYsWUFBSSxXQUFXLFFBQVEsVUFBVSxHQUFHO0FBQ2xDLG1CQUFTQSxRQUFPLEtBQUssUUFBUSxPQUFPLFFBQVEsT0FBTyxVQUFVO0FBQUEsUUFDL0Q7QUFDQSxZQUFJLENBQUNBLFFBQU8sU0FBUyxNQUFNLEdBQUc7QUFDNUIsZ0JBQU0sSUFBSTtBQUFBLFlBQ1IsbUZBQ29CLE9BQU87QUFBQSxVQUM3QjtBQUFBLFFBQ0Y7QUFFQSxZQUFJLFVBQVUsUUFBVztBQUN2QixrQkFBUTtBQUFBLFFBQ1Y7QUFDQSxZQUFJLFFBQVEsUUFBVztBQUNyQixnQkFBTSxTQUFTLE9BQU8sU0FBUztBQUFBLFFBQ2pDO0FBQ0EsWUFBSSxjQUFjLFFBQVc7QUFDM0Isc0JBQVk7QUFBQSxRQUNkO0FBQ0EsWUFBSSxZQUFZLFFBQVc7QUFDekIsb0JBQVUsS0FBSztBQUFBLFFBQ2pCO0FBRUEsWUFBSSxRQUFRLEtBQUssTUFBTSxPQUFPLFVBQVUsWUFBWSxLQUFLLFVBQVUsS0FBSyxRQUFRO0FBQzlFLGdCQUFNLElBQUksV0FBVyxvQkFBb0I7QUFBQSxRQUMzQztBQUVBLFlBQUksYUFBYSxXQUFXLFNBQVMsS0FBSztBQUN4QyxpQkFBTztBQUFBLFFBQ1Q7QUFDQSxZQUFJLGFBQWEsU0FBUztBQUN4QixpQkFBTztBQUFBLFFBQ1Q7QUFDQSxZQUFJLFNBQVMsS0FBSztBQUNoQixpQkFBTztBQUFBLFFBQ1Q7QUFFQSxtQkFBVztBQUNYLGlCQUFTO0FBQ1QsdUJBQWU7QUFDZixxQkFBYTtBQUViLFlBQUksU0FBUyxPQUFRLFFBQU87QUFFNUIsWUFBSSxJQUFJLFVBQVU7QUFDbEIsWUFBSSxJQUFJLE1BQU07QUFDZCxjQUFNLE1BQU0sS0FBSyxJQUFJLEdBQUcsQ0FBQztBQUV6QixjQUFNLFdBQVcsS0FBSyxNQUFNLFdBQVcsT0FBTztBQUM5QyxjQUFNLGFBQWEsT0FBTyxNQUFNLE9BQU8sR0FBRztBQUUxQyxpQkFBUyxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQUUsR0FBRztBQUM1QixjQUFJLFNBQVMsQ0FBQyxNQUFNLFdBQVcsQ0FBQyxHQUFHO0FBQ2pDLGdCQUFJLFNBQVMsQ0FBQztBQUNkLGdCQUFJLFdBQVcsQ0FBQztBQUNoQjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBRUEsWUFBSSxJQUFJLEVBQUcsUUFBTztBQUNsQixZQUFJLElBQUksRUFBRyxRQUFPO0FBQ2xCLGVBQU87QUFBQSxNQUNUO0FBV0EsZUFBUyxxQkFBc0IsUUFBUSxLQUFLLFlBQVksVUFBVSxLQUFLO0FBRXJFLFlBQUksT0FBTyxXQUFXLEVBQUcsUUFBTztBQUdoQyxZQUFJLE9BQU8sZUFBZSxVQUFVO0FBQ2xDLHFCQUFXO0FBQ1gsdUJBQWE7QUFBQSxRQUNmLFdBQVcsYUFBYSxZQUFZO0FBQ2xDLHVCQUFhO0FBQUEsUUFDZixXQUFXLGFBQWEsYUFBYTtBQUNuQyx1QkFBYTtBQUFBLFFBQ2Y7QUFDQSxxQkFBYSxDQUFDO0FBQ2QsWUFBSSxZQUFZLFVBQVUsR0FBRztBQUUzQix1QkFBYSxNQUFNLElBQUssT0FBTyxTQUFTO0FBQUEsUUFDMUM7QUFHQSxZQUFJLGFBQWEsRUFBRyxjQUFhLE9BQU8sU0FBUztBQUNqRCxZQUFJLGNBQWMsT0FBTyxRQUFRO0FBQy9CLGNBQUksSUFBSyxRQUFPO0FBQUEsY0FDWCxjQUFhLE9BQU8sU0FBUztBQUFBLFFBQ3BDLFdBQVcsYUFBYSxHQUFHO0FBQ3pCLGNBQUksSUFBSyxjQUFhO0FBQUEsY0FDakIsUUFBTztBQUFBLFFBQ2Q7QUFHQSxZQUFJLE9BQU8sUUFBUSxVQUFVO0FBQzNCLGdCQUFNQSxRQUFPLEtBQUssS0FBSyxRQUFRO0FBQUEsUUFDakM7QUFHQSxZQUFJQSxRQUFPLFNBQVMsR0FBRyxHQUFHO0FBRXhCLGNBQUksSUFBSSxXQUFXLEdBQUc7QUFDcEIsbUJBQU87QUFBQSxVQUNUO0FBQ0EsaUJBQU8sYUFBYSxRQUFRLEtBQUssWUFBWSxVQUFVLEdBQUc7QUFBQSxRQUM1RCxXQUFXLE9BQU8sUUFBUSxVQUFVO0FBQ2xDLGdCQUFNLE1BQU07QUFDWixjQUFJLE9BQU8sV0FBVyxVQUFVLFlBQVksWUFBWTtBQUN0RCxnQkFBSSxLQUFLO0FBQ1AscUJBQU8sV0FBVyxVQUFVLFFBQVEsS0FBSyxRQUFRLEtBQUssVUFBVTtBQUFBLFlBQ2xFLE9BQU87QUFDTCxxQkFBTyxXQUFXLFVBQVUsWUFBWSxLQUFLLFFBQVEsS0FBSyxVQUFVO0FBQUEsWUFDdEU7QUFBQSxVQUNGO0FBQ0EsaUJBQU8sYUFBYSxRQUFRLENBQUMsR0FBRyxHQUFHLFlBQVksVUFBVSxHQUFHO0FBQUEsUUFDOUQ7QUFFQSxjQUFNLElBQUksVUFBVSxzQ0FBc0M7QUFBQSxNQUM1RDtBQUVBLGVBQVMsYUFBYyxLQUFLLEtBQUssWUFBWSxVQUFVLEtBQUs7QUFDMUQsWUFBSSxZQUFZO0FBQ2hCLFlBQUksWUFBWSxJQUFJO0FBQ3BCLFlBQUksWUFBWSxJQUFJO0FBRXBCLFlBQUksYUFBYSxRQUFXO0FBQzFCLHFCQUFXLE9BQU8sUUFBUSxFQUFFLFlBQVk7QUFDeEMsY0FBSSxhQUFhLFVBQVUsYUFBYSxXQUNwQyxhQUFhLGFBQWEsYUFBYSxZQUFZO0FBQ3JELGdCQUFJLElBQUksU0FBUyxLQUFLLElBQUksU0FBUyxHQUFHO0FBQ3BDLHFCQUFPO0FBQUEsWUFDVDtBQUNBLHdCQUFZO0FBQ1oseUJBQWE7QUFDYix5QkFBYTtBQUNiLDBCQUFjO0FBQUEsVUFDaEI7QUFBQSxRQUNGO0FBRUEsaUJBQVMsS0FBTSxLQUFLRyxJQUFHO0FBQ3JCLGNBQUksY0FBYyxHQUFHO0FBQ25CLG1CQUFPLElBQUlBLEVBQUM7QUFBQSxVQUNkLE9BQU87QUFDTCxtQkFBTyxJQUFJLGFBQWFBLEtBQUksU0FBUztBQUFBLFVBQ3ZDO0FBQUEsUUFDRjtBQUVBLFlBQUk7QUFDSixZQUFJLEtBQUs7QUFDUCxjQUFJLGFBQWE7QUFDakIsZUFBSyxJQUFJLFlBQVksSUFBSSxXQUFXLEtBQUs7QUFDdkMsZ0JBQUksS0FBSyxLQUFLLENBQUMsTUFBTSxLQUFLLEtBQUssZUFBZSxLQUFLLElBQUksSUFBSSxVQUFVLEdBQUc7QUFDdEUsa0JBQUksZUFBZSxHQUFJLGNBQWE7QUFDcEMsa0JBQUksSUFBSSxhQUFhLE1BQU0sVUFBVyxRQUFPLGFBQWE7QUFBQSxZQUM1RCxPQUFPO0FBQ0wsa0JBQUksZUFBZSxHQUFJLE1BQUssSUFBSTtBQUNoQywyQkFBYTtBQUFBLFlBQ2Y7QUFBQSxVQUNGO0FBQUEsUUFDRixPQUFPO0FBQ0wsY0FBSSxhQUFhLFlBQVksVUFBVyxjQUFhLFlBQVk7QUFDakUsZUFBSyxJQUFJLFlBQVksS0FBSyxHQUFHLEtBQUs7QUFDaEMsZ0JBQUksUUFBUTtBQUNaLHFCQUFTLElBQUksR0FBRyxJQUFJLFdBQVcsS0FBSztBQUNsQyxrQkFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsR0FBRztBQUNyQyx3QkFBUTtBQUNSO0FBQUEsY0FDRjtBQUFBLFlBQ0Y7QUFDQSxnQkFBSSxNQUFPLFFBQU87QUFBQSxVQUNwQjtBQUFBLFFBQ0Y7QUFFQSxlQUFPO0FBQUEsTUFDVDtBQUVBLE1BQUFILFFBQU8sVUFBVSxXQUFXLFNBQVMsU0FBVSxLQUFLLFlBQVksVUFBVTtBQUN4RSxlQUFPLEtBQUssUUFBUSxLQUFLLFlBQVksUUFBUSxNQUFNO0FBQUEsTUFDckQ7QUFFQSxNQUFBQSxRQUFPLFVBQVUsVUFBVSxTQUFTLFFBQVMsS0FBSyxZQUFZLFVBQVU7QUFDdEUsZUFBTyxxQkFBcUIsTUFBTSxLQUFLLFlBQVksVUFBVSxJQUFJO0FBQUEsTUFDbkU7QUFFQSxNQUFBQSxRQUFPLFVBQVUsY0FBYyxTQUFTLFlBQWEsS0FBSyxZQUFZLFVBQVU7QUFDOUUsZUFBTyxxQkFBcUIsTUFBTSxLQUFLLFlBQVksVUFBVSxLQUFLO0FBQUEsTUFDcEU7QUFFQSxlQUFTLFNBQVUsS0FBSyxRQUFRLFFBQVEsUUFBUTtBQUM5QyxpQkFBUyxPQUFPLE1BQU0sS0FBSztBQUMzQixjQUFNLFlBQVksSUFBSSxTQUFTO0FBQy9CLFlBQUksQ0FBQyxRQUFRO0FBQ1gsbUJBQVM7QUFBQSxRQUNYLE9BQU87QUFDTCxtQkFBUyxPQUFPLE1BQU07QUFDdEIsY0FBSSxTQUFTLFdBQVc7QUFDdEIscUJBQVM7QUFBQSxVQUNYO0FBQUEsUUFDRjtBQUVBLGNBQU0sU0FBUyxPQUFPO0FBRXRCLFlBQUksU0FBUyxTQUFTLEdBQUc7QUFDdkIsbUJBQVMsU0FBUztBQUFBLFFBQ3BCO0FBQ0EsWUFBSTtBQUNKLGFBQUssSUFBSSxHQUFHLElBQUksUUFBUSxFQUFFLEdBQUc7QUFDM0IsZ0JBQU0sU0FBUyxTQUFTLE9BQU8sT0FBTyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUU7QUFDbkQsY0FBSSxZQUFZLE1BQU0sRUFBRyxRQUFPO0FBQ2hDLGNBQUksU0FBUyxDQUFDLElBQUk7QUFBQSxRQUNwQjtBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxVQUFXLEtBQUssUUFBUSxRQUFRLFFBQVE7QUFDL0MsZUFBTyxXQUFXQyxhQUFZLFFBQVEsSUFBSSxTQUFTLE1BQU0sR0FBRyxLQUFLLFFBQVEsTUFBTTtBQUFBLE1BQ2pGO0FBRUEsZUFBUyxXQUFZLEtBQUssUUFBUSxRQUFRLFFBQVE7QUFDaEQsZUFBTyxXQUFXRyxjQUFhLE1BQU0sR0FBRyxLQUFLLFFBQVEsTUFBTTtBQUFBLE1BQzdEO0FBRUEsZUFBUyxZQUFhLEtBQUssUUFBUSxRQUFRLFFBQVE7QUFDakQsZUFBTyxXQUFXRixlQUFjLE1BQU0sR0FBRyxLQUFLLFFBQVEsTUFBTTtBQUFBLE1BQzlEO0FBRUEsZUFBUyxVQUFXLEtBQUssUUFBUSxRQUFRLFFBQVE7QUFDL0MsZUFBTyxXQUFXLGVBQWUsUUFBUSxJQUFJLFNBQVMsTUFBTSxHQUFHLEtBQUssUUFBUSxNQUFNO0FBQUEsTUFDcEY7QUFFQSxNQUFBRixRQUFPLFVBQVUsUUFBUSxTQUFTLE1BQU8sUUFBUSxRQUFRLFFBQVEsVUFBVTtBQUV6RSxZQUFJLFdBQVcsUUFBVztBQUN4QixxQkFBVztBQUNYLG1CQUFTLEtBQUs7QUFDZCxtQkFBUztBQUFBLFFBRVgsV0FBVyxXQUFXLFVBQWEsT0FBTyxXQUFXLFVBQVU7QUFDN0QscUJBQVc7QUFDWCxtQkFBUyxLQUFLO0FBQ2QsbUJBQVM7QUFBQSxRQUVYLFdBQVcsU0FBUyxNQUFNLEdBQUc7QUFDM0IsbUJBQVMsV0FBVztBQUNwQixjQUFJLFNBQVMsTUFBTSxHQUFHO0FBQ3BCLHFCQUFTLFdBQVc7QUFDcEIsZ0JBQUksYUFBYSxPQUFXLFlBQVc7QUFBQSxVQUN6QyxPQUFPO0FBQ0wsdUJBQVc7QUFDWCxxQkFBUztBQUFBLFVBQ1g7QUFBQSxRQUNGLE9BQU87QUFDTCxnQkFBTSxJQUFJO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBRUEsY0FBTSxZQUFZLEtBQUssU0FBUztBQUNoQyxZQUFJLFdBQVcsVUFBYSxTQUFTLFVBQVcsVUFBUztBQUV6RCxZQUFLLE9BQU8sU0FBUyxNQUFNLFNBQVMsS0FBSyxTQUFTLE1BQU8sU0FBUyxLQUFLLFFBQVE7QUFDN0UsZ0JBQU0sSUFBSSxXQUFXLHdDQUF3QztBQUFBLFFBQy9EO0FBRUEsWUFBSSxDQUFDLFNBQVUsWUFBVztBQUUxQixZQUFJLGNBQWM7QUFDbEIsbUJBQVM7QUFDUCxrQkFBUSxVQUFVO0FBQUEsWUFDaEIsS0FBSztBQUNILHFCQUFPLFNBQVMsTUFBTSxRQUFRLFFBQVEsTUFBTTtBQUFBLFlBRTlDLEtBQUs7QUFBQSxZQUNMLEtBQUs7QUFDSCxxQkFBTyxVQUFVLE1BQU0sUUFBUSxRQUFRLE1BQU07QUFBQSxZQUUvQyxLQUFLO0FBQUEsWUFDTCxLQUFLO0FBQUEsWUFDTCxLQUFLO0FBQ0gscUJBQU8sV0FBVyxNQUFNLFFBQVEsUUFBUSxNQUFNO0FBQUEsWUFFaEQsS0FBSztBQUVILHFCQUFPLFlBQVksTUFBTSxRQUFRLFFBQVEsTUFBTTtBQUFBLFlBRWpELEtBQUs7QUFBQSxZQUNMLEtBQUs7QUFBQSxZQUNMLEtBQUs7QUFBQSxZQUNMLEtBQUs7QUFDSCxxQkFBTyxVQUFVLE1BQU0sUUFBUSxRQUFRLE1BQU07QUFBQSxZQUUvQztBQUNFLGtCQUFJLFlBQWEsT0FBTSxJQUFJLFVBQVUsdUJBQXVCLFFBQVE7QUFDcEUsMEJBQVksS0FBSyxVQUFVLFlBQVk7QUFDdkMsNEJBQWM7QUFBQSxVQUNsQjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBRUEsTUFBQUEsUUFBTyxVQUFVLFNBQVMsU0FBUyxTQUFVO0FBQzNDLGVBQU87QUFBQSxVQUNMLE1BQU07QUFBQSxVQUNOLE1BQU0sTUFBTSxVQUFVLE1BQU0sS0FBSyxLQUFLLFFBQVEsTUFBTSxDQUFDO0FBQUEsUUFDdkQ7QUFBQSxNQUNGO0FBRUEsZUFBUyxZQUFhLEtBQUssT0FBTyxLQUFLO0FBQ3JDLFlBQUksVUFBVSxLQUFLLFFBQVEsSUFBSSxRQUFRO0FBQ3JDLGlCQUFPLE9BQU8sY0FBYyxHQUFHO0FBQUEsUUFDakMsT0FBTztBQUNMLGlCQUFPLE9BQU8sY0FBYyxJQUFJLE1BQU0sT0FBTyxHQUFHLENBQUM7QUFBQSxRQUNuRDtBQUFBLE1BQ0Y7QUFFQSxlQUFTLFVBQVcsS0FBSyxPQUFPLEtBQUs7QUFDbkMsY0FBTSxLQUFLLElBQUksSUFBSSxRQUFRLEdBQUc7QUFDOUIsY0FBTSxNQUFNLENBQUM7QUFFYixZQUFJLElBQUk7QUFDUixlQUFPLElBQUksS0FBSztBQUNkLGdCQUFNLFlBQVksSUFBSSxDQUFDO0FBQ3ZCLGNBQUksWUFBWTtBQUNoQixjQUFJLG1CQUFvQixZQUFZLE1BQ2hDLElBQ0MsWUFBWSxNQUNULElBQ0MsWUFBWSxNQUNULElBQ0E7QUFFWixjQUFJLElBQUksb0JBQW9CLEtBQUs7QUFDL0IsZ0JBQUksWUFBWSxXQUFXLFlBQVk7QUFFdkMsb0JBQVEsa0JBQWtCO0FBQUEsY0FDeEIsS0FBSztBQUNILG9CQUFJLFlBQVksS0FBTTtBQUNwQiw4QkFBWTtBQUFBLGdCQUNkO0FBQ0E7QUFBQSxjQUNGLEtBQUs7QUFDSCw2QkFBYSxJQUFJLElBQUksQ0FBQztBQUN0QixxQkFBSyxhQUFhLFNBQVUsS0FBTTtBQUNoQyxtQ0FBaUIsWUFBWSxPQUFTLElBQU8sYUFBYTtBQUMxRCxzQkFBSSxnQkFBZ0IsS0FBTTtBQUN4QixnQ0FBWTtBQUFBLGtCQUNkO0FBQUEsZ0JBQ0Y7QUFDQTtBQUFBLGNBQ0YsS0FBSztBQUNILDZCQUFhLElBQUksSUFBSSxDQUFDO0FBQ3RCLDRCQUFZLElBQUksSUFBSSxDQUFDO0FBQ3JCLHFCQUFLLGFBQWEsU0FBVSxRQUFTLFlBQVksU0FBVSxLQUFNO0FBQy9ELG1DQUFpQixZQUFZLE9BQVEsTUFBTyxhQUFhLE9BQVMsSUFBTyxZQUFZO0FBQ3JGLHNCQUFJLGdCQUFnQixTQUFVLGdCQUFnQixTQUFVLGdCQUFnQixRQUFTO0FBQy9FLGdDQUFZO0FBQUEsa0JBQ2Q7QUFBQSxnQkFDRjtBQUNBO0FBQUEsY0FDRixLQUFLO0FBQ0gsNkJBQWEsSUFBSSxJQUFJLENBQUM7QUFDdEIsNEJBQVksSUFBSSxJQUFJLENBQUM7QUFDckIsNkJBQWEsSUFBSSxJQUFJLENBQUM7QUFDdEIscUJBQUssYUFBYSxTQUFVLFFBQVMsWUFBWSxTQUFVLFFBQVMsYUFBYSxTQUFVLEtBQU07QUFDL0YsbUNBQWlCLFlBQVksT0FBUSxNQUFRLGFBQWEsT0FBUyxNQUFPLFlBQVksT0FBUyxJQUFPLGFBQWE7QUFDbkgsc0JBQUksZ0JBQWdCLFNBQVUsZ0JBQWdCLFNBQVU7QUFDdEQsZ0NBQVk7QUFBQSxrQkFDZDtBQUFBLGdCQUNGO0FBQUEsWUFDSjtBQUFBLFVBQ0Y7QUFFQSxjQUFJLGNBQWMsTUFBTTtBQUd0Qix3QkFBWTtBQUNaLCtCQUFtQjtBQUFBLFVBQ3JCLFdBQVcsWUFBWSxPQUFRO0FBRTdCLHlCQUFhO0FBQ2IsZ0JBQUksS0FBSyxjQUFjLEtBQUssT0FBUSxLQUFNO0FBQzFDLHdCQUFZLFFBQVMsWUFBWTtBQUFBLFVBQ25DO0FBRUEsY0FBSSxLQUFLLFNBQVM7QUFDbEIsZUFBSztBQUFBLFFBQ1A7QUFFQSxlQUFPLHNCQUFzQixHQUFHO0FBQUEsTUFDbEM7QUFLQSxVQUFNLHVCQUF1QjtBQUU3QixlQUFTLHNCQUF1QixZQUFZO0FBQzFDLGNBQU0sTUFBTSxXQUFXO0FBQ3ZCLFlBQUksT0FBTyxzQkFBc0I7QUFDL0IsaUJBQU8sT0FBTyxhQUFhLE1BQU0sUUFBUSxVQUFVO0FBQUEsUUFDckQ7QUFHQSxZQUFJLE1BQU07QUFDVixZQUFJLElBQUk7QUFDUixlQUFPLElBQUksS0FBSztBQUNkLGlCQUFPLE9BQU8sYUFBYTtBQUFBLFlBQ3pCO0FBQUEsWUFDQSxXQUFXLE1BQU0sR0FBRyxLQUFLLG9CQUFvQjtBQUFBLFVBQy9DO0FBQUEsUUFDRjtBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxXQUFZLEtBQUssT0FBTyxLQUFLO0FBQ3BDLFlBQUksTUFBTTtBQUNWLGNBQU0sS0FBSyxJQUFJLElBQUksUUFBUSxHQUFHO0FBRTlCLGlCQUFTLElBQUksT0FBTyxJQUFJLEtBQUssRUFBRSxHQUFHO0FBQ2hDLGlCQUFPLE9BQU8sYUFBYSxJQUFJLENBQUMsSUFBSSxHQUFJO0FBQUEsUUFDMUM7QUFDQSxlQUFPO0FBQUEsTUFDVDtBQUVBLGVBQVMsWUFBYSxLQUFLLE9BQU8sS0FBSztBQUNyQyxZQUFJLE1BQU07QUFDVixjQUFNLEtBQUssSUFBSSxJQUFJLFFBQVEsR0FBRztBQUU5QixpQkFBUyxJQUFJLE9BQU8sSUFBSSxLQUFLLEVBQUUsR0FBRztBQUNoQyxpQkFBTyxPQUFPLGFBQWEsSUFBSSxDQUFDLENBQUM7QUFBQSxRQUNuQztBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxTQUFVLEtBQUssT0FBTyxLQUFLO0FBQ2xDLGNBQU0sTUFBTSxJQUFJO0FBRWhCLFlBQUksQ0FBQyxTQUFTLFFBQVEsRUFBRyxTQUFRO0FBQ2pDLFlBQUksQ0FBQyxPQUFPLE1BQU0sS0FBSyxNQUFNLElBQUssT0FBTTtBQUV4QyxZQUFJLE1BQU07QUFDVixpQkFBUyxJQUFJLE9BQU8sSUFBSSxLQUFLLEVBQUUsR0FBRztBQUNoQyxpQkFBTyxvQkFBb0IsSUFBSSxDQUFDLENBQUM7QUFBQSxRQUNuQztBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxhQUFjLEtBQUssT0FBTyxLQUFLO0FBQ3RDLGNBQU0sUUFBUSxJQUFJLE1BQU0sT0FBTyxHQUFHO0FBQ2xDLFlBQUksTUFBTTtBQUVWLGlCQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sU0FBUyxHQUFHLEtBQUssR0FBRztBQUM1QyxpQkFBTyxPQUFPLGFBQWEsTUFBTSxDQUFDLElBQUssTUFBTSxJQUFJLENBQUMsSUFBSSxHQUFJO0FBQUEsUUFDNUQ7QUFDQSxlQUFPO0FBQUEsTUFDVDtBQUVBLE1BQUFBLFFBQU8sVUFBVSxRQUFRLFNBQVMsTUFBTyxPQUFPLEtBQUs7QUFDbkQsY0FBTSxNQUFNLEtBQUs7QUFDakIsZ0JBQVEsQ0FBQyxDQUFDO0FBQ1YsY0FBTSxRQUFRLFNBQVksTUFBTSxDQUFDLENBQUM7QUFFbEMsWUFBSSxRQUFRLEdBQUc7QUFDYixtQkFBUztBQUNULGNBQUksUUFBUSxFQUFHLFNBQVE7QUFBQSxRQUN6QixXQUFXLFFBQVEsS0FBSztBQUN0QixrQkFBUTtBQUFBLFFBQ1Y7QUFFQSxZQUFJLE1BQU0sR0FBRztBQUNYLGlCQUFPO0FBQ1AsY0FBSSxNQUFNLEVBQUcsT0FBTTtBQUFBLFFBQ3JCLFdBQVcsTUFBTSxLQUFLO0FBQ3BCLGdCQUFNO0FBQUEsUUFDUjtBQUVBLFlBQUksTUFBTSxNQUFPLE9BQU07QUFFdkIsY0FBTSxTQUFTLEtBQUssU0FBUyxPQUFPLEdBQUc7QUFFdkMsZUFBTyxlQUFlLFFBQVFBLFFBQU8sU0FBUztBQUU5QyxlQUFPO0FBQUEsTUFDVDtBQUtBLGVBQVMsWUFBYSxRQUFRLEtBQUssUUFBUTtBQUN6QyxZQUFLLFNBQVMsTUFBTyxLQUFLLFNBQVMsRUFBRyxPQUFNLElBQUksV0FBVyxvQkFBb0I7QUFDL0UsWUFBSSxTQUFTLE1BQU0sT0FBUSxPQUFNLElBQUksV0FBVyx1Q0FBdUM7QUFBQSxNQUN6RjtBQUVBLE1BQUFBLFFBQU8sVUFBVSxhQUNqQkEsUUFBTyxVQUFVLGFBQWEsU0FBUyxXQUFZLFFBQVFLLGFBQVksVUFBVTtBQUMvRSxpQkFBUyxXQUFXO0FBQ3BCLFFBQUFBLGNBQWFBLGdCQUFlO0FBQzVCLFlBQUksQ0FBQyxTQUFVLGFBQVksUUFBUUEsYUFBWSxLQUFLLE1BQU07QUFFMUQsWUFBSSxNQUFNLEtBQUssTUFBTTtBQUNyQixZQUFJLE1BQU07QUFDVixZQUFJLElBQUk7QUFDUixlQUFPLEVBQUUsSUFBSUEsZ0JBQWUsT0FBTyxNQUFRO0FBQ3pDLGlCQUFPLEtBQUssU0FBUyxDQUFDLElBQUk7QUFBQSxRQUM1QjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBRUEsTUFBQUwsUUFBTyxVQUFVLGFBQ2pCQSxRQUFPLFVBQVUsYUFBYSxTQUFTLFdBQVksUUFBUUssYUFBWSxVQUFVO0FBQy9FLGlCQUFTLFdBQVc7QUFDcEIsUUFBQUEsY0FBYUEsZ0JBQWU7QUFDNUIsWUFBSSxDQUFDLFVBQVU7QUFDYixzQkFBWSxRQUFRQSxhQUFZLEtBQUssTUFBTTtBQUFBLFFBQzdDO0FBRUEsWUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFQSxXQUFVO0FBQ3BDLFlBQUksTUFBTTtBQUNWLGVBQU9BLGNBQWEsTUFBTSxPQUFPLE1BQVE7QUFDdkMsaUJBQU8sS0FBSyxTQUFTLEVBQUVBLFdBQVUsSUFBSTtBQUFBLFFBQ3ZDO0FBRUEsZUFBTztBQUFBLE1BQ1Q7QUFFQSxNQUFBTCxRQUFPLFVBQVUsWUFDakJBLFFBQU8sVUFBVSxZQUFZLFNBQVMsVUFBVyxRQUFRLFVBQVU7QUFDakUsaUJBQVMsV0FBVztBQUNwQixZQUFJLENBQUMsU0FBVSxhQUFZLFFBQVEsR0FBRyxLQUFLLE1BQU07QUFDakQsZUFBTyxLQUFLLE1BQU07QUFBQSxNQUNwQjtBQUVBLE1BQUFBLFFBQU8sVUFBVSxlQUNqQkEsUUFBTyxVQUFVLGVBQWUsU0FBUyxhQUFjLFFBQVEsVUFBVTtBQUN2RSxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxTQUFVLGFBQVksUUFBUSxHQUFHLEtBQUssTUFBTTtBQUNqRCxlQUFPLEtBQUssTUFBTSxJQUFLLEtBQUssU0FBUyxDQUFDLEtBQUs7QUFBQSxNQUM3QztBQUVBLE1BQUFBLFFBQU8sVUFBVSxlQUNqQkEsUUFBTyxVQUFVLGVBQWUsU0FBUyxhQUFjLFFBQVEsVUFBVTtBQUN2RSxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxTQUFVLGFBQVksUUFBUSxHQUFHLEtBQUssTUFBTTtBQUNqRCxlQUFRLEtBQUssTUFBTSxLQUFLLElBQUssS0FBSyxTQUFTLENBQUM7QUFBQSxNQUM5QztBQUVBLE1BQUFBLFFBQU8sVUFBVSxlQUNqQkEsUUFBTyxVQUFVLGVBQWUsU0FBUyxhQUFjLFFBQVEsVUFBVTtBQUN2RSxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxTQUFVLGFBQVksUUFBUSxHQUFHLEtBQUssTUFBTTtBQUVqRCxnQkFBUyxLQUFLLE1BQU0sSUFDZixLQUFLLFNBQVMsQ0FBQyxLQUFLLElBQ3BCLEtBQUssU0FBUyxDQUFDLEtBQUssTUFDcEIsS0FBSyxTQUFTLENBQUMsSUFBSTtBQUFBLE1BQzFCO0FBRUEsTUFBQUEsUUFBTyxVQUFVLGVBQ2pCQSxRQUFPLFVBQVUsZUFBZSxTQUFTLGFBQWMsUUFBUSxVQUFVO0FBQ3ZFLGlCQUFTLFdBQVc7QUFDcEIsWUFBSSxDQUFDLFNBQVUsYUFBWSxRQUFRLEdBQUcsS0FBSyxNQUFNO0FBRWpELGVBQVEsS0FBSyxNQUFNLElBQUksWUFDbkIsS0FBSyxTQUFTLENBQUMsS0FBSyxLQUNyQixLQUFLLFNBQVMsQ0FBQyxLQUFLLElBQ3JCLEtBQUssU0FBUyxDQUFDO0FBQUEsTUFDbkI7QUFFQSxNQUFBQSxRQUFPLFVBQVUsa0JBQWtCLG1CQUFtQixTQUFTLGdCQUFpQixRQUFRO0FBQ3RGLGlCQUFTLFdBQVc7QUFDcEIsdUJBQWUsUUFBUSxRQUFRO0FBQy9CLGNBQU0sUUFBUSxLQUFLLE1BQU07QUFDekIsY0FBTSxPQUFPLEtBQUssU0FBUyxDQUFDO0FBQzVCLFlBQUksVUFBVSxVQUFhLFNBQVMsUUFBVztBQUM3QyxzQkFBWSxRQUFRLEtBQUssU0FBUyxDQUFDO0FBQUEsUUFDckM7QUFFQSxjQUFNLEtBQUssUUFDVCxLQUFLLEVBQUUsTUFBTSxJQUFJLEtBQUssSUFDdEIsS0FBSyxFQUFFLE1BQU0sSUFBSSxLQUFLLEtBQ3RCLEtBQUssRUFBRSxNQUFNLElBQUksS0FBSztBQUV4QixjQUFNLEtBQUssS0FBSyxFQUFFLE1BQU0sSUFDdEIsS0FBSyxFQUFFLE1BQU0sSUFBSSxLQUFLLElBQ3RCLEtBQUssRUFBRSxNQUFNLElBQUksS0FBSyxLQUN0QixPQUFPLEtBQUs7QUFFZCxlQUFPLE9BQU8sRUFBRSxLQUFLLE9BQU8sRUFBRSxLQUFLLE9BQU8sRUFBRTtBQUFBLE1BQzlDLENBQUM7QUFFRCxNQUFBQSxRQUFPLFVBQVUsa0JBQWtCLG1CQUFtQixTQUFTLGdCQUFpQixRQUFRO0FBQ3RGLGlCQUFTLFdBQVc7QUFDcEIsdUJBQWUsUUFBUSxRQUFRO0FBQy9CLGNBQU0sUUFBUSxLQUFLLE1BQU07QUFDekIsY0FBTSxPQUFPLEtBQUssU0FBUyxDQUFDO0FBQzVCLFlBQUksVUFBVSxVQUFhLFNBQVMsUUFBVztBQUM3QyxzQkFBWSxRQUFRLEtBQUssU0FBUyxDQUFDO0FBQUEsUUFDckM7QUFFQSxjQUFNLEtBQUssUUFBUSxLQUFLLEtBQ3RCLEtBQUssRUFBRSxNQUFNLElBQUksS0FBSyxLQUN0QixLQUFLLEVBQUUsTUFBTSxJQUFJLEtBQUssSUFDdEIsS0FBSyxFQUFFLE1BQU07QUFFZixjQUFNLEtBQUssS0FBSyxFQUFFLE1BQU0sSUFBSSxLQUFLLEtBQy9CLEtBQUssRUFBRSxNQUFNLElBQUksS0FBSyxLQUN0QixLQUFLLEVBQUUsTUFBTSxJQUFJLEtBQUssSUFDdEI7QUFFRixnQkFBUSxPQUFPLEVBQUUsS0FBSyxPQUFPLEVBQUUsS0FBSyxPQUFPLEVBQUU7QUFBQSxNQUMvQyxDQUFDO0FBRUQsTUFBQUEsUUFBTyxVQUFVLFlBQVksU0FBUyxVQUFXLFFBQVFLLGFBQVksVUFBVTtBQUM3RSxpQkFBUyxXQUFXO0FBQ3BCLFFBQUFBLGNBQWFBLGdCQUFlO0FBQzVCLFlBQUksQ0FBQyxTQUFVLGFBQVksUUFBUUEsYUFBWSxLQUFLLE1BQU07QUFFMUQsWUFBSSxNQUFNLEtBQUssTUFBTTtBQUNyQixZQUFJLE1BQU07QUFDVixZQUFJLElBQUk7QUFDUixlQUFPLEVBQUUsSUFBSUEsZ0JBQWUsT0FBTyxNQUFRO0FBQ3pDLGlCQUFPLEtBQUssU0FBUyxDQUFDLElBQUk7QUFBQSxRQUM1QjtBQUNBLGVBQU87QUFFUCxZQUFJLE9BQU8sSUFBSyxRQUFPLEtBQUssSUFBSSxHQUFHLElBQUlBLFdBQVU7QUFFakQsZUFBTztBQUFBLE1BQ1Q7QUFFQSxNQUFBTCxRQUFPLFVBQVUsWUFBWSxTQUFTLFVBQVcsUUFBUUssYUFBWSxVQUFVO0FBQzdFLGlCQUFTLFdBQVc7QUFDcEIsUUFBQUEsY0FBYUEsZ0JBQWU7QUFDNUIsWUFBSSxDQUFDLFNBQVUsYUFBWSxRQUFRQSxhQUFZLEtBQUssTUFBTTtBQUUxRCxZQUFJLElBQUlBO0FBQ1IsWUFBSSxNQUFNO0FBQ1YsWUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7QUFDM0IsZUFBTyxJQUFJLE1BQU0sT0FBTyxNQUFRO0FBQzlCLGlCQUFPLEtBQUssU0FBUyxFQUFFLENBQUMsSUFBSTtBQUFBLFFBQzlCO0FBQ0EsZUFBTztBQUVQLFlBQUksT0FBTyxJQUFLLFFBQU8sS0FBSyxJQUFJLEdBQUcsSUFBSUEsV0FBVTtBQUVqRCxlQUFPO0FBQUEsTUFDVDtBQUVBLE1BQUFMLFFBQU8sVUFBVSxXQUFXLFNBQVMsU0FBVSxRQUFRLFVBQVU7QUFDL0QsaUJBQVMsV0FBVztBQUNwQixZQUFJLENBQUMsU0FBVSxhQUFZLFFBQVEsR0FBRyxLQUFLLE1BQU07QUFDakQsWUFBSSxFQUFFLEtBQUssTUFBTSxJQUFJLEtBQU8sUUFBUSxLQUFLLE1BQU07QUFDL0MsZ0JBQVMsTUFBTyxLQUFLLE1BQU0sSUFBSSxLQUFLO0FBQUEsTUFDdEM7QUFFQSxNQUFBQSxRQUFPLFVBQVUsY0FBYyxTQUFTLFlBQWEsUUFBUSxVQUFVO0FBQ3JFLGlCQUFTLFdBQVc7QUFDcEIsWUFBSSxDQUFDLFNBQVUsYUFBWSxRQUFRLEdBQUcsS0FBSyxNQUFNO0FBQ2pELGNBQU0sTUFBTSxLQUFLLE1BQU0sSUFBSyxLQUFLLFNBQVMsQ0FBQyxLQUFLO0FBQ2hELGVBQVEsTUFBTSxRQUFVLE1BQU0sYUFBYTtBQUFBLE1BQzdDO0FBRUEsTUFBQUEsUUFBTyxVQUFVLGNBQWMsU0FBUyxZQUFhLFFBQVEsVUFBVTtBQUNyRSxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxTQUFVLGFBQVksUUFBUSxHQUFHLEtBQUssTUFBTTtBQUNqRCxjQUFNLE1BQU0sS0FBSyxTQUFTLENBQUMsSUFBSyxLQUFLLE1BQU0sS0FBSztBQUNoRCxlQUFRLE1BQU0sUUFBVSxNQUFNLGFBQWE7QUFBQSxNQUM3QztBQUVBLE1BQUFBLFFBQU8sVUFBVSxjQUFjLFNBQVMsWUFBYSxRQUFRLFVBQVU7QUFDckUsaUJBQVMsV0FBVztBQUNwQixZQUFJLENBQUMsU0FBVSxhQUFZLFFBQVEsR0FBRyxLQUFLLE1BQU07QUFFakQsZUFBUSxLQUFLLE1BQU0sSUFDaEIsS0FBSyxTQUFTLENBQUMsS0FBSyxJQUNwQixLQUFLLFNBQVMsQ0FBQyxLQUFLLEtBQ3BCLEtBQUssU0FBUyxDQUFDLEtBQUs7QUFBQSxNQUN6QjtBQUVBLE1BQUFBLFFBQU8sVUFBVSxjQUFjLFNBQVMsWUFBYSxRQUFRLFVBQVU7QUFDckUsaUJBQVMsV0FBVztBQUNwQixZQUFJLENBQUMsU0FBVSxhQUFZLFFBQVEsR0FBRyxLQUFLLE1BQU07QUFFakQsZUFBUSxLQUFLLE1BQU0sS0FBSyxLQUNyQixLQUFLLFNBQVMsQ0FBQyxLQUFLLEtBQ3BCLEtBQUssU0FBUyxDQUFDLEtBQUssSUFDcEIsS0FBSyxTQUFTLENBQUM7QUFBQSxNQUNwQjtBQUVBLE1BQUFBLFFBQU8sVUFBVSxpQkFBaUIsbUJBQW1CLFNBQVMsZUFBZ0IsUUFBUTtBQUNwRixpQkFBUyxXQUFXO0FBQ3BCLHVCQUFlLFFBQVEsUUFBUTtBQUMvQixjQUFNLFFBQVEsS0FBSyxNQUFNO0FBQ3pCLGNBQU0sT0FBTyxLQUFLLFNBQVMsQ0FBQztBQUM1QixZQUFJLFVBQVUsVUFBYSxTQUFTLFFBQVc7QUFDN0Msc0JBQVksUUFBUSxLQUFLLFNBQVMsQ0FBQztBQUFBLFFBQ3JDO0FBRUEsY0FBTSxNQUFNLEtBQUssU0FBUyxDQUFDLElBQ3pCLEtBQUssU0FBUyxDQUFDLElBQUksS0FBSyxJQUN4QixLQUFLLFNBQVMsQ0FBQyxJQUFJLEtBQUssTUFDdkIsUUFBUTtBQUVYLGdCQUFRLE9BQU8sR0FBRyxLQUFLLE9BQU8sRUFBRSxLQUM5QixPQUFPLFFBQ1AsS0FBSyxFQUFFLE1BQU0sSUFBSSxLQUFLLElBQ3RCLEtBQUssRUFBRSxNQUFNLElBQUksS0FBSyxLQUN0QixLQUFLLEVBQUUsTUFBTSxJQUFJLEtBQUssRUFBRTtBQUFBLE1BQzVCLENBQUM7QUFFRCxNQUFBQSxRQUFPLFVBQVUsaUJBQWlCLG1CQUFtQixTQUFTLGVBQWdCLFFBQVE7QUFDcEYsaUJBQVMsV0FBVztBQUNwQix1QkFBZSxRQUFRLFFBQVE7QUFDL0IsY0FBTSxRQUFRLEtBQUssTUFBTTtBQUN6QixjQUFNLE9BQU8sS0FBSyxTQUFTLENBQUM7QUFDNUIsWUFBSSxVQUFVLFVBQWEsU0FBUyxRQUFXO0FBQzdDLHNCQUFZLFFBQVEsS0FBSyxTQUFTLENBQUM7QUFBQSxRQUNyQztBQUVBLGNBQU0sT0FBTyxTQUFTO0FBQUEsUUFDcEIsS0FBSyxFQUFFLE1BQU0sSUFBSSxLQUFLLEtBQ3RCLEtBQUssRUFBRSxNQUFNLElBQUksS0FBSyxJQUN0QixLQUFLLEVBQUUsTUFBTTtBQUVmLGdCQUFRLE9BQU8sR0FBRyxLQUFLLE9BQU8sRUFBRSxLQUM5QixPQUFPLEtBQUssRUFBRSxNQUFNLElBQUksS0FBSyxLQUM3QixLQUFLLEVBQUUsTUFBTSxJQUFJLEtBQUssS0FDdEIsS0FBSyxFQUFFLE1BQU0sSUFBSSxLQUFLLElBQ3RCLElBQUk7QUFBQSxNQUNSLENBQUM7QUFFRCxNQUFBQSxRQUFPLFVBQVUsY0FBYyxTQUFTLFlBQWEsUUFBUSxVQUFVO0FBQ3JFLGlCQUFTLFdBQVc7QUFDcEIsWUFBSSxDQUFDLFNBQVUsYUFBWSxRQUFRLEdBQUcsS0FBSyxNQUFNO0FBQ2pELGVBQU8sUUFBUSxLQUFLLE1BQU0sUUFBUSxNQUFNLElBQUksQ0FBQztBQUFBLE1BQy9DO0FBRUEsTUFBQUEsUUFBTyxVQUFVLGNBQWMsU0FBUyxZQUFhLFFBQVEsVUFBVTtBQUNyRSxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxTQUFVLGFBQVksUUFBUSxHQUFHLEtBQUssTUFBTTtBQUNqRCxlQUFPLFFBQVEsS0FBSyxNQUFNLFFBQVEsT0FBTyxJQUFJLENBQUM7QUFBQSxNQUNoRDtBQUVBLE1BQUFBLFFBQU8sVUFBVSxlQUFlLFNBQVMsYUFBYyxRQUFRLFVBQVU7QUFDdkUsaUJBQVMsV0FBVztBQUNwQixZQUFJLENBQUMsU0FBVSxhQUFZLFFBQVEsR0FBRyxLQUFLLE1BQU07QUFDakQsZUFBTyxRQUFRLEtBQUssTUFBTSxRQUFRLE1BQU0sSUFBSSxDQUFDO0FBQUEsTUFDL0M7QUFFQSxNQUFBQSxRQUFPLFVBQVUsZUFBZSxTQUFTLGFBQWMsUUFBUSxVQUFVO0FBQ3ZFLGlCQUFTLFdBQVc7QUFDcEIsWUFBSSxDQUFDLFNBQVUsYUFBWSxRQUFRLEdBQUcsS0FBSyxNQUFNO0FBQ2pELGVBQU8sUUFBUSxLQUFLLE1BQU0sUUFBUSxPQUFPLElBQUksQ0FBQztBQUFBLE1BQ2hEO0FBRUEsZUFBUyxTQUFVLEtBQUssT0FBTyxRQUFRLEtBQUssS0FBSyxLQUFLO0FBQ3BELFlBQUksQ0FBQ0EsUUFBTyxTQUFTLEdBQUcsRUFBRyxPQUFNLElBQUksVUFBVSw2Q0FBNkM7QUFDNUYsWUFBSSxRQUFRLE9BQU8sUUFBUSxJQUFLLE9BQU0sSUFBSSxXQUFXLG1DQUFtQztBQUN4RixZQUFJLFNBQVMsTUFBTSxJQUFJLE9BQVEsT0FBTSxJQUFJLFdBQVcsb0JBQW9CO0FBQUEsTUFDMUU7QUFFQSxNQUFBQSxRQUFPLFVBQVUsY0FDakJBLFFBQU8sVUFBVSxjQUFjLFNBQVMsWUFBYSxPQUFPLFFBQVFLLGFBQVksVUFBVTtBQUN4RixnQkFBUSxDQUFDO0FBQ1QsaUJBQVMsV0FBVztBQUNwQixRQUFBQSxjQUFhQSxnQkFBZTtBQUM1QixZQUFJLENBQUMsVUFBVTtBQUNiLGdCQUFNLFdBQVcsS0FBSyxJQUFJLEdBQUcsSUFBSUEsV0FBVSxJQUFJO0FBQy9DLG1CQUFTLE1BQU0sT0FBTyxRQUFRQSxhQUFZLFVBQVUsQ0FBQztBQUFBLFFBQ3ZEO0FBRUEsWUFBSSxNQUFNO0FBQ1YsWUFBSSxJQUFJO0FBQ1IsYUFBSyxNQUFNLElBQUksUUFBUTtBQUN2QixlQUFPLEVBQUUsSUFBSUEsZ0JBQWUsT0FBTyxNQUFRO0FBQ3pDLGVBQUssU0FBUyxDQUFDLElBQUssUUFBUSxNQUFPO0FBQUEsUUFDckM7QUFFQSxlQUFPLFNBQVNBO0FBQUEsTUFDbEI7QUFFQSxNQUFBTCxRQUFPLFVBQVUsY0FDakJBLFFBQU8sVUFBVSxjQUFjLFNBQVMsWUFBYSxPQUFPLFFBQVFLLGFBQVksVUFBVTtBQUN4RixnQkFBUSxDQUFDO0FBQ1QsaUJBQVMsV0FBVztBQUNwQixRQUFBQSxjQUFhQSxnQkFBZTtBQUM1QixZQUFJLENBQUMsVUFBVTtBQUNiLGdCQUFNLFdBQVcsS0FBSyxJQUFJLEdBQUcsSUFBSUEsV0FBVSxJQUFJO0FBQy9DLG1CQUFTLE1BQU0sT0FBTyxRQUFRQSxhQUFZLFVBQVUsQ0FBQztBQUFBLFFBQ3ZEO0FBRUEsWUFBSSxJQUFJQSxjQUFhO0FBQ3JCLFlBQUksTUFBTTtBQUNWLGFBQUssU0FBUyxDQUFDLElBQUksUUFBUTtBQUMzQixlQUFPLEVBQUUsS0FBSyxNQUFNLE9BQU8sTUFBUTtBQUNqQyxlQUFLLFNBQVMsQ0FBQyxJQUFLLFFBQVEsTUFBTztBQUFBLFFBQ3JDO0FBRUEsZUFBTyxTQUFTQTtBQUFBLE1BQ2xCO0FBRUEsTUFBQUwsUUFBTyxVQUFVLGFBQ2pCQSxRQUFPLFVBQVUsYUFBYSxTQUFTLFdBQVksT0FBTyxRQUFRLFVBQVU7QUFDMUUsZ0JBQVEsQ0FBQztBQUNULGlCQUFTLFdBQVc7QUFDcEIsWUFBSSxDQUFDLFNBQVUsVUFBUyxNQUFNLE9BQU8sUUFBUSxHQUFHLEtBQU0sQ0FBQztBQUN2RCxhQUFLLE1BQU0sSUFBSyxRQUFRO0FBQ3hCLGVBQU8sU0FBUztBQUFBLE1BQ2xCO0FBRUEsTUFBQUEsUUFBTyxVQUFVLGdCQUNqQkEsUUFBTyxVQUFVLGdCQUFnQixTQUFTLGNBQWUsT0FBTyxRQUFRLFVBQVU7QUFDaEYsZ0JBQVEsQ0FBQztBQUNULGlCQUFTLFdBQVc7QUFDcEIsWUFBSSxDQUFDLFNBQVUsVUFBUyxNQUFNLE9BQU8sUUFBUSxHQUFHLE9BQVEsQ0FBQztBQUN6RCxhQUFLLE1BQU0sSUFBSyxRQUFRO0FBQ3hCLGFBQUssU0FBUyxDQUFDLElBQUssVUFBVTtBQUM5QixlQUFPLFNBQVM7QUFBQSxNQUNsQjtBQUVBLE1BQUFBLFFBQU8sVUFBVSxnQkFDakJBLFFBQU8sVUFBVSxnQkFBZ0IsU0FBUyxjQUFlLE9BQU8sUUFBUSxVQUFVO0FBQ2hGLGdCQUFRLENBQUM7QUFDVCxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxTQUFVLFVBQVMsTUFBTSxPQUFPLFFBQVEsR0FBRyxPQUFRLENBQUM7QUFDekQsYUFBSyxNQUFNLElBQUssVUFBVTtBQUMxQixhQUFLLFNBQVMsQ0FBQyxJQUFLLFFBQVE7QUFDNUIsZUFBTyxTQUFTO0FBQUEsTUFDbEI7QUFFQSxNQUFBQSxRQUFPLFVBQVUsZ0JBQ2pCQSxRQUFPLFVBQVUsZ0JBQWdCLFNBQVMsY0FBZSxPQUFPLFFBQVEsVUFBVTtBQUNoRixnQkFBUSxDQUFDO0FBQ1QsaUJBQVMsV0FBVztBQUNwQixZQUFJLENBQUMsU0FBVSxVQUFTLE1BQU0sT0FBTyxRQUFRLEdBQUcsWUFBWSxDQUFDO0FBQzdELGFBQUssU0FBUyxDQUFDLElBQUssVUFBVTtBQUM5QixhQUFLLFNBQVMsQ0FBQyxJQUFLLFVBQVU7QUFDOUIsYUFBSyxTQUFTLENBQUMsSUFBSyxVQUFVO0FBQzlCLGFBQUssTUFBTSxJQUFLLFFBQVE7QUFDeEIsZUFBTyxTQUFTO0FBQUEsTUFDbEI7QUFFQSxNQUFBQSxRQUFPLFVBQVUsZ0JBQ2pCQSxRQUFPLFVBQVUsZ0JBQWdCLFNBQVMsY0FBZSxPQUFPLFFBQVEsVUFBVTtBQUNoRixnQkFBUSxDQUFDO0FBQ1QsaUJBQVMsV0FBVztBQUNwQixZQUFJLENBQUMsU0FBVSxVQUFTLE1BQU0sT0FBTyxRQUFRLEdBQUcsWUFBWSxDQUFDO0FBQzdELGFBQUssTUFBTSxJQUFLLFVBQVU7QUFDMUIsYUFBSyxTQUFTLENBQUMsSUFBSyxVQUFVO0FBQzlCLGFBQUssU0FBUyxDQUFDLElBQUssVUFBVTtBQUM5QixhQUFLLFNBQVMsQ0FBQyxJQUFLLFFBQVE7QUFDNUIsZUFBTyxTQUFTO0FBQUEsTUFDbEI7QUFFQSxlQUFTLGVBQWdCLEtBQUssT0FBTyxRQUFRLEtBQUssS0FBSztBQUNyRCxtQkFBVyxPQUFPLEtBQUssS0FBSyxLQUFLLFFBQVEsQ0FBQztBQUUxQyxZQUFJLEtBQUssT0FBTyxRQUFRLE9BQU8sVUFBVSxDQUFDO0FBQzFDLFlBQUksUUFBUSxJQUFJO0FBQ2hCLGFBQUssTUFBTTtBQUNYLFlBQUksUUFBUSxJQUFJO0FBQ2hCLGFBQUssTUFBTTtBQUNYLFlBQUksUUFBUSxJQUFJO0FBQ2hCLGFBQUssTUFBTTtBQUNYLFlBQUksUUFBUSxJQUFJO0FBQ2hCLFlBQUksS0FBSyxPQUFPLFNBQVMsT0FBTyxFQUFFLElBQUksT0FBTyxVQUFVLENBQUM7QUFDeEQsWUFBSSxRQUFRLElBQUk7QUFDaEIsYUFBSyxNQUFNO0FBQ1gsWUFBSSxRQUFRLElBQUk7QUFDaEIsYUFBSyxNQUFNO0FBQ1gsWUFBSSxRQUFRLElBQUk7QUFDaEIsYUFBSyxNQUFNO0FBQ1gsWUFBSSxRQUFRLElBQUk7QUFDaEIsZUFBTztBQUFBLE1BQ1Q7QUFFQSxlQUFTLGVBQWdCLEtBQUssT0FBTyxRQUFRLEtBQUssS0FBSztBQUNyRCxtQkFBVyxPQUFPLEtBQUssS0FBSyxLQUFLLFFBQVEsQ0FBQztBQUUxQyxZQUFJLEtBQUssT0FBTyxRQUFRLE9BQU8sVUFBVSxDQUFDO0FBQzFDLFlBQUksU0FBUyxDQUFDLElBQUk7QUFDbEIsYUFBSyxNQUFNO0FBQ1gsWUFBSSxTQUFTLENBQUMsSUFBSTtBQUNsQixhQUFLLE1BQU07QUFDWCxZQUFJLFNBQVMsQ0FBQyxJQUFJO0FBQ2xCLGFBQUssTUFBTTtBQUNYLFlBQUksU0FBUyxDQUFDLElBQUk7QUFDbEIsWUFBSSxLQUFLLE9BQU8sU0FBUyxPQUFPLEVBQUUsSUFBSSxPQUFPLFVBQVUsQ0FBQztBQUN4RCxZQUFJLFNBQVMsQ0FBQyxJQUFJO0FBQ2xCLGFBQUssTUFBTTtBQUNYLFlBQUksU0FBUyxDQUFDLElBQUk7QUFDbEIsYUFBSyxNQUFNO0FBQ1gsWUFBSSxTQUFTLENBQUMsSUFBSTtBQUNsQixhQUFLLE1BQU07QUFDWCxZQUFJLE1BQU0sSUFBSTtBQUNkLGVBQU8sU0FBUztBQUFBLE1BQ2xCO0FBRUEsTUFBQUEsUUFBTyxVQUFVLG1CQUFtQixtQkFBbUIsU0FBUyxpQkFBa0IsT0FBTyxTQUFTLEdBQUc7QUFDbkcsZUFBTyxlQUFlLE1BQU0sT0FBTyxRQUFRLE9BQU8sQ0FBQyxHQUFHLE9BQU8sb0JBQW9CLENBQUM7QUFBQSxNQUNwRixDQUFDO0FBRUQsTUFBQUEsUUFBTyxVQUFVLG1CQUFtQixtQkFBbUIsU0FBUyxpQkFBa0IsT0FBTyxTQUFTLEdBQUc7QUFDbkcsZUFBTyxlQUFlLE1BQU0sT0FBTyxRQUFRLE9BQU8sQ0FBQyxHQUFHLE9BQU8sb0JBQW9CLENBQUM7QUFBQSxNQUNwRixDQUFDO0FBRUQsTUFBQUEsUUFBTyxVQUFVLGFBQWEsU0FBUyxXQUFZLE9BQU8sUUFBUUssYUFBWSxVQUFVO0FBQ3RGLGdCQUFRLENBQUM7QUFDVCxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxVQUFVO0FBQ2IsZ0JBQU0sUUFBUSxLQUFLLElBQUksR0FBSSxJQUFJQSxjQUFjLENBQUM7QUFFOUMsbUJBQVMsTUFBTSxPQUFPLFFBQVFBLGFBQVksUUFBUSxHQUFHLENBQUMsS0FBSztBQUFBLFFBQzdEO0FBRUEsWUFBSSxJQUFJO0FBQ1IsWUFBSSxNQUFNO0FBQ1YsWUFBSSxNQUFNO0FBQ1YsYUFBSyxNQUFNLElBQUksUUFBUTtBQUN2QixlQUFPLEVBQUUsSUFBSUEsZ0JBQWUsT0FBTyxNQUFRO0FBQ3pDLGNBQUksUUFBUSxLQUFLLFFBQVEsS0FBSyxLQUFLLFNBQVMsSUFBSSxDQUFDLE1BQU0sR0FBRztBQUN4RCxrQkFBTTtBQUFBLFVBQ1I7QUFDQSxlQUFLLFNBQVMsQ0FBQyxLQUFNLFFBQVEsT0FBUSxLQUFLLE1BQU07QUFBQSxRQUNsRDtBQUVBLGVBQU8sU0FBU0E7QUFBQSxNQUNsQjtBQUVBLE1BQUFMLFFBQU8sVUFBVSxhQUFhLFNBQVMsV0FBWSxPQUFPLFFBQVFLLGFBQVksVUFBVTtBQUN0RixnQkFBUSxDQUFDO0FBQ1QsaUJBQVMsV0FBVztBQUNwQixZQUFJLENBQUMsVUFBVTtBQUNiLGdCQUFNLFFBQVEsS0FBSyxJQUFJLEdBQUksSUFBSUEsY0FBYyxDQUFDO0FBRTlDLG1CQUFTLE1BQU0sT0FBTyxRQUFRQSxhQUFZLFFBQVEsR0FBRyxDQUFDLEtBQUs7QUFBQSxRQUM3RDtBQUVBLFlBQUksSUFBSUEsY0FBYTtBQUNyQixZQUFJLE1BQU07QUFDVixZQUFJLE1BQU07QUFDVixhQUFLLFNBQVMsQ0FBQyxJQUFJLFFBQVE7QUFDM0IsZUFBTyxFQUFFLEtBQUssTUFBTSxPQUFPLE1BQVE7QUFDakMsY0FBSSxRQUFRLEtBQUssUUFBUSxLQUFLLEtBQUssU0FBUyxJQUFJLENBQUMsTUFBTSxHQUFHO0FBQ3hELGtCQUFNO0FBQUEsVUFDUjtBQUNBLGVBQUssU0FBUyxDQUFDLEtBQU0sUUFBUSxPQUFRLEtBQUssTUFBTTtBQUFBLFFBQ2xEO0FBRUEsZUFBTyxTQUFTQTtBQUFBLE1BQ2xCO0FBRUEsTUFBQUwsUUFBTyxVQUFVLFlBQVksU0FBUyxVQUFXLE9BQU8sUUFBUSxVQUFVO0FBQ3hFLGdCQUFRLENBQUM7QUFDVCxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxTQUFVLFVBQVMsTUFBTSxPQUFPLFFBQVEsR0FBRyxLQUFNLElBQUs7QUFDM0QsWUFBSSxRQUFRLEVBQUcsU0FBUSxNQUFPLFFBQVE7QUFDdEMsYUFBSyxNQUFNLElBQUssUUFBUTtBQUN4QixlQUFPLFNBQVM7QUFBQSxNQUNsQjtBQUVBLE1BQUFBLFFBQU8sVUFBVSxlQUFlLFNBQVMsYUFBYyxPQUFPLFFBQVEsVUFBVTtBQUM5RSxnQkFBUSxDQUFDO0FBQ1QsaUJBQVMsV0FBVztBQUNwQixZQUFJLENBQUMsU0FBVSxVQUFTLE1BQU0sT0FBTyxRQUFRLEdBQUcsT0FBUSxNQUFPO0FBQy9ELGFBQUssTUFBTSxJQUFLLFFBQVE7QUFDeEIsYUFBSyxTQUFTLENBQUMsSUFBSyxVQUFVO0FBQzlCLGVBQU8sU0FBUztBQUFBLE1BQ2xCO0FBRUEsTUFBQUEsUUFBTyxVQUFVLGVBQWUsU0FBUyxhQUFjLE9BQU8sUUFBUSxVQUFVO0FBQzlFLGdCQUFRLENBQUM7QUFDVCxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxTQUFVLFVBQVMsTUFBTSxPQUFPLFFBQVEsR0FBRyxPQUFRLE1BQU87QUFDL0QsYUFBSyxNQUFNLElBQUssVUFBVTtBQUMxQixhQUFLLFNBQVMsQ0FBQyxJQUFLLFFBQVE7QUFDNUIsZUFBTyxTQUFTO0FBQUEsTUFDbEI7QUFFQSxNQUFBQSxRQUFPLFVBQVUsZUFBZSxTQUFTLGFBQWMsT0FBTyxRQUFRLFVBQVU7QUFDOUUsZ0JBQVEsQ0FBQztBQUNULGlCQUFTLFdBQVc7QUFDcEIsWUFBSSxDQUFDLFNBQVUsVUFBUyxNQUFNLE9BQU8sUUFBUSxHQUFHLFlBQVksV0FBVztBQUN2RSxhQUFLLE1BQU0sSUFBSyxRQUFRO0FBQ3hCLGFBQUssU0FBUyxDQUFDLElBQUssVUFBVTtBQUM5QixhQUFLLFNBQVMsQ0FBQyxJQUFLLFVBQVU7QUFDOUIsYUFBSyxTQUFTLENBQUMsSUFBSyxVQUFVO0FBQzlCLGVBQU8sU0FBUztBQUFBLE1BQ2xCO0FBRUEsTUFBQUEsUUFBTyxVQUFVLGVBQWUsU0FBUyxhQUFjLE9BQU8sUUFBUSxVQUFVO0FBQzlFLGdCQUFRLENBQUM7QUFDVCxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxTQUFVLFVBQVMsTUFBTSxPQUFPLFFBQVEsR0FBRyxZQUFZLFdBQVc7QUFDdkUsWUFBSSxRQUFRLEVBQUcsU0FBUSxhQUFhLFFBQVE7QUFDNUMsYUFBSyxNQUFNLElBQUssVUFBVTtBQUMxQixhQUFLLFNBQVMsQ0FBQyxJQUFLLFVBQVU7QUFDOUIsYUFBSyxTQUFTLENBQUMsSUFBSyxVQUFVO0FBQzlCLGFBQUssU0FBUyxDQUFDLElBQUssUUFBUTtBQUM1QixlQUFPLFNBQVM7QUFBQSxNQUNsQjtBQUVBLE1BQUFBLFFBQU8sVUFBVSxrQkFBa0IsbUJBQW1CLFNBQVMsZ0JBQWlCLE9BQU8sU0FBUyxHQUFHO0FBQ2pHLGVBQU8sZUFBZSxNQUFNLE9BQU8sUUFBUSxDQUFDLE9BQU8sb0JBQW9CLEdBQUcsT0FBTyxvQkFBb0IsQ0FBQztBQUFBLE1BQ3hHLENBQUM7QUFFRCxNQUFBQSxRQUFPLFVBQVUsa0JBQWtCLG1CQUFtQixTQUFTLGdCQUFpQixPQUFPLFNBQVMsR0FBRztBQUNqRyxlQUFPLGVBQWUsTUFBTSxPQUFPLFFBQVEsQ0FBQyxPQUFPLG9CQUFvQixHQUFHLE9BQU8sb0JBQW9CLENBQUM7QUFBQSxNQUN4RyxDQUFDO0FBRUQsZUFBUyxhQUFjLEtBQUssT0FBTyxRQUFRLEtBQUssS0FBSyxLQUFLO0FBQ3hELFlBQUksU0FBUyxNQUFNLElBQUksT0FBUSxPQUFNLElBQUksV0FBVyxvQkFBb0I7QUFDeEUsWUFBSSxTQUFTLEVBQUcsT0FBTSxJQUFJLFdBQVcsb0JBQW9CO0FBQUEsTUFDM0Q7QUFFQSxlQUFTLFdBQVksS0FBSyxPQUFPLFFBQVEsY0FBYyxVQUFVO0FBQy9ELGdCQUFRLENBQUM7QUFDVCxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxVQUFVO0FBQ2IsdUJBQWEsS0FBSyxPQUFPLFFBQVEsR0FBRyxzQkFBd0IscUJBQXVCO0FBQUEsUUFDckY7QUFDQSxnQkFBUSxNQUFNLEtBQUssT0FBTyxRQUFRLGNBQWMsSUFBSSxDQUFDO0FBQ3JELGVBQU8sU0FBUztBQUFBLE1BQ2xCO0FBRUEsTUFBQUEsUUFBTyxVQUFVLGVBQWUsU0FBUyxhQUFjLE9BQU8sUUFBUSxVQUFVO0FBQzlFLGVBQU8sV0FBVyxNQUFNLE9BQU8sUUFBUSxNQUFNLFFBQVE7QUFBQSxNQUN2RDtBQUVBLE1BQUFBLFFBQU8sVUFBVSxlQUFlLFNBQVMsYUFBYyxPQUFPLFFBQVEsVUFBVTtBQUM5RSxlQUFPLFdBQVcsTUFBTSxPQUFPLFFBQVEsT0FBTyxRQUFRO0FBQUEsTUFDeEQ7QUFFQSxlQUFTLFlBQWEsS0FBSyxPQUFPLFFBQVEsY0FBYyxVQUFVO0FBQ2hFLGdCQUFRLENBQUM7QUFDVCxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxVQUFVO0FBQ2IsdUJBQWEsS0FBSyxPQUFPLFFBQVEsR0FBRyx1QkFBeUIsc0JBQXdCO0FBQUEsUUFDdkY7QUFDQSxnQkFBUSxNQUFNLEtBQUssT0FBTyxRQUFRLGNBQWMsSUFBSSxDQUFDO0FBQ3JELGVBQU8sU0FBUztBQUFBLE1BQ2xCO0FBRUEsTUFBQUEsUUFBTyxVQUFVLGdCQUFnQixTQUFTLGNBQWUsT0FBTyxRQUFRLFVBQVU7QUFDaEYsZUFBTyxZQUFZLE1BQU0sT0FBTyxRQUFRLE1BQU0sUUFBUTtBQUFBLE1BQ3hEO0FBRUEsTUFBQUEsUUFBTyxVQUFVLGdCQUFnQixTQUFTLGNBQWUsT0FBTyxRQUFRLFVBQVU7QUFDaEYsZUFBTyxZQUFZLE1BQU0sT0FBTyxRQUFRLE9BQU8sUUFBUTtBQUFBLE1BQ3pEO0FBR0EsTUFBQUEsUUFBTyxVQUFVLE9BQU8sU0FBUyxLQUFNLFFBQVEsYUFBYSxPQUFPLEtBQUs7QUFDdEUsWUFBSSxDQUFDQSxRQUFPLFNBQVMsTUFBTSxFQUFHLE9BQU0sSUFBSSxVQUFVLDZCQUE2QjtBQUMvRSxZQUFJLENBQUMsTUFBTyxTQUFRO0FBQ3BCLFlBQUksQ0FBQyxPQUFPLFFBQVEsRUFBRyxPQUFNLEtBQUs7QUFDbEMsWUFBSSxlQUFlLE9BQU8sT0FBUSxlQUFjLE9BQU87QUFDdkQsWUFBSSxDQUFDLFlBQWEsZUFBYztBQUNoQyxZQUFJLE1BQU0sS0FBSyxNQUFNLE1BQU8sT0FBTTtBQUdsQyxZQUFJLFFBQVEsTUFBTyxRQUFPO0FBQzFCLFlBQUksT0FBTyxXQUFXLEtBQUssS0FBSyxXQUFXLEVBQUcsUUFBTztBQUdyRCxZQUFJLGNBQWMsR0FBRztBQUNuQixnQkFBTSxJQUFJLFdBQVcsMkJBQTJCO0FBQUEsUUFDbEQ7QUFDQSxZQUFJLFFBQVEsS0FBSyxTQUFTLEtBQUssT0FBUSxPQUFNLElBQUksV0FBVyxvQkFBb0I7QUFDaEYsWUFBSSxNQUFNLEVBQUcsT0FBTSxJQUFJLFdBQVcseUJBQXlCO0FBRzNELFlBQUksTUFBTSxLQUFLLE9BQVEsT0FBTSxLQUFLO0FBQ2xDLFlBQUksT0FBTyxTQUFTLGNBQWMsTUFBTSxPQUFPO0FBQzdDLGdCQUFNLE9BQU8sU0FBUyxjQUFjO0FBQUEsUUFDdEM7QUFFQSxjQUFNLE1BQU0sTUFBTTtBQUVsQixZQUFJLFNBQVMsVUFBVSxPQUFPLFdBQVcsVUFBVSxlQUFlLFlBQVk7QUFFNUUsZUFBSyxXQUFXLGFBQWEsT0FBTyxHQUFHO0FBQUEsUUFDekMsT0FBTztBQUNMLHFCQUFXLFVBQVUsSUFBSTtBQUFBLFlBQ3ZCO0FBQUEsWUFDQSxLQUFLLFNBQVMsT0FBTyxHQUFHO0FBQUEsWUFDeEI7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBTUEsTUFBQUEsUUFBTyxVQUFVLE9BQU8sU0FBUyxLQUFNLEtBQUssT0FBTyxLQUFLLFVBQVU7QUFFaEUsWUFBSSxPQUFPLFFBQVEsVUFBVTtBQUMzQixjQUFJLE9BQU8sVUFBVSxVQUFVO0FBQzdCLHVCQUFXO0FBQ1gsb0JBQVE7QUFDUixrQkFBTSxLQUFLO0FBQUEsVUFDYixXQUFXLE9BQU8sUUFBUSxVQUFVO0FBQ2xDLHVCQUFXO0FBQ1gsa0JBQU0sS0FBSztBQUFBLFVBQ2I7QUFDQSxjQUFJLGFBQWEsVUFBYSxPQUFPLGFBQWEsVUFBVTtBQUMxRCxrQkFBTSxJQUFJLFVBQVUsMkJBQTJCO0FBQUEsVUFDakQ7QUFDQSxjQUFJLE9BQU8sYUFBYSxZQUFZLENBQUNBLFFBQU8sV0FBVyxRQUFRLEdBQUc7QUFDaEUsa0JBQU0sSUFBSSxVQUFVLHVCQUF1QixRQUFRO0FBQUEsVUFDckQ7QUFDQSxjQUFJLElBQUksV0FBVyxHQUFHO0FBQ3BCLGtCQUFNLE9BQU8sSUFBSSxXQUFXLENBQUM7QUFDN0IsZ0JBQUssYUFBYSxVQUFVLE9BQU8sT0FDL0IsYUFBYSxVQUFVO0FBRXpCLG9CQUFNO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGLFdBQVcsT0FBTyxRQUFRLFVBQVU7QUFDbEMsZ0JBQU0sTUFBTTtBQUFBLFFBQ2QsV0FBVyxPQUFPLFFBQVEsV0FBVztBQUNuQyxnQkFBTSxPQUFPLEdBQUc7QUFBQSxRQUNsQjtBQUdBLFlBQUksUUFBUSxLQUFLLEtBQUssU0FBUyxTQUFTLEtBQUssU0FBUyxLQUFLO0FBQ3pELGdCQUFNLElBQUksV0FBVyxvQkFBb0I7QUFBQSxRQUMzQztBQUVBLFlBQUksT0FBTyxPQUFPO0FBQ2hCLGlCQUFPO0FBQUEsUUFDVDtBQUVBLGdCQUFRLFVBQVU7QUFDbEIsY0FBTSxRQUFRLFNBQVksS0FBSyxTQUFTLFFBQVE7QUFFaEQsWUFBSSxDQUFDLElBQUssT0FBTTtBQUVoQixZQUFJO0FBQ0osWUFBSSxPQUFPLFFBQVEsVUFBVTtBQUMzQixlQUFLLElBQUksT0FBTyxJQUFJLEtBQUssRUFBRSxHQUFHO0FBQzVCLGlCQUFLLENBQUMsSUFBSTtBQUFBLFVBQ1o7QUFBQSxRQUNGLE9BQU87QUFDTCxnQkFBTSxRQUFRQSxRQUFPLFNBQVMsR0FBRyxJQUM3QixNQUNBQSxRQUFPLEtBQUssS0FBSyxRQUFRO0FBQzdCLGdCQUFNLE1BQU0sTUFBTTtBQUNsQixjQUFJLFFBQVEsR0FBRztBQUNiLGtCQUFNLElBQUksVUFBVSxnQkFBZ0IsTUFDbEMsbUNBQW1DO0FBQUEsVUFDdkM7QUFDQSxlQUFLLElBQUksR0FBRyxJQUFJLE1BQU0sT0FBTyxFQUFFLEdBQUc7QUFDaEMsaUJBQUssSUFBSSxLQUFLLElBQUksTUFBTSxJQUFJLEdBQUc7QUFBQSxVQUNqQztBQUFBLFFBQ0Y7QUFFQSxlQUFPO0FBQUEsTUFDVDtBQU1BLFVBQU0sU0FBUyxDQUFDO0FBQ2hCLGVBQVMsRUFBRyxLQUFLLFlBQVksTUFBTTtBQUNqQyxlQUFPLEdBQUcsSUFBSSxNQUFNLGtCQUFrQixLQUFLO0FBQUEsVUFDekMsY0FBZTtBQUNiLGtCQUFNO0FBRU4sbUJBQU8sZUFBZSxNQUFNLFdBQVc7QUFBQSxjQUNyQyxPQUFPLFdBQVcsTUFBTSxNQUFNLFNBQVM7QUFBQSxjQUN2QyxVQUFVO0FBQUEsY0FDVixjQUFjO0FBQUEsWUFDaEIsQ0FBQztBQUdELGlCQUFLLE9BQU8sR0FBRyxLQUFLLElBQUksS0FBSyxHQUFHO0FBR2hDLGlCQUFLO0FBRUwsbUJBQU8sS0FBSztBQUFBLFVBQ2Q7QUFBQSxVQUVBLElBQUksT0FBUTtBQUNWLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFVBRUEsSUFBSSxLQUFNLE9BQU87QUFDZixtQkFBTyxlQUFlLE1BQU0sUUFBUTtBQUFBLGNBQ2xDLGNBQWM7QUFBQSxjQUNkLFlBQVk7QUFBQSxjQUNaO0FBQUEsY0FDQSxVQUFVO0FBQUEsWUFDWixDQUFDO0FBQUEsVUFDSDtBQUFBLFVBRUEsV0FBWTtBQUNWLG1CQUFPLEdBQUcsS0FBSyxJQUFJLEtBQUssR0FBRyxNQUFNLEtBQUssT0FBTztBQUFBLFVBQy9DO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFFQTtBQUFBLFFBQUU7QUFBQSxRQUNBLFNBQVUsTUFBTTtBQUNkLGNBQUksTUFBTTtBQUNSLG1CQUFPLEdBQUcsSUFBSTtBQUFBLFVBQ2hCO0FBRUEsaUJBQU87QUFBQSxRQUNUO0FBQUEsUUFBRztBQUFBLE1BQVU7QUFDZjtBQUFBLFFBQUU7QUFBQSxRQUNBLFNBQVUsTUFBTSxRQUFRO0FBQ3RCLGlCQUFPLFFBQVEsSUFBSSxvREFBb0QsT0FBTyxNQUFNO0FBQUEsUUFDdEY7QUFBQSxRQUFHO0FBQUEsTUFBUztBQUNkO0FBQUEsUUFBRTtBQUFBLFFBQ0EsU0FBVSxLQUFLLE9BQU8sT0FBTztBQUMzQixjQUFJLE1BQU0saUJBQWlCLEdBQUc7QUFDOUIsY0FBSSxXQUFXO0FBQ2YsY0FBSSxPQUFPLFVBQVUsS0FBSyxLQUFLLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJO0FBQ3hELHVCQUFXLHNCQUFzQixPQUFPLEtBQUssQ0FBQztBQUFBLFVBQ2hELFdBQVcsT0FBTyxVQUFVLFVBQVU7QUFDcEMsdUJBQVcsT0FBTyxLQUFLO0FBQ3ZCLGdCQUFJLFFBQVEsT0FBTyxDQUFDLEtBQUssT0FBTyxFQUFFLEtBQUssUUFBUSxFQUFFLE9BQU8sQ0FBQyxLQUFLLE9BQU8sRUFBRSxJQUFJO0FBQ3pFLHlCQUFXLHNCQUFzQixRQUFRO0FBQUEsWUFDM0M7QUFDQSx3QkFBWTtBQUFBLFVBQ2Q7QUFDQSxpQkFBTyxlQUFlLEtBQUssY0FBYyxRQUFRO0FBQ2pELGlCQUFPO0FBQUEsUUFDVDtBQUFBLFFBQUc7QUFBQSxNQUFVO0FBRWYsZUFBUyxzQkFBdUIsS0FBSztBQUNuQyxZQUFJLE1BQU07QUFDVixZQUFJLElBQUksSUFBSTtBQUNaLGNBQU0sUUFBUSxJQUFJLENBQUMsTUFBTSxNQUFNLElBQUk7QUFDbkMsZUFBTyxLQUFLLFFBQVEsR0FBRyxLQUFLLEdBQUc7QUFDN0IsZ0JBQU0sSUFBSSxJQUFJLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUc7QUFBQSxRQUNyQztBQUNBLGVBQU8sR0FBRyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHO0FBQUEsTUFDakM7QUFLQSxlQUFTLFlBQWEsS0FBSyxRQUFRSyxhQUFZO0FBQzdDLHVCQUFlLFFBQVEsUUFBUTtBQUMvQixZQUFJLElBQUksTUFBTSxNQUFNLFVBQWEsSUFBSSxTQUFTQSxXQUFVLE1BQU0sUUFBVztBQUN2RSxzQkFBWSxRQUFRLElBQUksVUFBVUEsY0FBYSxFQUFFO0FBQUEsUUFDbkQ7QUFBQSxNQUNGO0FBRUEsZUFBUyxXQUFZLE9BQU8sS0FBSyxLQUFLLEtBQUssUUFBUUEsYUFBWTtBQUM3RCxZQUFJLFFBQVEsT0FBTyxRQUFRLEtBQUs7QUFDOUIsZ0JBQU0sSUFBSSxPQUFPLFFBQVEsV0FBVyxNQUFNO0FBQzFDLGNBQUk7QUFDSixjQUFJQSxjQUFhLEdBQUc7QUFDbEIsZ0JBQUksUUFBUSxLQUFLLFFBQVEsT0FBTyxDQUFDLEdBQUc7QUFDbEMsc0JBQVEsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRQSxjQUFhLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFBQSxZQUM3RCxPQUFPO0FBQ0wsc0JBQVEsU0FBUyxDQUFDLFFBQVFBLGNBQWEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUN6Q0EsY0FBYSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUM7QUFBQSxZQUN6QztBQUFBLFVBQ0YsT0FBTztBQUNMLG9CQUFRLE1BQU0sR0FBRyxHQUFHLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztBQUFBLFVBQ3pDO0FBQ0EsZ0JBQU0sSUFBSSxPQUFPLGlCQUFpQixTQUFTLE9BQU8sS0FBSztBQUFBLFFBQ3pEO0FBQ0Esb0JBQVksS0FBSyxRQUFRQSxXQUFVO0FBQUEsTUFDckM7QUFFQSxlQUFTLGVBQWdCLE9BQU8sTUFBTTtBQUNwQyxZQUFJLE9BQU8sVUFBVSxVQUFVO0FBQzdCLGdCQUFNLElBQUksT0FBTyxxQkFBcUIsTUFBTSxVQUFVLEtBQUs7QUFBQSxRQUM3RDtBQUFBLE1BQ0Y7QUFFQSxlQUFTLFlBQWEsT0FBTyxRQUFRLE1BQU07QUFDekMsWUFBSSxLQUFLLE1BQU0sS0FBSyxNQUFNLE9BQU87QUFDL0IseUJBQWUsT0FBTyxJQUFJO0FBQzFCLGdCQUFNLElBQUksT0FBTyxpQkFBaUIsUUFBUSxVQUFVLGNBQWMsS0FBSztBQUFBLFFBQ3pFO0FBRUEsWUFBSSxTQUFTLEdBQUc7QUFDZCxnQkFBTSxJQUFJLE9BQU8seUJBQXlCO0FBQUEsUUFDNUM7QUFFQSxjQUFNLElBQUksT0FBTztBQUFBLFVBQWlCLFFBQVE7QUFBQSxVQUNSLE1BQU0sT0FBTyxJQUFJLENBQUMsV0FBVyxNQUFNO0FBQUEsVUFDbkM7QUFBQSxRQUFLO0FBQUEsTUFDekM7QUFLQSxVQUFNLG9CQUFvQjtBQUUxQixlQUFTLFlBQWEsS0FBSztBQUV6QixjQUFNLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUV0QixjQUFNLElBQUksS0FBSyxFQUFFLFFBQVEsbUJBQW1CLEVBQUU7QUFFOUMsWUFBSSxJQUFJLFNBQVMsRUFBRyxRQUFPO0FBRTNCLGVBQU8sSUFBSSxTQUFTLE1BQU0sR0FBRztBQUMzQixnQkFBTSxNQUFNO0FBQUEsUUFDZDtBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBU0osYUFBYSxRQUFRLE9BQU87QUFDbkMsZ0JBQVEsU0FBUztBQUNqQixZQUFJO0FBQ0osY0FBTSxTQUFTLE9BQU87QUFDdEIsWUFBSSxnQkFBZ0I7QUFDcEIsY0FBTSxRQUFRLENBQUM7QUFFZixpQkFBUyxJQUFJLEdBQUcsSUFBSSxRQUFRLEVBQUUsR0FBRztBQUMvQixzQkFBWSxPQUFPLFdBQVcsQ0FBQztBQUcvQixjQUFJLFlBQVksU0FBVSxZQUFZLE9BQVE7QUFFNUMsZ0JBQUksQ0FBQyxlQUFlO0FBRWxCLGtCQUFJLFlBQVksT0FBUTtBQUV0QixxQkFBSyxTQUFTLEtBQUssR0FBSSxPQUFNLEtBQUssS0FBTSxLQUFNLEdBQUk7QUFDbEQ7QUFBQSxjQUNGLFdBQVcsSUFBSSxNQUFNLFFBQVE7QUFFM0IscUJBQUssU0FBUyxLQUFLLEdBQUksT0FBTSxLQUFLLEtBQU0sS0FBTSxHQUFJO0FBQ2xEO0FBQUEsY0FDRjtBQUdBLDhCQUFnQjtBQUVoQjtBQUFBLFlBQ0Y7QUFHQSxnQkFBSSxZQUFZLE9BQVE7QUFDdEIsbUJBQUssU0FBUyxLQUFLLEdBQUksT0FBTSxLQUFLLEtBQU0sS0FBTSxHQUFJO0FBQ2xELDhCQUFnQjtBQUNoQjtBQUFBLFlBQ0Y7QUFHQSx5QkFBYSxnQkFBZ0IsU0FBVSxLQUFLLFlBQVksU0FBVTtBQUFBLFVBQ3BFLFdBQVcsZUFBZTtBQUV4QixpQkFBSyxTQUFTLEtBQUssR0FBSSxPQUFNLEtBQUssS0FBTSxLQUFNLEdBQUk7QUFBQSxVQUNwRDtBQUVBLDBCQUFnQjtBQUdoQixjQUFJLFlBQVksS0FBTTtBQUNwQixpQkFBSyxTQUFTLEtBQUssRUFBRztBQUN0QixrQkFBTSxLQUFLLFNBQVM7QUFBQSxVQUN0QixXQUFXLFlBQVksTUFBTztBQUM1QixpQkFBSyxTQUFTLEtBQUssRUFBRztBQUN0QixrQkFBTTtBQUFBLGNBQ0osYUFBYSxJQUFNO0FBQUEsY0FDbkIsWUFBWSxLQUFPO0FBQUEsWUFDckI7QUFBQSxVQUNGLFdBQVcsWUFBWSxPQUFTO0FBQzlCLGlCQUFLLFNBQVMsS0FBSyxFQUFHO0FBQ3RCLGtCQUFNO0FBQUEsY0FDSixhQUFhLEtBQU07QUFBQSxjQUNuQixhQUFhLElBQU0sS0FBTztBQUFBLGNBQzFCLFlBQVksS0FBTztBQUFBLFlBQ3JCO0FBQUEsVUFDRixXQUFXLFlBQVksU0FBVTtBQUMvQixpQkFBSyxTQUFTLEtBQUssRUFBRztBQUN0QixrQkFBTTtBQUFBLGNBQ0osYUFBYSxLQUFPO0FBQUEsY0FDcEIsYUFBYSxLQUFNLEtBQU87QUFBQSxjQUMxQixhQUFhLElBQU0sS0FBTztBQUFBLGNBQzFCLFlBQVksS0FBTztBQUFBLFlBQ3JCO0FBQUEsVUFDRixPQUFPO0FBQ0wsa0JBQU0sSUFBSSxNQUFNLG9CQUFvQjtBQUFBLFVBQ3RDO0FBQUEsUUFDRjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBU0csY0FBYyxLQUFLO0FBQzFCLGNBQU0sWUFBWSxDQUFDO0FBQ25CLGlCQUFTLElBQUksR0FBRyxJQUFJLElBQUksUUFBUSxFQUFFLEdBQUc7QUFFbkMsb0JBQVUsS0FBSyxJQUFJLFdBQVcsQ0FBQyxJQUFJLEdBQUk7QUFBQSxRQUN6QztBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxlQUFnQixLQUFLLE9BQU87QUFDbkMsWUFBSSxHQUFHLElBQUk7QUFDWCxjQUFNLFlBQVksQ0FBQztBQUNuQixpQkFBUyxJQUFJLEdBQUcsSUFBSSxJQUFJLFFBQVEsRUFBRSxHQUFHO0FBQ25DLGVBQUssU0FBUyxLQUFLLEVBQUc7QUFFdEIsY0FBSSxJQUFJLFdBQVcsQ0FBQztBQUNwQixlQUFLLEtBQUs7QUFDVixlQUFLLElBQUk7QUFDVCxvQkFBVSxLQUFLLEVBQUU7QUFDakIsb0JBQVUsS0FBSyxFQUFFO0FBQUEsUUFDbkI7QUFFQSxlQUFPO0FBQUEsTUFDVDtBQUVBLGVBQVNGLGVBQWUsS0FBSztBQUMzQixlQUFPLE9BQU8sWUFBWSxZQUFZLEdBQUcsQ0FBQztBQUFBLE1BQzVDO0FBRUEsZUFBUyxXQUFZLEtBQUssS0FBSyxRQUFRLFFBQVE7QUFDN0MsWUFBSTtBQUNKLGFBQUssSUFBSSxHQUFHLElBQUksUUFBUSxFQUFFLEdBQUc7QUFDM0IsY0FBSyxJQUFJLFVBQVUsSUFBSSxVQUFZLEtBQUssSUFBSSxPQUFTO0FBQ3JELGNBQUksSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDO0FBQUEsUUFDekI7QUFDQSxlQUFPO0FBQUEsTUFDVDtBQUtBLGVBQVMsV0FBWSxLQUFLLE1BQU07QUFDOUIsZUFBTyxlQUFlLFFBQ25CLE9BQU8sUUFBUSxJQUFJLGVBQWUsUUFBUSxJQUFJLFlBQVksUUFBUSxRQUNqRSxJQUFJLFlBQVksU0FBUyxLQUFLO0FBQUEsTUFDcEM7QUFDQSxlQUFTLFlBQWEsS0FBSztBQUV6QixlQUFPLFFBQVE7QUFBQSxNQUNqQjtBQUlBLFVBQU0sdUJBQXVCLFdBQVk7QUFDdkMsY0FBTSxXQUFXO0FBQ2pCLGNBQU0sUUFBUSxJQUFJLE1BQU0sR0FBRztBQUMzQixpQkFBUyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsR0FBRztBQUMzQixnQkFBTSxNQUFNLElBQUk7QUFDaEIsbUJBQVMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLEdBQUc7QUFDM0Isa0JBQU0sTUFBTSxDQUFDLElBQUksU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDO0FBQUEsVUFDM0M7QUFBQSxRQUNGO0FBQ0EsZUFBTztBQUFBLE1BQ1QsR0FBRztBQUdILGVBQVMsbUJBQW9CLElBQUk7QUFDL0IsZUFBTyxPQUFPLFdBQVcsY0FBYyx5QkFBeUI7QUFBQSxNQUNsRTtBQUVBLGVBQVMseUJBQTBCO0FBQ2pDLGNBQU0sSUFBSSxNQUFNLHNCQUFzQjtBQUFBLE1BQ3hDO0FBQUE7QUFBQTs7O0FDempFQTs7O0FDQUE7OztBQ0FBO0FBZ0JBLE1BQU0sV0FDRixPQUFPLFlBQVksY0FBYyxVQUNqQyxPQUFPLFdBQVksY0FBYyxTQUNqQztBQUVKLE1BQUksQ0FBQyxVQUFVO0FBQ1gsVUFBTSxJQUFJLE1BQU0sa0ZBQWtGO0FBQUEsRUFDdEc7QUFNQSxNQUFNLFdBQVcsT0FBTyxZQUFZLGVBQWUsT0FBTyxXQUFXO0FBTXJFLFdBQVMsVUFBVSxTQUFTLFFBQVE7QUFDaEMsV0FBTyxJQUFJLFNBQVM7QUFJaEIsVUFBSTtBQUNBLGNBQU0sU0FBUyxPQUFPLE1BQU0sU0FBUyxJQUFJO0FBQ3pDLFlBQUksVUFBVSxPQUFPLE9BQU8sU0FBUyxZQUFZO0FBQzdDLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0osU0FBUyxHQUFHO0FBQUEsTUFFWjtBQUVBLGFBQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQ3BDLGVBQU8sTUFBTSxTQUFTO0FBQUEsVUFDbEIsR0FBRztBQUFBLFVBQ0gsSUFBSSxXQUFXO0FBQ1gsZ0JBQUksU0FBUyxXQUFXLFNBQVMsUUFBUSxXQUFXO0FBQ2hELHFCQUFPLElBQUksTUFBTSxTQUFTLFFBQVEsVUFBVSxPQUFPLENBQUM7QUFBQSxZQUN4RCxPQUFPO0FBQ0gsc0JBQVEsT0FBTyxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksTUFBTTtBQUFBLFlBQ25EO0FBQUEsVUFDSjtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0wsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBTUEsTUFBTSxNQUFNLENBQUM7QUFHYixNQUFJLFVBQVU7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUlWLGVBQWUsTUFBTTtBQUNqQixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxRQUFRLFlBQVksR0FBRyxJQUFJO0FBQUEsTUFDL0M7QUFDQSxhQUFPLFVBQVUsU0FBUyxTQUFTLFNBQVMsUUFBUSxXQUFXLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDNUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVFBLFdBQVcsU0FBUyxRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLNUIsT0FBTyxNQUFNO0FBQ1QsYUFBTyxTQUFTLFFBQVEsT0FBTyxJQUFJO0FBQUEsSUFDdkM7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtBLGtCQUFrQjtBQUNkLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLFFBQVEsZ0JBQWdCO0FBQUEsTUFDNUM7QUFDQSxhQUFPLFVBQVUsU0FBUyxTQUFTLFNBQVMsUUFBUSxlQUFlLEVBQUU7QUFBQSxJQUN6RTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBS0EsSUFBSSxLQUFLO0FBQ0wsYUFBTyxTQUFTLFFBQVE7QUFBQSxJQUM1QjtBQUFBLEVBQ0o7QUFHQSxNQUFJLFVBQVU7QUFBQSxJQUNWLE9BQU87QUFBQSxNQUNILE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM3QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDaEY7QUFBQSxNQUNBLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM3QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDaEY7QUFBQSxNQUNBLFNBQVMsTUFBTTtBQUNYLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sTUFBTSxHQUFHLElBQUk7QUFBQSxRQUMvQztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDbEY7QUFBQSxNQUNBLFVBQVUsTUFBTTtBQUNaLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sT0FBTyxHQUFHLElBQUk7QUFBQSxRQUNoRDtBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDbkY7QUFBQSxJQUNKO0FBQUE7QUFBQTtBQUFBLElBSUEsTUFBTSxTQUFTLFNBQVMsT0FBTztBQUFBLE1BQzNCLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM1QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDOUU7QUFBQSxNQUNBLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM1QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDOUU7QUFBQSxNQUNBLFVBQVUsTUFBTTtBQUNaLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssT0FBTyxHQUFHLElBQUk7QUFBQSxRQUMvQztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDakY7QUFBQSxNQUNBLFNBQVMsTUFBTTtBQUNYLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssTUFBTSxHQUFHLElBQUk7QUFBQSxRQUM5QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDaEY7QUFBQSxNQUNBLGlCQUFpQixNQUFNO0FBQ25CLFlBQUksQ0FBQyxTQUFTLFFBQVEsS0FBSyxlQUFlO0FBRXRDLGlCQUFPLFFBQVEsUUFBUSxDQUFDO0FBQUEsUUFDNUI7QUFDQSxZQUFJLENBQUMsVUFBVTtBQUNYLGlCQUFPLFNBQVMsUUFBUSxLQUFLLGNBQWMsR0FBRyxJQUFJO0FBQUEsUUFDdEQ7QUFDQSxlQUFPLFVBQVUsU0FBUyxRQUFRLE1BQU0sU0FBUyxRQUFRLEtBQUssYUFBYSxFQUFFLEdBQUcsSUFBSTtBQUFBLE1BQ3hGO0FBQUEsSUFDSixJQUFJO0FBQUE7QUFBQSxJQUdKLFdBQVcsU0FBUyxTQUFTLGFBQWE7QUFBQSxFQUM5QztBQUdBLE1BQUksT0FBTztBQUFBLElBQ1AsVUFBVSxNQUFNO0FBQ1osVUFBSSxDQUFDLFVBQVU7QUFDWCxlQUFPLFNBQVMsS0FBSyxPQUFPLEdBQUcsSUFBSTtBQUFBLE1BQ3ZDO0FBQ0EsYUFBTyxVQUFVLFNBQVMsTUFBTSxTQUFTLEtBQUssTUFBTSxFQUFFLEdBQUcsSUFBSTtBQUFBLElBQ2pFO0FBQUEsSUFDQSxTQUFTLE1BQU07QUFDWCxVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxLQUFLLE1BQU0sR0FBRyxJQUFJO0FBQUEsTUFDdEM7QUFDQSxhQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDaEU7QUFBQSxJQUNBLFVBQVUsTUFBTTtBQUNaLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLEtBQUssT0FBTyxHQUFHLElBQUk7QUFBQSxNQUN2QztBQUNBLGFBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLE1BQU0sRUFBRSxHQUFHLElBQUk7QUFBQSxJQUNqRTtBQUFBLElBQ0EsVUFBVSxNQUFNO0FBQ1osVUFBSSxDQUFDLFVBQVU7QUFDWCxlQUFPLFNBQVMsS0FBSyxPQUFPLEdBQUcsSUFBSTtBQUFBLE1BQ3ZDO0FBQ0EsYUFBTyxVQUFVLFNBQVMsTUFBTSxTQUFTLEtBQUssTUFBTSxFQUFFLEdBQUcsSUFBSTtBQUFBLElBQ2pFO0FBQUEsSUFDQSxPQUFPLE1BQU07QUFDVCxVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxLQUFLLElBQUksR0FBRyxJQUFJO0FBQUEsTUFDcEM7QUFDQSxhQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDOUQ7QUFBQSxJQUNBLGNBQWMsTUFBTTtBQUNoQixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxLQUFLLFdBQVcsR0FBRyxJQUFJO0FBQUEsTUFDM0M7QUFDQSxhQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxVQUFVLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDckU7QUFBQSxJQUNBLGVBQWUsTUFBTTtBQUNqQixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxLQUFLLFlBQVksR0FBRyxJQUFJO0FBQUEsTUFDNUM7QUFDQSxhQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxXQUFXLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDdEU7QUFBQSxFQUNKO0FBSUEsTUFBSSxTQUFTLFNBQVMsU0FBUztBQUFBLElBQzNCLFVBQVUsTUFBTTtBQUVaLFlBQU0sU0FBUyxTQUFTLE9BQU8sT0FBTyxHQUFHLElBQUk7QUFDN0MsYUFBTyxVQUFVLE9BQU8sT0FBTyxTQUFTLGFBQWEsU0FBUyxRQUFRLFFBQVE7QUFBQSxJQUNsRjtBQUFBLElBQ0EsU0FBUyxNQUFNO0FBQ1gsVUFBSSxDQUFDLFVBQVU7QUFDWCxlQUFPLFNBQVMsT0FBTyxNQUFNLEdBQUcsSUFBSTtBQUFBLE1BQ3hDO0FBQ0EsYUFBTyxVQUFVLFNBQVMsUUFBUSxTQUFTLE9BQU8sS0FBSyxFQUFFLEdBQUcsSUFBSTtBQUFBLElBQ3BFO0FBQUEsSUFDQSxTQUFTLFNBQVMsT0FBTztBQUFBLEVBQzdCLElBQUk7OztBQ3hQSjs7O0FDQUE7OztBQ0FBO0FBTU0sV0FBVSxRQUFRLEdBQVU7QUFDaEMsV0FBTyxhQUFhLGNBQWUsWUFBWSxPQUFPLENBQUMsS0FBSyxFQUFFLFlBQVksU0FBUztFQUNyRjtBQUdNLFdBQVUsUUFBUSxHQUFXLFFBQWdCLElBQUU7QUFDbkQsUUFBSSxDQUFDLE9BQU8sY0FBYyxDQUFDLEtBQUssSUFBSSxHQUFHO0FBQ3JDLFlBQU0sU0FBUyxTQUFTLElBQUksS0FBSztBQUNqQyxZQUFNLElBQUksTUFBTSxHQUFHLE1BQU0sOEJBQThCLENBQUMsRUFBRTtJQUM1RDtFQUNGO0FBR00sV0FBVSxPQUFPLE9BQW1CLFFBQWlCLFFBQWdCLElBQUU7QUFDM0UsVUFBTSxRQUFRLFFBQVEsS0FBSztBQUMzQixVQUFNLE1BQU0sT0FBTztBQUNuQixVQUFNLFdBQVcsV0FBVztBQUM1QixRQUFJLENBQUMsU0FBVSxZQUFZLFFBQVEsUUFBUztBQUMxQyxZQUFNLFNBQVMsU0FBUyxJQUFJLEtBQUs7QUFDakMsWUFBTSxRQUFRLFdBQVcsY0FBYyxNQUFNLEtBQUs7QUFDbEQsWUFBTSxNQUFNLFFBQVEsVUFBVSxHQUFHLEtBQUssUUFBUSxPQUFPLEtBQUs7QUFDMUQsWUFBTSxJQUFJLE1BQU0sU0FBUyx3QkFBd0IsUUFBUSxXQUFXLEdBQUc7SUFDekU7QUFDQSxXQUFPO0VBQ1Q7QUFXTSxXQUFVLFFBQVEsVUFBZSxnQkFBZ0IsTUFBSTtBQUN6RCxRQUFJLFNBQVM7QUFBVyxZQUFNLElBQUksTUFBTSxrQ0FBa0M7QUFDMUUsUUFBSSxpQkFBaUIsU0FBUztBQUFVLFlBQU0sSUFBSSxNQUFNLHVDQUF1QztFQUNqRztBQUdNLFdBQVUsUUFBUSxLQUFVLFVBQWE7QUFDN0MsV0FBTyxLQUFLLFFBQVcscUJBQXFCO0FBQzVDLFVBQU0sTUFBTSxTQUFTO0FBQ3JCLFFBQUksSUFBSSxTQUFTLEtBQUs7QUFDcEIsWUFBTSxJQUFJLE1BQU0sc0RBQXNELEdBQUc7SUFDM0U7RUFDRjtBQWtCTSxXQUFVLFNBQVMsUUFBb0I7QUFDM0MsYUFBUyxJQUFJLEdBQUcsSUFBSSxPQUFPLFFBQVEsS0FBSztBQUN0QyxhQUFPLENBQUMsRUFBRSxLQUFLLENBQUM7SUFDbEI7RUFDRjtBQUdNLFdBQVUsV0FBVyxLQUFlO0FBQ3hDLFdBQU8sSUFBSSxTQUFTLElBQUksUUFBUSxJQUFJLFlBQVksSUFBSSxVQUFVO0VBQ2hFO0FBR00sV0FBVSxLQUFLLE1BQWMsT0FBYTtBQUM5QyxXQUFRLFFBQVMsS0FBSyxRQUFXLFNBQVM7RUFDNUM7QUFzQ0EsTUFBTSxnQkFBMEM7O0lBRTlDLE9BQU8sV0FBVyxLQUFLLENBQUEsQ0FBRSxFQUFFLFVBQVUsY0FBYyxPQUFPLFdBQVcsWUFBWTtLQUFXO0FBRzlGLE1BQU0sUUFBd0Isc0JBQU0sS0FBSyxFQUFFLFFBQVEsSUFBRyxHQUFJLENBQUMsR0FBRyxNQUM1RCxFQUFFLFNBQVMsRUFBRSxFQUFFLFNBQVMsR0FBRyxHQUFHLENBQUM7QUFPM0IsV0FBVSxXQUFXLE9BQWlCO0FBQzFDLFdBQU8sS0FBSztBQUVaLFFBQUk7QUFBZSxhQUFPLE1BQU0sTUFBSztBQUVyQyxRQUFJLE1BQU07QUFDVixhQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sUUFBUSxLQUFLO0FBQ3JDLGFBQU8sTUFBTSxNQUFNLENBQUMsQ0FBQztJQUN2QjtBQUNBLFdBQU87RUFDVDtBQUdBLE1BQU0sU0FBUyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFHO0FBQzVELFdBQVMsY0FBYyxJQUFVO0FBQy9CLFFBQUksTUFBTSxPQUFPLE1BQU0sTUFBTSxPQUFPO0FBQUksYUFBTyxLQUFLLE9BQU87QUFDM0QsUUFBSSxNQUFNLE9BQU8sS0FBSyxNQUFNLE9BQU87QUFBRyxhQUFPLE1BQU0sT0FBTyxJQUFJO0FBQzlELFFBQUksTUFBTSxPQUFPLEtBQUssTUFBTSxPQUFPO0FBQUcsYUFBTyxNQUFNLE9BQU8sSUFBSTtBQUM5RDtFQUNGO0FBTU0sV0FBVSxXQUFXLEtBQVc7QUFDcEMsUUFBSSxPQUFPLFFBQVE7QUFBVSxZQUFNLElBQUksTUFBTSw4QkFBOEIsT0FBTyxHQUFHO0FBRXJGLFFBQUk7QUFBZSxhQUFPLFdBQVcsUUFBUSxHQUFHO0FBQ2hELFVBQU0sS0FBSyxJQUFJO0FBQ2YsVUFBTSxLQUFLLEtBQUs7QUFDaEIsUUFBSSxLQUFLO0FBQUcsWUFBTSxJQUFJLE1BQU0scURBQXFELEVBQUU7QUFDbkYsVUFBTSxRQUFRLElBQUksV0FBVyxFQUFFO0FBQy9CLGFBQVMsS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksTUFBTSxNQUFNLEdBQUc7QUFDL0MsWUFBTSxLQUFLLGNBQWMsSUFBSSxXQUFXLEVBQUUsQ0FBQztBQUMzQyxZQUFNLEtBQUssY0FBYyxJQUFJLFdBQVcsS0FBSyxDQUFDLENBQUM7QUFDL0MsVUFBSSxPQUFPLFVBQWEsT0FBTyxRQUFXO0FBQ3hDLGNBQU0sT0FBTyxJQUFJLEVBQUUsSUFBSSxJQUFJLEtBQUssQ0FBQztBQUNqQyxjQUFNLElBQUksTUFBTSxpREFBaUQsT0FBTyxnQkFBZ0IsRUFBRTtNQUM1RjtBQUNBLFlBQU0sRUFBRSxJQUFJLEtBQUssS0FBSztJQUN4QjtBQUNBLFdBQU87RUFDVDtBQW9ETSxXQUFVLGVBQWUsUUFBb0I7QUFDakQsUUFBSSxNQUFNO0FBQ1YsYUFBUyxJQUFJLEdBQUcsSUFBSSxPQUFPLFFBQVEsS0FBSztBQUN0QyxZQUFNLElBQUksT0FBTyxDQUFDO0FBQ2xCLGFBQU8sQ0FBQztBQUNSLGFBQU8sRUFBRTtJQUNYO0FBQ0EsVUFBTSxNQUFNLElBQUksV0FBVyxHQUFHO0FBQzlCLGFBQVMsSUFBSSxHQUFHLE1BQU0sR0FBRyxJQUFJLE9BQU8sUUFBUSxLQUFLO0FBQy9DLFlBQU0sSUFBSSxPQUFPLENBQUM7QUFDbEIsVUFBSSxJQUFJLEdBQUcsR0FBRztBQUNkLGFBQU8sRUFBRTtJQUNYO0FBQ0EsV0FBTztFQUNUO0FBb0VNLFdBQVUsYUFDZCxVQUNBLE9BQWlCLENBQUEsR0FBRTtBQUVuQixVQUFNLFFBQWEsQ0FBQyxLQUFpQixTQUFnQixTQUFTLElBQUksRUFBRSxPQUFPLEdBQUcsRUFBRSxPQUFNO0FBQ3RGLFVBQU0sTUFBTSxTQUFTLE1BQVM7QUFDOUIsVUFBTSxZQUFZLElBQUk7QUFDdEIsVUFBTSxXQUFXLElBQUk7QUFDckIsVUFBTSxTQUFTLENBQUMsU0FBZ0IsU0FBUyxJQUFJO0FBQzdDLFdBQU8sT0FBTyxPQUFPLElBQUk7QUFDekIsV0FBTyxPQUFPLE9BQU8sS0FBSztFQUM1QjtBQUdNLFdBQVUsWUFBWSxjQUFjLElBQUU7QUFDMUMsVUFBTSxLQUFLLE9BQU8sZUFBZSxXQUFZLFdBQW1CLFNBQVM7QUFDekUsUUFBSSxPQUFPLElBQUksb0JBQW9CO0FBQ2pDLFlBQU0sSUFBSSxNQUFNLHdDQUF3QztBQUMxRCxXQUFPLEdBQUcsZ0JBQWdCLElBQUksV0FBVyxXQUFXLENBQUM7RUFDdkQ7QUFHTyxNQUFNLFVBQVUsQ0FBQyxZQUF3QztJQUM5RCxLQUFLLFdBQVcsS0FBSyxDQUFDLEdBQU0sR0FBTSxJQUFNLEtBQU0sSUFBTSxHQUFNLEtBQU0sR0FBTSxHQUFNLEdBQU0sTUFBTSxDQUFDOzs7O0FDaFYzRjs7O0FDQUE7QUFPTSxXQUFVLElBQUksR0FBVyxHQUFXLEdBQVM7QUFDakQsV0FBUSxJQUFJLElBQU0sQ0FBQyxJQUFJO0VBQ3pCO0FBR00sV0FBVSxJQUFJLEdBQVcsR0FBVyxHQUFTO0FBQ2pELFdBQVEsSUFBSSxJQUFNLElBQUksSUFBTSxJQUFJO0VBQ2xDO0FBTU0sTUFBZ0IsU0FBaEIsTUFBc0I7SUFPakI7SUFDQTtJQUNBO0lBQ0E7O0lBR0M7SUFDQTtJQUNBLFdBQVc7SUFDWCxTQUFTO0lBQ1QsTUFBTTtJQUNOLFlBQVk7SUFFdEIsWUFBWSxVQUFrQixXQUFtQixXQUFtQixNQUFhO0FBQy9FLFdBQUssV0FBVztBQUNoQixXQUFLLFlBQVk7QUFDakIsV0FBSyxZQUFZO0FBQ2pCLFdBQUssT0FBTztBQUNaLFdBQUssU0FBUyxJQUFJLFdBQVcsUUFBUTtBQUNyQyxXQUFLLE9BQU8sV0FBVyxLQUFLLE1BQU07SUFDcEM7SUFDQSxPQUFPLE1BQWdCO0FBQ3JCLGNBQVEsSUFBSTtBQUNaLGFBQU8sSUFBSTtBQUNYLFlBQU0sRUFBRSxNQUFNLFFBQVEsU0FBUSxJQUFLO0FBQ25DLFlBQU0sTUFBTSxLQUFLO0FBQ2pCLGVBQVMsTUFBTSxHQUFHLE1BQU0sT0FBTztBQUM3QixjQUFNLE9BQU8sS0FBSyxJQUFJLFdBQVcsS0FBSyxLQUFLLE1BQU0sR0FBRztBQUVwRCxZQUFJLFNBQVMsVUFBVTtBQUNyQixnQkFBTSxXQUFXLFdBQVcsSUFBSTtBQUNoQyxpQkFBTyxZQUFZLE1BQU0sS0FBSyxPQUFPO0FBQVUsaUJBQUssUUFBUSxVQUFVLEdBQUc7QUFDekU7UUFDRjtBQUNBLGVBQU8sSUFBSSxLQUFLLFNBQVMsS0FBSyxNQUFNLElBQUksR0FBRyxLQUFLLEdBQUc7QUFDbkQsYUFBSyxPQUFPO0FBQ1osZUFBTztBQUNQLFlBQUksS0FBSyxRQUFRLFVBQVU7QUFDekIsZUFBSyxRQUFRLE1BQU0sQ0FBQztBQUNwQixlQUFLLE1BQU07UUFDYjtNQUNGO0FBQ0EsV0FBSyxVQUFVLEtBQUs7QUFDcEIsV0FBSyxXQUFVO0FBQ2YsYUFBTztJQUNUO0lBQ0EsV0FBVyxLQUFlO0FBQ3hCLGNBQVEsSUFBSTtBQUNaLGNBQVEsS0FBSyxJQUFJO0FBQ2pCLFdBQUssV0FBVztBQUloQixZQUFNLEVBQUUsUUFBUSxNQUFNLFVBQVUsS0FBSSxJQUFLO0FBQ3pDLFVBQUksRUFBRSxJQUFHLElBQUs7QUFFZCxhQUFPLEtBQUssSUFBSTtBQUNoQixZQUFNLEtBQUssT0FBTyxTQUFTLEdBQUcsQ0FBQztBQUcvQixVQUFJLEtBQUssWUFBWSxXQUFXLEtBQUs7QUFDbkMsYUFBSyxRQUFRLE1BQU0sQ0FBQztBQUNwQixjQUFNO01BQ1I7QUFFQSxlQUFTLElBQUksS0FBSyxJQUFJLFVBQVU7QUFBSyxlQUFPLENBQUMsSUFBSTtBQUlqRCxXQUFLLGFBQWEsV0FBVyxHQUFHLE9BQU8sS0FBSyxTQUFTLENBQUMsR0FBRyxJQUFJO0FBQzdELFdBQUssUUFBUSxNQUFNLENBQUM7QUFDcEIsWUFBTSxRQUFRLFdBQVcsR0FBRztBQUM1QixZQUFNLE1BQU0sS0FBSztBQUVqQixVQUFJLE1BQU07QUFBRyxjQUFNLElBQUksTUFBTSwyQ0FBMkM7QUFDeEUsWUFBTSxTQUFTLE1BQU07QUFDckIsWUFBTUksU0FBUSxLQUFLLElBQUc7QUFDdEIsVUFBSSxTQUFTQSxPQUFNO0FBQVEsY0FBTSxJQUFJLE1BQU0sb0NBQW9DO0FBQy9FLGVBQVMsSUFBSSxHQUFHLElBQUksUUFBUTtBQUFLLGNBQU0sVUFBVSxJQUFJLEdBQUdBLE9BQU0sQ0FBQyxHQUFHLElBQUk7SUFDeEU7SUFDQSxTQUFNO0FBQ0osWUFBTSxFQUFFLFFBQVEsVUFBUyxJQUFLO0FBQzlCLFdBQUssV0FBVyxNQUFNO0FBQ3RCLFlBQU0sTUFBTSxPQUFPLE1BQU0sR0FBRyxTQUFTO0FBQ3JDLFdBQUssUUFBTztBQUNaLGFBQU87SUFDVDtJQUNBLFdBQVcsSUFBTTtBQUNmLGFBQU8sSUFBSyxLQUFLLFlBQW1CO0FBQ3BDLFNBQUcsSUFBSSxHQUFHLEtBQUssSUFBRyxDQUFFO0FBQ3BCLFlBQU0sRUFBRSxVQUFVLFFBQVEsUUFBUSxVQUFVLFdBQVcsSUFBRyxJQUFLO0FBQy9ELFNBQUcsWUFBWTtBQUNmLFNBQUcsV0FBVztBQUNkLFNBQUcsU0FBUztBQUNaLFNBQUcsTUFBTTtBQUNULFVBQUksU0FBUztBQUFVLFdBQUcsT0FBTyxJQUFJLE1BQU07QUFDM0MsYUFBTztJQUNUO0lBQ0EsUUFBSztBQUNILGFBQU8sS0FBSyxXQUFVO0lBQ3hCOztBQVNLLE1BQU0sWUFBeUMsNEJBQVksS0FBSztJQUNyRTtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUFZO0dBQ3JGOzs7QUQxSEQsTUFBTSxXQUEyQiw0QkFBWSxLQUFLO0lBQ2hEO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFDcEY7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUNwRjtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQ3BGO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFDcEY7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUNwRjtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQ3BGO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFDcEY7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFBWTtHQUNyRjtBQUdELE1BQU0sV0FBMkIsb0JBQUksWUFBWSxFQUFFO0FBR25ELE1BQWUsV0FBZixjQUF1RCxPQUFTO0lBWTlELFlBQVksV0FBaUI7QUFDM0IsWUFBTSxJQUFJLFdBQVcsR0FBRyxLQUFLO0lBQy9CO0lBQ1UsTUFBRztBQUNYLFlBQU0sRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUMsSUFBSztBQUNuQyxhQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ2hDOztJQUVVLElBQ1IsR0FBVyxHQUFXLEdBQVcsR0FBVyxHQUFXLEdBQVcsR0FBVyxHQUFTO0FBRXRGLFdBQUssSUFBSSxJQUFJO0FBQ2IsV0FBSyxJQUFJLElBQUk7QUFDYixXQUFLLElBQUksSUFBSTtBQUNiLFdBQUssSUFBSSxJQUFJO0FBQ2IsV0FBSyxJQUFJLElBQUk7QUFDYixXQUFLLElBQUksSUFBSTtBQUNiLFdBQUssSUFBSSxJQUFJO0FBQ2IsV0FBSyxJQUFJLElBQUk7SUFDZjtJQUNVLFFBQVEsTUFBZ0IsUUFBYztBQUU5QyxlQUFTLElBQUksR0FBRyxJQUFJLElBQUksS0FBSyxVQUFVO0FBQUcsaUJBQVMsQ0FBQyxJQUFJLEtBQUssVUFBVSxRQUFRLEtBQUs7QUFDcEYsZUFBUyxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUs7QUFDNUIsY0FBTSxNQUFNLFNBQVMsSUFBSSxFQUFFO0FBQzNCLGNBQU0sS0FBSyxTQUFTLElBQUksQ0FBQztBQUN6QixjQUFNLEtBQUssS0FBSyxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRSxJQUFLLFFBQVE7QUFDbkQsY0FBTSxLQUFLLEtBQUssSUFBSSxFQUFFLElBQUksS0FBSyxJQUFJLEVBQUUsSUFBSyxPQUFPO0FBQ2pELGlCQUFTLENBQUMsSUFBSyxLQUFLLFNBQVMsSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksRUFBRSxJQUFLO01BQ2pFO0FBRUEsVUFBSSxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBQyxJQUFLO0FBQ2pDLGVBQVMsSUFBSSxHQUFHLElBQUksSUFBSSxLQUFLO0FBQzNCLGNBQU0sU0FBUyxLQUFLLEdBQUcsQ0FBQyxJQUFJLEtBQUssR0FBRyxFQUFFLElBQUksS0FBSyxHQUFHLEVBQUU7QUFDcEQsY0FBTSxLQUFNLElBQUksU0FBUyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDLElBQUs7QUFDckUsY0FBTSxTQUFTLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxHQUFHLEVBQUUsSUFBSSxLQUFLLEdBQUcsRUFBRTtBQUNwRCxjQUFNLEtBQU0sU0FBUyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUs7QUFDckMsWUFBSTtBQUNKLFlBQUk7QUFDSixZQUFJO0FBQ0osWUFBSyxJQUFJLEtBQU07QUFDZixZQUFJO0FBQ0osWUFBSTtBQUNKLFlBQUk7QUFDSixZQUFLLEtBQUssS0FBTTtNQUNsQjtBQUVBLFVBQUssSUFBSSxLQUFLLElBQUs7QUFDbkIsVUFBSyxJQUFJLEtBQUssSUFBSztBQUNuQixVQUFLLElBQUksS0FBSyxJQUFLO0FBQ25CLFVBQUssSUFBSSxLQUFLLElBQUs7QUFDbkIsVUFBSyxJQUFJLEtBQUssSUFBSztBQUNuQixVQUFLLElBQUksS0FBSyxJQUFLO0FBQ25CLFVBQUssSUFBSSxLQUFLLElBQUs7QUFDbkIsVUFBSyxJQUFJLEtBQUssSUFBSztBQUNuQixXQUFLLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ2pDO0lBQ1UsYUFBVTtBQUNsQixZQUFNLFFBQVE7SUFDaEI7SUFDQSxVQUFPO0FBQ0wsV0FBSyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUMvQixZQUFNLEtBQUssTUFBTTtJQUNuQjs7QUFJSSxNQUFPLFVBQVAsY0FBdUIsU0FBaUI7OztJQUdsQyxJQUFZLFVBQVUsQ0FBQyxJQUFJO0lBQzNCLElBQVksVUFBVSxDQUFDLElBQUk7SUFDM0IsSUFBWSxVQUFVLENBQUMsSUFBSTtJQUMzQixJQUFZLFVBQVUsQ0FBQyxJQUFJO0lBQzNCLElBQVksVUFBVSxDQUFDLElBQUk7SUFDM0IsSUFBWSxVQUFVLENBQUMsSUFBSTtJQUMzQixJQUFZLFVBQVUsQ0FBQyxJQUFJO0lBQzNCLElBQVksVUFBVSxDQUFDLElBQUk7SUFDckMsY0FBQTtBQUNFLFlBQU0sRUFBRTtJQUNWOztBQXFUSyxNQUFNLFNBQXlDO0lBQ3BELE1BQU0sSUFBSSxRQUFPO0lBQ0Qsd0JBQVEsQ0FBSTtFQUFDOzs7QUVsYi9COzs7QUNBQTs7O0FDQUE7QUE0QkEsTUFBWTtBQUFaLEdBQUEsU0FBWUMsaUJBQWM7QUFFeEIsSUFBQUEsZ0JBQUFBLGdCQUFBLGNBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsV0FBQSxJQUFBLENBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxrQkFBQSxJQUFBLENBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxVQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLDBCQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGdCQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLFFBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsVUFBQSxJQUFBLENBQUEsSUFBQTtBQUdBLElBQUFBLGdCQUFBQSxnQkFBQSxrQkFBQSxJQUFBLEVBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxrQkFBQSxJQUFBLEVBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxpQkFBQSxJQUFBLEVBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxzQkFBQSxJQUFBLEVBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxtQkFBQSxJQUFBLEVBQUEsSUFBQTtBQUdBLElBQUFBLGdCQUFBQSxnQkFBQSxNQUFBLElBQUEsS0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGVBQUEsSUFBQSxLQUFBLElBQUE7RUFDRixHQXJCWSxtQkFBQSxpQkFBYyxDQUFBLEVBQUE7QUE4RTFCLE1BQVk7QUFBWixHQUFBLFNBQVlDLG1CQUFnQjtBQUMxQixJQUFBQSxrQkFBQSxPQUFBLElBQUE7QUFDQSxJQUFBQSxrQkFBQSxRQUFBLElBQUE7QUFDQSxJQUFBQSxrQkFBQSxJQUFBLElBQUE7QUFDQSxJQUFBQSxrQkFBQSxNQUFBLElBQUE7QUFDQSxJQUFBQSxrQkFBQSxLQUFBLElBQUE7QUFDQSxJQUFBQSxrQkFBQSxPQUFBLElBQUE7QUFDQSxJQUFBQSxrQkFBQSxNQUFBLElBQUE7RUFDRixHQVJZLHFCQUFBLG1CQUFnQixDQUFBLEVBQUE7OztBQzFHNUI7OztBQ0FBOzs7QUNBQTs7O0FDQUE7QUFTQSxNQUFZO0FBQVosR0FBQSxTQUFZQyxjQUFXO0FBQ3JCLElBQUFBLGFBQUEsU0FBQSxJQUFBO0FBQ0EsSUFBQUEsYUFBQSxNQUFBLElBQUE7QUFDQSxJQUFBQSxhQUFBLGdCQUFBLElBQUE7QUFDQSxJQUFBQSxhQUFBLFlBQUEsSUFBQTtBQUNBLElBQUFBLGFBQUEsZUFBQSxJQUFBO0FBQ0EsSUFBQUEsYUFBQSxlQUFBLElBQUE7QUFDQSxJQUFBQSxhQUFBLGVBQUEsSUFBQTtBQUNBLElBQUFBLGFBQUEsZUFBQSxJQUFBO0FBQ0EsSUFBQUEsYUFBQSxZQUFBLElBQUE7RUFDRixHQVZZLGdCQUFBLGNBQVcsQ0FBQSxFQUFBOzs7QUw2QnZCLE1BQVlDO0FBQVosR0FBQSxTQUFZQSxpQkFBYztBQUN4QixJQUFBQSxnQkFBQUEsZ0JBQUEsY0FBQSxJQUFBLENBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxXQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGtCQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGNBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsMEJBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsUUFBQSxJQUFBLENBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxRQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLFVBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsYUFBQSxJQUFBLENBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxnQkFBQSxJQUFBLEVBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxrQkFBQSxJQUFBLEVBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxpQkFBQSxJQUFBLEVBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxzQkFBQSxJQUFBLEVBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxtQkFBQSxJQUFBLEVBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxpQkFBQSxJQUFBLEVBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxXQUFBLElBQUEsSUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGFBQUEsSUFBQSxJQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsS0FBQSxJQUFBLElBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxXQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLFVBQUEsSUFBQSxLQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEscUJBQUEsSUFBQSxLQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsYUFBQSxJQUFBLEtBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxlQUFBLElBQUEsS0FBQSxJQUFB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O0FBQ3RCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksR0FBRyxFQUFFO0FBQ2pCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxHQUFHLEVBQUU7QUFDakIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksR0FBRyxFQUFFO0FBQ2pCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7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aUJBQWlCLFVBQVUsQ0FBQyxNQUFNO0FBQ25FLFlBQU0sV0FBVyxFQUFFLE9BQU87QUFBQSxJQUM5QixDQUFDO0FBQ0QsYUFBUyxlQUFlLGlCQUFpQixHQUFHLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUN6RSxRQUFFLGVBQWU7QUFDakIsY0FBUTtBQUFBLElBQ1osQ0FBQztBQUFBLEVBQ0w7QUFFQSxTQUFPLGlCQUFpQixnQkFBZ0IsTUFBTTtBQUMxQyxRQUFJLFFBQVEsWUFBWSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQy9DLFdBQU87QUFBQSxFQUNYLENBQUM7QUFFRCxXQUFTLGlCQUFpQixvQkFBb0IsSUFBSTsiLAogICJuYW1lcyI6IFsicGlubyIsICJsb2dnZXIiLCAidHJhbnNtaXQiLCAibGV2ZWwiLCAic2V0T3B0cyIsICJzZWxmIiwgImxlbiIsICJpIiwgIm51bSIsICJsZW4yIiwgIkJ1ZmZlciIsICJ1dGY4VG9CeXRlcyIsICJiYXNlNjRUb0J5dGVzIiwgImkiLCAiYXNjaWlUb0J5dGVzIiwgImJ5dGVMZW5ndGgiLCAic3RhdGUiLCAiTm9zdHJFdmVudEtpbmQiLCAiTm9zdHJNZXNzYWdlVHlwZSIsICJOaXA0Nk1ldGhvZCIsICJOb3N0ckV2ZW50S2luZCIsICJfMG4iLCAiXzFuIiwgIl8wbiIsICJfMW4iLCAibnVtIiwgIl8wbiIsICJfMW4iLCAiXzFuIiwgIl8wbiIsICJfMW4iLCAibnVtIiwgIm51bSIsICJfMW4iLCAiXzBuIiwgIl8xbiIsICJ3aW5kb3ciLCAiXzBuIiwgIl8xbiIsICJ3aW5kb3ciLCAiXzBuIiwgImdldFB1YmxpY0tleSIsICJudW0iLCAiXzJuIiwgIl8wbiIsICJfMW4iLCAiXzBuIiwgIl8xbiIsICJfMm4iLCAiXzNuIiwgIl80biIsICJwb2ludFRvQnl0ZXMiLCAiZW5kbyIsICJfMG4iLCAiXzJuIiwgIl8zbiIsICJfMm4iLCAiXzBuIiwgIkxvZ0xldmVsIiwgInBpbm8iLCAiY3J5cHRvIiwgImdldENyeXB0byIsICJjcnlwdG8iLCAia2luZCJdCn0K
