import React from 'react'
import { NextPage } from 'next'

import MusicComponent from '../components/Music'
import getLibrary, { Library } from '../lib/api/aws'

type MusicProps = {
  library: Library
}

const Music: NextPage<MusicProps> = ({ library }) => (
  <MusicComponent library={library} />
)

Music.getInitialProps = async (): Promise<MusicProps> => {
  const library = await getLibrary()
  return { library }
}

export default Music
