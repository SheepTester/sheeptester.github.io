const filterStyle = document.createElement('style')
document.head.appendChild(filterStyle)
const selected = new Set()
for (const checkbox of document.getElementsByClassName('filter-checkbox')) {
  const className = `project-${checkbox.id.replace('filter-by-', '')}`
  checkbox.addEventListener('change', e => {
    if (checkbox.checked) {
      selected.add(className)
      unselect()
      lastSelected = null
    } else {
      selected.delete(className)
    }
    if (selected.size === 0) {
      filterStyle.textContent = ''
    } else {
      filterStyle.textContent = `.project{display:none}${Array.from(
        selected,
        className => '.' + className
      ).join('')}{display:block}`
    }
  })
}

for (const label of document.getElementsByClassName('filter-tag')) {
  // Prevent selecting text when spam clicking button
  // Why not CSS? This way, you can still select the text by other means, like
  // with normal <button>s
  label.addEventListener('mousedown', e => {
    e.preventDefault()
  })
}

function empty (elem) {
  while (elem.firstChild) elem.removeChild(elem.firstChild)
}

const descElems = {
  wrapper: document.getElementById('description-wrapper'),
  title: document.getElementById('desc-title'),
  link: document.getElementById('desc-link'),
  tags: document.getElementById('desc-tags'),
  text: document.getElementById('description')
}
function createTag (tagElem) {
  const tag = document.createElement('div')
  tag.className = 'desc-tag'
  const icon = document.createElement('div')
  icon.className = `desc-tag-icon base-tag ${[...tagElem.classList].find(cls =>
    cls.startsWith('tag-')
  )}`
  const name = document.createElement('div')
  name.className = 'desc-tag-name'
  name.textContent = tagElem.title
  tag.append(icon, name)
  return tag
}
function setDescription (project) {
  descElems.title.textContent = project.querySelector('.title').textContent
  descElems.link.href = project.href
  empty(descElems.tags)
  for (const tag of project.getElementsByClassName('tag')) {
    descElems.tags.append(createTag(tag))
  }
  empty(descElems.text)
  for (const paragraph of project.dataset.desc.split(/\r?\n/)) {
    const p = document.createElement('p')
    p.textContent = paragraph
    descElems.text.append(p)
  }
}
function unselect () {
  descElems.wrapper.style.display = 'none'
  if (lastSelected) {
    lastSelected.classList.remove('showing-desc')
    lastSelected.querySelector('.show-info-btn').ariaExpanded = 'false'
  }
}

const projectsWrapper = document.getElementById('projects-wrapper')
let lastSelected = null
projectsWrapper.addEventListener('click', e => {
  const project = e.target.closest('.project')
  if (!project) {
    return
  }
  const showInfoBtn = project.querySelector('.show-info-btn')
  const showInfoHidden = window.getComputedStyle(showInfoBtn).display === 'none'
  if (showInfoHidden || showInfoBtn.contains(e.target)) {
    e.preventDefault()
    unselect()
    if (lastSelected !== project) {
      setDescription(project)
      project.after(descElems.wrapper)
      descElems.wrapper.style.display = null
      lastSelected = project
      project.classList.add('showing-desc')
      showInfoBtn.ariaExpanded = 'true'
      const id = `temp_${Date.now()}`
      showInfoBtn.id = id
      descElems.wrapper.setAttribute('aria-labelledby', id)
    } else {
      lastSelected = null
    }
  }
})

for (const showInfoBtn of document.getElementsByClassName('show-info-btn')) {
  showInfoBtn.ariaExpanded = 'false'
}

function easeInOutCubic (t) {
  t *= 2
  if (t < 1) return (t * t * t) / 2
  t -= 2
  return (t * t * t + 2) / 2
}

const BIRTHDAY = 1049933280000 // new Date('2003-04-09T17:08-07:00').getTime()
const MS_IN_YR = 1000 * 60 * 60 * 24 * 365.242199
function getAge (now = Date.now()) {
  // Could be 15, but it gets imprecise at such a small scale, and the animation
  // looks unlike the others
  return ((now - BIRTHDAY) / MS_IN_YR).toFixed(13)
}
const ANIM_LENGTH = 500 // ms
const ALPHA = 0.8

const ageSpan = document.getElementById('age')
ageSpan.textContent = Math.floor((Date.now() - BIRTHDAY) / MS_IN_YR)
ageSpan.classList.add('age-clickable')
ageSpan.tabIndex = 0
ageSpan.title = 'Click to see me age in real time'
ageSpan.addEventListener('click', startAgeAnim, { once: true })

function startAgeAnim () {
  const ageWrapper = document.createElement('code')
  ageWrapper.classList.add('age')
  ageWrapper.role = 'text'
  const age = getAge()
  ageWrapper.style.width = age.length + 'ch'
  const decimal = age.indexOf('.')
  const digits = new Array(age.length)
  let sigfigs = Math.floor((Date.now() - BIRTHDAY) / 10000).toString().length
  for (let i = 0; i < age.length; i++) {
    const digit = document.createElement('span')
    digits[i] = {
      elem: digit,
      exponent:
        i === decimal ? null : i < decimal ? decimal - i - 1 : decimal - i
    }
    if (age[i] !== '.') {
      if (sigfigs <= 0) {
        digit.classList.add('insignificant')
        digit.title = 'This digit is purely an estimation.'
      }
      sigfigs--
    } else {
      digit.textContent = '.'
      digit.style.transform = `translate3d(${i}ch, 0, 0)`
    }
    ageWrapper.append(digit)
  }
  ageWrapper.append('\xa0') // nbsp
  ageSpan.replaceWith(ageWrapper)
  function display () {
    const now = Date.now()
    const age = getAge(now)
    for (let i = 0; i < age.length; i++) {
      const digit = digits[i]
      if (digit.exponent !== null) {
        const interval = 10 ** digit.exponent * MS_IN_YR
        const animationTime = Math.min(interval, ANIM_LENGTH)
        const time = (now - BIRTHDAY) % interval
        if (digit.elem.textContent !== age[i]) {
          digit.elem.textContent = age[i]
        }
        if (time < animationTime) {
          const interp = easeInOutCubic(time / animationTime)
          digit.elem.style.transform = `translate3d(${i}ch, ${interp - 1}em, 0)`
          digit.elem.style.color = `rgba(255, 255, 255, ${interp * ALPHA})`
          digit.elem.style.setProperty(
            '--last',
            `rgba(255, 255, 255, ${(1 - interp) * ALPHA})`
          )
          digit.elem.dataset.last = (+age[i] + 9) % 10
          digit.wasStatic = false
        } else if (!digit.wasStatic) {
          digit.elem.style.transform = `translate3d(${i}ch, 0, 0)`
          digit.elem.style.color = null
          digit.elem.style.removeProperty('--last')
          delete digit.elem.dataset.last
          digit.wasStatic = true
        }
      }
    }
    window.requestAnimationFrame(display)
  }
  display()
}

function normalize (string) {
  return string?.normalize('NFD').replace(/[\u0300-\u036f]/g, '') ?? null
}

const search = document.getElementById('search')
search.addEventListener('focus', startSearch, { once: true })
async function startSearch () {
  const fuzzysortLoad = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/fuzzysort@3.0.2/fuzzysort.min.js'
    script.addEventListener('load', resolve)
    script.addEventListener('error', reject)
    document.head.append(script)
  })
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

  const form = document.getElementById('search-form')
  const suggestions = document.getElementById('suggestions')
  const rows = []
  let results = []
  let selected = -1

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
