import { search as searchScrape, resolve as resolveScrape } from './scraper'
import { Api, Searchable, Resolvable, Release, SearchType } from '../type'

async function search(
  title: string,
  artist: string,
  type: SearchType,
  limit?: number
): Promise<Array<Release>> {
  return searchScrape(title, artist, type, limit)
}

function test(url: string): boolean {
  const regex = /((http:\/\/(soundcloud\.com\/.*|soundcloud\.com\/.*\/.*|soundcloud\.com\/.*\/sets\/.*|soundcloud\.com\/groups\/.*|snd\.sc\/.*))|(https:\/\/(soundcloud\.com\/.*|soundcloud\.com\/.*\/.*|soundcloud\.com\/.*\/sets\/.*|soundcloud\.com\/groups\/.*)))/i
  return regex.test(url)
}

async function resolve(url: string): Promise<Release> {
  return resolveScrape(url)
}

const api: Api & Searchable & Resolvable = {
  name: 'SoundCloud',
  search,
  test,
  resolve,
}

export default api
