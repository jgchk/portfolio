import Bluebird from 'bluebird'
import { formatMilliseconds } from 'time'
import got from 'got'
import { Release, Track as ReleaseTrack } from '../type'
import { isFullTrack, Playlist, Track } from './types'

function formatTrack(track: Track, position: number): ReleaseTrack {
  return {
    position: position.toString(),
    title: track.title,
    duration: formatMilliseconds(track.full_duration),
  }
}

async function fetchTrack(id: number, clientId: string): Promise<Track> {
  const { body } = await got<Track>(
    `https://api-v2.soundcloud.com/tracks/${id}`,
    {
      searchParams: { client_id: clientId },
      responseType: 'json',
    }
  )
  return body
}

export default async function format(
  data: Track | Playlist,
  clientId: string
): Promise<Release> {
  let type: string
  let tracks: ReleaseTrack[]
  if (data.kind === 'track') {
    type = 'single'
    tracks = [
      {
        position: '1',
        title: data.title,
        duration: formatMilliseconds(data.full_duration),
      },
    ]
  } else {
    tracks = await Bluebird.map(data.tracks, async (track, i) =>
      formatTrack(
        isFullTrack(track) ? track : await fetchTrack(track.id, clientId),
        i
      )
    )

    const { length } = tracks
    if (length < 3) {
      type = 'single'
    } else if (length < 7) {
      type = 'ep'
    } else {
      type = 'album'
    }
  }

  return {
    title: data.title,
    format: 'digital file',
    attributes: ['streaming'],
    date: new Date(data.display_date),
    link: data.permalink_url,
    type,
    tracks,
  }
}
