import type { ReactNode } from 'react'
import TopBar from './TopBar'
import Header from './Header'
import Footer from './Footer'
import { useSettings } from '../../contexts/SettingsContext'

export default function Layout({ children }: { children: ReactNode }) {
  const { settings } = useSettings()
  // TopBar is ~32px, Header is ~88px — total offset ~120px when top bar visible
  const topOffset = settings.top_bar_enabled ? 'pt-32' : 'pt-24'

  return (
    <div className="flex flex-col min-h-screen">
      {/* TopBar is sticky above header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopBar />
        <Header />
      </div>
      <main className={`flex-1 ${topOffset}`}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
