import { NextApiRequest, NextApiResponse } from 'next'

import { first, asArray } from 'lib/array'
import { search, isSearchTypes } from 'lib/api/spotify'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { q, type } = req.query
  const types = asArray(type)

  if (isSearchTypes(types)) {
    const response = await search(first(q), types)
    res.status(200).json(response)
  } else {
    res
      .status(400)
      .json({ error: 'type must be one of: album, artist, playlist, track' })
  }
}
