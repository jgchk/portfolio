import React, { FunctionComponent } from 'react'

import TabLayout from './TabLayout'
import ArtistsTab from './ArtistsTab'
import AlbumsTab from './AlbumsTab'
import { Library } from '../../lib/api/aws'

type MusicProps = {
  library: Library
}

const Music: FunctionComponent<MusicProps> = ({ library }) => {
  const artistsTab = {
    title: 'Artists',
    element: <ArtistsTab artists={library.artists} />,
  }

  const albums = library.artists.flatMap(artist => artist.albums)
  const albumsTab = {
    title: 'Albums',
    element: <AlbumsTab albums={albums} />,
  }

  const tabs = [artistsTab, albumsTab]
  return <TabLayout tabs={tabs} />
}

export default Music
