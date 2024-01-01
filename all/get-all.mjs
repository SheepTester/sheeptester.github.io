import fs from 'fs/promises'
import nodePath, { dirname } from 'path'
import { exec } from 'child_process'
import fetch from 'node-fetch'
import xml2js from 'xml2js'

// https://developer.github.com/v3/auth/#via-oauth-and-personal-access-tokens
import ghAuth from './basic-gh-auth.json' assert { type: 'json' }
const { username, personalAccessToken } = ghAuth

import {
  domain,
  ghUser,
  ghPagesRepos,
  jekyllRepos,
  actionsRepos,
  ignore as ignorePatterns
} from './gh-pages-repos.mjs'
import { fileURLToPath } from 'url'

// https://stackoverflow.com/a/29655902
// (from file-getter.js)
function runCommand (command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err !== null) reject(err)
      else if (typeof stderr !== 'string') reject(stderr)
      else resolve(stdout)
    })
  })
}

function toBase64 (str) {
  return Buffer.from(str).toString('base64')
}

// Primitive glob-like pattern matching
function matchesPattern (path, pattern) {
  const [start, end] = pattern.split(/\*\*?/)
  const allowDirectories = pattern.includes('**')
  if (pattern.startsWith('/')) {
    // Absolute paths: /all/index.html
    if (path.startsWith(start)) path = path.slice(start.length)
    else return false
  } else {
    // Relative paths: .gitignore
    const index = path.indexOf(start)
    if (index === -1) return false
    path = path.slice(index + start.length)
  }
  // Wildcards (only useful for file extensions): *.md
  if (end !== undefined) {
    if (end) {
      if (path.endsWith(end)) {
        path = path.slice(0, -end.length)
      } else {
        return false
      }
    }
    // If it's just a single *, then something like /all/*.js won't match
    // /all/links/main.js
    if (!allowDirectories && path.includes('/')) {
      return false
    }
  }
  return true
}

const ignore = ignorePatterns.filter(pattern => !pattern.startsWith('!'))
const except = ignorePatterns
  .filter(pattern => pattern.startsWith('!'))
  .map(pattern => pattern.slice(1))
function keepPath (path) {
  for (const pattern of except) {
    if (matchesPattern(path, pattern)) return true
  }
  for (const pattern of ignore) {
    if (matchesPattern(path, pattern)) return false
  }
  return true
}

// https://stackoverflow.com/a/51500400
const headers = {
  Authorization: `Basic ${toBase64(`${username}:${personalAccessToken}`)}`
}

function getRepoFiles (repo, branch = 'master') {
  // https://api.github.com/repos/SheepTester/chaotic-cube/git/trees/master?recursive=1
  const url = `https://api.github.com/repos/${ghUser}/${repo}/git/trees/${branch}?recursive=1`
  return fetch(url, { headers })
    .then(r => r.json())
    .then(({ tree, truncated }) => {
      if (truncated) console.warn(`${repo}#${branch} was truncated.`)
      return tree
        .filter(({ type }) => type === 'blob')
        .map(({ path }) => `/${repo}/${path}`)
    })
}

function getJekyllSitemap (repo) {
  // https://sheeptester.github.io/blog/sitemap.xml
  return fetch(`https://${domain}/${repo}/sitemap.xml`)
    .then(r => r.text())
    .then(xml2js.parseStringPromise)
    .then(({ urlset: { url } }) =>
      url.map(({ loc }) => {
        const path = decodeURI(new URL(loc[0]).pathname)
        return path.endsWith('/') ? path + 'index.html' : path
      })
    )
}

const siteRoot = nodePath.resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../'
)

// Paths to ignore in Jekyll repos
const jekyllIgnore = [
  '.gitignore',
  'CNAME',
  'LICENSE',
  'Gemfile',
  'Gemfile.lock'
]

async function main () {
  console.log('Getting files in this repository')
  const gitCommand = `git --git-dir ${siteRoot}/.git ls-tree -r -z master --name-only`
  const gitStdOut = await runCommand(gitCommand)
  const paths = gitStdOut
    .split('\0')
    .slice(0, -1)
    .map(f => `/${f}`)

  for (const repo of actionsRepos) {
    console.log(`Getting ${repo} (sitemap.txt)`)
    paths.push(
      ...(await fetch(`https://${domain}/${repo}/sitemap.txt`)
        .then(r => r.text())
        .then(sitemap =>
          sitemap
            .trim()
            .split(/\r?\n/)
            .map(url => decodeURI(new URL(url).pathname))
        ))
    )
  }

  for (const repoBranch of jekyllRepos) {
    console.log(`Getting ${repoBranch} (jekyll)`)
    const [repo, branch] = repoBranch.split('#')
    paths.push(...(await getJekyllSitemap(repo)))
    // Jekyll's pretty weird
    paths.push(
      ...(await getRepoFiles(repo, branch))
        .map(path => {
          if (jekyllIgnore.map(name => `/${repo}/${name}`).includes(path))
            return null
          // Ignore folders and files that start with _
          if (path.startsWith(`/${repo}/_`)) return null
          // Markdown files are built and will show up in the sitemap (except for
          // README.md)
          if (path.endsWith(`.md`) && !path.endsWith('/README.md')) return null
          // It seems, at least for blog, SCSS files are automatically compiled to
          // CSS.
          if (path.endsWith(`.scss`)) return path.replace(/\.scss$/g, '.css')
          return path
        })
        .filter(path => path && !paths.includes(path))
    )
  }

  for (const repoBranch of ghPagesRepos) {
    console.log(`Getting ${repoBranch}`)
    const [repo, branch] = repoBranch.split('#')
    paths.push(...(await getRepoFiles(repo, branch)))
  }

  const filtered = paths.filter(keepPath)
  fs.writeFile(
    new URL('./more-everything.json', import.meta.url),
    JSON.stringify(filtered, null, '\t')
  )
}
main()
