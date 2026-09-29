import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, CircleAlert, ImagePlus, Inbox, KeyRound, Loader2, LogOut, Pencil, Trash2, Upload, X } from 'lucide-react'
import { api, ApiError, clearToken, getToken, setToken } from '../lib/api.js'
import Notice from './admin/Notice.jsx'
import ProjectsManager from './admin/ProjectsManager.jsx'
import SkillsManager from './admin/SkillsManager.jsx'
import ResumeManager from './admin/ResumeManager.jsx'

const CATEGORIES = ['Course', 'Internship', 'Conference', 'Other']

/* ───────────── login ───────────── */
function Login({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { token } = await api('/api/admin/login', { method: 'POST', body: { username, password } })
      setToken(token)
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md space-y-5 rounded-3xl p-8"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 text-signal ring-1 ring-ink-600">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold">Admin login</h1>
            <p className="text-sm text-mist">Sign in to manage your website.</p>
          </div>
        </div>
        <label className="block text-sm text-mist">
          Username
          <input className="field mt-1.5" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus required />
        </label>
        <label className="block text-sm text-mist">
          Password
          <input type="password" className="field mt-1.5" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        <Notice kind="error">{error}</Notice>
        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
        </button>
        <Link to="/" className="flex items-center justify-center gap-2 text-sm text-mist hover:text-signal">
          <ArrowLeft className="h-4 w-4" /> Back to website
        </Link>
      </motion.form>
    </div>
  )
}

/* ───────────── upload form ───────────── */
function UploadForm({ onAdded, onAuthError }) {
  const empty = { title: '', issuer: '', date: '', category: 'Course', verifyUrl: '' }
  const [fields, setFields] = useState(empty)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [drag, setDrag] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState({ kind: '', text: '' })
  const inputRef = useRef(null)

  useEffect(() => {
    if (!file) {
      setPreview('')
      return undefined
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const pick = (f) => {
    if (!f) return
    if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) {
      setMsg({ kind: 'error', text: 'Please choose a JPG, PNG or WebP image.' })
      return
    }
    if (f.size > 8 * 1024 * 1024) {
      setMsg({ kind: 'error', text: 'That image is larger than 8 MB. Please choose a smaller one.' })
      return
    }
    setMsg({ kind: '', text: '' })
    setFile(f)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!file) return setMsg({ kind: 'error', text: 'Please choose the certificate image first.' })
    if (!fields.title.trim()) return setMsg({ kind: 'error', text: 'Please enter a certificate title.' })
    setBusy(true)
    setMsg({ kind: '', text: '' })
    const form = new FormData()
    Object.entries(fields).forEach(([k, v]) => form.append(k, v))
    form.append('image', file)
    try {
      const item = await api('/api/admin/certificates', { method: 'POST', auth: true, form })
      onAdded(item)
      setFields(empty)
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
      setMsg({ kind: 'ok', text: 'Certificate added. It is now live on your website.' })
    } catch (err) {
      if (err.status === 401) return onAuthError()
      setMsg({ kind: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form onSubmit={submit} className="glass space-y-5 rounded-3xl p-6 sm:p-8">
      <h2 className="font-display text-2xl font-bold">Add a certificate</h2>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          pick(e.dataTransfer.files?.[0])
        }}
        className={`relative flex min-h-[11rem] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 text-center transition ${
          drag ? 'border-signal bg-signal/10' : 'border-ink-600 bg-ink-900/50'
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Selected certificate preview" className="max-h-52 rounded-lg" />
            <button type="button" onClick={() => setFile(null)} className="absolute right-3 top-3 rounded-full bg-ink-950/80 p-1.5 text-fog hover:text-signal" aria-label="Remove selected image">
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <ImagePlus className="h-8 w-8 text-signal" />
            <p className="text-fog">Drag the certificate image here</p>
            <p className="text-sm text-mist">JPG, PNG or WebP, up to 8 MB</p>
            <button type="button" onClick={() => inputRef.current?.click()} className="btn-ghost mt-1 !py-2">
              <Upload className="h-4 w-4" /> Choose image
            </button>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} aria-label="Certificate image" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-mist sm:col-span-2">
          Certificate title *
          <input className="field mt-1.5" value={fields.title} onChange={set('title')} maxLength={140} placeholder="e.g. Advanced Excel" />
        </label>
        <label className="block text-sm text-mist">
          Issued by
          <input className="field mt-1.5" value={fields.issuer} onChange={set('issuer')} maxLength={140} placeholder="e.g. HCL GUVI" />
        </label>
        <label className="block text-sm text-mist">
          Date
          <input className="field mt-1.5" value={fields.date} onChange={set('date')} maxLength={60} placeholder="e.g. March 2026" />
        </label>
        <label className="block text-sm text-mist">
          Type
          <select className="field mt-1.5" value={fields.category} onChange={set('category')}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-mist">
          Verify link (optional)
          <input className="field mt-1.5" value={fields.verifyUrl} onChange={set('verifyUrl')} maxLength={500} placeholder="https://…" inputMode="url" />
        </label>
      </div>

      <Notice kind={msg.kind}>{msg.text}</Notice>
      <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {busy ? 'Uploading' : 'Add certificate'}
      </button>
    </form>
  )
}

/* ───────────── one row in the list ───────────── */
function CertRow({ cert, onChanged, onRemoved, onAuthError }) {
  const [editing, setEditing] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [f, setF] = useState({ title: cert.title, issuer: cert.issuer, date: cert.date, category: cert.category, verifyUrl: cert.verifyUrl || '' })
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  const guard = async (fn) => {
    setBusy(true)
    setError('')
    try {
      await fn()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return onAuthError()
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const save = () =>
    guard(async () => {
      const item = await api(`/api/admin/certificates/${cert.id}`, { method: 'PUT', auth: true, body: f })
      onChanged(item)
      setEditing(false)
    })

  const remove = () =>
    guard(async () => {
      await api(`/api/admin/certificates/${cert.id}`, { method: 'DELETE', auth: true })
      onRemoved(cert.id)
    })

  return (
    <motion.li layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }} className="glass rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-4">
        <img src={cert.image} alt="" className="h-16 w-24 rounded-lg border border-ink-600 bg-white object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{cert.title}</p>
          <p className="truncate text-sm text-mist">{[cert.category, cert.issuer, cert.date].filter(Boolean).join(' · ')}</p>
        </div>
        <div className="flex items-center gap-2">
          {confirm ? (
            <>
              <span className="text-sm text-mist">Delete this certificate?</span>
              <button onClick={remove} disabled={busy} className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-60">
                {busy ? 'Deleting' : 'Yes, delete'}
              </button>
              <button onClick={() => setConfirm(false)} className="btn-ghost !px-4 !py-2">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing((e) => !e)} className="btn-ghost !px-4 !py-2" aria-expanded={editing}>
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <button onClick={() => setConfirm(true)} className="btn-ghost !px-4 !py-2 hover:!border-red-400 hover:!text-red-300" aria-label={`Delete ${cert.title}`}>
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {editing && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="grid gap-3 pt-4 sm:grid-cols-2">
              <input className="field sm:col-span-2" value={f.title} onChange={set('title')} aria-label="Title" maxLength={140} />
              <input className="field" value={f.issuer} onChange={set('issuer')} aria-label="Issued by" placeholder="Issued by" maxLength={140} />
              <input className="field" value={f.date} onChange={set('date')} aria-label="Date" placeholder="Date" maxLength={60} />
              <select className="field" value={f.category} onChange={set('category')} aria-label="Type">
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input className="field" value={f.verifyUrl} onChange={set('verifyUrl')} aria-label="Verify link" placeholder="Verify link (optional)" maxLength={500} />
            </div>
            <div className="mt-3 flex gap-3">
              <button onClick={save} disabled={busy} className="btn-primary !py-2 disabled:opacity-60">
                Save changes
              </button>
              <button onClick={() => setEditing(false)} className="btn-ghost !py-2">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && (
        <div className="mt-3">
          <Notice kind="error">{error}</Notice>
        </div>
      )}
    </motion.li>
  )
}

/* ───────────── dashboard ───────────── */
function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('projects')
  const [projectCount, setProjectCount] = useState(null)
  const [certs, setCerts] = useState(null)
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')

  const authError = useCallback(() => {
    clearToken()
    onLogout()
  }, [onLogout])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [c, m] = await Promise.all([api('/api/certificates'), api('/api/admin/messages', { auth: true })])
        if (!alive) return
        setCerts(c)
        setMessages(m)
      } catch (err) {
        if (!alive) return
        if (err.status === 401) return authError()
        setError(err.message)
        setCerts([])
      }
    })()
    return () => {
      alive = false
    }
  }, [authError])

  const removeMessage = async (id) => {
    try {
      await api(`/api/admin/messages/${id}`, { method: 'DELETE', auth: true })
      setMessages((m) => m.filter((x) => x.id !== id))
    } catch (err) {
      if (err.status === 401) return authError()
      setError(err.message)
    }
  }

  const tabBtn = (id, label) => (
    <button
      onClick={() => setTab(id)}
      aria-pressed={tab === id}
      className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition ${tab === id ? 'bg-signal text-ink-950' : 'text-mist hover:text-fog'}`}
    >
      {label}
    </button>
  )

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin dashboard</h1>
          <p className="text-mist">Changes here appear on your live website straight away.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/" className="btn-ghost !py-2.5">
            <ArrowLeft className="h-4 w-4" /> View website
          </Link>
          <button
            onClick={() => {
              clearToken()
              onLogout()
            }}
            className="btn-ghost !py-2.5"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </header>

      <div className="glass mb-8 flex max-w-full gap-1 overflow-x-auto rounded-full p-1 sm:inline-flex">
        {tabBtn('projects', `Projects${projectCount === null ? '' : ` (${projectCount})`}`)}
        {tabBtn('skills', 'Skills')}
        {tabBtn('certs', `Certificates${certs ? ` (${certs.length})` : ''}`)}
        {tabBtn('resume', 'Resume')}
        {tabBtn('msgs', `Messages (${messages.length})`)}
      </div>

      <Notice kind="error">{error}</Notice>

      <div className={tab === 'projects' ? '' : 'hidden'}>
        <ProjectsManager onAuthError={authError} onCount={setProjectCount} />
      </div>
      <div className={tab === 'skills' ? '' : 'hidden'}>
        <SkillsManager onAuthError={authError} />
      </div>
      <div className={tab === 'resume' ? '' : 'hidden'}>
        <ResumeManager onAuthError={authError} />
      </div>

      {tab === 'certs' && (
        <div className="space-y-8">
          <UploadForm onAdded={(item) => setCerts((c) => [item, ...(c || [])])} onAuthError={authError} />
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold">Your certificates</h2>
            {certs === null ? (
              <div className="glass h-24 animate-pulse rounded-2xl" />
            ) : certs.length === 0 ? (
              <p className="glass rounded-2xl p-6 text-mist">No certificates yet. Add your first one above.</p>
            ) : (
              <ul className="space-y-3">
                <AnimatePresence initial={false}>
                  {certs.map((c) => (
                    <CertRow
                      key={c.id}
                      cert={c}
                      onAuthError={authError}
                      onChanged={(item) => setCerts((list) => list.map((x) => (x.id === item.id ? item : x)))}
                      onRemoved={(id) => setCerts((list) => list.filter((x) => x.id !== id))}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </section>
        </div>
      )}

      {tab === 'msgs' && (
        <section>
          {messages.length === 0 ? (
            <p className="glass flex items-center gap-3 rounded-2xl p-6 text-mist">
              <Inbox className="h-5 w-5 text-signal" /> No messages yet. Messages from your contact form appear here.
            </p>
          ) : (
            <ul className="space-y-3">
              {messages.map((m) => (
                <li key={m.id} className="glass rounded-2xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{m.name}</p>
                      <a href={`mailto:${m.email}`} className="text-sm text-signal hover:underline">
                        {m.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <time className="text-xs text-mist" dateTime={m.createdAt}>
                        {new Date(m.createdAt).toLocaleString()}
                      </time>
                      <button onClick={() => removeMessage(m.id)} aria-label={`Delete message from ${m.name}`} className="text-mist hover:text-red-300">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed text-fog/90">{m.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}

/* ───────────── page ───────────── */
export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(Boolean(getToken()))

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    document.title = 'Admin | Prasanna T'
    return () => {
      meta.remove()
    }
  }, [])

  useEffect(() => {
    if (!getToken()) return
    api('/api/admin/session', { auth: true })
      .then(() => setAuthed(true))
      .catch(() => clearToken())
      .finally(() => setChecking(false))
  }, [])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-signal" />
      </div>
    )
  }
  return authed ? <Dashboard onLogout={() => setAuthed(false)} /> : <Login onSuccess={() => setAuthed(true)} />
}
