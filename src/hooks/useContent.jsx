import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  projects as defaultProjects,
  skillGroups as defaultSkills,
  about as defaultAbout,
  experience as defaultExperience,
  education as defaultEducation,
  courses as defaultCourses,
} from '../data/portfolio.js'

// Projects, skills, about text, experience and education are edited from the
// admin page and stored on the server. If the server is not reachable (for
// example plain static hosting), the site falls back to the starting content
// in src/data/portfolio.js.
const fallback = {
  projects: defaultProjects,
  skills: defaultSkills,
  about: defaultAbout,
  experience: defaultExperience,
  education: defaultEducation,
  courses: defaultCourses,
}
const ContentContext = createContext({ ...fallback, loading: false })

export const useContent = () => useContext(ContentContext)

async function getJson(url) {
  const res = await fetch(url, { cache: 'no-cache' })
  const type = res.headers.get('content-type') || ''
  if (!res.ok || !type.includes('application/json')) throw new Error('no api')
  return res.json()
}

export function ContentProvider({ children }) {
  const [state, setState] = useState({ projects: [], skills: [], about: null, experience: null, education: null, courses: null, loading: true })

  useEffect(() => {
    let alive = true
    Promise.all([
      getJson('/api/projects'),
      getJson('/api/skills'),
      getJson('/api/about'),
      getJson('/api/experience'),
      getJson('/api/education'),
    ])
      .then(
        ([projects, skills, about, experience, edu]) =>
          alive && setState({ projects, skills, about, experience, education: edu.degrees, courses: edu.courses, loading: false }),
      )
      .catch(() => alive && setState({ ...fallback, loading: false }))
    return () => {
      alive = false
    }
  }, [])

  const value = useMemo(() => state, [state])
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}
