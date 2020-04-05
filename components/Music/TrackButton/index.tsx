import React, { FunctionComponent } from 'react'

import { Track } from '../../../lib/api/library'
import styles from './styles.less'

type TrackButtonProps = {
  track: Track
}

const TrackButton: FunctionComponent<TrackButtonProps> = ({ track }) => (
  <button className={styles.button} type='button'>
    {track.title}
  </button>
)

export default TrackButton
