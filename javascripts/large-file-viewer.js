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
  )),
  scrollbar: /** @type {HTMLDivElement} */ (document.getElementById(
    'scrollbar'
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
 * @param {function(number[]): Promise<void>} onProgress - The function takes
 * the newly found row indices.
 * @returns {Promise<Line[]>} Indices
 */
async function analyse (stream, columns, onProgress = () => Promise.resolve()) {
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
    // Take a break between chunks; it seems that reading large files will make
    // it stream very quickly without any break for a page render, which is sad.
    await onProgress(rowIndices)
    await new Promise(window.requestAnimationFrame)
  }
  // If `sequenceState` > 0, then each byte in the byte sequence apparently
  // becomes U+FFFD. Whatever.
  return lineIndices
}

/** @returns {{ rows: number, columns: number, charHeight: number }} */
function getSize () {
  const { width, height } = elems.lines.getBoundingClientRect()
  const {
    width: charWidth,
    height: charHeight
  } = elems.textMeasurer.getBoundingClientRect()

  return {
    rows: Math.floor(height / charHeight),
    columns: Math.floor(width / charWidth),
    charHeight
  }
}

const highlightRegex = /[ \n]+|\t|-?(?:\d*\.\d+|\d+\.?)|[$_\p{ID_Start}-][$_\p{ID_Continue}-]*/gu

/**
 * @param {Blob} blob
 */
async function onBlob (blob) {
  document.body.classList.replace('show-view-select-source', 'show-view-viewer')

  const { rows, columns, charHeight } = getSize()
  let rowElems = Array.from({ length: rows }, () =>
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
  let abortRequests = 0
  /**
   * A promise that resolves when the currently running `setView` finishes.
   * `null` if `setView` is not running.
   * @type {Promise<void> | null}
   */
  let running = null

  /** @param {number} startRow */
  function setScrollbar (startRow) {
    const scrollbarHeight = Math.max(
      (rows / (rowIndices.length - 1 + rows)) * 100,
      5
    )
    elems.scrollbar.style.height = scrollbarHeight + '%'
    elems.scrollbar.style.top =
      rowIndices.length <= 1
        ? '0'
        : (startRow / (rowIndices.length - 2)) * (100 - scrollbarHeight) + '%'
  }

  /**
   * @param {number} startRow
   * @returns {Promise<boolean>} - Whether the function had been aborted
   */
  async function _setView (startRow) {
    if (running) {
      abortRequests++
      await running
    }
    if (abortRequests > 0) {
      abortRequests--
      return true
    }
    if (prevStartRow === startRow && prevRowCount === rowIndices.length - 1) {
      return false
    }
    const [oldRowElems, recyclableRowElems] = partition(
      rowElems,
      (_, i) =>
        prevStartRow + i >= startRow &&
        prevStartRow + i < Math.min(startRow + rows, prevRowCount)
    )
    const newRowElems = [...rowElems]
    /**
     * A sparse array of cached lines.
     * @type {string[]}
     */
    const lineCache = []
    /**
     * A function of callbacks to defer DOM manipulation while asynchronously
     * reading text from the Blob. This way, the lines don't have a weird
     * scanning effect.
     * @type {(function(): void)[]}
     */
    const domManipulations = []
    for (let i = 0; i < rows; i++) {
      const row = startRow + i
      if (
        row >= prevStartRow &&
        row < Math.min(prevStartRow + rows, prevRowCount)
      ) {
        const rowOffset = startRow > prevStartRow ? 0 : startRow - prevStartRow
        newRowElems[i] = oldRowElems[i + rowOffset]
      } else {
        newRowElems[i] = recyclableRowElems.pop()
        domManipulations.push(() => {
          newRowElems[i].textContent = ''
          if (row < prevStartRow && oldRowElems[0]) {
            oldRowElems[0].before(newRowElems[i])
          } else {
            elems.lines.append(newRowElems[i])
          }
        })
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
          domManipulations.push(() => {
            renderRow(
              newRowElems[i],
              lineCache[row],
              lineCache[row - 1],
              lineCache[row + 1]
            )
          })
        }
      }
      domManipulations.push(() => {
        newRowElems[i].style.top = i + 'em'
      })
      if (abortRequests > 0) {
        abortRequests--
        return true
      }
    }

    // Synchronously apply DOM changes all at once
    for (const change of domManipulations) {
      change()
    }
    setScrollbar(startRow)

    rowElems = newRowElems
    prevStartRow = startRow
    prevRowCount = rowIndices.length - 1

    return false
  }

  /**
   * @param {number} startRow
   */
  function setView (startRow) {
    const promise = _setView(startRow).then(aborted => {
      // Don't reset `running` to `null` if `setView` was aborted because
      // `running` was probably set to a different promise.
      if (!aborted) {
        running = null
      }
    })
    // I think it's fine that `running` gets set to something else
    running = promise
    return promise
  }

  let currentRow = 0
  function setCurrentRow (row) {
    if (row < 0) {
      currentRow = 0
    } else if (row >= rowIndices.length) {
      currentRow = rowIndices.length - 1
    } else {
      currentRow = row
    }
    setScrollbar(currentRow)
    setView(currentRow)
  }

  document.addEventListener('keydown', event => {
    if (!event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
      if (event.key === 'ArrowUp') {
        setCurrentRow(currentRow - 1)
      } else if (event.key === 'ArrowDown') {
        setCurrentRow(currentRow + 1)
      } else if (event.key === 'PageUp') {
        setCurrentRow(currentRow - rows + 1)
      } else if (event.key === 'PageDown') {
        setCurrentRow(currentRow + rows - 1)
      }
    }
  })
  let remainder = 0
  document.addEventListener('wheel', event => {
    // Note: Pinch-to-zoom is stored in deltaY but with ctrlKey=true
    if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
      return
    }
    const deltaRow = Math.trunc((event.deltaY + remainder) / charHeight)
    // Keeping the remainder allows for smooth trackpad scrolling.
    // Implementation is not great because scrolling up a line requires you to
    // scroll an entire line the other way to return to the previous line.
    remainder = (event.deltaY + remainder) % charHeight
    setCurrentRow(currentRow + deltaRow)
  })
  /**
   * @typedef {object} DragState
   * @property {number} pointerId
   * @property {number} offsetY
   * @property {{ top: number, height: number }} parentRect
   * @property {{ top: number, height: number }} barRect
   */
  /**
   * Whether the user is currently dragging the scrollbar.
   * @type {DragState | null}
   */
  let dragging = null
  elems.scrollbar.parentElement.addEventListener('pointerdown', event => {
    if (!dragging) {
      const inGutter = !elems.scrollbar.contains(
        /** @type {Node} */ (event.target)
      )
      const parentRect = elems.scrollbar.parentElement.getBoundingClientRect()
      const barRectReadonly = elems.scrollbar.getBoundingClientRect()
      const barRect = {
        top: barRectReadonly.top,
        height: barRectReadonly.height
      }
      if (inGutter) {
        // Simulate dragging the bar directly to the mouse cursor
        barRect.top = event.clientY - barRect.height / 2
        if (barRect.top < 0) {
          barRect.top = 0
        } else if (barRect.top + barRect.height > parentRect.bottom) {
          barRect.top = parentRect.bottom - barRect.height
        }
      }
      dragging = {
        pointerId: event.pointerId,
        offsetY: event.clientY - barRect.top,
        parentRect,
        barRect
      }
      elems.scrollbar.setPointerCapture(event.pointerId)
      if (inGutter) {
        setCurrentRow(
          Math.floor(
            ((event.clientY - dragging.offsetY) /
              (parentRect.height - barRect.height)) *
              rowIndices.length
          )
        )
      }
    }
  })
  elems.scrollbar.addEventListener('pointermove', event => {
    if (dragging && dragging.pointerId === event.pointerId) {
      setCurrentRow(
        Math.floor(
          ((event.clientY - dragging.offsetY) /
            (dragging.parentRect.height - dragging.barRect.height)) *
            rowIndices.length
        )
      )
    }
  })
  /** @param {PointerEvent} event */
  const handlePointerEnd = event => {
    if (dragging && dragging.pointerId === event.pointerId) {
      dragging = null
    }
  }
  elems.scrollbar.addEventListener('pointerup', handlePointerEnd)
  elems.scrollbar.addEventListener('pointercancel', handlePointerEnd)

  setView(currentRow)
  const lineIndices = await analyse(blob.stream(), columns, async indices => {
    for (const index of indices) {
      rowIndices.push(index)
    }
    // setView(rowIndices.length - rows - 1)
    await setView(currentRow)
  })
  rowIndices.push(blob.size)
  setView(currentRow)
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
