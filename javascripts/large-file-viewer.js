// @ts-check

const elems = {
  selectSource: /** @type {HTMLFieldSetElement} */ (document.getElementById(
    'select-source'
  )),
  file: /** @type {HTMLInputElement} */ (document.getElementById('file')),
  byUrl: /** @type {HTMLFormElement} */ (document.getElementById('by-url')),
  url: /** @type {HTMLInputElement} */ (document.getElementById('url')),
  lines: /** @type {HTMLDivElement} */ (document.getElementById('lines')),
  textMeasurer: /** @type {HTMLSpanElement} */ (document.getElementById(
    'text-measurer'
  ))
}

/**
 * Partition an array based on some test.
 * @template T
 * @param {T[]} array
 * @param {function(T, number): boolean} test
 * @returns {[T[], T[]]}
 */
function partition (array, test) {
  const pass = []
  const fail = []
  for (let i = 0; i < array.length; i++) {
    const item = array[i]
    if (test(item, i)) {
      pass.push(item)
    } else {
      fail.push(item)
    }
  }
  return [pass, fail]
}

/**
 * @param {ReadableStream<Uint8Array>} stream
 * @returns {AsyncIterable<Uint8Array>}
 */
function read (stream) {
  const reader = stream.getReader()
  return {
    [Symbol.asyncIterator]: () => ({
      next: async () => {
        const result = await reader.read()
        // TypeScript weirdness
        if (result.done) {
          return { done: true, value: result.value }
        } else {
          return { done: false, value: result.value }
        }
      }
    })
  }
}

/**
 * @typedef {object} Line
 * @property {number} index - Byte index of the first character in the line.
 * @property {number[]} rowIndices - Array of byte indices for the first
 * character of each row.
 */

/**
 * @param {ReadableStream<Uint8Array>} stream
 * @param {number} columns - The number of columns/characters per line.
 * @param {function(number[]): void} onProgress - The function takes the newly
 * found row indices.
 * @returns {Promise<Line[]>} Indices
 */
async function analyse (stream, columns, onProgress = () => {}) {
  /**
   * 0-indexed, so line 1's byte index is at index 0 of the array.
   * @type {Line[]}
   */
  const lineIndices = [{ index: 0, rowIndices: [0] }]
  /** Keep track of position in column. */
  let column = 0
  /** Keep track of nth byte in a byte sequence. */
  let sequenceState = 0
  /** Keep track of accumulative byte index in the stream. */
  let index = 0
  for await (const bytes of read(stream)) {
    const rowIndices = []
    for (let i = 0; i < bytes.length; i++) {
      if (sequenceState > 0) {
        if (bytes[i] >> 6 === 0b10) {
          // Another byte of a multi-byte sequence. Don't count it as a
          // character (i.e. don't increment the column).
          sequenceState--
          continue
        } else {
          // The multi-byte sequence was unexpectedly interrupted.
          sequenceState = 0
        }
      } else if (bytes[i] >> 3 === 0b11110) {
        sequenceState = 3
      } else if (bytes[i] >> 4 === 0b1110) {
        sequenceState = 2
      } else if (bytes[i] >> 5 === 0b110) {
        sequenceState = 1
      }
      // I believe at this point there's either the start of a multi-byte
      // sequence, an ASCII character, or some invalid byte (which will be
      // replaced with U+FFFD).
      if (column >= columns) {
        column = 0

        const lastLine = lineIndices[lineIndices.length - 1]
        lastLine.rowIndices.push(i + index)
        rowIndices.push(i + index)
      }
      // Check for newline character for a new line.
      if (bytes[i] === 0x0a) {
        column = 0
        lineIndices.push({ index: i + index + 1, rowIndices: [i + index + 1] })
        rowIndices.push(i + index + 1)
      }
      // Tab characters will indent to the next multiple of 4
      if (bytes[i] === 0x09) {
        column = Math.ceil((column + 1) / 4) * 4
      } else {
        column++
      }
    }
    index += bytes.length
    onProgress(rowIndices)
    await new Promise(resolve => setTimeout(resolve, 3000))
  }
  // If `sequenceState` > 0, then each byte in the byte sequence apparently
  // becomes U+FFFD. Whatever.
  return lineIndices
}

/** @returns {[number, number]} - Rows, columns. */
function getSize () {
  const { width, height } = elems.lines.getBoundingClientRect()
  const {
    width: charWidth,
    height: charHeight
  } = elems.textMeasurer.getBoundingClientRect()

  return [Math.floor(height / charHeight), Math.floor(width / charWidth)]
}

const highlightRegex = /[ \n]+|\t|-?(?:\d*\.\d+|\d+\.?)|[$_\p{ID_Start}-][$_\p{ID_Continue}-]*/gu

/**
 * @param {Blob} blob
 */
async function onBlob (blob) {
  document.body.classList.replace('show-view-select-source', 'show-view-viewer')

  const [rows, columns] = getSize()
  const rowElems = Array.from({ length: rows }, () =>
    Object.assign(document.createElement('span'), { className: 'line' })
  )
  const rowIndices = [0]

  /**
   * @param {HTMLSpanElement} rowElem - Should be empty.
   * @param {string} line
   */
  function renderRow (rowElem, line, prevLine = '', nextLine = '') {
    let lastIndex = 0
    // https://mathiasbynens.be/notes/javascript-identifiers-es6 but also
    // allowing hyphens for CSS/Scheme etc
    for (const { [0]: match, index: matchIndex } of (
      prevLine +
      line +
      nextLine
    ).matchAll(highlightRegex)) {
      // Ignore matches from the other lines
      const index = matchIndex - prevLine.length
      const endIndex = index + match.length
      if (index >= line.length) break
      if (endIndex < 0) continue

      const before = line.slice(lastIndex, index)
      if (index > 0 && before.length > 0) {
        rowElem.append(before)
      }
      lastIndex = endIndex

      const matchInLine = match.slice(
        index < 0 ? -index : 0,
        endIndex > line.length ? -(endIndex - line.length) : undefined
      )
      if (' \t\n'.includes(match[0])) {
        const span = Object.assign(document.createElement('span'), {
          className: 'whitespace',
          textContent: matchInLine
        })
        span.dataset.char = [...matchInLine]
          .map(char => ({ ' ': '·', '\t': '→', '\n': '¬' }[char]))
          .join('')
        rowElem.append(span)
      } else if (match.includes('.') || match.match(/^-?\d/)) {
        rowElem.append(
          Object.assign(document.createElement('span'), {
            className: 'number',
            textContent: matchInLine
          })
        )
      } else {
        // Give each name a unique colour; inspired by
        // https://evanbrooks.info/syntax-highlight/
        /** @type {string} */
        const hash = window['md5'](match) // TypeScript hack
        const span = Object.assign(document.createElement('span'), {
          className: 'identifier',
          textContent: matchInLine
        })
        // https://github.com/evnbr/syntax-highlight/blob/74719de0bd23784da2331de6ba6936a8a837893d/v2/script/semantic.js#L22-L32
        span.style.color = window['hsluv'].hsluvToHex([
          (parseInt(hash.slice(9, 12), 16) / 0x1000) * 360,
          60,
          (parseInt(hash.slice(5, 7), 16) / 0x100) * 10 + 62
        ])
        rowElem.append(span)
      }
    }
    const after = line.slice(lastIndex)
    if (after.length > 0) {
      rowElem.append(after)
    }
  }

  let prevStartRow = -rows
  let prevRowCount = 0

  /**
   * @param {number} startRow
   */
  async function setView (startRow) {
    const [oldRowElems, recyclableRowElems] = partition(
      rowElems,
      (_, i) =>
        prevStartRow + i >= startRow &&
        prevStartRow + i < Math.min(startRow + rows, prevRowCount)
    )
    /**
     * A sparse array of cached lines.
     * @type {string[]}
     */
    const lineCache = []
    for (let i = 0; i < rows; i++) {
      const row = startRow + i
      if (
        row >= prevStartRow &&
        row < Math.min(prevStartRow + rows, prevRowCount)
      ) {
        const rowOffset = startRow - prevStartRow
        rowElems[i] = oldRowElems[i - rowOffset]
      } else {
        rowElems[i] = recyclableRowElems.pop()
        rowElems[i].textContent = ''
        if (row < rowIndices.length - 1) {
          if (lineCache[row - 1] === undefined) {
            // Previous line
            lineCache[row - 1] =
              row > 0
                ? await blob.slice(rowIndices[row - 1], rowIndices[row]).text()
                : ''
          }
          if (lineCache[row] === undefined) {
            // Current line
            lineCache[row] = await blob
              .slice(rowIndices[row], rowIndices[row + 1])
              .text()
          }
          if (lineCache[row + 1] === undefined) {
            // Next line
            lineCache[row + 1] =
              row < rowIndices.length - 2
                ? await blob
                    .slice(rowIndices[row + 1], rowIndices[row + 2])
                    .text()
                : ''
          }
          renderRow(
            rowElems[i],
            lineCache[row],
            lineCache[row - 1],
            lineCache[row + 1]
          )
        }
        if (row < prevStartRow && oldRowElems[0]) {
          oldRowElems[0].before(rowElems[i])
        } else {
          elems.lines.append(rowElems[i])
        }
      }
      rowElems[i].style.top = i + 'em'
    }
    prevStartRow = startRow
    prevRowCount = rowIndices.length - 1
  }

  setView(0)
  const lineIndices = await analyse(blob.stream(), columns, indices => {
    for (const index of indices) {
      rowIndices.push(index)
    }
    // setView(rowIndices.length - rows - 1)
    setView(0)
  })
  rowIndices.push(blob.size)
}

elems.file.addEventListener('change', () => {
  if (elems.file.files[0]) {
    onBlob(elems.file.files[0])
  }
})

elems.byUrl.addEventListener('submit', async event => {
  event.preventDefault()

  elems.selectSource.disabled = true
  document.body.classList.remove('show-cors-error', 'show-offline-error')
  try {
    const response = await fetch(elems.url.value)
    onBlob(await response.blob())
  } catch {
    const isCors = await fetch(elems.url.value, { mode: 'no-cors' })
      .then(() => true)
      .catch(() => false)
    document.body.classList.add(
      isCors ? 'show-cors-error' : 'show-offline-error'
    )
  } finally {
    elems.selectSource.disabled = false
  }
})
