// node all/title-desc-get.mts (force)

import * as fs from 'fs/promises'
import { parse } from 'node-html-parser'

const ROOT = 'https://sheeptester.github.io'
const JSON_PATH = 'all/title-desc.json'
const SITEMAP_PATH = 'all/sitemap.txt'

const [, , force] = process.argv
if (force && force !== 'force') {
  console.error('usage: node all/title-desc-get.mts (force)')
  process.exit(1)
}

type Entry = {
  path: string
  title: string | null
  description: string | null
  sheep: 1 | 2 | 3 | null
}

const entries: Entry[] = JSON.parse(
  await fs.readFile(JSON_PATH, 'utf-8').catch(() => '[]')
)
const paths = (await fs.readFile(SITEMAP_PATH, 'utf-8'))
  .trim()
  .split(/\r?\n/)
  .map(url => url.replace(ROOT, ''))

const serialize = () =>
  JSON.stringify(
    entries
      .filter(({ path }) => paths.includes(path))
      .toSorted((a, b) => paths.indexOf(a.path) - paths.indexOf(b.path)),
    null,
    '\t'
  ) + '\n'

process.on('SIGINT', async () => {
  console.log('(^C detected) Saving...'.padEnd(80, ' '))
  await fs.writeFile(JSON_PATH, serialize())
  process.exit()
})

for (const path of paths) {
  const entry = entries.find(entry => entry.path === path)
  if (!force && entry) {
    continue
  }
  process.stdout.write(`Getting ${path}...`.padEnd(80, ' ') + '\r')
  const document = parse(await fetch(ROOT + path).then(r => r.text()))
  const title = document.querySelector('title')?.textContent ?? null
  const description =
    document.querySelector('meta[name=description]')?.getAttribute('content') ??
    null
  const sheep = document.querySelector('script[src$="/sheep.js"]')
    ? 1
    : document.querySelector('script[src$="/sheep2.js"]')
      ? 2
      : document.querySelector('script[src$="/sheep3.js"]')
        ? 3
        : null
  const newEntry: Entry = { path, title, description, sheep }
  if (entry) {
    Object.assign(entry, newEntry)
  } else {
    entries.push(newEntry)
  }
}

console.log('(Done) Saving...'.padEnd(80, ' '))
await fs.writeFile(JSON_PATH, serialize())
