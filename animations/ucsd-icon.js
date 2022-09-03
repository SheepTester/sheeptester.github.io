import { loadImage, Timings } from './scuffed-animation.js'
import { easeInCubic, easeInOutCubic, easeOutCubic } from './easing.js'
import { init } from './scuffed-animation-ui.js'

const colleges = [
  { name: 'Revelle', colour: '#263B80' },
  { name: 'Muir', colour: '#0A5540' },
  { name: 'Marshall', colour: '#B01F28' },
  { name: 'Warren', colour: '#802448' },
  { name: 'ERC', colour: '#5B8AB5' },
  { name: 'Sixth', colour: '#048A96' },
  { name: 'Seventh', colour: '#D09229' }
]

const TIME_PER_COLLEGE = 500
const timings = new Timings()
  .then(200)
  .event('geisel-out')
  .then(2000)
  .event('colleges-in')
  .then(2500)
  .event('colleges-out')
  .then(300)
  .event('college-start')
  .then(TIME_PER_COLLEGE * colleges.length)
  .event('college-end')
  .then(1000)
  .event('geisel-in')
  .then(2800)

const WIDTH = 1000
const HEIGHT = 1000

const images = {
  geisel: await loadImage('./ucsd-general-server/geiselnobg.png'),
  colleges: await loadImage('./ucsd-general-server/colleges.svg'),
  // https://i.ytimg.com/vi/Scg-40Eaavc/maxresdefault.jpg
  khosla: await loadImage('./ucsd-general-server/khosla.png')
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

  c.fillStyle = '#717FFF'
  c.fillRect(0, 0, WIDTH, HEIGHT)

  // SKY
  timings.component(time, {
    enter: { at: 'geisel-in', for: 3000, offset: -1000 },
    exit: { at: 'geisel-out', for: 3500 },
    render: ({ inTime, outTime }) => {
      const y =
        -HEIGHT +
        (easeInOutCubic(inTime) + easeInOutCubic(outTime)) * HEIGHT * 2
      const gradient = c.createLinearGradient(0, y, 0, y + 2 * HEIGHT)
      gradient.addColorStop(0, '#717FFF')
      gradient.addColorStop(0.5, '#a3c0ea')
      gradient.addColorStop(1, '#d1e1e4')
      c.fillStyle = gradient
      c.fillRect(0, 0, WIDTH, HEIGHT)
    }
  })

  // KHOSLA
  timings.component(time, {
    enter: { at: 'college-end' },
    exit: { at: 'geisel-in', for: 3000, offset: -1000 },
    render: ({ outTime }) => {
      const y = -easeInOutCubic(outTime) * HEIGHT * 2
      const top = 100
      const width = 1100
      const height =
        (width / images.khosla.naturalWidth) * images.khosla.naturalHeight
      c.drawImage(images.khosla, (WIDTH - width) / 2, y + top, width, height)
      const gradient = c.createLinearGradient(0, y, 0, y + HEIGHT)
      gradient.addColorStop(0, 'rgba(113, 127, 255, 0.5)')
      gradient.addColorStop(0.4, 'rgba(113, 127, 255, 0.5)')
      gradient.addColorStop((top + height) / HEIGHT, '#717FFF')
      gradient.addColorStop(1, '#717FFF')
      c.fillStyle = gradient
      c.fillRect(0, y, WIDTH, HEIGHT)
    }
  })

  // TRIDENT
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

  // GEISEL
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
  })

  // COLLEGE COLOUR BACKGROUNDS
  for (const [i, { colour }] of colleges.entries()) {
    timings.component(time, {
      enter:
        i === 0
          ? { at: 'college-start', for: 500, offset: -500 }
          : { at: 'college-start', for: 400, offset: i * TIME_PER_COLLEGE },
      exit:
        i === colleges.length - 1
          ? {
              at: 'college-end',
              for: 500,
              offset: 200
            }
          : {
              at: 'college-start',
              offset: (i + 1) * TIME_PER_COLLEGE + 300
            },
      render: ({ inTime, outTime }) => {
        c.globalAlpha = 1 - easeInOutCubic(inTime) - easeOutCubic(outTime)
        c.fillStyle = colour
        c.fillRect(0, 0, WIDTH, HEIGHT)
        c.globalAlpha = 1
      }
    })
  }
  for (let i = 0; i < colleges.length; i++) {
    const period = 2000
    // COLLEGE SEALS IN A CIRCLE
    timings.component(time, {
      enter: {
        at: 'colleges-in',
        for: 500,
        offset: (i / colleges.length) * period
      },
      exit: { at: 'colleges-out', for: i === 0 ? 800 : 500 },
      render: ({ inTime, outTime }) => {
        const cycle =
          Math.PI -
          ((time - timings.events['colleges-in']) / period) * Math.PI * 2 +
          (i / colleges.length) * Math.PI * 2
        const radius =
          325 * (i === 0 ? 1 - easeInOutCubic(outTime) : 1) +
          (i !== 0 ? easeInCubic(outTime) * 400 : 0)
        const x = Math.cos(cycle) * radius + WIDTH / 2
        const y =
          Math.sin(cycle) * radius + HEIGHT / 2 - easeInCubic(inTime) * 500
        const size = 300 + (i === 0 ? 700 * easeInOutCubic(outTime) : 0)
        c.drawImage(
          images.colleges,
          0,
          images.colleges.naturalWidth * i,
          images.colleges.naturalWidth,
          images.colleges.naturalWidth,
          x - size / 2,
          y - size / 2,
          size,
          size
        )
      }
    })
    // COLLEGE SEALS ONE BY ONE
    timings.component(time, {
      enter:
        i === 0
          ? { at: 'colleges-out', offset: 800 }
          : {
              at: 'college-start',
              for: 400,
              offset: i * TIME_PER_COLLEGE
            },
      exit: {
        at: 'college-start',
        for: 400,
        offset: (i + 1) * TIME_PER_COLLEGE
      },
      render: ({ inTime, outTime }) => {
        const x =
          WIDTH / 2 +
          easeInOutCubic(inTime) * 1000 -
          easeInOutCubic(outTime) * 1000
        const y = HEIGHT / 2
        const size = 1000
        c.drawImage(
          images.colleges,
          0,
          images.colleges.naturalWidth * i,
          images.colleges.naturalWidth,
          images.colleges.naturalWidth,
          x - size / 2,
          y - size / 2,
          size,
          size
        )
      }
    })
  }

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
  // previewRange: [
  //   { at: 'college-end', offset: 0 },
  //   { at: 'college-end', offset: 3500 }
  // ],
  // initSpeed: 0,
  draw
})

Object.assign(window, {})
