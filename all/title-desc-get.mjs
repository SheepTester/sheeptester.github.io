// node all/title-desc-get.mjs

import * as fs from 'fs/promises'
import { parse } from 'node-html-parser'

const ROOT = 'https://sheeptester.github.io'
const JSON_PATH = 'all/title-desc.json'
const SITEMAP_PATH = 'all/sitemap.txt'

const entries = JSON.parse(
  await fs.readFile(JSON_PATH, 'utf-8').catch(() => '[]')
)
const paths = (await fs.readFile(SITEMAP_PATH, 'utf-8'))
  .trim()
  .split(/\r?\n/)
  .map(url => url.replace(ROOT, ''))

process.on('SIGINT', async () => {
  console.log('(^C detected) Saving...'.padEnd(80, ' '))
  await fs.writeFile(JSON_PATH, JSON.stringify(entries, null, '\t') + '\n')
  process.exit()
})

for (const path of paths) {
  if (entries.find(entry => entry.path === path)) {
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
  entries.push({ path, title, description, sheep })
}

console.log('(Done) Saving...'.padEnd(80, ' '))
await fs.writeFile(JSON_PATH, JSON.stringify(entries, null, '\t') + '\n')
