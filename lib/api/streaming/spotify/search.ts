import Bluebird from 'bluebird'
import got from 'got'
import { Release, SearchType } from '../type'
import getAccessToken from './auth'
import { fetchAlbum, formatAlbum } from './common'
import { SearchAlbumsResponse } from './types'

export default async function search(
  title: string,
  artist: string,
  _type: SearchType,
  limit?: number
): Promise<Release[]> {
  const accessToken = await getAccessToken()

  const {
    body: {
      albums: { items: results },
    },
  } = await got<SearchAlbumsResponse>('https://api.spotify.com/v1/search', {
    responseType: 'json',
    searchParams: {
      q: `${artist} ${title}`,
      type: 'album',
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const limitedResults = results.slice(0, limit || results.length)
  return Bluebird.map(limitedResults, async result =>
    formatAlbum(await fetchAlbum(result.id, accessToken))
  )
}
