import { useEffect, useRef } from 'react'

// A large, very soft light that trails the mouse across the whole page.
// Only shown on devices with a real mouse.
export default function CursorGlow() {
  const ref = useRef(null)
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = ref.current
    if (!fine || reduce || !el) return undefined
    let x = window.innerWidth / 2
    let y = window.innerHeight / 3
    let tx = x
    let ty = y
    let raf
    const move = (e) => {
      tx = e.clientX
      ty = e.clientY
      el.style.opacity = '1'
    }
    const tick = () => {
      x += (tx - x) * 0.12
      y += (ty - y) * 0.12
      el.style.transform = `translate3d(${x - 250}px, ${y - 250}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', move, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', move)
      cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-0 h-[500px] w-[500px] rounded-full opacity-0 transition-opacity duration-500"
      style={{ background: 'radial-gradient(circle, rgba(124,156,255,0.10) 0%, rgba(124,156,255,0) 65%)' }}
    />
  )
}
