/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Format {
  protocol: string
  mime_type: string
}

export interface Transcoding {
  url: string
  preset: string
  duration: number
  snipped: boolean
  format: Format
  quality: string
}

export interface Media {
  transcodings: Transcoding[]
}

export interface PublisherMetadata {
  urn: string
  contains_music: boolean
  id: number
}

export interface Product {
  id: string
}

export interface CreatorSubscription {
  product: Product
}

export interface Visual {
  urn: string
  entry_time: number
  visual_url: string
}

export interface Visuals {
  urn: string
  enabled: boolean
  visuals: Visual[]
  tracking?: any
}

export interface User {
  avatar_url: string
  city: string
  comments_count: number
  country_code?: any
  created_at: Date
  creator_subscriptions: CreatorSubscription[]
  creator_subscription: CreatorSubscription
  description: string
  followers_count: number
  followings_count: number
  first_name: string
  full_name: string
  groups_count: number
  id: number
  kind: string
  last_modified: Date
  last_name: string
  likes_count: number
  playlist_likes_count: number
  permalink: string
  permalink_url: string
  playlist_count: number
  reposts_count?: any
  track_count: number
  uri: string
  urn: string
  username: string
  verified: boolean
  visuals: Visuals
}

export interface Track {
  comment_count: number
  full_duration: number
  downloadable: boolean
  created_at: Date
  description: string
  media: Media
  title: string
  publisher_metadata: PublisherMetadata
  duration: number
  has_downloads_left: boolean
  artwork_url: string
  public: boolean
  streamable: boolean
  tag_list: string
  genre: string
  id: number
  reposts_count: number
  state: string
  label_name?: any
  last_modified: Date
  commentable: boolean
  policy: string
  visuals?: any
  kind: 'track'
  purchase_url?: any
  sharing: string
  uri: string
  secret_token?: any
  download_count: number
  likes_count: number
  urn: string
  license: string
  purchase_title?: any
  display_date: Date
  embeddable_by: string
  release_date?: any
  user_id: number
  monetization_model: string
  waveform_url: string
  permalink: string
  permalink_url: string
  user: User
  playback_count: number
}

export interface TrackStub {
  id: number
  kind: 'track'
}

export function isFullTrack(track: Track | TrackStub): track is Track {
  return 'title' in track
}

export interface Playlist {
  duration: number
  permalink_url: string
  reposts_count: number
  genre?: any
  permalink: string
  purchase_url?: any
  description?: any
  uri: string
  label_name?: any
  tag_list: string
  set_type: string
  public: boolean
  track_count: number
  user_id: number
  last_modified: Date
  license: string
  tracks: (Track | TrackStub)[]
  id: number
  release_date?: any
  display_date: Date
  sharing: string
  secret_token?: any
  created_at: Date
  likes_count: number
  kind: 'playlist'
  title: string
  purchase_title?: any
  managed_by_feeds: boolean
  artwork_url?: any
  is_album: boolean
  user: User
  published_at: Date
  embeddable_by: string
}

export interface SearchResults<T> {
  collection: T[]
  total_results: number
  next_href: string
  query_urn: string
}
