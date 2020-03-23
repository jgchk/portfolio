import { NextApiRequest, NextApiResponse } from 'next'

import { filterClientIds } from '../../../lib/api/aws/rds'
import { first } from '../../../lib/array'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const params = {
    used: first(req.query.used),
    expired: first(req.query.expired),
  }
  const query = {
    used: params.used ? params.used.toLowerCase() === 'true' : undefined,
    expired: params.expired
      ? params.expired.toLowerCase() === 'true'
      : undefined,
  }
  const response = await filterClientIds(query)
  res.status(200).json(response)
}
