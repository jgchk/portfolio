declare module 'bandcamp-scraper' {
  export function search(params: SearchParams, cb: SearchCallback): void

  export interface SearchParams {
    query: string
    page?: number = 1
  }

  export interface SearchCallback {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error: Error, searchResults: Array<SearchResult>): any
  }

  export type SearchResult =
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
    type: 'label'
    name: string
    url: string
    imageUrl: string
    tags: string[]
  }

  export function getAlbumsWithTag(params: TagParams, cb: TagCallback): void

  export interface TagParams {
    tag: string
    page: number = 1
  }

  export interface TagCallback {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error: Error, tagResults: TagResults): any
  }

  export type TagResults = Array<TagResult>

  export interface TagResult {
    name: string
    artist: string
    url: string
  }

  export function getAlbumUrls(artistUrl: string, callback: UrlsCallback): void

  export interface UrlsCallback {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error: Error, tagResults: UrlsResults): any
  }

  export type UrlsResults = Array<string>

  export function getAlbumInfo(albumUrl: string, cb: AlbumInfoCallback): void

  export interface AlbumInfoCallback {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error: Error, albumInfo: AlbumInfo): any
  }

  export interface AlbumInfo {
    artist: string
    title: string
    url: string
    imageUrl: string
    tracks: TrackInfo[]
    raw: {
      current: {
        release_date: string
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [k: string]: any
      }
      album_release_date: string
      trackinfo: Array<{
        title: string
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [k: string]: any
      }>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [k: string]: any
    }
  }

  export interface TrackInfo {
    name: string
    url?: string
    duration?: string
  }

  export function getAlbumProducts(
    albumUrl: string,
    cb: AlbumProductsCallback
  ): void

  export interface AlbumProductsCallback {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error: Error, albumProducts: AlbumProducts): any
  }

  export type AlbumProducts = Array<AlbumProduct>

  export interface AlbumProduct {
    name: string
    artist: string
    format: string
    url: string
    imageUrls: string[]
    priceInCents?: number
    description: string
    soldOut: boolean
    nameYourPrice: boolean
    offerMore: boolean
    currency?: string
  }
}
