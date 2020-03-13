import React, { FunctionComponent } from 'react'

import { Track } from '../../../lib/api/aws'

type TrackButtonProps = {
  track: Track
}

const TrackButton: FunctionComponent<TrackButtonProps> = ({ track }) => (
  <button type='button'>{track.title}</button>
)

export default TrackButton
