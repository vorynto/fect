import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Scrolls to the top of the page on every route change.
// If the URL contains a hash (e.g. /services#process), scrolls to that element instead.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // Wait a tick for the target section to render, then scroll to it
      const id = hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}
