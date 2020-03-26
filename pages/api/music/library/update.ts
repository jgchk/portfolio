import { NextApiRequest, NextApiResponse } from 'next'
import Promise from 'bluebird'

import updateLibrary from 'lib/api/library'

export default (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  return updateLibrary().then(() => res.status(200).json({ success: true }))
}
