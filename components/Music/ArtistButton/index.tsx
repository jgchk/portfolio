import React, {
  FunctionComponent,
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect,
} from 'react'
import clsx from 'clsx'

import { Artist } from '../../../lib/api/aws'
import AlbumButton from '../AlbumButton'
import styles from './styles.less'

type ArtistButtonProps = {
  artist: Artist
  expanded: boolean
  onClick: () => void
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
  const buttonRef = useRef<HTMLButtonElement>(null)
  const getDimensions = useCallback(() => {
    const button = buttonRef.current
    return {
      left: button ? button.offsetLeft : 0,
      top: button ? button.offsetTop : 0,
      width: button ? button.offsetWidth : 0,
      height: button ? button.offsetHeight : 0,
    }
  }, [])

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
      ? getExpansionOffset(artist.albums.length, getDimensions())
      : {
          left: 0,
          top: 0,
          width: 0,
          maxWidth: 0,
          height: 0,
        }
  }, [artist.albums.length, getDimensions, getExpansionOffset])

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
  useEffect(() => {
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
        onClick={onClick}
        ref={buttonRef}
        type='button'
      >
        {artist.name}
      </button>
      {showExpanded && (
        <div className={styles.expansion} style={expansionStyle}>
          {artist.albums.map(album => (
            <AlbumButton
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
