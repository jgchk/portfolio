import { useState, useEffect, useCallback } from 'react'

interface WindowDimensions {
  width: number
  height: number
}

export default function useWindowDimensions(): WindowDimensions {
  const hasWindow = typeof window !== 'undefined'

  const getWindowDimensions = useCallback(() => {
    const width = hasWindow ? window.innerWidth : 0
    const height = hasWindow ? window.innerHeight : 0
    return { width, height }
  }, [hasWindow])

  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  )

  useEffect(() => {
    if (hasWindow) {
      const handleResize = (): void =>
        setWindowDimensions(getWindowDimensions())

      window.addEventListener('resize', handleResize)
      return (): void => window.removeEventListener('resize', handleResize)
    }
    return (): void => {}
  }, [hasWindow, setWindowDimensions, getWindowDimensions])

  return windowDimensions
}
