import got from 'got'
import { formatMilliseconds } from 'time'
import { Release } from '../type'
import { Album, SimplifiedTrack } from './types'

export const regex = /(((http|https):\/\/)?(open\.spotify\.com\/.*|play\.spotify\.com\/.*))(album|track)\/([a-zA-Z0-9]+)/i

export async function fetchAlbum(
  id: string,
  accessToken: string
): Promise<Album> {
  const { body } = await got<Album>(`https://api.spotify.com/v1/albums/${id}`, {
    responseType: 'json',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return body
}

export function formatAlbum(album: Album): Release {
  let type: string
  if (album.album_type === 'compilation') {
    type = 'compilation'
  } else {
    const length = album.tracks.total
    if (length < 3) {
      type = 'single'
    } else if (length < 7) {
      type = 'ep'
    } else {
      type = 'album'
    }
  }

  const tracks = album.tracks.items.map((track, i) => ({
    position: String(i + 1),
    title: track.name,
    duration: formatMilliseconds(track.duration_ms),
  }))

  return {
    title: album.name,
    format: 'digital file',
    attributes: ['streaming'],
    date: new Date(album.release_date),
    link: album.external_urls.spotify,
    type,
    tracks,
  }
}
