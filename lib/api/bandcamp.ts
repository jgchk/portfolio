import Bandcamp from 'bandcamp-scraper'

interface AlbumInfo {
  artist: string
  title: string
  url: string
  imageUrl: string
  tracks: Track[]
  raw: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [k: string]: any
  }
}

interface Track {
  name: string
  url?: string
  duration?: string
}

type SearchResults = Array<SearchResult>

type SearchResult =
  | ArtistResult
  | AlbumResult
  | TrackResult
  | FanResult
  | LabelResult

interface ArtistResult {
  type: 'artist'
  name: string
  url: string
  imageUrl: string
  tags: string[]
  genre?: string
  location: string
}

interface AlbumResult {
  type: 'album'
  name: string
  url: string
  imageUrl: string
  tags: string[]
  releaseDate: string
  artist: string
  numTracks: number
  numMinutes: number
}

interface TrackResult {
  type: 'track'
  name: string
  url: string
  imageUrl: string
  tags: string[]
  releaseDate: string
  album: string
  artist: string
}

interface FanResult {
  type: 'fan'
  name: string
  url: string
  imageUrl: string
  tags: string[]
  genre: string
}

interface LabelResult {
  type: string
  name: string
  url: string
  imageUrl: string
  tags: string[]
}

export function album(url: string): Promise<AlbumInfo> {
  return new Promise((resolve, reject) => {
    Bandcamp.getAlbumInfo(url, (error: Error, albumInfo: AlbumInfo) => {
      if (error) {
        reject(error)
      } else {
        resolve(albumInfo)
      }
    })
  })
}

export function search(query: string): Promise<SearchResults> {
  return new Promise((resolve, reject) => {
    Bandcamp.search({ query }, (error: Error, searchResults: SearchResults) => {
      if (error) {
        reject(error)
      } else {
        resolve(searchResults)
      }
    })
  })
}
