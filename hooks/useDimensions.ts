import { useEffect, RefObject, useState } from 'react'

const isBrowser = typeof window !== 'undefined'

interface Dimensions {
  width: number
  height: number
}

function getDimensions({
  element,
  useWindow,
}: {
  element?: RefObject<HTMLElement>
  useWindow: boolean
}): Dimensions {
  if (!isBrowser) return { width: 0, height: 0 }

  const target = element && element.current ? element.current : document.body
  const position = target.getBoundingClientRect()

  return useWindow
    ? { width: window.innerWidth, height: window.innerHeight }
    : { width: position.width, height: position.height }
}

export default function useDimensions(
  element: RefObject<HTMLElement>,
  useWindow: boolean
): Dimensions {
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
