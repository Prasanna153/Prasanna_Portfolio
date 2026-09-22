import { useRef } from 'react'

// A glass card with a soft light that follows the mouse.
export default function SpotlightCard({ children, className = '', as: Tag = 'div', ...rest }) {
  const ref = useRef(null)
  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <Tag ref={ref} onMouseMove={onMove} className={`glass spot rounded-2xl ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
