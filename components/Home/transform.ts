import { MutableRefObject, CSSProperties } from 'react'

const constrain = 20

export default function transform(
  x: number,
  y: number,
  el: MutableRefObject<HTMLElement | null>
): CSSProperties {
  if (!el.current) return {}

  const box = el.current.getBoundingClientRect()
  const calcX = -(y - box.y - box.height / 2) / constrain
  const calcY = (x - box.x - box.width / 2) / constrain

  return {
    transform: `rotateX(${calcX}deg) rotateY(${calcY}deg)`,
  }
}
