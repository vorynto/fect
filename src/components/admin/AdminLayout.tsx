import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Settings, Image, FileText, MessageSquare,
  LogOut, Menu, X, Heart, ChevronRight, Images, Layers,
  Navigation, Quote, Inbox
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const nav = [
  { label: 'Dashboard',    path: '/admin',                icon: <LayoutDashboard size={18} />, group: null },
  { label: 'Site Settings',path: '/admin/settings',       icon: <Settings size={18} />,        group: 'Site' },
  { label: 'Navigation',   path: '/admin/navigation',     icon: <Navigation size={18} />,      group: 'Site' },
  { label: 'Top Bar Quotes',path: '/admin/quotes',        icon: <Quote size={18} />,            group: 'Site' },
  { label: 'Hero Slider',  path: '/admin/slider',         icon: <Image size={18} />,           group: 'Content' },
  { label: 'Page Content', path: '/admin/pages',          icon: <FileText size={18} />,        group: 'Content' },
  { label: 'Programs',     path: '/admin/programs',       icon: <Layers size={18} />,          group: 'Content' },
  { label: 'Gallery',      path: '/admin/gallery',        icon: <Images size={18} />,          group: 'Content' },
  { label: 'Testimonials', path: '/admin/testimonials',   icon: <MessageSquare size={18} />,   group: 'Content' },
  { label: 'Enquiries',    path: '/admin/enquiries',      icon: <Inbox size={18} />,            group: 'Reports' },
  { label: 'Donations',    path: '/admin/donations',      icon: <Heart size={18} />,            group: 'Reports' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate('/admin/login')
  }

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`${mobile ? 'fixed inset-y-0 left-0 z-50 w-64 shadow-2xl' : 'hidden lg:flex'} flex-col bg-gray-900 text-white`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: 'var(--site-primary)' }}
          >
            F
          </div>
          <div>
            <p className="font-bold text-sm">FECT Admin</p>
            <p className="text-xs text-gray-400">Website Manager</p>
          </div>
        </div>
        {mobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {(() => {
          const groups: Record<string, typeof nav> = {}
          nav.forEach(item => {
            const g = item.group ?? '__root__'
            if (!groups[g]) groups[g] = []
            groups[g].push(item)
          })
          return Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mb-3">
              {group !== '__root__' && (
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-1 mt-2">{group}</p>
              )}
              {items.map(item => {
                const active = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                      active ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                    style={active ? { backgroundColor: 'var(--site-primary)' } : {}}
                  >
                    {item.icon}
                    {item.label}
                    {active && <ChevronRight size={14} className="ml-auto" />}
                  </Link>
                )
              })}
            </div>
          ))
        })()}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-800">
        <Link to="/" target="_blank" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-all mb-1">
          View Website
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <Sidebar mobile />
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <button
            className="lg:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <h2 className="font-semibold text-gray-800">
            {nav.find(n => n.path === location.pathname)?.label || 'Admin Panel'}
          </h2>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
