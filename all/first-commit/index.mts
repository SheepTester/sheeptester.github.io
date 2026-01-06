// node all/first-commit/index.mts

import { readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { actionsRepos, ghPagesRepos, jekyllRepos } from '../gh-pages-repos.mjs'
import { execFile } from 'node:child_process'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

const ROOT = 'https://sheeptester.github.io'
const SITEMAP_PATH = 'all/sitemap.txt'
const ROOT_REPO = 'sheeptester.github.io'
const TEMP_DIR = 'all/first-commit/temp'
const OUTPUT = 'all/first-commit/commits.json'

const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const GREY = '\x1b[90m'
const RESET = '\x1b[m'

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
          return { repo: 'blog', path, sourcePath: 'about.md' }
        case '/guestbook/':
          // Need a specific file to get creation date
          return { repo: 'guestbook', path, sourcePath: 'src/Page.tsx' }
      }

      const [, repoName, ...rest] = path.split('/')
      const end = path.endsWith('/') ? 'index.html' : ''
      for (const entry of ghPagesRepos) {
        const [repo] = entry.split('#')
        if (repoName === repo) {
          return { repo, path, sourcePath: rest.join('/') + end }
        }
      }
      for (const entry of jekyllRepos) {
        const [repo] = entry.split('#')
        if (repoName === repo) {
          return { repo, path, sourcePath: rest.join('/') + end }
        }
      }
      for (const [entry, prefix] of Object.entries(actionsRepos)) {
        const [repo] = entry.split('#')
        if (repoName === repo) {
          return { repo, path, sourcePath: prefix + rest.join('/') + end }
        }
      }
      return { repo: ROOT_REPO, path, sourcePath: path + end }
    }),
  path => path.repo
)

// https://stackoverflow.com/a/29655902
// (from file-getter.js, with modifications by Gemini)
function runCommand (
  command: string,
  args: string[],
  cwd?: string
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(command, args, { cwd }, (err, stdout, stderr) => {
      if (err !== null) {
        reject(err)
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

// https://github.com/SheepTester/hello-world/blob/master/test/add-sheep.mts
async function * walkDir (dir: string): AsyncGenerator<string> {
  // thanks gemini
  for await (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') {
        continue
      }
      yield * walkDir(path)
    } else if (entry.isFile()) {
      yield path
    }
  }
}

type FirstCommit = {
  /** Includes repo and branch */
  source: string
  hash: string
  date: string
  message: string
}
const firstCommits: Record<string, FirstCommit> = {}

for (const [repo, paths] of Array.from(pathsByRepo).filter(
  x => x[0] === 'longer-tweets'
)) {
  console.error(`[${repo}]`)
  const branch = branches[repo]

  await rm(TEMP_DIR, { recursive: true, force: true })
  let repoDir
  if (repo === ROOT_REPO) {
    repoDir = '.'
  } else {
    await runCommand('git', [
      'clone',
      '--branch',
      branch,
      '--single-branch',
      `https://github.com/SheepTester/${repo}.git`,
      TEMP_DIR
    ])
    repoDir = TEMP_DIR
  }

  const markdownPaths: string[] = []
  for await (const path of walkDir(TEMP_DIR)) {
    if (path.endsWith('.md')) {
      markdownPaths.push(path)
    }
  }

  for (let { path, sourcePath } of paths) {
    if (!existsSync(join(repoDir, sourcePath))) {
      const mdNameCandidate1 = '/' + sourcePath.replace(/\.html$/, '.md')
      const mdNameCandidate2 =
        '/__DATE__-' + sourcePath.replace(/\/index\.html$/, '.md')
      const candidates = [
        ...markdownPaths.filter(path =>
          path.replace(/\d+-\d+-\d+/, '__DATE__').endsWith(mdNameCandidate1)
        ),
        ...markdownPaths.filter(path =>
          path.replace(/\d+-\d+-\d+/, '__DATE__').endsWith(mdNameCandidate2)
        )
      ]
      if (candidates.length === 1) {
        const newSourcePath = candidates[0]
          .replace(repoDir, '')
          .replace(/^\//, '')
        console.error(`${GREY}note: ${sourcePath} -> ${newSourcePath}${RESET}`)
        sourcePath = newSourcePath
      } else {
        console.error(
          `${RED}ERROR${RESET}: couldn't find file corresponding to ${sourcePath}. candidates: ${
            candidates.join(', ') || 'NONE'
          }`
        )
        continue
      }
    }

    const { stdout, stderr } = await runCommand(
      'git',
      [
        'log',
        // https://stackoverflow.com/a/13598028
        '--diff-filter=A',
        // https://stackoverflow.com/a/11533206
        '--follow',
        '--find-renames=40%',
        '--pretty=format:%H|%ai|%s',
        '--',
        sourcePath
      ],
      repoDir
    )
    if (stderr) {
      console.error(`${YELLOW}WARN${RESET}: received stderr for ${sourcePath}`)
      console.error(stderr)
    }
    const [hash, date, ...descriptionParts] = stdout.split('|')
    firstCommits[path] = {
      source: `${repo}/blob/${branch}/${sourcePath}`,
      hash,
      date,
      message: descriptionParts.join('|')
    }
  }
}

await writeFile(OUTPUT, JSON.stringify(firstCommits, null, '\t') + '\n')
// await rm(TEMP_DIR, { recursive: true, force: true })
