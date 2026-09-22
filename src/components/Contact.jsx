import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleAlert, Check, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react'
import { profile } from '../data/portfolio.js'
import { api } from '../lib/api.js'
import { GithubIcon, LinkedinIcon } from './Icons.jsx'
import Reveal from './Reveal.jsx'
import SectionHeading from './SectionHeading.jsx'
import SpotlightCard from './SpotlightCard.jsx'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.message.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      setStatus('error')
      setError('Please enter your name, a valid email and a message.')
      return
    }
    setStatus('sending')
    try {
      await api('/api/contact', { method: 'POST', body: form })
      setStatus('sent')
      setForm({ name: '', email: '', message: '', website: '' })
    } catch (err) {
      if (err.status === 0 || err.status === 404 || err.status === 405) {
        // no server (static hosting): open the visitor's email app instead
        const body = `${form.message}\n\n— ${form.name} (${form.email})`
        window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`Portfolio message from ${form.name}`)}&body=${encodeURIComponent(body)}`
        setStatus('idle')
        return
      }
      setStatus('error')
      setError(err.message)
    }
  }

  const links = [
    { icon: Mail, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    profile.showPhone && { icon: Phone, label: 'Phone', value: profile.phone, href: `tel:${profile.phone}` },
    { icon: MapPin, label: 'Location', value: profile.location },
  ].filter(Boolean)

  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <SectionHeading id="contact-title" title="Let's talk about your data" text="Hiring for a data role or have a dashboard in mind? Send a message and I will reply by email." />
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {links.map((l, i) => (
            <Reveal key={l.label} delay={i * 0.07}>
              <SpotlightCard className="flex items-center gap-4 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-signal ring-1 ring-ink-600">
                  <l.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-mist">{l.label}</p>
                  {l.href ? (
                    <a href={l.href} className="break-all font-medium text-fog hover:text-signal">
                      {l.value}
                    </a>
                  ) : (
                    <p className="font-medium text-fog">{l.value}</p>
                  )}
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
          <Reveal delay={0.2}>
            <div className="flex gap-3 pt-2">
              <a href={profile.github} target="_blank" rel="noreferrer noopener" className="btn-ghost">
                <GithubIcon className="h-4 w-4" /> GitHub
              </a>
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noreferrer noopener" className="btn-ghost">
                  <LinkedinIcon className="h-4 w-4" /> LinkedIn
                </a>
              )}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <SpotlightCard as="form" onSubmit={submit} noValidate className="space-y-4 p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-mist">
                Your name
                <input className="field mt-1.5" value={form.name} onChange={set('name')} autoComplete="name" maxLength={80} />
              </label>
              <label className="block text-sm text-mist">
                Your email
                <input type="email" className="field mt-1.5" value={form.email} onChange={set('email')} autoComplete="email" maxLength={120} />
              </label>
            </div>
            <label className="block text-sm text-mist">
              Message
              <textarea className="field mt-1.5 min-h-[9rem] resize-y" value={form.message} onChange={set('message')} maxLength={2000} />
            </label>
            {/* hidden trap field: real people never see or fill this */}
            <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set('website')} className="absolute left-[-9999px] h-0 w-0 opacity-0" name="website" />

            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" disabled={status === 'sending'} className="btn-primary disabled:opacity-60">
                {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {status === 'sending' ? 'Sending' : 'Send message'}
              </button>
              <AnimatePresence mode="wait">
                {status === 'sent' && (
                  <motion.p key="ok" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} role="status" className="flex items-center gap-2 text-sm text-mint">
                    <Check className="h-4 w-4" /> Message sent. Thank you!
                  </motion.p>
                )}
                {status === 'error' && (
                  <motion.p key="err" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} role="alert" className="flex items-center gap-2 text-sm text-red-300">
                    <CircleAlert className="h-4 w-4" /> {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  )
}
