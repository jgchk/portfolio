import React, { FunctionComponent } from 'react'

import TabLayout from './TabLayout'
import ArtistsTab from './ArtistsTab'
import { Library } from '../../lib/api/aws'

type MusicProps = {
  library: Library
}

const Music: FunctionComponent<MusicProps> = ({ library }) => {
  const artistsTab = {
    title: 'Artists',
    element: <ArtistsTab artists={library.artists} />,
  }
  const tabs = [artistsTab]
  return <TabLayout tabs={tabs} />
}

export default Music
