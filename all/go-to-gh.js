// Injected by sheep.js right click menus

import { ghPagesRepos, jekyllRepos } from './gh-pages-repos.mjs'

const BASE = 'https://github.com/SheepTester'

function getGithubUrl (path) {
  const [, repoName, ...rest] = path.split('/')
  const end = path.endsWith('/') ? 'index.html' : ''
  if (repoName === 'longer-tweets') {
    const githubUrl = document.getElementById('github')
    if (githubUrl) {
      return githubUrl.href.replace('commits', 'blob')
    }
  }
  for (const entry of ghPagesRepos) {
    const [repo, branch = 'master'] = entry.split('#')
    if (repoName === repo) {
      return `${BASE}/${repo}/blob/${branch}/${rest.join('/')}${end}`
    }
  }
  for (const entry of jekyllRepos) {
    const [repo, branch = 'master'] = entry.split('#')
    if (repoName === repo) {
      return `${BASE}/${repo}/blob/${branch}/${rest.join('/')}${end}`.replace(
        /\.html/,
        '.md'
      )
    }
  }
  return `${BASE}/sheeptester.github.io/blob/master${path}${end}`
}

window.location = getGithubUrl(window.location.pathname)
