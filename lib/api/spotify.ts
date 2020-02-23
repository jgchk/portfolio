/// <reference types="@types/spotify-api" />
import SpotifyWebApi from 'spotify-web-api-node'
import Promise from 'bluebird'

import { Api, Searchable, Resolvable, Release } from 'lib/api/type'
import { sortMostSimilar } from 'lib/string'
import { formatMilliseconds } from 'lib/time'

interface Tokens {
  accessToken: string
  refreshToken: string
}

let expireTime = new Date()

const Spotify = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_ID,
  clientSecret: process.env.SPOTIFY_SECRET,
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
  if (!code) return new Error('Authorization code cannot be empty')
  await checkAuthRefresh()

  const data = await Spotify.authorizationCodeGrant(code)
  return {
    accessToken: data.body.access_token,
    refreshToken: data.body.refresh_token,
  }
}

export async function album(
  id: string
): Promise<SpotifyApi.SingleAlbumResponse> {
  if (!id) throw new Error('Id cannot be empty')
  await checkAuthRefresh()

  const data = await Spotify.getAlbum(id)
  return data.body
}

export async function track(
  id: string
): Promise<SpotifyApi.SingleTrackResponse> {
  if (!id) throw new Error('Id cannot be empty')
  await checkAuthRefresh()

  const data = await Spotify.getTrack(id)
  return data.body
}

function isAlbum(
  release: SpotifyApi.SingleAlbumResponse | SpotifyApi.SingleTrackResponse
): release is SpotifyApi.SingleAlbumResponse {
  return release.type === 'album'
}

function isTrack(
  release: SpotifyApi.SingleAlbumResponse | SpotifyApi.SingleTrackResponse
): release is SpotifyApi.SingleTrackResponse {
  return release.type === 'track'
}

function formatRelease(
  release: SpotifyApi.SingleAlbumResponse | SpotifyApi.SingleTrackResponse
): Release {
  let date
  if (isAlbum(release)) {
    date = new Date(release.release_date)
  } else {
    date = new Date(release.album.release_date)
  }

  let type
  if (isTrack(release)) {
    type = 'single'
  } else if (release.album_type === 'compilation') {
    type = 'compilation'
  } else {
    const { length } = release.tracks.items
    if (length < 3) {
      type = 'single'
    } else if (length < 7) {
      type = 'ep'
    } else {
      type = 'album'
    }
  }

  let tracks
  if (isAlbum(release)) {
    tracks = release.tracks.items.map((tr, i) => {
      const position =
        tr.track_number ||
        (i > 0 && release.tracks.items[i - 1].track_number + 1) ||
        i + 1
      return {
        position: String(position),
        title: tr.name,
        duration: formatMilliseconds(tr.duration_ms),
      }
    })
  } else {
    tracks = [
      {
        position: '1',
        title: release.name,
        duration: formatMilliseconds(release.duration_ms),
      },
    ]
  }

  return {
    title: release.name,
    format: 'digital file',
    attributes: ['streaming'],
    date,
    link: release.external_urls.spotify,
    type,
    tracks,
  }
}

async function resolve(url: string): Promise<Release> {
  const regex = /(((http|https):\/\/)?(open\.spotify\.com\/.*|play\.spotify\.com\/.*))(album|track)\/([a-zA-Z0-9]+)/i
  const match = regex.exec(url)
  if (!match) throw new Error(`invalid url: ${url}`)
  const type = match[5]
  const id = match[6]

  let response
  if (type === 'album') {
    response = await album(id)
  } else if (type === 'track') {
    response = await track(id)
  } else {
    throw new Error('only album and track links allowed')
  }

  return formatRelease(response)
}

function isAlbumSearchResponse(
  searchResponse: SpotifyApi.SearchResponse
): searchResponse is SpotifyApi.AlbumSearchResponse {
  return 'albums' in searchResponse
}

async function search(
  title: string,
  artist: string,
  limit?: number
): Promise<Array<Release>> {
  await checkAuthRefresh()
  const query = `${artist} ${title}`
  const response = await Spotify.search(query, ['album'])

  if (response.statusCode !== 200)
    throw new Error(`Got a bad status code: ${response.statusCode}`)
  if (!isAlbumSearchResponse(response.body))
    throw new Error("Got a bad response. 'albums' is not present in body")

  const results = response.body.albums
  const sortedResults = sortMostSimilar(query, results.items, item =>
    [...item.artists.map(a => a.name), item.name].join(' ')
  ).reverse()
  const limitedResults = sortedResults.slice(0, limit || sortedResults.length)
  return Promise.map(limitedResults, result =>
    resolve(result.external_urls.spotify)
  )
}

const api: Api & Searchable & Resolvable = {
  name: 'Spotify',
  search,
  resolve,
}

export default api
