import SC, {
  Track,
  Playlist,
  GetOptions,
  SearchResults,
} from 'soundcloud-v2-api'
import fetch from 'node-fetch'
import Promise from 'bluebird'
import { AxiosError } from 'axios'

import { sortMostSimilar } from 'lib/string'
import { formatMilliseconds } from 'lib/time'
import { editClientId, filterClientIds } from 'lib/api/aws/rds'
import {
  Api,
  Searchable,
  Resolvable,
  Release,
  Track as ReleaseTrack,
  SearchType,
} from './type'

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

async function getReleaseDate(release: Track | Playlist): Promise<Date> {
  const url = release.permalink_url
  const response = await fetch(url)
  const html = await response.text()

  const regex = /"display_date":"([^"]+)"/gm
  const match = regex.exec(html)
  if (!match) throw Error(`unable to find date for url: ${url}`)
  const date = match[1]
  return new Date(date)
}

async function getTracks(release: Playlist): Promise<Array<ReleaseTrack>> {
  const response: Array<Track> = await getSafe(
    `/playlists/${release.id}/tracks`
  )
  return response.map((track, i) => {
    return {
      position: String(i + 1),
      title: track.title,
      duration: formatMilliseconds(track.duration),
    }
  })
}

function isTrack(release: Track | Playlist): release is Track {
  return release.kind === 'track'
}

async function formatRelease(release: Track | Playlist): Promise<Release> {
  const date = await getReleaseDate(release)

  let type
  let tracks
  if (isTrack(release)) {
    type = 'single'
    tracks = [
      {
        position: '1',
        title: release.title,
        duration: formatMilliseconds(release.duration),
      },
    ]
  } else {
    tracks = release.tracks.map((track, i) => ({
      position: String(i + 1),
      title: track.title,
      duration: formatMilliseconds(track.duration),
    }))

    const { length } = tracks
    if (length < 3) {
      type = 'single'
    } else if (length < 7) {
      type = 'ep'
    } else {
      type = 'album'
    }
  }

  return {
    title: release.title,
    format: 'digital file',
    attributes: ['streaming'],
    date,
    link: release.permalink_url,
    type,
    tracks,
  }
}

function test(url: string): boolean {
  const regex = /((http:\/\/(soundcloud\.com\/.*|soundcloud\.com\/.*\/.*|soundcloud\.com\/.*\/sets\/.*|soundcloud\.com\/groups\/.*|snd\.sc\/.*))|(https:\/\/(soundcloud\.com\/.*|soundcloud\.com\/.*\/.*|soundcloud\.com\/.*\/sets\/.*|soundcloud\.com\/groups\/.*)))/i
  return regex.test(url)
}

async function resolve(url: string): Promise<Release> {
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

async function search(
  title: string,
  artist: string,
  type: SearchType,
  limit?: number
): Promise<Array<Release>> {
  let results
  if (type === 'album') {
    results = (await searchType(title, artist, '/playlists')).collection
    if (!results)
      results = (await searchType(title, artist, '/tracks')).collection
  } else {
    results = (await searchType(title, artist, '/tracks')).collection
  }

  const sortedResults = sortMostSimilar(
    `${artist} ${title}`,
    results,
    item => `${item.user.username} ${item.title}`
  ).reverse()
  const limitedResults = sortedResults.slice(0, limit || sortedResults.length)
  return Promise.map(limitedResults, result => formatRelease(result))
}

const api: Api & Searchable & Resolvable = {
  name: 'SoundCloud',
  search,
  test,
  resolve,
}

export default api
