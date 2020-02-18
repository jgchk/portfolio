import { NextApiRequest, NextApiResponse } from 'next'

import { first } from 'lib/array'
import { album } from 'lib/api/bandcamp'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { url } = req.query
  const response = await album(first(url))
  res.status(200).json(response)
}
