import { Vector2 } from './Vector2.js'

export class Rectangle {
  constructor (x = 0, y = 0, width = 0, height = 0) {
    this.set({ x, y, width, height })
  }

  get pos () {
    return new Vector2(this.x, this.y)
  }

  get size () {
    return new Vector2(this.width, this.height)
  }

  get centre () {
    return new Vector2(this.x + this.width / 2, this.y + this.height / 2)
  }

  get center () {
    return this.centre
  }

  set ({ x = this.x, y = this.y, width = this.width, height = this.height }) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    return this
  }

  translate ({ x = 0, y = 0 }) {
    this.x += x
    this.y += y
    return this
  }

  equals ({ x = 0, y = 0, width = 0, height = 0 }) {
    return this.x === x && this.y === y && this.width === width &&
      this.height === height
  }

  contains ({ x = 0, y = 0 }) {
    return x >= this.x && y >= this.y && x < this.x + this.width &&
      y < this.y + this.height
  }

  intersects ({ x = 0, y = 0, width = 0, height = 0 }) {
    return this.x < x + width && x < this.x + this.width &&
      this.y < y + height && y < this.y + this.height
  }

  map (posFn, sizeFn = posFn) {
    this.x = posFn(this.x)
    this.y = posFn(this.y)
    this.width = sizeFn(this.width)
    this.height = sizeFn(this.height)
    return this
  }

  clone () {
    return new Rectangle(this.x, this.y, this.width, this.height)
  }

  * [Symbol.iterator] () {
    yield this.x
    yield this.y
    yield this.width
    yield this.height
  }

  toString () {
    return `(${this.x}, ${this.y}) to (${this.x + this.width}, ${this.y + this.height})`
  }

  static from ({ top, left, width, height }) {
    return new Rectangle(left, top, width, height)
  }

  static clientBounds (elem) {
    return Rectangle.from(elem.getBoundingClientRect())
  }
}
