import React, { FunctionComponent } from 'react'
import clsx from 'clsx'

import { Album } from '../../../lib/api/aws'
import styles from './styles.less'

type AlbumButtonProps = {
  album: Album
  className?: string
  onAnimationEnd?: () => void
}

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
      <img className={styles.image} src={album.cover.url} alt='cover' />
    )}
    <div className={styles.title}>{album.title}</div>
  </button>
)

export default AlbumButton
