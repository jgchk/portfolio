import React, { FunctionComponent } from 'react'

import ArtistButton from '../ArtistButton'
import { Artist } from '../../../lib/api/aws'

type ArtistsTabProps = {
  artists: Artist[]
}

const ArtistsTab: FunctionComponent<ArtistsTabProps> = ({ artists }) => (
  <div>
    {artists.map(artist => (
      <ArtistButton key={artist.id} artist={artist} />
    ))}
  </div>
)

export default ArtistsTab
