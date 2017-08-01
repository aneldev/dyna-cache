# About

`dyna-cache` is a data holder that controls the memory size that uses to do not exceed a limit. 

It ensures that your nodejs server will not exceed a memory limit while in the browser you keep a small cache where you can save it easily in a localstore or so.

# Installation

npm install --save dyna-cache

# Usage

```
import {DynaCache} from "dyna-cache";

let myCache = new DynaCache(); // default cache limit is 5mb

myCache.add(
  'id-product-0',
  {name: 'Bubble bobble', price: 25.00},
);

let cachedItem = myCache.get('id-product-0');

if (cachedItem) {
  console.log(`Cached product ${cachedItem.name}`);
}
else{
  console.log('Product not found in cache, should be retrieved');
}
```

# Description

The api is consisted of few methods, like `add`, `get` and `remove`. It works like a dictionary, it uses keys as ids.

With `getSnapshot` and `loadFromSnapshot` you can save and load the cache and use it as a database. You can save it or send it to another application.

**By default the Cache is limited to 5mb**, however this can be changed in DynaCache options. 

*Note*: The memory is counted by characters. A character might use more than one byte; for instance the Chinese characters take 4-5 bytes. So the real memory usage varies according the char coding. 

# DynaCache options (IDynaCacheOptions)

You can create a Dyna Cache by this script: 

`let myCache = new DynaCache();`

this creates a Cache of 5mb limit by default.

You can create any other size with options, for instance for 150mb this is the script:

`let myCache = new DynaCache({cacheLimit: 150000000});`

All options are optional.

| option name | type | default | description |
| --- | --- | --- | --- |
| cacheLimit | number | 5000000 | The cache limit in bytes. (5000000 == 5mb) |
| onRemove | function (key: string) | undefined | Function called when any key is removed |
| onExpire| function (key: string) | undefined | Function called when any key is expired (see the IDataOptions later) | 

# DynaCache Methods
| method  | returns | description |
| ------  | ------ | ------ |
| updateOptions(options: IDynaCacheOptions) | undefined | Updates the options DynaCache (by merge).
| add(key: string, data: any, options?: IDataOptions) | boolean: if the item is saved in cache; if there is no space it won't be saved.| It adds an item or updates an existing one by key. Updates the `data` and or `options` (by overwrite) of the item. |
| get(key: string) | any: the data for this key |It returns the saved data for this key or `undefined` in case there is not item for this key. |
| remove (key: string) | boolean: true if the key was existed and removed | Removes the item with this key |
| clear() | undefined | Clears the cache, no events are triggered. |
| getMemSize() | number: The memory size used by the cache in bytes | It returns the occupied memory by cache in bytes. |
| getItemsCount() | number: The number of the added items | Returns the number of the added items. |
| updateItemOptions(key: string, options: IDataOptions) | boolean: true if the item exists and it is updated with the new options | Updates the options of an existing item by key (by overwrite). |
| getExpired() | IKeyData[]: array with {key: string, data: any} objects | Returns the items that are expired but because of their option `keepExpired: true` in IDataOptions these items are still in cache. |
| getSnapshot() | string: a snapshot of the cache | Gets a snapshot of the cache in order to save it somewhere and reload it with `loadFromSnapShot`. |
| loadFromSnapshot(snapshot: string) | nothing but it raises exception in case of faulty snapshot parse | Clears the Cache and loads the cache from this snapshot. (read for more lower) |
| generateKeyForObject(obj: any) | string: crc32 | Generates key by object, useful to create easy keys by objects with the same structure and values. |

# Item options (IDataOptions)

Each item in the cache may have some options. 
These options can be defined initially by the `add` method, updating the item by `add` or by the `updateItemOptions` method.

| option name | type | default | description |
| --- | --- | --- | --- |
| expiresIn | number _or_ string | undefined | When these items will be expired. The expired items by default are removed from the cache!  Number for ms or string followed by `ms`, `s`, `m`, `h`, `d`, `w`, `mo` and `y` for milliseconds, seconds, minutes, hours, days, weeks, months and years respectively. Examples: 1000 2s 3m 1d 2.5mo |
| keepExpired | boolean | false | If true, the item will be not removed from the cache when it is expired |
| onRemove | function(key: string) | undefined | Function called when this item will be removed |
| onExpire | function(key: string, is Removed: boolean) | undefined | Function called when the item is expired. As argument takes and the isRemoved, where indicates if the item is removed also from the cache. |

# Features

## Expire items

**Expire items** is a feature where one or more items can be expired and removed from the Cache after a timeout.

By default none item can be expired although it can be removed if there is not enough space for new items but this has nothing to do with the **expire feature**.

An item can be expired if we set expire options on the item:

`dnCache.add('myKey', 'data', {expiresIn: '30m', onExpire: (key, isRemoved) => console.log('item expired ', key)})`

This will add the item with this key and data, and this item will be expired in thirty minutes. The callback will be called with this console message. The argument `isRemoved` will be true as all expired items are removed automatically.
 
Is some cases we don't want to remove the expired items. We can do this by supplying the `keepExpired: true`. 

`dnCache.add('myKey', 'data', {expiresIn: '30m', onExpire: (key, isRemoved) => console.log('item expired ', key), keepExpired: true)}`

In this case the item will remain in Cache on Expire and again the callback will be executed.

The *expired* items can be obtained by the `getExpired` method.

All expired items can be removed automatically by the Cache engine, if on `add` there is no free space of new items. To keep an item permanently in the Cache you have to set the option `doNotRemove: true`.

## Snapshots

The snaphots are consisted of two only functions.

### getSnapshot(): string

Returns a string when can be used by the `loadFromSnapshot` method.

The size of the sw will not exceed the cache limit `cacheLimit`.
 
### loadFromSnapshot(snapshot: string): undefined

By this method, you clear the cache and load items from a snapshot. Therefore the cache will have only items saved in the snapshot.
 
If an item is expired since the snapshot is taken, the item will be removed from the cache, but the function `onRemove`, `onExpire` of the item options (IDataOptions) cannot be called. But the `onRemove`, `onExpire` of the DynaCache (IDataOptions) will be called with these keys.

If the the running Cache uses smaller cache limit `cacheLimit`, items will be removed in order to make space. The `onRemove` of the DynaCache (IDataOptions) will be called. Note that in this case, instantly the Cache will occupy the amount of the memory needed to load the snapshot and it will reduce it removing the older used items.

# FAQ

## When an item is removed?

An item is removed when
- the object user called the `remove` method with the key of this item
- there is no enough memory adding an item; in order to make room for new items *the older used items* that are removed
- the item is expired because `expiresIn` property in item's options and when the `keepExpired` isn't set to true

Items with option `doNotRemove: true` will be never removed automatically, except if removed by the `remove` method.

## In which case an item cannot be saved in the Cache (using the add method)?

When it is too big according to the `cacheLimit` and cannot make room for it (removing other and unused items).

## Which items can be `expired` and remain in cache?

The expired items with the option `keepExpired: true`.

## Why to set an item `keepExpired: true`?

This is a very nice feature. Imagine that you use this cache to cache your network requests. You have some very expensive requests and you want to keep them updated.

You save the responses with these options `{expiresIn: '2h', keepExpired: true, onExpire: onGetStockXExpired}`. 
 
These options say that the item is expired in two hours, but do not remove it (`keepExpired`) and on Expire call the onGetStockXExpired.

Once the item is expired the onGetStockXExpired will be called to fetch new stock values and update them (by `add` method). 

While this resource is expensive _and might fail_, in the meantime we don't want to lose this data but keep them available.

Cheating this way we still serve the user with data while you try to fetch the new one.

# Important notes

## Regarding the `key` of an item

Behind the scenes, this library uses the Javascript Dictionary (where is extremely fast). According to Javascript, numeric keys are equal if are represented as strings.
 
That means: 

```
let obj = {};
obj['2'] = 'data for 2';
console.log(obj['2']);      // prints 'data for 2'
console.log(obj[2]);        // prints 'data for 2'!!!
```
So we have:
```
let dnCashe = new DynaCache();
dnCache.add('2', 'data for 2');
dnCache.add('2.5', 'data for 2.5');
console.log(dnCache.get('2'));      // prints 'data for 2'
console.log(dnCache.get(2));        // prints 'data for 2' !!!
console.log(dnCache.get('2.5'));    // prints 'data for 2.5'
console.log(dnCache.get(2.5));      // prints 'data for 2.5' !!!
console.log(dnCache.get('2.5')===dnCache.get(2.5));  // prints true even if the data was object
```

## Regarding the `data` of an item

The data should be able to by JSON stringified. The cache itself doesn't change the data but if you are going to use the snapshots the data should be able to be stringified. 

# Examples

## JavaScript example

```
// import DynaCache
import {DynaCache} from "dyna-cache";

// create a cache, default cache limit is 5mb
let customersCache = new DynaCache();

// play around with it
let isAdded = customersCache.add('id-cust-1', {name: 'John', age: 32});
let customer = customersCache.get('id-cust-1');
let customerFound = !!customer;
let age;

if (customerFound) age = customer.age;

console.log(`Customer added: ${isAdded} and his age is ${age}`);

// create another cache with a different cache limit
let cacheProductsOptions = {cacheLimit: 3000000};
let productsCache = new DynaCache(cacheProductsOptions);

// play around with it
let product = {description: 'Train', price: 20.34};
productsCache.add('id-train-544', product);

let cachedProduct = productsCache.get('id-train-544');

console.log('Same product object for the Train', product === cachedProduct);

// create a product that will expire in 1 second and we will console it
customersCache.add(
  'id-product-2',
  {name: 'Bubble bobble', price: 25.00},
  {expiresIn: '1s', onExpire: () => console.log('Bubble bobble is expired')}
);
```

## TypeScript example 

*The same javascript above example in Typescript.*

```
// import DynaCache and some interface (optionally)
import {DynaCache, IDataOptions, IDynaCacheOptions} from "dyna-cache";

// create a cache, default cache limit is 5mb
let customersCache: DynaCache = new DynaCache();

// declare a customer interface
interface ICustomer {
  name: string,
  age: number
}

// play around with it
let isAdded: boolean = customersCache.add('id-cust-1', {name: 'John', age: 32});
let customer: ICustomer = customersCache.get('id-cust-1');
let customerFound: boolean = !!customer;
let age: number;

if (customerFound) age = customer.age;

console.log(`Customer added: ${isAdded} and his age is ${age}`);

// create another cache with a different cache limit
let cacheProductsOptions: IDynaCacheOptions = {cacheLimit: 3000000};
let productsCache: DynaCache = new DynaCache(cacheProductsOptions);

// declare a product interface
interface IProduct {
  name: string,
  price: number
}

// play around with it
let product: IProduct = {name: 'Train', price: 20.34};
productsCache.add('id-train-544', product);

let cachedProduct: IProduct = productsCache.get('id-train-544');

console.log('Same product object for the Train', product === cachedProduct);

// create a product that will expire in 1 second and we will console it
customersCache.add(
  'id-product-2',
  {descirption: 'Bobble bubble', price: 25.00},
  {expiresIn: '1s', onExpire: () => console.log('Bobble bubble is expired')} as IDataOptions
);
```

## Fetch example (in typescript)

See the example located in `debug/fetch-example.ts`.

# Fork, Debug, Build, Deploy

This project is written in Typescript with ES6 (stage 2) but you can also use it also from the native Javascript code, in NodeJs and on any browser.

This project is? made with [dyna-ts-module-boilerplate](https://github.com/aneldev/dyna-ts-module-boilerplate)

Feel free to fork it, have fun.
