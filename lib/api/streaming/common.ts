type ReleaseType = 'single' | 'ep' | 'album'
/* eslint-disable-next-line import/prefer-default-export */
export function getTypeFromTracks(numTracks: number): ReleaseType {
  if (numTracks < 3) return 'single'
  if (numTracks < 7) return 'ep'
  return 'album'
}
