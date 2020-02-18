import SoundCloud from 'soundcloud-api-client'

const SC = new SoundCloud({ client_id: process.env.SOUNDCLOUD_ID })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UserInfo = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TrackInfo = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PlaylistInfo = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppInfo = Record<string, any>

type ResolveInfo = UserInfo | TrackInfo | PlaylistInfo | AppInfo

type SearchResults = Array<TrackInfo | PlaylistInfo>

export async function resolve(url: string): Promise<ResolveInfo> {
  const data = await SC.get('/resolve', { url })
  return data
}

export async function search(q: string, type: string): Promise<SearchResults> {
  const endpoint = type === 'single' ? '/tracks' : '/playlists'
  const data = await SC.get(endpoint, { q })
  return data
}
