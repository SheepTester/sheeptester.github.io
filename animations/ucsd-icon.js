import { loadImage, Timings } from './scuffed-animation.js'
import { easeInCubic, easeOutCubic } from './easing.js'
import { init } from './scuffed-animation-ui.js'

const timings = new Timings()
  .event('geisel-in')
  .then(3000)
  .event('geisel-out')
  .then(3100)

const WIDTH = 1000
const HEIGHT = 1000

const images = {
  geisel: await loadImage('./ucsd-general-server/geiselnobg.png')
}

/** Width of each trident spear, ⊥-axis */
const TWIDTH = 205
/** Length of the longer spear, //-axis */
const TLENGTH_LONG = 1157
/** Length of the shorter spears, //-axis */
const TLENGTH_SHORT = 865
/** Gap between each spear, ⊥-axis */
const TGAP = 42
/** Spacing between the central axes of each spear, x-axis */
const TSPACING = (TGAP + TWIDTH) / Math.SQRT2
/** Offset from the bottom middle of a spear to its corner, x-axis */
const TCORNER = TWIDTH / 2 / Math.SQRT2

/**
 *
 * @param {CanvasRenderingContext2D} c
 * @param {number} time
 */
function draw (c, time) {
  c.save()
  c.scale(c.canvas.width / WIDTH, c.canvas.height / HEIGHT)

  c.fillStyle = '#a3c0ea'
  c.fillRect(0, 0, WIDTH, HEIGHT)

  timings.component(time, {
    enter: { at: 'geisel-in', for: 5000, offset: -3000 },
    exit: { at: 'geisel-out' },
    render: ({ inTime }) => {
      const y = -HEIGHT + easeInCubic(inTime) * HEIGHT
      const gradient = c.createLinearGradient(0, y, 0, y + 2 * HEIGHT)
      gradient.addColorStop(0, 'red')
      gradient.addColorStop(0.5, '#a3c0ea')
      gradient.addColorStop(1, 'blue')
      // gradient.addColorStop(1, '#d1e1e4')
      c.fillStyle = gradient
      c.fillRect(0, 0, WIDTH, HEIGHT)
    }
  })

  timings.component(time, {
    enter: { at: 'geisel-in', for: 2000 },
    exit: { at: 'geisel-out' },
    render: ({ inTime, getTransition }) => {
      const y = HEIGHT + easeInCubic(inTime) * 300
      c.beginPath()
      const drawSpear = (baseLength, offset) => {
        const length =
          TLENGTH_LONG *
            easeOutCubic(
              getTransition({
                at: 'geisel-in',
                for: 800,
                offset: (offset + 1) * 300
              }).time
            ) -
          (TLENGTH_LONG - baseLength)
        const spacing = TSPACING * offset
        c.moveTo(WIDTH - TCORNER + spacing, y + TCORNER - spacing)
        c.lineTo(WIDTH + TCORNER + spacing, y - TCORNER - spacing)
        c.lineTo(
          WIDTH + TCORNER + spacing - length / Math.SQRT2,
          y - TCORNER - spacing - length / Math.SQRT2
        )
        c.lineTo(
          WIDTH - TCORNER + spacing - length / Math.SQRT2,
          y + TCORNER - spacing - length / Math.SQRT2
        )
      }
      drawSpear(TLENGTH_SHORT, -1)
      drawSpear(TLENGTH_LONG, 0)
      drawSpear(TLENGTH_SHORT, 1)
      c.fillStyle = '#FFCD00'
      c.fill()
    }
  })

  timings.component(time, {
    enter: { at: 'geisel-in', for: 2000 },
    exit: { at: 'geisel-out' },
    render: ({ inTime }) => {
      c.drawImage(
        images.geisel,
        -159,
        277 + easeInCubic(inTime) * 500,
        1448,
        972
      )
    }
  })

  c.restore()
}

init({
  ratio: WIDTH / HEIGHT,
  wrapper: document.getElementById('canvas-wrapper'),
  downloadBtn: document.getElementById('download'),
  gifOptions: {
    FPS: 30,
    WIDTH: 960,
    MP4: true
  },
  fileName: 'ucsd-gen-banner',
  timings,
  draw
})

Object.assign(window, {})
