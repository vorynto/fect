import { motion } from 'framer-motion'
import { useState } from 'react'
import { Users, CheckCircle, Send, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { usePageContent } from '../hooks/usePageContent'
import toast from 'react-hot-toast'

const FREQUENCY_OPTIONS = [
  { value: 'monthly',     label: 'Monthly',     min: '₹100' },
  { value: 'quarterly',   label: 'Quarterly',   min: '₹300' },
  { value: 'half_yearly', label: 'Half Yearly', min: '₹500' },
  { value: 'yearly',      label: 'Yearly',      min: '₹1,000' },
]

const PERKS = [
  'Be part of a close-knit community committed to social good',
  'Get direct updates on the students and homes you help',
  'Option to participate in field visits and awareness events',
  'Recognition in our annual impact report',
  '80G tax exemption on your contributions',
]

export default function BecomeAMember() {
  const { getTitle, get, getImage } = usePageContent('become_a_member')

  const heroTitle  = getTitle('hero', 'Become a Member')
  const heroDesc   = get('hero', 'Join 40+ committed individuals who are transforming lives across Tamil Nadu through consistent, compassionate support.')
  const introText  = get('intro', 'Becoming a member of FECT means you pledge a regular contribution — however small — towards the cause of education and care. Members are the backbone of our operations. Please fill in the form below and we will get in touch to complete the enrolment process.')
  const reqTitle   = getTitle('req_title', 'Membership Requirements')
  const reqContent = get('req_content', 'Members are required to promise a certain sum of money which can be made either monthly, quarterly, half-yearly, or yearly. Minimum contributions are: Monthly ₹100 · Quarterly ₹300 · Half-Yearly ₹500 · Yearly ₹1,000. Members also have the option to participate in field work activities.')

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [frequency, setFrequency] = useState('')
  const [fieldWork, setFieldWork] = useState('')

  const [form, setForm] = useState({
    name: '', permanent_address: '', temp_address: '',
    mobile: '', landline: '', amount: '', personal_email: '', official_email: '',
  })

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.mobile || !frequency || !form.amount) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    const message = `MEMBERSHIP APPLICATION\n\nName: ${form.name}\nPermanent Address: ${form.permanent_address}\nTemporary Address: ${form.temp_address}\nMobile: ${form.mobile} | Landline: ${form.landline}\nContribution: ${frequency} — ₹${form.amount}\nField Work: ${fieldWork}\nPersonal Email: ${form.personal_email}\nOfficial Email: ${form.official_email}`
    const { error } = await supabase.from('contact_messages').insert([{
      name: form.name,
      email: form.personal_email || form.official_email || 'not-provided@fect.in',
      phone: form.mobile,
      subject: `Membership Application: ${form.name}`,
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
          <h2 className="text-3xl font-extrabold mb-3" style={{ color: 'var(--site-heading-color)' }}>Application Received!</h2>
          <p className="text-gray-600 mb-6">Thank you for choosing to become a member. We will review your application and contact you within a few days to complete the enrolment.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-8 py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: 'var(--site-primary)' }}
          >
            Back to Form
          </button>
        </motion.div>
      </div>
    )
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--site-primary)] text-gray-800 text-sm'
  const labelCls = 'block text-xs font-semibold text-gray-500 mb-1.5'

  return (
    <div>
      {/* Hero */}
      <section
        className="py-28 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${getImage('hero', 'https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=1600&q=80')})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-5">
            <Users size={56} className="opacity-80" style={{ color: 'var(--site-primary)' }} />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-extrabold mb-4 text-white">
            {heroTitle}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-gray-200">
            {heroDesc}
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
                <div className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-100">
                  <p className="text-gray-700 text-sm leading-relaxed">{introText}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal */}
                  <div>
                    <h3 className="text-base font-bold mb-4 pb-2 border-b border-gray-100" style={{ color: 'var(--site-heading-color)' }}>
                      Personal Details
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Full Name *</label>
                        <input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} required />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Permanent Address</label>
                        <textarea value={form.permanent_address} onChange={e => set('permanent_address', e.target.value)} rows={2} className={inputCls + ' resize-none'} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Temporary Address (if different)</label>
                        <textarea value={form.temp_address} onChange={e => set('temp_address', e.target.value)} rows={2} className={inputCls + ' resize-none'} />
                      </div>
                      <div>
                        <label className={labelCls}>Mobile No *</label>
                        <input value={form.mobile} onChange={e => set('mobile', e.target.value)} className={inputCls} required />
                      </div>
                      <div>
                        <label className={labelCls}>Landline No</label>
                        <input value={form.landline} onChange={e => set('landline', e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Personal Email</label>
                        <input type="email" value={form.personal_email} onChange={e => set('personal_email', e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Official Email</label>
                        <input type="email" value={form.official_email} onChange={e => set('official_email', e.target.value)} className={inputCls} />
                      </div>
                    </div>
                  </div>

                  {/* Contribution */}
                  <div>
                    <h3 className="text-base font-bold mb-4 pb-2 border-b border-gray-100" style={{ color: 'var(--site-heading-color)' }}>
                      Contribution Details
                    </h3>
                    <div className="mb-4">
                      <label className={labelCls}>Contribution Frequency *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {FREQUENCY_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFrequency(opt.value)}
                            className={`py-3 px-2 rounded-xl border-2 text-center transition-all ${
                              frequency === opt.value
                                ? 'text-white border-transparent'
                                : 'border-gray-200 text-gray-700 hover:border-[var(--site-primary)]'
                            }`}
                            style={frequency === opt.value ? { backgroundColor: 'var(--site-primary)' } : {}}
                          >
                            <div className="font-bold text-sm">{opt.label}</div>
                            <div className={`text-xs mt-0.5 ${frequency === opt.value ? 'text-red-100' : 'text-gray-400'}`}>min {opt.min}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Amount (₹) *</label>
                        <input value={form.amount} onChange={e => set('amount', e.target.value)} className={inputCls} placeholder="e.g. 500" required />
                      </div>
                      <div>
                        <label className={labelCls}>Interested in Field Work? *</label>
                        <div className="flex gap-3 mt-2">
                          {['Yes', 'No'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setFieldWork(opt)}
                              className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                                fieldWork === opt ? 'text-white border-transparent' : 'border-gray-200 text-gray-700'
                              }`}
                              style={fieldWork === opt ? { backgroundColor: 'var(--site-primary)' } : {}}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
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
                      <><Send size={18} /> Submit Application</>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg mb-4" style={{ color: 'var(--site-heading-color)' }}>{reqTitle}</h4>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">{reqContent}</p>
                <div className="space-y-3">
                  {FREQUENCY_OPTIONS.map(opt => (
                    <div key={opt.value} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                      <span className="text-gray-600">{opt.label}</span>
                      <span className="font-bold" style={{ color: 'var(--site-primary)' }}>Min {opt.min}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: 'var(--site-primary)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Star size={20} className="text-yellow-300" />
                  <h4 className="font-bold text-lg">Member Perks</h4>
                </div>
                <ul className="space-y-3">
                  {PERKS.map(perk => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-red-100">
                      <CheckCircle size={14} className="text-white mt-0.5 shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
