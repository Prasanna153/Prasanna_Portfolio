import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import { ProjectCover } from '../../components/Projects.jsx'
import Notice from './Notice.jsx'

const KINDS = [
  ['bars', 'Bar chart'],
  ['line', 'Line chart'],
  ['donut', 'Donut chart'],
]

const toForm = (p) => ({
  title: p?.title || '',
  summary: p?.summary || '',
  highlights: (p?.highlights || []).join('\n'),
  stack: (p?.stack || []).join(', '),
  period: p?.period || '',
  repo: p?.repo || '',
  demo: p?.demo || '',
  kind: p?.kind || 'bars',
})

/* ───────────── add / edit form ───────────── */
function ProjectForm({ project, onSaved, onCancel, onAuthError }) {
  const isEdit = Boolean(project)
  const [f, setF] = useState(() => toForm(project))
  const [file, setFile] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [preview, setPreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!file) return undefined
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }))

  const pick = (chosen) => {
    if (!chosen) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(chosen.type)) return setError('Please choose a JPG, PNG or WebP image.')
    if (chosen.size > 8 * 1024 * 1024) return setError('That image is too large. Please keep it under 8 MB.')
    setError('')
    setRemoveImage(false)
    setFile(chosen)
  }

  const existingImage = isEdit && project.image && !removeImage && !file ? project.image : ''
  const shownImage = file ? preview : existingImage

  const submit = async (e) => {
    e.preventDefault()
    if (!f.title.trim()) return setError('Please enter a project title.')
    setBusy(true)
    setError('')
    const form = new FormData()
    Object.entries(f).forEach(([k, v]) => form.append(k, v))
    if (file) form.append('image', file)
    else if (removeImage) form.append('removeImage', '1')
    try {
      const saved = await api(isEdit ? `/api/admin/projects/${project.id}` : '/api/admin/projects', {
        method: isEdit ? 'PUT' : 'POST',
        auth: true,
        form,
      })
      onSaved(saved, isEdit)
    } catch (err) {
      if (err.status === 401) return onAuthError()
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="glass space-y-5 rounded-3xl p-6 sm:p-8"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold">{isEdit ? 'Edit project' : 'Add a project'}</h2>
        <button type="button" onClick={onCancel} className="text-mist hover:text-fog" aria-label="Close form">
          <X className="h-5 w-5" />
        </button>
      </div>

      <label className="block text-sm text-mist">
        Project title *
        <input className="field mt-1.5" value={f.title} onChange={set('title')} maxLength={120} placeholder="e.g. Customer Churn Prediction" />
      </label>

      <label className="block text-sm text-mist">
        Short description (shown on the project card)
        <textarea className="field mt-1.5 min-h-[5.5rem]" value={f.summary} onChange={set('summary')} maxLength={500} placeholder="What is this project about, in one or two sentences?" />
      </label>

      <label className="block text-sm text-mist">
        What I did (write one point on each line)
        <textarea
          className="field mt-1.5 min-h-[8rem]"
          value={f.highlights}
          onChange={set('highlights')}
          placeholder={'Cleaned 10,000 rows of data with Pandas\nBuilt a dashboard in Power BI\nFound the top 3 reasons customers leave'}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm text-mist">
          Tools used (separate with commas)
          <input className="field mt-1.5" value={f.stack} onChange={set('stack')} placeholder="Python, Pandas, Power BI" />
        </label>
        <label className="block text-sm text-mist">
          Time period (optional)
          <input className="field mt-1.5" value={f.period} onChange={set('period')} maxLength={60} placeholder="e.g. Jun 2026 – Jul 2026" />
        </label>
        <label className="block text-sm text-mist">
          GitHub link (optional)
          <input className="field mt-1.5" value={f.repo} onChange={set('repo')} inputMode="url" placeholder="https://github.com/Prasanna153/…" />
        </label>
        <label className="block text-sm text-mist">
          Live demo link (optional)
          <input className="field mt-1.5" value={f.demo} onChange={set('demo')} inputMode="url" placeholder="https://…" />
        </label>
      </div>

      <div>
        <p className="text-sm text-mist">Cover image (optional)</p>
        <div className="mt-1.5 grid gap-4 sm:grid-cols-[14rem_1fr] sm:items-center">
          <div className="aspect-[16/9] overflow-hidden rounded-xl border border-ink-600 bg-ink-900/70 p-2">
            {shownImage ? (
              <img src={shownImage} alt="Cover preview" className="h-full w-full object-cover" />
            ) : (
              <ProjectCover project={{ title: f.title, kind: f.kind, image: '' }} />
            )}
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => inputRef.current?.click()} className="btn-ghost !py-2">
                <ImagePlus className="h-4 w-4" /> {shownImage ? 'Change image' : 'Choose image'}
              </button>
              {(file || existingImage) && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    setRemoveImage(true)
                    if (inputRef.current) inputRef.current.value = ''
                  }}
                  className="btn-ghost !py-2 hover:!border-red-400 hover:!text-red-300"
                >
                  Remove image
                </button>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label="Project cover image" onChange={(e) => pick(e.target.files?.[0])} />
            {!shownImage && (
              <label className="block text-sm text-mist">
                No image? Show a drawing instead
                <select className="field mt-1.5" value={f.kind} onChange={set('kind')}>
                  {KINDS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <p className="text-xs text-mist/80">A screenshot of your dashboard works best. JPG, PNG or WebP, up to 8 MB.</p>
          </div>
        </div>
      </div>

      <Notice kind="error">{error}</Notice>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {busy ? 'Saving' : isEdit ? 'Save changes' : 'Add project'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
      </div>
    </motion.form>
  )
}

/* ───────────── one row in the list ───────────── */
function ProjectRow({ project, index, count, busy, onEdit, onMove, onDelete }) {
  const [confirm, setConfirm] = useState(false)
  return (
    <motion.li layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-ink-600 bg-ink-900/70 p-1">
          <ProjectCover project={project} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{project.title}</p>
          <p className="truncate text-sm text-mist">{(project.stack || []).join(', ') || 'No tools added'}</p>
        </div>
        {confirm ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-mist">Delete this project?</span>
            <button onClick={() => onDelete(project.id)} disabled={busy} className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-60">
              Yes, delete
            </button>
            <button onClick={() => setConfirm(false)} className="btn-ghost !px-4 !py-2">
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => onMove(project.id, 'up')} disabled={busy || index === 0} className="btn-ghost !px-3 !py-2 disabled:opacity-40" aria-label={`Move ${project.title} up`}>
              <ArrowUp className="h-4 w-4" />
            </button>
            <button onClick={() => onMove(project.id, 'down')} disabled={busy || index === count - 1} className="btn-ghost !px-3 !py-2 disabled:opacity-40" aria-label={`Move ${project.title} down`}>
              <ArrowDown className="h-4 w-4" />
            </button>
            <button onClick={() => onEdit(project.id)} className="btn-ghost !px-4 !py-2">
              <Pencil className="h-4 w-4" /> Edit
            </button>
            <button onClick={() => setConfirm(true)} className="btn-ghost !px-4 !py-2 hover:!border-red-400 hover:!text-red-300" aria-label={`Delete ${project.title}`}>
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        )}
      </div>
    </motion.li>
  )
}

/* ───────────── the tab ───────────── */
export default function ProjectsManager({ onAuthError, onCount }) {
  const [projects, setProjects] = useState(null)
  const [editing, setEditing] = useState(null) // null | 'new' | project id
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState({ kind: '', text: '' })

  useEffect(() => {
    api('/api/projects')
      .then(setProjects)
      .catch((err) => {
        setProjects([])
        setMsg({ kind: 'error', text: err.message })
      })
  }, [])

  useEffect(() => {
    if (projects) onCount?.(projects.length)
  }, [projects, onCount])

  const saved = (item, isEdit) => {
    setProjects((list) => (isEdit ? list.map((p) => (p.id === item.id ? item : p)) : [item, ...list]))
    setEditing(null)
    setMsg({ kind: 'ok', text: isEdit ? 'Project updated. The change is live on your website.' : 'Project added. It is now live on your website.' })
  }

  const move = async (id, direction) => {
    setBusy(true)
    try {
      setProjects(await api(`/api/admin/projects/${id}/move`, { method: 'POST', auth: true, body: { direction } }))
      setMsg({ kind: '', text: '' })
    } catch (err) {
      if (err.status === 401) return onAuthError()
      setMsg({ kind: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    setBusy(true)
    try {
      await api(`/api/admin/projects/${id}`, { method: 'DELETE', auth: true })
      setProjects((list) => list.filter((p) => p.id !== id))
      setMsg({ kind: 'ok', text: 'Project deleted.' })
    } catch (err) {
      if (err.status === 401) return onAuthError()
      setMsg({ kind: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  const current = editing && editing !== 'new' ? projects?.find((p) => p.id === editing) : null

  return (
    <div className="space-y-6">
      <Notice kind={msg.kind}>{msg.text}</Notice>

      <AnimatePresence mode="wait">
        {editing ? (
          <ProjectForm key={editing} project={current} onSaved={saved} onCancel={() => setEditing(null)} onAuthError={onAuthError} />
        ) : (
          <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button onClick={() => setEditing('new')} className="btn-primary">
              <Plus className="h-4 w-4" /> Add a project
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <section>
        <h2 className="mb-1 font-display text-2xl font-bold">Your projects</h2>
        <p className="mb-4 text-sm text-mist">The order here is the order on your website. Use the arrows to move a project up or down.</p>
        {projects === null ? (
          <div className="glass h-24 animate-pulse rounded-2xl" />
        ) : projects.length === 0 ? (
          <p className="glass rounded-2xl p-6 text-mist">No projects yet. Add your first one above.</p>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {projects.map((p, i) => (
                <ProjectRow key={p.id} project={p} index={i} count={projects.length} busy={busy} onEdit={(id) => { setMsg({ kind: '', text: '' }); setEditing(id) }} onMove={move} onDelete={remove} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>
    </div>
  )
}
