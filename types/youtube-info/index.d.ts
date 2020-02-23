// Type definitions for youtube-info 1.3.2
// Project: https://github.com/philbot9/youtube-info
// Definitions by: Jake Cheek <https://jake.cafe/>

function fetchVideoInfo(videoId: string): Promise<VideoInfo>
function fetchVideoInfo(
  videoId: string,
  callback: (err: Error, result: VideoInfo) => void
): void

export default fetchVideoInfo

export interface VideoInfo {
  videoId: string
  url: string
  title: string
  description: string
  owner: string
  channelId: string
  thumbnailUrl: string
  embedURL: string
  datePublished: string
  genre: string
  paid: boolean
  unlisted: boolean
  isFamilyFriendly: boolean
  duration: number
  views: number
  regionsAllwoed: Array<string>
  commentCount: number
  likeCount: number
  dislikeCount: number
  channelThumbnailUrl: string
}
