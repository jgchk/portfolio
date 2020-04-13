import { NextApiRequest, NextApiResponse } from 'next'
import Promise from 'bluebird'

import { first } from 'lib/array'
import apis from 'lib/api/streaming'
import { isResolvable } from 'lib/api/streaming/type'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const url = first(req.query.url)

  const responses = await Promise.map(Object.values(apis), async api => {
    if (!isResolvable(api)) return {}
    if (!api.test(url)) return {}
    const result = await api.resolve(url)
    return { [api.name.toLowerCase()]: result }
  })

  res.status(200).json(Object.assign({}, ...responses))
}
