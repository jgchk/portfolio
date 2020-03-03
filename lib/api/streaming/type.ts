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

export type SearchType = 'album' | 'track'
export function isSearchType(str: string): str is SearchType {
  return str === 'album' || str === 'track'
}

export interface Searchable {
  search(
    title: string,
    artist: string,
    type: SearchType,
    limit?: number
  ): Promise<Array<Release>>
}

export function isSearchable(api: Api): api is Api & Searchable {
  return 'search' in api
}

export interface Resolvable {
  test(url: string): boolean
  resolve(url: string): Promise<Release>
}

export function isResolvable(api: Api): api is Api & Resolvable {
  return 'test' in api && 'resolve' in api
}
