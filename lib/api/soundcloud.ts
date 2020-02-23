import SoundCloud, { Track, Playlist } from 'soundcloud-api-client'
import fetch from 'node-fetch'
import Promise from 'bluebird'

import { sortMostSimilar } from 'lib/string'
import { formatMilliseconds } from 'lib/time'
import {
  Api,
  Searchable,
  Resolvable,
  Release,
  Track as ReleaseTrack,
} from './type'

const SC = new SoundCloud({ client_id: process.env.SOUNDCLOUD_ID || '' })

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
  const response: Array<Track> = await SC.get(`/playlists/${release.id}/tracks`)
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
    tracks = await getTracks(release)
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
  const data = await SC.get('/resolve', { url })
  return formatRelease(data)
}

async function searchType(
  title: string,
  artist: string,
  endpoint: '/tracks' | '/playlists'
): Promise<Array<Track | Playlist>> {
  const query = `${artist} ${title}`
  const results: Array<Track | Playlist> = await SC.get(endpoint, { q: query })
  return results
}

async function search(
  title: string,
  artist: string,
  limit?: number
): Promise<Array<Release>> {
  let results = await searchType(title, artist, '/playlists')
  if (!results) results = await searchType(title, artist, '/tracks')

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
