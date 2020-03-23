import { NextApiRequest, NextApiResponse } from 'next'

import { editClientId } from '../../../lib/api/aws/rds'
import { first } from '../../../lib/array'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const clientId = first(req.query.clientId)

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

  const response = await editClientId(clientId, query)
  res.status(200).json(response)
}
