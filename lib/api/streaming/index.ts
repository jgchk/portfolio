import bandcamp from './bandcamp'
import discogs from './discogs'
import soundcloud from './soundcloud'
import spotify from './spotify'
import youtube from './youtube'
import applemusic from './applemusic'
import googleplay from './googleplay'
import beatport from './beatport'

import { Api } from './type'

const apis = [
  bandcamp,
  discogs,
  soundcloud,
  spotify,
  youtube,
  applemusic,
  googleplay,
  beatport,
]
const apiMap: Record<string, Api> = Object.assign(
  {},
  ...apis.map(api => ({ [api.name.replace(/ /g, '').toLowerCase()]: api }))
)

export default apiMap
