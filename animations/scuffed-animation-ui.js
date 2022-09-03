// @ts-check

// @ts-ignore
import { GUI } from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js'
import { download, PlayState, Timings } from './scuffed-animation.js'

const unwrap = () => {
  throw new TypeError('Expected value')
}

/**
 * A time for specifying a preview range's start and end time.
 *
 * @typedef {object} TimeBound
 * @property {string} at - Name of the event.
 * @property {number} [offset] - Offset from the event.
 */

/**
 * @param {object} options
 * @param {number} options.ratio - Aspect ratio, width to height
 * @param {HTMLElement} options.wrapper - Wrapper element for the preview's
 * canvas.
 * @param {HTMLButtonElement} options.downloadBtn
 * @param {object} options.gifOptions
 * @param {number} options.gifOptions.FPS - Default FPS for the gif/mp4. A
 * factor of 100 is optimal for gifs because gifs store delays in hundredths of
 * a second.
 * @param {number} options.gifOptions.WIDTH - Default width of the resulting
 * gif/mp4. The height will be scaled accordingly.
 * @param {number} options.gifOptions.MP4
 * @param {number} options.fileName - File name of the output gif/mp4
 * @param {Timings} options.timings
 * @param {[TimeBound, TimeBound]} [options.previewRange] - The time range to
 * bound the preview within.
 * @param {number} [options.initSpeed]
 * @param {(c: CanvasRenderingContext2D, time: number) => void} options.draw
 */
export function init ({
  ratio,
  wrapper,
  downloadBtn,
  gifOptions,
  fileName,
  timings,
  previewRange,
  initSpeed = 1,
  draw
}) {
  const options = { speed: initSpeed, serverIcon: false, circle: false }
  const playState = new PlayState(timings, initSpeed)
  if (previewRange) {
    playState.setBounds(...previewRange)
  }

  const gui = new GUI()
  gui.add(options, 'speed', 0, 5).onChange(() => {
    playState.setSpeed(options.speed)
  })
  gui.add(options, 'serverIcon').onChange(() => {
    if (options.serverIcon) {
      wrapper.classList.add('server-icon')
    } else {
      wrapper.classList.remove('server-icon')
    }
  })
  gui.add(options, 'circle').onChange(() => {
    if (options.circle) {
      wrapper.classList.add('circle')
    } else {
      wrapper.classList.remove('circle')
    }
  })
  const gifOptionsFolder = gui.addFolder('GIF options')
  for (const key of Object.keys(gifOptions)) {
    gifOptionsFolder.add(gifOptions, key)
  }

  const canvas = document.createElement('canvas')
  new ResizeObserver(([{ contentBoxSize }]) => {
    const [{ blockSize: height, inlineSize: width }] = contentBoxSize
    const canvasWidth = Math.min(width, height * ratio)
    canvas.width = canvasWidth * window.devicePixelRatio
    canvas.height = (canvasWidth / ratio) * window.devicePixelRatio
    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasWidth / ratio}px`
  }).observe(wrapper)
  wrapper.append(canvas)
  const context = canvas.getContext('2d') ?? unwrap()

  function paint () {
    draw(context, playState.getTime())
    window.requestAnimationFrame(paint)
  }
  paint()

  downloadBtn.addEventListener('click', async () => {
    downloadBtn.disabled = true
    const dummyCanvas = document.createElement('canvas')
    dummyCanvas.width = gifOptions.WIDTH
    dummyCanvas.height = gifOptions.WIDTH / ratio
    const dummyContext = dummyCanvas.getContext('2d') ?? unwrap()
    const frameDelay = 1000 / gifOptions.FPS
    if (gifOptions.MP4) {
      if (!('SharedArrayBuffer' in window)) {
        downloadBtn.disabled = false
        alert(
          "SharedArrayBuffer isn't available. Reload the page and try again. If it still doesn't work, then I guess you can't download an mp4."
        )
        return
      }
      // @ts-ignore
      await import('https://unpkg.com/@ffmpeg/ffmpeg@0.9.5/dist/ffmpeg.min.js')
      // @ts-ignore
      const { createFFmpeg, fetchFile } = FFmpeg
      const ffmpeg = createFFmpeg({ log: true })
      await ffmpeg.load()
      let frame = 0
      for (let i = 0; i < timings.duration; i += frameDelay) {
        draw(dummyContext, i)
        const blob = await new Promise(resolve => {
          dummyCanvas.toBlob(resolve, 'image/png')
        })
        ffmpeg.FS('writeFile', `frame${frame}.png`, await fetchFile(blob))
        frame++
      }
      await ffmpeg.run(
        '-r',
        gifOptions.FPS + '',
        '-i',
        `frame%d.png`,
        'output.mp4'
      )
      const data = ffmpeg.FS('readFile', 'output.mp4')
      download(
        `${fileName}.mp4`,
        new Blob([data.buffer], { type: 'video/mp4' })
      )
      downloadBtn.disabled = false
    } else {
      // @ts-ignore
      await import('https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js')
      // @ts-ignore
      const gif = new GIF({
        workerScript: './gif-worker.js',
        width: gifOptions.WIDTH,
        height: gifOptions.WIDTH / ratio
      })
      gif.on('finished', blob => {
        download(`${fileName}.gif`, blob)
        downloadBtn.disabled = false
      })
      for (let i = 0; i < timings.duration; i += frameDelay) {
        draw(dummyContext, i)
        gif.addFrame(dummyContext, {
          delay: frameDelay,
          copy: true,
          quality: 1,
          dither: 'FloydSteinberg-serpentine',
          globalPalette: true
        })
      }
      gif.render()
    }
  })
}

navigator.serviceWorker.register('./sw.js')
