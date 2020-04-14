export function isTimeElement(el: Element): el is HTMLTimeElement {
  return 'dateTime' in el
}

export function isLinkElement(el: Element): el is HTMLLinkElement {
  return 'href' in el
}
