import S3 from 'aws-sdk/clients/s3'

const Bucket = 'jake.cafe-music'

const s3 = new S3({ apiVersion: '2006-03-01' })
s3.config.credentials = {
  accessKeyId: process.env.AWS_ID || '',
  secretAccessKey: process.env.AWS_SECRET || '',
}

function notNull(str: string | null): str is string {
  return !!str
}

export async function getArtists(): Promise<string[]> {
  const response = await s3.listObjectsV2({ Bucket, Delimiter: '/' }).promise()
  const contents = response.CommonPrefixes || []
  return contents
    .map(prefixObj => {
      const prefix = prefixObj.Prefix
      if (!prefix) return null
      return prefix.substring(0, prefix.length - 1)
    })
    .filter(notNull)
}

export async function getAlbums(artist: string): Promise<string[]> {
  const Prefix = `${artist}/`
  const response = await s3
    .listObjectsV2({ Bucket, Delimiter: '/', Prefix })
    .promise()
  const contents = response.CommonPrefixes || []
  return contents
    .map(prefixObj => {
      const prefix = prefixObj.Prefix
      if (!prefix) return null
      return prefix.substring(Prefix.length, prefix.length - 1)
    })
    .filter(notNull)
}

export type ArtistAlbumMap = Record<string, AlbumTrackMap>
export type AlbumTrackMap = Record<string, string[]>
export async function getArtistAlbumMap(): Promise<ArtistAlbumMap> {
  const response = await s3.listObjectsV2({ Bucket }).promise()
  const contents = response.Contents || []

  const map: ArtistAlbumMap = {}
  contents.forEach(obj => {
    if (!obj.Key) return
    const [artist, album, track] = obj.Key.split('/')
    const albumTrackMap = map[artist] || {}
    const tracks = albumTrackMap[album] || []
    albumTrackMap[album] = tracks.concat(track)
    map[artist] = albumTrackMap
  })
  return map
}
