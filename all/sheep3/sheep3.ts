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
    svg.setAttributeNS(null, 'class', styles.logo)

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
      // Compute 100vmax first before making DOM changes
      const maxSize = Math.max(window.innerWidth, window.innerHeight)
      document.body.inert = true
      const screenBlocker = Object.assign(document.createElement('div'), {
        className: styles.screenBlocker
      })
      screenBlocker.style.setProperty(
        '--max-scale',
        `${(maxSize * Math.SQRT2) / 50}`
      )
      screenBlocker.append(
        Object.assign(document.createElement('div'), {
          className: styles.screenBlockerCircle
        }),
        svg.cloneNode(true)
      )
      screenBlocker.addEventListener('animationend', () => {
        setTimeout(() => {
          screenBlocker.remove()
          document.body.inert = false
        }, 500)
        window.location.href = '/?from=sheep3'
      })
      shadowRoot.append(screenBlocker)
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
