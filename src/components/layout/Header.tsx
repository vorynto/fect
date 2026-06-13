import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useSettings } from '../../contexts/SettingsContext'
import { supabase } from '../../lib/supabase'
import type { NavItem } from '../../types'

const FALLBACK_NAV: NavItem[] = [
  { id: '1',  label: 'Home',             path: '/',                   parent_id: null, sort_order: 1,  is_active: true, is_button: false, open_in_new: false },
  { id: '2',  label: 'Our Story',        path: '/our-story',          parent_id: null, sort_order: 2,  is_active: true, is_button: false, open_in_new: false },
  { id: '2a', label: 'Our Mission',      path: '/our-mission',        parent_id: '2',  sort_order: 1,  is_active: true, is_button: false, open_in_new: false },
  { id: '2b', label: 'Our Services',     path: '/our-services',       parent_id: '2',  sort_order: 2,  is_active: true, is_button: false, open_in_new: false },
  { id: '2c', label: 'Our Work Process', path: '/our-work-process',   parent_id: '2',  sort_order: 3,  is_active: true, is_button: false, open_in_new: false },
  { id: '2d', label: 'Who We Are',       path: '/who-we-are',         parent_id: '2',  sort_order: 4,  is_active: true, is_button: false, open_in_new: false },
  { id: '3',  label: 'What You Can Do',  path: '/what-you-can-do',    parent_id: null, sort_order: 3,  is_active: true, is_button: false, open_in_new: false },
  { id: '3a', label: 'Refer a Student',  path: '/refer-a-student',    parent_id: '3',  sort_order: 1,  is_active: true, is_button: false, open_in_new: false },
  { id: '3b', label: 'Refer a Home',     path: '/refer-a-home',       parent_id: '3',  sort_order: 2,  is_active: true, is_button: false, open_in_new: false },
  { id: '3c', label: 'Donate',           path: '/donate',             parent_id: '3',  sort_order: 3,  is_active: true, is_button: false, open_in_new: false },
  { id: '3d', label: 'Become a Member',  path: '/become-a-member',    parent_id: '3',  sort_order: 4,  is_active: true, is_button: false, open_in_new: false },
  { id: '3e', label: 'Spread the Word',  path: '/spread-the-word',    parent_id: '3',  sort_order: 5,  is_active: true, is_button: false, open_in_new: false },
  { id: '4',  label: 'Gallery',          path: '/gallery',            parent_id: null, sort_order: 4,  is_active: true, is_button: false, open_in_new: false },
  { id: '5',  label: 'Video Gallery',    path: '/videos',             parent_id: null, sort_order: 5,  is_active: true, is_button: false, open_in_new: false },
  { id: '6',  label: 'Testimonials',     path: '/testimonials',       parent_id: null, sort_order: 6,  is_active: true, is_button: false, open_in_new: false },
  { id: '7',  label: 'Contact',          path: '/contact',            parent_id: null, sort_order: 7,  is_active: true, is_button: false, open_in_new: false },
]

function buildTree(flat: NavItem[]): NavItem[] {
  const map: Record<string, NavItem> = {}
  const roots: NavItem[] = []
  flat.forEach(item => { map[item.id] = { ...item, children: [] } })
  flat.forEach(item => {
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children!.push(map[item.id])
    } else if (!item.parent_id) {
      roots.push(map[item.id])
    }
  })
  return roots.sort((a, b) => a.sort_order - b.sort_order)
}

export default function Header() {
  const { settings } = useSettings()
  const location = useLocation()
  const [navItems, setNavItems] = useState<NavItem[]>(FALLBACK_NAV)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('nav_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) {
          // Only use DB nav if it contains the new page structure.
          // If the DB still has the old nav (About us / Our Services),
          // fall back to the hardcoded nav so new pages appear immediately.
          const hasNewNav = data.some(
            item => item.path === '/what-you-can-do' || item.path === '/our-mission' || item.path === '/our-services'
          )
          if (hasNewNav) setNavItems(buildTree(data))
          // else: keep FALLBACK_NAV (admin should click "Reset to Default" in nav admin)
        }
      })
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setOpenDropdown(null)
  }, [location.pathname])

  const mainItems = navItems.filter(n => !n.is_button)
  const buttonItem = navItems.find(n => n.is_button) || { label: settings.donate_button_text || 'Donate Now', path: settings.donate_button_link || '/donate' }

  return (
    <header
      className={`w-full z-40 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-4' : 'bg-white/95 backdrop-blur py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt={settings.site_name} className="h-16 w-auto" />
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: 'var(--site-primary)' }}
              >
                F
              </div>
              <div>
                <div className="font-bold text-xl leading-tight" style={{ color: 'var(--site-heading-color)' }}>FECT</div>
                <div className="text-sm text-gray-500 leading-tight hidden sm:block">Friends Educational & Charitable Trust</div>
              </div>
            </div>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {mainItems.map(item => (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => item.children?.length && setOpenDropdown(item.id)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                to={item.path}
                target={item.open_in_new ? '_blank' : undefined}
                className={`flex items-center gap-1 px-4 py-3 rounded-md text-sm font-semibold transition-colors ${
                  location.pathname === item.path
                    ? 'text-[var(--site-primary)]'
                    : 'text-gray-700 hover:text-[var(--site-primary)]'
                }`}
              >
                {item.label}
                {item.children?.length ? <ChevronDown size={13} /> : null}
              </Link>

              {!!item.children?.length && openDropdown === item.id && (
                <div className="absolute top-full left-0 bg-white shadow-xl rounded-xl py-2 min-w-[200px] border border-gray-100 z-50">
                  {item.children.map(child => (
                    <Link
                      key={child.id}
                      to={child.path}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--site-primary)] transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* CTA Button */}
          <Link
            to={buttonItem.path}
            className="ml-3 px-5 py-2 rounded-md text-white text-sm font-semibold transition-all hover:-translate-y-0.5 shadow-sm"
            style={{ backgroundColor: 'var(--site-primary)' }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = 'var(--site-primary-dark)')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = 'var(--site-primary)')}
          >
            {buttonItem.label}
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 rounded-md text-gray-700"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {mainItems.map(item => (
              <div key={item.id}>
                <Link
                  to={item.path}
                  className={`block px-4 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path
                      ? 'text-[var(--site-primary)] bg-red-50'
                      : 'text-gray-700 hover:text-[var(--site-primary)] hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
                {item.children?.map(child => (
                  <Link
                    key={child.id}
                    to={child.path}
                    className="block px-6 py-1.5 text-xs text-gray-500 hover:text-[var(--site-primary)]"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
            <Link
              to={buttonItem.path}
              className="mt-2 block text-center px-5 py-2.5 rounded-md text-white text-sm font-semibold"
              style={{ backgroundColor: 'var(--site-primary)' }}
            >
              {buttonItem.label}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
