import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useContent } from '../hooks/useContent.jsx'
import ChartArt from './ChartArt.jsx'
import Reveal from './Reveal.jsx'
import SectionHeading from './SectionHeading.jsx'
import SpotlightCard from './SpotlightCard.jsx'

export function ProjectCover({ project, className = '' }) {
  if (project.image) {
    return <img src={project.image} alt={`${project.title} screenshot`} className={`h-full w-full object-cover ${className}`} loading="lazy" />
  }
  return <ChartArt kind={project.kind} className={`h-full w-full ${className}`} />
}

export default function Projects() {
  const { projects, loading } = useContent()
  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <SectionHeading id="projects-title" title="Projects" text="Dashboards and analysis I have built. Open one to see what is inside." />
      {!loading && projects.length === 0 && <p className="glass rounded-2xl p-6 text-mist">Projects will appear here soon.</p>}
      <div className="grid gap-6 lg:grid-cols-3">
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08}>
            <SpotlightCard as={Link} to={`/project/${p.id}`} className="group flex h-full flex-col">
              <div className="aspect-[16/9] overflow-hidden border-b border-ink-700/70 bg-ink-900/70 p-3">
                <ProjectCover project={p} className="transition duration-500 group-hover:scale-[1.04]" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl font-bold leading-snug">{p.title}</h3>
                {p.period && <p className="mt-1 text-sm text-mist/80">{p.period}</p>}
                <p className="mt-3 flex-1 leading-relaxed text-mist">{p.summary}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {(p.stack || []).map((s) => (
                    <li key={s} className="chip !py-0.5 !text-xs">
                      {s}
                    </li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-signal">
                  See project details
                  <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
