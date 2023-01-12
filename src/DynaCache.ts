import {IDynaError} from "dyna-error";

export interface IDynaCacheConfig<TData> {
  load: () => Promise<TData>;                   // The load operation

  expireAfterMinutes?: number;                  // When the cache expires, undefined for none
  preload?: boolean;                            // Preload the data on start
  refreshEveryMinutes?: number;                 // Refresh the data silently on background
  cacheFirstAndUpdate?: boolean;                // Provide the cached version and update on background
  onLoad?: (data: TData, size: number) => void; // Called when the data are loaded for any reason
  onSizeChange?: (size: number) => void;
}

export class DynaCache<TData> {
  private readonly refreshTimer: any;
  private cachedData: TData | null = null;
  private _lastError: { error: IDynaError; date: number } | null = null;
  private _loadedAt = 0;
  private _loadCount = 0;
  private _lastUsedAt = 0;
  private _size = 0;

  constructor(private readonly config: IDynaCacheConfig<TData>) {
    if (this.config.preload) this.loadFresh().catch(() => undefined);
    if (this.config.refreshEveryMinutes) {
      this.refreshTimer = setInterval(() => this.loadFresh(), this.config.refreshEveryMinutes * 60000);
    }
  }

  public get size(): number {
    return this._size;
  }

  public get loadedAt(): number {
    return this._loadedAt;
  }

  public get lastUsedAt(): number {
    return this._lastUsedAt;
  }

  public get loadCount(): number {
    return this._loadCount;
  }

  public get lastError() {
    return this._lastError;
  }

  public async loadFresh(): Promise<TData> {
    try {
      this._loadCount++;
      this._lastUsedAt = Date.now();
      this._lastError = null;
      this.cachedData = await this.config.load();
      this._loadedAt = Date.now();
      this._size = JSON.stringify(this.cachedData).length;
      this.config.onLoad && this.config.onLoad(this.cachedData, this._size);
      this.config.onSizeChange && this.config.onSizeChange(this._size);
      return this.cachedData;
    }
    catch (e) {
      this._lastError = e;
      throw e;
    }
  }

  public async load(): Promise<TData> {
    this._loadCount++;
    this._lastUsedAt = Date.now();
    if (
      this.config.expireAfterMinutes &&
      this._loadedAt + (this.config.expireAfterMinutes * 60000) < Date.now()
    ) {
      return this.loadFresh();
    }

    if (this.cachedData) {
      if (this.config.cacheFirstAndUpdate) {
        // Start the refresh in the background
        this.loadFresh().catch(() => undefined);
      }
      return this.cachedData;
    }
    else {
      return this.loadFresh();
    }
  }

  public invalidate(): void {
    this.cachedData = null;
    this._lastError = null;
    this._loadedAt = 0;
    this._size = 0;
    this.config.onSizeChange && this.config.onSizeChange(this._size);
  }

  public free(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }
}
