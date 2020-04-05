import { NextApiRequest, NextApiResponse } from 'next'
import Promise from 'bluebird'
import Flatted from 'flatted/cjs'

import { getLibrary, Library } from 'lib/api/library'

function format(library: Library): string {
  return Flatted.stringify(library)
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const library = await getLibrary()
  res.status(200).json(format(library))
}
