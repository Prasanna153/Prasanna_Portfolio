import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { api } from '../../lib/api.js'
import Notice from './Notice.jsx'

let keySeed = 0
const withKey = (x) => ({ ...x, _k: `k${++keySeed}` })
const strip = (list) => list.map(({ _k, ...x }) => x)

const ICONS = [
  ['chart', 'Charts & BI'],
  ['code', 'Code'],
  ['database', 'Database'],
  ['brain', 'AI & ML'],
  ['wrench', 'Tools'],
  ['table', 'Spreadsheet'],
  ['award', 'Award'],
]

/* shared load / save / unsaved-changes logic for the three editors */
function useEditor({ loadUrl, saveUrl, toState, fromState, onAuthError, savedText }) {
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState({ kind: '', text: '' })
  const saved = useRef('')

  useEffect(() => {
    api(loadUrl)
      .then((raw) => {
        const state = toState(raw)
        saved.current = JSON.stringify(fromState(state))
        setData(state)
      })
      .catch((err) => setMsg({ kind: 'error', text: err.message }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dirty = data !== null && JSON.stringify(fromState(data)) !== saved.current

  const save = async () => {
    setBusy(true)
    setMsg({ kind: '', text: '' })
    try {
      const out = await api(saveUrl, { method: 'PUT', auth: true, body: fromState(data) })
      const state = toState(out)
      saved.current = JSON.stringify(fromState(state))
      setData(state)
      setMsg({ kind: 'ok', text: savedText })
    } catch (err) {
      if (err.status === 401) return onAuthError()
      setMsg({ kind: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }
  return { data, setData, busy, msg, dirty, save }
}

function SaveBar({ busy, dirty, save, label }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={save} disabled={busy || !dirty} className="btn-primary disabled:opacity-50">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {busy ? 'Saving' : label}
      </button>
      {dirty && <span className="text-sm text-signal">You have changes that are not saved yet.</span>}
    </div>
  )
}

function Heading({ title, text }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-mist">{text}</p>
    </div>
  )
}

function RowControls({ index, count, onMove, onDelete, name }) {
  return (
    <div className="flex flex-wrap gap-2 border-t border-ink-700/70 pt-4">
      <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} className="btn-ghost !px-3 !py-2 disabled:opacity-40" aria-label={`Move ${name} up`}>
        <ArrowUp className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => onMove(index, 1)} disabled={index === count - 1} className="btn-ghost !px-3 !py-2 disabled:opacity-40" aria-label={`Move ${name} down`}>
        <ArrowDown className="h-4 w-4" />
      </button>
      <button type="button" onClick={onDelete} className="btn-ghost !px-4 !py-2 hover:!border-red-400 hover:!text-red-300" aria-label={`Delete ${name}`}>
        <Trash2 className="h-4 w-4" /> Delete
      </button>
    </div>
  )
}

const moveIn = (setList) => (i, d) =>
  setList((list) => {
    const j = i + d
    if (j < 0 || j >= list.length) return list
    const next = [...list]
    ;[next[i], next[j]] = [next[j], next[i]]
    return next
  })

/* ---------------- About ---------------- */
export function AboutManager({ onAuthError }) {
  const { data, setData, busy, msg, dirty, save } = useEditor({
    loadUrl: '/api/about',
    saveUrl: '/api/admin/about',
    toState: (a) => ({ summary: (a.paragraphs || []).join('\n\n'), facts: (a.facts || []).map(withKey) }),
    fromState: (s) => ({
      paragraphs: s.summary.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
      facts: strip(s.facts),
    }),
    onAuthError,
    savedText: 'About section saved. The change is live on your website.',
  })

  if (!data) return msg.text ? <Notice kind={msg.kind}>{msg.text}</Notice> : <div className="glass h-40 animate-pulse rounded-2xl" />

  const setFact = (k, patch) => setData((d) => ({ ...d, facts: d.facts.map((f) => (f._k === k ? { ...f, ...patch } : f)) }))

  return (
    <div className="space-y-6">
      <Heading title="About me" text="This is the summary and the quick facts box in the About section of your website." />
      <Notice kind={msg.kind}>{msg.text}</Notice>

      <div className="glass space-y-3 rounded-2xl p-5">
        <label className="block text-sm text-mist">
          Summary (leave an empty line between paragraphs)
          <textarea className="field mt-1.5 min-h-[14rem]" value={data.summary} maxLength={5000} onChange={(e) => setData((d) => ({ ...d, summary: e.target.value }))} />
        </label>
      </div>

      <div className="glass space-y-4 rounded-2xl p-5">
        <h3 className="font-display text-lg font-bold">Quick facts</h3>
        <p className="-mt-2 text-sm text-mist">Short label and value pairs, like &quot;Based in&quot; and &quot;Bangalore, India&quot;.</p>
        <ul className="space-y-3">
          {data.facts.map((f) => (
            <li key={f._k} className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
              <input className="field" placeholder="Label" maxLength={40} value={f.label} onChange={(e) => setFact(f._k, { label: e.target.value })} aria-label="Fact label" />
              <input className="field" placeholder="Value" maxLength={120} value={f.value} onChange={(e) => setFact(f._k, { value: e.target.value })} aria-label="Fact value" />
              <button type="button" onClick={() => setData((d) => ({ ...d, facts: d.facts.filter((x) => x._k !== f._k) }))} className="btn-ghost !px-3 !py-2 hover:!border-red-400 hover:!text-red-300" aria-label={`Delete fact ${f.label}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setData((d) => ({ ...d, facts: [...d.facts, withKey({ label: '', value: '' })] }))} disabled={data.facts.length >= 8} className="btn-ghost">
          <Plus className="h-4 w-4" /> Add a fact
        </button>
      </div>

      <SaveBar busy={busy} dirty={dirty} save={save} label="Save About" />
    </div>
  )
}

/* ---------------- Experience ---------------- */
export function ExperienceManager({ onAuthError }) {
  const { data, setData, busy, msg, dirty, save } = useEditor({
    loadUrl: '/api/experience',
    saveUrl: '/api/admin/experience',
    toState: (list) => list.map((e) => withKey({ ...e, points: (e.points || []).join('\n') })),
    fromState: (list) => strip(list),
    onAuthError,
    savedText: 'Experience saved. The change is live on your website.',
  })

  if (!data) return msg.text ? <Notice kind={msg.kind}>{msg.text}</Notice> : <div className="glass h-40 animate-pulse rounded-2xl" />

  const update = (k, patch) => setData((list) => list.map((x) => (x._k === k ? { ...x, ...patch } : x)))
  const move = moveIn(setData)

  return (
    <div className="space-y-6">
      <Heading title="Experience" text="Internships, jobs and training. The order here is the order on your website." />
      <Notice kind={msg.kind}>{msg.text}</Notice>

      <ul className="space-y-4">
        {data.map((e, i) => (
          <li key={e._k} className="glass space-y-4 rounded-2xl p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm text-mist">
                Role / title *
                <input className="field mt-1.5" value={e.role} maxLength={100} placeholder="e.g. Data Analyst Intern" onChange={(ev) => update(e._k, { role: ev.target.value })} />
              </label>
              <label className="block text-sm text-mist">
                Company
                <input className="field mt-1.5" value={e.company} maxLength={160} placeholder="e.g. Company name" onChange={(ev) => update(e._k, { company: ev.target.value })} />
              </label>
            </div>
            <label className="block text-sm text-mist">
              Time period
              <input className="field mt-1.5" value={e.period} maxLength={60} placeholder="e.g. Jul 2025 – Aug 2025" onChange={(ev) => update(e._k, { period: ev.target.value })} />
            </label>
            <label className="block text-sm text-mist">
              What you did (one point on each line)
              <textarea className="field mt-1.5 min-h-[8rem]" value={e.points} placeholder={'Built a sales dashboard in Power BI\nCleaned data with Pandas'} onChange={(ev) => update(e._k, { points: ev.target.value })} />
            </label>
            <RowControls index={i} count={data.length} onMove={move} onDelete={() => setData((list) => list.filter((x) => x._k !== e._k))} name={e.role || 'experience'} />
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setData((list) => [...list, withKey({ role: '', company: '', period: '', points: '' })])} disabled={data.length >= 12} className="btn-ghost">
          <Plus className="h-4 w-4" /> Add experience
        </button>
        <SaveBar busy={busy} dirty={dirty} save={save} label="Save experience" />
      </div>
    </div>
  )
}

/* ---------------- Education + courses ---------------- */
export function EducationManager({ onAuthError }) {
  const { data, setData, busy, msg, dirty, save } = useEditor({
    loadUrl: '/api/education',
    saveUrl: '/api/admin/education',
    toState: (e) => ({ degrees: (e.degrees || []).map(withKey), courses: (e.courses || []).map(withKey) }),
    fromState: (s) => ({ degrees: strip(s.degrees), courses: strip(s.courses) }),
    onAuthError,
    savedText: 'Education saved. The change is live on your website.',
  })

  if (!data) return msg.text ? <Notice kind={msg.kind}>{msg.text}</Notice> : <div className="glass h-40 animate-pulse rounded-2xl" />

  const setList = (name) => (fn) => setData((d) => ({ ...d, [name]: typeof fn === 'function' ? fn(d[name]) : fn }))
  const setDegrees = setList('degrees')
  const setCourses = setList('courses')
  const updateIn = (setter) => (k, patch) => setter((list) => list.map((x) => (x._k === k ? { ...x, ...patch } : x)))
  const updateDegree = updateIn(setDegrees)
  const updateCourse = updateIn(setCourses)

  return (
    <div className="space-y-8">
      <Heading title="Education and courses" text="Your degrees and schools first, then the courses and training you have completed." />
      <Notice kind={msg.kind}>{msg.text}</Notice>

      <section className="space-y-4">
        <h3 className="font-display text-xl font-bold">Education</h3>
        <ul className="space-y-4">
          {data.degrees.map((d, i) => (
            <li key={d._k} className="glass space-y-4 rounded-2xl p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm text-mist">
                  Degree / class *
                  <input className="field mt-1.5" value={d.title} maxLength={120} placeholder="e.g. B.Tech, Information Technology" onChange={(e) => updateDegree(d._k, { title: e.target.value })} />
                </label>
                <label className="block text-sm text-mist">
                  School / college
                  <input className="field mt-1.5" value={d.place} maxLength={160} placeholder="e.g. College name, City" onChange={(e) => updateDegree(d._k, { place: e.target.value })} />
                </label>
                <label className="block text-sm text-mist">
                  Years
                  <input className="field mt-1.5" value={d.period} maxLength={60} placeholder="e.g. 2022 – 2026" onChange={(e) => updateDegree(d._k, { period: e.target.value })} />
                </label>
                <label className="block text-sm text-mist">
                  Result (optional)
                  <input className="field mt-1.5" value={d.result} maxLength={60} placeholder="e.g. CGPA 7.5 / 10" onChange={(e) => updateDegree(d._k, { result: e.target.value })} />
                </label>
              </div>
              <RowControls index={i} count={data.degrees.length} onMove={moveIn(setDegrees)} onDelete={() => setDegrees((list) => list.filter((x) => x._k !== d._k))} name={d.title || 'education'} />
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setDegrees((list) => [...list, withKey({ title: '', place: '', period: '', result: '' })])} disabled={data.degrees.length >= 10} className="btn-ghost">
          <Plus className="h-4 w-4" /> Add education
        </button>
      </section>

      <section className="space-y-4">
        <h3 className="font-display text-xl font-bold">Courses and training</h3>
        <ul className="space-y-4">
          {data.courses.map((c, i) => (
            <li key={c._k} className="glass space-y-4 rounded-2xl p-5">
              <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_10rem]">
                <label className="block text-sm text-mist">
                  Course name *
                  <input className="field mt-1.5" value={c.title} maxLength={140} placeholder="e.g. Advanced Excel" onChange={(e) => updateCourse(c._k, { title: e.target.value })} />
                </label>
                <label className="block text-sm text-mist">
                  Provider
                  <input className="field mt-1.5" value={c.provider} maxLength={100} placeholder="e.g. HCL GUVI · Aug 2023" onChange={(e) => updateCourse(c._k, { provider: e.target.value })} />
                </label>
                <label className="block text-sm text-mist">
                  Icon
                  <select className="field mt-1.5" value={c.icon} onChange={(e) => updateCourse(c._k, { icon: e.target.value })}>
                    {ICONS.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <RowControls index={i} count={data.courses.length} onMove={moveIn(setCourses)} onDelete={() => setCourses((list) => list.filter((x) => x._k !== c._k))} name={c.title || 'course'} />
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setCourses((list) => [...list, withKey({ title: '', provider: '', icon: 'award' })])} disabled={data.courses.length >= 30} className="btn-ghost">
          <Plus className="h-4 w-4" /> Add a course
        </button>
      </section>

      <SaveBar busy={busy} dirty={dirty} save={save} label="Save education" />
    </div>
  )
}
