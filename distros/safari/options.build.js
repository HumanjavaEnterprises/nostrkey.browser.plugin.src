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
  async function saveProfileName(index, profileName) {
    let profiles = await getProfiles();
    profiles[index].name = profileName;
    await storage.set({ profiles });
  }
  async function savePrivateKey(index, privateKey) {
    await api.runtime.sendMessage({
      kind: "savePrivateKey",
      payload: [index, privateKey]
    });
  }
  async function newBunkerProfile(name = "New Bunker", bunkerUrl = null) {
    let profiles = await getProfiles();
    const profile = await generateProfile(name, "bunker");
    profile.bunkerUrl = bunkerUrl;
    profiles.push(profile);
    await storage.set({ profiles });
    return profiles.length - 1;
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
  async function getPermissions(index = null) {
    if (index == null) {
      index = await getProfileIndex();
    }
    let profile = await getProfile(index);
    let hosts = await profile.hosts;
    return hosts;
  }
  async function setPermission(host, action, perm, index = null) {
    let profiles = await getProfiles();
    if (!index) {
      index = await getProfileIndex();
    }
    let profile = profiles[index];
    let newPerms = profile.hosts[host] || {};
    newPerms = { ...newPerms, [action]: perm };
    profile.hosts[host] = newPerms;
    profiles[index] = profile;
    await storage.set({ profiles });
  }
  function humanPermission(p) {
    if (p.startsWith("signEvent:")) {
      let [e, n] = p.split(":");
      n = parseInt(n);
      let nname = KINDS.find((k) => k[0] === n)?.[1] || `Unknown (Kind ${n})`;
      return `Sign event: ${nname}`;
    }
    switch (p) {
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
        return "Unknown";
    }
  }
  function validateKey(key) {
    const hexMatch = /^[\da-f]{64}$/i.test(key);
    const b32Match = /^nsec1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58}$/.test(key);
    return hexMatch || b32Match || isNcryptsec(key);
  }
  function isNcryptsec(key) {
    return /^ncryptsec1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/.test(key);
  }

  // src/options.js
  var import_qrcode = __toESM(require_browser());
  var state = {
    profileNames: ["---"],
    profileIndex: 0,
    profileName: "",
    pristineProfileName: "",
    privKey: "",
    pristinePrivKey: "",
    pubKey: "",
    relays: [],
    newRelay: "",
    urlError: "",
    recommendedRelay: "",
    permissions: {},
    host: "",
    permHosts: [],
    hostPerms: [],
    visible: false,
    copied: false,
    // QR state
    npubQrDataUrl: "",
    nsecQrDataUrl: "",
    showNsecQr: false,
    // ncryptsec state
    ncryptsecPassword: "",
    ncryptsecError: "",
    ncryptsecLoading: false,
    ncryptsecExportPassword: "",
    ncryptsecExportConfirm: "",
    ncryptsecExportResult: "",
    ncryptsecExportError: "",
    ncryptsecExportLoading: false,
    ncryptsecExportCopied: false,
    // Bunker state
    profileType: "local",
    bunkerUrl: "",
    bunkerConnected: false,
    bunkerError: "",
    bunkerConnecting: false,
    bunkerPubkey: "",
    // Protocol handler
    protocolHandler: "",
    // Security state
    hasPassword: false,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    removePasswordInput: "",
    securityError: "",
    securitySuccess: "",
    removeError: ""
  };
  var elements = {};
  function $(id) {
    return document.getElementById(id);
  }
  function initElements() {
    elements.profileSelect = $("profiles");
    elements.settingsContainer = $("settings-container");
    elements.newBunkerBtn = document.querySelector('[data-action="newBunkerProfile"]');
    elements.keysSection = document.querySelector('[data-section="keys"]');
    elements.profileNameInput = $("profile-name");
    elements.privKeyInput = $("priv-key");
    elements.pubKeyInput = $("pub-key");
    elements.visibilityToggle = document.querySelector('[data-action="toggleVisibility"]');
    elements.copyPubKeyBtn = document.querySelector('[data-action="copyPubKey"]');
    elements.saveProfileBtn = document.querySelector('[data-action="saveProfile"]');
    elements.ncryptsecSection = document.querySelector('[data-section="ncryptsec-import"]');
    elements.ncryptsecPasswordInput = $("ncryptsec-password");
    elements.ncryptsecError = $("ncryptsec-error");
    elements.decryptBtn = document.querySelector('[data-action="decryptNcryptsec"]');
    elements.npubQrContainer = $("npub-qr-container");
    elements.npubQrImage = $("npub-qr-image");
    elements.showNsecQrBtn = document.querySelector('[data-action="showNsecQr"]');
    elements.nsecQrSection = $("nsec-qr-section");
    elements.nsecQrImage = $("nsec-qr-image");
    elements.hideNsecQrBtn = document.querySelector('[data-action="hideNsecQr"]');
    elements.ncryptsecExportPassword = $("ncryptsec-export-password");
    elements.ncryptsecExportConfirm = $("ncryptsec-export-confirm");
    elements.ncryptsecExportError = $("ncryptsec-export-error");
    elements.exportNcryptsecBtn = document.querySelector('[data-action="exportNcryptsec"]');
    elements.ncryptsecExportResult = $("ncryptsec-export-result");
    elements.copyNcryptsecBtn = document.querySelector('[data-action="copyNcryptsecExport"]');
    elements.bunkerSection = document.querySelector('[data-section="bunker"]');
    elements.bunkerProfileNameInput = $("bunker-profile-name");
    elements.saveBunkerNameBtn = document.querySelector('[data-action="saveBunkerName"]');
    elements.bunkerUrlInput = $("bunker-url");
    elements.connectBunkerBtn = document.querySelector('[data-action="connectBunker"]');
    elements.disconnectBunkerBtn = document.querySelector('[data-action="disconnectBunker"]');
    elements.pingBunkerBtn = document.querySelector('[data-action="pingBunker"]');
    elements.bunkerStatus = $("bunker-status-indicator");
    elements.bunkerStatusText = $("bunker-status-text");
    elements.bunkerError = $("bunker-error");
    elements.bunkerPubKeyInput = $("bunker-pubkey");
    elements.copyBunkerPubKeyBtn = document.querySelector('[data-action="copyBunkerPubKey"]');
    elements.relaysTable = $("relays-table");
    elements.relaysEmpty = $("relays-empty");
    elements.recommendedRelaySelect = $("recommended-relay");
    elements.newRelayInput = $("new-relay");
    elements.addRelayBtn = document.querySelector('[data-action="addRelay"]');
    elements.relayError = $("relay-error");
    elements.appSelect = $("app-select");
    elements.permissionsTable = $("permissions-table");
    elements.permissionsEmpty = $("permissions-empty");
    elements.securityStatus = $("security-status");
    elements.setPasswordSection = $("set-password-section");
    elements.changePasswordSection = $("change-password-section");
    elements.newPasswordInput = $("new-password");
    elements.confirmPasswordInput = $("confirm-password");
    elements.passwordStrength = $("password-strength");
    elements.securityError = $("security-error");
    elements.securitySuccess = $("security-success");
    elements.setPasswordBtn = document.querySelector('[data-action="setPassword"]');
    elements.currentPasswordInput = $("current-password");
    elements.newPasswordChangeInput = $("new-password-change");
    elements.confirmPasswordChangeInput = $("confirm-password-change");
    elements.changePasswordBtn = document.querySelector('[data-action="changePassword"]');
    elements.removePasswordInput = $("remove-password");
    elements.removeError = $("remove-error");
    elements.removePasswordBtn = document.querySelector('[data-action="removePassword"]');
    elements.protocolHandlerInput = $("protocol-handler");
    elements.useNjumpBtn = document.querySelector('[data-action="useNjump"]');
    elements.disableHandlerBtn = document.querySelector('[data-action="disableHandler"]');
    elements.closeBtn = $("close-btn");
    elements.clearDataBtn = document.querySelector('[data-action="clearData"]');
  }
  function render() {
    renderProfileSelect();
    renderProfileType();
    if (state.profileType === "local") {
      renderLocalProfile();
    } else {
      renderBunkerProfile();
    }
    renderRelays();
    renderPermissions();
    renderSecurity();
    renderProtocolHandler();
    renderInputs();
  }
  function renderProfileSelect() {
    if (!elements.profileSelect) return;
    const hasSelection = state.profileIndex !== null && state.profileIndex >= 0;
    elements.profileSelect.innerHTML = '<option value="" disabled' + (!hasSelection ? " selected" : "") + ">Select a profile...</option>" + state.profileNames.map((name, i) => `<option value="${i}"${i === state.profileIndex && hasSelection ? " selected" : ""}>${name}</option>`).join("");
    if (elements.settingsContainer) {
      elements.settingsContainer.style.display = hasSelection ? "block" : "none";
    }
  }
  function renderProfileType() {
    const isLocal = state.profileType === "local";
    if (elements.keysSection) {
      elements.keysSection.style.display = isLocal ? "block" : "none";
    }
    if (elements.bunkerSection) {
      elements.bunkerSection.style.display = isLocal ? "none" : "block";
    }
  }
  function renderLocalProfile() {
    if (elements.profileNameInput) {
      elements.profileNameInput.value = state.profileName;
    }
    if (elements.privKeyInput) {
      elements.privKeyInput.value = state.privKey;
      elements.privKeyInput.type = state.visible ? "text" : "password";
      const isValid = validateKey(state.privKey);
      if (state.privKey && !isValid) {
        elements.privKeyInput.classList.add("ring-2", "ring-rose-500");
      } else {
        elements.privKeyInput.classList.remove("ring-2", "ring-rose-500");
      }
    }
    if (elements.pubKeyInput) {
      elements.pubKeyInput.value = state.pubKey;
    }
    if (elements.visibilityToggle) {
      elements.visibilityToggle.textContent = state.visible ? "Hide" : "Show";
    }
    const hasNcryptsec = isNcryptsec(state.privKey);
    if (elements.ncryptsecSection) {
      elements.ncryptsecSection.style.display = hasNcryptsec ? "block" : "none";
    }
    if (elements.saveProfileBtn) {
      elements.saveProfileBtn.style.display = hasNcryptsec ? "none" : "block";
      const needsSave = state.privKey !== state.pristinePrivKey || state.profileName !== state.pristineProfileName;
      elements.saveProfileBtn.disabled = !needsSave || !validateKey(state.privKey);
    }
    if (elements.npubQrContainer && state.npubQrDataUrl) {
      elements.npubQrContainer.style.display = "flex";
      if (elements.npubQrImage) {
        elements.npubQrImage.src = state.npubQrDataUrl;
      }
    } else if (elements.npubQrContainer) {
      elements.npubQrContainer.style.display = "none";
    }
    if (elements.showNsecQrBtn) {
      elements.showNsecQrBtn.style.display = state.visible && state.privKey && !hasNcryptsec ? "block" : "none";
    }
    if (elements.nsecQrSection) {
      elements.nsecQrSection.style.display = state.showNsecQr && state.nsecQrDataUrl ? "block" : "none";
      if (elements.nsecQrImage && state.nsecQrDataUrl) {
        elements.nsecQrImage.src = state.nsecQrDataUrl;
      }
    }
    if (elements.exportNcryptsecBtn) {
      const canExport = state.ncryptsecExportPassword.length >= 8 && state.ncryptsecExportPassword === state.ncryptsecExportConfirm;
      elements.exportNcryptsecBtn.disabled = !canExport || state.ncryptsecExportLoading;
      elements.exportNcryptsecBtn.textContent = state.ncryptsecExportLoading ? "Encrypting..." : "Export ncryptsec";
    }
    if (elements.ncryptsecExportResult) {
      elements.ncryptsecExportResult.value = state.ncryptsecExportResult;
      elements.ncryptsecExportResult.parentElement.style.display = state.ncryptsecExportResult ? "block" : "none";
    }
    if (elements.copyNcryptsecBtn) {
      elements.copyNcryptsecBtn.textContent = state.ncryptsecExportCopied ? "Copied!" : "Copy";
    }
  }
  function renderBunkerProfile() {
    if (elements.bunkerProfileNameInput) {
      elements.bunkerProfileNameInput.value = state.profileName;
    }
    if (elements.bunkerUrlInput) {
      elements.bunkerUrlInput.value = state.bunkerUrl;
      elements.bunkerUrlInput.disabled = state.bunkerConnected;
    }
    if (elements.connectBunkerBtn) {
      elements.connectBunkerBtn.style.display = state.bunkerConnected ? "none" : "inline-block";
      elements.connectBunkerBtn.disabled = state.bunkerConnecting || !state.bunkerUrl;
      elements.connectBunkerBtn.textContent = state.bunkerConnecting ? "Connecting..." : "Connect";
    }
    if (elements.disconnectBunkerBtn) {
      elements.disconnectBunkerBtn.style.display = state.bunkerConnected ? "inline-block" : "none";
    }
    if (elements.pingBunkerBtn) {
      elements.pingBunkerBtn.style.display = state.bunkerConnected ? "inline-block" : "none";
    }
    if (elements.bunkerStatus) {
      elements.bunkerStatus.className = `inline-block w-3 h-3 rounded-full ${state.bunkerConnected ? "bg-green-500" : "bg-red-500"}`;
    }
    if (elements.bunkerStatusText) {
      elements.bunkerStatusText.textContent = state.bunkerConnected ? "Connected" : "Disconnected";
    }
    if (elements.bunkerError) {
      elements.bunkerError.textContent = state.bunkerError;
      elements.bunkerError.style.display = state.bunkerError ? "block" : "none";
    }
    if (elements.bunkerPubKeyInput) {
      elements.bunkerPubKeyInput.value = state.pubKey;
      elements.bunkerPubKeyInput.parentElement.style.display = state.bunkerPubkey ? "block" : "none";
    }
    if (elements.saveBunkerNameBtn) {
      const needsSave = state.profileName !== state.pristineProfileName;
      elements.saveBunkerNameBtn.disabled = !needsSave;
    }
  }
  function renderInputs() {
    if (elements.newRelayInput) elements.newRelayInput.value = state.newRelay;
    if (elements.ncryptsecPasswordInput) elements.ncryptsecPasswordInput.value = state.ncryptsecPassword;
    if (elements.ncryptsecExportPassword) elements.ncryptsecExportPassword.value = state.ncryptsecExportPassword;
    if (elements.ncryptsecExportConfirm) elements.ncryptsecExportConfirm.value = state.ncryptsecExportConfirm;
    if (elements.newPasswordInput) elements.newPasswordInput.value = state.newPassword;
    if (elements.confirmPasswordInput) elements.confirmPasswordInput.value = state.confirmPassword;
    if (elements.currentPasswordInput) elements.currentPasswordInput.value = state.currentPassword;
    if (elements.newPasswordChangeInput) elements.newPasswordChangeInput.value = state.newPassword;
    if (elements.confirmPasswordChangeInput) elements.confirmPasswordChangeInput.value = state.confirmPassword;
    if (elements.removePasswordInput) elements.removePasswordInput.value = state.removePasswordInput;
  }
  function renderRelays() {
    if (!elements.relaysTable) return;
    if (state.relays.length > 0) {
      elements.relaysTable.style.display = "table";
      if (elements.relaysEmpty) elements.relaysEmpty.style.display = "none";
      const tbody = elements.relaysTable.querySelector("tbody");
      if (tbody) {
        tbody.innerHTML = state.relays.map((relay, index) => `
                <tr>
                    <td class="p-2 w-1/3">${relay.url}</td>
                    <td class="p-2 text-center">
                        <input class="checkbox" type="checkbox" ${relay.read ? "checked" : ""} data-relay-index="${index}" data-relay-prop="read">
                    </td>
                    <td class="p-2 text-center">
                        <input class="checkbox" type="checkbox" ${relay.write ? "checked" : ""} data-relay-index="${index}" data-relay-prop="write">
                    </td>
                    <td class="p-2 text-center">
                        <button class="button" data-action="deleteRelay" data-relay-index="${index}">Delete</button>
                    </td>
                </tr>
            `).join("");
        tbody.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
          cb.addEventListener("change", handleRelayCheckboxChange);
        });
        tbody.querySelectorAll('[data-action="deleteRelay"]').forEach((btn) => {
          btn.addEventListener("click", handleDeleteRelay);
        });
      }
    } else {
      elements.relaysTable.style.display = "none";
      if (elements.relaysEmpty) elements.relaysEmpty.style.display = "block";
    }
    if (elements.recommendedRelaySelect) {
      const recommended = getRecommendedRelays();
      elements.recommendedRelaySelect.parentElement.style.display = recommended.length > 0 ? "block" : "none";
      elements.recommendedRelaySelect.innerHTML = '<option value="" disabled selected>Recommended Relays</option>' + recommended.map((url) => `<option value="${url}">${url}</option>`).join("");
    }
    if (elements.relayError) {
      elements.relayError.textContent = state.urlError;
      elements.relayError.style.display = state.urlError ? "block" : "none";
    }
  }
  function renderPermissions() {
    if (!elements.appSelect) return;
    if (state.permHosts.length > 0) {
      elements.appSelect.parentElement.style.display = "block";
      elements.appSelect.innerHTML = '<option value=""></option>' + state.permHosts.map((host) => `<option value="${host}"${host === state.host ? " selected" : ""}>${host}</option>`).join("");
    } else {
      elements.appSelect.parentElement.style.display = "none";
    }
    if (elements.permissionsTable && state.hostPerms.length > 0) {
      elements.permissionsTable.style.display = "table";
      if (elements.permissionsEmpty) elements.permissionsEmpty.style.display = "none";
      const tbody = elements.permissionsTable.querySelector("tbody");
      if (tbody) {
        tbody.innerHTML = state.hostPerms.map(([etype, humanName, perm]) => `
                <tr>
                    <td class="p-2 w-1/3 md:w-2/4">${humanName}</td>
                    <td class="p-2 text-center">
                        <select class="input" data-perm-type="${etype}" data-perm-value="${perm}">
                            <option value="ask"${perm === "ask" ? " selected" : ""}>Ask</option>
                            <option value="allow"${perm === "allow" ? " selected" : ""}>Allow</option>
                            <option value="deny"${perm === "deny" ? " selected" : ""}>Deny</option>
                        </select>
                    </td>
                </tr>
            `).join("");
        tbody.querySelectorAll("select").forEach((sel) => {
          sel.addEventListener("change", handlePermissionChange);
        });
      }
    } else {
      if (elements.permissionsTable) elements.permissionsTable.style.display = "none";
      if (elements.permissionsEmpty) {
        elements.permissionsEmpty.style.display = state.permHosts.length === 0 ? "block" : "none";
      }
    }
  }
  function renderSecurity() {
    if (elements.securityStatus) {
      elements.securityStatus.textContent = state.hasPassword ? "Master password is active \u2014 keys are encrypted at rest." : "No master password set \u2014 keys are stored unencrypted.";
    }
    if (elements.setPasswordSection) {
      elements.setPasswordSection.style.display = state.hasPassword ? "none" : "block";
    }
    if (elements.changePasswordSection) {
      elements.changePasswordSection.style.display = state.hasPassword ? "block" : "none";
    }
    if (elements.passwordStrength && state.newPassword) {
      const strength = calculatePasswordStrength(state.newPassword);
      const labels = ["", "Too short", "Weak", "Fair", "Strong", "Very strong"];
      const colors = ["", "text-red-500", "text-orange-500", "text-yellow-600", "text-green-600", "text-green-700 font-bold"];
      elements.passwordStrength.textContent = labels[strength] || "";
      elements.passwordStrength.className = `text-xs mt-1 ${colors[strength] || ""}`;
      elements.passwordStrength.style.display = state.newPassword ? "block" : "none";
    } else if (elements.passwordStrength) {
      elements.passwordStrength.style.display = "none";
    }
    if (elements.setPasswordBtn) {
      const canSet = state.newPassword.length >= 8 && state.newPassword === state.confirmPassword;
      elements.setPasswordBtn.disabled = !canSet;
    }
    if (elements.changePasswordBtn) {
      const canChange = state.currentPassword.length > 0 && state.newPassword.length >= 8 && state.newPassword === state.confirmPassword;
      elements.changePasswordBtn.disabled = !canChange;
    }
    if (elements.removePasswordBtn) {
      elements.removePasswordBtn.disabled = !state.removePasswordInput;
    }
    if (elements.securityError) {
      elements.securityError.textContent = state.securityError;
      elements.securityError.style.display = state.securityError ? "block" : "none";
    }
    if (elements.securitySuccess) {
      elements.securitySuccess.textContent = state.securitySuccess;
      elements.securitySuccess.style.display = state.securitySuccess ? "block" : "none";
    }
    if (elements.removeError) {
      elements.removeError.textContent = state.removeError;
      elements.removeError.style.display = state.removeError ? "block" : "none";
    }
  }
  function renderProtocolHandler() {
    if (elements.protocolHandlerInput) {
      elements.protocolHandlerInput.value = state.protocolHandler;
    }
  }
  function getRecommendedRelays() {
    const relayUrls = state.relays.map((r) => new URL(r.url).href);
    return RECOMMENDED_RELAYS.filter((r) => !relayUrls.includes(r.href)).map((r) => r.href);
  }
  function calculatePasswordStrength(pw) {
    if (pw.length === 0) return 0;
    if (pw.length < 8) return 1;
    let score = 2;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 5);
  }
  async function loadProfile() {
    state.profileNames = await getProfileNames();
    state.profileIndex = await getProfileIndex();
    const params = new URLSearchParams(window.location.search);
    const urlIndex = params.get("index");
    if (urlIndex) {
      state.profileIndex = parseInt(urlIndex);
    }
    await refreshProfile();
  }
  async function refreshProfile() {
    state.profileNames = await getProfileNames();
    state.profileName = state.profileNames[state.profileIndex];
    state.pristineProfileName = state.profileName;
    state.profileType = await api.runtime.sendMessage({
      kind: "getProfileType",
      payload: state.profileIndex
    });
    state.npubQrDataUrl = "";
    state.nsecQrDataUrl = "";
    state.showNsecQr = false;
    state.ncryptsecExportResult = "";
    state.ncryptsecExportError = "";
    state.ncryptsecExportPassword = "";
    state.ncryptsecExportConfirm = "";
    if (state.profileType === "local") {
      await loadLocalProfile();
    } else {
      await loadBunkerProfile();
    }
    await loadRelays();
    await loadPermissions();
    render();
  }
  async function loadLocalProfile() {
    state.privKey = await api.runtime.sendMessage({
      kind: "getNsec",
      payload: state.profileIndex
    });
    state.pristinePrivKey = state.privKey;
    state.pubKey = await api.runtime.sendMessage({
      kind: "getNpub",
      payload: state.profileIndex
    });
    await generateNpubQr();
  }
  async function loadBunkerProfile() {
    const profile = await getProfile(state.profileIndex);
    state.bunkerUrl = profile?.bunkerUrl || "";
    state.bunkerPubkey = profile?.remotePubkey || "";
    state.bunkerError = "";
    if (state.bunkerPubkey) {
      state.pubKey = await api.runtime.sendMessage({
        kind: "npubEncode",
        payload: state.bunkerPubkey
      });
    } else {
      state.pubKey = "";
    }
    const status = await api.runtime.sendMessage({
      kind: "bunker.status",
      payload: state.profileIndex
    });
    state.bunkerConnected = status?.connected || false;
  }
  async function loadRelays() {
    state.relays = await getRelays(state.profileIndex);
  }
  async function loadPermissions() {
    state.permissions = await getPermissions(state.profileIndex);
    state.permHosts = Object.keys(state.permissions).sort();
    calcHostPerms();
  }
  function calcHostPerms() {
    const hp = state.permissions[state.host] || {};
    const keys = Object.keys(hp).sort();
    state.hostPerms = keys.map((k) => [k, humanPermission(k), hp[k]]);
  }
  async function generateNpubQr() {
    try {
      if (!state.pubKey) {
        state.npubQrDataUrl = "";
        return;
      }
      state.npubQrDataUrl = await import_qrcode.default.toDataURL(state.pubKey.toUpperCase(), {
        width: 200,
        margin: 2,
        color: { dark: "#701a75", light: "#fdf4ff" }
      });
    } catch {
      state.npubQrDataUrl = "";
    }
  }
  async function generateNsecQr() {
    try {
      if (!state.visible || !state.privKey) {
        state.nsecQrDataUrl = "";
        return;
      }
      const nsec = await api.runtime.sendMessage({
        kind: "getNsec",
        payload: state.profileIndex
      });
      if (!nsec) {
        state.nsecQrDataUrl = "";
        return;
      }
      state.nsecQrDataUrl = await import_qrcode.default.toDataURL(nsec.toUpperCase(), {
        width: 200,
        margin: 2,
        color: { dark: "#991b1b", light: "#fef2f2" }
      });
    } catch {
      state.nsecQrDataUrl = "";
    }
  }
  async function handleProfileChange() {
    const val = elements.profileSelect.value;
    if (!val && val !== "0") return;
    const newIndex = parseInt(val);
    if (isNaN(newIndex)) return;
    if (newIndex !== state.profileIndex) {
      state.profileIndex = newIndex;
      state.host = "";
      await refreshProfile();
    }
  }
  async function handleNewBunkerProfile() {
    const newIndex = await newBunkerProfile();
    state.profileIndex = newIndex;
    await refreshProfile();
  }
  function handleProfileNameInput(e) {
    state.profileName = e.target.value;
    render();
  }
  function handlePrivKeyInput(e) {
    state.privKey = e.target.value;
    render();
  }
  function handleToggleVisibility() {
    state.visible = !state.visible;
    render();
  }
  async function handleCopyPubKey() {
    await navigator.clipboard.writeText(state.pubKey);
    state.copied = true;
    render();
    setTimeout(() => {
      state.copied = false;
      render();
    }, 1500);
  }
  async function handleSaveProfile() {
    if (state.profileType === "local") {
      await savePrivateKey(state.profileIndex, state.privKey);
    }
    await saveProfileName(state.profileIndex, state.profileName);
    await refreshProfile();
  }
  async function handleShowNsecQr() {
    await generateNsecQr();
    state.showNsecQr = true;
    render();
  }
  function handleHideNsecQr() {
    state.showNsecQr = false;
    state.nsecQrDataUrl = "";
    render();
  }
  async function handleDecryptNcryptsec() {
    state.ncryptsecError = "";
    state.ncryptsecLoading = true;
    render();
    try {
      const result = await api.runtime.sendMessage({
        kind: "ncryptsec.decrypt",
        payload: {
          ncryptsec: state.privKey,
          password: state.ncryptsecPassword
        }
      });
      if (result.success) {
        await savePrivateKey(state.profileIndex, result.hexKey);
        state.ncryptsecPassword = "";
        await refreshProfile();
      } else {
        state.ncryptsecError = result.error || "Decryption failed. Wrong password?";
      }
    } catch (e) {
      state.ncryptsecError = e.message || "Decryption failed";
    }
    state.ncryptsecLoading = false;
    render();
  }
  async function handleExportNcryptsec() {
    state.ncryptsecExportError = "";
    state.ncryptsecExportResult = "";
    state.ncryptsecExportLoading = true;
    render();
    try {
      const result = await api.runtime.sendMessage({
        kind: "ncryptsec.encrypt",
        payload: {
          profileIndex: state.profileIndex,
          password: state.ncryptsecExportPassword
        }
      });
      if (result.success) {
        state.ncryptsecExportResult = result.ncryptsec;
        state.ncryptsecExportPassword = "";
        state.ncryptsecExportConfirm = "";
      } else {
        state.ncryptsecExportError = result.error || "Encryption failed";
      }
    } catch (e) {
      state.ncryptsecExportError = e.message || "Encryption failed";
    }
    state.ncryptsecExportLoading = false;
    render();
  }
  async function handleCopyNcryptsecExport() {
    await navigator.clipboard.writeText(state.ncryptsecExportResult);
    state.ncryptsecExportCopied = true;
    render();
    setTimeout(() => {
      state.ncryptsecExportCopied = false;
      render();
    }, 1500);
  }
  async function handleConnectBunker() {
    state.bunkerError = "";
    state.bunkerConnecting = true;
    render();
    try {
      const validation = await api.runtime.sendMessage({
        kind: "bunker.validateUrl",
        payload: state.bunkerUrl
      });
      if (!validation.valid) {
        state.bunkerError = validation.error;
        state.bunkerConnecting = false;
        render();
        return;
      }
      const result = await api.runtime.sendMessage({
        kind: "bunker.connect",
        payload: {
          profileIndex: state.profileIndex,
          bunkerUrl: state.bunkerUrl
        }
      });
      if (result.success) {
        state.bunkerConnected = true;
        state.bunkerPubkey = result.remotePubkey;
        state.pubKey = await api.runtime.sendMessage({
          kind: "npubEncode",
          payload: result.remotePubkey
        });
      } else {
        state.bunkerError = result.error || "Failed to connect";
      }
    } catch (e) {
      state.bunkerError = e.message || "Connection failed";
    }
    state.bunkerConnecting = false;
    render();
  }
  async function handleDisconnectBunker() {
    state.bunkerError = "";
    const result = await api.runtime.sendMessage({
      kind: "bunker.disconnect",
      payload: state.profileIndex
    });
    if (result.success) {
      state.bunkerConnected = false;
    } else {
      state.bunkerError = result.error || "Failed to disconnect";
    }
    render();
  }
  async function handlePingBunker() {
    state.bunkerError = "";
    const result = await api.runtime.sendMessage({
      kind: "bunker.ping",
      payload: state.profileIndex
    });
    if (!result.success) {
      state.bunkerError = result.error || "Ping failed";
      state.bunkerConnected = false;
    }
    render();
  }
  async function handleRelayCheckboxChange(e) {
    const index = parseInt(e.target.dataset.relayIndex);
    const prop = e.target.dataset.relayProp;
    state.relays[index][prop] = e.target.checked;
    await saveRelays(state.profileIndex, state.relays);
    await loadRelays();
    render();
  }
  async function handleDeleteRelay(e) {
    const index = parseInt(e.target.dataset.relayIndex);
    state.relays.splice(index, 1);
    await saveRelays(state.profileIndex, state.relays);
    await loadRelays();
    render();
  }
  async function handleAddRelay() {
    const newRelay = state.recommendedRelay || state.newRelay;
    try {
      const url = new URL(newRelay);
      if (url.protocol !== "wss:") {
        setUrlError("Must be a websocket url");
        return;
      }
      const urls = state.relays.map((v) => v.url);
      if (urls.includes(url.href)) {
        setUrlError("URL already exists");
        return;
      }
      state.relays.push({ url: url.href, read: true, write: true });
      await saveRelays(state.profileIndex, state.relays);
      state.newRelay = "";
      state.recommendedRelay = "";
      await loadRelays();
      render();
    } catch (error) {
      setUrlError("Invalid websocket URL");
    }
  }
  function setUrlError(message) {
    state.urlError = message;
    render();
    setTimeout(() => {
      state.urlError = "";
      render();
    }, 3e3);
  }
  async function handlePermissionChange(e) {
    const etype = e.target.dataset.permType;
    const value = e.target.value;
    await setPermission(state.host, etype, value, state.profileIndex);
    await loadPermissions();
    render();
  }
  async function handleSetPassword() {
    state.securityError = "";
    state.securitySuccess = "";
    if (state.newPassword.length < 8) {
      state.securityError = "Password must be at least 8 characters.";
      render();
      return;
    }
    if (state.newPassword !== state.confirmPassword) {
      state.securityError = "Passwords do not match.";
      render();
      return;
    }
    const result = await api.runtime.sendMessage({
      kind: "setPassword",
      payload: state.newPassword
    });
    if (result.success) {
      state.hasPassword = true;
      state.newPassword = "";
      state.confirmPassword = "";
      state.securitySuccess = "Master password set. Your keys are now encrypted at rest.";
      render();
      setTimeout(() => {
        state.securitySuccess = "";
        render();
      }, 5e3);
    } else {
      state.securityError = result.error || "Failed to set password.";
      render();
    }
  }
  async function handleChangePassword() {
    state.securityError = "";
    state.securitySuccess = "";
    if (!state.currentPassword) {
      state.securityError = "Please enter your current password.";
      render();
      return;
    }
    if (state.newPassword.length < 8) {
      state.securityError = "New password must be at least 8 characters.";
      render();
      return;
    }
    if (state.newPassword !== state.confirmPassword) {
      state.securityError = "New passwords do not match.";
      render();
      return;
    }
    const result = await api.runtime.sendMessage({
      kind: "changePassword",
      payload: {
        oldPassword: state.currentPassword,
        newPassword: state.newPassword
      }
    });
    if (result.success) {
      state.currentPassword = "";
      state.newPassword = "";
      state.confirmPassword = "";
      state.securitySuccess = "Master password changed successfully.";
      render();
      setTimeout(() => {
        state.securitySuccess = "";
        render();
      }, 5e3);
    } else {
      state.securityError = result.error || "Failed to change password.";
      render();
    }
  }
  async function handleRemovePassword() {
    state.removeError = "";
    if (!state.removePasswordInput) {
      state.removeError = "Please enter your current password.";
      render();
      return;
    }
    if (!confirm("This will remove encryption from your private keys. They will be stored as plaintext. Are you sure?")) {
      return;
    }
    const result = await api.runtime.sendMessage({
      kind: "removePassword",
      payload: state.removePasswordInput
    });
    if (result.success) {
      state.hasPassword = false;
      state.removePasswordInput = "";
      state.securitySuccess = "Master password removed. Keys are now stored unencrypted.";
      render();
      setTimeout(() => {
        state.securitySuccess = "";
        render();
      }, 5e3);
    } else {
      state.removeError = result.error || "Failed to remove password.";
      render();
    }
  }
  async function handleSaveProtocolHandler() {
    if (state.protocolHandler) {
      await api.storage.local.set({ protocol_handler: state.protocolHandler });
    } else {
      await api.storage.local.remove("protocol_handler");
    }
  }
  async function handleClearData() {
    if (!confirm("This will remove your private keys and all associated data. Are you sure you wish to continue?")) {
      return;
    }
    await clearData();
    await loadProfile();
  }
  function handleClose() {
    window.close();
  }
  function bindEvents() {
    if (elements.profileSelect) {
      elements.profileSelect.addEventListener("change", handleProfileChange);
    }
    if (elements.newBunkerBtn) {
      elements.newBunkerBtn.addEventListener("click", handleNewBunkerProfile);
    }
    if (elements.profileNameInput) {
      elements.profileNameInput.addEventListener("input", handleProfileNameInput);
    }
    if (elements.privKeyInput) {
      elements.privKeyInput.addEventListener("input", handlePrivKeyInput);
    }
    if (elements.visibilityToggle) {
      elements.visibilityToggle.addEventListener("click", handleToggleVisibility);
    }
    if (elements.copyPubKeyBtn) {
      elements.copyPubKeyBtn.addEventListener("click", handleCopyPubKey);
    }
    if (elements.saveProfileBtn) {
      elements.saveProfileBtn.addEventListener("click", handleSaveProfile);
    }
    if (elements.decryptBtn) {
      elements.decryptBtn.addEventListener("click", handleDecryptNcryptsec);
    }
    if (elements.showNsecQrBtn) {
      elements.showNsecQrBtn.addEventListener("click", handleShowNsecQr);
    }
    if (elements.hideNsecQrBtn) {
      elements.hideNsecQrBtn.addEventListener("click", handleHideNsecQr);
    }
    if (elements.exportNcryptsecBtn) {
      elements.exportNcryptsecBtn.addEventListener("click", handleExportNcryptsec);
    }
    if (elements.copyNcryptsecBtn) {
      elements.copyNcryptsecBtn.addEventListener("click", handleCopyNcryptsecExport);
    }
    if (elements.ncryptsecExportPassword) {
      elements.ncryptsecExportPassword.addEventListener("input", (e) => {
        state.ncryptsecExportPassword = e.target.value;
        render();
      });
    }
    if (elements.ncryptsecExportConfirm) {
      elements.ncryptsecExportConfirm.addEventListener("input", (e) => {
        state.ncryptsecExportConfirm = e.target.value;
        render();
      });
    }
    if (elements.bunkerProfileNameInput) {
      elements.bunkerProfileNameInput.addEventListener("input", handleProfileNameInput);
    }
    if (elements.saveBunkerNameBtn) {
      elements.saveBunkerNameBtn.addEventListener("click", handleSaveProfile);
    }
    if (elements.bunkerUrlInput) {
      elements.bunkerUrlInput.addEventListener("input", (e) => {
        state.bunkerUrl = e.target.value;
        render();
      });
    }
    if (elements.connectBunkerBtn) {
      elements.connectBunkerBtn.addEventListener("click", handleConnectBunker);
    }
    if (elements.disconnectBunkerBtn) {
      elements.disconnectBunkerBtn.addEventListener("click", handleDisconnectBunker);
    }
    if (elements.pingBunkerBtn) {
      elements.pingBunkerBtn.addEventListener("click", handlePingBunker);
    }
    if (elements.copyBunkerPubKeyBtn) {
      elements.copyBunkerPubKeyBtn.addEventListener("click", handleCopyPubKey);
    }
    if (elements.ncryptsecPasswordInput) {
      elements.ncryptsecPasswordInput.addEventListener("input", (e) => {
        state.ncryptsecPassword = e.target.value;
        render();
      });
    }
    if (elements.newRelayInput) {
      elements.newRelayInput.addEventListener("input", (e) => {
        state.newRelay = e.target.value;
      });
      elements.newRelayInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
          handleAddRelay();
        }
      });
    }
    if (elements.recommendedRelaySelect) {
      elements.recommendedRelaySelect.addEventListener("change", (e) => {
        state.recommendedRelay = e.target.value;
        handleAddRelay();
      });
    }
    if (elements.addRelayBtn) {
      elements.addRelayBtn.addEventListener("click", handleAddRelay);
    }
    if (elements.appSelect) {
      elements.appSelect.addEventListener("change", (e) => {
        state.host = e.target.value;
        calcHostPerms();
        render();
      });
    }
    if (elements.newPasswordInput) {
      elements.newPasswordInput.addEventListener("input", (e) => {
        state.newPassword = e.target.value;
        render();
      });
    }
    if (elements.confirmPasswordInput) {
      elements.confirmPasswordInput.addEventListener("input", (e) => {
        state.confirmPassword = e.target.value;
        render();
      });
    }
    if (elements.setPasswordBtn) {
      elements.setPasswordBtn.addEventListener("click", handleSetPassword);
    }
    if (elements.currentPasswordInput) {
      elements.currentPasswordInput.addEventListener("input", (e) => {
        state.currentPassword = e.target.value;
        render();
      });
    }
    if (elements.newPasswordChangeInput) {
      elements.newPasswordChangeInput.addEventListener("input", (e) => {
        state.newPassword = e.target.value;
        render();
      });
    }
    if (elements.confirmPasswordChangeInput) {
      elements.confirmPasswordChangeInput.addEventListener("input", (e) => {
        state.confirmPassword = e.target.value;
        render();
      });
    }
    if (elements.changePasswordBtn) {
      elements.changePasswordBtn.addEventListener("click", handleChangePassword);
    }
    if (elements.removePasswordInput) {
      elements.removePasswordInput.addEventListener("input", (e) => {
        state.removePasswordInput = e.target.value;
        render();
      });
    }
    if (elements.removePasswordBtn) {
      elements.removePasswordBtn.addEventListener("click", handleRemovePassword);
    }
    if (elements.protocolHandlerInput) {
      elements.protocolHandlerInput.addEventListener("input", (e) => {
        state.protocolHandler = e.target.value;
      });
      elements.protocolHandlerInput.addEventListener("change", handleSaveProtocolHandler);
    }
    if (elements.useNjumpBtn) {
      elements.useNjumpBtn.addEventListener("click", () => {
        state.protocolHandler = "https://njump.me/{raw}";
        handleSaveProtocolHandler();
        render();
      });
    }
    if (elements.disableHandlerBtn) {
      elements.disableHandlerBtn.addEventListener("click", () => {
        state.protocolHandler = "";
        handleSaveProtocolHandler();
        render();
      });
    }
    if (elements.closeBtn) {
      elements.closeBtn.addEventListener("click", handleClose);
    }
    const closeOptionsBtn = document.querySelector('[data-action="closeOptions"]');
    if (closeOptionsBtn) {
      closeOptionsBtn.addEventListener("click", handleClose);
    }
    if (elements.clearDataBtn) {
      elements.clearDataBtn.addEventListener("click", handleClearData);
    }
    document.querySelectorAll("form").forEach((form) => {
      form.addEventListener("submit", (e) => e.preventDefault());
    });
    document.querySelectorAll("a[data-action]").forEach((a) => {
      a.addEventListener("click", (e) => e.preventDefault());
    });
  }
  async function init() {
    console.log("NostrKey Full Settings initializing...");
    await initialize();
    state.hasPassword = await api.runtime.sendMessage({ kind: "isEncrypted" });
    const { protocol_handler } = await api.storage.local.get(["protocol_handler"]);
    state.protocolHandler = protocol_handler || "";
    initElements();
    bindEvents();
    await loadProfile();
  }
  document.addEventListener("DOMContentLoaded", init);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY2FuLXByb21pc2UuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS91dGlscy5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2Vycm9yLWNvcnJlY3Rpb24tbGV2ZWwuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9iaXQtYnVmZmVyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYml0LW1hdHJpeC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2FsaWdubWVudC1wYXR0ZXJuLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvZmluZGVyLXBhdHRlcm4uanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9tYXNrLXBhdHRlcm4uanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9lcnJvci1jb3JyZWN0aW9uLWNvZGUuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9nYWxvaXMtZmllbGQuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9wb2x5bm9taWFsLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvcmVlZC1zb2xvbW9uLWVuY29kZXIuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS92ZXJzaW9uLWNoZWNrLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvcmVnZXguanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9tb2RlLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvdmVyc2lvbi5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2Zvcm1hdC1pbmZvLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvbnVtZXJpYy1kYXRhLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYWxwaGFudW1lcmljLWRhdGEuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9ieXRlLWRhdGEuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9rYW5qaS1kYXRhLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9kaWprc3RyYWpzL2RpamtzdHJhLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvc2VnbWVudHMuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9xcmNvZGUuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvcmVuZGVyZXIvdXRpbHMuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvcmVuZGVyZXIvY2FudmFzLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL3JlbmRlcmVyL3N2Zy10YWcuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvYnJvd3Nlci5qcyIsICIuLi8uLi9zcmMvdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwuanMiLCAiLi4vLi4vc3JjL3V0aWxpdGllcy91dGlscy5qcyIsICIuLi8uLi9zcmMvb3B0aW9ucy5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gY2FuLXByb21pc2UgaGFzIGEgY3Jhc2ggaW4gc29tZSB2ZXJzaW9ucyBvZiByZWFjdCBuYXRpdmUgdGhhdCBkb250IGhhdmVcbi8vIHN0YW5kYXJkIGdsb2JhbCBvYmplY3RzXG4vLyBodHRwczovL2dpdGh1Yi5jb20vc29sZGFpci9ub2RlLXFyY29kZS9pc3N1ZXMvMTU3XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdHlwZW9mIFByb21pc2UgPT09ICdmdW5jdGlvbicgJiYgUHJvbWlzZS5wcm90b3R5cGUgJiYgUHJvbWlzZS5wcm90b3R5cGUudGhlblxufVxuIiwgImxldCB0b1NKSVNGdW5jdGlvblxuY29uc3QgQ09ERVdPUkRTX0NPVU5UID0gW1xuICAwLCAvLyBOb3QgdXNlZFxuICAyNiwgNDQsIDcwLCAxMDAsIDEzNCwgMTcyLCAxOTYsIDI0MiwgMjkyLCAzNDYsXG4gIDQwNCwgNDY2LCA1MzIsIDU4MSwgNjU1LCA3MzMsIDgxNSwgOTAxLCA5OTEsIDEwODUsXG4gIDExNTYsIDEyNTgsIDEzNjQsIDE0NzQsIDE1ODgsIDE3MDYsIDE4MjgsIDE5MjEsIDIwNTEsIDIxODUsXG4gIDIzMjMsIDI0NjUsIDI2MTEsIDI3NjEsIDI4NzYsIDMwMzQsIDMxOTYsIDMzNjIsIDM1MzIsIDM3MDZcbl1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBRUiBDb2RlIHNpemUgZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvblxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICBzaXplIG9mIFFSIGNvZGVcbiAqL1xuZXhwb3J0cy5nZXRTeW1ib2xTaXplID0gZnVuY3Rpb24gZ2V0U3ltYm9sU2l6ZSAodmVyc2lvbikge1xuICBpZiAoIXZlcnNpb24pIHRocm93IG5ldyBFcnJvcignXCJ2ZXJzaW9uXCIgY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJylcbiAgaWYgKHZlcnNpb24gPCAxIHx8IHZlcnNpb24gPiA0MCkgdGhyb3cgbmV3IEVycm9yKCdcInZlcnNpb25cIiBzaG91bGQgYmUgaW4gcmFuZ2UgZnJvbSAxIHRvIDQwJylcbiAgcmV0dXJuIHZlcnNpb24gKiA0ICsgMTdcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB0b3RhbCBudW1iZXIgb2YgY29kZXdvcmRzIHVzZWQgdG8gc3RvcmUgZGF0YSBhbmQgRUMgaW5mb3JtYXRpb24uXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgIERhdGEgbGVuZ3RoIGluIGJpdHNcbiAqL1xuZXhwb3J0cy5nZXRTeW1ib2xUb3RhbENvZGV3b3JkcyA9IGZ1bmN0aW9uIGdldFN5bWJvbFRvdGFsQ29kZXdvcmRzICh2ZXJzaW9uKSB7XG4gIHJldHVybiBDT0RFV09SRFNfQ09VTlRbdmVyc2lvbl1cbn1cblxuLyoqXG4gKiBFbmNvZGUgZGF0YSB3aXRoIEJvc2UtQ2hhdWRodXJpLUhvY3F1ZW5naGVtXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBkYXRhIFZhbHVlIHRvIGVuY29kZVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgIEVuY29kZWQgdmFsdWVcbiAqL1xuZXhwb3J0cy5nZXRCQ0hEaWdpdCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gIGxldCBkaWdpdCA9IDBcblxuICB3aGlsZSAoZGF0YSAhPT0gMCkge1xuICAgIGRpZ2l0KytcbiAgICBkYXRhID4+Pj0gMVxuICB9XG5cbiAgcmV0dXJuIGRpZ2l0XG59XG5cbmV4cG9ydHMuc2V0VG9TSklTRnVuY3Rpb24gPSBmdW5jdGlvbiBzZXRUb1NKSVNGdW5jdGlvbiAoZikge1xuICBpZiAodHlwZW9mIGYgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1widG9TSklTRnVuY1wiIGlzIG5vdCBhIHZhbGlkIGZ1bmN0aW9uLicpXG4gIH1cblxuICB0b1NKSVNGdW5jdGlvbiA9IGZcbn1cblxuZXhwb3J0cy5pc0thbmppTW9kZUVuYWJsZWQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0eXBlb2YgdG9TSklTRnVuY3Rpb24gIT09ICd1bmRlZmluZWQnXG59XG5cbmV4cG9ydHMudG9TSklTID0gZnVuY3Rpb24gdG9TSklTIChrYW5qaSkge1xuICByZXR1cm4gdG9TSklTRnVuY3Rpb24oa2FuamkpXG59XG4iLCAiZXhwb3J0cy5MID0geyBiaXQ6IDEgfVxuZXhwb3J0cy5NID0geyBiaXQ6IDAgfVxuZXhwb3J0cy5RID0geyBiaXQ6IDMgfVxuZXhwb3J0cy5IID0geyBiaXQ6IDIgfVxuXG5mdW5jdGlvbiBmcm9tU3RyaW5nIChzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQYXJhbSBpcyBub3QgYSBzdHJpbmcnKVxuICB9XG5cbiAgY29uc3QgbGNTdHIgPSBzdHJpbmcudG9Mb3dlckNhc2UoKVxuXG4gIHN3aXRjaCAobGNTdHIpIHtcbiAgICBjYXNlICdsJzpcbiAgICBjYXNlICdsb3cnOlxuICAgICAgcmV0dXJuIGV4cG9ydHMuTFxuXG4gICAgY2FzZSAnbSc6XG4gICAgY2FzZSAnbWVkaXVtJzpcbiAgICAgIHJldHVybiBleHBvcnRzLk1cblxuICAgIGNhc2UgJ3EnOlxuICAgIGNhc2UgJ3F1YXJ0aWxlJzpcbiAgICAgIHJldHVybiBleHBvcnRzLlFcblxuICAgIGNhc2UgJ2gnOlxuICAgIGNhc2UgJ2hpZ2gnOlxuICAgICAgcmV0dXJuIGV4cG9ydHMuSFxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBFQyBMZXZlbDogJyArIHN0cmluZylcbiAgfVxufVxuXG5leHBvcnRzLmlzVmFsaWQgPSBmdW5jdGlvbiBpc1ZhbGlkIChsZXZlbCkge1xuICByZXR1cm4gbGV2ZWwgJiYgdHlwZW9mIGxldmVsLmJpdCAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICBsZXZlbC5iaXQgPj0gMCAmJiBsZXZlbC5iaXQgPCA0XG59XG5cbmV4cG9ydHMuZnJvbSA9IGZ1bmN0aW9uIGZyb20gKHZhbHVlLCBkZWZhdWx0VmFsdWUpIHtcbiAgaWYgKGV4cG9ydHMuaXNWYWxpZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGZyb21TdHJpbmcodmFsdWUpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlXG4gIH1cbn1cbiIsICJmdW5jdGlvbiBCaXRCdWZmZXIgKCkge1xuICB0aGlzLmJ1ZmZlciA9IFtdXG4gIHRoaXMubGVuZ3RoID0gMFxufVxuXG5CaXRCdWZmZXIucHJvdG90eXBlID0ge1xuXG4gIGdldDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgY29uc3QgYnVmSW5kZXggPSBNYXRoLmZsb29yKGluZGV4IC8gOClcbiAgICByZXR1cm4gKCh0aGlzLmJ1ZmZlcltidWZJbmRleF0gPj4+ICg3IC0gaW5kZXggJSA4KSkgJiAxKSA9PT0gMVxuICB9LFxuXG4gIHB1dDogZnVuY3Rpb24gKG51bSwgbGVuZ3RoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5wdXRCaXQoKChudW0gPj4+IChsZW5ndGggLSBpIC0gMSkpICYgMSkgPT09IDEpXG4gICAgfVxuICB9LFxuXG4gIGdldExlbmd0aEluQml0czogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmxlbmd0aFxuICB9LFxuXG4gIHB1dEJpdDogZnVuY3Rpb24gKGJpdCkge1xuICAgIGNvbnN0IGJ1ZkluZGV4ID0gTWF0aC5mbG9vcih0aGlzLmxlbmd0aCAvIDgpXG4gICAgaWYgKHRoaXMuYnVmZmVyLmxlbmd0aCA8PSBidWZJbmRleCkge1xuICAgICAgdGhpcy5idWZmZXIucHVzaCgwKVxuICAgIH1cblxuICAgIGlmIChiaXQpIHtcbiAgICAgIHRoaXMuYnVmZmVyW2J1ZkluZGV4XSB8PSAoMHg4MCA+Pj4gKHRoaXMubGVuZ3RoICUgOCkpXG4gICAgfVxuXG4gICAgdGhpcy5sZW5ndGgrK1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQml0QnVmZmVyXG4iLCAiLyoqXG4gKiBIZWxwZXIgY2xhc3MgdG8gaGFuZGxlIFFSIENvZGUgc3ltYm9sIG1vZHVsZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc2l6ZSBTeW1ib2wgc2l6ZVxuICovXG5mdW5jdGlvbiBCaXRNYXRyaXggKHNpemUpIHtcbiAgaWYgKCFzaXplIHx8IHNpemUgPCAxKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCaXRNYXRyaXggc2l6ZSBtdXN0IGJlIGRlZmluZWQgYW5kIGdyZWF0ZXIgdGhhbiAwJylcbiAgfVxuXG4gIHRoaXMuc2l6ZSA9IHNpemVcbiAgdGhpcy5kYXRhID0gbmV3IFVpbnQ4QXJyYXkoc2l6ZSAqIHNpemUpXG4gIHRoaXMucmVzZXJ2ZWRCaXQgPSBuZXcgVWludDhBcnJheShzaXplICogc2l6ZSlcbn1cblxuLyoqXG4gKiBTZXQgYml0IHZhbHVlIGF0IHNwZWNpZmllZCBsb2NhdGlvblxuICogSWYgcmVzZXJ2ZWQgZmxhZyBpcyBzZXQsIHRoaXMgYml0IHdpbGwgYmUgaWdub3JlZCBkdXJpbmcgbWFza2luZyBwcm9jZXNzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9ICByb3dcbiAqIEBwYXJhbSB7TnVtYmVyfSAgY29sXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHZhbHVlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHJlc2VydmVkXG4gKi9cbkJpdE1hdHJpeC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHJvdywgY29sLCB2YWx1ZSwgcmVzZXJ2ZWQpIHtcbiAgY29uc3QgaW5kZXggPSByb3cgKiB0aGlzLnNpemUgKyBjb2xcbiAgdGhpcy5kYXRhW2luZGV4XSA9IHZhbHVlXG4gIGlmIChyZXNlcnZlZCkgdGhpcy5yZXNlcnZlZEJpdFtpbmRleF0gPSB0cnVlXG59XG5cbi8qKlxuICogUmV0dXJucyBiaXQgdmFsdWUgYXQgc3BlY2lmaWVkIGxvY2F0aW9uXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSAgcm93XG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICBjb2xcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbkJpdE1hdHJpeC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIHJldHVybiB0aGlzLmRhdGFbcm93ICogdGhpcy5zaXplICsgY29sXVxufVxuXG4vKipcbiAqIEFwcGxpZXMgeG9yIG9wZXJhdG9yIGF0IHNwZWNpZmllZCBsb2NhdGlvblxuICogKHVzZWQgZHVyaW5nIG1hc2tpbmcgcHJvY2VzcylcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gIHJvd1xuICogQHBhcmFtIHtOdW1iZXJ9ICBjb2xcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdmFsdWVcbiAqL1xuQml0TWF0cml4LnByb3RvdHlwZS54b3IgPSBmdW5jdGlvbiAocm93LCBjb2wsIHZhbHVlKSB7XG4gIHRoaXMuZGF0YVtyb3cgKiB0aGlzLnNpemUgKyBjb2xdIF49IHZhbHVlXG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYml0IGF0IHNwZWNpZmllZCBsb2NhdGlvbiBpcyByZXNlcnZlZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSAgIHJvd1xuICogQHBhcmFtIHtOdW1iZXJ9ICAgY29sXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5CaXRNYXRyaXgucHJvdG90eXBlLmlzUmVzZXJ2ZWQgPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgcmV0dXJuIHRoaXMucmVzZXJ2ZWRCaXRbcm93ICogdGhpcy5zaXplICsgY29sXVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJpdE1hdHJpeFxuIiwgIi8qKlxuICogQWxpZ25tZW50IHBhdHRlcm4gYXJlIGZpeGVkIHJlZmVyZW5jZSBwYXR0ZXJuIGluIGRlZmluZWQgcG9zaXRpb25zXG4gKiBpbiBhIG1hdHJpeCBzeW1ib2xvZ3ksIHdoaWNoIGVuYWJsZXMgdGhlIGRlY29kZSBzb2Z0d2FyZSB0byByZS1zeW5jaHJvbmlzZVxuICogdGhlIGNvb3JkaW5hdGUgbWFwcGluZyBvZiB0aGUgaW1hZ2UgbW9kdWxlcyBpbiB0aGUgZXZlbnQgb2YgbW9kZXJhdGUgYW1vdW50c1xuICogb2YgZGlzdG9ydGlvbiBvZiB0aGUgaW1hZ2UuXG4gKlxuICogQWxpZ25tZW50IHBhdHRlcm5zIGFyZSBwcmVzZW50IG9ubHkgaW4gUVIgQ29kZSBzeW1ib2xzIG9mIHZlcnNpb24gMiBvciBsYXJnZXJcbiAqIGFuZCB0aGVpciBudW1iZXIgZGVwZW5kcyBvbiB0aGUgc3ltYm9sIHZlcnNpb24uXG4gKi9cblxuY29uc3QgZ2V0U3ltYm9sU2l6ZSA9IHJlcXVpcmUoJy4vdXRpbHMnKS5nZXRTeW1ib2xTaXplXG5cbi8qKlxuICogQ2FsY3VsYXRlIHRoZSByb3cvY29sdW1uIGNvb3JkaW5hdGVzIG9mIHRoZSBjZW50ZXIgbW9kdWxlIG9mIGVhY2ggYWxpZ25tZW50IHBhdHRlcm5cbiAqIGZvciB0aGUgc3BlY2lmaWVkIFFSIENvZGUgdmVyc2lvbi5cbiAqXG4gKiBUaGUgYWxpZ25tZW50IHBhdHRlcm5zIGFyZSBwb3NpdGlvbmVkIHN5bW1ldHJpY2FsbHkgb24gZWl0aGVyIHNpZGUgb2YgdGhlIGRpYWdvbmFsXG4gKiBydW5uaW5nIGZyb20gdGhlIHRvcCBsZWZ0IGNvcm5lciBvZiB0aGUgc3ltYm9sIHRvIHRoZSBib3R0b20gcmlnaHQgY29ybmVyLlxuICpcbiAqIFNpbmNlIHBvc2l0aW9ucyBhcmUgc2ltbWV0cmljYWwgb25seSBoYWxmIG9mIHRoZSBjb29yZGluYXRlcyBhcmUgcmV0dXJuZWQuXG4gKiBFYWNoIGl0ZW0gb2YgdGhlIGFycmF5IHdpbGwgcmVwcmVzZW50IGluIHR1cm4gdGhlIHggYW5kIHkgY29vcmRpbmF0ZS5cbiAqIEBzZWUge0BsaW5rIGdldFBvc2l0aW9uc31cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICAgQXJyYXkgb2YgY29vcmRpbmF0ZVxuICovXG5leHBvcnRzLmdldFJvd0NvbENvb3JkcyA9IGZ1bmN0aW9uIGdldFJvd0NvbENvb3JkcyAodmVyc2lvbikge1xuICBpZiAodmVyc2lvbiA9PT0gMSkgcmV0dXJuIFtdXG5cbiAgY29uc3QgcG9zQ291bnQgPSBNYXRoLmZsb29yKHZlcnNpb24gLyA3KSArIDJcbiAgY29uc3Qgc2l6ZSA9IGdldFN5bWJvbFNpemUodmVyc2lvbilcbiAgY29uc3QgaW50ZXJ2YWxzID0gc2l6ZSA9PT0gMTQ1ID8gMjYgOiBNYXRoLmNlaWwoKHNpemUgLSAxMykgLyAoMiAqIHBvc0NvdW50IC0gMikpICogMlxuICBjb25zdCBwb3NpdGlvbnMgPSBbc2l6ZSAtIDddIC8vIExhc3QgY29vcmQgaXMgYWx3YXlzIChzaXplIC0gNylcblxuICBmb3IgKGxldCBpID0gMTsgaSA8IHBvc0NvdW50IC0gMTsgaSsrKSB7XG4gICAgcG9zaXRpb25zW2ldID0gcG9zaXRpb25zW2kgLSAxXSAtIGludGVydmFsc1xuICB9XG5cbiAgcG9zaXRpb25zLnB1c2goNikgLy8gRmlyc3QgY29vcmQgaXMgYWx3YXlzIDZcblxuICByZXR1cm4gcG9zaXRpb25zLnJldmVyc2UoKVxufVxuXG4vKipcbiAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgcG9zaXRpb25zIG9mIGVhY2ggYWxpZ25tZW50IHBhdHRlcm4uXG4gKiBFYWNoIGFycmF5J3MgZWxlbWVudCByZXByZXNlbnQgdGhlIGNlbnRlciBwb2ludCBvZiB0aGUgcGF0dGVybiBhcyAoeCwgeSkgY29vcmRpbmF0ZXNcbiAqXG4gKiBDb29yZGluYXRlcyBhcmUgY2FsY3VsYXRlZCBleHBhbmRpbmcgdGhlIHJvdy9jb2x1bW4gY29vcmRpbmF0ZXMgcmV0dXJuZWQgYnkge0BsaW5rIGdldFJvd0NvbENvb3Jkc31cbiAqIGFuZCBmaWx0ZXJpbmcgb3V0IHRoZSBpdGVtcyB0aGF0IG92ZXJsYXBzIHdpdGggZmluZGVyIHBhdHRlcm5cbiAqXG4gKiBAZXhhbXBsZVxuICogRm9yIGEgVmVyc2lvbiA3IHN5bWJvbCB7QGxpbmsgZ2V0Um93Q29sQ29vcmRzfSByZXR1cm5zIHZhbHVlcyA2LCAyMiBhbmQgMzguXG4gKiBUaGUgYWxpZ25tZW50IHBhdHRlcm5zLCB0aGVyZWZvcmUsIGFyZSB0byBiZSBjZW50ZXJlZCBvbiAocm93LCBjb2x1bW4pXG4gKiBwb3NpdGlvbnMgKDYsMjIpLCAoMjIsNiksICgyMiwyMiksICgyMiwzOCksICgzOCwyMiksICgzOCwzOCkuXG4gKiBOb3RlIHRoYXQgdGhlIGNvb3JkaW5hdGVzICg2LDYpLCAoNiwzOCksICgzOCw2KSBhcmUgb2NjdXBpZWQgYnkgZmluZGVyIHBhdHRlcm5zXG4gKiBhbmQgYXJlIG5vdCB0aGVyZWZvcmUgdXNlZCBmb3IgYWxpZ25tZW50IHBhdHRlcm5zLlxuICpcbiAqIGxldCBwb3MgPSBnZXRQb3NpdGlvbnMoNylcbiAqIC8vIFtbNiwyMl0sIFsyMiw2XSwgWzIyLDIyXSwgWzIyLDM4XSwgWzM4LDIyXSwgWzM4LDM4XV1cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICAgQXJyYXkgb2YgY29vcmRpbmF0ZXNcbiAqL1xuZXhwb3J0cy5nZXRQb3NpdGlvbnMgPSBmdW5jdGlvbiBnZXRQb3NpdGlvbnMgKHZlcnNpb24pIHtcbiAgY29uc3QgY29vcmRzID0gW11cbiAgY29uc3QgcG9zID0gZXhwb3J0cy5nZXRSb3dDb2xDb29yZHModmVyc2lvbilcbiAgY29uc3QgcG9zTGVuZ3RoID0gcG9zLmxlbmd0aFxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcG9zTGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvc0xlbmd0aDsgaisrKSB7XG4gICAgICAvLyBTa2lwIGlmIHBvc2l0aW9uIGlzIG9jY3VwaWVkIGJ5IGZpbmRlciBwYXR0ZXJuc1xuICAgICAgaWYgKChpID09PSAwICYmIGogPT09IDApIHx8IC8vIHRvcC1sZWZ0XG4gICAgICAgICAgKGkgPT09IDAgJiYgaiA9PT0gcG9zTGVuZ3RoIC0gMSkgfHwgLy8gYm90dG9tLWxlZnRcbiAgICAgICAgICAoaSA9PT0gcG9zTGVuZ3RoIC0gMSAmJiBqID09PSAwKSkgeyAvLyB0b3AtcmlnaHRcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgY29vcmRzLnB1c2goW3Bvc1tpXSwgcG9zW2pdXSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29vcmRzXG59XG4iLCAiY29uc3QgZ2V0U3ltYm9sU2l6ZSA9IHJlcXVpcmUoJy4vdXRpbHMnKS5nZXRTeW1ib2xTaXplXG5jb25zdCBGSU5ERVJfUEFUVEVSTl9TSVpFID0gN1xuXG4vKipcbiAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgcG9zaXRpb25zIG9mIGVhY2ggZmluZGVyIHBhdHRlcm4uXG4gKiBFYWNoIGFycmF5J3MgZWxlbWVudCByZXByZXNlbnQgdGhlIHRvcC1sZWZ0IHBvaW50IG9mIHRoZSBwYXR0ZXJuIGFzICh4LCB5KSBjb29yZGluYXRlc1xuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICBBcnJheSBvZiBjb29yZGluYXRlc1xuICovXG5leHBvcnRzLmdldFBvc2l0aW9ucyA9IGZ1bmN0aW9uIGdldFBvc2l0aW9ucyAodmVyc2lvbikge1xuICBjb25zdCBzaXplID0gZ2V0U3ltYm9sU2l6ZSh2ZXJzaW9uKVxuXG4gIHJldHVybiBbXG4gICAgLy8gdG9wLWxlZnRcbiAgICBbMCwgMF0sXG4gICAgLy8gdG9wLXJpZ2h0XG4gICAgW3NpemUgLSBGSU5ERVJfUEFUVEVSTl9TSVpFLCAwXSxcbiAgICAvLyBib3R0b20tbGVmdFxuICAgIFswLCBzaXplIC0gRklOREVSX1BBVFRFUk5fU0laRV1cbiAgXVxufVxuIiwgIi8qKlxuICogRGF0YSBtYXNrIHBhdHRlcm4gcmVmZXJlbmNlXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnRzLlBhdHRlcm5zID0ge1xuICBQQVRURVJOMDAwOiAwLFxuICBQQVRURVJOMDAxOiAxLFxuICBQQVRURVJOMDEwOiAyLFxuICBQQVRURVJOMDExOiAzLFxuICBQQVRURVJOMTAwOiA0LFxuICBQQVRURVJOMTAxOiA1LFxuICBQQVRURVJOMTEwOiA2LFxuICBQQVRURVJOMTExOiA3XG59XG5cbi8qKlxuICogV2VpZ2h0ZWQgcGVuYWx0eSBzY29yZXMgZm9yIHRoZSB1bmRlc2lyYWJsZSBmZWF0dXJlc1xuICogQHR5cGUge09iamVjdH1cbiAqL1xuY29uc3QgUGVuYWx0eVNjb3JlcyA9IHtcbiAgTjE6IDMsXG4gIE4yOiAzLFxuICBOMzogNDAsXG4gIE40OiAxMFxufVxuXG4vKipcbiAqIENoZWNrIGlmIG1hc2sgcGF0dGVybiB2YWx1ZSBpcyB2YWxpZFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gIG1hc2sgICAgTWFzayBwYXR0ZXJuXG4gKiBAcmV0dXJuIHtCb29sZWFufSAgICAgICAgIHRydWUgaWYgdmFsaWQsIGZhbHNlIG90aGVyd2lzZVxuICovXG5leHBvcnRzLmlzVmFsaWQgPSBmdW5jdGlvbiBpc1ZhbGlkIChtYXNrKSB7XG4gIHJldHVybiBtYXNrICE9IG51bGwgJiYgbWFzayAhPT0gJycgJiYgIWlzTmFOKG1hc2spICYmIG1hc2sgPj0gMCAmJiBtYXNrIDw9IDdcbn1cblxuLyoqXG4gKiBSZXR1cm5zIG1hc2sgcGF0dGVybiBmcm9tIGEgdmFsdWUuXG4gKiBJZiB2YWx1ZSBpcyBub3QgdmFsaWQsIHJldHVybnMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfFN0cmluZ30gdmFsdWUgICAgICAgIE1hc2sgcGF0dGVybiB2YWx1ZVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgIFZhbGlkIG1hc2sgcGF0dGVybiBvciB1bmRlZmluZWRcbiAqL1xuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSAodmFsdWUpIHtcbiAgcmV0dXJuIGV4cG9ydHMuaXNWYWxpZCh2YWx1ZSkgPyBwYXJzZUludCh2YWx1ZSwgMTApIDogdW5kZWZpbmVkXG59XG5cbi8qKlxuKiBGaW5kIGFkamFjZW50IG1vZHVsZXMgaW4gcm93L2NvbHVtbiB3aXRoIHRoZSBzYW1lIGNvbG9yXG4qIGFuZCBhc3NpZ24gYSBwZW5hbHR5IHZhbHVlLlxuKlxuKiBQb2ludHM6IE4xICsgaVxuKiBpIGlzIHRoZSBhbW91bnQgYnkgd2hpY2ggdGhlIG51bWJlciBvZiBhZGphY2VudCBtb2R1bGVzIG9mIHRoZSBzYW1lIGNvbG9yIGV4Y2VlZHMgNVxuKi9cbmV4cG9ydHMuZ2V0UGVuYWx0eU4xID0gZnVuY3Rpb24gZ2V0UGVuYWx0eU4xIChkYXRhKSB7XG4gIGNvbnN0IHNpemUgPSBkYXRhLnNpemVcbiAgbGV0IHBvaW50cyA9IDBcbiAgbGV0IHNhbWVDb3VudENvbCA9IDBcbiAgbGV0IHNhbWVDb3VudFJvdyA9IDBcbiAgbGV0IGxhc3RDb2wgPSBudWxsXG4gIGxldCBsYXN0Um93ID0gbnVsbFxuXG4gIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHNpemU7IHJvdysrKSB7XG4gICAgc2FtZUNvdW50Q29sID0gc2FtZUNvdW50Um93ID0gMFxuICAgIGxhc3RDb2wgPSBsYXN0Um93ID0gbnVsbFxuXG4gICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgc2l6ZTsgY29sKyspIHtcbiAgICAgIGxldCBtb2R1bGUgPSBkYXRhLmdldChyb3csIGNvbClcbiAgICAgIGlmIChtb2R1bGUgPT09IGxhc3RDb2wpIHtcbiAgICAgICAgc2FtZUNvdW50Q29sKytcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzYW1lQ291bnRDb2wgPj0gNSkgcG9pbnRzICs9IFBlbmFsdHlTY29yZXMuTjEgKyAoc2FtZUNvdW50Q29sIC0gNSlcbiAgICAgICAgbGFzdENvbCA9IG1vZHVsZVxuICAgICAgICBzYW1lQ291bnRDb2wgPSAxXG4gICAgICB9XG5cbiAgICAgIG1vZHVsZSA9IGRhdGEuZ2V0KGNvbCwgcm93KVxuICAgICAgaWYgKG1vZHVsZSA9PT0gbGFzdFJvdykge1xuICAgICAgICBzYW1lQ291bnRSb3crK1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNhbWVDb3VudFJvdyA+PSA1KSBwb2ludHMgKz0gUGVuYWx0eVNjb3Jlcy5OMSArIChzYW1lQ291bnRSb3cgLSA1KVxuICAgICAgICBsYXN0Um93ID0gbW9kdWxlXG4gICAgICAgIHNhbWVDb3VudFJvdyA9IDFcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2FtZUNvdW50Q29sID49IDUpIHBvaW50cyArPSBQZW5hbHR5U2NvcmVzLk4xICsgKHNhbWVDb3VudENvbCAtIDUpXG4gICAgaWYgKHNhbWVDb3VudFJvdyA+PSA1KSBwb2ludHMgKz0gUGVuYWx0eVNjb3Jlcy5OMSArIChzYW1lQ291bnRSb3cgLSA1KVxuICB9XG5cbiAgcmV0dXJuIHBvaW50c1xufVxuXG4vKipcbiAqIEZpbmQgMngyIGJsb2NrcyB3aXRoIHRoZSBzYW1lIGNvbG9yIGFuZCBhc3NpZ24gYSBwZW5hbHR5IHZhbHVlXG4gKlxuICogUG9pbnRzOiBOMiAqIChtIC0gMSkgKiAobiAtIDEpXG4gKi9cbmV4cG9ydHMuZ2V0UGVuYWx0eU4yID0gZnVuY3Rpb24gZ2V0UGVuYWx0eU4yIChkYXRhKSB7XG4gIGNvbnN0IHNpemUgPSBkYXRhLnNpemVcbiAgbGV0IHBvaW50cyA9IDBcblxuICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBzaXplIC0gMTsgcm93KyspIHtcbiAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBzaXplIC0gMTsgY29sKyspIHtcbiAgICAgIGNvbnN0IGxhc3QgPSBkYXRhLmdldChyb3csIGNvbCkgK1xuICAgICAgICBkYXRhLmdldChyb3csIGNvbCArIDEpICtcbiAgICAgICAgZGF0YS5nZXQocm93ICsgMSwgY29sKSArXG4gICAgICAgIGRhdGEuZ2V0KHJvdyArIDEsIGNvbCArIDEpXG5cbiAgICAgIGlmIChsYXN0ID09PSA0IHx8IGxhc3QgPT09IDApIHBvaW50cysrXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBvaW50cyAqIFBlbmFsdHlTY29yZXMuTjJcbn1cblxuLyoqXG4gKiBGaW5kIDE6MTozOjE6MSByYXRpbyAoZGFyazpsaWdodDpkYXJrOmxpZ2h0OmRhcmspIHBhdHRlcm4gaW4gcm93L2NvbHVtbixcbiAqIHByZWNlZGVkIG9yIGZvbGxvd2VkIGJ5IGxpZ2h0IGFyZWEgNCBtb2R1bGVzIHdpZGVcbiAqXG4gKiBQb2ludHM6IE4zICogbnVtYmVyIG9mIHBhdHRlcm4gZm91bmRcbiAqL1xuZXhwb3J0cy5nZXRQZW5hbHR5TjMgPSBmdW5jdGlvbiBnZXRQZW5hbHR5TjMgKGRhdGEpIHtcbiAgY29uc3Qgc2l6ZSA9IGRhdGEuc2l6ZVxuICBsZXQgcG9pbnRzID0gMFxuICBsZXQgYml0c0NvbCA9IDBcbiAgbGV0IGJpdHNSb3cgPSAwXG5cbiAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgc2l6ZTsgcm93KyspIHtcbiAgICBiaXRzQ29sID0gYml0c1JvdyA9IDBcbiAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBzaXplOyBjb2wrKykge1xuICAgICAgYml0c0NvbCA9ICgoYml0c0NvbCA8PCAxKSAmIDB4N0ZGKSB8IGRhdGEuZ2V0KHJvdywgY29sKVxuICAgICAgaWYgKGNvbCA+PSAxMCAmJiAoYml0c0NvbCA9PT0gMHg1RDAgfHwgYml0c0NvbCA9PT0gMHgwNUQpKSBwb2ludHMrK1xuXG4gICAgICBiaXRzUm93ID0gKChiaXRzUm93IDw8IDEpICYgMHg3RkYpIHwgZGF0YS5nZXQoY29sLCByb3cpXG4gICAgICBpZiAoY29sID49IDEwICYmIChiaXRzUm93ID09PSAweDVEMCB8fCBiaXRzUm93ID09PSAweDA1RCkpIHBvaW50cysrXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBvaW50cyAqIFBlbmFsdHlTY29yZXMuTjNcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgcHJvcG9ydGlvbiBvZiBkYXJrIG1vZHVsZXMgaW4gZW50aXJlIHN5bWJvbFxuICpcbiAqIFBvaW50czogTjQgKiBrXG4gKlxuICogayBpcyB0aGUgcmF0aW5nIG9mIHRoZSBkZXZpYXRpb24gb2YgdGhlIHByb3BvcnRpb24gb2YgZGFyayBtb2R1bGVzXG4gKiBpbiB0aGUgc3ltYm9sIGZyb20gNTAlIGluIHN0ZXBzIG9mIDUlXG4gKi9cbmV4cG9ydHMuZ2V0UGVuYWx0eU40ID0gZnVuY3Rpb24gZ2V0UGVuYWx0eU40IChkYXRhKSB7XG4gIGxldCBkYXJrQ291bnQgPSAwXG4gIGNvbnN0IG1vZHVsZXNDb3VudCA9IGRhdGEuZGF0YS5sZW5ndGhcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IG1vZHVsZXNDb3VudDsgaSsrKSBkYXJrQ291bnQgKz0gZGF0YS5kYXRhW2ldXG5cbiAgY29uc3QgayA9IE1hdGguYWJzKE1hdGguY2VpbCgoZGFya0NvdW50ICogMTAwIC8gbW9kdWxlc0NvdW50KSAvIDUpIC0gMTApXG5cbiAgcmV0dXJuIGsgKiBQZW5hbHR5U2NvcmVzLk40XG59XG5cbi8qKlxuICogUmV0dXJuIG1hc2sgdmFsdWUgYXQgZ2l2ZW4gcG9zaXRpb25cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG1hc2tQYXR0ZXJuIFBhdHRlcm4gcmVmZXJlbmNlIHZhbHVlXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGkgICAgICAgICAgIFJvd1xuICogQHBhcmFtICB7TnVtYmVyfSBqICAgICAgICAgICBDb2x1bW5cbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgICAgTWFzayB2YWx1ZVxuICovXG5mdW5jdGlvbiBnZXRNYXNrQXQgKG1hc2tQYXR0ZXJuLCBpLCBqKSB7XG4gIHN3aXRjaCAobWFza1BhdHRlcm4pIHtcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjAwMDogcmV0dXJuIChpICsgaikgJSAyID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4wMDE6IHJldHVybiBpICUgMiA9PT0gMFxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMDEwOiByZXR1cm4gaiAlIDMgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjAxMTogcmV0dXJuIChpICsgaikgJSAzID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4xMDA6IHJldHVybiAoTWF0aC5mbG9vcihpIC8gMikgKyBNYXRoLmZsb29yKGogLyAzKSkgJSAyID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4xMDE6IHJldHVybiAoaSAqIGopICUgMiArIChpICogaikgJSAzID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4xMTA6IHJldHVybiAoKGkgKiBqKSAlIDIgKyAoaSAqIGopICUgMykgJSAyID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4xMTE6IHJldHVybiAoKGkgKiBqKSAlIDMgKyAoaSArIGopICUgMikgJSAyID09PSAwXG5cbiAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBtYXNrUGF0dGVybjonICsgbWFza1BhdHRlcm4pXG4gIH1cbn1cblxuLyoqXG4gKiBBcHBseSBhIG1hc2sgcGF0dGVybiB0byBhIEJpdE1hdHJpeFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gICAgcGF0dGVybiBQYXR0ZXJuIHJlZmVyZW5jZSBudW1iZXJcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gZGF0YSAgICBCaXRNYXRyaXggZGF0YVxuICovXG5leHBvcnRzLmFwcGx5TWFzayA9IGZ1bmN0aW9uIGFwcGx5TWFzayAocGF0dGVybiwgZGF0YSkge1xuICBjb25zdCBzaXplID0gZGF0YS5zaXplXG5cbiAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgc2l6ZTsgY29sKyspIHtcbiAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBzaXplOyByb3crKykge1xuICAgICAgaWYgKGRhdGEuaXNSZXNlcnZlZChyb3csIGNvbCkpIGNvbnRpbnVlXG4gICAgICBkYXRhLnhvcihyb3csIGNvbCwgZ2V0TWFza0F0KHBhdHRlcm4sIHJvdywgY29sKSlcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBiZXN0IG1hc2sgcGF0dGVybiBmb3IgZGF0YVxuICpcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gZGF0YVxuICogQHJldHVybiB7TnVtYmVyfSBNYXNrIHBhdHRlcm4gcmVmZXJlbmNlIG51bWJlclxuICovXG5leHBvcnRzLmdldEJlc3RNYXNrID0gZnVuY3Rpb24gZ2V0QmVzdE1hc2sgKGRhdGEsIHNldHVwRm9ybWF0RnVuYykge1xuICBjb25zdCBudW1QYXR0ZXJucyA9IE9iamVjdC5rZXlzKGV4cG9ydHMuUGF0dGVybnMpLmxlbmd0aFxuICBsZXQgYmVzdFBhdHRlcm4gPSAwXG4gIGxldCBsb3dlclBlbmFsdHkgPSBJbmZpbml0eVxuXG4gIGZvciAobGV0IHAgPSAwOyBwIDwgbnVtUGF0dGVybnM7IHArKykge1xuICAgIHNldHVwRm9ybWF0RnVuYyhwKVxuICAgIGV4cG9ydHMuYXBwbHlNYXNrKHAsIGRhdGEpXG5cbiAgICAvLyBDYWxjdWxhdGUgcGVuYWx0eVxuICAgIGNvbnN0IHBlbmFsdHkgPVxuICAgICAgZXhwb3J0cy5nZXRQZW5hbHR5TjEoZGF0YSkgK1xuICAgICAgZXhwb3J0cy5nZXRQZW5hbHR5TjIoZGF0YSkgK1xuICAgICAgZXhwb3J0cy5nZXRQZW5hbHR5TjMoZGF0YSkgK1xuICAgICAgZXhwb3J0cy5nZXRQZW5hbHR5TjQoZGF0YSlcblxuICAgIC8vIFVuZG8gcHJldmlvdXNseSBhcHBsaWVkIG1hc2tcbiAgICBleHBvcnRzLmFwcGx5TWFzayhwLCBkYXRhKVxuXG4gICAgaWYgKHBlbmFsdHkgPCBsb3dlclBlbmFsdHkpIHtcbiAgICAgIGxvd2VyUGVuYWx0eSA9IHBlbmFsdHlcbiAgICAgIGJlc3RQYXR0ZXJuID0gcFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBiZXN0UGF0dGVyblxufVxuIiwgImNvbnN0IEVDTGV2ZWwgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tbGV2ZWwnKVxyXG5cclxuY29uc3QgRUNfQkxPQ0tTX1RBQkxFID0gW1xyXG4vLyBMICBNICBRICBIXHJcbiAgMSwgMSwgMSwgMSxcclxuICAxLCAxLCAxLCAxLFxyXG4gIDEsIDEsIDIsIDIsXHJcbiAgMSwgMiwgMiwgNCxcclxuICAxLCAyLCA0LCA0LFxyXG4gIDIsIDQsIDQsIDQsXHJcbiAgMiwgNCwgNiwgNSxcclxuICAyLCA0LCA2LCA2LFxyXG4gIDIsIDUsIDgsIDgsXHJcbiAgNCwgNSwgOCwgOCxcclxuICA0LCA1LCA4LCAxMSxcclxuICA0LCA4LCAxMCwgMTEsXHJcbiAgNCwgOSwgMTIsIDE2LFxyXG4gIDQsIDksIDE2LCAxNixcclxuICA2LCAxMCwgMTIsIDE4LFxyXG4gIDYsIDEwLCAxNywgMTYsXHJcbiAgNiwgMTEsIDE2LCAxOSxcclxuICA2LCAxMywgMTgsIDIxLFxyXG4gIDcsIDE0LCAyMSwgMjUsXHJcbiAgOCwgMTYsIDIwLCAyNSxcclxuICA4LCAxNywgMjMsIDI1LFxyXG4gIDksIDE3LCAyMywgMzQsXHJcbiAgOSwgMTgsIDI1LCAzMCxcclxuICAxMCwgMjAsIDI3LCAzMixcclxuICAxMiwgMjEsIDI5LCAzNSxcclxuICAxMiwgMjMsIDM0LCAzNyxcclxuICAxMiwgMjUsIDM0LCA0MCxcclxuICAxMywgMjYsIDM1LCA0MixcclxuICAxNCwgMjgsIDM4LCA0NSxcclxuICAxNSwgMjksIDQwLCA0OCxcclxuICAxNiwgMzEsIDQzLCA1MSxcclxuICAxNywgMzMsIDQ1LCA1NCxcclxuICAxOCwgMzUsIDQ4LCA1NyxcclxuICAxOSwgMzcsIDUxLCA2MCxcclxuICAxOSwgMzgsIDUzLCA2MyxcclxuICAyMCwgNDAsIDU2LCA2NixcclxuICAyMSwgNDMsIDU5LCA3MCxcclxuICAyMiwgNDUsIDYyLCA3NCxcclxuICAyNCwgNDcsIDY1LCA3NyxcclxuICAyNSwgNDksIDY4LCA4MVxyXG5dXHJcblxyXG5jb25zdCBFQ19DT0RFV09SRFNfVEFCTEUgPSBbXHJcbi8vIEwgIE0gIFEgIEhcclxuICA3LCAxMCwgMTMsIDE3LFxyXG4gIDEwLCAxNiwgMjIsIDI4LFxyXG4gIDE1LCAyNiwgMzYsIDQ0LFxyXG4gIDIwLCAzNiwgNTIsIDY0LFxyXG4gIDI2LCA0OCwgNzIsIDg4LFxyXG4gIDM2LCA2NCwgOTYsIDExMixcclxuICA0MCwgNzIsIDEwOCwgMTMwLFxyXG4gIDQ4LCA4OCwgMTMyLCAxNTYsXHJcbiAgNjAsIDExMCwgMTYwLCAxOTIsXHJcbiAgNzIsIDEzMCwgMTkyLCAyMjQsXHJcbiAgODAsIDE1MCwgMjI0LCAyNjQsXHJcbiAgOTYsIDE3NiwgMjYwLCAzMDgsXHJcbiAgMTA0LCAxOTgsIDI4OCwgMzUyLFxyXG4gIDEyMCwgMjE2LCAzMjAsIDM4NCxcclxuICAxMzIsIDI0MCwgMzYwLCA0MzIsXHJcbiAgMTQ0LCAyODAsIDQwOCwgNDgwLFxyXG4gIDE2OCwgMzA4LCA0NDgsIDUzMixcclxuICAxODAsIDMzOCwgNTA0LCA1ODgsXHJcbiAgMTk2LCAzNjQsIDU0NiwgNjUwLFxyXG4gIDIyNCwgNDE2LCA2MDAsIDcwMCxcclxuICAyMjQsIDQ0MiwgNjQ0LCA3NTAsXHJcbiAgMjUyLCA0NzYsIDY5MCwgODE2LFxyXG4gIDI3MCwgNTA0LCA3NTAsIDkwMCxcclxuICAzMDAsIDU2MCwgODEwLCA5NjAsXHJcbiAgMzEyLCA1ODgsIDg3MCwgMTA1MCxcclxuICAzMzYsIDY0NCwgOTUyLCAxMTEwLFxyXG4gIDM2MCwgNzAwLCAxMDIwLCAxMjAwLFxyXG4gIDM5MCwgNzI4LCAxMDUwLCAxMjYwLFxyXG4gIDQyMCwgNzg0LCAxMTQwLCAxMzUwLFxyXG4gIDQ1MCwgODEyLCAxMjAwLCAxNDQwLFxyXG4gIDQ4MCwgODY4LCAxMjkwLCAxNTMwLFxyXG4gIDUxMCwgOTI0LCAxMzUwLCAxNjIwLFxyXG4gIDU0MCwgOTgwLCAxNDQwLCAxNzEwLFxyXG4gIDU3MCwgMTAzNiwgMTUzMCwgMTgwMCxcclxuICA1NzAsIDEwNjQsIDE1OTAsIDE4OTAsXHJcbiAgNjAwLCAxMTIwLCAxNjgwLCAxOTgwLFxyXG4gIDYzMCwgMTIwNCwgMTc3MCwgMjEwMCxcclxuICA2NjAsIDEyNjAsIDE4NjAsIDIyMjAsXHJcbiAgNzIwLCAxMzE2LCAxOTUwLCAyMzEwLFxyXG4gIDc1MCwgMTM3MiwgMjA0MCwgMjQzMFxyXG5dXHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gYmxvY2sgdGhhdCB0aGUgUVIgQ29kZSBzaG91bGQgY29udGFpblxyXG4gKiBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uIGFuZCBlcnJvciBjb3JyZWN0aW9uIGxldmVsLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgICBOdW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBibG9ja3NcclxuICovXHJcbmV4cG9ydHMuZ2V0QmxvY2tzQ291bnQgPSBmdW5jdGlvbiBnZXRCbG9ja3NDb3VudCAodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcclxuICBzd2l0Y2ggKGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgICBjYXNlIEVDTGV2ZWwuTDpcclxuICAgICAgcmV0dXJuIEVDX0JMT0NLU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDBdXHJcbiAgICBjYXNlIEVDTGV2ZWwuTTpcclxuICAgICAgcmV0dXJuIEVDX0JMT0NLU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDFdXHJcbiAgICBjYXNlIEVDTGV2ZWwuUTpcclxuICAgICAgcmV0dXJuIEVDX0JMT0NLU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDJdXHJcbiAgICBjYXNlIEVDTGV2ZWwuSDpcclxuICAgICAgcmV0dXJuIEVDX0JMT0NLU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDNdXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzIHRvIHVzZSBmb3IgdGhlIHNwZWNpZmllZFxyXG4gKiB2ZXJzaW9uIGFuZCBlcnJvciBjb3JyZWN0aW9uIGxldmVsLlxyXG4gKlxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgICAgICAgICAgICBOdW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHNcclxuICovXHJcbmV4cG9ydHMuZ2V0VG90YWxDb2Rld29yZHNDb3VudCA9IGZ1bmN0aW9uIGdldFRvdGFsQ29kZXdvcmRzQ291bnQgKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgc3dpdGNoIChlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xyXG4gICAgY2FzZSBFQ0xldmVsLkw6XHJcbiAgICAgIHJldHVybiBFQ19DT0RFV09SRFNfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAwXVxyXG4gICAgY2FzZSBFQ0xldmVsLk06XHJcbiAgICAgIHJldHVybiBFQ19DT0RFV09SRFNfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAxXVxyXG4gICAgY2FzZSBFQ0xldmVsLlE6XHJcbiAgICAgIHJldHVybiBFQ19DT0RFV09SRFNfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAyXVxyXG4gICAgY2FzZSBFQ0xldmVsLkg6XHJcbiAgICAgIHJldHVybiBFQ19DT0RFV09SRFNfVEFCTEVbKHZlcnNpb24gLSAxKSAqIDQgKyAzXVxyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gIH1cclxufVxyXG4iLCAiY29uc3QgRVhQX1RBQkxFID0gbmV3IFVpbnQ4QXJyYXkoNTEyKVxuY29uc3QgTE9HX1RBQkxFID0gbmV3IFVpbnQ4QXJyYXkoMjU2KVxuLyoqXG4gKiBQcmVjb21wdXRlIHRoZSBsb2cgYW5kIGFudGktbG9nIHRhYmxlcyBmb3IgZmFzdGVyIGNvbXB1dGF0aW9uIGxhdGVyXG4gKlxuICogRm9yIGVhY2ggcG9zc2libGUgdmFsdWUgaW4gdGhlIGdhbG9pcyBmaWVsZCAyXjgsIHdlIHdpbGwgcHJlLWNvbXB1dGVcbiAqIHRoZSBsb2dhcml0aG0gYW5kIGFudGktbG9nYXJpdGhtIChleHBvbmVudGlhbCkgb2YgdGhpcyB2YWx1ZVxuICpcbiAqIHJlZiB7QGxpbmsgaHR0cHM6Ly9lbi53aWtpdmVyc2l0eS5vcmcvd2lraS9SZWVkJUUyJTgwJTkzU29sb21vbl9jb2Rlc19mb3JfY29kZXJzI0ludHJvZHVjdGlvbl90b19tYXRoZW1hdGljYWxfZmllbGRzfVxuICovXG47KGZ1bmN0aW9uIGluaXRUYWJsZXMgKCkge1xuICBsZXQgeCA9IDFcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAyNTU7IGkrKykge1xuICAgIEVYUF9UQUJMRVtpXSA9IHhcbiAgICBMT0dfVEFCTEVbeF0gPSBpXG5cbiAgICB4IDw8PSAxIC8vIG11bHRpcGx5IGJ5IDJcblxuICAgIC8vIFRoZSBRUiBjb2RlIHNwZWNpZmljYXRpb24gc2F5cyB0byB1c2UgYnl0ZS13aXNlIG1vZHVsbyAxMDAwMTExMDEgYXJpdGhtZXRpYy5cbiAgICAvLyBUaGlzIG1lYW5zIHRoYXQgd2hlbiBhIG51bWJlciBpcyAyNTYgb3IgbGFyZ2VyLCBpdCBzaG91bGQgYmUgWE9SZWQgd2l0aCAweDExRC5cbiAgICBpZiAoeCAmIDB4MTAwKSB7IC8vIHNpbWlsYXIgdG8geCA+PSAyNTYsIGJ1dCBhIGxvdCBmYXN0ZXIgKGJlY2F1c2UgMHgxMDAgPT0gMjU2KVxuICAgICAgeCBePSAweDExRFxuICAgIH1cbiAgfVxuXG4gIC8vIE9wdGltaXphdGlvbjogZG91YmxlIHRoZSBzaXplIG9mIHRoZSBhbnRpLWxvZyB0YWJsZSBzbyB0aGF0IHdlIGRvbid0IG5lZWQgdG8gbW9kIDI1NSB0b1xuICAvLyBzdGF5IGluc2lkZSB0aGUgYm91bmRzIChiZWNhdXNlIHdlIHdpbGwgbWFpbmx5IHVzZSB0aGlzIHRhYmxlIGZvciB0aGUgbXVsdGlwbGljYXRpb24gb2ZcbiAgLy8gdHdvIEdGIG51bWJlcnMsIG5vIG1vcmUpLlxuICAvLyBAc2VlIHtAbGluayBtdWx9XG4gIGZvciAobGV0IGkgPSAyNTU7IGkgPCA1MTI7IGkrKykge1xuICAgIEVYUF9UQUJMRVtpXSA9IEVYUF9UQUJMRVtpIC0gMjU1XVxuICB9XG59KCkpXG5cbi8qKlxuICogUmV0dXJucyBsb2cgdmFsdWUgb2YgbiBpbnNpZGUgR2Fsb2lzIEZpZWxkXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmV4cG9ydHMubG9nID0gZnVuY3Rpb24gbG9nIChuKSB7XG4gIGlmIChuIDwgMSkgdGhyb3cgbmV3IEVycm9yKCdsb2coJyArIG4gKyAnKScpXG4gIHJldHVybiBMT0dfVEFCTEVbbl1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFudGktbG9nIHZhbHVlIG9mIG4gaW5zaWRlIEdhbG9pcyBGaWVsZFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gblxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5leHBvcnRzLmV4cCA9IGZ1bmN0aW9uIGV4cCAobikge1xuICByZXR1cm4gRVhQX1RBQkxFW25dXG59XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbnVtYmVyIGluc2lkZSBHYWxvaXMgRmllbGRcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHhcbiAqIEBwYXJhbSAge051bWJlcn0geVxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5leHBvcnRzLm11bCA9IGZ1bmN0aW9uIG11bCAoeCwgeSkge1xuICBpZiAoeCA9PT0gMCB8fCB5ID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIHNob3VsZCBiZSBFWFBfVEFCTEVbKExPR19UQUJMRVt4XSArIExPR19UQUJMRVt5XSkgJSAyNTVdIGlmIEVYUF9UQUJMRSB3YXNuJ3Qgb3ZlcnNpemVkXG4gIC8vIEBzZWUge0BsaW5rIGluaXRUYWJsZXN9XG4gIHJldHVybiBFWFBfVEFCTEVbTE9HX1RBQkxFW3hdICsgTE9HX1RBQkxFW3ldXVxufVxuIiwgImNvbnN0IEdGID0gcmVxdWlyZSgnLi9nYWxvaXMtZmllbGQnKVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHBvbHlub21pYWxzIGluc2lkZSBHYWxvaXMgRmllbGRcbiAqXG4gKiBAcGFyYW0gIHtVaW50OEFycmF5fSBwMSBQb2x5bm9taWFsXG4gKiBAcGFyYW0gIHtVaW50OEFycmF5fSBwMiBQb2x5bm9taWFsXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICBQcm9kdWN0IG9mIHAxIGFuZCBwMlxuICovXG5leHBvcnRzLm11bCA9IGZ1bmN0aW9uIG11bCAocDEsIHAyKSB7XG4gIGNvbnN0IGNvZWZmID0gbmV3IFVpbnQ4QXJyYXkocDEubGVuZ3RoICsgcDIubGVuZ3RoIC0gMSlcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHAxLmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBwMi5sZW5ndGg7IGorKykge1xuICAgICAgY29lZmZbaSArIGpdIF49IEdGLm11bChwMVtpXSwgcDJbal0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvZWZmXG59XG5cbi8qKlxuICogQ2FsY3VsYXRlIHRoZSByZW1haW5kZXIgb2YgcG9seW5vbWlhbHMgZGl2aXNpb25cbiAqXG4gKiBAcGFyYW0gIHtVaW50OEFycmF5fSBkaXZpZGVudCBQb2x5bm9taWFsXG4gKiBAcGFyYW0gIHtVaW50OEFycmF5fSBkaXZpc29yICBQb2x5bm9taWFsXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICAgICAgICBSZW1haW5kZXJcbiAqL1xuZXhwb3J0cy5tb2QgPSBmdW5jdGlvbiBtb2QgKGRpdmlkZW50LCBkaXZpc29yKSB7XG4gIGxldCByZXN1bHQgPSBuZXcgVWludDhBcnJheShkaXZpZGVudClcblxuICB3aGlsZSAoKHJlc3VsdC5sZW5ndGggLSBkaXZpc29yLmxlbmd0aCkgPj0gMCkge1xuICAgIGNvbnN0IGNvZWZmID0gcmVzdWx0WzBdXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpdmlzb3IubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFtpXSBePSBHRi5tdWwoZGl2aXNvcltpXSwgY29lZmYpXG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGFsbCB6ZXJvcyBmcm9tIGJ1ZmZlciBoZWFkXG4gICAgbGV0IG9mZnNldCA9IDBcbiAgICB3aGlsZSAob2Zmc2V0IDwgcmVzdWx0Lmxlbmd0aCAmJiByZXN1bHRbb2Zmc2V0XSA9PT0gMCkgb2Zmc2V0KytcbiAgICByZXN1bHQgPSByZXN1bHQuc2xpY2Uob2Zmc2V0KVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG4vKipcbiAqIEdlbmVyYXRlIGFuIGlycmVkdWNpYmxlIGdlbmVyYXRvciBwb2x5bm9taWFsIG9mIHNwZWNpZmllZCBkZWdyZWVcbiAqICh1c2VkIGJ5IFJlZWQtU29sb21vbiBlbmNvZGVyKVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gZGVncmVlIERlZ3JlZSBvZiB0aGUgZ2VuZXJhdG9yIHBvbHlub21pYWxcbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9ICAgIEJ1ZmZlciBjb250YWluaW5nIHBvbHlub21pYWwgY29lZmZpY2llbnRzXG4gKi9cbmV4cG9ydHMuZ2VuZXJhdGVFQ1BvbHlub21pYWwgPSBmdW5jdGlvbiBnZW5lcmF0ZUVDUG9seW5vbWlhbCAoZGVncmVlKSB7XG4gIGxldCBwb2x5ID0gbmV3IFVpbnQ4QXJyYXkoWzFdKVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRlZ3JlZTsgaSsrKSB7XG4gICAgcG9seSA9IGV4cG9ydHMubXVsKHBvbHksIG5ldyBVaW50OEFycmF5KFsxLCBHRi5leHAoaSldKSlcbiAgfVxuXG4gIHJldHVybiBwb2x5XG59XG4iLCAiY29uc3QgUG9seW5vbWlhbCA9IHJlcXVpcmUoJy4vcG9seW5vbWlhbCcpXG5cbmZ1bmN0aW9uIFJlZWRTb2xvbW9uRW5jb2RlciAoZGVncmVlKSB7XG4gIHRoaXMuZ2VuUG9seSA9IHVuZGVmaW5lZFxuICB0aGlzLmRlZ3JlZSA9IGRlZ3JlZVxuXG4gIGlmICh0aGlzLmRlZ3JlZSkgdGhpcy5pbml0aWFsaXplKHRoaXMuZGVncmVlKVxufVxuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIGVuY29kZXIuXG4gKiBUaGUgaW5wdXQgcGFyYW0gc2hvdWxkIGNvcnJlc3BvbmQgdG8gdGhlIG51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3Jkcy5cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGRlZ3JlZVxuICovXG5SZWVkU29sb21vbkVuY29kZXIucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbiBpbml0aWFsaXplIChkZWdyZWUpIHtcbiAgLy8gY3JlYXRlIGFuIGlycmVkdWNpYmxlIGdlbmVyYXRvciBwb2x5bm9taWFsXG4gIHRoaXMuZGVncmVlID0gZGVncmVlXG4gIHRoaXMuZ2VuUG9seSA9IFBvbHlub21pYWwuZ2VuZXJhdGVFQ1BvbHlub21pYWwodGhpcy5kZWdyZWUpXG59XG5cbi8qKlxuICogRW5jb2RlcyBhIGNodW5rIG9mIGRhdGFcbiAqXG4gKiBAcGFyYW0gIHtVaW50OEFycmF5fSBkYXRhIEJ1ZmZlciBjb250YWluaW5nIGlucHV0IGRhdGFcbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9ICAgICAgQnVmZmVyIGNvbnRhaW5pbmcgZW5jb2RlZCBkYXRhXG4gKi9cblJlZWRTb2xvbW9uRW5jb2Rlci5wcm90b3R5cGUuZW5jb2RlID0gZnVuY3Rpb24gZW5jb2RlIChkYXRhKSB7XG4gIGlmICghdGhpcy5nZW5Qb2x5KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFbmNvZGVyIG5vdCBpbml0aWFsaXplZCcpXG4gIH1cblxuICAvLyBDYWxjdWxhdGUgRUMgZm9yIHRoaXMgZGF0YSBibG9ja1xuICAvLyBleHRlbmRzIGRhdGEgc2l6ZSB0byBkYXRhK2dlblBvbHkgc2l6ZVxuICBjb25zdCBwYWRkZWREYXRhID0gbmV3IFVpbnQ4QXJyYXkoZGF0YS5sZW5ndGggKyB0aGlzLmRlZ3JlZSlcbiAgcGFkZGVkRGF0YS5zZXQoZGF0YSlcblxuICAvLyBUaGUgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHMgYXJlIHRoZSByZW1haW5kZXIgYWZ0ZXIgZGl2aWRpbmcgdGhlIGRhdGEgY29kZXdvcmRzXG4gIC8vIGJ5IGEgZ2VuZXJhdG9yIHBvbHlub21pYWxcbiAgY29uc3QgcmVtYWluZGVyID0gUG9seW5vbWlhbC5tb2QocGFkZGVkRGF0YSwgdGhpcy5nZW5Qb2x5KVxuXG4gIC8vIHJldHVybiBFQyBkYXRhIGJsb2NrcyAobGFzdCBuIGJ5dGUsIHdoZXJlIG4gaXMgdGhlIGRlZ3JlZSBvZiBnZW5Qb2x5KVxuICAvLyBJZiBjb2VmZmljaWVudHMgbnVtYmVyIGluIHJlbWFpbmRlciBhcmUgbGVzcyB0aGFuIGdlblBvbHkgZGVncmVlLFxuICAvLyBwYWQgd2l0aCAwcyB0byB0aGUgbGVmdCB0byByZWFjaCB0aGUgbmVlZGVkIG51bWJlciBvZiBjb2VmZmljaWVudHNcbiAgY29uc3Qgc3RhcnQgPSB0aGlzLmRlZ3JlZSAtIHJlbWFpbmRlci5sZW5ndGhcbiAgaWYgKHN0YXJ0ID4gMCkge1xuICAgIGNvbnN0IGJ1ZmYgPSBuZXcgVWludDhBcnJheSh0aGlzLmRlZ3JlZSlcbiAgICBidWZmLnNldChyZW1haW5kZXIsIHN0YXJ0KVxuXG4gICAgcmV0dXJuIGJ1ZmZcbiAgfVxuXG4gIHJldHVybiByZW1haW5kZXJcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZWVkU29sb21vbkVuY29kZXJcbiIsICIvKipcbiAqIENoZWNrIGlmIFFSIENvZGUgdmVyc2lvbiBpcyB2YWxpZFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gIHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtCb29sZWFufSAgICAgICAgIHRydWUgaWYgdmFsaWQgdmVyc2lvbiwgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydHMuaXNWYWxpZCA9IGZ1bmN0aW9uIGlzVmFsaWQgKHZlcnNpb24pIHtcbiAgcmV0dXJuICFpc05hTih2ZXJzaW9uKSAmJiB2ZXJzaW9uID49IDEgJiYgdmVyc2lvbiA8PSA0MFxufVxuIiwgImNvbnN0IG51bWVyaWMgPSAnWzAtOV0rJ1xuY29uc3QgYWxwaGFudW1lcmljID0gJ1tBLVogJCUqK1xcXFwtLi86XSsnXG5sZXQga2FuamkgPSAnKD86W3UzMDAwLXUzMDNGXXxbdTMwNDAtdTMwOUZdfFt1MzBBMC11MzBGRl18JyArXG4gICdbdUZGMDAtdUZGRUZdfFt1NEUwMC11OUZBRl18W3UyNjA1LXUyNjA2XXxbdTIxOTAtdTIxOTVdfHUyMDNCfCcgK1xuICAnW3UyMDEwdTIwMTV1MjAxOHUyMDE5dTIwMjV1MjAyNnUyMDFDdTIwMUR1MjIyNXUyMjYwXXwnICtcbiAgJ1t1MDM5MS11MDQ1MV18W3UwMEE3dTAwQTh1MDBCMXUwMEI0dTAwRDd1MDBGN10pKydcbmthbmppID0ga2FuamkucmVwbGFjZSgvdS9nLCAnXFxcXHUnKVxuXG5jb25zdCBieXRlID0gJyg/Oig/IVtBLVowLTkgJCUqK1xcXFwtLi86XXwnICsga2FuamkgKyAnKSg/Oi58W1xcclxcbl0pKSsnXG5cbmV4cG9ydHMuS0FOSkkgPSBuZXcgUmVnRXhwKGthbmppLCAnZycpXG5leHBvcnRzLkJZVEVfS0FOSkkgPSBuZXcgUmVnRXhwKCdbXkEtWjAtOSAkJSorXFxcXC0uLzpdKycsICdnJylcbmV4cG9ydHMuQllURSA9IG5ldyBSZWdFeHAoYnl0ZSwgJ2cnKVxuZXhwb3J0cy5OVU1FUklDID0gbmV3IFJlZ0V4cChudW1lcmljLCAnZycpXG5leHBvcnRzLkFMUEhBTlVNRVJJQyA9IG5ldyBSZWdFeHAoYWxwaGFudW1lcmljLCAnZycpXG5cbmNvbnN0IFRFU1RfS0FOSkkgPSBuZXcgUmVnRXhwKCdeJyArIGthbmppICsgJyQnKVxuY29uc3QgVEVTVF9OVU1FUklDID0gbmV3IFJlZ0V4cCgnXicgKyBudW1lcmljICsgJyQnKVxuY29uc3QgVEVTVF9BTFBIQU5VTUVSSUMgPSBuZXcgUmVnRXhwKCdeW0EtWjAtOSAkJSorXFxcXC0uLzpdKyQnKVxuXG5leHBvcnRzLnRlc3RLYW5qaSA9IGZ1bmN0aW9uIHRlc3RLYW5qaSAoc3RyKSB7XG4gIHJldHVybiBURVNUX0tBTkpJLnRlc3Qoc3RyKVxufVxuXG5leHBvcnRzLnRlc3ROdW1lcmljID0gZnVuY3Rpb24gdGVzdE51bWVyaWMgKHN0cikge1xuICByZXR1cm4gVEVTVF9OVU1FUklDLnRlc3Qoc3RyKVxufVxuXG5leHBvcnRzLnRlc3RBbHBoYW51bWVyaWMgPSBmdW5jdGlvbiB0ZXN0QWxwaGFudW1lcmljIChzdHIpIHtcbiAgcmV0dXJuIFRFU1RfQUxQSEFOVU1FUklDLnRlc3Qoc3RyKVxufVxuIiwgImNvbnN0IFZlcnNpb25DaGVjayA9IHJlcXVpcmUoJy4vdmVyc2lvbi1jaGVjaycpXG5jb25zdCBSZWdleCA9IHJlcXVpcmUoJy4vcmVnZXgnKVxuXG4vKipcbiAqIE51bWVyaWMgbW9kZSBlbmNvZGVzIGRhdGEgZnJvbSB0aGUgZGVjaW1hbCBkaWdpdCBzZXQgKDAgLSA5KVxuICogKGJ5dGUgdmFsdWVzIDMwSEVYIHRvIDM5SEVYKS5cbiAqIE5vcm1hbGx5LCAzIGRhdGEgY2hhcmFjdGVycyBhcmUgcmVwcmVzZW50ZWQgYnkgMTAgYml0cy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnRzLk5VTUVSSUMgPSB7XG4gIGlkOiAnTnVtZXJpYycsXG4gIGJpdDogMSA8PCAwLFxuICBjY0JpdHM6IFsxMCwgMTIsIDE0XVxufVxuXG4vKipcbiAqIEFscGhhbnVtZXJpYyBtb2RlIGVuY29kZXMgZGF0YSBmcm9tIGEgc2V0IG9mIDQ1IGNoYXJhY3RlcnMsXG4gKiBpLmUuIDEwIG51bWVyaWMgZGlnaXRzICgwIC0gOSksXG4gKiAgICAgIDI2IGFscGhhYmV0aWMgY2hhcmFjdGVycyAoQSAtIFopLFxuICogICBhbmQgOSBzeW1ib2xzIChTUCwgJCwgJSwgKiwgKywgLSwgLiwgLywgOikuXG4gKiBOb3JtYWxseSwgdHdvIGlucHV0IGNoYXJhY3RlcnMgYXJlIHJlcHJlc2VudGVkIGJ5IDExIGJpdHMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuZXhwb3J0cy5BTFBIQU5VTUVSSUMgPSB7XG4gIGlkOiAnQWxwaGFudW1lcmljJyxcbiAgYml0OiAxIDw8IDEsXG4gIGNjQml0czogWzksIDExLCAxM11cbn1cblxuLyoqXG4gKiBJbiBieXRlIG1vZGUsIGRhdGEgaXMgZW5jb2RlZCBhdCA4IGJpdHMgcGVyIGNoYXJhY3Rlci5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnRzLkJZVEUgPSB7XG4gIGlkOiAnQnl0ZScsXG4gIGJpdDogMSA8PCAyLFxuICBjY0JpdHM6IFs4LCAxNiwgMTZdXG59XG5cbi8qKlxuICogVGhlIEthbmppIG1vZGUgZWZmaWNpZW50bHkgZW5jb2RlcyBLYW5qaSBjaGFyYWN0ZXJzIGluIGFjY29yZGFuY2Ugd2l0aFxuICogdGhlIFNoaWZ0IEpJUyBzeXN0ZW0gYmFzZWQgb24gSklTIFggMDIwOC5cbiAqIFRoZSBTaGlmdCBKSVMgdmFsdWVzIGFyZSBzaGlmdGVkIGZyb20gdGhlIEpJUyBYIDAyMDggdmFsdWVzLlxuICogSklTIFggMDIwOCBnaXZlcyBkZXRhaWxzIG9mIHRoZSBzaGlmdCBjb2RlZCByZXByZXNlbnRhdGlvbi5cbiAqIEVhY2ggdHdvLWJ5dGUgY2hhcmFjdGVyIHZhbHVlIGlzIGNvbXBhY3RlZCB0byBhIDEzLWJpdCBiaW5hcnkgY29kZXdvcmQuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuZXhwb3J0cy5LQU5KSSA9IHtcbiAgaWQ6ICdLYW5qaScsXG4gIGJpdDogMSA8PCAzLFxuICBjY0JpdHM6IFs4LCAxMCwgMTJdXG59XG5cbi8qKlxuICogTWl4ZWQgbW9kZSB3aWxsIGNvbnRhaW4gYSBzZXF1ZW5jZXMgb2YgZGF0YSBpbiBhIGNvbWJpbmF0aW9uIG9mIGFueSBvZlxuICogdGhlIG1vZGVzIGRlc2NyaWJlZCBhYm92ZVxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmV4cG9ydHMuTUlYRUQgPSB7XG4gIGJpdDogLTFcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgYml0cyBuZWVkZWQgdG8gc3RvcmUgdGhlIGRhdGEgbGVuZ3RoXG4gKiBhY2NvcmRpbmcgdG8gUVIgQ29kZSBzcGVjaWZpY2F0aW9ucy5cbiAqXG4gKiBAcGFyYW0gIHtNb2RlfSAgIG1vZGUgICAgRGF0YSBtb2RlXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgTnVtYmVyIG9mIGJpdHNcbiAqL1xuZXhwb3J0cy5nZXRDaGFyQ291bnRJbmRpY2F0b3IgPSBmdW5jdGlvbiBnZXRDaGFyQ291bnRJbmRpY2F0b3IgKG1vZGUsIHZlcnNpb24pIHtcbiAgaWYgKCFtb2RlLmNjQml0cykgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG1vZGU6ICcgKyBtb2RlKVxuXG4gIGlmICghVmVyc2lvbkNoZWNrLmlzVmFsaWQodmVyc2lvbikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdmVyc2lvbjogJyArIHZlcnNpb24pXG4gIH1cblxuICBpZiAodmVyc2lvbiA+PSAxICYmIHZlcnNpb24gPCAxMCkgcmV0dXJuIG1vZGUuY2NCaXRzWzBdXG4gIGVsc2UgaWYgKHZlcnNpb24gPCAyNykgcmV0dXJuIG1vZGUuY2NCaXRzWzFdXG4gIHJldHVybiBtb2RlLmNjQml0c1syXVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG1vc3QgZWZmaWNpZW50IG1vZGUgdG8gc3RvcmUgdGhlIHNwZWNpZmllZCBkYXRhXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBkYXRhU3RyIElucHV0IGRhdGEgc3RyaW5nXG4gKiBAcmV0dXJuIHtNb2RlfSAgICAgICAgICAgQmVzdCBtb2RlXG4gKi9cbmV4cG9ydHMuZ2V0QmVzdE1vZGVGb3JEYXRhID0gZnVuY3Rpb24gZ2V0QmVzdE1vZGVGb3JEYXRhIChkYXRhU3RyKSB7XG4gIGlmIChSZWdleC50ZXN0TnVtZXJpYyhkYXRhU3RyKSkgcmV0dXJuIGV4cG9ydHMuTlVNRVJJQ1xuICBlbHNlIGlmIChSZWdleC50ZXN0QWxwaGFudW1lcmljKGRhdGFTdHIpKSByZXR1cm4gZXhwb3J0cy5BTFBIQU5VTUVSSUNcbiAgZWxzZSBpZiAoUmVnZXgudGVzdEthbmppKGRhdGFTdHIpKSByZXR1cm4gZXhwb3J0cy5LQU5KSVxuICBlbHNlIHJldHVybiBleHBvcnRzLkJZVEVcbn1cblxuLyoqXG4gKiBSZXR1cm4gbW9kZSBuYW1lIGFzIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7TW9kZX0gbW9kZSBNb2RlIG9iamVjdFxuICogQHJldHVybnMge1N0cmluZ30gIE1vZGUgbmFtZVxuICovXG5leHBvcnRzLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcgKG1vZGUpIHtcbiAgaWYgKG1vZGUgJiYgbW9kZS5pZCkgcmV0dXJuIG1vZGUuaWRcbiAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG1vZGUnKVxufVxuXG4vKipcbiAqIENoZWNrIGlmIGlucHV0IHBhcmFtIGlzIGEgdmFsaWQgbW9kZSBvYmplY3RcbiAqXG4gKiBAcGFyYW0gICB7TW9kZX0gICAgbW9kZSBNb2RlIG9iamVjdFxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdmFsaWQgbW9kZSwgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydHMuaXNWYWxpZCA9IGZ1bmN0aW9uIGlzVmFsaWQgKG1vZGUpIHtcbiAgcmV0dXJuIG1vZGUgJiYgbW9kZS5iaXQgJiYgbW9kZS5jY0JpdHNcbn1cblxuLyoqXG4gKiBHZXQgbW9kZSBvYmplY3QgZnJvbSBpdHMgbmFtZVxuICpcbiAqIEBwYXJhbSAgIHtTdHJpbmd9IHN0cmluZyBNb2RlIG5hbWVcbiAqIEByZXR1cm5zIHtNb2RlfSAgICAgICAgICBNb2RlIG9iamVjdFxuICovXG5mdW5jdGlvbiBmcm9tU3RyaW5nIChzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQYXJhbSBpcyBub3QgYSBzdHJpbmcnKVxuICB9XG5cbiAgY29uc3QgbGNTdHIgPSBzdHJpbmcudG9Mb3dlckNhc2UoKVxuXG4gIHN3aXRjaCAobGNTdHIpIHtcbiAgICBjYXNlICdudW1lcmljJzpcbiAgICAgIHJldHVybiBleHBvcnRzLk5VTUVSSUNcbiAgICBjYXNlICdhbHBoYW51bWVyaWMnOlxuICAgICAgcmV0dXJuIGV4cG9ydHMuQUxQSEFOVU1FUklDXG4gICAgY2FzZSAna2FuamknOlxuICAgICAgcmV0dXJuIGV4cG9ydHMuS0FOSklcbiAgICBjYXNlICdieXRlJzpcbiAgICAgIHJldHVybiBleHBvcnRzLkJZVEVcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIG1vZGU6ICcgKyBzdHJpbmcpXG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIG1vZGUgZnJvbSBhIHZhbHVlLlxuICogSWYgdmFsdWUgaXMgbm90IGEgdmFsaWQgbW9kZSwgcmV0dXJucyBkZWZhdWx0VmFsdWVcbiAqXG4gKiBAcGFyYW0gIHtNb2RlfFN0cmluZ30gdmFsdWUgICAgICAgIEVuY29kaW5nIG1vZGVcbiAqIEBwYXJhbSAge01vZGV9ICAgICAgICBkZWZhdWx0VmFsdWUgRmFsbGJhY2sgdmFsdWVcbiAqIEByZXR1cm4ge01vZGV9ICAgICAgICAgICAgICAgICAgICAgRW5jb2RpbmcgbW9kZVxuICovXG5leHBvcnRzLmZyb20gPSBmdW5jdGlvbiBmcm9tICh2YWx1ZSwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmIChleHBvcnRzLmlzVmFsaWQodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBmcm9tU3RyaW5nKHZhbHVlKVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICB9XG59XG4iLCAiY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcbmNvbnN0IEVDQ29kZSA9IHJlcXVpcmUoJy4vZXJyb3ItY29ycmVjdGlvbi1jb2RlJylcbmNvbnN0IEVDTGV2ZWwgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tbGV2ZWwnKVxuY29uc3QgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG5jb25zdCBWZXJzaW9uQ2hlY2sgPSByZXF1aXJlKCcuL3ZlcnNpb24tY2hlY2snKVxuXG4vLyBHZW5lcmF0b3IgcG9seW5vbWlhbCB1c2VkIHRvIGVuY29kZSB2ZXJzaW9uIGluZm9ybWF0aW9uXG5jb25zdCBHMTggPSAoMSA8PCAxMikgfCAoMSA8PCAxMSkgfCAoMSA8PCAxMCkgfCAoMSA8PCA5KSB8ICgxIDw8IDgpIHwgKDEgPDwgNSkgfCAoMSA8PCAyKSB8ICgxIDw8IDApXG5jb25zdCBHMThfQkNIID0gVXRpbHMuZ2V0QkNIRGlnaXQoRzE4KVxuXG5mdW5jdGlvbiBnZXRCZXN0VmVyc2lvbkZvckRhdGFMZW5ndGggKG1vZGUsIGxlbmd0aCwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcbiAgZm9yIChsZXQgY3VycmVudFZlcnNpb24gPSAxOyBjdXJyZW50VmVyc2lvbiA8PSA0MDsgY3VycmVudFZlcnNpb24rKykge1xuICAgIGlmIChsZW5ndGggPD0gZXhwb3J0cy5nZXRDYXBhY2l0eShjdXJyZW50VmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1vZGUpKSB7XG4gICAgICByZXR1cm4gY3VycmVudFZlcnNpb25cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkXG59XG5cbmZ1bmN0aW9uIGdldFJlc2VydmVkQml0c0NvdW50IChtb2RlLCB2ZXJzaW9uKSB7XG4gIC8vIENoYXJhY3RlciBjb3VudCBpbmRpY2F0b3IgKyBtb2RlIGluZGljYXRvciBiaXRzXG4gIHJldHVybiBNb2RlLmdldENoYXJDb3VudEluZGljYXRvcihtb2RlLCB2ZXJzaW9uKSArIDRcbn1cblxuZnVuY3Rpb24gZ2V0VG90YWxCaXRzRnJvbURhdGFBcnJheSAoc2VnbWVudHMsIHZlcnNpb24pIHtcbiAgbGV0IHRvdGFsQml0cyA9IDBcblxuICBzZWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgY29uc3QgcmVzZXJ2ZWRCaXRzID0gZ2V0UmVzZXJ2ZWRCaXRzQ291bnQoZGF0YS5tb2RlLCB2ZXJzaW9uKVxuICAgIHRvdGFsQml0cyArPSByZXNlcnZlZEJpdHMgKyBkYXRhLmdldEJpdHNMZW5ndGgoKVxuICB9KVxuXG4gIHJldHVybiB0b3RhbEJpdHNcbn1cblxuZnVuY3Rpb24gZ2V0QmVzdFZlcnNpb25Gb3JNaXhlZERhdGEgKHNlZ21lbnRzLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xuICBmb3IgKGxldCBjdXJyZW50VmVyc2lvbiA9IDE7IGN1cnJlbnRWZXJzaW9uIDw9IDQwOyBjdXJyZW50VmVyc2lvbisrKSB7XG4gICAgY29uc3QgbGVuZ3RoID0gZ2V0VG90YWxCaXRzRnJvbURhdGFBcnJheShzZWdtZW50cywgY3VycmVudFZlcnNpb24pXG4gICAgaWYgKGxlbmd0aCA8PSBleHBvcnRzLmdldENhcGFjaXR5KGN1cnJlbnRWZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgTW9kZS5NSVhFRCkpIHtcbiAgICAgIHJldHVybiBjdXJyZW50VmVyc2lvblxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWRcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHZlcnNpb24gbnVtYmVyIGZyb20gYSB2YWx1ZS5cbiAqIElmIHZhbHVlIGlzIG5vdCBhIHZhbGlkIHZlcnNpb24sIHJldHVybnMgZGVmYXVsdFZhbHVlXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfFN0cmluZ30gdmFsdWUgICAgICAgIFFSIENvZGUgdmVyc2lvblxuICogQHBhcmFtICB7TnVtYmVyfSAgICAgICAgZGVmYXVsdFZhbHVlIEZhbGxiYWNrIHZhbHVlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uIG51bWJlclxuICovXG5leHBvcnRzLmZyb20gPSBmdW5jdGlvbiBmcm9tICh2YWx1ZSwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmIChWZXJzaW9uQ2hlY2suaXNWYWxpZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQodmFsdWUsIDEwKVxuICB9XG5cbiAgcmV0dXJuIGRlZmF1bHRWYWx1ZVxufVxuXG4vKipcbiAqIFJldHVybnMgaG93IG11Y2ggZGF0YSBjYW4gYmUgc3RvcmVkIHdpdGggdGhlIHNwZWNpZmllZCBRUiBjb2RlIHZlcnNpb25cbiAqIGFuZCBlcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb24gKDEtNDApXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqIEBwYXJhbSAge01vZGV9ICAgbW9kZSAgICAgICAgICAgICAgICAgRGF0YSBtb2RlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgIFF1YW50aXR5IG9mIHN0b3JhYmxlIGRhdGFcbiAqL1xuZXhwb3J0cy5nZXRDYXBhY2l0eSA9IGZ1bmN0aW9uIGdldENhcGFjaXR5ICh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbW9kZSkge1xuICBpZiAoIVZlcnNpb25DaGVjay5pc1ZhbGlkKHZlcnNpb24pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFFSIENvZGUgdmVyc2lvbicpXG4gIH1cblxuICAvLyBVc2UgQnl0ZSBtb2RlIGFzIGRlZmF1bHRcbiAgaWYgKHR5cGVvZiBtb2RlID09PSAndW5kZWZpbmVkJykgbW9kZSA9IE1vZGUuQllURVxuXG4gIC8vIFRvdGFsIGNvZGV3b3JkcyBmb3IgdGhpcyBRUiBjb2RlIHZlcnNpb24gKERhdGEgKyBFcnJvciBjb3JyZWN0aW9uKVxuICBjb25zdCB0b3RhbENvZGV3b3JkcyA9IFV0aWxzLmdldFN5bWJvbFRvdGFsQ29kZXdvcmRzKHZlcnNpb24pXG5cbiAgLy8gVG90YWwgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzXG4gIGNvbnN0IGVjVG90YWxDb2Rld29yZHMgPSBFQ0NvZGUuZ2V0VG90YWxDb2Rld29yZHNDb3VudCh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcblxuICAvLyBUb3RhbCBudW1iZXIgb2YgZGF0YSBjb2Rld29yZHNcbiAgY29uc3QgZGF0YVRvdGFsQ29kZXdvcmRzQml0cyA9ICh0b3RhbENvZGV3b3JkcyAtIGVjVG90YWxDb2Rld29yZHMpICogOFxuXG4gIGlmIChtb2RlID09PSBNb2RlLk1JWEVEKSByZXR1cm4gZGF0YVRvdGFsQ29kZXdvcmRzQml0c1xuXG4gIGNvbnN0IHVzYWJsZUJpdHMgPSBkYXRhVG90YWxDb2Rld29yZHNCaXRzIC0gZ2V0UmVzZXJ2ZWRCaXRzQ291bnQobW9kZSwgdmVyc2lvbilcblxuICAvLyBSZXR1cm4gbWF4IG51bWJlciBvZiBzdG9yYWJsZSBjb2Rld29yZHNcbiAgc3dpdGNoIChtb2RlKSB7XG4gICAgY2FzZSBNb2RlLk5VTUVSSUM6XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcigodXNhYmxlQml0cyAvIDEwKSAqIDMpXG5cbiAgICBjYXNlIE1vZGUuQUxQSEFOVU1FUklDOlxuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKHVzYWJsZUJpdHMgLyAxMSkgKiAyKVxuXG4gICAgY2FzZSBNb2RlLktBTkpJOlxuICAgICAgcmV0dXJuIE1hdGguZmxvb3IodXNhYmxlQml0cyAvIDEzKVxuXG4gICAgY2FzZSBNb2RlLkJZVEU6XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKHVzYWJsZUJpdHMgLyA4KVxuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWluaW11bSB2ZXJzaW9uIG5lZWRlZCB0byBjb250YWluIHRoZSBhbW91bnQgb2YgZGF0YVxuICpcbiAqIEBwYXJhbSAge1NlZ21lbnR9IGRhdGEgICAgICAgICAgICAgICAgICAgIFNlZ21lbnQgb2YgZGF0YVxuICogQHBhcmFtICB7TnVtYmVyfSBbZXJyb3JDb3JyZWN0aW9uTGV2ZWw9SF0gRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxuICogQHBhcmFtICB7TW9kZX0gbW9kZSAgICAgICAgICAgICAgICAgICAgICAgRGF0YSBtb2RlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cbiAqL1xuZXhwb3J0cy5nZXRCZXN0VmVyc2lvbkZvckRhdGEgPSBmdW5jdGlvbiBnZXRCZXN0VmVyc2lvbkZvckRhdGEgKGRhdGEsIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XG4gIGxldCBzZWdcblxuICBjb25zdCBlY2wgPSBFQ0xldmVsLmZyb20oZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIEVDTGV2ZWwuTSlcblxuICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgIGlmIChkYXRhLmxlbmd0aCA+IDEpIHtcbiAgICAgIHJldHVybiBnZXRCZXN0VmVyc2lvbkZvck1peGVkRGF0YShkYXRhLCBlY2wpXG4gICAgfVxuXG4gICAgaWYgKGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH1cblxuICAgIHNlZyA9IGRhdGFbMF1cbiAgfSBlbHNlIHtcbiAgICBzZWcgPSBkYXRhXG4gIH1cblxuICByZXR1cm4gZ2V0QmVzdFZlcnNpb25Gb3JEYXRhTGVuZ3RoKHNlZy5tb2RlLCBzZWcuZ2V0TGVuZ3RoKCksIGVjbClcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHZlcnNpb24gaW5mb3JtYXRpb24gd2l0aCByZWxhdGl2ZSBlcnJvciBjb3JyZWN0aW9uIGJpdHNcbiAqXG4gKiBUaGUgdmVyc2lvbiBpbmZvcm1hdGlvbiBpcyBpbmNsdWRlZCBpbiBRUiBDb2RlIHN5bWJvbHMgb2YgdmVyc2lvbiA3IG9yIGxhcmdlci5cbiAqIEl0IGNvbnNpc3RzIG9mIGFuIDE4LWJpdCBzZXF1ZW5jZSBjb250YWluaW5nIDYgZGF0YSBiaXRzLFxuICogd2l0aCAxMiBlcnJvciBjb3JyZWN0aW9uIGJpdHMgY2FsY3VsYXRlZCB1c2luZyB0aGUgKDE4LCA2KSBHb2xheSBjb2RlLlxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICBFbmNvZGVkIHZlcnNpb24gaW5mbyBiaXRzXG4gKi9cbmV4cG9ydHMuZ2V0RW5jb2RlZEJpdHMgPSBmdW5jdGlvbiBnZXRFbmNvZGVkQml0cyAodmVyc2lvbikge1xuICBpZiAoIVZlcnNpb25DaGVjay5pc1ZhbGlkKHZlcnNpb24pIHx8IHZlcnNpb24gPCA3KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFFSIENvZGUgdmVyc2lvbicpXG4gIH1cblxuICBsZXQgZCA9IHZlcnNpb24gPDwgMTJcblxuICB3aGlsZSAoVXRpbHMuZ2V0QkNIRGlnaXQoZCkgLSBHMThfQkNIID49IDApIHtcbiAgICBkIF49IChHMTggPDwgKFV0aWxzLmdldEJDSERpZ2l0KGQpIC0gRzE4X0JDSCkpXG4gIH1cblxuICByZXR1cm4gKHZlcnNpb24gPDwgMTIpIHwgZFxufVxuIiwgImNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5cbmNvbnN0IEcxNSA9ICgxIDw8IDEwKSB8ICgxIDw8IDgpIHwgKDEgPDwgNSkgfCAoMSA8PCA0KSB8ICgxIDw8IDIpIHwgKDEgPDwgMSkgfCAoMSA8PCAwKVxuY29uc3QgRzE1X01BU0sgPSAoMSA8PCAxNCkgfCAoMSA8PCAxMikgfCAoMSA8PCAxMCkgfCAoMSA8PCA0KSB8ICgxIDw8IDEpXG5jb25zdCBHMTVfQkNIID0gVXRpbHMuZ2V0QkNIRGlnaXQoRzE1KVxuXG4vKipcbiAqIFJldHVybnMgZm9ybWF0IGluZm9ybWF0aW9uIHdpdGggcmVsYXRpdmUgZXJyb3IgY29ycmVjdGlvbiBiaXRzXG4gKlxuICogVGhlIGZvcm1hdCBpbmZvcm1hdGlvbiBpcyBhIDE1LWJpdCBzZXF1ZW5jZSBjb250YWluaW5nIDUgZGF0YSBiaXRzLFxuICogd2l0aCAxMCBlcnJvciBjb3JyZWN0aW9uIGJpdHMgY2FsY3VsYXRlZCB1c2luZyB0aGUgKDE1LCA1KSBCQ0ggY29kZS5cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqIEBwYXJhbSAge051bWJlcn0gbWFzayAgICAgICAgICAgICAgICAgTWFzayBwYXR0ZXJuXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgIEVuY29kZWQgZm9ybWF0IGluZm9ybWF0aW9uIGJpdHNcbiAqL1xuZXhwb3J0cy5nZXRFbmNvZGVkQml0cyA9IGZ1bmN0aW9uIGdldEVuY29kZWRCaXRzIChlcnJvckNvcnJlY3Rpb25MZXZlbCwgbWFzaykge1xuICBjb25zdCBkYXRhID0gKChlcnJvckNvcnJlY3Rpb25MZXZlbC5iaXQgPDwgMykgfCBtYXNrKVxuICBsZXQgZCA9IGRhdGEgPDwgMTBcblxuICB3aGlsZSAoVXRpbHMuZ2V0QkNIRGlnaXQoZCkgLSBHMTVfQkNIID49IDApIHtcbiAgICBkIF49IChHMTUgPDwgKFV0aWxzLmdldEJDSERpZ2l0KGQpIC0gRzE1X0JDSCkpXG4gIH1cblxuICAvLyB4b3IgZmluYWwgZGF0YSB3aXRoIG1hc2sgcGF0dGVybiBpbiBvcmRlciB0byBlbnN1cmUgdGhhdFxuICAvLyBubyBjb21iaW5hdGlvbiBvZiBFcnJvciBDb3JyZWN0aW9uIExldmVsIGFuZCBkYXRhIG1hc2sgcGF0dGVyblxuICAvLyB3aWxsIHJlc3VsdCBpbiBhbiBhbGwtemVybyBkYXRhIHN0cmluZ1xuICByZXR1cm4gKChkYXRhIDw8IDEwKSB8IGQpIF4gRzE1X01BU0tcbn1cbiIsICJjb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcblxuZnVuY3Rpb24gTnVtZXJpY0RhdGEgKGRhdGEpIHtcbiAgdGhpcy5tb2RlID0gTW9kZS5OVU1FUklDXG4gIHRoaXMuZGF0YSA9IGRhdGEudG9TdHJpbmcoKVxufVxuXG5OdW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAobGVuZ3RoKSB7XG4gIHJldHVybiAxMCAqIE1hdGguZmxvb3IobGVuZ3RoIC8gMykgKyAoKGxlbmd0aCAlIDMpID8gKChsZW5ndGggJSAzKSAqIDMgKyAxKSA6IDApXG59XG5cbk51bWVyaWNEYXRhLnByb3RvdHlwZS5nZXRMZW5ndGggPSBmdW5jdGlvbiBnZXRMZW5ndGggKCkge1xuICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aFxufVxuXG5OdW1lcmljRGF0YS5wcm90b3R5cGUuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKCkge1xuICByZXR1cm4gTnVtZXJpY0RhdGEuZ2V0Qml0c0xlbmd0aCh0aGlzLmRhdGEubGVuZ3RoKVxufVxuXG5OdW1lcmljRGF0YS5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiB3cml0ZSAoYml0QnVmZmVyKSB7XG4gIGxldCBpLCBncm91cCwgdmFsdWVcblxuICAvLyBUaGUgaW5wdXQgZGF0YSBzdHJpbmcgaXMgZGl2aWRlZCBpbnRvIGdyb3VwcyBvZiB0aHJlZSBkaWdpdHMsXG4gIC8vIGFuZCBlYWNoIGdyb3VwIGlzIGNvbnZlcnRlZCB0byBpdHMgMTAtYml0IGJpbmFyeSBlcXVpdmFsZW50LlxuICBmb3IgKGkgPSAwOyBpICsgMyA8PSB0aGlzLmRhdGEubGVuZ3RoOyBpICs9IDMpIHtcbiAgICBncm91cCA9IHRoaXMuZGF0YS5zdWJzdHIoaSwgMylcbiAgICB2YWx1ZSA9IHBhcnNlSW50KGdyb3VwLCAxMClcblxuICAgIGJpdEJ1ZmZlci5wdXQodmFsdWUsIDEwKVxuICB9XG5cbiAgLy8gSWYgdGhlIG51bWJlciBvZiBpbnB1dCBkaWdpdHMgaXMgbm90IGFuIGV4YWN0IG11bHRpcGxlIG9mIHRocmVlLFxuICAvLyB0aGUgZmluYWwgb25lIG9yIHR3byBkaWdpdHMgYXJlIGNvbnZlcnRlZCB0byA0IG9yIDcgYml0cyByZXNwZWN0aXZlbHkuXG4gIGNvbnN0IHJlbWFpbmluZ051bSA9IHRoaXMuZGF0YS5sZW5ndGggLSBpXG4gIGlmIChyZW1haW5pbmdOdW0gPiAwKSB7XG4gICAgZ3JvdXAgPSB0aGlzLmRhdGEuc3Vic3RyKGkpXG4gICAgdmFsdWUgPSBwYXJzZUludChncm91cCwgMTApXG5cbiAgICBiaXRCdWZmZXIucHV0KHZhbHVlLCByZW1haW5pbmdOdW0gKiAzICsgMSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE51bWVyaWNEYXRhXG4iLCAiY29uc3QgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG5cbi8qKlxuICogQXJyYXkgb2YgY2hhcmFjdGVycyBhdmFpbGFibGUgaW4gYWxwaGFudW1lcmljIG1vZGVcbiAqXG4gKiBBcyBwZXIgUVIgQ29kZSBzcGVjaWZpY2F0aW9uLCB0byBlYWNoIGNoYXJhY3RlclxuICogaXMgYXNzaWduZWQgYSB2YWx1ZSBmcm9tIDAgdG8gNDQgd2hpY2ggaW4gdGhpcyBjYXNlIGNvaW5jaWRlc1xuICogd2l0aCB0aGUgYXJyYXkgaW5kZXhcbiAqXG4gKiBAdHlwZSB7QXJyYXl9XG4gKi9cbmNvbnN0IEFMUEhBX05VTV9DSEFSUyA9IFtcbiAgJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLFxuICAnQScsICdCJywgJ0MnLCAnRCcsICdFJywgJ0YnLCAnRycsICdIJywgJ0knLCAnSicsICdLJywgJ0wnLCAnTScsXG4gICdOJywgJ08nLCAnUCcsICdRJywgJ1InLCAnUycsICdUJywgJ1UnLCAnVicsICdXJywgJ1gnLCAnWScsICdaJyxcbiAgJyAnLCAnJCcsICclJywgJyonLCAnKycsICctJywgJy4nLCAnLycsICc6J1xuXVxuXG5mdW5jdGlvbiBBbHBoYW51bWVyaWNEYXRhIChkYXRhKSB7XG4gIHRoaXMubW9kZSA9IE1vZGUuQUxQSEFOVU1FUklDXG4gIHRoaXMuZGF0YSA9IGRhdGFcbn1cblxuQWxwaGFudW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAobGVuZ3RoKSB7XG4gIHJldHVybiAxMSAqIE1hdGguZmxvb3IobGVuZ3RoIC8gMikgKyA2ICogKGxlbmd0aCAlIDIpXG59XG5cbkFscGhhbnVtZXJpY0RhdGEucHJvdG90eXBlLmdldExlbmd0aCA9IGZ1bmN0aW9uIGdldExlbmd0aCAoKSB7XG4gIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoXG59XG5cbkFscGhhbnVtZXJpY0RhdGEucHJvdG90eXBlLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoICgpIHtcbiAgcmV0dXJuIEFscGhhbnVtZXJpY0RhdGEuZ2V0Qml0c0xlbmd0aCh0aGlzLmRhdGEubGVuZ3RoKVxufVxuXG5BbHBoYW51bWVyaWNEYXRhLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChiaXRCdWZmZXIpIHtcbiAgbGV0IGlcblxuICAvLyBJbnB1dCBkYXRhIGNoYXJhY3RlcnMgYXJlIGRpdmlkZWQgaW50byBncm91cHMgb2YgdHdvIGNoYXJhY3RlcnNcbiAgLy8gYW5kIGVuY29kZWQgYXMgMTEtYml0IGJpbmFyeSBjb2Rlcy5cbiAgZm9yIChpID0gMDsgaSArIDIgPD0gdGhpcy5kYXRhLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgLy8gVGhlIGNoYXJhY3RlciB2YWx1ZSBvZiB0aGUgZmlyc3QgY2hhcmFjdGVyIGlzIG11bHRpcGxpZWQgYnkgNDVcbiAgICBsZXQgdmFsdWUgPSBBTFBIQV9OVU1fQ0hBUlMuaW5kZXhPZih0aGlzLmRhdGFbaV0pICogNDVcblxuICAgIC8vIFRoZSBjaGFyYWN0ZXIgdmFsdWUgb2YgdGhlIHNlY29uZCBkaWdpdCBpcyBhZGRlZCB0byB0aGUgcHJvZHVjdFxuICAgIHZhbHVlICs9IEFMUEhBX05VTV9DSEFSUy5pbmRleE9mKHRoaXMuZGF0YVtpICsgMV0pXG5cbiAgICAvLyBUaGUgc3VtIGlzIHRoZW4gc3RvcmVkIGFzIDExLWJpdCBiaW5hcnkgbnVtYmVyXG4gICAgYml0QnVmZmVyLnB1dCh2YWx1ZSwgMTEpXG4gIH1cblxuICAvLyBJZiB0aGUgbnVtYmVyIG9mIGlucHV0IGRhdGEgY2hhcmFjdGVycyBpcyBub3QgYSBtdWx0aXBsZSBvZiB0d28sXG4gIC8vIHRoZSBjaGFyYWN0ZXIgdmFsdWUgb2YgdGhlIGZpbmFsIGNoYXJhY3RlciBpcyBlbmNvZGVkIGFzIGEgNi1iaXQgYmluYXJ5IG51bWJlci5cbiAgaWYgKHRoaXMuZGF0YS5sZW5ndGggJSAyKSB7XG4gICAgYml0QnVmZmVyLnB1dChBTFBIQV9OVU1fQ0hBUlMuaW5kZXhPZih0aGlzLmRhdGFbaV0pLCA2KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQWxwaGFudW1lcmljRGF0YVxuIiwgImNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxuXG5mdW5jdGlvbiBCeXRlRGF0YSAoZGF0YSkge1xuICB0aGlzLm1vZGUgPSBNb2RlLkJZVEVcbiAgaWYgKHR5cGVvZiAoZGF0YSkgPT09ICdzdHJpbmcnKSB7XG4gICAgdGhpcy5kYXRhID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKGRhdGEpXG4gIH0gZWxzZSB7XG4gICAgdGhpcy5kYXRhID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSlcbiAgfVxufVxuXG5CeXRlRGF0YS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAobGVuZ3RoKSB7XG4gIHJldHVybiBsZW5ndGggKiA4XG59XG5cbkJ5dGVEYXRhLnByb3RvdHlwZS5nZXRMZW5ndGggPSBmdW5jdGlvbiBnZXRMZW5ndGggKCkge1xuICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aFxufVxuXG5CeXRlRGF0YS5wcm90b3R5cGUuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKCkge1xuICByZXR1cm4gQnl0ZURhdGEuZ2V0Qml0c0xlbmd0aCh0aGlzLmRhdGEubGVuZ3RoKVxufVxuXG5CeXRlRGF0YS5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoYml0QnVmZmVyKSB7XG4gIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5kYXRhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGJpdEJ1ZmZlci5wdXQodGhpcy5kYXRhW2ldLCA4KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnl0ZURhdGFcbiIsICJjb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcbmNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5cbmZ1bmN0aW9uIEthbmppRGF0YSAoZGF0YSkge1xuICB0aGlzLm1vZGUgPSBNb2RlLktBTkpJXG4gIHRoaXMuZGF0YSA9IGRhdGFcbn1cblxuS2FuamlEYXRhLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoIChsZW5ndGgpIHtcbiAgcmV0dXJuIGxlbmd0aCAqIDEzXG59XG5cbkthbmppRGF0YS5wcm90b3R5cGUuZ2V0TGVuZ3RoID0gZnVuY3Rpb24gZ2V0TGVuZ3RoICgpIHtcbiAgcmV0dXJuIHRoaXMuZGF0YS5sZW5ndGhcbn1cblxuS2FuamlEYXRhLnByb3RvdHlwZS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAoKSB7XG4gIHJldHVybiBLYW5qaURhdGEuZ2V0Qml0c0xlbmd0aCh0aGlzLmRhdGEubGVuZ3RoKVxufVxuXG5LYW5qaURhdGEucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKGJpdEJ1ZmZlcikge1xuICBsZXQgaVxuXG4gIC8vIEluIHRoZSBTaGlmdCBKSVMgc3lzdGVtLCBLYW5qaSBjaGFyYWN0ZXJzIGFyZSByZXByZXNlbnRlZCBieSBhIHR3byBieXRlIGNvbWJpbmF0aW9uLlxuICAvLyBUaGVzZSBieXRlIHZhbHVlcyBhcmUgc2hpZnRlZCBmcm9tIHRoZSBKSVMgWCAwMjA4IHZhbHVlcy5cbiAgLy8gSklTIFggMDIwOCBnaXZlcyBkZXRhaWxzIG9mIHRoZSBzaGlmdCBjb2RlZCByZXByZXNlbnRhdGlvbi5cbiAgZm9yIChpID0gMDsgaSA8IHRoaXMuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIGxldCB2YWx1ZSA9IFV0aWxzLnRvU0pJUyh0aGlzLmRhdGFbaV0pXG5cbiAgICAvLyBGb3IgY2hhcmFjdGVycyB3aXRoIFNoaWZ0IEpJUyB2YWx1ZXMgZnJvbSAweDgxNDAgdG8gMHg5RkZDOlxuICAgIGlmICh2YWx1ZSA+PSAweDgxNDAgJiYgdmFsdWUgPD0gMHg5RkZDKSB7XG4gICAgICAvLyBTdWJ0cmFjdCAweDgxNDAgZnJvbSBTaGlmdCBKSVMgdmFsdWVcbiAgICAgIHZhbHVlIC09IDB4ODE0MFxuXG4gICAgLy8gRm9yIGNoYXJhY3RlcnMgd2l0aCBTaGlmdCBKSVMgdmFsdWVzIGZyb20gMHhFMDQwIHRvIDB4RUJCRlxuICAgIH0gZWxzZSBpZiAodmFsdWUgPj0gMHhFMDQwICYmIHZhbHVlIDw9IDB4RUJCRikge1xuICAgICAgLy8gU3VidHJhY3QgMHhDMTQwIGZyb20gU2hpZnQgSklTIHZhbHVlXG4gICAgICB2YWx1ZSAtPSAweEMxNDBcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnSW52YWxpZCBTSklTIGNoYXJhY3RlcjogJyArIHRoaXMuZGF0YVtpXSArICdcXG4nICtcbiAgICAgICAgJ01ha2Ugc3VyZSB5b3VyIGNoYXJzZXQgaXMgVVRGLTgnKVxuICAgIH1cblxuICAgIC8vIE11bHRpcGx5IG1vc3Qgc2lnbmlmaWNhbnQgYnl0ZSBvZiByZXN1bHQgYnkgMHhDMFxuICAgIC8vIGFuZCBhZGQgbGVhc3Qgc2lnbmlmaWNhbnQgYnl0ZSB0byBwcm9kdWN0XG4gICAgdmFsdWUgPSAoKCh2YWx1ZSA+Pj4gOCkgJiAweGZmKSAqIDB4QzApICsgKHZhbHVlICYgMHhmZilcblxuICAgIC8vIENvbnZlcnQgcmVzdWx0IHRvIGEgMTMtYml0IGJpbmFyeSBzdHJpbmdcbiAgICBiaXRCdWZmZXIucHV0KHZhbHVlLCAxMylcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEthbmppRGF0YVxuIiwgIid1c2Ugc3RyaWN0JztcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogQ3JlYXRlZCAyMDA4LTA4LTE5LlxuICpcbiAqIERpamtzdHJhIHBhdGgtZmluZGluZyBmdW5jdGlvbnMuIEFkYXB0ZWQgZnJvbSB0aGUgRGlqa3N0YXIgUHl0aG9uIHByb2plY3QuXG4gKlxuICogQ29weXJpZ2h0IChDKSAyMDA4XG4gKiAgIFd5YXR0IEJhbGR3aW4gPHNlbGZAd3lhdHRiYWxkd2luLmNvbT5cbiAqICAgQWxsIHJpZ2h0cyByZXNlcnZlZFxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqXG4gKiAgIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4gKiBUSEUgU09GVFdBUkUuXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG52YXIgZGlqa3N0cmEgPSB7XG4gIHNpbmdsZV9zb3VyY2Vfc2hvcnRlc3RfcGF0aHM6IGZ1bmN0aW9uKGdyYXBoLCBzLCBkKSB7XG4gICAgLy8gUHJlZGVjZXNzb3IgbWFwIGZvciBlYWNoIG5vZGUgdGhhdCBoYXMgYmVlbiBlbmNvdW50ZXJlZC5cbiAgICAvLyBub2RlIElEID0+IHByZWRlY2Vzc29yIG5vZGUgSURcbiAgICB2YXIgcHJlZGVjZXNzb3JzID0ge307XG5cbiAgICAvLyBDb3N0cyBvZiBzaG9ydGVzdCBwYXRocyBmcm9tIHMgdG8gYWxsIG5vZGVzIGVuY291bnRlcmVkLlxuICAgIC8vIG5vZGUgSUQgPT4gY29zdFxuICAgIHZhciBjb3N0cyA9IHt9O1xuICAgIGNvc3RzW3NdID0gMDtcblxuICAgIC8vIENvc3RzIG9mIHNob3J0ZXN0IHBhdGhzIGZyb20gcyB0byBhbGwgbm9kZXMgZW5jb3VudGVyZWQ7IGRpZmZlcnMgZnJvbVxuICAgIC8vIGBjb3N0c2AgaW4gdGhhdCBpdCBwcm92aWRlcyBlYXN5IGFjY2VzcyB0byB0aGUgbm9kZSB0aGF0IGN1cnJlbnRseSBoYXNcbiAgICAvLyB0aGUga25vd24gc2hvcnRlc3QgcGF0aCBmcm9tIHMuXG4gICAgLy8gWFhYOiBEbyB3ZSBhY3R1YWxseSBuZWVkIGJvdGggYGNvc3RzYCBhbmQgYG9wZW5gP1xuICAgIHZhciBvcGVuID0gZGlqa3N0cmEuUHJpb3JpdHlRdWV1ZS5tYWtlKCk7XG4gICAgb3Blbi5wdXNoKHMsIDApO1xuXG4gICAgdmFyIGNsb3Nlc3QsXG4gICAgICAgIHUsIHYsXG4gICAgICAgIGNvc3Rfb2Zfc190b191LFxuICAgICAgICBhZGphY2VudF9ub2RlcyxcbiAgICAgICAgY29zdF9vZl9lLFxuICAgICAgICBjb3N0X29mX3NfdG9fdV9wbHVzX2Nvc3Rfb2ZfZSxcbiAgICAgICAgY29zdF9vZl9zX3RvX3YsXG4gICAgICAgIGZpcnN0X3Zpc2l0O1xuICAgIHdoaWxlICghb3Blbi5lbXB0eSgpKSB7XG4gICAgICAvLyBJbiB0aGUgbm9kZXMgcmVtYWluaW5nIGluIGdyYXBoIHRoYXQgaGF2ZSBhIGtub3duIGNvc3QgZnJvbSBzLFxuICAgICAgLy8gZmluZCB0aGUgbm9kZSwgdSwgdGhhdCBjdXJyZW50bHkgaGFzIHRoZSBzaG9ydGVzdCBwYXRoIGZyb20gcy5cbiAgICAgIGNsb3Nlc3QgPSBvcGVuLnBvcCgpO1xuICAgICAgdSA9IGNsb3Nlc3QudmFsdWU7XG4gICAgICBjb3N0X29mX3NfdG9fdSA9IGNsb3Nlc3QuY29zdDtcblxuICAgICAgLy8gR2V0IG5vZGVzIGFkamFjZW50IHRvIHUuLi5cbiAgICAgIGFkamFjZW50X25vZGVzID0gZ3JhcGhbdV0gfHwge307XG5cbiAgICAgIC8vIC4uLmFuZCBleHBsb3JlIHRoZSBlZGdlcyB0aGF0IGNvbm5lY3QgdSB0byB0aG9zZSBub2RlcywgdXBkYXRpbmdcbiAgICAgIC8vIHRoZSBjb3N0IG9mIHRoZSBzaG9ydGVzdCBwYXRocyB0byBhbnkgb3IgYWxsIG9mIHRob3NlIG5vZGVzIGFzXG4gICAgICAvLyBuZWNlc3NhcnkuIHYgaXMgdGhlIG5vZGUgYWNyb3NzIHRoZSBjdXJyZW50IGVkZ2UgZnJvbSB1LlxuICAgICAgZm9yICh2IGluIGFkamFjZW50X25vZGVzKSB7XG4gICAgICAgIGlmIChhZGphY2VudF9ub2Rlcy5oYXNPd25Qcm9wZXJ0eSh2KSkge1xuICAgICAgICAgIC8vIEdldCB0aGUgY29zdCBvZiB0aGUgZWRnZSBydW5uaW5nIGZyb20gdSB0byB2LlxuICAgICAgICAgIGNvc3Rfb2ZfZSA9IGFkamFjZW50X25vZGVzW3ZdO1xuXG4gICAgICAgICAgLy8gQ29zdCBvZiBzIHRvIHUgcGx1cyB0aGUgY29zdCBvZiB1IHRvIHYgYWNyb3NzIGUtLXRoaXMgaXMgKmEqXG4gICAgICAgICAgLy8gY29zdCBmcm9tIHMgdG8gdiB0aGF0IG1heSBvciBtYXkgbm90IGJlIGxlc3MgdGhhbiB0aGUgY3VycmVudFxuICAgICAgICAgIC8vIGtub3duIGNvc3QgdG8gdi5cbiAgICAgICAgICBjb3N0X29mX3NfdG9fdV9wbHVzX2Nvc3Rfb2ZfZSA9IGNvc3Rfb2Zfc190b191ICsgY29zdF9vZl9lO1xuXG4gICAgICAgICAgLy8gSWYgd2UgaGF2ZW4ndCB2aXNpdGVkIHYgeWV0IE9SIGlmIHRoZSBjdXJyZW50IGtub3duIGNvc3QgZnJvbSBzIHRvXG4gICAgICAgICAgLy8gdiBpcyBncmVhdGVyIHRoYW4gdGhlIG5ldyBjb3N0IHdlIGp1c3QgZm91bmQgKGNvc3Qgb2YgcyB0byB1IHBsdXNcbiAgICAgICAgICAvLyBjb3N0IG9mIHUgdG8gdiBhY3Jvc3MgZSksIHVwZGF0ZSB2J3MgY29zdCBpbiB0aGUgY29zdCBsaXN0IGFuZFxuICAgICAgICAgIC8vIHVwZGF0ZSB2J3MgcHJlZGVjZXNzb3IgaW4gdGhlIHByZWRlY2Vzc29yIGxpc3QgKGl0J3Mgbm93IHUpLlxuICAgICAgICAgIGNvc3Rfb2Zfc190b192ID0gY29zdHNbdl07XG4gICAgICAgICAgZmlyc3RfdmlzaXQgPSAodHlwZW9mIGNvc3RzW3ZdID09PSAndW5kZWZpbmVkJyk7XG4gICAgICAgICAgaWYgKGZpcnN0X3Zpc2l0IHx8IGNvc3Rfb2Zfc190b192ID4gY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2UpIHtcbiAgICAgICAgICAgIGNvc3RzW3ZdID0gY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2U7XG4gICAgICAgICAgICBvcGVuLnB1c2godiwgY29zdF9vZl9zX3RvX3VfcGx1c19jb3N0X29mX2UpO1xuICAgICAgICAgICAgcHJlZGVjZXNzb3JzW3ZdID0gdTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGQgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjb3N0c1tkXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZhciBtc2cgPSBbJ0NvdWxkIG5vdCBmaW5kIGEgcGF0aCBmcm9tICcsIHMsICcgdG8gJywgZCwgJy4nXS5qb2luKCcnKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgIH1cblxuICAgIHJldHVybiBwcmVkZWNlc3NvcnM7XG4gIH0sXG5cbiAgZXh0cmFjdF9zaG9ydGVzdF9wYXRoX2Zyb21fcHJlZGVjZXNzb3JfbGlzdDogZnVuY3Rpb24ocHJlZGVjZXNzb3JzLCBkKSB7XG4gICAgdmFyIG5vZGVzID0gW107XG4gICAgdmFyIHUgPSBkO1xuICAgIHZhciBwcmVkZWNlc3NvcjtcbiAgICB3aGlsZSAodSkge1xuICAgICAgbm9kZXMucHVzaCh1KTtcbiAgICAgIHByZWRlY2Vzc29yID0gcHJlZGVjZXNzb3JzW3VdO1xuICAgICAgdSA9IHByZWRlY2Vzc29yc1t1XTtcbiAgICB9XG4gICAgbm9kZXMucmV2ZXJzZSgpO1xuICAgIHJldHVybiBub2RlcztcbiAgfSxcblxuICBmaW5kX3BhdGg6IGZ1bmN0aW9uKGdyYXBoLCBzLCBkKSB7XG4gICAgdmFyIHByZWRlY2Vzc29ycyA9IGRpamtzdHJhLnNpbmdsZV9zb3VyY2Vfc2hvcnRlc3RfcGF0aHMoZ3JhcGgsIHMsIGQpO1xuICAgIHJldHVybiBkaWprc3RyYS5leHRyYWN0X3Nob3J0ZXN0X3BhdGhfZnJvbV9wcmVkZWNlc3Nvcl9saXN0KFxuICAgICAgcHJlZGVjZXNzb3JzLCBkKTtcbiAgfSxcblxuICAvKipcbiAgICogQSB2ZXJ5IG5haXZlIHByaW9yaXR5IHF1ZXVlIGltcGxlbWVudGF0aW9uLlxuICAgKi9cbiAgUHJpb3JpdHlRdWV1ZToge1xuICAgIG1ha2U6IGZ1bmN0aW9uIChvcHRzKSB7XG4gICAgICB2YXIgVCA9IGRpamtzdHJhLlByaW9yaXR5UXVldWUsXG4gICAgICAgICAgdCA9IHt9LFxuICAgICAgICAgIGtleTtcbiAgICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuICAgICAgZm9yIChrZXkgaW4gVCkge1xuICAgICAgICBpZiAoVC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgdFtrZXldID0gVFtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0LnF1ZXVlID0gW107XG4gICAgICB0LnNvcnRlciA9IG9wdHMuc29ydGVyIHx8IFQuZGVmYXVsdF9zb3J0ZXI7XG4gICAgICByZXR1cm4gdDtcbiAgICB9LFxuXG4gICAgZGVmYXVsdF9zb3J0ZXI6IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gYS5jb3N0IC0gYi5jb3N0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBuZXcgaXRlbSB0byB0aGUgcXVldWUgYW5kIGVuc3VyZSB0aGUgaGlnaGVzdCBwcmlvcml0eSBlbGVtZW50XG4gICAgICogaXMgYXQgdGhlIGZyb250IG9mIHRoZSBxdWV1ZS5cbiAgICAgKi9cbiAgICBwdXNoOiBmdW5jdGlvbiAodmFsdWUsIGNvc3QpIHtcbiAgICAgIHZhciBpdGVtID0ge3ZhbHVlOiB2YWx1ZSwgY29zdDogY29zdH07XG4gICAgICB0aGlzLnF1ZXVlLnB1c2goaXRlbSk7XG4gICAgICB0aGlzLnF1ZXVlLnNvcnQodGhpcy5zb3J0ZXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIGhpZ2hlc3QgcHJpb3JpdHkgZWxlbWVudCBpbiB0aGUgcXVldWUuXG4gICAgICovXG4gICAgcG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZS5zaGlmdCgpO1xuICAgIH0sXG5cbiAgICBlbXB0eTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWUubGVuZ3RoID09PSAwO1xuICAgIH1cbiAgfVxufTtcblxuXG4vLyBub2RlLmpzIG1vZHVsZSBleHBvcnRzXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBkaWprc3RyYTtcbn1cbiIsICJjb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcbmNvbnN0IE51bWVyaWNEYXRhID0gcmVxdWlyZSgnLi9udW1lcmljLWRhdGEnKVxuY29uc3QgQWxwaGFudW1lcmljRGF0YSA9IHJlcXVpcmUoJy4vYWxwaGFudW1lcmljLWRhdGEnKVxuY29uc3QgQnl0ZURhdGEgPSByZXF1aXJlKCcuL2J5dGUtZGF0YScpXG5jb25zdCBLYW5qaURhdGEgPSByZXF1aXJlKCcuL2thbmppLWRhdGEnKVxuY29uc3QgUmVnZXggPSByZXF1aXJlKCcuL3JlZ2V4JylcbmNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5jb25zdCBkaWprc3RyYSA9IHJlcXVpcmUoJ2RpamtzdHJhanMnKVxuXG4vKipcbiAqIFJldHVybnMgVVRGOCBieXRlIGxlbmd0aFxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyIElucHV0IHN0cmluZ1xuICogQHJldHVybiB7TnVtYmVyfSAgICAgTnVtYmVyIG9mIGJ5dGVcbiAqL1xuZnVuY3Rpb24gZ2V0U3RyaW5nQnl0ZUxlbmd0aCAoc3RyKSB7XG4gIHJldHVybiB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoc3RyKSkubGVuZ3RoXG59XG5cbi8qKlxuICogR2V0IGEgbGlzdCBvZiBzZWdtZW50cyBvZiB0aGUgc3BlY2lmaWVkIG1vZGVcbiAqIGZyb20gYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0gIHtNb2RlfSAgIG1vZGUgU2VnbWVudCBtb2RlXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciAgU3RyaW5nIHRvIHByb2Nlc3NcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXG4gKi9cbmZ1bmN0aW9uIGdldFNlZ21lbnRzIChyZWdleCwgbW9kZSwgc3RyKSB7XG4gIGNvbnN0IHNlZ21lbnRzID0gW11cbiAgbGV0IHJlc3VsdFxuXG4gIHdoaWxlICgocmVzdWx0ID0gcmVnZXguZXhlYyhzdHIpKSAhPT0gbnVsbCkge1xuICAgIHNlZ21lbnRzLnB1c2goe1xuICAgICAgZGF0YTogcmVzdWx0WzBdLFxuICAgICAgaW5kZXg6IHJlc3VsdC5pbmRleCxcbiAgICAgIG1vZGU6IG1vZGUsXG4gICAgICBsZW5ndGg6IHJlc3VsdFswXS5sZW5ndGhcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIHNlZ21lbnRzXG59XG5cbi8qKlxuICogRXh0cmFjdHMgYSBzZXJpZXMgb2Ygc2VnbWVudHMgd2l0aCB0aGUgYXBwcm9wcmlhdGVcbiAqIG1vZGVzIGZyb20gYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGFTdHIgSW5wdXQgc3RyaW5nXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICAgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxuICovXG5mdW5jdGlvbiBnZXRTZWdtZW50c0Zyb21TdHJpbmcgKGRhdGFTdHIpIHtcbiAgY29uc3QgbnVtU2VncyA9IGdldFNlZ21lbnRzKFJlZ2V4Lk5VTUVSSUMsIE1vZGUuTlVNRVJJQywgZGF0YVN0cilcbiAgY29uc3QgYWxwaGFOdW1TZWdzID0gZ2V0U2VnbWVudHMoUmVnZXguQUxQSEFOVU1FUklDLCBNb2RlLkFMUEhBTlVNRVJJQywgZGF0YVN0cilcbiAgbGV0IGJ5dGVTZWdzXG4gIGxldCBrYW5qaVNlZ3NcblxuICBpZiAoVXRpbHMuaXNLYW5qaU1vZGVFbmFibGVkKCkpIHtcbiAgICBieXRlU2VncyA9IGdldFNlZ21lbnRzKFJlZ2V4LkJZVEUsIE1vZGUuQllURSwgZGF0YVN0cilcbiAgICBrYW5qaVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5LQU5KSSwgTW9kZS5LQU5KSSwgZGF0YVN0cilcbiAgfSBlbHNlIHtcbiAgICBieXRlU2VncyA9IGdldFNlZ21lbnRzKFJlZ2V4LkJZVEVfS0FOSkksIE1vZGUuQllURSwgZGF0YVN0cilcbiAgICBrYW5qaVNlZ3MgPSBbXVxuICB9XG5cbiAgY29uc3Qgc2VncyA9IG51bVNlZ3MuY29uY2F0KGFscGhhTnVtU2VncywgYnl0ZVNlZ3MsIGthbmppU2VncylcblxuICByZXR1cm4gc2Vnc1xuICAgIC5zb3J0KGZ1bmN0aW9uIChzMSwgczIpIHtcbiAgICAgIHJldHVybiBzMS5pbmRleCAtIHMyLmluZGV4XG4gICAgfSlcbiAgICAubWFwKGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRhdGE6IG9iai5kYXRhLFxuICAgICAgICBtb2RlOiBvYmoubW9kZSxcbiAgICAgICAgbGVuZ3RoOiBvYmoubGVuZ3RoXG4gICAgICB9XG4gICAgfSlcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGhvdyBtYW55IGJpdHMgYXJlIG5lZWRlZCB0byBlbmNvZGUgYSBzdHJpbmcgb2ZcbiAqIHNwZWNpZmllZCBsZW5ndGggd2l0aCB0aGUgc3BlY2lmaWVkIG1vZGVcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGxlbmd0aCBTdHJpbmcgbGVuZ3RoXG4gKiBAcGFyYW0gIHtNb2RlfSBtb2RlICAgICBTZWdtZW50IG1vZGVcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgIEJpdCBsZW5ndGhcbiAqL1xuZnVuY3Rpb24gZ2V0U2VnbWVudEJpdHNMZW5ndGggKGxlbmd0aCwgbW9kZSkge1xuICBzd2l0Y2ggKG1vZGUpIHtcbiAgICBjYXNlIE1vZGUuTlVNRVJJQzpcbiAgICAgIHJldHVybiBOdW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoKGxlbmd0aClcbiAgICBjYXNlIE1vZGUuQUxQSEFOVU1FUklDOlxuICAgICAgcmV0dXJuIEFscGhhbnVtZXJpY0RhdGEuZ2V0Qml0c0xlbmd0aChsZW5ndGgpXG4gICAgY2FzZSBNb2RlLktBTkpJOlxuICAgICAgcmV0dXJuIEthbmppRGF0YS5nZXRCaXRzTGVuZ3RoKGxlbmd0aClcbiAgICBjYXNlIE1vZGUuQllURTpcbiAgICAgIHJldHVybiBCeXRlRGF0YS5nZXRCaXRzTGVuZ3RoKGxlbmd0aClcbiAgfVxufVxuXG4vKipcbiAqIE1lcmdlcyBhZGphY2VudCBzZWdtZW50cyB3aGljaCBoYXZlIHRoZSBzYW1lIG1vZGVcbiAqXG4gKiBAcGFyYW0gIHtBcnJheX0gc2VncyBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXG4gKi9cbmZ1bmN0aW9uIG1lcmdlU2VnbWVudHMgKHNlZ3MpIHtcbiAgcmV0dXJuIHNlZ3MucmVkdWNlKGZ1bmN0aW9uIChhY2MsIGN1cnIpIHtcbiAgICBjb25zdCBwcmV2U2VnID0gYWNjLmxlbmd0aCAtIDEgPj0gMCA/IGFjY1thY2MubGVuZ3RoIC0gMV0gOiBudWxsXG4gICAgaWYgKHByZXZTZWcgJiYgcHJldlNlZy5tb2RlID09PSBjdXJyLm1vZGUpIHtcbiAgICAgIGFjY1thY2MubGVuZ3RoIC0gMV0uZGF0YSArPSBjdXJyLmRhdGFcbiAgICAgIHJldHVybiBhY2NcbiAgICB9XG5cbiAgICBhY2MucHVzaChjdXJyKVxuICAgIHJldHVybiBhY2NcbiAgfSwgW10pXG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgbGlzdCBvZiBhbGwgcG9zc2libGUgbm9kZXMgY29tYmluYXRpb24gd2hpY2hcbiAqIHdpbGwgYmUgdXNlZCB0byBidWlsZCBhIHNlZ21lbnRzIGdyYXBoLlxuICpcbiAqIE5vZGVzIGFyZSBkaXZpZGVkIGJ5IGdyb3Vwcy4gRWFjaCBncm91cCB3aWxsIGNvbnRhaW4gYSBsaXN0IG9mIGFsbCB0aGUgbW9kZXNcbiAqIGluIHdoaWNoIGlzIHBvc3NpYmxlIHRvIGVuY29kZSB0aGUgZ2l2ZW4gdGV4dC5cbiAqXG4gKiBGb3IgZXhhbXBsZSB0aGUgdGV4dCAnMTIzNDUnIGNhbiBiZSBlbmNvZGVkIGFzIE51bWVyaWMsIEFscGhhbnVtZXJpYyBvciBCeXRlLlxuICogVGhlIGdyb3VwIGZvciAnMTIzNDUnIHdpbGwgY29udGFpbiB0aGVuIDMgb2JqZWN0cywgb25lIGZvciBlYWNoXG4gKiBwb3NzaWJsZSBlbmNvZGluZyBtb2RlLlxuICpcbiAqIEVhY2ggbm9kZSByZXByZXNlbnRzIGEgcG9zc2libGUgc2VnbWVudC5cbiAqXG4gKiBAcGFyYW0gIHtBcnJheX0gc2VncyBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkTm9kZXMgKHNlZ3MpIHtcbiAgY29uc3Qgbm9kZXMgPSBbXVxuICBmb3IgKGxldCBpID0gMDsgaSA8IHNlZ3MubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzZWcgPSBzZWdzW2ldXG5cbiAgICBzd2l0Y2ggKHNlZy5tb2RlKSB7XG4gICAgICBjYXNlIE1vZGUuTlVNRVJJQzpcbiAgICAgICAgbm9kZXMucHVzaChbc2VnLFxuICAgICAgICAgIHsgZGF0YTogc2VnLmRhdGEsIG1vZGU6IE1vZGUuQUxQSEFOVU1FUklDLCBsZW5ndGg6IHNlZy5sZW5ndGggfSxcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkJZVEUsIGxlbmd0aDogc2VnLmxlbmd0aCB9XG4gICAgICAgIF0pXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIE1vZGUuQUxQSEFOVU1FUklDOlxuICAgICAgICBub2Rlcy5wdXNoKFtzZWcsXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5CWVRFLCBsZW5ndGg6IHNlZy5sZW5ndGggfVxuICAgICAgICBdKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBNb2RlLktBTkpJOlxuICAgICAgICBub2Rlcy5wdXNoKFtzZWcsXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5CWVRFLCBsZW5ndGg6IGdldFN0cmluZ0J5dGVMZW5ndGgoc2VnLmRhdGEpIH1cbiAgICAgICAgXSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgTW9kZS5CWVRFOlxuICAgICAgICBub2Rlcy5wdXNoKFtcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkJZVEUsIGxlbmd0aDogZ2V0U3RyaW5nQnl0ZUxlbmd0aChzZWcuZGF0YSkgfVxuICAgICAgICBdKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBub2Rlc1xufVxuXG4vKipcbiAqIEJ1aWxkcyBhIGdyYXBoIGZyb20gYSBsaXN0IG9mIG5vZGVzLlxuICogQWxsIHNlZ21lbnRzIGluIGVhY2ggbm9kZSBncm91cCB3aWxsIGJlIGNvbm5lY3RlZCB3aXRoIGFsbCB0aGUgc2VnbWVudHMgb2ZcbiAqIHRoZSBuZXh0IGdyb3VwIGFuZCBzbyBvbi5cbiAqXG4gKiBBdCBlYWNoIGNvbm5lY3Rpb24gd2lsbCBiZSBhc3NpZ25lZCBhIHdlaWdodCBkZXBlbmRpbmcgb24gdGhlXG4gKiBzZWdtZW50J3MgYnl0ZSBsZW5ndGguXG4gKlxuICogQHBhcmFtICB7QXJyYXl9IG5vZGVzICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICBHcmFwaCBvZiBhbGwgcG9zc2libGUgc2VnbWVudHNcbiAqL1xuZnVuY3Rpb24gYnVpbGRHcmFwaCAobm9kZXMsIHZlcnNpb24pIHtcbiAgY29uc3QgdGFibGUgPSB7fVxuICBjb25zdCBncmFwaCA9IHsgc3RhcnQ6IHt9IH1cbiAgbGV0IHByZXZOb2RlSWRzID0gWydzdGFydCddXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IG5vZGVHcm91cCA9IG5vZGVzW2ldXG4gICAgY29uc3QgY3VycmVudE5vZGVJZHMgPSBbXVxuXG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBub2RlR3JvdXAubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvbnN0IG5vZGUgPSBub2RlR3JvdXBbal1cbiAgICAgIGNvbnN0IGtleSA9ICcnICsgaSArIGpcblxuICAgICAgY3VycmVudE5vZGVJZHMucHVzaChrZXkpXG4gICAgICB0YWJsZVtrZXldID0geyBub2RlOiBub2RlLCBsYXN0Q291bnQ6IDAgfVxuICAgICAgZ3JhcGhba2V5XSA9IHt9XG5cbiAgICAgIGZvciAobGV0IG4gPSAwOyBuIDwgcHJldk5vZGVJZHMubGVuZ3RoOyBuKyspIHtcbiAgICAgICAgY29uc3QgcHJldk5vZGVJZCA9IHByZXZOb2RlSWRzW25dXG5cbiAgICAgICAgaWYgKHRhYmxlW3ByZXZOb2RlSWRdICYmIHRhYmxlW3ByZXZOb2RlSWRdLm5vZGUubW9kZSA9PT0gbm9kZS5tb2RlKSB7XG4gICAgICAgICAgZ3JhcGhbcHJldk5vZGVJZF1ba2V5XSA9XG4gICAgICAgICAgICBnZXRTZWdtZW50Qml0c0xlbmd0aCh0YWJsZVtwcmV2Tm9kZUlkXS5sYXN0Q291bnQgKyBub2RlLmxlbmd0aCwgbm9kZS5tb2RlKSAtXG4gICAgICAgICAgICBnZXRTZWdtZW50Qml0c0xlbmd0aCh0YWJsZVtwcmV2Tm9kZUlkXS5sYXN0Q291bnQsIG5vZGUubW9kZSlcblxuICAgICAgICAgIHRhYmxlW3ByZXZOb2RlSWRdLmxhc3RDb3VudCArPSBub2RlLmxlbmd0aFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh0YWJsZVtwcmV2Tm9kZUlkXSkgdGFibGVbcHJldk5vZGVJZF0ubGFzdENvdW50ID0gbm9kZS5sZW5ndGhcblxuICAgICAgICAgIGdyYXBoW3ByZXZOb2RlSWRdW2tleV0gPSBnZXRTZWdtZW50Qml0c0xlbmd0aChub2RlLmxlbmd0aCwgbm9kZS5tb2RlKSArXG4gICAgICAgICAgICA0ICsgTW9kZS5nZXRDaGFyQ291bnRJbmRpY2F0b3Iobm9kZS5tb2RlLCB2ZXJzaW9uKSAvLyBzd2l0Y2ggY29zdFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcHJldk5vZGVJZHMgPSBjdXJyZW50Tm9kZUlkc1xuICB9XG5cbiAgZm9yIChsZXQgbiA9IDA7IG4gPCBwcmV2Tm9kZUlkcy5sZW5ndGg7IG4rKykge1xuICAgIGdyYXBoW3ByZXZOb2RlSWRzW25dXS5lbmQgPSAwXG4gIH1cblxuICByZXR1cm4geyBtYXA6IGdyYXBoLCB0YWJsZTogdGFibGUgfVxufVxuXG4vKipcbiAqIEJ1aWxkcyBhIHNlZ21lbnQgZnJvbSBhIHNwZWNpZmllZCBkYXRhIGFuZCBtb2RlLlxuICogSWYgYSBtb2RlIGlzIG5vdCBzcGVjaWZpZWQsIHRoZSBtb3JlIHN1aXRhYmxlIHdpbGwgYmUgdXNlZC5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGEgICAgICAgICAgICAgSW5wdXQgZGF0YVxuICogQHBhcmFtICB7TW9kZSB8IFN0cmluZ30gbW9kZXNIaW50IERhdGEgbW9kZVxuICogQHJldHVybiB7U2VnbWVudH0gICAgICAgICAgICAgICAgIFNlZ21lbnRcbiAqL1xuZnVuY3Rpb24gYnVpbGRTaW5nbGVTZWdtZW50IChkYXRhLCBtb2Rlc0hpbnQpIHtcbiAgbGV0IG1vZGVcbiAgY29uc3QgYmVzdE1vZGUgPSBNb2RlLmdldEJlc3RNb2RlRm9yRGF0YShkYXRhKVxuXG4gIG1vZGUgPSBNb2RlLmZyb20obW9kZXNIaW50LCBiZXN0TW9kZSlcblxuICAvLyBNYWtlIHN1cmUgZGF0YSBjYW4gYmUgZW5jb2RlZFxuICBpZiAobW9kZSAhPT0gTW9kZS5CWVRFICYmIG1vZGUuYml0IDwgYmVzdE1vZGUuYml0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcIicgKyBkYXRhICsgJ1wiJyArXG4gICAgICAnIGNhbm5vdCBiZSBlbmNvZGVkIHdpdGggbW9kZSAnICsgTW9kZS50b1N0cmluZyhtb2RlKSArXG4gICAgICAnLlxcbiBTdWdnZXN0ZWQgbW9kZSBpczogJyArIE1vZGUudG9TdHJpbmcoYmVzdE1vZGUpKVxuICB9XG5cbiAgLy8gVXNlIE1vZGUuQllURSBpZiBLYW5qaSBzdXBwb3J0IGlzIGRpc2FibGVkXG4gIGlmIChtb2RlID09PSBNb2RlLktBTkpJICYmICFVdGlscy5pc0thbmppTW9kZUVuYWJsZWQoKSkge1xuICAgIG1vZGUgPSBNb2RlLkJZVEVcbiAgfVxuXG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgTW9kZS5OVU1FUklDOlxuICAgICAgcmV0dXJuIG5ldyBOdW1lcmljRGF0YShkYXRhKVxuXG4gICAgY2FzZSBNb2RlLkFMUEhBTlVNRVJJQzpcbiAgICAgIHJldHVybiBuZXcgQWxwaGFudW1lcmljRGF0YShkYXRhKVxuXG4gICAgY2FzZSBNb2RlLktBTkpJOlxuICAgICAgcmV0dXJuIG5ldyBLYW5qaURhdGEoZGF0YSlcblxuICAgIGNhc2UgTW9kZS5CWVRFOlxuICAgICAgcmV0dXJuIG5ldyBCeXRlRGF0YShkYXRhKVxuICB9XG59XG5cbi8qKlxuICogQnVpbGRzIGEgbGlzdCBvZiBzZWdtZW50cyBmcm9tIGFuIGFycmF5LlxuICogQXJyYXkgY2FuIGNvbnRhaW4gU3RyaW5ncyBvciBPYmplY3RzIHdpdGggc2VnbWVudCdzIGluZm8uXG4gKlxuICogRm9yIGVhY2ggaXRlbSB3aGljaCBpcyBhIHN0cmluZywgd2lsbCBiZSBnZW5lcmF0ZWQgYSBzZWdtZW50IHdpdGggdGhlIGdpdmVuXG4gKiBzdHJpbmcgYW5kIHRoZSBtb3JlIGFwcHJvcHJpYXRlIGVuY29kaW5nIG1vZGUuXG4gKlxuICogRm9yIGVhY2ggaXRlbSB3aGljaCBpcyBhbiBvYmplY3QsIHdpbGwgYmUgZ2VuZXJhdGVkIGEgc2VnbWVudCB3aXRoIHRoZSBnaXZlblxuICogZGF0YSBhbmQgbW9kZS5cbiAqIE9iamVjdHMgbXVzdCBjb250YWluIGF0IGxlYXN0IHRoZSBwcm9wZXJ0eSBcImRhdGFcIi5cbiAqIElmIHByb3BlcnR5IFwibW9kZVwiIGlzIG5vdCBwcmVzZW50LCB0aGUgbW9yZSBzdWl0YWJsZSBtb2RlIHdpbGwgYmUgdXNlZC5cbiAqXG4gKiBAcGFyYW0gIHtBcnJheX0gYXJyYXkgQXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICBBcnJheSBvZiBTZWdtZW50c1xuICovXG5leHBvcnRzLmZyb21BcnJheSA9IGZ1bmN0aW9uIGZyb21BcnJheSAoYXJyYXkpIHtcbiAgcmV0dXJuIGFycmF5LnJlZHVjZShmdW5jdGlvbiAoYWNjLCBzZWcpIHtcbiAgICBpZiAodHlwZW9mIHNlZyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGFjYy5wdXNoKGJ1aWxkU2luZ2xlU2VnbWVudChzZWcsIG51bGwpKVxuICAgIH0gZWxzZSBpZiAoc2VnLmRhdGEpIHtcbiAgICAgIGFjYy5wdXNoKGJ1aWxkU2luZ2xlU2VnbWVudChzZWcuZGF0YSwgc2VnLm1vZGUpKVxuICAgIH1cblxuICAgIHJldHVybiBhY2NcbiAgfSwgW10pXG59XG5cbi8qKlxuICogQnVpbGRzIGFuIG9wdGltaXplZCBzZXF1ZW5jZSBvZiBzZWdtZW50cyBmcm9tIGEgc3RyaW5nLFxuICogd2hpY2ggd2lsbCBwcm9kdWNlIHRoZSBzaG9ydGVzdCBwb3NzaWJsZSBiaXRzdHJlYW0uXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBkYXRhICAgIElucHV0IHN0cmluZ1xuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIHNlZ21lbnRzXG4gKi9cbmV4cG9ydHMuZnJvbVN0cmluZyA9IGZ1bmN0aW9uIGZyb21TdHJpbmcgKGRhdGEsIHZlcnNpb24pIHtcbiAgY29uc3Qgc2VncyA9IGdldFNlZ21lbnRzRnJvbVN0cmluZyhkYXRhLCBVdGlscy5pc0thbmppTW9kZUVuYWJsZWQoKSlcblxuICBjb25zdCBub2RlcyA9IGJ1aWxkTm9kZXMoc2VncylcbiAgY29uc3QgZ3JhcGggPSBidWlsZEdyYXBoKG5vZGVzLCB2ZXJzaW9uKVxuICBjb25zdCBwYXRoID0gZGlqa3N0cmEuZmluZF9wYXRoKGdyYXBoLm1hcCwgJ3N0YXJ0JywgJ2VuZCcpXG5cbiAgY29uc3Qgb3B0aW1pemVkU2VncyA9IFtdXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgcGF0aC5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBvcHRpbWl6ZWRTZWdzLnB1c2goZ3JhcGgudGFibGVbcGF0aFtpXV0ubm9kZSlcbiAgfVxuXG4gIHJldHVybiBleHBvcnRzLmZyb21BcnJheShtZXJnZVNlZ21lbnRzKG9wdGltaXplZFNlZ3MpKVxufVxuXG4vKipcbiAqIFNwbGl0cyBhIHN0cmluZyBpbiB2YXJpb3VzIHNlZ21lbnRzIHdpdGggdGhlIG1vZGVzIHdoaWNoXG4gKiBiZXN0IHJlcHJlc2VudCB0aGVpciBjb250ZW50LlxuICogVGhlIHByb2R1Y2VkIHNlZ21lbnRzIGFyZSBmYXIgZnJvbSBiZWluZyBvcHRpbWl6ZWQuXG4gKiBUaGUgb3V0cHV0IG9mIHRoaXMgZnVuY3Rpb24gaXMgb25seSB1c2VkIHRvIGVzdGltYXRlIGEgUVIgQ29kZSB2ZXJzaW9uXG4gKiB3aGljaCBtYXkgY29udGFpbiB0aGUgZGF0YS5cbiAqXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGRhdGEgSW5wdXQgc3RyaW5nXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgQXJyYXkgb2Ygc2VnbWVudHNcbiAqL1xuZXhwb3J0cy5yYXdTcGxpdCA9IGZ1bmN0aW9uIHJhd1NwbGl0IChkYXRhKSB7XG4gIHJldHVybiBleHBvcnRzLmZyb21BcnJheShcbiAgICBnZXRTZWdtZW50c0Zyb21TdHJpbmcoZGF0YSwgVXRpbHMuaXNLYW5qaU1vZGVFbmFibGVkKCkpXG4gIClcbn1cbiIsICJjb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuY29uc3QgRUNMZXZlbCA9IHJlcXVpcmUoJy4vZXJyb3ItY29ycmVjdGlvbi1sZXZlbCcpXG5jb25zdCBCaXRCdWZmZXIgPSByZXF1aXJlKCcuL2JpdC1idWZmZXInKVxuY29uc3QgQml0TWF0cml4ID0gcmVxdWlyZSgnLi9iaXQtbWF0cml4JylcbmNvbnN0IEFsaWdubWVudFBhdHRlcm4gPSByZXF1aXJlKCcuL2FsaWdubWVudC1wYXR0ZXJuJylcbmNvbnN0IEZpbmRlclBhdHRlcm4gPSByZXF1aXJlKCcuL2ZpbmRlci1wYXR0ZXJuJylcbmNvbnN0IE1hc2tQYXR0ZXJuID0gcmVxdWlyZSgnLi9tYXNrLXBhdHRlcm4nKVxuY29uc3QgRUNDb2RlID0gcmVxdWlyZSgnLi9lcnJvci1jb3JyZWN0aW9uLWNvZGUnKVxuY29uc3QgUmVlZFNvbG9tb25FbmNvZGVyID0gcmVxdWlyZSgnLi9yZWVkLXNvbG9tb24tZW5jb2RlcicpXG5jb25zdCBWZXJzaW9uID0gcmVxdWlyZSgnLi92ZXJzaW9uJylcbmNvbnN0IEZvcm1hdEluZm8gPSByZXF1aXJlKCcuL2Zvcm1hdC1pbmZvJylcbmNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxuY29uc3QgU2VnbWVudHMgPSByZXF1aXJlKCcuL3NlZ21lbnRzJylcblxuLyoqXG4gKiBRUkNvZGUgZm9yIEphdmFTY3JpcHRcbiAqXG4gKiBtb2RpZmllZCBieSBSeWFuIERheSBmb3Igbm9kZWpzIHN1cHBvcnRcbiAqIENvcHlyaWdodCAoYykgMjAxMSBSeWFuIERheVxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqICAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUVJDb2RlIGZvciBKYXZhU2NyaXB0XG4vL1xuLy8gQ29weXJpZ2h0IChjKSAyMDA5IEthenVoaWtvIEFyYXNlXG4vL1xuLy8gVVJMOiBodHRwOi8vd3d3LmQtcHJvamVjdC5jb20vXG4vL1xuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuLy8gICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuLy9cbi8vIFRoZSB3b3JkIFwiUVIgQ29kZVwiIGlzIHJlZ2lzdGVyZWQgdHJhZGVtYXJrIG9mXG4vLyBERU5TTyBXQVZFIElOQ09SUE9SQVRFRFxuLy8gICBodHRwOi8vd3d3LmRlbnNvLXdhdmUuY29tL3FyY29kZS9mYXFwYXRlbnQtZS5odG1sXG4vL1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiovXG5cbi8qKlxuICogQWRkIGZpbmRlciBwYXR0ZXJucyBiaXRzIHRvIG1hdHJpeFxuICpcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gbWF0cml4ICBNb2R1bGVzIG1hdHJpeFxuICogQHBhcmFtICB7TnVtYmVyfSAgICB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICovXG5mdW5jdGlvbiBzZXR1cEZpbmRlclBhdHRlcm4gKG1hdHJpeCwgdmVyc2lvbikge1xuICBjb25zdCBzaXplID0gbWF0cml4LnNpemVcbiAgY29uc3QgcG9zID0gRmluZGVyUGF0dGVybi5nZXRQb3NpdGlvbnModmVyc2lvbilcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBvcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHJvdyA9IHBvc1tpXVswXVxuICAgIGNvbnN0IGNvbCA9IHBvc1tpXVsxXVxuXG4gICAgZm9yIChsZXQgciA9IC0xOyByIDw9IDc7IHIrKykge1xuICAgICAgaWYgKHJvdyArIHIgPD0gLTEgfHwgc2l6ZSA8PSByb3cgKyByKSBjb250aW51ZVxuXG4gICAgICBmb3IgKGxldCBjID0gLTE7IGMgPD0gNzsgYysrKSB7XG4gICAgICAgIGlmIChjb2wgKyBjIDw9IC0xIHx8IHNpemUgPD0gY29sICsgYykgY29udGludWVcblxuICAgICAgICBpZiAoKHIgPj0gMCAmJiByIDw9IDYgJiYgKGMgPT09IDAgfHwgYyA9PT0gNikpIHx8XG4gICAgICAgICAgKGMgPj0gMCAmJiBjIDw9IDYgJiYgKHIgPT09IDAgfHwgciA9PT0gNikpIHx8XG4gICAgICAgICAgKHIgPj0gMiAmJiByIDw9IDQgJiYgYyA+PSAyICYmIGMgPD0gNCkpIHtcbiAgICAgICAgICBtYXRyaXguc2V0KHJvdyArIHIsIGNvbCArIGMsIHRydWUsIHRydWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWF0cml4LnNldChyb3cgKyByLCBjb2wgKyBjLCBmYWxzZSwgdHJ1ZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFkZCB0aW1pbmcgcGF0dGVybiBiaXRzIHRvIG1hdHJpeFxuICpcbiAqIE5vdGU6IHRoaXMgZnVuY3Rpb24gbXVzdCBiZSBjYWxsZWQgYmVmb3JlIHtAbGluayBzZXR1cEFsaWdubWVudFBhdHRlcm59XG4gKlxuICogQHBhcmFtICB7Qml0TWF0cml4fSBtYXRyaXggTW9kdWxlcyBtYXRyaXhcbiAqL1xuZnVuY3Rpb24gc2V0dXBUaW1pbmdQYXR0ZXJuIChtYXRyaXgpIHtcbiAgY29uc3Qgc2l6ZSA9IG1hdHJpeC5zaXplXG5cbiAgZm9yIChsZXQgciA9IDg7IHIgPCBzaXplIC0gODsgcisrKSB7XG4gICAgY29uc3QgdmFsdWUgPSByICUgMiA9PT0gMFxuICAgIG1hdHJpeC5zZXQociwgNiwgdmFsdWUsIHRydWUpXG4gICAgbWF0cml4LnNldCg2LCByLCB2YWx1ZSwgdHJ1ZSlcbiAgfVxufVxuXG4vKipcbiAqIEFkZCBhbGlnbm1lbnQgcGF0dGVybnMgYml0cyB0byBtYXRyaXhcbiAqXG4gKiBOb3RlOiB0aGlzIGZ1bmN0aW9uIG11c3QgYmUgY2FsbGVkIGFmdGVyIHtAbGluayBzZXR1cFRpbWluZ1BhdHRlcm59XG4gKlxuICogQHBhcmFtICB7Qml0TWF0cml4fSBtYXRyaXggIE1vZHVsZXMgbWF0cml4XG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgIHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKi9cbmZ1bmN0aW9uIHNldHVwQWxpZ25tZW50UGF0dGVybiAobWF0cml4LCB2ZXJzaW9uKSB7XG4gIGNvbnN0IHBvcyA9IEFsaWdubWVudFBhdHRlcm4uZ2V0UG9zaXRpb25zKHZlcnNpb24pXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3MubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByb3cgPSBwb3NbaV1bMF1cbiAgICBjb25zdCBjb2wgPSBwb3NbaV1bMV1cblxuICAgIGZvciAobGV0IHIgPSAtMjsgciA8PSAyOyByKyspIHtcbiAgICAgIGZvciAobGV0IGMgPSAtMjsgYyA8PSAyOyBjKyspIHtcbiAgICAgICAgaWYgKHIgPT09IC0yIHx8IHIgPT09IDIgfHwgYyA9PT0gLTIgfHwgYyA9PT0gMiB8fFxuICAgICAgICAgIChyID09PSAwICYmIGMgPT09IDApKSB7XG4gICAgICAgICAgbWF0cml4LnNldChyb3cgKyByLCBjb2wgKyBjLCB0cnVlLCB0cnVlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1hdHJpeC5zZXQocm93ICsgciwgY29sICsgYywgZmFsc2UsIHRydWUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBZGQgdmVyc2lvbiBpbmZvIGJpdHMgdG8gbWF0cml4XG4gKlxuICogQHBhcmFtICB7Qml0TWF0cml4fSBtYXRyaXggIE1vZHVsZXMgbWF0cml4XG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgIHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKi9cbmZ1bmN0aW9uIHNldHVwVmVyc2lvbkluZm8gKG1hdHJpeCwgdmVyc2lvbikge1xuICBjb25zdCBzaXplID0gbWF0cml4LnNpemVcbiAgY29uc3QgYml0cyA9IFZlcnNpb24uZ2V0RW5jb2RlZEJpdHModmVyc2lvbilcbiAgbGV0IHJvdywgY29sLCBtb2RcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IDE4OyBpKyspIHtcbiAgICByb3cgPSBNYXRoLmZsb29yKGkgLyAzKVxuICAgIGNvbCA9IGkgJSAzICsgc2l6ZSAtIDggLSAzXG4gICAgbW9kID0gKChiaXRzID4+IGkpICYgMSkgPT09IDFcblxuICAgIG1hdHJpeC5zZXQocm93LCBjb2wsIG1vZCwgdHJ1ZSlcbiAgICBtYXRyaXguc2V0KGNvbCwgcm93LCBtb2QsIHRydWUpXG4gIH1cbn1cblxuLyoqXG4gKiBBZGQgZm9ybWF0IGluZm8gYml0cyB0byBtYXRyaXhcbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCAgICAgICAgICAgICAgIE1vZHVsZXMgbWF0cml4XG4gKiBAcGFyYW0gIHtFcnJvckNvcnJlY3Rpb25MZXZlbH0gICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxuICogQHBhcmFtICB7TnVtYmVyfSAgICBtYXNrUGF0dGVybiAgICAgICAgICBNYXNrIHBhdHRlcm4gcmVmZXJlbmNlIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIHNldHVwRm9ybWF0SW5mbyAobWF0cml4LCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbWFza1BhdHRlcm4pIHtcbiAgY29uc3Qgc2l6ZSA9IG1hdHJpeC5zaXplXG4gIGNvbnN0IGJpdHMgPSBGb3JtYXRJbmZvLmdldEVuY29kZWRCaXRzKGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrUGF0dGVybilcbiAgbGV0IGksIG1vZFxuXG4gIGZvciAoaSA9IDA7IGkgPCAxNTsgaSsrKSB7XG4gICAgbW9kID0gKChiaXRzID4+IGkpICYgMSkgPT09IDFcblxuICAgIC8vIHZlcnRpY2FsXG4gICAgaWYgKGkgPCA2KSB7XG4gICAgICBtYXRyaXguc2V0KGksIDgsIG1vZCwgdHJ1ZSlcbiAgICB9IGVsc2UgaWYgKGkgPCA4KSB7XG4gICAgICBtYXRyaXguc2V0KGkgKyAxLCA4LCBtb2QsIHRydWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIG1hdHJpeC5zZXQoc2l6ZSAtIDE1ICsgaSwgOCwgbW9kLCB0cnVlKVxuICAgIH1cblxuICAgIC8vIGhvcml6b250YWxcbiAgICBpZiAoaSA8IDgpIHtcbiAgICAgIG1hdHJpeC5zZXQoOCwgc2l6ZSAtIGkgLSAxLCBtb2QsIHRydWUpXG4gICAgfSBlbHNlIGlmIChpIDwgOSkge1xuICAgICAgbWF0cml4LnNldCg4LCAxNSAtIGkgLSAxICsgMSwgbW9kLCB0cnVlKVxuICAgIH0gZWxzZSB7XG4gICAgICBtYXRyaXguc2V0KDgsIDE1IC0gaSAtIDEsIG1vZCwgdHJ1ZSlcbiAgICB9XG4gIH1cblxuICAvLyBmaXhlZCBtb2R1bGVcbiAgbWF0cml4LnNldChzaXplIC0gOCwgOCwgMSwgdHJ1ZSlcbn1cblxuLyoqXG4gKiBBZGQgZW5jb2RlZCBkYXRhIGJpdHMgdG8gbWF0cml4XG4gKlxuICogQHBhcmFtICB7Qml0TWF0cml4fSAgbWF0cml4IE1vZHVsZXMgbWF0cml4XG4gKiBAcGFyYW0gIHtVaW50OEFycmF5fSBkYXRhICAgRGF0YSBjb2Rld29yZHNcbiAqL1xuZnVuY3Rpb24gc2V0dXBEYXRhIChtYXRyaXgsIGRhdGEpIHtcbiAgY29uc3Qgc2l6ZSA9IG1hdHJpeC5zaXplXG4gIGxldCBpbmMgPSAtMVxuICBsZXQgcm93ID0gc2l6ZSAtIDFcbiAgbGV0IGJpdEluZGV4ID0gN1xuICBsZXQgYnl0ZUluZGV4ID0gMFxuXG4gIGZvciAobGV0IGNvbCA9IHNpemUgLSAxOyBjb2wgPiAwOyBjb2wgLT0gMikge1xuICAgIGlmIChjb2wgPT09IDYpIGNvbC0tXG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCAyOyBjKyspIHtcbiAgICAgICAgaWYgKCFtYXRyaXguaXNSZXNlcnZlZChyb3csIGNvbCAtIGMpKSB7XG4gICAgICAgICAgbGV0IGRhcmsgPSBmYWxzZVxuXG4gICAgICAgICAgaWYgKGJ5dGVJbmRleCA8IGRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICBkYXJrID0gKCgoZGF0YVtieXRlSW5kZXhdID4+PiBiaXRJbmRleCkgJiAxKSA9PT0gMSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBtYXRyaXguc2V0KHJvdywgY29sIC0gYywgZGFyaylcbiAgICAgICAgICBiaXRJbmRleC0tXG5cbiAgICAgICAgICBpZiAoYml0SW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICBieXRlSW5kZXgrK1xuICAgICAgICAgICAgYml0SW5kZXggPSA3XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJvdyArPSBpbmNcblxuICAgICAgaWYgKHJvdyA8IDAgfHwgc2l6ZSA8PSByb3cpIHtcbiAgICAgICAgcm93IC09IGluY1xuICAgICAgICBpbmMgPSAtaW5jXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlIGVuY29kZWQgY29kZXdvcmRzIGZyb20gZGF0YSBpbnB1dFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gICB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cbiAqIEBwYXJhbSAge0Vycm9yQ29ycmVjdGlvbkxldmVsfSAgIGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqIEBwYXJhbSAge0J5dGVEYXRhfSBkYXRhICAgICAgICAgICAgICAgICBEYXRhIGlucHV0XG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICAgICAgICAgICAgICAgICAgQnVmZmVyIGNvbnRhaW5pbmcgZW5jb2RlZCBjb2Rld29yZHNcbiAqL1xuZnVuY3Rpb24gY3JlYXRlRGF0YSAodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIHNlZ21lbnRzKSB7XG4gIC8vIFByZXBhcmUgZGF0YSBidWZmZXJcbiAgY29uc3QgYnVmZmVyID0gbmV3IEJpdEJ1ZmZlcigpXG5cbiAgc2VnbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgIC8vIHByZWZpeCBkYXRhIHdpdGggbW9kZSBpbmRpY2F0b3IgKDQgYml0cylcbiAgICBidWZmZXIucHV0KGRhdGEubW9kZS5iaXQsIDQpXG5cbiAgICAvLyBQcmVmaXggZGF0YSB3aXRoIGNoYXJhY3RlciBjb3VudCBpbmRpY2F0b3IuXG4gICAgLy8gVGhlIGNoYXJhY3RlciBjb3VudCBpbmRpY2F0b3IgaXMgYSBzdHJpbmcgb2YgYml0cyB0aGF0IHJlcHJlc2VudHMgdGhlXG4gICAgLy8gbnVtYmVyIG9mIGNoYXJhY3RlcnMgdGhhdCBhcmUgYmVpbmcgZW5jb2RlZC5cbiAgICAvLyBUaGUgY2hhcmFjdGVyIGNvdW50IGluZGljYXRvciBtdXN0IGJlIHBsYWNlZCBhZnRlciB0aGUgbW9kZSBpbmRpY2F0b3JcbiAgICAvLyBhbmQgbXVzdCBiZSBhIGNlcnRhaW4gbnVtYmVyIG9mIGJpdHMgbG9uZywgZGVwZW5kaW5nIG9uIHRoZSBRUiB2ZXJzaW9uXG4gICAgLy8gYW5kIGRhdGEgbW9kZVxuICAgIC8vIEBzZWUge0BsaW5rIE1vZGUuZ2V0Q2hhckNvdW50SW5kaWNhdG9yfS5cbiAgICBidWZmZXIucHV0KGRhdGEuZ2V0TGVuZ3RoKCksIE1vZGUuZ2V0Q2hhckNvdW50SW5kaWNhdG9yKGRhdGEubW9kZSwgdmVyc2lvbikpXG5cbiAgICAvLyBhZGQgYmluYXJ5IGRhdGEgc2VxdWVuY2UgdG8gYnVmZmVyXG4gICAgZGF0YS53cml0ZShidWZmZXIpXG4gIH0pXG5cbiAgLy8gQ2FsY3VsYXRlIHJlcXVpcmVkIG51bWJlciBvZiBiaXRzXG4gIGNvbnN0IHRvdGFsQ29kZXdvcmRzID0gVXRpbHMuZ2V0U3ltYm9sVG90YWxDb2Rld29yZHModmVyc2lvbilcbiAgY29uc3QgZWNUb3RhbENvZGV3b3JkcyA9IEVDQ29kZS5nZXRUb3RhbENvZGV3b3Jkc0NvdW50KHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKVxuICBjb25zdCBkYXRhVG90YWxDb2Rld29yZHNCaXRzID0gKHRvdGFsQ29kZXdvcmRzIC0gZWNUb3RhbENvZGV3b3JkcykgKiA4XG5cbiAgLy8gQWRkIGEgdGVybWluYXRvci5cbiAgLy8gSWYgdGhlIGJpdCBzdHJpbmcgaXMgc2hvcnRlciB0aGFuIHRoZSB0b3RhbCBudW1iZXIgb2YgcmVxdWlyZWQgYml0cyxcbiAgLy8gYSB0ZXJtaW5hdG9yIG9mIHVwIHRvIGZvdXIgMHMgbXVzdCBiZSBhZGRlZCB0byB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgc3RyaW5nLlxuICAvLyBJZiB0aGUgYml0IHN0cmluZyBpcyBtb3JlIHRoYW4gZm91ciBiaXRzIHNob3J0ZXIgdGhhbiB0aGUgcmVxdWlyZWQgbnVtYmVyIG9mIGJpdHMsXG4gIC8vIGFkZCBmb3VyIDBzIHRvIHRoZSBlbmQuXG4gIGlmIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgKyA0IDw9IGRhdGFUb3RhbENvZGV3b3Jkc0JpdHMpIHtcbiAgICBidWZmZXIucHV0KDAsIDQpXG4gIH1cblxuICAvLyBJZiB0aGUgYml0IHN0cmluZyBpcyBmZXdlciB0aGFuIGZvdXIgYml0cyBzaG9ydGVyLCBhZGQgb25seSB0aGUgbnVtYmVyIG9mIDBzIHRoYXRcbiAgLy8gYXJlIG5lZWRlZCB0byByZWFjaCB0aGUgcmVxdWlyZWQgbnVtYmVyIG9mIGJpdHMuXG5cbiAgLy8gQWZ0ZXIgYWRkaW5nIHRoZSB0ZXJtaW5hdG9yLCBpZiB0aGUgbnVtYmVyIG9mIGJpdHMgaW4gdGhlIHN0cmluZyBpcyBub3QgYSBtdWx0aXBsZSBvZiA4LFxuICAvLyBwYWQgdGhlIHN0cmluZyBvbiB0aGUgcmlnaHQgd2l0aCAwcyB0byBtYWtlIHRoZSBzdHJpbmcncyBsZW5ndGggYSBtdWx0aXBsZSBvZiA4LlxuICB3aGlsZSAoYnVmZmVyLmdldExlbmd0aEluQml0cygpICUgOCAhPT0gMCkge1xuICAgIGJ1ZmZlci5wdXRCaXQoMClcbiAgfVxuXG4gIC8vIEFkZCBwYWQgYnl0ZXMgaWYgdGhlIHN0cmluZyBpcyBzdGlsbCBzaG9ydGVyIHRoYW4gdGhlIHRvdGFsIG51bWJlciBvZiByZXF1aXJlZCBiaXRzLlxuICAvLyBFeHRlbmQgdGhlIGJ1ZmZlciB0byBmaWxsIHRoZSBkYXRhIGNhcGFjaXR5IG9mIHRoZSBzeW1ib2wgY29ycmVzcG9uZGluZyB0b1xuICAvLyB0aGUgVmVyc2lvbiBhbmQgRXJyb3IgQ29ycmVjdGlvbiBMZXZlbCBieSBhZGRpbmcgdGhlIFBhZCBDb2Rld29yZHMgMTExMDExMDAgKDB4RUMpXG4gIC8vIGFuZCAwMDAxMDAwMSAoMHgxMSkgYWx0ZXJuYXRlbHkuXG4gIGNvbnN0IHJlbWFpbmluZ0J5dGUgPSAoZGF0YVRvdGFsQ29kZXdvcmRzQml0cyAtIGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSkgLyA4XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmVtYWluaW5nQnl0ZTsgaSsrKSB7XG4gICAgYnVmZmVyLnB1dChpICUgMiA/IDB4MTEgOiAweEVDLCA4KVxuICB9XG5cbiAgcmV0dXJuIGNyZWF0ZUNvZGV3b3JkcyhidWZmZXIsIHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKVxufVxuXG4vKipcbiAqIEVuY29kZSBpbnB1dCBkYXRhIHdpdGggUmVlZC1Tb2xvbW9uIGFuZCByZXR1cm4gY29kZXdvcmRzIHdpdGhcbiAqIHJlbGF0aXZlIGVycm9yIGNvcnJlY3Rpb24gYml0c1xuICpcbiAqIEBwYXJhbSAge0JpdEJ1ZmZlcn0gYml0QnVmZmVyICAgICAgICAgICAgRGF0YSB0byBlbmNvZGVcbiAqIEBwYXJhbSAge051bWJlcn0gICAgdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcGFyYW0gIHtFcnJvckNvcnJlY3Rpb25MZXZlbH0gZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxuICogQHJldHVybiB7VWludDhBcnJheX0gICAgICAgICAgICAgICAgICAgICBCdWZmZXIgY29udGFpbmluZyBlbmNvZGVkIGNvZGV3b3Jkc1xuICovXG5mdW5jdGlvbiBjcmVhdGVDb2Rld29yZHMgKGJpdEJ1ZmZlciwgdmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcbiAgLy8gVG90YWwgY29kZXdvcmRzIGZvciB0aGlzIFFSIGNvZGUgdmVyc2lvbiAoRGF0YSArIEVycm9yIGNvcnJlY3Rpb24pXG4gIGNvbnN0IHRvdGFsQ29kZXdvcmRzID0gVXRpbHMuZ2V0U3ltYm9sVG90YWxDb2Rld29yZHModmVyc2lvbilcblxuICAvLyBUb3RhbCBudW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHNcbiAgY29uc3QgZWNUb3RhbENvZGV3b3JkcyA9IEVDQ29kZS5nZXRUb3RhbENvZGV3b3Jkc0NvdW50KHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKVxuXG4gIC8vIFRvdGFsIG51bWJlciBvZiBkYXRhIGNvZGV3b3Jkc1xuICBjb25zdCBkYXRhVG90YWxDb2Rld29yZHMgPSB0b3RhbENvZGV3b3JkcyAtIGVjVG90YWxDb2Rld29yZHNcblxuICAvLyBUb3RhbCBudW1iZXIgb2YgYmxvY2tzXG4gIGNvbnN0IGVjVG90YWxCbG9ja3MgPSBFQ0NvZGUuZ2V0QmxvY2tzQ291bnQodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXG5cbiAgLy8gQ2FsY3VsYXRlIGhvdyBtYW55IGJsb2NrcyBlYWNoIGdyb3VwIHNob3VsZCBjb250YWluXG4gIGNvbnN0IGJsb2Nrc0luR3JvdXAyID0gdG90YWxDb2Rld29yZHMgJSBlY1RvdGFsQmxvY2tzXG4gIGNvbnN0IGJsb2Nrc0luR3JvdXAxID0gZWNUb3RhbEJsb2NrcyAtIGJsb2Nrc0luR3JvdXAyXG5cbiAgY29uc3QgdG90YWxDb2Rld29yZHNJbkdyb3VwMSA9IE1hdGguZmxvb3IodG90YWxDb2Rld29yZHMgLyBlY1RvdGFsQmxvY2tzKVxuXG4gIGNvbnN0IGRhdGFDb2Rld29yZHNJbkdyb3VwMSA9IE1hdGguZmxvb3IoZGF0YVRvdGFsQ29kZXdvcmRzIC8gZWNUb3RhbEJsb2NrcylcbiAgY29uc3QgZGF0YUNvZGV3b3Jkc0luR3JvdXAyID0gZGF0YUNvZGV3b3Jkc0luR3JvdXAxICsgMVxuXG4gIC8vIE51bWJlciBvZiBFQyBjb2Rld29yZHMgaXMgdGhlIHNhbWUgZm9yIGJvdGggZ3JvdXBzXG4gIGNvbnN0IGVjQ291bnQgPSB0b3RhbENvZGV3b3Jkc0luR3JvdXAxIC0gZGF0YUNvZGV3b3Jkc0luR3JvdXAxXG5cbiAgLy8gSW5pdGlhbGl6ZSBhIFJlZWQtU29sb21vbiBlbmNvZGVyIHdpdGggYSBnZW5lcmF0b3IgcG9seW5vbWlhbCBvZiBkZWdyZWUgZWNDb3VudFxuICBjb25zdCBycyA9IG5ldyBSZWVkU29sb21vbkVuY29kZXIoZWNDb3VudClcblxuICBsZXQgb2Zmc2V0ID0gMFxuICBjb25zdCBkY0RhdGEgPSBuZXcgQXJyYXkoZWNUb3RhbEJsb2NrcylcbiAgY29uc3QgZWNEYXRhID0gbmV3IEFycmF5KGVjVG90YWxCbG9ja3MpXG4gIGxldCBtYXhEYXRhU2l6ZSA9IDBcbiAgY29uc3QgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYml0QnVmZmVyLmJ1ZmZlcilcblxuICAvLyBEaXZpZGUgdGhlIGJ1ZmZlciBpbnRvIHRoZSByZXF1aXJlZCBudW1iZXIgb2YgYmxvY2tzXG4gIGZvciAobGV0IGIgPSAwOyBiIDwgZWNUb3RhbEJsb2NrczsgYisrKSB7XG4gICAgY29uc3QgZGF0YVNpemUgPSBiIDwgYmxvY2tzSW5Hcm91cDEgPyBkYXRhQ29kZXdvcmRzSW5Hcm91cDEgOiBkYXRhQ29kZXdvcmRzSW5Hcm91cDJcblxuICAgIC8vIGV4dHJhY3QgYSBibG9jayBvZiBkYXRhIGZyb20gYnVmZmVyXG4gICAgZGNEYXRhW2JdID0gYnVmZmVyLnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgZGF0YVNpemUpXG5cbiAgICAvLyBDYWxjdWxhdGUgRUMgY29kZXdvcmRzIGZvciB0aGlzIGRhdGEgYmxvY2tcbiAgICBlY0RhdGFbYl0gPSBycy5lbmNvZGUoZGNEYXRhW2JdKVxuXG4gICAgb2Zmc2V0ICs9IGRhdGFTaXplXG4gICAgbWF4RGF0YVNpemUgPSBNYXRoLm1heChtYXhEYXRhU2l6ZSwgZGF0YVNpemUpXG4gIH1cblxuICAvLyBDcmVhdGUgZmluYWwgZGF0YVxuICAvLyBJbnRlcmxlYXZlIHRoZSBkYXRhIGFuZCBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3JkcyBmcm9tIGVhY2ggYmxvY2tcbiAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KHRvdGFsQ29kZXdvcmRzKVxuICBsZXQgaW5kZXggPSAwXG4gIGxldCBpLCByXG5cbiAgLy8gQWRkIGRhdGEgY29kZXdvcmRzXG4gIGZvciAoaSA9IDA7IGkgPCBtYXhEYXRhU2l6ZTsgaSsrKSB7XG4gICAgZm9yIChyID0gMDsgciA8IGVjVG90YWxCbG9ja3M7IHIrKykge1xuICAgICAgaWYgKGkgPCBkY0RhdGFbcl0ubGVuZ3RoKSB7XG4gICAgICAgIGRhdGFbaW5kZXgrK10gPSBkY0RhdGFbcl1baV1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBBcHBlZCBFQyBjb2Rld29yZHNcbiAgZm9yIChpID0gMDsgaSA8IGVjQ291bnQ7IGkrKykge1xuICAgIGZvciAociA9IDA7IHIgPCBlY1RvdGFsQmxvY2tzOyByKyspIHtcbiAgICAgIGRhdGFbaW5kZXgrK10gPSBlY0RhdGFbcl1baV1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gZGF0YVxufVxuXG4vKipcbiAqIEJ1aWxkIFFSIENvZGUgc3ltYm9sXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBkYXRhICAgICAgICAgICAgICAgICBJbnB1dCBzdHJpbmdcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcGFyYW0gIHtFcnJvckNvcnJldGlvbkxldmVsfSBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBsZXZlbFxuICogQHBhcmFtICB7TWFza1BhdHRlcm59IG1hc2tQYXR0ZXJuICAgICBNYXNrIHBhdHRlcm5cbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgICAgICAgICAgICAgT2JqZWN0IGNvbnRhaW5pbmcgc3ltYm9sIGRhdGFcbiAqL1xuZnVuY3Rpb24gY3JlYXRlU3ltYm9sIChkYXRhLCB2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbWFza1BhdHRlcm4pIHtcbiAgbGV0IHNlZ21lbnRzXG5cbiAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcbiAgICBzZWdtZW50cyA9IFNlZ21lbnRzLmZyb21BcnJheShkYXRhKVxuICB9IGVsc2UgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykge1xuICAgIGxldCBlc3RpbWF0ZWRWZXJzaW9uID0gdmVyc2lvblxuXG4gICAgaWYgKCFlc3RpbWF0ZWRWZXJzaW9uKSB7XG4gICAgICBjb25zdCByYXdTZWdtZW50cyA9IFNlZ21lbnRzLnJhd1NwbGl0KGRhdGEpXG5cbiAgICAgIC8vIEVzdGltYXRlIGJlc3QgdmVyc2lvbiB0aGF0IGNhbiBjb250YWluIHJhdyBzcGxpdHRlZCBzZWdtZW50c1xuICAgICAgZXN0aW1hdGVkVmVyc2lvbiA9IFZlcnNpb24uZ2V0QmVzdFZlcnNpb25Gb3JEYXRhKHJhd1NlZ21lbnRzLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcbiAgICB9XG5cbiAgICAvLyBCdWlsZCBvcHRpbWl6ZWQgc2VnbWVudHNcbiAgICAvLyBJZiBlc3RpbWF0ZWQgdmVyc2lvbiBpcyB1bmRlZmluZWQsIHRyeSB3aXRoIHRoZSBoaWdoZXN0IHZlcnNpb25cbiAgICBzZWdtZW50cyA9IFNlZ21lbnRzLmZyb21TdHJpbmcoZGF0YSwgZXN0aW1hdGVkVmVyc2lvbiB8fCA0MClcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZGF0YScpXG4gIH1cblxuICAvLyBHZXQgdGhlIG1pbiB2ZXJzaW9uIHRoYXQgY2FuIGNvbnRhaW4gZGF0YVxuICBjb25zdCBiZXN0VmVyc2lvbiA9IFZlcnNpb24uZ2V0QmVzdFZlcnNpb25Gb3JEYXRhKHNlZ21lbnRzLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcblxuICAvLyBJZiBubyB2ZXJzaW9uIGlzIGZvdW5kLCBkYXRhIGNhbm5vdCBiZSBzdG9yZWRcbiAgaWYgKCFiZXN0VmVyc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhlIGFtb3VudCBvZiBkYXRhIGlzIHRvbyBiaWcgdG8gYmUgc3RvcmVkIGluIGEgUVIgQ29kZScpXG4gIH1cblxuICAvLyBJZiBub3Qgc3BlY2lmaWVkLCB1c2UgbWluIHZlcnNpb24gYXMgZGVmYXVsdFxuICBpZiAoIXZlcnNpb24pIHtcbiAgICB2ZXJzaW9uID0gYmVzdFZlcnNpb25cblxuICAvLyBDaGVjayBpZiB0aGUgc3BlY2lmaWVkIHZlcnNpb24gY2FuIGNvbnRhaW4gdGhlIGRhdGFcbiAgfSBlbHNlIGlmICh2ZXJzaW9uIDwgYmVzdFZlcnNpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1xcbicgK1xuICAgICAgJ1RoZSBjaG9zZW4gUVIgQ29kZSB2ZXJzaW9uIGNhbm5vdCBjb250YWluIHRoaXMgYW1vdW50IG9mIGRhdGEuXFxuJyArXG4gICAgICAnTWluaW11bSB2ZXJzaW9uIHJlcXVpcmVkIHRvIHN0b3JlIGN1cnJlbnQgZGF0YSBpczogJyArIGJlc3RWZXJzaW9uICsgJy5cXG4nXG4gICAgKVxuICB9XG5cbiAgY29uc3QgZGF0YUJpdHMgPSBjcmVhdGVEYXRhKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBzZWdtZW50cylcblxuICAvLyBBbGxvY2F0ZSBtYXRyaXggYnVmZmVyXG4gIGNvbnN0IG1vZHVsZUNvdW50ID0gVXRpbHMuZ2V0U3ltYm9sU2l6ZSh2ZXJzaW9uKVxuICBjb25zdCBtb2R1bGVzID0gbmV3IEJpdE1hdHJpeChtb2R1bGVDb3VudClcblxuICAvLyBBZGQgZnVuY3Rpb24gbW9kdWxlc1xuICBzZXR1cEZpbmRlclBhdHRlcm4obW9kdWxlcywgdmVyc2lvbilcbiAgc2V0dXBUaW1pbmdQYXR0ZXJuKG1vZHVsZXMpXG4gIHNldHVwQWxpZ25tZW50UGF0dGVybihtb2R1bGVzLCB2ZXJzaW9uKVxuXG4gIC8vIEFkZCB0ZW1wb3JhcnkgZHVtbXkgYml0cyBmb3IgZm9ybWF0IGluZm8ganVzdCB0byBzZXQgdGhlbSBhcyByZXNlcnZlZC5cbiAgLy8gVGhpcyBpcyBuZWVkZWQgdG8gcHJldmVudCB0aGVzZSBiaXRzIGZyb20gYmVpbmcgbWFza2VkIGJ5IHtAbGluayBNYXNrUGF0dGVybi5hcHBseU1hc2t9XG4gIC8vIHNpbmNlIHRoZSBtYXNraW5nIG9wZXJhdGlvbiBtdXN0IGJlIHBlcmZvcm1lZCBvbmx5IG9uIHRoZSBlbmNvZGluZyByZWdpb24uXG4gIC8vIFRoZXNlIGJsb2NrcyB3aWxsIGJlIHJlcGxhY2VkIHdpdGggY29ycmVjdCB2YWx1ZXMgbGF0ZXIgaW4gY29kZS5cbiAgc2V0dXBGb3JtYXRJbmZvKG1vZHVsZXMsIGVycm9yQ29ycmVjdGlvbkxldmVsLCAwKVxuXG4gIGlmICh2ZXJzaW9uID49IDcpIHtcbiAgICBzZXR1cFZlcnNpb25JbmZvKG1vZHVsZXMsIHZlcnNpb24pXG4gIH1cblxuICAvLyBBZGQgZGF0YSBjb2Rld29yZHNcbiAgc2V0dXBEYXRhKG1vZHVsZXMsIGRhdGFCaXRzKVxuXG4gIGlmIChpc05hTihtYXNrUGF0dGVybikpIHtcbiAgICAvLyBGaW5kIGJlc3QgbWFzayBwYXR0ZXJuXG4gICAgbWFza1BhdHRlcm4gPSBNYXNrUGF0dGVybi5nZXRCZXN0TWFzayhtb2R1bGVzLFxuICAgICAgc2V0dXBGb3JtYXRJbmZvLmJpbmQobnVsbCwgbW9kdWxlcywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpKVxuICB9XG5cbiAgLy8gQXBwbHkgbWFzayBwYXR0ZXJuXG4gIE1hc2tQYXR0ZXJuLmFwcGx5TWFzayhtYXNrUGF0dGVybiwgbW9kdWxlcylcblxuICAvLyBSZXBsYWNlIGZvcm1hdCBpbmZvIGJpdHMgd2l0aCBjb3JyZWN0IHZhbHVlc1xuICBzZXR1cEZvcm1hdEluZm8obW9kdWxlcywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2tQYXR0ZXJuKVxuXG4gIHJldHVybiB7XG4gICAgbW9kdWxlczogbW9kdWxlcyxcbiAgICB2ZXJzaW9uOiB2ZXJzaW9uLFxuICAgIGVycm9yQ29ycmVjdGlvbkxldmVsOiBlcnJvckNvcnJlY3Rpb25MZXZlbCxcbiAgICBtYXNrUGF0dGVybjogbWFza1BhdHRlcm4sXG4gICAgc2VnbWVudHM6IHNlZ21lbnRzXG4gIH1cbn1cblxuLyoqXG4gKiBRUiBDb2RlXG4gKlxuICogQHBhcmFtIHtTdHJpbmcgfCBBcnJheX0gZGF0YSAgICAgICAgICAgICAgICAgSW5wdXQgZGF0YVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgICAgICAgICAgICAgICAgICAgICAgT3B0aW9uYWwgY29uZmlndXJhdGlvbnNcbiAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLnZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMuZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxuICogQHBhcmFtIHtGdW5jdGlvbn0gb3B0aW9ucy50b1NKSVNGdW5jICAgICAgICAgSGVscGVyIGZ1bmMgdG8gY29udmVydCB1dGY4IHRvIHNqaXNcbiAqL1xuZXhwb3J0cy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUgKGRhdGEsIG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyB8fCBkYXRhID09PSAnJykge1xuICAgIHRocm93IG5ldyBFcnJvcignTm8gaW5wdXQgdGV4dCcpXG4gIH1cblxuICBsZXQgZXJyb3JDb3JyZWN0aW9uTGV2ZWwgPSBFQ0xldmVsLk1cbiAgbGV0IHZlcnNpb25cbiAgbGV0IG1hc2tcblxuICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gVXNlIGhpZ2hlciBlcnJvciBjb3JyZWN0aW9uIGxldmVsIGFzIGRlZmF1bHRcbiAgICBlcnJvckNvcnJlY3Rpb25MZXZlbCA9IEVDTGV2ZWwuZnJvbShvcHRpb25zLmVycm9yQ29ycmVjdGlvbkxldmVsLCBFQ0xldmVsLk0pXG4gICAgdmVyc2lvbiA9IFZlcnNpb24uZnJvbShvcHRpb25zLnZlcnNpb24pXG4gICAgbWFzayA9IE1hc2tQYXR0ZXJuLmZyb20ob3B0aW9ucy5tYXNrUGF0dGVybilcblxuICAgIGlmIChvcHRpb25zLnRvU0pJU0Z1bmMpIHtcbiAgICAgIFV0aWxzLnNldFRvU0pJU0Z1bmN0aW9uKG9wdGlvbnMudG9TSklTRnVuYylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY3JlYXRlU3ltYm9sKGRhdGEsIHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrKVxufVxuIiwgImZ1bmN0aW9uIGhleDJyZ2JhIChoZXgpIHtcbiAgaWYgKHR5cGVvZiBoZXggPT09ICdudW1iZXInKSB7XG4gICAgaGV4ID0gaGV4LnRvU3RyaW5nKClcbiAgfVxuXG4gIGlmICh0eXBlb2YgaGV4ICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBFcnJvcignQ29sb3Igc2hvdWxkIGJlIGRlZmluZWQgYXMgaGV4IHN0cmluZycpXG4gIH1cblxuICBsZXQgaGV4Q29kZSA9IGhleC5zbGljZSgpLnJlcGxhY2UoJyMnLCAnJykuc3BsaXQoJycpXG4gIGlmIChoZXhDb2RlLmxlbmd0aCA8IDMgfHwgaGV4Q29kZS5sZW5ndGggPT09IDUgfHwgaGV4Q29kZS5sZW5ndGggPiA4KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBjb2xvcjogJyArIGhleClcbiAgfVxuXG4gIC8vIENvbnZlcnQgZnJvbSBzaG9ydCB0byBsb25nIGZvcm0gKGZmZiAtPiBmZmZmZmYpXG4gIGlmIChoZXhDb2RlLmxlbmd0aCA9PT0gMyB8fCBoZXhDb2RlLmxlbmd0aCA9PT0gNCkge1xuICAgIGhleENvZGUgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBoZXhDb2RlLm1hcChmdW5jdGlvbiAoYykge1xuICAgICAgcmV0dXJuIFtjLCBjXVxuICAgIH0pKVxuICB9XG5cbiAgLy8gQWRkIGRlZmF1bHQgYWxwaGEgdmFsdWVcbiAgaWYgKGhleENvZGUubGVuZ3RoID09PSA2KSBoZXhDb2RlLnB1c2goJ0YnLCAnRicpXG5cbiAgY29uc3QgaGV4VmFsdWUgPSBwYXJzZUludChoZXhDb2RlLmpvaW4oJycpLCAxNilcblxuICByZXR1cm4ge1xuICAgIHI6IChoZXhWYWx1ZSA+PiAyNCkgJiAyNTUsXG4gICAgZzogKGhleFZhbHVlID4+IDE2KSAmIDI1NSxcbiAgICBiOiAoaGV4VmFsdWUgPj4gOCkgJiAyNTUsXG4gICAgYTogaGV4VmFsdWUgJiAyNTUsXG4gICAgaGV4OiAnIycgKyBoZXhDb2RlLnNsaWNlKDAsIDYpLmpvaW4oJycpXG4gIH1cbn1cblxuZXhwb3J0cy5nZXRPcHRpb25zID0gZnVuY3Rpb24gZ2V0T3B0aW9ucyAob3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fVxuICBpZiAoIW9wdGlvbnMuY29sb3IpIG9wdGlvbnMuY29sb3IgPSB7fVxuXG4gIGNvbnN0IG1hcmdpbiA9IHR5cGVvZiBvcHRpb25zLm1hcmdpbiA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICBvcHRpb25zLm1hcmdpbiA9PT0gbnVsbCB8fFxuICAgIG9wdGlvbnMubWFyZ2luIDwgMFxuICAgID8gNFxuICAgIDogb3B0aW9ucy5tYXJnaW5cblxuICBjb25zdCB3aWR0aCA9IG9wdGlvbnMud2lkdGggJiYgb3B0aW9ucy53aWR0aCA+PSAyMSA/IG9wdGlvbnMud2lkdGggOiB1bmRlZmluZWRcbiAgY29uc3Qgc2NhbGUgPSBvcHRpb25zLnNjYWxlIHx8IDRcblxuICByZXR1cm4ge1xuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBzY2FsZTogd2lkdGggPyA0IDogc2NhbGUsXG4gICAgbWFyZ2luOiBtYXJnaW4sXG4gICAgY29sb3I6IHtcbiAgICAgIGRhcms6IGhleDJyZ2JhKG9wdGlvbnMuY29sb3IuZGFyayB8fCAnIzAwMDAwMGZmJyksXG4gICAgICBsaWdodDogaGV4MnJnYmEob3B0aW9ucy5jb2xvci5saWdodCB8fCAnI2ZmZmZmZmZmJylcbiAgICB9LFxuICAgIHR5cGU6IG9wdGlvbnMudHlwZSxcbiAgICByZW5kZXJlck9wdHM6IG9wdGlvbnMucmVuZGVyZXJPcHRzIHx8IHt9XG4gIH1cbn1cblxuZXhwb3J0cy5nZXRTY2FsZSA9IGZ1bmN0aW9uIGdldFNjYWxlIChxclNpemUsIG9wdHMpIHtcbiAgcmV0dXJuIG9wdHMud2lkdGggJiYgb3B0cy53aWR0aCA+PSBxclNpemUgKyBvcHRzLm1hcmdpbiAqIDJcbiAgICA/IG9wdHMud2lkdGggLyAocXJTaXplICsgb3B0cy5tYXJnaW4gKiAyKVxuICAgIDogb3B0cy5zY2FsZVxufVxuXG5leHBvcnRzLmdldEltYWdlV2lkdGggPSBmdW5jdGlvbiBnZXRJbWFnZVdpZHRoIChxclNpemUsIG9wdHMpIHtcbiAgY29uc3Qgc2NhbGUgPSBleHBvcnRzLmdldFNjYWxlKHFyU2l6ZSwgb3B0cylcbiAgcmV0dXJuIE1hdGguZmxvb3IoKHFyU2l6ZSArIG9wdHMubWFyZ2luICogMikgKiBzY2FsZSlcbn1cblxuZXhwb3J0cy5xclRvSW1hZ2VEYXRhID0gZnVuY3Rpb24gcXJUb0ltYWdlRGF0YSAoaW1nRGF0YSwgcXIsIG9wdHMpIHtcbiAgY29uc3Qgc2l6ZSA9IHFyLm1vZHVsZXMuc2l6ZVxuICBjb25zdCBkYXRhID0gcXIubW9kdWxlcy5kYXRhXG4gIGNvbnN0IHNjYWxlID0gZXhwb3J0cy5nZXRTY2FsZShzaXplLCBvcHRzKVxuICBjb25zdCBzeW1ib2xTaXplID0gTWF0aC5mbG9vcigoc2l6ZSArIG9wdHMubWFyZ2luICogMikgKiBzY2FsZSlcbiAgY29uc3Qgc2NhbGVkTWFyZ2luID0gb3B0cy5tYXJnaW4gKiBzY2FsZVxuICBjb25zdCBwYWxldHRlID0gW29wdHMuY29sb3IubGlnaHQsIG9wdHMuY29sb3IuZGFya11cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHN5bWJvbFNpemU7IGkrKykge1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgc3ltYm9sU2l6ZTsgaisrKSB7XG4gICAgICBsZXQgcG9zRHN0ID0gKGkgKiBzeW1ib2xTaXplICsgaikgKiA0XG4gICAgICBsZXQgcHhDb2xvciA9IG9wdHMuY29sb3IubGlnaHRcblxuICAgICAgaWYgKGkgPj0gc2NhbGVkTWFyZ2luICYmIGogPj0gc2NhbGVkTWFyZ2luICYmXG4gICAgICAgIGkgPCBzeW1ib2xTaXplIC0gc2NhbGVkTWFyZ2luICYmIGogPCBzeW1ib2xTaXplIC0gc2NhbGVkTWFyZ2luKSB7XG4gICAgICAgIGNvbnN0IGlTcmMgPSBNYXRoLmZsb29yKChpIC0gc2NhbGVkTWFyZ2luKSAvIHNjYWxlKVxuICAgICAgICBjb25zdCBqU3JjID0gTWF0aC5mbG9vcigoaiAtIHNjYWxlZE1hcmdpbikgLyBzY2FsZSlcbiAgICAgICAgcHhDb2xvciA9IHBhbGV0dGVbZGF0YVtpU3JjICogc2l6ZSArIGpTcmNdID8gMSA6IDBdXG4gICAgICB9XG5cbiAgICAgIGltZ0RhdGFbcG9zRHN0KytdID0gcHhDb2xvci5yXG4gICAgICBpbWdEYXRhW3Bvc0RzdCsrXSA9IHB4Q29sb3IuZ1xuICAgICAgaW1nRGF0YVtwb3NEc3QrK10gPSBweENvbG9yLmJcbiAgICAgIGltZ0RhdGFbcG9zRHN0XSA9IHB4Q29sb3IuYVxuICAgIH1cbiAgfVxufVxuIiwgImNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5cbmZ1bmN0aW9uIGNsZWFyQ2FudmFzIChjdHgsIGNhbnZhcywgc2l6ZSkge1xuICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodClcblxuICBpZiAoIWNhbnZhcy5zdHlsZSkgY2FudmFzLnN0eWxlID0ge31cbiAgY2FudmFzLmhlaWdodCA9IHNpemVcbiAgY2FudmFzLndpZHRoID0gc2l6ZVxuICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gc2l6ZSArICdweCdcbiAgY2FudmFzLnN0eWxlLndpZHRoID0gc2l6ZSArICdweCdcbn1cblxuZnVuY3Rpb24gZ2V0Q2FudmFzRWxlbWVudCAoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBuZWVkIHRvIHNwZWNpZnkgYSBjYW52YXMgZWxlbWVudCcpXG4gIH1cbn1cblxuZXhwb3J0cy5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIgKHFyRGF0YSwgY2FudmFzLCBvcHRpb25zKSB7XG4gIGxldCBvcHRzID0gb3B0aW9uc1xuICBsZXQgY2FudmFzRWwgPSBjYW52YXNcblxuICBpZiAodHlwZW9mIG9wdHMgPT09ICd1bmRlZmluZWQnICYmICghY2FudmFzIHx8ICFjYW52YXMuZ2V0Q29udGV4dCkpIHtcbiAgICBvcHRzID0gY2FudmFzXG4gICAgY2FudmFzID0gdW5kZWZpbmVkXG4gIH1cblxuICBpZiAoIWNhbnZhcykge1xuICAgIGNhbnZhc0VsID0gZ2V0Q2FudmFzRWxlbWVudCgpXG4gIH1cblxuICBvcHRzID0gVXRpbHMuZ2V0T3B0aW9ucyhvcHRzKVxuICBjb25zdCBzaXplID0gVXRpbHMuZ2V0SW1hZ2VXaWR0aChxckRhdGEubW9kdWxlcy5zaXplLCBvcHRzKVxuXG4gIGNvbnN0IGN0eCA9IGNhbnZhc0VsLmdldENvbnRleHQoJzJkJylcbiAgY29uc3QgaW1hZ2UgPSBjdHguY3JlYXRlSW1hZ2VEYXRhKHNpemUsIHNpemUpXG4gIFV0aWxzLnFyVG9JbWFnZURhdGEoaW1hZ2UuZGF0YSwgcXJEYXRhLCBvcHRzKVxuXG4gIGNsZWFyQ2FudmFzKGN0eCwgY2FudmFzRWwsIHNpemUpXG4gIGN0eC5wdXRJbWFnZURhdGEoaW1hZ2UsIDAsIDApXG5cbiAgcmV0dXJuIGNhbnZhc0VsXG59XG5cbmV4cG9ydHMucmVuZGVyVG9EYXRhVVJMID0gZnVuY3Rpb24gcmVuZGVyVG9EYXRhVVJMIChxckRhdGEsIGNhbnZhcywgb3B0aW9ucykge1xuICBsZXQgb3B0cyA9IG9wdGlvbnNcblxuICBpZiAodHlwZW9mIG9wdHMgPT09ICd1bmRlZmluZWQnICYmICghY2FudmFzIHx8ICFjYW52YXMuZ2V0Q29udGV4dCkpIHtcbiAgICBvcHRzID0gY2FudmFzXG4gICAgY2FudmFzID0gdW5kZWZpbmVkXG4gIH1cblxuICBpZiAoIW9wdHMpIG9wdHMgPSB7fVxuXG4gIGNvbnN0IGNhbnZhc0VsID0gZXhwb3J0cy5yZW5kZXIocXJEYXRhLCBjYW52YXMsIG9wdHMpXG5cbiAgY29uc3QgdHlwZSA9IG9wdHMudHlwZSB8fCAnaW1hZ2UvcG5nJ1xuICBjb25zdCByZW5kZXJlck9wdHMgPSBvcHRzLnJlbmRlcmVyT3B0cyB8fCB7fVxuXG4gIHJldHVybiBjYW52YXNFbC50b0RhdGFVUkwodHlwZSwgcmVuZGVyZXJPcHRzLnF1YWxpdHkpXG59XG4iLCAiY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcblxuZnVuY3Rpb24gZ2V0Q29sb3JBdHRyaWIgKGNvbG9yLCBhdHRyaWIpIHtcbiAgY29uc3QgYWxwaGEgPSBjb2xvci5hIC8gMjU1XG4gIGNvbnN0IHN0ciA9IGF0dHJpYiArICc9XCInICsgY29sb3IuaGV4ICsgJ1wiJ1xuXG4gIHJldHVybiBhbHBoYSA8IDFcbiAgICA/IHN0ciArICcgJyArIGF0dHJpYiArICctb3BhY2l0eT1cIicgKyBhbHBoYS50b0ZpeGVkKDIpLnNsaWNlKDEpICsgJ1wiJ1xuICAgIDogc3RyXG59XG5cbmZ1bmN0aW9uIHN2Z0NtZCAoY21kLCB4LCB5KSB7XG4gIGxldCBzdHIgPSBjbWQgKyB4XG4gIGlmICh0eXBlb2YgeSAhPT0gJ3VuZGVmaW5lZCcpIHN0ciArPSAnICcgKyB5XG5cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiBxclRvUGF0aCAoZGF0YSwgc2l6ZSwgbWFyZ2luKSB7XG4gIGxldCBwYXRoID0gJydcbiAgbGV0IG1vdmVCeSA9IDBcbiAgbGV0IG5ld1JvdyA9IGZhbHNlXG4gIGxldCBsaW5lTGVuZ3RoID0gMFxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNvbCA9IE1hdGguZmxvb3IoaSAlIHNpemUpXG4gICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcihpIC8gc2l6ZSlcblxuICAgIGlmICghY29sICYmICFuZXdSb3cpIG5ld1JvdyA9IHRydWVcblxuICAgIGlmIChkYXRhW2ldKSB7XG4gICAgICBsaW5lTGVuZ3RoKytcblxuICAgICAgaWYgKCEoaSA+IDAgJiYgY29sID4gMCAmJiBkYXRhW2kgLSAxXSkpIHtcbiAgICAgICAgcGF0aCArPSBuZXdSb3dcbiAgICAgICAgICA/IHN2Z0NtZCgnTScsIGNvbCArIG1hcmdpbiwgMC41ICsgcm93ICsgbWFyZ2luKVxuICAgICAgICAgIDogc3ZnQ21kKCdtJywgbW92ZUJ5LCAwKVxuXG4gICAgICAgIG1vdmVCeSA9IDBcbiAgICAgICAgbmV3Um93ID0gZmFsc2VcbiAgICAgIH1cblxuICAgICAgaWYgKCEoY29sICsgMSA8IHNpemUgJiYgZGF0YVtpICsgMV0pKSB7XG4gICAgICAgIHBhdGggKz0gc3ZnQ21kKCdoJywgbGluZUxlbmd0aClcbiAgICAgICAgbGluZUxlbmd0aCA9IDBcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbW92ZUJ5KytcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGF0aFxufVxuXG5leHBvcnRzLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlciAocXJEYXRhLCBvcHRpb25zLCBjYikge1xuICBjb25zdCBvcHRzID0gVXRpbHMuZ2V0T3B0aW9ucyhvcHRpb25zKVxuICBjb25zdCBzaXplID0gcXJEYXRhLm1vZHVsZXMuc2l6ZVxuICBjb25zdCBkYXRhID0gcXJEYXRhLm1vZHVsZXMuZGF0YVxuICBjb25zdCBxcmNvZGVzaXplID0gc2l6ZSArIG9wdHMubWFyZ2luICogMlxuXG4gIGNvbnN0IGJnID0gIW9wdHMuY29sb3IubGlnaHQuYVxuICAgID8gJydcbiAgICA6ICc8cGF0aCAnICsgZ2V0Q29sb3JBdHRyaWIob3B0cy5jb2xvci5saWdodCwgJ2ZpbGwnKSArXG4gICAgICAnIGQ9XCJNMCAwaCcgKyBxcmNvZGVzaXplICsgJ3YnICsgcXJjb2Rlc2l6ZSArICdIMHpcIi8+J1xuXG4gIGNvbnN0IHBhdGggPVxuICAgICc8cGF0aCAnICsgZ2V0Q29sb3JBdHRyaWIob3B0cy5jb2xvci5kYXJrLCAnc3Ryb2tlJykgK1xuICAgICcgZD1cIicgKyBxclRvUGF0aChkYXRhLCBzaXplLCBvcHRzLm1hcmdpbikgKyAnXCIvPidcblxuICBjb25zdCB2aWV3Qm94ID0gJ3ZpZXdCb3g9XCInICsgJzAgMCAnICsgcXJjb2Rlc2l6ZSArICcgJyArIHFyY29kZXNpemUgKyAnXCInXG5cbiAgY29uc3Qgd2lkdGggPSAhb3B0cy53aWR0aCA/ICcnIDogJ3dpZHRoPVwiJyArIG9wdHMud2lkdGggKyAnXCIgaGVpZ2h0PVwiJyArIG9wdHMud2lkdGggKyAnXCIgJ1xuXG4gIGNvbnN0IHN2Z1RhZyA9ICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiAnICsgd2lkdGggKyB2aWV3Qm94ICsgJyBzaGFwZS1yZW5kZXJpbmc9XCJjcmlzcEVkZ2VzXCI+JyArIGJnICsgcGF0aCArICc8L3N2Zz5cXG4nXG5cbiAgaWYgKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiKG51bGwsIHN2Z1RhZylcbiAgfVxuXG4gIHJldHVybiBzdmdUYWdcbn1cbiIsICJcbmNvbnN0IGNhblByb21pc2UgPSByZXF1aXJlKCcuL2Nhbi1wcm9taXNlJylcblxuY29uc3QgUVJDb2RlID0gcmVxdWlyZSgnLi9jb3JlL3FyY29kZScpXG5jb25zdCBDYW52YXNSZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXIvY2FudmFzJylcbmNvbnN0IFN2Z1JlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlci9zdmctdGFnLmpzJylcblxuZnVuY3Rpb24gcmVuZGVyQ2FudmFzIChyZW5kZXJGdW5jLCBjYW52YXMsIHRleHQsIG9wdHMsIGNiKSB7XG4gIGNvbnN0IGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgY29uc3QgYXJnc051bSA9IGFyZ3MubGVuZ3RoXG4gIGNvbnN0IGlzTGFzdEFyZ0NiID0gdHlwZW9mIGFyZ3NbYXJnc051bSAtIDFdID09PSAnZnVuY3Rpb24nXG5cbiAgaWYgKCFpc0xhc3RBcmdDYiAmJiAhY2FuUHJvbWlzZSgpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYWxsYmFjayByZXF1aXJlZCBhcyBsYXN0IGFyZ3VtZW50JylcbiAgfVxuXG4gIGlmIChpc0xhc3RBcmdDYikge1xuICAgIGlmIChhcmdzTnVtIDwgMikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUb28gZmV3IGFyZ3VtZW50cyBwcm92aWRlZCcpXG4gICAgfVxuXG4gICAgaWYgKGFyZ3NOdW0gPT09IDIpIHtcbiAgICAgIGNiID0gdGV4dFxuICAgICAgdGV4dCA9IGNhbnZhc1xuICAgICAgY2FudmFzID0gb3B0cyA9IHVuZGVmaW5lZFxuICAgIH0gZWxzZSBpZiAoYXJnc051bSA9PT0gMykge1xuICAgICAgaWYgKGNhbnZhcy5nZXRDb250ZXh0ICYmIHR5cGVvZiBjYiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgY2IgPSBvcHRzXG4gICAgICAgIG9wdHMgPSB1bmRlZmluZWRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNiID0gb3B0c1xuICAgICAgICBvcHRzID0gdGV4dFxuICAgICAgICB0ZXh0ID0gY2FudmFzXG4gICAgICAgIGNhbnZhcyA9IHVuZGVmaW5lZFxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoYXJnc051bSA8IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVG9vIGZldyBhcmd1bWVudHMgcHJvdmlkZWQnKVxuICAgIH1cblxuICAgIGlmIChhcmdzTnVtID09PSAxKSB7XG4gICAgICB0ZXh0ID0gY2FudmFzXG4gICAgICBjYW52YXMgPSBvcHRzID0gdW5kZWZpbmVkXG4gICAgfSBlbHNlIGlmIChhcmdzTnVtID09PSAyICYmICFjYW52YXMuZ2V0Q29udGV4dCkge1xuICAgICAgb3B0cyA9IHRleHRcbiAgICAgIHRleHQgPSBjYW52YXNcbiAgICAgIGNhbnZhcyA9IHVuZGVmaW5lZFxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkYXRhID0gUVJDb2RlLmNyZWF0ZSh0ZXh0LCBvcHRzKVxuICAgICAgICByZXNvbHZlKHJlbmRlckZ1bmMoZGF0YSwgY2FudmFzLCBvcHRzKSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmVqZWN0KGUpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgZGF0YSA9IFFSQ29kZS5jcmVhdGUodGV4dCwgb3B0cylcbiAgICBjYihudWxsLCByZW5kZXJGdW5jKGRhdGEsIGNhbnZhcywgb3B0cykpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjYihlKVxuICB9XG59XG5cbmV4cG9ydHMuY3JlYXRlID0gUVJDb2RlLmNyZWF0ZVxuZXhwb3J0cy50b0NhbnZhcyA9IHJlbmRlckNhbnZhcy5iaW5kKG51bGwsIENhbnZhc1JlbmRlcmVyLnJlbmRlcilcbmV4cG9ydHMudG9EYXRhVVJMID0gcmVuZGVyQ2FudmFzLmJpbmQobnVsbCwgQ2FudmFzUmVuZGVyZXIucmVuZGVyVG9EYXRhVVJMKVxuXG4vLyBvbmx5IHN2ZyBmb3Igbm93LlxuZXhwb3J0cy50b1N0cmluZyA9IHJlbmRlckNhbnZhcy5iaW5kKG51bGwsIGZ1bmN0aW9uIChkYXRhLCBfLCBvcHRzKSB7XG4gIHJldHVybiBTdmdSZW5kZXJlci5yZW5kZXIoZGF0YSwgb3B0cylcbn0pXG4iLCAiLyoqXG4gKiBCcm93c2VyIEFQSSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBDaHJvbWUgLyBTYWZhcmkgLyBGaXJlZm94LlxuICpcbiAqIFNhZmFyaSBhbmQgRmlyZWZveCBleHBvc2UgYGJyb3dzZXIuKmAgKFByb21pc2UtYmFzZWQsIFdlYkV4dGVuc2lvbiBzdGFuZGFyZCkuXG4gKiBDaHJvbWUgZXhwb3NlcyBgY2hyb21lLipgIChjYWxsYmFjay1iYXNlZCBoaXN0b3JpY2FsbHksIGJ1dCBNVjMgc3VwcG9ydHNcbiAqIHByb21pc2VzIG9uIG1vc3QgQVBJcykuIEluIGEgc2VydmljZS13b3JrZXIgY29udGV4dCBgYnJvd3NlcmAgaXMgdW5kZWZpbmVkXG4gKiBvbiBDaHJvbWUsIHNvIHdlIG5vcm1hbGlzZSBldmVyeXRoaW5nIGhlcmUuXG4gKlxuICogVXNhZ2U6ICBpbXBvcnQgeyBhcGkgfSBmcm9tICcuL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbiAqICAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uKVxuICpcbiAqIFRoZSBleHBvcnRlZCBgYXBpYCBvYmplY3QgbWlycm9ycyB0aGUgc3Vic2V0IG9mIHRoZSBXZWJFeHRlbnNpb24gQVBJIHRoYXRcbiAqIE5vc3RyS2V5IGFjdHVhbGx5IHVzZXMsIHdpdGggZXZlcnkgbWV0aG9kIHJldHVybmluZyBhIFByb21pc2UuXG4gKi9cblxuLy8gRGV0ZWN0IHdoaWNoIGdsb2JhbCBuYW1lc3BhY2UgaXMgYXZhaWxhYmxlLlxuY29uc3QgX2Jyb3dzZXIgPVxuICAgIHR5cGVvZiBicm93c2VyICE9PSAndW5kZWZpbmVkJyA/IGJyb3dzZXIgOlxuICAgIHR5cGVvZiBjaHJvbWUgICE9PSAndW5kZWZpbmVkJyA/IGNocm9tZSAgOlxuICAgIG51bGw7XG5cbmlmICghX2Jyb3dzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jyb3dzZXItcG9seWZpbGw6IE5vIGV4dGVuc2lvbiBBUEkgbmFtZXNwYWNlIGZvdW5kIChuZWl0aGVyIGJyb3dzZXIgbm9yIGNocm9tZSkuJyk7XG59XG5cbi8qKlxuICogVHJ1ZSB3aGVuIHJ1bm5pbmcgb24gQ2hyb21lIChvciBhbnkgQ2hyb21pdW0tYmFzZWQgYnJvd3NlciB0aGF0IG9ubHlcbiAqIGV4cG9zZXMgdGhlIGBjaHJvbWVgIG5hbWVzcGFjZSkuXG4gKi9cbmNvbnN0IGlzQ2hyb21lID0gdHlwZW9mIGJyb3dzZXIgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnO1xuXG4vKipcbiAqIFdyYXAgYSBDaHJvbWUgY2FsbGJhY2stc3R5bGUgbWV0aG9kIHNvIGl0IHJldHVybnMgYSBQcm9taXNlLlxuICogSWYgdGhlIG1ldGhvZCBhbHJlYWR5IHJldHVybnMgYSBwcm9taXNlIChNVjMpIHdlIGp1c3QgcGFzcyB0aHJvdWdoLlxuICovXG5mdW5jdGlvbiBwcm9taXNpZnkoY29udGV4dCwgbWV0aG9kKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgIC8vIE1WMyBDaHJvbWUgQVBJcyByZXR1cm4gcHJvbWlzZXMgd2hlbiBubyBjYWxsYmFjayBpcyBzdXBwbGllZC5cbiAgICAgICAgLy8gV2UgdHJ5IHRoZSBwcm9taXNlIHBhdGggZmlyc3Q7IGlmIHRoZSBydW50aW1lIHNpZ25hbHMgYW4gZXJyb3JcbiAgICAgICAgLy8gdmlhIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvciBpbnNpZGUgYSBjYWxsYmFjayB3ZSBjYXRjaCB0aGF0IHRvby5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIGNhbGxiYWNrIHdyYXBwaW5nXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbWV0aG9kLmFwcGx5KGNvbnRleHQsIFtcbiAgICAgICAgICAgICAgICAuLi5hcmdzLFxuICAgICAgICAgICAgICAgICguLi5jYkFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9icm93c2VyLnJ1bnRpbWUgJiYgX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjYkFyZ3MubGVuZ3RoIDw9IDEgPyBjYkFyZ3NbMF0gOiBjYkFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHRoZSB1bmlmaWVkIGBhcGlgIG9iamVjdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IGFwaSA9IHt9O1xuXG4vLyAtLS0gcnVudGltZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5ydW50aW1lID0ge1xuICAgIC8qKlxuICAgICAqIHNlbmRNZXNzYWdlIFx1MjAxMyBhbHdheXMgcmV0dXJucyBhIFByb21pc2UuXG4gICAgICovXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1lc3NhZ2UgXHUyMDEzIHRoaW4gd3JhcHBlciBzbyBjYWxsZXJzIHVzZSBhIGNvbnNpc3RlbnQgcmVmZXJlbmNlLlxuICAgICAqIFRoZSBsaXN0ZW5lciBzaWduYXR1cmUgaXMgKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKS5cbiAgICAgKiBPbiBDaHJvbWUgdGhlIGxpc3RlbmVyIGNhbiByZXR1cm4gYHRydWVgIHRvIGtlZXAgdGhlIGNoYW5uZWwgb3BlbixcbiAgICAgKiBvciByZXR1cm4gYSBQcm9taXNlIChNVjMpLiAgU2FmYXJpIC8gRmlyZWZveCBleHBlY3QgYSBQcm9taXNlIHJldHVybi5cbiAgICAgKi9cbiAgICBvbk1lc3NhZ2U6IF9icm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLFxuXG4gICAgLyoqXG4gICAgICogZ2V0VVJMIFx1MjAxMyBzeW5jaHJvbm91cyBvbiBhbGwgYnJvd3NlcnMuXG4gICAgICovXG4gICAgZ2V0VVJMKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuZ2V0VVJMKHBhdGgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvcGVuT3B0aW9uc1BhZ2VcbiAgICAgKi9cbiAgICBvcGVuT3B0aW9uc1BhZ2UoKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UpKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSB0aGUgaWQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAqL1xuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuaWQ7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBzdG9yYWdlLmxvY2FsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnN0b3JhZ2UgPSB7XG4gICAgbG9jYWw6IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9LFxufTtcblxuLy8gLS0tIHRhYnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkudGFicyA9IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmNyZWF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBxdWVyeSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnF1ZXJ5KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5xdWVyeSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICB1cGRhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy51cGRhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnVwZGF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXRDdXJyZW50KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCkoLi4uYXJncyk7XG4gICAgfSxcbn07XG5cbmV4cG9ydCB7IGFwaSwgaXNDaHJvbWUgfTtcbiIsICJpbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgZW5jcnlwdCwgZGVjcnlwdCwgaGFzaFBhc3N3b3JkLCB2ZXJpZnlQYXNzd29yZCB9IGZyb20gJy4vY3J5cHRvJztcblxuY29uc3QgREJfVkVSU0lPTiA9IDU7XG5jb25zdCBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWw7XG5leHBvcnQgY29uc3QgUkVDT01NRU5ERURfUkVMQVlTID0gW1xuICAgIG5ldyBVUkwoJ3dzczovL3JlbGF5LmRhbXVzLmlvJyksXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkucHJpbWFsLm5ldCcpLFxuICAgIG5ldyBVUkwoJ3dzczovL3JlbGF5LnNub3J0LnNvY2lhbCcpLFxuICAgIG5ldyBVUkwoJ3dzczovL3JlbGF5LmdldGFsYnkuY29tL3YxJyksXG4gICAgbmV3IFVSTCgnd3NzOi8vbm9zLmxvbCcpLFxuICAgIG5ldyBVUkwoJ3dzczovL2JyYi5pbycpLFxuICAgIG5ldyBVUkwoJ3dzczovL25vc3RyLm9yYW5nZXBpbGwuZGV2JyksXG5dO1xuLy8gcHJldHRpZXItaWdub3JlXG5leHBvcnQgY29uc3QgS0lORFMgPSBbXG4gICAgWzAsICdNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMS5tZCddLFxuICAgIFsxLCAnVGV4dCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMS5tZCddLFxuICAgIFsyLCAnUmVjb21tZW5kIFJlbGF5JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzAxLm1kJ10sXG4gICAgWzMsICdDb250YWN0cycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMi5tZCddLFxuICAgIFs0LCAnRW5jcnlwdGVkIERpcmVjdCBNZXNzYWdlcycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wNC5tZCddLFxuICAgIFs1LCAnRXZlbnQgRGVsZXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDkubWQnXSxcbiAgICBbNiwgJ1JlcG9zdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8xOC5tZCddLFxuICAgIFs3LCAnUmVhY3Rpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjUubWQnXSxcbiAgICBbOCwgJ0JhZGdlIEF3YXJkJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU4Lm1kJ10sXG4gICAgWzE2LCAnR2VuZXJpYyBSZXBvc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMTgubWQnXSxcbiAgICBbNDAsICdDaGFubmVsIENyZWF0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzQxLCAnQ2hhbm5lbCBNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFs0MiwgJ0NoYW5uZWwgTWVzc2FnZScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFs0MywgJ0NoYW5uZWwgSGlkZSBNZXNzYWdlJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzQ0LCAnQ2hhbm5lbCBNdXRlIFVzZXInLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjgubWQnXSxcbiAgICBbMTA2MywgJ0ZpbGUgTWV0YWRhdGEnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvOTQubWQnXSxcbiAgICBbMTMxMSwgJ0xpdmUgQ2hhdCBNZXNzYWdlJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUzLm1kJ10sXG4gICAgWzE5ODQsICdSZXBvcnRpbmcnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTYubWQnXSxcbiAgICBbMTk4NSwgJ0xhYmVsJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzMyLm1kJ10sXG4gICAgWzQ1NTAsICdDb21tdW5pdHkgUG9zdCBBcHByb3ZhbCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83Mi5tZCddLFxuICAgIFs3MDAwLCAnSm9iIEZlZWRiYWNrJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzkwLm1kJ10sXG4gICAgWzkwNDEsICdaYXAgR29hbCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83NS5tZCddLFxuICAgIFs5NzM0LCAnWmFwIFJlcXVlc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTcubWQnXSxcbiAgICBbOTczNSwgJ1phcCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Ny5tZCddLFxuICAgIFsxMDAwMCwgJ011dGUgTGlzdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81MS5tZCddLFxuICAgIFsxMDAwMSwgJ1BpbiBMaXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUxLm1kJ10sXG4gICAgWzEwMDAyLCAnUmVsYXkgTGlzdCBNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci82NS5tZCddLFxuICAgIFsxMzE5NCwgJ1dhbGxldCBJbmZvJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ3Lm1kJ10sXG4gICAgWzIyMjQyLCAnQ2xpZW50IEF1dGhlbnRpY2F0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQyLm1kJ10sXG4gICAgWzIzMTk0LCAnV2FsbGV0IFJlcXVlc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDcubWQnXSxcbiAgICBbMjMxOTUsICdXYWxsZXQgUmVzcG9uc2UnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDcubWQnXSxcbiAgICBbMjQxMzMsICdOb3N0ciBDb25uZWN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ2Lm1kJ10sXG4gICAgWzI3MjM1LCAnSFRUUCBBdXRoJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk4Lm1kJ10sXG4gICAgWzMwMDAwLCAnQ2F0ZWdvcml6ZWQgUGVvcGxlIExpc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTEubWQnXSxcbiAgICBbMzAwMDEsICdDYXRlZ29yaXplZCBCb29rbWFyayBMaXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUxLm1kJ10sXG4gICAgWzMwMDA4LCAnUHJvZmlsZSBCYWRnZXMnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTgubWQnXSxcbiAgICBbMzAwMDksICdCYWRnZSBEZWZpbml0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU4Lm1kJ10sXG4gICAgWzMwMDE3LCAnQ3JlYXRlIG9yIHVwZGF0ZSBhIHN0YWxsJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzE1Lm1kJ10sXG4gICAgWzMwMDE4LCAnQ3JlYXRlIG9yIHVwZGF0ZSBhIHByb2R1Y3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMTUubWQnXSxcbiAgICBbMzAwMjMsICdMb25nLUZvcm0gQ29udGVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yMy5tZCddLFxuICAgIFszMDAyNCwgJ0RyYWZ0IExvbmctZm9ybSBDb250ZW50JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzIzLm1kJ10sXG4gICAgWzMwMDc4LCAnQXBwbGljYXRpb24tc3BlY2lmaWMgRGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83OC5tZCddLFxuICAgIFszMDMxMSwgJ0xpdmUgRXZlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTMubWQnXSxcbiAgICBbMzAzMTUsICdVc2VyIFN0YXR1c2VzJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzM4Lm1kJ10sXG4gICAgWzMwNDAyLCAnQ2xhc3NpZmllZCBMaXN0aW5nJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk5Lm1kJ10sXG4gICAgWzMwNDAzLCAnRHJhZnQgQ2xhc3NpZmllZCBMaXN0aW5nJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk5Lm1kJ10sXG4gICAgWzMxOTIyLCAnRGF0ZS1CYXNlZCBDYWxlbmRhciBFdmVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Mi5tZCddLFxuICAgIFszMTkyMywgJ1RpbWUtQmFzZWQgQ2FsZW5kYXIgRXZlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTIubWQnXSxcbiAgICBbMzE5MjQsICdDYWxlbmRhcicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Mi5tZCddLFxuICAgIFszMTkyNSwgJ0NhbGVuZGFyIEV2ZW50IFJTVlAnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTIubWQnXSxcbiAgICBbMzE5ODksICdIYW5kbGVyIHJlY29tbWVuZGF0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzg5Lm1kJ10sXG4gICAgWzMxOTkwLCAnSGFuZGxlciBpbmZvcm1hdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci84OS5tZCddLFxuICAgIFszNDU1MCwgJ0NvbW11bml0eSBEZWZpbml0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzcyLm1kJ10sXG5dO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICBhd2FpdCBnZXRPclNldERlZmF1bHQoJ3Byb2ZpbGVJbmRleCcsIDApO1xuICAgIGF3YWl0IGdldE9yU2V0RGVmYXVsdCgncHJvZmlsZXMnLCBbYXdhaXQgZ2VuZXJhdGVQcm9maWxlKCldKTtcbiAgICBsZXQgdmVyc2lvbiA9IChhd2FpdCBzdG9yYWdlLmdldCh7IHZlcnNpb246IDAgfSkpLnZlcnNpb247XG4gICAgY29uc29sZS5sb2coJ0RCIHZlcnNpb246ICcsIHZlcnNpb24pO1xuICAgIHdoaWxlICh2ZXJzaW9uIDwgREJfVkVSU0lPTikge1xuICAgICAgICB2ZXJzaW9uID0gYXdhaXQgbWlncmF0ZSh2ZXJzaW9uLCBEQl9WRVJTSU9OKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyB2ZXJzaW9uIH0pO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gbWlncmF0ZSh2ZXJzaW9uLCBnb2FsKSB7XG4gICAgaWYgKHZlcnNpb24gPT09IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coJ01pZ3JhdGluZyB0byB2ZXJzaW9uIDEuJyk7XG4gICAgICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgICAgIHByb2ZpbGVzLmZvckVhY2gocHJvZmlsZSA9PiAocHJvZmlsZS5ob3N0cyA9IHt9KSk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gMSkge1xuICAgICAgICBjb25zb2xlLmxvZygnbWlncmF0aW5nIHRvIHZlcnNpb24gMi4nKTtcbiAgICAgICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSAyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiAzLicpO1xuICAgICAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICBwcm9maWxlcy5mb3JFYWNoKHByb2ZpbGUgPT4gKHByb2ZpbGUucmVsYXlSZW1pbmRlciA9IHRydWUpKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSAzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiA0IChlbmNyeXB0aW9uIHN1cHBvcnQpLicpO1xuICAgICAgICAvLyBObyBkYXRhIHRyYW5zZm9ybWF0aW9uIG5lZWRlZCBcdTIwMTQgZXhpc3RpbmcgcGxhaW50ZXh0IGtleXMgc3RheSBhcy1pcy5cbiAgICAgICAgLy8gRW5jcnlwdGlvbiBvbmx5IGFjdGl2YXRlcyB3aGVuIHRoZSB1c2VyIHNldHMgYSBtYXN0ZXIgcGFzc3dvcmQuXG4gICAgICAgIC8vIFdlIGp1c3QgZW5zdXJlIHRoZSBpc0VuY3J5cHRlZCBmbGFnIGV4aXN0cyBhbmQgZGVmYXVsdHMgdG8gZmFsc2UuXG4gICAgICAgIGxldCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgICAgIGlmICghZGF0YS5pc0VuY3J5cHRlZCkge1xuICAgICAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSA0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiA1IChOSVAtNDYgYnVua2VyIHN1cHBvcnQpLicpO1xuICAgICAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICBwcm9maWxlcy5mb3JFYWNoKHByb2ZpbGUgPT4ge1xuICAgICAgICAgICAgaWYgKCFwcm9maWxlLnR5cGUpIHByb2ZpbGUudHlwZSA9ICdsb2NhbCc7XG4gICAgICAgICAgICBpZiAocHJvZmlsZS5idW5rZXJVcmwgPT09IHVuZGVmaW5lZCkgcHJvZmlsZS5idW5rZXJVcmwgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHByb2ZpbGUucmVtb3RlUHVia2V5ID09PSB1bmRlZmluZWQpIHByb2ZpbGUucmVtb3RlUHVia2V5ID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQcm9maWxlcygpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBzdG9yYWdlLmdldCh7IHByb2ZpbGVzOiBbXSB9KTtcbiAgICByZXR1cm4gcHJvZmlsZXMucHJvZmlsZXM7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQcm9maWxlKGluZGV4KSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICByZXR1cm4gcHJvZmlsZXNbaW5kZXhdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZU5hbWVzKCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLm1hcChwID0+IHAubmFtZSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQcm9maWxlSW5kZXgoKSB7XG4gICAgY29uc3QgaW5kZXggPSBhd2FpdCBzdG9yYWdlLmdldCh7IHByb2ZpbGVJbmRleDogMCB9KTtcbiAgICByZXR1cm4gaW5kZXgucHJvZmlsZUluZGV4O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UHJvZmlsZUluZGV4KHByb2ZpbGVJbmRleCkge1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZUluZGV4IH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlUHJvZmlsZShpbmRleCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgbGV0IHByb2ZpbGVJbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIHByb2ZpbGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgaWYgKHByb2ZpbGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIGF3YWl0IGNsZWFyRGF0YSgpOyAvLyBJZiB3ZSBoYXZlIGRlbGV0ZWQgYWxsIG9mIHRoZSBwcm9maWxlcywgbGV0J3MganVzdCBzdGFydCBmcmVzaCB3aXRoIGFsbCBuZXcgZGF0YVxuICAgICAgICBhd2FpdCBpbml0aWFsaXplKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgdGhlIGluZGV4IGRlbGV0ZWQgd2FzIHRoZSBhY3RpdmUgcHJvZmlsZSwgY2hhbmdlIHRoZSBhY3RpdmUgcHJvZmlsZSB0byB0aGUgbmV4dCBvbmVcbiAgICAgICAgbGV0IG5ld0luZGV4ID1cbiAgICAgICAgICAgIHByb2ZpbGVJbmRleCA9PT0gaW5kZXggPyBNYXRoLm1heChpbmRleCAtIDEsIDApIDogcHJvZmlsZUluZGV4O1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzLCBwcm9maWxlSW5kZXg6IG5ld0luZGV4IH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyRGF0YSgpIHtcbiAgICBsZXQgaWdub3JlSW5zdGFsbEhvb2sgPSBhd2FpdCBzdG9yYWdlLmdldCh7IGlnbm9yZUluc3RhbGxIb29rOiBmYWxzZSB9KTtcbiAgICBhd2FpdCBzdG9yYWdlLmNsZWFyKCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoaWdub3JlSW5zdGFsbEhvb2spO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVByaXZhdGVLZXkoKSB7XG4gICAgcmV0dXJuIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2dlbmVyYXRlUHJpdmF0ZUtleScgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVByb2ZpbGUobmFtZSA9ICdEZWZhdWx0IE5vc3RyIFByb2ZpbGUnLCB0eXBlID0gJ2xvY2FsJykge1xuICAgIHJldHVybiB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIHByaXZLZXk6IHR5cGUgPT09ICdsb2NhbCcgPyBhd2FpdCBnZW5lcmF0ZVByaXZhdGVLZXkoKSA6ICcnLFxuICAgICAgICBob3N0czoge30sXG4gICAgICAgIHJlbGF5czogUkVDT01NRU5ERURfUkVMQVlTLm1hcChyID0+ICh7IHVybDogci5ocmVmLCByZWFkOiB0cnVlLCB3cml0ZTogdHJ1ZSB9KSksXG4gICAgICAgIHJlbGF5UmVtaW5kZXI6IGZhbHNlLFxuICAgICAgICB0eXBlLFxuICAgICAgICBidW5rZXJVcmw6IG51bGwsXG4gICAgICAgIHJlbW90ZVB1YmtleTogbnVsbCxcbiAgICB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRPclNldERlZmF1bHQoa2V5LCBkZWYpIHtcbiAgICBsZXQgdmFsID0gKGF3YWl0IHN0b3JhZ2UuZ2V0KGtleSkpW2tleV07XG4gICAgaWYgKHZhbCA9PSBudWxsIHx8IHZhbCA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBba2V5XTogZGVmIH0pO1xuICAgICAgICByZXR1cm4gZGVmO1xuICAgIH1cblxuICAgIHJldHVybiB2YWw7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUHJvZmlsZU5hbWUoaW5kZXgsIHByb2ZpbGVOYW1lKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBwcm9maWxlc1tpbmRleF0ubmFtZSA9IHByb2ZpbGVOYW1lO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUHJpdmF0ZUtleShpbmRleCwgcHJpdmF0ZUtleSkge1xuICAgIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ3NhdmVQcml2YXRlS2V5JyxcbiAgICAgICAgcGF5bG9hZDogW2luZGV4LCBwcml2YXRlS2V5XSxcbiAgICB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG5ld1Byb2ZpbGUoKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBjb25zdCBuZXdQcm9maWxlID0gYXdhaXQgZ2VuZXJhdGVQcm9maWxlKCdOZXcgUHJvZmlsZScpO1xuICAgIHByb2ZpbGVzLnB1c2gobmV3UHJvZmlsZSk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICByZXR1cm4gcHJvZmlsZXMubGVuZ3RoIC0gMTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG5ld0J1bmtlclByb2ZpbGUobmFtZSA9ICdOZXcgQnVua2VyJywgYnVua2VyVXJsID0gbnVsbCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgY29uc3QgcHJvZmlsZSA9IGF3YWl0IGdlbmVyYXRlUHJvZmlsZShuYW1lLCAnYnVua2VyJyk7XG4gICAgcHJvZmlsZS5idW5rZXJVcmwgPSBidW5rZXJVcmw7XG4gICAgcHJvZmlsZXMucHVzaChwcm9maWxlKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xuICAgIHJldHVybiBwcm9maWxlcy5sZW5ndGggLSAxO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UmVsYXlzKHByb2ZpbGVJbmRleCkge1xuICAgIGxldCBwcm9maWxlID0gYXdhaXQgZ2V0UHJvZmlsZShwcm9maWxlSW5kZXgpO1xuICAgIHJldHVybiBwcm9maWxlLnJlbGF5cyB8fCBbXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVSZWxheXMocHJvZmlsZUluZGV4LCByZWxheXMpIHtcbiAgICAvLyBIYXZpbmcgYW4gQWxwaW5lIHByb3h5IG9iamVjdCBhcyBhIHN1Yi1vYmplY3QgZG9lcyBub3Qgc2VyaWFsaXplIGNvcnJlY3RseSBpbiBzdG9yYWdlLFxuICAgIC8vIHNvIHdlIGFyZSBwcmUtc2VyaWFsaXppbmcgaGVyZSBiZWZvcmUgYXNzaWduaW5nIGl0IHRvIHRoZSBwcm9maWxlLCBzbyB0aGUgcHJveHlcbiAgICAvLyBvYmogZG9lc24ndCBidWcgb3V0LlxuICAgIGxldCBmaXhlZFJlbGF5cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocmVsYXlzKSk7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBsZXQgcHJvZmlsZSA9IHByb2ZpbGVzW3Byb2ZpbGVJbmRleF07XG4gICAgcHJvZmlsZS5yZWxheXMgPSBmaXhlZFJlbGF5cztcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0KGl0ZW0pIHtcbiAgICByZXR1cm4gKGF3YWl0IHN0b3JhZ2UuZ2V0KGl0ZW0pKVtpdGVtXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBlcm1pc3Npb25zKGluZGV4ID0gbnVsbCkge1xuICAgIGlmIChpbmRleCA9PSBudWxsKSB7XG4gICAgICAgIGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgfVxuICAgIGxldCBwcm9maWxlID0gYXdhaXQgZ2V0UHJvZmlsZShpbmRleCk7XG4gICAgbGV0IGhvc3RzID0gYXdhaXQgcHJvZmlsZS5ob3N0cztcbiAgICByZXR1cm4gaG9zdHM7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZXJtaXNzaW9uKGhvc3QsIGFjdGlvbikge1xuICAgIGxldCBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIGxldCBwcm9maWxlID0gYXdhaXQgZ2V0UHJvZmlsZShpbmRleCk7XG4gICAgcmV0dXJuIHByb2ZpbGUuaG9zdHM/Lltob3N0XT8uW2FjdGlvbl0gfHwgJ2Fzayc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRQZXJtaXNzaW9uKGhvc3QsIGFjdGlvbiwgcGVybSwgaW5kZXggPSBudWxsKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBpZiAoIWluZGV4KSB7XG4gICAgICAgIGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgfVxuICAgIGxldCBwcm9maWxlID0gcHJvZmlsZXNbaW5kZXhdO1xuICAgIGxldCBuZXdQZXJtcyA9IHByb2ZpbGUuaG9zdHNbaG9zdF0gfHwge307XG4gICAgbmV3UGVybXMgPSB7IC4uLm5ld1Blcm1zLCBbYWN0aW9uXTogcGVybSB9O1xuICAgIHByb2ZpbGUuaG9zdHNbaG9zdF0gPSBuZXdQZXJtcztcbiAgICBwcm9maWxlc1tpbmRleF0gPSBwcm9maWxlO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBodW1hblBlcm1pc3Npb24ocCkge1xuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2Ugd2hlcmUgZXZlbnQgc2lnbmluZyBpbmNsdWRlcyBhIGtpbmQgbnVtYmVyXG4gICAgaWYgKHAuc3RhcnRzV2l0aCgnc2lnbkV2ZW50OicpKSB7XG4gICAgICAgIGxldCBbZSwgbl0gPSBwLnNwbGl0KCc6Jyk7XG4gICAgICAgIG4gPSBwYXJzZUludChuKTtcbiAgICAgICAgbGV0IG5uYW1lID0gS0lORFMuZmluZChrID0+IGtbMF0gPT09IG4pPy5bMV0gfHwgYFVua25vd24gKEtpbmQgJHtufSlgO1xuICAgICAgICByZXR1cm4gYFNpZ24gZXZlbnQ6ICR7bm5hbWV9YDtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHApIHtcbiAgICAgICAgY2FzZSAnZ2V0UHViS2V5JzpcbiAgICAgICAgICAgIHJldHVybiAnUmVhZCBwdWJsaWMga2V5JztcbiAgICAgICAgY2FzZSAnc2lnbkV2ZW50JzpcbiAgICAgICAgICAgIHJldHVybiAnU2lnbiBldmVudCc7XG4gICAgICAgIGNhc2UgJ2dldFJlbGF5cyc6XG4gICAgICAgICAgICByZXR1cm4gJ1JlYWQgcmVsYXkgbGlzdCc7XG4gICAgICAgIGNhc2UgJ25pcDA0LmVuY3J5cHQnOlxuICAgICAgICAgICAgcmV0dXJuICdFbmNyeXB0IHByaXZhdGUgbWVzc2FnZSAoTklQLTA0KSc7XG4gICAgICAgIGNhc2UgJ25pcDA0LmRlY3J5cHQnOlxuICAgICAgICAgICAgcmV0dXJuICdEZWNyeXB0IHByaXZhdGUgbWVzc2FnZSAoTklQLTA0KSc7XG4gICAgICAgIGNhc2UgJ25pcDQ0LmVuY3J5cHQnOlxuICAgICAgICAgICAgcmV0dXJuICdFbmNyeXB0IHByaXZhdGUgbWVzc2FnZSAoTklQLTQ0KSc7XG4gICAgICAgIGNhc2UgJ25pcDQ0LmRlY3J5cHQnOlxuICAgICAgICAgICAgcmV0dXJuICdEZWNyeXB0IHByaXZhdGUgbWVzc2FnZSAoTklQLTQ0KSc7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gJ1Vua25vd24nO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlS2V5KGtleSkge1xuICAgIGNvbnN0IGhleE1hdGNoID0gL15bXFxkYS1mXXs2NH0kL2kudGVzdChrZXkpO1xuICAgIGNvbnN0IGIzMk1hdGNoID0gL15uc2VjMVtxcHpyeTl4OGdmMnR2ZHcwczNqbjU0a2hjZTZtdWE3bF17NTh9JC8udGVzdChrZXkpO1xuXG4gICAgcmV0dXJuIGhleE1hdGNoIHx8IGIzMk1hdGNoIHx8IGlzTmNyeXB0c2VjKGtleSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05jcnlwdHNlYyhrZXkpIHtcbiAgICByZXR1cm4gL15uY3J5cHRzZWMxW3FwenJ5OXg4Z2YydHZkdzBzM2puNTRraGNlNm11YTdsXSskLy50ZXN0KGtleSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZWF0dXJlKG5hbWUpIHtcbiAgICBsZXQgZm5hbWUgPSBgZmVhdHVyZToke25hbWV9YDtcbiAgICBsZXQgZiA9IGF3YWl0IGFwaS5zdG9yYWdlLmxvY2FsLmdldCh7IFtmbmFtZV06IGZhbHNlIH0pO1xuICAgIHJldHVybiBmW2ZuYW1lXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbGF5UmVtaW5kZXIoKSB7XG4gICAgbGV0IGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgbGV0IHByb2ZpbGUgPSBhd2FpdCBnZXRQcm9maWxlKGluZGV4KTtcbiAgICByZXR1cm4gcHJvZmlsZS5yZWxheVJlbWluZGVyO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdG9nZ2xlUmVsYXlSZW1pbmRlcigpIHtcbiAgICBsZXQgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIHByb2ZpbGVzW2luZGV4XS5yZWxheVJlbWluZGVyID0gZmFsc2U7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldE5wdWIoKSB7XG4gICAgbGV0IGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgcmV0dXJuIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ2dldE5wdWInLFxuICAgICAgICBwYXlsb2FkOiBpbmRleCxcbiAgICB9KTtcbn1cblxuLy8gLS0tIE1hc3RlciBwYXNzd29yZCBlbmNyeXB0aW9uIGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgbWFzdGVyIHBhc3N3b3JkIGVuY3J5cHRpb24gaXMgYWN0aXZlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNFbmNyeXB0ZWQoKSB7XG4gICAgbGV0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IGlzRW5jcnlwdGVkOiBmYWxzZSB9KTtcbiAgICByZXR1cm4gZGF0YS5pc0VuY3J5cHRlZDtcbn1cblxuLyoqXG4gKiBTdG9yZSB0aGUgcGFzc3dvcmQgdmVyaWZpY2F0aW9uIGhhc2ggKG5ldmVyIHRoZSBwYXNzd29yZCBpdHNlbGYpLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UGFzc3dvcmRIYXNoKHBhc3N3b3JkKSB7XG4gICAgY29uc3QgeyBoYXNoLCBzYWx0IH0gPSBhd2FpdCBoYXNoUGFzc3dvcmQocGFzc3dvcmQpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHtcbiAgICAgICAgcGFzc3dvcmRIYXNoOiBoYXNoLFxuICAgICAgICBwYXNzd29yZFNhbHQ6IHNhbHQsXG4gICAgICAgIGlzRW5jcnlwdGVkOiB0cnVlLFxuICAgIH0pO1xufVxuXG4vKipcbiAqIFZlcmlmeSBhIHBhc3N3b3JkIGFnYWluc3QgdGhlIHN0b3JlZCBoYXNoLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tQYXNzd29yZChwYXNzd29yZCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7XG4gICAgICAgIHBhc3N3b3JkSGFzaDogbnVsbCxcbiAgICAgICAgcGFzc3dvcmRTYWx0OiBudWxsLFxuICAgIH0pO1xuICAgIGlmICghZGF0YS5wYXNzd29yZEhhc2ggfHwgIWRhdGEucGFzc3dvcmRTYWx0KSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHZlcmlmeVBhc3N3b3JkKHBhc3N3b3JkLCBkYXRhLnBhc3N3b3JkSGFzaCwgZGF0YS5wYXNzd29yZFNhbHQpO1xufVxuXG4vKipcbiAqIFJlbW92ZSBtYXN0ZXIgcGFzc3dvcmQgcHJvdGVjdGlvbiBcdTIwMTQgY2xlYXJzIGhhc2ggYW5kIGRlY3J5cHRzIGFsbCBrZXlzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlUGFzc3dvcmRQcm90ZWN0aW9uKHBhc3N3b3JkKSB7XG4gICAgY29uc3QgdmFsaWQgPSBhd2FpdCBjaGVja1Bhc3N3b3JkKHBhc3N3b3JkKTtcbiAgICBpZiAoIXZhbGlkKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcGFzc3dvcmQnKTtcblxuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9maWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJvZmlsZXNbaV0udHlwZSA9PT0gJ2J1bmtlcicpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoaXNFbmNyeXB0ZWRCbG9iKHByb2ZpbGVzW2ldLnByaXZLZXkpKSB7XG4gICAgICAgICAgICBwcm9maWxlc1tpXS5wcml2S2V5ID0gYXdhaXQgZGVjcnlwdChwcm9maWxlc1tpXS5wcml2S2V5LCBwYXNzd29yZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoe1xuICAgICAgICBwcm9maWxlcyxcbiAgICAgICAgaXNFbmNyeXB0ZWQ6IGZhbHNlLFxuICAgICAgICBwYXNzd29yZEhhc2g6IG51bGwsXG4gICAgICAgIHBhc3N3b3JkU2FsdDogbnVsbCxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBFbmNyeXB0IGFsbCBwcm9maWxlIHByaXZhdGUga2V5cyB3aXRoIGEgbWFzdGVyIHBhc3N3b3JkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdEFsbEtleXMocGFzc3dvcmQpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb2ZpbGVzW2ldLnR5cGUgPT09ICdidW5rZXInKSBjb250aW51ZTtcbiAgICAgICAgaWYgKCFpc0VuY3J5cHRlZEJsb2IocHJvZmlsZXNbaV0ucHJpdktleSkpIHtcbiAgICAgICAgICAgIHByb2ZpbGVzW2ldLnByaXZLZXkgPSBhd2FpdCBlbmNyeXB0KHByb2ZpbGVzW2ldLnByaXZLZXksIHBhc3N3b3JkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhd2FpdCBzZXRQYXNzd29yZEhhc2gocGFzc3dvcmQpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG59XG5cbi8qKlxuICogUmUtZW5jcnlwdCBhbGwga2V5cyB3aXRoIGEgbmV3IHBhc3N3b3JkIChyZXF1aXJlcyB0aGUgb2xkIHBhc3N3b3JkKS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoYW5nZVBhc3N3b3JkRm9yS2V5cyhvbGRQYXNzd29yZCwgbmV3UGFzc3dvcmQpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb2ZpbGVzW2ldLnR5cGUgPT09ICdidW5rZXInKSBjb250aW51ZTtcbiAgICAgICAgbGV0IGhleCA9IHByb2ZpbGVzW2ldLnByaXZLZXk7XG4gICAgICAgIGlmIChpc0VuY3J5cHRlZEJsb2IoaGV4KSkge1xuICAgICAgICAgICAgaGV4ID0gYXdhaXQgZGVjcnlwdChoZXgsIG9sZFBhc3N3b3JkKTtcbiAgICAgICAgfVxuICAgICAgICBwcm9maWxlc1tpXS5wcml2S2V5ID0gYXdhaXQgZW5jcnlwdChoZXgsIG5ld1Bhc3N3b3JkKTtcbiAgICB9XG4gICAgY29uc3QgeyBoYXNoLCBzYWx0IH0gPSBhd2FpdCBoYXNoUGFzc3dvcmQobmV3UGFzc3dvcmQpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHtcbiAgICAgICAgcHJvZmlsZXMsXG4gICAgICAgIHBhc3N3b3JkSGFzaDogaGFzaCxcbiAgICAgICAgcGFzc3dvcmRTYWx0OiBzYWx0LFxuICAgICAgICBpc0VuY3J5cHRlZDogdHJ1ZSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgc2luZ2xlIHByb2ZpbGUncyBwcml2YXRlIGtleSwgcmV0dXJuaW5nIHRoZSBoZXggc3RyaW5nLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGVjcnlwdGVkUHJpdktleShwcm9maWxlLCBwYXNzd29yZCkge1xuICAgIGlmIChwcm9maWxlLnR5cGUgPT09ICdidW5rZXInKSByZXR1cm4gJyc7XG4gICAgaWYgKGlzRW5jcnlwdGVkQmxvYihwcm9maWxlLnByaXZLZXkpKSB7XG4gICAgICAgIHJldHVybiBkZWNyeXB0KHByb2ZpbGUucHJpdktleSwgcGFzc3dvcmQpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvZmlsZS5wcml2S2V5O1xufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYSBzdG9yZWQgdmFsdWUgbG9va3MgbGlrZSBhbiBlbmNyeXB0ZWQgYmxvYi5cbiAqIEVuY3J5cHRlZCBibG9icyBhcmUgSlNPTiBzdHJpbmdzIGNvbnRhaW5pbmcge3NhbHQsIGl2LCBjaXBoZXJ0ZXh0fS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRW5jcnlwdGVkQmxvYih2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIHJldHVybiAhIShwYXJzZWQuc2FsdCAmJiBwYXJzZWQuaXYgJiYgcGFyc2VkLmNpcGhlcnRleHQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIiwgIi8qKlxuICogTm9zdHJLZXkgRnVsbCBTZXR0aW5ncyAtIFZhbmlsbGEgSlMgKENTUC1zYWZlKVxuICovXG5cbmltcG9ydCB7XG4gICAgY2xlYXJEYXRhLFxuICAgIGdldFByb2ZpbGVJbmRleCxcbiAgICBnZXRQcm9maWxlTmFtZXMsXG4gICAgZ2V0UHJvZmlsZSxcbiAgICBnZXRSZWxheXMsXG4gICAgaW5pdGlhbGl6ZSxcbiAgICBuZXdCdW5rZXJQcm9maWxlLFxuICAgIHNhdmVQcml2YXRlS2V5LFxuICAgIHNhdmVQcm9maWxlTmFtZSxcbiAgICBzYXZlUmVsYXlzLFxuICAgIFJFQ09NTUVOREVEX1JFTEFZUyxcbiAgICBnZXRQZXJtaXNzaW9ucyxcbiAgICBzZXRQZXJtaXNzaW9uLFxuICAgIGh1bWFuUGVybWlzc2lvbixcbiAgICB2YWxpZGF0ZUtleSxcbiAgICBpc05jcnlwdHNlYyxcbn0gZnJvbSAnLi91dGlsaXRpZXMvdXRpbHMnO1xuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgUVJDb2RlIGZyb20gJ3FyY29kZSc7XG5cbi8vIFN0YXRlXG5jb25zdCBzdGF0ZSA9IHtcbiAgICBwcm9maWxlTmFtZXM6IFsnLS0tJ10sXG4gICAgcHJvZmlsZUluZGV4OiAwLFxuICAgIHByb2ZpbGVOYW1lOiAnJyxcbiAgICBwcmlzdGluZVByb2ZpbGVOYW1lOiAnJyxcbiAgICBwcml2S2V5OiAnJyxcbiAgICBwcmlzdGluZVByaXZLZXk6ICcnLFxuICAgIHB1YktleTogJycsXG4gICAgcmVsYXlzOiBbXSxcbiAgICBuZXdSZWxheTogJycsXG4gICAgdXJsRXJyb3I6ICcnLFxuICAgIHJlY29tbWVuZGVkUmVsYXk6ICcnLFxuICAgIHBlcm1pc3Npb25zOiB7fSxcbiAgICBob3N0OiAnJyxcbiAgICBwZXJtSG9zdHM6IFtdLFxuICAgIGhvc3RQZXJtczogW10sXG4gICAgdmlzaWJsZTogZmFsc2UsXG4gICAgY29waWVkOiBmYWxzZSxcbiAgICBcbiAgICAvLyBRUiBzdGF0ZVxuICAgIG5wdWJRckRhdGFVcmw6ICcnLFxuICAgIG5zZWNRckRhdGFVcmw6ICcnLFxuICAgIHNob3dOc2VjUXI6IGZhbHNlLFxuICAgIFxuICAgIC8vIG5jcnlwdHNlYyBzdGF0ZVxuICAgIG5jcnlwdHNlY1Bhc3N3b3JkOiAnJyxcbiAgICBuY3J5cHRzZWNFcnJvcjogJycsXG4gICAgbmNyeXB0c2VjTG9hZGluZzogZmFsc2UsXG4gICAgbmNyeXB0c2VjRXhwb3J0UGFzc3dvcmQ6ICcnLFxuICAgIG5jcnlwdHNlY0V4cG9ydENvbmZpcm06ICcnLFxuICAgIG5jcnlwdHNlY0V4cG9ydFJlc3VsdDogJycsXG4gICAgbmNyeXB0c2VjRXhwb3J0RXJyb3I6ICcnLFxuICAgIG5jcnlwdHNlY0V4cG9ydExvYWRpbmc6IGZhbHNlLFxuICAgIG5jcnlwdHNlY0V4cG9ydENvcGllZDogZmFsc2UsXG4gICAgXG4gICAgLy8gQnVua2VyIHN0YXRlXG4gICAgcHJvZmlsZVR5cGU6ICdsb2NhbCcsXG4gICAgYnVua2VyVXJsOiAnJyxcbiAgICBidW5rZXJDb25uZWN0ZWQ6IGZhbHNlLFxuICAgIGJ1bmtlckVycm9yOiAnJyxcbiAgICBidW5rZXJDb25uZWN0aW5nOiBmYWxzZSxcbiAgICBidW5rZXJQdWJrZXk6ICcnLFxuICAgIFxuICAgIC8vIFByb3RvY29sIGhhbmRsZXJcbiAgICBwcm90b2NvbEhhbmRsZXI6ICcnLFxuICAgIFxuICAgIC8vIFNlY3VyaXR5IHN0YXRlXG4gICAgaGFzUGFzc3dvcmQ6IGZhbHNlLFxuICAgIGN1cnJlbnRQYXNzd29yZDogJycsXG4gICAgbmV3UGFzc3dvcmQ6ICcnLFxuICAgIGNvbmZpcm1QYXNzd29yZDogJycsXG4gICAgcmVtb3ZlUGFzc3dvcmRJbnB1dDogJycsXG4gICAgc2VjdXJpdHlFcnJvcjogJycsXG4gICAgc2VjdXJpdHlTdWNjZXNzOiAnJyxcbiAgICByZW1vdmVFcnJvcjogJycsXG59O1xuXG4vLyBET00gRWxlbWVudHNcbmNvbnN0IGVsZW1lbnRzID0ge307XG5cbmZ1bmN0aW9uICQoaWQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xufVxuXG5mdW5jdGlvbiBpbml0RWxlbWVudHMoKSB7XG4gICAgLy8gUHJvZmlsZSBlbGVtZW50c1xuICAgIGVsZW1lbnRzLnByb2ZpbGVTZWxlY3QgPSAkKCdwcm9maWxlcycpO1xuICAgIGVsZW1lbnRzLnNldHRpbmdzQ29udGFpbmVyID0gJCgnc2V0dGluZ3MtY29udGFpbmVyJyk7XG4gICAgZWxlbWVudHMubmV3QnVua2VyQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtYWN0aW9uPVwibmV3QnVua2VyUHJvZmlsZVwiXScpO1xuICAgIFxuICAgIC8vIEtleXMgc2VjdGlvbiAobG9jYWwgcHJvZmlsZXMpXG4gICAgZWxlbWVudHMua2V5c1NlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1zZWN0aW9uPVwia2V5c1wiXScpO1xuICAgIGVsZW1lbnRzLnByb2ZpbGVOYW1lSW5wdXQgPSAkKCdwcm9maWxlLW5hbWUnKTtcbiAgICBlbGVtZW50cy5wcml2S2V5SW5wdXQgPSAkKCdwcml2LWtleScpO1xuICAgIGVsZW1lbnRzLnB1YktleUlucHV0ID0gJCgncHViLWtleScpO1xuICAgIGVsZW1lbnRzLnZpc2liaWxpdHlUb2dnbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1hY3Rpb249XCJ0b2dnbGVWaXNpYmlsaXR5XCJdJyk7XG4gICAgZWxlbWVudHMuY29weVB1YktleUJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWFjdGlvbj1cImNvcHlQdWJLZXlcIl0nKTtcbiAgICBlbGVtZW50cy5zYXZlUHJvZmlsZUJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWFjdGlvbj1cInNhdmVQcm9maWxlXCJdJyk7XG4gICAgXG4gICAgLy8gbmNyeXB0c2VjIGltcG9ydFxuICAgIGVsZW1lbnRzLm5jcnlwdHNlY1NlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1zZWN0aW9uPVwibmNyeXB0c2VjLWltcG9ydFwiXScpO1xuICAgIGVsZW1lbnRzLm5jcnlwdHNlY1Bhc3N3b3JkSW5wdXQgPSAkKCduY3J5cHRzZWMtcGFzc3dvcmQnKTtcbiAgICBlbGVtZW50cy5uY3J5cHRzZWNFcnJvciA9ICQoJ25jcnlwdHNlYy1lcnJvcicpO1xuICAgIGVsZW1lbnRzLmRlY3J5cHRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1hY3Rpb249XCJkZWNyeXB0TmNyeXB0c2VjXCJdJyk7XG4gICAgXG4gICAgLy8gUVIgY29kZXNcbiAgICBlbGVtZW50cy5ucHViUXJDb250YWluZXIgPSAkKCducHViLXFyLWNvbnRhaW5lcicpO1xuICAgIGVsZW1lbnRzLm5wdWJRckltYWdlID0gJCgnbnB1Yi1xci1pbWFnZScpO1xuICAgIGVsZW1lbnRzLnNob3dOc2VjUXJCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1hY3Rpb249XCJzaG93TnNlY1FyXCJdJyk7XG4gICAgZWxlbWVudHMubnNlY1FyU2VjdGlvbiA9ICQoJ25zZWMtcXItc2VjdGlvbicpO1xuICAgIGVsZW1lbnRzLm5zZWNRckltYWdlID0gJCgnbnNlYy1xci1pbWFnZScpO1xuICAgIGVsZW1lbnRzLmhpZGVOc2VjUXJCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1hY3Rpb249XCJoaWRlTnNlY1FyXCJdJyk7XG4gICAgXG4gICAgLy8gbmNyeXB0c2VjIGV4cG9ydFxuICAgIGVsZW1lbnRzLm5jcnlwdHNlY0V4cG9ydFBhc3N3b3JkID0gJCgnbmNyeXB0c2VjLWV4cG9ydC1wYXNzd29yZCcpO1xuICAgIGVsZW1lbnRzLm5jcnlwdHNlY0V4cG9ydENvbmZpcm0gPSAkKCduY3J5cHRzZWMtZXhwb3J0LWNvbmZpcm0nKTtcbiAgICBlbGVtZW50cy5uY3J5cHRzZWNFeHBvcnRFcnJvciA9ICQoJ25jcnlwdHNlYy1leHBvcnQtZXJyb3InKTtcbiAgICBlbGVtZW50cy5leHBvcnROY3J5cHRzZWNCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1hY3Rpb249XCJleHBvcnROY3J5cHRzZWNcIl0nKTtcbiAgICBlbGVtZW50cy5uY3J5cHRzZWNFeHBvcnRSZXN1bHQgPSAkKCduY3J5cHRzZWMtZXhwb3J0LXJlc3VsdCcpO1xuICAgIGVsZW1lbnRzLmNvcHlOY3J5cHRzZWNCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1hY3Rpb249XCJjb3B5TmNyeXB0c2VjRXhwb3J0XCJdJyk7XG4gICAgXG4gICAgLy8gQnVua2VyIHNlY3Rpb25cbiAgICBlbGVtZW50cy5idW5rZXJTZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtc2VjdGlvbj1cImJ1bmtlclwiXScpO1xuICAgIGVsZW1lbnRzLmJ1bmtlclByb2ZpbGVOYW1lSW5wdXQgPSAkKCdidW5rZXItcHJvZmlsZS1uYW1lJyk7XG4gICAgZWxlbWVudHMuc2F2ZUJ1bmtlck5hbWVCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1hY3Rpb249XCJzYXZlQnVua2VyTmFtZVwiXScpO1xuICAgIGVsZW1lbnRzLmJ1bmtlclVybElucHV0ID0gJCgnYnVua2VyLXVybCcpO1xuICAgIGVsZW1lbnRzLmNvbm5lY3RCdW5rZXJCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1hY3Rpb249XCJjb25uZWN0QnVua2VyXCJdJyk7XG4gICAgZWxlbWVudHMuZGlzY29ubmVjdEJ1bmtlckJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWFjdGlvbj1cImRpc2Nvbm5lY3RCdW5rZXJcIl0nKTtcbiAgICBlbGVtZW50cy5waW5nQnVua2VyQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtYWN0aW9uPVwicGluZ0J1bmtlclwiXScpO1xuICAgIGVsZW1lbnRzLmJ1bmtlclN0YXR1cyA9ICQoJ2J1bmtlci1zdGF0dXMtaW5kaWNhdG9yJyk7XG4gICAgZWxlbWVudHMuYnVua2VyU3RhdHVzVGV4dCA9ICQoJ2J1bmtlci1zdGF0dXMtdGV4dCcpO1xuICAgIGVsZW1lbnRzLmJ1bmtlckVycm9yID0gJCgnYnVua2VyLWVycm9yJyk7XG4gICAgZWxlbWVudHMuYnVua2VyUHViS2V5SW5wdXQgPSAkKCdidW5rZXItcHVia2V5Jyk7XG4gICAgZWxlbWVudHMuY29weUJ1bmtlclB1YktleUJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWFjdGlvbj1cImNvcHlCdW5rZXJQdWJLZXlcIl0nKTtcbiAgICBcbiAgICAvLyBSZWxheXNcbiAgICBlbGVtZW50cy5yZWxheXNUYWJsZSA9ICQoJ3JlbGF5cy10YWJsZScpO1xuICAgIGVsZW1lbnRzLnJlbGF5c0VtcHR5ID0gJCgncmVsYXlzLWVtcHR5Jyk7XG4gICAgZWxlbWVudHMucmVjb21tZW5kZWRSZWxheVNlbGVjdCA9ICQoJ3JlY29tbWVuZGVkLXJlbGF5Jyk7XG4gICAgZWxlbWVudHMubmV3UmVsYXlJbnB1dCA9ICQoJ25ldy1yZWxheScpO1xuICAgIGVsZW1lbnRzLmFkZFJlbGF5QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtYWN0aW9uPVwiYWRkUmVsYXlcIl0nKTtcbiAgICBlbGVtZW50cy5yZWxheUVycm9yID0gJCgncmVsYXktZXJyb3InKTtcbiAgICBcbiAgICAvLyBQZXJtaXNzaW9uc1xuICAgIGVsZW1lbnRzLmFwcFNlbGVjdCA9ICQoJ2FwcC1zZWxlY3QnKTtcbiAgICBlbGVtZW50cy5wZXJtaXNzaW9uc1RhYmxlID0gJCgncGVybWlzc2lvbnMtdGFibGUnKTtcbiAgICBlbGVtZW50cy5wZXJtaXNzaW9uc0VtcHR5ID0gJCgncGVybWlzc2lvbnMtZW1wdHknKTtcbiAgICBcbiAgICAvLyBTZWN1cml0eVxuICAgIGVsZW1lbnRzLnNlY3VyaXR5U3RhdHVzID0gJCgnc2VjdXJpdHktc3RhdHVzJyk7XG4gICAgZWxlbWVudHMuc2V0UGFzc3dvcmRTZWN0aW9uID0gJCgnc2V0LXBhc3N3b3JkLXNlY3Rpb24nKTtcbiAgICBlbGVtZW50cy5jaGFuZ2VQYXNzd29yZFNlY3Rpb24gPSAkKCdjaGFuZ2UtcGFzc3dvcmQtc2VjdGlvbicpO1xuICAgIGVsZW1lbnRzLm5ld1Bhc3N3b3JkSW5wdXQgPSAkKCduZXctcGFzc3dvcmQnKTtcbiAgICBlbGVtZW50cy5jb25maXJtUGFzc3dvcmRJbnB1dCA9ICQoJ2NvbmZpcm0tcGFzc3dvcmQnKTtcbiAgICBlbGVtZW50cy5wYXNzd29yZFN0cmVuZ3RoID0gJCgncGFzc3dvcmQtc3RyZW5ndGgnKTtcbiAgICBlbGVtZW50cy5zZWN1cml0eUVycm9yID0gJCgnc2VjdXJpdHktZXJyb3InKTtcbiAgICBlbGVtZW50cy5zZWN1cml0eVN1Y2Nlc3MgPSAkKCdzZWN1cml0eS1zdWNjZXNzJyk7XG4gICAgZWxlbWVudHMuc2V0UGFzc3dvcmRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1hY3Rpb249XCJzZXRQYXNzd29yZFwiXScpO1xuICAgIGVsZW1lbnRzLmN1cnJlbnRQYXNzd29yZElucHV0ID0gJCgnY3VycmVudC1wYXNzd29yZCcpO1xuICAgIGVsZW1lbnRzLm5ld1Bhc3N3b3JkQ2hhbmdlSW5wdXQgPSAkKCduZXctcGFzc3dvcmQtY2hhbmdlJyk7XG4gICAgZWxlbWVudHMuY29uZmlybVBhc3N3b3JkQ2hhbmdlSW5wdXQgPSAkKCdjb25maXJtLXBhc3N3b3JkLWNoYW5nZScpO1xuICAgIGVsZW1lbnRzLmNoYW5nZVBhc3N3b3JkQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtYWN0aW9uPVwiY2hhbmdlUGFzc3dvcmRcIl0nKTtcbiAgICBlbGVtZW50cy5yZW1vdmVQYXNzd29yZElucHV0ID0gJCgncmVtb3ZlLXBhc3N3b3JkJyk7XG4gICAgZWxlbWVudHMucmVtb3ZlRXJyb3IgPSAkKCdyZW1vdmUtZXJyb3InKTtcbiAgICBlbGVtZW50cy5yZW1vdmVQYXNzd29yZEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWFjdGlvbj1cInJlbW92ZVBhc3N3b3JkXCJdJyk7XG4gICAgXG4gICAgLy8gUHJvdG9jb2wgaGFuZGxlclxuICAgIGVsZW1lbnRzLnByb3RvY29sSGFuZGxlcklucHV0ID0gJCgncHJvdG9jb2wtaGFuZGxlcicpO1xuICAgIGVsZW1lbnRzLnVzZU5qdW1wQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtYWN0aW9uPVwidXNlTmp1bXBcIl0nKTtcbiAgICBlbGVtZW50cy5kaXNhYmxlSGFuZGxlckJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWFjdGlvbj1cImRpc2FibGVIYW5kbGVyXCJdJyk7XG4gICAgXG4gICAgLy8gR2VuZXJhbFxuICAgIGVsZW1lbnRzLmNsb3NlQnRuID0gJCgnY2xvc2UtYnRuJyk7XG4gICAgZWxlbWVudHMuY2xlYXJEYXRhQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtYWN0aW9uPVwiY2xlYXJEYXRhXCJdJyk7XG59XG5cbi8vIFJlbmRlciBmdW5jdGlvbnNcbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICByZW5kZXJQcm9maWxlU2VsZWN0KCk7XG4gICAgcmVuZGVyUHJvZmlsZVR5cGUoKTtcbiAgICBcbiAgICBpZiAoc3RhdGUucHJvZmlsZVR5cGUgPT09ICdsb2NhbCcpIHtcbiAgICAgICAgcmVuZGVyTG9jYWxQcm9maWxlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVuZGVyQnVua2VyUHJvZmlsZSgpO1xuICAgIH1cbiAgICBcbiAgICByZW5kZXJSZWxheXMoKTtcbiAgICByZW5kZXJQZXJtaXNzaW9ucygpO1xuICAgIHJlbmRlclNlY3VyaXR5KCk7XG4gICAgcmVuZGVyUHJvdG9jb2xIYW5kbGVyKCk7XG4gICAgcmVuZGVySW5wdXRzKCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclByb2ZpbGVTZWxlY3QoKSB7XG4gICAgaWYgKCFlbGVtZW50cy5wcm9maWxlU2VsZWN0KSByZXR1cm47XG4gICAgXG4gICAgY29uc3QgaGFzU2VsZWN0aW9uID0gc3RhdGUucHJvZmlsZUluZGV4ICE9PSBudWxsICYmIHN0YXRlLnByb2ZpbGVJbmRleCA+PSAwO1xuICAgIFxuICAgIGVsZW1lbnRzLnByb2ZpbGVTZWxlY3QuaW5uZXJIVE1MID0gXG4gICAgICAgICc8b3B0aW9uIHZhbHVlPVwiXCIgZGlzYWJsZWQnICsgKCFoYXNTZWxlY3Rpb24gPyAnIHNlbGVjdGVkJyA6ICcnKSArICc+U2VsZWN0IGEgcHJvZmlsZS4uLjwvb3B0aW9uPicgK1xuICAgICAgICBzdGF0ZS5wcm9maWxlTmFtZXNcbiAgICAgICAgICAgIC5tYXAoKG5hbWUsIGkpID0+IGA8b3B0aW9uIHZhbHVlPVwiJHtpfVwiJHtpID09PSBzdGF0ZS5wcm9maWxlSW5kZXggJiYgaGFzU2VsZWN0aW9uID8gJyBzZWxlY3RlZCcgOiAnJ30+JHtuYW1lfTwvb3B0aW9uPmApXG4gICAgICAgICAgICAuam9pbignJyk7XG4gICAgXG4gICAgLy8gU2hvdy9oaWRlIHNldHRpbmdzIGNvbnRhaW5lciBiYXNlZCBvbiBzZWxlY3Rpb25cbiAgICBpZiAoZWxlbWVudHMuc2V0dGluZ3NDb250YWluZXIpIHtcbiAgICAgICAgZWxlbWVudHMuc2V0dGluZ3NDb250YWluZXIuc3R5bGUuZGlzcGxheSA9IGhhc1NlbGVjdGlvbiA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJQcm9maWxlVHlwZSgpIHtcbiAgICBjb25zdCBpc0xvY2FsID0gc3RhdGUucHJvZmlsZVR5cGUgPT09ICdsb2NhbCc7XG4gICAgXG4gICAgaWYgKGVsZW1lbnRzLmtleXNTZWN0aW9uKSB7XG4gICAgICAgIGVsZW1lbnRzLmtleXNTZWN0aW9uLnN0eWxlLmRpc3BsYXkgPSBpc0xvY2FsID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLmJ1bmtlclNlY3Rpb24pIHtcbiAgICAgICAgZWxlbWVudHMuYnVua2VyU2VjdGlvbi5zdHlsZS5kaXNwbGF5ID0gaXNMb2NhbCA/ICdub25lJyA6ICdibG9jayc7XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJMb2NhbFByb2ZpbGUoKSB7XG4gICAgaWYgKGVsZW1lbnRzLnByb2ZpbGVOYW1lSW5wdXQpIHtcbiAgICAgICAgZWxlbWVudHMucHJvZmlsZU5hbWVJbnB1dC52YWx1ZSA9IHN0YXRlLnByb2ZpbGVOYW1lO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMucHJpdktleUlucHV0KSB7XG4gICAgICAgIGVsZW1lbnRzLnByaXZLZXlJbnB1dC52YWx1ZSA9IHN0YXRlLnByaXZLZXk7XG4gICAgICAgIGVsZW1lbnRzLnByaXZLZXlJbnB1dC50eXBlID0gc3RhdGUudmlzaWJsZSA/ICd0ZXh0JyA6ICdwYXNzd29yZCc7XG4gICAgICAgIFxuICAgICAgICAvLyBWYWxpZGF0ZSBrZXlcbiAgICAgICAgY29uc3QgaXNWYWxpZCA9IHZhbGlkYXRlS2V5KHN0YXRlLnByaXZLZXkpO1xuICAgICAgICBpZiAoc3RhdGUucHJpdktleSAmJiAhaXNWYWxpZCkge1xuICAgICAgICAgICAgZWxlbWVudHMucHJpdktleUlucHV0LmNsYXNzTGlzdC5hZGQoJ3JpbmctMicsICdyaW5nLXJvc2UtNTAwJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50cy5wcml2S2V5SW5wdXQuY2xhc3NMaXN0LnJlbW92ZSgncmluZy0yJywgJ3Jpbmctcm9zZS01MDAnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZWxlbWVudHMucHViS2V5SW5wdXQpIHtcbiAgICAgICAgZWxlbWVudHMucHViS2V5SW5wdXQudmFsdWUgPSBzdGF0ZS5wdWJLZXk7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy52aXNpYmlsaXR5VG9nZ2xlKSB7XG4gICAgICAgIGVsZW1lbnRzLnZpc2liaWxpdHlUb2dnbGUudGV4dENvbnRlbnQgPSBzdGF0ZS52aXNpYmxlID8gJ0hpZGUnIDogJ1Nob3cnO1xuICAgIH1cbiAgICBcbiAgICAvLyBuY3J5cHRzZWMgaW1wb3J0IHNlY3Rpb25cbiAgICBjb25zdCBoYXNOY3J5cHRzZWMgPSBpc05jcnlwdHNlYyhzdGF0ZS5wcml2S2V5KTtcbiAgICBpZiAoZWxlbWVudHMubmNyeXB0c2VjU2VjdGlvbikge1xuICAgICAgICBlbGVtZW50cy5uY3J5cHRzZWNTZWN0aW9uLnN0eWxlLmRpc3BsYXkgPSBoYXNOY3J5cHRzZWMgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMuc2F2ZVByb2ZpbGVCdG4pIHtcbiAgICAgICAgZWxlbWVudHMuc2F2ZVByb2ZpbGVCdG4uc3R5bGUuZGlzcGxheSA9IGhhc05jcnlwdHNlYyA/ICdub25lJyA6ICdibG9jayc7XG4gICAgICAgIGNvbnN0IG5lZWRzU2F2ZSA9IHN0YXRlLnByaXZLZXkgIT09IHN0YXRlLnByaXN0aW5lUHJpdktleSB8fCBzdGF0ZS5wcm9maWxlTmFtZSAhPT0gc3RhdGUucHJpc3RpbmVQcm9maWxlTmFtZTtcbiAgICAgICAgZWxlbWVudHMuc2F2ZVByb2ZpbGVCdG4uZGlzYWJsZWQgPSAhbmVlZHNTYXZlIHx8ICF2YWxpZGF0ZUtleShzdGF0ZS5wcml2S2V5KTtcbiAgICB9XG4gICAgXG4gICAgLy8gUVIgY29kZXNcbiAgICBpZiAoZWxlbWVudHMubnB1YlFyQ29udGFpbmVyICYmIHN0YXRlLm5wdWJRckRhdGFVcmwpIHtcbiAgICAgICAgZWxlbWVudHMubnB1YlFyQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XG4gICAgICAgIGlmIChlbGVtZW50cy5ucHViUXJJbWFnZSkge1xuICAgICAgICAgICAgZWxlbWVudHMubnB1YlFySW1hZ2Uuc3JjID0gc3RhdGUubnB1YlFyRGF0YVVybDtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZWxlbWVudHMubnB1YlFyQ29udGFpbmVyKSB7XG4gICAgICAgIGVsZW1lbnRzLm5wdWJRckNvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cbiAgICBcbiAgICBpZiAoZWxlbWVudHMuc2hvd05zZWNRckJ0bikge1xuICAgICAgICBlbGVtZW50cy5zaG93TnNlY1FyQnRuLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS52aXNpYmxlICYmIHN0YXRlLnByaXZLZXkgJiYgIWhhc05jcnlwdHNlYyA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5uc2VjUXJTZWN0aW9uKSB7XG4gICAgICAgIGVsZW1lbnRzLm5zZWNRclNlY3Rpb24uc3R5bGUuZGlzcGxheSA9IHN0YXRlLnNob3dOc2VjUXIgJiYgc3RhdGUubnNlY1FyRGF0YVVybCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgICAgIGlmIChlbGVtZW50cy5uc2VjUXJJbWFnZSAmJiBzdGF0ZS5uc2VjUXJEYXRhVXJsKSB7XG4gICAgICAgICAgICBlbGVtZW50cy5uc2VjUXJJbWFnZS5zcmMgPSBzdGF0ZS5uc2VjUXJEYXRhVXJsO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIG5jcnlwdHNlYyBleHBvcnRcbiAgICBpZiAoZWxlbWVudHMuZXhwb3J0TmNyeXB0c2VjQnRuKSB7XG4gICAgICAgIGNvbnN0IGNhbkV4cG9ydCA9IHN0YXRlLm5jcnlwdHNlY0V4cG9ydFBhc3N3b3JkLmxlbmd0aCA+PSA4ICYmIFxuICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLm5jcnlwdHNlY0V4cG9ydFBhc3N3b3JkID09PSBzdGF0ZS5uY3J5cHRzZWNFeHBvcnRDb25maXJtO1xuICAgICAgICBlbGVtZW50cy5leHBvcnROY3J5cHRzZWNCdG4uZGlzYWJsZWQgPSAhY2FuRXhwb3J0IHx8IHN0YXRlLm5jcnlwdHNlY0V4cG9ydExvYWRpbmc7XG4gICAgICAgIGVsZW1lbnRzLmV4cG9ydE5jcnlwdHNlY0J0bi50ZXh0Q29udGVudCA9IHN0YXRlLm5jcnlwdHNlY0V4cG9ydExvYWRpbmcgPyAnRW5jcnlwdGluZy4uLicgOiAnRXhwb3J0IG5jcnlwdHNlYyc7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5uY3J5cHRzZWNFeHBvcnRSZXN1bHQpIHtcbiAgICAgICAgZWxlbWVudHMubmNyeXB0c2VjRXhwb3J0UmVzdWx0LnZhbHVlID0gc3RhdGUubmNyeXB0c2VjRXhwb3J0UmVzdWx0O1xuICAgICAgICBlbGVtZW50cy5uY3J5cHRzZWNFeHBvcnRSZXN1bHQucGFyZW50RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gc3RhdGUubmNyeXB0c2VjRXhwb3J0UmVzdWx0ID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLmNvcHlOY3J5cHRzZWNCdG4pIHtcbiAgICAgICAgZWxlbWVudHMuY29weU5jcnlwdHNlY0J0bi50ZXh0Q29udGVudCA9IHN0YXRlLm5jcnlwdHNlY0V4cG9ydENvcGllZCA/ICdDb3BpZWQhJyA6ICdDb3B5JztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlckJ1bmtlclByb2ZpbGUoKSB7XG4gICAgaWYgKGVsZW1lbnRzLmJ1bmtlclByb2ZpbGVOYW1lSW5wdXQpIHtcbiAgICAgICAgZWxlbWVudHMuYnVua2VyUHJvZmlsZU5hbWVJbnB1dC52YWx1ZSA9IHN0YXRlLnByb2ZpbGVOYW1lO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMuYnVua2VyVXJsSW5wdXQpIHtcbiAgICAgICAgZWxlbWVudHMuYnVua2VyVXJsSW5wdXQudmFsdWUgPSBzdGF0ZS5idW5rZXJVcmw7XG4gICAgICAgIGVsZW1lbnRzLmJ1bmtlclVybElucHV0LmRpc2FibGVkID0gc3RhdGUuYnVua2VyQ29ubmVjdGVkO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMuY29ubmVjdEJ1bmtlckJ0bikge1xuICAgICAgICBlbGVtZW50cy5jb25uZWN0QnVua2VyQnRuLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5idW5rZXJDb25uZWN0ZWQgPyAnbm9uZScgOiAnaW5saW5lLWJsb2NrJztcbiAgICAgICAgZWxlbWVudHMuY29ubmVjdEJ1bmtlckJ0bi5kaXNhYmxlZCA9IHN0YXRlLmJ1bmtlckNvbm5lY3RpbmcgfHwgIXN0YXRlLmJ1bmtlclVybDtcbiAgICAgICAgZWxlbWVudHMuY29ubmVjdEJ1bmtlckJ0bi50ZXh0Q29udGVudCA9IHN0YXRlLmJ1bmtlckNvbm5lY3RpbmcgPyAnQ29ubmVjdGluZy4uLicgOiAnQ29ubmVjdCc7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5kaXNjb25uZWN0QnVua2VyQnRuKSB7XG4gICAgICAgIGVsZW1lbnRzLmRpc2Nvbm5lY3RCdW5rZXJCdG4uc3R5bGUuZGlzcGxheSA9IHN0YXRlLmJ1bmtlckNvbm5lY3RlZCA/ICdpbmxpbmUtYmxvY2snIDogJ25vbmUnO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMucGluZ0J1bmtlckJ0bikge1xuICAgICAgICBlbGVtZW50cy5waW5nQnVua2VyQnRuLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5idW5rZXJDb25uZWN0ZWQgPyAnaW5saW5lLWJsb2NrJyA6ICdub25lJztcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLmJ1bmtlclN0YXR1cykge1xuICAgICAgICBlbGVtZW50cy5idW5rZXJTdGF0dXMuY2xhc3NOYW1lID0gYGlubGluZS1ibG9jayB3LTMgaC0zIHJvdW5kZWQtZnVsbCAke3N0YXRlLmJ1bmtlckNvbm5lY3RlZCA/ICdiZy1ncmVlbi01MDAnIDogJ2JnLXJlZC01MDAnfWA7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5idW5rZXJTdGF0dXNUZXh0KSB7XG4gICAgICAgIGVsZW1lbnRzLmJ1bmtlclN0YXR1c1RleHQudGV4dENvbnRlbnQgPSBzdGF0ZS5idW5rZXJDb25uZWN0ZWQgPyAnQ29ubmVjdGVkJyA6ICdEaXNjb25uZWN0ZWQnO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMuYnVua2VyRXJyb3IpIHtcbiAgICAgICAgZWxlbWVudHMuYnVua2VyRXJyb3IudGV4dENvbnRlbnQgPSBzdGF0ZS5idW5rZXJFcnJvcjtcbiAgICAgICAgZWxlbWVudHMuYnVua2VyRXJyb3Iuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmJ1bmtlckVycm9yID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLmJ1bmtlclB1YktleUlucHV0KSB7XG4gICAgICAgIGVsZW1lbnRzLmJ1bmtlclB1YktleUlucHV0LnZhbHVlID0gc3RhdGUucHViS2V5O1xuICAgICAgICBlbGVtZW50cy5idW5rZXJQdWJLZXlJbnB1dC5wYXJlbnRFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5idW5rZXJQdWJrZXkgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMuc2F2ZUJ1bmtlck5hbWVCdG4pIHtcbiAgICAgICAgY29uc3QgbmVlZHNTYXZlID0gc3RhdGUucHJvZmlsZU5hbWUgIT09IHN0YXRlLnByaXN0aW5lUHJvZmlsZU5hbWU7XG4gICAgICAgIGVsZW1lbnRzLnNhdmVCdW5rZXJOYW1lQnRuLmRpc2FibGVkID0gIW5lZWRzU2F2ZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlcklucHV0cygpIHtcbiAgICAvLyBTeW5jIHN0YXRlIFx1MjE5MiBET00gZm9yIGFsbCB0d28td2F5IGJvdW5kIGlucHV0c1xuICAgIGlmIChlbGVtZW50cy5uZXdSZWxheUlucHV0KSBlbGVtZW50cy5uZXdSZWxheUlucHV0LnZhbHVlID0gc3RhdGUubmV3UmVsYXk7XG4gICAgaWYgKGVsZW1lbnRzLm5jcnlwdHNlY1Bhc3N3b3JkSW5wdXQpIGVsZW1lbnRzLm5jcnlwdHNlY1Bhc3N3b3JkSW5wdXQudmFsdWUgPSBzdGF0ZS5uY3J5cHRzZWNQYXNzd29yZDtcbiAgICBpZiAoZWxlbWVudHMubmNyeXB0c2VjRXhwb3J0UGFzc3dvcmQpIGVsZW1lbnRzLm5jcnlwdHNlY0V4cG9ydFBhc3N3b3JkLnZhbHVlID0gc3RhdGUubmNyeXB0c2VjRXhwb3J0UGFzc3dvcmQ7XG4gICAgaWYgKGVsZW1lbnRzLm5jcnlwdHNlY0V4cG9ydENvbmZpcm0pIGVsZW1lbnRzLm5jcnlwdHNlY0V4cG9ydENvbmZpcm0udmFsdWUgPSBzdGF0ZS5uY3J5cHRzZWNFeHBvcnRDb25maXJtO1xuICAgIGlmIChlbGVtZW50cy5uZXdQYXNzd29yZElucHV0KSBlbGVtZW50cy5uZXdQYXNzd29yZElucHV0LnZhbHVlID0gc3RhdGUubmV3UGFzc3dvcmQ7XG4gICAgaWYgKGVsZW1lbnRzLmNvbmZpcm1QYXNzd29yZElucHV0KSBlbGVtZW50cy5jb25maXJtUGFzc3dvcmRJbnB1dC52YWx1ZSA9IHN0YXRlLmNvbmZpcm1QYXNzd29yZDtcbiAgICBpZiAoZWxlbWVudHMuY3VycmVudFBhc3N3b3JkSW5wdXQpIGVsZW1lbnRzLmN1cnJlbnRQYXNzd29yZElucHV0LnZhbHVlID0gc3RhdGUuY3VycmVudFBhc3N3b3JkO1xuICAgIGlmIChlbGVtZW50cy5uZXdQYXNzd29yZENoYW5nZUlucHV0KSBlbGVtZW50cy5uZXdQYXNzd29yZENoYW5nZUlucHV0LnZhbHVlID0gc3RhdGUubmV3UGFzc3dvcmQ7XG4gICAgaWYgKGVsZW1lbnRzLmNvbmZpcm1QYXNzd29yZENoYW5nZUlucHV0KSBlbGVtZW50cy5jb25maXJtUGFzc3dvcmRDaGFuZ2VJbnB1dC52YWx1ZSA9IHN0YXRlLmNvbmZpcm1QYXNzd29yZDtcbiAgICBpZiAoZWxlbWVudHMucmVtb3ZlUGFzc3dvcmRJbnB1dCkgZWxlbWVudHMucmVtb3ZlUGFzc3dvcmRJbnB1dC52YWx1ZSA9IHN0YXRlLnJlbW92ZVBhc3N3b3JkSW5wdXQ7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclJlbGF5cygpIHtcbiAgICBpZiAoIWVsZW1lbnRzLnJlbGF5c1RhYmxlKSByZXR1cm47XG5cbiAgICBpZiAoc3RhdGUucmVsYXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZWxlbWVudHMucmVsYXlzVGFibGUuc3R5bGUuZGlzcGxheSA9ICd0YWJsZSc7XG4gICAgICAgIGlmIChlbGVtZW50cy5yZWxheXNFbXB0eSkgZWxlbWVudHMucmVsYXlzRW1wdHkuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHRib2R5ID0gZWxlbWVudHMucmVsYXlzVGFibGUucXVlcnlTZWxlY3RvcigndGJvZHknKTtcbiAgICAgICAgaWYgKHRib2R5KSB7XG4gICAgICAgICAgICB0Ym9keS5pbm5lckhUTUwgPSBzdGF0ZS5yZWxheXMubWFwKChyZWxheSwgaW5kZXgpID0+IGBcbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cInAtMiB3LTEvM1wiPiR7cmVsYXkudXJsfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cInAtMiB0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwiY2hlY2tib3hcIiB0eXBlPVwiY2hlY2tib3hcIiAke3JlbGF5LnJlYWQgPyAnY2hlY2tlZCcgOiAnJ30gZGF0YS1yZWxheS1pbmRleD1cIiR7aW5kZXh9XCIgZGF0YS1yZWxheS1wcm9wPVwicmVhZFwiPlxuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJwLTIgdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImNoZWNrYm94XCIgdHlwZT1cImNoZWNrYm94XCIgJHtyZWxheS53cml0ZSA/ICdjaGVja2VkJyA6ICcnfSBkYXRhLXJlbGF5LWluZGV4PVwiJHtpbmRleH1cIiBkYXRhLXJlbGF5LXByb3A9XCJ3cml0ZVwiPlxuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJwLTIgdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidXR0b25cIiBkYXRhLWFjdGlvbj1cImRlbGV0ZVJlbGF5XCIgZGF0YS1yZWxheS1pbmRleD1cIiR7aW5kZXh9XCI+RGVsZXRlPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIGApLmpvaW4oJycpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBCaW5kIHJlbGF5IGNoZWNrYm94IGV2ZW50c1xuICAgICAgICAgICAgdGJvZHkucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykuZm9yRWFjaChjYiA9PiB7XG4gICAgICAgICAgICAgICAgY2IuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlUmVsYXlDaGVja2JveENoYW5nZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQmluZCBkZWxldGUgcmVsYXkgYnV0dG9uc1xuICAgICAgICAgICAgdGJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwiZGVsZXRlUmVsYXlcIl0nKS5mb3JFYWNoKGJ0biA9PiB7XG4gICAgICAgICAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlRGVsZXRlUmVsYXkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50cy5yZWxheXNUYWJsZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICBpZiAoZWxlbWVudHMucmVsYXlzRW1wdHkpIGVsZW1lbnRzLnJlbGF5c0VtcHR5LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIH1cbiAgICBcbiAgICAvLyBSZWNvbW1lbmRlZCByZWxheXNcbiAgICBpZiAoZWxlbWVudHMucmVjb21tZW5kZWRSZWxheVNlbGVjdCkge1xuICAgICAgICBjb25zdCByZWNvbW1lbmRlZCA9IGdldFJlY29tbWVuZGVkUmVsYXlzKCk7XG4gICAgICAgIGVsZW1lbnRzLnJlY29tbWVuZGVkUmVsYXlTZWxlY3QucGFyZW50RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gcmVjb21tZW5kZWQubGVuZ3RoID4gMCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgICAgIGVsZW1lbnRzLnJlY29tbWVuZGVkUmVsYXlTZWxlY3QuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJcIiBkaXNhYmxlZCBzZWxlY3RlZD5SZWNvbW1lbmRlZCBSZWxheXM8L29wdGlvbj4nICtcbiAgICAgICAgICAgIHJlY29tbWVuZGVkLm1hcCh1cmwgPT4gYDxvcHRpb24gdmFsdWU9XCIke3VybH1cIj4ke3VybH08L29wdGlvbj5gKS5qb2luKCcnKTtcbiAgICB9XG4gICAgXG4gICAgaWYgKGVsZW1lbnRzLnJlbGF5RXJyb3IpIHtcbiAgICAgICAgZWxlbWVudHMucmVsYXlFcnJvci50ZXh0Q29udGVudCA9IHN0YXRlLnVybEVycm9yO1xuICAgICAgICBlbGVtZW50cy5yZWxheUVycm9yLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS51cmxFcnJvciA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJQZXJtaXNzaW9ucygpIHtcbiAgICBpZiAoIWVsZW1lbnRzLmFwcFNlbGVjdCkgcmV0dXJuO1xuICAgIFxuICAgIC8vIFJlbmRlciBhcHAgc2VsZWN0XG4gICAgaWYgKHN0YXRlLnBlcm1Ib3N0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGVsZW1lbnRzLmFwcFNlbGVjdC5wYXJlbnRFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICBlbGVtZW50cy5hcHBTZWxlY3QuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJcIj48L29wdGlvbj4nICtcbiAgICAgICAgICAgIHN0YXRlLnBlcm1Ib3N0cy5tYXAoaG9zdCA9PiBgPG9wdGlvbiB2YWx1ZT1cIiR7aG9zdH1cIiR7aG9zdCA9PT0gc3RhdGUuaG9zdCA/ICcgc2VsZWN0ZWQnIDogJyd9PiR7aG9zdH08L29wdGlvbj5gKS5qb2luKCcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50cy5hcHBTZWxlY3QucGFyZW50RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cbiAgICBcbiAgICAvLyBSZW5kZXIgcGVybWlzc2lvbnMgdGFibGVcbiAgICBpZiAoZWxlbWVudHMucGVybWlzc2lvbnNUYWJsZSAmJiBzdGF0ZS5ob3N0UGVybXMubGVuZ3RoID4gMCkge1xuICAgICAgICBlbGVtZW50cy5wZXJtaXNzaW9uc1RhYmxlLnN0eWxlLmRpc3BsYXkgPSAndGFibGUnO1xuICAgICAgICBpZiAoZWxlbWVudHMucGVybWlzc2lvbnNFbXB0eSkgZWxlbWVudHMucGVybWlzc2lvbnNFbXB0eS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdGJvZHkgPSBlbGVtZW50cy5wZXJtaXNzaW9uc1RhYmxlLnF1ZXJ5U2VsZWN0b3IoJ3Rib2R5Jyk7XG4gICAgICAgIGlmICh0Ym9keSkge1xuICAgICAgICAgICAgdGJvZHkuaW5uZXJIVE1MID0gc3RhdGUuaG9zdFBlcm1zLm1hcCgoW2V0eXBlLCBodW1hbk5hbWUsIHBlcm1dKSA9PiBgXG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJwLTIgdy0xLzMgbWQ6dy0yLzRcIj4ke2h1bWFuTmFtZX08L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJwLTIgdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJpbnB1dFwiIGRhdGEtcGVybS10eXBlPVwiJHtldHlwZX1cIiBkYXRhLXBlcm0tdmFsdWU9XCIke3Blcm19XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImFza1wiJHtwZXJtID09PSAnYXNrJyA/ICcgc2VsZWN0ZWQnIDogJyd9PkFzazwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJhbGxvd1wiJHtwZXJtID09PSAnYWxsb3cnID8gJyBzZWxlY3RlZCcgOiAnJ30+QWxsb3c8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiZGVueVwiJHtwZXJtID09PSAnZGVueScgPyAnIHNlbGVjdGVkJyA6ICcnfT5EZW55PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgYCkuam9pbignJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEJpbmQgcGVybWlzc2lvbiBjaGFuZ2UgZXZlbnRzXG4gICAgICAgICAgICB0Ym9keS5xdWVyeVNlbGVjdG9yQWxsKCdzZWxlY3QnKS5mb3JFYWNoKHNlbCA9PiB7XG4gICAgICAgICAgICAgICAgc2VsLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZVBlcm1pc3Npb25DaGFuZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZWxlbWVudHMucGVybWlzc2lvbnNUYWJsZSkgZWxlbWVudHMucGVybWlzc2lvbnNUYWJsZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICBpZiAoZWxlbWVudHMucGVybWlzc2lvbnNFbXB0eSkge1xuICAgICAgICAgICAgZWxlbWVudHMucGVybWlzc2lvbnNFbXB0eS5zdHlsZS5kaXNwbGF5ID0gc3RhdGUucGVybUhvc3RzLmxlbmd0aCA9PT0gMCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlclNlY3VyaXR5KCkge1xuICAgIGlmIChlbGVtZW50cy5zZWN1cml0eVN0YXR1cykge1xuICAgICAgICBlbGVtZW50cy5zZWN1cml0eVN0YXR1cy50ZXh0Q29udGVudCA9IHN0YXRlLmhhc1Bhc3N3b3JkXG4gICAgICAgICAgICA/ICdNYXN0ZXIgcGFzc3dvcmQgaXMgYWN0aXZlIFx1MjAxNCBrZXlzIGFyZSBlbmNyeXB0ZWQgYXQgcmVzdC4nXG4gICAgICAgICAgICA6ICdObyBtYXN0ZXIgcGFzc3dvcmQgc2V0IFx1MjAxNCBrZXlzIGFyZSBzdG9yZWQgdW5lbmNyeXB0ZWQuJztcbiAgICB9XG4gICAgXG4gICAgaWYgKGVsZW1lbnRzLnNldFBhc3N3b3JkU2VjdGlvbikge1xuICAgICAgICBlbGVtZW50cy5zZXRQYXNzd29yZFNlY3Rpb24uc3R5bGUuZGlzcGxheSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ25vbmUnIDogJ2Jsb2NrJztcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLmNoYW5nZVBhc3N3b3JkU2VjdGlvbikge1xuICAgICAgICBlbGVtZW50cy5jaGFuZ2VQYXNzd29yZFNlY3Rpb24uc3R5bGUuZGlzcGxheSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICB9XG4gICAgXG4gICAgLy8gUGFzc3dvcmQgc3RyZW5ndGggaW5kaWNhdG9yXG4gICAgaWYgKGVsZW1lbnRzLnBhc3N3b3JkU3RyZW5ndGggJiYgc3RhdGUubmV3UGFzc3dvcmQpIHtcbiAgICAgICAgY29uc3Qgc3RyZW5ndGggPSBjYWxjdWxhdGVQYXNzd29yZFN0cmVuZ3RoKHN0YXRlLm5ld1Bhc3N3b3JkKTtcbiAgICAgICAgY29uc3QgbGFiZWxzID0gWycnLCAnVG9vIHNob3J0JywgJ1dlYWsnLCAnRmFpcicsICdTdHJvbmcnLCAnVmVyeSBzdHJvbmcnXTtcbiAgICAgICAgY29uc3QgY29sb3JzID0gWycnLCAndGV4dC1yZWQtNTAwJywgJ3RleHQtb3JhbmdlLTUwMCcsICd0ZXh0LXllbGxvdy02MDAnLCAndGV4dC1ncmVlbi02MDAnLCAndGV4dC1ncmVlbi03MDAgZm9udC1ib2xkJ107XG4gICAgICAgIGVsZW1lbnRzLnBhc3N3b3JkU3RyZW5ndGgudGV4dENvbnRlbnQgPSBsYWJlbHNbc3RyZW5ndGhdIHx8ICcnO1xuICAgICAgICBlbGVtZW50cy5wYXNzd29yZFN0cmVuZ3RoLmNsYXNzTmFtZSA9IGB0ZXh0LXhzIG10LTEgJHtjb2xvcnNbc3RyZW5ndGhdIHx8ICcnfWA7XG4gICAgICAgIGVsZW1lbnRzLnBhc3N3b3JkU3RyZW5ndGguc3R5bGUuZGlzcGxheSA9IHN0YXRlLm5ld1Bhc3N3b3JkID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICB9IGVsc2UgaWYgKGVsZW1lbnRzLnBhc3N3b3JkU3RyZW5ndGgpIHtcbiAgICAgICAgZWxlbWVudHMucGFzc3dvcmRTdHJlbmd0aC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cbiAgICBcbiAgICAvLyBCdXR0b24gc3RhdGVzXG4gICAgaWYgKGVsZW1lbnRzLnNldFBhc3N3b3JkQnRuKSB7XG4gICAgICAgIGNvbnN0IGNhblNldCA9IHN0YXRlLm5ld1Bhc3N3b3JkLmxlbmd0aCA+PSA4ICYmIHN0YXRlLm5ld1Bhc3N3b3JkID09PSBzdGF0ZS5jb25maXJtUGFzc3dvcmQ7XG4gICAgICAgIGVsZW1lbnRzLnNldFBhc3N3b3JkQnRuLmRpc2FibGVkID0gIWNhblNldDtcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLmNoYW5nZVBhc3N3b3JkQnRuKSB7XG4gICAgICAgIGNvbnN0IGNhbkNoYW5nZSA9IHN0YXRlLmN1cnJlbnRQYXNzd29yZC5sZW5ndGggPiAwICYmIFxuICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLm5ld1Bhc3N3b3JkLmxlbmd0aCA+PSA4ICYmIFxuICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLm5ld1Bhc3N3b3JkID09PSBzdGF0ZS5jb25maXJtUGFzc3dvcmQ7XG4gICAgICAgIGVsZW1lbnRzLmNoYW5nZVBhc3N3b3JkQnRuLmRpc2FibGVkID0gIWNhbkNoYW5nZTtcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLnJlbW92ZVBhc3N3b3JkQnRuKSB7XG4gICAgICAgIGVsZW1lbnRzLnJlbW92ZVBhc3N3b3JkQnRuLmRpc2FibGVkID0gIXN0YXRlLnJlbW92ZVBhc3N3b3JkSW5wdXQ7XG4gICAgfVxuICAgIFxuICAgIC8vIEVycm9yL3N1Y2Nlc3MgbWVzc2FnZXNcbiAgICBpZiAoZWxlbWVudHMuc2VjdXJpdHlFcnJvcikge1xuICAgICAgICBlbGVtZW50cy5zZWN1cml0eUVycm9yLnRleHRDb250ZW50ID0gc3RhdGUuc2VjdXJpdHlFcnJvcjtcbiAgICAgICAgZWxlbWVudHMuc2VjdXJpdHlFcnJvci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuc2VjdXJpdHlFcnJvciA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5zZWN1cml0eVN1Y2Nlc3MpIHtcbiAgICAgICAgZWxlbWVudHMuc2VjdXJpdHlTdWNjZXNzLnRleHRDb250ZW50ID0gc3RhdGUuc2VjdXJpdHlTdWNjZXNzO1xuICAgICAgICBlbGVtZW50cy5zZWN1cml0eVN1Y2Nlc3Muc3R5bGUuZGlzcGxheSA9IHN0YXRlLnNlY3VyaXR5U3VjY2VzcyA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5yZW1vdmVFcnJvcikge1xuICAgICAgICBlbGVtZW50cy5yZW1vdmVFcnJvci50ZXh0Q29udGVudCA9IHN0YXRlLnJlbW92ZUVycm9yO1xuICAgICAgICBlbGVtZW50cy5yZW1vdmVFcnJvci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUucmVtb3ZlRXJyb3IgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyUHJvdG9jb2xIYW5kbGVyKCkge1xuICAgIGlmIChlbGVtZW50cy5wcm90b2NvbEhhbmRsZXJJbnB1dCkge1xuICAgICAgICBlbGVtZW50cy5wcm90b2NvbEhhbmRsZXJJbnB1dC52YWx1ZSA9IHN0YXRlLnByb3RvY29sSGFuZGxlcjtcbiAgICB9XG59XG5cbi8vIEhlbHBlciBmdW5jdGlvbnNcbmZ1bmN0aW9uIGdldFJlY29tbWVuZGVkUmVsYXlzKCkge1xuICAgIGNvbnN0IHJlbGF5VXJscyA9IHN0YXRlLnJlbGF5cy5tYXAociA9PiBuZXcgVVJMKHIudXJsKS5ocmVmKTtcbiAgICByZXR1cm4gUkVDT01NRU5ERURfUkVMQVlTLmZpbHRlcihyID0+ICFyZWxheVVybHMuaW5jbHVkZXMoci5ocmVmKSkubWFwKHIgPT4gci5ocmVmKTtcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlUGFzc3dvcmRTdHJlbmd0aChwdykge1xuICAgIGlmIChwdy5sZW5ndGggPT09IDApIHJldHVybiAwO1xuICAgIGlmIChwdy5sZW5ndGggPCA4KSByZXR1cm4gMTtcbiAgICBsZXQgc2NvcmUgPSAyO1xuICAgIGlmIChwdy5sZW5ndGggPj0gMTIpIHNjb3JlKys7XG4gICAgaWYgKC9bQS1aXS8udGVzdChwdykgJiYgL1thLXpdLy50ZXN0KHB3KSkgc2NvcmUrKztcbiAgICBpZiAoL1xcZC8udGVzdChwdykpIHNjb3JlKys7XG4gICAgaWYgKC9bXkEtWmEtejAtOV0vLnRlc3QocHcpKSBzY29yZSsrO1xuICAgIHJldHVybiBNYXRoLm1pbihzY29yZSwgNSk7XG59XG5cbi8vIERhdGEgbG9hZGluZyBmdW5jdGlvbnNcbmFzeW5jIGZ1bmN0aW9uIGxvYWRQcm9maWxlKCkge1xuICAgIHN0YXRlLnByb2ZpbGVOYW1lcyA9IGF3YWl0IGdldFByb2ZpbGVOYW1lcygpO1xuICAgIHN0YXRlLnByb2ZpbGVJbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIFxuICAgIC8vIENoZWNrIGZvciBpbmRleCBpbiBVUkxcbiAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuICAgIGNvbnN0IHVybEluZGV4ID0gcGFyYW1zLmdldCgnaW5kZXgnKTtcbiAgICBpZiAodXJsSW5kZXgpIHtcbiAgICAgICAgc3RhdGUucHJvZmlsZUluZGV4ID0gcGFyc2VJbnQodXJsSW5kZXgpO1xuICAgIH1cbiAgICBcbiAgICBhd2FpdCByZWZyZXNoUHJvZmlsZSgpO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZWZyZXNoUHJvZmlsZSgpIHtcbiAgICBzdGF0ZS5wcm9maWxlTmFtZXMgPSBhd2FpdCBnZXRQcm9maWxlTmFtZXMoKTtcbiAgICBzdGF0ZS5wcm9maWxlTmFtZSA9IHN0YXRlLnByb2ZpbGVOYW1lc1tzdGF0ZS5wcm9maWxlSW5kZXhdO1xuICAgIHN0YXRlLnByaXN0aW5lUHJvZmlsZU5hbWUgPSBzdGF0ZS5wcm9maWxlTmFtZTtcbiAgICBcbiAgICAvLyBMb2FkIHByb2ZpbGUgdHlwZVxuICAgIHN0YXRlLnByb2ZpbGVUeXBlID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBraW5kOiAnZ2V0UHJvZmlsZVR5cGUnLFxuICAgICAgICBwYXlsb2FkOiBzdGF0ZS5wcm9maWxlSW5kZXgsXG4gICAgfSk7XG4gICAgXG4gICAgLy8gUmVzZXQgUVIgYW5kIG5jcnlwdHNlYyBzdGF0ZVxuICAgIHN0YXRlLm5wdWJRckRhdGFVcmwgPSAnJztcbiAgICBzdGF0ZS5uc2VjUXJEYXRhVXJsID0gJyc7XG4gICAgc3RhdGUuc2hvd05zZWNRciA9IGZhbHNlO1xuICAgIHN0YXRlLm5jcnlwdHNlY0V4cG9ydFJlc3VsdCA9ICcnO1xuICAgIHN0YXRlLm5jcnlwdHNlY0V4cG9ydEVycm9yID0gJyc7XG4gICAgc3RhdGUubmNyeXB0c2VjRXhwb3J0UGFzc3dvcmQgPSAnJztcbiAgICBzdGF0ZS5uY3J5cHRzZWNFeHBvcnRDb25maXJtID0gJyc7XG4gICAgXG4gICAgaWYgKHN0YXRlLnByb2ZpbGVUeXBlID09PSAnbG9jYWwnKSB7XG4gICAgICAgIGF3YWl0IGxvYWRMb2NhbFByb2ZpbGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBsb2FkQnVua2VyUHJvZmlsZSgpO1xuICAgIH1cbiAgICBcbiAgICBhd2FpdCBsb2FkUmVsYXlzKCk7XG4gICAgYXdhaXQgbG9hZFBlcm1pc3Npb25zKCk7XG4gICAgXG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRMb2NhbFByb2ZpbGUoKSB7XG4gICAgc3RhdGUucHJpdktleSA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ2dldE5zZWMnLFxuICAgICAgICBwYXlsb2FkOiBzdGF0ZS5wcm9maWxlSW5kZXgsXG4gICAgfSk7XG4gICAgc3RhdGUucHJpc3RpbmVQcml2S2V5ID0gc3RhdGUucHJpdktleTtcbiAgICBcbiAgICBzdGF0ZS5wdWJLZXkgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIGtpbmQ6ICdnZXROcHViJyxcbiAgICAgICAgcGF5bG9hZDogc3RhdGUucHJvZmlsZUluZGV4LFxuICAgIH0pO1xuICAgIFxuICAgIGF3YWl0IGdlbmVyYXRlTnB1YlFyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRCdW5rZXJQcm9maWxlKCkge1xuICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBnZXRQcm9maWxlKHN0YXRlLnByb2ZpbGVJbmRleCk7XG4gICAgc3RhdGUuYnVua2VyVXJsID0gcHJvZmlsZT8uYnVua2VyVXJsIHx8ICcnO1xuICAgIHN0YXRlLmJ1bmtlclB1YmtleSA9IHByb2ZpbGU/LnJlbW90ZVB1YmtleSB8fCAnJztcbiAgICBzdGF0ZS5idW5rZXJFcnJvciA9ICcnO1xuICAgIFxuICAgIGlmIChzdGF0ZS5idW5rZXJQdWJrZXkpIHtcbiAgICAgICAgc3RhdGUucHViS2V5ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ25wdWJFbmNvZGUnLFxuICAgICAgICAgICAgcGF5bG9hZDogc3RhdGUuYnVua2VyUHVia2V5LFxuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0ZS5wdWJLZXkgPSAnJztcbiAgICB9XG4gICAgXG4gICAgY29uc3Qgc3RhdHVzID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBraW5kOiAnYnVua2VyLnN0YXR1cycsXG4gICAgICAgIHBheWxvYWQ6IHN0YXRlLnByb2ZpbGVJbmRleCxcbiAgICB9KTtcbiAgICBzdGF0ZS5idW5rZXJDb25uZWN0ZWQgPSBzdGF0dXM/LmNvbm5lY3RlZCB8fCBmYWxzZTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZFJlbGF5cygpIHtcbiAgICBzdGF0ZS5yZWxheXMgPSBhd2FpdCBnZXRSZWxheXMoc3RhdGUucHJvZmlsZUluZGV4KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZFBlcm1pc3Npb25zKCkge1xuICAgIHN0YXRlLnBlcm1pc3Npb25zID0gYXdhaXQgZ2V0UGVybWlzc2lvbnMoc3RhdGUucHJvZmlsZUluZGV4KTtcbiAgICBcbiAgICAvLyBDYWxjdWxhdGUgaG9zdHNcbiAgICBzdGF0ZS5wZXJtSG9zdHMgPSBPYmplY3Qua2V5cyhzdGF0ZS5wZXJtaXNzaW9ucykuc29ydCgpO1xuICAgIFxuICAgIC8vIENhbGN1bGF0ZSBob3N0IHBlcm1zXG4gICAgY2FsY0hvc3RQZXJtcygpO1xufVxuXG5mdW5jdGlvbiBjYWxjSG9zdFBlcm1zKCkge1xuICAgIGNvbnN0IGhwID0gc3RhdGUucGVybWlzc2lvbnNbc3RhdGUuaG9zdF0gfHwge307XG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGhwKS5zb3J0KCk7XG4gICAgc3RhdGUuaG9zdFBlcm1zID0ga2V5cy5tYXAoayA9PiBbaywgaHVtYW5QZXJtaXNzaW9uKGspLCBocFtrXV0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZU5wdWJRcigpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAoIXN0YXRlLnB1YktleSkge1xuICAgICAgICAgICAgc3RhdGUubnB1YlFyRGF0YVVybCA9ICcnO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRlLm5wdWJRckRhdGFVcmwgPSBhd2FpdCBRUkNvZGUudG9EYXRhVVJMKHN0YXRlLnB1YktleS50b1VwcGVyQ2FzZSgpLCB7XG4gICAgICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICAgICAgbWFyZ2luOiAyLFxuICAgICAgICAgICAgY29sb3I6IHsgZGFyazogJyM3MDFhNzUnLCBsaWdodDogJyNmZGY0ZmYnIH0sXG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICBzdGF0ZS5ucHViUXJEYXRhVXJsID0gJyc7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZU5zZWNRcigpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAoIXN0YXRlLnZpc2libGUgfHwgIXN0YXRlLnByaXZLZXkpIHtcbiAgICAgICAgICAgIHN0YXRlLm5zZWNRckRhdGFVcmwgPSAnJztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuc2VjID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ2dldE5zZWMnLFxuICAgICAgICAgICAgcGF5bG9hZDogc3RhdGUucHJvZmlsZUluZGV4LFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFuc2VjKSB7XG4gICAgICAgICAgICBzdGF0ZS5uc2VjUXJEYXRhVXJsID0gJyc7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUubnNlY1FyRGF0YVVybCA9IGF3YWl0IFFSQ29kZS50b0RhdGFVUkwobnNlYy50b1VwcGVyQ2FzZSgpLCB7XG4gICAgICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICAgICAgbWFyZ2luOiAyLFxuICAgICAgICAgICAgY29sb3I6IHsgZGFyazogJyM5OTFiMWInLCBsaWdodDogJyNmZWYyZjInIH0sXG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICBzdGF0ZS5uc2VjUXJEYXRhVXJsID0gJyc7XG4gICAgfVxufVxuXG4vLyBFdmVudCBoYW5kbGVyc1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlUHJvZmlsZUNoYW5nZSgpIHtcbiAgICBjb25zdCB2YWwgPSBlbGVtZW50cy5wcm9maWxlU2VsZWN0LnZhbHVlO1xuICAgIGlmICghdmFsICYmIHZhbCAhPT0gJzAnKSByZXR1cm47IC8vIHBsYWNlaG9sZGVyIHNlbGVjdGVkXG4gICAgY29uc3QgbmV3SW5kZXggPSBwYXJzZUludCh2YWwpO1xuICAgIGlmIChpc05hTihuZXdJbmRleCkpIHJldHVybjtcbiAgICBpZiAobmV3SW5kZXggIT09IHN0YXRlLnByb2ZpbGVJbmRleCkge1xuICAgICAgICBzdGF0ZS5wcm9maWxlSW5kZXggPSBuZXdJbmRleDtcbiAgICAgICAgc3RhdGUuaG9zdCA9ICcnO1xuICAgICAgICBhd2FpdCByZWZyZXNoUHJvZmlsZSgpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTmV3QnVua2VyUHJvZmlsZSgpIHtcbiAgICBjb25zdCBuZXdJbmRleCA9IGF3YWl0IG5ld0J1bmtlclByb2ZpbGUoKTtcbiAgICBzdGF0ZS5wcm9maWxlSW5kZXggPSBuZXdJbmRleDtcbiAgICBhd2FpdCByZWZyZXNoUHJvZmlsZSgpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVQcm9maWxlTmFtZUlucHV0KGUpIHtcbiAgICBzdGF0ZS5wcm9maWxlTmFtZSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgIHJlbmRlcigpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVQcml2S2V5SW5wdXQoZSkge1xuICAgIHN0YXRlLnByaXZLZXkgPSBlLnRhcmdldC52YWx1ZTtcbiAgICByZW5kZXIoKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlVG9nZ2xlVmlzaWJpbGl0eSgpIHtcbiAgICBzdGF0ZS52aXNpYmxlID0gIXN0YXRlLnZpc2libGU7XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNvcHlQdWJLZXkoKSB7XG4gICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoc3RhdGUucHViS2V5KTtcbiAgICBzdGF0ZS5jb3BpZWQgPSB0cnVlO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBzdGF0ZS5jb3BpZWQgPSBmYWxzZTtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfSwgMTUwMCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNhdmVQcm9maWxlKCkge1xuICAgIGlmIChzdGF0ZS5wcm9maWxlVHlwZSA9PT0gJ2xvY2FsJykge1xuICAgICAgICBhd2FpdCBzYXZlUHJpdmF0ZUtleShzdGF0ZS5wcm9maWxlSW5kZXgsIHN0YXRlLnByaXZLZXkpO1xuICAgIH1cbiAgICBhd2FpdCBzYXZlUHJvZmlsZU5hbWUoc3RhdGUucHJvZmlsZUluZGV4LCBzdGF0ZS5wcm9maWxlTmFtZSk7XG4gICAgYXdhaXQgcmVmcmVzaFByb2ZpbGUoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2hvd05zZWNRcigpIHtcbiAgICBhd2FpdCBnZW5lcmF0ZU5zZWNRcigpO1xuICAgIHN0YXRlLnNob3dOc2VjUXIgPSB0cnVlO1xuICAgIHJlbmRlcigpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVIaWRlTnNlY1FyKCkge1xuICAgIHN0YXRlLnNob3dOc2VjUXIgPSBmYWxzZTtcbiAgICBzdGF0ZS5uc2VjUXJEYXRhVXJsID0gJyc7XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZURlY3J5cHROY3J5cHRzZWMoKSB7XG4gICAgc3RhdGUubmNyeXB0c2VjRXJyb3IgPSAnJztcbiAgICBzdGF0ZS5uY3J5cHRzZWNMb2FkaW5nID0gdHJ1ZTtcbiAgICByZW5kZXIoKTtcbiAgICBcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBraW5kOiAnbmNyeXB0c2VjLmRlY3J5cHQnLFxuICAgICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgICAgIG5jcnlwdHNlYzogc3RhdGUucHJpdktleSxcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogc3RhdGUubmNyeXB0c2VjUGFzc3dvcmQsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgYXdhaXQgc2F2ZVByaXZhdGVLZXkoc3RhdGUucHJvZmlsZUluZGV4LCByZXN1bHQuaGV4S2V5KTtcbiAgICAgICAgICAgIHN0YXRlLm5jcnlwdHNlY1Bhc3N3b3JkID0gJyc7XG4gICAgICAgICAgICBhd2FpdCByZWZyZXNoUHJvZmlsZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUubmNyeXB0c2VjRXJyb3IgPSByZXN1bHQuZXJyb3IgfHwgJ0RlY3J5cHRpb24gZmFpbGVkLiBXcm9uZyBwYXNzd29yZD8nO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5uY3J5cHRzZWNFcnJvciA9IGUubWVzc2FnZSB8fCAnRGVjcnlwdGlvbiBmYWlsZWQnO1xuICAgIH1cbiAgICBcbiAgICBzdGF0ZS5uY3J5cHRzZWNMb2FkaW5nID0gZmFsc2U7XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUV4cG9ydE5jcnlwdHNlYygpIHtcbiAgICBzdGF0ZS5uY3J5cHRzZWNFeHBvcnRFcnJvciA9ICcnO1xuICAgIHN0YXRlLm5jcnlwdHNlY0V4cG9ydFJlc3VsdCA9ICcnO1xuICAgIHN0YXRlLm5jcnlwdHNlY0V4cG9ydExvYWRpbmcgPSB0cnVlO1xuICAgIHJlbmRlcigpO1xuICAgIFxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQ6ICduY3J5cHRzZWMuZW5jcnlwdCcsXG4gICAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICAgICAgcHJvZmlsZUluZGV4OiBzdGF0ZS5wcm9maWxlSW5kZXgsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHN0YXRlLm5jcnlwdHNlY0V4cG9ydFBhc3N3b3JkLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLm5jcnlwdHNlY0V4cG9ydFJlc3VsdCA9IHJlc3VsdC5uY3J5cHRzZWM7XG4gICAgICAgICAgICBzdGF0ZS5uY3J5cHRzZWNFeHBvcnRQYXNzd29yZCA9ICcnO1xuICAgICAgICAgICAgc3RhdGUubmNyeXB0c2VjRXhwb3J0Q29uZmlybSA9ICcnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUubmNyeXB0c2VjRXhwb3J0RXJyb3IgPSByZXN1bHQuZXJyb3IgfHwgJ0VuY3J5cHRpb24gZmFpbGVkJztcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUubmNyeXB0c2VjRXhwb3J0RXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ0VuY3J5cHRpb24gZmFpbGVkJztcbiAgICB9XG4gICAgXG4gICAgc3RhdGUubmNyeXB0c2VjRXhwb3J0TG9hZGluZyA9IGZhbHNlO1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDb3B5TmNyeXB0c2VjRXhwb3J0KCkge1xuICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHN0YXRlLm5jcnlwdHNlY0V4cG9ydFJlc3VsdCk7XG4gICAgc3RhdGUubmNyeXB0c2VjRXhwb3J0Q29waWVkID0gdHJ1ZTtcbiAgICByZW5kZXIoKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgc3RhdGUubmNyeXB0c2VjRXhwb3J0Q29waWVkID0gZmFsc2U7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH0sIDE1MDApO1xufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDb25uZWN0QnVua2VyKCkge1xuICAgIHN0YXRlLmJ1bmtlckVycm9yID0gJyc7XG4gICAgc3RhdGUuYnVua2VyQ29ubmVjdGluZyA9IHRydWU7XG4gICAgcmVuZGVyKCk7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdmFsaWRhdGlvbiA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQ6ICdidW5rZXIudmFsaWRhdGVVcmwnLFxuICAgICAgICAgICAgcGF5bG9hZDogc3RhdGUuYnVua2VyVXJsLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCF2YWxpZGF0aW9uLnZhbGlkKSB7XG4gICAgICAgICAgICBzdGF0ZS5idW5rZXJFcnJvciA9IHZhbGlkYXRpb24uZXJyb3I7XG4gICAgICAgICAgICBzdGF0ZS5idW5rZXJDb25uZWN0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ2J1bmtlci5jb25uZWN0JyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgICBwcm9maWxlSW5kZXg6IHN0YXRlLnByb2ZpbGVJbmRleCxcbiAgICAgICAgICAgICAgICBidW5rZXJVcmw6IHN0YXRlLmJ1bmtlclVybCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5idW5rZXJDb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgc3RhdGUuYnVua2VyUHVia2V5ID0gcmVzdWx0LnJlbW90ZVB1YmtleTtcbiAgICAgICAgICAgIHN0YXRlLnB1YktleSA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICBraW5kOiAnbnB1YkVuY29kZScsXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogcmVzdWx0LnJlbW90ZVB1YmtleSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUuYnVua2VyRXJyb3IgPSByZXN1bHQuZXJyb3IgfHwgJ0ZhaWxlZCB0byBjb25uZWN0JztcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUuYnVua2VyRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ0Nvbm5lY3Rpb24gZmFpbGVkJztcbiAgICB9XG4gICAgXG4gICAgc3RhdGUuYnVua2VyQ29ubmVjdGluZyA9IGZhbHNlO1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVEaXNjb25uZWN0QnVua2VyKCkge1xuICAgIHN0YXRlLmJ1bmtlckVycm9yID0gJyc7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBraW5kOiAnYnVua2VyLmRpc2Nvbm5lY3QnLFxuICAgICAgICBwYXlsb2FkOiBzdGF0ZS5wcm9maWxlSW5kZXgsXG4gICAgfSk7XG4gICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgIHN0YXRlLmJ1bmtlckNvbm5lY3RlZCA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXRlLmJ1bmtlckVycm9yID0gcmVzdWx0LmVycm9yIHx8ICdGYWlsZWQgdG8gZGlzY29ubmVjdCc7XG4gICAgfVxuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVQaW5nQnVua2VyKCkge1xuICAgIHN0YXRlLmJ1bmtlckVycm9yID0gJyc7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBraW5kOiAnYnVua2VyLnBpbmcnLFxuICAgICAgICBwYXlsb2FkOiBzdGF0ZS5wcm9maWxlSW5kZXgsXG4gICAgfSk7XG4gICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICBzdGF0ZS5idW5rZXJFcnJvciA9IHJlc3VsdC5lcnJvciB8fCAnUGluZyBmYWlsZWQnO1xuICAgICAgICBzdGF0ZS5idW5rZXJDb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlbGF5Q2hlY2tib3hDaGFuZ2UoZSkge1xuICAgIGNvbnN0IGluZGV4ID0gcGFyc2VJbnQoZS50YXJnZXQuZGF0YXNldC5yZWxheUluZGV4KTtcbiAgICBjb25zdCBwcm9wID0gZS50YXJnZXQuZGF0YXNldC5yZWxheVByb3A7XG4gICAgc3RhdGUucmVsYXlzW2luZGV4XVtwcm9wXSA9IGUudGFyZ2V0LmNoZWNrZWQ7XG4gICAgYXdhaXQgc2F2ZVJlbGF5cyhzdGF0ZS5wcm9maWxlSW5kZXgsIHN0YXRlLnJlbGF5cyk7XG4gICAgYXdhaXQgbG9hZFJlbGF5cygpO1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVEZWxldGVSZWxheShlKSB7XG4gICAgY29uc3QgaW5kZXggPSBwYXJzZUludChlLnRhcmdldC5kYXRhc2V0LnJlbGF5SW5kZXgpO1xuICAgIHN0YXRlLnJlbGF5cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIGF3YWl0IHNhdmVSZWxheXMoc3RhdGUucHJvZmlsZUluZGV4LCBzdGF0ZS5yZWxheXMpO1xuICAgIGF3YWl0IGxvYWRSZWxheXMoKTtcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQWRkUmVsYXkoKSB7XG4gICAgY29uc3QgbmV3UmVsYXkgPSBzdGF0ZS5yZWNvbW1lbmRlZFJlbGF5IHx8IHN0YXRlLm5ld1JlbGF5O1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwobmV3UmVsYXkpO1xuICAgICAgICBpZiAodXJsLnByb3RvY29sICE9PSAnd3NzOicpIHtcbiAgICAgICAgICAgIHNldFVybEVycm9yKCdNdXN0IGJlIGEgd2Vic29ja2V0IHVybCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVybHMgPSBzdGF0ZS5yZWxheXMubWFwKHYgPT4gdi51cmwpO1xuICAgICAgICBpZiAodXJscy5pbmNsdWRlcyh1cmwuaHJlZikpIHtcbiAgICAgICAgICAgIHNldFVybEVycm9yKCdVUkwgYWxyZWFkeSBleGlzdHMnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzdGF0ZS5yZWxheXMucHVzaCh7IHVybDogdXJsLmhyZWYsIHJlYWQ6IHRydWUsIHdyaXRlOiB0cnVlIH0pO1xuICAgICAgICBhd2FpdCBzYXZlUmVsYXlzKHN0YXRlLnByb2ZpbGVJbmRleCwgc3RhdGUucmVsYXlzKTtcbiAgICAgICAgc3RhdGUubmV3UmVsYXkgPSAnJztcbiAgICAgICAgc3RhdGUucmVjb21tZW5kZWRSZWxheSA9ICcnO1xuICAgICAgICBhd2FpdCBsb2FkUmVsYXlzKCk7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHNldFVybEVycm9yKCdJbnZhbGlkIHdlYnNvY2tldCBVUkwnKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNldFVybEVycm9yKG1lc3NhZ2UpIHtcbiAgICBzdGF0ZS51cmxFcnJvciA9IG1lc3NhZ2U7XG4gICAgcmVuZGVyKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHN0YXRlLnVybEVycm9yID0gJyc7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH0sIDMwMDApO1xufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVQZXJtaXNzaW9uQ2hhbmdlKGUpIHtcbiAgICBjb25zdCBldHlwZSA9IGUudGFyZ2V0LmRhdGFzZXQucGVybVR5cGU7XG4gICAgY29uc3QgdmFsdWUgPSBlLnRhcmdldC52YWx1ZTtcbiAgICBhd2FpdCBzZXRQZXJtaXNzaW9uKHN0YXRlLmhvc3QsIGV0eXBlLCB2YWx1ZSwgc3RhdGUucHJvZmlsZUluZGV4KTtcbiAgICBhd2FpdCBsb2FkUGVybWlzc2lvbnMoKTtcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2V0UGFzc3dvcmQoKSB7XG4gICAgc3RhdGUuc2VjdXJpdHlFcnJvciA9ICcnO1xuICAgIHN0YXRlLnNlY3VyaXR5U3VjY2VzcyA9ICcnO1xuICAgIFxuICAgIGlmIChzdGF0ZS5uZXdQYXNzd29yZC5sZW5ndGggPCA4KSB7XG4gICAgICAgIHN0YXRlLnNlY3VyaXR5RXJyb3IgPSAnUGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA4IGNoYXJhY3RlcnMuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHN0YXRlLm5ld1Bhc3N3b3JkICE9PSBzdGF0ZS5jb25maXJtUGFzc3dvcmQpIHtcbiAgICAgICAgc3RhdGUuc2VjdXJpdHlFcnJvciA9ICdQYXNzd29yZHMgZG8gbm90IG1hdGNoLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ3NldFBhc3N3b3JkJyxcbiAgICAgICAgcGF5bG9hZDogc3RhdGUubmV3UGFzc3dvcmQsXG4gICAgfSk7XG4gICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgIHN0YXRlLmhhc1Bhc3N3b3JkID0gdHJ1ZTtcbiAgICAgICAgc3RhdGUubmV3UGFzc3dvcmQgPSAnJztcbiAgICAgICAgc3RhdGUuY29uZmlybVBhc3N3b3JkID0gJyc7XG4gICAgICAgIHN0YXRlLnNlY3VyaXR5U3VjY2VzcyA9ICdNYXN0ZXIgcGFzc3dvcmQgc2V0LiBZb3VyIGtleXMgYXJlIG5vdyBlbmNyeXB0ZWQgYXQgcmVzdC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBzdGF0ZS5zZWN1cml0eVN1Y2Nlc3MgPSAnJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9LCA1MDAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gcmVzdWx0LmVycm9yIHx8ICdGYWlsZWQgdG8gc2V0IHBhc3N3b3JkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2hhbmdlUGFzc3dvcmQoKSB7XG4gICAgc3RhdGUuc2VjdXJpdHlFcnJvciA9ICcnO1xuICAgIHN0YXRlLnNlY3VyaXR5U3VjY2VzcyA9ICcnO1xuICAgIFxuICAgIGlmICghc3RhdGUuY3VycmVudFBhc3N3b3JkKSB7XG4gICAgICAgIHN0YXRlLnNlY3VyaXR5RXJyb3IgPSAnUGxlYXNlIGVudGVyIHlvdXIgY3VycmVudCBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc3RhdGUubmV3UGFzc3dvcmQubGVuZ3RoIDwgOCkge1xuICAgICAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gJ05ldyBwYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycy4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc3RhdGUubmV3UGFzc3dvcmQgIT09IHN0YXRlLmNvbmZpcm1QYXNzd29yZCkge1xuICAgICAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gJ05ldyBwYXNzd29yZHMgZG8gbm90IG1hdGNoLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ2NoYW5nZVBhc3N3b3JkJyxcbiAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgb2xkUGFzc3dvcmQ6IHN0YXRlLmN1cnJlbnRQYXNzd29yZCxcbiAgICAgICAgICAgIG5ld1Bhc3N3b3JkOiBzdGF0ZS5uZXdQYXNzd29yZCxcbiAgICAgICAgfSxcbiAgICB9KTtcbiAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgc3RhdGUuY3VycmVudFBhc3N3b3JkID0gJyc7XG4gICAgICAgIHN0YXRlLm5ld1Bhc3N3b3JkID0gJyc7XG4gICAgICAgIHN0YXRlLmNvbmZpcm1QYXNzd29yZCA9ICcnO1xuICAgICAgICBzdGF0ZS5zZWN1cml0eVN1Y2Nlc3MgPSAnTWFzdGVyIHBhc3N3b3JkIGNoYW5nZWQgc3VjY2Vzc2Z1bGx5Lic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHN0YXRlLnNlY3VyaXR5U3VjY2VzcyA9ICcnO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH0sIDUwMDApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXRlLnNlY3VyaXR5RXJyb3IgPSByZXN1bHQuZXJyb3IgfHwgJ0ZhaWxlZCB0byBjaGFuZ2UgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVSZW1vdmVQYXNzd29yZCgpIHtcbiAgICBzdGF0ZS5yZW1vdmVFcnJvciA9ICcnO1xuICAgIFxuICAgIGlmICghc3RhdGUucmVtb3ZlUGFzc3dvcmRJbnB1dCkge1xuICAgICAgICBzdGF0ZS5yZW1vdmVFcnJvciA9ICdQbGVhc2UgZW50ZXIgeW91ciBjdXJyZW50IHBhc3N3b3JkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghY29uZmlybSgnVGhpcyB3aWxsIHJlbW92ZSBlbmNyeXB0aW9uIGZyb20geW91ciBwcml2YXRlIGtleXMuIFRoZXkgd2lsbCBiZSBzdG9yZWQgYXMgcGxhaW50ZXh0LiBBcmUgeW91IHN1cmU/JykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIGtpbmQ6ICdyZW1vdmVQYXNzd29yZCcsXG4gICAgICAgIHBheWxvYWQ6IHN0YXRlLnJlbW92ZVBhc3N3b3JkSW5wdXQsXG4gICAgfSk7XG4gICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgIHN0YXRlLmhhc1Bhc3N3b3JkID0gZmFsc2U7XG4gICAgICAgIHN0YXRlLnJlbW92ZVBhc3N3b3JkSW5wdXQgPSAnJztcbiAgICAgICAgc3RhdGUuc2VjdXJpdHlTdWNjZXNzID0gJ01hc3RlciBwYXNzd29yZCByZW1vdmVkLiBLZXlzIGFyZSBub3cgc3RvcmVkIHVuZW5jcnlwdGVkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHN0YXRlLnNlY3VyaXR5U3VjY2VzcyA9ICcnO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH0sIDUwMDApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXRlLnJlbW92ZUVycm9yID0gcmVzdWx0LmVycm9yIHx8ICdGYWlsZWQgdG8gcmVtb3ZlIHBhc3N3b3JkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2F2ZVByb3RvY29sSGFuZGxlcigpIHtcbiAgICBpZiAoc3RhdGUucHJvdG9jb2xIYW5kbGVyKSB7XG4gICAgICAgIGF3YWl0IGFwaS5zdG9yYWdlLmxvY2FsLnNldCh7IHByb3RvY29sX2hhbmRsZXI6IHN0YXRlLnByb3RvY29sSGFuZGxlciB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBhcGkuc3RvcmFnZS5sb2NhbC5yZW1vdmUoJ3Byb3RvY29sX2hhbmRsZXInKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNsZWFyRGF0YSgpIHtcbiAgICBpZiAoIWNvbmZpcm0oJ1RoaXMgd2lsbCByZW1vdmUgeW91ciBwcml2YXRlIGtleXMgYW5kIGFsbCBhc3NvY2lhdGVkIGRhdGEuIEFyZSB5b3Ugc3VyZSB5b3Ugd2lzaCB0byBjb250aW51ZT8nKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGF3YWl0IGNsZWFyRGF0YSgpO1xuICAgIGF3YWl0IGxvYWRQcm9maWxlKCk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUNsb3NlKCkge1xuICAgIHdpbmRvdy5jbG9zZSgpO1xufVxuXG4vLyBCaW5kIGV2ZW50c1xuZnVuY3Rpb24gYmluZEV2ZW50cygpIHtcbiAgICAvLyBQcm9maWxlIG1hbmFnZW1lbnRcbiAgICBpZiAoZWxlbWVudHMucHJvZmlsZVNlbGVjdCkge1xuICAgICAgICBlbGVtZW50cy5wcm9maWxlU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZVByb2ZpbGVDaGFuZ2UpO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMubmV3QnVua2VyQnRuKSB7XG4gICAgICAgIGVsZW1lbnRzLm5ld0J1bmtlckJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZU5ld0J1bmtlclByb2ZpbGUpO1xuICAgIH1cbiAgICBcbiAgICAvLyBMb2NhbCBwcm9maWxlXG4gICAgaWYgKGVsZW1lbnRzLnByb2ZpbGVOYW1lSW5wdXQpIHtcbiAgICAgICAgZWxlbWVudHMucHJvZmlsZU5hbWVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGhhbmRsZVByb2ZpbGVOYW1lSW5wdXQpO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMucHJpdktleUlucHV0KSB7XG4gICAgICAgIGVsZW1lbnRzLnByaXZLZXlJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGhhbmRsZVByaXZLZXlJbnB1dCk7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy52aXNpYmlsaXR5VG9nZ2xlKSB7XG4gICAgICAgIGVsZW1lbnRzLnZpc2liaWxpdHlUb2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVUb2dnbGVWaXNpYmlsaXR5KTtcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLmNvcHlQdWJLZXlCdG4pIHtcbiAgICAgICAgZWxlbWVudHMuY29weVB1YktleUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNvcHlQdWJLZXkpO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMuc2F2ZVByb2ZpbGVCdG4pIHtcbiAgICAgICAgZWxlbWVudHMuc2F2ZVByb2ZpbGVCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVTYXZlUHJvZmlsZSk7XG4gICAgfVxuICAgIFxuICAgIC8vIG5jcnlwdHNlY1xuICAgIGlmIChlbGVtZW50cy5kZWNyeXB0QnRuKSB7XG4gICAgICAgIGVsZW1lbnRzLmRlY3J5cHRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVEZWNyeXB0TmNyeXB0c2VjKTtcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLnNob3dOc2VjUXJCdG4pIHtcbiAgICAgICAgZWxlbWVudHMuc2hvd05zZWNRckJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVNob3dOc2VjUXIpO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMuaGlkZU5zZWNRckJ0bikge1xuICAgICAgICBlbGVtZW50cy5oaWRlTnNlY1FyQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlSGlkZU5zZWNRcik7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5leHBvcnROY3J5cHRzZWNCdG4pIHtcbiAgICAgICAgZWxlbWVudHMuZXhwb3J0TmNyeXB0c2VjQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlRXhwb3J0TmNyeXB0c2VjKTtcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLmNvcHlOY3J5cHRzZWNCdG4pIHtcbiAgICAgICAgZWxlbWVudHMuY29weU5jcnlwdHNlY0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNvcHlOY3J5cHRzZWNFeHBvcnQpO1xuICAgIH1cbiAgICBcbiAgICAvLyBJbnB1dCBjaGFuZ2VzIGZvciBuY3J5cHRzZWMgZXhwb3J0XG4gICAgaWYgKGVsZW1lbnRzLm5jcnlwdHNlY0V4cG9ydFBhc3N3b3JkKSB7XG4gICAgICAgIGVsZW1lbnRzLm5jcnlwdHNlY0V4cG9ydFBhc3N3b3JkLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgICAgIHN0YXRlLm5jcnlwdHNlY0V4cG9ydFBhc3N3b3JkID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5uY3J5cHRzZWNFeHBvcnRDb25maXJtKSB7XG4gICAgICAgIGVsZW1lbnRzLm5jcnlwdHNlY0V4cG9ydENvbmZpcm0uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xuICAgICAgICAgICAgc3RhdGUubmNyeXB0c2VjRXhwb3J0Q29uZmlybSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBCdW5rZXIgcHJvZmlsZSBuYW1lXG4gICAgaWYgKGVsZW1lbnRzLmJ1bmtlclByb2ZpbGVOYW1lSW5wdXQpIHtcbiAgICAgICAgZWxlbWVudHMuYnVua2VyUHJvZmlsZU5hbWVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGhhbmRsZVByb2ZpbGVOYW1lSW5wdXQpO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMuc2F2ZUJ1bmtlck5hbWVCdG4pIHtcbiAgICAgICAgZWxlbWVudHMuc2F2ZUJ1bmtlck5hbWVCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVTYXZlUHJvZmlsZSk7XG4gICAgfVxuXG4gICAgLy8gQnVua2VyXG4gICAgaWYgKGVsZW1lbnRzLmJ1bmtlclVybElucHV0KSB7XG4gICAgICAgIGVsZW1lbnRzLmJ1bmtlclVybElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgICAgIHN0YXRlLmJ1bmtlclVybCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMuY29ubmVjdEJ1bmtlckJ0bikge1xuICAgICAgICBlbGVtZW50cy5jb25uZWN0QnVua2VyQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQ29ubmVjdEJ1bmtlcik7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5kaXNjb25uZWN0QnVua2VyQnRuKSB7XG4gICAgICAgIGVsZW1lbnRzLmRpc2Nvbm5lY3RCdW5rZXJCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVEaXNjb25uZWN0QnVua2VyKTtcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLnBpbmdCdW5rZXJCdG4pIHtcbiAgICAgICAgZWxlbWVudHMucGluZ0J1bmtlckJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVBpbmdCdW5rZXIpO1xuICAgIH1cbiAgICBcbiAgICAvLyBCdW5rZXIgcHViIGtleSBjb3B5XG4gICAgaWYgKGVsZW1lbnRzLmNvcHlCdW5rZXJQdWJLZXlCdG4pIHtcbiAgICAgICAgZWxlbWVudHMuY29weUJ1bmtlclB1YktleUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNvcHlQdWJLZXkpO1xuICAgIH1cblxuICAgIC8vIG5jcnlwdHNlYyBpbXBvcnQgcGFzc3dvcmRcbiAgICBpZiAoZWxlbWVudHMubmNyeXB0c2VjUGFzc3dvcmRJbnB1dCkge1xuICAgICAgICBlbGVtZW50cy5uY3J5cHRzZWNQYXNzd29yZElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgICAgIHN0YXRlLm5jcnlwdHNlY1Bhc3N3b3JkID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gUmVsYXlzXG4gICAgaWYgKGVsZW1lbnRzLm5ld1JlbGF5SW5wdXQpIHtcbiAgICAgICAgZWxlbWVudHMubmV3UmVsYXlJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgICAgICBzdGF0ZS5uZXdSZWxheSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICB9KTtcbiAgICAgICAgZWxlbWVudHMubmV3UmVsYXlJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVBZGRSZWxheSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLnJlY29tbWVuZGVkUmVsYXlTZWxlY3QpIHtcbiAgICAgICAgZWxlbWVudHMucmVjb21tZW5kZWRSZWxheVNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgICAgICAgc3RhdGUucmVjb21tZW5kZWRSZWxheSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgaGFuZGxlQWRkUmVsYXkoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5hZGRSZWxheUJ0bikge1xuICAgICAgICBlbGVtZW50cy5hZGRSZWxheUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUFkZFJlbGF5KTtcbiAgICB9XG4gICAgXG4gICAgLy8gUGVybWlzc2lvbnNcbiAgICBpZiAoZWxlbWVudHMuYXBwU2VsZWN0KSB7XG4gICAgICAgIGVsZW1lbnRzLmFwcFNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgICAgICAgc3RhdGUuaG9zdCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgY2FsY0hvc3RQZXJtcygpO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBTZWN1cml0eVxuICAgIGlmIChlbGVtZW50cy5uZXdQYXNzd29yZElucHV0KSB7XG4gICAgICAgIGVsZW1lbnRzLm5ld1Bhc3N3b3JkSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xuICAgICAgICAgICAgc3RhdGUubmV3UGFzc3dvcmQgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLmNvbmZpcm1QYXNzd29yZElucHV0KSB7XG4gICAgICAgIGVsZW1lbnRzLmNvbmZpcm1QYXNzd29yZElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgICAgIHN0YXRlLmNvbmZpcm1QYXNzd29yZCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMuc2V0UGFzc3dvcmRCdG4pIHtcbiAgICAgICAgZWxlbWVudHMuc2V0UGFzc3dvcmRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVTZXRQYXNzd29yZCk7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5jdXJyZW50UGFzc3dvcmRJbnB1dCkge1xuICAgICAgICBlbGVtZW50cy5jdXJyZW50UGFzc3dvcmRJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgICAgICBzdGF0ZS5jdXJyZW50UGFzc3dvcmQgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLm5ld1Bhc3N3b3JkQ2hhbmdlSW5wdXQpIHtcbiAgICAgICAgZWxlbWVudHMubmV3UGFzc3dvcmRDaGFuZ2VJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgICAgICBzdGF0ZS5uZXdQYXNzd29yZCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMuY29uZmlybVBhc3N3b3JkQ2hhbmdlSW5wdXQpIHtcbiAgICAgICAgZWxlbWVudHMuY29uZmlybVBhc3N3b3JkQ2hhbmdlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xuICAgICAgICAgICAgc3RhdGUuY29uZmlybVBhc3N3b3JkID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5jaGFuZ2VQYXNzd29yZEJ0bikge1xuICAgICAgICBlbGVtZW50cy5jaGFuZ2VQYXNzd29yZEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNoYW5nZVBhc3N3b3JkKTtcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLnJlbW92ZVBhc3N3b3JkSW5wdXQpIHtcbiAgICAgICAgZWxlbWVudHMucmVtb3ZlUGFzc3dvcmRJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgICAgICBzdGF0ZS5yZW1vdmVQYXNzd29yZElucHV0ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5yZW1vdmVQYXNzd29yZEJ0bikge1xuICAgICAgICBlbGVtZW50cy5yZW1vdmVQYXNzd29yZEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVJlbW92ZVBhc3N3b3JkKTtcbiAgICB9XG4gICAgXG4gICAgLy8gUHJvdG9jb2wgaGFuZGxlclxuICAgIGlmIChlbGVtZW50cy5wcm90b2NvbEhhbmRsZXJJbnB1dCkge1xuICAgICAgICBlbGVtZW50cy5wcm90b2NvbEhhbmRsZXJJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgICAgICBzdGF0ZS5wcm90b2NvbEhhbmRsZXIgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGVsZW1lbnRzLnByb3RvY29sSGFuZGxlcklucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZVNhdmVQcm90b2NvbEhhbmRsZXIpO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMudXNlTmp1bXBCdG4pIHtcbiAgICAgICAgZWxlbWVudHMudXNlTmp1bXBCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICBzdGF0ZS5wcm90b2NvbEhhbmRsZXIgPSAnaHR0cHM6Ly9uanVtcC5tZS97cmF3fSc7XG4gICAgICAgICAgICBoYW5kbGVTYXZlUHJvdG9jb2xIYW5kbGVyKCk7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5kaXNhYmxlSGFuZGxlckJ0bikge1xuICAgICAgICBlbGVtZW50cy5kaXNhYmxlSGFuZGxlckJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIHN0YXRlLnByb3RvY29sSGFuZGxlciA9ICcnO1xuICAgICAgICAgICAgaGFuZGxlU2F2ZVByb3RvY29sSGFuZGxlcigpO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBHZW5lcmFsXG4gICAgaWYgKGVsZW1lbnRzLmNsb3NlQnRuKSB7XG4gICAgICAgIGVsZW1lbnRzLmNsb3NlQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQ2xvc2UpO1xuICAgIH1cbiAgICBjb25zdCBjbG9zZU9wdGlvbnNCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1hY3Rpb249XCJjbG9zZU9wdGlvbnNcIl0nKTtcbiAgICBpZiAoY2xvc2VPcHRpb25zQnRuKSB7XG4gICAgICAgIGNsb3NlT3B0aW9uc0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNsb3NlKTtcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLmNsZWFyRGF0YUJ0bikge1xuICAgICAgICBlbGVtZW50cy5jbGVhckRhdGFCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVDbGVhckRhdGEpO1xuICAgIH1cblxuICAgIC8vIFByZXZlbnQgZGVmYXVsdCBmb3JtIHN1Ym1pc3Npb25cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdmb3JtJykuZm9yRWFjaChmb3JtID0+IHtcbiAgICAgICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgICB9KTtcblxuICAgIC8vIFByZXZlbnQgZGVmYXVsdCBvbiBhbmNob3IgY2xpY2sgYWN0aW9uc1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2FbZGF0YS1hY3Rpb25dJykuZm9yRWFjaChhID0+IHtcbiAgICAgICAgYS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xuICAgIH0pO1xufVxuXG4vLyBJbml0aWFsaXplXG5hc3luYyBmdW5jdGlvbiBpbml0KCkge1xuICAgIGNvbnNvbGUubG9nKCdOb3N0cktleSBGdWxsIFNldHRpbmdzIGluaXRpYWxpemluZy4uLicpO1xuICAgIFxuICAgIGF3YWl0IGluaXRpYWxpemUoKTtcbiAgICBcbiAgICAvLyBDaGVjayBlbmNyeXB0aW9uIHN0YXRlXG4gICAgc3RhdGUuaGFzUGFzc3dvcmQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdpc0VuY3J5cHRlZCcgfSk7XG4gICAgXG4gICAgLy8gTG9hZCBwcm90b2NvbCBoYW5kbGVyXG4gICAgY29uc3QgeyBwcm90b2NvbF9oYW5kbGVyIH0gPSBhd2FpdCBhcGkuc3RvcmFnZS5sb2NhbC5nZXQoWydwcm90b2NvbF9oYW5kbGVyJ10pO1xuICAgIHN0YXRlLnByb3RvY29sSGFuZGxlciA9IHByb3RvY29sX2hhbmRsZXIgfHwgJyc7XG4gICAgXG4gICAgaW5pdEVsZW1lbnRzKCk7XG4gICAgYmluZEV2ZW50cygpO1xuICAgIFxuICAgIGF3YWl0IGxvYWRQcm9maWxlKCk7XG59XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbml0KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBSUEsYUFBTyxVQUFVLFdBQVk7QUFDM0IsZUFBTyxPQUFPLFlBQVksY0FBYyxRQUFRLGFBQWEsUUFBUSxVQUFVO0FBQUEsTUFDakY7QUFBQTtBQUFBOzs7QUNOQTtBQUFBO0FBQUEsVUFBSTtBQUNKLFVBQU0sa0JBQWtCO0FBQUEsUUFDdEI7QUFBQTtBQUFBLFFBQ0E7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUMxQztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQzdDO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxRQUFNO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxRQUFNO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxRQUFNO0FBQUEsUUFDdEQ7QUFBQSxRQUFNO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxRQUFNO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxRQUFNO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxNQUN4RDtBQVFBLGNBQVEsZ0JBQWdCLFNBQVMsY0FBZSxTQUFTO0FBQ3ZELFlBQUksQ0FBQyxRQUFTLE9BQU0sSUFBSSxNQUFNLHVDQUF1QztBQUNyRSxZQUFJLFVBQVUsS0FBSyxVQUFVLEdBQUksT0FBTSxJQUFJLE1BQU0sMkNBQTJDO0FBQzVGLGVBQU8sVUFBVSxJQUFJO0FBQUEsTUFDdkI7QUFRQSxjQUFRLDBCQUEwQixTQUFTLHdCQUF5QixTQUFTO0FB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QUFBLFFBQ1Q7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUNUO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFDVDtBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQ1Q7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUNUO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFDVDtBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQ1Q7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUNUO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFJO0FBQUEsUUFDVjtBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBSTtBQUFBLFFBQ1Y7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUk7QUFBQSxRQUNWO0FBQUEsUUFBRztBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWDtBQUFBLFFBQUc7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1g7QUFBQSxRQUFHO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNYO0FBQUEsUUFBRztBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWDtBQUFBLFFBQUc7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1g7QUFBQSxRQUFHO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNYO0FBQUEsUUFBRztBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWDtBQUFBLFFBQUc7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1g7QUFBQSxRQUFHO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNYO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLE1BQ2Q7QUFFQSxVQUFNLHFCQUFxQjtBQUFBO0FBQUEsUUFFekI7QUFBQSxRQUFHO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNYO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUs7QUFBQSxRQUNiO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFLO0FBQUEsUUFDYjtBQUFBLFFBQUk7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQ2Q7QUFBQSxRQUFJO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUNkO0FBQUEsUUFBSTtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDZDtBQUFBLFFBQUk7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQ2Q7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUNmO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDZjtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQ2Y7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUNmO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDZjtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQ2Y7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUNmO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDZjtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQ2Y7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUNmO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDZjtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQ2Y7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUNmO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDZjtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBTTtBQUFBLFFBQ2hCO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFNO0FBQUEsUUFDaEI7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQU07QUFBQSxRQUNoQjtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBTTtBQUFBLFFBQ2hCO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFNO0FBQUEsUUFDaEI7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQU07QUFBQSxRQUNoQjtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBTTtBQUFBLFFBQ2hCO0FBQUEsUUFBSztBQUFBLFFBQU07QUFBQSxRQUFNO0FBQUEsUUFDakI7QUFBQSxRQUFLO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxRQUNqQjtBQUFBLFFBQUs7QUFBQSxRQUFNO0FBQUEsUUFBTTtBQUFBLFFBQ2pCO0FBQUEsUUFBSztBQUFBLFFBQU07QUFBQSxRQUFNO0FBQUEsUUFDakI7QUFBQSxRQUFLO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxRQUNqQjtBQUFBLFFBQUs7QUFBQSxRQUFNO0FBQUEsUUFBTTtBQUFBLFFBQ2pCO0FBQUEsUUFBSztBQUFBLFFBQU07QUFBQSxRQUFNO0FBQUEsTUFDbkI7QUFVQSxjQUFRLGlCQUFpQixTQUFTLGVBQWdCLFNBQVMsc0JBQXNCO0FBQy9FLGdCQUFRLHNCQUFzQjtBQUFBLFVBQzVCLEtBQUssUUFBUTtBQUNYLG1CQUFPLGlCQUFpQixVQUFVLEtBQUssSUFBSSxDQUFDO0FBQUEsVUFDOUMsS0FBSyxRQUFRO0FBQ1gsbUJBQU8saUJBQWlCLFVBQVUsS0FBSyxJQUFJLENBQUM7QUFBQSxVQUM5QyxLQUFLLFFBQVE7QUFDWCxtQkFBTyxpQkFBaUIsVUFBVSxLQUFLLElBQUksQ0FBQztBQUFBLFVBQzlDLEtBQUssUUFBUTtBQUNYLG1CQUFPLGlCQUFpQixVQUFVLEtBQUssSUFBSSxDQUFDO0FBQUEsVUFDOUM7QUFDRSxtQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNGO0FBVUEsY0FBUSx5QkFBeUIsU0FBUyx1QkFBd0IsU0FBUyxzQkFBc0I7QUFDL0YsZ0JBQVEsc0JBQXNCO0FBQUEsVUFDNUIsS0FBSyxRQUFRO0FBQ1gsbUJBQU8sb0JBQW9CLFVBQVUsS0FBSyxJQUFJLENBQUM7QUFBQSxVQUNqRCxLQUFLLFFBQVE7QUFDWCxtQkFBTyxvQkFBb0IsVUFBVSxLQUFLLElBQUksQ0FBQztBQUFBLFVBQ2pELEtBQUssUUFBUTtBQUNYLG1CQUFPLG9CQUFvQixVQUFVLEtBQUssSUFBSSxDQUFDO0FBQUEsVUFDakQsS0FBSyxRQUFRO0FBQ1gsbUJBQU8sb0JBQW9CLFVBQVUsS0FBSyxJQUFJLENBQUM7QUFBQSxVQUNqRDtBQUNFLG1CQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0Y7QUFBQTtBQUFBOzs7QUN0SUE7QUFBQTtBQUFBLFVBQU0sWUFBWSxJQUFJLFdBQVcsR0FBRztBQUNwQyxVQUFNLFlBQVksSUFBSSxXQUFXLEdBQUc7QUFTbkMsT0FBQyxTQUFTLGFBQWM7QUFDdkIsWUFBSSxJQUFJO0FBQ1IsaUJBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxLQUFLO0FBQzVCLG9CQUFVLENBQUMsSUFBSTtBQUNmLG9CQUFVLENBQUMsSUFBSTtBQUVmLGdCQUFNO0FBSU4sY0FBSSxJQUFJLEtBQU87QUFDYixpQkFBSztBQUFBLFVBQ1A7QUFBQSxRQUNGO0FBTUEsaUJBQVMsSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLO0FBQzlCLG9CQUFVLENBQUMsSUFBSSxVQUFVLElBQUksR0FBRztBQUFBLFFBQ2xDO0FBQUEsTUFDRixHQUFFO0FBUUYsY0FBUSxNQUFNLFNBQVMsSUFBSyxHQUFHO0FBQzdCLFlBQUksSUFBSSxFQUFHLE9BQU0sSUFBSSxNQUFNLFNBQVMsSUFBSSxHQUFHO0FBQzNDLGVBQU8sVUFBVSxDQUFDO0FBQUEsTUFDcEI7QUFRQSxjQUFRLE1BQU0sU0FBUyxJQUFLLEdBQUc7QUFDN0IsZUFBTyxVQUFVLENBQUM7QUFBQSxNQUNwQjtBQVNBLGNBQVEsTUFBTSxTQUFTLElBQUssR0FBRyxHQUFHO0FBQ2hDLFlBQUksTUFBTSxLQUFLLE1BQU0sRUFBRyxRQUFPO0FBSS9CLGVBQU8sVUFBVSxVQUFVLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQztBQUFBLE1BQzlDO0FBQUE7QUFBQTs7O0FDcEVBO0FBQUE7QUFBQSxVQUFNLEtBQUs7QUFTWCxjQUFRLE1BQU0sU0FBUyxJQUFLLElBQUksSUFBSTtBQUNsQyxjQUFNLFFBQVEsSUFBSSxXQUFXLEdBQUcsU0FBUyxHQUFHLFNBQVMsQ0FBQztBQUV0RCxpQkFBUyxJQUFJLEdBQUcsSUFBSSxHQUFHLFFBQVEsS0FBSztBQUNsQyxtQkFBUyxJQUFJLEdBQUcsSUFBSSxHQUFHLFFBQVEsS0FBSztBQUNsQyxrQkFBTSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFBQSxVQUNyQztBQUFBLFFBQ0Y7QUFFQSxlQUFPO0FBQUEsTUFDVDtBQVNBLGNBQVEsTUFBTSxTQUFTLElBQUssVUFBVSxTQUFTO0FBQzdDLFlBQUksU0FBUyxJQUFJLFdBQVcsUUFBUTtBQUVwQyxlQUFRLE9BQU8sU0FBUyxRQUFRLFVBQVcsR0FBRztBQUM1QyxnQkFBTSxRQUFRLE9BQU8sQ0FBQztBQUV0QixtQkFBUyxJQUFJLEdBQUcsSUFBSSxRQUFRLFFBQVEsS0FBSztBQUN2QyxtQkFBTyxDQUFDLEtBQUssR0FBRyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEtBQUs7QUFBQSxVQUN2QztBQUdBLGNBQUksU0FBUztBQUNiLGlCQUFPLFNBQVMsT0FBTyxVQUFVLE9BQU8sTUFBTSxNQUFNLEVBQUc7QUFDdkQsbUJBQVMsT0FBTyxNQUFNLE1BQU07QUFBQSxRQUM5QjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBU0EsY0FBUSx1QkFBdUIsU0FBUyxxQkFBc0IsUUFBUTtBQUNwRSxZQUFJLE9BQU8sSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBQzdCLGlCQUFTLElBQUksR0FBRyxJQUFJLFFBQVEsS0FBSztBQUMvQixpQkFBTyxRQUFRLElBQUksTUFBTSxJQUFJLFdBQVcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQUEsUUFDekQ7QUFFQSxlQUFPO0FBQUEsTUFDVDtBQUFBO0FBQUE7OztBQzdEQTtBQUFBO0FBQUEsVUFBTSxhQUFhO0FBRW5CLGVBQVMsbUJBQW9CLFFBQVE7QUFDbkMsYUFBSyxVQUFVO0FBQ2YsYUFBSyxTQUFTO0FBRWQsWUFBSSxLQUFLLE9BQVEsTUFBSyxXQUFXLEtBQUssTUFBTTtBQUFBLE1BQzlDO0FBUUEseUJBQW1CLFVBQVUsYUFBYSxTQUFTQyxZQUFZLFFBQVE7QUFFckUsYUFBSyxTQUFTO0FBQ2QsYUFBSyxVQUFVLFdBQVcscUJBQXFCLEtBQUssTUFBTTtBQUFBLE1BQzVEO0FBUUEseUJBQW1CLFVBQVUsU0FBUyxTQUFTLE9BQVEsTUFBTTtBQUMzRCxZQUFJLENBQUMsS0FBSyxTQUFTO0FBQ2pCLGdCQUFNLElBQUksTUFBTSx5QkFBeUI7QUFBQSxRQUMzQztBQUlBLGNBQU0sYUFBYSxJQUFJLFdBQVcsS0FBSyxTQUFTLEtBQUssTUFBTTtBQUMzRCxtQkFBVyxJQUFJLElBQUk7QUFJbkIsY0FBTSxZQUFZLFdBQVcsSUFBSSxZQUFZLEtBQUssT0FBTztBQUt6RCxjQUFNLFFBQVEsS0FBSyxTQUFTLFVBQVU7QUFDdEMsWUFBSSxRQUFRLEdBQUc7QUFDYixnQkFBTSxPQUFPLElBQUksV0FBVyxLQUFLLE1BQU07QUFDdkMsZUFBSyxJQUFJLFdBQVcsS0FBSztBQUV6QixpQkFBTztBQUFBLFFBQ1Q7QUFFQSxlQUFPO0FBQUEsTUFDVDtBQUVBLGFBQU8sVUFBVTtBQUFBO0FBQUE7OztBQ3ZEakI7QUFBQTtBQU1BLGNBQVEsVUFBVSxTQUFTLFFBQVMsU0FBUztBQUMzQyxlQUFPLENBQUMsTUFBTSxPQUFPLEtBQUssV0FBVyxLQUFLLFdBQVc7QUFBQSxNQUN2RDtBQUFBO0FBQUE7OztBQ1JBO0FBQUE7QUFBQSxVQUFNLFVBQVU7QUFDaEIsVUFBTSxlQUFlO0FBQ3JCLFVBQUksUUFBUTtBQUlaLGNBQVEsTUFBTSxRQUFRLE1BQU0sS0FBSztBQUVqQyxVQUFNLE9BQU8sK0JBQStCLFFBQVE7QUFFcEQsY0FBUSxRQUFRLElBQUksT0FBTyxPQUFPLEdBQUc7QUFDckMsY0FBUSxhQUFhLElBQUksT0FBTyx5QkFBeUIsR0FBRztBQUM1RCxjQUFRLE9BQU8sSUFBSSxPQUFPLE1BQU0sR0FBRztBQUNuQyxjQUFRLFVBQVUsSUFBSSxPQUFPLFNBQVMsR0FBRztBQUN6QyxjQUFRLGVBQWUsSUFBSSxPQUFPLGNBQWMsR0FBRztBQUVuRCxVQUFNLGFBQWEsSUFBSSxPQUFPLE1BQU0sUUFBUSxHQUFHO0FBQy9DLFVBQU0sZUFBZSxJQUFJLE9BQU8sTUFBTSxVQUFVLEdBQUc7QUFDbkQsVUFBTSxvQkFBb0IsSUFBSSxPQUFPLHdCQUF3QjtBQUU3RCxjQUFRLFlBQVksU0FBUyxVQUFXLEtBQUs7QUFDM0MsZUFBTyxXQUFXLEtBQUssR0FBRztBQUFBLE1BQzVCO0FBRUEsY0FBUSxjQUFjLFNBQVMsWUFBYSxLQUFLO0FBQy9DLGVBQU8sYUFBYSxLQUFLLEdBQUc7QUFBQSxNQUM5QjtBQUVBLGNBQVEsbUJBQW1CLFNBQVMsaUJBQWtCLEtBQUs7QUFDekQsZUFBTyxrQkFBa0IsS0FBSyxHQUFHO0FBQUEsTUFDbkM7QUFBQTtBQUFBOzs7QUM5QkE7QUFBQTtBQUFBLFVBQU0sZUFBZTtBQUNyQixVQUFNLFFBQVE7QUFTZCxjQUFRLFVBQVU7QUFBQSxRQUNoQixJQUFJO0FBQUEsUUFDSixLQUFLLEtBQUs7QUFBQSxRQUNWLFFBQVEsQ0FBQyxJQUFJLElBQUksRUFBRTtBQUFBLE1BQ3JCO0FBV0EsY0FBUSxlQUFlO0FBQUEsUUFDckIsSUFBSTtBQUFBLFFBQ0osS0FBSyxLQUFLO0FBQUEsUUFDVixRQUFRLENBQUMsR0FBRyxJQUFJLEVBQUU7QUFBQSxNQUNwQjtBQU9BLGNBQVEsT0FBTztBQUFBLFFBQ2IsSUFBSTtBQUFBLFFBQ0osS0FBSyxLQUFLO0FBQUEsUUFDVixRQUFRLENBQUMsR0FBRyxJQUFJLEVBQUU7QUFBQSxNQUNwQjtBQVdBLGNBQVEsUUFBUTtBQUFBLFFBQ2QsSUFBSTtBQUFBLFFBQ0osS0FBSyxLQUFLO0FBQUEsUUFDVixRQUFRLENBQUMsR0FBRyxJQUFJLEVBQUU7QUFBQSxNQUNwQjtBQVFBLGNBQVEsUUFBUTtBQUFBLFFBQ2QsS0FBSztBQUFBLE1BQ1A7QUFVQSxjQUFRLHdCQUF3QixTQUFTLHNCQUF1QixNQUFNLFNBQVM7QUFDN0UsWUFBSSxDQUFDLEtBQUssT0FBUSxPQUFNLElBQUksTUFBTSxtQkFBbUIsSUFBSTtBQUV6RCxZQUFJLENBQUMsYUFBYSxRQUFRLE9BQU8sR0FBRztBQUNsQyxnQkFBTSxJQUFJLE1BQU0sc0JBQXNCLE9BQU87QUFBQSxRQUMvQztBQUVBLFlBQUksV0FBVyxLQUFLLFVBQVUsR0FBSSxRQUFPLEtBQUssT0FBTyxDQUFDO0FBQUEsaUJBQzdDLFVBQVUsR0FBSSxRQUFPLEtBQUssT0FBTyxDQUFDO0FBQzNDLGVBQU8sS0FBSyxPQUFPLENBQUM7QUFBQSxNQUN0QjtBQVFBLGNBQVEscUJBQXFCLFNBQVMsbUJBQW9CLFNBQVM7QUFDakUsWUFBSSxNQUFNLFlBQVksT0FBTyxFQUFHLFFBQU8sUUFBUTtBQUFBLGlCQUN0QyxNQUFNLGlCQUFpQixPQUFPLEVBQUcsUUFBTyxRQUFRO0FBQUEsaUJBQ2hELE1BQU0sVUFBVSxPQUFPLEVBQUcsUUFBTyxRQUFRO0FBQUEsWUFDN0MsUUFBTyxRQUFRO0FBQUEsTUFDdEI7QUFRQSxjQUFRLFdBQVcsU0FBUyxTQUFVLE1BQU07QUFDMUMsWUFBSSxRQUFRLEtBQUssR0FBSSxRQUFPLEtBQUs7QUFDakMsY0FBTSxJQUFJLE1BQU0sY0FBYztBQUFBLE1BQ2hDO0FBUUEsY0FBUSxVQUFVLFNBQVMsUUFBUyxNQUFNO0FBQ3hDLGVBQU8sUUFBUSxLQUFLLE9BQU8sS0FBSztBQUFBLE1BQ2xDO0FBUUEsZUFBUyxXQUFZLFFBQVE7QUFDM0IsWUFBSSxPQUFPLFdBQVcsVUFBVTtBQUM5QixnQkFBTSxJQUFJLE1BQU0sdUJBQXVCO0FBQUEsUUFDekM7QUFFQSxjQUFNLFFBQVEsT0FBTyxZQUFZO0FBRWpDLGdCQUFRLE9BQU87QUFBQSxVQUNiLEtBQUs7QUFDSCxtQkFBTyxRQUFRO0FBQUEsVUFDakIsS0FBSztBQUNILG1CQUFPLFFBQVE7QUFBQSxVQUNqQixLQUFLO0FBQ0gsbUJBQU8sUUFBUTtBQUFBLFVBQ2pCLEtBQUs7QUFDSCxtQkFBTyxRQUFRO0FBQUEsVUFDakI7QUFDRSxrQkFBTSxJQUFJLE1BQU0sbUJBQW1CLE1BQU07QUFBQSxRQUM3QztBQUFBLE1BQ0Y7QUFVQSxjQUFRLE9BQU8sU0FBUyxLQUFNLE9BQU8sY0FBYztBQUNqRCxZQUFJLFFBQVEsUUFBUSxLQUFLLEdBQUc7QUFDMUIsaUJBQU87QUFBQSxRQUNUO0FBRUEsWUFBSTtBQUNGLGlCQUFPLFdBQVcsS0FBSztBQUFBLFFBQ3pCLFNBQVMsR0FBRztBQUNWLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQTtBQUFBOzs7QUN0S0E7QUFBQTtBQUFBLFVBQU0sUUFBUTtBQUNkLFVBQU0sU0FBUztBQUNmLFVBQU0sVUFBVTtBQUNoQixVQUFNLE9BQU87QUFDYixVQUFNLGVBQWU7QUFHckIsVUFBTSxNQUFPLEtBQUssS0FBTyxLQUFLLEtBQU8sS0FBSyxLQUFPLEtBQUssSUFBTSxLQUFLLElBQU0sS0FBSyxJQUFNLEtBQUssSUFBTSxLQUFLO0FBQ2xHLFVBQU0sVUFBVSxNQUFNLFlBQVksR0FBRztBQUVyQyxlQUFTLDRCQUE2QixNQUFNLFFBQVEsc0JBQXNCO0FBQ3hFLGlCQUFTLGlCQUFpQixHQUFHLGtCQUFrQixJQUFJLGtCQUFrQjtBQUNuRSxjQUFJLFVBQVUsUUFBUSxZQUFZLGdCQUFnQixzQkFBc0IsSUFBSSxHQUFHO0FBQzdFLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFFQSxlQUFPO0FBQUEsTUFDVDtBQUVBLGVBQVMscUJBQXNCLE1BQU0sU0FBUztBQUU1QyxlQUFPLEtBQUssc0JBQXNCLE1BQU0sT0FBTyxJQUFJO0FBQUEsTUFDckQ7QUFFQSxlQUFTLDBCQUEyQixVQUFVLFNBQVM7QUFDckQsWUFBSSxZQUFZO0FBRWhCLGlCQUFTLFFBQVEsU0FBVSxNQUFNO0FBQy9CLGdCQUFNLGVBQWUscUJBQXFCLEtBQUssTUFBTSxPQUFPO0FBQzVELHVCQUFhLGVBQWUsS0FBSyxjQUFjO0FBQUEsUUFDakQsQ0FBQztBQUVELGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUywyQkFBNEIsVUFBVSxzQkFBc0I7QUFDbkUsaUJBQVMsaUJBQWlCLEdBQUcsa0JBQWtCLElBQUksa0JBQWtCO0FBQ25FLGdCQUFNLFNBQVMsMEJBQTBCLFVBQVUsY0FBYztBQUNqRSxjQUFJLFVBQVUsUUFBUSxZQUFZLGdCQUFnQixzQkFBc0IsS0FBSyxLQUFLLEdBQUc7QUFDbkYsbUJBQU87QUFBQSxVQUNUO0FBQUEsUUFDRjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBVUEsY0FBUSxPQUFPLFNBQVMsS0FBTSxPQUFPLGNBQWM7QUFDakQsWUFBSSxhQUFhLFFBQVEsS0FBSyxHQUFHO0FBQy9CLGlCQUFPLFNBQVMsT0FBTyxFQUFFO0FBQUEsUUFDM0I7QUFFQSxlQUFPO0FBQUEsTUFDVDtBQVdBLGNBQVEsY0FBYyxTQUFTLFlBQWEsU0FBUyxzQkFBc0IsTUFBTTtBQUMvRSxZQUFJLENBQUMsYUFBYSxRQUFRLE9BQU8sR0FBRztBQUNsQyxnQkFBTSxJQUFJLE1BQU0seUJBQXlCO0FBQUEsUUFDM0M7QUFHQSxZQUFJLE9BQU8sU0FBUyxZQUFhLFFBQU8sS0FBSztBQUc3QyxjQUFNLGlCQUFpQixNQUFNLHdCQUF3QixPQUFPO0FBRzVELGNBQU0sbUJBQW1CLE9BQU8sdUJBQXVCLFNBQVMsb0JBQW9CO0FBR3BGLGNBQU0sMEJBQTBCLGlCQUFpQixvQkFBb0I7QUFFckUsWUFBSSxTQUFTLEtBQUssTUFBTyxRQUFPO0FBRWhDLGNBQU0sYUFBYSx5QkFBeUIscUJBQXFCLE1BQU0sT0FBTztBQUc5RSxnQkFBUSxNQUFNO0FBQUEsVUFDWixLQUFLLEtBQUs7QUFDUixtQkFBTyxLQUFLLE1BQU8sYUFBYSxLQUFNLENBQUM7QUFBQSxVQUV6QyxLQUFLLEtBQUs7QUFDUixtQkFBTyxLQUFLLE1BQU8sYUFBYSxLQUFNLENBQUM7QUFBQSxVQUV6QyxLQUFLLEtBQUs7QUFDUixtQkFBTyxLQUFLLE1BQU0sYUFBYSxFQUFFO0FBQUEsVUFFbkMsS0FBSyxLQUFLO0FBQUEsVUFDVjtBQUNFLG1CQUFPLEtBQUssTUFBTSxhQUFhLENBQUM7QUFBQSxRQUNwQztBQUFBLE1BQ0Y7QUFVQSxjQUFRLHdCQUF3QixTQUFTLHNCQUF1QixNQUFNLHNCQUFzQjtBQUMxRixZQUFJO0FBRUosY0FBTSxNQUFNLFFBQVEsS0FBSyxzQkFBc0IsUUFBUSxDQUFDO0FBRXhELFlBQUksTUFBTSxRQUFRLElBQUksR0FBRztBQUN2QixjQUFJLEtBQUssU0FBUyxHQUFHO0FBQ25CLG1CQUFPLDJCQUEyQixNQUFNLEdBQUc7QUFBQSxVQUM3QztBQUVBLGNBQUksS0FBSyxXQUFXLEdBQUc7QUFDckIsbUJBQU87QUFBQSxVQUNUO0FBRUEsZ0JBQU0sS0FBSyxDQUFDO0FBQUEsUUFDZCxPQUFPO0FBQ0wsZ0JBQU07QUFBQSxRQUNSO0FBRUEsZUFBTyw0QkFBNEIsSUFBSSxNQUFNLElBQUksVUFBVSxHQUFHLEdBQUc7QUFBQSxNQUNuRTtBQVlBLGNBQVEsaUJBQWlCLFNBQVMsZUFBZ0IsU0FBUztBQUN6RCxZQUFJLENBQUMsYUFBYSxRQUFRLE9BQU8sS0FBSyxVQUFVLEdBQUc7QUFDakQsZ0JBQU0sSUFBSSxNQUFNLHlCQUF5QjtBQUFBLFFBQzNDO0FBRUEsWUFBSSxJQUFJLFdBQVc7QUFFbkIsZUFBTyxNQUFNLFlBQVksQ0FBQyxJQUFJLFdBQVcsR0FBRztBQUMxQyxlQUFNLE9BQVEsTUFBTSxZQUFZLENBQUMsSUFBSTtBQUFBLFFBQ3ZDO0FBRUEsZUFBUSxXQUFXLEtBQU07QUFBQSxNQUMzQjtBQUFBO0FBQUE7OztBQ2xLQTtBQUFBO0FBQUEsVUFBTSxRQUFRO0FBRWQsVUFBTSxNQUFPLEtBQUssS0FBTyxLQUFLLElBQU0sS0FBSyxJQUFNLEtBQUssSUFBTSxLQUFLLElBQU0sS0FBSyxJQUFNLEtBQUs7QUFDckYsVUFBTSxXQUFZLEtBQUssS0FBTyxLQUFLLEtBQU8sS0FBSyxLQUFPLEtBQUssSUFBTSxLQUFLO0FBQ3RFLFVBQU0sVUFBVSxNQUFNLFlBQVksR0FBRztBQVlyQyxjQUFRLGlCQUFpQixTQUFTLGVBQWdCLHNCQUFzQixNQUFNO0FBQzVFLGNBQU0sT0FBUyxxQkFBcUIsT0FBTyxJQUFLO0FBQ2hELFlBQUksSUFBSSxRQUFRO0FBRWhCLGVBQU8sTUFBTSxZQUFZLENBQUMsSUFBSSxXQUFXLEdBQUc7QUFDMUMsZUFBTSxPQUFRLE1BQU0sWUFBWSxDQUFDLElBQUk7QUFBQSxRQUN2QztBQUtBLGdCQUFTLFFBQVEsS0FBTSxLQUFLO0FBQUEsTUFDOUI7QUFBQTtBQUFBOzs7QUM1QkE7QUFBQTtBQUFBLFVBQU0sT0FBTztBQUViLGVBQVMsWUFBYSxNQUFNO0FBQzFCLGFBQUssT0FBTyxLQUFLO0FBQ2pCLGFBQUssT0FBTyxLQUFLLFNBQVM7QUFBQSxNQUM1QjtBQUVBLGtCQUFZLGdCQUFnQixTQUFTLGNBQWUsUUFBUTtBQUMxRCxlQUFPLEtBQUssS0FBSyxNQUFNLFNBQVMsQ0FBQyxLQUFNLFNBQVMsSUFBTyxTQUFTLElBQUssSUFBSSxJQUFLO0FBQUEsTUFDaEY7QUFFQSxrQkFBWSxVQUFVLFlBQVksU0FBUyxZQUFhO0FBQ3RELGVBQU8sS0FBSyxLQUFLO0FBQUEsTUFDbkI7QUFFQSxrQkFBWSxVQUFVLGdCQUFnQixTQUFTLGdCQUFpQjtBQUM5RCxlQUFPLFlBQVksY0FBYyxLQUFLLEtBQUssTUFBTTtBQUFBLE1BQ25EO0FBRUEsa0JBQVksVUFBVSxRQUFRLFNBQVMsTUFBTyxXQUFXO0FBQ3ZELFlBQUksR0FBRyxPQUFPO0FBSWQsYUFBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLEtBQUssS0FBSyxRQUFRLEtBQUssR0FBRztBQUM3QyxrQkFBUSxLQUFLLEtBQUssT0FBTyxHQUFHLENBQUM7QUFDN0Isa0JBQVEsU0FBUyxPQUFPLEVBQUU7QUFFMUIsb0JBQVUsSUFBSSxPQUFPLEVBQUU7QUFBQSxRQUN6QjtBQUlBLGNBQU0sZUFBZSxLQUFLLEtBQUssU0FBUztBQUN4QyxZQUFJLGVBQWUsR0FBRztBQUNwQixrQkFBUSxLQUFLLEtBQUssT0FBTyxDQUFDO0FBQzFCLGtCQUFRLFNBQVMsT0FBTyxFQUFFO0FBRTFCLG9CQUFVLElBQUksT0FBTyxlQUFlLElBQUksQ0FBQztBQUFBLFFBQzNDO0FBQUEsTUFDRjtBQUVBLGFBQU8sVUFBVTtBQUFBO0FBQUE7OztBQzFDakI7QUFBQTtBQUFBLFVBQU0sT0FBTztBQVdiLFVBQU0sa0JBQWtCO0FBQUEsUUFDdEI7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUM3QztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQzVEO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDNUQ7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLE1BQzFDO0FBRUEsZUFBUyxpQkFBa0IsTUFBTTtBQUMvQixhQUFLLE9BQU8sS0FBSztBQUNqQixhQUFLLE9BQU87QUFBQSxNQUNkO0FBRUEsdUJBQWlCLGdCQUFnQixTQUFTLGNBQWUsUUFBUTtBQUMvRCxlQUFPLEtBQUssS0FBSyxNQUFNLFNBQVMsQ0FBQyxJQUFJLEtBQUssU0FBUztBQUFBLE1BQ3JEO0FBRUEsdUJBQWlCLFVBQVUsWUFBWSxTQUFTLFlBQWE7QUFDM0QsZUFBTyxLQUFLLEtBQUs7QUFBQSxNQUNuQjtBQUVBLHVCQUFpQixVQUFVLGdCQUFnQixTQUFTLGdCQUFpQjtBQUNuRSxlQUFPLGlCQUFpQixjQUFjLEtBQUssS0FBSyxNQUFNO0FBQUEsTUFDeEQ7QUFFQSx1QkFBaUIsVUFBVSxRQUFRLFNBQVMsTUFBTyxXQUFXO0FBQzVELFlBQUk7QUFJSixhQUFLLElBQUksR0FBRyxJQUFJLEtBQUssS0FBSyxLQUFLLFFBQVEsS0FBSyxHQUFHO0FBRTdDLGNBQUksUUFBUSxnQkFBZ0IsUUFBUSxLQUFLLEtBQUssQ0FBQyxDQUFDLElBQUk7QUFHcEQsbUJBQVMsZ0JBQWdCLFFBQVEsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDO0FBR2pELG9CQUFVLElBQUksT0FBTyxFQUFFO0FBQUEsUUFDekI7QUFJQSxZQUFJLEtBQUssS0FBSyxTQUFTLEdBQUc7QUFDeEIsb0JBQVUsSUFBSSxnQkFBZ0IsUUFBUSxLQUFLLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUFBLFFBQ3hEO0FBQUEsTUFDRjtBQUVBLGFBQU8sVUFBVTtBQUFBO0FBQUE7OztBQzFEakI7QUFBQTtBQUFBLFVBQU0sT0FBTztBQUViLGVBQVMsU0FBVSxNQUFNO0FBQ3ZCLGFBQUssT0FBTyxLQUFLO0FBQ2pCLFlBQUksT0FBUSxTQUFVLFVBQVU7QUFDOUIsZUFBSyxPQUFPLElBQUksWUFBWSxFQUFFLE9BQU8sSUFBSTtBQUFBLFFBQzNDLE9BQU87QUFDTCxlQUFLLE9BQU8sSUFBSSxXQUFXLElBQUk7QUFBQSxRQUNqQztBQUFBLE1BQ0Y7QUFFQSxlQUFTLGdCQUFnQixTQUFTLGNBQWUsUUFBUTtBQUN2RCxlQUFPLFNBQVM7QUFBQSxNQUNsQjtBQUVBLGVBQVMsVUFBVSxZQUFZLFNBQVMsWUFBYTtBQUNuRCxlQUFPLEtBQUssS0FBSztBQUFBLE1BQ25CO0FBRUEsZUFBUyxVQUFVLGdCQUFnQixTQUFTLGdCQUFpQjtBQUMzRCxlQUFPLFNBQVMsY0FBYyxLQUFLLEtBQUssTUFBTTtBQUFBLE1BQ2hEO0FBRUEsZUFBUyxVQUFVLFFBQVEsU0FBVSxXQUFXO0FBQzlDLGlCQUFTLElBQUksR0FBRyxJQUFJLEtBQUssS0FBSyxRQUFRLElBQUksR0FBRyxLQUFLO0FBQ2hELG9CQUFVLElBQUksS0FBSyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQUEsUUFDL0I7QUFBQSxNQUNGO0FBRUEsYUFBTyxVQUFVO0FBQUE7QUFBQTs7O0FDN0JqQjtBQUFBO0FBQUEsVUFBTSxPQUFPO0FBQ2IsVUFBTSxRQUFRO0FBRWQsZUFBUyxVQUFXLE1BQU07QUFDeEIsYUFBSyxPQUFPLEtBQUs7QUFDakIsYUFBSyxPQUFPO0FBQUEsTUFDZDtBQUVBLGdCQUFVLGdCQUFnQixTQUFTLGNBQWUsUUFBUTtBQUN4RCxlQUFPLFNBQVM7QUFBQSxNQUNsQjtBQUVBLGdCQUFVLFVBQVUsWUFBWSxTQUFTLFlBQWE7QUFDcEQsZUFBTyxLQUFLLEtBQUs7QUFBQSxNQUNuQjtBQUVBLGdCQUFVLFVBQVUsZ0JBQWdCLFNBQVMsZ0JBQWlCO0FBQzVELGVBQU8sVUFBVSxjQUFjLEtBQUssS0FBSyxNQUFNO0FBQUEsTUFDakQ7QUFFQSxnQkFBVSxVQUFVLFFBQVEsU0FBVSxXQUFXO0FBQy9DLFlBQUk7QUFLSixhQUFLLElBQUksR0FBRyxJQUFJLEtBQUssS0FBSyxRQUFRLEtBQUs7QUFDckMsY0FBSSxRQUFRLE1BQU0sT0FBTyxLQUFLLEtBQUssQ0FBQyxDQUFDO0FBR3JDLGNBQUksU0FBUyxTQUFVLFNBQVMsT0FBUTtBQUV0QyxxQkFBUztBQUFBLFVBR1gsV0FBVyxTQUFTLFNBQVUsU0FBUyxPQUFRO0FBRTdDLHFCQUFTO0FBQUEsVUFDWCxPQUFPO0FBQ0wsa0JBQU0sSUFBSTtBQUFBLGNBQ1IsNkJBQTZCLEtBQUssS0FBSyxDQUFDLElBQUk7QUFBQSxZQUNYO0FBQUEsVUFDckM7QUFJQSxtQkFBVyxVQUFVLElBQUssT0FBUSxPQUFTLFFBQVE7QUFHbkQsb0JBQVUsSUFBSSxPQUFPLEVBQUU7QUFBQSxRQUN6QjtBQUFBLE1BQ0Y7QUFFQSxhQUFPLFVBQVU7QUFBQTtBQUFBOzs7QUNyRGpCO0FBQUE7QUFBQTtBQXVCQSxVQUFJLFdBQVc7QUFBQSxRQUNiLDhCQUE4QixTQUFTLE9BQU8sR0FBRyxHQUFHO0FBR2xELGNBQUksZUFBZSxDQUFDO0FBSXBCLGNBQUksUUFBUSxDQUFDO0FBQ2IsZ0JBQU0sQ0FBQyxJQUFJO0FBTVgsY0FBSSxPQUFPLFNBQVMsY0FBYyxLQUFLO0FBQ3ZDLGVBQUssS0FBSyxHQUFHLENBQUM7QUFFZCxjQUFJLFNBQ0EsR0FBRyxHQUNILGdCQUNBLGdCQUNBLFdBQ0EsK0JBQ0EsZ0JBQ0E7QUFDSixpQkFBTyxDQUFDLEtBQUssTUFBTSxHQUFHO0FBR3BCLHNCQUFVLEtBQUssSUFBSTtBQUNuQixnQkFBSSxRQUFRO0FBQ1osNkJBQWlCLFFBQVE7QUFHekIsNkJBQWlCLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFLOUIsaUJBQUssS0FBSyxnQkFBZ0I7QUFDeEIsa0JBQUksZUFBZSxlQUFlLENBQUMsR0FBRztBQUVwQyw0QkFBWSxlQUFlLENBQUM7QUFLNUIsZ0RBQWdDLGlCQUFpQjtBQU1qRCxpQ0FBaUIsTUFBTSxDQUFDO0FBQ3hCLDhCQUFlLE9BQU8sTUFBTSxDQUFDLE1BQU07QUFDbkMsb0JBQUksZUFBZSxpQkFBaUIsK0JBQStCO0FBQ2pFLHdCQUFNLENBQUMsSUFBSTtBQUNYLHVCQUFLLEtBQUssR0FBRyw2QkFBNkI7QUFDMUMsK0JBQWEsQ0FBQyxJQUFJO0FBQUEsZ0JBQ3BCO0FBQUEsY0FDRjtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBRUEsY0FBSSxPQUFPLE1BQU0sZUFBZSxPQUFPLE1BQU0sQ0FBQyxNQUFNLGFBQWE7QUFDL0QsZ0JBQUksTUFBTSxDQUFDLCtCQUErQixHQUFHLFFBQVEsR0FBRyxHQUFHLEVBQUUsS0FBSyxFQUFFO0FBQ3BFLGtCQUFNLElBQUksTUFBTSxHQUFHO0FBQUEsVUFDckI7QUFFQSxpQkFBTztBQUFBLFFBQ1Q7QUFBQSxRQUVBLDZDQUE2QyxTQUFTLGNBQWMsR0FBRztBQUNyRSxjQUFJLFFBQVEsQ0FBQztBQUNiLGNBQUksSUFBSTtBQUNSLGNBQUk7QUFDSixpQkFBTyxHQUFHO0FBQ1Isa0JBQU0sS0FBSyxDQUFDO0FBQ1osMEJBQWMsYUFBYSxDQUFDO0FBQzVCLGdCQUFJLGFBQWEsQ0FBQztBQUFBLFVBQ3BCO0FBQ0EsZ0JBQU0sUUFBUTtBQUNkLGlCQUFPO0FBQUEsUUFDVDtBQUFBLFFBRUEsV0FBVyxTQUFTLE9BQU8sR0FBRyxHQUFHO0FBQy9CLGNBQUksZUFBZSxTQUFTLDZCQUE2QixPQUFPLEdBQUcsQ0FBQztBQUNwRSxpQkFBTyxTQUFTO0FBQUEsWUFDZDtBQUFBLFlBQWM7QUFBQSxVQUFDO0FBQUEsUUFDbkI7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUtBLGVBQWU7QUFBQSxVQUNiLE1BQU0sU0FBVSxNQUFNO0FBQ3BCLGdCQUFJLElBQUksU0FBUyxlQUNiLElBQUksQ0FBQyxHQUNMO0FBQ0osbUJBQU8sUUFBUSxDQUFDO0FBQ2hCLGlCQUFLLE9BQU8sR0FBRztBQUNiLGtCQUFJLEVBQUUsZUFBZSxHQUFHLEdBQUc7QUFDekIsa0JBQUUsR0FBRyxJQUFJLEVBQUUsR0FBRztBQUFBLGNBQ2hCO0FBQUEsWUFDRjtBQUNBLGNBQUUsUUFBUSxDQUFDO0FBQ1gsY0FBRSxTQUFTLEtBQUssVUFBVSxFQUFFO0FBQzVCLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFVBRUEsZ0JBQWdCLFNBQVUsR0FBRyxHQUFHO0FBQzlCLG1CQUFPLEVBQUUsT0FBTyxFQUFFO0FBQUEsVUFDcEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBTUEsTUFBTSxTQUFVLE9BQU8sTUFBTTtBQUMzQixnQkFBSSxPQUFPLEVBQUMsT0FBYyxLQUFVO0FBQ3BDLGlCQUFLLE1BQU0sS0FBSyxJQUFJO0FBQ3BCLGlCQUFLLE1BQU0sS0FBSyxLQUFLLE1BQU07QUFBQSxVQUM3QjtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBS0EsS0FBSyxXQUFZO0FBQ2YsbUJBQU8sS0FBSyxNQUFNLE1BQU07QUFBQSxVQUMxQjtBQUFBLFVBRUEsT0FBTyxXQUFZO0FBQ2pCLG1CQUFPLEtBQUssTUFBTSxXQUFXO0FBQUEsVUFDL0I7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUlBLFVBQUksT0FBTyxXQUFXLGFBQWE7QUFDakMsZUFBTyxVQUFVO0FBQUEsTUFDbkI7QUFBQTtBQUFBOzs7QUNwS0E7QUFBQTtBQUFBLFVBQU0sT0FBTztBQUNiLFVBQU0sY0FBYztBQUNwQixVQUFNLG1CQUFtQjtBQUN6QixVQUFNLFdBQVc7QUFDakIsVUFBTSxZQUFZO0FBQ2xCLFVBQU0sUUFBUTtBQUNkLFVBQU0sUUFBUTtBQUNkLFVBQU0sV0FBVztBQVFqQixlQUFTLG9CQUFxQixLQUFLO0FBQ2pDLGVBQU8sU0FBUyxtQkFBbUIsR0FBRyxDQUFDLEVBQUU7QUFBQSxNQUMzQztBQVVBLGVBQVMsWUFBYSxPQUFPLE1BQU0sS0FBSztBQUN0QyxjQUFNLFdBQVcsQ0FBQztBQUNsQixZQUFJO0FBRUosZ0JBQVEsU0FBUyxNQUFNLEtBQUssR0FBRyxPQUFPLE1BQU07QUFDMUMsbUJBQVMsS0FBSztBQUFBLFlBQ1osTUFBTSxPQUFPLENBQUM7QUFBQSxZQUNkLE9BQU8sT0FBTztBQUFBLFlBQ2Q7QUFBQSxZQUNBLFFBQVEsT0FBTyxDQUFDLEVBQUU7QUFBQSxVQUNwQixDQUFDO0FBQUEsUUFDSDtBQUVBLGVBQU87QUFBQSxNQUNUO0FBU0EsZUFBUyxzQkFBdUIsU0FBUztBQUN2QyxjQUFNLFVBQVUsWUFBWSxNQUFNLFNBQVMsS0FBSyxTQUFTLE9BQU87QUFDaEUsY0FBTSxlQUFlLFlBQVksTUFBTSxjQUFjLEtBQUssY0FBYyxPQUFPO0FBQy9FLFlBQUk7QUFDSixZQUFJO0FBRUosWUFBSSxNQUFNLG1CQUFtQixHQUFHO0FBQzlCLHFCQUFXLFlBQVksTUFBTSxNQUFNLEtBQUssTUFBTSxPQUFPO0FBQ3JELHNCQUFZLFlBQVksTUFBTSxPQUFPLEtBQUssT0FBTyxPQUFPO0FBQUEsUUFDMUQsT0FBTztBQUNMLHFCQUFXLFlBQVksTUFBTSxZQUFZLEtBQUssTUFBTSxPQUFPO0FBQzNELHNCQUFZLENBQUM7QUFBQSxRQUNmO0FBRUEsY0FBTSxPQUFPLFFBQVEsT0FBTyxjQUFjLFVBQVUsU0FBUztBQUU3RCxlQUFPLEtBQ0osS0FBSyxTQUFVLElBQUksSUFBSTtBQUN0QixpQkFBTyxHQUFHLFFBQVEsR0FBRztBQUFBLFFBQ3ZCLENBQUMsRUFDQSxJQUFJLFNBQVUsS0FBSztBQUNsQixpQkFBTztBQUFBLFlBQ0wsTUFBTSxJQUFJO0FBQUEsWUFDVixNQUFNLElBQUk7QUFBQSxZQUNWLFFBQVEsSUFBSTtBQUFBLFVBQ2Q7QUFBQSxRQUNGLENBQUM7QUFBQSxNQUNMO0FBVUEsZUFBUyxxQkFBc0IsUUFBUSxNQUFNO0FBQzNDLGdCQUFRLE1BQU07QUFBQSxVQUNaLEtBQUssS0FBSztBQUNSLG1CQUFPLFlBQVksY0FBYyxNQUFNO0FBQUEsVUFDekMsS0FBSyxLQUFLO0FBQ1IsbUJBQU8saUJBQWlCLGNBQWMsTUFBTTtBQUFBLFVBQzlDLEtBQUssS0FBSztBQUNSLG1CQUFPLFVBQVUsY0FBYyxNQUFNO0FBQUEsVUFDdkMsS0FBSyxLQUFLO0FBQ1IsbUJBQU8sU0FBUyxjQUFjLE1BQU07QUFBQSxRQUN4QztBQUFBLE1BQ0Y7QUFRQSxlQUFTLGNBQWUsTUFBTTtBQUM1QixlQUFPLEtBQUssT0FBTyxTQUFVLEtBQUssTUFBTTtBQUN0QyxnQkFBTSxVQUFVLElBQUksU0FBUyxLQUFLLElBQUksSUFBSSxJQUFJLFNBQVMsQ0FBQyxJQUFJO0FBQzVELGNBQUksV0FBVyxRQUFRLFNBQVMsS0FBSyxNQUFNO0FBQ3pDLGdCQUFJLElBQUksU0FBUyxDQUFDLEVBQUUsUUFBUSxLQUFLO0FBQ2pDLG1CQUFPO0FBQUEsVUFDVDtBQUVBLGNBQUksS0FBSyxJQUFJO0FBQ2IsaUJBQU87QUFBQSxRQUNULEdBQUcsQ0FBQyxDQUFDO0FBQUEsTUFDUDtBQWtCQSxlQUFTLFdBQVksTUFBTTtBQUN6QixjQUFNLFFBQVEsQ0FBQztBQUNmLGlCQUFTLElBQUksR0FBRyxJQUFJLEtBQUssUUFBUSxLQUFLO0FBQ3BDLGdCQUFNLE1BQU0sS0FBSyxDQUFDO0FBRWxCLGtCQUFRLElBQUksTUFBTTtBQUFBLFlBQ2hCLEtBQUssS0FBSztBQUNSLG9CQUFNLEtBQUs7QUFBQSxnQkFBQztBQUFBLGdCQUNWLEVBQUUsTUFBTSxJQUFJLE1BQU0sTUFBTSxLQUFLLGNBQWMsUUFBUSxJQUFJLE9BQU87QUFBQSxnQkFDOUQsRUFBRSxNQUFNLElBQUksTUFBTSxNQUFNLEtBQUssTUFBTSxRQUFRLElBQUksT0FBTztBQUFBLGNBQ3hELENBQUM7QUFDRDtBQUFBLFlBQ0YsS0FBSyxLQUFLO0FBQ1Isb0JBQU0sS0FBSztBQUFBLGdCQUFDO0FBQUEsZ0JBQ1YsRUFBRSxNQUFNLElBQUksTUFBTSxNQUFNLEtBQUssTUFBTSxRQUFRLElBQUksT0FBTztBQUFBLGNBQ3hELENBQUM7QUFDRDtBQUFBLFlBQ0YsS0FBSyxLQUFLO0FBQ1Isb0JBQU0sS0FBSztBQUFBLGdCQUFDO0FBQUEsZ0JBQ1YsRUFBRSxNQUFNLElBQUksTUFBTSxNQUFNLEtBQUssTUFBTSxRQUFRLG9CQUFvQixJQUFJLElBQUksRUFBRTtBQUFBLGNBQzNFLENBQUM7QUFDRDtBQUFBLFlBQ0YsS0FBSyxLQUFLO0FBQ1Isb0JBQU0sS0FBSztBQUFBLGdCQUNULEVBQUUsTUFBTSxJQUFJLE1BQU0sTUFBTSxLQUFLLE1BQU0sUUFBUSxvQkFBb0IsSUFBSSxJQUFJLEVBQUU7QUFBQSxjQUMzRSxDQUFDO0FBQUEsVUFDTDtBQUFBLFFBQ0Y7QUFFQSxlQUFPO0FBQUEsTUFDVDtBQWNBLGVBQVMsV0FBWSxPQUFPLFNBQVM7QUFDbkMsY0FBTSxRQUFRLENBQUM7QUFDZixjQUFNLFFBQVEsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUMxQixZQUFJLGNBQWMsQ0FBQyxPQUFPO0FBRTFCLGlCQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sUUFBUSxLQUFLO0FBQ3JDLGdCQUFNLFlBQVksTUFBTSxDQUFDO0FBQ3pCLGdCQUFNLGlCQUFpQixDQUFDO0FBRXhCLG1CQUFTLElBQUksR0FBRyxJQUFJLFVBQVUsUUFBUSxLQUFLO0FBQ3pDLGtCQUFNLE9BQU8sVUFBVSxDQUFDO0FBQ3hCLGtCQUFNLE1BQU0sS0FBSyxJQUFJO0FBRXJCLDJCQUFlLEtBQUssR0FBRztBQUN2QixrQkFBTSxHQUFHLElBQUksRUFBRSxNQUFZLFdBQVcsRUFBRTtBQUN4QyxrQkFBTSxHQUFHLElBQUksQ0FBQztBQUVkLHFCQUFTLElBQUksR0FBRyxJQUFJLFlBQVksUUFBUSxLQUFLO0FBQzNDLG9CQUFNLGFBQWEsWUFBWSxDQUFDO0FBRWhDLGtCQUFJLE1BQU0sVUFBVSxLQUFLLE1BQU0sVUFBVSxFQUFFLEtBQUssU0FBUyxLQUFLLE1BQU07QUFDbEUsc0JBQU0sVUFBVSxFQUFFLEdBQUcsSUFDbkIscUJBQXFCLE1BQU0sVUFBVSxFQUFFLFlBQVksS0FBSyxRQUFRLEtBQUssSUFBSSxJQUN6RSxxQkFBcUIsTUFBTSxVQUFVLEVBQUUsV0FBVyxLQUFLLElBQUk7QUFFN0Qsc0JBQU0sVUFBVSxFQUFFLGFBQWEsS0FBSztBQUFBLGNBQ3RDLE9BQU87QUFDTCxvQkFBSSxNQUFNLFVBQVUsRUFBRyxPQUFNLFVBQVUsRUFBRSxZQUFZLEtBQUs7QUFFMUQsc0JBQU0sVUFBVSxFQUFFLEdBQUcsSUFBSSxxQkFBcUIsS0FBSyxRQUFRLEtBQUssSUFBSSxJQUNsRSxJQUFJLEtBQUssc0JBQXNCLEtBQUssTUFBTSxPQUFPO0FBQUEsY0FDckQ7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUVBLHdCQUFjO0FBQUEsUUFDaEI7QUFFQSxpQkFBUyxJQUFJLEdBQUcsSUFBSSxZQUFZLFFBQVEsS0FBSztBQUMzQyxnQkFBTSxZQUFZLENBQUMsQ0FBQyxFQUFFLE1BQU07QUFBQSxRQUM5QjtBQUVBLGVBQU8sRUFBRSxLQUFLLE9BQU8sTUFBYTtBQUFBLE1BQ3BDO0FBVUEsZUFBUyxtQkFBb0IsTUFBTSxXQUFXO0FBQzVDLFlBQUk7QUFDSixjQUFNLFdBQVcsS0FBSyxtQkFBbUIsSUFBSTtBQUU3QyxlQUFPLEtBQUssS0FBSyxXQUFXLFFBQVE7QUFHcEMsWUFBSSxTQUFTLEtBQUssUUFBUSxLQUFLLE1BQU0sU0FBUyxLQUFLO0FBQ2pELGdCQUFNLElBQUksTUFBTSxNQUFNLE9BQU8sbUNBQ08sS0FBSyxTQUFTLElBQUksSUFDcEQsNEJBQTRCLEtBQUssU0FBUyxRQUFRLENBQUM7QUFBQSxRQUN2RDtBQUdBLFlBQUksU0FBUyxLQUFLLFNBQVMsQ0FBQyxNQUFNLG1CQUFtQixHQUFHO0FBQ3RELGlCQUFPLEtBQUs7QUFBQSxRQUNkO0FBRUEsZ0JBQVEsTUFBTTtBQUFBLFVBQ1osS0FBSyxLQUFLO0FBQ1IsbUJBQU8sSUFBSSxZQUFZLElBQUk7QUFBQSxVQUU3QixLQUFLLEtBQUs7QUFDUixtQkFBTyxJQUFJLGlCQUFpQixJQUFJO0FBQUEsVUFFbEMsS0FBSyxLQUFLO0FBQ1IsbUJBQU8sSUFBSSxVQUFVLElBQUk7QUFBQSxVQUUzQixLQUFLLEtBQUs7QUFDUixtQkFBTyxJQUFJLFNBQVMsSUFBSTtBQUFBLFFBQzVCO0FBQUEsTUFDRjtBQWlCQSxjQUFRLFlBQVksU0FBUyxVQUFXLE9BQU87QUFDN0MsZUFBTyxNQUFNLE9BQU8sU0FBVSxLQUFLLEtBQUs7QUFDdEMsY0FBSSxPQUFPLFFBQVEsVUFBVTtBQUMzQixnQkFBSSxLQUFLLG1CQUFtQixLQUFLLElBQUksQ0FBQztBQUFBLFVBQ3hDLFdBQVcsSUFBSSxNQUFNO0FBQ25CLGdCQUFJLEtBQUssbUJBQW1CLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQztBQUFBLFVBQ2pEO0FBRUEsaUJBQU87QUFBQSxRQUNULEdBQUcsQ0FBQyxDQUFDO0FBQUEsTUFDUDtBQVVBLGNBQVEsYUFBYSxTQUFTLFdBQVksTUFBTSxTQUFTO0FBQ3ZELGNBQU0sT0FBTyxzQkFBc0IsTUFBTSxNQUFNLG1CQUFtQixDQUFDO0FBRW5FLGNBQU0sUUFBUSxXQUFXLElBQUk7QUFDN0IsY0FBTSxRQUFRLFdBQVcsT0FBTyxPQUFPO0FBQ3ZDLGNBQU0sT0FBTyxTQUFTLFVBQVUsTUFBTSxLQUFLLFNBQVMsS0FBSztBQUV6RCxjQUFNLGdCQUFnQixDQUFDO0FBQ3ZCLGlCQUFTLElBQUksR0FBRyxJQUFJLEtBQUssU0FBUyxHQUFHLEtBQUs7QUFDeEMsd0JBQWMsS0FBSyxNQUFNLE1BQU0sS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJO0FBQUEsUUFDOUM7QUFFQSxlQUFPLFFBQVEsVUFBVSxjQUFjLGFBQWEsQ0FBQztBQUFBLE1BQ3ZEO0FBWUEsY0FBUSxXQUFXLFNBQVMsU0FBVSxNQUFNO0FBQzFDLGVBQU8sUUFBUTtBQUFBLFVBQ2Isc0JBQXNCLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQztBQUFBLFFBQ3hEO0FBQUEsTUFDRjtBQUFBO0FBQUE7OztBQ3pVQTtBQUFBO0FBQUEsVUFBTSxRQUFRO0FBQ2QsVUFBTSxVQUFVO0FBQ2hCLFVBQU0sWUFBWTtBQUNsQixVQUFNLFlBQVk7QUFDbEIsVUFBTSxtQkFBbUI7QUFDekIsVUFBTSxnQkFBZ0I7QUFDdEIsVUFBTSxjQUFjO0FBQ3BCLFVBQU0sU0FBUztBQUNmLFVBQU0scUJBQXFCO0FBQzNCLFVBQU0sVUFBVTtBQUNoQixVQUFNLGFBQWE7QUFDbkIsVUFBTSxPQUFPO0FBQ2IsVUFBTSxXQUFXO0FBa0NqQixlQUFTLG1CQUFvQixRQUFRLFNBQVM7QUFDNUMsY0FBTSxPQUFPLE9BQU87QUFDcEIsY0FBTSxNQUFNLGNBQWMsYUFBYSxPQUFPO0FBRTlDLGlCQUFTLElBQUksR0FBRyxJQUFJLElBQUksUUFBUSxLQUFLO0FBQ25DLGdCQUFNLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUNwQixnQkFBTSxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUM7QUFFcEIsbUJBQVMsSUFBSSxJQUFJLEtBQUssR0FBRyxLQUFLO0FBQzVCLGdCQUFJLE1BQU0sS0FBSyxNQUFNLFFBQVEsTUFBTSxFQUFHO0FBRXRDLHFCQUFTLElBQUksSUFBSSxLQUFLLEdBQUcsS0FBSztBQUM1QixrQkFBSSxNQUFNLEtBQUssTUFBTSxRQUFRLE1BQU0sRUFBRztBQUV0QyxrQkFBSyxLQUFLLEtBQUssS0FBSyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQ3hDLEtBQUssS0FBSyxLQUFLLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFDdEMsS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxHQUFJO0FBQ3hDLHVCQUFPLElBQUksTUFBTSxHQUFHLE1BQU0sR0FBRyxNQUFNLElBQUk7QUFBQSxjQUN6QyxPQUFPO0FBQ0wsdUJBQU8sSUFBSSxNQUFNLEdBQUcsTUFBTSxHQUFHLE9BQU8sSUFBSTtBQUFBLGNBQzFDO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQVNBLGVBQVMsbUJBQW9CLFFBQVE7QUFDbkMsY0FBTSxPQUFPLE9BQU87QUFFcEIsaUJBQVMsSUFBSSxHQUFHLElBQUksT0FBTyxHQUFHLEtBQUs7QUFDakMsZ0JBQU0sUUFBUSxJQUFJLE1BQU07QUFDeEIsaUJBQU8sSUFBSSxHQUFHLEdBQUcsT0FBTyxJQUFJO0FBQzVCLGlCQUFPLElBQUksR0FBRyxHQUFHLE9BQU8sSUFBSTtBQUFBLFFBQzlCO0FBQUEsTUFDRjtBQVVBLGVBQVMsc0JBQXVCLFFBQVEsU0FBUztBQUMvQyxjQUFNLE1BQU0saUJBQWlCLGFBQWEsT0FBTztBQUVqRCxpQkFBUyxJQUFJLEdBQUcsSUFBSSxJQUFJLFFBQVEsS0FBSztBQUNuQyxnQkFBTSxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDcEIsZ0JBQU0sTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDO0FBRXBCLG1CQUFTLElBQUksSUFBSSxLQUFLLEdBQUcsS0FBSztBQUM1QixxQkFBUyxJQUFJLElBQUksS0FBSyxHQUFHLEtBQUs7QUFDNUIsa0JBQUksTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sTUFBTSxLQUMxQyxNQUFNLEtBQUssTUFBTSxHQUFJO0FBQ3RCLHVCQUFPLElBQUksTUFBTSxHQUFHLE1BQU0sR0FBRyxNQUFNLElBQUk7QUFBQSxjQUN6QyxPQUFPO0FBQ0wsdUJBQU8sSUFBSSxNQUFNLEdBQUcsTUFBTSxHQUFHLE9BQU8sSUFBSTtBQUFBLGNBQzFDO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQVFBLGVBQVMsaUJBQWtCLFFBQVEsU0FBUztBQUMxQyxjQUFNLE9BQU8sT0FBTztBQUNwQixjQUFNLE9BQU8sUUFBUSxlQUFlLE9BQU87QUFDM0MsWUFBSSxLQUFLLEtBQUs7QUFFZCxpQkFBUyxJQUFJLEdBQUcsSUFBSSxJQUFJLEtBQUs7QUFDM0IsZ0JBQU0sS0FBSyxNQUFNLElBQUksQ0FBQztBQUN0QixnQkFBTSxJQUFJLElBQUksT0FBTyxJQUFJO0FBQ3pCLGlCQUFRLFFBQVEsSUFBSyxPQUFPO0FBRTVCLGlCQUFPLElBQUksS0FBSyxLQUFLLEtBQUssSUFBSTtBQUM5QixpQkFBTyxJQUFJLEtBQUssS0FBSyxLQUFLLElBQUk7QUFBQSxRQUNoQztBQUFBLE1BQ0Y7QUFTQSxlQUFTLGdCQUFpQixRQUFRLHNCQUFzQixhQUFhO0FBQ25FLGNBQU0sT0FBTyxPQUFPO0FBQ3BCLGNBQU0sT0FBTyxXQUFXLGVBQWUsc0JBQXNCLFdBQVc7QUFDeEUsWUFBSSxHQUFHO0FBRVAsYUFBSyxJQUFJLEdBQUcsSUFBSSxJQUFJLEtBQUs7QUFDdkIsaUJBQVEsUUFBUSxJQUFLLE9BQU87QUFHNUIsY0FBSSxJQUFJLEdBQUc7QUFDVCxtQkFBTyxJQUFJLEdBQUcsR0FBRyxLQUFLLElBQUk7QUFBQSxVQUM1QixXQUFXLElBQUksR0FBRztBQUNoQixtQkFBTyxJQUFJLElBQUksR0FBRyxHQUFHLEtBQUssSUFBSTtBQUFBLFVBQ2hDLE9BQU87QUFDTCxtQkFBTyxJQUFJLE9BQU8sS0FBSyxHQUFHLEdBQUcsS0FBSyxJQUFJO0FBQUEsVUFDeEM7QUFHQSxjQUFJLElBQUksR0FBRztBQUNULG1CQUFPLElBQUksR0FBRyxPQUFPLElBQUksR0FBRyxLQUFLLElBQUk7QUFBQSxVQUN2QyxXQUFXLElBQUksR0FBRztBQUNoQixtQkFBTyxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLElBQUk7QUFBQSxVQUN6QyxPQUFPO0FBQ0wsbUJBQU8sSUFBSSxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssSUFBSTtBQUFBLFVBQ3JDO0FBQUEsUUFDRjtBQUdBLGVBQU8sSUFBSSxPQUFPLEdBQUcsR0FBRyxHQUFHLElBQUk7QUFBQSxNQUNqQztBQVFBLGVBQVMsVUFBVyxRQUFRLE1BQU07QUFDaEMsY0FBTSxPQUFPLE9BQU87QUFDcEIsWUFBSSxNQUFNO0FBQ1YsWUFBSSxNQUFNLE9BQU87QUFDakIsWUFBSSxXQUFXO0FBQ2YsWUFBSSxZQUFZO0FBRWhCLGlCQUFTLE1BQU0sT0FBTyxHQUFHLE1BQU0sR0FBRyxPQUFPLEdBQUc7QUFDMUMsY0FBSSxRQUFRLEVBQUc7QUFFZixpQkFBTyxNQUFNO0FBQ1gscUJBQVMsSUFBSSxHQUFHLElBQUksR0FBRyxLQUFLO0FBQzFCLGtCQUFJLENBQUMsT0FBTyxXQUFXLEtBQUssTUFBTSxDQUFDLEdBQUc7QUFDcEMsb0JBQUksT0FBTztBQUVYLG9CQUFJLFlBQVksS0FBSyxRQUFRO0FBQzNCLDBCQUFVLEtBQUssU0FBUyxNQUFNLFdBQVksT0FBTztBQUFBLGdCQUNuRDtBQUVBLHVCQUFPLElBQUksS0FBSyxNQUFNLEdBQUcsSUFBSTtBQUM3QjtBQUVBLG9CQUFJLGFBQWEsSUFBSTtBQUNuQjtBQUNBLDZCQUFXO0FBQUEsZ0JBQ2I7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUVBLG1CQUFPO0FBRVAsZ0JBQUksTUFBTSxLQUFLLFFBQVEsS0FBSztBQUMxQixxQkFBTztBQUNQLG9CQUFNLENBQUM7QUFDUDtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFVQSxlQUFTLFdBQVksU0FBUyxzQkFBc0IsVUFBVTtBQUU1RCxjQUFNLFNBQVMsSUFBSSxVQUFVO0FBRTdCLGlCQUFTLFFBQVEsU0FBVSxNQUFNO0FBRS9CLGlCQUFPLElBQUksS0FBSyxLQUFLLEtBQUssQ0FBQztBQVMzQixpQkFBTyxJQUFJLEtBQUssVUFBVSxHQUFHLEtBQUssc0JBQXNCLEtBQUssTUFBTSxPQUFPLENBQUM7QUFHM0UsZUFBSyxNQUFNLE1BQU07QUFBQSxRQUNuQixDQUFDO0FBR0QsY0FBTSxpQkFBaUIsTUFBTSx3QkFBd0IsT0FBTztBQUM1RCxjQUFNLG1CQUFtQixPQUFPLHVCQUF1QixTQUFTLG9CQUFvQjtBQUNwRixjQUFNLDBCQUEwQixpQkFBaUIsb0JBQW9CO0FBT3JFLFlBQUksT0FBTyxnQkFBZ0IsSUFBSSxLQUFLLHdCQUF3QjtBQUMxRCxpQkFBTyxJQUFJLEdBQUcsQ0FBQztBQUFBLFFBQ2pCO0FBT0EsZUFBTyxPQUFPLGdCQUFnQixJQUFJLE1BQU0sR0FBRztBQUN6QyxpQkFBTyxPQUFPLENBQUM7QUFBQSxRQUNqQjtBQU1BLGNBQU0saUJBQWlCLHlCQUF5QixPQUFPLGdCQUFnQixLQUFLO0FBQzVFLGlCQUFTLElBQUksR0FBRyxJQUFJLGVBQWUsS0FBSztBQUN0QyxpQkFBTyxJQUFJLElBQUksSUFBSSxLQUFPLEtBQU0sQ0FBQztBQUFBLFFBQ25DO0FBRUEsZUFBTyxnQkFBZ0IsUUFBUSxTQUFTLG9CQUFvQjtBQUFBLE1BQzlEO0FBV0EsZUFBUyxnQkFBaUIsV0FBVyxTQUFTLHNCQUFzQjtBQUVsRSxjQUFNLGlCQUFpQixNQUFNLHdCQUF3QixPQUFPO0FBRzVELGNBQU0sbUJBQW1CLE9BQU8sdUJBQXVCLFNBQVMsb0JBQW9CO0FBR3BGLGNBQU0scUJBQXFCLGlCQUFpQjtBQUc1QyxjQUFNLGdCQUFnQixPQUFPLGVBQWUsU0FBUyxvQkFBb0I7QUFHekUsY0FBTSxpQkFBaUIsaUJBQWlCO0FBQ3hDLGNBQU0saUJBQWlCLGdCQUFnQjtBQUV2QyxjQUFNLHlCQUF5QixLQUFLLE1BQU0saUJBQWlCLGFBQWE7QUFFeEUsY0FBTSx3QkFBd0IsS0FBSyxNQUFNLHFCQUFxQixhQUFhO0FBQzNFLGNBQU0sd0JBQXdCLHdCQUF3QjtBQUd0RCxjQUFNLFVBQVUseUJBQXlCO0FBR3pDLGNBQU0sS0FBSyxJQUFJLG1CQUFtQixPQUFPO0FBRXpDLFlBQUksU0FBUztBQUNiLGNBQU0sU0FBUyxJQUFJLE1BQU0sYUFBYTtBQUN0QyxjQUFNLFNBQVMsSUFBSSxNQUFNLGFBQWE7QUFDdEMsWUFBSSxjQUFjO0FBQ2xCLGNBQU0sU0FBUyxJQUFJLFdBQVcsVUFBVSxNQUFNO0FBRzlDLGlCQUFTLElBQUksR0FBRyxJQUFJLGVBQWUsS0FBSztBQUN0QyxnQkFBTSxXQUFXLElBQUksaUJBQWlCLHdCQUF3QjtBQUc5RCxpQkFBTyxDQUFDLElBQUksT0FBTyxNQUFNLFFBQVEsU0FBUyxRQUFRO0FBR2xELGlCQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sT0FBTyxDQUFDLENBQUM7QUFFL0Isb0JBQVU7QUFDVix3QkFBYyxLQUFLLElBQUksYUFBYSxRQUFRO0FBQUEsUUFDOUM7QUFJQSxjQUFNLE9BQU8sSUFBSSxXQUFXLGNBQWM7QUFDMUMsWUFBSSxRQUFRO0FBQ1osWUFBSSxHQUFHO0FBR1AsYUFBSyxJQUFJLEdBQUcsSUFBSSxhQUFhLEtBQUs7QUFDaEMsZUFBSyxJQUFJLEdBQUcsSUFBSSxlQUFlLEtBQUs7QUFDbEMsZ0JBQUksSUFBSSxPQUFPLENBQUMsRUFBRSxRQUFRO0FBQ3hCLG1CQUFLLE9BQU8sSUFBSSxPQUFPLENBQUMsRUFBRSxDQUFDO0FBQUEsWUFDN0I7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUdBLGFBQUssSUFBSSxHQUFHLElBQUksU0FBUyxLQUFLO0FBQzVCLGVBQUssSUFBSSxHQUFHLElBQUksZUFBZSxLQUFLO0FBQ2xDLGlCQUFLLE9BQU8sSUFBSSxPQUFPLENBQUMsRUFBRSxDQUFDO0FBQUEsVUFDN0I7QUFBQSxRQUNGO0FBRUEsZUFBTztBQUFBLE1BQ1Q7QUFXQSxlQUFTLGFBQWMsTUFBTSxTQUFTLHNCQUFzQixhQUFhO0FBQ3ZFLFlBQUk7QUFFSixZQUFJLE1BQU0sUUFBUSxJQUFJLEdBQUc7QUFDdkIscUJBQVcsU0FBUyxVQUFVLElBQUk7QUFBQSxRQUNwQyxXQUFXLE9BQU8sU0FBUyxVQUFVO0FBQ25DLGNBQUksbUJBQW1CO0FBRXZCLGNBQUksQ0FBQyxrQkFBa0I7QUFDckIsa0JBQU0sY0FBYyxTQUFTLFNBQVMsSUFBSTtBQUcxQywrQkFBbUIsUUFBUSxzQkFBc0IsYUFBYSxvQkFBb0I7QUFBQSxVQUNwRjtBQUlBLHFCQUFXLFNBQVMsV0FBVyxNQUFNLG9CQUFvQixFQUFFO0FBQUEsUUFDN0QsT0FBTztBQUNMLGdCQUFNLElBQUksTUFBTSxjQUFjO0FBQUEsUUFDaEM7QUFHQSxjQUFNLGNBQWMsUUFBUSxzQkFBc0IsVUFBVSxvQkFBb0I7QUFHaEYsWUFBSSxDQUFDLGFBQWE7QUFDaEIsZ0JBQU0sSUFBSSxNQUFNLHlEQUF5RDtBQUFBLFFBQzNFO0FBR0EsWUFBSSxDQUFDLFNBQVM7QUFDWixvQkFBVTtBQUFBLFFBR1osV0FBVyxVQUFVLGFBQWE7QUFDaEMsZ0JBQU0sSUFBSTtBQUFBLFlBQU0sMEhBRTBDLGNBQWM7QUFBQSxVQUN4RTtBQUFBLFFBQ0Y7QUFFQSxjQUFNLFdBQVcsV0FBVyxTQUFTLHNCQUFzQixRQUFRO0FBR25FLGNBQU0sY0FBYyxNQUFNLGNBQWMsT0FBTztBQUMvQyxjQUFNLFVBQVUsSUFBSSxVQUFVLFdBQVc7QUFHekMsMkJBQW1CLFNBQVMsT0FBTztBQUNuQywyQkFBbUIsT0FBTztBQUMxQiw4QkFBc0IsU0FBUyxPQUFPO0FBTXRDLHdCQUFnQixTQUFTLHNCQUFzQixDQUFDO0FBRWhELFlBQUksV0FBVyxHQUFHO0FBQ2hCLDJCQUFpQixTQUFTLE9BQU87QUFBQSxRQUNuQztBQUdBLGtCQUFVLFNBQVMsUUFBUTtBQUUzQixZQUFJLE1BQU0sV0FBVyxHQUFHO0FBRXRCLHdCQUFjLFlBQVk7QUFBQSxZQUFZO0FBQUEsWUFDcEMsZ0JBQWdCLEtBQUssTUFBTSxTQUFTLG9CQUFvQjtBQUFBLFVBQUM7QUFBQSxRQUM3RDtBQUdBLG9CQUFZLFVBQVUsYUFBYSxPQUFPO0FBRzFDLHdCQUFnQixTQUFTLHNCQUFzQixXQUFXO0FBRTFELGVBQU87QUFBQSxVQUNMO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBV0EsY0FBUSxTQUFTLFNBQVMsT0FBUSxNQUFNLFNBQVM7QUFDL0MsWUFBSSxPQUFPLFNBQVMsZUFBZSxTQUFTLElBQUk7QUFDOUMsZ0JBQU0sSUFBSSxNQUFNLGVBQWU7QUFBQSxRQUNqQztBQUVBLFlBQUksdUJBQXVCLFFBQVE7QUFDbkMsWUFBSTtBQUNKLFlBQUk7QUFFSixZQUFJLE9BQU8sWUFBWSxhQUFhO0FBRWxDLGlDQUF1QixRQUFRLEtBQUssUUFBUSxzQkFBc0IsUUFBUSxDQUFDO0FBQzNFLG9CQUFVLFFBQVEsS0FBSyxRQUFRLE9BQU87QUFDdEMsaUJBQU8sWUFBWSxLQUFLLFFBQVEsV0FBVztBQUUzQyxjQUFJLFFBQVEsWUFBWTtBQUN0QixrQkFBTSxrQkFBa0IsUUFBUSxVQUFVO0FBQUEsVUFDNUM7QUFBQSxRQUNGO0FBRUEsZUFBTyxhQUFhLE1BQU0sU0FBUyxzQkFBc0IsSUFBSTtBQUFBLE1BQy9EO0FBQUE7QUFBQTs7O0FDOWVBLE1BQUFDLGlCQUFBO0FBQUE7QUFBQSxlQUFTLFNBQVUsS0FBSztBQUN0QixZQUFJLE9BQU8sUUFBUSxVQUFVO0FBQzNCLGdCQUFNLElBQUksU0FBUztBQUFBLFFBQ3JCO0FBRUEsWUFBSSxPQUFPLFFBQVEsVUFBVTtBQUMzQixnQkFBTSxJQUFJLE1BQU0sdUNBQXVDO0FBQUEsUUFDekQ7QUFFQSxZQUFJLFVBQVUsSUFBSSxNQUFNLEVBQUUsUUFBUSxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUU7QUFDbkQsWUFBSSxRQUFRLFNBQVMsS0FBSyxRQUFRLFdBQVcsS0FBSyxRQUFRLFNBQVMsR0FBRztBQUNwRSxnQkFBTSxJQUFJLE1BQU0sd0JBQXdCLEdBQUc7QUFBQSxRQUM3QztBQUdBLFlBQUksUUFBUSxXQUFXLEtBQUssUUFBUSxXQUFXLEdBQUc7QUFDaEQsb0JBQVUsTUFBTSxVQUFVLE9BQU8sTUFBTSxDQUFDLEdBQUcsUUFBUSxJQUFJLFNBQVUsR0FBRztBQUNsRSxtQkFBTyxDQUFDLEdBQUcsQ0FBQztBQUFBLFVBQ2QsQ0FBQyxDQUFDO0FBQUEsUUFDSjtBQUdBLFlBQUksUUFBUSxXQUFXLEVBQUcsU0FBUSxLQUFLLEtBQUssR0FBRztBQUUvQyxjQUFNLFdBQVcsU0FBUyxRQUFRLEtBQUssRUFBRSxHQUFHLEVBQUU7QUFFOUMsZUFBTztBQUFBLFVBQ0wsR0FBSSxZQUFZLEtBQU07QUFBQSxVQUN0QixHQUFJLFlBQVksS0FBTTtBQUFBLFVBQ3RCLEdBQUksWUFBWSxJQUFLO0FBQUEsVUFDckIsR0FBRyxXQUFXO0FBQUEsVUFDZCxLQUFLLE1BQU0sUUFBUSxNQUFNLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRTtBQUFBLFFBQ3hDO0FBQUEsTUFDRjtBQUVBLGNBQVEsYUFBYSxTQUFTLFdBQVksU0FBUztBQUNqRCxZQUFJLENBQUMsUUFBUyxXQUFVLENBQUM7QUFDekIsWUFBSSxDQUFDLFFBQVEsTUFBTyxTQUFRLFFBQVEsQ0FBQztBQUVyQyxjQUFNLFNBQVMsT0FBTyxRQUFRLFdBQVcsZUFDdkMsUUFBUSxXQUFXLFFBQ25CLFFBQVEsU0FBUyxJQUNmLElBQ0EsUUFBUTtBQUVaLGNBQU0sUUFBUSxRQUFRLFNBQVMsUUFBUSxTQUFTLEtBQUssUUFBUSxRQUFRO0FBQ3JFLGNBQU0sUUFBUSxRQUFRLFNBQVM7QUFFL0IsZUFBTztBQUFBLFVBQ0w7QUFBQSxVQUNBLE9BQU8sUUFBUSxJQUFJO0FBQUEsVUFDbkI7QUFBQSxVQUNBLE9BQU87QUFBQSxZQUNMLE1BQU0sU0FBUyxRQUFRLE1BQU0sUUFBUSxXQUFXO0FBQUEsWUFDaEQsT0FBTyxTQUFTLFFBQVEsTUFBTSxTQUFTLFdBQVc7QUFBQSxVQUNwRDtBQUFBLFVBQ0EsTUFBTSxRQUFRO0FBQUEsVUFDZCxjQUFjLFFBQVEsZ0JBQWdCLENBQUM7QUFBQSxRQUN6QztBQUFBLE1BQ0Y7QUFFQSxjQUFRLFdBQVcsU0FBUyxTQUFVLFFBQVEsTUFBTTtBQUNsRCxlQUFPLEtBQUssU0FBUyxLQUFLLFNBQVMsU0FBUyxLQUFLLFNBQVMsSUFDdEQsS0FBSyxTQUFTLFNBQVMsS0FBSyxTQUFTLEtBQ3JDLEtBQUs7QUFBQSxNQUNYO0FBRUEsY0FBUSxnQkFBZ0IsU0FBUyxjQUFlLFFBQVEsTUFBTTtBQUM1RCxjQUFNLFFBQVEsUUFBUSxTQUFTLFFBQVEsSUFBSTtBQUMzQyxlQUFPLEtBQUssT0FBTyxTQUFTLEtBQUssU0FBUyxLQUFLLEtBQUs7QUFBQSxNQUN0RDtBQUVBLGNBQVEsZ0JBQWdCLFNBQVMsY0FBZSxTQUFTLElBQUksTUFBTTtBQUNqRSxjQUFNLE9BQU8sR0FBRyxRQUFRO0FBQ3hCLGNBQU0sT0FBTyxHQUFHLFFBQVE7QUFDeEIsY0FBTSxRQUFRLFFBQVEsU0FBUyxNQUFNLElBQUk7QUFDekMsY0FBTSxhQUFhLEtBQUssT0FBTyxPQUFPLEtBQUssU0FBUyxLQUFLLEtBQUs7QUFDOUQsY0FBTSxlQUFlLEtBQUssU0FBUztBQUNuQyxjQUFNLFVBQVUsQ0FBQyxLQUFLLE1BQU0sT0FBTyxLQUFLLE1BQU0sSUFBSTtBQUVsRCxpQkFBUyxJQUFJLEdBQUcsSUFBSSxZQUFZLEtBQUs7QUFDbkMsbUJBQVMsSUFBSSxHQUFHLElBQUksWUFBWSxLQUFLO0FBQ25DLGdCQUFJLFVBQVUsSUFBSSxhQUFhLEtBQUs7QUFDcEMsZ0JBQUksVUFBVSxLQUFLLE1BQU07QUFFekIsZ0JBQUksS0FBSyxnQkFBZ0IsS0FBSyxnQkFDNUIsSUFBSSxhQUFhLGdCQUFnQixJQUFJLGFBQWEsY0FBYztBQUNoRSxvQkFBTSxPQUFPLEtBQUssT0FBTyxJQUFJLGdCQUFnQixLQUFLO0FBQ2xELG9CQUFNLE9BQU8sS0FBSyxPQUFPLElBQUksZ0JBQWdCLEtBQUs7QUFDbEQsd0JBQVUsUUFBUSxLQUFLLE9BQU8sT0FBTyxJQUFJLElBQUksSUFBSSxDQUFDO0FBQUEsWUFDcEQ7QUFFQSxvQkFBUSxRQUFRLElBQUksUUFBUTtBQUM1QixvQkFBUSxRQUFRLElBQUksUUFBUTtBQUM1QixvQkFBUSxRQUFRLElBQUksUUFBUTtBQUM1QixvQkFBUSxNQUFNLElBQUksUUFBUTtBQUFBLFVBQzVCO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQTtBQUFBOzs7QUNsR0E7QUFBQTtBQUFBLFVBQU0sUUFBUTtBQUVkLGVBQVMsWUFBYSxLQUFLLFFBQVEsTUFBTTtBQUN2QyxZQUFJLFVBQVUsR0FBRyxHQUFHLE9BQU8sT0FBTyxPQUFPLE1BQU07QUFFL0MsWUFBSSxDQUFDLE9BQU8sTUFBTyxRQUFPLFFBQVEsQ0FBQztBQUNuQyxlQUFPLFNBQVM7QUFDaEIsZUFBTyxRQUFRO0FBQ2YsZUFBTyxNQUFNLFNBQVMsT0FBTztBQUM3QixlQUFPLE1BQU0sUUFBUSxPQUFPO0FBQUEsTUFDOUI7QUFFQSxlQUFTLG1CQUFvQjtBQUMzQixZQUFJO0FBQ0YsaUJBQU8sU0FBUyxjQUFjLFFBQVE7QUFBQSxRQUN4QyxTQUFTLEdBQUc7QUFDVixnQkFBTSxJQUFJLE1BQU0sc0NBQXNDO0FBQUEsUUFDeEQ7QUFBQSxNQUNGO0FBRUEsY0FBUSxTQUFTLFNBQVNDLFFBQVEsUUFBUSxRQUFRLFNBQVM7QUFDekQsWUFBSSxPQUFPO0FBQ1gsWUFBSSxXQUFXO0FBRWYsWUFBSSxPQUFPLFNBQVMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLE9BQU8sYUFBYTtBQUNsRSxpQkFBTztBQUNQLG1CQUFTO0FBQUEsUUFDWDtBQUVBLFlBQUksQ0FBQyxRQUFRO0FBQ1gscUJBQVcsaUJBQWlCO0FBQUEsUUFDOUI7QUFFQSxlQUFPLE1BQU0sV0FBVyxJQUFJO0FBQzVCLGNBQU0sT0FBTyxNQUFNLGNBQWMsT0FBTyxRQUFRLE1BQU0sSUFBSTtBQUUxRCxjQUFNLE1BQU0sU0FBUyxXQUFXLElBQUk7QUFDcEMsY0FBTSxRQUFRLElBQUksZ0JBQWdCLE1BQU0sSUFBSTtBQUM1QyxjQUFNLGNBQWMsTUFBTSxNQUFNLFFBQVEsSUFBSTtBQUU1QyxvQkFBWSxLQUFLLFVBQVUsSUFBSTtBQUMvQixZQUFJLGFBQWEsT0FBTyxHQUFHLENBQUM7QUFFNUIsZUFBTztBQUFBLE1BQ1Q7QUFFQSxjQUFRLGtCQUFrQixTQUFTLGdCQUFpQixRQUFRLFFBQVEsU0FBUztBQUMzRSxZQUFJLE9BQU87QUFFWCxZQUFJLE9BQU8sU0FBUyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsT0FBTyxhQUFhO0FBQ2xFLGlCQUFPO0FBQ1AsbUJBQVM7QUFBQSxRQUNYO0FBRUEsWUFBSSxDQUFDLEtBQU0sUUFBTyxDQUFDO0FBRW5CLGNBQU0sV0FBVyxRQUFRLE9BQU8sUUFBUSxRQUFRLElBQUk7QUFFcEQsY0FBTSxPQUFPLEtBQUssUUFBUTtBQUMxQixjQUFNLGVBQWUsS0FBSyxnQkFBZ0IsQ0FBQztBQUUzQyxlQUFPLFNBQVMsVUFBVSxNQUFNLGFBQWEsT0FBTztBQUFBLE1BQ3REO0FBQUE7QUFBQTs7O0FDOURBO0FBQUE7QUFBQSxVQUFNLFFBQVE7QUFFZCxlQUFTLGVBQWdCLE9BQU8sUUFBUTtBQUN0QyxjQUFNLFFBQVEsTUFBTSxJQUFJO0FBQ3hCLGNBQU0sTUFBTSxTQUFTLE9BQU8sTUFBTSxNQUFNO0FBRXhDLGVBQU8sUUFBUSxJQUNYLE1BQU0sTUFBTSxTQUFTLGVBQWUsTUFBTSxRQUFRLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxNQUNoRTtBQUFBLE1BQ047QUFFQSxlQUFTLE9BQVEsS0FBSyxHQUFHLEdBQUc7QUFDMUIsWUFBSSxNQUFNLE1BQU07QUFDaEIsWUFBSSxPQUFPLE1BQU0sWUFBYSxRQUFPLE1BQU07QUFFM0MsZUFBTztBQUFBLE1BQ1Q7QUFFQSxlQUFTLFNBQVUsTUFBTSxNQUFNLFFBQVE7QUFDckMsWUFBSSxPQUFPO0FBQ1gsWUFBSSxTQUFTO0FBQ2IsWUFBSSxTQUFTO0FBQ2IsWUFBSSxhQUFhO0FBRWpCLGlCQUFTLElBQUksR0FBRyxJQUFJLEtBQUssUUFBUSxLQUFLO0FBQ3BDLGdCQUFNLE1BQU0sS0FBSyxNQUFNLElBQUksSUFBSTtBQUMvQixnQkFBTSxNQUFNLEtBQUssTUFBTSxJQUFJLElBQUk7QUFFL0IsY0FBSSxDQUFDLE9BQU8sQ0FBQyxPQUFRLFVBQVM7QUFFOUIsY0FBSSxLQUFLLENBQUMsR0FBRztBQUNYO0FBRUEsZ0JBQUksRUFBRSxJQUFJLEtBQUssTUFBTSxLQUFLLEtBQUssSUFBSSxDQUFDLElBQUk7QUFDdEMsc0JBQVEsU0FDSixPQUFPLEtBQUssTUFBTSxRQUFRLE1BQU0sTUFBTSxNQUFNLElBQzVDLE9BQU8sS0FBSyxRQUFRLENBQUM7QUFFekIsdUJBQVM7QUFDVCx1QkFBUztBQUFBLFlBQ1g7QUFFQSxnQkFBSSxFQUFFLE1BQU0sSUFBSSxRQUFRLEtBQUssSUFBSSxDQUFDLElBQUk7QUFDcEMsc0JBQVEsT0FBTyxLQUFLLFVBQVU7QUFDOUIsMkJBQWE7QUFBQSxZQUNmO0FBQUEsVUFDRixPQUFPO0FBQ0w7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBRUEsY0FBUSxTQUFTLFNBQVNDLFFBQVEsUUFBUSxTQUFTLElBQUk7QUFDckQsY0FBTSxPQUFPLE1BQU0sV0FBVyxPQUFPO0FBQ3JDLGNBQU0sT0FBTyxPQUFPLFFBQVE7QUFDNUIsY0FBTSxPQUFPLE9BQU8sUUFBUTtBQUM1QixjQUFNLGFBQWEsT0FBTyxLQUFLLFNBQVM7QUFFeEMsY0FBTSxLQUFLLENBQUMsS0FBSyxNQUFNLE1BQU0sSUFDekIsS0FDQSxXQUFXLGVBQWUsS0FBSyxNQUFNLE9BQU8sTUFBTSxJQUNsRCxjQUFjLGFBQWEsTUFBTSxhQUFhO0FBRWxELGNBQU0sT0FDSixXQUFXLGVBQWUsS0FBSyxNQUFNLE1BQU0sUUFBUSxJQUNuRCxTQUFTLFNBQVMsTUFBTSxNQUFNLEtBQUssTUFBTSxJQUFJO0FBRS9DLGNBQU0sVUFBVSxrQkFBdUIsYUFBYSxNQUFNLGFBQWE7QUFFdkUsY0FBTSxRQUFRLENBQUMsS0FBSyxRQUFRLEtBQUssWUFBWSxLQUFLLFFBQVEsZUFBZSxLQUFLLFFBQVE7QUFFdEYsY0FBTSxTQUFTLDZDQUE2QyxRQUFRLFVBQVUsbUNBQW1DLEtBQUssT0FBTztBQUU3SCxZQUFJLE9BQU8sT0FBTyxZQUFZO0FBQzVCLGFBQUcsTUFBTSxNQUFNO0FBQUEsUUFDakI7QUFFQSxlQUFPO0FBQUEsTUFDVDtBQUFBO0FBQUE7OztBQ2hGQTtBQUFBO0FBQ0EsVUFBTSxhQUFhO0FBRW5CLFVBQU1DLFVBQVM7QUFDZixVQUFNLGlCQUFpQjtBQUN2QixVQUFNLGNBQWM7QUFFcEIsZUFBUyxhQUFjLFlBQVksUUFBUSxNQUFNLE1BQU0sSUFBSTtBQUN6RCxjQUFNLE9BQU8sQ0FBQyxFQUFFLE1BQU0sS0FBSyxXQUFXLENBQUM7QUFDdkMsY0FBTSxVQUFVLEtBQUs7QUFDckIsY0FBTSxjQUFjLE9BQU8sS0FBSyxVQUFVLENBQUMsTUFBTTtBQUVqRCxZQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsR0FBRztBQUNqQyxnQkFBTSxJQUFJLE1BQU0sb0NBQW9DO0FBQUEsUUFDdEQ7QUFFQSxZQUFJLGFBQWE7QUFDZixjQUFJLFVBQVUsR0FBRztBQUNmLGtCQUFNLElBQUksTUFBTSw0QkFBNEI7QUFBQSxVQUM5QztBQUVBLGNBQUksWUFBWSxHQUFHO0FBQ2pCLGlCQUFLO0FBQ0wsbUJBQU87QUFDUCxxQkFBUyxPQUFPO0FBQUEsVUFDbEIsV0FBVyxZQUFZLEdBQUc7QUFDeEIsZ0JBQUksT0FBTyxjQUFjLE9BQU8sT0FBTyxhQUFhO0FBQ2xELG1CQUFLO0FBQ0wscUJBQU87QUFBQSxZQUNULE9BQU87QUFDTCxtQkFBSztBQUNMLHFCQUFPO0FBQ1AscUJBQU87QUFDUCx1QkFBUztBQUFBLFlBQ1g7QUFBQSxVQUNGO0FBQUEsUUFDRixPQUFPO0FBQ0wsY0FBSSxVQUFVLEdBQUc7QUFDZixrQkFBTSxJQUFJLE1BQU0sNEJBQTRCO0FBQUEsVUFDOUM7QUFFQSxjQUFJLFlBQVksR0FBRztBQUNqQixtQkFBTztBQUNQLHFCQUFTLE9BQU87QUFBQSxVQUNsQixXQUFXLFlBQVksS0FBSyxDQUFDLE9BQU8sWUFBWTtBQUM5QyxtQkFBTztBQUNQLG1CQUFPO0FBQ1AscUJBQVM7QUFBQSxVQUNYO0FBRUEsaUJBQU8sSUFBSSxRQUFRLFNBQVUsU0FBUyxRQUFRO0FBQzVDLGdCQUFJO0FBQ0Ysb0JBQU0sT0FBT0EsUUFBTyxPQUFPLE1BQU0sSUFBSTtBQUNyQyxzQkFBUSxXQUFXLE1BQU0sUUFBUSxJQUFJLENBQUM7QUFBQSxZQUN4QyxTQUFTLEdBQUc7QUFDVixxQkFBTyxDQUFDO0FBQUEsWUFDVjtBQUFBLFVBQ0YsQ0FBQztBQUFBLFFBQ0g7QUFFQSxZQUFJO0FBQ0YsZ0JBQU0sT0FBT0EsUUFBTyxPQUFPLE1BQU0sSUFBSTtBQUNyQyxhQUFHLE1BQU0sV0FBVyxNQUFNLFFBQVEsSUFBSSxDQUFDO0FBQUEsUUFDekMsU0FBUyxHQUFHO0FBQ1YsYUFBRyxDQUFDO0FBQUEsUUFDTjtBQUFBLE1BQ0Y7QUFFQSxjQUFRLFNBQVNBLFFBQU87QUFDeEIsY0FBUSxXQUFXLGFBQWEsS0FBSyxNQUFNLGVBQWUsTUFBTTtBQUNoRSxjQUFRLFlBQVksYUFBYSxLQUFLLE1BQU0sZUFBZSxlQUFlO0FBRzFFLGNBQVEsV0FBVyxhQUFhLEtBQUssTUFBTSxTQUFVLE1BQU0sR0FBRyxNQUFNO0FBQ2xFLGVBQU8sWUFBWSxPQUFPLE1BQU0sSUFBSTtBQUFBLE1BQ3RDLENBQUM7QUFBQTtBQUFBOzs7QUMzREQsTUFBTSxXQUNGLE9BQU8sWUFBWSxjQUFjLFVBQ2pDLE9BQU8sV0FBWSxjQUFjLFNBQ2pDO0FBRUosTUFBSSxDQUFDLFVBQVU7QUFDWCxVQUFNLElBQUksTUFBTSxrRkFBa0Y7QUFBQSxFQUN0RztBQU1BLE1BQU0sV0FBVyxPQUFPLFlBQVksZUFBZSxPQUFPLFdBQVc7QUFNckUsV0FBUyxVQUFVLFNBQVMsUUFBUTtBQUNoQyxXQUFPLElBQUksU0FBUztBQUloQixVQUFJO0FBQ0EsY0FBTSxTQUFTLE9BQU8sTUFBTSxTQUFTLElBQUk7QUFDekMsWUFBSSxVQUFVLE9BQU8sT0FBTyxTQUFTLFlBQVk7QUFDN0MsaUJBQU87QUFBQSxRQUNYO0FBQUEsTUFDSixTQUFTLEdBQUc7QUFBQSxNQUVaO0FBRUEsYUFBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFDcEMsZUFBTyxNQUFNLFNBQVM7QUFBQSxVQUNsQixHQUFHO0FBQUEsVUFDSCxJQUFJLFdBQVc7QUFDWCxnQkFBSSxTQUFTLFdBQVcsU0FBUyxRQUFRLFdBQVc7QUFDaEQscUJBQU8sSUFBSSxNQUFNLFNBQVMsUUFBUSxVQUFVLE9BQU8sQ0FBQztBQUFBLFlBQ3hELE9BQU87QUFDSCxzQkFBUSxPQUFPLFVBQVUsSUFBSSxPQUFPLENBQUMsSUFBSSxNQUFNO0FBQUEsWUFDbkQ7QUFBQSxVQUNKO0FBQUEsUUFDSixDQUFDO0FBQUEsTUFDTCxDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0o7QUFNQSxNQUFNLE1BQU0sQ0FBQztBQUdiLE1BQUksVUFBVTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBSVYsZUFBZSxNQUFNO0FBQ2pCLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLFFBQVEsWUFBWSxHQUFHLElBQUk7QUFBQSxNQUMvQztBQUNBLGFBQU8sVUFBVSxTQUFTLFNBQVMsU0FBUyxRQUFRLFdBQVcsRUFBRSxHQUFHLElBQUk7QUFBQSxJQUM1RTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBUUEsV0FBVyxTQUFTLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUs1QixPQUFPLE1BQU07QUFDVCxhQUFPLFNBQVMsUUFBUSxPQUFPLElBQUk7QUFBQSxJQUN2QztBQUFBO0FBQUE7QUFBQTtBQUFBLElBS0Esa0JBQWtCO0FBQ2QsVUFBSSxDQUFDLFVBQVU7QUFDWCxlQUFPLFNBQVMsUUFBUSxnQkFBZ0I7QUFBQSxNQUM1QztBQUNBLGFBQU8sVUFBVSxTQUFTLFNBQVMsU0FBUyxRQUFRLGVBQWUsRUFBRTtBQUFBLElBQ3pFO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLQSxJQUFJLEtBQUs7QUFDTCxhQUFPLFNBQVMsUUFBUTtBQUFBLElBQzVCO0FBQUEsRUFDSjtBQUdBLE1BQUksVUFBVTtBQUFBLElBQ1YsT0FBTztBQUFBLE1BQ0gsT0FBTyxNQUFNO0FBQ1QsWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsTUFBTSxJQUFJLEdBQUcsSUFBSTtBQUFBLFFBQzdDO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxPQUFPLFNBQVMsUUFBUSxNQUFNLEdBQUcsRUFBRSxHQUFHLElBQUk7QUFBQSxNQUNoRjtBQUFBLE1BQ0EsT0FBTyxNQUFNO0FBQ1QsWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsTUFBTSxJQUFJLEdBQUcsSUFBSTtBQUFBLFFBQzdDO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxPQUFPLFNBQVMsUUFBUSxNQUFNLEdBQUcsRUFBRSxHQUFHLElBQUk7QUFBQSxNQUNoRjtBQUFBLE1BQ0EsU0FBUyxNQUFNO0FBQ1gsWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsTUFBTSxNQUFNLEdBQUcsSUFBSTtBQUFBLFFBQy9DO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxPQUFPLFNBQVMsUUFBUSxNQUFNLEtBQUssRUFBRSxHQUFHLElBQUk7QUFBQSxNQUNsRjtBQUFBLE1BQ0EsVUFBVSxNQUFNO0FBQ1osWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsTUFBTSxPQUFPLEdBQUcsSUFBSTtBQUFBLFFBQ2hEO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxPQUFPLFNBQVMsUUFBUSxNQUFNLE1BQU0sRUFBRSxHQUFHLElBQUk7QUFBQSxNQUNuRjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBR0EsTUFBSSxPQUFPO0FBQUEsSUFDUCxVQUFVLE1BQU07QUFDWixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxLQUFLLE9BQU8sR0FBRyxJQUFJO0FBQUEsTUFDdkM7QUFDQSxhQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDakU7QUFBQSxJQUNBLFNBQVMsTUFBTTtBQUNYLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLEtBQUssTUFBTSxHQUFHLElBQUk7QUFBQSxNQUN0QztBQUNBLGFBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLEtBQUssRUFBRSxHQUFHLElBQUk7QUFBQSxJQUNoRTtBQUFBLElBQ0EsVUFBVSxNQUFNO0FBQ1osVUFBSSxDQUFDLFVBQVU7QUFDWCxlQUFPLFNBQVMsS0FBSyxPQUFPLEdBQUcsSUFBSTtBQUFBLE1BQ3ZDO0FBQ0EsYUFBTyxVQUFVLFNBQVMsTUFBTSxTQUFTLEtBQUssTUFBTSxFQUFFLEdBQUcsSUFBSTtBQUFBLElBQ2pFO0FBQUEsSUFDQSxVQUFVLE1BQU07QUFDWixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxLQUFLLE9BQU8sR0FBRyxJQUFJO0FBQUEsTUFDdkM7QUFDQSxhQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDakU7QUFBQSxJQUNBLE9BQU8sTUFBTTtBQUNULFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxNQUNwQztBQUNBLGFBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLEdBQUcsRUFBRSxHQUFHLElBQUk7QUFBQSxJQUM5RDtBQUFBLElBQ0EsY0FBYyxNQUFNO0FBQ2hCLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLEtBQUssV0FBVyxHQUFHLElBQUk7QUFBQSxNQUMzQztBQUNBLGFBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLFVBQVUsRUFBRSxHQUFHLElBQUk7QUFBQSxJQUNyRTtBQUFBLEVBQ0o7OztBQ3BMQSxNQUFNLGFBQWE7QUFDbkIsTUFBTSxVQUFVLElBQUksUUFBUTtBQUNyQixNQUFNLHFCQUFxQjtBQUFBLElBQzlCLElBQUksSUFBSSxzQkFBc0I7QUFBQSxJQUM5QixJQUFJLElBQUksd0JBQXdCO0FBQUEsSUFDaEMsSUFBSSxJQUFJLDBCQUEwQjtBQUFBLElBQ2xDLElBQUksSUFBSSw0QkFBNEI7QUFBQSxJQUNwQyxJQUFJLElBQUksZUFBZTtBQUFBLElBQ3ZCLElBQUksSUFBSSxjQUFjO0FBQUEsSUFDdEIsSUFBSSxJQUFJLDRCQUE0QjtBQUFBLEVBQ3hDO0FBRU8sTUFBTSxRQUFRO0FBQUEsSUFDakIsQ0FBQyxHQUFHLFlBQVksMERBQTBEO0FBQUEsSUFDMUUsQ0FBQyxHQUFHLFFBQVEsMERBQTBEO0FBQUEsSUFDdEUsQ0FBQyxHQUFHLG1CQUFtQiwwREFBMEQ7QUFBQSxJQUNqRixDQUFDLEdBQUcsWUFBWSwwREFBMEQ7QUFBQSxJQUMxRSxDQUFDLEdBQUcsNkJBQTZCLDBEQUEwRDtBQUFBLElBQzNGLENBQUMsR0FBRyxrQkFBa0IsMERBQTBEO0FBQUEsSUFDaEYsQ0FBQyxHQUFHLFVBQVUsMERBQTBEO0FBQUEsSUFDeEUsQ0FBQyxHQUFHLFlBQVksMERBQTBEO0FBQUEsSUFDMUUsQ0FBQyxHQUFHLGVBQWUsMERBQTBEO0FBQUEsSUFDN0UsQ0FBQyxJQUFJLGtCQUFrQiwwREFBMEQ7QUFBQSxJQUNqRixDQUFDLElBQUksb0JBQW9CLDBEQUEwRDtBQUFBLElBQ25GLENBQUMsSUFBSSxvQkFBb0IsMERBQTBEO0FBQUEsSUFDbkYsQ0FBQyxJQUFJLG1CQUFtQiwwREFBMEQ7QUFBQSxJQUNsRixDQUFDLElBQUksd0JBQXdCLDBEQUEwRDtBQUFBLElBQ3ZGLENBQUMsSUFBSSxxQkFBcUIsMERBQTBEO0FBQUEsSUFDcEYsQ0FBQyxNQUFNLGlCQUFpQiwwREFBMEQ7QUFBQSxJQUNsRixDQUFDLE1BQU0scUJBQXFCLDBEQUEwRDtBQUFBLElBQ3RGLENBQUMsTUFBTSxhQUFhLDBEQUEwRDtBQUFBLElBQzlFLENBQUMsTUFBTSxTQUFTLDBEQUEwRDtBQUFBLElBQzFFLENBQUMsTUFBTSwyQkFBMkIsMERBQTBEO0FBQUEsSUFDNUYsQ0FBQyxLQUFNLGdCQUFnQiwwREFBMEQ7QUFBQSxJQUNqRixDQUFDLE1BQU0sWUFBWSwwREFBMEQ7QUFBQSxJQUM3RSxDQUFDLE1BQU0sZUFBZSwwREFBMEQ7QUFBQSxJQUNoRixDQUFDLE1BQU0sT0FBTywwREFBMEQ7QUFBQSxJQUN4RSxDQUFDLEtBQU8sYUFBYSwwREFBMEQ7QUFBQSxJQUMvRSxDQUFDLE9BQU8sWUFBWSwwREFBMEQ7QUFBQSxJQUM5RSxDQUFDLE9BQU8sdUJBQXVCLDBEQUEwRDtBQUFBLElBQ3pGLENBQUMsT0FBTyxlQUFlLDBEQUEwRDtBQUFBLElBQ2pGLENBQUMsT0FBTyx5QkFBeUIsMERBQTBEO0FBQUEsSUFDM0YsQ0FBQyxPQUFPLGtCQUFrQiwwREFBMEQ7QUFBQSxJQUNwRixDQUFDLE9BQU8sbUJBQW1CLDBEQUEwRDtBQUFBLElBQ3JGLENBQUMsT0FBTyxpQkFBaUIsMERBQTBEO0FBQUEsSUFDbkYsQ0FBQyxPQUFPLGFBQWEsMERBQTBEO0FBQUEsSUFDL0UsQ0FBQyxLQUFPLDJCQUEyQiwwREFBMEQ7QUFBQSxJQUM3RixDQUFDLE9BQU8sNkJBQTZCLDBEQUEwRDtBQUFBLElBQy9GLENBQUMsT0FBTyxrQkFBa0IsMERBQTBEO0FBQUEsSUFDcEYsQ0FBQyxPQUFPLG9CQUFvQiwwREFBMEQ7QUFBQSxJQUN0RixDQUFDLE9BQU8sNEJBQTRCLDBEQUEwRDtBQUFBLElBQzlGLENBQUMsT0FBTyw4QkFBOEIsMERBQTBEO0FBQUEsSUFDaEcsQ0FBQyxPQUFPLHFCQUFxQiwwREFBMEQ7QUFBQSxJQUN2RixDQUFDLE9BQU8sMkJBQTJCLDBEQUEwRDtBQUFBLElBQzdGLENBQUMsT0FBTyw2QkFBNkIsMERBQTBEO0FBQUEsSUFDL0YsQ0FBQyxPQUFPLGNBQWMsMERBQTBEO0FBQUEsSUFDaEYsQ0FBQyxPQUFPLGlCQUFpQiwwREFBMEQ7QUFBQSxJQUNuRixDQUFDLE9BQU8sc0JBQXNCLDBEQUEwRDtBQUFBLElBQ3hGLENBQUMsT0FBTyw0QkFBNEIsMERBQTBEO0FBQUEsSUFDOUYsQ0FBQyxPQUFPLDZCQUE2QiwwREFBMEQ7QUFBQSxJQUMvRixDQUFDLE9BQU8sNkJBQTZCLDBEQUEwRDtBQUFBLElBQy9GLENBQUMsT0FBTyxZQUFZLDBEQUEwRDtBQUFBLElBQzlFLENBQUMsT0FBTyx1QkFBdUIsMERBQTBEO0FBQUEsSUFDekYsQ0FBQyxPQUFPLDBCQUEwQiwwREFBMEQ7QUFBQSxJQUM1RixDQUFDLE9BQU8sdUJBQXVCLDBEQUEwRDtBQUFBLElBQ3pGLENBQUMsT0FBTyx3QkFBd0IsMERBQTBEO0FBQUEsRUFDOUY7QUFFQSxpQkFBc0IsYUFBYTtBQUMvQixVQUFNLGdCQUFnQixnQkFBZ0IsQ0FBQztBQUN2QyxVQUFNLGdCQUFnQixZQUFZLENBQUMsTUFBTSxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzNELFFBQUksV0FBVyxNQUFNLFFBQVEsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLEdBQUc7QUFDbEQsWUFBUSxJQUFJLGdCQUFnQixPQUFPO0FBQ25DLFdBQU8sVUFBVSxZQUFZO0FBQ3pCLGdCQUFVLE1BQU0sUUFBUSxTQUFTLFVBQVU7QUFDM0MsWUFBTSxRQUFRLElBQUksRUFBRSxRQUFRLENBQUM7QUFBQSxJQUNqQztBQUFBLEVBQ0o7QUFFQSxpQkFBZSxRQUFRLFNBQVMsTUFBTTtBQUNsQyxRQUFJLFlBQVksR0FBRztBQUNmLGNBQVEsSUFBSSx5QkFBeUI7QUFDckMsVUFBSSxXQUFXLE1BQU0sWUFBWTtBQUNqQyxlQUFTLFFBQVEsYUFBWSxRQUFRLFFBQVEsQ0FBQyxDQUFFO0FBQ2hELFlBQU0sUUFBUSxJQUFJLEVBQUUsU0FBUyxDQUFDO0FBQzlCLGFBQU8sVUFBVTtBQUFBLElBQ3JCO0FBRUEsUUFBSSxZQUFZLEdBQUc7QUFDZixjQUFRLElBQUkseUJBQXlCO0FBQ3JDLFVBQUksV0FBVyxNQUFNLFlBQVk7QUFDakMsWUFBTSxRQUFRLElBQUksRUFBRSxTQUFTLENBQUM7QUFDOUIsYUFBTyxVQUFVO0FBQUEsSUFDckI7QUFFQSxRQUFJLFlBQVksR0FBRztBQUNmLGNBQVEsSUFBSSx5QkFBeUI7QUFDckMsVUFBSSxXQUFXLE1BQU0sWUFBWTtBQUNqQyxlQUFTLFFBQVEsYUFBWSxRQUFRLGdCQUFnQixJQUFLO0FBQzFELFlBQU0sUUFBUSxJQUFJLEVBQUUsU0FBUyxDQUFDO0FBQzlCLGFBQU8sVUFBVTtBQUFBLElBQ3JCO0FBRUEsUUFBSSxZQUFZLEdBQUc7QUFDZixjQUFRLElBQUksOENBQThDO0FBSTFELFVBQUksT0FBTyxNQUFNLFFBQVEsSUFBSSxFQUFFLGFBQWEsTUFBTSxDQUFDO0FBQ25ELFVBQUksQ0FBQyxLQUFLLGFBQWE7QUFDbkIsY0FBTSxRQUFRLElBQUksRUFBRSxhQUFhLE1BQU0sQ0FBQztBQUFBLE1BQzVDO0FBQ0EsYUFBTyxVQUFVO0FBQUEsSUFDckI7QUFFQSxRQUFJLFlBQVksR0FBRztBQUNmLGNBQVEsSUFBSSxpREFBaUQ7QUFDN0QsVUFBSSxXQUFXLE1BQU0sWUFBWTtBQUNqQyxlQUFTLFFBQVEsYUFBVztBQUN4QixZQUFJLENBQUMsUUFBUSxLQUFNLFNBQVEsT0FBTztBQUNsQyxZQUFJLFFBQVEsY0FBYyxPQUFXLFNBQVEsWUFBWTtBQUN6RCxZQUFJLFFBQVEsaUJBQWlCLE9BQVcsU0FBUSxlQUFlO0FBQUEsTUFDbkUsQ0FBQztBQUNELFlBQU0sUUFBUSxJQUFJLEVBQUUsU0FBUyxDQUFDO0FBQzlCLGFBQU8sVUFBVTtBQUFBLElBQ3JCO0FBQUEsRUFDSjtBQUVBLGlCQUFzQixjQUFjO0FBQ2hDLFFBQUksV0FBVyxNQUFNLFFBQVEsSUFBSSxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUM7QUFDakQsV0FBTyxTQUFTO0FBQUEsRUFDcEI7QUFFQSxpQkFBc0IsV0FBVyxPQUFPO0FBQ3BDLFFBQUksV0FBVyxNQUFNLFlBQVk7QUFDakMsV0FBTyxTQUFTLEtBQUs7QUFBQSxFQUN6QjtBQUVBLGlCQUFzQixrQkFBa0I7QUFDcEMsUUFBSSxXQUFXLE1BQU0sWUFBWTtBQUNqQyxXQUFPLFNBQVMsSUFBSSxPQUFLLEVBQUUsSUFBSTtBQUFBLEVBQ25DO0FBRUEsaUJBQXNCLGtCQUFrQjtBQUNwQyxVQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksRUFBRSxjQUFjLEVBQUUsQ0FBQztBQUNuRCxXQUFPLE1BQU07QUFBQSxFQUNqQjtBQXFCQSxpQkFBc0IsWUFBWTtBQUM5QixRQUFJLG9CQUFvQixNQUFNLFFBQVEsSUFBSSxFQUFFLG1CQUFtQixNQUFNLENBQUM7QUFDdEUsVUFBTSxRQUFRLE1BQU07QUFDcEIsVUFBTSxRQUFRLElBQUksaUJBQWlCO0FBQUEsRUFDdkM7QUFFQSxpQkFBZSxxQkFBcUI7QUFDaEMsV0FBTyxNQUFNLElBQUksUUFBUSxZQUFZLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUFBLEVBQ3ZFO0FBRUEsaUJBQXNCLGdCQUFnQixPQUFPLHlCQUF5QixPQUFPLFNBQVM7QUFDbEYsV0FBTztBQUFBLE1BQ0g7QUFBQSxNQUNBLFNBQVMsU0FBUyxVQUFVLE1BQU0sbUJBQW1CLElBQUk7QUFBQSxNQUN6RCxPQUFPLENBQUM7QUFBQSxNQUNSLFFBQVEsbUJBQW1CLElBQUksUUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLE1BQU0sTUFBTSxPQUFPLEtBQUssRUFBRTtBQUFBLE1BQzlFLGVBQWU7QUFBQSxNQUNmO0FBQUEsTUFDQSxXQUFXO0FBQUEsTUFDWCxjQUFjO0FBQUEsSUFDbEI7QUFBQSxFQUNKO0FBRUEsaUJBQWUsZ0JBQWdCLEtBQUssS0FBSztBQUNyQyxRQUFJLE9BQU8sTUFBTSxRQUFRLElBQUksR0FBRyxHQUFHLEdBQUc7QUFDdEMsUUFBSSxPQUFPLFFBQVEsT0FBTyxRQUFXO0FBQ2pDLFlBQU0sUUFBUSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQ2hDLGFBQU87QUFBQSxJQUNYO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFFQSxpQkFBc0IsZ0JBQWdCLE9BQU8sYUFBYTtBQUN0RCxRQUFJLFdBQVcsTUFBTSxZQUFZO0FBQ2pDLGFBQVMsS0FBSyxFQUFFLE9BQU87QUFDdkIsVUFBTSxRQUFRLElBQUksRUFBRSxTQUFTLENBQUM7QUFBQSxFQUNsQztBQUVBLGlCQUFzQixlQUFlLE9BQU8sWUFBWTtBQUNwRCxVQUFNLElBQUksUUFBUSxZQUFZO0FBQUEsTUFDMUIsTUFBTTtBQUFBLE1BQ04sU0FBUyxDQUFDLE9BQU8sVUFBVTtBQUFBLElBQy9CLENBQUM7QUFBQSxFQUNMO0FBVUEsaUJBQXNCLGlCQUFpQixPQUFPLGNBQWMsWUFBWSxNQUFNO0FBQzFFLFFBQUksV0FBVyxNQUFNLFlBQVk7QUFDakMsVUFBTSxVQUFVLE1BQU0sZ0JBQWdCLE1BQU0sUUFBUTtBQUNwRCxZQUFRLFlBQVk7QUFDcEIsYUFBUyxLQUFLLE9BQU87QUFDckIsVUFBTSxRQUFRLElBQUksRUFBRSxTQUFTLENBQUM7QUFDOUIsV0FBTyxTQUFTLFNBQVM7QUFBQSxFQUM3QjtBQUVBLGlCQUFzQixVQUFVLGNBQWM7QUFDMUMsUUFBSSxVQUFVLE1BQU0sV0FBVyxZQUFZO0FBQzNDLFdBQU8sUUFBUSxVQUFVLENBQUM7QUFBQSxFQUM5QjtBQUVBLGlCQUFzQixXQUFXLGNBQWMsUUFBUTtBQUluRCxRQUFJLGNBQWMsS0FBSyxNQUFNLEtBQUssVUFBVSxNQUFNLENBQUM7QUFDbkQsUUFBSSxXQUFXLE1BQU0sWUFBWTtBQUNqQyxRQUFJLFVBQVUsU0FBUyxZQUFZO0FBQ25DLFlBQVEsU0FBUztBQUNqQixVQUFNLFFBQVEsSUFBSSxFQUFFLFNBQVMsQ0FBQztBQUFBLEVBQ2xDO0FBTUEsaUJBQXNCLGVBQWUsUUFBUSxNQUFNO0FBQy9DLFFBQUksU0FBUyxNQUFNO0FBQ2YsY0FBUSxNQUFNLGdCQUFnQjtBQUFBLElBQ2xDO0FBQ0EsUUFBSSxVQUFVLE1BQU0sV0FBVyxLQUFLO0FBQ3BDLFFBQUksUUFBUSxNQUFNLFFBQVE7QUFDMUIsV0FBTztBQUFBLEVBQ1g7QUFRQSxpQkFBc0IsY0FBYyxNQUFNLFFBQVEsTUFBTSxRQUFRLE1BQU07QUFDbEUsUUFBSSxXQUFXLE1BQU0sWUFBWTtBQUNqQyxRQUFJLENBQUMsT0FBTztBQUNSLGNBQVEsTUFBTSxnQkFBZ0I7QUFBQSxJQUNsQztBQUNBLFFBQUksVUFBVSxTQUFTLEtBQUs7QUFDNUIsUUFBSSxXQUFXLFFBQVEsTUFBTSxJQUFJLEtBQUssQ0FBQztBQUN2QyxlQUFXLEVBQUUsR0FBRyxVQUFVLENBQUMsTUFBTSxHQUFHLEtBQUs7QUFDekMsWUFBUSxNQUFNLElBQUksSUFBSTtBQUN0QixhQUFTLEtBQUssSUFBSTtBQUNsQixVQUFNLFFBQVEsSUFBSSxFQUFFLFNBQVMsQ0FBQztBQUFBLEVBQ2xDO0FBRU8sV0FBUyxnQkFBZ0IsR0FBRztBQUUvQixRQUFJLEVBQUUsV0FBVyxZQUFZLEdBQUc7QUFDNUIsVUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxHQUFHO0FBQ3hCLFVBQUksU0FBUyxDQUFDO0FBQ2QsVUFBSSxRQUFRLE1BQU0sS0FBSyxPQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssaUJBQWlCLENBQUM7QUFDbEUsYUFBTyxlQUFlLEtBQUs7QUFBQSxJQUMvQjtBQUVBLFlBQVEsR0FBRztBQUFBLE1BQ1AsS0FBSztBQUNELGVBQU87QUFBQSxNQUNYLEtBQUs7QUFDRCxlQUFPO0FBQUEsTUFDWCxLQUFLO0FBQ0QsZUFBTztBQUFBLE1BQ1gsS0FBSztBQUNELGVBQU87QUFBQSxNQUNYLEtBQUs7QUFDRCxlQUFPO0FBQUEsTUFDWCxLQUFLO0FBQ0QsZUFBTztBQUFBLE1BQ1gsS0FBSztBQUNELGVBQU87QUFBQSxNQUNYO0FBQ0ksZUFBTztBQUFBLElBQ2Y7QUFBQSxFQUNKO0FBRU8sV0FBUyxZQUFZLEtBQUs7QUFDN0IsVUFBTSxXQUFXLGlCQUFpQixLQUFLLEdBQUc7QUFDMUMsVUFBTSxXQUFXLGdEQUFnRCxLQUFLLEdBQUc7QUFFekUsV0FBTyxZQUFZLFlBQVksWUFBWSxHQUFHO0FBQUEsRUFDbEQ7QUFFTyxXQUFTLFlBQVksS0FBSztBQUM3QixXQUFPLGtEQUFrRCxLQUFLLEdBQUc7QUFBQSxFQUNyRTs7O0FDeFNBLHNCQUFtQjtBQUduQixNQUFNLFFBQVE7QUFBQSxJQUNWLGNBQWMsQ0FBQyxLQUFLO0FBQUEsSUFDcEIsY0FBYztBQUFBLElBQ2QsYUFBYTtBQUFBLElBQ2IscUJBQXFCO0FBQUEsSUFDckIsU0FBUztBQUFBLElBQ1QsaUJBQWlCO0FBQUEsSUFDakIsUUFBUTtBQUFBLElBQ1IsUUFBUSxDQUFDO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixrQkFBa0I7QUFBQSxJQUNsQixhQUFhLENBQUM7QUFBQSxJQUNkLE1BQU07QUFBQSxJQUNOLFdBQVcsQ0FBQztBQUFBLElBQ1osV0FBVyxDQUFDO0FBQUEsSUFDWixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUE7QUFBQSxJQUdSLGVBQWU7QUFBQSxJQUNmLGVBQWU7QUFBQSxJQUNmLFlBQVk7QUFBQTtBQUFBLElBR1osbUJBQW1CO0FBQUEsSUFDbkIsZ0JBQWdCO0FBQUEsSUFDaEIsa0JBQWtCO0FBQUEsSUFDbEIseUJBQXlCO0FBQUEsSUFDekIsd0JBQXdCO0FBQUEsSUFDeEIsdUJBQXVCO0FBQUEsSUFDdkIsc0JBQXNCO0FBQUEsSUFDdEIsd0JBQXdCO0FBQUEsSUFDeEIsdUJBQXVCO0FBQUE7QUFBQSxJQUd2QixhQUFhO0FBQUEsSUFDYixXQUFXO0FBQUEsSUFDWCxpQkFBaUI7QUFBQSxJQUNqQixhQUFhO0FBQUEsSUFDYixrQkFBa0I7QUFBQSxJQUNsQixjQUFjO0FBQUE7QUFBQSxJQUdkLGlCQUFpQjtBQUFBO0FBQUEsSUFHakIsYUFBYTtBQUFBLElBQ2IsaUJBQWlCO0FBQUEsSUFDakIsYUFBYTtBQUFBLElBQ2IsaUJBQWlCO0FBQUEsSUFDakIscUJBQXFCO0FBQUEsSUFDckIsZUFBZTtBQUFBLElBQ2YsaUJBQWlCO0FBQUEsSUFDakIsYUFBYTtBQUFBLEVBQ2pCO0FBR0EsTUFBTSxXQUFXLENBQUM7QUFFbEIsV0FBUyxFQUFFLElBQUk7QUFDWCxXQUFPLFNBQVMsZUFBZSxFQUFFO0FBQUEsRUFDckM7QUFFQSxXQUFTLGVBQWU7QUFFcEIsYUFBUyxnQkFBZ0IsRUFBRSxVQUFVO0FBQ3JDLGFBQVMsb0JBQW9CLEVBQUUsb0JBQW9CO0FBQ25ELGFBQVMsZUFBZSxTQUFTLGNBQWMsa0NBQWtDO0FBR2pGLGFBQVMsY0FBYyxTQUFTLGNBQWMsdUJBQXVCO0FBQ3JFLGFBQVMsbUJBQW1CLEVBQUUsY0FBYztBQUM1QyxhQUFTLGVBQWUsRUFBRSxVQUFVO0FBQ3BDLGFBQVMsY0FBYyxFQUFFLFNBQVM7QUFDbEMsYUFBUyxtQkFBbUIsU0FBUyxjQUFjLGtDQUFrQztBQUNyRixhQUFTLGdCQUFnQixTQUFTLGNBQWMsNEJBQTRCO0FBQzVFLGFBQVMsaUJBQWlCLFNBQVMsY0FBYyw2QkFBNkI7QUFHOUUsYUFBUyxtQkFBbUIsU0FBUyxjQUFjLG1DQUFtQztBQUN0RixhQUFTLHlCQUF5QixFQUFFLG9CQUFvQjtBQUN4RCxhQUFTLGlCQUFpQixFQUFFLGlCQUFpQjtBQUM3QyxhQUFTLGFBQWEsU0FBUyxjQUFjLGtDQUFrQztBQUcvRSxhQUFTLGtCQUFrQixFQUFFLG1CQUFtQjtBQUNoRCxhQUFTLGNBQWMsRUFBRSxlQUFlO0FBQ3hDLGFBQVMsZ0JBQWdCLFNBQVMsY0FBYyw0QkFBNEI7QUFDNUUsYUFBUyxnQkFBZ0IsRUFBRSxpQkFBaUI7QUFDNUMsYUFBUyxjQUFjLEVBQUUsZUFBZTtBQUN4QyxhQUFTLGdCQUFnQixTQUFTLGNBQWMsNEJBQTRCO0FBRzVFLGFBQVMsMEJBQTBCLEVBQUUsMkJBQTJCO0FBQ2hFLGFBQVMseUJBQXlCLEVBQUUsMEJBQTBCO0FBQzlELGFBQVMsdUJBQXVCLEVBQUUsd0JBQXdCO0FBQzFELGFBQVMscUJBQXFCLFNBQVMsY0FBYyxpQ0FBaUM7QUFDdEYsYUFBUyx3QkFBd0IsRUFBRSx5QkFBeUI7QUFDNUQsYUFBUyxtQkFBbUIsU0FBUyxjQUFjLHFDQUFxQztBQUd4RixhQUFTLGdCQUFnQixTQUFTLGNBQWMseUJBQXlCO0FBQ3pFLGFBQVMseUJBQXlCLEVBQUUscUJBQXFCO0FBQ3pELGFBQVMsb0JBQW9CLFNBQVMsY0FBYyxnQ0FBZ0M7QUFDcEYsYUFBUyxpQkFBaUIsRUFBRSxZQUFZO0FBQ3hDLGFBQVMsbUJBQW1CLFNBQVMsY0FBYywrQkFBK0I7QUFDbEYsYUFBUyxzQkFBc0IsU0FBUyxjQUFjLGtDQUFrQztBQUN4RixhQUFTLGdCQUFnQixTQUFTLGNBQWMsNEJBQTRCO0FBQzVFLGFBQVMsZUFBZSxFQUFFLHlCQUF5QjtBQUNuRCxhQUFTLG1CQUFtQixFQUFFLG9CQUFvQjtBQUNsRCxhQUFTLGNBQWMsRUFBRSxjQUFjO0FBQ3ZDLGFBQVMsb0JBQW9CLEVBQUUsZUFBZTtBQUM5QyxhQUFTLHNCQUFzQixTQUFTLGNBQWMsa0NBQWtDO0FBR3hGLGFBQVMsY0FBYyxFQUFFLGNBQWM7QUFDdkMsYUFBUyxjQUFjLEVBQUUsY0FBYztBQUN2QyxhQUFTLHlCQUF5QixFQUFFLG1CQUFtQjtBQUN2RCxhQUFTLGdCQUFnQixFQUFFLFdBQVc7QUFDdEMsYUFBUyxjQUFjLFNBQVMsY0FBYywwQkFBMEI7QUFDeEUsYUFBUyxhQUFhLEVBQUUsYUFBYTtBQUdyQyxhQUFTLFlBQVksRUFBRSxZQUFZO0FBQ25DLGFBQVMsbUJBQW1CLEVBQUUsbUJBQW1CO0FBQ2pELGFBQVMsbUJBQW1CLEVBQUUsbUJBQW1CO0FBR2pELGFBQVMsaUJBQWlCLEVBQUUsaUJBQWlCO0FBQzdDLGFBQVMscUJBQXFCLEVBQUUsc0JBQXNCO0FBQ3RELGFBQVMsd0JBQXdCLEVBQUUseUJBQXlCO0FBQzVELGFBQVMsbUJBQW1CLEVBQUUsY0FBYztBQUM1QyxhQUFTLHVCQUF1QixFQUFFLGtCQUFrQjtBQUNwRCxhQUFTLG1CQUFtQixFQUFFLG1CQUFtQjtBQUNqRCxhQUFTLGdCQUFnQixFQUFFLGdCQUFnQjtBQUMzQyxhQUFTLGtCQUFrQixFQUFFLGtCQUFrQjtBQUMvQyxhQUFTLGlCQUFpQixTQUFTLGNBQWMsNkJBQTZCO0FBQzlFLGFBQVMsdUJBQXVCLEVBQUUsa0JBQWtCO0FBQ3BELGFBQVMseUJBQXlCLEVBQUUscUJBQXFCO0FBQ3pELGFBQVMsNkJBQTZCLEVBQUUseUJBQXlCO0FBQ2pFLGFBQVMsb0JBQW9CLFNBQVMsY0FBYyxnQ0FBZ0M7QUFDcEYsYUFBUyxzQkFBc0IsRUFBRSxpQkFBaUI7QUFDbEQsYUFBUyxjQUFjLEVBQUUsY0FBYztBQUN2QyxhQUFTLG9CQUFvQixTQUFTLGNBQWMsZ0NBQWdDO0FBR3BGLGFBQVMsdUJBQXVCLEVBQUUsa0JBQWtCO0FBQ3BELGFBQVMsY0FBYyxTQUFTLGNBQWMsMEJBQTBCO0FBQ3hFLGFBQVMsb0JBQW9CLFNBQVMsY0FBYyxnQ0FBZ0M7QUFHcEYsYUFBUyxXQUFXLEVBQUUsV0FBVztBQUNqQyxhQUFTLGVBQWUsU0FBUyxjQUFjLDJCQUEyQjtBQUFBLEVBQzlFO0FBR0EsV0FBUyxTQUFTO0FBQ2Qsd0JBQW9CO0FBQ3BCLHNCQUFrQjtBQUVsQixRQUFJLE1BQU0sZ0JBQWdCLFNBQVM7QUFDL0IseUJBQW1CO0FBQUEsSUFDdkIsT0FBTztBQUNILDBCQUFvQjtBQUFBLElBQ3hCO0FBRUEsaUJBQWE7QUFDYixzQkFBa0I7QUFDbEIsbUJBQWU7QUFDZiwwQkFBc0I7QUFDdEIsaUJBQWE7QUFBQSxFQUNqQjtBQUVBLFdBQVMsc0JBQXNCO0FBQzNCLFFBQUksQ0FBQyxTQUFTLGNBQWU7QUFFN0IsVUFBTSxlQUFlLE1BQU0saUJBQWlCLFFBQVEsTUFBTSxnQkFBZ0I7QUFFMUUsYUFBUyxjQUFjLFlBQ25CLCtCQUErQixDQUFDLGVBQWUsY0FBYyxNQUFNLGtDQUNuRSxNQUFNLGFBQ0QsSUFBSSxDQUFDLE1BQU0sTUFBTSxrQkFBa0IsQ0FBQyxJQUFJLE1BQU0sTUFBTSxnQkFBZ0IsZUFBZSxjQUFjLEVBQUUsSUFBSSxJQUFJLFdBQVcsRUFDdEgsS0FBSyxFQUFFO0FBR2hCLFFBQUksU0FBUyxtQkFBbUI7QUFDNUIsZUFBUyxrQkFBa0IsTUFBTSxVQUFVLGVBQWUsVUFBVTtBQUFBLElBQ3hFO0FBQUEsRUFDSjtBQUVBLFdBQVMsb0JBQW9CO0FBQ3pCLFVBQU0sVUFBVSxNQUFNLGdCQUFnQjtBQUV0QyxRQUFJLFNBQVMsYUFBYTtBQUN0QixlQUFTLFlBQVksTUFBTSxVQUFVLFVBQVUsVUFBVTtBQUFBLElBQzdEO0FBQ0EsUUFBSSxTQUFTLGVBQWU7QUFDeEIsZUFBUyxjQUFjLE1BQU0sVUFBVSxVQUFVLFNBQVM7QUFBQSxJQUM5RDtBQUFBLEVBQ0o7QUFFQSxXQUFTLHFCQUFxQjtBQUMxQixRQUFJLFNBQVMsa0JBQWtCO0FBQzNCLGVBQVMsaUJBQWlCLFFBQVEsTUFBTTtBQUFBLElBQzVDO0FBQ0EsUUFBSSxTQUFTLGNBQWM7QUFDdkIsZUFBUyxhQUFhLFFBQVEsTUFBTTtBQUNwQyxlQUFTLGFBQWEsT0FBTyxNQUFNLFVBQVUsU0FBUztBQUd0RCxZQUFNLFVBQVUsWUFBWSxNQUFNLE9BQU87QUFDekMsVUFBSSxNQUFNLFdBQVcsQ0FBQyxTQUFTO0FBQzNCLGlCQUFTLGFBQWEsVUFBVSxJQUFJLFVBQVUsZUFBZTtBQUFBLE1BQ2pFLE9BQU87QUFDSCxpQkFBUyxhQUFhLFVBQVUsT0FBTyxVQUFVLGVBQWU7QUFBQSxNQUNwRTtBQUFBLElBQ0o7QUFDQSxRQUFJLFNBQVMsYUFBYTtBQUN0QixlQUFTLFlBQVksUUFBUSxNQUFNO0FBQUEsSUFDdkM7QUFDQSxRQUFJLFNBQVMsa0JBQWtCO0FBQzNCLGVBQVMsaUJBQWlCLGNBQWMsTUFBTSxVQUFVLFNBQVM7QUFBQSxJQUNyRTtBQUdBLFVBQU0sZUFBZSxZQUFZLE1BQU0sT0FBTztBQUM5QyxRQUFJLFNBQVMsa0JBQWtCO0FBQzNCLGVBQVMsaUJBQWlCLE1BQU0sVUFBVSxlQUFlLFVBQVU7QUFBQSxJQUN2RTtBQUNBLFFBQUksU0FBUyxnQkFBZ0I7QUFDekIsZUFBUyxlQUFlLE1BQU0sVUFBVSxlQUFlLFNBQVM7QUFDaEUsWUFBTSxZQUFZLE1BQU0sWUFBWSxNQUFNLG1CQUFtQixNQUFNLGdCQUFnQixNQUFNO0FBQ3pGLGVBQVMsZUFBZSxXQUFXLENBQUMsYUFBYSxDQUFDLFlBQVksTUFBTSxPQUFPO0FBQUEsSUFDL0U7QUFHQSxRQUFJLFNBQVMsbUJBQW1CLE1BQU0sZUFBZTtBQUNqRCxlQUFTLGdCQUFnQixNQUFNLFVBQVU7QUFDekMsVUFBSSxTQUFTLGFBQWE7QUFDdEIsaUJBQVMsWUFBWSxNQUFNLE1BQU07QUFBQSxNQUNyQztBQUFBLElBQ0osV0FBVyxTQUFTLGlCQUFpQjtBQUNqQyxlQUFTLGdCQUFnQixNQUFNLFVBQVU7QUFBQSxJQUM3QztBQUVBLFFBQUksU0FBUyxlQUFlO0FBQ3hCLGVBQVMsY0FBYyxNQUFNLFVBQVUsTUFBTSxXQUFXLE1BQU0sV0FBVyxDQUFDLGVBQWUsVUFBVTtBQUFBLElBQ3ZHO0FBQ0EsUUFBSSxTQUFTLGVBQWU7QUFDeEIsZUFBUyxjQUFjLE1BQU0sVUFBVSxNQUFNLGNBQWMsTUFBTSxnQkFBZ0IsVUFBVTtBQUMzRixVQUFJLFNBQVMsZUFBZSxNQUFNLGVBQWU7QUFDN0MsaUJBQVMsWUFBWSxNQUFNLE1BQU07QUFBQSxNQUNyQztBQUFBLElBQ0o7QUFHQSxRQUFJLFNBQVMsb0JBQW9CO0FBQzdCLFlBQU0sWUFBWSxNQUFNLHdCQUF3QixVQUFVLEtBQ3pDLE1BQU0sNEJBQTRCLE1BQU07QUFDekQsZUFBUyxtQkFBbUIsV0FBVyxDQUFDLGFBQWEsTUFBTTtBQUMzRCxlQUFTLG1CQUFtQixjQUFjLE1BQU0seUJBQXlCLGtCQUFrQjtBQUFBLElBQy9GO0FBQ0EsUUFBSSxTQUFTLHVCQUF1QjtBQUNoQyxlQUFTLHNCQUFzQixRQUFRLE1BQU07QUFDN0MsZUFBUyxzQkFBc0IsY0FBYyxNQUFNLFVBQVUsTUFBTSx3QkFBd0IsVUFBVTtBQUFBLElBQ3pHO0FBQ0EsUUFBSSxTQUFTLGtCQUFrQjtBQUMzQixlQUFTLGlCQUFpQixjQUFjLE1BQU0sd0JBQXdCLFlBQVk7QUFBQSxJQUN0RjtBQUFBLEVBQ0o7QUFFQSxXQUFTLHNCQUFzQjtBQUMzQixRQUFJLFNBQVMsd0JBQXdCO0FBQ2pDLGVBQVMsdUJBQXVCLFFBQVEsTUFBTTtBQUFBLElBQ2xEO0FBQ0EsUUFBSSxTQUFTLGdCQUFnQjtBQUN6QixlQUFTLGVBQWUsUUFBUSxNQUFNO0FBQ3RDLGVBQVMsZUFBZSxXQUFXLE1BQU07QUFBQSxJQUM3QztBQUNBLFFBQUksU0FBUyxrQkFBa0I7QUFDM0IsZUFBUyxpQkFBaUIsTUFBTSxVQUFVLE1BQU0sa0JBQWtCLFNBQVM7QUFDM0UsZUFBUyxpQkFBaUIsV0FBVyxNQUFNLG9CQUFvQixDQUFDLE1BQU07QUFDdEUsZUFBUyxpQkFBaUIsY0FBYyxNQUFNLG1CQUFtQixrQkFBa0I7QUFBQSxJQUN2RjtBQUNBLFFBQUksU0FBUyxxQkFBcUI7QUFDOUIsZUFBUyxvQkFBb0IsTUFBTSxVQUFVLE1BQU0sa0JBQWtCLGlCQUFpQjtBQUFBLElBQzFGO0FBQ0EsUUFBSSxTQUFTLGVBQWU7QUFDeEIsZUFBUyxjQUFjLE1BQU0sVUFBVSxNQUFNLGtCQUFrQixpQkFBaUI7QUFBQSxJQUNwRjtBQUNBLFFBQUksU0FBUyxjQUFjO0FBQ3ZCLGVBQVMsYUFBYSxZQUFZLHFDQUFxQyxNQUFNLGtCQUFrQixpQkFBaUIsWUFBWTtBQUFBLElBQ2hJO0FBQ0EsUUFBSSxTQUFTLGtCQUFrQjtBQUMzQixlQUFTLGlCQUFpQixjQUFjLE1BQU0sa0JBQWtCLGNBQWM7QUFBQSxJQUNsRjtBQUNBLFFBQUksU0FBUyxhQUFhO0FBQ3RCLGVBQVMsWUFBWSxjQUFjLE1BQU07QUFDekMsZUFBUyxZQUFZLE1BQU0sVUFBVSxNQUFNLGNBQWMsVUFBVTtBQUFBLElBQ3ZFO0FBQ0EsUUFBSSxTQUFTLG1CQUFtQjtBQUM1QixlQUFTLGtCQUFrQixRQUFRLE1BQU07QUFDekMsZUFBUyxrQkFBa0IsY0FBYyxNQUFNLFVBQVUsTUFBTSxlQUFlLFVBQVU7QUFBQSxJQUM1RjtBQUNBLFFBQUksU0FBUyxtQkFBbUI7QUFDNUIsWUFBTSxZQUFZLE1BQU0sZ0JBQWdCLE1BQU07QUFDOUMsZUFBUyxrQkFBa0IsV0FBVyxDQUFDO0FBQUEsSUFDM0M7QUFBQSxFQUNKO0FBRUEsV0FBUyxlQUFlO0FBRXBCLFFBQUksU0FBUyxjQUFlLFVBQVMsY0FBYyxRQUFRLE1BQU07QUFDakUsUUFBSSxTQUFTLHVCQUF3QixVQUFTLHVCQUF1QixRQUFRLE1BQU07QUFDbkYsUUFBSSxTQUFTLHdCQUF5QixVQUFTLHdCQUF3QixRQUFRLE1BQU07QUFDckYsUUFBSSxTQUFTLHVCQUF3QixVQUFTLHVCQUF1QixRQUFRLE1BQU07QUFDbkYsUUFBSSxTQUFTLGlCQUFrQixVQUFTLGlCQUFpQixRQUFRLE1BQU07QUFDdkUsUUFBSSxTQUFTLHFCQUFzQixVQUFTLHFCQUFxQixRQUFRLE1BQU07QUFDL0UsUUFBSSxTQUFTLHFCQUFzQixVQUFTLHFCQUFxQixRQUFRLE1BQU07QUFDL0UsUUFBSSxTQUFTLHVCQUF3QixVQUFTLHVCQUF1QixRQUFRLE1BQU07QUFDbkYsUUFBSSxTQUFTLDJCQUE0QixVQUFTLDJCQUEyQixRQUFRLE1BQU07QUFDM0YsUUFBSSxTQUFTLG9CQUFxQixVQUFTLG9CQUFvQixRQUFRLE1BQU07QUFBQSxFQUNqRjtBQUVBLFdBQVMsZUFBZTtBQUNwQixRQUFJLENBQUMsU0FBUyxZQUFhO0FBRTNCLFFBQUksTUFBTSxPQUFPLFNBQVMsR0FBRztBQUN6QixlQUFTLFlBQVksTUFBTSxVQUFVO0FBQ3JDLFVBQUksU0FBUyxZQUFhLFVBQVMsWUFBWSxNQUFNLFVBQVU7QUFFL0QsWUFBTSxRQUFRLFNBQVMsWUFBWSxjQUFjLE9BQU87QUFDeEQsVUFBSSxPQUFPO0FBQ1AsY0FBTSxZQUFZLE1BQU0sT0FBTyxJQUFJLENBQUMsT0FBTyxVQUFVO0FBQUE7QUFBQSw0Q0FFckIsTUFBTSxHQUFHO0FBQUE7QUFBQSxrRUFFYSxNQUFNLE9BQU8sWUFBWSxFQUFFLHNCQUFzQixLQUFLO0FBQUE7QUFBQTtBQUFBLGtFQUd0RCxNQUFNLFFBQVEsWUFBWSxFQUFFLHNCQUFzQixLQUFLO0FBQUE7QUFBQTtBQUFBLDZGQUc1QixLQUFLO0FBQUE7QUFBQTtBQUFBLGFBR3JGLEVBQUUsS0FBSyxFQUFFO0FBR1YsY0FBTSxpQkFBaUIsd0JBQXdCLEVBQUUsUUFBUSxRQUFNO0FBQzNELGFBQUcsaUJBQWlCLFVBQVUseUJBQXlCO0FBQUEsUUFDM0QsQ0FBQztBQUdELGNBQU0saUJBQWlCLDZCQUE2QixFQUFFLFFBQVEsU0FBTztBQUNqRSxjQUFJLGlCQUFpQixTQUFTLGlCQUFpQjtBQUFBLFFBQ25ELENBQUM7QUFBQSxNQUNMO0FBQUEsSUFDSixPQUFPO0FBQ0gsZUFBUyxZQUFZLE1BQU0sVUFBVTtBQUNyQyxVQUFJLFNBQVMsWUFBYSxVQUFTLFlBQVksTUFBTSxVQUFVO0FBQUEsSUFDbkU7QUFHQSxRQUFJLFNBQVMsd0JBQXdCO0FBQ2pDLFlBQU0sY0FBYyxxQkFBcUI7QUFDekMsZUFBUyx1QkFBdUIsY0FBYyxNQUFNLFVBQVUsWUFBWSxTQUFTLElBQUksVUFBVTtBQUNqRyxlQUFTLHVCQUF1QixZQUFZLG1FQUN4QyxZQUFZLElBQUksU0FBTyxrQkFBa0IsR0FBRyxLQUFLLEdBQUcsV0FBVyxFQUFFLEtBQUssRUFBRTtBQUFBLElBQ2hGO0FBRUEsUUFBSSxTQUFTLFlBQVk7QUFDckIsZUFBUyxXQUFXLGNBQWMsTUFBTTtBQUN4QyxlQUFTLFdBQVcsTUFBTSxVQUFVLE1BQU0sV0FBVyxVQUFVO0FBQUEsSUFDbkU7QUFBQSxFQUNKO0FBRUEsV0FBUyxvQkFBb0I7QUFDekIsUUFBSSxDQUFDLFNBQVMsVUFBVztBQUd6QixRQUFJLE1BQU0sVUFBVSxTQUFTLEdBQUc7QUFDNUIsZUFBUyxVQUFVLGNBQWMsTUFBTSxVQUFVO0FBQ2pELGVBQVMsVUFBVSxZQUFZLCtCQUMzQixNQUFNLFVBQVUsSUFBSSxVQUFRLGtCQUFrQixJQUFJLElBQUksU0FBUyxNQUFNLE9BQU8sY0FBYyxFQUFFLElBQUksSUFBSSxXQUFXLEVBQUUsS0FBSyxFQUFFO0FBQUEsSUFDaEksT0FBTztBQUNILGVBQVMsVUFBVSxjQUFjLE1BQU0sVUFBVTtBQUFBLElBQ3JEO0FBR0EsUUFBSSxTQUFTLG9CQUFvQixNQUFNLFVBQVUsU0FBUyxHQUFHO0FBQ3pELGVBQVMsaUJBQWlCLE1BQU0sVUFBVTtBQUMxQyxVQUFJLFNBQVMsaUJBQWtCLFVBQVMsaUJBQWlCLE1BQU0sVUFBVTtBQUV6RSxZQUFNLFFBQVEsU0FBUyxpQkFBaUIsY0FBYyxPQUFPO0FBQzdELFVBQUksT0FBTztBQUNQLGNBQU0sWUFBWSxNQUFNLFVBQVUsSUFBSSxDQUFDLENBQUMsT0FBTyxXQUFXLElBQUksTUFBTTtBQUFBO0FBQUEscURBRTNCLFNBQVM7QUFBQTtBQUFBLGdFQUVFLEtBQUssc0JBQXNCLElBQUk7QUFBQSxpREFDOUMsU0FBUyxRQUFRLGNBQWMsRUFBRTtBQUFBLG1EQUMvQixTQUFTLFVBQVUsY0FBYyxFQUFFO0FBQUEsa0RBQ3BDLFNBQVMsU0FBUyxjQUFjLEVBQUU7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUl2RSxFQUFFLEtBQUssRUFBRTtBQUdWLGNBQU0saUJBQWlCLFFBQVEsRUFBRSxRQUFRLFNBQU87QUFDNUMsY0FBSSxpQkFBaUIsVUFBVSxzQkFBc0I7QUFBQSxRQUN6RCxDQUFDO0FBQUEsTUFDTDtBQUFBLElBQ0osT0FBTztBQUNILFVBQUksU0FBUyxpQkFBa0IsVUFBUyxpQkFBaUIsTUFBTSxVQUFVO0FBQ3pFLFVBQUksU0FBUyxrQkFBa0I7QUFDM0IsaUJBQVMsaUJBQWlCLE1BQU0sVUFBVSxNQUFNLFVBQVUsV0FBVyxJQUFJLFVBQVU7QUFBQSxNQUN2RjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBRUEsV0FBUyxpQkFBaUI7QUFDdEIsUUFBSSxTQUFTLGdCQUFnQjtBQUN6QixlQUFTLGVBQWUsY0FBYyxNQUFNLGNBQ3RDLGlFQUNBO0FBQUEsSUFDVjtBQUVBLFFBQUksU0FBUyxvQkFBb0I7QUFDN0IsZUFBUyxtQkFBbUIsTUFBTSxVQUFVLE1BQU0sY0FBYyxTQUFTO0FBQUEsSUFDN0U7QUFDQSxRQUFJLFNBQVMsdUJBQXVCO0FBQ2hDLGVBQVMsc0JBQXNCLE1BQU0sVUFBVSxNQUFNLGNBQWMsVUFBVTtBQUFBLElBQ2pGO0FBR0EsUUFBSSxTQUFTLG9CQUFvQixNQUFNLGFBQWE7QUFDaEQsWUFBTSxXQUFXLDBCQUEwQixNQUFNLFdBQVc7QUFDNUQsWUFBTSxTQUFTLENBQUMsSUFBSSxhQUFhLFFBQVEsUUFBUSxVQUFVLGFBQWE7QUFDeEUsWUFBTSxTQUFTLENBQUMsSUFBSSxnQkFBZ0IsbUJBQW1CLG1CQUFtQixrQkFBa0IsMEJBQTBCO0FBQ3RILGVBQVMsaUJBQWlCLGNBQWMsT0FBTyxRQUFRLEtBQUs7QUFDNUQsZUFBUyxpQkFBaUIsWUFBWSxnQkFBZ0IsT0FBTyxRQUFRLEtBQUssRUFBRTtBQUM1RSxlQUFTLGlCQUFpQixNQUFNLFVBQVUsTUFBTSxjQUFjLFVBQVU7QUFBQSxJQUM1RSxXQUFXLFNBQVMsa0JBQWtCO0FBQ2xDLGVBQVMsaUJBQWlCLE1BQU0sVUFBVTtBQUFBLElBQzlDO0FBR0EsUUFBSSxTQUFTLGdCQUFnQjtBQUN6QixZQUFNLFNBQVMsTUFBTSxZQUFZLFVBQVUsS0FBSyxNQUFNLGdCQUFnQixNQUFNO0FBQzVFLGVBQVMsZUFBZSxXQUFXLENBQUM7QUFBQSxJQUN4QztBQUNBLFFBQUksU0FBUyxtQkFBbUI7QUFDNUIsWUFBTSxZQUFZLE1BQU0sZ0JBQWdCLFNBQVMsS0FDaEMsTUFBTSxZQUFZLFVBQVUsS0FDNUIsTUFBTSxnQkFBZ0IsTUFBTTtBQUM3QyxlQUFTLGtCQUFrQixXQUFXLENBQUM7QUFBQSxJQUMzQztBQUNBLFFBQUksU0FBUyxtQkFBbUI7QUFDNUIsZUFBUyxrQkFBa0IsV0FBVyxDQUFDLE1BQU07QUFBQSxJQUNqRDtBQUdBLFFBQUksU0FBUyxlQUFlO0FBQ3hCLGVBQVMsY0FBYyxjQUFjLE1BQU07QUFDM0MsZUFBUyxjQUFjLE1BQU0sVUFBVSxNQUFNLGdCQUFnQixVQUFVO0FBQUEsSUFDM0U7QUFDQSxRQUFJLFNBQVMsaUJBQWlCO0FBQzFCLGVBQVMsZ0JBQWdCLGNBQWMsTUFBTTtBQUM3QyxlQUFTLGdCQUFnQixNQUFNLFVBQVUsTUFBTSxrQkFBa0IsVUFBVTtBQUFBLElBQy9FO0FBQ0EsUUFBSSxTQUFTLGFBQWE7QUFDdEIsZUFBUyxZQUFZLGNBQWMsTUFBTTtBQUN6QyxlQUFTLFlBQVksTUFBTSxVQUFVLE1BQU0sY0FBYyxVQUFVO0FBQUEsSUFDdkU7QUFBQSxFQUNKO0FBRUEsV0FBUyx3QkFBd0I7QUFDN0IsUUFBSSxTQUFTLHNCQUFzQjtBQUMvQixlQUFTLHFCQUFxQixRQUFRLE1BQU07QUFBQSxJQUNoRDtBQUFBLEVBQ0o7QUFHQSxXQUFTLHVCQUF1QjtBQUM1QixVQUFNLFlBQVksTUFBTSxPQUFPLElBQUksT0FBSyxJQUFJLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSTtBQUMzRCxXQUFPLG1CQUFtQixPQUFPLE9BQUssQ0FBQyxVQUFVLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLE9BQUssRUFBRSxJQUFJO0FBQUEsRUFDdEY7QUFFQSxXQUFTLDBCQUEwQixJQUFJO0FBQ25DLFFBQUksR0FBRyxXQUFXLEVBQUcsUUFBTztBQUM1QixRQUFJLEdBQUcsU0FBUyxFQUFHLFFBQU87QUFDMUIsUUFBSSxRQUFRO0FBQ1osUUFBSSxHQUFHLFVBQVUsR0FBSTtBQUNyQixRQUFJLFFBQVEsS0FBSyxFQUFFLEtBQUssUUFBUSxLQUFLLEVBQUUsRUFBRztBQUMxQyxRQUFJLEtBQUssS0FBSyxFQUFFLEVBQUc7QUFDbkIsUUFBSSxlQUFlLEtBQUssRUFBRSxFQUFHO0FBQzdCLFdBQU8sS0FBSyxJQUFJLE9BQU8sQ0FBQztBQUFBLEVBQzVCO0FBR0EsaUJBQWUsY0FBYztBQUN6QixVQUFNLGVBQWUsTUFBTSxnQkFBZ0I7QUFDM0MsVUFBTSxlQUFlLE1BQU0sZ0JBQWdCO0FBRzNDLFVBQU0sU0FBUyxJQUFJLGdCQUFnQixPQUFPLFNBQVMsTUFBTTtBQUN6RCxVQUFNLFdBQVcsT0FBTyxJQUFJLE9BQU87QUFDbkMsUUFBSSxVQUFVO0FBQ1YsWUFBTSxlQUFlLFNBQVMsUUFBUTtBQUFBLElBQzFDO0FBRUEsVUFBTSxlQUFlO0FBQUEsRUFDekI7QUFFQSxpQkFBZSxpQkFBaUI7QUFDNUIsVUFBTSxlQUFlLE1BQU0sZ0JBQWdCO0FBQzNDLFVBQU0sY0FBYyxNQUFNLGFBQWEsTUFBTSxZQUFZO0FBQ3pELFVBQU0sc0JBQXNCLE1BQU07QUFHbEMsVUFBTSxjQUFjLE1BQU0sSUFBSSxRQUFRLFlBQVk7QUFBQSxNQUM5QyxNQUFNO0FBQUEsTUFDTixTQUFTLE1BQU07QUFBQSxJQUNuQixDQUFDO0FBR0QsVUFBTSxnQkFBZ0I7QUFDdEIsVUFBTSxnQkFBZ0I7QUFDdEIsVUFBTSxhQUFhO0FBQ25CLFVBQU0sd0JBQXdCO0FBQzlCLFVBQU0sdUJBQXVCO0FBQzdCLFVBQU0sMEJBQTBCO0FBQ2hDLFVBQU0seUJBQXlCO0FBRS9CLFFBQUksTUFBTSxnQkFBZ0IsU0FBUztBQUMvQixZQUFNLGlCQUFpQjtBQUFBLElBQzNCLE9BQU87QUFDSCxZQUFNLGtCQUFrQjtBQUFBLElBQzVCO0FBRUEsVUFBTSxXQUFXO0FBQ2pCLFVBQU0sZ0JBQWdCO0FBRXRCLFdBQU87QUFBQSxFQUNYO0FBRUEsaUJBQWUsbUJBQW1CO0FBQzlCLFVBQU0sVUFBVSxNQUFNLElBQUksUUFBUSxZQUFZO0FBQUEsTUFDMUMsTUFBTTtBQUFBLE1BQ04sU0FBUyxNQUFNO0FBQUEsSUFDbkIsQ0FBQztBQUNELFVBQU0sa0JBQWtCLE1BQU07QUFFOUIsVUFBTSxTQUFTLE1BQU0sSUFBSSxRQUFRLFlBQVk7QUFBQSxNQUN6QyxNQUFNO0FBQUEsTUFDTixTQUFTLE1BQU07QUFBQSxJQUNuQixDQUFDO0FBRUQsVUFBTSxlQUFlO0FBQUEsRUFDekI7QUFFQSxpQkFBZSxvQkFBb0I7QUFDL0IsVUFBTSxVQUFVLE1BQU0sV0FBVyxNQUFNLFlBQVk7QUFDbkQsVUFBTSxZQUFZLFNBQVMsYUFBYTtBQUN4QyxVQUFNLGVBQWUsU0FBUyxnQkFBZ0I7QUFDOUMsVUFBTSxjQUFjO0FBRXBCLFFBQUksTUFBTSxjQUFjO0FBQ3BCLFlBQU0sU0FBUyxNQUFNLElBQUksUUFBUSxZQUFZO0FBQUEsUUFDekMsTUFBTTtBQUFBLFFBQ04sU0FBUyxNQUFNO0FBQUEsTUFDbkIsQ0FBQztBQUFBLElBQ0wsT0FBTztBQUNILFlBQU0sU0FBUztBQUFBLElBQ25CO0FBRUEsVUFBTSxTQUFTLE1BQU0sSUFBSSxRQUFRLFlBQVk7QUFBQSxNQUN6QyxNQUFNO0FBQUEsTUFDTixTQUFTLE1BQU07QUFBQSxJQUNuQixDQUFDO0FBQ0QsVUFBTSxrQkFBa0IsUUFBUSxhQUFhO0FBQUEsRUFDakQ7QUFFQSxpQkFBZSxhQUFhO0FBQ3hCLFVBQU0sU0FBUyxNQUFNLFVBQVUsTUFBTSxZQUFZO0FBQUEsRUFDckQ7QUFFQSxpQkFBZSxrQkFBa0I7QUFDN0IsVUFBTSxjQUFjLE1BQU0sZUFBZSxNQUFNLFlBQVk7QUFHM0QsVUFBTSxZQUFZLE9BQU8sS0FBSyxNQUFNLFdBQVcsRUFBRSxLQUFLO0FBR3RELGtCQUFjO0FBQUEsRUFDbEI7QUFFQSxXQUFTLGdCQUFnQjtBQUNyQixVQUFNLEtBQUssTUFBTSxZQUFZLE1BQU0sSUFBSSxLQUFLLENBQUM7QUFDN0MsVUFBTSxPQUFPLE9BQU8sS0FBSyxFQUFFLEVBQUUsS0FBSztBQUNsQyxVQUFNLFlBQVksS0FBSyxJQUFJLE9BQUssQ0FBQyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUFBLEVBQ2xFO0FBRUEsaUJBQWUsaUJBQWlCO0FBQzVCLFFBQUk7QUFDQSxVQUFJLENBQUMsTUFBTSxRQUFRO0FBQ2YsY0FBTSxnQkFBZ0I7QUFDdEI7QUFBQSxNQUNKO0FBQ0EsWUFBTSxnQkFBZ0IsTUFBTSxjQUFBQyxRQUFPLFVBQVUsTUFBTSxPQUFPLFlBQVksR0FBRztBQUFBLFFBQ3JFLE9BQU87QUFBQSxRQUNQLFFBQVE7QUFBQSxRQUNSLE9BQU8sRUFBRSxNQUFNLFdBQVcsT0FBTyxVQUFVO0FBQUEsTUFDL0MsQ0FBQztBQUFBLElBQ0wsUUFBUTtBQUNKLFlBQU0sZ0JBQWdCO0FBQUEsSUFDMUI7QUFBQSxFQUNKO0FBRUEsaUJBQWUsaUJBQWlCO0FBQzVCLFFBQUk7QUFDQSxVQUFJLENBQUMsTUFBTSxXQUFXLENBQUMsTUFBTSxTQUFTO0FBQ2xDLGNBQU0sZ0JBQWdCO0FBQ3RCO0FBQUEsTUFDSjtBQUNBLFlBQU0sT0FBTyxNQUFNLElBQUksUUFBUSxZQUFZO0FBQUEsUUFDdkMsTUFBTTtBQUFBLFFBQ04sU0FBUyxNQUFNO0FBQUEsTUFDbkIsQ0FBQztBQUNELFVBQUksQ0FBQyxNQUFNO0FBQ1AsY0FBTSxnQkFBZ0I7QUFDdEI7QUFBQSxNQUNKO0FBQ0EsWUFBTSxnQkFBZ0IsTUFBTSxjQUFBQSxRQUFPLFVBQVUsS0FBSyxZQUFZLEdBQUc7QUFBQSxRQUM3RCxPQUFPO0FBQUEsUUFDUCxRQUFRO0FBQUEsUUFDUixPQUFPLEVBQUUsTUFBTSxXQUFXLE9BQU8sVUFBVTtBQUFBLE1BQy9DLENBQUM7QUFBQSxJQUNMLFFBQVE7QUFDSixZQUFNLGdCQUFnQjtBQUFBLElBQzFCO0FBQUEsRUFDSjtBQUdBLGlCQUFlLHNCQUFzQjtBQUNqQyxVQUFNLE1BQU0sU0FBUyxjQUFjO0FBQ25DLFFBQUksQ0FBQyxPQUFPLFFBQVEsSUFBSztBQUN6QixVQUFNLFdBQVcsU0FBUyxHQUFHO0FBQzdCLFFBQUksTUFBTSxRQUFRLEVBQUc7QUFDckIsUUFBSSxhQUFhLE1BQU0sY0FBYztBQUNqQyxZQUFNLGVBQWU7QUFDckIsWUFBTSxPQUFPO0FBQ2IsWUFBTSxlQUFlO0FBQUEsSUFDekI7QUFBQSxFQUNKO0FBRUEsaUJBQWUseUJBQXlCO0FBQ3BDLFVBQU0sV0FBVyxNQUFNLGlCQUFpQjtBQUN4QyxVQUFNLGVBQWU7QUFDckIsVUFBTSxlQUFlO0FBQUEsRUFDekI7QUFFQSxXQUFTLHVCQUF1QixHQUFHO0FBQy9CLFVBQU0sY0FBYyxFQUFFLE9BQU87QUFDN0IsV0FBTztBQUFBLEVBQ1g7QUFFQSxXQUFTLG1CQUFtQixHQUFHO0FBQzNCLFVBQU0sVUFBVSxFQUFFLE9BQU87QUFDekIsV0FBTztBQUFBLEVBQ1g7QUFFQSxXQUFTLHlCQUF5QjtBQUM5QixVQUFNLFVBQVUsQ0FBQyxNQUFNO0FBQ3ZCLFdBQU87QUFBQSxFQUNYO0FBRUEsaUJBQWUsbUJBQW1CO0FBQzlCLFVBQU0sVUFBVSxVQUFVLFVBQVUsTUFBTSxNQUFNO0FBQ2hELFVBQU0sU0FBUztBQUNmLFdBQU87QUFDUCxlQUFXLE1BQU07QUFDYixZQUFNLFNBQVM7QUFDZixhQUFPO0FBQUEsSUFDWCxHQUFHLElBQUk7QUFBQSxFQUNYO0FBRUEsaUJBQWUsb0JBQW9CO0FBQy9CLFFBQUksTUFBTSxnQkFBZ0IsU0FBUztBQUMvQixZQUFNLGVBQWUsTUFBTSxjQUFjLE1BQU0sT0FBTztBQUFBLElBQzFEO0FBQ0EsVUFBTSxnQkFBZ0IsTUFBTSxjQUFjLE1BQU0sV0FBVztBQUMzRCxVQUFNLGVBQWU7QUFBQSxFQUN6QjtBQUVBLGlCQUFlLG1CQUFtQjtBQUM5QixVQUFNLGVBQWU7QUFDckIsVUFBTSxhQUFhO0FBQ25CLFdBQU87QUFBQSxFQUNYO0FBRUEsV0FBUyxtQkFBbUI7QUFDeEIsVUFBTSxhQUFhO0FBQ25CLFVBQU0sZ0JBQWdCO0FBQ3RCLFdBQU87QUFBQSxFQUNYO0FBRUEsaUJBQWUseUJBQXlCO0FBQ3BDLFVBQU0saUJBQWlCO0FBQ3ZCLFVBQU0sbUJBQW1CO0FBQ3pCLFdBQU87QUFFUCxRQUFJO0FBQ0EsWUFBTSxTQUFTLE1BQU0sSUFBSSxRQUFRLFlBQVk7QUFBQSxRQUN6QyxNQUFNO0FBQUEsUUFDTixTQUFTO0FBQUEsVUFDTCxXQUFXLE1BQU07QUFBQSxVQUNqQixVQUFVLE1BQU07QUFBQSxRQUNwQjtBQUFBLE1BQ0osQ0FBQztBQUVELFVBQUksT0FBTyxTQUFTO0FBQ2hCLGNBQU0sZUFBZSxNQUFNLGNBQWMsT0FBTyxNQUFNO0FBQ3RELGNBQU0sb0JBQW9CO0FBQzFCLGNBQU0sZUFBZTtBQUFBLE1BQ3pCLE9BQU87QUFDSCxjQUFNLGlCQUFpQixPQUFPLFNBQVM7QUFBQSxNQUMzQztBQUFBLElBQ0osU0FBUyxHQUFHO0FBQ1IsWUFBTSxpQkFBaUIsRUFBRSxXQUFXO0FBQUEsSUFDeEM7QUFFQSxVQUFNLG1CQUFtQjtBQUN6QixXQUFPO0FBQUEsRUFDWDtBQUVBLGlCQUFlLHdCQUF3QjtBQUNuQyxVQUFNLHVCQUF1QjtBQUM3QixVQUFNLHdCQUF3QjtBQUM5QixVQUFNLHlCQUF5QjtBQUMvQixXQUFPO0FBRVAsUUFBSTtBQUNBLFlBQU0sU0FBUyxNQUFNLElBQUksUUFBUSxZQUFZO0FBQUEsUUFDekMsTUFBTTtBQUFBLFFBQ04sU0FBUztBQUFBLFVBQ0wsY0FBYyxNQUFNO0FBQUEsVUFDcEIsVUFBVSxNQUFNO0FBQUEsUUFDcEI7QUFBQSxNQUNKLENBQUM7QUFFRCxVQUFJLE9BQU8sU0FBUztBQUNoQixjQUFNLHdCQUF3QixPQUFPO0FBQ3JDLGNBQU0sMEJBQTBCO0FBQ2hDLGNBQU0seUJBQXlCO0FBQUEsTUFDbkMsT0FBTztBQUNILGNBQU0sdUJBQXVCLE9BQU8sU0FBUztBQUFBLE1BQ2pEO0FBQUEsSUFDSixTQUFTLEdBQUc7QUFDUixZQUFNLHVCQUF1QixFQUFFLFdBQVc7QUFBQSxJQUM5QztBQUVBLFVBQU0seUJBQXlCO0FBQy9CLFdBQU87QUFBQSxFQUNYO0FBRUEsaUJBQWUsNEJBQTRCO0FBQ3ZDLFVBQU0sVUFBVSxVQUFVLFVBQVUsTUFBTSxxQkFBcUI7QUFDL0QsVUFBTSx3QkFBd0I7QUFDOUIsV0FBTztBQUNQLGVBQVcsTUFBTTtBQUNiLFlBQU0sd0JBQXdCO0FBQzlCLGFBQU87QUFBQSxJQUNYLEdBQUcsSUFBSTtBQUFBLEVBQ1g7QUFFQSxpQkFBZSxzQkFBc0I7QUFDakMsVUFBTSxjQUFjO0FBQ3BCLFVBQU0sbUJBQW1CO0FBQ3pCLFdBQU87QUFFUCxRQUFJO0FBQ0EsWUFBTSxhQUFhLE1BQU0sSUFBSSxRQUFRLFlBQVk7QUFBQSxRQUM3QyxNQUFNO0FBQUEsUUFDTixTQUFTLE1BQU07QUFBQSxNQUNuQixDQUFDO0FBQ0QsVUFBSSxDQUFDLFdBQVcsT0FBTztBQUNuQixjQUFNLGNBQWMsV0FBVztBQUMvQixjQUFNLG1CQUFtQjtBQUN6QixlQUFPO0FBQ1A7QUFBQSxNQUNKO0FBRUEsWUFBTSxTQUFTLE1BQU0sSUFBSSxRQUFRLFlBQVk7QUFBQSxRQUN6QyxNQUFNO0FBQUEsUUFDTixTQUFTO0FBQUEsVUFDTCxjQUFjLE1BQU07QUFBQSxVQUNwQixXQUFXLE1BQU07QUFBQSxRQUNyQjtBQUFBLE1BQ0osQ0FBQztBQUVELFVBQUksT0FBTyxTQUFTO0FBQ2hCLGNBQU0sa0JBQWtCO0FBQ3hCLGNBQU0sZUFBZSxPQUFPO0FBQzVCLGNBQU0sU0FBUyxNQUFNLElBQUksUUFBUSxZQUFZO0FBQUEsVUFDekMsTUFBTTtBQUFBLFVBQ04sU0FBUyxPQUFPO0FBQUEsUUFDcEIsQ0FBQztBQUFBLE1BQ0wsT0FBTztBQUNILGNBQU0sY0FBYyxPQUFPLFNBQVM7QUFBQSxNQUN4QztBQUFBLElBQ0osU0FBUyxHQUFHO0FBQ1IsWUFBTSxjQUFjLEVBQUUsV0FBVztBQUFBLElBQ3JDO0FBRUEsVUFBTSxtQkFBbUI7QUFDekIsV0FBTztBQUFBLEVBQ1g7QUFFQSxpQkFBZSx5QkFBeUI7QUFDcEMsVUFBTSxjQUFjO0FBQ3BCLFVBQU0sU0FBUyxNQUFNLElBQUksUUFBUSxZQUFZO0FBQUEsTUFDekMsTUFBTTtBQUFBLE1BQ04sU0FBUyxNQUFNO0FBQUEsSUFDbkIsQ0FBQztBQUNELFFBQUksT0FBTyxTQUFTO0FBQ2hCLFlBQU0sa0JBQWtCO0FBQUEsSUFDNUIsT0FBTztBQUNILFlBQU0sY0FBYyxPQUFPLFNBQVM7QUFBQSxJQUN4QztBQUNBLFdBQU87QUFBQSxFQUNYO0FBRUEsaUJBQWUsbUJBQW1CO0FBQzlCLFVBQU0sY0FBYztBQUNwQixVQUFNLFNBQVMsTUFBTSxJQUFJLFFBQVEsWUFBWTtBQUFBLE1BQ3pDLE1BQU07QUFBQSxNQUNOLFNBQVMsTUFBTTtBQUFBLElBQ25CLENBQUM7QUFDRCxRQUFJLENBQUMsT0FBTyxTQUFTO0FBQ2pCLFlBQU0sY0FBYyxPQUFPLFNBQVM7QUFDcEMsWUFBTSxrQkFBa0I7QUFBQSxJQUM1QjtBQUNBLFdBQU87QUFBQSxFQUNYO0FBRUEsaUJBQWUsMEJBQTBCLEdBQUc7QUFDeEMsVUFBTSxRQUFRLFNBQVMsRUFBRSxPQUFPLFFBQVEsVUFBVTtBQUNsRCxVQUFNLE9BQU8sRUFBRSxPQUFPLFFBQVE7QUFDOUIsVUFBTSxPQUFPLEtBQUssRUFBRSxJQUFJLElBQUksRUFBRSxPQUFPO0FBQ3JDLFVBQU0sV0FBVyxNQUFNLGNBQWMsTUFBTSxNQUFNO0FBQ2pELFVBQU0sV0FBVztBQUNqQixXQUFPO0FBQUEsRUFDWDtBQUVBLGlCQUFlLGtCQUFrQixHQUFHO0FBQ2hDLFVBQU0sUUFBUSxTQUFTLEVBQUUsT0FBTyxRQUFRLFVBQVU7QUFDbEQsVUFBTSxPQUFPLE9BQU8sT0FBTyxDQUFDO0FBQzVCLFVBQU0sV0FBVyxNQUFNLGNBQWMsTUFBTSxNQUFNO0FBQ2pELFVBQU0sV0FBVztBQUNqQixXQUFPO0FBQUEsRUFDWDtBQUVBLGlCQUFlLGlCQUFpQjtBQUM1QixVQUFNLFdBQVcsTUFBTSxvQkFBb0IsTUFBTTtBQUNqRCxRQUFJO0FBQ0EsWUFBTSxNQUFNLElBQUksSUFBSSxRQUFRO0FBQzVCLFVBQUksSUFBSSxhQUFhLFFBQVE7QUFDekIsb0JBQVkseUJBQXlCO0FBQ3JDO0FBQUEsTUFDSjtBQUNBLFlBQU0sT0FBTyxNQUFNLE9BQU8sSUFBSSxPQUFLLEVBQUUsR0FBRztBQUN4QyxVQUFJLEtBQUssU0FBUyxJQUFJLElBQUksR0FBRztBQUN6QixvQkFBWSxvQkFBb0I7QUFDaEM7QUFBQSxNQUNKO0FBQ0EsWUFBTSxPQUFPLEtBQUssRUFBRSxLQUFLLElBQUksTUFBTSxNQUFNLE1BQU0sT0FBTyxLQUFLLENBQUM7QUFDNUQsWUFBTSxXQUFXLE1BQU0sY0FBYyxNQUFNLE1BQU07QUFDakQsWUFBTSxXQUFXO0FBQ2pCLFlBQU0sbUJBQW1CO0FBQ3pCLFlBQU0sV0FBVztBQUNqQixhQUFPO0FBQUEsSUFDWCxTQUFTLE9BQU87QUFDWixrQkFBWSx1QkFBdUI7QUFBQSxJQUN2QztBQUFBLEVBQ0o7QUFFQSxXQUFTLFlBQVksU0FBUztBQUMxQixVQUFNLFdBQVc7QUFDakIsV0FBTztBQUNQLGVBQVcsTUFBTTtBQUNiLFlBQU0sV0FBVztBQUNqQixhQUFPO0FBQUEsSUFDWCxHQUFHLEdBQUk7QUFBQSxFQUNYO0FBRUEsaUJBQWUsdUJBQXVCLEdBQUc7QUFDckMsVUFBTSxRQUFRLEVBQUUsT0FBTyxRQUFRO0FBQy9CLFVBQU0sUUFBUSxFQUFFLE9BQU87QUFDdkIsVUFBTSxjQUFjLE1BQU0sTUFBTSxPQUFPLE9BQU8sTUFBTSxZQUFZO0FBQ2hFLFVBQU0sZ0JBQWdCO0FBQ3RCLFdBQU87QUFBQSxFQUNYO0FBRUEsaUJBQWUsb0JBQW9CO0FBQy9CLFVBQU0sZ0JBQWdCO0FBQ3RCLFVBQU0sa0JBQWtCO0FBRXhCLFFBQUksTUFBTSxZQUFZLFNBQVMsR0FBRztBQUM5QixZQUFNLGdCQUFnQjtBQUN0QixhQUFPO0FBQ1A7QUFBQSxJQUNKO0FBQ0EsUUFBSSxNQUFNLGdCQUFnQixNQUFNLGlCQUFpQjtBQUM3QyxZQUFNLGdCQUFnQjtBQUN0QixhQUFPO0FBQ1A7QUFBQSxJQUNKO0FBRUEsVUFBTSxTQUFTLE1BQU0sSUFBSSxRQUFRLFlBQVk7QUFBQSxNQUN6QyxNQUFNO0FBQUEsTUFDTixTQUFTLE1BQU07QUFBQSxJQUNuQixDQUFDO0FBQ0QsUUFBSSxPQUFPLFNBQVM7QUFDaEIsWUFBTSxjQUFjO0FBQ3BCLFlBQU0sY0FBYztBQUNwQixZQUFNLGtCQUFrQjtBQUN4QixZQUFNLGtCQUFrQjtBQUN4QixhQUFPO0FBQ1AsaUJBQVcsTUFBTTtBQUNiLGNBQU0sa0JBQWtCO0FBQ3hCLGVBQU87QUFBQSxNQUNYLEdBQUcsR0FBSTtBQUFBLElBQ1gsT0FBTztBQUNILFlBQU0sZ0JBQWdCLE9BQU8sU0FBUztBQUN0QyxhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7QUFFQSxpQkFBZSx1QkFBdUI7QUFDbEMsVUFBTSxnQkFBZ0I7QUFDdEIsVUFBTSxrQkFBa0I7QUFFeEIsUUFBSSxDQUFDLE1BQU0saUJBQWlCO0FBQ3hCLFlBQU0sZ0JBQWdCO0FBQ3RCLGFBQU87QUFDUDtBQUFBLElBQ0o7QUFDQSxRQUFJLE1BQU0sWUFBWSxTQUFTLEdBQUc7QUFDOUIsWUFBTSxnQkFBZ0I7QUFDdEIsYUFBTztBQUNQO0FBQUEsSUFDSjtBQUNBLFFBQUksTUFBTSxnQkFBZ0IsTUFBTSxpQkFBaUI7QUFDN0MsWUFBTSxnQkFBZ0I7QUFDdEIsYUFBTztBQUNQO0FBQUEsSUFDSjtBQUVBLFVBQU0sU0FBUyxNQUFNLElBQUksUUFBUSxZQUFZO0FBQUEsTUFDekMsTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBLFFBQ0wsYUFBYSxNQUFNO0FBQUEsUUFDbkIsYUFBYSxNQUFNO0FBQUEsTUFDdkI7QUFBQSxJQUNKLENBQUM7QUFDRCxRQUFJLE9BQU8sU0FBUztBQUNoQixZQUFNLGtCQUFrQjtBQUN4QixZQUFNLGNBQWM7QUFDcEIsWUFBTSxrQkFBa0I7QUFDeEIsWUFBTSxrQkFBa0I7QUFDeEIsYUFBTztBQUNQLGlCQUFXLE1BQU07QUFDYixjQUFNLGtCQUFrQjtBQUN4QixlQUFPO0FBQUEsTUFDWCxHQUFHLEdBQUk7QUFBQSxJQUNYLE9BQU87QUFDSCxZQUFNLGdCQUFnQixPQUFPLFNBQVM7QUFDdEMsYUFBTztBQUFBLElBQ1g7QUFBQSxFQUNKO0FBRUEsaUJBQWUsdUJBQXVCO0FBQ2xDLFVBQU0sY0FBYztBQUVwQixRQUFJLENBQUMsTUFBTSxxQkFBcUI7QUFDNUIsWUFBTSxjQUFjO0FBQ3BCLGFBQU87QUFDUDtBQUFBLElBQ0o7QUFDQSxRQUFJLENBQUMsUUFBUSxxR0FBcUcsR0FBRztBQUNqSDtBQUFBLElBQ0o7QUFFQSxVQUFNLFNBQVMsTUFBTSxJQUFJLFFBQVEsWUFBWTtBQUFBLE1BQ3pDLE1BQU07QUFBQSxNQUNOLFNBQVMsTUFBTTtBQUFBLElBQ25CLENBQUM7QUFDRCxRQUFJLE9BQU8sU0FBUztBQUNoQixZQUFNLGNBQWM7QUFDcEIsWUFBTSxzQkFBc0I7QUFDNUIsWUFBTSxrQkFBa0I7QUFDeEIsYUFBTztBQUNQLGlCQUFXLE1BQU07QUFDYixjQUFNLGtCQUFrQjtBQUN4QixlQUFPO0FBQUEsTUFDWCxHQUFHLEdBQUk7QUFBQSxJQUNYLE9BQU87QUFDSCxZQUFNLGNBQWMsT0FBTyxTQUFTO0FBQ3BDLGFBQU87QUFBQSxJQUNYO0FBQUEsRUFDSjtBQUVBLGlCQUFlLDRCQUE0QjtBQUN2QyxRQUFJLE1BQU0saUJBQWlCO0FBQ3ZCLFlBQU0sSUFBSSxRQUFRLE1BQU0sSUFBSSxFQUFFLGtCQUFrQixNQUFNLGdCQUFnQixDQUFDO0FBQUEsSUFDM0UsT0FBTztBQUNILFlBQU0sSUFBSSxRQUFRLE1BQU0sT0FBTyxrQkFBa0I7QUFBQSxJQUNyRDtBQUFBLEVBQ0o7QUFFQSxpQkFBZSxrQkFBa0I7QUFDN0IsUUFBSSxDQUFDLFFBQVEsZ0dBQWdHLEdBQUc7QUFDNUc7QUFBQSxJQUNKO0FBQ0EsVUFBTSxVQUFVO0FBQ2hCLFVBQU0sWUFBWTtBQUFBLEVBQ3RCO0FBRUEsV0FBUyxjQUFjO0FBQ25CLFdBQU8sTUFBTTtBQUFBLEVBQ2pCO0FBR0EsV0FBUyxhQUFhO0FBRWxCLFFBQUksU0FBUyxlQUFlO0FBQ3hCLGVBQVMsY0FBYyxpQkFBaUIsVUFBVSxtQkFBbUI7QUFBQSxJQUN6RTtBQUNBLFFBQUksU0FBUyxjQUFjO0FBQ3ZCLGVBQVMsYUFBYSxpQkFBaUIsU0FBUyxzQkFBc0I7QUFBQSxJQUMxRTtBQUdBLFFBQUksU0FBUyxrQkFBa0I7QUFDM0IsZUFBUyxpQkFBaUIsaUJBQWlCLFNBQVMsc0JBQXNCO0FBQUEsSUFDOUU7QUFDQSxRQUFJLFNBQVMsY0FBYztBQUN2QixlQUFTLGFBQWEsaUJBQWlCLFNBQVMsa0JBQWtCO0FBQUEsSUFDdEU7QUFDQSxRQUFJLFNBQVMsa0JBQWtCO0FBQzNCLGVBQVMsaUJBQWlCLGlCQUFpQixTQUFTLHNCQUFzQjtBQUFBLElBQzlFO0FBQ0EsUUFBSSxTQUFTLGVBQWU7QUFDeEIsZUFBUyxjQUFjLGlCQUFpQixTQUFTLGdCQUFnQjtBQUFBLElBQ3JFO0FBQ0EsUUFBSSxTQUFTLGdCQUFnQjtBQUN6QixlQUFTLGVBQWUsaUJBQWlCLFNBQVMsaUJBQWlCO0FBQUEsSUFDdkU7QUFHQSxRQUFJLFNBQVMsWUFBWTtBQUNyQixlQUFTLFdBQVcsaUJBQWlCLFNBQVMsc0JBQXNCO0FBQUEsSUFDeEU7QUFDQSxRQUFJLFNBQVMsZUFBZTtBQUN4QixlQUFTLGNBQWMsaUJBQWlCLFNBQVMsZ0JBQWdCO0FBQUEsSUFDckU7QUFDQSxRQUFJLFNBQVMsZUFBZTtBQUN4QixlQUFTLGNBQWMsaUJBQWlCLFNBQVMsZ0JBQWdCO0FBQUEsSUFDckU7QUFDQSxRQUFJLFNBQVMsb0JBQW9CO0FBQzdCLGVBQVMsbUJBQW1CLGlCQUFpQixTQUFTLHFCQUFxQjtBQUFBLElBQy9FO0FBQ0EsUUFBSSxTQUFTLGtCQUFrQjtBQUMzQixlQUFTLGlCQUFpQixpQkFBaUIsU0FBUyx5QkFBeUI7QUFBQSxJQUNqRjtBQUdBLFFBQUksU0FBUyx5QkFBeUI7QUFDbEMsZUFBUyx3QkFBd0IsaUJBQWlCLFNBQVMsQ0FBQyxNQUFNO0FBQzlELGNBQU0sMEJBQTBCLEVBQUUsT0FBTztBQUN6QyxlQUFPO0FBQUEsTUFDWCxDQUFDO0FBQUEsSUFDTDtBQUNBLFFBQUksU0FBUyx3QkFBd0I7QUFDakMsZUFBUyx1QkFBdUIsaUJBQWlCLFNBQVMsQ0FBQyxNQUFNO0FBQzdELGNBQU0seUJBQXlCLEVBQUUsT0FBTztBQUN4QyxlQUFPO0FBQUEsTUFDWCxDQUFDO0FBQUEsSUFDTDtBQUdBLFFBQUksU0FBUyx3QkFBd0I7QUFDakMsZUFBUyx1QkFBdUIsaUJBQWlCLFNBQVMsc0JBQXNCO0FBQUEsSUFDcEY7QUFDQSxRQUFJLFNBQVMsbUJBQW1CO0FBQzVCLGVBQVMsa0JBQWtCLGlCQUFpQixTQUFTLGlCQUFpQjtBQUFBLElBQzFFO0FBR0EsUUFBSSxTQUFTLGdCQUFnQjtBQUN6QixlQUFTLGVBQWUsaUJBQWlCLFNBQVMsQ0FBQyxNQUFNO0FBQ3JELGNBQU0sWUFBWSxFQUFFLE9BQU87QUFDM0IsZUFBTztBQUFBLE1BQ1gsQ0FBQztBQUFBLElBQ0w7QUFDQSxRQUFJLFNBQVMsa0JBQWtCO0FBQzNCLGVBQVMsaUJBQWlCLGlCQUFpQixTQUFTLG1CQUFtQjtBQUFBLElBQzNFO0FBQ0EsUUFBSSxTQUFTLHFCQUFxQjtBQUM5QixlQUFTLG9CQUFvQixpQkFBaUIsU0FBUyxzQkFBc0I7QUFBQSxJQUNqRjtBQUNBLFFBQUksU0FBUyxlQUFlO0FBQ3hCLGVBQVMsY0FBYyxpQkFBaUIsU0FBUyxnQkFBZ0I7QUFBQSxJQUNyRTtBQUdBLFFBQUksU0FBUyxxQkFBcUI7QUFDOUIsZUFBUyxvQkFBb0IsaUJBQWlCLFNBQVMsZ0JBQWdCO0FBQUEsSUFDM0U7QUFHQSxRQUFJLFNBQVMsd0JBQXdCO0FBQ2pDLGVBQVMsdUJBQXVCLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUM3RCxjQUFNLG9CQUFvQixFQUFFLE9BQU87QUFDbkMsZUFBTztBQUFBLE1BQ1gsQ0FBQztBQUFBLElBQ0w7QUFHQSxRQUFJLFNBQVMsZUFBZTtBQUN4QixlQUFTLGNBQWMsaUJBQWlCLFNBQVMsQ0FBQyxNQUFNO0FBQ3BELGNBQU0sV0FBVyxFQUFFLE9BQU87QUFBQSxNQUM5QixDQUFDO0FBQ0QsZUFBUyxjQUFjLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUNwRCxZQUFJLEVBQUUsUUFBUSxTQUFTO0FBQ25CLHlCQUFlO0FBQUEsUUFDbkI7QUFBQSxNQUNKLENBQUM7QUFBQSxJQUNMO0FBQ0EsUUFBSSxTQUFTLHdCQUF3QjtBQUNqQyxlQUFTLHVCQUF1QixpQkFBaUIsVUFBVSxDQUFDLE1BQU07QUFDOUQsY0FBTSxtQkFBbUIsRUFBRSxPQUFPO0FBQ2xDLHVCQUFlO0FBQUEsTUFDbkIsQ0FBQztBQUFBLElBQ0w7QUFDQSxRQUFJLFNBQVMsYUFBYTtBQUN0QixlQUFTLFlBQVksaUJBQWlCLFNBQVMsY0FBYztBQUFBLElBQ2pFO0FBR0EsUUFBSSxTQUFTLFdBQVc7QUFDcEIsZUFBUyxVQUFVLGlCQUFpQixVQUFVLENBQUMsTUFBTTtBQUNqRCxjQUFNLE9BQU8sRUFBRSxPQUFPO0FBQ3RCLHNCQUFjO0FBQ2QsZUFBTztBQUFBLE1BQ1gsQ0FBQztBQUFBLElBQ0w7QUFHQSxRQUFJLFNBQVMsa0JBQWtCO0FBQzNCLGVBQVMsaUJBQWlCLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUN2RCxjQUFNLGNBQWMsRUFBRSxPQUFPO0FBQzdCLGVBQU87QUFBQSxNQUNYLENBQUM7QUFBQSxJQUNMO0FBQ0EsUUFBSSxTQUFTLHNCQUFzQjtBQUMvQixlQUFTLHFCQUFxQixpQkFBaUIsU0FBUyxDQUFDLE1BQU07QUFDM0QsY0FBTSxrQkFBa0IsRUFBRSxPQUFPO0FBQ2pDLGVBQU87QUFBQSxNQUNYLENBQUM7QUFBQSxJQUNMO0FBQ0EsUUFBSSxTQUFTLGdCQUFnQjtBQUN6QixlQUFTLGVBQWUsaUJBQWlCLFNBQVMsaUJBQWlCO0FBQUEsSUFDdkU7QUFDQSxRQUFJLFNBQVMsc0JBQXNCO0FBQy9CLGVBQVMscUJBQXFCLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUMzRCxjQUFNLGtCQUFrQixFQUFFLE9BQU87QUFDakMsZUFBTztBQUFBLE1BQ1gsQ0FBQztBQUFBLElBQ0w7QUFDQSxRQUFJLFNBQVMsd0JBQXdCO0FBQ2pDLGVBQVMsdUJBQXVCLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUM3RCxjQUFNLGNBQWMsRUFBRSxPQUFPO0FBQzdCLGVBQU87QUFBQSxNQUNYLENBQUM7QUFBQSxJQUNMO0FBQ0EsUUFBSSxTQUFTLDRCQUE0QjtBQUNyQyxlQUFTLDJCQUEyQixpQkFBaUIsU0FBUyxDQUFDLE1BQU07QUFDakUsY0FBTSxrQkFBa0IsRUFBRSxPQUFPO0FBQ2pDLGVBQU87QUFBQSxNQUNYLENBQUM7QUFBQSxJQUNMO0FBQ0EsUUFBSSxTQUFTLG1CQUFtQjtBQUM1QixlQUFTLGtCQUFrQixpQkFBaUIsU0FBUyxvQkFBb0I7QUFBQSxJQUM3RTtBQUNBLFFBQUksU0FBUyxxQkFBcUI7QUFDOUIsZUFBUyxvQkFBb0IsaUJBQWlCLFNBQVMsQ0FBQyxNQUFNO0FBQzFELGNBQU0sc0JBQXNCLEVBQUUsT0FBTztBQUNyQyxlQUFPO0FBQUEsTUFDWCxDQUFDO0FBQUEsSUFDTDtBQUNBLFFBQUksU0FBUyxtQkFBbUI7QUFDNUIsZUFBUyxrQkFBa0IsaUJBQWlCLFNBQVMsb0JBQW9CO0FBQUEsSUFDN0U7QUFHQSxRQUFJLFNBQVMsc0JBQXNCO0FBQy9CLGVBQVMscUJBQXFCLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUMzRCxjQUFNLGtCQUFrQixFQUFFLE9BQU87QUFBQSxNQUNyQyxDQUFDO0FBQ0QsZUFBUyxxQkFBcUIsaUJBQWlCLFVBQVUseUJBQXlCO0FBQUEsSUFDdEY7QUFDQSxRQUFJLFNBQVMsYUFBYTtBQUN0QixlQUFTLFlBQVksaUJBQWlCLFNBQVMsTUFBTTtBQUNqRCxjQUFNLGtCQUFrQjtBQUN4QixrQ0FBMEI7QUFDMUIsZUFBTztBQUFBLE1BQ1gsQ0FBQztBQUFBLElBQ0w7QUFDQSxRQUFJLFNBQVMsbUJBQW1CO0FBQzVCLGVBQVMsa0JBQWtCLGlCQUFpQixTQUFTLE1BQU07QUFDdkQsY0FBTSxrQkFBa0I7QUFDeEIsa0NBQTBCO0FBQzFCLGVBQU87QUFBQSxNQUNYLENBQUM7QUFBQSxJQUNMO0FBR0EsUUFBSSxTQUFTLFVBQVU7QUFDbkIsZUFBUyxTQUFTLGlCQUFpQixTQUFTLFdBQVc7QUFBQSxJQUMzRDtBQUNBLFVBQU0sa0JBQWtCLFNBQVMsY0FBYyw4QkFBOEI7QUFDN0UsUUFBSSxpQkFBaUI7QUFDakIsc0JBQWdCLGlCQUFpQixTQUFTLFdBQVc7QUFBQSxJQUN6RDtBQUNBLFFBQUksU0FBUyxjQUFjO0FBQ3ZCLGVBQVMsYUFBYSxpQkFBaUIsU0FBUyxlQUFlO0FBQUEsSUFDbkU7QUFHQSxhQUFTLGlCQUFpQixNQUFNLEVBQUUsUUFBUSxVQUFRO0FBQzlDLFdBQUssaUJBQWlCLFVBQVUsQ0FBQyxNQUFNLEVBQUUsZUFBZSxDQUFDO0FBQUEsSUFDN0QsQ0FBQztBQUdELGFBQVMsaUJBQWlCLGdCQUFnQixFQUFFLFFBQVEsT0FBSztBQUNyRCxRQUFFLGlCQUFpQixTQUFTLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQztBQUFBLElBQ3pELENBQUM7QUFBQSxFQUNMO0FBR0EsaUJBQWUsT0FBTztBQUNsQixZQUFRLElBQUksd0NBQXdDO0FBRXBELFVBQU0sV0FBVztBQUdqQixVQUFNLGNBQWMsTUFBTSxJQUFJLFFBQVEsWUFBWSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBR3pFLFVBQU0sRUFBRSxpQkFBaUIsSUFBSSxNQUFNLElBQUksUUFBUSxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztBQUM3RSxVQUFNLGtCQUFrQixvQkFBb0I7QUFFNUMsaUJBQWE7QUFDYixlQUFXO0FBRVgsVUFBTSxZQUFZO0FBQUEsRUFDdEI7QUFFQSxXQUFTLGlCQUFpQixvQkFBb0IsSUFBSTsiLAogICJuYW1lcyI6IFsibW9kdWxlIiwgImluaXRpYWxpemUiLCAicmVxdWlyZV91dGlscyIsICJyZW5kZXIiLCAicmVuZGVyIiwgIlFSQ29kZSIsICJRUkNvZGUiXQp9Cg==
