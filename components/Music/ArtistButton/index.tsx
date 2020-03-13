import React, { FunctionComponent } from 'react'

import { Artist } from '../../../lib/api/aws'
import styles from './styles.less'

type ArtistButtonProps = {
  artist: Artist
}

const ArtistButton: FunctionComponent<ArtistButtonProps> = ({ artist }) => (
  <button className={styles.button} type='button'>
    {artist.name}
  </button>
)

export default ArtistButton
