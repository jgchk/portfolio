import Bandcamp, {
  AlbumInfo,
  SearchResult,
  AlbumResult,
} from 'bandcamp-scraper'
import Promise from 'bluebird'

import { sortMostSimilar } from 'lib/string'
import { Api, Searchable, Resolvable, Release } from 'lib/api/type'
import { formatMilliseconds } from 'lib/time'

const BC = {
  getAlbumInfo: Promise.promisify(Bandcamp.getAlbumInfo),
  search: Promise.promisify(Bandcamp.search),
}

function formatAlbumInfo(albumInfo: AlbumInfo): Release {
  const date = new Date(
    albumInfo.raw.album_release_date || albumInfo.raw.current.release_date
  )

  let type
  const { length } = albumInfo.raw.trackinfo
  if (length < 3) {
    type = 'single'
  } else if (length < 7) {
    type = 'ep'
  } else {
    type = 'album'
  }

  const tracks = albumInfo.raw.trackinfo.map((track, i) => {
    const position =
      track.track_num ||
      (i > 0 && parseInt(albumInfo.raw.trackinfo[i - 1].track_num, 10) + 1) ||
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

async function search(
  title: string,
  artist: string,
  limit?: number
): Promise<Array<Release>> {
  const query = `${title} ${artist}`
  const results = await BC.search({ query })
  const filteredResults = results.filter(isAlbumResult)
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
