import YouTube from 'yt-search'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Video = Record<string, any>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SearchResults = Record<string, any>

export function video(id: string): Promise<Video | Error> {
  return new Promise((resolve, reject) => {
    YouTube({ videoId: id }, (error: Error, response: Video) => {
      if (error) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}

export function search(query: string): Promise<SearchResults | Error> {
  return new Promise((resolve, reject) => {
    YouTube(query, (error: Error, response: SearchResults) => {
      if (error) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
