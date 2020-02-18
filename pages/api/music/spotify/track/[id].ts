import { NextApiRequest, NextApiResponse } from 'next'

import { first } from 'lib/array'
import { track } from 'lib/api/spotify'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { id } = req.query
  const response = await track(first(id))
  res.status(200).json(response)
}
