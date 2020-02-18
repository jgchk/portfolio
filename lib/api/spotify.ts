/// <reference types="@types/spotify-api" />
import SpotifyWebApi from 'spotify-web-api-node'
import credentials from 'credentials/spotify'

interface Tokens {
  accessToken: string
  refreshToken: string
}

interface Error {
  error: string
}

type SearchType = 'album' | 'artist' | 'playlist' | 'track'
export function isSearchType(str: string): str is SearchType {
  return ['album', 'artist', 'playlist', 'track'].includes(str)
}
export function isSearchTypes(strs: string[]): strs is SearchType[] {
  return strs.every(str => isSearchType(str))
}

let expireTime = new Date()

const Spotify = new SpotifyWebApi({
  clientId: credentials.id,
  clientSecret: credentials.secret,
})

async function authorize(): Promise<void> {
  const data = await Spotify.clientCredentialsGrant()
  expireTime = new Date(expireTime.getTime() + 1000 * data.body.expires_in)
  Spotify.setAccessToken(data.body.access_token)
}

async function checkAuthRefresh(): Promise<void> {
  if (expireTime <= new Date()) {
    await authorize()
  }
}

export async function token(code: string): Promise<Tokens | Error> {
  if (!code) return { error: 'Authorization code cannot be empty' }
  await checkAuthRefresh()

  const data = await Spotify.authorizationCodeGrant(code)
  return {
    accessToken: data.body.access_token,
    refreshToken: data.body.refresh_token,
  }
}

export async function album(
  id: string
): Promise<SpotifyApi.SingleAlbumResponse | Error> {
  if (!id) return { error: 'Id cannot be empty' }
  await checkAuthRefresh()

  const data = await Spotify.getAlbum(id)
  return data.body
}

export async function track(
  id: string
): Promise<SpotifyApi.SingleTrackResponse | Error> {
  if (!id) return { error: 'Id cannot be empty' }
  await checkAuthRefresh()

  const data = await Spotify.getTrack(id)
  return data.body
}

export async function search(
  query: string,
  types: SearchType[]
): Promise<SpotifyApi.SearchResponse | Error> {
  if (!query) return { error: 'Query cannot be empty' }
  if (!types) return { error: 'Type cannot be empty' }
  await checkAuthRefresh()

  const data = await Spotify.search(query, types)
  return data.body
}
