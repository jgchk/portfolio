import React, { FunctionComponent } from 'react'

import AlbumButton from '../AlbumButton'
import { Album } from '../../../lib/api/aws'

type AlbumsTabProps = {
  albums: Album[]
}

const AlbumsTab: FunctionComponent<AlbumsTabProps> = ({ albums }) => (
  <div>
    {albums.map(album => (
      <AlbumButton key={album.id} album={album} />
    ))}
  </div>
)

export default AlbumsTab
