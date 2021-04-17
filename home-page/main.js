const filterStyle = document.createElement('style')
document.head.appendChild(filterStyle)
const selected = new Set()
for (const checkbox of document.getElementsByClassName('filter-checkbox')) {
  const className = `project-${checkbox.id.replace('filter-by-', '')}`
  checkbox.addEventListener('change', e => {
    if (checkbox.checked) {
      selected.add(className)
      removeDescription()
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

function createDescription (from, link) {
  const div = document.createElement('div')
  div.className = 'description'
  for (const paragraph of from.split(/\r?\n/)) {
    const p = document.createElement('p')
    p.textContent = paragraph
    div.append(p)
  }
  const a = document.createElement('a')
  a.className = 'desc-visit block-link'
  a.href = link
  a.textContent = 'Visit'
  div.append(a)
  return div
}
function removeDescription () {
  if (lastSelected) {
    const [project, description] = lastSelected
    project.classList.remove('showing-desc')
    description.remove()
  }
}
const projectsWrapper = document.getElementById('projects-wrapper')
let lastSelected = null
projectsWrapper.addEventListener('click', e => {
  const project = e.target.closest('.project')
  if (project && !e.target.closest('.open-directly')) {
    removeDescription()
    if (!lastSelected || lastSelected[0] !== project) {
      const description = createDescription(
        project.querySelector('.project-desc').textContent,
        project.href
      )
      lastSelected = [project, description]
      project.classList.add('showing-desc')
      project.after(description)
    } else {
      lastSelected = null
    }
    e.preventDefault()
  }
})

for (const project of document.getElementsByClassName('project')) {
  project.ariaLabel = 'View details'
}
