import { NextApiRequest, NextApiResponse } from 'next'

import { first } from 'lib/array'
import { search } from 'lib/api/bandcamp'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { query } = req.query
  const response = await search(first(query))
  res.status(200).json(response)
}
