import React, { FunctionComponent } from 'react'

import TabLayout from './TabLayout'
import ArtistsTab from './ArtistsTab'
import AlbumsTab from './AlbumsTab'
import TracksTab from './TracksTab'
import { Library } from '../../lib/api/aws'

type MusicProps = {
  library: Library
}

const Music: FunctionComponent<MusicProps> = ({ library }) => {
  const { artists } = library
  const artistsTab = {
    id: 'artists',
    tab: 'Artists',
    panel: <ArtistsTab artists={artists} />,
  }

  const albums = artists.flatMap(artist => artist.albums)
  const albumsTab = {
    id: 'albums',
    tab: 'Albums',
    panel: <AlbumsTab albums={albums} />,
  }

  const tracks = albums.flatMap(album => album.tracks)
  const tracksTab = {
    id: 'tracks',
    tab: 'Tracks',
    panel: <TracksTab tracks={tracks} />,
  }

  const tabs = [artistsTab, albumsTab, tracksTab]
  return <TabLayout tabs={tabs} />
}

export default Music
