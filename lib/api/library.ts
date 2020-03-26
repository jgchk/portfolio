import Promise from 'bluebird'
import toArray from '@async-generators/to-array'
import { IAudioMetadata } from 'music-metadata'
import { Object as S3Object, ObjectKey } from 'aws-sdk/clients/s3'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { getObjects, getObjectMetadata } from './aws/s3'
import DynamoDB from './aws/db'
import { partition } from '../array'
import { notEmpty } from '../types'

const db = new DynamoDB()

interface TrackMetadata {
  id: string
  title?: string
  no: number
  album?: string
  albumartist?: string
  artists?: string[]
  date?: string
  path?: ObjectKey
}

function isTrackMetadata(
  obj: DocumentClient.AttributeMap
): obj is TrackMetadata {
  return typeof obj === 'object' && 'id' in obj && 'no' in obj
}

const makeTrackMeta = (
  obj: S3Object,
  objMeta: IAudioMetadata
): TrackMetadata => ({
  id: `${objMeta.common.albumartist} - ${objMeta.common.album} - ${objMeta.common.track.no} ${objMeta.common.title}`,
  title: objMeta.common.title,
  no: objMeta.common.track.no,
  album: objMeta.common.album,
  albumartist: objMeta.common.albumartist,
  artists: objMeta.common.artists,
  date: objMeta.common.date,
  path: obj.Key,
})

async function updateTracks(tracks: TrackMetadata[]): Promise<void> {
  await db.batchPut(tracks)
}

async function getTrackMetadata(obj: S3Object): Promise<TrackMetadata | null> {
  const objMeta = await getObjectMetadata(obj)
  if (objMeta) {
    const trackMeta = makeTrackMeta(obj, objMeta)
    /* eslint-disable-next-line no-console */
    console.log('META: ', `${trackMeta.albumartist} - ${trackMeta.title}`)
    return trackMeta
  }
  return null
}

export async function updateLibrary(): Promise<void> {
  const objects = await toArray(getObjects())
  const partitions = partition(objects, 25)

  await Promise.each(partitions, async (part, i) => {
    const tracks = (await Promise.map(part, getTrackMetadata)).filter(notEmpty)
    await updateTracks(tracks)
    /* eslint-disable-next-line no-console */
    console.log(
      'BATCH DONE: ',
      `${i + 1} / ${partitions.length} (${Math.round(
        (10 * 100 * (i + 1)) / partitions.length
      ) / 10}%)`
    )
  })
}

export interface Track {
  id: string
  title?: string
  no: number
  album?: Album
  albumArtist?: Artist
  artists?: Artist[]
  date?: Date
  path?: ObjectKey
}

export interface Album {
  id: string
  title: string
  artist: Artist
  tracks: Track[]
  date: Date
}

export interface Artist {
  id: string
  name: string
  tracks: Track[]
  albums: Album[]
}

export interface Library {
  artists: Artist[]
  albums: Album[]
  tracks: Track[]
}

function makeAlbumId(trackMeta: TrackMetadata): string {
  return `${trackMeta.albumartist} - ${trackMeta.album}`
}

export async function getLibrary(): Promise<Library> {
  const response = await db.getAll()
  if (!response) throw Error('No track data!')

  const tracksMeta: TrackMetadata[] = response.filter(isTrackMetadata)

  const artists: { [id: string]: Artist } = {}
  const albums: { [id: string]: Album } = {}
  const tracks: { [id: string]: Track } = {}

  tracksMeta.forEach(trackMeta => {
    const albumArtistId = trackMeta.albumartist
    const albumArtist: Artist | undefined = albumArtistId
      ? artists[albumArtistId] || {
          id: albumArtistId,
          name: trackMeta.albumartist,
          tracks: [],
          albums: [],
        }
      : undefined

    const trackArtists: Artist[] | undefined = trackMeta.artists
      ? trackMeta.artists.map(artistName => {
          const artistId = artistName
          const artist: Artist = artists[artistId] || {
            id: artistName,
            name: artistName,
            tracks: [],
            albums: [],
          }
          return artist
        })
      : undefined

    const albumId = makeAlbumId(trackMeta)
    const album: Album = albums[albumId] || {
      id: albumId,
      title: trackMeta.album,
      artist: albumArtist,
      tracks: [],
      date: trackMeta.date ? new Date(trackMeta.date) : null,
    }

    const track: Track = {
      id: trackMeta.id,
      title: trackMeta.title,
      no: trackMeta.no,
      album,
      albumArtist,
      artists: trackArtists,
      date: trackMeta.date ? new Date(trackMeta.date) : undefined,
      path: trackMeta.path,
    }

    tracks[track.id] = track

    album.tracks.push(track)
    albums[album.id] = album

    if (trackArtists)
      trackArtists.forEach(trackArtist => {
        trackArtist.tracks.push(track)
        artists[trackArtist.id] = trackArtist
      })

    if (albumArtist) {
      albumArtist.tracks.push(track)
      albumArtist.albums.push(album)
      artists[albumArtist.id] = albumArtist
    }
  })

  return {
    artists: Object.values(artists),
    albums: Object.values(albums),
    tracks: Object.values(tracks),
  }
}
