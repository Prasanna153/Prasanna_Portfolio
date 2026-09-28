import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Download, ExternalLink, X } from 'lucide-react'

// Full-screen certificate viewer. Arrow keys / swipe buttons to browse, Esc to close.
export default function Lightbox({ items, index, onClose, onChange }) {
  const cert = index !== null ? items[index] : null
  const closeRef = useRef(null)

  useEffect(() => {
    if (!cert) return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onChange((index + 1) % items.length)
      if (e.key === 'ArrowLeft') onChange((index - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [cert, index, items.length, onChange, onClose])

  return (
    <AnimatePresence>
      {cert && (
        <motion.div
          key="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={cert.title}
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-ink-950/90 p-4 backdrop-blur-md sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close certificate viewer"
            className="absolute right-4 top-4 rounded-full border border-ink-600 bg-ink-800/80 p-2.5 text-fog transition hover:border-signal hover:text-signal sm:right-8 sm:top-8"
          >
            <X className="h-5 w-5" />
          </button>

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onChange((index - 1 + items.length) % items.length)
                }}
                aria-label="Previous certificate"
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-ink-600 bg-ink-800/80 p-2.5 text-fog transition hover:border-signal hover:text-signal sm:left-6"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onChange((index + 1) % items.length)
                }}
                aria-label="Next certificate"
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-ink-600 bg-ink-800/80 p-2.5 text-fog transition hover:border-signal hover:text-signal sm:right-6"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <motion.div
            key={cert.id}
            className="flex max-h-full w-full max-w-4xl flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={cert.image}
              alt={`Certificate: ${cert.title}`}
              className="max-h-[68vh] w-auto max-w-full rounded-xl border border-ink-600 bg-white object-contain shadow-2xl"
            />
            <div className="text-center">
              <h3 className="font-display text-xl font-bold text-fog sm:text-2xl">{cert.title}</h3>
              <p className="mt-1 text-sm text-mist">
                {[cert.issuer, cert.date].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href={cert.image} download className="btn-primary">
                <Download className="h-4 w-4" /> Download
              </a>
              {cert.verifyUrl && (
                <a href={cert.verifyUrl} target="_blank" rel="noreferrer noopener" className="btn-ghost">
                  <ExternalLink className="h-4 w-4" /> Verify online
                </a>
              )}
              <span className="text-xs text-mist">
                {index + 1} of {items.length}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
