const CACHE_NAME = 'sheeptester-cache';

async function init() {
  const cache = await caches.open(CACHE_NAME);
  const urls = (await cache.keys()).map(res => res.url);
  for (const link of document.querySelectorAll('.dir a')) {
    const index = urls.indexOf(link.href);
    if (~index) {
      link.classList.add('cached');
      urls[index] = null; // more efficient than splice I heard
    }
  }
  const files = document.getElementById('files');
  files.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      e.target.classList.add('loading');
      if (e.target.classList.contains('cached')) {
        cache.delete(e.target.href).then(success => {
          e.target.classList.remove('loading');
          if (success) e.target.classList.remove('cached');
        });
      } else {
        cache.add(e.target.href).then(() => {
          e.target.classList.remove('loading');
          e.target.classList.add('cached');
        }).catch(err => {
          console.log(err);
          e.target.classList.remove('loading');
        });
      }
      e.preventDefault();
    }
  });
  function makeCacheEntry(url) {
    const entry = document.createElement('div');
    entry.classList.add('cache-entry');
    const removeBtn = document.createElement('button');
    removeBtn.classList.add('cache-remove');
    removeBtn.innerHTML = '&times;';
    removeBtn.addEventListener('click', e => {
      removeBtn.disabled = true;
      entry.classList.add('loading');
      cache.delete(e.target.href).then(success => {
        if (success) entry.parentNode.removeChild(entry);
        else entry.classList.remove('loading');
      });
    });
    entry.appendChild(removeBtn);
    const urlLabel = document.createElement('span');
    urlLabel.classList.add('cache-url');
    urlLabel.textContent = url;
    entry.appendChild(urlLabel);
    return entry;
  }
  const cacheWrapper = document.createElement('div');
  cacheWrapper.classList.add('cache-wrapper');
  const cacheEntries = document.createElement('div');
  cacheEntries.classList.add('cache-entries');
  urls.forEach(url => {
    if (url) cacheWrapper.appendChild(makeCacheEntry(url));
  });
  const newCacheEntry = document.createElement('div');
  newCacheEntry.classList.add('cache-new-wrapper');
  const newURL = document.createElement('input');
  newURL.classList.add('cache-new-url');
  newURL.placeholder = 'Cache';
  newURL.type = 'text';
  newCacheEntry.appendChild(newURL);
  const addBtn = document.createElement('button');
  addBtn.classList.add('cache-add');
  addBtn.textContent = 'Cache';
  addBtn.addEventListener('click', e => {
    if (newURL.value) {
      addBtn.disabled = newURL.disabled = true;
      newCacheEntry.classList.add('loading');
      cache.add(newURL.value).then(() => {
        newCacheEntry.classList.remove('loading');
        newURL.disabled = false;
        newURL.value = '';
        cacheWrapper.appendChild(makeCacheEntry(newURL.value));
      }).catch(err => {
        console.log(err);
        newCacheEntry.classList.remove('loading');
        addBtn.disabled = newURL.disabled = false;
      });
    }
  });
  newCacheEntry.appendChild(addBtn);
  cacheWrapper.appendChild(newCacheEntry);
  document.body.insertBefore(cacheWrapper, files);
  const instructions = document.createElement('p');
  instructions.textContent = 'Click on a link to cache it.';
  document.body.insertBefore(instructions, files);
}

document.addEventListener('DOMContentLoaded', e => {
  if (navigator.serviceWorker.controller) {
    const cacheBtn = document.getElementById('cache');
    cacheBtn.disabled = false;
    cacheBtn.addEventListener('click', e => {
      cacheBtn.disabled = true;
      cacheBtn.textContent = 'Caching files';
      init();
    });
  }
});
