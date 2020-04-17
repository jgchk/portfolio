import { NextApiRequest, NextApiResponse } from 'next'
import Promise from 'bluebird'

import { first, asArray } from 'lib/array'
import apis from 'lib/api/streaming'
import { isSearchable, isSearchType, Release } from 'lib/api/streaming/type'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { title, artist, limit, type, source, haveSource } = req.query
  const sources = source
    ? asArray(source).map(s => s.toLowerCase())
    : Object.keys(apis)
  const haveSources = haveSource
    ? asArray(haveSource).map(s => s.toLowerCase())
    : []
  const filteredSources = sources.filter(s => !haveSources.includes(s))

  const searchType = type ? first(type) : 'album'
  if (!isSearchType(searchType)) {
    res.status(400).json({ error: 'type must be one of: "album", "track"' })
    return
  }

  const responses = await Promise.map(filteredSources, async src => {
    const api = apis[src]
    if (!api) return {}
    if (!isSearchable(api)) return {}

    let results: Release[] = []
    try {
      results = await api.search(
        first(title),
        first(artist),
        searchType,
        parseInt(first(limit), 10) || 1
      )
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.log(e)
    }
    return { [src]: results }
  })

  res.status(200).json(Object.assign({}, ...responses))
}
