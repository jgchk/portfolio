import React, { FunctionComponent } from 'react'

import { Artist } from '../../../lib/api/aws'

type ArtistButtonProps = {
  artist: Artist
}

const ArtistButton: FunctionComponent<ArtistButtonProps> = ({ artist }) => (
  <button type='button'>{artist.name}</button>
)

export default ArtistButton
