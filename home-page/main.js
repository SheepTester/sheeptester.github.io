const filterStyle = document.createElement('style')
document.head.appendChild(filterStyle)
const selected = new Set()
for (const checkbox of document.getElementsByClassName('filter-checkbox')) {
  const className = `project-${checkbox.id.replace('filter-by-', '')}`
  checkbox.addEventListener('change', e => {
    if (checkbox.checked) {
      selected.add(className)
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

function createDescription () {
  const div = document.createElement('div')
  div.className = 'description'
  div.textContent = 'hello!'
  return div
}
const projectsWrapper = document.getElementById('projects-wrapper')
let lastSelected = null
projectsWrapper.addEventListener('click', e => {
  if (e.detail === 0) {
    // https://stackoverflow.com/a/55375571
    // `detail` is 0 if the user clicked via the enter key (normally, it's the
    // nth click in a series of click, like when double-clicking).
    // However, this prevents them from seeing the description unless they have
    // a screen reader, so I'm not sure if this is the best choice.
    return
  }
  const project = e.target.closest('.project')
  if (project) {
    if (lastSelected) {
      const [project, description] = lastSelected
      project.classList.remove('showing-desc')
      description.classList.add('desc-hide')
      description.addEventListener('transitionend', e => {
        description.remove()
      })
    }
    if (!lastSelected || lastSelected[0] !== project) {
      const description = createDescription()
      lastSelected = [project, description]
      project.classList.add('showing-desc')
      project.after(description)
    } else {
      lastSelected = null
    }
    if (!e.target.closest('.open-directly')) {
      e.preventDefault()
    }
  }
})
