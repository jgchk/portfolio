import React, { FunctionComponent } from 'react'

import { Album } from '../../../lib/api/aws'
import styles from './styles.less'

type AlbumButtonProps = {
  album: Album
}

const AlbumButton: FunctionComponent<AlbumButtonProps> = ({ album }) => (
  <button className={styles.button} type='button'>
    {album.cover && (
      <img className={styles.image} src={album.cover.url} alt='cover' />
    )}
    <div className={styles.title}>{album.title}</div>
  </button>
)

export default AlbumButton
