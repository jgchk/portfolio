import Bluebird from 'bluebird'
import toArray from '@async-generators/to-array'
import { IAudioMetadata } from 'music-metadata'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { getObjects, getObjectMetadata } from './aws/s3'
import DynamoDB from './aws/db'
import { partition } from '../array'

const trackDb = new DynamoDB('tracks')
const coverDb = new DynamoDB('covers')

interface TrackMetadata {
  title?: string
  no: number
  album?: string
  albumartist?: string
  artists?: string[]
  date?: string
  s3path: string
}

interface CoverMetadata {
  s3path: string
}

function isTrackMetadata(
  obj: DocumentClient.AttributeMap
): obj is TrackMetadata {
  return typeof obj === 'object' && 'no' in obj && 's3path' in obj
}

const makeTrackMeta = (
  path: string,
  objMeta: IAudioMetadata
): TrackMetadata => ({
  title: objMeta.common.title,
  no: objMeta.common.track.no,
  album: objMeta.common.album,
  albumartist: objMeta.common.albumartist,
  artists: objMeta.common.artists,
  date: objMeta.common.date,
  s3path: path,
})

async function updateTracks(tracks: TrackMetadata[]): Promise<void> {
  if (tracks.length > 0) await trackDb.batchPut(tracks)
}

async function updateCovers(covers: CoverMetadata[]): Promise<void> {
  if (covers.length > 0) await coverDb.batchPut(covers)
}

export async function updateLibrary(): Promise<void> {
  const objects = await toArray(getObjects())
  const partitions = partition(objects, 25)

  await Bluebird.each(partitions, async (part, i) => {
    const tracks: TrackMetadata[] = []
    const covers: CoverMetadata[] = []

    await Bluebird.all(
      part.map(async obj => {
        const objMeta = await getObjectMetadata(obj)
        if (!objMeta) return

        if (objMeta.type === 'audio') {
          if (!obj.Key) return
          if (!objMeta.meta) return
          const trackMeta = makeTrackMeta(obj.Key, objMeta.meta)
          tracks.push(trackMeta)

          /* eslint-disable-next-line no-console */
          console.log('META: ', `${trackMeta.albumartist} - ${trackMeta.title}`)
        } else if (objMeta.type === 'image') {
          if (!obj.Key) return
          covers.push({ s3path: obj.Key })

          /* eslint-disable-next-line no-console */
          console.log('COVER: ', obj.Key)
        }
      })
    )

    await updateTracks(tracks)
    await updateCovers(covers)

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
  path?: string
  coverPath: string
}

export interface Album {
  id: string
  title: string
  artist: Artist
  tracks: Track[]
  date: Date
  path: string
  coverPath: string
}

export interface Artist {
  id: string
  name: string
  tracks: Track[]
  albums: Album[]
  path: string
}

export interface Library {
  artists: Artist[]
  albums: Album[]
  tracks: Track[]
}

function makeTrackId(trackMeta: TrackMetadata): string {
  return `${trackMeta.albumartist} - ${trackMeta.album} - ${trackMeta.no} ${trackMeta.title}`
}

function makeAlbumId(trackMeta: TrackMetadata): string {
  return `${trackMeta.albumartist} - ${trackMeta.album}`
}

async function getCoverPath(albumPath: string): Promise<string | undefined> {
  const covers = await coverDb.filter({
    column: 's3path',
    startsWith: albumPath,
  })
  if (covers && covers.length > 0) return covers[0].s3path
  return undefined
}

export async function getLibrary(): Promise<Library> {
  const response = await trackDb.getAll()
  if (!response) throw Error('No track data!')

  const tracksMeta: TrackMetadata[] = response.filter(isTrackMetadata)

  const artists: { [id: string]: Artist } = {}
  const albums: { [id: string]: Album } = {}
  const tracks: { [id: string]: Track } = {}

  await Bluebird.each(tracksMeta, async trackMeta => {
    const [artistPathElement, albumPathElement] = trackMeta.s3path.split('/')
    const artistPath = `${artistPathElement}`
    const albumPath = `${artistPath}/${albumPathElement}`

    const albumArtistId = trackMeta.albumartist
    const albumArtist: Artist | undefined = albumArtistId
      ? artists[albumArtistId] || {
          id: trackMeta.albumartist,
          name: trackMeta.albumartist,
          tracks: [],
          albums: [],
          path: artistPath,
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
      path: albumPath,
      coverPath: await getCoverPath(albumPath),
    }

    const track: Track = {
      id: makeTrackId(trackMeta),
      title: trackMeta.title,
      no: trackMeta.no,
      album,
      albumArtist,
      artists: trackArtists,
      date: trackMeta.date ? new Date(trackMeta.date) : undefined,
      path: trackMeta.s3path,
      coverPath: album.coverPath,
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
      if (!albumArtist.path) albumArtist.path = artistPath
      artists[albumArtist.id] = albumArtist
    }
  })

  return {
    artists: Object.values(artists),
    albums: Object.values(albums),
    tracks: Object.values(tracks),
  }
}
