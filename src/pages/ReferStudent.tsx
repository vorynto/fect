import { motion } from 'framer-motion'
import { useState } from 'react'
import { GraduationCap, CheckCircle, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { usePageContent } from '../hooks/usePageContent'
import toast from 'react-hot-toast'

export default function ReferStudent() {
  const { getTitle, get, getImage } = usePageContent('refer_student')

  const heroTitle = getTitle('hero', 'Refer a Student')
  const heroDesc  = get('hero', 'Know a bright child held back by poverty? Help us find them — we\'ll take care of the rest.')
  const introText = get('intro', 'We are looking for academically good poor children or schools that have a cluster of financially struggling students. If you know such a student or school, please fill in this form and we will reach out within a few days.')

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    referrer_name: '', referrer_email: '', referrer_phone: '',
    student_name: '', student_gender: '', institution: '', class_level: '', medium: '',
    father_name: '', father_alive: '', mother_name: '', mother_alive: '',
    guardian_name: '', guardian_phone: '', guardian_occupation: '', annual_income: '',
    other_info: '',
  })

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.referrer_name || !form.referrer_phone || !form.student_name || !form.institution) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    const message = `STUDENT REFERRAL\n\nReferrer: ${form.referrer_name} | Email: ${form.referrer_email} | Phone: ${form.referrer_phone}\n\nStudent: ${form.student_name} | Gender: ${form.student_gender} | Institution: ${form.institution} | Class: ${form.class_level} | Medium: ${form.medium}\n\nFather: ${form.father_name} (${form.father_alive}) | Mother: ${form.mother_name} (${form.mother_alive})\nGuardian: ${form.guardian_name} | Phone: ${form.guardian_phone} | Occupation: ${form.guardian_occupation} | Annual Income: ${form.annual_income}\n\nOther Info: ${form.other_info}`
    const { error } = await supabase.from('contact_messages').insert([{
      name: form.referrer_name,
      email: form.referrer_email || 'not-provided@fect.in',
      phone: form.referrer_phone,
      subject: `Student Referral: ${form.student_name}`,
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
          <p className="text-gray-600 mb-6">Your student referral has been submitted. We will review the details and reach out to you shortly.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-8 py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: 'var(--site-primary)' }}
          >
            Submit Another
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
        style={{ backgroundImage: `url(${getImage('hero', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80')})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-5">
            <GraduationCap size={56} className="opacity-80" style={{ color: 'var(--site-primary)' }} />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-extrabold mb-4 text-white">
            {heroTitle}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-gray-200">
            {heroDesc}
          </motion.p>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
            <div className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-100">
              <p className="text-gray-700 text-sm leading-relaxed">{introText}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Referrer Details */}
              <div>
                <h3 className="text-base font-bold mb-4 pb-2 border-b border-gray-100" style={{ color: 'var(--site-heading-color)' }}>
                  Your Details (Referrer)
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Your Name *</label>
                    <input value={form.referrer_name} onChange={e => set('referrer_name', e.target.value)} className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Your Phone *</label>
                    <input value={form.referrer_phone} onChange={e => set('referrer_phone', e.target.value)} className={inputCls} required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Your Email</label>
                    <input type="email" value={form.referrer_email} onChange={e => set('referrer_email', e.target.value)} className={inputCls} />
                  </div>
                </div>
              </div>

              {/* Student Details */}
              <div>
                <h3 className="text-base font-bold mb-4 pb-2 border-b border-gray-100" style={{ color: 'var(--site-heading-color)' }}>
                  Student Profile
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Student Name *</label>
                    <input value={form.student_name} onChange={e => set('student_name', e.target.value)} className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Gender</label>
                    <select value={form.student_gender} onChange={e => set('student_gender', e.target.value)} className={inputCls}>
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Institution Name *</label>
                    <input value={form.institution} onChange={e => set('institution', e.target.value)} className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Class / Course</label>
                    <input value={form.class_level} onChange={e => set('class_level', e.target.value)} className={inputCls} placeholder="e.g. Class 10, B.Sc. 1st year" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Medium of Instruction</label>
                    <select value={form.medium} onChange={e => set('medium', e.target.value)} className={inputCls}>
                      <option value="">Select</option>
                      <option>Tamil</option>
                      <option>English</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Guardian Details */}
              <div>
                <h3 className="text-base font-bold mb-4 pb-2 border-b border-gray-100" style={{ color: 'var(--site-heading-color)' }}>
                  Guardian / Family Details
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Father's Name</label>
                    <input value={form.father_name} onChange={e => set('father_name', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Father's Status</label>
                    <select value={form.father_alive} onChange={e => set('father_alive', e.target.value)} className={inputCls}>
                      <option value="">Select</option>
                      <option>Alive</option>
                      <option>Deceased</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Mother's Name</label>
                    <input value={form.mother_name} onChange={e => set('mother_name', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Mother's Status</label>
                    <select value={form.mother_alive} onChange={e => set('mother_alive', e.target.value)} className={inputCls}>
                      <option value="">Select</option>
                      <option>Alive</option>
                      <option>Deceased</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Guardian Name (if different)</label>
                    <input value={form.guardian_name} onChange={e => set('guardian_name', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Guardian Phone</label>
                    <input value={form.guardian_phone} onChange={e => set('guardian_phone', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Guardian Occupation</label>
                    <input value={form.guardian_occupation} onChange={e => set('guardian_occupation', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Annual Family Income (approx.)</label>
                    <input value={form.annual_income} onChange={e => set('annual_income', e.target.value)} className={inputCls} placeholder="e.g. ₹60,000/year" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Any Other Information</label>
                    <textarea value={form.other_info} onChange={e => set('other_info', e.target.value)} rows={3} className={inputCls + ' resize-none'} />
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
                  <><Send size={18} /> Submit Referral</>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
