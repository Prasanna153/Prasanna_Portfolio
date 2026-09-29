import { useCallback, useEffect, useState } from 'react'

// Loads certificates from the server. If the server is not available
// (for example the site is hosted as plain static files), it falls back
// to the starter list in /seed/certificates.json so the site never looks empty.
export default function useCertificates() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('api')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/certificates', { cache: 'no-cache' })
      const type = res.headers.get('content-type') || ''
      if (!res.ok || !type.includes('application/json')) throw new Error('no api')
      setCerts(await res.json())
      setSource('api')
    } catch {
      try {
        const res = await fetch('/seed/certificates.json')
        const list = await res.json()
        setCerts(list.map((c) => ({ ...c, image: `/seed/uploads/${c.file}` })))
        setSource('static')
      } catch {
        setCerts([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { certs, loading, source, reload: load }
}
