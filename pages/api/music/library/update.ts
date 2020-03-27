import { NextApiRequest, NextApiResponse } from 'next'
import Promise from 'bluebird'

import { updateLibrary } from 'lib/api/library'

export default (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  res.status(200).json({ status: 'updating' })
  return updateLibrary()
    .then(() => res.status(200).json({ status: 'success' }))
    .catch(() => res.status(500).json({ status: 'failure' }))
}
