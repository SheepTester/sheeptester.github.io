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
 * @param {number} time
 * @param {number} start
 * @param {number} end
 */
function between (time, start, end) {
  if (start <= end) {
    return start <= time && time < end
  } else {
    // end < start
    return time >= start || time < end
  }
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
 * @property {number} totalTime - Value from 0 to 1 representing the progress
 * through the entire lifetime of the component.
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
   * If start and end are the same, then that means a range of 0 rather than the
   * full loop.
   * @param {number} start
   * @param {number} end
   */
  difference (start, end) {
    if (start <= end) {
      return end - start
    } else {
      return end + (this.duration - start)
    }
  }

  /**
   * @param {number} time
   * @param {number} offset
   */
  addTime (time, offset = 0) {
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
    const enterStart = this.addTime(this.events[enter.at], enter.offset)
    const enterEnd = this.addTime(enterStart, enter.for)
    const exitStart = this.addTime(this.events[exit.at], exit.offset)
    const exitEnd = this.addTime(exitStart, exit.for)
    // This math will probably die with certain numbers
    if (between(time, enterStart, exitEnd)) {
      const transitioning = between(time, enterStart, enterEnd)
        ? 'in'
        : between(time, exitStart, exitEnd)
        ? 'out'
        : null
      render({
        totalTime:
          this.difference(enterStart, time) /
          this.difference(enterStart, exitStart),
        // Dividing by enter.for || 1 because if it's 0 then it shouldn't
        // matter, but it shouldn't be NaN either
        inTime:
          transitioning === 'in'
            ? 1 - this.difference(enterStart, time) / (enter.for || 1)
            : 0,
        outTime:
          transitioning === 'out'
            ? this.difference(exitStart, time) / (exit.for || 1)
            : 0,
        transitioning,
        getTransition: transition => {
          const start = this.addTime(
            this.events[transition.at],
            transition.offset
          )
          const end = this.addTime(start, transition.for)
          const transitioning = between(time, start, end)
          return {
            time: transitioning
              ? this.difference(start, time) / (transition.for || 1)
              : time === start || between(time, enterStart, start)
              ? 0
              : 1,
            transitioning
          }
        }
      })
    }
  }
}

export class PlayState {
  #timings
  #speed
  #baseRealTime = Date.now()
  #baseAnimTime = 0
  #startTime = 0
  #duration

  /**
   * @param {Timings} timings
   */
  constructor (timings, speed = 1) {
    this.#timings = timings
    this.#duration = timings.duration
    this.#speed = speed
  }

  /**
   * @param {Transition} start
   * @param {Transition} end
   */
  setBounds (start, end) {
    const startTime = this.#timings.addTime(
      this.#timings.events[start.at],
      start.offset
    )
    const endTime = this.#timings.addTime(
      this.#timings.events[end.at],
      end.offset
    )
    this.#startTime = startTime
    this.#duration = this.#timings.difference(startTime, endTime)
  }

  #getAnimTime (now = Date.now()) {
    return (
      ((now - this.#baseRealTime) * this.#speed + this.#baseAnimTime) %
      this.#duration
    )
  }

  getTime () {
    return this.#timings.addTime(this.#getAnimTime(), this.#startTime)
  }

  /**
   * @param {number} speed
   */
  setSpeed (speed) {
    const now = Date.now()
    const animTime = this.#getAnimTime()
    this.#speed = speed
    this.#baseRealTime = now
    this.#baseAnimTime = animTime
  }
}
