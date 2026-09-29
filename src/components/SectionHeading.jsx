import Reveal from './Reveal.jsx'

export default function SectionHeading({ title, text, id }) {
  return (
    <Reveal className="mb-12 max-w-2xl">
      <h2 id={id} className="font-display text-4xl font-bold tracking-tight text-fog sm:text-5xl">
        {title}
      </h2>
      {text && <p className="mt-4 text-lg leading-relaxed text-mist">{text}</p>}
    </Reveal>
  )
}
