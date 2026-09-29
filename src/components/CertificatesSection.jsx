import { Link } from 'react-router-dom'
import CertificateGallery from './CertificateGallery.jsx'
import Reveal from './Reveal.jsx'
import SectionHeading from './SectionHeading.jsx'

export default function CertificatesSection({ certs, loading }) {
  const shown = certs.slice(0, 6)
  return (
    <section id="certificates" className="section" aria-labelledby="cert-title">
      <SectionHeading id="cert-title" title="Certificates" text="Course and internship certificates. Click one to view it full size, download it, or verify it online." />
      <CertificateGallery certs={shown} loading={loading} />
      {!loading && certs.length > 6 && (
        <Reveal className="mt-10 text-center">
          <Link to="/certificates" className="btn-ghost">
            View all {certs.length} certificates
          </Link>
        </Reveal>
      )}
    </section>
  )
}
