export interface IDynaCacheOptions {
    cacheLimit?: number;
    onRemove?: (key: string) => void;
    onExpire?: (key: string, isRemoved: boolean) => void;
}
export interface IKeyData {
    key: string;
    data: any;
}
export interface IDataBankItem {
    key?: string;
    data: any;
    size: number;
    lastRead: number;
    expiresAt?: Date;
    expiresTimerHandler?: any;
    onRemove?: (key: string) => void;
    onExpire?: (key: string, isRemoved: boolean) => void;
    keepExpired?: boolean;
    isExpired?: boolean;
    doNotRemove?: boolean;
}
export interface IDataBankItemForTest extends IDataBankItem {
    key: string;
}
export interface IDataOptions {
    expiresIn?: number | string;
    keepExpired?: boolean;
    doNotRemove?: boolean;
    onRemove?: (key: string) => void;
    onExpire?: (key: string, isRemoved: boolean) => void;
}
export declare class DynaCache {
    private options;
    private dataBank;
    private size;
    private dataBankItemWrapperSize;
    constructor(options?: IDynaCacheOptions);
    updateOptions(options: IDynaCacheOptions): void;
    private defaultItemDataOptions;
    generateKeyForObject(obj: any): string;
    getMemSize(): number;
    getItemsCount(): number;
    _test_getItems(): Array<IDataBankItemForTest>;
    _test_getItem(key: string): IDataBankItemForTest;
    add<TData>(key: string, data: TData, options?: IDataOptions): boolean;
    get<TData>(key: string): TData;
    remove(key: string): boolean;
    clear(): void;
    updateItemOptions(key: string, options: IDataOptions): boolean;
    getExpired(): IKeyData[];
    getSnapshot(): string;
    loadFromSnapshot(snapshot: string): void;
    private updateOptionsOnBankDataItem;
    private getSizeOfDataBankItemWrapper;
    private freeUpForSize;
}
