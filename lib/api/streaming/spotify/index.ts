import { Api, Searchable, Resolvable } from '../type'
import search from './search'
import resolve from './resolve'
import { regex } from './common'

function test(url: string): boolean {
  return regex.test(url)
}

const api: Api & Searchable & Resolvable = {
  name: 'Spotify',
  search,
  test,
  resolve,
}

export default api
