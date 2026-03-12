import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { parse } from 'yaml'
import { App, AppProps } from './App'
import { Page } from './Page'

export async function render (root: HTMLElement): Promise<void> {
  const [rawJournals, rawNews] = await Promise.all([
    fetch('./data.yml')
      .then(r => r.text())
      .then(parse),
    fetch('./news.yml')
      .then(r => r.text())
      .then(parse)
  ])
  hydrateRoot(
    root,
    <StrictMode>
      <App rawJournals={rawJournals} rawNews={rawNews} />
    </StrictMode>
  )
}

export function createPage (props: AppProps) {
  return <Page {...props} />
}
