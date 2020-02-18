// eslint-disable-next-line import/prefer-default-export
export function first<T>(array: T[] | T): T {
  return Array.isArray(array) ? array[0] : array
}

export function asArray<T>(array: T[] | T): T[] {
  return Array.isArray(array) ? array : [array]
}
