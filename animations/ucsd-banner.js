import { loadImage, Timings } from './scuffed-animation.js'
import { easeInOutCubic, easeInCubic, easeOutCubic } from './easing.js'
import { init } from './scuffed-animation-ui.js'

const timings = new Timings().then(1000)

const WIDTH = 960
const HEIGHT = 540

const images = {
  crewmate: await loadImage('./crewmate.webp')
}

/**
 *
 * @param {CanvasRenderingContext2D} c
 * @param {number} time
 */
function draw (c, time) {
  c.save()
  c.scale(c.canvas.width / WIDTH, c.canvas.height / HEIGHT)
  c.clearRect(0, 0, WIDTH, HEIGHT)

  c.fillStyle = 'red'
  c.fillRect(time, 0, 100, 100)

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
