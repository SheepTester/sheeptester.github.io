// node --experimental-strip-types all/img-previews/index.mts

import { exec as execCb } from 'child_process'
import * as fs from 'fs/promises'
import { promisify } from 'util'
import YAML from 'yaml'
import { actionsRepos, ghPagesRepos, jekyllRepos } from '../gh-pages-repos.mjs'
import { join } from 'path'

const exec = promisify(execCb)

type Project = {
  path: string
  image: string
  name: string
  description: string
  tags: string[]
}

const projects: Project[] = YAML.parse(
  await fs.readFile('home-page/data/projects.yml', 'utf-8')
)

const repos: Record<
  `${string}#${string}`,
  { filePath: string; imageUrl: string }[]
> = {}
for (const { path, image } of projects) {
  if (path.startsWith('https://')) {
    if (path.startsWith('https://sheeptester.github.io')) {
      console.error('!!! unexpected full url', path)
    }
    continue
  }
  if (!path.startsWith('/')) {
    console.error('!!! unexpected path', path)
    continue
  }
  if (!image.startsWith('img/')) {
    console.error('!!! unexpected image', path)
    continue
  }

  const [, maybeRepoName, ...rest] = path.split('/')
  let repoName = 'sheeptester.github.io'
  let repoBranch = 'master'
  tryRepos: {
    // most of hello-world acts as a normal static site, except for its index
    // page
    if (maybeRepoName === 'hello-world' && path !== '/hello-world/') {
      repoName = maybeRepoName
      break tryRepos
    }
    if (actionsRepos.includes(maybeRepoName)) {
      console.warn(
        `! unable to handle actions repo (${maybeRepoName}): ${path}`
      )
      continue
    }
    for (const entry of ghPagesRepos) {
      const [repo, branch = 'master'] = entry.split('#')
      if (maybeRepoName === repo) {
        repoName = repo
        repoBranch = branch
        break tryRepos
      }
    }
    for (const entry of jekyllRepos) {
      const [repo, branch = 'master'] = entry.split('#')
      if (maybeRepoName === repo) {
        repoName = repo
        repoBranch = branch
        break tryRepos
      }
    }
  }
  if (repoBranch === 'gh-pages') {
    console.warn(`! ignoring auto-generated repo (${repoName}): ${path}`)
    continue
  }
  let repoPath =
    repoName === 'sheeptester.github.io'
      ? path.slice(1)
      : rest.join('/') || 'index.html'
  if (repoPath.endsWith('/')) {
    repoPath += 'index.html'
  }
  if (!repoPath.endsWith('.html')) {
    console.error('!!! unexpected html path', repoPath)
    continue
  }

  repos[`${repoName}#${repoBranch}`] ??= []
  repos[`${repoName}#${repoBranch}`].push({
    filePath: repoPath,
    imageUrl: new URL('/' + image, 'https://sheeptester.github.io').toString()
  })
  // console.log(path, repoName, repoBranch)
}

const repoPath = 'all/img-previews/repo/'
for (const [repo, paths] of Object.entries(repos)) {
  const [name, branch] = repo.split('#')
  // TEMP
  if (name !== 'hello-world') {
    continue
  }

  await fs.rm(repoPath, { recursive: true, force: true })
  await exec(
    `git clone --branch ${branch} --depth 1 https://github.com/SheepTester/${name}.git ${repoPath}`
  )
  await Promise.all(
    paths.map(async ({ filePath, imageUrl }) => {
      const fullPath = join(repoPath, filePath)
      const html = await fs.readFile(fullPath, 'utf-8')
      console.log(fullPath, html.length)
    })
  )
}
