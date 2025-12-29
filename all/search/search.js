function normalize (string) {
  return string?.normalize('NFD').replace(/[\u0300-\u036f]/g, '') ?? null
}

let fuzzySortLoaded = false
export async function loadSearch (search, form, suggestions) {
  const rows = []
  let results = []
  let selected = -1

  form.addEventListener('submit', e => {
    if (results.length > 0) {
      window.location.href = results[selected].obj.path
    }
    e.preventDefault()
  })

  const fuzzysortLoad =
    !fuzzySortLoaded &&
    new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src =
        'https://cdn.jsdelivr.net/npm/fuzzysort@3.0.2/fuzzysort.min.js'
      script.addEventListener('load', resolve)
      script.addEventListener('error', reject)
      document.head.append(script)
    })
  fuzzySortLoaded = true
  const entries = await fetch('/all/title-desc.json')
    .then(r => r.json())
    .then(entries =>
      entries.map(entry => {
        const title = entry.title?.trim() ?? null
        const description = entry.description?.trim() ?? null
        const path = decodeURI(entry.path)
        return {
          title,
          description,
          path,
          titleNormalized: normalize(title),
          descriptionNormalized: normalize(description),
          pathNormalized: normalize(path)
        }
      })
    )
  await fuzzysortLoad

  function highlight (result, defaultValue) {
    return result.score > 0
      ? result.highlight(match =>
        Object.assign(document.createElement('strong'), {
          textContent: match
        })
      )
      : [defaultValue]
  }

  function performSearch () {
    results = fuzzysort.go(normalize(search.value), entries, {
      keys: ['titleNormalized', 'descriptionNormalized', 'pathNormalized'],
      threshold: 0.1,
      limit: 50
    })
    if (results.length === 0) {
      suggestions.classList.add('no-results')
      return
    }
    suggestions.classList.remove('no-results')
    while (rows.length < results.length) {
      const wrapper = document.createElement('a')
      wrapper.className = 'suggestion'
      const title = document.createElement('div')
      title.className = 'suggestion-title'
      const desc = document.createElement('div')
      desc.className = 'suggestion-desc'
      const path = document.createElement('div')
      path.className = 'suggestion-path'
      wrapper.append(title, desc, path)
      suggestions.append(wrapper)
      rows.push({ wrapper, title, desc, path })
    }
    for (const [i, row] of rows.entries()) {
      if (i >= results.length) {
        row.wrapper.style.display = 'none'
        continue
      }
      const result = results[i]
      row.wrapper.style.display = null
      row.wrapper.href = result.obj.path
      if (result.obj.title !== null) {
        result[0].target = result.obj.title
        row.title.replaceChildren(...highlight(result[0], result.obj.title))
        row.title.style.display = null
      } else {
        row.title.style.display = 'none'
      }
      if (result.obj.description !== null) {
        result[1].target = result.obj.description
        row.desc.replaceChildren(
          ...highlight(result[1], result.obj.description)
        )
        row.desc.style.display = null
      } else {
        row.desc.style.display = 'none'
      }
      result[2].target = result.obj.path
      row.path.replaceChildren(...highlight(result[2], result.obj.path))
    }
    markSelected(0)
  }

  function markSelected (index) {
    if (selected !== -1) {
      rows[selected].wrapper.classList.remove('selected')
      form.action = '/all/search/'
    }
    if (results.length === 0) {
      return
    }
    selected = index
    rows[selected].wrapper.classList.add('selected')
    form.action = results[selected].obj.path
    rows[selected].wrapper.scrollIntoView({ block: 'nearest' })
  }

  search.addEventListener('keydown', e => {
    if (results.length === 0) {
      return
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      markSelected(
        (e.key === 'ArrowUp' ? selected + results.length - 1 : selected + 1) %
          results.length
      )
      e.preventDefault()
    }
    if (e.key === 'Enter') {
      window.location.href = results[selected].obj.path
      e.preventDefault()
    }
  })

  search.addEventListener('input', performSearch)
  performSearch()
}
