import {DynaCache} from "./DynaCache";
import {createDynaCache} from "./createDynaCache";

interface ITestArticle {
  title: string;
  body: string;
}

// An api method that load items from the internet
const apiLoadArticles = async (args: {lang: string; group: string}): Promise<ITestArticle[]> => {
  args;
  return [];
};

// Factory function that create a DynaCache with specific args and api method
// This function just connects that arguments with the api method
const createLoadArticlesCache = (lang: string, group: string) =>
  new DynaCache({
    expireAfterMinutes: 10,
    load: () => apiLoadArticles({
      lang,
      group,
    }),
  });

// Let's create a cache for the epi
const loadArticlesCache = createLoadArticlesCache('en', 'fashion');

// Let's use it
loadArticlesCache
  .load() // The return is always up-to-date and fast
  .then(articles => {
    articles.forEach(article => {
      console.log('Title', article.title);
    });
  });

// Don't forget to free() it to avoid memory leaks!
// This is needed when `expireAfterMinutes` or `refreshEveryMinutes`
loadArticlesCache.free();

const apiLoadArticlesCache = createDynaCache({
  load: apiLoadArticles,
  expireAfterMinutes: 10,
});

apiLoadArticlesCache.load({
  lang: 'en',
  group: 'fashion',
})
  .then(articles => {
    articles.forEach(article => {
      console.log('Title', article.title);
    });
  });

apiLoadArticlesCache.free();
