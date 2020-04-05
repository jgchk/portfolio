import SC, {
  User,
  Track,
  Playlist,
  GetOptions,
  SearchResults,
} from 'soundcloud-v2-api'
import Bluebird from 'bluebird'
import { AxiosError } from 'axios'

import { sortMostSimilar } from 'lib/string'
import { editClientId, filterClientIds } from 'lib/api/aws/rds'
import { Release, SearchType } from '../type'
import { formatRelease } from './common'

async function setNewClientId(): Promise<void> {
  const unexpiredClientIds = await filterClientIds({ expired: false })
  if (unexpiredClientIds.length === 0)
    throw new Error('no SoundCloud client ids available')
  const newClientId = unexpiredClientIds[0]
  await editClientId(newClientId, { used: true })
  SC.init({ clientId: newClientId })
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
async function getSafe(path: string, params?: GetOptions): Promise<any> {
  if (!(SC.config && SC.config.clientId)) await setNewClientId()

  return SC.get(path, params).catch(async (err: AxiosError) => {
    if (err.response && err.response.status === 401) {
      // set id as expired
      const currentClientId = SC.config && SC.config.clientId
      if (currentClientId)
        await editClientId(currentClientId, { expired: true })

      // get new id
      setNewClientId()

      // re-get
      return getSafe(path, params)
    }
    throw err
  })
}

export async function resolve(url: string): Promise<Release> {
  const data = await getSafe('/resolve', { url })
  return formatRelease(data)
}

async function searchType(
  title: string,
  artist: string,
  endpoint: '/tracks' | '/playlists'
): Promise<SearchResults> {
  const query = `${artist} ${title}`
  const results = await getSafe(`/search${endpoint}`, {
    q: query,
  })
  return results
}

function isNotUser(obj: User | Playlist | Track): obj is Playlist | Track {
  return obj.kind !== 'user'
}

export async function search(
  title: string,
  artist: string,
  type: SearchType,
  limit?: number
): Promise<Release[]> {
  let results
  if (type === 'album') {
    results = (await searchType(title, artist, '/playlists')).collection
    if (!results)
      results = (await searchType(title, artist, '/tracks')).collection
  } else {
    results = (await searchType(title, artist, '/tracks')).collection
  }

  const filteredResults = results.filter(isNotUser)
  const sortedResults = sortMostSimilar(
    `${artist} ${title}`,
    filteredResults,
    item => `${item.user.username} ${item.title}`
  ).reverse()
  const limitedResults = sortedResults.slice(0, limit || sortedResults.length)
  return Bluebird.map(limitedResults, result => formatRelease(result))
}
