import React, { FunctionComponent } from 'react'
import clsx from 'clsx'

import { LazyLoadImage } from 'react-lazy-load-image-component'
import Skeleton from 'react-loading-skeleton'

import { Album } from '../../../lib/api/aws'
import styles from './styles.less'

type AlbumButtonProps = {
  album: Album
  className?: string
  onAnimationEnd?: () => void
}

const imageWidth = 128
const imageHeight = 128

const AlbumButton: FunctionComponent<AlbumButtonProps> = ({
  album,
  className,
  onAnimationEnd,
}) => (
  <button
    onAnimationEnd={onAnimationEnd}
    className={clsx(styles.button, className)}
    type='button'
  >
    {album.cover && (
      <LazyLoadImage
        className={styles.image}
        src={album.cover.url}
        placeholder={<Skeleton width={imageWidth} height={imageHeight} />}
        width={imageWidth}
        height={imageHeight}
        threshold={imageWidth * imageHeight}
        alt='cover'
      />
    )}
    <div className={styles.title}>{album.title}</div>
  </button>
)

export default AlbumButton
