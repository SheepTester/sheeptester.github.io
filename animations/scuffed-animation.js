// @ts-check

/**
 * @param {string} url
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage (url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', reject)
    image.src = url
  })
}

/**
 * @param {string} filename
 * @param {Blob} content
 */
export function download (filename, content) {
  const url = URL.createObjectURL(content)
  const saveLink = Object.assign(document.createElement('a'), {
    href: url,
    download: filename
  })
  document.body.append(saveLink)
  saveLink.click()
  URL.revokeObjectURL(url)
  saveLink.remove()
}

/**
 * @typedef {object} Transition
 * @property {string} at - Name of the event when the transition starts.
 * @property {number} [offset] - Offset from the event when the transition
 * starts.
 * @property {number} [for] - Duration of the transition. Defaults to 0.
 */

/**
 * @typedef {object} RenderOptions
 * @property {number} totalTime
 * @property {number} inTime - Value from 1 to 0 representing the progress
 * through the entering transition. Stays at 0 after the transition ends. NOTE:
 * This value goes backwards down to 0 to require less code to add an entering
 * transition.
 * @property {number} outTime - Value from 0 to 1 representing the progress
 * through the exit transition. Stays at 1 before the transition starts.
 * @property {'in' | 'out' | null} transitioning - Whether the component is
 * transitioning in or out. `null` if it is not transitioning.
 * @property {(transition: Transition) => TransitionResult} getTransition - A
 * helper method to calculate an intermediate transition.
 */

/**
 * @typedef {object} TransitionResult
 * @property {number} time - Value from 0 to 1 representing the progress of the
 * transition. Stays at 0 before the transition starts and 1 after the
 * transition ends.
 * @property {boolean} transitioning - Whether the transition is occurring.
 */

export class Timings {
  duration = 0
  /** @type {Record<string, number>} */
  events = {}

  /**
   * Marks an event at the current time. Mutates object.
   * @param {string} id
   */
  event (id) {
    this.events[id] = this.duration
    return this
  }

  /**
   * Adds to the current time. Mutates object.
   * @param {number} time
   */
  then (time) {
    this.duration += time
    return this
  }

  /**
   * @param {number} time
   * @param {number} start
   * @param {number} end
   */
  #between (time, start, end) {
    if (start <= end) {
      return start < time && time < end
    } else {
      // end < start
      return time > start || time < end
    }
  }

  /**
   * @param {number} start
   * @param {number} end
   */
  #difference (start, end) {
    if (start < end) {
      return end - start
    } else {
      return end + (this.duration - start)
    }
  }

  /**
   * @param {number} time
   * @param {number} offset
   */
  #addTime (time, offset = 0) {
    return (((time + offset) % this.duration) + this.duration) % this.duration
  }

  /**
   * @param {number} time
   * @param {object} options
   * @param {Transition} options.enter
   * @param {Transition} options.exit
   * @param {(options: RenderOptions) => void} options.render
   */
  component (time, { enter, exit, render }) {
    const enterStart = this.#addTime(this.events[enter.at], enter.offset)
    const enterEnd = this.#addTime(enterStart, enter.for)
    const exitStart = this.#addTime(this.events[exit.at], exit.offset)
    const exitEnd = this.#addTime(exitStart, exit.for)
    // This math will probably die with certain numbers
    if (this.#between(time, enterStart, exitEnd)) {
      const transitioning = this.#between(time, enterStart, enterEnd)
        ? 'in'
        : this.#between(time, exitStart, exitEnd)
        ? 'out'
        : null
      render({
        totalTime:
          this.#difference(enterStart, time) /
          this.#difference(enterStart, exitStart),
        inTime:
          transitioning === 'in'
            ? 1 - this.#difference(enterStart, time) / (enter.for ?? 0)
            : 0,
        outTime:
          transitioning === 'out'
            ? this.#difference(exitStart, time) / (exit.for ?? 0)
            : 0,
        transitioning,
        getTransition: transition => {
          const start = this.#addTime(
            this.events[transition.at],
            transition.offset
          )
          const end = this.#addTime(start, transition.for)
          const transitioning = this.#between(time, start, end)
          return {
            time: transitioning
              ? this.#difference(start, time) / (transition.for ?? 0)
              : time === start || this.#between(time, enterStart, start)
              ? 0
              : 1,
            transitioning
          }
        }
      })
    }
  }
}
