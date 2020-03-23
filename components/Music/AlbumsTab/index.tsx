import React, { FunctionComponent } from 'react'

import AlbumButton from '../AlbumButton'
import { Album } from '../../../lib/api/aws/s3'
import styles from './styles.less'

type AlbumsTabProps = {
  albums: Album[]
}

const AlbumsTab: FunctionComponent<AlbumsTabProps> = ({ albums }) => {
  return (
    <div className={styles.scroll}>
      <div className={styles.container}>
        {albums.map(album => (
          <AlbumButton key={album.id} album={album} />
        ))}
      </div>
    </div>
  )
}

export default AlbumsTab
