import querystring from 'querystring'
import Bluebird from 'bluebird'

import { Api, Searchable, Resolvable, Release, SearchType } from './type'
import { fetchDocument, isLinkElement } from '../../html'
import { notEmpty } from '../../types'
import { getTypeFromTracks } from './common'
import { sortMostSimilar } from '../../string'

function test(url: string): boolean {
  const regex = /http(?:s)?:\/\/(?:(?:www|pro|classic)\.)?beatport\.com\/release\/(.*?)\/(\d+)/
  return regex.test(url)
}

async function resolve(url: string): Promise<Release> {
  const doc = await fetchDocument(url)

  const title = doc.querySelector('.interior-release-chart-content > h1')
    ?.textContent
  if (!title) throw Error(`no release title found for url: ${url}`)

  let date
  const infoEls = Array.from(
    doc.querySelectorAll('.interior-release-chart-content-item')
  )
  const dateEl = infoEls.find(infoEl => {
    const categoryEl = infoEl.querySelector('.category')
    return categoryEl && categoryEl.textContent === 'Release Date'
  })
  const dateStr = dateEl?.querySelector('.value')?.textContent
  if (dateStr) {
    const [yearStr, monthStr, dayStr] = dateStr.split('-')
    const year = parseInt(yearStr, 10)
    const monthIndex = parseInt(monthStr, 10) - 1
    const day = parseInt(dayStr, 10)
    date = new Date(year, monthIndex, day)
  }

  const link = url

  const trackEls = Array.from(doc.querySelectorAll('.track'))
  const tracks = trackEls
    .map(trackEl => {
      const position = trackEl.querySelector('.buk-track-num')?.textContent
      const trackTitle = trackEl.querySelector('.buk-track-primary-title')
        ?.textContent
      const duration = trackEl.querySelector('.buk-track-length')?.textContent
      if (!(position && trackTitle && duration)) return null
      return { position, title: trackTitle, duration }
    })
    .filter(notEmpty)

  const type = getTypeFromTracks(tracks.length)

  return {
    title,
    format: 'lossless digital',
    attributes: ['downloadable'],
    date,
    link,
    type,
    tracks,
  }
}

async function search(
  title: string,
  artist: string,
  type: SearchType,
  limit?: number
): Promise<Release[]> {
  const baseUrl = 'https://www.beatport.com/search/releases'
  const query = `${artist} ${title}`
  const params = { q: query }
  const url = `${baseUrl}/?${querystring.stringify(params)}`
  const doc = await fetchDocument(url)

  const baseReleaseUrl = 'https://www.beatport.com'
  const results = Array.from(doc.querySelectorAll('.release .release-meta'))
    .map(metaEl => {
      const resultTitle = metaEl.querySelector('.release-title')?.textContent
      const resultArtist = metaEl
        .querySelector('.release-artists')
        ?.textContent?.split(',')
        .map(s => s.trim())
        .join(', ')
      let resultLink
      const resultLinkEl = metaEl.querySelector('a:first-child')
      if (resultLinkEl && isLinkElement(resultLinkEl)) {
        const link = resultLinkEl.href
        if (link.startsWith('/')) resultLink = `${baseReleaseUrl}${link}`
        else resultLink = link
      }
      if (!(resultTitle && resultArtist && resultLink)) return null
      return { title: resultTitle, artist: resultArtist, link: resultLink }
    })
    .filter(notEmpty)
  const sortedResults = sortMostSimilar(
    query,
    results,
    item => `${item.artist} ${item.title}`
  ).reverse()
  const limitedResults = sortedResults.slice(0, limit || sortedResults.length)
  return Bluebird.map(limitedResults, result => resolve(result.link))
}

const api: Api & Searchable & Resolvable = {
  name: 'Beatport',
  test,
  resolve,
  search,
}

export default api
