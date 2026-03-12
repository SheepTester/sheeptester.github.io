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
  const journals = parse(rawJournals)
  const journalsMap = new Map(
    journals.map(({ date, segments }): [string, Segment[]] => [
      date.toString(),
      segments
    ])
  )
  const minDate =
    Temporal.PlainDate.compare(news[0].date, journals[0].date) < 0
      ? news[0].date
      : journals[0].date
  const maxDate =
    Temporal.PlainDate.compare(
      news[news.length - 1].date,
      journals[journals.length - 1].date
    ) > 0
      ? news[news.length - 1].date
      : journals[journals.length - 1].date
  const entries = []
  for (
    let date = minDate;
    Temporal.PlainDate.compare(date, maxDate) <= 0;
    date = date.add({ days: 1 })
  ) {
    const dateStr = date.toString()
    const news = newsMap.get(dateStr)
    const journal = journalsMap.get(dateStr)
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
          {news ? (
            <p>
              <em>Meanwhile</em>: <Segments segments={news} />
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
function parse (rawData: Record<string, string | null>): Entry[] {
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
  return parsed.filter(
    ({ date }, i) => i > 0 && !date.equals(parsed[i - 1].date)
  )
}
