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

  // src/profiles/profiles.js
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
    return {
      name,
      privKey: type === "local" ? await generatePrivateKey() : "",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3F1aWNrLWZvcm1hdC11bmVzY2FwZWQvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Bpbm8vYnJvd3Nlci5qcyIsICJub2RlLXN0dWI6Y3J5cHRvIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9iZWNoMzIvZGlzdC9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCAiLi4vLi4vLi4vc3JjL3Byb2ZpbGVzL3Byb2ZpbGVzLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvdXRpbHMuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvY3J5cHRvLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvc2VlZHBocmFzZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG5vYmxlL2hhc2hlcy9zcmMvdXRpbHMudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0Bub2JsZS9oYXNoZXMvc3JjL3NoYTIudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0Bub2JsZS9oYXNoZXMvc3JjL19tZC50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy9pbmRleC50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy90eXBlcy9pbmRleC50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy90eXBlcy9iYXNlLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL3R5cGVzL3Byb3RvY29sLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvZGlzdC9lc20vdHlwZXMvbWVzc2FnZXMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvdHlwZXMvZ3VhcmRzLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL3R5cGVzL25pcDQ2LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL2NyeXB0by50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG5vYmxlL2N1cnZlcy9zcmMvc2VjcDI1NmsxLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abm9ibGUvY3VydmVzL3NyYy9hYnN0cmFjdC9jdXJ2ZS50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG5vYmxlL2N1cnZlcy9zcmMvdXRpbHMudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0Bub2JsZS9jdXJ2ZXMvc3JjL2Fic3RyYWN0L21vZHVsYXIudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0Bub2JsZS9jdXJ2ZXMvc3JjL2Fic3RyYWN0L3dlaWVyc3RyYXNzLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL3V0aWxzL2xvZ2dlci50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy9lbmNvZGluZy9iYXNlNjQudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvdmFsaWRhdGlvbi9pbmRleC50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy9ldmVudC9pbmRleC50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy9ldmVudC9jcmVhdGlvbi50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy9ldmVudC9zaWduaW5nLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL25pcHMvbmlwLTA0LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL25pcHMvbmlwLTAxLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL25pcHMvbmlwLTE5LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL25pcHMvbmlwLTI2LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL25pcHMvbmlwLTQ0LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL25pcHMvbmlwLTQ2LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL25pcHMvbmlwLTQ5LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL3V0aWxzL2VuY29kaW5nLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIE1pbmltYWwgcHJvY2VzcyBzaGltIGZvciBicm93c2VyIGNvbnRleHQuXG4gKiBOb2RlLmpzIGxpYnJhcmllcyBidW5kbGVkIHZpYSBub3N0ci1jcnlwdG8tdXRpbHMgKGNyeXB0by1icm93c2VyaWZ5LFxuICogcmVhZGFibGUtc3RyZWFtLCBldGMuKSByZWZlcmVuY2UgdGhlIGdsb2JhbCBgcHJvY2Vzc2Agb2JqZWN0LlxuICogVGhpcyBwcm92aWRlcyBqdXN0IGVub3VnaCBmb3IgdGhlbSB0byB3b3JrIGluIGEgYnJvd3NlciBleHRlbnNpb24uXG4gKi9cbmV4cG9ydCB2YXIgcHJvY2VzcyA9IHtcbiAgICBlbnY6IHsgTk9ERV9FTlY6ICdwcm9kdWN0aW9uJywgTE9HX0xFVkVMOiAnd2FybicgfSxcbiAgICBicm93c2VyOiB0cnVlLFxuICAgIHZlcnNpb246ICcnLFxuICAgIHN0ZG91dDogbnVsbCxcbiAgICBzdGRlcnI6IG51bGwsXG4gICAgbmV4dFRpY2s6IGZ1bmN0aW9uIChmbikge1xuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkgeyBmbi5hcHBseShudWxsLCBhcmdzKTsgfSk7XG4gICAgfSxcbn07XG4iLCAiJ3VzZSBzdHJpY3QnXG5mdW5jdGlvbiB0cnlTdHJpbmdpZnkgKG8pIHtcbiAgdHJ5IHsgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG8pIH0gY2F0Y2goZSkgeyByZXR1cm4gJ1wiW0NpcmN1bGFyXVwiJyB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZm9ybWF0XG5cbmZ1bmN0aW9uIGZvcm1hdChmLCBhcmdzLCBvcHRzKSB7XG4gIHZhciBzcyA9IChvcHRzICYmIG9wdHMuc3RyaW5naWZ5KSB8fCB0cnlTdHJpbmdpZnlcbiAgdmFyIG9mZnNldCA9IDFcbiAgaWYgKHR5cGVvZiBmID09PSAnb2JqZWN0JyAmJiBmICE9PSBudWxsKSB7XG4gICAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoICsgb2Zmc2V0XG4gICAgaWYgKGxlbiA9PT0gMSkgcmV0dXJuIGZcbiAgICB2YXIgb2JqZWN0cyA9IG5ldyBBcnJheShsZW4pXG4gICAgb2JqZWN0c1swXSA9IHNzKGYpXG4gICAgZm9yICh2YXIgaW5kZXggPSAxOyBpbmRleCA8IGxlbjsgaW5kZXgrKykge1xuICAgICAgb2JqZWN0c1tpbmRleF0gPSBzcyhhcmdzW2luZGV4XSlcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpXG4gIH1cbiAgaWYgKHR5cGVvZiBmICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmXG4gIH1cbiAgdmFyIGFyZ0xlbiA9IGFyZ3MubGVuZ3RoXG4gIGlmIChhcmdMZW4gPT09IDApIHJldHVybiBmXG4gIHZhciBzdHIgPSAnJ1xuICB2YXIgYSA9IDEgLSBvZmZzZXRcbiAgdmFyIGxhc3RQb3MgPSAtMVxuICB2YXIgZmxlbiA9IChmICYmIGYubGVuZ3RoKSB8fCAwXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZmxlbjspIHtcbiAgICBpZiAoZi5jaGFyQ29kZUF0KGkpID09PSAzNyAmJiBpICsgMSA8IGZsZW4pIHtcbiAgICAgIGxhc3RQb3MgPSBsYXN0UG9zID4gLTEgPyBsYXN0UG9zIDogMFxuICAgICAgc3dpdGNoIChmLmNoYXJDb2RlQXQoaSArIDEpKSB7XG4gICAgICAgIGNhc2UgMTAwOiAvLyAnZCdcbiAgICAgICAgY2FzZSAxMDI6IC8vICdmJ1xuICAgICAgICAgIGlmIChhID49IGFyZ0xlbilcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgaWYgKGFyZ3NbYV0gPT0gbnVsbCkgIGJyZWFrXG4gICAgICAgICAgaWYgKGxhc3RQb3MgPCBpKVxuICAgICAgICAgICAgc3RyICs9IGYuc2xpY2UobGFzdFBvcywgaSlcbiAgICAgICAgICBzdHIgKz0gTnVtYmVyKGFyZ3NbYV0pXG4gICAgICAgICAgbGFzdFBvcyA9IGkgKyAyXG4gICAgICAgICAgaSsrXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAxMDU6IC8vICdpJ1xuICAgICAgICAgIGlmIChhID49IGFyZ0xlbilcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgaWYgKGFyZ3NbYV0gPT0gbnVsbCkgIGJyZWFrXG4gICAgICAgICAgaWYgKGxhc3RQb3MgPCBpKVxuICAgICAgICAgICAgc3RyICs9IGYuc2xpY2UobGFzdFBvcywgaSlcbiAgICAgICAgICBzdHIgKz0gTWF0aC5mbG9vcihOdW1iZXIoYXJnc1thXSkpXG4gICAgICAgICAgbGFzdFBvcyA9IGkgKyAyXG4gICAgICAgICAgaSsrXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSA3OTogLy8gJ08nXG4gICAgICAgIGNhc2UgMTExOiAvLyAnbydcbiAgICAgICAgY2FzZSAxMDY6IC8vICdqJ1xuICAgICAgICAgIGlmIChhID49IGFyZ0xlbilcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgaWYgKGFyZ3NbYV0gPT09IHVuZGVmaW5lZCkgYnJlYWtcbiAgICAgICAgICBpZiAobGFzdFBvcyA8IGkpXG4gICAgICAgICAgICBzdHIgKz0gZi5zbGljZShsYXN0UG9zLCBpKVxuICAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIGFyZ3NbYV1cbiAgICAgICAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHN0ciArPSAnXFwnJyArIGFyZ3NbYV0gKyAnXFwnJ1xuICAgICAgICAgICAgbGFzdFBvcyA9IGkgKyAyXG4gICAgICAgICAgICBpKytcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBzdHIgKz0gYXJnc1thXS5uYW1lIHx8ICc8YW5vbnltb3VzPidcbiAgICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgICBzdHIgKz0gc3MoYXJnc1thXSlcbiAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICBpKytcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDExNTogLy8gJ3MnXG4gICAgICAgICAgaWYgKGEgPj0gYXJnTGVuKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBpZiAobGFzdFBvcyA8IGkpXG4gICAgICAgICAgICBzdHIgKz0gZi5zbGljZShsYXN0UG9zLCBpKVxuICAgICAgICAgIHN0ciArPSBTdHJpbmcoYXJnc1thXSlcbiAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICBpKytcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDM3OiAvLyAnJSdcbiAgICAgICAgICBpZiAobGFzdFBvcyA8IGkpXG4gICAgICAgICAgICBzdHIgKz0gZi5zbGljZShsYXN0UG9zLCBpKVxuICAgICAgICAgIHN0ciArPSAnJSdcbiAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICBpKytcbiAgICAgICAgICBhLS1cbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgKythXG4gICAgfVxuICAgICsraVxuICB9XG4gIGlmIChsYXN0UG9zID09PSAtMSlcbiAgICByZXR1cm4gZlxuICBlbHNlIGlmIChsYXN0UG9zIDwgZmxlbikge1xuICAgIHN0ciArPSBmLnNsaWNlKGxhc3RQb3MpXG4gIH1cblxuICByZXR1cm4gc3RyXG59XG4iLCAiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGZvcm1hdCA9IHJlcXVpcmUoJ3F1aWNrLWZvcm1hdC11bmVzY2FwZWQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBpbm9cblxuY29uc3QgX2NvbnNvbGUgPSBwZkdsb2JhbFRoaXNPckZhbGxiYWNrKCkuY29uc29sZSB8fCB7fVxuY29uc3Qgc3RkU2VyaWFsaXplcnMgPSB7XG4gIG1hcEh0dHBSZXF1ZXN0OiBtb2NrLFxuICBtYXBIdHRwUmVzcG9uc2U6IG1vY2ssXG4gIHdyYXBSZXF1ZXN0U2VyaWFsaXplcjogcGFzc3Rocm91Z2gsXG4gIHdyYXBSZXNwb25zZVNlcmlhbGl6ZXI6IHBhc3N0aHJvdWdoLFxuICB3cmFwRXJyb3JTZXJpYWxpemVyOiBwYXNzdGhyb3VnaCxcbiAgcmVxOiBtb2NrLFxuICByZXM6IG1vY2ssXG4gIGVycjogYXNFcnJWYWx1ZSxcbiAgZXJyV2l0aENhdXNlOiBhc0VyclZhbHVlXG59XG5mdW5jdGlvbiBsZXZlbFRvVmFsdWUgKGxldmVsLCBsb2dnZXIpIHtcbiAgcmV0dXJuIGxldmVsID09PSAnc2lsZW50J1xuICAgID8gSW5maW5pdHlcbiAgICA6IGxvZ2dlci5sZXZlbHMudmFsdWVzW2xldmVsXVxufVxuY29uc3QgYmFzZUxvZ0Z1bmN0aW9uU3ltYm9sID0gU3ltYm9sKCdwaW5vLmxvZ0Z1bmNzJylcbmNvbnN0IGhpZXJhcmNoeVN5bWJvbCA9IFN5bWJvbCgncGluby5oaWVyYXJjaHknKVxuXG5jb25zdCBsb2dGYWxsYmFja01hcCA9IHtcbiAgZXJyb3I6ICdsb2cnLFxuICBmYXRhbDogJ2Vycm9yJyxcbiAgd2FybjogJ2Vycm9yJyxcbiAgaW5mbzogJ2xvZycsXG4gIGRlYnVnOiAnbG9nJyxcbiAgdHJhY2U6ICdsb2cnXG59XG5cbmZ1bmN0aW9uIGFwcGVuZENoaWxkTG9nZ2VyIChwYXJlbnRMb2dnZXIsIGNoaWxkTG9nZ2VyKSB7XG4gIGNvbnN0IG5ld0VudHJ5ID0ge1xuICAgIGxvZ2dlcjogY2hpbGRMb2dnZXIsXG4gICAgcGFyZW50OiBwYXJlbnRMb2dnZXJbaGllcmFyY2h5U3ltYm9sXVxuICB9XG4gIGNoaWxkTG9nZ2VyW2hpZXJhcmNoeVN5bWJvbF0gPSBuZXdFbnRyeVxufVxuXG5mdW5jdGlvbiBzZXR1cEJhc2VMb2dGdW5jdGlvbnMgKGxvZ2dlciwgbGV2ZWxzLCBwcm90bykge1xuICBjb25zdCBsb2dGdW5jdGlvbnMgPSB7fVxuICBsZXZlbHMuZm9yRWFjaChsZXZlbCA9PiB7XG4gICAgbG9nRnVuY3Rpb25zW2xldmVsXSA9IHByb3RvW2xldmVsXSA/IHByb3RvW2xldmVsXSA6IChfY29uc29sZVtsZXZlbF0gfHwgX2NvbnNvbGVbbG9nRmFsbGJhY2tNYXBbbGV2ZWxdIHx8ICdsb2cnXSB8fCBub29wKVxuICB9KVxuICBsb2dnZXJbYmFzZUxvZ0Z1bmN0aW9uU3ltYm9sXSA9IGxvZ0Z1bmN0aW9uc1xufVxuXG5mdW5jdGlvbiBzaG91bGRTZXJpYWxpemUgKHNlcmlhbGl6ZSwgc2VyaWFsaXplcnMpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoc2VyaWFsaXplKSkge1xuICAgIGNvbnN0IGhhc1RvRmlsdGVyID0gc2VyaWFsaXplLmZpbHRlcihmdW5jdGlvbiAoaykge1xuICAgICAgcmV0dXJuIGsgIT09ICchc3RkU2VyaWFsaXplcnMuZXJyJ1xuICAgIH0pXG4gICAgcmV0dXJuIGhhc1RvRmlsdGVyXG4gIH0gZWxzZSBpZiAoc2VyaWFsaXplID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHNlcmlhbGl6ZXJzKVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIHBpbm8gKG9wdHMpIHtcbiAgb3B0cyA9IG9wdHMgfHwge31cbiAgb3B0cy5icm93c2VyID0gb3B0cy5icm93c2VyIHx8IHt9XG5cbiAgY29uc3QgdHJhbnNtaXQgPSBvcHRzLmJyb3dzZXIudHJhbnNtaXRcbiAgaWYgKHRyYW5zbWl0ICYmIHR5cGVvZiB0cmFuc21pdC5zZW5kICE9PSAnZnVuY3Rpb24nKSB7IHRocm93IEVycm9yKCdwaW5vOiB0cmFuc21pdCBvcHRpb24gbXVzdCBoYXZlIGEgc2VuZCBmdW5jdGlvbicpIH1cblxuICBjb25zdCBwcm90byA9IG9wdHMuYnJvd3Nlci53cml0ZSB8fCBfY29uc29sZVxuICBpZiAob3B0cy5icm93c2VyLndyaXRlKSBvcHRzLmJyb3dzZXIuYXNPYmplY3QgPSB0cnVlXG4gIGNvbnN0IHNlcmlhbGl6ZXJzID0gb3B0cy5zZXJpYWxpemVycyB8fCB7fVxuICBjb25zdCBzZXJpYWxpemUgPSBzaG91bGRTZXJpYWxpemUob3B0cy5icm93c2VyLnNlcmlhbGl6ZSwgc2VyaWFsaXplcnMpXG4gIGxldCBzdGRFcnJTZXJpYWxpemUgPSBvcHRzLmJyb3dzZXIuc2VyaWFsaXplXG5cbiAgaWYgKFxuICAgIEFycmF5LmlzQXJyYXkob3B0cy5icm93c2VyLnNlcmlhbGl6ZSkgJiZcbiAgICBvcHRzLmJyb3dzZXIuc2VyaWFsaXplLmluZGV4T2YoJyFzdGRTZXJpYWxpemVycy5lcnInKSA+IC0xXG4gICkgc3RkRXJyU2VyaWFsaXplID0gZmFsc2VcblxuICBjb25zdCBjdXN0b21MZXZlbHMgPSBPYmplY3Qua2V5cyhvcHRzLmN1c3RvbUxldmVscyB8fCB7fSlcbiAgY29uc3QgbGV2ZWxzID0gWydlcnJvcicsICdmYXRhbCcsICd3YXJuJywgJ2luZm8nLCAnZGVidWcnLCAndHJhY2UnXS5jb25jYXQoY3VzdG9tTGV2ZWxzKVxuXG4gIGlmICh0eXBlb2YgcHJvdG8gPT09ICdmdW5jdGlvbicpIHtcbiAgICBsZXZlbHMuZm9yRWFjaChmdW5jdGlvbiAobGV2ZWwpIHtcbiAgICAgIHByb3RvW2xldmVsXSA9IHByb3RvXG4gICAgfSlcbiAgfVxuICBpZiAob3B0cy5lbmFibGVkID09PSBmYWxzZSB8fCBvcHRzLmJyb3dzZXIuZGlzYWJsZWQpIG9wdHMubGV2ZWwgPSAnc2lsZW50J1xuICBjb25zdCBsZXZlbCA9IG9wdHMubGV2ZWwgfHwgJ2luZm8nXG4gIGNvbnN0IGxvZ2dlciA9IE9iamVjdC5jcmVhdGUocHJvdG8pXG4gIGlmICghbG9nZ2VyLmxvZykgbG9nZ2VyLmxvZyA9IG5vb3BcblxuICBzZXR1cEJhc2VMb2dGdW5jdGlvbnMobG9nZ2VyLCBsZXZlbHMsIHByb3RvKVxuICAvLyBzZXR1cCByb290IGhpZXJhcmNoeSBlbnRyeVxuICBhcHBlbmRDaGlsZExvZ2dlcih7fSwgbG9nZ2VyKVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShsb2dnZXIsICdsZXZlbFZhbCcsIHtcbiAgICBnZXQ6IGdldExldmVsVmFsXG4gIH0pXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShsb2dnZXIsICdsZXZlbCcsIHtcbiAgICBnZXQ6IGdldExldmVsLFxuICAgIHNldDogc2V0TGV2ZWxcbiAgfSlcblxuICBjb25zdCBzZXRPcHRzID0ge1xuICAgIHRyYW5zbWl0LFxuICAgIHNlcmlhbGl6ZSxcbiAgICBhc09iamVjdDogb3B0cy5icm93c2VyLmFzT2JqZWN0LFxuICAgIGFzT2JqZWN0QmluZGluZ3NPbmx5OiBvcHRzLmJyb3dzZXIuYXNPYmplY3RCaW5kaW5nc09ubHksXG4gICAgZm9ybWF0dGVyczogb3B0cy5icm93c2VyLmZvcm1hdHRlcnMsXG4gICAgcmVwb3J0Q2FsbGVyOiBvcHRzLmJyb3dzZXIucmVwb3J0Q2FsbGVyLFxuICAgIGxldmVscyxcbiAgICB0aW1lc3RhbXA6IGdldFRpbWVGdW5jdGlvbihvcHRzKSxcbiAgICBtZXNzYWdlS2V5OiBvcHRzLm1lc3NhZ2VLZXkgfHwgJ21zZycsXG4gICAgb25DaGlsZDogb3B0cy5vbkNoaWxkIHx8IG5vb3BcbiAgfVxuICBsb2dnZXIubGV2ZWxzID0gZ2V0TGV2ZWxzKG9wdHMpXG4gIGxvZ2dlci5sZXZlbCA9IGxldmVsXG5cbiAgbG9nZ2VyLmlzTGV2ZWxFbmFibGVkID0gZnVuY3Rpb24gKGxldmVsKSB7XG4gICAgaWYgKCF0aGlzLmxldmVscy52YWx1ZXNbbGV2ZWxdKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5sZXZlbHMudmFsdWVzW2xldmVsXSA+PSB0aGlzLmxldmVscy52YWx1ZXNbdGhpcy5sZXZlbF1cbiAgfVxuICBsb2dnZXIuc2V0TWF4TGlzdGVuZXJzID0gbG9nZ2VyLmdldE1heExpc3RlbmVycyA9XG4gIGxvZ2dlci5lbWl0ID0gbG9nZ2VyLmFkZExpc3RlbmVyID0gbG9nZ2VyLm9uID1cbiAgbG9nZ2VyLnByZXBlbmRMaXN0ZW5lciA9IGxvZ2dlci5vbmNlID1cbiAgbG9nZ2VyLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBsb2dnZXIucmVtb3ZlTGlzdGVuZXIgPVxuICBsb2dnZXIucmVtb3ZlQWxsTGlzdGVuZXJzID0gbG9nZ2VyLmxpc3RlbmVycyA9XG4gIGxvZ2dlci5saXN0ZW5lckNvdW50ID0gbG9nZ2VyLmV2ZW50TmFtZXMgPVxuICBsb2dnZXIud3JpdGUgPSBsb2dnZXIuZmx1c2ggPSBub29wXG4gIGxvZ2dlci5zZXJpYWxpemVycyA9IHNlcmlhbGl6ZXJzXG4gIGxvZ2dlci5fc2VyaWFsaXplID0gc2VyaWFsaXplXG4gIGxvZ2dlci5fc3RkRXJyU2VyaWFsaXplID0gc3RkRXJyU2VyaWFsaXplXG4gIGxvZ2dlci5jaGlsZCA9IGZ1bmN0aW9uICguLi5hcmdzKSB7IHJldHVybiBjaGlsZC5jYWxsKHRoaXMsIHNldE9wdHMsIC4uLmFyZ3MpIH1cblxuICBpZiAodHJhbnNtaXQpIGxvZ2dlci5fbG9nRXZlbnQgPSBjcmVhdGVMb2dFdmVudFNoYXBlKClcblxuICBmdW5jdGlvbiBnZXRMZXZlbFZhbCAoKSB7XG4gICAgcmV0dXJuIGxldmVsVG9WYWx1ZSh0aGlzLmxldmVsLCB0aGlzKVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TGV2ZWwgKCkge1xuICAgIHJldHVybiB0aGlzLl9sZXZlbFxuICB9XG4gIGZ1bmN0aW9uIHNldExldmVsIChsZXZlbCkge1xuICAgIGlmIChsZXZlbCAhPT0gJ3NpbGVudCcgJiYgIXRoaXMubGV2ZWxzLnZhbHVlc1tsZXZlbF0pIHtcbiAgICAgIHRocm93IEVycm9yKCd1bmtub3duIGxldmVsICcgKyBsZXZlbClcbiAgICB9XG4gICAgdGhpcy5fbGV2ZWwgPSBsZXZlbFxuXG4gICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgJ2Vycm9yJykgLy8gPC0tIG11c3Qgc3RheSBmaXJzdFxuICAgIHNldCh0aGlzLCBzZXRPcHRzLCBsb2dnZXIsICdmYXRhbCcpXG4gICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgJ3dhcm4nKVxuICAgIHNldCh0aGlzLCBzZXRPcHRzLCBsb2dnZXIsICdpbmZvJylcbiAgICBzZXQodGhpcywgc2V0T3B0cywgbG9nZ2VyLCAnZGVidWcnKVxuICAgIHNldCh0aGlzLCBzZXRPcHRzLCBsb2dnZXIsICd0cmFjZScpXG5cbiAgICBjdXN0b21MZXZlbHMuZm9yRWFjaCgobGV2ZWwpID0+IHtcbiAgICAgIHNldCh0aGlzLCBzZXRPcHRzLCBsb2dnZXIsIGxldmVsKVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBjaGlsZCAoc2V0T3B0cywgYmluZGluZ3MsIGNoaWxkT3B0aW9ucykge1xuICAgIGlmICghYmluZGluZ3MpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyBiaW5kaW5ncyBmb3IgY2hpbGQgUGlubycpXG4gICAgfVxuICAgIGNoaWxkT3B0aW9ucyA9IGNoaWxkT3B0aW9ucyB8fCB7fVxuICAgIGlmIChzZXJpYWxpemUgJiYgYmluZGluZ3Muc2VyaWFsaXplcnMpIHtcbiAgICAgIGNoaWxkT3B0aW9ucy5zZXJpYWxpemVycyA9IGJpbmRpbmdzLnNlcmlhbGl6ZXJzXG4gICAgfVxuICAgIGNvbnN0IGNoaWxkT3B0aW9uc1NlcmlhbGl6ZXJzID0gY2hpbGRPcHRpb25zLnNlcmlhbGl6ZXJzXG4gICAgaWYgKHNlcmlhbGl6ZSAmJiBjaGlsZE9wdGlvbnNTZXJpYWxpemVycykge1xuICAgICAgdmFyIGNoaWxkU2VyaWFsaXplcnMgPSBPYmplY3QuYXNzaWduKHt9LCBzZXJpYWxpemVycywgY2hpbGRPcHRpb25zU2VyaWFsaXplcnMpXG4gICAgICB2YXIgY2hpbGRTZXJpYWxpemUgPSBvcHRzLmJyb3dzZXIuc2VyaWFsaXplID09PSB0cnVlXG4gICAgICAgID8gT2JqZWN0LmtleXMoY2hpbGRTZXJpYWxpemVycylcbiAgICAgICAgOiBzZXJpYWxpemVcbiAgICAgIGRlbGV0ZSBiaW5kaW5ncy5zZXJpYWxpemVyc1xuICAgICAgYXBwbHlTZXJpYWxpemVycyhbYmluZGluZ3NdLCBjaGlsZFNlcmlhbGl6ZSwgY2hpbGRTZXJpYWxpemVycywgdGhpcy5fc3RkRXJyU2VyaWFsaXplKVxuICAgIH1cbiAgICBmdW5jdGlvbiBDaGlsZCAocGFyZW50KSB7XG4gICAgICB0aGlzLl9jaGlsZExldmVsID0gKHBhcmVudC5fY2hpbGRMZXZlbCB8IDApICsgMVxuXG4gICAgICAvLyBtYWtlIHN1cmUgYmluZGluZ3MgYXJlIGF2YWlsYWJsZSBpbiB0aGUgYHNldGAgZnVuY3Rpb25cbiAgICAgIHRoaXMuYmluZGluZ3MgPSBiaW5kaW5nc1xuXG4gICAgICBpZiAoY2hpbGRTZXJpYWxpemVycykge1xuICAgICAgICB0aGlzLnNlcmlhbGl6ZXJzID0gY2hpbGRTZXJpYWxpemVyc1xuICAgICAgICB0aGlzLl9zZXJpYWxpemUgPSBjaGlsZFNlcmlhbGl6ZVxuICAgICAgfVxuICAgICAgaWYgKHRyYW5zbWl0KSB7XG4gICAgICAgIHRoaXMuX2xvZ0V2ZW50ID0gY3JlYXRlTG9nRXZlbnRTaGFwZShcbiAgICAgICAgICBbXS5jb25jYXQocGFyZW50Ll9sb2dFdmVudC5iaW5kaW5ncywgYmluZGluZ3MpXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gICAgQ2hpbGQucHJvdG90eXBlID0gdGhpc1xuICAgIGNvbnN0IG5ld0xvZ2dlciA9IG5ldyBDaGlsZCh0aGlzKVxuXG4gICAgLy8gbXVzdCBoYXBwZW4gYmVmb3JlIHRoZSBsZXZlbCBpcyBhc3NpZ25lZFxuICAgIGFwcGVuZENoaWxkTG9nZ2VyKHRoaXMsIG5ld0xvZ2dlcilcbiAgICBuZXdMb2dnZXIuY2hpbGQgPSBmdW5jdGlvbiAoLi4uYXJncykgeyByZXR1cm4gY2hpbGQuY2FsbCh0aGlzLCBzZXRPcHRzLCAuLi5hcmdzKSB9XG4gICAgLy8gcmVxdWlyZWQgdG8gYWN0dWFsbHkgaW5pdGlhbGl6ZSB0aGUgbG9nZ2VyIGZ1bmN0aW9ucyBmb3IgYW55IGdpdmVuIGNoaWxkXG4gICAgbmV3TG9nZ2VyLmxldmVsID0gY2hpbGRPcHRpb25zLmxldmVsIHx8IHRoaXMubGV2ZWwgLy8gYWxsb3cgbGV2ZWwgdG8gYmUgc2V0IGJ5IGNoaWxkT3B0aW9uc1xuICAgIHNldE9wdHMub25DaGlsZChuZXdMb2dnZXIpXG5cbiAgICByZXR1cm4gbmV3TG9nZ2VyXG4gIH1cbiAgcmV0dXJuIGxvZ2dlclxufVxuXG5mdW5jdGlvbiBnZXRMZXZlbHMgKG9wdHMpIHtcbiAgY29uc3QgY3VzdG9tTGV2ZWxzID0gb3B0cy5jdXN0b21MZXZlbHMgfHwge31cblxuICBjb25zdCB2YWx1ZXMgPSBPYmplY3QuYXNzaWduKHt9LCBwaW5vLmxldmVscy52YWx1ZXMsIGN1c3RvbUxldmVscylcbiAgY29uc3QgbGFiZWxzID0gT2JqZWN0LmFzc2lnbih7fSwgcGluby5sZXZlbHMubGFiZWxzLCBpbnZlcnRPYmplY3QoY3VzdG9tTGV2ZWxzKSlcblxuICByZXR1cm4ge1xuICAgIHZhbHVlcyxcbiAgICBsYWJlbHNcbiAgfVxufVxuXG5mdW5jdGlvbiBpbnZlcnRPYmplY3QgKG9iaikge1xuICBjb25zdCBpbnZlcnRlZCA9IHt9XG4gIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgaW52ZXJ0ZWRbb2JqW2tleV1dID0ga2V5XG4gIH0pXG4gIHJldHVybiBpbnZlcnRlZFxufVxuXG5waW5vLmxldmVscyA9IHtcbiAgdmFsdWVzOiB7XG4gICAgZmF0YWw6IDYwLFxuICAgIGVycm9yOiA1MCxcbiAgICB3YXJuOiA0MCxcbiAgICBpbmZvOiAzMCxcbiAgICBkZWJ1ZzogMjAsXG4gICAgdHJhY2U6IDEwXG4gIH0sXG4gIGxhYmVsczoge1xuICAgIDEwOiAndHJhY2UnLFxuICAgIDIwOiAnZGVidWcnLFxuICAgIDMwOiAnaW5mbycsXG4gICAgNDA6ICd3YXJuJyxcbiAgICA1MDogJ2Vycm9yJyxcbiAgICA2MDogJ2ZhdGFsJ1xuICB9XG59XG5cbnBpbm8uc3RkU2VyaWFsaXplcnMgPSBzdGRTZXJpYWxpemVyc1xucGluby5zdGRUaW1lRnVuY3Rpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgeyBudWxsVGltZSwgZXBvY2hUaW1lLCB1bml4VGltZSwgaXNvVGltZSB9KVxuXG5mdW5jdGlvbiBnZXRCaW5kaW5nQ2hhaW4gKGxvZ2dlcikge1xuICBjb25zdCBiaW5kaW5ncyA9IFtdXG4gIGlmIChsb2dnZXIuYmluZGluZ3MpIHtcbiAgICBiaW5kaW5ncy5wdXNoKGxvZ2dlci5iaW5kaW5ncylcbiAgfVxuXG4gIC8vIHRyYXZlcnNlIHVwIHRoZSB0cmVlIHRvIGdldCBhbGwgYmluZGluZ3NcbiAgbGV0IGhpZXJhcmNoeSA9IGxvZ2dlcltoaWVyYXJjaHlTeW1ib2xdXG4gIHdoaWxlIChoaWVyYXJjaHkucGFyZW50KSB7XG4gICAgaGllcmFyY2h5ID0gaGllcmFyY2h5LnBhcmVudFxuICAgIGlmIChoaWVyYXJjaHkubG9nZ2VyLmJpbmRpbmdzKSB7XG4gICAgICBiaW5kaW5ncy5wdXNoKGhpZXJhcmNoeS5sb2dnZXIuYmluZGluZ3MpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJpbmRpbmdzLnJldmVyc2UoKVxufVxuXG5mdW5jdGlvbiBzZXQgKHNlbGYsIG9wdHMsIHJvb3RMb2dnZXIsIGxldmVsKSB7XG4gIC8vIG92ZXJyaWRlIHRoZSBjdXJyZW50IGxvZyBmdW5jdGlvbnMgd2l0aCBlaXRoZXIgYG5vb3BgIG9yIHRoZSBiYXNlIGxvZyBmdW5jdGlvblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc2VsZiwgbGV2ZWwsIHtcbiAgICB2YWx1ZTogKGxldmVsVG9WYWx1ZShzZWxmLmxldmVsLCByb290TG9nZ2VyKSA+IGxldmVsVG9WYWx1ZShsZXZlbCwgcm9vdExvZ2dlcilcbiAgICAgID8gbm9vcFxuICAgICAgOiByb290TG9nZ2VyW2Jhc2VMb2dGdW5jdGlvblN5bWJvbF1bbGV2ZWxdKSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KVxuXG4gIGlmIChzZWxmW2xldmVsXSA9PT0gbm9vcCkge1xuICAgIGlmICghb3B0cy50cmFuc21pdCkgcmV0dXJuXG5cbiAgICBjb25zdCB0cmFuc21pdExldmVsID0gb3B0cy50cmFuc21pdC5sZXZlbCB8fCBzZWxmLmxldmVsXG4gICAgY29uc3QgdHJhbnNtaXRWYWx1ZSA9IGxldmVsVG9WYWx1ZSh0cmFuc21pdExldmVsLCByb290TG9nZ2VyKVxuICAgIGNvbnN0IG1ldGhvZFZhbHVlID0gbGV2ZWxUb1ZhbHVlKGxldmVsLCByb290TG9nZ2VyKVxuICAgIGlmIChtZXRob2RWYWx1ZSA8IHRyYW5zbWl0VmFsdWUpIHJldHVyblxuICB9XG5cbiAgLy8gbWFrZSBzdXJlIHRoZSBsb2cgZm9ybWF0IGlzIGNvcnJlY3RcbiAgc2VsZltsZXZlbF0gPSBjcmVhdGVXcmFwKHNlbGYsIG9wdHMsIHJvb3RMb2dnZXIsIGxldmVsKVxuXG4gIC8vIHByZXBlbmQgYmluZGluZ3MgaWYgaXQgaXMgbm90IHRoZSByb290IGxvZ2dlclxuICBjb25zdCBiaW5kaW5ncyA9IGdldEJpbmRpbmdDaGFpbihzZWxmKVxuICBpZiAoYmluZGluZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgLy8gZWFybHkgZXhpdCBpbiBjYXNlIGZvciByb290TG9nZ2VyXG4gICAgcmV0dXJuXG4gIH1cbiAgc2VsZltsZXZlbF0gPSBwcmVwZW5kQmluZGluZ3NJbkFyZ3VtZW50cyhiaW5kaW5ncywgc2VsZltsZXZlbF0pXG59XG5cbmZ1bmN0aW9uIHByZXBlbmRCaW5kaW5nc0luQXJndW1lbnRzIChiaW5kaW5ncywgbG9nRnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBsb2dGdW5jLmFwcGx5KHRoaXMsIFsuLi5iaW5kaW5ncywgLi4uYXJndW1lbnRzXSlcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVXcmFwIChzZWxmLCBvcHRzLCByb290TG9nZ2VyLCBsZXZlbCkge1xuICByZXR1cm4gKGZ1bmN0aW9uICh3cml0ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiBMT0cgKCkge1xuICAgICAgY29uc3QgdHMgPSBvcHRzLnRpbWVzdGFtcCgpXG4gICAgICBjb25zdCBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpXG4gICAgICBjb25zdCBwcm90byA9IChPYmplY3QuZ2V0UHJvdG90eXBlT2YgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpID09PSBfY29uc29sZSkgPyBfY29uc29sZSA6IHRoaXNcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXVxuXG4gICAgICB2YXIgYXJnc0lzU2VyaWFsaXplZCA9IGZhbHNlXG4gICAgICBpZiAob3B0cy5zZXJpYWxpemUpIHtcbiAgICAgICAgYXBwbHlTZXJpYWxpemVycyhhcmdzLCB0aGlzLl9zZXJpYWxpemUsIHRoaXMuc2VyaWFsaXplcnMsIHRoaXMuX3N0ZEVyclNlcmlhbGl6ZSlcbiAgICAgICAgYXJnc0lzU2VyaWFsaXplZCA9IHRydWVcbiAgICAgIH1cbiAgICAgIGlmIChvcHRzLmFzT2JqZWN0IHx8IG9wdHMuZm9ybWF0dGVycykge1xuICAgICAgICBjb25zdCBvdXQgPSBhc09iamVjdCh0aGlzLCBsZXZlbCwgYXJncywgdHMsIG9wdHMpXG4gICAgICAgIGlmIChvcHRzLnJlcG9ydENhbGxlciAmJiBvdXQgJiYgb3V0Lmxlbmd0aCA+IDAgJiYgb3V0WzBdICYmIHR5cGVvZiBvdXRbMF0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNhbGxlciA9IGdldENhbGxlckxvY2F0aW9uKClcbiAgICAgICAgICAgIGlmIChjYWxsZXIpIG91dFswXS5jYWxsZXIgPSBjYWxsZXJcbiAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICB9XG4gICAgICAgIHdyaXRlLmNhbGwocHJvdG8sIC4uLm91dClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChvcHRzLnJlcG9ydENhbGxlcikge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjYWxsZXIgPSBnZXRDYWxsZXJMb2NhdGlvbigpXG4gICAgICAgICAgICBpZiAoY2FsbGVyKSBhcmdzLnB1c2goY2FsbGVyKVxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIH1cbiAgICAgICAgd3JpdGUuYXBwbHkocHJvdG8sIGFyZ3MpXG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRzLnRyYW5zbWl0KSB7XG4gICAgICAgIGNvbnN0IHRyYW5zbWl0TGV2ZWwgPSBvcHRzLnRyYW5zbWl0LmxldmVsIHx8IHNlbGYuX2xldmVsXG4gICAgICAgIGNvbnN0IHRyYW5zbWl0VmFsdWUgPSBsZXZlbFRvVmFsdWUodHJhbnNtaXRMZXZlbCwgcm9vdExvZ2dlcilcbiAgICAgICAgY29uc3QgbWV0aG9kVmFsdWUgPSBsZXZlbFRvVmFsdWUobGV2ZWwsIHJvb3RMb2dnZXIpXG4gICAgICAgIGlmIChtZXRob2RWYWx1ZSA8IHRyYW5zbWl0VmFsdWUpIHJldHVyblxuICAgICAgICB0cmFuc21pdCh0aGlzLCB7XG4gICAgICAgICAgdHMsXG4gICAgICAgICAgbWV0aG9kTGV2ZWw6IGxldmVsLFxuICAgICAgICAgIG1ldGhvZFZhbHVlLFxuICAgICAgICAgIHRyYW5zbWl0TGV2ZWwsXG4gICAgICAgICAgdHJhbnNtaXRWYWx1ZTogcm9vdExvZ2dlci5sZXZlbHMudmFsdWVzW29wdHMudHJhbnNtaXQubGV2ZWwgfHwgc2VsZi5fbGV2ZWxdLFxuICAgICAgICAgIHNlbmQ6IG9wdHMudHJhbnNtaXQuc2VuZCxcbiAgICAgICAgICB2YWw6IGxldmVsVG9WYWx1ZShzZWxmLl9sZXZlbCwgcm9vdExvZ2dlcilcbiAgICAgICAgfSwgYXJncywgYXJnc0lzU2VyaWFsaXplZClcbiAgICAgIH1cbiAgICB9XG4gIH0pKHNlbGZbYmFzZUxvZ0Z1bmN0aW9uU3ltYm9sXVtsZXZlbF0pXG59XG5cbmZ1bmN0aW9uIGFzT2JqZWN0IChsb2dnZXIsIGxldmVsLCBhcmdzLCB0cywgb3B0cykge1xuICBjb25zdCB7XG4gICAgbGV2ZWw6IGxldmVsRm9ybWF0dGVyLFxuICAgIGxvZzogbG9nT2JqZWN0Rm9ybWF0dGVyID0gKG9iaikgPT4gb2JqXG4gIH0gPSBvcHRzLmZvcm1hdHRlcnMgfHwge31cbiAgY29uc3QgYXJnc0Nsb25lZCA9IGFyZ3Muc2xpY2UoKVxuICBsZXQgbXNnID0gYXJnc0Nsb25lZFswXVxuICBjb25zdCBsb2dPYmplY3QgPSB7fVxuXG4gIGxldCBsdmwgPSAobG9nZ2VyLl9jaGlsZExldmVsIHwgMCkgKyAxXG4gIGlmIChsdmwgPCAxKSBsdmwgPSAxXG5cbiAgaWYgKHRzKSB7XG4gICAgbG9nT2JqZWN0LnRpbWUgPSB0c1xuICB9XG5cbiAgaWYgKGxldmVsRm9ybWF0dGVyKSB7XG4gICAgY29uc3QgZm9ybWF0dGVkTGV2ZWwgPSBsZXZlbEZvcm1hdHRlcihsZXZlbCwgbG9nZ2VyLmxldmVscy52YWx1ZXNbbGV2ZWxdKVxuICAgIE9iamVjdC5hc3NpZ24obG9nT2JqZWN0LCBmb3JtYXR0ZWRMZXZlbClcbiAgfSBlbHNlIHtcbiAgICBsb2dPYmplY3QubGV2ZWwgPSBsb2dnZXIubGV2ZWxzLnZhbHVlc1tsZXZlbF1cbiAgfVxuXG4gIGlmIChvcHRzLmFzT2JqZWN0QmluZGluZ3NPbmx5KSB7XG4gICAgaWYgKG1zZyAhPT0gbnVsbCAmJiB0eXBlb2YgbXNnID09PSAnb2JqZWN0Jykge1xuICAgICAgd2hpbGUgKGx2bC0tICYmIHR5cGVvZiBhcmdzQ2xvbmVkWzBdID09PSAnb2JqZWN0Jykge1xuICAgICAgICBPYmplY3QuYXNzaWduKGxvZ09iamVjdCwgYXJnc0Nsb25lZC5zaGlmdCgpKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGZvcm1hdHRlZExvZ09iamVjdCA9IGxvZ09iamVjdEZvcm1hdHRlcihsb2dPYmplY3QpXG4gICAgcmV0dXJuIFtmb3JtYXR0ZWRMb2dPYmplY3QsIC4uLmFyZ3NDbG9uZWRdXG4gIH0gZWxzZSB7XG4gICAgLy8gZGVsaWJlcmF0ZSwgY2F0Y2hpbmcgb2JqZWN0cywgYXJyYXlzXG4gICAgaWYgKG1zZyAhPT0gbnVsbCAmJiB0eXBlb2YgbXNnID09PSAnb2JqZWN0Jykge1xuICAgICAgd2hpbGUgKGx2bC0tICYmIHR5cGVvZiBhcmdzQ2xvbmVkWzBdID09PSAnb2JqZWN0Jykge1xuICAgICAgICBPYmplY3QuYXNzaWduKGxvZ09iamVjdCwgYXJnc0Nsb25lZC5zaGlmdCgpKVxuICAgICAgfVxuICAgICAgbXNnID0gYXJnc0Nsb25lZC5sZW5ndGggPyBmb3JtYXQoYXJnc0Nsb25lZC5zaGlmdCgpLCBhcmdzQ2xvbmVkKSA6IHVuZGVmaW5lZFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1zZyA9PT0gJ3N0cmluZycpIG1zZyA9IGZvcm1hdChhcmdzQ2xvbmVkLnNoaWZ0KCksIGFyZ3NDbG9uZWQpXG4gICAgaWYgKG1zZyAhPT0gdW5kZWZpbmVkKSBsb2dPYmplY3Rbb3B0cy5tZXNzYWdlS2V5XSA9IG1zZ1xuXG4gICAgY29uc3QgZm9ybWF0dGVkTG9nT2JqZWN0ID0gbG9nT2JqZWN0Rm9ybWF0dGVyKGxvZ09iamVjdClcbiAgICByZXR1cm4gW2Zvcm1hdHRlZExvZ09iamVjdF1cbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBseVNlcmlhbGl6ZXJzIChhcmdzLCBzZXJpYWxpemUsIHNlcmlhbGl6ZXJzLCBzdGRFcnJTZXJpYWxpemUpIHtcbiAgZm9yIChjb25zdCBpIGluIGFyZ3MpIHtcbiAgICBpZiAoc3RkRXJyU2VyaWFsaXplICYmIGFyZ3NbaV0gaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgYXJnc1tpXSA9IHBpbm8uc3RkU2VyaWFsaXplcnMuZXJyKGFyZ3NbaV0pXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgYXJnc1tpXSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoYXJnc1tpXSkgJiYgc2VyaWFsaXplKSB7XG4gICAgICBmb3IgKGNvbnN0IGsgaW4gYXJnc1tpXSkge1xuICAgICAgICBpZiAoc2VyaWFsaXplLmluZGV4T2YoaykgPiAtMSAmJiBrIGluIHNlcmlhbGl6ZXJzKSB7XG4gICAgICAgICAgYXJnc1tpXVtrXSA9IHNlcmlhbGl6ZXJzW2tdKGFyZ3NbaV1ba10pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdHJhbnNtaXQgKGxvZ2dlciwgb3B0cywgYXJncywgYXJnc0lzU2VyaWFsaXplZCA9IGZhbHNlKSB7XG4gIGNvbnN0IHNlbmQgPSBvcHRzLnNlbmRcbiAgY29uc3QgdHMgPSBvcHRzLnRzXG4gIGNvbnN0IG1ldGhvZExldmVsID0gb3B0cy5tZXRob2RMZXZlbFxuICBjb25zdCBtZXRob2RWYWx1ZSA9IG9wdHMubWV0aG9kVmFsdWVcbiAgY29uc3QgdmFsID0gb3B0cy52YWxcbiAgY29uc3QgYmluZGluZ3MgPSBsb2dnZXIuX2xvZ0V2ZW50LmJpbmRpbmdzXG5cbiAgaWYgKCFhcmdzSXNTZXJpYWxpemVkKSB7XG4gICAgYXBwbHlTZXJpYWxpemVycyhcbiAgICAgIGFyZ3MsXG4gICAgICBsb2dnZXIuX3NlcmlhbGl6ZSB8fCBPYmplY3Qua2V5cyhsb2dnZXIuc2VyaWFsaXplcnMpLFxuICAgICAgbG9nZ2VyLnNlcmlhbGl6ZXJzLFxuICAgICAgbG9nZ2VyLl9zdGRFcnJTZXJpYWxpemUgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBsb2dnZXIuX3N0ZEVyclNlcmlhbGl6ZVxuICAgIClcbiAgfVxuXG4gIGxvZ2dlci5fbG9nRXZlbnQudHMgPSB0c1xuICBsb2dnZXIuX2xvZ0V2ZW50Lm1lc3NhZ2VzID0gYXJncy5maWx0ZXIoZnVuY3Rpb24gKGFyZykge1xuICAgIC8vIGJpbmRpbmdzIGNhbiBvbmx5IGJlIG9iamVjdHMsIHNvIHJlZmVyZW5jZSBlcXVhbGl0eSBjaGVjayB2aWEgaW5kZXhPZiBpcyBmaW5lXG4gICAgcmV0dXJuIGJpbmRpbmdzLmluZGV4T2YoYXJnKSA9PT0gLTFcbiAgfSlcblxuICBsb2dnZXIuX2xvZ0V2ZW50LmxldmVsLmxhYmVsID0gbWV0aG9kTGV2ZWxcbiAgbG9nZ2VyLl9sb2dFdmVudC5sZXZlbC52YWx1ZSA9IG1ldGhvZFZhbHVlXG5cbiAgc2VuZChtZXRob2RMZXZlbCwgbG9nZ2VyLl9sb2dFdmVudCwgdmFsKVxuXG4gIGxvZ2dlci5fbG9nRXZlbnQgPSBjcmVhdGVMb2dFdmVudFNoYXBlKGJpbmRpbmdzKVxufVxuXG5mdW5jdGlvbiBjcmVhdGVMb2dFdmVudFNoYXBlIChiaW5kaW5ncykge1xuICByZXR1cm4ge1xuICAgIHRzOiAwLFxuICAgIG1lc3NhZ2VzOiBbXSxcbiAgICBiaW5kaW5nczogYmluZGluZ3MgfHwgW10sXG4gICAgbGV2ZWw6IHsgbGFiZWw6ICcnLCB2YWx1ZTogMCB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNFcnJWYWx1ZSAoZXJyKSB7XG4gIGNvbnN0IG9iaiA9IHtcbiAgICB0eXBlOiBlcnIuY29uc3RydWN0b3IubmFtZSxcbiAgICBtc2c6IGVyci5tZXNzYWdlLFxuICAgIHN0YWNrOiBlcnIuc3RhY2tcbiAgfVxuICBmb3IgKGNvbnN0IGtleSBpbiBlcnIpIHtcbiAgICBpZiAob2JqW2tleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgb2JqW2tleV0gPSBlcnJba2V5XVxuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqXG59XG5cbmZ1bmN0aW9uIGdldFRpbWVGdW5jdGlvbiAob3B0cykge1xuICBpZiAodHlwZW9mIG9wdHMudGltZXN0YW1wID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIG9wdHMudGltZXN0YW1wXG4gIH1cbiAgaWYgKG9wdHMudGltZXN0YW1wID09PSBmYWxzZSkge1xuICAgIHJldHVybiBudWxsVGltZVxuICB9XG4gIHJldHVybiBlcG9jaFRpbWVcbn1cblxuZnVuY3Rpb24gbW9jayAoKSB7IHJldHVybiB7fSB9XG5mdW5jdGlvbiBwYXNzdGhyb3VnaCAoYSkgeyByZXR1cm4gYSB9XG5mdW5jdGlvbiBub29wICgpIHt9XG5cbmZ1bmN0aW9uIG51bGxUaW1lICgpIHsgcmV0dXJuIGZhbHNlIH1cbmZ1bmN0aW9uIGVwb2NoVGltZSAoKSB7IHJldHVybiBEYXRlLm5vdygpIH1cbmZ1bmN0aW9uIHVuaXhUaW1lICgpIHsgcmV0dXJuIE1hdGgucm91bmQoRGF0ZS5ub3coKSAvIDEwMDAuMCkgfVxuZnVuY3Rpb24gaXNvVGltZSAoKSB7IHJldHVybiBuZXcgRGF0ZShEYXRlLm5vdygpKS50b0lTT1N0cmluZygpIH0gLy8gdXNpbmcgRGF0ZS5ub3coKSBmb3IgdGVzdGFiaWxpdHlcblxuLyogZXNsaW50LWRpc2FibGUgKi9cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBwZkdsb2JhbFRoaXNPckZhbGxiYWNrICgpIHtcbiAgZnVuY3Rpb24gZGVmZCAobykgeyByZXR1cm4gdHlwZW9mIG8gIT09ICd1bmRlZmluZWQnICYmIG8gfVxuICB0cnkge1xuICAgIGlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcpIHJldHVybiBnbG9iYWxUaGlzXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdC5wcm90b3R5cGUsICdnbG9iYWxUaGlzJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRlbGV0ZSBPYmplY3QucHJvdG90eXBlLmdsb2JhbFRoaXNcbiAgICAgICAgcmV0dXJuICh0aGlzLmdsb2JhbFRoaXMgPSB0aGlzKVxuICAgICAgfSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pXG4gICAgcmV0dXJuIGdsb2JhbFRoaXNcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBkZWZkKHNlbGYpIHx8IGRlZmQod2luZG93KSB8fCBkZWZkKHRoaXMpIHx8IHt9XG4gIH1cbn1cbi8qIGVzbGludC1lbmFibGUgKi9cblxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IHBpbm9cbm1vZHVsZS5leHBvcnRzLnBpbm8gPSBwaW5vXG5cbi8vIEF0dGVtcHQgdG8gZXh0cmFjdCB0aGUgdXNlciBjYWxsc2l0ZSAoZmlsZTpsaW5lOmNvbHVtbilcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBnZXRDYWxsZXJMb2NhdGlvbiAoKSB7XG4gIGNvbnN0IHN0YWNrID0gKG5ldyBFcnJvcigpKS5zdGFja1xuICBpZiAoIXN0YWNrKSByZXR1cm4gbnVsbFxuICBjb25zdCBsaW5lcyA9IHN0YWNrLnNwbGl0KCdcXG4nKVxuICBmb3IgKGxldCBpID0gMTsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgbCA9IGxpbmVzW2ldLnRyaW0oKVxuICAgIC8vIHNraXAgZnJhbWVzIGZyb20gdGhpcyBmaWxlIGFuZCBpbnRlcm5hbHNcbiAgICBpZiAoLyheYXRcXHMrKT8oY3JlYXRlV3JhcHxMT0d8c2V0XFxzKlxcKHxhc09iamVjdHxPYmplY3RcXC5hcHBseXxGdW5jdGlvblxcLmFwcGx5KS8udGVzdChsKSkgY29udGludWVcbiAgICBpZiAobC5pbmRleE9mKCdicm93c2VyLmpzJykgIT09IC0xKSBjb250aW51ZVxuICAgIGlmIChsLmluZGV4T2YoJ25vZGU6aW50ZXJuYWwnKSAhPT0gLTEpIGNvbnRpbnVlXG4gICAgaWYgKGwuaW5kZXhPZignbm9kZV9tb2R1bGVzJykgIT09IC0xKSBjb250aW51ZVxuICAgIC8vIHRyeSBmb3JtYXRzIGxpa2U6IGF0IGZ1bmMgKGZpbGU6bGluZTpjb2wpIG9yIGF0IGZpbGU6bGluZTpjb2xcbiAgICBsZXQgbSA9IGwubWF0Y2goL1xcKCguKj8pOihcXGQrKTooXFxkKylcXCkvKVxuICAgIGlmICghbSkgbSA9IGwubWF0Y2goL2F0XFxzKyguKj8pOihcXGQrKTooXFxkKykvKVxuICAgIGlmIChtKSB7XG4gICAgICBjb25zdCBmaWxlID0gbVsxXVxuICAgICAgY29uc3QgbGluZSA9IG1bMl1cbiAgICAgIGNvbnN0IGNvbCA9IG1bM11cbiAgICAgIHJldHVybiBmaWxlICsgJzonICsgbGluZSArICc6JyArIGNvbFxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbFxufVxuIiwgIm1vZHVsZS5leHBvcnRzID0ge307IiwgIid1c2Ugc3RyaWN0Jztcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuYmVjaDMybSA9IGV4cG9ydHMuYmVjaDMyID0gdm9pZCAwO1xuY29uc3QgQUxQSEFCRVQgPSAncXB6cnk5eDhnZjJ0dmR3MHMzam41NGtoY2U2bXVhN2wnO1xuY29uc3QgQUxQSEFCRVRfTUFQID0ge307XG5mb3IgKGxldCB6ID0gMDsgeiA8IEFMUEhBQkVULmxlbmd0aDsgeisrKSB7XG4gICAgY29uc3QgeCA9IEFMUEhBQkVULmNoYXJBdCh6KTtcbiAgICBBTFBIQUJFVF9NQVBbeF0gPSB6O1xufVxuZnVuY3Rpb24gcG9seW1vZFN0ZXAocHJlKSB7XG4gICAgY29uc3QgYiA9IHByZSA+PiAyNTtcbiAgICByZXR1cm4gKCgocHJlICYgMHgxZmZmZmZmKSA8PCA1KSBeXG4gICAgICAgICgtKChiID4+IDApICYgMSkgJiAweDNiNmE1N2IyKSBeXG4gICAgICAgICgtKChiID4+IDEpICYgMSkgJiAweDI2NTA4ZTZkKSBeXG4gICAgICAgICgtKChiID4+IDIpICYgMSkgJiAweDFlYTExOWZhKSBeXG4gICAgICAgICgtKChiID4+IDMpICYgMSkgJiAweDNkNDIzM2RkKSBeXG4gICAgICAgICgtKChiID4+IDQpICYgMSkgJiAweDJhMTQ2MmIzKSk7XG59XG5mdW5jdGlvbiBwcmVmaXhDaGsocHJlZml4KSB7XG4gICAgbGV0IGNoayA9IDE7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVmaXgubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgYyA9IHByZWZpeC5jaGFyQ29kZUF0KGkpO1xuICAgICAgICBpZiAoYyA8IDMzIHx8IGMgPiAxMjYpXG4gICAgICAgICAgICByZXR1cm4gJ0ludmFsaWQgcHJlZml4ICgnICsgcHJlZml4ICsgJyknO1xuICAgICAgICBjaGsgPSBwb2x5bW9kU3RlcChjaGspIF4gKGMgPj4gNSk7XG4gICAgfVxuICAgIGNoayA9IHBvbHltb2RTdGVwKGNoayk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVmaXgubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgdiA9IHByZWZpeC5jaGFyQ29kZUF0KGkpO1xuICAgICAgICBjaGsgPSBwb2x5bW9kU3RlcChjaGspIF4gKHYgJiAweDFmKTtcbiAgICB9XG4gICAgcmV0dXJuIGNoaztcbn1cbmZ1bmN0aW9uIGNvbnZlcnQoZGF0YSwgaW5CaXRzLCBvdXRCaXRzLCBwYWQpIHtcbiAgICBsZXQgdmFsdWUgPSAwO1xuICAgIGxldCBiaXRzID0gMDtcbiAgICBjb25zdCBtYXhWID0gKDEgPDwgb3V0Qml0cykgLSAxO1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YWx1ZSA9ICh2YWx1ZSA8PCBpbkJpdHMpIHwgZGF0YVtpXTtcbiAgICAgICAgYml0cyArPSBpbkJpdHM7XG4gICAgICAgIHdoaWxlIChiaXRzID49IG91dEJpdHMpIHtcbiAgICAgICAgICAgIGJpdHMgLT0gb3V0Qml0cztcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKCh2YWx1ZSA+PiBiaXRzKSAmIG1heFYpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChwYWQpIHtcbiAgICAgICAgaWYgKGJpdHMgPiAwKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCgodmFsdWUgPDwgKG91dEJpdHMgLSBiaXRzKSkgJiBtYXhWKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKGJpdHMgPj0gaW5CaXRzKVxuICAgICAgICAgICAgcmV0dXJuICdFeGNlc3MgcGFkZGluZyc7XG4gICAgICAgIGlmICgodmFsdWUgPDwgKG91dEJpdHMgLSBiaXRzKSkgJiBtYXhWKVxuICAgICAgICAgICAgcmV0dXJuICdOb24temVybyBwYWRkaW5nJztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIHRvV29yZHMoYnl0ZXMpIHtcbiAgICByZXR1cm4gY29udmVydChieXRlcywgOCwgNSwgdHJ1ZSk7XG59XG5mdW5jdGlvbiBmcm9tV29yZHNVbnNhZmUod29yZHMpIHtcbiAgICBjb25zdCByZXMgPSBjb252ZXJ0KHdvcmRzLCA1LCA4LCBmYWxzZSk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocmVzKSlcbiAgICAgICAgcmV0dXJuIHJlcztcbn1cbmZ1bmN0aW9uIGZyb21Xb3Jkcyh3b3Jkcykge1xuICAgIGNvbnN0IHJlcyA9IGNvbnZlcnQod29yZHMsIDUsIDgsIGZhbHNlKTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyZXMpKVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIHRocm93IG5ldyBFcnJvcihyZXMpO1xufVxuZnVuY3Rpb24gZ2V0TGlicmFyeUZyb21FbmNvZGluZyhlbmNvZGluZykge1xuICAgIGxldCBFTkNPRElOR19DT05TVDtcbiAgICBpZiAoZW5jb2RpbmcgPT09ICdiZWNoMzInKSB7XG4gICAgICAgIEVOQ09ESU5HX0NPTlNUID0gMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIEVOQ09ESU5HX0NPTlNUID0gMHgyYmM4MzBhMztcbiAgICB9XG4gICAgZnVuY3Rpb24gZW5jb2RlKHByZWZpeCwgd29yZHMsIExJTUlUKSB7XG4gICAgICAgIExJTUlUID0gTElNSVQgfHwgOTA7XG4gICAgICAgIGlmIChwcmVmaXgubGVuZ3RoICsgNyArIHdvcmRzLmxlbmd0aCA+IExJTUlUKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhjZWVkcyBsZW5ndGggbGltaXQnKTtcbiAgICAgICAgcHJlZml4ID0gcHJlZml4LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIC8vIGRldGVybWluZSBjaGsgbW9kXG4gICAgICAgIGxldCBjaGsgPSBwcmVmaXhDaGsocHJlZml4KTtcbiAgICAgICAgaWYgKHR5cGVvZiBjaGsgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGNoayk7XG4gICAgICAgIGxldCByZXN1bHQgPSBwcmVmaXggKyAnMSc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd29yZHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGNvbnN0IHggPSB3b3Jkc1tpXTtcbiAgICAgICAgICAgIGlmICh4ID4+IDUgIT09IDApXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb24gNS1iaXQgd29yZCcpO1xuICAgICAgICAgICAgY2hrID0gcG9seW1vZFN0ZXAoY2hrKSBeIHg7XG4gICAgICAgICAgICByZXN1bHQgKz0gQUxQSEFCRVQuY2hhckF0KHgpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgKytpKSB7XG4gICAgICAgICAgICBjaGsgPSBwb2x5bW9kU3RlcChjaGspO1xuICAgICAgICB9XG4gICAgICAgIGNoayBePSBFTkNPRElOR19DT05TVDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyArK2kpIHtcbiAgICAgICAgICAgIGNvbnN0IHYgPSAoY2hrID4+ICgoNSAtIGkpICogNSkpICYgMHgxZjtcbiAgICAgICAgICAgIHJlc3VsdCArPSBBTFBIQUJFVC5jaGFyQXQodik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgZnVuY3Rpb24gX19kZWNvZGUoc3RyLCBMSU1JVCkge1xuICAgICAgICBMSU1JVCA9IExJTUlUIHx8IDkwO1xuICAgICAgICBpZiAoc3RyLmxlbmd0aCA8IDgpXG4gICAgICAgICAgICByZXR1cm4gc3RyICsgJyB0b28gc2hvcnQnO1xuICAgICAgICBpZiAoc3RyLmxlbmd0aCA+IExJTUlUKVxuICAgICAgICAgICAgcmV0dXJuICdFeGNlZWRzIGxlbmd0aCBsaW1pdCc7XG4gICAgICAgIC8vIGRvbid0IGFsbG93IG1peGVkIGNhc2VcbiAgICAgICAgY29uc3QgbG93ZXJlZCA9IHN0ci50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCB1cHBlcmVkID0gc3RyLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIGlmIChzdHIgIT09IGxvd2VyZWQgJiYgc3RyICE9PSB1cHBlcmVkKVxuICAgICAgICAgICAgcmV0dXJuICdNaXhlZC1jYXNlIHN0cmluZyAnICsgc3RyO1xuICAgICAgICBzdHIgPSBsb3dlcmVkO1xuICAgICAgICBjb25zdCBzcGxpdCA9IHN0ci5sYXN0SW5kZXhPZignMScpO1xuICAgICAgICBpZiAoc3BsaXQgPT09IC0xKVxuICAgICAgICAgICAgcmV0dXJuICdObyBzZXBhcmF0b3IgY2hhcmFjdGVyIGZvciAnICsgc3RyO1xuICAgICAgICBpZiAoc3BsaXQgPT09IDApXG4gICAgICAgICAgICByZXR1cm4gJ01pc3NpbmcgcHJlZml4IGZvciAnICsgc3RyO1xuICAgICAgICBjb25zdCBwcmVmaXggPSBzdHIuc2xpY2UoMCwgc3BsaXQpO1xuICAgICAgICBjb25zdCB3b3JkQ2hhcnMgPSBzdHIuc2xpY2Uoc3BsaXQgKyAxKTtcbiAgICAgICAgaWYgKHdvcmRDaGFycy5sZW5ndGggPCA2KVxuICAgICAgICAgICAgcmV0dXJuICdEYXRhIHRvbyBzaG9ydCc7XG4gICAgICAgIGxldCBjaGsgPSBwcmVmaXhDaGsocHJlZml4KTtcbiAgICAgICAgaWYgKHR5cGVvZiBjaGsgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgcmV0dXJuIGNoaztcbiAgICAgICAgY29uc3Qgd29yZHMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3b3JkQ2hhcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGNvbnN0IGMgPSB3b3JkQ2hhcnMuY2hhckF0KGkpO1xuICAgICAgICAgICAgY29uc3QgdiA9IEFMUEhBQkVUX01BUFtjXTtcbiAgICAgICAgICAgIGlmICh2ID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuICdVbmtub3duIGNoYXJhY3RlciAnICsgYztcbiAgICAgICAgICAgIGNoayA9IHBvbHltb2RTdGVwKGNoaykgXiB2O1xuICAgICAgICAgICAgLy8gbm90IGluIHRoZSBjaGVja3N1bT9cbiAgICAgICAgICAgIGlmIChpICsgNiA+PSB3b3JkQ2hhcnMubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgd29yZHMucHVzaCh2KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hrICE9PSBFTkNPRElOR19DT05TVClcbiAgICAgICAgICAgIHJldHVybiAnSW52YWxpZCBjaGVja3N1bSBmb3IgJyArIHN0cjtcbiAgICAgICAgcmV0dXJuIHsgcHJlZml4LCB3b3JkcyB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZWNvZGVVbnNhZmUoc3RyLCBMSU1JVCkge1xuICAgICAgICBjb25zdCByZXMgPSBfX2RlY29kZShzdHIsIExJTUlUKTtcbiAgICAgICAgaWYgKHR5cGVvZiByZXMgPT09ICdvYmplY3QnKVxuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgZnVuY3Rpb24gZGVjb2RlKHN0ciwgTElNSVQpIHtcbiAgICAgICAgY29uc3QgcmVzID0gX19kZWNvZGUoc3RyLCBMSU1JVCk7XG4gICAgICAgIGlmICh0eXBlb2YgcmVzID09PSAnb2JqZWN0JylcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihyZXMpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBkZWNvZGVVbnNhZmUsXG4gICAgICAgIGRlY29kZSxcbiAgICAgICAgZW5jb2RlLFxuICAgICAgICB0b1dvcmRzLFxuICAgICAgICBmcm9tV29yZHNVbnNhZmUsXG4gICAgICAgIGZyb21Xb3JkcyxcbiAgICB9O1xufVxuZXhwb3J0cy5iZWNoMzIgPSBnZXRMaWJyYXJ5RnJvbUVuY29kaW5nKCdiZWNoMzInKTtcbmV4cG9ydHMuYmVjaDMybSA9IGdldExpYnJhcnlGcm9tRW5jb2RpbmcoJ2JlY2gzMm0nKTtcbiIsICIndXNlIHN0cmljdCdcblxuZXhwb3J0cy5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuZXhwb3J0cy50b0J5dGVBcnJheSA9IHRvQnl0ZUFycmF5XG5leHBvcnRzLmZyb21CeXRlQXJyYXkgPSBmcm9tQnl0ZUFycmF5XG5cbnZhciBsb29rdXAgPSBbXVxudmFyIHJldkxvb2t1cCA9IFtdXG52YXIgQXJyID0gdHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnID8gVWludDhBcnJheSA6IEFycmF5XG5cbnZhciBjb2RlID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nXG5mb3IgKHZhciBpID0gMCwgbGVuID0gY29kZS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICBsb29rdXBbaV0gPSBjb2RlW2ldXG4gIHJldkxvb2t1cFtjb2RlLmNoYXJDb2RlQXQoaSldID0gaVxufVxuXG4vLyBTdXBwb3J0IGRlY29kaW5nIFVSTC1zYWZlIGJhc2U2NCBzdHJpbmdzLCBhcyBOb2RlLmpzIGRvZXMuXG4vLyBTZWU6IGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Jhc2U2NCNVUkxfYXBwbGljYXRpb25zXG5yZXZMb29rdXBbJy0nLmNoYXJDb2RlQXQoMCldID0gNjJcbnJldkxvb2t1cFsnXycuY2hhckNvZGVBdCgwKV0gPSA2M1xuXG5mdW5jdGlvbiBnZXRMZW5zIChiNjQpIHtcbiAgdmFyIGxlbiA9IGI2NC5sZW5ndGhcblxuICBpZiAobGVuICUgNCA+IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuICB9XG5cbiAgLy8gVHJpbSBvZmYgZXh0cmEgYnl0ZXMgYWZ0ZXIgcGxhY2Vob2xkZXIgYnl0ZXMgYXJlIGZvdW5kXG4gIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2JlYXRnYW1taXQvYmFzZTY0LWpzL2lzc3Vlcy80MlxuICB2YXIgdmFsaWRMZW4gPSBiNjQuaW5kZXhPZignPScpXG4gIGlmICh2YWxpZExlbiA9PT0gLTEpIHZhbGlkTGVuID0gbGVuXG5cbiAgdmFyIHBsYWNlSG9sZGVyc0xlbiA9IHZhbGlkTGVuID09PSBsZW5cbiAgICA/IDBcbiAgICA6IDQgLSAodmFsaWRMZW4gJSA0KVxuXG4gIHJldHVybiBbdmFsaWRMZW4sIHBsYWNlSG9sZGVyc0xlbl1cbn1cblxuLy8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5mdW5jdGlvbiBieXRlTGVuZ3RoIChiNjQpIHtcbiAgdmFyIGxlbnMgPSBnZXRMZW5zKGI2NClcbiAgdmFyIHZhbGlkTGVuID0gbGVuc1swXVxuICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gbGVuc1sxXVxuICByZXR1cm4gKCh2YWxpZExlbiArIHBsYWNlSG9sZGVyc0xlbikgKiAzIC8gNCkgLSBwbGFjZUhvbGRlcnNMZW5cbn1cblxuZnVuY3Rpb24gX2J5dGVMZW5ndGggKGI2NCwgdmFsaWRMZW4sIHBsYWNlSG9sZGVyc0xlbikge1xuICByZXR1cm4gKCh2YWxpZExlbiArIHBsYWNlSG9sZGVyc0xlbikgKiAzIC8gNCkgLSBwbGFjZUhvbGRlcnNMZW5cbn1cblxuZnVuY3Rpb24gdG9CeXRlQXJyYXkgKGI2NCkge1xuICB2YXIgdG1wXG4gIHZhciBsZW5zID0gZ2V0TGVucyhiNjQpXG4gIHZhciB2YWxpZExlbiA9IGxlbnNbMF1cbiAgdmFyIHBsYWNlSG9sZGVyc0xlbiA9IGxlbnNbMV1cblxuICB2YXIgYXJyID0gbmV3IEFycihfYnl0ZUxlbmd0aChiNjQsIHZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW4pKVxuXG4gIHZhciBjdXJCeXRlID0gMFxuXG4gIC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcbiAgdmFyIGxlbiA9IHBsYWNlSG9sZGVyc0xlbiA+IDBcbiAgICA/IHZhbGlkTGVuIC0gNFxuICAgIDogdmFsaWRMZW5cblxuICB2YXIgaVxuICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpICs9IDQpIHtcbiAgICB0bXAgPVxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMTgpIHxcbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA8PCAxMikgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMildIDw8IDYpIHxcbiAgICAgIHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMyldXG4gICAgYXJyW2N1ckJ5dGUrK10gPSAodG1wID4+IDE2KSAmIDB4RkZcbiAgICBhcnJbY3VyQnl0ZSsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICBpZiAocGxhY2VIb2xkZXJzTGVuID09PSAyKSB7XG4gICAgdG1wID1cbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDIpIHxcbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA+PiA0KVxuICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMHhGRlxuICB9XG5cbiAgaWYgKHBsYWNlSG9sZGVyc0xlbiA9PT0gMSkge1xuICAgIHRtcCA9XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxMCkgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDQpIHxcbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDIpXSA+PiAyKVxuICAgIGFycltjdXJCeXRlKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBhcnJcbn1cblxuZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcbiAgcmV0dXJuIGxvb2t1cFtudW0gPj4gMTggJiAweDNGXSArXG4gICAgbG9va3VwW251bSA+PiAxMiAmIDB4M0ZdICtcbiAgICBsb29rdXBbbnVtID4+IDYgJiAweDNGXSArXG4gICAgbG9va3VwW251bSAmIDB4M0ZdXG59XG5cbmZ1bmN0aW9uIGVuY29kZUNodW5rICh1aW50OCwgc3RhcnQsIGVuZCkge1xuICB2YXIgdG1wXG4gIHZhciBvdXRwdXQgPSBbXVxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkgKz0gMykge1xuICAgIHRtcCA9XG4gICAgICAoKHVpbnQ4W2ldIDw8IDE2KSAmIDB4RkYwMDAwKSArXG4gICAgICAoKHVpbnQ4W2kgKyAxXSA8PCA4KSAmIDB4RkYwMCkgK1xuICAgICAgKHVpbnQ4W2kgKyAyXSAmIDB4RkYpXG4gICAgb3V0cHV0LnB1c2godHJpcGxldFRvQmFzZTY0KHRtcCkpXG4gIH1cbiAgcmV0dXJuIG91dHB1dC5qb2luKCcnKVxufVxuXG5mdW5jdGlvbiBmcm9tQnl0ZUFycmF5ICh1aW50OCkge1xuICB2YXIgdG1wXG4gIHZhciBsZW4gPSB1aW50OC5sZW5ndGhcbiAgdmFyIGV4dHJhQnl0ZXMgPSBsZW4gJSAzIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG4gIHZhciBwYXJ0cyA9IFtdXG4gIHZhciBtYXhDaHVua0xlbmd0aCA9IDE2MzgzIC8vIG11c3QgYmUgbXVsdGlwbGUgb2YgM1xuXG4gIC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcbiAgZm9yICh2YXIgaSA9IDAsIGxlbjIgPSBsZW4gLSBleHRyYUJ5dGVzOyBpIDwgbGVuMjsgaSArPSBtYXhDaHVua0xlbmd0aCkge1xuICAgIHBhcnRzLnB1c2goZW5jb2RlQ2h1bmsodWludDgsIGksIChpICsgbWF4Q2h1bmtMZW5ndGgpID4gbGVuMiA/IGxlbjIgOiAoaSArIG1heENodW5rTGVuZ3RoKSkpXG4gIH1cblxuICAvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG4gIGlmIChleHRyYUJ5dGVzID09PSAxKSB7XG4gICAgdG1wID0gdWludDhbbGVuIC0gMV1cbiAgICBwYXJ0cy5wdXNoKFxuICAgICAgbG9va3VwW3RtcCA+PiAyXSArXG4gICAgICBsb29rdXBbKHRtcCA8PCA0KSAmIDB4M0ZdICtcbiAgICAgICc9PSdcbiAgICApXG4gIH0gZWxzZSBpZiAoZXh0cmFCeXRlcyA9PT0gMikge1xuICAgIHRtcCA9ICh1aW50OFtsZW4gLSAyXSA8PCA4KSArIHVpbnQ4W2xlbiAtIDFdXG4gICAgcGFydHMucHVzaChcbiAgICAgIGxvb2t1cFt0bXAgPj4gMTBdICtcbiAgICAgIGxvb2t1cFsodG1wID4+IDQpICYgMHgzRl0gK1xuICAgICAgbG9va3VwWyh0bXAgPDwgMikgJiAweDNGXSArXG4gICAgICAnPSdcbiAgICApXG4gIH1cblxuICByZXR1cm4gcGFydHMuam9pbignJylcbn1cbiIsICIvKiEgaWVlZTc1NC4gQlNELTMtQ2xhdXNlIExpY2Vuc2UuIEZlcm9zcyBBYm91a2hhZGlqZWggPGh0dHBzOi8vZmVyb3NzLm9yZy9vcGVuc291cmNlPiAqL1xuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSAobkJ5dGVzICogOCkgLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSAoZSAqIDI1NikgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSAobSAqIDI1NikgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gKG5CeXRlcyAqIDgpIC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICgodmFsdWUgKiBjKSAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuIiwgIi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGh0dHBzOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG5jb25zdCBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG5jb25zdCBjdXN0b21JbnNwZWN0U3ltYm9sID1cbiAgKHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIFN5bWJvbFsnZm9yJ10gPT09ICdmdW5jdGlvbicpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZG90LW5vdGF0aW9uXG4gICAgPyBTeW1ib2xbJ2ZvciddKCdub2RlanMudXRpbC5pbnNwZWN0LmN1c3RvbScpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZG90LW5vdGF0aW9uXG4gICAgOiBudWxsXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBTbG93QnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcblxuY29uc3QgS19NQVhfTEVOR1RIID0gMHg3ZmZmZmZmZlxuZXhwb3J0cy5rTWF4TGVuZ3RoID0gS19NQVhfTEVOR1RIXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFByaW50IHdhcm5pbmcgYW5kIHJlY29tbWVuZCB1c2luZyBgYnVmZmVyYCB2NC54IHdoaWNoIGhhcyBhbiBPYmplY3RcbiAqICAgICAgICAgICAgICAgaW1wbGVtZW50YXRpb24gKG1vc3QgY29tcGF0aWJsZSwgZXZlbiBJRTYpXG4gKlxuICogQnJvd3NlcnMgdGhhdCBzdXBwb3J0IHR5cGVkIGFycmF5cyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLCBDaHJvbWUgNyssIFNhZmFyaSA1LjErLFxuICogT3BlcmEgMTEuNissIGlPUyA0LjIrLlxuICpcbiAqIFdlIHJlcG9ydCB0aGF0IHRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGlmIHRoZSBhcmUgbm90IHN1YmNsYXNzYWJsZVxuICogdXNpbmcgX19wcm90b19fLiBGaXJlZm94IDQtMjkgbGFja3Mgc3VwcG9ydCBmb3IgYWRkaW5nIG5ldyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YFxuICogKFNlZTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4KS4gSUUgMTAgbGFja3Mgc3VwcG9ydFxuICogZm9yIF9fcHJvdG9fXyBhbmQgaGFzIGEgYnVnZ3kgdHlwZWQgYXJyYXkgaW1wbGVtZW50YXRpb24uXG4gKi9cbkJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUID0gdHlwZWRBcnJheVN1cHBvcnQoKVxuXG5pZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmIHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBjb25zb2xlLmVycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gIGNvbnNvbGUuZXJyb3IoXG4gICAgJ1RoaXMgYnJvd3NlciBsYWNrcyB0eXBlZCBhcnJheSAoVWludDhBcnJheSkgc3VwcG9ydCB3aGljaCBpcyByZXF1aXJlZCBieSAnICtcbiAgICAnYGJ1ZmZlcmAgdjUueC4gVXNlIGBidWZmZXJgIHY0LnggaWYgeW91IHJlcXVpcmUgb2xkIGJyb3dzZXIgc3VwcG9ydC4nXG4gIClcbn1cblxuZnVuY3Rpb24gdHlwZWRBcnJheVN1cHBvcnQgKCkge1xuICAvLyBDYW4gdHlwZWQgYXJyYXkgaW5zdGFuY2VzIGNhbiBiZSBhdWdtZW50ZWQ/XG4gIHRyeSB7XG4gICAgY29uc3QgYXJyID0gbmV3IFVpbnQ4QXJyYXkoMSlcbiAgICBjb25zdCBwcm90byA9IHsgZm9vOiBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9IH1cbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YocHJvdG8sIFVpbnQ4QXJyYXkucHJvdG90eXBlKVxuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihhcnIsIHByb3RvKVxuICAgIHJldHVybiBhcnIuZm9vKCkgPT09IDQyXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQnVmZmVyLnByb3RvdHlwZSwgJ3BhcmVudCcsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGhpcykpIHJldHVybiB1bmRlZmluZWRcbiAgICByZXR1cm4gdGhpcy5idWZmZXJcbiAgfVxufSlcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEJ1ZmZlci5wcm90b3R5cGUsICdvZmZzZXQnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKHRoaXMpKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgcmV0dXJuIHRoaXMuYnl0ZU9mZnNldFxuICB9XG59KVxuXG5mdW5jdGlvbiBjcmVhdGVCdWZmZXIgKGxlbmd0aCkge1xuICBpZiAobGVuZ3RoID4gS19NQVhfTEVOR1RIKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RoZSB2YWx1ZSBcIicgKyBsZW5ndGggKyAnXCIgaXMgaW52YWxpZCBmb3Igb3B0aW9uIFwic2l6ZVwiJylcbiAgfVxuICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZVxuICBjb25zdCBidWYgPSBuZXcgVWludDhBcnJheShsZW5ndGgpXG4gIE9iamVjdC5zZXRQcm90b3R5cGVPZihidWYsIEJ1ZmZlci5wcm90b3R5cGUpXG4gIHJldHVybiBidWZcbn1cblxuLyoqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGhhdmUgdGhlaXJcbiAqIHByb3RvdHlwZSBjaGFuZ2VkIHRvIGBCdWZmZXIucHJvdG90eXBlYC4gRnVydGhlcm1vcmUsIGBCdWZmZXJgIGlzIGEgc3ViY2xhc3Mgb2ZcbiAqIGBVaW50OEFycmF5YCwgc28gdGhlIHJldHVybmVkIGluc3RhbmNlcyB3aWxsIGhhdmUgYWxsIHRoZSBub2RlIGBCdWZmZXJgIG1ldGhvZHNcbiAqIGFuZCB0aGUgYFVpbnQ4QXJyYXlgIG1ldGhvZHMuIFNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0XG4gKiByZXR1cm5zIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIFRoZSBgVWludDhBcnJheWAgcHJvdG90eXBlIHJlbWFpbnMgdW5tb2RpZmllZC5cbiAqL1xuXG5mdW5jdGlvbiBCdWZmZXIgKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIC8vIENvbW1vbiBjYXNlLlxuICBpZiAodHlwZW9mIGFyZyA9PT0gJ251bWJlcicpIHtcbiAgICBpZiAodHlwZW9mIGVuY29kaW5nT3JPZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAnVGhlIFwic3RyaW5nXCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIHN0cmluZy4gUmVjZWl2ZWQgdHlwZSBudW1iZXInXG4gICAgICApXG4gICAgfVxuICAgIHJldHVybiBhbGxvY1Vuc2FmZShhcmcpXG4gIH1cbiAgcmV0dXJuIGZyb20oYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTIgLy8gbm90IHVzZWQgYnkgdGhpcyBpbXBsZW1lbnRhdGlvblxuXG5mdW5jdGlvbiBmcm9tICh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZyb21TdHJpbmcodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQpXG4gIH1cblxuICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHZhbHVlKSkge1xuICAgIHJldHVybiBmcm9tQXJyYXlWaWV3KHZhbHVlKVxuICB9XG5cbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksICcgK1xuICAgICAgJ29yIEFycmF5LWxpa2UgT2JqZWN0LiBSZWNlaXZlZCB0eXBlICcgKyAodHlwZW9mIHZhbHVlKVxuICAgIClcbiAgfVxuXG4gIGlmIChpc0luc3RhbmNlKHZhbHVlLCBBcnJheUJ1ZmZlcikgfHxcbiAgICAgICh2YWx1ZSAmJiBpc0luc3RhbmNlKHZhbHVlLmJ1ZmZlciwgQXJyYXlCdWZmZXIpKSkge1xuICAgIHJldHVybiBmcm9tQXJyYXlCdWZmZXIodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmICh0eXBlb2YgU2hhcmVkQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAoaXNJbnN0YW5jZSh2YWx1ZSwgU2hhcmVkQXJyYXlCdWZmZXIpIHx8XG4gICAgICAodmFsdWUgJiYgaXNJbnN0YW5jZSh2YWx1ZS5idWZmZXIsIFNoYXJlZEFycmF5QnVmZmVyKSkpKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheUJ1ZmZlcih2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBcInZhbHVlXCIgYXJndW1lbnQgbXVzdCBub3QgYmUgb2YgdHlwZSBudW1iZXIuIFJlY2VpdmVkIHR5cGUgbnVtYmVyJ1xuICAgIClcbiAgfVxuXG4gIGNvbnN0IHZhbHVlT2YgPSB2YWx1ZS52YWx1ZU9mICYmIHZhbHVlLnZhbHVlT2YoKVxuICBpZiAodmFsdWVPZiAhPSBudWxsICYmIHZhbHVlT2YgIT09IHZhbHVlKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHZhbHVlT2YsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGNvbnN0IGIgPSBmcm9tT2JqZWN0KHZhbHVlKVxuICBpZiAoYikgcmV0dXJuIGJcblxuICBpZiAodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvUHJpbWl0aXZlICE9IG51bGwgJiZcbiAgICAgIHR5cGVvZiB2YWx1ZVtTeW1ib2wudG9QcmltaXRpdmVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHZhbHVlW1N5bWJvbC50b1ByaW1pdGl2ZV0oJ3N0cmluZycpLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICdUaGUgZmlyc3QgYXJndW1lbnQgbXVzdCBiZSBvbmUgb2YgdHlwZSBzdHJpbmcsIEJ1ZmZlciwgQXJyYXlCdWZmZXIsIEFycmF5LCAnICtcbiAgICAnb3IgQXJyYXktbGlrZSBPYmplY3QuIFJlY2VpdmVkIHR5cGUgJyArICh0eXBlb2YgdmFsdWUpXG4gIClcbn1cblxuLyoqXG4gKiBGdW5jdGlvbmFsbHkgZXF1aXZhbGVudCB0byBCdWZmZXIoYXJnLCBlbmNvZGluZykgYnV0IHRocm93cyBhIFR5cGVFcnJvclxuICogaWYgdmFsdWUgaXMgYSBudW1iZXIuXG4gKiBCdWZmZXIuZnJvbShzdHJbLCBlbmNvZGluZ10pXG4gKiBCdWZmZXIuZnJvbShhcnJheSlcbiAqIEJ1ZmZlci5mcm9tKGJ1ZmZlcilcbiAqIEJ1ZmZlci5mcm9tKGFycmF5QnVmZmVyWywgYnl0ZU9mZnNldFssIGxlbmd0aF1dKVxuICoqL1xuQnVmZmVyLmZyb20gPSBmdW5jdGlvbiAodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gZnJvbSh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG4vLyBOb3RlOiBDaGFuZ2UgcHJvdG90eXBlICphZnRlciogQnVmZmVyLmZyb20gaXMgZGVmaW5lZCB0byB3b3JrYXJvdW5kIENocm9tZSBidWc6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9wdWxsLzE0OFxuT2JqZWN0LnNldFByb3RvdHlwZU9mKEJ1ZmZlci5wcm90b3R5cGUsIFVpbnQ4QXJyYXkucHJvdG90eXBlKVxuT2JqZWN0LnNldFByb3RvdHlwZU9mKEJ1ZmZlciwgVWludDhBcnJheSlcblxuZnVuY3Rpb24gYXNzZXJ0U2l6ZSAoc2l6ZSkge1xuICBpZiAodHlwZW9mIHNpemUgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJzaXplXCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIG51bWJlcicpXG4gIH0gZWxzZSBpZiAoc2l6ZSA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVGhlIHZhbHVlIFwiJyArIHNpemUgKyAnXCIgaXMgaW52YWxpZCBmb3Igb3B0aW9uIFwic2l6ZVwiJylcbiAgfVxufVxuXG5mdW5jdGlvbiBhbGxvYyAoc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgYXNzZXJ0U2l6ZShzaXplKVxuICBpZiAoc2l6ZSA8PSAwKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcihzaXplKVxuICB9XG4gIGlmIChmaWxsICE9PSB1bmRlZmluZWQpIHtcbiAgICAvLyBPbmx5IHBheSBhdHRlbnRpb24gdG8gZW5jb2RpbmcgaWYgaXQncyBhIHN0cmluZy4gVGhpc1xuICAgIC8vIHByZXZlbnRzIGFjY2lkZW50YWxseSBzZW5kaW5nIGluIGEgbnVtYmVyIHRoYXQgd291bGRcbiAgICAvLyBiZSBpbnRlcnByZXRlZCBhcyBhIHN0YXJ0IG9mZnNldC5cbiAgICByZXR1cm4gdHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJ1xuICAgICAgPyBjcmVhdGVCdWZmZXIoc2l6ZSkuZmlsbChmaWxsLCBlbmNvZGluZylcbiAgICAgIDogY3JlYXRlQnVmZmVyKHNpemUpLmZpbGwoZmlsbClcbiAgfVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBmaWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICogYWxsb2Moc2l6ZVssIGZpbGxbLCBlbmNvZGluZ11dKVxuICoqL1xuQnVmZmVyLmFsbG9jID0gZnVuY3Rpb24gKHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIHJldHVybiBhbGxvYyhzaXplLCBmaWxsLCBlbmNvZGluZylcbn1cblxuZnVuY3Rpb24gYWxsb2NVbnNhZmUgKHNpemUpIHtcbiAgYXNzZXJ0U2l6ZShzaXplKVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUgPCAwID8gMCA6IGNoZWNrZWQoc2l6ZSkgfCAwKVxufVxuXG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gQnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiAqL1xuQnVmZmVyLmFsbG9jVW5zYWZlID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKHNpemUpXG59XG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gU2xvd0J1ZmZlcihudW0pLCBieSBkZWZhdWx0IGNyZWF0ZXMgYSBub24temVyby1maWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICovXG5CdWZmZXIuYWxsb2NVbnNhZmVTbG93ID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKHNpemUpXG59XG5cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycgfHwgZW5jb2RpbmcgPT09ICcnKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgfVxuXG4gIGlmICghQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICB9XG5cbiAgY29uc3QgbGVuZ3RoID0gYnl0ZUxlbmd0aChzdHJpbmcsIGVuY29kaW5nKSB8IDBcbiAgbGV0IGJ1ZiA9IGNyZWF0ZUJ1ZmZlcihsZW5ndGgpXG5cbiAgY29uc3QgYWN0dWFsID0gYnVmLndyaXRlKHN0cmluZywgZW5jb2RpbmcpXG5cbiAgaWYgKGFjdHVhbCAhPT0gbGVuZ3RoKSB7XG4gICAgLy8gV3JpdGluZyBhIGhleCBzdHJpbmcsIGZvciBleGFtcGxlLCB0aGF0IGNvbnRhaW5zIGludmFsaWQgY2hhcmFjdGVycyB3aWxsXG4gICAgLy8gY2F1c2UgZXZlcnl0aGluZyBhZnRlciB0aGUgZmlyc3QgaW52YWxpZCBjaGFyYWN0ZXIgdG8gYmUgaWdub3JlZC4gKGUuZy5cbiAgICAvLyAnYWJ4eGNkJyB3aWxsIGJlIHRyZWF0ZWQgYXMgJ2FiJylcbiAgICBidWYgPSBidWYuc2xpY2UoMCwgYWN0dWFsKVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG5mdW5jdGlvbiBmcm9tQXJyYXlMaWtlIChhcnJheSkge1xuICBjb25zdCBsZW5ndGggPSBhcnJheS5sZW5ndGggPCAwID8gMCA6IGNoZWNrZWQoYXJyYXkubGVuZ3RoKSB8IDBcbiAgY29uc3QgYnVmID0gY3JlYXRlQnVmZmVyKGxlbmd0aClcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIGJ1ZltpXSA9IGFycmF5W2ldICYgMjU1XG4gIH1cbiAgcmV0dXJuIGJ1ZlxufVxuXG5mdW5jdGlvbiBmcm9tQXJyYXlWaWV3IChhcnJheVZpZXcpIHtcbiAgaWYgKGlzSW5zdGFuY2UoYXJyYXlWaWV3LCBVaW50OEFycmF5KSkge1xuICAgIGNvbnN0IGNvcHkgPSBuZXcgVWludDhBcnJheShhcnJheVZpZXcpXG4gICAgcmV0dXJuIGZyb21BcnJheUJ1ZmZlcihjb3B5LmJ1ZmZlciwgY29weS5ieXRlT2Zmc2V0LCBjb3B5LmJ5dGVMZW5ndGgpXG4gIH1cbiAgcmV0dXJuIGZyb21BcnJheUxpa2UoYXJyYXlWaWV3KVxufVxuXG5mdW5jdGlvbiBmcm9tQXJyYXlCdWZmZXIgKGFycmF5LCBieXRlT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKGJ5dGVPZmZzZXQgPCAwIHx8IGFycmF5LmJ5dGVMZW5ndGggPCBieXRlT2Zmc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1wib2Zmc2V0XCIgaXMgb3V0c2lkZSBvZiBidWZmZXIgYm91bmRzJylcbiAgfVxuXG4gIGlmIChhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCArIChsZW5ndGggfHwgMCkpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJsZW5ndGhcIiBpcyBvdXRzaWRlIG9mIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgbGV0IGJ1ZlxuICBpZiAoYnl0ZU9mZnNldCA9PT0gdW5kZWZpbmVkICYmIGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXkpXG4gIH0gZWxzZSBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBidWYgPSBuZXcgVWludDhBcnJheShhcnJheSwgYnl0ZU9mZnNldClcbiAgfSBlbHNlIHtcbiAgICBidWYgPSBuZXcgVWludDhBcnJheShhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGJ1ZiwgQnVmZmVyLnByb3RvdHlwZSlcblxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21PYmplY3QgKG9iaikge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKG9iaikpIHtcbiAgICBjb25zdCBsZW4gPSBjaGVja2VkKG9iai5sZW5ndGgpIHwgMFxuICAgIGNvbnN0IGJ1ZiA9IGNyZWF0ZUJ1ZmZlcihsZW4pXG5cbiAgICBpZiAoYnVmLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGJ1ZlxuICAgIH1cblxuICAgIG9iai5jb3B5KGJ1ZiwgMCwgMCwgbGVuKVxuICAgIHJldHVybiBidWZcbiAgfVxuXG4gIGlmIChvYmoubGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAodHlwZW9mIG9iai5sZW5ndGggIT09ICdudW1iZXInIHx8IG51bWJlcklzTmFOKG9iai5sZW5ndGgpKSB7XG4gICAgICByZXR1cm4gY3JlYXRlQnVmZmVyKDApXG4gICAgfVxuICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKG9iailcbiAgfVxuXG4gIGlmIChvYmoudHlwZSA9PT0gJ0J1ZmZlcicgJiYgQXJyYXkuaXNBcnJheShvYmouZGF0YSkpIHtcbiAgICByZXR1cm4gZnJvbUFycmF5TGlrZShvYmouZGF0YSlcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja2VkIChsZW5ndGgpIHtcbiAgLy8gTm90ZTogY2Fubm90IHVzZSBgbGVuZ3RoIDwgS19NQVhfTEVOR1RIYCBoZXJlIGJlY2F1c2UgdGhhdCBmYWlscyB3aGVuXG4gIC8vIGxlbmd0aCBpcyBOYU4gKHdoaWNoIGlzIG90aGVyd2lzZSBjb2VyY2VkIHRvIHplcm8uKVxuICBpZiAobGVuZ3RoID49IEtfTUFYX0xFTkdUSCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIGFsbG9jYXRlIEJ1ZmZlciBsYXJnZXIgdGhhbiBtYXhpbXVtICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdzaXplOiAweCcgKyBLX01BWF9MRU5HVEgudG9TdHJpbmcoMTYpICsgJyBieXRlcycpXG4gIH1cbiAgcmV0dXJuIGxlbmd0aCB8IDBcbn1cblxuZnVuY3Rpb24gU2xvd0J1ZmZlciAobGVuZ3RoKSB7XG4gIGlmICgrbGVuZ3RoICE9IGxlbmd0aCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGVxZXFlcVxuICAgIGxlbmd0aCA9IDBcbiAgfVxuICByZXR1cm4gQnVmZmVyLmFsbG9jKCtsZW5ndGgpXG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIGlzQnVmZmVyIChiKSB7XG4gIHJldHVybiBiICE9IG51bGwgJiYgYi5faXNCdWZmZXIgPT09IHRydWUgJiZcbiAgICBiICE9PSBCdWZmZXIucHJvdG90eXBlIC8vIHNvIEJ1ZmZlci5pc0J1ZmZlcihCdWZmZXIucHJvdG90eXBlKSB3aWxsIGJlIGZhbHNlXG59XG5cbkJ1ZmZlci5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAoYSwgYikge1xuICBpZiAoaXNJbnN0YW5jZShhLCBVaW50OEFycmF5KSkgYSA9IEJ1ZmZlci5mcm9tKGEsIGEub2Zmc2V0LCBhLmJ5dGVMZW5ndGgpXG4gIGlmIChpc0luc3RhbmNlKGIsIFVpbnQ4QXJyYXkpKSBiID0gQnVmZmVyLmZyb20oYiwgYi5vZmZzZXQsIGIuYnl0ZUxlbmd0aClcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYSkgfHwgIUJ1ZmZlci5pc0J1ZmZlcihiKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIFwiYnVmMVwiLCBcImJ1ZjJcIiBhcmd1bWVudHMgbXVzdCBiZSBvbmUgb2YgdHlwZSBCdWZmZXIgb3IgVWludDhBcnJheSdcbiAgICApXG4gIH1cblxuICBpZiAoYSA9PT0gYikgcmV0dXJuIDBcblxuICBsZXQgeCA9IGEubGVuZ3RoXG4gIGxldCB5ID0gYi5sZW5ndGhcblxuICBmb3IgKGxldCBpID0gMCwgbGVuID0gTWF0aC5taW4oeCwgeSk7IGkgPCBsZW47ICsraSkge1xuICAgIGlmIChhW2ldICE9PSBiW2ldKSB7XG4gICAgICB4ID0gYVtpXVxuICAgICAgeSA9IGJbaV1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIGlzRW5jb2RpbmcgKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gY29uY2F0IChsaXN0LCBsZW5ndGgpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3QpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0XCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJylcbiAgfVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBCdWZmZXIuYWxsb2MoMClcbiAgfVxuXG4gIGxldCBpXG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGxlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgbGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmFsbG9jVW5zYWZlKGxlbmd0aClcbiAgbGV0IHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICBsZXQgYnVmID0gbGlzdFtpXVxuICAgIGlmIChpc0luc3RhbmNlKGJ1ZiwgVWludDhBcnJheSkpIHtcbiAgICAgIGlmIChwb3MgKyBidWYubGVuZ3RoID4gYnVmZmVyLmxlbmd0aCkge1xuICAgICAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSBidWYgPSBCdWZmZXIuZnJvbShidWYpXG4gICAgICAgIGJ1Zi5jb3B5KGJ1ZmZlciwgcG9zKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgVWludDhBcnJheS5wcm90b3R5cGUuc2V0LmNhbGwoXG4gICAgICAgICAgYnVmZmVyLFxuICAgICAgICAgIGJ1ZixcbiAgICAgICAgICBwb3NcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICAgIH0gZWxzZSB7XG4gICAgICBidWYuY29weShidWZmZXIsIHBvcylcbiAgICB9XG4gICAgcG9zICs9IGJ1Zi5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmZmVyXG59XG5cbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdHJpbmcpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5sZW5ndGhcbiAgfVxuICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHN0cmluZykgfHwgaXNJbnN0YW5jZShzdHJpbmcsIEFycmF5QnVmZmVyKSkge1xuICAgIHJldHVybiBzdHJpbmcuYnl0ZUxlbmd0aFxuICB9XG4gIGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIFwic3RyaW5nXCIgYXJndW1lbnQgbXVzdCBiZSBvbmUgb2YgdHlwZSBzdHJpbmcsIEJ1ZmZlciwgb3IgQXJyYXlCdWZmZXIuICcgK1xuICAgICAgJ1JlY2VpdmVkIHR5cGUgJyArIHR5cGVvZiBzdHJpbmdcbiAgICApXG4gIH1cblxuICBjb25zdCBsZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGNvbnN0IG11c3RNYXRjaCA9IChhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gPT09IHRydWUpXG4gIGlmICghbXVzdE1hdGNoICYmIGxlbiA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBVc2UgYSBmb3IgbG9vcCB0byBhdm9pZCByZWN1cnNpb25cbiAgbGV0IGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGVuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gbGVuICogMlxuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGxlbiA+Pj4gMVxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkge1xuICAgICAgICAgIHJldHVybiBtdXN0TWF0Y2ggPyAtMSA6IHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoIC8vIGFzc3VtZSB1dGY4XG4gICAgICAgIH1cbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuXG5mdW5jdGlvbiBzbG93VG9TdHJpbmcgKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIGxldCBsb3dlcmVkQ2FzZSA9IGZhbHNlXG5cbiAgLy8gTm8gbmVlZCB0byB2ZXJpZnkgdGhhdCBcInRoaXMubGVuZ3RoIDw9IE1BWF9VSU5UMzJcIiBzaW5jZSBpdCdzIGEgcmVhZC1vbmx5XG4gIC8vIHByb3BlcnR5IG9mIGEgdHlwZWQgYXJyYXkuXG5cbiAgLy8gVGhpcyBiZWhhdmVzIG5laXRoZXIgbGlrZSBTdHJpbmcgbm9yIFVpbnQ4QXJyYXkgaW4gdGhhdCB3ZSBzZXQgc3RhcnQvZW5kXG4gIC8vIHRvIHRoZWlyIHVwcGVyL2xvd2VyIGJvdW5kcyBpZiB0aGUgdmFsdWUgcGFzc2VkIGlzIG91dCBvZiByYW5nZS5cbiAgLy8gdW5kZWZpbmVkIGlzIGhhbmRsZWQgc3BlY2lhbGx5IGFzIHBlciBFQ01BLTI2MiA2dGggRWRpdGlvbixcbiAgLy8gU2VjdGlvbiAxMy4zLjMuNyBSdW50aW1lIFNlbWFudGljczogS2V5ZWRCaW5kaW5nSW5pdGlhbGl6YXRpb24uXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkIHx8IHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIC8vIFJldHVybiBlYXJseSBpZiBzdGFydCA+IHRoaXMubGVuZ3RoLiBEb25lIGhlcmUgdG8gcHJldmVudCBwb3RlbnRpYWwgdWludDMyXG4gIC8vIGNvZXJjaW9uIGZhaWwgYmVsb3cuXG4gIGlmIChzdGFydCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoZW5kID09PSB1bmRlZmluZWQgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKGVuZCA8PSAwKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICAvLyBGb3JjZSBjb2VyY2lvbiB0byB1aW50MzIuIFRoaXMgd2lsbCBhbHNvIGNvZXJjZSBmYWxzZXkvTmFOIHZhbHVlcyB0byAwLlxuICBlbmQgPj4+PSAwXG4gIHN0YXJ0ID4+Pj0gMFxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxhdGluMVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdXRmMTZsZVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9IChlbmNvZGluZyArICcnKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG4vLyBUaGlzIHByb3BlcnR5IGlzIHVzZWQgYnkgYEJ1ZmZlci5pc0J1ZmZlcmAgKGFuZCB0aGUgYGlzLWJ1ZmZlcmAgbnBtIHBhY2thZ2UpXG4vLyB0byBkZXRlY3QgYSBCdWZmZXIgaW5zdGFuY2UuIEl0J3Mgbm90IHBvc3NpYmxlIHRvIHVzZSBgaW5zdGFuY2VvZiBCdWZmZXJgXG4vLyByZWxpYWJseSBpbiBhIGJyb3dzZXJpZnkgY29udGV4dCBiZWNhdXNlIHRoZXJlIGNvdWxkIGJlIG11bHRpcGxlIGRpZmZlcmVudFxuLy8gY29waWVzIG9mIHRoZSAnYnVmZmVyJyBwYWNrYWdlIGluIHVzZS4gVGhpcyBtZXRob2Qgd29ya3MgZXZlbiBmb3IgQnVmZmVyXG4vLyBpbnN0YW5jZXMgdGhhdCB3ZXJlIGNyZWF0ZWQgZnJvbSBhbm90aGVyIGNvcHkgb2YgdGhlIGBidWZmZXJgIHBhY2thZ2UuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL2lzc3Vlcy8xNTRcbkJ1ZmZlci5wcm90b3R5cGUuX2lzQnVmZmVyID0gdHJ1ZVxuXG5mdW5jdGlvbiBzd2FwIChiLCBuLCBtKSB7XG4gIGNvbnN0IGkgPSBiW25dXG4gIGJbbl0gPSBiW21dXG4gIGJbbV0gPSBpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDE2ID0gZnVuY3Rpb24gc3dhcDE2ICgpIHtcbiAgY29uc3QgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDIgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDE2LWJpdHMnKVxuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpICs9IDIpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAxKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDMyID0gZnVuY3Rpb24gc3dhcDMyICgpIHtcbiAgY29uc3QgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDQgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDMyLWJpdHMnKVxuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpICs9IDQpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAzKVxuICAgIHN3YXAodGhpcywgaSArIDEsIGkgKyAyKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDY0ID0gZnVuY3Rpb24gc3dhcDY0ICgpIHtcbiAgY29uc3QgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDggIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDY0LWJpdHMnKVxuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpICs9IDgpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyA3KVxuICAgIHN3YXAodGhpcywgaSArIDEsIGkgKyA2KVxuICAgIHN3YXAodGhpcywgaSArIDIsIGkgKyA1KVxuICAgIHN3YXAodGhpcywgaSArIDMsIGkgKyA0KVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyAoKSB7XG4gIGNvbnN0IGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW5ndGggPT09IDApIHJldHVybiAnJ1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCAwLCBsZW5ndGgpXG4gIHJldHVybiBzbG93VG9TdHJpbmcuYXBwbHkodGhpcywgYXJndW1lbnRzKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvTG9jYWxlU3RyaW5nID0gQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZ1xuXG5CdWZmZXIucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyAoYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIGlmICh0aGlzID09PSBiKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gQnVmZmVyLmNvbXBhcmUodGhpcywgYikgPT09IDBcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gaW5zcGVjdCAoKSB7XG4gIGxldCBzdHIgPSAnJ1xuICBjb25zdCBtYXggPSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTXG4gIHN0ciA9IHRoaXMudG9TdHJpbmcoJ2hleCcsIDAsIG1heCkucmVwbGFjZSgvKC57Mn0pL2csICckMSAnKS50cmltKClcbiAgaWYgKHRoaXMubGVuZ3RoID4gbWF4KSBzdHIgKz0gJyAuLi4gJ1xuICByZXR1cm4gJzxCdWZmZXIgJyArIHN0ciArICc+J1xufVxuaWYgKGN1c3RvbUluc3BlY3RTeW1ib2wpIHtcbiAgQnVmZmVyLnByb3RvdHlwZVtjdXN0b21JbnNwZWN0U3ltYm9sXSA9IEJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlICh0YXJnZXQsIHN0YXJ0LCBlbmQsIHRoaXNTdGFydCwgdGhpc0VuZCkge1xuICBpZiAoaXNJbnN0YW5jZSh0YXJnZXQsIFVpbnQ4QXJyYXkpKSB7XG4gICAgdGFyZ2V0ID0gQnVmZmVyLmZyb20odGFyZ2V0LCB0YXJnZXQub2Zmc2V0LCB0YXJnZXQuYnl0ZUxlbmd0aClcbiAgfVxuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0YXJnZXQpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJ0YXJnZXRcIiBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIEJ1ZmZlciBvciBVaW50OEFycmF5LiAnICtcbiAgICAgICdSZWNlaXZlZCB0eXBlICcgKyAodHlwZW9mIHRhcmdldClcbiAgICApXG4gIH1cblxuICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuZCA9IHRhcmdldCA/IHRhcmdldC5sZW5ndGggOiAwXG4gIH1cbiAgaWYgKHRoaXNTdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc1N0YXJ0ID0gMFxuICB9XG4gIGlmICh0aGlzRW5kID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzRW5kID0gdGhpcy5sZW5ndGhcbiAgfVxuXG4gIGlmIChzdGFydCA8IDAgfHwgZW5kID4gdGFyZ2V0Lmxlbmd0aCB8fCB0aGlzU3RhcnQgPCAwIHx8IHRoaXNFbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdvdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKHRoaXNTdGFydCA+PSB0aGlzRW5kICYmIHN0YXJ0ID49IGVuZCkge1xuICAgIHJldHVybiAwXG4gIH1cbiAgaWYgKHRoaXNTdGFydCA+PSB0aGlzRW5kKSB7XG4gICAgcmV0dXJuIC0xXG4gIH1cbiAgaWYgKHN0YXJ0ID49IGVuZCkge1xuICAgIHJldHVybiAxXG4gIH1cblxuICBzdGFydCA+Pj49IDBcbiAgZW5kID4+Pj0gMFxuICB0aGlzU3RhcnQgPj4+PSAwXG4gIHRoaXNFbmQgPj4+PSAwXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCkgcmV0dXJuIDBcblxuICBsZXQgeCA9IHRoaXNFbmQgLSB0aGlzU3RhcnRcbiAgbGV0IHkgPSBlbmQgLSBzdGFydFxuICBjb25zdCBsZW4gPSBNYXRoLm1pbih4LCB5KVxuXG4gIGNvbnN0IHRoaXNDb3B5ID0gdGhpcy5zbGljZSh0aGlzU3RhcnQsIHRoaXNFbmQpXG4gIGNvbnN0IHRhcmdldENvcHkgPSB0YXJnZXQuc2xpY2Uoc3RhcnQsIGVuZClcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKHRoaXNDb3B5W2ldICE9PSB0YXJnZXRDb3B5W2ldKSB7XG4gICAgICB4ID0gdGhpc0NvcHlbaV1cbiAgICAgIHkgPSB0YXJnZXRDb3B5W2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuLy8gRmluZHMgZWl0aGVyIHRoZSBmaXJzdCBpbmRleCBvZiBgdmFsYCBpbiBgYnVmZmVyYCBhdCBvZmZzZXQgPj0gYGJ5dGVPZmZzZXRgLFxuLy8gT1IgdGhlIGxhc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0IDw9IGBieXRlT2Zmc2V0YC5cbi8vXG4vLyBBcmd1bWVudHM6XG4vLyAtIGJ1ZmZlciAtIGEgQnVmZmVyIHRvIHNlYXJjaFxuLy8gLSB2YWwgLSBhIHN0cmluZywgQnVmZmVyLCBvciBudW1iZXJcbi8vIC0gYnl0ZU9mZnNldCAtIGFuIGluZGV4IGludG8gYGJ1ZmZlcmA7IHdpbGwgYmUgY2xhbXBlZCB0byBhbiBpbnQzMlxuLy8gLSBlbmNvZGluZyAtIGFuIG9wdGlvbmFsIGVuY29kaW5nLCByZWxldmFudCBpcyB2YWwgaXMgYSBzdHJpbmdcbi8vIC0gZGlyIC0gdHJ1ZSBmb3IgaW5kZXhPZiwgZmFsc2UgZm9yIGxhc3RJbmRleE9mXG5mdW5jdGlvbiBiaWRpcmVjdGlvbmFsSW5kZXhPZiAoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpIHtcbiAgLy8gRW1wdHkgYnVmZmVyIG1lYW5zIG5vIG1hdGNoXG4gIGlmIChidWZmZXIubGVuZ3RoID09PSAwKSByZXR1cm4gLTFcblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldFxuICBpZiAodHlwZW9mIGJ5dGVPZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBieXRlT2Zmc2V0XG4gICAgYnl0ZU9mZnNldCA9IDBcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0ID4gMHg3ZmZmZmZmZikge1xuICAgIGJ5dGVPZmZzZXQgPSAweDdmZmZmZmZmXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA8IC0weDgwMDAwMDAwKSB7XG4gICAgYnl0ZU9mZnNldCA9IC0weDgwMDAwMDAwXG4gIH1cbiAgYnl0ZU9mZnNldCA9ICtieXRlT2Zmc2V0IC8vIENvZXJjZSB0byBOdW1iZXIuXG4gIGlmIChudW1iZXJJc05hTihieXRlT2Zmc2V0KSkge1xuICAgIC8vIGJ5dGVPZmZzZXQ6IGl0IGl0J3MgdW5kZWZpbmVkLCBudWxsLCBOYU4sIFwiZm9vXCIsIGV0Yywgc2VhcmNoIHdob2xlIGJ1ZmZlclxuICAgIGJ5dGVPZmZzZXQgPSBkaXIgPyAwIDogKGJ1ZmZlci5sZW5ndGggLSAxKVxuICB9XG5cbiAgLy8gTm9ybWFsaXplIGJ5dGVPZmZzZXQ6IG5lZ2F0aXZlIG9mZnNldHMgc3RhcnQgZnJvbSB0aGUgZW5kIG9mIHRoZSBidWZmZXJcbiAgaWYgKGJ5dGVPZmZzZXQgPCAwKSBieXRlT2Zmc2V0ID0gYnVmZmVyLmxlbmd0aCArIGJ5dGVPZmZzZXRcbiAgaWYgKGJ5dGVPZmZzZXQgPj0gYnVmZmVyLmxlbmd0aCkge1xuICAgIGlmIChkaXIpIHJldHVybiAtMVxuICAgIGVsc2UgYnl0ZU9mZnNldCA9IGJ1ZmZlci5sZW5ndGggLSAxXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA8IDApIHtcbiAgICBpZiAoZGlyKSBieXRlT2Zmc2V0ID0gMFxuICAgIGVsc2UgcmV0dXJuIC0xXG4gIH1cblxuICAvLyBOb3JtYWxpemUgdmFsXG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIHZhbCA9IEJ1ZmZlci5mcm9tKHZhbCwgZW5jb2RpbmcpXG4gIH1cblxuICAvLyBGaW5hbGx5LCBzZWFyY2ggZWl0aGVyIGluZGV4T2YgKGlmIGRpciBpcyB0cnVlKSBvciBsYXN0SW5kZXhPZlxuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHZhbCkpIHtcbiAgICAvLyBTcGVjaWFsIGNhc2U6IGxvb2tpbmcgZm9yIGVtcHR5IHN0cmluZy9idWZmZXIgYWx3YXlzIGZhaWxzXG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgdmFsID0gdmFsICYgMHhGRiAvLyBTZWFyY2ggZm9yIGEgYnl0ZSB2YWx1ZSBbMC0yNTVdXG4gICAgaWYgKHR5cGVvZiBVaW50OEFycmF5LnByb3RvdHlwZS5pbmRleE9mID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAoZGlyKSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5wcm90b3R5cGUubGFzdEluZGV4T2YuY2FsbChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZihidWZmZXIsIFt2YWxdLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmFsIG11c3QgYmUgc3RyaW5nLCBudW1iZXIgb3IgQnVmZmVyJylcbn1cblxuZnVuY3Rpb24gYXJyYXlJbmRleE9mIChhcnIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICBsZXQgaW5kZXhTaXplID0gMVxuICBsZXQgYXJyTGVuZ3RoID0gYXJyLmxlbmd0aFxuICBsZXQgdmFsTGVuZ3RoID0gdmFsLmxlbmd0aFxuXG4gIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICBpZiAoZW5jb2RpbmcgPT09ICd1Y3MyJyB8fCBlbmNvZGluZyA9PT0gJ3Vjcy0yJyB8fFxuICAgICAgICBlbmNvZGluZyA9PT0gJ3V0ZjE2bGUnIHx8IGVuY29kaW5nID09PSAndXRmLTE2bGUnKSB7XG4gICAgICBpZiAoYXJyLmxlbmd0aCA8IDIgfHwgdmFsLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICB9XG4gICAgICBpbmRleFNpemUgPSAyXG4gICAgICBhcnJMZW5ndGggLz0gMlxuICAgICAgdmFsTGVuZ3RoIC89IDJcbiAgICAgIGJ5dGVPZmZzZXQgLz0gMlxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWQgKGJ1ZiwgaSkge1xuICAgIGlmIChpbmRleFNpemUgPT09IDEpIHtcbiAgICAgIHJldHVybiBidWZbaV1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGJ1Zi5yZWFkVUludDE2QkUoaSAqIGluZGV4U2l6ZSlcbiAgICB9XG4gIH1cblxuICBsZXQgaVxuICBpZiAoZGlyKSB7XG4gICAgbGV0IGZvdW5kSW5kZXggPSAtMVxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPCBhcnJMZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHJlYWQoYXJyLCBpKSA9PT0gcmVhZCh2YWwsIGZvdW5kSW5kZXggPT09IC0xID8gMCA6IGkgLSBmb3VuZEluZGV4KSkge1xuICAgICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIGZvdW5kSW5kZXggPSBpXG4gICAgICAgIGlmIChpIC0gZm91bmRJbmRleCArIDEgPT09IHZhbExlbmd0aCkgcmV0dXJuIGZvdW5kSW5kZXggKiBpbmRleFNpemVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ICE9PSAtMSkgaSAtPSBpIC0gZm91bmRJbmRleFxuICAgICAgICBmb3VuZEluZGV4ID0gLTFcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGJ5dGVPZmZzZXQgKyB2YWxMZW5ndGggPiBhcnJMZW5ndGgpIGJ5dGVPZmZzZXQgPSBhcnJMZW5ndGggLSB2YWxMZW5ndGhcbiAgICBmb3IgKGkgPSBieXRlT2Zmc2V0OyBpID49IDA7IGktLSkge1xuICAgICAgbGV0IGZvdW5kID0gdHJ1ZVxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB2YWxMZW5ndGg7IGorKykge1xuICAgICAgICBpZiAocmVhZChhcnIsIGkgKyBqKSAhPT0gcmVhZCh2YWwsIGopKSB7XG4gICAgICAgICAgZm91bmQgPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmNsdWRlcyA9IGZ1bmN0aW9uIGluY2x1ZGVzICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiB0aGlzLmluZGV4T2YodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykgIT09IC0xXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIGluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGJpZGlyZWN0aW9uYWxJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIHRydWUpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUubGFzdEluZGV4T2YgPSBmdW5jdGlvbiBsYXN0SW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIGhleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICBjb25zdCByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICBjb25zdCBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgbGV0IGlcbiAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGlmIChudW1iZXJJc05hTihwYXJzZWQpKSByZXR1cm4gaVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IHBhcnNlZFxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIHV0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGFzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIHVjczJXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiB3cml0ZSAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZylcbiAgaWYgKG9mZnNldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBvZmZzZXRbLCBsZW5ndGhdWywgZW5jb2RpbmddKVxuICB9IGVsc2UgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgICBpZiAoaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgbGVuZ3RoID0gbGVuZ3RoID4+PiAwXG4gICAgICBpZiAoZW5jb2RpbmcgPT09IHVuZGVmaW5lZCkgZW5jb2RpbmcgPSAndXRmOCdcbiAgICB9IGVsc2Uge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnQnVmZmVyLndyaXRlKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldFssIGxlbmd0aF0pIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQnXG4gICAgKVxuICB9XG5cbiAgY29uc3QgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IGxlbmd0aCA+IHJlbWFpbmluZykgbGVuZ3RoID0gcmVtYWluaW5nXG5cbiAgaWYgKChzdHJpbmcubGVuZ3RoID4gMCAmJiAobGVuZ3RoIDwgMCB8fCBvZmZzZXQgPCAwKSkgfHwgb2Zmc2V0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byB3cml0ZSBvdXRzaWRlIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICBsZXQgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICAvLyBXYXJuaW5nOiBtYXhMZW5ndGggbm90IHRha2VuIGludG8gYWNjb3VudCBpbiBiYXNlNjRXcml0ZVxuICAgICAgICByZXR1cm4gYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHVjczJXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiB1dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG4gIGNvbnN0IHJlcyA9IFtdXG5cbiAgbGV0IGkgPSBzdGFydFxuICB3aGlsZSAoaSA8IGVuZCkge1xuICAgIGNvbnN0IGZpcnN0Qnl0ZSA9IGJ1ZltpXVxuICAgIGxldCBjb2RlUG9pbnQgPSBudWxsXG4gICAgbGV0IGJ5dGVzUGVyU2VxdWVuY2UgPSAoZmlyc3RCeXRlID4gMHhFRilcbiAgICAgID8gNFxuICAgICAgOiAoZmlyc3RCeXRlID4gMHhERilcbiAgICAgICAgICA/IDNcbiAgICAgICAgICA6IChmaXJzdEJ5dGUgPiAweEJGKVxuICAgICAgICAgICAgICA/IDJcbiAgICAgICAgICAgICAgOiAxXG5cbiAgICBpZiAoaSArIGJ5dGVzUGVyU2VxdWVuY2UgPD0gZW5kKSB7XG4gICAgICBsZXQgc2Vjb25kQnl0ZSwgdGhpcmRCeXRlLCBmb3VydGhCeXRlLCB0ZW1wQ29kZVBvaW50XG5cbiAgICAgIHN3aXRjaCAoYnl0ZXNQZXJTZXF1ZW5jZSkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgaWYgKGZpcnN0Qnl0ZSA8IDB4ODApIHtcbiAgICAgICAgICAgIGNvZGVQb2ludCA9IGZpcnN0Qnl0ZVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweDFGKSA8PCAweDYgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0YpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICB0aGlyZEJ5dGUgPSBidWZbaSArIDJdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHhDIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweDYgfCAodGhpcmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3RkYgJiYgKHRlbXBDb2RlUG9pbnQgPCAweEQ4MDAgfHwgdGVtcENvZGVQb2ludCA+IDB4REZGRikpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICB0aGlyZEJ5dGUgPSBidWZbaSArIDJdXG4gICAgICAgICAgZm91cnRoQnl0ZSA9IGJ1ZltpICsgM11cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKGZvdXJ0aEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4MTIgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4QyB8ICh0aGlyZEJ5dGUgJiAweDNGKSA8PCAweDYgfCAoZm91cnRoQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4RkZGRiAmJiB0ZW1wQ29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29kZVBvaW50ID09PSBudWxsKSB7XG4gICAgICAvLyB3ZSBkaWQgbm90IGdlbmVyYXRlIGEgdmFsaWQgY29kZVBvaW50IHNvIGluc2VydCBhXG4gICAgICAvLyByZXBsYWNlbWVudCBjaGFyIChVK0ZGRkQpIGFuZCBhZHZhbmNlIG9ubHkgMSBieXRlXG4gICAgICBjb2RlUG9pbnQgPSAweEZGRkRcbiAgICAgIGJ5dGVzUGVyU2VxdWVuY2UgPSAxXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPiAweEZGRkYpIHtcbiAgICAgIC8vIGVuY29kZSB0byB1dGYxNiAoc3Vycm9nYXRlIHBhaXIgZGFuY2UpXG4gICAgICBjb2RlUG9pbnQgLT0gMHgxMDAwMFxuICAgICAgcmVzLnB1c2goY29kZVBvaW50ID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKVxuICAgICAgY29kZVBvaW50ID0gMHhEQzAwIHwgY29kZVBvaW50ICYgMHgzRkZcbiAgICB9XG5cbiAgICByZXMucHVzaChjb2RlUG9pbnQpXG4gICAgaSArPSBieXRlc1BlclNlcXVlbmNlXG4gIH1cblxuICByZXR1cm4gZGVjb2RlQ29kZVBvaW50c0FycmF5KHJlcylcbn1cblxuLy8gQmFzZWQgb24gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjI3NDcyNzIvNjgwNzQyLCB0aGUgYnJvd3NlciB3aXRoXG4vLyB0aGUgbG93ZXN0IGxpbWl0IGlzIENocm9tZSwgd2l0aCAweDEwMDAwIGFyZ3MuXG4vLyBXZSBnbyAxIG1hZ25pdHVkZSBsZXNzLCBmb3Igc2FmZXR5XG5jb25zdCBNQVhfQVJHVU1FTlRTX0xFTkdUSCA9IDB4MTAwMFxuXG5mdW5jdGlvbiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkgKGNvZGVQb2ludHMpIHtcbiAgY29uc3QgbGVuID0gY29kZVBvaW50cy5sZW5ndGhcbiAgaWYgKGxlbiA8PSBNQVhfQVJHVU1FTlRTX0xFTkdUSCkge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFN0cmluZywgY29kZVBvaW50cykgLy8gYXZvaWQgZXh0cmEgc2xpY2UoKVxuICB9XG5cbiAgLy8gRGVjb2RlIGluIGNodW5rcyB0byBhdm9pZCBcImNhbGwgc3RhY2sgc2l6ZSBleGNlZWRlZFwiLlxuICBsZXQgcmVzID0gJydcbiAgbGV0IGkgPSAwXG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoXG4gICAgICBTdHJpbmcsXG4gICAgICBjb2RlUG9pbnRzLnNsaWNlKGksIGkgKz0gTUFYX0FSR1VNRU5UU19MRU5HVEgpXG4gICAgKVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGxldCByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0gJiAweDdGKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gbGF0aW4xU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBsZXQgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBjb25zdCBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgbGV0IG91dCA9ICcnXG4gIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgb3V0ICs9IGhleFNsaWNlTG9va3VwVGFibGVbYnVmW2ldXVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgY29uc3QgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgbGV0IHJlcyA9ICcnXG4gIC8vIElmIGJ5dGVzLmxlbmd0aCBpcyBvZGQsIHRoZSBsYXN0IDggYml0cyBtdXN0IGJlIGlnbm9yZWQgKHNhbWUgYXMgbm9kZS5qcylcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGggLSAxOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIChieXRlc1tpICsgMV0gKiAyNTYpKVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIHNsaWNlIChzdGFydCwgZW5kKSB7XG4gIGNvbnN0IGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gfn5zdGFydFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IH5+ZW5kXG5cbiAgaWYgKHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ICs9IGxlblxuICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gMFxuICB9IGVsc2UgaWYgKHN0YXJ0ID4gbGVuKSB7XG4gICAgc3RhcnQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCAwKSB7XG4gICAgZW5kICs9IGxlblxuICAgIGlmIChlbmQgPCAwKSBlbmQgPSAwXG4gIH0gZWxzZSBpZiAoZW5kID4gbGVuKSB7XG4gICAgZW5kID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgY29uc3QgbmV3QnVmID0gdGhpcy5zdWJhcnJheShzdGFydCwgZW5kKVxuICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZVxuICBPYmplY3Quc2V0UHJvdG90eXBlT2YobmV3QnVmLCBCdWZmZXIucHJvdG90eXBlKVxuXG4gIHJldHVybiBuZXdCdWZcbn1cblxuLypcbiAqIE5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgYnVmZmVyIGlzbid0IHRyeWluZyB0byB3cml0ZSBvdXQgb2YgYm91bmRzLlxuICovXG5mdW5jdGlvbiBjaGVja09mZnNldCAob2Zmc2V0LCBleHQsIGxlbmd0aCkge1xuICBpZiAoKG9mZnNldCAlIDEpICE9PSAwIHx8IG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdvZmZzZXQgaXMgbm90IHVpbnQnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gbGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVHJ5aW5nIHRvIGFjY2VzcyBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVpbnRMRSA9XG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50TEUgPSBmdW5jdGlvbiByZWFkVUludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIGxldCB2YWwgPSB0aGlzW29mZnNldF1cbiAgbGV0IG11bCA9IDFcbiAgbGV0IGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludEJFID1cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRCRSA9IGZ1bmN0aW9uIHJlYWRVSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuICB9XG5cbiAgbGV0IHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXVxuICBsZXQgbXVsID0gMVxuICB3aGlsZSAoYnl0ZUxlbmd0aCA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVpbnQ4ID1cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gcmVhZFVJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVpbnQxNkxFID1cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludDE2QkUgPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiByZWFkVUludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDgpIHwgdGhpc1tvZmZzZXQgKyAxXVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVaW50MzJMRSA9XG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKCh0aGlzW29mZnNldF0pIHxcbiAgICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSkgK1xuICAgICAgKHRoaXNbb2Zmc2V0ICsgM10gKiAweDEwMDAwMDApXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVpbnQzMkJFID1cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdICogMHgxMDAwMDAwKSArXG4gICAgKCh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgIHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEJpZ1VJbnQ2NExFID0gZGVmaW5lQmlnSW50TWV0aG9kKGZ1bmN0aW9uIHJlYWRCaWdVSW50NjRMRSAob2Zmc2V0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICB2YWxpZGF0ZU51bWJlcihvZmZzZXQsICdvZmZzZXQnKVxuICBjb25zdCBmaXJzdCA9IHRoaXNbb2Zmc2V0XVxuICBjb25zdCBsYXN0ID0gdGhpc1tvZmZzZXQgKyA3XVxuICBpZiAoZmlyc3QgPT09IHVuZGVmaW5lZCB8fCBsYXN0ID09PSB1bmRlZmluZWQpIHtcbiAgICBib3VuZHNFcnJvcihvZmZzZXQsIHRoaXMubGVuZ3RoIC0gOClcbiAgfVxuXG4gIGNvbnN0IGxvID0gZmlyc3QgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiA4ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogMTYgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAyNFxuXG4gIGNvbnN0IGhpID0gdGhpc1srK29mZnNldF0gK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiA4ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogMTYgK1xuICAgIGxhc3QgKiAyICoqIDI0XG5cbiAgcmV0dXJuIEJpZ0ludChsbykgKyAoQmlnSW50KGhpKSA8PCBCaWdJbnQoMzIpKVxufSlcblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkQmlnVUludDY0QkUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gcmVhZEJpZ1VJbnQ2NEJFIChvZmZzZXQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIHZhbGlkYXRlTnVtYmVyKG9mZnNldCwgJ29mZnNldCcpXG4gIGNvbnN0IGZpcnN0ID0gdGhpc1tvZmZzZXRdXG4gIGNvbnN0IGxhc3QgPSB0aGlzW29mZnNldCArIDddXG4gIGlmIChmaXJzdCA9PT0gdW5kZWZpbmVkIHx8IGxhc3QgPT09IHVuZGVmaW5lZCkge1xuICAgIGJvdW5kc0Vycm9yKG9mZnNldCwgdGhpcy5sZW5ndGggLSA4KVxuICB9XG5cbiAgY29uc3QgaGkgPSBmaXJzdCAqIDIgKiogMjQgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAxNiArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDggK1xuICAgIHRoaXNbKytvZmZzZXRdXG5cbiAgY29uc3QgbG8gPSB0aGlzWysrb2Zmc2V0XSAqIDIgKiogMjQgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAxNiArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDggK1xuICAgIGxhc3RcblxuICByZXR1cm4gKEJpZ0ludChoaSkgPDwgQmlnSW50KDMyKSkgKyBCaWdJbnQobG8pXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRMRSA9IGZ1bmN0aW9uIHJlYWRJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICBsZXQgdmFsID0gdGhpc1tvZmZzZXRdXG4gIGxldCBtdWwgPSAxXG4gIGxldCBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50QkUgPSBmdW5jdGlvbiByZWFkSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgbGV0IGkgPSBieXRlTGVuZ3RoXG4gIGxldCBtdWwgPSAxXG4gIGxldCB2YWwgPSB0aGlzW29mZnNldCArIC0taV1cbiAgd2hpbGUgKGkgPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1pXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiByZWFkSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgaWYgKCEodGhpc1tvZmZzZXRdICYgMHg4MCkpIHJldHVybiAodGhpc1tvZmZzZXRdKVxuICByZXR1cm4gKCgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICBjb25zdCB2YWwgPSB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiByZWFkSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgY29uc3QgdmFsID0gdGhpc1tvZmZzZXQgKyAxXSB8ICh0aGlzW29mZnNldF0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gcmVhZEludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0pIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSA8PCAyNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDI0KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEJpZ0ludDY0TEUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gcmVhZEJpZ0ludDY0TEUgKG9mZnNldCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgdmFsaWRhdGVOdW1iZXIob2Zmc2V0LCAnb2Zmc2V0JylcbiAgY29uc3QgZmlyc3QgPSB0aGlzW29mZnNldF1cbiAgY29uc3QgbGFzdCA9IHRoaXNbb2Zmc2V0ICsgN11cbiAgaWYgKGZpcnN0ID09PSB1bmRlZmluZWQgfHwgbGFzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYm91bmRzRXJyb3Iob2Zmc2V0LCB0aGlzLmxlbmd0aCAtIDgpXG4gIH1cblxuICBjb25zdCB2YWwgPSB0aGlzW29mZnNldCArIDRdICtcbiAgICB0aGlzW29mZnNldCArIDVdICogMiAqKiA4ICtcbiAgICB0aGlzW29mZnNldCArIDZdICogMiAqKiAxNiArXG4gICAgKGxhc3QgPDwgMjQpIC8vIE92ZXJmbG93XG5cbiAgcmV0dXJuIChCaWdJbnQodmFsKSA8PCBCaWdJbnQoMzIpKSArXG4gICAgQmlnSW50KGZpcnN0ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogOCArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDE2ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogMjQpXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRCaWdJbnQ2NEJFID0gZGVmaW5lQmlnSW50TWV0aG9kKGZ1bmN0aW9uIHJlYWRCaWdJbnQ2NEJFIChvZmZzZXQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIHZhbGlkYXRlTnVtYmVyKG9mZnNldCwgJ29mZnNldCcpXG4gIGNvbnN0IGZpcnN0ID0gdGhpc1tvZmZzZXRdXG4gIGNvbnN0IGxhc3QgPSB0aGlzW29mZnNldCArIDddXG4gIGlmIChmaXJzdCA9PT0gdW5kZWZpbmVkIHx8IGxhc3QgPT09IHVuZGVmaW5lZCkge1xuICAgIGJvdW5kc0Vycm9yKG9mZnNldCwgdGhpcy5sZW5ndGggLSA4KVxuICB9XG5cbiAgY29uc3QgdmFsID0gKGZpcnN0IDw8IDI0KSArIC8vIE92ZXJmbG93XG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDE2ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogOCArXG4gICAgdGhpc1srK29mZnNldF1cblxuICByZXR1cm4gKEJpZ0ludCh2YWwpIDw8IEJpZ0ludCgzMikpICtcbiAgICBCaWdJbnQodGhpc1srK29mZnNldF0gKiAyICoqIDI0ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogMTYgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiA4ICtcbiAgICBsYXN0KVxufSlcblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdExFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiByZWFkRmxvYXRCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiByZWFkRG91YmxlTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiByZWFkRG91YmxlQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgNTIsIDgpXG59XG5cbmZ1bmN0aW9uIGNoZWNrSW50IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJidWZmZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyIGluc3RhbmNlJylcbiAgaWYgKHZhbHVlID4gbWF4IHx8IHZhbHVlIDwgbWluKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJ2YWx1ZVwiIGFyZ3VtZW50IGlzIG91dCBvZiBib3VuZHMnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVaW50TEUgPVxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlVUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNvbnN0IG1heEJ5dGVzID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpIC0gMVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG1heEJ5dGVzLCAwKVxuICB9XG5cbiAgbGV0IG11bCA9IDFcbiAgbGV0IGkgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVpbnRCRSA9XG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludEJFID0gZnVuY3Rpb24gd3JpdGVVSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY29uc3QgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICBsZXQgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIGxldCBtdWwgPSAxXG4gIHRoaXNbb2Zmc2V0ICsgaV0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKC0taSA+PSAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVWludDggPVxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVVSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4ZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVaW50MTZMRSA9XG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVWludDE2QkUgPVxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVpbnQzMkxFID1cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVaW50MzJCRSA9XG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5mdW5jdGlvbiB3cnRCaWdVSW50NjRMRSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBtaW4sIG1heCkge1xuICBjaGVja0ludEJJKHZhbHVlLCBtaW4sIG1heCwgYnVmLCBvZmZzZXQsIDcpXG5cbiAgbGV0IGxvID0gTnVtYmVyKHZhbHVlICYgQmlnSW50KDB4ZmZmZmZmZmYpKVxuICBidWZbb2Zmc2V0KytdID0gbG9cbiAgbG8gPSBsbyA+PiA4XG4gIGJ1ZltvZmZzZXQrK10gPSBsb1xuICBsbyA9IGxvID4+IDhcbiAgYnVmW29mZnNldCsrXSA9IGxvXG4gIGxvID0gbG8gPj4gOFxuICBidWZbb2Zmc2V0KytdID0gbG9cbiAgbGV0IGhpID0gTnVtYmVyKHZhbHVlID4+IEJpZ0ludCgzMikgJiBCaWdJbnQoMHhmZmZmZmZmZikpXG4gIGJ1ZltvZmZzZXQrK10gPSBoaVxuICBoaSA9IGhpID4+IDhcbiAgYnVmW29mZnNldCsrXSA9IGhpXG4gIGhpID0gaGkgPj4gOFxuICBidWZbb2Zmc2V0KytdID0gaGlcbiAgaGkgPSBoaSA+PiA4XG4gIGJ1ZltvZmZzZXQrK10gPSBoaVxuICByZXR1cm4gb2Zmc2V0XG59XG5cbmZ1bmN0aW9uIHdydEJpZ1VJbnQ2NEJFIChidWYsIHZhbHVlLCBvZmZzZXQsIG1pbiwgbWF4KSB7XG4gIGNoZWNrSW50QkkodmFsdWUsIG1pbiwgbWF4LCBidWYsIG9mZnNldCwgNylcblxuICBsZXQgbG8gPSBOdW1iZXIodmFsdWUgJiBCaWdJbnQoMHhmZmZmZmZmZikpXG4gIGJ1ZltvZmZzZXQgKyA3XSA9IGxvXG4gIGxvID0gbG8gPj4gOFxuICBidWZbb2Zmc2V0ICsgNl0gPSBsb1xuICBsbyA9IGxvID4+IDhcbiAgYnVmW29mZnNldCArIDVdID0gbG9cbiAgbG8gPSBsbyA+PiA4XG4gIGJ1ZltvZmZzZXQgKyA0XSA9IGxvXG4gIGxldCBoaSA9IE51bWJlcih2YWx1ZSA+PiBCaWdJbnQoMzIpICYgQmlnSW50KDB4ZmZmZmZmZmYpKVxuICBidWZbb2Zmc2V0ICsgM10gPSBoaVxuICBoaSA9IGhpID4+IDhcbiAgYnVmW29mZnNldCArIDJdID0gaGlcbiAgaGkgPSBoaSA+PiA4XG4gIGJ1ZltvZmZzZXQgKyAxXSA9IGhpXG4gIGhpID0gaGkgPj4gOFxuICBidWZbb2Zmc2V0XSA9IGhpXG4gIHJldHVybiBvZmZzZXQgKyA4XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVCaWdVSW50NjRMRSA9IGRlZmluZUJpZ0ludE1ldGhvZChmdW5jdGlvbiB3cml0ZUJpZ1VJbnQ2NExFICh2YWx1ZSwgb2Zmc2V0ID0gMCkge1xuICByZXR1cm4gd3J0QmlnVUludDY0TEUodGhpcywgdmFsdWUsIG9mZnNldCwgQmlnSW50KDApLCBCaWdJbnQoJzB4ZmZmZmZmZmZmZmZmZmZmZicpKVxufSlcblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUJpZ1VJbnQ2NEJFID0gZGVmaW5lQmlnSW50TWV0aG9kKGZ1bmN0aW9uIHdyaXRlQmlnVUludDY0QkUgKHZhbHVlLCBvZmZzZXQgPSAwKSB7XG4gIHJldHVybiB3cnRCaWdVSW50NjRCRSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBCaWdJbnQoMCksIEJpZ0ludCgnMHhmZmZmZmZmZmZmZmZmZmZmJykpXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50TEUgPSBmdW5jdGlvbiB3cml0ZUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNvbnN0IGxpbWl0ID0gTWF0aC5wb3coMiwgKDggKiBieXRlTGVuZ3RoKSAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIGxldCBpID0gMFxuICBsZXQgbXVsID0gMVxuICBsZXQgc3ViID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICBpZiAodmFsdWUgPCAwICYmIHN1YiA9PT0gMCAmJiB0aGlzW29mZnNldCArIGkgLSAxXSAhPT0gMCkge1xuICAgICAgc3ViID0gMVxuICAgIH1cbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50QkUgPSBmdW5jdGlvbiB3cml0ZUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNvbnN0IGxpbWl0ID0gTWF0aC5wb3coMiwgKDggKiBieXRlTGVuZ3RoKSAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIGxldCBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgbGV0IG11bCA9IDFcbiAgbGV0IHN1YiA9IDBcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICBpZiAodmFsdWUgPCAwICYmIHN1YiA9PT0gMCAmJiB0aGlzW29mZnNldCArIGkgKyAxXSAhPT0gMCkge1xuICAgICAgc3ViID0gMVxuICAgIH1cbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uIHdyaXRlSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4N2YsIC0weDgwKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmYgKyB2YWx1ZSArIDFcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVCaWdJbnQ2NExFID0gZGVmaW5lQmlnSW50TWV0aG9kKGZ1bmN0aW9uIHdyaXRlQmlnSW50NjRMRSAodmFsdWUsIG9mZnNldCA9IDApIHtcbiAgcmV0dXJuIHdydEJpZ1VJbnQ2NExFKHRoaXMsIHZhbHVlLCBvZmZzZXQsIC1CaWdJbnQoJzB4ODAwMDAwMDAwMDAwMDAwMCcpLCBCaWdJbnQoJzB4N2ZmZmZmZmZmZmZmZmZmZicpKVxufSlcblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUJpZ0ludDY0QkUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gd3JpdGVCaWdJbnQ2NEJFICh2YWx1ZSwgb2Zmc2V0ID0gMCkge1xuICByZXR1cm4gd3J0QmlnVUludDY0QkUodGhpcywgdmFsdWUsIG9mZnNldCwgLUJpZ0ludCgnMHg4MDAwMDAwMDAwMDAwMDAwJyksIEJpZ0ludCgnMHg3ZmZmZmZmZmZmZmZmZmZmJykpXG59KVxuXG5mdW5jdGlvbiBjaGVja0lFRUU3NTQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG4gIGlmIChvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgNCwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gd3JpdGVGbG9hdExFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDgsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG4gIHJldHVybiBvZmZzZXQgKyA4XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gY29weSAodGFyZ2V0LCB0YXJnZXRTdGFydCwgc3RhcnQsIGVuZCkge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0YXJnZXQpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdhcmd1bWVudCBzaG91bGQgYmUgYSBCdWZmZXInKVxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0U3RhcnQgPj0gdGFyZ2V0Lmxlbmd0aCkgdGFyZ2V0U3RhcnQgPSB0YXJnZXQubGVuZ3RoXG4gIGlmICghdGFyZ2V0U3RhcnQpIHRhcmdldFN0YXJ0ID0gMFxuICBpZiAoZW5kID4gMCAmJiBlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVybiAwXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgaWYgKHRhcmdldFN0YXJ0IDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgfVxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHRoaXMubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbiAgaWYgKGVuZCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0IDwgZW5kIC0gc3RhcnQpIHtcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgKyBzdGFydFxuICB9XG5cbiAgY29uc3QgbGVuID0gZW5kIC0gc3RhcnRcblxuICBpZiAodGhpcyA9PT0gdGFyZ2V0ICYmIHR5cGVvZiBVaW50OEFycmF5LnByb3RvdHlwZS5jb3B5V2l0aGluID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gVXNlIGJ1aWx0LWluIHdoZW4gYXZhaWxhYmxlLCBtaXNzaW5nIGZyb20gSUUxMVxuICAgIHRoaXMuY29weVdpdGhpbih0YXJnZXRTdGFydCwgc3RhcnQsIGVuZClcbiAgfSBlbHNlIHtcbiAgICBVaW50OEFycmF5LnByb3RvdHlwZS5zZXQuY2FsbChcbiAgICAgIHRhcmdldCxcbiAgICAgIHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCksXG4gICAgICB0YXJnZXRTdGFydFxuICAgIClcbiAgfVxuXG4gIHJldHVybiBsZW5cbn1cblxuLy8gVXNhZ2U6XG4vLyAgICBidWZmZXIuZmlsbChudW1iZXJbLCBvZmZzZXRbLCBlbmRdXSlcbi8vICAgIGJ1ZmZlci5maWxsKGJ1ZmZlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoc3RyaW5nWywgb2Zmc2V0WywgZW5kXV1bLCBlbmNvZGluZ10pXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiBmaWxsICh2YWwsIHN0YXJ0LCBlbmQsIGVuY29kaW5nKSB7XG4gIC8vIEhhbmRsZSBzdHJpbmcgY2FzZXM6XG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIGlmICh0eXBlb2Ygc3RhcnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IHN0YXJ0XG4gICAgICBzdGFydCA9IDBcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZW5kID09PSAnc3RyaW5nJykge1xuICAgICAgZW5jb2RpbmcgPSBlbmRcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfVxuICAgIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2VuY29kaW5nIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJyAmJiAhQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgfVxuICAgIGlmICh2YWwubGVuZ3RoID09PSAxKSB7XG4gICAgICBjb25zdCBjb2RlID0gdmFsLmNoYXJDb2RlQXQoMClcbiAgICAgIGlmICgoZW5jb2RpbmcgPT09ICd1dGY4JyAmJiBjb2RlIDwgMTI4KSB8fFxuICAgICAgICAgIGVuY29kaW5nID09PSAnbGF0aW4xJykge1xuICAgICAgICAvLyBGYXN0IHBhdGg6IElmIGB2YWxgIGZpdHMgaW50byBhIHNpbmdsZSBieXRlLCB1c2UgdGhhdCBudW1lcmljIHZhbHVlLlxuICAgICAgICB2YWwgPSBjb2RlXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgdmFsID0gdmFsICYgMjU1XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgdmFsID0gTnVtYmVyKHZhbClcbiAgfVxuXG4gIC8vIEludmFsaWQgcmFuZ2VzIGFyZSBub3Qgc2V0IHRvIGEgZGVmYXVsdCwgc28gY2FuIHJhbmdlIGNoZWNrIGVhcmx5LlxuICBpZiAoc3RhcnQgPCAwIHx8IHRoaXMubGVuZ3RoIDwgc3RhcnQgfHwgdGhpcy5sZW5ndGggPCBlbmQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignT3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc3RhcnQgPSBzdGFydCA+Pj4gMFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IHRoaXMubGVuZ3RoIDogZW5kID4+PiAwXG5cbiAgaWYgKCF2YWwpIHZhbCA9IDBcblxuICBsZXQgaVxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgICB0aGlzW2ldID0gdmFsXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGJ5dGVzID0gQnVmZmVyLmlzQnVmZmVyKHZhbClcbiAgICAgID8gdmFsXG4gICAgICA6IEJ1ZmZlci5mcm9tKHZhbCwgZW5jb2RpbmcpXG4gICAgY29uc3QgbGVuID0gYnl0ZXMubGVuZ3RoXG4gICAgaWYgKGxlbiA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIHZhbHVlIFwiJyArIHZhbCArXG4gICAgICAgICdcIiBpcyBpbnZhbGlkIGZvciBhcmd1bWVudCBcInZhbHVlXCInKVxuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgZW5kIC0gc3RhcnQ7ICsraSkge1xuICAgICAgdGhpc1tpICsgc3RhcnRdID0gYnl0ZXNbaSAlIGxlbl1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG4vLyBDVVNUT00gRVJST1JTXG4vLyA9PT09PT09PT09PT09XG5cbi8vIFNpbXBsaWZpZWQgdmVyc2lvbnMgZnJvbSBOb2RlLCBjaGFuZ2VkIGZvciBCdWZmZXItb25seSB1c2FnZVxuY29uc3QgZXJyb3JzID0ge31cbmZ1bmN0aW9uIEUgKHN5bSwgZ2V0TWVzc2FnZSwgQmFzZSkge1xuICBlcnJvcnNbc3ltXSA9IGNsYXNzIE5vZGVFcnJvciBleHRlbmRzIEJhc2Uge1xuICAgIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgIHN1cGVyKClcblxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdtZXNzYWdlJywge1xuICAgICAgICB2YWx1ZTogZ2V0TWVzc2FnZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9KVxuXG4gICAgICAvLyBBZGQgdGhlIGVycm9yIGNvZGUgdG8gdGhlIG5hbWUgdG8gaW5jbHVkZSBpdCBpbiB0aGUgc3RhY2sgdHJhY2UuXG4gICAgICB0aGlzLm5hbWUgPSBgJHt0aGlzLm5hbWV9IFske3N5bX1dYFxuICAgICAgLy8gQWNjZXNzIHRoZSBzdGFjayB0byBnZW5lcmF0ZSB0aGUgZXJyb3IgbWVzc2FnZSBpbmNsdWRpbmcgdGhlIGVycm9yIGNvZGVcbiAgICAgIC8vIGZyb20gdGhlIG5hbWUuXG4gICAgICB0aGlzLnN0YWNrIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLWV4cHJlc3Npb25zXG4gICAgICAvLyBSZXNldCB0aGUgbmFtZSB0byB0aGUgYWN0dWFsIG5hbWUuXG4gICAgICBkZWxldGUgdGhpcy5uYW1lXG4gICAgfVxuXG4gICAgZ2V0IGNvZGUgKCkge1xuICAgICAgcmV0dXJuIHN5bVxuICAgIH1cblxuICAgIHNldCBjb2RlICh2YWx1ZSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdjb2RlJywge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0b1N0cmluZyAoKSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5uYW1lfSBbJHtzeW19XTogJHt0aGlzLm1lc3NhZ2V9YFxuICAgIH1cbiAgfVxufVxuXG5FKCdFUlJfQlVGRkVSX09VVF9PRl9CT1VORFMnLFxuICBmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmIChuYW1lKSB7XG4gICAgICByZXR1cm4gYCR7bmFtZX0gaXMgb3V0c2lkZSBvZiBidWZmZXIgYm91bmRzYFxuICAgIH1cblxuICAgIHJldHVybiAnQXR0ZW1wdCB0byBhY2Nlc3MgbWVtb3J5IG91dHNpZGUgYnVmZmVyIGJvdW5kcydcbiAgfSwgUmFuZ2VFcnJvcilcbkUoJ0VSUl9JTlZBTElEX0FSR19UWVBFJyxcbiAgZnVuY3Rpb24gKG5hbWUsIGFjdHVhbCkge1xuICAgIHJldHVybiBgVGhlIFwiJHtuYW1lfVwiIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBudW1iZXIuIFJlY2VpdmVkIHR5cGUgJHt0eXBlb2YgYWN0dWFsfWBcbiAgfSwgVHlwZUVycm9yKVxuRSgnRVJSX09VVF9PRl9SQU5HRScsXG4gIGZ1bmN0aW9uIChzdHIsIHJhbmdlLCBpbnB1dCkge1xuICAgIGxldCBtc2cgPSBgVGhlIHZhbHVlIG9mIFwiJHtzdHJ9XCIgaXMgb3V0IG9mIHJhbmdlLmBcbiAgICBsZXQgcmVjZWl2ZWQgPSBpbnB1dFxuICAgIGlmIChOdW1iZXIuaXNJbnRlZ2VyKGlucHV0KSAmJiBNYXRoLmFicyhpbnB1dCkgPiAyICoqIDMyKSB7XG4gICAgICByZWNlaXZlZCA9IGFkZE51bWVyaWNhbFNlcGFyYXRvcihTdHJpbmcoaW5wdXQpKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09PSAnYmlnaW50Jykge1xuICAgICAgcmVjZWl2ZWQgPSBTdHJpbmcoaW5wdXQpXG4gICAgICBpZiAoaW5wdXQgPiBCaWdJbnQoMikgKiogQmlnSW50KDMyKSB8fCBpbnB1dCA8IC0oQmlnSW50KDIpICoqIEJpZ0ludCgzMikpKSB7XG4gICAgICAgIHJlY2VpdmVkID0gYWRkTnVtZXJpY2FsU2VwYXJhdG9yKHJlY2VpdmVkKVxuICAgICAgfVxuICAgICAgcmVjZWl2ZWQgKz0gJ24nXG4gICAgfVxuICAgIG1zZyArPSBgIEl0IG11c3QgYmUgJHtyYW5nZX0uIFJlY2VpdmVkICR7cmVjZWl2ZWR9YFxuICAgIHJldHVybiBtc2dcbiAgfSwgUmFuZ2VFcnJvcilcblxuZnVuY3Rpb24gYWRkTnVtZXJpY2FsU2VwYXJhdG9yICh2YWwpIHtcbiAgbGV0IHJlcyA9ICcnXG4gIGxldCBpID0gdmFsLmxlbmd0aFxuICBjb25zdCBzdGFydCA9IHZhbFswXSA9PT0gJy0nID8gMSA6IDBcbiAgZm9yICg7IGkgPj0gc3RhcnQgKyA0OyBpIC09IDMpIHtcbiAgICByZXMgPSBgXyR7dmFsLnNsaWNlKGkgLSAzLCBpKX0ke3Jlc31gXG4gIH1cbiAgcmV0dXJuIGAke3ZhbC5zbGljZSgwLCBpKX0ke3Jlc31gXG59XG5cbi8vIENIRUNLIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIGNoZWNrQm91bmRzIChidWYsIG9mZnNldCwgYnl0ZUxlbmd0aCkge1xuICB2YWxpZGF0ZU51bWJlcihvZmZzZXQsICdvZmZzZXQnKVxuICBpZiAoYnVmW29mZnNldF0gPT09IHVuZGVmaW5lZCB8fCBidWZbb2Zmc2V0ICsgYnl0ZUxlbmd0aF0gPT09IHVuZGVmaW5lZCkge1xuICAgIGJvdW5kc0Vycm9yKG9mZnNldCwgYnVmLmxlbmd0aCAtIChieXRlTGVuZ3RoICsgMSkpXG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tJbnRCSSAodmFsdWUsIG1pbiwgbWF4LCBidWYsIG9mZnNldCwgYnl0ZUxlbmd0aCkge1xuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHtcbiAgICBjb25zdCBuID0gdHlwZW9mIG1pbiA9PT0gJ2JpZ2ludCcgPyAnbicgOiAnJ1xuICAgIGxldCByYW5nZVxuICAgIGlmIChieXRlTGVuZ3RoID4gMykge1xuICAgICAgaWYgKG1pbiA9PT0gMCB8fCBtaW4gPT09IEJpZ0ludCgwKSkge1xuICAgICAgICByYW5nZSA9IGA+PSAwJHtufSBhbmQgPCAyJHtufSAqKiAkeyhieXRlTGVuZ3RoICsgMSkgKiA4fSR7bn1gXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByYW5nZSA9IGA+PSAtKDIke259ICoqICR7KGJ5dGVMZW5ndGggKyAxKSAqIDggLSAxfSR7bn0pIGFuZCA8IDIgKiogYCArXG4gICAgICAgICAgICAgICAgYCR7KGJ5dGVMZW5ndGggKyAxKSAqIDggLSAxfSR7bn1gXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJhbmdlID0gYD49ICR7bWlufSR7bn0gYW5kIDw9ICR7bWF4fSR7bn1gXG4gICAgfVxuICAgIHRocm93IG5ldyBlcnJvcnMuRVJSX09VVF9PRl9SQU5HRSgndmFsdWUnLCByYW5nZSwgdmFsdWUpXG4gIH1cbiAgY2hlY2tCb3VuZHMoYnVmLCBvZmZzZXQsIGJ5dGVMZW5ndGgpXG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlTnVtYmVyICh2YWx1ZSwgbmFtZSkge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBlcnJvcnMuRVJSX0lOVkFMSURfQVJHX1RZUEUobmFtZSwgJ251bWJlcicsIHZhbHVlKVxuICB9XG59XG5cbmZ1bmN0aW9uIGJvdW5kc0Vycm9yICh2YWx1ZSwgbGVuZ3RoLCB0eXBlKSB7XG4gIGlmIChNYXRoLmZsb29yKHZhbHVlKSAhPT0gdmFsdWUpIHtcbiAgICB2YWxpZGF0ZU51bWJlcih2YWx1ZSwgdHlwZSlcbiAgICB0aHJvdyBuZXcgZXJyb3JzLkVSUl9PVVRfT0ZfUkFOR0UodHlwZSB8fCAnb2Zmc2V0JywgJ2FuIGludGVnZXInLCB2YWx1ZSlcbiAgfVxuXG4gIGlmIChsZW5ndGggPCAwKSB7XG4gICAgdGhyb3cgbmV3IGVycm9ycy5FUlJfQlVGRkVSX09VVF9PRl9CT1VORFMoKVxuICB9XG5cbiAgdGhyb3cgbmV3IGVycm9ycy5FUlJfT1VUX09GX1JBTkdFKHR5cGUgfHwgJ29mZnNldCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgPj0gJHt0eXBlID8gMSA6IDB9IGFuZCA8PSAke2xlbmd0aH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUpXG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxuY29uc3QgSU5WQUxJRF9CQVNFNjRfUkUgPSAvW14rLzAtOUEtWmEtei1fXS9nXG5cbmZ1bmN0aW9uIGJhc2U2NGNsZWFuIChzdHIpIHtcbiAgLy8gTm9kZSB0YWtlcyBlcXVhbCBzaWducyBhcyBlbmQgb2YgdGhlIEJhc2U2NCBlbmNvZGluZ1xuICBzdHIgPSBzdHIuc3BsaXQoJz0nKVswXVxuICAvLyBOb2RlIHN0cmlwcyBvdXQgaW52YWxpZCBjaGFyYWN0ZXJzIGxpa2UgXFxuIGFuZCBcXHQgZnJvbSB0aGUgc3RyaW5nLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgc3RyID0gc3RyLnRyaW0oKS5yZXBsYWNlKElOVkFMSURfQkFTRTY0X1JFLCAnJylcbiAgLy8gTm9kZSBjb252ZXJ0cyBzdHJpbmdzIHdpdGggbGVuZ3RoIDwgMiB0byAnJ1xuICBpZiAoc3RyLmxlbmd0aCA8IDIpIHJldHVybiAnJ1xuICAvLyBOb2RlIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBiYXNlNjQgc3RyaW5ncyAobWlzc2luZyB0cmFpbGluZyA9PT0pLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgd2hpbGUgKHN0ci5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgc3RyID0gc3RyICsgJz0nXG4gIH1cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyaW5nLCB1bml0cykge1xuICB1bml0cyA9IHVuaXRzIHx8IEluZmluaXR5XG4gIGxldCBjb2RlUG9pbnRcbiAgY29uc3QgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aFxuICBsZXQgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcbiAgY29uc3QgYnl0ZXMgPSBbXVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBjb2RlUG9pbnQgPSBzdHJpbmcuY2hhckNvZGVBdChpKVxuXG4gICAgLy8gaXMgc3Vycm9nYXRlIGNvbXBvbmVudFxuICAgIGlmIChjb2RlUG9pbnQgPiAweEQ3RkYgJiYgY29kZVBvaW50IDwgMHhFMDAwKSB7XG4gICAgICAvLyBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCFsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAgIC8vIG5vIGxlYWQgeWV0XG4gICAgICAgIGlmIChjb2RlUG9pbnQgPiAweERCRkYpIHtcbiAgICAgICAgICAvLyB1bmV4cGVjdGVkIHRyYWlsXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfSBlbHNlIGlmIChpICsgMSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgICAgLy8gdW5wYWlyZWQgbGVhZFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyB2YWxpZCBsZWFkXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyAyIGxlYWRzIGluIGEgcm93XG4gICAgICBpZiAoY29kZVBvaW50IDwgMHhEQzAwKSB7XG4gICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIHZhbGlkIHN1cnJvZ2F0ZSBwYWlyXG4gICAgICBjb2RlUG9pbnQgPSAobGVhZFN1cnJvZ2F0ZSAtIDB4RDgwMCA8PCAxMCB8IGNvZGVQb2ludCAtIDB4REMwMCkgKyAweDEwMDAwXG4gICAgfSBlbHNlIGlmIChsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAvLyB2YWxpZCBibXAgY2hhciwgYnV0IGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICB9XG5cbiAgICBsZWFkU3Vycm9nYXRlID0gbnVsbFxuXG4gICAgLy8gZW5jb2RlIHV0ZjhcbiAgICBpZiAoY29kZVBvaW50IDwgMHg4MCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAxKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKGNvZGVQb2ludClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4ODAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgfCAweEMwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAzKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDIHwgMHhFMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gNCkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4MTIgfCAweEYwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNvZGUgcG9pbnQnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBieXRlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICBjb25zdCBieXRlQXJyYXkgPSBbXVxuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIsIHVuaXRzKSB7XG4gIGxldCBjLCBoaSwgbG9cbiAgY29uc3QgYnl0ZUFycmF5ID0gW11cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcblxuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KGJhc2U2NGNsZWFuKHN0cikpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICBsZXQgaVxuICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuLy8gQXJyYXlCdWZmZXIgb3IgVWludDhBcnJheSBvYmplY3RzIGZyb20gb3RoZXIgY29udGV4dHMgKGkuZS4gaWZyYW1lcykgZG8gbm90IHBhc3Ncbi8vIHRoZSBgaW5zdGFuY2VvZmAgY2hlY2sgYnV0IHRoZXkgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgb2YgdGhhdCB0eXBlLlxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9pc3N1ZXMvMTY2XG5mdW5jdGlvbiBpc0luc3RhbmNlIChvYmosIHR5cGUpIHtcbiAgcmV0dXJuIG9iaiBpbnN0YW5jZW9mIHR5cGUgfHxcbiAgICAob2JqICE9IG51bGwgJiYgb2JqLmNvbnN0cnVjdG9yICE9IG51bGwgJiYgb2JqLmNvbnN0cnVjdG9yLm5hbWUgIT0gbnVsbCAmJlxuICAgICAgb2JqLmNvbnN0cnVjdG9yLm5hbWUgPT09IHR5cGUubmFtZSlcbn1cbmZ1bmN0aW9uIG51bWJlcklzTmFOIChvYmopIHtcbiAgLy8gRm9yIElFMTEgc3VwcG9ydFxuICByZXR1cm4gb2JqICE9PSBvYmogLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWNvbXBhcmVcbn1cblxuLy8gQ3JlYXRlIGxvb2t1cCB0YWJsZSBmb3IgYHRvU3RyaW5nKCdoZXgnKWBcbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvaXNzdWVzLzIxOVxuY29uc3QgaGV4U2xpY2VMb29rdXBUYWJsZSA9IChmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IGFscGhhYmV0ID0gJzAxMjM0NTY3ODlhYmNkZWYnXG4gIGNvbnN0IHRhYmxlID0gbmV3IEFycmF5KDI1NilcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjsgKytpKSB7XG4gICAgY29uc3QgaTE2ID0gaSAqIDE2XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCAxNjsgKytqKSB7XG4gICAgICB0YWJsZVtpMTYgKyBqXSA9IGFscGhhYmV0W2ldICsgYWxwaGFiZXRbal1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRhYmxlXG59KSgpXG5cbi8vIFJldHVybiBub3QgZnVuY3Rpb24gd2l0aCBFcnJvciBpZiBCaWdJbnQgbm90IHN1cHBvcnRlZFxuZnVuY3Rpb24gZGVmaW5lQmlnSW50TWV0aG9kIChmbikge1xuICByZXR1cm4gdHlwZW9mIEJpZ0ludCA9PT0gJ3VuZGVmaW5lZCcgPyBCdWZmZXJCaWdJbnROb3REZWZpbmVkIDogZm5cbn1cblxuZnVuY3Rpb24gQnVmZmVyQmlnSW50Tm90RGVmaW5lZCAoKSB7XG4gIHRocm93IG5ldyBFcnJvcignQmlnSW50IG5vdCBzdXBwb3J0ZWQnKVxufVxuIiwgIi8qKlxuICogTm9zdHJLZXkgXHUyMDE0IE1hbmFnZSBQcm9maWxlcyAoZnVsbC1wYWdlKVxuICogTXVsdGktc2VsZWN0LCBidWxrIGRlbGV0ZSwgZHVwbGljYXRlIGRldGVjdGlvbi5cbiAqL1xuXG5pbXBvcnQgeyBnZXRQcm9maWxlcywgZ2V0UHJvZmlsZU5hbWVzLCBnZXRQcm9maWxlSW5kZXgsIGRlbGV0ZVByb2ZpbGUsIGdldE5wdWIgfSBmcm9tICcuLi91dGlsaXRpZXMvdXRpbHMnO1xuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuXG5jb25zdCBzdGF0ZSA9IHtcbiAgICBwcm9maWxlczogW10sICAgICAgIC8vIHsgaW5kZXgsIG5hbWUsIG5wdWIsIGlzQWN0aXZlLCBzZWxlY3RlZCB9XG4gICAgYWN0aXZlSW5kZXg6IG51bGwsXG59O1xuXG5mdW5jdGlvbiAkKGlkKSB7IHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7IH1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZFByb2ZpbGVzKCkge1xuICAgIGNvbnN0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBjb25zdCBuYW1lcyA9IGF3YWl0IGdldFByb2ZpbGVOYW1lcygpO1xuICAgIGNvbnN0IGFjdGl2ZUluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgc3RhdGUuYWN0aXZlSW5kZXggPSBhY3RpdmVJbmRleDtcbiAgICBzdGF0ZS5wcm9maWxlcyA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9maWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgbnB1YiA9ICcnO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbnB1YiA9IGF3YWl0IGdldE5wdWIoaSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIG5wdWIgPSAnKHVuYWJsZSB0byByZWFkKSc7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUucHJvZmlsZXMucHVzaCh7XG4gICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgIG5hbWU6IG5hbWVzW2ldIHx8ICdVbm5hbWVkJyxcbiAgICAgICAgICAgIG5wdWI6IG5wdWIgfHwgJycsXG4gICAgICAgICAgICBpc0FjdGl2ZTogaSA9PT0gYWN0aXZlSW5kZXgsXG4gICAgICAgICAgICBzZWxlY3RlZDogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlcigpO1xufVxuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgY29uc3QgbGlzdCA9ICQoJ3Byb2ZpbGUtbGlzdCcpO1xuICAgIGNvbnN0IGNvdW50VGV4dCA9ICQoJ2NvdW50LXRleHQnKTtcbiAgICBjb25zdCB3YXJuaW5nVGV4dCA9ICQoJ3dhcm5pbmctdGV4dCcpO1xuICAgIGNvbnN0IGRlbGV0ZUJ0biA9ICQoJ2RlbGV0ZS1zZWxlY3RlZC1idG4nKTtcbiAgICBjb25zdCBzZWxlY3RBbGxCdG4gPSAkKCdzZWxlY3QtYWxsLWJ0bicpO1xuXG4gICAgaWYgKHN0YXRlLnByb2ZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBsaXN0LmlubmVySFRNTCA9ICc8bGkgc3R5bGU9XCJjb2xvcjojYjBiMGE4O3BhZGRpbmc6MjBweDt0ZXh0LWFsaWduOmNlbnRlcjtcIj5ObyBwcm9maWxlcyBmb3VuZC48L2xpPic7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBEZXRlY3QgZHVwbGljYXRlc1xuICAgIGNvbnN0IG5wdWJDb3VudCA9IHt9O1xuICAgIHN0YXRlLnByb2ZpbGVzLmZvckVhY2gocCA9PiB7XG4gICAgICAgIGlmIChwLm5wdWIpIHtcbiAgICAgICAgICAgIG5wdWJDb3VudFtwLm5wdWJdID0gKG5wdWJDb3VudFtwLm5wdWJdIHx8IDApICsgMTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGlzdC5pbm5lckhUTUwgPSBzdGF0ZS5wcm9maWxlcy5tYXAocCA9PiB7XG4gICAgICAgIGNvbnN0IGlzRHVwZSA9IG5wdWJDb3VudFtwLm5wdWJdID4gMTtcbiAgICAgICAgY29uc3QgdHJ1bmNOcHViID0gcC5ucHViICYmIHAubnB1Yi5sZW5ndGggPiAyMFxuICAgICAgICAgICAgPyBwLm5wdWIuc2xpY2UoMCwgMTIpICsgJy4uLicgKyBwLm5wdWIuc2xpY2UoLTgpXG4gICAgICAgICAgICA6IHAubnB1YjtcblxuICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgPGxpIGNsYXNzPVwicHJvZmlsZS1pdGVtICR7cC5zZWxlY3RlZCA/ICdzZWxlY3RlZCcgOiAnJ30gJHtwLmlzQWN0aXZlID8gJ2FjdGl2ZS1wcm9maWxlJyA6ICcnfVwiXG4gICAgICAgICAgICAgICAgZGF0YS1pbmRleD1cIiR7cC5pbmRleH1cIiByb2xlPVwib3B0aW9uXCIgYXJpYS1zZWxlY3RlZD1cIiR7cC5zZWxlY3RlZH1cIj5cbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJwcm9maWxlLWNoZWNrYm94XCIgZGF0YS1pbmRleD1cIiR7cC5pbmRleH1cIlxuICAgICAgICAgICAgICAgICAgICAke3Auc2VsZWN0ZWQgPyAnY2hlY2tlZCcgOiAnJ30gJHtwLmlzQWN0aXZlICYmIHN0YXRlLnByb2ZpbGVzLmxlbmd0aCA+IDEgPyAnJyA6ICcnfVxuICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPVwiU2VsZWN0ICR7cC5uYW1lfVwiIC8+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByb2ZpbGUtaW5mb1wiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJvZmlsZS1uYW1lXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAke2VzY2FwZUh0bWwocC5uYW1lKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICR7aXNEdXBlID8gJyA8c3BhbiBzdHlsZT1cImNvbG9yOiNmOTI2NzI7Zm9udC1zaXplOjAuNzVyZW07XCI+KGR1cGxpY2F0ZSk8L3NwYW4+JyA6ICcnfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByb2ZpbGUtbnB1YlwiPiR7ZXNjYXBlSHRtbCh0cnVuY05wdWIpfTwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICR7cC5pc0FjdGl2ZSA/ICc8c3BhbiBjbGFzcz1cInByb2ZpbGUtYWN0aXZlLWJhZGdlXCI+QWN0aXZlPC9zcGFuPicgOiAnJ31cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgIGA7XG4gICAgfSkuam9pbignJyk7XG5cbiAgICAvLyBCaW5kIGNoZWNrYm94IGV2ZW50c1xuICAgIGxpc3QucXVlcnlTZWxlY3RvckFsbCgnLnByb2ZpbGUtY2hlY2tib3gnKS5mb3JFYWNoKGNiID0+IHtcbiAgICAgICAgY2IuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlkeCA9IHBhcnNlSW50KGUudGFyZ2V0LmRhdGFzZXQuaW5kZXgsIDEwKTtcbiAgICAgICAgICAgIGNvbnN0IHByb2ZpbGUgPSBzdGF0ZS5wcm9maWxlcy5maW5kKHAgPT4gcC5pbmRleCA9PT0gaWR4KTtcbiAgICAgICAgICAgIGlmIChwcm9maWxlKSB7XG4gICAgICAgICAgICAgICAgcHJvZmlsZS5zZWxlY3RlZCA9IGUudGFyZ2V0LmNoZWNrZWQ7XG4gICAgICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gQmluZCByb3cgY2xpY2sgdG8gdG9nZ2xlIGNoZWNrYm94XG4gICAgbGlzdC5xdWVyeVNlbGVjdG9yQWxsKCcucHJvZmlsZS1pdGVtJykuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoZS50YXJnZXQudHlwZSA9PT0gJ2NoZWNrYm94JykgcmV0dXJuOyAvLyBsZXQgY2hlY2tib3ggaGFuZGxlIGl0c2VsZlxuICAgICAgICAgICAgY29uc3QgaWR4ID0gcGFyc2VJbnQoaXRlbS5kYXRhc2V0LmluZGV4LCAxMCk7XG4gICAgICAgICAgICBjb25zdCBwcm9maWxlID0gc3RhdGUucHJvZmlsZXMuZmluZChwID0+IHAuaW5kZXggPT09IGlkeCk7XG4gICAgICAgICAgICBpZiAocHJvZmlsZSkge1xuICAgICAgICAgICAgICAgIHByb2ZpbGUuc2VsZWN0ZWQgPSAhcHJvZmlsZS5zZWxlY3RlZDtcbiAgICAgICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBVcGRhdGUgY291bnRzXG4gICAgY29uc3Qgc2VsZWN0ZWRDb3VudCA9IHN0YXRlLnByb2ZpbGVzLmZpbHRlcihwID0+IHAuc2VsZWN0ZWQpLmxlbmd0aDtcbiAgICBjb25zdCB0b3RhbENvdW50ID0gc3RhdGUucHJvZmlsZXMubGVuZ3RoO1xuICAgIGNvdW50VGV4dC50ZXh0Q29udGVudCA9IGAke3RvdGFsQ291bnR9IHByb2ZpbGUke3RvdGFsQ291bnQgIT09IDEgPyAncycgOiAnJ30gdG90YWxgO1xuXG4gICAgLy8gV2FybmluZyBpZiB0cnlpbmcgdG8gZGVsZXRlIGFsbCBvciBhY3RpdmVcbiAgICBjb25zdCBzZWxlY3RlZEFjdGl2ZSA9IHN0YXRlLnByb2ZpbGVzLnNvbWUocCA9PiBwLnNlbGVjdGVkICYmIHAuaXNBY3RpdmUpO1xuICAgIGNvbnN0IHNlbGVjdGVkQWxsID0gc2VsZWN0ZWRDb3VudCA9PT0gdG90YWxDb3VudDtcblxuICAgIHdhcm5pbmdUZXh0LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgIGlmIChzZWxlY3RlZEFsbCkge1xuICAgICAgICB3YXJuaW5nVGV4dC50ZXh0Q29udGVudCA9ICdZb3UgbXVzdCBrZWVwIGF0IGxlYXN0IG9uZSBwcm9maWxlLiBUaGUgYWN0aXZlIHByb2ZpbGUgd2lsbCBiZSBrZXB0Lic7XG4gICAgICAgIHdhcm5pbmdUZXh0LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRBY3RpdmUgJiYgc2VsZWN0ZWRDb3VudCA8IHRvdGFsQ291bnQpIHtcbiAgICAgICAgd2FybmluZ1RleHQudGV4dENvbnRlbnQgPSAnWW91ciBhY3RpdmUgcHJvZmlsZSBpcyBzZWxlY3RlZC4gQSBkaWZmZXJlbnQgcHJvZmlsZSB3aWxsIGJlY29tZSBhY3RpdmUgYWZ0ZXIgZGVsZXRpb24uJztcbiAgICAgICAgd2FybmluZ1RleHQuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGJ1dHRvbnNcbiAgICBkZWxldGVCdG4uZGlzYWJsZWQgPSBzZWxlY3RlZENvdW50ID09PSAwO1xuICAgIGRlbGV0ZUJ0bi50ZXh0Q29udGVudCA9IGBEZWxldGUgU2VsZWN0ZWQgKCR7c2VsZWN0ZWRDb3VudH0pYDtcblxuICAgIGNvbnN0IGFsbFNlbGVjdGVkID0gc2VsZWN0ZWRDb3VudCA9PT0gdG90YWxDb3VudDtcbiAgICBzZWxlY3RBbGxCdG4udGV4dENvbnRlbnQgPSBhbGxTZWxlY3RlZCA/ICdEZXNlbGVjdCBBbGwnIDogJ1NlbGVjdCBBbGwnO1xufVxuXG5hc3luYyBmdW5jdGlvbiBkZWxldGVTZWxlY3RlZCgpIHtcbiAgICBsZXQgdG9EZWxldGUgPSBzdGF0ZS5wcm9maWxlcy5maWx0ZXIocCA9PiBwLnNlbGVjdGVkKTtcblxuICAgIC8vIENhbid0IGRlbGV0ZSBhbGwgXHUyMDE0IGtlZXAgdGhlIGFjdGl2ZSBvbmVcbiAgICBpZiAodG9EZWxldGUubGVuZ3RoID09PSBzdGF0ZS5wcm9maWxlcy5sZW5ndGgpIHtcbiAgICAgICAgdG9EZWxldGUgPSB0b0RlbGV0ZS5maWx0ZXIocCA9PiAhcC5pc0FjdGl2ZSk7XG4gICAgfVxuXG4gICAgaWYgKHRvRGVsZXRlLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgY29uc3QgY291bnQgPSB0b0RlbGV0ZS5sZW5ndGg7XG4gICAgaWYgKCFjb25maXJtKGBEZWxldGUgJHtjb3VudH0gcHJvZmlsZSR7Y291bnQgIT09IDEgPyAncycgOiAnJ30/IFRoaXMgY2Fubm90IGJlIHVuZG9uZS5gKSkgcmV0dXJuO1xuXG4gICAgLy8gRGVsZXRlIGZyb20gaGlnaGVzdCBpbmRleCBmaXJzdCBzbyBpbmRpY2VzIGRvbid0IHNoaWZ0XG4gICAgY29uc3QgaW5kaWNlcyA9IHRvRGVsZXRlLm1hcChwID0+IHAuaW5kZXgpLnNvcnQoKGEsIGIpID0+IGIgLSBhKTtcblxuICAgIGZvciAoY29uc3QgaWR4IG9mIGluZGljZXMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGRlbGV0ZVByb2ZpbGUoaWR4KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHRvIGRlbGV0ZSBwcm9maWxlICR7aWR4fTpgLCBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHN1Y2Nlc3NUZXh0ID0gJCgnc3VjY2Vzcy10ZXh0Jyk7XG4gICAgc3VjY2Vzc1RleHQudGV4dENvbnRlbnQgPSBgRGVsZXRlZCAke2NvdW50fSBwcm9maWxlJHtjb3VudCAhPT0gMSA/ICdzJyA6ICcnfS5gO1xuICAgIHN1Y2Nlc3NUZXh0LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gc3VjY2Vzc1RleHQuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyksIDMwMDApO1xuXG4gICAgYXdhaXQgbG9hZFByb2ZpbGVzKCk7XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZVNlbGVjdEFsbCgpIHtcbiAgICBjb25zdCBhbGxTZWxlY3RlZCA9IHN0YXRlLnByb2ZpbGVzLmV2ZXJ5KHAgPT4gcC5zZWxlY3RlZCk7XG4gICAgc3RhdGUucHJvZmlsZXMuZm9yRWFjaChwID0+IHsgcC5zZWxlY3RlZCA9ICFhbGxTZWxlY3RlZDsgfSk7XG4gICAgcmVuZGVyKCk7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUh0bWwoc3RyKSB7XG4gICAgaWYgKCFzdHIpIHJldHVybiAnJztcbiAgICByZXR1cm4gU3RyaW5nKHN0cikucmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5yZXBsYWNlKC88L2csICcmbHQ7JykucmVwbGFjZSgvPi9nLCAnJmd0OycpLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn1cblxuLy8gSW5pdFxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGFzeW5jICgpID0+IHtcbiAgICBhd2FpdCBsb2FkUHJvZmlsZXMoKTtcblxuICAgICQoJ2RlbGV0ZS1zZWxlY3RlZC1idG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRlbGV0ZVNlbGVjdGVkKTtcbiAgICAkKCdzZWxlY3QtYWxsLWJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9nZ2xlU2VsZWN0QWxsKTtcbn0pO1xuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgeyBlbmNyeXB0LCBkZWNyeXB0LCBoYXNoUGFzc3dvcmQsIHZlcmlmeVBhc3N3b3JkIH0gZnJvbSAnLi9jcnlwdG8nO1xuaW1wb3J0IHsgbG9va3NMaWtlU2VlZFBocmFzZSwgaXNWYWxpZFNlZWRQaHJhc2UgfSBmcm9tICcuL3NlZWRwaHJhc2UnO1xuXG5jb25zdCBEQl9WRVJTSU9OID0gNjtcbmNvbnN0IHN0b3JhZ2UgPSBhcGkuc3RvcmFnZS5sb2NhbDtcbmV4cG9ydCBjb25zdCBSRUNPTU1FTkRFRF9SRUxBWVMgPSBbXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkuZGFtdXMuaW8nKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9yZWxheS5wcmltYWwubmV0JyksXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkuc25vcnQuc29jaWFsJyksXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkuZ2V0YWxieS5jb20vdjEnKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9ub3MubG9sJyksXG5dO1xuLy8gcHJldHRpZXItaWdub3JlXG5leHBvcnQgY29uc3QgS0lORFMgPSBbXG4gICAgWzAsICdNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMS5tZCddLFxuICAgIFsxLCAnVGV4dCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMS5tZCddLFxuICAgIFsyLCAnUmVjb21tZW5kIFJlbGF5JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzAxLm1kJ10sXG4gICAgWzMsICdDb250YWN0cycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMi5tZCddLFxuICAgIFs0LCAnRW5jcnlwdGVkIERpcmVjdCBNZXNzYWdlcycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wNC5tZCddLFxuICAgIFs1LCAnRXZlbnQgRGVsZXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDkubWQnXSxcbiAgICBbNiwgJ1JlcG9zdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8xOC5tZCddLFxuICAgIFs3LCAnUmVhY3Rpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjUubWQnXSxcbiAgICBbOCwgJ0JhZGdlIEF3YXJkJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU4Lm1kJ10sXG4gICAgWzE2LCAnR2VuZXJpYyBSZXBvc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMTgubWQnXSxcbiAgICBbNDAsICdDaGFubmVsIENyZWF0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzQxLCAnQ2hhbm5lbCBNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFs0MiwgJ0NoYW5uZWwgTWVzc2FnZScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFs0MywgJ0NoYW5uZWwgSGlkZSBNZXNzYWdlJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzQ0LCAnQ2hhbm5lbCBNdXRlIFVzZXInLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjgubWQnXSxcbiAgICBbMTA2MywgJ0ZpbGUgTWV0YWRhdGEnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvOTQubWQnXSxcbiAgICBbMTMxMSwgJ0xpdmUgQ2hhdCBNZXNzYWdlJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUzLm1kJ10sXG4gICAgWzE5ODQsICdSZXBvcnRpbmcnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTYubWQnXSxcbiAgICBbMTk4NSwgJ0xhYmVsJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzMyLm1kJ10sXG4gICAgWzQ1NTAsICdDb21tdW5pdHkgUG9zdCBBcHByb3ZhbCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83Mi5tZCddLFxuICAgIFs3MDAwLCAnSm9iIEZlZWRiYWNrJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzkwLm1kJ10sXG4gICAgWzkwNDEsICdaYXAgR29hbCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83NS5tZCddLFxuICAgIFs5NzM0LCAnWmFwIFJlcXVlc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTcubWQnXSxcbiAgICBbOTczNSwgJ1phcCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Ny5tZCddLFxuICAgIFsxMDAwMCwgJ011dGUgTGlzdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81MS5tZCddLFxuICAgIFsxMDAwMSwgJ1BpbiBMaXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUxLm1kJ10sXG4gICAgWzEwMDAyLCAnUmVsYXkgTGlzdCBNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci82NS5tZCddLFxuICAgIFsxMzE5NCwgJ1dhbGxldCBJbmZvJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ3Lm1kJ10sXG4gICAgWzIyMjQyLCAnQ2xpZW50IEF1dGhlbnRpY2F0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQyLm1kJ10sXG4gICAgWzIzMTk0LCAnV2FsbGV0IFJlcXVlc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDcubWQnXSxcbiAgICBbMjMxOTUsICdXYWxsZXQgUmVzcG9uc2UnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDcubWQnXSxcbiAgICBbMjQxMzMsICdOb3N0ciBDb25uZWN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ2Lm1kJ10sXG4gICAgWzI3MjM1LCAnSFRUUCBBdXRoJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk4Lm1kJ10sXG4gICAgWzMwMDAwLCAnQ2F0ZWdvcml6ZWQgUGVvcGxlIExpc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTEubWQnXSxcbiAgICBbMzAwMDEsICdDYXRlZ29yaXplZCBCb29rbWFyayBMaXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUxLm1kJ10sXG4gICAgWzMwMDA4LCAnUHJvZmlsZSBCYWRnZXMnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTgubWQnXSxcbiAgICBbMzAwMDksICdCYWRnZSBEZWZpbml0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU4Lm1kJ10sXG4gICAgWzMwMDE3LCAnQ3JlYXRlIG9yIHVwZGF0ZSBhIHN0YWxsJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzE1Lm1kJ10sXG4gICAgWzMwMDE4LCAnQ3JlYXRlIG9yIHVwZGF0ZSBhIHByb2R1Y3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMTUubWQnXSxcbiAgICBbMzAwMjMsICdMb25nLUZvcm0gQ29udGVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yMy5tZCddLFxuICAgIFszMDAyNCwgJ0RyYWZ0IExvbmctZm9ybSBDb250ZW50JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzIzLm1kJ10sXG4gICAgWzMwMDc4LCAnQXBwbGljYXRpb24tc3BlY2lmaWMgRGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83OC5tZCddLFxuICAgIFszMDMxMSwgJ0xpdmUgRXZlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTMubWQnXSxcbiAgICBbMzAzMTUsICdVc2VyIFN0YXR1c2VzJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzM4Lm1kJ10sXG4gICAgWzMwNDAyLCAnQ2xhc3NpZmllZCBMaXN0aW5nJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk5Lm1kJ10sXG4gICAgWzMwNDAzLCAnRHJhZnQgQ2xhc3NpZmllZCBMaXN0aW5nJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk5Lm1kJ10sXG4gICAgWzMxOTIyLCAnRGF0ZS1CYXNlZCBDYWxlbmRhciBFdmVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Mi5tZCddLFxuICAgIFszMTkyMywgJ1RpbWUtQmFzZWQgQ2FsZW5kYXIgRXZlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTIubWQnXSxcbiAgICBbMzE5MjQsICdDYWxlbmRhcicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Mi5tZCddLFxuICAgIFszMTkyNSwgJ0NhbGVuZGFyIEV2ZW50IFJTVlAnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTIubWQnXSxcbiAgICBbMzE5ODksICdIYW5kbGVyIHJlY29tbWVuZGF0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzg5Lm1kJ10sXG4gICAgWzMxOTkwLCAnSGFuZGxlciBpbmZvcm1hdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci84OS5tZCddLFxuICAgIFszNDU1MCwgJ0NvbW11bml0eSBEZWZpbml0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzcyLm1kJ10sXG5dO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICBhd2FpdCBnZXRPclNldERlZmF1bHQoJ3Byb2ZpbGVJbmRleCcsIDApO1xuICAgIGF3YWl0IGdldE9yU2V0RGVmYXVsdCgncHJvZmlsZXMnLCBbYXdhaXQgZ2VuZXJhdGVQcm9maWxlKCldKTtcbiAgICBsZXQgdmVyc2lvbiA9IChhd2FpdCBzdG9yYWdlLmdldCh7IHZlcnNpb246IDAgfSkpLnZlcnNpb247XG4gICAgY29uc29sZS5sb2coJ0RCIHZlcnNpb246ICcsIHZlcnNpb24pO1xuICAgIHdoaWxlICh2ZXJzaW9uIDwgREJfVkVSU0lPTikge1xuICAgICAgICB2ZXJzaW9uID0gYXdhaXQgbWlncmF0ZSh2ZXJzaW9uLCBEQl9WRVJTSU9OKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyB2ZXJzaW9uIH0pO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gbWlncmF0ZSh2ZXJzaW9uLCBnb2FsKSB7XG4gICAgaWYgKHZlcnNpb24gPT09IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coJ01pZ3JhdGluZyB0byB2ZXJzaW9uIDEuJyk7XG4gICAgICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgICAgIHByb2ZpbGVzLmZvckVhY2gocHJvZmlsZSA9PiAocHJvZmlsZS5ob3N0cyA9IHt9KSk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gMSkge1xuICAgICAgICBjb25zb2xlLmxvZygnbWlncmF0aW5nIHRvIHZlcnNpb24gMi4nKTtcbiAgICAgICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSAyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiAzLicpO1xuICAgICAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICBwcm9maWxlcy5mb3JFYWNoKHByb2ZpbGUgPT4gKHByb2ZpbGUucmVsYXlSZW1pbmRlciA9IHRydWUpKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSAzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiA0IChlbmNyeXB0aW9uIHN1cHBvcnQpLicpO1xuICAgICAgICAvLyBObyBkYXRhIHRyYW5zZm9ybWF0aW9uIG5lZWRlZCBcdTIwMTQgZXhpc3RpbmcgcGxhaW50ZXh0IGtleXMgc3RheSBhcy1pcy5cbiAgICAgICAgLy8gRW5jcnlwdGlvbiBvbmx5IGFjdGl2YXRlcyB3aGVuIHRoZSB1c2VyIHNldHMgYSBtYXN0ZXIgcGFzc3dvcmQuXG4gICAgICAgIC8vIFdlIGp1c3QgZW5zdXJlIHRoZSBpc0VuY3J5cHRlZCBmbGFnIGV4aXN0cyBhbmQgZGVmYXVsdHMgdG8gZmFsc2UuXG4gICAgICAgIGxldCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgICAgIGlmICghZGF0YS5pc0VuY3J5cHRlZCkge1xuICAgICAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSA0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiA1IChOSVAtNDYgYnVua2VyIHN1cHBvcnQpLicpO1xuICAgICAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICBwcm9maWxlcy5mb3JFYWNoKHByb2ZpbGUgPT4ge1xuICAgICAgICAgICAgaWYgKCFwcm9maWxlLnR5cGUpIHByb2ZpbGUudHlwZSA9ICdsb2NhbCc7XG4gICAgICAgICAgICBpZiAocHJvZmlsZS5idW5rZXJVcmwgPT09IHVuZGVmaW5lZCkgcHJvZmlsZS5idW5rZXJVcmwgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHByb2ZpbGUucmVtb3RlUHVia2V5ID09PSB1bmRlZmluZWQpIHByb2ZpbGUucmVtb3RlUHVia2V5ID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gNSkge1xuICAgICAgICBjb25zb2xlLmxvZygnTWlncmF0aW5nIHRvIHZlcnNpb24gNiAocGxhdGZvcm0gc3luYyBzdXBwb3J0KS4nKTtcbiAgICAgICAgY29uc3Qgbm93ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgICAgIHByb2ZpbGVzLmZvckVhY2gocHJvZmlsZSA9PiB7XG4gICAgICAgICAgICBpZiAocHJvZmlsZS51cGRhdGVkQXQgPT09IHVuZGVmaW5lZCkgcHJvZmlsZS51cGRhdGVkQXQgPSBub3c7XG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzLCBwbGF0Zm9ybVN5bmNFbmFibGVkOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm4gdmVyc2lvbiArIDE7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZXMoKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBwcm9maWxlczogW10gfSk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLnByb2ZpbGVzO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZShpbmRleCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcmV0dXJuIHByb2ZpbGVzW2luZGV4XTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFByb2ZpbGVOYW1lcygpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIHJldHVybiBwcm9maWxlcy5tYXAocCA9PiBwLm5hbWUpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZUluZGV4KCkge1xuICAgIGNvbnN0IGluZGV4ID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBwcm9maWxlSW5kZXg6IDAgfSk7XG4gICAgcmV0dXJuIGluZGV4LnByb2ZpbGVJbmRleDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFByb2ZpbGVJbmRleChwcm9maWxlSW5kZXgpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVJbmRleCB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVByb2ZpbGUoaW5kZXgpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGxldCBwcm9maWxlSW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBwcm9maWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIGlmIChwcm9maWxlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICBhd2FpdCBjbGVhckRhdGEoKTsgLy8gSWYgd2UgaGF2ZSBkZWxldGVkIGFsbCBvZiB0aGUgcHJvZmlsZXMsIGxldCdzIGp1c3Qgc3RhcnQgZnJlc2ggd2l0aCBhbGwgbmV3IGRhdGFcbiAgICAgICAgYXdhaXQgaW5pdGlhbGl6ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIHRoZSBpbmRleCBkZWxldGVkIHdhcyB0aGUgYWN0aXZlIHByb2ZpbGUsIGNoYW5nZSB0aGUgYWN0aXZlIHByb2ZpbGUgdG8gdGhlIG5leHQgb25lXG4gICAgICAgIGxldCBuZXdJbmRleCA9XG4gICAgICAgICAgICBwcm9maWxlSW5kZXggPT09IGluZGV4ID8gTWF0aC5tYXgoaW5kZXggLSAxLCAwKSA6IHByb2ZpbGVJbmRleDtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcywgcHJvZmlsZUluZGV4OiBuZXdJbmRleCB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckRhdGEoKSB7XG4gICAgbGV0IGlnbm9yZUluc3RhbGxIb29rID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpZ25vcmVJbnN0YWxsSG9vazogZmFsc2UgfSk7XG4gICAgYXdhaXQgc3RvcmFnZS5jbGVhcigpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KGlnbm9yZUluc3RhbGxIb29rKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVQcml2YXRlS2V5KCkge1xuICAgIHJldHVybiBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdnZW5lcmF0ZVByaXZhdGVLZXknIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVQcm9maWxlKG5hbWUgPSAnRGVmYXVsdCBOb3N0ciBQcm9maWxlJywgdHlwZSA9ICdsb2NhbCcpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBuYW1lLFxuICAgICAgICBwcml2S2V5OiB0eXBlID09PSAnbG9jYWwnID8gYXdhaXQgZ2VuZXJhdGVQcml2YXRlS2V5KCkgOiAnJyxcbiAgICAgICAgaG9zdHM6IHt9LFxuICAgICAgICByZWxheXM6IFJFQ09NTUVOREVEX1JFTEFZUy5tYXAociA9PiAoeyB1cmw6IHIuaHJlZiwgcmVhZDogdHJ1ZSwgd3JpdGU6IHRydWUgfSkpLFxuICAgICAgICByZWxheVJlbWluZGVyOiBmYWxzZSxcbiAgICAgICAgdHlwZSxcbiAgICAgICAgYnVua2VyVXJsOiBudWxsLFxuICAgICAgICByZW1vdGVQdWJrZXk6IG51bGwsXG4gICAgICAgIHVwZGF0ZWRBdDogTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksXG4gICAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0T3JTZXREZWZhdWx0KGtleSwgZGVmKSB7XG4gICAgbGV0IHZhbCA9IChhd2FpdCBzdG9yYWdlLmdldChrZXkpKVtrZXldO1xuICAgIGlmICh2YWwgPT0gbnVsbCB8fCB2YWwgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW2tleV06IGRlZiB9KTtcbiAgICAgICAgcmV0dXJuIGRlZjtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVByb2ZpbGVOYW1lKGluZGV4LCBwcm9maWxlTmFtZSkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcHJvZmlsZXNbaW5kZXhdLm5hbWUgPSBwcm9maWxlTmFtZTtcbiAgICBwcm9maWxlc1tpbmRleF0udXBkYXRlZEF0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVQcml2YXRlS2V5KGluZGV4LCBwcml2YXRlS2V5KSB7XG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBraW5kOiAnc2F2ZVByaXZhdGVLZXknLFxuICAgICAgICBwYXlsb2FkOiBbaW5kZXgsIHByaXZhdGVLZXldLFxuICAgIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbmV3UHJvZmlsZSgpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGNvbnN0IG5ld1Byb2ZpbGUgPSBhd2FpdCBnZW5lcmF0ZVByb2ZpbGUoJ05ldyBQcm9maWxlJyk7XG4gICAgcHJvZmlsZXMucHVzaChuZXdQcm9maWxlKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xuICAgIHJldHVybiBwcm9maWxlcy5sZW5ndGggLSAxO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbmV3QnVua2VyUHJvZmlsZShuYW1lID0gJ05ldyBCdW5rZXInLCBidW5rZXJVcmwgPSBudWxsKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgZ2VuZXJhdGVQcm9maWxlKG5hbWUsICdidW5rZXInKTtcbiAgICBwcm9maWxlLmJ1bmtlclVybCA9IGJ1bmtlclVybDtcbiAgICBwcm9maWxlcy5wdXNoKHByb2ZpbGUpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLmxlbmd0aCAtIDE7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRSZWxheXMocHJvZmlsZUluZGV4KSB7XG4gICAgbGV0IHByb2ZpbGUgPSBhd2FpdCBnZXRQcm9maWxlKHByb2ZpbGVJbmRleCk7XG4gICAgcmV0dXJuIHByb2ZpbGUucmVsYXlzIHx8IFtdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVJlbGF5cyhwcm9maWxlSW5kZXgsIHJlbGF5cykge1xuICAgIC8vIEhhdmluZyBhbiBBbHBpbmUgcHJveHkgb2JqZWN0IGFzIGEgc3ViLW9iamVjdCBkb2VzIG5vdCBzZXJpYWxpemUgY29ycmVjdGx5IGluIHN0b3JhZ2UsXG4gICAgLy8gc28gd2UgYXJlIHByZS1zZXJpYWxpemluZyBoZXJlIGJlZm9yZSBhc3NpZ25pbmcgaXQgdG8gdGhlIHByb2ZpbGUsIHNvIHRoZSBwcm94eVxuICAgIC8vIG9iaiBkb2Vzbid0IGJ1ZyBvdXQuXG4gICAgbGV0IGZpeGVkUmVsYXlzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShyZWxheXMpKTtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGxldCBwcm9maWxlID0gcHJvZmlsZXNbcHJvZmlsZUluZGV4XTtcbiAgICBwcm9maWxlLnJlbGF5cyA9IGZpeGVkUmVsYXlzO1xuICAgIHByb2ZpbGUudXBkYXRlZEF0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldChpdGVtKSB7XG4gICAgcmV0dXJuIChhd2FpdCBzdG9yYWdlLmdldChpdGVtKSlbaXRlbV07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZXJtaXNzaW9ucyhpbmRleCA9IG51bGwpIHtcbiAgICBpZiAoaW5kZXggPT0gbnVsbCkge1xuICAgICAgICBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIH1cbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUoaW5kZXgpO1xuICAgIGxldCBob3N0cyA9IGF3YWl0IHByb2ZpbGUuaG9zdHM7XG4gICAgcmV0dXJuIGhvc3RzO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGVybWlzc2lvbihob3N0LCBhY3Rpb24pIHtcbiAgICBsZXQgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUoaW5kZXgpO1xuICAgIGNvbnN0IGhvc3RzID0gcHJvZmlsZT8uaG9zdHMgfHwge307XG4gICAgLy8gTkstMDM6IGdyYW50cyBhcmUgbm93IGtleWVkIG9uIHRoZSBmdWxsIG9yaWdpbiAoc2NoZW1lK2hvc3RbOnBvcnRdKS5cbiAgICBpZiAoaG9zdHNbaG9zdF0/LlthY3Rpb25dKSByZXR1cm4gaG9zdHNbaG9zdF1bYWN0aW9uXTtcbiAgICAvLyBUcmFuc2l0aW9uOiBhY2NlcHQgbGVnYWN5IGdyYW50cyB0aGF0IHdlcmUga2V5ZWQgb24gdGhlIGJhcmUgaG9zdG5hbWUuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbGVnYWN5ID0gbmV3IFVSTChob3N0KS5ob3N0O1xuICAgICAgICBpZiAobGVnYWN5ICYmIGhvc3RzW2xlZ2FjeV0/LlthY3Rpb25dKSByZXR1cm4gaG9zdHNbbGVnYWN5XVthY3Rpb25dO1xuICAgIH0gY2F0Y2ggeyAvKiBob3N0IHdhcyBub3QgYSBmdWxsIG9yaWdpbjsgbm90aGluZyB0byBtaWdyYXRlICovIH1cbiAgICByZXR1cm4gJ2Fzayc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRQZXJtaXNzaW9uKGhvc3QsIGFjdGlvbiwgcGVybSwgaW5kZXggPSBudWxsKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBpZiAoIWluZGV4KSB7XG4gICAgICAgIGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgfVxuICAgIGxldCBwcm9maWxlID0gcHJvZmlsZXNbaW5kZXhdO1xuICAgIGxldCBuZXdQZXJtcyA9IHByb2ZpbGUuaG9zdHNbaG9zdF0gfHwge307XG4gICAgbmV3UGVybXMgPSB7IC4uLm5ld1Blcm1zLCBbYWN0aW9uXTogcGVybSB9O1xuICAgIHByb2ZpbGUuaG9zdHNbaG9zdF0gPSBuZXdQZXJtcztcbiAgICBwcm9maWxlLnVwZGF0ZWRBdCA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xuICAgIHByb2ZpbGVzW2luZGV4XSA9IHByb2ZpbGU7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh1bWFuUGVybWlzc2lvbihwKSB7XG4gICAgLy8gSGFuZGxlIHNwZWNpYWwgY2FzZSB3aGVyZSBldmVudCBzaWduaW5nIGluY2x1ZGVzIGEga2luZCBudW1iZXJcbiAgICBpZiAocC5zdGFydHNXaXRoKCdzaWduRXZlbnQ6JykpIHtcbiAgICAgICAgbGV0IFtlLCBuXSA9IHAuc3BsaXQoJzonKTtcbiAgICAgICAgbiA9IHBhcnNlSW50KG4pO1xuICAgICAgICBsZXQgbm5hbWUgPSBLSU5EUy5maW5kKGsgPT4ga1swXSA9PT0gbik/LlsxXSB8fCBgVW5rbm93biAoS2luZCAke259KWA7XG4gICAgICAgIHJldHVybiBgU2lnbiBldmVudDogJHtubmFtZX1gO1xuICAgIH1cblxuICAgIHN3aXRjaCAocCkge1xuICAgICAgICBjYXNlICdnZXRQdWJLZXknOlxuICAgICAgICAgICAgcmV0dXJuICdSZWFkIHB1YmxpYyBrZXknO1xuICAgICAgICBjYXNlICdzaWduRXZlbnQnOlxuICAgICAgICAgICAgcmV0dXJuICdTaWduIGV2ZW50JztcbiAgICAgICAgY2FzZSAnZ2V0UmVsYXlzJzpcbiAgICAgICAgICAgIHJldHVybiAnUmVhZCByZWxheSBsaXN0JztcbiAgICAgICAgY2FzZSAnbmlwMDQuZW5jcnlwdCc6XG4gICAgICAgICAgICByZXR1cm4gJ0VuY3J5cHQgcHJpdmF0ZSBtZXNzYWdlIChOSVAtMDQpJztcbiAgICAgICAgY2FzZSAnbmlwMDQuZGVjcnlwdCc6XG4gICAgICAgICAgICByZXR1cm4gJ0RlY3J5cHQgcHJpdmF0ZSBtZXNzYWdlIChOSVAtMDQpJztcbiAgICAgICAgY2FzZSAnbmlwNDQuZW5jcnlwdCc6XG4gICAgICAgICAgICByZXR1cm4gJ0VuY3J5cHQgcHJpdmF0ZSBtZXNzYWdlIChOSVAtNDQpJztcbiAgICAgICAgY2FzZSAnbmlwNDQuZGVjcnlwdCc6XG4gICAgICAgICAgICByZXR1cm4gJ0RlY3J5cHQgcHJpdmF0ZSBtZXNzYWdlIChOSVAtNDQpJztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiAnVW5rbm93bic7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVLZXkoa2V5KSB7XG4gICAgY29uc3QgaGV4TWF0Y2ggPSAvXltcXGRhLWZdezY0fSQvaS50ZXN0KGtleSk7XG4gICAgY29uc3QgYjMyTWF0Y2ggPSAvXm5zZWMxW3FwenJ5OXg4Z2YydHZkdzBzM2puNTRraGNlNm11YTdsXXs1OH0kLy50ZXN0KGtleSk7XG5cbiAgICByZXR1cm4gaGV4TWF0Y2ggfHwgYjMyTWF0Y2ggfHwgaXNOY3J5cHRzZWMoa2V5KSB8fCBpc1ZhbGlkU2VlZFBocmFzZShrZXkpO1xufVxuXG5leHBvcnQgeyBsb29rc0xpa2VTZWVkUGhyYXNlIH07XG5leHBvcnQgY29uc3QgaXNTZWVkUGhyYXNlID0gaXNWYWxpZFNlZWRQaHJhc2U7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05jcnlwdHNlYyhrZXkpIHtcbiAgICByZXR1cm4gL15uY3J5cHRzZWMxW3FwenJ5OXg4Z2YydHZkdzBzM2puNTRraGNlNm11YTdsXSskLy50ZXN0KGtleSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZWF0dXJlKG5hbWUpIHtcbiAgICBsZXQgZm5hbWUgPSBgZmVhdHVyZToke25hbWV9YDtcbiAgICBsZXQgZiA9IGF3YWl0IGFwaS5zdG9yYWdlLmxvY2FsLmdldCh7IFtmbmFtZV06IGZhbHNlIH0pO1xuICAgIHJldHVybiBmW2ZuYW1lXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbGF5UmVtaW5kZXIoKSB7XG4gICAgbGV0IGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgbGV0IHByb2ZpbGUgPSBhd2FpdCBnZXRQcm9maWxlKGluZGV4KTtcbiAgICByZXR1cm4gcHJvZmlsZS5yZWxheVJlbWluZGVyO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdG9nZ2xlUmVsYXlSZW1pbmRlcigpIHtcbiAgICBsZXQgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIHByb2ZpbGVzW2luZGV4XS5yZWxheVJlbWluZGVyID0gZmFsc2U7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldE5wdWIoKSB7XG4gICAgbGV0IGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgcmV0dXJuIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ2dldE5wdWInLFxuICAgICAgICBwYXlsb2FkOiBpbmRleCxcbiAgICB9KTtcbn1cblxuLy8gLS0tIE1hc3RlciBwYXNzd29yZCBlbmNyeXB0aW9uIGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgbWFzdGVyIHBhc3N3b3JkIGVuY3J5cHRpb24gaXMgYWN0aXZlLlxuICpcbiAqIERlZmVuc2l2ZTogY2hlY2tzIG11bHRpcGxlIGluZGljYXRvcnMsIG5vdCBqdXN0IHRoZSBib29sZWFuIGZsYWcuXG4gKiBJZiBwYXNzd29yZEhhc2ggb3IgZW5jcnlwdGVkIGtleSBibG9icyBleGlzdCBidXQgdGhlIGlzRW5jcnlwdGVkIGZsYWdcbiAqIGlzIGZhbHNlIChpbmNvbnNpc3RlbnQgc3RhdGUgZnJvbSBzZXJ2aWNlIHdvcmtlciBjcmFzaCwgcmFjZSBjb25kaXRpb24sXG4gKiBldGMuKSwgc2VsZi1oZWFscyBieSBzZXR0aW5nIHRoZSBmbGFnIGJhY2sgdG8gdHJ1ZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzRW5jcnlwdGVkKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IGlzRW5jcnlwdGVkOiBmYWxzZSwgcGFzc3dvcmRIYXNoOiBudWxsLCBwcm9maWxlczogW10gfSk7XG4gICAgaWYgKGRhdGEuaXNFbmNyeXB0ZWQpIHJldHVybiB0cnVlO1xuXG4gICAgLy8gRmFsbGJhY2sgMTogcGFzc3dvcmRIYXNoIGV4aXN0cyBidXQgZmxhZyBpcyBzdGFsZVxuICAgIGlmIChkYXRhLnBhc3N3b3JkSGFzaCkge1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IGlzRW5jcnlwdGVkOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBGYWxsYmFjayAyOiBlbmNyeXB0ZWQgYmxvYnMgZXhpc3QgaW4gcHJvZmlsZXMgYnV0IGZsYWcgKyBoYXNoIGFyZSBtaXNzaW5nXG4gICAgZm9yIChjb25zdCBwcm9maWxlIG9mIGRhdGEucHJvZmlsZXMpIHtcbiAgICAgICAgaWYgKGlzRW5jcnlwdGVkQmxvYihwcm9maWxlLnByaXZLZXkpKSB7XG4gICAgICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IGlzRW5jcnlwdGVkOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogU3RvcmUgdGhlIHBhc3N3b3JkIHZlcmlmaWNhdGlvbiBoYXNoIChuZXZlciB0aGUgcGFzc3dvcmQgaXRzZWxmKS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFBhc3N3b3JkSGFzaChwYXNzd29yZCkge1xuICAgIGNvbnN0IHsgaGFzaCwgc2FsdCB9ID0gYXdhaXQgaGFzaFBhc3N3b3JkKHBhc3N3b3JkKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7XG4gICAgICAgIHBhc3N3b3JkSGFzaDogaGFzaCxcbiAgICAgICAgcGFzc3dvcmRTYWx0OiBzYWx0LFxuICAgICAgICBpc0VuY3J5cHRlZDogdHJ1ZSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBWZXJpZnkgYSBwYXNzd29yZCBhZ2FpbnN0IHRoZSBzdG9yZWQgaGFzaC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrUGFzc3dvcmQocGFzc3dvcmQpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoe1xuICAgICAgICBwYXNzd29yZEhhc2g6IG51bGwsXG4gICAgICAgIHBhc3N3b3JkU2FsdDogbnVsbCxcbiAgICB9KTtcbiAgICBpZiAoIWRhdGEucGFzc3dvcmRIYXNoIHx8ICFkYXRhLnBhc3N3b3JkU2FsdCkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB2ZXJpZnlQYXNzd29yZChwYXNzd29yZCwgZGF0YS5wYXNzd29yZEhhc2gsIGRhdGEucGFzc3dvcmRTYWx0KTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgbWFzdGVyIHBhc3N3b3JkIHByb3RlY3Rpb24gXHUyMDE0IGNsZWFycyBoYXNoIGFuZCBkZWNyeXB0cyBhbGwga2V5cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZVBhc3N3b3JkUHJvdGVjdGlvbihwYXNzd29yZCkge1xuICAgIGNvbnN0IHZhbGlkID0gYXdhaXQgY2hlY2tQYXNzd29yZChwYXNzd29yZCk7XG4gICAgaWYgKCF2YWxpZCkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHBhc3N3b3JkJyk7XG5cbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb2ZpbGVzW2ldLnR5cGUgPT09ICdidW5rZXInKSBjb250aW51ZTtcbiAgICAgICAgaWYgKGlzRW5jcnlwdGVkQmxvYihwcm9maWxlc1tpXS5wcml2S2V5KSkge1xuICAgICAgICAgICAgcHJvZmlsZXNbaV0ucHJpdktleSA9IGF3YWl0IGRlY3J5cHQocHJvZmlsZXNbaV0ucHJpdktleSwgcGFzc3dvcmQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHtcbiAgICAgICAgcHJvZmlsZXMsXG4gICAgICAgIGlzRW5jcnlwdGVkOiBmYWxzZSxcbiAgICAgICAgcGFzc3dvcmRIYXNoOiBudWxsLFxuICAgICAgICBwYXNzd29yZFNhbHQ6IG51bGwsXG4gICAgfSk7XG59XG5cbi8qKlxuICogRW5jcnlwdCBhbGwgcHJvZmlsZSBwcml2YXRlIGtleXMgd2l0aCBhIG1hc3RlciBwYXNzd29yZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHRBbGxLZXlzKHBhc3N3b3JkKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb2ZpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9maWxlc1tpXS50eXBlID09PSAnYnVua2VyJykgY29udGludWU7XG4gICAgICAgIGlmICghaXNFbmNyeXB0ZWRCbG9iKHByb2ZpbGVzW2ldLnByaXZLZXkpKSB7XG4gICAgICAgICAgICBwcm9maWxlc1tpXS5wcml2S2V5ID0gYXdhaXQgZW5jcnlwdChwcm9maWxlc1tpXS5wcml2S2V5LCBwYXNzd29yZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXdhaXQgc2V0UGFzc3dvcmRIYXNoKHBhc3N3b3JkKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xufVxuXG4vKipcbiAqIFJlLWVuY3J5cHQgYWxsIGtleXMgd2l0aCBhIG5ldyBwYXNzd29yZCAocmVxdWlyZXMgdGhlIG9sZCBwYXNzd29yZCkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGFuZ2VQYXNzd29yZEZvcktleXMob2xkUGFzc3dvcmQsIG5ld1Bhc3N3b3JkKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb2ZpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9maWxlc1tpXS50eXBlID09PSAnYnVua2VyJykgY29udGludWU7XG4gICAgICAgIGxldCBoZXggPSBwcm9maWxlc1tpXS5wcml2S2V5O1xuICAgICAgICBpZiAoaXNFbmNyeXB0ZWRCbG9iKGhleCkpIHtcbiAgICAgICAgICAgIGhleCA9IGF3YWl0IGRlY3J5cHQoaGV4LCBvbGRQYXNzd29yZCk7XG4gICAgICAgIH1cbiAgICAgICAgcHJvZmlsZXNbaV0ucHJpdktleSA9IGF3YWl0IGVuY3J5cHQoaGV4LCBuZXdQYXNzd29yZCk7XG4gICAgfVxuICAgIGNvbnN0IHsgaGFzaCwgc2FsdCB9ID0gYXdhaXQgaGFzaFBhc3N3b3JkKG5ld1Bhc3N3b3JkKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7XG4gICAgICAgIHByb2ZpbGVzLFxuICAgICAgICBwYXNzd29yZEhhc2g6IGhhc2gsXG4gICAgICAgIHBhc3N3b3JkU2FsdDogc2FsdCxcbiAgICAgICAgaXNFbmNyeXB0ZWQ6IHRydWUsXG4gICAgfSk7XG59XG5cbi8qKlxuICogRGVjcnlwdCBhIHNpbmdsZSBwcm9maWxlJ3MgcHJpdmF0ZSBrZXksIHJldHVybmluZyB0aGUgaGV4IHN0cmluZy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERlY3J5cHRlZFByaXZLZXkocHJvZmlsZSwgcGFzc3dvcmQpIHtcbiAgICBpZiAocHJvZmlsZS50eXBlID09PSAnYnVua2VyJykgcmV0dXJuICcnO1xuICAgIGlmIChpc0VuY3J5cHRlZEJsb2IocHJvZmlsZS5wcml2S2V5KSkge1xuICAgICAgICByZXR1cm4gZGVjcnlwdChwcm9maWxlLnByaXZLZXksIHBhc3N3b3JkKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb2ZpbGUucHJpdktleTtcbn1cblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGEgc3RvcmVkIHZhbHVlIGxvb2tzIGxpa2UgYW4gZW5jcnlwdGVkIGJsb2IuXG4gKiBFbmNyeXB0ZWQgYmxvYnMgYXJlIEpTT04gc3RyaW5ncyBjb250YWluaW5nIHtzYWx0LCBpdiwgY2lwaGVydGV4dH0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VuY3J5cHRlZEJsb2IodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICByZXR1cm4gISEocGFyc2VkLnNhbHQgJiYgcGFyc2VkLml2ICYmIHBhcnNlZC5jaXBoZXJ0ZXh0KTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiIsICIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uub25DaGFuZ2VkIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgb25DaGFuZ2VkOiBfYnJvd3Nlci5zdG9yYWdlPy5vbkNoYW5nZWQgfHwgbnVsbCxcbn07XG5cbi8vIC0tLSB0YWJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnRhYnMgPSB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5jcmVhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcXVlcnkoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5xdWVyeSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucXVlcnkpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgdXBkYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMudXBkYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy51cGRhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0Q3VycmVudCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gYWxhcm1zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGNocm9tZS5hbGFybXMgc3Vydml2ZXMgTVYzIHNlcnZpY2Utd29ya2VyIGV2aWN0aW9uOyBzZXRUaW1lb3V0IGRvZXMgbm90LlxuYXBpLmFsYXJtcyA9IF9icm93c2VyLmFsYXJtcyA/IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICAvLyBhbGFybXMuY3JlYXRlIGlzIHN5bmNocm9ub3VzIG9uIENocm9tZSwgcmV0dXJucyBQcm9taXNlIG9uIEZpcmVmb3gvU2FmYXJpXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IF9icm93c2VyLmFsYXJtcy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIHJldHVybiByZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nID8gcmVzdWx0IDogUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfSxcbiAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5hbGFybXMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5hbGFybXMsIF9icm93c2VyLmFsYXJtcy5jbGVhcikoLi4uYXJncyk7XG4gICAgfSxcbiAgICBvbkFsYXJtOiBfYnJvd3Nlci5hbGFybXMub25BbGFybSxcbn0gOiBudWxsO1xuXG5leHBvcnQgeyBhcGksIGlzQ2hyb21lIH07XG4iLCAiLyoqXG4gKiBFbmNyeXB0aW9uIHV0aWxpdGllcyBmb3IgTm9zdHJLZXkgbWFzdGVyIHBhc3N3b3JkIGZlYXR1cmUuXG4gKlxuICogVXNlcyBXZWIgQ3J5cHRvIEFQSSAoY3J5cHRvLnN1YnRsZSkgZXhjbHVzaXZlbHkgXHUyMDE0IG5vIGV4dGVybmFsIGxpYnJhcmllcy5cbiAqIC0gUEJLREYyIHdpdGggNjAwLDAwMCBpdGVyYXRpb25zIChPV0FTUCAyMDIzIHJlY29tbWVuZGF0aW9uKVxuICogLSBBRVMtMjU2LUdDTSBmb3IgYXV0aGVudGljYXRlZCBlbmNyeXB0aW9uXG4gKiAtIFJhbmRvbSBzYWx0ICgxNiBieXRlcykgYW5kIElWICgxMiBieXRlcykgcGVyIG9wZXJhdGlvblxuICogLSBBbGwgYmluYXJ5IGRhdGEgZW5jb2RlZCBhcyBiYXNlNjQgZm9yIEpTT04gc3RvcmFnZSBjb21wYXRpYmlsaXR5XG4gKi9cblxuY29uc3QgUEJLREYyX0lURVJBVElPTlMgPSA2MDBfMDAwO1xuY29uc3QgU0FMVF9CWVRFUyA9IDE2O1xuY29uc3QgSVZfQllURVMgPSAxMjtcblxuLy8gLS0tIEJhc2U2NCBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBhcnJheUJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcikge1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBsZXQgYmluYXJ5ID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiBidG9hKGJpbmFyeSk7XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0KSB7XG4gICAgY29uc3QgYmluYXJ5ID0gYXRvYihiYXNlNjQpO1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVzLmJ1ZmZlcjtcbn1cblxuLy8gLS0tIEtleSBkZXJpdmF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIERlcml2ZSBhbiBBRVMtMjU2LUdDTSBDcnlwdG9LZXkgZnJvbSBhIHBhc3N3b3JkIGFuZCBzYWx0IHVzaW5nIFBCS0RGMi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcGFyYW0ge0FycmF5QnVmZmVyfFVpbnQ4QXJyYXl9IHNhbHQgLSAxNi1ieXRlIHNhbHRcbiAqIEByZXR1cm5zIHtQcm9taXNlPENyeXB0b0tleT59IEFFUy0yNTYtR0NNIGtleVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVyaXZlS2V5KHBhc3N3b3JkLCBzYWx0KSB7XG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3Qga2V5TWF0ZXJpYWwgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgJ3JhdycsXG4gICAgICAgIGVuYy5lbmNvZGUocGFzc3dvcmQpLFxuICAgICAgICAnUEJLREYyJyxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFsnZGVyaXZlS2V5J11cbiAgICApO1xuXG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuZGVyaXZlS2V5KFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnUEJLREYyJyxcbiAgICAgICAgICAgIHNhbHQ6IHNhbHQgaW5zdGFuY2VvZiBVaW50OEFycmF5ID8gc2FsdCA6IG5ldyBVaW50OEFycmF5KHNhbHQpLFxuICAgICAgICAgICAgaXRlcmF0aW9uczogUEJLREYyX0lURVJBVElPTlMsXG4gICAgICAgICAgICBoYXNoOiAnU0hBLTI1NicsXG4gICAgICAgIH0sXG4gICAgICAgIGtleU1hdGVyaWFsLFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgbGVuZ3RoOiAyNTYgfSxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFsnZW5jcnlwdCcsICdkZWNyeXB0J11cbiAgICApO1xufVxuXG4vLyAtLS0gRW5jcnlwdCB3aXRoIHByZS1kZXJpdmVkIGtleSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRW5jcnlwdCBhIHBsYWludGV4dCBzdHJpbmcgdXNpbmcgYSBwcmUtZGVyaXZlZCBDcnlwdG9LZXkgYW5kIGl0cyBzYWx0LlxuICpcbiAqIFRoaXMgYXZvaWRzIGhvbGRpbmcgdGhlIHJhdyBwYXNzd29yZCBpbiBtZW1vcnkgXHUyMDE0IHRoZSBjYWxsZXIgZGVyaXZlcyB0aGVcbiAqIGtleSBvbmNlICh2aWEgZGVyaXZlS2V5KSBhbmQgcmV1c2VzIGl0IGZvciB0aGUgc2Vzc2lvbi4gIFRoZSBvdXRwdXRcbiAqIGZvcm1hdCBpcyBpZGVudGljYWwgdG8gZW5jcnlwdCgpLCBzbyBkZWNyeXB0KCkgY2FuIHN0aWxsIGJlIHVzZWQgd2l0aFxuICogdGhlIG9yaWdpbmFsIHBhc3N3b3JkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwbGFpbnRleHQgICAgICAgICAgLSBUaGUgZGF0YSB0byBlbmNyeXB0XG4gKiBAcGFyYW0ge0NyeXB0b0tleX0ga2V5ICAgICAgICAgICAgIC0gQUVTLTI1Ni1HQ00ga2V5IGZyb20gZGVyaXZlS2V5KClcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gc2FsdCAgICAgICAgICAgLSBUaGUgc2FsdCB0aGF0IHdhcyB1c2VkIHRvIGRlcml2ZSBga2V5YFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gSlNPTiBzdHJpbmc6IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfSAoYWxsIGJhc2U2NClcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHRXaXRoS2V5KHBsYWludGV4dCwga2V5LCBzYWx0KSB7XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgZW5jLmVuY29kZShwbGFpbnRleHQpXG4gICAgKTtcblxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHNhbHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoc2FsdCksXG4gICAgICAgIGl2OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGl2KSxcbiAgICAgICAgY2lwaGVydGV4dDogYXJyYXlCdWZmZXJUb0Jhc2U2NChjaXBoZXJ0ZXh0KSxcbiAgICB9KTtcbn1cblxuLy8gLS0tIEVuY3J5cHQgLyBEZWNyeXB0IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEVuY3J5cHQgYSBwbGFpbnRleHQgc3RyaW5nIHdpdGggYSBwYXNzd29yZC5cbiAqXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gc2FsdCAoMTYgYnl0ZXMpIGFuZCBJViAoMTIgYnl0ZXMpLCBkZXJpdmVzIGFuXG4gKiBBRVMtMjU2LUdDTSBrZXkgdmlhIFBCS0RGMiwgYW5kIHJldHVybnMgYSBKU09OIHN0cmluZyBjb250YWluaW5nXG4gKiBiYXNlNjQtZW5jb2RlZCBzYWx0LCBpdiwgYW5kIGNpcGhlcnRleHQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBsYWludGV4dCAtIFRoZSBkYXRhIHRvIGVuY3J5cHQgKGUuZy4gaGV4IHByaXZhdGUga2V5KVxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkICAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IEpTT04gc3RyaW5nOiB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gKGFsbCBiYXNlNjQpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0KHBsYWludGV4dCwgcGFzc3dvcmQpIHtcbiAgICBjb25zdCBzYWx0ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShTQUxUX0JZVEVTKSk7XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZGVyaXZlS2V5KHBhc3N3b3JkLCBzYWx0KTtcblxuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGVuYy5lbmNvZGUocGxhaW50ZXh0KVxuICAgICk7XG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgICAgICBpdjogYXJyYXlCdWZmZXJUb0Jhc2U2NChpdiksXG4gICAgICAgIGNpcGhlcnRleHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoY2lwaGVydGV4dCksXG4gICAgfSk7XG59XG5cbi8qKlxuICogRGVjcnlwdCBkYXRhIHRoYXQgd2FzIGVuY3J5cHRlZCB3aXRoIGBlbmNyeXB0KClgLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbmNyeXB0ZWREYXRhIC0gSlNPTiBzdHJpbmcgZnJvbSBlbmNyeXB0KClcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgICAgIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gVGhlIG9yaWdpbmFsIHBsYWludGV4dFxuICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBwYXNzd29yZCBpcyB3cm9uZyBvciBkYXRhIGlzIHRhbXBlcmVkIHdpdGhcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHQoZW5jcnlwdGVkRGF0YSwgcGFzc3dvcmQpIHtcbiAgICBjb25zdCB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuXG4gICAgY29uc3Qgc2FsdEJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoc2FsdCkpO1xuICAgIGNvbnN0IGl2QnVmID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihpdikpO1xuICAgIGNvbnN0IGN0QnVmID0gYmFzZTY0VG9BcnJheUJ1ZmZlcihjaXBoZXJ0ZXh0KTtcblxuICAgIGNvbnN0IGtleSA9IGF3YWl0IGRlcml2ZUtleShwYXNzd29yZCwgc2FsdEJ1Zik7XG5cbiAgICBjb25zdCBwbGFpbkJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2OiBpdkJ1ZiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGN0QnVmXG4gICAgKTtcblxuICAgIGNvbnN0IGRlYyA9IG5ldyBUZXh0RGVjb2RlcigpO1xuICAgIHJldHVybiBkZWMuZGVjb2RlKHBsYWluQnVmKTtcbn1cblxuLy8gLS0tIFBhc3N3b3JkIGhhc2hpbmcgKGZvciB2ZXJpZmljYXRpb24pIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEhhc2ggYSBwYXNzd29yZCB3aXRoIFBCS0RGMiBmb3IgdmVyaWZpY2F0aW9uIHB1cnBvc2VzLlxuICpcbiAqIFRoaXMgcHJvZHVjZXMgYSBzZXBhcmF0ZSBoYXNoIChub3QgdGhlIGVuY3J5cHRpb24ga2V5KSB0aGF0IGNhbiBiZSBzdG9yZWRcbiAqIHRvIHZlcmlmeSB0aGUgcGFzc3dvcmQgd2l0aG91dCBuZWVkaW5nIHRvIGF0dGVtcHQgZGVjcnlwdGlvbi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IFtzYWx0XSAtIE9wdGlvbmFsIHNhbHQ7IGdlbmVyYXRlZCBpZiBvbWl0dGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx7IGhhc2g6IHN0cmluZywgc2FsdDogc3RyaW5nIH0+fSBiYXNlNjQtZW5jb2RlZCBoYXNoIGFuZCBzYWx0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYXNoUGFzc3dvcmQocGFzc3dvcmQsIHNhbHQpIHtcbiAgICBpZiAoIXNhbHQpIHtcbiAgICAgICAgc2FsdCA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoU0FMVF9CWVRFUykpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNhbHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHNhbHQgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKHNhbHQpKTtcbiAgICB9XG5cbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBrZXlNYXRlcmlhbCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgZW5jLmVuY29kZShwYXNzd29yZCksXG4gICAgICAgICdQQktERjInLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydkZXJpdmVCaXRzJ11cbiAgICApO1xuXG4gICAgY29uc3QgaGFzaEJpdHMgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlcml2ZUJpdHMoXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdQQktERjInLFxuICAgICAgICAgICAgc2FsdCxcbiAgICAgICAgICAgIGl0ZXJhdGlvbnM6IFBCS0RGMl9JVEVSQVRJT05TLFxuICAgICAgICAgICAgaGFzaDogJ1NIQS0yNTYnLFxuICAgICAgICB9LFxuICAgICAgICBrZXlNYXRlcmlhbCxcbiAgICAgICAgMjU2XG4gICAgKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGhhc2g6IGFycmF5QnVmZmVyVG9CYXNlNjQoaGFzaEJpdHMpLFxuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgIH07XG59XG5cbi8qKlxuICogVmVyaWZ5IGEgcGFzc3dvcmQgYWdhaW5zdCBhIHN0b3JlZCBoYXNoLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgIC0gVGhlIHBhc3N3b3JkIHRvIHZlcmlmeVxuICogQHBhcmFtIHtzdHJpbmd9IHN0b3JlZEhhc2ggLSBiYXNlNjQtZW5jb2RlZCBoYXNoIGZyb20gaGFzaFBhc3N3b3JkKClcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdG9yZWRTYWx0IC0gYmFzZTY0LWVuY29kZWQgc2FsdCBmcm9tIGhhc2hQYXNzd29yZCgpXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gVHJ1ZSBpZiB0aGUgcGFzc3dvcmQgbWF0Y2hlc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmVyaWZ5UGFzc3dvcmQocGFzc3dvcmQsIHN0b3JlZEhhc2gsIHN0b3JlZFNhbHQpIHtcbiAgICBjb25zdCB7IGhhc2ggfSA9IGF3YWl0IGhhc2hQYXNzd29yZChwYXNzd29yZCwgc3RvcmVkU2FsdCk7XG4gICAgcmV0dXJuIGhhc2ggPT09IHN0b3JlZEhhc2g7XG59XG4iLCAiLyoqXG4gKiBCSVAzOSBTZWVkIFBocmFzZSB1dGlsaXRpZXMgZm9yIE5vc3RyS2V5LlxuICpcbiAqIEltcGxlbWVudHMgdGhlIHNhbWUgYWxnb3JpdGhtIGFzIGBub3N0ci1uc2VjLXNlZWRwaHJhc2VgOlxuICogdGhlIDMyLWJ5dGUgcHJpdmF0ZSBrZXkgSVMgdGhlIEJJUDM5IGVudHJvcHkgKGJpZGlyZWN0aW9uYWwgZW5jb2RpbmcpLlxuICpcbiAqIFVzZXMgQHNjdXJlL2JpcDM5IChhbHJlYWR5IGEgdHJhbnNpdGl2ZSBkZXAgb2Ygbm9zdHItdG9vbHMpLlxuICovXG5cbmltcG9ydCB7IGVudHJvcHlUb01uZW1vbmljLCBtbmVtb25pY1RvRW50cm9weSwgdmFsaWRhdGVNbmVtb25pYyB9IGZyb20gJ0BzY3VyZS9iaXAzOSc7XG5pbXBvcnQgeyB3b3JkbGlzdCB9IGZyb20gJ0BzY3VyZS9iaXAzOS93b3JkbGlzdHMvZW5nbGlzaC5qcyc7XG5pbXBvcnQgeyBoZXhUb0J5dGVzLCBieXRlc1RvSGV4LCBnZXRQdWJsaWNLZXlTeW5jIH0gZnJvbSAnbm9zdHItY3J5cHRvLXV0aWxzJztcblxuLyoqXG4gKiBDb252ZXJ0IGEgaGV4IHByaXZhdGUga2V5IHRvIGEgMjQtd29yZCBCSVAzOSBtbmVtb25pYy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBoZXhLZXkgLSA2NC1jaGFyIGhleCBwcml2YXRlIGtleVxuICogQHJldHVybnMge3N0cmluZ30gMjQtd29yZCBtbmVtb25pY1xuICovXG5leHBvcnQgZnVuY3Rpb24ga2V5VG9TZWVkUGhyYXNlKGhleEtleSkge1xuICAgIGNvbnN0IGJ5dGVzID0gaGV4VG9CeXRlcyhoZXhLZXkpO1xuICAgIHJldHVybiBlbnRyb3B5VG9NbmVtb25pYyhieXRlcywgd29yZGxpc3QpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBCSVAzOSBtbmVtb25pYyBiYWNrIHRvIGEgaGV4IHByaXZhdGUga2V5ICsgZGVyaXZlZCBwdWJrZXkuXG4gKiBAcGFyYW0ge3N0cmluZ30gcGhyYXNlIC0gMjQtd29yZCBtbmVtb25pY1xuICogQHJldHVybnMge3sgaGV4S2V5OiBzdHJpbmcsIHB1YktleTogc3RyaW5nIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWVkUGhyYXNlVG9LZXkocGhyYXNlKSB7XG4gICAgY29uc3QgZW50cm9weSA9IG1uZW1vbmljVG9FbnRyb3B5KHBocmFzZS50cmltKCkudG9Mb3dlckNhc2UoKSwgd29yZGxpc3QpO1xuICAgIGNvbnN0IGhleEtleSA9IGJ5dGVzVG9IZXgoZW50cm9weSk7XG4gICAgY29uc3QgcHViS2V5ID0gZ2V0UHVibGljS2V5U3luYyhoZXhLZXkpO1xuICAgIHJldHVybiB7IGhleEtleSwgcHViS2V5IH07XG59XG5cbi8qKlxuICogVmFsaWRhdGUgYSBCSVAzOSBtbmVtb25pYyAoY2hlY2tzdW0gKyB3b3JkbGlzdCkuXG4gKiBAcGFyYW0ge3N0cmluZ30gcGhyYXNlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRTZWVkUGhyYXNlKHBocmFzZSkge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZU1uZW1vbmljKHBocmFzZS50cmltKCkudG9Mb3dlckNhc2UoKSwgd29yZGxpc3QpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIEZhc3QgaGV1cmlzdGljOiBkb2VzIHRoZSBpbnB1dCBsb29rIGxpa2UgaXQgY291bGQgYmUgYSBzZWVkIHBocmFzZT9cbiAqICgxMisgc3BhY2Utc2VwYXJhdGVkIGFscGhhYmV0aWMgd29yZHMpXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXRcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9va3NMaWtlU2VlZFBocmFzZShpbnB1dCkge1xuICAgIGlmICghaW5wdXQgfHwgdHlwZW9mIGlucHV0ICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IHdvcmRzID0gaW5wdXQudHJpbSgpLnNwbGl0KC9cXHMrLyk7XG4gICAgcmV0dXJuIHdvcmRzLmxlbmd0aCA+PSAxMiAmJiB3b3Jkcy5ldmVyeSh3ID0+IC9eW2EtekEtWl0rJC8udGVzdCh3KSk7XG59XG4iLCAiLyoqXG4gKiBVdGlsaXRpZXMgZm9yIGhleCwgYnl0ZXMsIENTUFJORy5cbiAqIEBtb2R1bGVcbiAqL1xuLyohIG5vYmxlLWhhc2hlcyAtIE1JVCBMaWNlbnNlIChjKSAyMDIyIFBhdWwgTWlsbGVyIChwYXVsbWlsbHIuY29tKSAqL1xuLyoqIENoZWNrcyBpZiBzb21ldGhpbmcgaXMgVWludDhBcnJheS4gQmUgY2FyZWZ1bDogbm9kZWpzIEJ1ZmZlciB3aWxsIHJldHVybiB0cnVlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQnl0ZXMoYTogdW5rbm93bik6IGEgaXMgVWludDhBcnJheSB7XG4gIHJldHVybiBhIGluc3RhbmNlb2YgVWludDhBcnJheSB8fCAoQXJyYXlCdWZmZXIuaXNWaWV3KGEpICYmIGEuY29uc3RydWN0b3IubmFtZSA9PT0gJ1VpbnQ4QXJyYXknKTtcbn1cblxuLyoqIEFzc2VydHMgc29tZXRoaW5nIGlzIHBvc2l0aXZlIGludGVnZXIuICovXG5leHBvcnQgZnVuY3Rpb24gYW51bWJlcihuOiBudW1iZXIsIHRpdGxlOiBzdHJpbmcgPSAnJyk6IHZvaWQge1xuICBpZiAoIU51bWJlci5pc1NhZmVJbnRlZ2VyKG4pIHx8IG4gPCAwKSB7XG4gICAgY29uc3QgcHJlZml4ID0gdGl0bGUgJiYgYFwiJHt0aXRsZX1cIiBgO1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtwcmVmaXh9ZXhwZWN0ZWQgaW50ZWdlciA+PSAwLCBnb3QgJHtufWApO1xuICB9XG59XG5cbi8qKiBBc3NlcnRzIHNvbWV0aGluZyBpcyBVaW50OEFycmF5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFieXRlcyh2YWx1ZTogVWludDhBcnJheSwgbGVuZ3RoPzogbnVtYmVyLCB0aXRsZTogc3RyaW5nID0gJycpOiBVaW50OEFycmF5IHtcbiAgY29uc3QgYnl0ZXMgPSBpc0J5dGVzKHZhbHVlKTtcbiAgY29uc3QgbGVuID0gdmFsdWU/Lmxlbmd0aDtcbiAgY29uc3QgbmVlZHNMZW4gPSBsZW5ndGggIT09IHVuZGVmaW5lZDtcbiAgaWYgKCFieXRlcyB8fCAobmVlZHNMZW4gJiYgbGVuICE9PSBsZW5ndGgpKSB7XG4gICAgY29uc3QgcHJlZml4ID0gdGl0bGUgJiYgYFwiJHt0aXRsZX1cIiBgO1xuICAgIGNvbnN0IG9mTGVuID0gbmVlZHNMZW4gPyBgIG9mIGxlbmd0aCAke2xlbmd0aH1gIDogJyc7XG4gICAgY29uc3QgZ290ID0gYnl0ZXMgPyBgbGVuZ3RoPSR7bGVufWAgOiBgdHlwZT0ke3R5cGVvZiB2YWx1ZX1gO1xuICAgIHRocm93IG5ldyBFcnJvcihwcmVmaXggKyAnZXhwZWN0ZWQgVWludDhBcnJheScgKyBvZkxlbiArICcsIGdvdCAnICsgZ290KTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbi8qKiBBc3NlcnRzIHNvbWV0aGluZyBpcyBoYXNoICovXG5leHBvcnQgZnVuY3Rpb24gYWhhc2goaDogQ0hhc2gpOiB2b2lkIHtcbiAgaWYgKHR5cGVvZiBoICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBoLmNyZWF0ZSAhPT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0hhc2ggbXVzdCB3cmFwcGVkIGJ5IHV0aWxzLmNyZWF0ZUhhc2hlcicpO1xuICBhbnVtYmVyKGgub3V0cHV0TGVuKTtcbiAgYW51bWJlcihoLmJsb2NrTGVuKTtcbn1cblxuLyoqIEFzc2VydHMgYSBoYXNoIGluc3RhbmNlIGhhcyBub3QgYmVlbiBkZXN0cm95ZWQgLyBmaW5pc2hlZCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFleGlzdHMoaW5zdGFuY2U6IGFueSwgY2hlY2tGaW5pc2hlZCA9IHRydWUpOiB2b2lkIHtcbiAgaWYgKGluc3RhbmNlLmRlc3Ryb3llZCkgdGhyb3cgbmV3IEVycm9yKCdIYXNoIGluc3RhbmNlIGhhcyBiZWVuIGRlc3Ryb3llZCcpO1xuICBpZiAoY2hlY2tGaW5pc2hlZCAmJiBpbnN0YW5jZS5maW5pc2hlZCkgdGhyb3cgbmV3IEVycm9yKCdIYXNoI2RpZ2VzdCgpIGhhcyBhbHJlYWR5IGJlZW4gY2FsbGVkJyk7XG59XG5cbi8qKiBBc3NlcnRzIG91dHB1dCBpcyBwcm9wZXJseS1zaXplZCBieXRlIGFycmF5ICovXG5leHBvcnQgZnVuY3Rpb24gYW91dHB1dChvdXQ6IGFueSwgaW5zdGFuY2U6IGFueSk6IHZvaWQge1xuICBhYnl0ZXMob3V0LCB1bmRlZmluZWQsICdkaWdlc3RJbnRvKCkgb3V0cHV0Jyk7XG4gIGNvbnN0IG1pbiA9IGluc3RhbmNlLm91dHB1dExlbjtcbiAgaWYgKG91dC5sZW5ndGggPCBtaW4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1wiZGlnZXN0SW50bygpIG91dHB1dFwiIGV4cGVjdGVkIHRvIGJlIG9mIGxlbmd0aCA+PScgKyBtaW4pO1xuICB9XG59XG5cbi8qKiBHZW5lcmljIHR5cGUgZW5jb21wYXNzaW5nIDgvMTYvMzItYnl0ZSBhcnJheXMgLSBidXQgbm90IDY0LWJ5dGUuICovXG4vLyBwcmV0dGllci1pZ25vcmVcbmV4cG9ydCB0eXBlIFR5cGVkQXJyYXkgPSBJbnQ4QXJyYXkgfCBVaW50OENsYW1wZWRBcnJheSB8IFVpbnQ4QXJyYXkgfFxuICBVaW50MTZBcnJheSB8IEludDE2QXJyYXkgfCBVaW50MzJBcnJheSB8IEludDMyQXJyYXk7XG5cbi8qKiBDYXN0IHU4IC8gdTE2IC8gdTMyIHRvIHU4LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHU4KGFycjogVHlwZWRBcnJheSk6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXJyLmJ1ZmZlciwgYXJyLmJ5dGVPZmZzZXQsIGFyci5ieXRlTGVuZ3RoKTtcbn1cblxuLyoqIENhc3QgdTggLyB1MTYgLyB1MzIgdG8gdTMyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHUzMihhcnI6IFR5cGVkQXJyYXkpOiBVaW50MzJBcnJheSB7XG4gIHJldHVybiBuZXcgVWludDMyQXJyYXkoYXJyLmJ1ZmZlciwgYXJyLmJ5dGVPZmZzZXQsIE1hdGguZmxvb3IoYXJyLmJ5dGVMZW5ndGggLyA0KSk7XG59XG5cbi8qKiBaZXJvaXplIGEgYnl0ZSBhcnJheS4gV2FybmluZzogSlMgcHJvdmlkZXMgbm8gZ3VhcmFudGVlcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbiguLi5hcnJheXM6IFR5cGVkQXJyYXlbXSk6IHZvaWQge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5cy5sZW5ndGg7IGkrKykge1xuICAgIGFycmF5c1tpXS5maWxsKDApO1xuICB9XG59XG5cbi8qKiBDcmVhdGUgRGF0YVZpZXcgb2YgYW4gYXJyYXkgZm9yIGVhc3kgYnl0ZS1sZXZlbCBtYW5pcHVsYXRpb24uICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVmlldyhhcnI6IFR5cGVkQXJyYXkpOiBEYXRhVmlldyB7XG4gIHJldHVybiBuZXcgRGF0YVZpZXcoYXJyLmJ1ZmZlciwgYXJyLmJ5dGVPZmZzZXQsIGFyci5ieXRlTGVuZ3RoKTtcbn1cblxuLyoqIFRoZSByb3RhdGUgcmlnaHQgKGNpcmN1bGFyIHJpZ2h0IHNoaWZ0KSBvcGVyYXRpb24gZm9yIHVpbnQzMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdHIod29yZDogbnVtYmVyLCBzaGlmdDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuICh3b3JkIDw8ICgzMiAtIHNoaWZ0KSkgfCAod29yZCA+Pj4gc2hpZnQpO1xufVxuXG4vKiogVGhlIHJvdGF0ZSBsZWZ0IChjaXJjdWxhciBsZWZ0IHNoaWZ0KSBvcGVyYXRpb24gZm9yIHVpbnQzMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGwod29yZDogbnVtYmVyLCBzaGlmdDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuICh3b3JkIDw8IHNoaWZ0KSB8ICgod29yZCA+Pj4gKDMyIC0gc2hpZnQpKSA+Pj4gMCk7XG59XG5cbi8qKiBJcyBjdXJyZW50IHBsYXRmb3JtIGxpdHRsZS1lbmRpYW4/IE1vc3QgYXJlLiBCaWctRW5kaWFuIHBsYXRmb3JtOiBJQk0gKi9cbmV4cG9ydCBjb25zdCBpc0xFOiBib29sZWFuID0gLyogQF9fUFVSRV9fICovICgoKSA9PlxuICBuZXcgVWludDhBcnJheShuZXcgVWludDMyQXJyYXkoWzB4MTEyMjMzNDRdKS5idWZmZXIpWzBdID09PSAweDQ0KSgpO1xuXG4vKiogVGhlIGJ5dGUgc3dhcCBvcGVyYXRpb24gZm9yIHVpbnQzMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVTd2FwKHdvcmQ6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiAoXG4gICAgKCh3b3JkIDw8IDI0KSAmIDB4ZmYwMDAwMDApIHxcbiAgICAoKHdvcmQgPDwgOCkgJiAweGZmMDAwMCkgfFxuICAgICgod29yZCA+Pj4gOCkgJiAweGZmMDApIHxcbiAgICAoKHdvcmQgPj4+IDI0KSAmIDB4ZmYpXG4gICk7XG59XG4vKiogQ29uZGl0aW9uYWxseSBieXRlIHN3YXAgaWYgb24gYSBiaWctZW5kaWFuIHBsYXRmb3JtICovXG5leHBvcnQgY29uc3Qgc3dhcDhJZkJFOiAobjogbnVtYmVyKSA9PiBudW1iZXIgPSBpc0xFXG4gID8gKG46IG51bWJlcikgPT4gblxuICA6IChuOiBudW1iZXIpID0+IGJ5dGVTd2FwKG4pO1xuXG4vKiogSW4gcGxhY2UgYnl0ZSBzd2FwIGZvciBVaW50MzJBcnJheSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVTd2FwMzIoYXJyOiBVaW50MzJBcnJheSk6IFVpbnQzMkFycmF5IHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICBhcnJbaV0gPSBieXRlU3dhcChhcnJbaV0pO1xuICB9XG4gIHJldHVybiBhcnI7XG59XG5cbmV4cG9ydCBjb25zdCBzd2FwMzJJZkJFOiAodTogVWludDMyQXJyYXkpID0+IFVpbnQzMkFycmF5ID0gaXNMRVxuICA/ICh1OiBVaW50MzJBcnJheSkgPT4gdVxuICA6IGJ5dGVTd2FwMzI7XG5cbi8vIEJ1aWx0LWluIGhleCBjb252ZXJzaW9uIGh0dHBzOi8vY2FuaXVzZS5jb20vbWRuLWphdmFzY3JpcHRfYnVpbHRpbnNfdWludDhhcnJheV9mcm9taGV4XG5jb25zdCBoYXNIZXhCdWlsdGluOiBib29sZWFuID0gLyogQF9fUFVSRV9fICovICgoKSA9PlxuICAvLyBAdHMtaWdub3JlXG4gIHR5cGVvZiBVaW50OEFycmF5LmZyb20oW10pLnRvSGV4ID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBVaW50OEFycmF5LmZyb21IZXggPT09ICdmdW5jdGlvbicpKCk7XG5cbi8vIEFycmF5IHdoZXJlIGluZGV4IDB4ZjAgKDI0MCkgaXMgbWFwcGVkIHRvIHN0cmluZyAnZjAnXG5jb25zdCBoZXhlcyA9IC8qIEBfX1BVUkVfXyAqLyBBcnJheS5mcm9tKHsgbGVuZ3RoOiAyNTYgfSwgKF8sIGkpID0+XG4gIGkudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJylcbik7XG5cbi8qKlxuICogQ29udmVydCBieXRlIGFycmF5IHRvIGhleCBzdHJpbmcuIFVzZXMgYnVpbHQtaW4gZnVuY3Rpb24sIHdoZW4gYXZhaWxhYmxlLlxuICogQGV4YW1wbGUgYnl0ZXNUb0hleChVaW50OEFycmF5LmZyb20oWzB4Y2EsIDB4ZmUsIDB4MDEsIDB4MjNdKSkgLy8gJ2NhZmUwMTIzJ1xuICovXG5leHBvcnQgZnVuY3Rpb24gYnl0ZXNUb0hleChieXRlczogVWludDhBcnJheSk6IHN0cmluZyB7XG4gIGFieXRlcyhieXRlcyk7XG4gIC8vIEB0cy1pZ25vcmVcbiAgaWYgKGhhc0hleEJ1aWx0aW4pIHJldHVybiBieXRlcy50b0hleCgpO1xuICAvLyBwcmUtY2FjaGluZyBpbXByb3ZlcyB0aGUgc3BlZWQgNnhcbiAgbGV0IGhleCA9ICcnO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgaGV4ICs9IGhleGVzW2J5dGVzW2ldXTtcbiAgfVxuICByZXR1cm4gaGV4O1xufVxuXG4vLyBXZSB1c2Ugb3B0aW1pemVkIHRlY2huaXF1ZSB0byBjb252ZXJ0IGhleCBzdHJpbmcgdG8gYnl0ZSBhcnJheVxuY29uc3QgYXNjaWlzID0geyBfMDogNDgsIF85OiA1NywgQTogNjUsIEY6IDcwLCBhOiA5NywgZjogMTAyIH0gYXMgY29uc3Q7XG5mdW5jdGlvbiBhc2NpaVRvQmFzZTE2KGNoOiBudW1iZXIpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICBpZiAoY2ggPj0gYXNjaWlzLl8wICYmIGNoIDw9IGFzY2lpcy5fOSkgcmV0dXJuIGNoIC0gYXNjaWlzLl8wOyAvLyAnMicgPT4gNTAtNDhcbiAgaWYgKGNoID49IGFzY2lpcy5BICYmIGNoIDw9IGFzY2lpcy5GKSByZXR1cm4gY2ggLSAoYXNjaWlzLkEgLSAxMCk7IC8vICdCJyA9PiA2Ni0oNjUtMTApXG4gIGlmIChjaCA+PSBhc2NpaXMuYSAmJiBjaCA8PSBhc2NpaXMuZikgcmV0dXJuIGNoIC0gKGFzY2lpcy5hIC0gMTApOyAvLyAnYicgPT4gOTgtKDk3LTEwKVxuICByZXR1cm47XG59XG5cbi8qKlxuICogQ29udmVydCBoZXggc3RyaW5nIHRvIGJ5dGUgYXJyYXkuIFVzZXMgYnVpbHQtaW4gZnVuY3Rpb24sIHdoZW4gYXZhaWxhYmxlLlxuICogQGV4YW1wbGUgaGV4VG9CeXRlcygnY2FmZTAxMjMnKSAvLyBVaW50OEFycmF5LmZyb20oWzB4Y2EsIDB4ZmUsIDB4MDEsIDB4MjNdKVxuICovXG5leHBvcnQgZnVuY3Rpb24gaGV4VG9CeXRlcyhoZXg6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICBpZiAodHlwZW9mIGhleCAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignaGV4IHN0cmluZyBleHBlY3RlZCwgZ290ICcgKyB0eXBlb2YgaGV4KTtcbiAgLy8gQHRzLWlnbm9yZVxuICBpZiAoaGFzSGV4QnVpbHRpbikgcmV0dXJuIFVpbnQ4QXJyYXkuZnJvbUhleChoZXgpO1xuICBjb25zdCBobCA9IGhleC5sZW5ndGg7XG4gIGNvbnN0IGFsID0gaGwgLyAyO1xuICBpZiAoaGwgJSAyKSB0aHJvdyBuZXcgRXJyb3IoJ2hleCBzdHJpbmcgZXhwZWN0ZWQsIGdvdCB1bnBhZGRlZCBoZXggb2YgbGVuZ3RoICcgKyBobCk7XG4gIGNvbnN0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYWwpO1xuICBmb3IgKGxldCBhaSA9IDAsIGhpID0gMDsgYWkgPCBhbDsgYWkrKywgaGkgKz0gMikge1xuICAgIGNvbnN0IG4xID0gYXNjaWlUb0Jhc2UxNihoZXguY2hhckNvZGVBdChoaSkpO1xuICAgIGNvbnN0IG4yID0gYXNjaWlUb0Jhc2UxNihoZXguY2hhckNvZGVBdChoaSArIDEpKTtcbiAgICBpZiAobjEgPT09IHVuZGVmaW5lZCB8fCBuMiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBjaGFyID0gaGV4W2hpXSArIGhleFtoaSArIDFdO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdoZXggc3RyaW5nIGV4cGVjdGVkLCBnb3Qgbm9uLWhleCBjaGFyYWN0ZXIgXCInICsgY2hhciArICdcIiBhdCBpbmRleCAnICsgaGkpO1xuICAgIH1cbiAgICBhcnJheVthaV0gPSBuMSAqIDE2ICsgbjI7IC8vIG11bHRpcGx5IGZpcnN0IG9jdGV0LCBlLmcuICdhMycgPT4gMTAqMTYrMyA9PiAxNjAgKyAzID0+IDE2M1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuLyoqXG4gKiBUaGVyZSBpcyBubyBzZXRJbW1lZGlhdGUgaW4gYnJvd3NlciBhbmQgc2V0VGltZW91dCBpcyBzbG93LlxuICogQ2FsbCBvZiBhc3luYyBmbiB3aWxsIHJldHVybiBQcm9taXNlLCB3aGljaCB3aWxsIGJlIGZ1bGxmaWxlZCBvbmx5IG9uXG4gKiBuZXh0IHNjaGVkdWxlciBxdWV1ZSBwcm9jZXNzaW5nIHN0ZXAgYW5kIHRoaXMgaXMgZXhhY3RseSB3aGF0IHdlIG5lZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBuZXh0VGljayA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHt9O1xuXG4vKiogUmV0dXJucyBjb250cm9sIHRvIHRocmVhZCBlYWNoICd0aWNrJyBtcyB0byBhdm9pZCBibG9ja2luZy4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhc3luY0xvb3AoXG4gIGl0ZXJzOiBudW1iZXIsXG4gIHRpY2s6IG51bWJlcixcbiAgY2I6IChpOiBudW1iZXIpID0+IHZvaWRcbik6IFByb21pc2U8dm9pZD4ge1xuICBsZXQgdHMgPSBEYXRlLm5vdygpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZXJzOyBpKyspIHtcbiAgICBjYihpKTtcbiAgICAvLyBEYXRlLm5vdygpIGlzIG5vdCBtb25vdG9uaWMsIHNvIGluIGNhc2UgaWYgY2xvY2sgZ29lcyBiYWNrd2FyZHMgd2UgcmV0dXJuIHJldHVybiBjb250cm9sIHRvb1xuICAgIGNvbnN0IGRpZmYgPSBEYXRlLm5vdygpIC0gdHM7XG4gICAgaWYgKGRpZmYgPj0gMCAmJiBkaWZmIDwgdGljaykgY29udGludWU7XG4gICAgYXdhaXQgbmV4dFRpY2soKTtcbiAgICB0cyArPSBkaWZmO1xuICB9XG59XG5cbi8vIEdsb2JhbCBzeW1ib2xzLCBidXQgdHMgZG9lc24ndCBzZWUgdGhlbTogaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8zMTUzNVxuZGVjbGFyZSBjb25zdCBUZXh0RW5jb2RlcjogYW55O1xuXG4vKipcbiAqIENvbnZlcnRzIHN0cmluZyB0byBieXRlcyB1c2luZyBVVEY4IGVuY29kaW5nLlxuICogQnVpbHQtaW4gZG9lc24ndCB2YWxpZGF0ZSBpbnB1dCB0byBiZSBzdHJpbmc6IHdlIGRvIHRoZSBjaGVjay5cbiAqIEBleGFtcGxlIHV0ZjhUb0J5dGVzKCdhYmMnKSAvLyBVaW50OEFycmF5LmZyb20oWzk3LCA5OCwgOTldKVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXRmOFRvQnl0ZXMoc3RyOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ3N0cmluZyBleHBlY3RlZCcpO1xuICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHN0cikpOyAvLyBodHRwczovL2J1Z3ppbC5sYS8xNjgxODA5XG59XG5cbi8qKiBLREZzIGNhbiBhY2NlcHQgc3RyaW5nIG9yIFVpbnQ4QXJyYXkgZm9yIHVzZXIgY29udmVuaWVuY2UuICovXG5leHBvcnQgdHlwZSBLREZJbnB1dCA9IHN0cmluZyB8IFVpbnQ4QXJyYXk7XG5cbi8qKlxuICogSGVscGVyIGZvciBLREZzOiBjb25zdW1lcyB1aW50OGFycmF5IG9yIHN0cmluZy5cbiAqIFdoZW4gc3RyaW5nIGlzIHBhc3NlZCwgZG9lcyB1dGY4IGRlY29kaW5nLCB1c2luZyBUZXh0RGVjb2Rlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGtkZklucHV0VG9CeXRlcyhkYXRhOiBLREZJbnB1dCwgZXJyb3JUaXRsZSA9ICcnKTogVWludDhBcnJheSB7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHJldHVybiB1dGY4VG9CeXRlcyhkYXRhKTtcbiAgcmV0dXJuIGFieXRlcyhkYXRhLCB1bmRlZmluZWQsIGVycm9yVGl0bGUpO1xufVxuXG4vKiogQ29waWVzIHNldmVyYWwgVWludDhBcnJheXMgaW50byBvbmUuICovXG5leHBvcnQgZnVuY3Rpb24gY29uY2F0Qnl0ZXMoLi4uYXJyYXlzOiBVaW50OEFycmF5W10pOiBVaW50OEFycmF5IHtcbiAgbGV0IHN1bSA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgYSA9IGFycmF5c1tpXTtcbiAgICBhYnl0ZXMoYSk7XG4gICAgc3VtICs9IGEubGVuZ3RoO1xuICB9XG4gIGNvbnN0IHJlcyA9IG5ldyBVaW50OEFycmF5KHN1bSk7XG4gIGZvciAobGV0IGkgPSAwLCBwYWQgPSAwOyBpIDwgYXJyYXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgYSA9IGFycmF5c1tpXTtcbiAgICByZXMuc2V0KGEsIHBhZCk7XG4gICAgcGFkICs9IGEubGVuZ3RoO1xuICB9XG4gIHJldHVybiByZXM7XG59XG5cbnR5cGUgRW1wdHlPYmogPSB7fTtcbi8qKiBNZXJnZXMgZGVmYXVsdCBvcHRpb25zIGFuZCBwYXNzZWQgb3B0aW9ucy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja09wdHM8VDEgZXh0ZW5kcyBFbXB0eU9iaiwgVDIgZXh0ZW5kcyBFbXB0eU9iaj4oXG4gIGRlZmF1bHRzOiBUMSxcbiAgb3B0cz86IFQyXG4pOiBUMSAmIFQyIHtcbiAgaWYgKG9wdHMgIT09IHVuZGVmaW5lZCAmJiB7fS50b1N0cmluZy5jYWxsKG9wdHMpICE9PSAnW29iamVjdCBPYmplY3RdJylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ29wdGlvbnMgbXVzdCBiZSBvYmplY3Qgb3IgdW5kZWZpbmVkJyk7XG4gIGNvbnN0IG1lcmdlZCA9IE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIG9wdHMpO1xuICByZXR1cm4gbWVyZ2VkIGFzIFQxICYgVDI7XG59XG5cbi8qKiBDb21tb24gaW50ZXJmYWNlIGZvciBhbGwgaGFzaGVzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBIYXNoPFQ+IHtcbiAgYmxvY2tMZW46IG51bWJlcjsgLy8gQnl0ZXMgcGVyIGJsb2NrXG4gIG91dHB1dExlbjogbnVtYmVyOyAvLyBCeXRlcyBpbiBvdXRwdXRcbiAgdXBkYXRlKGJ1ZjogVWludDhBcnJheSk6IHRoaXM7XG4gIGRpZ2VzdEludG8oYnVmOiBVaW50OEFycmF5KTogdm9pZDtcbiAgZGlnZXN0KCk6IFVpbnQ4QXJyYXk7XG4gIGRlc3Ryb3koKTogdm9pZDtcbiAgX2Nsb25lSW50byh0bz86IFQpOiBUO1xuICBjbG9uZSgpOiBUO1xufVxuXG4vKiogUHNldWRvUmFuZG9tIChudW1iZXIpIEdlbmVyYXRvciAqL1xuZXhwb3J0IGludGVyZmFjZSBQUkcge1xuICBhZGRFbnRyb3B5KHNlZWQ6IFVpbnQ4QXJyYXkpOiB2b2lkO1xuICByYW5kb21CeXRlcyhsZW5ndGg6IG51bWJlcik6IFVpbnQ4QXJyYXk7XG4gIGNsZWFuKCk6IHZvaWQ7XG59XG5cbi8qKlxuICogWE9GOiBzdHJlYW1pbmcgQVBJIHRvIHJlYWQgZGlnZXN0IGluIGNodW5rcy5cbiAqIFNhbWUgYXMgJ3NxdWVlemUnIGluIGtlY2Nhay9rMTIgYW5kICdzZWVrJyBpbiBibGFrZTMsIGJ1dCBtb3JlIGdlbmVyaWMgbmFtZS5cbiAqIFdoZW4gaGFzaCB1c2VkIGluIFhPRiBtb2RlIGl0IGlzIHVwIHRvIHVzZXIgdG8gY2FsbCAnLmRlc3Ryb3knIGFmdGVyd2FyZHMsIHNpbmNlIHdlIGNhbm5vdFxuICogZGVzdHJveSBzdGF0ZSwgbmV4dCBjYWxsIGNhbiByZXF1aXJlIG1vcmUgYnl0ZXMuXG4gKi9cbmV4cG9ydCB0eXBlIEhhc2hYT0Y8VCBleHRlbmRzIEhhc2g8VD4+ID0gSGFzaDxUPiAmIHtcbiAgeG9mKGJ5dGVzOiBudW1iZXIpOiBVaW50OEFycmF5OyAvLyBSZWFkICdieXRlcycgYnl0ZXMgZnJvbSBkaWdlc3Qgc3RyZWFtXG4gIHhvZkludG8oYnVmOiBVaW50OEFycmF5KTogVWludDhBcnJheTsgLy8gcmVhZCBidWYubGVuZ3RoIGJ5dGVzIGZyb20gZGlnZXN0IHN0cmVhbSBpbnRvIGJ1ZlxufTtcblxuLyoqIEhhc2ggY29uc3RydWN0b3IgKi9cbmV4cG9ydCB0eXBlIEhhc2hlckNvbnM8VCwgT3B0cyA9IHVuZGVmaW5lZD4gPSBPcHRzIGV4dGVuZHMgdW5kZWZpbmVkID8gKCkgPT4gVCA6IChvcHRzPzogT3B0cykgPT4gVDtcbi8qKiBPcHRpb25hbCBoYXNoIHBhcmFtcy4gKi9cbmV4cG9ydCB0eXBlIEhhc2hJbmZvID0ge1xuICBvaWQ/OiBVaW50OEFycmF5OyAvLyBERVIgZW5jb2RlZCBPSUQgaW4gYnl0ZXNcbn07XG4vKiogSGFzaCBmdW5jdGlvbiAqL1xuZXhwb3J0IHR5cGUgQ0hhc2g8VCBleHRlbmRzIEhhc2g8VD4gPSBIYXNoPGFueT4sIE9wdHMgPSB1bmRlZmluZWQ+ID0ge1xuICBvdXRwdXRMZW46IG51bWJlcjtcbiAgYmxvY2tMZW46IG51bWJlcjtcbn0gJiBIYXNoSW5mbyAmXG4gIChPcHRzIGV4dGVuZHMgdW5kZWZpbmVkXG4gICAgPyB7XG4gICAgICAgIChtc2c6IFVpbnQ4QXJyYXkpOiBVaW50OEFycmF5O1xuICAgICAgICBjcmVhdGUoKTogVDtcbiAgICAgIH1cbiAgICA6IHtcbiAgICAgICAgKG1zZzogVWludDhBcnJheSwgb3B0cz86IE9wdHMpOiBVaW50OEFycmF5O1xuICAgICAgICBjcmVhdGUob3B0cz86IE9wdHMpOiBUO1xuICAgICAgfSk7XG4vKiogWE9GIHdpdGggb3V0cHV0ICovXG5leHBvcnQgdHlwZSBDSGFzaFhPRjxUIGV4dGVuZHMgSGFzaFhPRjxUPiA9IEhhc2hYT0Y8YW55PiwgT3B0cyA9IHVuZGVmaW5lZD4gPSBDSGFzaDxULCBPcHRzPjtcblxuLyoqIENyZWF0ZXMgZnVuY3Rpb24gd2l0aCBvdXRwdXRMZW4sIGJsb2NrTGVuLCBjcmVhdGUgcHJvcGVydGllcyBmcm9tIGEgY2xhc3MgY29uc3RydWN0b3IuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSGFzaGVyPFQgZXh0ZW5kcyBIYXNoPFQ+LCBPcHRzID0gdW5kZWZpbmVkPihcbiAgaGFzaENvbnM6IEhhc2hlckNvbnM8VCwgT3B0cz4sXG4gIGluZm86IEhhc2hJbmZvID0ge31cbik6IENIYXNoPFQsIE9wdHM+IHtcbiAgY29uc3QgaGFzaEM6IGFueSA9IChtc2c6IFVpbnQ4QXJyYXksIG9wdHM/OiBPcHRzKSA9PiBoYXNoQ29ucyhvcHRzKS51cGRhdGUobXNnKS5kaWdlc3QoKTtcbiAgY29uc3QgdG1wID0gaGFzaENvbnModW5kZWZpbmVkKTtcbiAgaGFzaEMub3V0cHV0TGVuID0gdG1wLm91dHB1dExlbjtcbiAgaGFzaEMuYmxvY2tMZW4gPSB0bXAuYmxvY2tMZW47XG4gIGhhc2hDLmNyZWF0ZSA9IChvcHRzPzogT3B0cykgPT4gaGFzaENvbnMob3B0cyk7XG4gIE9iamVjdC5hc3NpZ24oaGFzaEMsIGluZm8pO1xuICByZXR1cm4gT2JqZWN0LmZyZWV6ZShoYXNoQyk7XG59XG5cbi8qKiBDcnlwdG9ncmFwaGljYWxseSBzZWN1cmUgUFJORy4gVXNlcyBpbnRlcm5hbCBPUy1sZXZlbCBgY3J5cHRvLmdldFJhbmRvbVZhbHVlc2AuICovXG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tQnl0ZXMoYnl0ZXNMZW5ndGggPSAzMik6IFVpbnQ4QXJyYXkge1xuICBjb25zdCBjciA9IHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JyA/IChnbG9iYWxUaGlzIGFzIGFueSkuY3J5cHRvIDogbnVsbDtcbiAgaWYgKHR5cGVvZiBjcj8uZ2V0UmFuZG9tVmFsdWVzICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBFcnJvcignY3J5cHRvLmdldFJhbmRvbVZhbHVlcyBtdXN0IGJlIGRlZmluZWQnKTtcbiAgcmV0dXJuIGNyLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShieXRlc0xlbmd0aCkpO1xufVxuXG4vKiogQ3JlYXRlcyBPSUQgb3B0cyBmb3IgTklTVCBoYXNoZXMsIHdpdGggcHJlZml4IDA2IDA5IDYwIDg2IDQ4IDAxIDY1IDAzIDA0IDAyLiAqL1xuZXhwb3J0IGNvbnN0IG9pZE5pc3QgPSAoc3VmZml4OiBudW1iZXIpOiBSZXF1aXJlZDxIYXNoSW5mbz4gPT4gKHtcbiAgb2lkOiBVaW50OEFycmF5LmZyb20oWzB4MDYsIDB4MDksIDB4NjAsIDB4ODYsIDB4NDgsIDB4MDEsIDB4NjUsIDB4MDMsIDB4MDQsIDB4MDIsIHN1ZmZpeF0pLFxufSk7XG4iLCAiLyoqXG4gKiBTSEEyIGhhc2ggZnVuY3Rpb24uIEEuay5hLiBzaGEyNTYsIHNoYTM4NCwgc2hhNTEyLCBzaGE1MTJfMjI0LCBzaGE1MTJfMjU2LlxuICogU0hBMjU2IGlzIHRoZSBmYXN0ZXN0IGhhc2ggaW1wbGVtZW50YWJsZSBpbiBKUywgZXZlbiBmYXN0ZXIgdGhhbiBCbGFrZTMuXG4gKiBDaGVjayBvdXQgW1JGQyA0NjM0XShodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjNDYzNCkgYW5kXG4gKiBbRklQUyAxODAtNF0oaHR0cHM6Ly9udmxwdWJzLm5pc3QuZ292L25pc3RwdWJzL0ZJUFMvTklTVC5GSVBTLjE4MC00LnBkZikuXG4gKiBAbW9kdWxlXG4gKi9cbmltcG9ydCB7IENoaSwgSGFzaE1ELCBNYWosIFNIQTIyNF9JViwgU0hBMjU2X0lWLCBTSEEzODRfSVYsIFNIQTUxMl9JViB9IGZyb20gJy4vX21kLnRzJztcbmltcG9ydCAqIGFzIHU2NCBmcm9tICcuL191NjQudHMnO1xuaW1wb3J0IHsgdHlwZSBDSGFzaCwgY2xlYW4sIGNyZWF0ZUhhc2hlciwgb2lkTmlzdCwgcm90ciB9IGZyb20gJy4vdXRpbHMudHMnO1xuXG4vKipcbiAqIFJvdW5kIGNvbnN0YW50czpcbiAqIEZpcnN0IDMyIGJpdHMgb2YgZnJhY3Rpb25hbCBwYXJ0cyBvZiB0aGUgY3ViZSByb290cyBvZiB0aGUgZmlyc3QgNjQgcHJpbWVzIDIuLjMxMSlcbiAqL1xuLy8gcHJldHRpZXItaWdub3JlXG5jb25zdCBTSEEyNTZfSyA9IC8qIEBfX1BVUkVfXyAqLyBVaW50MzJBcnJheS5mcm9tKFtcbiAgMHg0MjhhMmY5OCwgMHg3MTM3NDQ5MSwgMHhiNWMwZmJjZiwgMHhlOWI1ZGJhNSwgMHgzOTU2YzI1YiwgMHg1OWYxMTFmMSwgMHg5MjNmODJhNCwgMHhhYjFjNWVkNSxcbiAgMHhkODA3YWE5OCwgMHgxMjgzNWIwMSwgMHgyNDMxODViZSwgMHg1NTBjN2RjMywgMHg3MmJlNWQ3NCwgMHg4MGRlYjFmZSwgMHg5YmRjMDZhNywgMHhjMTliZjE3NCxcbiAgMHhlNDliNjljMSwgMHhlZmJlNDc4NiwgMHgwZmMxOWRjNiwgMHgyNDBjYTFjYywgMHgyZGU5MmM2ZiwgMHg0YTc0ODRhYSwgMHg1Y2IwYTlkYywgMHg3NmY5ODhkYSxcbiAgMHg5ODNlNTE1MiwgMHhhODMxYzY2ZCwgMHhiMDAzMjdjOCwgMHhiZjU5N2ZjNywgMHhjNmUwMGJmMywgMHhkNWE3OTE0NywgMHgwNmNhNjM1MSwgMHgxNDI5Mjk2NyxcbiAgMHgyN2I3MGE4NSwgMHgyZTFiMjEzOCwgMHg0ZDJjNmRmYywgMHg1MzM4MGQxMywgMHg2NTBhNzM1NCwgMHg3NjZhMGFiYiwgMHg4MWMyYzkyZSwgMHg5MjcyMmM4NSxcbiAgMHhhMmJmZThhMSwgMHhhODFhNjY0YiwgMHhjMjRiOGI3MCwgMHhjNzZjNTFhMywgMHhkMTkyZTgxOSwgMHhkNjk5MDYyNCwgMHhmNDBlMzU4NSwgMHgxMDZhYTA3MCxcbiAgMHgxOWE0YzExNiwgMHgxZTM3NmMwOCwgMHgyNzQ4Nzc0YywgMHgzNGIwYmNiNSwgMHgzOTFjMGNiMywgMHg0ZWQ4YWE0YSwgMHg1YjljY2E0ZiwgMHg2ODJlNmZmMyxcbiAgMHg3NDhmODJlZSwgMHg3OGE1NjM2ZiwgMHg4NGM4NzgxNCwgMHg4Y2M3MDIwOCwgMHg5MGJlZmZmYSwgMHhhNDUwNmNlYiwgMHhiZWY5YTNmNywgMHhjNjcxNzhmMlxuXSk7XG5cbi8qKiBSZXVzYWJsZSB0ZW1wb3JhcnkgYnVmZmVyLiBcIldcIiBjb21lcyBzdHJhaWdodCBmcm9tIHNwZWMuICovXG5jb25zdCBTSEEyNTZfVyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgVWludDMyQXJyYXkoNjQpO1xuXG4vKiogSW50ZXJuYWwgMzItYnl0ZSBiYXNlIFNIQTIgaGFzaCBjbGFzcy4gKi9cbmFic3RyYWN0IGNsYXNzIFNIQTJfMzJCPFQgZXh0ZW5kcyBTSEEyXzMyQjxUPj4gZXh0ZW5kcyBIYXNoTUQ8VD4ge1xuICAvLyBXZSBjYW5ub3QgdXNlIGFycmF5IGhlcmUgc2luY2UgYXJyYXkgYWxsb3dzIGluZGV4aW5nIGJ5IHZhcmlhYmxlXG4gIC8vIHdoaWNoIG1lYW5zIG9wdGltaXplci9jb21waWxlciBjYW5ub3QgdXNlIHJlZ2lzdGVycy5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IEE6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEI6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEM6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEQ6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEU6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEY6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEc6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihvdXRwdXRMZW46IG51bWJlcikge1xuICAgIHN1cGVyKDY0LCBvdXRwdXRMZW4sIDgsIGZhbHNlKTtcbiAgfVxuICBwcm90ZWN0ZWQgZ2V0KCk6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl0ge1xuICAgIGNvbnN0IHsgQSwgQiwgQywgRCwgRSwgRiwgRywgSCB9ID0gdGhpcztcbiAgICByZXR1cm4gW0EsIEIsIEMsIEQsIEUsIEYsIEcsIEhdO1xuICB9XG4gIC8vIHByZXR0aWVyLWlnbm9yZVxuICBwcm90ZWN0ZWQgc2V0KFxuICAgIEE6IG51bWJlciwgQjogbnVtYmVyLCBDOiBudW1iZXIsIEQ6IG51bWJlciwgRTogbnVtYmVyLCBGOiBudW1iZXIsIEc6IG51bWJlciwgSDogbnVtYmVyXG4gICk6IHZvaWQge1xuICAgIHRoaXMuQSA9IEEgfCAwO1xuICAgIHRoaXMuQiA9IEIgfCAwO1xuICAgIHRoaXMuQyA9IEMgfCAwO1xuICAgIHRoaXMuRCA9IEQgfCAwO1xuICAgIHRoaXMuRSA9IEUgfCAwO1xuICAgIHRoaXMuRiA9IEYgfCAwO1xuICAgIHRoaXMuRyA9IEcgfCAwO1xuICAgIHRoaXMuSCA9IEggfCAwO1xuICB9XG4gIHByb3RlY3RlZCBwcm9jZXNzKHZpZXc6IERhdGFWaWV3LCBvZmZzZXQ6IG51bWJlcik6IHZvaWQge1xuICAgIC8vIEV4dGVuZCB0aGUgZmlyc3QgMTYgd29yZHMgaW50byB0aGUgcmVtYWluaW5nIDQ4IHdvcmRzIHdbMTYuLjYzXSBvZiB0aGUgbWVzc2FnZSBzY2hlZHVsZSBhcnJheVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTY7IGkrKywgb2Zmc2V0ICs9IDQpIFNIQTI1Nl9XW2ldID0gdmlldy5nZXRVaW50MzIob2Zmc2V0LCBmYWxzZSk7XG4gICAgZm9yIChsZXQgaSA9IDE2OyBpIDwgNjQ7IGkrKykge1xuICAgICAgY29uc3QgVzE1ID0gU0hBMjU2X1dbaSAtIDE1XTtcbiAgICAgIGNvbnN0IFcyID0gU0hBMjU2X1dbaSAtIDJdO1xuICAgICAgY29uc3QgczAgPSByb3RyKFcxNSwgNykgXiByb3RyKFcxNSwgMTgpIF4gKFcxNSA+Pj4gMyk7XG4gICAgICBjb25zdCBzMSA9IHJvdHIoVzIsIDE3KSBeIHJvdHIoVzIsIDE5KSBeIChXMiA+Pj4gMTApO1xuICAgICAgU0hBMjU2X1dbaV0gPSAoczEgKyBTSEEyNTZfV1tpIC0gN10gKyBzMCArIFNIQTI1Nl9XW2kgLSAxNl0pIHwgMDtcbiAgICB9XG4gICAgLy8gQ29tcHJlc3Npb24gZnVuY3Rpb24gbWFpbiBsb29wLCA2NCByb3VuZHNcbiAgICBsZXQgeyBBLCBCLCBDLCBELCBFLCBGLCBHLCBIIH0gPSB0aGlzO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjQ7IGkrKykge1xuICAgICAgY29uc3Qgc2lnbWExID0gcm90cihFLCA2KSBeIHJvdHIoRSwgMTEpIF4gcm90cihFLCAyNSk7XG4gICAgICBjb25zdCBUMSA9IChIICsgc2lnbWExICsgQ2hpKEUsIEYsIEcpICsgU0hBMjU2X0tbaV0gKyBTSEEyNTZfV1tpXSkgfCAwO1xuICAgICAgY29uc3Qgc2lnbWEwID0gcm90cihBLCAyKSBeIHJvdHIoQSwgMTMpIF4gcm90cihBLCAyMik7XG4gICAgICBjb25zdCBUMiA9IChzaWdtYTAgKyBNYWooQSwgQiwgQykpIHwgMDtcbiAgICAgIEggPSBHO1xuICAgICAgRyA9IEY7XG4gICAgICBGID0gRTtcbiAgICAgIEUgPSAoRCArIFQxKSB8IDA7XG4gICAgICBEID0gQztcbiAgICAgIEMgPSBCO1xuICAgICAgQiA9IEE7XG4gICAgICBBID0gKFQxICsgVDIpIHwgMDtcbiAgICB9XG4gICAgLy8gQWRkIHRoZSBjb21wcmVzc2VkIGNodW5rIHRvIHRoZSBjdXJyZW50IGhhc2ggdmFsdWVcbiAgICBBID0gKEEgKyB0aGlzLkEpIHwgMDtcbiAgICBCID0gKEIgKyB0aGlzLkIpIHwgMDtcbiAgICBDID0gKEMgKyB0aGlzLkMpIHwgMDtcbiAgICBEID0gKEQgKyB0aGlzLkQpIHwgMDtcbiAgICBFID0gKEUgKyB0aGlzLkUpIHwgMDtcbiAgICBGID0gKEYgKyB0aGlzLkYpIHwgMDtcbiAgICBHID0gKEcgKyB0aGlzLkcpIHwgMDtcbiAgICBIID0gKEggKyB0aGlzLkgpIHwgMDtcbiAgICB0aGlzLnNldChBLCBCLCBDLCBELCBFLCBGLCBHLCBIKTtcbiAgfVxuICBwcm90ZWN0ZWQgcm91bmRDbGVhbigpOiB2b2lkIHtcbiAgICBjbGVhbihTSEEyNTZfVyk7XG4gIH1cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLnNldCgwLCAwLCAwLCAwLCAwLCAwLCAwLCAwKTtcbiAgICBjbGVhbih0aGlzLmJ1ZmZlcik7XG4gIH1cbn1cblxuLyoqIEludGVybmFsIFNIQTItMjU2IGhhc2ggY2xhc3MuICovXG5leHBvcnQgY2xhc3MgX1NIQTI1NiBleHRlbmRzIFNIQTJfMzJCPF9TSEEyNTY+IHtcbiAgLy8gV2UgY2Fubm90IHVzZSBhcnJheSBoZXJlIHNpbmNlIGFycmF5IGFsbG93cyBpbmRleGluZyBieSB2YXJpYWJsZVxuICAvLyB3aGljaCBtZWFucyBvcHRpbWl6ZXIvY29tcGlsZXIgY2Fubm90IHVzZSByZWdpc3RlcnMuXG4gIHByb3RlY3RlZCBBOiBudW1iZXIgPSBTSEEyNTZfSVZbMF0gfCAwO1xuICBwcm90ZWN0ZWQgQjogbnVtYmVyID0gU0hBMjU2X0lWWzFdIHwgMDtcbiAgcHJvdGVjdGVkIEM6IG51bWJlciA9IFNIQTI1Nl9JVlsyXSB8IDA7XG4gIHByb3RlY3RlZCBEOiBudW1iZXIgPSBTSEEyNTZfSVZbM10gfCAwO1xuICBwcm90ZWN0ZWQgRTogbnVtYmVyID0gU0hBMjU2X0lWWzRdIHwgMDtcbiAgcHJvdGVjdGVkIEY6IG51bWJlciA9IFNIQTI1Nl9JVls1XSB8IDA7XG4gIHByb3RlY3RlZCBHOiBudW1iZXIgPSBTSEEyNTZfSVZbNl0gfCAwO1xuICBwcm90ZWN0ZWQgSDogbnVtYmVyID0gU0hBMjU2X0lWWzddIHwgMDtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoMzIpO1xuICB9XG59XG5cbi8qKiBJbnRlcm5hbCBTSEEyLTIyNCBoYXNoIGNsYXNzLiAqL1xuZXhwb3J0IGNsYXNzIF9TSEEyMjQgZXh0ZW5kcyBTSEEyXzMyQjxfU0hBMjI0PiB7XG4gIHByb3RlY3RlZCBBOiBudW1iZXIgPSBTSEEyMjRfSVZbMF0gfCAwO1xuICBwcm90ZWN0ZWQgQjogbnVtYmVyID0gU0hBMjI0X0lWWzFdIHwgMDtcbiAgcHJvdGVjdGVkIEM6IG51bWJlciA9IFNIQTIyNF9JVlsyXSB8IDA7XG4gIHByb3RlY3RlZCBEOiBudW1iZXIgPSBTSEEyMjRfSVZbM10gfCAwO1xuICBwcm90ZWN0ZWQgRTogbnVtYmVyID0gU0hBMjI0X0lWWzRdIHwgMDtcbiAgcHJvdGVjdGVkIEY6IG51bWJlciA9IFNIQTIyNF9JVls1XSB8IDA7XG4gIHByb3RlY3RlZCBHOiBudW1iZXIgPSBTSEEyMjRfSVZbNl0gfCAwO1xuICBwcm90ZWN0ZWQgSDogbnVtYmVyID0gU0hBMjI0X0lWWzddIHwgMDtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoMjgpO1xuICB9XG59XG5cbi8vIFNIQTItNTEyIGlzIHNsb3dlciB0aGFuIHNoYTI1NiBpbiBqcyBiZWNhdXNlIHU2NCBvcGVyYXRpb25zIGFyZSBzbG93LlxuXG4vLyBSb3VuZCBjb250YW50c1xuLy8gRmlyc3QgMzIgYml0cyBvZiB0aGUgZnJhY3Rpb25hbCBwYXJ0cyBvZiB0aGUgY3ViZSByb290cyBvZiB0aGUgZmlyc3QgODAgcHJpbWVzIDIuLjQwOVxuLy8gcHJldHRpZXItaWdub3JlXG5jb25zdCBLNTEyID0gLyogQF9fUFVSRV9fICovICgoKSA9PiB1NjQuc3BsaXQoW1xuICAnMHg0MjhhMmY5OGQ3MjhhZTIyJywgJzB4NzEzNzQ0OTEyM2VmNjVjZCcsICcweGI1YzBmYmNmZWM0ZDNiMmYnLCAnMHhlOWI1ZGJhNTgxODlkYmJjJyxcbiAgJzB4Mzk1NmMyNWJmMzQ4YjUzOCcsICcweDU5ZjExMWYxYjYwNWQwMTknLCAnMHg5MjNmODJhNGFmMTk0ZjliJywgJzB4YWIxYzVlZDVkYTZkODExOCcsXG4gICcweGQ4MDdhYTk4YTMwMzAyNDInLCAnMHgxMjgzNWIwMTQ1NzA2ZmJlJywgJzB4MjQzMTg1YmU0ZWU0YjI4YycsICcweDU1MGM3ZGMzZDVmZmI0ZTInLFxuICAnMHg3MmJlNWQ3NGYyN2I4OTZmJywgJzB4ODBkZWIxZmUzYjE2OTZiMScsICcweDliZGMwNmE3MjVjNzEyMzUnLCAnMHhjMTliZjE3NGNmNjkyNjk0JyxcbiAgJzB4ZTQ5YjY5YzE5ZWYxNGFkMicsICcweGVmYmU0Nzg2Mzg0ZjI1ZTMnLCAnMHgwZmMxOWRjNjhiOGNkNWI1JywgJzB4MjQwY2ExY2M3N2FjOWM2NScsXG4gICcweDJkZTkyYzZmNTkyYjAyNzUnLCAnMHg0YTc0ODRhYTZlYTZlNDgzJywgJzB4NWNiMGE5ZGNiZDQxZmJkNCcsICcweDc2Zjk4OGRhODMxMTUzYjUnLFxuICAnMHg5ODNlNTE1MmVlNjZkZmFiJywgJzB4YTgzMWM2NmQyZGI0MzIxMCcsICcweGIwMDMyN2M4OThmYjIxM2YnLCAnMHhiZjU5N2ZjN2JlZWYwZWU0JyxcbiAgJzB4YzZlMDBiZjMzZGE4OGZjMicsICcweGQ1YTc5MTQ3OTMwYWE3MjUnLCAnMHgwNmNhNjM1MWUwMDM4MjZmJywgJzB4MTQyOTI5NjcwYTBlNmU3MCcsXG4gICcweDI3YjcwYTg1NDZkMjJmZmMnLCAnMHgyZTFiMjEzODVjMjZjOTI2JywgJzB4NGQyYzZkZmM1YWM0MmFlZCcsICcweDUzMzgwZDEzOWQ5NWIzZGYnLFxuICAnMHg2NTBhNzM1NDhiYWY2M2RlJywgJzB4NzY2YTBhYmIzYzc3YjJhOCcsICcweDgxYzJjOTJlNDdlZGFlZTYnLCAnMHg5MjcyMmM4NTE0ODIzNTNiJyxcbiAgJzB4YTJiZmU4YTE0Y2YxMDM2NCcsICcweGE4MWE2NjRiYmM0MjMwMDEnLCAnMHhjMjRiOGI3MGQwZjg5NzkxJywgJzB4Yzc2YzUxYTMwNjU0YmUzMCcsXG4gICcweGQxOTJlODE5ZDZlZjUyMTgnLCAnMHhkNjk5MDYyNDU1NjVhOTEwJywgJzB4ZjQwZTM1ODU1NzcxMjAyYScsICcweDEwNmFhMDcwMzJiYmQxYjgnLFxuICAnMHgxOWE0YzExNmI4ZDJkMGM4JywgJzB4MWUzNzZjMDg1MTQxYWI1MycsICcweDI3NDg3NzRjZGY4ZWViOTknLCAnMHgzNGIwYmNiNWUxOWI0OGE4JyxcbiAgJzB4MzkxYzBjYjNjNWM5NWE2MycsICcweDRlZDhhYTRhZTM0MThhY2InLCAnMHg1YjljY2E0Zjc3NjNlMzczJywgJzB4NjgyZTZmZjNkNmIyYjhhMycsXG4gICcweDc0OGY4MmVlNWRlZmIyZmMnLCAnMHg3OGE1NjM2ZjQzMTcyZjYwJywgJzB4ODRjODc4MTRhMWYwYWI3MicsICcweDhjYzcwMjA4MWE2NDM5ZWMnLFxuICAnMHg5MGJlZmZmYTIzNjMxZTI4JywgJzB4YTQ1MDZjZWJkZTgyYmRlOScsICcweGJlZjlhM2Y3YjJjNjc5MTUnLCAnMHhjNjcxNzhmMmUzNzI1MzJiJyxcbiAgJzB4Y2EyNzNlY2VlYTI2NjE5YycsICcweGQxODZiOGM3MjFjMGMyMDcnLCAnMHhlYWRhN2RkNmNkZTBlYjFlJywgJzB4ZjU3ZDRmN2ZlZTZlZDE3OCcsXG4gICcweDA2ZjA2N2FhNzIxNzZmYmEnLCAnMHgwYTYzN2RjNWEyYzg5OGE2JywgJzB4MTEzZjk4MDRiZWY5MGRhZScsICcweDFiNzEwYjM1MTMxYzQ3MWInLFxuICAnMHgyOGRiNzdmNTIzMDQ3ZDg0JywgJzB4MzJjYWFiN2I0MGM3MjQ5MycsICcweDNjOWViZTBhMTVjOWJlYmMnLCAnMHg0MzFkNjdjNDljMTAwZDRjJyxcbiAgJzB4NGNjNWQ0YmVjYjNlNDJiNicsICcweDU5N2YyOTljZmM2NTdlMmEnLCAnMHg1ZmNiNmZhYjNhZDZmYWVjJywgJzB4NmM0NDE5OGM0YTQ3NTgxNydcbl0ubWFwKG4gPT4gQmlnSW50KG4pKSkpKCk7XG5jb25zdCBTSEE1MTJfS2ggPSAvKiBAX19QVVJFX18gKi8gKCgpID0+IEs1MTJbMF0pKCk7XG5jb25zdCBTSEE1MTJfS2wgPSAvKiBAX19QVVJFX18gKi8gKCgpID0+IEs1MTJbMV0pKCk7XG5cbi8vIFJldXNhYmxlIHRlbXBvcmFyeSBidWZmZXJzXG5jb25zdCBTSEE1MTJfV19IID0gLyogQF9fUFVSRV9fICovIG5ldyBVaW50MzJBcnJheSg4MCk7XG5jb25zdCBTSEE1MTJfV19MID0gLyogQF9fUFVSRV9fICovIG5ldyBVaW50MzJBcnJheSg4MCk7XG5cbi8qKiBJbnRlcm5hbCA2NC1ieXRlIGJhc2UgU0hBMiBoYXNoIGNsYXNzLiAqL1xuYWJzdHJhY3QgY2xhc3MgU0hBMl82NEI8VCBleHRlbmRzIFNIQTJfNjRCPFQ+PiBleHRlbmRzIEhhc2hNRDxUPiB7XG4gIC8vIFdlIGNhbm5vdCB1c2UgYXJyYXkgaGVyZSBzaW5jZSBhcnJheSBhbGxvd3MgaW5kZXhpbmcgYnkgdmFyaWFibGVcbiAgLy8gd2hpY2ggbWVhbnMgb3B0aW1pemVyL2NvbXBpbGVyIGNhbm5vdCB1c2UgcmVnaXN0ZXJzLlxuICAvLyBoIC0tIGhpZ2ggMzIgYml0cywgbCAtLSBsb3cgMzIgYml0c1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgQWg6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEFsOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBCaDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgQmw6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IENoOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBDbDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgRGg6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IERsOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBFaDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgRWw6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEZoOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBGbDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgR2g6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEdsOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBIaDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgSGw6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihvdXRwdXRMZW46IG51bWJlcikge1xuICAgIHN1cGVyKDEyOCwgb3V0cHV0TGVuLCAxNiwgZmFsc2UpO1xuICB9XG4gIC8vIHByZXR0aWVyLWlnbm9yZVxuICBwcm90ZWN0ZWQgZ2V0KCk6IFtcbiAgICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcixcbiAgICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlclxuICBdIHtcbiAgICBjb25zdCB7IEFoLCBBbCwgQmgsIEJsLCBDaCwgQ2wsIERoLCBEbCwgRWgsIEVsLCBGaCwgRmwsIEdoLCBHbCwgSGgsIEhsIH0gPSB0aGlzO1xuICAgIHJldHVybiBbQWgsIEFsLCBCaCwgQmwsIENoLCBDbCwgRGgsIERsLCBFaCwgRWwsIEZoLCBGbCwgR2gsIEdsLCBIaCwgSGxdO1xuICB9XG4gIC8vIHByZXR0aWVyLWlnbm9yZVxuICBwcm90ZWN0ZWQgc2V0KFxuICAgIEFoOiBudW1iZXIsIEFsOiBudW1iZXIsIEJoOiBudW1iZXIsIEJsOiBudW1iZXIsIENoOiBudW1iZXIsIENsOiBudW1iZXIsIERoOiBudW1iZXIsIERsOiBudW1iZXIsXG4gICAgRWg6IG51bWJlciwgRWw6IG51bWJlciwgRmg6IG51bWJlciwgRmw6IG51bWJlciwgR2g6IG51bWJlciwgR2w6IG51bWJlciwgSGg6IG51bWJlciwgSGw6IG51bWJlclxuICApOiB2b2lkIHtcbiAgICB0aGlzLkFoID0gQWggfCAwO1xuICAgIHRoaXMuQWwgPSBBbCB8IDA7XG4gICAgdGhpcy5CaCA9IEJoIHwgMDtcbiAgICB0aGlzLkJsID0gQmwgfCAwO1xuICAgIHRoaXMuQ2ggPSBDaCB8IDA7XG4gICAgdGhpcy5DbCA9IENsIHwgMDtcbiAgICB0aGlzLkRoID0gRGggfCAwO1xuICAgIHRoaXMuRGwgPSBEbCB8IDA7XG4gICAgdGhpcy5FaCA9IEVoIHwgMDtcbiAgICB0aGlzLkVsID0gRWwgfCAwO1xuICAgIHRoaXMuRmggPSBGaCB8IDA7XG4gICAgdGhpcy5GbCA9IEZsIHwgMDtcbiAgICB0aGlzLkdoID0gR2ggfCAwO1xuICAgIHRoaXMuR2wgPSBHbCB8IDA7XG4gICAgdGhpcy5IaCA9IEhoIHwgMDtcbiAgICB0aGlzLkhsID0gSGwgfCAwO1xuICB9XG4gIHByb3RlY3RlZCBwcm9jZXNzKHZpZXc6IERhdGFWaWV3LCBvZmZzZXQ6IG51bWJlcik6IHZvaWQge1xuICAgIC8vIEV4dGVuZCB0aGUgZmlyc3QgMTYgd29yZHMgaW50byB0aGUgcmVtYWluaW5nIDY0IHdvcmRzIHdbMTYuLjc5XSBvZiB0aGUgbWVzc2FnZSBzY2hlZHVsZSBhcnJheVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTY7IGkrKywgb2Zmc2V0ICs9IDQpIHtcbiAgICAgIFNIQTUxMl9XX0hbaV0gPSB2aWV3LmdldFVpbnQzMihvZmZzZXQpO1xuICAgICAgU0hBNTEyX1dfTFtpXSA9IHZpZXcuZ2V0VWludDMyKChvZmZzZXQgKz0gNCkpO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMTY7IGkgPCA4MDsgaSsrKSB7XG4gICAgICAvLyBzMCA6PSAod1tpLTE1XSByaWdodHJvdGF0ZSAxKSB4b3IgKHdbaS0xNV0gcmlnaHRyb3RhdGUgOCkgeG9yICh3W2ktMTVdIHJpZ2h0c2hpZnQgNylcbiAgICAgIGNvbnN0IFcxNWggPSBTSEE1MTJfV19IW2kgLSAxNV0gfCAwO1xuICAgICAgY29uc3QgVzE1bCA9IFNIQTUxMl9XX0xbaSAtIDE1XSB8IDA7XG4gICAgICBjb25zdCBzMGggPSB1NjQucm90clNIKFcxNWgsIFcxNWwsIDEpIF4gdTY0LnJvdHJTSChXMTVoLCBXMTVsLCA4KSBeIHU2NC5zaHJTSChXMTVoLCBXMTVsLCA3KTtcbiAgICAgIGNvbnN0IHMwbCA9IHU2NC5yb3RyU0woVzE1aCwgVzE1bCwgMSkgXiB1NjQucm90clNMKFcxNWgsIFcxNWwsIDgpIF4gdTY0LnNoclNMKFcxNWgsIFcxNWwsIDcpO1xuICAgICAgLy8gczEgOj0gKHdbaS0yXSByaWdodHJvdGF0ZSAxOSkgeG9yICh3W2ktMl0gcmlnaHRyb3RhdGUgNjEpIHhvciAod1tpLTJdIHJpZ2h0c2hpZnQgNilcbiAgICAgIGNvbnN0IFcyaCA9IFNIQTUxMl9XX0hbaSAtIDJdIHwgMDtcbiAgICAgIGNvbnN0IFcybCA9IFNIQTUxMl9XX0xbaSAtIDJdIHwgMDtcbiAgICAgIGNvbnN0IHMxaCA9IHU2NC5yb3RyU0goVzJoLCBXMmwsIDE5KSBeIHU2NC5yb3RyQkgoVzJoLCBXMmwsIDYxKSBeIHU2NC5zaHJTSChXMmgsIFcybCwgNik7XG4gICAgICBjb25zdCBzMWwgPSB1NjQucm90clNMKFcyaCwgVzJsLCAxOSkgXiB1NjQucm90ckJMKFcyaCwgVzJsLCA2MSkgXiB1NjQuc2hyU0woVzJoLCBXMmwsIDYpO1xuICAgICAgLy8gU0hBMjU2X1dbaV0gPSBzMCArIHMxICsgU0hBMjU2X1dbaSAtIDddICsgU0hBMjU2X1dbaSAtIDE2XTtcbiAgICAgIGNvbnN0IFNVTWwgPSB1NjQuYWRkNEwoczBsLCBzMWwsIFNIQTUxMl9XX0xbaSAtIDddLCBTSEE1MTJfV19MW2kgLSAxNl0pO1xuICAgICAgY29uc3QgU1VNaCA9IHU2NC5hZGQ0SChTVU1sLCBzMGgsIHMxaCwgU0hBNTEyX1dfSFtpIC0gN10sIFNIQTUxMl9XX0hbaSAtIDE2XSk7XG4gICAgICBTSEE1MTJfV19IW2ldID0gU1VNaCB8IDA7XG4gICAgICBTSEE1MTJfV19MW2ldID0gU1VNbCB8IDA7XG4gICAgfVxuICAgIGxldCB7IEFoLCBBbCwgQmgsIEJsLCBDaCwgQ2wsIERoLCBEbCwgRWgsIEVsLCBGaCwgRmwsIEdoLCBHbCwgSGgsIEhsIH0gPSB0aGlzO1xuICAgIC8vIENvbXByZXNzaW9uIGZ1bmN0aW9uIG1haW4gbG9vcCwgODAgcm91bmRzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4MDsgaSsrKSB7XG4gICAgICAvLyBTMSA6PSAoZSByaWdodHJvdGF0ZSAxNCkgeG9yIChlIHJpZ2h0cm90YXRlIDE4KSB4b3IgKGUgcmlnaHRyb3RhdGUgNDEpXG4gICAgICBjb25zdCBzaWdtYTFoID0gdTY0LnJvdHJTSChFaCwgRWwsIDE0KSBeIHU2NC5yb3RyU0goRWgsIEVsLCAxOCkgXiB1NjQucm90ckJIKEVoLCBFbCwgNDEpO1xuICAgICAgY29uc3Qgc2lnbWExbCA9IHU2NC5yb3RyU0woRWgsIEVsLCAxNCkgXiB1NjQucm90clNMKEVoLCBFbCwgMTgpIF4gdTY0LnJvdHJCTChFaCwgRWwsIDQxKTtcbiAgICAgIC8vY29uc3QgVDEgPSAoSCArIHNpZ21hMSArIENoaShFLCBGLCBHKSArIFNIQTI1Nl9LW2ldICsgU0hBMjU2X1dbaV0pIHwgMDtcbiAgICAgIGNvbnN0IENISWggPSAoRWggJiBGaCkgXiAofkVoICYgR2gpO1xuICAgICAgY29uc3QgQ0hJbCA9IChFbCAmIEZsKSBeICh+RWwgJiBHbCk7XG4gICAgICAvLyBUMSA9IEggKyBzaWdtYTEgKyBDaGkoRSwgRiwgRykgKyBTSEE1MTJfS1tpXSArIFNIQTUxMl9XW2ldXG4gICAgICAvLyBwcmV0dGllci1pZ25vcmVcbiAgICAgIGNvbnN0IFQxbGwgPSB1NjQuYWRkNUwoSGwsIHNpZ21hMWwsIENISWwsIFNIQTUxMl9LbFtpXSwgU0hBNTEyX1dfTFtpXSk7XG4gICAgICBjb25zdCBUMWggPSB1NjQuYWRkNUgoVDFsbCwgSGgsIHNpZ21hMWgsIENISWgsIFNIQTUxMl9LaFtpXSwgU0hBNTEyX1dfSFtpXSk7XG4gICAgICBjb25zdCBUMWwgPSBUMWxsIHwgMDtcbiAgICAgIC8vIFMwIDo9IChhIHJpZ2h0cm90YXRlIDI4KSB4b3IgKGEgcmlnaHRyb3RhdGUgMzQpIHhvciAoYSByaWdodHJvdGF0ZSAzOSlcbiAgICAgIGNvbnN0IHNpZ21hMGggPSB1NjQucm90clNIKEFoLCBBbCwgMjgpIF4gdTY0LnJvdHJCSChBaCwgQWwsIDM0KSBeIHU2NC5yb3RyQkgoQWgsIEFsLCAzOSk7XG4gICAgICBjb25zdCBzaWdtYTBsID0gdTY0LnJvdHJTTChBaCwgQWwsIDI4KSBeIHU2NC5yb3RyQkwoQWgsIEFsLCAzNCkgXiB1NjQucm90ckJMKEFoLCBBbCwgMzkpO1xuICAgICAgY29uc3QgTUFKaCA9IChBaCAmIEJoKSBeIChBaCAmIENoKSBeIChCaCAmIENoKTtcbiAgICAgIGNvbnN0IE1BSmwgPSAoQWwgJiBCbCkgXiAoQWwgJiBDbCkgXiAoQmwgJiBDbCk7XG4gICAgICBIaCA9IEdoIHwgMDtcbiAgICAgIEhsID0gR2wgfCAwO1xuICAgICAgR2ggPSBGaCB8IDA7XG4gICAgICBHbCA9IEZsIHwgMDtcbiAgICAgIEZoID0gRWggfCAwO1xuICAgICAgRmwgPSBFbCB8IDA7XG4gICAgICAoeyBoOiBFaCwgbDogRWwgfSA9IHU2NC5hZGQoRGggfCAwLCBEbCB8IDAsIFQxaCB8IDAsIFQxbCB8IDApKTtcbiAgICAgIERoID0gQ2ggfCAwO1xuICAgICAgRGwgPSBDbCB8IDA7XG4gICAgICBDaCA9IEJoIHwgMDtcbiAgICAgIENsID0gQmwgfCAwO1xuICAgICAgQmggPSBBaCB8IDA7XG4gICAgICBCbCA9IEFsIHwgMDtcbiAgICAgIGNvbnN0IEFsbCA9IHU2NC5hZGQzTChUMWwsIHNpZ21hMGwsIE1BSmwpO1xuICAgICAgQWggPSB1NjQuYWRkM0goQWxsLCBUMWgsIHNpZ21hMGgsIE1BSmgpO1xuICAgICAgQWwgPSBBbGwgfCAwO1xuICAgIH1cbiAgICAvLyBBZGQgdGhlIGNvbXByZXNzZWQgY2h1bmsgdG8gdGhlIGN1cnJlbnQgaGFzaCB2YWx1ZVxuICAgICh7IGg6IEFoLCBsOiBBbCB9ID0gdTY0LmFkZCh0aGlzLkFoIHwgMCwgdGhpcy5BbCB8IDAsIEFoIHwgMCwgQWwgfCAwKSk7XG4gICAgKHsgaDogQmgsIGw6IEJsIH0gPSB1NjQuYWRkKHRoaXMuQmggfCAwLCB0aGlzLkJsIHwgMCwgQmggfCAwLCBCbCB8IDApKTtcbiAgICAoeyBoOiBDaCwgbDogQ2wgfSA9IHU2NC5hZGQodGhpcy5DaCB8IDAsIHRoaXMuQ2wgfCAwLCBDaCB8IDAsIENsIHwgMCkpO1xuICAgICh7IGg6IERoLCBsOiBEbCB9ID0gdTY0LmFkZCh0aGlzLkRoIHwgMCwgdGhpcy5EbCB8IDAsIERoIHwgMCwgRGwgfCAwKSk7XG4gICAgKHsgaDogRWgsIGw6IEVsIH0gPSB1NjQuYWRkKHRoaXMuRWggfCAwLCB0aGlzLkVsIHwgMCwgRWggfCAwLCBFbCB8IDApKTtcbiAgICAoeyBoOiBGaCwgbDogRmwgfSA9IHU2NC5hZGQodGhpcy5GaCB8IDAsIHRoaXMuRmwgfCAwLCBGaCB8IDAsIEZsIHwgMCkpO1xuICAgICh7IGg6IEdoLCBsOiBHbCB9ID0gdTY0LmFkZCh0aGlzLkdoIHwgMCwgdGhpcy5HbCB8IDAsIEdoIHwgMCwgR2wgfCAwKSk7XG4gICAgKHsgaDogSGgsIGw6IEhsIH0gPSB1NjQuYWRkKHRoaXMuSGggfCAwLCB0aGlzLkhsIHwgMCwgSGggfCAwLCBIbCB8IDApKTtcbiAgICB0aGlzLnNldChBaCwgQWwsIEJoLCBCbCwgQ2gsIENsLCBEaCwgRGwsIEVoLCBFbCwgRmgsIEZsLCBHaCwgR2wsIEhoLCBIbCk7XG4gIH1cbiAgcHJvdGVjdGVkIHJvdW5kQ2xlYW4oKTogdm9pZCB7XG4gICAgY2xlYW4oU0hBNTEyX1dfSCwgU0hBNTEyX1dfTCk7XG4gIH1cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBjbGVhbih0aGlzLmJ1ZmZlcik7XG4gICAgdGhpcy5zZXQoMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCk7XG4gIH1cbn1cblxuLyoqIEludGVybmFsIFNIQTItNTEyIGhhc2ggY2xhc3MuICovXG5leHBvcnQgY2xhc3MgX1NIQTUxMiBleHRlbmRzIFNIQTJfNjRCPF9TSEE1MTI+IHtcbiAgcHJvdGVjdGVkIEFoOiBudW1iZXIgPSBTSEE1MTJfSVZbMF0gfCAwO1xuICBwcm90ZWN0ZWQgQWw6IG51bWJlciA9IFNIQTUxMl9JVlsxXSB8IDA7XG4gIHByb3RlY3RlZCBCaDogbnVtYmVyID0gU0hBNTEyX0lWWzJdIHwgMDtcbiAgcHJvdGVjdGVkIEJsOiBudW1iZXIgPSBTSEE1MTJfSVZbM10gfCAwO1xuICBwcm90ZWN0ZWQgQ2g6IG51bWJlciA9IFNIQTUxMl9JVls0XSB8IDA7XG4gIHByb3RlY3RlZCBDbDogbnVtYmVyID0gU0hBNTEyX0lWWzVdIHwgMDtcbiAgcHJvdGVjdGVkIERoOiBudW1iZXIgPSBTSEE1MTJfSVZbNl0gfCAwO1xuICBwcm90ZWN0ZWQgRGw6IG51bWJlciA9IFNIQTUxMl9JVls3XSB8IDA7XG4gIHByb3RlY3RlZCBFaDogbnVtYmVyID0gU0hBNTEyX0lWWzhdIHwgMDtcbiAgcHJvdGVjdGVkIEVsOiBudW1iZXIgPSBTSEE1MTJfSVZbOV0gfCAwO1xuICBwcm90ZWN0ZWQgRmg6IG51bWJlciA9IFNIQTUxMl9JVlsxMF0gfCAwO1xuICBwcm90ZWN0ZWQgRmw6IG51bWJlciA9IFNIQTUxMl9JVlsxMV0gfCAwO1xuICBwcm90ZWN0ZWQgR2g6IG51bWJlciA9IFNIQTUxMl9JVlsxMl0gfCAwO1xuICBwcm90ZWN0ZWQgR2w6IG51bWJlciA9IFNIQTUxMl9JVlsxM10gfCAwO1xuICBwcm90ZWN0ZWQgSGg6IG51bWJlciA9IFNIQTUxMl9JVlsxNF0gfCAwO1xuICBwcm90ZWN0ZWQgSGw6IG51bWJlciA9IFNIQTUxMl9JVlsxNV0gfCAwO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKDY0KTtcbiAgfVxufVxuXG4vKiogSW50ZXJuYWwgU0hBMi0zODQgaGFzaCBjbGFzcy4gKi9cbmV4cG9ydCBjbGFzcyBfU0hBMzg0IGV4dGVuZHMgU0hBMl82NEI8X1NIQTM4ND4ge1xuICBwcm90ZWN0ZWQgQWg6IG51bWJlciA9IFNIQTM4NF9JVlswXSB8IDA7XG4gIHByb3RlY3RlZCBBbDogbnVtYmVyID0gU0hBMzg0X0lWWzFdIHwgMDtcbiAgcHJvdGVjdGVkIEJoOiBudW1iZXIgPSBTSEEzODRfSVZbMl0gfCAwO1xuICBwcm90ZWN0ZWQgQmw6IG51bWJlciA9IFNIQTM4NF9JVlszXSB8IDA7XG4gIHByb3RlY3RlZCBDaDogbnVtYmVyID0gU0hBMzg0X0lWWzRdIHwgMDtcbiAgcHJvdGVjdGVkIENsOiBudW1iZXIgPSBTSEEzODRfSVZbNV0gfCAwO1xuICBwcm90ZWN0ZWQgRGg6IG51bWJlciA9IFNIQTM4NF9JVls2XSB8IDA7XG4gIHByb3RlY3RlZCBEbDogbnVtYmVyID0gU0hBMzg0X0lWWzddIHwgMDtcbiAgcHJvdGVjdGVkIEVoOiBudW1iZXIgPSBTSEEzODRfSVZbOF0gfCAwO1xuICBwcm90ZWN0ZWQgRWw6IG51bWJlciA9IFNIQTM4NF9JVls5XSB8IDA7XG4gIHByb3RlY3RlZCBGaDogbnVtYmVyID0gU0hBMzg0X0lWWzEwXSB8IDA7XG4gIHByb3RlY3RlZCBGbDogbnVtYmVyID0gU0hBMzg0X0lWWzExXSB8IDA7XG4gIHByb3RlY3RlZCBHaDogbnVtYmVyID0gU0hBMzg0X0lWWzEyXSB8IDA7XG4gIHByb3RlY3RlZCBHbDogbnVtYmVyID0gU0hBMzg0X0lWWzEzXSB8IDA7XG4gIHByb3RlY3RlZCBIaDogbnVtYmVyID0gU0hBMzg0X0lWWzE0XSB8IDA7XG4gIHByb3RlY3RlZCBIbDogbnVtYmVyID0gU0hBMzg0X0lWWzE1XSB8IDA7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoNDgpO1xuICB9XG59XG5cbi8qKlxuICogVHJ1bmNhdGVkIFNIQTUxMi8yNTYgYW5kIFNIQTUxMi8yMjQuXG4gKiBTSEE1MTJfSVYgaXMgWE9SZWQgd2l0aCAweGE1YTVhNWE1YTVhNWE1YTUsIHRoZW4gdXNlZCBhcyBcImludGVybWVkaWFyeVwiIElWIG9mIFNIQTUxMi90LlxuICogVGhlbiB0IGhhc2hlcyBzdHJpbmcgdG8gcHJvZHVjZSByZXN1bHQgSVYuXG4gKiBTZWUgYHRlc3QvbWlzYy9zaGEyLWdlbi1pdi5qc2AuXG4gKi9cblxuLyoqIFNIQTUxMi8yMjQgSVYgKi9cbmNvbnN0IFQyMjRfSVYgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4OGMzZDM3YzgsIDB4MTk1NDRkYTIsIDB4NzNlMTk5NjYsIDB4ODlkY2Q0ZDYsIDB4MWRmYWI3YWUsIDB4MzJmZjljODIsIDB4Njc5ZGQ1MTQsIDB4NTgyZjlmY2YsXG4gIDB4MGY2ZDJiNjksIDB4N2JkNDRkYTgsIDB4NzdlMzZmNzMsIDB4MDRjNDg5NDIsIDB4M2Y5ZDg1YTgsIDB4NmExZDM2YzgsIDB4MTExMmU2YWQsIDB4OTFkNjkyYTEsXG5dKTtcblxuLyoqIFNIQTUxMi8yNTYgSVYgKi9cbmNvbnN0IFQyNTZfSVYgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4MjIzMTIxOTQsIDB4ZmMyYmY3MmMsIDB4OWY1NTVmYTMsIDB4Yzg0YzY0YzIsIDB4MjM5M2I4NmIsIDB4NmY1M2IxNTEsIDB4OTYzODc3MTksIDB4NTk0MGVhYmQsXG4gIDB4OTYyODNlZTIsIDB4YTg4ZWZmZTMsIDB4YmU1ZTFlMjUsIDB4NTM4NjM5OTIsIDB4MmIwMTk5ZmMsIDB4MmM4NWI4YWEsIDB4MGViNzJkZGMsIDB4ODFjNTJjYTIsXG5dKTtcblxuLyoqIEludGVybmFsIFNIQTItNTEyLzIyNCBoYXNoIGNsYXNzLiAqL1xuZXhwb3J0IGNsYXNzIF9TSEE1MTJfMjI0IGV4dGVuZHMgU0hBMl82NEI8X1NIQTUxMl8yMjQ+IHtcbiAgcHJvdGVjdGVkIEFoOiBudW1iZXIgPSBUMjI0X0lWWzBdIHwgMDtcbiAgcHJvdGVjdGVkIEFsOiBudW1iZXIgPSBUMjI0X0lWWzFdIHwgMDtcbiAgcHJvdGVjdGVkIEJoOiBudW1iZXIgPSBUMjI0X0lWWzJdIHwgMDtcbiAgcHJvdGVjdGVkIEJsOiBudW1iZXIgPSBUMjI0X0lWWzNdIHwgMDtcbiAgcHJvdGVjdGVkIENoOiBudW1iZXIgPSBUMjI0X0lWWzRdIHwgMDtcbiAgcHJvdGVjdGVkIENsOiBudW1iZXIgPSBUMjI0X0lWWzVdIHwgMDtcbiAgcHJvdGVjdGVkIERoOiBudW1iZXIgPSBUMjI0X0lWWzZdIHwgMDtcbiAgcHJvdGVjdGVkIERsOiBudW1iZXIgPSBUMjI0X0lWWzddIHwgMDtcbiAgcHJvdGVjdGVkIEVoOiBudW1iZXIgPSBUMjI0X0lWWzhdIHwgMDtcbiAgcHJvdGVjdGVkIEVsOiBudW1iZXIgPSBUMjI0X0lWWzldIHwgMDtcbiAgcHJvdGVjdGVkIEZoOiBudW1iZXIgPSBUMjI0X0lWWzEwXSB8IDA7XG4gIHByb3RlY3RlZCBGbDogbnVtYmVyID0gVDIyNF9JVlsxMV0gfCAwO1xuICBwcm90ZWN0ZWQgR2g6IG51bWJlciA9IFQyMjRfSVZbMTJdIHwgMDtcbiAgcHJvdGVjdGVkIEdsOiBudW1iZXIgPSBUMjI0X0lWWzEzXSB8IDA7XG4gIHByb3RlY3RlZCBIaDogbnVtYmVyID0gVDIyNF9JVlsxNF0gfCAwO1xuICBwcm90ZWN0ZWQgSGw6IG51bWJlciA9IFQyMjRfSVZbMTVdIHwgMDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigyOCk7XG4gIH1cbn1cblxuLyoqIEludGVybmFsIFNIQTItNTEyLzI1NiBoYXNoIGNsYXNzLiAqL1xuZXhwb3J0IGNsYXNzIF9TSEE1MTJfMjU2IGV4dGVuZHMgU0hBMl82NEI8X1NIQTUxMl8yNTY+IHtcbiAgcHJvdGVjdGVkIEFoOiBudW1iZXIgPSBUMjU2X0lWWzBdIHwgMDtcbiAgcHJvdGVjdGVkIEFsOiBudW1iZXIgPSBUMjU2X0lWWzFdIHwgMDtcbiAgcHJvdGVjdGVkIEJoOiBudW1iZXIgPSBUMjU2X0lWWzJdIHwgMDtcbiAgcHJvdGVjdGVkIEJsOiBudW1iZXIgPSBUMjU2X0lWWzNdIHwgMDtcbiAgcHJvdGVjdGVkIENoOiBudW1iZXIgPSBUMjU2X0lWWzRdIHwgMDtcbiAgcHJvdGVjdGVkIENsOiBudW1iZXIgPSBUMjU2X0lWWzVdIHwgMDtcbiAgcHJvdGVjdGVkIERoOiBudW1iZXIgPSBUMjU2X0lWWzZdIHwgMDtcbiAgcHJvdGVjdGVkIERsOiBudW1iZXIgPSBUMjU2X0lWWzddIHwgMDtcbiAgcHJvdGVjdGVkIEVoOiBudW1iZXIgPSBUMjU2X0lWWzhdIHwgMDtcbiAgcHJvdGVjdGVkIEVsOiBudW1iZXIgPSBUMjU2X0lWWzldIHwgMDtcbiAgcHJvdGVjdGVkIEZoOiBudW1iZXIgPSBUMjU2X0lWWzEwXSB8IDA7XG4gIHByb3RlY3RlZCBGbDogbnVtYmVyID0gVDI1Nl9JVlsxMV0gfCAwO1xuICBwcm90ZWN0ZWQgR2g6IG51bWJlciA9IFQyNTZfSVZbMTJdIHwgMDtcbiAgcHJvdGVjdGVkIEdsOiBudW1iZXIgPSBUMjU2X0lWWzEzXSB8IDA7XG4gIHByb3RlY3RlZCBIaDogbnVtYmVyID0gVDI1Nl9JVlsxNF0gfCAwO1xuICBwcm90ZWN0ZWQgSGw6IG51bWJlciA9IFQyNTZfSVZbMTVdIHwgMDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigzMik7XG4gIH1cbn1cblxuLyoqXG4gKiBTSEEyLTI1NiBoYXNoIGZ1bmN0aW9uIGZyb20gUkZDIDQ2MzQuIEluIEpTIGl0J3MgdGhlIGZhc3Rlc3Q6IGV2ZW4gZmFzdGVyIHRoYW4gQmxha2UzLiBTb21lIGluZm86XG4gKlxuICogLSBUcnlpbmcgMl4xMjggaGFzaGVzIHdvdWxkIGdldCA1MCUgY2hhbmNlIG9mIGNvbGxpc2lvbiwgdXNpbmcgYmlydGhkYXkgYXR0YWNrLlxuICogLSBCVEMgbmV0d29yayBpcyBkb2luZyAyXjcwIGhhc2hlcy9zZWMgKDJeOTUgaGFzaGVzL3llYXIpIGFzIHBlciAyMDI1LlxuICogLSBFYWNoIHNoYTI1NiBoYXNoIGlzIGV4ZWN1dGluZyAyXjE4IGJpdCBvcGVyYXRpb25zLlxuICogLSBHb29kIDIwMjQgQVNJQ3MgY2FuIGRvIDIwMFRoL3NlYyB3aXRoIDM1MDAgd2F0dHMgb2YgcG93ZXIsIGNvcnJlc3BvbmRpbmcgdG8gMl4zNiBoYXNoZXMvam91bGUuXG4gKi9cbmV4cG9ydCBjb25zdCBzaGEyNTY6IENIYXNoPF9TSEEyNTY+ID0gLyogQF9fUFVSRV9fICovIGNyZWF0ZUhhc2hlcihcbiAgKCkgPT4gbmV3IF9TSEEyNTYoKSxcbiAgLyogQF9fUFVSRV9fICovIG9pZE5pc3QoMHgwMSlcbik7XG4vKiogU0hBMi0yMjQgaGFzaCBmdW5jdGlvbiBmcm9tIFJGQyA0NjM0ICovXG5leHBvcnQgY29uc3Qgc2hhMjI0OiBDSGFzaDxfU0hBMjI0PiA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVIYXNoZXIoXG4gICgpID0+IG5ldyBfU0hBMjI0KCksXG4gIC8qIEBfX1BVUkVfXyAqLyBvaWROaXN0KDB4MDQpXG4pO1xuXG4vKiogU0hBMi01MTIgaGFzaCBmdW5jdGlvbiBmcm9tIFJGQyA0NjM0LiAqL1xuZXhwb3J0IGNvbnN0IHNoYTUxMjogQ0hhc2g8X1NIQTUxMj4gPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlSGFzaGVyKFxuICAoKSA9PiBuZXcgX1NIQTUxMigpLFxuICAvKiBAX19QVVJFX18gKi8gb2lkTmlzdCgweDAzKVxuKTtcbi8qKiBTSEEyLTM4NCBoYXNoIGZ1bmN0aW9uIGZyb20gUkZDIDQ2MzQuICovXG5leHBvcnQgY29uc3Qgc2hhMzg0OiBDSGFzaDxfU0hBMzg0PiA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVIYXNoZXIoXG4gICgpID0+IG5ldyBfU0hBMzg0KCksXG4gIC8qIEBfX1BVUkVfXyAqLyBvaWROaXN0KDB4MDIpXG4pO1xuXG4vKipcbiAqIFNIQTItNTEyLzI1NiBcInRydW5jYXRlZFwiIGhhc2ggZnVuY3Rpb24sIHdpdGggaW1wcm92ZWQgcmVzaXN0YW5jZSB0byBsZW5ndGggZXh0ZW5zaW9uIGF0dGFja3MuXG4gKiBTZWUgdGhlIHBhcGVyIG9uIFt0cnVuY2F0ZWQgU0hBNTEyXShodHRwczovL2VwcmludC5pYWNyLm9yZy8yMDEwLzU0OC5wZGYpLlxuICovXG5leHBvcnQgY29uc3Qgc2hhNTEyXzI1NjogQ0hhc2g8X1NIQTUxMl8yNTY+ID0gLyogQF9fUFVSRV9fICovIGNyZWF0ZUhhc2hlcihcbiAgKCkgPT4gbmV3IF9TSEE1MTJfMjU2KCksXG4gIC8qIEBfX1BVUkVfXyAqLyBvaWROaXN0KDB4MDYpXG4pO1xuLyoqXG4gKiBTSEEyLTUxMi8yMjQgXCJ0cnVuY2F0ZWRcIiBoYXNoIGZ1bmN0aW9uLCB3aXRoIGltcHJvdmVkIHJlc2lzdGFuY2UgdG8gbGVuZ3RoIGV4dGVuc2lvbiBhdHRhY2tzLlxuICogU2VlIHRoZSBwYXBlciBvbiBbdHJ1bmNhdGVkIFNIQTUxMl0oaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxMC81NDgucGRmKS5cbiAqL1xuZXhwb3J0IGNvbnN0IHNoYTUxMl8yMjQ6IENIYXNoPF9TSEE1MTJfMjI0PiA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVIYXNoZXIoXG4gICgpID0+IG5ldyBfU0hBNTEyXzIyNCgpLFxuICAvKiBAX19QVVJFX18gKi8gb2lkTmlzdCgweDA1KVxuKTtcbiIsICIvKipcbiAqIEludGVybmFsIE1lcmtsZS1EYW1nYXJkIGhhc2ggdXRpbHMuXG4gKiBAbW9kdWxlXG4gKi9cbmltcG9ydCB7IGFieXRlcywgYWV4aXN0cywgYW91dHB1dCwgY2xlYW4sIGNyZWF0ZVZpZXcsIHR5cGUgSGFzaCB9IGZyb20gJy4vdXRpbHMudHMnO1xuXG4vKiogQ2hvaWNlOiBhID8gYiA6IGMgKi9cbmV4cG9ydCBmdW5jdGlvbiBDaGkoYTogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiAoYSAmIGIpIF4gKH5hICYgYyk7XG59XG5cbi8qKiBNYWpvcml0eSBmdW5jdGlvbiwgdHJ1ZSBpZiBhbnkgdHdvIGlucHV0cyBpcyB0cnVlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1haihhOiBudW1iZXIsIGI6IG51bWJlciwgYzogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIChhICYgYikgXiAoYSAmIGMpIF4gKGIgJiBjKTtcbn1cblxuLyoqXG4gKiBNZXJrbGUtRGFtZ2FyZCBoYXNoIGNvbnN0cnVjdGlvbiBiYXNlIGNsYXNzLlxuICogQ291bGQgYmUgdXNlZCB0byBjcmVhdGUgTUQ1LCBSSVBFTUQsIFNIQTEsIFNIQTIuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBIYXNoTUQ8VCBleHRlbmRzIEhhc2hNRDxUPj4gaW1wbGVtZW50cyBIYXNoPFQ+IHtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHByb2Nlc3MoYnVmOiBEYXRhVmlldywgb2Zmc2V0OiBudW1iZXIpOiB2b2lkO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0KCk6IG51bWJlcltdO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3Qgc2V0KC4uLmFyZ3M6IG51bWJlcltdKTogdm9pZDtcbiAgYWJzdHJhY3QgZGVzdHJveSgpOiB2b2lkO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3Qgcm91bmRDbGVhbigpOiB2b2lkO1xuXG4gIHJlYWRvbmx5IGJsb2NrTGVuOiBudW1iZXI7XG4gIHJlYWRvbmx5IG91dHB1dExlbjogbnVtYmVyO1xuICByZWFkb25seSBwYWRPZmZzZXQ6IG51bWJlcjtcbiAgcmVhZG9ubHkgaXNMRTogYm9vbGVhbjtcblxuICAvLyBGb3IgcGFydGlhbCB1cGRhdGVzIGxlc3MgdGhhbiBibG9jayBzaXplXG4gIHByb3RlY3RlZCBidWZmZXI6IFVpbnQ4QXJyYXk7XG4gIHByb3RlY3RlZCB2aWV3OiBEYXRhVmlldztcbiAgcHJvdGVjdGVkIGZpbmlzaGVkID0gZmFsc2U7XG4gIHByb3RlY3RlZCBsZW5ndGggPSAwO1xuICBwcm90ZWN0ZWQgcG9zID0gMDtcbiAgcHJvdGVjdGVkIGRlc3Ryb3llZCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKGJsb2NrTGVuOiBudW1iZXIsIG91dHB1dExlbjogbnVtYmVyLCBwYWRPZmZzZXQ6IG51bWJlciwgaXNMRTogYm9vbGVhbikge1xuICAgIHRoaXMuYmxvY2tMZW4gPSBibG9ja0xlbjtcbiAgICB0aGlzLm91dHB1dExlbiA9IG91dHB1dExlbjtcbiAgICB0aGlzLnBhZE9mZnNldCA9IHBhZE9mZnNldDtcbiAgICB0aGlzLmlzTEUgPSBpc0xFO1xuICAgIHRoaXMuYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYmxvY2tMZW4pO1xuICAgIHRoaXMudmlldyA9IGNyZWF0ZVZpZXcodGhpcy5idWZmZXIpO1xuICB9XG4gIHVwZGF0ZShkYXRhOiBVaW50OEFycmF5KTogdGhpcyB7XG4gICAgYWV4aXN0cyh0aGlzKTtcbiAgICBhYnl0ZXMoZGF0YSk7XG4gICAgY29uc3QgeyB2aWV3LCBidWZmZXIsIGJsb2NrTGVuIH0gPSB0aGlzO1xuICAgIGNvbnN0IGxlbiA9IGRhdGEubGVuZ3RoO1xuICAgIGZvciAobGV0IHBvcyA9IDA7IHBvcyA8IGxlbjsgKSB7XG4gICAgICBjb25zdCB0YWtlID0gTWF0aC5taW4oYmxvY2tMZW4gLSB0aGlzLnBvcywgbGVuIC0gcG9zKTtcbiAgICAgIC8vIEZhc3QgcGF0aDogd2UgaGF2ZSBhdCBsZWFzdCBvbmUgYmxvY2sgaW4gaW5wdXQsIGNhc3QgaXQgdG8gdmlldyBhbmQgcHJvY2Vzc1xuICAgICAgaWYgKHRha2UgPT09IGJsb2NrTGVuKSB7XG4gICAgICAgIGNvbnN0IGRhdGFWaWV3ID0gY3JlYXRlVmlldyhkYXRhKTtcbiAgICAgICAgZm9yICg7IGJsb2NrTGVuIDw9IGxlbiAtIHBvczsgcG9zICs9IGJsb2NrTGVuKSB0aGlzLnByb2Nlc3MoZGF0YVZpZXcsIHBvcyk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgYnVmZmVyLnNldChkYXRhLnN1YmFycmF5KHBvcywgcG9zICsgdGFrZSksIHRoaXMucG9zKTtcbiAgICAgIHRoaXMucG9zICs9IHRha2U7XG4gICAgICBwb3MgKz0gdGFrZTtcbiAgICAgIGlmICh0aGlzLnBvcyA9PT0gYmxvY2tMZW4pIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzKHZpZXcsIDApO1xuICAgICAgICB0aGlzLnBvcyA9IDA7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMubGVuZ3RoICs9IGRhdGEubGVuZ3RoO1xuICAgIHRoaXMucm91bmRDbGVhbigpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIGRpZ2VzdEludG8ob3V0OiBVaW50OEFycmF5KTogdm9pZCB7XG4gICAgYWV4aXN0cyh0aGlzKTtcbiAgICBhb3V0cHV0KG91dCwgdGhpcyk7XG4gICAgdGhpcy5maW5pc2hlZCA9IHRydWU7XG4gICAgLy8gUGFkZGluZ1xuICAgIC8vIFdlIGNhbiBhdm9pZCBhbGxvY2F0aW9uIG9mIGJ1ZmZlciBmb3IgcGFkZGluZyBjb21wbGV0ZWx5IGlmIGl0XG4gICAgLy8gd2FzIHByZXZpb3VzbHkgbm90IGFsbG9jYXRlZCBoZXJlLiBCdXQgaXQgd29uJ3QgY2hhbmdlIHBlcmZvcm1hbmNlLlxuICAgIGNvbnN0IHsgYnVmZmVyLCB2aWV3LCBibG9ja0xlbiwgaXNMRSB9ID0gdGhpcztcbiAgICBsZXQgeyBwb3MgfSA9IHRoaXM7XG4gICAgLy8gYXBwZW5kIHRoZSBiaXQgJzEnIHRvIHRoZSBtZXNzYWdlXG4gICAgYnVmZmVyW3BvcysrXSA9IDBiMTAwMDAwMDA7XG4gICAgY2xlYW4odGhpcy5idWZmZXIuc3ViYXJyYXkocG9zKSk7XG4gICAgLy8gd2UgaGF2ZSBsZXNzIHRoYW4gcGFkT2Zmc2V0IGxlZnQgaW4gYnVmZmVyLCBzbyB3ZSBjYW5ub3QgcHV0IGxlbmd0aCBpblxuICAgIC8vIGN1cnJlbnQgYmxvY2ssIG5lZWQgcHJvY2VzcyBpdCBhbmQgcGFkIGFnYWluXG4gICAgaWYgKHRoaXMucGFkT2Zmc2V0ID4gYmxvY2tMZW4gLSBwb3MpIHtcbiAgICAgIHRoaXMucHJvY2Vzcyh2aWV3LCAwKTtcbiAgICAgIHBvcyA9IDA7XG4gICAgfVxuICAgIC8vIFBhZCB1bnRpbCBmdWxsIGJsb2NrIGJ5dGUgd2l0aCB6ZXJvc1xuICAgIGZvciAobGV0IGkgPSBwb3M7IGkgPCBibG9ja0xlbjsgaSsrKSBidWZmZXJbaV0gPSAwO1xuICAgIC8vIE5vdGU6IHNoYTUxMiByZXF1aXJlcyBsZW5ndGggdG8gYmUgMTI4Yml0IGludGVnZXIsIGJ1dCBsZW5ndGggaW4gSlMgd2lsbCBvdmVyZmxvdyBiZWZvcmUgdGhhdFxuICAgIC8vIFlvdSBuZWVkIHRvIHdyaXRlIGFyb3VuZCAyIGV4YWJ5dGVzICh1NjRfbWF4IC8gOCAvICgxMDI0Kio2KSkgZm9yIHRoaXMgdG8gaGFwcGVuLlxuICAgIC8vIFNvIHdlIGp1c3Qgd3JpdGUgbG93ZXN0IDY0IGJpdHMgb2YgdGhhdCB2YWx1ZS5cbiAgICB2aWV3LnNldEJpZ1VpbnQ2NChibG9ja0xlbiAtIDgsIEJpZ0ludCh0aGlzLmxlbmd0aCAqIDgpLCBpc0xFKTtcbiAgICB0aGlzLnByb2Nlc3ModmlldywgMCk7XG4gICAgY29uc3Qgb3ZpZXcgPSBjcmVhdGVWaWV3KG91dCk7XG4gICAgY29uc3QgbGVuID0gdGhpcy5vdXRwdXRMZW47XG4gICAgLy8gTk9URTogd2UgZG8gZGl2aXNpb24gYnkgNCBsYXRlciwgd2hpY2ggbXVzdCBiZSBmdXNlZCBpbiBzaW5nbGUgb3Agd2l0aCBtb2R1bG8gYnkgSklUXG4gICAgaWYgKGxlbiAlIDQpIHRocm93IG5ldyBFcnJvcignX3NoYTI6IG91dHB1dExlbiBtdXN0IGJlIGFsaWduZWQgdG8gMzJiaXQnKTtcbiAgICBjb25zdCBvdXRMZW4gPSBsZW4gLyA0O1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5nZXQoKTtcbiAgICBpZiAob3V0TGVuID4gc3RhdGUubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ19zaGEyOiBvdXRwdXRMZW4gYmlnZ2VyIHRoYW4gc3RhdGUnKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dExlbjsgaSsrKSBvdmlldy5zZXRVaW50MzIoNCAqIGksIHN0YXRlW2ldLCBpc0xFKTtcbiAgfVxuICBkaWdlc3QoKTogVWludDhBcnJheSB7XG4gICAgY29uc3QgeyBidWZmZXIsIG91dHB1dExlbiB9ID0gdGhpcztcbiAgICB0aGlzLmRpZ2VzdEludG8oYnVmZmVyKTtcbiAgICBjb25zdCByZXMgPSBidWZmZXIuc2xpY2UoMCwgb3V0cHV0TGVuKTtcbiAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIF9jbG9uZUludG8odG8/OiBUKTogVCB7XG4gICAgdG8gfHw9IG5ldyAodGhpcy5jb25zdHJ1Y3RvciBhcyBhbnkpKCkgYXMgVDtcbiAgICB0by5zZXQoLi4udGhpcy5nZXQoKSk7XG4gICAgY29uc3QgeyBibG9ja0xlbiwgYnVmZmVyLCBsZW5ndGgsIGZpbmlzaGVkLCBkZXN0cm95ZWQsIHBvcyB9ID0gdGhpcztcbiAgICB0by5kZXN0cm95ZWQgPSBkZXN0cm95ZWQ7XG4gICAgdG8uZmluaXNoZWQgPSBmaW5pc2hlZDtcbiAgICB0by5sZW5ndGggPSBsZW5ndGg7XG4gICAgdG8ucG9zID0gcG9zO1xuICAgIGlmIChsZW5ndGggJSBibG9ja0xlbikgdG8uYnVmZmVyLnNldChidWZmZXIpO1xuICAgIHJldHVybiB0byBhcyB1bmtub3duIGFzIGFueTtcbiAgfVxuICBjbG9uZSgpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fY2xvbmVJbnRvKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbml0aWFsIFNIQS0yIHN0YXRlOiBmcmFjdGlvbmFsIHBhcnRzIG9mIHNxdWFyZSByb290cyBvZiBmaXJzdCAxNiBwcmltZXMgMi4uNTMuXG4gKiBDaGVjayBvdXQgYHRlc3QvbWlzYy9zaGEyLWdlbi1pdi5qc2AgZm9yIHJlY29tcHV0YXRpb24gZ3VpZGUuXG4gKi9cblxuLyoqIEluaXRpYWwgU0hBMjU2IHN0YXRlLiBCaXRzIDAuLjMyIG9mIGZyYWMgcGFydCBvZiBzcXJ0IG9mIHByaW1lcyAyLi4xOSAqL1xuZXhwb3J0IGNvbnN0IFNIQTI1Nl9JVjogVWludDMyQXJyYXkgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4NmEwOWU2NjcsIDB4YmI2N2FlODUsIDB4M2M2ZWYzNzIsIDB4YTU0ZmY1M2EsIDB4NTEwZTUyN2YsIDB4OWIwNTY4OGMsIDB4MWY4M2Q5YWIsIDB4NWJlMGNkMTksXG5dKTtcblxuLyoqIEluaXRpYWwgU0hBMjI0IHN0YXRlLiBCaXRzIDMyLi42NCBvZiBmcmFjIHBhcnQgb2Ygc3FydCBvZiBwcmltZXMgMjMuLjUzICovXG5leHBvcnQgY29uc3QgU0hBMjI0X0lWOiBVaW50MzJBcnJheSA9IC8qIEBfX1BVUkVfXyAqLyBVaW50MzJBcnJheS5mcm9tKFtcbiAgMHhjMTA1OWVkOCwgMHgzNjdjZDUwNywgMHgzMDcwZGQxNywgMHhmNzBlNTkzOSwgMHhmZmMwMGIzMSwgMHg2ODU4MTUxMSwgMHg2NGY5OGZhNywgMHhiZWZhNGZhNCxcbl0pO1xuXG4vKiogSW5pdGlhbCBTSEEzODQgc3RhdGUuIEJpdHMgMC4uNjQgb2YgZnJhYyBwYXJ0IG9mIHNxcnQgb2YgcHJpbWVzIDIzLi41MyAqL1xuZXhwb3J0IGNvbnN0IFNIQTM4NF9JVjogVWludDMyQXJyYXkgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4Y2JiYjlkNWQsIDB4YzEwNTllZDgsIDB4NjI5YTI5MmEsIDB4MzY3Y2Q1MDcsIDB4OTE1OTAxNWEsIDB4MzA3MGRkMTcsIDB4MTUyZmVjZDgsIDB4ZjcwZTU5MzksXG4gIDB4NjczMzI2NjcsIDB4ZmZjMDBiMzEsIDB4OGViNDRhODcsIDB4Njg1ODE1MTEsIDB4ZGIwYzJlMGQsIDB4NjRmOThmYTcsIDB4NDdiNTQ4MWQsIDB4YmVmYTRmYTQsXG5dKTtcblxuLyoqIEluaXRpYWwgU0hBNTEyIHN0YXRlLiBCaXRzIDAuLjY0IG9mIGZyYWMgcGFydCBvZiBzcXJ0IG9mIHByaW1lcyAyLi4xOSAqL1xuZXhwb3J0IGNvbnN0IFNIQTUxMl9JVjogVWludDMyQXJyYXkgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4NmEwOWU2NjcsIDB4ZjNiY2M5MDgsIDB4YmI2N2FlODUsIDB4ODRjYWE3M2IsIDB4M2M2ZWYzNzIsIDB4ZmU5NGY4MmIsIDB4YTU0ZmY1M2EsIDB4NWYxZDM2ZjEsXG4gIDB4NTEwZTUyN2YsIDB4YWRlNjgyZDEsIDB4OWIwNTY4OGMsIDB4MmIzZTZjMWYsIDB4MWY4M2Q5YWIsIDB4ZmI0MWJkNmIsIDB4NWJlMGNkMTksIDB4MTM3ZTIxNzksXG5dKTtcbiIsICIvKipcbiAqIEBtb2R1bGUgbm9zdHItY3J5cHRvLXV0aWxzXG4gKiBAZGVzY3JpcHRpb24gQ29yZSBjcnlwdG9ncmFwaGljIHV0aWxpdGllcyBmb3IgTm9zdHIgcHJvdG9jb2xcbiAqL1xuXG4vLyBDb3JlIHR5cGVzXG5leHBvcnQgdHlwZSB7XG4gIE5vc3RyRXZlbnQsXG4gIFVuc2lnbmVkTm9zdHJFdmVudCxcbiAgU2lnbmVkTm9zdHJFdmVudCxcbiAgTm9zdHJGaWx0ZXIsXG4gIE5vc3RyU3Vic2NyaXB0aW9uLFxuICBQdWJsaWNLZXksXG4gIEtleVBhaXIsXG4gIE5vc3RyTWVzc2FnZVR1cGxlLFxufSBmcm9tICcuL3R5cGVzJztcblxuLy8gRXZlbnQga2luZHMsIG1lc3NhZ2UgdHlwZXMsIGFuZCBOSVAtNDYgdHlwZXNcbmV4cG9ydCB7IE5vc3RyRXZlbnRLaW5kLCBOb3N0ck1lc3NhZ2VUeXBlLCBOaXA0Nk1ldGhvZCB9IGZyb20gJy4vdHlwZXMnO1xuZXhwb3J0IHR5cGUge1xuICBOaXA0NlJlcXVlc3QsXG4gIE5pcDQ2UmVzcG9uc2UsXG4gIE5pcDQ2U2Vzc2lvbixcbiAgTmlwNDZTZXNzaW9uSW5mbyxcbiAgQnVua2VyVVJJLFxuICBCdW5rZXJWYWxpZGF0aW9uUmVzdWx0LFxufSBmcm9tICcuL3R5cGVzJztcblxuLy8gQ29yZSBjcnlwdG8gZnVuY3Rpb25zXG5leHBvcnQge1xuICBnZW5lcmF0ZUtleVBhaXIsXG4gIGdldFB1YmxpY0tleSxcbiAgZ2V0UHVibGljS2V5U3luYyxcbiAgdmFsaWRhdGVLZXlQYWlyLFxuICBjcmVhdGVFdmVudCxcbiAgc2lnbkV2ZW50LFxuICBmaW5hbGl6ZUV2ZW50LFxuICB2ZXJpZnlTaWduYXR1cmUsXG4gIGVuY3J5cHQsXG4gIGRlY3J5cHQsXG59IGZyb20gJy4vY3J5cHRvJztcblxuLy8gVmFsaWRhdGlvbiBmdW5jdGlvbnNcbmV4cG9ydCB7XG4gIHZhbGlkYXRlRXZlbnQsXG4gIHZhbGlkYXRlRXZlbnRJZCxcbiAgdmFsaWRhdGVFdmVudFNpZ25hdHVyZSxcbiAgdmFsaWRhdGVTaWduZWRFdmVudCxcbiAgdmFsaWRhdGVFdmVudEJhc2UsXG4gIHZhbGlkYXRlRmlsdGVyLFxuICB2YWxpZGF0ZVN1YnNjcmlwdGlvbixcbiAgdmFsaWRhdGVSZXNwb25zZSxcbn0gZnJvbSAnLi92YWxpZGF0aW9uJztcblxuLy8gRXZlbnQgZnVuY3Rpb25zXG5leHBvcnQge1xuICBjYWxjdWxhdGVFdmVudElkLFxufSBmcm9tICcuL2V2ZW50JztcblxuLy8gTklQLTA0IGVuY3J5cHRpb25cbmV4cG9ydCB7XG4gIGNvbXB1dGVTaGFyZWRTZWNyZXQsXG4gIGVuY3J5cHRNZXNzYWdlLFxuICBkZWNyeXB0TWVzc2FnZSxcbn0gZnJvbSAnLi9uaXBzL25pcC0wNCc7XG5cbi8vIFJlLWV4cG9ydCBOSVBzXG5leHBvcnQgKiBhcyBuaXAwMSBmcm9tICcuL25pcHMvbmlwLTAxJztcbmV4cG9ydCAqIGFzIG5pcDA0IGZyb20gJy4vbmlwcy9uaXAtMDQnO1xuZXhwb3J0ICogYXMgbmlwMTkgZnJvbSAnLi9uaXBzL25pcC0xOSc7XG5leHBvcnQgKiBhcyBuaXAyNiBmcm9tICcuL25pcHMvbmlwLTI2JztcbmV4cG9ydCAqIGFzIG5pcDQ0IGZyb20gJy4vbmlwcy9uaXAtNDQnO1xuZXhwb3J0ICogYXMgbmlwNDYgZnJvbSAnLi9uaXBzL25pcC00Nic7XG5leHBvcnQgKiBhcyBuaXA0OSBmcm9tICcuL25pcHMvbmlwLTQ5JztcblxuLy8gVXRpbHNcbmV4cG9ydCB7XG4gIGhleFRvQnl0ZXMsXG4gIGJ5dGVzVG9IZXgsXG4gIHV0ZjhUb0J5dGVzLFxuICBieXRlc1RvVXRmOCxcbn0gZnJvbSAnLi91dGlscy9lbmNvZGluZyc7XG4iLCAiLyoqXG4gKiBAbW9kdWxlIHR5cGVzXG4gKiBAZGVzY3JpcHRpb24gVHlwZSBkZWZpbml0aW9ucyBmb3IgTm9zdHJcbiAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIFB1YmxpY0tleURldGFpbHMge1xuICBoZXg6IHN0cmluZztcbiAgYnl0ZXM6IFVpbnQ4QXJyYXk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgS2V5UGFpciB7XG4gIHByaXZhdGVLZXk6IHN0cmluZztcbiAgcHVibGljS2V5OiBQdWJsaWNLZXlEZXRhaWxzO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5vc3RyRXZlbnQge1xuICBraW5kOiBudW1iZXI7XG4gIGNyZWF0ZWRfYXQ6IG51bWJlcjtcbiAgdGFnczogc3RyaW5nW11bXTtcbiAgY29udGVudDogc3RyaW5nO1xuICBwdWJrZXk6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTaWduZWROb3N0ckV2ZW50IGV4dGVuZHMgTm9zdHJFdmVudCB7XG4gIGlkOiBzdHJpbmc7XG4gIHNpZzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFB1YmxpY0tleSB7XG4gIGhleDogc3RyaW5nO1xuICBieXRlcz86IFVpbnQ4QXJyYXk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGlvblJlc3VsdCB7XG4gIGlzVmFsaWQ6IGJvb2xlYW47XG4gIGVycm9yPzogc3RyaW5nO1xufVxuXG5leHBvcnQgZW51bSBOb3N0ckV2ZW50S2luZCB7XG4gIFNFVF9NRVRBREFUQSA9IDAsXG4gIFRFWFRfTk9URSA9IDEsXG4gIFJFQ09NTUVORF9TRVJWRVIgPSAyLFxuICBDT05UQUNUX0xJU1QgPSAzLFxuICBFTkNSWVBURURfRElSRUNUX01FU1NBR0UgPSA0LFxuICBERUxFVEUgPSA1LFxuICBSRVBPU1QgPSA2LFxuICBSRUFDVElPTiA9IDcsXG4gIEJBREdFX0FXQVJEID0gOCxcbiAgQ0hBTk5FTF9DUkVBVEUgPSA0MCxcbiAgQ0hBTk5FTF9NRVRBREFUQSA9IDQxLFxuICBDSEFOTkVMX01FU1NBR0UgPSA0MixcbiAgQ0hBTk5FTF9ISURFX01FU1NBR0UgPSA0MyxcbiAgQ0hBTk5FTF9NVVRFX1VTRVIgPSA0NCxcbiAgQ0hBTk5FTF9SRVNFUlZFID0gNDUsXG4gIFJFUE9SVElORyA9IDE5ODQsXG4gIFpBUF9SRVFVRVNUID0gOTczNCxcbiAgWkFQID0gOTczNSxcbiAgTVVURV9MSVNUID0gMTAwMDAsXG4gIFBJTl9MSVNUID0gMTAwMDEsXG4gIFJFTEFZX0xJU1RfTUVUQURBVEEgPSAxMDAwMixcbiAgQ0xJRU5UX0FVVEggPSAyMjI0MixcbiAgQVVUSF9SRVNQT05TRSA9IDIyMjQzLFxuICBOT1NUUl9DT05ORUNUID0gMjQxMzMsXG4gIENBVEVHT1JJWkVEX1BFT1BMRSA9IDMwMDAwLFxuICBDQVRFR09SSVpFRF9CT09LTUFSS1MgPSAzMDAwMSxcbiAgUFJPRklMRV9CQURHRVMgPSAzMDAwOCxcbiAgQkFER0VfREVGSU5JVElPTiA9IDMwMDA5LFxuICBMT05HX0ZPUk0gPSAzMDAyMyxcbiAgQVBQTElDQVRJT05fU1BFQ0lGSUMgPSAzMDA3OFxufVxuXG4vKipcbiAqIFJlLWV4cG9ydCBhbGwgdHlwZXMgZnJvbSBiYXNlIG1vZHVsZVxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKi9cbmV4cG9ydCAqIGZyb20gJy4vYmFzZSc7XG5cbi8qKiBSZS1leHBvcnQgcHJvdG9jb2wgdHlwZXMgKi9cbmV4cG9ydCAqIGZyb20gJy4vcHJvdG9jb2wnO1xuXG4vKiogUmUtZXhwb3J0IG1lc3NhZ2UgdHlwZXMgKi9cbmV4cG9ydCAqIGZyb20gJy4vbWVzc2FnZXMnO1xuXG4vKiogUmUtZXhwb3J0IHR5cGUgZ3VhcmRzICovXG5leHBvcnQgKiBmcm9tICcuL2d1YXJkcyc7XG5cbi8vIFJlLWV4cG9ydCBOSVAtMTkgdHlwZXNcbmV4cG9ydCB0eXBlIHtcbiAgTmlwMTlEYXRhVHlwZVxufSBmcm9tICcuLi9uaXBzL25pcC0xOSc7XG5cbi8qKiBSZS1leHBvcnQgTklQLTQ2IHR5cGVzICovXG5leHBvcnQgKiBmcm9tICcuL25pcDQ2JztcbiIsICIvKipcbiAqIEBtb2R1bGUgdHlwZXMvYmFzZVxuICogQGRlc2NyaXB0aW9uIENvcmUgdHlwZSBkZWZpbml0aW9ucyBmb3IgTm9zdHIgcHJvdG9jb2xcbiAqL1xuXG4vLyBLZXkgVHlwZXNcbmV4cG9ydCB0eXBlIFB1YmxpY0tleUhleCA9IHN0cmluZztcbmV4cG9ydCB0eXBlIFByaXZhdGVLZXlIZXggPSBzdHJpbmc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHVibGljS2V5RGV0YWlscyB7XG4gIC8qKiBQdWJsaWMga2V5IGluIGhleCBmb3JtYXQgKi9cbiAgaGV4OiBzdHJpbmc7XG4gIC8qKiBOSVAtMDUgaWRlbnRpZmllciAqL1xuICBuaXAwNTogc3RyaW5nO1xuICAvKiogUHVibGljIGtleSBpbiBieXRlcyBmb3JtYXQgKi9cbiAgYnl0ZXM6IFVpbnQ4QXJyYXk7XG59XG5cbmV4cG9ydCB0eXBlIFB1YmxpY0tleSA9IFB1YmxpY0tleUhleCB8IFB1YmxpY0tleURldGFpbHM7XG5cbmV4cG9ydCBpbnRlcmZhY2UgS2V5UGFpciB7XG4gIC8qKiBQcml2YXRlIGtleSBpbiBoZXggZm9ybWF0ICovXG4gIHByaXZhdGVLZXk6IFByaXZhdGVLZXlIZXg7XG4gIC8qKiBQdWJsaWMga2V5IGRldGFpbHMgKi9cbiAgcHVibGljS2V5OiBQdWJsaWNLZXlEZXRhaWxzO1xufVxuXG4vLyBFdmVudCBUeXBlc1xuZXhwb3J0IGVudW0gTm9zdHJFdmVudEtpbmQge1xuICAvLyBOSVAtMDE6IENvcmUgUHJvdG9jb2xcbiAgU0VUX01FVEFEQVRBID0gMCxcbiAgVEVYVF9OT1RFID0gMSxcbiAgUkVDT01NRU5EX1NFUlZFUiA9IDIsXG4gIENPTlRBQ1RTID0gMyxcbiAgRU5DUllQVEVEX0RJUkVDVF9NRVNTQUdFID0gNCxcbiAgRVZFTlRfREVMRVRJT04gPSA1LFxuICBSRVBPU1QgPSA2LFxuICBSRUFDVElPTiA9IDcsXG5cbiAgLy8gTklQLTI4OiBQdWJsaWMgQ2hhdFxuICBDSEFOTkVMX0NSRUFUSU9OID0gNDAsXG4gIENIQU5ORUxfTUVUQURBVEEgPSA0MSxcbiAgQ0hBTk5FTF9NRVNTQUdFID0gNDIsXG4gIENIQU5ORUxfSElERV9NRVNTQUdFID0gNDMsXG4gIENIQU5ORUxfTVVURV9VU0VSID0gNDQsXG5cbiAgLy8gTklQLTQyOiBBdXRoZW50aWNhdGlvblxuICBBVVRIID0gMjIyNDIsXG4gIEFVVEhfUkVTUE9OU0UgPSAyMjI0M1xufVxuXG4vKiogQmFzZSBpbnRlcmZhY2UgZm9yIGFsbCBOb3N0ciBldmVudHMgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmFzZU5vc3RyRXZlbnQge1xuICAvKiogRXZlbnQga2luZCBhcyBkZWZpbmVkIGluIE5JUHMgKi9cbiAga2luZDogbnVtYmVyO1xuICAvKiogQ29udGVudCBvZiB0aGUgZXZlbnQgKi9cbiAgY29udGVudDogc3RyaW5nO1xuICAvKiogQXJyYXkgb2YgdGFncyAqL1xuICB0YWdzOiBzdHJpbmdbXVtdO1xuICAvKiogVW5peCB0aW1lc3RhbXAgaW4gc2Vjb25kcyAqL1xuICBjcmVhdGVkX2F0OiBudW1iZXI7XG59XG5cbi8qKiBJbnRlcmZhY2UgZm9yIGV2ZW50cyB0aGF0IGhhdmVuJ3QgYmVlbiBzaWduZWQgeWV0ICovXG5leHBvcnQgaW50ZXJmYWNlIFVuc2lnbmVkTm9zdHJFdmVudCBleHRlbmRzIEJhc2VOb3N0ckV2ZW50IHtcbiAgLyoqIE9wdGlvbmFsIHB1YmxpYyBrZXkgKi9cbiAgcHVia2V5Pzogc3RyaW5nO1xufVxuXG4vKiogSW50ZXJmYWNlIGZvciBzaWduZWQgZXZlbnRzICovXG5leHBvcnQgaW50ZXJmYWNlIFNpZ25lZE5vc3RyRXZlbnQgZXh0ZW5kcyBCYXNlTm9zdHJFdmVudCB7XG4gIC8qKiBQdWJsaWMga2V5IG9mIHRoZSBldmVudCBjcmVhdG9yICovXG4gIHB1YmtleTogc3RyaW5nO1xuICAvKiogRXZlbnQgSUQgKHNoYTI1NiBvZiB0aGUgc2VyaWFsaXplZCBldmVudCkgKi9cbiAgaWQ6IHN0cmluZztcbiAgLyoqIFNjaG5vcnIgc2lnbmF0dXJlIG9mIHRoZSBldmVudCBJRCAqL1xuICBzaWc6IHN0cmluZztcbn1cblxuLyoqIEFsaWFzIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5ICovXG5leHBvcnQgdHlwZSBOb3N0ckV2ZW50ID0gU2lnbmVkTm9zdHJFdmVudDtcblxuLyoqIFR5cGUgZm9yIGNyZWF0aW5nIG5ldyBldmVudHMgKi9cbmV4cG9ydCB0eXBlIFVuc2lnbmVkRXZlbnQgPSBPbWl0PE5vc3RyRXZlbnQsICdpZCcgfCAnc2lnJz47XG5cbi8vIEZpbHRlciBUeXBlc1xuZXhwb3J0IGludGVyZmFjZSBOb3N0ckZpbHRlciB7XG4gIGlkcz86IHN0cmluZ1tdO1xuICBhdXRob3JzPzogc3RyaW5nW107XG4gIGtpbmRzPzogTm9zdHJFdmVudEtpbmRbXTtcbiAgc2luY2U/OiBudW1iZXI7XG4gIHVudGlsPzogbnVtYmVyO1xuICBsaW1pdD86IG51bWJlcjtcbiAgJyNlJz86IHN0cmluZ1tdO1xuICAnI3AnPzogc3RyaW5nW107XG4gIHNlYXJjaD86IHN0cmluZztcbiAgLyoqIFN1cHBvcnQgZm9yIGFyYml0cmFyeSB0YWdzIChOSVAtMTIpICovXG4gIFtrZXk6IGAjJHtzdHJpbmd9YF06IHN0cmluZ1tdIHwgdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5vc3RyU3Vic2NyaXB0aW9uIHtcbiAgaWQ6IHN0cmluZztcbiAgZmlsdGVyczogTm9zdHJGaWx0ZXJbXTtcbn1cblxuLy8gTWVzc2FnZSBUeXBlc1xuZXhwb3J0IGVudW0gTm9zdHJNZXNzYWdlVHlwZSB7XG4gIEVWRU5UID0gJ0VWRU5UJyxcbiAgTk9USUNFID0gJ05PVElDRScsXG4gIE9LID0gJ09LJyxcbiAgRU9TRSA9ICdFT1NFJyxcbiAgUkVRID0gJ1JFUScsXG4gIENMT1NFID0gJ0NMT1NFJyxcbiAgQVVUSCA9ICdBVVRIJ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5vc3RyTWVzc2FnZSB7XG4gIHR5cGU6IE5vc3RyTWVzc2FnZVR5cGU7XG4gIGV2ZW50PzogU2lnbmVkTm9zdHJFdmVudDtcbiAgc3Vic2NyaXB0aW9uSWQ/OiBzdHJpbmc7XG4gIGZpbHRlcnM/OiBOb3N0ckZpbHRlcltdO1xuICBldmVudElkPzogc3RyaW5nO1xuICBhY2NlcHRlZD86IGJvb2xlYW47XG4gIG1lc3NhZ2U/OiBzdHJpbmc7XG4gIGNvdW50PzogbnVtYmVyO1xuICBwYXlsb2FkPzogc3RyaW5nIHwgKHN0cmluZyB8IGJvb2xlYW4pW107ICBcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOb3N0clJlc3BvbnNlIHtcbiAgdHlwZTogTm9zdHJNZXNzYWdlVHlwZTtcbiAgZXZlbnQ/OiBTaWduZWROb3N0ckV2ZW50O1xuICBzdWJzY3JpcHRpb25JZD86IHN0cmluZztcbiAgZmlsdGVycz86IE5vc3RyRmlsdGVyW107XG4gIGV2ZW50SWQ/OiBzdHJpbmc7XG4gIGFjY2VwdGVkPzogYm9vbGVhbjtcbiAgbWVzc2FnZT86IHN0cmluZztcbiAgY291bnQ/OiBudW1iZXI7XG59XG5cbi8vIFV0aWxpdHkgVHlwZXNcbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGlvblJlc3VsdCB7XG4gIGlzVmFsaWQ6IGJvb2xlYW47XG4gIGVycm9yPzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5vc3RyRXJyb3Ige1xuICBjb2RlOiBzdHJpbmc7XG4gIG1lc3NhZ2U6IHN0cmluZztcbiAgZGV0YWlscz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuIiwgIi8qKlxuICogQG1vZHVsZSB0eXBlcy9wcm90b2NvbFxuICogQGRlc2NyaXB0aW9uIE5vc3RyIHByb3RvY29sIHR5cGVzXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBcbiAgTm9zdHJGaWx0ZXIsIFxuICBQdWJsaWNLZXksXG4gIE5vc3RyTWVzc2FnZVR5cGUsXG4gIE5vc3RyU3Vic2NyaXB0aW9uLFxuICBOb3N0clJlc3BvbnNlLFxuICBOb3N0ckVycm9yXG59IGZyb20gJy4vYmFzZS5qcyc7XG5cbi8vIFJlLWV4cG9ydCB0eXBlcyBmcm9tIGJhc2UgdGhhdCBhcmUgdXNlZCBpbiB0aGlzIG1vZHVsZVxuZXhwb3J0IHR5cGUgeyBcbiAgTm9zdHJGaWx0ZXIsIFxuICBQdWJsaWNLZXksXG4gIE5vc3RyTWVzc2FnZVR5cGUsXG4gIE5vc3RyU3Vic2NyaXB0aW9uLFxuICBOb3N0clJlc3BvbnNlLFxuICBOb3N0ckVycm9yXG59O1xuIiwgImV4cG9ydCB7fTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1lc3NhZ2VzLmpzLm1hcCIsICIvKipcbiAqIEBtb2R1bGUgdHlwZXMvZ3VhcmRzXG4gKiBAZGVzY3JpcHRpb24gVHlwZSBndWFyZCBmdW5jdGlvbnMgZm9yIE5vc3RyIHR5cGVzXG4gKi9cblxuaW1wb3J0IHsgTm9zdHJFdmVudCwgU2lnbmVkTm9zdHJFdmVudCwgTm9zdHJGaWx0ZXIsIE5vc3RyU3Vic2NyaXB0aW9uLCBOb3N0clJlc3BvbnNlLCBOb3N0ckVycm9yIH0gZnJvbSAnLi9iYXNlJztcblxuLyoqXG4gKiBUeXBlIGd1YXJkIGZvciBOb3N0ckV2ZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05vc3RyRXZlbnQoZXZlbnQ6IHVua25vd24pOiBldmVudCBpcyBOb3N0ckV2ZW50IHtcbiAgaWYgKHR5cGVvZiBldmVudCAhPT0gJ29iamVjdCcgfHwgZXZlbnQgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCB2YWxpZEV2ZW50ID0gZXZlbnQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgLy8gUmVxdWlyZWQgZmllbGRzXG4gIGlmICh0eXBlb2YgdmFsaWRFdmVudC5raW5kICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcih2YWxpZEV2ZW50LmtpbmQpIHx8IHZhbGlkRXZlbnQua2luZCA8IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodHlwZW9mIHZhbGlkRXZlbnQuY29udGVudCAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodHlwZW9mIHZhbGlkRXZlbnQuY3JlYXRlZF9hdCAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIodmFsaWRFdmVudC5jcmVhdGVkX2F0KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENoZWNrIHB1YmtleSBzdHJ1Y3R1cmVcbiAgaWYgKHZhbGlkRXZlbnQucHVia2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAodHlwZW9mIHZhbGlkRXZlbnQucHVia2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKCF2YWxpZEV2ZW50LnB1YmtleSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsaWRFdmVudC5wdWJrZXkgPT09ICdvYmplY3QnICYmIHZhbGlkRXZlbnQucHVia2V5ICE9PSBudWxsKSB7XG4gICAgICBjb25zdCBwdWJrZXkgPSB2YWxpZEV2ZW50LnB1YmtleSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgIGlmICh0eXBlb2YgcHVia2V5LmhleCAhPT0gJ3N0cmluZycgfHwgIXB1YmtleS5oZXgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2sgdGFncyBhcnJheVxuICBpZiAoIUFycmF5LmlzQXJyYXkodmFsaWRFdmVudC50YWdzKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENoZWNrIHRhZyBhcnJheSBlbGVtZW50c1xuICBpZiAoIXZhbGlkRXZlbnQudGFncy5ldmVyeSh0YWcgPT4gQXJyYXkuaXNBcnJheSh0YWcpICYmIHRhZy5ldmVyeShpdGVtID0+IHR5cGVvZiBpdGVtID09PSAnc3RyaW5nJykpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogVHlwZSBndWFyZCBmb3IgU2lnbmVkTm9zdHJFdmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTaWduZWROb3N0ckV2ZW50KGV2ZW50OiB1bmtub3duKTogZXZlbnQgaXMgU2lnbmVkTm9zdHJFdmVudCB7XG4gIGlmICghZXZlbnQgfHwgdHlwZW9mIGV2ZW50ICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHNpZ25lZEV2ZW50ID0gZXZlbnQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgLy8gQ2hlY2sgcmVxdWlyZWQgZmllbGRzIGZyb20gTm9zdHJFdmVudFxuICBpZiAoIWlzTm9zdHJFdmVudChldmVudCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBDaGVjayBwdWJrZXkgaXMgcHJlc2VudCBhbmQgdmFsaWRcbiAgaWYgKHR5cGVvZiBzaWduZWRFdmVudC5wdWJrZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKCFzaWduZWRFdmVudC5wdWJrZXkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHNpZ25lZEV2ZW50LnB1YmtleSA9PT0gJ29iamVjdCcgJiYgc2lnbmVkRXZlbnQucHVia2V5ICE9PSBudWxsKSB7XG4gICAgY29uc3QgcHVia2V5ID0gc2lnbmVkRXZlbnQucHVia2V5IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIGlmICh0eXBlb2YgcHVia2V5LmhleCAhPT0gJ3N0cmluZycgfHwgIXB1YmtleS5oZXgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ2hlY2sgaWQgZmllbGRcbiAgaWYgKHR5cGVvZiBzaWduZWRFdmVudC5pZCAhPT0gJ3N0cmluZycgfHwgIXNpZ25lZEV2ZW50LmlkKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ2hlY2sgc2lnIGZpZWxkXG4gIGlmICh0eXBlb2Ygc2lnbmVkRXZlbnQuc2lnICE9PSAnc3RyaW5nJyB8fCAhc2lnbmVkRXZlbnQuc2lnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogVHlwZSBndWFyZCBmb3IgTm9zdHJGaWx0ZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTm9zdHJGaWx0ZXIoZmlsdGVyOiB1bmtub3duKTogZmlsdGVyIGlzIE5vc3RyRmlsdGVyIHtcbiAgaWYgKHR5cGVvZiBmaWx0ZXIgIT09ICdvYmplY3QnIHx8IGZpbHRlciA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHZhbGlkRmlsdGVyID0gZmlsdGVyIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBjb25zdCB2YWxpZEtleXMgPSBbJ2lkcycsICdhdXRob3JzJywgJ2tpbmRzJywgJ3NpbmNlJywgJ3VudGlsJywgJ2xpbWl0JywgJyNlJywgJyNwJywgJyN0J107XG4gIGNvbnN0IGZpbHRlcktleXMgPSBPYmplY3Qua2V5cyh2YWxpZEZpbHRlcik7XG5cbiAgLy8gQ2hlY2sgaWYgYWxsIGtleXMgaW4gdGhlIGZpbHRlciBhcmUgdmFsaWRcbiAgaWYgKCFmaWx0ZXJLZXlzLmV2ZXJ5KGtleSA9PiB2YWxpZEtleXMuaW5jbHVkZXMoa2V5KSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSBhcnJheSBmaWVsZHNcbiAgaWYgKHZhbGlkRmlsdGVyLmlkcyAhPT0gdW5kZWZpbmVkICYmICghQXJyYXkuaXNBcnJheSh2YWxpZEZpbHRlci5pZHMpIHx8ICF2YWxpZEZpbHRlci5pZHMuZXZlcnkoaWQgPT4gdHlwZW9mIGlkID09PSAnc3RyaW5nJykpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh2YWxpZEZpbHRlci5hdXRob3JzICE9PSB1bmRlZmluZWQgJiYgKCFBcnJheS5pc0FycmF5KHZhbGlkRmlsdGVyLmF1dGhvcnMpIHx8ICF2YWxpZEZpbHRlci5hdXRob3JzLmV2ZXJ5KGF1dGhvciA9PiB0eXBlb2YgYXV0aG9yID09PSAnc3RyaW5nJykpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh2YWxpZEZpbHRlci5raW5kcyAhPT0gdW5kZWZpbmVkICYmICghQXJyYXkuaXNBcnJheSh2YWxpZEZpbHRlci5raW5kcykgfHwgIXZhbGlkRmlsdGVyLmtpbmRzLmV2ZXJ5KGtpbmQgPT4gdHlwZW9mIGtpbmQgPT09ICdudW1iZXInICYmIE51bWJlci5pc0ludGVnZXIoa2luZCkgJiYga2luZCA+PSAwKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHZhbGlkRmlsdGVyWycjZSddICE9PSB1bmRlZmluZWQgJiYgKCFBcnJheS5pc0FycmF5KHZhbGlkRmlsdGVyWycjZSddKSB8fCAhdmFsaWRGaWx0ZXJbJyNlJ10uZXZlcnkoZSA9PiB0eXBlb2YgZSA9PT0gJ3N0cmluZycpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodmFsaWRGaWx0ZXJbJyNwJ10gIT09IHVuZGVmaW5lZCAmJiAoIUFycmF5LmlzQXJyYXkodmFsaWRGaWx0ZXJbJyNwJ10pIHx8ICF2YWxpZEZpbHRlclsnI3AnXS5ldmVyeShwID0+IHR5cGVvZiBwID09PSAnc3RyaW5nJykpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh2YWxpZEZpbHRlclsnI3QnXSAhPT0gdW5kZWZpbmVkICYmICghQXJyYXkuaXNBcnJheSh2YWxpZEZpbHRlclsnI3QnXSkgfHwgIXZhbGlkRmlsdGVyWycjdCddLmV2ZXJ5KHQgPT4gdHlwZW9mIHQgPT09ICdzdHJpbmcnKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSBudW1iZXIgZmllbGRzXG4gIGlmICh2YWxpZEZpbHRlci5zaW5jZSAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB2YWxpZEZpbHRlci5zaW5jZSAhPT0gJ251bWJlcicpIHJldHVybiBmYWxzZTtcbiAgaWYgKHZhbGlkRmlsdGVyLnVudGlsICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHZhbGlkRmlsdGVyLnVudGlsICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICBpZiAodmFsaWRGaWx0ZXIubGltaXQgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdmFsaWRGaWx0ZXIubGltaXQgIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogVHlwZSBndWFyZCBmb3IgTm9zdHJTdWJzY3JpcHRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTm9zdHJTdWJzY3JpcHRpb24oc3ViOiB1bmtub3duKTogc3ViIGlzIE5vc3RyU3Vic2NyaXB0aW9uIHtcbiAgaWYgKHR5cGVvZiBzdWIgIT09ICdvYmplY3QnIHx8IHN1YiA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHZhbGlkU3ViID0gc3ViIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIGlmICh0eXBlb2YgdmFsaWRTdWIuaWQgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCFBcnJheS5pc0FycmF5KHZhbGlkU3ViLmZpbHRlcnMpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCF2YWxpZFN1Yi5maWx0ZXJzLmV2ZXJ5KGZpbHRlciA9PiBpc05vc3RyRmlsdGVyKGZpbHRlcikpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogVHlwZSBndWFyZCBmb3IgTm9zdHJSZXNwb25zZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOb3N0clJlc3BvbnNlKHJlc3BvbnNlOiB1bmtub3duKTogcmVzcG9uc2UgaXMgTm9zdHJSZXNwb25zZSB7XG4gIGlmICh0eXBlb2YgcmVzcG9uc2UgIT09ICdvYmplY3QnIHx8IHJlc3BvbnNlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgdmFsaWRSZXNwb25zZSA9IHJlc3BvbnNlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIGlmICh0eXBlb2YgdmFsaWRSZXNwb25zZS50eXBlICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh2YWxpZFJlc3BvbnNlLnN1YnNjcmlwdGlvbklkICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHZhbGlkUmVzcG9uc2Uuc3Vic2NyaXB0aW9uSWQgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHZhbGlkUmVzcG9uc2UuZXZlbnQgIT09IHVuZGVmaW5lZCAmJiAhaXNTaWduZWROb3N0ckV2ZW50KHZhbGlkUmVzcG9uc2UuZXZlbnQpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHZhbGlkUmVzcG9uc2UubWVzc2FnZSAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB2YWxpZFJlc3BvbnNlLm1lc3NhZ2UgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogVHlwZSBndWFyZCBmb3IgTm9zdHJFcnJvclxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOb3N0ckVycm9yKGVycm9yOiB1bmtub3duKTogZXJyb3IgaXMgTm9zdHJFcnJvciB7XG4gIGlmICh0eXBlb2YgZXJyb3IgIT09ICdvYmplY3QnIHx8IGVycm9yID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgdmFsaWRFcnJvciA9IGVycm9yIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHZhbGlkRXJyb3IudHlwZSA9PT0gJ3N0cmluZycgJiZcbiAgICB0eXBlb2YgdmFsaWRFcnJvci5tZXNzYWdlID09PSAnc3RyaW5nJ1xuICApO1xufVxuIiwgIi8qKlxuICogQG1vZHVsZSB0eXBlcy9uaXA0NlxuICogQGRlc2NyaXB0aW9uIFR5cGUgZGVmaW5pdGlvbnMgZm9yIE5JUC00NiAoTm9zdHIgQ29ubmVjdCAvIFJlbW90ZSBTaWduaW5nKVxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci80Ni5tZFxuICovXG5cbi8qKlxuICogTklQLTQ2IHJlbW90ZSBzaWduaW5nIG1ldGhvZHNcbiAqL1xuZXhwb3J0IGVudW0gTmlwNDZNZXRob2Qge1xuICBDT05ORUNUID0gJ2Nvbm5lY3QnLFxuICBQSU5HID0gJ3BpbmcnLFxuICBHRVRfUFVCTElDX0tFWSA9ICdnZXRfcHVibGljX2tleScsXG4gIFNJR05fRVZFTlQgPSAnc2lnbl9ldmVudCcsXG4gIE5JUDA0X0VOQ1JZUFQgPSAnbmlwMDRfZW5jcnlwdCcsXG4gIE5JUDA0X0RFQ1JZUFQgPSAnbmlwMDRfZGVjcnlwdCcsXG4gIE5JUDQ0X0VOQ1JZUFQgPSAnbmlwNDRfZW5jcnlwdCcsXG4gIE5JUDQ0X0RFQ1JZUFQgPSAnbmlwNDRfZGVjcnlwdCcsXG4gIEdFVF9SRUxBWVMgPSAnZ2V0X3JlbGF5cycsXG59XG5cbi8qKlxuICogUGFyc2VkIGJ1bmtlcjovLyBVUklcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBCdW5rZXJVUkkge1xuICAvKiogUmVtb3RlIHNpZ25lcidzIHB1YmxpYyBrZXkgKGhleCkgKi9cbiAgcmVtb3RlUHVia2V5OiBzdHJpbmc7XG4gIC8qKiBSZWxheSBVUkxzIGZvciBjb21tdW5pY2F0aW9uICovXG4gIHJlbGF5czogc3RyaW5nW107XG4gIC8qKiBPcHRpb25hbCBzZWNyZXQgZm9yIGluaXRpYWwgY29ubmVjdGlvbiAqL1xuICBzZWNyZXQ/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogTklQLTQ2IEpTT04tUlBDIHJlcXVlc3QgKGNsaWVudCAtPiBzaWduZXIpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTmlwNDZSZXF1ZXN0IHtcbiAgaWQ6IHN0cmluZztcbiAgbWV0aG9kOiBOaXA0Nk1ldGhvZCB8IHN0cmluZztcbiAgcGFyYW1zOiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBOSVAtNDYgSlNPTi1SUEMgcmVzcG9uc2UgKHNpZ25lciAtPiBjbGllbnQpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTmlwNDZSZXNwb25zZSB7XG4gIGlkOiBzdHJpbmc7XG4gIHJlc3VsdD86IHN0cmluZztcbiAgZXJyb3I/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSBOSVAtNDYgc2Vzc2lvbiBjb250YWluaW5nIHRoZSBlcGhlbWVyYWwga2V5cGFpciBhbmQgY29udmVyc2F0aW9uIGtleVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5pcDQ2U2Vzc2lvbiB7XG4gIC8qKiBDbGllbnQncyBlcGhlbWVyYWwgcHJpdmF0ZSBrZXkgKGhleCkgKi9cbiAgY2xpZW50U2VjcmV0S2V5OiBzdHJpbmc7XG4gIC8qKiBDbGllbnQncyBlcGhlbWVyYWwgcHVibGljIGtleSAoaGV4KSAqL1xuICBjbGllbnRQdWJrZXk6IHN0cmluZztcbiAgLyoqIFJlbW90ZSBzaWduZXIncyBwdWJsaWMga2V5IChoZXgpICovXG4gIHJlbW90ZVB1YmtleTogc3RyaW5nO1xuICAvKiogTklQLTQ0IGNvbnZlcnNhdGlvbiBrZXkgKGRlcml2ZWQgZnJvbSBFQ0RIKSAqL1xuICBjb252ZXJzYXRpb25LZXk6IFVpbnQ4QXJyYXk7XG59XG5cbi8qKlxuICogUHVibGljIHNlc3Npb24gaW5mbyAoc2FmZSB0byBleHBvc2U7IGV4Y2x1ZGVzIHByaXZhdGUga2V5IGFuZCBjb252ZXJzYXRpb24ga2V5KVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5pcDQ2U2Vzc2lvbkluZm8ge1xuICBjbGllbnRQdWJrZXk6IHN0cmluZztcbiAgcmVtb3RlUHVia2V5OiBzdHJpbmc7XG59XG5cbi8qKlxuICogUmVzdWx0IG9mIHZhbGlkYXRpbmcgYSBidW5rZXI6Ly8gVVJJXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQnVua2VyVmFsaWRhdGlvblJlc3VsdCB7XG4gIGlzVmFsaWQ6IGJvb2xlYW47XG4gIGVycm9yPzogc3RyaW5nO1xuICB1cmk/OiBCdW5rZXJVUkk7XG59XG4iLCAiLyoqXG4gKiBAbW9kdWxlIGNyeXB0b1xuICogQGRlc2NyaXB0aW9uIENyeXB0b2dyYXBoaWMgdXRpbGl0aWVzIGZvciBOb3N0clxuICogXG4gKiBJTVBPUlRBTlQ6IE5vc3RyIFByb3RvY29sIENyeXB0b2dyYXBoaWMgUmVxdWlyZW1lbnRzXG4gKiBXaGlsZSBzZWNwMjU2azEgaXMgdGhlIHVuZGVybHlpbmcgZWxsaXB0aWMgY3VydmUgdXNlZCBieSBOb3N0ciwgdGhlIHByb3RvY29sIHNwZWNpZmljYWxseVxuICogcmVxdWlyZXMgc2Nobm9yciBzaWduYXR1cmVzIGFzIGRlZmluZWQgaW4gTklQLTAxLiBUaGlzIG1lYW5zOlxuICogXG4gKiAxLiBBbHdheXMgdXNlIHNjaG5vcnItc3BlY2lmaWMgZnVuY3Rpb25zOlxuICogICAgLSBzY2hub3JyLmdldFB1YmxpY0tleSgpIGZvciBwdWJsaWMga2V5IGdlbmVyYXRpb25cbiAqICAgIC0gc2Nobm9yci5zaWduKCkgZm9yIHNpZ25pbmdcbiAqICAgIC0gc2Nobm9yci52ZXJpZnkoKSBmb3IgdmVyaWZpY2F0aW9uXG4gKiBcbiAqIDIuIEF2b2lkIHVzaW5nIHNlY3AyNTZrMSBmdW5jdGlvbnMgZGlyZWN0bHk6XG4gKiAgICAtIERPTidUIHVzZSBzZWNwMjU2azEuZ2V0UHVibGljS2V5KClcbiAqICAgIC0gRE9OJ1QgdXNlIHNlY3AyNTZrMS5zaWduKClcbiAqICAgIC0gRE9OJ1QgdXNlIHNlY3AyNTZrMS52ZXJpZnkoKVxuICogXG4gKiBXaGlsZSBib3RoIG1pZ2h0IHdvcmsgaW4gc29tZSBjYXNlcyAoYXMgdGhleSB1c2UgdGhlIHNhbWUgY3VydmUpLCB0aGUgc2Nobm9yciBzaWduYXR1cmVcbiAqIHNjaGVtZSBoYXMgc3BlY2lmaWMgcmVxdWlyZW1lbnRzIGZvciBrZXkgYW5kIHNpZ25hdHVyZSBmb3JtYXRzIHRoYXQgYXJlbid0IGd1YXJhbnRlZWRcbiAqIHdoZW4gdXNpbmcgdGhlIGxvd2VyLWxldmVsIHNlY3AyNTZrMSBmdW5jdGlvbnMgZGlyZWN0bHkuXG4gKi9cblxuaW1wb3J0IHsgc2Nobm9yciwgc2VjcDI1NmsxIH0gZnJvbSAnQG5vYmxlL2N1cnZlcy9zZWNwMjU2azEuanMnO1xuaW1wb3J0IHsgYnl0ZXNUb0hleCwgaGV4VG9CeXRlcywgcmFuZG9tQnl0ZXMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IHNoYTI1NiB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvc2hhMi5qcyc7XG5pbXBvcnQgeyBLZXlQYWlyLCBQdWJsaWNLZXlEZXRhaWxzLCBOb3N0ckV2ZW50LCBTaWduZWROb3N0ckV2ZW50LCBQdWJsaWNLZXkgfSBmcm9tICcuL3R5cGVzL2luZGV4JztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4vdXRpbHMvbG9nZ2VyJztcbmltcG9ydCB7IGJ5dGVzVG9CYXNlNjQsIGJhc2U2NFRvQnl0ZXMgfSBmcm9tICcuL2VuY29kaW5nL2Jhc2U2NCc7XG5cblxuLyoqXG4gKiBDdXN0b20gY3J5cHRvIGludGVyZmFjZSBmb3IgY3Jvc3MtcGxhdGZvcm0gY29tcGF0aWJpbGl0eVxuICovXG5leHBvcnQgaW50ZXJmYWNlIENyeXB0b1N1YnRsZSB7XG4gIHN1YnRsZToge1xuICAgIGdlbmVyYXRlS2V5KFxuICAgICAgYWxnb3JpdGhtOiBSc2FIYXNoZWRLZXlHZW5QYXJhbXMgfCBFY0tleUdlblBhcmFtcyxcbiAgICAgIGV4dHJhY3RhYmxlOiBib29sZWFuLFxuICAgICAga2V5VXNhZ2VzOiByZWFkb25seSBLZXlVc2FnZVtdXG4gICAgKTogUHJvbWlzZTxDcnlwdG9LZXlQYWlyPjtcbiAgICBpbXBvcnRLZXkoXG4gICAgICBmb3JtYXQ6ICdyYXcnIHwgJ3BrY3M4JyB8ICdzcGtpJyxcbiAgICAgIGtleURhdGE6IEFycmF5QnVmZmVyLFxuICAgICAgYWxnb3JpdGhtOiBSc2FIYXNoZWRJbXBvcnRQYXJhbXMgfCBFY0tleUltcG9ydFBhcmFtcyB8IEFlc0tleUFsZ29yaXRobSxcbiAgICAgIGV4dHJhY3RhYmxlOiBib29sZWFuLFxuICAgICAga2V5VXNhZ2VzOiByZWFkb25seSBLZXlVc2FnZVtdXG4gICAgKTogUHJvbWlzZTxDcnlwdG9LZXk+O1xuICAgIGVuY3J5cHQoXG4gICAgICBhbGdvcml0aG06IHsgbmFtZTogc3RyaW5nOyBpdjogVWludDhBcnJheSB9LFxuICAgICAga2V5OiBDcnlwdG9LZXksXG4gICAgICBkYXRhOiBBcnJheUJ1ZmZlclxuICAgICk6IFByb21pc2U8QXJyYXlCdWZmZXI+O1xuICAgIGRlY3J5cHQoXG4gICAgICBhbGdvcml0aG06IHsgbmFtZTogc3RyaW5nOyBpdjogVWludDhBcnJheSB9LFxuICAgICAga2V5OiBDcnlwdG9LZXksXG4gICAgICBkYXRhOiBBcnJheUJ1ZmZlclxuICAgICk6IFByb21pc2U8QXJyYXlCdWZmZXI+O1xuICB9O1xuICBnZXRSYW5kb21WYWx1ZXM8VCBleHRlbmRzIFVpbnQ4QXJyYXkgfCBJbnQ4QXJyYXkgfCBVaW50MTZBcnJheSB8IEludDE2QXJyYXkgfCBVaW50MzJBcnJheSB8IEludDMyQXJyYXk+KGFycmF5OiBUKTogVDtcbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgV2luZG93IHtcbiAgICBjcnlwdG86IENyeXB0b1N1YnRsZTtcbiAgfVxuICBpbnRlcmZhY2UgR2xvYmFsIHtcbiAgICBjcnlwdG86IENyeXB0b1N1YnRsZTtcbiAgfVxufVxuXG4vLyBHZXQgdGhlIGFwcHJvcHJpYXRlIGNyeXB0byBpbXBsZW1lbnRhdGlvblxuY29uc3QgZ2V0Q3J5cHRvID0gYXN5bmMgKCk6IFByb21pc2U8Q3J5cHRvU3VidGxlPiA9PiB7XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuY3J5cHRvKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5jcnlwdG87XG4gIH1cbiAgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnICYmIChnbG9iYWwgYXMgR2xvYmFsKS5jcnlwdG8pIHtcbiAgICByZXR1cm4gKGdsb2JhbCBhcyBHbG9iYWwpLmNyeXB0bztcbiAgfVxuICB0cnkge1xuICAgIGNvbnN0IGNyeXB0b01vZHVsZSA9IGF3YWl0IGltcG9ydCgnY3J5cHRvJyk7XG4gICAgaWYgKGNyeXB0b01vZHVsZS53ZWJjcnlwdG8pIHtcbiAgICAgIHJldHVybiBjcnlwdG9Nb2R1bGUud2ViY3J5cHRvIGFzIENyeXB0b1N1YnRsZTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIGxvZ2dlci5kZWJ1ZygnTm9kZSBjcnlwdG8gbm90IGF2YWlsYWJsZScpO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdObyBXZWJDcnlwdG8gaW1wbGVtZW50YXRpb24gYXZhaWxhYmxlJyk7XG59O1xuXG4vKipcbiAqIENyeXB0byBpbXBsZW1lbnRhdGlvbiB0aGF0IHdvcmtzIGluIGJvdGggTm9kZS5qcyBhbmQgYnJvd3NlciBlbnZpcm9ubWVudHNcbiAqL1xuY2xhc3MgQ3VzdG9tQ3J5cHRvIHtcbiAgcHJpdmF0ZSBjcnlwdG9JbnN0YW5jZTogQ3J5cHRvU3VidGxlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgaW5pdFByb21pc2U6IFByb21pc2U8dm9pZD47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5pbml0UHJvbWlzZSA9IHRoaXMuaW5pdGlhbGl6ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbml0aWFsaXplKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuY3J5cHRvSW5zdGFuY2UgPSBhd2FpdCBnZXRDcnlwdG8oKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZW5zdXJlSW5pdGlhbGl6ZWQoKTogUHJvbWlzZTxDcnlwdG9TdWJ0bGU+IHtcbiAgICBhd2FpdCB0aGlzLmluaXRQcm9taXNlO1xuICAgIGlmICghdGhpcy5jcnlwdG9JbnN0YW5jZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDcnlwdG8gaW1wbGVtZW50YXRpb24gbm90IGluaXRpYWxpemVkJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNyeXB0b0luc3RhbmNlO1xuICB9XG5cbiAgYXN5bmMgZ2V0U3VidGxlKCk6IFByb21pc2U8Q3J5cHRvU3VidGxlWydzdWJ0bGUnXT4ge1xuICAgIGNvbnN0IGNyeXB0byA9IGF3YWl0IHRoaXMuZW5zdXJlSW5pdGlhbGl6ZWQoKTtcbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZTtcbiAgfVxuXG4gIGFzeW5jIGdldFJhbmRvbVZhbHVlczxUIGV4dGVuZHMgVWludDhBcnJheSB8IEludDhBcnJheSB8IFVpbnQxNkFycmF5IHwgSW50MTZBcnJheSB8IFVpbnQzMkFycmF5IHwgSW50MzJBcnJheT4oYXJyYXk6IFQpOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBjcnlwdG8gPSBhd2FpdCB0aGlzLmVuc3VyZUluaXRpYWxpemVkKCk7XG4gICAgcmV0dXJuIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoYXJyYXkpO1xuICB9XG59XG5cbi8vIENyZWF0ZSBhbmQgZXhwb3J0IGRlZmF1bHQgaW5zdGFuY2VcbmV4cG9ydCBjb25zdCBjdXN0b21DcnlwdG8gPSBuZXcgQ3VzdG9tQ3J5cHRvKCk7XG5cbi8vIEV4cG9ydCBzY2hub3JyIGZ1bmN0aW9uc1xuZXhwb3J0IGNvbnN0IHNpZ25TY2hub3JyID0gc2Nobm9yci5zaWduO1xuZXhwb3J0IGNvbnN0IHZlcmlmeVNjaG5vcnJTaWduYXR1cmUgPSBzY2hub3JyLnZlcmlmeTtcblxuLyoqXG4gKiBHZXRzIHRoZSBjb21wcmVzc2VkIHB1YmxpYyBrZXkgKDMzIGJ5dGVzIHdpdGggcHJlZml4KVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tcHJlc3NlZFB1YmxpY0tleShwcml2YXRlS2V5Qnl0ZXM6IFVpbnQ4QXJyYXkpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIHNlY3AyNTZrMS5nZXRQdWJsaWNLZXkocHJpdmF0ZUtleUJ5dGVzLCB0cnVlKTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBzY2hub3JyIHB1YmxpYyBrZXkgKDMyIGJ5dGVzIHgtY29vcmRpbmF0ZSkgYXMgcGVyIEJJUDM0MFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2Nobm9yclB1YmxpY0tleShwcml2YXRlS2V5Qnl0ZXM6IFVpbnQ4QXJyYXkpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIHNjaG5vcnIuZ2V0UHVibGljS2V5KHByaXZhdGVLZXlCeXRlcyk7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgbmV3IGtleSBwYWlyXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUtleVBhaXIoKTogUHJvbWlzZTxLZXlQYWlyPiB7XG4gIGNvbnN0IHByaXZhdGVLZXlCeXRlcyA9IHJhbmRvbUJ5dGVzKDMyKTtcbiAgY29uc3QgcHJpdmF0ZUtleSA9IGJ5dGVzVG9IZXgocHJpdmF0ZUtleUJ5dGVzKTtcbiAgcHJpdmF0ZUtleUJ5dGVzLmZpbGwoMCk7IC8vIHplcm8gc291cmNlIG1hdGVyaWFsXG4gIGNvbnN0IHB1YmxpY0tleSA9IGF3YWl0IGdldFB1YmxpY0tleShwcml2YXRlS2V5KTtcblxuICByZXR1cm4ge1xuICAgIHByaXZhdGVLZXksXG4gICAgcHVibGljS2V5XG4gIH07XG59XG5cbi8qKlxuICogR2V0cyBhIHB1YmxpYyBrZXkgZnJvbSBhIHByaXZhdGUga2V5XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQdWJsaWNLZXkocHJpdmF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTxQdWJsaWNLZXlEZXRhaWxzPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcHJpdmF0ZUtleUJ5dGVzID0gaGV4VG9CeXRlcyhwcml2YXRlS2V5KTtcbiAgICBjb25zdCBwdWJsaWNLZXlCeXRlcyA9IHNjaG5vcnIuZ2V0UHVibGljS2V5KHByaXZhdGVLZXlCeXRlcyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhleDogYnl0ZXNUb0hleChwdWJsaWNLZXlCeXRlcyksXG4gICAgICBieXRlczogcHVibGljS2V5Qnl0ZXNcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gZ2V0IHB1YmxpYyBrZXknKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIGtleSBwYWlyXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2YWxpZGF0ZUtleVBhaXIoa2V5UGFpcjogS2V5UGFpcik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICB0cnkge1xuICAgIGNvbnN0IGRlcml2ZWRQdWJLZXkgPSBhd2FpdCBnZXRQdWJsaWNLZXkoa2V5UGFpci5wcml2YXRlS2V5KTtcbiAgICByZXR1cm4gZGVyaXZlZFB1YktleS5oZXggPT09IGtleVBhaXIucHVibGljS2V5LmhleDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZhbGlkYXRlIGtleSBwYWlyJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXZlbnQoZXZlbnQ6IFBhcnRpYWw8Tm9zdHJFdmVudD4pOiBOb3N0ckV2ZW50IHtcbiAgY29uc3QgdGltZXN0YW1wID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5ldmVudCxcbiAgICBjcmVhdGVkX2F0OiBldmVudC5jcmVhdGVkX2F0IHx8IHRpbWVzdGFtcCxcbiAgICB0YWdzOiBldmVudC50YWdzIHx8IFtdLFxuICAgIGNvbnRlbnQ6IGV2ZW50LmNvbnRlbnQgfHwgJycsXG4gICAga2luZDogZXZlbnQua2luZCB8fCAxXG4gIH0gYXMgTm9zdHJFdmVudDtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgYSBwcml2YXRlIGtleSB0byBoZXggc3RyaW5nIChhY2NlcHRzIGJvdGggaGV4IHN0cmluZyBhbmQgVWludDhBcnJheSlcbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplUHJpdmF0ZUtleShwcml2YXRlS2V5OiBzdHJpbmcgfCBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgaWYgKHByaXZhdGVLZXkgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgcmV0dXJuIGJ5dGVzVG9IZXgocHJpdmF0ZUtleSk7XG4gIH1cbiAgcmV0dXJuIHByaXZhdGVLZXk7XG59XG5cbi8qKlxuICogU2lnbnMgYW4gZXZlbnRcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIHNpZ25cbiAqIEBwYXJhbSBwcml2YXRlS2V5IC0gUHJpdmF0ZSBrZXkgYXMgaGV4IHN0cmluZyBvciBVaW50OEFycmF5XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzaWduRXZlbnQoZXZlbnQ6IE5vc3RyRXZlbnQsIHByaXZhdGVLZXk6IHN0cmluZyB8IFVpbnQ4QXJyYXkpOiBQcm9taXNlPFNpZ25lZE5vc3RyRXZlbnQ+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwcml2YXRlS2V5SGV4ID0gbm9ybWFsaXplUHJpdmF0ZUtleShwcml2YXRlS2V5KTtcblxuICAgIC8vIFNlcmlhbGl6ZSBldmVudCBmb3Igc2lnbmluZyAoTklQLTAxIGZvcm1hdClcbiAgICBjb25zdCBzZXJpYWxpemVkID0gSlNPTi5zdHJpbmdpZnkoW1xuICAgICAgMCxcbiAgICAgIGV2ZW50LnB1YmtleSxcbiAgICAgIGV2ZW50LmNyZWF0ZWRfYXQsXG4gICAgICBldmVudC5raW5kLFxuICAgICAgZXZlbnQudGFncyxcbiAgICAgIGV2ZW50LmNvbnRlbnRcbiAgICBdKTtcblxuICAgIC8vIENhbGN1bGF0ZSBldmVudCBoYXNoXG4gICAgY29uc3QgZXZlbnRIYXNoID0gc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZXJpYWxpemVkKSk7XG5cbiAgICAvLyBDb252ZXJ0IHByaXZhdGUga2V5IHRvIGJ5dGVzIGFuZCBzaWduXG4gICAgY29uc3QgcHJpdmF0ZUtleUJ5dGVzID0gaGV4VG9CeXRlcyhwcml2YXRlS2V5SGV4KTtcbiAgICBjb25zdCBzaWduYXR1cmVCeXRlcyA9IHNjaG5vcnIuc2lnbihldmVudEhhc2gsIHByaXZhdGVLZXlCeXRlcyk7XG5cbiAgICAvLyBDcmVhdGUgc2lnbmVkIGV2ZW50XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmV2ZW50LFxuICAgICAgaWQ6IGJ5dGVzVG9IZXgoZXZlbnRIYXNoKSxcbiAgICAgIHNpZzogYnl0ZXNUb0hleChzaWduYXR1cmVCeXRlcylcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gc2lnbiBldmVudCcpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogR2V0cyBhIHB1YmxpYyBrZXkgaGV4IHN0cmluZyBmcm9tIGEgcHJpdmF0ZSBrZXkgKHN5bmNocm9ub3VzKVxuICogQHBhcmFtIHByaXZhdGVLZXkgLSBQcml2YXRlIGtleSBhcyBoZXggc3RyaW5nIG9yIFVpbnQ4QXJyYXlcbiAqIEByZXR1cm5zIEhleC1lbmNvZGVkIHB1YmxpYyBrZXkgKDMyLWJ5dGUgeC1vbmx5IHNjaG5vcnIga2V5KVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHVibGljS2V5U3luYyhwcml2YXRlS2V5OiBzdHJpbmcgfCBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgY29uc3QgcHJpdmF0ZUtleUJ5dGVzID0gcHJpdmF0ZUtleSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXlcbiAgICA/IHByaXZhdGVLZXlcbiAgICA6IGhleFRvQnl0ZXMocHJpdmF0ZUtleSk7XG4gIGNvbnN0IHB1YmxpY0tleUJ5dGVzID0gc2Nobm9yci5nZXRQdWJsaWNLZXkocHJpdmF0ZUtleUJ5dGVzKTtcbiAgcmV0dXJuIGJ5dGVzVG9IZXgocHVibGljS2V5Qnl0ZXMpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMsIGhhc2hlcywgYW5kIHNpZ25zIGEgTm9zdHIgZXZlbnQgaW4gb25lIHN0ZXBcbiAqIEBwYXJhbSBldmVudCAtIFBhcnRpYWwgZXZlbnQgKGtpbmQsIGNvbnRlbnQsIHRhZ3MgcmVxdWlyZWQ7IHB1YmtleSBkZXJpdmVkIGlmIG1pc3NpbmcpXG4gKiBAcGFyYW0gcHJpdmF0ZUtleSAtIFByaXZhdGUga2V5IGFzIGhleCBzdHJpbmcgb3IgVWludDhBcnJheVxuICogQHJldHVybnMgRnVsbHkgc2lnbmVkIGV2ZW50IHdpdGggaWQsIHB1YmtleSwgYW5kIHNpZ1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmluYWxpemVFdmVudChcbiAgZXZlbnQ6IFBhcnRpYWw8Tm9zdHJFdmVudD4sXG4gIHByaXZhdGVLZXk6IHN0cmluZyB8IFVpbnQ4QXJyYXlcbik6IFByb21pc2U8U2lnbmVkTm9zdHJFdmVudD4ge1xuICBjb25zdCBwdWJrZXkgPSBldmVudC5wdWJrZXkgfHwgZ2V0UHVibGljS2V5U3luYyhwcml2YXRlS2V5KTtcbiAgY29uc3QgdGltZXN0YW1wID0gZXZlbnQuY3JlYXRlZF9hdCB8fCBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcblxuICBjb25zdCBmdWxsRXZlbnQ6IE5vc3RyRXZlbnQgPSB7XG4gICAga2luZDogZXZlbnQua2luZCB8fCAxLFxuICAgIGNyZWF0ZWRfYXQ6IHRpbWVzdGFtcCxcbiAgICB0YWdzOiBldmVudC50YWdzIHx8IFtdLFxuICAgIGNvbnRlbnQ6IGV2ZW50LmNvbnRlbnQgfHwgJycsXG4gICAgcHVia2V5LFxuICB9O1xuXG4gIHJldHVybiBzaWduRXZlbnQoZnVsbEV2ZW50LCBwcml2YXRlS2V5KTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyBhbiBldmVudCBzaWduYXR1cmVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeVNpZ25hdHVyZShldmVudDogU2lnbmVkTm9zdHJFdmVudCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICB0cnkge1xuICAgIC8vIFNlcmlhbGl6ZSBldmVudCBmb3IgdmVyaWZpY2F0aW9uIChOSVAtMDEgZm9ybWF0KVxuICAgIGNvbnN0IHNlcmlhbGl6ZWQgPSBKU09OLnN0cmluZ2lmeShbXG4gICAgICAwLFxuICAgICAgZXZlbnQucHVia2V5LFxuICAgICAgZXZlbnQuY3JlYXRlZF9hdCxcbiAgICAgIGV2ZW50LmtpbmQsXG4gICAgICBldmVudC50YWdzLFxuICAgICAgZXZlbnQuY29udGVudFxuICAgIF0pO1xuXG4gICAgLy8gQ2FsY3VsYXRlIGV2ZW50IGhhc2hcbiAgICBjb25zdCBldmVudEhhc2ggPSBzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlcmlhbGl6ZWQpKTtcblxuICAgIC8vIFZlcmlmeSBldmVudCBJRFxuICAgIGNvbnN0IGNhbGN1bGF0ZWRJZCA9IGJ5dGVzVG9IZXgoZXZlbnRIYXNoKTtcbiAgICBpZiAoY2FsY3VsYXRlZElkICE9PSBldmVudC5pZCkge1xuICAgICAgbG9nZ2VyLmVycm9yKCdFdmVudCBJRCBtaXNtYXRjaCcpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIENvbnZlcnQgaGV4IHN0cmluZ3MgdG8gYnl0ZXNcbiAgICBjb25zdCBzaWduYXR1cmVCeXRlcyA9IGhleFRvQnl0ZXMoZXZlbnQuc2lnKTtcbiAgICBjb25zdCBwdWJrZXlCeXRlcyA9IGhleFRvQnl0ZXMoZXZlbnQucHVia2V5KTtcblxuICAgIC8vIFZlcmlmeSBzaWduYXR1cmVcbiAgICByZXR1cm4gc2Nobm9yci52ZXJpZnkoc2lnbmF0dXJlQnl0ZXMsIGV2ZW50SGFzaCwgcHVia2V5Qnl0ZXMpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gdmVyaWZ5IHNpZ25hdHVyZScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIEVuY3J5cHRzIGEgbWVzc2FnZSB1c2luZyBOSVAtMDRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHQoXG4gIG1lc3NhZ2U6IHN0cmluZyxcbiAgcmVjaXBpZW50UHViS2V5OiBQdWJsaWNLZXkgfCBzdHJpbmcsXG4gIHNlbmRlclByaXZLZXk6IHN0cmluZ1xuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCByZWNpcGllbnRQdWJLZXlIZXggPSB0eXBlb2YgcmVjaXBpZW50UHViS2V5ID09PSAnc3RyaW5nJyA/IHJlY2lwaWVudFB1YktleSA6IHJlY2lwaWVudFB1YktleS5oZXg7XG4gICAgY29uc3Qgc2hhcmVkUG9pbnQgPSBzZWNwMjU2azEuZ2V0U2hhcmVkU2VjcmV0KGhleFRvQnl0ZXMoc2VuZGVyUHJpdktleSksIGhleFRvQnl0ZXMocmVjaXBpZW50UHViS2V5SGV4KSk7XG4gICAgY29uc3Qgc2hhcmVkWCA9IHNoYXJlZFBvaW50LnNsaWNlKDEsIDMzKTtcblxuICAgIC8vIEdlbmVyYXRlIHJhbmRvbSBJVlxuICAgIGNvbnN0IGl2ID0gcmFuZG9tQnl0ZXMoMTYpO1xuICAgIGNvbnN0IGtleSA9IGF3YWl0IGN1c3RvbUNyeXB0by5nZXRTdWJ0bGUoKS50aGVuKChzdWJ0bGUpID0+IHN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAncmF3JyxcbiAgICAgIHNoYXJlZFguYnVmZmVyLFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGxlbmd0aDogMjU2IH0sXG4gICAgICBmYWxzZSxcbiAgICAgIFsnZW5jcnlwdCddXG4gICAgKSk7XG5cbiAgICAvLyBaZXJvIHNoYXJlZCBzZWNyZXQgbWF0ZXJpYWwgbm93IHRoYXQgQUVTIGtleSBpcyBpbXBvcnRlZFxuICAgIHNoYXJlZFguZmlsbCgwKTtcbiAgICBzaGFyZWRQb2ludC5maWxsKDApO1xuXG4gICAgLy8gRW5jcnlwdCB0aGUgbWVzc2FnZVxuICAgIGNvbnN0IGRhdGEgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUobWVzc2FnZSk7XG4gICAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgY3VzdG9tQ3J5cHRvLmdldFN1YnRsZSgpLnRoZW4oKHN1YnRsZSkgPT4gc3VidGxlLmVuY3J5cHQoXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgaXYgfSxcbiAgICAgIGtleSxcbiAgICAgIGRhdGEuYnVmZmVyXG4gICAgKSk7XG5cbiAgICAvLyBOSVAtMDQgc3RhbmRhcmQgZm9ybWF0OiBiYXNlNjQoY2lwaGVydGV4dCkgKyBcIj9pdj1cIiArIGJhc2U2NChpdilcbiAgICBjb25zdCBjaXBoZXJ0ZXh0QmFzZTY0ID0gYnl0ZXNUb0Jhc2U2NChuZXcgVWludDhBcnJheShlbmNyeXB0ZWQpKTtcbiAgICBjb25zdCBpdkJhc2U2NCA9IGJ5dGVzVG9CYXNlNjQoaXYpO1xuXG4gICAgcmV0dXJuIGNpcGhlcnRleHRCYXNlNjQgKyAnP2l2PScgKyBpdkJhc2U2NDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGVuY3J5cHQgbWVzc2FnZScpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogRGVjcnlwdHMgYSBtZXNzYWdlIHVzaW5nIE5JUC0wNFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdChcbiAgZW5jcnlwdGVkTWVzc2FnZTogc3RyaW5nLFxuICBzZW5kZXJQdWJLZXk6IFB1YmxpY0tleSB8IHN0cmluZyxcbiAgcmVjaXBpZW50UHJpdktleTogc3RyaW5nXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICB0cnkge1xuICAgIGNvbnN0IHNlbmRlclB1YktleUhleCA9IHR5cGVvZiBzZW5kZXJQdWJLZXkgPT09ICdzdHJpbmcnID8gc2VuZGVyUHViS2V5IDogc2VuZGVyUHViS2V5LmhleDtcbiAgICBjb25zdCBzaGFyZWRQb2ludCA9IHNlY3AyNTZrMS5nZXRTaGFyZWRTZWNyZXQoaGV4VG9CeXRlcyhyZWNpcGllbnRQcml2S2V5KSwgaGV4VG9CeXRlcyhzZW5kZXJQdWJLZXlIZXgpKTtcbiAgICBjb25zdCBzaGFyZWRYID0gc2hhcmVkUG9pbnQuc2xpY2UoMSwgMzMpO1xuXG4gICAgLy8gUGFyc2UgTklQLTA0IHN0YW5kYXJkIGZvcm1hdDogYmFzZTY0KGNpcGhlcnRleHQpICsgXCI/aXY9XCIgKyBiYXNlNjQoaXYpXG4gICAgLy8gQWxzbyBzdXBwb3J0IGxlZ2FjeSBoZXggZm9ybWF0IChpdiArIGNpcGhlcnRleHQgY29uY2F0ZW5hdGVkKSBhcyBmYWxsYmFja1xuICAgIGxldCBpdjogVWludDhBcnJheTtcbiAgICBsZXQgY2lwaGVydGV4dDogVWludDhBcnJheTtcblxuICAgIGlmIChlbmNyeXB0ZWRNZXNzYWdlLmluY2x1ZGVzKCc/aXY9JykpIHtcbiAgICAgIC8vIE5JUC0wNCBzdGFuZGFyZCBmb3JtYXRcbiAgICAgIGNvbnN0IFtjaXBoZXJ0ZXh0QmFzZTY0LCBpdkJhc2U2NF0gPSBlbmNyeXB0ZWRNZXNzYWdlLnNwbGl0KCc/aXY9Jyk7XG4gICAgICBjaXBoZXJ0ZXh0ID0gYmFzZTY0VG9CeXRlcyhjaXBoZXJ0ZXh0QmFzZTY0KTtcbiAgICAgIGl2ID0gYmFzZTY0VG9CeXRlcyhpdkJhc2U2NCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExlZ2FjeSBoZXggZm9ybWF0IGZhbGxiYWNrOiBmaXJzdCAxNiBieXRlcyBhcmUgSVYsIHJlc3QgaXMgY2lwaGVydGV4dFxuICAgICAgY29uc3QgZW5jcnlwdGVkID0gaGV4VG9CeXRlcyhlbmNyeXB0ZWRNZXNzYWdlKTtcbiAgICAgIGl2ID0gZW5jcnlwdGVkLnNsaWNlKDAsIDE2KTtcbiAgICAgIGNpcGhlcnRleHQgPSBlbmNyeXB0ZWQuc2xpY2UoMTYpO1xuICAgIH1cblxuICAgIGNvbnN0IGtleSA9IGF3YWl0IGN1c3RvbUNyeXB0by5nZXRTdWJ0bGUoKS50aGVuKChzdWJ0bGUpID0+IHN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAncmF3JyxcbiAgICAgIHNoYXJlZFguYnVmZmVyLFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGxlbmd0aDogMjU2IH0sXG4gICAgICBmYWxzZSxcbiAgICAgIFsnZGVjcnlwdCddXG4gICAgKSk7XG5cbiAgICAvLyBaZXJvIHNoYXJlZCBzZWNyZXQgbWF0ZXJpYWwgbm93IHRoYXQgQUVTIGtleSBpcyBpbXBvcnRlZFxuICAgIHNoYXJlZFguZmlsbCgwKTtcbiAgICBzaGFyZWRQb2ludC5maWxsKDApO1xuXG4gICAgY29uc3QgZGVjcnlwdGVkID0gYXdhaXQgY3VzdG9tQ3J5cHRvLmdldFN1YnRsZSgpLnRoZW4oKHN1YnRsZSkgPT4gc3VidGxlLmRlY3J5cHQoXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgaXYgfSxcbiAgICAgIGtleSxcbiAgICAgIGNpcGhlcnRleHQuYnVmZmVyIGFzIEFycmF5QnVmZmVyXG4gICAgKSk7XG5cbiAgICByZXR1cm4gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGRlY3J5cHRlZCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBkZWNyeXB0IG1lc3NhZ2UnKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuIiwgIi8qKlxuICogU0VDRyBzZWNwMjU2azEuIFNlZSBbcGRmXShodHRwczovL3d3dy5zZWNnLm9yZy9zZWMyLXYyLnBkZikuXG4gKlxuICogQmVsb25ncyB0byBLb2JsaXR6IGN1cnZlczogaXQgaGFzIGVmZmljaWVudGx5LWNvbXB1dGFibGUgR0xWIGVuZG9tb3JwaGlzbSBcdTAzQzgsXG4gKiBjaGVjayBvdXQge0BsaW5rIEVuZG9tb3JwaGlzbU9wdHN9LiBTZWVtcyB0byBiZSByaWdpZCAobm90IGJhY2tkb29yZWQpLlxuICogQG1vZHVsZVxuICovXG4vKiEgbm9ibGUtY3VydmVzIC0gTUlUIExpY2Vuc2UgKGMpIDIwMjIgUGF1bCBNaWxsZXIgKHBhdWxtaWxsci5jb20pICovXG5pbXBvcnQgeyBzaGEyNTYgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3NoYTIuanMnO1xuaW1wb3J0IHsgcmFuZG9tQnl0ZXMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IGNyZWF0ZUtleWdlbiwgdHlwZSBDdXJ2ZUxlbmd0aHMgfSBmcm9tICcuL2Fic3RyYWN0L2N1cnZlLnRzJztcbmltcG9ydCB7IGNyZWF0ZUhhc2hlciwgdHlwZSBIMkNIYXNoZXIsIGlzb2dlbnlNYXAgfSBmcm9tICcuL2Fic3RyYWN0L2hhc2gtdG8tY3VydmUudHMnO1xuaW1wb3J0IHsgRmllbGQsIG1hcEhhc2hUb0ZpZWxkLCBwb3cyIH0gZnJvbSAnLi9hYnN0cmFjdC9tb2R1bGFyLnRzJztcbmltcG9ydCB7XG4gIHR5cGUgRUNEU0EsXG4gIGVjZHNhLFxuICB0eXBlIEVuZG9tb3JwaGlzbU9wdHMsXG4gIG1hcFRvQ3VydmVTaW1wbGVTV1UsXG4gIHR5cGUgV2VpZXJzdHJhc3NQb2ludCBhcyBQb2ludFR5cGUsXG4gIHdlaWVyc3RyYXNzLFxuICB0eXBlIFdlaWVyc3RyYXNzT3B0cyxcbiAgdHlwZSBXZWllcnN0cmFzc1BvaW50Q29ucyxcbn0gZnJvbSAnLi9hYnN0cmFjdC93ZWllcnN0cmFzcy50cyc7XG5pbXBvcnQgeyBhYnl0ZXMsIGFzY2lpVG9CeXRlcywgYnl0ZXNUb051bWJlckJFLCBjb25jYXRCeXRlcyB9IGZyb20gJy4vdXRpbHMudHMnO1xuXG4vLyBTZWVtcyBsaWtlIGdlbmVyYXRvciB3YXMgcHJvZHVjZWQgZnJvbSBzb21lIHNlZWQ6XG4vLyBgUG9pbnRrMS5CQVNFLm11bHRpcGx5KFBvaW50azEuRm4uaW52KDJuLCBOKSkudG9BZmZpbmUoKS54YFxuLy8gLy8gZ2l2ZXMgc2hvcnQgeCAweDNiNzhjZTU2M2Y4OWEwZWQ5NDE0ZjVhYTI4YWQwZDk2ZDY3OTVmOWM2M25cbmNvbnN0IHNlY3AyNTZrMV9DVVJWRTogV2VpZXJzdHJhc3NPcHRzPGJpZ2ludD4gPSB7XG4gIHA6IEJpZ0ludCgnMHhmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZWZmZmZmYzJmJyksXG4gIG46IEJpZ0ludCgnMHhmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZWJhYWVkY2U2YWY0OGEwM2JiZmQyNWU4Y2QwMzY0MTQxJyksXG4gIGg6IEJpZ0ludCgxKSxcbiAgYTogQmlnSW50KDApLFxuICBiOiBCaWdJbnQoNyksXG4gIEd4OiBCaWdJbnQoJzB4NzliZTY2N2VmOWRjYmJhYzU1YTA2Mjk1Y2U4NzBiMDcwMjliZmNkYjJkY2UyOGQ5NTlmMjgxNWIxNmY4MTc5OCcpLFxuICBHeTogQmlnSW50KCcweDQ4M2FkYTc3MjZhM2M0NjU1ZGE0ZmJmYzBlMTEwOGE4ZmQxN2I0NDhhNjg1NTQxOTljNDdkMDhmZmIxMGQ0YjgnKSxcbn07XG5cbmNvbnN0IHNlY3AyNTZrMV9FTkRPOiBFbmRvbW9ycGhpc21PcHRzID0ge1xuICBiZXRhOiBCaWdJbnQoJzB4N2FlOTZhMmI2NTdjMDcxMDZlNjQ0NzllYWMzNDM0ZTk5Y2YwNDk3NTEyZjU4OTk1YzEzOTZjMjg3MTk1MDFlZScpLFxuICBiYXNpc2VzOiBbXG4gICAgW0JpZ0ludCgnMHgzMDg2ZDIyMWE3ZDQ2YmNkZTg2YzkwZTQ5Mjg0ZWIxNScpLCAtQmlnSW50KCcweGU0NDM3ZWQ2MDEwZTg4Mjg2ZjU0N2ZhOTBhYmZlNGMzJyldLFxuICAgIFtCaWdJbnQoJzB4MTE0Y2E1MGY3YThlMmYzZjY1N2MxMTA4ZDlkNDRjZmQ4JyksIEJpZ0ludCgnMHgzMDg2ZDIyMWE3ZDQ2YmNkZTg2YzkwZTQ5Mjg0ZWIxNScpXSxcbiAgXSxcbn07XG5cbmNvbnN0IF8wbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMCk7XG5jb25zdCBfMm4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDIpO1xuXG4vKipcbiAqIFx1MjIxQW4gPSBuXigocCsxKS80KSBmb3IgZmllbGRzIHAgPSAzIG1vZCA0LiBXZSB1bndyYXAgdGhlIGxvb3AgYW5kIG11bHRpcGx5IGJpdC1ieS1iaXQuXG4gKiAoUCsxbi80bikudG9TdHJpbmcoMikgd291bGQgcHJvZHVjZSBiaXRzIFsyMjN4IDEsIDAsIDIyeCAxLCA0eCAwLCAxMSwgMDBdXG4gKi9cbmZ1bmN0aW9uIHNxcnRNb2QoeTogYmlnaW50KTogYmlnaW50IHtcbiAgY29uc3QgUCA9IHNlY3AyNTZrMV9DVVJWRS5wO1xuICAvLyBwcmV0dGllci1pZ25vcmVcbiAgY29uc3QgXzNuID0gQmlnSW50KDMpLCBfNm4gPSBCaWdJbnQoNiksIF8xMW4gPSBCaWdJbnQoMTEpLCBfMjJuID0gQmlnSW50KDIyKTtcbiAgLy8gcHJldHRpZXItaWdub3JlXG4gIGNvbnN0IF8yM24gPSBCaWdJbnQoMjMpLCBfNDRuID0gQmlnSW50KDQ0KSwgXzg4biA9IEJpZ0ludCg4OCk7XG4gIGNvbnN0IGIyID0gKHkgKiB5ICogeSkgJSBQOyAvLyB4XjMsIDExXG4gIGNvbnN0IGIzID0gKGIyICogYjIgKiB5KSAlIFA7IC8vIHheN1xuICBjb25zdCBiNiA9IChwb3cyKGIzLCBfM24sIFApICogYjMpICUgUDtcbiAgY29uc3QgYjkgPSAocG93MihiNiwgXzNuLCBQKSAqIGIzKSAlIFA7XG4gIGNvbnN0IGIxMSA9IChwb3cyKGI5LCBfMm4sIFApICogYjIpICUgUDtcbiAgY29uc3QgYjIyID0gKHBvdzIoYjExLCBfMTFuLCBQKSAqIGIxMSkgJSBQO1xuICBjb25zdCBiNDQgPSAocG93MihiMjIsIF8yMm4sIFApICogYjIyKSAlIFA7XG4gIGNvbnN0IGI4OCA9IChwb3cyKGI0NCwgXzQ0biwgUCkgKiBiNDQpICUgUDtcbiAgY29uc3QgYjE3NiA9IChwb3cyKGI4OCwgXzg4biwgUCkgKiBiODgpICUgUDtcbiAgY29uc3QgYjIyMCA9IChwb3cyKGIxNzYsIF80NG4sIFApICogYjQ0KSAlIFA7XG4gIGNvbnN0IGIyMjMgPSAocG93MihiMjIwLCBfM24sIFApICogYjMpICUgUDtcbiAgY29uc3QgdDEgPSAocG93MihiMjIzLCBfMjNuLCBQKSAqIGIyMikgJSBQO1xuICBjb25zdCB0MiA9IChwb3cyKHQxLCBfNm4sIFApICogYjIpICUgUDtcbiAgY29uc3Qgcm9vdCA9IHBvdzIodDIsIF8ybiwgUCk7XG4gIGlmICghRnBrMS5lcWwoRnBrMS5zcXIocm9vdCksIHkpKSB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIHNxdWFyZSByb290Jyk7XG4gIHJldHVybiByb290O1xufVxuXG5jb25zdCBGcGsxID0gRmllbGQoc2VjcDI1NmsxX0NVUlZFLnAsIHsgc3FydDogc3FydE1vZCB9KTtcbmNvbnN0IFBvaW50azEgPSAvKiBAX19QVVJFX18gKi8gd2VpZXJzdHJhc3Moc2VjcDI1NmsxX0NVUlZFLCB7XG4gIEZwOiBGcGsxLFxuICBlbmRvOiBzZWNwMjU2azFfRU5ETyxcbn0pO1xuXG4vKipcbiAqIHNlY3AyNTZrMSBjdXJ2ZTogRUNEU0EgYW5kIEVDREggbWV0aG9kcy5cbiAqXG4gKiBVc2VzIHNoYTI1NiB0byBoYXNoIG1lc3NhZ2VzLiBUbyB1c2UgYSBkaWZmZXJlbnQgaGFzaCxcbiAqIHBhc3MgYHsgcHJlaGFzaDogZmFsc2UgfWAgdG8gc2lnbiAvIHZlcmlmeS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBganNcbiAqIGltcG9ydCB7IHNlY3AyNTZrMSB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbiAqIGNvbnN0IHsgc2VjcmV0S2V5LCBwdWJsaWNLZXkgfSA9IHNlY3AyNTZrMS5rZXlnZW4oKTtcbiAqIC8vIGNvbnN0IHB1YmxpY0tleSA9IHNlY3AyNTZrMS5nZXRQdWJsaWNLZXkoc2VjcmV0S2V5KTtcbiAqIGNvbnN0IG1zZyA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZSgnaGVsbG8gbm9ibGUnKTtcbiAqIGNvbnN0IHNpZyA9IHNlY3AyNTZrMS5zaWduKG1zZywgc2VjcmV0S2V5KTtcbiAqIGNvbnN0IGlzVmFsaWQgPSBzZWNwMjU2azEudmVyaWZ5KHNpZywgbXNnLCBwdWJsaWNLZXkpO1xuICogLy8gY29uc3Qgc2lnS2VjY2FrID0gc2VjcDI1NmsxLnNpZ24oa2VjY2FrMjU2KG1zZyksIHNlY3JldEtleSwgeyBwcmVoYXNoOiBmYWxzZSB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3Qgc2VjcDI1NmsxOiBFQ0RTQSA9IC8qIEBfX1BVUkVfXyAqLyBlY2RzYShQb2ludGsxLCBzaGEyNTYpO1xuXG4vLyBTY2hub3JyIHNpZ25hdHVyZXMgYXJlIHN1cGVyaW9yIHRvIEVDRFNBIGZyb20gYWJvdmUuIEJlbG93IGlzIFNjaG5vcnItc3BlY2lmaWMgQklQMDM0MCBjb2RlLlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2JpdGNvaW4vYmlwcy9ibG9iL21hc3Rlci9iaXAtMDM0MC5tZWRpYXdpa2lcbi8qKiBBbiBvYmplY3QgbWFwcGluZyB0YWdzIHRvIHRoZWlyIHRhZ2dlZCBoYXNoIHByZWZpeCBvZiBbU0hBMjU2KHRhZykgfCBTSEEyNTYodGFnKV0gKi9cbmNvbnN0IFRBR0dFRF9IQVNIX1BSRUZJWEVTOiB7IFt0YWc6IHN0cmluZ106IFVpbnQ4QXJyYXkgfSA9IHt9O1xuZnVuY3Rpb24gdGFnZ2VkSGFzaCh0YWc6IHN0cmluZywgLi4ubWVzc2FnZXM6IFVpbnQ4QXJyYXlbXSk6IFVpbnQ4QXJyYXkge1xuICBsZXQgdGFnUCA9IFRBR0dFRF9IQVNIX1BSRUZJWEVTW3RhZ107XG4gIGlmICh0YWdQID09PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCB0YWdIID0gc2hhMjU2KGFzY2lpVG9CeXRlcyh0YWcpKTtcbiAgICB0YWdQID0gY29uY2F0Qnl0ZXModGFnSCwgdGFnSCk7XG4gICAgVEFHR0VEX0hBU0hfUFJFRklYRVNbdGFnXSA9IHRhZ1A7XG4gIH1cbiAgcmV0dXJuIHNoYTI1Nihjb25jYXRCeXRlcyh0YWdQLCAuLi5tZXNzYWdlcykpO1xufVxuXG4vLyBFQ0RTQSBjb21wYWN0IHBvaW50cyBhcmUgMzMtYnl0ZS4gU2Nobm9yciBpcyAzMjogd2Ugc3RyaXAgZmlyc3QgYnl0ZSAweDAyIG9yIDB4MDNcbmNvbnN0IHBvaW50VG9CeXRlcyA9IChwb2ludDogUG9pbnRUeXBlPGJpZ2ludD4pID0+IHBvaW50LnRvQnl0ZXModHJ1ZSkuc2xpY2UoMSk7XG5jb25zdCBoYXNFdmVuID0gKHk6IGJpZ2ludCkgPT4geSAlIF8ybiA9PT0gXzBuO1xuXG4vLyBDYWxjdWxhdGUgcG9pbnQsIHNjYWxhciBhbmQgYnl0ZXNcbmZ1bmN0aW9uIHNjaG5vcnJHZXRFeHRQdWJLZXkocHJpdjogVWludDhBcnJheSkge1xuICBjb25zdCB7IEZuLCBCQVNFIH0gPSBQb2ludGsxO1xuICBjb25zdCBkXyA9IEZuLmZyb21CeXRlcyhwcml2KTtcbiAgY29uc3QgcCA9IEJBU0UubXVsdGlwbHkoZF8pOyAvLyBQID0gZCdcdTIyQzVHOyAwIDwgZCcgPCBuIGNoZWNrIGlzIGRvbmUgaW5zaWRlXG4gIGNvbnN0IHNjYWxhciA9IGhhc0V2ZW4ocC55KSA/IGRfIDogRm4ubmVnKGRfKTtcbiAgcmV0dXJuIHsgc2NhbGFyLCBieXRlczogcG9pbnRUb0J5dGVzKHApIH07XG59XG4vKipcbiAqIGxpZnRfeCBmcm9tIEJJUDM0MC4gQ29udmVydCAzMi1ieXRlIHggY29vcmRpbmF0ZSB0byBlbGxpcHRpYyBjdXJ2ZSBwb2ludC5cbiAqIEByZXR1cm5zIHZhbGlkIHBvaW50IGNoZWNrZWQgZm9yIGJlaW5nIG9uLWN1cnZlXG4gKi9cbmZ1bmN0aW9uIGxpZnRfeCh4OiBiaWdpbnQpOiBQb2ludFR5cGU8YmlnaW50PiB7XG4gIGNvbnN0IEZwID0gRnBrMTtcbiAgaWYgKCFGcC5pc1ZhbGlkTm90MCh4KSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHg6IEZhaWwgaWYgeCBcdTIyNjUgcCcpO1xuICBjb25zdCB4eCA9IEZwLmNyZWF0ZSh4ICogeCk7XG4gIGNvbnN0IGMgPSBGcC5jcmVhdGUoeHggKiB4ICsgQmlnSW50KDcpKTsgLy8gTGV0IGMgPSB4XHUwMEIzICsgNyBtb2QgcC5cbiAgbGV0IHkgPSBGcC5zcXJ0KGMpOyAvLyBMZXQgeSA9IGNeKHArMSkvNCBtb2QgcC4gU2FtZSBhcyBzcXJ0KCkuXG4gIC8vIFJldHVybiB0aGUgdW5pcXVlIHBvaW50IFAgc3VjaCB0aGF0IHgoUCkgPSB4IGFuZFxuICAvLyB5KFApID0geSBpZiB5IG1vZCAyID0gMCBvciB5KFApID0gcC15IG90aGVyd2lzZS5cbiAgaWYgKCFoYXNFdmVuKHkpKSB5ID0gRnAubmVnKHkpO1xuICBjb25zdCBwID0gUG9pbnRrMS5mcm9tQWZmaW5lKHsgeCwgeSB9KTtcbiAgcC5hc3NlcnRWYWxpZGl0eSgpO1xuICByZXR1cm4gcDtcbn1cbmNvbnN0IG51bSA9IGJ5dGVzVG9OdW1iZXJCRTtcbi8qKlxuICogQ3JlYXRlIHRhZ2dlZCBoYXNoLCBjb252ZXJ0IGl0IHRvIGJpZ2ludCwgcmVkdWNlIG1vZHVsby1uLlxuICovXG5mdW5jdGlvbiBjaGFsbGVuZ2UoLi4uYXJnczogVWludDhBcnJheVtdKTogYmlnaW50IHtcbiAgcmV0dXJuIFBvaW50azEuRm4uY3JlYXRlKG51bSh0YWdnZWRIYXNoKCdCSVAwMzQwL2NoYWxsZW5nZScsIC4uLmFyZ3MpKSk7XG59XG5cbi8qKlxuICogU2Nobm9yciBwdWJsaWMga2V5IGlzIGp1c3QgYHhgIGNvb3JkaW5hdGUgb2YgUG9pbnQgYXMgcGVyIEJJUDM0MC5cbiAqL1xuZnVuY3Rpb24gc2Nobm9yckdldFB1YmxpY0tleShzZWNyZXRLZXk6IFVpbnQ4QXJyYXkpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIHNjaG5vcnJHZXRFeHRQdWJLZXkoc2VjcmV0S2V5KS5ieXRlczsgLy8gZCc9aW50KHNrKS4gRmFpbCBpZiBkJz0wIG9yIGQnXHUyMjY1bi4gUmV0IGJ5dGVzKGQnXHUyMkM1Rylcbn1cblxuLyoqXG4gKiBDcmVhdGVzIFNjaG5vcnIgc2lnbmF0dXJlIGFzIHBlciBCSVAzNDAuIFZlcmlmaWVzIGl0c2VsZiBiZWZvcmUgcmV0dXJuaW5nIGFueXRoaW5nLlxuICogYXV4UmFuZCBpcyBvcHRpb25hbCBhbmQgaXMgbm90IHRoZSBzb2xlIHNvdXJjZSBvZiBrIGdlbmVyYXRpb246IGJhZCBDU1BSTkcgd29uJ3QgYmUgZGFuZ2Vyb3VzLlxuICovXG5mdW5jdGlvbiBzY2hub3JyU2lnbihcbiAgbWVzc2FnZTogVWludDhBcnJheSxcbiAgc2VjcmV0S2V5OiBVaW50OEFycmF5LFxuICBhdXhSYW5kOiBVaW50OEFycmF5ID0gcmFuZG9tQnl0ZXMoMzIpXG4pOiBVaW50OEFycmF5IHtcbiAgY29uc3QgeyBGbiB9ID0gUG9pbnRrMTtcbiAgY29uc3QgbSA9IGFieXRlcyhtZXNzYWdlLCB1bmRlZmluZWQsICdtZXNzYWdlJyk7XG4gIGNvbnN0IHsgYnl0ZXM6IHB4LCBzY2FsYXI6IGQgfSA9IHNjaG5vcnJHZXRFeHRQdWJLZXkoc2VjcmV0S2V5KTsgLy8gY2hlY2tzIGZvciBpc1dpdGhpbkN1cnZlT3JkZXJcbiAgY29uc3QgYSA9IGFieXRlcyhhdXhSYW5kLCAzMiwgJ2F1eFJhbmQnKTsgLy8gQXV4aWxpYXJ5IHJhbmRvbSBkYXRhIGE6IGEgMzItYnl0ZSBhcnJheVxuICBjb25zdCB0ID0gRm4udG9CeXRlcyhkIF4gbnVtKHRhZ2dlZEhhc2goJ0JJUDAzNDAvYXV4JywgYSkpKTsgLy8gTGV0IHQgYmUgdGhlIGJ5dGUtd2lzZSB4b3Igb2YgYnl0ZXMoZCkgYW5kIGhhc2gvYXV4KGEpXG4gIGNvbnN0IHJhbmQgPSB0YWdnZWRIYXNoKCdCSVAwMzQwL25vbmNlJywgdCwgcHgsIG0pOyAvLyBMZXQgcmFuZCA9IGhhc2gvbm9uY2UodCB8fCBieXRlcyhQKSB8fCBtKVxuICAvLyBMZXQgaycgPSBpbnQocmFuZCkgbW9kIG4uIEZhaWwgaWYgaycgPSAwLiBMZXQgUiA9IGsnXHUyMkM1R1xuICBjb25zdCB7IGJ5dGVzOiByeCwgc2NhbGFyOiBrIH0gPSBzY2hub3JyR2V0RXh0UHViS2V5KHJhbmQpO1xuICBjb25zdCBlID0gY2hhbGxlbmdlKHJ4LCBweCwgbSk7IC8vIExldCBlID0gaW50KGhhc2gvY2hhbGxlbmdlKGJ5dGVzKFIpIHx8IGJ5dGVzKFApIHx8IG0pKSBtb2Qgbi5cbiAgY29uc3Qgc2lnID0gbmV3IFVpbnQ4QXJyYXkoNjQpOyAvLyBMZXQgc2lnID0gYnl0ZXMoUikgfHwgYnl0ZXMoKGsgKyBlZCkgbW9kIG4pLlxuICBzaWcuc2V0KHJ4LCAwKTtcbiAgc2lnLnNldChGbi50b0J5dGVzKEZuLmNyZWF0ZShrICsgZSAqIGQpKSwgMzIpO1xuICAvLyBJZiBWZXJpZnkoYnl0ZXMoUCksIG0sIHNpZykgKHNlZSBiZWxvdykgcmV0dXJucyBmYWlsdXJlLCBhYm9ydFxuICBpZiAoIXNjaG5vcnJWZXJpZnkoc2lnLCBtLCBweCkpIHRocm93IG5ldyBFcnJvcignc2lnbjogSW52YWxpZCBzaWduYXR1cmUgcHJvZHVjZWQnKTtcbiAgcmV0dXJuIHNpZztcbn1cblxuLyoqXG4gKiBWZXJpZmllcyBTY2hub3JyIHNpZ25hdHVyZS5cbiAqIFdpbGwgc3dhbGxvdyBlcnJvcnMgJiByZXR1cm4gZmFsc2UgZXhjZXB0IGZvciBpbml0aWFsIHR5cGUgdmFsaWRhdGlvbiBvZiBhcmd1bWVudHMuXG4gKi9cbmZ1bmN0aW9uIHNjaG5vcnJWZXJpZnkoc2lnbmF0dXJlOiBVaW50OEFycmF5LCBtZXNzYWdlOiBVaW50OEFycmF5LCBwdWJsaWNLZXk6IFVpbnQ4QXJyYXkpOiBib29sZWFuIHtcbiAgY29uc3QgeyBGcCwgRm4sIEJBU0UgfSA9IFBvaW50azE7XG4gIGNvbnN0IHNpZyA9IGFieXRlcyhzaWduYXR1cmUsIDY0LCAnc2lnbmF0dXJlJyk7XG4gIGNvbnN0IG0gPSBhYnl0ZXMobWVzc2FnZSwgdW5kZWZpbmVkLCAnbWVzc2FnZScpO1xuICBjb25zdCBwdWIgPSBhYnl0ZXMocHVibGljS2V5LCAzMiwgJ3B1YmxpY0tleScpO1xuICB0cnkge1xuICAgIGNvbnN0IFAgPSBsaWZ0X3gobnVtKHB1YikpOyAvLyBQID0gbGlmdF94KGludChwaykpOyBmYWlsIGlmIHRoYXQgZmFpbHNcbiAgICBjb25zdCByID0gbnVtKHNpZy5zdWJhcnJheSgwLCAzMikpOyAvLyBMZXQgciA9IGludChzaWdbMDozMl0pOyBmYWlsIGlmIHIgXHUyMjY1IHAuXG4gICAgaWYgKCFGcC5pc1ZhbGlkTm90MChyKSkgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IHMgPSBudW0oc2lnLnN1YmFycmF5KDMyLCA2NCkpOyAvLyBMZXQgcyA9IGludChzaWdbMzI6NjRdKTsgZmFpbCBpZiBzIFx1MjI2NSBuLlxuICAgIGlmICghRm4uaXNWYWxpZE5vdDAocykpIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IGUgPSBjaGFsbGVuZ2UoRm4udG9CeXRlcyhyKSwgcG9pbnRUb0J5dGVzKFApLCBtKTsgLy8gaW50KGNoYWxsZW5nZShieXRlcyhyKXx8Ynl0ZXMoUCl8fG0pKSVuXG4gICAgLy8gUiA9IHNcdTIyQzVHIC0gZVx1MjJDNVAsIHdoZXJlIC1lUCA9PSAobi1lKVBcbiAgICBjb25zdCBSID0gQkFTRS5tdWx0aXBseVVuc2FmZShzKS5hZGQoUC5tdWx0aXBseVVuc2FmZShGbi5uZWcoZSkpKTtcbiAgICBjb25zdCB7IHgsIHkgfSA9IFIudG9BZmZpbmUoKTtcbiAgICAvLyBGYWlsIGlmIGlzX2luZmluaXRlKFIpIC8gbm90IGhhc19ldmVuX3koUikgLyB4KFIpIFx1MjI2MCByLlxuICAgIGlmIChSLmlzMCgpIHx8ICFoYXNFdmVuKHkpIHx8IHggIT09IHIpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgU2VjcFNjaG5vcnIgPSB7XG4gIGtleWdlbjogKHNlZWQ/OiBVaW50OEFycmF5KSA9PiB7IHNlY3JldEtleTogVWludDhBcnJheTsgcHVibGljS2V5OiBVaW50OEFycmF5IH07XG4gIGdldFB1YmxpY0tleTogdHlwZW9mIHNjaG5vcnJHZXRQdWJsaWNLZXk7XG4gIHNpZ246IHR5cGVvZiBzY2hub3JyU2lnbjtcbiAgdmVyaWZ5OiB0eXBlb2Ygc2Nobm9yclZlcmlmeTtcbiAgUG9pbnQ6IFdlaWVyc3RyYXNzUG9pbnRDb25zPGJpZ2ludD47XG4gIHV0aWxzOiB7XG4gICAgcmFuZG9tU2VjcmV0S2V5OiAoc2VlZD86IFVpbnQ4QXJyYXkpID0+IFVpbnQ4QXJyYXk7XG4gICAgcG9pbnRUb0J5dGVzOiAocG9pbnQ6IFBvaW50VHlwZTxiaWdpbnQ+KSA9PiBVaW50OEFycmF5O1xuICAgIGxpZnRfeDogdHlwZW9mIGxpZnRfeDtcbiAgICB0YWdnZWRIYXNoOiB0eXBlb2YgdGFnZ2VkSGFzaDtcbiAgfTtcbiAgbGVuZ3RoczogQ3VydmVMZW5ndGhzO1xufTtcbi8qKlxuICogU2Nobm9yciBzaWduYXR1cmVzIG92ZXIgc2VjcDI1NmsxLlxuICogaHR0cHM6Ly9naXRodWIuY29tL2JpdGNvaW4vYmlwcy9ibG9iL21hc3Rlci9iaXAtMDM0MC5tZWRpYXdpa2lcbiAqIEBleGFtcGxlXG4gKiBgYGBqc1xuICogaW1wb3J0IHsgc2Nobm9yciB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbiAqIGNvbnN0IHsgc2VjcmV0S2V5LCBwdWJsaWNLZXkgfSA9IHNjaG5vcnIua2V5Z2VuKCk7XG4gKiAvLyBjb25zdCBwdWJsaWNLZXkgPSBzY2hub3JyLmdldFB1YmxpY0tleShzZWNyZXRLZXkpO1xuICogY29uc3QgbXNnID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKCdoZWxsbycpO1xuICogY29uc3Qgc2lnID0gc2Nobm9yci5zaWduKG1zZywgc2VjcmV0S2V5KTtcbiAqIGNvbnN0IGlzVmFsaWQgPSBzY2hub3JyLnZlcmlmeShzaWcsIG1zZywgcHVibGljS2V5KTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3Qgc2Nobm9ycjogU2VjcFNjaG5vcnIgPSAvKiBAX19QVVJFX18gKi8gKCgpID0+IHtcbiAgY29uc3Qgc2l6ZSA9IDMyO1xuICBjb25zdCBzZWVkTGVuZ3RoID0gNDg7XG4gIGNvbnN0IHJhbmRvbVNlY3JldEtleSA9IChzZWVkID0gcmFuZG9tQnl0ZXMoc2VlZExlbmd0aCkpOiBVaW50OEFycmF5ID0+IHtcbiAgICByZXR1cm4gbWFwSGFzaFRvRmllbGQoc2VlZCwgc2VjcDI1NmsxX0NVUlZFLm4pO1xuICB9O1xuICByZXR1cm4ge1xuICAgIGtleWdlbjogY3JlYXRlS2V5Z2VuKHJhbmRvbVNlY3JldEtleSwgc2Nobm9yckdldFB1YmxpY0tleSksXG4gICAgZ2V0UHVibGljS2V5OiBzY2hub3JyR2V0UHVibGljS2V5LFxuICAgIHNpZ246IHNjaG5vcnJTaWduLFxuICAgIHZlcmlmeTogc2Nobm9yclZlcmlmeSxcbiAgICBQb2ludDogUG9pbnRrMSxcbiAgICB1dGlsczoge1xuICAgICAgcmFuZG9tU2VjcmV0S2V5LFxuICAgICAgdGFnZ2VkSGFzaCxcbiAgICAgIGxpZnRfeCxcbiAgICAgIHBvaW50VG9CeXRlcyxcbiAgICB9LFxuICAgIGxlbmd0aHM6IHtcbiAgICAgIHNlY3JldEtleTogc2l6ZSxcbiAgICAgIHB1YmxpY0tleTogc2l6ZSxcbiAgICAgIHB1YmxpY0tleUhhc1ByZWZpeDogZmFsc2UsXG4gICAgICBzaWduYXR1cmU6IHNpemUgKiAyLFxuICAgICAgc2VlZDogc2VlZExlbmd0aCxcbiAgICB9LFxuICB9O1xufSkoKTtcblxuY29uc3QgaXNvTWFwID0gLyogQF9fUFVSRV9fICovICgoKSA9PlxuICBpc29nZW55TWFwKFxuICAgIEZwazEsXG4gICAgW1xuICAgICAgLy8geE51bVxuICAgICAgW1xuICAgICAgICAnMHg4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZGFhYWFhOGM3JyxcbiAgICAgICAgJzB4N2QzZDRjODBiYzMyMWQ1YjlmMzE1Y2VhN2ZkNDRjNWQ1OTVkMmZjMGJmNjNiOTJkZmZmMTA0NGYxN2M2NTgxJyxcbiAgICAgICAgJzB4NTM0YzMyOGQyM2YyMzRlNmUyYTQxM2RlY2EyNWNhZWNlNDUwNjE0NDAzN2M0MDMxNGVjYmQwYjUzZDlkZDI2MicsXG4gICAgICAgICcweDhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhkYWFhYWE4OGMnLFxuICAgICAgXSxcbiAgICAgIC8vIHhEZW5cbiAgICAgIFtcbiAgICAgICAgJzB4ZDM1NzcxMTkzZDk0OTE4YTljYTM0Y2NiYjdiNjQwZGQ4NmNkNDA5NTQyZjg0ODdkOWZlNmI3NDU3ODFlYjQ5YicsXG4gICAgICAgICcweGVkYWRjNmY2NDM4M2RjMWRmN2M0YjJkNTFiNTQyMjU0MDZkMzZiNjQxZjVlNDFiYmM1MmE1NjYxMmE4YzZkMTQnLFxuICAgICAgICAnMHgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxJywgLy8gTEFTVCAxXG4gICAgICBdLFxuICAgICAgLy8geU51bVxuICAgICAgW1xuICAgICAgICAnMHg0YmRhMTJmNjg0YmRhMTJmNjg0YmRhMTJmNjg0YmRhMTJmNjg0YmRhMTJmNjg0YmRhMTJmNjg0YjhlMzhlMjNjJyxcbiAgICAgICAgJzB4Yzc1ZTBjMzJkNWNiN2MwZmE5ZDBhNTRiMTJhMGE2ZDU2NDdhYjA0NmQ2ODZkYTZmZGZmYzkwZmMyMDFkNzFhMycsXG4gICAgICAgICcweDI5YTYxOTQ2OTFmOTFhNzM3MTUyMDllZjY1MTJlNTc2NzIyODMwYTIwMWJlMjAxOGE3NjVlODVhOWVjZWU5MzEnLFxuICAgICAgICAnMHgyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjM4ZTM4ZDg0JyxcbiAgICAgIF0sXG4gICAgICAvLyB5RGVuXG4gICAgICBbXG4gICAgICAgICcweGZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZlZmZmZmY5M2InLFxuICAgICAgICAnMHg3YTA2NTM0YmI4YmRiNDlmZDVlOWU2NjMyNzIyYzI5ODk0NjdjMWJmYzhlOGQ5NzhkZmI0MjVkMjY4NWMyNTczJyxcbiAgICAgICAgJzB4NjQ4NGFhNzE2NTQ1Y2EyY2YzYTcwYzNmYThmZTMzN2UwYTNkMjExNjJmMGQ2Mjk5YTdiZjgxOTJiZmQyYTc2ZicsXG4gICAgICAgICcweDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEnLCAvLyBMQVNUIDFcbiAgICAgIF0sXG4gICAgXS5tYXAoKGkpID0+IGkubWFwKChqKSA9PiBCaWdJbnQoaikpKSBhcyBbYmlnaW50W10sIGJpZ2ludFtdLCBiaWdpbnRbXSwgYmlnaW50W11dXG4gICkpKCk7XG5jb25zdCBtYXBTV1UgPSAvKiBAX19QVVJFX18gKi8gKCgpID0+XG4gIG1hcFRvQ3VydmVTaW1wbGVTV1UoRnBrMSwge1xuICAgIEE6IEJpZ0ludCgnMHgzZjg3MzFhYmRkNjYxYWRjYTA4YTU1NThmMGY1ZDI3MmU5NTNkMzYzY2I2ZjBlNWQ0MDU0NDdjMDFhNDQ0NTMzJyksXG4gICAgQjogQmlnSW50KCcxNzcxJyksXG4gICAgWjogRnBrMS5jcmVhdGUoQmlnSW50KCctMTEnKSksXG4gIH0pKSgpO1xuXG4vKiogSGFzaGluZyAvIGVuY29kaW5nIHRvIHNlY3AyNTZrMSBwb2ludHMgLyBmaWVsZC4gUkZDIDkzODAgbWV0aG9kcy4gKi9cbmV4cG9ydCBjb25zdCBzZWNwMjU2azFfaGFzaGVyOiBIMkNIYXNoZXI8V2VpZXJzdHJhc3NQb2ludENvbnM8YmlnaW50Pj4gPSAvKiBAX19QVVJFX18gKi8gKCgpID0+XG4gIGNyZWF0ZUhhc2hlcihcbiAgICBQb2ludGsxLFxuICAgIChzY2FsYXJzOiBiaWdpbnRbXSkgPT4ge1xuICAgICAgY29uc3QgeyB4LCB5IH0gPSBtYXBTV1UoRnBrMS5jcmVhdGUoc2NhbGFyc1swXSkpO1xuICAgICAgcmV0dXJuIGlzb01hcCh4LCB5KTtcbiAgICB9LFxuICAgIHtcbiAgICAgIERTVDogJ3NlY3AyNTZrMV9YTUQ6U0hBLTI1Nl9TU1dVX1JPXycsXG4gICAgICBlbmNvZGVEU1Q6ICdzZWNwMjU2azFfWE1EOlNIQS0yNTZfU1NXVV9OVV8nLFxuICAgICAgcDogRnBrMS5PUkRFUixcbiAgICAgIG06IDEsXG4gICAgICBrOiAxMjgsXG4gICAgICBleHBhbmQ6ICd4bWQnLFxuICAgICAgaGFzaDogc2hhMjU2LFxuICAgIH1cbiAgKSkoKTtcbiIsICIvKipcbiAqIE1ldGhvZHMgZm9yIGVsbGlwdGljIGN1cnZlIG11bHRpcGxpY2F0aW9uIGJ5IHNjYWxhcnMuXG4gKiBDb250YWlucyB3TkFGLCBwaXBwZW5nZXIuXG4gKiBAbW9kdWxlXG4gKi9cbi8qISBub2JsZS1jdXJ2ZXMgLSBNSVQgTGljZW5zZSAoYykgMjAyMiBQYXVsIE1pbGxlciAocGF1bG1pbGxyLmNvbSkgKi9cbmltcG9ydCB7IGJpdExlbiwgYml0TWFzaywgdHlwZSBTaWduZXIgfSBmcm9tICcuLi91dGlscy50cyc7XG5pbXBvcnQgeyBGaWVsZCwgRnBJbnZlcnRCYXRjaCwgdmFsaWRhdGVGaWVsZCwgdHlwZSBJRmllbGQgfSBmcm9tICcuL21vZHVsYXIudHMnO1xuXG5jb25zdCBfMG4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDApO1xuY29uc3QgXzFuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgxKTtcblxuZXhwb3J0IHR5cGUgQWZmaW5lUG9pbnQ8VD4gPSB7XG4gIHg6IFQ7XG4gIHk6IFQ7XG59ICYgeyBaPzogbmV2ZXIgfTtcblxuLy8gV2UgY2FuJ3QgXCJhYnN0cmFjdCBvdXRcIiBjb29yZGluYXRlcyAoWCwgWSwgWjsgYW5kIFQgaW4gRWR3YXJkcyk6IGFyZ3VtZW50IG5hbWVzIG9mIGNvbnN0cnVjdG9yXG4vLyBhcmUgbm90IGFjY2Vzc2libGUuIFNlZSBUeXBlc2NyaXB0IGdoLTU2MDkzLCBnaC00MTU5NC5cbi8vXG4vLyBXZSBoYXZlIHRvIHVzZSByZWN1cnNpdmUgdHlwZXMsIHNvIGl0IHdpbGwgcmV0dXJuIGFjdHVhbCBwb2ludCwgbm90IGNvbnN0YWluZWQgYEN1cnZlUG9pbnRgLlxuLy8gSWYsIGF0IGFueSBwb2ludCwgUCBpcyBgYW55YCwgaXQgd2lsbCBlcmFzZSBhbGwgdHlwZXMgYW5kIHJlcGxhY2UgaXRcbi8vIHdpdGggYGFueWAsIGJlY2F1c2Ugb2YgcmVjdXJzaW9uLCBgYW55IGltcGxlbWVudHMgQ3VydmVQb2ludGAsXG4vLyBidXQgd2UgbG9zZSBhbGwgY29uc3RyYWlucyBvbiBtZXRob2RzLlxuXG4vKiogQmFzZSBpbnRlcmZhY2UgZm9yIGFsbCBlbGxpcHRpYyBjdXJ2ZSBQb2ludHMuICovXG5leHBvcnQgaW50ZXJmYWNlIEN1cnZlUG9pbnQ8RiwgUCBleHRlbmRzIEN1cnZlUG9pbnQ8RiwgUD4+IHtcbiAgLyoqIEFmZmluZSB4IGNvb3JkaW5hdGUuIERpZmZlcmVudCBmcm9tIHByb2plY3RpdmUgLyBleHRlbmRlZCBYIGNvb3JkaW5hdGUuICovXG4gIHg6IEY7XG4gIC8qKiBBZmZpbmUgeSBjb29yZGluYXRlLiBEaWZmZXJlbnQgZnJvbSBwcm9qZWN0aXZlIC8gZXh0ZW5kZWQgWSBjb29yZGluYXRlLiAqL1xuICB5OiBGO1xuICBaPzogRjtcbiAgZG91YmxlKCk6IFA7XG4gIG5lZ2F0ZSgpOiBQO1xuICBhZGQob3RoZXI6IFApOiBQO1xuICBzdWJ0cmFjdChvdGhlcjogUCk6IFA7XG4gIGVxdWFscyhvdGhlcjogUCk6IGJvb2xlYW47XG4gIG11bHRpcGx5KHNjYWxhcjogYmlnaW50KTogUDtcbiAgYXNzZXJ0VmFsaWRpdHkoKTogdm9pZDtcbiAgY2xlYXJDb2ZhY3RvcigpOiBQO1xuICBpczAoKTogYm9vbGVhbjtcbiAgaXNUb3JzaW9uRnJlZSgpOiBib29sZWFuO1xuICBpc1NtYWxsT3JkZXIoKTogYm9vbGVhbjtcbiAgbXVsdGlwbHlVbnNhZmUoc2NhbGFyOiBiaWdpbnQpOiBQO1xuICAvKipcbiAgICogTWFzc2l2ZWx5IHNwZWVkcyB1cCBgcC5tdWx0aXBseShuKWAgYnkgdXNpbmcgcHJlY29tcHV0ZSB0YWJsZXMgKGNhY2hpbmcpLiBTZWUge0BsaW5rIHdOQUZ9LlxuICAgKiBAcGFyYW0gaXNMYXp5IGNhbGN1bGF0ZSBjYWNoZSBub3cuIERlZmF1bHQgKHRydWUpIGVuc3VyZXMgaXQncyBkZWZlcnJlZCB0byBmaXJzdCBgbXVsdGlwbHkoKWBcbiAgICovXG4gIHByZWNvbXB1dGUod2luZG93U2l6ZT86IG51bWJlciwgaXNMYXp5PzogYm9vbGVhbik6IFA7XG4gIC8qKiBDb252ZXJ0cyBwb2ludCB0byAyRCB4eSBhZmZpbmUgY29vcmRpbmF0ZXMgKi9cbiAgdG9BZmZpbmUoaW52ZXJ0ZWRaPzogRik6IEFmZmluZVBvaW50PEY+O1xuICB0b0J5dGVzKCk6IFVpbnQ4QXJyYXk7XG4gIHRvSGV4KCk6IHN0cmluZztcbn1cblxuLyoqIEJhc2UgaW50ZXJmYWNlIGZvciBhbGwgZWxsaXB0aWMgY3VydmUgUG9pbnQgY29uc3RydWN0b3JzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDdXJ2ZVBvaW50Q29uczxQIGV4dGVuZHMgQ3VydmVQb2ludDxhbnksIFA+PiB7XG4gIFtTeW1ib2wuaGFzSW5zdGFuY2VdOiAoaXRlbTogdW5rbm93bikgPT4gYm9vbGVhbjtcbiAgQkFTRTogUDtcbiAgWkVSTzogUDtcbiAgLyoqIEZpZWxkIGZvciBiYXNpYyBjdXJ2ZSBtYXRoICovXG4gIEZwOiBJRmllbGQ8UF9GPFA+PjtcbiAgLyoqIFNjYWxhciBmaWVsZCwgZm9yIHNjYWxhcnMgaW4gbXVsdGlwbHkgYW5kIG90aGVycyAqL1xuICBGbjogSUZpZWxkPGJpZ2ludD47XG4gIC8qKiBDcmVhdGVzIHBvaW50IGZyb20geCwgeS4gRG9lcyBOT1QgdmFsaWRhdGUgaWYgdGhlIHBvaW50IGlzIHZhbGlkLiBVc2UgYC5hc3NlcnRWYWxpZGl0eSgpYC4gKi9cbiAgZnJvbUFmZmluZShwOiBBZmZpbmVQb2ludDxQX0Y8UD4+KTogUDtcbiAgZnJvbUJ5dGVzKGJ5dGVzOiBVaW50OEFycmF5KTogUDtcbiAgZnJvbUhleChoZXg6IHN0cmluZyk6IFA7XG59XG5cbi8vIFR5cGUgaW5mZXJlbmNlIGhlbHBlcnM6IFBDIC0gUG9pbnRDb25zdHJ1Y3RvciwgUCAtIFBvaW50LCBGcCAtIEZpZWxkIGVsZW1lbnRcbi8vIFNob3J0IG5hbWVzLCBiZWNhdXNlIHdlIHVzZSB0aGVtIGEgbG90IGluIHJlc3VsdCB0eXBlczpcbi8vICogd2UgY2FuJ3QgZG8gJ1AgPSBHZXRDdXJ2ZVBvaW50PFBDPic6IHRoaXMgaXMgZGVmYXVsdCB2YWx1ZSBhbmQgZG9lc24ndCBjb25zdHJhaW4gYW55dGhpbmdcbi8vICogd2UgY2FuJ3QgZG8gJ3R5cGUgWCA9IEdldEN1cnZlUG9pbnQ8UEM+JzogaXQgd29uJ3QgYmUgYWNjZXNpYmxlIGZvciBhcmd1bWVudHMvcmV0dXJuIHR5cGVzXG4vLyAqIGBDdXJ2ZVBvaW50Q29uczxQIGV4dGVuZHMgQ3VydmVQb2ludDxhbnksIFA+PmAgY29uc3RyYWludHMgZnJvbSBpbnRlcmZhY2UgZGVmaW5pdGlvblxuLy8gICB3b24ndCBwcm9wYWdhdGUsIGlmIGBQQyBleHRlbmRzIEN1cnZlUG9pbnRDb25zPGFueT5gOiB0aGUgUCB3b3VsZCBiZSAnYW55Jywgd2hpY2ggaXMgaW5jb3JyZWN0XG4vLyAqIFBDIGNvdWxkIGJlIHN1cGVyIHNwZWNpZmljIHdpdGggc3VwZXIgc3BlY2lmaWMgUCwgd2hpY2ggaW1wbGVtZW50cyBDdXJ2ZVBvaW50PGFueSwgUD4uXG4vLyAgIHRoaXMgbWVhbnMgd2UgbmVlZCB0byBkbyBzdHVmZiBsaWtlXG4vLyAgIGBmdW5jdGlvbiB0ZXN0PFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PGFueSwgUD4sIFBDIGV4dGVuZHMgQ3VydmVQb2ludENvbnM8UD4+KGBcbi8vICAgaWYgd2Ugd2FudCB0eXBlIHNhZmV0eSBhcm91bmQgUCwgb3RoZXJ3aXNlIFBDX1A8UEM+IHdpbGwgYmUgYW55XG5cbi8qKiBSZXR1cm5zIEZwIHR5cGUgZnJvbSBQb2ludCAoUF9GPFA+ID09IFAuRikgKi9cbmV4cG9ydCB0eXBlIFBfRjxQIGV4dGVuZHMgQ3VydmVQb2ludDxhbnksIFA+PiA9IFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PGluZmVyIEYsIFA+ID8gRiA6IG5ldmVyO1xuLyoqIFJldHVybnMgRnAgdHlwZSBmcm9tIFBvaW50Q29ucyAoUENfRjxQQz4gPT0gUEMuUC5GKSAqL1xuZXhwb3J0IHR5cGUgUENfRjxQQyBleHRlbmRzIEN1cnZlUG9pbnRDb25zPEN1cnZlUG9pbnQ8YW55LCBhbnk+Pj4gPSBQQ1snRnAnXVsnWkVSTyddO1xuLyoqIFJldHVybnMgUG9pbnQgdHlwZSBmcm9tIFBvaW50Q29ucyAoUENfUDxQQz4gPT0gUEMuUCkgKi9cbmV4cG9ydCB0eXBlIFBDX1A8UEMgZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxDdXJ2ZVBvaW50PGFueSwgYW55Pj4+ID0gUENbJ1pFUk8nXTtcblxuLy8gVWdseSBoYWNrIHRvIGdldCBwcm9wZXIgdHlwZSBpbmZlcmVuY2UsIGJlY2F1c2UgaW4gdHlwZXNjcmlwdCBmYWlscyB0byBpbmZlciByZXN1cnNpdmVseS5cbi8vIFRoZSBoYWNrIGFsbG93cyB0byBkbyB1cCB0byAxMCBjaGFpbmVkIG9wZXJhdGlvbnMgd2l0aG91dCBhcHBseWluZyB0eXBlIGVyYXN1cmUuXG4vL1xuLy8gVHlwZXMgd2hpY2ggd29uJ3Qgd29yazpcbi8vICogYEN1cnZlUG9pbnRDb25zPEN1cnZlUG9pbnQ8YW55LCBhbnk+PmAsIHdpbGwgcmV0dXJuIGBhbnlgIGFmdGVyIDEgb3BlcmF0aW9uXG4vLyAqIGBDdXJ2ZVBvaW50Q29uczxhbnk+OiBXZWllcnN0cmFzc1BvaW50Q29uczxiaWdpbnQ+IGV4dGVuZHMgQ3VydmVQb2ludENvbnM8YW55PiA9IGZhbHNlYFxuLy8gKiBgUCBleHRlbmRzIEN1cnZlUG9pbnQsIFBDIGV4dGVuZHMgQ3VydmVQb2ludENvbnM8UD5gXG4vLyAgICAgKiBJdCBjYW4ndCBpbmZlciBQIGZyb20gUEMgYWxvbmVcbi8vICAgICAqIFRvbyBtYW55IHJlbGF0aW9ucyBiZXR3ZWVuIEYsIFAgJiBQQ1xuLy8gICAgICogSXQgd2lsbCBpbmZlciBQL0YgaWYgYGFyZzogQ3VydmVQb2ludENvbnM8RiwgUD5gLCBidXQgd2lsbCBmYWlsIGlmIFBDIGlzIGdlbmVyaWNcbi8vICAgICAqIEl0IHdpbGwgd29yayBjb3JyZWN0bHkgaWYgdGhlcmUgaXMgYW4gYWRkaXRpb25hbCBhcmd1bWVudCBvZiB0eXBlIFBcbi8vICAgICAqIEJ1dCBnZW5lcmFsbHksIHdlIGRvbid0IHdhbnQgdG8gcGFyYW1ldHJpemUgYEN1cnZlUG9pbnRDb25zYCBvdmVyIGBGYDogaXQgd2lsbCBjb21wbGljYXRlXG4vLyAgICAgICB0eXBlcywgbWFraW5nIHRoZW0gdW4taW5mZXJhYmxlXG4vLyBwcmV0dGllci1pZ25vcmVcbmV4cG9ydCB0eXBlIFBDX0FOWSA9IEN1cnZlUG9pbnRDb25zPFxuICBDdXJ2ZVBvaW50PGFueSxcbiAgQ3VydmVQb2ludDxhbnksXG4gIEN1cnZlUG9pbnQ8YW55LFxuICBDdXJ2ZVBvaW50PGFueSxcbiAgQ3VydmVQb2ludDxhbnksXG4gIEN1cnZlUG9pbnQ8YW55LFxuICBDdXJ2ZVBvaW50PGFueSxcbiAgQ3VydmVQb2ludDxhbnksXG4gIEN1cnZlUG9pbnQ8YW55LFxuICBDdXJ2ZVBvaW50PGFueSwgYW55PlxuICA+Pj4+Pj4+Pj5cbj47XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3VydmVMZW5ndGhzIHtcbiAgc2VjcmV0S2V5PzogbnVtYmVyO1xuICBwdWJsaWNLZXk/OiBudW1iZXI7XG4gIHB1YmxpY0tleVVuY29tcHJlc3NlZD86IG51bWJlcjtcbiAgcHVibGljS2V5SGFzUHJlZml4PzogYm9vbGVhbjtcbiAgc2lnbmF0dXJlPzogbnVtYmVyO1xuICBzZWVkPzogbnVtYmVyO1xufVxuXG5leHBvcnQgdHlwZSBNYXBwZXI8VD4gPSAoaTogVFtdKSA9PiBUW107XG5cbmV4cG9ydCBmdW5jdGlvbiBuZWdhdGVDdDxUIGV4dGVuZHMgeyBuZWdhdGU6ICgpID0+IFQgfT4oY29uZGl0aW9uOiBib29sZWFuLCBpdGVtOiBUKTogVCB7XG4gIGNvbnN0IG5lZyA9IGl0ZW0ubmVnYXRlKCk7XG4gIHJldHVybiBjb25kaXRpb24gPyBuZWcgOiBpdGVtO1xufVxuXG4vKipcbiAqIFRha2VzIGEgYnVuY2ggb2YgUHJvamVjdGl2ZSBQb2ludHMgYnV0IGV4ZWN1dGVzIG9ubHkgb25lXG4gKiBpbnZlcnNpb24gb24gYWxsIG9mIHRoZW0uIEludmVyc2lvbiBpcyB2ZXJ5IHNsb3cgb3BlcmF0aW9uLFxuICogc28gdGhpcyBpbXByb3ZlcyBwZXJmb3JtYW5jZSBtYXNzaXZlbHkuXG4gKiBPcHRpbWl6YXRpb246IGNvbnZlcnRzIGEgbGlzdCBvZiBwcm9qZWN0aXZlIHBvaW50cyB0byBhIGxpc3Qgb2YgaWRlbnRpY2FsIHBvaW50cyB3aXRoIFo9MS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVo8UCBleHRlbmRzIEN1cnZlUG9pbnQ8YW55LCBQPiwgUEMgZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxQPj4oXG4gIGM6IFBDLFxuICBwb2ludHM6IFBbXVxuKTogUFtdIHtcbiAgY29uc3QgaW52ZXJ0ZWRacyA9IEZwSW52ZXJ0QmF0Y2goXG4gICAgYy5GcCxcbiAgICBwb2ludHMubWFwKChwKSA9PiBwLlohKVxuICApO1xuICByZXR1cm4gcG9pbnRzLm1hcCgocCwgaSkgPT4gYy5mcm9tQWZmaW5lKHAudG9BZmZpbmUoaW52ZXJ0ZWRac1tpXSkpKTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVXKFc6IG51bWJlciwgYml0czogbnVtYmVyKSB7XG4gIGlmICghTnVtYmVyLmlzU2FmZUludGVnZXIoVykgfHwgVyA8PSAwIHx8IFcgPiBiaXRzKVxuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCB3aW5kb3cgc2l6ZSwgZXhwZWN0ZWQgWzEuLicgKyBiaXRzICsgJ10sIGdvdCBXPScgKyBXKTtcbn1cblxuLyoqIEludGVybmFsIHdOQUYgb3B0cyBmb3Igc3BlY2lmaWMgVyBhbmQgc2NhbGFyQml0cyAqL1xudHlwZSBXT3B0cyA9IHtcbiAgd2luZG93czogbnVtYmVyO1xuICB3aW5kb3dTaXplOiBudW1iZXI7XG4gIG1hc2s6IGJpZ2ludDtcbiAgbWF4TnVtYmVyOiBudW1iZXI7XG4gIHNoaWZ0Qnk6IGJpZ2ludDtcbn07XG5cbmZ1bmN0aW9uIGNhbGNXT3B0cyhXOiBudW1iZXIsIHNjYWxhckJpdHM6IG51bWJlcik6IFdPcHRzIHtcbiAgdmFsaWRhdGVXKFcsIHNjYWxhckJpdHMpO1xuICBjb25zdCB3aW5kb3dzID0gTWF0aC5jZWlsKHNjYWxhckJpdHMgLyBXKSArIDE7IC8vIFc9OCAzMy4gTm90IDMyLCBiZWNhdXNlIHdlIHNraXAgemVyb1xuICBjb25zdCB3aW5kb3dTaXplID0gMiAqKiAoVyAtIDEpOyAvLyBXPTggMTI4LiBOb3QgMjU2LCBiZWNhdXNlIHdlIHNraXAgemVyb1xuICBjb25zdCBtYXhOdW1iZXIgPSAyICoqIFc7IC8vIFc9OCAyNTZcbiAgY29uc3QgbWFzayA9IGJpdE1hc2soVyk7IC8vIFc9OCAyNTUgPT0gbWFzayAwYjExMTExMTExXG4gIGNvbnN0IHNoaWZ0QnkgPSBCaWdJbnQoVyk7IC8vIFc9OCA4XG4gIHJldHVybiB7IHdpbmRvd3MsIHdpbmRvd1NpemUsIG1hc2ssIG1heE51bWJlciwgc2hpZnRCeSB9O1xufVxuXG5mdW5jdGlvbiBjYWxjT2Zmc2V0cyhuOiBiaWdpbnQsIHdpbmRvdzogbnVtYmVyLCB3T3B0czogV09wdHMpIHtcbiAgY29uc3QgeyB3aW5kb3dTaXplLCBtYXNrLCBtYXhOdW1iZXIsIHNoaWZ0QnkgfSA9IHdPcHRzO1xuICBsZXQgd2JpdHMgPSBOdW1iZXIobiAmIG1hc2spOyAvLyBleHRyYWN0IFcgYml0cy5cbiAgbGV0IG5leHROID0gbiA+PiBzaGlmdEJ5OyAvLyBzaGlmdCBudW1iZXIgYnkgVyBiaXRzLlxuXG4gIC8vIFdoYXQgYWN0dWFsbHkgaGFwcGVucyBoZXJlOlxuICAvLyBjb25zdCBoaWdoZXN0Qml0ID0gTnVtYmVyKG1hc2sgXiAobWFzayA+PiAxbikpO1xuICAvLyBsZXQgd2JpdHMyID0gd2JpdHMgLSAxOyAvLyBza2lwIHplcm9cbiAgLy8gaWYgKHdiaXRzMiAmIGhpZ2hlc3RCaXQpIHsgd2JpdHMyIF49IE51bWJlcihtYXNrKTsgLy8gKH4pO1xuXG4gIC8vIHNwbGl0IGlmIGJpdHMgPiBtYXg6ICsyMjQgPT4gMjU2LTMyXG4gIGlmICh3Yml0cyA+IHdpbmRvd1NpemUpIHtcbiAgICAvLyB3ZSBza2lwIHplcm8sIHdoaWNoIG1lYW5zIGluc3RlYWQgb2YgYD49IHNpemUtMWAsIHdlIGRvIGA+IHNpemVgXG4gICAgd2JpdHMgLT0gbWF4TnVtYmVyOyAvLyAtMzIsIGNhbiBiZSBtYXhOdW1iZXIgLSB3Yml0cywgYnV0IHRoZW4gd2UgbmVlZCB0byBzZXQgaXNOZWcgaGVyZS5cbiAgICBuZXh0TiArPSBfMW47IC8vICsyNTYgKGNhcnJ5KVxuICB9XG4gIGNvbnN0IG9mZnNldFN0YXJ0ID0gd2luZG93ICogd2luZG93U2l6ZTtcbiAgY29uc3Qgb2Zmc2V0ID0gb2Zmc2V0U3RhcnQgKyBNYXRoLmFicyh3Yml0cykgLSAxOyAvLyAtMSBiZWNhdXNlIHdlIHNraXAgemVyb1xuICBjb25zdCBpc1plcm8gPSB3Yml0cyA9PT0gMDsgLy8gaXMgY3VycmVudCB3aW5kb3cgc2xpY2UgYSAwP1xuICBjb25zdCBpc05lZyA9IHdiaXRzIDwgMDsgLy8gaXMgY3VycmVudCB3aW5kb3cgc2xpY2UgbmVnYXRpdmU/XG4gIGNvbnN0IGlzTmVnRiA9IHdpbmRvdyAlIDIgIT09IDA7IC8vIGZha2UgcmFuZG9tIHN0YXRlbWVudCBmb3Igbm9pc2VcbiAgY29uc3Qgb2Zmc2V0RiA9IG9mZnNldFN0YXJ0OyAvLyBmYWtlIG9mZnNldCBmb3Igbm9pc2VcbiAgcmV0dXJuIHsgbmV4dE4sIG9mZnNldCwgaXNaZXJvLCBpc05lZywgaXNOZWdGLCBvZmZzZXRGIH07XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlTVNNUG9pbnRzKHBvaW50czogYW55W10sIGM6IGFueSkge1xuICBpZiAoIUFycmF5LmlzQXJyYXkocG9pbnRzKSkgdGhyb3cgbmV3IEVycm9yKCdhcnJheSBleHBlY3RlZCcpO1xuICBwb2ludHMuZm9yRWFjaCgocCwgaSkgPT4ge1xuICAgIGlmICghKHAgaW5zdGFuY2VvZiBjKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHBvaW50IGF0IGluZGV4ICcgKyBpKTtcbiAgfSk7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZU1TTVNjYWxhcnMoc2NhbGFyczogYW55W10sIGZpZWxkOiBhbnkpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHNjYWxhcnMpKSB0aHJvdyBuZXcgRXJyb3IoJ2FycmF5IG9mIHNjYWxhcnMgZXhwZWN0ZWQnKTtcbiAgc2NhbGFycy5mb3JFYWNoKChzLCBpKSA9PiB7XG4gICAgaWYgKCFmaWVsZC5pc1ZhbGlkKHMpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgc2NhbGFyIGF0IGluZGV4ICcgKyBpKTtcbiAgfSk7XG59XG5cbi8vIFNpbmNlIHBvaW50cyBpbiBkaWZmZXJlbnQgZ3JvdXBzIGNhbm5vdCBiZSBlcXVhbCAoZGlmZmVyZW50IG9iamVjdCBjb25zdHJ1Y3RvciksXG4vLyB3ZSBjYW4gaGF2ZSBzaW5nbGUgcGxhY2UgdG8gc3RvcmUgcHJlY29tcHV0ZXMuXG4vLyBBbGxvd3MgdG8gbWFrZSBwb2ludHMgZnJvemVuIC8gaW1tdXRhYmxlLlxuY29uc3QgcG9pbnRQcmVjb21wdXRlcyA9IG5ldyBXZWFrTWFwPGFueSwgYW55W10+KCk7XG5jb25zdCBwb2ludFdpbmRvd1NpemVzID0gbmV3IFdlYWtNYXA8YW55LCBudW1iZXI+KCk7XG5cbmZ1bmN0aW9uIGdldFcoUDogYW55KTogbnVtYmVyIHtcbiAgLy8gVG8gZGlzYWJsZSBwcmVjb21wdXRlczpcbiAgLy8gcmV0dXJuIDE7XG4gIHJldHVybiBwb2ludFdpbmRvd1NpemVzLmdldChQKSB8fCAxO1xufVxuXG5mdW5jdGlvbiBhc3NlcnQwKG46IGJpZ2ludCk6IHZvaWQge1xuICBpZiAobiAhPT0gXzBuKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgd05BRicpO1xufVxuXG4vKipcbiAqIEVsbGlwdGljIGN1cnZlIG11bHRpcGxpY2F0aW9uIG9mIFBvaW50IGJ5IHNjYWxhci4gRnJhZ2lsZS5cbiAqIFRhYmxlIGdlbmVyYXRpb24gdGFrZXMgKiozME1CIG9mIHJhbSBhbmQgMTBtcyBvbiBoaWdoLWVuZCBDUFUqKixcbiAqIGJ1dCBtYXkgdGFrZSBtdWNoIGxvbmdlciBvbiBzbG93IGRldmljZXMuIEFjdHVhbCBnZW5lcmF0aW9uIHdpbGwgaGFwcGVuIG9uXG4gKiBmaXJzdCBjYWxsIG9mIGBtdWx0aXBseSgpYC4gQnkgZGVmYXVsdCwgYEJBU0VgIHBvaW50IGlzIHByZWNvbXB1dGVkLlxuICpcbiAqIFNjYWxhcnMgc2hvdWxkIGFsd2F5cyBiZSBsZXNzIHRoYW4gY3VydmUgb3JkZXI6IHRoaXMgc2hvdWxkIGJlIGNoZWNrZWQgaW5zaWRlIG9mIGEgY3VydmUgaXRzZWxmLlxuICogQ3JlYXRlcyBwcmVjb21wdXRhdGlvbiB0YWJsZXMgZm9yIGZhc3QgbXVsdGlwbGljYXRpb246XG4gKiAtIHByaXZhdGUgc2NhbGFyIGlzIHNwbGl0IGJ5IGZpeGVkIHNpemUgd2luZG93cyBvZiBXIGJpdHNcbiAqIC0gZXZlcnkgd2luZG93IHBvaW50IGlzIGNvbGxlY3RlZCBmcm9tIHdpbmRvdydzIHRhYmxlICYgYWRkZWQgdG8gYWNjdW11bGF0b3JcbiAqIC0gc2luY2Ugd2luZG93cyBhcmUgZGlmZmVyZW50LCBzYW1lIHBvaW50IGluc2lkZSB0YWJsZXMgd29uJ3QgYmUgYWNjZXNzZWQgbW9yZSB0aGFuIG9uY2UgcGVyIGNhbGNcbiAqIC0gZWFjaCBtdWx0aXBsaWNhdGlvbiBpcyAnTWF0aC5jZWlsKENVUlZFX09SREVSIC8gXHVEODM1XHVEQzRBKSArIDEnIHBvaW50IGFkZGl0aW9ucyAoZml4ZWQgZm9yIGFueSBzY2FsYXIpXG4gKiAtICsxIHdpbmRvdyBpcyBuZWNjZXNzYXJ5IGZvciB3TkFGXG4gKiAtIHdOQUYgcmVkdWNlcyB0YWJsZSBzaXplOiAyeCBsZXNzIG1lbW9yeSArIDJ4IGZhc3RlciBnZW5lcmF0aW9uLCBidXQgMTAlIHNsb3dlciBtdWx0aXBsaWNhdGlvblxuICpcbiAqIEB0b2RvIFJlc2VhcmNoIHJldHVybmluZyAyZCBKUyBhcnJheSBvZiB3aW5kb3dzLCBpbnN0ZWFkIG9mIGEgc2luZ2xlIHdpbmRvdy5cbiAqIFRoaXMgd291bGQgYWxsb3cgd2luZG93cyB0byBiZSBpbiBkaWZmZXJlbnQgbWVtb3J5IGxvY2F0aW9uc1xuICovXG5leHBvcnQgY2xhc3Mgd05BRjxQQyBleHRlbmRzIFBDX0FOWT4ge1xuICBwcml2YXRlIHJlYWRvbmx5IEJBU0U6IFBDX1A8UEM+O1xuICBwcml2YXRlIHJlYWRvbmx5IFpFUk86IFBDX1A8UEM+O1xuICBwcml2YXRlIHJlYWRvbmx5IEZuOiBQQ1snRm4nXTtcbiAgcmVhZG9ubHkgYml0czogbnVtYmVyO1xuXG4gIC8vIFBhcmFtZXRyaXplZCB3aXRoIGEgZ2l2ZW4gUG9pbnQgY2xhc3MgKG5vdCBpbmRpdmlkdWFsIHBvaW50KVxuICBjb25zdHJ1Y3RvcihQb2ludDogUEMsIGJpdHM6IG51bWJlcikge1xuICAgIHRoaXMuQkFTRSA9IFBvaW50LkJBU0U7XG4gICAgdGhpcy5aRVJPID0gUG9pbnQuWkVSTztcbiAgICB0aGlzLkZuID0gUG9pbnQuRm47XG4gICAgdGhpcy5iaXRzID0gYml0cztcbiAgfVxuXG4gIC8vIG5vbi1jb25zdCB0aW1lIG11bHRpcGxpY2F0aW9uIGxhZGRlclxuICBfdW5zYWZlTGFkZGVyKGVsbTogUENfUDxQQz4sIG46IGJpZ2ludCwgcDogUENfUDxQQz4gPSB0aGlzLlpFUk8pOiBQQ19QPFBDPiB7XG4gICAgbGV0IGQ6IFBDX1A8UEM+ID0gZWxtO1xuICAgIHdoaWxlIChuID4gXzBuKSB7XG4gICAgICBpZiAobiAmIF8xbikgcCA9IHAuYWRkKGQpO1xuICAgICAgZCA9IGQuZG91YmxlKCk7XG4gICAgICBuID4+PSBfMW47XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSB3TkFGIHByZWNvbXB1dGF0aW9uIHdpbmRvdy4gVXNlZCBmb3IgY2FjaGluZy5cbiAgICogRGVmYXVsdCB3aW5kb3cgc2l6ZSBpcyBzZXQgYnkgYHV0aWxzLnByZWNvbXB1dGUoKWAgYW5kIGlzIGVxdWFsIHRvIDguXG4gICAqIE51bWJlciBvZiBwcmVjb21wdXRlZCBwb2ludHMgZGVwZW5kcyBvbiB0aGUgY3VydmUgc2l6ZTpcbiAgICogMl4oXHVEODM1XHVEQzRBXHUyMjEyMSkgKiAoTWF0aC5jZWlsKFx1RDgzNVx1REM1QiAvIFx1RDgzNVx1REM0QSkgKyAxKSwgd2hlcmU6XG4gICAqIC0gXHVEODM1XHVEQzRBIGlzIHRoZSB3aW5kb3cgc2l6ZVxuICAgKiAtIFx1RDgzNVx1REM1QiBpcyB0aGUgYml0bGVuZ3RoIG9mIHRoZSBjdXJ2ZSBvcmRlci5cbiAgICogRm9yIGEgMjU2LWJpdCBjdXJ2ZSBhbmQgd2luZG93IHNpemUgOCwgdGhlIG51bWJlciBvZiBwcmVjb21wdXRlZCBwb2ludHMgaXMgMTI4ICogMzMgPSA0MjI0LlxuICAgKiBAcGFyYW0gcG9pbnQgUG9pbnQgaW5zdGFuY2VcbiAgICogQHBhcmFtIFcgd2luZG93IHNpemVcbiAgICogQHJldHVybnMgcHJlY29tcHV0ZWQgcG9pbnQgdGFibGVzIGZsYXR0ZW5lZCB0byBhIHNpbmdsZSBhcnJheVxuICAgKi9cbiAgcHJpdmF0ZSBwcmVjb21wdXRlV2luZG93KHBvaW50OiBQQ19QPFBDPiwgVzogbnVtYmVyKTogUENfUDxQQz5bXSB7XG4gICAgY29uc3QgeyB3aW5kb3dzLCB3aW5kb3dTaXplIH0gPSBjYWxjV09wdHMoVywgdGhpcy5iaXRzKTtcbiAgICBjb25zdCBwb2ludHM6IFBDX1A8UEM+W10gPSBbXTtcbiAgICBsZXQgcDogUENfUDxQQz4gPSBwb2ludDtcbiAgICBsZXQgYmFzZSA9IHA7XG4gICAgZm9yIChsZXQgd2luZG93ID0gMDsgd2luZG93IDwgd2luZG93czsgd2luZG93KyspIHtcbiAgICAgIGJhc2UgPSBwO1xuICAgICAgcG9pbnRzLnB1c2goYmFzZSk7XG4gICAgICAvLyBpPTEsIGJjIHdlIHNraXAgMFxuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCB3aW5kb3dTaXplOyBpKyspIHtcbiAgICAgICAgYmFzZSA9IGJhc2UuYWRkKHApO1xuICAgICAgICBwb2ludHMucHVzaChiYXNlKTtcbiAgICAgIH1cbiAgICAgIHAgPSBiYXNlLmRvdWJsZSgpO1xuICAgIH1cbiAgICByZXR1cm4gcG9pbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudHMgZWMgbXVsdGlwbGljYXRpb24gdXNpbmcgcHJlY29tcHV0ZWQgdGFibGVzIGFuZCB3LWFyeSBub24tYWRqYWNlbnQgZm9ybS5cbiAgICogTW9yZSBjb21wYWN0IGltcGxlbWVudGF0aW9uOlxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vcGF1bG1pbGxyL25vYmxlLXNlY3AyNTZrMS9ibG9iLzQ3Y2IxNjY5YjZlNTA2YWQ2NmIzNWZlN2Q3NjEzMmFlOTc0NjVkYTIvaW5kZXgudHMjTDUwMi1MNTQxXG4gICAqIEByZXR1cm5zIHJlYWwgYW5kIGZha2UgKGZvciBjb25zdC10aW1lKSBwb2ludHNcbiAgICovXG4gIHByaXZhdGUgd05BRihXOiBudW1iZXIsIHByZWNvbXB1dGVzOiBQQ19QPFBDPltdLCBuOiBiaWdpbnQpOiB7IHA6IFBDX1A8UEM+OyBmOiBQQ19QPFBDPiB9IHtcbiAgICAvLyBTY2FsYXIgc2hvdWxkIGJlIHNtYWxsZXIgdGhhbiBmaWVsZCBvcmRlclxuICAgIGlmICghdGhpcy5Gbi5pc1ZhbGlkKG4pKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgc2NhbGFyJyk7XG4gICAgLy8gQWNjdW11bGF0b3JzXG4gICAgbGV0IHAgPSB0aGlzLlpFUk87XG4gICAgbGV0IGYgPSB0aGlzLkJBU0U7XG4gICAgLy8gVGhpcyBjb2RlIHdhcyBmaXJzdCB3cml0dGVuIHdpdGggYXNzdW1wdGlvbiB0aGF0ICdmJyBhbmQgJ3AnIHdpbGwgbmV2ZXIgYmUgaW5maW5pdHkgcG9pbnQ6XG4gICAgLy8gc2luY2UgZWFjaCBhZGRpdGlvbiBpcyBtdWx0aXBsaWVkIGJ5IDIgKiogVywgaXQgY2Fubm90IGNhbmNlbCBlYWNoIG90aGVyLiBIb3dldmVyLFxuICAgIC8vIHRoZXJlIGlzIG5lZ2F0ZSBub3c6IGl0IGlzIHBvc3NpYmxlIHRoYXQgbmVnYXRlZCBlbGVtZW50IGZyb20gbG93IHZhbHVlXG4gICAgLy8gd291bGQgYmUgdGhlIHNhbWUgYXMgaGlnaCBlbGVtZW50LCB3aGljaCB3aWxsIGNyZWF0ZSBjYXJyeSBpbnRvIG5leHQgd2luZG93LlxuICAgIC8vIEl0J3Mgbm90IG9idmlvdXMgaG93IHRoaXMgY2FuIGZhaWwsIGJ1dCBzdGlsbCB3b3J0aCBpbnZlc3RpZ2F0aW5nIGxhdGVyLlxuICAgIGNvbnN0IHdvID0gY2FsY1dPcHRzKFcsIHRoaXMuYml0cyk7XG4gICAgZm9yIChsZXQgd2luZG93ID0gMDsgd2luZG93IDwgd28ud2luZG93czsgd2luZG93KyspIHtcbiAgICAgIC8vIChuID09PSBfMG4pIGlzIGhhbmRsZWQgYW5kIG5vdCBlYXJseS1leGl0ZWQuIGlzRXZlbiBhbmQgb2Zmc2V0RiBhcmUgdXNlZCBmb3Igbm9pc2VcbiAgICAgIGNvbnN0IHsgbmV4dE4sIG9mZnNldCwgaXNaZXJvLCBpc05lZywgaXNOZWdGLCBvZmZzZXRGIH0gPSBjYWxjT2Zmc2V0cyhuLCB3aW5kb3csIHdvKTtcbiAgICAgIG4gPSBuZXh0TjtcbiAgICAgIGlmIChpc1plcm8pIHtcbiAgICAgICAgLy8gYml0cyBhcmUgMDogYWRkIGdhcmJhZ2UgdG8gZmFrZSBwb2ludFxuICAgICAgICAvLyBJbXBvcnRhbnQgcGFydCBmb3IgY29uc3QtdGltZSBnZXRQdWJsaWNLZXk6IGFkZCByYW5kb20gXCJub2lzZVwiIHBvaW50IHRvIGYuXG4gICAgICAgIGYgPSBmLmFkZChuZWdhdGVDdChpc05lZ0YsIHByZWNvbXB1dGVzW29mZnNldEZdKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBiaXRzIGFyZSAxOiBhZGQgdG8gcmVzdWx0IHBvaW50XG4gICAgICAgIHAgPSBwLmFkZChuZWdhdGVDdChpc05lZywgcHJlY29tcHV0ZXNbb2Zmc2V0XSkpO1xuICAgICAgfVxuICAgIH1cbiAgICBhc3NlcnQwKG4pO1xuICAgIC8vIFJldHVybiBib3RoIHJlYWwgYW5kIGZha2UgcG9pbnRzOiBKSVQgd29uJ3QgZWxpbWluYXRlIGYuXG4gICAgLy8gQXQgdGhpcyBwb2ludCB0aGVyZSBpcyBhIHdheSB0byBGIGJlIGluZmluaXR5LXBvaW50IGV2ZW4gaWYgcCBpcyBub3QsXG4gICAgLy8gd2hpY2ggbWFrZXMgaXQgbGVzcyBjb25zdC10aW1lOiBhcm91bmQgMSBiaWdpbnQgbXVsdGlwbHkuXG4gICAgcmV0dXJuIHsgcCwgZiB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudHMgZWMgdW5zYWZlIChub24gY29uc3QtdGltZSkgbXVsdGlwbGljYXRpb24gdXNpbmcgcHJlY29tcHV0ZWQgdGFibGVzIGFuZCB3LWFyeSBub24tYWRqYWNlbnQgZm9ybS5cbiAgICogQHBhcmFtIGFjYyBhY2N1bXVsYXRvciBwb2ludCB0byBhZGQgcmVzdWx0IG9mIG11bHRpcGxpY2F0aW9uXG4gICAqIEByZXR1cm5zIHBvaW50XG4gICAqL1xuICBwcml2YXRlIHdOQUZVbnNhZmUoXG4gICAgVzogbnVtYmVyLFxuICAgIHByZWNvbXB1dGVzOiBQQ19QPFBDPltdLFxuICAgIG46IGJpZ2ludCxcbiAgICBhY2M6IFBDX1A8UEM+ID0gdGhpcy5aRVJPXG4gICk6IFBDX1A8UEM+IHtcbiAgICBjb25zdCB3byA9IGNhbGNXT3B0cyhXLCB0aGlzLmJpdHMpO1xuICAgIGZvciAobGV0IHdpbmRvdyA9IDA7IHdpbmRvdyA8IHdvLndpbmRvd3M7IHdpbmRvdysrKSB7XG4gICAgICBpZiAobiA9PT0gXzBuKSBicmVhazsgLy8gRWFybHktZXhpdCwgc2tpcCAwIHZhbHVlXG4gICAgICBjb25zdCB7IG5leHROLCBvZmZzZXQsIGlzWmVybywgaXNOZWcgfSA9IGNhbGNPZmZzZXRzKG4sIHdpbmRvdywgd28pO1xuICAgICAgbiA9IG5leHROO1xuICAgICAgaWYgKGlzWmVybykge1xuICAgICAgICAvLyBXaW5kb3cgYml0cyBhcmUgMDogc2tpcCBwcm9jZXNzaW5nLlxuICAgICAgICAvLyBNb3ZlIHRvIG5leHQgd2luZG93LlxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBwcmVjb21wdXRlc1tvZmZzZXRdO1xuICAgICAgICBhY2MgPSBhY2MuYWRkKGlzTmVnID8gaXRlbS5uZWdhdGUoKSA6IGl0ZW0pOyAvLyBSZS11c2luZyBhY2MgYWxsb3dzIHRvIHNhdmUgYWRkcyBpbiBNU01cbiAgICAgIH1cbiAgICB9XG4gICAgYXNzZXJ0MChuKTtcbiAgICByZXR1cm4gYWNjO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRQcmVjb21wdXRlcyhXOiBudW1iZXIsIHBvaW50OiBQQ19QPFBDPiwgdHJhbnNmb3JtPzogTWFwcGVyPFBDX1A8UEM+Pik6IFBDX1A8UEM+W10ge1xuICAgIC8vIENhbGN1bGF0ZSBwcmVjb21wdXRlcyBvbiBhIGZpcnN0IHJ1biwgcmV1c2UgdGhlbSBhZnRlclxuICAgIGxldCBjb21wID0gcG9pbnRQcmVjb21wdXRlcy5nZXQocG9pbnQpO1xuICAgIGlmICghY29tcCkge1xuICAgICAgY29tcCA9IHRoaXMucHJlY29tcHV0ZVdpbmRvdyhwb2ludCwgVykgYXMgUENfUDxQQz5bXTtcbiAgICAgIGlmIChXICE9PSAxKSB7XG4gICAgICAgIC8vIERvaW5nIHRyYW5zZm9ybSBvdXRzaWRlIG9mIGlmIGJyaW5ncyAxNSUgcGVyZiBoaXRcbiAgICAgICAgaWYgKHR5cGVvZiB0cmFuc2Zvcm0gPT09ICdmdW5jdGlvbicpIGNvbXAgPSB0cmFuc2Zvcm0oY29tcCk7XG4gICAgICAgIHBvaW50UHJlY29tcHV0ZXMuc2V0KHBvaW50LCBjb21wKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbXA7XG4gIH1cblxuICBjYWNoZWQoXG4gICAgcG9pbnQ6IFBDX1A8UEM+LFxuICAgIHNjYWxhcjogYmlnaW50LFxuICAgIHRyYW5zZm9ybT86IE1hcHBlcjxQQ19QPFBDPj5cbiAgKTogeyBwOiBQQ19QPFBDPjsgZjogUENfUDxQQz4gfSB7XG4gICAgY29uc3QgVyA9IGdldFcocG9pbnQpO1xuICAgIHJldHVybiB0aGlzLndOQUYoVywgdGhpcy5nZXRQcmVjb21wdXRlcyhXLCBwb2ludCwgdHJhbnNmb3JtKSwgc2NhbGFyKTtcbiAgfVxuXG4gIHVuc2FmZShwb2ludDogUENfUDxQQz4sIHNjYWxhcjogYmlnaW50LCB0cmFuc2Zvcm0/OiBNYXBwZXI8UENfUDxQQz4+LCBwcmV2PzogUENfUDxQQz4pOiBQQ19QPFBDPiB7XG4gICAgY29uc3QgVyA9IGdldFcocG9pbnQpO1xuICAgIGlmIChXID09PSAxKSByZXR1cm4gdGhpcy5fdW5zYWZlTGFkZGVyKHBvaW50LCBzY2FsYXIsIHByZXYpOyAvLyBGb3IgVz0xIGxhZGRlciBpcyB+eDIgZmFzdGVyXG4gICAgcmV0dXJuIHRoaXMud05BRlVuc2FmZShXLCB0aGlzLmdldFByZWNvbXB1dGVzKFcsIHBvaW50LCB0cmFuc2Zvcm0pLCBzY2FsYXIsIHByZXYpO1xuICB9XG5cbiAgLy8gV2UgY2FsY3VsYXRlIHByZWNvbXB1dGVzIGZvciBlbGxpcHRpYyBjdXJ2ZSBwb2ludCBtdWx0aXBsaWNhdGlvblxuICAvLyB1c2luZyB3aW5kb3dlZCBtZXRob2QuIFRoaXMgc3BlY2lmaWVzIHdpbmRvdyBzaXplIGFuZFxuICAvLyBzdG9yZXMgcHJlY29tcHV0ZWQgdmFsdWVzLiBVc3VhbGx5IG9ubHkgYmFzZSBwb2ludCB3b3VsZCBiZSBwcmVjb21wdXRlZC5cbiAgY3JlYXRlQ2FjaGUoUDogUENfUDxQQz4sIFc6IG51bWJlcik6IHZvaWQge1xuICAgIHZhbGlkYXRlVyhXLCB0aGlzLmJpdHMpO1xuICAgIHBvaW50V2luZG93U2l6ZXMuc2V0KFAsIFcpO1xuICAgIHBvaW50UHJlY29tcHV0ZXMuZGVsZXRlKFApO1xuICB9XG5cbiAgaGFzQ2FjaGUoZWxtOiBQQ19QPFBDPik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBnZXRXKGVsbSkgIT09IDE7XG4gIH1cbn1cblxuLyoqXG4gKiBFbmRvbW9ycGhpc20tc3BlY2lmaWMgbXVsdGlwbGljYXRpb24gZm9yIEtvYmxpdHogY3VydmVzLlxuICogQ29zdDogMTI4IGRibCwgMC0yNTYgYWRkcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bEVuZG9VbnNhZmU8UCBleHRlbmRzIEN1cnZlUG9pbnQ8YW55LCBQPiwgUEMgZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxQPj4oXG4gIFBvaW50OiBQQyxcbiAgcG9pbnQ6IFAsXG4gIGsxOiBiaWdpbnQsXG4gIGsyOiBiaWdpbnRcbik6IHsgcDE6IFA7IHAyOiBQIH0ge1xuICBsZXQgYWNjID0gcG9pbnQ7XG4gIGxldCBwMSA9IFBvaW50LlpFUk87XG4gIGxldCBwMiA9IFBvaW50LlpFUk87XG4gIHdoaWxlIChrMSA+IF8wbiB8fCBrMiA+IF8wbikge1xuICAgIGlmIChrMSAmIF8xbikgcDEgPSBwMS5hZGQoYWNjKTtcbiAgICBpZiAoazIgJiBfMW4pIHAyID0gcDIuYWRkKGFjYyk7XG4gICAgYWNjID0gYWNjLmRvdWJsZSgpO1xuICAgIGsxID4+PSBfMW47XG4gICAgazIgPj49IF8xbjtcbiAgfVxuICByZXR1cm4geyBwMSwgcDIgfTtcbn1cblxuLyoqXG4gKiBQaXBwZW5nZXIgYWxnb3JpdGhtIGZvciBtdWx0aS1zY2FsYXIgbXVsdGlwbGljYXRpb24gKE1TTSwgUGEgKyBRYiArIFJjICsgLi4uKS5cbiAqIDMweCBmYXN0ZXIgdnMgbmFpdmUgYWRkaXRpb24gb24gTD00MDk2LCAxMHggZmFzdGVyIHRoYW4gcHJlY29tcHV0ZXMuXG4gKiBGb3IgTj0yNTRiaXQsIEw9MSwgaXQgZG9lczogMTAyNCBBREQgKyAyNTQgREJMLiBGb3IgTD01OiAxNTM2IEFERCArIDI1NCBEQkwuXG4gKiBBbGdvcml0aG1pY2FsbHkgY29uc3RhbnQtdGltZSAoZm9yIHNhbWUgTCksIGV2ZW4gd2hlbiAxIHBvaW50ICsgc2NhbGFyLCBvciB3aGVuIHNjYWxhciA9IDAuXG4gKiBAcGFyYW0gYyBDdXJ2ZSBQb2ludCBjb25zdHJ1Y3RvclxuICogQHBhcmFtIGZpZWxkTiBmaWVsZCBvdmVyIENVUlZFLk4gLSBpbXBvcnRhbnQgdGhhdCBpdCdzIG5vdCBvdmVyIENVUlZFLlBcbiAqIEBwYXJhbSBwb2ludHMgYXJyYXkgb2YgTCBjdXJ2ZSBwb2ludHNcbiAqIEBwYXJhbSBzY2FsYXJzIGFycmF5IG9mIEwgc2NhbGFycyAoYWthIHNlY3JldCBrZXlzIC8gYmlnaW50cylcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBpcHBlbmdlcjxQIGV4dGVuZHMgQ3VydmVQb2ludDxhbnksIFA+LCBQQyBleHRlbmRzIEN1cnZlUG9pbnRDb25zPFA+PihcbiAgYzogUEMsXG4gIHBvaW50czogUFtdLFxuICBzY2FsYXJzOiBiaWdpbnRbXVxuKTogUCB7XG4gIC8vIElmIHdlIHNwbGl0IHNjYWxhcnMgYnkgc29tZSB3aW5kb3cgKGxldCdzIHNheSA4IGJpdHMpLCBldmVyeSBjaHVuayB3aWxsIG9ubHlcbiAgLy8gdGFrZSAyNTYgYnVja2V0cyBldmVuIGlmIHRoZXJlIGFyZSA0MDk2IHNjYWxhcnMsIGFsc28gcmUtdXNlcyBkb3VibGUuXG4gIC8vIFRPRE86XG4gIC8vIC0gaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAyNC83NTAucGRmXG4gIC8vIC0gaHR0cHM6Ly90Y2hlcy5pYWNyLm9yZy9pbmRleC5waHAvVENIRVMvYXJ0aWNsZS92aWV3LzEwMjg3XG4gIC8vIDAgaXMgYWNjZXB0ZWQgaW4gc2NhbGFyc1xuICBjb25zdCBmaWVsZE4gPSBjLkZuO1xuICB2YWxpZGF0ZU1TTVBvaW50cyhwb2ludHMsIGMpO1xuICB2YWxpZGF0ZU1TTVNjYWxhcnMoc2NhbGFycywgZmllbGROKTtcbiAgY29uc3QgcGxlbmd0aCA9IHBvaW50cy5sZW5ndGg7XG4gIGNvbnN0IHNsZW5ndGggPSBzY2FsYXJzLmxlbmd0aDtcbiAgaWYgKHBsZW5ndGggIT09IHNsZW5ndGgpIHRocm93IG5ldyBFcnJvcignYXJyYXlzIG9mIHBvaW50cyBhbmQgc2NhbGFycyBtdXN0IGhhdmUgZXF1YWwgbGVuZ3RoJyk7XG4gIC8vIGlmIChwbGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ2FycmF5IG11c3QgYmUgb2YgbGVuZ3RoID49IDInKTtcbiAgY29uc3QgemVybyA9IGMuWkVSTztcbiAgY29uc3Qgd2JpdHMgPSBiaXRMZW4oQmlnSW50KHBsZW5ndGgpKTtcbiAgbGV0IHdpbmRvd1NpemUgPSAxOyAvLyBiaXRzXG4gIGlmICh3Yml0cyA+IDEyKSB3aW5kb3dTaXplID0gd2JpdHMgLSAzO1xuICBlbHNlIGlmICh3Yml0cyA+IDQpIHdpbmRvd1NpemUgPSB3Yml0cyAtIDI7XG4gIGVsc2UgaWYgKHdiaXRzID4gMCkgd2luZG93U2l6ZSA9IDI7XG4gIGNvbnN0IE1BU0sgPSBiaXRNYXNrKHdpbmRvd1NpemUpO1xuICBjb25zdCBidWNrZXRzID0gbmV3IEFycmF5KE51bWJlcihNQVNLKSArIDEpLmZpbGwoemVybyk7IC8vICsxIGZvciB6ZXJvIGFycmF5XG4gIGNvbnN0IGxhc3RCaXRzID0gTWF0aC5mbG9vcigoZmllbGROLkJJVFMgLSAxKSAvIHdpbmRvd1NpemUpICogd2luZG93U2l6ZTtcbiAgbGV0IHN1bSA9IHplcm87XG4gIGZvciAobGV0IGkgPSBsYXN0Qml0czsgaSA+PSAwOyBpIC09IHdpbmRvd1NpemUpIHtcbiAgICBidWNrZXRzLmZpbGwoemVybyk7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBzbGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvbnN0IHNjYWxhciA9IHNjYWxhcnNbal07XG4gICAgICBjb25zdCB3Yml0cyA9IE51bWJlcigoc2NhbGFyID4+IEJpZ0ludChpKSkgJiBNQVNLKTtcbiAgICAgIGJ1Y2tldHNbd2JpdHNdID0gYnVja2V0c1t3Yml0c10uYWRkKHBvaW50c1tqXSk7XG4gICAgfVxuICAgIGxldCByZXNJID0gemVybzsgLy8gbm90IHVzaW5nIHRoaXMgd2lsbCBkbyBzbWFsbCBzcGVlZC11cCwgYnV0IHdpbGwgbG9zZSBjdFxuICAgIC8vIFNraXAgZmlyc3QgYnVja2V0LCBiZWNhdXNlIGl0IGlzIHplcm9cbiAgICBmb3IgKGxldCBqID0gYnVja2V0cy5sZW5ndGggLSAxLCBzdW1JID0gemVybzsgaiA+IDA7IGotLSkge1xuICAgICAgc3VtSSA9IHN1bUkuYWRkKGJ1Y2tldHNbal0pO1xuICAgICAgcmVzSSA9IHJlc0kuYWRkKHN1bUkpO1xuICAgIH1cbiAgICBzdW0gPSBzdW0uYWRkKHJlc0kpO1xuICAgIGlmIChpICE9PSAwKSBmb3IgKGxldCBqID0gMDsgaiA8IHdpbmRvd1NpemU7IGorKykgc3VtID0gc3VtLmRvdWJsZSgpO1xuICB9XG4gIHJldHVybiBzdW0gYXMgUDtcbn1cbi8qKlxuICogUHJlY29tcHV0ZWQgbXVsdGktc2NhbGFyIG11bHRpcGxpY2F0aW9uIChNU00sIFBhICsgUWIgKyBSYyArIC4uLikuXG4gKiBAcGFyYW0gYyBDdXJ2ZSBQb2ludCBjb25zdHJ1Y3RvclxuICogQHBhcmFtIGZpZWxkTiBmaWVsZCBvdmVyIENVUlZFLk4gLSBpbXBvcnRhbnQgdGhhdCBpdCdzIG5vdCBvdmVyIENVUlZFLlBcbiAqIEBwYXJhbSBwb2ludHMgYXJyYXkgb2YgTCBjdXJ2ZSBwb2ludHNcbiAqIEByZXR1cm5zIGZ1bmN0aW9uIHdoaWNoIG11bHRpcGxpZXMgcG9pbnRzIHdpdGggc2NhYXJzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcmVjb21wdXRlTVNNVW5zYWZlPFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PGFueSwgUD4sIFBDIGV4dGVuZHMgQ3VydmVQb2ludENvbnM8UD4+KFxuICBjOiBQQyxcbiAgcG9pbnRzOiBQW10sXG4gIHdpbmRvd1NpemU6IG51bWJlclxuKTogKHNjYWxhcnM6IGJpZ2ludFtdKSA9PiBQIHtcbiAgLyoqXG4gICAqIFBlcmZvcm1hbmNlIEFuYWx5c2lzIG9mIFdpbmRvdy1iYXNlZCBQcmVjb21wdXRhdGlvblxuICAgKlxuICAgKiBCYXNlIENhc2UgKDI1Ni1iaXQgc2NhbGFyLCA4LWJpdCB3aW5kb3cpOlxuICAgKiAtIFN0YW5kYXJkIHByZWNvbXB1dGF0aW9uIHJlcXVpcmVzOlxuICAgKiAgIC0gMzEgYWRkaXRpb25zIHBlciBzY2FsYXIgXHUwMEQ3IDI1NiBzY2FsYXJzID0gNyw5MzYgb3BzXG4gICAqICAgLSBQbHVzIDI1NSBzdW1tYXJ5IGFkZGl0aW9ucyA9IDgsMTkxIHRvdGFsIG9wc1xuICAgKiAgIE5vdGU6IFN1bW1hcnkgYWRkaXRpb25zIGNhbiBiZSBvcHRpbWl6ZWQgdmlhIGFjY3VtdWxhdG9yXG4gICAqXG4gICAqIENodW5rZWQgUHJlY29tcHV0YXRpb24gQW5hbHlzaXM6XG4gICAqIC0gVXNpbmcgMzIgY2h1bmtzIHJlcXVpcmVzOlxuICAgKiAgIC0gMjU1IGFkZGl0aW9ucyBwZXIgY2h1bmtcbiAgICogICAtIDI1NiBkb3VibGluZ3NcbiAgICogICAtIFRvdGFsOiAoMjU1IFx1MDBENyAzMikgKyAyNTYgPSA4LDQxNiBvcHNcbiAgICpcbiAgICogTWVtb3J5IFVzYWdlIENvbXBhcmlzb246XG4gICAqIFdpbmRvdyBTaXplIHwgU3RhbmRhcmQgUG9pbnRzIHwgQ2h1bmtlZCBQb2ludHNcbiAgICogLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLVxuICAgKiAgICAgNC1iaXQgICB8ICAgICA1MjAgICAgICAgICB8ICAgICAgMTVcbiAgICogICAgIDgtYml0ICAgfCAgICA0LDIyNCAgICAgICAgfCAgICAgMjU1XG4gICAqICAgIDEwLWJpdCAgIHwgICAxMyw4MjQgICAgICAgIHwgICAxLDAyM1xuICAgKiAgICAxNi1iaXQgICB8ICA1NTcsMDU2ICAgICAgICB8ICA2NSw1MzVcbiAgICpcbiAgICogS2V5IEFkdmFudGFnZXM6XG4gICAqIDEuIEVuYWJsZXMgbGFyZ2VyIHdpbmRvdyBzaXplcyBkdWUgdG8gcmVkdWNlZCBtZW1vcnkgb3ZlcmhlYWRcbiAgICogMi4gTW9yZSBlZmZpY2llbnQgZm9yIHNtYWxsZXIgc2NhbGFyIGNvdW50czpcbiAgICogICAgLSAxNiBjaHVua3M6ICgxNiBcdTAwRDcgMjU1KSArIDI1NiA9IDQsMzM2IG9wc1xuICAgKiAgICAtIH4yeCBmYXN0ZXIgdGhhbiBzdGFuZGFyZCA4LDE5MSBvcHNcbiAgICpcbiAgICogTGltaXRhdGlvbnM6XG4gICAqIC0gTm90IHN1aXRhYmxlIGZvciBwbGFpbiBwcmVjb21wdXRlcyAocmVxdWlyZXMgMjU2IGNvbnN0YW50IGRvdWJsaW5ncylcbiAgICogLSBQZXJmb3JtYW5jZSBkZWdyYWRlcyB3aXRoIGxhcmdlciBzY2FsYXIgY291bnRzOlxuICAgKiAgIC0gT3B0aW1hbCBmb3IgfjI1NiBzY2FsYXJzXG4gICAqICAgLSBMZXNzIGVmZmljaWVudCBmb3IgNDA5Nisgc2NhbGFycyAoUGlwcGVuZ2VyIHByZWZlcnJlZClcbiAgICovXG4gIGNvbnN0IGZpZWxkTiA9IGMuRm47XG4gIHZhbGlkYXRlVyh3aW5kb3dTaXplLCBmaWVsZE4uQklUUyk7XG4gIHZhbGlkYXRlTVNNUG9pbnRzKHBvaW50cywgYyk7XG4gIGNvbnN0IHplcm8gPSBjLlpFUk87XG4gIGNvbnN0IHRhYmxlU2l6ZSA9IDIgKiogd2luZG93U2l6ZSAtIDE7IC8vIHRhYmxlIHNpemUgKHdpdGhvdXQgemVybylcbiAgY29uc3QgY2h1bmtzID0gTWF0aC5jZWlsKGZpZWxkTi5CSVRTIC8gd2luZG93U2l6ZSk7IC8vIGNodW5rcyBvZiBpdGVtXG4gIGNvbnN0IE1BU0sgPSBiaXRNYXNrKHdpbmRvd1NpemUpO1xuICBjb25zdCB0YWJsZXMgPSBwb2ludHMubWFwKChwOiBQKSA9PiB7XG4gICAgY29uc3QgcmVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDAsIGFjYyA9IHA7IGkgPCB0YWJsZVNpemU7IGkrKykge1xuICAgICAgcmVzLnB1c2goYWNjKTtcbiAgICAgIGFjYyA9IGFjYy5hZGQocCk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH0pO1xuICByZXR1cm4gKHNjYWxhcnM6IGJpZ2ludFtdKTogUCA9PiB7XG4gICAgdmFsaWRhdGVNU01TY2FsYXJzKHNjYWxhcnMsIGZpZWxkTik7XG4gICAgaWYgKHNjYWxhcnMubGVuZ3RoID4gcG9pbnRzLmxlbmd0aClcbiAgICAgIHRocm93IG5ldyBFcnJvcignYXJyYXkgb2Ygc2NhbGFycyBtdXN0IGJlIHNtYWxsZXIgdGhhbiBhcnJheSBvZiBwb2ludHMnKTtcbiAgICBsZXQgcmVzID0gemVybztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNodW5rczsgaSsrKSB7XG4gICAgICAvLyBObyBuZWVkIHRvIGRvdWJsZSBpZiBhY2N1bXVsYXRvciBpcyBzdGlsbCB6ZXJvLlxuICAgICAgaWYgKHJlcyAhPT0gemVybykgZm9yIChsZXQgaiA9IDA7IGogPCB3aW5kb3dTaXplOyBqKyspIHJlcyA9IHJlcy5kb3VibGUoKTtcbiAgICAgIGNvbnN0IHNoaWZ0QnkgPSBCaWdJbnQoY2h1bmtzICogd2luZG93U2l6ZSAtIChpICsgMSkgKiB3aW5kb3dTaXplKTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgc2NhbGFycy5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBuID0gc2NhbGFyc1tqXTtcbiAgICAgICAgY29uc3QgY3VyciA9IE51bWJlcigobiA+PiBzaGlmdEJ5KSAmIE1BU0spO1xuICAgICAgICBpZiAoIWN1cnIpIGNvbnRpbnVlOyAvLyBza2lwIHplcm8gc2NhbGFycyBjaHVua3NcbiAgICAgICAgcmVzID0gcmVzLmFkZCh0YWJsZXNbal1bY3VyciAtIDFdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgVmFsaWRDdXJ2ZVBhcmFtczxUPiA9IHtcbiAgcDogYmlnaW50O1xuICBuOiBiaWdpbnQ7XG4gIGg6IGJpZ2ludDtcbiAgYTogVDtcbiAgYj86IFQ7XG4gIGQ/OiBUO1xuICBHeDogVDtcbiAgR3k6IFQ7XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVGaWVsZDxUPihvcmRlcjogYmlnaW50LCBmaWVsZD86IElGaWVsZDxUPiwgaXNMRT86IGJvb2xlYW4pOiBJRmllbGQ8VD4ge1xuICBpZiAoZmllbGQpIHtcbiAgICBpZiAoZmllbGQuT1JERVIgIT09IG9yZGVyKSB0aHJvdyBuZXcgRXJyb3IoJ0ZpZWxkLk9SREVSIG11c3QgbWF0Y2ggb3JkZXI6IEZwID09IHAsIEZuID09IG4nKTtcbiAgICB2YWxpZGF0ZUZpZWxkKGZpZWxkKTtcbiAgICByZXR1cm4gZmllbGQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEZpZWxkKG9yZGVyLCB7IGlzTEUgfSkgYXMgdW5rbm93biBhcyBJRmllbGQ8VD47XG4gIH1cbn1cbmV4cG9ydCB0eXBlIEZwRm48VD4gPSB7IEZwOiBJRmllbGQ8VD47IEZuOiBJRmllbGQ8YmlnaW50PiB9O1xuXG4vKiogVmFsaWRhdGVzIENVUlZFIG9wdHMgYW5kIGNyZWF0ZXMgZmllbGRzICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ3VydmVGaWVsZHM8VD4oXG4gIHR5cGU6ICd3ZWllcnN0cmFzcycgfCAnZWR3YXJkcycsXG4gIENVUlZFOiBWYWxpZEN1cnZlUGFyYW1zPFQ+LFxuICBjdXJ2ZU9wdHM6IFBhcnRpYWw8RnBGbjxUPj4gPSB7fSxcbiAgRnBGbkxFPzogYm9vbGVhblxuKTogRnBGbjxUPiAmIHsgQ1VSVkU6IFZhbGlkQ3VydmVQYXJhbXM8VD4gfSB7XG4gIGlmIChGcEZuTEUgPT09IHVuZGVmaW5lZCkgRnBGbkxFID0gdHlwZSA9PT0gJ2Vkd2FyZHMnO1xuICBpZiAoIUNVUlZFIHx8IHR5cGVvZiBDVVJWRSAhPT0gJ29iamVjdCcpIHRocm93IG5ldyBFcnJvcihgZXhwZWN0ZWQgdmFsaWQgJHt0eXBlfSBDVVJWRSBvYmplY3RgKTtcbiAgZm9yIChjb25zdCBwIG9mIFsncCcsICduJywgJ2gnXSBhcyBjb25zdCkge1xuICAgIGNvbnN0IHZhbCA9IENVUlZFW3BdO1xuICAgIGlmICghKHR5cGVvZiB2YWwgPT09ICdiaWdpbnQnICYmIHZhbCA+IF8wbikpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENVUlZFLiR7cH0gbXVzdCBiZSBwb3NpdGl2ZSBiaWdpbnRgKTtcbiAgfVxuICBjb25zdCBGcCA9IGNyZWF0ZUZpZWxkKENVUlZFLnAsIGN1cnZlT3B0cy5GcCwgRnBGbkxFKTtcbiAgY29uc3QgRm4gPSBjcmVhdGVGaWVsZChDVVJWRS5uLCBjdXJ2ZU9wdHMuRm4sIEZwRm5MRSk7XG4gIGNvbnN0IF9iOiAnYicgfCAnZCcgPSB0eXBlID09PSAnd2VpZXJzdHJhc3MnID8gJ2InIDogJ2QnO1xuICBjb25zdCBwYXJhbXMgPSBbJ0d4JywgJ0d5JywgJ2EnLCBfYl0gYXMgY29uc3Q7XG4gIGZvciAoY29uc3QgcCBvZiBwYXJhbXMpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgaWYgKCFGcC5pc1ZhbGlkKENVUlZFW3BdKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ1VSVkUuJHtwfSBtdXN0IGJlIHZhbGlkIGZpZWxkIGVsZW1lbnQgb2YgQ1VSVkUuRnBgKTtcbiAgfVxuICBDVVJWRSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmFzc2lnbih7fSwgQ1VSVkUpKTtcbiAgcmV0dXJuIHsgQ1VSVkUsIEZwLCBGbiB9O1xufVxuXG50eXBlIEtleWdlbkZuID0gKFxuICBzZWVkPzogVWludDhBcnJheSxcbiAgaXNDb21wcmVzc2VkPzogYm9vbGVhblxuKSA9PiB7IHNlY3JldEtleTogVWludDhBcnJheTsgcHVibGljS2V5OiBVaW50OEFycmF5IH07XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlS2V5Z2VuKFxuICByYW5kb21TZWNyZXRLZXk6IEZ1bmN0aW9uLFxuICBnZXRQdWJsaWNLZXk6IFNpZ25lclsnZ2V0UHVibGljS2V5J11cbik6IEtleWdlbkZuIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGtleWdlbihzZWVkPzogVWludDhBcnJheSkge1xuICAgIGNvbnN0IHNlY3JldEtleSA9IHJhbmRvbVNlY3JldEtleShzZWVkKTtcbiAgICByZXR1cm4geyBzZWNyZXRLZXksIHB1YmxpY0tleTogZ2V0UHVibGljS2V5KHNlY3JldEtleSkgfTtcbiAgfTtcbn1cbiIsICIvKipcbiAqIEhleCwgYnl0ZXMgYW5kIG51bWJlciB1dGlsaXRpZXMuXG4gKiBAbW9kdWxlXG4gKi9cbi8qISBub2JsZS1jdXJ2ZXMgLSBNSVQgTGljZW5zZSAoYykgMjAyMiBQYXVsIE1pbGxlciAocGF1bG1pbGxyLmNvbSkgKi9cbmltcG9ydCB7XG4gIGFieXRlcyBhcyBhYnl0ZXNfLFxuICBhbnVtYmVyLFxuICBieXRlc1RvSGV4IGFzIGJ5dGVzVG9IZXhfLFxuICBjb25jYXRCeXRlcyBhcyBjb25jYXRCeXRlc18sXG4gIGhleFRvQnl0ZXMgYXMgaGV4VG9CeXRlc18sXG59IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuZXhwb3J0IHtcbiAgYWJ5dGVzLFxuICBhbnVtYmVyLFxuICBieXRlc1RvSGV4LFxuICBjb25jYXRCeXRlcyxcbiAgaGV4VG9CeXRlcyxcbiAgaXNCeXRlcyxcbiAgcmFuZG9tQnl0ZXMsXG59IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuY29uc3QgXzBuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgwKTtcbmNvbnN0IF8xbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMSk7XG5cbmV4cG9ydCB0eXBlIENIYXNoID0ge1xuICAobWVzc2FnZTogVWludDhBcnJheSk6IFVpbnQ4QXJyYXk7XG4gIGJsb2NrTGVuOiBudW1iZXI7XG4gIG91dHB1dExlbjogbnVtYmVyO1xuICBjcmVhdGUob3B0cz86IHsgZGtMZW4/OiBudW1iZXIgfSk6IGFueTsgLy8gRm9yIHNoYWtlXG59O1xuZXhwb3J0IHR5cGUgRkhhc2ggPSAobWVzc2FnZTogVWludDhBcnJheSkgPT4gVWludDhBcnJheTtcbmV4cG9ydCBmdW5jdGlvbiBhYm9vbCh2YWx1ZTogYm9vbGVhbiwgdGl0bGU6IHN0cmluZyA9ICcnKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdib29sZWFuJykge1xuICAgIGNvbnN0IHByZWZpeCA9IHRpdGxlICYmIGBcIiR7dGl0bGV9XCIgYDtcbiAgICB0aHJvdyBuZXcgRXJyb3IocHJlZml4ICsgJ2V4cGVjdGVkIGJvb2xlYW4sIGdvdCB0eXBlPScgKyB0eXBlb2YgdmFsdWUpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLy8gVXNlZCBpbiB3ZWllcnN0cmFzcywgZGVyXG5mdW5jdGlvbiBhYmlnbnVtYmVyKG46IG51bWJlciB8IGJpZ2ludCkge1xuICBpZiAodHlwZW9mIG4gPT09ICdiaWdpbnQnKSB7XG4gICAgaWYgKCFpc1Bvc0JpZyhuKSkgdGhyb3cgbmV3IEVycm9yKCdwb3NpdGl2ZSBiaWdpbnQgZXhwZWN0ZWQsIGdvdCAnICsgbik7XG4gIH0gZWxzZSBhbnVtYmVyKG4pO1xuICByZXR1cm4gbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzYWZlbnVtYmVyKHZhbHVlOiBudW1iZXIsIHRpdGxlOiBzdHJpbmcgPSAnJyk6IHZvaWQge1xuICBpZiAoIU51bWJlci5pc1NhZmVJbnRlZ2VyKHZhbHVlKSkge1xuICAgIGNvbnN0IHByZWZpeCA9IHRpdGxlICYmIGBcIiR7dGl0bGV9XCIgYDtcbiAgICB0aHJvdyBuZXcgRXJyb3IocHJlZml4ICsgJ2V4cGVjdGVkIHNhZmUgaW50ZWdlciwgZ290IHR5cGU9JyArIHR5cGVvZiB2YWx1ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG51bWJlclRvSGV4VW5wYWRkZWQobnVtOiBudW1iZXIgfCBiaWdpbnQpOiBzdHJpbmcge1xuICBjb25zdCBoZXggPSBhYmlnbnVtYmVyKG51bSkudG9TdHJpbmcoMTYpO1xuICByZXR1cm4gaGV4Lmxlbmd0aCAmIDEgPyAnMCcgKyBoZXggOiBoZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoZXhUb051bWJlcihoZXg6IHN0cmluZyk6IGJpZ2ludCB7XG4gIGlmICh0eXBlb2YgaGV4ICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdoZXggc3RyaW5nIGV4cGVjdGVkLCBnb3QgJyArIHR5cGVvZiBoZXgpO1xuICByZXR1cm4gaGV4ID09PSAnJyA/IF8wbiA6IEJpZ0ludCgnMHgnICsgaGV4KTsgLy8gQmlnIEVuZGlhblxufVxuXG4vLyBCRTogQmlnIEVuZGlhbiwgTEU6IExpdHRsZSBFbmRpYW5cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvTnVtYmVyQkUoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBiaWdpbnQge1xuICByZXR1cm4gaGV4VG9OdW1iZXIoYnl0ZXNUb0hleF8oYnl0ZXMpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvTnVtYmVyTEUoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBiaWdpbnQge1xuICByZXR1cm4gaGV4VG9OdW1iZXIoYnl0ZXNUb0hleF8oY29weUJ5dGVzKGFieXRlc18oYnl0ZXMpKS5yZXZlcnNlKCkpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG51bWJlclRvQnl0ZXNCRShuOiBudW1iZXIgfCBiaWdpbnQsIGxlbjogbnVtYmVyKTogVWludDhBcnJheSB7XG4gIGFudW1iZXIobGVuKTtcbiAgbiA9IGFiaWdudW1iZXIobik7XG4gIGNvbnN0IHJlcyA9IGhleFRvQnl0ZXNfKG4udG9TdHJpbmcoMTYpLnBhZFN0YXJ0KGxlbiAqIDIsICcwJykpO1xuICBpZiAocmVzLmxlbmd0aCAhPT0gbGVuKSB0aHJvdyBuZXcgRXJyb3IoJ251bWJlciB0b28gbGFyZ2UnKTtcbiAgcmV0dXJuIHJlcztcbn1cbmV4cG9ydCBmdW5jdGlvbiBudW1iZXJUb0J5dGVzTEUobjogbnVtYmVyIHwgYmlnaW50LCBsZW46IG51bWJlcik6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gbnVtYmVyVG9CeXRlc0JFKG4sIGxlbikucmV2ZXJzZSgpO1xufVxuLy8gVW5wYWRkZWQsIHJhcmVseSB1c2VkXG5leHBvcnQgZnVuY3Rpb24gbnVtYmVyVG9WYXJCeXRlc0JFKG46IG51bWJlciB8IGJpZ2ludCk6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gaGV4VG9CeXRlc18obnVtYmVyVG9IZXhVbnBhZGRlZChhYmlnbnVtYmVyKG4pKSk7XG59XG5cbi8vIENvbXBhcmVzIDIgdThhLXMgaW4ga2luZGEgY29uc3RhbnQgdGltZVxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsQnl0ZXMoYTogVWludDhBcnJheSwgYjogVWludDhBcnJheSk6IGJvb2xlYW4ge1xuICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gIGxldCBkaWZmID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSBkaWZmIHw9IGFbaV0gXiBiW2ldO1xuICByZXR1cm4gZGlmZiA9PT0gMDtcbn1cblxuLyoqXG4gKiBDb3BpZXMgVWludDhBcnJheS4gV2UgY2FuJ3QgdXNlIHU4YS5zbGljZSgpLCBiZWNhdXNlIHU4YSBjYW4gYmUgQnVmZmVyLFxuICogYW5kIEJ1ZmZlciNzbGljZSBjcmVhdGVzIG11dGFibGUgY29weS4gTmV2ZXIgdXNlIEJ1ZmZlcnMhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5Qnl0ZXMoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIFVpbnQ4QXJyYXkuZnJvbShieXRlcyk7XG59XG5cbi8qKlxuICogRGVjb2RlcyA3LWJpdCBBU0NJSSBzdHJpbmcgdG8gVWludDhBcnJheSwgdGhyb3dzIG9uIG5vbi1hc2NpaSBzeW1ib2xzXG4gKiBTaG91bGQgYmUgc2FmZSB0byB1c2UgZm9yIHRoaW5ncyBleHBlY3RlZCB0byBiZSBBU0NJSS5cbiAqIFJldHVybnMgZXhhY3Qgc2FtZSByZXN1bHQgYXMgYFRleHRFbmNvZGVyYCBmb3IgQVNDSUkgb3IgdGhyb3dzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNjaWlUb0J5dGVzKGFzY2lpOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIFVpbnQ4QXJyYXkuZnJvbShhc2NpaSwgKGMsIGkpID0+IHtcbiAgICBjb25zdCBjaGFyQ29kZSA9IGMuY2hhckNvZGVBdCgwKTtcbiAgICBpZiAoYy5sZW5ndGggIT09IDEgfHwgY2hhckNvZGUgPiAxMjcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYHN0cmluZyBjb250YWlucyBub24tQVNDSUkgY2hhcmFjdGVyIFwiJHthc2NpaVtpXX1cIiB3aXRoIGNvZGUgJHtjaGFyQ29kZX0gYXQgcG9zaXRpb24gJHtpfWBcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBjaGFyQ29kZTtcbiAgfSk7XG59XG5cbi8vIElzIHBvc2l0aXZlIGJpZ2ludFxuY29uc3QgaXNQb3NCaWcgPSAobjogYmlnaW50KSA9PiB0eXBlb2YgbiA9PT0gJ2JpZ2ludCcgJiYgXzBuIDw9IG47XG5cbmV4cG9ydCBmdW5jdGlvbiBpblJhbmdlKG46IGJpZ2ludCwgbWluOiBiaWdpbnQsIG1heDogYmlnaW50KTogYm9vbGVhbiB7XG4gIHJldHVybiBpc1Bvc0JpZyhuKSAmJiBpc1Bvc0JpZyhtaW4pICYmIGlzUG9zQmlnKG1heCkgJiYgbWluIDw9IG4gJiYgbiA8IG1heDtcbn1cblxuLyoqXG4gKiBBc3NlcnRzIG1pbiA8PSBuIDwgbWF4LiBOT1RFOiBJdCdzIDwgbWF4IGFuZCBub3QgPD0gbWF4LlxuICogQGV4YW1wbGVcbiAqIGFJblJhbmdlKCd4JywgeCwgMW4sIDI1Nm4pOyAvLyB3b3VsZCBhc3N1bWUgeCBpcyBpbiAoMW4uLjI1NW4pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhSW5SYW5nZSh0aXRsZTogc3RyaW5nLCBuOiBiaWdpbnQsIG1pbjogYmlnaW50LCBtYXg6IGJpZ2ludCk6IHZvaWQge1xuICAvLyBXaHkgbWluIDw9IG4gPCBtYXggYW5kIG5vdCBhIChtaW4gPCBuIDwgbWF4KSBPUiBiIChtaW4gPD0gbiA8PSBtYXgpP1xuICAvLyBjb25zaWRlciBQPTI1Nm4sIG1pbj0wbiwgbWF4PVBcbiAgLy8gLSBhIGZvciBtaW49MCB3b3VsZCByZXF1aXJlIC0xOiAgICAgICAgICBgaW5SYW5nZSgneCcsIHgsIC0xbiwgUClgXG4gIC8vIC0gYiB3b3VsZCBjb21tb25seSByZXF1aXJlIHN1YnRyYWN0aW9uOiAgYGluUmFuZ2UoJ3gnLCB4LCAwbiwgUCAtIDFuKWBcbiAgLy8gLSBvdXIgd2F5IGlzIHRoZSBjbGVhbmVzdDogICAgICAgICAgICAgICBgaW5SYW5nZSgneCcsIHgsIDBuLCBQKVxuICBpZiAoIWluUmFuZ2UobiwgbWluLCBtYXgpKVxuICAgIHRocm93IG5ldyBFcnJvcignZXhwZWN0ZWQgdmFsaWQgJyArIHRpdGxlICsgJzogJyArIG1pbiArICcgPD0gbiA8ICcgKyBtYXggKyAnLCBnb3QgJyArIG4pO1xufVxuXG4vLyBCaXQgb3BlcmF0aW9uc1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgYW1vdW50IG9mIGJpdHMgaW4gYSBiaWdpbnQuXG4gKiBTYW1lIGFzIGBuLnRvU3RyaW5nKDIpLmxlbmd0aGBcbiAqIFRPRE86IG1lcmdlIHdpdGggbkxlbmd0aCBpbiBtb2R1bGFyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaXRMZW4objogYmlnaW50KTogbnVtYmVyIHtcbiAgbGV0IGxlbjtcbiAgZm9yIChsZW4gPSAwOyBuID4gXzBuOyBuID4+PSBfMW4sIGxlbiArPSAxKTtcbiAgcmV0dXJuIGxlbjtcbn1cblxuLyoqXG4gKiBHZXRzIHNpbmdsZSBiaXQgYXQgcG9zaXRpb24uXG4gKiBOT1RFOiBmaXJzdCBiaXQgcG9zaXRpb24gaXMgMCAoc2FtZSBhcyBhcnJheXMpXG4gKiBTYW1lIGFzIGAhIStBcnJheS5mcm9tKG4udG9TdHJpbmcoMikpLnJldmVyc2UoKVtwb3NdYFxuICovXG5leHBvcnQgZnVuY3Rpb24gYml0R2V0KG46IGJpZ2ludCwgcG9zOiBudW1iZXIpOiBiaWdpbnQge1xuICByZXR1cm4gKG4gPj4gQmlnSW50KHBvcykpICYgXzFuO1xufVxuXG4vKipcbiAqIFNldHMgc2luZ2xlIGJpdCBhdCBwb3NpdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpdFNldChuOiBiaWdpbnQsIHBvczogbnVtYmVyLCB2YWx1ZTogYm9vbGVhbik6IGJpZ2ludCB7XG4gIHJldHVybiBuIHwgKCh2YWx1ZSA/IF8xbiA6IF8wbikgPDwgQmlnSW50KHBvcykpO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZSBtYXNrIGZvciBOIGJpdHMuIE5vdCB1c2luZyAqKiBvcGVyYXRvciB3aXRoIGJpZ2ludHMgYmVjYXVzZSBvZiBvbGQgZW5naW5lcy5cbiAqIFNhbWUgYXMgQmlnSW50KGAwYiR7QXJyYXkoaSkuZmlsbCgnMScpLmpvaW4oJycpfWApXG4gKi9cbmV4cG9ydCBjb25zdCBiaXRNYXNrID0gKG46IG51bWJlcik6IGJpZ2ludCA9PiAoXzFuIDw8IEJpZ0ludChuKSkgLSBfMW47XG5cbi8vIERSQkdcblxudHlwZSBQcmVkPFQ+ID0gKHY6IFVpbnQ4QXJyYXkpID0+IFQgfCB1bmRlZmluZWQ7XG4vKipcbiAqIE1pbmltYWwgSE1BQy1EUkJHIGZyb20gTklTVCA4MDAtOTAgZm9yIFJGQzY5Nzkgc2lncy5cbiAqIEByZXR1cm5zIGZ1bmN0aW9uIHRoYXQgd2lsbCBjYWxsIERSQkcgdW50aWwgMm5kIGFyZyByZXR1cm5zIHNvbWV0aGluZyBtZWFuaW5nZnVsXG4gKiBAZXhhbXBsZVxuICogICBjb25zdCBkcmJnID0gY3JlYXRlSG1hY0RSQkc8S2V5PigzMiwgMzIsIGhtYWMpO1xuICogICBkcmJnKHNlZWQsIGJ5dGVzVG9LZXkpOyAvLyBieXRlc1RvS2V5IG11c3QgcmV0dXJuIEtleSBvciB1bmRlZmluZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhtYWNEcmJnPFQ+KFxuICBoYXNoTGVuOiBudW1iZXIsXG4gIHFCeXRlTGVuOiBudW1iZXIsXG4gIGhtYWNGbjogKGtleTogVWludDhBcnJheSwgbWVzc2FnZTogVWludDhBcnJheSkgPT4gVWludDhBcnJheVxuKTogKHNlZWQ6IFVpbnQ4QXJyYXksIHByZWRpY2F0ZTogUHJlZDxUPikgPT4gVCB7XG4gIGFudW1iZXIoaGFzaExlbiwgJ2hhc2hMZW4nKTtcbiAgYW51bWJlcihxQnl0ZUxlbiwgJ3FCeXRlTGVuJyk7XG4gIGlmICh0eXBlb2YgaG1hY0ZuICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgRXJyb3IoJ2htYWNGbiBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgY29uc3QgdThuID0gKGxlbjogbnVtYmVyKTogVWludDhBcnJheSA9PiBuZXcgVWludDhBcnJheShsZW4pOyAvLyBjcmVhdGVzIFVpbnQ4QXJyYXlcbiAgY29uc3QgTlVMTCA9IFVpbnQ4QXJyYXkub2YoKTtcbiAgY29uc3QgYnl0ZTAgPSBVaW50OEFycmF5Lm9mKDB4MDApO1xuICBjb25zdCBieXRlMSA9IFVpbnQ4QXJyYXkub2YoMHgwMSk7XG4gIGNvbnN0IF9tYXhEcmJnSXRlcnMgPSAxMDAwO1xuXG4gIC8vIFN0ZXAgQiwgU3RlcCBDOiBzZXQgaGFzaExlbiB0byA4KmNlaWwoaGxlbi84KVxuICBsZXQgdiA9IHU4bihoYXNoTGVuKTsgLy8gTWluaW1hbCBub24tZnVsbC1zcGVjIEhNQUMtRFJCRyBmcm9tIE5JU1QgODAwLTkwIGZvciBSRkM2OTc5IHNpZ3MuXG4gIGxldCBrID0gdThuKGhhc2hMZW4pOyAvLyBTdGVwcyBCIGFuZCBDIG9mIFJGQzY5NzkgMy4yOiBzZXQgaGFzaExlbiwgaW4gb3VyIGNhc2UgYWx3YXlzIHNhbWVcbiAgbGV0IGkgPSAwOyAvLyBJdGVyYXRpb25zIGNvdW50ZXIsIHdpbGwgdGhyb3cgd2hlbiBvdmVyIDEwMDBcbiAgY29uc3QgcmVzZXQgPSAoKSA9PiB7XG4gICAgdi5maWxsKDEpO1xuICAgIGsuZmlsbCgwKTtcbiAgICBpID0gMDtcbiAgfTtcbiAgY29uc3QgaCA9ICguLi5tc2dzOiBVaW50OEFycmF5W10pID0+IGhtYWNGbihrLCBjb25jYXRCeXRlc18odiwgLi4ubXNncykpOyAvLyBobWFjKGspKHYsIC4uLnZhbHVlcylcbiAgY29uc3QgcmVzZWVkID0gKHNlZWQ6IFVpbnQ4QXJyYXkgPSBOVUxMKSA9PiB7XG4gICAgLy8gSE1BQy1EUkJHIHJlc2VlZCgpIGZ1bmN0aW9uLiBTdGVwcyBELUdcbiAgICBrID0gaChieXRlMCwgc2VlZCk7IC8vIGsgPSBobWFjKGsgfHwgdiB8fCAweDAwIHx8IHNlZWQpXG4gICAgdiA9IGgoKTsgLy8gdiA9IGhtYWMoayB8fCB2KVxuICAgIGlmIChzZWVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgIGsgPSBoKGJ5dGUxLCBzZWVkKTsgLy8gayA9IGhtYWMoayB8fCB2IHx8IDB4MDEgfHwgc2VlZClcbiAgICB2ID0gaCgpOyAvLyB2ID0gaG1hYyhrIHx8IHYpXG4gIH07XG4gIGNvbnN0IGdlbiA9ICgpID0+IHtcbiAgICAvLyBITUFDLURSQkcgZ2VuZXJhdGUoKSBmdW5jdGlvblxuICAgIGlmIChpKysgPj0gX21heERyYmdJdGVycykgdGhyb3cgbmV3IEVycm9yKCdkcmJnOiB0cmllZCBtYXggYW1vdW50IG9mIGl0ZXJhdGlvbnMnKTtcbiAgICBsZXQgbGVuID0gMDtcbiAgICBjb25zdCBvdXQ6IFVpbnQ4QXJyYXlbXSA9IFtdO1xuICAgIHdoaWxlIChsZW4gPCBxQnl0ZUxlbikge1xuICAgICAgdiA9IGgoKTtcbiAgICAgIGNvbnN0IHNsID0gdi5zbGljZSgpO1xuICAgICAgb3V0LnB1c2goc2wpO1xuICAgICAgbGVuICs9IHYubGVuZ3RoO1xuICAgIH1cbiAgICByZXR1cm4gY29uY2F0Qnl0ZXNfKC4uLm91dCk7XG4gIH07XG4gIGNvbnN0IGdlblVudGlsID0gKHNlZWQ6IFVpbnQ4QXJyYXksIHByZWQ6IFByZWQ8VD4pOiBUID0+IHtcbiAgICByZXNldCgpO1xuICAgIHJlc2VlZChzZWVkKTsgLy8gU3RlcHMgRC1HXG4gICAgbGV0IHJlczogVCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDsgLy8gU3RlcCBIOiBncmluZCB1bnRpbCBrIGlzIGluIFsxLi5uLTFdXG4gICAgd2hpbGUgKCEocmVzID0gcHJlZChnZW4oKSkpKSByZXNlZWQoKTtcbiAgICByZXNldCgpO1xuICAgIHJldHVybiByZXM7XG4gIH07XG4gIHJldHVybiBnZW5VbnRpbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlT2JqZWN0KFxuICBvYmplY3Q6IFJlY29yZDxzdHJpbmcsIGFueT4sXG4gIGZpZWxkczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9LFxuICBvcHRGaWVsZHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fVxuKTogdm9pZCB7XG4gIGlmICghb2JqZWN0IHx8IHR5cGVvZiBvYmplY3QgIT09ICdvYmplY3QnKSB0aHJvdyBuZXcgRXJyb3IoJ2V4cGVjdGVkIHZhbGlkIG9wdGlvbnMgb2JqZWN0Jyk7XG4gIHR5cGUgSXRlbSA9IGtleW9mIHR5cGVvZiBvYmplY3Q7XG4gIGZ1bmN0aW9uIGNoZWNrRmllbGQoZmllbGROYW1lOiBJdGVtLCBleHBlY3RlZFR5cGU6IHN0cmluZywgaXNPcHQ6IGJvb2xlYW4pIHtcbiAgICBjb25zdCB2YWwgPSBvYmplY3RbZmllbGROYW1lXTtcbiAgICBpZiAoaXNPcHQgJiYgdmFsID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICBjb25zdCBjdXJyZW50ID0gdHlwZW9mIHZhbDtcbiAgICBpZiAoY3VycmVudCAhPT0gZXhwZWN0ZWRUeXBlIHx8IHZhbCA9PT0gbnVsbClcbiAgICAgIHRocm93IG5ldyBFcnJvcihgcGFyYW0gXCIke2ZpZWxkTmFtZX1cIiBpcyBpbnZhbGlkOiBleHBlY3RlZCAke2V4cGVjdGVkVHlwZX0sIGdvdCAke2N1cnJlbnR9YCk7XG4gIH1cbiAgY29uc3QgaXRlciA9IChmOiB0eXBlb2YgZmllbGRzLCBpc09wdDogYm9vbGVhbikgPT5cbiAgICBPYmplY3QuZW50cmllcyhmKS5mb3JFYWNoKChbaywgdl0pID0+IGNoZWNrRmllbGQoaywgdiwgaXNPcHQpKTtcbiAgaXRlcihmaWVsZHMsIGZhbHNlKTtcbiAgaXRlcihvcHRGaWVsZHMsIHRydWUpO1xufVxuXG4vKipcbiAqIHRocm93cyBub3QgaW1wbGVtZW50ZWQgZXJyb3JcbiAqL1xuZXhwb3J0IGNvbnN0IG5vdEltcGxlbWVudGVkID0gKCk6IG5ldmVyID0+IHtcbiAgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTtcbn07XG5cbi8qKlxuICogTWVtb2l6ZXMgKGNhY2hlcykgY29tcHV0YXRpb24gcmVzdWx0LlxuICogVXNlcyBXZWFrTWFwOiB0aGUgdmFsdWUgaXMgZ29pbmcgYXV0by1jbGVhbmVkIGJ5IEdDIGFmdGVyIGxhc3QgcmVmZXJlbmNlIGlzIHJlbW92ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZW1vaXplZDxUIGV4dGVuZHMgb2JqZWN0LCBSLCBPIGV4dGVuZHMgYW55W10+KFxuICBmbjogKGFyZzogVCwgLi4uYXJnczogTykgPT4gUlxuKTogKGFyZzogVCwgLi4uYXJnczogTykgPT4gUiB7XG4gIGNvbnN0IG1hcCA9IG5ldyBXZWFrTWFwPFQsIFI+KCk7XG4gIHJldHVybiAoYXJnOiBULCAuLi5hcmdzOiBPKTogUiA9PiB7XG4gICAgY29uc3QgdmFsID0gbWFwLmdldChhcmcpO1xuICAgIGlmICh2YWwgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHZhbDtcbiAgICBjb25zdCBjb21wdXRlZCA9IGZuKGFyZywgLi4uYXJncyk7XG4gICAgbWFwLnNldChhcmcsIGNvbXB1dGVkKTtcbiAgICByZXR1cm4gY29tcHV0ZWQ7XG4gIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3J5cHRvS2V5cyB7XG4gIGxlbmd0aHM6IHsgc2VlZD86IG51bWJlcjsgcHVibGljPzogbnVtYmVyOyBzZWNyZXQ/OiBudW1iZXIgfTtcbiAga2V5Z2VuOiAoc2VlZD86IFVpbnQ4QXJyYXkpID0+IHsgc2VjcmV0S2V5OiBVaW50OEFycmF5OyBwdWJsaWNLZXk6IFVpbnQ4QXJyYXkgfTtcbiAgZ2V0UHVibGljS2V5OiAoc2VjcmV0S2V5OiBVaW50OEFycmF5KSA9PiBVaW50OEFycmF5O1xufVxuXG4vKiogR2VuZXJpYyBpbnRlcmZhY2UgZm9yIHNpZ25hdHVyZXMuIEhhcyBrZXlnZW4sIHNpZ24gYW5kIHZlcmlmeS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmVyIGV4dGVuZHMgQ3J5cHRvS2V5cyB7XG4gIC8vIEludGVyZmFjZXMgYXJlIGZ1bi4gV2UgY2Fubm90IGp1c3QgYWRkIG5ldyBmaWVsZHMgd2l0aG91dCBjb3B5aW5nIG9sZCBvbmVzLlxuICBsZW5ndGhzOiB7XG4gICAgc2VlZD86IG51bWJlcjtcbiAgICBwdWJsaWM/OiBudW1iZXI7XG4gICAgc2VjcmV0PzogbnVtYmVyO1xuICAgIHNpZ25SYW5kPzogbnVtYmVyO1xuICAgIHNpZ25hdHVyZT86IG51bWJlcjtcbiAgfTtcbiAgc2lnbjogKG1zZzogVWludDhBcnJheSwgc2VjcmV0S2V5OiBVaW50OEFycmF5KSA9PiBVaW50OEFycmF5O1xuICB2ZXJpZnk6IChzaWc6IFVpbnQ4QXJyYXksIG1zZzogVWludDhBcnJheSwgcHVibGljS2V5OiBVaW50OEFycmF5KSA9PiBib29sZWFuO1xufVxuIiwgIi8qKlxuICogVXRpbHMgZm9yIG1vZHVsYXIgZGl2aXNpb24gYW5kIGZpZWxkcy5cbiAqIEZpZWxkIG92ZXIgMTEgaXMgYSBmaW5pdGUgKEdhbG9pcykgZmllbGQgaXMgaW50ZWdlciBudW1iZXIgb3BlcmF0aW9ucyBgbW9kIDExYC5cbiAqIFRoZXJlIGlzIG5vIGRpdmlzaW9uOiBpdCBpcyByZXBsYWNlZCBieSBtb2R1bGFyIG11bHRpcGxpY2F0aXZlIGludmVyc2UuXG4gKiBAbW9kdWxlXG4gKi9cbi8qISBub2JsZS1jdXJ2ZXMgLSBNSVQgTGljZW5zZSAoYykgMjAyMiBQYXVsIE1pbGxlciAocGF1bG1pbGxyLmNvbSkgKi9cbmltcG9ydCB7XG4gIGFieXRlcyxcbiAgYW51bWJlcixcbiAgYnl0ZXNUb051bWJlckJFLFxuICBieXRlc1RvTnVtYmVyTEUsXG4gIG51bWJlclRvQnl0ZXNCRSxcbiAgbnVtYmVyVG9CeXRlc0xFLFxuICB2YWxpZGF0ZU9iamVjdCxcbn0gZnJvbSAnLi4vdXRpbHMudHMnO1xuXG4vLyBOdW1iZXJzIGFyZW4ndCB1c2VkIGluIHgyNTUxOSAvIHg0NDggYnVpbGRzXG4vLyBwcmV0dGllci1pZ25vcmVcbmNvbnN0IF8wbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMCksIF8xbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMSksIF8ybiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMik7XG4vLyBwcmV0dGllci1pZ25vcmVcbmNvbnN0IF8zbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMyksIF80biA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoNCksIF81biA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoNSk7XG4vLyBwcmV0dGllci1pZ25vcmVcbmNvbnN0IF83biA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoNyksIF84biA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoOCksIF85biA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoOSk7XG5jb25zdCBfMTZuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgxNik7XG5cbi8vIENhbGN1bGF0ZXMgYSBtb2R1bG8gYlxuZXhwb3J0IGZ1bmN0aW9uIG1vZChhOiBiaWdpbnQsIGI6IGJpZ2ludCk6IGJpZ2ludCB7XG4gIGNvbnN0IHJlc3VsdCA9IGEgJSBiO1xuICByZXR1cm4gcmVzdWx0ID49IF8wbiA/IHJlc3VsdCA6IGIgKyByZXN1bHQ7XG59XG4vKipcbiAqIEVmZmljaWVudGx5IHJhaXNlIG51bSB0byBwb3dlciBhbmQgZG8gbW9kdWxhciBkaXZpc2lvbi5cbiAqIFVuc2FmZSBpbiBzb21lIGNvbnRleHRzOiB1c2VzIGxhZGRlciwgc28gY2FuIGV4cG9zZSBiaWdpbnQgYml0cy5cbiAqIEBleGFtcGxlXG4gKiBwb3coMm4sIDZuLCAxMW4pIC8vIDY0biAlIDExbiA9PSA5blxuICovXG5leHBvcnQgZnVuY3Rpb24gcG93KG51bTogYmlnaW50LCBwb3dlcjogYmlnaW50LCBtb2R1bG86IGJpZ2ludCk6IGJpZ2ludCB7XG4gIHJldHVybiBGcFBvdyhGaWVsZChtb2R1bG8pLCBudW0sIHBvd2VyKTtcbn1cblxuLyoqIERvZXMgYHheKDJecG93ZXIpYCBtb2QgcC4gYHBvdzIoMzAsIDQpYCA9PSBgMzBeKDJeNClgICovXG5leHBvcnQgZnVuY3Rpb24gcG93Mih4OiBiaWdpbnQsIHBvd2VyOiBiaWdpbnQsIG1vZHVsbzogYmlnaW50KTogYmlnaW50IHtcbiAgbGV0IHJlcyA9IHg7XG4gIHdoaWxlIChwb3dlci0tID4gXzBuKSB7XG4gICAgcmVzICo9IHJlcztcbiAgICByZXMgJT0gbW9kdWxvO1xuICB9XG4gIHJldHVybiByZXM7XG59XG5cbi8qKlxuICogSW52ZXJzZXMgbnVtYmVyIG92ZXIgbW9kdWxvLlxuICogSW1wbGVtZW50ZWQgdXNpbmcgW0V1Y2xpZGVhbiBHQ0RdKGh0dHBzOi8vYnJpbGxpYW50Lm9yZy93aWtpL2V4dGVuZGVkLWV1Y2xpZGVhbi1hbGdvcml0aG0vKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVydChudW1iZXI6IGJpZ2ludCwgbW9kdWxvOiBiaWdpbnQpOiBiaWdpbnQge1xuICBpZiAobnVtYmVyID09PSBfMG4pIHRocm93IG5ldyBFcnJvcignaW52ZXJ0OiBleHBlY3RlZCBub24temVybyBudW1iZXInKTtcbiAgaWYgKG1vZHVsbyA8PSBfMG4pIHRocm93IG5ldyBFcnJvcignaW52ZXJ0OiBleHBlY3RlZCBwb3NpdGl2ZSBtb2R1bHVzLCBnb3QgJyArIG1vZHVsbyk7XG4gIC8vIEZlcm1hdCdzIGxpdHRsZSB0aGVvcmVtIFwiQ1QtbGlrZVwiIHZlcnNpb24gaW52KG4pID0gbl4obS0yKSBtb2QgbSBpcyAzMHggc2xvd2VyLlxuICBsZXQgYSA9IG1vZChudW1iZXIsIG1vZHVsbyk7XG4gIGxldCBiID0gbW9kdWxvO1xuICAvLyBwcmV0dGllci1pZ25vcmVcbiAgbGV0IHggPSBfMG4sIHkgPSBfMW4sIHUgPSBfMW4sIHYgPSBfMG47XG4gIHdoaWxlIChhICE9PSBfMG4pIHtcbiAgICAvLyBKSVQgYXBwbGllcyBvcHRpbWl6YXRpb24gaWYgdGhvc2UgdHdvIGxpbmVzIGZvbGxvdyBlYWNoIG90aGVyXG4gICAgY29uc3QgcSA9IGIgLyBhO1xuICAgIGNvbnN0IHIgPSBiICUgYTtcbiAgICBjb25zdCBtID0geCAtIHUgKiBxO1xuICAgIGNvbnN0IG4gPSB5IC0gdiAqIHE7XG4gICAgLy8gcHJldHRpZXItaWdub3JlXG4gICAgYiA9IGEsIGEgPSByLCB4ID0gdSwgeSA9IHYsIHUgPSBtLCB2ID0gbjtcbiAgfVxuICBjb25zdCBnY2QgPSBiO1xuICBpZiAoZ2NkICE9PSBfMW4pIHRocm93IG5ldyBFcnJvcignaW52ZXJ0OiBkb2VzIG5vdCBleGlzdCcpO1xuICByZXR1cm4gbW9kKHgsIG1vZHVsbyk7XG59XG5cbmZ1bmN0aW9uIGFzc2VydElzU3F1YXJlPFQ+KEZwOiBJRmllbGQ8VD4sIHJvb3Q6IFQsIG46IFQpOiB2b2lkIHtcbiAgaWYgKCFGcC5lcWwoRnAuc3FyKHJvb3QpLCBuKSkgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBzcXVhcmUgcm9vdCcpO1xufVxuXG4vLyBOb3QgYWxsIHJvb3RzIGFyZSBwb3NzaWJsZSEgRXhhbXBsZSB3aGljaCB3aWxsIHRocm93OlxuLy8gY29uc3QgTlVNID1cbi8vIG4gPSA3MjA1NzU5NDAzNzkyNzgxNm47XG4vLyBGcCA9IEZpZWxkKEJpZ0ludCgnMHgxYTAxMTFlYTM5N2ZlNjlhNGIxYmE3YjY0MzRiYWNkNzY0Nzc0Yjg0ZjM4NTEyYmY2NzMwZDJhMGY2YjBmNjI0MWVhYmZmZmViMTUzZmZmZmI5ZmVmZmZmZmZmZmFhYWInKSk7XG5mdW5jdGlvbiBzcXJ0M21vZDQ8VD4oRnA6IElGaWVsZDxUPiwgbjogVCkge1xuICBjb25zdCBwMWRpdjQgPSAoRnAuT1JERVIgKyBfMW4pIC8gXzRuO1xuICBjb25zdCByb290ID0gRnAucG93KG4sIHAxZGl2NCk7XG4gIGFzc2VydElzU3F1YXJlKEZwLCByb290LCBuKTtcbiAgcmV0dXJuIHJvb3Q7XG59XG5cbmZ1bmN0aW9uIHNxcnQ1bW9kODxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKSB7XG4gIGNvbnN0IHA1ZGl2OCA9IChGcC5PUkRFUiAtIF81bikgLyBfOG47XG4gIGNvbnN0IG4yID0gRnAubXVsKG4sIF8ybik7XG4gIGNvbnN0IHYgPSBGcC5wb3cobjIsIHA1ZGl2OCk7XG4gIGNvbnN0IG52ID0gRnAubXVsKG4sIHYpO1xuICBjb25zdCBpID0gRnAubXVsKEZwLm11bChudiwgXzJuKSwgdik7XG4gIGNvbnN0IHJvb3QgPSBGcC5tdWwobnYsIEZwLnN1YihpLCBGcC5PTkUpKTtcbiAgYXNzZXJ0SXNTcXVhcmUoRnAsIHJvb3QsIG4pO1xuICByZXR1cm4gcm9vdDtcbn1cblxuLy8gQmFzZWQgb24gUkZDOTM4MCwgS29uZyBhbGdvcml0aG1cbi8vIHByZXR0aWVyLWlnbm9yZVxuZnVuY3Rpb24gc3FydDltb2QxNihQOiBiaWdpbnQpOiA8VD4oRnA6IElGaWVsZDxUPiwgbjogVCkgPT4gVCB7XG4gIGNvbnN0IEZwXyA9IEZpZWxkKFApO1xuICBjb25zdCB0biA9IHRvbmVsbGlTaGFua3MoUCk7XG4gIGNvbnN0IGMxID0gdG4oRnBfLCBGcF8ubmVnKEZwXy5PTkUpKTsvLyAgMS4gYzEgPSBzcXJ0KC0xKSBpbiBGLCBpLmUuLCAoYzFeMikgPT0gLTEgaW4gRlxuICBjb25zdCBjMiA9IHRuKEZwXywgYzEpOyAgICAgICAgICAgICAgLy8gIDIuIGMyID0gc3FydChjMSkgaW4gRiwgaS5lLiwgKGMyXjIpID09IGMxIGluIEZcbiAgY29uc3QgYzMgPSB0bihGcF8sIEZwXy5uZWcoYzEpKTsgICAgIC8vICAzLiBjMyA9IHNxcnQoLWMxKSBpbiBGLCBpLmUuLCAoYzNeMikgPT0gLWMxIGluIEZcbiAgY29uc3QgYzQgPSAoUCArIF83bikgLyBfMTZuOyAgICAgICAgIC8vICA0LiBjNCA9IChxICsgNykgLyAxNiAgICAgICAgIyBJbnRlZ2VyIGFyaXRobWV0aWNcbiAgcmV0dXJuIDxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKSA9PiB7XG4gICAgbGV0IHR2MSA9IEZwLnBvdyhuLCBjNCk7ICAgICAgICAgICAvLyAgMS4gdHYxID0geF5jNFxuICAgIGxldCB0djIgPSBGcC5tdWwodHYxLCBjMSk7ICAgICAgICAgLy8gIDIuIHR2MiA9IGMxICogdHYxXG4gICAgY29uc3QgdHYzID0gRnAubXVsKHR2MSwgYzIpOyAgICAgICAvLyAgMy4gdHYzID0gYzIgKiB0djFcbiAgICBjb25zdCB0djQgPSBGcC5tdWwodHYxLCBjMyk7ICAgICAgIC8vICA0LiB0djQgPSBjMyAqIHR2MVxuICAgIGNvbnN0IGUxID0gRnAuZXFsKEZwLnNxcih0djIpLCBuKTsgLy8gIDUuICBlMSA9ICh0djJeMikgPT0geFxuICAgIGNvbnN0IGUyID0gRnAuZXFsKEZwLnNxcih0djMpLCBuKTsgLy8gIDYuICBlMiA9ICh0djNeMikgPT0geFxuICAgIHR2MSA9IEZwLmNtb3YodHYxLCB0djIsIGUxKTsgICAgICAgLy8gIDcuIHR2MSA9IENNT1YodHYxLCB0djIsIGUxKSAgIyBTZWxlY3QgdHYyIGlmICh0djJeMikgPT0geFxuICAgIHR2MiA9IEZwLmNtb3YodHY0LCB0djMsIGUyKTsgICAgICAgLy8gIDguIHR2MiA9IENNT1YodHY0LCB0djMsIGUyKSAgIyBTZWxlY3QgdHYzIGlmICh0djNeMikgPT0geFxuICAgIGNvbnN0IGUzID0gRnAuZXFsKEZwLnNxcih0djIpLCBuKTsgLy8gIDkuICBlMyA9ICh0djJeMikgPT0geFxuICAgIGNvbnN0IHJvb3QgPSBGcC5jbW92KHR2MSwgdHYyLCBlMyk7Ly8gMTAuICB6ID0gQ01PVih0djEsIHR2MiwgZTMpICAgIyBTZWxlY3Qgc3FydCBmcm9tIHR2MSAmIHR2MlxuICAgIGFzc2VydElzU3F1YXJlKEZwLCByb290LCBuKTtcbiAgICByZXR1cm4gcm9vdDtcbiAgfTtcbn1cblxuLyoqXG4gKiBUb25lbGxpLVNoYW5rcyBzcXVhcmUgcm9vdCBzZWFyY2ggYWxnb3JpdGhtLlxuICogMS4gaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxMi82ODUucGRmIChwYWdlIDEyKVxuICogMi4gU3F1YXJlIFJvb3RzIGZyb20gMTsgMjQsIDUxLCAxMCB0byBEYW4gU2hhbmtzXG4gKiBAcGFyYW0gUCBmaWVsZCBvcmRlclxuICogQHJldHVybnMgZnVuY3Rpb24gdGhhdCB0YWtlcyBmaWVsZCBGcCAoY3JlYXRlZCBmcm9tIFApIGFuZCBudW1iZXIgblxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9uZWxsaVNoYW5rcyhQOiBiaWdpbnQpOiA8VD4oRnA6IElGaWVsZDxUPiwgbjogVCkgPT4gVCB7XG4gIC8vIEluaXRpYWxpemF0aW9uIChwcmVjb21wdXRhdGlvbikuXG4gIC8vIENhY2hpbmcgaW5pdGlhbGl6YXRpb24gY291bGQgYm9vc3QgcGVyZiBieSA3JS5cbiAgaWYgKFAgPCBfM24pIHRocm93IG5ldyBFcnJvcignc3FydCBpcyBub3QgZGVmaW5lZCBmb3Igc21hbGwgZmllbGQnKTtcbiAgLy8gRmFjdG9yIFAgLSAxID0gUSAqIDJeUywgd2hlcmUgUSBpcyBvZGRcbiAgbGV0IFEgPSBQIC0gXzFuO1xuICBsZXQgUyA9IDA7XG4gIHdoaWxlIChRICUgXzJuID09PSBfMG4pIHtcbiAgICBRIC89IF8ybjtcbiAgICBTKys7XG4gIH1cblxuICAvLyBGaW5kIHRoZSBmaXJzdCBxdWFkcmF0aWMgbm9uLXJlc2lkdWUgWiA+PSAyXG4gIGxldCBaID0gXzJuO1xuICBjb25zdCBfRnAgPSBGaWVsZChQKTtcbiAgd2hpbGUgKEZwTGVnZW5kcmUoX0ZwLCBaKSA9PT0gMSkge1xuICAgIC8vIEJhc2ljIHByaW1hbGl0eSB0ZXN0IGZvciBQLiBBZnRlciB4IGl0ZXJhdGlvbnMsIGNoYW5jZSBvZlxuICAgIC8vIG5vdCBmaW5kaW5nIHF1YWRyYXRpYyBub24tcmVzaWR1ZSBpcyAyXngsIHNvIDJeMTAwMC5cbiAgICBpZiAoWisrID4gMTAwMCkgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBzcXVhcmUgcm9vdDogcHJvYmFibHkgbm9uLXByaW1lIFAnKTtcbiAgfVxuICAvLyBGYXN0LXBhdGg7IHVzdWFsbHkgZG9uZSBiZWZvcmUgWiwgYnV0IHdlIGRvIFwicHJpbWFsaXR5IHRlc3RcIi5cbiAgaWYgKFMgPT09IDEpIHJldHVybiBzcXJ0M21vZDQ7XG5cbiAgLy8gU2xvdy1wYXRoXG4gIC8vIFRPRE86IHRlc3Qgb24gRnAyIGFuZCBvdGhlcnNcbiAgbGV0IGNjID0gX0ZwLnBvdyhaLCBRKTsgLy8gYyA9IHpeUVxuICBjb25zdCBRMWRpdjIgPSAoUSArIF8xbikgLyBfMm47XG4gIHJldHVybiBmdW5jdGlvbiB0b25lbGxpU2xvdzxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKTogVCB7XG4gICAgaWYgKEZwLmlzMChuKSkgcmV0dXJuIG47XG4gICAgLy8gQ2hlY2sgaWYgbiBpcyBhIHF1YWRyYXRpYyByZXNpZHVlIHVzaW5nIExlZ2VuZHJlIHN5bWJvbFxuICAgIGlmIChGcExlZ2VuZHJlKEZwLCBuKSAhPT0gMSkgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBzcXVhcmUgcm9vdCcpO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSB2YXJpYWJsZXMgZm9yIHRoZSBtYWluIGxvb3BcbiAgICBsZXQgTSA9IFM7XG4gICAgbGV0IGMgPSBGcC5tdWwoRnAuT05FLCBjYyk7IC8vIGMgPSB6XlEsIG1vdmUgY2MgZnJvbSBmaWVsZCBfRnAgaW50byBmaWVsZCBGcFxuICAgIGxldCB0ID0gRnAucG93KG4sIFEpOyAvLyB0ID0gbl5RLCBmaXJzdCBndWVzcyBhdCB0aGUgZnVkZ2UgZmFjdG9yXG4gICAgbGV0IFIgPSBGcC5wb3cobiwgUTFkaXYyKTsgLy8gUiA9IG5eKChRKzEpLzIpLCBmaXJzdCBndWVzcyBhdCB0aGUgc3F1YXJlIHJvb3RcblxuICAgIC8vIE1haW4gbG9vcFxuICAgIC8vIHdoaWxlIHQgIT0gMVxuICAgIHdoaWxlICghRnAuZXFsKHQsIEZwLk9ORSkpIHtcbiAgICAgIGlmIChGcC5pczAodCkpIHJldHVybiBGcC5aRVJPOyAvLyBpZiB0PTAgcmV0dXJuIFI9MFxuICAgICAgbGV0IGkgPSAxO1xuXG4gICAgICAvLyBGaW5kIHRoZSBzbWFsbGVzdCBpID49IDEgc3VjaCB0aGF0IHReKDJeaSkgXHUyMjYxIDEgKG1vZCBQKVxuICAgICAgbGV0IHRfdG1wID0gRnAuc3FyKHQpOyAvLyB0XigyXjEpXG4gICAgICB3aGlsZSAoIUZwLmVxbCh0X3RtcCwgRnAuT05FKSkge1xuICAgICAgICBpKys7XG4gICAgICAgIHRfdG1wID0gRnAuc3FyKHRfdG1wKTsgLy8gdF4oMl4yKS4uLlxuICAgICAgICBpZiAoaSA9PT0gTSkgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBzcXVhcmUgcm9vdCcpO1xuICAgICAgfVxuXG4gICAgICAvLyBDYWxjdWxhdGUgdGhlIGV4cG9uZW50IGZvciBiOiAyXihNIC0gaSAtIDEpXG4gICAgICBjb25zdCBleHBvbmVudCA9IF8xbiA8PCBCaWdJbnQoTSAtIGkgLSAxKTsgLy8gYmlnaW50IGlzIGltcG9ydGFudFxuICAgICAgY29uc3QgYiA9IEZwLnBvdyhjLCBleHBvbmVudCk7IC8vIGIgPSAyXihNIC0gaSAtIDEpXG5cbiAgICAgIC8vIFVwZGF0ZSB2YXJpYWJsZXNcbiAgICAgIE0gPSBpO1xuICAgICAgYyA9IEZwLnNxcihiKTsgLy8gYyA9IGJeMlxuICAgICAgdCA9IEZwLm11bCh0LCBjKTsgLy8gdCA9ICh0ICogYl4yKVxuICAgICAgUiA9IEZwLm11bChSLCBiKTsgLy8gUiA9IFIqYlxuICAgIH1cbiAgICByZXR1cm4gUjtcbiAgfTtcbn1cblxuLyoqXG4gKiBTcXVhcmUgcm9vdCBmb3IgYSBmaW5pdGUgZmllbGQuIFdpbGwgdHJ5IG9wdGltaXplZCB2ZXJzaW9ucyBmaXJzdDpcbiAqXG4gKiAxLiBQIFx1MjI2MSAzIChtb2QgNClcbiAqIDIuIFAgXHUyMjYxIDUgKG1vZCA4KVxuICogMy4gUCBcdTIyNjEgOSAobW9kIDE2KVxuICogNC4gVG9uZWxsaS1TaGFua3MgYWxnb3JpdGhtXG4gKlxuICogRGlmZmVyZW50IGFsZ29yaXRobXMgY2FuIGdpdmUgZGlmZmVyZW50IHJvb3RzLCBpdCBpcyB1cCB0byB1c2VyIHRvIGRlY2lkZSB3aGljaCBvbmUgdGhleSB3YW50LlxuICogRm9yIGV4YW1wbGUgdGhlcmUgaXMgRnBTcXJ0T2RkL0ZwU3FydEV2ZW4gdG8gY2hvaWNlIHJvb3QgYmFzZWQgb24gb2RkbmVzcyAodXNlZCBmb3IgaGFzaC10by1jdXJ2ZSkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGcFNxcnQoUDogYmlnaW50KTogPFQ+KEZwOiBJRmllbGQ8VD4sIG46IFQpID0+IFQge1xuICAvLyBQIFx1MjI2MSAzIChtb2QgNCkgPT4gXHUyMjFBbiA9IG5eKChQKzEpLzQpXG4gIGlmIChQICUgXzRuID09PSBfM24pIHJldHVybiBzcXJ0M21vZDQ7XG4gIC8vIFAgXHUyMjYxIDUgKG1vZCA4KSA9PiBBdGtpbiBhbGdvcml0aG0sIHBhZ2UgMTAgb2YgaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxMi82ODUucGRmXG4gIGlmIChQICUgXzhuID09PSBfNW4pIHJldHVybiBzcXJ0NW1vZDg7XG4gIC8vIFAgXHUyMjYxIDkgKG1vZCAxNikgPT4gS29uZyBhbGdvcml0aG0sIHBhZ2UgMTEgb2YgaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxMi82ODUucGRmIChhbGdvcml0aG0gNClcbiAgaWYgKFAgJSBfMTZuID09PSBfOW4pIHJldHVybiBzcXJ0OW1vZDE2KFApO1xuICAvLyBUb25lbGxpLVNoYW5rcyBhbGdvcml0aG1cbiAgcmV0dXJuIHRvbmVsbGlTaGFua3MoUCk7XG59XG5cbi8vIExpdHRsZS1lbmRpYW4gY2hlY2sgZm9yIGZpcnN0IExFIGJpdCAobGFzdCBCRSBiaXQpO1xuZXhwb3J0IGNvbnN0IGlzTmVnYXRpdmVMRSA9IChudW06IGJpZ2ludCwgbW9kdWxvOiBiaWdpbnQpOiBib29sZWFuID0+XG4gIChtb2QobnVtLCBtb2R1bG8pICYgXzFuKSA9PT0gXzFuO1xuXG4vKiogRmllbGQgaXMgbm90IGFsd2F5cyBvdmVyIHByaW1lOiBmb3IgZXhhbXBsZSwgRnAyIGhhcyBPUkRFUihxKT1wXm0uICovXG5leHBvcnQgaW50ZXJmYWNlIElGaWVsZDxUPiB7XG4gIE9SREVSOiBiaWdpbnQ7XG4gIEJZVEVTOiBudW1iZXI7XG4gIEJJVFM6IG51bWJlcjtcbiAgaXNMRTogYm9vbGVhbjtcbiAgWkVSTzogVDtcbiAgT05FOiBUO1xuICAvLyAxLWFyZ1xuICBjcmVhdGU6IChudW06IFQpID0+IFQ7XG4gIGlzVmFsaWQ6IChudW06IFQpID0+IGJvb2xlYW47XG4gIGlzMDogKG51bTogVCkgPT4gYm9vbGVhbjtcbiAgaXNWYWxpZE5vdDA6IChudW06IFQpID0+IGJvb2xlYW47XG4gIG5lZyhudW06IFQpOiBUO1xuICBpbnYobnVtOiBUKTogVDtcbiAgc3FydChudW06IFQpOiBUO1xuICBzcXIobnVtOiBUKTogVDtcbiAgLy8gMi1hcmdzXG4gIGVxbChsaHM6IFQsIHJoczogVCk6IGJvb2xlYW47XG4gIGFkZChsaHM6IFQsIHJoczogVCk6IFQ7XG4gIHN1YihsaHM6IFQsIHJoczogVCk6IFQ7XG4gIG11bChsaHM6IFQsIHJoczogVCB8IGJpZ2ludCk6IFQ7XG4gIHBvdyhsaHM6IFQsIHBvd2VyOiBiaWdpbnQpOiBUO1xuICBkaXYobGhzOiBULCByaHM6IFQgfCBiaWdpbnQpOiBUO1xuICAvLyBOIGZvciBOb25Ob3JtYWxpemVkIChmb3Igbm93KVxuICBhZGROKGxoczogVCwgcmhzOiBUKTogVDtcbiAgc3ViTihsaHM6IFQsIHJoczogVCk6IFQ7XG4gIG11bE4obGhzOiBULCByaHM6IFQgfCBiaWdpbnQpOiBUO1xuICBzcXJOKG51bTogVCk6IFQ7XG5cbiAgLy8gT3B0aW9uYWxcbiAgLy8gU2hvdWxkIGJlIHNhbWUgYXMgc2duMCBmdW5jdGlvbiBpblxuICAvLyBbUkZDOTM4MF0oaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzkzODAjc2VjdGlvbi00LjEpLlxuICAvLyBOT1RFOiBzZ24wIGlzICduZWdhdGl2ZSBpbiBMRScsIHdoaWNoIGlzIHNhbWUgYXMgb2RkLiBBbmQgbmVnYXRpdmUgaW4gTEUgaXMga2luZGEgc3RyYW5nZSBkZWZpbml0aW9uIGFueXdheS5cbiAgaXNPZGQ/KG51bTogVCk6IGJvb2xlYW47IC8vIE9kZCBpbnN0ZWFkIG9mIGV2ZW4gc2luY2Ugd2UgaGF2ZSBpdCBmb3IgRnAyXG4gIC8vIGxlZ2VuZHJlPyhudW06IFQpOiBUO1xuICBpbnZlcnRCYXRjaDogKGxzdDogVFtdKSA9PiBUW107XG4gIHRvQnl0ZXMobnVtOiBUKTogVWludDhBcnJheTtcbiAgZnJvbUJ5dGVzKGJ5dGVzOiBVaW50OEFycmF5LCBza2lwVmFsaWRhdGlvbj86IGJvb2xlYW4pOiBUO1xuICAvLyBJZiBjIGlzIEZhbHNlLCBDTU9WIHJldHVybnMgYSwgb3RoZXJ3aXNlIGl0IHJldHVybnMgYi5cbiAgY21vdihhOiBULCBiOiBULCBjOiBib29sZWFuKTogVDtcbn1cbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgRklFTERfRklFTERTID0gW1xuICAnY3JlYXRlJywgJ2lzVmFsaWQnLCAnaXMwJywgJ25lZycsICdpbnYnLCAnc3FydCcsICdzcXInLFxuICAnZXFsJywgJ2FkZCcsICdzdWInLCAnbXVsJywgJ3BvdycsICdkaXYnLFxuICAnYWRkTicsICdzdWJOJywgJ211bE4nLCAnc3FyTidcbl0gYXMgY29uc3Q7XG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVGaWVsZDxUPihmaWVsZDogSUZpZWxkPFQ+KTogSUZpZWxkPFQ+IHtcbiAgY29uc3QgaW5pdGlhbCA9IHtcbiAgICBPUkRFUjogJ2JpZ2ludCcsXG4gICAgQllURVM6ICdudW1iZXInLFxuICAgIEJJVFM6ICdudW1iZXInLFxuICB9IGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIGNvbnN0IG9wdHMgPSBGSUVMRF9GSUVMRFMucmVkdWNlKChtYXAsIHZhbDogc3RyaW5nKSA9PiB7XG4gICAgbWFwW3ZhbF0gPSAnZnVuY3Rpb24nO1xuICAgIHJldHVybiBtYXA7XG4gIH0sIGluaXRpYWwpO1xuICB2YWxpZGF0ZU9iamVjdChmaWVsZCwgb3B0cyk7XG4gIC8vIGNvbnN0IG1heCA9IDE2Mzg0O1xuICAvLyBpZiAoZmllbGQuQllURVMgPCAxIHx8IGZpZWxkLkJZVEVTID4gbWF4KSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmllbGQnKTtcbiAgLy8gaWYgKGZpZWxkLkJJVFMgPCAxIHx8IGZpZWxkLkJJVFMgPiA4ICogbWF4KSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmllbGQnKTtcbiAgcmV0dXJuIGZpZWxkO1xufVxuXG4vLyBHZW5lcmljIGZpZWxkIGZ1bmN0aW9uc1xuXG4vKipcbiAqIFNhbWUgYXMgYHBvd2AgYnV0IGZvciBGcDogbm9uLWNvbnN0YW50LXRpbWUuXG4gKiBVbnNhZmUgaW4gc29tZSBjb250ZXh0czogdXNlcyBsYWRkZXIsIHNvIGNhbiBleHBvc2UgYmlnaW50IGJpdHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGcFBvdzxUPihGcDogSUZpZWxkPFQ+LCBudW06IFQsIHBvd2VyOiBiaWdpbnQpOiBUIHtcbiAgaWYgKHBvd2VyIDwgXzBuKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZXhwb25lbnQsIG5lZ2F0aXZlcyB1bnN1cHBvcnRlZCcpO1xuICBpZiAocG93ZXIgPT09IF8wbikgcmV0dXJuIEZwLk9ORTtcbiAgaWYgKHBvd2VyID09PSBfMW4pIHJldHVybiBudW07XG4gIGxldCBwID0gRnAuT05FO1xuICBsZXQgZCA9IG51bTtcbiAgd2hpbGUgKHBvd2VyID4gXzBuKSB7XG4gICAgaWYgKHBvd2VyICYgXzFuKSBwID0gRnAubXVsKHAsIGQpO1xuICAgIGQgPSBGcC5zcXIoZCk7XG4gICAgcG93ZXIgPj49IF8xbjtcbiAgfVxuICByZXR1cm4gcDtcbn1cblxuLyoqXG4gKiBFZmZpY2llbnRseSBpbnZlcnQgYW4gYXJyYXkgb2YgRmllbGQgZWxlbWVudHMuXG4gKiBFeGNlcHRpb24tZnJlZS4gV2lsbCByZXR1cm4gYHVuZGVmaW5lZGAgZm9yIDAgZWxlbWVudHMuXG4gKiBAcGFyYW0gcGFzc1plcm8gbWFwIDAgdG8gMCAoaW5zdGVhZCBvZiB1bmRlZmluZWQpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGcEludmVydEJhdGNoPFQ+KEZwOiBJRmllbGQ8VD4sIG51bXM6IFRbXSwgcGFzc1plcm8gPSBmYWxzZSk6IFRbXSB7XG4gIGNvbnN0IGludmVydGVkID0gbmV3IEFycmF5KG51bXMubGVuZ3RoKS5maWxsKHBhc3NaZXJvID8gRnAuWkVSTyA6IHVuZGVmaW5lZCk7XG4gIC8vIFdhbGsgZnJvbSBmaXJzdCB0byBsYXN0LCBtdWx0aXBseSB0aGVtIGJ5IGVhY2ggb3RoZXIgTU9EIHBcbiAgY29uc3QgbXVsdGlwbGllZEFjYyA9IG51bXMucmVkdWNlKChhY2MsIG51bSwgaSkgPT4ge1xuICAgIGlmIChGcC5pczAobnVtKSkgcmV0dXJuIGFjYztcbiAgICBpbnZlcnRlZFtpXSA9IGFjYztcbiAgICByZXR1cm4gRnAubXVsKGFjYywgbnVtKTtcbiAgfSwgRnAuT05FKTtcbiAgLy8gSW52ZXJ0IGxhc3QgZWxlbWVudFxuICBjb25zdCBpbnZlcnRlZEFjYyA9IEZwLmludihtdWx0aXBsaWVkQWNjKTtcbiAgLy8gV2FsayBmcm9tIGxhc3QgdG8gZmlyc3QsIG11bHRpcGx5IHRoZW0gYnkgaW52ZXJ0ZWQgZWFjaCBvdGhlciBNT0QgcFxuICBudW1zLnJlZHVjZVJpZ2h0KChhY2MsIG51bSwgaSkgPT4ge1xuICAgIGlmIChGcC5pczAobnVtKSkgcmV0dXJuIGFjYztcbiAgICBpbnZlcnRlZFtpXSA9IEZwLm11bChhY2MsIGludmVydGVkW2ldKTtcbiAgICByZXR1cm4gRnAubXVsKGFjYywgbnVtKTtcbiAgfSwgaW52ZXJ0ZWRBY2MpO1xuICByZXR1cm4gaW52ZXJ0ZWQ7XG59XG5cbi8vIFRPRE86IHJlbW92ZVxuZXhwb3J0IGZ1bmN0aW9uIEZwRGl2PFQ+KEZwOiBJRmllbGQ8VD4sIGxoczogVCwgcmhzOiBUIHwgYmlnaW50KTogVCB7XG4gIHJldHVybiBGcC5tdWwobGhzLCB0eXBlb2YgcmhzID09PSAnYmlnaW50JyA/IGludmVydChyaHMsIEZwLk9SREVSKSA6IEZwLmludihyaHMpKTtcbn1cblxuLyoqXG4gKiBMZWdlbmRyZSBzeW1ib2wuXG4gKiBMZWdlbmRyZSBjb25zdGFudCBpcyB1c2VkIHRvIGNhbGN1bGF0ZSBMZWdlbmRyZSBzeW1ib2wgKGEgfCBwKVxuICogd2hpY2ggZGVub3RlcyB0aGUgdmFsdWUgb2YgYV4oKHAtMSkvMikgKG1vZCBwKS5cbiAqXG4gKiAqIChhIHwgcCkgXHUyMjYxIDEgICAgaWYgYSBpcyBhIHNxdWFyZSAobW9kIHApLCBxdWFkcmF0aWMgcmVzaWR1ZVxuICogKiAoYSB8IHApIFx1MjI2MSAtMSAgIGlmIGEgaXMgbm90IGEgc3F1YXJlIChtb2QgcCksIHF1YWRyYXRpYyBub24gcmVzaWR1ZVxuICogKiAoYSB8IHApIFx1MjI2MSAwICAgIGlmIGEgXHUyMjYxIDAgKG1vZCBwKVxuICovXG5leHBvcnQgZnVuY3Rpb24gRnBMZWdlbmRyZTxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKTogLTEgfCAwIHwgMSB7XG4gIC8vIFdlIGNhbiB1c2UgM3JkIGFyZ3VtZW50IGFzIG9wdGlvbmFsIGNhY2hlIG9mIHRoaXMgdmFsdWVcbiAgLy8gYnV0IHNlZW1zIHVubmVlZGVkIGZvciBub3cuIFRoZSBvcGVyYXRpb24gaXMgdmVyeSBmYXN0LlxuICBjb25zdCBwMW1vZDIgPSAoRnAuT1JERVIgLSBfMW4pIC8gXzJuO1xuICBjb25zdCBwb3dlcmVkID0gRnAucG93KG4sIHAxbW9kMik7XG4gIGNvbnN0IHllcyA9IEZwLmVxbChwb3dlcmVkLCBGcC5PTkUpO1xuICBjb25zdCB6ZXJvID0gRnAuZXFsKHBvd2VyZWQsIEZwLlpFUk8pO1xuICBjb25zdCBubyA9IEZwLmVxbChwb3dlcmVkLCBGcC5uZWcoRnAuT05FKSk7XG4gIGlmICgheWVzICYmICF6ZXJvICYmICFubykgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIExlZ2VuZHJlIHN5bWJvbCByZXN1bHQnKTtcbiAgcmV0dXJuIHllcyA/IDEgOiB6ZXJvID8gMCA6IC0xO1xufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgVHJ1ZSB3aGVuZXZlciB0aGUgdmFsdWUgeCBpcyBhIHNxdWFyZSBpbiB0aGUgZmllbGQgRi5cbmV4cG9ydCBmdW5jdGlvbiBGcElzU3F1YXJlPFQ+KEZwOiBJRmllbGQ8VD4sIG46IFQpOiBib29sZWFuIHtcbiAgY29uc3QgbCA9IEZwTGVnZW5kcmUoRnAsIG4pO1xuICByZXR1cm4gbCA9PT0gMTtcbn1cblxuZXhwb3J0IHR5cGUgTkxlbmd0aCA9IHsgbkJ5dGVMZW5ndGg6IG51bWJlcjsgbkJpdExlbmd0aDogbnVtYmVyIH07XG4vLyBDVVJWRS5uIGxlbmd0aHNcbmV4cG9ydCBmdW5jdGlvbiBuTGVuZ3RoKG46IGJpZ2ludCwgbkJpdExlbmd0aD86IG51bWJlcik6IE5MZW5ndGgge1xuICAvLyBCaXQgc2l6ZSwgYnl0ZSBzaXplIG9mIENVUlZFLm5cbiAgaWYgKG5CaXRMZW5ndGggIT09IHVuZGVmaW5lZCkgYW51bWJlcihuQml0TGVuZ3RoKTtcbiAgY29uc3QgX25CaXRMZW5ndGggPSBuQml0TGVuZ3RoICE9PSB1bmRlZmluZWQgPyBuQml0TGVuZ3RoIDogbi50b1N0cmluZygyKS5sZW5ndGg7XG4gIGNvbnN0IG5CeXRlTGVuZ3RoID0gTWF0aC5jZWlsKF9uQml0TGVuZ3RoIC8gOCk7XG4gIHJldHVybiB7IG5CaXRMZW5ndGg6IF9uQml0TGVuZ3RoLCBuQnl0ZUxlbmd0aCB9O1xufVxuXG50eXBlIEZwRmllbGQgPSBJRmllbGQ8YmlnaW50PiAmIFJlcXVpcmVkPFBpY2s8SUZpZWxkPGJpZ2ludD4sICdpc09kZCc+PjtcbnR5cGUgU3FydEZuID0gKG46IGJpZ2ludCkgPT4gYmlnaW50O1xudHlwZSBGaWVsZE9wdHMgPSBQYXJ0aWFsPHtcbiAgaXNMRTogYm9vbGVhbjtcbiAgQklUUzogbnVtYmVyO1xuICBzcXJ0OiBTcXJ0Rm47XG4gIGFsbG93ZWRMZW5ndGhzPzogcmVhZG9ubHkgbnVtYmVyW107IC8vIGZvciBQNTIxIChhZGRzIHBhZGRpbmcgZm9yIHNtYWxsZXIgc2l6ZXMpXG4gIG1vZEZyb21CeXRlczogYm9vbGVhbjsgLy8gYmxzMTItMzgxIHJlcXVpcmVzIG1vZChuKSBpbnN0ZWFkIG9mIHJlamVjdGluZyBrZXlzID49IG5cbn0+O1xuY2xhc3MgX0ZpZWxkIGltcGxlbWVudHMgSUZpZWxkPGJpZ2ludD4ge1xuICByZWFkb25seSBPUkRFUjogYmlnaW50O1xuICByZWFkb25seSBCSVRTOiBudW1iZXI7XG4gIHJlYWRvbmx5IEJZVEVTOiBudW1iZXI7XG4gIHJlYWRvbmx5IGlzTEU6IGJvb2xlYW47XG4gIHJlYWRvbmx5IFpFUk8gPSBfMG47XG4gIHJlYWRvbmx5IE9ORSA9IF8xbjtcbiAgcmVhZG9ubHkgX2xlbmd0aHM/OiBudW1iZXJbXTtcbiAgcHJpdmF0ZSBfc3FydDogUmV0dXJuVHlwZTx0eXBlb2YgRnBTcXJ0PiB8IHVuZGVmaW5lZDsgLy8gY2FjaGVkIHNxcnRcbiAgcHJpdmF0ZSByZWFkb25seSBfbW9kPzogYm9vbGVhbjtcbiAgY29uc3RydWN0b3IoT1JERVI6IGJpZ2ludCwgb3B0czogRmllbGRPcHRzID0ge30pIHtcbiAgICBpZiAoT1JERVIgPD0gXzBuKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmllbGQ6IGV4cGVjdGVkIE9SREVSID4gMCwgZ290ICcgKyBPUkRFUik7XG4gICAgbGV0IF9uYml0TGVuZ3RoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5pc0xFID0gZmFsc2U7XG4gICAgaWYgKG9wdHMgIT0gbnVsbCAmJiB0eXBlb2Ygb3B0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0cy5CSVRTID09PSAnbnVtYmVyJykgX25iaXRMZW5ndGggPSBvcHRzLkJJVFM7XG4gICAgICBpZiAodHlwZW9mIG9wdHMuc3FydCA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5zcXJ0ID0gb3B0cy5zcXJ0O1xuICAgICAgaWYgKHR5cGVvZiBvcHRzLmlzTEUgPT09ICdib29sZWFuJykgdGhpcy5pc0xFID0gb3B0cy5pc0xFO1xuICAgICAgaWYgKG9wdHMuYWxsb3dlZExlbmd0aHMpIHRoaXMuX2xlbmd0aHMgPSBvcHRzLmFsbG93ZWRMZW5ndGhzPy5zbGljZSgpO1xuICAgICAgaWYgKHR5cGVvZiBvcHRzLm1vZEZyb21CeXRlcyA9PT0gJ2Jvb2xlYW4nKSB0aGlzLl9tb2QgPSBvcHRzLm1vZEZyb21CeXRlcztcbiAgICB9XG4gICAgY29uc3QgeyBuQml0TGVuZ3RoLCBuQnl0ZUxlbmd0aCB9ID0gbkxlbmd0aChPUkRFUiwgX25iaXRMZW5ndGgpO1xuICAgIGlmIChuQnl0ZUxlbmd0aCA+IDIwNDgpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmaWVsZDogZXhwZWN0ZWQgT1JERVIgb2YgPD0gMjA0OCBieXRlcycpO1xuICAgIHRoaXMuT1JERVIgPSBPUkRFUjtcbiAgICB0aGlzLkJJVFMgPSBuQml0TGVuZ3RoO1xuICAgIHRoaXMuQllURVMgPSBuQnl0ZUxlbmd0aDtcbiAgICB0aGlzLl9zcXJ0ID0gdW5kZWZpbmVkO1xuICAgIE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyh0aGlzKTtcbiAgfVxuXG4gIGNyZWF0ZShudW06IGJpZ2ludCkge1xuICAgIHJldHVybiBtb2QobnVtLCB0aGlzLk9SREVSKTtcbiAgfVxuICBpc1ZhbGlkKG51bTogYmlnaW50KSB7XG4gICAgaWYgKHR5cGVvZiBudW0gIT09ICdiaWdpbnQnKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpZWxkIGVsZW1lbnQ6IGV4cGVjdGVkIGJpZ2ludCwgZ290ICcgKyB0eXBlb2YgbnVtKTtcbiAgICByZXR1cm4gXzBuIDw9IG51bSAmJiBudW0gPCB0aGlzLk9SREVSOyAvLyAwIGlzIHZhbGlkIGVsZW1lbnQsIGJ1dCBpdCdzIG5vdCBpbnZlcnRpYmxlXG4gIH1cbiAgaXMwKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIG51bSA9PT0gXzBuO1xuICB9XG4gIC8vIGlzIHZhbGlkIGFuZCBpbnZlcnRpYmxlXG4gIGlzVmFsaWROb3QwKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuICF0aGlzLmlzMChudW0pICYmIHRoaXMuaXNWYWxpZChudW0pO1xuICB9XG4gIGlzT2RkKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIChudW0gJiBfMW4pID09PSBfMW47XG4gIH1cbiAgbmVnKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIG1vZCgtbnVtLCB0aGlzLk9SREVSKTtcbiAgfVxuICBlcWwobGhzOiBiaWdpbnQsIHJoczogYmlnaW50KSB7XG4gICAgcmV0dXJuIGxocyA9PT0gcmhzO1xuICB9XG5cbiAgc3FyKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIG1vZChudW0gKiBudW0sIHRoaXMuT1JERVIpO1xuICB9XG4gIGFkZChsaHM6IGJpZ2ludCwgcmhzOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbW9kKGxocyArIHJocywgdGhpcy5PUkRFUik7XG4gIH1cbiAgc3ViKGxoczogYmlnaW50LCByaHM6IGJpZ2ludCkge1xuICAgIHJldHVybiBtb2QobGhzIC0gcmhzLCB0aGlzLk9SREVSKTtcbiAgfVxuICBtdWwobGhzOiBiaWdpbnQsIHJoczogYmlnaW50KSB7XG4gICAgcmV0dXJuIG1vZChsaHMgKiByaHMsIHRoaXMuT1JERVIpO1xuICB9XG4gIHBvdyhudW06IGJpZ2ludCwgcG93ZXI6IGJpZ2ludCk6IGJpZ2ludCB7XG4gICAgcmV0dXJuIEZwUG93KHRoaXMsIG51bSwgcG93ZXIpO1xuICB9XG4gIGRpdihsaHM6IGJpZ2ludCwgcmhzOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbW9kKGxocyAqIGludmVydChyaHMsIHRoaXMuT1JERVIpLCB0aGlzLk9SREVSKTtcbiAgfVxuXG4gIC8vIFNhbWUgYXMgYWJvdmUsIGJ1dCBkb2Vzbid0IG5vcm1hbGl6ZVxuICBzcXJOKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIG51bSAqIG51bTtcbiAgfVxuICBhZGROKGxoczogYmlnaW50LCByaHM6IGJpZ2ludCkge1xuICAgIHJldHVybiBsaHMgKyByaHM7XG4gIH1cbiAgc3ViTihsaHM6IGJpZ2ludCwgcmhzOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbGhzIC0gcmhzO1xuICB9XG4gIG11bE4obGhzOiBiaWdpbnQsIHJoczogYmlnaW50KSB7XG4gICAgcmV0dXJuIGxocyAqIHJocztcbiAgfVxuXG4gIGludihudW06IGJpZ2ludCkge1xuICAgIHJldHVybiBpbnZlcnQobnVtLCB0aGlzLk9SREVSKTtcbiAgfVxuICBzcXJ0KG51bTogYmlnaW50KTogYmlnaW50IHtcbiAgICAvLyBDYWNoaW5nIF9zcXJ0IHNwZWVkcyB1cCBzcXJ0OW1vZDE2IGJ5IDV4IGFuZCB0b25uZWxpLXNoYW5rcyBieSAxMCVcbiAgICBpZiAoIXRoaXMuX3NxcnQpIHRoaXMuX3NxcnQgPSBGcFNxcnQodGhpcy5PUkRFUik7XG4gICAgcmV0dXJuIHRoaXMuX3NxcnQodGhpcywgbnVtKTtcbiAgfVxuICB0b0J5dGVzKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNMRSA/IG51bWJlclRvQnl0ZXNMRShudW0sIHRoaXMuQllURVMpIDogbnVtYmVyVG9CeXRlc0JFKG51bSwgdGhpcy5CWVRFUyk7XG4gIH1cbiAgZnJvbUJ5dGVzKGJ5dGVzOiBVaW50OEFycmF5LCBza2lwVmFsaWRhdGlvbiA9IGZhbHNlKSB7XG4gICAgYWJ5dGVzKGJ5dGVzKTtcbiAgICBjb25zdCB7IF9sZW5ndGhzOiBhbGxvd2VkTGVuZ3RocywgQllURVMsIGlzTEUsIE9SREVSLCBfbW9kOiBtb2RGcm9tQnl0ZXMgfSA9IHRoaXM7XG4gICAgaWYgKGFsbG93ZWRMZW5ndGhzKSB7XG4gICAgICBpZiAoIWFsbG93ZWRMZW5ndGhzLmluY2x1ZGVzKGJ5dGVzLmxlbmd0aCkgfHwgYnl0ZXMubGVuZ3RoID4gQllURVMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdGaWVsZC5mcm9tQnl0ZXM6IGV4cGVjdGVkICcgKyBhbGxvd2VkTGVuZ3RocyArICcgYnl0ZXMsIGdvdCAnICsgYnl0ZXMubGVuZ3RoXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBjb25zdCBwYWRkZWQgPSBuZXcgVWludDhBcnJheShCWVRFUyk7XG4gICAgICAvLyBpc0xFIGFkZCAwIHRvIHJpZ2h0LCAhaXNMRSB0byB0aGUgbGVmdC5cbiAgICAgIHBhZGRlZC5zZXQoYnl0ZXMsIGlzTEUgPyAwIDogcGFkZGVkLmxlbmd0aCAtIGJ5dGVzLmxlbmd0aCk7XG4gICAgICBieXRlcyA9IHBhZGRlZDtcbiAgICB9XG4gICAgaWYgKGJ5dGVzLmxlbmd0aCAhPT0gQllURVMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpZWxkLmZyb21CeXRlczogZXhwZWN0ZWQgJyArIEJZVEVTICsgJyBieXRlcywgZ290ICcgKyBieXRlcy5sZW5ndGgpO1xuICAgIGxldCBzY2FsYXIgPSBpc0xFID8gYnl0ZXNUb051bWJlckxFKGJ5dGVzKSA6IGJ5dGVzVG9OdW1iZXJCRShieXRlcyk7XG4gICAgaWYgKG1vZEZyb21CeXRlcykgc2NhbGFyID0gbW9kKHNjYWxhciwgT1JERVIpO1xuICAgIGlmICghc2tpcFZhbGlkYXRpb24pXG4gICAgICBpZiAoIXRoaXMuaXNWYWxpZChzY2FsYXIpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmllbGQgZWxlbWVudDogb3V0c2lkZSBvZiByYW5nZSAwLi5PUkRFUicpO1xuICAgIC8vIE5PVEU6IHdlIGRvbid0IHZhbGlkYXRlIHNjYWxhciBoZXJlLCBwbGVhc2UgdXNlIGlzVmFsaWQuIFRoaXMgZG9uZSBzdWNoIHdheSBiZWNhdXNlIHNvbWVcbiAgICAvLyBwcm90b2NvbCBtYXkgYWxsb3cgbm9uLXJlZHVjZWQgc2NhbGFyIHRoYXQgcmVkdWNlZCBsYXRlciBvciBjaGFuZ2VkIHNvbWUgb3RoZXIgd2F5LlxuICAgIHJldHVybiBzY2FsYXI7XG4gIH1cbiAgLy8gVE9ETzogd2UgZG9uJ3QgbmVlZCBpdCBoZXJlLCBtb3ZlIG91dCB0byBzZXBhcmF0ZSBmblxuICBpbnZlcnRCYXRjaChsc3Q6IGJpZ2ludFtdKTogYmlnaW50W10ge1xuICAgIHJldHVybiBGcEludmVydEJhdGNoKHRoaXMsIGxzdCk7XG4gIH1cbiAgLy8gV2UgY2FuJ3QgbW92ZSB0aGlzIG91dCBiZWNhdXNlIEZwNiwgRnAxMiBpbXBsZW1lbnQgaXRcbiAgLy8gYW5kIGl0J3MgdW5jbGVhciB3aGF0IHRvIHJldHVybiBpbiB0aGVyZS5cbiAgY21vdihhOiBiaWdpbnQsIGI6IGJpZ2ludCwgY29uZGl0aW9uOiBib29sZWFuKSB7XG4gICAgcmV0dXJuIGNvbmRpdGlvbiA/IGIgOiBhO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZpbml0ZSBmaWVsZC4gTWFqb3IgcGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9uczpcbiAqICogMS4gRGVub3JtYWxpemVkIG9wZXJhdGlvbnMgbGlrZSBtdWxOIGluc3RlYWQgb2YgbXVsLlxuICogKiAyLiBJZGVudGljYWwgb2JqZWN0IHNoYXBlOiBuZXZlciBhZGQgb3IgcmVtb3ZlIGtleXMuXG4gKiAqIDMuIGBPYmplY3QuZnJlZXplYC5cbiAqIEZyYWdpbGU6IGFsd2F5cyBydW4gYSBiZW5jaG1hcmsgb24gYSBjaGFuZ2UuXG4gKiBTZWN1cml0eSBub3RlOiBvcGVyYXRpb25zIGRvbid0IGNoZWNrICdpc1ZhbGlkJyBmb3IgYWxsIGVsZW1lbnRzIGZvciBwZXJmb3JtYW5jZSByZWFzb25zLFxuICogaXQgaXMgY2FsbGVyIHJlc3BvbnNpYmlsaXR5IHRvIGNoZWNrIHRoaXMuXG4gKiBUaGlzIGlzIGxvdy1sZXZlbCBjb2RlLCBwbGVhc2UgbWFrZSBzdXJlIHlvdSBrbm93IHdoYXQgeW91J3JlIGRvaW5nLlxuICpcbiAqIE5vdGUgYWJvdXQgZmllbGQgcHJvcGVydGllczpcbiAqICogQ0hBUkFDVEVSSVNUSUMgcCA9IHByaW1lIG51bWJlciwgbnVtYmVyIG9mIGVsZW1lbnRzIGluIG1haW4gc3ViZ3JvdXAuXG4gKiAqIE9SREVSIHEgPSBzaW1pbGFyIHRvIGNvZmFjdG9yIGluIGN1cnZlcywgbWF5IGJlIGNvbXBvc2l0ZSBgcSA9IHBebWAuXG4gKlxuICogQHBhcmFtIE9SREVSIGZpZWxkIG9yZGVyLCBwcm9iYWJseSBwcmltZSwgb3IgY291bGQgYmUgY29tcG9zaXRlXG4gKiBAcGFyYW0gYml0TGVuIGhvdyBtYW55IGJpdHMgdGhlIGZpZWxkIGNvbnN1bWVzXG4gKiBAcGFyYW0gaXNMRSAoZGVmYXVsdDogZmFsc2UpIGlmIGVuY29kaW5nIC8gZGVjb2Rpbmcgc2hvdWxkIGJlIGluIGxpdHRsZS1lbmRpYW5cbiAqIEBwYXJhbSByZWRlZiBvcHRpb25hbCBmYXN0ZXIgcmVkZWZpbml0aW9ucyBvZiBzcXJ0IGFuZCBvdGhlciBtZXRob2RzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGaWVsZChPUkRFUjogYmlnaW50LCBvcHRzOiBGaWVsZE9wdHMgPSB7fSk6IFJlYWRvbmx5PEZwRmllbGQ+IHtcbiAgcmV0dXJuIG5ldyBfRmllbGQoT1JERVIsIG9wdHMpO1xufVxuXG4vLyBHZW5lcmljIHJhbmRvbSBzY2FsYXIsIHdlIGNhbiBkbyBzYW1lIGZvciBvdGhlciBmaWVsZHMgaWYgdmlhIEZwMi5tdWwoRnAyLk9ORSwgRnAyLnJhbmRvbSk/XG4vLyBUaGlzIGFsbG93cyB1bnNhZmUgbWV0aG9kcyBsaWtlIGlnbm9yZSBiaWFzIG9yIHplcm8uIFRoZXNlIHVuc2FmZSwgYnV0IG9mdGVuIHVzZWQgaW4gZGlmZmVyZW50IHByb3RvY29scyAoaWYgZGV0ZXJtaW5pc3RpYyBSTkcpLlxuLy8gd2hpY2ggbWVhbiB3ZSBjYW5ub3QgZm9yY2UgdGhpcyB2aWEgb3B0cy5cbi8vIE5vdCBzdXJlIHdoYXQgdG8gZG8gd2l0aCByYW5kb21CeXRlcywgd2UgY2FuIGFjY2VwdCBpdCBpbnNpZGUgb3B0cyBpZiB3YW50ZWQuXG4vLyBQcm9iYWJseSBuZWVkIHRvIGV4cG9ydCBnZXRNaW5IYXNoTGVuZ3RoIHNvbWV3aGVyZT9cbi8vIHJhbmRvbShieXRlcz86IFVpbnQ4QXJyYXksIHVuc2FmZUFsbG93WmVybyA9IGZhbHNlLCB1bnNhZmVBbGxvd0JpYXMgPSBmYWxzZSkge1xuLy8gICBjb25zdCBMRU4gPSAhdW5zYWZlQWxsb3dCaWFzID8gZ2V0TWluSGFzaExlbmd0aChPUkRFUikgOiBCWVRFUztcbi8vICAgaWYgKGJ5dGVzID09PSB1bmRlZmluZWQpIGJ5dGVzID0gcmFuZG9tQnl0ZXMoTEVOKTsgLy8gX29wdHMucmFuZG9tQnl0ZXM/XG4vLyAgIGNvbnN0IG51bSA9IGlzTEUgPyBieXRlc1RvTnVtYmVyTEUoYnl0ZXMpIDogYnl0ZXNUb051bWJlckJFKGJ5dGVzKTtcbi8vICAgLy8gYG1vZCh4LCAxMSlgIGNhbiBzb21ldGltZXMgcHJvZHVjZSAwLiBgbW9kKHgsIDEwKSArIDFgIGlzIHRoZSBzYW1lLCBidXQgbm8gMFxuLy8gICBjb25zdCByZWR1Y2VkID0gdW5zYWZlQWxsb3daZXJvID8gbW9kKG51bSwgT1JERVIpIDogbW9kKG51bSwgT1JERVIgLSBfMW4pICsgXzFuO1xuLy8gICByZXR1cm4gcmVkdWNlZDtcbi8vIH0sXG5cbmV4cG9ydCBmdW5jdGlvbiBGcFNxcnRPZGQ8VD4oRnA6IElGaWVsZDxUPiwgZWxtOiBUKTogVCB7XG4gIGlmICghRnAuaXNPZGQpIHRocm93IG5ldyBFcnJvcihcIkZpZWxkIGRvZXNuJ3QgaGF2ZSBpc09kZFwiKTtcbiAgY29uc3Qgcm9vdCA9IEZwLnNxcnQoZWxtKTtcbiAgcmV0dXJuIEZwLmlzT2RkKHJvb3QpID8gcm9vdCA6IEZwLm5lZyhyb290KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEZwU3FydEV2ZW48VD4oRnA6IElGaWVsZDxUPiwgZWxtOiBUKTogVCB7XG4gIGlmICghRnAuaXNPZGQpIHRocm93IG5ldyBFcnJvcihcIkZpZWxkIGRvZXNuJ3QgaGF2ZSBpc09kZFwiKTtcbiAgY29uc3Qgcm9vdCA9IEZwLnNxcnQoZWxtKTtcbiAgcmV0dXJuIEZwLmlzT2RkKHJvb3QpID8gRnAubmVnKHJvb3QpIDogcm9vdDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRvdGFsIG51bWJlciBvZiBieXRlcyBjb25zdW1lZCBieSB0aGUgZmllbGQgZWxlbWVudC5cbiAqIEZvciBleGFtcGxlLCAzMiBieXRlcyBmb3IgdXN1YWwgMjU2LWJpdCB3ZWllcnN0cmFzcyBjdXJ2ZS5cbiAqIEBwYXJhbSBmaWVsZE9yZGVyIG51bWJlciBvZiBmaWVsZCBlbGVtZW50cywgdXN1YWxseSBDVVJWRS5uXG4gKiBAcmV0dXJucyBieXRlIGxlbmd0aCBvZiBmaWVsZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmllbGRCeXRlc0xlbmd0aChmaWVsZE9yZGVyOiBiaWdpbnQpOiBudW1iZXIge1xuICBpZiAodHlwZW9mIGZpZWxkT3JkZXIgIT09ICdiaWdpbnQnKSB0aHJvdyBuZXcgRXJyb3IoJ2ZpZWxkIG9yZGVyIG11c3QgYmUgYmlnaW50Jyk7XG4gIGNvbnN0IGJpdExlbmd0aCA9IGZpZWxkT3JkZXIudG9TdHJpbmcoMikubGVuZ3RoO1xuICByZXR1cm4gTWF0aC5jZWlsKGJpdExlbmd0aCAvIDgpO1xufVxuXG4vKipcbiAqIFJldHVybnMgbWluaW1hbCBhbW91bnQgb2YgYnl0ZXMgdGhhdCBjYW4gYmUgc2FmZWx5IHJlZHVjZWRcbiAqIGJ5IGZpZWxkIG9yZGVyLlxuICogU2hvdWxkIGJlIDJeLTEyOCBmb3IgMTI4LWJpdCBjdXJ2ZSBzdWNoIGFzIFAyNTYuXG4gKiBAcGFyYW0gZmllbGRPcmRlciBudW1iZXIgb2YgZmllbGQgZWxlbWVudHMsIHVzdWFsbHkgQ1VSVkUublxuICogQHJldHVybnMgYnl0ZSBsZW5ndGggb2YgdGFyZ2V0IGhhc2hcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE1pbkhhc2hMZW5ndGgoZmllbGRPcmRlcjogYmlnaW50KTogbnVtYmVyIHtcbiAgY29uc3QgbGVuZ3RoID0gZ2V0RmllbGRCeXRlc0xlbmd0aChmaWVsZE9yZGVyKTtcbiAgcmV0dXJuIGxlbmd0aCArIE1hdGguY2VpbChsZW5ndGggLyAyKTtcbn1cblxuLyoqXG4gKiBcIkNvbnN0YW50LXRpbWVcIiBwcml2YXRlIGtleSBnZW5lcmF0aW9uIHV0aWxpdHkuXG4gKiBDYW4gdGFrZSAobiArIG4vMikgb3IgbW9yZSBieXRlcyBvZiB1bmlmb3JtIGlucHV0IGUuZy4gZnJvbSBDU1BSTkcgb3IgS0RGXG4gKiBhbmQgY29udmVydCB0aGVtIGludG8gcHJpdmF0ZSBzY2FsYXIsIHdpdGggdGhlIG1vZHVsbyBiaWFzIGJlaW5nIG5lZ2xpZ2libGUuXG4gKiBOZWVkcyBhdCBsZWFzdCA0OCBieXRlcyBvZiBpbnB1dCBmb3IgMzItYnl0ZSBwcml2YXRlIGtleS5cbiAqIGh0dHBzOi8vcmVzZWFyY2gua3VkZWxza2lzZWN1cml0eS5jb20vMjAyMC8wNy8yOC90aGUtZGVmaW5pdGl2ZS1ndWlkZS10by1tb2R1bG8tYmlhcy1hbmQtaG93LXRvLWF2b2lkLWl0L1xuICogRklQUyAxODYtNSwgQS4yIGh0dHBzOi8vY3NyYy5uaXN0Lmdvdi9wdWJsaWNhdGlvbnMvZGV0YWlsL2ZpcHMvMTg2LzUvZmluYWxcbiAqIFJGQyA5MzgwLCBodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjOTM4MCNzZWN0aW9uLTVcbiAqIEBwYXJhbSBoYXNoIGhhc2ggb3V0cHV0IGZyb20gU0hBMyBvciBhIHNpbWlsYXIgZnVuY3Rpb25cbiAqIEBwYXJhbSBncm91cE9yZGVyIHNpemUgb2Ygc3ViZ3JvdXAgLSAoZS5nLiBzZWNwMjU2azEuUG9pbnQuRm4uT1JERVIpXG4gKiBAcGFyYW0gaXNMRSBpbnRlcnByZXQgaGFzaCBieXRlcyBhcyBMRSBudW1cbiAqIEByZXR1cm5zIHZhbGlkIHByaXZhdGUgc2NhbGFyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXBIYXNoVG9GaWVsZChrZXk6IFVpbnQ4QXJyYXksIGZpZWxkT3JkZXI6IGJpZ2ludCwgaXNMRSA9IGZhbHNlKTogVWludDhBcnJheSB7XG4gIGFieXRlcyhrZXkpO1xuICBjb25zdCBsZW4gPSBrZXkubGVuZ3RoO1xuICBjb25zdCBmaWVsZExlbiA9IGdldEZpZWxkQnl0ZXNMZW5ndGgoZmllbGRPcmRlcik7XG4gIGNvbnN0IG1pbkxlbiA9IGdldE1pbkhhc2hMZW5ndGgoZmllbGRPcmRlcik7XG4gIC8vIE5vIHNtYWxsIG51bWJlcnM6IG5lZWQgdG8gdW5kZXJzdGFuZCBiaWFzIHN0b3J5LiBObyBodWdlIG51bWJlcnM6IGVhc2llciB0byBkZXRlY3QgSlMgdGltaW5ncy5cbiAgaWYgKGxlbiA8IDE2IHx8IGxlbiA8IG1pbkxlbiB8fCBsZW4gPiAxMDI0KVxuICAgIHRocm93IG5ldyBFcnJvcignZXhwZWN0ZWQgJyArIG1pbkxlbiArICctMTAyNCBieXRlcyBvZiBpbnB1dCwgZ290ICcgKyBsZW4pO1xuICBjb25zdCBudW0gPSBpc0xFID8gYnl0ZXNUb051bWJlckxFKGtleSkgOiBieXRlc1RvTnVtYmVyQkUoa2V5KTtcbiAgLy8gYG1vZCh4LCAxMSlgIGNhbiBzb21ldGltZXMgcHJvZHVjZSAwLiBgbW9kKHgsIDEwKSArIDFgIGlzIHRoZSBzYW1lLCBidXQgbm8gMFxuICBjb25zdCByZWR1Y2VkID0gbW9kKG51bSwgZmllbGRPcmRlciAtIF8xbikgKyBfMW47XG4gIHJldHVybiBpc0xFID8gbnVtYmVyVG9CeXRlc0xFKHJlZHVjZWQsIGZpZWxkTGVuKSA6IG51bWJlclRvQnl0ZXNCRShyZWR1Y2VkLCBmaWVsZExlbik7XG59XG4iLCAiLyoqXG4gKiBTaG9ydCBXZWllcnN0cmFzcyBjdXJ2ZSBtZXRob2RzLiBUaGUgZm9ybXVsYSBpczogeVx1MDBCMiA9IHhcdTAwQjMgKyBheCArIGIuXG4gKlxuICogIyMjIERlc2lnbiByYXRpb25hbGUgZm9yIHR5cGVzXG4gKlxuICogKiBJbnRlcmFjdGlvbiBiZXR3ZWVuIGNsYXNzZXMgZnJvbSBkaWZmZXJlbnQgY3VydmVzIHNob3VsZCBmYWlsOlxuICogICBgazI1Ni5Qb2ludC5CQVNFLmFkZChwMjU2LlBvaW50LkJBU0UpYFxuICogKiBGb3IgdGhpcyBwdXJwb3NlIHdlIHdhbnQgdG8gdXNlIGBpbnN0YW5jZW9mYCBvcGVyYXRvciwgd2hpY2ggaXMgZmFzdCBhbmQgd29ya3MgZHVyaW5nIHJ1bnRpbWVcbiAqICogRGlmZmVyZW50IGNhbGxzIG9mIGBjdXJ2ZSgpYCB3b3VsZCByZXR1cm4gZGlmZmVyZW50IGNsYXNzZXMgLVxuICogICBgY3VydmUocGFyYW1zKSAhPT0gY3VydmUocGFyYW1zKWA6IGlmIHNvbWVib2R5IGRlY2lkZWQgdG8gbW9ua2V5LXBhdGNoIHRoZWlyIGN1cnZlLFxuICogICBpdCB3b24ndCBhZmZlY3Qgb3RoZXJzXG4gKlxuICogVHlwZVNjcmlwdCBjYW4ndCBpbmZlciB0eXBlcyBmb3IgY2xhc3NlcyBjcmVhdGVkIGluc2lkZSBhIGZ1bmN0aW9uLiBDbGFzc2VzIGlzIG9uZSBpbnN0YW5jZVxuICogb2Ygbm9taW5hdGl2ZSB0eXBlcyBpbiBUeXBlU2NyaXB0IGFuZCBpbnRlcmZhY2VzIG9ubHkgY2hlY2sgZm9yIHNoYXBlLCBzbyBpdCdzIGhhcmQgdG8gY3JlYXRlXG4gKiB1bmlxdWUgdHlwZSBmb3IgZXZlcnkgZnVuY3Rpb24gY2FsbC5cbiAqXG4gKiBXZSBjYW4gdXNlIGdlbmVyaWMgdHlwZXMgdmlhIHNvbWUgcGFyYW0sIGxpa2UgY3VydmUgb3B0cywgYnV0IHRoYXQgd291bGQ6XG4gKiAgICAgMS4gRW5hYmxlIGludGVyYWN0aW9uIGJldHdlZW4gYGN1cnZlKHBhcmFtcylgIGFuZCBgY3VydmUocGFyYW1zKWAgKGN1cnZlcyBvZiBzYW1lIHBhcmFtcylcbiAqICAgICB3aGljaCBpcyBoYXJkIHRvIGRlYnVnLlxuICogICAgIDIuIFBhcmFtcyBjYW4gYmUgZ2VuZXJpYyBhbmQgd2UgY2FuJ3QgZW5mb3JjZSB0aGVtIHRvIGJlIGNvbnN0YW50IHZhbHVlOlxuICogICAgIGlmIHNvbWVib2R5IGNyZWF0ZXMgY3VydmUgZnJvbSBub24tY29uc3RhbnQgcGFyYW1zLFxuICogICAgIGl0IHdvdWxkIGJlIGFsbG93ZWQgdG8gaW50ZXJhY3Qgd2l0aCBvdGhlciBjdXJ2ZXMgd2l0aCBub24tY29uc3RhbnQgcGFyYW1zXG4gKlxuICogQHRvZG8gaHR0cHM6Ly93d3cudHlwZXNjcmlwdGxhbmcub3JnL2RvY3MvaGFuZGJvb2svcmVsZWFzZS1ub3Rlcy90eXBlc2NyaXB0LTItNy5odG1sI3VuaXF1ZS1zeW1ib2xcbiAqIEBtb2R1bGVcbiAqL1xuLyohIG5vYmxlLWN1cnZlcyAtIE1JVCBMaWNlbnNlIChjKSAyMDIyIFBhdWwgTWlsbGVyIChwYXVsbWlsbHIuY29tKSAqL1xuaW1wb3J0IHsgaG1hYyBhcyBub2JsZUhtYWMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL2htYWMuanMnO1xuaW1wb3J0IHsgYWhhc2ggfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7XG4gIGFib29sLFxuICBhYnl0ZXMsXG4gIGFJblJhbmdlLFxuICBiaXRMZW4sXG4gIGJpdE1hc2ssXG4gIGJ5dGVzVG9IZXgsXG4gIGJ5dGVzVG9OdW1iZXJCRSxcbiAgY29uY2F0Qnl0ZXMsXG4gIGNyZWF0ZUhtYWNEcmJnLFxuICBoZXhUb0J5dGVzLFxuICBpc0J5dGVzLFxuICBtZW1vaXplZCxcbiAgbnVtYmVyVG9IZXhVbnBhZGRlZCxcbiAgdmFsaWRhdGVPYmplY3QsXG4gIHJhbmRvbUJ5dGVzIGFzIHdjUmFuZG9tQnl0ZXMsXG4gIHR5cGUgQ0hhc2gsXG4gIHR5cGUgU2lnbmVyLFxufSBmcm9tICcuLi91dGlscy50cyc7XG5pbXBvcnQge1xuICBjcmVhdGVDdXJ2ZUZpZWxkcyxcbiAgY3JlYXRlS2V5Z2VuLFxuICBtdWxFbmRvVW5zYWZlLFxuICBuZWdhdGVDdCxcbiAgbm9ybWFsaXplWixcbiAgd05BRixcbiAgdHlwZSBBZmZpbmVQb2ludCxcbiAgdHlwZSBDdXJ2ZUxlbmd0aHMsXG4gIHR5cGUgQ3VydmVQb2ludCxcbiAgdHlwZSBDdXJ2ZVBvaW50Q29ucyxcbn0gZnJvbSAnLi9jdXJ2ZS50cyc7XG5pbXBvcnQge1xuICBGcEludmVydEJhdGNoLFxuICBnZXRNaW5IYXNoTGVuZ3RoLFxuICBtYXBIYXNoVG9GaWVsZCxcbiAgdmFsaWRhdGVGaWVsZCxcbiAgdHlwZSBJRmllbGQsXG59IGZyb20gJy4vbW9kdWxhci50cyc7XG5cbmV4cG9ydCB0eXBlIHsgQWZmaW5lUG9pbnQgfTtcblxudHlwZSBFbmRvQmFzaXMgPSBbW2JpZ2ludCwgYmlnaW50XSwgW2JpZ2ludCwgYmlnaW50XV07XG4vKipcbiAqIFdoZW4gV2VpZXJzdHJhc3MgY3VydmUgaGFzIGBhPTBgLCBpdCBiZWNvbWVzIEtvYmxpdHogY3VydmUuXG4gKiBLb2JsaXR6IGN1cnZlcyBhbGxvdyB1c2luZyAqKmVmZmljaWVudGx5LWNvbXB1dGFibGUgR0xWIGVuZG9tb3JwaGlzbSBcdTAzQzgqKi5cbiAqIEVuZG9tb3JwaGlzbSB1c2VzIDJ4IGxlc3MgUkFNLCBzcGVlZHMgdXAgcHJlY29tcHV0YXRpb24gYnkgMnggYW5kIEVDREggLyBrZXkgcmVjb3ZlcnkgYnkgMjAlLlxuICogRm9yIHByZWNvbXB1dGVkIHdOQUYgaXQgdHJhZGVzIG9mZiAxLzIgaW5pdCB0aW1lICYgMS8zIHJhbSBmb3IgMjAlIHBlcmYgaGl0LlxuICpcbiAqIEVuZG9tb3JwaGlzbSBjb25zaXN0cyBvZiBiZXRhLCBsYW1iZGEgYW5kIHNwbGl0U2NhbGFyOlxuICpcbiAqIDEuIEdMViBlbmRvbW9ycGhpc20gXHUwM0M4IHRyYW5zZm9ybXMgYSBwb2ludDogYFAgPSAoeCwgeSkgXHUyMUE2IFx1MDNDOChQKSA9IChcdTAzQjJcdTAwQjd4IG1vZCBwLCB5KWBcbiAqIDIuIEdMViBzY2FsYXIgZGVjb21wb3NpdGlvbiB0cmFuc2Zvcm1zIGEgc2NhbGFyOiBgayBcdTIyNjEga1x1MjA4MSArIGtcdTIwODJcdTAwQjdcdTAzQkIgKG1vZCBuKWBcbiAqIDMuIFRoZW4gdGhlc2UgYXJlIGNvbWJpbmVkOiBga1x1MDBCN1AgPSBrXHUyMDgxXHUwMEI3UCArIGtcdTIwODJcdTAwQjdcdTAzQzgoUClgXG4gKiA0LiBUd28gMTI4LWJpdCBwb2ludC1ieS1zY2FsYXIgbXVsdGlwbGljYXRpb25zICsgb25lIHBvaW50IGFkZGl0aW9uIGlzIGZhc3RlciB0aGFuXG4gKiAgICBvbmUgMjU2LWJpdCBtdWx0aXBsaWNhdGlvbi5cbiAqXG4gKiB3aGVyZVxuICogKiBiZXRhOiBcdTAzQjIgXHUyMjA4IEZcdTIwOUEgd2l0aCBcdTAzQjJcdTAwQjMgPSAxLCBcdTAzQjIgXHUyMjYwIDFcbiAqICogbGFtYmRhOiBcdTAzQkIgXHUyMjA4IEZcdTIwOTkgd2l0aCBcdTAzQkJcdTAwQjMgPSAxLCBcdTAzQkIgXHUyMjYwIDFcbiAqICogc3BsaXRTY2FsYXIgZGVjb21wb3NlcyBrIFx1MjFBNiBrXHUyMDgxLCBrXHUyMDgyLCBieSB1c2luZyByZWR1Y2VkIGJhc2lzIHZlY3RvcnMuXG4gKiAgIEdhdXNzIGxhdHRpY2UgcmVkdWN0aW9uIGNhbGN1bGF0ZXMgdGhlbSBmcm9tIGluaXRpYWwgYmFzaXMgdmVjdG9ycyBgKG4sIDApLCAoLVx1MDNCQiwgMClgXG4gKlxuICogQ2hlY2sgb3V0IGB0ZXN0L21pc2MvZW5kb21vcnBoaXNtLmpzYCBhbmRcbiAqIFtnaXN0XShodHRwczovL2dpc3QuZ2l0aHViLmNvbS9wYXVsbWlsbHIvZWI2NzA4MDY3OTNlODRkZjYyOGE3YzQzNGE4NzMwNjYpLlxuICovXG5leHBvcnQgdHlwZSBFbmRvbW9ycGhpc21PcHRzID0ge1xuICBiZXRhOiBiaWdpbnQ7XG4gIGJhc2lzZXM/OiBFbmRvQmFzaXM7XG4gIHNwbGl0U2NhbGFyPzogKGs6IGJpZ2ludCkgPT4geyBrMW5lZzogYm9vbGVhbjsgazE6IGJpZ2ludDsgazJuZWc6IGJvb2xlYW47IGsyOiBiaWdpbnQgfTtcbn07XG4vLyBXZSBjb25zdHJ1Y3QgYmFzaXMgaW4gc3VjaCB3YXkgdGhhdCBkZW4gaXMgYWx3YXlzIHBvc2l0aXZlIGFuZCBlcXVhbHMgbiwgYnV0IG51bSBzaWduIGRlcGVuZHMgb24gYmFzaXMgKG5vdCBvbiBzZWNyZXQgdmFsdWUpXG5jb25zdCBkaXZOZWFyZXN0ID0gKG51bTogYmlnaW50LCBkZW46IGJpZ2ludCkgPT4gKG51bSArIChudW0gPj0gMCA/IGRlbiA6IC1kZW4pIC8gXzJuKSAvIGRlbjtcblxuZXhwb3J0IHR5cGUgU2NhbGFyRW5kb1BhcnRzID0geyBrMW5lZzogYm9vbGVhbjsgazE6IGJpZ2ludDsgazJuZWc6IGJvb2xlYW47IGsyOiBiaWdpbnQgfTtcblxuLyoqXG4gKiBTcGxpdHMgc2NhbGFyIGZvciBHTFYgZW5kb21vcnBoaXNtLlxuICovXG5leHBvcnQgZnVuY3Rpb24gX3NwbGl0RW5kb1NjYWxhcihrOiBiaWdpbnQsIGJhc2lzOiBFbmRvQmFzaXMsIG46IGJpZ2ludCk6IFNjYWxhckVuZG9QYXJ0cyB7XG4gIC8vIFNwbGl0IHNjYWxhciBpbnRvIHR3byBzdWNoIHRoYXQgcGFydCBpcyB+aGFsZiBiaXRzOiBgYWJzKHBhcnQpIDwgc3FydChOKWBcbiAgLy8gU2luY2UgcGFydCBjYW4gYmUgbmVnYXRpdmUsIHdlIG5lZWQgdG8gZG8gdGhpcyBvbiBwb2ludC5cbiAgLy8gVE9ETzogdmVyaWZ5U2NhbGFyIGZ1bmN0aW9uIHdoaWNoIGNvbnN1bWVzIGxhbWJkYVxuICBjb25zdCBbW2ExLCBiMV0sIFthMiwgYjJdXSA9IGJhc2lzO1xuICBjb25zdCBjMSA9IGRpdk5lYXJlc3QoYjIgKiBrLCBuKTtcbiAgY29uc3QgYzIgPSBkaXZOZWFyZXN0KC1iMSAqIGssIG4pO1xuICAvLyB8azF8L3xrMnwgaXMgPCBzcXJ0KE4pLCBidXQgY2FuIGJlIG5lZ2F0aXZlLlxuICAvLyBJZiB3ZSBkbyBgazEgbW9kIE5gLCB3ZSdsbCBnZXQgYmlnIHNjYWxhciAoYD4gc3FydChOKWApOiBzbywgd2UgZG8gY2hlYXBlciBuZWdhdGlvbiBpbnN0ZWFkLlxuICBsZXQgazEgPSBrIC0gYzEgKiBhMSAtIGMyICogYTI7XG4gIGxldCBrMiA9IC1jMSAqIGIxIC0gYzIgKiBiMjtcbiAgY29uc3QgazFuZWcgPSBrMSA8IF8wbjtcbiAgY29uc3QgazJuZWcgPSBrMiA8IF8wbjtcbiAgaWYgKGsxbmVnKSBrMSA9IC1rMTtcbiAgaWYgKGsybmVnKSBrMiA9IC1rMjtcbiAgLy8gRG91YmxlIGNoZWNrIHRoYXQgcmVzdWx0aW5nIHNjYWxhciBsZXNzIHRoYW4gaGFsZiBiaXRzIG9mIE46IG90aGVyd2lzZSB3TkFGIHdpbGwgZmFpbC5cbiAgLy8gVGhpcyBzaG91bGQgb25seSBoYXBwZW4gb24gd3JvbmcgYmFzaXNlcy4gQWxzbywgbWF0aCBpbnNpZGUgaXMgdG9vIGNvbXBsZXggYW5kIEkgZG9uJ3QgdHJ1c3QgaXQuXG4gIGNvbnN0IE1BWF9OVU0gPSBiaXRNYXNrKE1hdGguY2VpbChiaXRMZW4obikgLyAyKSkgKyBfMW47IC8vIEhhbGYgYml0cyBvZiBOXG4gIGlmIChrMSA8IF8wbiB8fCBrMSA+PSBNQVhfTlVNIHx8IGsyIDwgXzBuIHx8IGsyID49IE1BWF9OVU0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NwbGl0U2NhbGFyIChlbmRvbW9ycGhpc20pOiBmYWlsZWQsIGs9JyArIGspO1xuICB9XG4gIHJldHVybiB7IGsxbmVnLCBrMSwgazJuZWcsIGsyIH07XG59XG5cbi8qKlxuICogT3B0aW9uIHRvIGVuYWJsZSBoZWRnZWQgc2lnbmF0dXJlcyB3aXRoIGltcHJvdmVkIHNlY3VyaXR5LlxuICpcbiAqICogUmFuZG9tbHkgZ2VuZXJhdGVkIGsgaXMgYmFkLCBiZWNhdXNlIGJyb2tlbiBDU1BSTkcgd291bGQgbGVhayBwcml2YXRlIGtleXMuXG4gKiAqIERldGVybWluaXN0aWMgayAoUkZDNjk3OSkgaXMgYmV0dGVyOyBidXQgaXMgc3VzcGVjdGlibGUgdG8gZmF1bHQgYXR0YWNrcy5cbiAqXG4gKiBXZSBhbGxvdyB1c2luZyB0ZWNobmlxdWUgZGVzY3JpYmVkIGluIFJGQzY5NzkgMy42OiBhZGRpdGlvbmFsIGsnLCBhLmsuYS4gYWRkaW5nIHJhbmRvbW5lc3NcbiAqIHRvIGRldGVybWluaXN0aWMgc2lnLiBJZiBDU1BSTkcgaXMgYnJva2VuICYgcmFuZG9tbmVzcyBpcyB3ZWFrLCBpdCB3b3VsZCBTVElMTCBiZSBhcyBzZWN1cmVcbiAqIGFzIG9yZGluYXJ5IHNpZyB3aXRob3V0IEV4dHJhRW50cm9weS5cbiAqXG4gKiAqIGB0cnVlYCBtZWFucyBcImZldGNoIGRhdGEsIGZyb20gQ1NQUk5HLCBpbmNvcnBvcmF0ZSBpdCBpbnRvIGsgZ2VuZXJhdGlvblwiXG4gKiAqIGBmYWxzZWAgbWVhbnMgXCJkaXNhYmxlIGV4dHJhIGVudHJvcHksIHVzZSBwdXJlbHkgZGV0ZXJtaW5pc3RpYyBrXCJcbiAqICogYFVpbnQ4QXJyYXlgIHBhc3NlZCBtZWFucyBcImluY29ycG9yYXRlIGZvbGxvd2luZyBkYXRhIGludG8gayBnZW5lcmF0aW9uXCJcbiAqXG4gKiBodHRwczovL3BhdWxtaWxsci5jb20vcG9zdHMvZGV0ZXJtaW5pc3RpYy1zaWduYXR1cmVzL1xuICovXG5leHBvcnQgdHlwZSBFQ0RTQUV4dHJhRW50cm9weSA9IGJvb2xlYW4gfCBVaW50OEFycmF5O1xuLyoqXG4gKiAtIGBjb21wYWN0YCBpcyB0aGUgZGVmYXVsdCBmb3JtYXRcbiAqIC0gYHJlY292ZXJlZGAgaXMgdGhlIHNhbWUgYXMgY29tcGFjdCwgYnV0IHdpdGggYW4gZXh0cmEgYnl0ZSBpbmRpY2F0aW5nIHJlY292ZXJ5IGJ5dGVcbiAqIC0gYGRlcmAgaXMgQVNOLjEgREVSIGVuY29kaW5nXG4gKi9cbmV4cG9ydCB0eXBlIEVDRFNBU2lnbmF0dXJlRm9ybWF0ID0gJ2NvbXBhY3QnIHwgJ3JlY292ZXJlZCcgfCAnZGVyJztcbi8qKlxuICogLSBgcHJlaGFzaGA6IChkZWZhdWx0OiB0cnVlKSBpbmRpY2F0ZXMgd2hldGhlciB0byBkbyBzaGEyNTYobWVzc2FnZSkuXG4gKiAgIFdoZW4gYSBjdXN0b20gaGFzaCBpcyB1c2VkLCBpdCBtdXN0IGJlIHNldCB0byBgZmFsc2VgLlxuICovXG5leHBvcnQgdHlwZSBFQ0RTQVJlY292ZXJPcHRzID0ge1xuICBwcmVoYXNoPzogYm9vbGVhbjtcbn07XG4vKipcbiAqIC0gYHByZWhhc2hgOiAoZGVmYXVsdDogdHJ1ZSkgaW5kaWNhdGVzIHdoZXRoZXIgdG8gZG8gc2hhMjU2KG1lc3NhZ2UpLlxuICogICBXaGVuIGEgY3VzdG9tIGhhc2ggaXMgdXNlZCwgaXQgbXVzdCBiZSBzZXQgdG8gYGZhbHNlYC5cbiAqIC0gYGxvd1NgOiAoZGVmYXVsdDogdHJ1ZSkgcHJvaGliaXRzIHNpZ25hdHVyZXMgd2hpY2ggaGF2ZSAoc2lnLnMgPj0gQ1VSVkUubi8ybikuXG4gKiAgIENvbXBhdGlibGUgd2l0aCBCVEMvRVRILiBTZXR0aW5nIGBsb3dTOiBmYWxzZWAgYWxsb3dzIHRvIGNyZWF0ZSBtYWxsZWFibGUgc2lnbmF0dXJlcyxcbiAqICAgd2hpY2ggaXMgZGVmYXVsdCBvcGVuc3NsIGJlaGF2aW9yLlxuICogICBOb24tbWFsbGVhYmxlIHNpZ25hdHVyZXMgY2FuIHN0aWxsIGJlIHN1Y2Nlc3NmdWxseSB2ZXJpZmllZCBpbiBvcGVuc3NsLlxuICogLSBgZm9ybWF0YDogKGRlZmF1bHQ6ICdjb21wYWN0JykgJ2NvbXBhY3QnIG9yICdyZWNvdmVyZWQnIHdpdGggcmVjb3ZlcnkgYnl0ZVxuICovXG5leHBvcnQgdHlwZSBFQ0RTQVZlcmlmeU9wdHMgPSB7XG4gIHByZWhhc2g/OiBib29sZWFuO1xuICBsb3dTPzogYm9vbGVhbjtcbiAgZm9ybWF0PzogRUNEU0FTaWduYXR1cmVGb3JtYXQ7XG59O1xuLyoqXG4gKiAtIGBwcmVoYXNoYDogKGRlZmF1bHQ6IHRydWUpIGluZGljYXRlcyB3aGV0aGVyIHRvIGRvIHNoYTI1NihtZXNzYWdlKS5cbiAqICAgV2hlbiBhIGN1c3RvbSBoYXNoIGlzIHVzZWQsIGl0IG11c3QgYmUgc2V0IHRvIGBmYWxzZWAuXG4gKiAtIGBsb3dTYDogKGRlZmF1bHQ6IHRydWUpIHByb2hpYml0cyBzaWduYXR1cmVzIHdoaWNoIGhhdmUgKHNpZy5zID49IENVUlZFLm4vMm4pLlxuICogICBDb21wYXRpYmxlIHdpdGggQlRDL0VUSC4gU2V0dGluZyBgbG93UzogZmFsc2VgIGFsbG93cyB0byBjcmVhdGUgbWFsbGVhYmxlIHNpZ25hdHVyZXMsXG4gKiAgIHdoaWNoIGlzIGRlZmF1bHQgb3BlbnNzbCBiZWhhdmlvci5cbiAqICAgTm9uLW1hbGxlYWJsZSBzaWduYXR1cmVzIGNhbiBzdGlsbCBiZSBzdWNjZXNzZnVsbHkgdmVyaWZpZWQgaW4gb3BlbnNzbC5cbiAqIC0gYGZvcm1hdGA6IChkZWZhdWx0OiAnY29tcGFjdCcpICdjb21wYWN0JyBvciAncmVjb3ZlcmVkJyB3aXRoIHJlY292ZXJ5IGJ5dGVcbiAqIC0gYGV4dHJhRW50cm9weWA6IChkZWZhdWx0OiBmYWxzZSkgY3JlYXRlcyBzaWdzIHdpdGggaW5jcmVhc2VkIHNlY3VyaXR5LCBzZWUge0BsaW5rIEVDRFNBRXh0cmFFbnRyb3B5fVxuICovXG5leHBvcnQgdHlwZSBFQ0RTQVNpZ25PcHRzID0ge1xuICBwcmVoYXNoPzogYm9vbGVhbjtcbiAgbG93Uz86IGJvb2xlYW47XG4gIGZvcm1hdD86IEVDRFNBU2lnbmF0dXJlRm9ybWF0O1xuICBleHRyYUVudHJvcHk/OiBFQ0RTQUV4dHJhRW50cm9weTtcbn07XG5cbmZ1bmN0aW9uIHZhbGlkYXRlU2lnRm9ybWF0KGZvcm1hdDogc3RyaW5nKTogRUNEU0FTaWduYXR1cmVGb3JtYXQge1xuICBpZiAoIVsnY29tcGFjdCcsICdyZWNvdmVyZWQnLCAnZGVyJ10uaW5jbHVkZXMoZm9ybWF0KSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1NpZ25hdHVyZSBmb3JtYXQgbXVzdCBiZSBcImNvbXBhY3RcIiwgXCJyZWNvdmVyZWRcIiwgb3IgXCJkZXJcIicpO1xuICByZXR1cm4gZm9ybWF0IGFzIEVDRFNBU2lnbmF0dXJlRm9ybWF0O1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZVNpZ09wdHM8VCBleHRlbmRzIEVDRFNBU2lnbk9wdHMsIEQgZXh0ZW5kcyBSZXF1aXJlZDxFQ0RTQVNpZ25PcHRzPj4oXG4gIG9wdHM6IFQsXG4gIGRlZjogRFxuKTogUmVxdWlyZWQ8RUNEU0FTaWduT3B0cz4ge1xuICBjb25zdCBvcHRzbjogRUNEU0FTaWduT3B0cyA9IHt9O1xuICBmb3IgKGxldCBvcHROYW1lIG9mIE9iamVjdC5rZXlzKGRlZikpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgb3B0c25bb3B0TmFtZV0gPSBvcHRzW29wdE5hbWVdID09PSB1bmRlZmluZWQgPyBkZWZbb3B0TmFtZV0gOiBvcHRzW29wdE5hbWVdO1xuICB9XG4gIGFib29sKG9wdHNuLmxvd1MhLCAnbG93UycpO1xuICBhYm9vbChvcHRzbi5wcmVoYXNoISwgJ3ByZWhhc2gnKTtcbiAgaWYgKG9wdHNuLmZvcm1hdCAhPT0gdW5kZWZpbmVkKSB2YWxpZGF0ZVNpZ0Zvcm1hdChvcHRzbi5mb3JtYXQpO1xuICByZXR1cm4gb3B0c24gYXMgUmVxdWlyZWQ8RUNEU0FTaWduT3B0cz47XG59XG5cbi8qKiBJbnN0YW5jZSBtZXRob2RzIGZvciAzRCBYWVogcHJvamVjdGl2ZSBwb2ludHMuICovXG5leHBvcnQgaW50ZXJmYWNlIFdlaWVyc3RyYXNzUG9pbnQ8VD4gZXh0ZW5kcyBDdXJ2ZVBvaW50PFQsIFdlaWVyc3RyYXNzUG9pbnQ8VD4+IHtcbiAgLyoqIHByb2plY3RpdmUgWCBjb29yZGluYXRlLiBEaWZmZXJlbnQgZnJvbSBhZmZpbmUgeC4gKi9cbiAgcmVhZG9ubHkgWDogVDtcbiAgLyoqIHByb2plY3RpdmUgWSBjb29yZGluYXRlLiBEaWZmZXJlbnQgZnJvbSBhZmZpbmUgeS4gKi9cbiAgcmVhZG9ubHkgWTogVDtcbiAgLyoqIHByb2plY3RpdmUgeiBjb29yZGluYXRlICovXG4gIHJlYWRvbmx5IFo6IFQ7XG4gIC8qKiBhZmZpbmUgeCBjb29yZGluYXRlLiBEaWZmZXJlbnQgZnJvbSBwcm9qZWN0aXZlIFguICovXG4gIGdldCB4KCk6IFQ7XG4gIC8qKiBhZmZpbmUgeSBjb29yZGluYXRlLiBEaWZmZXJlbnQgZnJvbSBwcm9qZWN0aXZlIFkuICovXG4gIGdldCB5KCk6IFQ7XG4gIC8qKiBFbmNvZGVzIHBvaW50IHVzaW5nIElFRUUgUDEzNjMgKERFUikgZW5jb2RpbmcuIEZpcnN0IGJ5dGUgaXMgMi8zLzQuIERlZmF1bHQgPSBpc0NvbXByZXNzZWQuICovXG4gIHRvQnl0ZXMoaXNDb21wcmVzc2VkPzogYm9vbGVhbik6IFVpbnQ4QXJyYXk7XG4gIHRvSGV4KGlzQ29tcHJlc3NlZD86IGJvb2xlYW4pOiBzdHJpbmc7XG59XG5cbi8qKiBTdGF0aWMgbWV0aG9kcyBmb3IgM0QgWFlaIHByb2plY3RpdmUgcG9pbnRzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBXZWllcnN0cmFzc1BvaW50Q29uczxUPiBleHRlbmRzIEN1cnZlUG9pbnRDb25zPFdlaWVyc3RyYXNzUG9pbnQ8VD4+IHtcbiAgLyoqIERvZXMgTk9UIHZhbGlkYXRlIGlmIHRoZSBwb2ludCBpcyB2YWxpZC4gVXNlIGAuYXNzZXJ0VmFsaWRpdHkoKWAuICovXG4gIG5ldyAoWDogVCwgWTogVCwgWjogVCk6IFdlaWVyc3RyYXNzUG9pbnQ8VD47XG4gIENVUlZFKCk6IFdlaWVyc3RyYXNzT3B0czxUPjtcbn1cblxuLyoqXG4gKiBXZWllcnN0cmFzcyBjdXJ2ZSBvcHRpb25zLlxuICpcbiAqICogcDogcHJpbWUgY2hhcmFjdGVyaXN0aWMgKG9yZGVyKSBvZiBmaW5pdGUgZmllbGQsIGluIHdoaWNoIGFyaXRobWV0aWNzIGlzIGRvbmVcbiAqICogbjogb3JkZXIgb2YgcHJpbWUgc3ViZ3JvdXAgYS5rLmEgdG90YWwgYW1vdW50IG9mIHZhbGlkIGN1cnZlIHBvaW50c1xuICogKiBoOiBjb2ZhY3RvciwgdXN1YWxseSAxLiBoKm4gaXMgZ3JvdXAgb3JkZXI7IG4gaXMgc3ViZ3JvdXAgb3JkZXJcbiAqICogYTogZm9ybXVsYSBwYXJhbSwgbXVzdCBiZSBpbiBmaWVsZCBvZiBwXG4gKiAqIGI6IGZvcm11bGEgcGFyYW0sIG11c3QgYmUgaW4gZmllbGQgb2YgcFxuICogKiBHeDogeCBjb29yZGluYXRlIG9mIGdlbmVyYXRvciBwb2ludCBhLmsuYS4gYmFzZSBwb2ludFxuICogKiBHeTogeSBjb29yZGluYXRlIG9mIGdlbmVyYXRvciBwb2ludFxuICovXG5leHBvcnQgdHlwZSBXZWllcnN0cmFzc09wdHM8VD4gPSBSZWFkb25seTx7XG4gIHA6IGJpZ2ludDtcbiAgbjogYmlnaW50O1xuICBoOiBiaWdpbnQ7XG4gIGE6IFQ7XG4gIGI6IFQ7XG4gIEd4OiBUO1xuICBHeTogVDtcbn0+O1xuXG4vLyBXaGVuIGEgY29mYWN0b3IgIT0gMSwgdGhlcmUgY2FuIGJlIGFuIGVmZmVjdGl2ZSBtZXRob2RzIHRvOlxuLy8gMS4gRGV0ZXJtaW5lIHdoZXRoZXIgYSBwb2ludCBpcyB0b3JzaW9uLWZyZWVcbi8vIDIuIENsZWFyIHRvcnNpb24gY29tcG9uZW50XG5leHBvcnQgdHlwZSBXZWllcnN0cmFzc0V4dHJhT3B0czxUPiA9IFBhcnRpYWw8e1xuICBGcDogSUZpZWxkPFQ+O1xuICBGbjogSUZpZWxkPGJpZ2ludD47XG4gIGFsbG93SW5maW5pdHlQb2ludDogYm9vbGVhbjtcbiAgZW5kbzogRW5kb21vcnBoaXNtT3B0cztcbiAgaXNUb3JzaW9uRnJlZTogKGM6IFdlaWVyc3RyYXNzUG9pbnRDb25zPFQ+LCBwb2ludDogV2VpZXJzdHJhc3NQb2ludDxUPikgPT4gYm9vbGVhbjtcbiAgY2xlYXJDb2ZhY3RvcjogKGM6IFdlaWVyc3RyYXNzUG9pbnRDb25zPFQ+LCBwb2ludDogV2VpZXJzdHJhc3NQb2ludDxUPikgPT4gV2VpZXJzdHJhc3NQb2ludDxUPjtcbiAgZnJvbUJ5dGVzOiAoYnl0ZXM6IFVpbnQ4QXJyYXkpID0+IEFmZmluZVBvaW50PFQ+O1xuICB0b0J5dGVzOiAoXG4gICAgYzogV2VpZXJzdHJhc3NQb2ludENvbnM8VD4sXG4gICAgcG9pbnQ6IFdlaWVyc3RyYXNzUG9pbnQ8VD4sXG4gICAgaXNDb21wcmVzc2VkOiBib29sZWFuXG4gICkgPT4gVWludDhBcnJheTtcbn0+O1xuXG4vKipcbiAqIE9wdGlvbnMgZm9yIEVDRFNBIHNpZ25hdHVyZXMgb3ZlciBhIFdlaWVyc3RyYXNzIGN1cnZlLlxuICpcbiAqICogbG93UzogKGRlZmF1bHQ6IHRydWUpIHdoZXRoZXIgcHJvZHVjZWQgLyB2ZXJpZmllZCBzaWduYXR1cmVzIG9jY3VweSBsb3cgaGFsZiBvZiBlY2RzYU9wdHMucC4gUHJldmVudHMgbWFsbGVhYmlsaXR5LlxuICogKiBobWFjOiAoZGVmYXVsdDogbm9ibGUtaGFzaGVzIGhtYWMpIGZ1bmN0aW9uLCB3b3VsZCBiZSB1c2VkIHRvIGluaXQgaG1hYy1kcmJnIGZvciBrIGdlbmVyYXRpb24uXG4gKiAqIHJhbmRvbUJ5dGVzOiAoZGVmYXVsdDogd2ViY3J5cHRvIG9zLWxldmVsIENTUFJORykgY3VzdG9tIG1ldGhvZCBmb3IgZmV0Y2hpbmcgc2VjdXJlIHJhbmRvbW5lc3MuXG4gKiAqIGJpdHMyaW50LCBiaXRzMmludF9tb2ROOiB1c2VkIGluIHNpZ3MsIHNvbWV0aW1lcyBvdmVycmlkZGVuIGJ5IGN1cnZlc1xuICovXG5leHBvcnQgdHlwZSBFQ0RTQU9wdHMgPSBQYXJ0aWFsPHtcbiAgbG93UzogYm9vbGVhbjtcbiAgaG1hYzogKGtleTogVWludDhBcnJheSwgbWVzc2FnZTogVWludDhBcnJheSkgPT4gVWludDhBcnJheTtcbiAgcmFuZG9tQnl0ZXM6IChieXRlc0xlbmd0aD86IG51bWJlcikgPT4gVWludDhBcnJheTtcbiAgYml0czJpbnQ6IChieXRlczogVWludDhBcnJheSkgPT4gYmlnaW50O1xuICBiaXRzMmludF9tb2ROOiAoYnl0ZXM6IFVpbnQ4QXJyYXkpID0+IGJpZ2ludDtcbn0+O1xuXG4vKipcbiAqIEVsbGlwdGljIEN1cnZlIERpZmZpZS1IZWxsbWFuIGludGVyZmFjZS5cbiAqIFByb3ZpZGVzIGtleWdlbiwgc2VjcmV0LXRvLXB1YmxpYyBjb252ZXJzaW9uLCBjYWxjdWxhdGluZyBzaGFyZWQgc2VjcmV0cy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFQ0RIIHtcbiAga2V5Z2VuOiAoc2VlZD86IFVpbnQ4QXJyYXkpID0+IHsgc2VjcmV0S2V5OiBVaW50OEFycmF5OyBwdWJsaWNLZXk6IFVpbnQ4QXJyYXkgfTtcbiAgZ2V0UHVibGljS2V5OiAoc2VjcmV0S2V5OiBVaW50OEFycmF5LCBpc0NvbXByZXNzZWQ/OiBib29sZWFuKSA9PiBVaW50OEFycmF5O1xuICBnZXRTaGFyZWRTZWNyZXQ6IChcbiAgICBzZWNyZXRLZXlBOiBVaW50OEFycmF5LFxuICAgIHB1YmxpY0tleUI6IFVpbnQ4QXJyYXksXG4gICAgaXNDb21wcmVzc2VkPzogYm9vbGVhblxuICApID0+IFVpbnQ4QXJyYXk7XG4gIFBvaW50OiBXZWllcnN0cmFzc1BvaW50Q29uczxiaWdpbnQ+O1xuICB1dGlsczoge1xuICAgIGlzVmFsaWRTZWNyZXRLZXk6IChzZWNyZXRLZXk6IFVpbnQ4QXJyYXkpID0+IGJvb2xlYW47XG4gICAgaXNWYWxpZFB1YmxpY0tleTogKHB1YmxpY0tleTogVWludDhBcnJheSwgaXNDb21wcmVzc2VkPzogYm9vbGVhbikgPT4gYm9vbGVhbjtcbiAgICByYW5kb21TZWNyZXRLZXk6IChzZWVkPzogVWludDhBcnJheSkgPT4gVWludDhBcnJheTtcbiAgfTtcbiAgbGVuZ3RoczogQ3VydmVMZW5ndGhzO1xufVxuXG4vKipcbiAqIEVDRFNBIGludGVyZmFjZS5cbiAqIE9ubHkgc3VwcG9ydGVkIGZvciBwcmltZSBmaWVsZHMsIG5vdCBGcDIgKGV4dGVuc2lvbiBmaWVsZHMpLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVDRFNBIGV4dGVuZHMgRUNESCB7XG4gIHNpZ246IChtZXNzYWdlOiBVaW50OEFycmF5LCBzZWNyZXRLZXk6IFVpbnQ4QXJyYXksIG9wdHM/OiBFQ0RTQVNpZ25PcHRzKSA9PiBVaW50OEFycmF5O1xuICB2ZXJpZnk6IChcbiAgICBzaWduYXR1cmU6IFVpbnQ4QXJyYXksXG4gICAgbWVzc2FnZTogVWludDhBcnJheSxcbiAgICBwdWJsaWNLZXk6IFVpbnQ4QXJyYXksXG4gICAgb3B0cz86IEVDRFNBVmVyaWZ5T3B0c1xuICApID0+IGJvb2xlYW47XG4gIHJlY292ZXJQdWJsaWNLZXkoc2lnbmF0dXJlOiBVaW50OEFycmF5LCBtZXNzYWdlOiBVaW50OEFycmF5LCBvcHRzPzogRUNEU0FSZWNvdmVyT3B0cyk6IFVpbnQ4QXJyYXk7XG4gIFNpZ25hdHVyZTogRUNEU0FTaWduYXR1cmVDb25zO1xufVxuZXhwb3J0IGNsYXNzIERFUkVyciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobSA9ICcnKSB7XG4gICAgc3VwZXIobSk7XG4gIH1cbn1cbmV4cG9ydCB0eXBlIElERVIgPSB7XG4gIC8vIGFzbi4xIERFUiBlbmNvZGluZyB1dGlsc1xuICBFcnI6IHR5cGVvZiBERVJFcnI7XG4gIC8vIEJhc2ljIGJ1aWxkaW5nIGJsb2NrIGlzIFRMViAoVGFnLUxlbmd0aC1WYWx1ZSlcbiAgX3Rsdjoge1xuICAgIGVuY29kZTogKHRhZzogbnVtYmVyLCBkYXRhOiBzdHJpbmcpID0+IHN0cmluZztcbiAgICAvLyB2IC0gdmFsdWUsIGwgLSBsZWZ0IGJ5dGVzICh1bnBhcnNlZClcbiAgICBkZWNvZGUodGFnOiBudW1iZXIsIGRhdGE6IFVpbnQ4QXJyYXkpOiB7IHY6IFVpbnQ4QXJyYXk7IGw6IFVpbnQ4QXJyYXkgfTtcbiAgfTtcbiAgLy8gaHR0cHM6Ly9jcnlwdG8uc3RhY2tleGNoYW5nZS5jb20vYS81NzczNCBMZWZ0bW9zdCBiaXQgb2YgZmlyc3QgYnl0ZSBpcyAnbmVnYXRpdmUnIGZsYWcsXG4gIC8vIHNpbmNlIHdlIGFsd2F5cyB1c2UgcG9zaXRpdmUgaW50ZWdlcnMgaGVyZS4gSXQgbXVzdCBhbHdheXMgYmUgZW1wdHk6XG4gIC8vIC0gYWRkIHplcm8gYnl0ZSBpZiBleGlzdHNcbiAgLy8gLSBpZiBuZXh0IGJ5dGUgZG9lc24ndCBoYXZlIGEgZmxhZywgbGVhZGluZyB6ZXJvIGlzIG5vdCBhbGxvd2VkIChtaW5pbWFsIGVuY29kaW5nKVxuICBfaW50OiB7XG4gICAgZW5jb2RlKG51bTogYmlnaW50KTogc3RyaW5nO1xuICAgIGRlY29kZShkYXRhOiBVaW50OEFycmF5KTogYmlnaW50O1xuICB9O1xuICB0b1NpZyhoZXg6IHN0cmluZyB8IFVpbnQ4QXJyYXkpOiB7IHI6IGJpZ2ludDsgczogYmlnaW50IH07XG4gIGhleEZyb21TaWcoc2lnOiB7IHI6IGJpZ2ludDsgczogYmlnaW50IH0pOiBzdHJpbmc7XG59O1xuLyoqXG4gKiBBU04uMSBERVIgZW5jb2RpbmcgdXRpbGl0aWVzLiBBU04gaXMgdmVyeSBjb21wbGV4ICYgZnJhZ2lsZS4gRm9ybWF0OlxuICpcbiAqICAgICBbMHgzMCAoU0VRVUVOQ0UpLCBieXRlbGVuZ3RoLCAweDAyIChJTlRFR0VSKSwgaW50TGVuZ3RoLCBSLCAweDAyIChJTlRFR0VSKSwgaW50TGVuZ3RoLCBTXVxuICpcbiAqIERvY3M6IGh0dHBzOi8vbGV0c2VuY3J5cHQub3JnL2RvY3MvYS13YXJtLXdlbGNvbWUtdG8tYXNuMS1hbmQtZGVyLywgaHR0cHM6Ly9sdWNhLm50b3Aub3JnL1RlYWNoaW5nL0FwcHVudGkvYXNuMS5odG1sXG4gKi9cbmV4cG9ydCBjb25zdCBERVI6IElERVIgPSB7XG4gIC8vIGFzbi4xIERFUiBlbmNvZGluZyB1dGlsc1xuICBFcnI6IERFUkVycixcbiAgLy8gQmFzaWMgYnVpbGRpbmcgYmxvY2sgaXMgVExWIChUYWctTGVuZ3RoLVZhbHVlKVxuICBfdGx2OiB7XG4gICAgZW5jb2RlOiAodGFnOiBudW1iZXIsIGRhdGE6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICBjb25zdCB7IEVycjogRSB9ID0gREVSO1xuICAgICAgaWYgKHRhZyA8IDAgfHwgdGFnID4gMjU2KSB0aHJvdyBuZXcgRSgndGx2LmVuY29kZTogd3JvbmcgdGFnJyk7XG4gICAgICBpZiAoZGF0YS5sZW5ndGggJiAxKSB0aHJvdyBuZXcgRSgndGx2LmVuY29kZTogdW5wYWRkZWQgZGF0YScpO1xuICAgICAgY29uc3QgZGF0YUxlbiA9IGRhdGEubGVuZ3RoIC8gMjtcbiAgICAgIGNvbnN0IGxlbiA9IG51bWJlclRvSGV4VW5wYWRkZWQoZGF0YUxlbik7XG4gICAgICBpZiAoKGxlbi5sZW5ndGggLyAyKSAmIDBiMTAwMF8wMDAwKSB0aHJvdyBuZXcgRSgndGx2LmVuY29kZTogbG9uZyBmb3JtIGxlbmd0aCB0b28gYmlnJyk7XG4gICAgICAvLyBsZW5ndGggb2YgbGVuZ3RoIHdpdGggbG9uZyBmb3JtIGZsYWdcbiAgICAgIGNvbnN0IGxlbkxlbiA9IGRhdGFMZW4gPiAxMjcgPyBudW1iZXJUb0hleFVucGFkZGVkKChsZW4ubGVuZ3RoIC8gMikgfCAwYjEwMDBfMDAwMCkgOiAnJztcbiAgICAgIGNvbnN0IHQgPSBudW1iZXJUb0hleFVucGFkZGVkKHRhZyk7XG4gICAgICByZXR1cm4gdCArIGxlbkxlbiArIGxlbiArIGRhdGE7XG4gICAgfSxcbiAgICAvLyB2IC0gdmFsdWUsIGwgLSBsZWZ0IGJ5dGVzICh1bnBhcnNlZClcbiAgICBkZWNvZGUodGFnOiBudW1iZXIsIGRhdGE6IFVpbnQ4QXJyYXkpOiB7IHY6IFVpbnQ4QXJyYXk7IGw6IFVpbnQ4QXJyYXkgfSB7XG4gICAgICBjb25zdCB7IEVycjogRSB9ID0gREVSO1xuICAgICAgbGV0IHBvcyA9IDA7XG4gICAgICBpZiAodGFnIDwgMCB8fCB0YWcgPiAyNTYpIHRocm93IG5ldyBFKCd0bHYuZW5jb2RlOiB3cm9uZyB0YWcnKTtcbiAgICAgIGlmIChkYXRhLmxlbmd0aCA8IDIgfHwgZGF0YVtwb3MrK10gIT09IHRhZykgdGhyb3cgbmV3IEUoJ3Rsdi5kZWNvZGU6IHdyb25nIHRsdicpO1xuICAgICAgY29uc3QgZmlyc3QgPSBkYXRhW3BvcysrXTtcbiAgICAgIGNvbnN0IGlzTG9uZyA9ICEhKGZpcnN0ICYgMGIxMDAwXzAwMDApOyAvLyBGaXJzdCBiaXQgb2YgZmlyc3QgbGVuZ3RoIGJ5dGUgaXMgZmxhZyBmb3Igc2hvcnQvbG9uZyBmb3JtXG4gICAgICBsZXQgbGVuZ3RoID0gMDtcbiAgICAgIGlmICghaXNMb25nKSBsZW5ndGggPSBmaXJzdDtcbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBMb25nIGZvcm06IFtsb25nRmxhZygxYml0KSwgbGVuZ3RoTGVuZ3RoKDdiaXQpLCBsZW5ndGggKEJFKV1cbiAgICAgICAgY29uc3QgbGVuTGVuID0gZmlyc3QgJiAwYjAxMTFfMTExMTtcbiAgICAgICAgaWYgKCFsZW5MZW4pIHRocm93IG5ldyBFKCd0bHYuZGVjb2RlKGxvbmcpOiBpbmRlZmluaXRlIGxlbmd0aCBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgIGlmIChsZW5MZW4gPiA0KSB0aHJvdyBuZXcgRSgndGx2LmRlY29kZShsb25nKTogYnl0ZSBsZW5ndGggaXMgdG9vIGJpZycpOyAvLyB0aGlzIHdpbGwgb3ZlcmZsb3cgdTMyIGluIGpzXG4gICAgICAgIGNvbnN0IGxlbmd0aEJ5dGVzID0gZGF0YS5zdWJhcnJheShwb3MsIHBvcyArIGxlbkxlbik7XG4gICAgICAgIGlmIChsZW5ndGhCeXRlcy5sZW5ndGggIT09IGxlbkxlbikgdGhyb3cgbmV3IEUoJ3Rsdi5kZWNvZGU6IGxlbmd0aCBieXRlcyBub3QgY29tcGxldGUnKTtcbiAgICAgICAgaWYgKGxlbmd0aEJ5dGVzWzBdID09PSAwKSB0aHJvdyBuZXcgRSgndGx2LmRlY29kZShsb25nKTogemVybyBsZWZ0bW9zdCBieXRlJyk7XG4gICAgICAgIGZvciAoY29uc3QgYiBvZiBsZW5ndGhCeXRlcykgbGVuZ3RoID0gKGxlbmd0aCA8PCA4KSB8IGI7XG4gICAgICAgIHBvcyArPSBsZW5MZW47XG4gICAgICAgIGlmIChsZW5ndGggPCAxMjgpIHRocm93IG5ldyBFKCd0bHYuZGVjb2RlKGxvbmcpOiBub3QgbWluaW1hbCBlbmNvZGluZycpO1xuICAgICAgfVxuICAgICAgY29uc3QgdiA9IGRhdGEuc3ViYXJyYXkocG9zLCBwb3MgKyBsZW5ndGgpO1xuICAgICAgaWYgKHYubGVuZ3RoICE9PSBsZW5ndGgpIHRocm93IG5ldyBFKCd0bHYuZGVjb2RlOiB3cm9uZyB2YWx1ZSBsZW5ndGgnKTtcbiAgICAgIHJldHVybiB7IHYsIGw6IGRhdGEuc3ViYXJyYXkocG9zICsgbGVuZ3RoKSB9O1xuICAgIH0sXG4gIH0sXG4gIC8vIGh0dHBzOi8vY3J5cHRvLnN0YWNrZXhjaGFuZ2UuY29tL2EvNTc3MzQgTGVmdG1vc3QgYml0IG9mIGZpcnN0IGJ5dGUgaXMgJ25lZ2F0aXZlJyBmbGFnLFxuICAvLyBzaW5jZSB3ZSBhbHdheXMgdXNlIHBvc2l0aXZlIGludGVnZXJzIGhlcmUuIEl0IG11c3QgYWx3YXlzIGJlIGVtcHR5OlxuICAvLyAtIGFkZCB6ZXJvIGJ5dGUgaWYgZXhpc3RzXG4gIC8vIC0gaWYgbmV4dCBieXRlIGRvZXNuJ3QgaGF2ZSBhIGZsYWcsIGxlYWRpbmcgemVybyBpcyBub3QgYWxsb3dlZCAobWluaW1hbCBlbmNvZGluZylcbiAgX2ludDoge1xuICAgIGVuY29kZShudW06IGJpZ2ludCk6IHN0cmluZyB7XG4gICAgICBjb25zdCB7IEVycjogRSB9ID0gREVSO1xuICAgICAgaWYgKG51bSA8IF8wbikgdGhyb3cgbmV3IEUoJ2ludGVnZXI6IG5lZ2F0aXZlIGludGVnZXJzIGFyZSBub3QgYWxsb3dlZCcpO1xuICAgICAgbGV0IGhleCA9IG51bWJlclRvSGV4VW5wYWRkZWQobnVtKTtcbiAgICAgIC8vIFBhZCB3aXRoIHplcm8gYnl0ZSBpZiBuZWdhdGl2ZSBmbGFnIGlzIHByZXNlbnRcbiAgICAgIGlmIChOdW1iZXIucGFyc2VJbnQoaGV4WzBdLCAxNikgJiAwYjEwMDApIGhleCA9ICcwMCcgKyBoZXg7XG4gICAgICBpZiAoaGV4Lmxlbmd0aCAmIDEpIHRocm93IG5ldyBFKCd1bmV4cGVjdGVkIERFUiBwYXJzaW5nIGFzc2VydGlvbjogdW5wYWRkZWQgaGV4Jyk7XG4gICAgICByZXR1cm4gaGV4O1xuICAgIH0sXG4gICAgZGVjb2RlKGRhdGE6IFVpbnQ4QXJyYXkpOiBiaWdpbnQge1xuICAgICAgY29uc3QgeyBFcnI6IEUgfSA9IERFUjtcbiAgICAgIGlmIChkYXRhWzBdICYgMGIxMDAwXzAwMDApIHRocm93IG5ldyBFKCdpbnZhbGlkIHNpZ25hdHVyZSBpbnRlZ2VyOiBuZWdhdGl2ZScpO1xuICAgICAgaWYgKGRhdGFbMF0gPT09IDB4MDAgJiYgIShkYXRhWzFdICYgMGIxMDAwXzAwMDApKVxuICAgICAgICB0aHJvdyBuZXcgRSgnaW52YWxpZCBzaWduYXR1cmUgaW50ZWdlcjogdW5uZWNlc3NhcnkgbGVhZGluZyB6ZXJvJyk7XG4gICAgICByZXR1cm4gYnl0ZXNUb051bWJlckJFKGRhdGEpO1xuICAgIH0sXG4gIH0sXG4gIHRvU2lnKGJ5dGVzOiBVaW50OEFycmF5KTogeyByOiBiaWdpbnQ7IHM6IGJpZ2ludCB9IHtcbiAgICAvLyBwYXJzZSBERVIgc2lnbmF0dXJlXG4gICAgY29uc3QgeyBFcnI6IEUsIF9pbnQ6IGludCwgX3RsdjogdGx2IH0gPSBERVI7XG4gICAgY29uc3QgZGF0YSA9IGFieXRlcyhieXRlcywgdW5kZWZpbmVkLCAnc2lnbmF0dXJlJyk7XG4gICAgY29uc3QgeyB2OiBzZXFCeXRlcywgbDogc2VxTGVmdEJ5dGVzIH0gPSB0bHYuZGVjb2RlKDB4MzAsIGRhdGEpO1xuICAgIGlmIChzZXFMZWZ0Qnl0ZXMubGVuZ3RoKSB0aHJvdyBuZXcgRSgnaW52YWxpZCBzaWduYXR1cmU6IGxlZnQgYnl0ZXMgYWZ0ZXIgcGFyc2luZycpO1xuICAgIGNvbnN0IHsgdjogckJ5dGVzLCBsOiByTGVmdEJ5dGVzIH0gPSB0bHYuZGVjb2RlKDB4MDIsIHNlcUJ5dGVzKTtcbiAgICBjb25zdCB7IHY6IHNCeXRlcywgbDogc0xlZnRCeXRlcyB9ID0gdGx2LmRlY29kZSgweDAyLCByTGVmdEJ5dGVzKTtcbiAgICBpZiAoc0xlZnRCeXRlcy5sZW5ndGgpIHRocm93IG5ldyBFKCdpbnZhbGlkIHNpZ25hdHVyZTogbGVmdCBieXRlcyBhZnRlciBwYXJzaW5nJyk7XG4gICAgcmV0dXJuIHsgcjogaW50LmRlY29kZShyQnl0ZXMpLCBzOiBpbnQuZGVjb2RlKHNCeXRlcykgfTtcbiAgfSxcbiAgaGV4RnJvbVNpZyhzaWc6IHsgcjogYmlnaW50OyBzOiBiaWdpbnQgfSk6IHN0cmluZyB7XG4gICAgY29uc3QgeyBfdGx2OiB0bHYsIF9pbnQ6IGludCB9ID0gREVSO1xuICAgIGNvbnN0IHJzID0gdGx2LmVuY29kZSgweDAyLCBpbnQuZW5jb2RlKHNpZy5yKSk7XG4gICAgY29uc3Qgc3MgPSB0bHYuZW5jb2RlKDB4MDIsIGludC5lbmNvZGUoc2lnLnMpKTtcbiAgICBjb25zdCBzZXEgPSBycyArIHNzO1xuICAgIHJldHVybiB0bHYuZW5jb2RlKDB4MzAsIHNlcSk7XG4gIH0sXG59O1xuXG4vLyBCZSBmcmllbmRseSB0byBiYWQgRUNNQVNjcmlwdCBwYXJzZXJzIGJ5IG5vdCB1c2luZyBiaWdpbnQgbGl0ZXJhbHNcbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgXzBuID0gQmlnSW50KDApLCBfMW4gPSBCaWdJbnQoMSksIF8ybiA9IEJpZ0ludCgyKSwgXzNuID0gQmlnSW50KDMpLCBfNG4gPSBCaWdJbnQoNCk7XG5cbi8qKlxuICogQ3JlYXRlcyB3ZWllcnN0cmFzcyBQb2ludCBjb25zdHJ1Y3RvciwgYmFzZWQgb24gc3BlY2lmaWVkIGN1cnZlIG9wdGlvbnMuXG4gKlxuICogU2VlIHtAbGluayBXZWllcnN0cmFzc09wdHN9LlxuICpcbiAqIEBleGFtcGxlXG5gYGBqc1xuY29uc3Qgb3B0cyA9IHtcbiAgcDogMHhmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZWZmZmZhYzczbixcbiAgbjogMHgxMDAwMDAwMDAwMDAwMDAwMDAwMDFiOGZhMTZkZmFiOWFjYTE2YjZiM24sXG4gIGg6IDFuLFxuICBhOiAwbixcbiAgYjogN24sXG4gIEd4OiAweDNiNGMzODJjZTM3YWExOTJhNDAxOWU3NjMwMzZmNGY1ZGQ0ZDdlYmJuLFxuICBHeTogMHg5MzhjZjkzNTMxOGZkY2VkNmJjMjgyODY1MzE3MzNjM2YwM2M0ZmVlbixcbn07XG5jb25zdCBzZWNwMTYwazFfUG9pbnQgPSB3ZWllcnN0cmFzcyhvcHRzKTtcbmBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gd2VpZXJzdHJhc3M8VD4oXG4gIHBhcmFtczogV2VpZXJzdHJhc3NPcHRzPFQ+LFxuICBleHRyYU9wdHM6IFdlaWVyc3RyYXNzRXh0cmFPcHRzPFQ+ID0ge31cbik6IFdlaWVyc3RyYXNzUG9pbnRDb25zPFQ+IHtcbiAgY29uc3QgdmFsaWRhdGVkID0gY3JlYXRlQ3VydmVGaWVsZHMoJ3dlaWVyc3RyYXNzJywgcGFyYW1zLCBleHRyYU9wdHMpO1xuICBjb25zdCB7IEZwLCBGbiB9ID0gdmFsaWRhdGVkO1xuICBsZXQgQ1VSVkUgPSB2YWxpZGF0ZWQuQ1VSVkUgYXMgV2VpZXJzdHJhc3NPcHRzPFQ+O1xuICBjb25zdCB7IGg6IGNvZmFjdG9yLCBuOiBDVVJWRV9PUkRFUiB9ID0gQ1VSVkU7XG4gIHZhbGlkYXRlT2JqZWN0KFxuICAgIGV4dHJhT3B0cyxcbiAgICB7fSxcbiAgICB7XG4gICAgICBhbGxvd0luZmluaXR5UG9pbnQ6ICdib29sZWFuJyxcbiAgICAgIGNsZWFyQ29mYWN0b3I6ICdmdW5jdGlvbicsXG4gICAgICBpc1RvcnNpb25GcmVlOiAnZnVuY3Rpb24nLFxuICAgICAgZnJvbUJ5dGVzOiAnZnVuY3Rpb24nLFxuICAgICAgdG9CeXRlczogJ2Z1bmN0aW9uJyxcbiAgICAgIGVuZG86ICdvYmplY3QnLFxuICAgIH1cbiAgKTtcblxuICBjb25zdCB7IGVuZG8gfSA9IGV4dHJhT3B0cztcbiAgaWYgKGVuZG8pIHtcbiAgICAvLyB2YWxpZGF0ZU9iamVjdChlbmRvLCB7IGJldGE6ICdiaWdpbnQnLCBzcGxpdFNjYWxhcjogJ2Z1bmN0aW9uJyB9KTtcbiAgICBpZiAoIUZwLmlzMChDVVJWRS5hKSB8fCB0eXBlb2YgZW5kby5iZXRhICE9PSAnYmlnaW50JyB8fCAhQXJyYXkuaXNBcnJheShlbmRvLmJhc2lzZXMpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZW5kbzogZXhwZWN0ZWQgXCJiZXRhXCI6IGJpZ2ludCBhbmQgXCJiYXNpc2VzXCI6IGFycmF5Jyk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbGVuZ3RocyA9IGdldFdMZW5ndGhzKEZwLCBGbik7XG5cbiAgZnVuY3Rpb24gYXNzZXJ0Q29tcHJlc3Npb25Jc1N1cHBvcnRlZCgpIHtcbiAgICBpZiAoIUZwLmlzT2RkKSB0aHJvdyBuZXcgRXJyb3IoJ2NvbXByZXNzaW9uIGlzIG5vdCBzdXBwb3J0ZWQ6IEZpZWxkIGRvZXMgbm90IGhhdmUgLmlzT2RkKCknKTtcbiAgfVxuXG4gIC8vIEltcGxlbWVudHMgSUVFRSBQMTM2MyBwb2ludCBlbmNvZGluZ1xuICBmdW5jdGlvbiBwb2ludFRvQnl0ZXMoXG4gICAgX2M6IFdlaWVyc3RyYXNzUG9pbnRDb25zPFQ+LFxuICAgIHBvaW50OiBXZWllcnN0cmFzc1BvaW50PFQ+LFxuICAgIGlzQ29tcHJlc3NlZDogYm9vbGVhblxuICApOiBVaW50OEFycmF5IHtcbiAgICBjb25zdCB7IHgsIHkgfSA9IHBvaW50LnRvQWZmaW5lKCk7XG4gICAgY29uc3QgYnggPSBGcC50b0J5dGVzKHgpO1xuICAgIGFib29sKGlzQ29tcHJlc3NlZCwgJ2lzQ29tcHJlc3NlZCcpO1xuICAgIGlmIChpc0NvbXByZXNzZWQpIHtcbiAgICAgIGFzc2VydENvbXByZXNzaW9uSXNTdXBwb3J0ZWQoKTtcbiAgICAgIGNvbnN0IGhhc0V2ZW5ZID0gIUZwLmlzT2RkISh5KTtcbiAgICAgIHJldHVybiBjb25jYXRCeXRlcyhwcHJlZml4KGhhc0V2ZW5ZKSwgYngpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29uY2F0Qnl0ZXMoVWludDhBcnJheS5vZigweDA0KSwgYngsIEZwLnRvQnl0ZXMoeSkpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBwb2ludEZyb21CeXRlcyhieXRlczogVWludDhBcnJheSkge1xuICAgIGFieXRlcyhieXRlcywgdW5kZWZpbmVkLCAnUG9pbnQnKTtcbiAgICBjb25zdCB7IHB1YmxpY0tleTogY29tcCwgcHVibGljS2V5VW5jb21wcmVzc2VkOiB1bmNvbXAgfSA9IGxlbmd0aHM7IC8vIGUuZy4gZm9yIDMyLWJ5dGU6IDMzLCA2NVxuICAgIGNvbnN0IGxlbmd0aCA9IGJ5dGVzLmxlbmd0aDtcbiAgICBjb25zdCBoZWFkID0gYnl0ZXNbMF07XG4gICAgY29uc3QgdGFpbCA9IGJ5dGVzLnN1YmFycmF5KDEpO1xuICAgIC8vIE5vIGFjdHVhbCB2YWxpZGF0aW9uIGlzIGRvbmUgaGVyZTogdXNlIC5hc3NlcnRWYWxpZGl0eSgpXG4gICAgaWYgKGxlbmd0aCA9PT0gY29tcCAmJiAoaGVhZCA9PT0gMHgwMiB8fCBoZWFkID09PSAweDAzKSkge1xuICAgICAgY29uc3QgeCA9IEZwLmZyb21CeXRlcyh0YWlsKTtcbiAgICAgIGlmICghRnAuaXNWYWxpZCh4KSkgdGhyb3cgbmV3IEVycm9yKCdiYWQgcG9pbnQ6IGlzIG5vdCBvbiBjdXJ2ZSwgd3JvbmcgeCcpO1xuICAgICAgY29uc3QgeTIgPSB3ZWllcnN0cmFzc0VxdWF0aW9uKHgpOyAvLyB5XHUwMEIyID0geFx1MDBCMyArIGF4ICsgYlxuICAgICAgbGV0IHk6IFQ7XG4gICAgICB0cnkge1xuICAgICAgICB5ID0gRnAuc3FydCh5Mik7IC8vIHkgPSB5XHUwMEIyIF4gKHArMSkvNFxuICAgICAgfSBjYXRjaCAoc3FydEVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVyciA9IHNxcnRFcnJvciBpbnN0YW5jZW9mIEVycm9yID8gJzogJyArIHNxcnRFcnJvci5tZXNzYWdlIDogJyc7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYmFkIHBvaW50OiBpcyBub3Qgb24gY3VydmUsIHNxcnQgZXJyb3InICsgZXJyKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydENvbXByZXNzaW9uSXNTdXBwb3J0ZWQoKTtcbiAgICAgIGNvbnN0IGV2ZW5ZID0gRnAuaXNPZGQhKHkpO1xuICAgICAgY29uc3QgZXZlbkggPSAoaGVhZCAmIDEpID09PSAxOyAvLyBFQ0RTQS1zcGVjaWZpY1xuICAgICAgaWYgKGV2ZW5IICE9PSBldmVuWSkgeSA9IEZwLm5lZyh5KTtcbiAgICAgIHJldHVybiB7IHgsIHkgfTtcbiAgICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5jb21wICYmIGhlYWQgPT09IDB4MDQpIHtcbiAgICAgIC8vIFRPRE86IG1vcmUgY2hlY2tzXG4gICAgICBjb25zdCBMID0gRnAuQllURVM7XG4gICAgICBjb25zdCB4ID0gRnAuZnJvbUJ5dGVzKHRhaWwuc3ViYXJyYXkoMCwgTCkpO1xuICAgICAgY29uc3QgeSA9IEZwLmZyb21CeXRlcyh0YWlsLnN1YmFycmF5KEwsIEwgKiAyKSk7XG4gICAgICBpZiAoIWlzVmFsaWRYWSh4LCB5KSkgdGhyb3cgbmV3IEVycm9yKCdiYWQgcG9pbnQ6IGlzIG5vdCBvbiBjdXJ2ZScpO1xuICAgICAgcmV0dXJuIHsgeCwgeSB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBiYWQgcG9pbnQ6IGdvdCBsZW5ndGggJHtsZW5ndGh9LCBleHBlY3RlZCBjb21wcmVzc2VkPSR7Y29tcH0gb3IgdW5jb21wcmVzc2VkPSR7dW5jb21wfWBcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgZW5jb2RlUG9pbnQgPSBleHRyYU9wdHMudG9CeXRlcyB8fCBwb2ludFRvQnl0ZXM7XG4gIGNvbnN0IGRlY29kZVBvaW50ID0gZXh0cmFPcHRzLmZyb21CeXRlcyB8fCBwb2ludEZyb21CeXRlcztcbiAgZnVuY3Rpb24gd2VpZXJzdHJhc3NFcXVhdGlvbih4OiBUKTogVCB7XG4gICAgY29uc3QgeDIgPSBGcC5zcXIoeCk7IC8vIHggKiB4XG4gICAgY29uc3QgeDMgPSBGcC5tdWwoeDIsIHgpOyAvLyB4XHUwMEIyICogeFxuICAgIHJldHVybiBGcC5hZGQoRnAuYWRkKHgzLCBGcC5tdWwoeCwgQ1VSVkUuYSkpLCBDVVJWRS5iKTsgLy8geFx1MDBCMyArIGEgKiB4ICsgYlxuICB9XG5cbiAgLy8gVE9ETzogbW92ZSB0b3AtbGV2ZWxcbiAgLyoqIENoZWNrcyB3aGV0aGVyIGVxdWF0aW9uIGhvbGRzIGZvciBnaXZlbiB4LCB5OiB5XHUwMEIyID09IHhcdTAwQjMgKyBheCArIGIgKi9cbiAgZnVuY3Rpb24gaXNWYWxpZFhZKHg6IFQsIHk6IFQpOiBib29sZWFuIHtcbiAgICBjb25zdCBsZWZ0ID0gRnAuc3FyKHkpOyAvLyB5XHUwMEIyXG4gICAgY29uc3QgcmlnaHQgPSB3ZWllcnN0cmFzc0VxdWF0aW9uKHgpOyAvLyB4XHUwMEIzICsgYXggKyBiXG4gICAgcmV0dXJuIEZwLmVxbChsZWZ0LCByaWdodCk7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSB3aGV0aGVyIHRoZSBwYXNzZWQgY3VydmUgcGFyYW1zIGFyZSB2YWxpZC5cbiAgLy8gVGVzdCAxOiBlcXVhdGlvbiB5XHUwMEIyID0geFx1MDBCMyArIGF4ICsgYiBzaG91bGQgd29yayBmb3IgZ2VuZXJhdG9yIHBvaW50LlxuICBpZiAoIWlzVmFsaWRYWShDVVJWRS5HeCwgQ1VSVkUuR3kpKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBjdXJ2ZSBwYXJhbXM6IGdlbmVyYXRvciBwb2ludCcpO1xuXG4gIC8vIFRlc3QgMjogZGlzY3JpbWluYW50IFx1MDM5NCBwYXJ0IHNob3VsZCBiZSBub24temVybzogNGFcdTAwQjMgKyAyN2JcdTAwQjIgIT0gMC5cbiAgLy8gR3VhcmFudGVlcyBjdXJ2ZSBpcyBnZW51cy0xLCBzbW9vdGggKG5vbi1zaW5ndWxhcikuXG4gIGNvbnN0IF80YTMgPSBGcC5tdWwoRnAucG93KENVUlZFLmEsIF8zbiksIF80bik7XG4gIGNvbnN0IF8yN2IyID0gRnAubXVsKEZwLnNxcihDVVJWRS5iKSwgQmlnSW50KDI3KSk7XG4gIGlmIChGcC5pczAoRnAuYWRkKF80YTMsIF8yN2IyKSkpIHRocm93IG5ldyBFcnJvcignYmFkIGN1cnZlIHBhcmFtczogYSBvciBiJyk7XG5cbiAgLyoqIEFzc2VydHMgY29vcmRpbmF0ZSBpcyB2YWxpZDogMCA8PSBuIDwgRnAuT1JERVIuICovXG4gIGZ1bmN0aW9uIGFjb29yZCh0aXRsZTogc3RyaW5nLCBuOiBULCBiYW5aZXJvID0gZmFsc2UpIHtcbiAgICBpZiAoIUZwLmlzVmFsaWQobikgfHwgKGJhblplcm8gJiYgRnAuaXMwKG4pKSkgdGhyb3cgbmV3IEVycm9yKGBiYWQgcG9pbnQgY29vcmRpbmF0ZSAke3RpdGxlfWApO1xuICAgIHJldHVybiBuO1xuICB9XG5cbiAgZnVuY3Rpb24gYXByanBvaW50KG90aGVyOiB1bmtub3duKSB7XG4gICAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBQb2ludCkpIHRocm93IG5ldyBFcnJvcignV2VpZXJzdHJhc3MgUG9pbnQgZXhwZWN0ZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNwbGl0RW5kb1NjYWxhck4oazogYmlnaW50KSB7XG4gICAgaWYgKCFlbmRvIHx8ICFlbmRvLmJhc2lzZXMpIHRocm93IG5ldyBFcnJvcignbm8gZW5kbycpO1xuICAgIHJldHVybiBfc3BsaXRFbmRvU2NhbGFyKGssIGVuZG8uYmFzaXNlcywgRm4uT1JERVIpO1xuICB9XG5cbiAgLy8gTWVtb2l6ZWQgdG9BZmZpbmUgLyB2YWxpZGl0eSBjaGVjay4gVGhleSBhcmUgaGVhdnkuIFBvaW50cyBhcmUgaW1tdXRhYmxlLlxuXG4gIC8vIENvbnZlcnRzIFByb2plY3RpdmUgcG9pbnQgdG8gYWZmaW5lICh4LCB5KSBjb29yZGluYXRlcy5cbiAgLy8gQ2FuIGFjY2VwdCBwcmVjb21wdXRlZCBaXi0xIC0gZm9yIGV4YW1wbGUsIGZyb20gaW52ZXJ0QmF0Y2guXG4gIC8vIChYLCBZLCBaKSBcdTIyMEIgKHg9WC9aLCB5PVkvWilcbiAgY29uc3QgdG9BZmZpbmVNZW1vID0gbWVtb2l6ZWQoKHA6IFBvaW50LCBpej86IFQpOiBBZmZpbmVQb2ludDxUPiA9PiB7XG4gICAgY29uc3QgeyBYLCBZLCBaIH0gPSBwO1xuICAgIC8vIEZhc3QtcGF0aCBmb3Igbm9ybWFsaXplZCBwb2ludHNcbiAgICBpZiAoRnAuZXFsKFosIEZwLk9ORSkpIHJldHVybiB7IHg6IFgsIHk6IFkgfTtcbiAgICBjb25zdCBpczAgPSBwLmlzMCgpO1xuICAgIC8vIElmIGludlogd2FzIDAsIHdlIHJldHVybiB6ZXJvIHBvaW50LiBIb3dldmVyIHdlIHN0aWxsIHdhbnQgdG8gZXhlY3V0ZVxuICAgIC8vIGFsbCBvcGVyYXRpb25zLCBzbyB3ZSByZXBsYWNlIGludlogd2l0aCBhIHJhbmRvbSBudW1iZXIsIDEuXG4gICAgaWYgKGl6ID09IG51bGwpIGl6ID0gaXMwID8gRnAuT05FIDogRnAuaW52KFopO1xuICAgIGNvbnN0IHggPSBGcC5tdWwoWCwgaXopO1xuICAgIGNvbnN0IHkgPSBGcC5tdWwoWSwgaXopO1xuICAgIGNvbnN0IHp6ID0gRnAubXVsKFosIGl6KTtcbiAgICBpZiAoaXMwKSByZXR1cm4geyB4OiBGcC5aRVJPLCB5OiBGcC5aRVJPIH07XG4gICAgaWYgKCFGcC5lcWwoenosIEZwLk9ORSkpIHRocm93IG5ldyBFcnJvcignaW52WiB3YXMgaW52YWxpZCcpO1xuICAgIHJldHVybiB7IHgsIHkgfTtcbiAgfSk7XG4gIC8vIE5PVEU6IG9uIGV4Y2VwdGlvbiB0aGlzIHdpbGwgY3Jhc2ggJ2NhY2hlZCcgYW5kIG5vIHZhbHVlIHdpbGwgYmUgc2V0LlxuICAvLyBPdGhlcndpc2UgdHJ1ZSB3aWxsIGJlIHJldHVyblxuICBjb25zdCBhc3NlcnRWYWxpZE1lbW8gPSBtZW1vaXplZCgocDogUG9pbnQpID0+IHtcbiAgICBpZiAocC5pczAoKSkge1xuICAgICAgLy8gKDAsIDEsIDApIGFrYSBaRVJPIGlzIGludmFsaWQgaW4gbW9zdCBjb250ZXh0cy5cbiAgICAgIC8vIEluIEJMUywgWkVSTyBjYW4gYmUgc2VyaWFsaXplZCwgc28gd2UgYWxsb3cgaXQuXG4gICAgICAvLyAoMCwgMCwgMCkgaXMgaW52YWxpZCByZXByZXNlbnRhdGlvbiBvZiBaRVJPLlxuICAgICAgaWYgKGV4dHJhT3B0cy5hbGxvd0luZmluaXR5UG9pbnQgJiYgIUZwLmlzMChwLlkpKSByZXR1cm47XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBwb2ludDogWkVSTycpO1xuICAgIH1cbiAgICAvLyBTb21lIDNyZC1wYXJ0eSB0ZXN0IHZlY3RvcnMgcmVxdWlyZSBkaWZmZXJlbnQgd29yZGluZyBiZXR3ZWVuIGhlcmUgJiBgZnJvbUNvbXByZXNzZWRIZXhgXG4gICAgY29uc3QgeyB4LCB5IH0gPSBwLnRvQWZmaW5lKCk7XG4gICAgaWYgKCFGcC5pc1ZhbGlkKHgpIHx8ICFGcC5pc1ZhbGlkKHkpKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBwb2ludDogeCBvciB5IG5vdCBmaWVsZCBlbGVtZW50cycpO1xuICAgIGlmICghaXNWYWxpZFhZKHgsIHkpKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBwb2ludDogZXF1YXRpb24gbGVmdCAhPSByaWdodCcpO1xuICAgIGlmICghcC5pc1RvcnNpb25GcmVlKCkpIHRocm93IG5ldyBFcnJvcignYmFkIHBvaW50OiBub3QgaW4gcHJpbWUtb3JkZXIgc3ViZ3JvdXAnKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gZmluaXNoRW5kbyhcbiAgICBlbmRvQmV0YTogRW5kb21vcnBoaXNtT3B0c1snYmV0YSddLFxuICAgIGsxcDogUG9pbnQsXG4gICAgazJwOiBQb2ludCxcbiAgICBrMW5lZzogYm9vbGVhbixcbiAgICBrMm5lZzogYm9vbGVhblxuICApIHtcbiAgICBrMnAgPSBuZXcgUG9pbnQoRnAubXVsKGsycC5YLCBlbmRvQmV0YSksIGsycC5ZLCBrMnAuWik7XG4gICAgazFwID0gbmVnYXRlQ3QoazFuZWcsIGsxcCk7XG4gICAgazJwID0gbmVnYXRlQ3QoazJuZWcsIGsycCk7XG4gICAgcmV0dXJuIGsxcC5hZGQoazJwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9qZWN0aXZlIFBvaW50IHdvcmtzIGluIDNkIC8gcHJvamVjdGl2ZSAoaG9tb2dlbmVvdXMpIGNvb3JkaW5hdGVzOihYLCBZLCBaKSBcdTIyMEIgKHg9WC9aLCB5PVkvWikuXG4gICAqIERlZmF1bHQgUG9pbnQgd29ya3MgaW4gMmQgLyBhZmZpbmUgY29vcmRpbmF0ZXM6ICh4LCB5KS5cbiAgICogV2UncmUgZG9pbmcgY2FsY3VsYXRpb25zIGluIHByb2plY3RpdmUsIGJlY2F1c2UgaXRzIG9wZXJhdGlvbnMgZG9uJ3QgcmVxdWlyZSBjb3N0bHkgaW52ZXJzaW9uLlxuICAgKi9cbiAgY2xhc3MgUG9pbnQgaW1wbGVtZW50cyBXZWllcnN0cmFzc1BvaW50PFQ+IHtcbiAgICAvLyBiYXNlIC8gZ2VuZXJhdG9yIHBvaW50XG4gICAgc3RhdGljIHJlYWRvbmx5IEJBU0UgPSBuZXcgUG9pbnQoQ1VSVkUuR3gsIENVUlZFLkd5LCBGcC5PTkUpO1xuICAgIC8vIHplcm8gLyBpbmZpbml0eSAvIGlkZW50aXR5IHBvaW50XG4gICAgc3RhdGljIHJlYWRvbmx5IFpFUk8gPSBuZXcgUG9pbnQoRnAuWkVSTywgRnAuT05FLCBGcC5aRVJPKTsgLy8gMCwgMSwgMFxuICAgIC8vIG1hdGggZmllbGRcbiAgICBzdGF0aWMgcmVhZG9ubHkgRnAgPSBGcDtcbiAgICAvLyBzY2FsYXIgZmllbGRcbiAgICBzdGF0aWMgcmVhZG9ubHkgRm4gPSBGbjtcblxuICAgIHJlYWRvbmx5IFg6IFQ7XG4gICAgcmVhZG9ubHkgWTogVDtcbiAgICByZWFkb25seSBaOiBUO1xuXG4gICAgLyoqIERvZXMgTk9UIHZhbGlkYXRlIGlmIHRoZSBwb2ludCBpcyB2YWxpZC4gVXNlIGAuYXNzZXJ0VmFsaWRpdHkoKWAuICovXG4gICAgY29uc3RydWN0b3IoWDogVCwgWTogVCwgWjogVCkge1xuICAgICAgdGhpcy5YID0gYWNvb3JkKCd4JywgWCk7XG4gICAgICB0aGlzLlkgPSBhY29vcmQoJ3knLCBZLCB0cnVlKTtcbiAgICAgIHRoaXMuWiA9IGFjb29yZCgneicsIFopO1xuICAgICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgQ1VSVkUoKTogV2VpZXJzdHJhc3NPcHRzPFQ+IHtcbiAgICAgIHJldHVybiBDVVJWRTtcbiAgICB9XG5cbiAgICAvKiogRG9lcyBOT1QgdmFsaWRhdGUgaWYgdGhlIHBvaW50IGlzIHZhbGlkLiBVc2UgYC5hc3NlcnRWYWxpZGl0eSgpYC4gKi9cbiAgICBzdGF0aWMgZnJvbUFmZmluZShwOiBBZmZpbmVQb2ludDxUPik6IFBvaW50IHtcbiAgICAgIGNvbnN0IHsgeCwgeSB9ID0gcCB8fCB7fTtcbiAgICAgIGlmICghcCB8fCAhRnAuaXNWYWxpZCh4KSB8fCAhRnAuaXNWYWxpZCh5KSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGFmZmluZSBwb2ludCcpO1xuICAgICAgaWYgKHAgaW5zdGFuY2VvZiBQb2ludCkgdGhyb3cgbmV3IEVycm9yKCdwcm9qZWN0aXZlIHBvaW50IG5vdCBhbGxvd2VkJyk7XG4gICAgICAvLyAoMCwgMCkgd291bGQndmUgcHJvZHVjZWQgKDAsIDAsIDEpIC0gaW5zdGVhZCwgd2UgbmVlZCAoMCwgMSwgMClcbiAgICAgIGlmIChGcC5pczAoeCkgJiYgRnAuaXMwKHkpKSByZXR1cm4gUG9pbnQuWkVSTztcbiAgICAgIHJldHVybiBuZXcgUG9pbnQoeCwgeSwgRnAuT05FKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZnJvbUJ5dGVzKGJ5dGVzOiBVaW50OEFycmF5KTogUG9pbnQge1xuICAgICAgY29uc3QgUCA9IFBvaW50LmZyb21BZmZpbmUoZGVjb2RlUG9pbnQoYWJ5dGVzKGJ5dGVzLCB1bmRlZmluZWQsICdwb2ludCcpKSk7XG4gICAgICBQLmFzc2VydFZhbGlkaXR5KCk7XG4gICAgICByZXR1cm4gUDtcbiAgICB9XG5cbiAgICBzdGF0aWMgZnJvbUhleChoZXg6IHN0cmluZyk6IFBvaW50IHtcbiAgICAgIHJldHVybiBQb2ludC5mcm9tQnl0ZXMoaGV4VG9CeXRlcyhoZXgpKTtcbiAgICB9XG5cbiAgICBnZXQgeCgpOiBUIHtcbiAgICAgIHJldHVybiB0aGlzLnRvQWZmaW5lKCkueDtcbiAgICB9XG4gICAgZ2V0IHkoKTogVCB7XG4gICAgICByZXR1cm4gdGhpcy50b0FmZmluZSgpLnk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gd2luZG93U2l6ZVxuICAgICAqIEBwYXJhbSBpc0xhenkgdHJ1ZSB3aWxsIGRlZmVyIHRhYmxlIGNvbXB1dGF0aW9uIHVudGlsIHRoZSBmaXJzdCBtdWx0aXBsaWNhdGlvblxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHJlY29tcHV0ZSh3aW5kb3dTaXplOiBudW1iZXIgPSA4LCBpc0xhenkgPSB0cnVlKTogUG9pbnQge1xuICAgICAgd25hZi5jcmVhdGVDYWNoZSh0aGlzLCB3aW5kb3dTaXplKTtcbiAgICAgIGlmICghaXNMYXp5KSB0aGlzLm11bHRpcGx5KF8zbik7IC8vIHJhbmRvbSBudW1iZXJcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIFRPRE86IHJldHVybiBgdGhpc2BcbiAgICAvKiogQSBwb2ludCBvbiBjdXJ2ZSBpcyB2YWxpZCBpZiBpdCBjb25mb3JtcyB0byBlcXVhdGlvbi4gKi9cbiAgICBhc3NlcnRWYWxpZGl0eSgpOiB2b2lkIHtcbiAgICAgIGFzc2VydFZhbGlkTWVtbyh0aGlzKTtcbiAgICB9XG5cbiAgICBoYXNFdmVuWSgpOiBib29sZWFuIHtcbiAgICAgIGNvbnN0IHsgeSB9ID0gdGhpcy50b0FmZmluZSgpO1xuICAgICAgaWYgKCFGcC5pc09kZCkgdGhyb3cgbmV3IEVycm9yKFwiRmllbGQgZG9lc24ndCBzdXBwb3J0IGlzT2RkXCIpO1xuICAgICAgcmV0dXJuICFGcC5pc09kZCh5KTtcbiAgICB9XG5cbiAgICAvKiogQ29tcGFyZSBvbmUgcG9pbnQgdG8gYW5vdGhlci4gKi9cbiAgICBlcXVhbHMob3RoZXI6IFBvaW50KTogYm9vbGVhbiB7XG4gICAgICBhcHJqcG9pbnQob3RoZXIpO1xuICAgICAgY29uc3QgeyBYOiBYMSwgWTogWTEsIFo6IFoxIH0gPSB0aGlzO1xuICAgICAgY29uc3QgeyBYOiBYMiwgWTogWTIsIFo6IFoyIH0gPSBvdGhlcjtcbiAgICAgIGNvbnN0IFUxID0gRnAuZXFsKEZwLm11bChYMSwgWjIpLCBGcC5tdWwoWDIsIFoxKSk7XG4gICAgICBjb25zdCBVMiA9IEZwLmVxbChGcC5tdWwoWTEsIFoyKSwgRnAubXVsKFkyLCBaMSkpO1xuICAgICAgcmV0dXJuIFUxICYmIFUyO1xuICAgIH1cblxuICAgIC8qKiBGbGlwcyBwb2ludCB0byBvbmUgY29ycmVzcG9uZGluZyB0byAoeCwgLXkpIGluIEFmZmluZSBjb29yZGluYXRlcy4gKi9cbiAgICBuZWdhdGUoKTogUG9pbnQge1xuICAgICAgcmV0dXJuIG5ldyBQb2ludCh0aGlzLlgsIEZwLm5lZyh0aGlzLlkpLCB0aGlzLlopO1xuICAgIH1cblxuICAgIC8vIFJlbmVzLUNvc3RlbGxvLUJhdGluYSBleGNlcHRpb24tZnJlZSBkb3VibGluZyBmb3JtdWxhLlxuICAgIC8vIFRoZXJlIGlzIDMwJSBmYXN0ZXIgSmFjb2JpYW4gZm9ybXVsYSwgYnV0IGl0IGlzIG5vdCBjb21wbGV0ZS5cbiAgICAvLyBodHRwczovL2VwcmludC5pYWNyLm9yZy8yMDE1LzEwNjAsIGFsZ29yaXRobSAzXG4gICAgLy8gQ29zdDogOE0gKyAzUyArIDMqYSArIDIqYjMgKyAxNWFkZC5cbiAgICBkb3VibGUoKSB7XG4gICAgICBjb25zdCB7IGEsIGIgfSA9IENVUlZFO1xuICAgICAgY29uc3QgYjMgPSBGcC5tdWwoYiwgXzNuKTtcbiAgICAgIGNvbnN0IHsgWDogWDEsIFk6IFkxLCBaOiBaMSB9ID0gdGhpcztcbiAgICAgIGxldCBYMyA9IEZwLlpFUk8sIFkzID0gRnAuWkVSTywgWjMgPSBGcC5aRVJPOyAvLyBwcmV0dGllci1pZ25vcmVcbiAgICAgIGxldCB0MCA9IEZwLm11bChYMSwgWDEpOyAvLyBzdGVwIDFcbiAgICAgIGxldCB0MSA9IEZwLm11bChZMSwgWTEpO1xuICAgICAgbGV0IHQyID0gRnAubXVsKFoxLCBaMSk7XG4gICAgICBsZXQgdDMgPSBGcC5tdWwoWDEsIFkxKTtcbiAgICAgIHQzID0gRnAuYWRkKHQzLCB0Myk7IC8vIHN0ZXAgNVxuICAgICAgWjMgPSBGcC5tdWwoWDEsIFoxKTtcbiAgICAgIFozID0gRnAuYWRkKFozLCBaMyk7XG4gICAgICBYMyA9IEZwLm11bChhLCBaMyk7XG4gICAgICBZMyA9IEZwLm11bChiMywgdDIpO1xuICAgICAgWTMgPSBGcC5hZGQoWDMsIFkzKTsgLy8gc3RlcCAxMFxuICAgICAgWDMgPSBGcC5zdWIodDEsIFkzKTtcbiAgICAgIFkzID0gRnAuYWRkKHQxLCBZMyk7XG4gICAgICBZMyA9IEZwLm11bChYMywgWTMpO1xuICAgICAgWDMgPSBGcC5tdWwodDMsIFgzKTtcbiAgICAgIFozID0gRnAubXVsKGIzLCBaMyk7IC8vIHN0ZXAgMTVcbiAgICAgIHQyID0gRnAubXVsKGEsIHQyKTtcbiAgICAgIHQzID0gRnAuc3ViKHQwLCB0Mik7XG4gICAgICB0MyA9IEZwLm11bChhLCB0Myk7XG4gICAgICB0MyA9IEZwLmFkZCh0MywgWjMpO1xuICAgICAgWjMgPSBGcC5hZGQodDAsIHQwKTsgLy8gc3RlcCAyMFxuICAgICAgdDAgPSBGcC5hZGQoWjMsIHQwKTtcbiAgICAgIHQwID0gRnAuYWRkKHQwLCB0Mik7XG4gICAgICB0MCA9IEZwLm11bCh0MCwgdDMpO1xuICAgICAgWTMgPSBGcC5hZGQoWTMsIHQwKTtcbiAgICAgIHQyID0gRnAubXVsKFkxLCBaMSk7IC8vIHN0ZXAgMjVcbiAgICAgIHQyID0gRnAuYWRkKHQyLCB0Mik7XG4gICAgICB0MCA9IEZwLm11bCh0MiwgdDMpO1xuICAgICAgWDMgPSBGcC5zdWIoWDMsIHQwKTtcbiAgICAgIFozID0gRnAubXVsKHQyLCB0MSk7XG4gICAgICBaMyA9IEZwLmFkZChaMywgWjMpOyAvLyBzdGVwIDMwXG4gICAgICBaMyA9IEZwLmFkZChaMywgWjMpO1xuICAgICAgcmV0dXJuIG5ldyBQb2ludChYMywgWTMsIFozKTtcbiAgICB9XG5cbiAgICAvLyBSZW5lcy1Db3N0ZWxsby1CYXRpbmEgZXhjZXB0aW9uLWZyZWUgYWRkaXRpb24gZm9ybXVsYS5cbiAgICAvLyBUaGVyZSBpcyAzMCUgZmFzdGVyIEphY29iaWFuIGZvcm11bGEsIGJ1dCBpdCBpcyBub3QgY29tcGxldGUuXG4gICAgLy8gaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxNS8xMDYwLCBhbGdvcml0aG0gMVxuICAgIC8vIENvc3Q6IDEyTSArIDBTICsgMyphICsgMypiMyArIDIzYWRkLlxuICAgIGFkZChvdGhlcjogUG9pbnQpOiBQb2ludCB7XG4gICAgICBhcHJqcG9pbnQob3RoZXIpO1xuICAgICAgY29uc3QgeyBYOiBYMSwgWTogWTEsIFo6IFoxIH0gPSB0aGlzO1xuICAgICAgY29uc3QgeyBYOiBYMiwgWTogWTIsIFo6IFoyIH0gPSBvdGhlcjtcbiAgICAgIGxldCBYMyA9IEZwLlpFUk8sIFkzID0gRnAuWkVSTywgWjMgPSBGcC5aRVJPOyAvLyBwcmV0dGllci1pZ25vcmVcbiAgICAgIGNvbnN0IGEgPSBDVVJWRS5hO1xuICAgICAgY29uc3QgYjMgPSBGcC5tdWwoQ1VSVkUuYiwgXzNuKTtcbiAgICAgIGxldCB0MCA9IEZwLm11bChYMSwgWDIpOyAvLyBzdGVwIDFcbiAgICAgIGxldCB0MSA9IEZwLm11bChZMSwgWTIpO1xuICAgICAgbGV0IHQyID0gRnAubXVsKFoxLCBaMik7XG4gICAgICBsZXQgdDMgPSBGcC5hZGQoWDEsIFkxKTtcbiAgICAgIGxldCB0NCA9IEZwLmFkZChYMiwgWTIpOyAvLyBzdGVwIDVcbiAgICAgIHQzID0gRnAubXVsKHQzLCB0NCk7XG4gICAgICB0NCA9IEZwLmFkZCh0MCwgdDEpO1xuICAgICAgdDMgPSBGcC5zdWIodDMsIHQ0KTtcbiAgICAgIHQ0ID0gRnAuYWRkKFgxLCBaMSk7XG4gICAgICBsZXQgdDUgPSBGcC5hZGQoWDIsIFoyKTsgLy8gc3RlcCAxMFxuICAgICAgdDQgPSBGcC5tdWwodDQsIHQ1KTtcbiAgICAgIHQ1ID0gRnAuYWRkKHQwLCB0Mik7XG4gICAgICB0NCA9IEZwLnN1Yih0NCwgdDUpO1xuICAgICAgdDUgPSBGcC5hZGQoWTEsIFoxKTtcbiAgICAgIFgzID0gRnAuYWRkKFkyLCBaMik7IC8vIHN0ZXAgMTVcbiAgICAgIHQ1ID0gRnAubXVsKHQ1LCBYMyk7XG4gICAgICBYMyA9IEZwLmFkZCh0MSwgdDIpO1xuICAgICAgdDUgPSBGcC5zdWIodDUsIFgzKTtcbiAgICAgIFozID0gRnAubXVsKGEsIHQ0KTtcbiAgICAgIFgzID0gRnAubXVsKGIzLCB0Mik7IC8vIHN0ZXAgMjBcbiAgICAgIFozID0gRnAuYWRkKFgzLCBaMyk7XG4gICAgICBYMyA9IEZwLnN1Yih0MSwgWjMpO1xuICAgICAgWjMgPSBGcC5hZGQodDEsIFozKTtcbiAgICAgIFkzID0gRnAubXVsKFgzLCBaMyk7XG4gICAgICB0MSA9IEZwLmFkZCh0MCwgdDApOyAvLyBzdGVwIDI1XG4gICAgICB0MSA9IEZwLmFkZCh0MSwgdDApO1xuICAgICAgdDIgPSBGcC5tdWwoYSwgdDIpO1xuICAgICAgdDQgPSBGcC5tdWwoYjMsIHQ0KTtcbiAgICAgIHQxID0gRnAuYWRkKHQxLCB0Mik7XG4gICAgICB0MiA9IEZwLnN1Yih0MCwgdDIpOyAvLyBzdGVwIDMwXG4gICAgICB0MiA9IEZwLm11bChhLCB0Mik7XG4gICAgICB0NCA9IEZwLmFkZCh0NCwgdDIpO1xuICAgICAgdDAgPSBGcC5tdWwodDEsIHQ0KTtcbiAgICAgIFkzID0gRnAuYWRkKFkzLCB0MCk7XG4gICAgICB0MCA9IEZwLm11bCh0NSwgdDQpOyAvLyBzdGVwIDM1XG4gICAgICBYMyA9IEZwLm11bCh0MywgWDMpO1xuICAgICAgWDMgPSBGcC5zdWIoWDMsIHQwKTtcbiAgICAgIHQwID0gRnAubXVsKHQzLCB0MSk7XG4gICAgICBaMyA9IEZwLm11bCh0NSwgWjMpO1xuICAgICAgWjMgPSBGcC5hZGQoWjMsIHQwKTsgLy8gc3RlcCA0MFxuICAgICAgcmV0dXJuIG5ldyBQb2ludChYMywgWTMsIFozKTtcbiAgICB9XG5cbiAgICBzdWJ0cmFjdChvdGhlcjogUG9pbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkZChvdGhlci5uZWdhdGUoKSk7XG4gICAgfVxuXG4gICAgaXMwKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuZXF1YWxzKFBvaW50LlpFUk8pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnN0YW50IHRpbWUgbXVsdGlwbGljYXRpb24uXG4gICAgICogVXNlcyB3TkFGIG1ldGhvZC4gV2luZG93ZWQgbWV0aG9kIG1heSBiZSAxMCUgZmFzdGVyLFxuICAgICAqIGJ1dCB0YWtlcyAyeCBsb25nZXIgdG8gZ2VuZXJhdGUgYW5kIGNvbnN1bWVzIDJ4IG1lbW9yeS5cbiAgICAgKiBVc2VzIHByZWNvbXB1dGVzIHdoZW4gYXZhaWxhYmxlLlxuICAgICAqIFVzZXMgZW5kb21vcnBoaXNtIGZvciBLb2JsaXR6IGN1cnZlcy5cbiAgICAgKiBAcGFyYW0gc2NhbGFyIGJ5IHdoaWNoIHRoZSBwb2ludCB3b3VsZCBiZSBtdWx0aXBsaWVkXG4gICAgICogQHJldHVybnMgTmV3IHBvaW50XG4gICAgICovXG4gICAgbXVsdGlwbHkoc2NhbGFyOiBiaWdpbnQpOiBQb2ludCB7XG4gICAgICBjb25zdCB7IGVuZG8gfSA9IGV4dHJhT3B0cztcbiAgICAgIGlmICghRm4uaXNWYWxpZE5vdDAoc2NhbGFyKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHNjYWxhcjogb3V0IG9mIHJhbmdlJyk7IC8vIDAgaXMgaW52YWxpZFxuICAgICAgbGV0IHBvaW50OiBQb2ludCwgZmFrZTogUG9pbnQ7IC8vIEZha2UgcG9pbnQgaXMgdXNlZCB0byBjb25zdC10aW1lIG11bHRcbiAgICAgIGNvbnN0IG11bCA9IChuOiBiaWdpbnQpID0+IHduYWYuY2FjaGVkKHRoaXMsIG4sIChwKSA9PiBub3JtYWxpemVaKFBvaW50LCBwKSk7XG4gICAgICAvKiogU2VlIGRvY3MgZm9yIHtAbGluayBFbmRvbW9ycGhpc21PcHRzfSAqL1xuICAgICAgaWYgKGVuZG8pIHtcbiAgICAgICAgY29uc3QgeyBrMW5lZywgazEsIGsybmVnLCBrMiB9ID0gc3BsaXRFbmRvU2NhbGFyTihzY2FsYXIpO1xuICAgICAgICBjb25zdCB7IHA6IGsxcCwgZjogazFmIH0gPSBtdWwoazEpO1xuICAgICAgICBjb25zdCB7IHA6IGsycCwgZjogazJmIH0gPSBtdWwoazIpO1xuICAgICAgICBmYWtlID0gazFmLmFkZChrMmYpO1xuICAgICAgICBwb2ludCA9IGZpbmlzaEVuZG8oZW5kby5iZXRhLCBrMXAsIGsycCwgazFuZWcsIGsybmVnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHsgcCwgZiB9ID0gbXVsKHNjYWxhcik7XG4gICAgICAgIHBvaW50ID0gcDtcbiAgICAgICAgZmFrZSA9IGY7XG4gICAgICB9XG4gICAgICAvLyBOb3JtYWxpemUgYHpgIGZvciBib3RoIHBvaW50cywgYnV0IHJldHVybiBvbmx5IHJlYWwgb25lXG4gICAgICByZXR1cm4gbm9ybWFsaXplWihQb2ludCwgW3BvaW50LCBmYWtlXSlbMF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTm9uLWNvbnN0YW50LXRpbWUgbXVsdGlwbGljYXRpb24uIFVzZXMgZG91YmxlLWFuZC1hZGQgYWxnb3JpdGhtLlxuICAgICAqIEl0J3MgZmFzdGVyLCBidXQgc2hvdWxkIG9ubHkgYmUgdXNlZCB3aGVuIHlvdSBkb24ndCBjYXJlIGFib3V0XG4gICAgICogYW4gZXhwb3NlZCBzZWNyZXQga2V5IGUuZy4gc2lnIHZlcmlmaWNhdGlvbiwgd2hpY2ggd29ya3Mgb3ZlciAqcHVibGljKiBrZXlzLlxuICAgICAqL1xuICAgIG11bHRpcGx5VW5zYWZlKHNjOiBiaWdpbnQpOiBQb2ludCB7XG4gICAgICBjb25zdCB7IGVuZG8gfSA9IGV4dHJhT3B0cztcbiAgICAgIGNvbnN0IHAgPSB0aGlzIGFzIFBvaW50O1xuICAgICAgaWYgKCFGbi5pc1ZhbGlkKHNjKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHNjYWxhcjogb3V0IG9mIHJhbmdlJyk7IC8vIDAgaXMgdmFsaWRcbiAgICAgIGlmIChzYyA9PT0gXzBuIHx8IHAuaXMwKCkpIHJldHVybiBQb2ludC5aRVJPOyAvLyAwXG4gICAgICBpZiAoc2MgPT09IF8xbikgcmV0dXJuIHA7IC8vIDFcbiAgICAgIGlmICh3bmFmLmhhc0NhY2hlKHRoaXMpKSByZXR1cm4gdGhpcy5tdWx0aXBseShzYyk7IC8vIHByZWNvbXB1dGVzXG4gICAgICAvLyBXZSBkb24ndCBoYXZlIG1ldGhvZCBmb3IgZG91YmxlIHNjYWxhciBtdWx0aXBsaWNhdGlvbiAoYVAgKyBiUSk6XG4gICAgICAvLyBFdmVuIHdpdGggdXNpbmcgU3RyYXVzcy1TaGFtaXIgdHJpY2ssIGl0J3MgMzUlIHNsb3dlciB0aGFuIG5hXHUwMEVGdmUgbXVsK2FkZC5cbiAgICAgIGlmIChlbmRvKSB7XG4gICAgICAgIGNvbnN0IHsgazFuZWcsIGsxLCBrMm5lZywgazIgfSA9IHNwbGl0RW5kb1NjYWxhck4oc2MpO1xuICAgICAgICBjb25zdCB7IHAxLCBwMiB9ID0gbXVsRW5kb1Vuc2FmZShQb2ludCwgcCwgazEsIGsyKTsgLy8gMzAlIGZhc3RlciB2cyB3bmFmLnVuc2FmZVxuICAgICAgICByZXR1cm4gZmluaXNoRW5kbyhlbmRvLmJldGEsIHAxLCBwMiwgazFuZWcsIGsybmVnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB3bmFmLnVuc2FmZShwLCBzYyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgUHJvamVjdGl2ZSBwb2ludCB0byBhZmZpbmUgKHgsIHkpIGNvb3JkaW5hdGVzLlxuICAgICAqIEBwYXJhbSBpbnZlcnRlZFogWl4tMSAoaW52ZXJ0ZWQgemVybykgLSBvcHRpb25hbCwgcHJlY29tcHV0YXRpb24gaXMgdXNlZnVsIGZvciBpbnZlcnRCYXRjaFxuICAgICAqL1xuICAgIHRvQWZmaW5lKGludmVydGVkWj86IFQpOiBBZmZpbmVQb2ludDxUPiB7XG4gICAgICByZXR1cm4gdG9BZmZpbmVNZW1vKHRoaXMsIGludmVydGVkWik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIHdoZXRoZXIgUG9pbnQgaXMgZnJlZSBvZiB0b3JzaW9uIGVsZW1lbnRzIChpcyBpbiBwcmltZSBzdWJncm91cCkuXG4gICAgICogQWx3YXlzIHRvcnNpb24tZnJlZSBmb3IgY29mYWN0b3I9MSBjdXJ2ZXMuXG4gICAgICovXG4gICAgaXNUb3JzaW9uRnJlZSgpOiBib29sZWFuIHtcbiAgICAgIGNvbnN0IHsgaXNUb3JzaW9uRnJlZSB9ID0gZXh0cmFPcHRzO1xuICAgICAgaWYgKGNvZmFjdG9yID09PSBfMW4pIHJldHVybiB0cnVlO1xuICAgICAgaWYgKGlzVG9yc2lvbkZyZWUpIHJldHVybiBpc1RvcnNpb25GcmVlKFBvaW50LCB0aGlzKTtcbiAgICAgIHJldHVybiB3bmFmLnVuc2FmZSh0aGlzLCBDVVJWRV9PUkRFUikuaXMwKCk7XG4gICAgfVxuXG4gICAgY2xlYXJDb2ZhY3RvcigpOiBQb2ludCB7XG4gICAgICBjb25zdCB7IGNsZWFyQ29mYWN0b3IgfSA9IGV4dHJhT3B0cztcbiAgICAgIGlmIChjb2ZhY3RvciA9PT0gXzFuKSByZXR1cm4gdGhpczsgLy8gRmFzdC1wYXRoXG4gICAgICBpZiAoY2xlYXJDb2ZhY3RvcikgcmV0dXJuIGNsZWFyQ29mYWN0b3IoUG9pbnQsIHRoaXMpIGFzIFBvaW50O1xuICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbHlVbnNhZmUoY29mYWN0b3IpO1xuICAgIH1cblxuICAgIGlzU21hbGxPcmRlcigpOiBib29sZWFuIHtcbiAgICAgIC8vIGNhbiB3ZSB1c2UgdGhpcy5jbGVhckNvZmFjdG9yKCk/XG4gICAgICByZXR1cm4gdGhpcy5tdWx0aXBseVVuc2FmZShjb2ZhY3RvcikuaXMwKCk7XG4gICAgfVxuXG4gICAgdG9CeXRlcyhpc0NvbXByZXNzZWQgPSB0cnVlKTogVWludDhBcnJheSB7XG4gICAgICBhYm9vbChpc0NvbXByZXNzZWQsICdpc0NvbXByZXNzZWQnKTtcbiAgICAgIHRoaXMuYXNzZXJ0VmFsaWRpdHkoKTtcbiAgICAgIHJldHVybiBlbmNvZGVQb2ludChQb2ludCwgdGhpcywgaXNDb21wcmVzc2VkKTtcbiAgICB9XG5cbiAgICB0b0hleChpc0NvbXByZXNzZWQgPSB0cnVlKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiBieXRlc1RvSGV4KHRoaXMudG9CeXRlcyhpc0NvbXByZXNzZWQpKTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgIHJldHVybiBgPFBvaW50ICR7dGhpcy5pczAoKSA/ICdaRVJPJyA6IHRoaXMudG9IZXgoKX0+YDtcbiAgICB9XG4gIH1cbiAgY29uc3QgYml0cyA9IEZuLkJJVFM7XG4gIGNvbnN0IHduYWYgPSBuZXcgd05BRihQb2ludCwgZXh0cmFPcHRzLmVuZG8gPyBNYXRoLmNlaWwoYml0cyAvIDIpIDogYml0cyk7XG4gIFBvaW50LkJBU0UucHJlY29tcHV0ZSg4KTsgLy8gRW5hYmxlIHByZWNvbXB1dGVzLiBTbG93cyBkb3duIGZpcnN0IHB1YmxpY0tleSBjb21wdXRhdGlvbiBieSAyMG1zLlxuICByZXR1cm4gUG9pbnQ7XG59XG5cbi8qKiBNZXRob2RzIG9mIEVDRFNBIHNpZ25hdHVyZSBpbnN0YW5jZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRUNEU0FTaWduYXR1cmUge1xuICByZWFkb25seSByOiBiaWdpbnQ7XG4gIHJlYWRvbmx5IHM6IGJpZ2ludDtcbiAgcmVhZG9ubHkgcmVjb3Zlcnk/OiBudW1iZXI7XG4gIGFkZFJlY292ZXJ5Qml0KHJlY292ZXJ5OiBudW1iZXIpOiBFQ0RTQVNpZ25hdHVyZSAmIHsgcmVhZG9ubHkgcmVjb3Zlcnk6IG51bWJlciB9O1xuICBoYXNIaWdoUygpOiBib29sZWFuO1xuICByZWNvdmVyUHVibGljS2V5KG1lc3NhZ2VIYXNoOiBVaW50OEFycmF5KTogV2VpZXJzdHJhc3NQb2ludDxiaWdpbnQ+O1xuICB0b0J5dGVzKGZvcm1hdD86IHN0cmluZyk6IFVpbnQ4QXJyYXk7XG4gIHRvSGV4KGZvcm1hdD86IHN0cmluZyk6IHN0cmluZztcbn1cbi8qKiBNZXRob2RzIG9mIEVDRFNBIHNpZ25hdHVyZSBjb25zdHJ1Y3Rvci4gKi9cbmV4cG9ydCB0eXBlIEVDRFNBU2lnbmF0dXJlQ29ucyA9IHtcbiAgbmV3IChyOiBiaWdpbnQsIHM6IGJpZ2ludCwgcmVjb3Zlcnk/OiBudW1iZXIpOiBFQ0RTQVNpZ25hdHVyZTtcbiAgZnJvbUJ5dGVzKGJ5dGVzOiBVaW50OEFycmF5LCBmb3JtYXQ/OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCk6IEVDRFNBU2lnbmF0dXJlO1xuICBmcm9tSGV4KGhleDogc3RyaW5nLCBmb3JtYXQ/OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCk6IEVDRFNBU2lnbmF0dXJlO1xufTtcblxuLy8gUG9pbnRzIHN0YXJ0IHdpdGggYnl0ZSAweDAyIHdoZW4geSBpcyBldmVuOyBvdGhlcndpc2UgMHgwM1xuZnVuY3Rpb24gcHByZWZpeChoYXNFdmVuWTogYm9vbGVhbik6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gVWludDhBcnJheS5vZihoYXNFdmVuWSA/IDB4MDIgOiAweDAzKTtcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiB0aGUgU2hhbGx1ZSBhbmQgdmFuIGRlIFdvZXN0aWpuZSBtZXRob2QgZm9yIGFueSB3ZWllcnN0cmFzcyBjdXJ2ZS5cbiAqIFRPRE86IGNoZWNrIGlmIHRoZXJlIGlzIGEgd2F5IHRvIG1lcmdlIHRoaXMgd2l0aCB1dlJhdGlvIGluIEVkd2FyZHM7IG1vdmUgdG8gbW9kdWxhci5cbiAqIGIgPSBUcnVlIGFuZCB5ID0gc3FydCh1IC8gdikgaWYgKHUgLyB2KSBpcyBzcXVhcmUgaW4gRiwgYW5kXG4gKiBiID0gRmFsc2UgYW5kIHkgPSBzcXJ0KFogKiAodSAvIHYpKSBvdGhlcndpc2UuXG4gKiBAcGFyYW0gRnBcbiAqIEBwYXJhbSBaXG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gU1dVRnBTcXJ0UmF0aW88VD4oXG4gIEZwOiBJRmllbGQ8VD4sXG4gIFo6IFRcbik6ICh1OiBULCB2OiBUKSA9PiB7IGlzVmFsaWQ6IGJvb2xlYW47IHZhbHVlOiBUIH0ge1xuICAvLyBHZW5lcmljIGltcGxlbWVudGF0aW9uXG4gIGNvbnN0IHEgPSBGcC5PUkRFUjtcbiAgbGV0IGwgPSBfMG47XG4gIGZvciAobGV0IG8gPSBxIC0gXzFuOyBvICUgXzJuID09PSBfMG47IG8gLz0gXzJuKSBsICs9IF8xbjtcbiAgY29uc3QgYzEgPSBsOyAvLyAxLiBjMSwgdGhlIGxhcmdlc3QgaW50ZWdlciBzdWNoIHRoYXQgMl5jMSBkaXZpZGVzIHEgLSAxLlxuICAvLyBXZSBuZWVkIDJuICoqIGMxIGFuZCAybiAqKiAoYzEtMSkuIFdlIGNhbid0IHVzZSAqKjsgYnV0IHdlIGNhbiB1c2UgPDwuXG4gIC8vIDJuICoqIGMxID09IDJuIDw8IChjMS0xKVxuICBjb25zdCBfMm5fcG93X2MxXzEgPSBfMm4gPDwgKGMxIC0gXzFuIC0gXzFuKTtcbiAgY29uc3QgXzJuX3Bvd19jMSA9IF8ybl9wb3dfYzFfMSAqIF8ybjtcbiAgY29uc3QgYzIgPSAocSAtIF8xbikgLyBfMm5fcG93X2MxOyAvLyAyLiBjMiA9IChxIC0gMSkgLyAoMl5jMSkgICMgSW50ZWdlciBhcml0aG1ldGljXG4gIGNvbnN0IGMzID0gKGMyIC0gXzFuKSAvIF8ybjsgLy8gMy4gYzMgPSAoYzIgLSAxKSAvIDIgICAgICAgICAgICAjIEludGVnZXIgYXJpdGhtZXRpY1xuICBjb25zdCBjNCA9IF8ybl9wb3dfYzEgLSBfMW47IC8vIDQuIGM0ID0gMl5jMSAtIDEgICAgICAgICAgICAgICAgIyBJbnRlZ2VyIGFyaXRobWV0aWNcbiAgY29uc3QgYzUgPSBfMm5fcG93X2MxXzE7IC8vIDUuIGM1ID0gMl4oYzEgLSAxKSAgICAgICAgICAgICAgICAgICMgSW50ZWdlciBhcml0aG1ldGljXG4gIGNvbnN0IGM2ID0gRnAucG93KFosIGMyKTsgLy8gNi4gYzYgPSBaXmMyXG4gIGNvbnN0IGM3ID0gRnAucG93KFosIChjMiArIF8xbikgLyBfMm4pOyAvLyA3LiBjNyA9IFpeKChjMiArIDEpIC8gMilcbiAgbGV0IHNxcnRSYXRpbyA9ICh1OiBULCB2OiBUKTogeyBpc1ZhbGlkOiBib29sZWFuOyB2YWx1ZTogVCB9ID0+IHtcbiAgICBsZXQgdHYxID0gYzY7IC8vIDEuIHR2MSA9IGM2XG4gICAgbGV0IHR2MiA9IEZwLnBvdyh2LCBjNCk7IC8vIDIuIHR2MiA9IHZeYzRcbiAgICBsZXQgdHYzID0gRnAuc3FyKHR2Mik7IC8vIDMuIHR2MyA9IHR2Ml4yXG4gICAgdHYzID0gRnAubXVsKHR2Mywgdik7IC8vIDQuIHR2MyA9IHR2MyAqIHZcbiAgICBsZXQgdHY1ID0gRnAubXVsKHUsIHR2Myk7IC8vIDUuIHR2NSA9IHUgKiB0djNcbiAgICB0djUgPSBGcC5wb3codHY1LCBjMyk7IC8vIDYuIHR2NSA9IHR2NV5jM1xuICAgIHR2NSA9IEZwLm11bCh0djUsIHR2Mik7IC8vIDcuIHR2NSA9IHR2NSAqIHR2MlxuICAgIHR2MiA9IEZwLm11bCh0djUsIHYpOyAvLyA4LiB0djIgPSB0djUgKiB2XG4gICAgdHYzID0gRnAubXVsKHR2NSwgdSk7IC8vIDkuIHR2MyA9IHR2NSAqIHVcbiAgICBsZXQgdHY0ID0gRnAubXVsKHR2MywgdHYyKTsgLy8gMTAuIHR2NCA9IHR2MyAqIHR2MlxuICAgIHR2NSA9IEZwLnBvdyh0djQsIGM1KTsgLy8gMTEuIHR2NSA9IHR2NF5jNVxuICAgIGxldCBpc1FSID0gRnAuZXFsKHR2NSwgRnAuT05FKTsgLy8gMTIuIGlzUVIgPSB0djUgPT0gMVxuICAgIHR2MiA9IEZwLm11bCh0djMsIGM3KTsgLy8gMTMuIHR2MiA9IHR2MyAqIGM3XG4gICAgdHY1ID0gRnAubXVsKHR2NCwgdHYxKTsgLy8gMTQuIHR2NSA9IHR2NCAqIHR2MVxuICAgIHR2MyA9IEZwLmNtb3YodHYyLCB0djMsIGlzUVIpOyAvLyAxNS4gdHYzID0gQ01PVih0djIsIHR2MywgaXNRUilcbiAgICB0djQgPSBGcC5jbW92KHR2NSwgdHY0LCBpc1FSKTsgLy8gMTYuIHR2NCA9IENNT1YodHY1LCB0djQsIGlzUVIpXG4gICAgLy8gMTcuIGZvciBpIGluIChjMSwgYzEgLSAxLCAuLi4sIDIpOlxuICAgIGZvciAobGV0IGkgPSBjMTsgaSA+IF8xbjsgaS0tKSB7XG4gICAgICBsZXQgdHY1ID0gaSAtIF8ybjsgLy8gMTguICAgIHR2NSA9IGkgLSAyXG4gICAgICB0djUgPSBfMm4gPDwgKHR2NSAtIF8xbik7IC8vIDE5LiAgICB0djUgPSAyXnR2NVxuICAgICAgbGV0IHR2djUgPSBGcC5wb3codHY0LCB0djUpOyAvLyAyMC4gICAgdHY1ID0gdHY0XnR2NVxuICAgICAgY29uc3QgZTEgPSBGcC5lcWwodHZ2NSwgRnAuT05FKTsgLy8gMjEuICAgIGUxID0gdHY1ID09IDFcbiAgICAgIHR2MiA9IEZwLm11bCh0djMsIHR2MSk7IC8vIDIyLiAgICB0djIgPSB0djMgKiB0djFcbiAgICAgIHR2MSA9IEZwLm11bCh0djEsIHR2MSk7IC8vIDIzLiAgICB0djEgPSB0djEgKiB0djFcbiAgICAgIHR2djUgPSBGcC5tdWwodHY0LCB0djEpOyAvLyAyNC4gICAgdHY1ID0gdHY0ICogdHYxXG4gICAgICB0djMgPSBGcC5jbW92KHR2MiwgdHYzLCBlMSk7IC8vIDI1LiAgICB0djMgPSBDTU9WKHR2MiwgdHYzLCBlMSlcbiAgICAgIHR2NCA9IEZwLmNtb3YodHZ2NSwgdHY0LCBlMSk7IC8vIDI2LiAgICB0djQgPSBDTU9WKHR2NSwgdHY0LCBlMSlcbiAgICB9XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogaXNRUiwgdmFsdWU6IHR2MyB9O1xuICB9O1xuICBpZiAoRnAuT1JERVIgJSBfNG4gPT09IF8zbikge1xuICAgIC8vIHNxcnRfcmF0aW9fM21vZDQodSwgdilcbiAgICBjb25zdCBjMSA9IChGcC5PUkRFUiAtIF8zbikgLyBfNG47IC8vIDEuIGMxID0gKHEgLSAzKSAvIDQgICAgICMgSW50ZWdlciBhcml0aG1ldGljXG4gICAgY29uc3QgYzIgPSBGcC5zcXJ0KEZwLm5lZyhaKSk7IC8vIDIuIGMyID0gc3FydCgtWilcbiAgICBzcXJ0UmF0aW8gPSAodTogVCwgdjogVCkgPT4ge1xuICAgICAgbGV0IHR2MSA9IEZwLnNxcih2KTsgLy8gMS4gdHYxID0gdl4yXG4gICAgICBjb25zdCB0djIgPSBGcC5tdWwodSwgdik7IC8vIDIuIHR2MiA9IHUgKiB2XG4gICAgICB0djEgPSBGcC5tdWwodHYxLCB0djIpOyAvLyAzLiB0djEgPSB0djEgKiB0djJcbiAgICAgIGxldCB5MSA9IEZwLnBvdyh0djEsIGMxKTsgLy8gNC4geTEgPSB0djFeYzFcbiAgICAgIHkxID0gRnAubXVsKHkxLCB0djIpOyAvLyA1LiB5MSA9IHkxICogdHYyXG4gICAgICBjb25zdCB5MiA9IEZwLm11bCh5MSwgYzIpOyAvLyA2LiB5MiA9IHkxICogYzJcbiAgICAgIGNvbnN0IHR2MyA9IEZwLm11bChGcC5zcXIoeTEpLCB2KTsgLy8gNy4gdHYzID0geTFeMjsgOC4gdHYzID0gdHYzICogdlxuICAgICAgY29uc3QgaXNRUiA9IEZwLmVxbCh0djMsIHUpOyAvLyA5LiBpc1FSID0gdHYzID09IHVcbiAgICAgIGxldCB5ID0gRnAuY21vdih5MiwgeTEsIGlzUVIpOyAvLyAxMC4geSA9IENNT1YoeTIsIHkxLCBpc1FSKVxuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogaXNRUiwgdmFsdWU6IHkgfTsgLy8gMTEuIHJldHVybiAoaXNRUiwgeSkgaXNRUiA/IHkgOiB5KmMyXG4gICAgfTtcbiAgfVxuICAvLyBObyBjdXJ2ZXMgdXNlcyB0aGF0XG4gIC8vIGlmIChGcC5PUkRFUiAlIF84biA9PT0gXzVuKSAvLyBzcXJ0X3JhdGlvXzVtb2Q4XG4gIHJldHVybiBzcXJ0UmF0aW87XG59XG4vKipcbiAqIFNpbXBsaWZpZWQgU2hhbGx1ZS12YW4gZGUgV29lc3Rpam5lLVVsYXMgTWV0aG9kXG4gKiBodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjOTM4MCNzZWN0aW9uLTYuNi4yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXBUb0N1cnZlU2ltcGxlU1dVPFQ+KFxuICBGcDogSUZpZWxkPFQ+LFxuICBvcHRzOiB7XG4gICAgQTogVDtcbiAgICBCOiBUO1xuICAgIFo6IFQ7XG4gIH1cbik6ICh1OiBUKSA9PiB7IHg6IFQ7IHk6IFQgfSB7XG4gIHZhbGlkYXRlRmllbGQoRnApO1xuICBjb25zdCB7IEEsIEIsIFogfSA9IG9wdHM7XG4gIGlmICghRnAuaXNWYWxpZChBKSB8fCAhRnAuaXNWYWxpZChCKSB8fCAhRnAuaXNWYWxpZChaKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21hcFRvQ3VydmVTaW1wbGVTV1U6IGludmFsaWQgb3B0cycpO1xuICBjb25zdCBzcXJ0UmF0aW8gPSBTV1VGcFNxcnRSYXRpbyhGcCwgWik7XG4gIGlmICghRnAuaXNPZGQpIHRocm93IG5ldyBFcnJvcignRmllbGQgZG9lcyBub3QgaGF2ZSAuaXNPZGQoKScpO1xuICAvLyBJbnB1dDogdSwgYW4gZWxlbWVudCBvZiBGLlxuICAvLyBPdXRwdXQ6ICh4LCB5KSwgYSBwb2ludCBvbiBFLlxuICByZXR1cm4gKHU6IFQpOiB7IHg6IFQ7IHk6IFQgfSA9PiB7XG4gICAgLy8gcHJldHRpZXItaWdub3JlXG4gICAgbGV0IHR2MSwgdHYyLCB0djMsIHR2NCwgdHY1LCB0djYsIHgsIHk7XG4gICAgdHYxID0gRnAuc3FyKHUpOyAvLyAxLiAgdHYxID0gdV4yXG4gICAgdHYxID0gRnAubXVsKHR2MSwgWik7IC8vIDIuICB0djEgPSBaICogdHYxXG4gICAgdHYyID0gRnAuc3FyKHR2MSk7IC8vIDMuICB0djIgPSB0djFeMlxuICAgIHR2MiA9IEZwLmFkZCh0djIsIHR2MSk7IC8vIDQuICB0djIgPSB0djIgKyB0djFcbiAgICB0djMgPSBGcC5hZGQodHYyLCBGcC5PTkUpOyAvLyA1LiAgdHYzID0gdHYyICsgMVxuICAgIHR2MyA9IEZwLm11bCh0djMsIEIpOyAvLyA2LiAgdHYzID0gQiAqIHR2M1xuICAgIHR2NCA9IEZwLmNtb3YoWiwgRnAubmVnKHR2MiksICFGcC5lcWwodHYyLCBGcC5aRVJPKSk7IC8vIDcuICB0djQgPSBDTU9WKFosIC10djIsIHR2MiAhPSAwKVxuICAgIHR2NCA9IEZwLm11bCh0djQsIEEpOyAvLyA4LiAgdHY0ID0gQSAqIHR2NFxuICAgIHR2MiA9IEZwLnNxcih0djMpOyAvLyA5LiAgdHYyID0gdHYzXjJcbiAgICB0djYgPSBGcC5zcXIodHY0KTsgLy8gMTAuIHR2NiA9IHR2NF4yXG4gICAgdHY1ID0gRnAubXVsKHR2NiwgQSk7IC8vIDExLiB0djUgPSBBICogdHY2XG4gICAgdHYyID0gRnAuYWRkKHR2MiwgdHY1KTsgLy8gMTIuIHR2MiA9IHR2MiArIHR2NVxuICAgIHR2MiA9IEZwLm11bCh0djIsIHR2Myk7IC8vIDEzLiB0djIgPSB0djIgKiB0djNcbiAgICB0djYgPSBGcC5tdWwodHY2LCB0djQpOyAvLyAxNC4gdHY2ID0gdHY2ICogdHY0XG4gICAgdHY1ID0gRnAubXVsKHR2NiwgQik7IC8vIDE1LiB0djUgPSBCICogdHY2XG4gICAgdHYyID0gRnAuYWRkKHR2MiwgdHY1KTsgLy8gMTYuIHR2MiA9IHR2MiArIHR2NVxuICAgIHggPSBGcC5tdWwodHYxLCB0djMpOyAvLyAxNy4gICB4ID0gdHYxICogdHYzXG4gICAgY29uc3QgeyBpc1ZhbGlkLCB2YWx1ZSB9ID0gc3FydFJhdGlvKHR2MiwgdHY2KTsgLy8gMTguIChpc19neDFfc3F1YXJlLCB5MSkgPSBzcXJ0X3JhdGlvKHR2MiwgdHY2KVxuICAgIHkgPSBGcC5tdWwodHYxLCB1KTsgLy8gMTkuICAgeSA9IHR2MSAqIHUgIC0+IFogKiB1XjMgKiB5MVxuICAgIHkgPSBGcC5tdWwoeSwgdmFsdWUpOyAvLyAyMC4gICB5ID0geSAqIHkxXG4gICAgeCA9IEZwLmNtb3YoeCwgdHYzLCBpc1ZhbGlkKTsgLy8gMjEuICAgeCA9IENNT1YoeCwgdHYzLCBpc19neDFfc3F1YXJlKVxuICAgIHkgPSBGcC5jbW92KHksIHZhbHVlLCBpc1ZhbGlkKTsgLy8gMjIuICAgeSA9IENNT1YoeSwgeTEsIGlzX2d4MV9zcXVhcmUpXG4gICAgY29uc3QgZTEgPSBGcC5pc09kZCEodSkgPT09IEZwLmlzT2RkISh5KTsgLy8gMjMuICBlMSA9IHNnbjAodSkgPT0gc2duMCh5KVxuICAgIHkgPSBGcC5jbW92KEZwLm5lZyh5KSwgeSwgZTEpOyAvLyAyNC4gICB5ID0gQ01PVigteSwgeSwgZTEpXG4gICAgY29uc3QgdHY0X2ludiA9IEZwSW52ZXJ0QmF0Y2goRnAsIFt0djRdLCB0cnVlKVswXTtcbiAgICB4ID0gRnAubXVsKHgsIHR2NF9pbnYpOyAvLyAyNS4gICB4ID0geCAvIHR2NFxuICAgIHJldHVybiB7IHgsIHkgfTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0V0xlbmd0aHM8VD4oRnA6IElGaWVsZDxUPiwgRm46IElGaWVsZDxiaWdpbnQ+KSB7XG4gIHJldHVybiB7XG4gICAgc2VjcmV0S2V5OiBGbi5CWVRFUyxcbiAgICBwdWJsaWNLZXk6IDEgKyBGcC5CWVRFUyxcbiAgICBwdWJsaWNLZXlVbmNvbXByZXNzZWQ6IDEgKyAyICogRnAuQllURVMsXG4gICAgcHVibGljS2V5SGFzUHJlZml4OiB0cnVlLFxuICAgIHNpZ25hdHVyZTogMiAqIEZuLkJZVEVTLFxuICB9O1xufVxuXG4vKipcbiAqIFNvbWV0aW1lcyB1c2VycyBvbmx5IG5lZWQgZ2V0UHVibGljS2V5LCBnZXRTaGFyZWRTZWNyZXQsIGFuZCBzZWNyZXQga2V5IGhhbmRsaW5nLlxuICogVGhpcyBoZWxwZXIgZW5zdXJlcyBubyBzaWduYXR1cmUgZnVuY3Rpb25hbGl0eSBpcyBwcmVzZW50LiBMZXNzIGNvZGUsIHNtYWxsZXIgYnVuZGxlIHNpemUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlY2RoKFxuICBQb2ludDogV2VpZXJzdHJhc3NQb2ludENvbnM8YmlnaW50PixcbiAgZWNkaE9wdHM6IHsgcmFuZG9tQnl0ZXM/OiAoYnl0ZXNMZW5ndGg/OiBudW1iZXIpID0+IFVpbnQ4QXJyYXkgfSA9IHt9XG4pOiBFQ0RIIHtcbiAgY29uc3QgeyBGbiB9ID0gUG9pbnQ7XG4gIGNvbnN0IHJhbmRvbUJ5dGVzXyA9IGVjZGhPcHRzLnJhbmRvbUJ5dGVzIHx8IHdjUmFuZG9tQnl0ZXM7XG4gIGNvbnN0IGxlbmd0aHMgPSBPYmplY3QuYXNzaWduKGdldFdMZW5ndGhzKFBvaW50LkZwLCBGbiksIHsgc2VlZDogZ2V0TWluSGFzaExlbmd0aChGbi5PUkRFUikgfSk7XG5cbiAgZnVuY3Rpb24gaXNWYWxpZFNlY3JldEtleShzZWNyZXRLZXk6IFVpbnQ4QXJyYXkpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbnVtID0gRm4uZnJvbUJ5dGVzKHNlY3JldEtleSk7XG4gICAgICByZXR1cm4gRm4uaXNWYWxpZE5vdDAobnVtKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzVmFsaWRQdWJsaWNLZXkocHVibGljS2V5OiBVaW50OEFycmF5LCBpc0NvbXByZXNzZWQ/OiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyBwdWJsaWNLZXk6IGNvbXAsIHB1YmxpY0tleVVuY29tcHJlc3NlZCB9ID0gbGVuZ3RocztcbiAgICB0cnkge1xuICAgICAgY29uc3QgbCA9IHB1YmxpY0tleS5sZW5ndGg7XG4gICAgICBpZiAoaXNDb21wcmVzc2VkID09PSB0cnVlICYmIGwgIT09IGNvbXApIHJldHVybiBmYWxzZTtcbiAgICAgIGlmIChpc0NvbXByZXNzZWQgPT09IGZhbHNlICYmIGwgIT09IHB1YmxpY0tleVVuY29tcHJlc3NlZCkgcmV0dXJuIGZhbHNlO1xuICAgICAgcmV0dXJuICEhUG9pbnQuZnJvbUJ5dGVzKHB1YmxpY0tleSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJvZHVjZXMgY3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIHNlY3JldCBrZXkgZnJvbSByYW5kb20gb2Ygc2l6ZVxuICAgKiAoZ3JvdXBMZW4gKyBjZWlsKGdyb3VwTGVuIC8gMikpIHdpdGggbW9kdWxvIGJpYXMgYmVpbmcgbmVnbGlnaWJsZS5cbiAgICovXG4gIGZ1bmN0aW9uIHJhbmRvbVNlY3JldEtleShzZWVkID0gcmFuZG9tQnl0ZXNfKGxlbmd0aHMuc2VlZCkpOiBVaW50OEFycmF5IHtcbiAgICByZXR1cm4gbWFwSGFzaFRvRmllbGQoYWJ5dGVzKHNlZWQsIGxlbmd0aHMuc2VlZCwgJ3NlZWQnKSwgRm4uT1JERVIpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHB1YmxpYyBrZXkgZm9yIGEgc2VjcmV0IGtleS4gQ2hlY2tzIGZvciB2YWxpZGl0eSBvZiB0aGUgc2VjcmV0IGtleS5cbiAgICogQHBhcmFtIGlzQ29tcHJlc3NlZCB3aGV0aGVyIHRvIHJldHVybiBjb21wYWN0IChkZWZhdWx0KSwgb3IgZnVsbCBrZXlcbiAgICogQHJldHVybnMgUHVibGljIGtleSwgZnVsbCB3aGVuIGlzQ29tcHJlc3NlZD1mYWxzZTsgc2hvcnQgd2hlbiBpc0NvbXByZXNzZWQ9dHJ1ZVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0UHVibGljS2V5KHNlY3JldEtleTogVWludDhBcnJheSwgaXNDb21wcmVzc2VkID0gdHJ1ZSk6IFVpbnQ4QXJyYXkge1xuICAgIHJldHVybiBQb2ludC5CQVNFLm11bHRpcGx5KEZuLmZyb21CeXRlcyhzZWNyZXRLZXkpKS50b0J5dGVzKGlzQ29tcHJlc3NlZCk7XG4gIH1cblxuICAvKipcbiAgICogUXVpY2sgYW5kIGRpcnR5IGNoZWNrIGZvciBpdGVtIGJlaW5nIHB1YmxpYyBrZXkuIERvZXMgbm90IHZhbGlkYXRlIGhleCwgb3IgYmVpbmcgb24tY3VydmUuXG4gICAqL1xuICBmdW5jdGlvbiBpc1Byb2JQdWIoaXRlbTogVWludDhBcnJheSk6IGJvb2xlYW4gfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgc2VjcmV0S2V5LCBwdWJsaWNLZXksIHB1YmxpY0tleVVuY29tcHJlc3NlZCB9ID0gbGVuZ3RocztcbiAgICBpZiAoIWlzQnl0ZXMoaXRlbSkpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgaWYgKCgnX2xlbmd0aHMnIGluIEZuICYmIEZuLl9sZW5ndGhzKSB8fCBzZWNyZXRLZXkgPT09IHB1YmxpY0tleSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICBjb25zdCBsID0gYWJ5dGVzKGl0ZW0sIHVuZGVmaW5lZCwgJ2tleScpLmxlbmd0aDtcbiAgICByZXR1cm4gbCA9PT0gcHVibGljS2V5IHx8IGwgPT09IHB1YmxpY0tleVVuY29tcHJlc3NlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFQ0RIIChFbGxpcHRpYyBDdXJ2ZSBEaWZmaWUgSGVsbG1hbikuXG4gICAqIENvbXB1dGVzIHNoYXJlZCBwdWJsaWMga2V5IGZyb20gc2VjcmV0IGtleSBBIGFuZCBwdWJsaWMga2V5IEIuXG4gICAqIENoZWNrczogMSkgc2VjcmV0IGtleSB2YWxpZGl0eSAyKSBzaGFyZWQga2V5IGlzIG9uLWN1cnZlLlxuICAgKiBEb2VzIE5PVCBoYXNoIHRoZSByZXN1bHQuXG4gICAqIEBwYXJhbSBpc0NvbXByZXNzZWQgd2hldGhlciB0byByZXR1cm4gY29tcGFjdCAoZGVmYXVsdCksIG9yIGZ1bGwga2V5XG4gICAqIEByZXR1cm5zIHNoYXJlZCBwdWJsaWMga2V5XG4gICAqL1xuICBmdW5jdGlvbiBnZXRTaGFyZWRTZWNyZXQoXG4gICAgc2VjcmV0S2V5QTogVWludDhBcnJheSxcbiAgICBwdWJsaWNLZXlCOiBVaW50OEFycmF5LFxuICAgIGlzQ29tcHJlc3NlZCA9IHRydWVcbiAgKTogVWludDhBcnJheSB7XG4gICAgaWYgKGlzUHJvYlB1YihzZWNyZXRLZXlBKSA9PT0gdHJ1ZSkgdGhyb3cgbmV3IEVycm9yKCdmaXJzdCBhcmcgbXVzdCBiZSBwcml2YXRlIGtleScpO1xuICAgIGlmIChpc1Byb2JQdWIocHVibGljS2V5QikgPT09IGZhbHNlKSB0aHJvdyBuZXcgRXJyb3IoJ3NlY29uZCBhcmcgbXVzdCBiZSBwdWJsaWMga2V5Jyk7XG4gICAgY29uc3QgcyA9IEZuLmZyb21CeXRlcyhzZWNyZXRLZXlBKTtcbiAgICBjb25zdCBiID0gUG9pbnQuZnJvbUJ5dGVzKHB1YmxpY0tleUIpOyAvLyBjaGVja3MgZm9yIGJlaW5nIG9uLWN1cnZlXG4gICAgcmV0dXJuIGIubXVsdGlwbHkocykudG9CeXRlcyhpc0NvbXByZXNzZWQpO1xuICB9XG5cbiAgY29uc3QgdXRpbHMgPSB7XG4gICAgaXNWYWxpZFNlY3JldEtleSxcbiAgICBpc1ZhbGlkUHVibGljS2V5LFxuICAgIHJhbmRvbVNlY3JldEtleSxcbiAgfTtcbiAgY29uc3Qga2V5Z2VuID0gY3JlYXRlS2V5Z2VuKHJhbmRvbVNlY3JldEtleSwgZ2V0UHVibGljS2V5KTtcblxuICByZXR1cm4gT2JqZWN0LmZyZWV6ZSh7IGdldFB1YmxpY0tleSwgZ2V0U2hhcmVkU2VjcmV0LCBrZXlnZW4sIFBvaW50LCB1dGlscywgbGVuZ3RocyB9KTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIEVDRFNBIHNpZ25pbmcgaW50ZXJmYWNlIGZvciBnaXZlbiBlbGxpcHRpYyBjdXJ2ZSBgUG9pbnRgIGFuZCBgaGFzaGAgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIFBvaW50IGNyZWF0ZWQgdXNpbmcge0BsaW5rIHdlaWVyc3RyYXNzfSBmdW5jdGlvblxuICogQHBhcmFtIGhhc2ggdXNlZCBmb3IgMSkgbWVzc2FnZSBwcmVoYXNoLWluZyAyKSBrIGdlbmVyYXRpb24gaW4gYHNpZ25gLCB1c2luZyBobWFjX2RyYmcoaGFzaClcbiAqIEBwYXJhbSBlY2RzYU9wdHMgcmFyZWx5IG5lZWRlZCwgc2VlIHtAbGluayBFQ0RTQU9wdHN9XG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYGpzXG4gKiBjb25zdCBwMjU2X1BvaW50ID0gd2VpZXJzdHJhc3MoLi4uKTtcbiAqIGNvbnN0IHAyNTZfc2hhMjU2ID0gZWNkc2EocDI1Nl9Qb2ludCwgc2hhMjU2KTtcbiAqIGNvbnN0IHAyNTZfc2hhMjI0ID0gZWNkc2EocDI1Nl9Qb2ludCwgc2hhMjI0KTtcbiAqIGNvbnN0IHAyNTZfc2hhMjI0X3IgPSBlY2RzYShwMjU2X1BvaW50LCBzaGEyMjQsIHsgcmFuZG9tQnl0ZXM6IChsZW5ndGgpID0+IHsgLi4uIH0gfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVjZHNhKFxuICBQb2ludDogV2VpZXJzdHJhc3NQb2ludENvbnM8YmlnaW50PixcbiAgaGFzaDogQ0hhc2gsXG4gIGVjZHNhT3B0czogRUNEU0FPcHRzID0ge31cbik6IEVDRFNBIHtcbiAgYWhhc2goaGFzaCk7XG4gIHZhbGlkYXRlT2JqZWN0KFxuICAgIGVjZHNhT3B0cyxcbiAgICB7fSxcbiAgICB7XG4gICAgICBobWFjOiAnZnVuY3Rpb24nLFxuICAgICAgbG93UzogJ2Jvb2xlYW4nLFxuICAgICAgcmFuZG9tQnl0ZXM6ICdmdW5jdGlvbicsXG4gICAgICBiaXRzMmludDogJ2Z1bmN0aW9uJyxcbiAgICAgIGJpdHMyaW50X21vZE46ICdmdW5jdGlvbicsXG4gICAgfVxuICApO1xuICBlY2RzYU9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCBlY2RzYU9wdHMpO1xuICBjb25zdCByYW5kb21CeXRlcyA9IGVjZHNhT3B0cy5yYW5kb21CeXRlcyB8fCB3Y1JhbmRvbUJ5dGVzO1xuICBjb25zdCBobWFjID0gZWNkc2FPcHRzLmhtYWMgfHwgKChrZXksIG1zZykgPT4gbm9ibGVIbWFjKGhhc2gsIGtleSwgbXNnKSk7XG5cbiAgY29uc3QgeyBGcCwgRm4gfSA9IFBvaW50O1xuICBjb25zdCB7IE9SREVSOiBDVVJWRV9PUkRFUiwgQklUUzogZm5CaXRzIH0gPSBGbjtcbiAgY29uc3QgeyBrZXlnZW4sIGdldFB1YmxpY0tleSwgZ2V0U2hhcmVkU2VjcmV0LCB1dGlscywgbGVuZ3RocyB9ID0gZWNkaChQb2ludCwgZWNkc2FPcHRzKTtcbiAgY29uc3QgZGVmYXVsdFNpZ09wdHM6IFJlcXVpcmVkPEVDRFNBU2lnbk9wdHM+ID0ge1xuICAgIHByZWhhc2g6IHRydWUsXG4gICAgbG93UzogdHlwZW9mIGVjZHNhT3B0cy5sb3dTID09PSAnYm9vbGVhbicgPyBlY2RzYU9wdHMubG93UyA6IHRydWUsXG4gICAgZm9ybWF0OiAnY29tcGFjdCcgYXMgRUNEU0FTaWduYXR1cmVGb3JtYXQsXG4gICAgZXh0cmFFbnRyb3B5OiBmYWxzZSxcbiAgfTtcbiAgY29uc3QgaGFzTGFyZ2VDb2ZhY3RvciA9IENVUlZFX09SREVSICogXzJuIDwgRnAuT1JERVI7IC8vIFdvbid0IENVUlZFKCkuaCA+IDJuIGJlIG1vcmUgZWZmZWN0aXZlP1xuXG4gIGZ1bmN0aW9uIGlzQmlnZ2VyVGhhbkhhbGZPcmRlcihudW1iZXI6IGJpZ2ludCkge1xuICAgIGNvbnN0IEhBTEYgPSBDVVJWRV9PUkRFUiA+PiBfMW47XG4gICAgcmV0dXJuIG51bWJlciA+IEhBTEY7XG4gIH1cbiAgZnVuY3Rpb24gdmFsaWRhdGVSUyh0aXRsZTogc3RyaW5nLCBudW06IGJpZ2ludCk6IGJpZ2ludCB7XG4gICAgaWYgKCFGbi5pc1ZhbGlkTm90MChudW0pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIHNpZ25hdHVyZSAke3RpdGxlfTogb3V0IG9mIHJhbmdlIDEuLlBvaW50LkZuLk9SREVSYCk7XG4gICAgcmV0dXJuIG51bTtcbiAgfVxuICBmdW5jdGlvbiBhc3NlcnRTbWFsbENvZmFjdG9yKCk6IHZvaWQge1xuICAgIC8vIEVDRFNBIHJlY292ZXJ5IGlzIGhhcmQgZm9yIGNvZmFjdG9yID4gMSBjdXJ2ZXMuXG4gICAgLy8gSW4gc2lnbiwgYHIgPSBxLnggbW9kIG5gLCBhbmQgaGVyZSB3ZSByZWNvdmVyIHEueCBmcm9tIHIuXG4gICAgLy8gV2hpbGUgcmVjb3ZlcmluZyBxLnggPj0gbiwgd2UgbmVlZCB0byBhZGQgcituIGZvciBjb2ZhY3Rvcj0xIGN1cnZlcy5cbiAgICAvLyBIb3dldmVyLCBmb3IgY29mYWN0b3I+MSwgcituIG1heSBub3QgZ2V0IHEueDpcbiAgICAvLyByK24qaSB3b3VsZCBuZWVkIHRvIGJlIGRvbmUgaW5zdGVhZCB3aGVyZSBpIGlzIHVua25vd24uXG4gICAgLy8gVG8gZWFzaWx5IGdldCBpLCB3ZSBlaXRoZXIgbmVlZCB0bzpcbiAgICAvLyBhLiBpbmNyZWFzZSBhbW91bnQgb2YgdmFsaWQgcmVjaWQgdmFsdWVzICg0LCA1Li4uKTsgT1JcbiAgICAvLyBiLiBwcm9oaWJpdCBub24tcHJpbWUtb3JkZXIgc2lnbmF0dXJlcyAocmVjaWQgPiAxKS5cbiAgICBpZiAoaGFzTGFyZ2VDb2ZhY3RvcilcbiAgICAgIHRocm93IG5ldyBFcnJvcignXCJyZWNvdmVyZWRcIiBzaWcgdHlwZSBpcyBub3Qgc3VwcG9ydGVkIGZvciBjb2ZhY3RvciA+MiBjdXJ2ZXMnKTtcbiAgfVxuICBmdW5jdGlvbiB2YWxpZGF0ZVNpZ0xlbmd0aChieXRlczogVWludDhBcnJheSwgZm9ybWF0OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCkge1xuICAgIHZhbGlkYXRlU2lnRm9ybWF0KGZvcm1hdCk7XG4gICAgY29uc3Qgc2l6ZSA9IGxlbmd0aHMuc2lnbmF0dXJlITtcbiAgICBjb25zdCBzaXplciA9IGZvcm1hdCA9PT0gJ2NvbXBhY3QnID8gc2l6ZSA6IGZvcm1hdCA9PT0gJ3JlY292ZXJlZCcgPyBzaXplICsgMSA6IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gYWJ5dGVzKGJ5dGVzLCBzaXplcik7XG4gIH1cblxuICAvKipcbiAgICogRUNEU0Egc2lnbmF0dXJlIHdpdGggaXRzIChyLCBzKSBwcm9wZXJ0aWVzLiBTdXBwb3J0cyBjb21wYWN0LCByZWNvdmVyZWQgJiBERVIgcmVwcmVzZW50YXRpb25zLlxuICAgKi9cbiAgY2xhc3MgU2lnbmF0dXJlIGltcGxlbWVudHMgRUNEU0FTaWduYXR1cmUge1xuICAgIHJlYWRvbmx5IHI6IGJpZ2ludDtcbiAgICByZWFkb25seSBzOiBiaWdpbnQ7XG4gICAgcmVhZG9ubHkgcmVjb3Zlcnk/OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihyOiBiaWdpbnQsIHM6IGJpZ2ludCwgcmVjb3Zlcnk/OiBudW1iZXIpIHtcbiAgICAgIHRoaXMuciA9IHZhbGlkYXRlUlMoJ3InLCByKTsgLy8gciBpbiBbMS4uTi0xXTtcbiAgICAgIHRoaXMucyA9IHZhbGlkYXRlUlMoJ3MnLCBzKTsgLy8gcyBpbiBbMS4uTi0xXTtcbiAgICAgIGlmIChyZWNvdmVyeSAhPSBudWxsKSB7XG4gICAgICAgIGFzc2VydFNtYWxsQ29mYWN0b3IoKTtcbiAgICAgICAgaWYgKCFbMCwgMSwgMiwgM10uaW5jbHVkZXMocmVjb3ZlcnkpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcmVjb3ZlcnkgaWQnKTtcbiAgICAgICAgdGhpcy5yZWNvdmVyeSA9IHJlY292ZXJ5O1xuICAgICAgfVxuICAgICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZnJvbUJ5dGVzKFxuICAgICAgYnl0ZXM6IFVpbnQ4QXJyYXksXG4gICAgICBmb3JtYXQ6IEVDRFNBU2lnbmF0dXJlRm9ybWF0ID0gZGVmYXVsdFNpZ09wdHMuZm9ybWF0XG4gICAgKTogU2lnbmF0dXJlIHtcbiAgICAgIHZhbGlkYXRlU2lnTGVuZ3RoKGJ5dGVzLCBmb3JtYXQpO1xuICAgICAgbGV0IHJlY2lkOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgICBpZiAoZm9ybWF0ID09PSAnZGVyJykge1xuICAgICAgICBjb25zdCB7IHIsIHMgfSA9IERFUi50b1NpZyhhYnl0ZXMoYnl0ZXMpKTtcbiAgICAgICAgcmV0dXJuIG5ldyBTaWduYXR1cmUociwgcyk7XG4gICAgICB9XG4gICAgICBpZiAoZm9ybWF0ID09PSAncmVjb3ZlcmVkJykge1xuICAgICAgICByZWNpZCA9IGJ5dGVzWzBdO1xuICAgICAgICBmb3JtYXQgPSAnY29tcGFjdCc7XG4gICAgICAgIGJ5dGVzID0gYnl0ZXMuc3ViYXJyYXkoMSk7XG4gICAgICB9XG4gICAgICBjb25zdCBMID0gbGVuZ3Rocy5zaWduYXR1cmUhIC8gMjtcbiAgICAgIGNvbnN0IHIgPSBieXRlcy5zdWJhcnJheSgwLCBMKTtcbiAgICAgIGNvbnN0IHMgPSBieXRlcy5zdWJhcnJheShMLCBMICogMik7XG4gICAgICByZXR1cm4gbmV3IFNpZ25hdHVyZShGbi5mcm9tQnl0ZXMociksIEZuLmZyb21CeXRlcyhzKSwgcmVjaWQpO1xuICAgIH1cblxuICAgIHN0YXRpYyBmcm9tSGV4KGhleDogc3RyaW5nLCBmb3JtYXQ/OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCkge1xuICAgICAgcmV0dXJuIHRoaXMuZnJvbUJ5dGVzKGhleFRvQnl0ZXMoaGV4KSwgZm9ybWF0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzc2VydFJlY292ZXJ5KCk6IG51bWJlciB7XG4gICAgICBjb25zdCB7IHJlY292ZXJ5IH0gPSB0aGlzO1xuICAgICAgaWYgKHJlY292ZXJ5ID09IG51bGwpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCByZWNvdmVyeSBpZDogbXVzdCBiZSBwcmVzZW50Jyk7XG4gICAgICByZXR1cm4gcmVjb3Zlcnk7XG4gICAgfVxuXG4gICAgYWRkUmVjb3ZlcnlCaXQocmVjb3Zlcnk6IG51bWJlcik6IFJlY292ZXJlZFNpZ25hdHVyZSB7XG4gICAgICByZXR1cm4gbmV3IFNpZ25hdHVyZSh0aGlzLnIsIHRoaXMucywgcmVjb3ZlcnkpIGFzIFJlY292ZXJlZFNpZ25hdHVyZTtcbiAgICB9XG5cbiAgICByZWNvdmVyUHVibGljS2V5KG1lc3NhZ2VIYXNoOiBVaW50OEFycmF5KTogV2VpZXJzdHJhc3NQb2ludDxiaWdpbnQ+IHtcbiAgICAgIGNvbnN0IHsgciwgcyB9ID0gdGhpcztcbiAgICAgIGNvbnN0IHJlY292ZXJ5ID0gdGhpcy5hc3NlcnRSZWNvdmVyeSgpO1xuICAgICAgY29uc3QgcmFkaiA9IHJlY292ZXJ5ID09PSAyIHx8IHJlY292ZXJ5ID09PSAzID8gciArIENVUlZFX09SREVSIDogcjtcbiAgICAgIGlmICghRnAuaXNWYWxpZChyYWRqKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHJlY292ZXJ5IGlkOiBzaWcucitjdXJ2ZS5uICE9IFIueCcpO1xuICAgICAgY29uc3QgeCA9IEZwLnRvQnl0ZXMocmFkaik7XG4gICAgICBjb25zdCBSID0gUG9pbnQuZnJvbUJ5dGVzKGNvbmNhdEJ5dGVzKHBwcmVmaXgoKHJlY292ZXJ5ICYgMSkgPT09IDApLCB4KSk7XG4gICAgICBjb25zdCBpciA9IEZuLmludihyYWRqKTsgLy8gcl4tMVxuICAgICAgY29uc3QgaCA9IGJpdHMyaW50X21vZE4oYWJ5dGVzKG1lc3NhZ2VIYXNoLCB1bmRlZmluZWQsICdtc2dIYXNoJykpOyAvLyBUcnVuY2F0ZSBoYXNoXG4gICAgICBjb25zdCB1MSA9IEZuLmNyZWF0ZSgtaCAqIGlyKTsgLy8gLWhyXi0xXG4gICAgICBjb25zdCB1MiA9IEZuLmNyZWF0ZShzICogaXIpOyAvLyBzcl4tMVxuICAgICAgLy8gKHNyXi0xKVItKGhyXi0xKUcgPSAtKGhyXi0xKUcgKyAoc3JeLTEpLiB1bnNhZmUgaXMgZmluZTogdGhlcmUgaXMgbm8gcHJpdmF0ZSBkYXRhLlxuICAgICAgY29uc3QgUSA9IFBvaW50LkJBU0UubXVsdGlwbHlVbnNhZmUodTEpLmFkZChSLm11bHRpcGx5VW5zYWZlKHUyKSk7XG4gICAgICBpZiAoUS5pczAoKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHJlY292ZXJ5OiBwb2ludCBhdCBpbmZpbmlmeScpO1xuICAgICAgUS5hc3NlcnRWYWxpZGl0eSgpO1xuICAgICAgcmV0dXJuIFE7XG4gICAgfVxuXG4gICAgLy8gU2lnbmF0dXJlcyBzaG91bGQgYmUgbG93LXMsIHRvIHByZXZlbnQgbWFsbGVhYmlsaXR5LlxuICAgIGhhc0hpZ2hTKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIGlzQmlnZ2VyVGhhbkhhbGZPcmRlcih0aGlzLnMpO1xuICAgIH1cblxuICAgIHRvQnl0ZXMoZm9ybWF0OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCA9IGRlZmF1bHRTaWdPcHRzLmZvcm1hdCkge1xuICAgICAgdmFsaWRhdGVTaWdGb3JtYXQoZm9ybWF0KTtcbiAgICAgIGlmIChmb3JtYXQgPT09ICdkZXInKSByZXR1cm4gaGV4VG9CeXRlcyhERVIuaGV4RnJvbVNpZyh0aGlzKSk7XG4gICAgICBjb25zdCB7IHIsIHMgfSA9IHRoaXM7XG4gICAgICBjb25zdCByYiA9IEZuLnRvQnl0ZXMocik7XG4gICAgICBjb25zdCBzYiA9IEZuLnRvQnl0ZXMocyk7XG4gICAgICBpZiAoZm9ybWF0ID09PSAncmVjb3ZlcmVkJykge1xuICAgICAgICBhc3NlcnRTbWFsbENvZmFjdG9yKCk7XG4gICAgICAgIHJldHVybiBjb25jYXRCeXRlcyhVaW50OEFycmF5Lm9mKHRoaXMuYXNzZXJ0UmVjb3ZlcnkoKSksIHJiLCBzYik7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29uY2F0Qnl0ZXMocmIsIHNiKTtcbiAgICB9XG5cbiAgICB0b0hleChmb3JtYXQ/OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCkge1xuICAgICAgcmV0dXJuIGJ5dGVzVG9IZXgodGhpcy50b0J5dGVzKGZvcm1hdCkpO1xuICAgIH1cbiAgfVxuICB0eXBlIFJlY292ZXJlZFNpZ25hdHVyZSA9IFNpZ25hdHVyZSAmIHsgcmVjb3Zlcnk6IG51bWJlciB9O1xuXG4gIC8vIFJGQzY5Nzk6IGVuc3VyZSBFQ0RTQSBtc2cgaXMgWCBieXRlcyBhbmQgPCBOLiBSRkMgc3VnZ2VzdHMgb3B0aW9uYWwgdHJ1bmNhdGluZyB2aWEgYml0czJvY3RldHMuXG4gIC8vIEZJUFMgMTg2LTQgNC42IHN1Z2dlc3RzIHRoZSBsZWZ0bW9zdCBtaW4obkJpdExlbiwgb3V0TGVuKSBiaXRzLCB3aGljaCBtYXRjaGVzIGJpdHMyaW50LlxuICAvLyBiaXRzMmludCBjYW4gcHJvZHVjZSByZXM+Tiwgd2UgY2FuIGRvIG1vZChyZXMsIE4pIHNpbmNlIHRoZSBiaXRMZW4gaXMgdGhlIHNhbWUuXG4gIC8vIGludDJvY3RldHMgY2FuJ3QgYmUgdXNlZDsgcGFkcyBzbWFsbCBtc2dzIHdpdGggMDogdW5hY2NlcHRhdGJsZSBmb3IgdHJ1bmMgYXMgcGVyIFJGQyB2ZWN0b3JzXG4gIGNvbnN0IGJpdHMyaW50ID1cbiAgICBlY2RzYU9wdHMuYml0czJpbnQgfHxcbiAgICBmdW5jdGlvbiBiaXRzMmludF9kZWYoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBiaWdpbnQge1xuICAgICAgLy8gT3VyIGN1c3RvbSBjaGVjayBcImp1c3QgaW4gY2FzZVwiLCBmb3IgcHJvdGVjdGlvbiBhZ2FpbnN0IERvU1xuICAgICAgaWYgKGJ5dGVzLmxlbmd0aCA+IDgxOTIpIHRocm93IG5ldyBFcnJvcignaW5wdXQgaXMgdG9vIGxhcmdlJyk7XG4gICAgICAvLyBGb3IgY3VydmVzIHdpdGggbkJpdExlbmd0aCAlIDggIT09IDA6IGJpdHMyb2N0ZXRzKGJpdHMyb2N0ZXRzKG0pKSAhPT0gYml0czJvY3RldHMobSlcbiAgICAgIC8vIGZvciBzb21lIGNhc2VzLCBzaW5jZSBieXRlcy5sZW5ndGggKiA4IGlzIG5vdCBhY3R1YWwgYml0TGVuZ3RoLlxuICAgICAgY29uc3QgbnVtID0gYnl0ZXNUb051bWJlckJFKGJ5dGVzKTsgLy8gY2hlY2sgZm9yID09IHU4IGRvbmUgaGVyZVxuICAgICAgY29uc3QgZGVsdGEgPSBieXRlcy5sZW5ndGggKiA4IC0gZm5CaXRzOyAvLyB0cnVuY2F0ZSB0byBuQml0TGVuZ3RoIGxlZnRtb3N0IGJpdHNcbiAgICAgIHJldHVybiBkZWx0YSA+IDAgPyBudW0gPj4gQmlnSW50KGRlbHRhKSA6IG51bTtcbiAgICB9O1xuICBjb25zdCBiaXRzMmludF9tb2ROID1cbiAgICBlY2RzYU9wdHMuYml0czJpbnRfbW9kTiB8fFxuICAgIGZ1bmN0aW9uIGJpdHMyaW50X21vZE5fZGVmKGJ5dGVzOiBVaW50OEFycmF5KTogYmlnaW50IHtcbiAgICAgIHJldHVybiBGbi5jcmVhdGUoYml0czJpbnQoYnl0ZXMpKTsgLy8gY2FuJ3QgdXNlIGJ5dGVzVG9OdW1iZXJCRSBoZXJlXG4gICAgfTtcbiAgLy8gUGFkcyBvdXRwdXQgd2l0aCB6ZXJvIGFzIHBlciBzcGVjXG4gIGNvbnN0IE9SREVSX01BU0sgPSBiaXRNYXNrKGZuQml0cyk7XG4gIC8qKiBDb252ZXJ0cyB0byBieXRlcy4gQ2hlY2tzIGlmIG51bSBpbiBgWzAuLk9SREVSX01BU0stMV1gIGUuZy46IGBbMC4uMl4yNTYtMV1gLiAqL1xuICBmdW5jdGlvbiBpbnQyb2N0ZXRzKG51bTogYmlnaW50KTogVWludDhBcnJheSB7XG4gICAgLy8gSU1QT1JUQU5UOiB0aGUgY2hlY2sgZW5zdXJlcyB3b3JraW5nIGZvciBjYXNlIGBGbi5CWVRFUyAhPSBGbi5CSVRTICogOGBcbiAgICBhSW5SYW5nZSgnbnVtIDwgMl4nICsgZm5CaXRzLCBudW0sIF8wbiwgT1JERVJfTUFTSyk7XG4gICAgcmV0dXJuIEZuLnRvQnl0ZXMobnVtKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlTXNnQW5kSGFzaChtZXNzYWdlOiBVaW50OEFycmF5LCBwcmVoYXNoOiBib29sZWFuKSB7XG4gICAgYWJ5dGVzKG1lc3NhZ2UsIHVuZGVmaW5lZCwgJ21lc3NhZ2UnKTtcbiAgICByZXR1cm4gcHJlaGFzaCA/IGFieXRlcyhoYXNoKG1lc3NhZ2UpLCB1bmRlZmluZWQsICdwcmVoYXNoZWQgbWVzc2FnZScpIDogbWVzc2FnZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGVwcyBBLCBEIG9mIFJGQzY5NzkgMy4yLlxuICAgKiBDcmVhdGVzIFJGQzY5Nzkgc2VlZDsgY29udmVydHMgbXNnL3ByaXZLZXkgdG8gbnVtYmVycy5cbiAgICogVXNlZCBvbmx5IGluIHNpZ24sIG5vdCBpbiB2ZXJpZnkuXG4gICAqXG4gICAqIFdhcm5pbmc6IHdlIGNhbm5vdCBhc3N1bWUgaGVyZSB0aGF0IG1lc3NhZ2UgaGFzIHNhbWUgYW1vdW50IG9mIGJ5dGVzIGFzIGN1cnZlIG9yZGVyLFxuICAgKiB0aGlzIHdpbGwgYmUgaW52YWxpZCBhdCBsZWFzdCBmb3IgUDUyMS4gQWxzbyBpdCBjYW4gYmUgYmlnZ2VyIGZvciBQMjI0ICsgU0hBMjU2LlxuICAgKi9cbiAgZnVuY3Rpb24gcHJlcFNpZyhtZXNzYWdlOiBVaW50OEFycmF5LCBzZWNyZXRLZXk6IFVpbnQ4QXJyYXksIG9wdHM6IEVDRFNBU2lnbk9wdHMpIHtcbiAgICBjb25zdCB7IGxvd1MsIHByZWhhc2gsIGV4dHJhRW50cm9weSB9ID0gdmFsaWRhdGVTaWdPcHRzKG9wdHMsIGRlZmF1bHRTaWdPcHRzKTtcbiAgICBtZXNzYWdlID0gdmFsaWRhdGVNc2dBbmRIYXNoKG1lc3NhZ2UsIHByZWhhc2gpOyAvLyBSRkM2OTc5IDMuMiBBOiBoMSA9IEgobSlcbiAgICAvLyBXZSBjYW4ndCBsYXRlciBjYWxsIGJpdHMyb2N0ZXRzLCBzaW5jZSBuZXN0ZWQgYml0czJpbnQgaXMgYnJva2VuIGZvciBjdXJ2ZXNcbiAgICAvLyB3aXRoIGZuQml0cyAlIDggIT09IDAuIEJlY2F1c2Ugb2YgdGhhdCwgd2UgdW53cmFwIGl0IGhlcmUgYXMgaW50Mm9jdGV0cyBjYWxsLlxuICAgIC8vIGNvbnN0IGJpdHMyb2N0ZXRzID0gKGJpdHMpID0+IGludDJvY3RldHMoYml0czJpbnRfbW9kTihiaXRzKSlcbiAgICBjb25zdCBoMWludCA9IGJpdHMyaW50X21vZE4obWVzc2FnZSk7XG4gICAgY29uc3QgZCA9IEZuLmZyb21CeXRlcyhzZWNyZXRLZXkpOyAvLyB2YWxpZGF0ZSBzZWNyZXQga2V5LCBjb252ZXJ0IHRvIGJpZ2ludFxuICAgIGlmICghRm4uaXNWYWxpZE5vdDAoZCkpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBwcml2YXRlIGtleScpO1xuICAgIGNvbnN0IHNlZWRBcmdzID0gW2ludDJvY3RldHMoZCksIGludDJvY3RldHMoaDFpbnQpXTtcbiAgICAvLyBleHRyYUVudHJvcHkuIFJGQzY5NzkgMy42OiBhZGRpdGlvbmFsIGsnIChvcHRpb25hbCkuXG4gICAgaWYgKGV4dHJhRW50cm9weSAhPSBudWxsICYmIGV4dHJhRW50cm9weSAhPT0gZmFsc2UpIHtcbiAgICAgIC8vIEsgPSBITUFDX0soViB8fCAweDAwIHx8IGludDJvY3RldHMoeCkgfHwgYml0czJvY3RldHMoaDEpIHx8IGsnKVxuICAgICAgLy8gZ2VuIHJhbmRvbSBieXRlcyBPUiBwYXNzIGFzLWlzXG4gICAgICBjb25zdCBlID0gZXh0cmFFbnRyb3B5ID09PSB0cnVlID8gcmFuZG9tQnl0ZXMobGVuZ3Rocy5zZWNyZXRLZXkpIDogZXh0cmFFbnRyb3B5O1xuICAgICAgc2VlZEFyZ3MucHVzaChhYnl0ZXMoZSwgdW5kZWZpbmVkLCAnZXh0cmFFbnRyb3B5JykpOyAvLyBjaGVjayBmb3IgYmVpbmcgYnl0ZXNcbiAgICB9XG4gICAgY29uc3Qgc2VlZCA9IGNvbmNhdEJ5dGVzKC4uLnNlZWRBcmdzKTsgLy8gU3RlcCBEIG9mIFJGQzY5NzkgMy4yXG4gICAgY29uc3QgbSA9IGgxaW50OyAvLyBubyBuZWVkIHRvIGNhbGwgYml0czJpbnQgc2Vjb25kIHRpbWUgaGVyZSwgaXQgaXMgaW5zaWRlIHRydW5jYXRlSGFzaCFcbiAgICAvLyBDb252ZXJ0cyBzaWduYXR1cmUgcGFyYW1zIGludG8gcG9pbnQgdyByL3MsIGNoZWNrcyByZXN1bHQgZm9yIHZhbGlkaXR5LlxuICAgIC8vIFRvIHRyYW5zZm9ybSBrID0+IFNpZ25hdHVyZTpcbiAgICAvLyBxID0ga1x1MjJDNUdcbiAgICAvLyByID0gcS54IG1vZCBuXG4gICAgLy8gcyA9IGteLTEobSArIHJkKSBtb2QgblxuICAgIC8vIENhbiB1c2Ugc2NhbGFyIGJsaW5kaW5nIGJeLTEoYm0gKyBiZHIpIHdoZXJlIGIgXHUyMjA4IFsxLHFcdTIyMTIxXSBhY2NvcmRpbmcgdG9cbiAgICAvLyBodHRwczovL3RjaGVzLmlhY3Iub3JnL2luZGV4LnBocC9UQ0hFUy9hcnRpY2xlL3ZpZXcvNzMzNy82NTA5LiBXZSd2ZSBkZWNpZGVkIGFnYWluc3QgaXQ6XG4gICAgLy8gYSkgZGVwZW5kZW5jeSBvbiBDU1BSTkcgYikgMTUlIHNsb3dkb3duIGMpIGRvZXNuJ3QgcmVhbGx5IGhlbHAgc2luY2UgYmlnaW50cyBhcmUgbm90IENUXG4gICAgZnVuY3Rpb24gazJzaWcoa0J5dGVzOiBVaW50OEFycmF5KTogU2lnbmF0dXJlIHwgdW5kZWZpbmVkIHtcbiAgICAgIC8vIFJGQyA2OTc5IFNlY3Rpb24gMy4yLCBzdGVwIDM6IGsgPSBiaXRzMmludChUKVxuICAgICAgLy8gSW1wb3J0YW50OiBhbGwgbW9kKCkgY2FsbHMgaGVyZSBtdXN0IGJlIGRvbmUgb3ZlciBOXG4gICAgICBjb25zdCBrID0gYml0czJpbnQoa0J5dGVzKTsgLy8gQ2Fubm90IHVzZSBmaWVsZHMgbWV0aG9kcywgc2luY2UgaXQgaXMgZ3JvdXAgZWxlbWVudFxuICAgICAgaWYgKCFGbi5pc1ZhbGlkTm90MChrKSkgcmV0dXJuOyAvLyBWYWxpZCBzY2FsYXJzIChpbmNsdWRpbmcgaykgbXVzdCBiZSBpbiAxLi5OLTFcbiAgICAgIGNvbnN0IGlrID0gRm4uaW52KGspOyAvLyBrXi0xIG1vZCBuXG4gICAgICBjb25zdCBxID0gUG9pbnQuQkFTRS5tdWx0aXBseShrKS50b0FmZmluZSgpOyAvLyBxID0ga1x1MjJDNUdcbiAgICAgIGNvbnN0IHIgPSBGbi5jcmVhdGUocS54KTsgLy8gciA9IHEueCBtb2QgblxuICAgICAgaWYgKHIgPT09IF8wbikgcmV0dXJuO1xuICAgICAgY29uc3QgcyA9IEZuLmNyZWF0ZShpayAqIEZuLmNyZWF0ZShtICsgciAqIGQpKTsgLy8gcyA9IGteLTEobSArIHJkKSBtb2QgblxuICAgICAgaWYgKHMgPT09IF8wbikgcmV0dXJuO1xuICAgICAgbGV0IHJlY292ZXJ5ID0gKHEueCA9PT0gciA/IDAgOiAyKSB8IE51bWJlcihxLnkgJiBfMW4pOyAvLyByZWNvdmVyeSBiaXQgKDIgb3IgMyB3aGVuIHEueD5uKVxuICAgICAgbGV0IG5vcm1TID0gcztcbiAgICAgIGlmIChsb3dTICYmIGlzQmlnZ2VyVGhhbkhhbGZPcmRlcihzKSkge1xuICAgICAgICBub3JtUyA9IEZuLm5lZyhzKTsgLy8gaWYgbG93UyB3YXMgcGFzc2VkLCBlbnN1cmUgcyBpcyBhbHdheXMgaW4gdGhlIGJvdHRvbSBoYWxmIG9mIE5cbiAgICAgICAgcmVjb3ZlcnkgXj0gMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgU2lnbmF0dXJlKHIsIG5vcm1TLCBoYXNMYXJnZUNvZmFjdG9yID8gdW5kZWZpbmVkIDogcmVjb3ZlcnkpO1xuICAgIH1cbiAgICByZXR1cm4geyBzZWVkLCBrMnNpZyB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFNpZ25zIG1lc3NhZ2UgaGFzaCB3aXRoIGEgc2VjcmV0IGtleS5cbiAgICpcbiAgICogYGBgXG4gICAqIHNpZ24obSwgZCkgd2hlcmVcbiAgICogICBrID0gcmZjNjk3OV9obWFjX2RyYmcobSwgZClcbiAgICogICAoeCwgeSkgPSBHIFx1MDBENyBrXG4gICAqICAgciA9IHggbW9kIG5cbiAgICogICBzID0gKG0gKyBkcikgLyBrIG1vZCBuXG4gICAqIGBgYFxuICAgKi9cbiAgZnVuY3Rpb24gc2lnbihtZXNzYWdlOiBVaW50OEFycmF5LCBzZWNyZXRLZXk6IFVpbnQ4QXJyYXksIG9wdHM6IEVDRFNBU2lnbk9wdHMgPSB7fSk6IFVpbnQ4QXJyYXkge1xuICAgIGNvbnN0IHsgc2VlZCwgazJzaWcgfSA9IHByZXBTaWcobWVzc2FnZSwgc2VjcmV0S2V5LCBvcHRzKTsgLy8gU3RlcHMgQSwgRCBvZiBSRkM2OTc5IDMuMi5cbiAgICBjb25zdCBkcmJnID0gY3JlYXRlSG1hY0RyYmc8U2lnbmF0dXJlPihoYXNoLm91dHB1dExlbiwgRm4uQllURVMsIGhtYWMpO1xuICAgIGNvbnN0IHNpZyA9IGRyYmcoc2VlZCwgazJzaWcpOyAvLyBTdGVwcyBCLCBDLCBELCBFLCBGLCBHXG4gICAgcmV0dXJuIHNpZy50b0J5dGVzKG9wdHMuZm9ybWF0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyBhIHNpZ25hdHVyZSBhZ2FpbnN0IG1lc3NhZ2UgYW5kIHB1YmxpYyBrZXkuXG4gICAqIFJlamVjdHMgbG93UyBzaWduYXR1cmVzIGJ5IGRlZmF1bHQ6IHNlZSB7QGxpbmsgRUNEU0FWZXJpZnlPcHRzfS5cbiAgICogSW1wbGVtZW50cyBzZWN0aW9uIDQuMS40IGZyb20gaHR0cHM6Ly93d3cuc2VjZy5vcmcvc2VjMS12Mi5wZGY6XG4gICAqXG4gICAqIGBgYFxuICAgKiB2ZXJpZnkociwgcywgaCwgUCkgd2hlcmVcbiAgICogICB1MSA9IGhzXi0xIG1vZCBuXG4gICAqICAgdTIgPSByc14tMSBtb2QgblxuICAgKiAgIFIgPSB1MVx1MjJDNUcgKyB1Mlx1MjJDNVBcbiAgICogICBtb2QoUi54LCBuKSA9PSByXG4gICAqIGBgYFxuICAgKi9cbiAgZnVuY3Rpb24gdmVyaWZ5KFxuICAgIHNpZ25hdHVyZTogVWludDhBcnJheSxcbiAgICBtZXNzYWdlOiBVaW50OEFycmF5LFxuICAgIHB1YmxpY0tleTogVWludDhBcnJheSxcbiAgICBvcHRzOiBFQ0RTQVZlcmlmeU9wdHMgPSB7fVxuICApOiBib29sZWFuIHtcbiAgICBjb25zdCB7IGxvd1MsIHByZWhhc2gsIGZvcm1hdCB9ID0gdmFsaWRhdGVTaWdPcHRzKG9wdHMsIGRlZmF1bHRTaWdPcHRzKTtcbiAgICBwdWJsaWNLZXkgPSBhYnl0ZXMocHVibGljS2V5LCB1bmRlZmluZWQsICdwdWJsaWNLZXknKTtcbiAgICBtZXNzYWdlID0gdmFsaWRhdGVNc2dBbmRIYXNoKG1lc3NhZ2UsIHByZWhhc2gpO1xuICAgIGlmICghaXNCeXRlcyhzaWduYXR1cmUgYXMgYW55KSkge1xuICAgICAgY29uc3QgZW5kID0gc2lnbmF0dXJlIGluc3RhbmNlb2YgU2lnbmF0dXJlID8gJywgdXNlIHNpZy50b0J5dGVzKCknIDogJyc7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3ZlcmlmeSBleHBlY3RzIFVpbnQ4QXJyYXkgc2lnbmF0dXJlJyArIGVuZCk7XG4gICAgfVxuICAgIHZhbGlkYXRlU2lnTGVuZ3RoKHNpZ25hdHVyZSwgZm9ybWF0KTsgLy8gZXhlY3V0ZSB0aGlzIHR3aWNlIGJlY2F1c2Ugd2Ugd2FudCBsb3VkIGVycm9yXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNpZyA9IFNpZ25hdHVyZS5mcm9tQnl0ZXMoc2lnbmF0dXJlLCBmb3JtYXQpO1xuICAgICAgY29uc3QgUCA9IFBvaW50LmZyb21CeXRlcyhwdWJsaWNLZXkpO1xuICAgICAgaWYgKGxvd1MgJiYgc2lnLmhhc0hpZ2hTKCkpIHJldHVybiBmYWxzZTtcbiAgICAgIGNvbnN0IHsgciwgcyB9ID0gc2lnO1xuICAgICAgY29uc3QgaCA9IGJpdHMyaW50X21vZE4obWVzc2FnZSk7IC8vIG1vZCBuLCBub3QgbW9kIHBcbiAgICAgIGNvbnN0IGlzID0gRm4uaW52KHMpOyAvLyBzXi0xIG1vZCBuXG4gICAgICBjb25zdCB1MSA9IEZuLmNyZWF0ZShoICogaXMpOyAvLyB1MSA9IGhzXi0xIG1vZCBuXG4gICAgICBjb25zdCB1MiA9IEZuLmNyZWF0ZShyICogaXMpOyAvLyB1MiA9IHJzXi0xIG1vZCBuXG4gICAgICBjb25zdCBSID0gUG9pbnQuQkFTRS5tdWx0aXBseVVuc2FmZSh1MSkuYWRkKFAubXVsdGlwbHlVbnNhZmUodTIpKTsgLy8gdTFcdTIyQzVHICsgdTJcdTIyQzVQXG4gICAgICBpZiAoUi5pczAoKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgY29uc3QgdiA9IEZuLmNyZWF0ZShSLngpOyAvLyB2ID0gci54IG1vZCBuXG4gICAgICByZXR1cm4gdiA9PT0gcjtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVjb3ZlclB1YmxpY0tleShcbiAgICBzaWduYXR1cmU6IFVpbnQ4QXJyYXksXG4gICAgbWVzc2FnZTogVWludDhBcnJheSxcbiAgICBvcHRzOiBFQ0RTQVJlY292ZXJPcHRzID0ge31cbiAgKTogVWludDhBcnJheSB7XG4gICAgY29uc3QgeyBwcmVoYXNoIH0gPSB2YWxpZGF0ZVNpZ09wdHMob3B0cywgZGVmYXVsdFNpZ09wdHMpO1xuICAgIG1lc3NhZ2UgPSB2YWxpZGF0ZU1zZ0FuZEhhc2gobWVzc2FnZSwgcHJlaGFzaCk7XG4gICAgcmV0dXJuIFNpZ25hdHVyZS5mcm9tQnl0ZXMoc2lnbmF0dXJlLCAncmVjb3ZlcmVkJykucmVjb3ZlclB1YmxpY0tleShtZXNzYWdlKS50b0J5dGVzKCk7XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmZyZWV6ZSh7XG4gICAga2V5Z2VuLFxuICAgIGdldFB1YmxpY0tleSxcbiAgICBnZXRTaGFyZWRTZWNyZXQsXG4gICAgdXRpbHMsXG4gICAgbGVuZ3RocyxcbiAgICBQb2ludCxcbiAgICBzaWduLFxuICAgIHZlcmlmeSxcbiAgICByZWNvdmVyUHVibGljS2V5LFxuICAgIFNpZ25hdHVyZSxcbiAgICBoYXNoLFxuICB9KSBzYXRpc2ZpZXMgU2lnbmVyO1xufVxuIiwgIi8qKlxuICogQG1vZHVsZSBsb2dnZXJcbiAqIEBkZXNjcmlwdGlvbiBMb2dnZXIgdXRpbGl0eSBmb3IgdGhlIGFwcGxpY2F0aW9uXG4gKi9cblxuZW51bSBMb2dMZXZlbCB7XG4gIERFQlVHLFxuICBJTkZPLFxuICBXQVJOLFxuICBFUlJPUlxufVxuXG5pbXBvcnQgcGlubyBmcm9tICdwaW5vJztcblxuLyoqXG4gKiBDcmVhdGUgYSBsb2dnZXIgaW5zdGFuY2Ugd2l0aCBjb25zaXN0ZW50IGNvbmZpZ3VyYXRpb25cbiAqIEBwYXJhbSBuYW1lIC0gQ29tcG9uZW50IG9yIG1vZHVsZSBuYW1lIGZvciB0aGUgbG9nZ2VyXG4gKiBAcmV0dXJucyBDb25maWd1cmVkIHBpbm8gbG9nZ2VyIGluc3RhbmNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMb2dnZXIobmFtZTogc3RyaW5nKTogcGluby5Mb2dnZXIge1xuICByZXR1cm4gcGlubyh7XG4gICAgbmFtZSxcbiAgICBsZXZlbDogcHJvY2Vzcy5lbnYuTE9HX0xFVkVMIHx8ICdpbmZvJyxcbiAgICB0cmFuc3BvcnQ6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnID8ge1xuICAgICAgdGFyZ2V0OiAncGluby1wcmV0dHknLFxuICAgICAgb3B0aW9uczoge1xuICAgICAgICBjb2xvcml6ZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNsYXRlVGltZTogJ0hIOk1NOnNzJyxcbiAgICAgICAgaWdub3JlOiAncGlkLGhvc3RuYW1lJyxcbiAgICAgIH1cbiAgICB9IDogdW5kZWZpbmVkLFxuICAgIGZvcm1hdHRlcnM6IHtcbiAgICAgIGxldmVsOiAobGFiZWwpID0+IHtcbiAgICAgICAgcmV0dXJuIHsgbGV2ZWw6IGxhYmVsLnRvVXBwZXJDYXNlKCkgfTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFNpbXBsZSBsb2cgZnVuY3Rpb24gZm9yIGJhc2ljIGxvZ2dpbmcgbmVlZHNcbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBsb2dcbiAqIEBwYXJhbSBkYXRhIC0gT3B0aW9uYWwgZGF0YSB0byBpbmNsdWRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2cobWVzc2FnZTogc3RyaW5nLCBkYXRhPzogdW5rbm93bik6IHZvaWQge1xuICBjb25zb2xlLmxvZyhtZXNzYWdlLCBkYXRhKTtcbn1cblxuLyoqXG4gKiBEZWZhdWx0IGxvZ2dlciBpbnN0YW5jZSBmb3IgdGhlIGFwcGxpY2F0aW9uXG4gKiBJbmNsdWRlcyBlbmhhbmNlZCBlcnJvciBoYW5kbGluZyBhbmQgZm9ybWF0dGluZ1xuICovXG5leHBvcnQgY29uc3QgbG9nZ2VyOiBwaW5vLkxvZ2dlciA9IHBpbm8oe1xuICBuYW1lOiAnbm9zdHItY3J5cHRvLXV0aWxzJyxcbiAgbGV2ZWw6IHByb2Nlc3MuZW52LkxPR19MRVZFTCB8fCAnaW5mbycsXG4gIHRyYW5zcG9ydDogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcgPyB7XG4gICAgdGFyZ2V0OiAncGluby1wcmV0dHknLFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIGNvbG9yaXplOiB0cnVlLFxuICAgICAgdHJhbnNsYXRlVGltZTogJ0hIOk1NOnNzJyxcbiAgICAgIGlnbm9yZTogJ3BpZCxob3N0bmFtZScsXG4gICAgfVxuICB9IDogdW5kZWZpbmVkLFxuICBmb3JtYXR0ZXJzOiB7XG4gICAgbGV2ZWw6IChsYWJlbCkgPT4ge1xuICAgICAgcmV0dXJuIHsgbGV2ZWw6IGxhYmVsLnRvVXBwZXJDYXNlKCkgfTtcbiAgICB9LFxuICAgIGxvZzogKG9iajogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHtcbiAgICAgIC8vIENvbnZlcnQgZXJyb3Igb2JqZWN0cyB0byBzdHJpbmdzIGZvciBiZXR0ZXIgbG9nZ2luZ1xuICAgICAgaWYgKG9iaiAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiAnZXJyJyBpbiBvYmopIHtcbiAgICAgICAgY29uc3QgbmV3T2JqID0geyAuLi5vYmogfTtcbiAgICAgICAgaWYgKG5ld09iai5lcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgIGNvbnN0IGVyciA9IG5ld09iai5lcnIgYXMgRXJyb3I7XG4gICAgICAgICAgbmV3T2JqLmVyciA9IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgc3RhY2s6IGVyci5zdGFjayxcbiAgICAgICAgICAgIG5hbWU6IGVyci5uYW1lLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld09iajtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICB9XG59KTtcblxuZXhwb3J0IGNsYXNzIEN1c3RvbUxvZ2dlciB7XG4gIHByaXZhdGUgX2xldmVsOiBMb2dMZXZlbDtcblxuICBjb25zdHJ1Y3RvcihsZXZlbDogTG9nTGV2ZWwgPSBMb2dMZXZlbC5JTkZPKSB7XG4gICAgdGhpcy5fbGV2ZWwgPSBsZXZlbDtcbiAgfVxuXG4gIHNldExldmVsKGxldmVsOiBMb2dMZXZlbCk6IHZvaWQge1xuICAgIHRoaXMuX2xldmVsID0gbGV2ZWw7XG4gIH1cblxuICBwcml2YXRlIF9sb2cobGV2ZWw6IExvZ0xldmVsLCBtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQge1xuICAgIGlmIChsZXZlbCA+PSB0aGlzLl9sZXZlbCkge1xuICAgICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgY29uc3QgbGV2ZWxOYW1lID0gTG9nTGV2ZWxbbGV2ZWxdO1xuICAgICAgY29uc3QgY29udGV4dFN0ciA9IGNvbnRleHQgPyBgICR7SlNPTi5zdHJpbmdpZnkoY29udGV4dCl9YCA6ICcnO1xuICAgICAgY29uc29sZS5sb2coYFske3RpbWVzdGFtcH1dICR7bGV2ZWxOYW1lfTogJHttZXNzYWdlfSR7Y29udGV4dFN0cn1gKTtcbiAgICB9XG4gIH1cblxuICBkZWJ1ZyhtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQge1xuICAgIHRoaXMuX2xvZyhMb2dMZXZlbC5ERUJVRywgbWVzc2FnZSwgY29udGV4dCk7XG4gIH1cblxuICBpbmZvKG1lc3NhZ2U6IHN0cmluZywgY29udGV4dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZCB7XG4gICAgdGhpcy5fbG9nKExvZ0xldmVsLklORk8sIG1lc3NhZ2UsIGNvbnRleHQpO1xuICB9XG5cbiAgd2FybihtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQge1xuICAgIHRoaXMuX2xvZyhMb2dMZXZlbC5XQVJOLCBtZXNzYWdlLCBjb250ZXh0KTtcbiAgfVxuXG4gIGVycm9yKG1lc3NhZ2U6IHN0cmluZyB8IEVycm9yIHwgdW5rbm93biwgY29udGV4dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZCB7XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gbWVzc2FnZSBpbnN0YW5jZW9mIEVycm9yID8gbWVzc2FnZS5tZXNzYWdlIDogU3RyaW5nKG1lc3NhZ2UpO1xuICAgIHRoaXMuX2xvZyhMb2dMZXZlbC5FUlJPUiwgZXJyb3JNZXNzYWdlLCBjb250ZXh0KTtcbiAgfVxufVxuXG4vLyBSZS1leHBvcnQgdGhlIExvZ2dlciB0eXBlIGZvciB1c2UgaW4gb3RoZXIgZmlsZXNcbmV4cG9ydCB0eXBlIHsgTG9nZ2VyIH0gZnJvbSAncGlubyc7XG4iLCAiLyoqXG4gKiBCYXNlNjQgZW5jb2RpbmcgdXRpbGl0aWVzIGZvciBOb3N0clxuICogUHJvdmlkZXMgY29uc2lzdGVudCBiYXNlNjQgZW5jb2RpbmcvZGVjb2RpbmcgYWNyb3NzIGFsbCBOb3N0ci1yZWxhdGVkIHByb2plY3RzXG4gKiBVc2VzIGJyb3dzZXItY29tcGF0aWJsZSBBUElzIChubyBOb2RlLmpzIEJ1ZmZlciBkZXBlbmRlbmN5KVxuICovXG5cbi8qKlxuICogQ29udmVydCBzdHJpbmcgdG8gYmFzZTY0XG4gKiBAcGFyYW0gc3RyIFN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBCYXNlNjQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdUb0Jhc2U2NChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGJ5dGVzID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHN0cik7XG4gIHJldHVybiBieXRlc1RvQmFzZTY0KGJ5dGVzKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGJhc2U2NCB0byBzdHJpbmdcbiAqIEBwYXJhbSBiYXNlNjQgQmFzZTY0IHN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBVVEYtOCBzdHJpbmdcbiAqIEB0aHJvd3MgRXJyb3IgaWYgYmFzZTY0IHN0cmluZyBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb1N0cmluZyhiYXNlNjQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICghaXNWYWxpZEJhc2U2NChiYXNlNjQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJhc2U2NCBzdHJpbmcnKTtcbiAgfVxuICBjb25zdCBieXRlcyA9IGJhc2U2NFRvQnl0ZXMoYmFzZTY0KTtcbiAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShieXRlcyk7XG59XG5cbi8qKlxuICogQ29udmVydCBVaW50OEFycmF5IHRvIGJhc2U2NFxuICogQHBhcmFtIGJ1ZmZlciBVaW50OEFycmF5IHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIEJhc2U2NCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcjogVWludDhBcnJheSk6IHN0cmluZyB7XG4gIHJldHVybiBieXRlc1RvQmFzZTY0KGJ1ZmZlcik7XG59XG5cbi8qKlxuICogQ29udmVydCBiYXNlNjQgdG8gVWludDhBcnJheVxuICogQHBhcmFtIGJhc2U2NCBCYXNlNjQgc3RyaW5nIHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIFVpbnQ4QXJyYXlcbiAqIEB0aHJvd3MgRXJyb3IgaWYgYmFzZTY0IHN0cmluZyBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb0J1ZmZlcihiYXNlNjQ6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICBpZiAoIWlzVmFsaWRCYXNlNjQoYmFzZTY0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBiYXNlNjQgc3RyaW5nJyk7XG4gIH1cbiAgcmV0dXJuIGJhc2U2NFRvQnl0ZXMoYmFzZTY0KTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBzdHJpbmcgaXMgdmFsaWQgYmFzZTY0XG4gKiBAcGFyYW0gYmFzZTY0IFN0cmluZyB0byBjaGVja1xuICogQHJldHVybnMgVHJ1ZSBpZiB2YWxpZCBiYXNlNjRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRCYXNlNjQoYmFzZTY0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gQm9vbGVhbihiYXNlNjQubWF0Y2goL15bQS1aYS16MC05Ky9dKj17MCwyfSQvKSk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnQgYmFzZTY0IHRvIFVSTC1zYWZlIGJhc2U2NFxuICogQHBhcmFtIGJhc2U2NCBTdGFuZGFyZCBiYXNlNjQgc3RyaW5nXG4gKiBAcmV0dXJucyBVUkwtc2FmZSBiYXNlNjQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0Jhc2U2NFVybChiYXNlNjQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBiYXNlNjQucmVwbGFjZSgvXFwrL2csICctJykucmVwbGFjZSgvXFwvL2csICdfJykucmVwbGFjZSgvPSskLywgJycpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgVVJMLXNhZmUgYmFzZTY0IHRvIHN0YW5kYXJkIGJhc2U2NFxuICogQHBhcmFtIGJhc2U2NHVybCBVUkwtc2FmZSBiYXNlNjQgc3RyaW5nXG4gKiBAcmV0dXJucyBTdGFuZGFyZCBiYXNlNjQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tQmFzZTY0VXJsKGJhc2U2NHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgYmFzZTY0ID0gYmFzZTY0dXJsLnJlcGxhY2UoLy0vZywgJysnKS5yZXBsYWNlKC9fL2csICcvJyk7XG4gIGNvbnN0IHBhZGRpbmcgPSAnPScucmVwZWF0KCg0IC0gYmFzZTY0Lmxlbmd0aCAlIDQpICUgNCk7XG4gIHJldHVybiBiYXNlNjQgKyBwYWRkaW5nO1xufVxuXG4vKipcbiAqIENvbnZlcnQgaGV4IHN0cmluZyB0byBiYXNlNjRcbiAqIEBwYXJhbSBoZXggSGV4IHN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBCYXNlNjQgc3RyaW5nXG4gKiBAdGhyb3dzIEVycm9yIGlmIGhleCBzdHJpbmcgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gaGV4VG9CYXNlNjQoaGV4OiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIWhleC5tYXRjaCgvXlswLTlhLWZBLUZdKiQvKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBoZXggc3RyaW5nJyk7XG4gIH1cbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShoZXgubGVuZ3RoIC8gMik7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaGV4Lmxlbmd0aDsgaSArPSAyKSB7XG4gICAgYnl0ZXNbaSAvIDJdID0gcGFyc2VJbnQoaGV4LnN1YnN0cmluZyhpLCBpICsgMiksIDE2KTtcbiAgfVxuICByZXR1cm4gYnl0ZXNUb0Jhc2U2NChieXRlcyk7XG59XG5cbi8qKlxuICogQ29udmVydCBiYXNlNjQgdG8gaGV4IHN0cmluZ1xuICogQHBhcmFtIGJhc2U2NCBCYXNlNjQgc3RyaW5nIHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIEhleCBzdHJpbmdcbiAqIEB0aHJvd3MgRXJyb3IgaWYgYmFzZTY0IHN0cmluZyBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb0hleChiYXNlNjQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICghaXNWYWxpZEJhc2U2NChiYXNlNjQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJhc2U2NCBzdHJpbmcnKTtcbiAgfVxuICBjb25zdCBieXRlcyA9IGJhc2U2NFRvQnl0ZXMoYmFzZTY0KTtcbiAgcmV0dXJuIEFycmF5LmZyb20oYnl0ZXMpLm1hcChiID0+IGIudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpO1xufVxuXG4vKipcbiAqIENyZWF0ZSBiYXNlNjQgc3RyaW5nIGZyb20gYnl0ZSBhcnJheVxuICogQHBhcmFtIGJ5dGVzIEJ5dGUgYXJyYXlcbiAqIEByZXR1cm5zIEJhc2U2NCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVzVG9CYXNlNjQoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICBsZXQgYmluYXJ5ID0gJyc7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gIH1cbiAgcmV0dXJuIGJ0b2EoYmluYXJ5KTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGJhc2U2NCB0byBieXRlIGFycmF5XG4gKiBAcGFyYW0gYmFzZTY0IEJhc2U2NCBzdHJpbmdcbiAqIEByZXR1cm5zIEJ5dGUgYXJyYXlcbiAqIEB0aHJvd3MgRXJyb3IgaWYgYmFzZTY0IHN0cmluZyBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb0J5dGVzKGJhc2U2NDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIGlmICghaXNWYWxpZEJhc2U2NChiYXNlNjQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJhc2U2NCBzdHJpbmcnKTtcbiAgfVxuICBjb25zdCBiaW5hcnkgPSBhdG9iKGJhc2U2NCk7XG4gIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYmluYXJ5Lmxlbmd0aDsgaSsrKSB7XG4gICAgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgfVxuICByZXR1cm4gYnl0ZXM7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlIHBhZGRlZCBsZW5ndGggZm9yIGJhc2U2NCBzdHJpbmdcbiAqIEBwYXJhbSBkYXRhTGVuZ3RoIExlbmd0aCBvZiByYXcgZGF0YVxuICogQHJldHVybnMgTGVuZ3RoIG9mIHBhZGRlZCBiYXNlNjQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVCYXNlNjRMZW5ndGgoZGF0YUxlbmd0aDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIE1hdGguY2VpbChkYXRhTGVuZ3RoIC8gMykgKiA0O1xufVxuXG4vKipcbiAqIFJlbW92ZSBiYXNlNjQgcGFkZGluZ1xuICogQHBhcmFtIGJhc2U2NCBCYXNlNjQgc3RyaW5nXG4gKiBAcmV0dXJucyBCYXNlNjQgc3RyaW5nIHdpdGhvdXQgcGFkZGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlQmFzZTY0UGFkZGluZyhiYXNlNjQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBiYXNlNjQucmVwbGFjZSgvPSskLywgJycpO1xufVxuXG4vKipcbiAqIEFkZCBiYXNlNjQgcGFkZGluZ1xuICogQHBhcmFtIGJhc2U2NCBCYXNlNjQgc3RyaW5nIHdpdGhvdXQgcGFkZGluZ1xuICogQHJldHVybnMgUHJvcGVybHkgcGFkZGVkIGJhc2U2NCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZEJhc2U2NFBhZGRpbmcoYmFzZTY0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBwYWRkaW5nID0gJz0nLnJlcGVhdCgoNCAtIGJhc2U2NC5sZW5ndGggJSA0KSAlIDQpO1xuICByZXR1cm4gYmFzZTY0ICsgcGFkZGluZztcbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgdmFsaWRhdGlvblxuICogQGRlc2NyaXB0aW9uIFZhbGlkYXRpb24gdXRpbGl0aWVzIGZvciBOb3N0ciBldmVudHMsIG1lc3NhZ2VzLCBhbmQgcmVsYXRlZCBkYXRhIHN0cnVjdHVyZXMuXG4gKiBQcm92aWRlcyBmdW5jdGlvbnMgdG8gdmFsaWRhdGUgZXZlbnRzLCBzaWduYXR1cmVzLCBmaWx0ZXJzLCBhbmQgc3Vic2NyaXB0aW9ucyBhY2NvcmRpbmcgdG8gdGhlIE5vc3RyIHByb3RvY29sLlxuICovXG5cbmltcG9ydCB7IFxuICBOb3N0ckV2ZW50LCBcbiAgU2lnbmVkTm9zdHJFdmVudCwgXG4gIE5vc3RyRmlsdGVyLCBcbiAgTm9zdHJTdWJzY3JpcHRpb24sIFxuICBWYWxpZGF0aW9uUmVzdWx0LCBcbiAgUHVibGljS2V5LFxuICBOb3N0ck1lc3NhZ2VUeXBlXG59IGZyb20gJy4uL3R5cGVzL2luZGV4JztcblxuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcblxuaW1wb3J0IHsgc2hhMjU2IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGEyLmpzJztcbmltcG9ydCB7IGJ5dGVzVG9IZXggfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IHNjaG5vcnIgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG5cbi8qKlxuICogR2V0cyB0aGUgaGV4IHN0cmluZyBmcm9tIGEgUHVibGljS2V5IG9yIHN0cmluZ1xuICovXG5mdW5jdGlvbiBnZXRQdWJsaWNLZXlIZXgocHVia2V5OiBQdWJsaWNLZXkgfCBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdHlwZW9mIHB1YmtleSA9PT0gJ3N0cmluZycgPyBwdWJrZXkgOiBwdWJrZXkuaGV4O1xufVxuXG5mdW5jdGlvbiBoZXhUb0J5dGVzKGhleDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIHJldHVybiBuZXcgVWludDhBcnJheShoZXgubWF0Y2goLy57MSwyfS9nKSEubWFwKGJ5dGUgPT4gcGFyc2VJbnQoYnl0ZSwgMTYpKSk7XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgTm9zdHIgZXZlbnQgSUQgYnkgY2hlY2tpbmcgaWYgaXQgbWF0Y2hlcyB0aGUgU0hBLTI1NiBoYXNoIG9mIHRoZSBjYW5vbmljYWwgZXZlbnQgc2VyaWFsaXphdGlvbi5cbiAqIFxuICogQHBhcmFtIHtTaWduZWROb3N0ckV2ZW50fSBldmVudCAtIFRoZSBldmVudCB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge1ZhbGlkYXRpb25SZXN1bHR9IE9iamVjdCBjb250YWluaW5nIHZhbGlkYXRpb24gcmVzdWx0IGFuZCBhbnkgZXJyb3IgbWVzc2FnZVxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IHJlc3VsdCA9IHZhbGlkYXRlRXZlbnRJZChldmVudCk7XG4gKiBpZiAoIXJlc3VsdC5pc1ZhbGlkKSB7XG4gKiAgIGNvbnNvbGUuZXJyb3IocmVzdWx0LmVycm9yKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVFdmVudElkKGV2ZW50OiBTaWduZWROb3N0ckV2ZW50KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2VyaWFsaXplZCA9IEpTT04uc3RyaW5naWZ5KFtcbiAgICAgIDAsXG4gICAgICBnZXRQdWJsaWNLZXlIZXgoZXZlbnQucHVia2V5KSxcbiAgICAgIGV2ZW50LmNyZWF0ZWRfYXQsXG4gICAgICBldmVudC5raW5kLFxuICAgICAgZXZlbnQudGFncyxcbiAgICAgIGV2ZW50LmNvbnRlbnRcbiAgICBdKTtcbiAgICBjb25zdCBoYXNoID0gYnl0ZXNUb0hleChzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlcmlhbGl6ZWQpKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IGhhc2ggPT09IGV2ZW50LmlkLFxuICAgICAgZXJyb3I6IGhhc2ggPT09IGV2ZW50LmlkID8gdW5kZWZpbmVkIDogJ0ludmFsaWQgZXZlbnQgSUQnXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZhbGlkYXRlIGV2ZW50IElEJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gdmFsaWRhdGUgZXZlbnQgSUQnXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIE5vc3RyIGV2ZW50IHNpZ25hdHVyZSB1c2luZyBTY2hub3JyIHNpZ25hdHVyZSB2ZXJpZmljYXRpb24uXG4gKiBcbiAqIEBwYXJhbSB7U2lnbmVkTm9zdHJFdmVudH0gZXZlbnQgLSBUaGUgZXZlbnQgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtWYWxpZGF0aW9uUmVzdWx0fSBPYmplY3QgY29udGFpbmluZyB2YWxpZGF0aW9uIHJlc3VsdCBhbmQgYW55IGVycm9yIG1lc3NhZ2VcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCByZXN1bHQgPSB2YWxpZGF0ZUV2ZW50U2lnbmF0dXJlKGV2ZW50KTtcbiAqIGlmICghcmVzdWx0LmlzVmFsaWQpIHtcbiAqICAgY29uc29sZS5lcnJvcihyZXN1bHQuZXJyb3IpO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUV2ZW50U2lnbmF0dXJlKGV2ZW50OiBTaWduZWROb3N0ckV2ZW50KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gIHRyeSB7XG4gICAgLy8gVmVyaWZ5IHRoZSBzaWduYXR1cmVcbiAgICBjb25zdCBzZXJpYWxpemVkID0gSlNPTi5zdHJpbmdpZnkoW1xuICAgICAgMCxcbiAgICAgIGdldFB1YmxpY0tleUhleChldmVudC5wdWJrZXkpLFxuICAgICAgZXZlbnQuY3JlYXRlZF9hdCxcbiAgICAgIGV2ZW50LmtpbmQsXG4gICAgICBldmVudC50YWdzLFxuICAgICAgZXZlbnQuY29udGVudFxuICAgIF0pO1xuICAgIGNvbnN0IGhhc2ggPSBzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlcmlhbGl6ZWQpKTtcbiAgICBjb25zdCBwdWJrZXlIZXggPSBnZXRQdWJsaWNLZXlIZXgoZXZlbnQucHVia2V5KTtcbiAgICBjb25zdCBwdWJrZXlCeXRlcyA9IGhleFRvQnl0ZXMocHVia2V5SGV4KTtcbiAgICBjb25zdCBpc1ZhbGlkID0gc2Nobm9yci52ZXJpZnkoaGV4VG9CeXRlcyhldmVudC5zaWcpLCBoYXNoLCBwdWJrZXlCeXRlcyk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQsXG4gICAgICBlcnJvcjogaXNWYWxpZCA/IHVuZGVmaW5lZCA6ICdJbnZhbGlkIHNpZ25hdHVyZSdcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gdmFsaWRhdGUgZXZlbnQgc2lnbmF0dXJlJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gdmFsaWRhdGUgZXZlbnQgc2lnbmF0dXJlJ1xuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBjb21wbGV0ZSBOb3N0ciBldmVudCBieSBjaGVja2luZyBpdHMgc3RydWN0dXJlLCB0aW1lc3RhbXBzLCBJRCwgYW5kIHNpZ25hdHVyZS5cbiAqIFxuICogQHBhcmFtIHtTaWduZWROb3N0ckV2ZW50fSBldmVudCAtIFRoZSBldmVudCB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge1ZhbGlkYXRpb25SZXN1bHR9IE9iamVjdCBjb250YWluaW5nIHZhbGlkYXRpb24gcmVzdWx0IGFuZCBhbnkgZXJyb3IgbWVzc2FnZVxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IHJlc3VsdCA9IHZhbGlkYXRlRXZlbnQoZXZlbnQpO1xuICogaWYgKCFyZXN1bHQuaXNWYWxpZCkge1xuICogICBjb25zb2xlLmVycm9yKHJlc3VsdC5lcnJvcik7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRXZlbnQoZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgLy8gRmlyc3QgdmFsaWRhdGUgdGhlIGV2ZW50IHN0cnVjdHVyZVxuICBjb25zdCBiYXNlVmFsaWRhdGlvbiA9IHZhbGlkYXRlRXZlbnRCYXNlKGV2ZW50KTtcbiAgaWYgKCFiYXNlVmFsaWRhdGlvbi5pc1ZhbGlkKSB7XG4gICAgcmV0dXJuIGJhc2VWYWxpZGF0aW9uO1xuICB9XG5cbiAgLy8gVGhlbiB2YWxpZGF0ZSB0aGUgZXZlbnQgSURcbiAgY29uc3QgaWRWYWxpZGF0aW9uID0gdmFsaWRhdGVFdmVudElkKGV2ZW50KTtcbiAgaWYgKCFpZFZhbGlkYXRpb24uaXNWYWxpZCkge1xuICAgIHJldHVybiBpZFZhbGlkYXRpb247XG4gIH1cblxuICAvLyBGaW5hbGx5IHZhbGlkYXRlIHRoZSBzaWduYXR1cmVcbiAgcmV0dXJuIHZhbGlkYXRlRXZlbnRTaWduYXR1cmUoZXZlbnQpO1xufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIHNpZ25lZCBOb3N0ciBldmVudCBieSBjaGVja2luZyBpdHMgc3RydWN0dXJlIGFuZCBzaWduYXR1cmUgZm9ybWF0LlxuICogXG4gKiBAcGFyYW0ge1NpZ25lZE5vc3RyRXZlbnR9IGV2ZW50IC0gVGhlIGV2ZW50IHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyB7VmFsaWRhdGlvblJlc3VsdH0gT2JqZWN0IGNvbnRhaW5pbmcgdmFsaWRhdGlvbiByZXN1bHQgYW5kIGFueSBlcnJvciBtZXNzYWdlXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgcmVzdWx0ID0gdmFsaWRhdGVTaWduZWRFdmVudChldmVudCk7XG4gKiBpZiAoIXJlc3VsdC5pc1ZhbGlkKSB7XG4gKiAgIGNvbnNvbGUuZXJyb3IocmVzdWx0LmVycm9yKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTaWduZWRFdmVudChldmVudDogU2lnbmVkTm9zdHJFdmVudCk6IFZhbGlkYXRpb25SZXN1bHQge1xuICB0cnkge1xuICAgIC8vIENoZWNrIGJhc2ljIGV2ZW50IHN0cnVjdHVyZVxuICAgIGNvbnN0IGJhc2VWYWxpZGF0aW9uID0gdmFsaWRhdGVFdmVudEJhc2UoZXZlbnQpO1xuICAgIGlmICghYmFzZVZhbGlkYXRpb24uaXNWYWxpZCkge1xuICAgICAgcmV0dXJuIGJhc2VWYWxpZGF0aW9uO1xuICAgIH1cblxuICAgIC8vIEdldCBwdWJrZXkgaGV4XG4gICAgY29uc3QgcHVia2V5SGV4ID0gZ2V0UHVibGljS2V5SGV4KGV2ZW50LnB1YmtleSk7XG5cbiAgICAvLyBWYWxpZGF0ZSBwdWJrZXkgZm9ybWF0XG4gICAgaWYgKCFwdWJrZXlIZXggfHwgdHlwZW9mIHB1YmtleUhleCAhPT0gJ3N0cmluZycgfHwgcHVia2V5SGV4Lmxlbmd0aCAhPT0gNjQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ0ludmFsaWQgcHVibGljIGtleSBmb3JtYXQnXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIHNpZ25hdHVyZSBmb3JtYXRcbiAgICBpZiAoIWV2ZW50LnNpZyB8fCB0eXBlb2YgZXZlbnQuc2lnICE9PSAnc3RyaW5nJyB8fCBldmVudC5zaWcubGVuZ3RoICE9PSAxMjgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ0ludmFsaWQgc2lnbmF0dXJlIGZvcm1hdCdcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgSUQgZm9ybWF0XG4gICAgaWYgKCFldmVudC5pZCB8fCB0eXBlb2YgZXZlbnQuaWQgIT09ICdzdHJpbmcnIHx8IGV2ZW50LmlkLmxlbmd0aCAhPT0gNjQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ0ludmFsaWQgZXZlbnQgSUQgZm9ybWF0J1xuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2YWxpZGF0ZSBzaWduZWQgZXZlbnQnKTtcbiAgICByZXR1cm4ge1xuICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICBlcnJvcjogJ0ZhaWxlZCB0byB2YWxpZGF0ZSBzaWduZWQgZXZlbnQnXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIE5vc3RyIGV2ZW50IGJ5IGNoZWNraW5nIGl0cyBzdHJ1Y3R1cmUgYW5kIGZpZWxkcy5cbiAqIEBwYXJhbSBldmVudCAtIFRoZSBldmVudCB0byB2YWxpZGF0ZVxuICogQHJldHVybnMgVmFsaWRhdGlvbiByZXN1bHQgYW5kIGFueSBlcnJvciBtZXNzYWdlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUV2ZW50QmFzZShldmVudDogTm9zdHJFdmVudCB8IFNpZ25lZE5vc3RyRXZlbnQpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgLy8gQ2hlY2sgcmVxdWlyZWQgZmllbGRzXG4gIGlmICghZXZlbnQgfHwgdHlwZW9mIGV2ZW50ICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgZXZlbnQgc3RydWN0dXJlJyB9O1xuICB9XG5cbiAgLy8gVmFsaWRhdGUga2luZFxuICBpZiAodHlwZW9mIGV2ZW50LmtpbmQgIT09ICdudW1iZXInIHx8IGV2ZW50LmtpbmQgPCAwKSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRXZlbnQga2luZCBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXInIH07XG4gIH1cblxuICAvLyBWYWxpZGF0ZSB0aW1lc3RhbXBcbiAgY29uc3Qgbm93ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gIGlmICh0eXBlb2YgZXZlbnQuY3JlYXRlZF9hdCAhPT0gJ251bWJlcicgfHwgZXZlbnQuY3JlYXRlZF9hdCA+IG5vdyArIDYwKSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRXZlbnQgdGltZXN0YW1wIGNhbm5vdCBiZSBpbiB0aGUgZnV0dXJlJyB9O1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgY29udGVudFxuICBpZiAodHlwZW9mIGV2ZW50LmNvbnRlbnQgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRXZlbnQgY29udGVudCBtdXN0IGJlIGEgc3RyaW5nJyB9O1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgcHVia2V5IGZvcm1hdFxuICBpZiAoIWV2ZW50LnB1YmtleSkge1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01pc3NpbmcgcHVibGljIGtleScgfTtcbiAgfVxuXG4gIC8vIEdldCBwdWJrZXkgaGV4XG4gIGNvbnN0IHB1YmtleUhleCA9IGdldFB1YmxpY0tleUhleChldmVudC5wdWJrZXkpO1xuICBpZiAodHlwZW9mIHB1YmtleUhleCAhPT0gJ3N0cmluZycgfHwgIS9eWzAtOWEtZl17NjR9JC8udGVzdChwdWJrZXlIZXgpKSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwdWJsaWMga2V5IGZvcm1hdCcgfTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIHRhZ3NcbiAgaWYgKCFBcnJheS5pc0FycmF5KGV2ZW50LnRhZ3MpKSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRXZlbnQgdGFncyBtdXN0IGJlIGFuIGFycmF5JyB9O1xuICB9XG5cbiAgZm9yIChjb25zdCB0YWcgb2YgZXZlbnQudGFncykge1xuICAgIGlmICghQXJyYXkuaXNBcnJheSh0YWcpKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdFYWNoIHRhZyBtdXN0IGJlIGFuIGFycmF5JyB9O1xuICAgIH1cbiAgICBpZiAodGFnLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRW1wdHkgdGFncyBhcmUgbm90IGFsbG93ZWQnIH07XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGFnWzBdICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnVGFnIGlkZW50aWZpZXIgbXVzdCBiZSBhIHN0cmluZycgfTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgTm9zdHIgZmlsdGVyIGJ5IGNoZWNraW5nIGl0cyBzdHJ1Y3R1cmUgYW5kIGZpZWxkcy5cbiAqIFxuICogQHBhcmFtIHtOb3N0ckZpbHRlcn0gZmlsdGVyIC0gVGhlIGZpbHRlciB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge1ZhbGlkYXRpb25SZXN1bHR9IE9iamVjdCBjb250YWluaW5nIHZhbGlkYXRpb24gcmVzdWx0IGFuZCBhbnkgZXJyb3IgbWVzc2FnZVxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IHJlc3VsdCA9IHZhbGlkYXRlRmlsdGVyKGZpbHRlcik7XG4gKiBpZiAoIXJlc3VsdC5pc1ZhbGlkKSB7XG4gKiAgIGNvbnNvbGUuZXJyb3IocmVzdWx0LmVycm9yKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVGaWx0ZXIoZmlsdGVyOiBOb3N0ckZpbHRlcik6IFZhbGlkYXRpb25SZXN1bHQge1xuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIGZpbHRlciBzdHJ1Y3R1cmVcbiAgICBpZiAoIWZpbHRlciB8fCB0eXBlb2YgZmlsdGVyICE9PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBmaWx0ZXIgc3RydWN0dXJlJyB9O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGlkcyBhcnJheSBpZiBwcmVzZW50XG4gICAgaWYgKGZpbHRlci5pZHMgJiYgKCFBcnJheS5pc0FycmF5KGZpbHRlci5pZHMpIHx8ICFmaWx0ZXIuaWRzLmV2ZXJ5KGlkID0+IHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpKSkge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmlsdGVyIGlkcyBtdXN0IGJlIGFuIGFycmF5IG9mIHN0cmluZ3MnIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgYXV0aG9ycyBhcnJheSBpZiBwcmVzZW50XG4gICAgaWYgKGZpbHRlci5hdXRob3JzICYmICghQXJyYXkuaXNBcnJheShmaWx0ZXIuYXV0aG9ycykgfHwgIWZpbHRlci5hdXRob3JzLmV2ZXJ5KGF1dGhvciA9PiB0eXBlb2YgYXV0aG9yID09PSAnc3RyaW5nJykpKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGaWx0ZXIgYXV0aG9ycyBtdXN0IGJlIGFuIGFycmF5IG9mIHN0cmluZ3MnIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUga2luZHMgYXJyYXkgaWYgcHJlc2VudFxuICAgIGlmIChmaWx0ZXIua2luZHMpIHtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShmaWx0ZXIua2luZHMpKSB7XG4gICAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZpbHRlciBraW5kcyBtdXN0IGJlIGFuIGFycmF5IG9mIG51bWJlcnMnIH07XG4gICAgICB9XG4gICAgICBpZiAoIWZpbHRlci5raW5kcy5ldmVyeShraW5kID0+IHR5cGVvZiBraW5kID09PSAnbnVtYmVyJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKGtpbmQpICYmIGtpbmQgPj0gMCkpIHtcbiAgICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmlsdGVyIGtpbmRzIG11c3QgYmUgbm9uLW5lZ2F0aXZlIGludGVnZXJzJyB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIHRpbWVzdGFtcHNcbiAgICBpZiAoZmlsdGVyLnNpbmNlICYmIHR5cGVvZiBmaWx0ZXIuc2luY2UgIT09ICdudW1iZXInKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGaWx0ZXIgc2luY2UgbXVzdCBiZSBhIG51bWJlcicgfTtcbiAgICB9XG4gICAgaWYgKGZpbHRlci51bnRpbCAmJiB0eXBlb2YgZmlsdGVyLnVudGlsICE9PSAnbnVtYmVyJykge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmlsdGVyIHVudGlsIG11c3QgYmUgYSBudW1iZXInIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgbGltaXRcbiAgICBpZiAoZmlsdGVyLmxpbWl0ICYmIHR5cGVvZiBmaWx0ZXIubGltaXQgIT09ICdudW1iZXInKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGaWx0ZXIgbGltaXQgbXVzdCBiZSBhIG51bWJlcicgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBzZWFyY2hcbiAgICBpZiAoZmlsdGVyLnNlYXJjaCAmJiB0eXBlb2YgZmlsdGVyLnNlYXJjaCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZpbHRlciBzZWFyY2ggbXVzdCBiZSBhIHN0cmluZycgfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2YWxpZGF0ZSBmaWx0ZXInKTtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGYWlsZWQgdG8gdmFsaWRhdGUgZmlsdGVyJyB9O1xuICB9XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgTm9zdHIgc3Vic2NyaXB0aW9uIGJ5IGNoZWNraW5nIGl0cyBzdHJ1Y3R1cmUgYW5kIGZpbHRlcnMuXG4gKiBcbiAqIEBwYXJhbSB7Tm9zdHJTdWJzY3JpcHRpb259IHN1YnNjcmlwdGlvbiAtIFRoZSBzdWJzY3JpcHRpb24gdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtWYWxpZGF0aW9uUmVzdWx0fSBPYmplY3QgY29udGFpbmluZyB2YWxpZGF0aW9uIHJlc3VsdCBhbmQgYW55IGVycm9yIG1lc3NhZ2VcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCByZXN1bHQgPSB2YWxpZGF0ZVN1YnNjcmlwdGlvbihzdWJzY3JpcHRpb24pO1xuICogaWYgKCFyZXN1bHQuaXNWYWxpZCkge1xuICogICBjb25zb2xlLmVycm9yKHJlc3VsdC5lcnJvcik7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbjogTm9zdHJTdWJzY3JpcHRpb24pOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBzdWJzY3JpcHRpb24gc3RydWN0dXJlXG4gICAgaWYgKCFzdWJzY3JpcHRpb24gfHwgdHlwZW9mIHN1YnNjcmlwdGlvbiAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgc3Vic2NyaXB0aW9uIHN0cnVjdHVyZScgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBzdWJzY3JpcHRpb24gSURcbiAgICBpZiAoIXN1YnNjcmlwdGlvbi5pZCB8fCB0eXBlb2Ygc3Vic2NyaXB0aW9uLmlkICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnU3Vic2NyaXB0aW9uIG11c3QgaGF2ZSBhIHN0cmluZyBJRCcgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBmaWx0ZXJzIGFycmF5XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHN1YnNjcmlwdGlvbi5maWx0ZXJzKSkge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnU3Vic2NyaXB0aW9uIGZpbHRlcnMgbXVzdCBiZSBhbiBhcnJheScgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBlYWNoIGZpbHRlclxuICAgIGZvciAoY29uc3QgZmlsdGVyIG9mIHN1YnNjcmlwdGlvbi5maWx0ZXJzKSB7XG4gICAgICBjb25zdCBmaWx0ZXJWYWxpZGF0aW9uID0gdmFsaWRhdGVGaWx0ZXIoZmlsdGVyKTtcbiAgICAgIGlmICghZmlsdGVyVmFsaWRhdGlvbi5pc1ZhbGlkKSB7XG4gICAgICAgIHJldHVybiBmaWx0ZXJWYWxpZGF0aW9uO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZhbGlkYXRlIHN1YnNjcmlwdGlvbicpO1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZhaWxlZCB0byB2YWxpZGF0ZSBzdWJzY3JpcHRpb24nIH07XG4gIH1cbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBOb3N0ciByZWxheSByZXNwb25zZSBtZXNzYWdlLlxuICogXG4gKiBAcGFyYW0ge3Vua25vd259IG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge1ZhbGlkYXRpb25SZXN1bHR9IE9iamVjdCBjb250YWluaW5nIHZhbGlkYXRpb24gcmVzdWx0IGFuZCBhbnkgZXJyb3IgbWVzc2FnZVxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IHJlc3VsdCA9IHZhbGlkYXRlUmVzcG9uc2UoWydFVkVOVCcsIGV2ZW50T2JqXSk7XG4gKiBpZiAoIXJlc3VsdC5pc1ZhbGlkKSB7XG4gKiAgIGNvbnNvbGUuZXJyb3IocmVzdWx0LmVycm9yKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVSZXNwb25zZShtZXNzYWdlOiB1bmtub3duKTogVmFsaWRhdGlvblJlc3VsdCB7XG4gIC8vIENoZWNrIGlmIG1lc3NhZ2UgaXMgYW4gYXJyYXlcbiAgaWYgKCFBcnJheS5pc0FycmF5KG1lc3NhZ2UpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdJbnZhbGlkIG1lc3NhZ2UgZm9ybWF0OiBtdXN0IGJlIGFuIGFycmF5J1xuICAgIH07XG4gIH1cblxuICAvLyBDaGVjayBpZiBtZXNzYWdlIGhhcyBhdCBsZWFzdCBvbmUgZWxlbWVudFxuICBpZiAobWVzc2FnZS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICBlcnJvcjogJ0ludmFsaWQgbWVzc2FnZSBmb3JtYXQ6IGFycmF5IGlzIGVtcHR5J1xuICAgIH07XG4gIH1cblxuICAvLyBDaGVjayBpZiBmaXJzdCBlbGVtZW50IGlzIGEgdmFsaWQgbWVzc2FnZSB0eXBlXG4gIGNvbnN0IHR5cGUgPSBtZXNzYWdlWzBdO1xuICBpZiAoIU9iamVjdC52YWx1ZXMoTm9zdHJNZXNzYWdlVHlwZSkuaW5jbHVkZXModHlwZSBhcyBOb3N0ck1lc3NhZ2VUeXBlKSkge1xuICAgIHJldHVybiB7XG4gICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgIGVycm9yOiBgSW52YWxpZCBtZXNzYWdlIHR5cGU6ICR7dHlwZX1gXG4gICAgfTtcbiAgfVxuXG4gIC8vIFR5cGUtc3BlY2lmaWMgdmFsaWRhdGlvblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIE5vc3RyTWVzc2FnZVR5cGUuRVZFTlQ6XG4gICAgICBpZiAobWVzc2FnZS5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogJ0VWRU5UIG1lc3NhZ2UgbXVzdCBoYXZlIGV4YWN0bHkgMiBlbGVtZW50cydcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWxpZGF0ZVNpZ25lZEV2ZW50KG1lc3NhZ2VbMV0gYXMgU2lnbmVkTm9zdHJFdmVudCk7XG5cbiAgICBjYXNlIE5vc3RyTWVzc2FnZVR5cGUuTk9USUNFOlxuICAgICAgaWYgKG1lc3NhZ2UubGVuZ3RoICE9PSAyIHx8IHR5cGVvZiBtZXNzYWdlWzFdICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiAnTk9USUNFIG1lc3NhZ2UgbXVzdCBoYXZlIGV4YWN0bHkgMiBlbGVtZW50cyB3aXRoIGEgc3RyaW5nIG1lc3NhZ2UnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG5cbiAgICBjYXNlIE5vc3RyTWVzc2FnZVR5cGUuT0s6XG4gICAgICBpZiAobWVzc2FnZS5sZW5ndGggIT09IDQgfHwgXG4gICAgICAgICAgdHlwZW9mIG1lc3NhZ2VbMV0gIT09ICdzdHJpbmcnIHx8IFxuICAgICAgICAgIHR5cGVvZiBtZXNzYWdlWzJdICE9PSAnYm9vbGVhbicgfHwgXG4gICAgICAgICAgdHlwZW9mIG1lc3NhZ2VbM10gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6ICdPSyBtZXNzYWdlIG11c3QgaGF2ZSBleGFjdGx5IDQgZWxlbWVudHM6IFt0eXBlLCBldmVudElkLCBzdWNjZXNzLCBtZXNzYWdlXSdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUgfTtcblxuICAgIGNhc2UgTm9zdHJNZXNzYWdlVHlwZS5FT1NFOlxuICAgICAgaWYgKG1lc3NhZ2UubGVuZ3RoICE9PSAyIHx8IHR5cGVvZiBtZXNzYWdlWzFdICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiAnRU9TRSBtZXNzYWdlIG11c3QgaGF2ZSBleGFjdGx5IDIgZWxlbWVudHMgd2l0aCBhIHN1YnNjcmlwdGlvbiBJRCdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUgfTtcblxuICAgIGNhc2UgTm9zdHJNZXNzYWdlVHlwZS5SRVE6XG4gICAgICBpZiAobWVzc2FnZS5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6ICdSRVEgbWVzc2FnZSBtdXN0IGhhdmUgYXQgbGVhc3QgMiBlbGVtZW50cydcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbWVzc2FnZVsxXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogJ1JFUSBtZXNzYWdlIG11c3QgaGF2ZSBhIHN0cmluZyBzdWJzY3JpcHRpb24gSUQnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICAvLyBWYWxpZGF0ZSBlYWNoIGZpbHRlciBpZiBwcmVzZW50XG4gICAgICBmb3IgKGxldCBpID0gMjsgaSA8IG1lc3NhZ2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZmlsdGVyUmVzdWx0ID0gdmFsaWRhdGVGaWx0ZXIobWVzc2FnZVtpXSBhcyBOb3N0ckZpbHRlcik7XG4gICAgICAgIGlmICghZmlsdGVyUmVzdWx0LmlzVmFsaWQpIHtcbiAgICAgICAgICByZXR1cm4gZmlsdGVyUmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG5cbiAgICBjYXNlIE5vc3RyTWVzc2FnZVR5cGUuQ0xPU0U6XG4gICAgICBpZiAobWVzc2FnZS5sZW5ndGggIT09IDIgfHwgdHlwZW9mIG1lc3NhZ2VbMV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6ICdDTE9TRSBtZXNzYWdlIG11c3QgaGF2ZSBleGFjdGx5IDIgZWxlbWVudHMgd2l0aCBhIHN1YnNjcmlwdGlvbiBJRCdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUgfTtcblxuICAgIGNhc2UgTm9zdHJNZXNzYWdlVHlwZS5BVVRIOlxuICAgICAgaWYgKG1lc3NhZ2UubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6ICdBVVRIIG1lc3NhZ2UgbXVzdCBoYXZlIGV4YWN0bHkgMiBlbGVtZW50cydcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWxpZGF0ZVNpZ25lZEV2ZW50KG1lc3NhZ2VbMV0gYXMgU2lnbmVkTm9zdHJFdmVudCk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgIGVycm9yOiBgVW5zdXBwb3J0ZWQgbWVzc2FnZSB0eXBlOiAke3R5cGV9YFxuICAgICAgfTtcbiAgfVxufVxuIiwgIi8qKlxuICogQG1vZHVsZSBldmVudFxuICogQGRlc2NyaXB0aW9uIEV2ZW50IGhhbmRsaW5nIHV0aWxpdGllcyBmb3IgTm9zdHJcbiAqL1xuXG5leHBvcnQgeyBjcmVhdGVFdmVudCwgc2VyaWFsaXplRXZlbnQsIGdldEV2ZW50SGFzaCB9IGZyb20gJy4vY3JlYXRpb24nO1xuZXhwb3J0IHsgdmFsaWRhdGVFdmVudCwgY2FsY3VsYXRlRXZlbnRJZCB9IGZyb20gJy4vc2lnbmluZyc7XG4iLCAiLyoqXG4gKiBAbW9kdWxlIGV2ZW50L2NyZWF0aW9uXG4gKiBAZGVzY3JpcHRpb24gRXZlbnQgY3JlYXRpb24gYW5kIHNlcmlhbGl6YXRpb24gdXRpbGl0aWVzIGZvciBOb3N0clxuICovXG5cbmltcG9ydCB7IHNoYTI1NiB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvc2hhMi5qcyc7XG5pbXBvcnQgeyBieXRlc1RvSGV4IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi91dGlscy9sb2dnZXInO1xuaW1wb3J0IHR5cGUgeyBOb3N0ckV2ZW50LCBOb3N0ckV2ZW50S2luZCB9IGZyb20gJy4uL3R5cGVzL2luZGV4JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IE5vc3RyIGV2ZW50IHdpdGggdGhlIHNwZWNpZmllZCBwYXJhbWV0ZXJzXG4gKiBAcGFyYW0gcGFyYW1zIC0gRXZlbnQgcGFyYW1ldGVyc1xuICogQHJldHVybnMgQ3JlYXRlZCBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXZlbnQocGFyYW1zOiB7XG4gIGtpbmQ6IE5vc3RyRXZlbnRLaW5kO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHRhZ3M/OiBzdHJpbmdbXVtdO1xuICBjcmVhdGVkX2F0PzogbnVtYmVyO1xuICBwdWJrZXk/OiBzdHJpbmc7XG59KTogTm9zdHJFdmVudCB7XG4gIGNvbnN0IHsgXG4gICAga2luZCwgXG4gICAgY29udGVudCwgXG4gICAgdGFncyA9IFtdLCBcbiAgICBjcmVhdGVkX2F0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksIFxuICAgIHB1YmtleSA9ICcnIFxuICB9ID0gcGFyYW1zO1xuICBcbiAgcmV0dXJuIHtcbiAgICBraW5kLFxuICAgIGNvbnRlbnQsXG4gICAgdGFncyxcbiAgICBjcmVhdGVkX2F0LFxuICAgIHB1YmtleSxcbiAgfTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemVzIGEgTm9zdHIgZXZlbnQgZm9yIHNpZ25pbmcvaGFzaGluZyAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gc2VyaWFsaXplXG4gKiBAcmV0dXJucyBTZXJpYWxpemVkIGV2ZW50IEpTT04gc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVFdmVudChldmVudDogTm9zdHJFdmVudCk6IHN0cmluZyB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShbXG4gICAgMCxcbiAgICBldmVudC5wdWJrZXksXG4gICAgZXZlbnQuY3JlYXRlZF9hdCxcbiAgICBldmVudC5raW5kLFxuICAgIGV2ZW50LnRhZ3MsXG4gICAgZXZlbnQuY29udGVudFxuICBdKTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBoYXNoIG9mIGEgTm9zdHIgZXZlbnQgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIGhhc2hcbiAqIEByZXR1cm5zIEV2ZW50IGhhc2ggaW4gaGV4IGZvcm1hdFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RXZlbnRIYXNoKGV2ZW50OiBOb3N0ckV2ZW50KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzZXJpYWxpemVkID0gc2VyaWFsaXplRXZlbnQoZXZlbnQpO1xuICAgIGNvbnN0IGhhc2ggPSBhd2FpdCBzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlcmlhbGl6ZWQpKTtcbiAgICByZXR1cm4gYnl0ZXNUb0hleChoYXNoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGdldCBldmVudCBoYXNoJyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgZXZlbnQvc2lnbmluZ1xuICogQGRlc2NyaXB0aW9uIEV2ZW50IHNpZ25pbmcgYW5kIHZlcmlmaWNhdGlvbiB1dGlsaXRpZXMgZm9yIE5vc3RyXG4gKi9cblxuaW1wb3J0IHsgc2Nobm9yciB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbmltcG9ydCB7IGJ5dGVzVG9IZXgsIGhleFRvQnl0ZXMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XG5pbXBvcnQgeyBnZXRFdmVudEhhc2ggfSBmcm9tICcuL2NyZWF0aW9uJztcbmltcG9ydCB0eXBlIHsgTm9zdHJFdmVudCwgU2lnbmVkTm9zdHJFdmVudCB9IGZyb20gJy4uL3R5cGVzJztcblxuLyoqXG4gKiBTaWducyBhIE5vc3RyIGV2ZW50IHdpdGggYSBwcml2YXRlIGtleSAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gc2lnblxuICogQHBhcmFtIHByaXZhdGVLZXkgLSBQcml2YXRlIGtleSBpbiBoZXggZm9ybWF0XG4gKiBAcmV0dXJucyBTaWduZWQgZXZlbnRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNpZ25FdmVudChcbiAgZXZlbnQ6IE5vc3RyRXZlbnQsIFxuICBwcml2YXRlS2V5OiBzdHJpbmdcbik6IFByb21pc2U8U2lnbmVkTm9zdHJFdmVudD4ge1xuICB0cnkge1xuICAgIGNvbnN0IGhhc2ggPSBhd2FpdCBnZXRFdmVudEhhc2goZXZlbnQpO1xuICAgIGNvbnN0IHNpZyA9IHNjaG5vcnIuc2lnbihoZXhUb0J5dGVzKGhhc2gpLCBoZXhUb0J5dGVzKHByaXZhdGVLZXkpKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZXZlbnQsXG4gICAgICBpZDogaGFzaCxcbiAgICAgIHNpZzogYnl0ZXNUb0hleChzaWcpLFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBzaWduIGV2ZW50Jyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGUgc2lnbmF0dXJlIG9mIGEgc2lnbmVkIE5vc3RyIGV2ZW50IChOSVAtMDEpXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byB2ZXJpZnlcbiAqIEByZXR1cm5zIFRydWUgaWYgc2lnbmF0dXJlIGlzIHZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlTaWduYXR1cmUoZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQpOiBib29sZWFuIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gc2Nobm9yci52ZXJpZnkoXG4gICAgICBoZXhUb0J5dGVzKGV2ZW50LnNpZyksXG4gICAgICBoZXhUb0J5dGVzKGV2ZW50LmlkKSxcbiAgICAgIGhleFRvQnl0ZXMoZXZlbnQucHVia2V5KVxuICAgICk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2ZXJpZnkgc2lnbmF0dXJlJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgTm9zdHIgZXZlbnRcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyBUcnVlIGlmIGV2ZW50IGlzIHZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUV2ZW50KGV2ZW50OiBTaWduZWROb3N0ckV2ZW50KTogYm9vbGVhbiB7XG4gIHRyeSB7XG4gICAgLy8gQ2hlY2sgcmVxdWlyZWQgZmllbGRzXG4gICAgaWYgKCFldmVudC5pZCB8fCAhZXZlbnQucHVia2V5IHx8ICFldmVudC5zaWcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBWZXJpZnkgc2lnbmF0dXJlXG4gICAgcmV0dXJuIHZlcmlmeVNpZ25hdHVyZShldmVudCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0Vycm9yIHZhbGlkYXRpbmcgZXZlbnQnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldmVudCBJRCBmb3IgYSBOb3N0ciBldmVudFxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gY2FsY3VsYXRlIElEIGZvclxuICogQHJldHVybnMgRXZlbnQgSURcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZUV2ZW50SWQoZXZlbnQ6IE5vc3RyRXZlbnQpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gZ2V0RXZlbnRIYXNoKGV2ZW50KTtcbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgbmlwcy9uaXAtMDRcbiAqIEBkZXNjcmlwdGlvbiBJbXBsZW1lbnRhdGlvbiBvZiBOSVAtMDQgKEVuY3J5cHRlZCBEaXJlY3QgTWVzc2FnZXMpXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzA0Lm1kXG4gKi9cblxuaW1wb3J0IHsgc2VjcDI1NmsxIH0gZnJvbSAnQG5vYmxlL2N1cnZlcy9zZWNwMjU2azEuanMnO1xuaW1wb3J0IHsgaGV4VG9CeXRlcyB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcbmltcG9ydCB7IGJ5dGVzVG9CYXNlNjQsIGJhc2U2NFRvQnl0ZXMgfSBmcm9tICcuLi9lbmNvZGluZy9iYXNlNjQnO1xuaW1wb3J0IHR5cGUgeyBDcnlwdG9TdWJ0bGUgfSBmcm9tICcuLi9jcnlwdG8nO1xuXG5cbi8vIENvbmZpZ3VyZSBjcnlwdG8gZm9yIE5vZGUuanMgYW5kIHRlc3QgZW52aXJvbm1lbnRzXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBXaW5kb3cge1xuICAgIGNyeXB0bzogQ3J5cHRvU3VidGxlO1xuICB9XG4gIGludGVyZmFjZSBHbG9iYWwge1xuICAgIGNyeXB0bzogQ3J5cHRvU3VidGxlO1xuICB9XG59XG5cbmNvbnN0IGdldENyeXB0byA9IGFzeW5jICgpOiBQcm9taXNlPENyeXB0b1N1YnRsZT4gPT4ge1xuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNyeXB0bykge1xuICAgIHJldHVybiB3aW5kb3cuY3J5cHRvO1xuICB9XG4gIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyAmJiAoZ2xvYmFsIGFzIEdsb2JhbCkuY3J5cHRvKSB7XG4gICAgcmV0dXJuIChnbG9iYWwgYXMgR2xvYmFsKS5jcnlwdG87XG4gIH1cbiAgdHJ5IHtcbiAgICBjb25zdCBjcnlwdG9Nb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ2NyeXB0bycpO1xuICAgIGlmIChjcnlwdG9Nb2R1bGUud2ViY3J5cHRvKSB7XG4gICAgICByZXR1cm4gY3J5cHRvTW9kdWxlLndlYmNyeXB0byBhcyBDcnlwdG9TdWJ0bGU7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICBsb2dnZXIuZGVidWcoJ05vZGUgY3J5cHRvIG5vdCBhdmFpbGFibGUnKTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignTm8gV2ViQ3J5cHRvIGltcGxlbWVudGF0aW9uIGF2YWlsYWJsZScpO1xufTtcblxuY2xhc3MgQ3J5cHRvSW1wbGVtZW50YXRpb24ge1xuICBwcml2YXRlIGNyeXB0b0luc3RhbmNlOiBDcnlwdG9TdWJ0bGUgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBpbml0UHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmluaXRQcm9taXNlID0gdGhpcy5pbml0aWFsaXplKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGluaXRpYWxpemUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5jcnlwdG9JbnN0YW5jZSA9IGF3YWl0IGdldENyeXB0bygpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVJbml0aWFsaXplZCgpOiBQcm9taXNlPENyeXB0b1N1YnRsZT4ge1xuICAgIGF3YWl0IHRoaXMuaW5pdFByb21pc2U7XG4gICAgaWYgKCF0aGlzLmNyeXB0b0luc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NyeXB0byBpbXBsZW1lbnRhdGlvbiBub3QgaW5pdGlhbGl6ZWQnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY3J5cHRvSW5zdGFuY2U7XG4gIH1cblxuICBhc3luYyBnZXRTdWJ0bGUoKTogUHJvbWlzZTxDcnlwdG9TdWJ0bGVbJ3N1YnRsZSddPiB7XG4gICAgY29uc3QgY3J5cHRvID0gYXdhaXQgdGhpcy5lbnN1cmVJbml0aWFsaXplZCgpO1xuICAgIHJldHVybiBjcnlwdG8uc3VidGxlO1xuICB9XG5cbiAgYXN5bmMgZ2V0UmFuZG9tVmFsdWVzPFQgZXh0ZW5kcyBVaW50OEFycmF5IHwgSW50OEFycmF5IHwgVWludDE2QXJyYXkgfCBJbnQxNkFycmF5IHwgVWludDMyQXJyYXkgfCBJbnQzMkFycmF5PihhcnJheTogVCk6IFByb21pc2U8VD4ge1xuICAgIGNvbnN0IGNyeXB0byA9IGF3YWl0IHRoaXMuZW5zdXJlSW5pdGlhbGl6ZWQoKTtcbiAgICByZXR1cm4gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XG4gIH1cbn1cblxuY29uc3QgY3J5cHRvSW1wbCA9IG5ldyBDcnlwdG9JbXBsZW1lbnRhdGlvbigpO1xuXG5pbnRlcmZhY2UgU2hhcmVkU2VjcmV0IHtcbiAgc2hhcmVkU2VjcmV0OiBVaW50OEFycmF5O1xufVxuXG4vKipcbiAqIEVuY3J5cHRzIGEgbWVzc2FnZSB1c2luZyBOSVAtMDQgZW5jcnlwdGlvblxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGVuY3J5cHRcbiAqIEBwYXJhbSBzZW5kZXJQcml2S2V5IC0gU2VuZGVyJ3MgcHJpdmF0ZSBrZXlcbiAqIEBwYXJhbSByZWNpcGllbnRQdWJLZXkgLSBSZWNpcGllbnQncyBwdWJsaWMga2V5XG4gKiBAcmV0dXJucyBFbmNyeXB0ZWQgbWVzc2FnZSBzdHJpbmdcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHRNZXNzYWdlKFxuICBtZXNzYWdlOiBzdHJpbmcsXG4gIHNlbmRlclByaXZLZXk6IHN0cmluZyxcbiAgcmVjaXBpZW50UHViS2V5OiBzdHJpbmdcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIHRyeSB7XG4gICAgaWYgKCFtZXNzYWdlIHx8ICFzZW5kZXJQcml2S2V5IHx8ICFyZWNpcGllbnRQdWJLZXkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnB1dCBwYXJhbWV0ZXJzJyk7XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUga2V5c1xuICAgIGlmICghL15bMC05YS1mXXs2NH0kL2kudGVzdChzZW5kZXJQcml2S2V5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHByaXZhdGUga2V5IGZvcm1hdCcpO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSBwdWJsaWMga2V5IGlzIGluIGNvcnJlY3QgZm9ybWF0XG4gICAgY29uc3QgcHViS2V5SGV4ID0gcmVjaXBpZW50UHViS2V5LnN0YXJ0c1dpdGgoJzAyJykgfHwgcmVjaXBpZW50UHViS2V5LnN0YXJ0c1dpdGgoJzAzJykgXG4gICAgICA/IHJlY2lwaWVudFB1YktleSBcbiAgICAgIDogJzAyJyArIHJlY2lwaWVudFB1YktleTtcblxuICAgIC8vIEdlbmVyYXRlIHNoYXJlZCBzZWNyZXRcbiAgICBjb25zdCBzaGFyZWRQb2ludCA9IHNlY3AyNTZrMS5nZXRTaGFyZWRTZWNyZXQoaGV4VG9CeXRlcyhzZW5kZXJQcml2S2V5KSwgaGV4VG9CeXRlcyhwdWJLZXlIZXgpKTtcbiAgICBjb25zdCBzaGFyZWRYID0gc2hhcmVkUG9pbnQuc2xpY2UoMSwgMzMpOyAvLyBVc2Ugb25seSB4LWNvb3JkaW5hdGVcblxuICAgIC8vIEltcG9ydCBrZXkgZm9yIEFFU1xuICAgIGNvbnN0IHNoYXJlZEtleSA9IGF3YWl0IChhd2FpdCBjcnlwdG9JbXBsLmdldFN1YnRsZSgpKS5pbXBvcnRLZXkoXG4gICAgICAncmF3JyxcbiAgICAgIHNoYXJlZFguYnVmZmVyLFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGxlbmd0aDogMjU2IH0sXG4gICAgICBmYWxzZSxcbiAgICAgIFsnZW5jcnlwdCddXG4gICAgKTtcblxuICAgIC8vIFplcm8gc2hhcmVkIHNlY3JldCBtYXRlcmlhbCBub3cgdGhhdCBBRVMga2V5IGlzIGltcG9ydGVkXG4gICAgc2hhcmVkWC5maWxsKDApO1xuICAgIHNoYXJlZFBvaW50LmZpbGwoMCk7XG5cbiAgICAvLyBHZW5lcmF0ZSBJViBhbmQgZW5jcnlwdFxuICAgIGNvbnN0IGl2ID0gbmV3IFVpbnQ4QXJyYXkoMTYpO1xuICAgIGF3YWl0IGNyeXB0b0ltcGwuZ2V0UmFuZG9tVmFsdWVzKGl2KTtcblxuICAgIGNvbnN0IGVuY29kZWQgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUobWVzc2FnZSk7XG4gICAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgKGF3YWl0IGNyeXB0b0ltcGwuZ2V0U3VidGxlKCkpLmVuY3J5cHQoXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgaXYgfSxcbiAgICAgIHNoYXJlZEtleSxcbiAgICAgIGVuY29kZWQuYnVmZmVyXG4gICAgKTtcblxuICAgIC8vIE5JUC0wNCBzdGFuZGFyZCBmb3JtYXQ6IGJhc2U2NChjaXBoZXJ0ZXh0KSArIFwiP2l2PVwiICsgYmFzZTY0KGl2KVxuICAgIGNvbnN0IGNpcGhlcnRleHRCYXNlNjQgPSBieXRlc1RvQmFzZTY0KG5ldyBVaW50OEFycmF5KGVuY3J5cHRlZCkpO1xuICAgIGNvbnN0IGl2QmFzZTY0ID0gYnl0ZXNUb0Jhc2U2NChpdik7XG5cbiAgICByZXR1cm4gY2lwaGVydGV4dEJhc2U2NCArICc/aXY9JyArIGl2QmFzZTY0O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gZW5jcnlwdCBtZXNzYWdlJyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWNyeXB0cyBhIG1lc3NhZ2UgdXNpbmcgTklQLTA0IGRlY3J5cHRpb25cbiAqIEBwYXJhbSBlbmNyeXB0ZWRNZXNzYWdlIC0gRW5jcnlwdGVkIG1lc3NhZ2Ugc3RyaW5nXG4gKiBAcGFyYW0gcmVjaXBpZW50UHJpdktleSAtIFJlY2lwaWVudCdzIHByaXZhdGUga2V5XG4gKiBAcGFyYW0gc2VuZGVyUHViS2V5IC0gU2VuZGVyJ3MgcHVibGljIGtleVxuICogQHJldHVybnMgRGVjcnlwdGVkIG1lc3NhZ2Ugc3RyaW5nXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0TWVzc2FnZShcbiAgZW5jcnlwdGVkTWVzc2FnZTogc3RyaW5nLFxuICByZWNpcGllbnRQcml2S2V5OiBzdHJpbmcsXG4gIHNlbmRlclB1YktleTogc3RyaW5nXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICB0cnkge1xuICAgIGlmICghZW5jcnlwdGVkTWVzc2FnZSB8fCAhcmVjaXBpZW50UHJpdktleSB8fCAhc2VuZGVyUHViS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5wdXQgcGFyYW1ldGVycycpO1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGtleXNcbiAgICBpZiAoIS9eWzAtOWEtZl17NjR9JC9pLnRlc3QocmVjaXBpZW50UHJpdktleSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwcml2YXRlIGtleSBmb3JtYXQnKTtcbiAgICB9XG5cbiAgICAvLyBFbnN1cmUgcHVibGljIGtleSBpcyBpbiBjb3JyZWN0IGZvcm1hdFxuICAgIGNvbnN0IHB1YktleUhleCA9IHNlbmRlclB1YktleS5zdGFydHNXaXRoKCcwMicpIHx8IHNlbmRlclB1YktleS5zdGFydHNXaXRoKCcwMycpXG4gICAgICA/IHNlbmRlclB1YktleVxuICAgICAgOiAnMDInICsgc2VuZGVyUHViS2V5O1xuXG4gICAgLy8gR2VuZXJhdGUgc2hhcmVkIHNlY3JldFxuICAgIGNvbnN0IHNoYXJlZFBvaW50ID0gc2VjcDI1NmsxLmdldFNoYXJlZFNlY3JldChoZXhUb0J5dGVzKHJlY2lwaWVudFByaXZLZXkpLCBoZXhUb0J5dGVzKHB1YktleUhleCkpO1xuICAgIGNvbnN0IHNoYXJlZFggPSBzaGFyZWRQb2ludC5zbGljZSgxLCAzMyk7IC8vIFVzZSBvbmx5IHgtY29vcmRpbmF0ZVxuXG4gICAgLy8gSW1wb3J0IGtleSBmb3IgQUVTXG4gICAgY29uc3Qgc2hhcmVkS2V5ID0gYXdhaXQgKGF3YWl0IGNyeXB0b0ltcGwuZ2V0U3VidGxlKCkpLmltcG9ydEtleShcbiAgICAgICdyYXcnLFxuICAgICAgc2hhcmVkWC5idWZmZXIsXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgbGVuZ3RoOiAyNTYgfSxcbiAgICAgIGZhbHNlLFxuICAgICAgWydkZWNyeXB0J11cbiAgICApO1xuXG4gICAgLy8gWmVybyBzaGFyZWQgc2VjcmV0IG1hdGVyaWFsIG5vdyB0aGF0IEFFUyBrZXkgaXMgaW1wb3J0ZWRcbiAgICBzaGFyZWRYLmZpbGwoMCk7XG4gICAgc2hhcmVkUG9pbnQuZmlsbCgwKTtcblxuICAgIC8vIFBhcnNlIE5JUC0wNCBzdGFuZGFyZCBmb3JtYXQ6IGJhc2U2NChjaXBoZXJ0ZXh0KSArIFwiP2l2PVwiICsgYmFzZTY0KGl2KVxuICAgIC8vIEFsc28gc3VwcG9ydCBsZWdhY3kgaGV4IGZvcm1hdCAoaXYgKyBjaXBoZXJ0ZXh0IGNvbmNhdGVuYXRlZCkgYXMgZmFsbGJhY2tcbiAgICBsZXQgaXY6IFVpbnQ4QXJyYXk7XG4gICAgbGV0IGNpcGhlcnRleHQ6IFVpbnQ4QXJyYXk7XG5cbiAgICBpZiAoZW5jcnlwdGVkTWVzc2FnZS5pbmNsdWRlcygnP2l2PScpKSB7XG4gICAgICAvLyBOSVAtMDQgc3RhbmRhcmQgZm9ybWF0XG4gICAgICBjb25zdCBbY2lwaGVydGV4dEJhc2U2NCwgaXZCYXNlNjRdID0gZW5jcnlwdGVkTWVzc2FnZS5zcGxpdCgnP2l2PScpO1xuICAgICAgY2lwaGVydGV4dCA9IGJhc2U2NFRvQnl0ZXMoY2lwaGVydGV4dEJhc2U2NCk7XG4gICAgICBpdiA9IGJhc2U2NFRvQnl0ZXMoaXZCYXNlNjQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBMZWdhY3kgaGV4IGZvcm1hdCBmYWxsYmFjazogZmlyc3QgMTYgYnl0ZXMgYXJlIElWLCByZXN0IGlzIGNpcGhlcnRleHRcbiAgICAgIGNvbnN0IGVuY3J5cHRlZCA9IGhleFRvQnl0ZXMoZW5jcnlwdGVkTWVzc2FnZSk7XG4gICAgICBpdiA9IGVuY3J5cHRlZC5zbGljZSgwLCAxNik7XG4gICAgICBjaXBoZXJ0ZXh0ID0gZW5jcnlwdGVkLnNsaWNlKDE2KTtcbiAgICB9XG5cbiAgICAvLyBEZWNyeXB0XG4gICAgY29uc3QgZGVjcnlwdGVkID0gYXdhaXQgKGF3YWl0IGNyeXB0b0ltcGwuZ2V0U3VidGxlKCkpLmRlY3J5cHQoXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgaXYgfSxcbiAgICAgIHNoYXJlZEtleSxcbiAgICAgIGNpcGhlcnRleHQuYnVmZmVyIGFzIEFycmF5QnVmZmVyXG4gICAgKTtcblxuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoZGVjcnlwdGVkKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGRlY3J5cHQgbWVzc2FnZScpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgc2hhcmVkIHNlY3JldCBmb3IgTklQLTA0IGVuY3J5cHRpb25cbiAqIEBwYXJhbSBwcml2YXRlS2V5IC0gUHJpdmF0ZSBrZXlcbiAqIEBwYXJhbSBwdWJsaWNLZXkgLSBQdWJsaWMga2V5XG4gKiBAcmV0dXJucyBTaGFyZWQgc2VjcmV0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVNoYXJlZFNlY3JldChcbiAgcHJpdmF0ZUtleTogc3RyaW5nLFxuICBwdWJsaWNLZXk6IHN0cmluZ1xuKTogU2hhcmVkU2VjcmV0IHtcbiAgdHJ5IHtcbiAgICBpZiAoIXByaXZhdGVLZXkgfHwgIXB1YmxpY0tleSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0IHBhcmFtZXRlcnMnKTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBrZXlzXG4gICAgaWYgKCEvXlswLTlhLWZdezY0fSQvaS50ZXN0KHByaXZhdGVLZXkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcHJpdmF0ZSBrZXkgZm9ybWF0Jyk7XG4gICAgfVxuXG4gICAgLy8gRW5zdXJlIHB1YmxpYyBrZXkgaXMgaW4gY29ycmVjdCBmb3JtYXRcbiAgICBjb25zdCBwdWJLZXlIZXggPSBwdWJsaWNLZXkuc3RhcnRzV2l0aCgnMDInKSB8fCBwdWJsaWNLZXkuc3RhcnRzV2l0aCgnMDMnKVxuICAgICAgPyBwdWJsaWNLZXlcbiAgICAgIDogJzAyJyArIHB1YmxpY0tleTtcblxuICAgIC8vIEdlbmVyYXRlIHNoYXJlZCBzZWNyZXRcbiAgICBjb25zdCBzaGFyZWRQb2ludCA9IHNlY3AyNTZrMS5nZXRTaGFyZWRTZWNyZXQoaGV4VG9CeXRlcyhwcml2YXRlS2V5KSwgaGV4VG9CeXRlcyhwdWJLZXlIZXgpKTtcbiAgICByZXR1cm4geyBzaGFyZWRTZWNyZXQ6IHNoYXJlZFBvaW50LnNsaWNlKDEsIDMzKSB9OyAvLyBSZXR1cm4gb25seSB4LWNvb3JkaW5hdGVcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGdlbmVyYXRlIHNoYXJlZCBzZWNyZXQnKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG5leHBvcnQgeyBnZW5lcmF0ZVNoYXJlZFNlY3JldCBhcyBjb21wdXRlU2hhcmVkU2VjcmV0IH07XG4iLCAiLyoqXG4gKiBAbW9kdWxlIG5pcHMvbmlwLTAxXG4gKiBAZGVzY3JpcHRpb24gSW1wbGVtZW50YXRpb24gb2YgTklQLTAxOiBCYXNpYyBQcm90b2NvbCBGbG93IERlc2NyaXB0aW9uXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzAxLm1kXG4gKi9cblxuaW1wb3J0IHsgc2Nobm9yciB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbmltcG9ydCB7IHNoYTI1NiB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvc2hhMi5qcyc7XG5pbXBvcnQgeyBieXRlc1RvSGV4LCBoZXhUb0J5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi91dGlscy9sb2dnZXInO1xuaW1wb3J0IHR5cGUgeyBOb3N0ckV2ZW50LCBTaWduZWROb3N0ckV2ZW50IH0gZnJvbSAnLi4vdHlwZXMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgTm9zdHIgZXZlbnQgd2l0aCB0aGUgc3BlY2lmaWVkIHBhcmFtZXRlcnMgKE5JUC0wMSlcbiAqIEBwYXJhbSBwYXJhbXMgLSBFdmVudCBwYXJhbWV0ZXJzXG4gKiBAcmV0dXJucyBDcmVhdGVkIGV2ZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFdmVudChwYXJhbXM6IHtcbiAga2luZDogbnVtYmVyO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHRhZ3M/OiBzdHJpbmdbXVtdO1xuICBjcmVhdGVkX2F0PzogbnVtYmVyO1xuICBwdWJrZXk/OiBzdHJpbmc7XG59KTogTm9zdHJFdmVudCB7XG4gIGNvbnN0IHsgXG4gICAga2luZCwgXG4gICAgY29udGVudCwgXG4gICAgdGFncyA9IFtdLCBcbiAgICBjcmVhdGVkX2F0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksIFxuICAgIHB1YmtleSA9ICcnIFxuICB9ID0gcGFyYW1zO1xuICBcbiAgcmV0dXJuIHtcbiAgICBraW5kLFxuICAgIGNvbnRlbnQsXG4gICAgdGFncyxcbiAgICBjcmVhdGVkX2F0LFxuICAgIHB1YmtleSxcbiAgfTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemVzIGEgTm9zdHIgZXZlbnQgZm9yIHNpZ25pbmcvaGFzaGluZyAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gc2VyaWFsaXplXG4gKiBAcmV0dXJucyBTZXJpYWxpemVkIGV2ZW50IEpTT04gc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVFdmVudChldmVudDogTm9zdHJFdmVudCk6IHN0cmluZyB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShbXG4gICAgMCxcbiAgICBldmVudC5wdWJrZXksXG4gICAgZXZlbnQuY3JlYXRlZF9hdCxcbiAgICBldmVudC5raW5kLFxuICAgIGV2ZW50LnRhZ3MsXG4gICAgZXZlbnQuY29udGVudFxuICBdKTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBoYXNoIG9mIGEgTm9zdHIgZXZlbnQgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIGhhc2hcbiAqIEByZXR1cm5zIEV2ZW50IGhhc2ggaW4gaGV4IGZvcm1hdFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RXZlbnRIYXNoKGV2ZW50OiBOb3N0ckV2ZW50KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzZXJpYWxpemVkID0gc2VyaWFsaXplRXZlbnQoZXZlbnQpO1xuICAgIGNvbnN0IGhhc2ggPSBzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlcmlhbGl6ZWQpKTtcbiAgICByZXR1cm4gYnl0ZXNUb0hleChoYXNoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGdldCBldmVudCBoYXNoJyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBTaWducyBhIE5vc3RyIGV2ZW50IHdpdGggYSBwcml2YXRlIGtleSAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gc2lnblxuICogQHBhcmFtIHByaXZhdGVLZXkgLSBQcml2YXRlIGtleSBpbiBoZXggZm9ybWF0XG4gKiBAcmV0dXJucyBTaWduZWQgZXZlbnRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNpZ25FdmVudChcbiAgZXZlbnQ6IE5vc3RyRXZlbnQsIFxuICBwcml2YXRlS2V5OiBzdHJpbmdcbik6IFByb21pc2U8U2lnbmVkTm9zdHJFdmVudD4ge1xuICB0cnkge1xuICAgIGNvbnN0IGhhc2ggPSBhd2FpdCBnZXRFdmVudEhhc2goZXZlbnQpO1xuICAgIGNvbnN0IHNpZyA9IHNjaG5vcnIuc2lnbihoZXhUb0J5dGVzKGhhc2gpLCBoZXhUb0J5dGVzKHByaXZhdGVLZXkpKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZXZlbnQsXG4gICAgICBpZDogaGFzaCxcbiAgICAgIHNpZzogYnl0ZXNUb0hleChzaWcpLFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBzaWduIGV2ZW50Jyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGUgc2lnbmF0dXJlIG9mIGEgc2lnbmVkIE5vc3RyIGV2ZW50IChOSVAtMDEpXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byB2ZXJpZnlcbiAqIEByZXR1cm5zIFRydWUgaWYgc2lnbmF0dXJlIGlzIHZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlTaWduYXR1cmUoZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQpOiBib29sZWFuIHtcbiAgdHJ5IHtcbiAgICAvLyBWZXJpZnkgZXZlbnQgSURcbiAgICBjb25zdCBleHBlY3RlZElkID0gY2FsY3VsYXRlRXZlbnRJZChldmVudCk7XG4gICAgaWYgKGV2ZW50LmlkICE9PSBleHBlY3RlZElkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gVmVyaWZ5IHNpZ25hdHVyZVxuICAgIHJldHVybiBzY2hub3JyLnZlcmlmeShcbiAgICAgIGhleFRvQnl0ZXMoZXZlbnQuc2lnKSxcbiAgICAgIGhleFRvQnl0ZXMoZXZlbnQuaWQpLFxuICAgICAgaGV4VG9CeXRlcyhldmVudC5wdWJrZXkpXG4gICAgKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZlcmlmeSBzaWduYXR1cmUnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldmVudCBJRCBhY2NvcmRpbmcgdG8gTklQLTAxXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byBjYWxjdWxhdGUgSUQgZm9yXG4gKiBAcmV0dXJucyBFdmVudCBJRCBpbiBoZXggZm9ybWF0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVFdmVudElkKGV2ZW50OiBOb3N0ckV2ZW50KTogc3RyaW5nIHtcbiAgY29uc3Qgc2VyaWFsaXplZCA9IHNlcmlhbGl6ZUV2ZW50KGV2ZW50KTtcbiAgY29uc3QgaGFzaCA9IHNoYTI1NihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc2VyaWFsaXplZCkpO1xuICByZXR1cm4gYnl0ZXNUb0hleChoYXNoKTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBOb3N0ciBldmVudCBzdHJ1Y3R1cmUgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyBUcnVlIGlmIGV2ZW50IHN0cnVjdHVyZSBpcyB2YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVFdmVudChldmVudDogTm9zdHJFdmVudCk6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIGlmICh0eXBlb2YgZXZlbnQuY29udGVudCAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICBpZiAodHlwZW9mIGV2ZW50LmNyZWF0ZWRfYXQgIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHR5cGVvZiBldmVudC5raW5kICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShldmVudC50YWdzKSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICh0eXBlb2YgZXZlbnQucHVia2V5ICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIFxuICAgIC8vIFZhbGlkYXRlIHRhZ3Mgc3RydWN0dXJlXG4gICAgZm9yIChjb25zdCB0YWcgb2YgZXZlbnQudGFncykge1xuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHRhZykpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICh0YWcubGVuZ3RoID09PSAwKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAodHlwZW9mIHRhZ1swXSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2YWxpZGF0ZSBldmVudCcpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIiwgIi8qKlxuICogTklQLTE5OiBiZWNoMzItZW5jb2RlZCBlbnRpdGllc1xuICogSW1wbGVtZW50cyBlbmNvZGluZyBhbmQgZGVjb2Rpbmcgb2YgTm9zdHIgZW50aXRpZXMgdXNpbmcgYmVjaDMyIGZvcm1hdFxuICovXG5cbmltcG9ydCB7IGJlY2gzMiB9IGZyb20gJ2JlY2gzMic7XG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXInO1xuXG5leHBvcnQgdHlwZSBOaXAxOURhdGFUeXBlID0gJ25wdWInIHwgJ25zZWMnIHwgJ25vdGUnIHwgJ25wcm9maWxlJyB8ICduZXZlbnQnIHwgJ25hZGRyJyB8ICducmVsYXknO1xuXG5jb25zdCBWQUxJRF9QUkVGSVhFUzogTmlwMTlEYXRhVHlwZVtdID0gWyducHViJywgJ25zZWMnLCAnbm90ZScsICducHJvZmlsZScsICduZXZlbnQnLCAnbmFkZHInLCAnbnJlbGF5J107XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmlwMTlEYXRhIHtcbiAgdHlwZTogTmlwMTlEYXRhVHlwZTtcbiAgZGF0YTogc3RyaW5nO1xuICByZWxheXM/OiBzdHJpbmdbXTtcbiAgYXV0aG9yPzogc3RyaW5nO1xuICBraW5kPzogbnVtYmVyO1xuICBpZGVudGlmaWVyPzogc3RyaW5nOyAvLyBGb3IgbmFkZHJcbn1cblxuLy8gVExWIHR5cGUgY29uc3RhbnRzXG5jb25zdCBUTFZfVFlQRVMgPSB7XG4gIFNQRUNJQUw6IDAsICAgLy8gTWFpbiBkYXRhIChoZXgpXG4gIFJFTEFZOiAxLCAgICAgLy8gUmVsYXkgVVJMICh1dGY4KVxuICBBVVRIT1I6IDIsICAgIC8vIEF1dGhvciBwdWJrZXkgKGhleClcbiAgS0lORDogMywgICAgICAvLyBFdmVudCBraW5kICh1aW50OClcbiAgSURFTlRJRklFUjogNCAvLyBJZGVudGlmaWVyICh1dGY4KVxufSBhcyBjb25zdDtcblxuLyoqXG4gKiBFbmNvZGUgYSBwdWJsaWMga2V5IGFzIGFuIG5wdWJcbiAqIEBwYXJhbSBwdWJrZXkgUHVibGljIGtleSBpbiBoZXggZm9ybWF0XG4gKiBAcmV0dXJucyBiZWNoMzItZW5jb2RlZCBucHViIHN0cmluZ1xuICogQHRocm93cyB7RXJyb3J9IElmIHB1YmtleSBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBucHViRW5jb2RlKHB1YmtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVIZXhTdHJpbmcocHVia2V5LCA2NCk7XG4gIGNvbnN0IGRhdGEgPSBCdWZmZXIuZnJvbShwdWJrZXksICdoZXgnKTtcbiAgY29uc3Qgd29yZHMgPSBiZWNoMzIudG9Xb3JkcyhkYXRhKTtcbiAgcmV0dXJuIGJlY2gzMi5lbmNvZGUoJ25wdWInLCB3b3JkcywgMTAwMCk7XG59XG5cbi8qKlxuICogRW5jb2RlIGEgcHJpdmF0ZSBrZXkgYXMgYW4gbnNlY1xuICogQHBhcmFtIHByaXZrZXkgUHJpdmF0ZSBrZXkgaW4gaGV4IGZvcm1hdFxuICogQHJldHVybnMgYmVjaDMyLWVuY29kZWQgbnNlYyBzdHJpbmdcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBwcml2a2V5IGlzIGludmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5zZWNFbmNvZGUocHJpdmtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVIZXhTdHJpbmcocHJpdmtleSwgNjQpO1xuICBjb25zdCBkYXRhID0gQnVmZmVyLmZyb20ocHJpdmtleSwgJ2hleCcpO1xuICBjb25zdCB3b3JkcyA9IGJlY2gzMi50b1dvcmRzKGRhdGEpO1xuICByZXR1cm4gYmVjaDMyLmVuY29kZSgnbnNlYycsIHdvcmRzLCAxMDAwKTtcbn1cblxuLyoqXG4gKiBFbmNvZGUgYW4gZXZlbnQgSUQgYXMgYSBub3RlXG4gKiBAcGFyYW0gZXZlbnRJZCBFdmVudCBJRCBpbiBoZXggZm9ybWF0XG4gKiBAcmV0dXJucyBiZWNoMzItZW5jb2RlZCBub3RlIHN0cmluZ1xuICogQHRocm93cyB7RXJyb3J9IElmIGV2ZW50SWQgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbm90ZUVuY29kZShldmVudElkOiBzdHJpbmcpOiBzdHJpbmcge1xuICB2YWxpZGF0ZUhleFN0cmluZyhldmVudElkLCA2NCk7XG4gIGNvbnN0IGRhdGEgPSBCdWZmZXIuZnJvbShldmVudElkLCAnaGV4Jyk7XG4gIGNvbnN0IHdvcmRzID0gYmVjaDMyLnRvV29yZHMoZGF0YSk7XG4gIHJldHVybiBiZWNoMzIuZW5jb2RlKCdub3RlJywgd29yZHMsIDEwMDApO1xufVxuXG4vKipcbiAqIEVuY29kZSBwcm9maWxlIGluZm9ybWF0aW9uXG4gKiBAcGFyYW0gcHVia2V5IFB1YmxpYyBrZXkgaW4gaGV4IGZvcm1hdFxuICogQHBhcmFtIHJlbGF5cyBPcHRpb25hbCByZWxheSBVUkxzXG4gKiBAcmV0dXJucyBiZWNoMzItZW5jb2RlZCBucHJvZmlsZSBzdHJpbmdcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBwdWJrZXkgaXMgaW52YWxpZCBvciByZWxheXMgYXJlIG1hbGZvcm1lZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbnByb2ZpbGVFbmNvZGUocHVia2V5OiBzdHJpbmcsIHJlbGF5cz86IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVIZXhTdHJpbmcocHVia2V5LCA2NCk7XG4gIGlmIChyZWxheXMpIHtcbiAgICByZWxheXMuZm9yRWFjaCh2YWxpZGF0ZVJlbGF5VXJsKTtcbiAgfVxuXG4gIGNvbnN0IGRhdGEgPSBlbmNvZGVUTFYoe1xuICAgIHR5cGU6ICducHJvZmlsZScsXG4gICAgZGF0YTogcHVia2V5LFxuICAgIHJlbGF5c1xuICB9KTtcbiAgcmV0dXJuIGJlY2gzMi5lbmNvZGUoJ25wcm9maWxlJywgZGF0YSwgMTAwMCk7XG59XG5cbi8qKlxuICogRW5jb2RlIGV2ZW50IGluZm9ybWF0aW9uXG4gKiBAcGFyYW0gZXZlbnRJZCBFdmVudCBJRCBpbiBoZXggZm9ybWF0XG4gKiBAcGFyYW0gcmVsYXlzIE9wdGlvbmFsIHJlbGF5IFVSTHNcbiAqIEBwYXJhbSBhdXRob3IgT3B0aW9uYWwgYXV0aG9yIHB1YmxpYyBrZXlcbiAqIEBwYXJhbSBraW5kIE9wdGlvbmFsIGV2ZW50IGtpbmRcbiAqIEByZXR1cm5zIGJlY2gzMi1lbmNvZGVkIG5ldmVudCBzdHJpbmdcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBwYXJhbWV0ZXJzIGFyZSBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZXZlbnRFbmNvZGUoXG4gIGV2ZW50SWQ6IHN0cmluZyxcbiAgcmVsYXlzPzogc3RyaW5nW10sXG4gIGF1dGhvcj86IHN0cmluZyxcbiAga2luZD86IG51bWJlclxuKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVIZXhTdHJpbmcoZXZlbnRJZCwgNjQpO1xuICBpZiAocmVsYXlzKSB7XG4gICAgcmVsYXlzLmZvckVhY2godmFsaWRhdGVSZWxheVVybCk7XG4gIH1cbiAgaWYgKGF1dGhvcikge1xuICAgIHZhbGlkYXRlSGV4U3RyaW5nKGF1dGhvciwgNjQpO1xuICB9XG4gIGlmIChraW5kICE9PSB1bmRlZmluZWQgJiYgIU51bWJlci5pc0ludGVnZXIoa2luZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZXZlbnQga2luZCcpO1xuICB9XG5cbiAgY29uc3QgZGF0YSA9IGVuY29kZVRMVih7XG4gICAgdHlwZTogJ25ldmVudCcsXG4gICAgZGF0YTogZXZlbnRJZCxcbiAgICByZWxheXMsXG4gICAgYXV0aG9yLFxuICAgIGtpbmRcbiAgfSk7XG4gIHJldHVybiBiZWNoMzIuZW5jb2RlKCduZXZlbnQnLCBkYXRhLCAxMDAwKTtcbn1cblxuLyoqXG4gKiBFbmNvZGUgYW4gYWRkcmVzcyAoTklQLTMzKVxuICogQHBhcmFtIHB1YmtleSBBdXRob3IncyBwdWJsaWMga2V5XG4gKiBAcGFyYW0ga2luZCBFdmVudCBraW5kXG4gKiBAcGFyYW0gaWRlbnRpZmllciBTdHJpbmcgaWRlbnRpZmllclxuICogQHBhcmFtIHJlbGF5cyBPcHRpb25hbCByZWxheSBVUkxzXG4gKiBAcmV0dXJucyBiZWNoMzItZW5jb2RlZCBuYWRkciBzdHJpbmdcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBwYXJhbWV0ZXJzIGFyZSBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuYWRkckVuY29kZShcbiAgcHVia2V5OiBzdHJpbmcsXG4gIGtpbmQ6IG51bWJlcixcbiAgaWRlbnRpZmllcjogc3RyaW5nLFxuICByZWxheXM/OiBzdHJpbmdbXVxuKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVIZXhTdHJpbmcocHVia2V5LCA2NCk7XG4gIGlmICghTnVtYmVyLmlzSW50ZWdlcihraW5kKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBldmVudCBraW5kJyk7XG4gIH1cbiAgaWYgKCFpZGVudGlmaWVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJZGVudGlmaWVyIGlzIHJlcXVpcmVkJyk7XG4gIH1cbiAgaWYgKHJlbGF5cykge1xuICAgIHJlbGF5cy5mb3JFYWNoKHZhbGlkYXRlUmVsYXlVcmwpO1xuICB9XG5cbiAgY29uc3QgZGF0YSA9IGVuY29kZVRMVih7XG4gICAgdHlwZTogJ25hZGRyJyxcbiAgICBkYXRhOiBwdWJrZXksXG4gICAga2luZCxcbiAgICBpZGVudGlmaWVyLFxuICAgIHJlbGF5c1xuICB9KTtcbiAgcmV0dXJuIGJlY2gzMi5lbmNvZGUoJ25hZGRyJywgZGF0YSwgMTAwMCk7XG59XG5cbi8qKlxuICogRW5jb2RlIGEgcmVsYXkgVVJMXG4gKiBAcGFyYW0gdXJsIFJlbGF5IFVSTFxuICogQHJldHVybnMgYmVjaDMyLWVuY29kZWQgbnJlbGF5IHN0cmluZ1xuICogQHRocm93cyB7RXJyb3J9IElmIFVSTCBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBucmVsYXlFbmNvZGUodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICB2YWxpZGF0ZVJlbGF5VXJsKHVybCk7XG4gIGNvbnN0IGRhdGEgPSBCdWZmZXIuZnJvbSh1cmwsICd1dGY4Jyk7XG4gIGNvbnN0IHdvcmRzID0gYmVjaDMyLnRvV29yZHMoZGF0YSk7XG4gIHJldHVybiBiZWNoMzIuZW5jb2RlKCducmVsYXknLCB3b3JkcywgMTAwMCk7XG59XG5cbi8qKlxuICogRGVjb2RlIGEgYmVjaDMyLWVuY29kZWQgTm9zdHIgZW50aXR5XG4gKiBAcGFyYW0gc3RyIGJlY2gzMi1lbmNvZGVkIHN0cmluZ1xuICogQHJldHVybnMgRGVjb2RlZCBkYXRhIHdpdGggdHlwZSBhbmQgbWV0YWRhdGFcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBzdHJpbmcgaXMgaW52YWxpZCBvciBtYWxmb3JtZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZShzdHI6IHN0cmluZyk6IE5pcDE5RGF0YSB7XG4gIGlmICghc3RyLmluY2x1ZGVzKCcxJykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYmVjaDMyIHN0cmluZycpO1xuICB9XG5cbiAgY29uc3QgcHJlZml4ID0gc3RyLnNwbGl0KCcxJylbMF0udG9Mb3dlckNhc2UoKTtcbiAgaWYgKCFWQUxJRF9QUkVGSVhFUy5pbmNsdWRlcyhwcmVmaXggYXMgTmlwMTlEYXRhVHlwZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcHJlZml4Jyk7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IGRlY29kZWQgPSBiZWNoMzIuZGVjb2RlKHN0ciwgMTAwMCk7XG4gICAgY29uc3QgZGF0YSA9IEJ1ZmZlci5mcm9tKGJlY2gzMi5mcm9tV29yZHMoZGVjb2RlZC53b3JkcykpO1xuXG4gICAgLy8gRm9yIG5yZWxheSB0eXBlXG4gICAgbGV0IHVybDogc3RyaW5nO1xuICAgIC8vIEZvciBUTFYgdHlwZXNcbiAgICBsZXQgZGVjb2RlZERhdGE6IE5pcDE5RGF0YTtcblxuICAgIHN3aXRjaCAoZGVjb2RlZC5wcmVmaXgpIHtcbiAgICAgIGNhc2UgJ25wdWInOlxuICAgICAgY2FzZSAnbnNlYyc6XG4gICAgICBjYXNlICdub3RlJzpcbiAgICAgICAgdmFsaWRhdGVIZXhTdHJpbmcoZGF0YS50b1N0cmluZygnaGV4JyksIDY0KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiBkZWNvZGVkLnByZWZpeCBhcyBOaXAxOURhdGFUeXBlLFxuICAgICAgICAgIGRhdGE6IGRhdGEudG9TdHJpbmcoJ2hleCcpXG4gICAgICAgIH07XG4gICAgICBjYXNlICducmVsYXknOlxuICAgICAgICB1cmwgPSBkYXRhLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgIHZhbGlkYXRlUmVsYXlVcmwodXJsKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiAnbnJlbGF5JyxcbiAgICAgICAgICBkYXRhOiB1cmxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgJ25wcm9maWxlJzpcbiAgICAgIGNhc2UgJ25ldmVudCc6XG4gICAgICBjYXNlICduYWRkcic6XG4gICAgICAgIGRlY29kZWREYXRhID0gZGVjb2RlVExWKGRlY29kZWQucHJlZml4IGFzIE5pcDE5RGF0YVR5cGUsIGRhdGEpO1xuICAgICAgICByZXR1cm4gZGVjb2RlZERhdGE7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcHJlZml4Jyk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJlY2gzMiBzdHJpbmcnKTtcbiAgfVxufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb25zXG5cbmZ1bmN0aW9uIHZhbGlkYXRlSGV4U3RyaW5nKHN0cjogc3RyaW5nLCBsZW5ndGg/OiBudW1iZXIpOiB2b2lkIHtcbiAgaWYgKCEvXlswLTlhLWZBLUZdKyQvLnRlc3Qoc3RyKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBoZXggc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGxlbmd0aCAmJiBzdHIubGVuZ3RoICE9PSBsZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgaGV4IHN0cmluZyBsZW5ndGggKGV4cGVjdGVkICR7bGVuZ3RofSlgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZVJlbGF5VXJsKHVybDogc3RyaW5nKTogdm9pZCB7XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkID0gbmV3IFVSTCh1cmwpO1xuICAgIGlmICghWyd3czonLCAnd3NzOiddLmluY2x1ZGVzKHBhcnNlZC5wcm90b2NvbCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCByZWxheSBVUkwgcHJvdG9jb2wnKTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCByZWxheSBVUkwnKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbmNvZGVUTFYoZGF0YTogTmlwMTlEYXRhKTogbnVtYmVyW10ge1xuICBjb25zdCByZXN1bHQ6IG51bWJlcltdID0gW107XG4gIFxuICAvLyBTcGVjaWFsICh0eXBlIDApOiBtYWluIGRhdGFcbiAgY29uc3QgYnl0ZXMgPSBCdWZmZXIuZnJvbShkYXRhLmRhdGEsICdoZXgnKTtcbiAgcmVzdWx0LnB1c2goVExWX1RZUEVTLlNQRUNJQUwsIGJ5dGVzLmxlbmd0aCk7XG4gIHJlc3VsdC5wdXNoKC4uLmJ5dGVzKTtcblxuICAvLyBSZWxheSAodHlwZSAxKTogcmVsYXkgVVJMc1xuICBpZiAoZGF0YS5yZWxheXM/Lmxlbmd0aCkge1xuICAgIGZvciAoY29uc3QgcmVsYXkgb2YgZGF0YS5yZWxheXMpIHtcbiAgICAgIGNvbnN0IHJlbGF5Qnl0ZXMgPSBCdWZmZXIuZnJvbShyZWxheSwgJ3V0ZjgnKTtcbiAgICAgIHJlc3VsdC5wdXNoKFRMVl9UWVBFUy5SRUxBWSwgcmVsYXlCeXRlcy5sZW5ndGgpO1xuICAgICAgcmVzdWx0LnB1c2goLi4ucmVsYXlCeXRlcyk7XG4gICAgfVxuICB9XG5cbiAgLy8gQXV0aG9yICh0eXBlIDIpOiBhdXRob3IgcHVia2V5XG4gIGlmIChkYXRhLmF1dGhvcikge1xuICAgIGNvbnN0IGF1dGhvckJ5dGVzID0gQnVmZmVyLmZyb20oZGF0YS5hdXRob3IsICdoZXgnKTtcbiAgICByZXN1bHQucHVzaChUTFZfVFlQRVMuQVVUSE9SLCBhdXRob3JCeXRlcy5sZW5ndGgpO1xuICAgIHJlc3VsdC5wdXNoKC4uLmF1dGhvckJ5dGVzKTtcbiAgfVxuXG4gIC8vIEtpbmQgKHR5cGUgMyk6IGV2ZW50IGtpbmRcbiAgaWYgKGRhdGEua2luZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3Qga2luZEJ5dGVzID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgIGtpbmRCeXRlcy53cml0ZVVJbnQzMkJFKGRhdGEua2luZCk7XG4gICAgcmVzdWx0LnB1c2goVExWX1RZUEVTLktJTkQsIGtpbmRCeXRlcy5sZW5ndGgpO1xuICAgIHJlc3VsdC5wdXNoKC4uLmtpbmRCeXRlcyk7XG4gIH1cblxuICAvLyBJZGVudGlmaWVyICh0eXBlIDQpOiBmb3IgbmFkZHJcbiAgaWYgKGRhdGEuaWRlbnRpZmllcikge1xuICAgIGNvbnN0IGlkZW50aWZpZXJCeXRlcyA9IEJ1ZmZlci5mcm9tKGRhdGEuaWRlbnRpZmllciwgJ3V0ZjgnKTtcbiAgICByZXN1bHQucHVzaChUTFZfVFlQRVMuSURFTlRJRklFUiwgaWRlbnRpZmllckJ5dGVzLmxlbmd0aCk7XG4gICAgcmVzdWx0LnB1c2goLi4uaWRlbnRpZmllckJ5dGVzKTtcbiAgfVxuXG4gIHJldHVybiBiZWNoMzIudG9Xb3JkcyhCdWZmZXIuZnJvbShyZXN1bHQpKTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlVExWKHByZWZpeDogTmlwMTlEYXRhVHlwZSwgZGF0YTogQnVmZmVyKTogTmlwMTlEYXRhIHtcbiAgY29uc3QgcmVzdWx0OiBOaXAxOURhdGEgPSB7XG4gICAgdHlwZTogcHJlZml4LFxuICAgIGRhdGE6ICcnLFxuICAgIHJlbGF5czogW11cbiAgfTtcblxuICBsZXQgaSA9IDA7XG4gIC8vIEZvciByZWxheSB0eXBlXG4gIGxldCByZWxheTogc3RyaW5nO1xuXG4gIHdoaWxlIChpIDwgZGF0YS5sZW5ndGgpIHtcbiAgICBjb25zdCB0eXBlID0gZGF0YVtpXTtcbiAgICBjb25zdCBsZW5ndGggPSBkYXRhW2kgKyAxXTtcbiAgICBcbiAgICBpZiAoaSArIDIgKyBsZW5ndGggPiBkYXRhLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFRMViBkYXRhJyk7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHZhbHVlID0gZGF0YS5zbGljZShpICsgMiwgaSArIDIgKyBsZW5ndGgpO1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIFRMVl9UWVBFUy5TUEVDSUFMOlxuICAgICAgICByZXN1bHQuZGF0YSA9IHZhbHVlLnRvU3RyaW5nKCdoZXgnKTtcbiAgICAgICAgdmFsaWRhdGVIZXhTdHJpbmcocmVzdWx0LmRhdGEsIDY0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRMVl9UWVBFUy5SRUxBWTpcbiAgICAgICAgcmVsYXkgPSB2YWx1ZS50b1N0cmluZygndXRmOCcpO1xuICAgICAgICB2YWxpZGF0ZVJlbGF5VXJsKHJlbGF5KTtcbiAgICAgICAgcmVzdWx0LnJlbGF5cyA9IHJlc3VsdC5yZWxheXMgfHwgW107XG4gICAgICAgIHJlc3VsdC5yZWxheXMucHVzaChyZWxheSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUTFZfVFlQRVMuQVVUSE9SOlxuICAgICAgICByZXN1bHQuYXV0aG9yID0gdmFsdWUudG9TdHJpbmcoJ2hleCcpO1xuICAgICAgICB2YWxpZGF0ZUhleFN0cmluZyhyZXN1bHQuYXV0aG9yLCA2NCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUTFZfVFlQRVMuS0lORDpcbiAgICAgICAgcmVzdWx0LmtpbmQgPSB2YWx1ZS5yZWFkVUludDMyQkUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRMVl9UWVBFUy5JREVOVElGSUVSOlxuICAgICAgICByZXN1bHQuaWRlbnRpZmllciA9IHZhbHVlLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gU2tpcCB1bmtub3duIFRMViB0eXBlc1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpICs9IDIgKyBsZW5ndGg7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuIiwgIi8qKlxuICogTklQLTI2OiBEZWxlZ2F0ZWQgRXZlbnQgU2lnbmluZ1xuICogSW1wbGVtZW50cyBkZWxlZ2F0aW9uIG9mIGV2ZW50IHNpZ25pbmcgY2FwYWJpbGl0aWVzXG4gKi9cblxuaW1wb3J0IHsgc2hhMjU2IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGEyLmpzJztcbmltcG9ydCB7IE5vc3RyRXZlbnQgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBzaWduU2Nobm9yciwgdmVyaWZ5U2Nobm9yclNpZ25hdHVyZSB9IGZyb20gJy4uL2NyeXB0byc7XG5pbXBvcnQgeyBieXRlc1RvSGV4LCBoZXhUb0J5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBzY2hub3JyIH0gZnJvbSAnQG5vYmxlL2N1cnZlcy9zZWNwMjU2azEuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIERlbGVnYXRpb25Db25kaXRpb25zIHtcbiAga2luZD86IG51bWJlcjtcbiAgc2luY2U/OiBudW1iZXI7XG4gIHVudGlsPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERlbGVnYXRpb24ge1xuICBkZWxlZ2F0b3I6IHN0cmluZztcbiAgZGVsZWdhdGVlOiBzdHJpbmc7XG4gIGNvbmRpdGlvbnM6IERlbGVnYXRpb25Db25kaXRpb25zO1xuICB0b2tlbjogc3RyaW5nO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGRlbGVnYXRpb24gdG9rZW5cbiAqIEBwYXJhbSBkZWxlZ2F0b3JQcml2YXRlS2V5IERlbGVnYXRvcidzIHByaXZhdGUga2V5ICh1c2VkIGZvciBzaWduaW5nIG9ubHksIG5ldmVyIHJldHVybmVkKVxuICogQHBhcmFtIGRlbGVnYXRlZSBEZWxlZ2F0ZWUncyBwdWJsaWMga2V5XG4gKiBAcGFyYW0gY29uZGl0aW9ucyBEZWxlZ2F0aW9uIGNvbmRpdGlvbnNcbiAqIEByZXR1cm5zIERlbGVnYXRpb24gdG9rZW4gKGRlbGVnYXRvciBmaWVsZCBjb250YWlucyB0aGUgUFVCTElDIGtleSwgbm90IHRoZSBwcml2YXRlIGtleSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURlbGVnYXRpb24oXG4gIGRlbGVnYXRvclByaXZhdGVLZXk6IHN0cmluZyxcbiAgZGVsZWdhdGVlOiBzdHJpbmcsXG4gIGNvbmRpdGlvbnM6IERlbGVnYXRpb25Db25kaXRpb25zXG4pOiBEZWxlZ2F0aW9uIHtcbiAgY29uc3QgY29uZGl0aW9uc1N0cmluZyA9IHNlcmlhbGl6ZUNvbmRpdGlvbnMoY29uZGl0aW9ucyk7XG4gIGNvbnN0IHRva2VuID0gc2lnbkRlbGVnYXRpb24oZGVsZWdhdG9yUHJpdmF0ZUtleSwgZGVsZWdhdGVlLCBjb25kaXRpb25zU3RyaW5nKTtcblxuICAvLyBEZXJpdmUgdGhlIHB1YmxpYyBrZXkgZnJvbSB0aGUgcHJpdmF0ZSBrZXkgXHUyMDE0IE5FVkVSIHJldHVybiB0aGUgcHJpdmF0ZSBrZXlcbiAgY29uc3QgZGVsZWdhdG9yUHVibGljS2V5ID0gYnl0ZXNUb0hleChzY2hub3JyLmdldFB1YmxpY0tleShoZXhUb0J5dGVzKGRlbGVnYXRvclByaXZhdGVLZXkpKSk7XG5cbiAgcmV0dXJuIHtcbiAgICBkZWxlZ2F0b3I6IGRlbGVnYXRvclB1YmxpY0tleSxcbiAgICBkZWxlZ2F0ZWUsXG4gICAgY29uZGl0aW9ucyxcbiAgICB0b2tlblxuICB9O1xufVxuXG4vKipcbiAqIFZlcmlmeSBhIGRlbGVnYXRpb24gdG9rZW5cbiAqIEBwYXJhbSBkZWxlZ2F0aW9uIERlbGVnYXRpb24gdG8gdmVyaWZ5XG4gKiBAcmV0dXJucyBUcnVlIGlmIHZhbGlkLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeURlbGVnYXRpb24oZGVsZWdhdGlvbjogRGVsZWdhdGlvbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCBjb25kaXRpb25zU3RyaW5nID0gc2VyaWFsaXplQ29uZGl0aW9ucyhkZWxlZ2F0aW9uLmNvbmRpdGlvbnMpO1xuICByZXR1cm4gYXdhaXQgdmVyaWZ5RGVsZWdhdGlvblNpZ25hdHVyZShcbiAgICBkZWxlZ2F0aW9uLmRlbGVnYXRvcixcbiAgICBkZWxlZ2F0aW9uLmRlbGVnYXRlZSxcbiAgICBjb25kaXRpb25zU3RyaW5nLFxuICAgIGRlbGVnYXRpb24udG9rZW5cbiAgKTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhbiBldmVudCBtZWV0cyBkZWxlZ2F0aW9uIGNvbmRpdGlvbnNcbiAqIEBwYXJhbSBldmVudCBFdmVudCB0byBjaGVja1xuICogQHBhcmFtIGNvbmRpdGlvbnMgRGVsZWdhdGlvbiBjb25kaXRpb25zXG4gKiBAcmV0dXJucyBUcnVlIGlmIGNvbmRpdGlvbnMgYXJlIG1ldFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tEZWxlZ2F0aW9uQ29uZGl0aW9ucyhcbiAgZXZlbnQ6IE5vc3RyRXZlbnQsXG4gIGNvbmRpdGlvbnM6IERlbGVnYXRpb25Db25kaXRpb25zXG4pOiBib29sZWFuIHtcbiAgaWYgKGNvbmRpdGlvbnMua2luZCAhPT0gdW5kZWZpbmVkICYmIGV2ZW50LmtpbmQgIT09IGNvbmRpdGlvbnMua2luZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChjb25kaXRpb25zLnNpbmNlICE9PSB1bmRlZmluZWQgJiYgZXZlbnQuY3JlYXRlZF9hdCA8IGNvbmRpdGlvbnMuc2luY2UpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoY29uZGl0aW9ucy51bnRpbCAhPT0gdW5kZWZpbmVkICYmIGV2ZW50LmNyZWF0ZWRfYXQgPiBjb25kaXRpb25zLnVudGlsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQWRkIGRlbGVnYXRpb24gdGFnIHRvIGFuIGV2ZW50XG4gKiBAcGFyYW0gZXZlbnQgRXZlbnQgdG8gYWRkIGRlbGVnYXRpb24gdG9cbiAqIEBwYXJhbSBkZWxlZ2F0aW9uIERlbGVnYXRpb24gdG8gYWRkXG4gKiBAcmV0dXJucyBVcGRhdGVkIGV2ZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGREZWxlZ2F0aW9uVGFnKFxuICBldmVudDogTm9zdHJFdmVudCxcbiAgZGVsZWdhdGlvbjogRGVsZWdhdGlvblxuKTogTm9zdHJFdmVudCB7XG4gIGNvbnN0IHRhZyA9IFtcbiAgICAnZGVsZWdhdGlvbicsXG4gICAgZGVsZWdhdGlvbi5kZWxlZ2F0b3IsXG4gICAgc2VyaWFsaXplQ29uZGl0aW9ucyhkZWxlZ2F0aW9uLmNvbmRpdGlvbnMpLFxuICAgIGRlbGVnYXRpb24udG9rZW5cbiAgXTtcblxuICByZXR1cm4ge1xuICAgIC4uLmV2ZW50LFxuICAgIHRhZ3M6IFsuLi5ldmVudC50YWdzLCB0YWddXG4gIH07XG59XG5cbi8qKlxuICogRXh0cmFjdCBkZWxlZ2F0aW9uIGZyb20gYW4gZXZlbnRcbiAqIEBwYXJhbSBldmVudCBFdmVudCB0byBleHRyYWN0IGRlbGVnYXRpb24gZnJvbVxuICogQHJldHVybnMgRGVsZWdhdGlvbiBvciBudWxsIGlmIG5vdCBmb3VuZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdERlbGVnYXRpb24oZXZlbnQ6IE5vc3RyRXZlbnQpOiBEZWxlZ2F0aW9uIHwgbnVsbCB7XG4gIGNvbnN0IHRhZyA9IGV2ZW50LnRhZ3MuZmluZCh0ID0+IHRbMF0gPT09ICdkZWxlZ2F0aW9uJyk7XG4gIGlmICghdGFnIHx8IHRhZy5sZW5ndGggIT09IDQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZGVsZWdhdG9yOiB0YWdbMV0sXG4gICAgZGVsZWdhdGVlOiBldmVudC5wdWJrZXksXG4gICAgY29uZGl0aW9uczogcGFyc2VDb25kaXRpb25zKHRhZ1syXSksXG4gICAgdG9rZW46IHRhZ1szXVxuICB9O1xufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb25zXG5mdW5jdGlvbiBzZXJpYWxpemVDb25kaXRpb25zKGNvbmRpdGlvbnM6IERlbGVnYXRpb25Db25kaXRpb25zKTogc3RyaW5nIHtcbiAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW107XG5cbiAgaWYgKGNvbmRpdGlvbnMua2luZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcGFydHMucHVzaChga2luZD0ke2NvbmRpdGlvbnMua2luZH1gKTtcbiAgfVxuICBpZiAoY29uZGl0aW9ucy5zaW5jZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcGFydHMucHVzaChgY3JlYXRlZF9hdD4ke2NvbmRpdGlvbnMuc2luY2V9YCk7XG4gIH1cbiAgaWYgKGNvbmRpdGlvbnMudW50aWwgIT09IHVuZGVmaW5lZCkge1xuICAgIHBhcnRzLnB1c2goYGNyZWF0ZWRfYXQ8JHtjb25kaXRpb25zLnVudGlsfWApO1xuICB9XG5cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJyYnKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VDb25kaXRpb25zKGNvbmRpdGlvbnNTdHJpbmc6IHN0cmluZyk6IERlbGVnYXRpb25Db25kaXRpb25zIHtcbiAgY29uc3QgY29uZGl0aW9uczogRGVsZWdhdGlvbkNvbmRpdGlvbnMgPSB7fTtcbiAgY29uc3QgcGFydHMgPSBjb25kaXRpb25zU3RyaW5nLnNwbGl0KCcmJyk7XG5cbiAgZm9yIChjb25zdCBwYXJ0IG9mIHBhcnRzKSB7XG4gICAgaWYgKHBhcnQuc3RhcnRzV2l0aCgna2luZD0nKSkge1xuICAgICAgY29uZGl0aW9ucy5raW5kID0gcGFyc2VJbnQocGFydC5zbGljZSg1KSk7XG4gICAgfSBlbHNlIGlmIChwYXJ0LnN0YXJ0c1dpdGgoJ2NyZWF0ZWRfYXQ+JykpIHtcbiAgICAgIGNvbmRpdGlvbnMuc2luY2UgPSBwYXJzZUludChwYXJ0LnNsaWNlKDExKSk7XG4gICAgfSBlbHNlIGlmIChwYXJ0LnN0YXJ0c1dpdGgoJ2NyZWF0ZWRfYXQ8JykpIHtcbiAgICAgIGNvbmRpdGlvbnMudW50aWwgPSBwYXJzZUludChwYXJ0LnNsaWNlKDExKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvbmRpdGlvbnM7XG59XG5cbmZ1bmN0aW9uIHNpZ25EZWxlZ2F0aW9uKFxuICBkZWxlZ2F0b3I6IHN0cmluZyxcbiAgZGVsZWdhdGVlOiBzdHJpbmcsXG4gIGNvbmRpdGlvbnM6IHN0cmluZ1xuKTogc3RyaW5nIHtcbiAgY29uc3QgbWVzc2FnZSA9IGBub3N0cjpkZWxlZ2F0aW9uOiR7ZGVsZWdhdGVlfToke2NvbmRpdGlvbnN9YDtcbiAgY29uc3QgaGFzaCA9IHNoYTI1NihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUobWVzc2FnZSkpO1xuICBjb25zdCBzaWduYXR1cmUgPSBzaWduU2Nobm9ycihoYXNoLCBoZXhUb0J5dGVzKGRlbGVnYXRvcikpO1xuICByZXR1cm4gYnl0ZXNUb0hleChzaWduYXR1cmUpO1xufVxuXG5hc3luYyBmdW5jdGlvbiB2ZXJpZnlEZWxlZ2F0aW9uU2lnbmF0dXJlKFxuICBkZWxlZ2F0b3I6IHN0cmluZyxcbiAgZGVsZWdhdGVlOiBzdHJpbmcsXG4gIGNvbmRpdGlvbnM6IHN0cmluZyxcbiAgc2lnbmF0dXJlOiBzdHJpbmdcbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCBtc2dIYXNoID0gc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShgbm9zdHI6ZGVsZWdhdGlvbjoke2RlbGVnYXRlZX06JHtjb25kaXRpb25zfWApKTtcblxuICByZXR1cm4gdmVyaWZ5U2Nobm9yclNpZ25hdHVyZShoZXhUb0J5dGVzKHNpZ25hdHVyZSksIG1zZ0hhc2gsIGhleFRvQnl0ZXMoZGVsZWdhdG9yKSk7XG59XG4iLCAiLyoqXG4gKiBAbW9kdWxlIG5pcHMvbmlwLTQ0XG4gKiBAZGVzY3JpcHRpb24gSW1wbGVtZW50YXRpb24gb2YgTklQLTQ0IChWZXJzaW9uZWQgRW5jcnlwdGVkIFBheWxvYWRzKVxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci80NC5tZFxuICovXG5cbmltcG9ydCB7IGNoYWNoYTIwIH0gZnJvbSAnQG5vYmxlL2NpcGhlcnMvY2hhY2hhLmpzJztcbmltcG9ydCB7IGVxdWFsQnl0ZXMgfSBmcm9tICdAbm9ibGUvY2lwaGVycy91dGlscy5qcyc7XG5pbXBvcnQgeyBzZWNwMjU2azEgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG5pbXBvcnQgeyBleHRyYWN0IGFzIGhrZGZfZXh0cmFjdCwgZXhwYW5kIGFzIGhrZGZfZXhwYW5kIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9oa2RmLmpzJztcbmltcG9ydCB7IGhtYWMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL2htYWMuanMnO1xuaW1wb3J0IHsgc2hhMjU2IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGEyLmpzJztcbmltcG9ydCB7IGNvbmNhdEJ5dGVzLCBoZXhUb0J5dGVzLCByYW5kb21CeXRlcyB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgYmFzZTY0IH0gZnJvbSAnQHNjdXJlL2Jhc2UnO1xuXG5jb25zdCB1dGY4RW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuY29uc3QgdXRmOERlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcblxuY29uc3QgbWluUGxhaW50ZXh0U2l6ZSA9IDE7XG5jb25zdCBtYXhQbGFpbnRleHRTaXplID0gNjU1MzU7XG5cbi8qKlxuICogQ2FsY3VsYXRlIHBhZGRlZCBsZW5ndGggZm9yIE5JUC00NCBtZXNzYWdlIHBhZGRpbmdcbiAqL1xuZnVuY3Rpb24gY2FsY1BhZGRlZExlbihsZW46IG51bWJlcik6IG51bWJlciB7XG4gIGlmICghTnVtYmVyLmlzU2FmZUludGVnZXIobGVuKSB8fCBsZW4gPCAxKSB0aHJvdyBuZXcgRXJyb3IoJ2V4cGVjdGVkIHBvc2l0aXZlIGludGVnZXInKTtcbiAgaWYgKGxlbiA8PSAzMikgcmV0dXJuIDMyO1xuICBjb25zdCBuZXh0UG93ZXIgPSAxIDw8IChNYXRoLmZsb29yKE1hdGgubG9nMihsZW4gLSAxKSkgKyAxKTtcbiAgY29uc3QgY2h1bmsgPSBuZXh0UG93ZXIgPD0gMjU2ID8gMzIgOiBuZXh0UG93ZXIgLyA4O1xuICByZXR1cm4gY2h1bmsgKiAoTWF0aC5mbG9vcigobGVuIC0gMSkgLyBjaHVuaykgKyAxKTtcbn1cblxuLyoqXG4gKiBQYWQgcGxhaW50ZXh0IHBlciBOSVAtNDQgc3BlY1xuICovXG5mdW5jdGlvbiBwYWQocGxhaW50ZXh0OiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgY29uc3QgdW5wYWRkZWQgPSB1dGY4RW5jb2Rlci5lbmNvZGUocGxhaW50ZXh0KTtcbiAgY29uc3QgdW5wYWRkZWRMZW4gPSB1bnBhZGRlZC5sZW5ndGg7XG4gIGlmICh1bnBhZGRlZExlbiA8IG1pblBsYWludGV4dFNpemUgfHwgdW5wYWRkZWRMZW4gPiBtYXhQbGFpbnRleHRTaXplKVxuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBwbGFpbnRleHQgbGVuZ3RoOiBtdXN0IGJlIGJldHdlZW4gMSBhbmQgNjU1MzUgYnl0ZXMnKTtcbiAgY29uc3QgcHJlZml4ID0gbmV3IFVpbnQ4QXJyYXkoMik7XG4gIG5ldyBEYXRhVmlldyhwcmVmaXguYnVmZmVyKS5zZXRVaW50MTYoMCwgdW5wYWRkZWRMZW4sIGZhbHNlKTsgLy8gYmlnLWVuZGlhblxuICBjb25zdCBzdWZmaXggPSBuZXcgVWludDhBcnJheShjYWxjUGFkZGVkTGVuKHVucGFkZGVkTGVuKSAtIHVucGFkZGVkTGVuKTtcbiAgcmV0dXJuIGNvbmNhdEJ5dGVzKHByZWZpeCwgdW5wYWRkZWQsIHN1ZmZpeCk7XG59XG5cbi8qKlxuICogVW5wYWQgZGVjcnlwdGVkIG1lc3NhZ2UgcGVyIE5JUC00NCBzcGVjXG4gKi9cbmZ1bmN0aW9uIHVucGFkKHBhZGRlZDogVWludDhBcnJheSk6IHN0cmluZyB7XG4gIGNvbnN0IHVucGFkZGVkTGVuID0gbmV3IERhdGFWaWV3KHBhZGRlZC5idWZmZXIsIHBhZGRlZC5ieXRlT2Zmc2V0KS5nZXRVaW50MTYoMCwgZmFsc2UpO1xuICBjb25zdCB1bnBhZGRlZCA9IHBhZGRlZC5zdWJhcnJheSgyLCAyICsgdW5wYWRkZWRMZW4pO1xuICBpZiAoXG4gICAgdW5wYWRkZWRMZW4gPCBtaW5QbGFpbnRleHRTaXplIHx8XG4gICAgdW5wYWRkZWRMZW4gPiBtYXhQbGFpbnRleHRTaXplIHx8XG4gICAgdW5wYWRkZWQubGVuZ3RoICE9PSB1bnBhZGRlZExlbiB8fFxuICAgIHBhZGRlZC5sZW5ndGggIT09IDIgKyBjYWxjUGFkZGVkTGVuKHVucGFkZGVkTGVuKVxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcGFkZGluZycpO1xuICB9XG4gIHJldHVybiB1dGY4RGVjb2Rlci5kZWNvZGUodW5wYWRkZWQpO1xufVxuXG4vKipcbiAqIERlcml2ZSBjb252ZXJzYXRpb24ga2V5IGZyb20gcHJpdmF0ZSBrZXkgYW5kIHB1YmxpYyBrZXkgdXNpbmcgRUNESCArIEhLREZcbiAqL1xuZnVuY3Rpb24gZ2V0Q29udmVyc2F0aW9uS2V5KHByaXZrZXlBOiBVaW50OEFycmF5LCBwdWJrZXlCOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgY29uc3Qgc2hhcmVkUG9pbnQgPSBzZWNwMjU2azEuZ2V0U2hhcmVkU2VjcmV0KHByaXZrZXlBLCBoZXhUb0J5dGVzKCcwMicgKyBwdWJrZXlCKSk7XG4gIGNvbnN0IHNoYXJlZFggPSBzaGFyZWRQb2ludC5zdWJhcnJheSgxLCAzMyk7XG4gIHJldHVybiBoa2RmX2V4dHJhY3Qoc2hhMjU2LCBzaGFyZWRYLCB1dGY4RW5jb2Rlci5lbmNvZGUoJ25pcDQ0LXYyJykpO1xufVxuXG4vKipcbiAqIERlcml2ZSBtZXNzYWdlIGtleXMgKGNoYWNoYSBrZXksIGNoYWNoYSBub25jZSwgaG1hYyBrZXkpIGZyb20gY29udmVyc2F0aW9uIGtleSBhbmQgbm9uY2VcbiAqL1xuZnVuY3Rpb24gZ2V0TWVzc2FnZUtleXMoY29udmVyc2F0aW9uS2V5OiBVaW50OEFycmF5LCBub25jZTogVWludDhBcnJheSk6IHtcbiAgY2hhY2hhX2tleTogVWludDhBcnJheTtcbiAgY2hhY2hhX25vbmNlOiBVaW50OEFycmF5O1xuICBobWFjX2tleTogVWludDhBcnJheTtcbn0ge1xuICBjb25zdCBrZXlzID0gaGtkZl9leHBhbmQoc2hhMjU2LCBjb252ZXJzYXRpb25LZXksIG5vbmNlLCA3Nik7XG4gIHJldHVybiB7XG4gICAgY2hhY2hhX2tleToga2V5cy5zdWJhcnJheSgwLCAzMiksXG4gICAgY2hhY2hhX25vbmNlOiBrZXlzLnN1YmFycmF5KDMyLCA0NCksXG4gICAgaG1hY19rZXk6IGtleXMuc3ViYXJyYXkoNDQsIDc2KSxcbiAgfTtcbn1cblxuLyoqXG4gKiBFbmNyeXB0IHBsYWludGV4dCB1c2luZyBOSVAtNDQgdjJcbiAqIEBwYXJhbSBwbGFpbnRleHQgLSBUaGUgbWVzc2FnZSB0byBlbmNyeXB0XG4gKiBAcGFyYW0gY29udmVyc2F0aW9uS2V5IC0gMzItYnl0ZSBjb252ZXJzYXRpb24ga2V5IGZyb20gZ2V0Q29udmVyc2F0aW9uS2V5XG4gKiBAcGFyYW0gbm9uY2UgLSBPcHRpb25hbCAzMi1ieXRlIG5vbmNlIChyYW5kb20gaWYgbm90IHByb3ZpZGVkKVxuICogQHJldHVybnMgQmFzZTY0LWVuY29kZWQgZW5jcnlwdGVkIHBheWxvYWRcbiAqL1xuZnVuY3Rpb24gZW5jcnlwdChwbGFpbnRleHQ6IHN0cmluZywgY29udmVyc2F0aW9uS2V5OiBVaW50OEFycmF5LCBub25jZTogVWludDhBcnJheSA9IHJhbmRvbUJ5dGVzKDMyKSk6IHN0cmluZyB7XG4gIGNvbnN0IHsgY2hhY2hhX2tleSwgY2hhY2hhX25vbmNlLCBobWFjX2tleSB9ID0gZ2V0TWVzc2FnZUtleXMoY29udmVyc2F0aW9uS2V5LCBub25jZSk7XG4gIGNvbnN0IHBhZGRlZCA9IHBhZChwbGFpbnRleHQpO1xuICBjb25zdCBjaXBoZXJ0ZXh0ID0gY2hhY2hhMjAoY2hhY2hhX2tleSwgY2hhY2hhX25vbmNlLCBwYWRkZWQpO1xuICBjb25zdCBtYWMgPSBobWFjKHNoYTI1NiwgaG1hY19rZXksIGNvbmNhdEJ5dGVzKG5vbmNlLCBjaXBoZXJ0ZXh0KSk7XG4gIHJldHVybiBiYXNlNjQuZW5jb2RlKGNvbmNhdEJ5dGVzKG5ldyBVaW50OEFycmF5KFsyXSksIG5vbmNlLCBjaXBoZXJ0ZXh0LCBtYWMpKTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgTklQLTQ0IHYyIHBheWxvYWRcbiAqIEBwYXJhbSBwYXlsb2FkIC0gQmFzZTY0LWVuY29kZWQgZW5jcnlwdGVkIHBheWxvYWRcbiAqIEBwYXJhbSBjb252ZXJzYXRpb25LZXkgLSAzMi1ieXRlIGNvbnZlcnNhdGlvbiBrZXkgZnJvbSBnZXRDb252ZXJzYXRpb25LZXlcbiAqIEByZXR1cm5zIERlY3J5cHRlZCBwbGFpbnRleHQgc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIGRlY3J5cHQocGF5bG9hZDogc3RyaW5nLCBjb252ZXJzYXRpb25LZXk6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gYmFzZTY0LmRlY29kZShwYXlsb2FkKTtcbiAgY29uc3QgdmVyc2lvbiA9IGRhdGFbMF07XG4gIGlmICh2ZXJzaW9uICE9PSAyKSB0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gZW5jcnlwdGlvbiB2ZXJzaW9uOiAke3ZlcnNpb259YCk7XG4gIGlmIChkYXRhLmxlbmd0aCA8IDk5IHx8IGRhdGEubGVuZ3RoID4gNjU2MDMpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBwYXlsb2FkIHNpemUnKTtcbiAgY29uc3Qgbm9uY2UgPSBkYXRhLnN1YmFycmF5KDEsIDMzKTtcbiAgY29uc3QgY2lwaGVydGV4dCA9IGRhdGEuc3ViYXJyYXkoMzMsIGRhdGEubGVuZ3RoIC0gMzIpO1xuICBjb25zdCBtYWMgPSBkYXRhLnN1YmFycmF5KGRhdGEubGVuZ3RoIC0gMzIpO1xuICBjb25zdCB7IGNoYWNoYV9rZXksIGNoYWNoYV9ub25jZSwgaG1hY19rZXkgfSA9IGdldE1lc3NhZ2VLZXlzKGNvbnZlcnNhdGlvbktleSwgbm9uY2UpO1xuICBjb25zdCBleHBlY3RlZE1hYyA9IGhtYWMoc2hhMjU2LCBobWFjX2tleSwgY29uY2F0Qnl0ZXMobm9uY2UsIGNpcGhlcnRleHQpKTtcbiAgaWYgKCFlcXVhbEJ5dGVzKG1hYywgZXhwZWN0ZWRNYWMpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgTUFDJyk7XG4gIGNvbnN0IHBhZGRlZCA9IGNoYWNoYTIwKGNoYWNoYV9rZXksIGNoYWNoYV9ub25jZSwgY2lwaGVydGV4dCk7XG4gIHJldHVybiB1bnBhZChwYWRkZWQpO1xufVxuXG4vKipcbiAqIHYyIEFQSSBvYmplY3QgbWF0Y2hpbmcgbm9zdHItdG9vbHMgc2hhcGUgZm9yIGNvbXBhdGliaWxpdHlcbiAqL1xuZXhwb3J0IGNvbnN0IHYyID0ge1xuICB1dGlsczoge1xuICAgIGdldENvbnZlcnNhdGlvbktleSxcbiAgICBjYWxjUGFkZGVkTGVuLFxuICB9LFxuICBlbmNyeXB0LFxuICBkZWNyeXB0LFxufTtcblxuZXhwb3J0IHsgZ2V0Q29udmVyc2F0aW9uS2V5LCBlbmNyeXB0LCBkZWNyeXB0LCBjYWxjUGFkZGVkTGVuIH07XG4iLCAiLyoqXG4gKiBAbW9kdWxlIG5pcHMvbmlwLTQ2XG4gKiBAZGVzY3JpcHRpb24gSW1wbGVtZW50YXRpb24gb2YgTklQLTQ2IChOb3N0ciBDb25uZWN0IC8gUmVtb3RlIFNpZ25pbmcpXG4gKlxuICogUHVyZSBwcm90b2NvbCBsYXllciBcdTIwMTQgY3J5cHRvLCBlbmNvZGluZywgbWVzc2FnZSBmb3JtYXR0aW5nLlxuICogTm8gV2ViU29ja2V0LCBubyByZWxheSBjb25uZWN0aW9ucywgbm8gSS9PLlxuICogQ29uc3VtZXJzIHByb3ZpZGUgdGhlaXIgb3duIHRyYW5zcG9ydC5cbiAqXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ2Lm1kXG4gKi9cblxuaW1wb3J0IHsgc2Nobm9yciB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbmltcG9ydCB7IGJ5dGVzVG9IZXgsIGhleFRvQnl0ZXMsIHJhbmRvbUJ5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBzaGEyNTYgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3NoYTIuanMnO1xuaW1wb3J0IHtcbiAgZ2V0Q29udmVyc2F0aW9uS2V5IGFzIG5pcDQ0R2V0Q29udmVyc2F0aW9uS2V5LFxuICBlbmNyeXB0IGFzIG5pcDQ0RW5jcnlwdCxcbiAgZGVjcnlwdCBhcyBuaXA0NERlY3J5cHQsXG59IGZyb20gJy4vbmlwLTQ0JztcbmltcG9ydCB0eXBlIHtcbiAgQnVua2VyVVJJLFxuICBCdW5rZXJWYWxpZGF0aW9uUmVzdWx0LFxuICBOaXA0NlJlcXVlc3QsXG4gIE5pcDQ2UmVzcG9uc2UsXG4gIE5pcDQ2U2Vzc2lvbixcbiAgTmlwNDZTZXNzaW9uSW5mbyxcbiAgU2lnbmVkTm9zdHJFdmVudCxcbn0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgTmlwNDZNZXRob2QgfSBmcm9tICcuLi90eXBlcyc7XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMCAxLiBCdW5rZXIgVVJJIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKipcbiAqIFBhcnNlIGEgYnVua2VyOi8vIFVSSSBpbnRvIGl0cyBjb21wb25lbnRzXG4gKiBAcGFyYW0gdXJpIC0gYnVua2VyOi8vJmx0O3JlbW90ZS1wdWJrZXkmZ3Q7P3JlbGF5PS4uLiZzZWNyZXQ9Li4uXG4gKiBAcmV0dXJucyBQYXJzZWQgQnVua2VyVVJJIG9yIHRocm93cyBvbiBpbnZhbGlkIGlucHV0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJ1bmtlclVSSSh1cmk6IHN0cmluZyk6IEJ1bmtlclVSSSB7XG4gIGlmICghdXJpLnN0YXJ0c1dpdGgoJ2J1bmtlcjovLycpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGJ1bmtlciBVUkk6IG11c3Qgc3RhcnQgd2l0aCBidW5rZXI6Ly8nKTtcbiAgfVxuXG4gIGNvbnN0IHVybCA9IG5ldyBVUkwodXJpLnJlcGxhY2UoJ2J1bmtlcjovLycsICdodHRwczovLycpKTtcbiAgY29uc3QgcmVtb3RlUHVia2V5ID0gdXJsLmhvc3RuYW1lO1xuXG4gIGlmICghL15bMC05YS1mXXs2NH0kLy50ZXN0KHJlbW90ZVB1YmtleSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYnVua2VyIFVSSTogcmVtb3RlIHB1YmtleSBtdXN0IGJlIDY0IGhleCBjaGFyYWN0ZXJzJyk7XG4gIH1cblxuICBjb25zdCByZWxheXMgPSB1cmwuc2VhcmNoUGFyYW1zLmdldEFsbCgncmVsYXknKTtcbiAgaWYgKHJlbGF5cy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYnVua2VyIFVSSTogYXQgbGVhc3Qgb25lIHJlbGF5IGlzIHJlcXVpcmVkJyk7XG4gIH1cblxuICBjb25zdCBzZWNyZXQgPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgnc2VjcmV0JykgfHwgdW5kZWZpbmVkO1xuXG4gIHJldHVybiB7IHJlbW90ZVB1YmtleSwgcmVsYXlzLCBzZWNyZXQgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBidW5rZXI6Ly8gVVJJIHN0cmluZ1xuICogQHBhcmFtIHJlbW90ZVB1YmtleSAtIFJlbW90ZSBzaWduZXIncyBwdWJsaWMga2V5IChoZXgpXG4gKiBAcGFyYW0gcmVsYXlzIC0gUmVsYXkgVVJMc1xuICogQHBhcmFtIHNlY3JldCAtIE9wdGlvbmFsIGNvbm5lY3Rpb24gc2VjcmV0XG4gKiBAcmV0dXJucyBidW5rZXI6Ly8gVVJJIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQnVua2VyVVJJKHJlbW90ZVB1YmtleTogc3RyaW5nLCByZWxheXM6IHN0cmluZ1tdLCBzZWNyZXQ/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIS9eWzAtOWEtZl17NjR9JC8udGVzdChyZW1vdGVQdWJrZXkpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZW1vdGVQdWJrZXkgbXVzdCBiZSA2NCBoZXggY2hhcmFjdGVycycpO1xuICB9XG4gIGlmIChyZWxheXMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhdCBsZWFzdCBvbmUgcmVsYXkgaXMgcmVxdWlyZWQnKTtcbiAgfVxuXG4gIGNvbnN0IHBhcmFtcyA9IHJlbGF5cy5tYXAociA9PiBgcmVsYXk9JHtlbmNvZGVVUklDb21wb25lbnQocil9YCk7XG4gIGlmIChzZWNyZXQpIHtcbiAgICBwYXJhbXMucHVzaChgc2VjcmV0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNlY3JldCl9YCk7XG4gIH1cblxuICByZXR1cm4gYGJ1bmtlcjovLyR7cmVtb3RlUHVia2V5fT8ke3BhcmFtcy5qb2luKCcmJyl9YDtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSBhIGJ1bmtlcjovLyBVUkkgYW5kIHJldHVybiBzdHJ1Y3R1cmVkIHJlc3VsdFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVCdW5rZXJVUkkodXJpOiBzdHJpbmcpOiBCdW5rZXJWYWxpZGF0aW9uUmVzdWx0IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUJ1bmtlclVSSSh1cmkpO1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUsIHVyaTogcGFyc2VkIH07XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6IChlIGFzIEVycm9yKS5tZXNzYWdlIH07XG4gIH1cbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwIDIuIFNlc3Npb24gTWFuYWdlbWVudCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgTklQLTQ2IHNlc3Npb24gd2l0aCBhbiBlcGhlbWVyYWwga2V5cGFpclxuICogQHBhcmFtIHJlbW90ZVB1YmtleSAtIFJlbW90ZSBzaWduZXIncyBwdWJsaWMga2V5IChoZXgpXG4gKiBAcmV0dXJucyBTZXNzaW9uIGNvbnRhaW5pbmcgZXBoZW1lcmFsIGtleXMgYW5kIE5JUC00NCBjb252ZXJzYXRpb24ga2V5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTZXNzaW9uKHJlbW90ZVB1YmtleTogc3RyaW5nKTogTmlwNDZTZXNzaW9uIHtcbiAgaWYgKCEvXlswLTlhLWZdezY0fSQvLnRlc3QocmVtb3RlUHVia2V5KSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVtb3RlUHVia2V5IG11c3QgYmUgNjQgaGV4IGNoYXJhY3RlcnMnKTtcbiAgfVxuXG4gIGNvbnN0IGNsaWVudFNlY3JldEtleUJ5dGVzID0gcmFuZG9tQnl0ZXMoMzIpO1xuICBjb25zdCBjbGllbnRTZWNyZXRLZXkgPSBieXRlc1RvSGV4KGNsaWVudFNlY3JldEtleUJ5dGVzKTtcbiAgY29uc3QgY2xpZW50UHVia2V5Qnl0ZXMgPSBzY2hub3JyLmdldFB1YmxpY0tleShjbGllbnRTZWNyZXRLZXlCeXRlcyk7XG4gIGNvbnN0IGNsaWVudFB1YmtleSA9IGJ5dGVzVG9IZXgoY2xpZW50UHVia2V5Qnl0ZXMpO1xuXG4gIGNvbnN0IGNvbnZlcnNhdGlvbktleSA9IG5pcDQ0R2V0Q29udmVyc2F0aW9uS2V5KGNsaWVudFNlY3JldEtleUJ5dGVzLCByZW1vdGVQdWJrZXkpO1xuXG4gIHJldHVybiB7XG4gICAgY2xpZW50U2VjcmV0S2V5LFxuICAgIGNsaWVudFB1YmtleSxcbiAgICByZW1vdGVQdWJrZXksXG4gICAgY29udmVyc2F0aW9uS2V5LFxuICB9O1xufVxuXG4vKipcbiAqIFJlc3RvcmUgYSBzZXNzaW9uIGZyb20gYSBwcmV2aW91c2x5IHNhdmVkIGVwaGVtZXJhbCBwcml2YXRlIGtleVxuICogQHBhcmFtIGNsaWVudFNlY3JldEtleSAtIEhleC1lbmNvZGVkIGVwaGVtZXJhbCBwcml2YXRlIGtleVxuICogQHBhcmFtIHJlbW90ZVB1YmtleSAtIFJlbW90ZSBzaWduZXIncyBwdWJsaWMga2V5IChoZXgpXG4gKiBAcmV0dXJucyBSZXN0b3JlZCBzZXNzaW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXN0b3JlU2Vzc2lvbihjbGllbnRTZWNyZXRLZXk6IHN0cmluZywgcmVtb3RlUHVia2V5OiBzdHJpbmcpOiBOaXA0NlNlc3Npb24ge1xuICBjb25zdCBjbGllbnRTZWNyZXRLZXlCeXRlcyA9IGhleFRvQnl0ZXMoY2xpZW50U2VjcmV0S2V5KTtcbiAgY29uc3QgY2xpZW50UHVia2V5Qnl0ZXMgPSBzY2hub3JyLmdldFB1YmxpY0tleShjbGllbnRTZWNyZXRLZXlCeXRlcyk7XG4gIGNvbnN0IGNsaWVudFB1YmtleSA9IGJ5dGVzVG9IZXgoY2xpZW50UHVia2V5Qnl0ZXMpO1xuXG4gIGNvbnN0IGNvbnZlcnNhdGlvbktleSA9IG5pcDQ0R2V0Q29udmVyc2F0aW9uS2V5KGNsaWVudFNlY3JldEtleUJ5dGVzLCByZW1vdGVQdWJrZXkpO1xuXG4gIHJldHVybiB7XG4gICAgY2xpZW50U2VjcmV0S2V5LFxuICAgIGNsaWVudFB1YmtleSxcbiAgICByZW1vdGVQdWJrZXksXG4gICAgY29udmVyc2F0aW9uS2V5LFxuICB9O1xufVxuXG4vKipcbiAqIEdldCBwdWJsaWMgc2Vzc2lvbiBpbmZvIChzYWZlIHRvIGV4cG9zZSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNlc3Npb25JbmZvKHNlc3Npb246IE5pcDQ2U2Vzc2lvbik6IE5pcDQ2U2Vzc2lvbkluZm8ge1xuICByZXR1cm4ge1xuICAgIGNsaWVudFB1YmtleTogc2Vzc2lvbi5jbGllbnRQdWJrZXksXG4gICAgcmVtb3RlUHVia2V5OiBzZXNzaW9uLnJlbW90ZVB1YmtleSxcbiAgfTtcbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwIDMuIEpTT04tUlBDIE1lc3NhZ2VzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKipcbiAqIENyZWF0ZSBhIE5JUC00NiBKU09OLVJQQyByZXF1ZXN0XG4gKiBAcGFyYW0gbWV0aG9kIC0gUlBDIG1ldGhvZCBuYW1lXG4gKiBAcGFyYW0gcGFyYW1zIC0gQXJyYXkgb2Ygc3RyaW5nIHBhcmFtZXRlcnNcbiAqIEBwYXJhbSBpZCAtIE9wdGlvbmFsIHJlcXVlc3QgSUQgKHJhbmRvbSBpZiBub3QgcHJvdmlkZWQpXG4gKiBAcmV0dXJucyBKU09OLVJQQyByZXF1ZXN0IG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmVxdWVzdChtZXRob2Q6IE5pcDQ2TWV0aG9kIHwgc3RyaW5nLCBwYXJhbXM6IHN0cmluZ1tdLCBpZD86IHN0cmluZyk6IE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiB7XG4gICAgaWQ6IGlkIHx8IGJ5dGVzVG9IZXgocmFuZG9tQnl0ZXMoMTYpKSxcbiAgICBtZXRob2QsXG4gICAgcGFyYW1zLFxuICB9O1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIE5JUC00NiBKU09OLVJQQyByZXNwb25zZVxuICogQHBhcmFtIGlkIC0gUmVxdWVzdCBJRCBiZWluZyByZXNwb25kZWQgdG9cbiAqIEBwYXJhbSByZXN1bHQgLSBSZXN1bHQgc3RyaW5nIChvbiBzdWNjZXNzKVxuICogQHBhcmFtIGVycm9yIC0gRXJyb3Igc3RyaW5nIChvbiBmYWlsdXJlKVxuICogQHJldHVybnMgSlNPTi1SUEMgcmVzcG9uc2Ugb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSZXNwb25zZShpZDogc3RyaW5nLCByZXN1bHQ/OiBzdHJpbmcsIGVycm9yPzogc3RyaW5nKTogTmlwNDZSZXNwb25zZSB7XG4gIGNvbnN0IHJlc3BvbnNlOiBOaXA0NlJlc3BvbnNlID0geyBpZCB9O1xuICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHJlc3BvbnNlLnJlc3VsdCA9IHJlc3VsdDtcbiAgaWYgKGVycm9yICE9PSB1bmRlZmluZWQpIHJlc3BvbnNlLmVycm9yID0gZXJyb3I7XG4gIHJldHVybiByZXNwb25zZTtcbn1cblxuLyoqXG4gKiBQYXJzZSBhIEpTT04gc3RyaW5nIGludG8gYSBOSVAtNDYgcmVxdWVzdCBvciByZXNwb25zZVxuICogQHBhcmFtIGpzb24gLSBKU09OIHN0cmluZyB0byBwYXJzZVxuICogQHJldHVybnMgUGFyc2VkIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUGF5bG9hZChqc29uOiBzdHJpbmcpOiBOaXA0NlJlcXVlc3QgfCBOaXA0NlJlc3BvbnNlIHtcbiAgY29uc3Qgb2JqID0gSlNPTi5wYXJzZShqc29uKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgaWYgKHR5cGVvZiBvYmouaWQgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIE5JUC00NiBwYXlsb2FkOiBtaXNzaW5nIGlkJyk7XG4gIH1cbiAgcmV0dXJuIG9iaiBhcyB1bmtub3duIGFzIE5pcDQ2UmVxdWVzdCB8IE5pcDQ2UmVzcG9uc2U7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYSBwYXlsb2FkIGlzIGEgTklQLTQ2IHJlcXVlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUmVxdWVzdChwYXlsb2FkOiBOaXA0NlJlcXVlc3QgfCBOaXA0NlJlc3BvbnNlKTogcGF5bG9hZCBpcyBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gJ21ldGhvZCcgaW4gcGF5bG9hZCAmJiAncGFyYW1zJyBpbiBwYXlsb2FkO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgcGF5bG9hZCBpcyBhIE5JUC00NiByZXNwb25zZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZXNwb25zZShwYXlsb2FkOiBOaXA0NlJlcXVlc3QgfCBOaXA0NlJlc3BvbnNlKTogcGF5bG9hZCBpcyBOaXA0NlJlc3BvbnNlIHtcbiAgcmV0dXJuICdyZXN1bHQnIGluIHBheWxvYWQgfHwgJ2Vycm9yJyBpbiBwYXlsb2FkO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgNC4gRXZlbnQgV3JhcHBpbmcgKEtpbmQgMjQxMzMpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKipcbiAqIEVuY3J5cHQgYW5kIHdyYXAgYSBOSVAtNDYgcGF5bG9hZCBpbnRvIGEga2luZCAyNDEzMyBzaWduZWQgZXZlbnRcbiAqIEBwYXJhbSBwYXlsb2FkIC0gSlNPTi1SUEMgcmVxdWVzdCBvciByZXNwb25zZSB0byBlbmNyeXB0XG4gKiBAcGFyYW0gc2Vzc2lvbiAtIE5JUC00NiBzZXNzaW9uXG4gKiBAcGFyYW0gcmVjaXBpZW50UHVia2V5IC0gVGhlIHJlY2lwaWVudCdzIHB1YmtleSAoaGV4KVxuICogQHJldHVybnMgU2lnbmVkIGtpbmQgMjQxMzMgZXZlbnRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyYXBFdmVudChcbiAgcGF5bG9hZDogTmlwNDZSZXF1ZXN0IHwgTmlwNDZSZXNwb25zZSxcbiAgc2Vzc2lvbjogTmlwNDZTZXNzaW9uLFxuICByZWNpcGllbnRQdWJrZXk6IHN0cmluZ1xuKTogUHJvbWlzZTxTaWduZWROb3N0ckV2ZW50PiB7XG4gIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShwYXlsb2FkKTtcbiAgY29uc3QgZW5jcnlwdGVkID0gbmlwNDRFbmNyeXB0KGpzb24sIHNlc3Npb24uY29udmVyc2F0aW9uS2V5KTtcblxuICBjb25zdCBjcmVhdGVkX2F0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gIGNvbnN0IGV2ZW50ID0ge1xuICAgIGtpbmQ6IDI0MTMzLFxuICAgIGNyZWF0ZWRfYXQsXG4gICAgdGFnczogW1sncCcsIHJlY2lwaWVudFB1YmtleV1dLFxuICAgIGNvbnRlbnQ6IGVuY3J5cHRlZCxcbiAgICBwdWJrZXk6IHNlc3Npb24uY2xpZW50UHVia2V5LFxuICB9O1xuXG4gIC8vIFNlcmlhbGl6ZSBmb3IgTklQLTAxIGV2ZW50IElEXG4gIGNvbnN0IHNlcmlhbGl6ZWQgPSBKU09OLnN0cmluZ2lmeShbXG4gICAgMCxcbiAgICBldmVudC5wdWJrZXksXG4gICAgZXZlbnQuY3JlYXRlZF9hdCxcbiAgICBldmVudC5raW5kLFxuICAgIGV2ZW50LnRhZ3MsXG4gICAgZXZlbnQuY29udGVudCxcbiAgXSk7XG5cbiAgY29uc3QgZXZlbnRIYXNoID0gc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZXJpYWxpemVkKSk7XG4gIGNvbnN0IHByaXZhdGVLZXlCeXRlcyA9IGhleFRvQnl0ZXMoc2Vzc2lvbi5jbGllbnRTZWNyZXRLZXkpO1xuICBjb25zdCBzaWduYXR1cmVCeXRlcyA9IHNjaG5vcnIuc2lnbihldmVudEhhc2gsIHByaXZhdGVLZXlCeXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5ldmVudCxcbiAgICBpZDogYnl0ZXNUb0hleChldmVudEhhc2gpLFxuICAgIHNpZzogYnl0ZXNUb0hleChzaWduYXR1cmVCeXRlcyksXG4gIH07XG59XG5cbi8qKlxuICogRGVjcnlwdCBhbmQgcGFyc2UgYSBraW5kIDI0MTMzIGV2ZW50XG4gKiBAcGFyYW0gZXZlbnQgLSBTaWduZWQga2luZCAyNDEzMyBldmVudFxuICogQHBhcmFtIHNlc3Npb24gLSBOSVAtNDYgc2Vzc2lvblxuICogQHJldHVybnMgRGVjcnlwdGVkIEpTT04tUlBDIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVud3JhcEV2ZW50KFxuICBldmVudDogU2lnbmVkTm9zdHJFdmVudCxcbiAgc2Vzc2lvbjogTmlwNDZTZXNzaW9uXG4pOiBOaXA0NlJlcXVlc3QgfCBOaXA0NlJlc3BvbnNlIHtcbiAgaWYgKGV2ZW50LmtpbmQgIT09IDI0MTMzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBleHBlY3RlZCBraW5kIDI0MTMzLCBnb3QgJHtldmVudC5raW5kfWApO1xuICB9XG5cbiAgY29uc3QganNvbiA9IG5pcDQ0RGVjcnlwdChldmVudC5jb250ZW50LCBzZXNzaW9uLmNvbnZlcnNhdGlvbktleSk7XG4gIHJldHVybiBwYXJzZVBheWxvYWQoanNvbik7XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMCA1LiBDb252ZW5pZW5jZSBSZXF1ZXN0IENyZWF0b3JzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKipcbiAqIENyZWF0ZSBhICdjb25uZWN0JyByZXF1ZXN0XG4gKiBAcGFyYW0gcmVtb3RlUHVia2V5IC0gUmVtb3RlIHNpZ25lcidzIHB1YmtleVxuICogQHBhcmFtIHNlY3JldCAtIE9wdGlvbmFsIGNvbm5lY3Rpb24gc2VjcmV0IGZyb20gYnVua2VyIFVSSVxuICogQHBhcmFtIHBlcm1pc3Npb25zIC0gT3B0aW9uYWwgY29tbWEtc2VwYXJhdGVkIHBlcm1pc3Npb24gc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25uZWN0UmVxdWVzdChyZW1vdGVQdWJrZXk6IHN0cmluZywgc2VjcmV0Pzogc3RyaW5nLCBwZXJtaXNzaW9ucz86IHN0cmluZyk6IE5pcDQ2UmVxdWVzdCB7XG4gIGNvbnN0IHBhcmFtcyA9IFtyZW1vdGVQdWJrZXldO1xuICBpZiAoc2VjcmV0KSBwYXJhbXMucHVzaChzZWNyZXQpO1xuICBlbHNlIGlmIChwZXJtaXNzaW9ucykgcGFyYW1zLnB1c2goJycpO1xuICBpZiAocGVybWlzc2lvbnMpIHBhcmFtcy5wdXNoKHBlcm1pc3Npb25zKTtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuQ09OTkVDVCwgcGFyYW1zKTtcbn1cblxuLyoqIENyZWF0ZSBhICdwaW5nJyByZXF1ZXN0ICovXG5leHBvcnQgZnVuY3Rpb24gcGluZ1JlcXVlc3QoKTogTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuUElORywgW10pO1xufVxuXG4vKiogQ3JlYXRlIGEgJ2dldF9wdWJsaWNfa2V5JyByZXF1ZXN0ICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHVibGljS2V5UmVxdWVzdCgpOiBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gY3JlYXRlUmVxdWVzdChOaXA0Nk1ldGhvZC5HRVRfUFVCTElDX0tFWSwgW10pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhICdzaWduX2V2ZW50JyByZXF1ZXN0XG4gKiBAcGFyYW0gZXZlbnRKc29uIC0gSlNPTi1zdHJpbmdpZmllZCB1bnNpZ25lZCBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2lnbkV2ZW50UmVxdWVzdChldmVudEpzb246IHN0cmluZyk6IE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiBjcmVhdGVSZXF1ZXN0KE5pcDQ2TWV0aG9kLlNJR05fRVZFTlQsIFtldmVudEpzb25dKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSAnbmlwMDRfZW5jcnlwdCcgcmVxdWVzdFxuICogQHBhcmFtIHRoaXJkUGFydHlQdWJrZXkgLSBQdWJsaWMga2V5IG9mIHRoZSBtZXNzYWdlIHJlY2lwaWVudFxuICogQHBhcmFtIHBsYWludGV4dCAtIE1lc3NhZ2UgdG8gZW5jcnlwdFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmlwMDRFbmNyeXB0UmVxdWVzdCh0aGlyZFBhcnR5UHVia2V5OiBzdHJpbmcsIHBsYWludGV4dDogc3RyaW5nKTogTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuTklQMDRfRU5DUllQVCwgW3RoaXJkUGFydHlQdWJrZXksIHBsYWludGV4dF0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhICduaXAwNF9kZWNyeXB0JyByZXF1ZXN0XG4gKiBAcGFyYW0gdGhpcmRQYXJ0eVB1YmtleSAtIFB1YmxpYyBrZXkgb2YgdGhlIG1lc3NhZ2Ugc2VuZGVyXG4gKiBAcGFyYW0gY2lwaGVydGV4dCAtIEVuY3J5cHRlZCBtZXNzYWdlIHRvIGRlY3J5cHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5pcDA0RGVjcnlwdFJlcXVlc3QodGhpcmRQYXJ0eVB1YmtleTogc3RyaW5nLCBjaXBoZXJ0ZXh0OiBzdHJpbmcpOiBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gY3JlYXRlUmVxdWVzdChOaXA0Nk1ldGhvZC5OSVAwNF9ERUNSWVBULCBbdGhpcmRQYXJ0eVB1YmtleSwgY2lwaGVydGV4dF0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhICduaXA0NF9lbmNyeXB0JyByZXF1ZXN0XG4gKiBAcGFyYW0gdGhpcmRQYXJ0eVB1YmtleSAtIFB1YmxpYyBrZXkgb2YgdGhlIG1lc3NhZ2UgcmVjaXBpZW50XG4gKiBAcGFyYW0gcGxhaW50ZXh0IC0gTWVzc2FnZSB0byBlbmNyeXB0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuaXA0NEVuY3J5cHRSZXF1ZXN0KHRoaXJkUGFydHlQdWJrZXk6IHN0cmluZywgcGxhaW50ZXh0OiBzdHJpbmcpOiBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gY3JlYXRlUmVxdWVzdChOaXA0Nk1ldGhvZC5OSVA0NF9FTkNSWVBULCBbdGhpcmRQYXJ0eVB1YmtleSwgcGxhaW50ZXh0XSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgJ25pcDQ0X2RlY3J5cHQnIHJlcXVlc3RcbiAqIEBwYXJhbSB0aGlyZFBhcnR5UHVia2V5IC0gUHVibGljIGtleSBvZiB0aGUgbWVzc2FnZSBzZW5kZXJcbiAqIEBwYXJhbSBjaXBoZXJ0ZXh0IC0gRW5jcnlwdGVkIG1lc3NhZ2UgdG8gZGVjcnlwdFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmlwNDREZWNyeXB0UmVxdWVzdCh0aGlyZFBhcnR5UHVia2V5OiBzdHJpbmcsIGNpcGhlcnRleHQ6IHN0cmluZyk6IE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiBjcmVhdGVSZXF1ZXN0KE5pcDQ2TWV0aG9kLk5JUDQ0X0RFQ1JZUFQsIFt0aGlyZFBhcnR5UHVia2V5LCBjaXBoZXJ0ZXh0XSk7XG59XG5cbi8qKiBDcmVhdGUgYSAnZ2V0X3JlbGF5cycgcmVxdWVzdCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJlbGF5c1JlcXVlc3QoKTogTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuR0VUX1JFTEFZUywgW10pO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgNi4gRmlsdGVyIEhlbHBlciBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBDcmVhdGUgYSBOb3N0ciBmaWx0ZXIgZm9yIHN1YnNjcmliaW5nIHRvIE5JUC00NiByZXNwb25zZSBldmVudHNcbiAqIEBwYXJhbSBjbGllbnRQdWJrZXkgLSBPdXIgZXBoZW1lcmFsIHB1YmxpYyBrZXkgKGhleClcbiAqIEBwYXJhbSBzaW5jZSAtIE9wdGlvbmFsIHNpbmNlIHRpbWVzdGFtcFxuICogQHJldHVybnMgRmlsdGVyIG9iamVjdCBmb3Iga2luZCAyNDEzMyBldmVudHMgdGFnZ2VkIHRvIHVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSZXNwb25zZUZpbHRlcihcbiAgY2xpZW50UHVia2V5OiBzdHJpbmcsXG4gIHNpbmNlPzogbnVtYmVyXG4pOiB7IGtpbmRzOiBudW1iZXJbXTsgJyNwJzogc3RyaW5nW107IHNpbmNlPzogbnVtYmVyIH0ge1xuICBjb25zdCBmaWx0ZXI6IHsga2luZHM6IG51bWJlcltdOyAnI3AnOiBzdHJpbmdbXTsgc2luY2U/OiBudW1iZXIgfSA9IHtcbiAgICBraW5kczogWzI0MTMzXSxcbiAgICAnI3AnOiBbY2xpZW50UHVia2V5XSxcbiAgfTtcbiAgaWYgKHNpbmNlICE9PSB1bmRlZmluZWQpIHtcbiAgICBmaWx0ZXIuc2luY2UgPSBzaW5jZTtcbiAgfVxuICByZXR1cm4gZmlsdGVyO1xufVxuIiwgIi8qKlxuICogQG1vZHVsZSBuaXBzL25pcC00OVxuICogQGRlc2NyaXB0aW9uIEltcGxlbWVudGF0aW9uIG9mIE5JUC00OSAoUHJpdmF0ZSBLZXkgRW5jcnlwdGlvbiAvIG5jcnlwdHNlYylcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDkubWRcbiAqL1xuXG5pbXBvcnQgeyB4Y2hhY2hhMjBwb2x5MTMwNSB9IGZyb20gJ0Bub2JsZS9jaXBoZXJzL2NoYWNoYS5qcyc7XG5pbXBvcnQgeyBzY3J5cHQgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3NjcnlwdC5qcyc7XG5pbXBvcnQgeyBjb25jYXRCeXRlcywgcmFuZG9tQnl0ZXMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IGJlY2gzMiBhcyBzY3VyZUJlY2gzMiB9IGZyb20gJ0BzY3VyZS9iYXNlJztcblxudHlwZSBLZXlTZWN1cml0eUJ5dGUgPSAweDAwIHwgMHgwMSB8IDB4MDI7XG5cbi8qKlxuICogRW5jcnlwdCBhIE5vc3RyIHByaXZhdGUga2V5IHdpdGggYSBwYXNzd29yZCwgcHJvZHVjaW5nIGFuIG5jcnlwdHNlYyBiZWNoMzIgc3RyaW5nXG4gKiBAcGFyYW0gc2VjIC0gMzItYnl0ZSBzZWNyZXQga2V5XG4gKiBAcGFyYW0gcGFzc3dvcmQgLSBQYXNzd29yZCBmb3IgZW5jcnlwdGlvblxuICogQHBhcmFtIGxvZ24gLSBTY3J5cHQgbG9nMihOKSBwYXJhbWV0ZXIgKGRlZmF1bHQ6IDE2LCBtZWFuaW5nIE49NjU1MzYpXG4gKiBAcGFyYW0ga3NiIC0gS2V5IHNlY3VyaXR5IGJ5dGU6IDB4MDA9dW5rbm93biwgMHgwMT11bnNhZmUsIDB4MDI9c2FmZSAoZGVmYXVsdDogMHgwMilcbiAqIEByZXR1cm5zIGJlY2gzMi1lbmNvZGVkIG5jcnlwdHNlYyBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY3J5cHQoXG4gIHNlYzogVWludDhBcnJheSxcbiAgcGFzc3dvcmQ6IHN0cmluZyxcbiAgbG9nbjogbnVtYmVyID0gMTYsXG4gIGtzYjogS2V5U2VjdXJpdHlCeXRlID0gMHgwMlxuKTogc3RyaW5nIHtcbiAgY29uc3Qgc2FsdCA9IHJhbmRvbUJ5dGVzKDE2KTtcbiAgY29uc3QgbiA9IDIgKiogbG9nbjtcbiAgY29uc3Qgbm9ybWFsaXplZFBhc3N3b3JkID0gcGFzc3dvcmQubm9ybWFsaXplKCdORktDJyk7XG4gIGNvbnN0IGtleSA9IHNjcnlwdChub3JtYWxpemVkUGFzc3dvcmQsIHNhbHQsIHsgTjogbiwgcjogOCwgcDogMSwgZGtMZW46IDMyIH0pO1xuICBjb25zdCBub25jZSA9IHJhbmRvbUJ5dGVzKDI0KTtcbiAgY29uc3QgYWFkID0gVWludDhBcnJheS5mcm9tKFtrc2JdKTtcbiAgY29uc3QgY2lwaGVyID0geGNoYWNoYTIwcG9seTEzMDUoa2V5LCBub25jZSwgYWFkKTtcbiAgY29uc3QgY2lwaGVydGV4dCA9IGNpcGhlci5lbmNyeXB0KHNlYyk7XG4gIC8vIEJpbmFyeSBmb3JtYXQ6IHZlcnNpb24oMSkgKyBsb2duKDEpICsgc2FsdCgxNikgKyBub25jZSgyNCkgKyBrc2IoMSkgKyBjaXBoZXJ0ZXh0KDQ4ID0gMzIgKyAxNiB0YWcpXG4gIGNvbnN0IHBheWxvYWQgPSBjb25jYXRCeXRlcyhcbiAgICBVaW50OEFycmF5LmZyb20oWzB4MDJdKSxcbiAgICBVaW50OEFycmF5LmZyb20oW2xvZ25dKSxcbiAgICBzYWx0LFxuICAgIG5vbmNlLFxuICAgIGFhZCxcbiAgICBjaXBoZXJ0ZXh0XG4gICk7XG4gIGNvbnN0IHdvcmRzID0gc2N1cmVCZWNoMzIudG9Xb3JkcyhwYXlsb2FkKTtcbiAgcmV0dXJuIHNjdXJlQmVjaDMyLmVuY29kZSgnbmNyeXB0c2VjJywgd29yZHMsIDIwMCk7XG59XG5cbi8qKlxuICogRGVjcnlwdCBhbiBuY3J5cHRzZWMgYmVjaDMyIHN0cmluZyBiYWNrIHRvIHRoZSAzMi1ieXRlIHNlY3JldCBrZXlcbiAqIEBwYXJhbSBuY3J5cHRzZWMgLSBiZWNoMzItZW5jb2RlZCBuY3J5cHRzZWMgc3RyaW5nXG4gKiBAcGFyYW0gcGFzc3dvcmQgLSBQYXNzd29yZCB1c2VkIGZvciBlbmNyeXB0aW9uXG4gKiBAcmV0dXJucyAzMi1ieXRlIHNlY3JldCBrZXkgYXMgVWludDhBcnJheVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjcnlwdChuY3J5cHRzZWM6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICBjb25zdCB7IHByZWZpeCwgd29yZHMgfSA9IHNjdXJlQmVjaDMyLmRlY29kZShuY3J5cHRzZWMgYXMgYCR7c3RyaW5nfTEke3N0cmluZ31gLCAyMDApO1xuICBpZiAocHJlZml4ICE9PSAnbmNyeXB0c2VjJykgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIG5jcnlwdHNlYyBwcmVmaXgnKTtcbiAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KHNjdXJlQmVjaDMyLmZyb21Xb3Jkcyh3b3JkcykpO1xuICBjb25zdCB2ZXJzaW9uID0gZGF0YVswXTtcbiAgaWYgKHZlcnNpb24gIT09IDB4MDIpIHRocm93IG5ldyBFcnJvcihgdW5rbm93biBuY3J5cHRzZWMgdmVyc2lvbjogJHt2ZXJzaW9ufWApO1xuICBjb25zdCBsb2duID0gZGF0YVsxXTtcbiAgY29uc3Qgc2FsdCA9IGRhdGEuc3ViYXJyYXkoMiwgMTgpO1xuICBjb25zdCBub25jZSA9IGRhdGEuc3ViYXJyYXkoMTgsIDQyKTtcbiAgY29uc3Qga3NiID0gZGF0YVs0Ml07XG4gIGNvbnN0IGNpcGhlcnRleHQgPSBkYXRhLnN1YmFycmF5KDQzKTtcbiAgY29uc3QgbiA9IDIgKiogbG9nbjtcbiAgY29uc3Qgbm9ybWFsaXplZFBhc3N3b3JkID0gcGFzc3dvcmQubm9ybWFsaXplKCdORktDJyk7XG4gIGNvbnN0IGtleSA9IHNjcnlwdChub3JtYWxpemVkUGFzc3dvcmQsIHNhbHQsIHsgTjogbiwgcjogOCwgcDogMSwgZGtMZW46IDMyIH0pO1xuICBjb25zdCBhYWQgPSBVaW50OEFycmF5LmZyb20oW2tzYl0pO1xuICBjb25zdCBjaXBoZXIgPSB4Y2hhY2hhMjBwb2x5MTMwNShrZXksIG5vbmNlLCBhYWQpO1xuICByZXR1cm4gY2lwaGVyLmRlY3J5cHQoY2lwaGVydGV4dCk7XG59XG4iLCAiLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9ucyBmb3IgZW5jb2RpbmcgYW5kIGRlY29kaW5nIGRhdGFcbiAqL1xuXG4vKipcbiAqIENvbnZlcnQgYSBoZXggc3RyaW5nIHRvIFVpbnQ4QXJyYXlcbiAqIEBwYXJhbSBoZXggSGV4IHN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBVaW50OEFycmF5IG9mIGJ5dGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoZXhUb0J5dGVzKGhleDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShoZXgubGVuZ3RoIC8gMik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoZXgubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgYnl0ZXNbaSAvIDJdID0gcGFyc2VJbnQoaGV4LnNsaWNlKGksIGkgKyAyKSwgMTYpO1xuICAgIH1cbiAgICByZXR1cm4gYnl0ZXM7XG59XG5cbi8qKlxuICogQ29udmVydCBVaW50OEFycmF5IHRvIGhleCBzdHJpbmdcbiAqIEBwYXJhbSBieXRlcyBVaW50OEFycmF5IHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIEhleCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVzVG9IZXgoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICAgIHJldHVybiBBcnJheS5mcm9tKGJ5dGVzKVxuICAgICAgICAubWFwKGIgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSlcbiAgICAgICAgLmpvaW4oJycpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBVVEYtOCBzdHJpbmcgdG8gVWludDhBcnJheVxuICogQHBhcmFtIHN0ciBVVEYtOCBzdHJpbmcgdG8gY29udmVydFxuICogQHJldHVybnMgVWludDhBcnJheSBvZiBieXRlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdXRmOFRvQnl0ZXMoc3RyOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgICByZXR1cm4gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHN0cik7XG59XG5cbi8qKlxuICogQ29udmVydCBVaW50OEFycmF5IHRvIFVURi04IHN0cmluZ1xuICogQHBhcmFtIGJ5dGVzIFVpbnQ4QXJyYXkgdG8gY29udmVydFxuICogQHJldHVybnMgVVRGLTggc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvVXRmOChieXRlczogVWludDhBcnJheSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShieXRlcyk7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsTUFNVztBQU5YO0FBQUE7QUFNTyxNQUFJLFVBQVU7QUFBQSxRQUNqQixLQUFLLEVBQUUsVUFBVSxjQUFjLFdBQVcsT0FBTztBQUFBLFFBQ2pELFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxRQUNULFFBQVE7QUFBQSxRQUNSLFFBQVE7QUFBQSxRQUNSLFVBQVUsU0FBVSxJQUFJO0FBQ3BCLGNBQUksT0FBTyxNQUFNLFVBQVUsTUFBTSxLQUFLLFdBQVcsQ0FBQztBQUNsRCxrQkFBUSxRQUFRLEVBQUUsS0FBSyxXQUFZO0FBQUUsZUFBRyxNQUFNLE1BQU0sSUFBSTtBQUFBLFVBQUcsQ0FBQztBQUFBLFFBQ2hFO0FBQUEsTUFDSjtBQUFBO0FBQUE7OztBQ2hCQTtBQUFBO0FBQUE7QUFBQTtBQUNBLGVBQVMsYUFBYyxHQUFHO0FBQ3hCLFlBQUk7QUFBRSxpQkFBTyxLQUFLLFVBQVUsQ0FBQztBQUFBLFFBQUUsU0FBUSxHQUFHO0FBQUUsaUJBQU87QUFBQSxRQUFlO0FBQUEsTUFDcEU7QUFFQSxhQUFPLFVBQVU7QUFFakIsZUFBUyxPQUFPLEdBQUcsTUFBTSxNQUFNO0FBQzdCLFlB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LFFBQVE7QUFDckMsZUFBVyxNQUFNLFlBQVksVUFBVSxJQUFJLFFBQVEsR0FBRyxHQUFJO0FBRTFELFVBQU0sYUFBYTtBQUFBLEVBQ3ZCO0FBRUEsV0FBUyxrQkFBa0I7QUFDdkIsVUFBTSxjQUFjLE1BQU0sU0FBUyxNQUFNLE9BQUssRUFBRSxRQUFRO0FBQ3hELFVBQU0sU0FBUyxRQUFRLE9BQUs7QUFBRSxRQUFFLFdBQVcsQ0FBQztBQUFBLElBQWEsQ0FBQztBQUMxRCxXQUFPO0FBQUEsRUFDWDtBQUVBLFdBQVMsV0FBVyxLQUFLO0FBQ3JCLFFBQUksQ0FBQyxJQUFLLFFBQU87QUFDakIsV0FBTyxPQUFPLEdBQUcsRUFBRSxRQUFRLE1BQU0sT0FBTyxFQUFFLFFBQVEsTUFBTSxNQUFNLEVBQUUsUUFBUSxNQUFNLE1BQU0sRUFBRSxRQUFRLE1BQU0sUUFBUTtBQUFBLEVBQ2hIO0FBR0EsV0FBUyxpQkFBaUIsb0JBQW9CLFlBQVk7QUFDdEQsVUFBTSxhQUFhO0FBRW5CLE1BQUUscUJBQXFCLEVBQUUsaUJBQWlCLFNBQVMsY0FBYztBQUNqRSxNQUFFLGdCQUFnQixFQUFFLGlCQUFpQixTQUFTLGVBQWU7QUFBQSxFQUNqRSxDQUFDOyIsCiAgIm5hbWVzIjogWyJwaW5vIiwgImxvZ2dlciIsICJ0cmFuc21pdCIsICJsZXZlbCIsICJzZXRPcHRzIiwgInNlbGYiLCAibGVuIiwgImkiLCAibnVtIiwgImxlbjIiLCAiQnVmZmVyIiwgInV0ZjhUb0J5dGVzIiwgImJhc2U2NFRvQnl0ZXMiLCAiaSIsICJhc2NpaVRvQnl0ZXMiLCAiYnl0ZUxlbmd0aCIsICJzdGF0ZSIsICJOb3N0ckV2ZW50S2luZCIsICJOb3N0ck1lc3NhZ2VUeXBlIiwgIk5pcDQ2TWV0aG9kIiwgIk5vc3RyRXZlbnRLaW5kIiwgIl8wbiIsICJfMW4iLCAiXzBuIiwgIl8xbiIsICJudW0iLCAiXzBuIiwgIl8xbiIsICJfMW4iLCAiXzBuIiwgIl8xbiIsICJudW0iLCAibnVtIiwgIl8xbiIsICJfMG4iLCAiXzFuIiwgIndpbmRvdyIsICJfMG4iLCAiXzFuIiwgIndpbmRvdyIsICJfMG4iLCAiZ2V0UHVibGljS2V5IiwgIm51bSIsICJfMm4iLCAiXzBuIiwgIl8xbiIsICJfMG4iLCAiXzFuIiwgIl8ybiIsICJfM24iLCAiXzRuIiwgInBvaW50VG9CeXRlcyIsICJlbmRvIiwgIl8wbiIsICJfMm4iLCAiXzNuIiwgIl8ybiIsICJfMG4iLCAiTG9nTGV2ZWwiLCAicGlubyIsICJjcnlwdG8iLCAiZ2V0Q3J5cHRvIiwgImNyeXB0byJdCn0K
