import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'

export function isTimeElement(el: Element): el is HTMLTimeElement {
  return 'dateTime' in el
}

export function isLinkElement(el: Element): el is HTMLLinkElement {
  return 'href' in el
}

export function getFullLink(el: HTMLLinkElement, baseUrl: string): string {
  const link = el.href
  if (link.startsWith('/')) {
    const baseUrlClean = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    return `${baseUrlClean}${link}`
  }
  return link
}

export async function fetchDocument(url: string): Promise<Document> {
  const response = await fetch(url)
  const html = await response.text()
  const dom = new JSDOM(html)
  return dom.window.document
}
