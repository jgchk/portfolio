/* eslint-disable @typescript-eslint/no-explicit-any */
export type AuthResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

export interface ExternalUrls {
  spotify: string
}

export interface Image {
  height: number
  url: string
  width: number
}

export interface SimplifiedArtist {
  external_urls: ExternalUrls
  href: string
  id: string
  name: string
  type: string
  uri: string
}

export type AlbumType = 'album' | 'single' | 'compilation'

export interface SimplifiedAlbum {
  album_group?: string
  album_type: AlbumType
  artists: SimplifiedArtist[]
  available_markets: string[]
  external_urls: ExternalUrls
  href: string
  id: string
  images: Image[]
  name: string
  release_date: string
  release_date_precision: string
  restrictions: any
  type: string
  uri: string
}

export interface Paging<T> {
  href: string
  items: T[]
  limit: number
  next: string
  offset: number
  previous: string
  total: number
}

export interface SearchAlbumsResponse {
  albums: Paging<SimplifiedAlbum>
}

export interface SimplifiedTrack {
  artists: SimplifiedArtist[]
  available_markets: string[]
  disc_number: number
  duration_ms: number
  explicit: boolean
  external_urls: ExternalUrls
  href: string
  id: string
  name: string
  preview_url: string
  track_number: number
  type: string
  uri: string
}

export interface Copyright {
  text: string
  type: string
}

export interface ExternalIds {
  upc: string
}

export interface Album {
  album_type: AlbumType
  artists: SimplifiedArtist[]
  available_markets: string[]
  copyrights: Copyright[]
  external_ids: ExternalIds
  external_urls: ExternalUrls
  genres: any[]
  href: string
  id: string
  images: Image[]
  name: string
  popularity: number
  release_date: string
  release_date_precision: string
  tracks: Paging<SimplifiedTrack>
  type: string
  uri: string
}

export interface AlbumsResponse {
  albums: Album[]
}
