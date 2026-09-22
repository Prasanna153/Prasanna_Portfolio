import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { CloudSun, Download, Moon, Sun, Sunset } from 'lucide-react'
import { profile } from '../data/portfolio.js'
import { useContent } from '../hooks/useContent.jsx'
import useTypingEffect from '../hooks/useTypingEffect.js'
import { GithubIcon, LinkedinIcon } from './Icons.jsx'
import CountUp from './CountUp.jsx'

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return { text: 'Working late? Hello', Icon: Moon }
  if (h < 12) return { text: 'Good morning', Icon: Sun }
  if (h < 17) return { text: 'Good afternoon', Icon: CloudSun }
  if (h < 21) return { text: 'Good evening', Icon: Sunset }
  return { text: 'Good evening', Icon: Moon }
}

const parent = { hidden: {}, show: { transition: { staggerChildren: 0.11, delayChildren: 0.1 } } }
const child = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const chips = [
  { label: 'Power BI', dot: 'bg-signal', pos: 'left-[-4%] top-[10%]', delay: '0s' },
  { label: 'SQL', dot: 'bg-plot', pos: 'right-[-5%] top-[38%]', delay: '1.2s' },
  { label: 'Python', dot: 'bg-mint', pos: 'left-[-6%] bottom-[22%]', delay: '2.1s' },
]

function PortraitCard() {
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 150, damping: 18 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 150, damping: 18 })

  const onMove = (e) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    mx.set(0)
    my.set(0)
  }

  const bars = [42, 68, 54, 86, 72, 100]

  return (
    <motion.div
      variants={child}
      className="relative mx-auto w-full max-w-[26rem] [perspective:1100px]"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <motion.div style={reduce ? undefined : { rotateX: rx, rotateY: ry }} className="relative [transform-style:preserve-3d]">
        <div className="glass relative aspect-[4/5] overflow-hidden rounded-[2rem] p-2">
          <img
            src={profile.photo}
            alt={`Portrait of ${profile.name}`}
            className="h-full w-full rounded-[1.6rem] object-cover object-top"
            width="900"
            height="1125"
          />
          <div className="pointer-events-none absolute inset-2 rounded-[1.6rem] bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
          <div className="absolute inset-x-6 bottom-6">
            <p className="font-display text-xl font-bold">{profile.name}</p>
            <p className="mt-0.5 flex items-center gap-2 text-sm text-fog/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
              </span>
              Available for Data Analyst roles
            </p>
          </div>
        </div>

        {/* mini chart card overlapping the photo corner */}
        <div
          style={{ transform: 'translateZ(70px)' }}
          className="glass absolute -bottom-6 -right-3 h-24 w-[38%] rounded-2xl p-3 shadow-xl sm:-right-10 sm:h-32 sm:w-[46%] sm:p-4"
          aria-hidden="true"
        >
          <div className="flex h-full items-end gap-1.5 sm:gap-2">
            {bars.map((b, i) => (
              <motion.span
                key={i}
                className={`w-full rounded-[5px] ${i === bars.length - 1 ? 'bg-signal' : i === 3 ? 'bg-mint' : 'bg-plot/80'}`}
                initial={reduce ? false : { height: 0 }}
                animate={{ height: `${b}%` }}
                transition={{ duration: 0.9, delay: 0.7 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </div>
        </div>

        {chips.map((c) => (
          <span
            key={c.label}
            style={{ animationDelay: c.delay, transform: 'translateZ(50px)' }}
            className={`glass absolute ${c.pos} flex animate-floaty items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
            {c.label}
          </span>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default function Hero({ certCount }) {
  const reduce = useReducedMotion()
  const role = useTypingEffect(profile.roles, { disabled: reduce })
  const [hello, setHello] = useState(greeting)
  useEffect(() => {
    const t = setInterval(() => setHello(greeting()), 60 * 1000)
    return () => clearInterval(t)
  }, [])
  const { projects, skills } = useContent()
  const toolCount = useMemo(() => new Set(skills.flatMap((g) => g.items)).size, [skills])

  const stats = [
    { n: projects.length, label: 'Projects' },
    { n: certCount, label: 'Certificates' },
    { n: toolCount, label: 'Tools & skills' },
  ]

  return (
    <section id="home" className="relative overflow-hidden">
      <div className="grid-paper pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto grid min-h-[100svh] w-full max-w-6xl items-center gap-16 px-5 pb-20 pt-32 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:pt-28">
        <motion.div variants={parent} initial={reduce ? false : 'hidden'} animate="show">
          <motion.p variants={child} className="flex items-center gap-2.5 text-base text-mist">
            <hello.Icon className="h-5 w-5 text-signal" aria-hidden="true" />
            {hello.text}, I am
          </motion.p>

          <motion.h1 variants={child} className="mt-3 whitespace-nowrap font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl xl:text-[5.25rem]">
            {profile.name}
          </motion.h1>

          <motion.p variants={child} className="mt-6 flex h-10 items-center font-mono text-xl text-signal sm:text-2xl" aria-label={profile.roles.join(', ')}>
            <span aria-hidden="true">{role}</span>
            <span aria-hidden="true" className="ml-1 inline-block h-6 w-[3px] animate-blink bg-signal" />
          </motion.p>

          <motion.p variants={child} className="mt-6 max-w-xl font-display text-2xl font-semibold leading-snug text-fog sm:text-[1.7rem]">
            {profile.headline}
          </motion.p>
          <motion.p variants={child} className="mt-4 max-w-xl text-lg leading-relaxed text-mist">
            {profile.intro}
          </motion.p>

          <motion.ul variants={child} className="mt-6 flex flex-wrap gap-2">
            {profile.focus.map((f) => (
              <li key={f} className="chip">
                {f}
              </li>
            ))}
          </motion.ul>

          <motion.div variants={child} className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/#projects" className="btn-primary">
              View my projects
            </Link>
            <a href={profile.resume} download="Prasanna_T_Resume.pdf" className="btn-ghost">
              <Download className="h-4 w-4" /> Download resume
            </a>
            <div className="ml-1 flex items-center gap-1.5">
              <a href={profile.github} target="_blank" rel="noreferrer noopener" aria-label="GitHub profile" className="rounded-full border border-ink-600 p-3 text-mist transition hover:border-signal hover:text-signal">
                <GithubIcon />
              </a>
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noreferrer noopener" aria-label="LinkedIn profile" className="rounded-full border border-ink-600 p-3 text-mist transition hover:border-signal hover:text-signal">
                  <LinkedinIcon />
                </a>
              )}
            </div>
          </motion.div>

          <motion.dl variants={child} className="mt-12 flex gap-10">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col">
                <dt className="order-2 mt-1 text-sm text-mist">{s.label}</dt>
                <dd className="font-display text-4xl font-bold text-fog">
                  <CountUp to={s.n} />
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        <motion.div variants={parent} initial={reduce ? false : 'hidden'} animate="show">
          <PortraitCard />
        </motion.div>
      </div>
    </section>
  )
}
