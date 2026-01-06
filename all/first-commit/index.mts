// node all/first-commit/index.mts

import { readFile, rm } from 'node:fs/promises'
import { actionsRepos, ghPagesRepos, jekyllRepos } from '../gh-pages-repos.mjs'
import { exec } from 'node:child_process'

const ROOT = 'https://sheeptester.github.io'
const SITEMAP_PATH = 'all/sitemap.txt'
const ROOT_REPO = 'sheeptester.github.io'
const TEMP_DIR = 'all/first-commit/temp'

const branches: Record<string, string> = { [ROOT_REPO]: 'master' }
for (const entry of ghPagesRepos) {
  const [repo, branch = 'master'] = entry.split('#')
  branches[repo] = branch
}
for (const entry of jekyllRepos) {
  const [repo, branch = 'master'] = entry.split('#')
  branches[repo] = branch
}
for (const entry of Object.keys(actionsRepos)) {
  const [repo, branch = 'master'] = entry.split('#')
  branches[repo] = branch
}

const pathsByRepo = Map.groupBy(
  (await readFile(SITEMAP_PATH, 'utf-8'))
    .trim()
    .split(/\r?\n/)
    .map(url => url.replace(ROOT, ''))
    .map(path => {
      // Special cases
      switch (path) {
        case '/blog/ABOUT/':
          // Permalink is set in file
          return { repo: 'blog', sourcePath: 'about.md' }
        case '/guestbook/':
          // Need a specific file to get creation date
          return { repo: 'guestbook', sourcePath: 'src/Page.tsx' }
      }

      const [, repoName, ...rest] = path.split('/')
      const end = path.endsWith('/') ? 'index.html' : ''
      for (const entry of ghPagesRepos) {
        const [repo] = entry.split('#')
        if (repoName === repo) {
          return { repo, sourcePath: rest.join('/') + end }
        }
      }
      for (const entry of jekyllRepos) {
        const [repo] = entry.split('#')
        if (repoName === repo) {
          return { repo, sourcePath: rest.join('/') + end }
        }
      }
      for (const [entry, prefix] of Object.entries(actionsRepos)) {
        const [repo] = entry.split('#')
        if (repoName === repo) {
          return { repo, sourcePath: prefix + rest.join('/') + end }
        }
      }
      return { repo: ROOT_REPO, sourcePath: path + end }
    }),
  path => path.repo
)

// https://stackoverflow.com/a/29655902
// (from file-getter.js)
function runCommand (command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err !== null) reject(err)
      else if (typeof stderr !== 'string') reject(stderr)
      else resolve(stdout)
    })
  })
}

for (const [repo, paths] of pathsByRepo) {
  console.error(`[${repo}]`)
  let repoDir
  if (repo === ROOT_REPO) {
    repoDir = '.'
  } else {
    await rm(TEMP_DIR, { recursive: true, force: true })
    await runCommand(
      `git clone --branch "${branches[repo]}" --single-branch https://github.com/SheepTester/${repo}.git ${TEMP_DIR}`
    )
    repoDir = TEMP_DIR
  }

  for (const { sourcePath } of paths) {
    //
  }

  break
}
