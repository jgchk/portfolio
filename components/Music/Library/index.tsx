import React, { FunctionComponent } from 'react'
import { SkeletonTheme } from 'react-loading-skeleton'
import useSWR from 'swr'
import Flatted from 'flatted/cjs'

import { Library } from '../../../lib/api/library'

import TabLayout from '../TabLayout'
import ArtistsTab from '../ArtistsTab'
import AlbumsTab from '../AlbumsTab'
import TracksTab from '../TracksTab'

import Player from '../Player'

import styles from './styles.less'

const fetcher = (url: string): Promise<Library> =>
  fetch(url)
    .then(r => r.text())
    .then(t => Flatted.parse(t))

const Music: FunctionComponent<{}> = () => {
  const { data, error } = useSWR('/api/music/library', fetcher)
  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>
  console.log(data)

  const { artists, albums, tracks } = data
  const artistsTab = {
    id: 'artists',
    tab: 'Artists',
    panel: <ArtistsTab artists={artists} />,
  }
  const albumsTab = {
    id: 'albums',
    tab: 'Albums',
    panel: <AlbumsTab albums={albums} />,
  }
  const tracksTab = {
    id: 'tracks',
    tab: 'Tracks',
    panel: <TracksTab tracks={tracks} />,
  }

  const tabs = [artistsTab, albumsTab, tracksTab]
  return (
    <SkeletonTheme color='#282a2e' highlightColor='#373b41'>
      <div className={styles.container}>
        <div className={styles.tab}>
          <TabLayout tabs={tabs} />
        </div>
        <div className={styles.player}>
          <Player />
        </div>
      </div>
    </SkeletonTheme>
  )
}

export default Music
