import { motion, useReducedMotion } from 'framer-motion'

// Small drawn chart used as the "cover image" of a project card.
// kind: 'line' | 'bars' | 'donut'
export default function ChartArt({ kind = 'bars', className = '' }) {
  const reduce = useReducedMotion()
  const anim = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          whileInView: { pathLength: 1, opacity: 1 },
          viewport: { once: true },
          transition: { duration: 1.2, delay, ease: 'easeOut' },
        }

  return (
    <svg viewBox="0 0 400 220" className={className} role="img" aria-label={`${kind} chart illustration`}>
      <defs>
        <linearGradient id={`fill-${kind}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7C9CFF" stopOpacity="0.35" />
          <stop offset="1" stopColor="#7C9CFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[40, 90, 140, 190].map((y) => (
        <line key={y} x1="24" x2="376" y1={y} y2={y} stroke="#8E99B4" strokeOpacity="0.14" />
      ))}

      {kind === 'line' && (
        <>
          <path d="M24 170 L80 140 L136 152 L192 100 L248 116 L304 64 L376 46 L376 200 L24 200 Z" fill="url(#fill-line)" />
          <motion.path
            d="M24 170 L80 140 L136 152 L192 100 L248 116 L304 64 L376 46"
            fill="none"
            stroke="#7C9CFF"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            {...anim()}
          />
          <motion.path
            d="M24 182 L80 172 L136 176 L192 150 L248 158 L304 128 L376 118"
            fill="none"
            stroke="#3DDBC0"
            strokeWidth="2"
            strokeDasharray="5 6"
            strokeLinecap="round"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.9 }}
          />
          {[[80, 140], [192, 100], [304, 64], [376, 46]].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="5" fill="#0B0F19" stroke="#F5B83D" strokeWidth="2.5" />
          ))}
        </>
      )}

      {kind === 'bars' &&
        [
          [44, 80, '#7C9CFF'],
          [102, 130, '#7C9CFF'],
          [160, 100, '#7C9CFF'],
          [218, 160, '#3DDBC0'],
          [276, 120, '#7C9CFF'],
          [334, 175, '#F5B83D'],
        ].map(([x, h, c], i) => (
          <motion.rect
            key={x}
            x={x}
            width="34"
            rx="6"
            fill={c}
            initial={reduce ? false : { y: 200, height: 0 }}
            whileInView={{ y: 200 - h, height: h }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}

      {kind === 'donut' && (
        <g transform="translate(200 110) rotate(-90)">
          <circle r="62" fill="none" stroke="#1A2236" strokeWidth="26" />
          {[
            ['#F5B83D', 145, 0],
            ['#7C9CFF', 115, -160],
            ['#3DDBC0', 85, -290],
          ].map(([c, len, off], i) => (
            <motion.circle
              key={c}
              r="62"
              fill="none"
              stroke={c}
              strokeWidth="26"
              strokeDashoffset={off}
              initial={reduce ? { strokeDasharray: `${len} 390` } : { strokeDasharray: '0 390' }}
              whileInView={{ strokeDasharray: `${len} 390` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15 * i, ease: 'easeOut' }}
            />
          ))}
        </g>
      )}
    </svg>
  )
}
