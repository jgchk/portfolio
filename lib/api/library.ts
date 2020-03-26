import Promise from 'bluebird'
import toArray from '@async-generators/to-array'
import { IAudioMetadata } from 'music-metadata'
import { Object as S3Object, ObjectKey } from 'aws-sdk/clients/s3'

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
    console.log('META: ', `${trackMeta.albumartist} - ${trackMeta.title}`)
    return trackMeta
  }
  return null
}

export default async function updateLibrary(): Promise<void> {
  const objects = await toArray(getObjects())
  const partitions = partition(objects, 25)

  await Promise.each(partitions, async (part, i) => {
    const tracks = (await Promise.map(part, getTrackMetadata)).filter(notEmpty)
    await updateTracks(tracks)
    console.log(
      'BATCH DONE: ',
      `${i + 1} / ${partitions.length} (${Math.round(
        (10 * 100 * (i + 1)) / partitions.length
      ) / 10}%)`
    )
  })
}
