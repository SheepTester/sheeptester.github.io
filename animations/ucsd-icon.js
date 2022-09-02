import { loadImage, Timings } from './scuffed-animation.js'
import { easeInCubic, easeInOutCubic, easeOutCubic } from './easing.js'
import { init } from './scuffed-animation-ui.js'

const timings = new Timings()
  .event('geisel-in')
  .then(3000)
  .event('geisel-out')
  .then(3000)
  .event('colleges-in')
  .then(3000)
  .event('colleges-out')
  .then(1000)

const WIDTH = 1000
const HEIGHT = 1000

const images = {
  geisel: await loadImage('./ucsd-general-server/geiselnobg.png'),
  revelle: await loadImage('./ucsd-general-server/c1_revelle.png'),
  muir: await loadImage('./ucsd-general-server/c2_muir.png'),
  marshall: await loadImage('./ucsd-general-server/c3_marshall.png'),
  warren: await loadImage('./ucsd-general-server/c4_warren.png'),
  erc: await loadImage('./ucsd-general-server/c5_erc.png'),
  sixth: await loadImage('./ucsd-general-server/c6_sixth.png'),
  seventh: await loadImage('./ucsd-general-server/c7_seventh.png')
}

const colleges = [
  images.revelle,
  images.muir,
  images.marshall,
  images.warren,
  images.erc,
  images.sixth,
  images.seventh
]

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

  c.fillStyle = '#717FFF'
  c.fillRect(0, 0, WIDTH, HEIGHT)

  timings.component(time, {
    enter: { at: 'geisel-in', for: 3000, offset: -1000 },
    exit: { at: 'geisel-out', for: 3500 },
    render: ({ inTime, outTime }) => {
      const y =
        -HEIGHT + (easeInCubic(inTime) + easeInOutCubic(outTime)) * HEIGHT * 2
      const gradient = c.createLinearGradient(0, y, 0, y + 2 * HEIGHT)
      gradient.addColorStop(0, '#717FFF')
      gradient.addColorStop(0.5, '#a3c0ea')
      gradient.addColorStop(1, '#d1e1e4')
      c.fillStyle = gradient
      c.fillRect(0, 0, WIDTH, HEIGHT)
    }
  })

  timings.component(time, {
    enter: { at: 'geisel-in', for: 2000 },
    exit: { at: 'geisel-out', for: 2000 },
    render: ({ inTime, outTime, getTransition }) => {
      const y = HEIGHT + easeInCubic(inTime) * 300 + easeInCubic(outTime) * 900
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
    exit: { at: 'geisel-out', for: 1500 },
    render: ({ inTime, outTime }) => {
      c.drawImage(
        images.geisel,
        -159,
        277 + (easeInCubic(inTime) + easeInCubic(outTime)) * 500,
        1448,
        972
      )
    }
  }))

  c.restore()
}

init({
  ratio: WIDTH / HEIGHT,
  wrapper: document.getElementById('canvas-wrapper'),
  downloadBtn: document.getElementById('download'),
  gifOptions: {
    FPS: 10,
    WIDTH: 100,
    MP4: false
  },
  fileName: 'ucsd-gen-icon',
  timings,
  draw
})

Object.assign(window, {})
