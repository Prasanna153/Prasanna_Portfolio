import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react'
import { profile } from '../data/portfolio.js'
import { useContent } from '../hooks/useContent.jsx'
import { ProjectCover } from '../components/Projects.jsx'
import { GithubIcon } from '../components/Icons.jsx'
import Reveal from '../components/Reveal.jsx'
import SpotlightCard from '../components/SpotlightCard.jsx'

export default function ProjectDetail() {
  const { id } = useParams()
  const { projects, loading } = useContent()
  if (loading) return <main className="section !pt-32"><div className="glass h-64 animate-pulse rounded-3xl" /></main>
  const index = projects.findIndex((p) => p.id === id)
  if (index === -1) return <Navigate to="/#projects" replace />
  const project = projects[index]
  const next = projects[(index + 1) % projects.length]

  return (
    <main className="section !pt-32">
      <Link to="/#projects" className="inline-flex items-center gap-2 text-sm text-mist transition hover:text-signal">
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-6 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{project.title}</h1>
          {project.period && <p className="mt-3 text-mist/80">{project.period}</p>}
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-mist">{project.summary}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {(project.stack || []).map((s) => (
              <li key={s} className="chip">
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            {project.repo && (
              <a href={project.repo} target="_blank" rel="noreferrer noopener" className="btn-primary">
                <GithubIcon className="h-4 w-4" /> View code
              </a>
            )}
            {project.demo && (
              <a href={project.demo} target="_blank" rel="noreferrer noopener" className="btn-ghost">
                <ArrowUpRight className="h-4 w-4" /> Live demo
              </a>
            )}
            {!project.repo && (
              <a href={profile.github} target="_blank" rel="noreferrer noopener" className="btn-ghost">
                <GithubIcon className="h-4 w-4" /> More on GitHub
              </a>
            )}
          </div>
        </div>
        <div className="glass aspect-[16/10] overflow-hidden rounded-3xl p-4">
          <ProjectCover project={project} />
        </div>
      </motion.div>

      {(project.highlights || []).length > 0 && (
      <Reveal className="mt-16">
        <h2 className="font-display text-2xl font-bold">What I did</h2>
        <SpotlightCard className="mt-5 p-6 sm:p-8">
          <ul className="space-y-4">
            {(project.highlights || []).map((h) => (
              <li key={h} className="flex gap-3 leading-relaxed text-fog/90">
                <Check className="mt-1 h-5 w-5 shrink-0 text-mint" />
                {h}
              </li>
            ))}
          </ul>
        </SpotlightCard>
      </Reveal>
      )}

      {projects.length > 1 && (
      <Reveal className="mt-14">
        <p className="text-sm text-mist">Next project</p>
        <Link to={`/project/${next.id}`} className="mt-1 inline-flex items-center gap-2 font-display text-2xl font-bold transition hover:text-signal">
          {next.title} <ArrowUpRight className="h-5 w-5" />
        </Link>
      </Reveal>
      )}
    </main>
  )
}
