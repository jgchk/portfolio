import { NextApiRequest, NextApiResponse } from 'next'
import Promise from 'bluebird'

import { first } from 'lib/array'
import apis from 'lib/api'
import { isSearchable } from 'lib/api/type'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { title, artist, limit } = req.query

  const responses = await Promise.map(apis, async api => {
    if (!isSearchable(api)) return {}
    const results = await api.search(
      first(title),
      first(artist),
      parseInt(first(limit), 10) || 10
    )
    return { [api.name.toLowerCase()]: results }
  })

  res.status(200).json(Object.assign({}, ...responses))
}
