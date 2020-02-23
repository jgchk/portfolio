import YTSearch from 'ytsr'
import YTInfo, { VideoInfo } from 'youtube-info'
import Promise from 'bluebird'

import { Api, Searchable, Resolvable, Release } from 'lib/api/type'
import { sortMostSimilar } from 'lib/string'

function formatRelease(info: VideoInfo): Release {
  const date = new Date(info.datePublished)
  return {
    title: info.title,
    format: 'digital file',
    attributes: ['streaming'],
    date,
    link: info.url,
  }
}

async function resolve(url: string): Promise<Release> {
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i
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

function isRelease(release: Release | null): release is Release {
  return release !== null
}

async function search(
  title: string,
  artist: string,
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
  const promisedResults = await Promise.map(limitedResults, async result => {
    try {
      return await resolve(result.link)
    } catch (e) {
      return null
    }
  })
  return promisedResults.filter(isRelease)
}

const api: Api & Searchable & Resolvable = {
  name: 'YouTube',
  search,
  resolve,
}

export default api
