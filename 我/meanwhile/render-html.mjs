import * as fs from 'fs/promises'
import { renderToString } from 'react-dom/server'
import { createPage } from './dist/index.mjs'

await fs.writeFile(
  new URL('./index.html', import.meta.url),
  renderToString(createPage({}))
)
