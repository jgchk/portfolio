// Type definitions for ytsr 0.1.10
// Project: https://github.com/TimeForANinja/node-ytsr
// Definitions by: Jake Cheek <https://jake.cafe/>

function search(
  searchString: string,
  options?: SearchOptions
): Promise<SearchResults>
function search(
  searchString?: string,
  options: SearchOptions
): Promise<SearchResults>
function search(
  searchString: string,
  callback: (err: Error, results: SearchResults) => void
): void
function search(
  searchString?: string,
  options: SearchOptions,
  callback: (err: Error, results: SearchResults) => void
): void

export default search

export interface SearchOptions {
  limit?: number
  nextpageRef?: string
}

export interface SearchResult {
  type: string
  title: string
  link: string
  thumbnail: string
  author: {
    name: string
    ref: string
    verified: boolean
  }
  description: string
  meta: string[]
  actors: string[]
  director: string
  duration: string
  views?: number
  uploaded_at: string
}

export interface SearchFilter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref?: any
  name: string
  active: boolean
}

export interface SearchResults {
  query: string
  items: SearchResult[]
  nextpageRef: string
  results: string
  filters: SearchFilter[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentRef?: any
}
