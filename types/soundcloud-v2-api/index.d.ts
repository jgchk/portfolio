// Type definitions for soundcloud-api-client 0.0.9
// Project: https://github.com/iammordaty/soundcloud-api-client
// Definitions by: Jake Cheek <https://jake.cafe/>

export class SoundCloud {
  config: Config

  init(config: Config)

  get(pathname: string, params?: GetOptions): Promise

  async download(pathname: string, filename: string): void

  request(pathname: string, options?: RequestOptions): Promise
}

export default new SoundCloud()

export interface Config {
  clientId: string
  hostname?: string
}

export interface GetOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any
}

export interface RequestOptions extends GetOptions {
  json: boolean
  encoding: string | null
}

export interface SearchResults {
  collection: (User | Playlist | Track)[]
  total_results: number
  next_href: string
  query_urn: string
}

export interface User {
  avatar_url: string
  id: number
  kind: 'user'
  permalink_url: string
  uri: string
  username: string
  permalink: string
  last_modified: string
}

export interface Playlist {
  kind: 'playlist'
  id: number
  created_at: string
  duration: number
  last_modified: string
  sharing: string
  tag_list: string
  permalink: string
  track_count: number
  streamable?: boolean
  embeddable_by: string
  description?: string
  genre: string
  release?: number
  label_name?: string
  title: string
  release_year?: number
  release_month?: number
  release_day?: number
  uri: string
  permalink_url: string
  artwork_url: string
  license: string
  user_id: number
  user: User
  secret_token?: string
  reposts_count: number
  tracks_uri: string
  secret_uri?: string
  likes_count: number
  downloadable?: boolean
  type?: string
  purchase_url?: string
  playlist_type?: string
  ean?: string
  purchase_title?: string
  created_with?: string
  tracks: Track[]
}

export interface Track {
  comment_count: number
  release: string
  original_content_size: number
  track_type: string
  original_format: string
  streamable: boolean
  download_url: string
  id: number
  state: string
  last_modified: string
  favoritings_count: number
  kind: 'track'
  purchase_url: string
  release_year?: number
  sharing: string
  license: string
  user_id: number
  user_favorite: boolean
  waveform_url: string
  permalink: string
  permalink_url: string
  playback_count: number
  downloadable: boolean
  created_at: string
  description: string
  title: string
  duration: number
  full_duration: number
  artwork_url: string
  video_url?: string
  tag_list: string
  release_month?: number
  genre: string
  release_day?: number
  reposts_count: number
  label_name: string
  commentable: boolean
  bpm?: number
  policy: string
  key_signature: string
  isrc: string
  uri: string
  download_count: number
  likes_count: number
  purchase_title: string
  embeddable_by: string
  monetization_model: string
  user: User
  user_playback_count?: number
  stream_url: string
  label_id?: number
}
