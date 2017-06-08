import {expireIn, getNowAsNumber, getObjectCRC32, sizeOfItem, validateObjPropertiesAndConsoleError} from "./utils";

const extraSizeForSnapshot: number = 13;

export interface IDynaCacheOptions {
  cacheLimit?: number;
  onRemove?: (key: string) => void;
  onExpire?: (key: string, isRemoved: boolean) => void;
}

const validOptionProperties: string[] = [
  'cacheLimit', 'onRemove', 'onExpire'
];

export interface IKeyData {
  key: string;
  data: any;
}

interface IDataBank {
  [key: string]: IDataBankItem;
}

export interface IDataBankItem {
  key?: string;
  data: any;
  size: number;
  lastRead: number;
  expiresAt?: Date;
  expiresTimerHandler?: any;  // object for nodejs number for browsers (number is in browsers, object in nodejs!)
  onRemove?: (key: string) => void;
  onExpire?: (key:string, isRemoved: boolean) => void;
  keepExpired?: boolean;
  isExpired?: boolean;
  doNotRemove?: boolean;
}

export interface IDataBankItemForTest extends IDataBankItem {
  key: string;
}

export interface IDataOptions {
  expiresIn?: number | string;    // <nummber><''|ms|s|m|h|d|w|mo|y>, examples: 1000 2s 3m 1d 2.5mo
  keepExpired?: boolean;          // default: false
  doNotRemove?: boolean;
  onRemove?: (key: string) => void;
  onExpire?: (key: string, isRemoved: boolean) => void;
}

const validItemOptionProperies: string[] = [
  'expiresIn', 'onRemove', 'onExpire', 'keepExpired', 'doNotRemove'
];

export class DynaCache {

  private options: IDynaCacheOptions = {
    cacheLimit: 5000000
  };

  private dataBank: IDataBank = {};
  private size: number = 0;
  private dataBankItemWrapperSize: number = 0;
  _debug_sizeOfItem = sizeOfItem;

  constructor(options: IDynaCacheOptions = {}) {
    validateObjPropertiesAndConsoleError(options, validOptionProperties, 'dyna-cache: these options are not recognized');
    this.dataBankItemWrapperSize = this.getSizeOfDataBankItemWrapper();

    this.options = {
      ...this.options,
      ...options
    };
  }

  public updateOptions(options: IDynaCacheOptions): void {
    this.options = {
      ...this.options,
      ...options,
    };

    this.freeUpForSize(0);
  }

  private defaultItemDataOptions: IDataOptions = {
    expiresIn: null,
    keepExpired: false,
    doNotRemove: false,
  };

  public generateKeyForObject(obj: any): string{
    return '#k_'+getObjectCRC32(obj);
  }

  public getMemSize(): number {
    if (this.getItemsCount())
      return this.size - extraSizeForSnapshot;
    else
      return 0;
  }

  public getItemsCount(): number {
    return Object.keys(this.dataBank).length;
  }

  public _test_getItems(): Array<IDataBankItemForTest> {
    return Object.keys(this.dataBank)
      .map((key: string) => ({...this.dataBank[key], key} as IDataBankItemForTest))
  }

  public _test_getItem(key: string): IDataBankItemForTest {
    return this._test_getItems().find((item: IDataBankItemForTest) => item.key === key);
  }

  public add(key: string, data: any, options: IDataOptions = this.defaultItemDataOptions): boolean {
    let saved: boolean = false;
    let oldItem: IDataBankItem = this.dataBank[key];
    let newItemSize: number = sizeOfItem(key, data) + this.dataBankItemWrapperSize;

    if (oldItem) this.size -= oldItem.size;

    if (!oldItem || (newItemSize > oldItem.size)) {   // if there is no old item with the same key or there is and the new is bigger
      this.freeUpForSize(newItemSize);                // make room for the new one
    }

    let newItem: IDataBankItem = {
      data,
      size: newItemSize,
      lastRead: getNowAsNumber(),
    };

    if (this.size + newItemSize <= this.options.cacheLimit) {
      this.dataBank[key] = newItem;
      this.size += newItemSize;
      saved = true;
    }

    this.updateOptionsOnBankDataItem(key, newItem, options, saved);

    return saved;
  }

  public get(key: string): any {
    let item: IDataBankItem = this.dataBank[key];
    if (item) {
      item.lastRead = getNowAsNumber();
      return item.data;
    }
    else {
      return undefined;
    }
  }

  public remove(key: string): boolean {
    let item: IDataBankItem = this.dataBank[key];
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

  public clear(): void {
    Object.keys(this.dataBank)
      .forEach((key: string) => {
        const item:IDataBankItem = this.dataBank[key];
        if (typeof item.expiresTimerHandler !== null) {
          clearTimeout(item.expiresTimerHandler as any);
        }
      });

    this.dataBank = {};
    this.size = 0;
  }

  public updateItemOptions(key: string, options: IDataOptions): boolean {
    let item: IDataBankItem = this.dataBank[key];
    if (item) {
      this.updateOptionsOnBankDataItem(key, item, options, true);
      return true;
    }
    else {
      return false;
    }
  }

  public getExpired(): IKeyData[] {
    return Object.keys(this.dataBank)
      .map(key => ({key, info: this.dataBank[key]}))
      .filter(item => item.info.isExpired)
      .map(item => ({key: item.key, data: item.info.data}));
  }

  public getSnapshot(): string {
    let dataBank: IDataBank = {};

    Object.keys(this.dataBank).forEach((key: string) => {
      let item: IDataBankItem = Object.assign({}, this.dataBank[key]);
      item.expiresTimerHandler = null;
      dataBank[key] = item;
    });

    let snapBin: any = {dataBank};

    try {
      return JSON.stringify(snapBin);
    }
    catch (error) {
      error.message = 'dyna-cache, getSnapshot: ' + (error.message || 'unknown error stringifying the data');
      throw error;
    }
  }

  public loadFromSnapshot(snapshot: string): void {
    try {
      this.clear();

      let snapBin: any = JSON.parse(snapshot);
      let keysToRemove: string[] = [];

      this.dataBank = snapBin.dataBank;
      this.size = 0;

      Object.keys(this.dataBank).forEach((key: string) => {
        let item: IDataBankItem = this.dataBank[key];
        this.size += item.size;

        if (item.expiresAt) {
          let expiresIn: number = (new Date(item.expiresAt)).getTime() - (new Date()).getTime();

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

      keysToRemove.forEach((key: string) => delete this.dataBank[key]);
    }
    catch (error) {
      this.clear();
      error.message = 'dyna-cache, loadFromSnapshot: ' + (error.message || 'unknown error stringifying the data');
      throw error;
    }
  }

  private updateOptionsOnBankDataItem(key: string, item: IDataBankItem, options: IDataOptions, isSaved: boolean): void {
    validateObjPropertiesAndConsoleError(options, validItemOptionProperies, 'dyna-cache, item\'s options: these options are not recognized');

    item.isExpired = false;
    item.keepExpired = !!options.keepExpired;
    item.doNotRemove = !!options.doNotRemove;
    item.onRemove = options.onRemove;
    item.onExpire = options.onExpire;

    // expiresIn
    if (options && options.expiresIn && isSaved) {
      let expiresIn: number = expireIn(options.expiresIn);

      if (item.expiresTimerHandler !== null)
        clearTimeout((item.expiresTimerHandler as any));

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
          if (!item.keepExpired) this.remove(key);
        }, expiresIn);
      }
    }

  }

  // this is executed once to estimate the actual size to be saved in memory with all options
  private getSizeOfDataBankItemWrapper() {
    let key: string = 'test-dyna-cache';
    let data: string = 'data';
    this.add('test-dyna-cache', 'data', {
      expiresIn: '1s',
      onRemove: (key: string) => undefined,
      onExpire: (key, isRemoved: boolean) => undefined,
      keepExpired: true,
    });

    let jsonObjectSeaprator: number = 1;
    let sizeOfSizeValue: number = 10;

    let size =
      sizeOfItem(key, this.dataBank[key])
      - key.length
      - data.length
      + jsonObjectSeaprator
      + sizeOfSizeValue;

    this.remove(key);

    return size;
  }

  private freeUpForSize(sizeInBytes: number): void {
    let optionsMaxLoad = this.options.cacheLimit;

    if (sizeInBytes < optionsMaxLoad - this.size) return; // exit, there is enough space
    if (sizeInBytes > optionsMaxLoad) return;             // exit, this size cannot fit anyway

    let items: IDataBankItem[] = Object.keys(this.dataBank)
      .map((key: string) => ({...this.dataBank[key], key} as IDataBankItem))
      .filter((item: IDataBankItem) => !!!item.doNotRemove)
      .sort((itemA: IDataBankItem, itemB: IDataBankItem) => itemA.lastRead - itemB.lastRead);

    while (this.size + sizeInBytes > optionsMaxLoad) {
      this.remove(items.shift().key);
    }
  }

}
