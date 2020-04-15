import fetch from 'node-fetch'
import querystring from 'querystring'
import Bluebird from 'bluebird'

import { Api, Searchable, Resolvable, Release, SearchType } from './type'
import { formatMilliseconds } from '../../time'
import { sortMostSimilar } from '../../string'

const regex = new RegExp(
  'http(?:s)?://(?:(?:www|api).)?mixcloud.com/(.*?)/([^/]*)(?:/)?'
)

function test(url: string): boolean {
  return regex.test(url)
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function formatInfo(info: Record<string, any>): Release {
  const title = info.name
  const date = new Date(info.created_time)
  const link = info.url
  const tracks = [
    {
      position: '1',
      title: info.name,
      duration: formatMilliseconds(1000 * info.audio_length),
    },
  ]

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

async function resolve(url: string): Promise<Release> {
  const match = regex.exec(url)
  if (!match) throw Error(`invalid mixcloud url: ${url}`)
  const [, artistPath, mixPath] = match

  const baseUrl = 'https://api.mixcloud.com'
  const apiUrl = `${baseUrl}/${artistPath}/${mixPath}/`

  const response = await fetch(apiUrl)
  const info = await response.json()
  return formatInfo(info)
}

async function search(
  title: string,
  artist: string,
  type: SearchType,
  limit?: number
): Promise<Release[]> {
  const baseUrl = 'https://api.mixcloud.com/search'
  const query = `${artist} ${title}`
  const params = {
    q: title,
    type: 'cloudcast',
  }
  const url = `${baseUrl}/?${querystring.stringify(params)}`
  const response = await fetch(url)
  const { data } = await response.json()

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const results: Record<string, any>[] = data
  const sortedResults = sortMostSimilar(
    query,
    results,
    item => `${item.user.name} ${item.name}`
  ).reverse()
  const limitedResults = sortedResults.slice(0, limit || sortedResults.length)
  return Bluebird.map(limitedResults, formatInfo)
}

const api: Api & Searchable & Resolvable = {
  name: 'Mixcloud',
  test,
  resolve,
  search,
}

export default api
