import { loadImage, Timings } from './scuffed-animation.js'
import { easeInCubic } from './easing.js'
import { init } from './scuffed-animation-ui.js'

const timings = new Timings()
  .event('spears-out')
  .then(100)
  .event('spears-in')
  .then(1500)

const WIDTH = 960
const HEIGHT = 540

const images = {
  background: await loadImage('./ucsd-general-server/bluebg_full.png'),
  sky: await loadImage('./ucsd-general-server/rainbow_bg.png'),
  geisel: await loadImage('./ucsd-general-server/Geisel bg.png')
}

// Trident measurements
/** Center point of long spear, x-axis */
const X = 544
/** Distance between the centers of each spear, x-axis */
const SPACING = 219
/** Gap between two spears, ⊥-axis */
const GAP = 27
/** Spear width, ⊥-axis */
const TWIDTH = 128
/** Length of longest spear, //-axis */
const LENGTH = 623
/** `LENGTH - DIFF` is the length of the shorter spears, //-axis */
const DIFF = 184
/** Difference in x/y up/down half a spear, x-axis */
const HALF_UP = (TWIDTH / 2) * Math.SQRT1_2
/** Horizontal length of half a spear, x-axis */
const HALF_LEN = (TWIDTH / 2) * Math.SQRT2
/** Length of left spear axis from bottom of canvas, //-axis */
const LEFT_LENGTH = LENGTH - DIFF - SPACING * Math.SQRT1_2
/** Length of right spear axis from bottom of canvas, //-axis */
const RIGHT_LENGTH = LENGTH - DIFF + SPACING * Math.SQRT1_2

/**
 *
 * @param {CanvasRenderingContext2D} c
 * @param {number} time
 */
function draw (c, time) {
  c.save()
  c.scale(c.canvas.width / WIDTH, c.canvas.height / HEIGHT)
  c.drawImage(images.background, 0, 0, WIDTH, HEIGHT)

  c.save()
  c.beginPath()

  const clipSpear = (x, length) => {
    c.moveTo(x + HALF_LEN, HEIGHT)
    c.lineTo(x - HALF_LEN, HEIGHT)
    const offset = length * Math.SQRT1_2
    c.lineTo(x - offset - HALF_UP, HEIGHT - offset + HALF_UP)
    c.lineTo(x - offset + HALF_UP, HEIGHT - offset - HALF_UP)
  }

  timings.component(time, {
    enter: { at: 'spears-in', for: 500 },
    exit: { at: 'spears-out' },
    render: ({ inTime }) => {
      clipSpear(X - SPACING, LEFT_LENGTH - easeInCubic(inTime) * RIGHT_LENGTH)
    }
  })
  timings.component(time, {
    enter: { at: 'spears-in', for: 500, offset: 200 },
    exit: { at: 'spears-out' },
    render: ({ inTime }) => {
      clipSpear(X, LENGTH - easeInCubic(inTime) * RIGHT_LENGTH)
    }
  })
  timings.component(time, {
    enter: { at: 'spears-in', for: 500, offset: 400 },
    exit: { at: 'spears-out' },
    render: ({ inTime }) => {
      clipSpear(X + SPACING, RIGHT_LENGTH - easeInCubic(inTime) * RIGHT_LENGTH)
    }
  })

  c.clip()
  c.drawImage(images.sky, 0, 0, WIDTH, HEIGHT)
  c.restore()

  c.drawImage(images.geisel, 0, 0, WIDTH, HEIGHT)
  c.restore()
}

init({
  ratio: WIDTH / HEIGHT,
  wrapper: document.getElementById('canvas-wrapper'),
  downloadBtn: document.getElementById('download'),
  gifOptions: {
    FPS: 20,
    WIDTH: 300,
    MP4: false
  },
  timings,
  draw
})

Object.assign(window, {})
