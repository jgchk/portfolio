import React, {
  FunctionComponent,
  useCallback,
  useState,
  useEffect,
  useRef,
} from 'react'

import ArtistButton from '../ArtistButton'
import { Artist } from '../../../lib/api/aws'
import styles from './styles.less'

type ArtistsTabProps = {
  artists: Artist[]
}

const ArtistsTab: FunctionComponent<ArtistsTabProps> = ({ artists }) => {
  const [expanded, setExpanded] = useState<string | null>(null)
  const onClick = useCallback(
    id => {
      if (expanded === id) setExpanded(null)
      else setExpanded(id)
    },
    [expanded]
  )

  const ref = useRef<HTMLDivElement>(null)
  const getWidth = useCallback(() => {
    const el = ref.current
    return el ? el.offsetWidth : 0
  }, [])
  const [width, setWidth] = useState(getWidth())
  useEffect(() => {
    const updateWidth = (): void => setWidth(getWidth())
    window.addEventListener('resize', updateWidth)
    updateWidth()
    return (): void => window.removeEventListener('resize', updateWidth)
  })

  return (
    <div className={styles.container} ref={ref}>
      {artists.map(artist => (
        <ArtistButton
          key={artist.id}
          artist={artist}
          expanded={expanded === artist.id}
          onClick={(): void => onClick(artist.id)}
          windowWidth={width}
        />
      ))}
    </div>
  )
}

export default ArtistsTab
