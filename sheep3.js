// TODO:
// - Replace exit transition with animation (so can listen to animationend)
// - Use esbuild or something to inline sheep3-draft.css for me

customElements.define(
  'sheep-btn',
  class SheepBtn extends HTMLElement {
    static #sheet = new CSSStyleSheet()
    static {
      this.#sheet.replaceSync(`
/* Not referenced anywhere; manually inlined into sheep3.js */

:host {
  all: initial;
  color-scheme: dark;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
    'Segoe UI Symbol';
}

.home-link {
  font-size: 0;
  display: block;
  position: fixed;
  z-index: 1000;
  height: 50px;
  width: 50px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s;
  right: 10px;
  bottom: 10px;
  transform: translateZ(0);

  &:hover {
    background-color: rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  }

  &:active {
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
    transform: translateZ(0) scale(0.9);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.5), 0 0 0 5px rgba(79, 161, 167, 0.3);
  }

  svg {
    width: 45px;
    height: 45px;
    stroke: white;
    stroke-opacity: 0.7;
    stroke-width: 20;
    fill: none;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -46.667%);
    transition: all 0.2s;
  }

  &.block-screen {
    right: 50%;
    bottom: 50%;
    width: 142vmax;
    height: 142vmax;
    margin: -71vmax;
    background-color: black;
    box-shadow: none;
    pointer-events: none;
    transition: all 0.5s;

    svg {
      transform: scale(2) translate(-50%, -50%);
    }
  }
}
.home-link:not(.block-screen):hover svg {
  stroke: black;
}
      `)
    }

    constructor () {
      super()

      const shadowRoot = this.attachShadow({ mode: 'open' })
      shadowRoot.adoptedStyleSheets = [SheepBtn.#sheet]

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttributeNS(null, 'viewBox', '0 0 480 480')

      const path = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      )
      path.setAttributeNS(
        null,
        'd',
        'M90 90a50 50 0 0 0 0 100H98.579A150 150 0 1 0 381.421 190H390a50 50 0 0 0 0 -100a50 50 0 1 1 -100 0a50 50 0 1 1 -100 0a50 50 0 1 1 -100 0z'
      )

      const homeLink = Object.assign(document.createElement('a'), {
        href: '/',
        textContent: 'Go to SheepTester directory',
        className: 'home-link'
      })

      homeLink.addEventListener('click', e => {
        e.preventDefault()
        document.body.inert = true
        homeLink.classList.add('block-screen')
        homeLink.addEventListener(
          'transitionend',
          () => {
            window.requestAnimationFrame(() => {
              // Try forcing repaint
              homeLink.getBoundingClientRect()
              // In case the user goes back and the page is load from bfcache
              setTimeout(() => homeLink.classList.remove('block-screen'), 500)
              window.location = '/?from=sheep3'
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
)

document.addEventListener(
  'DOMContentLoaded',
  () => document.body.append(document.createElement('sheep-btn')),
  { once: true }
)

// TODO: Remove after 2023-05-29
window.dataLayer = [
  ['js', new Date()],
  ['config', 'G-9NWSPRKVS1']
].map(args =>
  (function () {
    return arguments
  })(...args)
)
document.head.append(
  Object.assign(document.createElement('script'), {
    src: '/pensive.js'
  })
)
