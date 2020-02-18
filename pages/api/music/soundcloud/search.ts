import { NextApiRequest, NextApiResponse } from 'next'

import { first } from 'lib/array'
import { search } from 'lib/api/soundcloud'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { q, type } = req.query
  const response = await search(first(q), first(type))
  res.status(200).json(response)
}
