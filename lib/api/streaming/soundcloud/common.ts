import { Track, Playlist } from 'soundcloud-v2-api'
import Bluebird from 'bluebird'
import fetch from 'node-fetch'

import { formatMilliseconds } from 'lib/time'
import { Release } from '../type'

export function extractReleaseDate(url: string, html: string): Date {
  const regex = /"display_date":"([^"]+)"/gm
  const match = regex.exec(html)
  if (!match) throw Error(`unable to find date for url: ${url}`)
  const date = match[1]
  return new Date(date)
}

async function getReleaseDate(release: Track | Playlist): Promise<Date> {
  const url = release.permalink_url
  const response = await fetch(url)
  const html = await response.text()
  return extractReleaseDate(url, html)
}

function isTrack(release: Track | Playlist): release is Track {
  return release.kind === 'track'
}

function isFullTrack(
  track: Track | { id: number; kind: 'track' }
): track is Track {
  return 'title' in track && 'duration' in track
}

async function resolveTrack(id: number): Promise<Track> {
  const url = `https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/${encodeURIComponent(
    id
  )}`
  const response = await fetch(url)
  const html = await response.text()

  const regex = /{"id":337,"data":\[({.*})\]}/
  const match = regex.exec(html)
  if (!match) throw Error(`unable to find data for track id: ${id}`)
  const data: Track = JSON.parse(match[1])
  return data
}

async function formatTrack(
  track: Track | { id: number; kind: 'track' },
  i: number
): Promise<{ position: string; title: string; duration: string }> {
  const position = String(i + 1)
  if (isFullTrack(track))
    return {
      position,
      title: track.title,
      duration: formatMilliseconds(track.full_duration),
    }

  const info = await resolveTrack(track.id)
  return {
    position,
    title: info.title,
    duration: formatMilliseconds(info.full_duration),
  }
}

export async function formatRelease(
  release: Track | Playlist,
  html?: string
): Promise<Release> {
  const date = html
    ? extractReleaseDate(release.permalink_url, html)
    : await getReleaseDate(release)

  let type
  let tracks
  if (isTrack(release)) {
    type = 'single'
    tracks = [
      {
        position: '1',
        title: release.title,
        duration: formatMilliseconds(release.duration),
      },
    ]
  } else {
    tracks = await Bluebird.map(release.tracks, (track, i) =>
      formatTrack(track, i)
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
    title: release.title,
    format: 'digital file',
    attributes: ['streaming'],
    date,
    link: release.permalink_url,
    type,
    tracks,
  }
}
