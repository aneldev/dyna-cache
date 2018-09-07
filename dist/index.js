(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("dyna-cache", [], factory);
	else if(typeof exports === 'object')
		exports["dyna-cache"] = factory();
	else
		root["dyna-cache"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var dyna_cache_1 = __webpack_require__(1);
exports.DynaCache = dyna_cache_1.DynaCache;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = __webpack_require__(2);
var extraSizeForSnapshot = 13;
var validOptionProperties = [
    'cacheLimit', 'onRemove', 'onExpire'
];
var validItemOptionProperies = [
    'expiresIn', 'onRemove', 'onExpire', 'keepExpired', 'doNotRemove'
];
var DynaCache = /** @class */ (function () {
    function DynaCache(options) {
        if (options === void 0) { options = {}; }
        this.options = {
            cacheLimit: 5000000,
        };
        this.dataBank = {};
        this.size = 0;
        this.dataBankItemWrapperSize = 0;
        this.defaultItemDataOptions = {
            expiresIn: null,
            keepExpired: false,
            doNotRemove: false,
        };
        utils_1.validateObjPropertiesAndConsoleError(options, validOptionProperties, 'dyna-cache: these options are not recognized');
        this.dataBankItemWrapperSize = this.getSizeOfDataBankItemWrapper();
        this.options = __assign({}, this.options, options);
    }
    DynaCache.prototype.updateOptions = function (options) {
        this.options = __assign({}, this.options, options);
        this.freeUpForSize(0);
    };
    DynaCache.prototype.generateKeyForObject = function (obj) {
        return '#k_' + utils_1.getObjectCRC32(obj);
    };
    DynaCache.prototype.getMemSize = function () {
        if (this.getItemsCount())
            return this.size - extraSizeForSnapshot;
        else
            return 0;
    };
    DynaCache.prototype.getItemsCount = function () {
        return Object.keys(this.dataBank).length;
    };
    DynaCache.prototype._test_getItems = function () {
        var _this = this;
        return Object.keys(this.dataBank)
            .map(function (key) { return (__assign({}, _this.dataBank[key], { key: key })); });
    };
    DynaCache.prototype._test_getItem = function (key) {
        return this._test_getItems().find(function (item) { return item.key === key; });
    };
    DynaCache.prototype.add = function (key, data, options) {
        if (options === void 0) { options = this.defaultItemDataOptions; }
        var saved = false;
        var oldItem = this.dataBank[key];
        var newItemSize = utils_1.sizeOfItem(key, data) + this.dataBankItemWrapperSize;
        if (oldItem)
            this.size -= oldItem.size;
        if (!oldItem || (newItemSize > oldItem.size)) { // if there is no old item with the same key or there is and the new is bigger
            this.freeUpForSize(newItemSize); // make room for the new one
        }
        var newItem = {
            data: data,
            size: newItemSize,
            lastRead: utils_1.getNowAsNumber(),
        };
        if (this.size + newItemSize <= this.options.cacheLimit) {
            this.dataBank[key] = newItem;
            this.size += newItemSize;
            saved = true;
        }
        this.updateOptionsOnBankDataItem(key, newItem, options, saved);
        return saved;
    };
    DynaCache.prototype.get = function (key) {
        var item = this.dataBank[key];
        if (item) {
            item.lastRead = utils_1.getNowAsNumber();
            return item.data;
        }
        else {
            return undefined;
        }
    };
    DynaCache.prototype.remove = function (key) {
        var item = this.dataBank[key];
        if (item) {
            this.size -= item.size;
            delete this.dataBank[key];
            item.onRemove && item.onRemove(key);
            this.options.onRemove && this.options.onRemove(key);
            return true;
        }
        else {
            return false;
        }
    };
    DynaCache.prototype.clear = function () {
        var _this = this;
        Object.keys(this.dataBank)
            .forEach(function (key) {
            var item = _this.dataBank[key];
            if (typeof item.expiresTimerHandler !== null) {
                clearTimeout(item.expiresTimerHandler);
            }
        });
        this.dataBank = {};
        this.size = 0;
    };
    DynaCache.prototype.updateItemOptions = function (key, options) {
        var item = this.dataBank[key];
        if (item) {
            this.updateOptionsOnBankDataItem(key, item, options, true);
            return true;
        }
        else {
            return false;
        }
    };
    DynaCache.prototype.getExpired = function () {
        var _this = this;
        return Object.keys(this.dataBank)
            .map(function (key) { return ({ key: key, info: _this.dataBank[key] }); })
            .filter(function (item) { return item.info.isExpired; })
            .map(function (item) { return ({ key: item.key, data: item.info.data }); });
    };
    DynaCache.prototype.getSnapshot = function () {
        var _this = this;
        var dataBank = {};
        Object.keys(this.dataBank).forEach(function (key) {
            var item = Object.assign({}, _this.dataBank[key]);
            item.expiresTimerHandler = null;
            dataBank[key] = item;
        });
        var snapBin = { dataBank: dataBank };
        try {
            return JSON.stringify(snapBin);
        }
        catch (error) {
            error.message = 'dyna-cache, getSnapshot: ' + (error.message || 'unknown error stringifying the data');
            throw error;
        }
    };
    DynaCache.prototype.loadFromSnapshot = function (snapshot) {
        var _this = this;
        try {
            this.clear();
            var snapBin = JSON.parse(snapshot);
            var keysToRemove_1 = [];
            this.dataBank = snapBin.dataBank;
            this.size = 0;
            Object.keys(this.dataBank).forEach(function (key) {
                var item = _this.dataBank[key];
                _this.size += item.size;
                if (item.expiresAt) {
                    var expiresIn = (new Date(item.expiresAt)).getTime() - (new Date()).getTime();
                    if (expiresIn <= 0) {
                        keysToRemove_1.push(key);
                        _this.size -= item.size;
                    }
                    else {
                        item.expiresTimerHandler = setTimeout(function () {
                            _this.remove(key);
                        }, expiresIn);
                    }
                }
            });
            this.freeUpForSize(0);
            keysToRemove_1.forEach(function (key) { return delete _this.dataBank[key]; });
        }
        catch (error) {
            this.clear();
            error.message = 'dyna-cache, loadFromSnapshot: ' + (error.message || 'unknown error stringifying the data');
            throw error;
        }
    };
    DynaCache.prototype.updateOptionsOnBankDataItem = function (key, item, options, isSaved) {
        var _this = this;
        utils_1.validateObjPropertiesAndConsoleError(options, validItemOptionProperies, 'dyna-cache, item\'s options: these options are not recognized');
        item.isExpired = false;
        item.keepExpired = !!options.keepExpired;
        item.doNotRemove = !!options.doNotRemove;
        item.onRemove = options.onRemove;
        item.onExpire = options.onExpire;
        // expiresIn
        if (options && options.expiresIn && isSaved) {
            var expiresIn = utils_1.expireIn(options.expiresIn);
            if (item.expiresTimerHandler !== null)
                clearTimeout(item.expiresTimerHandler);
            if (expiresIn == -1) {
                item.expiresAt = null;
                item.expiresTimerHandler = null;
            }
            else {
                item.expiresAt = new Date((new Date()).getTime() + expiresIn);
                item.expiresTimerHandler = setTimeout(function () {
                    item.isExpired = true;
                    item.onExpire && item.onExpire(key, !item.keepExpired);
                    _this.options.onExpire && _this.options.onExpire(key, !item.keepExpired);
                    if (!item.keepExpired)
                        _this.remove(key);
                }, expiresIn);
            }
        }
    };
    // this is executed once to estimate the actual size to be saved in memory with all options
    DynaCache.prototype.getSizeOfDataBankItemWrapper = function () {
        var key = 'test-dyna-cache';
        var data = 'data';
        this.add('test-dyna-cache', 'data', {
            expiresIn: '1s',
            onRemove: function (key) { return undefined; },
            onExpire: function (key, isRemoved) { return undefined; },
            keepExpired: true,
        });
        var jsonObjectSeaprator = 1;
        var sizeOfSizeValue = 10;
        var size = utils_1.sizeOfItem(key, this.dataBank[key])
            - key.length
            - data.length
            + jsonObjectSeaprator
            + sizeOfSizeValue;
        this.remove(key);
        return size;
    };
    DynaCache.prototype.freeUpForSize = function (sizeInBytes) {
        var _this = this;
        var optionsMaxLoad = this.options.cacheLimit;
        if (sizeInBytes < optionsMaxLoad - this.size)
            return; // exit, there is enough space
        if (sizeInBytes > optionsMaxLoad)
            return; // exit, this size cannot fit anyway
        var items = Object.keys(this.dataBank)
            .map(function (key) { return (__assign({}, _this.dataBank[key], { key: key })); })
            .filter(function (item) { return !!!item.doNotRemove; })
            .sort(function (itemA, itemB) { return itemA.lastRead - itemB.lastRead; });
        while (this.size + sizeInBytes > optionsMaxLoad) {
            this.remove(items.shift().key);
        }
    };
    return DynaCache;
}());
exports.DynaCache = DynaCache;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function expireIn(expireInTime) {
    if (typeof expireInTime == 'string')
        expireInTime = expireInTime.toLowerCase();
    if (typeof expireInTime == 'number') {
        return expireInTime;
    }
    else if (expireInTime.slice(-2) == 'ms') {
        return Number(expireInTime.slice(0, -2));
    }
    else if (expireInTime.slice(-2) == 'mo') {
        return Number(expireInTime.slice(0, -2)) * 1000 * 60 * 60 * 24 * 7 * 4;
    }
    else {
        var value = Number(expireInTime.slice(0, -1)) || -1;
        if (value == -1)
            return -1; // the text is not number
        switch (expireInTime.slice(-1)) {
            case 's': return value * 1000;
            case 'm': return value * 1000 * 60;
            case 'h': return value * 1000 * 60 * 60;
            case 'd': return value * 1000 * 60 * 60 * 24;
            case 'w': return value * 1000 * 60 * 60 * 24 * 7;
            case 'y': return value * 1000 * 60 * 60 * 24 * 7 * 4 * 12;
            default:
                return -1;
        }
    }
}
exports.expireIn = expireIn;
function JSONStringify(object, valueForCircularReferences) {
    if (valueForCircularReferences === void 0) { valueForCircularReferences = ''; }
    var cache = [];
    var output = JSON.stringify(object, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) { // Circular reference found
                if (valueForCircularReferences)
                    return valueForCircularReferences; // circular reference
                else
                    return;
            }
            cache.push(value); // Store value in our collection
        }
        return value;
    });
    cache = null;
    return output;
}
exports.JSONStringify = JSONStringify;
function objectSize(obj) {
    return JSONStringify(obj).length;
}
exports.objectSize = objectSize;
function sizeOfItem(key, data) {
    return objectSize(data) + key.length + 10;
}
exports.sizeOfItem = sizeOfItem;
function getNowAsNumber() {
    return (new Date()).getTime();
}
exports.getNowAsNumber = getNowAsNumber;
function validateObjProperties(obj, validProperties) {
    var objProps = Object.keys(obj);
    var invalidProps = [];
    objProps.forEach(function (propName) {
        if (validProperties.indexOf(propName) == -1)
            invalidProps.push(propName);
    });
    return invalidProps;
}
function validateObjPropertiesAndConsoleError(obj, validProperties, errorMessage) {
    var invalidProps = validateObjProperties(obj, validProperties);
    if (invalidProps.length)
        (console.error || console.log)(errorMessage + ": [" + invalidProps.join() + "]");
}
exports.validateObjPropertiesAndConsoleError = validateObjPropertiesAndConsoleError;
var crcTable = (function () {
    var c;
    var crcTable = [];
    for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
})();
function getCRC32(str) {
    var crc = -1;
    for (var i = 0, iTop = str.length; i < iTop; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }
    return String((crc ^ (-1)) >>> 0);
}
exports.getCRC32 = getCRC32;
function getObjectCRC32(obj) {
    return getCRC32(JSON.stringify(obj));
}
exports.getObjectCRC32 = getObjectCRC32;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(0);


/***/ })
/******/ ]);
});