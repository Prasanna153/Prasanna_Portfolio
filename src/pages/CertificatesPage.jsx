import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import CertificateGallery from '../components/CertificateGallery.jsx'
import SectionHeading from '../components/SectionHeading.jsx'

const filters = ['All', 'Course', 'Internship', 'Conference', 'Other']

export default function CertificatesPage({ certs, loading }) {
  const [filter, setFilter] = useState('All')
  const visible = useMemo(() => (filter === 'All' ? certs : certs.filter((c) => c.category === filter)), [certs, filter])
  const present = filters.filter((f) => f === 'All' || certs.some((c) => c.category === f))

  return (
    <main className="section !pt-32">
      <Link to="/#certificates" className="mb-8 inline-flex items-center gap-2 text-sm text-mist transition hover:text-signal">
        <ArrowLeft className="h-4 w-4" /> Back to portfolio
      </Link>
      <SectionHeading title="All certificates" text="Click any certificate to view it full size, download it, or verify it online." />
      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter certificates">
        {present.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              filter === f ? 'border-signal bg-signal text-ink-950' : 'border-ink-600 bg-ink-800/50 text-mist hover:border-signal/50 hover:text-fog'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <CertificateGallery certs={visible} loading={loading} />
    </main>
  )
}
