import DiscogsApi from 'disconnect'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Release = Record<string, any>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Master = Record<string, any>

const Discogs = new DiscogsApi.Client({
  consumerKey: process.env.DISCOGS_KEY,
  consumerSecret: process.env.DISCOGS_SECRET,
})
const db = Discogs.database()

export function release(id: string): Promise<Release | Error> {
  return new Promise((resolve, reject) => {
    db.getRelease(id, (error: Error, response: Release) => {
      if (error) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}

export function master(id: string): Promise<Master | Error> {
  return new Promise((resolve, reject) => {
    db.getMaster(id, (error: Error, response: Master) => {
      if (error) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
