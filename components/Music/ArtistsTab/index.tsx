import React, {
  FunctionComponent,
  useCallback,
  useState,
  useRef,
  useMemo,
  useEffect,
} from 'react'

import useScrollPosition from '../../../hooks/useScrollPosition'
import useDimensions from '../../../hooks/useDimensions'

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

  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollPos = useScrollPosition(scrollRef, false)

  const containerRef = useRef<HTMLDivElement>(null)
  const dimensions = useDimensions(containerRef, false)

  const getExpansionOffset = useCallback(
    (
      numAlbums: number,
      dims: { left: number; top: number; width: number; height: number }
    ) => {
      const { width } = dimensions
      const buttonCenter = dims.left + dims.width / 2

      const albumWidth = 128 + 2 * 4
      const albumsWidth = numAlbums * albumWidth

      let albumsHeight = 0
      if (width !== 0) {
        const rows = Math.ceil(albumsWidth / width)
        const albumHeight = 128 + 32 + 2 * 4
        albumsHeight = rows * albumHeight
      }

      const albumsLeft = buttonCenter - albumsWidth / 2
      const albumsRight = buttonCenter + albumsWidth / 2

      const rightOvershoot = Math.max(albumsRight - width, 0)
      const maxLeft = albumsLeft - rightOvershoot

      const leftOffset = rightOvershoot > 0 ? maxLeft : Math.max(4, albumsLeft)
      const topOffset = dims.top + dims.height + 4 - scrollPos.y

      return {
        left: leftOffset,
        top: topOffset,
        width: albumsWidth,
        maxWidth: width,
        height: albumsHeight,
      }
    },
    [dimensions, scrollPos.y]
  )

  const [show, setShow] = useState(false)
  useEffect(() => setShow(true), [])

  const buttons = useMemo(() => {
    if (!show) return []
    return artists.map(artist => {
      return (
        <ArtistButton
          key={artist.id}
          artist={artist}
          expanded={false}
          getExpansionOffset={undefined}
          onClick={onClick}
        />
      )
    })
  }, [artists, onClick, show])

  const buttonsWithExpanded = useMemo(() => {
    return buttons.map(button => {
      if (button.key === expanded)
        return React.cloneElement(button, {
          expanded: true,
          getExpansionOffset,
        })
      return button
    })
  }, [buttons, expanded, getExpansionOffset])

  return (
    <div className={styles.scroll} ref={scrollRef}>
      <div className={styles.container} ref={containerRef}>
        {buttonsWithExpanded}
      </div>
    </div>
  )
}

export default ArtistsTab
