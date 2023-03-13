// @ts-check

const r = String.raw

/**
 * An immutable class representing a double-precision floating-point number that
 * keeps track of significant figures.
 *
 * The specific rules on sig figs are based on Dr. Mellows' rules taught in her
 * Chem H class.
 *
 * I recommend using `SigFigNumber.from` to create instances by parsing a
 * string.
 */
export class SigFigNumber {
  /** @type {number} Value of the represented number. */
  value
  /** @type {number} Number of sig figs. */
  sigFigs

  /**
   * @param {number} value - Value of the represented number.
   * @param {number} sigFigs - Number of sig figs.
   */
  constructor (value, sigFigs) {
    this.value = value
    this.sigFigs = sigFigs
  }

  /**
   * The number of significant digits after the decimal point. For example, 3.40
   * has two decimals.
   * @type {number}
   */
  get #decimals () {
    return this.sigFigs - SigFigNumber.#intDigits(this.value)
  }

  /**
   * The exponent value of the number in scientific notation. The exponent of
   * 320 is 2, and the exponent of 0.00340 is -3.
   * @type {number}
   */
  get #exponent () {
    return Math.floor(Math.log10(Math.abs(this.value)))
  }

  /**
   * The exponent of the least significant digit. For example, the increment of
   * 320 is 1, and the increment of 3.40 is -2.
   * @type {number}
   */
  get lsdExponent () {
    return this.#exponent - this.sigFigs + 1
  }

  /**
   * Adds two numbers together.
   * @param {SigFigNumber} number
   * @returns {SigFigNumber} A new `SigFigNumber` instance.
   */
  plus (number) {
    const sum = this.value + number.value
    return new SigFigNumber(
      sum,
      SigFigNumber.#intDigits(sum) + Math.min(this.#decimals, number.#decimals)
    )
  }

  /**
   * Subtracts `number` from `this`.
   * @param {SigFigNumber} number
   * @returns {SigFigNumber} A new `SigFigNumber` instance.
   */
  minus (number) {
    return this.plus(number.times(-1))
  }

  /**
   * Multiplies two numbers.
   * @param {SigFigNumber | number} number - Primitive JavaScript numbers are
   * assumed to have infinite sig figs.
   * @returns {SigFigNumber} A new `SigFigNumber` instance.
   */
  times (number) {
    if (typeof number === 'number') {
      return new SigFigNumber(this.value * number, this.sigFigs)
    } else {
      return new SigFigNumber(
        this.value * number.value,
        Math.min(this.sigFigs, number.sigFigs)
      )
    }
  }

  /**
   * @returns {SigFigNumber} A new `SigFigNumber` instance with the
   * multiplicative inverse (i.e. `1/this`).
   */
  inverse () {
    return new SigFigNumber(1 / this.value, this.sigFigs)
  }

  /**
   * Casts to a number.
   * @returns {number}
   */
  valueOf () {
    return this.value
  }

  /**
   * Formats the number as human-readable text that property represents the
   * number of sig figs.
   *
   * There are three formats supported:
   * - `latex`, which will produce LaTeX math mode syntax for the number. For
   *   example, 3.40e30 will produce `3.40 \cdot 10^{30}`.
   * - `unicode`, which will use special Unicode symbols. For example, 3.40e30
   *   becomes 3.40 · 10³⁰.
   * - `js` will mimic JavaScript's number formatting, but still preserve sig
   *   figs. For example, 3.40e30 remains `3.40e30`.
   *
   * @param {'latex' | 'unicode' | 'js'} format - Defaults to `latex` for
   * compatibility with `cho.html`.
   * @returns {string}
   */
  toString (format = 'latex') {
    const decimals = this.#decimals
    if (this.value === 0) {
      return '0'
    } else if (Number.isNaN(this.value)) {
      return format === 'latex' ? r`\text{NaN}` : 'NaN'
    } else if (this.value === Infinity || this.value === -Infinity) {
      return (
        (this.value < 0 ? (format === 'unicode' ? '−' : '-') : '') +
        (format === 'latex'
          ? r`\infty`
          : format === 'unicode'
          ? '∞'
          : 'Infinity')
      )
    }
    const exponent = this.#exponent
    if (exponent < -2 || decimals < 0) {
      // Use scientific notation
      const coefficient = this.value / 10 ** exponent
      return (
        coefficient.toFixed(Math.max(this.sigFigs - 1, 0)) +
        (format === 'latex'
          ? r` \cdot 10^{${exponent}}`
          : format === 'unicode'
          ? ` · 10${SigFigNumber.#displaySuperscript(exponent)}`
          : `e${exponent}`)
      )
    } else {
      const string = this.value.toFixed(decimals)
      if (decimals === 0 && string.endsWith('0') && string.length > 1) {
        return string + '.'
      } else {
        return string
      }
    }
  }

  // From https://sheeptester.github.io/hello-world/sigfig.html

  static #sigFigRegex =
    /^-?0*(?:((?:[1-9][0-9]*)?[1-9])0*|([1-9][0-9]*(?:\.[0-9]+)?)(?:\.)?|\.0*([1-9][0-9]*))$/
  static #sciNote = /((x|\*)\s*10|e)(\s*(\^|\*\*)?\s*[0-9-.]+)?$/i
  static #nonNumbers = /[^0-9-.]/g

  /**
   * @param {string} number - A string representing a number in JavaScript
   * number format.
   * @returns {number} The number of sig figs.
   */
  static #parseSigFigs (number) {
    const match = number
      .replace(this.#sciNote, '')
      .replace(this.#nonNumbers, '')
      .match(this.#sigFigRegex)
    if (!match) {
      return 0
    }
    const matchGroup = match[1] || match[2] || match[3]
    return matchGroup.replace(/\./g, '').length
  }

  /**
   * Determines the number of non-zero integer digits. For example, 321.40 has 3
   * integer digits.
   *
   * @param {number} number
   * @returns {number} The number of non-zero digits in a truncated `number`.
   */
  static #intDigits (number) {
    const abs = Math.abs(number)
    return abs < 1 ? 0 : Math.floor(Math.log10(abs)) + 1
  }

  /**
   * Parses a string as a `SigFigNumber`. You should use this constructor over
   * `new SigFigNumber`.
   *
   * @param {string} number - A string representing a number in JavaScript
   * number format.
   * @returns {SigFigNumber} With the correct number of sig figs in `number`.
   */
  static from (number) {
    return new SigFigNumber(+number, SigFigNumber.#parseSigFigs(number))
  }

  /** Maps index -> corresponding superscript digit in Unicode. */
  static #superscriptDigits = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹']

  /**
   * Displays an integer in superscript using Unicode superscript characters.
   *
   * @param {number} number - An integer. May be negative.
   * @returns {string} Integer formatted in Unicode superscript.
   */
  static #displaySuperscript (number) {
    return Array.from(String(number), char =>
      char === '-' ? '⁻' : SigFigNumber.#superscriptDigits[char]
    ).join('')
  }
}
