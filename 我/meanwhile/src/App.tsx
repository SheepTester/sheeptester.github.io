import { Fragment, useMemo } from 'react'
import { Temporal } from 'temporal-polyfill'

export type AppProps = {
  rawJournals: Record<string, string>
  rawNews: Record<string, string | null>
}
export function App ({ rawJournals, rawNews }: AppProps) {
  const news = parse(rawNews)
  const newsMap = new Map(
    news.map(({ date, segments }): [string, Segment[]] => [
      date.toString(),
      segments
    ])
  )
  const minDate = news[0].date
  const maxDate = news[news.length - 1].date
  const entries = []
  for (
    let date = minDate;
    Temporal.PlainDate.compare(date, maxDate) <= 0;
    date = date.add({ days: 1 })
  ) {
    const dateStr = date.toString()
    const news = newsMap.get(dateStr)
    entries.push(
      <Fragment key={dateStr}>
        <dt id={dateStr} suppressHydrationWarning>
          {date.toLocaleString([], { dateStyle: 'long' })}
        </dt>
        <dd>
          {news ? (
            <p>
              {news.map((segment, i) => {
                switch (segment.type) {
                  case 'plain': {
                    return segment.content
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
            </p>
          ) : null}
        </dd>
      </Fragment>
    )
  }
  return <dl>{entries}</dl>
}

type Segment =
  | { type: 'plain' | 'italics' | 'code'; content: string }
  | { type: 'link'; url: string; content: string }
  | { type: 'rel-link'; date: Temporal.PlainDate; content: string }
type Entry = {
  date: Temporal.PlainDate
  segments: Segment[]
}
function parse (rawData: Record<string, string | null>): Entry[] {
  const parsed = Object.entries(rawData)
    .flatMap(([key, value]): Entry[] => {
      if (value === null) {
        return []
      }
      const match = key.match(/^\d{4}-\d{2}-\d{2}\b/)
      if (!match) {
        console.error(`'${key}' is not a date`)
        return []
      }
      return [{ date: Temporal.PlainDate.from(match[0]), segments: [] }]
    })
    .sort((a, b) => Temporal.PlainDate.compare(a.date, b.date))
  return parsed.filter(
    ({ date }, i) => i > 0 && !date.equals(parsed[i - 1].date)
  )
}
