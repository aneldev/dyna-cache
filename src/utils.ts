export function expireIn(expireInTime:string|number):number{
  if (typeof expireInTime == 'string') expireInTime=(expireInTime as string).toLowerCase();

  if (typeof expireInTime == 'number'){
    return expireInTime as number;
  }
  else if ((expireInTime as string).slice(-2)=='ms'){
    return Number((expireInTime as string).slice(0 ,-2));
  }
  else  if ((expireInTime as string).slice(-2)=='mo'){
    return Number((expireInTime as string).slice(0 ,-2)) * 1000 * 60 * 60 * 24 * 7 * 4;
  }
  else {
    let value: number = Number((expireInTime as string).slice(0, -1)) || -1;
    if (value == -1) return -1; // the text is not number

    switch ((expireInTime as string).slice(-1)) {
      case 's': return value * 1000;
      case 'm': return value * 1000 * 60;
      case 'h': return value * 1000 * 60 * 60;
      case 'd': return value * 1000 * 60 * 60 * 24;
      case 'w': return value * 1000 * 60 * 60 * 24 * 7;
      case 'y': return value * 1000 * 60 * 60 * 24 * 7 * 4 * 12;
      default:
        return -1;
    }
  }
}

export function JSONStringify(object: any, valueForCircularReferences: string = ''): string {
  var cache: any[] = [];
  var output = JSON.stringify(object, function (key: string, value: any) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {		// Circular reference found
        if (valueForCircularReferences)
          return valueForCircularReferences;    // circular reference
        else
          return;
      }
      cache.push(value);						// Store value in our collection
    }
    return value;
  });
  cache = null;
  return output;
}

export function objectSize(obj: any): number {
  return JSONStringify(obj).length;
}

export function sizeOfItem(key: string, data: any): number {
  if (typeof data === "undefined" || data === null) return 0;
  return objectSize(data) + key.length + 10;
}

export function getNowAsNumber():number{
  return (new Date()).getTime();
}

function validateObjProperties(obj: any, validProperties: string[]): string[] {
  let objProps: string[] = Object.keys(obj);
  let invalidProps: string[] = [];
  objProps.forEach((propName: string) => {
    if (validProperties.indexOf(propName) == -1) invalidProps.push(propName);
  });
  return invalidProps;
}

export function validateObjPropertiesAndConsoleError(obj: any, validProperties: string[], errorMessage:string): void {
  let invalidProps:string[]=validateObjProperties(obj, validProperties);
  if (invalidProps.length)
    (console.error || console.log)(`${errorMessage}: [${invalidProps.join()}]`);
}