import S3 from 'aws-sdk/clients/s3'
import { IS3Options, makeTokenizer } from '@tokenizer/s3'
import { parseFromTokenizer } from 'music-metadata/lib/core'
import { IOptions, IAudioMetadata } from 'music-metadata'
import Promise from 'bluebird'
import { fromTokenizer, FileTypeResult } from 'file-type'

import { isTemp } from '../../file'

const Bucket = 'jake.cafe-music'
const s3 = new S3({
  apiVersion: '2006-03-01',
  accessKeyId: process.env.AWS_ID || '',
  secretAccessKey: process.env.AWS_SECRET || '',
})

export async function* getObjects(): AsyncGenerator<S3.Types.Object> {
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
    /* eslint-disable-next-line no-restricted-syntax */
    for (const item of contents) {
      yield item
    }
  } while (continuationToken)
}

export async function getFileType(
  objRequest: S3.GetObjectRequest,
  options?: IS3Options & IOptions
): Promise<FileTypeResult | undefined> {
  const s3Tokenizer = await makeTokenizer(s3, objRequest, options)
  return fromTokenizer(s3Tokenizer)
}

export async function getMusicMetadata(
  objRequest: S3.GetObjectRequest,
  options?: IS3Options & IOptions
): Promise<IAudioMetadata | null> {
  const s3Tokenizer = await makeTokenizer(s3, objRequest, options)
  return parseFromTokenizer(s3Tokenizer, options)
}

function getMimeType(fileType: FileTypeResult): string {
  const { mime } = fileType
  return mime.split('/')[0]
}

export interface ObjectMetadata {
  type: string
  meta?: IAudioMetadata
}

export async function getObjectMetadata(
  obj: S3.Types.Object
): Promise<ObjectMetadata | undefined> {
  if (!obj.Key) return undefined
  if (isTemp(obj.Key)) return undefined

  const params = { Bucket, Key: obj.Key }
  const fileType = await getFileType(params)
  if (!fileType) return undefined

  const mimeType = getMimeType(fileType)
  const res: ObjectMetadata = { type: mimeType }
  if (mimeType === 'audio') {
    const meta = await getMusicMetadata({
      Bucket,
      Key: obj.Key,
    })
    if (meta) res.meta = meta
  }

  return res
}
