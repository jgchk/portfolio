import { JSDOM } from 'jsdom'
import querystring from 'querystring'
import Bluebird from 'bluebird'
import fetch from 'node-fetch'

import { Api, Searchable, Resolvable, Release, SearchType } from './type'
import { isLinkElement } from '../../html'
import { notEmpty } from '../../types'
import { getTypeFromTracks } from './common'
import { sortMostSimilar } from '../../string'

function test(url: string): boolean {
  const regex = /http(?:s)?:\/\/play\.google\.com\/store\/music\/album\/(.+)\?id=(.+)/
  return regex.test(url)
}

async function resolve(url: string): Promise<Release> {
  const response = await fetch(url)
  const html = await response.text()
  const dom = new JSDOM(html)
  const doc = dom.window.document

  const titleEl = doc.querySelector("h1[itemprop='name']")
  const title = titleEl?.textContent
  if (!(titleEl && title)) throw Error(`no release title found for url: ${url}`)

  const infoEl = titleEl.parentElement?.parentElement?.querySelector(
    'div:nth-child(2) > div:first-child'
  )
  if (!infoEl) throw Error(`no info block found for url: ${url}`)

  const dateStr = infoEl.querySelector('div:first-child > span:nth-child(2)')
    ?.textContent
  const date = dateStr ? new Date(dateStr) : undefined

  let link = url
  const linkEl = doc.querySelector("link[rel='canonical']")
  if (linkEl && isLinkElement(linkEl)) link = linkEl.href

  const trackEls = Array.from(doc.querySelectorAll('table > tbody tr'))
  const tracks = trackEls
    .map(trackEl => {
      const position = trackEl.querySelector('td:first-child > div:first-child')
        ?.textContent
      const trackTitle = trackEl.querySelector('td:nth-child(2)')?.textContent
      const duration = trackEl.querySelector('td:nth-child(3)')?.textContent
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

async function search(
  title: string,
  artist: string,
  type: SearchType,
  limit?: number
): Promise<Release[]> {
  const baseUrl = 'https://play.google.com/store/search'
  const query = `${artist} ${title}`
  const params = {
    q: query,
    c: 'music',
  }
  const url = `${baseUrl}/?${querystring.stringify(params)}`

  const response = await fetch(url)
  const html = await response.text()
  const dom = new JSDOM(html)
  const doc = dom.window.document

  const results = Array.from(
    doc.querySelectorAll("a[href^='/store/music/album']")
  )
    .filter(isLinkElement)
    .filter(el => el.querySelector('div[title]'))
    .filter(el => {
      const isTrack = el.href.includes('&tid=song-')
      return type === 'track' ? isTrack : !isTrack
    })
    .map(el => {
      const link = el.href
      const resultTitle = el.querySelector('div[title]')?.textContent
      if (!resultTitle) return null
      return { link, title: resultTitle }
    })
    .filter(notEmpty)
  const sortedResults = sortMostSimilar(
    query,
    results,
    item => `${artist} ${item.title}`
  ).reverse()
  const limitedResults = sortedResults.slice(0, limit || sortedResults.length)
  return Bluebird.map(limitedResults, result => resolve(result.link))
}

const api: Api & Searchable & Resolvable = {
  name: 'Google Play',
  test,
  resolve,
  search,
}

export default api
