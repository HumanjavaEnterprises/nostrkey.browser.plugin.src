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
  async function newProfile() {
    let profiles = await getProfiles();
    const newProfile2 = await generateProfile("New Profile");
    profiles.push(newProfile2);
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

  // src/sidepanel.js
  var import_qrcode = __toESM(require_browser());
  var state = {
    profileNames: ["Default Nostr Profile"],
    profileIndex: 0,
    relayCount: 0,
    relays: [],
    showRelayReminder: true,
    isLocked: false,
    hasPassword: false,
    npubQrDataUrl: "",
    currentNpub: "",
    profileType: "local",
    bunkerConnected: false,
    currentView: "home",
    permissions: [],
    // Profile view state
    viewingProfileIndex: null,
    viewNsecVisible: false,
    viewNsecValue: "",
    // Profile edit state
    editingProfileIndex: null,
    // null = new profile, number = editing existing
    editProfileName: "",
    editProfileKey: "",
    keyVisible: false
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
    elements.profileList = $("profile-list");
    elements.profileDetails = $("profile-details");
    elements.profileName = $("profile-name");
    elements.npubDisplay = $("npub-display");
    elements.addProfileBtn = $("add-profile-btn");
    elements.copyNpubBtn = $("copy-npub-btn");
    elements.qrContainer = $("qr-container");
    elements.qrImage = $("qr-image");
    elements.copyQrPngBtn = $("copy-qr-png-btn");
    elements.bunkerStatus = $("bunker-status");
    elements.bunkerIndicator = $("bunker-indicator");
    elements.bunkerText = $("bunker-text");
    elements.relayReminder = $("relay-reminder");
    elements.relayCountText = $("relay-count-text");
    elements.addRelaysBtn = $("add-relays-btn");
    elements.noThanksBtn = $("no-thanks-btn");
    elements.tabBtns = document.querySelectorAll(".tab-btn");
    elements.viewSections = document.querySelectorAll(".view-section");
    elements.relayList = $("relay-list");
    elements.newRelayInput = $("new-relay-input");
    elements.addRelayBtn = $("add-relay-btn");
    elements.permissionsList = $("permissions-list");
    elements.openSettingsBtn = $("open-settings-btn");
    elements.openHistoryBtn = $("open-history-btn");
    elements.openExperimentalBtn = $("open-experimental-btn");
    elements.openVaultBtn = $("open-vault-btn");
    elements.openApikeysBtn = $("open-apikeys-btn");
    elements.profileViewTitle = $("profile-view-title");
    elements.viewProfileName = $("view-profile-name");
    elements.viewNpub = $("view-npub");
    elements.viewNsec = $("view-nsec");
    elements.backFromViewBtn = $("back-from-view-btn");
    elements.editProfileBtn = $("edit-profile-btn");
    elements.copyViewNpubBtn = $("copy-view-npub-btn");
    elements.copyViewNsecBtn = $("copy-view-nsec-btn");
    elements.toggleViewNsecBtn = $("toggle-view-nsec-btn");
    elements.profileEditTitle = $("profile-edit-title");
    elements.editProfileName = $("edit-profile-name");
    elements.editProfileKey = $("edit-profile-key");
    elements.toggleKeyVisibility = $("toggle-key-visibility");
    elements.generateKeyBtn = $("generate-key-btn");
    elements.saveProfileBtn = $("save-profile-btn");
    elements.deleteProfileBtn = $("delete-profile-btn");
    elements.backToProfilesBtn = $("back-to-profiles-btn");
    elements.profileEditError = $("profile-edit-error");
    elements.profileEditSuccess = $("profile-edit-success");
    elements.keySection = $("key-section");
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
    renderProfileList();
    renderProfileDetails();
  }
  function renderProfileList() {
    if (!elements.profileList) return;
    elements.profileList.innerHTML = state.profileNames.map((name, i) => `
        <div class="profile-item flex items-center gap-3 p-3 rounded-lg transition-colors ${i === state.profileIndex ? "bg-monokai-bg-lighter border border-monokai-accent" : "bg-monokai-bg-light border border-transparent hover:border-monokai-bg-lighter"}" data-index="${i}">
            <div class="profile-select-area flex items-center gap-3 flex-1 min-w-0 cursor-pointer" data-index="${i}">
                <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style="background:#272822;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${i === state.profileIndex ? "#a6e22e" : "#8f908a"}" stroke-width="1.5">
                        <circle cx="12" cy="8" r="4"></circle>
                        <path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path>
                    </svg>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-medium truncate" style="color:${i === state.profileIndex ? "#a6e22e" : "#f8f8f2"};">${name}</div>
                    <div class="text-xs truncate" style="color:#8f908a;">${i === state.profileIndex ? "Active" : "Click to select"}</div>
                </div>
            </div>
            <button class="profile-edit-btn flex-shrink-0" data-index="${i}" title="Edit profile" style="padding:8px;background:transparent;border:none;cursor:pointer;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8f908a" stroke-width="1.5">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            ${i === state.profileIndex ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a6e22e" stroke-width="2" class="flex-shrink-0"><path d="M20 6L9 17l-5-5"></path></svg>' : ""}
        </div>
    `).join("");
    elements.profileList.querySelectorAll(".profile-select-area").forEach((area) => {
      area.addEventListener("click", async () => {
        const idx = parseInt(area.dataset.index, 10);
        if (idx !== state.profileIndex) {
          await selectProfile(idx);
        }
      });
    });
    elements.profileList.querySelectorAll(".profile-edit-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index, 10);
        await openProfileView(idx);
      });
    });
  }
  function renderProfileDetails() {
    if (!elements.profileDetails) return;
    elements.profileDetails.classList.remove("hidden");
    elements.profileName.textContent = state.profileNames[state.profileIndex] || "Default";
    if (state.currentNpub && elements.npubDisplay) {
      elements.npubDisplay.textContent = state.currentNpub;
    }
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
    if (elements.relayCountText) {
      elements.relayCountText.textContent = `${state.relayCount} relay${state.relayCount !== 1 ? "s" : ""} configured`;
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
        state.currentNpub = "";
        return;
      }
      state.currentNpub = npub;
      state.npubQrDataUrl = await import_qrcode.default.toDataURL(npub.toUpperCase(), {
        width: 200,
        margin: 2,
        color: { dark: "#a6e22e", light: "#272822" }
      });
    } catch {
      state.npubQrDataUrl = "";
      state.currentNpub = "";
    }
  }
  async function selectProfile(index) {
    state.profileIndex = index;
    await setProfileIndex(state.profileIndex);
    await loadProfileType();
    await countRelays();
    await checkRelayReminder();
    await generateQr();
    render();
  }
  function openAddProfile() {
    state.editingProfileIndex = null;
    state.editProfileName = "";
    state.editProfileKey = "";
    state.keyVisible = false;
    showProfileEditView();
  }
  function showProfileEditView() {
    if (elements.profileEditTitle) {
      elements.profileEditTitle.textContent = state.editingProfileIndex === null ? "New Profile" : "Edit Profile";
    }
    if (elements.editProfileName) {
      elements.editProfileName.value = state.editProfileName;
    }
    if (elements.editProfileKey) {
      elements.editProfileKey.value = state.editProfileKey;
      elements.editProfileKey.type = state.keyVisible ? "text" : "password";
    }
    if (elements.deleteProfileBtn) {
      if (state.editingProfileIndex !== null && state.profileNames.length > 1) {
        elements.deleteProfileBtn.classList.remove("hidden");
      } else {
        elements.deleteProfileBtn.classList.add("hidden");
      }
    }
    if (elements.keySection) {
      if (state.editingProfileIndex !== null) {
        elements.keySection.classList.add("hidden");
      } else {
        elements.keySection.classList.remove("hidden");
      }
    }
    if (elements.profileEditError) elements.profileEditError.classList.add("hidden");
    if (elements.profileEditSuccess) elements.profileEditSuccess.classList.add("hidden");
    switchViewDirect("profile-edit");
  }
  function switchViewDirect(viewName) {
    elements.viewSections.forEach((section) => {
      section.classList.remove("active");
    });
    const targetView = document.getElementById("view-" + viewName);
    if (targetView) {
      targetView.classList.add("active");
    }
    state.currentView = viewName;
  }
  async function openProfileView(index) {
    const profile = await getProfile(index);
    if (!profile) return;
    state.viewingProfileIndex = index;
    state.viewNsecVisible = false;
    const npub = await getNpub(index);
    const nsec = await api.runtime.sendMessage({ kind: "getNsec", payload: index });
    state.viewNsecValue = nsec || "";
    if (elements.viewProfileName) {
      elements.viewProfileName.textContent = profile.name || "Unnamed";
    }
    if (elements.viewNpub) {
      elements.viewNpub.textContent = npub || "Not available";
    }
    if (elements.viewNsec) {
      elements.viewNsec.textContent = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
    }
    if (elements.copyViewNsecBtn) {
      elements.copyViewNsecBtn.classList.add("hidden");
    }
    switchViewDirect("profile-view");
  }
  function toggleViewNsec() {
    state.viewNsecVisible = !state.viewNsecVisible;
    if (elements.viewNsec) {
      elements.viewNsec.textContent = state.viewNsecVisible ? state.viewNsecValue : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
    }
    if (elements.copyViewNsecBtn) {
      if (state.viewNsecVisible) {
        elements.copyViewNsecBtn.classList.remove("hidden");
      } else {
        elements.copyViewNsecBtn.classList.add("hidden");
      }
    }
  }
  async function copyViewNpub() {
    if (elements.viewNpub) {
      await navigator.clipboard.writeText(elements.viewNpub.textContent);
    }
  }
  async function copyViewNsec() {
    if (state.viewNsecValue) {
      await navigator.clipboard.writeText(state.viewNsecValue);
    }
  }
  function goToEditFromView() {
    if (state.viewingProfileIndex !== null) {
      openEditProfile(state.viewingProfileIndex);
    }
  }
  async function openEditProfile(index) {
    const profile = await getProfile(index);
    if (!profile) return;
    state.editingProfileIndex = index;
    state.editProfileName = profile.name || "";
    state.editProfileKey = "";
    state.keyVisible = false;
    showProfileEditView();
  }
  async function generateNewKey() {
    try {
      console.log("Generating new key...");
      const newKey = await api.runtime.sendMessage({ kind: "generatePrivateKey" });
      console.log("Generated key:", newKey ? "success" : "failed");
      if (newKey && elements.editProfileKey) {
        state.editProfileKey = newKey;
        elements.editProfileKey.value = newKey;
        state.keyVisible = true;
        elements.editProfileKey.type = "text";
        showProfileSuccess("Key generated!");
      } else {
        showProfileError("Failed to generate key - no response");
      }
    } catch (e) {
      console.error("Generate key error:", e);
      showProfileError("Failed to generate key: " + e.message);
    }
  }
  function toggleKeyVisibility() {
    state.keyVisible = !state.keyVisible;
    if (elements.editProfileKey) {
      elements.editProfileKey.type = state.keyVisible ? "text" : "password";
    }
  }
  async function saveProfileChanges() {
    const name = elements.editProfileName?.value?.trim();
    if (!name) {
      showProfileError("Please enter a profile name");
      return;
    }
    try {
      if (state.editingProfileIndex === null) {
        const key = elements.editProfileKey?.value?.trim();
        if (!key) {
          showProfileError("Please enter or generate a private key");
          return;
        }
        const newIndex = await newProfile();
        await saveProfileName(newIndex, name);
        await api.runtime.sendMessage({
          kind: "savePrivateKey",
          payload: [newIndex, key]
        });
        state.profileIndex = newIndex;
        await setProfileIndex(newIndex);
        showProfileSuccess("Profile created!");
      } else {
        await saveProfileName(state.editingProfileIndex, name);
        showProfileSuccess("Profile updated!");
      }
      setTimeout(async () => {
        await loadUnlockedState();
        switchViewDirect("home");
      }, 800);
    } catch (e) {
      showProfileError("Failed to save profile: " + e.message);
    }
  }
  async function deleteCurrentProfile() {
    if (state.editingProfileIndex === null) return;
    if (state.profileNames.length <= 1) {
      showProfileError("Cannot delete the only profile");
      return;
    }
    if (!confirm("Delete this profile? This cannot be undone.")) return;
    try {
      await deleteProfile(state.editingProfileIndex);
      showProfileSuccess("Profile deleted");
      setTimeout(async () => {
        await loadUnlockedState();
        switchViewDirect("home");
      }, 800);
    } catch (e) {
      showProfileError("Failed to delete profile: " + e.message);
    }
  }
  function showProfileError(msg) {
    if (elements.profileEditError) {
      elements.profileEditError.textContent = msg;
      elements.profileEditError.classList.remove("hidden");
    }
    if (elements.profileEditSuccess) {
      elements.profileEditSuccess.classList.add("hidden");
    }
    if (elements.editProfileName && msg.toLowerCase().includes("profile name")) {
      elements.editProfileName.style.borderColor = "#f43f5e";
      elements.editProfileName.style.borderWidth = "2px";
    }
  }
  function showProfileSuccess(msg) {
    if (elements.profileEditSuccess) {
      elements.profileEditSuccess.textContent = msg;
      elements.profileEditSuccess.classList.remove("hidden");
    }
    if (elements.profileEditError) {
      elements.profileEditError.classList.add("hidden");
    }
    clearProfileErrorStyling();
  }
  function clearProfileErrorStyling() {
    if (elements.editProfileName) {
      elements.editProfileName.style.borderColor = "";
      elements.editProfileName.style.borderWidth = "";
    }
  }
  function backToProfiles() {
    switchViewDirect("home");
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
  async function copyNpub() {
    const npub = await getNpub();
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(npub);
    } else {
      await api.runtime.sendMessage({ kind: "copy", payload: npub });
    }
  }
  async function copyQrAsPng() {
    if (!elements.qrImage?.src || !state.npubQrDataUrl) return;
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const padding = 24;
      const qrSize = 200;
      const titleHeight = 40;
      canvas.width = qrSize + padding * 2;
      canvas.height = qrSize + titleHeight + padding * 2;
      ctx.fillStyle = "#3e3d32";
      ctx.roundRect(0, 0, canvas.width, canvas.height, 16);
      ctx.fill();
      const profileName = state.profileNames[state.profileIndex] || "Nostr Profile";
      ctx.fillStyle = "#f8f8f2";
      ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(profileName, canvas.width / 2, padding + 20);
      const qrImg = elements.qrImage;
      ctx.drawImage(qrImg, padding, padding + titleHeight, qrSize, qrSize);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      const btn = elements.copyQrPngBtn;
      const originalText = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => {
        btn.textContent = originalText;
      }, 1500);
    } catch (e) {
      console.error("Failed to copy QR as PNG:", e);
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
  }
  function openUrl(path) {
    const url = api.runtime.getURL(path);
    window.open(url, "nostrkey-options");
  }
  function switchView(viewName) {
    state.currentView = viewName;
    elements.tabBtns.forEach((btn) => {
      if (btn.dataset.view === viewName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    elements.viewSections.forEach((section) => {
      if (section.id === `view-${viewName}`) {
        section.classList.add("active");
      } else {
        section.classList.remove("active");
      }
    });
    if (viewName === "relays") loadRelaysView();
    if (viewName === "permissions") loadPermissionsView();
  }
  async function loadRelaysView() {
    state.relays = await getRelays(state.profileIndex);
    renderRelayList();
  }
  function renderRelayList() {
    if (!elements.relayList) return;
    if (state.relays.length === 0) {
      elements.relayList.innerHTML = '<p style="color:#8f908a;font-style:italic;">No relays configured.</p>';
      return;
    }
    elements.relayList.innerHTML = state.relays.map((relay, i) => `
        <div class="flex items-center gap-2 py-2" style="border-bottom:1px solid #49483e;">
            <span class="flex-1 text-sm" style="color:#f8f8f2;word-break:break-all;">${relay.url}</span>
            <button class="button relay-delete-btn" data-index="${i}" style="min-width:auto;padding:6px 10px;font-size:12px;">Delete</button>
        </div>
    `).join("");
    elements.relayList.querySelectorAll(".relay-delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const idx = parseInt(btn.dataset.index, 10);
        state.relays.splice(idx, 1);
        await saveRelays(state.profileIndex, state.relays);
        renderRelayList();
        await countRelays();
      });
    });
  }
  async function addSingleRelay() {
    const url = elements.newRelayInput?.value?.trim();
    if (!url || !url.startsWith("wss://")) return;
    state.relays.push({ url, read: true, write: true });
    await saveRelays(state.profileIndex, state.relays);
    elements.newRelayInput.value = "";
    renderRelayList();
    await countRelays();
  }
  async function loadPermissionsView() {
    try {
      const perms = await api.runtime.sendMessage({ kind: "getPermissions" });
      state.permissions = perms || [];
      renderPermissionsList();
    } catch {
      state.permissions = [];
      renderPermissionsList();
    }
  }
  function renderPermissionsList() {
    if (!elements.permissionsList) return;
    if (state.permissions.length === 0) {
      elements.permissionsList.innerHTML = '<p style="color:#8f908a;font-style:italic;">No permissions granted yet.</p>';
      return;
    }
    elements.permissionsList.innerHTML = state.permissions.map((p) => `
        <div class="flex items-center justify-between py-2" style="border-bottom:1px solid #49483e;">
            <span class="text-sm" style="color:#f8f8f2;">${p.host || p.origin || "Unknown"}</span>
            <span class="text-xs" style="color:#8f908a;">${p.level || "granted"}</span>
        </div>
    `).join("");
  }
  function bindEvents() {
    elements.unlockForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await doUnlock();
    });
    elements.lockBtn.addEventListener("click", doLock);
    elements.copyNpubBtn.addEventListener("click", copyNpub);
    elements.addRelaysBtn.addEventListener("click", addRelays);
    elements.noThanksBtn.addEventListener("click", noThanks);
    if (elements.copyQrPngBtn) {
      elements.copyQrPngBtn.addEventListener("click", copyQrAsPng);
    }
    if (elements.addProfileBtn) {
      elements.addProfileBtn.addEventListener("click", openAddProfile);
    }
    if (elements.backFromViewBtn) {
      elements.backFromViewBtn.addEventListener("click", () => switchViewDirect("home"));
    }
    if (elements.editProfileBtn) {
      elements.editProfileBtn.addEventListener("click", goToEditFromView);
    }
    if (elements.copyViewNpubBtn) {
      elements.copyViewNpubBtn.addEventListener("click", copyViewNpub);
    }
    if (elements.copyViewNsecBtn) {
      elements.copyViewNsecBtn.addEventListener("click", copyViewNsec);
    }
    if (elements.toggleViewNsecBtn) {
      elements.toggleViewNsecBtn.addEventListener("click", toggleViewNsec);
    }
    if (elements.backToProfilesBtn) {
      elements.backToProfilesBtn.addEventListener("click", backToProfiles);
    }
    if (elements.generateKeyBtn) {
      elements.generateKeyBtn.addEventListener("click", generateNewKey);
    }
    if (elements.toggleKeyVisibility) {
      elements.toggleKeyVisibility.addEventListener("click", toggleKeyVisibility);
    }
    if (elements.saveProfileBtn) {
      elements.saveProfileBtn.addEventListener("click", saveProfileChanges);
    }
    if (elements.deleteProfileBtn) {
      elements.deleteProfileBtn.addEventListener("click", deleteCurrentProfile);
    }
    if (elements.editProfileName) {
      elements.editProfileName.addEventListener("input", clearProfileErrorStyling);
    }
    elements.tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => switchView(btn.dataset.view));
    });
    if (elements.addRelayBtn) {
      elements.addRelayBtn.addEventListener("click", addSingleRelay);
    }
    if (elements.newRelayInput) {
      elements.newRelayInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") addSingleRelay();
      });
    }
    if (elements.openSettingsBtn) {
      elements.openSettingsBtn.addEventListener("click", openOptions);
    }
    if (elements.openHistoryBtn) {
      elements.openHistoryBtn.addEventListener("click", () => openUrl("event_history/event_history.html"));
    }
    if (elements.openExperimentalBtn) {
      elements.openExperimentalBtn.addEventListener("click", () => openUrl("experimental/experimental.html"));
    }
    if (elements.openVaultBtn) {
      elements.openVaultBtn.addEventListener("click", () => openUrl("vault/vault.html"));
    }
    if (elements.openApikeysBtn) {
      elements.openApikeysBtn.addEventListener("click", () => openUrl("api-keys/api-keys.html"));
    }
  }
  async function init() {
    console.log("NostrKey Side Panel initializing...");
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY2FuLXByb21pc2UuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS91dGlscy5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2Vycm9yLWNvcnJlY3Rpb24tbGV2ZWwuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9iaXQtYnVmZmVyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYml0LW1hdHJpeC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2FsaWdubWVudC1wYXR0ZXJuLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvZmluZGVyLXBhdHRlcm4uanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9tYXNrLXBhdHRlcm4uanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9lcnJvci1jb3JyZWN0aW9uLWNvZGUuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9nYWxvaXMtZmllbGQuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9wb2x5bm9taWFsLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvcmVlZC1zb2xvbW9uLWVuY29kZXIuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS92ZXJzaW9uLWNoZWNrLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvcmVnZXguanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9tb2RlLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvdmVyc2lvbi5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9jb3JlL2Zvcm1hdC1pbmZvLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvbnVtZXJpYy1kYXRhLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvYWxwaGFudW1lcmljLWRhdGEuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9ieXRlLWRhdGEuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9rYW5qaS1kYXRhLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9kaWprc3RyYWpzL2RpamtzdHJhLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2NvcmUvc2VnbWVudHMuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvY29yZS9xcmNvZGUuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvcmVuZGVyZXIvdXRpbHMuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvcmVuZGVyZXIvY2FudmFzLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL3JlbmRlcmVyL3N2Zy10YWcuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9saWIvYnJvd3Nlci5qcyIsICIuLi8uLi9zcmMvdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwuanMiLCAiLi4vLi4vc3JjL3V0aWxpdGllcy91dGlscy5qcyIsICIuLi8uLi9zcmMvc2lkZXBhbmVsLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBjYW4tcHJvbWlzZSBoYXMgYSBjcmFzaCBpbiBzb21lIHZlcnNpb25zIG9mIHJlYWN0IG5hdGl2ZSB0aGF0IGRvbnQgaGF2ZVxuLy8gc3RhbmRhcmQgZ2xvYmFsIG9iamVjdHNcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zb2xkYWlyL25vZGUtcXJjb2RlL2lzc3Vlcy8xNTdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0eXBlb2YgUHJvbWlzZSA9PT0gJ2Z1bmN0aW9uJyAmJiBQcm9taXNlLnByb3RvdHlwZSAmJiBQcm9taXNlLnByb3RvdHlwZS50aGVuXG59XG4iLCAibGV0IHRvU0pJU0Z1bmN0aW9uXG5jb25zdCBDT0RFV09SRFNfQ09VTlQgPSBbXG4gIDAsIC8vIE5vdCB1c2VkXG4gIDI2LCA0NCwgNzAsIDEwMCwgMTM0LCAxNzIsIDE5NiwgMjQyLCAyOTIsIDM0NixcbiAgNDA0LCA0NjYsIDUzMiwgNTgxLCA2NTUsIDczMywgODE1LCA5MDEsIDk5MSwgMTA4NSxcbiAgMTE1NiwgMTI1OCwgMTM2NCwgMTQ3NCwgMTU4OCwgMTcwNiwgMTgyOCwgMTkyMSwgMjA1MSwgMjE4NSxcbiAgMjMyMywgMjQ2NSwgMjYxMSwgMjc2MSwgMjg3NiwgMzAzNCwgMzE5NiwgMzM2MiwgMzUzMiwgMzcwNlxuXVxuXG4vKipcbiAqIFJldHVybnMgdGhlIFFSIENvZGUgc2l6ZSBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgIHNpemUgb2YgUVIgY29kZVxuICovXG5leHBvcnRzLmdldFN5bWJvbFNpemUgPSBmdW5jdGlvbiBnZXRTeW1ib2xTaXplICh2ZXJzaW9uKSB7XG4gIGlmICghdmVyc2lvbikgdGhyb3cgbmV3IEVycm9yKCdcInZlcnNpb25cIiBjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnKVxuICBpZiAodmVyc2lvbiA8IDEgfHwgdmVyc2lvbiA+IDQwKSB0aHJvdyBuZXcgRXJyb3IoJ1widmVyc2lvblwiIHNob3VsZCBiZSBpbiByYW5nZSBmcm9tIDEgdG8gNDAnKVxuICByZXR1cm4gdmVyc2lvbiAqIDQgKyAxN1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHRvdGFsIG51bWJlciBvZiBjb2Rld29yZHMgdXNlZCB0byBzdG9yZSBkYXRhIGFuZCBFQyBpbmZvcm1hdGlvbi5cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgRGF0YSBsZW5ndGggaW4gYml0c1xuICovXG5leHBvcnRzLmdldFN5bWJvbFRvdGFsQ29kZXdvcmRzID0gZnVuY3Rpb24gZ2V0U3ltYm9sVG90YWxDb2Rld29yZHMgKHZlcnNpb24pIHtcbiAgcmV0dXJuIENPREVXT1JEU19DT1VOVFt2ZXJzaW9uXVxufVxuXG4vKipcbiAqIEVuY29kZSBkYXRhIHdpdGggQm9zZS1DaGF1ZGh1cmktSG9jcXVlbmdoZW1cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGRhdGEgVmFsdWUgdG8gZW5jb2RlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgRW5jb2RlZCB2YWx1ZVxuICovXG5leHBvcnRzLmdldEJDSERpZ2l0ID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgbGV0IGRpZ2l0ID0gMFxuXG4gIHdoaWxlIChkYXRhICE9PSAwKSB7XG4gICAgZGlnaXQrK1xuICAgIGRhdGEgPj4+PSAxXG4gIH1cblxuICByZXR1cm4gZGlnaXRcbn1cblxuZXhwb3J0cy5zZXRUb1NKSVNGdW5jdGlvbiA9IGZ1bmN0aW9uIHNldFRvU0pJU0Z1bmN0aW9uIChmKSB7XG4gIGlmICh0eXBlb2YgZiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBFcnJvcignXCJ0b1NKSVNGdW5jXCIgaXMgbm90IGEgdmFsaWQgZnVuY3Rpb24uJylcbiAgfVxuXG4gIHRvU0pJU0Z1bmN0aW9uID0gZlxufVxuXG5leHBvcnRzLmlzS2FuamlNb2RlRW5hYmxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHR5cGVvZiB0b1NKSVNGdW5jdGlvbiAhPT0gJ3VuZGVmaW5lZCdcbn1cblxuZXhwb3J0cy50b1NKSVMgPSBmdW5jdGlvbiB0b1NKSVMgKGthbmppKSB7XG4gIHJldHVybiB0b1NKSVNGdW5jdGlvbihrYW5qaSlcbn1cbiIsICJleHBvcnRzLkwgPSB7IGJpdDogMSB9XG5leHBvcnRzLk0gPSB7IGJpdDogMCB9XG5leHBvcnRzLlEgPSB7IGJpdDogMyB9XG5leHBvcnRzLkggPSB7IGJpdDogMiB9XG5cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHN0cmluZykge1xuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcmFtIGlzIG5vdCBhIHN0cmluZycpXG4gIH1cblxuICBjb25zdCBsY1N0ciA9IHN0cmluZy50b0xvd2VyQ2FzZSgpXG5cbiAgc3dpdGNoIChsY1N0cikge1xuICAgIGNhc2UgJ2wnOlxuICAgIGNhc2UgJ2xvdyc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5MXG5cbiAgICBjYXNlICdtJzpcbiAgICBjYXNlICdtZWRpdW0nOlxuICAgICAgcmV0dXJuIGV4cG9ydHMuTVxuXG4gICAgY2FzZSAncSc6XG4gICAgY2FzZSAncXVhcnRpbGUnOlxuICAgICAgcmV0dXJuIGV4cG9ydHMuUVxuXG4gICAgY2FzZSAnaCc6XG4gICAgY2FzZSAnaGlnaCc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5IXG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIEVDIExldmVsOiAnICsgc3RyaW5nKVxuICB9XG59XG5cbmV4cG9ydHMuaXNWYWxpZCA9IGZ1bmN0aW9uIGlzVmFsaWQgKGxldmVsKSB7XG4gIHJldHVybiBsZXZlbCAmJiB0eXBlb2YgbGV2ZWwuYml0ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIGxldmVsLmJpdCA+PSAwICYmIGxldmVsLmJpdCA8IDRcbn1cblxuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSAodmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAoZXhwb3J0cy5pc1ZhbGlkKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gZnJvbVN0cmluZyh2YWx1ZSlcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgfVxufVxuIiwgImZ1bmN0aW9uIEJpdEJ1ZmZlciAoKSB7XG4gIHRoaXMuYnVmZmVyID0gW11cbiAgdGhpcy5sZW5ndGggPSAwXG59XG5cbkJpdEJ1ZmZlci5wcm90b3R5cGUgPSB7XG5cbiAgZ2V0OiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICBjb25zdCBidWZJbmRleCA9IE1hdGguZmxvb3IoaW5kZXggLyA4KVxuICAgIHJldHVybiAoKHRoaXMuYnVmZmVyW2J1ZkluZGV4XSA+Pj4gKDcgLSBpbmRleCAlIDgpKSAmIDEpID09PSAxXG4gIH0sXG5cbiAgcHV0OiBmdW5jdGlvbiAobnVtLCBsZW5ndGgpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLnB1dEJpdCgoKG51bSA+Pj4gKGxlbmd0aCAtIGkgLSAxKSkgJiAxKSA9PT0gMSlcbiAgICB9XG4gIH0sXG5cbiAgZ2V0TGVuZ3RoSW5CaXRzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMubGVuZ3RoXG4gIH0sXG5cbiAgcHV0Qml0OiBmdW5jdGlvbiAoYml0KSB7XG4gICAgY29uc3QgYnVmSW5kZXggPSBNYXRoLmZsb29yKHRoaXMubGVuZ3RoIC8gOClcbiAgICBpZiAodGhpcy5idWZmZXIubGVuZ3RoIDw9IGJ1ZkluZGV4KSB7XG4gICAgICB0aGlzLmJ1ZmZlci5wdXNoKDApXG4gICAgfVxuXG4gICAgaWYgKGJpdCkge1xuICAgICAgdGhpcy5idWZmZXJbYnVmSW5kZXhdIHw9ICgweDgwID4+PiAodGhpcy5sZW5ndGggJSA4KSlcbiAgICB9XG5cbiAgICB0aGlzLmxlbmd0aCsrXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCaXRCdWZmZXJcbiIsICIvKipcbiAqIEhlbHBlciBjbGFzcyB0byBoYW5kbGUgUVIgQ29kZSBzeW1ib2wgbW9kdWxlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzaXplIFN5bWJvbCBzaXplXG4gKi9cbmZ1bmN0aW9uIEJpdE1hdHJpeCAoc2l6ZSkge1xuICBpZiAoIXNpemUgfHwgc2l6ZSA8IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0JpdE1hdHJpeCBzaXplIG11c3QgYmUgZGVmaW5lZCBhbmQgZ3JlYXRlciB0aGFuIDAnKVxuICB9XG5cbiAgdGhpcy5zaXplID0gc2l6ZVxuICB0aGlzLmRhdGEgPSBuZXcgVWludDhBcnJheShzaXplICogc2l6ZSlcbiAgdGhpcy5yZXNlcnZlZEJpdCA9IG5ldyBVaW50OEFycmF5KHNpemUgKiBzaXplKVxufVxuXG4vKipcbiAqIFNldCBiaXQgdmFsdWUgYXQgc3BlY2lmaWVkIGxvY2F0aW9uXG4gKiBJZiByZXNlcnZlZCBmbGFnIGlzIHNldCwgdGhpcyBiaXQgd2lsbCBiZSBpZ25vcmVkIGR1cmluZyBtYXNraW5nIHByb2Nlc3NcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gIHJvd1xuICogQHBhcmFtIHtOdW1iZXJ9ICBjb2xcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdmFsdWVcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVzZXJ2ZWRcbiAqL1xuQml0TWF0cml4LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAocm93LCBjb2wsIHZhbHVlLCByZXNlcnZlZCkge1xuICBjb25zdCBpbmRleCA9IHJvdyAqIHRoaXMuc2l6ZSArIGNvbFxuICB0aGlzLmRhdGFbaW5kZXhdID0gdmFsdWVcbiAgaWYgKHJlc2VydmVkKSB0aGlzLnJlc2VydmVkQml0W2luZGV4XSA9IHRydWVcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGJpdCB2YWx1ZSBhdCBzcGVjaWZpZWQgbG9jYXRpb25cbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICByb3dcbiAqIEBwYXJhbSAge051bWJlcn0gIGNvbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuQml0TWF0cml4LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgcmV0dXJuIHRoaXMuZGF0YVtyb3cgKiB0aGlzLnNpemUgKyBjb2xdXG59XG5cbi8qKlxuICogQXBwbGllcyB4b3Igb3BlcmF0b3IgYXQgc3BlY2lmaWVkIGxvY2F0aW9uXG4gKiAodXNlZCBkdXJpbmcgbWFza2luZyBwcm9jZXNzKVxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSAgcm93XG4gKiBAcGFyYW0ge051bWJlcn0gIGNvbFxuICogQHBhcmFtIHtCb29sZWFufSB2YWx1ZVxuICovXG5CaXRNYXRyaXgucHJvdG90eXBlLnhvciA9IGZ1bmN0aW9uIChyb3csIGNvbCwgdmFsdWUpIHtcbiAgdGhpcy5kYXRhW3JvdyAqIHRoaXMuc2l6ZSArIGNvbF0gXj0gdmFsdWVcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBiaXQgYXQgc3BlY2lmaWVkIGxvY2F0aW9uIGlzIHJlc2VydmVkXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9ICAgcm93XG4gKiBAcGFyYW0ge051bWJlcn0gICBjb2xcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbkJpdE1hdHJpeC5wcm90b3R5cGUuaXNSZXNlcnZlZCA9IGZ1bmN0aW9uIChyb3csIGNvbCkge1xuICByZXR1cm4gdGhpcy5yZXNlcnZlZEJpdFtyb3cgKiB0aGlzLnNpemUgKyBjb2xdXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQml0TWF0cml4XG4iLCAiLyoqXG4gKiBBbGlnbm1lbnQgcGF0dGVybiBhcmUgZml4ZWQgcmVmZXJlbmNlIHBhdHRlcm4gaW4gZGVmaW5lZCBwb3NpdGlvbnNcbiAqIGluIGEgbWF0cml4IHN5bWJvbG9neSwgd2hpY2ggZW5hYmxlcyB0aGUgZGVjb2RlIHNvZnR3YXJlIHRvIHJlLXN5bmNocm9uaXNlXG4gKiB0aGUgY29vcmRpbmF0ZSBtYXBwaW5nIG9mIHRoZSBpbWFnZSBtb2R1bGVzIGluIHRoZSBldmVudCBvZiBtb2RlcmF0ZSBhbW91bnRzXG4gKiBvZiBkaXN0b3J0aW9uIG9mIHRoZSBpbWFnZS5cbiAqXG4gKiBBbGlnbm1lbnQgcGF0dGVybnMgYXJlIHByZXNlbnQgb25seSBpbiBRUiBDb2RlIHN5bWJvbHMgb2YgdmVyc2lvbiAyIG9yIGxhcmdlclxuICogYW5kIHRoZWlyIG51bWJlciBkZXBlbmRzIG9uIHRoZSBzeW1ib2wgdmVyc2lvbi5cbiAqL1xuXG5jb25zdCBnZXRTeW1ib2xTaXplID0gcmVxdWlyZSgnLi91dGlscycpLmdldFN5bWJvbFNpemVcblxuLyoqXG4gKiBDYWxjdWxhdGUgdGhlIHJvdy9jb2x1bW4gY29vcmRpbmF0ZXMgb2YgdGhlIGNlbnRlciBtb2R1bGUgb2YgZWFjaCBhbGlnbm1lbnQgcGF0dGVyblxuICogZm9yIHRoZSBzcGVjaWZpZWQgUVIgQ29kZSB2ZXJzaW9uLlxuICpcbiAqIFRoZSBhbGlnbm1lbnQgcGF0dGVybnMgYXJlIHBvc2l0aW9uZWQgc3ltbWV0cmljYWxseSBvbiBlaXRoZXIgc2lkZSBvZiB0aGUgZGlhZ29uYWxcbiAqIHJ1bm5pbmcgZnJvbSB0aGUgdG9wIGxlZnQgY29ybmVyIG9mIHRoZSBzeW1ib2wgdG8gdGhlIGJvdHRvbSByaWdodCBjb3JuZXIuXG4gKlxuICogU2luY2UgcG9zaXRpb25zIGFyZSBzaW1tZXRyaWNhbCBvbmx5IGhhbGYgb2YgdGhlIGNvb3JkaW5hdGVzIGFyZSByZXR1cm5lZC5cbiAqIEVhY2ggaXRlbSBvZiB0aGUgYXJyYXkgd2lsbCByZXByZXNlbnQgaW4gdHVybiB0aGUgeCBhbmQgeSBjb29yZGluYXRlLlxuICogQHNlZSB7QGxpbmsgZ2V0UG9zaXRpb25zfVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICBBcnJheSBvZiBjb29yZGluYXRlXG4gKi9cbmV4cG9ydHMuZ2V0Um93Q29sQ29vcmRzID0gZnVuY3Rpb24gZ2V0Um93Q29sQ29vcmRzICh2ZXJzaW9uKSB7XG4gIGlmICh2ZXJzaW9uID09PSAxKSByZXR1cm4gW11cblxuICBjb25zdCBwb3NDb3VudCA9IE1hdGguZmxvb3IodmVyc2lvbiAvIDcpICsgMlxuICBjb25zdCBzaXplID0gZ2V0U3ltYm9sU2l6ZSh2ZXJzaW9uKVxuICBjb25zdCBpbnRlcnZhbHMgPSBzaXplID09PSAxNDUgPyAyNiA6IE1hdGguY2VpbCgoc2l6ZSAtIDEzKSAvICgyICogcG9zQ291bnQgLSAyKSkgKiAyXG4gIGNvbnN0IHBvc2l0aW9ucyA9IFtzaXplIC0gN10gLy8gTGFzdCBjb29yZCBpcyBhbHdheXMgKHNpemUgLSA3KVxuXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgcG9zQ291bnQgLSAxOyBpKyspIHtcbiAgICBwb3NpdGlvbnNbaV0gPSBwb3NpdGlvbnNbaSAtIDFdIC0gaW50ZXJ2YWxzXG4gIH1cblxuICBwb3NpdGlvbnMucHVzaCg2KSAvLyBGaXJzdCBjb29yZCBpcyBhbHdheXMgNlxuXG4gIHJldHVybiBwb3NpdGlvbnMucmV2ZXJzZSgpXG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBwb3NpdGlvbnMgb2YgZWFjaCBhbGlnbm1lbnQgcGF0dGVybi5cbiAqIEVhY2ggYXJyYXkncyBlbGVtZW50IHJlcHJlc2VudCB0aGUgY2VudGVyIHBvaW50IG9mIHRoZSBwYXR0ZXJuIGFzICh4LCB5KSBjb29yZGluYXRlc1xuICpcbiAqIENvb3JkaW5hdGVzIGFyZSBjYWxjdWxhdGVkIGV4cGFuZGluZyB0aGUgcm93L2NvbHVtbiBjb29yZGluYXRlcyByZXR1cm5lZCBieSB7QGxpbmsgZ2V0Um93Q29sQ29vcmRzfVxuICogYW5kIGZpbHRlcmluZyBvdXQgdGhlIGl0ZW1zIHRoYXQgb3ZlcmxhcHMgd2l0aCBmaW5kZXIgcGF0dGVyblxuICpcbiAqIEBleGFtcGxlXG4gKiBGb3IgYSBWZXJzaW9uIDcgc3ltYm9sIHtAbGluayBnZXRSb3dDb2xDb29yZHN9IHJldHVybnMgdmFsdWVzIDYsIDIyIGFuZCAzOC5cbiAqIFRoZSBhbGlnbm1lbnQgcGF0dGVybnMsIHRoZXJlZm9yZSwgYXJlIHRvIGJlIGNlbnRlcmVkIG9uIChyb3csIGNvbHVtbilcbiAqIHBvc2l0aW9ucyAoNiwyMiksICgyMiw2KSwgKDIyLDIyKSwgKDIyLDM4KSwgKDM4LDIyKSwgKDM4LDM4KS5cbiAqIE5vdGUgdGhhdCB0aGUgY29vcmRpbmF0ZXMgKDYsNiksICg2LDM4KSwgKDM4LDYpIGFyZSBvY2N1cGllZCBieSBmaW5kZXIgcGF0dGVybnNcbiAqIGFuZCBhcmUgbm90IHRoZXJlZm9yZSB1c2VkIGZvciBhbGlnbm1lbnQgcGF0dGVybnMuXG4gKlxuICogbGV0IHBvcyA9IGdldFBvc2l0aW9ucyg3KVxuICogLy8gW1s2LDIyXSwgWzIyLDZdLCBbMjIsMjJdLCBbMjIsMzhdLCBbMzgsMjJdLCBbMzgsMzhdXVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICBBcnJheSBvZiBjb29yZGluYXRlc1xuICovXG5leHBvcnRzLmdldFBvc2l0aW9ucyA9IGZ1bmN0aW9uIGdldFBvc2l0aW9ucyAodmVyc2lvbikge1xuICBjb25zdCBjb29yZHMgPSBbXVxuICBjb25zdCBwb3MgPSBleHBvcnRzLmdldFJvd0NvbENvb3Jkcyh2ZXJzaW9uKVxuICBjb25zdCBwb3NMZW5ndGggPSBwb3MubGVuZ3RoXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3NMZW5ndGg7IGkrKykge1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zTGVuZ3RoOyBqKyspIHtcbiAgICAgIC8vIFNraXAgaWYgcG9zaXRpb24gaXMgb2NjdXBpZWQgYnkgZmluZGVyIHBhdHRlcm5zXG4gICAgICBpZiAoKGkgPT09IDAgJiYgaiA9PT0gMCkgfHwgLy8gdG9wLWxlZnRcbiAgICAgICAgICAoaSA9PT0gMCAmJiBqID09PSBwb3NMZW5ndGggLSAxKSB8fCAvLyBib3R0b20tbGVmdFxuICAgICAgICAgIChpID09PSBwb3NMZW5ndGggLSAxICYmIGogPT09IDApKSB7IC8vIHRvcC1yaWdodFxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBjb29yZHMucHVzaChbcG9zW2ldLCBwb3Nbal1dKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb29yZHNcbn1cbiIsICJjb25zdCBnZXRTeW1ib2xTaXplID0gcmVxdWlyZSgnLi91dGlscycpLmdldFN5bWJvbFNpemVcbmNvbnN0IEZJTkRFUl9QQVRURVJOX1NJWkUgPSA3XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBwb3NpdGlvbnMgb2YgZWFjaCBmaW5kZXIgcGF0dGVybi5cbiAqIEVhY2ggYXJyYXkncyBlbGVtZW50IHJlcHJlc2VudCB0aGUgdG9wLWxlZnQgcG9pbnQgb2YgdGhlIHBhdHRlcm4gYXMgKHgsIHkpIGNvb3JkaW5hdGVzXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgIEFycmF5IG9mIGNvb3JkaW5hdGVzXG4gKi9cbmV4cG9ydHMuZ2V0UG9zaXRpb25zID0gZnVuY3Rpb24gZ2V0UG9zaXRpb25zICh2ZXJzaW9uKSB7XG4gIGNvbnN0IHNpemUgPSBnZXRTeW1ib2xTaXplKHZlcnNpb24pXG5cbiAgcmV0dXJuIFtcbiAgICAvLyB0b3AtbGVmdFxuICAgIFswLCAwXSxcbiAgICAvLyB0b3AtcmlnaHRcbiAgICBbc2l6ZSAtIEZJTkRFUl9QQVRURVJOX1NJWkUsIDBdLFxuICAgIC8vIGJvdHRvbS1sZWZ0XG4gICAgWzAsIHNpemUgLSBGSU5ERVJfUEFUVEVSTl9TSVpFXVxuICBdXG59XG4iLCAiLyoqXG4gKiBEYXRhIG1hc2sgcGF0dGVybiByZWZlcmVuY2VcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmV4cG9ydHMuUGF0dGVybnMgPSB7XG4gIFBBVFRFUk4wMDA6IDAsXG4gIFBBVFRFUk4wMDE6IDEsXG4gIFBBVFRFUk4wMTA6IDIsXG4gIFBBVFRFUk4wMTE6IDMsXG4gIFBBVFRFUk4xMDA6IDQsXG4gIFBBVFRFUk4xMDE6IDUsXG4gIFBBVFRFUk4xMTA6IDYsXG4gIFBBVFRFUk4xMTE6IDdcbn1cblxuLyoqXG4gKiBXZWlnaHRlZCBwZW5hbHR5IHNjb3JlcyBmb3IgdGhlIHVuZGVzaXJhYmxlIGZlYXR1cmVzXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5jb25zdCBQZW5hbHR5U2NvcmVzID0ge1xuICBOMTogMyxcbiAgTjI6IDMsXG4gIE4zOiA0MCxcbiAgTjQ6IDEwXG59XG5cbi8qKlxuICogQ2hlY2sgaWYgbWFzayBwYXR0ZXJuIHZhbHVlIGlzIHZhbGlkXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSAgbWFzayAgICBNYXNrIHBhdHRlcm5cbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgdHJ1ZSBpZiB2YWxpZCwgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydHMuaXNWYWxpZCA9IGZ1bmN0aW9uIGlzVmFsaWQgKG1hc2spIHtcbiAgcmV0dXJuIG1hc2sgIT0gbnVsbCAmJiBtYXNrICE9PSAnJyAmJiAhaXNOYU4obWFzaykgJiYgbWFzayA+PSAwICYmIG1hc2sgPD0gN1xufVxuXG4vKipcbiAqIFJldHVybnMgbWFzayBwYXR0ZXJuIGZyb20gYSB2YWx1ZS5cbiAqIElmIHZhbHVlIGlzIG5vdCB2YWxpZCwgcmV0dXJucyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ8U3RyaW5nfSB2YWx1ZSAgICAgICAgTWFzayBwYXR0ZXJuIHZhbHVlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgVmFsaWQgbWFzayBwYXR0ZXJuIG9yIHVuZGVmaW5lZFxuICovXG5leHBvcnRzLmZyb20gPSBmdW5jdGlvbiBmcm9tICh2YWx1ZSkge1xuICByZXR1cm4gZXhwb3J0cy5pc1ZhbGlkKHZhbHVlKSA/IHBhcnNlSW50KHZhbHVlLCAxMCkgOiB1bmRlZmluZWRcbn1cblxuLyoqXG4qIEZpbmQgYWRqYWNlbnQgbW9kdWxlcyBpbiByb3cvY29sdW1uIHdpdGggdGhlIHNhbWUgY29sb3JcbiogYW5kIGFzc2lnbiBhIHBlbmFsdHkgdmFsdWUuXG4qXG4qIFBvaW50czogTjEgKyBpXG4qIGkgaXMgdGhlIGFtb3VudCBieSB3aGljaCB0aGUgbnVtYmVyIG9mIGFkamFjZW50IG1vZHVsZXMgb2YgdGhlIHNhbWUgY29sb3IgZXhjZWVkcyA1XG4qL1xuZXhwb3J0cy5nZXRQZW5hbHR5TjEgPSBmdW5jdGlvbiBnZXRQZW5hbHR5TjEgKGRhdGEpIHtcbiAgY29uc3Qgc2l6ZSA9IGRhdGEuc2l6ZVxuICBsZXQgcG9pbnRzID0gMFxuICBsZXQgc2FtZUNvdW50Q29sID0gMFxuICBsZXQgc2FtZUNvdW50Um93ID0gMFxuICBsZXQgbGFzdENvbCA9IG51bGxcbiAgbGV0IGxhc3RSb3cgPSBudWxsXG5cbiAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgc2l6ZTsgcm93KyspIHtcbiAgICBzYW1lQ291bnRDb2wgPSBzYW1lQ291bnRSb3cgPSAwXG4gICAgbGFzdENvbCA9IGxhc3RSb3cgPSBudWxsXG5cbiAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBzaXplOyBjb2wrKykge1xuICAgICAgbGV0IG1vZHVsZSA9IGRhdGEuZ2V0KHJvdywgY29sKVxuICAgICAgaWYgKG1vZHVsZSA9PT0gbGFzdENvbCkge1xuICAgICAgICBzYW1lQ291bnRDb2wrK1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNhbWVDb3VudENvbCA+PSA1KSBwb2ludHMgKz0gUGVuYWx0eVNjb3Jlcy5OMSArIChzYW1lQ291bnRDb2wgLSA1KVxuICAgICAgICBsYXN0Q29sID0gbW9kdWxlXG4gICAgICAgIHNhbWVDb3VudENvbCA9IDFcbiAgICAgIH1cblxuICAgICAgbW9kdWxlID0gZGF0YS5nZXQoY29sLCByb3cpXG4gICAgICBpZiAobW9kdWxlID09PSBsYXN0Um93KSB7XG4gICAgICAgIHNhbWVDb3VudFJvdysrXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc2FtZUNvdW50Um93ID49IDUpIHBvaW50cyArPSBQZW5hbHR5U2NvcmVzLk4xICsgKHNhbWVDb3VudFJvdyAtIDUpXG4gICAgICAgIGxhc3RSb3cgPSBtb2R1bGVcbiAgICAgICAgc2FtZUNvdW50Um93ID0gMVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzYW1lQ291bnRDb2wgPj0gNSkgcG9pbnRzICs9IFBlbmFsdHlTY29yZXMuTjEgKyAoc2FtZUNvdW50Q29sIC0gNSlcbiAgICBpZiAoc2FtZUNvdW50Um93ID49IDUpIHBvaW50cyArPSBQZW5hbHR5U2NvcmVzLk4xICsgKHNhbWVDb3VudFJvdyAtIDUpXG4gIH1cblxuICByZXR1cm4gcG9pbnRzXG59XG5cbi8qKlxuICogRmluZCAyeDIgYmxvY2tzIHdpdGggdGhlIHNhbWUgY29sb3IgYW5kIGFzc2lnbiBhIHBlbmFsdHkgdmFsdWVcbiAqXG4gKiBQb2ludHM6IE4yICogKG0gLSAxKSAqIChuIC0gMSlcbiAqL1xuZXhwb3J0cy5nZXRQZW5hbHR5TjIgPSBmdW5jdGlvbiBnZXRQZW5hbHR5TjIgKGRhdGEpIHtcbiAgY29uc3Qgc2l6ZSA9IGRhdGEuc2l6ZVxuICBsZXQgcG9pbnRzID0gMFxuXG4gIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHNpemUgLSAxOyByb3crKykge1xuICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IHNpemUgLSAxOyBjb2wrKykge1xuICAgICAgY29uc3QgbGFzdCA9IGRhdGEuZ2V0KHJvdywgY29sKSArXG4gICAgICAgIGRhdGEuZ2V0KHJvdywgY29sICsgMSkgK1xuICAgICAgICBkYXRhLmdldChyb3cgKyAxLCBjb2wpICtcbiAgICAgICAgZGF0YS5nZXQocm93ICsgMSwgY29sICsgMSlcblxuICAgICAgaWYgKGxhc3QgPT09IDQgfHwgbGFzdCA9PT0gMCkgcG9pbnRzKytcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcG9pbnRzICogUGVuYWx0eVNjb3Jlcy5OMlxufVxuXG4vKipcbiAqIEZpbmQgMToxOjM6MToxIHJhdGlvIChkYXJrOmxpZ2h0OmRhcms6bGlnaHQ6ZGFyaykgcGF0dGVybiBpbiByb3cvY29sdW1uLFxuICogcHJlY2VkZWQgb3IgZm9sbG93ZWQgYnkgbGlnaHQgYXJlYSA0IG1vZHVsZXMgd2lkZVxuICpcbiAqIFBvaW50czogTjMgKiBudW1iZXIgb2YgcGF0dGVybiBmb3VuZFxuICovXG5leHBvcnRzLmdldFBlbmFsdHlOMyA9IGZ1bmN0aW9uIGdldFBlbmFsdHlOMyAoZGF0YSkge1xuICBjb25zdCBzaXplID0gZGF0YS5zaXplXG4gIGxldCBwb2ludHMgPSAwXG4gIGxldCBiaXRzQ29sID0gMFxuICBsZXQgYml0c1JvdyA9IDBcblxuICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBzaXplOyByb3crKykge1xuICAgIGJpdHNDb2wgPSBiaXRzUm93ID0gMFxuICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IHNpemU7IGNvbCsrKSB7XG4gICAgICBiaXRzQ29sID0gKChiaXRzQ29sIDw8IDEpICYgMHg3RkYpIHwgZGF0YS5nZXQocm93LCBjb2wpXG4gICAgICBpZiAoY29sID49IDEwICYmIChiaXRzQ29sID09PSAweDVEMCB8fCBiaXRzQ29sID09PSAweDA1RCkpIHBvaW50cysrXG5cbiAgICAgIGJpdHNSb3cgPSAoKGJpdHNSb3cgPDwgMSkgJiAweDdGRikgfCBkYXRhLmdldChjb2wsIHJvdylcbiAgICAgIGlmIChjb2wgPj0gMTAgJiYgKGJpdHNSb3cgPT09IDB4NUQwIHx8IGJpdHNSb3cgPT09IDB4MDVEKSkgcG9pbnRzKytcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcG9pbnRzICogUGVuYWx0eVNjb3Jlcy5OM1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZSBwcm9wb3J0aW9uIG9mIGRhcmsgbW9kdWxlcyBpbiBlbnRpcmUgc3ltYm9sXG4gKlxuICogUG9pbnRzOiBONCAqIGtcbiAqXG4gKiBrIGlzIHRoZSByYXRpbmcgb2YgdGhlIGRldmlhdGlvbiBvZiB0aGUgcHJvcG9ydGlvbiBvZiBkYXJrIG1vZHVsZXNcbiAqIGluIHRoZSBzeW1ib2wgZnJvbSA1MCUgaW4gc3RlcHMgb2YgNSVcbiAqL1xuZXhwb3J0cy5nZXRQZW5hbHR5TjQgPSBmdW5jdGlvbiBnZXRQZW5hbHR5TjQgKGRhdGEpIHtcbiAgbGV0IGRhcmtDb3VudCA9IDBcbiAgY29uc3QgbW9kdWxlc0NvdW50ID0gZGF0YS5kYXRhLmxlbmd0aFxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbW9kdWxlc0NvdW50OyBpKyspIGRhcmtDb3VudCArPSBkYXRhLmRhdGFbaV1cblxuICBjb25zdCBrID0gTWF0aC5hYnMoTWF0aC5jZWlsKChkYXJrQ291bnQgKiAxMDAgLyBtb2R1bGVzQ291bnQpIC8gNSkgLSAxMClcblxuICByZXR1cm4gayAqIFBlbmFsdHlTY29yZXMuTjRcbn1cblxuLyoqXG4gKiBSZXR1cm4gbWFzayB2YWx1ZSBhdCBnaXZlbiBwb3NpdGlvblxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gbWFza1BhdHRlcm4gUGF0dGVybiByZWZlcmVuY2UgdmFsdWVcbiAqIEBwYXJhbSAge051bWJlcn0gaSAgICAgICAgICAgUm93XG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGogICAgICAgICAgIENvbHVtblxuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAgICAgICBNYXNrIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGdldE1hc2tBdCAobWFza1BhdHRlcm4sIGksIGopIHtcbiAgc3dpdGNoIChtYXNrUGF0dGVybikge1xuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMDAwOiByZXR1cm4gKGkgKyBqKSAlIDIgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjAwMTogcmV0dXJuIGkgJSAyID09PSAwXG4gICAgY2FzZSBleHBvcnRzLlBhdHRlcm5zLlBBVFRFUk4wMTA6IHJldHVybiBqICUgMyA9PT0gMFxuICAgIGNhc2UgZXhwb3J0cy5QYXR0ZXJucy5QQVRURVJOMDExOiByZXR1cm4gKGkgKyBqKSAlIDMgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjEwMDogcmV0dXJuIChNYXRoLmZsb29yKGkgLyAyKSArIE1hdGguZmxvb3IoaiAvIDMpKSAlIDIgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjEwMTogcmV0dXJuIChpICogaikgJSAyICsgKGkgKiBqKSAlIDMgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjExMDogcmV0dXJuICgoaSAqIGopICUgMiArIChpICogaikgJSAzKSAlIDIgPT09IDBcbiAgICBjYXNlIGV4cG9ydHMuUGF0dGVybnMuUEFUVEVSTjExMTogcmV0dXJuICgoaSAqIGopICUgMyArIChpICsgaikgJSAyKSAlIDIgPT09IDBcblxuICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcignYmFkIG1hc2tQYXR0ZXJuOicgKyBtYXNrUGF0dGVybilcbiAgfVxufVxuXG4vKipcbiAqIEFwcGx5IGEgbWFzayBwYXR0ZXJuIHRvIGEgQml0TWF0cml4XG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSAgICBwYXR0ZXJuIFBhdHRlcm4gcmVmZXJlbmNlIG51bWJlclxuICogQHBhcmFtICB7Qml0TWF0cml4fSBkYXRhICAgIEJpdE1hdHJpeCBkYXRhXG4gKi9cbmV4cG9ydHMuYXBwbHlNYXNrID0gZnVuY3Rpb24gYXBwbHlNYXNrIChwYXR0ZXJuLCBkYXRhKSB7XG4gIGNvbnN0IHNpemUgPSBkYXRhLnNpemVcblxuICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBzaXplOyBjb2wrKykge1xuICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IHNpemU7IHJvdysrKSB7XG4gICAgICBpZiAoZGF0YS5pc1Jlc2VydmVkKHJvdywgY29sKSkgY29udGludWVcbiAgICAgIGRhdGEueG9yKHJvdywgY29sLCBnZXRNYXNrQXQocGF0dGVybiwgcm93LCBjb2wpKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGJlc3QgbWFzayBwYXR0ZXJuIGZvciBkYXRhXG4gKlxuICogQHBhcmFtICB7Qml0TWF0cml4fSBkYXRhXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IE1hc2sgcGF0dGVybiByZWZlcmVuY2UgbnVtYmVyXG4gKi9cbmV4cG9ydHMuZ2V0QmVzdE1hc2sgPSBmdW5jdGlvbiBnZXRCZXN0TWFzayAoZGF0YSwgc2V0dXBGb3JtYXRGdW5jKSB7XG4gIGNvbnN0IG51bVBhdHRlcm5zID0gT2JqZWN0LmtleXMoZXhwb3J0cy5QYXR0ZXJucykubGVuZ3RoXG4gIGxldCBiZXN0UGF0dGVybiA9IDBcbiAgbGV0IGxvd2VyUGVuYWx0eSA9IEluZmluaXR5XG5cbiAgZm9yIChsZXQgcCA9IDA7IHAgPCBudW1QYXR0ZXJuczsgcCsrKSB7XG4gICAgc2V0dXBGb3JtYXRGdW5jKHApXG4gICAgZXhwb3J0cy5hcHBseU1hc2socCwgZGF0YSlcblxuICAgIC8vIENhbGN1bGF0ZSBwZW5hbHR5XG4gICAgY29uc3QgcGVuYWx0eSA9XG4gICAgICBleHBvcnRzLmdldFBlbmFsdHlOMShkYXRhKSArXG4gICAgICBleHBvcnRzLmdldFBlbmFsdHlOMihkYXRhKSArXG4gICAgICBleHBvcnRzLmdldFBlbmFsdHlOMyhkYXRhKSArXG4gICAgICBleHBvcnRzLmdldFBlbmFsdHlONChkYXRhKVxuXG4gICAgLy8gVW5kbyBwcmV2aW91c2x5IGFwcGxpZWQgbWFza1xuICAgIGV4cG9ydHMuYXBwbHlNYXNrKHAsIGRhdGEpXG5cbiAgICBpZiAocGVuYWx0eSA8IGxvd2VyUGVuYWx0eSkge1xuICAgICAgbG93ZXJQZW5hbHR5ID0gcGVuYWx0eVxuICAgICAgYmVzdFBhdHRlcm4gPSBwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJlc3RQYXR0ZXJuXG59XG4iLCAiY29uc3QgRUNMZXZlbCA9IHJlcXVpcmUoJy4vZXJyb3ItY29ycmVjdGlvbi1sZXZlbCcpXHJcblxyXG5jb25zdCBFQ19CTE9DS1NfVEFCTEUgPSBbXHJcbi8vIEwgIE0gIFEgIEhcclxuICAxLCAxLCAxLCAxLFxyXG4gIDEsIDEsIDEsIDEsXHJcbiAgMSwgMSwgMiwgMixcclxuICAxLCAyLCAyLCA0LFxyXG4gIDEsIDIsIDQsIDQsXHJcbiAgMiwgNCwgNCwgNCxcclxuICAyLCA0LCA2LCA1LFxyXG4gIDIsIDQsIDYsIDYsXHJcbiAgMiwgNSwgOCwgOCxcclxuICA0LCA1LCA4LCA4LFxyXG4gIDQsIDUsIDgsIDExLFxyXG4gIDQsIDgsIDEwLCAxMSxcclxuICA0LCA5LCAxMiwgMTYsXHJcbiAgNCwgOSwgMTYsIDE2LFxyXG4gIDYsIDEwLCAxMiwgMTgsXHJcbiAgNiwgMTAsIDE3LCAxNixcclxuICA2LCAxMSwgMTYsIDE5LFxyXG4gIDYsIDEzLCAxOCwgMjEsXHJcbiAgNywgMTQsIDIxLCAyNSxcclxuICA4LCAxNiwgMjAsIDI1LFxyXG4gIDgsIDE3LCAyMywgMjUsXHJcbiAgOSwgMTcsIDIzLCAzNCxcclxuICA5LCAxOCwgMjUsIDMwLFxyXG4gIDEwLCAyMCwgMjcsIDMyLFxyXG4gIDEyLCAyMSwgMjksIDM1LFxyXG4gIDEyLCAyMywgMzQsIDM3LFxyXG4gIDEyLCAyNSwgMzQsIDQwLFxyXG4gIDEzLCAyNiwgMzUsIDQyLFxyXG4gIDE0LCAyOCwgMzgsIDQ1LFxyXG4gIDE1LCAyOSwgNDAsIDQ4LFxyXG4gIDE2LCAzMSwgNDMsIDUxLFxyXG4gIDE3LCAzMywgNDUsIDU0LFxyXG4gIDE4LCAzNSwgNDgsIDU3LFxyXG4gIDE5LCAzNywgNTEsIDYwLFxyXG4gIDE5LCAzOCwgNTMsIDYzLFxyXG4gIDIwLCA0MCwgNTYsIDY2LFxyXG4gIDIxLCA0MywgNTksIDcwLFxyXG4gIDIyLCA0NSwgNjIsIDc0LFxyXG4gIDI0LCA0NywgNjUsIDc3LFxyXG4gIDI1LCA0OSwgNjgsIDgxXHJcbl1cclxuXHJcbmNvbnN0IEVDX0NPREVXT1JEU19UQUJMRSA9IFtcclxuLy8gTCAgTSAgUSAgSFxyXG4gIDcsIDEwLCAxMywgMTcsXHJcbiAgMTAsIDE2LCAyMiwgMjgsXHJcbiAgMTUsIDI2LCAzNiwgNDQsXHJcbiAgMjAsIDM2LCA1MiwgNjQsXHJcbiAgMjYsIDQ4LCA3MiwgODgsXHJcbiAgMzYsIDY0LCA5NiwgMTEyLFxyXG4gIDQwLCA3MiwgMTA4LCAxMzAsXHJcbiAgNDgsIDg4LCAxMzIsIDE1NixcclxuICA2MCwgMTEwLCAxNjAsIDE5MixcclxuICA3MiwgMTMwLCAxOTIsIDIyNCxcclxuICA4MCwgMTUwLCAyMjQsIDI2NCxcclxuICA5NiwgMTc2LCAyNjAsIDMwOCxcclxuICAxMDQsIDE5OCwgMjg4LCAzNTIsXHJcbiAgMTIwLCAyMTYsIDMyMCwgMzg0LFxyXG4gIDEzMiwgMjQwLCAzNjAsIDQzMixcclxuICAxNDQsIDI4MCwgNDA4LCA0ODAsXHJcbiAgMTY4LCAzMDgsIDQ0OCwgNTMyLFxyXG4gIDE4MCwgMzM4LCA1MDQsIDU4OCxcclxuICAxOTYsIDM2NCwgNTQ2LCA2NTAsXHJcbiAgMjI0LCA0MTYsIDYwMCwgNzAwLFxyXG4gIDIyNCwgNDQyLCA2NDQsIDc1MCxcclxuICAyNTIsIDQ3NiwgNjkwLCA4MTYsXHJcbiAgMjcwLCA1MDQsIDc1MCwgOTAwLFxyXG4gIDMwMCwgNTYwLCA4MTAsIDk2MCxcclxuICAzMTIsIDU4OCwgODcwLCAxMDUwLFxyXG4gIDMzNiwgNjQ0LCA5NTIsIDExMTAsXHJcbiAgMzYwLCA3MDAsIDEwMjAsIDEyMDAsXHJcbiAgMzkwLCA3MjgsIDEwNTAsIDEyNjAsXHJcbiAgNDIwLCA3ODQsIDExNDAsIDEzNTAsXHJcbiAgNDUwLCA4MTIsIDEyMDAsIDE0NDAsXHJcbiAgNDgwLCA4NjgsIDEyOTAsIDE1MzAsXHJcbiAgNTEwLCA5MjQsIDEzNTAsIDE2MjAsXHJcbiAgNTQwLCA5ODAsIDE0NDAsIDE3MTAsXHJcbiAgNTcwLCAxMDM2LCAxNTMwLCAxODAwLFxyXG4gIDU3MCwgMTA2NCwgMTU5MCwgMTg5MCxcclxuICA2MDAsIDExMjAsIDE2ODAsIDE5ODAsXHJcbiAgNjMwLCAxMjA0LCAxNzcwLCAyMTAwLFxyXG4gIDY2MCwgMTI2MCwgMTg2MCwgMjIyMCxcclxuICA3MjAsIDEzMTYsIDE5NTAsIDIzMTAsXHJcbiAgNzUwLCAxMzcyLCAyMDQwLCAyNDMwXHJcbl1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBibG9jayB0aGF0IHRoZSBRUiBDb2RlIHNob3VsZCBjb250YWluXHJcbiAqIGZvciB0aGUgc3BlY2lmaWVkIHZlcnNpb24gYW5kIGVycm9yIGNvcnJlY3Rpb24gbGV2ZWwuXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEBwYXJhbSAge051bWJlcn0gZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgIE51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGJsb2Nrc1xyXG4gKi9cclxuZXhwb3J0cy5nZXRCbG9ja3NDb3VudCA9IGZ1bmN0aW9uIGdldEJsb2Nrc0NvdW50ICh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xyXG4gIHN3aXRjaCAoZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcclxuICAgIGNhc2UgRUNMZXZlbC5MOlxyXG4gICAgICByZXR1cm4gRUNfQkxPQ0tTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMF1cclxuICAgIGNhc2UgRUNMZXZlbC5NOlxyXG4gICAgICByZXR1cm4gRUNfQkxPQ0tTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMV1cclxuICAgIGNhc2UgRUNMZXZlbC5ROlxyXG4gICAgICByZXR1cm4gRUNfQkxPQ0tTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgMl1cclxuICAgIGNhc2UgRUNMZXZlbC5IOlxyXG4gICAgICByZXR1cm4gRUNfQkxPQ0tTX1RBQkxFWyh2ZXJzaW9uIC0gMSkgKiA0ICsgM11cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHMgdG8gdXNlIGZvciB0aGUgc3BlY2lmaWVkXHJcbiAqIHZlcnNpb24gYW5kIGVycm9yIGNvcnJlY3Rpb24gbGV2ZWwuXHJcbiAqXHJcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXHJcbiAqIEBwYXJhbSAge051bWJlcn0gZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICAgICAgICAgICAgIE51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3Jkc1xyXG4gKi9cclxuZXhwb3J0cy5nZXRUb3RhbENvZGV3b3Jkc0NvdW50ID0gZnVuY3Rpb24gZ2V0VG90YWxDb2Rld29yZHNDb3VudCAodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcclxuICBzd2l0Y2ggKGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XHJcbiAgICBjYXNlIEVDTGV2ZWwuTDpcclxuICAgICAgcmV0dXJuIEVDX0NPREVXT1JEU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDBdXHJcbiAgICBjYXNlIEVDTGV2ZWwuTTpcclxuICAgICAgcmV0dXJuIEVDX0NPREVXT1JEU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDFdXHJcbiAgICBjYXNlIEVDTGV2ZWwuUTpcclxuICAgICAgcmV0dXJuIEVDX0NPREVXT1JEU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDJdXHJcbiAgICBjYXNlIEVDTGV2ZWwuSDpcclxuICAgICAgcmV0dXJuIEVDX0NPREVXT1JEU19UQUJMRVsodmVyc2lvbiAtIDEpICogNCArIDNdXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXHJcbiAgfVxyXG59XHJcbiIsICJjb25zdCBFWFBfVEFCTEUgPSBuZXcgVWludDhBcnJheSg1MTIpXG5jb25zdCBMT0dfVEFCTEUgPSBuZXcgVWludDhBcnJheSgyNTYpXG4vKipcbiAqIFByZWNvbXB1dGUgdGhlIGxvZyBhbmQgYW50aS1sb2cgdGFibGVzIGZvciBmYXN0ZXIgY29tcHV0YXRpb24gbGF0ZXJcbiAqXG4gKiBGb3IgZWFjaCBwb3NzaWJsZSB2YWx1ZSBpbiB0aGUgZ2Fsb2lzIGZpZWxkIDJeOCwgd2Ugd2lsbCBwcmUtY29tcHV0ZVxuICogdGhlIGxvZ2FyaXRobSBhbmQgYW50aS1sb2dhcml0aG0gKGV4cG9uZW50aWFsKSBvZiB0aGlzIHZhbHVlXG4gKlxuICogcmVmIHtAbGluayBodHRwczovL2VuLndpa2l2ZXJzaXR5Lm9yZy93aWtpL1JlZWQlRTIlODAlOTNTb2xvbW9uX2NvZGVzX2Zvcl9jb2RlcnMjSW50cm9kdWN0aW9uX3RvX21hdGhlbWF0aWNhbF9maWVsZHN9XG4gKi9cbjsoZnVuY3Rpb24gaW5pdFRhYmxlcyAoKSB7XG4gIGxldCB4ID0gMVxuICBmb3IgKGxldCBpID0gMDsgaSA8IDI1NTsgaSsrKSB7XG4gICAgRVhQX1RBQkxFW2ldID0geFxuICAgIExPR19UQUJMRVt4XSA9IGlcblxuICAgIHggPDw9IDEgLy8gbXVsdGlwbHkgYnkgMlxuXG4gICAgLy8gVGhlIFFSIGNvZGUgc3BlY2lmaWNhdGlvbiBzYXlzIHRvIHVzZSBieXRlLXdpc2UgbW9kdWxvIDEwMDAxMTEwMSBhcml0aG1ldGljLlxuICAgIC8vIFRoaXMgbWVhbnMgdGhhdCB3aGVuIGEgbnVtYmVyIGlzIDI1NiBvciBsYXJnZXIsIGl0IHNob3VsZCBiZSBYT1JlZCB3aXRoIDB4MTFELlxuICAgIGlmICh4ICYgMHgxMDApIHsgLy8gc2ltaWxhciB0byB4ID49IDI1NiwgYnV0IGEgbG90IGZhc3RlciAoYmVjYXVzZSAweDEwMCA9PSAyNTYpXG4gICAgICB4IF49IDB4MTFEXG4gICAgfVxuICB9XG5cbiAgLy8gT3B0aW1pemF0aW9uOiBkb3VibGUgdGhlIHNpemUgb2YgdGhlIGFudGktbG9nIHRhYmxlIHNvIHRoYXQgd2UgZG9uJ3QgbmVlZCB0byBtb2QgMjU1IHRvXG4gIC8vIHN0YXkgaW5zaWRlIHRoZSBib3VuZHMgKGJlY2F1c2Ugd2Ugd2lsbCBtYWlubHkgdXNlIHRoaXMgdGFibGUgZm9yIHRoZSBtdWx0aXBsaWNhdGlvbiBvZlxuICAvLyB0d28gR0YgbnVtYmVycywgbm8gbW9yZSkuXG4gIC8vIEBzZWUge0BsaW5rIG11bH1cbiAgZm9yIChsZXQgaSA9IDI1NTsgaSA8IDUxMjsgaSsrKSB7XG4gICAgRVhQX1RBQkxFW2ldID0gRVhQX1RBQkxFW2kgLSAyNTVdXG4gIH1cbn0oKSlcblxuLyoqXG4gKiBSZXR1cm5zIGxvZyB2YWx1ZSBvZiBuIGluc2lkZSBHYWxvaXMgRmllbGRcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbiBsb2cgKG4pIHtcbiAgaWYgKG4gPCAxKSB0aHJvdyBuZXcgRXJyb3IoJ2xvZygnICsgbiArICcpJylcbiAgcmV0dXJuIExPR19UQUJMRVtuXVxufVxuXG4vKipcbiAqIFJldHVybnMgYW50aS1sb2cgdmFsdWUgb2YgbiBpbnNpZGUgR2Fsb2lzIEZpZWxkXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmV4cG9ydHMuZXhwID0gZnVuY3Rpb24gZXhwIChuKSB7XG4gIHJldHVybiBFWFBfVEFCTEVbbl1cbn1cblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBudW1iZXIgaW5zaWRlIEdhbG9pcyBGaWVsZFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0geFxuICogQHBhcmFtICB7TnVtYmVyfSB5XG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmV4cG9ydHMubXVsID0gZnVuY3Rpb24gbXVsICh4LCB5KSB7XG4gIGlmICh4ID09PSAwIHx8IHkgPT09IDApIHJldHVybiAwXG5cbiAgLy8gc2hvdWxkIGJlIEVYUF9UQUJMRVsoTE9HX1RBQkxFW3hdICsgTE9HX1RBQkxFW3ldKSAlIDI1NV0gaWYgRVhQX1RBQkxFIHdhc24ndCBvdmVyc2l6ZWRcbiAgLy8gQHNlZSB7QGxpbmsgaW5pdFRhYmxlc31cbiAgcmV0dXJuIEVYUF9UQUJMRVtMT0dfVEFCTEVbeF0gKyBMT0dfVEFCTEVbeV1dXG59XG4iLCAiY29uc3QgR0YgPSByZXF1aXJlKCcuL2dhbG9pcy1maWVsZCcpXG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gcG9seW5vbWlhbHMgaW5zaWRlIEdhbG9pcyBGaWVsZFxuICpcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IHAxIFBvbHlub21pYWxcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IHAyIFBvbHlub21pYWxcbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9ICAgIFByb2R1Y3Qgb2YgcDEgYW5kIHAyXG4gKi9cbmV4cG9ydHMubXVsID0gZnVuY3Rpb24gbXVsIChwMSwgcDIpIHtcbiAgY29uc3QgY29lZmYgPSBuZXcgVWludDhBcnJheShwMS5sZW5ndGggKyBwMi5sZW5ndGggLSAxKVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcDEubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHAyLmxlbmd0aDsgaisrKSB7XG4gICAgICBjb2VmZltpICsgal0gXj0gR0YubXVsKHAxW2ldLCBwMltqXSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29lZmZcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgdGhlIHJlbWFpbmRlciBvZiBwb2x5bm9taWFscyBkaXZpc2lvblxuICpcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IGRpdmlkZW50IFBvbHlub21pYWxcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IGRpdmlzb3IgIFBvbHlub21pYWxcbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9ICAgICAgICAgIFJlbWFpbmRlclxuICovXG5leHBvcnRzLm1vZCA9IGZ1bmN0aW9uIG1vZCAoZGl2aWRlbnQsIGRpdmlzb3IpIHtcbiAgbGV0IHJlc3VsdCA9IG5ldyBVaW50OEFycmF5KGRpdmlkZW50KVxuXG4gIHdoaWxlICgocmVzdWx0Lmxlbmd0aCAtIGRpdmlzb3IubGVuZ3RoKSA+PSAwKSB7XG4gICAgY29uc3QgY29lZmYgPSByZXN1bHRbMF1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGl2aXNvci5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0W2ldIF49IEdGLm11bChkaXZpc29yW2ldLCBjb2VmZilcbiAgICB9XG5cbiAgICAvLyByZW1vdmUgYWxsIHplcm9zIGZyb20gYnVmZmVyIGhlYWRcbiAgICBsZXQgb2Zmc2V0ID0gMFxuICAgIHdoaWxlIChvZmZzZXQgPCByZXN1bHQubGVuZ3RoICYmIHJlc3VsdFtvZmZzZXRdID09PSAwKSBvZmZzZXQrK1xuICAgIHJlc3VsdCA9IHJlc3VsdC5zbGljZShvZmZzZXQpXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbi8qKlxuICogR2VuZXJhdGUgYW4gaXJyZWR1Y2libGUgZ2VuZXJhdG9yIHBvbHlub21pYWwgb2Ygc3BlY2lmaWVkIGRlZ3JlZVxuICogKHVzZWQgYnkgUmVlZC1Tb2xvbW9uIGVuY29kZXIpXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBkZWdyZWUgRGVncmVlIG9mIHRoZSBnZW5lcmF0b3IgcG9seW5vbWlhbFxuICogQHJldHVybiB7VWludDhBcnJheX0gICAgQnVmZmVyIGNvbnRhaW5pbmcgcG9seW5vbWlhbCBjb2VmZmljaWVudHNcbiAqL1xuZXhwb3J0cy5nZW5lcmF0ZUVDUG9seW5vbWlhbCA9IGZ1bmN0aW9uIGdlbmVyYXRlRUNQb2x5bm9taWFsIChkZWdyZWUpIHtcbiAgbGV0IHBvbHkgPSBuZXcgVWludDhBcnJheShbMV0pXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGVncmVlOyBpKyspIHtcbiAgICBwb2x5ID0gZXhwb3J0cy5tdWwocG9seSwgbmV3IFVpbnQ4QXJyYXkoWzEsIEdGLmV4cChpKV0pKVxuICB9XG5cbiAgcmV0dXJuIHBvbHlcbn1cbiIsICJjb25zdCBQb2x5bm9taWFsID0gcmVxdWlyZSgnLi9wb2x5bm9taWFsJylcblxuZnVuY3Rpb24gUmVlZFNvbG9tb25FbmNvZGVyIChkZWdyZWUpIHtcbiAgdGhpcy5nZW5Qb2x5ID0gdW5kZWZpbmVkXG4gIHRoaXMuZGVncmVlID0gZGVncmVlXG5cbiAgaWYgKHRoaXMuZGVncmVlKSB0aGlzLmluaXRpYWxpemUodGhpcy5kZWdyZWUpXG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgZW5jb2Rlci5cbiAqIFRoZSBpbnB1dCBwYXJhbSBzaG91bGQgY29ycmVzcG9uZCB0byB0aGUgbnVtYmVyIG9mIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzLlxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gZGVncmVlXG4gKi9cblJlZWRTb2xvbW9uRW5jb2Rlci5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIGluaXRpYWxpemUgKGRlZ3JlZSkge1xuICAvLyBjcmVhdGUgYW4gaXJyZWR1Y2libGUgZ2VuZXJhdG9yIHBvbHlub21pYWxcbiAgdGhpcy5kZWdyZWUgPSBkZWdyZWVcbiAgdGhpcy5nZW5Qb2x5ID0gUG9seW5vbWlhbC5nZW5lcmF0ZUVDUG9seW5vbWlhbCh0aGlzLmRlZ3JlZSlcbn1cblxuLyoqXG4gKiBFbmNvZGVzIGEgY2h1bmsgb2YgZGF0YVxuICpcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IGRhdGEgQnVmZmVyIGNvbnRhaW5pbmcgaW5wdXQgZGF0YVxuICogQHJldHVybiB7VWludDhBcnJheX0gICAgICBCdWZmZXIgY29udGFpbmluZyBlbmNvZGVkIGRhdGFcbiAqL1xuUmVlZFNvbG9tb25FbmNvZGVyLnByb3RvdHlwZS5lbmNvZGUgPSBmdW5jdGlvbiBlbmNvZGUgKGRhdGEpIHtcbiAgaWYgKCF0aGlzLmdlblBvbHkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0VuY29kZXIgbm90IGluaXRpYWxpemVkJylcbiAgfVxuXG4gIC8vIENhbGN1bGF0ZSBFQyBmb3IgdGhpcyBkYXRhIGJsb2NrXG4gIC8vIGV4dGVuZHMgZGF0YSBzaXplIHRvIGRhdGErZ2VuUG9seSBzaXplXG4gIGNvbnN0IHBhZGRlZERhdGEgPSBuZXcgVWludDhBcnJheShkYXRhLmxlbmd0aCArIHRoaXMuZGVncmVlKVxuICBwYWRkZWREYXRhLnNldChkYXRhKVxuXG4gIC8vIFRoZSBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3JkcyBhcmUgdGhlIHJlbWFpbmRlciBhZnRlciBkaXZpZGluZyB0aGUgZGF0YSBjb2Rld29yZHNcbiAgLy8gYnkgYSBnZW5lcmF0b3IgcG9seW5vbWlhbFxuICBjb25zdCByZW1haW5kZXIgPSBQb2x5bm9taWFsLm1vZChwYWRkZWREYXRhLCB0aGlzLmdlblBvbHkpXG5cbiAgLy8gcmV0dXJuIEVDIGRhdGEgYmxvY2tzIChsYXN0IG4gYnl0ZSwgd2hlcmUgbiBpcyB0aGUgZGVncmVlIG9mIGdlblBvbHkpXG4gIC8vIElmIGNvZWZmaWNpZW50cyBudW1iZXIgaW4gcmVtYWluZGVyIGFyZSBsZXNzIHRoYW4gZ2VuUG9seSBkZWdyZWUsXG4gIC8vIHBhZCB3aXRoIDBzIHRvIHRoZSBsZWZ0IHRvIHJlYWNoIHRoZSBuZWVkZWQgbnVtYmVyIG9mIGNvZWZmaWNpZW50c1xuICBjb25zdCBzdGFydCA9IHRoaXMuZGVncmVlIC0gcmVtYWluZGVyLmxlbmd0aFxuICBpZiAoc3RhcnQgPiAwKSB7XG4gICAgY29uc3QgYnVmZiA9IG5ldyBVaW50OEFycmF5KHRoaXMuZGVncmVlKVxuICAgIGJ1ZmYuc2V0KHJlbWFpbmRlciwgc3RhcnQpXG5cbiAgICByZXR1cm4gYnVmZlxuICB9XG5cbiAgcmV0dXJuIHJlbWFpbmRlclxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlZWRTb2xvbW9uRW5jb2RlclxuIiwgIi8qKlxuICogQ2hlY2sgaWYgUVIgQ29kZSB2ZXJzaW9uIGlzIHZhbGlkXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSAgdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgdHJ1ZSBpZiB2YWxpZCB2ZXJzaW9uLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0cy5pc1ZhbGlkID0gZnVuY3Rpb24gaXNWYWxpZCAodmVyc2lvbikge1xuICByZXR1cm4gIWlzTmFOKHZlcnNpb24pICYmIHZlcnNpb24gPj0gMSAmJiB2ZXJzaW9uIDw9IDQwXG59XG4iLCAiY29uc3QgbnVtZXJpYyA9ICdbMC05XSsnXG5jb25zdCBhbHBoYW51bWVyaWMgPSAnW0EtWiAkJSorXFxcXC0uLzpdKydcbmxldCBrYW5qaSA9ICcoPzpbdTMwMDAtdTMwM0ZdfFt1MzA0MC11MzA5Rl18W3UzMEEwLXUzMEZGXXwnICtcbiAgJ1t1RkYwMC11RkZFRl18W3U0RTAwLXU5RkFGXXxbdTI2MDUtdTI2MDZdfFt1MjE5MC11MjE5NV18dTIwM0J8JyArXG4gICdbdTIwMTB1MjAxNXUyMDE4dTIwMTl1MjAyNXUyMDI2dTIwMUN1MjAxRHUyMjI1dTIyNjBdfCcgK1xuICAnW3UwMzkxLXUwNDUxXXxbdTAwQTd1MDBBOHUwMEIxdTAwQjR1MDBEN3UwMEY3XSkrJ1xua2FuamkgPSBrYW5qaS5yZXBsYWNlKC91L2csICdcXFxcdScpXG5cbmNvbnN0IGJ5dGUgPSAnKD86KD8hW0EtWjAtOSAkJSorXFxcXC0uLzpdfCcgKyBrYW5qaSArICcpKD86LnxbXFxyXFxuXSkpKydcblxuZXhwb3J0cy5LQU5KSSA9IG5ldyBSZWdFeHAoa2FuamksICdnJylcbmV4cG9ydHMuQllURV9LQU5KSSA9IG5ldyBSZWdFeHAoJ1teQS1aMC05ICQlKitcXFxcLS4vOl0rJywgJ2cnKVxuZXhwb3J0cy5CWVRFID0gbmV3IFJlZ0V4cChieXRlLCAnZycpXG5leHBvcnRzLk5VTUVSSUMgPSBuZXcgUmVnRXhwKG51bWVyaWMsICdnJylcbmV4cG9ydHMuQUxQSEFOVU1FUklDID0gbmV3IFJlZ0V4cChhbHBoYW51bWVyaWMsICdnJylcblxuY29uc3QgVEVTVF9LQU5KSSA9IG5ldyBSZWdFeHAoJ14nICsga2FuamkgKyAnJCcpXG5jb25zdCBURVNUX05VTUVSSUMgPSBuZXcgUmVnRXhwKCdeJyArIG51bWVyaWMgKyAnJCcpXG5jb25zdCBURVNUX0FMUEhBTlVNRVJJQyA9IG5ldyBSZWdFeHAoJ15bQS1aMC05ICQlKitcXFxcLS4vOl0rJCcpXG5cbmV4cG9ydHMudGVzdEthbmppID0gZnVuY3Rpb24gdGVzdEthbmppIChzdHIpIHtcbiAgcmV0dXJuIFRFU1RfS0FOSkkudGVzdChzdHIpXG59XG5cbmV4cG9ydHMudGVzdE51bWVyaWMgPSBmdW5jdGlvbiB0ZXN0TnVtZXJpYyAoc3RyKSB7XG4gIHJldHVybiBURVNUX05VTUVSSUMudGVzdChzdHIpXG59XG5cbmV4cG9ydHMudGVzdEFscGhhbnVtZXJpYyA9IGZ1bmN0aW9uIHRlc3RBbHBoYW51bWVyaWMgKHN0cikge1xuICByZXR1cm4gVEVTVF9BTFBIQU5VTUVSSUMudGVzdChzdHIpXG59XG4iLCAiY29uc3QgVmVyc2lvbkNoZWNrID0gcmVxdWlyZSgnLi92ZXJzaW9uLWNoZWNrJylcbmNvbnN0IFJlZ2V4ID0gcmVxdWlyZSgnLi9yZWdleCcpXG5cbi8qKlxuICogTnVtZXJpYyBtb2RlIGVuY29kZXMgZGF0YSBmcm9tIHRoZSBkZWNpbWFsIGRpZ2l0IHNldCAoMCAtIDkpXG4gKiAoYnl0ZSB2YWx1ZXMgMzBIRVggdG8gMzlIRVgpLlxuICogTm9ybWFsbHksIDMgZGF0YSBjaGFyYWN0ZXJzIGFyZSByZXByZXNlbnRlZCBieSAxMCBiaXRzLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmV4cG9ydHMuTlVNRVJJQyA9IHtcbiAgaWQ6ICdOdW1lcmljJyxcbiAgYml0OiAxIDw8IDAsXG4gIGNjQml0czogWzEwLCAxMiwgMTRdXG59XG5cbi8qKlxuICogQWxwaGFudW1lcmljIG1vZGUgZW5jb2RlcyBkYXRhIGZyb20gYSBzZXQgb2YgNDUgY2hhcmFjdGVycyxcbiAqIGkuZS4gMTAgbnVtZXJpYyBkaWdpdHMgKDAgLSA5KSxcbiAqICAgICAgMjYgYWxwaGFiZXRpYyBjaGFyYWN0ZXJzIChBIC0gWiksXG4gKiAgIGFuZCA5IHN5bWJvbHMgKFNQLCAkLCAlLCAqLCArLCAtLCAuLCAvLCA6KS5cbiAqIE5vcm1hbGx5LCB0d28gaW5wdXQgY2hhcmFjdGVycyBhcmUgcmVwcmVzZW50ZWQgYnkgMTEgYml0cy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnRzLkFMUEhBTlVNRVJJQyA9IHtcbiAgaWQ6ICdBbHBoYW51bWVyaWMnLFxuICBiaXQ6IDEgPDwgMSxcbiAgY2NCaXRzOiBbOSwgMTEsIDEzXVxufVxuXG4vKipcbiAqIEluIGJ5dGUgbW9kZSwgZGF0YSBpcyBlbmNvZGVkIGF0IDggYml0cyBwZXIgY2hhcmFjdGVyLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmV4cG9ydHMuQllURSA9IHtcbiAgaWQ6ICdCeXRlJyxcbiAgYml0OiAxIDw8IDIsXG4gIGNjQml0czogWzgsIDE2LCAxNl1cbn1cblxuLyoqXG4gKiBUaGUgS2FuamkgbW9kZSBlZmZpY2llbnRseSBlbmNvZGVzIEthbmppIGNoYXJhY3RlcnMgaW4gYWNjb3JkYW5jZSB3aXRoXG4gKiB0aGUgU2hpZnQgSklTIHN5c3RlbSBiYXNlZCBvbiBKSVMgWCAwMjA4LlxuICogVGhlIFNoaWZ0IEpJUyB2YWx1ZXMgYXJlIHNoaWZ0ZWQgZnJvbSB0aGUgSklTIFggMDIwOCB2YWx1ZXMuXG4gKiBKSVMgWCAwMjA4IGdpdmVzIGRldGFpbHMgb2YgdGhlIHNoaWZ0IGNvZGVkIHJlcHJlc2VudGF0aW9uLlxuICogRWFjaCB0d28tYnl0ZSBjaGFyYWN0ZXIgdmFsdWUgaXMgY29tcGFjdGVkIHRvIGEgMTMtYml0IGJpbmFyeSBjb2Rld29yZC5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnRzLktBTkpJID0ge1xuICBpZDogJ0thbmppJyxcbiAgYml0OiAxIDw8IDMsXG4gIGNjQml0czogWzgsIDEwLCAxMl1cbn1cblxuLyoqXG4gKiBNaXhlZCBtb2RlIHdpbGwgY29udGFpbiBhIHNlcXVlbmNlcyBvZiBkYXRhIGluIGEgY29tYmluYXRpb24gb2YgYW55IG9mXG4gKiB0aGUgbW9kZXMgZGVzY3JpYmVkIGFib3ZlXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuZXhwb3J0cy5NSVhFRCA9IHtcbiAgYml0OiAtMVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiBiaXRzIG5lZWRlZCB0byBzdG9yZSB0aGUgZGF0YSBsZW5ndGhcbiAqIGFjY29yZGluZyB0byBRUiBDb2RlIHNwZWNpZmljYXRpb25zLlxuICpcbiAqIEBwYXJhbSAge01vZGV9ICAgbW9kZSAgICBEYXRhIG1vZGVcbiAqIEBwYXJhbSAge051bWJlcn0gdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICBOdW1iZXIgb2YgYml0c1xuICovXG5leHBvcnRzLmdldENoYXJDb3VudEluZGljYXRvciA9IGZ1bmN0aW9uIGdldENoYXJDb3VudEluZGljYXRvciAobW9kZSwgdmVyc2lvbikge1xuICBpZiAoIW1vZGUuY2NCaXRzKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbW9kZTogJyArIG1vZGUpXG5cbiAgaWYgKCFWZXJzaW9uQ2hlY2suaXNWYWxpZCh2ZXJzaW9uKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB2ZXJzaW9uOiAnICsgdmVyc2lvbilcbiAgfVxuXG4gIGlmICh2ZXJzaW9uID49IDEgJiYgdmVyc2lvbiA8IDEwKSByZXR1cm4gbW9kZS5jY0JpdHNbMF1cbiAgZWxzZSBpZiAodmVyc2lvbiA8IDI3KSByZXR1cm4gbW9kZS5jY0JpdHNbMV1cbiAgcmV0dXJuIG1vZGUuY2NCaXRzWzJdXG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbW9zdCBlZmZpY2llbnQgbW9kZSB0byBzdG9yZSB0aGUgc3BlY2lmaWVkIGRhdGFcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGFTdHIgSW5wdXQgZGF0YSBzdHJpbmdcbiAqIEByZXR1cm4ge01vZGV9ICAgICAgICAgICBCZXN0IG1vZGVcbiAqL1xuZXhwb3J0cy5nZXRCZXN0TW9kZUZvckRhdGEgPSBmdW5jdGlvbiBnZXRCZXN0TW9kZUZvckRhdGEgKGRhdGFTdHIpIHtcbiAgaWYgKFJlZ2V4LnRlc3ROdW1lcmljKGRhdGFTdHIpKSByZXR1cm4gZXhwb3J0cy5OVU1FUklDXG4gIGVsc2UgaWYgKFJlZ2V4LnRlc3RBbHBoYW51bWVyaWMoZGF0YVN0cikpIHJldHVybiBleHBvcnRzLkFMUEhBTlVNRVJJQ1xuICBlbHNlIGlmIChSZWdleC50ZXN0S2FuamkoZGF0YVN0cikpIHJldHVybiBleHBvcnRzLktBTkpJXG4gIGVsc2UgcmV0dXJuIGV4cG9ydHMuQllURVxufVxuXG4vKipcbiAqIFJldHVybiBtb2RlIG5hbWUgYXMgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtNb2RlfSBtb2RlIE1vZGUgb2JqZWN0XG4gKiBAcmV0dXJucyB7U3RyaW5nfSAgTW9kZSBuYW1lXG4gKi9cbmV4cG9ydHMudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyAobW9kZSkge1xuICBpZiAobW9kZSAmJiBtb2RlLmlkKSByZXR1cm4gbW9kZS5pZFxuICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbW9kZScpXG59XG5cbi8qKlxuICogQ2hlY2sgaWYgaW5wdXQgcGFyYW0gaXMgYSB2YWxpZCBtb2RlIG9iamVjdFxuICpcbiAqIEBwYXJhbSAgIHtNb2RlfSAgICBtb2RlIE1vZGUgb2JqZWN0XG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB2YWxpZCBtb2RlLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0cy5pc1ZhbGlkID0gZnVuY3Rpb24gaXNWYWxpZCAobW9kZSkge1xuICByZXR1cm4gbW9kZSAmJiBtb2RlLmJpdCAmJiBtb2RlLmNjQml0c1xufVxuXG4vKipcbiAqIEdldCBtb2RlIG9iamVjdCBmcm9tIGl0cyBuYW1lXG4gKlxuICogQHBhcmFtICAge1N0cmluZ30gc3RyaW5nIE1vZGUgbmFtZVxuICogQHJldHVybnMge01vZGV9ICAgICAgICAgIE1vZGUgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHN0cmluZykge1xuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcmFtIGlzIG5vdCBhIHN0cmluZycpXG4gIH1cblxuICBjb25zdCBsY1N0ciA9IHN0cmluZy50b0xvd2VyQ2FzZSgpXG5cbiAgc3dpdGNoIChsY1N0cikge1xuICAgIGNhc2UgJ251bWVyaWMnOlxuICAgICAgcmV0dXJuIGV4cG9ydHMuTlVNRVJJQ1xuICAgIGNhc2UgJ2FscGhhbnVtZXJpYyc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5BTFBIQU5VTUVSSUNcbiAgICBjYXNlICdrYW5qaSc6XG4gICAgICByZXR1cm4gZXhwb3J0cy5LQU5KSVxuICAgIGNhc2UgJ2J5dGUnOlxuICAgICAgcmV0dXJuIGV4cG9ydHMuQllURVxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gbW9kZTogJyArIHN0cmluZylcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgbW9kZSBmcm9tIGEgdmFsdWUuXG4gKiBJZiB2YWx1ZSBpcyBub3QgYSB2YWxpZCBtb2RlLCByZXR1cm5zIGRlZmF1bHRWYWx1ZVxuICpcbiAqIEBwYXJhbSAge01vZGV8U3RyaW5nfSB2YWx1ZSAgICAgICAgRW5jb2RpbmcgbW9kZVxuICogQHBhcmFtICB7TW9kZX0gICAgICAgIGRlZmF1bHRWYWx1ZSBGYWxsYmFjayB2YWx1ZVxuICogQHJldHVybiB7TW9kZX0gICAgICAgICAgICAgICAgICAgICBFbmNvZGluZyBtb2RlXG4gKi9cbmV4cG9ydHMuZnJvbSA9IGZ1bmN0aW9uIGZyb20gKHZhbHVlLCBkZWZhdWx0VmFsdWUpIHtcbiAgaWYgKGV4cG9ydHMuaXNWYWxpZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGZyb21TdHJpbmcodmFsdWUpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlXG4gIH1cbn1cbiIsICJjb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuY29uc3QgRUNDb2RlID0gcmVxdWlyZSgnLi9lcnJvci1jb3JyZWN0aW9uLWNvZGUnKVxuY29uc3QgRUNMZXZlbCA9IHJlcXVpcmUoJy4vZXJyb3ItY29ycmVjdGlvbi1sZXZlbCcpXG5jb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcbmNvbnN0IFZlcnNpb25DaGVjayA9IHJlcXVpcmUoJy4vdmVyc2lvbi1jaGVjaycpXG5cbi8vIEdlbmVyYXRvciBwb2x5bm9taWFsIHVzZWQgdG8gZW5jb2RlIHZlcnNpb24gaW5mb3JtYXRpb25cbmNvbnN0IEcxOCA9ICgxIDw8IDEyKSB8ICgxIDw8IDExKSB8ICgxIDw8IDEwKSB8ICgxIDw8IDkpIHwgKDEgPDwgOCkgfCAoMSA8PCA1KSB8ICgxIDw8IDIpIHwgKDEgPDwgMClcbmNvbnN0IEcxOF9CQ0ggPSBVdGlscy5nZXRCQ0hEaWdpdChHMTgpXG5cbmZ1bmN0aW9uIGdldEJlc3RWZXJzaW9uRm9yRGF0YUxlbmd0aCAobW9kZSwgbGVuZ3RoLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xuICBmb3IgKGxldCBjdXJyZW50VmVyc2lvbiA9IDE7IGN1cnJlbnRWZXJzaW9uIDw9IDQwOyBjdXJyZW50VmVyc2lvbisrKSB7XG4gICAgaWYgKGxlbmd0aCA8PSBleHBvcnRzLmdldENhcGFjaXR5KGN1cnJlbnRWZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbW9kZSkpIHtcbiAgICAgIHJldHVybiBjdXJyZW50VmVyc2lvblxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWRcbn1cblxuZnVuY3Rpb24gZ2V0UmVzZXJ2ZWRCaXRzQ291bnQgKG1vZGUsIHZlcnNpb24pIHtcbiAgLy8gQ2hhcmFjdGVyIGNvdW50IGluZGljYXRvciArIG1vZGUgaW5kaWNhdG9yIGJpdHNcbiAgcmV0dXJuIE1vZGUuZ2V0Q2hhckNvdW50SW5kaWNhdG9yKG1vZGUsIHZlcnNpb24pICsgNFxufVxuXG5mdW5jdGlvbiBnZXRUb3RhbEJpdHNGcm9tRGF0YUFycmF5IChzZWdtZW50cywgdmVyc2lvbikge1xuICBsZXQgdG90YWxCaXRzID0gMFxuXG4gIHNlZ21lbnRzLmZvckVhY2goZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBjb25zdCByZXNlcnZlZEJpdHMgPSBnZXRSZXNlcnZlZEJpdHNDb3VudChkYXRhLm1vZGUsIHZlcnNpb24pXG4gICAgdG90YWxCaXRzICs9IHJlc2VydmVkQml0cyArIGRhdGEuZ2V0Qml0c0xlbmd0aCgpXG4gIH0pXG5cbiAgcmV0dXJuIHRvdGFsQml0c1xufVxuXG5mdW5jdGlvbiBnZXRCZXN0VmVyc2lvbkZvck1peGVkRGF0YSAoc2VnbWVudHMsIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XG4gIGZvciAobGV0IGN1cnJlbnRWZXJzaW9uID0gMTsgY3VycmVudFZlcnNpb24gPD0gNDA7IGN1cnJlbnRWZXJzaW9uKyspIHtcbiAgICBjb25zdCBsZW5ndGggPSBnZXRUb3RhbEJpdHNGcm9tRGF0YUFycmF5KHNlZ21lbnRzLCBjdXJyZW50VmVyc2lvbilcbiAgICBpZiAobGVuZ3RoIDw9IGV4cG9ydHMuZ2V0Q2FwYWNpdHkoY3VycmVudFZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBNb2RlLk1JWEVEKSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRWZXJzaW9uXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZFxufVxuXG4vKipcbiAqIFJldHVybnMgdmVyc2lvbiBudW1iZXIgZnJvbSBhIHZhbHVlLlxuICogSWYgdmFsdWUgaXMgbm90IGEgdmFsaWQgdmVyc2lvbiwgcmV0dXJucyBkZWZhdWx0VmFsdWVcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ8U3RyaW5nfSB2YWx1ZSAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgICAgICBkZWZhdWx0VmFsdWUgRmFsbGJhY2sgdmFsdWVcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb24gbnVtYmVyXG4gKi9cbmV4cG9ydHMuZnJvbSA9IGZ1bmN0aW9uIGZyb20gKHZhbHVlLCBkZWZhdWx0VmFsdWUpIHtcbiAgaWYgKFZlcnNpb25DaGVjay5pc1ZhbGlkKHZhbHVlKSkge1xuICAgIHJldHVybiBwYXJzZUludCh2YWx1ZSwgMTApXG4gIH1cblxuICByZXR1cm4gZGVmYXVsdFZhbHVlXG59XG5cbi8qKlxuICogUmV0dXJucyBob3cgbXVjaCBkYXRhIGNhbiBiZSBzdG9yZWQgd2l0aCB0aGUgc3BlY2lmaWVkIFFSIGNvZGUgdmVyc2lvblxuICogYW5kIGVycm9yIGNvcnJlY3Rpb24gbGV2ZWxcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvbiAoMS00MClcbiAqIEBwYXJhbSAge051bWJlcn0gZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxuICogQHBhcmFtICB7TW9kZX0gICBtb2RlICAgICAgICAgICAgICAgICBEYXRhIG1vZGVcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICAgUXVhbnRpdHkgb2Ygc3RvcmFibGUgZGF0YVxuICovXG5leHBvcnRzLmdldENhcGFjaXR5ID0gZnVuY3Rpb24gZ2V0Q2FwYWNpdHkgKHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBtb2RlKSB7XG4gIGlmICghVmVyc2lvbkNoZWNrLmlzVmFsaWQodmVyc2lvbikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgUVIgQ29kZSB2ZXJzaW9uJylcbiAgfVxuXG4gIC8vIFVzZSBCeXRlIG1vZGUgYXMgZGVmYXVsdFxuICBpZiAodHlwZW9mIG1vZGUgPT09ICd1bmRlZmluZWQnKSBtb2RlID0gTW9kZS5CWVRFXG5cbiAgLy8gVG90YWwgY29kZXdvcmRzIGZvciB0aGlzIFFSIGNvZGUgdmVyc2lvbiAoRGF0YSArIEVycm9yIGNvcnJlY3Rpb24pXG4gIGNvbnN0IHRvdGFsQ29kZXdvcmRzID0gVXRpbHMuZ2V0U3ltYm9sVG90YWxDb2Rld29yZHModmVyc2lvbilcblxuICAvLyBUb3RhbCBudW1iZXIgb2YgZXJyb3IgY29ycmVjdGlvbiBjb2Rld29yZHNcbiAgY29uc3QgZWNUb3RhbENvZGV3b3JkcyA9IEVDQ29kZS5nZXRUb3RhbENvZGV3b3Jkc0NvdW50KHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsKVxuXG4gIC8vIFRvdGFsIG51bWJlciBvZiBkYXRhIGNvZGV3b3Jkc1xuICBjb25zdCBkYXRhVG90YWxDb2Rld29yZHNCaXRzID0gKHRvdGFsQ29kZXdvcmRzIC0gZWNUb3RhbENvZGV3b3JkcykgKiA4XG5cbiAgaWYgKG1vZGUgPT09IE1vZGUuTUlYRUQpIHJldHVybiBkYXRhVG90YWxDb2Rld29yZHNCaXRzXG5cbiAgY29uc3QgdXNhYmxlQml0cyA9IGRhdGFUb3RhbENvZGV3b3Jkc0JpdHMgLSBnZXRSZXNlcnZlZEJpdHNDb3VudChtb2RlLCB2ZXJzaW9uKVxuXG4gIC8vIFJldHVybiBtYXggbnVtYmVyIG9mIHN0b3JhYmxlIGNvZGV3b3Jkc1xuICBzd2l0Y2ggKG1vZGUpIHtcbiAgICBjYXNlIE1vZGUuTlVNRVJJQzpcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKCh1c2FibGVCaXRzIC8gMTApICogMylcblxuICAgIGNhc2UgTW9kZS5BTFBIQU5VTUVSSUM6XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcigodXNhYmxlQml0cyAvIDExKSAqIDIpXG5cbiAgICBjYXNlIE1vZGUuS0FOSkk6XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcih1c2FibGVCaXRzIC8gMTMpXG5cbiAgICBjYXNlIE1vZGUuQllURTpcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIE1hdGguZmxvb3IodXNhYmxlQml0cyAvIDgpXG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIHZlcnNpb24gbmVlZGVkIHRvIGNvbnRhaW4gdGhlIGFtb3VudCBvZiBkYXRhXG4gKlxuICogQHBhcmFtICB7U2VnbWVudH0gZGF0YSAgICAgICAgICAgICAgICAgICAgU2VnbWVudCBvZiBkYXRhXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IFtlcnJvckNvcnJlY3Rpb25MZXZlbD1IXSBFcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKiBAcGFyYW0gIHtNb2RlfSBtb2RlICAgICAgICAgICAgICAgICAgICAgICBEYXRhIG1vZGVcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxuICovXG5leHBvcnRzLmdldEJlc3RWZXJzaW9uRm9yRGF0YSA9IGZ1bmN0aW9uIGdldEJlc3RWZXJzaW9uRm9yRGF0YSAoZGF0YSwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcbiAgbGV0IHNlZ1xuXG4gIGNvbnN0IGVjbCA9IEVDTGV2ZWwuZnJvbShlcnJvckNvcnJlY3Rpb25MZXZlbCwgRUNMZXZlbC5NKVxuXG4gIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgaWYgKGRhdGEubGVuZ3RoID4gMSkge1xuICAgICAgcmV0dXJuIGdldEJlc3RWZXJzaW9uRm9yTWl4ZWREYXRhKGRhdGEsIGVjbClcbiAgICB9XG5cbiAgICBpZiAoZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiAxXG4gICAgfVxuXG4gICAgc2VnID0gZGF0YVswXVxuICB9IGVsc2Uge1xuICAgIHNlZyA9IGRhdGFcbiAgfVxuXG4gIHJldHVybiBnZXRCZXN0VmVyc2lvbkZvckRhdGFMZW5ndGgoc2VnLm1vZGUsIHNlZy5nZXRMZW5ndGgoKSwgZWNsKVxufVxuXG4vKipcbiAqIFJldHVybnMgdmVyc2lvbiBpbmZvcm1hdGlvbiB3aXRoIHJlbGF0aXZlIGVycm9yIGNvcnJlY3Rpb24gYml0c1xuICpcbiAqIFRoZSB2ZXJzaW9uIGluZm9ybWF0aW9uIGlzIGluY2x1ZGVkIGluIFFSIENvZGUgc3ltYm9scyBvZiB2ZXJzaW9uIDcgb3IgbGFyZ2VyLlxuICogSXQgY29uc2lzdHMgb2YgYW4gMTgtYml0IHNlcXVlbmNlIGNvbnRhaW5pbmcgNiBkYXRhIGJpdHMsXG4gKiB3aXRoIDEyIGVycm9yIGNvcnJlY3Rpb24gYml0cyBjYWxjdWxhdGVkIHVzaW5nIHRoZSAoMTgsIDYpIEdvbGF5IGNvZGUuXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgIEVuY29kZWQgdmVyc2lvbiBpbmZvIGJpdHNcbiAqL1xuZXhwb3J0cy5nZXRFbmNvZGVkQml0cyA9IGZ1bmN0aW9uIGdldEVuY29kZWRCaXRzICh2ZXJzaW9uKSB7XG4gIGlmICghVmVyc2lvbkNoZWNrLmlzVmFsaWQodmVyc2lvbikgfHwgdmVyc2lvbiA8IDcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgUVIgQ29kZSB2ZXJzaW9uJylcbiAgfVxuXG4gIGxldCBkID0gdmVyc2lvbiA8PCAxMlxuXG4gIHdoaWxlIChVdGlscy5nZXRCQ0hEaWdpdChkKSAtIEcxOF9CQ0ggPj0gMCkge1xuICAgIGQgXj0gKEcxOCA8PCAoVXRpbHMuZ2V0QkNIRGlnaXQoZCkgLSBHMThfQkNIKSlcbiAgfVxuXG4gIHJldHVybiAodmVyc2lvbiA8PCAxMikgfCBkXG59XG4iLCAiY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcblxuY29uc3QgRzE1ID0gKDEgPDwgMTApIHwgKDEgPDwgOCkgfCAoMSA8PCA1KSB8ICgxIDw8IDQpIHwgKDEgPDwgMikgfCAoMSA8PCAxKSB8ICgxIDw8IDApXG5jb25zdCBHMTVfTUFTSyA9ICgxIDw8IDE0KSB8ICgxIDw8IDEyKSB8ICgxIDw8IDEwKSB8ICgxIDw8IDQpIHwgKDEgPDwgMSlcbmNvbnN0IEcxNV9CQ0ggPSBVdGlscy5nZXRCQ0hEaWdpdChHMTUpXG5cbi8qKlxuICogUmV0dXJucyBmb3JtYXQgaW5mb3JtYXRpb24gd2l0aCByZWxhdGl2ZSBlcnJvciBjb3JyZWN0aW9uIGJpdHNcbiAqXG4gKiBUaGUgZm9ybWF0IGluZm9ybWF0aW9uIGlzIGEgMTUtYml0IHNlcXVlbmNlIGNvbnRhaW5pbmcgNSBkYXRhIGJpdHMsXG4gKiB3aXRoIDEwIGVycm9yIGNvcnJlY3Rpb24gYml0cyBjYWxjdWxhdGVkIHVzaW5nIHRoZSAoMTUsIDUpIEJDSCBjb2RlLlxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxuICogQHBhcmFtICB7TnVtYmVyfSBtYXNrICAgICAgICAgICAgICAgICBNYXNrIHBhdHRlcm5cbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgICAgICAgICAgICAgRW5jb2RlZCBmb3JtYXQgaW5mb3JtYXRpb24gYml0c1xuICovXG5leHBvcnRzLmdldEVuY29kZWRCaXRzID0gZnVuY3Rpb24gZ2V0RW5jb2RlZEJpdHMgKGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrKSB7XG4gIGNvbnN0IGRhdGEgPSAoKGVycm9yQ29ycmVjdGlvbkxldmVsLmJpdCA8PCAzKSB8IG1hc2spXG4gIGxldCBkID0gZGF0YSA8PCAxMFxuXG4gIHdoaWxlIChVdGlscy5nZXRCQ0hEaWdpdChkKSAtIEcxNV9CQ0ggPj0gMCkge1xuICAgIGQgXj0gKEcxNSA8PCAoVXRpbHMuZ2V0QkNIRGlnaXQoZCkgLSBHMTVfQkNIKSlcbiAgfVxuXG4gIC8vIHhvciBmaW5hbCBkYXRhIHdpdGggbWFzayBwYXR0ZXJuIGluIG9yZGVyIHRvIGVuc3VyZSB0aGF0XG4gIC8vIG5vIGNvbWJpbmF0aW9uIG9mIEVycm9yIENvcnJlY3Rpb24gTGV2ZWwgYW5kIGRhdGEgbWFzayBwYXR0ZXJuXG4gIC8vIHdpbGwgcmVzdWx0IGluIGFuIGFsbC16ZXJvIGRhdGEgc3RyaW5nXG4gIHJldHVybiAoKGRhdGEgPDwgMTApIHwgZCkgXiBHMTVfTUFTS1xufVxuIiwgImNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxuXG5mdW5jdGlvbiBOdW1lcmljRGF0YSAoZGF0YSkge1xuICB0aGlzLm1vZGUgPSBNb2RlLk5VTUVSSUNcbiAgdGhpcy5kYXRhID0gZGF0YS50b1N0cmluZygpXG59XG5cbk51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoIChsZW5ndGgpIHtcbiAgcmV0dXJuIDEwICogTWF0aC5mbG9vcihsZW5ndGggLyAzKSArICgobGVuZ3RoICUgMykgPyAoKGxlbmd0aCAlIDMpICogMyArIDEpIDogMClcbn1cblxuTnVtZXJpY0RhdGEucHJvdG90eXBlLmdldExlbmd0aCA9IGZ1bmN0aW9uIGdldExlbmd0aCAoKSB7XG4gIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoXG59XG5cbk51bWVyaWNEYXRhLnByb3RvdHlwZS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAoKSB7XG4gIHJldHVybiBOdW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoKHRoaXMuZGF0YS5sZW5ndGgpXG59XG5cbk51bWVyaWNEYXRhLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChiaXRCdWZmZXIpIHtcbiAgbGV0IGksIGdyb3VwLCB2YWx1ZVxuXG4gIC8vIFRoZSBpbnB1dCBkYXRhIHN0cmluZyBpcyBkaXZpZGVkIGludG8gZ3JvdXBzIG9mIHRocmVlIGRpZ2l0cyxcbiAgLy8gYW5kIGVhY2ggZ3JvdXAgaXMgY29udmVydGVkIHRvIGl0cyAxMC1iaXQgYmluYXJ5IGVxdWl2YWxlbnQuXG4gIGZvciAoaSA9IDA7IGkgKyAzIDw9IHRoaXMuZGF0YS5sZW5ndGg7IGkgKz0gMykge1xuICAgIGdyb3VwID0gdGhpcy5kYXRhLnN1YnN0cihpLCAzKVxuICAgIHZhbHVlID0gcGFyc2VJbnQoZ3JvdXAsIDEwKVxuXG4gICAgYml0QnVmZmVyLnB1dCh2YWx1ZSwgMTApXG4gIH1cblxuICAvLyBJZiB0aGUgbnVtYmVyIG9mIGlucHV0IGRpZ2l0cyBpcyBub3QgYW4gZXhhY3QgbXVsdGlwbGUgb2YgdGhyZWUsXG4gIC8vIHRoZSBmaW5hbCBvbmUgb3IgdHdvIGRpZ2l0cyBhcmUgY29udmVydGVkIHRvIDQgb3IgNyBiaXRzIHJlc3BlY3RpdmVseS5cbiAgY29uc3QgcmVtYWluaW5nTnVtID0gdGhpcy5kYXRhLmxlbmd0aCAtIGlcbiAgaWYgKHJlbWFpbmluZ051bSA+IDApIHtcbiAgICBncm91cCA9IHRoaXMuZGF0YS5zdWJzdHIoaSlcbiAgICB2YWx1ZSA9IHBhcnNlSW50KGdyb3VwLCAxMClcblxuICAgIGJpdEJ1ZmZlci5wdXQodmFsdWUsIHJlbWFpbmluZ051bSAqIDMgKyAxKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTnVtZXJpY0RhdGFcbiIsICJjb25zdCBNb2RlID0gcmVxdWlyZSgnLi9tb2RlJylcblxuLyoqXG4gKiBBcnJheSBvZiBjaGFyYWN0ZXJzIGF2YWlsYWJsZSBpbiBhbHBoYW51bWVyaWMgbW9kZVxuICpcbiAqIEFzIHBlciBRUiBDb2RlIHNwZWNpZmljYXRpb24sIHRvIGVhY2ggY2hhcmFjdGVyXG4gKiBpcyBhc3NpZ25lZCBhIHZhbHVlIGZyb20gMCB0byA0NCB3aGljaCBpbiB0aGlzIGNhc2UgY29pbmNpZGVzXG4gKiB3aXRoIHRoZSBhcnJheSBpbmRleFxuICpcbiAqIEB0eXBlIHtBcnJheX1cbiAqL1xuY29uc3QgQUxQSEFfTlVNX0NIQVJTID0gW1xuICAnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOScsXG4gICdBJywgJ0InLCAnQycsICdEJywgJ0UnLCAnRicsICdHJywgJ0gnLCAnSScsICdKJywgJ0snLCAnTCcsICdNJyxcbiAgJ04nLCAnTycsICdQJywgJ1EnLCAnUicsICdTJywgJ1QnLCAnVScsICdWJywgJ1cnLCAnWCcsICdZJywgJ1onLFxuICAnICcsICckJywgJyUnLCAnKicsICcrJywgJy0nLCAnLicsICcvJywgJzonXG5dXG5cbmZ1bmN0aW9uIEFscGhhbnVtZXJpY0RhdGEgKGRhdGEpIHtcbiAgdGhpcy5tb2RlID0gTW9kZS5BTFBIQU5VTUVSSUNcbiAgdGhpcy5kYXRhID0gZGF0YVxufVxuXG5BbHBoYW51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoIChsZW5ndGgpIHtcbiAgcmV0dXJuIDExICogTWF0aC5mbG9vcihsZW5ndGggLyAyKSArIDYgKiAobGVuZ3RoICUgMilcbn1cblxuQWxwaGFudW1lcmljRGF0YS5wcm90b3R5cGUuZ2V0TGVuZ3RoID0gZnVuY3Rpb24gZ2V0TGVuZ3RoICgpIHtcbiAgcmV0dXJuIHRoaXMuZGF0YS5sZW5ndGhcbn1cblxuQWxwaGFudW1lcmljRGF0YS5wcm90b3R5cGUuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKCkge1xuICByZXR1cm4gQWxwaGFudW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoKHRoaXMuZGF0YS5sZW5ndGgpXG59XG5cbkFscGhhbnVtZXJpY0RhdGEucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKGJpdEJ1ZmZlcikge1xuICBsZXQgaVxuXG4gIC8vIElucHV0IGRhdGEgY2hhcmFjdGVycyBhcmUgZGl2aWRlZCBpbnRvIGdyb3VwcyBvZiB0d28gY2hhcmFjdGVyc1xuICAvLyBhbmQgZW5jb2RlZCBhcyAxMS1iaXQgYmluYXJ5IGNvZGVzLlxuICBmb3IgKGkgPSAwOyBpICsgMiA8PSB0aGlzLmRhdGEubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAvLyBUaGUgY2hhcmFjdGVyIHZhbHVlIG9mIHRoZSBmaXJzdCBjaGFyYWN0ZXIgaXMgbXVsdGlwbGllZCBieSA0NVxuICAgIGxldCB2YWx1ZSA9IEFMUEhBX05VTV9DSEFSUy5pbmRleE9mKHRoaXMuZGF0YVtpXSkgKiA0NVxuXG4gICAgLy8gVGhlIGNoYXJhY3RlciB2YWx1ZSBvZiB0aGUgc2Vjb25kIGRpZ2l0IGlzIGFkZGVkIHRvIHRoZSBwcm9kdWN0XG4gICAgdmFsdWUgKz0gQUxQSEFfTlVNX0NIQVJTLmluZGV4T2YodGhpcy5kYXRhW2kgKyAxXSlcblxuICAgIC8vIFRoZSBzdW0gaXMgdGhlbiBzdG9yZWQgYXMgMTEtYml0IGJpbmFyeSBudW1iZXJcbiAgICBiaXRCdWZmZXIucHV0KHZhbHVlLCAxMSlcbiAgfVxuXG4gIC8vIElmIHRoZSBudW1iZXIgb2YgaW5wdXQgZGF0YSBjaGFyYWN0ZXJzIGlzIG5vdCBhIG11bHRpcGxlIG9mIHR3byxcbiAgLy8gdGhlIGNoYXJhY3RlciB2YWx1ZSBvZiB0aGUgZmluYWwgY2hhcmFjdGVyIGlzIGVuY29kZWQgYXMgYSA2LWJpdCBiaW5hcnkgbnVtYmVyLlxuICBpZiAodGhpcy5kYXRhLmxlbmd0aCAlIDIpIHtcbiAgICBiaXRCdWZmZXIucHV0KEFMUEhBX05VTV9DSEFSUy5pbmRleE9mKHRoaXMuZGF0YVtpXSksIDYpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBbHBoYW51bWVyaWNEYXRhXG4iLCAiY29uc3QgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG5cbmZ1bmN0aW9uIEJ5dGVEYXRhIChkYXRhKSB7XG4gIHRoaXMubW9kZSA9IE1vZGUuQllURVxuICBpZiAodHlwZW9mIChkYXRhKSA9PT0gJ3N0cmluZycpIHtcbiAgICB0aGlzLmRhdGEgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoZGF0YSlcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmRhdGEgPSBuZXcgVWludDhBcnJheShkYXRhKVxuICB9XG59XG5cbkJ5dGVEYXRhLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoIChsZW5ndGgpIHtcbiAgcmV0dXJuIGxlbmd0aCAqIDhcbn1cblxuQnl0ZURhdGEucHJvdG90eXBlLmdldExlbmd0aCA9IGZ1bmN0aW9uIGdldExlbmd0aCAoKSB7XG4gIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoXG59XG5cbkJ5dGVEYXRhLnByb3RvdHlwZS5nZXRCaXRzTGVuZ3RoID0gZnVuY3Rpb24gZ2V0Qml0c0xlbmd0aCAoKSB7XG4gIHJldHVybiBCeXRlRGF0YS5nZXRCaXRzTGVuZ3RoKHRoaXMuZGF0YS5sZW5ndGgpXG59XG5cbkJ5dGVEYXRhLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChiaXRCdWZmZXIpIHtcbiAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLmRhdGEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgYml0QnVmZmVyLnB1dCh0aGlzLmRhdGFbaV0sIDgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCeXRlRGF0YVxuIiwgImNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxuY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcblxuZnVuY3Rpb24gS2FuamlEYXRhIChkYXRhKSB7XG4gIHRoaXMubW9kZSA9IE1vZGUuS0FOSklcbiAgdGhpcy5kYXRhID0gZGF0YVxufVxuXG5LYW5qaURhdGEuZ2V0Qml0c0xlbmd0aCA9IGZ1bmN0aW9uIGdldEJpdHNMZW5ndGggKGxlbmd0aCkge1xuICByZXR1cm4gbGVuZ3RoICogMTNcbn1cblxuS2FuamlEYXRhLnByb3RvdHlwZS5nZXRMZW5ndGggPSBmdW5jdGlvbiBnZXRMZW5ndGggKCkge1xuICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aFxufVxuXG5LYW5qaURhdGEucHJvdG90eXBlLmdldEJpdHNMZW5ndGggPSBmdW5jdGlvbiBnZXRCaXRzTGVuZ3RoICgpIHtcbiAgcmV0dXJuIEthbmppRGF0YS5nZXRCaXRzTGVuZ3RoKHRoaXMuZGF0YS5sZW5ndGgpXG59XG5cbkthbmppRGF0YS5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoYml0QnVmZmVyKSB7XG4gIGxldCBpXG5cbiAgLy8gSW4gdGhlIFNoaWZ0IEpJUyBzeXN0ZW0sIEthbmppIGNoYXJhY3RlcnMgYXJlIHJlcHJlc2VudGVkIGJ5IGEgdHdvIGJ5dGUgY29tYmluYXRpb24uXG4gIC8vIFRoZXNlIGJ5dGUgdmFsdWVzIGFyZSBzaGlmdGVkIGZyb20gdGhlIEpJUyBYIDAyMDggdmFsdWVzLlxuICAvLyBKSVMgWCAwMjA4IGdpdmVzIGRldGFpbHMgb2YgdGhlIHNoaWZ0IGNvZGVkIHJlcHJlc2VudGF0aW9uLlxuICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHZhbHVlID0gVXRpbHMudG9TSklTKHRoaXMuZGF0YVtpXSlcblxuICAgIC8vIEZvciBjaGFyYWN0ZXJzIHdpdGggU2hpZnQgSklTIHZhbHVlcyBmcm9tIDB4ODE0MCB0byAweDlGRkM6XG4gICAgaWYgKHZhbHVlID49IDB4ODE0MCAmJiB2YWx1ZSA8PSAweDlGRkMpIHtcbiAgICAgIC8vIFN1YnRyYWN0IDB4ODE0MCBmcm9tIFNoaWZ0IEpJUyB2YWx1ZVxuICAgICAgdmFsdWUgLT0gMHg4MTQwXG5cbiAgICAvLyBGb3IgY2hhcmFjdGVycyB3aXRoIFNoaWZ0IEpJUyB2YWx1ZXMgZnJvbSAweEUwNDAgdG8gMHhFQkJGXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA+PSAweEUwNDAgJiYgdmFsdWUgPD0gMHhFQkJGKSB7XG4gICAgICAvLyBTdWJ0cmFjdCAweEMxNDAgZnJvbSBTaGlmdCBKSVMgdmFsdWVcbiAgICAgIHZhbHVlIC09IDB4QzE0MFxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdJbnZhbGlkIFNKSVMgY2hhcmFjdGVyOiAnICsgdGhpcy5kYXRhW2ldICsgJ1xcbicgK1xuICAgICAgICAnTWFrZSBzdXJlIHlvdXIgY2hhcnNldCBpcyBVVEYtOCcpXG4gICAgfVxuXG4gICAgLy8gTXVsdGlwbHkgbW9zdCBzaWduaWZpY2FudCBieXRlIG9mIHJlc3VsdCBieSAweEMwXG4gICAgLy8gYW5kIGFkZCBsZWFzdCBzaWduaWZpY2FudCBieXRlIHRvIHByb2R1Y3RcbiAgICB2YWx1ZSA9ICgoKHZhbHVlID4+PiA4KSAmIDB4ZmYpICogMHhDMCkgKyAodmFsdWUgJiAweGZmKVxuXG4gICAgLy8gQ29udmVydCByZXN1bHQgdG8gYSAxMy1iaXQgYmluYXJ5IHN0cmluZ1xuICAgIGJpdEJ1ZmZlci5wdXQodmFsdWUsIDEzKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gS2FuamlEYXRhXG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBDcmVhdGVkIDIwMDgtMDgtMTkuXG4gKlxuICogRGlqa3N0cmEgcGF0aC1maW5kaW5nIGZ1bmN0aW9ucy4gQWRhcHRlZCBmcm9tIHRoZSBEaWprc3RhciBQeXRob24gcHJvamVjdC5cbiAqXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDhcbiAqICAgV3lhdHQgQmFsZHdpbiA8c2VsZkB3eWF0dGJhbGR3aW4uY29tPlxuICogICBBbGwgcmlnaHRzIHJlc2VydmVkXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICpcbiAqICAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiAqIFRIRSBTT0ZUV0FSRS5cbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBkaWprc3RyYSA9IHtcbiAgc2luZ2xlX3NvdXJjZV9zaG9ydGVzdF9wYXRoczogZnVuY3Rpb24oZ3JhcGgsIHMsIGQpIHtcbiAgICAvLyBQcmVkZWNlc3NvciBtYXAgZm9yIGVhY2ggbm9kZSB0aGF0IGhhcyBiZWVuIGVuY291bnRlcmVkLlxuICAgIC8vIG5vZGUgSUQgPT4gcHJlZGVjZXNzb3Igbm9kZSBJRFxuICAgIHZhciBwcmVkZWNlc3NvcnMgPSB7fTtcblxuICAgIC8vIENvc3RzIG9mIHNob3J0ZXN0IHBhdGhzIGZyb20gcyB0byBhbGwgbm9kZXMgZW5jb3VudGVyZWQuXG4gICAgLy8gbm9kZSBJRCA9PiBjb3N0XG4gICAgdmFyIGNvc3RzID0ge307XG4gICAgY29zdHNbc10gPSAwO1xuXG4gICAgLy8gQ29zdHMgb2Ygc2hvcnRlc3QgcGF0aHMgZnJvbSBzIHRvIGFsbCBub2RlcyBlbmNvdW50ZXJlZDsgZGlmZmVycyBmcm9tXG4gICAgLy8gYGNvc3RzYCBpbiB0aGF0IGl0IHByb3ZpZGVzIGVhc3kgYWNjZXNzIHRvIHRoZSBub2RlIHRoYXQgY3VycmVudGx5IGhhc1xuICAgIC8vIHRoZSBrbm93biBzaG9ydGVzdCBwYXRoIGZyb20gcy5cbiAgICAvLyBYWFg6IERvIHdlIGFjdHVhbGx5IG5lZWQgYm90aCBgY29zdHNgIGFuZCBgb3BlbmA/XG4gICAgdmFyIG9wZW4gPSBkaWprc3RyYS5Qcmlvcml0eVF1ZXVlLm1ha2UoKTtcbiAgICBvcGVuLnB1c2gocywgMCk7XG5cbiAgICB2YXIgY2xvc2VzdCxcbiAgICAgICAgdSwgdixcbiAgICAgICAgY29zdF9vZl9zX3RvX3UsXG4gICAgICAgIGFkamFjZW50X25vZGVzLFxuICAgICAgICBjb3N0X29mX2UsXG4gICAgICAgIGNvc3Rfb2Zfc190b191X3BsdXNfY29zdF9vZl9lLFxuICAgICAgICBjb3N0X29mX3NfdG9fdixcbiAgICAgICAgZmlyc3RfdmlzaXQ7XG4gICAgd2hpbGUgKCFvcGVuLmVtcHR5KCkpIHtcbiAgICAgIC8vIEluIHRoZSBub2RlcyByZW1haW5pbmcgaW4gZ3JhcGggdGhhdCBoYXZlIGEga25vd24gY29zdCBmcm9tIHMsXG4gICAgICAvLyBmaW5kIHRoZSBub2RlLCB1LCB0aGF0IGN1cnJlbnRseSBoYXMgdGhlIHNob3J0ZXN0IHBhdGggZnJvbSBzLlxuICAgICAgY2xvc2VzdCA9IG9wZW4ucG9wKCk7XG4gICAgICB1ID0gY2xvc2VzdC52YWx1ZTtcbiAgICAgIGNvc3Rfb2Zfc190b191ID0gY2xvc2VzdC5jb3N0O1xuXG4gICAgICAvLyBHZXQgbm9kZXMgYWRqYWNlbnQgdG8gdS4uLlxuICAgICAgYWRqYWNlbnRfbm9kZXMgPSBncmFwaFt1XSB8fCB7fTtcblxuICAgICAgLy8gLi4uYW5kIGV4cGxvcmUgdGhlIGVkZ2VzIHRoYXQgY29ubmVjdCB1IHRvIHRob3NlIG5vZGVzLCB1cGRhdGluZ1xuICAgICAgLy8gdGhlIGNvc3Qgb2YgdGhlIHNob3J0ZXN0IHBhdGhzIHRvIGFueSBvciBhbGwgb2YgdGhvc2Ugbm9kZXMgYXNcbiAgICAgIC8vIG5lY2Vzc2FyeS4gdiBpcyB0aGUgbm9kZSBhY3Jvc3MgdGhlIGN1cnJlbnQgZWRnZSBmcm9tIHUuXG4gICAgICBmb3IgKHYgaW4gYWRqYWNlbnRfbm9kZXMpIHtcbiAgICAgICAgaWYgKGFkamFjZW50X25vZGVzLmhhc093blByb3BlcnR5KHYpKSB7XG4gICAgICAgICAgLy8gR2V0IHRoZSBjb3N0IG9mIHRoZSBlZGdlIHJ1bm5pbmcgZnJvbSB1IHRvIHYuXG4gICAgICAgICAgY29zdF9vZl9lID0gYWRqYWNlbnRfbm9kZXNbdl07XG5cbiAgICAgICAgICAvLyBDb3N0IG9mIHMgdG8gdSBwbHVzIHRoZSBjb3N0IG9mIHUgdG8gdiBhY3Jvc3MgZS0tdGhpcyBpcyAqYSpcbiAgICAgICAgICAvLyBjb3N0IGZyb20gcyB0byB2IHRoYXQgbWF5IG9yIG1heSBub3QgYmUgbGVzcyB0aGFuIHRoZSBjdXJyZW50XG4gICAgICAgICAgLy8ga25vd24gY29zdCB0byB2LlxuICAgICAgICAgIGNvc3Rfb2Zfc190b191X3BsdXNfY29zdF9vZl9lID0gY29zdF9vZl9zX3RvX3UgKyBjb3N0X29mX2U7XG5cbiAgICAgICAgICAvLyBJZiB3ZSBoYXZlbid0IHZpc2l0ZWQgdiB5ZXQgT1IgaWYgdGhlIGN1cnJlbnQga25vd24gY29zdCBmcm9tIHMgdG9cbiAgICAgICAgICAvLyB2IGlzIGdyZWF0ZXIgdGhhbiB0aGUgbmV3IGNvc3Qgd2UganVzdCBmb3VuZCAoY29zdCBvZiBzIHRvIHUgcGx1c1xuICAgICAgICAgIC8vIGNvc3Qgb2YgdSB0byB2IGFjcm9zcyBlKSwgdXBkYXRlIHYncyBjb3N0IGluIHRoZSBjb3N0IGxpc3QgYW5kXG4gICAgICAgICAgLy8gdXBkYXRlIHYncyBwcmVkZWNlc3NvciBpbiB0aGUgcHJlZGVjZXNzb3IgbGlzdCAoaXQncyBub3cgdSkuXG4gICAgICAgICAgY29zdF9vZl9zX3RvX3YgPSBjb3N0c1t2XTtcbiAgICAgICAgICBmaXJzdF92aXNpdCA9ICh0eXBlb2YgY29zdHNbdl0gPT09ICd1bmRlZmluZWQnKTtcbiAgICAgICAgICBpZiAoZmlyc3RfdmlzaXQgfHwgY29zdF9vZl9zX3RvX3YgPiBjb3N0X29mX3NfdG9fdV9wbHVzX2Nvc3Rfb2ZfZSkge1xuICAgICAgICAgICAgY29zdHNbdl0gPSBjb3N0X29mX3NfdG9fdV9wbHVzX2Nvc3Rfb2ZfZTtcbiAgICAgICAgICAgIG9wZW4ucHVzaCh2LCBjb3N0X29mX3NfdG9fdV9wbHVzX2Nvc3Rfb2ZfZSk7XG4gICAgICAgICAgICBwcmVkZWNlc3NvcnNbdl0gPSB1O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNvc3RzW2RdID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdmFyIG1zZyA9IFsnQ291bGQgbm90IGZpbmQgYSBwYXRoIGZyb20gJywgcywgJyB0byAnLCBkLCAnLiddLmpvaW4oJycpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByZWRlY2Vzc29ycztcbiAgfSxcblxuICBleHRyYWN0X3Nob3J0ZXN0X3BhdGhfZnJvbV9wcmVkZWNlc3Nvcl9saXN0OiBmdW5jdGlvbihwcmVkZWNlc3NvcnMsIGQpIHtcbiAgICB2YXIgbm9kZXMgPSBbXTtcbiAgICB2YXIgdSA9IGQ7XG4gICAgdmFyIHByZWRlY2Vzc29yO1xuICAgIHdoaWxlICh1KSB7XG4gICAgICBub2Rlcy5wdXNoKHUpO1xuICAgICAgcHJlZGVjZXNzb3IgPSBwcmVkZWNlc3NvcnNbdV07XG4gICAgICB1ID0gcHJlZGVjZXNzb3JzW3VdO1xuICAgIH1cbiAgICBub2Rlcy5yZXZlcnNlKCk7XG4gICAgcmV0dXJuIG5vZGVzO1xuICB9LFxuXG4gIGZpbmRfcGF0aDogZnVuY3Rpb24oZ3JhcGgsIHMsIGQpIHtcbiAgICB2YXIgcHJlZGVjZXNzb3JzID0gZGlqa3N0cmEuc2luZ2xlX3NvdXJjZV9zaG9ydGVzdF9wYXRocyhncmFwaCwgcywgZCk7XG4gICAgcmV0dXJuIGRpamtzdHJhLmV4dHJhY3Rfc2hvcnRlc3RfcGF0aF9mcm9tX3ByZWRlY2Vzc29yX2xpc3QoXG4gICAgICBwcmVkZWNlc3NvcnMsIGQpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBBIHZlcnkgbmFpdmUgcHJpb3JpdHkgcXVldWUgaW1wbGVtZW50YXRpb24uXG4gICAqL1xuICBQcmlvcml0eVF1ZXVlOiB7XG4gICAgbWFrZTogZnVuY3Rpb24gKG9wdHMpIHtcbiAgICAgIHZhciBUID0gZGlqa3N0cmEuUHJpb3JpdHlRdWV1ZSxcbiAgICAgICAgICB0ID0ge30sXG4gICAgICAgICAga2V5O1xuICAgICAgb3B0cyA9IG9wdHMgfHwge307XG4gICAgICBmb3IgKGtleSBpbiBUKSB7XG4gICAgICAgIGlmIChULmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICB0W2tleV0gPSBUW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHQucXVldWUgPSBbXTtcbiAgICAgIHQuc29ydGVyID0gb3B0cy5zb3J0ZXIgfHwgVC5kZWZhdWx0X3NvcnRlcjtcbiAgICAgIHJldHVybiB0O1xuICAgIH0sXG5cbiAgICBkZWZhdWx0X3NvcnRlcjogZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLmNvc3QgLSBiLmNvc3Q7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBhIG5ldyBpdGVtIHRvIHRoZSBxdWV1ZSBhbmQgZW5zdXJlIHRoZSBoaWdoZXN0IHByaW9yaXR5IGVsZW1lbnRcbiAgICAgKiBpcyBhdCB0aGUgZnJvbnQgb2YgdGhlIHF1ZXVlLlxuICAgICAqL1xuICAgIHB1c2g6IGZ1bmN0aW9uICh2YWx1ZSwgY29zdCkge1xuICAgICAgdmFyIGl0ZW0gPSB7dmFsdWU6IHZhbHVlLCBjb3N0OiBjb3N0fTtcbiAgICAgIHRoaXMucXVldWUucHVzaChpdGVtKTtcbiAgICAgIHRoaXMucXVldWUuc29ydCh0aGlzLnNvcnRlcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgaGlnaGVzdCBwcmlvcml0eSBlbGVtZW50IGluIHRoZSBxdWV1ZS5cbiAgICAgKi9cbiAgICBwb3A6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnF1ZXVlLnNoaWZ0KCk7XG4gICAgfSxcblxuICAgIGVtcHR5OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZS5sZW5ndGggPT09IDA7XG4gICAgfVxuICB9XG59O1xuXG5cbi8vIG5vZGUuanMgbW9kdWxlIGV4cG9ydHNcbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGRpamtzdHJhO1xufVxuIiwgImNvbnN0IE1vZGUgPSByZXF1aXJlKCcuL21vZGUnKVxuY29uc3QgTnVtZXJpY0RhdGEgPSByZXF1aXJlKCcuL251bWVyaWMtZGF0YScpXG5jb25zdCBBbHBoYW51bWVyaWNEYXRhID0gcmVxdWlyZSgnLi9hbHBoYW51bWVyaWMtZGF0YScpXG5jb25zdCBCeXRlRGF0YSA9IHJlcXVpcmUoJy4vYnl0ZS1kYXRhJylcbmNvbnN0IEthbmppRGF0YSA9IHJlcXVpcmUoJy4va2FuamktZGF0YScpXG5jb25zdCBSZWdleCA9IHJlcXVpcmUoJy4vcmVnZXgnKVxuY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcbmNvbnN0IGRpamtzdHJhID0gcmVxdWlyZSgnZGlqa3N0cmFqcycpXG5cbi8qKlxuICogUmV0dXJucyBVVEY4IGJ5dGUgbGVuZ3RoXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBzdHIgSW5wdXQgc3RyaW5nXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICBOdW1iZXIgb2YgYnl0ZVxuICovXG5mdW5jdGlvbiBnZXRTdHJpbmdCeXRlTGVuZ3RoIChzdHIpIHtcbiAgcmV0dXJuIHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChzdHIpKS5sZW5ndGhcbn1cblxuLyoqXG4gKiBHZXQgYSBsaXN0IG9mIHNlZ21lbnRzIG9mIHRoZSBzcGVjaWZpZWQgbW9kZVxuICogZnJvbSBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSAge01vZGV9ICAgbW9kZSBTZWdtZW50IG1vZGVcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyICBTdHJpbmcgdG8gcHJvY2Vzc1xuICogQHJldHVybiB7QXJyYXl9ICAgICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqL1xuZnVuY3Rpb24gZ2V0U2VnbWVudHMgKHJlZ2V4LCBtb2RlLCBzdHIpIHtcbiAgY29uc3Qgc2VnbWVudHMgPSBbXVxuICBsZXQgcmVzdWx0XG5cbiAgd2hpbGUgKChyZXN1bHQgPSByZWdleC5leGVjKHN0cikpICE9PSBudWxsKSB7XG4gICAgc2VnbWVudHMucHVzaCh7XG4gICAgICBkYXRhOiByZXN1bHRbMF0sXG4gICAgICBpbmRleDogcmVzdWx0LmluZGV4LFxuICAgICAgbW9kZTogbW9kZSxcbiAgICAgIGxlbmd0aDogcmVzdWx0WzBdLmxlbmd0aFxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gc2VnbWVudHNcbn1cblxuLyoqXG4gKiBFeHRyYWN0cyBhIHNlcmllcyBvZiBzZWdtZW50cyB3aXRoIHRoZSBhcHByb3ByaWF0ZVxuICogbW9kZXMgZnJvbSBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YVN0ciBJbnB1dCBzdHJpbmdcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICBBcnJheSBvZiBvYmplY3Qgd2l0aCBzZWdtZW50cyBkYXRhXG4gKi9cbmZ1bmN0aW9uIGdldFNlZ21lbnRzRnJvbVN0cmluZyAoZGF0YVN0cikge1xuICBjb25zdCBudW1TZWdzID0gZ2V0U2VnbWVudHMoUmVnZXguTlVNRVJJQywgTW9kZS5OVU1FUklDLCBkYXRhU3RyKVxuICBjb25zdCBhbHBoYU51bVNlZ3MgPSBnZXRTZWdtZW50cyhSZWdleC5BTFBIQU5VTUVSSUMsIE1vZGUuQUxQSEFOVU1FUklDLCBkYXRhU3RyKVxuICBsZXQgYnl0ZVNlZ3NcbiAgbGV0IGthbmppU2Vnc1xuXG4gIGlmIChVdGlscy5pc0thbmppTW9kZUVuYWJsZWQoKSkge1xuICAgIGJ5dGVTZWdzID0gZ2V0U2VnbWVudHMoUmVnZXguQllURSwgTW9kZS5CWVRFLCBkYXRhU3RyKVxuICAgIGthbmppU2VncyA9IGdldFNlZ21lbnRzKFJlZ2V4LktBTkpJLCBNb2RlLktBTkpJLCBkYXRhU3RyKVxuICB9IGVsc2Uge1xuICAgIGJ5dGVTZWdzID0gZ2V0U2VnbWVudHMoUmVnZXguQllURV9LQU5KSSwgTW9kZS5CWVRFLCBkYXRhU3RyKVxuICAgIGthbmppU2VncyA9IFtdXG4gIH1cblxuICBjb25zdCBzZWdzID0gbnVtU2Vncy5jb25jYXQoYWxwaGFOdW1TZWdzLCBieXRlU2Vncywga2FuamlTZWdzKVxuXG4gIHJldHVybiBzZWdzXG4gICAgLnNvcnQoZnVuY3Rpb24gKHMxLCBzMikge1xuICAgICAgcmV0dXJuIHMxLmluZGV4IC0gczIuaW5kZXhcbiAgICB9KVxuICAgIC5tYXAoZnVuY3Rpb24gKG9iaikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YTogb2JqLmRhdGEsXG4gICAgICAgIG1vZGU6IG9iai5tb2RlLFxuICAgICAgICBsZW5ndGg6IG9iai5sZW5ndGhcbiAgICAgIH1cbiAgICB9KVxufVxuXG4vKipcbiAqIFJldHVybnMgaG93IG1hbnkgYml0cyBhcmUgbmVlZGVkIHRvIGVuY29kZSBhIHN0cmluZyBvZlxuICogc3BlY2lmaWVkIGxlbmd0aCB3aXRoIHRoZSBzcGVjaWZpZWQgbW9kZVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gbGVuZ3RoIFN0cmluZyBsZW5ndGhcbiAqIEBwYXJhbSAge01vZGV9IG1vZGUgICAgIFNlZ21lbnQgbW9kZVxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgQml0IGxlbmd0aFxuICovXG5mdW5jdGlvbiBnZXRTZWdtZW50Qml0c0xlbmd0aCAobGVuZ3RoLCBtb2RlKSB7XG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgTW9kZS5OVU1FUklDOlxuICAgICAgcmV0dXJuIE51bWVyaWNEYXRhLmdldEJpdHNMZW5ndGgobGVuZ3RoKVxuICAgIGNhc2UgTW9kZS5BTFBIQU5VTUVSSUM6XG4gICAgICByZXR1cm4gQWxwaGFudW1lcmljRGF0YS5nZXRCaXRzTGVuZ3RoKGxlbmd0aClcbiAgICBjYXNlIE1vZGUuS0FOSkk6XG4gICAgICByZXR1cm4gS2FuamlEYXRhLmdldEJpdHNMZW5ndGgobGVuZ3RoKVxuICAgIGNhc2UgTW9kZS5CWVRFOlxuICAgICAgcmV0dXJuIEJ5dGVEYXRhLmdldEJpdHNMZW5ndGgobGVuZ3RoKVxuICB9XG59XG5cbi8qKlxuICogTWVyZ2VzIGFkamFjZW50IHNlZ21lbnRzIHdoaWNoIGhhdmUgdGhlIHNhbWUgbW9kZVxuICpcbiAqIEBwYXJhbSAge0FycmF5fSBzZWdzIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqL1xuZnVuY3Rpb24gbWVyZ2VTZWdtZW50cyAoc2Vncykge1xuICByZXR1cm4gc2Vncy5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgY3Vycikge1xuICAgIGNvbnN0IHByZXZTZWcgPSBhY2MubGVuZ3RoIC0gMSA+PSAwID8gYWNjW2FjYy5sZW5ndGggLSAxXSA6IG51bGxcbiAgICBpZiAocHJldlNlZyAmJiBwcmV2U2VnLm1vZGUgPT09IGN1cnIubW9kZSkge1xuICAgICAgYWNjW2FjYy5sZW5ndGggLSAxXS5kYXRhICs9IGN1cnIuZGF0YVxuICAgICAgcmV0dXJuIGFjY1xuICAgIH1cblxuICAgIGFjYy5wdXNoKGN1cnIpXG4gICAgcmV0dXJuIGFjY1xuICB9LCBbXSlcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBsaXN0IG9mIGFsbCBwb3NzaWJsZSBub2RlcyBjb21iaW5hdGlvbiB3aGljaFxuICogd2lsbCBiZSB1c2VkIHRvIGJ1aWxkIGEgc2VnbWVudHMgZ3JhcGguXG4gKlxuICogTm9kZXMgYXJlIGRpdmlkZWQgYnkgZ3JvdXBzLiBFYWNoIGdyb3VwIHdpbGwgY29udGFpbiBhIGxpc3Qgb2YgYWxsIHRoZSBtb2Rlc1xuICogaW4gd2hpY2ggaXMgcG9zc2libGUgdG8gZW5jb2RlIHRoZSBnaXZlbiB0ZXh0LlxuICpcbiAqIEZvciBleGFtcGxlIHRoZSB0ZXh0ICcxMjM0NScgY2FuIGJlIGVuY29kZWQgYXMgTnVtZXJpYywgQWxwaGFudW1lcmljIG9yIEJ5dGUuXG4gKiBUaGUgZ3JvdXAgZm9yICcxMjM0NScgd2lsbCBjb250YWluIHRoZW4gMyBvYmplY3RzLCBvbmUgZm9yIGVhY2hcbiAqIHBvc3NpYmxlIGVuY29kaW5nIG1vZGUuXG4gKlxuICogRWFjaCBub2RlIHJlcHJlc2VudHMgYSBwb3NzaWJsZSBzZWdtZW50LlxuICpcbiAqIEBwYXJhbSAge0FycmF5fSBzZWdzIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgIEFycmF5IG9mIG9iamVjdCB3aXRoIHNlZ21lbnRzIGRhdGFcbiAqL1xuZnVuY3Rpb24gYnVpbGROb2RlcyAoc2Vncykge1xuICBjb25zdCBub2RlcyA9IFtdXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2Vncy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHNlZyA9IHNlZ3NbaV1cblxuICAgIHN3aXRjaCAoc2VnLm1vZGUpIHtcbiAgICAgIGNhc2UgTW9kZS5OVU1FUklDOlxuICAgICAgICBub2Rlcy5wdXNoKFtzZWcsXG4gICAgICAgICAgeyBkYXRhOiBzZWcuZGF0YSwgbW9kZTogTW9kZS5BTFBIQU5VTUVSSUMsIGxlbmd0aDogc2VnLmxlbmd0aCB9LFxuICAgICAgICAgIHsgZGF0YTogc2VnLmRhdGEsIG1vZGU6IE1vZGUuQllURSwgbGVuZ3RoOiBzZWcubGVuZ3RoIH1cbiAgICAgICAgXSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgTW9kZS5BTFBIQU5VTUVSSUM6XG4gICAgICAgIG5vZGVzLnB1c2goW3NlZyxcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkJZVEUsIGxlbmd0aDogc2VnLmxlbmd0aCB9XG4gICAgICAgIF0pXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIE1vZGUuS0FOSkk6XG4gICAgICAgIG5vZGVzLnB1c2goW3NlZyxcbiAgICAgICAgICB7IGRhdGE6IHNlZy5kYXRhLCBtb2RlOiBNb2RlLkJZVEUsIGxlbmd0aDogZ2V0U3RyaW5nQnl0ZUxlbmd0aChzZWcuZGF0YSkgfVxuICAgICAgICBdKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBNb2RlLkJZVEU6XG4gICAgICAgIG5vZGVzLnB1c2goW1xuICAgICAgICAgIHsgZGF0YTogc2VnLmRhdGEsIG1vZGU6IE1vZGUuQllURSwgbGVuZ3RoOiBnZXRTdHJpbmdCeXRlTGVuZ3RoKHNlZy5kYXRhKSB9XG4gICAgICAgIF0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5vZGVzXG59XG5cbi8qKlxuICogQnVpbGRzIGEgZ3JhcGggZnJvbSBhIGxpc3Qgb2Ygbm9kZXMuXG4gKiBBbGwgc2VnbWVudHMgaW4gZWFjaCBub2RlIGdyb3VwIHdpbGwgYmUgY29ubmVjdGVkIHdpdGggYWxsIHRoZSBzZWdtZW50cyBvZlxuICogdGhlIG5leHQgZ3JvdXAgYW5kIHNvIG9uLlxuICpcbiAqIEF0IGVhY2ggY29ubmVjdGlvbiB3aWxsIGJlIGFzc2lnbmVkIGEgd2VpZ2h0IGRlcGVuZGluZyBvbiB0aGVcbiAqIHNlZ21lbnQncyBieXRlIGxlbmd0aC5cbiAqXG4gKiBAcGFyYW0gIHtBcnJheX0gbm9kZXMgICAgQXJyYXkgb2Ygb2JqZWN0IHdpdGggc2VnbWVudHMgZGF0YVxuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uIFFSIENvZGUgdmVyc2lvblxuICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgIEdyYXBoIG9mIGFsbCBwb3NzaWJsZSBzZWdtZW50c1xuICovXG5mdW5jdGlvbiBidWlsZEdyYXBoIChub2RlcywgdmVyc2lvbikge1xuICBjb25zdCB0YWJsZSA9IHt9XG4gIGNvbnN0IGdyYXBoID0geyBzdGFydDoge30gfVxuICBsZXQgcHJldk5vZGVJZHMgPSBbJ3N0YXJ0J11cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgbm9kZUdyb3VwID0gbm9kZXNbaV1cbiAgICBjb25zdCBjdXJyZW50Tm9kZUlkcyA9IFtdXG5cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGVHcm91cC5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3Qgbm9kZSA9IG5vZGVHcm91cFtqXVxuICAgICAgY29uc3Qga2V5ID0gJycgKyBpICsgalxuXG4gICAgICBjdXJyZW50Tm9kZUlkcy5wdXNoKGtleSlcbiAgICAgIHRhYmxlW2tleV0gPSB7IG5vZGU6IG5vZGUsIGxhc3RDb3VudDogMCB9XG4gICAgICBncmFwaFtrZXldID0ge31cblxuICAgICAgZm9yIChsZXQgbiA9IDA7IG4gPCBwcmV2Tm9kZUlkcy5sZW5ndGg7IG4rKykge1xuICAgICAgICBjb25zdCBwcmV2Tm9kZUlkID0gcHJldk5vZGVJZHNbbl1cblxuICAgICAgICBpZiAodGFibGVbcHJldk5vZGVJZF0gJiYgdGFibGVbcHJldk5vZGVJZF0ubm9kZS5tb2RlID09PSBub2RlLm1vZGUpIHtcbiAgICAgICAgICBncmFwaFtwcmV2Tm9kZUlkXVtrZXldID1cbiAgICAgICAgICAgIGdldFNlZ21lbnRCaXRzTGVuZ3RoKHRhYmxlW3ByZXZOb2RlSWRdLmxhc3RDb3VudCArIG5vZGUubGVuZ3RoLCBub2RlLm1vZGUpIC1cbiAgICAgICAgICAgIGdldFNlZ21lbnRCaXRzTGVuZ3RoKHRhYmxlW3ByZXZOb2RlSWRdLmxhc3RDb3VudCwgbm9kZS5tb2RlKVxuXG4gICAgICAgICAgdGFibGVbcHJldk5vZGVJZF0ubGFzdENvdW50ICs9IG5vZGUubGVuZ3RoXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRhYmxlW3ByZXZOb2RlSWRdKSB0YWJsZVtwcmV2Tm9kZUlkXS5sYXN0Q291bnQgPSBub2RlLmxlbmd0aFxuXG4gICAgICAgICAgZ3JhcGhbcHJldk5vZGVJZF1ba2V5XSA9IGdldFNlZ21lbnRCaXRzTGVuZ3RoKG5vZGUubGVuZ3RoLCBub2RlLm1vZGUpICtcbiAgICAgICAgICAgIDQgKyBNb2RlLmdldENoYXJDb3VudEluZGljYXRvcihub2RlLm1vZGUsIHZlcnNpb24pIC8vIHN3aXRjaCBjb3N0XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBwcmV2Tm9kZUlkcyA9IGN1cnJlbnROb2RlSWRzXG4gIH1cblxuICBmb3IgKGxldCBuID0gMDsgbiA8IHByZXZOb2RlSWRzLmxlbmd0aDsgbisrKSB7XG4gICAgZ3JhcGhbcHJldk5vZGVJZHNbbl1dLmVuZCA9IDBcbiAgfVxuXG4gIHJldHVybiB7IG1hcDogZ3JhcGgsIHRhYmxlOiB0YWJsZSB9XG59XG5cbi8qKlxuICogQnVpbGRzIGEgc2VnbWVudCBmcm9tIGEgc3BlY2lmaWVkIGRhdGEgYW5kIG1vZGUuXG4gKiBJZiBhIG1vZGUgaXMgbm90IHNwZWNpZmllZCwgdGhlIG1vcmUgc3VpdGFibGUgd2lsbCBiZSB1c2VkLlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gZGF0YSAgICAgICAgICAgICBJbnB1dCBkYXRhXG4gKiBAcGFyYW0gIHtNb2RlIHwgU3RyaW5nfSBtb2Rlc0hpbnQgRGF0YSBtb2RlXG4gKiBAcmV0dXJuIHtTZWdtZW50fSAgICAgICAgICAgICAgICAgU2VnbWVudFxuICovXG5mdW5jdGlvbiBidWlsZFNpbmdsZVNlZ21lbnQgKGRhdGEsIG1vZGVzSGludCkge1xuICBsZXQgbW9kZVxuICBjb25zdCBiZXN0TW9kZSA9IE1vZGUuZ2V0QmVzdE1vZGVGb3JEYXRhKGRhdGEpXG5cbiAgbW9kZSA9IE1vZGUuZnJvbShtb2Rlc0hpbnQsIGJlc3RNb2RlKVxuXG4gIC8vIE1ha2Ugc3VyZSBkYXRhIGNhbiBiZSBlbmNvZGVkXG4gIGlmIChtb2RlICE9PSBNb2RlLkJZVEUgJiYgbW9kZS5iaXQgPCBiZXN0TW9kZS5iaXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1wiJyArIGRhdGEgKyAnXCInICtcbiAgICAgICcgY2Fubm90IGJlIGVuY29kZWQgd2l0aCBtb2RlICcgKyBNb2RlLnRvU3RyaW5nKG1vZGUpICtcbiAgICAgICcuXFxuIFN1Z2dlc3RlZCBtb2RlIGlzOiAnICsgTW9kZS50b1N0cmluZyhiZXN0TW9kZSkpXG4gIH1cblxuICAvLyBVc2UgTW9kZS5CWVRFIGlmIEthbmppIHN1cHBvcnQgaXMgZGlzYWJsZWRcbiAgaWYgKG1vZGUgPT09IE1vZGUuS0FOSkkgJiYgIVV0aWxzLmlzS2FuamlNb2RlRW5hYmxlZCgpKSB7XG4gICAgbW9kZSA9IE1vZGUuQllURVxuICB9XG5cbiAgc3dpdGNoIChtb2RlKSB7XG4gICAgY2FzZSBNb2RlLk5VTUVSSUM6XG4gICAgICByZXR1cm4gbmV3IE51bWVyaWNEYXRhKGRhdGEpXG5cbiAgICBjYXNlIE1vZGUuQUxQSEFOVU1FUklDOlxuICAgICAgcmV0dXJuIG5ldyBBbHBoYW51bWVyaWNEYXRhKGRhdGEpXG5cbiAgICBjYXNlIE1vZGUuS0FOSkk6XG4gICAgICByZXR1cm4gbmV3IEthbmppRGF0YShkYXRhKVxuXG4gICAgY2FzZSBNb2RlLkJZVEU6XG4gICAgICByZXR1cm4gbmV3IEJ5dGVEYXRhKGRhdGEpXG4gIH1cbn1cblxuLyoqXG4gKiBCdWlsZHMgYSBsaXN0IG9mIHNlZ21lbnRzIGZyb20gYW4gYXJyYXkuXG4gKiBBcnJheSBjYW4gY29udGFpbiBTdHJpbmdzIG9yIE9iamVjdHMgd2l0aCBzZWdtZW50J3MgaW5mby5cbiAqXG4gKiBGb3IgZWFjaCBpdGVtIHdoaWNoIGlzIGEgc3RyaW5nLCB3aWxsIGJlIGdlbmVyYXRlZCBhIHNlZ21lbnQgd2l0aCB0aGUgZ2l2ZW5cbiAqIHN0cmluZyBhbmQgdGhlIG1vcmUgYXBwcm9wcmlhdGUgZW5jb2RpbmcgbW9kZS5cbiAqXG4gKiBGb3IgZWFjaCBpdGVtIHdoaWNoIGlzIGFuIG9iamVjdCwgd2lsbCBiZSBnZW5lcmF0ZWQgYSBzZWdtZW50IHdpdGggdGhlIGdpdmVuXG4gKiBkYXRhIGFuZCBtb2RlLlxuICogT2JqZWN0cyBtdXN0IGNvbnRhaW4gYXQgbGVhc3QgdGhlIHByb3BlcnR5IFwiZGF0YVwiLlxuICogSWYgcHJvcGVydHkgXCJtb2RlXCIgaXMgbm90IHByZXNlbnQsIHRoZSBtb3JlIHN1aXRhYmxlIG1vZGUgd2lsbCBiZSB1c2VkLlxuICpcbiAqIEBwYXJhbSAge0FycmF5fSBhcnJheSBBcnJheSBvZiBvYmplY3RzIHdpdGggc2VnbWVudHMgZGF0YVxuICogQHJldHVybiB7QXJyYXl9ICAgICAgIEFycmF5IG9mIFNlZ21lbnRzXG4gKi9cbmV4cG9ydHMuZnJvbUFycmF5ID0gZnVuY3Rpb24gZnJvbUFycmF5IChhcnJheSkge1xuICByZXR1cm4gYXJyYXkucmVkdWNlKGZ1bmN0aW9uIChhY2MsIHNlZykge1xuICAgIGlmICh0eXBlb2Ygc2VnID09PSAnc3RyaW5nJykge1xuICAgICAgYWNjLnB1c2goYnVpbGRTaW5nbGVTZWdtZW50KHNlZywgbnVsbCkpXG4gICAgfSBlbHNlIGlmIChzZWcuZGF0YSkge1xuICAgICAgYWNjLnB1c2goYnVpbGRTaW5nbGVTZWdtZW50KHNlZy5kYXRhLCBzZWcubW9kZSkpXG4gICAgfVxuXG4gICAgcmV0dXJuIGFjY1xuICB9LCBbXSlcbn1cblxuLyoqXG4gKiBCdWlsZHMgYW4gb3B0aW1pemVkIHNlcXVlbmNlIG9mIHNlZ21lbnRzIGZyb20gYSBzdHJpbmcsXG4gKiB3aGljaCB3aWxsIHByb2R1Y2UgdGhlIHNob3J0ZXN0IHBvc3NpYmxlIGJpdHN0cmVhbS5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGEgICAgSW5wdXQgc3RyaW5nXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICAgQXJyYXkgb2Ygc2VnbWVudHNcbiAqL1xuZXhwb3J0cy5mcm9tU3RyaW5nID0gZnVuY3Rpb24gZnJvbVN0cmluZyAoZGF0YSwgdmVyc2lvbikge1xuICBjb25zdCBzZWdzID0gZ2V0U2VnbWVudHNGcm9tU3RyaW5nKGRhdGEsIFV0aWxzLmlzS2FuamlNb2RlRW5hYmxlZCgpKVxuXG4gIGNvbnN0IG5vZGVzID0gYnVpbGROb2RlcyhzZWdzKVxuICBjb25zdCBncmFwaCA9IGJ1aWxkR3JhcGgobm9kZXMsIHZlcnNpb24pXG4gIGNvbnN0IHBhdGggPSBkaWprc3RyYS5maW5kX3BhdGgoZ3JhcGgubWFwLCAnc3RhcnQnLCAnZW5kJylcblxuICBjb25zdCBvcHRpbWl6ZWRTZWdzID0gW11cbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBwYXRoLmxlbmd0aCAtIDE7IGkrKykge1xuICAgIG9wdGltaXplZFNlZ3MucHVzaChncmFwaC50YWJsZVtwYXRoW2ldXS5ub2RlKVxuICB9XG5cbiAgcmV0dXJuIGV4cG9ydHMuZnJvbUFycmF5KG1lcmdlU2VnbWVudHMob3B0aW1pemVkU2VncykpXG59XG5cbi8qKlxuICogU3BsaXRzIGEgc3RyaW5nIGluIHZhcmlvdXMgc2VnbWVudHMgd2l0aCB0aGUgbW9kZXMgd2hpY2hcbiAqIGJlc3QgcmVwcmVzZW50IHRoZWlyIGNvbnRlbnQuXG4gKiBUaGUgcHJvZHVjZWQgc2VnbWVudHMgYXJlIGZhciBmcm9tIGJlaW5nIG9wdGltaXplZC5cbiAqIFRoZSBvdXRwdXQgb2YgdGhpcyBmdW5jdGlvbiBpcyBvbmx5IHVzZWQgdG8gZXN0aW1hdGUgYSBRUiBDb2RlIHZlcnNpb25cbiAqIHdoaWNoIG1heSBjb250YWluIHRoZSBkYXRhLlxuICpcbiAqIEBwYXJhbSAge3N0cmluZ30gZGF0YSBJbnB1dCBzdHJpbmdcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICBBcnJheSBvZiBzZWdtZW50c1xuICovXG5leHBvcnRzLnJhd1NwbGl0ID0gZnVuY3Rpb24gcmF3U3BsaXQgKGRhdGEpIHtcbiAgcmV0dXJuIGV4cG9ydHMuZnJvbUFycmF5KFxuICAgIGdldFNlZ21lbnRzRnJvbVN0cmluZyhkYXRhLCBVdGlscy5pc0thbmppTW9kZUVuYWJsZWQoKSlcbiAgKVxufVxuIiwgImNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5jb25zdCBFQ0xldmVsID0gcmVxdWlyZSgnLi9lcnJvci1jb3JyZWN0aW9uLWxldmVsJylcbmNvbnN0IEJpdEJ1ZmZlciA9IHJlcXVpcmUoJy4vYml0LWJ1ZmZlcicpXG5jb25zdCBCaXRNYXRyaXggPSByZXF1aXJlKCcuL2JpdC1tYXRyaXgnKVxuY29uc3QgQWxpZ25tZW50UGF0dGVybiA9IHJlcXVpcmUoJy4vYWxpZ25tZW50LXBhdHRlcm4nKVxuY29uc3QgRmluZGVyUGF0dGVybiA9IHJlcXVpcmUoJy4vZmluZGVyLXBhdHRlcm4nKVxuY29uc3QgTWFza1BhdHRlcm4gPSByZXF1aXJlKCcuL21hc2stcGF0dGVybicpXG5jb25zdCBFQ0NvZGUgPSByZXF1aXJlKCcuL2Vycm9yLWNvcnJlY3Rpb24tY29kZScpXG5jb25zdCBSZWVkU29sb21vbkVuY29kZXIgPSByZXF1aXJlKCcuL3JlZWQtc29sb21vbi1lbmNvZGVyJylcbmNvbnN0IFZlcnNpb24gPSByZXF1aXJlKCcuL3ZlcnNpb24nKVxuY29uc3QgRm9ybWF0SW5mbyA9IHJlcXVpcmUoJy4vZm9ybWF0LWluZm8nKVxuY29uc3QgTW9kZSA9IHJlcXVpcmUoJy4vbW9kZScpXG5jb25zdCBTZWdtZW50cyA9IHJlcXVpcmUoJy4vc2VnbWVudHMnKVxuXG4vKipcbiAqIFFSQ29kZSBmb3IgSmF2YVNjcmlwdFxuICpcbiAqIG1vZGlmaWVkIGJ5IFJ5YW4gRGF5IGZvciBub2RlanMgc3VwcG9ydFxuICogQ29weXJpZ2h0IChjKSAyMDExIFJ5YW4gRGF5XG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuICogICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBRUkNvZGUgZm9yIEphdmFTY3JpcHRcbi8vXG4vLyBDb3B5cmlnaHQgKGMpIDIwMDkgS2F6dWhpa28gQXJhc2Vcbi8vXG4vLyBVUkw6IGh0dHA6Ly93d3cuZC1wcm9qZWN0LmNvbS9cbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4vLyAgIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4vL1xuLy8gVGhlIHdvcmQgXCJRUiBDb2RlXCIgaXMgcmVnaXN0ZXJlZCB0cmFkZW1hcmsgb2Zcbi8vIERFTlNPIFdBVkUgSU5DT1JQT1JBVEVEXG4vLyAgIGh0dHA6Ly93d3cuZGVuc28td2F2ZS5jb20vcXJjb2RlL2ZhcXBhdGVudC1lLmh0bWxcbi8vXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuKi9cblxuLyoqXG4gKiBBZGQgZmluZGVyIHBhdHRlcm5zIGJpdHMgdG8gbWF0cml4XG4gKlxuICogQHBhcmFtICB7Qml0TWF0cml4fSBtYXRyaXggIE1vZHVsZXMgbWF0cml4XG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgIHZlcnNpb24gUVIgQ29kZSB2ZXJzaW9uXG4gKi9cbmZ1bmN0aW9uIHNldHVwRmluZGVyUGF0dGVybiAobWF0cml4LCB2ZXJzaW9uKSB7XG4gIGNvbnN0IHNpemUgPSBtYXRyaXguc2l6ZVxuICBjb25zdCBwb3MgPSBGaW5kZXJQYXR0ZXJuLmdldFBvc2l0aW9ucyh2ZXJzaW9uKVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgcm93ID0gcG9zW2ldWzBdXG4gICAgY29uc3QgY29sID0gcG9zW2ldWzFdXG5cbiAgICBmb3IgKGxldCByID0gLTE7IHIgPD0gNzsgcisrKSB7XG4gICAgICBpZiAocm93ICsgciA8PSAtMSB8fCBzaXplIDw9IHJvdyArIHIpIGNvbnRpbnVlXG5cbiAgICAgIGZvciAobGV0IGMgPSAtMTsgYyA8PSA3OyBjKyspIHtcbiAgICAgICAgaWYgKGNvbCArIGMgPD0gLTEgfHwgc2l6ZSA8PSBjb2wgKyBjKSBjb250aW51ZVxuXG4gICAgICAgIGlmICgociA+PSAwICYmIHIgPD0gNiAmJiAoYyA9PT0gMCB8fCBjID09PSA2KSkgfHxcbiAgICAgICAgICAoYyA+PSAwICYmIGMgPD0gNiAmJiAociA9PT0gMCB8fCByID09PSA2KSkgfHxcbiAgICAgICAgICAociA+PSAyICYmIHIgPD0gNCAmJiBjID49IDIgJiYgYyA8PSA0KSkge1xuICAgICAgICAgIG1hdHJpeC5zZXQocm93ICsgciwgY29sICsgYywgdHJ1ZSwgdHJ1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXRyaXguc2V0KHJvdyArIHIsIGNvbCArIGMsIGZhbHNlLCB0cnVlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWRkIHRpbWluZyBwYXR0ZXJuIGJpdHMgdG8gbWF0cml4XG4gKlxuICogTm90ZTogdGhpcyBmdW5jdGlvbiBtdXN0IGJlIGNhbGxlZCBiZWZvcmUge0BsaW5rIHNldHVwQWxpZ25tZW50UGF0dGVybn1cbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCBNb2R1bGVzIG1hdHJpeFxuICovXG5mdW5jdGlvbiBzZXR1cFRpbWluZ1BhdHRlcm4gKG1hdHJpeCkge1xuICBjb25zdCBzaXplID0gbWF0cml4LnNpemVcblxuICBmb3IgKGxldCByID0gODsgciA8IHNpemUgLSA4OyByKyspIHtcbiAgICBjb25zdCB2YWx1ZSA9IHIgJSAyID09PSAwXG4gICAgbWF0cml4LnNldChyLCA2LCB2YWx1ZSwgdHJ1ZSlcbiAgICBtYXRyaXguc2V0KDYsIHIsIHZhbHVlLCB0cnVlKVxuICB9XG59XG5cbi8qKlxuICogQWRkIGFsaWdubWVudCBwYXR0ZXJucyBiaXRzIHRvIG1hdHJpeFxuICpcbiAqIE5vdGU6IHRoaXMgZnVuY3Rpb24gbXVzdCBiZSBjYWxsZWQgYWZ0ZXIge0BsaW5rIHNldHVwVGltaW5nUGF0dGVybn1cbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCAgTW9kdWxlcyBtYXRyaXhcbiAqIEBwYXJhbSAge051bWJlcn0gICAgdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqL1xuZnVuY3Rpb24gc2V0dXBBbGlnbm1lbnRQYXR0ZXJuIChtYXRyaXgsIHZlcnNpb24pIHtcbiAgY29uc3QgcG9zID0gQWxpZ25tZW50UGF0dGVybi5nZXRQb3NpdGlvbnModmVyc2lvbilcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBvcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHJvdyA9IHBvc1tpXVswXVxuICAgIGNvbnN0IGNvbCA9IHBvc1tpXVsxXVxuXG4gICAgZm9yIChsZXQgciA9IC0yOyByIDw9IDI7IHIrKykge1xuICAgICAgZm9yIChsZXQgYyA9IC0yOyBjIDw9IDI7IGMrKykge1xuICAgICAgICBpZiAociA9PT0gLTIgfHwgciA9PT0gMiB8fCBjID09PSAtMiB8fCBjID09PSAyIHx8XG4gICAgICAgICAgKHIgPT09IDAgJiYgYyA9PT0gMCkpIHtcbiAgICAgICAgICBtYXRyaXguc2V0KHJvdyArIHIsIGNvbCArIGMsIHRydWUsIHRydWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWF0cml4LnNldChyb3cgKyByLCBjb2wgKyBjLCBmYWxzZSwgdHJ1ZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFkZCB2ZXJzaW9uIGluZm8gYml0cyB0byBtYXRyaXhcbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9IG1hdHJpeCAgTW9kdWxlcyBtYXRyaXhcbiAqIEBwYXJhbSAge051bWJlcn0gICAgdmVyc2lvbiBRUiBDb2RlIHZlcnNpb25cbiAqL1xuZnVuY3Rpb24gc2V0dXBWZXJzaW9uSW5mbyAobWF0cml4LCB2ZXJzaW9uKSB7XG4gIGNvbnN0IHNpemUgPSBtYXRyaXguc2l6ZVxuICBjb25zdCBiaXRzID0gVmVyc2lvbi5nZXRFbmNvZGVkQml0cyh2ZXJzaW9uKVxuICBsZXQgcm93LCBjb2wsIG1vZFxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTg7IGkrKykge1xuICAgIHJvdyA9IE1hdGguZmxvb3IoaSAvIDMpXG4gICAgY29sID0gaSAlIDMgKyBzaXplIC0gOCAtIDNcbiAgICBtb2QgPSAoKGJpdHMgPj4gaSkgJiAxKSA9PT0gMVxuXG4gICAgbWF0cml4LnNldChyb3csIGNvbCwgbW9kLCB0cnVlKVxuICAgIG1hdHJpeC5zZXQoY29sLCByb3csIG1vZCwgdHJ1ZSlcbiAgfVxufVxuXG4vKipcbiAqIEFkZCBmb3JtYXQgaW5mbyBiaXRzIHRvIG1hdHJpeFxuICpcbiAqIEBwYXJhbSAge0JpdE1hdHJpeH0gbWF0cml4ICAgICAgICAgICAgICAgTW9kdWxlcyBtYXRyaXhcbiAqIEBwYXJhbSAge0Vycm9yQ29ycmVjdGlvbkxldmVsfSAgICBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICAgIG1hc2tQYXR0ZXJuICAgICAgICAgIE1hc2sgcGF0dGVybiByZWZlcmVuY2UgdmFsdWVcbiAqL1xuZnVuY3Rpb24gc2V0dXBGb3JtYXRJbmZvIChtYXRyaXgsIGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrUGF0dGVybikge1xuICBjb25zdCBzaXplID0gbWF0cml4LnNpemVcbiAgY29uc3QgYml0cyA9IEZvcm1hdEluZm8uZ2V0RW5jb2RlZEJpdHMoZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2tQYXR0ZXJuKVxuICBsZXQgaSwgbW9kXG5cbiAgZm9yIChpID0gMDsgaSA8IDE1OyBpKyspIHtcbiAgICBtb2QgPSAoKGJpdHMgPj4gaSkgJiAxKSA9PT0gMVxuXG4gICAgLy8gdmVydGljYWxcbiAgICBpZiAoaSA8IDYpIHtcbiAgICAgIG1hdHJpeC5zZXQoaSwgOCwgbW9kLCB0cnVlKVxuICAgIH0gZWxzZSBpZiAoaSA8IDgpIHtcbiAgICAgIG1hdHJpeC5zZXQoaSArIDEsIDgsIG1vZCwgdHJ1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgbWF0cml4LnNldChzaXplIC0gMTUgKyBpLCA4LCBtb2QsIHRydWUpXG4gICAgfVxuXG4gICAgLy8gaG9yaXpvbnRhbFxuICAgIGlmIChpIDwgOCkge1xuICAgICAgbWF0cml4LnNldCg4LCBzaXplIC0gaSAtIDEsIG1vZCwgdHJ1ZSlcbiAgICB9IGVsc2UgaWYgKGkgPCA5KSB7XG4gICAgICBtYXRyaXguc2V0KDgsIDE1IC0gaSAtIDEgKyAxLCBtb2QsIHRydWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIG1hdHJpeC5zZXQoOCwgMTUgLSBpIC0gMSwgbW9kLCB0cnVlKVxuICAgIH1cbiAgfVxuXG4gIC8vIGZpeGVkIG1vZHVsZVxuICBtYXRyaXguc2V0KHNpemUgLSA4LCA4LCAxLCB0cnVlKVxufVxuXG4vKipcbiAqIEFkZCBlbmNvZGVkIGRhdGEgYml0cyB0byBtYXRyaXhcbiAqXG4gKiBAcGFyYW0gIHtCaXRNYXRyaXh9ICBtYXRyaXggTW9kdWxlcyBtYXRyaXhcbiAqIEBwYXJhbSAge1VpbnQ4QXJyYXl9IGRhdGEgICBEYXRhIGNvZGV3b3Jkc1xuICovXG5mdW5jdGlvbiBzZXR1cERhdGEgKG1hdHJpeCwgZGF0YSkge1xuICBjb25zdCBzaXplID0gbWF0cml4LnNpemVcbiAgbGV0IGluYyA9IC0xXG4gIGxldCByb3cgPSBzaXplIC0gMVxuICBsZXQgYml0SW5kZXggPSA3XG4gIGxldCBieXRlSW5kZXggPSAwXG5cbiAgZm9yIChsZXQgY29sID0gc2l6ZSAtIDE7IGNvbCA+IDA7IGNvbCAtPSAyKSB7XG4gICAgaWYgKGNvbCA9PT0gNikgY29sLS1cblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBmb3IgKGxldCBjID0gMDsgYyA8IDI7IGMrKykge1xuICAgICAgICBpZiAoIW1hdHJpeC5pc1Jlc2VydmVkKHJvdywgY29sIC0gYykpIHtcbiAgICAgICAgICBsZXQgZGFyayA9IGZhbHNlXG5cbiAgICAgICAgICBpZiAoYnl0ZUluZGV4IDwgZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRhcmsgPSAoKChkYXRhW2J5dGVJbmRleF0gPj4+IGJpdEluZGV4KSAmIDEpID09PSAxKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG1hdHJpeC5zZXQocm93LCBjb2wgLSBjLCBkYXJrKVxuICAgICAgICAgIGJpdEluZGV4LS1cblxuICAgICAgICAgIGlmIChiaXRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIGJ5dGVJbmRleCsrXG4gICAgICAgICAgICBiaXRJbmRleCA9IDdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcm93ICs9IGluY1xuXG4gICAgICBpZiAocm93IDwgMCB8fCBzaXplIDw9IHJvdykge1xuICAgICAgICByb3cgLT0gaW5jXG4gICAgICAgIGluYyA9IC1pbmNcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGUgZW5jb2RlZCBjb2Rld29yZHMgZnJvbSBkYXRhIGlucHV0XG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSAgIHZlcnNpb24gICAgICAgICAgICAgIFFSIENvZGUgdmVyc2lvblxuICogQHBhcmFtICB7RXJyb3JDb3JyZWN0aW9uTGV2ZWx9ICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWwgRXJyb3IgY29ycmVjdGlvbiBsZXZlbFxuICogQHBhcmFtICB7Qnl0ZURhdGF9IGRhdGEgICAgICAgICAgICAgICAgIERhdGEgaW5wdXRcbiAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9ICAgICAgICAgICAgICAgICAgICBCdWZmZXIgY29udGFpbmluZyBlbmNvZGVkIGNvZGV3b3Jkc1xuICovXG5mdW5jdGlvbiBjcmVhdGVEYXRhICh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgc2VnbWVudHMpIHtcbiAgLy8gUHJlcGFyZSBkYXRhIGJ1ZmZlclxuICBjb25zdCBidWZmZXIgPSBuZXcgQml0QnVmZmVyKClcblxuICBzZWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgLy8gcHJlZml4IGRhdGEgd2l0aCBtb2RlIGluZGljYXRvciAoNCBiaXRzKVxuICAgIGJ1ZmZlci5wdXQoZGF0YS5tb2RlLmJpdCwgNClcblxuICAgIC8vIFByZWZpeCBkYXRhIHdpdGggY2hhcmFjdGVyIGNvdW50IGluZGljYXRvci5cbiAgICAvLyBUaGUgY2hhcmFjdGVyIGNvdW50IGluZGljYXRvciBpcyBhIHN0cmluZyBvZiBiaXRzIHRoYXQgcmVwcmVzZW50cyB0aGVcbiAgICAvLyBudW1iZXIgb2YgY2hhcmFjdGVycyB0aGF0IGFyZSBiZWluZyBlbmNvZGVkLlxuICAgIC8vIFRoZSBjaGFyYWN0ZXIgY291bnQgaW5kaWNhdG9yIG11c3QgYmUgcGxhY2VkIGFmdGVyIHRoZSBtb2RlIGluZGljYXRvclxuICAgIC8vIGFuZCBtdXN0IGJlIGEgY2VydGFpbiBudW1iZXIgb2YgYml0cyBsb25nLCBkZXBlbmRpbmcgb24gdGhlIFFSIHZlcnNpb25cbiAgICAvLyBhbmQgZGF0YSBtb2RlXG4gICAgLy8gQHNlZSB7QGxpbmsgTW9kZS5nZXRDaGFyQ291bnRJbmRpY2F0b3J9LlxuICAgIGJ1ZmZlci5wdXQoZGF0YS5nZXRMZW5ndGgoKSwgTW9kZS5nZXRDaGFyQ291bnRJbmRpY2F0b3IoZGF0YS5tb2RlLCB2ZXJzaW9uKSlcblxuICAgIC8vIGFkZCBiaW5hcnkgZGF0YSBzZXF1ZW5jZSB0byBidWZmZXJcbiAgICBkYXRhLndyaXRlKGJ1ZmZlcilcbiAgfSlcblxuICAvLyBDYWxjdWxhdGUgcmVxdWlyZWQgbnVtYmVyIG9mIGJpdHNcbiAgY29uc3QgdG90YWxDb2Rld29yZHMgPSBVdGlscy5nZXRTeW1ib2xUb3RhbENvZGV3b3Jkcyh2ZXJzaW9uKVxuICBjb25zdCBlY1RvdGFsQ29kZXdvcmRzID0gRUNDb2RlLmdldFRvdGFsQ29kZXdvcmRzQ291bnQodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXG4gIGNvbnN0IGRhdGFUb3RhbENvZGV3b3Jkc0JpdHMgPSAodG90YWxDb2Rld29yZHMgLSBlY1RvdGFsQ29kZXdvcmRzKSAqIDhcblxuICAvLyBBZGQgYSB0ZXJtaW5hdG9yLlxuICAvLyBJZiB0aGUgYml0IHN0cmluZyBpcyBzaG9ydGVyIHRoYW4gdGhlIHRvdGFsIG51bWJlciBvZiByZXF1aXJlZCBiaXRzLFxuICAvLyBhIHRlcm1pbmF0b3Igb2YgdXAgdG8gZm91ciAwcyBtdXN0IGJlIGFkZGVkIHRvIHRoZSByaWdodCBzaWRlIG9mIHRoZSBzdHJpbmcuXG4gIC8vIElmIHRoZSBiaXQgc3RyaW5nIGlzIG1vcmUgdGhhbiBmb3VyIGJpdHMgc2hvcnRlciB0aGFuIHRoZSByZXF1aXJlZCBudW1iZXIgb2YgYml0cyxcbiAgLy8gYWRkIGZvdXIgMHMgdG8gdGhlIGVuZC5cbiAgaWYgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSArIDQgPD0gZGF0YVRvdGFsQ29kZXdvcmRzQml0cykge1xuICAgIGJ1ZmZlci5wdXQoMCwgNClcbiAgfVxuXG4gIC8vIElmIHRoZSBiaXQgc3RyaW5nIGlzIGZld2VyIHRoYW4gZm91ciBiaXRzIHNob3J0ZXIsIGFkZCBvbmx5IHRoZSBudW1iZXIgb2YgMHMgdGhhdFxuICAvLyBhcmUgbmVlZGVkIHRvIHJlYWNoIHRoZSByZXF1aXJlZCBudW1iZXIgb2YgYml0cy5cblxuICAvLyBBZnRlciBhZGRpbmcgdGhlIHRlcm1pbmF0b3IsIGlmIHRoZSBudW1iZXIgb2YgYml0cyBpbiB0aGUgc3RyaW5nIGlzIG5vdCBhIG11bHRpcGxlIG9mIDgsXG4gIC8vIHBhZCB0aGUgc3RyaW5nIG9uIHRoZSByaWdodCB3aXRoIDBzIHRvIG1ha2UgdGhlIHN0cmluZydzIGxlbmd0aCBhIG11bHRpcGxlIG9mIDguXG4gIHdoaWxlIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgJSA4ICE9PSAwKSB7XG4gICAgYnVmZmVyLnB1dEJpdCgwKVxuICB9XG5cbiAgLy8gQWRkIHBhZCBieXRlcyBpZiB0aGUgc3RyaW5nIGlzIHN0aWxsIHNob3J0ZXIgdGhhbiB0aGUgdG90YWwgbnVtYmVyIG9mIHJlcXVpcmVkIGJpdHMuXG4gIC8vIEV4dGVuZCB0aGUgYnVmZmVyIHRvIGZpbGwgdGhlIGRhdGEgY2FwYWNpdHkgb2YgdGhlIHN5bWJvbCBjb3JyZXNwb25kaW5nIHRvXG4gIC8vIHRoZSBWZXJzaW9uIGFuZCBFcnJvciBDb3JyZWN0aW9uIExldmVsIGJ5IGFkZGluZyB0aGUgUGFkIENvZGV3b3JkcyAxMTEwMTEwMCAoMHhFQylcbiAgLy8gYW5kIDAwMDEwMDAxICgweDExKSBhbHRlcm5hdGVseS5cbiAgY29uc3QgcmVtYWluaW5nQnl0ZSA9IChkYXRhVG90YWxDb2Rld29yZHNCaXRzIC0gYnVmZmVyLmdldExlbmd0aEluQml0cygpKSAvIDhcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByZW1haW5pbmdCeXRlOyBpKyspIHtcbiAgICBidWZmZXIucHV0KGkgJSAyID8gMHgxMSA6IDB4RUMsIDgpXG4gIH1cblxuICByZXR1cm4gY3JlYXRlQ29kZXdvcmRzKGJ1ZmZlciwgdmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXG59XG5cbi8qKlxuICogRW5jb2RlIGlucHV0IGRhdGEgd2l0aCBSZWVkLVNvbG9tb24gYW5kIHJldHVybiBjb2Rld29yZHMgd2l0aFxuICogcmVsYXRpdmUgZXJyb3IgY29ycmVjdGlvbiBiaXRzXG4gKlxuICogQHBhcmFtICB7Qml0QnVmZmVyfSBiaXRCdWZmZXIgICAgICAgICAgICBEYXRhIHRvIGVuY29kZVxuICogQHBhcmFtICB7TnVtYmVyfSAgICB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cbiAqIEBwYXJhbSAge0Vycm9yQ29ycmVjdGlvbkxldmVsfSBlcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSAgICAgICAgICAgICAgICAgICAgIEJ1ZmZlciBjb250YWluaW5nIGVuY29kZWQgY29kZXdvcmRzXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUNvZGV3b3JkcyAoYml0QnVmZmVyLCB2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xuICAvLyBUb3RhbCBjb2Rld29yZHMgZm9yIHRoaXMgUVIgY29kZSB2ZXJzaW9uIChEYXRhICsgRXJyb3IgY29ycmVjdGlvbilcbiAgY29uc3QgdG90YWxDb2Rld29yZHMgPSBVdGlscy5nZXRTeW1ib2xUb3RhbENvZGV3b3Jkcyh2ZXJzaW9uKVxuXG4gIC8vIFRvdGFsIG51bWJlciBvZiBlcnJvciBjb3JyZWN0aW9uIGNvZGV3b3Jkc1xuICBjb25zdCBlY1RvdGFsQ29kZXdvcmRzID0gRUNDb2RlLmdldFRvdGFsQ29kZXdvcmRzQ291bnQodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpXG5cbiAgLy8gVG90YWwgbnVtYmVyIG9mIGRhdGEgY29kZXdvcmRzXG4gIGNvbnN0IGRhdGFUb3RhbENvZGV3b3JkcyA9IHRvdGFsQ29kZXdvcmRzIC0gZWNUb3RhbENvZGV3b3Jkc1xuXG4gIC8vIFRvdGFsIG51bWJlciBvZiBibG9ja3NcbiAgY29uc3QgZWNUb3RhbEJsb2NrcyA9IEVDQ29kZS5nZXRCbG9ja3NDb3VudCh2ZXJzaW9uLCBlcnJvckNvcnJlY3Rpb25MZXZlbClcblxuICAvLyBDYWxjdWxhdGUgaG93IG1hbnkgYmxvY2tzIGVhY2ggZ3JvdXAgc2hvdWxkIGNvbnRhaW5cbiAgY29uc3QgYmxvY2tzSW5Hcm91cDIgPSB0b3RhbENvZGV3b3JkcyAlIGVjVG90YWxCbG9ja3NcbiAgY29uc3QgYmxvY2tzSW5Hcm91cDEgPSBlY1RvdGFsQmxvY2tzIC0gYmxvY2tzSW5Hcm91cDJcblxuICBjb25zdCB0b3RhbENvZGV3b3Jkc0luR3JvdXAxID0gTWF0aC5mbG9vcih0b3RhbENvZGV3b3JkcyAvIGVjVG90YWxCbG9ja3MpXG5cbiAgY29uc3QgZGF0YUNvZGV3b3Jkc0luR3JvdXAxID0gTWF0aC5mbG9vcihkYXRhVG90YWxDb2Rld29yZHMgLyBlY1RvdGFsQmxvY2tzKVxuICBjb25zdCBkYXRhQ29kZXdvcmRzSW5Hcm91cDIgPSBkYXRhQ29kZXdvcmRzSW5Hcm91cDEgKyAxXG5cbiAgLy8gTnVtYmVyIG9mIEVDIGNvZGV3b3JkcyBpcyB0aGUgc2FtZSBmb3IgYm90aCBncm91cHNcbiAgY29uc3QgZWNDb3VudCA9IHRvdGFsQ29kZXdvcmRzSW5Hcm91cDEgLSBkYXRhQ29kZXdvcmRzSW5Hcm91cDFcblxuICAvLyBJbml0aWFsaXplIGEgUmVlZC1Tb2xvbW9uIGVuY29kZXIgd2l0aCBhIGdlbmVyYXRvciBwb2x5bm9taWFsIG9mIGRlZ3JlZSBlY0NvdW50XG4gIGNvbnN0IHJzID0gbmV3IFJlZWRTb2xvbW9uRW5jb2RlcihlY0NvdW50KVxuXG4gIGxldCBvZmZzZXQgPSAwXG4gIGNvbnN0IGRjRGF0YSA9IG5ldyBBcnJheShlY1RvdGFsQmxvY2tzKVxuICBjb25zdCBlY0RhdGEgPSBuZXcgQXJyYXkoZWNUb3RhbEJsb2NrcylcbiAgbGV0IG1heERhdGFTaXplID0gMFxuICBjb25zdCBidWZmZXIgPSBuZXcgVWludDhBcnJheShiaXRCdWZmZXIuYnVmZmVyKVxuXG4gIC8vIERpdmlkZSB0aGUgYnVmZmVyIGludG8gdGhlIHJlcXVpcmVkIG51bWJlciBvZiBibG9ja3NcbiAgZm9yIChsZXQgYiA9IDA7IGIgPCBlY1RvdGFsQmxvY2tzOyBiKyspIHtcbiAgICBjb25zdCBkYXRhU2l6ZSA9IGIgPCBibG9ja3NJbkdyb3VwMSA/IGRhdGFDb2Rld29yZHNJbkdyb3VwMSA6IGRhdGFDb2Rld29yZHNJbkdyb3VwMlxuXG4gICAgLy8gZXh0cmFjdCBhIGJsb2NrIG9mIGRhdGEgZnJvbSBidWZmZXJcbiAgICBkY0RhdGFbYl0gPSBidWZmZXIuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyBkYXRhU2l6ZSlcblxuICAgIC8vIENhbGN1bGF0ZSBFQyBjb2Rld29yZHMgZm9yIHRoaXMgZGF0YSBibG9ja1xuICAgIGVjRGF0YVtiXSA9IHJzLmVuY29kZShkY0RhdGFbYl0pXG5cbiAgICBvZmZzZXQgKz0gZGF0YVNpemVcbiAgICBtYXhEYXRhU2l6ZSA9IE1hdGgubWF4KG1heERhdGFTaXplLCBkYXRhU2l6ZSlcbiAgfVxuXG4gIC8vIENyZWF0ZSBmaW5hbCBkYXRhXG4gIC8vIEludGVybGVhdmUgdGhlIGRhdGEgYW5kIGVycm9yIGNvcnJlY3Rpb24gY29kZXdvcmRzIGZyb20gZWFjaCBibG9ja1xuICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkodG90YWxDb2Rld29yZHMpXG4gIGxldCBpbmRleCA9IDBcbiAgbGV0IGksIHJcblxuICAvLyBBZGQgZGF0YSBjb2Rld29yZHNcbiAgZm9yIChpID0gMDsgaSA8IG1heERhdGFTaXplOyBpKyspIHtcbiAgICBmb3IgKHIgPSAwOyByIDwgZWNUb3RhbEJsb2NrczsgcisrKSB7XG4gICAgICBpZiAoaSA8IGRjRGF0YVtyXS5sZW5ndGgpIHtcbiAgICAgICAgZGF0YVtpbmRleCsrXSA9IGRjRGF0YVtyXVtpXVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEFwcGVkIEVDIGNvZGV3b3Jkc1xuICBmb3IgKGkgPSAwOyBpIDwgZWNDb3VudDsgaSsrKSB7XG4gICAgZm9yIChyID0gMDsgciA8IGVjVG90YWxCbG9ja3M7IHIrKykge1xuICAgICAgZGF0YVtpbmRleCsrXSA9IGVjRGF0YVtyXVtpXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkYXRhXG59XG5cbi8qKlxuICogQnVpbGQgUVIgQ29kZSBzeW1ib2xcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGRhdGEgICAgICAgICAgICAgICAgIElucHV0IHN0cmluZ1xuICogQHBhcmFtICB7TnVtYmVyfSB2ZXJzaW9uICAgICAgICAgICAgICBRUiBDb2RlIHZlcnNpb25cbiAqIEBwYXJhbSAge0Vycm9yQ29ycmV0aW9uTGV2ZWx9IGVycm9yQ29ycmVjdGlvbkxldmVsIEVycm9yIGxldmVsXG4gKiBAcGFyYW0gIHtNYXNrUGF0dGVybn0gbWFza1BhdHRlcm4gICAgIE1hc2sgcGF0dGVyblxuICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgICAgICAgICAgICBPYmplY3QgY29udGFpbmluZyBzeW1ib2wgZGF0YVxuICovXG5mdW5jdGlvbiBjcmVhdGVTeW1ib2wgKGRhdGEsIHZlcnNpb24sIGVycm9yQ29ycmVjdGlvbkxldmVsLCBtYXNrUGF0dGVybikge1xuICBsZXQgc2VnbWVudHNcblxuICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgIHNlZ21lbnRzID0gU2VnbWVudHMuZnJvbUFycmF5KGRhdGEpXG4gIH0gZWxzZSBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgbGV0IGVzdGltYXRlZFZlcnNpb24gPSB2ZXJzaW9uXG5cbiAgICBpZiAoIWVzdGltYXRlZFZlcnNpb24pIHtcbiAgICAgIGNvbnN0IHJhd1NlZ21lbnRzID0gU2VnbWVudHMucmF3U3BsaXQoZGF0YSlcblxuICAgICAgLy8gRXN0aW1hdGUgYmVzdCB2ZXJzaW9uIHRoYXQgY2FuIGNvbnRhaW4gcmF3IHNwbGl0dGVkIHNlZ21lbnRzXG4gICAgICBlc3RpbWF0ZWRWZXJzaW9uID0gVmVyc2lvbi5nZXRCZXN0VmVyc2lvbkZvckRhdGEocmF3U2VnbWVudHMsIGVycm9yQ29ycmVjdGlvbkxldmVsKVxuICAgIH1cblxuICAgIC8vIEJ1aWxkIG9wdGltaXplZCBzZWdtZW50c1xuICAgIC8vIElmIGVzdGltYXRlZCB2ZXJzaW9uIGlzIHVuZGVmaW5lZCwgdHJ5IHdpdGggdGhlIGhpZ2hlc3QgdmVyc2lvblxuICAgIHNlZ21lbnRzID0gU2VnbWVudHMuZnJvbVN0cmluZyhkYXRhLCBlc3RpbWF0ZWRWZXJzaW9uIHx8IDQwKVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBkYXRhJylcbiAgfVxuXG4gIC8vIEdldCB0aGUgbWluIHZlcnNpb24gdGhhdCBjYW4gY29udGFpbiBkYXRhXG4gIGNvbnN0IGJlc3RWZXJzaW9uID0gVmVyc2lvbi5nZXRCZXN0VmVyc2lvbkZvckRhdGEoc2VnbWVudHMsIGVycm9yQ29ycmVjdGlvbkxldmVsKVxuXG4gIC8vIElmIG5vIHZlcnNpb24gaXMgZm91bmQsIGRhdGEgY2Fubm90IGJlIHN0b3JlZFxuICBpZiAoIWJlc3RWZXJzaW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgYW1vdW50IG9mIGRhdGEgaXMgdG9vIGJpZyB0byBiZSBzdG9yZWQgaW4gYSBRUiBDb2RlJylcbiAgfVxuXG4gIC8vIElmIG5vdCBzcGVjaWZpZWQsIHVzZSBtaW4gdmVyc2lvbiBhcyBkZWZhdWx0XG4gIGlmICghdmVyc2lvbikge1xuICAgIHZlcnNpb24gPSBiZXN0VmVyc2lvblxuXG4gIC8vIENoZWNrIGlmIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBjYW4gY29udGFpbiB0aGUgZGF0YVxuICB9IGVsc2UgaWYgKHZlcnNpb24gPCBiZXN0VmVyc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignXFxuJyArXG4gICAgICAnVGhlIGNob3NlbiBRUiBDb2RlIHZlcnNpb24gY2Fubm90IGNvbnRhaW4gdGhpcyBhbW91bnQgb2YgZGF0YS5cXG4nICtcbiAgICAgICdNaW5pbXVtIHZlcnNpb24gcmVxdWlyZWQgdG8gc3RvcmUgY3VycmVudCBkYXRhIGlzOiAnICsgYmVzdFZlcnNpb24gKyAnLlxcbidcbiAgICApXG4gIH1cblxuICBjb25zdCBkYXRhQml0cyA9IGNyZWF0ZURhdGEodmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIHNlZ21lbnRzKVxuXG4gIC8vIEFsbG9jYXRlIG1hdHJpeCBidWZmZXJcbiAgY29uc3QgbW9kdWxlQ291bnQgPSBVdGlscy5nZXRTeW1ib2xTaXplKHZlcnNpb24pXG4gIGNvbnN0IG1vZHVsZXMgPSBuZXcgQml0TWF0cml4KG1vZHVsZUNvdW50KVxuXG4gIC8vIEFkZCBmdW5jdGlvbiBtb2R1bGVzXG4gIHNldHVwRmluZGVyUGF0dGVybihtb2R1bGVzLCB2ZXJzaW9uKVxuICBzZXR1cFRpbWluZ1BhdHRlcm4obW9kdWxlcylcbiAgc2V0dXBBbGlnbm1lbnRQYXR0ZXJuKG1vZHVsZXMsIHZlcnNpb24pXG5cbiAgLy8gQWRkIHRlbXBvcmFyeSBkdW1teSBiaXRzIGZvciBmb3JtYXQgaW5mbyBqdXN0IHRvIHNldCB0aGVtIGFzIHJlc2VydmVkLlxuICAvLyBUaGlzIGlzIG5lZWRlZCB0byBwcmV2ZW50IHRoZXNlIGJpdHMgZnJvbSBiZWluZyBtYXNrZWQgYnkge0BsaW5rIE1hc2tQYXR0ZXJuLmFwcGx5TWFza31cbiAgLy8gc2luY2UgdGhlIG1hc2tpbmcgb3BlcmF0aW9uIG11c3QgYmUgcGVyZm9ybWVkIG9ubHkgb24gdGhlIGVuY29kaW5nIHJlZ2lvbi5cbiAgLy8gVGhlc2UgYmxvY2tzIHdpbGwgYmUgcmVwbGFjZWQgd2l0aCBjb3JyZWN0IHZhbHVlcyBsYXRlciBpbiBjb2RlLlxuICBzZXR1cEZvcm1hdEluZm8obW9kdWxlcywgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIDApXG5cbiAgaWYgKHZlcnNpb24gPj0gNykge1xuICAgIHNldHVwVmVyc2lvbkluZm8obW9kdWxlcywgdmVyc2lvbilcbiAgfVxuXG4gIC8vIEFkZCBkYXRhIGNvZGV3b3Jkc1xuICBzZXR1cERhdGEobW9kdWxlcywgZGF0YUJpdHMpXG5cbiAgaWYgKGlzTmFOKG1hc2tQYXR0ZXJuKSkge1xuICAgIC8vIEZpbmQgYmVzdCBtYXNrIHBhdHRlcm5cbiAgICBtYXNrUGF0dGVybiA9IE1hc2tQYXR0ZXJuLmdldEJlc3RNYXNrKG1vZHVsZXMsXG4gICAgICBzZXR1cEZvcm1hdEluZm8uYmluZChudWxsLCBtb2R1bGVzLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkpXG4gIH1cblxuICAvLyBBcHBseSBtYXNrIHBhdHRlcm5cbiAgTWFza1BhdHRlcm4uYXBwbHlNYXNrKG1hc2tQYXR0ZXJuLCBtb2R1bGVzKVxuXG4gIC8vIFJlcGxhY2UgZm9ybWF0IGluZm8gYml0cyB3aXRoIGNvcnJlY3QgdmFsdWVzXG4gIHNldHVwRm9ybWF0SW5mbyhtb2R1bGVzLCBlcnJvckNvcnJlY3Rpb25MZXZlbCwgbWFza1BhdHRlcm4pXG5cbiAgcmV0dXJuIHtcbiAgICBtb2R1bGVzOiBtb2R1bGVzLFxuICAgIHZlcnNpb246IHZlcnNpb24sXG4gICAgZXJyb3JDb3JyZWN0aW9uTGV2ZWw6IGVycm9yQ29ycmVjdGlvbkxldmVsLFxuICAgIG1hc2tQYXR0ZXJuOiBtYXNrUGF0dGVybixcbiAgICBzZWdtZW50czogc2VnbWVudHNcbiAgfVxufVxuXG4vKipcbiAqIFFSIENvZGVcbiAqXG4gKiBAcGFyYW0ge1N0cmluZyB8IEFycmF5fSBkYXRhICAgICAgICAgICAgICAgICBJbnB1dCBkYXRhXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAgICAgICAgICAgICAgICAgICAgICBPcHRpb25hbCBjb25maWd1cmF0aW9uc1xuICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMudmVyc2lvbiAgICAgICAgICAgICAgUVIgQ29kZSB2ZXJzaW9uXG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5lcnJvckNvcnJlY3Rpb25MZXZlbCBFcnJvciBjb3JyZWN0aW9uIGxldmVsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25zLnRvU0pJU0Z1bmMgICAgICAgICBIZWxwZXIgZnVuYyB0byBjb252ZXJ0IHV0ZjggdG8gc2ppc1xuICovXG5leHBvcnRzLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZSAoZGF0YSwgb3B0aW9ucykge1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnIHx8IGRhdGEgPT09ICcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBpbnB1dCB0ZXh0JylcbiAgfVxuXG4gIGxldCBlcnJvckNvcnJlY3Rpb25MZXZlbCA9IEVDTGV2ZWwuTVxuICBsZXQgdmVyc2lvblxuICBsZXQgbWFza1xuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBVc2UgaGlnaGVyIGVycm9yIGNvcnJlY3Rpb24gbGV2ZWwgYXMgZGVmYXVsdFxuICAgIGVycm9yQ29ycmVjdGlvbkxldmVsID0gRUNMZXZlbC5mcm9tKG9wdGlvbnMuZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIEVDTGV2ZWwuTSlcbiAgICB2ZXJzaW9uID0gVmVyc2lvbi5mcm9tKG9wdGlvbnMudmVyc2lvbilcbiAgICBtYXNrID0gTWFza1BhdHRlcm4uZnJvbShvcHRpb25zLm1hc2tQYXR0ZXJuKVxuXG4gICAgaWYgKG9wdGlvbnMudG9TSklTRnVuYykge1xuICAgICAgVXRpbHMuc2V0VG9TSklTRnVuY3Rpb24ob3B0aW9ucy50b1NKSVNGdW5jKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjcmVhdGVTeW1ib2woZGF0YSwgdmVyc2lvbiwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIG1hc2spXG59XG4iLCAiZnVuY3Rpb24gaGV4MnJnYmEgKGhleCkge1xuICBpZiAodHlwZW9mIGhleCA9PT0gJ251bWJlcicpIHtcbiAgICBoZXggPSBoZXgudG9TdHJpbmcoKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBoZXggIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb2xvciBzaG91bGQgYmUgZGVmaW5lZCBhcyBoZXggc3RyaW5nJylcbiAgfVxuXG4gIGxldCBoZXhDb2RlID0gaGV4LnNsaWNlKCkucmVwbGFjZSgnIycsICcnKS5zcGxpdCgnJylcbiAgaWYgKGhleENvZGUubGVuZ3RoIDwgMyB8fCBoZXhDb2RlLmxlbmd0aCA9PT0gNSB8fCBoZXhDb2RlLmxlbmd0aCA+IDgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaGV4IGNvbG9yOiAnICsgaGV4KVxuICB9XG5cbiAgLy8gQ29udmVydCBmcm9tIHNob3J0IHRvIGxvbmcgZm9ybSAoZmZmIC0+IGZmZmZmZilcbiAgaWYgKGhleENvZGUubGVuZ3RoID09PSAzIHx8IGhleENvZGUubGVuZ3RoID09PSA0KSB7XG4gICAgaGV4Q29kZSA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIGhleENvZGUubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgICByZXR1cm4gW2MsIGNdXG4gICAgfSkpXG4gIH1cblxuICAvLyBBZGQgZGVmYXVsdCBhbHBoYSB2YWx1ZVxuICBpZiAoaGV4Q29kZS5sZW5ndGggPT09IDYpIGhleENvZGUucHVzaCgnRicsICdGJylcblxuICBjb25zdCBoZXhWYWx1ZSA9IHBhcnNlSW50KGhleENvZGUuam9pbignJyksIDE2KVxuXG4gIHJldHVybiB7XG4gICAgcjogKGhleFZhbHVlID4+IDI0KSAmIDI1NSxcbiAgICBnOiAoaGV4VmFsdWUgPj4gMTYpICYgMjU1LFxuICAgIGI6IChoZXhWYWx1ZSA+PiA4KSAmIDI1NSxcbiAgICBhOiBoZXhWYWx1ZSAmIDI1NSxcbiAgICBoZXg6ICcjJyArIGhleENvZGUuc2xpY2UoMCwgNikuam9pbignJylcbiAgfVxufVxuXG5leHBvcnRzLmdldE9wdGlvbnMgPSBmdW5jdGlvbiBnZXRPcHRpb25zIChvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9XG4gIGlmICghb3B0aW9ucy5jb2xvcikgb3B0aW9ucy5jb2xvciA9IHt9XG5cbiAgY29uc3QgbWFyZ2luID0gdHlwZW9mIG9wdGlvbnMubWFyZ2luID09PSAndW5kZWZpbmVkJyB8fFxuICAgIG9wdGlvbnMubWFyZ2luID09PSBudWxsIHx8XG4gICAgb3B0aW9ucy5tYXJnaW4gPCAwXG4gICAgPyA0XG4gICAgOiBvcHRpb25zLm1hcmdpblxuXG4gIGNvbnN0IHdpZHRoID0gb3B0aW9ucy53aWR0aCAmJiBvcHRpb25zLndpZHRoID49IDIxID8gb3B0aW9ucy53aWR0aCA6IHVuZGVmaW5lZFxuICBjb25zdCBzY2FsZSA9IG9wdGlvbnMuc2NhbGUgfHwgNFxuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IHdpZHRoLFxuICAgIHNjYWxlOiB3aWR0aCA/IDQgOiBzY2FsZSxcbiAgICBtYXJnaW46IG1hcmdpbixcbiAgICBjb2xvcjoge1xuICAgICAgZGFyazogaGV4MnJnYmEob3B0aW9ucy5jb2xvci5kYXJrIHx8ICcjMDAwMDAwZmYnKSxcbiAgICAgIGxpZ2h0OiBoZXgycmdiYShvcHRpb25zLmNvbG9yLmxpZ2h0IHx8ICcjZmZmZmZmZmYnKVxuICAgIH0sXG4gICAgdHlwZTogb3B0aW9ucy50eXBlLFxuICAgIHJlbmRlcmVyT3B0czogb3B0aW9ucy5yZW5kZXJlck9wdHMgfHwge31cbiAgfVxufVxuXG5leHBvcnRzLmdldFNjYWxlID0gZnVuY3Rpb24gZ2V0U2NhbGUgKHFyU2l6ZSwgb3B0cykge1xuICByZXR1cm4gb3B0cy53aWR0aCAmJiBvcHRzLndpZHRoID49IHFyU2l6ZSArIG9wdHMubWFyZ2luICogMlxuICAgID8gb3B0cy53aWR0aCAvIChxclNpemUgKyBvcHRzLm1hcmdpbiAqIDIpXG4gICAgOiBvcHRzLnNjYWxlXG59XG5cbmV4cG9ydHMuZ2V0SW1hZ2VXaWR0aCA9IGZ1bmN0aW9uIGdldEltYWdlV2lkdGggKHFyU2l6ZSwgb3B0cykge1xuICBjb25zdCBzY2FsZSA9IGV4cG9ydHMuZ2V0U2NhbGUocXJTaXplLCBvcHRzKVxuICByZXR1cm4gTWF0aC5mbG9vcigocXJTaXplICsgb3B0cy5tYXJnaW4gKiAyKSAqIHNjYWxlKVxufVxuXG5leHBvcnRzLnFyVG9JbWFnZURhdGEgPSBmdW5jdGlvbiBxclRvSW1hZ2VEYXRhIChpbWdEYXRhLCBxciwgb3B0cykge1xuICBjb25zdCBzaXplID0gcXIubW9kdWxlcy5zaXplXG4gIGNvbnN0IGRhdGEgPSBxci5tb2R1bGVzLmRhdGFcbiAgY29uc3Qgc2NhbGUgPSBleHBvcnRzLmdldFNjYWxlKHNpemUsIG9wdHMpXG4gIGNvbnN0IHN5bWJvbFNpemUgPSBNYXRoLmZsb29yKChzaXplICsgb3B0cy5tYXJnaW4gKiAyKSAqIHNjYWxlKVxuICBjb25zdCBzY2FsZWRNYXJnaW4gPSBvcHRzLm1hcmdpbiAqIHNjYWxlXG4gIGNvbnN0IHBhbGV0dGUgPSBbb3B0cy5jb2xvci5saWdodCwgb3B0cy5jb2xvci5kYXJrXVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3ltYm9sU2l6ZTsgaSsrKSB7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBzeW1ib2xTaXplOyBqKyspIHtcbiAgICAgIGxldCBwb3NEc3QgPSAoaSAqIHN5bWJvbFNpemUgKyBqKSAqIDRcbiAgICAgIGxldCBweENvbG9yID0gb3B0cy5jb2xvci5saWdodFxuXG4gICAgICBpZiAoaSA+PSBzY2FsZWRNYXJnaW4gJiYgaiA+PSBzY2FsZWRNYXJnaW4gJiZcbiAgICAgICAgaSA8IHN5bWJvbFNpemUgLSBzY2FsZWRNYXJnaW4gJiYgaiA8IHN5bWJvbFNpemUgLSBzY2FsZWRNYXJnaW4pIHtcbiAgICAgICAgY29uc3QgaVNyYyA9IE1hdGguZmxvb3IoKGkgLSBzY2FsZWRNYXJnaW4pIC8gc2NhbGUpXG4gICAgICAgIGNvbnN0IGpTcmMgPSBNYXRoLmZsb29yKChqIC0gc2NhbGVkTWFyZ2luKSAvIHNjYWxlKVxuICAgICAgICBweENvbG9yID0gcGFsZXR0ZVtkYXRhW2lTcmMgKiBzaXplICsgalNyY10gPyAxIDogMF1cbiAgICAgIH1cblxuICAgICAgaW1nRGF0YVtwb3NEc3QrK10gPSBweENvbG9yLnJcbiAgICAgIGltZ0RhdGFbcG9zRHN0KytdID0gcHhDb2xvci5nXG4gICAgICBpbWdEYXRhW3Bvc0RzdCsrXSA9IHB4Q29sb3IuYlxuICAgICAgaW1nRGF0YVtwb3NEc3RdID0gcHhDb2xvci5hXG4gICAgfVxuICB9XG59XG4iLCAiY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcblxuZnVuY3Rpb24gY2xlYXJDYW52YXMgKGN0eCwgY2FudmFzLCBzaXplKSB7XG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KVxuXG4gIGlmICghY2FudmFzLnN0eWxlKSBjYW52YXMuc3R5bGUgPSB7fVxuICBjYW52YXMuaGVpZ2h0ID0gc2l6ZVxuICBjYW52YXMud2lkdGggPSBzaXplXG4gIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBzaXplICsgJ3B4J1xuICBjYW52YXMuc3R5bGUud2lkdGggPSBzaXplICsgJ3B4J1xufVxuXG5mdW5jdGlvbiBnZXRDYW52YXNFbGVtZW50ICgpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignWW91IG5lZWQgdG8gc3BlY2lmeSBhIGNhbnZhcyBlbGVtZW50JylcbiAgfVxufVxuXG5leHBvcnRzLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlciAocXJEYXRhLCBjYW52YXMsIG9wdGlvbnMpIHtcbiAgbGV0IG9wdHMgPSBvcHRpb25zXG4gIGxldCBjYW52YXNFbCA9IGNhbnZhc1xuXG4gIGlmICh0eXBlb2Ygb3B0cyA9PT0gJ3VuZGVmaW5lZCcgJiYgKCFjYW52YXMgfHwgIWNhbnZhcy5nZXRDb250ZXh0KSkge1xuICAgIG9wdHMgPSBjYW52YXNcbiAgICBjYW52YXMgPSB1bmRlZmluZWRcbiAgfVxuXG4gIGlmICghY2FudmFzKSB7XG4gICAgY2FudmFzRWwgPSBnZXRDYW52YXNFbGVtZW50KClcbiAgfVxuXG4gIG9wdHMgPSBVdGlscy5nZXRPcHRpb25zKG9wdHMpXG4gIGNvbnN0IHNpemUgPSBVdGlscy5nZXRJbWFnZVdpZHRoKHFyRGF0YS5tb2R1bGVzLnNpemUsIG9wdHMpXG5cbiAgY29uc3QgY3R4ID0gY2FudmFzRWwuZ2V0Q29udGV4dCgnMmQnKVxuICBjb25zdCBpbWFnZSA9IGN0eC5jcmVhdGVJbWFnZURhdGEoc2l6ZSwgc2l6ZSlcbiAgVXRpbHMucXJUb0ltYWdlRGF0YShpbWFnZS5kYXRhLCBxckRhdGEsIG9wdHMpXG5cbiAgY2xlYXJDYW52YXMoY3R4LCBjYW52YXNFbCwgc2l6ZSlcbiAgY3R4LnB1dEltYWdlRGF0YShpbWFnZSwgMCwgMClcblxuICByZXR1cm4gY2FudmFzRWxcbn1cblxuZXhwb3J0cy5yZW5kZXJUb0RhdGFVUkwgPSBmdW5jdGlvbiByZW5kZXJUb0RhdGFVUkwgKHFyRGF0YSwgY2FudmFzLCBvcHRpb25zKSB7XG4gIGxldCBvcHRzID0gb3B0aW9uc1xuXG4gIGlmICh0eXBlb2Ygb3B0cyA9PT0gJ3VuZGVmaW5lZCcgJiYgKCFjYW52YXMgfHwgIWNhbnZhcy5nZXRDb250ZXh0KSkge1xuICAgIG9wdHMgPSBjYW52YXNcbiAgICBjYW52YXMgPSB1bmRlZmluZWRcbiAgfVxuXG4gIGlmICghb3B0cykgb3B0cyA9IHt9XG5cbiAgY29uc3QgY2FudmFzRWwgPSBleHBvcnRzLnJlbmRlcihxckRhdGEsIGNhbnZhcywgb3B0cylcblxuICBjb25zdCB0eXBlID0gb3B0cy50eXBlIHx8ICdpbWFnZS9wbmcnXG4gIGNvbnN0IHJlbmRlcmVyT3B0cyA9IG9wdHMucmVuZGVyZXJPcHRzIHx8IHt9XG5cbiAgcmV0dXJuIGNhbnZhc0VsLnRvRGF0YVVSTCh0eXBlLCByZW5kZXJlck9wdHMucXVhbGl0eSlcbn1cbiIsICJjb25zdCBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuXG5mdW5jdGlvbiBnZXRDb2xvckF0dHJpYiAoY29sb3IsIGF0dHJpYikge1xuICBjb25zdCBhbHBoYSA9IGNvbG9yLmEgLyAyNTVcbiAgY29uc3Qgc3RyID0gYXR0cmliICsgJz1cIicgKyBjb2xvci5oZXggKyAnXCInXG5cbiAgcmV0dXJuIGFscGhhIDwgMVxuICAgID8gc3RyICsgJyAnICsgYXR0cmliICsgJy1vcGFjaXR5PVwiJyArIGFscGhhLnRvRml4ZWQoMikuc2xpY2UoMSkgKyAnXCInXG4gICAgOiBzdHJcbn1cblxuZnVuY3Rpb24gc3ZnQ21kIChjbWQsIHgsIHkpIHtcbiAgbGV0IHN0ciA9IGNtZCArIHhcbiAgaWYgKHR5cGVvZiB5ICE9PSAndW5kZWZpbmVkJykgc3RyICs9ICcgJyArIHlcblxuICByZXR1cm4gc3RyXG59XG5cbmZ1bmN0aW9uIHFyVG9QYXRoIChkYXRhLCBzaXplLCBtYXJnaW4pIHtcbiAgbGV0IHBhdGggPSAnJ1xuICBsZXQgbW92ZUJ5ID0gMFxuICBsZXQgbmV3Um93ID0gZmFsc2VcbiAgbGV0IGxpbmVMZW5ndGggPSAwXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgY29sID0gTWF0aC5mbG9vcihpICUgc2l6ZSlcbiAgICBjb25zdCByb3cgPSBNYXRoLmZsb29yKGkgLyBzaXplKVxuXG4gICAgaWYgKCFjb2wgJiYgIW5ld1JvdykgbmV3Um93ID0gdHJ1ZVxuXG4gICAgaWYgKGRhdGFbaV0pIHtcbiAgICAgIGxpbmVMZW5ndGgrK1xuXG4gICAgICBpZiAoIShpID4gMCAmJiBjb2wgPiAwICYmIGRhdGFbaSAtIDFdKSkge1xuICAgICAgICBwYXRoICs9IG5ld1Jvd1xuICAgICAgICAgID8gc3ZnQ21kKCdNJywgY29sICsgbWFyZ2luLCAwLjUgKyByb3cgKyBtYXJnaW4pXG4gICAgICAgICAgOiBzdmdDbWQoJ20nLCBtb3ZlQnksIDApXG5cbiAgICAgICAgbW92ZUJ5ID0gMFxuICAgICAgICBuZXdSb3cgPSBmYWxzZVxuICAgICAgfVxuXG4gICAgICBpZiAoIShjb2wgKyAxIDwgc2l6ZSAmJiBkYXRhW2kgKyAxXSkpIHtcbiAgICAgICAgcGF0aCArPSBzdmdDbWQoJ2gnLCBsaW5lTGVuZ3RoKVxuICAgICAgICBsaW5lTGVuZ3RoID0gMFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBtb3ZlQnkrK1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXRoXG59XG5cbmV4cG9ydHMucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyIChxckRhdGEsIG9wdGlvbnMsIGNiKSB7XG4gIGNvbnN0IG9wdHMgPSBVdGlscy5nZXRPcHRpb25zKG9wdGlvbnMpXG4gIGNvbnN0IHNpemUgPSBxckRhdGEubW9kdWxlcy5zaXplXG4gIGNvbnN0IGRhdGEgPSBxckRhdGEubW9kdWxlcy5kYXRhXG4gIGNvbnN0IHFyY29kZXNpemUgPSBzaXplICsgb3B0cy5tYXJnaW4gKiAyXG5cbiAgY29uc3QgYmcgPSAhb3B0cy5jb2xvci5saWdodC5hXG4gICAgPyAnJ1xuICAgIDogJzxwYXRoICcgKyBnZXRDb2xvckF0dHJpYihvcHRzLmNvbG9yLmxpZ2h0LCAnZmlsbCcpICtcbiAgICAgICcgZD1cIk0wIDBoJyArIHFyY29kZXNpemUgKyAndicgKyBxcmNvZGVzaXplICsgJ0gwelwiLz4nXG5cbiAgY29uc3QgcGF0aCA9XG4gICAgJzxwYXRoICcgKyBnZXRDb2xvckF0dHJpYihvcHRzLmNvbG9yLmRhcmssICdzdHJva2UnKSArXG4gICAgJyBkPVwiJyArIHFyVG9QYXRoKGRhdGEsIHNpemUsIG9wdHMubWFyZ2luKSArICdcIi8+J1xuXG4gIGNvbnN0IHZpZXdCb3ggPSAndmlld0JveD1cIicgKyAnMCAwICcgKyBxcmNvZGVzaXplICsgJyAnICsgcXJjb2Rlc2l6ZSArICdcIidcblxuICBjb25zdCB3aWR0aCA9ICFvcHRzLndpZHRoID8gJycgOiAnd2lkdGg9XCInICsgb3B0cy53aWR0aCArICdcIiBoZWlnaHQ9XCInICsgb3B0cy53aWR0aCArICdcIiAnXG5cbiAgY29uc3Qgc3ZnVGFnID0gJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiICcgKyB3aWR0aCArIHZpZXdCb3ggKyAnIHNoYXBlLXJlbmRlcmluZz1cImNyaXNwRWRnZXNcIj4nICsgYmcgKyBwYXRoICsgJzwvc3ZnPlxcbidcblxuICBpZiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2IobnVsbCwgc3ZnVGFnKVxuICB9XG5cbiAgcmV0dXJuIHN2Z1RhZ1xufVxuIiwgIlxuY29uc3QgY2FuUHJvbWlzZSA9IHJlcXVpcmUoJy4vY2FuLXByb21pc2UnKVxuXG5jb25zdCBRUkNvZGUgPSByZXF1aXJlKCcuL2NvcmUvcXJjb2RlJylcbmNvbnN0IENhbnZhc1JlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlci9jYW52YXMnKVxuY29uc3QgU3ZnUmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcmVyL3N2Zy10YWcuanMnKVxuXG5mdW5jdGlvbiByZW5kZXJDYW52YXMgKHJlbmRlckZ1bmMsIGNhbnZhcywgdGV4dCwgb3B0cywgY2IpIHtcbiAgY29uc3QgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICBjb25zdCBhcmdzTnVtID0gYXJncy5sZW5ndGhcbiAgY29uc3QgaXNMYXN0QXJnQ2IgPSB0eXBlb2YgYXJnc1thcmdzTnVtIC0gMV0gPT09ICdmdW5jdGlvbidcblxuICBpZiAoIWlzTGFzdEFyZ0NiICYmICFjYW5Qcm9taXNlKCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbGxiYWNrIHJlcXVpcmVkIGFzIGxhc3QgYXJndW1lbnQnKVxuICB9XG5cbiAgaWYgKGlzTGFzdEFyZ0NiKSB7XG4gICAgaWYgKGFyZ3NOdW0gPCAyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RvbyBmZXcgYXJndW1lbnRzIHByb3ZpZGVkJylcbiAgICB9XG5cbiAgICBpZiAoYXJnc051bSA9PT0gMikge1xuICAgICAgY2IgPSB0ZXh0XG4gICAgICB0ZXh0ID0gY2FudmFzXG4gICAgICBjYW52YXMgPSBvcHRzID0gdW5kZWZpbmVkXG4gICAgfSBlbHNlIGlmIChhcmdzTnVtID09PSAzKSB7XG4gICAgICBpZiAoY2FudmFzLmdldENvbnRleHQgJiYgdHlwZW9mIGNiID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjYiA9IG9wdHNcbiAgICAgICAgb3B0cyA9IHVuZGVmaW5lZFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2IgPSBvcHRzXG4gICAgICAgIG9wdHMgPSB0ZXh0XG4gICAgICAgIHRleHQgPSBjYW52YXNcbiAgICAgICAgY2FudmFzID0gdW5kZWZpbmVkXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChhcmdzTnVtIDwgMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUb28gZmV3IGFyZ3VtZW50cyBwcm92aWRlZCcpXG4gICAgfVxuXG4gICAgaWYgKGFyZ3NOdW0gPT09IDEpIHtcbiAgICAgIHRleHQgPSBjYW52YXNcbiAgICAgIGNhbnZhcyA9IG9wdHMgPSB1bmRlZmluZWRcbiAgICB9IGVsc2UgaWYgKGFyZ3NOdW0gPT09IDIgJiYgIWNhbnZhcy5nZXRDb250ZXh0KSB7XG4gICAgICBvcHRzID0gdGV4dFxuICAgICAgdGV4dCA9IGNhbnZhc1xuICAgICAgY2FudmFzID0gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBRUkNvZGUuY3JlYXRlKHRleHQsIG9wdHMpXG4gICAgICAgIHJlc29sdmUocmVuZGVyRnVuYyhkYXRhLCBjYW52YXMsIG9wdHMpKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZWplY3QoZSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBkYXRhID0gUVJDb2RlLmNyZWF0ZSh0ZXh0LCBvcHRzKVxuICAgIGNiKG51bGwsIHJlbmRlckZ1bmMoZGF0YSwgY2FudmFzLCBvcHRzKSlcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNiKGUpXG4gIH1cbn1cblxuZXhwb3J0cy5jcmVhdGUgPSBRUkNvZGUuY3JlYXRlXG5leHBvcnRzLnRvQ2FudmFzID0gcmVuZGVyQ2FudmFzLmJpbmQobnVsbCwgQ2FudmFzUmVuZGVyZXIucmVuZGVyKVxuZXhwb3J0cy50b0RhdGFVUkwgPSByZW5kZXJDYW52YXMuYmluZChudWxsLCBDYW52YXNSZW5kZXJlci5yZW5kZXJUb0RhdGFVUkwpXG5cbi8vIG9ubHkgc3ZnIGZvciBub3cuXG5leHBvcnRzLnRvU3RyaW5nID0gcmVuZGVyQ2FudmFzLmJpbmQobnVsbCwgZnVuY3Rpb24gKGRhdGEsIF8sIG9wdHMpIHtcbiAgcmV0dXJuIFN2Z1JlbmRlcmVyLnJlbmRlcihkYXRhLCBvcHRzKVxufSlcbiIsICIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgeyBlbmNyeXB0LCBkZWNyeXB0LCBoYXNoUGFzc3dvcmQsIHZlcmlmeVBhc3N3b3JkIH0gZnJvbSAnLi9jcnlwdG8nO1xuXG5jb25zdCBEQl9WRVJTSU9OID0gNTtcbmNvbnN0IHN0b3JhZ2UgPSBhcGkuc3RvcmFnZS5sb2NhbDtcbmV4cG9ydCBjb25zdCBSRUNPTU1FTkRFRF9SRUxBWVMgPSBbXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkuZGFtdXMuaW8nKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9yZWxheS5wcmltYWwubmV0JyksXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkuc25vcnQuc29jaWFsJyksXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkuZ2V0YWxieS5jb20vdjEnKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9ub3MubG9sJyksXG4gICAgbmV3IFVSTCgnd3NzOi8vYnJiLmlvJyksXG4gICAgbmV3IFVSTCgnd3NzOi8vbm9zdHIub3JhbmdlcGlsbC5kZXYnKSxcbl07XG4vLyBwcmV0dGllci1pZ25vcmVcbmV4cG9ydCBjb25zdCBLSU5EUyA9IFtcbiAgICBbMCwgJ01ldGFkYXRhJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzAxLm1kJ10sXG4gICAgWzEsICdUZXh0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzAxLm1kJ10sXG4gICAgWzIsICdSZWNvbW1lbmQgUmVsYXknLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDEubWQnXSxcbiAgICBbMywgJ0NvbnRhY3RzJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzAyLm1kJ10sXG4gICAgWzQsICdFbmNyeXB0ZWQgRGlyZWN0IE1lc3NhZ2VzJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzA0Lm1kJ10sXG4gICAgWzUsICdFdmVudCBEZWxldGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wOS5tZCddLFxuICAgIFs2LCAnUmVwb3N0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzE4Lm1kJ10sXG4gICAgWzcsICdSZWFjdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yNS5tZCddLFxuICAgIFs4LCAnQmFkZ2UgQXdhcmQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTgubWQnXSxcbiAgICBbMTYsICdHZW5lcmljIFJlcG9zdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8xOC5tZCddLFxuICAgIFs0MCwgJ0NoYW5uZWwgQ3JlYXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjgubWQnXSxcbiAgICBbNDEsICdDaGFubmVsIE1ldGFkYXRhJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzQyLCAnQ2hhbm5lbCBNZXNzYWdlJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzQzLCAnQ2hhbm5lbCBIaWRlIE1lc3NhZ2UnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjgubWQnXSxcbiAgICBbNDQsICdDaGFubmVsIE11dGUgVXNlcicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFsxMDYzLCAnRmlsZSBNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci85NC5tZCddLFxuICAgIFsxMzExLCAnTGl2ZSBDaGF0IE1lc3NhZ2UnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTMubWQnXSxcbiAgICBbMTk4NCwgJ1JlcG9ydGluZycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Ni5tZCddLFxuICAgIFsxOTg1LCAnTGFiZWwnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMzIubWQnXSxcbiAgICBbNDU1MCwgJ0NvbW11bml0eSBQb3N0IEFwcHJvdmFsJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzcyLm1kJ10sXG4gICAgWzcwMDAsICdKb2IgRmVlZGJhY2snLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvOTAubWQnXSxcbiAgICBbOTA0MSwgJ1phcCBHb2FsJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzc1Lm1kJ10sXG4gICAgWzk3MzQsICdaYXAgUmVxdWVzdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Ny5tZCddLFxuICAgIFs5NzM1LCAnWmFwJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU3Lm1kJ10sXG4gICAgWzEwMDAwLCAnTXV0ZSBMaXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUxLm1kJ10sXG4gICAgWzEwMDAxLCAnUGluIExpc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTEubWQnXSxcbiAgICBbMTAwMDIsICdSZWxheSBMaXN0IE1ldGFkYXRhJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzY1Lm1kJ10sXG4gICAgWzEzMTk0LCAnV2FsbGV0IEluZm8nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDcubWQnXSxcbiAgICBbMjIyNDIsICdDbGllbnQgQXV0aGVudGljYXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDIubWQnXSxcbiAgICBbMjMxOTQsICdXYWxsZXQgUmVxdWVzdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci80Ny5tZCddLFxuICAgIFsyMzE5NSwgJ1dhbGxldCBSZXNwb25zZScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci80Ny5tZCddLFxuICAgIFsyNDEzMywgJ05vc3RyIENvbm5lY3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDYubWQnXSxcbiAgICBbMjcyMzUsICdIVFRQIEF1dGgnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvOTgubWQnXSxcbiAgICBbMzAwMDAsICdDYXRlZ29yaXplZCBQZW9wbGUgTGlzdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81MS5tZCddLFxuICAgIFszMDAwMSwgJ0NhdGVnb3JpemVkIEJvb2ttYXJrIExpc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTEubWQnXSxcbiAgICBbMzAwMDgsICdQcm9maWxlIEJhZGdlcycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81OC5tZCddLFxuICAgIFszMDAwOSwgJ0JhZGdlIERlZmluaXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTgubWQnXSxcbiAgICBbMzAwMTcsICdDcmVhdGUgb3IgdXBkYXRlIGEgc3RhbGwnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMTUubWQnXSxcbiAgICBbMzAwMTgsICdDcmVhdGUgb3IgdXBkYXRlIGEgcHJvZHVjdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8xNS5tZCddLFxuICAgIFszMDAyMywgJ0xvbmctRm9ybSBDb250ZW50JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzIzLm1kJ10sXG4gICAgWzMwMDI0LCAnRHJhZnQgTG9uZy1mb3JtIENvbnRlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjMubWQnXSxcbiAgICBbMzAwNzgsICdBcHBsaWNhdGlvbi1zcGVjaWZpYyBEYXRhJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzc4Lm1kJ10sXG4gICAgWzMwMzExLCAnTGl2ZSBFdmVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81My5tZCddLFxuICAgIFszMDMxNSwgJ1VzZXIgU3RhdHVzZXMnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMzgubWQnXSxcbiAgICBbMzA0MDIsICdDbGFzc2lmaWVkIExpc3RpbmcnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvOTkubWQnXSxcbiAgICBbMzA0MDMsICdEcmFmdCBDbGFzc2lmaWVkIExpc3RpbmcnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvOTkubWQnXSxcbiAgICBbMzE5MjIsICdEYXRlLUJhc2VkIENhbGVuZGFyIEV2ZW50JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUyLm1kJ10sXG4gICAgWzMxOTIzLCAnVGltZS1CYXNlZCBDYWxlbmRhciBFdmVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Mi5tZCddLFxuICAgIFszMTkyNCwgJ0NhbGVuZGFyJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUyLm1kJ10sXG4gICAgWzMxOTI1LCAnQ2FsZW5kYXIgRXZlbnQgUlNWUCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Mi5tZCddLFxuICAgIFszMTk4OSwgJ0hhbmRsZXIgcmVjb21tZW5kYXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvODkubWQnXSxcbiAgICBbMzE5OTAsICdIYW5kbGVyIGluZm9ybWF0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzg5Lm1kJ10sXG4gICAgWzM0NTUwLCAnQ29tbXVuaXR5IERlZmluaXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNzIubWQnXSxcbl07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAgIGF3YWl0IGdldE9yU2V0RGVmYXVsdCgncHJvZmlsZUluZGV4JywgMCk7XG4gICAgYXdhaXQgZ2V0T3JTZXREZWZhdWx0KCdwcm9maWxlcycsIFthd2FpdCBnZW5lcmF0ZVByb2ZpbGUoKV0pO1xuICAgIGxldCB2ZXJzaW9uID0gKGF3YWl0IHN0b3JhZ2UuZ2V0KHsgdmVyc2lvbjogMCB9KSkudmVyc2lvbjtcbiAgICBjb25zb2xlLmxvZygnREIgdmVyc2lvbjogJywgdmVyc2lvbik7XG4gICAgd2hpbGUgKHZlcnNpb24gPCBEQl9WRVJTSU9OKSB7XG4gICAgICAgIHZlcnNpb24gPSBhd2FpdCBtaWdyYXRlKHZlcnNpb24sIERCX1ZFUlNJT04pO1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHZlcnNpb24gfSk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBtaWdyYXRlKHZlcnNpb24sIGdvYWwpIHtcbiAgICBpZiAodmVyc2lvbiA9PT0gMCkge1xuICAgICAgICBjb25zb2xlLmxvZygnTWlncmF0aW5nIHRvIHZlcnNpb24gMS4nKTtcbiAgICAgICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICAgICAgcHJvZmlsZXMuZm9yRWFjaChwcm9maWxlID0+IChwcm9maWxlLmhvc3RzID0ge30pKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSAxKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdtaWdyYXRpbmcgdG8gdmVyc2lvbiAyLicpO1xuICAgICAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xuICAgICAgICByZXR1cm4gdmVyc2lvbiArIDE7XG4gICAgfVxuXG4gICAgaWYgKHZlcnNpb24gPT09IDIpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ01pZ3JhdGluZyB0byB2ZXJzaW9uIDMuJyk7XG4gICAgICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgICAgIHByb2ZpbGVzLmZvckVhY2gocHJvZmlsZSA9PiAocHJvZmlsZS5yZWxheVJlbWluZGVyID0gdHJ1ZSkpO1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xuICAgICAgICByZXR1cm4gdmVyc2lvbiArIDE7XG4gICAgfVxuXG4gICAgaWYgKHZlcnNpb24gPT09IDMpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ01pZ3JhdGluZyB0byB2ZXJzaW9uIDQgKGVuY3J5cHRpb24gc3VwcG9ydCkuJyk7XG4gICAgICAgIC8vIE5vIGRhdGEgdHJhbnNmb3JtYXRpb24gbmVlZGVkIFx1MjAxNCBleGlzdGluZyBwbGFpbnRleHQga2V5cyBzdGF5IGFzLWlzLlxuICAgICAgICAvLyBFbmNyeXB0aW9uIG9ubHkgYWN0aXZhdGVzIHdoZW4gdGhlIHVzZXIgc2V0cyBhIG1hc3RlciBwYXNzd29yZC5cbiAgICAgICAgLy8gV2UganVzdCBlbnN1cmUgdGhlIGlzRW5jcnlwdGVkIGZsYWcgZXhpc3RzIGFuZCBkZWZhdWx0cyB0byBmYWxzZS5cbiAgICAgICAgbGV0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IGlzRW5jcnlwdGVkOiBmYWxzZSB9KTtcbiAgICAgICAgaWYgKCFkYXRhLmlzRW5jcnlwdGVkKSB7XG4gICAgICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IGlzRW5jcnlwdGVkOiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmVyc2lvbiArIDE7XG4gICAgfVxuXG4gICAgaWYgKHZlcnNpb24gPT09IDQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ01pZ3JhdGluZyB0byB2ZXJzaW9uIDUgKE5JUC00NiBidW5rZXIgc3VwcG9ydCkuJyk7XG4gICAgICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgICAgIHByb2ZpbGVzLmZvckVhY2gocHJvZmlsZSA9PiB7XG4gICAgICAgICAgICBpZiAoIXByb2ZpbGUudHlwZSkgcHJvZmlsZS50eXBlID0gJ2xvY2FsJztcbiAgICAgICAgICAgIGlmIChwcm9maWxlLmJ1bmtlclVybCA9PT0gdW5kZWZpbmVkKSBwcm9maWxlLmJ1bmtlclVybCA9IG51bGw7XG4gICAgICAgICAgICBpZiAocHJvZmlsZS5yZW1vdGVQdWJrZXkgPT09IHVuZGVmaW5lZCkgcHJvZmlsZS5yZW1vdGVQdWJrZXkgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFByb2ZpbGVzKCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgcHJvZmlsZXM6IFtdIH0pO1xuICAgIHJldHVybiBwcm9maWxlcy5wcm9maWxlcztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFByb2ZpbGUoaW5kZXgpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIHJldHVybiBwcm9maWxlc1tpbmRleF07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQcm9maWxlTmFtZXMoKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICByZXR1cm4gcHJvZmlsZXMubWFwKHAgPT4gcC5uYW1lKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFByb2ZpbGVJbmRleCgpIHtcbiAgICBjb25zdCBpbmRleCA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgcHJvZmlsZUluZGV4OiAwIH0pO1xuICAgIHJldHVybiBpbmRleC5wcm9maWxlSW5kZXg7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRQcm9maWxlSW5kZXgocHJvZmlsZUluZGV4KSB7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlSW5kZXggfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWxldGVQcm9maWxlKGluZGV4KSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBsZXQgcHJvZmlsZUluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgcHJvZmlsZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICBpZiAocHJvZmlsZXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgYXdhaXQgY2xlYXJEYXRhKCk7IC8vIElmIHdlIGhhdmUgZGVsZXRlZCBhbGwgb2YgdGhlIHByb2ZpbGVzLCBsZXQncyBqdXN0IHN0YXJ0IGZyZXNoIHdpdGggYWxsIG5ldyBkYXRhXG4gICAgICAgIGF3YWl0IGluaXRpYWxpemUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJZiB0aGUgaW5kZXggZGVsZXRlZCB3YXMgdGhlIGFjdGl2ZSBwcm9maWxlLCBjaGFuZ2UgdGhlIGFjdGl2ZSBwcm9maWxlIHRvIHRoZSBuZXh0IG9uZVxuICAgICAgICBsZXQgbmV3SW5kZXggPVxuICAgICAgICAgICAgcHJvZmlsZUluZGV4ID09PSBpbmRleCA/IE1hdGgubWF4KGluZGV4IC0gMSwgMCkgOiBwcm9maWxlSW5kZXg7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMsIHByb2ZpbGVJbmRleDogbmV3SW5kZXggfSk7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJEYXRhKCkge1xuICAgIGxldCBpZ25vcmVJbnN0YWxsSG9vayA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgaWdub3JlSW5zdGFsbEhvb2s6IGZhbHNlIH0pO1xuICAgIGF3YWl0IHN0b3JhZ2UuY2xlYXIoKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldChpZ25vcmVJbnN0YWxsSG9vayk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlUHJpdmF0ZUtleSgpIHtcbiAgICByZXR1cm4gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnZ2VuZXJhdGVQcml2YXRlS2V5JyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlUHJvZmlsZShuYW1lID0gJ0RlZmF1bHQgTm9zdHIgUHJvZmlsZScsIHR5cGUgPSAnbG9jYWwnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgcHJpdktleTogdHlwZSA9PT0gJ2xvY2FsJyA/IGF3YWl0IGdlbmVyYXRlUHJpdmF0ZUtleSgpIDogJycsXG4gICAgICAgIGhvc3RzOiB7fSxcbiAgICAgICAgcmVsYXlzOiBSRUNPTU1FTkRFRF9SRUxBWVMubWFwKHIgPT4gKHsgdXJsOiByLmhyZWYsIHJlYWQ6IHRydWUsIHdyaXRlOiB0cnVlIH0pKSxcbiAgICAgICAgcmVsYXlSZW1pbmRlcjogZmFsc2UsXG4gICAgICAgIHR5cGUsXG4gICAgICAgIGJ1bmtlclVybDogbnVsbCxcbiAgICAgICAgcmVtb3RlUHVia2V5OiBudWxsLFxuICAgIH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldE9yU2V0RGVmYXVsdChrZXksIGRlZikge1xuICAgIGxldCB2YWwgPSAoYXdhaXQgc3RvcmFnZS5nZXQoa2V5KSlba2V5XTtcbiAgICBpZiAodmFsID09IG51bGwgfHwgdmFsID09IHVuZGVmaW5lZCkge1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtrZXldOiBkZWYgfSk7XG4gICAgICAgIHJldHVybiBkZWY7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVQcm9maWxlTmFtZShpbmRleCwgcHJvZmlsZU5hbWUpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIHByb2ZpbGVzW2luZGV4XS5uYW1lID0gcHJvZmlsZU5hbWU7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVQcml2YXRlS2V5KGluZGV4LCBwcml2YXRlS2V5KSB7XG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBraW5kOiAnc2F2ZVByaXZhdGVLZXknLFxuICAgICAgICBwYXlsb2FkOiBbaW5kZXgsIHByaXZhdGVLZXldLFxuICAgIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbmV3UHJvZmlsZSgpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGNvbnN0IG5ld1Byb2ZpbGUgPSBhd2FpdCBnZW5lcmF0ZVByb2ZpbGUoJ05ldyBQcm9maWxlJyk7XG4gICAgcHJvZmlsZXMucHVzaChuZXdQcm9maWxlKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xuICAgIHJldHVybiBwcm9maWxlcy5sZW5ndGggLSAxO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbmV3QnVua2VyUHJvZmlsZShuYW1lID0gJ05ldyBCdW5rZXInLCBidW5rZXJVcmwgPSBudWxsKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgZ2VuZXJhdGVQcm9maWxlKG5hbWUsICdidW5rZXInKTtcbiAgICBwcm9maWxlLmJ1bmtlclVybCA9IGJ1bmtlclVybDtcbiAgICBwcm9maWxlcy5wdXNoKHByb2ZpbGUpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLmxlbmd0aCAtIDE7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRSZWxheXMocHJvZmlsZUluZGV4KSB7XG4gICAgbGV0IHByb2ZpbGUgPSBhd2FpdCBnZXRQcm9maWxlKHByb2ZpbGVJbmRleCk7XG4gICAgcmV0dXJuIHByb2ZpbGUucmVsYXlzIHx8IFtdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVJlbGF5cyhwcm9maWxlSW5kZXgsIHJlbGF5cykge1xuICAgIC8vIEhhdmluZyBhbiBBbHBpbmUgcHJveHkgb2JqZWN0IGFzIGEgc3ViLW9iamVjdCBkb2VzIG5vdCBzZXJpYWxpemUgY29ycmVjdGx5IGluIHN0b3JhZ2UsXG4gICAgLy8gc28gd2UgYXJlIHByZS1zZXJpYWxpemluZyBoZXJlIGJlZm9yZSBhc3NpZ25pbmcgaXQgdG8gdGhlIHByb2ZpbGUsIHNvIHRoZSBwcm94eVxuICAgIC8vIG9iaiBkb2Vzbid0IGJ1ZyBvdXQuXG4gICAgbGV0IGZpeGVkUmVsYXlzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShyZWxheXMpKTtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGxldCBwcm9maWxlID0gcHJvZmlsZXNbcHJvZmlsZUluZGV4XTtcbiAgICBwcm9maWxlLnJlbGF5cyA9IGZpeGVkUmVsYXlzO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXQoaXRlbSkge1xuICAgIHJldHVybiAoYXdhaXQgc3RvcmFnZS5nZXQoaXRlbSkpW2l0ZW1dO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGVybWlzc2lvbnMoaW5kZXggPSBudWxsKSB7XG4gICAgaWYgKGluZGV4ID09IG51bGwpIHtcbiAgICAgICAgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICB9XG4gICAgbGV0IHByb2ZpbGUgPSBhd2FpdCBnZXRQcm9maWxlKGluZGV4KTtcbiAgICBsZXQgaG9zdHMgPSBhd2FpdCBwcm9maWxlLmhvc3RzO1xuICAgIHJldHVybiBob3N0cztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBlcm1pc3Npb24oaG9zdCwgYWN0aW9uKSB7XG4gICAgbGV0IGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgbGV0IHByb2ZpbGUgPSBhd2FpdCBnZXRQcm9maWxlKGluZGV4KTtcbiAgICByZXR1cm4gcHJvZmlsZS5ob3N0cz8uW2hvc3RdPy5bYWN0aW9uXSB8fCAnYXNrJztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFBlcm1pc3Npb24oaG9zdCwgYWN0aW9uLCBwZXJtLCBpbmRleCA9IG51bGwpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGlmICghaW5kZXgpIHtcbiAgICAgICAgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICB9XG4gICAgbGV0IHByb2ZpbGUgPSBwcm9maWxlc1tpbmRleF07XG4gICAgbGV0IG5ld1Blcm1zID0gcHJvZmlsZS5ob3N0c1tob3N0XSB8fCB7fTtcbiAgICBuZXdQZXJtcyA9IHsgLi4ubmV3UGVybXMsIFthY3Rpb25dOiBwZXJtIH07XG4gICAgcHJvZmlsZS5ob3N0c1tob3N0XSA9IG5ld1Blcm1zO1xuICAgIHByb2ZpbGVzW2luZGV4XSA9IHByb2ZpbGU7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh1bWFuUGVybWlzc2lvbihwKSB7XG4gICAgLy8gSGFuZGxlIHNwZWNpYWwgY2FzZSB3aGVyZSBldmVudCBzaWduaW5nIGluY2x1ZGVzIGEga2luZCBudW1iZXJcbiAgICBpZiAocC5zdGFydHNXaXRoKCdzaWduRXZlbnQ6JykpIHtcbiAgICAgICAgbGV0IFtlLCBuXSA9IHAuc3BsaXQoJzonKTtcbiAgICAgICAgbiA9IHBhcnNlSW50KG4pO1xuICAgICAgICBsZXQgbm5hbWUgPSBLSU5EUy5maW5kKGsgPT4ga1swXSA9PT0gbik/LlsxXSB8fCBgVW5rbm93biAoS2luZCAke259KWA7XG4gICAgICAgIHJldHVybiBgU2lnbiBldmVudDogJHtubmFtZX1gO1xuICAgIH1cblxuICAgIHN3aXRjaCAocCkge1xuICAgICAgICBjYXNlICdnZXRQdWJLZXknOlxuICAgICAgICAgICAgcmV0dXJuICdSZWFkIHB1YmxpYyBrZXknO1xuICAgICAgICBjYXNlICdzaWduRXZlbnQnOlxuICAgICAgICAgICAgcmV0dXJuICdTaWduIGV2ZW50JztcbiAgICAgICAgY2FzZSAnZ2V0UmVsYXlzJzpcbiAgICAgICAgICAgIHJldHVybiAnUmVhZCByZWxheSBsaXN0JztcbiAgICAgICAgY2FzZSAnbmlwMDQuZW5jcnlwdCc6XG4gICAgICAgICAgICByZXR1cm4gJ0VuY3J5cHQgcHJpdmF0ZSBtZXNzYWdlIChOSVAtMDQpJztcbiAgICAgICAgY2FzZSAnbmlwMDQuZGVjcnlwdCc6XG4gICAgICAgICAgICByZXR1cm4gJ0RlY3J5cHQgcHJpdmF0ZSBtZXNzYWdlIChOSVAtMDQpJztcbiAgICAgICAgY2FzZSAnbmlwNDQuZW5jcnlwdCc6XG4gICAgICAgICAgICByZXR1cm4gJ0VuY3J5cHQgcHJpdmF0ZSBtZXNzYWdlIChOSVAtNDQpJztcbiAgICAgICAgY2FzZSAnbmlwNDQuZGVjcnlwdCc6XG4gICAgICAgICAgICByZXR1cm4gJ0RlY3J5cHQgcHJpdmF0ZSBtZXNzYWdlIChOSVAtNDQpJztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiAnVW5rbm93bic7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVLZXkoa2V5KSB7XG4gICAgY29uc3QgaGV4TWF0Y2ggPSAvXltcXGRhLWZdezY0fSQvaS50ZXN0KGtleSk7XG4gICAgY29uc3QgYjMyTWF0Y2ggPSAvXm5zZWMxW3FwenJ5OXg4Z2YydHZkdzBzM2puNTRraGNlNm11YTdsXXs1OH0kLy50ZXN0KGtleSk7XG5cbiAgICByZXR1cm4gaGV4TWF0Y2ggfHwgYjMyTWF0Y2ggfHwgaXNOY3J5cHRzZWMoa2V5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTmNyeXB0c2VjKGtleSkge1xuICAgIHJldHVybiAvXm5jcnlwdHNlYzFbcXB6cnk5eDhnZjJ0dmR3MHMzam41NGtoY2U2bXVhN2xdKyQvLnRlc3Qoa2V5KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZlYXR1cmUobmFtZSkge1xuICAgIGxldCBmbmFtZSA9IGBmZWF0dXJlOiR7bmFtZX1gO1xuICAgIGxldCBmID0gYXdhaXQgYXBpLnN0b3JhZ2UubG9jYWwuZ2V0KHsgW2ZuYW1lXTogZmFsc2UgfSk7XG4gICAgcmV0dXJuIGZbZm5hbWVdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVsYXlSZW1pbmRlcigpIHtcbiAgICBsZXQgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUoaW5kZXgpO1xuICAgIHJldHVybiBwcm9maWxlLnJlbGF5UmVtaW5kZXI7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0b2dnbGVSZWxheVJlbWluZGVyKCkge1xuICAgIGxldCBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcHJvZmlsZXNbaW5kZXhdLnJlbGF5UmVtaW5kZXIgPSBmYWxzZTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0TnB1YigpIHtcbiAgICBsZXQgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICByZXR1cm4gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBraW5kOiAnZ2V0TnB1YicsXG4gICAgICAgIHBheWxvYWQ6IGluZGV4LFxuICAgIH0pO1xufVxuXG4vLyAtLS0gTWFzdGVyIHBhc3N3b3JkIGVuY3J5cHRpb24gaGVscGVycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBtYXN0ZXIgcGFzc3dvcmQgZW5jcnlwdGlvbiBpcyBhY3RpdmUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpc0VuY3J5cHRlZCgpIHtcbiAgICBsZXQgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgaXNFbmNyeXB0ZWQ6IGZhbHNlIH0pO1xuICAgIHJldHVybiBkYXRhLmlzRW5jcnlwdGVkO1xufVxuXG4vKipcbiAqIFN0b3JlIHRoZSBwYXNzd29yZCB2ZXJpZmljYXRpb24gaGFzaCAobmV2ZXIgdGhlIHBhc3N3b3JkIGl0c2VsZikuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRQYXNzd29yZEhhc2gocGFzc3dvcmQpIHtcbiAgICBjb25zdCB7IGhhc2gsIHNhbHQgfSA9IGF3YWl0IGhhc2hQYXNzd29yZChwYXNzd29yZCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoe1xuICAgICAgICBwYXNzd29yZEhhc2g6IGhhc2gsXG4gICAgICAgIHBhc3N3b3JkU2FsdDogc2FsdCxcbiAgICAgICAgaXNFbmNyeXB0ZWQ6IHRydWUsXG4gICAgfSk7XG59XG5cbi8qKlxuICogVmVyaWZ5IGEgcGFzc3dvcmQgYWdhaW5zdCB0aGUgc3RvcmVkIGhhc2guXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja1Bhc3N3b3JkKHBhc3N3b3JkKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHtcbiAgICAgICAgcGFzc3dvcmRIYXNoOiBudWxsLFxuICAgICAgICBwYXNzd29yZFNhbHQ6IG51bGwsXG4gICAgfSk7XG4gICAgaWYgKCFkYXRhLnBhc3N3b3JkSGFzaCB8fCAhZGF0YS5wYXNzd29yZFNhbHQpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdmVyaWZ5UGFzc3dvcmQocGFzc3dvcmQsIGRhdGEucGFzc3dvcmRIYXNoLCBkYXRhLnBhc3N3b3JkU2FsdCk7XG59XG5cbi8qKlxuICogUmVtb3ZlIG1hc3RlciBwYXNzd29yZCBwcm90ZWN0aW9uIFx1MjAxNCBjbGVhcnMgaGFzaCBhbmQgZGVjcnlwdHMgYWxsIGtleXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZW1vdmVQYXNzd29yZFByb3RlY3Rpb24ocGFzc3dvcmQpIHtcbiAgICBjb25zdCB2YWxpZCA9IGF3YWl0IGNoZWNrUGFzc3dvcmQocGFzc3dvcmQpO1xuICAgIGlmICghdmFsaWQpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwYXNzd29yZCcpO1xuXG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb2ZpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9maWxlc1tpXS50eXBlID09PSAnYnVua2VyJykgY29udGludWU7XG4gICAgICAgIGlmIChpc0VuY3J5cHRlZEJsb2IocHJvZmlsZXNbaV0ucHJpdktleSkpIHtcbiAgICAgICAgICAgIHByb2ZpbGVzW2ldLnByaXZLZXkgPSBhd2FpdCBkZWNyeXB0KHByb2ZpbGVzW2ldLnByaXZLZXksIHBhc3N3b3JkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7XG4gICAgICAgIHByb2ZpbGVzLFxuICAgICAgICBpc0VuY3J5cHRlZDogZmFsc2UsXG4gICAgICAgIHBhc3N3b3JkSGFzaDogbnVsbCxcbiAgICAgICAgcGFzc3dvcmRTYWx0OiBudWxsLFxuICAgIH0pO1xufVxuXG4vKipcbiAqIEVuY3J5cHQgYWxsIHByb2ZpbGUgcHJpdmF0ZSBrZXlzIHdpdGggYSBtYXN0ZXIgcGFzc3dvcmQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0QWxsS2V5cyhwYXNzd29yZCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9maWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJvZmlsZXNbaV0udHlwZSA9PT0gJ2J1bmtlcicpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoIWlzRW5jcnlwdGVkQmxvYihwcm9maWxlc1tpXS5wcml2S2V5KSkge1xuICAgICAgICAgICAgcHJvZmlsZXNbaV0ucHJpdktleSA9IGF3YWl0IGVuY3J5cHQocHJvZmlsZXNbaV0ucHJpdktleSwgcGFzc3dvcmQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGF3YWl0IHNldFBhc3N3b3JkSGFzaChwYXNzd29yZCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuLyoqXG4gKiBSZS1lbmNyeXB0IGFsbCBrZXlzIHdpdGggYSBuZXcgcGFzc3dvcmQgKHJlcXVpcmVzIHRoZSBvbGQgcGFzc3dvcmQpLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hhbmdlUGFzc3dvcmRGb3JLZXlzKG9sZFBhc3N3b3JkLCBuZXdQYXNzd29yZCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9maWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJvZmlsZXNbaV0udHlwZSA9PT0gJ2J1bmtlcicpIGNvbnRpbnVlO1xuICAgICAgICBsZXQgaGV4ID0gcHJvZmlsZXNbaV0ucHJpdktleTtcbiAgICAgICAgaWYgKGlzRW5jcnlwdGVkQmxvYihoZXgpKSB7XG4gICAgICAgICAgICBoZXggPSBhd2FpdCBkZWNyeXB0KGhleCwgb2xkUGFzc3dvcmQpO1xuICAgICAgICB9XG4gICAgICAgIHByb2ZpbGVzW2ldLnByaXZLZXkgPSBhd2FpdCBlbmNyeXB0KGhleCwgbmV3UGFzc3dvcmQpO1xuICAgIH1cbiAgICBjb25zdCB7IGhhc2gsIHNhbHQgfSA9IGF3YWl0IGhhc2hQYXNzd29yZChuZXdQYXNzd29yZCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoe1xuICAgICAgICBwcm9maWxlcyxcbiAgICAgICAgcGFzc3dvcmRIYXNoOiBoYXNoLFxuICAgICAgICBwYXNzd29yZFNhbHQ6IHNhbHQsXG4gICAgICAgIGlzRW5jcnlwdGVkOiB0cnVlLFxuICAgIH0pO1xufVxuXG4vKipcbiAqIERlY3J5cHQgYSBzaW5nbGUgcHJvZmlsZSdzIHByaXZhdGUga2V5LCByZXR1cm5pbmcgdGhlIGhleCBzdHJpbmcuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREZWNyeXB0ZWRQcml2S2V5KHByb2ZpbGUsIHBhc3N3b3JkKSB7XG4gICAgaWYgKHByb2ZpbGUudHlwZSA9PT0gJ2J1bmtlcicpIHJldHVybiAnJztcbiAgICBpZiAoaXNFbmNyeXB0ZWRCbG9iKHByb2ZpbGUucHJpdktleSkpIHtcbiAgICAgICAgcmV0dXJuIGRlY3J5cHQocHJvZmlsZS5wcml2S2V5LCBwYXNzd29yZCk7XG4gICAgfVxuICAgIHJldHVybiBwcm9maWxlLnByaXZLZXk7XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBhIHN0b3JlZCB2YWx1ZSBsb29rcyBsaWtlIGFuIGVuY3J5cHRlZCBibG9iLlxuICogRW5jcnlwdGVkIGJsb2JzIGFyZSBKU09OIHN0cmluZ3MgY29udGFpbmluZyB7c2FsdCwgaXYsIGNpcGhlcnRleHR9LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFbmNyeXB0ZWRCbG9iKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuICEhKHBhcnNlZC5zYWx0ICYmIHBhcnNlZC5pdiAmJiBwYXJzZWQuY2lwaGVydGV4dCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iLCAiLyoqXG4gKiBOb3N0cktleSBTaWRlIFBhbmVsIC0gVmFuaWxsYSBKUyAoQ1NQLXNhZmUpXG4gKiBUYWJiZWQgbmF2aWdhdGlvbiB3aXRoIG1hc3Rlci1kZXRhaWwgcGF0dGVyblxuICovXG5cbmltcG9ydCB7XG4gICAgZ2V0UHJvZmlsZU5hbWVzLFxuICAgIHNldFByb2ZpbGVJbmRleCxcbiAgICBnZXRQcm9maWxlSW5kZXgsXG4gICAgZ2V0UmVsYXlzLFxuICAgIFJFQ09NTUVOREVEX1JFTEFZUyxcbiAgICBzYXZlUmVsYXlzLFxuICAgIGluaXRpYWxpemUsXG4gICAgcmVsYXlSZW1pbmRlcixcbiAgICB0b2dnbGVSZWxheVJlbWluZGVyLFxuICAgIGdldE5wdWIsXG4gICAgZ2V0UGVybWlzc2lvbnMsXG4gICAgbmV3UHJvZmlsZSxcbiAgICBzYXZlUHJvZmlsZU5hbWUsXG4gICAgZGVsZXRlUHJvZmlsZSxcbiAgICBnZXRQcm9maWxlLFxuICAgIGdldFByb2ZpbGVzLFxufSBmcm9tICcuL3V0aWxpdGllcy91dGlscyc7XG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCBRUkNvZGUgZnJvbSAncXJjb2RlJztcblxuLy8gU3RhdGVcbmxldCBzdGF0ZSA9IHtcbiAgICBwcm9maWxlTmFtZXM6IFsnRGVmYXVsdCBOb3N0ciBQcm9maWxlJ10sXG4gICAgcHJvZmlsZUluZGV4OiAwLFxuICAgIHJlbGF5Q291bnQ6IDAsXG4gICAgcmVsYXlzOiBbXSxcbiAgICBzaG93UmVsYXlSZW1pbmRlcjogdHJ1ZSxcbiAgICBpc0xvY2tlZDogZmFsc2UsXG4gICAgaGFzUGFzc3dvcmQ6IGZhbHNlLFxuICAgIG5wdWJRckRhdGFVcmw6ICcnLFxuICAgIGN1cnJlbnROcHViOiAnJyxcbiAgICBwcm9maWxlVHlwZTogJ2xvY2FsJyxcbiAgICBidW5rZXJDb25uZWN0ZWQ6IGZhbHNlLFxuICAgIGN1cnJlbnRWaWV3OiAnaG9tZScsXG4gICAgcGVybWlzc2lvbnM6IFtdLFxuICAgIC8vIFByb2ZpbGUgdmlldyBzdGF0ZVxuICAgIHZpZXdpbmdQcm9maWxlSW5kZXg6IG51bGwsXG4gICAgdmlld05zZWNWaXNpYmxlOiBmYWxzZSxcbiAgICB2aWV3TnNlY1ZhbHVlOiAnJyxcbiAgICAvLyBQcm9maWxlIGVkaXQgc3RhdGVcbiAgICBlZGl0aW5nUHJvZmlsZUluZGV4OiBudWxsLCAvLyBudWxsID0gbmV3IHByb2ZpbGUsIG51bWJlciA9IGVkaXRpbmcgZXhpc3RpbmdcbiAgICBlZGl0UHJvZmlsZU5hbWU6ICcnLFxuICAgIGVkaXRQcm9maWxlS2V5OiAnJyxcbiAgICBrZXlWaXNpYmxlOiBmYWxzZSxcbn07XG5cbi8vIERPTSBFbGVtZW50c1xuY29uc3QgZWxlbWVudHMgPSB7fTtcblxuZnVuY3Rpb24gJChpZCkge1xuICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG59XG5cbmZ1bmN0aW9uIGluaXRFbGVtZW50cygpIHtcbiAgICBlbGVtZW50cy5sb2NrZWRWaWV3ID0gJCgnbG9ja2VkLXZpZXcnKTtcbiAgICBlbGVtZW50cy51bmxvY2tlZFZpZXcgPSAkKCd1bmxvY2tlZC12aWV3Jyk7XG4gICAgZWxlbWVudHMudW5sb2NrRm9ybSA9ICQoJ3VubG9jay1mb3JtJyk7XG4gICAgZWxlbWVudHMudW5sb2NrUGFzc3dvcmQgPSAkKCd1bmxvY2stcGFzc3dvcmQnKTtcbiAgICBlbGVtZW50cy51bmxvY2tFcnJvciA9ICQoJ3VubG9jay1lcnJvcicpO1xuICAgIGVsZW1lbnRzLmxvY2tCdG4gPSAkKCdsb2NrLWJ0bicpO1xuICAgIC8vIFByb2ZpbGUgbGlzdCBVSVxuICAgIGVsZW1lbnRzLnByb2ZpbGVMaXN0ID0gJCgncHJvZmlsZS1saXN0Jyk7XG4gICAgZWxlbWVudHMucHJvZmlsZURldGFpbHMgPSAkKCdwcm9maWxlLWRldGFpbHMnKTtcbiAgICBlbGVtZW50cy5wcm9maWxlTmFtZSA9ICQoJ3Byb2ZpbGUtbmFtZScpO1xuICAgIGVsZW1lbnRzLm5wdWJEaXNwbGF5ID0gJCgnbnB1Yi1kaXNwbGF5Jyk7XG4gICAgZWxlbWVudHMuYWRkUHJvZmlsZUJ0biA9ICQoJ2FkZC1wcm9maWxlLWJ0bicpO1xuICAgIGVsZW1lbnRzLmNvcHlOcHViQnRuID0gJCgnY29weS1ucHViLWJ0bicpO1xuICAgIGVsZW1lbnRzLnFyQ29udGFpbmVyID0gJCgncXItY29udGFpbmVyJyk7XG4gICAgZWxlbWVudHMucXJJbWFnZSA9ICQoJ3FyLWltYWdlJyk7XG4gICAgZWxlbWVudHMuY29weVFyUG5nQnRuID0gJCgnY29weS1xci1wbmctYnRuJyk7XG4gICAgZWxlbWVudHMuYnVua2VyU3RhdHVzID0gJCgnYnVua2VyLXN0YXR1cycpO1xuICAgIGVsZW1lbnRzLmJ1bmtlckluZGljYXRvciA9ICQoJ2J1bmtlci1pbmRpY2F0b3InKTtcbiAgICBlbGVtZW50cy5idW5rZXJUZXh0ID0gJCgnYnVua2VyLXRleHQnKTtcbiAgICBlbGVtZW50cy5yZWxheVJlbWluZGVyID0gJCgncmVsYXktcmVtaW5kZXInKTtcbiAgICBlbGVtZW50cy5yZWxheUNvdW50VGV4dCA9ICQoJ3JlbGF5LWNvdW50LXRleHQnKTtcbiAgICBlbGVtZW50cy5hZGRSZWxheXNCdG4gPSAkKCdhZGQtcmVsYXlzLWJ0bicpO1xuICAgIGVsZW1lbnRzLm5vVGhhbmtzQnRuID0gJCgnbm8tdGhhbmtzLWJ0bicpO1xuICAgIC8vIFRhYiBuYXZpZ2F0aW9uXG4gICAgZWxlbWVudHMudGFiQnRucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50YWItYnRuJyk7XG4gICAgZWxlbWVudHMudmlld1NlY3Rpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnZpZXctc2VjdGlvbicpO1xuICAgIC8vIFJlbGF5cyB2aWV3XG4gICAgZWxlbWVudHMucmVsYXlMaXN0ID0gJCgncmVsYXktbGlzdCcpO1xuICAgIGVsZW1lbnRzLm5ld1JlbGF5SW5wdXQgPSAkKCduZXctcmVsYXktaW5wdXQnKTtcbiAgICBlbGVtZW50cy5hZGRSZWxheUJ0biA9ICQoJ2FkZC1yZWxheS1idG4nKTtcbiAgICAvLyBQZXJtaXNzaW9ucyB2aWV3XG4gICAgZWxlbWVudHMucGVybWlzc2lvbnNMaXN0ID0gJCgncGVybWlzc2lvbnMtbGlzdCcpO1xuICAgIC8vIFNldHRpbmdzIHZpZXcgYnV0dG9uc1xuICAgIGVsZW1lbnRzLm9wZW5TZXR0aW5nc0J0biA9ICQoJ29wZW4tc2V0dGluZ3MtYnRuJyk7XG4gICAgZWxlbWVudHMub3Blbkhpc3RvcnlCdG4gPSAkKCdvcGVuLWhpc3RvcnktYnRuJyk7XG4gICAgZWxlbWVudHMub3BlbkV4cGVyaW1lbnRhbEJ0biA9ICQoJ29wZW4tZXhwZXJpbWVudGFsLWJ0bicpO1xuICAgIGVsZW1lbnRzLm9wZW5WYXVsdEJ0biA9ICQoJ29wZW4tdmF1bHQtYnRuJyk7XG4gICAgZWxlbWVudHMub3BlbkFwaWtleXNCdG4gPSAkKCdvcGVuLWFwaWtleXMtYnRuJyk7XG4gICAgLy8gUHJvZmlsZSB2aWV3IChyZWFkLW9ubHkpXG4gICAgZWxlbWVudHMucHJvZmlsZVZpZXdUaXRsZSA9ICQoJ3Byb2ZpbGUtdmlldy10aXRsZScpO1xuICAgIGVsZW1lbnRzLnZpZXdQcm9maWxlTmFtZSA9ICQoJ3ZpZXctcHJvZmlsZS1uYW1lJyk7XG4gICAgZWxlbWVudHMudmlld05wdWIgPSAkKCd2aWV3LW5wdWInKTtcbiAgICBlbGVtZW50cy52aWV3TnNlYyA9ICQoJ3ZpZXctbnNlYycpO1xuICAgIGVsZW1lbnRzLmJhY2tGcm9tVmlld0J0biA9ICQoJ2JhY2stZnJvbS12aWV3LWJ0bicpO1xuICAgIGVsZW1lbnRzLmVkaXRQcm9maWxlQnRuID0gJCgnZWRpdC1wcm9maWxlLWJ0bicpO1xuICAgIGVsZW1lbnRzLmNvcHlWaWV3TnB1YkJ0biA9ICQoJ2NvcHktdmlldy1ucHViLWJ0bicpO1xuICAgIGVsZW1lbnRzLmNvcHlWaWV3TnNlY0J0biA9ICQoJ2NvcHktdmlldy1uc2VjLWJ0bicpO1xuICAgIGVsZW1lbnRzLnRvZ2dsZVZpZXdOc2VjQnRuID0gJCgndG9nZ2xlLXZpZXctbnNlYy1idG4nKTtcbiAgICAvLyBQcm9maWxlIGVkaXQgdmlld1xuICAgIGVsZW1lbnRzLnByb2ZpbGVFZGl0VGl0bGUgPSAkKCdwcm9maWxlLWVkaXQtdGl0bGUnKTtcbiAgICBlbGVtZW50cy5lZGl0UHJvZmlsZU5hbWUgPSAkKCdlZGl0LXByb2ZpbGUtbmFtZScpO1xuICAgIGVsZW1lbnRzLmVkaXRQcm9maWxlS2V5ID0gJCgnZWRpdC1wcm9maWxlLWtleScpO1xuICAgIGVsZW1lbnRzLnRvZ2dsZUtleVZpc2liaWxpdHkgPSAkKCd0b2dnbGUta2V5LXZpc2liaWxpdHknKTtcbiAgICBlbGVtZW50cy5nZW5lcmF0ZUtleUJ0biA9ICQoJ2dlbmVyYXRlLWtleS1idG4nKTtcbiAgICBlbGVtZW50cy5zYXZlUHJvZmlsZUJ0biA9ICQoJ3NhdmUtcHJvZmlsZS1idG4nKTtcbiAgICBlbGVtZW50cy5kZWxldGVQcm9maWxlQnRuID0gJCgnZGVsZXRlLXByb2ZpbGUtYnRuJyk7XG4gICAgZWxlbWVudHMuYmFja1RvUHJvZmlsZXNCdG4gPSAkKCdiYWNrLXRvLXByb2ZpbGVzLWJ0bicpO1xuICAgIGVsZW1lbnRzLnByb2ZpbGVFZGl0RXJyb3IgPSAkKCdwcm9maWxlLWVkaXQtZXJyb3InKTtcbiAgICBlbGVtZW50cy5wcm9maWxlRWRpdFN1Y2Nlc3MgPSAkKCdwcm9maWxlLWVkaXQtc3VjY2VzcycpO1xuICAgIGVsZW1lbnRzLmtleVNlY3Rpb24gPSAkKCdrZXktc2VjdGlvbicpO1xufVxuXG4vLyBSZW5kZXIgZnVuY3Rpb25zXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgaWYgKHN0YXRlLmlzTG9ja2VkKSB7XG4gICAgICAgIGVsZW1lbnRzLmxvY2tlZFZpZXcuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gICAgICAgIGVsZW1lbnRzLnVubG9ja2VkVmlldy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50cy5sb2NrZWRWaWV3LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgICAgICBlbGVtZW50cy51bmxvY2tlZFZpZXcuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gICAgICAgIHJlbmRlclVubG9ja2VkU3RhdGUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlclVubG9ja2VkU3RhdGUoKSB7XG4gICAgLy8gTG9jayBidXR0b24gdmlzaWJpbGl0eVxuICAgIGlmIChzdGF0ZS5oYXNQYXNzd29yZCkge1xuICAgICAgICBlbGVtZW50cy5sb2NrQnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnRzLmxvY2tCdG4uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gICAgfVxuXG4gICAgLy8gUHJvZmlsZSBsaXN0XG4gICAgcmVuZGVyUHJvZmlsZUxpc3QoKTtcblxuICAgIC8vIFByb2ZpbGUgZGV0YWlsc1xuICAgIHJlbmRlclByb2ZpbGVEZXRhaWxzKCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclByb2ZpbGVMaXN0KCkge1xuICAgIGlmICghZWxlbWVudHMucHJvZmlsZUxpc3QpIHJldHVybjtcbiAgICBcbiAgICBlbGVtZW50cy5wcm9maWxlTGlzdC5pbm5lckhUTUwgPSBzdGF0ZS5wcm9maWxlTmFtZXMubWFwKChuYW1lLCBpKSA9PiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJwcm9maWxlLWl0ZW0gZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgcC0zIHJvdW5kZWQtbGcgdHJhbnNpdGlvbi1jb2xvcnMgJHtpID09PSBzdGF0ZS5wcm9maWxlSW5kZXggPyAnYmctbW9ub2thaS1iZy1saWdodGVyIGJvcmRlciBib3JkZXItbW9ub2thaS1hY2NlbnQnIDogJ2JnLW1vbm9rYWktYmctbGlnaHQgYm9yZGVyIGJvcmRlci10cmFuc3BhcmVudCBob3Zlcjpib3JkZXItbW9ub2thaS1iZy1saWdodGVyJ31cIiBkYXRhLWluZGV4PVwiJHtpfVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByb2ZpbGUtc2VsZWN0LWFyZWEgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgZmxleC0xIG1pbi13LTAgY3Vyc29yLXBvaW50ZXJcIiBkYXRhLWluZGV4PVwiJHtpfVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3LTEwIGgtMTAgcm91bmRlZC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGZsZXgtc2hyaW5rLTBcIiBzdHlsZT1cImJhY2tncm91bmQ6IzI3MjgyMjtcIj5cbiAgICAgICAgICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjIwXCIgaGVpZ2h0PVwiMjBcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCIke2kgPT09IHN0YXRlLnByb2ZpbGVJbmRleCA/ICcjYTZlMjJlJyA6ICcjOGY5MDhhJ31cIiBzdHJva2Utd2lkdGg9XCIxLjVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiOFwiIHI9XCI0XCI+PC9jaXJjbGU+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTQgMjBjMC00IDQtNiA4LTZzOCAyIDggNlwiPjwvcGF0aD5cbiAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXgtMSBtaW4tdy0wXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb250LW1lZGl1bSB0cnVuY2F0ZVwiIHN0eWxlPVwiY29sb3I6JHtpID09PSBzdGF0ZS5wcm9maWxlSW5kZXggPyAnI2E2ZTIyZScgOiAnI2Y4ZjhmMid9O1wiPiR7bmFtZX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQteHMgdHJ1bmNhdGVcIiBzdHlsZT1cImNvbG9yOiM4ZjkwOGE7XCI+JHtpID09PSBzdGF0ZS5wcm9maWxlSW5kZXggPyAnQWN0aXZlJyA6ICdDbGljayB0byBzZWxlY3QnfTwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwicHJvZmlsZS1lZGl0LWJ0biBmbGV4LXNocmluay0wXCIgZGF0YS1pbmRleD1cIiR7aX1cIiB0aXRsZT1cIkVkaXQgcHJvZmlsZVwiIHN0eWxlPVwicGFkZGluZzo4cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtib3JkZXI6bm9uZTtjdXJzb3I6cG9pbnRlcjtcIj5cbiAgICAgICAgICAgICAgICA8c3ZnIHdpZHRoPVwiMTZcIiBoZWlnaHQ9XCIxNlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cIiM4ZjkwOGFcIiBzdHJva2Utd2lkdGg9XCIxLjVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0xMSA0SDRhMiAyIDAgMDAtMiAydjE0YTIgMiAwIDAwMiAyaDE0YTIgMiAwIDAwMi0ydi03XCI+PC9wYXRoPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTE4LjUgMi41YTIuMTIxIDIuMTIxIDAgMDEzIDNMMTIgMTVsLTQgMSAxLTQgOS41LTkuNXpcIj48L3BhdGg+XG4gICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICR7aSA9PT0gc3RhdGUucHJvZmlsZUluZGV4ID8gJzxzdmcgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiI2E2ZTIyZVwiIHN0cm9rZS13aWR0aD1cIjJcIiBjbGFzcz1cImZsZXgtc2hyaW5rLTBcIj48cGF0aCBkPVwiTTIwIDZMOSAxN2wtNS01XCI+PC9wYXRoPjwvc3ZnPicgOiAnJ31cbiAgICAgICAgPC9kaXY+XG4gICAgYCkuam9pbignJyk7XG5cbiAgICAvLyBCaW5kIGNsaWNrIGV2ZW50cyBmb3Igc2VsZWN0aW5nIHByb2ZpbGVcbiAgICBlbGVtZW50cy5wcm9maWxlTGlzdC5xdWVyeVNlbGVjdG9yQWxsKCcucHJvZmlsZS1zZWxlY3QtYXJlYScpLmZvckVhY2goYXJlYSA9PiB7XG4gICAgICAgIGFyZWEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpZHggPSBwYXJzZUludChhcmVhLmRhdGFzZXQuaW5kZXgsIDEwKTtcbiAgICAgICAgICAgIGlmIChpZHggIT09IHN0YXRlLnByb2ZpbGVJbmRleCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHNlbGVjdFByb2ZpbGUoaWR4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBCaW5kIGNsaWNrIGV2ZW50cyBmb3Igdmlld2luZyBwcm9maWxlIChvcGVucyByZWFkLW9ubHkgdmlldylcbiAgICBlbGVtZW50cy5wcm9maWxlTGlzdC5xdWVyeVNlbGVjdG9yQWxsKCcucHJvZmlsZS1lZGl0LWJ0bicpLmZvckVhY2goYnRuID0+IHtcbiAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGUpID0+IHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCBpZHggPSBwYXJzZUludChidG4uZGF0YXNldC5pbmRleCwgMTApO1xuICAgICAgICAgICAgYXdhaXQgb3BlblByb2ZpbGVWaWV3KGlkeCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJQcm9maWxlRGV0YWlscygpIHtcbiAgICBpZiAoIWVsZW1lbnRzLnByb2ZpbGVEZXRhaWxzKSByZXR1cm47XG5cbiAgICAvLyBTaG93IHByb2ZpbGUgZGV0YWlsc1xuICAgIGVsZW1lbnRzLnByb2ZpbGVEZXRhaWxzLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgIGVsZW1lbnRzLnByb2ZpbGVOYW1lLnRleHRDb250ZW50ID0gc3RhdGUucHJvZmlsZU5hbWVzW3N0YXRlLnByb2ZpbGVJbmRleF0gfHwgJ0RlZmF1bHQnO1xuXG4gICAgLy8gbnB1YiBkaXNwbGF5XG4gICAgaWYgKHN0YXRlLmN1cnJlbnROcHViICYmIGVsZW1lbnRzLm5wdWJEaXNwbGF5KSB7XG4gICAgICAgIGVsZW1lbnRzLm5wdWJEaXNwbGF5LnRleHRDb250ZW50ID0gc3RhdGUuY3VycmVudE5wdWI7XG4gICAgfVxuXG4gICAgLy8gUVIgY29kZVxuICAgIGlmIChzdGF0ZS5ucHViUXJEYXRhVXJsKSB7XG4gICAgICAgIGVsZW1lbnRzLnFySW1hZ2Uuc3JjID0gc3RhdGUubnB1YlFyRGF0YVVybDtcbiAgICAgICAgZWxlbWVudHMucXJDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbWVudHMucXJDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gICAgfVxuXG4gICAgLy8gQnVua2VyIHN0YXR1c1xuICAgIGlmIChzdGF0ZS5wcm9maWxlVHlwZSA9PT0gJ2J1bmtlcicpIHtcbiAgICAgICAgZWxlbWVudHMuYnVua2VyU3RhdHVzLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgICAgICBlbGVtZW50cy5idW5rZXJJbmRpY2F0b3IuY2xhc3NOYW1lID0gYGlubGluZS1ibG9jayB3LTIgaC0yIHJvdW5kZWQtZnVsbCAke3N0YXRlLmJ1bmtlckNvbm5lY3RlZCA/ICdiZy1ncmVlbi01MDAnIDogJ2JnLXJlZC01MDAnfWA7XG4gICAgICAgIGVsZW1lbnRzLmJ1bmtlclRleHQudGV4dENvbnRlbnQgPSBzdGF0ZS5idW5rZXJDb25uZWN0ZWQgPyAnQnVua2VyIGNvbm5lY3RlZCcgOiAnQnVua2VyIGRpc2Nvbm5lY3RlZCc7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbWVudHMuYnVua2VyU3RhdHVzLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgIH1cblxuICAgIC8vIFJlbGF5IGNvdW50XG4gICAgaWYgKGVsZW1lbnRzLnJlbGF5Q291bnRUZXh0KSB7XG4gICAgICAgIGVsZW1lbnRzLnJlbGF5Q291bnRUZXh0LnRleHRDb250ZW50ID0gYCR7c3RhdGUucmVsYXlDb3VudH0gcmVsYXkke3N0YXRlLnJlbGF5Q291bnQgIT09IDEgPyAncycgOiAnJ30gY29uZmlndXJlZGA7XG4gICAgfVxuXG4gICAgLy8gUmVsYXkgcmVtaW5kZXJcbiAgICBpZiAoc3RhdGUucmVsYXlDb3VudCA8IDEgJiYgc3RhdGUuc2hvd1JlbGF5UmVtaW5kZXIpIHtcbiAgICAgICAgZWxlbWVudHMucmVsYXlSZW1pbmRlci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50cy5yZWxheVJlbWluZGVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgIH1cbn1cblxuLy8gQWN0aW9uc1xuYXN5bmMgZnVuY3Rpb24gbG9hZFVubG9ja2VkU3RhdGUoKSB7XG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAncmVzZXRBdXRvTG9jaycgfSk7XG4gICAgYXdhaXQgbG9hZE5hbWVzKCk7XG4gICAgYXdhaXQgbG9hZFByb2ZpbGVJbmRleCgpO1xuICAgIGF3YWl0IGxvYWRQcm9maWxlVHlwZSgpO1xuICAgIGF3YWl0IGNvdW50UmVsYXlzKCk7XG4gICAgYXdhaXQgY2hlY2tSZWxheVJlbWluZGVyKCk7XG4gICAgYXdhaXQgZ2VuZXJhdGVRcigpO1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkTmFtZXMoKSB7XG4gICAgc3RhdGUucHJvZmlsZU5hbWVzID0gYXdhaXQgZ2V0UHJvZmlsZU5hbWVzKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRQcm9maWxlSW5kZXgoKSB7XG4gICAgc3RhdGUucHJvZmlsZUluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRQcm9maWxlVHlwZSgpIHtcbiAgICBzdGF0ZS5wcm9maWxlVHlwZSA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2dldFByb2ZpbGVUeXBlJyB9KTtcbiAgICBpZiAoc3RhdGUucHJvZmlsZVR5cGUgPT09ICdidW5rZXInKSB7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2J1bmtlci5zdGF0dXMnIH0pO1xuICAgICAgICBzdGF0ZS5idW5rZXJDb25uZWN0ZWQgPSBzdGF0dXM/LmNvbm5lY3RlZCB8fCBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0ZS5idW5rZXJDb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvdW50UmVsYXlzKCkge1xuICAgIGNvbnN0IHJlbGF5cyA9IGF3YWl0IGdldFJlbGF5cyhzdGF0ZS5wcm9maWxlSW5kZXgpO1xuICAgIHN0YXRlLnJlbGF5Q291bnQgPSByZWxheXMubGVuZ3RoO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjaGVja1JlbGF5UmVtaW5kZXIoKSB7XG4gICAgc3RhdGUuc2hvd1JlbGF5UmVtaW5kZXIgPSBhd2FpdCByZWxheVJlbWluZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlUXIoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbnB1YiA9IGF3YWl0IGdldE5wdWIoKTtcbiAgICAgICAgaWYgKCFucHViKSB7XG4gICAgICAgICAgICBzdGF0ZS5ucHViUXJEYXRhVXJsID0gJyc7XG4gICAgICAgICAgICBzdGF0ZS5jdXJyZW50TnB1YiA9ICcnO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRlLmN1cnJlbnROcHViID0gbnB1YjtcbiAgICAgICAgc3RhdGUubnB1YlFyRGF0YVVybCA9IGF3YWl0IFFSQ29kZS50b0RhdGFVUkwobnB1Yi50b1VwcGVyQ2FzZSgpLCB7XG4gICAgICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICAgICAgbWFyZ2luOiAyLFxuICAgICAgICAgICAgY29sb3I6IHsgZGFyazogJyNhNmUyMmUnLCBsaWdodDogJyMyNzI4MjInIH0sXG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICBzdGF0ZS5ucHViUXJEYXRhVXJsID0gJyc7XG4gICAgICAgIHN0YXRlLmN1cnJlbnROcHViID0gJyc7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBzZWxlY3RQcm9maWxlKGluZGV4KSB7XG4gICAgc3RhdGUucHJvZmlsZUluZGV4ID0gaW5kZXg7XG4gICAgYXdhaXQgc2V0UHJvZmlsZUluZGV4KHN0YXRlLnByb2ZpbGVJbmRleCk7XG4gICAgYXdhaXQgbG9hZFByb2ZpbGVUeXBlKCk7XG4gICAgYXdhaXQgY291bnRSZWxheXMoKTtcbiAgICBhd2FpdCBjaGVja1JlbGF5UmVtaW5kZXIoKTtcbiAgICBhd2FpdCBnZW5lcmF0ZVFyKCk7XG4gICAgcmVuZGVyKCk7XG59XG5cbmZ1bmN0aW9uIG9wZW5BZGRQcm9maWxlKCkge1xuICAgIC8vIE9wZW4gcHJvZmlsZSBlZGl0IHZpZXcgZm9yIG5ldyBwcm9maWxlXG4gICAgc3RhdGUuZWRpdGluZ1Byb2ZpbGVJbmRleCA9IG51bGw7XG4gICAgc3RhdGUuZWRpdFByb2ZpbGVOYW1lID0gJyc7XG4gICAgc3RhdGUuZWRpdFByb2ZpbGVLZXkgPSAnJztcbiAgICBzdGF0ZS5rZXlWaXNpYmxlID0gZmFsc2U7XG4gICAgc2hvd1Byb2ZpbGVFZGl0VmlldygpO1xufVxuXG5mdW5jdGlvbiBzaG93UHJvZmlsZUVkaXRWaWV3KCkge1xuICAgIC8vIFVwZGF0ZSB0aXRsZVxuICAgIGlmIChlbGVtZW50cy5wcm9maWxlRWRpdFRpdGxlKSB7XG4gICAgICAgIGVsZW1lbnRzLnByb2ZpbGVFZGl0VGl0bGUudGV4dENvbnRlbnQgPSBzdGF0ZS5lZGl0aW5nUHJvZmlsZUluZGV4ID09PSBudWxsID8gJ05ldyBQcm9maWxlJyA6ICdFZGl0IFByb2ZpbGUnO1xuICAgIH1cbiAgICAvLyBQb3B1bGF0ZSBmaWVsZHNcbiAgICBpZiAoZWxlbWVudHMuZWRpdFByb2ZpbGVOYW1lKSB7XG4gICAgICAgIGVsZW1lbnRzLmVkaXRQcm9maWxlTmFtZS52YWx1ZSA9IHN0YXRlLmVkaXRQcm9maWxlTmFtZTtcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLmVkaXRQcm9maWxlS2V5KSB7XG4gICAgICAgIGVsZW1lbnRzLmVkaXRQcm9maWxlS2V5LnZhbHVlID0gc3RhdGUuZWRpdFByb2ZpbGVLZXk7XG4gICAgICAgIGVsZW1lbnRzLmVkaXRQcm9maWxlS2V5LnR5cGUgPSBzdGF0ZS5rZXlWaXNpYmxlID8gJ3RleHQnIDogJ3Bhc3N3b3JkJztcbiAgICB9XG4gICAgLy8gU2hvdy9oaWRlIGRlbGV0ZSBidXR0b24gKG9ubHkgZm9yIGV4aXN0aW5nIHByb2ZpbGVzLCBhbmQgbm90IGlmIGl0J3MgdGhlIG9ubHkgcHJvZmlsZSlcbiAgICBpZiAoZWxlbWVudHMuZGVsZXRlUHJvZmlsZUJ0bikge1xuICAgICAgICBpZiAoc3RhdGUuZWRpdGluZ1Byb2ZpbGVJbmRleCAhPT0gbnVsbCAmJiBzdGF0ZS5wcm9maWxlTmFtZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgZWxlbWVudHMuZGVsZXRlUHJvZmlsZUJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnRzLmRlbGV0ZVByb2ZpbGVCdG4uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gSGlkZSBrZXkgc2VjdGlvbiB3aGVuIGVkaXRpbmcgKGNhbid0IGNoYW5nZSBrZXkgYWZ0ZXIgY3JlYXRpb24gZm9yIHNlY3VyaXR5KVxuICAgIGlmIChlbGVtZW50cy5rZXlTZWN0aW9uKSB7XG4gICAgICAgIGlmIChzdGF0ZS5lZGl0aW5nUHJvZmlsZUluZGV4ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBlbGVtZW50cy5rZXlTZWN0aW9uLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxlbWVudHMua2V5U2VjdGlvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBDbGVhciBtZXNzYWdlc1xuICAgIGlmIChlbGVtZW50cy5wcm9maWxlRWRpdEVycm9yKSBlbGVtZW50cy5wcm9maWxlRWRpdEVycm9yLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgIGlmIChlbGVtZW50cy5wcm9maWxlRWRpdFN1Y2Nlc3MpIGVsZW1lbnRzLnByb2ZpbGVFZGl0U3VjY2Vzcy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbiAgICBcbiAgICAvLyBTd2l0Y2ggdG8gcHJvZmlsZSBlZGl0IHZpZXdcbiAgICBzd2l0Y2hWaWV3RGlyZWN0KCdwcm9maWxlLWVkaXQnKTtcbn1cblxuZnVuY3Rpb24gc3dpdGNoVmlld0RpcmVjdCh2aWV3TmFtZSkge1xuICAgIC8vIEhpZGUgYWxsIHZpZXdzXG4gICAgZWxlbWVudHMudmlld1NlY3Rpb25zLmZvckVhY2goc2VjdGlvbiA9PiB7XG4gICAgICAgIHNlY3Rpb24uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgfSk7XG4gICAgLy8gU2hvdyB0YXJnZXQgdmlld1xuICAgIGNvbnN0IHRhcmdldFZpZXcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlldy0nICsgdmlld05hbWUpO1xuICAgIGlmICh0YXJnZXRWaWV3KSB7XG4gICAgICAgIHRhcmdldFZpZXcuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgfVxuICAgIHN0YXRlLmN1cnJlbnRWaWV3ID0gdmlld05hbWU7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIG9wZW5Qcm9maWxlVmlldyhpbmRleCkge1xuICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBnZXRQcm9maWxlKGluZGV4KTtcbiAgICBpZiAoIXByb2ZpbGUpIHJldHVybjtcbiAgICBcbiAgICBzdGF0ZS52aWV3aW5nUHJvZmlsZUluZGV4ID0gaW5kZXg7XG4gICAgc3RhdGUudmlld05zZWNWaXNpYmxlID0gZmFsc2U7XG4gICAgXG4gICAgLy8gR2V0IG5wdWIgYW5kIG5zZWNcbiAgICBjb25zdCBucHViID0gYXdhaXQgZ2V0TnB1YihpbmRleCk7XG4gICAgY29uc3QgbnNlYyA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2dldE5zZWMnLCBwYXlsb2FkOiBpbmRleCB9KTtcbiAgICBzdGF0ZS52aWV3TnNlY1ZhbHVlID0gbnNlYyB8fCAnJztcbiAgICBcbiAgICAvLyBQb3B1bGF0ZSB2aWV3XG4gICAgaWYgKGVsZW1lbnRzLnZpZXdQcm9maWxlTmFtZSkge1xuICAgICAgICBlbGVtZW50cy52aWV3UHJvZmlsZU5hbWUudGV4dENvbnRlbnQgPSBwcm9maWxlLm5hbWUgfHwgJ1VubmFtZWQnO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMudmlld05wdWIpIHtcbiAgICAgICAgZWxlbWVudHMudmlld05wdWIudGV4dENvbnRlbnQgPSBucHViIHx8ICdOb3QgYXZhaWxhYmxlJztcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLnZpZXdOc2VjKSB7XG4gICAgICAgIGVsZW1lbnRzLnZpZXdOc2VjLnRleHRDb250ZW50ID0gJ1x1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMlx1MjAyMic7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5jb3B5Vmlld05zZWNCdG4pIHtcbiAgICAgICAgZWxlbWVudHMuY29weVZpZXdOc2VjQnRuLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgIH1cbiAgICBcbiAgICBzd2l0Y2hWaWV3RGlyZWN0KCdwcm9maWxlLXZpZXcnKTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlVmlld05zZWMoKSB7XG4gICAgc3RhdGUudmlld05zZWNWaXNpYmxlID0gIXN0YXRlLnZpZXdOc2VjVmlzaWJsZTtcbiAgICBpZiAoZWxlbWVudHMudmlld05zZWMpIHtcbiAgICAgICAgZWxlbWVudHMudmlld05zZWMudGV4dENvbnRlbnQgPSBzdGF0ZS52aWV3TnNlY1Zpc2libGUgXG4gICAgICAgICAgICA/IHN0YXRlLnZpZXdOc2VjVmFsdWUgXG4gICAgICAgICAgICA6ICdcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjJcdTIwMjInO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMuY29weVZpZXdOc2VjQnRuKSB7XG4gICAgICAgIGlmIChzdGF0ZS52aWV3TnNlY1Zpc2libGUpIHtcbiAgICAgICAgICAgIGVsZW1lbnRzLmNvcHlWaWV3TnNlY0J0bi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnRzLmNvcHlWaWV3TnNlY0J0bi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gY29weVZpZXdOcHViKCkge1xuICAgIGlmIChlbGVtZW50cy52aWV3TnB1Yikge1xuICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChlbGVtZW50cy52aWV3TnB1Yi50ZXh0Q29udGVudCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBjb3B5Vmlld05zZWMoKSB7XG4gICAgaWYgKHN0YXRlLnZpZXdOc2VjVmFsdWUpIHtcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoc3RhdGUudmlld05zZWNWYWx1ZSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnb1RvRWRpdEZyb21WaWV3KCkge1xuICAgIGlmIChzdGF0ZS52aWV3aW5nUHJvZmlsZUluZGV4ICE9PSBudWxsKSB7XG4gICAgICAgIG9wZW5FZGl0UHJvZmlsZShzdGF0ZS52aWV3aW5nUHJvZmlsZUluZGV4KTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIG9wZW5FZGl0UHJvZmlsZShpbmRleCkge1xuICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBnZXRQcm9maWxlKGluZGV4KTtcbiAgICBpZiAoIXByb2ZpbGUpIHJldHVybjtcbiAgICBcbiAgICBzdGF0ZS5lZGl0aW5nUHJvZmlsZUluZGV4ID0gaW5kZXg7XG4gICAgc3RhdGUuZWRpdFByb2ZpbGVOYW1lID0gcHJvZmlsZS5uYW1lIHx8ICcnO1xuICAgIHN0YXRlLmVkaXRQcm9maWxlS2V5ID0gJyc7IC8vIERvbid0IHNob3cgZXhpc3Rpbmcga2V5IGZvciBzZWN1cml0eVxuICAgIHN0YXRlLmtleVZpc2libGUgPSBmYWxzZTtcbiAgICBzaG93UHJvZmlsZUVkaXRWaWV3KCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlTmV3S2V5KCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdHZW5lcmF0aW5nIG5ldyBrZXkuLi4nKTtcbiAgICAgICAgY29uc3QgbmV3S2V5ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnZ2VuZXJhdGVQcml2YXRlS2V5JyB9KTtcbiAgICAgICAgY29uc29sZS5sb2coJ0dlbmVyYXRlZCBrZXk6JywgbmV3S2V5ID8gJ3N1Y2Nlc3MnIDogJ2ZhaWxlZCcpO1xuICAgICAgICBpZiAobmV3S2V5ICYmIGVsZW1lbnRzLmVkaXRQcm9maWxlS2V5KSB7XG4gICAgICAgICAgICBzdGF0ZS5lZGl0UHJvZmlsZUtleSA9IG5ld0tleTtcbiAgICAgICAgICAgIGVsZW1lbnRzLmVkaXRQcm9maWxlS2V5LnZhbHVlID0gbmV3S2V5O1xuICAgICAgICAgICAgLy8gU2hvdyB0aGUga2V5IHNvIHVzZXIgY2FuIHNlZSBpdCB3YXMgZ2VuZXJhdGVkXG4gICAgICAgICAgICBzdGF0ZS5rZXlWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIGVsZW1lbnRzLmVkaXRQcm9maWxlS2V5LnR5cGUgPSAndGV4dCc7XG4gICAgICAgICAgICBzaG93UHJvZmlsZVN1Y2Nlc3MoJ0tleSBnZW5lcmF0ZWQhJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaG93UHJvZmlsZUVycm9yKCdGYWlsZWQgdG8gZ2VuZXJhdGUga2V5IC0gbm8gcmVzcG9uc2UnKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignR2VuZXJhdGUga2V5IGVycm9yOicsIGUpO1xuICAgICAgICBzaG93UHJvZmlsZUVycm9yKCdGYWlsZWQgdG8gZ2VuZXJhdGUga2V5OiAnICsgZS5tZXNzYWdlKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZUtleVZpc2liaWxpdHkoKSB7XG4gICAgc3RhdGUua2V5VmlzaWJsZSA9ICFzdGF0ZS5rZXlWaXNpYmxlO1xuICAgIGlmIChlbGVtZW50cy5lZGl0UHJvZmlsZUtleSkge1xuICAgICAgICBlbGVtZW50cy5lZGl0UHJvZmlsZUtleS50eXBlID0gc3RhdGUua2V5VmlzaWJsZSA/ICd0ZXh0JyA6ICdwYXNzd29yZCc7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBzYXZlUHJvZmlsZUNoYW5nZXMoKSB7XG4gICAgY29uc3QgbmFtZSA9IGVsZW1lbnRzLmVkaXRQcm9maWxlTmFtZT8udmFsdWU/LnRyaW0oKTtcbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgc2hvd1Byb2ZpbGVFcnJvcignUGxlYXNlIGVudGVyIGEgcHJvZmlsZSBuYW1lJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBpZiAoc3RhdGUuZWRpdGluZ1Byb2ZpbGVJbmRleCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gQ3JlYXRpbmcgbmV3IHByb2ZpbGVcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGVsZW1lbnRzLmVkaXRQcm9maWxlS2V5Py52YWx1ZT8udHJpbSgpO1xuICAgICAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgICAgICBzaG93UHJvZmlsZUVycm9yKCdQbGVhc2UgZW50ZXIgb3IgZ2VuZXJhdGUgYSBwcml2YXRlIGtleScpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgcHJvZmlsZVxuICAgICAgICAgICAgY29uc3QgbmV3SW5kZXggPSBhd2FpdCBuZXdQcm9maWxlKCk7XG4gICAgICAgICAgICBhd2FpdCBzYXZlUHJvZmlsZU5hbWUobmV3SW5kZXgsIG5hbWUpO1xuICAgICAgICAgICAgLy8gU2F2ZSB0aGUgcHJpdmF0ZSBrZXlcbiAgICAgICAgICAgIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICBraW5kOiAnc2F2ZVByaXZhdGVLZXknLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IFtuZXdJbmRleCwga2V5XVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdGF0ZS5wcm9maWxlSW5kZXggPSBuZXdJbmRleDtcbiAgICAgICAgICAgIGF3YWl0IHNldFByb2ZpbGVJbmRleChuZXdJbmRleCk7XG4gICAgICAgICAgICBzaG93UHJvZmlsZVN1Y2Nlc3MoJ1Byb2ZpbGUgY3JlYXRlZCEnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEVkaXRpbmcgZXhpc3RpbmcgcHJvZmlsZSAtIGp1c3Qgc2F2ZSBuYW1lXG4gICAgICAgICAgICBhd2FpdCBzYXZlUHJvZmlsZU5hbWUoc3RhdGUuZWRpdGluZ1Byb2ZpbGVJbmRleCwgbmFtZSk7XG4gICAgICAgICAgICBzaG93UHJvZmlsZVN1Y2Nlc3MoJ1Byb2ZpbGUgdXBkYXRlZCEnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gUmVsb2FkIGFuZCBnbyBiYWNrIHRvIGhvbWVcbiAgICAgICAgc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCBsb2FkVW5sb2NrZWRTdGF0ZSgpO1xuICAgICAgICAgICAgc3dpdGNoVmlld0RpcmVjdCgnaG9tZScpO1xuICAgICAgICB9LCA4MDApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc2hvd1Byb2ZpbGVFcnJvcignRmFpbGVkIHRvIHNhdmUgcHJvZmlsZTogJyArIGUubWVzc2FnZSk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBkZWxldGVDdXJyZW50UHJvZmlsZSgpIHtcbiAgICBpZiAoc3RhdGUuZWRpdGluZ1Byb2ZpbGVJbmRleCA9PT0gbnVsbCkgcmV0dXJuO1xuICAgIGlmIChzdGF0ZS5wcm9maWxlTmFtZXMubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgc2hvd1Byb2ZpbGVFcnJvcignQ2Fubm90IGRlbGV0ZSB0aGUgb25seSBwcm9maWxlJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgXG4gICAgaWYgKCFjb25maXJtKCdEZWxldGUgdGhpcyBwcm9maWxlPyBUaGlzIGNhbm5vdCBiZSB1bmRvbmUuJykpIHJldHVybjtcbiAgICBcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBkZWxldGVQcm9maWxlKHN0YXRlLmVkaXRpbmdQcm9maWxlSW5kZXgpO1xuICAgICAgICBzaG93UHJvZmlsZVN1Y2Nlc3MoJ1Byb2ZpbGUgZGVsZXRlZCcpO1xuICAgICAgICBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IGxvYWRVbmxvY2tlZFN0YXRlKCk7XG4gICAgICAgICAgICBzd2l0Y2hWaWV3RGlyZWN0KCdob21lJyk7XG4gICAgICAgIH0sIDgwMCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzaG93UHJvZmlsZUVycm9yKCdGYWlsZWQgdG8gZGVsZXRlIHByb2ZpbGU6ICcgKyBlLm1lc3NhZ2UpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2hvd1Byb2ZpbGVFcnJvcihtc2cpIHtcbiAgICBpZiAoZWxlbWVudHMucHJvZmlsZUVkaXRFcnJvcikge1xuICAgICAgICBlbGVtZW50cy5wcm9maWxlRWRpdEVycm9yLnRleHRDb250ZW50ID0gbXNnO1xuICAgICAgICBlbGVtZW50cy5wcm9maWxlRWRpdEVycm9yLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMucHJvZmlsZUVkaXRTdWNjZXNzKSB7XG4gICAgICAgIGVsZW1lbnRzLnByb2ZpbGVFZGl0U3VjY2Vzcy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbiAgICB9XG4gICAgLy8gQWRkIHJlZCBib3JkZXIgdG8gcHJvZmlsZSBuYW1lIGlucHV0IG9uIGVycm9yXG4gICAgaWYgKGVsZW1lbnRzLmVkaXRQcm9maWxlTmFtZSAmJiBtc2cudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygncHJvZmlsZSBuYW1lJykpIHtcbiAgICAgICAgZWxlbWVudHMuZWRpdFByb2ZpbGVOYW1lLnN0eWxlLmJvcmRlckNvbG9yID0gJyNmNDNmNWUnO1xuICAgICAgICBlbGVtZW50cy5lZGl0UHJvZmlsZU5hbWUuc3R5bGUuYm9yZGVyV2lkdGggPSAnMnB4JztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNob3dQcm9maWxlU3VjY2Vzcyhtc2cpIHtcbiAgICBpZiAoZWxlbWVudHMucHJvZmlsZUVkaXRTdWNjZXNzKSB7XG4gICAgICAgIGVsZW1lbnRzLnByb2ZpbGVFZGl0U3VjY2Vzcy50ZXh0Q29udGVudCA9IG1zZztcbiAgICAgICAgZWxlbWVudHMucHJvZmlsZUVkaXRTdWNjZXNzLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMucHJvZmlsZUVkaXRFcnJvcikge1xuICAgICAgICBlbGVtZW50cy5wcm9maWxlRWRpdEVycm9yLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgIH1cbiAgICAvLyBDbGVhciBlcnJvciBzdHlsaW5nXG4gICAgY2xlYXJQcm9maWxlRXJyb3JTdHlsaW5nKCk7XG59XG5cbmZ1bmN0aW9uIGNsZWFyUHJvZmlsZUVycm9yU3R5bGluZygpIHtcbiAgICBpZiAoZWxlbWVudHMuZWRpdFByb2ZpbGVOYW1lKSB7XG4gICAgICAgIGVsZW1lbnRzLmVkaXRQcm9maWxlTmFtZS5zdHlsZS5ib3JkZXJDb2xvciA9ICcnO1xuICAgICAgICBlbGVtZW50cy5lZGl0UHJvZmlsZU5hbWUuc3R5bGUuYm9yZGVyV2lkdGggPSAnJztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGJhY2tUb1Byb2ZpbGVzKCkge1xuICAgIHN3aXRjaFZpZXdEaXJlY3QoJ2hvbWUnKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZG9VbmxvY2soKSB7XG4gICAgY29uc3QgcGFzc3dvcmQgPSBlbGVtZW50cy51bmxvY2tQYXNzd29yZC52YWx1ZTtcbiAgICBpZiAoIXBhc3N3b3JkKSB7XG4gICAgICAgIGVsZW1lbnRzLnVubG9ja0Vycm9yLnRleHRDb250ZW50ID0gJ1BsZWFzZSBlbnRlciB5b3VyIG1hc3RlciBwYXNzd29yZC4nO1xuICAgICAgICBlbGVtZW50cy51bmxvY2tFcnJvci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3VubG9jaycsIHBheWxvYWQ6IHBhc3N3b3JkIH0pO1xuICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICBzdGF0ZS5pc0xvY2tlZCA9IGZhbHNlO1xuICAgICAgICBlbGVtZW50cy51bmxvY2tQYXNzd29yZC52YWx1ZSA9ICcnO1xuICAgICAgICBlbGVtZW50cy51bmxvY2tFcnJvci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbiAgICAgICAgYXdhaXQgbG9hZFVubG9ja2VkU3RhdGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50cy51bmxvY2tFcnJvci50ZXh0Q29udGVudCA9IHJlc3VsdC5lcnJvciB8fCAnSW52YWxpZCBwYXNzd29yZC4nO1xuICAgICAgICBlbGVtZW50cy51bmxvY2tFcnJvci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRvTG9jaygpIHtcbiAgICBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdsb2NrJyB9KTtcbiAgICBzdGF0ZS5pc0xvY2tlZCA9IHRydWU7XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVByb2ZpbGVDaGFuZ2UoKSB7XG4gICAgY29uc3QgbmV3SW5kZXggPSBwYXJzZUludChlbGVtZW50cy5wcm9maWxlU2VsZWN0LnZhbHVlLCAxMCk7XG4gICAgaWYgKG5ld0luZGV4ICE9PSBzdGF0ZS5wcm9maWxlSW5kZXgpIHtcbiAgICAgICAgc3RhdGUucHJvZmlsZUluZGV4ID0gbmV3SW5kZXg7XG4gICAgICAgIGF3YWl0IHNldFByb2ZpbGVJbmRleChzdGF0ZS5wcm9maWxlSW5kZXgpO1xuICAgICAgICBhd2FpdCBsb2FkUHJvZmlsZVR5cGUoKTtcbiAgICAgICAgYXdhaXQgY291bnRSZWxheXMoKTtcbiAgICAgICAgYXdhaXQgY2hlY2tSZWxheVJlbWluZGVyKCk7XG4gICAgICAgIGF3YWl0IGdlbmVyYXRlUXIoKTtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBjb3B5TnB1YigpIHtcbiAgICBjb25zdCBucHViID0gYXdhaXQgZ2V0TnB1YigpO1xuICAgIGlmIChuYXZpZ2F0b3IuY2xpcGJvYXJkPy53cml0ZVRleHQpIHtcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQobnB1Yik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnY29weScsIHBheWxvYWQ6IG5wdWIgfSk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBjb3B5UXJBc1BuZygpIHtcbiAgICBpZiAoIWVsZW1lbnRzLnFySW1hZ2U/LnNyYyB8fCAhc3RhdGUubnB1YlFyRGF0YVVybCkgcmV0dXJuO1xuICAgIFxuICAgIHRyeSB7XG4gICAgICAgIC8vIENyZWF0ZSBhIGNhbnZhcyB3aXRoIHByb2ZpbGUgbmFtZSArIFFSIGNvZGVcbiAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBjb25zdCBwYWRkaW5nID0gMjQ7XG4gICAgICAgIGNvbnN0IHFyU2l6ZSA9IDIwMDtcbiAgICAgICAgY29uc3QgdGl0bGVIZWlnaHQgPSA0MDtcbiAgICAgICAgXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHFyU2l6ZSArIChwYWRkaW5nICogMik7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBxclNpemUgKyB0aXRsZUhlaWdodCArIChwYWRkaW5nICogMik7XG4gICAgICAgIFxuICAgICAgICAvLyBCYWNrZ3JvdW5kXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSAnIzNlM2QzMic7XG4gICAgICAgIGN0eC5yb3VuZFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0LCAxNik7XG4gICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgIFxuICAgICAgICAvLyBQcm9maWxlIG5hbWVcbiAgICAgICAgY29uc3QgcHJvZmlsZU5hbWUgPSBzdGF0ZS5wcm9maWxlTmFtZXNbc3RhdGUucHJvZmlsZUluZGV4XSB8fCAnTm9zdHIgUHJvZmlsZSc7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSAnI2Y4ZjhmMic7XG4gICAgICAgIGN0eC5mb250ID0gJ2JvbGQgMTZweCAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIHNhbnMtc2VyaWYnO1xuICAgICAgICBjdHgudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgICAgIGN0eC5maWxsVGV4dChwcm9maWxlTmFtZSwgY2FudmFzLndpZHRoIC8gMiwgcGFkZGluZyArIDIwKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFFSIGNvZGUgLSB1c2UgZXhpc3RpbmcgaW1nIGVsZW1lbnQgZGlyZWN0bHkgKGF2b2lkcyBDU1AgZmV0Y2ggaXNzdWVzKVxuICAgICAgICBjb25zdCBxckltZyA9IGVsZW1lbnRzLnFySW1hZ2U7XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UocXJJbWcsIHBhZGRpbmcsIHBhZGRpbmcgKyB0aXRsZUhlaWdodCwgcXJTaXplLCBxclNpemUpO1xuICAgICAgICBcbiAgICAgICAgLy8gQ29udmVydCB0byBibG9iXG4gICAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IGNhbnZhcy50b0Jsb2IocmVzb2x2ZSwgJ2ltYWdlL3BuZycpKTtcbiAgICAgICAgXG4gICAgICAgIC8vIENvcHkgdG8gY2xpcGJvYXJkXG4gICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGUoW1xuICAgICAgICAgICAgbmV3IENsaXBib2FyZEl0ZW0oeyAnaW1hZ2UvcG5nJzogYmxvYiB9KVxuICAgICAgICBdKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFZpc3VhbCBmZWVkYmFja1xuICAgICAgICBjb25zdCBidG4gPSBlbGVtZW50cy5jb3B5UXJQbmdCdG47XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsVGV4dCA9IGJ0bi50ZXh0Q29udGVudDtcbiAgICAgICAgYnRuLnRleHRDb250ZW50ID0gJ0NvcGllZCEnO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsgYnRuLnRleHRDb250ZW50ID0gb3JpZ2luYWxUZXh0OyB9LCAxNTAwKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjb3B5IFFSIGFzIFBORzonLCBlKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFkZFJlbGF5cygpIHtcbiAgICBjb25zdCByZWxheXMgPSBSRUNPTU1FTkRFRF9SRUxBWVMubWFwKHIgPT4gKHsgdXJsOiByLmhyZWYsIHJlYWQ6IHRydWUsIHdyaXRlOiB0cnVlIH0pKTtcbiAgICBhd2FpdCBzYXZlUmVsYXlzKHN0YXRlLnByb2ZpbGVJbmRleCwgcmVsYXlzKTtcbiAgICBhd2FpdCBjb3VudFJlbGF5cygpO1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBub1RoYW5rcygpIHtcbiAgICBhd2FpdCB0b2dnbGVSZWxheVJlbWluZGVyKCk7XG4gICAgc3RhdGUuc2hvd1JlbGF5UmVtaW5kZXIgPSBmYWxzZTtcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gb3Blbk9wdGlvbnMoKSB7XG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG59XG5cbmZ1bmN0aW9uIG9wZW5VcmwocGF0aCkge1xuICAgIGNvbnN0IHVybCA9IGFwaS5ydW50aW1lLmdldFVSTChwYXRoKTtcbiAgICAvLyBVc2UgbmFtZWQgd2luZG93IHRhcmdldCBzbyBhbGwgb3B0aW9ucyBwYWdlcyBvcGVuIGluIHRoZSBzYW1lIHRhYlxuICAgIHdpbmRvdy5vcGVuKHVybCwgJ25vc3Rya2V5LW9wdGlvbnMnKTtcbn1cblxuLy8gVGFiIG5hdmlnYXRpb25cbmZ1bmN0aW9uIHN3aXRjaFZpZXcodmlld05hbWUpIHtcbiAgICBzdGF0ZS5jdXJyZW50VmlldyA9IHZpZXdOYW1lO1xuICAgIC8vIFVwZGF0ZSB0YWIgYnV0dG9uc1xuICAgIGVsZW1lbnRzLnRhYkJ0bnMuZm9yRWFjaChidG4gPT4ge1xuICAgICAgICBpZiAoYnRuLmRhdGFzZXQudmlldyA9PT0gdmlld05hbWUpIHtcbiAgICAgICAgICAgIGJ0bi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIC8vIFVwZGF0ZSB2aWV3IHNlY3Rpb25zXG4gICAgZWxlbWVudHMudmlld1NlY3Rpb25zLmZvckVhY2goc2VjdGlvbiA9PiB7XG4gICAgICAgIGlmIChzZWN0aW9uLmlkID09PSBgdmlldy0ke3ZpZXdOYW1lfWApIHtcbiAgICAgICAgICAgIHNlY3Rpb24uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgLy8gTG9hZCB2aWV3LXNwZWNpZmljIGRhdGFcbiAgICBpZiAodmlld05hbWUgPT09ICdyZWxheXMnKSBsb2FkUmVsYXlzVmlldygpO1xuICAgIGlmICh2aWV3TmFtZSA9PT0gJ3Blcm1pc3Npb25zJykgbG9hZFBlcm1pc3Npb25zVmlldygpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkUmVsYXlzVmlldygpIHtcbiAgICBzdGF0ZS5yZWxheXMgPSBhd2FpdCBnZXRSZWxheXMoc3RhdGUucHJvZmlsZUluZGV4KTtcbiAgICByZW5kZXJSZWxheUxpc3QoKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUmVsYXlMaXN0KCkge1xuICAgIGlmICghZWxlbWVudHMucmVsYXlMaXN0KSByZXR1cm47XG4gICAgaWYgKHN0YXRlLnJlbGF5cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgZWxlbWVudHMucmVsYXlMaXN0LmlubmVySFRNTCA9ICc8cCBzdHlsZT1cImNvbG9yOiM4ZjkwOGE7Zm9udC1zdHlsZTppdGFsaWM7XCI+Tm8gcmVsYXlzIGNvbmZpZ3VyZWQuPC9wPic7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWxlbWVudHMucmVsYXlMaXN0LmlubmVySFRNTCA9IHN0YXRlLnJlbGF5cy5tYXAoKHJlbGF5LCBpKSA9PiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweS0yXCIgc3R5bGU9XCJib3JkZXItYm90dG9tOjFweCBzb2xpZCAjNDk0ODNlO1wiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmbGV4LTEgdGV4dC1zbVwiIHN0eWxlPVwiY29sb3I6I2Y4ZjhmMjt3b3JkLWJyZWFrOmJyZWFrLWFsbDtcIj4ke3JlbGF5LnVybH08L3NwYW4+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnV0dG9uIHJlbGF5LWRlbGV0ZS1idG5cIiBkYXRhLWluZGV4PVwiJHtpfVwiIHN0eWxlPVwibWluLXdpZHRoOmF1dG87cGFkZGluZzo2cHggMTBweDtmb250LXNpemU6MTJweDtcIj5EZWxldGU8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgYCkuam9pbignJyk7XG4gICAgLy8gQmluZCBkZWxldGUgYnV0dG9uc1xuICAgIGVsZW1lbnRzLnJlbGF5TGlzdC5xdWVyeVNlbGVjdG9yQWxsKCcucmVsYXktZGVsZXRlLWJ0bicpLmZvckVhY2goYnRuID0+IHtcbiAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaWR4ID0gcGFyc2VJbnQoYnRuLmRhdGFzZXQuaW5kZXgsIDEwKTtcbiAgICAgICAgICAgIHN0YXRlLnJlbGF5cy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgICAgIGF3YWl0IHNhdmVSZWxheXMoc3RhdGUucHJvZmlsZUluZGV4LCBzdGF0ZS5yZWxheXMpO1xuICAgICAgICAgICAgcmVuZGVyUmVsYXlMaXN0KCk7XG4gICAgICAgICAgICBhd2FpdCBjb3VudFJlbGF5cygpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gYWRkU2luZ2xlUmVsYXkoKSB7XG4gICAgY29uc3QgdXJsID0gZWxlbWVudHMubmV3UmVsYXlJbnB1dD8udmFsdWU/LnRyaW0oKTtcbiAgICBpZiAoIXVybCB8fCAhdXJsLnN0YXJ0c1dpdGgoJ3dzczovLycpKSByZXR1cm47XG4gICAgc3RhdGUucmVsYXlzLnB1c2goeyB1cmwsIHJlYWQ6IHRydWUsIHdyaXRlOiB0cnVlIH0pO1xuICAgIGF3YWl0IHNhdmVSZWxheXMoc3RhdGUucHJvZmlsZUluZGV4LCBzdGF0ZS5yZWxheXMpO1xuICAgIGVsZW1lbnRzLm5ld1JlbGF5SW5wdXQudmFsdWUgPSAnJztcbiAgICByZW5kZXJSZWxheUxpc3QoKTtcbiAgICBhd2FpdCBjb3VudFJlbGF5cygpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkUGVybWlzc2lvbnNWaWV3KCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHBlcm1zID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnZ2V0UGVybWlzc2lvbnMnIH0pO1xuICAgICAgICBzdGF0ZS5wZXJtaXNzaW9ucyA9IHBlcm1zIHx8IFtdO1xuICAgICAgICByZW5kZXJQZXJtaXNzaW9uc0xpc3QoKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgc3RhdGUucGVybWlzc2lvbnMgPSBbXTtcbiAgICAgICAgcmVuZGVyUGVybWlzc2lvbnNMaXN0KCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJQZXJtaXNzaW9uc0xpc3QoKSB7XG4gICAgaWYgKCFlbGVtZW50cy5wZXJtaXNzaW9uc0xpc3QpIHJldHVybjtcbiAgICBpZiAoc3RhdGUucGVybWlzc2lvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGVsZW1lbnRzLnBlcm1pc3Npb25zTGlzdC5pbm5lckhUTUwgPSAnPHAgc3R5bGU9XCJjb2xvcjojOGY5MDhhO2ZvbnQtc3R5bGU6aXRhbGljO1wiPk5vIHBlcm1pc3Npb25zIGdyYW50ZWQgeWV0LjwvcD4nO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsZW1lbnRzLnBlcm1pc3Npb25zTGlzdC5pbm5lckhUTUwgPSBzdGF0ZS5wZXJtaXNzaW9ucy5tYXAocCA9PiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcHktMlwiIHN0eWxlPVwiYm9yZGVyLWJvdHRvbToxcHggc29saWQgIzQ5NDgzZTtcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC1zbVwiIHN0eWxlPVwiY29sb3I6I2Y4ZjhmMjtcIj4ke3AuaG9zdCB8fCBwLm9yaWdpbiB8fCAnVW5rbm93bid9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXhzXCIgc3R5bGU9XCJjb2xvcjojOGY5MDhhO1wiPiR7cC5sZXZlbCB8fCAnZ3JhbnRlZCd9PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICBgKS5qb2luKCcnKTtcbn1cblxuLy8gRXZlbnQgYmluZGluZ3NcbmZ1bmN0aW9uIGJpbmRFdmVudHMoKSB7XG4gICAgZWxlbWVudHMudW5sb2NrRm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBhc3luYyAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGF3YWl0IGRvVW5sb2NrKCk7XG4gICAgfSk7XG5cbiAgICBlbGVtZW50cy5sb2NrQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZG9Mb2NrKTtcbiAgICBlbGVtZW50cy5jb3B5TnB1YkJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNvcHlOcHViKTtcbiAgICBlbGVtZW50cy5hZGRSZWxheXNCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhZGRSZWxheXMpO1xuICAgIGVsZW1lbnRzLm5vVGhhbmtzQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbm9UaGFua3MpO1xuICAgIFxuICAgIC8vIENvcHkgUVIgYXMgUE5HXG4gICAgaWYgKGVsZW1lbnRzLmNvcHlRclBuZ0J0bikge1xuICAgICAgICBlbGVtZW50cy5jb3B5UXJQbmdCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjb3B5UXJBc1BuZyk7XG4gICAgfVxuICAgIFxuICAgIC8vIEFkZCBwcm9maWxlIGJ1dHRvblxuICAgIGlmIChlbGVtZW50cy5hZGRQcm9maWxlQnRuKSB7XG4gICAgICAgIGVsZW1lbnRzLmFkZFByb2ZpbGVCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvcGVuQWRkUHJvZmlsZSk7XG4gICAgfVxuXG4gICAgLy8gUHJvZmlsZSB2aWV3IChyZWFkLW9ubHkpXG4gICAgaWYgKGVsZW1lbnRzLmJhY2tGcm9tVmlld0J0bikge1xuICAgICAgICBlbGVtZW50cy5iYWNrRnJvbVZpZXdCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzd2l0Y2hWaWV3RGlyZWN0KCdob21lJykpO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMuZWRpdFByb2ZpbGVCdG4pIHtcbiAgICAgICAgZWxlbWVudHMuZWRpdFByb2ZpbGVCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBnb1RvRWRpdEZyb21WaWV3KTtcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLmNvcHlWaWV3TnB1YkJ0bikge1xuICAgICAgICBlbGVtZW50cy5jb3B5Vmlld05wdWJCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjb3B5Vmlld05wdWIpO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMuY29weVZpZXdOc2VjQnRuKSB7XG4gICAgICAgIGVsZW1lbnRzLmNvcHlWaWV3TnNlY0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNvcHlWaWV3TnNlYyk7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy50b2dnbGVWaWV3TnNlY0J0bikge1xuICAgICAgICBlbGVtZW50cy50b2dnbGVWaWV3TnNlY0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZVZpZXdOc2VjKTtcbiAgICB9XG5cbiAgICAvLyBQcm9maWxlIGVkaXQgdmlld1xuICAgIGlmIChlbGVtZW50cy5iYWNrVG9Qcm9maWxlc0J0bikge1xuICAgICAgICBlbGVtZW50cy5iYWNrVG9Qcm9maWxlc0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGJhY2tUb1Byb2ZpbGVzKTtcbiAgICB9XG4gICAgaWYgKGVsZW1lbnRzLmdlbmVyYXRlS2V5QnRuKSB7XG4gICAgICAgIGVsZW1lbnRzLmdlbmVyYXRlS2V5QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZ2VuZXJhdGVOZXdLZXkpO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMudG9nZ2xlS2V5VmlzaWJpbGl0eSkge1xuICAgICAgICBlbGVtZW50cy50b2dnbGVLZXlWaXNpYmlsaXR5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9nZ2xlS2V5VmlzaWJpbGl0eSk7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5zYXZlUHJvZmlsZUJ0bikge1xuICAgICAgICBlbGVtZW50cy5zYXZlUHJvZmlsZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNhdmVQcm9maWxlQ2hhbmdlcyk7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5kZWxldGVQcm9maWxlQnRuKSB7XG4gICAgICAgIGVsZW1lbnRzLmRlbGV0ZVByb2ZpbGVCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkZWxldGVDdXJyZW50UHJvZmlsZSk7XG4gICAgfVxuICAgIC8vIENsZWFyIGVycm9yIHN0eWxpbmcgd2hlbiB1c2VyIHR5cGVzIGluIHByb2ZpbGUgbmFtZVxuICAgIGlmIChlbGVtZW50cy5lZGl0UHJvZmlsZU5hbWUpIHtcbiAgICAgICAgZWxlbWVudHMuZWRpdFByb2ZpbGVOYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgY2xlYXJQcm9maWxlRXJyb3JTdHlsaW5nKTtcbiAgICB9XG5cbiAgICAvLyBUYWIgbmF2aWdhdGlvblxuICAgIGVsZW1lbnRzLnRhYkJ0bnMuZm9yRWFjaChidG4gPT4ge1xuICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzd2l0Y2hWaWV3KGJ0bi5kYXRhc2V0LnZpZXcpKTtcbiAgICB9KTtcblxuICAgIC8vIFJlbGF5cyB2aWV3XG4gICAgaWYgKGVsZW1lbnRzLmFkZFJlbGF5QnRuKSB7XG4gICAgICAgIGVsZW1lbnRzLmFkZFJlbGF5QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYWRkU2luZ2xlUmVsYXkpO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMubmV3UmVsYXlJbnB1dCkge1xuICAgICAgICBlbGVtZW50cy5uZXdSZWxheUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgKGUpID0+IHtcbiAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykgYWRkU2luZ2xlUmVsYXkoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gU2V0dGluZ3MgdmlldyBidXR0b25zXG4gICAgaWYgKGVsZW1lbnRzLm9wZW5TZXR0aW5nc0J0bikge1xuICAgICAgICBlbGVtZW50cy5vcGVuU2V0dGluZ3NCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvcGVuT3B0aW9ucyk7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5vcGVuSGlzdG9yeUJ0bikge1xuICAgICAgICBlbGVtZW50cy5vcGVuSGlzdG9yeUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IG9wZW5VcmwoJ2V2ZW50X2hpc3RvcnkvZXZlbnRfaGlzdG9yeS5odG1sJykpO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMub3BlbkV4cGVyaW1lbnRhbEJ0bikge1xuICAgICAgICBlbGVtZW50cy5vcGVuRXhwZXJpbWVudGFsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gb3BlblVybCgnZXhwZXJpbWVudGFsL2V4cGVyaW1lbnRhbC5odG1sJykpO1xuICAgIH1cbiAgICBpZiAoZWxlbWVudHMub3BlblZhdWx0QnRuKSB7XG4gICAgICAgIGVsZW1lbnRzLm9wZW5WYXVsdEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IG9wZW5VcmwoJ3ZhdWx0L3ZhdWx0Lmh0bWwnKSk7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5vcGVuQXBpa2V5c0J0bikge1xuICAgICAgICBlbGVtZW50cy5vcGVuQXBpa2V5c0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IG9wZW5VcmwoJ2FwaS1rZXlzL2FwaS1rZXlzLmh0bWwnKSk7XG4gICAgfVxufVxuXG4vLyBJbml0aWFsaXplXG5hc3luYyBmdW5jdGlvbiBpbml0KCkge1xuICAgIGNvbnNvbGUubG9nKCdOb3N0cktleSBTaWRlIFBhbmVsIGluaXRpYWxpemluZy4uLicpO1xuICAgIGluaXRFbGVtZW50cygpO1xuICAgIGJpbmRFdmVudHMoKTtcblxuICAgIGF3YWl0IGluaXRpYWxpemUoKTtcblxuICAgIHN0YXRlLmhhc1Bhc3N3b3JkID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnaXNFbmNyeXB0ZWQnIH0pO1xuICAgIHN0YXRlLmlzTG9ja2VkID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnaXNMb2NrZWQnIH0pO1xuXG4gICAgaWYgKCFzdGF0ZS5pc0xvY2tlZCkge1xuICAgICAgICBhd2FpdCBsb2FkVW5sb2NrZWRTdGF0ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH1cbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXQpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFJQSxhQUFPLFVBQVUsV0FBWTtBQUMzQixlQUFPLE9BQU8sWUFBWSxjQUFjLFFBQVEsYUFBYSxRQUFRLFVBQVU7QUFBQSxNQUNqRjtBQUFBO0FBQUE7OztBQ05BO0FBQUE7QUFBQSxVQUFJO0FBQ0osVUFBTSxrQkFBa0I7QUFBQSxRQUN0QjtBQUFBO0FBQUEsUUFDQTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQzFDO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDN0M7QUFBQSxRQUFNO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxRQUFNO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxRQUFNO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxRQUN0RDtBQUFBLFFBQU07QUFBQSxRQUFNO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxRQUFNO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxRQUFNO0FBQUEsUUFBTTtBQUFBLE1BQ3hEO0FBUUEsY0FBUSxnQkFBZ0IsU0FBUyxjQUFlLFNBQVM7QUFDdkQsWUFBSSxDQUFDLFFBQVMsT0FBTSxJQUFJLE1BQU0sdUNBQXVDO0FBQ3JFLFlBQUksVUFBVSxLQUFLLFVBQVUsR0FBSSxPQUFNLElBQUksTUFBTSwyQ0FBMkM7QUFDNUYsZUFBTyxVQUFVLElBQUk7QUFBQSxNQUN2QjtBQVFBLGNBQVEsMEJBQTBCLFNBQVMsd0JBQXlCLFNBQVM7QUFDM0UsZUFBTyxnQkFBZ0IsT0FBTztBQUFBLE1BQ2hDO0FBUUEsY0FBUSxjQUFjLFNBQVUsTUFBTTtBQUNwQyxZQUFJLFFBQVE7QUFFWixlQUFPLFNBQVMsR0FBRztBQUNqQjtBQUNBLG9CQUFVO0FBQUEsUUFDWjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBRUEsY0FBUSxvQkFBb0IsU0FBUyxrQkFBbUIsR0FBRztBQUN6RCxZQUFJLE9BQU8sTUFBTSxZQUFZO0FBQzNCLGdCQUFNLElBQUksTUFBTSx1Q0FBdUM7QUFBQSxRQUN6RDtBQUVBLHlCQUFpQjtBQUFBLE1BQ25CO0FBRUEsY0FBUSxxQkFBcUIsV0FBWTtBQUN2QyxlQUFPLE9BQU8sbUJBQW1CO0FBQUEsTUFDbkM7QUFFQSxjQUFRLFNBQVMsU0FBUyxPQUFRLE9BQU87QUFDdkMsZUFBTyxlQUFlLEtBQUs7QUFBQSxNQUM3QjtBQUFBO0FBQUE7OztBQzlEQTtBQUFBO0FBQUEsY0FBUSxJQUFJLEVBQUUsS0FBSyxFQUFFO0FBQ3JCLGNBQVEsSUFBSSxFQUFFLEtBQUssRUFBRTtBQUNyQixjQUFRLElBQUksRUFBRSxLQUFLLEVBQUU7QUFDckIsY0FBUSxJQUFJLEVBQUUsS0FBSyxFQUFFO0FBRXJCLGVBQVMsV0FBWSxRQUFRO0FBQzNCLFlBQUksT0FBTyxXQUFXLFVBQVU7QUFDOUIsZ0JBQU0sSUFBSSxNQUFNLHVCQUF1QjtBQUFBLFFBQ3pDO0FBRUEsY0FBTSxRQUFRLE9BQU8sWUFBWTtBQUVqQyxnQkFBUSxPQUFPO0FBQUEsVUFDYixLQUFLO0FBQUEsVUFDTCxLQUFLO0FBQ0gsbUJBQU8sUUFBUTtBQUFBLFVBRWpCLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFDSCxtQkFBTyxRQUFRO0FBQUEsVUFFakIsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUNILG1CQUFPLFFBQVE7QUFBQSxVQUVqQixLQUFLO0FBQUEsVUFDTCxLQUFLO0FBQ0gsbUJBQU8sUUFBUTtBQUFBLFVBRWpCO0FBQ0Usa0JBQU0sSUFBSSxNQUFNLHVCQUF1QixNQUFNO0FBQUEsUUFDakQ7QUFBQSxNQUNGO0FBRUEsY0FBUSxVQUFVLFNBQVMsUUFBUyxPQUFPO0FBQ3pDLGVBQU8sU0FBUyxPQUFPLE1BQU0sUUFBUSxlQUNuQyxNQUFNLE9BQU8sS0FBSyxNQUFNLE1BQU07QUFBQSxNQUNsQztBQUVBLGNBQVEsT0FBTyxTQUFTLEtBQU0sT0FBTyxjQUFjO0FBQ2pELFlBQUksUUFBUSxRQUFRLEtBQUssR0FBRztBQUMxQixpQkFBTztBQUFBLFFBQ1Q7QUFFQSxZQUFJO0FBQ0YsaUJBQU8sV0FBVyxLQUFLO0FBQUEsUUFDekIsU0FBUyxHQUFHO0FBQ1YsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUFBO0FBQUE7OztBQ2pEQTtBQUFBO0FBQUEsZUFBUyxZQUFhO0FBQ3BCLGFBQUssU0FBUyxDQUFDO0FBQ2YsYUFBSyxTQUFTO0FBQUEsTUFDaEI7QUFFQSxnQkFBVSxZQUFZO0FBQUEsUUFFcEIsS0FBSyxTQUFVLE9BQU87QUFDcEIsZ0JBQU0sV0FBVyxLQUFLLE1BQU0sUUFBUSxDQUFDO0FBQ3JDLGtCQUFTLEtBQUssT0FBTyxRQUFRLE1BQU8sSUFBSSxRQUFRLElBQU0sT0FBTztBQUFBLFFBQy9EO0FBQUEsUUFFQSxLQUFLLFNBQVUsS0FBSyxRQUFRO0FBQzFCLG1CQUFTLElBQUksR0FBRyxJQUFJLFFBQVEsS0FBSztBQUMvQixpQkFBSyxRQUFTLFFBQVMsU0FBUyxJQUFJLElBQU0sT0FBTyxDQUFDO0FBQUEsVUFDcEQ7QUFBQSxRQUNGO0FBQUEsUUFFQSxpQkFBaUIsV0FBWTtBQUMzQixpQkFBTyxLQUFLO0FBQUEsUUFDZDtBQUFBLFFBRUEsUUFBUSxTQUFVLEtBQUs7QUFDckIsZ0JBQU0sV0FBVyxLQUFLLE1BQU0sS0FBSyxTQUFTLENBQUM7QUFDM0MsY0FBSSxLQUFLLE9BQU8sVUFBVSxVQUFVO0FBQ2xDLGlCQUFLLE9BQU8sS0FBSyxDQUFDO0FBQUEsVUFDcEI7QUFFQSxjQUFJLEtBQUs7QUFDUCxpQkFBSyxPQUFPLFFBQVEsS0FBTSxRQUFVLEtBQUssU0FBUztBQUFBLFVBQ3BEO0FBRUEsZUFBSztBQUFBLFFBQ1A7QUFBQSxNQUNGO0FBRUEsYUFBTyxVQUFVO0FBQUE7QUFBQTs7O0FDcENqQjtBQUFBO0FBS0EsZUFBUyxVQUFXLE1BQU07QUFDeEIsWUFBSSxDQUFDLFFBQVEsT0FBTyxHQUFHO0FBQ3JCLGdCQUFNLElBQUksTUFBTSxtREFBbUQ7QUFBQSxRQUNyRTtBQUVBLGFBQUssT0FBTztBQUNaLGFBQUssT0FBTyxJQUFJLFdBQVcsT0FBTyxJQUFJO0FBQ3RDLGFBQUssY0FBYyxJQUFJLFdBQVcsT0FBTyxJQUFJO0FBQUEsTUFDL0M7QUFXQSxnQkFBVSxVQUFVLE1BQU0sU0FBVSxLQUFLLEtBQUssT0FBTyxVQUFVO0FBQzdELGNBQU0sUUFBUSxNQUFNLEtBQUssT0FBTztBQUNoQyxhQUFLLEtBQUssS0FBSyxJQUFJO0FBQ25CLFlBQUksU0FBVSxNQUFLLFlBQVksS0FBSyxJQUFJO0FBQUEsTUFDMUM7QUFTQSxnQkFBVSxVQUFVLE1BQU0sU0FBVSxLQUFLLEtBQUs7QUFDNUMsZUFBTyxLQUFLLEtBQUssTUFBTSxLQUFLLE9BQU8sR0FBRztBQUFBLE1BQ3hDO0FBVUEsZ0JBQVUsVUFBVSxNQUFNLFNBQVUsS0FBSyxLQUFLLE9BQU87QUFDbkQsYUFBSyxLQUFLLE1BQU0sS0FBSyxPQUFPLEdBQUcsS0FBSztBQUFBLE1BQ3RDO0FBU0EsZ0JBQVUsVUFBVSxhQUFhLFNBQVUsS0FBSyxLQUFLO0FBQ25ELGVBQU8sS0FBSyxZQUFZLE1BQU0sS0FBSyxPQUFPLEdBQUc7QUFBQSxNQUMvQztBQUVBLGFBQU8sVUFBVTtBQUFBO0FBQUE7OztBQ2hFakI7QUFBQTtBQVVBLFVBQU0sZ0JBQWdCLGdCQUFtQjtBQWdCekMsY0FBUSxrQkFBa0IsU0FBUyxnQkFBaUIsU0FBUztBQUMzRCxZQUFJLFlBQVksRUFBRyxRQUFPLENBQUM7QUFFM0IsY0FBTSxXQUFXLEtBQUssTUFBTSxVQUFVLENBQUMsSUFBSTtBQUMzQyxjQUFNLE9BQU8sY0FBYyxPQUFPO0FBQ2xDLGNBQU0sWUFBWSxTQUFTLE1BQU0sS0FBSyxLQUFLLE1BQU0sT0FBTyxPQUFPLElBQUksV0FBVyxFQUFFLElBQUk7QUFDcEYsY0FBTSxZQUFZLENBQUMsT0FBTyxDQUFDO0FBRTNCLGlCQUFTLElBQUksR0FBRyxJQUFJLFdBQVcsR0FBRyxLQUFLO0FBQ3JDLG9CQUFVLENBQUMsSUFBSSxVQUFVLElBQUksQ0FBQyxJQUFJO0FBQUEsUUFDcEM7QUFFQSxrQkFBVSxLQUFLLENBQUM7QUFFaEIsZUFBTyxVQUFVLFFBQVE7QUFBQSxNQUMzQjtBQXNCQSxjQUFRLGVBQWUsU0FBUyxhQUFjLFNBQVM7QUFDckQsY0FBTSxTQUFTLENBQUM7QUFDaEIsY0FBTSxNQUFNLFFBQVEsZ0JBQWdCLE9BQU87QUFDM0MsY0FBTSxZQUFZLElBQUk7QUFFdEIsaUJBQVMsSUFBSSxHQUFHLElBQUksV0FBVyxLQUFLO0FBQ2xDLG1CQUFTLElBQUksR0FBRyxJQUFJLFdBQVcsS0FBSztBQUVsQyxnQkFBSyxNQUFNLEtBQUssTUFBTTtBQUFBLFlBQ2pCLE1BQU0sS0FBSyxNQUFNLFlBQVk7QUFBQSxZQUM3QixNQUFNLFlBQVksS0FBSyxNQUFNLEdBQUk7QUFDcEM7QUFBQSxZQUNGO0FBRUEsbUJBQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFBQSxVQUM5QjtBQUFBLFFBQ0Y7QUFFQSxlQUFPO0FBQUEsTUFDVDtBQUFBO0FBQUE7OztBQ2xGQTtBQUFBO0FBQUEsVUFBTSxnQkFBZ0IsZ0JBQW1CO0FBQ3pDLFVBQU0sc0JBQXNCO0FBUzVCLGNBQVEsZUFBZSxTQUFTLGFBQWMsU0FBUztBQUNyRCxjQUFNLE9BQU8sY0FBYyxPQUFPO0FBRWxDLGVBQU87QUFBQTtBQUFBLFVBRUwsQ0FBQyxHQUFHLENBQUM7QUFBQTtBQUFBLFVBRUwsQ0FBQyxPQUFPLHFCQUFxQixDQUFDO0FBQUE7QUFBQSxVQUU5QixDQUFDLEdBQUcsT0FBTyxtQkFBbUI7QUFBQSxRQUNoQztBQUFBLE1BQ0Y7QUFBQTtBQUFBOzs7QUNyQkE7QUFBQTtBQUlBLGNBQVEsV0FBVztBQUFBLFFBQ2pCLFlBQVk7QUFBQSxRQUNaLFlBQVk7QUFBQSxRQUNaLFlBQVk7QUFBQSxRQUNaLFlBQVk7QUFBQSxRQUNaLFlBQVk7QUFBQSxRQUNaLFlBQVk7QUFBQSxRQUNaLFlBQVk7QUFBQSxRQUNaLFlBQVk7QUFBQSxNQUNkO0FBTUEsVUFBTSxnQkFBZ0I7QUFBQSxRQUNwQixJQUFJO0FBQUEsUUFDSixJQUFJO0FBQUEsUUFDSixJQUFJO0FBQUEsUUFDSixJQUFJO0FBQUEsTUFDTjtBQVFBLGNBQVEsVUFBVSxTQUFTLFFBQVMsTUFBTTtBQUN4QyxlQUFPLFFBQVEsUUFBUSxTQUFTLE1BQU0sQ0FBQyxNQUFNLElBQUksS0FBSyxRQUFRLEtBQUssUUFBUTtBQUFBLE1BQzdFO0FBU0EsY0FBUSxPQUFPLFNBQVMsS0FBTSxPQUFPO0FBQ25DLGVBQU8sUUFBUSxRQUFRLEtBQUssSUFBSSxTQUFTLE9BQU8sRUFBRSxJQUFJO0FBQUEsTUFDeEQ7QUFTQSxjQUFRLGVBQWUsU0FBUyxhQUFjLE1BQU07QUFDbEQsY0FBTSxPQUFPLEtBQUs7QUFDbEIsWUFBSSxTQUFTO0FBQ2IsWUFBSSxlQUFlO0FBQ25CLFlBQUksZUFBZTtBQUNuQixZQUFJLFVBQVU7QUFDZCxZQUFJLFVBQVU7QUFFZCxpQkFBUyxNQUFNLEdBQUcsTUFBTSxNQUFNLE9BQU87QUFDbkMseUJBQWUsZUFBZTtBQUM5QixvQkFBVSxVQUFVO0FBRXBCLG1CQUFTLE1BQU0sR0FBRyxNQUFNLE1BQU0sT0FBTztBQUNuQyxnQkFBSUEsVUFBUyxLQUFLLElBQUksS0FBSyxHQUFHO0FBQzlCLGdCQUFJQSxZQUFXLFNBQVM7QUFDdEI7QUFBQSxZQUNGLE9BQU87QUFDTCxrQkFBSSxnQkFBZ0IsRUFBRyxXQUFVLGNBQWMsTUFBTSxlQUFlO0FBQ3BFLHdCQUFVQTtBQUNWLDZCQUFlO0FBQUEsWUFDakI7QUFFQSxZQUFBQSxVQUFTLEtBQUssSUFBSSxLQUFLLEdBQUc7QUFDMUIsZ0JBQUlBLFlBQVcsU0FBUztBQUN0QjtBQUFBLFlBQ0YsT0FBTztBQUNMLGtCQUFJLGdCQUFnQixFQUFHLFdBQVUsY0FBYyxNQUFNLGVBQWU7QUFDcEUsd0JBQVVBO0FBQ1YsNkJBQWU7QUFBQSxZQUNqQjtBQUFBLFVBQ0Y7QUFFQSxjQUFJLGdCQUFnQixFQUFHLFdBQVUsY0FBYyxNQUFNLGVBQWU7QUFDcEUsY0FBSSxnQkFBZ0IsRUFBRyxXQUFVLGNBQWMsTUFBTSxlQUFlO0FBQUEsUUFDdEU7QUFFQSxlQUFPO0FBQUEsTUFDVDtBQU9BLGNBQVEsZUFBZSxTQUFTLGFBQWMsTUFBTTtBQUNsRCxjQUFNLE9BQU8sS0FBSztBQUNsQixZQUFJLFNBQVM7QUFFYixpQkFBUyxNQUFNLEdBQUcsTUFBTSxPQUFPLEdBQUcsT0FBTztBQUN2QyxtQkFBUyxNQUFNLEdBQUcsTUFBTSxPQUFPLEdBQUcsT0FBTztBQUN2QyxrQkFBTSxPQUFPLEtBQUssSUFBSSxLQUFLLEdBQUcsSUFDNUIsS0FBSyxJQUFJLEtBQUssTUFBTSxDQUFDLElBQ3JCLEtBQUssSUFBSSxNQUFNLEdBQUcsR0FBRyxJQUNyQixLQUFLLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUUzQixnQkFBSSxTQUFTLEtBQUssU0FBUyxFQUFHO0FBQUEsVUFDaEM7QUFBQSxRQUNGO0FBRUEsZUFBTyxTQUFTLGNBQWM7QUFBQSxNQUNoQztBQVFBLGNBQVEsZUFBZSxTQUFTLGFBQWMsTUFBTTtBQUNsRCxjQUFNLE9BQU8sS0FBSztBQUNsQixZQUFJLFNBQVM7QUFDYixZQUFJLFVBQVU7QUFDZCxZQUFJLFVBQVU7QUFFZCxpQkFBUyxNQUFNLEdBQUcsTUFBTSxNQUFNLE9BQU87QUFDbkMsb0JBQVUsVUFBVTtBQUNwQixtQkFBUyxNQUFNLEdBQUcsTUFBTSxNQUFNLE9BQU87QUFDbkMsc0JBQVksV0FBVyxJQUFLLE9BQVMsS0FBSyxJQUFJLEtBQUssR0FBRztBQUN0RCxnQkFBSSxPQUFPLE9BQU8sWUFBWSxRQUFTLFlBQVksSUFBUTtBQUUzRCxzQkFBWSxXQUFXLElBQUssT0FBUyxLQUFLLElBQUksS0FBSyxHQUFHO0FBQ3RELGdCQUFJLE9BQU8sT0FBTyxZQUFZLFFBQVMsWUFBWSxJQUFRO0FBQUEsVUFDN0Q7QUFBQSxRQUNGO0FBRUEsZUFBTyxTQUFTLGNBQWM7QUFBQSxNQUNoQztBQVVBLGNBQVEsZUFBZSxTQUFTLGFBQWMsTUFBTTtBQUNsRCxZQUFJLFlBQVk7QUFDaEIsY0FBTSxlQUFlLEtBQUssS0FBSztBQUUvQixpQkFBUyxJQUFJLEdBQUcsSUFBSSxjQUFjLElBQUssY0FBYSxLQUFLLEtBQUssQ0FBQztBQUUvRCxjQUFNLElBQUksS0FBSyxJQUFJLEtBQUssS0FBTSxZQUFZLE1BQU0sZUFBZ0IsQ0FBQyxJQUFJLEVBQUU7QUFFdkUsZUFBTyxJQUFJLGNBQWM7QUFBQSxNQUMzQjtBQVVBLGVBQVMsVUFBVyxhQUFhLEdBQUcsR0FBRztBQUNyQyxnQkFBUSxhQUFhO0FBQUEsVUFDbkIsS0FBSyxRQUFRLFNBQVM7QUFBWSxvQkFBUSxJQUFJLEtBQUssTUFBTTtBQUFBLFVBQ3pELEtBQUssUUFBUSxTQUFTO0FBQVksbUJBQU8sSUFBSSxNQUFNO0FBQUEsVUFDbkQsS0FBSyxRQUFRLFNBQVM7QUFBWSxtQkFBTyxJQUFJLE1BQU07QUFBQSxVQUNuRCxLQUFLLFFBQVEsU0FBUztBQUFZLG9CQUFRLElBQUksS0FBSyxNQUFNO0FBQUEsVUFDekQsS0FBSyxRQUFRLFNBQVM7QUFBWSxvQkFBUSxLQUFLLE1BQU0sSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLElBQUksQ0FBQyxLQUFLLE1BQU07QUFBQSxVQUN6RixLQUFLLFFBQVEsU0FBUztBQUFZLG1CQUFRLElBQUksSUFBSyxJQUFLLElBQUksSUFBSyxNQUFNO0FBQUEsVUFDdkUsS0FBSyxRQUFRLFNBQVM7QUFBWSxvQkFBUyxJQUFJLElBQUssSUFBSyxJQUFJLElBQUssS0FBSyxNQUFNO0FBQUEsVUFDN0UsS0FBSyxRQUFRLFNBQVM7QUFBWSxvQkFBUyxJQUFJLElBQUssS0FBSyxJQUFJLEtBQUssS0FBSyxNQUFNO0FBQUEsVUFFN0U7QUFBUyxrQkFBTSxJQUFJLE1BQU0scUJBQXFCLFdBQVc7QUFBQSxRQUMzRDtBQUFBLE1BQ0Y7QUFRQSxjQUFRLFlBQVksU0FBUyxVQUFXLFNBQVMsTUFBTTtBQUNyRCxjQUFNLE9BQU8sS0FBSztBQUVsQixpQkFBUyxNQUFNLEdBQUcsTUFBTSxNQUFNLE9BQU87QUFDbkMsbUJBQVMsTUFBTSxHQUFHLE1BQU0sTUFBTSxPQUFPO0FBQ25DLGdCQUFJLEtBQUssV0FBVyxLQUFLLEdBQUcsRUFBRztBQUMvQixpQkFBSyxJQUFJLEtBQUssS0FBSyxVQUFVLFNBQVMsS0FBSyxHQUFHLENBQUM7QUFBQSxVQUNqRDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBUUEsY0FBUSxjQUFjLFNBQVMsWUFBYSxNQUFNLGlCQUFpQjtBQUNqRSxjQUFNLGNBQWMsT0FBTyxLQUFLLFFBQVEsUUFBUSxFQUFFO0FBQ2xELFlBQUksY0FBYztBQUNsQixZQUFJLGVBQWU7QUFFbkIsaUJBQVMsSUFBSSxHQUFHLElBQUksYUFBYSxLQUFLO0FBQ3BDLDBCQUFnQixDQUFDO0FBQ2pCLGtCQUFRLFVBQVUsR0FBRyxJQUFJO0FBR3pCLGdCQUFNLFVBQ0osUUFBUSxhQUFhLElBQUksSUFDekIsUUFBUSxhQUFhLElBQUksSUFDekIsUUFBUSxhQUFhLElBQUksSUFDekIsUUFBUSxhQUFhLElBQUk7QUFHM0Isa0JBQVEsVUFBVSxHQUFHLElBQUk7QUFFekIsY0FBSSxVQUFVLGNBQWM7QUFDMUIsMkJBQWU7QUFDZiwwQkFBYztBQUFBLFVBQ2hCO0FBQUEsUUFDRjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBQUE7QUFBQTs7O0FDek9BO0FBQUE7QUFBQSxVQUFNLFVBQVU7QUFFaEIsVUFBTSxrQkFBa0I7QUFBQTtBQUFBLFFBRXRCO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFDVDtBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQ1Q7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUNUO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFDVDtBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQ1Q7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUNUO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFDVDtBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQ1Q7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUNUO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFDVDtBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQ1Q7QUFBQSxRQUFHO0FBQUEsUUFBRztBQUFBLFFBQUk7QUFBQSxRQUNWO0FBQUEsUUFBRztBQUFBLFFBQUc7QUFBQSxRQUFJO0FBQUEsUUFDVjtBQUFBLFFBQUc7QUFBQSxRQUFHO0FBQUEsUUFBSTtBQUFBLFFBQ1Y7QUFBQSxRQUFHO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNYO0FBQUEsUUFBRztBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWDtBQUFBLFFBQUc7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1g7QUFBQSxRQUFHO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNYO0FBQUEsUUFBRztBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWDtBQUFBLFFBQUc7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1g7QUFBQSxRQUFHO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNYO0FBQUEsUUFBRztBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWDtBQUFBLFFBQUc7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1g7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsTUFDZDtBQUVBLFVBQU0scUJBQXFCO0FBQUE7QUFBQSxRQUV6QjtBQUFBLFFBQUc7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1g7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQ1o7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUNaO0FBQUEsUUFBSTtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFDWjtBQUFBLFFBQUk7QUFBQSxRQUFJO0FBQUEsUUFBSztBQUFBLFFBQ2I7QUFBQSxRQUFJO0FBQUEsUUFBSTtBQUFBLFFBQUs7QUFBQSxRQUNiO0FBQUEsUUFBSTtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDZDtBQUFBLFFBQUk7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQ2Q7QUFBQSxRQUFJO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUNkO0FBQUEsUUFBSTtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDZDtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQ2Y7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUNmO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDZjtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQ2Y7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUNmO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDZjtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQ2Y7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUNmO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDZjtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQ2Y7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUNmO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFDZjtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQ2Y7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUNmO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFNO0FBQUEsUUFDaEI7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQU07QUFBQSxRQUNoQjtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBTTtBQUFBLFFBQ2hCO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFNO0FBQUEsUUFDaEI7QUFBQSxRQUFLO0FBQUEsUUFBSztBQUFBLFFBQU07QUFBQSxRQUNoQjtBQUFBLFFBQUs7QUFBQSxRQUFLO0FBQUEsUUFBTTtBQUFBLFFBQ2hCO0FBQUEsUUFBSztBQUFBLFFBQUs7QUFBQSxRQUFNO0FBQUEsUUFDaEI7QUFBQSxRQUFLO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxRQUNqQjtBQUFBLFFBQUs7QUFBQSxRQUFNO0FBQUEsUUFBTTtBQUFBLFFBQ2pCO0FBQUEsUUFBSztBQUFBLFFBQU07QUFBQSxRQUFNO0FBQUEsUUFDakI7QUFBQSxRQUFLO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxRQUNqQjtBQUFBLFFBQUs7QUFBQSxRQUFNO0FBQUEsUUFBTTtBQUFBLFFBQ2pCO0FBQUEsUUFBSztBQUFBLFFBQU07QUFBQSxRQUFNO0FBQUEsUUFDakI7QUFBQSxRQUFLO0FBQUEsUUFBTTtBQUFBLFFBQU07QUFBQSxNQUNuQjtBQVVBLGNBQVEsaUJBQWlCLFNBQVMsZUFB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UyxnQkFBZ0I7QUFDekIsZUFBUyxlQUFlLGlCQUFpQixTQUFTLE1BQU0sUUFBUSx3QkFBd0IsQ0FBQztBQUFBLElBQzdGO0FBQUEsRUFDSjtBQUdBLGlCQUFlLE9BQU87QUFDbEIsWUFBUSxJQUFJLHFDQUFxQztBQUNqRCxpQkFBYTtBQUNiLGVBQVc7QUFFWCxVQUFNLFdBQVc7QUFFakIsVUFBTSxjQUFjLE1BQU0sSUFBSSxRQUFRLFlBQVksRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUN6RSxVQUFNLFdBQVcsTUFBTSxJQUFJLFFBQVEsWUFBWSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRW5FLFFBQUksQ0FBQyxNQUFNLFVBQVU7QUFDakIsWUFBTSxrQkFBa0I7QUFBQSxJQUM1QixPQUFPO0FBQ0gsYUFBTztBQUFBLElBQ1g7QUFBQSxFQUNKO0FBRUEsV0FBUyxpQkFBaUIsb0JBQW9CLElBQUk7IiwKICAibmFtZXMiOiBbIm1vZHVsZSIsICJpbml0aWFsaXplIiwgInJlcXVpcmVfdXRpbHMiLCAicmVuZGVyIiwgInJlbmRlciIsICJRUkNvZGUiLCAibmV3UHJvZmlsZSIsICJRUkNvZGUiXQp9Cg==
