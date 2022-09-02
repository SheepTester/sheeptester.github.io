import { loadImage, Timings } from './scuffed-animation.js'
import { easeInCubic, easeOutCubic } from './easing.js'
import { init } from './scuffed-animation-ui.js'

const timings = new Timings()
  .then(300)
  .event('spears-out')
  .then(1500)
  .event('spears-in')
  .then(3000)

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

  const gradient = c.createLinearGradient(0, 0, 0, HEIGHT)
  gradient.addColorStop(0, '#a3c0ea')
  gradient.addColorStop(1, '#d1e1e4')
  c.fillStyle = gradient
  c.fillRect(0, 0, WIDTH, HEIGHT)

  c.beginPath()
  c.moveTo(WIDTH - TCORNER, HEIGHT + TCORNER)
  c.lineTo(WIDTH + TCORNER, HEIGHT - TCORNER)
  c.lineTo(
    WIDTH + TCORNER - TLENGTH_LONG / Math.SQRT2,
    HEIGHT - TCORNER - TLENGTH_LONG / Math.SQRT2
  )
  c.lineTo(
    WIDTH - TCORNER - TLENGTH_LONG / Math.SQRT2,
    HEIGHT + TCORNER - TLENGTH_LONG / Math.SQRT2
  )
  c.moveTo(WIDTH - TCORNER - TSPACING, HEIGHT + TCORNER + TSPACING)
  c.lineTo(WIDTH + TCORNER - TSPACING, HEIGHT - TCORNER + TSPACING)
  c.lineTo(
    WIDTH + TCORNER - TSPACING - TLENGTH_SHORT / Math.SQRT2,
    HEIGHT - TCORNER + TSPACING - TLENGTH_SHORT / Math.SQRT2
  )
  c.lineTo(
    WIDTH - TCORNER - TSPACING - TLENGTH_SHORT / Math.SQRT2,
    HEIGHT + TCORNER + TSPACING - TLENGTH_SHORT / Math.SQRT2
  )
  c.moveTo(WIDTH - TCORNER + TSPACING, HEIGHT + TCORNER - TSPACING)
  c.lineTo(WIDTH + TCORNER + TSPACING, HEIGHT - TCORNER - TSPACING)
  c.lineTo(
    WIDTH + TCORNER + TSPACING - TLENGTH_SHORT / Math.SQRT2,
    HEIGHT - TCORNER - TSPACING - TLENGTH_SHORT / Math.SQRT2
  )
  c.lineTo(
    WIDTH - TCORNER + TSPACING - TLENGTH_SHORT / Math.SQRT2,
    HEIGHT + TCORNER - TSPACING - TLENGTH_SHORT / Math.SQRT2
  )
  c.fillStyle = '#FFCD00'
  c.fill()

  c.drawImage(images.geisel, -159, 277, 1448, 972)

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
