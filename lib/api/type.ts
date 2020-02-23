export interface Api {
  name: string
}

export interface Release {
  title: string
  format?: string
  attributes?: Array<string>
  date?: Date
  link: string
  type?: string
  tracks?: Array<Track>
}

export interface Track {
  position: string
  title: string
  duration: string
}

export interface Searchable {
  search(title: string, artist: string, limit?: number): Promise<Array<Release>>
}

export function isSearchable(api: Api): api is Api & Searchable {
  return 'search' in api
}

export interface Resolvable {
  resolve(url: string): Promise<Release>
}
