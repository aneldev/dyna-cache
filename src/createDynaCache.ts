import {DynaCache} from "./DynaCache";
import * as md5 from "md5";

export interface ICreateDynaCacheConfig<TArgs, TData, > {
  load: (args: TArgs) => Promise<TData>;  // The load operation
  expireAfterMinutes?: number;            // When the cache expires, undefined for none
  cacheFirstAndUpdate?: boolean;          // Provide the cached version and update on background
  refreshEveryMinutes?: number;           // Refresh the data silently on background after initial load
  removeUnusedCachesLastMinutes?: number; // Remove cashed that haven't been used in last minutes
  onSizeChange?: (size: number) => void;
}

export const createDynaCache = <TArgs, TData, >(config: ICreateDynaCacheConfig<TArgs, TData>) => {
  const {
    load,
    expireAfterMinutes,
    cacheFirstAndUpdate,
    refreshEveryMinutes,
    removeUnusedCachesLastMinutes,
  } = config;

  const caches: {
    [argsHash: string]: {
      args: TArgs;
      dynaCache: DynaCache<TData>;
    };
  } = {};
  const getArgsHash = (args: TArgs): string => md5(JSON.stringify(args));

  const removeTimer =
    removeUnusedCachesLastMinutes &&
    setInterval(() => {
      Object.keys(caches)
        .forEach(argsHash => {
          const cacheItem = caches[argsHash];
          const cache = cacheItem.dynaCache;
          if (cache.lastUsedAt + removeUnusedCachesLastMinutes < Date.now()) {
            api.freeByArgs(cacheItem.args);
          }
        });
    }, removeUnusedCachesLastMinutes);

  const api = {
    load: (args: TArgs, loadFresh?: boolean): Promise<TData> => {
      const argsHash = getArgsHash(args);
      if (!caches[argsHash]) {
        caches[argsHash] = {
          dynaCache: new DynaCache<TData>({
            load: () => load(args),
            expireAfterMinutes,
            cacheFirstAndUpdate,
            refreshEveryMinutes,
            onSizeChange: () => {
              config.onSizeChange && config.onSizeChange(api.size);
            },
          }),
          args,
        };
      }
      return loadFresh
        ? caches[argsHash].dynaCache.loadFresh()
        : caches[argsHash].dynaCache.load();
    },
    freeByArgs: (args: TArgs): void => {
      const argsHash = getArgsHash(args);
      if (!caches[argsHash]) return;
      caches[argsHash].dynaCache.free();
      delete caches[argsHash];
    },
    get size(): number {
      return Object.values(caches)
        .reduce((acc: number, cache) => acc + cache.dynaCache.size, 0);
    },
    get stats() {
      return {
        cachesCount:
        Object
          .keys(caches)
          .length,
        sizes:
          Object
            .keys(caches)
            .map(argsHash => {
              const {
                args,
                dynaCache: {
                  size,
                  loadCount,
                  lastUsedAt,
                },
              } = caches[argsHash];
              return {
                args,
                size,
                loadCount,
                lastUsedAt: new Date(lastUsedAt),
              };
            }),
      };
    },
    invalidate: (): void => {
      Object
        .values(caches)
        .forEach(c => c.dynaCache.invalidate());
    },
    free: (): void => {
      if (removeTimer) clearInterval(removeTimer);
      Object
        .keys(caches)
        .forEach(argsHash => api.freeByArgs(caches[argsHash].args));
    },
  };
  return api;
};
