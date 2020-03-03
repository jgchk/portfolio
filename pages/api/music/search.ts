import { NextApiRequest, NextApiResponse } from 'next'
import Promise from 'bluebird'

import { first, asArray } from 'lib/array'
import apis, { apiMap } from 'lib/api/streaming'
import { isSearchable, isSearchType, Release } from 'lib/api/streaming/type'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { title, artist, limit, type, source, haveSource } = req.query
  const sources = source
    ? asArray(source).map(s => s.toLowerCase())
    : apis.map(api => api.name.toLowerCase())
  const haveSources = haveSource
    ? asArray(haveSource).map(s => s.toLowerCase())
    : []
  const filteredSources = sources.filter(s => !haveSources.includes(s))

  const searchType = type ? first(type) : 'album'
  if (!isSearchType(searchType)) {
    res.status(400).json({ error: 'type must be one of: "album", "track"' })
    return
  }

  const responses = await Promise.map(filteredSources, async s => {
    const api = apiMap[s]
    if (!isSearchable(api)) return {}
    if (sources && !sources.includes(api.name.toLowerCase())) return {}

    let results: Release[] = []
    try {
      results = await api.search(
        first(title),
        first(artist),
        searchType,
        parseInt(first(limit), 10) || 1
      )
    } catch (e) {
      console.log(e)
    }
    return { [api.name.toLowerCase()]: results }
  })

  res.status(200).json(Object.assign({}, ...responses))
}
