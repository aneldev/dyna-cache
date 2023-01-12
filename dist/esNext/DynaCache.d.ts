import { IDynaError } from "dyna-error";
export interface IDynaCacheConfig<TData> {
    load: () => Promise<TData>;
    expireAfterMinutes?: number;
    preload?: boolean;
    refreshEveryMinutes?: number;
    cacheFirstAndUpdate?: boolean;
    onLoad?: (data: TData, size: number) => void;
    onSizeChange?: (size: number) => void;
}
export declare class DynaCache<TData> {
    private readonly config;
    private readonly refreshTimer;
    private cachedData;
    private _lastError;
    private _loadedAt;
    private _loadCount;
    private _lastUsedAt;
    private _size;
    constructor(config: IDynaCacheConfig<TData>);
    get size(): number;
    get loadedAt(): number;
    get lastUsedAt(): number;
    get loadCount(): number;
    get lastError(): {
        error: IDynaError;
        date: number;
    } | null;
    loadFresh(): Promise<TData>;
    load(): Promise<TData>;
    invalidate(): void;
    free(): void;
}
