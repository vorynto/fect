import { motion } from 'framer-motion'
import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle, User, Building2, Printer } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSettings } from '../contexts/SettingsContext'
import { usePageContent } from '../hooks/usePageContent'
import toast from 'react-hot-toast'

// Split a "a@x.com | b@y.com" string into trimmed parts
const splitPipe = (s: string) => (s || '').split('|').map(p => p.trim()).filter(Boolean)

export default function Contact() {
  const { settings } = useSettings()
  const { getTitle, get } = usePageContent('contact')
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const heroTitle   = getTitle('hero', 'Contact Us')
  const heroDesc    = get('hero', 'We\'d love to hear from you — whether you want to volunteer, donate, or refer someone in need.')

  const officeEmails = splitPipe(settings.office_emails)
  const personEmails = splitPipe(settings.contact_person_email)
  const personPhones = splitPipe(settings.contact_person_phone)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error('Please fill in required fields'); return }
    setSubmitting(true)
    const { error } = await supabase.from('contact_messages').insert([form])
    setSubmitting(false)
    if (error) toast.error('Failed to send message. Please try again.')
    else { setSubmitted(true); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }
  }

  return (
    <div>
      <section className="py-28 relative bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&q=80)' }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <h1 className="text-5xl font-extrabold mb-4 text-white">{heroTitle}</h1>
          <p className="text-xl text-gray-200">{heroDesc}</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-14">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-3xl font-extrabold mb-3" style={{ color: 'var(--site-heading-color)' }}>Get In Touch</h2>
                <p className="text-gray-600 leading-relaxed">
                  {get('info', 'Whether you want to refer a student, support our cause, or simply learn more about FECT, we are here to connect.')}
                </p>
              </div>

              {/* Registered Office */}
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: 'var(--site-primary)' }}>
                    <Building2 size={20} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--site-heading-color)' }}>Registered Office</h3>
                </div>
                <div className="flex items-start gap-3 mb-3">
                  <MapPin size={16} className="mt-1 shrink-0 text-gray-400" />
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{settings.office_address}</p>
                </div>
                {officeEmails.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Mail size={16} className="mt-1 shrink-0 text-gray-400" />
                    <p className="text-sm">
                      {officeEmails.map((em, i) => (
                        <span key={em}>
                          <a href={`mailto:${em}`} className="font-medium hover:underline" style={{ color: 'var(--site-primary)' }}>{em}</a>
                          {i < officeEmails.length - 1 && <span className="text-gray-300 mx-1.5">|</span>}
                        </span>
                      ))}
                    </p>
                  </div>
                )}
              </div>

              {/* Contact Person */}
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: 'var(--site-primary)' }}>
                    <User size={20} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--site-heading-color)' }}>Contact Person</h3>
                </div>
                <p className="font-bold text-gray-900 text-lg">{settings.contact_person_name}</p>
                <p className="text-sm font-medium mb-4" style={{ color: 'var(--site-primary)' }}>{settings.contact_person_role}</p>

                <div className="space-y-2.5">
                  {personEmails.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Mail size={16} className="mt-0.5 shrink-0 text-gray-400" />
                      <p className="text-sm">
                        {personEmails.map((em, i) => (
                          <span key={em}>
                            <a href={`mailto:${em}`} className="font-medium hover:underline" style={{ color: 'var(--site-primary)' }}>{em}</a>
                            {i < personEmails.length - 1 && <span className="text-gray-300 mx-1.5">|</span>}
                          </span>
                        ))}
                      </p>
                    </div>
                  )}
                  {personPhones.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Phone size={16} className="mt-0.5 shrink-0 text-gray-400" />
                      <p className="text-sm text-gray-700">
                        {personPhones.map((ph, i) => (
                          <span key={ph}>
                            <a href={`tel:${ph.replace(/[^0-9+]/g, '')}`} className="font-medium hover:underline">{ph}</a>
                            {i < personPhones.length - 1 && <span className="text-gray-300 mx-1.5">|</span>}
                          </span>
                        ))}
                      </p>
                    </div>
                  )}
                  {settings.contact_person_landline && (
                    <div className="flex items-start gap-3">
                      <Printer size={16} className="mt-0.5 shrink-0 text-gray-400" />
                      <p className="text-sm text-gray-700">
                        <span className="text-gray-400">Landline: </span>
                        <a href={`tel:${settings.contact_person_landline.replace(/[^0-9+]/g, '')}`} className="font-medium hover:underline">{settings.contact_person_landline}</a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {settings.whatsapp && (
                <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ backgroundColor: '#25D366' }}>
                  WhatsApp Us
                </a>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-3">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <CheckCircle size={64} className="mb-5" style={{ color: 'var(--site-primary)' }} />
                  <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--site-heading-color)' }}>Message Sent!</h3>
                  <p className="text-gray-500 mb-6">We'll get back to you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="px-6 py-2 rounded-md text-white font-medium" style={{ backgroundColor: 'var(--site-primary)' }}>
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span style={{ color: 'var(--site-primary)' }}>*</span></label>
                      <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-800" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span style={{ color: 'var(--site-primary)' }}>*</span></label>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-800" required />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                      <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-800" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                      <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-800 bg-white">
                        <option value="">Select a subject</option>
                        <option>General Inquiry</option>
                        <option>Refer a Student</option>
                        <option>Refer a Patient</option>
                        <option>Become a Member</option>
                        <option>Corporate Partnership</option>
                        <option>Volunteer</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message <span style={{ color: 'var(--site-primary)' }}>*</span></label>
                    <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us how we can help..." rows={6} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-800 resize-none" required />
                  </div>
                  <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-semibold text-lg transition-all hover:-translate-y-0.5 disabled:opacity-70" style={{ backgroundColor: 'var(--site-primary)' }}>
                    {submitting ? 'Sending...' : <><Send size={20} /> Send Message</>}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
