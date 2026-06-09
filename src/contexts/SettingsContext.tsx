import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { SiteSettings } from '../types'

const defaultSettings: SiteSettings = {
  id: '',
  logo_url: '',
  favicon_url: '',
  primary_color: '#c0392b',
  heading_color: '#1a1a2e',
  font_family: 'Inter',
  site_name: 'FECT - Friends Educational and Charitable Trust',
  tagline: 'Transforming society by transforming individuals',
  top_bar_enabled: true,
  top_bar_reg_no: 'Reg No: TN-09/184, dt 06.02.2009',
  address: 'Chennai, Tamil Nadu, India',
  phone: '+91 98765 43210',
  email: 'info@fect.in',
  whatsapp: '',
  facebook_url: 'https://facebook.com',
  youtube_url: 'https://youtube.com',
  instagram_url: 'https://instagram.com/fect.friends2care',
  map_embed_url: '',
  footer_description: '',
  footer_copyright: '',
  donate_button_text: 'Donate Now',
  donate_button_link: '/donate',
  office_address: 'No.11A Ganeshan Street, 1st Floor\nEsa Pallavaram\nChennai 600 043\nTamil Nadu, India',
  office_emails: 'contactus@fect.in | admin@fect.in',
  contact_person_name: 'Dinesh Babu C',
  contact_person_role: 'Founder | President',
  contact_person_email: 'dinesh@fect.in',
  contact_person_phone: '+91-99529 71384 | +91-7904357453',
  contact_person_landline: '+91-44-42847087',
  notification_email: 'admin@fect.in',
  notify_on_contact: true,
  notify_on_donation: true,
  razorpay_key_id: '',
  payment_gateway: 'razorpay',
  billdesk_merchant_id: '',
  billdesk_env: 'production',
  donation_qr_url: '',
  updated_at: '',
}

interface SettingsContextType {
  settings: SiteSettings
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  refreshSettings: async () => {},
})

const adjustColor = (hex: string, amount: number): string => {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return hex
  const num = parseInt(clean, 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount))
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}

const applySettings = (s: SiteSettings) => {
  const root = document.documentElement
  root.style.setProperty('--site-primary', s.primary_color || '#c0392b')
  root.style.setProperty('--site-primary-dark', adjustColor(s.primary_color || '#c0392b', -20))
  root.style.setProperty('--site-heading-color', s.heading_color || '#1a1a2e')
  root.style.setProperty('--site-font', `'${s.font_family || 'Inter'}', system-ui, sans-serif`)
  if (s.site_name) document.title = s.site_name
  if (s.favicon_url) {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = s.favicon_url
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('site_settings').select('*').single()
      if (data) {
        setSettings(data)
        applySettings(data)
      }
    } catch {
      // Supabase not configured or table missing — use defaults
    }
  }

  useEffect(() => {
    applySettings(defaultSettings)
    fetchSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
