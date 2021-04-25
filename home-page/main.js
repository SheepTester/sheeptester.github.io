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
      filterStyle.textContent = `.project{display:none}${
        Array.from(selected, className => '.' + className).join('')
      }{display:block}`
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
  icon.className = `desc-tag-icon base-tag ${[...tagElem.classList].find(cls => cls.startsWith('tag-'))}`
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
    lastSelected.ariaExpanded = 'false'
  }
}

const projectsWrapper = document.getElementById('projects-wrapper')
let lastSelected = null
projectsWrapper.addEventListener('click', e => {
  const project = e.target.closest('.project')
  if (project && !e.target.closest('.open-directly')) {
    e.preventDefault()
    unselect()
    if (lastSelected !== project) {
      setDescription(project)
      project.after(descElems.wrapper)
      descElems.wrapper.style.display = null
      lastSelected = project
      project.classList.add('showing-desc')
      project.ariaExpanded = 'true'
    } else {
      lastSelected = null
    }
  }
})

for (const project of document.getElementsByClassName('project')) {
  project.ariaExpanded = 'false'
}

function easeInOutCubic (t) {
  t *= 2
  if (t < 1) return t * t * t / 2
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
ageSpan.addEventListener('click', e => {
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
      exponent: i === decimal
        ? null
        : i < decimal
        ? decimal - i - 1
        : decimal - i
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
          digit.elem.style.setProperty('--last', `rgba(255, 255, 255, ${(1 - interp) * ALPHA})`)
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
}, { once: true })
