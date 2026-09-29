import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { projects as defaultProjects, skillGroups as defaultSkills } from '../data/portfolio.js'

// Projects and skills are edited from the admin page and stored on the server.
// If the server is not reachable (for example plain static hosting), the site
// falls back to the starting content in src/data/portfolio.js.
const ContentContext = createContext({ projects: defaultProjects, skills: defaultSkills, loading: false })

export const useContent = () => useContext(ContentContext)

async function getJson(url) {
  const res = await fetch(url, { cache: 'no-cache' })
  const type = res.headers.get('content-type') || ''
  if (!res.ok || !type.includes('application/json')) throw new Error('no api')
  return res.json()
}

export function ContentProvider({ children }) {
  const [state, setState] = useState({ projects: [], skills: [], loading: true })

  useEffect(() => {
    let alive = true
    Promise.all([getJson('/api/projects'), getJson('/api/skills')])
      .then(([projects, skills]) => alive && setState({ projects, skills, loading: false }))
      .catch(() => alive && setState({ projects: defaultProjects, skills: defaultSkills, loading: false }))
    return () => {
      alive = false
    }
  }, [])

  const value = useMemo(() => state, [state])
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}
