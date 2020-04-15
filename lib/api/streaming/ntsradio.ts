import fetch from 'node-fetch'
import querystring from 'querystring'
import Bluebird from 'bluebird'

import { Api, Searchable, Resolvable, Release, SearchType } from './type'
import { fetchDocument, isLinkElement, getFullLink } from '../../html'
import { notEmpty } from '../../types'
import { sortMostSimilar } from '../../string'

function test(url: string): boolean {
  const regex = new RegExp(
    'http(?:s)?://(?:www.)?nts.live/shows/(.*?)/episodes/([^/]*)(?:/)?'
  )
  return regex.test(url)
}

async function resolve(url: string): Promise<Release> {
  const doc = await fetchDocument(url)

  const infoEl = doc.querySelector('.bio')
  const tracksEl = doc.querySelector('.tracklist')
  if (!(infoEl && tracksEl))
    throw Error(`couldn't find info on NTS for url: ${url}`)

  const title = infoEl.querySelector('.bio__title h1')?.textContent
  if (!title) throw Error(`no release title found for url: ${url}`)

  let date
  const dateEl = infoEl.querySelector('#episode-broadcast-date')
  const dateStr = dateEl?.textContent?.replace(',', '').trim()
  if (dateStr) {
    const [dayStr, monthStr, yearStr] = dateStr.split('.')
    const year = 2000 + parseInt(yearStr, 10)
    const monthIndex = parseInt(monthStr, 10) - 1
    const day = parseInt(dayStr, 10)
    date = new Date(year, monthIndex, day)
  }

  let link = url
  const linkEl = doc.querySelector("link[rel='canonical']")
  if (linkEl && isLinkElement(linkEl)) link = linkEl.href

  const trackEls = Array.from(tracksEl.querySelectorAll('.track'))
  const tracks = trackEls.map((trackEl, i) => {
    const position = String(i + 1)
    const trackArtist = trackEl.querySelector('.track__artist')?.textContent
    const trackTitle = trackEl.querySelector('.track__title')?.textContent
    return { position, title: `${trackArtist} - ${trackTitle}` }
  })

  return {
    title,
    format: 'digital file',
    attributes: ['streaming'],
    date,
    link,
    type: 'mix',
    tracks,
  }
}

async function search(
  title: string,
  artist: string,
  type: SearchType,
  limit?: number
): Promise<Release[]> {
  const baseUrl = 'https://www.nts.live/api/v2/search'
  const query = `${artist} ${title}`
  const params = {
    q: query,
    version: 2,
    types: 'episode',
  }
  const url = `${baseUrl}?${querystring.stringify(params)}`
  const response = await fetch(url)
  const { results } = await response.json()

  interface FormattedResult {
    title: string
    link: string
  }
  const formattedResults: FormattedResult[] = results.map(
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (result: Record<string, any>) => {
      const link = `https://www.nts.live${result.article.path}`
      return { title: result.title, link }
    }
  )
  const sortedResults = sortMostSimilar(
    query,
    formattedResults,
    item => item.title
  ).reverse()
  const limitedResults = sortedResults.slice(0, limit || sortedResults.length)
  return Bluebird.map(limitedResults, result => resolve(result.link))
}

const api: Api & Searchable & Resolvable = {
  name: 'NTS Radio',
  test,
  resolve,
  search,
}

export default api
