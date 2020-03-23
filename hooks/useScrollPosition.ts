import { useEffect, RefObject, useState } from 'react'

const isBrowser = typeof window !== 'undefined'

interface ScrollPosition {
  x: number
  y: number
}

function getScrollPosition({
  element,
  useWindow,
}: {
  element?: RefObject<HTMLElement>
  useWindow: boolean
}): ScrollPosition {
  if (!isBrowser) return { x: 0, y: 0 }

  const target = element && element.current ? element.current : document.body

  return useWindow
    ? { x: window.scrollX, y: window.scrollY }
    : { x: target.scrollLeft, y: target.scrollTop }
}

export default function useScrollPosition(
  element: RefObject<HTMLElement>,
  useWindow: boolean
): ScrollPosition {
  const [position, setPosition] = useState(getScrollPosition({ useWindow }))

  useEffect(() => {
    const handleScroll = (): void =>
      setPosition(getScrollPosition({ element, useWindow }))

    /* eslint-disable-next-line no-nested-ternary */
    const target = useWindow
      ? window
      : element && element.current
      ? element.current
      : document.body
    target.addEventListener('scroll', handleScroll)

    handleScroll()
    return (): void => target.removeEventListener('scroll', handleScroll)
  }, [element, useWindow])

  return position
}
