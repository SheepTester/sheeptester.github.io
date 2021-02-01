export class Vector2 {
  constructor (x = 0, y = 0) {
    this.set({ x, y })
  }

  get length () {
    return Math.hypot(this.x, this.y)
  }

  get lengthSquared () {
    return this.x * this.x + this.y * this.y
  }

  get angle () {
    return Math.atan2(this.y, this.x)
  }

  set ({ x = this.x, y = this.y }) {
    this.x = x
    this.y = y
    return this
  }

  add ({ x = 0, y = 0 }) {
    this.x += x
    this.y += y
    return this
  }

  sub ({ x = 0, y = 0 }) {
    this.x -= x
    this.y -= y
    return this
  }

  scale (factor = 1) {
    this.x *= factor
    this.y *= factor
    return this
  }

  unit () {
    return this.scale(1 / this.length)
  }

  rotate (angle = 0) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const { x, y } = this
    this.x = x * cos - y * sin
    this.y = x * sin + y * cos
    return this
  }

  equals ({ x = 0, y = 0 }) {
    return this.x === x && this.y === y
  }

  bounded ({ min = null, max = null }) {
    if (min && (this.x < min.x || this.y < min.y)) {
      return false
    }
    if (max && (this.x > max.x || this.y > max.y)) {
      return false
    }
    return true
  }

  map (fn) {
    this.x = fn(this.x)
    this.y = fn(this.y)
    return this
  }

  affix ({ prefix = '', suffix = '' }) {
    this.x = prefix + this.x + suffix
    this.y = prefix + this.y + suffix
    return this
  }

  clone () {
    return new Vector2(this.x, this.y)
  }

  * [Symbol.iterator] () {
    yield this.x
    yield this.y
  }

  toString () {
    return `<${this.x}, ${this.y}>`
  }

  static fromMouseEvent ({ clientX, clientY }) {
    return new Vector2(clientX, clientY)
  }

  static fromRectPos ({ left, top }) {
    return new Vector2(left, top)
  }

  static fromRectSize ({ width, height }) {
    return new Vector2(width, height)
  }
}
