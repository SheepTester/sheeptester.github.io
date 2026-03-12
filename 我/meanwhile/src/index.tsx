import { hydrateRoot } from 'react-dom/client'
import { App, AppProps } from './App'
import { StrictMode } from 'react'
import { Page } from './Page'

export function render (root: HTMLElement, props: AppProps): void {
  hydrateRoot(
    root,
    <StrictMode>
      <App {...props} />
    </StrictMode>
  )
}

export function createPage (props: AppProps) {
  return <Page {...props} />
}
