import React, { FunctionComponent } from 'react'

import ArtistButton from '../ArtistButton'
import { Artist } from '../../../lib/api/aws'

type ArtistsTabProps = {
  artists: Artist[]
}

const ArtistsTab: FunctionComponent<ArtistsTabProps> = ({ artists }) => (
  <div>
    {artists.map(artist => (
      <ArtistButton artist={artist} />
    ))}
  </div>
)

export default ArtistsTab
