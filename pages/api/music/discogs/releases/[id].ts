import { NextApiRequest, NextApiResponse } from 'next'

import { first } from 'lib/array'
import { release } from 'lib/api/discogs'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { id } = req.query
  const response = await release(first(id))
  res.status(200).json(response)
}
