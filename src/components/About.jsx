import { about } from '../data/portfolio.js'
import Reveal from './Reveal.jsx'
import SectionHeading from './SectionHeading.jsx'
import SpotlightCard from './SpotlightCard.jsx'

export default function About() {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <SectionHeading id="about-title" title="About me" text="From messy spreadsheet to clear decision." />
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5 text-lg leading-relaxed text-fog/85">
          {about.paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <p>{p}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <SpotlightCard className="p-6 sm:p-7">
            <dl className="divide-y divide-ink-700/80">
              {about.facts.map((f) => (
                <div key={f.label} className="flex items-baseline justify-between gap-6 py-3.5 first:pt-0 last:pb-0">
                  <dt className="text-sm text-mist">{f.label}</dt>
                  <dd className="text-right font-medium text-fog">{f.value}</dd>
                </div>
              ))}
            </dl>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  )
}
