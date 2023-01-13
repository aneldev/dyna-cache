# DynaCache v3

Caches something and provides it immediately.

Preload, refresh features out of the box.

# createDynaCache

This factory function creates another function that uses the cache behind this.

## Example

Suppose we have this interface of articles
```
interface ITestArticle {
  title: string;
  body: string;
}
```

And this api method that loads the articles from the backend

```
const apiLoadArticles = async (args: {lang: string, group: string}): Promise<ITestArticle[]> => [];
```

Let's make api method cacheable version of it

```
const apiLoadArticlesCacheEngine = createDynaCache({
  load: apiLoadArticles,
  expireAfterMinutes: 10,
});
```

The `apiLoadArticlesCacheEngine` is na object, with the `load(args: TArgs)` method that returns data.

Thanks to typescript, the function has all types obtained from the `load` method, for the args and for the output.
So we don't have to define anything to the generics of the `createDynaCache`.

**Let's use it**
```

apiLoadArticlesCacheEngine.load({lang: 'en', group: 'fashion'})     // We pass the object as we do with the apiLoadArticles
  .then(articles => {
    // We have types articles here
    articles.forEach(article => {
      console.log('Title', article.title);
    });
  });
```

## Configuration object of the `createDynaCache`

```
interface ICreateDynaCacheConfig<TArgs, TData, > {
  load: (args: TArgs) => Promise<TData>; // The load operation
  expireAfterMinutes?: number;            // When the cache expires, undefined for none
  preload?: boolean;                      // Preload the data on start
  refreshEveryMinutes?: number;           // Refresh the data silently on background
}
```

## Invalidate the cache

To invalidate the cache (to clear the content of the cache) call the `invalidate()`

`apiLoadArticlesCacheEngine.invalidate();`


## Don't forget to free() it!

Cache keeps resources for refreshing, etc.

If you are going to free the owner of it, your have to call the `.free()` also!

Just `apiLoadArticlesCacheEngine.free()`.

## How does it works internally?

The `apiLoadArticlesCacheEngine` creates internally small caches for each different `args`.

If you ask the same args, then the cached version will be served.


# DynaCache

This is how to create a DynaCache class.

## Config
```
 interface IDynaCacheConfig<TData> {
  load: () => Promise<TData>;       // The load operation

  expireAfterMinutes?: number;      // When the cache expires, undefined for none
  preload?: boolean;                // Preload the data on start
  refreshEveryMinutes?: number;     // Refresh the data silently on background
  onLoad?: (data: TData) => void;   // Called when the data are loaded for any reason
}
```

## Methods

- `load(): Promise<TData>` load from cache or from source if it is not yet cached
- `loadFresh(): Promise<TData>` load fresh data (not from cache)
- `invalidate(): void` clear the cache, all further loads will be new
- `free(): void` destroy the cache (cleans up auto refresh cache)

## Properties

- `get size(): number` returns the size of the cache in bytes
- `get loadedAt(): number` timestamp when the last load took place
- `get lastUsedAt(): number` timestamp when the cache read last time
- `get loadCount(): number` how many the cache was updated
- `get lastError(): any` last load error

## Example
```
// Factory function that create a DynaCache with specific args and api method
// This function just connects that arguments with the api method
const createLoadArticlesCache = (lang: string, group: string) =>
  new DynaCache({
    expireAfterMinutes: 10,
    load: () => apiLoadArticles(lang, group),
  });

// Lets create a cache for the epi
const loadArticlesCache = createLoadArticlesCache('en', 'fashion');

// Lets use it
loadArticlesCache.load(); // The return is always up to date and fast

// Don't forget to free() it to avoid memory leaks!
// This is needed when `expireAfterMinutes` or `refreshEveryMinutes`
loadArticlesCache.free();
// Note, now you cannot use it anymore
```

# Change log

## v3

V3 is totally different approach than V2.

V3 offers plus

- preload
- refresh
- cache factory (cache key by args object)
- simpler code (1/4 of the previous one)

## v2

For v2 open [this](https://github.com/aneldev/dyna-cache/tree/v2.0.1) page.
