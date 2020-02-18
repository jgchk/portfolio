import YouTube from 'ytsr'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SearchResults = Record<string, any>

// eslint-disable-next-line import/prefer-default-export
export function search(query: string): Promise<SearchResults | Error> {
  return YouTube(query)
}
