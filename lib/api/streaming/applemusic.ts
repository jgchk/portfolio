import fetch from 'node-fetch'
import querystring from 'querystring'
import Bluebird from 'bluebird'

import { Api, Searchable, Resolvable, Release, SearchType } from './type'
import { notEmpty } from '../../types'
import { getTypeFromTracks } from './common'
import { fetchDocument, isMetaElement, isLinkElement } from '../../html'

function test(url: string): boolean {
  const regex = /http(?:s)?:\/\/music\.apple\.com\/(\w{2,4})\/album\/([^/]*)\/([^?]+)[^/]*/
  return regex.test(url)
}

async function resolve(url: string): Promise<Release> {
  const doc = await fetchDocument(url)

  const title = doc.querySelector('.product-name')?.textContent?.trim()
  if (!title) throw Error(`no release title found for url: ${url}`)

  let date
  const dateEl = doc.querySelector("meta[property='music:release_date']")
  if (dateEl && isMetaElement(dateEl)) date = new Date(dateEl.content)

  let link = url
  const linkEl = doc.querySelector("link[rel='canonical']")
  if (linkEl && isLinkElement(linkEl)) link = linkEl.href

  const tracks = Array.from(doc.querySelectorAll('.songs-list .song'))
    .map(trackEl => {
      const position = trackEl.querySelector('.song-index .column-data')
        ?.textContent
      const trackTitle = trackEl
        .querySelector('.song-name')
        ?.textContent?.trim()
      const duration = trackEl.querySelector('.time-data')?.textContent
      if (!(position && trackTitle && duration)) return null
      return { position, title: trackTitle, duration }
    })
    .filter(notEmpty)

  const type = getTypeFromTracks(tracks.length)

  return {
    title,
    format: 'digital file',
    attributes: ['downloadable', 'streaming'],
    date,
    link,
    type,
    tracks,
  }
}

async function formatSearchResult(result: {
  collectionViewUrl: string
}): Promise<Release> {
  const url = result.collectionViewUrl
  return resolve(url)
}

async function search(
  title: string,
  artist: string,
  type: SearchType,
  limit?: number
): Promise<Release[]> {
  const baseUrl = 'http://itunes.apple.com/search'
  const params = {
    media: 'music',
    entity: type === 'album' ? 'album' : 'song',
    limit: 25,
    term: `${artist} ${title}`,
  }
  const url = `${baseUrl}/?${querystring.stringify(params)}`

  const response = await fetch(url)
  const { results } = await response.json()

  const limitedResults = results.slice(0, limit || results.length)
  return Bluebird.map(limitedResults, formatSearchResult)
}

const api: Api & Searchable & Resolvable = {
  name: 'Apple Music',
  test,
  resolve,
  search,
}

export default api
