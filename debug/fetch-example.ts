declare let
  global: any,
  describe: any, it: any, expect: any;

import {DynaCache} from "../src/index";

class Fetch {
  private cache = new DynaCache({cacheLimit: 3000000});
  private expireTimeout: string = '30m';

  public fetch(url: string, query: any = {}, params: {}, onReceive: (data: string) => void): void {
    let key: string = this.cache.generateKeyForObject({url, query, params});
    let cached: string = this.cache.get(key);
    if (!cached) {
      onReceive(cached);
    }
    else {
      // todo: request data from internet according all function arguments; for now return something for test only
      onReceive(`data for url: ${url} hashCode: ${Math.random().toString()}`);
    }
  }
}


let fetch = new Fetch();

let googleData: string;
let bingData: string;

function step1() {
  fetch.fetch('https://www.google.com', {q: 'u2 in norway'}, null, (data) => {
    googleData = data;
    step2();
  });
}

function step2(){
  fetch.fetch('https://www.bing.com', {q: 'u2 in norway'}, null, (data) => {
    bingData = data;
    step3();
  });
}

function step3(){
  fetch.fetch('https://www.google.com', {q: 'u2 in norway'}, null, (data) => {
    if (data === googleData)
      console.log('Correct, the data from google.com are exactly the same (from cache)');
    else
      console.error('bug! - this can never happen man! -');
    step4();
  });
}

function step4(){
  fetch.fetch('https://www.bing.com', {q: 'u2 in norway'}, null, (data) => {
    if (data === bingData)
      console.log('Correct, the data from bing.com are exactly the same (from cache)');
    else
      console.error('bug! - this can never happen man! -');
  });
}

step1();
