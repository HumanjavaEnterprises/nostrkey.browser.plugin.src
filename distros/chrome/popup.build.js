(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/qrcode/lib/can-promise.js
  var require_can_promise = __commonJS({
    "node_modules/qrcode/lib/can-promise.js"(exports, module) {
      module.exports = function() {
        return typeof Promise === "function" && Promise.prototype && Promise.prototype.then;
      };
    }
  });

  // node_modules/qrcode/lib/core/utils.js
  var require_utils = __commonJS({
    "node_modules/qrcode/lib/core/utils.js"(exports) {
      var toSJISFunction;
      var CODEWORDS_COUNT = [
        0,
        // Not used
        26,
        44,
        70,
        100,
        134,
        172,
        196,
        242,
        292,
        346,
        404,
        466,
        532,
        581,
        655,
        733,
        815,
        901,
        991,
        1085,
        1156,
        1258,
        1364,
        1474,
        1588,
        1706,
        1828,
        1921,
        2051,
        2185,
        2323,
        2465,
        2611,
        2761,
        2876,
        3034,
        3196,
        3362,
        3532,
        3706
      ];
      exports.getSymbolSize = function getSymbolSize(version) {
        if (!version) throw new Error('"version" cannot be null or undefined');
        if (version < 1 || version > 40) throw new Error('"version" should be in range from 1 to 40');
        return version * 4 + 17;
      };
      exports.getSymbolTotalCodewords = function getSymbolTotalCodewords(version) {
        return CODEWORDS_COUNT[version];
      };
      exports.getBCHDigit = function(data) {
        let digit = 0;
        while (data !== 0) {
          digit++;
          data >>>= 1;
        }
        return digit;
      };
      exports.setToSJISFunction = function setToSJISFunction(f) {
        if (typeof f !== "function") {
          throw new Error('"toSJISFunc" is not a valid function.');
        }
        toSJISFunction = f;
      };
      exports.isKanjiModeEnabled = function() {
        return typeof toSJISFunction !== "undefined";
      };
      exports.toSJIS = function toSJIS(kanji) {
        return toSJISFunction(kanji);
      };
    }
  });

  // node_modules/qrcode/lib/core/error-correction-level.js
  var require_error_correction_level = __commonJS({
    "node_modules/qrcode/lib/core/error-correction-level.js"(exports) {
      exports.L = { bit: 1 };
      exports.M = { bit: 0 };
      exports.Q = { bit: 3 };
      exports.H = { bit: 2 };
      function fromString(string) {
        if (typeof string !== "string") {
          throw new Error("Param is not a string");
        }
        const lcStr = string.toLowerCase();
        switch (lcStr) {
          case "l":
          case "low":
            return exports.L;
          case "m":
          case "medium":
            return exports.M;
          case "q":
          case "quartile":
            return exports.Q;
          case "h":
          case "high":
            return exports.H;
          default:
            throw new Error("Unknown EC Level: " + string);
        }
      }
      exports.isValid = function isValid(level) {
        return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
      };
      exports.from = function from(value, defaultValue) {
        if (exports.isValid(value)) {
          return value;
        }
        try {
          return fromString(value);
        } catch (e) {
          return defaultValue;
        }
      };
    }
  });

  // node_modules/qrcode/lib/core/bit-buffer.js
  var require_bit_buffer = __commonJS({
    "node_modules/qrcode/lib/core/bit-buffer.js"(exports, module) {
      function BitBuffer() {
        this.buffer = [];
        this.length = 0;
      }
      BitBuffer.prototype = {
        get: function(index) {
          const bufIndex = Math.floor(index / 8);
          return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) === 1;
        },
        put: function(num, length) {
          for (let i = 0; i < length; i++) {
            this.putBit((num >>> length - i - 1 & 1) === 1);
          }
        },
        getLengthInBits: function() {
          return this.length;
        },
        putBit: function(bit) {
          const bufIndex = Math.floor(this.length / 8);
          if (this.buffer.length <= bufIndex) {
            this.buffer.push(0);
          }
          if (bit) {
            this.buffer[bufIndex] |= 128 >>> this.length % 8;
          }
          this.length++;
        }
      };
      module.exports = BitBuffer;
    }
  });

  // node_modules/qrcode/lib/core/bit-matrix.js
  var require_bit_matrix = __commonJS({
    "node_modules/qrcode/lib/core/bit-matrix.js"(exports, module) {
      function BitMatrix(size) {
        if (!size || size < 1) {
          throw new Error("BitMatrix size must be defined and greater than 0");
        }
        this.size = size;
        this.data = new Uint8Array(size * size);
        this.reservedBit = new Uint8Array(size * size);
      }
      BitMatrix.prototype.set = function(row, col, value, reserved) {
        const index = row * this.size + col;
        this.data[index] = value;
        if (reserved) this.reservedBit[index] = true;
      };
      BitMatrix.prototype.get = function(row, col) {
        return this.data[row * this.size + col];
      };
      BitMatrix.prototype.xor = function(row, col, value) {
        this.data[row * this.size + col] ^= value;
      };
      BitMatrix.prototype.isReserved = function(row, col) {
        return this.reservedBit[row * this.size + col];
      };
      module.exports = BitMatrix;
    }
  });

  // node_modules/qrcode/lib/core/alignment-pattern.js
  var require_alignment_pattern = __commonJS({
    "node_modules/qrcode/lib/core/alignment-pattern.js"(exports) {
      var getSymbolSize = require_utils().getSymbolSize;
      exports.getRowColCoords = function getRowColCoords(version) {
        if (version === 1) return [];
        const posCount = Math.floor(version / 7) + 2;
        const size = getSymbolSize(version);
        const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
        const positions = [size - 7];
        for (let i = 1; i < posCount - 1; i++) {
          positions[i] = positions[i - 1] - intervals;
        }
        positions.push(6);
        return positions.reverse();
      };
      exports.getPositions = function getPositions(version) {
        const coords = [];
        const pos = exports.getRowColCoords(version);
        const posLength = pos.length;
        for (let i = 0; i < posLength; i++) {
          for (let j = 0; j < posLength; j++) {
            if (i === 0 && j === 0 || // top-left
            i === 0 && j === posLength - 1 || // bottom-left
            i === posLength - 1 && j === 0) {
              continue;
            }
            coords.push([pos[i], pos[j]]);
          }
        }
        return coords;
      };
    }
  });

  // node_modules/qrcode/lib/core/finder-pattern.js
  var require_finder_pattern = __commonJS({
    "node_modules/qrcode/lib/core/finder-pattern.js"(exports) {
      var getSymbolSize = require_utils().getSymbolSize;
      var FINDER_PATTERN_SIZE = 7;
      exports.getPositions = function getPositions(version) {
        const size = getSymbolSize(version);
        return [
          // top-left
          [0, 0],
          // top-right
          [size - FINDER_PATTERN_SIZE, 0],
          // bottom-left
          [0, size - FINDER_PATTERN_SIZE]
        ];
      };
    }
  });

  // node_modules/qrcode/lib/core/mask-pattern.js
  var require_mask_pattern = __commonJS({
    "node_modules/qrcode/lib/core/mask-pattern.js"(exports) {
      exports.Patterns = {
        PATTERN000: 0,
        PATTERN001: 1,
        PATTERN010: 2,
        PATTERN011: 3,
        PATTERN100: 4,
        PATTERN101: 5,
        PATTERN110: 6,
        PATTERN111: 7
      };
      var PenaltyScores = {
        N1: 3,
        N2: 3,
        N3: 40,
        N4: 10
      };
      exports.isValid = function isValid(mask) {
        return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
      };
      exports.from = function from(value) {
        return exports.isValid(value) ? parseInt(value, 10) : void 0;
      };
      exports.getPenaltyN1 = function getPenaltyN1(data) {
        const size = data.size;
        let points = 0;
        let sameCountCol = 0;
        let sameCountRow = 0;
        let lastCol = null;
        let lastRow = null;
        for (let row = 0; row < size; row++) {
          sameCountCol = sameCountRow = 0;
          lastCol = lastRow = null;
          for (let col = 0; col < size; col++) {
            let module2 = data.get(row, col);
            if (module2 === lastCol) {
              sameCountCol++;
            } else {
              if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
              lastCol = module2;
              sameCountCol = 1;
            }
            module2 = data.get(col, row);
            if (module2 === lastRow) {
              sameCountRow++;
            } else {
              if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
              lastRow = module2;
              sameCountRow = 1;
            }
          }
          if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
          if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
        }
        return points;
      };
      exports.getPenaltyN2 = function getPenaltyN2(data) {
        const size = data.size;
        let points = 0;
        for (let row = 0; row < size - 1; row++) {
          for (let col = 0; col < size - 1; col++) {
            const last = data.get(row, col) + data.get(row, col + 1) + data.get(row + 1, col) + data.get(row + 1, col + 1);
            if (last === 4 || last === 0) points++;
          }
        }
        return points * PenaltyScores.N2;
      };
      exports.getPenaltyN3 = function getPenaltyN3(data) {
        const size = data.size;
        let points = 0;
        let bitsCol = 0;
        let bitsRow = 0;
        for (let row = 0; row < size; row++) {
          bitsCol = bitsRow = 0;
          for (let col = 0; col < size; col++) {
            bitsCol = bitsCol << 1 & 2047 | data.get(row, col);
            if (col >= 10 && (bitsCol === 1488 || bitsCol === 93)) points++;
            bitsRow = bitsRow << 1 & 2047 | data.get(col, row);
            if (col >= 10 && (bitsRow === 1488 || bitsRow === 93)) points++;
          }
        }
        return points * PenaltyScores.N3;
      };
      exports.getPenaltyN4 = function getPenaltyN4(data) {
        let darkCount = 0;
        const modulesCount = data.data.length;
        for (let i = 0; i < modulesCount; i++) darkCount += data.data[i];
        const k = Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10);
        return k * PenaltyScores.N4;
      };
      function getMaskAt(maskPattern, i, j) {
        switch (maskPattern) {
          case exports.Patterns.PATTERN000:
            return (i + j) % 2 === 0;
          case exports.Patterns.PATTERN001:
            return i % 2 === 0;
          case exports.Patterns.PATTERN010:
            return j % 3 === 0;
          case exports.Patterns.PATTERN011:
            return (i + j) % 3 === 0;
          case exports.Patterns.PATTERN100:
            return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
          case exports.Patterns.PATTERN101:
            return i * j % 2 + i * j % 3 === 0;
          case exports.Patterns.PATTERN110:
            return (i * j % 2 + i * j % 3) % 2 === 0;
          case exports.Patterns.PATTERN111:
            return (i * j % 3 + (i + j) % 2) % 2 === 0;
          default:
            throw new Error("bad maskPattern:" + maskPattern);
        }
      }
      exports.applyMask = function applyMask(pattern, data) {
        const size = data.size;
        for (let col = 0; col < size; col++) {
          for (let row = 0; row < size; row++) {
            if (data.isReserved(row, col)) continue;
            data.xor(row, col, getMaskAt(pattern, row, col));
          }
        }
      };
      exports.getBestMask = function getBestMask(data, setupFormatFunc) {
        const numPatterns = Object.keys(exports.Patterns).length;
        let bestPattern = 0;
        let lowerPenalty = Infinity;
        for (let p = 0; p < numPatterns; p++) {
          setupFormatFunc(p);
          exports.applyMask(p, data);
          const penalty = exports.getPenaltyN1(data) + exports.getPenaltyN2(data) + exports.getPenaltyN3(data) + exports.getPenaltyN4(data);
          exports.applyMask(p, data);
          if (penalty < lowerPenalty) {
            lowerPenalty = penalty;
            bestPattern = p;
          }
        }
        return bestPattern;
      };
    }
  });

  // node_modules/qrcode/lib/core/error-correction-code.js
  var require_error_correction_code = __commonJS({
    "node_modules/qrcode/lib/core/error-correction-code.js"(exports) {
      var ECLevel = require_error_correction_level();
      var EC_BLOCKS_TABLE = [
        // L  M  Q  H
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        2,
        2,
        1,
        2,
        2,
        4,
        1,
        2,
        4,
        4,
        2,
        4,
        4,
        4,
        2,
        4,
        6,
        5,
        2,
        4,
        6,
        6,
        2,
        5,
        8,
        8,
        4,
        5,
        8,
        8,
        4,
        5,
        8,
        11,
        4,
        8,
        10,
        11,
        4,
        9,
        12,
        16,
        4,
        9,
        16,
        16,
        6,
        10,
        12,
        18,
        6,
        10,
        17,
        16,
        6,
        11,
        16,
        19,
        6,
        13,
        18,
        21,
        7,
        14,
        21,
        25,
        8,
        16,
        20,
        25,
        8,
        17,
        23,
        25,
        9,
        17,
        23,
        34,
        9,
        18,
        25,
        30,
        10,
        20,
        27,
        32,
        12,
        21,
        29,
        35,
        12,
        23,
        34,
        37,
        12,
        25,
        34,
        40,
        13,
        26,
        35,
        42,
        14,
        28,
        38,
        45,
        15,
        29,
        40,
        48,
        16,
        31,
        43,
        51,
        17,
        33,
        45,
        54,
        18,
        35,
        48,
        57,
        19,
        37,
        51,
        60,
        19,
        38,
        53,
        63,
        20,
        40,
        56,
        66,
        21,
        43,
        59,
        70,
        22,
        45,
        62,
        74,
        24,
        47,
        65,
        77,
        25,
        49,
        68,
        81
      ];
      var EC_CODEWORDS_TABLE = [
        // L  M  Q  H
        7,
        10,
        13,
        17,
        10,
        16,
        22,
        28,
        15,
        26,
        36,
        44,
        20,
        36,
        52,
        64,
        26,
        48,
        72,
        88,
        36,
        64,
        96,
        112,
        40,
        72,
        108,
        130,
        48,
        88,
        132,
        156,
        60,
        110,
        160,
        192,
        72,
        130,
        192,
        224,
        80,
        150,
        224,
        264,
        96,
        176,
        260,
        308,
        104,
        198,
        288,
        352,
        120,
        216,
        320,
        384,
        132,
        240,
        360,
        432,
        144,
        280,
        408,
        480,
        168,
        308,
        448,
        532,
        180,
        338,
        504,
        588,
        196,
        364,
        546,
        650,
        224,
        416,
        600,
        700,
        224,
        442,
        644,
        750,
        252,
        476,
        690,
        816,
        270,
        504,
        750,
        900,
        300,
        560,
        810,
        960,
        312,
        588,
        870,
        1050,
        336,
        644,
        952,
        1110,
        360,
        700,
        1020,
        1200,
        390,
        728,
        1050,
        1260,
        420,
        784,
        1140,
        1350,
        450,
        812,
        1200,
        1440,
        480,
        868,
        1290,
        1530,
        510,
        924,
        1350,
        1620,
        540,
        980,
        1440,
        1710,
        570,
        1036,
        1530,
        1800,
        570,
        1064,
        1590,
        1890,
        600,
        1120,
        1680,
        1980,
        630,
        1204,
        1770,
        2100,
        660,
        1260,
        1860,
        2220,
        720,
        1316,
        1950,
        2310,
        750,
        1372,
        2040,
        2430
      ];
      exports.getBlocksCount = function getBlocksCount(version, errorCorrectionLevel) {
        switch (errorCorrectionLevel) {
          case ECLevel.L:
            return EC_BLOCKS_TABLE[(version - 1) * 4 + 0];
          case ECLevel.M:
            return EC_BLOCKS_TABLE[(version - 1) * 4 + 1];
          case ECLevel.Q:
            return EC_BLOCKS_TABLE[(version - 1) * 4 + 2];
          case ECLevel.H:
            return EC_BLOCKS_TABLE[(version - 1) * 4 + 3];
          default:
            return void 0;
        }
      };
      exports.getTotalCodewordsCount = function getTotalCodewordsCount(version, errorCorrectionLevel) {
        switch (errorCorrectionLevel) {
          case ECLevel.L:
            return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0];
          case ECLevel.M:
            return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1];
          case ECLevel.Q:
            return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2];
          case ECLevel.H:
            return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3];
          default:
            return void 0;
        }
      };
    }
  });

  // node_modules/qrcode/lib/core/galois-field.js
  var require_galois_field = __commonJS({
    "node_modules/qrcode/lib/core/galois-field.js"(exports) {
      var EXP_TABLE = new Uint8Array(512);
      var LOG_TABLE = new Uint8Array(256);
      (function initTables() {
        let x = 1;
        for (let i = 0; i < 255; i++) {
          EXP_TABLE[i] = x;
          LOG_TABLE[x] = i;
          x <<= 1;
          if (x & 256) {
            x ^= 285;
          }
        }
        for (let i = 255; i < 512; i++) {
          EXP_TABLE[i] = EXP_TABLE[i - 255];
        }
      })();
      exports.log = function log(n) {
        if (n < 1) throw new Error("log(" + n + ")");
        return LOG_TABLE[n];
      };
      exports.exp = function exp(n) {
        return EXP_TABLE[n];
      };
      exports.mul = function mul(x, y) {
        if (x === 0 || y === 0) return 0;
        return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
      };
    }
  });

  // node_modules/qrcode/lib/core/polynomial.js
  var require_polynomial = __commonJS({
    "node_modules/qrcode/lib/core/polynomial.js"(exports) {
      var GF = require_galois_field();
      exports.mul = function mul(p1, p2) {
        const coeff = new Uint8Array(p1.length + p2.length - 1);
        for (let i = 0; i < p1.length; i++) {
          for (let j = 0; j < p2.length; j++) {
            coeff[i + j] ^= GF.mul(p1[i], p2[j]);
          }
        }
        return coeff;
      };
      exports.mod = function mod(divident, divisor) {
        let result = new Uint8Array(divident);
        while (result.length - divisor.length >= 0) {
          const coeff = result[0];
          for (let i = 0; i < divisor.length; i++) {
            result[i] ^= GF.mul(divisor[i], coeff);
          }
          let offset = 0;
          while (offset < result.length && result[offset] === 0) offset++;
          result = result.slice(offset);
        }
        return result;
      };
      exports.generateECPolynomial = function generateECPolynomial(degree) {
        let poly = new Uint8Array([1]);
        for (let i = 0; i < degree; i++) {
          poly = exports.mul(poly, new Uint8Array([1, GF.exp(i)]));
        }
        return poly;
      };
    }
  });

  // node_modules/qrcode/lib/core/reed-solomon-encoder.js
  var require_reed_solomon_encoder = __commonJS({
    "node_modules/qrcode/lib/core/reed-solomon-encoder.js"(exports, module) {
      var Polynomial = require_polynomial();
      function ReedSolomonEncoder(degree) {
        this.genPoly = void 0;
        this.degree = degree;
        if (this.degree) this.initialize(this.degree);
      }
      ReedSolomonEncoder.prototype.initialize = function initialize2(degree) {
        this.degree = degree;
        this.genPoly = Polynomial.generateECPolynomial(this.degree);
      };
      ReedSolomonEncoder.prototype.encode = function encode(data) {
        if (!this.genPoly) {
          throw new Error("Encoder not initialized");
        }
        const paddedData = new Uint8Array(data.length + this.degree);
        paddedData.set(data);
        const remainder = Polynomial.mod(paddedData, this.genPoly);
        const start = this.degree - remainder.length;
        if (start > 0) {
          const buff = new Uint8Array(this.degree);
          buff.set(remainder, start);
          return buff;
        }
        return remainder;
      };
      module.exports = ReedSolomonEncoder;
    }
  });

  // node_modules/qrcode/lib/core/version-check.js
  var require_version_check = __commonJS({
    "node_modules/qrcode/lib/core/version-check.js"(exports) {
      exports.isValid = function isValid(version) {
        return !isNaN(version) && version >= 1 && version <= 40;
      };
    }
  });

  // node_modules/qrcode/lib/core/regex.js
  var require_regex = __commonJS({
    "node_modules/qrcode/lib/core/regex.js"(exports) {
      var numeric = "[0-9]+";
      var alphanumeric = "[A-Z $%*+\\-./:]+";
      var kanji = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
      kanji = kanji.replace(/u/g, "\\u");
      var byte = "(?:(?![A-Z0-9 $%*+\\-./:]|" + kanji + ")(?:.|[\r\n]))+";
      exports.KANJI = new RegExp(kanji, "g");
      exports.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
      exports.BYTE = new RegExp(byte, "g");
      exports.NUMERIC = new RegExp(numeric, "g");
      exports.ALPHANUMERIC = new RegExp(alphanumeric, "g");
      var TEST_KANJI = new RegExp("^" + kanji + "$");
      var TEST_NUMERIC = new RegExp("^" + numeric + "$");
      var TEST_ALPHANUMERIC = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
      exports.testKanji = function testKanji(str) {
        return TEST_KANJI.test(str);
      };
      exports.testNumeric = function testNumeric(str) {
        return TEST_NUMERIC.test(str);
      };
      exports.testAlphanumeric = function testAlphanumeric(str) {
        return TEST_ALPHANUMERIC.test(str);
      };
    }
  });

  // node_modules/qrcode/lib/core/mode.js
  var require_mode = __commonJS({
    "node_modules/qrcode/lib/core/mode.js"(exports) {
      var VersionCheck = require_version_check();
      var Regex = require_regex();
      exports.NUMERIC = {
        id: "Numeric",
        bit: 1 << 0,
        ccBits: [10, 12, 14]
      };
      exports.ALPHANUMERIC = {
        id: "Alphanumeric",
        bit: 1 << 1,
        ccBits: [9, 11, 13]
      };
      exports.BYTE = {
        id: "Byte",
        bit: 1 << 2,
        ccBits: [8, 16, 16]
      };
      exports.KANJI = {
        id: "Kanji",
        bit: 1 << 3,
        ccBits: [8, 10, 12]
      };
      exports.MIXED = {
        bit: -1
      };
      exports.getCharCountIndicator = function getCharCountIndicator(mode, version) {
        if (!mode.ccBits) throw new Error("Invalid mode: " + mode);
        if (!VersionCheck.isValid(version)) {
          throw new Error("Invalid version: " + version);
        }
        if (version >= 1 && version < 10) return mode.ccBits[0];
        else if (version < 27) return mode.ccBits[1];
        return mode.ccBits[2];
      };
      exports.getBestModeForData = function getBestModeForData(dataStr) {
        if (Regex.testNumeric(dataStr)) return exports.NUMERIC;
        else if (Regex.testAlphanumeric(dataStr)) return exports.ALPHANUMERIC;
        else if (Regex.testKanji(dataStr)) return exports.KANJI;
        else return exports.BYTE;
      };
      exports.toString = function toString(mode) {
        if (mode && mode.id) return mode.id;
        throw new Error("Invalid mode");
      };
      exports.isValid = function isValid(mode) {
        return mode && mode.bit && mode.ccBits;
      };
      function fromString(string) {
        if (typeof string !== "string") {
          throw new Error("Param is not a string");
        }
        const lcStr = string.toLowerCase();
        switch (lcStr) {
          case "numeric":
            return exports.NUMERIC;
          case "alphanumeric":
            return exports.ALPHANUMERIC;
          case "kanji":
            return exports.KANJI;
          case "byte":
            return exports.BYTE;
          default:
            throw new Error("Unknown mode: " + string);
        }
      }
      exports.from = function from(value, defaultValue) {
        if (exports.isValid(value)) {
          return value;
        }
        try {
          return fromString(value);
        } catch (e) {
          return defaultValue;
        }
      };
    }
  });

  // node_modules/qrcode/lib/core/version.js
  var require_version = __commonJS({
    "node_modules/qrcode/lib/core/version.js"(exports) {
      var Utils = require_utils();
      var ECCode = require_error_correction_code();
      var ECLevel = require_error_correction_level();
      var Mode = require_mode();
      var VersionCheck = require_version_check();
      var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
      var G18_BCH = Utils.getBCHDigit(G18);
      function getBestVersionForDataLength(mode, length, errorCorrectionLevel) {
        for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
          if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode)) {
            return currentVersion;
          }
        }
        return void 0;
      }
      function getReservedBitsCount(mode, version) {
        return Mode.getCharCountIndicator(mode, version) + 4;
      }
      function getTotalBitsFromDataArray(segments, version) {
        let totalBits = 0;
        segments.forEach(function(data) {
          const reservedBits = getReservedBitsCount(data.mode, version);
          totalBits += reservedBits + data.getBitsLength();
        });
        return totalBits;
      }
      function getBestVersionForMixedData(segments, errorCorrectionLevel) {
        for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
          const length = getTotalBitsFromDataArray(segments, currentVersion);
          if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
            return currentVersion;
          }
        }
        return void 0;
      }
      exports.from = function from(value, defaultValue) {
        if (VersionCheck.isValid(value)) {
          return parseInt(value, 10);
        }
        return defaultValue;
      };
      exports.getCapacity = function getCapacity(version, errorCorrectionLevel, mode) {
        if (!VersionCheck.isValid(version)) {
          throw new Error("Invalid QR Code version");
        }
        if (typeof mode === "undefined") mode = Mode.BYTE;
        const totalCodewords = Utils.getSymbolTotalCodewords(version);
        const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
        const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
        if (mode === Mode.MIXED) return dataTotalCodewordsBits;
        const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version);
        switch (mode) {
          case Mode.NUMERIC:
            return Math.floor(usableBits / 10 * 3);
          case Mode.ALPHANUMERIC:
            return Math.floor(usableBits / 11 * 2);
          case Mode.KANJI:
            return Math.floor(usableBits / 13);
          case Mode.BYTE:
          default:
            return Math.floor(usableBits / 8);
        }
      };
      exports.getBestVersionForData = function getBestVersionForData(data, errorCorrectionLevel) {
        let seg;
        const ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M);
        if (Array.isArray(data)) {
          if (data.length > 1) {
            return getBestVersionForMixedData(data, ecl);
          }
          if (data.length === 0) {
            return 1;
          }
          seg = data[0];
        } else {
          seg = data;
        }
        return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
      };
      exports.getEncodedBits = function getEncodedBits(version) {
        if (!VersionCheck.isValid(version) || version < 7) {
          throw new Error("Invalid QR Code version");
        }
        let d = version << 12;
        while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
          d ^= G18 << Utils.getBCHDigit(d) - G18_BCH;
        }
        return version << 12 | d;
      };
    }
  });

  // node_modules/qrcode/lib/core/format-info.js
  var require_format_info = __commonJS({
    "node_modules/qrcode/lib/core/format-info.js"(exports) {
      var Utils = require_utils();
      var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
      var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
      var G15_BCH = Utils.getBCHDigit(G15);
      exports.getEncodedBits = function getEncodedBits(errorCorrectionLevel, mask) {
        const data = errorCorrectionLevel.bit << 3 | mask;
        let d = data << 10;
        while (Utils.getBCHDigit(d) - G15_BCH >= 0) {
          d ^= G15 << Utils.getBCHDigit(d) - G15_BCH;
        }
        return (data << 10 | d) ^ G15_MASK;
      };
    }
  });

  // node_modules/qrcode/lib/core/numeric-data.js
  var require_numeric_data = __commonJS({
    "node_modules/qrcode/lib/core/numeric-data.js"(exports, module) {
      var Mode = require_mode();
      function NumericData(data) {
        this.mode = Mode.NUMERIC;
        this.data = data.toString();
      }
      NumericData.getBitsLength = function getBitsLength(length) {
        return 10 * Math.floor(length / 3) + (length % 3 ? length % 3 * 3 + 1 : 0);
      };
      NumericData.prototype.getLength = function getLength() {
        return this.data.length;
      };
      NumericData.prototype.getBitsLength = function getBitsLength() {
        return NumericData.getBitsLength(this.data.length);
      };
      NumericData.prototype.write = function write(bitBuffer) {
        let i, group, value;
        for (i = 0; i + 3 <= this.data.length; i += 3) {
          group = this.data.substr(i, 3);
          value = parseInt(group, 10);
          bitBuffer.put(value, 10);
        }
        const remainingNum = this.data.length - i;
        if (remainingNum > 0) {
          group = this.data.substr(i);
          value = parseInt(group, 10);
          bitBuffer.put(value, remainingNum * 3 + 1);
        }
      };
      module.exports = NumericData;
    }
  });

  // node_modules/qrcode/lib/core/alphanumeric-data.js
  var require_alphanumeric_data = __commonJS({
    "node_modules/qrcode/lib/core/alphanumeric-data.js"(exports, module) {
      var Mode = require_mode();
      var ALPHA_NUM_CHARS = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
        " ",
        "$",
        "%",
        "*",
        "+",
        "-",
        ".",
        "/",
        ":"
      ];
      function AlphanumericData(data) {
        this.mode = Mode.ALPHANUMERIC;
        this.data = data;
      }
      AlphanumericData.getBitsLength = function getBitsLength(length) {
        return 11 * Math.floor(length / 2) + 6 * (length % 2);
      };
      AlphanumericData.prototype.getLength = function getLength() {
        return this.data.length;
      };
      AlphanumericData.prototype.getBitsLength = function getBitsLength() {
        return AlphanumericData.getBitsLength(this.data.length);
      };
      AlphanumericData.prototype.write = function write(bitBuffer) {
        let i;
        for (i = 0; i + 2 <= this.data.length; i += 2) {
          let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;
          value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);
          bitBuffer.put(value, 11);
        }
        if (this.data.length % 2) {
          bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
        }
      };
      module.exports = AlphanumericData;
    }
  });

  // node_modules/qrcode/lib/core/byte-data.js
  var require_byte_data = __commonJS({
    "node_modules/qrcode/lib/core/byte-data.js"(exports, module) {
      var Mode = require_mode();
      function ByteData(data) {
        this.mode = Mode.BYTE;
        if (typeof data === "string") {
          this.data = new TextEncoder().encode(data);
        } else {
          this.data = new Uint8Array(data);
        }
      }
      ByteData.getBitsLength = function getBitsLength(length) {
        return length * 8;
      };
      ByteData.prototype.getLength = function getLength() {
        return this.data.length;
      };
      ByteData.prototype.getBitsLength = function getBitsLength() {
        return ByteData.getBitsLength(this.data.length);
      };
      ByteData.prototype.write = function(bitBuffer) {
        for (let i = 0, l = this.data.length; i < l; i++) {
          bitBuffer.put(this.data[i], 8);
        }
      };
      module.exports = ByteData;
    }
  });

  // node_modules/qrcode/lib/core/kanji-data.js
  var require_kanji_data = __commonJS({
    "node_modules/qrcode/lib/core/kanji-data.js"(exports, module) {
      var Mode = require_mode();
      var Utils = require_utils();
      function KanjiData(data) {
        this.mode = Mode.KANJI;
        this.data = data;
      }
      KanjiData.getBitsLength = function getBitsLength(length) {
        return length * 13;
      };
      KanjiData.prototype.getLength = function getLength() {
        return this.data.length;
      };
      KanjiData.prototype.getBitsLength = function getBitsLength() {
        return KanjiData.getBitsLength(this.data.length);
      };
      KanjiData.prototype.write = function(bitBuffer) {
        let i;
        for (i = 0; i < this.data.length; i++) {
          let value = Utils.toSJIS(this.data[i]);
          if (value >= 33088 && value <= 40956) {
            value -= 33088;
          } else if (value >= 57408 && value <= 60351) {
            value -= 49472;
          } else {
            throw new Error(
              "Invalid SJIS character: " + this.data[i] + "\nMake sure your charset is UTF-8"
            );
          }
          value = (value >>> 8 & 255) * 192 + (value & 255);
          bitBuffer.put(value, 13);
        }
      };
      module.exports = KanjiData;
    }
  });

  // node_modules/dijkstrajs/dijkstra.js
  var require_dijkstra = __commonJS({
    "node_modules/dijkstrajs/dijkstra.js"(exports, module) {
      "use strict";
      var dijkstra = {
        single_source_shortest_paths: function(graph, s, d) {
          var predecessors = {};
          var costs = {};
          costs[s] = 0;
          var open = dijkstra.PriorityQueue.make();
          open.push(s, 0);
          var closest, u, v, cost_of_s_to_u, adjacent_nodes, cost_of_e, cost_of_s_to_u_plus_cost_of_e, cost_of_s_to_v, first_visit;
          while (!open.empty()) {
            closest = open.pop();
            u = closest.value;
            cost_of_s_to_u = closest.cost;
            adjacent_nodes = graph[u] || {};
            for (v in adjacent_nodes) {
              if (adjacent_nodes.hasOwnProperty(v)) {
                cost_of_e = adjacent_nodes[v];
                cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;
                cost_of_s_to_v = costs[v];
                first_visit = typeof costs[v] === "undefined";
                if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
                  costs[v] = cost_of_s_to_u_plus_cost_of_e;
                  open.push(v, cost_of_s_to_u_plus_cost_of_e);
                  predecessors[v] = u;
                }
              }
            }
          }
          if (typeof d !== "undefined" && typeof costs[d] === "undefined") {
            var msg = ["Could not find a path from ", s, " to ", d, "."].join("");
            throw new Error(msg);
          }
          return predecessors;
        },
        extract_shortest_path_from_predecessor_list: function(predecessors, d) {
          var nodes = [];
          var u = d;
          var predecessor;
          while (u) {
            nodes.push(u);
            predecessor = predecessors[u];
            u = predecessors[u];
          }
          nodes.reverse();
          return nodes;
        },
        find_path: function(graph, s, d) {
          var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
          return dijkstra.extract_shortest_path_from_predecessor_list(
            predecessors,
            d
          );
        },
        /**
         * A very naive priority queue implementation.
         */
        PriorityQueue: {
          make: function(opts) {
            var T = dijkstra.PriorityQueue, t = {}, key;
            opts = opts || {};
            for (key in T) {
              if (T.hasOwnProperty(key)) {
                t[key] = T[key];
              }
            }
            t.queue = [];
            t.sorter = opts.sorter || T.default_sorter;
            return t;
          },
          default_sorter: function(a, b) {
            return a.cost - b.cost;
          },
          /**
           * Add a new item to the queue and ensure the highest priority element
           * is at the front of the queue.
           */
          push: function(value, cost) {
            var item = { value, cost };
            this.queue.push(item);
            this.queue.sort(this.sorter);
          },
          /**
           * Return the highest priority element in the queue.
           */
          pop: function() {
            return this.queue.shift();
          },
          empty: function() {
            return this.queue.length === 0;
          }
        }
      };
      if (typeof module !== "undefined") {
        module.exports = dijkstra;
      }
    }
  });

  // node_modules/qrcode/lib/core/segments.js
  var require_segments = __commonJS({
    "node_modules/qrcode/lib/core/segments.js"(exports) {
      var Mode = require_mode();
      var NumericData = require_numeric_data();
      var AlphanumericData = require_alphanumeric_data();
      var ByteData = require_byte_data();
      var KanjiData = require_kanji_data();
      var Regex = require_regex();
      var Utils = require_utils();
      var dijkstra = require_dijkstra();
      function getStringByteLength(str) {
        return unescape(encodeURIComponent(str)).length;
      }
      function getSegments(regex, mode, str) {
        const segments = [];
        let result;
        while ((result = regex.exec(str)) !== null) {
          segments.push({
            data: result[0],
            index: result.index,
            mode,
            length: result[0].length
          });
        }
        return segments;
      }
      function getSegmentsFromString(dataStr) {
        const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
        const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr);
        let byteSegs;
        let kanjiSegs;
        if (Utils.isKanjiModeEnabled()) {
          byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr);
          kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr);
        } else {
          byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr);
          kanjiSegs = [];
        }
        const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);
        return segs.sort(function(s1, s2) {
          return s1.index - s2.index;
        }).map(function(obj) {
          return {
            data: obj.data,
            mode: obj.mode,
            length: obj.length
          };
        });
      }
      function getSegmentBitsLength(length, mode) {
        switch (mode) {
          case Mode.NUMERIC:
            return NumericData.getBitsLength(length);
          case Mode.ALPHANUMERIC:
            return AlphanumericData.getBitsLength(length);
          case Mode.KANJI:
            return KanjiData.getBitsLength(length);
          case Mode.BYTE:
            return ByteData.getBitsLength(length);
        }
      }
      function mergeSegments(segs) {
        return segs.reduce(function(acc, curr) {
          const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
          if (prevSeg && prevSeg.mode === curr.mode) {
            acc[acc.length - 1].data += curr.data;
            return acc;
          }
          acc.push(curr);
          return acc;
        }, []);
      }
      function buildNodes(segs) {
        const nodes = [];
        for (let i = 0; i < segs.length; i++) {
          const seg = segs[i];
          switch (seg.mode) {
            case Mode.NUMERIC:
              nodes.push([
                seg,
                { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
                { data: seg.data, mode: Mode.BYTE, length: seg.length }
              ]);
              break;
            case Mode.ALPHANUMERIC:
              nodes.push([
                seg,
                { data: seg.data, mode: Mode.BYTE, length: seg.length }
              ]);
              break;
            case Mode.KANJI:
              nodes.push([
                seg,
                { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
              ]);
              break;
            case Mode.BYTE:
              nodes.push([
                { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
              ]);
          }
        }
        return nodes;
      }
      function buildGraph(nodes, version) {
        const table = {};
        const graph = { start: {} };
        let prevNodeIds = ["start"];
        for (let i = 0; i < nodes.length; i++) {
          const nodeGroup = nodes[i];
          const currentNodeIds = [];
          for (let j = 0; j < nodeGroup.length; j++) {
            const node = nodeGroup[j];
            const key = "" + i + j;
            currentNodeIds.push(key);
            table[key] = { node, lastCount: 0 };
            graph[key] = {};
            for (let n = 0; n < prevNodeIds.length; n++) {
              const prevNodeId = prevNodeIds[n];
              if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
                graph[prevNodeId][key] = getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
                table[prevNodeId].lastCount += node.length;
              } else {
                if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;
                graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode.getCharCountIndicator(node.mode, version);
              }
            }
          }
          prevNodeIds = currentNodeIds;
        }
        for (let n = 0; n < prevNodeIds.length; n++) {
          graph[prevNodeIds[n]].end = 0;
        }
        return { map: graph, table };
      }
      function buildSingleSegment(data, modesHint) {
        let mode;
        const bestMode = Mode.getBestModeForData(data);
        mode = Mode.from(modesHint, bestMode);
        if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
          throw new Error('"' + data + '" cannot be encoded with mode ' + Mode.toString(mode) + ".\n Suggested mode is: " + Mode.toString(bestMode));
        }
        if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
          mode = Mode.BYTE;
        }
        switch (mode) {
          case Mode.NUMERIC:
            return new NumericData(data);
          case Mode.ALPHANUMERIC:
            return new AlphanumericData(data);
          case Mode.KANJI:
            return new KanjiData(data);
          case Mode.BYTE:
            return new ByteData(data);
        }
      }
      exports.fromArray = function fromArray(array) {
        return array.reduce(function(acc, seg) {
          if (typeof seg === "string") {
            acc.push(buildSingleSegment(seg, null));
          } else if (seg.data) {
            acc.push(buildSingleSegment(seg.data, seg.mode));
          }
          return acc;
        }, []);
      };
      exports.fromString = function fromString(data, version) {
        const segs = getSegmentsFromString(data, Utils.isKanjiModeEnabled());
        const nodes = buildNodes(segs);
        const graph = buildGraph(nodes, version);
        const path = dijkstra.find_path(graph.map, "start", "end");
        const optimizedSegs = [];
        for (let i = 1; i < path.length - 1; i++) {
          optimizedSegs.push(graph.table[path[i]].node);
        }
        return exports.fromArray(mergeSegments(optimizedSegs));
      };
      exports.rawSplit = function rawSplit(data) {
        return exports.fromArray(
          getSegmentsFromString(data, Utils.isKanjiModeEnabled())
        );
      };
    }
  });

  // node_modules/qrcode/lib/core/qrcode.js
  var require_qrcode = __commonJS({
    "node_modules/qrcode/lib/core/qrcode.js"(exports) {
      var Utils = require_utils();
      var ECLevel = require_error_correction_level();
      var BitBuffer = require_bit_buffer();
      var BitMatrix = require_bit_matrix();
      var AlignmentPattern = require_alignment_pattern();
      var FinderPattern = require_finder_pattern();
      var MaskPattern = require_mask_pattern();
      var ECCode = require_error_correction_code();
      var ReedSolomonEncoder = require_reed_solomon_encoder();
      var Version = require_version();
      var FormatInfo = require_format_info();
      var Mode = require_mode();
      var Segments = require_segments();
      function setupFinderPattern(matrix, version) {
        const size = matrix.size;
        const pos = FinderPattern.getPositions(version);
        for (let i = 0; i < pos.length; i++) {
          const row = pos[i][0];
          const col = pos[i][1];
          for (let r = -1; r <= 7; r++) {
            if (row + r <= -1 || size <= row + r) continue;
            for (let c = -1; c <= 7; c++) {
              if (col + c <= -1 || size <= col + c) continue;
              if (r >= 0 && r <= 6 && (c === 0 || c === 6) || c >= 0 && c <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c >= 2 && c <= 4) {
                matrix.set(row + r, col + c, true, true);
              } else {
                matrix.set(row + r, col + c, false, true);
              }
            }
          }
        }
      }
      function setupTimingPattern(matrix) {
        const size = matrix.size;
        for (let r = 8; r < size - 8; r++) {
          const value = r % 2 === 0;
          matrix.set(r, 6, value, true);
          matrix.set(6, r, value, true);
        }
      }
      function setupAlignmentPattern(matrix, version) {
        const pos = AlignmentPattern.getPositions(version);
        for (let i = 0; i < pos.length; i++) {
          const row = pos[i][0];
          const col = pos[i][1];
          for (let r = -2; r <= 2; r++) {
            for (let c = -2; c <= 2; c++) {
              if (r === -2 || r === 2 || c === -2 || c === 2 || r === 0 && c === 0) {
                matrix.set(row + r, col + c, true, true);
              } else {
                matrix.set(row + r, col + c, false, true);
              }
            }
          }
        }
      }
      function setupVersionInfo(matrix, version) {
        const size = matrix.size;
        const bits = Version.getEncodedBits(version);
        let row, col, mod;
        for (let i = 0; i < 18; i++) {
          row = Math.floor(i / 3);
          col = i % 3 + size - 8 - 3;
          mod = (bits >> i & 1) === 1;
          matrix.set(row, col, mod, true);
          matrix.set(col, row, mod, true);
        }
      }
      function setupFormatInfo(matrix, errorCorrectionLevel, maskPattern) {
        const size = matrix.size;
        const bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern);
        let i, mod;
        for (i = 0; i < 15; i++) {
          mod = (bits >> i & 1) === 1;
          if (i < 6) {
            matrix.set(i, 8, mod, true);
          } else if (i < 8) {
            matrix.set(i + 1, 8, mod, true);
          } else {
            matrix.set(size - 15 + i, 8, mod, true);
          }
          if (i < 8) {
            matrix.set(8, size - i - 1, mod, true);
          } else if (i < 9) {
            matrix.set(8, 15 - i - 1 + 1, mod, true);
          } else {
            matrix.set(8, 15 - i - 1, mod, true);
          }
        }
        matrix.set(size - 8, 8, 1, true);
      }
      function setupData(matrix, data) {
        const size = matrix.size;
        let inc = -1;
        let row = size - 1;
        let bitIndex = 7;
        let byteIndex = 0;
        for (let col = size - 1; col > 0; col -= 2) {
          if (col === 6) col--;
          while (true) {
            for (let c = 0; c < 2; c++) {
              if (!matrix.isReserved(row, col - c)) {
                let dark = false;
                if (byteIndex < data.length) {
                  dark = (data[byteIndex] >>> bitIndex & 1) === 1;
                }
                matrix.set(row, col - c, dark);
                bitIndex--;
                if (bitIndex === -1) {
                  byteIndex++;
                  bitIndex = 7;
                }
              }
            }
            row += inc;
            if (row < 0 || size <= row) {
              row -= inc;
              inc = -inc;
              break;
            }
          }
        }
      }
      function createData(version, errorCorrectionLevel, segments) {
        const buffer = new BitBuffer();
        segments.forEach(function(data) {
          buffer.put(data.mode.bit, 4);
          buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version));
          data.write(buffer);
        });
        const totalCodewords = Utils.getSymbolTotalCodewords(version);
        const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
        const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
        if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
          buffer.put(0, 4);
        }
        while (buffer.getLengthInBits() % 8 !== 0) {
          buffer.putBit(0);
        }
        const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
        for (let i = 0; i < remainingByte; i++) {
          buffer.put(i % 2 ? 17 : 236, 8);
        }
        return createCodewords(buffer, version, errorCorrectionLevel);
      }
      function createCodewords(bitBuffer, version, errorCorrectionLevel) {
        const totalCodewords = Utils.getSymbolTotalCodewords(version);
        const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
        const dataTotalCodewords = totalCodewords - ecTotalCodewords;
        const ecTotalBlocks = ECCode.getBlocksCount(version, errorCorrectionLevel);
        const blocksInGroup2 = totalCodewords % ecTotalBlocks;
        const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;
        const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);
        const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
        const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
        const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;
        const rs = new ReedSolomonEncoder(ecCount);
        let offset = 0;
        const dcData = new Array(ecTotalBlocks);
        const ecData = new Array(ecTotalBlocks);
        let maxDataSize = 0;
        const buffer = new Uint8Array(bitBuffer.buffer);
        for (let b = 0; b < ecTotalBlocks; b++) {
          const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;
          dcData[b] = buffer.slice(offset, offset + dataSize);
          ecData[b] = rs.encode(dcData[b]);
          offset += dataSize;
          maxDataSize = Math.max(maxDataSize, dataSize);
        }
        const data = new Uint8Array(totalCodewords);
        let index = 0;
        let i, r;
        for (i = 0; i < maxDataSize; i++) {
          for (r = 0; r < ecTotalBlocks; r++) {
            if (i < dcData[r].length) {
              data[index++] = dcData[r][i];
            }
          }
        }
        for (i = 0; i < ecCount; i++) {
          for (r = 0; r < ecTotalBlocks; r++) {
            data[index++] = ecData[r][i];
          }
        }
        return data;
      }
      function createSymbol(data, version, errorCorrectionLevel, maskPattern) {
        let segments;
        if (Array.isArray(data)) {
          segments = Segments.fromArray(data);
        } else if (typeof data === "string") {
          let estimatedVersion = version;
          if (!estimatedVersion) {
            const rawSegments = Segments.rawSplit(data);
            estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel);
          }
          segments = Segments.fromString(data, estimatedVersion || 40);
        } else {
          throw new Error("Invalid data");
        }
        const bestVersion = Version.getBestVersionForData(segments, errorCorrectionLevel);
        if (!bestVersion) {
          throw new Error("The amount of data is too big to be stored in a QR Code");
        }
        if (!version) {
          version = bestVersion;
        } else if (version < bestVersion) {
          throw new Error(
            "\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: " + bestVersion + ".\n"
          );
        }
        const dataBits = createData(version, errorCorrectionLevel, segments);
        const moduleCount = Utils.getSymbolSize(version);
        const modules = new BitMatrix(moduleCount);
        setupFinderPattern(modules, version);
        setupTimingPattern(modules);
        setupAlignmentPattern(modules, version);
        setupFormatInfo(modules, errorCorrectionLevel, 0);
        if (version >= 7) {
          setupVersionInfo(modules, version);
        }
        setupData(modules, dataBits);
        if (isNaN(maskPattern)) {
          maskPattern = MaskPattern.getBestMask(
            modules,
            setupFormatInfo.bind(null, modules, errorCorrectionLevel)
          );
        }
        MaskPattern.applyMask(maskPattern, modules);
        setupFormatInfo(modules, errorCorrectionLevel, maskPattern);
        return {
          modules,
          version,
          errorCorrectionLevel,
          maskPattern,
          segments
        };
      }
      exports.create = function create(data, options) {
        if (typeof data === "undefined" || data === "") {
          throw new Error("No input text");
        }
        let errorCorrectionLevel = ECLevel.M;
        let version;
        let mask;
        if (typeof options !== "undefined") {
          errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
          version = Version.from(options.version);
          mask = MaskPattern.from(options.maskPattern);
          if (options.toSJISFunc) {
            Utils.setToSJISFunction(options.toSJISFunc);
          }
        }
        return createSymbol(data, version, errorCorrectionLevel, mask);
      };
    }
  });

  // node_modules/qrcode/lib/renderer/utils.js
  var require_utils2 = __commonJS({
    "node_modules/qrcode/lib/renderer/utils.js"(exports) {
      function hex2rgba(hex) {
        if (typeof hex === "number") {
          hex = hex.toString();
        }
        if (typeof hex !== "string") {
          throw new Error("Color should be defined as hex string");
        }
        let hexCode = hex.slice().replace("#", "").split("");
        if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
          throw new Error("Invalid hex color: " + hex);
        }
        if (hexCode.length === 3 || hexCode.length === 4) {
          hexCode = Array.prototype.concat.apply([], hexCode.map(function(c) {
            return [c, c];
          }));
        }
        if (hexCode.length === 6) hexCode.push("F", "F");
        const hexValue = parseInt(hexCode.join(""), 16);
        return {
          r: hexValue >> 24 & 255,
          g: hexValue >> 16 & 255,
          b: hexValue >> 8 & 255,
          a: hexValue & 255,
          hex: "#" + hexCode.slice(0, 6).join("")
        };
      }
      exports.getOptions = function getOptions(options) {
        if (!options) options = {};
        if (!options.color) options.color = {};
        const margin = typeof options.margin === "undefined" || options.margin === null || options.margin < 0 ? 4 : options.margin;
        const width = options.width && options.width >= 21 ? options.width : void 0;
        const scale = options.scale || 4;
        return {
          width,
          scale: width ? 4 : scale,
          margin,
          color: {
            dark: hex2rgba(options.color.dark || "#000000ff"),
            light: hex2rgba(options.color.light || "#ffffffff")
          },
          type: options.type,
          rendererOpts: options.rendererOpts || {}
        };
      };
      exports.getScale = function getScale(qrSize, opts) {
        return opts.width && opts.width >= qrSize + opts.margin * 2 ? opts.width / (qrSize + opts.margin * 2) : opts.scale;
      };
      exports.getImageWidth = function getImageWidth(qrSize, opts) {
        const scale = exports.getScale(qrSize, opts);
        return Math.floor((qrSize + opts.margin * 2) * scale);
      };
      exports.qrToImageData = function qrToImageData(imgData, qr, opts) {
        const size = qr.modules.size;
        const data = qr.modules.data;
        const scale = exports.getScale(size, opts);
        const symbolSize = Math.floor((size + opts.margin * 2) * scale);
        const scaledMargin = opts.margin * scale;
        const palette = [opts.color.light, opts.color.dark];
        for (let i = 0; i < symbolSize; i++) {
          for (let j = 0; j < symbolSize; j++) {
            let posDst = (i * symbolSize + j) * 4;
            let pxColor = opts.color.light;
            if (i >= scaledMargin && j >= scaledMargin && i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
              const iSrc = Math.floor((i - scaledMargin) / scale);
              const jSrc = Math.floor((j - scaledMargin) / scale);
              pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0];
            }
            imgData[posDst++] = pxColor.r;
            imgData[posDst++] = pxColor.g;
            imgData[posDst++] = pxColor.b;
            imgData[posDst] = pxColor.a;
          }
        }
      };
    }
  });

  // node_modules/qrcode/lib/renderer/canvas.js
  var require_canvas = __commonJS({
    "node_modules/qrcode/lib/renderer/canvas.js"(exports) {
      var Utils = require_utils2();
      function clearCanvas(ctx, canvas, size) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!canvas.style) canvas.style = {};
        canvas.height = size;
        canvas.width = size;
        canvas.style.height = size + "px";
        canvas.style.width = size + "px";
      }
      function getCanvasElement() {
        try {
          return document.createElement("canvas");
        } catch (e) {
          throw new Error("You need to specify a canvas element");
        }
      }
      exports.render = function render2(qrData, canvas, options) {
        let opts = options;
        let canvasEl = canvas;
        if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
          opts = canvas;
          canvas = void 0;
        }
        if (!canvas) {
          canvasEl = getCanvasElement();
        }
        opts = Utils.getOptions(opts);
        const size = Utils.getImageWidth(qrData.modules.size, opts);
        const ctx = canvasEl.getContext("2d");
        const image = ctx.createImageData(size, size);
        Utils.qrToImageData(image.data, qrData, opts);
        clearCanvas(ctx, canvasEl, size);
        ctx.putImageData(image, 0, 0);
        return canvasEl;
      };
      exports.renderToDataURL = function renderToDataURL(qrData, canvas, options) {
        let opts = options;
        if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
          opts = canvas;
          canvas = void 0;
        }
        if (!opts) opts = {};
        const canvasEl = exports.render(qrData, canvas, opts);
        const type = opts.type || "image/png";
        const rendererOpts = opts.rendererOpts || {};
        return canvasEl.toDataURL(type, rendererOpts.quality);
      };
    }
  });

  // node_modules/qrcode/lib/renderer/svg-tag.js
  var require_svg_tag = __commonJS({
    "node_modules/qrcode/lib/renderer/svg-tag.js"(exports) {
      var Utils = require_utils2();
      function getColorAttrib(color, attrib) {
        const alpha = color.a / 255;
        const str = attrib + '="' + color.hex + '"';
        return alpha < 1 ? str + " " + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"' : str;
      }
      function svgCmd(cmd, x, y) {
        let str = cmd + x;
        if (typeof y !== "undefined") str += " " + y;
        return str;
      }
      function qrToPath(data, size, margin) {
        let path = "";
        let moveBy = 0;
        let newRow = false;
        let lineLength = 0;
        for (let i = 0; i < data.length; i++) {
          const col = Math.floor(i % size);
          const row = Math.floor(i / size);
          if (!col && !newRow) newRow = true;
          if (data[i]) {
            lineLength++;
            if (!(i > 0 && col > 0 && data[i - 1])) {
              path += newRow ? svgCmd("M", col + margin, 0.5 + row + margin) : svgCmd("m", moveBy, 0);
              moveBy = 0;
              newRow = false;
            }
            if (!(col + 1 < size && data[i + 1])) {
              path += svgCmd("h", lineLength);
              lineLength = 0;
            }
          } else {
            moveBy++;
          }
        }
        return path;
      }
      exports.render = function render2(qrData, options, cb) {
        const opts = Utils.getOptions(options);
        const size = qrData.modules.size;
        const data = qrData.modules.data;
        const qrcodesize = size + opts.margin * 2;
        const bg = !opts.color.light.a ? "" : "<path " + getColorAttrib(opts.color.light, "fill") + ' d="M0 0h' + qrcodesize + "v" + qrcodesize + 'H0z"/>';
        const path = "<path " + getColorAttrib(opts.color.dark, "stroke") + ' d="' + qrToPath(data, size, opts.margin) + '"/>';
        const viewBox = 'viewBox="0 0 ' + qrcodesize + " " + qrcodesize + '"';
        const width = !opts.width ? "" : 'width="' + opts.width + '" height="' + opts.width + '" ';
        const svgTag = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + "</svg>\n";
        if (typeof cb === "function") {
          cb(null, svgTag);
        }
        return svgTag;
      };
    }
  });

  // node_modules/qrcode/lib/browser.js
  var require_browser = __commonJS({
    "node_modules/qrcode/lib/browser.js"(exports) {
      var canPromise = require_can_promise();
      var QRCode2 = require_qrcode();
      var CanvasRenderer = require_canvas();
      var SvgRenderer = require_svg_tag();
      function renderCanvas(renderFunc, canvas, text, opts, cb) {
        const args = [].slice.call(arguments, 1);
        const argsNum = args.length;
        const isLastArgCb = typeof args[argsNum - 1] === "function";
        if (!isLastArgCb && !canPromise()) {
          throw new Error("Callback required as last argument");
        }
        if (isLastArgCb) {
          if (argsNum < 2) {
            throw new Error("Too few arguments provided");
          }
          if (argsNum === 2) {
            cb = text;
            text = canvas;
            canvas = opts = void 0;
          } else if (argsNum === 3) {
            if (canvas.getContext && typeof cb === "undefined") {
              cb = opts;
              opts = void 0;
            } else {
              cb = opts;
              opts = text;
              text = canvas;
              canvas = void 0;
            }
          }
        } else {
          if (argsNum < 1) {
            throw new Error("Too few arguments provided");
          }
          if (argsNum === 1) {
            text = canvas;
            canvas = opts = void 0;
          } else if (argsNum === 2 && !canvas.getContext) {
            opts = text;
            text = canvas;
            canvas = void 0;
          }
          return new Promise(function(resolve, reject) {
            try {
              const data = QRCode2.create(text, opts);
              resolve(renderFunc(data, canvas, opts));
            } catch (e) {
              reject(e);
            }
          });
        }
        try {
          const data = QRCode2.create(text, opts);
          cb(null, renderFunc(data, canvas, opts));
        } catch (e) {
          cb(e);
        }
      }
      exports.create = QRCode2.create;
      exports.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
      exports.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);
      exports.toString = renderCanvas.bind(null, function(data, _, opts) {
        return SvgRenderer.render(data, opts);
      });
    }
  });

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
  var DB_VERSION = 5;
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
  }
  async function getProfiles() {
    let profiles = await storage.get({ profiles: [] });
    return profiles.profiles;
  }
  async function getProfile(index) {
    let profiles = await getProfiles();
    return profiles[index];
  }
  async function getProfileNames() {
    let profiles = await getProfiles();
    return profiles.map((p) => p.name);
  }
  async function getProfileIndex() {
    const index = await storage.get({ profileIndex: 0 });
    return index.profileIndex;
  }
  async function setProfileIndex(profileIndex) {
    await storage.set({ profileIndex });
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
      remotePubkey: null
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
  async function getRelays(profileIndex) {
    let profile = await getProfile(profileIndex);
    return profile.relays || [];
  }
  async function saveRelays(profileIndex, relays) {
    let fixedRelays = JSON.parse(JSON.stringify(relays));
    let profiles = await getProfiles();
    let profile = profiles[profileIndex];
    profile.relays = fixedRelays;
    await storage.set({ profiles });
  }
  async function relayReminder() {
    let index = await getProfileIndex();
    let profile = await getProfile(index);
    return profile.relayReminder;
  }
  async function toggleRelayReminder() {
    let index = await getProfileIndex();
    let profiles = await getProfiles();
    profiles[index].relayReminder = false;
    await storage.set({ profiles });
  }
  async function getNpub() {
    let index = await getProfileIndex();
    return await api.runtime.sendMessage({
      kind: "getNpub",
      payload: index
    });
  }

  // src/popup.js
  var import_qrcode = __toESM(require_browser());
  var state = {
    profileNames: ["Default Nostr Profile"],
    profileIndex: 0,
    relayCount: 0,
    showRelayReminder: true,
    isLocked: false,
    hasPassword: false,
    npubQrDataUrl: "",
    profileType: "local",
    bunkerConnected: false
  };
  var elements = {};
  function $(id) {
    return document.getElementById(id);
  }
  function initElements() {
    elements.lockedView = $("locked-view");
    elements.unlockedView = $("unlocked-view");
    elements.unlockForm = $("unlock-form");
    elements.unlockPassword = $("unlock-password");
    elements.unlockError = $("unlock-error");
    elements.lockBtn = $("lock-btn");
    elements.profileSelect = $("profile-select");
    elements.copyNpubBtn = $("copy-npub-btn");
    elements.qrContainer = $("qr-container");
    elements.qrImage = $("qr-image");
    elements.bunkerStatus = $("bunker-status");
    elements.bunkerIndicator = $("bunker-indicator");
    elements.bunkerText = $("bunker-text");
    elements.relayReminder = $("relay-reminder");
    elements.addRelaysBtn = $("add-relays-btn");
    elements.noThanksBtn = $("no-thanks-btn");
    elements.settingsBtn = $("settings-btn");
    elements.lockedSettingsBtn = $("locked-settings-btn");
  }
  function render() {
    if (state.isLocked) {
      elements.lockedView.classList.remove("hidden");
      elements.unlockedView.classList.add("hidden");
    } else {
      elements.lockedView.classList.add("hidden");
      elements.unlockedView.classList.remove("hidden");
      renderUnlockedState();
    }
  }
  function renderUnlockedState() {
    if (state.hasPassword) {
      elements.lockBtn.classList.remove("hidden");
    } else {
      elements.lockBtn.classList.add("hidden");
    }
    elements.profileSelect.innerHTML = state.profileNames.map((name, i) => `<option value="${i}"${i === state.profileIndex ? " selected" : ""}>${name}</option>`).join("");
    if (state.npubQrDataUrl) {
      elements.qrImage.src = state.npubQrDataUrl;
      elements.qrContainer.classList.remove("hidden");
    } else {
      elements.qrContainer.classList.add("hidden");
    }
    if (state.profileType === "bunker") {
      elements.bunkerStatus.classList.remove("hidden");
      elements.bunkerIndicator.className = `inline-block w-2 h-2 rounded-full ${state.bunkerConnected ? "bg-green-500" : "bg-red-500"}`;
      elements.bunkerText.textContent = state.bunkerConnected ? "Bunker connected" : "Bunker disconnected";
    } else {
      elements.bunkerStatus.classList.add("hidden");
    }
    if (state.relayCount < 1 && state.showRelayReminder) {
      elements.relayReminder.classList.remove("hidden");
    } else {
      elements.relayReminder.classList.add("hidden");
    }
  }
  async function loadUnlockedState() {
    await api.runtime.sendMessage({ kind: "resetAutoLock" });
    await loadNames();
    await loadProfileIndex();
    await loadProfileType();
    await countRelays();
    await checkRelayReminder();
    await generateQr();
    render();
  }
  async function loadNames() {
    state.profileNames = await getProfileNames();
  }
  async function loadProfileIndex() {
    state.profileIndex = await getProfileIndex();
  }
  async function loadProfileType() {
    state.profileType = await api.runtime.sendMessage({ kind: "getProfileType" });
    if (state.profileType === "bunker") {
      const status = await api.runtime.sendMessage({ kind: "bunker.status" });
      state.bunkerConnected = status?.connected || false;
    } else {
      state.bunkerConnected = false;
    }
  }
  async function countRelays() {
    const relays = await getRelays(state.profileIndex);
    state.relayCount = relays.length;
  }
  async function checkRelayReminder() {
    state.showRelayReminder = await relayReminder();
  }
  async function generateQr() {
    try {
      const npub = await getNpub();
      if (!npub) {
        state.npubQrDataUrl = "";
        return;
      }
      state.npubQrDataUrl = await import_qrcode.default.toDataURL(npub.toUpperCase(), {
        width: 200,
        margin: 2,
        color: { dark: "#a6e22e", light: "#272822" }
      });
    } catch {
      state.npubQrDataUrl = "";
    }
  }
  async function doUnlock() {
    const password = elements.unlockPassword.value;
    if (!password) {
      elements.unlockError.textContent = "Please enter your master password.";
      elements.unlockError.classList.remove("hidden");
      return;
    }
    const result = await api.runtime.sendMessage({ kind: "unlock", payload: password });
    if (result.success) {
      state.isLocked = false;
      elements.unlockPassword.value = "";
      elements.unlockError.classList.add("hidden");
      await loadUnlockedState();
    } else {
      elements.unlockError.textContent = result.error || "Invalid password.";
      elements.unlockError.classList.remove("hidden");
    }
  }
  async function doLock() {
    await api.runtime.sendMessage({ kind: "lock" });
    state.isLocked = true;
    render();
  }
  async function handleProfileChange() {
    const newIndex = parseInt(elements.profileSelect.value, 10);
    if (newIndex !== state.profileIndex) {
      state.profileIndex = newIndex;
      await setProfileIndex(state.profileIndex);
      await loadProfileType();
      await countRelays();
      await checkRelayReminder();
      await generateQr();
      render();
    }
  }
  async function copyNpub() {
    const npub = await getNpub();
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(npub);
    } else {
      await api.runtime.sendMessage({ kind: "copy", payload: npub });
    }
  }
  async function addRelays() {
    const relays = RECOMMENDED_RELAYS.map((r) => ({ url: r.href, read: true, write: true }));
    await saveRelays(state.profileIndex, relays);
    await countRelays();
    render();
  }
  async function noThanks() {
    await toggleRelayReminder();
    state.showRelayReminder = false;
    render();
  }
  async function openOptions() {
    await api.runtime.openOptionsPage();
    window.close();
  }
  function bindEvents() {
    elements.unlockForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await doUnlock();
    });
    elements.lockBtn.addEventListener("click", doLock);
    elements.profileSelect.addEventListener("change", handleProfileChange);
    elements.copyNpubBtn.addEventListener("click", copyNpub);
    elements.addRelaysBtn.addEventListener("click", addRelays);
    elements.noThanksBtn.addEventListener("click", noThanks);
    elements.settingsBtn.addEventListener("click", openOptions);
    elements.lockedSettingsBtn.addEventListener("click", openOptions);
  }
  async function init() {
    console.log("NostrKey Popup initializing...");
    initElements();
    bindEvents();
    await initialize();
    state.hasPassword = await api.runtime.sendMessage({ kind: "isEncrypted" });
    state.isLocked = await api.runtime.sendMessage({ kind: "isLocked" });
    if (!state.isLocked) {
      await loadUnlockedState();
    } else {
      render();
    }
  }
  document.addEventListener("DOMContentLoaded", init);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY2FuLXByb21pc2UuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS91dGlscy5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2Vycm9yLWNvcnJlY3Rpb24tbGV2ZWwuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9iaXQtYnVmZmVyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYml0LW1hdHJpeC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2FsaWdubWVudC1wYXR0ZXJuLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvZmluZGVyLXBhdHRlcm4uanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9tYXNrLXBhdHRlcm4uanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9lcnJvci1jb3JyZWN0aW9uLWNvZGUuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9nYWxvaXMtZmllbGQuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9wb2x5bm9taWFsLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvcmVlZC1zb2xvbW9uLWVuY29kZXIuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS92ZXJzaW9uLWNoZWNrLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvcmVnZXguanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9tb2RlLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvdmVyc2lvbi5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2Zvcm1hdC1pbmZvLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvbnVtZXJpYy1kYXRhLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYWxwaGFudW1lcmljLWRhdGEuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9ieXRlLWRhdGEuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9rYW5qaS1kYXRhLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9kaWprc3RyYWpzL2RpamtzdHJhLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvc2VnbWVudHMuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9xcmNvZGUuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvcmVuZGVyZXIvdXRpbHMuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvcmVuZGVyZXIvY2FudmFzLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL3JlbmRlcmVyL3N2Zy10YWcuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvYnJvd3Nlci5qcyIsICIuLi8uLi9zcmMvdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwuanMiLCAiLi4vLi4vc3JjL3V0aWxpdGllcy91dGlscy5qcyIsICIuLi8uLi9zcmMvcG9wdXAuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIGNhbi1wcm9taXNlIGhhcyBhIGNyYXNoIGluIHNvbWUgdmVyc2lvbnMgb2YgcmVhY3QgbmF0aXZlIHRoYXQgZG9udCBoYXZlXG4vLyBzdGFuZGFyZCBnbG9iYWwgb2JqZWN0c1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL3NvbGRhaXIvbm9kZS1xcmNvZGUvaXNzdWVzLzE1N1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHR5cGVvZiBQcm9taXNlID09PSAnZnVuY3Rpb24nICYmIFByb21pc2UucHJvdG90eXBlICYmIFByb21pc2UucHJvdG90eXBlLnRoZW5cbn1cbiIsICJsZXQgdG9TSklTRnVuY3Rpb25cbmNvbnN0IENPREVXT1JEU19DT1VOVCA9IFtcbiAgMCwgLy8gTm90IHVzZWRcbiAgMjYsIDQ0LCA3MCwgMTAwLCAxMzQsIDE3MiwgMTk2LCAyNDIsIDI5MiwgMzQ2LFxuICA0MDQsIDQ2NiwgNTMyLCA1ODEsIDY1NSwgNzMzLCA4MTUsIDkwMSwgOTkxLCAxMDg1LFxuICAxMTU2LCAxMjU4LCAxMzY0LCAxNDc0LCAxNTg4LCAxNzA2LCAxODI4LCAxOTIxLCAyMDUxLCAyMTg1LFxuICAyMzIzLCAyNDY1LCAyNjExLCAyNzYxLCAyODc2LCAzMDM0LCAzMTk2LCAzMzYyLCAzNTMyLCAzNzA2XG5dXG5cbi8qKlxuICogUmV0dXJucyB0aGUgUVIgQ29kZSBzaXplIGZvciB0aGUgc3BlY2lmaWVkIHZlcnNpb25cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgc2l6ZSBvZiBRUiBjb2RlXG4gKi9cbmV4cG9ydHMuZ2V0U3ltYm9sU2l6ZSA9IGZ1bmN0aW9uIGdldFN5bWJvbFNpemUgKHZlcnNpb24pIHtcbiAgaWYgKCF2ZXJzaW9uKSB0aHJvdyBuZXcgRXJyb3IoJ1widmVyc2lvblwiIGNhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCcpXG4gIGlmICh2ZXJzaW9uIDwgMSB8fCB2ZXJzaW9uID4gNDApIHRocm93IG5ldyBFcnJvcignXCJ2ZXJzaW9uXCIgc2hvdWxkIGJlIGluIHJhbmdlIGZyb20gMSB0byA0MCcpXG4gIHJldHVybiB2ZXJzaW9uICogNCArIDE3XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdG90YWwgbnVtYmVyIG9mIGNvZGV3b3JkcyB1c2VkIHRvIHN0b3JlIGRhdGEgYW5kIEVDIGluZm9ybWF0aW9uLlxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICBEYXRhIGxlbmd0aCBpbiBiaXRzXG4gKi9cbmV4cG9ydHMuZ2V0U3ltYm9sVG90YWxDb2Rld29yZHMgPSBmdW5jdGlvbiBnZXRTeW1ib2xUb3RhbENvZGV3b3JkcyAodmVyc2lvbikge1xuICByZXR1cm4gQ09ERVdPUkRTX0NPVU5UW3ZlcnNpb25dXG59XG5cbi8qKlxuICogRW5jb2RlIGRhdGEgd2l0aCBCb3NlLUNoYXVkaHVyaS1Ib2NxdWVuZ2hlbVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gZGF0YSBWYWx1ZSB0byBlbmNvZGVcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICBFbmNvZGVkIHZhbHVlXG4gKi9cbmV4cG9ydHMuZ2V0QkNIRGlnaXQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICBsZXQgZGlnaXQgPSAwXG5cbiAgd2hpbGUgKGRhdGEgIT09IDApIHtcbiAgICBkaWdpdCsrXG4gICAgZGF0YSA+Pj49IDFcbiAgfVxuXG4gIHJldHVybiBkaWdpdFxufVxuXG5leHBvcnRzLnNldFRvU0pJU0Z1bmN0aW9uID0gZnVuY3Rpb24gc2V0VG9TSklTRnVuY3Rpb24gKGYpIHtcbiAgaWYgKHR5cGVvZiBmICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcInRvU0pJU0Z1bmNcIiBpcyBub3QgYSB2YWxpZCBmdW5jdGlvbi4nKVxuICB9XG5cbiAgdG9TSklTRnVuY3Rpb24gPSBmXG59XG5cbmV4cG9ydHMuaXNLYW5qaU1vZGVFbmFibGVkID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdHlwZW9mIHRvU0pJU0Z1bmN0aW9uICE9PSAndW5kZWZpbmVkJ1xufVxuXG5leHBvcnRzLnRvU0pJUyA9IGZ1bmN0aW9uIHRvU0pJUyAoa2FuamkpIHtcbiAgcmV0dXJuIHRvU0pJU0Z1bmN0aW9uKGthbmppKVxufVxuIiwgImV4cG9ydHMuTCA9IHsgYml0OiAxIH1cbmV4cG9ydHMuTSA9IHsgYml0OiAwIH1cbmV4cG9ydHMuUSA9IHsgYml0OiAzIH1cbmV4cG9ydHMuSCA9IHsgYml0OiAyIH1cblxuZnVuY3Rpb24gZnJvbVN0cmluZyAoc3RyaW5nKSB7XG4gIGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBFcnJvcignUGFyYW0gaXMgbm90IGEgc3RyaW5nJylcbiAgfVxuXG4gIGNvbnN0IGxjU3RyID0gc3RyaW5nLnRvTG93ZXJDYXNlKClcblxuICBzd2l0Y2ggKGxjU3RyKSB7XG4gICAgY2FzZSAnbCc6XG4gICAgY2FzZSAnbG93JzpcbiAgICAgIHJldHVybiBleHBvcnRzLkxcblxuICAgIGNhc2UgJ20nOlxuICAgIGNhc2UgJ21lZGl1bSc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5NXG5cbiAgICBjYXNlICdxJzpcbiAgICBjYXNlICdxdWFydGlsZSc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5RXG5cbiAgICBjYXNlICdoJzpcbiAgICBjYXNlICdoaWdoJzpcbiAgICAgIHJldHVybiBleHBvcnRzLkhcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gRUMgTGV2ZWw6ICcgKyBzdHJpbmcpXG4gIH1cbn1cblxuZXhwb3J0cy5pc1ZhbGlkID0gZnVuY3Rpb24gaXNWYWxpZCAobGV2ZWwpIHtcbiAgcmV0dXJuIGxldmVsICYmIHR5cGVvZiBsZXZlbC5iaXQgIT09ICd1bmRlZmluZWQnICYmXG4gICAgbGV2ZWwuYml0ID49IDAgJiYgbGV2ZWwuYml0IDwgNFxufVxuXG5leHBvcnRzLmZyb20gPSBmdW5jdGlvbiBmcm9tICh2YWx1ZSwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmIChleHBvcnRzLmlzVmFsaWQodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBmcm9tU3RyaW5nKHZhbHVlKVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICB9XG59XG4iLCAiZnVuY3Rpb24gQml0QnVmZmVyICgpIHtcbiAgdGhpcy5idWZmZXIgPSBbXVxuICB0aGlzLmxlbmd0aCA9IDBcbn1cblxuQml0QnVmZmVyLnByb3RvdHlwZSA9IHtcblxuICBnZXQ6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgIGNvbnN0IGJ1ZkluZGV4ID0gTWF0aC5mbG9vcihpbmRleCAvIDgpXG4gICAgcmV0dXJuICgodGhpcy5idWZmZXJbYnVmSW5kZXhdID4+PiAoNyAtIGluZGV4ICUgOCkpICYgMSkgPT09IDFcbiAgfSxcblxuICBwdXQ6IGZ1bmN0aW9uIChudW0sIGxlbmd0aCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMucHV0Qml0KCgobnVtID4+PiAobGVuZ3RoIC0gaSAtIDEpKSAmIDEpID09PSAxKVxuICAgIH1cbiAgfSxcblxuICBnZXRMZW5ndGhJbkJpdHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5sZW5ndGhcbiAgfSxcblxuICBwdXRCaXQ6IGZ1bmN0aW9uIChiaXQpIHtcbiAgICBjb25zdCBidWZJbmRleCA9IE1hdGguZmxvb3IodGhpcy5sZW5ndGggLyA4KVxuICAgIGlmICh0aGlzLmJ1ZmZlci5sZW5ndGggPD0gYnVmSW5kZXgpIHtcbiAgICAgIHRoaXMuYnVmZmVyLnB1c2goMClcbiAgICB9XG5cbiAgICBpZiAoYml0KSB7XG4gICAgICB0aGlzLmJ1ZmZlcltidWZJbmRleF0gfD0gKDB4ODAgPj4+ICh0aGlzLmxlbmd0aCAlIDgpKVxuICAgIH1cblxuICAgIHRoaXMubGVuZ3RoKytcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJpdEJ1ZmZlclxuIiwgIi8qKlxuICogSGVscGVyIGNsYXNzIHRvIGhhbmRsZSBRUiBDb2RlIHN5bWJvbCBtb2R1bGVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHNpemUgU3ltYm9sIHNpemVcbiAqL1xuZnVuY3Rpb24gQml0TWF0cml4IChzaXplKSB7XG4gIGlmICghc2l6ZSB8fCBzaXplIDwgMSkge1xuICAgIHRocm93IG5ldyBFcnJvcignQml0TWF0cml4IHNpemUgbXVzdCBiZSBkZWZpbmVkIGFuZCBncmVhdGVyIHRoYW4gMCcpXG4gIH1cblxuICB0aGlzLnNpemUgPSBzaXplXG4gIHRoaXMuZGF0YSA9IG5ldyBVaW50OEFycmF5KHNpemUgKiBzaXplKVxuICB0aGlzLnJlc2VydmVkQml0ID0gbmV3IFVpbnQ4QXJyYXkoc2l6ZSAqIHNpemUpXG59XG5cbi8qKlxuICogU2V0IGJpdCB2YWx1ZSBhdCBzcGVjaWZpZWQgbG9jYXRpb25cbiAqIElmIHJlc2VydmVkIGZsYWcgaXMgc2V0LCB0aGlzIGJpdCB3aWxsIGJlIGlnbm9yZWQgZHVyaW5nIG1hc2tpbmcgcHJvY2Vzc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSAgcm93XG4gKiBAcGFyYW0ge051bWJlcn0gIGNvbFxuICogQHBhcmFtIHtCb29sZWFufSB2YWx1ZVxuICogQHBhcmFtIHtCb29sZWFufSByZXNlcnZlZFxuICovXG5CaXRNYXRyaXgucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChyb3csIGNvbCwgdmFsdWUsIHJlc2VydmVkKSB7XG4gIGNvbnN0IGluZGV4ID0gcm93ICogdGhpcy5zaXplICsgY29sXG4gIHRoaXMuZGF0YVtpbmRleF0gPSB2YWx1ZVxuICBpZiAocmVzZXJ2ZWQpIHRoaXMucmVzZXJ2ZWRCaXRbaW5kZXhdID0gdHJ1ZVxufVxuXG4vKipcbiAqIFJldHVybnMgYml0IHZhbHVlIGF0IHNwZWNpZmllZCBsb2NhdGlvblxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gIHJvd1xuICogQHBhcmFtICB7TnVtYmVyfSAgY29sXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5CaXRNYXRyaXgucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChyb3csIGNvbCkge1xuICByZXR1cm4gdGhpcy5kYXRhW3JvdyAqIHRoaXMuc2l6ZSArIGNvbF1cbn1cblxuLyoqXG4gKiBBcHBsaWVzIHhvciBvcGVyYXRvciBhdCBzcGVjaWZpZWQgbG9jYXRpb25cbiAqICh1c2VkIGR1cmluZyBtYXNraW5nIHByb2Nlc3MpXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9ICByb3dcbiAqIEBwYXJhbSB7TnVtYmVyfSAgY29sXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHZhbHVlXG4gKi9cbkJpdE1hdHJpeC5wcm90b3R5cGUueG9yID0gZnVuY3Rpb24gKHJvdywgY29sLCB2YWx1ZSkge1xuICB0aGlzLmRhdGFbcm93ICogdGhpcy5zaXplICsgY29sXSBePSB2YWx1ZVxufVxuXG4vKipcbiAqIENoZWNrIGlmIGJpdCBhdCBzcGVjaWZpZWQgbG9jYXRpb24gaXMgcmVzZXJ2ZWRcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gICByb3dcbiAqIEBwYXJhbSB7TnVtYmVyfSAgIGNvbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuQml0TWF0cml4LnByb3RvdHlwZS5pc1Jlc2VydmVkID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIHJldHVybiB0aGlzLnJlc2VydmVkQml0W3JvdyAqIHRoaXMuc2l6ZSArIGNvbF1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCaXRNYXRyaXhcbiIsICIvKipcbiAqIEFsaWdubWVudCBwYXR0ZXJuIGFyZSBmaXhlZCByZWZlcmVuY2UgcGF0dGVybiBpbiBkZWZpbmVkIHBvc2l0aW9uc1xuICogaW4gYSBtYXRyaXggc3ltYm9sb2d5LCB3aGljaCBlbmFibGVzIHRoZSBkZWNvZGUgc29mdHdhcmUgdG8gcmUtc3luY2hyb25pc2VcbiAqIHRoZSBjb29yZGluYXRlIG1hcHBpbmcgb2YgdGhlIGltYWdlIG1vZHVsZXMgaW4gdGhlIGV2ZW50IG9mIG1vZGVyYXRlIGFtb3VudHNcbiAqIG9mIGRpc3RvcnRpb24gb2YgdGhlIGltYWdlLlxuICpcbiAqIEFsaWdubWVudCBwYXR0ZXJucyBhcmUgcHJlc2VudCBvbmx5IGluIFFSIENvZGUgc3ltYm9scyBvZiB2ZXJzaW9uIDIgb3IgbGFyZ2VyXG4gKiBhbmQgdGhlaXIgbnVtYmVyIGRlcGVuZHMgb24gdGhlIHN5bWJvbCB2ZXJzaW9uLlxuICovXG5cbmNvbnN0IGdldFN5bWJvbFNpemUgPSByZXF1aXJlKCcuL3V0aWxzJykuZ2V0U3ltYm9sU2l6ZVxuXG4vKipcbiAqIENhbGN1bGF0ZSB0aGUgcm93L2NvbHVtbiBjb29yZGluYXRlcyBvZiB0aGUgY2VudGVyIG1vZHVsZSBvZiBlYWNoIGFsaWdubWVudCBwYXR0ZXJuXG4gKiBmb3IgdGhlIHNwZWNpZmllZCBRUiBDb2RlIHZlcnNpb24uXG4gKlxuICogVGhlIGFsaWdubWVudCBwYXR0ZXJucyBhcmUgcG9zaXRpb25lZCBzeW1tZXRyaWNhbGx5IG9uIGVpdGhlciBzaWRlIG9mIHRoZSBkaWFnb25hbFxuICogcnVubmluZyBmcm9tIHRoZSB0b3AgbGVmdCBjb3JuZXIgb2YgdGhlIHN5bWJvbCB0byB0aGUgYm90dG9tIHJpZ2h0IGNvcm5lci5cbiAqXG4gKiBTaW5jZSBwb3NpdGlvbnMgYXJlIHNpbW1ldHJpY2FsIG9ubHkgaGFsZiBvZiB0aGUgY29vcmRpbmF0ZXMgYXJlIHJldHVybmVkLlxuICogRWFjaCBpdGVtIG9mIHRoZSBhcnJheSB3aWxsIHJlcHJlc2VudCBpbiB0dXJuIHRoZSB4IGFuZCB5IGNvb3JkaW5hdGUuXG4gKiBAc2VlIHtAbGluayBnZXRQb3NpdGlvbnN9XG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIGNvb3JkaW5hdGVcbiAqL1xuZXhwb3J0cy5nZXRSb3dDb2xDb29yZHMgPSBmdW5jdGlvbiBnZXRSb3dDb2xDb29yZHMgKHZlcnNpb24pIHtcbiAgaWYgKHZlcnNpb24gPT09IDEpIHJldHVybiBbXVxuXG4gIGNvbnN0IHBvc0NvdW50ID0gTWF0aC5mbG9vcih2ZXJzaW9uIC8gNykgKyAyXG4gIGNvbnN0IHNpemUgPSBnZXRTeW1ib2xTaXplKHZlcnNpb24pXG4gIGNvbnN0IGludGVydmFscyA9IHNpemUgPT09IDE0NSA/IDI2IDogTWF0aC5jZWlsKChzaXplIC0gMTMpIC8gKDIgKiBwb3NDb3VudCAtIDIpKSAqIDJcbiAgY29uc3QgcG9zaXRpb25zID0gW3NpemUgLSA3XSAvLyBMYXN0IGNvb3JkIGlzIGFsd2F5cyAoc2l6ZSAtIDcpXG5cbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBwb3NDb3VudCAtIDE7IGkrKykge1xuICAgIHBvc2l0aW9uc1tpXSA9IHBvc2l0aW9uc1tpIC0gMV0gLSBpbnRlcnZhbHNcbiAgfVxuXG4gIHBvc2l0aW9ucy5wdXNoKDYpIC8vIEZpcnN0IGNvb3JkIGlzIGFsd2F5cyA2XG5cbiAgcmV0dXJuIHBvc2l0aW9ucy5yZXZlcnNlKClcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIHBvc2l0aW9ucyBvZiBlYWNoIGFsaWdubWVudCBwYXR0ZXJuLlxuICogRWFjaCBhcnJheSdzIGVsZW1lbnQgcmVwcmVzZW50IHRoZSBjZW50ZXIgcG9pbnQgb2YgdGhlIHBhdHRlcm4gYXMgKHgsIHkpIGNvb3JkaW5hdGVzXG4gKlxuICogQ29vcmRpbmF0ZXMgYXJlIGNhbGN1bGF0ZWQgZXhwYW5kaW5nIHRoZSByb3cvY29sdW1uIGNvb3JkaW5hdGVzIHJldHVybmVkIGJ5IHtAbGluayBnZXRSb3dDb2xDb29yZHN9XG4gKiBhbmQgZmlsdGVyaW5nIG91dCB0aGUgaXRlbXMgdGhhdCBvdmVybGFwcyB3aXRoIGZpbmRlciBwYXR0ZXJuXG4gKlxuICogQGV4YW1wbGVcbiAqIEZvciBhIFZlcnNpb24gNyBzeW1ib2wge0BsaW5rIGdldFJvd0NvbENvb3Jkc30gcmV0dXJucyB2YWx1ZXMgNiwgMjIgYW5kIDM4LlxuICogVGhlIGFsaWdubWVudCBwYXR0ZXJucywgdGhlcmVmb3JlLCBhcmUgdG8gYmUgY2VudGVyZWQgb24gKHJvdywgY29sdW1uKVxuICogcG9zaXRpb25zICg2LDIyKSwgKDIyLDYpLCAoMjIsMjIpLCAoMjIsMzgpLCAoMzgsMjIpLCAoMzgsMzgpLlxuICogTm90ZSB0aGF0IHRoZSBjb29yZGluYXRlcyAoNiw2KSwgKDYsMzgpLCAoMzgsNikgYXJlIG9jY3VwaWVkIGJ5IGZpbmRlciBwYXR0ZXJuc1xuICogYW5kIGFyZSBub3QgdGhlcmVmb3JlIHVzZWQgZm9yIGFsaWdubWVudCBwYXR0ZXJucy5cbiAqXG4gKiBsZXQgcG9zID0gZ2V0UG9zaXRpb25zKDcpXG4gKiAvLyBbWzYsMjJdLCBbMjIsNl0sIFsyMiwyMl0sIFsyMiwzOF0sIFszOCwyMl0sIFszOCwzOF1dXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIGNvb3JkaW5hdGVzXG4gKi9cbmV4cG9ydHMuZ2V0UG9zaXRpb25zID0gZnVuY3Rpb24gZ2V0UG9zaXRpb25zICh2ZXJzaW9uKSB7XG4gIGNvbnN0IGNvb3JkcyA9IFtdXG4gIGNvbnN0IHBvcyA9IGV4cG9ydHMuZ2V0Um93Q29sQ29vcmRzKHZlcnNpb24pXG4gIGNvbnN0IHBvc0xlbmd0aCA9IHBvcy5sZW5ndGhcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBvc0xlbmd0aDsgaSsrKSB7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBwb3NMZW5ndGg7IGorKykge1xuICAgICAgLy8gU2tpcCBpZiBwb3NpdGlvbiBpcyBvY2N1cGllZCBieSBmaW5kZXIgcGF0dGVybnNcbiAgICAgIGlmICgoaSA9PT0gMCAmJiBqID09PSAwKSB8fCAvLyB0b3AtbGVmdFxuICAgICAgICAgIChpID09PSAwICYmIGogPT09IHBvc0xlbmd0aCAtIDEpIHx8IC8vIGJvdHRvbS1sZWZ0XG4gICAgICAgICAgKGkgPT09IHBvc0xlbmd0aCAtIDEgJiYgaiA9PT0gMCkpIHsgLy8gdG9wLXJpZ2h0XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGNvb3Jkcy5wdXNoKFtwb3NbaV0sIHBvc1tqXV0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvb3Jkc1xufVxuIiwgImNvbnN0IGdldFN5bWJvbFNpemUgPSByZXF1aXJlKCcuL3V0aWxzJykuZ2V0U3ltYm9sU2l6ZVxuY29uc3QgRklOREVSX1BBVFRFUk5fU0laRSA9IDdcblxuLyoqXG4gKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIHBvc2l0aW9ucyBvZiBlYWNoIGZpbmRlciBwYXR0ZXJuLlxuICogRWFjaCBhcnJheSdzIGVsZW1lbnQgcmVwcmVzZW50IHRoZSB0b3AtbGVmdCBwb2ludCBvZiB0aGUgcGF0dGVybiBhcyAoeCwgeSkgY29vcmRpbmF0ZXNcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICAgQXJyYXkgb2YgY29vcmRpbmF0ZXNcbiAqL1xuZXhwb3J0cy5nZXRQb3NpdGlvbnMgPSBmdW5jdGlvbiBnZXRQb3NpdGlvbnMgKHZlcnNpb24pIHtcbiAgY29uc3Qgc2l6ZSA9IGdldFN5bWJvbFNpemUodmVyc2lvbilcblxuICByZXR1cm4gW1xuICAgIC8vIHRvcC1sZWZ0XG4gICAgWzAsIDBdLFxuICAgIC8vIHRvcC1yaWdodFxuICAgIFtzaXplIC0gRklOREVSX1BBVFRFUk5fU0laRSwgMF0sXG4gICAgLy8gYm90dG9tLWxlZnRcbiAgICBbMCwgc2l6ZSAtIEZJTkRFUl9QQVRURVJOX1NJWkVdXG4gIF1cbn1cbiIsICIvKipcbiAqIERhdGEgbWFzayBwYXR0ZXJuIHJlZmVyZW5jZVxuICogQHR5cGUge09iamVjdH1cbiAqL1xuZXhwb3J0cy5QYXR0ZXJucyA9IHtcbiAgUEFUVEVSTjAwMDogMCxcbiAgUEFUVEVSTjAwMTogMSxcbiAgUEFUVEVSTjAxMDogMixcbiAgUEFUVEVSTjAxMTogMyxcbiAgUEFUVEVSTjEwMDogNCxcbiAgUEFUVEVSTjEwMTogNSxcbiAgUEFUVEVSTjExMDogNixcbiAgUEFUVEVSTjExMTogN1xufVxuXG4vKipcbiAqIFdlaWdodGVkIHBlbmFsdHkgc2NvcmVzIGZvciB0aGUgdW5kZXNpcmFibGUgZmVhdHVyZXNcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmNvbnN0IFBlbmFsdHlTY29yZXMgPSB7XG4gIE4xOiAzLFxuICBOMjogMyxcbiAgTjM6IDQwLFxuICBONDogMTBcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBtYXNrIHBhdHRlcm4gdmFsdWUgaXMgdmFsaWRcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICBtYXNrICAgIE1hc2sgcGF0dGVyblxuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICB0cnVlIGlmIHZhbGlkLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0cy5pc1ZhbGlkID0gZnVuY3Rpb24gaXNWYWxpZCAobWFzaykge1xuICByZXR1cm4gbWFzayAhPSBudWxsICYmIG1hc2sgIT09ICcnICYmICFpc05hTihtYXNrKSAmJiBtYXNrID49IDAgJiYgbWFzayA8PSA3XG59XG5cbi8qKlxuICogUmV0dXJucyBtYXNrIHBhdHRlcm4gZnJvbSBhIHZhbHVlLlxuICogSWYgdmFsdWUgaXMgbm90IHZhbGlkLCByZXR1cm5zIHVuZGVmaW5lZFxuICpcbiAqIEBwYXJhbSAge051bWJlcnxTdHJpbmd9IHZhbHVlICAgICAgICBNYXNrIHBhdHRlcm4gdmFsdWVcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICBWYWxpZCBtYXNrIHBhdHRlcm4gb3IgdW5kZWZpbmVkXG4gKi9cbmV4cG9ydHMuZnJvbSA9IGZ1bmN0aW9uIGZyb20gKHZhbHVlKSB7XG4gIHJldHVybiBleHBvcnRzLmlzVmFsaWQodmFsdWUpID8gcGFyc2VJbnQodmFsdWUsIDEwKSA6IHVuZGVmaW5lZFxufVxuXG4vKipcbiogRmluZCBhZGphY2VudCBtb2R1bGVzIGluIHJvdy9jb2x1bW4gd2l0aCB0aGUgc2FtZSBjb2xvclxuKiBhbmQgYXNzaWduIGEgcGVuYWx0eSB2YWx1ZS5cbipcbiogUG9pbnRzOiBOMSArIGlcbiogaSBpcyB0aGUgYW1vdW50IGJ5IHdoaWNoIHRoZSBudW1iZXIgb2YgYWRqYWNlbnQgbW9kdWxlcyBvZiB0aGUgc2FtZSBjb2xvciBleGNlZWRzIDVcbiovXG5leHBvcnRzLmdldFBlbmFsdHlOMSA9IGZ1bmN0aW9uIGdldFBlbmFsdHlOMSAoZGF0YSkge1xuICBjb25zdCBzaXplID0gZGF0YS5zaXplXG4gIGxldCBwb2ludHMgPSAwXG4gIGxldCBzYW1lQ291bnRDb2wgPSAwXG4gIGxldCBzYW1lQ291bnRSb3cgPSAwXG4gIGxldCBsYXN0Q29sID0gbnVsbFxuICBsZXQgbGFzdFJvdyA9IG51bGxcblxuICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBzaXplOyByb3crKykge1xuICAgIHNhbWVDb3VudENvbCA9IHNhbWVDb3VudFJvdyA9IDBcbiAgICBsYXN0Q29sID0gbGFzdFJvdyA9IG51bGxcblxuICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IHNpemU7IGNvbCsrKSB7XG4gICAgICBsZXQgbW9kdWxlID0gZGF0YS5nZXQocm93LCBjb2wpXG4gICAgICBpZiAobW9kdWxlID09PSBsYXN0Q29sKSB7XG4gICAgICAgIHNhbWVDb3VudENvbCsrXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc2FtZUNvdW50Q29sID49IDUpIHBvaW50cyArPSBQZW5hbHR5U2NvcmVzLk4xICsgKHNhbWVDb3VudENvbCAtIDUpXG4gICAgICAgIGxhc3RDb2wgPSBtb2R1bGVcbiAgICAgICAgc2FtZUNvdW50Q29sID0gMVxuICAgICAgfVxuXG4gICAgICBtb2R1bGUgPSBkYXRhLmdldChjb2wsIHJvdylcbiAgICAgIGlmIChtb2R1bGUgPT09IGxhc3RSb3cpIHtcbiAgICAgICAgc2FtZUNvdW50Um93KytcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzYW1lQ291bnRSb3cgPj0gNSkgcG9pbnRzICs9IFBlbmFsdHlTY29yZXMuTjEgKyAoc2FtZUNvdW50Um93IC0gNSlcbiAgICAgICAgbGFzdFJvdyA9IG1vZHVsZVxuICAgICAgICBzYW1lQ291bnRSb3cgPSAxXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNhbWVDb3VudENvbCA+PSA1KSBwb2ludHMgKz0gUGVuYWx0eVNjb3Jlcy5OMSArIChzYW1lQ291bnRDb2wgLSA1KVxuICAgIGlmIChzYW1lQ291bnRSb3cgPj0gNSkgcG9pbnRzICs9IFBlbmFsdHlTY29yZXMuTjEgKyAoc2FtZUNvdW50Um93IC0gNSlcbiAgfVxuXG4gIHJldHVybiBwb2ludHNcbn1cblxuLyoqXG4gKiBGaW5kIDJ4MiBibG9ja3Mgd2l0aCB0aGUgc2FtZSBjb2xvciBhbmQgYXNzaWduIGEgcGVuYWx0eSB2YWx1ZVxuICpcbiAqIFBvaW50czogTjIgKiAobSAtIDEpICogKG4gLSAxKVxuICovXG5leHBvcnRzLmdldFBlbmFsdHlOMiA9IGZ1bmN0aW9uIGdldFBlbmFsdHlOMiAoZGF0YSkge1xuICBjb25zdCBzaXplID0gZGF0YS5zaXplXG4gIGxldCBwb2ludHMgPSAwXG5cbiAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgc2l6ZSAtIDE7IHJvdysrKSB7XG4gICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgc2l6ZSAtIDE7IGNvbCsrKSB7XG4gICAgICBjb25zdCBsYXN0ID0gZGF0YS5nZXQocm93LCBjb2wpICtcbiAgICAgICAgZGF0YS5nZXQocm93LCBjb2wgKyAxKSArXG4gICAgICAgIGRhdGEuZ2V0KHJvdyArIDEsIGNvbCkgK1xuICAgICAgICBkYXRhLmdldChyb3cgKyAxLCBjb2wgKyAxKVxuXG4gICAgICBpZiAobGFzdCA9PT0gNCB8fCBsYXN0ID09PSAwKSBwb2ludHMrK1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwb2ludHMgKiBQZW5hbHR5U2NvcmVzLk4yXG59XG5cbi8qKlxuICogRmluZCAxOjE6MzoxOjEgcmF0aW8gKGRhcms6bGlnaHQ6ZGFyazpsaWdodDpkYXJrKSBwYXR0ZXJuIGluIHJvdy9jb2x1bW4sXG4gKiBwcmVjZWRlZCBvciBmb2xsb3dlZCBieSBsaWdodCBhcmVhIDQgbW9kdWxlcyB3aWRlXG4gKlxuICogUG9pbnRzOiBOMyAqIG51bWJlciBvZiBwYXR0ZXJuIGZvdW5kXG4gKi9cbmV4cG9ydHMuZ2V0UGVuYWx0eU4zID0gZnVuY3Rpb24gZ2V0UGVuYWx0eU4zIChkYXRhKSB7XG4gIGNvbnN0IHNpemUgPSBkYXRhLnNpemVcbiAgbGV0IHBvaW50cyA9IDBcbiAgbGV0IGJpdHNDb2wgPSAwXG4gIGxldCBiaXRzUm93ID0gMFxuXG4gIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHNpemU7IHJvdysrKSB7XG4gICAgYml0c0NvbCA9IGJpdHNSb3cgPSAwXG4gICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgc2l6ZTsgY29sKyspIHtcbiAgICAgIGJpdHNDb2wgPSAoKGJpdHNDb2wgPDwgMSkgJiAweDdGRikgfCBkYXRhLmdldChyb3csIGNvbClcbiAgICAgIGlmIChjb2wgPj0gMTAgJiYgKGJpdHNDb2wgPT09IDB4NUQwIHx8IGJpdHNDb2wgPT09IDB4MDVEKSkgcG9pbnRzKytcblxuICAgICAgYml0c1JvdyA9ICgoYml0c1JvdyA8PCAxKSAmIDB4N0ZGKSB8IGRhdGEuZ2V0KGNvbCwgcm93KVxuICAgICAgaWYgKGNvbCA+PSAxMCAmJiAoYml0c1JvdyA9PT0gMHg1RDAgfHwgYml0c1JvdyA9PT0gMHgwNUQpKSBwb2ludHMrK1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwb2ludHMgKiBQZW5hbHR5U2NvcmVzLk4zXG59XG5cbi8qKlxuICogQ2FsY3VsYXRlIHByb3BvcnRpb24gb2YgZGFyayBtb2R1bGVzIGluIGVudGlyZSBzeW1ib2xcbiAqXG4gKiBQb2ludHM6IE40ICoga1xuICpcbiAqIGsgaXMgdGhlIHJhdGluZyBvZiB0aGUgZGV2aWF0aW9uIG9mIHRoZSBwcm9wb3J0aW9uIG9mIGRhcmsgbW9kdWxlc1xuICogaW4gdGhlIHN5bWJvbCBmcm9tIDUwJSBpbiBzdGVwcyBvZiA1JVxuICovXG5leHBvcnRzLmdldFBlbmFsdHlONCA9IGZ1bmN0aW9uIGdldFBlbmFsdHlONCAoZGF0YSkge1xuICBsZXQgZGFya0NvdW50ID0gMFxuICBjb25zdCBtb2R1bGVzQ291bnQgPSBkYXRhLmRhdGEubGVuZ3RoXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBtb2R1bGVzQ291bnQ7IGkrKykgZGFya0NvdW50ICs9IGRhdGEuZGF0YVtpXVxuXG4gIGNvbnN0IGsgPSBNYXRoLmFicyhNYXRoLmNlaWwoKGRhcmtDb3VudCAqIDEwMCAvIG1vZHVsZXNDb3VudCkgLyA1KSAtIDEwKVxuXG4gIHJldHVybiBrICogUGVuYWx0eVNjb3Jlcy5ONFxufVxuXG4vKipcbiAqIFJldHVybiBtYXNrIHZhbHVlIGF0IGdpdmVuIHBvc2l0aW9uXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBtYXNrUGF0dGVybiBQYXR0ZXJuIHJlZmVyZW5jZSB2YWx1ZVxuICogQHBhcmFtICB7TnVtYmVyfSBpICAgICAgICAgICBSb3dcbiAqIEBwYXJhbSAge051bWJlcn0gaiAgICAgICAgICAgQ29sdW1uXG4gKiBAcmV0dXJuIHtCb29sZWFufSAgICAgICAgICAgIE1hc2sgdmFsdWVcbiAqL1xuZnVuY3Rpb24gZ2V0TWFza0F0IChtYXNrUGF0dGVybiwgaSwgaikge1xuICBzd2l0Y2ggKG1hc2tQYXR0ZXJuKSB7XG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4wMDA6IHJldHVybiAoaSArIGopICUgMiA9PT0gMFxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMDAxOiByZXR1cm4gaSAlIDIgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjAxMDogcmV0dXJuIGogJSAzID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4wMTE6IHJldHVybiAoaSArIGopICUgMyA9PT0gMFxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMTAwOiByZXR1cm4gKE1hdGguZmxvb3IoaSAvIDIpICsgTWF0aC5mbG9vcihqIC8gMykpICUgMiA9PT0gMFxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMTAxOiByZXR1cm4gKGkgKiBqKSAlIDIgKyAoaSAqIGopICUgMyA9PT0gMFxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMTEwOiByZXR1cm4gKChpICogaikgJSAyICsgKGkgKiBqKSAlIDMpICUgMiA9PT0gMFxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMTExOiByZXR1cm4gKChpICogaikgJSAzICsgKGkgKyBqKSAlIDIpICUgMiA9PT0gMFxuXG4gICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKCdiYWQgbWFza1BhdHRlcm46JyArIG1hc2tQYXR0ZXJuKVxuICB9XG59XG5cbi8qKlxuICogQXBwbHkgYSBtYXNrIHBhdHRlcm4gdG8gYSBCaXRNYXRyaXhcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgIHBhdHRlcm4gUGF0dGVybiByZWZlcmVuY2UgbnVtYmVyXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IGRhdGEgICAgQml0TWF0cml4IGRhdGFcbiAqL1xuZXhwb3J0cy5hcHBseU1hc2sgPSBmdW5jdGlvbiBhcHBseU1hc2sgKHBhdHRlcm4sIGRhdGEpIHtcbiAgY29uc3Qgc2l6ZSA9IGRhdGEuc2l6ZVxuXG4gIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IHNpemU7IGNvbCsrKSB7XG4gICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgc2l6ZTsgcm93KyspIHtcbiAgICAgIGlmIChkYXRhLmlzUmVzZXJ2ZWQocm93LCBjb2wpKSBjb250aW51ZVxuICAgICAgZGF0YS54b3Iocm93LCBjb2wsIGdldE1hc2tBdChwYXR0ZXJuLCByb3csIGNvbCkpXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgYmVzdCBtYXNrIHBhdHRlcm4gZm9yIGRhdGFcbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IGRhdGFcbiAqIEByZXR1cm4ge051bWJlcn0gTWFzayBwYXR0ZXJuIHJlZmVyZW5jZSBudW1iZXJcbiAqL1xuZXhwb3J0cy5nZXRCZXN0TWFzayA9IGZ1bmN0aW9uIGdldEJlc3RNYXNrIChkYXRhLCBzZXR1cEZvcm1hdEZ1bmMpIHtcbiAgY29uc3QgbnVtUGF0dGVybnMgPSBPYmplY3Qua2V5cyhleHBvcnRzLlBhdHRlcm5zKS5sZW5ndGhcbiAgbGV0IGJlc3RQYXR0ZXJuID0gMFxuICBsZXQgbG93ZXJQZW5hbHR5ID0gSW5maW5pdHlcblxuICBmb3IgKGxldCBwID0gMDsgcCA8IG51bVBhdHRlcm5zOyBwKyspIHtcbiAgICBzZXR1cEZvcm1hdEZ1bmMocClcbiAgICBleHBvcnRzLmFwcGx5TWFzayhwLCBkYXRhKVxuXG4gICAgLy8gQ2FsY3VsYXRlIHBlbmFsdHlcbiAgICBjb25zdCBwZW5hbHR5ID1cbiAgICAgIGV4cG9ydHMuZ2V0UGVuYWx0eU4xKGRhdGEpICtcbiAgICAgIGV4cG9ydHMuZ2V0UGVuYWx0eU4yKGRhdGEpICtcbiAgICAgIGV4cG9ydHMuZ2V0UGVuYWx0eU4zKGRhdGEpICtcbiAgICAgIGV4cG9ydHMuZ2V0UGVuYWx0eU40KGRhdGEpXG5cbiAgICAvLyBVbmRvIHByZXZpb3VzbHkgYXBwbGllZCBtYXNrXG4gICAgZXhwb3J0cy5hcHBseU1hc2socCwgZGF0YSlcblxuICAgIGlmIChwZW5hbHR5IDwgbG93ZXJQZW5hbHR5KSB7XG4gICAgICBsb3dlclBlbmFsdHkgPSBwZW5hbHR5XG4gICAgICBiZXN0UGF0dGVybiA9IHBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYmVzdFBhdHRlcm5cbn1cbiIsICJjb25zdCBFQ0xldmVsID0gcmVxdWlyZSgnLi9lcnJvci1jb3JyZWN0aW9uLWxldmVsJylcclxuXHJcbmNvbnN0IEVDX0JMT0NLU19UQUJMRSA9IFtcclxuLy8gTCAgTSAgUSAgSFxyXG4gIDEsIDEsIDEsIDEsXHJcbiAgMSwgMSwgMSwgMSxcclxuICAxLCAxLCAyLCAyLFxyXG4gIDEsIDIsIDIsIDQsXHJcbiAgMSwgMiwgNCwgNCxcclxuICAyLCA0LCA0LCA0LFxyXG4gIDIsIDQsIDYsIDUsXHJcbiAgMiwgNCwgNiwgNixcclxuICAyLCA1LCA4LCA4LFxyXG4gIDQsIDUsIDgsIDgsXHJcbiAgNCwgNSwgOCwgMTEsXHJcbiAgNCwgOCwgMTAsIDExLFxyXG4gIDQsIDksIDEyLCAxNixcclxuICA0LCA5LCAxNiwgMTYsXHJcbiAgNiwgMTAsIDEyLCAxOCxcclxuICA2LCAxMCwgMTcsIDE2LFxyXG4gIDYsIDExLCAxNiwgMTksXHJcbiAgNiwgMTMsIDE4LCAyMSxcclxuICA3LCAxNCwgMjEsIDI1LFxyXG4gIDgsIDE2LCAyMCwgMjUsXHJcbiAgOCwgMTcsIDIzLCAyNSxcclxuICA5LCAxNywgMjMsIDM0LFxyXG4gIDksIDE4LCAyNSwgMzAsXHJcbiAgMTAsIDIwLCAyNywgMzIsXHJcbiAgMTIsIDIxLCAyOSwgMzUsXHJcbiAgMTIsIDIzLCAzNCwgMzcsXHJcbiAgMTIsIDI1LCAzNCwgNDAsXHJcbiAgMTMsIDI2LCAzNSwgNDIsXHJcbiAgMTQsIDI4LCAzOCwgNDUsXHJcbiAgMTUsIDI5LCA0MCwgNDgsXHJcbiAgMTYsIDMxLCA0MywgNTEsXHJcbiAgMTcsIDMzLCA0NSwgNTQsXHJcbiAgMTgsIDM1LCA0OCwgNTcsXHJcbiAgMTksIDM3LCA1MSwgNjAsXHJcbiAgMTksIDM4LCA1MywgNjMsXHJcbiAgMjAsIDQwLCA1NiwgNjYsXHJcbiAgMjEsIDQzLCA1OSwgNzAsXHJcbiAgMjIsIDQ1LCA2MiwgNzQsXHJcbiAgMjQsIDQ3LCA2NSwgNzcsXHJcbiAgMjUsIDQ5LCA2OCwgODFcclxuXVxyXG5cclxuY29uc3QgRUNfQ09ERVdPUkRTX1RBQkxFID0gW1xyXG4vLyBMICBNICBRICBIXHJcbiAgNywgMTAsIDEzLCAxNyxcclxuICAxMCwgMTYsIDIyLCAyOCxcclxuICAxNSwgMjYsIDM2LCA0NCxcclxuICAyMCwgMzYsIDUyLCA2NCxcclxuICAyNiwgNDgsIDcyLCA4OCxcclxuICAzNiwgNjQsIDk2LCAxMTIsXHJcbiAgNDAsIDcyLCAxMDgsIDEzMCxcclxuICA0OCwgODgsIDEzMiwgMTU2LFxyXG4gIDYwLCAxMTAsIDE2MCwgMTkyLFxyXG4gIDcyLCAxMzAsIDE5MiwgMjI0LFxyXG4gIDgwLCAxNTAsIDIyNCwgMjY0LFxyXG4gIDk2LCAxNzYsIDI2MCwgMzA4LFxyXG4gIDEwNCwgMTk4LCAyODgsIDM1MixcclxuICAxMjAsIDIxNiwgMzIwLCAzODQsXHJcbiAgMTMyLCAyNDAsIDM2MCwgNDMyLFxyXG4gIDE0NCwgMjgwLCA0MDgsIDQ4MCxcclxuICAxNjgsIDMwOCwgNDQ4LCA1MzIsXHJcbiAgMTgwLCAzMzgsIDUwNCwgNTg4LFxyXG4gIDE5NiwgMzY0LCA1NDYsIDY1MCxcclxuICAyMjQsIDQxNiwgNjAwLCA3MDAsXHJcbiAgMjI0LCA0NDIsIDY0NCwgNzUwLFxyXG4gIDI1MiwgNDc2LCA2OTAsIDgxNixcclxuICAyNzAsIDUwNCwgNzUwLCA5MDAsXHJcbiAgMzAwLCA1NjAsIDgxMCwgOTYwLFxyXG4gIDMxMiwgNTg4LCA4NzAsIDEwNTAsXHJcbiAgMzM2LCA2NDQsIDk1MiwgMTExMCxcclxuICAzNjAsIDcwMCwgMTAyMCwgMTIwMCxcclxuICAzOTAsIDcyOCwgMTA1MCwgMTI2MCxcclxuICA0MjAsIDc4NCwgMTE0MCwgMTM1MCxcclxuICA0NTAsIDgxMiwgMTIwMCwgMTQ0MCxcclxuICA0ODAsIDg2OCwgMTI5MCwgMTUzMCxcclxuICA1MTAsIDkyNCwgMTM1MCwgMTYyMCxcclxuICA1NDAsIDk4MCwgMTQ0MCwgMTcxMCxcclxuICA1NzAsIDEwMzYsIDE1MzAsIDE4MDAsXHJcbiAgNTcwLCAxMDY0LCAxNTkwLCAxODkwLFxyXG4gIDYwMCwgMTEyMCwgMTY4MCwgMTk4MCxcclxuICA2MzAsIDEyMDQsIDE3NzAsIDIxMDAsXHJcbiAgNjYwLCAxMjYwLCAxODYwLCAyMjIwLFxyXG4gIDcyMCwgMTMxNiwgMTk1MCwgMjMxMCxcclxuICA3NTAsIDEzNzIsIDIwNDAsIDI0MzBcclxuXVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGJsb2NrIHRoYXQgdGhlIFFSIENvZGUgc2hvdWxkIGNvbnRhaW5cclxuICogZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBhbmQgZXJyb3IgY29ycmVjdGlvbiBsZXZlbC5cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cclxuICogQHBhcmFtICB7TnVtYmVyfSBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICAgTnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gYmxvY2tzXHJcbiAqL1xyXG5leHBvcnRzLmdldEJsb2Nrc0NvdW50ID0gZnVuY3Rpb24gZ2V0QmxvY2tzQ291bnQgKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgc3dpdGNoIChlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xyXG4gICAgY2FzZSBFQ0xldmVsLkw6XHJcbiAgICAgIHJldHVybiBFQ19CTE9DS1NfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAwXVxyXG4gICAgY2FzZSBFQ0xldmVsLk06XHJcbiAgICAgIHJldHVybiBFQ19CTE9DS1NfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAxXVxyXG4gICAgY2FzZSBFQ0xldmVsLlE6XHJcbiAgICAgIHJldHVybiBFQ19CTE9DS1NfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAyXVxyXG4gICAgY2FzZSBFQ0xldmVsLkg6XHJcbiAgICAgIHJldHVybiBFQ19CTE9DS1NfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAzXVxyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3JkcyB0byB1c2UgZm9yIHRoZSBzcGVjaWZpZWRcclxuICogdmVyc2lvbiBhbmQgZXJyb3IgY29ycmVjdGlvbiBsZXZlbC5cclxuICpcclxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cclxuICogQHBhcmFtICB7TnVtYmVyfSBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICAgTnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzXHJcbiAqL1xyXG5leHBvcnRzLmdldFRvdGFsQ29kZXdvcmRzQ291bnQgPSBmdW5jdGlvbiBnZXRUb3RhbENvZGV3b3Jkc0NvdW50ICh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xyXG4gIHN3aXRjaCAoZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcclxuICAgIGNhc2UgRUNMZXZlbC5MOlxyXG4gICAgICByZXR1cm4gRUNfQ09ERVdPUkRTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMF1cclxuICAgIGNhc2UgRUNMZXZlbC5NOlxyXG4gICAgICByZXR1cm4gRUNfQ09ERVdPUkRTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMV1cclxuICAgIGNhc2UgRUNMZXZlbC5ROlxyXG4gICAgICByZXR1cm4gRUNfQ09ERVdPUkRTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMl1cclxuICAgIGNhc2UgRUNMZXZlbC5IOlxyXG4gICAgICByZXR1cm4gRUNfQ09ERVdPUkRTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgM11cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuICB9XHJcbn1cclxuIiwgImNvbnN0IEVYUF9UQUJMRSA9IG5ldyBVaW50OEFycmF5KDUxMilcbmNvbnN0IExPR19UQUJMRSA9IG5ldyBVaW50OEFycmF5KDI1Nilcbi8qKlxuICogUHJlY29tcHV0ZSB0aGUgbG9nIGFuZCBhbnRpLWxvZyB0YWJsZXMgZm9yIGZhc3RlciBjb21wdXRhdGlvbiBsYXRlclxuICpcbiAqIEZvciBlYWNoIHBvc3NpYmxlIHZhbHVlIGluIHRoZSBnYWxvaXMgZmllbGQgMl44LCB3ZSB3aWxsIHByZS1jb21wdXRlXG4gKiB0aGUgbG9nYXJpdGhtIGFuZCBhbnRpLWxvZ2FyaXRobSAoZXhwb25lbnRpYWwpIG9mIHRoaXMgdmFsdWVcbiAqXG4gKiByZWYge0BsaW5rIGh0dHBzOi8vZW4ud2lraXZlcnNpdHkub3JnL3dpa2kvUmVlZCVFMiU4MCU5M1NvbG9tb25fY29kZXNfZm9yX2NvZGVycyNJbnRyb2R1Y3Rpb25fdG9fbWF0aGVtYXRpY2FsX2ZpZWxkc31cbiAqL1xuOyhmdW5jdGlvbiBpbml0VGFibGVzICgpIHtcbiAgbGV0IHggPSAxXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMjU1OyBpKyspIHtcbiAgICBFWFBfVEFCTEVbaV0gPSB4XG4gICAgTE9HX1RBQkxFW3hdID0gaVxuXG4gICAgeCA8PD0gMSAvLyBtdWx0aXBseSBieSAyXG5cbiAgICAvLyBUaGUgUVIgY29kZSBzcGVjaWZpY2F0aW9uIHNheXMgdG8gdXNlIGJ5dGUtd2lzZSBtb2R1bG8gMTAwMDExMTAxIGFyaXRobWV0aWMuXG4gICAgLy8gVGhpcyBtZWFucyB0aGF0IHdoZW4gYSBudW1iZXIgaXMgMjU2IG9yIGxhcmdlciwgaXQgc2hvdWxkIGJlIFhPUmVkIHdpdGggMHgxMUQuXG4gICAgaWYgKHggJiAweDEwMCkgeyAvLyBzaW1pbGFyIHRvIHggPj0gMjU2LCBidXQgYSBsb3QgZmFzdGVyIChiZWNhdXNlIDB4MTAwID09IDI1NilcbiAgICAgIHggXj0gMHgxMURcbiAgICB9XG4gIH1cblxuICAvLyBPcHRpbWl6YXRpb246IGRvdWJsZSB0aGUgc2l6ZSBvZiB0aGUgYW50aS1sb2cgdGFibGUgc28gdGhhdCB3ZSBkb24ndCBuZWVkIHRvIG1vZCAyNTUgdG9cbiAgLy8gc3RheSBpbnNpZGUgdGhlIGJvdW5kcyAoYmVjYXVzZSB3ZSB3aWxsIG1haW5seSB1c2UgdGhpcyB0YWJsZSBmb3IgdGhlIG11bHRpcGxpY2F0aW9uIG9mXG4gIC8vIHR3byBHRiBudW1iZXJzLCBubyBtb3JlKS5cbiAgLy8gQHNlZSB7QGxpbmsgbXVsfVxuICBmb3IgKGxldCBpID0gMjU1OyBpIDwgNTEyOyBpKyspIHtcbiAgICBFWFBfVEFCTEVbaV0gPSBFWFBfVEFCTEVbaSAtIDI1NV1cbiAgfVxufSgpKVxuXG4vKipcbiAqIFJldHVybnMgbG9nIHZhbHVlIG9mIG4gaW5zaWRlIEdhbG9pcyBGaWVsZFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gblxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uIGxvZyAobikge1xuICBpZiAobiA8IDEpIHRocm93IG5ldyBFcnJvcignbG9nKCcgKyBuICsgJyknKVxuICByZXR1cm4gTE9HX1RBQkxFW25dXG59XG5cbi8qKlxuICogUmV0dXJucyBhbnRpLWxvZyB2YWx1ZSBvZiBuIGluc2lkZSBHYWxvaXMgRmllbGRcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZXhwb3J0cy5leHAgPSBmdW5jdGlvbiBleHAgKG4pIHtcbiAgcmV0dXJuIEVYUF9UQUJMRVtuXVxufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG51bWJlciBpbnNpZGUgR2Fsb2lzIEZpZWxkXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB4XG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHlcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZXhwb3J0cy5tdWwgPSBmdW5jdGlvbiBtdWwgKHgsIHkpIHtcbiAgaWYgKHggPT09IDAgfHwgeSA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBzaG91bGQgYmUgRVhQX1RBQkxFWyhMT0dfVEFCTEVbeF0gKyBMT0dfVEFCTEVbeV0pICUgMjU1XSBpZiBFWFBfVEFCTEUgd2Fzbid0IG92ZXJzaXplZFxuICAvLyBAc2VlIHtAbGluayBpbml0VGFibGVzfVxuICByZXR1cm4gRVhQX1RBQkxFW0xPR19UQUJMRVt4XSArIExPR19UQUJMRVt5XV1cbn1cbiIsICJjb25zdCBHRiA9IHJlcXVpcmUoJy4vZ2Fsb2lzLWZpZWxkJylcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBwb2x5bm9taWFscyBpbnNpZGUgR2Fsb2lzIEZpZWxkXG4gKlxuICogQHBhcmFtICB7VWludDhBcnJheX0gcDEgUG9seW5vbWlhbFxuICogQHBhcmFtICB7VWludDhBcnJheX0gcDIgUG9seW5vbWlhbFxuICogQHJldHVybiB7VWludDhBcnJheX0gICAgUHJvZHVjdCBvZiBwMSBhbmQgcDJcbiAqL1xuZXhwb3J0cy5tdWwgPSBmdW5jdGlvbiBtdWwgKHAxLCBwMikge1xuICBjb25zdCBjb2VmZiA9IG5ldyBVaW50OEFycmF5KHAxLmxlbmd0aCArIHAyLmxlbmd0aCAtIDEpXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwMS5sZW5ndGg7IGkrKykge1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgcDIubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvZWZmW2kgKyBqXSBePSBHRi5tdWwocDFbaV0sIHAyW2pdKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb2VmZlxufVxuXG4vKipcbiAqIENhbGN1bGF0ZSB0aGUgcmVtYWluZGVyIG9mIHBvbHlub21pYWxzIGRpdmlzaW9uXG4gKlxuICogQHBhcmFtICB7VWludDhBcnJheX0gZGl2aWRlbnQgUG9seW5vbWlhbFxuICogQHBhcmFtICB7VWludDhBcnJheX0gZGl2aXNvciAgUG9seW5vbWlhbFxuICogQHJldHVybiB7VWludDhBcnJheX0gICAgICAgICAgUmVtYWluZGVyXG4gKi9cbmV4cG9ydHMubW9kID0gZnVuY3Rpb24gbW9kIChkaXZpZGVudCwgZGl2aXNvcikge1xuICBsZXQgcmVzdWx0ID0gbmV3IFVpbnQ4QXJyYXkoZGl2aWRlbnQpXG5cbiAgd2hpbGUgKChyZXN1bHQubGVuZ3RoIC0gZGl2aXNvci5sZW5ndGgpID49IDApIHtcbiAgICBjb25zdCBjb2VmZiA9IHJlc3VsdFswXVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaXZpc29yLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRbaV0gXj0gR0YubXVsKGRpdmlzb3JbaV0sIGNvZWZmKVxuICAgIH1cblxuICAgIC8vIHJlbW92ZSBhbGwgemVyb3MgZnJvbSBidWZmZXIgaGVhZFxuICAgIGxldCBvZmZzZXQgPSAwXG4gICAgd2hpbGUgKG9mZnNldCA8IHJlc3VsdC5sZW5ndGggJiYgcmVzdWx0W29mZnNldF0gPT09IDApIG9mZnNldCsrXG4gICAgcmVzdWx0ID0gcmVzdWx0LnNsaWNlKG9mZnNldClcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSBhbiBpcnJlZHVjaWJsZSBnZW5lcmF0b3IgcG9seW5vbWlhbCBvZiBzcGVjaWZpZWQgZGVncmVlXG4gKiAodXNlZCBieSBSZWVkLVNvbG9tb24gZW5jb2RlcilcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGRlZ3JlZSBEZWdyZWUgb2YgdGhlIGdlbmVyYXRvciBwb2x5bm9taWFsXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICBCdWZmZXIgY29udGFpbmluZyBwb2x5bm9taWFsIGNvZWZmaWNpZW50c1xuICovXG5leHBvcnRzLmdlbmVyYXRlRUNQb2x5bm9taWFsID0gZnVuY3Rpb24gZ2VuZXJhdGVFQ1BvbHlub21pYWwgKGRlZ3JlZSkge1xuICBsZXQgcG9seSA9IG5ldyBVaW50OEFycmF5KFsxXSlcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZWdyZWU7IGkrKykge1xuICAgIHBvbHkgPSBleHBvcnRzLm11bChwb2x5LCBuZXcgVWludDhBcnJheShbMSwgR0YuZXhwKGkpXSkpXG4gIH1cblxuICByZXR1cm4gcG9seVxufVxuIiwgImNvbnN0IFBvbHlub21pYWwgPSByZXF1aXJlKCcuL3BvbHlub21pYWwnKVxuXG5mdW5jdGlvbiBSZWVkU29sb21vbkVuY29kZXIgKGRlZ3JlZSkge1xuICB0aGlzLmdlblBvbHkgPSB1bmRlZmluZWRcbiAgdGhpcy5kZWdyZWUgPSBkZWdyZWVcblxuICBpZiAodGhpcy5kZWdyZWUpIHRoaXMuaW5pdGlhbGl6ZSh0aGlzLmRlZ3JlZSlcbn1cblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSBlbmNvZGVyLlxuICogVGhlIGlucHV0IHBhcmFtIHNob3VsZCBjb3JyZXNwb25kIHRvIHRoZSBudW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHMuXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBkZWdyZWVcbiAqL1xuUmVlZFNvbG9tb25FbmNvZGVyLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24gaW5pdGlhbGl6ZSAoZGVncmVlKSB7XG4gIC8vIGNyZWF0ZSBhbiBpcnJlZHVjaWJsZSBnZW5lcmF0b3IgcG9seW5vbWlhbFxuICB0aGlzLmRlZ3JlZSA9IGRlZ3JlZVxuICB0aGlzLmdlblBvbHkgPSBQb2x5bm9taWFsLmdlbmVyYXRlRUNQb2x5bm9taWFsKHRoaXMuZGVncmVlKVxufVxuXG4vKipcbiAqIEVuY29kZXMgYSBjaHVuayBvZiBkYXRhXG4gKlxuICogQHBhcmFtICB7VWludDhBcnJheX0gZGF0YSBCdWZmZXIgY29udGFpbmluZyBpbnB1dCBkYXRhXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICAgIEJ1ZmZlciBjb250YWluaW5nIGVuY29kZWQgZGF0YVxuICovXG5SZWVkU29sb21vbkVuY29kZXIucHJvdG90eXBlLmVuY29kZSA9IGZ1bmN0aW9uIGVuY29kZSAoZGF0YSkge1xuICBpZiAoIXRoaXMuZ2VuUG9seSkge1xuICAgIHRocm93IG5ldyBFcnJvcignRW5jb2RlciBub3QgaW5pdGlhbGl6ZWQnKVxuICB9XG5cbiAgLy8gQ2FsY3VsYXRlIEVDIGZvciB0aGlzIGRhdGEgYmxvY2tcbiAgLy8gZXh0ZW5kcyBkYXRhIHNpemUgdG8gZGF0YStnZW5Qb2x5IHNpemVcbiAgY29uc3QgcGFkZGVkRGF0YSA9IG5ldyBVaW50OEFycmF5KGRhdGEubGVuZ3RoICsgdGhpcy5kZWdyZWUpXG4gIHBhZGRlZERhdGEuc2V0KGRhdGEpXG5cbiAgLy8gVGhlIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzIGFyZSB0aGUgcmVtYWluZGVyIGFmdGVyIGRpdmlkaW5nIHRoZSBkYXRhIGNvZGV3b3Jkc1xuICAvLyBieSBhIGdlbmVyYXRvciBwb2x5bm9taWFsXG4gIGNvbnN0IHJlbWFpbmRlciA9IFBvbHlub21pYWwubW9kKHBhZGRlZERhdGEsIHRoaXMuZ2VuUG9seSlcblxuICAvLyByZXR1cm4gRUMgZGF0YSBibG9ja3MgKGxhc3QgbiBieXRlLCB3aGVyZSBuIGlzIHRoZSBkZWdyZWUgb2YgZ2VuUG9seSlcbiAgLy8gSWYgY29lZmZpY2llbnRzIG51bWJlciBpbiByZW1haW5kZXIgYXJlIGxlc3MgdGhhbiBnZW5Qb2x5IGRlZ3JlZSxcbiAgLy8gcGFkIHdpdGggMHMgdG8gdGhlIGxlZnQgdG8gcmVhY2ggdGhlIG5lZWRlZCBudW1iZXIgb2YgY29lZmZpY2llbnRzXG4gIGNvbnN0IHN0YXJ0ID0gdGhpcy5kZWdyZWUgLSByZW1haW5kZXIubGVuZ3RoXG4gIGlmIChzdGFydCA+IDApIHtcbiAgICBjb25zdCBidWZmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5kZWdyZWUpXG4gICAgYnVmZi5zZXQocmVtYWluZGVyLCBzdGFydClcblxuICAgIHJldHVybiBidWZmXG4gIH1cblxuICByZXR1cm4gcmVtYWluZGVyXG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVlZFNvbG9tb25FbmNvZGVyXG4iLCAiLyoqXG4gKiBDaGVjayBpZiBRUiBDb2RlIHZlcnNpb24gaXMgdmFsaWRcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICB0cnVlIGlmIHZhbGlkIHZlcnNpb24sIGZhbHNlIG90aGVyd2lzZVxuICovXG5leHBvcnRzLmlzVmFsaWQgPSBmdW5jdGlvbiBpc1ZhbGlkICh2ZXJzaW9uKSB7XG4gIHJldHVybiAhaXNOYU4odmVyc2lvbikgJiYgdmVyc2lvbiA+PSAxICYmIHZlcnNpb24gPD0gNDBcbn1cbiIsICJjb25zdCBudW1lcmljID0gJ1swLTldKydcbmNvbnN0IGFscGhhbnVtZXJpYyA9ICdbQS1aICQlKitcXFxcLS4vOl0rJ1xubGV0IGthbmppID0gJyg/Olt1MzAwMC11MzAzRl18W3UzMDQwLXUzMDlGXXxbdTMwQTAtdTMwRkZdfCcgK1xuICAnW3VGRjAwLXVGRkVGXXxbdTRFMDAtdTlGQUZdfFt1MjYwNS11MjYwNl18W3UyMTkwLXUyMTk1XXx1MjAzQnwnICtcbiAgJ1t1MjAxMHUyMDE1dTIwMTh1MjAxOXUyMDI1dTIwMjZ1MjAxQ3UyMDFEdTIyMjV1MjI2MF18JyArXG4gICdbdTAzOTEtdTA0NTFdfFt1MDBBN3UwMEE4dTAwQjF1MDBCNHUwMEQ3dTAwRjddKSsnXG5rYW5qaSA9IGthbmppLnJlcGxhY2UoL3UvZywgJ1xcXFx1JylcblxuY29uc3QgYnl0ZSA9ICcoPzooPyFbQS1aMC05ICQlKitcXFxcLS4vOl18JyArIGthbmppICsgJykoPzoufFtcXHJcXG5dKSkrJ1xuXG5leHBvcnRzLktBTkpJID0gbmV3IFJlZ0V4cChrYW5qaSwgJ2cnKVxuZXhwb3J0cy5CWVRFX0tBTkpJID0gbmV3IFJlZ0V4cCgnW15BLVowLTkgJCUqK1xcXFwtLi86XSsnLCAnZycpXG5leHBvcnRzLkJZVEUgPSBuZXcgUmVnRXhwKGJ5dGUsICdnJylcbmV4cG9ydHMuTlVNRVJJQyA9IG5ldyBSZWdFeHAobnVtZXJpYywgJ2cnKVxuZXhwb3J0cy5BTFBIQU5VTUVSSUMgPSBuZXcgUmVnRXhwKGFscGhhbnVtZXJpYywgJ2cnKVxuXG5jb25zdCBURVNUX0tBTkpJID0gbmV3IFJlZ0V4cCgnXicgKyBrYW5qaSArICckJylcbmNvbnN0IFRFU1RfTlVNRVJJQyA9IG5ldyBSZWdFeHAoJ14nICsgbnVtZXJpYyArICckJylcbmNvbnN0IFRFU1RfQUxQSEFOVU1FUklDID0gbmV3IFJlZ0V4cCgnXltBLVowLTkgJCUqK1xcXFwtLi86XSskJylcblxuZXhwb3J0cy50ZXN0S2FuamkgPSBmdW5jdGlvbiB0ZXN0S2FuamkgKHN0cikge1xuICByZXR1cm4gVEVTVF9LQU5KSS50ZXN0KHN0cilcbn1cblxuZXhwb3J0cy50ZXN0TnVtZXJpYyA9IGZ1bmN0aW9uIHRlc3ROdW1lcmljIChzdHIpIHtcbiAgcmV0dXJuIFRFU1RfTlVNRVJJQy50ZXN0KHN0cilcbn1cblxuZXhwb3J0cy50ZXN0QWxwaGFudW1lcmljID0gZnVuY3Rpb24gdGVzdEFscGhhbnVtZXJpYyAoc3RyKSB7XG4gIHJldHVybiBURVNUX0FMUEhBTlVNRVJJQy50ZXN0KHN0cilcbn1cbiIsICJjb25zdCBWZXJzaW9uQ2hlY2sgPSByZXF1aXJlKCcuL3ZlcnNpb24tY2hlY2snKVxuY29uc3QgUmVnZXggPSByZXF1aXJlKCcuL3JlZ2V4JylcblxuLyoqXG4gKiBOdW1lcmljIG1vZGUgZW5jb2RlcyBkYXRhIGZyb20gdGhlIGRlY2ltYWwgZGlnaXQgc2V0ICgwIC0gOSlcbiAqIChieXRlIHZhbHVlcyAzMEhFWCB0byAzOUhFWCkuXG4gKiBOb3JtYWxseSwgMyBkYXRhIGNoYXJhY3RlcnMgYXJlIHJlcHJlc2VudGVkIGJ5IDEwIGJpdHMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuZXhwb3J0cy5OVU1FUklDID0ge1xuICBpZDogJ051bWVyaWMnLFxuICBiaXQ6IDEgPDwgMCxcbiAgY2NCaXRzOiBbMTAsIDEyLCAxNF1cbn1cblxuLyoqXG4gKiBBbHBoYW51bWVyaWMgbW9kZSBlbmNvZGVzIGRhdGEgZnJvbSBhIHNldCBvZiA0NSBjaGFyYWN0ZXJzLFxuICogaS5lLiAxMCBudW1lcmljIGRpZ2l0cyAoMCAtIDkpLFxuICogICAgICAyNiBhbHBoYWJldGljIGNoYXJhY3RlcnMgKEEgLSBaKSxcbiAqICAgYW5kIDkgc3ltYm9scyAoU1AsICQsICUsICosICssIC0sIC4sIC8sIDopLlxuICogTm9ybWFsbHksIHR3byBpbnB1dCBjaGFyYWN0ZXJzIGFyZSByZXByZXNlbnRlZCBieSAxMSBiaXRzLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmV4cG9ydHMuQUxQSEFOVU1FUklDID0ge1xuICBpZDogJ0FscGhhbnVtZXJpYycsXG4gIGJpdDogMSA8PCAxLFxuICBjY0JpdHM6IFs5LCAxMSwgMTNdXG59XG5cbi8qKlxuICogSW4gYnl0ZSBtb2RlLCBkYXRhIGlzIGVuY29kZWQgYXQgOCBiaXRzIHBlciBjaGFyYWN0ZXIuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuZXhwb3J0cy5CWVRFID0ge1xuICBpZDogJ0J5dGUnLFxuICBiaXQ6IDEgPDwgMixcbiAgY2NCaXRzOiBbOCwgMTYsIDE2XVxufVxuXG4vKipcbiAqIFRoZSBLYW5qaSBtb2RlIGVmZmljaWVudGx5IGVuY29kZXMgS2FuamkgY2hhcmFjdGVycyBpbiBhY2NvcmRhbmNlIHdpdGhcbiAqIHRoZSBTaGlmdCBKSVMgc3lzdGVtIGJhc2VkIG9uIEpJUyBYIDAyMDguXG4gKiBUaGUgU2hpZnQgSklTIHZhbHVlcyBhcmUgc2hpZnRlZCBmcm9tIHRoZSBKSVMgWCAwMjA4IHZhbHVlcy5cbiAqIEpJUyBYIDAyMDggZ2l2ZXMgZGV0YWlscyBvZiB0aGUgc2hpZnQgY29kZWQgcmVwcmVzZW50YXRpb24uXG4gKiBFYWNoIHR3by1ieXRlIGNoYXJhY3RlciB2YWx1ZSBpcyBjb21wYWN0ZWQgdG8gYSAxMy1iaXQgYmluYXJ5IGNvZGV3b3JkLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmV4cG9ydHMuS0FOSkkgPSB7XG4gIGlkOiAnS2FuamknLFxuICBiaXQ6IDEgPDwgMyxcbiAgY2NCaXRzOiBbOCwgMTAsIDEyXVxufVxuXG4vKipcbiAqIE1peGVkIG1vZGUgd2lsbCBjb250YWluIGEgc2VxdWVuY2VzIG9mIGRhdGEgaW4gYSBjb21iaW5hdGlvbiBvZiBhbnkgb2ZcbiAqIHRoZSBtb2RlcyBkZXNjcmliZWQgYWJvdmVcbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnRzLk1JWEVEID0ge1xuICBiaXQ6IC0xXG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGJpdHMgbmVlZGVkIHRvIHN0b3JlIHRoZSBkYXRhIGxlbmd0aFxuICogYWNjb3JkaW5nIHRvIFFSIENvZGUgc3BlY2lmaWNhdGlvbnMuXG4gKlxuICogQHBhcmFtICB7TW9kZX0gICBtb2RlICAgIERhdGEgbW9kZVxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgIE51bWJlciBvZiBiaXRzXG4gKi9cbmV4cG9ydHMuZ2V0Q2hhckNvdW50SW5kaWNhdG9yID0gZnVuY3Rpb24gZ2V0Q2hhckNvdW50SW5kaWNhdG9yIChtb2RlLCB2ZXJzaW9uKSB7XG4gIGlmICghbW9kZS5jY0JpdHMpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBtb2RlOiAnICsgbW9kZSlcblxuICBpZiAoIVZlcnNpb25DaGVjay5pc1ZhbGlkKHZlcnNpb24pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHZlcnNpb246ICcgKyB2ZXJzaW9uKVxuICB9XG5cbiAgaWYgKHZlcnNpb24gPj0gMSAmJiB2ZXJzaW9uIDwgMTApIHJldHVybiBtb2RlLmNjQml0c1swXVxuICBlbHNlIGlmICh2ZXJzaW9uIDwgMjcpIHJldHVybiBtb2RlLmNjQml0c1sxXVxuICByZXR1cm4gbW9kZS5jY0JpdHNbMl1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtb3N0IGVmZmljaWVudCBtb2RlIHRvIHN0b3JlIHRoZSBzcGVjaWZpZWQgZGF0YVxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YVN0ciBJbnB1dCBkYXRhIHN0cmluZ1xuICogQHJldHVybiB7TW9kZX0gICAgICAgICAgIEJlc3QgbW9kZVxuICovXG5leHBvcnRzLmdldEJlc3RNb2RlRm9yRGF0YSA9IGZ1bmN0aW9uIGdldEJlc3RNb2RlRm9yRGF0YSAoZGF0YVN0cikge1xuICBpZiAoUmVnZXgudGVzdE51bWVyaWMoZGF0YVN0cikpIHJldHVybiBleHBvcnRzLk5VTUVSSUNcbiAgZWxzZSBpZiAoUmVnZXgudGVzdEFscGhhbnVtZXJpYyhkYXRhU3RyKSkgcmV0dXJuIGV4cG9ydHMuQUxQSEFOVU1FUklDXG4gIGVsc2UgaWYgKFJlZ2V4LnRlc3RLYW5qaShkYXRhU3RyKSkgcmV0dXJuIGV4cG9ydHMuS0FOSklcbiAgZWxzZSByZXR1cm4gZXhwb3J0cy5CWVRFXG59XG5cbi8qKlxuICogUmV0dXJuIG1vZGUgbmFtZSBhcyBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge01vZGV9IG1vZGUgTW9kZSBvYmplY3RcbiAqIEByZXR1cm5zIHtTdHJpbmd9ICBNb2RlIG5hbWVcbiAqL1xuZXhwb3J0cy50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nIChtb2RlKSB7XG4gIGlmIChtb2RlICYmIG1vZGUuaWQpIHJldHVybiBtb2RlLmlkXG4gIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBtb2RlJylcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBpbnB1dCBwYXJhbSBpcyBhIHZhbGlkIG1vZGUgb2JqZWN0XG4gKlxuICogQHBhcmFtICAge01vZGV9ICAgIG1vZGUgTW9kZSBvYmplY3RcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHZhbGlkIG1vZGUsIGZhbHNlIG90aGVyd2lzZVxuICovXG5leHBvcnRzLmlzVmFsaWQgPSBmdW5jdGlvbiBpc1ZhbGlkIChtb2RlKSB7XG4gIHJldHVybiBtb2RlICYmIG1vZGUuYml0ICYmIG1vZGUuY2NCaXRzXG59XG5cbi8qKlxuICogR2V0IG1vZGUgb2JqZWN0IGZyb20gaXRzIG5hbWVcbiAqXG4gKiBAcGFyYW0gICB7U3RyaW5nfSBzdHJpbmcgTW9kZSBuYW1lXG4gKiBAcmV0dXJucyB7TW9kZX0gICAgICAgICAgTW9kZSBvYmplY3RcbiAqL1xuZnVuY3Rpb24gZnJvbVN0cmluZyAoc3RyaW5nKSB7XG4gIGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBFcnJvcignUGFyYW0gaXMgbm90IGEgc3RyaW5nJylcbiAgfVxuXG4gIGNvbnN0IGxjU3RyID0gc3RyaW5nLnRvTG93ZXJDYXNlKClcblxuICBzd2l0Y2ggKGxjU3RyKSB7XG4gICAgY2FzZSAnbnVtZXJpYyc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5OVU1FUklDXG4gICAgY2FzZSAnYWxwaGFudW1lcmljJzpcbiAgICAgIHJldHVybiBleHBvcnRzLkFMUEhBTlVNRVJJQ1xuICAgIGNhc2UgJ2thbmppJzpcbiAgICAgIHJldHVybiBleHBvcnRzLktBTkpJXG4gICAgY2FzZSAnYnl0ZSc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5CWVRFXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBtb2RlOiAnICsgc3RyaW5nKVxuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBtb2RlIGZyb20gYSB2YWx1ZS5cbiAqIElmIHZhbHVlIGlzIG5vdCBhIHZhbGlkIG1vZGUsIHJldHVybnMgZGVmYXVsdFZhbHVlXG4gKlxuICogQHBhcmFtICB7TW9kZXxTdHJpbmd9IHZhbHVlICAgICAgICBFbmNvZGluZyBtb2RlXG4gKiBAcGFyYW0gIHtNb2RlfSAgICAgICAgZGVmYXVsdFZhbHVlIEZhbGxiYWNrIHZhbHVlXG4gKiBAcmV0dXJuIHtNb2RlfSAgICAgICAgICAgICAgICAgICAgIEVuY29kaW5nIG1vZGVcbiAqL1xuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSAodmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAoZXhwb3J0cy5pc1ZhbGlkKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gZnJvbVN0cmluZyh2YWx1ZSlcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgfVxufVxuIiwgImNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5jb25zdCBFQ0NvZGUgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tY29kZScpXG5jb25zdCBFQ0xldmVsID0gcmVxdWlyZSgnLi9lcnJvci1jb3JyZWN0aW9uLWxldmVsJylcbmNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxuY29uc3QgVmVyc2lvbkNoZWNrID0gcmVxdWlyZSgnLi92ZXJzaW9uLWNoZWNrJylcblxuLy8gR2VuZXJhdG9yIHBvbHlub21pYWwgdXNlZCB0byBlbmNvZGUgdmVyc2lvbiBpbmZvcm1hdGlvblxuY29uc3QgRzE4ID0gKDEgPDwgMTIpIHwgKDEgPDwgMTEpIHwgKDEgPDwgMTApIHwgKDEgPDwgOSkgfCAoMSA8PCA4KSB8ICgxIDw8IDUpIHwgKDEgPDwgMikgfCAoMSA8PCAwKVxuY29uc3QgRzE4X0JDSCA9IFV0aWxzLmdldEJDSERpZ2l0KEcxOClcblxuZnVuY3Rpb24gZ2V0QmVzdFZlcnNpb25Gb3JEYXRhTGVuZ3RoIChtb2RlLCBsZW5ndGgsIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XG4gIGZvciAobGV0IGN1cnJlbnRWZXJzaW9uID0gMTsgY3VycmVudFZlcnNpb24gPD0gNDA7IGN1cnJlbnRWZXJzaW9uKyspIHtcbiAgICBpZiAobGVuZ3RoIDw9IGV4cG9ydHMuZ2V0Q2FwYWNpdHkoY3VycmVudFZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBtb2RlKSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRWZXJzaW9uXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZFxufVxuXG5mdW5jdGlvbiBnZXRSZXNlcnZlZEJpdHNDb3VudCAobW9kZSwgdmVyc2lvbikge1xuICAvLyBDaGFyYWN0ZXIgY291bnQgaW5kaWNhdG9yICsgbW9kZSBpbmRpY2F0b3IgYml0c1xuICByZXR1cm4gTW9kZS5nZXRDaGFyQ291bnRJbmRpY2F0b3IobW9kZSwgdmVyc2lvbikgKyA0XG59XG5cbmZ1bmN0aW9uIGdldFRvdGFsQml0c0Zyb21EYXRhQXJyYXkgKHNlZ21lbnRzLCB2ZXJzaW9uKSB7XG4gIGxldCB0b3RhbEJpdHMgPSAwXG5cbiAgc2VnbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgIGNvbnN0IHJlc2VydmVkQml0cyA9IGdldFJlc2VydmVkQml0c0NvdW50KGRhdGEubW9kZSwgdmVyc2lvbilcbiAgICB0b3RhbEJpdHMgKz0gcmVzZXJ2ZWRCaXRzICsgZGF0YS5nZXRCaXRzTGVuZ3RoKClcbiAgfSlcblxuICByZXR1cm4gdG90YWxCaXRzXG59XG5cbmZ1bmN0aW9uIGdldEJlc3RWZXJzaW9uRm9yTWl4ZWREYXRhIChzZWdtZW50cywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcbiAgZm9yIChsZXQgY3VycmVudFZlcnNpb24gPSAxOyBjdXJyZW50VmVyc2lvbiA8PSA0MDsgY3VycmVudFZlcnNpb24rKykge1xuICAgIGNvbnN0IGxlbmd0aCA9IGdldFRvdGFsQml0c0Zyb21EYXRhQXJyYXkoc2VnbWVudHMsIGN1cnJlbnRWZXJzaW9uKVxuICAgIGlmIChsZW5ndGggPD0gZXhwb3J0cy5nZXRDYXBhY2l0eShjdXJyZW50VmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIE1vZGUuTUlYRUQpKSB7XG4gICAgICByZXR1cm4gY3VycmVudFZlcnNpb25cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkXG59XG5cbi8qKlxuICogUmV0dXJucyB2ZXJzaW9uIG51bWJlciBmcm9tIGEgdmFsdWUuXG4gKiBJZiB2YWx1ZSBpcyBub3QgYSB2YWxpZCB2ZXJzaW9uLCByZXR1cm5zIGRlZmF1bHRWYWx1ZVxuICpcbiAqIEBwYXJhbSAge051bWJlcnxTdHJpbmd9IHZhbHVlICAgICAgICBRUiBDb2RlIHZlcnNpb25cbiAqIEBwYXJhbSAge051bWJlcn0gICAgICAgIGRlZmF1bHRWYWx1ZSBGYWxsYmFjayB2YWx1ZVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvbiBudW1iZXJcbiAqL1xuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSAodmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAoVmVyc2lvbkNoZWNrLmlzVmFsaWQodmFsdWUpKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KHZhbHVlLCAxMClcbiAgfVxuXG4gIHJldHVybiBkZWZhdWx0VmFsdWVcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGhvdyBtdWNoIGRhdGEgY2FuIGJlIHN0b3JlZCB3aXRoIHRoZSBzcGVjaWZpZWQgUVIgY29kZSB2ZXJzaW9uXG4gKiBhbmQgZXJyb3IgY29ycmVjdGlvbiBsZXZlbFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uICgxLTQwKVxuICogQHBhcmFtICB7TnVtYmVyfSBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKiBAcGFyYW0gIHtNb2RlfSAgIG1vZGUgICAgICAgICAgICAgICAgIERhdGEgbW9kZVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgICBRdWFudGl0eSBvZiBzdG9yYWJsZSBkYXRhXG4gKi9cbmV4cG9ydHMuZ2V0Q2FwYWNpdHkgPSBmdW5jdGlvbiBnZXRDYXBhY2l0eSAodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1vZGUpIHtcbiAgaWYgKCFWZXJzaW9uQ2hlY2suaXNWYWxpZCh2ZXJzaW9uKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBRUiBDb2RlIHZlcnNpb24nKVxuICB9XG5cbiAgLy8gVXNlIEJ5dGUgbW9kZSBhcyBkZWZhdWx0XG4gIGlmICh0eXBlb2YgbW9kZSA9PT0gJ3VuZGVmaW5lZCcpIG1vZGUgPSBNb2RlLkJZVEVcblxuICAvLyBUb3RhbCBjb2Rld29yZHMgZm9yIHRoaXMgUVIgY29kZSB2ZXJzaW9uIChEYXRhICsgRXJyb3IgY29ycmVjdGlvbilcbiAgY29uc3QgdG90YWxDb2Rld29yZHMgPSBVdGlscy5nZXRTeW1ib2xUb3RhbENvZGV3b3Jkcyh2ZXJzaW9uKVxuXG4gIC8vIFRvdGFsIG51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3Jkc1xuICBjb25zdCBlY1RvdGFsQ29kZXdvcmRzID0gRUNDb2RlLmdldFRvdGFsQ29kZXdvcmRzQ291bnQodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXG5cbiAgLy8gVG90YWwgbnVtYmVyIG9mIGRhdGEgY29kZXdvcmRzXG4gIGNvbnN0IGRhdGFUb3RhbENvZGV3b3Jkc0JpdHMgPSAodG90YWxDb2Rld29yZHMgLSBlY1RvdGFsQ29kZXdvcmRzKSAqIDhcblxuICBpZiAobW9kZSA9PT0gTW9kZS5NSVhFRCkgcmV0dXJuIGRhdGFUb3RhbENvZGV3b3Jkc0JpdHNcblxuICBjb25zdCB1c2FibGVCaXRzID0gZGF0YVRvdGFsQ29kZXdvcmRzQml0cyAtIGdldFJlc2VydmVkQml0c0NvdW50KG1vZGUsIHZlcnNpb24pXG5cbiAgLy8gUmV0dXJuIG1heCBudW1iZXIgb2Ygc3RvcmFibGUgY29kZXdvcmRzXG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgTW9kZS5OVU1FUklDOlxuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKHVzYWJsZUJpdHMgLyAxMCkgKiAzKVxuXG4gICAgY2FzZSBNb2RlLkFMUEhBTlVNRVJJQzpcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKCh1c2FibGVCaXRzIC8gMTEpICogMilcblxuICAgIGNhc2UgTW9kZS5LQU5KSTpcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKHVzYWJsZUJpdHMgLyAxMylcblxuICAgIGNhc2UgTW9kZS5CWVRFOlxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcih1c2FibGVCaXRzIC8gOClcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gdmVyc2lvbiBuZWVkZWQgdG8gY29udGFpbiB0aGUgYW1vdW50IG9mIGRhdGFcbiAqXG4gKiBAcGFyYW0gIHtTZWdtZW50fSBkYXRhICAgICAgICAgICAgICAgICAgICBTZWdtZW50IG9mIGRhdGFcbiAqIEBwYXJhbSAge051bWJlcn0gW2Vycm9yQ29ycmVjdGlvbkxldmVsPUhdIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqIEBwYXJhbSAge01vZGV9IG1vZGUgICAgICAgICAgICAgICAgICAgICAgIERhdGEgbW9kZVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXG4gKi9cbmV4cG9ydHMuZ2V0QmVzdFZlcnNpb25Gb3JEYXRhID0gZnVuY3Rpb24gZ2V0QmVzdFZlcnNpb25Gb3JEYXRhIChkYXRhLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xuICBsZXQgc2VnXG5cbiAgY29uc3QgZWNsID0gRUNMZXZlbC5mcm9tKGVycm9yQ29ycmVjdGlvbkxldmVsLCBFQ0xldmVsLk0pXG5cbiAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcbiAgICBpZiAoZGF0YS5sZW5ndGggPiAxKSB7XG4gICAgICByZXR1cm4gZ2V0QmVzdFZlcnNpb25Gb3JNaXhlZERhdGEoZGF0YSwgZWNsKVxuICAgIH1cblxuICAgIGlmIChkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG5cbiAgICBzZWcgPSBkYXRhWzBdXG4gIH0gZWxzZSB7XG4gICAgc2VnID0gZGF0YVxuICB9XG5cbiAgcmV0dXJuIGdldEJlc3RWZXJzaW9uRm9yRGF0YUxlbmd0aChzZWcubW9kZSwgc2VnLmdldExlbmd0aCgpLCBlY2wpXG59XG5cbi8qKlxuICogUmV0dXJucyB2ZXJzaW9uIGluZm9ybWF0aW9uIHdpdGggcmVsYXRpdmUgZXJyb3IgY29ycmVjdGlvbiBiaXRzXG4gKlxuICogVGhlIHZlcnNpb24gaW5mb3JtYXRpb24gaXMgaW5jbHVkZWQgaW4gUVIgQ29kZSBzeW1ib2xzIG9mIHZlcnNpb24gNyBvciBsYXJnZXIuXG4gKiBJdCBjb25zaXN0cyBvZiBhbiAxOC1iaXQgc2VxdWVuY2UgY29udGFpbmluZyA2IGRhdGEgYml0cyxcbiAqIHdpdGggMTIgZXJyb3IgY29ycmVjdGlvbiBiaXRzIGNhbGN1bGF0ZWQgdXNpbmcgdGhlICgxOCwgNikgR29sYXkgY29kZS5cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgRW5jb2RlZCB2ZXJzaW9uIGluZm8gYml0c1xuICovXG5leHBvcnRzLmdldEVuY29kZWRCaXRzID0gZnVuY3Rpb24gZ2V0RW5jb2RlZEJpdHMgKHZlcnNpb24pIHtcbiAgaWYgKCFWZXJzaW9uQ2hlY2suaXNWYWxpZCh2ZXJzaW9uKSB8fCB2ZXJzaW9uIDwgNykge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBRUiBDb2RlIHZlcnNpb24nKVxuICB9XG5cbiAgbGV0IGQgPSB2ZXJzaW9uIDw8IDEyXG5cbiAgd2hpbGUgKFV0aWxzLmdldEJDSERpZ2l0KGQpIC0gRzE4X0JDSCA+PSAwKSB7XG4gICAgZCBePSAoRzE4IDw8IChVdGlscy5nZXRCQ0hEaWdpdChkKSAtIEcxOF9CQ0gpKVxuICB9XG5cbiAgcmV0dXJuICh2ZXJzaW9uIDw8IDEyKSB8IGRcbn1cbiIsICJjb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuXG5jb25zdCBHMTUgPSAoMSA8PCAxMCkgfCAoMSA8PCA4KSB8ICgxIDw8IDUpIHwgKDEgPDwgNCkgfCAoMSA8PCAyKSB8ICgxIDw8IDEpIHwgKDEgPDwgMClcbmNvbnN0IEcxNV9NQVNLID0gKDEgPDwgMTQpIHwgKDEgPDwgMTIpIHwgKDEgPDwgMTApIHwgKDEgPDwgNCkgfCAoMSA8PCAxKVxuY29uc3QgRzE1X0JDSCA9IFV0aWxzLmdldEJDSERpZ2l0KEcxNSlcblxuLyoqXG4gKiBSZXR1cm5zIGZvcm1hdCBpbmZvcm1hdGlvbiB3aXRoIHJlbGF0aXZlIGVycm9yIGNvcnJlY3Rpb24gYml0c1xuICpcbiAqIFRoZSBmb3JtYXQgaW5mb3JtYXRpb24gaXMgYSAxNS1iaXQgc2VxdWVuY2UgY29udGFpbmluZyA1IGRhdGEgYml0cyxcbiAqIHdpdGggMTAgZXJyb3IgY29ycmVjdGlvbiBiaXRzIGNhbGN1bGF0ZWQgdXNpbmcgdGhlICgxNSwgNSkgQkNIIGNvZGUuXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG1hc2sgICAgICAgICAgICAgICAgIE1hc2sgcGF0dGVyblxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgICBFbmNvZGVkIGZvcm1hdCBpbmZvcm1hdGlvbiBiaXRzXG4gKi9cbmV4cG9ydHMuZ2V0RW5jb2RlZEJpdHMgPSBmdW5jdGlvbiBnZXRFbmNvZGVkQml0cyAoZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2spIHtcbiAgY29uc3QgZGF0YSA9ICgoZXJyb3JDb3JyZWN0aW9uTGV2ZWwuYml0IDw8IDMpIHwgbWFzaylcbiAgbGV0IGQgPSBkYXRhIDw8IDEwXG5cbiAgd2hpbGUgKFV0aWxzLmdldEJDSERpZ2l0KGQpIC0gRzE1X0JDSCA+PSAwKSB7XG4gICAgZCBePSAoRzE1IDw8IChVdGlscy5nZXRCQ0hEaWdpdChkKSAtIEcxNV9CQ0gpKVxuICB9XG5cbiAgLy8geG9yIGZpbmFsIGRhdGEgd2l0aCBtYXNrIHBhdHRlcm4gaW4gb3JkZXIgdG8gZW5zdXJlIHRoYXRcbiAgLy8gbm8gY29tYmluYXRpb24gb2YgRXJyb3IgQ29ycmVjdGlvbiBMZXZlbCBhbmQgZGF0YSBtYXNrIHBhdHRlcm5cbiAgLy8gd2lsbCByZXN1bHQgaW4gYW4gYWxsLXplcm8gZGF0YSBzdHJpbmdcbiAgcmV0dXJuICgoZGF0YSA8PCAxMCkgfCBkKSBeIEcxNV9NQVNLXG59XG4iLCAiY29uc3QgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG5cbmZ1bmN0aW9uIE51bWVyaWNEYXRhIChkYXRhKSB7XG4gIHRoaXMubW9kZSA9IE1vZGUuTlVNRVJJQ1xuICB0aGlzLmRhdGEgPSBkYXRhLnRvU3RyaW5nKClcbn1cblxuTnVtZXJpY0RhdGEuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKGxlbmd0aCkge1xuICByZXR1cm4gMTAgKiBNYXRoLmZsb29yKGxlbmd0aCAvIDMpICsgKChsZW5ndGggJSAzKSA/ICgobGVuZ3RoICUgMykgKiAzICsgMSkgOiAwKVxufVxuXG5OdW1lcmljRGF0YS5wcm90b3R5cGUuZ2V0TGVuZ3RoID0gZnVuY3Rpb24gZ2V0TGVuZ3RoICgpIHtcbiAgcmV0dXJuIHRoaXMuZGF0YS5sZW5ndGhcbn1cblxuTnVtZXJpY0RhdGEucHJvdG90eXBlLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoICgpIHtcbiAgcmV0dXJuIE51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGgodGhpcy5kYXRhLmxlbmd0aClcbn1cblxuTnVtZXJpY0RhdGEucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKGJpdEJ1ZmZlcikge1xuICBsZXQgaSwgZ3JvdXAsIHZhbHVlXG5cbiAgLy8gVGhlIGlucHV0IGRhdGEgc3RyaW5nIGlzIGRpdmlkZWQgaW50byBncm91cHMgb2YgdGhyZWUgZGlnaXRzLFxuICAvLyBhbmQgZWFjaCBncm91cCBpcyBjb252ZXJ0ZWQgdG8gaXRzIDEwLWJpdCBiaW5hcnkgZXF1aXZhbGVudC5cbiAgZm9yIChpID0gMDsgaSArIDMgPD0gdGhpcy5kYXRhLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgZ3JvdXAgPSB0aGlzLmRhdGEuc3Vic3RyKGksIDMpXG4gICAgdmFsdWUgPSBwYXJzZUludChncm91cCwgMTApXG5cbiAgICBiaXRCdWZmZXIucHV0KHZhbHVlLCAxMClcbiAgfVxuXG4gIC8vIElmIHRoZSBudW1iZXIgb2YgaW5wdXQgZGlnaXRzIGlzIG5vdCBhbiBleGFjdCBtdWx0aXBsZSBvZiB0aHJlZSxcbiAgLy8gdGhlIGZpbmFsIG9uZSBvciB0d28gZGlnaXRzIGFyZSBjb252ZXJ0ZWQgdG8gNCBvciA3IGJpdHMgcmVzcGVjdGl2ZWx5LlxuICBjb25zdCByZW1haW5pbmdOdW0gPSB0aGlzLmRhdGEubGVuZ3RoIC0gaVxuICBpZiAocmVtYWluaW5nTnVtID4gMCkge1xuICAgIGdyb3VwID0gdGhpcy5kYXRhLnN1YnN0cihpKVxuICAgIHZhbHVlID0gcGFyc2VJbnQoZ3JvdXAsIDEwKVxuXG4gICAgYml0QnVmZmVyLnB1dCh2YWx1ZSwgcmVtYWluaW5nTnVtICogMyArIDEpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOdW1lcmljRGF0YVxuIiwgImNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxuXG4vKipcbiAqIEFycmF5IG9mIGNoYXJhY3RlcnMgYXZhaWxhYmxlIGluIGFscGhhbnVtZXJpYyBtb2RlXG4gKlxuICogQXMgcGVyIFFSIENvZGUgc3BlY2lmaWNhdGlvbiwgdG8gZWFjaCBjaGFyYWN0ZXJcbiAqIGlzIGFzc2lnbmVkIGEgdmFsdWUgZnJvbSAwIHRvIDQ0IHdoaWNoIGluIHRoaXMgY2FzZSBjb2luY2lkZXNcbiAqIHdpdGggdGhlIGFycmF5IGluZGV4XG4gKlxuICogQHR5cGUge0FycmF5fVxuICovXG5jb25zdCBBTFBIQV9OVU1fQ0hBUlMgPSBbXG4gICcwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JyxcbiAgJ0EnLCAnQicsICdDJywgJ0QnLCAnRScsICdGJywgJ0cnLCAnSCcsICdJJywgJ0onLCAnSycsICdMJywgJ00nLFxuICAnTicsICdPJywgJ1AnLCAnUScsICdSJywgJ1MnLCAnVCcsICdVJywgJ1YnLCAnVycsICdYJywgJ1knLCAnWicsXG4gICcgJywgJyQnLCAnJScsICcqJywgJysnLCAnLScsICcuJywgJy8nLCAnOidcbl1cblxuZnVuY3Rpb24gQWxwaGFudW1lcmljRGF0YSAoZGF0YSkge1xuICB0aGlzLm1vZGUgPSBNb2RlLkFMUEhBTlVNRVJJQ1xuICB0aGlzLmRhdGEgPSBkYXRhXG59XG5cbkFscGhhbnVtZXJpY0RhdGEuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKGxlbmd0aCkge1xuICByZXR1cm4gMTEgKiBNYXRoLmZsb29yKGxlbmd0aCAvIDIpICsgNiAqIChsZW5ndGggJSAyKVxufVxuXG5BbHBoYW51bWVyaWNEYXRhLnByb3RvdHlwZS5nZXRMZW5ndGggPSBmdW5jdGlvbiBnZXRMZW5ndGggKCkge1xuICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aFxufVxuXG5BbHBoYW51bWVyaWNEYXRhLnByb3RvdHlwZS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAoKSB7XG4gIHJldHVybiBBbHBoYW51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGgodGhpcy5kYXRhLmxlbmd0aClcbn1cblxuQWxwaGFudW1lcmljRGF0YS5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiB3cml0ZSAoYml0QnVmZmVyKSB7XG4gIGxldCBpXG5cbiAgLy8gSW5wdXQgZGF0YSBjaGFyYWN0ZXJzIGFyZSBkaXZpZGVkIGludG8gZ3JvdXBzIG9mIHR3byBjaGFyYWN0ZXJzXG4gIC8vIGFuZCBlbmNvZGVkIGFzIDExLWJpdCBiaW5hcnkgY29kZXMuXG4gIGZvciAoaSA9IDA7IGkgKyAyIDw9IHRoaXMuZGF0YS5sZW5ndGg7IGkgKz0gMikge1xuICAgIC8vIFRoZSBjaGFyYWN0ZXIgdmFsdWUgb2YgdGhlIGZpcnN0IGNoYXJhY3RlciBpcyBtdWx0aXBsaWVkIGJ5IDQ1XG4gICAgbGV0IHZhbHVlID0gQUxQSEFfTlVNX0NIQVJTLmluZGV4T2YodGhpcy5kYXRhW2ldKSAqIDQ1XG5cbiAgICAvLyBUaGUgY2hhcmFjdGVyIHZhbHVlIG9mIHRoZSBzZWNvbmQgZGlnaXQgaXMgYWRkZWQgdG8gdGhlIHByb2R1Y3RcbiAgICB2YWx1ZSArPSBBTFBIQV9OVU1fQ0hBUlMuaW5kZXhPZih0aGlzLmRhdGFbaSArIDFdKVxuXG4gICAgLy8gVGhlIHN1bSBpcyB0aGVuIHN0b3JlZCBhcyAxMS1iaXQgYmluYXJ5IG51bWJlclxuICAgIGJpdEJ1ZmZlci5wdXQodmFsdWUsIDExKVxuICB9XG5cbiAgLy8gSWYgdGhlIG51bWJlciBvZiBpbnB1dCBkYXRhIGNoYXJhY3RlcnMgaXMgbm90IGEgbXVsdGlwbGUgb2YgdHdvLFxuICAvLyB0aGUgY2hhcmFjdGVyIHZhbHVlIG9mIHRoZSBmaW5hbCBjaGFyYWN0ZXIgaXMgZW5jb2RlZCBhcyBhIDYtYml0IGJpbmFyeSBudW1iZXIuXG4gIGlmICh0aGlzLmRhdGEubGVuZ3RoICUgMikge1xuICAgIGJpdEJ1ZmZlci5wdXQoQUxQSEFfTlVNX0NIQVJTLmluZGV4T2YodGhpcy5kYXRhW2ldKSwgNilcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFscGhhbnVtZXJpY0RhdGFcbiIsICJjb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcblxuZnVuY3Rpb24gQnl0ZURhdGEgKGRhdGEpIHtcbiAgdGhpcy5tb2RlID0gTW9kZS5CWVRFXG4gIGlmICh0eXBlb2YgKGRhdGEpID09PSAnc3RyaW5nJykge1xuICAgIHRoaXMuZGF0YSA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShkYXRhKVxuICB9IGVsc2Uge1xuICAgIHRoaXMuZGF0YSA9IG5ldyBVaW50OEFycmF5KGRhdGEpXG4gIH1cbn1cblxuQnl0ZURhdGEuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKGxlbmd0aCkge1xuICByZXR1cm4gbGVuZ3RoICogOFxufVxuXG5CeXRlRGF0YS5wcm90b3R5cGUuZ2V0TGVuZ3RoID0gZnVuY3Rpb24gZ2V0TGVuZ3RoICgpIHtcbiAgcmV0dXJuIHRoaXMuZGF0YS5sZW5ndGhcbn1cblxuQnl0ZURhdGEucHJvdG90eXBlLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoICgpIHtcbiAgcmV0dXJuIEJ5dGVEYXRhLmdldEJpdHNMZW5ndGgodGhpcy5kYXRhLmxlbmd0aClcbn1cblxuQnl0ZURhdGEucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKGJpdEJ1ZmZlcikge1xuICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMuZGF0YS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBiaXRCdWZmZXIucHV0KHRoaXMuZGF0YVtpXSwgOClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJ5dGVEYXRhXG4iLCAiY29uc3QgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG5jb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuXG5mdW5jdGlvbiBLYW5qaURhdGEgKGRhdGEpIHtcbiAgdGhpcy5tb2RlID0gTW9kZS5LQU5KSVxuICB0aGlzLmRhdGEgPSBkYXRhXG59XG5cbkthbmppRGF0YS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAobGVuZ3RoKSB7XG4gIHJldHVybiBsZW5ndGggKiAxM1xufVxuXG5LYW5qaURhdGEucHJvdG90eXBlLmdldExlbmd0aCA9IGZ1bmN0aW9uIGdldExlbmd0aCAoKSB7XG4gIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoXG59XG5cbkthbmppRGF0YS5wcm90b3R5cGUuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKCkge1xuICByZXR1cm4gS2FuamlEYXRhLmdldEJpdHNMZW5ndGgodGhpcy5kYXRhLmxlbmd0aClcbn1cblxuS2FuamlEYXRhLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChiaXRCdWZmZXIpIHtcbiAgbGV0IGlcblxuICAvLyBJbiB0aGUgU2hpZnQgSklTIHN5c3RlbSwgS2FuamkgY2hhcmFjdGVycyBhcmUgcmVwcmVzZW50ZWQgYnkgYSB0d28gYnl0ZSBjb21iaW5hdGlvbi5cbiAgLy8gVGhlc2UgYnl0ZSB2YWx1ZXMgYXJlIHNoaWZ0ZWQgZnJvbSB0aGUgSklTIFggMDIwOCB2YWx1ZXMuXG4gIC8vIEpJUyBYIDAyMDggZ2l2ZXMgZGV0YWlscyBvZiB0aGUgc2hpZnQgY29kZWQgcmVwcmVzZW50YXRpb24uXG4gIGZvciAoaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgdmFsdWUgPSBVdGlscy50b1NKSVModGhpcy5kYXRhW2ldKVxuXG4gICAgLy8gRm9yIGNoYXJhY3RlcnMgd2l0aCBTaGlmdCBKSVMgdmFsdWVzIGZyb20gMHg4MTQwIHRvIDB4OUZGQzpcbiAgICBpZiAodmFsdWUgPj0gMHg4MTQwICYmIHZhbHVlIDw9IDB4OUZGQykge1xuICAgICAgLy8gU3VidHJhY3QgMHg4MTQwIGZyb20gU2hpZnQgSklTIHZhbHVlXG4gICAgICB2YWx1ZSAtPSAweDgxNDBcblxuICAgIC8vIEZvciBjaGFyYWN0ZXJzIHdpdGggU2hpZnQgSklTIHZhbHVlcyBmcm9tIDB4RTA0MCB0byAweEVCQkZcbiAgICB9IGVsc2UgaWYgKHZhbHVlID49IDB4RTA0MCAmJiB2YWx1ZSA8PSAweEVCQkYpIHtcbiAgICAgIC8vIFN1YnRyYWN0IDB4QzE0MCBmcm9tIFNoaWZ0IEpJUyB2YWx1ZVxuICAgICAgdmFsdWUgLT0gMHhDMTQwXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ0ludmFsaWQgU0pJUyBjaGFyYWN0ZXI6ICcgKyB0aGlzLmRhdGFbaV0gKyAnXFxuJyArXG4gICAgICAgICdNYWtlIHN1cmUgeW91ciBjaGFyc2V0IGlzIFVURi04JylcbiAgICB9XG5cbiAgICAvLyBNdWx0aXBseSBtb3N0IHNpZ25pZmljYW50IGJ5dGUgb2YgcmVzdWx0IGJ5IDB4QzBcbiAgICAvLyBhbmQgYWRkIGxlYXN0IHNpZ25pZmljYW50IGJ5dGUgdG8gcHJvZHVjdFxuICAgIHZhbHVlID0gKCgodmFsdWUgPj4+IDgpICYgMHhmZikgKiAweEMwKSArICh2YWx1ZSAmIDB4ZmYpXG5cbiAgICAvLyBDb252ZXJ0IHJlc3VsdCB0byBhIDEzLWJpdCBiaW5hcnkgc3RyaW5nXG4gICAgYml0QnVmZmVyLnB1dCh2YWx1ZSwgMTMpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBLYW5qaURhdGFcbiIsICIndXNlIHN0cmljdCc7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIENyZWF0ZWQgMjAwOC0wOC0xOS5cbiAqXG4gKiBEaWprc3RyYSBwYXRoLWZpbmRpbmcgZnVuY3Rpb25zLiBBZGFwdGVkIGZyb20gdGhlIERpamtzdGFyIFB5dGhvbiBwcm9qZWN0LlxuICpcbiAqIENvcHlyaWdodCAoQykgMjAwOFxuICogICBXeWF0dCBCYWxkd2luIDxzZWxmQHd5YXR0YmFsZHdpbi5jb20+XG4gKiAgIEFsbCByaWdodHMgcmVzZXJ2ZWRcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKlxuICogICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuICogVEhFIFNPRlRXQVJFLlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xudmFyIGRpamtzdHJhID0ge1xuICBzaW5nbGVfc291cmNlX3Nob3J0ZXN0X3BhdGhzOiBmdW5jdGlvbihncmFwaCwgcywgZCkge1xuICAgIC8vIFByZWRlY2Vzc29yIG1hcCBmb3IgZWFjaCBub2RlIHRoYXQgaGFzIGJlZW4gZW5jb3VudGVyZWQuXG4gICAgLy8gbm9kZSBJRCA9PiBwcmVkZWNlc3NvciBub2RlIElEXG4gICAgdmFyIHByZWRlY2Vzc29ycyA9IHt9O1xuXG4gICAgLy8gQ29zdHMgb2Ygc2hvcnRlc3QgcGF0aHMgZnJvbSBzIHRvIGFsbCBub2RlcyBlbmNvdW50ZXJlZC5cbiAgICAvLyBub2RlIElEID0+IGNvc3RcbiAgICB2YXIgY29zdHMgPSB7fTtcbiAgICBjb3N0c1tzXSA9IDA7XG5cbiAgICAvLyBDb3N0cyBvZiBzaG9ydGVzdCBwYXRocyBmcm9tIHMgdG8gYWxsIG5vZGVzIGVuY291bnRlcmVkOyBkaWZmZXJzIGZyb21cbiAgICAvLyBgY29zdHNgIGluIHRoYXQgaXQgcHJvdmlkZXMgZWFzeSBhY2Nlc3MgdG8gdGhlIG5vZGUgdGhhdCBjdXJyZW50bHkgaGFzXG4gICAgLy8gdGhlIGtub3duIHNob3J0ZXN0IHBhdGggZnJvbSBzLlxuICAgIC8vIFhYWDogRG8gd2UgYWN0dWFsbHkgbmVlZCBib3RoIGBjb3N0c2AgYW5kIGBvcGVuYD9cbiAgICB2YXIgb3BlbiA9IGRpamtzdHJhLlByaW9yaXR5UXVldWUubWFrZSgpO1xuICAgIG9wZW4ucHVzaChzLCAwKTtcblxuICAgIHZhciBjbG9zZXN0LFxuICAgICAgICB1LCB2LFxuICAgICAgICBjb3N0X29mX3NfdG9fdSxcbiAgICAgICAgYWRqYWNlbnRfbm9kZXMsXG4gICAgICAgIGNvc3Rfb2ZfZSxcbiAgICAgICAgY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2UsXG4gICAgICAgIGNvc3Rfb2Zfc190b192LFxuICAgICAgICBmaXJzdF92aXNpdDtcbiAgICB3aGlsZSAoIW9wZW4uZW1wdHkoKSkge1xuICAgICAgLy8gSW4gdGhlIG5vZGVzIHJlbWFpbmluZyBpbiBncmFwaCB0aGF0IGhhdmUgYSBrbm93biBjb3N0IGZyb20gcyxcbiAgICAgIC8vIGZpbmQgdGhlIG5vZGUsIHUsIHRoYXQgY3VycmVudGx5IGhhcyB0aGUgc2hvcnRlc3QgcGF0aCBmcm9tIHMuXG4gICAgICBjbG9zZXN0ID0gb3Blbi5wb3AoKTtcbiAgICAgIHUgPSBjbG9zZXN0LnZhbHVlO1xuICAgICAgY29zdF9vZl9zX3RvX3UgPSBjbG9zZXN0LmNvc3Q7XG5cbiAgICAgIC8vIEdldCBub2RlcyBhZGphY2VudCB0byB1Li4uXG4gICAgICBhZGphY2VudF9ub2RlcyA9IGdyYXBoW3VdIHx8IHt9O1xuXG4gICAgICAvLyAuLi5hbmQgZXhwbG9yZSB0aGUgZWRnZXMgdGhhdCBjb25uZWN0IHUgdG8gdGhvc2Ugbm9kZXMsIHVwZGF0aW5nXG4gICAgICAvLyB0aGUgY29zdCBvZiB0aGUgc2hvcnRlc3QgcGF0aHMgdG8gYW55IG9yIGFsbCBvZiB0aG9zZSBub2RlcyBhc1xuICAgICAgLy8gbmVjZXNzYXJ5LiB2IGlzIHRoZSBub2RlIGFjcm9zcyB0aGUgY3VycmVudCBlZGdlIGZyb20gdS5cbiAgICAgIGZvciAodiBpbiBhZGphY2VudF9ub2Rlcykge1xuICAgICAgICBpZiAoYWRqYWNlbnRfbm9kZXMuaGFzT3duUHJvcGVydHkodikpIHtcbiAgICAgICAgICAvLyBHZXQgdGhlIGNvc3Qgb2YgdGhlIGVkZ2UgcnVubmluZyBmcm9tIHUgdG8gdi5cbiAgICAgICAgICBjb3N0X29mX2UgPSBhZGphY2VudF9ub2Rlc1t2XTtcblxuICAgICAgICAgIC8vIENvc3Qgb2YgcyB0byB1IHBsdXMgdGhlIGNvc3Qgb2YgdSB0byB2IGFjcm9zcyBlLS10aGlzIGlzICphKlxuICAgICAgICAgIC8vIGNvc3QgZnJvbSBzIHRvIHYgdGhhdCBtYXkgb3IgbWF5IG5vdCBiZSBsZXNzIHRoYW4gdGhlIGN1cnJlbnRcbiAgICAgICAgICAvLyBrbm93biBjb3N0IHRvIHYuXG4gICAgICAgICAgY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2UgPSBjb3N0X29mX3NfdG9fdSArIGNvc3Rfb2ZfZTtcblxuICAgICAgICAgIC8vIElmIHdlIGhhdmVuJ3QgdmlzaXRlZCB2IHlldCBPUiBpZiB0aGUgY3VycmVudCBrbm93biBjb3N0IGZyb20gcyB0b1xuICAgICAgICAgIC8vIHYgaXMgZ3JlYXRlciB0aGFuIHRoZSBuZXcgY29zdCB3ZSBqdXN0IGZvdW5kIChjb3N0IG9mIHMgdG8gdSBwbHVzXG4gICAgICAgICAgLy8gY29zdCBvZiB1IHRvIHYgYWNyb3NzIGUpLCB1cGRhdGUgdidzIGNvc3QgaW4gdGhlIGNvc3QgbGlzdCBhbmRcbiAgICAgICAgICAvLyB1cGRhdGUgdidzIHByZWRlY2Vzc29yIGluIHRoZSBwcmVkZWNlc3NvciBsaXN0IChpdCdzIG5vdyB1KS5cbiAgICAgICAgICBjb3N0X29mX3NfdG9fdiA9IGNvc3RzW3ZdO1xuICAgICAgICAgIGZpcnN0X3Zpc2l0ID0gKHR5cGVvZiBjb3N0c1t2XSA9PT0gJ3VuZGVmaW5lZCcpO1xuICAgICAgICAgIGlmIChmaXJzdF92aXNpdCB8fCBjb3N0X29mX3NfdG9fdiA+IGNvc3Rfb2Zfc190b191X3BsdXNfY29zdF9vZl9lKSB7XG4gICAgICAgICAgICBjb3N0c1t2XSA9IGNvc3Rfb2Zfc190b191X3BsdXNfY29zdF9vZl9lO1xuICAgICAgICAgICAgb3Blbi5wdXNoKHYsIGNvc3Rfb2Zfc190b191X3BsdXNfY29zdF9vZl9lKTtcbiAgICAgICAgICAgIHByZWRlY2Vzc29yc1t2XSA9IHU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBkICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29zdHNbZF0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2YXIgbXNnID0gWydDb3VsZCBub3QgZmluZCBhIHBhdGggZnJvbSAnLCBzLCAnIHRvICcsIGQsICcuJ10uam9pbignJyk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJlZGVjZXNzb3JzO1xuICB9LFxuXG4gIGV4dHJhY3Rfc2hvcnRlc3RfcGF0aF9mcm9tX3ByZWRlY2Vzc29yX2xpc3Q6IGZ1bmN0aW9uKHByZWRlY2Vzc29ycywgZCkge1xuICAgIHZhciBub2RlcyA9IFtdO1xuICAgIHZhciB1ID0gZDtcbiAgICB2YXIgcHJlZGVjZXNzb3I7XG4gICAgd2hpbGUgKHUpIHtcbiAgICAgIG5vZGVzLnB1c2godSk7XG4gICAgICBwcmVkZWNlc3NvciA9IHByZWRlY2Vzc29yc1t1XTtcbiAgICAgIHUgPSBwcmVkZWNlc3NvcnNbdV07XG4gICAgfVxuICAgIG5vZGVzLnJldmVyc2UoKTtcbiAgICByZXR1cm4gbm9kZXM7XG4gIH0sXG5cbiAgZmluZF9wYXRoOiBmdW5jdGlvbihncmFwaCwgcywgZCkge1xuICAgIHZhciBwcmVkZWNlc3NvcnMgPSBkaWprc3RyYS5zaW5nbGVfc291cmNlX3Nob3J0ZXN0X3BhdGhzKGdyYXBoLCBzLCBkKTtcbiAgICByZXR1cm4gZGlqa3N0cmEuZXh0cmFjdF9zaG9ydGVzdF9wYXRoX2Zyb21fcHJlZGVjZXNzb3JfbGlzdChcbiAgICAgIHByZWRlY2Vzc29ycywgZCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEEgdmVyeSBuYWl2ZSBwcmlvcml0eSBxdWV1ZSBpbXBsZW1lbnRhdGlvbi5cbiAgICovXG4gIFByaW9yaXR5UXVldWU6IHtcbiAgICBtYWtlOiBmdW5jdGlvbiAob3B0cykge1xuICAgICAgdmFyIFQgPSBkaWprc3RyYS5Qcmlvcml0eVF1ZXVlLFxuICAgICAgICAgIHQgPSB7fSxcbiAgICAgICAgICBrZXk7XG4gICAgICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgICAgIGZvciAoa2V5IGluIFQpIHtcbiAgICAgICAgaWYgKFQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIHRba2V5XSA9IFRba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdC5xdWV1ZSA9IFtdO1xuICAgICAgdC5zb3J0ZXIgPSBvcHRzLnNvcnRlciB8fCBULmRlZmF1bHRfc29ydGVyO1xuICAgICAgcmV0dXJuIHQ7XG4gICAgfSxcblxuICAgIGRlZmF1bHRfc29ydGVyOiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGEuY29zdCAtIGIuY29zdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgbmV3IGl0ZW0gdG8gdGhlIHF1ZXVlIGFuZCBlbnN1cmUgdGhlIGhpZ2hlc3QgcHJpb3JpdHkgZWxlbWVudFxuICAgICAqIGlzIGF0IHRoZSBmcm9udCBvZiB0aGUgcXVldWUuXG4gICAgICovXG4gICAgcHVzaDogZnVuY3Rpb24gKHZhbHVlLCBjb3N0KSB7XG4gICAgICB2YXIgaXRlbSA9IHt2YWx1ZTogdmFsdWUsIGNvc3Q6IGNvc3R9O1xuICAgICAgdGhpcy5xdWV1ZS5wdXNoKGl0ZW0pO1xuICAgICAgdGhpcy5xdWV1ZS5zb3J0KHRoaXMuc29ydGVyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBoaWdoZXN0IHByaW9yaXR5IGVsZW1lbnQgaW4gdGhlIHF1ZXVlLlxuICAgICAqL1xuICAgIHBvcDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWUuc2hpZnQoKTtcbiAgICB9LFxuXG4gICAgZW1wdHk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnF1ZXVlLmxlbmd0aCA9PT0gMDtcbiAgICB9XG4gIH1cbn07XG5cblxuLy8gbm9kZS5qcyBtb2R1bGUgZXhwb3J0c1xuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZGlqa3N0cmE7XG59XG4iLCAiY29uc3QgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG5jb25zdCBOdW1lcmljRGF0YSA9IHJlcXVpcmUoJy4vbnVtZXJpYy1kYXRhJylcbmNvbnN0IEFscGhhbnVtZXJpY0RhdGEgPSByZXF1aXJlKCcuL2FscGhhbnVtZXJpYy1kYXRhJylcbmNvbnN0IEJ5dGVEYXRhID0gcmVxdWlyZSgnLi9ieXRlLWRhdGEnKVxuY29uc3QgS2FuamlEYXRhID0gcmVxdWlyZSgnLi9rYW5qaS1kYXRhJylcbmNvbnN0IFJlZ2V4ID0gcmVxdWlyZSgnLi9yZWdleCcpXG5jb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuY29uc3QgZGlqa3N0cmEgPSByZXF1aXJlKCdkaWprc3RyYWpzJylcblxuLyoqXG4gKiBSZXR1cm5zIFVURjggYnl0ZSBsZW5ndGhcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciBJbnB1dCBzdHJpbmdcbiAqIEByZXR1cm4ge051bWJlcn0gICAgIE51bWJlciBvZiBieXRlXG4gKi9cbmZ1bmN0aW9uIGdldFN0cmluZ0J5dGVMZW5ndGggKHN0cikge1xuICByZXR1cm4gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KHN0cikpLmxlbmd0aFxufVxuXG4vKipcbiAqIEdldCBhIGxpc3Qgb2Ygc2VnbWVudHMgb2YgdGhlIHNwZWNpZmllZCBtb2RlXG4gKiBmcm9tIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtICB7TW9kZX0gICBtb2RlIFNlZ21lbnQgbW9kZVxuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgIFN0cmluZyB0byBwcm9jZXNzXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxuICovXG5mdW5jdGlvbiBnZXRTZWdtZW50cyAocmVnZXgsIG1vZGUsIHN0cikge1xuICBjb25zdCBzZWdtZW50cyA9IFtdXG4gIGxldCByZXN1bHRcblxuICB3aGlsZSAoKHJlc3VsdCA9IHJlZ2V4LmV4ZWMoc3RyKSkgIT09IG51bGwpIHtcbiAgICBzZWdtZW50cy5wdXNoKHtcbiAgICAgIGRhdGE6IHJlc3VsdFswXSxcbiAgICAgIGluZGV4OiByZXN1bHQuaW5kZXgsXG4gICAgICBtb2RlOiBtb2RlLFxuICAgICAgbGVuZ3RoOiByZXN1bHRbMF0ubGVuZ3RoXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiBzZWdtZW50c1xufVxuXG4vKipcbiAqIEV4dHJhY3RzIGEgc2VyaWVzIG9mIHNlZ21lbnRzIHdpdGggdGhlIGFwcHJvcHJpYXRlXG4gKiBtb2RlcyBmcm9tIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBkYXRhU3RyIElucHV0IHN0cmluZ1xuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqL1xuZnVuY3Rpb24gZ2V0U2VnbWVudHNGcm9tU3RyaW5nIChkYXRhU3RyKSB7XG4gIGNvbnN0IG51bVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5OVU1FUklDLCBNb2RlLk5VTUVSSUMsIGRhdGFTdHIpXG4gIGNvbnN0IGFscGhhTnVtU2VncyA9IGdldFNlZ21lbnRzKFJlZ2V4LkFMUEhBTlVNRVJJQywgTW9kZS5BTFBIQU5VTUVSSUMsIGRhdGFTdHIpXG4gIGxldCBieXRlU2Vnc1xuICBsZXQga2FuamlTZWdzXG5cbiAgaWYgKFV0aWxzLmlzS2FuamlNb2RlRW5hYmxlZCgpKSB7XG4gICAgYnl0ZVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5CWVRFLCBNb2RlLkJZVEUsIGRhdGFTdHIpXG4gICAga2FuamlTZWdzID0gZ2V0U2VnbWVudHMoUmVnZXguS0FOSkksIE1vZGUuS0FOSkksIGRhdGFTdHIpXG4gIH0gZWxzZSB7XG4gICAgYnl0ZVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5CWVRFX0tBTkpJLCBNb2RlLkJZVEUsIGRhdGFTdHIpXG4gICAga2FuamlTZWdzID0gW11cbiAgfVxuXG4gIGNvbnN0IHNlZ3MgPSBudW1TZWdzLmNvbmNhdChhbHBoYU51bVNlZ3MsIGJ5dGVTZWdzLCBrYW5qaVNlZ3MpXG5cbiAgcmV0dXJuIHNlZ3NcbiAgICAuc29ydChmdW5jdGlvbiAoczEsIHMyKSB7XG4gICAgICByZXR1cm4gczEuaW5kZXggLSBzMi5pbmRleFxuICAgIH0pXG4gICAgLm1hcChmdW5jdGlvbiAob2JqKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkYXRhOiBvYmouZGF0YSxcbiAgICAgICAgbW9kZTogb2JqLm1vZGUsXG4gICAgICAgIGxlbmd0aDogb2JqLmxlbmd0aFxuICAgICAgfVxuICAgIH0pXG59XG5cbi8qKlxuICogUmV0dXJucyBob3cgbWFueSBiaXRzIGFyZSBuZWVkZWQgdG8gZW5jb2RlIGEgc3RyaW5nIG9mXG4gKiBzcGVjaWZpZWQgbGVuZ3RoIHdpdGggdGhlIHNwZWNpZmllZCBtb2RlXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBsZW5ndGggU3RyaW5nIGxlbmd0aFxuICogQHBhcmFtICB7TW9kZX0gbW9kZSAgICAgU2VnbWVudCBtb2RlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICBCaXQgbGVuZ3RoXG4gKi9cbmZ1bmN0aW9uIGdldFNlZ21lbnRCaXRzTGVuZ3RoIChsZW5ndGgsIG1vZGUpIHtcbiAgc3dpdGNoIChtb2RlKSB7XG4gICAgY2FzZSBNb2RlLk5VTUVSSUM6XG4gICAgICByZXR1cm4gTnVtZXJpY0RhdGEuZ2V0Qml0c0xlbmd0aChsZW5ndGgpXG4gICAgY2FzZSBNb2RlLkFMUEhBTlVNRVJJQzpcbiAgICAgIHJldHVybiBBbHBoYW51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGgobGVuZ3RoKVxuICAgIGNhc2UgTW9kZS5LQU5KSTpcbiAgICAgIHJldHVybiBLYW5qaURhdGEuZ2V0Qml0c0xlbmd0aChsZW5ndGgpXG4gICAgY2FzZSBNb2RlLkJZVEU6XG4gICAgICByZXR1cm4gQnl0ZURhdGEuZ2V0Qml0c0xlbmd0aChsZW5ndGgpXG4gIH1cbn1cblxuLyoqXG4gKiBNZXJnZXMgYWRqYWNlbnQgc2VnbWVudHMgd2hpY2ggaGF2ZSB0aGUgc2FtZSBtb2RlXG4gKlxuICogQHBhcmFtICB7QXJyYXl9IHNlZ3MgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxuICogQHJldHVybiB7QXJyYXl9ICAgICAgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxuICovXG5mdW5jdGlvbiBtZXJnZVNlZ21lbnRzIChzZWdzKSB7XG4gIHJldHVybiBzZWdzLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBjdXJyKSB7XG4gICAgY29uc3QgcHJldlNlZyA9IGFjYy5sZW5ndGggLSAxID49IDAgPyBhY2NbYWNjLmxlbmd0aCAtIDFdIDogbnVsbFxuICAgIGlmIChwcmV2U2VnICYmIHByZXZTZWcubW9kZSA9PT0gY3Vyci5tb2RlKSB7XG4gICAgICBhY2NbYWNjLmxlbmd0aCAtIDFdLmRhdGEgKz0gY3Vyci5kYXRhXG4gICAgICByZXR1cm4gYWNjXG4gICAgfVxuXG4gICAgYWNjLnB1c2goY3VycilcbiAgICByZXR1cm4gYWNjXG4gIH0sIFtdKVxufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGxpc3Qgb2YgYWxsIHBvc3NpYmxlIG5vZGVzIGNvbWJpbmF0aW9uIHdoaWNoXG4gKiB3aWxsIGJlIHVzZWQgdG8gYnVpbGQgYSBzZWdtZW50cyBncmFwaC5cbiAqXG4gKiBOb2RlcyBhcmUgZGl2aWRlZCBieSBncm91cHMuIEVhY2ggZ3JvdXAgd2lsbCBjb250YWluIGEgbGlzdCBvZiBhbGwgdGhlIG1vZGVzXG4gKiBpbiB3aGljaCBpcyBwb3NzaWJsZSB0byBlbmNvZGUgdGhlIGdpdmVuIHRleHQuXG4gKlxuICogRm9yIGV4YW1wbGUgdGhlIHRleHQgJzEyMzQ1JyBjYW4gYmUgZW5jb2RlZCBhcyBOdW1lcmljLCBBbHBoYW51bWVyaWMgb3IgQnl0ZS5cbiAqIFRoZSBncm91cCBmb3IgJzEyMzQ1JyB3aWxsIGNvbnRhaW4gdGhlbiAzIG9iamVjdHMsIG9uZSBmb3IgZWFjaFxuICogcG9zc2libGUgZW5jb2RpbmcgbW9kZS5cbiAqXG4gKiBFYWNoIG5vZGUgcmVwcmVzZW50cyBhIHBvc3NpYmxlIHNlZ21lbnQuXG4gKlxuICogQHBhcmFtICB7QXJyYXl9IHNlZ3MgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxuICogQHJldHVybiB7QXJyYXl9ICAgICAgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxuICovXG5mdW5jdGlvbiBidWlsZE5vZGVzIChzZWdzKSB7XG4gIGNvbnN0IG5vZGVzID0gW11cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgc2VnID0gc2Vnc1tpXVxuXG4gICAgc3dpdGNoIChzZWcubW9kZSkge1xuICAgICAgY2FzZSBNb2RlLk5VTUVSSUM6XG4gICAgICAgIG5vZGVzLnB1c2goW3NlZyxcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkFMUEhBTlVNRVJJQywgbGVuZ3RoOiBzZWcubGVuZ3RoIH0sXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5CWVRFLCBsZW5ndGg6IHNlZy5sZW5ndGggfVxuICAgICAgICBdKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBNb2RlLkFMUEhBTlVNRVJJQzpcbiAgICAgICAgbm9kZXMucHVzaChbc2VnLFxuICAgICAgICAgIHsgZGF0YTogc2VnLmRhdGEsIG1vZGU6IE1vZGUuQllURSwgbGVuZ3RoOiBzZWcubGVuZ3RoIH1cbiAgICAgICAgXSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgTW9kZS5LQU5KSTpcbiAgICAgICAgbm9kZXMucHVzaChbc2VnLFxuICAgICAgICAgIHsgZGF0YTogc2VnLmRhdGEsIG1vZGU6IE1vZGUuQllURSwgbGVuZ3RoOiBnZXRTdHJpbmdCeXRlTGVuZ3RoKHNlZy5kYXRhKSB9XG4gICAgICAgIF0pXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIE1vZGUuQllURTpcbiAgICAgICAgbm9kZXMucHVzaChbXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5CWVRFLCBsZW5ndGg6IGdldFN0cmluZ0J5dGVMZW5ndGgoc2VnLmRhdGEpIH1cbiAgICAgICAgXSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbm9kZXNcbn1cblxuLyoqXG4gKiBCdWlsZHMgYSBncmFwaCBmcm9tIGEgbGlzdCBvZiBub2Rlcy5cbiAqIEFsbCBzZWdtZW50cyBpbiBlYWNoIG5vZGUgZ3JvdXAgd2lsbCBiZSBjb25uZWN0ZWQgd2l0aCBhbGwgdGhlIHNlZ21lbnRzIG9mXG4gKiB0aGUgbmV4dCBncm91cCBhbmQgc28gb24uXG4gKlxuICogQXQgZWFjaCBjb25uZWN0aW9uIHdpbGwgYmUgYXNzaWduZWQgYSB3ZWlnaHQgZGVwZW5kaW5nIG9uIHRoZVxuICogc2VnbWVudCdzIGJ5dGUgbGVuZ3RoLlxuICpcbiAqIEBwYXJhbSAge0FycmF5fSBub2RlcyAgICBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICAgR3JhcGggb2YgYWxsIHBvc3NpYmxlIHNlZ21lbnRzXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkR3JhcGggKG5vZGVzLCB2ZXJzaW9uKSB7XG4gIGNvbnN0IHRhYmxlID0ge31cbiAgY29uc3QgZ3JhcGggPSB7IHN0YXJ0OiB7fSB9XG4gIGxldCBwcmV2Tm9kZUlkcyA9IFsnc3RhcnQnXVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBub2RlR3JvdXAgPSBub2Rlc1tpXVxuICAgIGNvbnN0IGN1cnJlbnROb2RlSWRzID0gW11cblxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgbm9kZUdyb3VwLmxlbmd0aDsgaisrKSB7XG4gICAgICBjb25zdCBub2RlID0gbm9kZUdyb3VwW2pdXG4gICAgICBjb25zdCBrZXkgPSAnJyArIGkgKyBqXG5cbiAgICAgIGN1cnJlbnROb2RlSWRzLnB1c2goa2V5KVxuICAgICAgdGFibGVba2V5XSA9IHsgbm9kZTogbm9kZSwgbGFzdENvdW50OiAwIH1cbiAgICAgIGdyYXBoW2tleV0gPSB7fVxuXG4gICAgICBmb3IgKGxldCBuID0gMDsgbiA8IHByZXZOb2RlSWRzLmxlbmd0aDsgbisrKSB7XG4gICAgICAgIGNvbnN0IHByZXZOb2RlSWQgPSBwcmV2Tm9kZUlkc1tuXVxuXG4gICAgICAgIGlmICh0YWJsZVtwcmV2Tm9kZUlkXSAmJiB0YWJsZVtwcmV2Tm9kZUlkXS5ub2RlLm1vZGUgPT09IG5vZGUubW9kZSkge1xuICAgICAgICAgIGdyYXBoW3ByZXZOb2RlSWRdW2tleV0gPVxuICAgICAgICAgICAgZ2V0U2VnbWVudEJpdHNMZW5ndGgodGFibGVbcHJldk5vZGVJZF0ubGFzdENvdW50ICsgbm9kZS5sZW5ndGgsIG5vZGUubW9kZSkgLVxuICAgICAgICAgICAgZ2V0U2VnbWVudEJpdHNMZW5ndGgodGFibGVbcHJldk5vZGVJZF0ubGFzdENvdW50LCBub2RlLm1vZGUpXG5cbiAgICAgICAgICB0YWJsZVtwcmV2Tm9kZUlkXS5sYXN0Q291bnQgKz0gbm9kZS5sZW5ndGhcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGFibGVbcHJldk5vZGVJZF0pIHRhYmxlW3ByZXZOb2RlSWRdLmxhc3RDb3VudCA9IG5vZGUubGVuZ3RoXG5cbiAgICAgICAgICBncmFwaFtwcmV2Tm9kZUlkXVtrZXldID0gZ2V0U2VnbWVudEJpdHNMZW5ndGgobm9kZS5sZW5ndGgsIG5vZGUubW9kZSkgK1xuICAgICAgICAgICAgNCArIE1vZGUuZ2V0Q2hhckNvdW50SW5kaWNhdG9yKG5vZGUubW9kZSwgdmVyc2lvbikgLy8gc3dpdGNoIGNvc3RcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHByZXZOb2RlSWRzID0gY3VycmVudE5vZGVJZHNcbiAgfVxuXG4gIGZvciAobGV0IG4gPSAwOyBuIDwgcHJldk5vZGVJZHMubGVuZ3RoOyBuKyspIHtcbiAgICBncmFwaFtwcmV2Tm9kZUlkc1tuXV0uZW5kID0gMFxuICB9XG5cbiAgcmV0dXJuIHsgbWFwOiBncmFwaCwgdGFibGU6IHRhYmxlIH1cbn1cblxuLyoqXG4gKiBCdWlsZHMgYSBzZWdtZW50IGZyb20gYSBzcGVjaWZpZWQgZGF0YSBhbmQgbW9kZS5cbiAqIElmIGEgbW9kZSBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgbW9yZSBzdWl0YWJsZSB3aWxsIGJlIHVzZWQuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBkYXRhICAgICAgICAgICAgIElucHV0IGRhdGFcbiAqIEBwYXJhbSAge01vZGUgfCBTdHJpbmd9IG1vZGVzSGludCBEYXRhIG1vZGVcbiAqIEByZXR1cm4ge1NlZ21lbnR9ICAgICAgICAgICAgICAgICBTZWdtZW50XG4gKi9cbmZ1bmN0aW9uIGJ1aWxkU2luZ2xlU2VnbWVudCAoZGF0YSwgbW9kZXNIaW50KSB7XG4gIGxldCBtb2RlXG4gIGNvbnN0IGJlc3RNb2RlID0gTW9kZS5nZXRCZXN0TW9kZUZvckRhdGEoZGF0YSlcblxuICBtb2RlID0gTW9kZS5mcm9tKG1vZGVzSGludCwgYmVzdE1vZGUpXG5cbiAgLy8gTWFrZSBzdXJlIGRhdGEgY2FuIGJlIGVuY29kZWRcbiAgaWYgKG1vZGUgIT09IE1vZGUuQllURSAmJiBtb2RlLmJpdCA8IGJlc3RNb2RlLmJpdCkge1xuICAgIHRocm93IG5ldyBFcnJvcignXCInICsgZGF0YSArICdcIicgK1xuICAgICAgJyBjYW5ub3QgYmUgZW5jb2RlZCB3aXRoIG1vZGUgJyArIE1vZGUudG9TdHJpbmcobW9kZSkgK1xuICAgICAgJy5cXG4gU3VnZ2VzdGVkIG1vZGUgaXM6ICcgKyBNb2RlLnRvU3RyaW5nKGJlc3RNb2RlKSlcbiAgfVxuXG4gIC8vIFVzZSBNb2RlLkJZVEUgaWYgS2Fuamkgc3VwcG9ydCBpcyBkaXNhYmxlZFxuICBpZiAobW9kZSA9PT0gTW9kZS5LQU5KSSAmJiAhVXRpbHMuaXNLYW5qaU1vZGVFbmFibGVkKCkpIHtcbiAgICBtb2RlID0gTW9kZS5CWVRFXG4gIH1cblxuICBzd2l0Y2ggKG1vZGUpIHtcbiAgICBjYXNlIE1vZGUuTlVNRVJJQzpcbiAgICAgIHJldHVybiBuZXcgTnVtZXJpY0RhdGEoZGF0YSlcblxuICAgIGNhc2UgTW9kZS5BTFBIQU5VTUVSSUM6XG4gICAgICByZXR1cm4gbmV3IEFscGhhbnVtZXJpY0RhdGEoZGF0YSlcblxuICAgIGNhc2UgTW9kZS5LQU5KSTpcbiAgICAgIHJldHVybiBuZXcgS2FuamlEYXRhKGRhdGEpXG5cbiAgICBjYXNlIE1vZGUuQllURTpcbiAgICAgIHJldHVybiBuZXcgQnl0ZURhdGEoZGF0YSlcbiAgfVxufVxuXG4vKipcbiAqIEJ1aWxkcyBhIGxpc3Qgb2Ygc2VnbWVudHMgZnJvbSBhbiBhcnJheS5cbiAqIEFycmF5IGNhbiBjb250YWluIFN0cmluZ3Mgb3IgT2JqZWN0cyB3aXRoIHNlZ21lbnQncyBpbmZvLlxuICpcbiAqIEZvciBlYWNoIGl0ZW0gd2hpY2ggaXMgYSBzdHJpbmcsIHdpbGwgYmUgZ2VuZXJhdGVkIGEgc2VnbWVudCB3aXRoIHRoZSBnaXZlblxuICogc3RyaW5nIGFuZCB0aGUgbW9yZSBhcHByb3ByaWF0ZSBlbmNvZGluZyBtb2RlLlxuICpcbiAqIEZvciBlYWNoIGl0ZW0gd2hpY2ggaXMgYW4gb2JqZWN0LCB3aWxsIGJlIGdlbmVyYXRlZCBhIHNlZ21lbnQgd2l0aCB0aGUgZ2l2ZW5cbiAqIGRhdGEgYW5kIG1vZGUuXG4gKiBPYmplY3RzIG11c3QgY29udGFpbiBhdCBsZWFzdCB0aGUgcHJvcGVydHkgXCJkYXRhXCIuXG4gKiBJZiBwcm9wZXJ0eSBcIm1vZGVcIiBpcyBub3QgcHJlc2VudCwgdGhlIG1vcmUgc3VpdGFibGUgbW9kZSB3aWxsIGJlIHVzZWQuXG4gKlxuICogQHBhcmFtICB7QXJyYXl9IGFycmF5IEFycmF5IG9mIG9iamVjdHMgd2l0aCBzZWdtZW50cyBkYXRhXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgQXJyYXkgb2YgU2VnbWVudHNcbiAqL1xuZXhwb3J0cy5mcm9tQXJyYXkgPSBmdW5jdGlvbiBmcm9tQXJyYXkgKGFycmF5KSB7XG4gIHJldHVybiBhcnJheS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgc2VnKSB7XG4gICAgaWYgKHR5cGVvZiBzZWcgPT09ICdzdHJpbmcnKSB7XG4gICAgICBhY2MucHVzaChidWlsZFNpbmdsZVNlZ21lbnQoc2VnLCBudWxsKSlcbiAgICB9IGVsc2UgaWYgKHNlZy5kYXRhKSB7XG4gICAgICBhY2MucHVzaChidWlsZFNpbmdsZVNlZ21lbnQoc2VnLmRhdGEsIHNlZy5tb2RlKSlcbiAgICB9XG5cbiAgICByZXR1cm4gYWNjXG4gIH0sIFtdKVxufVxuXG4vKipcbiAqIEJ1aWxkcyBhbiBvcHRpbWl6ZWQgc2VxdWVuY2Ugb2Ygc2VnbWVudHMgZnJvbSBhIHN0cmluZyxcbiAqIHdoaWNoIHdpbGwgcHJvZHVjZSB0aGUgc2hvcnRlc3QgcG9zc2libGUgYml0c3RyZWFtLlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YSAgICBJbnB1dCBzdHJpbmdcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICBBcnJheSBvZiBzZWdtZW50c1xuICovXG5leHBvcnRzLmZyb21TdHJpbmcgPSBmdW5jdGlvbiBmcm9tU3RyaW5nIChkYXRhLCB2ZXJzaW9uKSB7XG4gIGNvbnN0IHNlZ3MgPSBnZXRTZWdtZW50c0Zyb21TdHJpbmcoZGF0YSwgVXRpbHMuaXNLYW5qaU1vZGVFbmFibGVkKCkpXG5cbiAgY29uc3Qgbm9kZXMgPSBidWlsZE5vZGVzKHNlZ3MpXG4gIGNvbnN0IGdyYXBoID0gYnVpbGRHcmFwaChub2RlcywgdmVyc2lvbilcbiAgY29uc3QgcGF0aCA9IGRpamtzdHJhLmZpbmRfcGF0aChncmFwaC5tYXAsICdzdGFydCcsICdlbmQnKVxuXG4gIGNvbnN0IG9wdGltaXplZFNlZ3MgPSBbXVxuICBmb3IgKGxldCBpID0gMTsgaSA8IHBhdGgubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgb3B0aW1pemVkU2Vncy5wdXNoKGdyYXBoLnRhYmxlW3BhdGhbaV1dLm5vZGUpXG4gIH1cblxuICByZXR1cm4gZXhwb3J0cy5mcm9tQXJyYXkobWVyZ2VTZWdtZW50cyhvcHRpbWl6ZWRTZWdzKSlcbn1cblxuLyoqXG4gKiBTcGxpdHMgYSBzdHJpbmcgaW4gdmFyaW91cyBzZWdtZW50cyB3aXRoIHRoZSBtb2RlcyB3aGljaFxuICogYmVzdCByZXByZXNlbnQgdGhlaXIgY29udGVudC5cbiAqIFRoZSBwcm9kdWNlZCBzZWdtZW50cyBhcmUgZmFyIGZyb20gYmVpbmcgb3B0aW1pemVkLlxuICogVGhlIG91dHB1dCBvZiB0aGlzIGZ1bmN0aW9uIGlzIG9ubHkgdXNlZCB0byBlc3RpbWF0ZSBhIFFSIENvZGUgdmVyc2lvblxuICogd2hpY2ggbWF5IGNvbnRhaW4gdGhlIGRhdGEuXG4gKlxuICogQHBhcmFtICB7c3RyaW5nfSBkYXRhIElucHV0IHN0cmluZ1xuICogQHJldHVybiB7QXJyYXl9ICAgICAgIEFycmF5IG9mIHNlZ21lbnRzXG4gKi9cbmV4cG9ydHMucmF3U3BsaXQgPSBmdW5jdGlvbiByYXdTcGxpdCAoZGF0YSkge1xuICByZXR1cm4gZXhwb3J0cy5mcm9tQXJyYXkoXG4gICAgZ2V0U2VnbWVudHNGcm9tU3RyaW5nKGRhdGEsIFV0aWxzLmlzS2FuamlNb2RlRW5hYmxlZCgpKVxuICApXG59XG4iLCAiY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcbmNvbnN0IEVDTGV2ZWwgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tbGV2ZWwnKVxuY29uc3QgQml0QnVmZmVyID0gcmVxdWlyZSgnLi9iaXQtYnVmZmVyJylcbmNvbnN0IEJpdE1hdHJpeCA9IHJlcXVpcmUoJy4vYml0LW1hdHJpeCcpXG5jb25zdCBBbGlnbm1lbnRQYXR0ZXJuID0gcmVxdWlyZSgnLi9hbGlnbm1lbnQtcGF0dGVybicpXG5jb25zdCBGaW5kZXJQYXR0ZXJuID0gcmVxdWlyZSgnLi9maW5kZXItcGF0dGVybicpXG5jb25zdCBNYXNrUGF0dGVybiA9IHJlcXVpcmUoJy4vbWFzay1wYXR0ZXJuJylcbmNvbnN0IEVDQ29kZSA9IHJlcXVpcmUoJy4vZXJyb3ItY29ycmVjdGlvbi1jb2RlJylcbmNvbnN0IFJlZWRTb2xvbW9uRW5jb2RlciA9IHJlcXVpcmUoJy4vcmVlZC1zb2xvbW9uLWVuY29kZXInKVxuY29uc3QgVmVyc2lvbiA9IHJlcXVpcmUoJy4vdmVyc2lvbicpXG5jb25zdCBGb3JtYXRJbmZvID0gcmVxdWlyZSgnLi9mb3JtYXQtaW5mbycpXG5jb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcbmNvbnN0IFNlZ21lbnRzID0gcmVxdWlyZSgnLi9zZWdtZW50cycpXG5cbi8qKlxuICogUVJDb2RlIGZvciBKYXZhU2NyaXB0XG4gKlxuICogbW9kaWZpZWQgYnkgUnlhbiBEYXkgZm9yIG5vZGVqcyBzdXBwb3J0XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEgUnlhbiBEYXlcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiAgIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKlxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFFSQ29kZSBmb3IgSmF2YVNjcmlwdFxuLy9cbi8vIENvcHlyaWdodCAoYykgMjAwOSBLYXp1aGlrbyBBcmFzZVxuLy9cbi8vIFVSTDogaHR0cDovL3d3dy5kLXByb2plY3QuY29tL1xuLy9cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbi8vICAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbi8vXG4vLyBUaGUgd29yZCBcIlFSIENvZGVcIiBpcyByZWdpc3RlcmVkIHRyYWRlbWFyayBvZlxuLy8gREVOU08gV0FWRSBJTkNPUlBPUkFURURcbi8vICAgaHR0cDovL3d3dy5kZW5zby13YXZlLmNvbS9xcmNvZGUvZmFxcGF0ZW50LWUuaHRtbFxuLy9cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4qL1xuXG4vKipcbiAqIEFkZCBmaW5kZXIgcGF0dGVybnMgYml0cyB0byBtYXRyaXhcbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCAgTW9kdWxlcyBtYXRyaXhcbiAqIEBwYXJhbSAge051bWJlcn0gICAgdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqL1xuZnVuY3Rpb24gc2V0dXBGaW5kZXJQYXR0ZXJuIChtYXRyaXgsIHZlcnNpb24pIHtcbiAgY29uc3Qgc2l6ZSA9IG1hdHJpeC5zaXplXG4gIGNvbnN0IHBvcyA9IEZpbmRlclBhdHRlcm4uZ2V0UG9zaXRpb25zKHZlcnNpb24pXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3MubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByb3cgPSBwb3NbaV1bMF1cbiAgICBjb25zdCBjb2wgPSBwb3NbaV1bMV1cblxuICAgIGZvciAobGV0IHIgPSAtMTsgciA8PSA3OyByKyspIHtcbiAgICAgIGlmIChyb3cgKyByIDw9IC0xIHx8IHNpemUgPD0gcm93ICsgcikgY29udGludWVcblxuICAgICAgZm9yIChsZXQgYyA9IC0xOyBjIDw9IDc7IGMrKykge1xuICAgICAgICBpZiAoY29sICsgYyA8PSAtMSB8fCBzaXplIDw9IGNvbCArIGMpIGNvbnRpbnVlXG5cbiAgICAgICAgaWYgKChyID49IDAgJiYgciA8PSA2ICYmIChjID09PSAwIHx8IGMgPT09IDYpKSB8fFxuICAgICAgICAgIChjID49IDAgJiYgYyA8PSA2ICYmIChyID09PSAwIHx8IHIgPT09IDYpKSB8fFxuICAgICAgICAgIChyID49IDIgJiYgciA8PSA0ICYmIGMgPj0gMiAmJiBjIDw9IDQpKSB7XG4gICAgICAgICAgbWF0cml4LnNldChyb3cgKyByLCBjb2wgKyBjLCB0cnVlLCB0cnVlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1hdHJpeC5zZXQocm93ICsgciwgY29sICsgYywgZmFsc2UsIHRydWUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBZGQgdGltaW5nIHBhdHRlcm4gYml0cyB0byBtYXRyaXhcbiAqXG4gKiBOb3RlOiB0aGlzIGZ1bmN0aW9uIG11c3QgYmUgY2FsbGVkIGJlZm9yZSB7QGxpbmsgc2V0dXBBbGlnbm1lbnRQYXR0ZXJufVxuICpcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gbWF0cml4IE1vZHVsZXMgbWF0cml4XG4gKi9cbmZ1bmN0aW9uIHNldHVwVGltaW5nUGF0dGVybiAobWF0cml4KSB7XG4gIGNvbnN0IHNpemUgPSBtYXRyaXguc2l6ZVxuXG4gIGZvciAobGV0IHIgPSA4OyByIDwgc2l6ZSAtIDg7IHIrKykge1xuICAgIGNvbnN0IHZhbHVlID0gciAlIDIgPT09IDBcbiAgICBtYXRyaXguc2V0KHIsIDYsIHZhbHVlLCB0cnVlKVxuICAgIG1hdHJpeC5zZXQoNiwgciwgdmFsdWUsIHRydWUpXG4gIH1cbn1cblxuLyoqXG4gKiBBZGQgYWxpZ25tZW50IHBhdHRlcm5zIGJpdHMgdG8gbWF0cml4XG4gKlxuICogTm90ZTogdGhpcyBmdW5jdGlvbiBtdXN0IGJlIGNhbGxlZCBhZnRlciB7QGxpbmsgc2V0dXBUaW1pbmdQYXR0ZXJufVxuICpcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gbWF0cml4ICBNb2R1bGVzIG1hdHJpeFxuICogQHBhcmFtICB7TnVtYmVyfSAgICB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICovXG5mdW5jdGlvbiBzZXR1cEFsaWdubWVudFBhdHRlcm4gKG1hdHJpeCwgdmVyc2lvbikge1xuICBjb25zdCBwb3MgPSBBbGlnbm1lbnRQYXR0ZXJuLmdldFBvc2l0aW9ucyh2ZXJzaW9uKVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgcm93ID0gcG9zW2ldWzBdXG4gICAgY29uc3QgY29sID0gcG9zW2ldWzFdXG5cbiAgICBmb3IgKGxldCByID0gLTI7IHIgPD0gMjsgcisrKSB7XG4gICAgICBmb3IgKGxldCBjID0gLTI7IGMgPD0gMjsgYysrKSB7XG4gICAgICAgIGlmIChyID09PSAtMiB8fCByID09PSAyIHx8IGMgPT09IC0yIHx8IGMgPT09IDIgfHxcbiAgICAgICAgICAociA9PT0gMCAmJiBjID09PSAwKSkge1xuICAgICAgICAgIG1hdHJpeC5zZXQocm93ICsgciwgY29sICsgYywgdHJ1ZSwgdHJ1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXRyaXguc2V0KHJvdyArIHIsIGNvbCArIGMsIGZhbHNlLCB0cnVlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWRkIHZlcnNpb24gaW5mbyBiaXRzIHRvIG1hdHJpeFxuICpcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gbWF0cml4ICBNb2R1bGVzIG1hdHJpeFxuICogQHBhcmFtICB7TnVtYmVyfSAgICB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICovXG5mdW5jdGlvbiBzZXR1cFZlcnNpb25JbmZvIChtYXRyaXgsIHZlcnNpb24pIHtcbiAgY29uc3Qgc2l6ZSA9IG1hdHJpeC5zaXplXG4gIGNvbnN0IGJpdHMgPSBWZXJzaW9uLmdldEVuY29kZWRCaXRzKHZlcnNpb24pXG4gIGxldCByb3csIGNvbCwgbW9kXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxODsgaSsrKSB7XG4gICAgcm93ID0gTWF0aC5mbG9vcihpIC8gMylcbiAgICBjb2wgPSBpICUgMyArIHNpemUgLSA4IC0gM1xuICAgIG1vZCA9ICgoYml0cyA+PiBpKSAmIDEpID09PSAxXG5cbiAgICBtYXRyaXguc2V0KHJvdywgY29sLCBtb2QsIHRydWUpXG4gICAgbWF0cml4LnNldChjb2wsIHJvdywgbW9kLCB0cnVlKVxuICB9XG59XG5cbi8qKlxuICogQWRkIGZvcm1hdCBpbmZvIGJpdHMgdG8gbWF0cml4XG4gKlxuICogQHBhcmFtICB7Qml0TWF0cml4fSBtYXRyaXggICAgICAgICAgICAgICBNb2R1bGVzIG1hdHJpeFxuICogQHBhcmFtICB7RXJyb3JDb3JyZWN0aW9uTGV2ZWx9ICAgIGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqIEBwYXJhbSAge051bWJlcn0gICAgbWFza1BhdHRlcm4gICAgICAgICAgTWFzayBwYXR0ZXJuIHJlZmVyZW5jZSB2YWx1ZVxuICovXG5mdW5jdGlvbiBzZXR1cEZvcm1hdEluZm8gKG1hdHJpeCwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2tQYXR0ZXJuKSB7XG4gIGNvbnN0IHNpemUgPSBtYXRyaXguc2l6ZVxuICBjb25zdCBiaXRzID0gRm9ybWF0SW5mby5nZXRFbmNvZGVkQml0cyhlcnJvckNvcnJlY3Rpb25MZXZlbCwgbWFza1BhdHRlcm4pXG4gIGxldCBpLCBtb2RcblxuICBmb3IgKGkgPSAwOyBpIDwgMTU7IGkrKykge1xuICAgIG1vZCA9ICgoYml0cyA+PiBpKSAmIDEpID09PSAxXG5cbiAgICAvLyB2ZXJ0aWNhbFxuICAgIGlmIChpIDwgNikge1xuICAgICAgbWF0cml4LnNldChpLCA4LCBtb2QsIHRydWUpXG4gICAgfSBlbHNlIGlmIChpIDwgOCkge1xuICAgICAgbWF0cml4LnNldChpICsgMSwgOCwgbW9kLCB0cnVlKVxuICAgIH0gZWxzZSB7XG4gICAgICBtYXRyaXguc2V0KHNpemUgLSAxNSArIGksIDgsIG1vZCwgdHJ1ZSlcbiAgICB9XG5cbiAgICAvLyBob3Jpem9udGFsXG4gICAgaWYgKGkgPCA4KSB7XG4gICAgICBtYXRyaXguc2V0KDgsIHNpemUgLSBpIC0gMSwgbW9kLCB0cnVlKVxuICAgIH0gZWxzZSBpZiAoaSA8IDkpIHtcbiAgICAgIG1hdHJpeC5zZXQoOCwgMTUgLSBpIC0gMSArIDEsIG1vZCwgdHJ1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgbWF0cml4LnNldCg4LCAxNSAtIGkgLSAxLCBtb2QsIHRydWUpXG4gICAgfVxuICB9XG5cbiAgLy8gZml4ZWQgbW9kdWxlXG4gIG1hdHJpeC5zZXQoc2l6ZSAtIDgsIDgsIDEsIHRydWUpXG59XG5cbi8qKlxuICogQWRkIGVuY29kZWQgZGF0YSBiaXRzIHRvIG1hdHJpeFxuICpcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gIG1hdHJpeCBNb2R1bGVzIG1hdHJpeFxuICogQHBhcmFtICB7VWludDhBcnJheX0gZGF0YSAgIERhdGEgY29kZXdvcmRzXG4gKi9cbmZ1bmN0aW9uIHNldHVwRGF0YSAobWF0cml4LCBkYXRhKSB7XG4gIGNvbnN0IHNpemUgPSBtYXRyaXguc2l6ZVxuICBsZXQgaW5jID0gLTFcbiAgbGV0IHJvdyA9IHNpemUgLSAxXG4gIGxldCBiaXRJbmRleCA9IDdcbiAgbGV0IGJ5dGVJbmRleCA9IDBcblxuICBmb3IgKGxldCBjb2wgPSBzaXplIC0gMTsgY29sID4gMDsgY29sIC09IDIpIHtcbiAgICBpZiAoY29sID09PSA2KSBjb2wtLVxuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgMjsgYysrKSB7XG4gICAgICAgIGlmICghbWF0cml4LmlzUmVzZXJ2ZWQocm93LCBjb2wgLSBjKSkge1xuICAgICAgICAgIGxldCBkYXJrID0gZmFsc2VcblxuICAgICAgICAgIGlmIChieXRlSW5kZXggPCBkYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgZGFyayA9ICgoKGRhdGFbYnl0ZUluZGV4XSA+Pj4gYml0SW5kZXgpICYgMSkgPT09IDEpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbWF0cml4LnNldChyb3csIGNvbCAtIGMsIGRhcmspXG4gICAgICAgICAgYml0SW5kZXgtLVxuXG4gICAgICAgICAgaWYgKGJpdEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgYnl0ZUluZGV4KytcbiAgICAgICAgICAgIGJpdEluZGV4ID0gN1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByb3cgKz0gaW5jXG5cbiAgICAgIGlmIChyb3cgPCAwIHx8IHNpemUgPD0gcm93KSB7XG4gICAgICAgIHJvdyAtPSBpbmNcbiAgICAgICAgaW5jID0gLWluY1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZSBlbmNvZGVkIGNvZGV3b3JkcyBmcm9tIGRhdGEgaW5wdXRcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcGFyYW0gIHtFcnJvckNvcnJlY3Rpb25MZXZlbH0gICBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKiBAcGFyYW0gIHtCeXRlRGF0YX0gZGF0YSAgICAgICAgICAgICAgICAgRGF0YSBpbnB1dFxuICogQHJldHVybiB7VWludDhBcnJheX0gICAgICAgICAgICAgICAgICAgIEJ1ZmZlciBjb250YWluaW5nIGVuY29kZWQgY29kZXdvcmRzXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZURhdGEgKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBzZWdtZW50cykge1xuICAvLyBQcmVwYXJlIGRhdGEgYnVmZmVyXG4gIGNvbnN0IGJ1ZmZlciA9IG5ldyBCaXRCdWZmZXIoKVxuXG4gIHNlZ21lbnRzLmZvckVhY2goZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAvLyBwcmVmaXggZGF0YSB3aXRoIG1vZGUgaW5kaWNhdG9yICg0IGJpdHMpXG4gICAgYnVmZmVyLnB1dChkYXRhLm1vZGUuYml0LCA0KVxuXG4gICAgLy8gUHJlZml4IGRhdGEgd2l0aCBjaGFyYWN0ZXIgY291bnQgaW5kaWNhdG9yLlxuICAgIC8vIFRoZSBjaGFyYWN0ZXIgY291bnQgaW5kaWNhdG9yIGlzIGEgc3RyaW5nIG9mIGJpdHMgdGhhdCByZXByZXNlbnRzIHRoZVxuICAgIC8vIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRoYXQgYXJlIGJlaW5nIGVuY29kZWQuXG4gICAgLy8gVGhlIGNoYXJhY3RlciBjb3VudCBpbmRpY2F0b3IgbXVzdCBiZSBwbGFjZWQgYWZ0ZXIgdGhlIG1vZGUgaW5kaWNhdG9yXG4gICAgLy8gYW5kIG11c3QgYmUgYSBjZXJ0YWluIG51bWJlciBvZiBiaXRzIGxvbmcsIGRlcGVuZGluZyBvbiB0aGUgUVIgdmVyc2lvblxuICAgIC8vIGFuZCBkYXRhIG1vZGVcbiAgICAvLyBAc2VlIHtAbGluayBNb2RlLmdldENoYXJDb3VudEluZGljYXRvcn0uXG4gICAgYnVmZmVyLnB1dChkYXRhLmdldExlbmd0aCgpLCBNb2RlLmdldENoYXJDb3VudEluZGljYXRvcihkYXRhLm1vZGUsIHZlcnNpb24pKVxuXG4gICAgLy8gYWRkIGJpbmFyeSBkYXRhIHNlcXVlbmNlIHRvIGJ1ZmZlclxuICAgIGRhdGEud3JpdGUoYnVmZmVyKVxuICB9KVxuXG4gIC8vIENhbGN1bGF0ZSByZXF1aXJlZCBudW1iZXIgb2YgYml0c1xuICBjb25zdCB0b3RhbENvZGV3b3JkcyA9IFV0aWxzLmdldFN5bWJvbFRvdGFsQ29kZXdvcmRzKHZlcnNpb24pXG4gIGNvbnN0IGVjVG90YWxDb2Rld29yZHMgPSBFQ0NvZGUuZ2V0VG90YWxDb2Rld29yZHNDb3VudCh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcbiAgY29uc3QgZGF0YVRvdGFsQ29kZXdvcmRzQml0cyA9ICh0b3RhbENvZGV3b3JkcyAtIGVjVG90YWxDb2Rld29yZHMpICogOFxuXG4gIC8vIEFkZCBhIHRlcm1pbmF0b3IuXG4gIC8vIElmIHRoZSBiaXQgc3RyaW5nIGlzIHNob3J0ZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIHJlcXVpcmVkIGJpdHMsXG4gIC8vIGEgdGVybWluYXRvciBvZiB1cCB0byBmb3VyIDBzIG11c3QgYmUgYWRkZWQgdG8gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIHN0cmluZy5cbiAgLy8gSWYgdGhlIGJpdCBzdHJpbmcgaXMgbW9yZSB0aGFuIGZvdXIgYml0cyBzaG9ydGVyIHRoYW4gdGhlIHJlcXVpcmVkIG51bWJlciBvZiBiaXRzLFxuICAvLyBhZGQgZm91ciAwcyB0byB0aGUgZW5kLlxuICBpZiAoYnVmZmVyLmdldExlbmd0aEluQml0cygpICsgNCA8PSBkYXRhVG90YWxDb2Rld29yZHNCaXRzKSB7XG4gICAgYnVmZmVyLnB1dCgwLCA0KVxuICB9XG5cbiAgLy8gSWYgdGhlIGJpdCBzdHJpbmcgaXMgZmV3ZXIgdGhhbiBmb3VyIGJpdHMgc2hvcnRlciwgYWRkIG9ubHkgdGhlIG51bWJlciBvZiAwcyB0aGF0XG4gIC8vIGFyZSBuZWVkZWQgdG8gcmVhY2ggdGhlIHJlcXVpcmVkIG51bWJlciBvZiBiaXRzLlxuXG4gIC8vIEFmdGVyIGFkZGluZyB0aGUgdGVybWluYXRvciwgaWYgdGhlIG51bWJlciBvZiBiaXRzIGluIHRoZSBzdHJpbmcgaXMgbm90IGEgbXVsdGlwbGUgb2YgOCxcbiAgLy8gcGFkIHRoZSBzdHJpbmcgb24gdGhlIHJpZ2h0IHdpdGggMHMgdG8gbWFrZSB0aGUgc3RyaW5nJ3MgbGVuZ3RoIGEgbXVsdGlwbGUgb2YgOC5cbiAgd2hpbGUgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSAlIDggIT09IDApIHtcbiAgICBidWZmZXIucHV0Qml0KDApXG4gIH1cblxuICAvLyBBZGQgcGFkIGJ5dGVzIGlmIHRoZSBzdHJpbmcgaXMgc3RpbGwgc2hvcnRlciB0aGFuIHRoZSB0b3RhbCBudW1iZXIgb2YgcmVxdWlyZWQgYml0cy5cbiAgLy8gRXh0ZW5kIHRoZSBidWZmZXIgdG8gZmlsbCB0aGUgZGF0YSBjYXBhY2l0eSBvZiB0aGUgc3ltYm9sIGNvcnJlc3BvbmRpbmcgdG9cbiAgLy8gdGhlIFZlcnNpb24gYW5kIEVycm9yIENvcnJlY3Rpb24gTGV2ZWwgYnkgYWRkaW5nIHRoZSBQYWQgQ29kZXdvcmRzIDExMTAxMTAwICgweEVDKVxuICAvLyBhbmQgMDAwMTAwMDEgKDB4MTEpIGFsdGVybmF0ZWx5LlxuICBjb25zdCByZW1haW5pbmdCeXRlID0gKGRhdGFUb3RhbENvZGV3b3Jkc0JpdHMgLSBidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkpIC8gOFxuICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbWFpbmluZ0J5dGU7IGkrKykge1xuICAgIGJ1ZmZlci5wdXQoaSAlIDIgPyAweDExIDogMHhFQywgOClcbiAgfVxuXG4gIHJldHVybiBjcmVhdGVDb2Rld29yZHMoYnVmZmVyLCB2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcbn1cblxuLyoqXG4gKiBFbmNvZGUgaW5wdXQgZGF0YSB3aXRoIFJlZWQtU29sb21vbiBhbmQgcmV0dXJuIGNvZGV3b3JkcyB3aXRoXG4gKiByZWxhdGl2ZSBlcnJvciBjb3JyZWN0aW9uIGJpdHNcbiAqXG4gKiBAcGFyYW0gIHtCaXRCdWZmZXJ9IGJpdEJ1ZmZlciAgICAgICAgICAgIERhdGEgdG8gZW5jb2RlXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgIHZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxuICogQHBhcmFtICB7RXJyb3JDb3JyZWN0aW9uTGV2ZWx9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9ICAgICAgICAgICAgICAgICAgICAgQnVmZmVyIGNvbnRhaW5pbmcgZW5jb2RlZCBjb2Rld29yZHNcbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ29kZXdvcmRzIChiaXRCdWZmZXIsIHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XG4gIC8vIFRvdGFsIGNvZGV3b3JkcyBmb3IgdGhpcyBRUiBjb2RlIHZlcnNpb24gKERhdGEgKyBFcnJvciBjb3JyZWN0aW9uKVxuICBjb25zdCB0b3RhbENvZGV3b3JkcyA9IFV0aWxzLmdldFN5bWJvbFRvdGFsQ29kZXdvcmRzKHZlcnNpb24pXG5cbiAgLy8gVG90YWwgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzXG4gIGNvbnN0IGVjVG90YWxDb2Rld29yZHMgPSBFQ0NvZGUuZ2V0VG90YWxDb2Rld29yZHNDb3VudCh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcblxuICAvLyBUb3RhbCBudW1iZXIgb2YgZGF0YSBjb2Rld29yZHNcbiAgY29uc3QgZGF0YVRvdGFsQ29kZXdvcmRzID0gdG90YWxDb2Rld29yZHMgLSBlY1RvdGFsQ29kZXdvcmRzXG5cbiAgLy8gVG90YWwgbnVtYmVyIG9mIGJsb2Nrc1xuICBjb25zdCBlY1RvdGFsQmxvY2tzID0gRUNDb2RlLmdldEJsb2Nrc0NvdW50KHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKVxuXG4gIC8vIENhbGN1bGF0ZSBob3cgbWFueSBibG9ja3MgZWFjaCBncm91cCBzaG91bGQgY29udGFpblxuICBjb25zdCBibG9ja3NJbkdyb3VwMiA9IHRvdGFsQ29kZXdvcmRzICUgZWNUb3RhbEJsb2Nrc1xuICBjb25zdCBibG9ja3NJbkdyb3VwMSA9IGVjVG90YWxCbG9ja3MgLSBibG9ja3NJbkdyb3VwMlxuXG4gIGNvbnN0IHRvdGFsQ29kZXdvcmRzSW5Hcm91cDEgPSBNYXRoLmZsb29yKHRvdGFsQ29kZXdvcmRzIC8gZWNUb3RhbEJsb2NrcylcblxuICBjb25zdCBkYXRhQ29kZXdvcmRzSW5Hcm91cDEgPSBNYXRoLmZsb29yKGRhdGFUb3RhbENvZGV3b3JkcyAvIGVjVG90YWxCbG9ja3MpXG4gIGNvbnN0IGRhdGFDb2Rld29yZHNJbkdyb3VwMiA9IGRhdGFDb2Rld29yZHNJbkdyb3VwMSArIDFcblxuICAvLyBOdW1iZXIgb2YgRUMgY29kZXdvcmRzIGlzIHRoZSBzYW1lIGZvciBib3RoIGdyb3Vwc1xuICBjb25zdCBlY0NvdW50ID0gdG90YWxDb2Rld29yZHNJbkdyb3VwMSAtIGRhdGFDb2Rld29yZHNJbkdyb3VwMVxuXG4gIC8vIEluaXRpYWxpemUgYSBSZWVkLVNvbG9tb24gZW5jb2RlciB3aXRoIGEgZ2VuZXJhdG9yIHBvbHlub21pYWwgb2YgZGVncmVlIGVjQ291bnRcbiAgY29uc3QgcnMgPSBuZXcgUmVlZFNvbG9tb25FbmNvZGVyKGVjQ291bnQpXG5cbiAgbGV0IG9mZnNldCA9IDBcbiAgY29uc3QgZGNEYXRhID0gbmV3IEFycmF5KGVjVG90YWxCbG9ja3MpXG4gIGNvbnN0IGVjRGF0YSA9IG5ldyBBcnJheShlY1RvdGFsQmxvY2tzKVxuICBsZXQgbWF4RGF0YVNpemUgPSAwXG4gIGNvbnN0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGJpdEJ1ZmZlci5idWZmZXIpXG5cbiAgLy8gRGl2aWRlIHRoZSBidWZmZXIgaW50byB0aGUgcmVxdWlyZWQgbnVtYmVyIG9mIGJsb2Nrc1xuICBmb3IgKGxldCBiID0gMDsgYiA8IGVjVG90YWxCbG9ja3M7IGIrKykge1xuICAgIGNvbnN0IGRhdGFTaXplID0gYiA8IGJsb2Nrc0luR3JvdXAxID8gZGF0YUNvZGV3b3Jkc0luR3JvdXAxIDogZGF0YUNvZGV3b3Jkc0luR3JvdXAyXG5cbiAgICAvLyBleHRyYWN0IGEgYmxvY2sgb2YgZGF0YSBmcm9tIGJ1ZmZlclxuICAgIGRjRGF0YVtiXSA9IGJ1ZmZlci5zbGljZShvZmZzZXQsIG9mZnNldCArIGRhdGFTaXplKVxuXG4gICAgLy8gQ2FsY3VsYXRlIEVDIGNvZGV3b3JkcyBmb3IgdGhpcyBkYXRhIGJsb2NrXG4gICAgZWNEYXRhW2JdID0gcnMuZW5jb2RlKGRjRGF0YVtiXSlcblxuICAgIG9mZnNldCArPSBkYXRhU2l6ZVxuICAgIG1heERhdGFTaXplID0gTWF0aC5tYXgobWF4RGF0YVNpemUsIGRhdGFTaXplKVxuICB9XG5cbiAgLy8gQ3JlYXRlIGZpbmFsIGRhdGFcbiAgLy8gSW50ZXJsZWF2ZSB0aGUgZGF0YSBhbmQgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHMgZnJvbSBlYWNoIGJsb2NrXG4gIGNvbnN0IGRhdGEgPSBuZXcgVWludDhBcnJheSh0b3RhbENvZGV3b3JkcylcbiAgbGV0IGluZGV4ID0gMFxuICBsZXQgaSwgclxuXG4gIC8vIEFkZCBkYXRhIGNvZGV3b3Jkc1xuICBmb3IgKGkgPSAwOyBpIDwgbWF4RGF0YVNpemU7IGkrKykge1xuICAgIGZvciAociA9IDA7IHIgPCBlY1RvdGFsQmxvY2tzOyByKyspIHtcbiAgICAgIGlmIChpIDwgZGNEYXRhW3JdLmxlbmd0aCkge1xuICAgICAgICBkYXRhW2luZGV4KytdID0gZGNEYXRhW3JdW2ldXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQXBwZWQgRUMgY29kZXdvcmRzXG4gIGZvciAoaSA9IDA7IGkgPCBlY0NvdW50OyBpKyspIHtcbiAgICBmb3IgKHIgPSAwOyByIDwgZWNUb3RhbEJsb2NrczsgcisrKSB7XG4gICAgICBkYXRhW2luZGV4KytdID0gZWNEYXRhW3JdW2ldXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRhdGFcbn1cblxuLyoqXG4gKiBCdWlsZCBRUiBDb2RlIHN5bWJvbFxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YSAgICAgICAgICAgICAgICAgSW5wdXQgc3RyaW5nXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxuICogQHBhcmFtICB7RXJyb3JDb3JyZXRpb25MZXZlbH0gZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgbGV2ZWxcbiAqIEBwYXJhbSAge01hc2tQYXR0ZXJufSBtYXNrUGF0dGVybiAgICAgTWFzayBwYXR0ZXJuXG4gKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICAgICAgICAgICAgICAgIE9iamVjdCBjb250YWluaW5nIHN5bWJvbCBkYXRhXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVN5bWJvbCAoZGF0YSwgdmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2tQYXR0ZXJuKSB7XG4gIGxldCBzZWdtZW50c1xuXG4gIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgc2VnbWVudHMgPSBTZWdtZW50cy5mcm9tQXJyYXkoZGF0YSlcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICBsZXQgZXN0aW1hdGVkVmVyc2lvbiA9IHZlcnNpb25cblxuICAgIGlmICghZXN0aW1hdGVkVmVyc2lvbikge1xuICAgICAgY29uc3QgcmF3U2VnbWVudHMgPSBTZWdtZW50cy5yYXdTcGxpdChkYXRhKVxuXG4gICAgICAvLyBFc3RpbWF0ZSBiZXN0IHZlcnNpb24gdGhhdCBjYW4gY29udGFpbiByYXcgc3BsaXR0ZWQgc2VnbWVudHNcbiAgICAgIGVzdGltYXRlZFZlcnNpb24gPSBWZXJzaW9uLmdldEJlc3RWZXJzaW9uRm9yRGF0YShyYXdTZWdtZW50cywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXG4gICAgfVxuXG4gICAgLy8gQnVpbGQgb3B0aW1pemVkIHNlZ21lbnRzXG4gICAgLy8gSWYgZXN0aW1hdGVkIHZlcnNpb24gaXMgdW5kZWZpbmVkLCB0cnkgd2l0aCB0aGUgaGlnaGVzdCB2ZXJzaW9uXG4gICAgc2VnbWVudHMgPSBTZWdtZW50cy5mcm9tU3RyaW5nKGRhdGEsIGVzdGltYXRlZFZlcnNpb24gfHwgNDApXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRhdGEnKVxuICB9XG5cbiAgLy8gR2V0IHRoZSBtaW4gdmVyc2lvbiB0aGF0IGNhbiBjb250YWluIGRhdGFcbiAgY29uc3QgYmVzdFZlcnNpb24gPSBWZXJzaW9uLmdldEJlc3RWZXJzaW9uRm9yRGF0YShzZWdtZW50cywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXG5cbiAgLy8gSWYgbm8gdmVyc2lvbiBpcyBmb3VuZCwgZGF0YSBjYW5ub3QgYmUgc3RvcmVkXG4gIGlmICghYmVzdFZlcnNpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBhbW91bnQgb2YgZGF0YSBpcyB0b28gYmlnIHRvIGJlIHN0b3JlZCBpbiBhIFFSIENvZGUnKVxuICB9XG5cbiAgLy8gSWYgbm90IHNwZWNpZmllZCwgdXNlIG1pbiB2ZXJzaW9uIGFzIGRlZmF1bHRcbiAgaWYgKCF2ZXJzaW9uKSB7XG4gICAgdmVyc2lvbiA9IGJlc3RWZXJzaW9uXG5cbiAgLy8gQ2hlY2sgaWYgdGhlIHNwZWNpZmllZCB2ZXJzaW9uIGNhbiBjb250YWluIHRoZSBkYXRhXG4gIH0gZWxzZSBpZiAodmVyc2lvbiA8IGJlc3RWZXJzaW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcXG4nICtcbiAgICAgICdUaGUgY2hvc2VuIFFSIENvZGUgdmVyc2lvbiBjYW5ub3QgY29udGFpbiB0aGlzIGFtb3VudCBvZiBkYXRhLlxcbicgK1xuICAgICAgJ01pbmltdW0gdmVyc2lvbiByZXF1aXJlZCB0byBzdG9yZSBjdXJyZW50IGRhdGEgaXM6ICcgKyBiZXN0VmVyc2lvbiArICcuXFxuJ1xuICAgIClcbiAgfVxuXG4gIGNvbnN0IGRhdGFCaXRzID0gY3JlYXRlRGF0YSh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgc2VnbWVudHMpXG5cbiAgLy8gQWxsb2NhdGUgbWF0cml4IGJ1ZmZlclxuICBjb25zdCBtb2R1bGVDb3VudCA9IFV0aWxzLmdldFN5bWJvbFNpemUodmVyc2lvbilcbiAgY29uc3QgbW9kdWxlcyA9IG5ldyBCaXRNYXRyaXgobW9kdWxlQ291bnQpXG5cbiAgLy8gQWRkIGZ1bmN0aW9uIG1vZHVsZXNcbiAgc2V0dXBGaW5kZXJQYXR0ZXJuKG1vZHVsZXMsIHZlcnNpb24pXG4gIHNldHVwVGltaW5nUGF0dGVybihtb2R1bGVzKVxuICBzZXR1cEFsaWdubWVudFBhdHRlcm4obW9kdWxlcywgdmVyc2lvbilcblxuICAvLyBBZGQgdGVtcG9yYXJ5IGR1bW15IGJpdHMgZm9yIGZvcm1hdCBpbmZvIGp1c3QgdG8gc2V0IHRoZW0gYXMgcmVzZXJ2ZWQuXG4gIC8vIFRoaXMgaXMgbmVlZGVkIHRvIHByZXZlbnQgdGhlc2UgYml0cyBmcm9tIGJlaW5nIG1hc2tlZCBieSB7QGxpbmsgTWFza1BhdHRlcm4uYXBwbHlNYXNrfVxuICAvLyBzaW5jZSB0aGUgbWFza2luZyBvcGVyYXRpb24gbXVzdCBiZSBwZXJmb3JtZWQgb25seSBvbiB0aGUgZW5jb2RpbmcgcmVnaW9uLlxuICAvLyBUaGVzZSBibG9ja3Mgd2lsbCBiZSByZXBsYWNlZCB3aXRoIGNvcnJlY3QgdmFsdWVzIGxhdGVyIGluIGNvZGUuXG4gIHNldHVwRm9ybWF0SW5mbyhtb2R1bGVzLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgMClcblxuICBpZiAodmVyc2lvbiA+PSA3KSB7XG4gICAgc2V0dXBWZXJzaW9uSW5mbyhtb2R1bGVzLCB2ZXJzaW9uKVxuICB9XG5cbiAgLy8gQWRkIGRhdGEgY29kZXdvcmRzXG4gIHNldHVwRGF0YShtb2R1bGVzLCBkYXRhQml0cylcblxuICBpZiAoaXNOYU4obWFza1BhdHRlcm4pKSB7XG4gICAgLy8gRmluZCBiZXN0IG1hc2sgcGF0dGVyblxuICAgIG1hc2tQYXR0ZXJuID0gTWFza1BhdHRlcm4uZ2V0QmVzdE1hc2sobW9kdWxlcyxcbiAgICAgIHNldHVwRm9ybWF0SW5mby5iaW5kKG51bGwsIG1vZHVsZXMsIGVycm9yQ29ycmVjdGlvbkxldmVsKSlcbiAgfVxuXG4gIC8vIEFwcGx5IG1hc2sgcGF0dGVyblxuICBNYXNrUGF0dGVybi5hcHBseU1hc2sobWFza1BhdHRlcm4sIG1vZHVsZXMpXG5cbiAgLy8gUmVwbGFjZSBmb3JtYXQgaW5mbyBiaXRzIHdpdGggY29ycmVjdCB2YWx1ZXNcbiAgc2V0dXBGb3JtYXRJbmZvKG1vZHVsZXMsIGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrUGF0dGVybilcblxuICByZXR1cm4ge1xuICAgIG1vZHVsZXM6IG1vZHVsZXMsXG4gICAgdmVyc2lvbjogdmVyc2lvbixcbiAgICBlcnJvckNvcnJlY3Rpb25MZXZlbDogZXJyb3JDb3JyZWN0aW9uTGV2ZWwsXG4gICAgbWFza1BhdHRlcm46IG1hc2tQYXR0ZXJuLFxuICAgIHNlZ21lbnRzOiBzZWdtZW50c1xuICB9XG59XG5cbi8qKlxuICogUVIgQ29kZVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nIHwgQXJyYXl9IGRhdGEgICAgICAgICAgICAgICAgIElucHV0IGRhdGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zICAgICAgICAgICAgICAgICAgICAgIE9wdGlvbmFsIGNvbmZpZ3VyYXRpb25zXG4gKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy52ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cbiAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLmVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG9wdGlvbnMudG9TSklTRnVuYyAgICAgICAgIEhlbHBlciBmdW5jIHRvIGNvbnZlcnQgdXRmOCB0byBzamlzXG4gKi9cbmV4cG9ydHMuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlIChkYXRhLCBvcHRpb25zKSB7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcgfHwgZGF0YSA9PT0gJycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGlucHV0IHRleHQnKVxuICB9XG5cbiAgbGV0IGVycm9yQ29ycmVjdGlvbkxldmVsID0gRUNMZXZlbC5NXG4gIGxldCB2ZXJzaW9uXG4gIGxldCBtYXNrXG5cbiAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIFVzZSBoaWdoZXIgZXJyb3IgY29ycmVjdGlvbiBsZXZlbCBhcyBkZWZhdWx0XG4gICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWwgPSBFQ0xldmVsLmZyb20ob3B0aW9ucy5lcnJvckNvcnJlY3Rpb25MZXZlbCwgRUNMZXZlbC5NKVxuICAgIHZlcnNpb24gPSBWZXJzaW9uLmZyb20ob3B0aW9ucy52ZXJzaW9uKVxuICAgIG1hc2sgPSBNYXNrUGF0dGVybi5mcm9tKG9wdGlvbnMubWFza1BhdHRlcm4pXG5cbiAgICBpZiAob3B0aW9ucy50b1NKSVNGdW5jKSB7XG4gICAgICBVdGlscy5zZXRUb1NKSVNGdW5jdGlvbihvcHRpb25zLnRvU0pJU0Z1bmMpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNyZWF0ZVN5bWJvbChkYXRhLCB2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbWFzaylcbn1cbiIsICJmdW5jdGlvbiBoZXgycmdiYSAoaGV4KSB7XG4gIGlmICh0eXBlb2YgaGV4ID09PSAnbnVtYmVyJykge1xuICAgIGhleCA9IGhleC50b1N0cmluZygpXG4gIH1cblxuICBpZiAodHlwZW9mIGhleCAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbG9yIHNob3VsZCBiZSBkZWZpbmVkIGFzIGhleCBzdHJpbmcnKVxuICB9XG5cbiAgbGV0IGhleENvZGUgPSBoZXguc2xpY2UoKS5yZXBsYWNlKCcjJywgJycpLnNwbGl0KCcnKVxuICBpZiAoaGV4Q29kZS5sZW5ndGggPCAzIHx8IGhleENvZGUubGVuZ3RoID09PSA1IHx8IGhleENvZGUubGVuZ3RoID4gOCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBoZXggY29sb3I6ICcgKyBoZXgpXG4gIH1cblxuICAvLyBDb252ZXJ0IGZyb20gc2hvcnQgdG8gbG9uZyBmb3JtIChmZmYgLT4gZmZmZmZmKVxuICBpZiAoaGV4Q29kZS5sZW5ndGggPT09IDMgfHwgaGV4Q29kZS5sZW5ndGggPT09IDQpIHtcbiAgICBoZXhDb2RlID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgaGV4Q29kZS5tYXAoZnVuY3Rpb24gKGMpIHtcbiAgICAgIHJldHVybiBbYywgY11cbiAgICB9KSlcbiAgfVxuXG4gIC8vIEFkZCBkZWZhdWx0IGFscGhhIHZhbHVlXG4gIGlmIChoZXhDb2RlLmxlbmd0aCA9PT0gNikgaGV4Q29kZS5wdXNoKCdGJywgJ0YnKVxuXG4gIGNvbnN0IGhleFZhbHVlID0gcGFyc2VJbnQoaGV4Q29kZS5qb2luKCcnKSwgMTYpXG5cbiAgcmV0dXJuIHtcbiAgICByOiAoaGV4VmFsdWUgPj4gMjQpICYgMjU1LFxuICAgIGc6IChoZXhWYWx1ZSA+PiAxNikgJiAyNTUsXG4gICAgYjogKGhleFZhbHVlID4+IDgpICYgMjU1LFxuICAgIGE6IGhleFZhbHVlICYgMjU1LFxuICAgIGhleDogJyMnICsgaGV4Q29kZS5zbGljZSgwLCA2KS5qb2luKCcnKVxuICB9XG59XG5cbmV4cG9ydHMuZ2V0T3B0aW9ucyA9IGZ1bmN0aW9uIGdldE9wdGlvbnMgKG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge31cbiAgaWYgKCFvcHRpb25zLmNvbG9yKSBvcHRpb25zLmNvbG9yID0ge31cblxuICBjb25zdCBtYXJnaW4gPSB0eXBlb2Ygb3B0aW9ucy5tYXJnaW4gPT09ICd1bmRlZmluZWQnIHx8XG4gICAgb3B0aW9ucy5tYXJnaW4gPT09IG51bGwgfHxcbiAgICBvcHRpb25zLm1hcmdpbiA8IDBcbiAgICA/IDRcbiAgICA6IG9wdGlvbnMubWFyZ2luXG5cbiAgY29uc3Qgd2lkdGggPSBvcHRpb25zLndpZHRoICYmIG9wdGlvbnMud2lkdGggPj0gMjEgPyBvcHRpb25zLndpZHRoIDogdW5kZWZpbmVkXG4gIGNvbnN0IHNjYWxlID0gb3B0aW9ucy5zY2FsZSB8fCA0XG5cbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogd2lkdGgsXG4gICAgc2NhbGU6IHdpZHRoID8gNCA6IHNjYWxlLFxuICAgIG1hcmdpbjogbWFyZ2luLFxuICAgIGNvbG9yOiB7XG4gICAgICBkYXJrOiBoZXgycmdiYShvcHRpb25zLmNvbG9yLmRhcmsgfHwgJyMwMDAwMDBmZicpLFxuICAgICAgbGlnaHQ6IGhleDJyZ2JhKG9wdGlvbnMuY29sb3IubGlnaHQgfHwgJyNmZmZmZmZmZicpXG4gICAgfSxcbiAgICB0eXBlOiBvcHRpb25zLnR5cGUsXG4gICAgcmVuZGVyZXJPcHRzOiBvcHRpb25zLnJlbmRlcmVyT3B0cyB8fCB7fVxuICB9XG59XG5cbmV4cG9ydHMuZ2V0U2NhbGUgPSBmdW5jdGlvbiBnZXRTY2FsZSAocXJTaXplLCBvcHRzKSB7XG4gIHJldHVybiBvcHRzLndpZHRoICYmIG9wdHMud2lkdGggPj0gcXJTaXplICsgb3B0cy5tYXJnaW4gKiAyXG4gICAgPyBvcHRzLndpZHRoIC8gKHFyU2l6ZSArIG9wdHMubWFyZ2luICogMilcbiAgICA6IG9wdHMuc2NhbGVcbn1cblxuZXhwb3J0cy5nZXRJbWFnZVdpZHRoID0gZnVuY3Rpb24gZ2V0SW1hZ2VXaWR0aCAocXJTaXplLCBvcHRzKSB7XG4gIGNvbnN0IHNjYWxlID0gZXhwb3J0cy5nZXRTY2FsZShxclNpemUsIG9wdHMpXG4gIHJldHVybiBNYXRoLmZsb29yKChxclNpemUgKyBvcHRzLm1hcmdpbiAqIDIpICogc2NhbGUpXG59XG5cbmV4cG9ydHMucXJUb0ltYWdlRGF0YSA9IGZ1bmN0aW9uIHFyVG9JbWFnZURhdGEgKGltZ0RhdGEsIHFyLCBvcHRzKSB7XG4gIGNvbnN0IHNpemUgPSBxci5tb2R1bGVzLnNpemVcbiAgY29uc3QgZGF0YSA9IHFyLm1vZHVsZXMuZGF0YVxuICBjb25zdCBzY2FsZSA9IGV4cG9ydHMuZ2V0U2NhbGUoc2l6ZSwgb3B0cylcbiAgY29uc3Qgc3ltYm9sU2l6ZSA9IE1hdGguZmxvb3IoKHNpemUgKyBvcHRzLm1hcmdpbiAqIDIpICogc2NhbGUpXG4gIGNvbnN0IHNjYWxlZE1hcmdpbiA9IG9wdHMubWFyZ2luICogc2NhbGVcbiAgY29uc3QgcGFsZXR0ZSA9IFtvcHRzLmNvbG9yLmxpZ2h0LCBvcHRzLmNvbG9yLmRhcmtdXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzeW1ib2xTaXplOyBpKyspIHtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHN5bWJvbFNpemU7IGorKykge1xuICAgICAgbGV0IHBvc0RzdCA9IChpICogc3ltYm9sU2l6ZSArIGopICogNFxuICAgICAgbGV0IHB4Q29sb3IgPSBvcHRzLmNvbG9yLmxpZ2h0XG5cbiAgICAgIGlmIChpID49IHNjYWxlZE1hcmdpbiAmJiBqID49IHNjYWxlZE1hcmdpbiAmJlxuICAgICAgICBpIDwgc3ltYm9sU2l6ZSAtIHNjYWxlZE1hcmdpbiAmJiBqIDwgc3ltYm9sU2l6ZSAtIHNjYWxlZE1hcmdpbikge1xuICAgICAgICBjb25zdCBpU3JjID0gTWF0aC5mbG9vcigoaSAtIHNjYWxlZE1hcmdpbikgLyBzY2FsZSlcbiAgICAgICAgY29uc3QgalNyYyA9IE1hdGguZmxvb3IoKGogLSBzY2FsZWRNYXJnaW4pIC8gc2NhbGUpXG4gICAgICAgIHB4Q29sb3IgPSBwYWxldHRlW2RhdGFbaVNyYyAqIHNpemUgKyBqU3JjXSA/IDEgOiAwXVxuICAgICAgfVxuXG4gICAgICBpbWdEYXRhW3Bvc0RzdCsrXSA9IHB4Q29sb3IuclxuICAgICAgaW1nRGF0YVtwb3NEc3QrK10gPSBweENvbG9yLmdcbiAgICAgIGltZ0RhdGFbcG9zRHN0KytdID0gcHhDb2xvci5iXG4gICAgICBpbWdEYXRhW3Bvc0RzdF0gPSBweENvbG9yLmFcbiAgICB9XG4gIH1cbn1cbiIsICJjb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuXG5mdW5jdGlvbiBjbGVhckNhbnZhcyAoY3R4LCBjYW52YXMsIHNpemUpIHtcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpXG5cbiAgaWYgKCFjYW52YXMuc3R5bGUpIGNhbnZhcy5zdHlsZSA9IHt9XG4gIGNhbnZhcy5oZWlnaHQgPSBzaXplXG4gIGNhbnZhcy53aWR0aCA9IHNpemVcbiAgY2FudmFzLnN0eWxlLmhlaWdodCA9IHNpemUgKyAncHgnXG4gIGNhbnZhcy5zdHlsZS53aWR0aCA9IHNpemUgKyAncHgnXG59XG5cbmZ1bmN0aW9uIGdldENhbnZhc0VsZW1lbnQgKCkge1xuICB0cnkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbmVlZCB0byBzcGVjaWZ5IGEgY2FudmFzIGVsZW1lbnQnKVxuICB9XG59XG5cbmV4cG9ydHMucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyIChxckRhdGEsIGNhbnZhcywgb3B0aW9ucykge1xuICBsZXQgb3B0cyA9IG9wdGlvbnNcbiAgbGV0IGNhbnZhc0VsID0gY2FudmFzXG5cbiAgaWYgKHR5cGVvZiBvcHRzID09PSAndW5kZWZpbmVkJyAmJiAoIWNhbnZhcyB8fCAhY2FudmFzLmdldENvbnRleHQpKSB7XG4gICAgb3B0cyA9IGNhbnZhc1xuICAgIGNhbnZhcyA9IHVuZGVmaW5lZFxuICB9XG5cbiAgaWYgKCFjYW52YXMpIHtcbiAgICBjYW52YXNFbCA9IGdldENhbnZhc0VsZW1lbnQoKVxuICB9XG5cbiAgb3B0cyA9IFV0aWxzLmdldE9wdGlvbnMob3B0cylcbiAgY29uc3Qgc2l6ZSA9IFV0aWxzLmdldEltYWdlV2lkdGgocXJEYXRhLm1vZHVsZXMuc2l6ZSwgb3B0cylcblxuICBjb25zdCBjdHggPSBjYW52YXNFbC5nZXRDb250ZXh0KCcyZCcpXG4gIGNvbnN0IGltYWdlID0gY3R4LmNyZWF0ZUltYWdlRGF0YShzaXplLCBzaXplKVxuICBVdGlscy5xclRvSW1hZ2VEYXRhKGltYWdlLmRhdGEsIHFyRGF0YSwgb3B0cylcblxuICBjbGVhckNhbnZhcyhjdHgsIGNhbnZhc0VsLCBzaXplKVxuICBjdHgucHV0SW1hZ2VEYXRhKGltYWdlLCAwLCAwKVxuXG4gIHJldHVybiBjYW52YXNFbFxufVxuXG5leHBvcnRzLnJlbmRlclRvRGF0YVVSTCA9IGZ1bmN0aW9uIHJlbmRlclRvRGF0YVVSTCAocXJEYXRhLCBjYW52YXMsIG9wdGlvbnMpIHtcbiAgbGV0IG9wdHMgPSBvcHRpb25zXG5cbiAgaWYgKHR5cGVvZiBvcHRzID09PSAndW5kZWZpbmVkJyAmJiAoIWNhbnZhcyB8fCAhY2FudmFzLmdldENvbnRleHQpKSB7XG4gICAgb3B0cyA9IGNhbnZhc1xuICAgIGNhbnZhcyA9IHVuZGVmaW5lZFxuICB9XG5cbiAgaWYgKCFvcHRzKSBvcHRzID0ge31cblxuICBjb25zdCBjYW52YXNFbCA9IGV4cG9ydHMucmVuZGVyKHFyRGF0YSwgY2FudmFzLCBvcHRzKVxuXG4gIGNvbnN0IHR5cGUgPSBvcHRzLnR5cGUgfHwgJ2ltYWdlL3BuZydcbiAgY29uc3QgcmVuZGVyZXJPcHRzID0gb3B0cy5yZW5kZXJlck9wdHMgfHwge31cblxuICByZXR1cm4gY2FudmFzRWwudG9EYXRhVVJMKHR5cGUsIHJlbmRlcmVyT3B0cy5xdWFsaXR5KVxufVxuIiwgImNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5cbmZ1bmN0aW9uIGdldENvbG9yQXR0cmliIChjb2xvciwgYXR0cmliKSB7XG4gIGNvbnN0IGFscGhhID0gY29sb3IuYSAvIDI1NVxuICBjb25zdCBzdHIgPSBhdHRyaWIgKyAnPVwiJyArIGNvbG9yLmhleCArICdcIidcblxuICByZXR1cm4gYWxwaGEgPCAxXG4gICAgPyBzdHIgKyAnICcgKyBhdHRyaWIgKyAnLW9wYWNpdHk9XCInICsgYWxwaGEudG9GaXhlZCgyKS5zbGljZSgxKSArICdcIidcbiAgICA6IHN0clxufVxuXG5mdW5jdGlvbiBzdmdDbWQgKGNtZCwgeCwgeSkge1xuICBsZXQgc3RyID0gY21kICsgeFxuICBpZiAodHlwZW9mIHkgIT09ICd1bmRlZmluZWQnKSBzdHIgKz0gJyAnICsgeVxuXG4gIHJldHVybiBzdHJcbn1cblxuZnVuY3Rpb24gcXJUb1BhdGggKGRhdGEsIHNpemUsIG1hcmdpbikge1xuICBsZXQgcGF0aCA9ICcnXG4gIGxldCBtb3ZlQnkgPSAwXG4gIGxldCBuZXdSb3cgPSBmYWxzZVxuICBsZXQgbGluZUxlbmd0aCA9IDBcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjb2wgPSBNYXRoLmZsb29yKGkgJSBzaXplKVxuICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoaSAvIHNpemUpXG5cbiAgICBpZiAoIWNvbCAmJiAhbmV3Um93KSBuZXdSb3cgPSB0cnVlXG5cbiAgICBpZiAoZGF0YVtpXSkge1xuICAgICAgbGluZUxlbmd0aCsrXG5cbiAgICAgIGlmICghKGkgPiAwICYmIGNvbCA+IDAgJiYgZGF0YVtpIC0gMV0pKSB7XG4gICAgICAgIHBhdGggKz0gbmV3Um93XG4gICAgICAgICAgPyBzdmdDbWQoJ00nLCBjb2wgKyBtYXJnaW4sIDAuNSArIHJvdyArIG1hcmdpbilcbiAgICAgICAgICA6IHN2Z0NtZCgnbScsIG1vdmVCeSwgMClcblxuICAgICAgICBtb3ZlQnkgPSAwXG4gICAgICAgIG5ld1JvdyA9IGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGlmICghKGNvbCArIDEgPCBzaXplICYmIGRhdGFbaSArIDFdKSkge1xuICAgICAgICBwYXRoICs9IHN2Z0NtZCgnaCcsIGxpbmVMZW5ndGgpXG4gICAgICAgIGxpbmVMZW5ndGggPSAwXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG1vdmVCeSsrXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhdGhcbn1cblxuZXhwb3J0cy5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIgKHFyRGF0YSwgb3B0aW9ucywgY2IpIHtcbiAgY29uc3Qgb3B0cyA9IFV0aWxzLmdldE9wdGlvbnMob3B0aW9ucylcbiAgY29uc3Qgc2l6ZSA9IHFyRGF0YS5tb2R1bGVzLnNpemVcbiAgY29uc3QgZGF0YSA9IHFyRGF0YS5tb2R1bGVzLmRhdGFcbiAgY29uc3QgcXJjb2Rlc2l6ZSA9IHNpemUgKyBvcHRzLm1hcmdpbiAqIDJcblxuICBjb25zdCBiZyA9ICFvcHRzLmNvbG9yLmxpZ2h0LmFcbiAgICA/ICcnXG4gICAgOiAnPHBhdGggJyArIGdldENvbG9yQXR0cmliKG9wdHMuY29sb3IubGlnaHQsICdmaWxsJykgK1xuICAgICAgJyBkPVwiTTAgMGgnICsgcXJjb2Rlc2l6ZSArICd2JyArIHFyY29kZXNpemUgKyAnSDB6XCIvPidcblxuICBjb25zdCBwYXRoID1cbiAgICAnPHBhdGggJyArIGdldENvbG9yQXR0cmliKG9wdHMuY29sb3IuZGFyaywgJ3N0cm9rZScpICtcbiAgICAnIGQ9XCInICsgcXJUb1BhdGgoZGF0YSwgc2l6ZSwgb3B0cy5tYXJnaW4pICsgJ1wiLz4nXG5cbiAgY29uc3Qgdmlld0JveCA9ICd2aWV3Qm94PVwiJyArICcwIDAgJyArIHFyY29kZXNpemUgKyAnICcgKyBxcmNvZGVzaXplICsgJ1wiJ1xuXG4gIGNvbnN0IHdpZHRoID0gIW9wdHMud2lkdGggPyAnJyA6ICd3aWR0aD1cIicgKyBvcHRzLndpZHRoICsgJ1wiIGhlaWdodD1cIicgKyBvcHRzLndpZHRoICsgJ1wiICdcblxuICBjb25zdCBzdmdUYWcgPSAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgJyArIHdpZHRoICsgdmlld0JveCArICcgc2hhcGUtcmVuZGVyaW5nPVwiY3Jpc3BFZGdlc1wiPicgKyBiZyArIHBhdGggKyAnPC9zdmc+XFxuJ1xuXG4gIGlmICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYihudWxsLCBzdmdUYWcpXG4gIH1cblxuICByZXR1cm4gc3ZnVGFnXG59XG4iLCAiXG5jb25zdCBjYW5Qcm9taXNlID0gcmVxdWlyZSgnLi9jYW4tcHJvbWlzZScpXG5cbmNvbnN0IFFSQ29kZSA9IHJlcXVpcmUoJy4vY29yZS9xcmNvZGUnKVxuY29uc3QgQ2FudmFzUmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcmVyL2NhbnZhcycpXG5jb25zdCBTdmdSZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXIvc3ZnLXRhZy5qcycpXG5cbmZ1bmN0aW9uIHJlbmRlckNhbnZhcyAocmVuZGVyRnVuYywgY2FudmFzLCB0ZXh0LCBvcHRzLCBjYikge1xuICBjb25zdCBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gIGNvbnN0IGFyZ3NOdW0gPSBhcmdzLmxlbmd0aFxuICBjb25zdCBpc0xhc3RBcmdDYiA9IHR5cGVvZiBhcmdzW2FyZ3NOdW0gLSAxXSA9PT0gJ2Z1bmN0aW9uJ1xuXG4gIGlmICghaXNMYXN0QXJnQ2IgJiYgIWNhblByb21pc2UoKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2FsbGJhY2sgcmVxdWlyZWQgYXMgbGFzdCBhcmd1bWVudCcpXG4gIH1cblxuICBpZiAoaXNMYXN0QXJnQ2IpIHtcbiAgICBpZiAoYXJnc051bSA8IDIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVG9vIGZldyBhcmd1bWVudHMgcHJvdmlkZWQnKVxuICAgIH1cblxuICAgIGlmIChhcmdzTnVtID09PSAyKSB7XG4gICAgICBjYiA9IHRleHRcbiAgICAgIHRleHQgPSBjYW52YXNcbiAgICAgIGNhbnZhcyA9IG9wdHMgPSB1bmRlZmluZWRcbiAgICB9IGVsc2UgaWYgKGFyZ3NOdW0gPT09IDMpIHtcbiAgICAgIGlmIChjYW52YXMuZ2V0Q29udGV4dCAmJiB0eXBlb2YgY2IgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNiID0gb3B0c1xuICAgICAgICBvcHRzID0gdW5kZWZpbmVkXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYiA9IG9wdHNcbiAgICAgICAgb3B0cyA9IHRleHRcbiAgICAgICAgdGV4dCA9IGNhbnZhc1xuICAgICAgICBjYW52YXMgPSB1bmRlZmluZWRcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGFyZ3NOdW0gPCAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RvbyBmZXcgYXJndW1lbnRzIHByb3ZpZGVkJylcbiAgICB9XG5cbiAgICBpZiAoYXJnc051bSA9PT0gMSkge1xuICAgICAgdGV4dCA9IGNhbnZhc1xuICAgICAgY2FudmFzID0gb3B0cyA9IHVuZGVmaW5lZFxuICAgIH0gZWxzZSBpZiAoYXJnc051bSA9PT0gMiAmJiAhY2FudmFzLmdldENvbnRleHQpIHtcbiAgICAgIG9wdHMgPSB0ZXh0XG4gICAgICB0ZXh0ID0gY2FudmFzXG4gICAgICBjYW52YXMgPSB1bmRlZmluZWRcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IFFSQ29kZS5jcmVhdGUodGV4dCwgb3B0cylcbiAgICAgICAgcmVzb2x2ZShyZW5kZXJGdW5jKGRhdGEsIGNhbnZhcywgb3B0cykpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJlamVjdChlKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IGRhdGEgPSBRUkNvZGUuY3JlYXRlKHRleHQsIG9wdHMpXG4gICAgY2IobnVsbCwgcmVuZGVyRnVuYyhkYXRhLCBjYW52YXMsIG9wdHMpKVxuICB9IGNhdGNoIChlKSB7XG4gICAgY2IoZSlcbiAgfVxufVxuXG5leHBvcnRzLmNyZWF0ZSA9IFFSQ29kZS5jcmVhdGVcbmV4cG9ydHMudG9DYW52YXMgPSByZW5kZXJDYW52YXMuYmluZChudWxsLCBDYW52YXNSZW5kZXJlci5yZW5kZXIpXG5leHBvcnRzLnRvRGF0YVVSTCA9IHJlbmRlckNhbnZhcy5iaW5kKG51bGwsIENhbnZhc1JlbmRlcmVyLnJlbmRlclRvRGF0YVVSTClcblxuLy8gb25seSBzdmcgZm9yIG5vdy5cbmV4cG9ydHMudG9TdHJpbmcgPSByZW5kZXJDYW52YXMuYmluZChudWxsLCBmdW5jdGlvbiAoZGF0YSwgXywgb3B0cykge1xuICByZXR1cm4gU3ZnUmVuZGVyZXIucmVuZGVyKGRhdGEsIG9wdHMpXG59KVxuIiwgIi8qKlxuICogQnJvd3NlciBBUEkgY29tcGF0aWJpbGl0eSBsYXllciBmb3IgQ2hyb21lIC8gU2FmYXJpIC8gRmlyZWZveC5cbiAqXG4gKiBTYWZhcmkgYW5kIEZpcmVmb3ggZXhwb3NlIGBicm93c2VyLipgIChQcm9taXNlLWJhc2VkLCBXZWJFeHRlbnNpb24gc3RhbmRhcmQpLlxuICogQ2hyb21lIGV4cG9zZXMgYGNocm9tZS4qYCAoY2FsbGJhY2stYmFzZWQgaGlzdG9yaWNhbGx5LCBidXQgTVYzIHN1cHBvcnRzXG4gKiBwcm9taXNlcyBvbiBtb3N0IEFQSXMpLiBJbiBhIHNlcnZpY2Utd29ya2VyIGNvbnRleHQgYGJyb3dzZXJgIGlzIHVuZGVmaW5lZFxuICogb24gQ2hyb21lLCBzbyB3ZSBub3JtYWxpc2UgZXZlcnl0aGluZyBoZXJlLlxuICpcbiAqIFVzYWdlOiAgaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG4gKiAgICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLilcbiAqXG4gKiBUaGUgZXhwb3J0ZWQgYGFwaWAgb2JqZWN0IG1pcnJvcnMgdGhlIHN1YnNldCBvZiB0aGUgV2ViRXh0ZW5zaW9uIEFQSSB0aGF0XG4gKiBOb3N0cktleSBhY3R1YWxseSB1c2VzLCB3aXRoIGV2ZXJ5IG1ldGhvZCByZXR1cm5pbmcgYSBQcm9taXNlLlxuICovXG5cbi8vIERldGVjdCB3aGljaCBnbG9iYWwgbmFtZXNwYWNlIGlzIGF2YWlsYWJsZS5cbmNvbnN0IF9icm93c2VyID1cbiAgICB0eXBlb2YgYnJvd3NlciAhPT0gJ3VuZGVmaW5lZCcgPyBicm93c2VyIDpcbiAgICB0eXBlb2YgY2hyb21lICAhPT0gJ3VuZGVmaW5lZCcgPyBjaHJvbWUgIDpcbiAgICBudWxsO1xuXG5pZiAoIV9icm93c2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdicm93c2VyLXBvbHlmaWxsOiBObyBleHRlbnNpb24gQVBJIG5hbWVzcGFjZSBmb3VuZCAobmVpdGhlciBicm93c2VyIG5vciBjaHJvbWUpLicpO1xufVxuXG4vKipcbiAqIFRydWUgd2hlbiBydW5uaW5nIG9uIENocm9tZSAob3IgYW55IENocm9taXVtLWJhc2VkIGJyb3dzZXIgdGhhdCBvbmx5XG4gKiBleHBvc2VzIHRoZSBgY2hyb21lYCBuYW1lc3BhY2UpLlxuICovXG5jb25zdCBpc0Nocm9tZSA9IHR5cGVvZiBicm93c2VyID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY2hyb21lICE9PSAndW5kZWZpbmVkJztcblxuLyoqXG4gKiBXcmFwIGEgQ2hyb21lIGNhbGxiYWNrLXN0eWxlIG1ldGhvZCBzbyBpdCByZXR1cm5zIGEgUHJvbWlzZS5cbiAqIElmIHRoZSBtZXRob2QgYWxyZWFkeSByZXR1cm5zIGEgcHJvbWlzZSAoTVYzKSB3ZSBqdXN0IHBhc3MgdGhyb3VnaC5cbiAqL1xuZnVuY3Rpb24gcHJvbWlzaWZ5KGNvbnRleHQsIG1ldGhvZCkge1xuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICAvLyBNVjMgQ2hyb21lIEFQSXMgcmV0dXJuIHByb21pc2VzIHdoZW4gbm8gY2FsbGJhY2sgaXMgc3VwcGxpZWQuXG4gICAgICAgIC8vIFdlIHRyeSB0aGUgcHJvbWlzZSBwYXRoIGZpcnN0OyBpZiB0aGUgcnVudGltZSBzaWduYWxzIGFuIGVycm9yXG4gICAgICAgIC8vIHZpYSBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IgaW5zaWRlIGEgY2FsbGJhY2sgd2UgY2F0Y2ggdGhhdCB0b28uXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaCB0byBjYWxsYmFjayB3cmFwcGluZ1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIG1ldGhvZC5hcHBseShjb250ZXh0LCBbXG4gICAgICAgICAgICAgICAgLi4uYXJncyxcbiAgICAgICAgICAgICAgICAoLi4uY2JBcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYnJvd3Nlci5ydW50aW1lICYmIF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY2JBcmdzLmxlbmd0aCA8PSAxID8gY2JBcmdzWzBdIDogY2JBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCdWlsZCB0aGUgdW5pZmllZCBgYXBpYCBvYmplY3Rcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBhcGkgPSB7fTtcblxuLy8gLS0tIHJ1bnRpbWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkucnVudGltZSA9IHtcbiAgICAvKipcbiAgICAgKiBzZW5kTWVzc2FnZSBcdTIwMTMgYWx3YXlzIHJldHVybnMgYSBQcm9taXNlLlxuICAgICAqL1xuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25NZXNzYWdlIFx1MjAxMyB0aGluIHdyYXBwZXIgc28gY2FsbGVycyB1c2UgYSBjb25zaXN0ZW50IHJlZmVyZW5jZS5cbiAgICAgKiBUaGUgbGlzdGVuZXIgc2lnbmF0dXJlIGlzIChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkuXG4gICAgICogT24gQ2hyb21lIHRoZSBsaXN0ZW5lciBjYW4gcmV0dXJuIGB0cnVlYCB0byBrZWVwIHRoZSBjaGFubmVsIG9wZW4sXG4gICAgICogb3IgcmV0dXJuIGEgUHJvbWlzZSAoTVYzKS4gIFNhZmFyaSAvIEZpcmVmb3ggZXhwZWN0IGEgUHJvbWlzZSByZXR1cm4uXG4gICAgICovXG4gICAgb25NZXNzYWdlOiBfYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZSxcblxuICAgIC8qKlxuICAgICAqIGdldFVSTCBcdTIwMTMgc3luY2hyb25vdXMgb24gYWxsIGJyb3dzZXJzLlxuICAgICAqL1xuICAgIGdldFVSTChwYXRoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmdldFVSTChwYXRoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb3Blbk9wdGlvbnNQYWdlXG4gICAgICovXG4gICAgb3Blbk9wdGlvbnNQYWdlKCkge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHBvc2UgdGhlIGlkIGZvciBjb252ZW5pZW5jZS5cbiAgICAgKi9cbiAgICBnZXQgaWQoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmlkO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gc3RvcmFnZS5sb2NhbCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5zdG9yYWdlID0ge1xuICAgIGxvY2FsOiB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSxcbn07XG5cbi8vIC0tLSB0YWJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnRhYnMgPSB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5jcmVhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcXVlcnkoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5xdWVyeSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucXVlcnkpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgdXBkYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMudXBkYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy51cGRhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0Q3VycmVudCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQpKC4uLmFyZ3MpO1xuICAgIH0sXG59O1xuXG5leHBvcnQgeyBhcGksIGlzQ2hyb21lIH07XG4iLCAiaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7IGVuY3J5cHQsIGRlY3J5cHQsIGhhc2hQYXNzd29yZCwgdmVyaWZ5UGFzc3dvcmQgfSBmcm9tICcuL2NyeXB0byc7XG5cbmNvbnN0IERCX1ZFUlNJT04gPSA1O1xuY29uc3Qgc3RvcmFnZSA9IGFwaS5zdG9yYWdlLmxvY2FsO1xuZXhwb3J0IGNvbnN0IFJFQ09NTUVOREVEX1JFTEFZUyA9IFtcbiAgICBuZXcgVVJMKCd3c3M6Ly9yZWxheS5kYW11cy5pbycpLFxuICAgIG5ldyBVUkwoJ3dzczovL3JlbGF5LnByaW1hbC5uZXQnKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9yZWxheS5zbm9ydC5zb2NpYWwnKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9yZWxheS5nZXRhbGJ5LmNvbS92MScpLFxuICAgIG5ldyBVUkwoJ3dzczovL25vcy5sb2wnKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9icmIuaW8nKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9ub3N0ci5vcmFuZ2VwaWxsLmRldicpLFxuXTtcbi8vIHByZXR0aWVyLWlnbm9yZVxuZXhwb3J0IGNvbnN0IEtJTkRTID0gW1xuICAgIFswLCAnTWV0YWRhdGEnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDEubWQnXSxcbiAgICBbMSwgJ1RleHQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDEubWQnXSxcbiAgICBbMiwgJ1JlY29tbWVuZCBSZWxheScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMS5tZCddLFxuICAgIFszLCAnQ29udGFjdHMnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDIubWQnXSxcbiAgICBbNCwgJ0VuY3J5cHRlZCBEaXJlY3QgTWVzc2FnZXMnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDQubWQnXSxcbiAgICBbNSwgJ0V2ZW50IERlbGV0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzA5Lm1kJ10sXG4gICAgWzYsICdSZXBvc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMTgubWQnXSxcbiAgICBbNywgJ1JlYWN0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI1Lm1kJ10sXG4gICAgWzgsICdCYWRnZSBBd2FyZCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81OC5tZCddLFxuICAgIFsxNiwgJ0dlbmVyaWMgUmVwb3N0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzE4Lm1kJ10sXG4gICAgWzQwLCAnQ2hhbm5lbCBDcmVhdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFs0MSwgJ0NoYW5uZWwgTWV0YWRhdGEnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjgubWQnXSxcbiAgICBbNDIsICdDaGFubmVsIE1lc3NhZ2UnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjgubWQnXSxcbiAgICBbNDMsICdDaGFubmVsIEhpZGUgTWVzc2FnZScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFs0NCwgJ0NoYW5uZWwgTXV0ZSBVc2VyJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzEwNjMsICdGaWxlIE1ldGFkYXRhJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk0Lm1kJ10sXG4gICAgWzEzMTEsICdMaXZlIENoYXQgTWVzc2FnZScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81My5tZCddLFxuICAgIFsxOTg0LCAnUmVwb3J0aW5nJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU2Lm1kJ10sXG4gICAgWzE5ODUsICdMYWJlbCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8zMi5tZCddLFxuICAgIFs0NTUwLCAnQ29tbXVuaXR5IFBvc3QgQXBwcm92YWwnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNzIubWQnXSxcbiAgICBbNzAwMCwgJ0pvYiBGZWVkYmFjaycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci85MC5tZCddLFxuICAgIFs5MDQxLCAnWmFwIEdvYWwnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNzUubWQnXSxcbiAgICBbOTczNCwgJ1phcCBSZXF1ZXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU3Lm1kJ10sXG4gICAgWzk3MzUsICdaYXAnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTcubWQnXSxcbiAgICBbMTAwMDAsICdNdXRlIExpc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTEubWQnXSxcbiAgICBbMTAwMDEsICdQaW4gTGlzdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81MS5tZCddLFxuICAgIFsxMDAwMiwgJ1JlbGF5IExpc3QgTWV0YWRhdGEnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNjUubWQnXSxcbiAgICBbMTMxOTQsICdXYWxsZXQgSW5mbycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci80Ny5tZCddLFxuICAgIFsyMjI0MiwgJ0NsaWVudCBBdXRoZW50aWNhdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci80Mi5tZCddLFxuICAgIFsyMzE5NCwgJ1dhbGxldCBSZXF1ZXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ3Lm1kJ10sXG4gICAgWzIzMTk1LCAnV2FsbGV0IFJlc3BvbnNlJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ3Lm1kJ10sXG4gICAgWzI0MTMzLCAnTm9zdHIgQ29ubmVjdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci80Ni5tZCddLFxuICAgIFsyNzIzNSwgJ0hUVFAgQXV0aCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci85OC5tZCddLFxuICAgIFszMDAwMCwgJ0NhdGVnb3JpemVkIFBlb3BsZSBMaXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUxLm1kJ10sXG4gICAgWzMwMDAxLCAnQ2F0ZWdvcml6ZWQgQm9va21hcmsgTGlzdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81MS5tZCddLFxuICAgIFszMDAwOCwgJ1Byb2ZpbGUgQmFkZ2VzJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU4Lm1kJ10sXG4gICAgWzMwMDA5LCAnQmFkZ2UgRGVmaW5pdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81OC5tZCddLFxuICAgIFszMDAxNywgJ0NyZWF0ZSBvciB1cGRhdGUgYSBzdGFsbCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8xNS5tZCddLFxuICAgIFszMDAxOCwgJ0NyZWF0ZSBvciB1cGRhdGUgYSBwcm9kdWN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzE1Lm1kJ10sXG4gICAgWzMwMDIzLCAnTG9uZy1Gb3JtIENvbnRlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjMubWQnXSxcbiAgICBbMzAwMjQsICdEcmFmdCBMb25nLWZvcm0gQ29udGVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yMy5tZCddLFxuICAgIFszMDA3OCwgJ0FwcGxpY2F0aW9uLXNwZWNpZmljIERhdGEnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNzgubWQnXSxcbiAgICBbMzAzMTEsICdMaXZlIEV2ZW50JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUzLm1kJ10sXG4gICAgWzMwMzE1LCAnVXNlciBTdGF0dXNlcycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8zOC5tZCddLFxuICAgIFszMDQwMiwgJ0NsYXNzaWZpZWQgTGlzdGluZycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci85OS5tZCddLFxuICAgIFszMDQwMywgJ0RyYWZ0IENsYXNzaWZpZWQgTGlzdGluZycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci85OS5tZCddLFxuICAgIFszMTkyMiwgJ0RhdGUtQmFzZWQgQ2FsZW5kYXIgRXZlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTIubWQnXSxcbiAgICBbMzE5MjMsICdUaW1lLUJhc2VkIENhbGVuZGFyIEV2ZW50JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUyLm1kJ10sXG4gICAgWzMxOTI0LCAnQ2FsZW5kYXInLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTIubWQnXSxcbiAgICBbMzE5MjUsICdDYWxlbmRhciBFdmVudCBSU1ZQJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUyLm1kJ10sXG4gICAgWzMxOTg5LCAnSGFuZGxlciByZWNvbW1lbmRhdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci84OS5tZCddLFxuICAgIFszMTk5MCwgJ0hhbmRsZXIgaW5mb3JtYXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvODkubWQnXSxcbiAgICBbMzQ1NTAsICdDb21tdW5pdHkgRGVmaW5pdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83Mi5tZCddLFxuXTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgYXdhaXQgZ2V0T3JTZXREZWZhdWx0KCdwcm9maWxlSW5kZXgnLCAwKTtcbiAgICBhd2FpdCBnZXRPclNldERlZmF1bHQoJ3Byb2ZpbGVzJywgW2F3YWl0IGdlbmVyYXRlUHJvZmlsZSgpXSk7XG4gICAgbGV0IHZlcnNpb24gPSAoYXdhaXQgc3RvcmFnZS5nZXQoeyB2ZXJzaW9uOiAwIH0pKS52ZXJzaW9uO1xuICAgIGNvbnNvbGUubG9nKCdEQiB2ZXJzaW9uOiAnLCB2ZXJzaW9uKTtcbiAgICB3aGlsZSAodmVyc2lvbiA8IERCX1ZFUlNJT04pIHtcbiAgICAgICAgdmVyc2lvbiA9IGF3YWl0IG1pZ3JhdGUodmVyc2lvbiwgREJfVkVSU0lPTik7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgdmVyc2lvbiB9KTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIG1pZ3JhdGUodmVyc2lvbiwgZ29hbCkge1xuICAgIGlmICh2ZXJzaW9uID09PSAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiAxLicpO1xuICAgICAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICBwcm9maWxlcy5mb3JFYWNoKHByb2ZpbGUgPT4gKHByb2ZpbGUuaG9zdHMgPSB7fSkpO1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xuICAgICAgICByZXR1cm4gdmVyc2lvbiArIDE7XG4gICAgfVxuXG4gICAgaWYgKHZlcnNpb24gPT09IDEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ21pZ3JhdGluZyB0byB2ZXJzaW9uIDIuJyk7XG4gICAgICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gMikge1xuICAgICAgICBjb25zb2xlLmxvZygnTWlncmF0aW5nIHRvIHZlcnNpb24gMy4nKTtcbiAgICAgICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICAgICAgcHJvZmlsZXMuZm9yRWFjaChwcm9maWxlID0+IChwcm9maWxlLnJlbGF5UmVtaW5kZXIgPSB0cnVlKSk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gMykge1xuICAgICAgICBjb25zb2xlLmxvZygnTWlncmF0aW5nIHRvIHZlcnNpb24gNCAoZW5jcnlwdGlvbiBzdXBwb3J0KS4nKTtcbiAgICAgICAgLy8gTm8gZGF0YSB0cmFuc2Zvcm1hdGlvbiBuZWVkZWQgXHUyMDE0IGV4aXN0aW5nIHBsYWludGV4dCBrZXlzIHN0YXkgYXMtaXMuXG4gICAgICAgIC8vIEVuY3J5cHRpb24gb25seSBhY3RpdmF0ZXMgd2hlbiB0aGUgdXNlciBzZXRzIGEgbWFzdGVyIHBhc3N3b3JkLlxuICAgICAgICAvLyBXZSBqdXN0IGVuc3VyZSB0aGUgaXNFbmNyeXB0ZWQgZmxhZyBleGlzdHMgYW5kIGRlZmF1bHRzIHRvIGZhbHNlLlxuICAgICAgICBsZXQgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgaXNFbmNyeXB0ZWQ6IGZhbHNlIH0pO1xuICAgICAgICBpZiAoIWRhdGEuaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgaXNFbmNyeXB0ZWQ6IGZhbHNlIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gNCkge1xuICAgICAgICBjb25zb2xlLmxvZygnTWlncmF0aW5nIHRvIHZlcnNpb24gNSAoTklQLTQ2IGJ1bmtlciBzdXBwb3J0KS4nKTtcbiAgICAgICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICAgICAgcHJvZmlsZXMuZm9yRWFjaChwcm9maWxlID0+IHtcbiAgICAgICAgICAgIGlmICghcHJvZmlsZS50eXBlKSBwcm9maWxlLnR5cGUgPSAnbG9jYWwnO1xuICAgICAgICAgICAgaWYgKHByb2ZpbGUuYnVua2VyVXJsID09PSB1bmRlZmluZWQpIHByb2ZpbGUuYnVua2VyVXJsID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChwcm9maWxlLnJlbW90ZVB1YmtleSA9PT0gdW5kZWZpbmVkKSBwcm9maWxlLnJlbW90ZVB1YmtleSA9IG51bGw7XG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xuICAgICAgICByZXR1cm4gdmVyc2lvbiArIDE7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZXMoKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBwcm9maWxlczogW10gfSk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLnByb2ZpbGVzO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZShpbmRleCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcmV0dXJuIHByb2ZpbGVzW2luZGV4XTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFByb2ZpbGVOYW1lcygpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIHJldHVybiBwcm9maWxlcy5tYXAocCA9PiBwLm5hbWUpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZUluZGV4KCkge1xuICAgIGNvbnN0IGluZGV4ID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBwcm9maWxlSW5kZXg6IDAgfSk7XG4gICAgcmV0dXJuIGluZGV4LnByb2ZpbGVJbmRleDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFByb2ZpbGVJbmRleChwcm9maWxlSW5kZXgpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVJbmRleCB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVByb2ZpbGUoaW5kZXgpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGxldCBwcm9maWxlSW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBwcm9maWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIGlmIChwcm9maWxlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICBhd2FpdCBjbGVhckRhdGEoKTsgLy8gSWYgd2UgaGF2ZSBkZWxldGVkIGFsbCBvZiB0aGUgcHJvZmlsZXMsIGxldCdzIGp1c3Qgc3RhcnQgZnJlc2ggd2l0aCBhbGwgbmV3IGRhdGFcbiAgICAgICAgYXdhaXQgaW5pdGlhbGl6ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIHRoZSBpbmRleCBkZWxldGVkIHdhcyB0aGUgYWN0aXZlIHByb2ZpbGUsIGNoYW5nZSB0aGUgYWN0aXZlIHByb2ZpbGUgdG8gdGhlIG5leHQgb25lXG4gICAgICAgIGxldCBuZXdJbmRleCA9XG4gICAgICAgICAgICBwcm9maWxlSW5kZXggPT09IGluZGV4ID8gTWF0aC5tYXgoaW5kZXggLSAxLCAwKSA6IHByb2ZpbGVJbmRleDtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcywgcHJvZmlsZUluZGV4OiBuZXdJbmRleCB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckRhdGEoKSB7XG4gICAgbGV0IGlnbm9yZUluc3RhbGxIb29rID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpZ25vcmVJbnN0YWxsSG9vazogZmFsc2UgfSk7XG4gICAgYXdhaXQgc3RvcmFnZS5jbGVhcigpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KGlnbm9yZUluc3RhbGxIb29rKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVQcml2YXRlS2V5KCkge1xuICAgIHJldHVybiBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdnZW5lcmF0ZVByaXZhdGVLZXknIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVQcm9maWxlKG5hbWUgPSAnRGVmYXVsdCBOb3N0ciBQcm9maWxlJywgdHlwZSA9ICdsb2NhbCcpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBuYW1lLFxuICAgICAgICBwcml2S2V5OiB0eXBlID09PSAnbG9jYWwnID8gYXdhaXQgZ2VuZXJhdGVQcml2YXRlS2V5KCkgOiAnJyxcbiAgICAgICAgaG9zdHM6IHt9LFxuICAgICAgICByZWxheXM6IFJFQ09NTUVOREVEX1JFTEFZUy5tYXAociA9PiAoeyB1cmw6IHIuaHJlZiwgcmVhZDogdHJ1ZSwgd3JpdGU6IHRydWUgfSkpLFxuICAgICAgICByZWxheVJlbWluZGVyOiBmYWxzZSxcbiAgICAgICAgdHlwZSxcbiAgICAgICAgYnVua2VyVXJsOiBudWxsLFxuICAgICAgICByZW1vdGVQdWJrZXk6IG51bGwsXG4gICAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0T3JTZXREZWZhdWx0KGtleSwgZGVmKSB7XG4gICAgbGV0IHZhbCA9IChhd2FpdCBzdG9yYWdlLmdldChrZXkpKVtrZXldO1xuICAgIGlmICh2YWwgPT0gbnVsbCB8fCB2YWwgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW2tleV06IGRlZiB9KTtcbiAgICAgICAgcmV0dXJuIGRlZjtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVByb2ZpbGVOYW1lKGluZGV4LCBwcm9maWxlTmFtZSkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcHJvZmlsZXNbaW5kZXhdLm5hbWUgPSBwcm9maWxlTmFtZTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVByaXZhdGVLZXkoaW5kZXgsIHByaXZhdGVLZXkpIHtcbiAgICBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIGtpbmQ6ICdzYXZlUHJpdmF0ZUtleScsXG4gICAgICAgIHBheWxvYWQ6IFtpbmRleCwgcHJpdmF0ZUtleV0sXG4gICAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBuZXdQcm9maWxlKCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgY29uc3QgbmV3UHJvZmlsZSA9IGF3YWl0IGdlbmVyYXRlUHJvZmlsZSgnTmV3IFByb2ZpbGUnKTtcbiAgICBwcm9maWxlcy5wdXNoKG5ld1Byb2ZpbGUpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLmxlbmd0aCAtIDE7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBuZXdCdW5rZXJQcm9maWxlKG5hbWUgPSAnTmV3IEJ1bmtlcicsIGJ1bmtlclVybCA9IG51bGwpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBnZW5lcmF0ZVByb2ZpbGUobmFtZSwgJ2J1bmtlcicpO1xuICAgIHByb2ZpbGUuYnVua2VyVXJsID0gYnVua2VyVXJsO1xuICAgIHByb2ZpbGVzLnB1c2gocHJvZmlsZSk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICByZXR1cm4gcHJvZmlsZXMubGVuZ3RoIC0gMTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFJlbGF5cyhwcm9maWxlSW5kZXgpIHtcbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUocHJvZmlsZUluZGV4KTtcbiAgICByZXR1cm4gcHJvZmlsZS5yZWxheXMgfHwgW107XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUmVsYXlzKHByb2ZpbGVJbmRleCwgcmVsYXlzKSB7XG4gICAgLy8gSGF2aW5nIGFuIEFscGluZSBwcm94eSBvYmplY3QgYXMgYSBzdWItb2JqZWN0IGRvZXMgbm90IHNlcmlhbGl6ZSBjb3JyZWN0bHkgaW4gc3RvcmFnZSxcbiAgICAvLyBzbyB3ZSBhcmUgcHJlLXNlcmlhbGl6aW5nIGhlcmUgYmVmb3JlIGFzc2lnbmluZyBpdCB0byB0aGUgcHJvZmlsZSwgc28gdGhlIHByb3h5XG4gICAgLy8gb2JqIGRvZXNuJ3QgYnVnIG91dC5cbiAgICBsZXQgZml4ZWRSZWxheXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHJlbGF5cykpO1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgbGV0IHByb2ZpbGUgPSBwcm9maWxlc1twcm9maWxlSW5kZXhdO1xuICAgIHByb2ZpbGUucmVsYXlzID0gZml4ZWRSZWxheXM7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldChpdGVtKSB7XG4gICAgcmV0dXJuIChhd2FpdCBzdG9yYWdlLmdldChpdGVtKSlbaXRlbV07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZXJtaXNzaW9ucyhpbmRleCA9IG51bGwpIHtcbiAgICBpZiAoaW5kZXggPT0gbnVsbCkge1xuICAgICAgICBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIH1cbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUoaW5kZXgpO1xuICAgIGxldCBob3N0cyA9IGF3YWl0IHByb2ZpbGUuaG9zdHM7XG4gICAgcmV0dXJuIGhvc3RzO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGVybWlzc2lvbihob3N0LCBhY3Rpb24pIHtcbiAgICBsZXQgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUoaW5kZXgpO1xuICAgIHJldHVybiBwcm9maWxlLmhvc3RzPy5baG9zdF0/LlthY3Rpb25dIHx8ICdhc2snO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UGVybWlzc2lvbihob3N0LCBhY3Rpb24sIHBlcm0sIGluZGV4ID0gbnVsbCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgaWYgKCFpbmRleCkge1xuICAgICAgICBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIH1cbiAgICBsZXQgcHJvZmlsZSA9IHByb2ZpbGVzW2luZGV4XTtcbiAgICBsZXQgbmV3UGVybXMgPSBwcm9maWxlLmhvc3RzW2hvc3RdIHx8IHt9O1xuICAgIG5ld1Blcm1zID0geyAuLi5uZXdQZXJtcywgW2FjdGlvbl06IHBlcm0gfTtcbiAgICBwcm9maWxlLmhvc3RzW2hvc3RdID0gbmV3UGVybXM7XG4gICAgcHJvZmlsZXNbaW5kZXhdID0gcHJvZmlsZTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHVtYW5QZXJtaXNzaW9uKHApIHtcbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlIHdoZXJlIGV2ZW50IHNpZ25pbmcgaW5jbHVkZXMgYSBraW5kIG51bWJlclxuICAgIGlmIChwLnN0YXJ0c1dpdGgoJ3NpZ25FdmVudDonKSkge1xuICAgICAgICBsZXQgW2UsIG5dID0gcC5zcGxpdCgnOicpO1xuICAgICAgICBuID0gcGFyc2VJbnQobik7XG4gICAgICAgIGxldCBubmFtZSA9IEtJTkRTLmZpbmQoayA9PiBrWzBdID09PSBuKT8uWzFdIHx8IGBVbmtub3duIChLaW5kICR7bn0pYDtcbiAgICAgICAgcmV0dXJuIGBTaWduIGV2ZW50OiAke25uYW1lfWA7XG4gICAgfVxuXG4gICAgc3dpdGNoIChwKSB7XG4gICAgICAgIGNhc2UgJ2dldFB1YktleSc6XG4gICAgICAgICAgICByZXR1cm4gJ1JlYWQgcHVibGljIGtleSc7XG4gICAgICAgIGNhc2UgJ3NpZ25FdmVudCc6XG4gICAgICAgICAgICByZXR1cm4gJ1NpZ24gZXZlbnQnO1xuICAgICAgICBjYXNlICdnZXRSZWxheXMnOlxuICAgICAgICAgICAgcmV0dXJuICdSZWFkIHJlbGF5IGxpc3QnO1xuICAgICAgICBjYXNlICduaXAwNC5lbmNyeXB0JzpcbiAgICAgICAgICAgIHJldHVybiAnRW5jcnlwdCBwcml2YXRlIG1lc3NhZ2UgKE5JUC0wNCknO1xuICAgICAgICBjYXNlICduaXAwNC5kZWNyeXB0JzpcbiAgICAgICAgICAgIHJldHVybiAnRGVjcnlwdCBwcml2YXRlIG1lc3NhZ2UgKE5JUC0wNCknO1xuICAgICAgICBjYXNlICduaXA0NC5lbmNyeXB0JzpcbiAgICAgICAgICAgIHJldHVybiAnRW5jcnlwdCBwcml2YXRlIG1lc3NhZ2UgKE5JUC00NCknO1xuICAgICAgICBjYXNlICduaXA0NC5kZWNyeXB0JzpcbiAgICAgICAgICAgIHJldHVybiAnRGVjcnlwdCBwcml2YXRlIG1lc3NhZ2UgKE5JUC00NCknO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICdVbmtub3duJztcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUtleShrZXkpIHtcbiAgICBjb25zdCBoZXhNYXRjaCA9IC9eW1xcZGEtZl17NjR9JC9pLnRlc3Qoa2V5KTtcbiAgICBjb25zdCBiMzJNYXRjaCA9IC9ebnNlYzFbcXB6cnk5eDhnZjJ0dmR3MHMzam41NGtoY2U2bXVhN2xdezU4fSQvLnRlc3Qoa2V5KTtcblxuICAgIHJldHVybiBoZXhNYXRjaCB8fCBiMzJNYXRjaCB8fCBpc05jcnlwdHNlYyhrZXkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOY3J5cHRzZWMoa2V5KSB7XG4gICAgcmV0dXJuIC9ebmNyeXB0c2VjMVtxcHpyeTl4OGdmMnR2ZHcwczNqbjU0a2hjZTZtdWE3bF0rJC8udGVzdChrZXkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmVhdHVyZShuYW1lKSB7XG4gICAgbGV0IGZuYW1lID0gYGZlYXR1cmU6JHtuYW1lfWA7XG4gICAgbGV0IGYgPSBhd2FpdCBhcGkuc3RvcmFnZS5sb2NhbC5nZXQoeyBbZm5hbWVdOiBmYWxzZSB9KTtcbiAgICByZXR1cm4gZltmbmFtZV07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWxheVJlbWluZGVyKCkge1xuICAgIGxldCBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIGxldCBwcm9maWxlID0gYXdhaXQgZ2V0UHJvZmlsZShpbmRleCk7XG4gICAgcmV0dXJuIHByb2ZpbGUucmVsYXlSZW1pbmRlcjtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRvZ2dsZVJlbGF5UmVtaW5kZXIoKSB7XG4gICAgbGV0IGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBwcm9maWxlc1tpbmRleF0ucmVsYXlSZW1pbmRlciA9IGZhbHNlO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXROcHViKCkge1xuICAgIGxldCBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIHJldHVybiBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIGtpbmQ6ICdnZXROcHViJyxcbiAgICAgICAgcGF5bG9hZDogaW5kZXgsXG4gICAgfSk7XG59XG5cbi8vIC0tLSBNYXN0ZXIgcGFzc3dvcmQgZW5jcnlwdGlvbiBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIG1hc3RlciBwYXNzd29yZCBlbmNyeXB0aW9uIGlzIGFjdGl2ZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzRW5jcnlwdGVkKCkge1xuICAgIGxldCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgcmV0dXJuIGRhdGEuaXNFbmNyeXB0ZWQ7XG59XG5cbi8qKlxuICogU3RvcmUgdGhlIHBhc3N3b3JkIHZlcmlmaWNhdGlvbiBoYXNoIChuZXZlciB0aGUgcGFzc3dvcmQgaXRzZWxmKS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFBhc3N3b3JkSGFzaChwYXNzd29yZCkge1xuICAgIGNvbnN0IHsgaGFzaCwgc2FsdCB9ID0gYXdhaXQgaGFzaFBhc3N3b3JkKHBhc3N3b3JkKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7XG4gICAgICAgIHBhc3N3b3JkSGFzaDogaGFzaCxcbiAgICAgICAgcGFzc3dvcmRTYWx0OiBzYWx0LFxuICAgICAgICBpc0VuY3J5cHRlZDogdHJ1ZSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBWZXJpZnkgYSBwYXNzd29yZCBhZ2FpbnN0IHRoZSBzdG9yZWQgaGFzaC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrUGFzc3dvcmQocGFzc3dvcmQpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoe1xuICAgICAgICBwYXNzd29yZEhhc2g6IG51bGwsXG4gICAgICAgIHBhc3N3b3JkU2FsdDogbnVsbCxcbiAgICB9KTtcbiAgICBpZiAoIWRhdGEucGFzc3dvcmRIYXNoIHx8ICFkYXRhLnBhc3N3b3JkU2FsdCkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB2ZXJpZnlQYXNzd29yZChwYXNzd29yZCwgZGF0YS5wYXNzd29yZEhhc2gsIGRhdGEucGFzc3dvcmRTYWx0KTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgbWFzdGVyIHBhc3N3b3JkIHByb3RlY3Rpb24gXHUyMDE0IGNsZWFycyBoYXNoIGFuZCBkZWNyeXB0cyBhbGwga2V5cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZVBhc3N3b3JkUHJvdGVjdGlvbihwYXNzd29yZCkge1xuICAgIGNvbnN0IHZhbGlkID0gYXdhaXQgY2hlY2tQYXNzd29yZChwYXNzd29yZCk7XG4gICAgaWYgKCF2YWxpZCkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHBhc3N3b3JkJyk7XG5cbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb2ZpbGVzW2ldLnR5cGUgPT09ICdidW5rZXInKSBjb250aW51ZTtcbiAgICAgICAgaWYgKGlzRW5jcnlwdGVkQmxvYihwcm9maWxlc1tpXS5wcml2S2V5KSkge1xuICAgICAgICAgICAgcHJvZmlsZXNbaV0ucHJpdktleSA9IGF3YWl0IGRlY3J5cHQocHJvZmlsZXNbaV0ucHJpdktleSwgcGFzc3dvcmQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHtcbiAgICAgICAgcHJvZmlsZXMsXG4gICAgICAgIGlzRW5jcnlwdGVkOiBmYWxzZSxcbiAgICAgICAgcGFzc3dvcmRIYXNoOiBudWxsLFxuICAgICAgICBwYXNzd29yZFNhbHQ6IG51bGwsXG4gICAgfSk7XG59XG5cbi8qKlxuICogRW5jcnlwdCBhbGwgcHJvZmlsZSBwcml2YXRlIGtleXMgd2l0aCBhIG1hc3RlciBwYXNzd29yZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHRBbGxLZXlzKHBhc3N3b3JkKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb2ZpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9maWxlc1tpXS50eXBlID09PSAnYnVua2VyJykgY29udGludWU7XG4gICAgICAgIGlmICghaXNFbmNyeXB0ZWRCbG9iKHByb2ZpbGVzW2ldLnByaXZLZXkpKSB7XG4gICAgICAgICAgICBwcm9maWxlc1tpXS5wcml2S2V5ID0gYXdhaXQgZW5jcnlwdChwcm9maWxlc1tpXS5wcml2S2V5LCBwYXNzd29yZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXdhaXQgc2V0UGFzc3dvcmRIYXNoKHBhc3N3b3JkKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xufVxuXG4vKipcbiAqIFJlLWVuY3J5cHQgYWxsIGtleXMgd2l0aCBhIG5ldyBwYXNzd29yZCAocmVxdWlyZXMgdGhlIG9sZCBwYXNzd29yZCkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGFuZ2VQYXNzd29yZEZvcktleXMob2xkUGFzc3dvcmQsIG5ld1Bhc3N3b3JkKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb2ZpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9maWxlc1tpXS50eXBlID09PSAnYnVua2VyJykgY29udGludWU7XG4gICAgICAgIGxldCBoZXggPSBwcm9maWxlc1tpXS5wcml2S2V5O1xuICAgICAgICBpZiAoaXNFbmNyeXB0ZWRCbG9iKGhleCkpIHtcbiAgICAgICAgICAgIGhleCA9IGF3YWl0IGRlY3J5cHQoaGV4LCBvbGRQYXNzd29yZCk7XG4gICAgICAgIH1cbiAgICAgICAgcHJvZmlsZXNbaV0ucHJpdktleSA9IGF3YWl0IGVuY3J5cHQoaGV4LCBuZXdQYXNzd29yZCk7XG4gICAgfVxuICAgIGNvbnN0IHsgaGFzaCwgc2FsdCB9ID0gYXdhaXQgaGFzaFBhc3N3b3JkKG5ld1Bhc3N3b3JkKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7XG4gICAgICAgIHByb2ZpbGVzLFxuICAgICAgICBwYXNzd29yZEhhc2g6IGhhc2gsXG4gICAgICAgIHBhc3N3b3JkU2FsdDogc2FsdCxcbiAgICAgICAgaXNFbmNyeXB0ZWQ6IHRydWUsXG4gICAgfSk7XG59XG5cbi8qKlxuICogRGVjcnlwdCBhIHNpbmdsZSBwcm9maWxlJ3MgcHJpdmF0ZSBrZXksIHJldHVybmluZyB0aGUgaGV4IHN0cmluZy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERlY3J5cHRlZFByaXZLZXkocHJvZmlsZSwgcGFzc3dvcmQpIHtcbiAgICBpZiAocHJvZmlsZS50eXBlID09PSAnYnVua2VyJykgcmV0dXJuICcnO1xuICAgIGlmIChpc0VuY3J5cHRlZEJsb2IocHJvZmlsZS5wcml2S2V5KSkge1xuICAgICAgICByZXR1cm4gZGVjcnlwdChwcm9maWxlLnByaXZLZXksIHBhc3N3b3JkKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb2ZpbGUucHJpdktleTtcbn1cblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGEgc3RvcmVkIHZhbHVlIGxvb2tzIGxpa2UgYW4gZW5jcnlwdGVkIGJsb2IuXG4gKiBFbmNyeXB0ZWQgYmxvYnMgYXJlIEpTT04gc3RyaW5ncyBjb250YWluaW5nIHtzYWx0LCBpdiwgY2lwaGVydGV4dH0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VuY3J5cHRlZEJsb2IodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICByZXR1cm4gISEocGFyc2VkLnNhbHQgJiYgcGFyc2VkLml2ICYmIHBhcnNlZC5jaXBoZXJ0ZXh0KTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiIsICIvKipcbiAqIE5vc3RyS2V5IFBvcHVwIC0gVmFuaWxsYSBKUyAoQ1NQLXNhZmUpXG4gKi9cblxuaW1wb3J0IHtcbiAgICBnZXRQcm9maWxlTmFtZXMsXG4gICAgc2V0UHJvZmlsZUluZGV4LFxuICAgIGdldFByb2ZpbGVJbmRleCxcbiAgICBnZXRSZWxheXMsXG4gICAgUkVDT01NRU5ERURfUkVMQVlTLFxuICAgIHNhdmVSZWxheXMsXG4gICAgaW5pdGlhbGl6ZSxcbiAgICByZWxheVJlbWluZGVyLFxuICAgIHRvZ2dsZVJlbGF5UmVtaW5kZXIsXG4gICAgZ2V0TnB1Yixcbn0gZnJvbSAnLi91dGlsaXRpZXMvdXRpbHMnO1xuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgUVJDb2RlIGZyb20gJ3FyY29kZSc7XG5cbi8vIFN0YXRlXG5sZXQgc3RhdGUgPSB7XG4gICAgcHJvZmlsZU5hbWVzOiBbJ0RlZmF1bHQgTm9zdHIgUHJvZmlsZSddLFxuICAgIHByb2ZpbGVJbmRleDogMCxcbiAgICByZWxheUNvdW50OiAwLFxuICAgIHNob3dSZWxheVJlbWluZGVyOiB0cnVlLFxuICAgIGlzTG9ja2VkOiBmYWxzZSxcbiAgICBoYXNQYXNzd29yZDogZmFsc2UsXG4gICAgbnB1YlFyRGF0YVVybDogJycsXG4gICAgcHJvZmlsZVR5cGU6ICdsb2NhbCcsXG4gICAgYnVua2VyQ29ubmVjdGVkOiBmYWxzZSxcbn07XG5cbi8vIERPTSBFbGVtZW50c1xuY29uc3QgZWxlbWVudHMgPSB7fTtcblxuZnVuY3Rpb24gJChpZCkge1xuICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG59XG5cbmZ1bmN0aW9uIGluaXRFbGVtZW50cygpIHtcbiAgICBlbGVtZW50cy5sb2NrZWRWaWV3ID0gJCgnbG9ja2VkLXZpZXcnKTtcbiAgICBlbGVtZW50cy51bmxvY2tlZFZpZXcgPSAkKCd1bmxvY2tlZC12aWV3Jyk7XG4gICAgZWxlbWVudHMudW5sb2NrRm9ybSA9ICQoJ3VubG9jay1mb3JtJyk7XG4gICAgZWxlbWVudHMudW5sb2NrUGFzc3dvcmQgPSAkKCd1bmxvY2stcGFzc3dvcmQnKTtcbiAgICBlbGVtZW50cy51bmxvY2tFcnJvciA9ICQoJ3VubG9jay1lcnJvcicpO1xuICAgIGVsZW1lbnRzLmxvY2tCdG4gPSAkKCdsb2NrLWJ0bicpO1xuICAgIGVsZW1lbnRzLnByb2ZpbGVTZWxlY3QgPSAkKCdwcm9maWxlLXNlbGVjdCcpO1xuICAgIGVsZW1lbnRzLmNvcHlOcHViQnRuID0gJCgnY29weS1ucHViLWJ0bicpO1xuICAgIGVsZW1lbnRzLnFyQ29udGFpbmVyID0gJCgncXItY29udGFpbmVyJyk7XG4gICAgZWxlbWVudHMucXJJbWFnZSA9ICQoJ3FyLWltYWdlJyk7XG4gICAgZWxlbWVudHMuYnVua2VyU3RhdHVzID0gJCgnYnVua2VyLXN0YXR1cycpO1xuICAgIGVsZW1lbnRzLmJ1bmtlckluZGljYXRvciA9ICQoJ2J1bmtlci1pbmRpY2F0b3InKTtcbiAgICBlbGVtZW50cy5idW5rZXJUZXh0ID0gJCgnYnVua2VyLXRleHQnKTtcbiAgICBlbGVtZW50cy5yZWxheVJlbWluZGVyID0gJCgncmVsYXktcmVtaW5kZXInKTtcbiAgICBlbGVtZW50cy5hZGRSZWxheXNCdG4gPSAkKCdhZGQtcmVsYXlzLWJ0bicpO1xuICAgIGVsZW1lbnRzLm5vVGhhbmtzQnRuID0gJCgnbm8tdGhhbmtzLWJ0bicpO1xuICAgIGVsZW1lbnRzLnNldHRpbmdzQnRuID0gJCgnc2V0dGluZ3MtYnRuJyk7XG4gICAgZWxlbWVudHMubG9ja2VkU2V0dGluZ3NCdG4gPSAkKCdsb2NrZWQtc2V0dGluZ3MtYnRuJyk7XG59XG5cbi8vIFJlbmRlciBmdW5jdGlvbnNcbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICBpZiAoc3RhdGUuaXNMb2NrZWQpIHtcbiAgICAgICAgZWxlbWVudHMubG9ja2VkVmlldy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICAgICAgZWxlbWVudHMudW5sb2NrZWRWaWV3LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnRzLmxvY2tlZFZpZXcuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gICAgICAgIGVsZW1lbnRzLnVubG9ja2VkVmlldy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICAgICAgcmVuZGVyVW5sb2NrZWRTdGF0ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyVW5sb2NrZWRTdGF0ZSgpIHtcbiAgICAvLyBMb2NrIGJ1dHRvbiB2aXNpYmlsaXR5XG4gICAgaWYgKHN0YXRlLmhhc1Bhc3N3b3JkKSB7XG4gICAgICAgIGVsZW1lbnRzLmxvY2tCdG4uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbWVudHMubG9ja0J0bi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbiAgICB9XG5cbiAgICAvLyBQcm9maWxlIGRyb3Bkb3duXG4gICAgZWxlbWVudHMucHJvZmlsZVNlbGVjdC5pbm5lckhUTUwgPSBzdGF0ZS5wcm9maWxlTmFtZXNcbiAgICAgICAgLm1hcCgobmFtZSwgaSkgPT4gYDxvcHRpb24gdmFsdWU9XCIke2l9XCIke2kgPT09IHN0YXRlLnByb2ZpbGVJbmRleCA/ICcgc2VsZWN0ZWQnIDogJyd9PiR7bmFtZX08L29wdGlvbj5gKVxuICAgICAgICAuam9pbignJyk7XG5cbiAgICAvLyBRUiBjb2RlXG4gICAgaWYgKHN0YXRlLm5wdWJRckRhdGFVcmwpIHtcbiAgICAgICAgZWxlbWVudHMucXJJbWFnZS5zcmMgPSBzdGF0ZS5ucHViUXJEYXRhVXJsO1xuICAgICAgICBlbGVtZW50cy5xckNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50cy5xckNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbiAgICB9XG5cbiAgICAvLyBCdW5rZXIgc3RhdHVzXG4gICAgaWYgKHN0YXRlLnByb2ZpbGVUeXBlID09PSAnYnVua2VyJykge1xuICAgICAgICBlbGVtZW50cy5idW5rZXJTdGF0dXMuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gICAgICAgIGVsZW1lbnRzLmJ1bmtlckluZGljYXRvci5jbGFzc05hbWUgPSBgaW5saW5lLWJsb2NrIHctMiBoLTIgcm91bmRlZC1mdWxsICR7c3RhdGUuYnVua2VyQ29ubmVjdGVkID8gJ2JnLWdyZWVuLTUwMCcgOiAnYmctcmVkLTUwMCd9YDtcbiAgICAgICAgZWxlbWVudHMuYnVua2VyVGV4dC50ZXh0Q29udGVudCA9IHN0YXRlLmJ1bmtlckNvbm5lY3RlZCA/ICdCdW5rZXIgY29ubmVjdGVkJyA6ICdCdW5rZXIgZGlzY29ubmVjdGVkJztcbiAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50cy5idW5rZXJTdGF0dXMuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gICAgfVxuXG4gICAgLy8gUmVsYXkgcmVtaW5kZXJcbiAgICBpZiAoc3RhdGUucmVsYXlDb3VudCA8IDEgJiYgc3RhdGUuc2hvd1JlbGF5UmVtaW5kZXIpIHtcbiAgICAgICAgZWxlbWVudHMucmVsYXlSZW1pbmRlci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50cy5yZWxheVJlbWluZGVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgIH1cbn1cblxuLy8gQWN0aW9uc1xuYXN5bmMgZnVuY3Rpb24gbG9hZFVubG9ja2VkU3RhdGUoKSB7XG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAncmVzZXRBdXRvTG9jaycgfSk7XG4gICAgYXdhaXQgbG9hZE5hbWVzKCk7XG4gICAgYXdhaXQgbG9hZFByb2ZpbGVJbmRleCgpO1xuICAgIGF3YWl0IGxvYWRQcm9maWxlVHlwZSgpO1xuICAgIGF3YWl0IGNvdW50UmVsYXlzKCk7XG4gICAgYXdhaXQgY2hlY2tSZWxheVJlbWluZGVyKCk7XG4gICAgYXdhaXQgZ2VuZXJhdGVRcigpO1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkTmFtZXMoKSB7XG4gICAgc3RhdGUucHJvZmlsZU5hbWVzID0gYXdhaXQgZ2V0UHJvZmlsZU5hbWVzKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRQcm9maWxlSW5kZXgoKSB7XG4gICAgc3RhdGUucHJvZmlsZUluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRQcm9maWxlVHlwZSgpIHtcbiAgICBzdGF0ZS5wcm9maWxlVHlwZSA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2dldFByb2ZpbGVUeXBlJyB9KTtcbiAgICBpZiAoc3RhdGUucHJvZmlsZVR5cGUgPT09ICdidW5rZXInKSB7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2J1bmtlci5zdGF0dXMnIH0pO1xuICAgICAgICBzdGF0ZS5idW5rZXJDb25uZWN0ZWQgPSBzdGF0dXM/LmNvbm5lY3RlZCB8fCBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0ZS5idW5rZXJDb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvdW50UmVsYXlzKCkge1xuICAgIGNvbnN0IHJlbGF5cyA9IGF3YWl0IGdldFJlbGF5cyhzdGF0ZS5wcm9maWxlSW5kZXgpO1xuICAgIHN0YXRlLnJlbGF5Q291bnQgPSByZWxheXMubGVuZ3RoO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjaGVja1JlbGF5UmVtaW5kZXIoKSB7XG4gICAgc3RhdGUuc2hvd1JlbGF5UmVtaW5kZXIgPSBhd2FpdCByZWxheVJlbWluZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlUXIoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbnB1YiA9IGF3YWl0IGdldE5wdWIoKTtcbiAgICAgICAgaWYgKCFucHViKSB7XG4gICAgICAgICAgICBzdGF0ZS5ucHViUXJEYXRhVXJsID0gJyc7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUubnB1YlFyRGF0YVVybCA9IGF3YWl0IFFSQ29kZS50b0RhdGFVUkwobnB1Yi50b1VwcGVyQ2FzZSgpLCB7XG4gICAgICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICAgICAgbWFyZ2luOiAyLFxuICAgICAgICAgICAgY29sb3I6IHsgZGFyazogJyNhNmUyMmUnLCBsaWdodDogJyMyNzI4MjInIH0sXG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICBzdGF0ZS5ucHViUXJEYXRhVXJsID0gJyc7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBkb1VubG9jaygpIHtcbiAgICBjb25zdCBwYXNzd29yZCA9IGVsZW1lbnRzLnVubG9ja1Bhc3N3b3JkLnZhbHVlO1xuICAgIGlmICghcGFzc3dvcmQpIHtcbiAgICAgICAgZWxlbWVudHMudW5sb2NrRXJyb3IudGV4dENvbnRlbnQgPSAnUGxlYXNlIGVudGVyIHlvdXIgbWFzdGVyIHBhc3N3b3JkLic7XG4gICAgICAgIGVsZW1lbnRzLnVubG9ja0Vycm9yLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAndW5sb2NrJywgcGF5bG9hZDogcGFzc3dvcmQgfSk7XG4gICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgIHN0YXRlLmlzTG9ja2VkID0gZmFsc2U7XG4gICAgICAgIGVsZW1lbnRzLnVubG9ja1Bhc3N3b3JkLnZhbHVlID0gJyc7XG4gICAgICAgIGVsZW1lbnRzLnVubG9ja0Vycm9yLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgICAgICBhd2FpdCBsb2FkVW5sb2NrZWRTdGF0ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnRzLnVubG9ja0Vycm9yLnRleHRDb250ZW50ID0gcmVzdWx0LmVycm9yIHx8ICdJbnZhbGlkIHBhc3N3b3JkLic7XG4gICAgICAgIGVsZW1lbnRzLnVubG9ja0Vycm9yLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZG9Mb2NrKCkge1xuICAgIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2xvY2snIH0pO1xuICAgIHN0YXRlLmlzTG9ja2VkID0gdHJ1ZTtcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlUHJvZmlsZUNoYW5nZSgpIHtcbiAgICBjb25zdCBuZXdJbmRleCA9IHBhcnNlSW50KGVsZW1lbnRzLnByb2ZpbGVTZWxlY3QudmFsdWUsIDEwKTtcbiAgICBpZiAobmV3SW5kZXggIT09IHN0YXRlLnByb2ZpbGVJbmRleCkge1xuICAgICAgICBzdGF0ZS5wcm9maWxlSW5kZXggPSBuZXdJbmRleDtcbiAgICAgICAgYXdhaXQgc2V0UHJvZmlsZUluZGV4KHN0YXRlLnByb2ZpbGVJbmRleCk7XG4gICAgICAgIGF3YWl0IGxvYWRQcm9maWxlVHlwZSgpO1xuICAgICAgICBhd2FpdCBjb3VudFJlbGF5cygpO1xuICAgICAgICBhd2FpdCBjaGVja1JlbGF5UmVtaW5kZXIoKTtcbiAgICAgICAgYXdhaXQgZ2VuZXJhdGVRcigpO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlOcHViKCkge1xuICAgIGNvbnN0IG5wdWIgPSBhd2FpdCBnZXROcHViKCk7XG4gICAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQ/LndyaXRlVGV4dCkge1xuICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChucHViKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdjb3B5JywgcGF5bG9hZDogbnB1YiB9KTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFkZFJlbGF5cygpIHtcbiAgICBjb25zdCByZWxheXMgPSBSRUNPTU1FTkRFRF9SRUxBWVMubWFwKHIgPT4gKHsgdXJsOiByLmhyZWYsIHJlYWQ6IHRydWUsIHdyaXRlOiB0cnVlIH0pKTtcbiAgICBhd2FpdCBzYXZlUmVsYXlzKHN0YXRlLnByb2ZpbGVJbmRleCwgcmVsYXlzKTtcbiAgICBhd2FpdCBjb3VudFJlbGF5cygpO1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBub1RoYW5rcygpIHtcbiAgICBhd2FpdCB0b2dnbGVSZWxheVJlbWluZGVyKCk7XG4gICAgc3RhdGUuc2hvd1JlbGF5UmVtaW5kZXIgPSBmYWxzZTtcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gb3Blbk9wdGlvbnMoKSB7XG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgd2luZG93LmNsb3NlKCk7XG59XG5cbi8vIEV2ZW50IGJpbmRpbmdzXG5mdW5jdGlvbiBiaW5kRXZlbnRzKCkge1xuICAgIGVsZW1lbnRzLnVubG9ja0Zvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgYXN5bmMgKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBhd2FpdCBkb1VubG9jaygpO1xuICAgIH0pO1xuXG4gICAgZWxlbWVudHMubG9ja0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRvTG9jayk7XG4gICAgZWxlbWVudHMucHJvZmlsZVNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBoYW5kbGVQcm9maWxlQ2hhbmdlKTtcbiAgICBlbGVtZW50cy5jb3B5TnB1YkJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNvcHlOcHViKTtcbiAgICBlbGVtZW50cy5hZGRSZWxheXNCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhZGRSZWxheXMpO1xuICAgIGVsZW1lbnRzLm5vVGhhbmtzQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbm9UaGFua3MpO1xuICAgIGVsZW1lbnRzLnNldHRpbmdzQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb3Blbk9wdGlvbnMpO1xuICAgIGVsZW1lbnRzLmxvY2tlZFNldHRpbmdzQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb3Blbk9wdGlvbnMpO1xufVxuXG4vLyBJbml0aWFsaXplXG5hc3luYyBmdW5jdGlvbiBpbml0KCkge1xuICAgIGNvbnNvbGUubG9nKCdOb3N0cktleSBQb3B1cCBpbml0aWFsaXppbmcuLi4nKTtcbiAgICBpbml0RWxlbWVudHMoKTtcbiAgICBiaW5kRXZlbnRzKCk7XG5cbiAgICBhd2FpdCBpbml0aWFsaXplKCk7XG5cbiAgICBzdGF0ZS5oYXNQYXNzd29yZCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2lzRW5jcnlwdGVkJyB9KTtcbiAgICBzdGF0ZS5pc0xvY2tlZCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2lzTG9ja2VkJyB9KTtcblxuICAgIGlmICghc3RhdGUuaXNMb2NrZWQpIHtcbiAgICAgICAgYXdhaXQgbG9hZFVubG9ja2VkU3RhdGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9XG59XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbml0KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBSUEsYUFBTyxVQUFVLFdBQVk7QUFDM0IsZUFBTyxPQUFPLFlBQVksY0FBYyxRQUFRLGFBQWEsUUFBUSxVQUFVO0FBQUEsTUFDakY7QUFBQTtBQUFBOzs7QUNOQTtBQUFBO0FBQUEsVUFBSTtBQUNKLFVBQU0sa0JBQWtCO0FBQUEsUUFDdEI7QUFBQTtBQUFBLFFBQ0E7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUMxQztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQzdDO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxRQUFNO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxRQUFNO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxRQUFNO0FBQUEsUUFDdEQ7QUFBQSxRQUFNO0FBQUEs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LDJCQUFlO0FBQ2YsMEJBQWM7QUFBQSxVQUNoQjtBQUFBLFFBQ0Y7QUFFQSxlQUFPO0FBQUEsTUFDVDtBQUFBO0FBQUE7OztBQ3pPQTtBQUFBO0FBQUEsVUFBTSxVQUFVO0FBRWhCLFVBQU0sa0JBQWtCO0FBQUE7QUFBQSxRQUV0QjtBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQ1Q7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUNUO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFDVDtBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQ1Q7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUNUO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFDVDtBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQ1Q7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUNUO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFDVDtBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQ1Q7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUNUO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFJO0FBQUEsUUFDVjtBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBSTtBQUFBLFFBQ1Y7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUk7QUFBQSxRQUNWO0FBQUEsUUFBRztBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWDtBQUFBLFFBQUc7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1g7QUFBQSxRQUFHO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNYO0FBQUEsUUFBRztBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWDtBQUFBLFFBQUc7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1g7QUFBQSxRQUFHO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNYO0FBQUEsUUFBRztBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWDtBQUFBLFFBQUc7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1g7QUFBQSxRQUFHO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNYO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLE1BQ2Q7QUFFQSxVQUFNLHFCQUFxQjtBQUFBO0FBQUEsUUFFekI7QUFBQSxRQUFHO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNYO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUs7QUFBQSxRQUNiO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFLO0FBQUEsUUFDYjtBQUFBLFFBQUk7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQ2Q7QUFBQSxRQUFJO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUNkO0FBQUEsUUFBSTtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDZDtBQUFBLFFBQUk7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQ2Q7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUNmO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDZjtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQ2Y7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUNmO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDZjtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQ2Y7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUNmO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDZjtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQ2Y7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUNmO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDZjtBQUFBLFFBQUs7QUFBQSxR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QUFTLFdBQVc7QUFDMUQsYUFBUyxrQkFBa0IsaUJBQWlCLFNBQVMsV0FBVztBQUFBLEVBQ3BFO0FBR0EsaUJBQWUsT0FBTztBQUNsQixZQUFRLElBQUksZ0NBQWdDO0FBQzVDLGlCQUFhO0FBQ2IsZUFBVztBQUVYLFVBQU0sV0FBVztBQUVqQixVQUFNLGNBQWMsTUFBTSxJQUFJLFFBQVEsWUFBWSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3pFLFVBQU0sV0FBVyxNQUFNLElBQUksUUFBUSxZQUFZLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFbkUsUUFBSSxDQUFDLE1BQU0sVUFBVTtBQUNqQixZQUFNLGtCQUFrQjtBQUFBLElBQzVCLE9BQU87QUFDSCxhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7QUFFQSxXQUFTLGlCQUFpQixvQkFBb0IsSUFBSTsiLAogICJuYW1lcyI6IFsibW9kdWxlIiwgImluaXRpYWxpemUiLCAicmVxdWlyZV91dGlscyIsICJyZW5kZXIiLCAicmVuZGVyIiwgIlFSQ29kZSIsICJRUkNvZGUiXQp9Cg==
