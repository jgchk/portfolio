import { NextApiRequest, NextApiResponse } from 'next'

import { first } from 'lib/array'
import { resolve } from 'lib/api/soundcloud'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { url } = req.query
  const response = await resolve(first(url))
  res.status(200).json(response)
}
