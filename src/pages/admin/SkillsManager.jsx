import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import Notice from './Notice.jsx'

const ICONS = [
  ['chart', 'Charts & BI'],
  ['code', 'Code'],
  ['database', 'Database'],
  ['brain', 'AI & ML'],
  ['wrench', 'Tools'],
  ['table', 'Spreadsheet'],
  ['award', 'Award'],
]

let keySeed = 0
const withKey = (g) => ({ ...g, _k: `g${++keySeed}` })
const strip = (groups) => groups.map(({ _k, ...g }) => g)

/* type a skill, press Enter or comma to add it as a tag */
function TagInput({ items, onChange, label }) {
  const [text, setText] = useState('')
  const add = (raw) => {
    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean)
    if (!parts.length) return
    const next = [...items]
    parts.forEach((p) => {
      if (!next.some((x) => x.toLowerCase() === p.toLowerCase())) next.push(p)
    })
    onChange(next)
    setText('')
  }
  return (
    <div>
      <ul className="mb-3 flex flex-wrap gap-2">
        {items.map((s) => (
          <li key={s} className="chip gap-1.5 !pr-2">
            {s}
            <button type="button" onClick={() => onChange(items.filter((x) => x !== s))} aria-label={`Remove ${s}`} className="rounded-full p-0.5 text-mist hover:text-red-300">
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-mist">No skills in this group yet.</li>}
      </ul>
      <div className="flex gap-2">
        <input
          className="field"
          value={text}
          aria-label={label}
          placeholder="Type a skill and press Enter"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              add(text)
            }
          }}
          onBlur={() => add(text)}
        />
        <button type="button" onClick={() => add(text)} className="btn-ghost !px-4 !py-2" aria-label="Add skill">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function SkillsManager({ onAuthError }) {
  const [groups, setGroups] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState({ kind: '', text: '' })
  const saved = useRef('')

  useEffect(() => {
    api('/api/skills')
      .then((list) => {
        saved.current = JSON.stringify(list)
        setGroups(list.map(withKey))
      })
      .catch((err) => {
        setGroups([])
        setMsg({ kind: 'error', text: err.message })
      })
  }, [])

  const update = useCallback((k, patch) => setGroups((g) => g.map((x) => (x._k === k ? { ...x, ...patch } : x))), [])
  const move = (i, d) =>
    setGroups((g) => {
      const j = i + d
      if (j < 0 || j >= g.length) return g
      const next = [...g]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  const dirty = groups !== null && JSON.stringify(strip(groups)) !== saved.current

  const save = async () => {
    setBusy(true)
    setMsg({ kind: '', text: '' })
    try {
      const out = await api('/api/admin/skills', { method: 'PUT', auth: true, body: strip(groups) })
      saved.current = JSON.stringify(out)
      setGroups(out.map(withKey))
      setMsg({ kind: 'ok', text: 'Skills saved. The change is live on your website.' })
    } catch (err) {
      if (err.status === 401) return onAuthError()
      setMsg({ kind: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  if (groups === null) return <div className="glass h-40 animate-pulse rounded-2xl" />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Your skills</h2>
        <p className="mt-1 text-sm text-mist">Change a group name, add or remove skills, then press Save skills. These names also scroll in the tools strip under your introduction.</p>
      </div>

      <Notice kind={msg.kind}>{msg.text}</Notice>

      <ul className="space-y-4">
        {groups.map((g, i) => (
          <li key={g._k} className="glass space-y-4 rounded-2xl p-5">
            <div className="grid gap-3 sm:grid-cols-[1fr_11rem]">
              <label className="block text-sm text-mist">
                Group name
                <input className="field mt-1.5" value={g.title} maxLength={60} onChange={(e) => update(g._k, { title: e.target.value })} placeholder="e.g. Databases" />
              </label>
              <label className="block text-sm text-mist">
                Icon
                <select className="field mt-1.5" value={g.icon} onChange={(e) => update(g._k, { icon: e.target.value })}>
                  {ICONS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <TagInput items={g.items} onChange={(items) => update(g._k, { items })} label={`Add a skill to ${g.title || 'this group'}`} />
            <div className="flex flex-wrap gap-2 border-t border-ink-700/70 pt-4">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="btn-ghost !px-3 !py-2 disabled:opacity-40" aria-label={`Move ${g.title} up`}>
                <ArrowUp className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === groups.length - 1} className="btn-ghost !px-3 !py-2 disabled:opacity-40" aria-label={`Move ${g.title} down`}>
                <ArrowDown className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setGroups((list) => list.filter((x) => x._k !== g._k))} className="btn-ghost !px-4 !py-2 hover:!border-red-400 hover:!text-red-300" aria-label={`Delete group ${g.title}`}>
                <Trash2 className="h-4 w-4" /> Delete group
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setGroups((g) => [...g, withKey({ title: '', icon: 'code', items: [] })])} disabled={groups.length >= 12} className="btn-ghost">
          <Plus className="h-4 w-4" /> Add a skill group
        </button>
        <button type="button" onClick={save} disabled={busy || !dirty} className="btn-primary disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {busy ? 'Saving' : 'Save skills'}
        </button>
        {dirty && <span className="text-sm text-signal">You have changes that are not saved yet.</span>}
      </div>
    </div>
  )
}
