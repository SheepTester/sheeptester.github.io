// TEMP: Remove in Node 26(?)
import 'temporal-polyfill/global'

import { readFile, writeFile } from 'fs/promises'
import { renderToString } from 'react-dom/server'
import YAML from 'yaml'
import { createPage } from './dist/index.mjs'

const [rawJournals, rawNews] = await Promise.all([
  readFile(new URL('./data.yml', import.meta.url), 'utf-8').then(YAML.parse),
  readFile(new URL('./news.yml', import.meta.url), 'utf-8').then(YAML.parse)
])
await writeFile(
  new URL('./index.html', import.meta.url),
  '<!DOCTYPE html>' + renderToString(createPage({ rawJournals, rawNews }))
)
