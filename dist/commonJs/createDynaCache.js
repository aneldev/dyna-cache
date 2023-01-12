"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDynaCache = void 0;
var DynaCache_1 = require("./DynaCache");
var md5 = require("md5");
var createDynaCache = function (config) {
    var load = config.load, expireAfterMinutes = config.expireAfterMinutes, cacheFirstAndUpdate = config.cacheFirstAndUpdate, refreshEveryMinutes = config.refreshEveryMinutes, removeUnusedCachesLastMinutes = config.removeUnusedCachesLastMinutes;
    var caches = {};
    var getArgsHash = function (args) { return md5(JSON.stringify(args)); };
    var removeTimer = removeUnusedCachesLastMinutes &&
        setInterval(function () {
            Object.keys(caches)
                .forEach(function (argsHash) {
                var cacheItem = caches[argsHash];
                var cache = cacheItem.dynaCache;
                if (cache.lastUsedAt + removeUnusedCachesLastMinutes < Date.now()) {
                    api.freeByArgs(cacheItem.args);
                }
            });
        }, removeUnusedCachesLastMinutes);
    var api = {
        load: function (args, loadFresh) {
            var argsHash = getArgsHash(args);
            if (!caches[argsHash]) {
                caches[argsHash] = {
                    dynaCache: new DynaCache_1.DynaCache({
                        load: function () { return load(args); },
                        expireAfterMinutes: expireAfterMinutes,
                        cacheFirstAndUpdate: cacheFirstAndUpdate,
                        refreshEveryMinutes: refreshEveryMinutes,
                        onSizeChange: function () {
                            config.onSizeChange && config.onSizeChange(api.size);
                        },
                    }),
                    args: args,
                };
            }
            return loadFresh
                ? caches[argsHash].dynaCache.loadFresh()
                : caches[argsHash].dynaCache.load();
        },
        freeByArgs: function (args) {
            var argsHash = getArgsHash(args);
            if (!caches[argsHash])
                return;
            caches[argsHash].dynaCache.free();
            delete caches[argsHash];
        },
        get size() {
            return Object.values(caches)
                .reduce(function (acc, cache) { return acc + cache.dynaCache.size; }, 0);
        },
        get stats() {
            return {
                cachesCount: Object
                    .keys(caches)
                    .length,
                sizes: Object
                    .keys(caches)
                    .map(function (argsHash) {
                    var _a = caches[argsHash], args = _a.args, _b = _a.dynaCache, size = _b.size, loadCount = _b.loadCount, lastUsedAt = _b.lastUsedAt;
                    return {
                        args: args,
                        size: size,
                        loadCount: loadCount,
                        lastUsedAt: new Date(lastUsedAt),
                    };
                }),
            };
        },
        invalidate: function () {
            Object
                .values(caches)
                .forEach(function (c) { return c.dynaCache.invalidate(); });
        },
        free: function () {
            if (removeTimer)
                clearInterval(removeTimer);
            Object
                .keys(caches)
                .forEach(function (argsHash) { return api.freeByArgs(caches[argsHash].args); });
        },
    };
    return api;
};
exports.createDynaCache = createDynaCache;
//# sourceMappingURL=createDynaCache.js.map