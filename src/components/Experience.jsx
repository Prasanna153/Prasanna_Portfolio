import { Link } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import { experience } from '../data/portfolio.js'
import Reveal from './Reveal.jsx'
import SectionHeading from './SectionHeading.jsx'
import SpotlightCard from './SpotlightCard.jsx'

export default function Experience() {
  return (
    <section id="experience" className="section" aria-labelledby="exp-title">
      <SectionHeading id="exp-title" title="Experience" text="Internships and hands-on training." />
      <ol className="relative space-y-6 border-l border-ink-600 pl-8 sm:pl-10">
        {experience.map((e, i) => (
          <li key={e.role + e.period} className="relative">
            <span className="absolute -left-[2.45rem] top-6 flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 ring-2 ring-signal sm:-left-[3.2rem]">
              <Briefcase className="h-4 w-4 text-signal" />
            </span>
            <Reveal delay={i * 0.08}>
              <SpotlightCard className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                  <div>
                    <h3 className="font-display text-2xl font-bold">{e.role}</h3>
                    <p className="mt-1 text-mist">{e.company}</p>
                  </div>
                  <span className="chip">{e.period}</span>
                </div>
                <ul className="mt-5 list-disc space-y-2 pl-5 leading-relaxed text-fog/85 marker:text-signal">
                  {e.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <Link to="/certificates" className="mt-6 inline-block text-sm font-semibold text-signal hover:text-signal-soft">
                  View internship certificate
                </Link>
              </SpotlightCard>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  )
}
