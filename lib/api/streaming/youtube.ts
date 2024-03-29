import YTSearch, { SearchResult } from 'ytsr'
import YTInfo, { VideoInfo } from 'youtube-info'
import getArtistTitle from 'get-artist-title'
import Promise from 'bluebird'

import { sortMostSimilar } from 'lib/string'
import { Api, Searchable, Resolvable, Release, SearchType } from './type'

const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i

function getTitle(str: string): string {
  const artistTitle = getArtistTitle(str, { defaultArtist: '' })
  return artistTitle ? artistTitle[1] : str
}

function formatRelease(info: VideoInfo): Release {
  const date = new Date(info.datePublished)
  const title = getTitle(info.title)
  return {
    title,
    format: 'digital file',
    attributes: ['streaming'],
    date,
    link: info.url,
  }
}

function test(url: string): boolean {
  return regex.test(url)
}

async function resolve(url: string): Promise<Release> {
  const match = regex.exec(url)
  if (!match) throw new Error(`invalid url: ${url}`)
  const id = match[1]
  try {
    const response = await YTInfo(id)
    return formatRelease(response)
  } catch (e) {
    throw Error(`unable to find video at ${url}`)
  }
}

function formatResult(result: SearchResult): Release {
  const title = getTitle(result.title)
  return {
    title,
    format: 'digital file',
    attributes: ['streaming'],
    link: result.link,
  }
}

function isRelease(release: Release | null): release is Release {
  return release !== null
}

async function search(
  title: string,
  artist: string,
  _type: SearchType,
  limit?: number
): Promise<Array<Release>> {
  const query = `${artist} ${title}`
  const response = await YTSearch(query)
  const results = response.items
  const filteredResults = results.filter(item => item.type === 'video')
  const sortedResults = sortMostSimilar(
    query,
    filteredResults,
    item => `${item.title}`
  ).reverse()
  const limitedResults = sortedResults.slice(0, limit || sortedResults.length)
  const formattedResults = limitedResults.map(formatResult)
  return formattedResults
}

const api: Api & Searchable & Resolvable = {
  name: 'YouTube',
  search,
  test,
  resolve,
}

export default api
