import dice from 'string-similarity'

import { isStringArray } from './array'

export function getMostSimilar<T>(
  mainString: string,
  targetStrings: T[],
  thresholdSimilarity = 0,
  key: (item: T) => string
): T | null {
  if (targetStrings.length === 0) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let keyFunc: (item: any) => string
  if (key) {
    keyFunc = key
  } else if (isStringArray(targetStrings)) {
    keyFunc = (item: string): string => item
  } else {
    throw new Error("you need a key function if your targets aren't strings")
  }

  const safeSimilarity = (a: string, b: T): number =>
    (b && dice.compareTwoStrings(a.toLowerCase(), keyFunc(b).toLowerCase())) ||
    0
  const mostSimilar = targetStrings.reduce((a, b) => {
    const similarityA = safeSimilarity(mainString, a)
    const similarityB = safeSimilarity(mainString, b)
    return similarityA >= similarityB ? a : b
  })

  const similarity = safeSimilarity(mainString, mostSimilar)
  return similarity >= thresholdSimilarity ? mostSimilar : null
}

export function sortMostSimilar<T>(
  mainString: string,
  targetStrings: T[],
  key: (item: T) => string
): T[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let keyFunc: (item: any) => string
  if (key) {
    keyFunc = key
  } else if (isStringArray(targetStrings)) {
    keyFunc = (item: string): string => item
  } else {
    throw new Error("you need a key function if your targets aren't strings")
  }

  return targetStrings.sort((a, b) => {
    const similarityA = dice.compareTwoStrings(mainString, keyFunc(a))
    const similarityB = dice.compareTwoStrings(mainString, keyFunc(b))
    return similarityA - similarityB
  })
}
