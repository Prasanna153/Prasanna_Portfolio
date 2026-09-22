import { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, ZoomIn } from 'lucide-react'
import Lightbox from './Lightbox.jsx'
import SpotlightCard from './SpotlightCard.jsx'

export default function CertificateGallery({ certs, loading }) {
  const [openIndex, setOpenIndex] = useState(null)

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass h-72 animate-pulse rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!certs.length) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-mist">
        <Award className="mx-auto mb-3 h-8 w-8 text-signal" />
        No certificates yet. Sign in at /admin to add your first one.
      </div>
    )
  }

  return (
    <>
      <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {certs.map((c, i) => (
          <motion.div
            layout
            className="h-full"
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: (i % 3) * 0.07 }}
          >
            <SpotlightCard as="button" type="button" onClick={() => setOpenIndex(i)} className="group flex h-full w-full flex-col text-left" aria-label={`Open certificate: ${c.title}`}>
              <div className="relative aspect-[3/2] overflow-hidden bg-ink-800">
                <img
                  src={c.image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-ink-950/50 opacity-0 transition duration-300 group-hover:opacity-100">
                  <span className="flex items-center gap-2 rounded-full bg-signal px-4 py-2 text-sm font-semibold text-ink-950">
                    <ZoomIn className="h-4 w-4" /> View certificate
                  </span>
                </div>
                <span className="absolute left-3 top-3 rounded-full border border-ink-600/80 bg-ink-900/85 px-3 py-1 text-xs font-medium text-signal-soft">
                  {c.category}
                </span>
              </div>
              <div className="flex-1 p-5">
                <h3 className="font-display text-lg font-bold leading-snug text-fog">{c.title}</h3>
                <p className="mt-1.5 text-sm text-mist">{[c.issuer, c.date].filter(Boolean).join(' · ')}</p>
              </div>
            </SpotlightCard>
          </motion.div>
        ))}
      </motion.div>
      <Lightbox items={certs} index={openIndex} onClose={() => setOpenIndex(null)} onChange={setOpenIndex} />
    </>
  )
}
