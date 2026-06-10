import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useSettings } from '../../contexts/SettingsContext'
import { Save, Upload, Palette, Globe, Phone, Share2, AlignLeft, Layout, Type, Building2, MailCheck, CreditCard, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'
import type { SiteSettings } from '../../types'

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat',
  'Raleway', 'Nunito', 'Playfair Display', 'Merriweather', 'Source Sans Pro',
]

const TABS = [
  { key: 'branding',  label: 'Branding',      icon: <Layout size={15} /> },
  { key: 'colors',    label: 'Colors & Font', icon: <Palette size={15} /> },
  { key: 'topbar',    label: 'Top Bar',       icon: <AlignLeft size={15} /> },
  { key: 'contact',   label: 'Contact',       icon: <Phone size={15} /> },
  { key: 'office',    label: 'Contact Details', icon: <Building2 size={15} /> },
  { key: 'social',    label: 'Social Media',  icon: <Share2 size={15} /> },
  { key: 'mailpay',   label: 'Mail & Payments', icon: <MailCheck size={15} /> },
  { key: 'header',    label: 'Header / Nav',  icon: <Type size={15} /> },
  { key: 'footer',    label: 'Footer',        icon: <Globe size={15} /> },
]

export default function AdminSettings() {
  const { settings, refreshSettings } = useSettings()
  const [form, setForm] = useState<Partial<SiteSettings>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'logo' | 'favicon' | 'qr' | null>(null)
  const [activeTab, setActiveTab] = useState('branding')
  const qrInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setForm(settings) }, [settings])

  const set = (key: keyof SiteSettings, value: string | boolean) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('site_settings')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', settings.id)
    setSaving(false)
    if (error) toast.error('Failed to save: ' + error.message)
    else { await refreshSettings(); toast.success('Settings saved!') }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(type)
    const path = `${type}-${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('fect-uploads').upload(path, file, { upsert: true })
    if (error) { toast.error('Upload failed'); setUploading(null); return }
    const { data: { publicUrl } } = supabase.storage.from('fect-uploads').getPublicUrl(path)
    set(type === 'logo' ? 'logo_url' : 'favicon_url', publicUrl)
    setUploading(null)
    toast.success('Uploaded!')
  }

  const Input = ({ label, field, type = 'text', placeholder = '' }: { label: string; field: keyof SiteSettings; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={(form[field] as string) ?? ''}
        onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-800 text-sm"
      />
    </div>
  )

  const Textarea = ({ label, field, placeholder = '', rows = 3 }: { label: string; field: keyof SiteSettings; placeholder?: string; rows?: number }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <textarea
        value={(form[field] as string) ?? ''}
        onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-800 text-sm resize-none"
      />
    </div>
  )

  const UploadField = ({ label, field, type }: { label: string; field: 'logo_url' | 'favicon_url'; type: 'logo' | 'favicon' }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      {form[field] && (
        <img src={form[field] as string} alt={label} className="h-14 mb-2 object-contain border rounded-lg p-1 bg-gray-50" />
      )}
      <input
        type="text"
        value={(form[field] as string) ?? ''}
        onChange={e => set(field, e.target.value)}
        placeholder="https://... or upload"
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm text-gray-700 mb-2"
      />
      <label className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 hover:border-(--site-primary) text-sm text-gray-500 transition-colors ${uploading === type ? 'opacity-60' : ''}`}>
        <Upload size={14} />
        {uploading === type ? 'Uploading…' : `Upload ${label}`}
        <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, type)} disabled={!!uploading} />
      </label>
    </div>
  )

  const renderTab = () => {
    switch (activeTab) {
      case 'branding':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
              <h3 className="font-bold text-gray-900">Site Identity</h3>
              <Input label="Site Name" field="site_name" placeholder="FECT - Friends Educational and Charitable Trust" />
              <Textarea label="Tagline / Short Description" field="tagline" placeholder="Transforming society by transforming individuals" rows={2} />
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-5">Logo & Favicon</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <UploadField label="Logo" field="logo_url" type="logo" />
                <UploadField label="Favicon" field="favicon_url" type="favicon" />
              </div>
            </div>
          </div>
        )

      case 'colors':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-5">Colors</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color</label>
                  <div className="flex gap-3 items-center mb-2">
                    <input type="color" value={form.primary_color ?? '#c0392b'} onChange={e => set('primary_color', e.target.value)} className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer p-1" />
                    <input type="text" value={form.primary_color ?? ''} onChange={e => set('primary_color', e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800 text-sm" placeholder="#c0392b" />
                  </div>
                  <div className="px-3 py-2 rounded-lg text-white text-xs font-medium" style={{ backgroundColor: form.primary_color ?? '#c0392b' }}>
                    Preview: buttons, top bar, accents
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Heading Color</label>
                  <div className="flex gap-3 items-center mb-2">
                    <input type="color" value={form.heading_color ?? '#1a1a2e'} onChange={e => set('heading_color', e.target.value)} className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer p-1" />
                    <input type="text" value={form.heading_color ?? ''} onChange={e => set('heading_color', e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800 text-sm" placeholder="#1a1a2e" />
                  </div>
                  <div className="text-base font-bold" style={{ color: form.heading_color ?? '#1a1a2e' }}>
                    Preview: all page headings
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-5">Typography</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Font Family</label>
                <select
                  value={form.font_family ?? 'Inter'}
                  onChange={e => set('font_family', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800 bg-white text-sm"
                >
                  {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <p className="text-xs text-gray-400 mt-1.5">Applied site-wide. Add the Google Fonts link in index.html if using a non-default font.</p>
              </div>
            </div>
          </div>
        )

      case 'topbar':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Top Bar</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    className={`w-11 h-6 rounded-full transition-colors relative ${form.top_bar_enabled ? 'bg-(--site-primary)' : 'bg-gray-300'}`}
                    style={form.top_bar_enabled ? { backgroundColor: 'var(--site-primary)' } : {}}
                    onClick={() => set('top_bar_enabled', !form.top_bar_enabled)}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${form.top_bar_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{form.top_bar_enabled ? 'Visible' : 'Hidden'}</span>
                </label>
              </div>
              <Input label="Registration Number Text (left side)" field="top_bar_reg_no" placeholder="Reg No: TN-09/184, dt 06.02.2009" />
              <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
                <p className="font-semibold mb-1">Top Bar Preview</p>
                <div className="rounded-lg py-2 px-4 text-white text-xs flex items-center justify-between gap-4" style={{ backgroundColor: form.primary_color ?? '#c0392b' }}>
                  <span>{form.top_bar_reg_no || 'Reg No: TN-09/184'}</span>
                  <span>✦ Your donation today can put a child through school tomorrow ✦</span>
                  <span>f  ▶  ig</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">Manage the rotating quotes in Admin → <strong>Top Bar Quotes</strong></p>
              </div>
            </div>
          </div>
        )

      case 'contact':
        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h3 className="font-bold text-gray-900">Contact Information</h3>
            <Input label="Address" field="address" placeholder="Chennai, Tamil Nadu, India" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Phone" field="phone" placeholder="+91 98765 43210" />
              <Input label="WhatsApp (with country code, no +)" field="whatsapp" placeholder="919876543210" />
            </div>
            <Input label="Email Address" field="email" type="email" placeholder="info@fect.in" />
            <Input label="Google Maps Embed URL" field="map_embed_url" placeholder="https://maps.google.com/maps?..." />
          </div>
        )

      case 'social':
        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h3 className="font-bold text-gray-900">Social Media Links</h3>
            <p className="text-sm text-gray-500">These appear in the top bar and footer.</p>
            <Input label="Facebook URL" field="facebook_url" placeholder="https://facebook.com/fect" />
            <Input label="YouTube URL" field="youtube_url" placeholder="https://youtube.com/@fect" />
            <Input label="Instagram URL" field="instagram_url" placeholder="https://instagram.com/fect.friends2care" />
          </div>
        )

      case 'office':
        return (
          <div className="space-y-6">
            {/* Registered Office */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
              <h3 className="font-bold text-gray-900">Registered Office</h3>
              <p className="text-sm text-gray-500">Shown on the Contact page. Each line wraps as a separate address line.</p>
              <Textarea label="Office Address" field="office_address" rows={4} placeholder={'No.11A Ganeshan Street, 1st Floor\nEsa Pallavaram\nChennai 600 043\nTamil Nadu, India'} />
              <Input label="Office Emails (separate with | )" field="office_emails" placeholder="contactus@fect.in | admin@fect.in" />
            </div>

            {/* Contact Person */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
              <h3 className="font-bold text-gray-900">Contact Person</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Name" field="contact_person_name" placeholder="Dinesh Babu C" />
                <Input label="Role / Designation" field="contact_person_role" placeholder="Founder | President" />
              </div>
              <Input label="Email(s) (separate with | )" field="contact_person_email" placeholder="dinesh@fect.in" />
              <Input label="Phone(s) (separate with | )" field="contact_person_phone" placeholder="+91-99529 71384 | +91-7904357453" />
              <Input label="Landline" field="contact_person_landline" placeholder="+91-44-42847087" />
            </div>
          </div>
        )

      case 'mailpay': {
        const enabledList = (form.payment_gateway || '')
          .split(',').map((s: string) => s.trim()).filter(Boolean)
        const isOn = (key: string) => enabledList.includes(key)

        const toggleGw = (key: string) => {
          const next = isOn(key)
            ? enabledList.filter((g: string) => g !== key)
            : [...enabledList, key]
          set('payment_gateway', next.join(','))
        }

        const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0]
          if (!file) return
          setUploading('qr')
          const path = `qr-${Date.now()}.${file.name.split('.').pop()}`
          const { error } = await supabase.storage.from('fect-uploads').upload(path, file, { upsert: true })
          if (error) { toast.error('Upload failed: ' + error.message); setUploading(null); return }
          const { data: { publicUrl } } = supabase.storage.from('fect-uploads').getPublicUrl(path)
          set('donation_qr_url', publicUrl)
          setUploading(null)
          toast.success('QR code uploaded!')
          e.target.value = ''
        }

        const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
          <button
            type="button"
            onClick={onClick}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${on ? '' : 'bg-gray-200'}`}
            style={on ? { backgroundColor: 'var(--site-primary)' } : {}}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        )

        return (
          <div className="space-y-6">
            {/* Email notifications */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
              <div className="flex items-center gap-2">
                <MailCheck size={18} style={{ color: 'var(--site-primary)' }} />
                <h3 className="font-bold text-gray-900">Email Notifications</h3>
              </div>
              <p className="text-sm text-gray-500">Receive an email alert when a contact form is submitted or a donation is made.</p>
              <Input label="Notification Recipient Email" field="notification_email" type="email" placeholder="admin@fect.in" />
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={!!form.notify_on_contact} onChange={e => set('notify_on_contact', e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm font-medium text-gray-700">Notify me on new contact form submissions</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={!!form.notify_on_donation} onChange={e => set('notify_on_donation', e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm font-medium text-gray-700">Notify me on new donations</span>
                </label>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
                <strong>Setup required (one-time):</strong> Email sending needs a Supabase Edge Function with a mail provider (Resend). Deploy the <code className="bg-amber-100 px-1 rounded">supabase/functions/notify</code> function and set your <code className="bg-amber-100 px-1 rounded">RESEND_API_KEY</code> as a Supabase secret.
              </div>
            </div>

            {/* Payment gateways — multiple can be on */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-2">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} style={{ color: 'var(--site-primary)' }} />
                <h3 className="font-bold text-gray-900">Payment Gateways</h3>
              </div>
              <p className="text-sm text-gray-500 mb-5">
                Enable one or more payment methods. When multiple are on, donors can choose their preferred method on the Donate page.
              </p>

              {/* ── Razorpay ── */}
              <div className={`rounded-2xl border-2 transition-all ${isOn('razorpay') ? 'border-blue-200 bg-blue-50/40' : 'border-gray-100'}`}>
                <div
                  className="flex items-center justify-between p-4 cursor-pointer select-none"
                  onClick={() => toggleGw('razorpay')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: '#3395ff' }}>
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Razorpay</p>
                      <p className="text-xs text-gray-500">Cards, UPI, Net Banking, Wallets</p>
                    </div>
                  </div>
                  <Toggle on={isOn('razorpay')} onClick={() => toggleGw('razorpay')} />
                </div>
                {isOn('razorpay') && (
                  <div className="px-4 pb-4 space-y-3 border-t border-blue-100 pt-4">
                    <Input label="Razorpay Key ID" field="razorpay_key_id" placeholder="rzp_live_xxxxxxxxxxxxx" />
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 leading-relaxed">
                      <strong>Where to find it:</strong> Razorpay Dashboard → Settings → API Keys → Key ID (starts with <code className="bg-blue-100 px-1 rounded">rzp_live_</code>). The Key Secret is not needed here.
                    </div>
                  </div>
                )}
              </div>

              {/* ── BillDesk ── */}
              <div className={`rounded-2xl border-2 transition-all ${isOn('billdesk') ? 'border-orange-200 bg-orange-50/40' : 'border-gray-100'}`}>
                <div
                  className="flex items-center justify-between p-4 cursor-pointer select-none"
                  onClick={() => toggleGw('billdesk')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: '#e65c00' }}>
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">BillDesk</p>
                      <p className="text-xs text-gray-500">Cards, UPI, Net Banking via BillDesk SmartGateway</p>
                    </div>
                  </div>
                  <Toggle on={isOn('billdesk')} onClick={() => toggleGw('billdesk')} />
                </div>
                {isOn('billdesk') && (
                  <div className="px-4 pb-4 space-y-3 border-t border-orange-100 pt-4">
                    <Input label="Merchant ID" field="billdesk_merchant_id" placeholder="FECTXXXX" />
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Environment</label>
                      <div className="flex gap-3">
                        {(['production', 'uat'] as const).map(env => (
                          <button key={env} type="button" onClick={() => set('billdesk_env', env)}
                            className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${(form.billdesk_env || 'production') === env ? 'text-white border-transparent' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                            style={(form.billdesk_env || 'production') === env ? { backgroundColor: '#e65c00' } : {}}
                          >
                            {env === 'production' ? 'Production (Live)' : 'UAT (Testing)'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-800 leading-relaxed">
                      <strong>Requires Edge Function:</strong> Deploy <code className="bg-orange-100 px-1 rounded">supabase/functions/billdesk-create-order</code> and set <code className="bg-orange-100 px-1 rounded">BILLDESK_SECRET</code> + <code className="bg-orange-100 px-1 rounded">BILLDESK_CLIENT_ID</code> as Supabase secrets.
                    </div>
                  </div>
                )}
              </div>

              {/* ── QR Code ── */}
              <div className={`rounded-2xl border-2 transition-all ${isOn('qr') ? 'border-green-200 bg-green-50/40' : 'border-gray-100'}`}>
                <div
                  className="flex items-center justify-between p-4 cursor-pointer select-none"
                  onClick={() => toggleGw('qr')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: '#27ae60' }}>
                      <QrCode size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">QR Code</p>
                      <p className="text-xs text-gray-500">Donors scan your UPI QR and enter their UTR reference</p>
                    </div>
                  </div>
                  <Toggle on={isOn('qr')} onClick={() => toggleGw('qr')} />
                </div>
                {isOn('qr') && (
                  <div className="px-4 pb-4 space-y-3 border-t border-green-100 pt-4">
                    <p className="text-sm text-gray-500">Upload your UPI / bank QR code image.</p>
                    {form.donation_qr_url && (
                      <div className="flex items-center gap-4">
                        <img src={form.donation_qr_url as string} alt="QR" className="w-32 h-32 object-contain border rounded-xl bg-white p-1.5" />
                        <span className="text-sm text-green-600 font-medium">QR active ✓</span>
                      </div>
                    )}
                    <input type="text" value={(form.donation_qr_url as string) ?? ''} onChange={e => set('donation_qr_url', e.target.value)} placeholder="Paste image URL or upload below" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm text-gray-700" />
                    <label className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 hover:border-green-400 text-sm text-gray-500 transition-colors ${uploading === 'qr' ? 'opacity-60' : ''}`}>
                      <Upload size={14} />
                      {uploading === 'qr' ? 'Uploading…' : 'Upload QR Code Image'}
                      <input ref={qrInputRef} type="file" accept="image/*" className="hidden" onChange={handleQrUpload} disabled={uploading === 'qr'} />
                    </label>
                  </div>
                )}
              </div>

              {enabledList.length === 0 && (
                <p className="text-sm text-gray-400 italic pt-2 text-center">
                  All gateways off — the Donate page will show contact info instead.
                </p>
              )}
            </div>
          </div>
        )
      }

      case 'header':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
              <h3 className="font-bold text-gray-900">Header / Donate Button</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Donate Button Text" field="donate_button_text" placeholder="Donate Now" />
                <Input label="Donate Button Link" field="donate_button_link" placeholder="/donate" />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-700">
              <p className="font-semibold mb-1">Navigation Menu Items</p>
              <p>Add, edit, reorder, or hide nav links in the dedicated <strong>Navigation</strong> admin page.</p>
            </div>
          </div>
        )

      case 'footer':
        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h3 className="font-bold text-gray-900">Footer Content</h3>
            <Textarea label="Footer Description (below logo)" field="footer_description" placeholder="Leave blank to use the site tagline" rows={3} />
            <Textarea label="Copyright Text" field="footer_copyright" placeholder={`© ${new Date().getFullYear()} FECT — All rights reserved.`} rows={2} />
            <p className="text-xs text-gray-400">Quick links in footer are auto-populated from Navigation. Programs come from the Programs admin page. Contact info comes from the Contact tab above.</p>
          </div>
        )

      default: return null
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Site Settings</h1>
          <p className="text-gray-500 text-sm">Manage all global website settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold disabled:opacity-60 transition-all hover:-translate-y-0.5"
          style={{ backgroundColor: 'var(--site-primary)' }}
        >
          <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-1 justify-center ${
              activeTab === tab.key
                ? 'text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
            style={activeTab === tab.key ? { backgroundColor: 'var(--site-primary)' } : {}}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {renderTab()}

      {/* Floating save button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold disabled:opacity-60 transition-all hover:-translate-y-0.5"
          style={{ backgroundColor: 'var(--site-primary)' }}
        >
          <Save size={16} /> {saving ? 'Saving…' : `Save ${TABS.find(t => t.key === activeTab)?.label}`}
        </button>
      </div>
    </div>
  )
}
