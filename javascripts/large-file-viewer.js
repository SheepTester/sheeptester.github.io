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
  )),
  lineNumber: /** @type {HTMLInputElement} */ (document.getElementById(
    'line-number'
  )),
  cursor: /** @type {HTMLDivElement} */ (document.getElementById('cursor')),
  selectionStart: /** @type {HTMLDivElement} */ (document.getElementById(
    'selection-start'
  )),
  searchQuery: /** @type {HTMLInputElement} */ (document.getElementById(
    'search-query'
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
 * @template T
 * @param {ReadableStream<T>} stream
 * @returns {AsyncIterable<T>}
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
 * Find the index of the first item of `array` for which `test` returns true.
 * Returns the length of `array` if no items pass the test. Will not check items
 * with indices less than `after` (default 0).
 * @template T
 * @param {T[]} array
 * @param {function(T, number): boolean} test
 * @param {number} after
 * @returns {number}
 */
function findIndex (array, test, after = 0) {
  if (after < 0) {
    after = 0
  }
  for (let i = after; i < array.length; i++) {
    if (test(array[i], i)) {
      return i
    }
  }
  return array.length
}

/**
 * @typedef {object} Row
 * @property {number} byteIndex - Byte index of the first character in the row
 * @property {number} charIndex - Number of characters *before* the row.
 */

/**
 * @typedef {object} Line
 * @property {number} index - Byte index of the first character in the line.
 * @property {number} chars - Number of characters in the line.
 * @property {Row[]} rows
 */

/**
 * @param {Line[]} lineIndices - 0-indexed, so line 1's byte index is at index 0
 * of the array.
 * @param {number[]} rowIndices
 * @param {ReadableStream<Uint8Array>} stream
 * @param {number} columns - The number of columns/characters per line. the
 * newly found row indices.
 */
async function * _analyse (lineIndices, rowIndices, stream, columns) {
  /** Keep track of position in column. */
  let column = 0
  /** Keep track of nth byte in a byte sequence. */
  let sequenceState = 0
  /** Keep track of accumulative byte index in the stream. */
  let index = 0
  for await (const bytes of read(stream)) {
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
      const lastLine = lineIndices[lineIndices.length - 1]
      // I believe at this point there's either the start of a multi-byte
      // sequence, an ASCII character, or some invalid byte (which will be
      // replaced with U+FFFD).
      if (column >= columns) {
        column = 0

        lastLine.rows.push({ charIndex: lastLine.chars, byteIndex: i + index })
        rowIndices.push(i + index)
      }
      lastLine.chars++
      // Check for newline character for a new line.
      if (bytes[i] === 0x0a) {
        column = 0
        lineIndices.push({
          index: i + index + 1,
          chars: 0,
          rows: [{ charIndex: 0, byteIndex: i + index + 1 }]
        })
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
    yield
    await new Promise(window.requestAnimationFrame)
  }
  // If `sequenceState` > 0, then each byte in the byte sequence at the end of
  // the file apparently becomes U+FFFD. Whatever.

  // `index` should be the Blob size here.
  rowIndices.push(index)

  // Delete last line if empty. (If the file ends with a newline, that'll be
  // shown at the end of the previous line.)
  const lastLine = lineIndices[lineIndices.length - 1]
  if (lastLine.chars === 0) {
    lineIndices.splice(-1, 1)
  }
}

/**
 * @typedef {object} Analysis
 * @property {Line[]} lineIndices
 * @property {number[]} rowIndices
 * @property {AsyncGenerator<void>} generator
 */

/**
 * @param {ReadableStream<Uint8Array>} stream
 * @param {number} columns - The number of columns/characters per line. the
 * newly found row indices.
 * @returns {Analysis}
 */
function analyse (stream, columns) {
  const lineIndices = [
    { index: 0, chars: 0, rows: [{ byteIndex: 0, charIndex: 0 }] }
  ]
  const rowIndices = [0]
  return {
    lineIndices,
    rowIndices,
    generator: _analyse(lineIndices, rowIndices, stream, columns)
  }
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

/**
 *
 * @param {ReadableStream<Uint8Array>} byteStream
 * @param {RegExp} query
 */
async function searchStream (byteStream, query) {
  const stream = byteStream.pipeThrough(new TextDecoderStream())
  for await (const chunk of read(stream)) {
    console.log(chunk.length)
  }
}

const decoder = new TextDecoder()

const highlightRegex = /[ \n]+|\t|-?(?:\d*\.\d+|\d+\.?)|[$_\p{ID_Start}-][$_\p{ID_Continue}-]*/gu

/**
 * @typedef {object} Cursor
 * @property {number} line
 * @property {number} column
 */

/**
 * Hack because TypeScript's type definition for `Blob` in dom.d.ts conflicts
 * with that in consumers.d.ts because their `stream` methods return different
 * and incompatible `ReadableStream`s >_<.
 * @typedef {object} IBlob
 * @property {function(): ReadableStream<Uint8Array>} stream
 * @property {function(number, number): Blob} slice
 */

/**
 * @param {IBlob} blob
 */
async function onBlob (blob) {
  document.body.classList.remove('show-view-select-source')
  document.body.classList.add('show-view-viewer')

  // Wait for fonts to load (fonts will affect getSize)
  // https://stackoverflow.com/a/32292880
  await document['fonts'].ready

  const { rows, columns, charHeight } = getSize()
  let rowElems = Array.from({ length: rows }, () =>
    Object.assign(document.createElement('span'), { className: 'line' })
  )
  const { lineIndices, rowIndices, generator } = analyse(blob.stream(), columns)

  /** @type {Cursor} */
  let cursor = { line: 0, column: 0 }
  /**
   * Base position for selection
   * @type {Cursor | null}
   */
  let base = null

  /**
   * @param {HTMLSpanElement} rowElem - Should be empty.
   * @param {string} line
   */
  function renderRow (rowElem, line, prevLine = '', nextLine = '') {
    rowElem.dataset.content = line.replace('\n', '¬')
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
      renderLineCol()
      return false
    }
    let lastLineNum = 0
    let lastRowIndex = 0
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
    const baseIndex = startRow > 0 ? rowIndices[startRow - 1] : 0
    const buffer = await blob
      .slice(baseIndex, rowIndices[startRow + rows])
      .arrayBuffer()
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
                ? decoder.decode(
                    buffer.slice(
                      rowIndices[row - 1] - baseIndex,
                      rowIndices[row] - baseIndex
                    )
                  )
                : ''
          }
          if (lineCache[row] === undefined) {
            // Current line
            lineCache[row] = decoder.decode(
              buffer.slice(
                rowIndices[row] - baseIndex,
                rowIndices[row + 1] - baseIndex
              )
            )
          }
          if (lineCache[row + 1] === undefined) {
            // Next line
            lineCache[row + 1] =
              row < rowIndices.length - 2
                ? decoder.decode(
                    buffer.slice(
                      rowIndices[row + 1] - baseIndex,
                      rowIndices[row + 2] - baseIndex
                    )
                  )
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
      const lineNum = findIndex(
        lineIndices,
        ({ index }) => rowIndices[row] < index,
        lastLineNum - 1
      )
      const lineNumDisplay = lineNum !== lastLineNum ? lineNum.toString() : ''
      if (lineNum !== lastLineNum) {
        lastRowIndex = 0
      }
      const nthRowInLine = findIndex(
        lineIndices[lineNum - 1].rows,
        lineRow => lineRow.byteIndex === rowIndices[row],
        lastRowIndex
      )
      const isFirstRow = nthRowInLine === 0
      lastLineNum = lineNum
      domManipulations.push(() => {
        newRowElems[i].style.top = i + 'em'
        newRowElems[i].dataset.line = lineNumDisplay
        if (isFirstRow) {
          newRowElems[i].classList.remove('wrapped-row')
        } else {
          newRowElems[i].classList.add('wrapped-row')
        }
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

    rowElems = newRowElems
    prevStartRow = startRow
    prevRowCount = rowIndices.length - 1

    setScrollbar(startRow)
    renderLineCol()

    return false
  }

  /**
   * @param {Cursor} cursor
   * @returns {{ lineRow: Row, cursorRow: number }}
   */
  function getRowOfCursor (cursor) {
    const { rows: lineRows } = lineIndices[cursor.line]
    const lineRow =
      lineRows[
        findIndex(lineRows, lineRow => cursor.column < lineRow.charIndex) - 1
      ]
    return {
      lineRow,
      cursorRow: rowIndices.indexOf(lineRow.byteIndex)
    }
  }

  function renderLineCol () {
    // Remember, `cursor` is 0-indexed, not 1-indexed
    if (base) {
      // Show selection
      const [start, end] = (cursor.line === base.line
      ? cursor.column < base.column
      : cursor.line < base.line)
        ? [cursor, base]
        : [base, cursor]
      const startRow = getRowOfCursor(start)
      const endRow = getRowOfCursor(end)
      for (let i = 0; i < rows; i++) {
        const row = prevStartRow + i
        if (row >= startRow.cursorRow + 1 && row <= endRow.cursorRow) {
          rowElems[i].classList.add('highlighted')
          if (row === endRow.cursorRow) {
            rowElems[i].dataset.highlighted = [...rowElems[i].dataset.content]
              .slice(0, end.column - endRow.lineRow.charIndex + 1)
              .join('')
          } else {
            delete rowElems[i].dataset.highlighted
          }
        } else {
          rowElems[i].classList.remove('highlighted')
        }
      }
      if (
        startRow.cursorRow >= prevStartRow &&
        startRow.cursorRow < prevStartRow + rows
      ) {
        const text = [
          ...rowElems[startRow.cursorRow - prevStartRow].dataset.content
        ]
        const charIndex = start.column - startRow.lineRow.charIndex
        const endCharIndex =
          startRow.cursorRow === endRow.cursorRow
            ? end.column - endRow.lineRow.charIndex + 1
            : text.length
        elems.selectionStart.style.top =
          startRow.cursorRow - prevStartRow + 'em'
        elems.selectionStart.textContent = text.slice(0, charIndex).join('')
        elems.selectionStart.dataset.content = text
          .slice(charIndex, endCharIndex)
          .join('')
      }
    } else {
      // Show cursor
      const { lineRow, cursorRow } = getRowOfCursor(cursor)
      if (cursorRow >= prevStartRow && cursorRow < prevStartRow + rows) {
        const text = [
          ...(rowElems[cursorRow - prevStartRow].dataset.content ?? '')
        ]
        const charIndex = cursor.column - lineRow.charIndex
        elems.cursor.textContent = text.slice(0, charIndex).join('')
        elems.cursor.dataset.char = text[charIndex]
        elems.cursor.style.top = cursorRow - prevStartRow + 'em'
        elems.cursor.style.display = null
      } else {
        elems.cursor.style.display = 'none'
      }
    }
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
  /**
   * Sets the currentRow, clamping it if it is out of bounds, and re-renders the
   * view.
   * @param {number} row
   */
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

  const SCROLL_PADDING = 2 // In rows
  function scrollToCursorIfNeeded (forceRerender = false) {
    const { cursorRow } = getRowOfCursor(cursor)
    if (cursorRow < currentRow - SCROLL_PADDING) {
      setCurrentRow(cursorRow - SCROLL_PADDING)
    } else if (cursorRow >= currentRow + rows - SCROLL_PADDING - 1) {
      setCurrentRow(cursorRow - rows + SCROLL_PADDING + 1)
    } else if (forceRerender) {
      renderLineCol()
    }
  }

  async function getSelection () {
    if (base) {
      const [start, end] = (cursor.line === base.line
      ? cursor.column < base.column
      : cursor.line < base.line)
        ? [cursor, base]
        : [base, cursor]

      const { rows: startLineRows } = lineIndices[start.line]
      const startLineRow =
        startLineRows[
          findIndex(
            startLineRows,
            lineRow => start.column < lineRow.charIndex
          ) - 1
        ]
      let charsAtBeginningOfRowToRemove =
        start.column - (startLineRow.charIndex - startLineRows[0].charIndex)
      const { rows: endLineRows, chars } = lineIndices[end.line]
      const afterEndLineRowIndex = findIndex(
        endLineRows,
        lineRow => end.column < lineRow.charIndex
      )
      let charsAtEndOfRowToRemove =
        (afterEndLineRowIndex < endLineRows.length
          ? endLineRows[afterEndLineRowIndex].charIndex -
            endLineRows[0].charIndex
          : chars) -
        1 -
        end.column

      const lines = await blob
        .slice(
          startLineRow.byteIndex,
          endLineRows[afterEndLineRowIndex]?.byteIndex ??
            lineIndices[end.line + 1]?.index
        )
        .text()
      for (let i = 0; i < charsAtBeginningOfRowToRemove; i++) {
        const utf16Value = lines.charCodeAt(i)
        if (utf16Value >= 0xd800 && utf16Value <= 0xdbff) {
          charsAtBeginningOfRowToRemove++
          i++
        }
      }
      for (let i = 0; i < charsAtEndOfRowToRemove; i++) {
        const utf16Value = lines.charCodeAt(lines.length - 1 - i)
        if (utf16Value >= 0xdc00 && utf16Value <= 0xdfff) {
          charsAtEndOfRowToRemove++
          i++
        }
      }
      return lines.slice(
        charsAtBeginningOfRowToRemove,
        charsAtEndOfRowToRemove === 0 ? undefined : -charsAtEndOfRowToRemove
      )
    } else {
      // Copy line that cursor is on
      return await blob
        .slice(
          lineIndices[cursor.line].index,
          lineIndices[cursor.line + 1]?.index
        )
        .text()
    }
  }

  /** @type {'normal' | 'visual'} */
  let mode = 'normal'
  /**
   * `null` if not previewing the line for go to.
   * @type {number | null}
   */
  let originalRow = null
  let searching = false
  const actions = {
    g: () => {
      if (!searching && originalRow === null) {
        originalRow = currentRow
        elems.lineNumber.value = `${cursor.line + 1}:${cursor.column + 1}`
        document.body.classList.add('show-go-to-line')
        elems.lineNumber.focus()
        elems.lineNumber.select()
      }
    },
    G: () => {
      cursor.line = lineIndices.length - 1
      cursor.column = lineIndices[cursor.line].chars - 1
      scrollToCursorIfNeeded(true)
    },
    '/': async () => {
      if (!searching && originalRow === null) {
        searching = true
        elems.searchQuery.value = base ? await getSelection() : ''
        document.body.classList.add('show-search')
        elems.searchQuery.focus()
        elems.searchQuery.select()
      }
    },
    v: () => {
      if (mode === 'normal') {
        mode = 'visual'
        document.body.classList.replace('show-normal-mode', 'show-visual-mode')
        base = { ...cursor }
        renderLineCol()
      }
    },

    Escape: () => {
      if (originalRow !== null) {
        setCurrentRow(originalRow)
        originalRow = null
        document.body.classList.remove('show-go-to-line')
      } else if (searching) {
        searching = false
        document.body.classList.remove('show-search')
      } else if (mode === 'visual') {
        mode = 'normal'
        document.body.classList.replace('show-visual-mode', 'show-normal-mode')
        base = null
        renderLineCol()
      }
    },
    y: async () => {
      await navigator.clipboard.writeText(await getSelection())
    },

    Enter: () => {
      if (originalRow === null) return
      const [lineInput, colInput] = elems.lineNumber.value.split(':')
      const line = +lineInput - 1
      const col = +colInput - 1
      if (lineIndices[line]) {
        cursor = {
          line,
          column:
            Number.isInteger(col) && col >= 0 && col < lineIndices[line].chars
              ? col
              : 0
        }
        scrollToCursorIfNeeded(true)
      } else {
        setCurrentRow(originalRow)
      }
      originalRow = null // TODO
      document.body.classList.remove('show-go-to-line')
    }
  }
  document.body.addEventListener('click', event => {
    const button =
      event.target instanceof HTMLElement && event.target.closest('.button')
    if (button instanceof HTMLElement) {
      actions[button.dataset.key]()
    }
  })
  document.addEventListener('keydown', event => {
    if (!event.ctrlKey && !event.altKey && !event.metaKey) {
      if (
        event.key !== 'Escape' &&
        event.key !== 'Enter' &&
        event.target instanceof HTMLElement &&
        (event.target.tagName === 'INPUT' ||
          event.target.tagName === 'TEXTAREA' ||
          event.target.tagName === 'SELECT')
      ) {
        return
      }
      if (!event.shiftKey) {
        if (event.key === 'PageUp') {
          setCurrentRow(currentRow - rows + 1)
        } else if (event.key === 'PageDown') {
          setCurrentRow(currentRow + rows - 1)
        } else if (event.key === 'Home') {
          setCurrentRow(0)
        } else if (event.key === 'End') {
          setCurrentRow(rowIndices.length - rows - 1)
        } else if (event.key === 'ArrowUp') {
          if (cursor.line > 0) {
            cursor.line--
            if (cursor.column >= lineIndices[cursor.line].chars) {
              cursor.column = lineIndices[cursor.line].chars - 1
            }
          }
          scrollToCursorIfNeeded(true)
        } else if (event.key === 'ArrowDown') {
          if (cursor.line < lineIndices.length - 1) {
            cursor.line++
            if (cursor.column >= lineIndices[cursor.line].chars) {
              cursor.column = lineIndices[cursor.line].chars - 1
            }
          }
          scrollToCursorIfNeeded(true)
        } else if (event.key === 'ArrowLeft') {
          if (cursor.column === 0) {
            if (cursor.line > 0) {
              cursor.line--
              cursor.column = lineIndices[cursor.line].chars - 1
            }
          } else {
            cursor.column--
          }
          scrollToCursorIfNeeded(true)
        } else if (event.key === 'ArrowRight') {
          cursor.column++
          if (cursor.column >= lineIndices[cursor.line].chars) {
            if (cursor.line < lineIndices.length - 1) {
              cursor.line++
              cursor.column = 0
            } else {
              cursor.column--
            }
          }
          scrollToCursorIfNeeded(true)
        }
      }
      if (actions[event.key]) {
        actions[event.key]()
        event.preventDefault()
      }
    }
  })
  elems.lineNumber.addEventListener('input', () => {
    const typedLine = parseInt(elems.lineNumber.value) - 1
    if (lineIndices[typedLine]) {
      // Preview typed line
      setCurrentRow(
        rowIndices.indexOf(lineIndices[typedLine].index) - Math.floor(rows / 2)
      )
    } else {
      setCurrentRow(originalRow)
    }
  })
  // Could maybe instead use the `selectionchange` event on document
  elems.lines.addEventListener('click', () => {
    const selection = document.getSelection()
    if (!selection?.isCollapsed) return
    const { focusNode: node, focusOffset: offset } = selection
    const nodeElem = node instanceof Element ? node : node?.parentElement
    if (!nodeElem) return
    const rowElem = nodeElem.closest('.line')
    if (!(rowElem instanceof HTMLSpanElement) || !rowElems.includes(rowElem)) {
      return
    }
    const row = rowElems.indexOf(rowElem) + prevStartRow
    const lineNum =
      findIndex(lineIndices, line => line.index > rowIndices[row]) - 1
    const lineRow = lineIndices[lineNum].rows.find(
      lineRow => lineRow.byteIndex === rowIndices[row]
    )
    /**
     * Number of UTF-16 values in the elements before `focusNode` in the row.
     */
    let charOffset = 0
    for (const child of rowElem.childNodes) {
      if (child === node) break
      if (child instanceof Element) {
        if (child.contains(node)) break
        charOffset += child.textContent.length
      } else if (child.nodeValue) {
        charOffset += child.nodeValue.length
      }
    }
    const columnUtf16 = charOffset + offset
    let highSurrogates = 0
    for (let i = 0; i < columnUtf16; i++) {
      const code = rowElem.dataset.content.charCodeAt(i)
      if (code >= 0xd800 && code <= 0xdbff) {
        highSurrogates++
      }
    }
    cursor = {
      line: lineNum,
      column: Math.min(
        lineRow.charIndex + columnUtf16 - highSurrogates,
        lineIndices[lineNum].chars - 1
      )
    }
    renderLineCol()
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
  for await (const _ of generator) {
    await setView(currentRow)
  }
  setView(currentRow)
}

elems.file.addEventListener('change', () => {
  if (elems.file.files[0]) {
    onBlob(elems.file.files[0])
  }
})

/**
 * @param {string} url
 * @returns {Promise<boolean>}
 */
async function loadFromUrl (url) {
  elems.selectSource.disabled = true
  document.body.classList.remove('show-cors-error', 'show-offline-error')
  try {
    const response = await fetch(url)
    onBlob(await response.blob())
    if (url !== paramUrl) {
      window.history.pushState({}, '', '?' + new URLSearchParams({ url }))
    }
    return true
  } catch {
    const isCors = await fetch(url, { mode: 'no-cors' })
      .then(() => true)
      .catch(() => false)
    document.body.classList.add(
      isCors ? 'show-cors-error' : 'show-offline-error'
    )
    return false
  } finally {
    elems.selectSource.disabled = false
  }
}

elems.byUrl.addEventListener('submit', async event => {
  event.preventDefault()

  await loadFromUrl(elems.url.value)
})

const params = new URL(window.location.href).searchParams
const paramUrl = params.get('url')
if (paramUrl) {
  document.body.classList.remove('show-view-select-source')
  loadFromUrl(paramUrl).then(success => {
    if (!success) {
      elems.url.value = paramUrl
      document.body.classList.add('show-view-select-source')
      params.delete('url')
      window.history.replaceState({}, '', window.location.pathname)
    }
  })
}
