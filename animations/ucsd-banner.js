import { loadImage, Timings } from './scuffed-animation.js'
import { easeInOutCubic, easeInCubic, easeOutCubic } from './easing.js'
import { init } from './scuffed-animation-ui.js'

const timings = new Timings().then(1000)

const WIDTH = 960
const HEIGHT = 540

const images = {
  background: await loadImage('./ucsd-general-server/bluebg_full.png'),
  sky: await loadImage('./ucsd-general-server/rainbow_bg.png'),
  geisel: await loadImage('./ucsd-general-server/Geisel bg.png')
}

const TRIDENT = {
  X: 544, // x-axis
  SPACING: 219, // Distance between the centers of each spear, x-axis
  GAP: 27, // Gap between two spears, ⊥-axis
  WIDTH: 128, // ⊥-axis
  HEIGHT: 623, // //-axis
  DIFF: 184 // HEIGHT - DIFF is the length of the shorter spears, //-axis
}

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
  c.rect(time, 350, 100, 100)
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
