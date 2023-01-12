export interface ICreateDynaCacheConfig<TArgs, TData> {
    load: (args: TArgs) => Promise<TData>;
    expireAfterMinutes?: number;
    cacheFirstAndUpdate?: boolean;
    refreshEveryMinutes?: number;
    removeUnusedCachesLastMinutes?: number;
    onSizeChange?: (size: number) => void;
}
export declare const createDynaCache: <TArgs, TData>(config: ICreateDynaCacheConfig<TArgs, TData>) => {
    load: (args: TArgs, loadFresh?: boolean) => Promise<TData>;
    freeByArgs: (args: TArgs) => void;
    readonly size: number;
    readonly stats: {
        cachesCount: number;
        sizes: {
            args: TArgs;
            size: number;
            loadCount: number;
            lastUsedAt: Date;
        }[];
    };
    invalidate: () => void;
    free: () => void;
};
