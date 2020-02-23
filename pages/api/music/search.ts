import { NextApiRequest, NextApiResponse } from 'next'
import Promise from 'bluebird'

import { first, asArray } from 'lib/array'
import apis, { apiMap } from 'lib/api'
import { isSearchable } from 'lib/api/type'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { title, artist, limit, source, haveSource } = req.query
  const sources = source
    ? asArray(source).map(s => s.toLowerCase())
    : apis.map(api => api.name.toLowerCase())
  const haveSources = haveSource
    ? asArray(haveSource).map(s => s.toLowerCase())
    : []
  const filteredSources = sources.filter(s => !haveSources.includes(s))

  const responses = await Promise.map(filteredSources, async s => {
    const api = apiMap[s]
    if (!isSearchable(api)) return {}
    if (sources && !sources.includes(api.name.toLowerCase())) return {}
    const results = await api.search(
      first(title),
      first(artist),
      parseInt(first(limit), 10) || 1
    )
    return { [api.name.toLowerCase()]: results }
  })

  res.status(200).json(Object.assign({}, ...responses))
}
