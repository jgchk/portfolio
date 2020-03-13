import S3 from 'aws-sdk/clients/s3'
import nanoid from 'nanoid'
import NodeCache from 'node-cache'

import { notEmpty } from '../types'

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

const oneDay = 24 * 60 * 60
const cache = new NodeCache({ stdTTL: oneDay })
const libraryKey = 'library'

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
  const regex = /(\d+)\s+([^.]+)\.(.+)/
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
  const cachedLibrary: Library | undefined = cache.get(libraryKey)
  if (cachedLibrary) {
    console.log('using cached library...')
    return cachedLibrary
  }
  console.log('retrieving new library...')

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
  cache.set(libraryKey, library)
  return library
}
