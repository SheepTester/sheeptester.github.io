// Injected by sheep.js right click menus

const BASE = 'https://github.com/SheepTester'

const commits = await fetch('/all/first-commit/commits.json').then(r =>
  r.json()
)
const [repo, branch, ...path] =
  commits[decodeURIComponent(window.location.pathname)].source.split('/')
window.location = `${BASE}/${repo}/blob/${branch}/${path.join('/')}`
