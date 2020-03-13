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

import { Artist } from '../../../lib/api/aws'
import AlbumButton from '../AlbumButton'
import styles from './styles.less'

type ArtistButtonProps = {
  artist: Artist
  expanded: boolean
  onClick: (id: string) => void
  getExpansionOffset?: (
    numAlbums: number,
    dims: { left: number; top: number; width: number; height: number }
  ) => ExpansionOffset
  scrollPos?: { x: number; y: number }
}

export interface ExpansionOffset {
  left: number
  top: number
  width: number
  maxWidth: number
  height: number
}

const ArtistButton: FunctionComponent<ArtistButtonProps> = ({
  artist,
  expanded,
  onClick,
  getExpansionOffset,
  scrollPos,
}) => {
  const [localScrollPos, setScrollPos] = useState(scrollPos)
  useEffect(() => {
    if (localScrollPos !== scrollPos) setScrollPos(scrollPos)
  }, [localScrollPos, scrollPos])

  const onClickWrapper = useCallback(() => onClick(artist.id), [
    artist.id,
    onClick,
  ])

  const buttonRef = useRef<HTMLButtonElement>(null)
  const getDimensions = useCallback(scrPos => {
    if (!buttonRef.current)
      return {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
      }
    return buttonRef.current.getBoundingClientRect()
  }, [])
  const getExpansionsOffsetWrapper = useCallback(
    () =>
      getExpansionOffset
        ? getExpansionOffset(artist.albums.length, getDimensions(scrollPos))
        : {
            left: 0,
            top: 0,
            width: 0,
            maxWidth: 0,
            height: 0,
          },
    [artist.albums.length, getDimensions, getExpansionOffset, scrollPos]
  )
  const [expansionOffset, setExpansionOffset] = useState(
    getExpansionsOffsetWrapper()
  )
  useLayoutEffect(() => {
    if (expanded) setExpansionOffset(getExpansionsOffsetWrapper())
  }, [expanded, getExpansionsOffsetWrapper])

  const [transitioning, setTransitioning] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [localExpanded, setLocalExpanded] = useState(expanded)
  useEffect(() => {
    if (localExpanded !== expanded) {
      setExpansionOffset(getExpansionsOffsetWrapper())
      setTransitioning(true)
      setAnimating(true)
    }
    setLocalExpanded(expanded)
  }, [expanded, getExpansionsOffsetWrapper, localExpanded])

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
