import Bluebird from 'bluebird'
import { sortMostSimilar } from 'string'
import got from 'got'
import { stringify } from 'querystring'
import { SearchType, Release } from '../type'
import getClientId from './client_id'
import { SearchResults, Track, Playlist } from './types'
import format from './common'

async function searchApi(
  query: string,
  clientId: string
): Promise<(Playlist | Track)[]> {
  const urls = ['playlists', 'tracks'].map(
    type =>
      `https://api-v2.soundcloud.com/search/${type}?${stringify({
        q: query,
        client_id: clientId,
      })}`
  )

  const responses = await Bluebird.map(urls, async url => {
    const { body } = await got<SearchResults<Playlist | Track>>(url, {
      responseType: 'json',
    })
    return body.collection
  })

  return ([] as (Playlist | Track)[]).concat(...responses)
}

export default async function search(
  title: string,
  artist: string,
  _type: SearchType,
  limit?: number
): Promise<Release[]> {
  const clientId = await getClientId()
  const results = await searchApi(`${artist} ${title}`, clientId)
  const sortedResults = sortMostSimilar(
    `${artist} ${title}`,
    results,
    result => `${result.user.username} ${result.title}`
  ).reverse()
  const limitedResults = sortedResults.slice(0, limit || sortedResults.length)
  return Bluebird.map(limitedResults, result => format(result, clientId))
}
