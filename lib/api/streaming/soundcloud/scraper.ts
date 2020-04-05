import fetch from 'node-fetch'
import { Track, Playlist } from 'soundcloud-v2-api'
import Bluebird from 'bluebird'

import { sortMostSimilar } from 'lib/string'
import { Release, SearchType } from '../type'
import { formatRelease } from './common'

function getTrackInfo(url: string, html: string): Track {
  const regex = /{"id":17,"chunks":\[\d+\],"data":\[({.*})\]}/
  const match = regex.exec(html)
  if (!match) throw Error(`unable to find data for url: ${url}`)
  const data: Track = JSON.parse(match[1])
  return data
}

function getPlaylistInfo(url: string, html: string): Playlist {
  const regex = /{"id":43,"chunks":\[\d+\],"data":\[({.*})\]}/
  const match = regex.exec(html)
  if (!match) throw Error(`unable to find data for url: ${url}`)
  const data: Playlist = JSON.parse(match[1])
  return data
}

function getInfo(url: string, html: string): Track | Playlist {
  try {
    return getTrackInfo(url, html)
  } catch (err) {
    return getPlaylistInfo(url, html)
  }
}

export async function resolve(url: string): Promise<Release> {
  const response = await fetch(url)
  const html = await response.text()
  const result = getInfo(url, html)
  return formatRelease(result, html)
}

function extractLinks(html: string): string[] {
  const regex = /<li><h2><a href="(.+)">.+<\/a><\/h2><\/li>/gm
  const matches = html.matchAll(regex)
  return Array.from(matches).map(match => {
    const path = match[1]
    return `https://soundcloud.com${path}`
  })
}

async function fetchTracks(query: string): Promise<string[]> {
  const url = `https://soundcloud.com/search/sounds?q=${encodeURIComponent(
    query
  )}`
  const response = await fetch(url)
  const html = await response.text()
  return extractLinks(html)
}

async function fetchAlbums(query: string): Promise<string[]> {
  const urls = [
    `https://soundcloud.com/search/albums?q=${encodeURIComponent(query)}`,
    `https://soundcloud.com/search/sets?q=${encodeURIComponent(query)}`,
  ]

  const links: string[] = []
  await Bluebird.map(urls, async url => {
    const response = await fetch(url)
    const html = await response.text()
    links.push(...extractLinks(html))
  })
  return links
}

export async function search(
  title: string,
  artist: string,
  type: SearchType,
  limit?: number
): Promise<Release[]> {
  const query = `${artist} ${title}`
  const links = await (type === 'track'
    ? fetchTracks(query)
    : fetchAlbums(query))
  const results = await Bluebird.map(links, async link => {
    const response = await fetch(link)
    const html = await response.text()
    return {
      info: getInfo(link, html),
      html,
    }
  })

  const sortedResults = sortMostSimilar(
    `${artist} ${title}`,
    results,
    item => `${item.info.user.username} ${item.info.title}`
  ).reverse()
  const limitedResults = sortedResults.slice(0, limit || sortedResults.length)
  return Bluebird.map(limitedResults, result =>
    formatRelease(result.info, result.html)
  )
}
