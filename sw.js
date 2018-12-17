// service worker version 03

const CACHE_NAME = 'sheeptester-cache';
const URL_DB = 'sheeptester-urls';

let urlsToAdd = [];
let db;
const dbReq = indexedDB.open(URL_DB);
dbReq.onsuccess = e => db = e.target.result;
dbReq.onupgradeneeded = e => {
  db = e.target.result;
  db.createObjectStore('urls', {keyPath: 'url'});
};

let saveTimeout = null;
function eventuallySaveURLS() {
  if (!saveTimeout) {
    saveTimeout = setTimeout(() => {
      const transaction = db.transaction(['urls'], 'readwrite');
      const objectStore = transaction.objectStore('urls');
      Promise.all(urlsToAdd.map(url => new Promise(res => {
        const req = objectStore.add({url: url});
        req.onsuccess = res;
        req.onerror = e => {
          e.preventDefault();
          e.stopPropagation();
          res();
        };
      }))).then(() => {
        saveTimeout = null;
      });
      urlsToAdd = [];
    }, 1000);
  }
}

self.addEventListener('install', e => {
  self.skipWaiting();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const local = url.hostname === 'sheeptester.github.io' || url.hostname === 'localhost';
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok || res.type === 'opaque') {
      if (local) {
        if (!urlsToAdd.includes(url.pathname)) {
          urlsToAdd.push(url.pathname);
          eventuallySaveURLS();
        }
      } else {
        if (!urlsToAdd.includes(url.href)) {
          urlsToAdd.push(url.href);
          eventuallySaveURLS();
        }
      }

      const resCopy = res.clone();
      caches.match(e.request, {ignoreSearch: local}).then(cachedResponse => {
        if (cachedResponse)
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, resCopy)); // update cache
      });
    }
    return res;
  }).catch(() => caches.match(e.request, {ignoreSearch: local})));
});
self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('message', e => {
  switch (e.data.type) {
    case 'all-urls':
      db.transaction(['urls']).objectStore('urls').getAllKeys().onsuccess = ev => {
        e.ports[0].postMessage({type: 'all-urls', urls: ev.target.result});
      };
      break;
    case 'cached-urls':
      caches.open(CACHE_NAME).then(cache => cache.keys()).then(responses => {
        e.ports[0].postMessage({type: 'cached-urls', urls: responses.map(res => {
          const url = new URL(res.url);
          return url.hostname === 'sheeptester.github.io' || url.hostname === 'localhost'
            ? url.pathname
            : url.href
        })});
      });
      break;
    case 'cache':
      caches.open(CACHE_NAME).then(cache => cache.add(new Request(e.data.url))).then(() => {
        e.ports[0].postMessage({type: 'cache-done', url: e.data.url});
      });
      break;
    case 'uncache':
      caches.open(CACHE_NAME).then(cache => cache.delete(new Request(e.data.url))).then(() => {
        e.ports[0].postMessage({type: 'uncache-done', url: e.data.url});
      });
      break;
    default:
      console.log('uhh... what am i supposed to do with', e.data);
  }
});
