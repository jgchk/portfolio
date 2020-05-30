import { Release } from '../type'
import { fetchAlbum, regex, formatAlbum } from './common'
import getAccessToken from './auth'

export default async function resolve(url: string): Promise<Release> {
  const match = regex.exec(url)
  if (!match) throw new Error(`invalid url: ${url}`)
  const type = match[5]
  const id = match[6]

  if (type !== 'album') throw new Error('only album links allowed')

  const accessToken = await getAccessToken()
  const album = await fetchAlbum(id, accessToken)
  return formatAlbum(album)
}
