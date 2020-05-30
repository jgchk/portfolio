import got from 'got'
import { Release } from '../type'
import getClientId from './client_id'
import format from './common'
import { Playlist, Track } from './types'

async function resolveApi(url: string, clientId: string): Promise<Release> {
  const { body } = await got<Track | Playlist>(
    'https://api-v2.soundcloud.com/resolve',
    {
      searchParams: { url, client_id: clientId },
      responseType: 'json',
    }
  )
  return format(body, clientId)
}

export default async function resolve(url: string): Promise<Release> {
  const clientId = await getClientId()
  return resolveApi(url, clientId)
}
