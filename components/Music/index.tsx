import React, { FunctionComponent, ReactElement } from 'react'

import TabLayout, { ExtraProps } from './TabLayout'
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
    title: 'Artists',
    element: (props: ExtraProps): ReactElement => {
      const { dimensions, scrollPosition } = props
      return (
        <ArtistsTab
          artists={artists}
          dimensions={dimensions}
          scrollPosition={scrollPosition}
        />
      )
    },
  }

  const albums = artists.flatMap(artist => artist.albums)
  const albumsTab = {
    title: 'Albums',
    element: (props: ExtraProps): ReactElement => <AlbumsTab albums={albums} />,
  }

  const tracks = albums.flatMap(album => album.tracks)
  const tracksTab = {
    title: 'Tracks',
    element: (props: ExtraProps): ReactElement => <TracksTab tracks={tracks} />,
  }

  const tabs = [artistsTab, albumsTab, tracksTab]
  return <TabLayout tabs={tabs} />
}

export default Music
