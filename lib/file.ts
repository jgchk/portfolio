const extensionRegex = /(.+)\.(.+(?!\.)+)+$/

export function isImage(path: string): boolean {
  const match = extensionRegex.exec(path)
  if (!match) return false

  const extension = match[2].toLowerCase()
  const imageExtensions = ['jpg', 'jpeg', 'png']
  return imageExtensions.includes(extension)
}

export function isTemp(path: string): boolean {
  const match = extensionRegex.exec(path)
  if (!match) return false

  const extension = match[2].toLowerCase()
  return extension === 'tmp'
}
