const directories = document.querySelectorAll('details')

const collapseBtn = document.getElementById('collapse')
collapseBtn.disabled = false
collapseBtn.addEventListener('click', () => {
  for (const checkbox of directories) {
    checkbox.open = false
  }
})

const openBtn = document.getElementById('open')
openBtn.disabled = false
openBtn.addEventListener('click', () => {
  for (const checkbox of directories) {
    checkbox.open = true
  }
})

const search = document.getElementById('search')
search.disabled = false
document.styleSheets[0].insertRule('nothing { display: none; }', 0)
const rule = document.styleSheets[0].cssRules[0]
let initialized = false
search.addEventListener('input', () => {
  if (!initialized) {
    for (const dir of directories) {
      dir.dataset.hrefs = Array.from(dir.querySelectorAll('a'), a =>
        a.getAttribute('href')
      ).join('\n')
    }
    initialized = true
  }
  // TODO: It doesn't work if the query contains a double quote
  if (search.value) {
    rule.selectorText = `.dir a:not([href*="${CSS.escape(
      search.value
    )}" i]), [data-hrefs]:not([data-hrefs*="${CSS.escape(search.value)}" i])`
  } else {
    rule.selectorText = 'nothing'
  }
})
