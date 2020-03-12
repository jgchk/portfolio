import { NextApiRequest, NextApiResponse } from 'next'
import Promise from 'bluebird'

import getLibrary from 'lib/api/aws'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const all = await getLibrary()
  res.status(200).send(all)
}
