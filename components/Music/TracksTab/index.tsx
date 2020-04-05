import React, { FunctionComponent } from 'react'

import TrackButton from '../TrackButton'
import { Track } from '../../../lib/api/library'
import styles from './styles.less'

type TracksTabProps = {
  tracks: Track[]
}

const TracksTab: FunctionComponent<TracksTabProps> = ({ tracks }) => (
  <div className={styles.scroll}>
    <div className={styles.container}>
      {tracks.map(track => (
        <TrackButton key={track.id} track={track} />
      ))}
    </div>
  </div>
)

export default TracksTab
