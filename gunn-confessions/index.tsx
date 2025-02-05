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
        continue
      } else {
        quoted = true
        if (justSawQuote) {
          output[output.length - 1] += '"'
        }
      }
    } else if (c === '\n' && !quoted) {
      output.push('')
    } else if (c !== '\r') {
      output[output.length - 1] += c
    }
    justSawQuote = false
  }
  if (output.at(-1) === '') {
    output.splice(-1, 1)
  }
  return output
}

const PAGE_SIZE = 1000

type AppProps = {
  startPage?: number
}
function App ({ startPage = 0 }: AppProps) {
  const [confessions, setConfessions] = useState<string[]>([])
  const [page, setPage] = useState(startPage)

  useEffect(() => {
    fetch(SHEET_URL)
      .then(r => r.text())
      .then(parseCsv)
      .then(setConfessions)
  }, [])

  useEffect(() => {
    const target = document.getElementById(
      decodeURIComponent(window.location.hash.slice(1))
    )
    target?.scrollIntoView({ block: 'center' })
    target?.classList.add('target')
  }, [confessions])

  return (
    <>
      <div className='confessions'>
        {confessions
          .slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
          .map((confession, i) => {
            const confessionId = page * PAGE_SIZE + i + 1
            const path = `?page=${page}#c${confessionId}`
            return (
              <div className='confession' key={i} id={`c${confessionId}`}>
                <div className='confession-text'>
                  {confession || (
                    <em className='not-available'>
                      Confession {confessionId} not available.
                    </em>
                  )}
                </div>
                <a
                  href={path}
                  onClick={async e => {
                    e.preventDefault()
                    await navigator.clipboard.writeText(
                      new URL(path, window.location.href).toString()
                    )
                  }}
                >
                  link
                </a>
              </div>
            )
          })}
      </div>
    </>
  )
}

const params = new URL(window.location.href).searchParams
createRoot(document.getElementById('root')!).render(
  <App startPage={+(params.get('page') || 0) || undefined} />
)
