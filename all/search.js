let fuzzySortLoaded = false

function normalize (string) {
  return string?.normalize('NFD').replace(/[\u0300-\u036f]/g, '') ?? null
}

function highlight (result, defaultValue) {
  return result.score > 0
    ? result.highlight(match =>
      Object.assign(document.createElement('strong'), {
        textContent: match
      })
    )
    : [defaultValue]
}

export class Search {
  #rows = []
  #results = []
  #selected = -1
  #entries
  #search
  #form
  #suggestions

  constructor (entries, searchInput) {
    this.#entries = entries
    this.#search = searchInput

    searchInput.addEventListener('keydown', e => {
      if (this.#results.length === 0) {
        return
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        this.#markSelected(
          (e.key === 'ArrowUp'
            ? this.#selected + this.#results.length - 1
            : this.#selected + 1) % this.#results.length
        )
        e.preventDefault()
      }
      if (e.key === 'Enter') {
        window.location.href = this.#results[this.#selected].obj.path
        e.preventDefault()
      }
    })

    searchInput.addEventListener('input', this.#performSearch)
    this.#performSearch()
  }

  #performSearch () {
    const results = fuzzysort.go(normalize(this.#search.value), this.#entries, {
      keys: ['titleNormalized', 'descriptionNormalized', 'pathNormalized'],
      threshold: 0.1,
      limit: 50
    })
    this.#results = results
    if (results.length === 0) {
      this.#suggestions.classList.add('no-results')
      return
    }
    this.#suggestions.classList.remove('no-results')
    while (this.#rows.length < results.length) {
      const wrapper = document.createElement('a')
      wrapper.className = 'suggestion'
      const title = document.createElement('div')
      title.className = 'suggestion-title'
      const desc = document.createElement('div')
      desc.className = 'suggestion-desc'
      const path = document.createElement('div')
      path.className = 'suggestion-path'
      wrapper.append(title, desc, path)
      this.#suggestions.append(wrapper)
      this.#rows.push({ wrapper, title, desc, path })
    }
    for (const [i, row] of this.#rows.entries()) {
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
    this.#markSelected(0)
  }

  #markSelected (index) {
    if (this.#selected !== -1) {
      this.#rows[this.#selected].wrapper.classList.remove('selected')
    }
    if (this.#results.length === 0) {
      return
    }
    this.#selected = index
    this.#rows[this.#selected].wrapper.classList.add('selected')
    this.#form.action = this.#results[this.#selected].obj.path
    this.#rows[this.#selected].wrapper.scrollIntoView({ block: 'nearest' })
  }

  static async load () {
    const fuzzysortLoad =
      fuzzySortLoaded &&
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
    return new Search(entries)
  }
}
