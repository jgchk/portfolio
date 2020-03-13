import React, {
  FunctionComponent,
  useCallback,
  useRef,
  useEffect,
  useState,
} from 'react'
import clsx from 'clsx'

import { Artist } from '../../../lib/api/aws'
import AlbumButton from '../AlbumButton'
import styles from './styles.less'

type ArtistButtonProps = {
  artist: Artist
  expanded: boolean
  onClick: () => void
  windowWidth: number
  scrollPosition: number
}

const ArtistButton: FunctionComponent<ArtistButtonProps> = ({
  artist,
  expanded,
  onClick,
  windowWidth,
  scrollPosition,
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
  const [dimensions, setDimensions] = useState(getDimensions())
  useEffect(() => {
    const updateDimensions = (): void => setDimensions(getDimensions())
    window.addEventListener('resize', updateDimensions)
    updateDimensions()
    return (): void => window.removeEventListener('resize', updateDimensions)
  }, [getDimensions])

  const getExpansionOffset = useCallback(() => {
    const buttonCenter = dimensions.left + dimensions.width / 2

    const numAlbums = artist.albums.length
    const albumsWidth = numAlbums * (128 + 2 * 4)
    const albumsLeft = buttonCenter - albumsWidth / 2
    const albumsRight = buttonCenter + albumsWidth / 2

    const rightOvershoot = Math.max(albumsRight - windowWidth, 0)
    const maxLeft = albumsLeft - rightOvershoot

    const leftOffset = rightOvershoot > 0 ? maxLeft : Math.max(4, albumsLeft)
    const topOffset = dimensions.top + dimensions.height + 4 - scrollPosition

    return {
      left: leftOffset,
      top: topOffset,
      width: albumsWidth,
      maxWidth: windowWidth,
    }
  }, [
    artist.albums.length,
    dimensions.height,
    dimensions.left,
    dimensions.top,
    dimensions.width,
    scrollPosition,
    windowWidth,
  ])

  const [animating, setAnimating] = useState(false)
  const onClickWrapper = useCallback(() => {
    setAnimating(true)
    onClick()
  }, [onClick, setAnimating])

  return (
    <div className={clsx(styles.container, expanded && styles.expanded)}>
      <button
        className={styles.button}
        onClick={onClickWrapper}
        ref={buttonRef}
        type='button'
      >
        {artist.name}
      </button>
      {(expanded || animating) && (
        <div className={styles.expansion} style={getExpansionOffset()}>
          {artist.albums.map(album => (
            <AlbumButton
              album={album}
              className={
                expanded ? styles.animateExpand : styles.animateContract
              }
              onAnimationEnd={(): void => setAnimating(false)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ArtistButton
