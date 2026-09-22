import { useContent } from '../hooks/useContent.jsx'

// Endless scrolling strip of tool names. Pauses on hover.
export default function Marquee() {
  const { skills } = useContent()
  const tools = [...new Set(skills.flatMap((g) => g.items))]
  if (tools.length === 0) return null
  const row = [...tools, ...tools]
  return (
    <div className="group relative overflow-hidden border-y border-ink-700/70 bg-ink-900/50 py-5 backdrop-blur-sm" aria-hidden="true">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-950 to-transparent" />
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap group-hover:[animation-play-state:paused]">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-12 font-display text-xl font-semibold text-mist/80">
            {t}
            <i className="block h-1.5 w-1.5 rounded-full bg-signal/70" />
          </span>
        ))}
      </div>
    </div>
  )
}
