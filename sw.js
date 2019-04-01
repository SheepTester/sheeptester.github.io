// service worker version 4.0

// old indexedDB database; not used anymore, so should delete eventually
// indexedDB.deleteDatabase('sheeptester-urls');

self.addEventListener('install', e => {
  self.skipWaiting();
});
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => {
    const url = new URL(e.request.url);
    const isLocal = url.hostname === 'sheeptester.github.io' || url.hostname === 'localhost';
    return caches.match(e.request, {ignoreSearch: isLocal});
  }));
});
self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});
