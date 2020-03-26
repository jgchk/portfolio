import S3 from 'aws-sdk/clients/s3'
import nanoid from 'nanoid'
import Promise from 'bluebird'

import { notEmpty } from '../../types'
import { oneDay } from '../../time'
import Cache from './db'

export interface Cover {
  id: string
  fileType: string
  url: string
}
export interface Track {
  id: string
  num: string
  title: string
  fileType: string
  url: string
}
export interface Album {
  id: string
  title: string
  tracks: Track[]
  cover: Cover | null
}
export interface Artist {
  id: string
  name: string
  albums: Album[]
}
export interface Library {
  artists: Artist[]
}

const db = new Cache(oneDay)

async function cache(library: Library): Promise<void> {
  const artistIds: string[] = await Promise.map(
    library.artists,
    async artist => {
      const { albums, ...artistWithoutAlbums } = artist

      const albumIds: string[] = await Promise.map(albums, async album => {
        const { tracks, ...albumWithoutTracks } = album

        const trackIds: string[] = await Promise.map(tracks, async track => {
          await db.set(track.id, track)
          return track.id
        })

        await db.set(album.id, { ...albumWithoutTracks, trackIds })
        return album.id
      })

      await db.set(artist.id, { ...artistWithoutAlbums, albumIds })
      return artist.id
    }
  )
  await db.set('artistIds', artistIds)
}

async function uncache(): Promise<Library | null> {
  console.log('uncache')
  const artistIds = await db.get('artistIds')
  if (artistIds === null || artistIds === undefined) return null

  const artists: Artist[] = (
    await Promise.map(artistIds, async (artistId: string) => {
      const { albumIds, ...artistWithoutAlbums } = await db.get(artistId)

      const albums = await Promise.map(albumIds, async (albumId: string) => {
        const { trackIds, ...albumWithoutTracks } = await db.get(albumId)

        const tracks = await Promise.map(trackIds, async (trackId: string) =>
          db.get(trackId)
        )

        return { ...albumWithoutTracks, tracks }
      })

      return { ...artistWithoutAlbums, albums }
    })
  ).filter(notEmpty)
  return { artists }
}

const Bucket = 'jake.cafe-music'
const s3 = new S3({
  apiVersion: '2006-03-01',
  accessKeyId: process.env.AWS_ID || '',
  secretAccessKey: process.env.AWS_SECRET || '',
})

function makeUrl(path: string): string {
  return s3.getSignedUrl('getObject', { Bucket, Key: path })
}

function getCover(path: string): Cover | null {
  const [, , cover] = path.split('/')
  const regex = /(cover)\.(.+)/
  const match = regex.exec(cover)
  if (!match) return null
  return {
    id: nanoid(),
    fileType: match[2],
    url: makeUrl(path),
  }
}

function trackInfo(path: string): Track | null {
  const [, , track] = path.split('/')
  const regex = /(\d+)\s+(.+)\.(.+(?!\.)+)+$/
  const match = regex.exec(track)
  if (!match) return null
  return {
    id: nanoid(),
    num: match[1],
    title: match[2],
    fileType: match[3],
    url: makeUrl(path),
  }
}

export default async function getLibrary(): Promise<Library> {
  const cachedLibrary = await uncache()
  if (cachedLibrary) return cachedLibrary

  const map: { [k: string]: { [k: string]: string[] } } = {}

  let continuationToken = null
  do {
    const params: S3.Types.ListObjectsV2Request = { Bucket }
    if (continuationToken !== null) params.ContinuationToken = continuationToken

    /* we have to await in this loop because we
     * need the continuationToken for each
     * successive call. thank the AWS API designers */
    /* eslint-disable-next-line no-await-in-loop */
    const response: S3.Types.ListObjectsV2Output = await s3
      .listObjectsV2(params)
      .promise()
    continuationToken = response.NextContinuationToken
    const contents = response.Contents || []

    contents.forEach(obj => {
      if (!obj.Key) return
      const [artist, album] = obj.Key.split('/')
      const albumTrackMap = map[artist] || {}
      const tracks = albumTrackMap[album] || []
      albumTrackMap[album] = tracks.concat(obj.Key)
      map[artist] = albumTrackMap
    })
  } while (continuationToken)

  const artists = Object.entries(map).map(([artistName, albums]) => {
    const artist: Artist = {
      id: nanoid(),
      name: artistName,
      albums: Object.entries(albums).map(([albumTitle, tracks]) => {
        const album: Album = {
          id: nanoid(),
          title: albumTitle,
          tracks: tracks.map(track => trackInfo(track)).filter(notEmpty),
          cover: tracks.map(track => getCover(track)).find(notEmpty) || null,
        }
        return album
      }),
    }
    return artist
  })

  const library: Library = { artists }
  await cache(library)
  return library
}
