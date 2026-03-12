export type AppProps = {
  rawJournals: Record<string, string>
  rawNews: Record<string, string>
}
export function App ({ rawJournals, rawNews }: AppProps) {
  console.log(rawJournals, rawNews)
  return <p>hello</p>
}
