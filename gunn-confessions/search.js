let confessions

self.addEventListener('message', e => {
  if (typeof e.data === 'string') {
    const search = e.data.toLowerCase()
    self.postMessage({
      search,
      results: confessions
        .map(({ id, confession }) => {
          if (!confession) {
            return null
          }
          const index = confession.toLowerCase().indexOf(search)
          if (index === -1) {
            return null
          }
          return {
            id,
            confession: {
              before: confession.slice(0, index),
              match: confession.slice(index, index + search.length),
              after: confession.slice(index + search.length)
            }
          }
        })
        .filter(entry => entry)
    })
  } else {
    confessions = e.data
  }
})
