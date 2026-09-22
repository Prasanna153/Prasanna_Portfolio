// Prasanna's portfolio server
// - serves the built React site (dist/)
// - stores certificates (JSON + image files) and contact messages
// - protects the admin routes with a login (JWT)
import 'dotenv/config'
import express from 'express'
import multer from 'multer'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
// Starting projects + skills (used only the first time the server runs)
import { projects as defaultProjects, skillGroups as defaultSkills } from '../src/data/portfolio.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const PORT = Number(process.env.PORT) || 3001
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data'))
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads')
const CERT_FILE = path.join(DATA_DIR, 'certificates.json')
const MSG_FILE = path.join(DATA_DIR, 'messages.json')
const SEED_DIR = path.join(ROOT, 'public', 'seed')
const DIST_DIR = path.join(ROOT, 'dist')
const RESUME_DIR = path.join(DATA_DIR, 'resume')
const RESUME_FILE = path.join(RESUME_DIR, 'resume.pdf')
const RESUME_META_FILE = path.join(RESUME_DIR, 'meta.json')

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
let JWT_SECRET = process.env.JWT_SECRET || ''
if (!JWT_SECRET) {
  JWT_SECRET = crypto.randomBytes(48).toString('hex')
  console.warn('[warn] JWT_SECRET is not set. Using a temporary one (admin will be logged out on every restart).')
}
if (!ADMIN_PASSWORD) {
  console.warn('[warn] ADMIN_PASSWORD is not set. Admin login is DISABLED until you add it to your .env file.')
}

// ---------- storage helpers ----------
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}
function writeJson(file, data) {
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
  fs.renameSync(tmp, file) // atomic swap so the file is never half-written
}

// First run: copy the starter certificates so the site is never empty.
if (!fs.existsSync(CERT_FILE)) {
  const seed = readJson(path.join(SEED_DIR, 'certificates.json'), [])
  for (const c of seed) {
    const from = path.join(SEED_DIR, 'uploads', c.file)
    const to = path.join(UPLOAD_DIR, c.file)
    if (fs.existsSync(from) && !fs.existsSync(to)) fs.copyFileSync(from, to)
  }
  writeJson(CERT_FILE, seed)
}
if (!fs.existsSync(MSG_FILE)) writeJson(MSG_FILE, [])

// First run: copy the starter resume so the download button always works.
fs.mkdirSync(RESUME_DIR, { recursive: true })
if (!fs.existsSync(RESUME_FILE)) {
  const seedResume = path.join(ROOT, 'public', 'Prasanna_T_Resume.pdf')
  if (fs.existsSync(seedResume)) fs.copyFileSync(seedResume, RESUME_FILE)
}
if (!fs.existsSync(RESUME_META_FILE)) {
  writeJson(RESUME_META_FILE, {
    originalName: fs.existsSync(RESUME_FILE) ? 'Prasanna_T_Resume.pdf' : '',
    updatedAt: fs.existsSync(RESUME_FILE) ? new Date().toISOString() : '',
  })
}

const toPublicCert = (c) => ({ ...c, image: `/uploads/${c.file}` })

// Projects and skills are edited from the admin page and saved in the data folder.
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json')
const SKILLS_FILE = path.join(DATA_DIR, 'skills.json')
if (!fs.existsSync(PROJECTS_FILE)) {
  const now = new Date().toISOString()
  writeJson(
    PROJECTS_FILE,
    defaultProjects.map(({ image: _image, ...p }) => ({ ...p, period: p.period || '', file: '', createdAt: now })),
  )
}
if (!fs.existsSync(SKILLS_FILE)) {
  writeJson(SKILLS_FILE, defaultSkills.map((g) => ({ title: g.title, icon: g.icon, items: [...g.items] })))
}
const toPublicProject = ({ file, ...p }) => ({ ...p, image: file ? `/uploads/${file}` : '' })

// true if an uploaded image is still used by a certificate or a project
const fileInUse = (name) =>
  Boolean(name) &&
  (readJson(CERT_FILE, []).some((c) => c.file === name) || readJson(PROJECTS_FILE, []).some((p) => p.file === name))
function deleteFileIfUnused(name) {
  if (!name || fileInUse(name)) return
  const target = path.join(UPLOAD_DIR, path.basename(name))
  if (target.startsWith(UPLOAD_DIR) && fs.existsSync(target)) fs.unlinkSync(target)
}

// ---------- app ----------
const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})
app.use(express.json({ limit: '60kb' }))

// tiny in-memory rate limiter (per IP + bucket name)
const hits = new Map()
function rateLimit(name, max, windowMs) {
  return (req, res, next) => {
    const key = `${name}:${req.ip}`
    const now = Date.now()
    const entry = hits.get(key)
    if (!entry || now > entry.reset) {
      hits.set(key, { count: 1, reset: now + windowMs })
      return next()
    }
    entry.count += 1
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.reset - now) / 1000))
      return res.status(429).json({ error: 'Too many attempts. Please wait a few minutes and try again.' })
    }
    next()
  }
}
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of hits) if (now > v.reset) hits.delete(k)
}, 10 * 60 * 1000).unref()

const sameText = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest()
  const hb = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(ha, hb)
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
    if (payload.role !== 'admin') throw new Error('not admin')
    next()
  } catch {
    res.status(401).json({ error: 'Please log in again.' })
  }
}

const clean = (v, max) => String(v ?? '').trim().slice(0, max)
const cleanUrl = (v) => {
  const s = clean(v, 500)
  if (!s) return ''
  return /^https?:\/\//i.test(s) ? s : ''
}

// ---------- public API ----------
app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.get('/api/certificates', (_req, res) => {
  const list = readJson(CERT_FILE, [])
  res.setHeader('Cache-Control', 'no-cache')
  res.json(list.map(toPublicCert))
})

app.post('/api/contact', rateLimit('contact', 5, 60 * 60 * 1000), (req, res) => {
  const body = req.body ?? {}
  if (body.website) return res.json({ ok: true }) // honeypot: bots fill this hidden field
  const name = clean(body.name, 80)
  const email = clean(body.email, 120)
  const message = clean(body.message, 2000)
  if (!name || !message || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter your name, a valid email and a message.' })
  }
  const list = readJson(MSG_FILE, [])
  list.unshift({ id: crypto.randomUUID(), name, email, message, createdAt: new Date().toISOString() })
  writeJson(MSG_FILE, list.slice(0, 300))
  res.json({ ok: true })
})

app.get('/api/projects', (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache')
  res.json(readJson(PROJECTS_FILE, []).map(toPublicProject))
})

app.get('/api/skills', (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache')
  res.json(readJson(SKILLS_FILE, []))
})

// uploaded certificate images
app.use(
  '/uploads',
  express.static(UPLOAD_DIR, { maxAge: '7d', fallthrough: false, index: false, dotfiles: 'ignore' }),
)

// resume download (always the same URL; no-cache so an admin update shows up right away)
app.use(
  '/resume',
  express.static(RESUME_DIR, { maxAge: 0, fallthrough: false, index: false, dotfiles: 'ignore', setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache') }),
)

app.get('/api/resume', (_req, res) => {
  const meta = readJson(RESUME_META_FILE, { originalName: '', updatedAt: '' })
  res.json({ available: fs.existsSync(RESUME_FILE), url: '/resume/resume.pdf', ...meta })
})

// ---------- admin API ----------
app.post('/api/admin/login', rateLimit('login', 10, 15 * 60 * 1000), (req, res) => {
  if (!ADMIN_PASSWORD) {
    return res.status(503).json({ error: 'Admin login is not set up yet. Add ADMIN_PASSWORD to the .env file and restart the server.' })
  }
  const { username, password } = req.body ?? {}
  const okUser = sameText(username ?? '', ADMIN_USERNAME)
  const okPass = sameText(password ?? '', ADMIN_PASSWORD)
  if (!(okUser && okPass)) return res.status(401).json({ error: 'Wrong username or password.' })
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '12h' })
  res.json({ token })
})

app.get('/api/admin/session', requireAdmin, (_req, res) => res.json({ ok: true }))

// image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
})

function detectImage(buf) {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg'
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (buf.length > 12 && buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return 'webp'
  return null
}

// resume upload
const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
})
const isPdf = (buf) => buf.length > 4 && buf.subarray(0, 5).toString() === '%PDF-'

app.post('/api/admin/resume', requireAdmin, uploadPdf.single('resume'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Please choose a PDF file to upload.' })
  if (!isPdf(req.file.buffer)) return res.status(400).json({ error: 'That file is not a valid PDF.' })
  fs.mkdirSync(RESUME_DIR, { recursive: true })
  const tmp = `${RESUME_FILE}.${process.pid}.tmp`
  fs.writeFileSync(tmp, req.file.buffer)
  fs.renameSync(tmp, RESUME_FILE) // atomic swap so a half-written file is never served
  const meta = { originalName: clean(req.file.originalname, 200) || 'resume.pdf', updatedAt: new Date().toISOString() }
  writeJson(RESUME_META_FILE, meta)
  res.status(201).json({ available: true, url: '/resume/resume.pdf', ...meta })
})

app.post('/api/admin/certificates', requireAdmin, upload.single('image'), (req, res) => {
  const title = clean(req.body?.title, 140)
  if (!title) return res.status(400).json({ error: 'Please enter a certificate title.' })
  if (!req.file) return res.status(400).json({ error: 'Please choose a certificate image (JPG, PNG or WebP).' })
  const ext = detectImage(req.file.buffer)
  if (!ext) return res.status(400).json({ error: 'That file is not a valid JPG, PNG or WebP image.' })

  const file = `${Date.now()}-${crypto.randomBytes(5).toString('hex')}.${ext}`
  fs.writeFileSync(path.join(UPLOAD_DIR, file), req.file.buffer)

  const category = ['Course', 'Internship', 'Conference', 'Other'].includes(req.body?.category) ? req.body.category : 'Course'
  const item = {
    id: crypto.randomUUID(),
    title,
    issuer: clean(req.body?.issuer, 140),
    date: clean(req.body?.date, 60),
    category,
    file,
    verifyUrl: cleanUrl(req.body?.verifyUrl),
    createdAt: new Date().toISOString(),
  }
  const list = readJson(CERT_FILE, [])
  list.unshift(item)
  writeJson(CERT_FILE, list)
  res.status(201).json(toPublicCert(item))
})

app.put('/api/admin/certificates/:id', requireAdmin, (req, res) => {
  const list = readJson(CERT_FILE, [])
  const item = list.find((c) => c.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Certificate not found.' })
  const b = req.body ?? {}
  if (b.title !== undefined) {
    const t = clean(b.title, 140)
    if (!t) return res.status(400).json({ error: 'Title cannot be empty.' })
    item.title = t
  }
  if (b.issuer !== undefined) item.issuer = clean(b.issuer, 140)
  if (b.date !== undefined) item.date = clean(b.date, 60)
  if (b.verifyUrl !== undefined) item.verifyUrl = cleanUrl(b.verifyUrl)
  if (['Course', 'Internship', 'Conference', 'Other'].includes(b.category)) item.category = b.category
  writeJson(CERT_FILE, list)
  res.json(toPublicCert(item))
})

app.delete('/api/admin/certificates/:id', requireAdmin, (req, res) => {
  const list = readJson(CERT_FILE, [])
  const index = list.findIndex((c) => c.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Certificate not found.' })
  const [removed] = list.splice(index, 1)
  writeJson(CERT_FILE, list)
  // delete the image file too (only if nothing else still uses it)
  deleteFileIfUnused(removed.file)
  res.json({ ok: true })
})

// ----- projects (admin) -----
const KINDS = ['line', 'bars', 'donut']
const SKILL_ICONS = ['chart', 'code', 'database', 'brain', 'wrench', 'table', 'award']
const MAX_PROJECTS = 30

function toList(value, { max, len, commas = false }) {
  const parts = Array.isArray(value) ? value : String(value ?? '').split(commas ? /[\n,]/ : /\n/)
  const out = []
  for (const part of parts) {
    const item = clean(part, len)
    if (item && !out.includes(item)) out.push(item)
    if (out.length >= max) break
  }
  return out
}
const badLink = (v) => {
  const s = clean(v, 500)
  return s !== '' && !/^https?:\/\//i.test(s)
}
const LINK_ERROR = 'Links must start with https:// (for example https://github.com/your-name/your-project).'

function readProjectFields(b) {
  const out = {}
  if (b.title !== undefined) out.title = clean(b.title, 120)
  if (b.summary !== undefined) out.summary = clean(b.summary, 500)
  if (b.period !== undefined) out.period = clean(b.period, 60)
  if (b.repo !== undefined) out.repo = cleanUrl(b.repo)
  if (b.demo !== undefined) out.demo = cleanUrl(b.demo)
  if (b.stack !== undefined) out.stack = toList(b.stack, { max: 15, len: 40, commas: true })
  if (b.highlights !== undefined) out.highlights = toList(b.highlights, { max: 12, len: 300 })
  if (KINDS.includes(b.kind)) out.kind = b.kind
  return out
}

function saveImage(file) {
  const ext = detectImage(file.buffer)
  if (!ext) return null
  const name = `${Date.now()}-${crypto.randomBytes(5).toString('hex')}.${ext}`
  fs.writeFileSync(path.join(UPLOAD_DIR, name), file.buffer)
  return name
}
const slugify = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'project'
const IMAGE_ERROR = 'That file is not a valid JPG, PNG or WebP image.'

app.post('/api/admin/projects', requireAdmin, upload.single('image'), (req, res) => {
  const body = req.body ?? {}
  const list = readJson(PROJECTS_FILE, [])
  if (list.length >= MAX_PROJECTS) return res.status(400).json({ error: `You can keep up to ${MAX_PROJECTS} projects. Delete one first.` })
  if (badLink(body.repo) || badLink(body.demo)) return res.status(400).json({ error: LINK_ERROR })
  const f = readProjectFields(body)
  if (!f.title) return res.status(400).json({ error: 'Please enter a project title.' })
  let file = ''
  if (req.file) {
    file = saveImage(req.file)
    if (!file) return res.status(400).json({ error: IMAGE_ERROR })
  }
  const item = {
    id: `${slugify(f.title)}-${crypto.randomBytes(2).toString('hex')}`,
    title: f.title,
    summary: f.summary ?? '',
    kind: f.kind ?? 'bars',
    stack: f.stack ?? [],
    highlights: f.highlights ?? [],
    repo: f.repo ?? '',
    demo: f.demo ?? '',
    period: f.period ?? '',
    file,
    createdAt: new Date().toISOString(),
  }
  list.unshift(item)
  writeJson(PROJECTS_FILE, list)
  res.status(201).json(toPublicProject(item))
})

app.put('/api/admin/projects/:id', requireAdmin, upload.single('image'), (req, res) => {
  const body = req.body ?? {}
  const list = readJson(PROJECTS_FILE, [])
  const item = list.find((p) => p.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Project not found.' })
  if (badLink(body.repo) || badLink(body.demo)) return res.status(400).json({ error: LINK_ERROR })
  const f = readProjectFields(body)
  if (f.title !== undefined && !f.title) return res.status(400).json({ error: 'The project title cannot be empty.' })

  const oldFile = item.file
  if (req.file) {
    const saved = saveImage(req.file)
    if (!saved) return res.status(400).json({ error: IMAGE_ERROR })
    item.file = saved
  } else if (body.removeImage === '1') {
    item.file = ''
  }
  Object.assign(item, f)
  writeJson(PROJECTS_FILE, list)
  if (oldFile && oldFile !== item.file) deleteFileIfUnused(oldFile)
  res.json(toPublicProject(item))
})

app.delete('/api/admin/projects/:id', requireAdmin, (req, res) => {
  const list = readJson(PROJECTS_FILE, [])
  const index = list.findIndex((p) => p.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Project not found.' })
  const [removed] = list.splice(index, 1)
  writeJson(PROJECTS_FILE, list)
  deleteFileIfUnused(removed.file)
  res.json({ ok: true })
})

app.post('/api/admin/projects/:id/move', requireAdmin, (req, res) => {
  const list = readJson(PROJECTS_FILE, [])
  const i = list.findIndex((p) => p.id === req.params.id)
  if (i === -1) return res.status(404).json({ error: 'Project not found.' })
  const j = req.body?.direction === 'up' ? i - 1 : req.body?.direction === 'down' ? i + 1 : i
  if (j >= 0 && j < list.length && j !== i) {
    ;[list[i], list[j]] = [list[j], list[i]]
    writeJson(PROJECTS_FILE, list)
  }
  res.json(list.map(toPublicProject))
})

// ----- skills (admin) -----
app.put('/api/admin/skills', requireAdmin, (req, res) => {
  const groups = Array.isArray(req.body) ? req.body : req.body?.groups
  if (!Array.isArray(groups) || groups.length > 12) {
    return res.status(400).json({ error: 'You can keep up to 12 skill groups.' })
  }
  const out = []
  for (const g of groups) {
    const title = clean(g?.title, 60)
    if (!title) return res.status(400).json({ error: 'Every skill group needs a name.' })
    out.push({
      title,
      icon: SKILL_ICONS.includes(g?.icon) ? g.icon : 'code',
      items: toList(g?.items, { max: 30, len: 40 }),
    })
  }
  writeJson(SKILLS_FILE, out)
  res.json(out)
})

app.get('/api/admin/messages', requireAdmin, (_req, res) => res.json(readJson(MSG_FILE, [])))

app.delete('/api/admin/messages/:id', requireAdmin, (req, res) => {
  const list = readJson(MSG_FILE, []).filter((m) => m.id !== req.params.id)
  writeJson(MSG_FILE, list)
  res.json({ ok: true })
})

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }))

// ---------- serve the built website ----------
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { maxAge: '1h', index: false }))
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next()
    res.sendFile(path.join(DIST_DIR, 'index.html'))
  })
} else {
  app.get('/', (_req, res) =>
    res.type('text').send('API is running. Run "npm run build" to create the website, or "npm run dev" while developing.'),
  )
}

// ---------- errors ----------
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'That image is too large. Please keep it under 8 MB.' : 'Upload failed. Please try again.'
    return res.status(400).json({ error: msg })
  }
  const status = err?.status || err?.statusCode
  if (status && status >= 400 && status < 500) return res.status(status).json({ error: 'Request not allowed.' })
  console.error(err)
  res.status(500).json({ error: 'Something went wrong on the server.' })
})

app.listen(PORT, () => {
  console.log(`Portfolio server running at http://localhost:${PORT}`)
  console.log(`Data folder: ${DATA_DIR}`)
})
