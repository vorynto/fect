import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react'
import { useSettings } from '../../contexts/SettingsContext'
import { supabase } from '../../lib/supabase'
import type { NavItem, Program } from '../../types'

export default function Footer() {
  const { settings } = useSettings()
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const year = new Date().getFullYear()

  useEffect(() => {
    supabase.from('nav_items').select('*').is('parent_id', null).eq('is_active', true).eq('is_button', false).order('sort_order')
      .then(({ data }) => { if (data) setNavItems(data) })
    supabase.from('programs').select('*').eq('is_active', true).order('sort_order').limit(6)
      .then(({ data }) => { if (data) setPrograms(data) })
  }, [])

  const footerDesc = settings.footer_description ||
    settings.tagline ||
    'Friends Educational and Charitable Trust — registered non-profit (TN-09/184, 2009) transforming lives through education, medical aid, and community care in Tamil Nadu.'

  const copyright = settings.footer_copyright ||
    `© ${year} FECT — Friends Educational and Charitable Trust. Reg No: TN-09/184. All rights reserved.`

  const quickLinks = navItems.length > 0 ? navItems : [
    { id: '1', label: 'Home',         path: '/'             },
    { id: '2', label: 'About Us',      path: '/our-story'    },
    { id: '3', label: 'Our Services', path: '/services'     },
    { id: '4', label: 'Gallery',      path: '/gallery'      },
    { id: '5', label: 'Testimonials', path: '/testimonials' },
    { id: '6', label: 'Contact Us',   path: '/contact'      },
  ]

  const defaultPrograms = ['Education Support', 'Medical Assistance', 'Orphanage & Elderly Care', 'Community Support', 'Refer a Student', 'Become a Member']

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {settings.logo_url ? (
                <span className="inline-flex items-center bg-white rounded-lg px-2 py-1.5">
                  <img src={settings.logo_url} alt={settings.site_name} className="h-9 w-auto object-contain" />
                </span>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: 'var(--site-primary)' }}>F</div>
                  <span className="text-white font-bold text-lg">FECT</span>
                </>
              )}
            </div>
            <p className="text-sm leading-relaxed mb-4">{footerDesc}</p>
            <div className="flex gap-3">
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-(--site-primary) transition-colors text-white text-xs font-bold">f</a>
              )}
              {settings.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-(--site-primary) transition-colors">
                  <ExternalLink size={14} />
                </a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-(--site-primary) transition-colors text-white text-xs font-bold">ig</a>
              )}
            </div>
          </div>

          {/* Quick Links — dynamic from nav_items */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.id}>
                  <Link to={link.path}
                    className="text-sm hover:text-(--site-primary) transition-colors flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-(--site-primary) inline-block" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs — dynamic from programs table */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Our Programs</h4>
            <ul className="space-y-2 text-sm">
              {(programs.length > 0 ? programs.map(p => p.title) : defaultPrograms).map(item => (
                <li key={item} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-(--site-primary) inline-block" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — fully dynamic */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm">
              {settings.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-(--site-primary)" />
                  <span>{settings.address}</span>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-2.5">
                  <Mail size={15} className="shrink-0 text-(--site-primary)" />
                  <a href={`mailto:${settings.email}`} className="hover:text-(--site-primary) transition-colors">{settings.email}</a>
                </li>
              )}
              {settings.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone size={15} className="shrink-0 text-(--site-primary)" />
                  <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-(--site-primary) transition-colors">{settings.phone}</a>
                </li>
              )}
            </ul>
            <div className="mt-5">
              <Link
                to={settings.donate_button_link || '/donate'}
                className="inline-block px-5 py-2 rounded-md text-white text-sm font-semibold transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--site-primary)' }}
              >
                {settings.donate_button_text || 'Donate Now'}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>{copyright}</p>
          <p>
            Developed By{' '}
            <a
              href="https://voryntotechnologies.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold hover:underline"
              style={{ color: 'var(--site-primary)' }}
            >
              Vorynto Technologies
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
