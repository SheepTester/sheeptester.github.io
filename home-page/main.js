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
    } else {
      lastSelected = null
    }
  }
})
