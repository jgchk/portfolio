import { NextApiRequest, NextApiResponse } from 'next'

import { first } from 'lib/array'
import { search } from 'lib/api/youtube'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { q } = req.query
  const response = await search(first(q))
  res.status(200).json(response)
}
