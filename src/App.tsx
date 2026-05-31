import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { SettingsProvider } from './contexts/SettingsContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import AdminLayout from './components/admin/AdminLayout'

// Public pages
import Home from './pages/Home'
import OurStory from './pages/OurStory'
import Services from './pages/Services'
import Gallery from './pages/Gallery'
import GalleryAlbum from './pages/GalleryAlbum'
import Testimonials from './pages/Testimonials'
import Contact from './pages/Contact'
import Donate from './pages/Donate'

// Admin pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSettings from './pages/admin/AdminSettings'
import AdminSlider from './pages/admin/AdminSlider'
import AdminPages from './pages/admin/AdminPages'
import AdminGallery from './pages/admin/AdminGallery'
import AdminTestimonials from './pages/admin/AdminTestimonials'
import AdminDonations from './pages/admin/AdminDonations'
import AdminPrograms from './pages/admin/AdminPrograms'
import AdminQuotes from './pages/admin/AdminQuotes'
import AdminNavigation from './pages/admin/AdminNavigation'

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 animate-spin" style={{ borderTopColor: 'var(--site-primary)' }} />
      </div>
    )
  }
  if (!session) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

function AdminPage({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '12px', fontSize: '14px' },
              success: { iconTheme: { primary: '#c0392b', secondary: 'white' } },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/our-story" element={<Layout><OurStory /></Layout>} />
            <Route path="/services" element={<Layout><Services /></Layout>} />
            <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
            <Route path="/gallery/:id" element={<Layout><GalleryAlbum /></Layout>} />
            <Route path="/testimonials" element={<Layout><Testimonials /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            <Route path="/donate" element={<Layout><Donate /></Layout>} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminPage><AdminDashboard /></AdminPage>} />
            <Route path="/admin/settings" element={<AdminPage><AdminSettings /></AdminPage>} />
            <Route path="/admin/slider" element={<AdminPage><AdminSlider /></AdminPage>} />
            <Route path="/admin/pages" element={<AdminPage><AdminPages /></AdminPage>} />
            <Route path="/admin/gallery" element={<AdminPage><AdminGallery /></AdminPage>} />
            <Route path="/admin/testimonials" element={<AdminPage><AdminTestimonials /></AdminPage>} />
            <Route path="/admin/programs"    element={<AdminPage><AdminPrograms /></AdminPage>} />
            <Route path="/admin/quotes"      element={<AdminPage><AdminQuotes /></AdminPage>} />
            <Route path="/admin/navigation"  element={<AdminPage><AdminNavigation /></AdminPage>} />
            <Route path="/admin/donations" element={<AdminPage><AdminDonations /></AdminPage>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  )
}
