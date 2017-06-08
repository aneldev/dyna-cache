declare let window: any, global: any, describe: any, expect: any, it: any;
import {DynaCache} from "./../src";

let dnCache = new DynaCache({cacheLimit: 5000000});

if (typeof window !== 'undefined') window.dnCache = dnCache;

describe('DynaCache', () => {

  function createData(length: number): any {
    let text: string = '';
    for (let i: number = 0; i < length - 11; i++)text += '_';
    return {text};
  }

  it('test mock-jest', (done: Function) => {
    expect(true).toBe(true);
    setTimeout(done, 1000);
  });

  it('has added the initial items', () => {
    dnCache.add('s500', {name: 'John'},);
    dnCache.add('s501', {name: 'Mary'}, {expiresIn: '2D'});
    dnCache.add('s502', {name: 'Nancy'});

    expect(dnCache._test_getItems().length).toBe(3);
  });

  it('has added thousand items', () => {
    let check: boolean = true;
    for (let i: number = 0; i < 962; i++)
      check = check && dnCache.add('dynamic' + i, createData(5000));

    expect(check).toBe(true);
  });

  it('snapshot size does no exceed the limit', () => {
    let check: boolean = JSON.stringify(dnCache.getSnapshot()).length <= 5000000;
    expect(check).toBe(true);
  });

  let snapshot: string;
  let size: number;
  let itemsCount: number;

  it('should get snapshot', () => {
    size = dnCache.getMemSize();
    snapshot = dnCache.getSnapshot();
    expect(snapshot.length > 4500000).toBe(true);
  });

  it('should clear the memory, size==0', () => {
    itemsCount = dnCache.getItemsCount();
    dnCache.clear();
    expect(dnCache.getMemSize() === 0).toBe(true);
  });

  it('should clear the memory, items count == 0', () => {
    expect(dnCache._test_getItems().length === 0).toBe(true);
  });

  it('should load from snapshot', () => {
    dnCache.loadFromSnapshot(snapshot);
    expect(true).toBe(true);
  });

  it('should have correct item count after load snapshot', () => {
    dnCache.loadFromSnapshot(snapshot);
    expect(dnCache._test_getItems().length === itemsCount).toBe(true);
  });

  it('should have correct size after load snapshot', () => {
    dnCache.loadFromSnapshot(snapshot);
    expect(dnCache.getMemSize() === size).toBe(true);
  });

  it('should add one big data of 5k', () => {
    let check: boolean;
    check = dnCache.add('dynamic_p2', createData(5000));
    expect(check).toBe(true);
  });

  it('snapshot size does no exceed the limit', () => {
    let check: boolean = JSON.stringify(dnCache.getSnapshot()).length <= 5000000;
    expect(check).toBe(true);
  });

  it('has added another thousand items', () => {
    let check = true;
    for (let i = 0; i < 1000; i++)
      check = check && dnCache.add('dynamic' + i, createData(5000));
    expect(check).toBe(true);
  });

  it('snapshot size does no exceed the limit', () => {
    let check: boolean = JSON.stringify(dnCache.getSnapshot()).length <= 5000000;
    expect(check).toBe(true);
  });

  it('adds item with expiration', () => {
    expect(dnCache.add('#expire12', {name: 'John'}, {expiresIn: '5ms'})).toBe(true);
  });

  it('has the item with expiration', () => {
    let check: boolean = !!dnCache.get('#expire12');
    expect(check).toBe(true);
  });

  it('has now the item with expiration, cause is expired', (done: ()=>void) => {
    setTimeout(() => {
      let check: boolean = !!!dnCache.get('#expire12');
      expect(check).toBe(true);
      done();
    }, 2500);
  });

  it('should trigger the onExpire and onRemove events', (done: ()=>void) => {
    let expiredMainTriggered : boolean = false;
    let removedMainTriggered : boolean = false;
    let expiredItemTriggered : boolean = false;
    let removedItemTriggered : boolean = false;
    let isRemoved: boolean = false;
    dnCache.updateOptions({
      onExpire: () => expiredMainTriggered = true,
      onRemove: () => removedMainTriggered = true
    });
    dnCache.add('expiration_test_100', {name: 'john'});
    let updatedItemOptions = dnCache.updateItemOptions('expiration_test_100', {
      expiresIn: '500ms',
      onExpire: (key: string, isRemoved_: boolean) => {
        expiredItemTriggered = true;
        isRemoved = isRemoved_;
      },
      onRemove: () => removedItemTriggered = true
    });

    setTimeout(() => {
      let check: boolean =
        updatedItemOptions &&
        expiredItemTriggered &&
        removedItemTriggered &&
        isRemoved &&
        dnCache.get('expiration_test_100') === undefined;
      expect(check).toBe(true);
      dnCache.updateOptions({
        onExpire: undefined,
        onRemove: undefined
      });
      done();
    }, 1500);
  });

  it('should keep expired items if keepExpired is set to true', (done: () => void) => {
    let isExpired: boolean = false;
    let isRemoved: boolean = null;
    dnCache.add('dddd-keepExpired-test-2', 'data', {
      expiresIn: 100,
      onExpire: (key: string, isRemoved_: boolean) => {
        isExpired = true;
        isRemoved = isRemoved_;
      },
      keepExpired: true
    });

    setTimeout(() => {
      let finallyRemoved = dnCache.remove('dddd-keepExpired-test-2');
      let check: boolean = isExpired && !isRemoved && finallyRemoved;
      expect(check).toBe(true);
      done();
    }, 1500);
  });

  it('add a new undeletable item', () => {
    let check: boolean = dnCache.add('undeletable', 'data', {doNotRemove: true});
    expect(check).toBe(true);
  });

  it('has added another thousand items', () => {
    let check = true;
    for (let i = 0; i < 1500; i++)
      check = check && dnCache.add('dynamic' + i, createData(5000));
    expect(check).toBe(true);
  });

  it('should still have the undeletable (via remove)', () => {
    let check: boolean = dnCache.remove('undeletable');
    expect(check).toBe(true);
  });

  it('should not have the undeletable anymore', () => {
    let check: boolean = !!!dnCache.get('undeletable');
    expect(check).toBe(true);
  });

  it('should memory consumption more than 4.5mb', () => {
    let check: boolean = dnCache.getMemSize()>4500000;
    expect(check).toBe(true);
  });

  it('should reduce the memory usage because of updateOptions', () => {
    dnCache.updateOptions({cacheLimit: 2000000});
    let check: boolean = dnCache.getMemSize() > 1300000 && dnCache.getMemSize() <= 2000000;
    expect(check).toBe(true);
  });

  it('has added another thousand items, to get close to 5mb mem size', () => {
    dnCache.updateOptions({cacheLimit: 5000000});
    let check = true;
    for (let i = 0; i < 1500; i++)
      check = check && dnCache.add('dynamic' + i, createData(5000));
    expect(check).toBe(true);
  });

  it('should memory consumption more than 4.5mb', () => {
    let check: boolean = dnCache.getMemSize() > 4500000;
    expect(check).toBe(true);
  });

  it('load bigger snapshot but not exceeding the memory', () => {
    dnCache.add('latest-item', 'hola');
    let snapshot:string = dnCache.getSnapshot();
    dnCache.clear();
    dnCache.updateOptions({cacheLimit: 2000000});
    dnCache.loadFromSnapshot(snapshot);
    let check: boolean = dnCache.getMemSize() > 1300000 && dnCache.getMemSize() <= 2000000;
    expect(check).toBe(true);
  });

  it('should have the latest item', () => {
    let check: boolean = dnCache.get('latest-item')==='hola';
    expect(check).toBe(true);
  });


});
