const elems = {
  selectSource: document.getElementById('select-source'),
  file: document.getElementById('file'),
  byUrl: document.getElementById('by-url'),
  url: document.getElementById('url'),
  lines: document.getElementById('lines')
}

/**
 * @param {ReadableStream<Uint8Array>} stream
 * @returns {AsyncIterable<Uint8Array>}
 */
function read (stream) {
  const reader = stream.getReader()
  return {
    [Symbol.asyncIterator]: () => ({
      next: () => reader.read()
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
 * @returns {Promise<Line[]>} Indices
 */
async function analyse (stream, columns) {
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
      column++
      if (column >= columns) {
        column = 0

        const lastLine = lineIndices[lineIndices.length - 1]
        lastLine.rowIndices.push(i + index)
      }
      // Check for newline character for a new line.
      if (bytes[i] === 0x0a) {
        column = 0
        lineIndices.push({ index: i + index + 1, rowIndices: [i + index + 1] })
      }
    }
    index += bytes.length
  }
  // If `sequenceState` > 0, then each byte in the byte sequence apparently
  // becomes U+FFFD. Whatever.
  return lineIndices
}
