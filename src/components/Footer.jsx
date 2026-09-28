import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { profile } from '../data/portfolio.js'
import { GithubIcon, LinkedinIcon } from './Icons.jsx'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-ink-700/70 bg-ink-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-mist sm:flex-row sm:px-8">
        <p>
          © {new Date().getFullYear()} {profile.name}. Built with React, Tailwind CSS, Framer Motion and Express.
        </p>
        <div className="flex items-center gap-4">
          <a href={profile.github} target="_blank" rel="noreferrer noopener" aria-label="GitHub" className="hover:text-signal">
            <GithubIcon className="h-5 w-5" />
          </a>
          {profile.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noreferrer noopener" aria-label="LinkedIn" className="hover:text-signal">
              <LinkedinIcon className="h-5 w-5" />
            </a>
          )}
          <Link to="/admin" className="flex items-center gap-1.5 hover:text-signal" aria-label="Admin login">
            <Lock className="h-4 w-4" /> Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
