import { useEffect, useRef } from 'react'

// Floating dots joined by thin lines, like a network graph. Reacts gently to the mouse.
export default function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let nodes = []
    let raf = 0
    const mouse = { x: -9999, y: -9999 }
    const LINK = 130

    const colors = ['124,156,255', '61,219,192', '245,184,61']

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(85, Math.floor((w * h) / 17000))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
        c: colors[Math.floor(Math.random() * colors.length)],
      }))
      if (reduce) draw()
    }

    function draw() {
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        ctx.beginPath()
        ctx.fillStyle = `rgba(${a.c},0.7)`
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2)
        ctx.fill()
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d = Math.hypot(dx, dy)
          if (d < LINK) {
            ctx.strokeStyle = `rgba(142,153,180,${0.16 * (1 - d / LINK)})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
        // lines from the mouse to nearby dots
        const mdx = a.x - mouse.x
        const mdy = a.y - mouse.y
        const md = Math.hypot(mdx, mdy)
        if (md < 160) {
          ctx.strokeStyle = `rgba(245,184,61,${0.35 * (1 - md / 160)})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }
      }
    }

    function step() {
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > w) n.vx *= -1
        if (n.y < 0 || n.y > h) n.vy *= -1
        const dx = n.x - mouse.x
        const dy = n.y - mouse.y
        const d = Math.hypot(dx, dy)
        if (d < 110 && d > 0) {
          n.x += (dx / d) * 0.9
          n.y += (dy / d) * 0.9
        }
      }
      draw()
      raf = requestAnimationFrame(step)
    }

    const onMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }
    const onVisibility = () => {
      if (reduce) return
      if (document.hidden) cancelAnimationFrame(raf)
      else raf = requestAnimationFrame(step)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseleave', onLeave)
    document.addEventListener('visibilitychange', onVisibility)
    if (!reduce) raf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" />
}
