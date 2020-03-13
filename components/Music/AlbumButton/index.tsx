import React, { FunctionComponent } from 'react'

import { Album } from '../../../lib/api/aws'

type AlbumButtonProps = {
  album: Album
}

const AlbumButton: FunctionComponent<AlbumButtonProps> = ({ album }) => (
  <button type='button'>{album.title}</button>
)

export default AlbumButton
