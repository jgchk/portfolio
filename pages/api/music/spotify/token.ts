import { NextApiRequest, NextApiResponse } from 'next'

import { first } from 'lib/array'
import { token } from 'lib/api/spotify'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { code } = req.query
  const response = await token(first(code))
  res.status(200).json(response)
}
