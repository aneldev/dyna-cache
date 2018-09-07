export declare function expireIn(expireInTime: string | number): number;
export declare function JSONStringify(object: any, valueForCircularReferences?: string): string;
export declare function objectSize(obj: any): number;
export declare function sizeOfItem(key: string, data: any): number;
export declare function getNowAsNumber(): number;
export declare function validateObjPropertiesAndConsoleError(obj: any, validProperties: string[], errorMessage: string): void;
export declare function getCRC32(str: string): string;
export declare function getObjectCRC32(obj: any): string;
