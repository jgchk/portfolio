import { useState, useEffect } from 'react'

interface MousePosition {
  x: number
  y: number
}

function getMousePosition(e: MouseEvent): MousePosition {
  const { clientX: x, clientY: y } = e
  return { x, y }
}

export default function useMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void =>
      setMousePosition(getMousePosition(e))

    window.addEventListener('mousemove', handleMouseMove)
    return (): void => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return mousePosition
}
