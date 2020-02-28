import { NextApiRequest, NextApiResponse } from 'next'
import Promise from 'bluebird'

import { getArtistAlbumMap } from 'lib/api/aws'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const all = await getArtistAlbumMap()
  res.status(200).send(all)
}
