import { NextApiRequest, NextApiResponse } from 'next'

import { addClientId } from '../../../lib/api/aws/rds'
import { first } from '../../../lib/array'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const clientId = first(req.query.clientId)

  const response = await addClientId(clientId)
  res.status(200).json(response)
}
