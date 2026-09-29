import { motion } from 'framer-motion'
import { Check, CircleAlert } from 'lucide-react'

export default function Notice({ kind, children }) {
  if (!children) return null
  const good = kind === 'ok'
  return (
    <motion.p
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      role={good ? 'status' : 'alert'}
      className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
        good ? 'border-mint/40 bg-mint/10 text-mint' : 'border-red-400/40 bg-red-400/10 text-red-200'
      }`}
    >
      {good ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />}
      {children}
    </motion.p>
  )
}
