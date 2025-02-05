import React, { useEffect, useState } from 'react'
import {} from 'react-dom'
import { createRoot } from 'react-dom/client'

const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTJMHCAsgqtErQGbQyXs_UObhWllWCdEbKAQ5U2_zzE1XGL5FgTaLbXMjrbUOVTR4uzZAMyfMGFmShY/pub?single=true&output=csv'

/** Only supports a single column */
function parseCsv (csv: string): string[] {
  const output = ['']
  let quoted = false
  let justSawQuote = false
  for (const c of csv) {
    if (c === '"') {
      if (quoted) {
        quoted = false
        justSawQuote = true
      } else {
        quoted = true
        if (justSawQuote) {
          justSawQuote = false
          output[output.length - 1] += '"'
        }
      }
    } else if (c === '\n' && !quoted) {
      output.push('')
    } else {
      output[output.length - 1] += c
    }
  }
  if (output.at(-1) === '') {
    output.splice(-1, 1)
  }
  return output
}

function App () {
  const [confessions, setConfessions] = useState<string[]>()

  useEffect(() => {
    fetch(SHEET_URL)
      .then(r => r.text())
      .then(parseCsv)
      .then(setConfessions)
  }, [])

  return null
}

createRoot(document.getElementById('root')!).render(<App />)
