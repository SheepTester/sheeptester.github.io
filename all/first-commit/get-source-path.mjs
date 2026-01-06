export function getSourcePath (path) {
  // Special cases
  switch (path) {
    case '/blog/':
      return { repo: 'blog', branch: 'master', sourcePath: 'index.html' }
    case '/blog/404/':
      return { repo: 'blog', branch: 'master', sourcePath: '404.md' }
    case '/blog/ABOUT/':
      return { repo: 'blog', branch: 'master', sourcePath: 'about.md' }
    case '/longer-tweets/':
      return { repo: 'longer-tweets', branch: 'master', sourcePath: 'index.md' }
  }
  const [, repoName, ...rest] = path.split('/')
  const end = path.endsWith('/') ? 'index.html' : ''
  for (const entry of ghPagesRepos) {
    const [repo, branch = 'master'] = entry.split('#')
    if (repoName === repo) {
      return { repo, branch, sourcePath: rest.join('/') + end }
    }
  }
  for (const entry of jekyllRepos) {
    const [repo, branch = 'master'] = entry.split('#')
    if (repoName === repo) {
      return {
        repo,
        branch,
        sourcePath: rest.join('/') + end.replace(/\.html/, '.md')
      }
    }
  }
  for (const [entry, prefix] of Object.entries(actionsRepos)) {
    const [repo, branch = 'master'] = entry.split('#')
    if (repoName === repo) {
      return { repo, branch, sourcePath: prefix + rest.join('/') }
    }
  }
  return { repo: ROOT_REPO, sourcePath: path + end }
}
