"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynaCache = void 0;
var dyna_job_queue_1 = require("dyna-job-queue");
var DynaCache = /** @class */ (function () {
    function DynaCache(config) {
        var _this = this;
        this.config = config;
        this.queue = new dyna_job_queue_1.DynaJobQueue();
        this.cachedData = null;
        this._lastError = null;
        this._loadedAt = 0;
        this._loadCount = 0;
        this._lastUsedAt = 0;
        this._size = 0;
        this.load = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._loadCount++;
                this._lastUsedAt = Date.now();
                if (this.config.expireAfterMinutes &&
                    this._loadedAt + (this.config.expireAfterMinutes * 60000) < Date.now()) {
                    return [2 /*return*/, this.loadFresh()];
                }
                if (this.cachedData) {
                    if (this.config.cacheFirstAndUpdate) {
                        // Start the refresh in the background
                        this.loadFresh().catch(function () { return undefined; });
                    }
                    return [2 /*return*/, this.cachedData];
                }
                else {
                    return [2 /*return*/, this.loadFresh()];
                }
                return [2 /*return*/];
            });
        }); };
        if (this.config.preload)
            this.loadFresh().catch(function () { return undefined; });
        if (this.config.refreshEveryMinutes) {
            this.refreshTimer = setInterval(function () { return _this.loadFresh(); }, this.config.refreshEveryMinutes * 60000);
        }
        this.load = this.queue.jobFactory(this.load);
    }
    Object.defineProperty(DynaCache.prototype, "size", {
        get: function () {
            return this._size;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DynaCache.prototype, "loadedAt", {
        get: function () {
            return this._loadedAt;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DynaCache.prototype, "lastUsedAt", {
        get: function () {
            return this._lastUsedAt;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DynaCache.prototype, "loadCount", {
        get: function () {
            return this._loadCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DynaCache.prototype, "lastError", {
        get: function () {
            return this._lastError;
        },
        enumerable: false,
        configurable: true
    });
    DynaCache.prototype.loadFresh = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        this._loadCount++;
                        this._lastUsedAt = Date.now();
                        this._lastError = null;
                        _a = this;
                        return [4 /*yield*/, this.config.load()];
                    case 1:
                        _a.cachedData = _b.sent();
                        this._loadedAt = Date.now();
                        this._size = JSON.stringify(this.cachedData).length;
                        this.config.onLoad && this.config.onLoad(this.cachedData, this._size);
                        this.config.onSizeChange && this.config.onSizeChange(this._size);
                        return [2 /*return*/, this.cachedData];
                    case 2:
                        e_1 = _b.sent();
                        this._lastError = e_1;
                        throw e_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DynaCache.prototype.invalidate = function () {
        this.cachedData = null;
        this._lastError = null;
        this._loadedAt = 0;
        this._size = 0;
        this.config.onSizeChange && this.config.onSizeChange(this._size);
    };
    DynaCache.prototype.free = function () {
        if (this.refreshTimer)
            clearInterval(this.refreshTimer);
    };
    return DynaCache;
}());
exports.DynaCache = DynaCache;
//# sourceMappingURL=DynaCache.js.map