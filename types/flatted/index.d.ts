/* eslint-disable @typescript-eslint/no-explicit-any */

type Reviver = (this: any, key: string, value: any) => any
type Replacer = (this: any, key: string, value: any) => any

declare interface Flatted {
  parse: (text: string, reviver?: Reviver) => any

  stringify: (
    value: any,
    replacer?: Replacer,
    space?: string | number
  ) => string
}

const flatted: Flatted

export default flatted
