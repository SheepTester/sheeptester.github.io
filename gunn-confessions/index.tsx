import React, {
  createElement,
  Fragment,
  memo,
  MouseEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState
} from 'react'
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

const LinkIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    aria-label='Link to confession'
  >
    <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
    <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
  </svg>
)

const SearchIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    aria-label='Search'
  >
    <circle cx='11' cy='11' r='8' />
    <line x1='21' y1='21' x2='16.65' y2='16.65' />
  </svg>
)

type Confession = { id: number; confession: string }
type SearchResult = {
  id: number
  confession: { before: string; match: string; after: string }
}

type ConfessionTextProps = {
  confession: string
}
function ConfessionText ({ confession }: ConfessionTextProps) {
  const pieces: ReactNode[] = []
  let lastIndex = 0
  for (const match of confession.matchAll(/@(\d+)\b|https?:\/\/[\w-./]+…?/g)) {
    pieces.push(confession.slice(lastIndex, match.index))
    if (match[0].startsWith('@')) {
      pieces.push(<a href={`./#c${match[1]}`}>{match[0]}</a>)
    } else if (match[0].endsWith('…')) {
      pieces.push(match[0])
    } else {
      pieces.push(<a href={match[0]}>{match[0]}</a>)
    }
    lastIndex = match.index + match[0].length
  }
  pieces.push(confession.slice(lastIndex))
  return createElement(Fragment, null, ...pieces)
}

type ConfessionsProps = {
  confessions: (Confession | SearchResult)[]
}
const Confessions = memo(({ confessions }: ConfessionsProps) => {
  return (
    <div className='confessions'>
      {confessions.map(({ confession, id }) => {
        const path = `./#c${id}`
        return (
          <article className='confession' key={id} id={`c${id}`}>
            <p className='confession-text'>
              {typeof confession === 'string' ? (
                confession ? (
                  <ConfessionText confession={confession} />
                ) : (
                  <em className='not-available'>
                    Confession {id} not available.
                  </em>
                )
              ) : (
                <>
                  {confession.before}
                  <span className='match'>{confession.match}</span>
                  {confession.after}
                </>
              )}
            </p>
            <a
              className='copy-link'
              href={path}
              onClick={async e => {
                e.preventDefault()
                await navigator.clipboard.writeText(
                  new URL(path, window.location.href).toString()
                )
              }}
            >
              <LinkIcon />
            </a>
          </article>
        )
      })}
    </div>
  )
})

const PAGE_SIZE = 1000
const RESULT_PAGE_SIZE = 100

const searchWorker = new Worker('./search.js')

type AppProps = {
  startPage?: number
}
function App ({ startPage = 0 }: AppProps) {
  const [confessions, setConfessions] = useState<Confession[]>([])
  const [page, setPage] = useState(startPage)
  const [searchPage, setSearchPage] = useState(1)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    caches
      .open('sunset-cache')
      .then(cache =>
        cache.match(SHEET_URL).then(async r => {
          if (r) {
            return r
          }
          const response = await fetch(SHEET_URL)
          cache.put(SHEET_URL, response.clone())
          return response
        })
      )
      .catch(error => {
        console.warn('Cache error', error)
        return fetch(SHEET_URL)
      })
      .then(r => r.text())
      .then(parseCsv)
      .then(rows => rows.map((confession, id) => ({ id: id + 1, confession })))
      .then(setConfessions)
      .catch(error => {
        console.error(error)
        setConfessions([
          {
            id: 1,
            confession: `Unfortunately, the archive failed to load. Either you have limited internet access, or the archive has been taken down.`
          },
          { id: 2, confession: error.stack ?? error.message }
        ])
      })
  }, [])

  useEffect(() => {
    searchWorker.postMessage(confessions)
  }, [confessions])

  useEffect(() => {
    let target: HTMLElement | null = null
    const handleHashChange = () => {
      const confessionId = decodeURIComponent(window.location.hash.slice(1))
      if (!confessionId.startsWith('c')) {
        return
      }
      setPage(Math.floor((+confessionId.slice(1) - 1) / PAGE_SIZE))
      window.requestAnimationFrame(() => {
        target?.classList.remove('target')
        target = document.getElementById(confessionId)
        target?.scrollIntoView({ block: 'center' })
        target?.classList.add('target')
      })
    }
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [confessions])

  function changePage (page: number) {
    return (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()
      if (!e.currentTarget.href) {
        return
      }
      setPage(page)
      window.history.pushState({}, '', `?page=${page}`)
    }
  }

  useEffect(() => {
    document.title = `Gunn Confessions Archive (${page * PAGE_SIZE + 1}–${
      (page + 1) * PAGE_SIZE
    })`
  }, [page])

  useEffect(() => {
    const handlePopState = () => {
      const params = new URL(window.location.href).searchParams
      setPage(+(params.get('page') || 0) || 0)
    }
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const count = useMemo(
    () =>
      new Intl.NumberFormat('en-US').format(
        confessions.filter(({ confession }) => confession).length
      ),
    [confessions]
  )

  const nav = search ? (
    <nav className='nav'>
      <button
        onClick={() => setSearchPage(searchPage - 1)}
        disabled={searchPage <= 1}
      >
        Prev
      </button>
      {Array.from(
        { length: Math.ceil(results.length / RESULT_PAGE_SIZE) },
        (_, i) => {
          if (i + 1 === searchPage) {
            return <strong key={i}>{i + 1}</strong>
          }
          if (
            i < 2 ||
            i >= Math.ceil(results.length / RESULT_PAGE_SIZE) - 2 ||
            Math.abs(i + 1 - searchPage) <= 1
          ) {
            return (
              <button onClick={() => setSearchPage(i + 1)} key={i}>
                {i + 1}
              </button>
            )
          } else if (Math.abs(i + 1 - searchPage) <= 2) {
            return '…'
          }
        }
      )}
      <button
        onClick={() => setSearchPage(searchPage + 1)}
        disabled={searchPage >= Math.ceil(results.length / RESULT_PAGE_SIZE)}
      >
        Next
      </button>
    </nav>
  ) : (
    <nav className='nav'>
      <a
        href={page > 0 ? `?page=${page - 1}` : undefined}
        onClick={changePage(page - 1)}
      >
        Prev
      </a>
      {Array.from(
        { length: Math.ceil(confessions.length / PAGE_SIZE) },
        (_, i) =>
          i === page ? (
            <strong key={i}>{i}</strong>
          ) : (
            <a href={`?page=${i}`} onClick={changePage(i)} key={i}>
              {i}
            </a>
          )
      )}
      <a
        href={
          page < Math.ceil(confessions.length / PAGE_SIZE) - 1
            ? `?page=${page + 1}`
            : undefined
        }
        onClick={changePage(page + 1)}
      >
        Next
      </a>
    </nav>
  )

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const data: { search: string; results: SearchResult[] } = e.data
      if (data.search === search) {
        setResults(data.results)
      }
    }
    searchWorker.addEventListener('message', handleMessage)
    return () => {
      searchWorker.removeEventListener('message', handleMessage)
    }
  }, [search])

  const viewConfessions = useMemo(
    () => confessions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [confessions, page]
  )
  const viewResults = useMemo(
    () =>
      results.slice(
        (searchPage - 1) * RESULT_PAGE_SIZE,
        searchPage * RESULT_PAGE_SIZE
      ),
    [results, searchPage]
  )

  return (
    <>
      <div className='lead'>
        <h1>Gunn Confessions Archive</h1>
        <p>
          This is an archive of {count} confessions from the now-deleted
          Facebook page from 2019&ndash;2021.{' '}
          <a href='https://www.facebook.com/gunnconfessions/'>
            Gunn Confessions
          </a>{' '}
          was a Facebook page where anyone, typically Gunn High School students,
          could submit a &ldquo;confession&rdquo; anonymously(
          <a href='https://thecampanile.org/21052/news/student-who-made-alleged-shooting-threat-on-gunn-high-school-is-taken-into-custody/'>
            ish
          </a>
          ) to a Google Form. The submissions were manually reviewed by the page
          administrators (with additional context added in brackets) before
          being published to the page.
        </p>
        <p>
          This public archive was made in part because{' '}
          <a href='https://www.paloaltoonline.com/palo-alto-schools/2025/02/02/gunn-high-grad-part-of-musks-effort-to-control-federal-spending/'>
            Ethan Shaotran
          </a>{' '}
          (Gunn &lsquo;20) recently gained notoriety and is mentioned a few
          times here.
        </p>
        {/* <p>
          Content warnings: violence, suicide, mass shootings, bullying, ED,
          mentions of transphobia, depression, self-harm, cannabis, drug
          addiction.
        </p> */}
      </div>
      {nav}
      <label className='search'>
        <SearchIcon />
        <input
          type='search'
          name='search'
          placeholder='Search confessions...'
          value={search}
          onChange={e => {
            setSearch(e.currentTarget.value)
            setSearchPage(1)
            if (e.currentTarget.value) {
              searchWorker.postMessage(e.currentTarget.value)
            }
          }}
          className='search-box'
        />
      </label>
      <Confessions confessions={search ? viewResults : viewConfessions} />
      {confessions.length === 0 ? <p>Loading...</p> : null}
      {nav}
    </>
  )
}

const params = new URL(window.location.href).searchParams
createRoot(document.getElementById('root')!).render(
  <App startPage={+(params.get('page') || 0) || undefined} />
)
