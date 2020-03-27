import { NextApiRequest, NextApiResponse } from 'next'
import Promise from 'bluebird'

import { getUrl } from 'lib/api/aws/s3'
import { first } from 'lib/array'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { path } = req.query
  const url = await getUrl(first(path))
  res.status(200).json(url)
}
