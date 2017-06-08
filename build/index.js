/******/ (function(modules) { // webpackBootstrap
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
/******/ 	__webpack_require__.p = "";
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
const dyna_cache_1 = __webpack_require__(1);
exports.DynaCache = dyna_cache_1.DynaCache;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __webpack_require__(2);
const extraSizeForSnapshot = 13;
const validOptionProperties = [
    'cacheLimit', 'onRemove', 'onExpire'
];
const validItemOptionProperies = [
    'expiresIn', 'onRemove', 'onExpire', 'keepExpired', 'doNotRemove'
];
class DynaCache {
    constructor(options = {}) {
        this.options = {
            cacheLimit: 5000000
        };
        this.dataBank = {};
        this.size = 0;
        this.dataBankItemWrapperSize = 0;
        this._debug_sizeOfItem = utils_1.sizeOfItem;
        this.defaultItemDataOptions = {
            expiresIn: null,
            keepExpired: false,
            doNotRemove: false,
        };
        utils_1.validateObjPropertiesAndConsoleError(options, validOptionProperties, 'dyna-cache: these options are not recognized');
        this.dataBankItemWrapperSize = this.getSizeOfDataBankItemWrapper();
        this.options = Object.assign({}, this.options, options);
    }
    updateOptions(options) {
        this.options = Object.assign({}, this.options, options);
        this.freeUpForSize(0);
    }
    generateKeyForObject(obj) {
        return '#k_' + utils_1.getObjectCRC32(obj);
    }
    getMemSize() {
        if (this.getItemsCount())
            return this.size - extraSizeForSnapshot;
        else
            return 0;
    }
    getItemsCount() {
        return Object.keys(this.dataBank).length;
    }
    _test_getItems() {
        return Object.keys(this.dataBank)
            .map((key) => (Object.assign({}, this.dataBank[key], { key })));
    }
    _test_getItem(key) {
        return this._test_getItems().find((item) => item.key === key);
    }
    add(key, data, options = this.defaultItemDataOptions) {
        let saved = false;
        let oldItem = this.dataBank[key];
        let newItemSize = utils_1.sizeOfItem(key, data) + this.dataBankItemWrapperSize;
        if (oldItem)
            this.size -= oldItem.size;
        if (!oldItem || (newItemSize > oldItem.size)) {
            this.freeUpForSize(newItemSize); // make room for the new one
        }
        let newItem = {
            data,
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
    }
    get(key) {
        let item = this.dataBank[key];
        if (item) {
            item.lastRead = utils_1.getNowAsNumber();
            return item.data;
        }
        else {
            return undefined;
        }
    }
    remove(key) {
        let item = this.dataBank[key];
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
    }
    clear() {
        Object.keys(this.dataBank)
            .forEach((key) => {
            const item = this.dataBank[key];
            if (typeof item.expiresTimerHandler !== null) {
                clearTimeout(item.expiresTimerHandler);
            }
        });
        this.dataBank = {};
        this.size = 0;
    }
    updateItemOptions(key, options) {
        let item = this.dataBank[key];
        if (item) {
            this.updateOptionsOnBankDataItem(key, item, options, true);
            return true;
        }
        else {
            return false;
        }
    }
    getExpired() {
        return Object.keys(this.dataBank)
            .map(key => ({ key, info: this.dataBank[key] }))
            .filter(item => item.info.isExpired)
            .map(item => ({ key: item.key, data: item.info.data }));
    }
    getSnapshot() {
        let dataBank = {};
        Object.keys(this.dataBank).forEach((key) => {
            let item = Object.assign({}, this.dataBank[key]);
            item.expiresTimerHandler = null;
            dataBank[key] = item;
        });
        let snapBin = { dataBank };
        try {
            return JSON.stringify(snapBin);
        }
        catch (error) {
            error.message = 'dyna-cache, getSnapshot: ' + (error.message || 'unknown error stringifying the data');
            throw error;
        }
    }
    loadFromSnapshot(snapshot) {
        try {
            this.clear();
            let snapBin = JSON.parse(snapshot);
            let keysToRemove = [];
            this.dataBank = snapBin.dataBank;
            this.size = 0;
            Object.keys(this.dataBank).forEach((key) => {
                let item = this.dataBank[key];
                this.size += item.size;
                if (item.expiresAt) {
                    let expiresIn = (new Date(item.expiresAt)).getTime() - (new Date()).getTime();
                    if (expiresIn <= 0) {
                        keysToRemove.push(key);
                        this.size -= item.size;
                    }
                    else {
                        item.expiresTimerHandler = setTimeout(() => {
                            this.remove(key);
                        }, expiresIn);
                    }
                }
            });
            this.freeUpForSize(0);
            keysToRemove.forEach((key) => delete this.dataBank[key]);
        }
        catch (error) {
            this.clear();
            error.message = 'dyna-cache, loadFromSnapshot: ' + (error.message || 'unknown error stringifying the data');
            throw error;
        }
    }
    updateOptionsOnBankDataItem(key, item, options, isSaved) {
        utils_1.validateObjPropertiesAndConsoleError(options, validItemOptionProperies, 'dyna-cache, item\'s options: these options are not recognized');
        item.isExpired = false;
        item.keepExpired = !!options.keepExpired;
        item.doNotRemove = !!options.doNotRemove;
        item.onRemove = options.onRemove;
        item.onExpire = options.onExpire;
        // expiresIn
        if (options && options.expiresIn && isSaved) {
            let expiresIn = utils_1.expireIn(options.expiresIn);
            if (item.expiresTimerHandler !== null)
                clearTimeout(item.expiresTimerHandler);
            if (expiresIn == -1) {
                item.expiresAt = null;
                item.expiresTimerHandler = null;
            }
            else {
                item.expiresAt = new Date((new Date()).getTime() + expiresIn);
                item.expiresTimerHandler = setTimeout(() => {
                    item.isExpired = true;
                    item.onExpire && item.onExpire(key, !item.keepExpired);
                    this.options.onExpire && this.options.onExpire(key, !item.keepExpired);
                    if (!item.keepExpired)
                        this.remove(key);
                }, expiresIn);
            }
        }
    }
    // this is executed once to estimate the actual size to be saved in memory with all options
    getSizeOfDataBankItemWrapper() {
        let key = 'test-dyna-cache';
        let data = 'data';
        this.add('test-dyna-cache', 'data', {
            expiresIn: '1s',
            onRemove: (key) => undefined,
            onExpire: (key, isRemoved) => undefined,
            keepExpired: true,
        });
        let jsonObjectSeaprator = 1;
        let sizeOfSizeValue = 10;
        let size = utils_1.sizeOfItem(key, this.dataBank[key])
            - key.length
            - data.length
            + jsonObjectSeaprator
            + sizeOfSizeValue;
        this.remove(key);
        return size;
    }
    freeUpForSize(sizeInBytes) {
        let optionsMaxLoad = this.options.cacheLimit;
        if (sizeInBytes < optionsMaxLoad - this.size)
            return; // exit, there is enough space
        if (sizeInBytes > optionsMaxLoad)
            return; // exit, this size cannot fit anyway
        let items = Object.keys(this.dataBank)
            .map((key) => (Object.assign({}, this.dataBank[key], { key })))
            .filter((item) => !!!item.doNotRemove)
            .sort((itemA, itemB) => itemA.lastRead - itemB.lastRead);
        while (this.size + sizeInBytes > optionsMaxLoad) {
            this.remove(items.shift().key);
        }
    }
}
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
        let value = Number(expireInTime.slice(0, -1)) || -1;
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
function JSONStringify(object, valueForCircularReferences = '') {
    var cache = [];
    var output = JSON.stringify(object, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
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
    let objProps = Object.keys(obj);
    let invalidProps = [];
    objProps.forEach((propName) => {
        if (validProperties.indexOf(propName) == -1)
            invalidProps.push(propName);
    });
    return invalidProps;
}
function validateObjPropertiesAndConsoleError(obj, validProperties, errorMessage) {
    let invalidProps = validateObjProperties(obj, validProperties);
    if (invalidProps.length)
        (console.error || console.log)(`${errorMessage}: [${invalidProps.join()}]`);
}
exports.validateObjPropertiesAndConsoleError = validateObjPropertiesAndConsoleError;
const crcTable = (function () {
    let c;
    let crcTable = [];
    for (let n = 0; n < 256; n++) {
        c = n;
        for (let k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
})();
function getCRC32(str) {
    let crc = -1;
    for (let i = 0, iTop = str.length; i < iTop; i++) {
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