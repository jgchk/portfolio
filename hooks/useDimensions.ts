import { useEffect, RefObject, useState } from 'react'

const isBrowser = typeof window !== 'undefined'

function getDimensions({
  element,
  useWindow,
}: {
  element?: RefObject<HTMLElement>
  useWindow: boolean
}): ClientRect {
  if (!isBrowser)
    return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }

  const target = element && element.current ? element.current : document.body
  const position = target.getBoundingClientRect()

  return useWindow
    ? {
        top: window.screenY,
        bottom: window.screenY + window.innerHeight,
        left: window.screenX,
        right: window.screenX + window.innerWidth,
        width: window.innerWidth,
        height: window.innerHeight,
      }
    : position
}

export default function useDimensions(
  element: RefObject<HTMLElement>,
  useWindow: boolean
): ClientRect {
  const [dimensions, setDimensions] = useState(getDimensions({ useWindow }))

  useEffect(() => {
    const handleResize = (): void =>
      setDimensions(getDimensions({ element, useWindow }))
    window.addEventListener('resize', handleResize)
    handleResize()
    return (): void => window.removeEventListener('resize', handleResize)
  }, [element, useWindow])

  return dimensions
}
