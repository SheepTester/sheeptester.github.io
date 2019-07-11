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
      cache.delete(url).then(success => {
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
  urls.forEach(url => {
    if (url) cacheWrapper.appendChild(makeCacheEntry(url));
  });

  const newCacheEntry = document.createElement('div');
  newCacheEntry.classList.add('cache-new-wrapper');
  cacheWrapper.appendChild(newCacheEntry);

  const newURL = document.createElement('input');
  newURL.classList.add('cache-new-url');
  newURL.placeholder = 'Cache';
  newURL.type = 'text';
  newURL.addEventListener('keydown', e => {
    if (e.keyCode === 13) addBtn.click();
  });
  newCacheEntry.appendChild(newURL);

  const addBtn = document.createElement('button');
  addBtn.classList.add('cache-add');
  addBtn.textContent = 'Cache';
  addBtn.addEventListener('click', e => {
    if (newURL.value) {
      addBtn.disabled = newURL.disabled = true;
      newCacheEntry.classList.add('loading');
      cache.match(newURL.value)
        .then(req => req ? Promise.reject('Already cached.') : cache.add(newURL.value))
        .then(() => {
          newCacheEntry.classList.remove('loading');
          addBtn.disabled = newURL.disabled = false;
          cacheWrapper.appendChild(makeCacheEntry(newURL.value));
          newURL.disabled = false;
          newURL.value = '';
          error.textContent = '';
        })
        .catch(err => {
          newCacheEntry.classList.remove('loading');
          addBtn.disabled = newURL.disabled = false;
          error.textContent = err;
        });
    }
  });
  newCacheEntry.appendChild(addBtn);

  const error = document.createElement('p');
  error.classList.add('error');
  cacheWrapper.appendChild(error);

  const instructions = document.createElement('p');
  instructions.textContent = 'Click on a link to cache it.';

  const updateAll = document.createElement('button');
  updateAll.classList.add('cache-update');
  updateAll.textContent = 'Update all';
  updateAll.addEventListener('click', e => {
    if (newURL.value) {
      updateAll.disabled = true;
      cache.keys()
        .then(requests => Promise.all(requests.map(r => cache.add(r))))
        .then(() => {
          updateAll.disabled = false;
        })
        .catch(err => {
          updateAll.disabled = false;
          console.log(err);
        });
    }
  });
  instructions.appendChild(updateAll);

  const cachedCheckbox = document.createElement('input');
  cachedCheckbox.type = 'checkbox';
  cachedCheckbox.addEventListener('change', e => {
    document.body.classList[cachedCheckbox.checked ? 'add' : 'remove']('hideuncached');
  });

  const label = document.createElement('label');
  label.appendChild(cachedCheckbox);
  label.appendChild(document.createTextNode(' only cached'));

  document.body.insertBefore(cacheWrapper, files);
  document.body.insertBefore(instructions, files);
  document.getElementById('checkboxes').appendChild(label);

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
