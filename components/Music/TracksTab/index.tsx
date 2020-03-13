import React, { FunctionComponent } from 'react'

import TrackButton from '../TrackButton'
import { Track } from '../../../lib/api/aws'

type TracksTabProps = {
  tracks: Track[]
}

const TracksTab: FunctionComponent<TracksTabProps> = ({ tracks }) => (
  <div>
    {tracks.map(track => (
      <TrackButton key={track.id} track={track} />
    ))}
  </div>
)

export default TracksTab
