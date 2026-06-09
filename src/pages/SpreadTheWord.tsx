import { motion } from 'framer-motion'
import { useState } from 'react'
import { Share2, CheckCircle, Send, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { usePageContent } from '../hooks/usePageContent'
import { useSettings } from '../contexts/SettingsContext'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
}

export default function SpreadTheWord() {
  const { getTitle, get, getImage } = usePageContent('spread_the_word')
  const { settings } = useSettings()

  const heroTitle = getTitle('hero', 'Spread the Word')
  const heroDesc  = get('hero', 'Your voice can change lives. Help us reach more people who need support and more people who can give it.')
  const introText = get('intro', 'Though we are very active on social media, we would have better coverage if each of you spoke to your group of friends and enhanced our efforts. Share our story, share our mission — and help us find the next student or home that needs our support.')

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    sender_name: '', sender_email: '', friend_email: '', comments: '',
  })

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.sender_name || !form.sender_email || !form.friend_email) {
      toast.error('Please fill in your name, email, and your friend\'s email')
      return
    }
    setSubmitting(true)
    const message = `SPREAD THE WORD\n\nFrom: ${form.sender_name} (${form.sender_email})\nFriend's Email: ${form.friend_email}\nComments: ${form.comments}`
    const { error } = await supabase.from('contact_messages').insert([{
      name: form.sender_name,
      email: form.sender_email,
      phone: '',
      subject: `Spread the Word from ${form.sender_name}`,
      message,
    }])
    setSubmitting(false)
    if (error) toast.error('Submission failed. Please try again.')
    else setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-12 shadow-xl text-center max-w-md w-full"
        >
          <CheckCircle size={72} className="mx-auto mb-6" style={{ color: 'var(--site-primary)' }} />
          <h2 className="text-3xl font-extrabold mb-3" style={{ color: 'var(--site-heading-color)' }}>Thank You!</h2>
          <p className="text-gray-600 mb-6">Your message has been sent. Every share helps us reach further and do more good.</p>
          <button
            onClick={() => { setSubmitted(false); setForm({ sender_name: '', sender_email: '', friend_email: '', comments: '' }) }}
            className="px-8 py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: 'var(--site-primary)' }}
          >
            Share Again
          </button>
        </motion.div>
      </div>
    )
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--site-primary)] text-gray-800 text-sm'
  const labelCls = 'block text-xs font-semibold text-gray-500 mb-1.5'

  const socialLinks = [
    { label: 'Facebook',  url: settings.facebook_url,  color: '#1877f2' },
    { label: 'YouTube',   url: settings.youtube_url,   color: '#ff0000' },
    { label: 'Instagram', url: settings.instagram_url, color: '#e1306c' },
  ].filter(s => s.url)

  const shareItems = [
    { key: 'share_1', defaultTitle: 'Tell Your Friends',       defaultDesc: 'A personal recommendation carries more weight than any ad. Tell the people in your life about FECT.' },
    { key: 'share_2', defaultTitle: 'Share on Social Media',   defaultDesc: 'Post about our work on Facebook, Instagram, or WhatsApp. Tag us and encourage your network to engage.' },
    { key: 'share_3', defaultTitle: 'Refer Potential Donors',  defaultDesc: 'Know someone who might want to contribute? Connect them with us — we\'ll take it from there.' },
    { key: 'share_4', defaultTitle: 'Spread in Communities',   defaultDesc: 'Share in schools, religious gatherings, resident associations, or workplaces where people look for causes to support.' },
  ]

  return (
    <div>
      {/* Hero */}
      <section
        className="py-28 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${getImage('hero', 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1600&q=80')})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-5">
            <Share2 size={56} className="opacity-80" style={{ color: 'var(--site-primary)' }} />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-extrabold mb-4 text-white">
            {heroTitle}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-gray-200">
            {heroDesc}
          </motion.p>
        </div>
      </section>

      {/* Ways to Share */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full mb-4 text-white" style={{ backgroundColor: 'var(--site-primary)' }}>
              How to Help
            </span>
            <h2 className="text-4xl font-extrabold mb-4" style={{ color: 'var(--site-heading-color)' }}>Ways to Spread the Word</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{introText}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {shareItems.map((item, i) => (
              <motion.div
                key={item.key}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:border-[var(--site-primary)] hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mb-5" style={{ backgroundColor: 'var(--site-primary)' }}>
                  {i + 1}
                </div>
                <h3 className="font-bold mb-2 text-sm" style={{ color: 'var(--site-heading-color)' }}>
                  {getTitle(item.key, item.defaultTitle)}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {get(item.key, item.defaultDesc)}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Social Media */}
          {socialLinks.length > 0 && (
            <div className="text-center mb-8">
              <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--site-heading-color)' }}>Follow & Share Our Social Pages</h3>
              <div className="flex justify-center gap-4 flex-wrap">
                {socialLinks.map(s => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{ borderColor: s.color, color: s.color }}
                  >
                    <ExternalLink size={16} /> {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Refer a Friend Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl font-extrabold" style={{ color: 'var(--site-heading-color)' }}>Refer a Friend</h2>
            <p className="text-gray-500 mt-3">Tell us your friend's email and we'll reach out with information about FECT</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-3xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelCls}>Your Name *</label>
                <input value={form.sender_name} onChange={e => set('sender_name', e.target.value)} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Your Email *</label>
                <input type="email" value={form.sender_email} onChange={e => set('sender_email', e.target.value)} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Friend's Email *</label>
                <input type="email" value={form.friend_email} onChange={e => set('friend_email', e.target.value)} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Comments (optional)</label>
                <textarea value={form.comments} onChange={e => set('comments', e.target.value)} rows={3} className={inputCls + ' resize-none'} />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-white font-bold text-base transition-all hover:-translate-y-0.5 disabled:opacity-60"
                style={{ backgroundColor: 'var(--site-primary)' }}
              >
                {submitting ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <><Send size={18} /> Send Referral</>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
