import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, Menu, X } from 'lucide-react'
import { navItems, profile } from '../data/portfolio.js'

export default function Navbar() {
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const [active, setActive] = useState('home')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // highlight the section that is currently on screen
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!onHome) return undefined
    const sections = navItems.map((n) => document.getElementById(n.id)).filter(Boolean)
    if (!sections.length) return undefined
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [onHome, pathname])

  useEffect(() => setOpen(false), [pathname])

  const current = onHome ? active : pathname.startsWith('/certificates') ? 'certificates' : pathname.startsWith('/project') ? 'projects' : ''

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav
        aria-label="Main"
        className={`glass w-full max-w-5xl rounded-full px-3 py-2 transition-all duration-300 sm:px-4 ${
          scrolled ? 'shadow-[0_10px_40px_-12px_rgba(0,0,0,0.7)]' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <Link to="/" aria-label="Prasanna T, home" className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3">
            <span className="flex h-9 w-9 items-end justify-center gap-[3px] rounded-xl bg-ink-900 pb-2 ring-1 ring-ink-600">
              <i className="block h-2 w-1.5 rounded-sm bg-plot" />
              <i className="block h-3.5 w-1.5 rounded-sm bg-mint" />
              <i className="block h-5 w-1.5 rounded-sm bg-signal" />
            </span>
            <span className="font-display text-base font-bold tracking-tight">{profile.name}</span>
          </Link>

          <ul className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((n) => (
              <li key={n.id}>
                <Link
                  to={n.id === 'home' ? '/' : `/#${n.id}`}
                  className={`relative block rounded-full px-3.5 py-2 text-sm transition-colors ${
                    current === n.id ? 'text-ink-950' : 'text-mist hover:text-fog'
                  }`}
                >
                  {current === n.id && (
                    <motion.span layoutId="nav-active" className="absolute inset-0 rounded-full bg-signal" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                  )}
                  <span className="relative font-medium">{n.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a href={profile.resume} download="Prasanna_T_Resume.pdf" className="btn-ghost hidden !px-4 !py-2 sm:inline-flex">
              <Download className="h-4 w-4" /> Resume
            </a>
            <button
              onClick={() => setOpen((o) => !o)}
              className="rounded-full border border-ink-600 p-2.5 lg:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden lg:hidden"
            >
              <li className="grid grid-cols-2 gap-1 pb-2 pt-3">
                {navItems.map((n) => (
                  <Link
                    key={n.id}
                    to={n.id === 'home' ? '/' : `/#${n.id}`}
                    className={`rounded-xl px-4 py-3 text-sm font-medium ${current === n.id ? 'bg-signal text-ink-950' : 'bg-ink-800/60 text-fog'}`}
                  >
                    {n.label}
                  </Link>
                ))}
                <a href={profile.resume} download="Prasanna_T_Resume.pdf" className="col-span-2 rounded-xl bg-ink-800/60 px-4 py-3 text-center text-sm font-medium text-signal">
                  Download resume
                </a>
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
