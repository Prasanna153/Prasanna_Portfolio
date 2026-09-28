import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, Loader2, Upload } from 'lucide-react'
import { api } from '../../lib/api.js'
import Notice from './Notice.jsx'

const fmtDate = (iso) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return ''
  }
}

export default function ResumeManager({ onAuthError }) {
  const [info, setInfo] = useState(null) // { available, url, originalName, updatedAt }
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = await api('/api/resume')
        if (alive) setInfo(data)
      } catch {
        if (alive) setInfo({ available: false, url: '/resume/resume.pdf' })
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const pick = (chosen) => {
    if (!chosen) return
    if (chosen.type !== 'application/pdf' && !chosen.name.toLowerCase().endsWith('.pdf')) {
      return setError('Please choose a PDF file.')
    }
    if (chosen.size > 15 * 1024 * 1024) return setError('That file is too large. Please keep it under 15 MB.')
    setError('')
    setOk('')
    setFile(chosen)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!file) return setError('Please choose your resume PDF first.')
    setBusy(true)
    setError('')
    setOk('')
    const form = new FormData()
    form.append('resume', file)
    try {
      const saved = await api('/api/admin/resume', { method: 'POST', auth: true, form })
      setInfo(saved)
      setFile(null)
      setOk('Resume updated. It is now live on your website.')
    } catch (err) {
      if (err.status === 401) return onAuthError()
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold">Your resume</h2>
        <p className="mt-1 text-sm text-mist">This is the PDF people get from every &quot;Download resume&quot; button on your site.</p>

        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-ink-600 bg-ink-900/40 px-4 py-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-800 text-signal">
            <FileText className="h-5 w-5" />
          </span>
          {info?.available ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-fog">{info.originalName || 'resume.pdf'}</p>
              {info.updatedAt && <p className="text-xs text-mist">Last updated {fmtDate(info.updatedAt)}</p>}
            </div>
          ) : (
            <p className="flex-1 text-sm text-mist">No resume uploaded yet.</p>
          )}
          {info?.available && (
            <a href={`${info.url}?t=${Date.parse(info.updatedAt) || 0}`} target="_blank" rel="noreferrer noopener" className="btn-ghost !px-4 !py-2 text-sm">
              <Download className="h-4 w-4" /> View
            </a>
          )}
        </div>
      </div>

      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass space-y-5 rounded-3xl p-6 sm:p-8">
        <h3 className="font-display text-xl font-bold">Replace resume</h3>
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            pick(e.dataTransfer.files?.[0])
          }}
          className={`flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${dragOver ? 'border-signal bg-signal/5' : 'border-ink-600'}`}
        >
          <FileText className="h-7 w-7 text-mist" />
          <p className="text-sm text-fog">{file ? file.name : 'Drag your resume PDF here'}</p>
          <p className="text-xs text-mist">PDF only, up to 15 MB</p>
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
          <button type="button" onClick={() => inputRef.current?.click()} className="btn-ghost mt-1 !py-2">
            <Upload className="h-4 w-4" /> Choose PDF
          </button>
        </div>

        <Notice kind="error">{error}</Notice>
        <Notice kind="ok">{ok}</Notice>

        <button type="submit" disabled={busy || !file} className="btn-primary disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload resume
        </button>
      </motion.form>
    </div>
  )
}
