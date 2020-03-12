import S3 from 'aws-sdk/clients/s3'

export interface Cover {
  fileType: string
  path: string
}
export interface Track {
  num: string
  title: string
  fileType: string
  path: string
}
export interface Album {
  title: string
  tracks: Track[]
  cover: Cover
}
export interface Artist {
  name: string
  albums: Album[]
}

const Bucket = 'jake.cafe-music'

const s3 = new S3({ apiVersion: '2006-03-01' })
s3.config.credentials = {
  accessKeyId: process.env.AWS_ID || '',
  secretAccessKey: process.env.AWS_SECRET || '',
}

function getCover(path: string): Cover {
  const [, , cover] = path.split('/')
  const regex = /(cover)\.(.+)/
  const match = regex.exec(cover)
  if (!match) return null
  return {
    fileType: match[2],
    path,
  }
}

function trackInfo(path: string): Track {
  const [, , track] = path.split('/')
  const regex = /(\d+)\s+([^.]+)\.(.+)/
  const match = regex.exec(track)
  if (!match) return null
  return {
    num: match[1],
    title: match[2],
    fileType: match[3],
    path,
  }
}

export default async function getLibrary(): Promise<Artist[]> {
  const map = {}

  let continuationToken = null
  do {
    /* we have to await in this loop because we
     * need the continuationToken for each
     * successive call. thank the AWS API designers */
    /* eslint-disable-next-line no-await-in-loop */
    const response = await s3
      .listObjectsV2({ Bucket, ContinuationToken: continuationToken })
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

  return Object.entries(map).map(([artistName, albums]) => {
    const artist: Artist = {
      name: artistName,
      albums: Object.entries(albums).map(([albumTitle, tracks]) => {
        const album: Album = {
          title: albumTitle,
          tracks: tracks.map(track => trackInfo(track)).filter(info => !!info),
          cover: tracks.map(track => getCover(track)).find(cover => !!cover),
        }
        return album
      }),
    }
    return artist
  })
}
