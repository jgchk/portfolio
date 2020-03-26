export function formatMilliseconds(ms: number): string {
  let minutes = Math.floor(ms / 60000)
  let seconds = Math.round((ms % 60000) / 1000)
  if (seconds === 60) {
    minutes += 1
    seconds = 0
  }
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

export const oneSecond = 1000
export const oneMinute = 60 * oneSecond
export const oneHour = 60 * oneMinute
export const oneDay = 24 * oneHour
export const oneWeek = 7 * oneDay
export const oneYear = 365 * oneDay
