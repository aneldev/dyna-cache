# DynaCache

Caches something and provides it immediately.

Preload, refresh features out of the box.

# createDynaCache

This factory function creates another function that uses the cache behind this.

# Example

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
const apiLoadArticlesCache = createDynaCache({
  load: apiLoadArticles,
  expireAfterMinutes: 10,
});
```

The `apiLoadArticlesCache` is na object, with the `load(args: TArgs)` method that returns data.

Thanks to typescript, the function has all types obtained from the `load` method, for the args and for the output. 
So we don't have to define anything to the generics of the `createDynaCache`.

**Let's use it**
```

apiLoadArticlesCache.load({lang: 'en', group: 'fashion'})     // We pass the object as we do with the apiLoadArticles
  .then(articles => {
    // We have types articles here
    articles.forEach(article => {
      console.log('Title', article.title);
    });
  });
```

# Configuration object of the `createDynaCache`

```
interface ICreateDynaCacheConfig<TArgs, TData, > {
  load: (args: TArgs) => Promise<TData>; // The load operation
  expireAfterMinutes?: number;            // When the cache expires, undefined for none
  preload?: boolean;                      // Preload the data on start
  refreshEveryMinutes?: number;           // Refresh the data silently on background
}
```

## Don't forget to free it!

Cache keeps resources and you have to free them if you don't use them any more.

Just `apiLoadArticlesCache.free()`.

## How does it works internally?

The `apiLoadArticlesCache` creates internally small caches for each different `args`.

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
