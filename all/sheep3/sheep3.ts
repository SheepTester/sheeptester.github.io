// TODO:
// - Replace exit transition with animation (so can listen to animationend)
// - Use esbuild or something to inline sheep3-draft.css for me

import styles from './sheep3.module.css'

declare const CSS: string

const sheet = new CSSStyleSheet()
sheet.replaceSync(CSS)

class SheepBtn extends HTMLElement {
  constructor () {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    shadowRoot.adoptedStyleSheets = [sheet]

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttributeNS(null, 'viewBox', '0 0 480 480')

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttributeNS(
      null,
      'd',
      'M90 90a50 50 0 0 0 0 100H98.579A150 150 0 1 0 381.421 190H390a50 50 0 0 0 0 -100a50 50 0 1 1 -100 0a50 50 0 1 1 -100 0a50 50 0 1 1 -100 0z'
    )

    const homeLink = Object.assign(document.createElement('a'), {
      href: '/',
      textContent: 'Go to SheepTester directory',
      className: styles.homeLink
    })

    homeLink.addEventListener('click', e => {
      e.preventDefault()
      document.body.inert = true
      homeLink.classList.add(styles.blockScreen)
      homeLink.addEventListener(
        'transitionend',
        () => {
          window.requestAnimationFrame(() => {
            // Try forcing repaint
            homeLink.getBoundingClientRect()
            // In case the user goes back and the page is load from bfcache
            setTimeout(() => homeLink.classList.remove(styles.blockScreen), 500)
            window.location.href = '/?from=sheep3'
          })
        },
        { once: true }
      )
    })

    svg.append(path)
    homeLink.append(svg)
    shadowRoot.append(homeLink)
  }
}
customElements.define('sheep-btn', SheepBtn)

document.addEventListener(
  'DOMContentLoaded',
  () => document.body.append(document.createElement('sheep-btn')),
  { once: true }
)

// TODO: Remove after 2023-05-29
Object.assign(window, {
  dataLayer: [
    ['js', new Date()],
    ['config', 'G-9NWSPRKVS1']
  ].map(args =>
    (
      function () {
        return arguments
      } as (...args: unknown[]) => unknown
    )(...args)
  )
})
document.head.append(
  Object.assign(document.createElement('script'), {
    src: '/pensive.js'
  })
)
