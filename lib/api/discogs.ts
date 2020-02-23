import DiscogsApi, { Database } from 'disconnect'
import Promise from 'bluebird'

import { sortMostSimilar } from 'lib/string'
import { Api, Searchable, Resolvable, Release } from './type'

const Discogs = new DiscogsApi.Client({
  consumerKey: process.env.DISCOGS_KEY || '',
  consumerSecret: process.env.DISCOGS_SECRET || '',
})
const db = Discogs.database()

function formatRelease(release: Database.Release): Release {
  const date = new Date(release.released)

  let format
  const attributes = []
  const releaseFormat = release.formats[0].name.toLowerCase()
  if (releaseFormat === 'file') {
    const losslessFormats = ['FLAC', 'ALAC']
    if (
      release.formats &&
      release.formats[0].descriptions &&
      losslessFormats.some(f => release.formats[0].descriptions.includes(f))
    ) {
      format = 'lossless digital'
    } else {
      format = 'digital file'
    }
    attributes.push('downloadable')
  } else {
    format = releaseFormat
  }

  let type
  if (
    release.formats &&
    release.formats[0].descriptions &&
    release.formats[0].descriptions.includes('Mixtape')
  ) {
    type = 'mixtape'
  } else if (release.tracklist) {
    const { length } = release.tracklist
    if (length < 3) {
      type = 'single'
    } else if (length < 7) {
      type = 'ep'
    } else {
      type = 'album'
    }
  }

  const tracks = release.tracklist.map((track, i) => {
    const position =
      track.position ||
      (i > 0 && parseInt(release.tracklist[i - 1].position, 10) + 1) ||
      i + 1
    return {
      position: String(position),
      title: track.title,
      duration: track.duration,
    }
  })

  return {
    title: release.title,
    format,
    attributes,
    date,
    link: release.uri,
    type,
    tracks,
  }
}

async function resolve(url: string): Promise<Release> {
  const regex = /((http|https):\/\/)?(.*\.)?(discogs\.com)?\/(.+)\/(release|master)\/(\d+)/i
  const match = regex.exec(url)
  if (!match) throw new Error(`invalid url: ${url}`)
  const type = match[6]
  const id = match[7]

  let response
  if (type === 'release') {
    response = await db.getRelease(id)
  } else if (type === 'master') {
    const master = await db.getMaster(id)
    response = await db.getRelease(master.main_release)
  } else {
    throw new Error('only release or master pages allowed')
  }

  return formatRelease(response)
}

async function search(
  title: string,
  artist: string,
  limit?: number
): Promise<Array<Release>> {
  const query = `${artist} - ${title}`
  const response = await db.search(query)
  const { results } = response
  const filteredResults = results.filter(
    result => result.type === 'release' || result.type === 'master'
  )
  const sortedResults = sortMostSimilar(
    query,
    filteredResults,
    item => item.title
  ).reverse()
  const limitedResults = sortedResults.slice(0, limit || sortedResults.length)
  return Promise.map(limitedResults, result => resolve(result.uri))
}

const api: Api & Searchable & Resolvable = {
  name: 'Discogs',
  search,
  resolve,
}

export default api
