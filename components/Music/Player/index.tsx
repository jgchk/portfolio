import React, { FunctionComponent } from 'react'

import styles from './styles.less'

const Player: FunctionComponent<{}> = () => {
  return (
    <div className={styles.container}>
      <div className={styles.cover} />
      <div className={styles.trackInfo}>
        <div className={styles.trackName}>Track Name</div>
        <div className={styles.trackArtist}>Artist</div>
      </div>
    </div>
  )
}

export default Player
