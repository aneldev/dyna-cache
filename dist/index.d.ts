	export function expireIn(expireInTime: string | number): number;
	export function JSONStringify(object: any, valueForCircularReferences?: string): string;
	export function objectSize(obj: any): number;
	export function sizeOfItem(key: string, data: any): number;
	export function getNowAsNumber(): number;
	export function validateObjPropertiesAndConsoleError(obj: any, validProperties: string[], errorMessage: string): void;
	export function getCRC32(str: string): string;
	export function getObjectCRC32(obj: any): string;

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
	export class DynaCache {
	    private options;
	    private dataBank;
	    private size;
	    private dataBankItemWrapperSize;
	    _debug_sizeOfItem: typeof sizeOfItem;
	    constructor(options?: IDynaCacheOptions);
	    updateOptions(options: IDynaCacheOptions): void;
	    private defaultItemDataOptions;
	    generateKeyForObject(obj: any): string;
	    getMemSize(): number;
	    getItemsCount(): number;
	    _test_getItems(): Array<IDataBankItemForTest>;
	    _test_getItem(key: string): IDataBankItemForTest;
	    add(key: string, data: any, options?: IDataOptions): boolean;
	    get(key: string): any;
	    remove(key: string): boolean;
	    clear(): void;
	    updateItemOptions(key: string, options: IDataOptions): boolean;
	    getExpired(): IKeyData[];
	    getSnapshot(): string;
	    loadFromSnapshot(snapshot: string): void;
	    private updateOptionsOnBankDataItem(key, item, options, isSaved);
	    private getSizeOfDataBankItemWrapper();
	    private freeUpForSize(sizeInBytes);
	}

