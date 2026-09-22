import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ParticleBackground from './components/ParticleBackground.jsx'
import CursorGlow from './components/CursorGlow.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import Home from './pages/Home.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import CertificatesPage from './pages/CertificatesPage.jsx'
import Admin from './pages/Admin.jsx'
import useCertificates from './hooks/useCertificates.js'
import { ContentProvider } from './hooks/useContent.jsx'

// Scrolls to the right place when the address changes (#section links or new pages).
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1))
      const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
      return () => clearTimeout(t)
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
    return undefined
  }, [pathname, hash])
  return null
}

function TitleManager() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname.startsWith('/admin')) return
    document.title =
      pathname === '/certificates'
        ? 'Certificates | Prasanna T'
        : pathname.startsWith('/project/')
          ? 'Project | Prasanna T'
          : 'Prasanna T | Data Analyst, Power BI, SQL & Python Developer'
  }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const { certs, loading } = useCertificates()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <>
      <ScrollManager />
      <TitleManager />
      {isAdmin ? (
        <Admin />
      ) : (
        <ContentProvider>
          <ScrollProgress />
          <ParticleBackground />
          <CursorGlow />
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-signal focus:px-4 focus:py-2 focus:text-ink-950">
            Skip to content
          </a>
          <Navbar />
          <div id="main" className="relative z-10">
            <Routes>
              <Route path="/" element={<Home certs={certs} loading={loading} />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/certificates" element={<CertificatesPage certs={certs} loading={loading} />} />
              <Route path="*" element={<Home certs={certs} loading={loading} />} />
            </Routes>
          </div>
          <Footer />
        </ContentProvider>
      )}
    </>
  )
}
