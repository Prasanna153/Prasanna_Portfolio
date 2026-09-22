import Hero from '../components/Hero.jsx'
import Marquee from '../components/Marquee.jsx'
import About from '../components/About.jsx'
import Skills from '../components/Skills.jsx'
import Projects from '../components/Projects.jsx'
import Experience from '../components/Experience.jsx'
import Education from '../components/Education.jsx'
import CertificatesSection from '../components/CertificatesSection.jsx'
import Contact from '../components/Contact.jsx'

export default function Home({ certs, loading }) {
  return (
    <>
      <Hero certCount={certs.length} />
      <Marquee />
      <About />
      <Skills />
      <Projects />
      <Experience />
      <Education />
      <CertificatesSection certs={certs} loading={loading} />
      <Contact />
    </>
  )
}
