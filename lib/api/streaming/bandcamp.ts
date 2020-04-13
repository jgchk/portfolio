import Bandcamp, {
  AlbumInfo,
  SearchResult,
  AlbumResult,
  TrackResult,
} from 'bandcamp-scraper'
import Promise from 'bluebird'

import { sortMostSimilar } from 'lib/string'
import { formatMilliseconds } from 'lib/time'
import { Api, Searchable, Resolvable, Release, SearchType } from './type'
import { getTypeFromTracks } from './common'

const BC = {
  getAlbumInfo: Promise.promisify(Bandcamp.getAlbumInfo),
  search: Promise.promisify(Bandcamp.search),
}

function formatAlbumInfo(albumInfo: AlbumInfo): Release {
  const date = new Date(
    albumInfo.raw.album_release_date || albumInfo.raw.current.release_date
  )

  const { length } = albumInfo.raw.trackinfo
  const type = getTypeFromTracks(length)

  const tracks = albumInfo.raw.trackinfo.map((track, i) => {
    const position =
      length === 1
        ? 1
        : track.track_num ||
          (i > 0 &&
            parseInt(albumInfo.raw.trackinfo[i - 1].track_num, 10) + 1) ||
          i + 1
    return {
      position: String(position),
      title: track.title,
      duration: formatMilliseconds(track.duration * 1000),
    }
  })

  return {
    title: albumInfo.title,
    format: 'lossless digital',
    attributes: ['downloadable', 'streaming'],
    date,
    link: albumInfo.url,
    type,
    tracks,
  }
}

function test(url: string): boolean {
  const regex = /((http:\/\/(.*\.bandcamp\.com\/|.*\.bandcamp\.com\/track\/.*|.*\.bandcamp\.com\/album\/.*))|(https:\/\/(.*\.bandcamp\.com\/|.*\.bandcamp\.com\/track\/.*|.*\.bandcamp\.com\/album\/.*)))/i
  return regex.test(url)
}

async function resolve(url: string): Promise<Release> {
  const albumInfo = await BC.getAlbumInfo(url)
  return formatAlbumInfo(albumInfo)
}

function isAlbumResult(result: SearchResult): result is AlbumResult {
  return result.type === 'album'
}

function isTrackResult(result: SearchResult): result is TrackResult {
  return result.type === 'track'
}

async function search(
  title: string,
  artist: string,
  type: SearchType,
  limit?: number
): Promise<Array<Release>> {
  const query = `${title} ${artist}`
  const results = await BC.search({ query })
  const filteredResults: Array<AlbumResult | TrackResult> =
    type === 'album'
      ? results.filter(isAlbumResult)
      : results.filter(isTrackResult)
  const sortedResults = sortMostSimilar(
    query,
    filteredResults,
    item => `${item.name} ${item.artist}`
  ).reverse()
  const limitedResults = sortedResults.slice(0, limit || sortedResults.length)
  return Promise.map(limitedResults, result => resolve(result.url))
}

const api: Api & Searchable & Resolvable = {
  name: 'Bandcamp',
  search,
  test,
  resolve,
}

export default api
