// eslint-disable-next-line import/prefer-default-export
export function formatMilliseconds(ms: number): string {
  let minutes = Math.floor(ms / 60000)
  let seconds = Math.round((ms % 60000) / 1000)
  if (seconds === 60) {
    minutes += 1
    seconds = 0
  }
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}
