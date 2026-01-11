// node --experimental-strip-types all/img-previews/index.mts

import { exec as execCb } from 'child_process'
import * as fs from 'fs/promises'
import { promisify } from 'util'
import YAML from 'yaml'
import {
  actionsRepos,
  archived,
  ghPagesRepos,
  jekyllRepos
} from '../gh-pages-repos.mts'
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
  // most of hello-world acts as a normal static site... except for its index
  // page
  if (maybeRepoName === 'hello-world' && path !== '/hello-world/') {
    repoName = maybeRepoName
  } else {
    if (
      Object.keys(actionsRepos).some(
        entry => entry.split('#')[0] === maybeRepoName
      )
    ) {
      console.warn(
        `! cant handle actions repo (${maybeRepoName}): ${path} ${image}`
      )
      continue
    }
    if (jekyllRepos.some(entry => entry.split('#')[0] === maybeRepoName)) {
      console.warn(
        `! cant handle jekyll repo (${maybeRepoName}): ${path} ${image}`
      )
      continue
    }
    for (const entry of ghPagesRepos) {
      const [repo, branch = 'master'] = entry.split('#')
      if (maybeRepoName === repo) {
        repoName = repo
        repoBranch = branch
        break
      }
    }
  }
  if (repoBranch === 'gh-pages') {
    console.warn(
      `! ignoring auto-generated repo (${repoName}): ${path} ${image}`
    )
    continue
  }
  if (archived.includes(repoName)) {
    console.warn(`! skipping archived repo (${repoName}): ${path} ${image}`)
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
}

const newBranch = `feat/add-img-previews-${Date.now()}`
const repoPath = 'all/img-previews/repo/'
for (const [repo, paths] of Object.entries(repos)) {
  const [name, branch] = repo.split('#')

  await fs.rm(repoPath, { recursive: true, force: true })
  await exec(
    `git clone --branch ${branch} --depth 1 https://github.com/SheepTester/${name}.git ${repoPath}`
  )
  await exec(`git checkout -b ${newBranch}`, { cwd: repoPath })
  const results = await Promise.all(
    paths.map(async ({ filePath, imageUrl }) => {
      const fullPath = join(repoPath, filePath)
      const html = await fs.readFile(fullPath, 'utf-8')
      if (html.includes('og:image')) {
        // console.warn(`! file already has og:image: ${filePath}`)
        return false
      }

      let match =
        html.match(
          /[ \t]*<meta\s+name=(?:"description"|'description'|description)\s*content=(?:"[^"]+"|'[^']+'|[^/>]+)\s*\/?>\r?\n/
        ) ??
        html.match(
          /[ \t]*<meta\s+name=(?:"[^"]+"|'[^']+'|[^>]+\s)\s*content=(?:"[^"]+"|'[^']+'|[^/>]+)\s*\/?>\r?\n/
        )
      if (match) {
        await fs.writeFile(
          fullPath,
          html.slice(0, match.index) +
            match[0] +
            match[0]
              .replace('name=', 'property=')
              .replace(
                /property=(?:"([^"]+)"|'([^']+)'|([^>]+)\s)/,
                (_, g1, g2, g3) =>
                  g1 !== undefined
                    ? 'property="og:image"'
                    : g2 !== undefined
                      ? "property='og:image'"
                      : g3 !== undefined
                        ? 'property=og:image'
                        : console.error(
                          `!!! cannot set og:image in ${fullPath}`
                        ) ?? '???'
              )
              .replace(
                /content=(?:"([^"]+)"|'([^']+)'|([^/>]+))/,
                (_, g1, g2, g3) =>
                  g1 !== undefined
                    ? `content="${imageUrl}"`
                    : g2 !== undefined
                      ? `content='${imageUrl}'`
                      : g3 !== undefined
                        ? `content=${imageUrl}`
                        : console.error(
                          `!!! cannot set image url in ${fullPath}`
                        ) ?? '???'
              ) +
            html.slice((match.index ?? 0) + match[0].length)
        )
        return true
      }

      match = html.match(
        /[ \t]*<meta\s+charset=(?:"[^"]+"|'[^']+'|[^/>]+)\s*\/?>\r?\n/
      )
      if (match) {
        await fs.writeFile(
          fullPath,
          html.slice(0, match.index) +
            match[0] +
            match[0]
              .replace('charset=', 'property=')
              .replace(
                /property=(?:"([^"]+)"|'([^']+)'|([^/>]+))/,
                (_, g1, g2, g3) =>
                  g1 !== undefined
                    ? `property="og:image" content="${imageUrl}"`
                    : g2 !== undefined
                      ? `property='og:image' content='${imageUrl}'`
                      : g3 !== undefined
                        ? `property=og:image content=${imageUrl}`
                        : console.error(
                          `!!! cannot set og:image from charset in ${fullPath}`
                        ) ?? '???'
              ) +
            html.slice((match.index ?? 0) + match[0].length)
        )
        return true
      }

      console.error(
        `!!! unable to find existing meta tag (${name}): ${filePath} ${imageUrl}`
      )
      return false
    })
  )
  if (!results.includes(true)) {
    console.warn(`. no files changed in ${name}`)
    continue
  }
  await exec(
    `git commit -am "feat: Add Open Graph images\n\nAutomated with https://github.com/SheepTester/sheeptester.github.io/blob/master/all/img-previews/index.mts"`,
    { cwd: repoPath }
  )
  await exec(`git push origin ${newBranch}`, { cwd: repoPath })
  const { stdout: prUrl } = await exec(
    `gh pr create --head ${newBranch} --title "Add Open Graph images" --body "Automated with https://github.com/SheepTester/sheeptester.github.io/blob/master/all/img-previews/index.mts"`,
    { cwd: repoPath }
  )
  console.log(`>>> ${prUrl.trim()} <<<`)
}
