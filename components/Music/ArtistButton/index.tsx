import React, {
  FunctionComponent,
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect,
  useLayoutEffect,
} from 'react'
import clsx from 'clsx'

import useDimensions from '../../../hooks/useDimensions'
import { Artist } from '../../../lib/api/library'
import AlbumButton from '../AlbumButton'
import styles from './styles.less'

type ArtistButtonProps = {
  artist: Artist
  expanded: boolean
  onClick: (id: string) => void
  getExpansionOffset?: (
    numAlbums: number,
    dims: { left: number; top: number; width: number; height: number }
  ) => {
    left: number
    top: number
    width: number
    maxWidth: number
    height: number
  }
}

const ArtistButton: FunctionComponent<ArtistButtonProps> = ({
  artist,
  expanded,
  onClick,
  getExpansionOffset,
}) => {
  const onClickWrapper = useCallback(() => onClick(artist.id), [
    artist.id,
    onClick,
  ])

  const buttonRef = useRef<HTMLButtonElement>(null)
  const dimensions = useDimensions(buttonRef, false)

  const [transitioning, setTransitioning] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [localExpanded, setLocalExpanded] = useState(expanded)
  useEffect(() => {
    if (localExpanded !== expanded) {
      setTransitioning(true)
      setAnimating(true)
    }
    setLocalExpanded(expanded)
  }, [expanded, localExpanded])

  const expansionOffset = useMemo(() => {
    return getExpansionOffset
      ? getExpansionOffset(artist.albums.length, dimensions)
      : {
          left: 0,
          top: 0,
          width: 0,
          maxWidth: 0,
          height: 0,
        }
  }, [artist.albums.length, dimensions, getExpansionOffset])

  const [transitionStep, setTransitionStep] = useState(0)
  useEffect(() => {
    if (
      (transitionStep === 0 && transitioning && animating) ||
      (transitionStep === 1 && transitioning && animating) ||
      (transitionStep === 2 && !transitioning && !animating)
    )
      setTransitionStep(transitionStep + 1)
    else if (transitionStep === 3 && !transitioning && !animating)
      setTransitionStep(0)
  }, [animating, transitionStep, transitioning])

  const [showExpanded, setShowExpanded] = useState(false)
  const [expansionStyle, setExpansionStyle] = useState(expansionOffset)
  useLayoutEffect(() => {
    if (expanded) setExpansionStyle(expansionOffset)
  }, [expanded, expansionOffset])
  useEffect(() => {
    if (
      (expanded && transitionStep === 1) ||
      (!expanded && transitionStep === 3)
    ) {
      setShowExpanded(expanded)
      setExpansionStyle(expansionOffset)
    }
  }, [expanded, expansionOffset, transitionStep])

  const height = useMemo(() => (showExpanded ? expansionOffset.height : 0), [
    expansionOffset.height,
    showExpanded,
  ])
  const marginBottom = useMemo(() => {
    return height + 4
  }, [height])

  return (
    <div
      className={clsx(styles.container, styles.expanded)}
      style={{ marginBottom }}
      onTransitionEnd={(): void => setTransitioning(false)}
    >
      <button
        className={styles.button}
        onClick={onClickWrapper}
        ref={buttonRef}
        type='button'
      >
        {artist.name}
      </button>
      {showExpanded && (
        <div className={styles.expansion} style={expansionStyle}>
          {artist.albums.map(album => (
            <AlbumButton
              key={album.id}
              album={album}
              className={clsx(
                styles.album,
                expanded ? styles.animateExpand : styles.animateContract
              )}
              onAnimationEnd={(): void => setAnimating(false)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ArtistButton
