import { GraduationCap } from 'lucide-react'
import { courses, education } from '../data/portfolio.js'
import { iconMap } from './Skills.jsx'
import Reveal from './Reveal.jsx'
import SectionHeading from './SectionHeading.jsx'
import SpotlightCard from './SpotlightCard.jsx'

export default function Education() {
  return (
    <section id="education" className="section" aria-labelledby="edu-title">
      <SectionHeading id="edu-title" title="Education and courses" text="Where I studied, and what I trained in on top of my degree." />

      <ol className="relative space-y-6 border-l border-ink-600 pl-8 sm:pl-10">
        {education.map((e, i) => (
          <li key={e.title} className="relative">
            <span className="absolute -left-[2.45rem] top-6 flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 ring-2 ring-plot sm:-left-[3.2rem]">
              <GraduationCap className="h-4 w-4 text-plot" />
            </span>
            <Reveal delay={i * 0.08}>
              <SpotlightCard className="p-6 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                  <div>
                    <h3 className="font-display text-xl font-bold sm:text-2xl">{e.title}</h3>
                    <p className="mt-1 text-mist">{e.place}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="chip">{e.period}</span>
                    <span className="chip border-signal/40 text-signal-soft">{e.result}</span>
                  </div>
                </div>
              </SpotlightCard>
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal className="mb-6 mt-20">
        <h3 className="font-display text-3xl font-bold tracking-tight">Courses and training</h3>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c, i) => {
          const Icon = iconMap[c.icon] || iconMap.award
          return (
            <Reveal key={c.title} delay={(i % 3) * 0.06}>
              <SpotlightCard className="flex h-full items-start gap-4 p-5">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-mint ring-1 ring-ink-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-semibold leading-snug text-fog">{c.title}</h4>
                  <p className="mt-1 text-sm text-mist">{c.provider}</p>
                </div>
              </SpotlightCard>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
