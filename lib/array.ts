export function first<T>(array: T[] | T): T {
  return Array.isArray(array) ? array[0] : array
}

export function asArray<T>(array: T[] | T): T[] {
  return Array.isArray(array) ? array : [array]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isStringArray(array: any[]): array is string[] {
  return typeof array[0] === 'string'
}

export function partition<T>(arr: T[], size: number): T[][] {
  let part: T[] = []
  return arr.reduce((acc: T[][], val: T) => {
    part.push(val)
    if (part.length === size) {
      acc.push(part)
      part = []
    }
    return acc
  }, [])
}
