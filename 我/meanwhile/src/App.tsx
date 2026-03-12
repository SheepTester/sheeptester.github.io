import { Fragment } from 'react'
import { Temporal } from 'temporal-polyfill'

// SP22 to Tesla start (inclusive)
const MIN_DATE = Temporal.PlainDate.from('2022-03-27')
const MAX_DATE = Temporal.PlainDate.from('2025-08-18')

export type AppProps = {
  rawJournals: Record<string, string>
  rawNews: Record<string, string | null>
}
export function App ({ rawJournals, rawNews }: AppProps) {
  const news = parse(rawNews)
  const journals = parse(rawJournals)
  const entries = []
  for (
    let date = MIN_DATE;
    Temporal.PlainDate.compare(date, MAX_DATE) <= 0;
    date = date.add({ days: 1 })
  ) {
    const dateStr = date.toString()
    const headline = news.get(dateStr)
    const journal = journals.get(dateStr)
    entries.push(
      <Fragment key={dateStr}>
        <dt id={dateStr} suppressHydrationWarning>
          {date.toLocaleString([], { dateStyle: 'full' })}
        </dt>
        <dd>
          {journal ? (
            <p>
              <Segments segments={journal} />
            </p>
          ) : null}
        </dd>
        <dd>
          {headline ? (
            <p>
              <em>Meanwhile</em>: <Segments segments={headline} />
            </p>
          ) : null}
        </dd>
      </Fragment>
    )
  }
  return (
    <>
      <h1>Meanwhile</h1>
      <p>(WIP)</p>
      <dl>{entries}</dl>
    </>
  )
}

type Segment =
  | { type: 'plain' | 'italics' | 'code'; content: string }
  | { type: 'link'; url: string; content: string }
  | { type: 'rel-link'; date: Temporal.PlainDate; content: string }
function Segments ({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((segment, i) => {
        switch (segment.type) {
          case 'plain': {
            return <Fragment key={i}>{segment.content}</Fragment>
          }
          case 'italics': {
            return <em key={i}>{segment.content}</em>
          }
          case 'code': {
            return <code key={i}>{segment.content}</code>
          }
          case 'link': {
            return (
              <a key={i} href={segment.url}>
                {segment.content}
              </a>
            )
          }
          case 'rel-link': {
            return (
              <a key={i} href={`#${segment.date.toString()}`}>
                {segment.content}
              </a>
            )
          }
        }
      })}
    </>
  )
}

type Entry = {
  date: Temporal.PlainDate
  segments: Segment[]
}
function parse (
  rawData: Record<string, string | null>
): Map<string, Segment[]> {
  const parsed = Object.entries(rawData)
    .flatMap(([key, value]): Entry[] => {
      if (value === null) {
        return []
      }
      const dateMatch = key.match(/^\d{4}-\d{2}-\d{2}\b/)
      if (!dateMatch) {
        console.error(`'${key}' is not a date`)
        return []
      }
      const segments: Segment[] = []
      const htmlRegex =
        /<em>([^<]+)<\/em>|<code>([^<]+)<\/code>|<a href="([^"]+)">([^<]+)<\/a>/g
      let lastIndex = 0
      for (const match of value.matchAll(htmlRegex)) {
        if (match.index > lastIndex) {
          segments.push({
            type: 'plain',
            content: value.slice(lastIndex, match.index)
          })
        }
        if (match[1]) {
          segments.push({ type: 'italics', content: match[1] })
        } else if (match[2]) {
          segments.push({ type: 'code', content: match[2] })
        } else if (match[3]) {
          if (match[3].startsWith('#TODO_LINK_TO_')) {
            segments.push({
              type: 'rel-link',
              date: Temporal.PlainDate.from(
                match[3].replace('#TODO_LINK_TO_', '')
              ),
              content: match[4]
            })
          } else {
            segments.push({ type: 'link', url: match[3], content: match[4] })
          }
        }
        lastIndex = match.index + match[0].length
      }
      if (lastIndex < value.length) {
        segments.push({ type: 'plain', content: value.slice(lastIndex) })
      }
      return [{ date: Temporal.PlainDate.from(dateMatch[0]), segments }]
    })
    .sort((a, b) => Temporal.PlainDate.compare(a.date, b.date))
  return new Map(
    parsed
      .filter(({ date }, i) => {
        const isDupe = i > 0 && date.equals(parsed[i - 1].date)
        if (isDupe) {
          console.error(`${date.toString()} is dupe`)
        }
        return !isDupe
      })
      .map(({ date, segments }) => [date.toString(), segments])
  )
}
