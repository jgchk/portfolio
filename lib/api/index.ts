import bandcamp from './bandcamp'
import discogs from './discogs'
import soundcloud from './soundcloud'
import spotify from './spotify'
import youtube from './youtube'

const apis = [bandcamp, discogs, soundcloud, spotify, youtube]
export default apis

export const apiMap = Object.assign(
  {},
  ...apis.map(api => ({ [api.name.toLowerCase()]: api }))
)
