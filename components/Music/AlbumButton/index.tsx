import React, { FunctionComponent } from 'react'
import clsx from 'clsx'
import useSWR from 'swr'
import Skeleton from 'react-loading-skeleton'
import { LazyLoadImage } from 'react-lazy-load-image-component'

import { Album } from '../../../lib/api/library'
import styles from './styles.less'

type AlbumButtonProps = {
  album: Album
  className?: string
  onAnimationEnd?: () => void
}

const imageWidth = 128
const imageHeight = 128

const fetcher = (url: string): Promise<string> => fetch(url).then(r => r.text())
const dummyFetcher = (): Promise<undefined> => Promise.resolve(undefined)

const AlbumButton: FunctionComponent<AlbumButtonProps> = ({
  album,
  className,
  onAnimationEnd,
}) => {
  const { data, error } = useSWR(
    `/api/music/library/url?path=${encodeURIComponent(album.coverPath)}`,
    album.coverPath ? fetcher : dummyFetcher
  )
  const coverUrl = data

  return (
    <button
      onAnimationEnd={onAnimationEnd}
      className={clsx(styles.button, className)}
      type='button'
    >
      {(error || !album.coverPath) && (
        <div
          className={styles.placeholder}
          style={{ width: imageWidth, height: imageHeight }}
        />
      )}
      {!error && album.coverPath && !coverUrl && (
        <Skeleton width={imageWidth} height={imageHeight} />
      )}
      {!error && album.coverPath && coverUrl && (
        <LazyLoadImage
          className={styles.image}
          src={coverUrl}
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
}

export default AlbumButton
