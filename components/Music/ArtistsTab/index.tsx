import React, { FunctionComponent } from 'react'

import ArtistButton from '../ArtistButton'
import { Artist } from '../../../lib/api/aws'
import styles from './styles.less'

type ArtistsTabProps = {
  artists: Artist[]
}

const ArtistsTab: FunctionComponent<ArtistsTabProps> = ({ artists }) => (
  <div className={styles.container}>
    {artists.map(artist => (
      <ArtistButton key={artist.id} artist={artist} />
    ))}
  </div>
)

export default ArtistsTab
