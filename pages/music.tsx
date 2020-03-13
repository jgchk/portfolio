import React from 'react'
import { NextPage } from 'next'

import Library from '../components/Music/Library'
import getLibrary, { Library as LibraryModel } from '../lib/api/aws'

type MusicProps = {
  library: LibraryModel
}

const Music: NextPage<MusicProps> = ({ library }) => (
  <Library library={library} />
)

Music.getInitialProps = async (): Promise<MusicProps> => {
  const library = await getLibrary()
  return { library }
}

export default Music
