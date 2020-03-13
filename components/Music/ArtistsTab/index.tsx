import React, { FunctionComponent, useCallback, useState, useRef } from 'react'

import ArtistButton from '../ArtistButton'
import { Artist } from '../../../lib/api/aws'
import styles from './styles.less'

type ArtistsTabProps = {
  artists: Artist[]
  dimensions: { width: number }
  scrollPosition: { y: number }
}

const ArtistsTab: FunctionComponent<ArtistsTabProps> = ({
  artists,
  dimensions,
  scrollPosition,
}) => {
  const [expanded, setExpanded] = useState<string | null>(null)
  const onClick = useCallback(
    id => {
      if (expanded === id) setExpanded(null)
      else setExpanded(id)
    },
    [expanded]
  )

  return (
    <div className={styles.container}>
      {artists.map(artist => (
        <ArtistButton
          key={artist.id}
          artist={artist}
          expanded={expanded === artist.id}
          onClick={(): void => onClick(artist.id)}
          windowWidth={dimensions.width}
          scrollPosition={scrollPosition.y}
        />
      ))}
    </div>
  )
}

export default ArtistsTab
