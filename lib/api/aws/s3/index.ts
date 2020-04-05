import { IS3Options, makeTokenizer } from '@tokenizer/s3'
import { fromTokenizer, FileTypeResult } from 'file-type'
import { Object as S3Object, GetObjectRequest } from 'aws-sdk/clients/s3'
import { IAudioMetadata } from 'music-metadata'

import { Bucket, s3, getMusicMetadata } from './core'
import { isTemp } from '../../../file'

export * from './core'

export async function getFileType(
  objRequest: GetObjectRequest,
  options?: IS3Options
): Promise<FileTypeResult | undefined> {
  const s3Tokenizer = await makeTokenizer(s3, objRequest, options)
  return fromTokenizer(s3Tokenizer)
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
  obj: S3Object
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
