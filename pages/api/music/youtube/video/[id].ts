import { NextApiRequest, NextApiResponse } from 'next'

import { first } from 'lib/array'
import { video } from 'lib/api/youtube'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { id } = req.query
  const response = await video(first(id))
  res.status(200).json(response)
}
