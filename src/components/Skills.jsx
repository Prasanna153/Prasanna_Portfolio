import { motion } from 'framer-motion'
import { Award, BarChart3, BrainCircuit, Code2, Database, Table2, Wrench } from 'lucide-react'
import { useContent } from '../hooks/useContent.jsx'
import Reveal from './Reveal.jsx'
import SectionHeading from './SectionHeading.jsx'
import SpotlightCard from './SpotlightCard.jsx'

export const iconMap = {
  chart: BarChart3,
  code: Code2,
  database: Database,
  brain: BrainCircuit,
  wrench: Wrench,
  table: Table2,
  award: Award,
}

const spans = ['lg:col-span-3', 'lg:col-span-3', 'lg:col-span-2', 'lg:col-span-2', 'lg:col-span-2']

export default function Skills() {
  const { skills: skillGroups } = useContent()
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <SectionHeading id="skills-title" title="Skills" text="The tools I use to clean, model and present data." />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
        {skillGroups.map((g, i) => {
          const Icon = iconMap[g.icon] || Code2
          return (
            <Reveal key={g.title} delay={i * 0.06} className={spans[i % spans.length]}>
              <SpotlightCard className="h-full p-6">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-signal ring-1 ring-ink-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-xl font-bold">{g.title}</h3>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <motion.li key={s} whileHover={{ y: -3 }} className="chip cursor-default transition-colors hover:border-signal/60 hover:text-signal-soft">
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </SpotlightCard>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
