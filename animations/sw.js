// Service worker to enable SharedArrayBuffer for /animations/ on GitHub Pages,
// which is used by ffmpeg.wasm for multi-threading
// https://stackoverflow.com/a/68675301
// https://github.com/gzuidhof/coi-serviceworker/blob/master/coi-serviceworker.js

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

self.addEventListener('fetch', e => {
  if (
    e.request.cache === 'only-if-cached' &&
    e.request.mode !== 'same-origin'
  ) {
    return
  }
  const url = new URL(e.request.url)
  if (url.hostname === 'unpkg.com' && url.pathname.startsWith('/@ffmpeg')) {
    // HACK: importScripts doesn't let you set crossOrigin = 'anonymous',
    // preventing FFMPEG from loading
    // https://unpkg.com/@ffmpeg/core@0.8.4/dist/ffmpeg-core.js.
    // The FetchEvent for
    // "https://unpkg.com/@ffmpeg/core@0.8.4/dist/ffmpeg-core.js" resulted in a
    // network error response: Cross-Origin-Resource Policy prevented from
    // serving the response to the client.
    e.respondWith(
      fetch(e.request.url).then(response =>
        response
          .blob()
          .then(
            blob =>
              new Response(
                new Blob([blob], { type: response.headers.get('Content-Type') })
              )
          )
      )
    )
  } else if (url.hostname === 'hello.myfonts.net') {
    // Was giving
    // The FetchEvent for "https://hello.myfonts.net/count/31ba49" resulted in a
    // network error response: Cross-Origin-Resource-Policy prevented from
    // serving the response to the client.
    // Fortunately that page seems to be blank anyways, so can just suppress it
    e.respondWith(new Response(new Blob([], { type: 'text/css' })))
  } else {
    e.respondWith(
      fetch(e.request).then(response =>
        response.status === 0
          ? response
          : new Response(response.body, {
              ...response,
              headers: new Headers([
                ...response.headers,
                ['Cross-Origin-Embedder-Policy', 'require-corp'],
                ['Cross-Origin-Opener-Policy', 'same-origin']
              ])
            })
      )
    )
  }
})
