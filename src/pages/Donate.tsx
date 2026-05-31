import { motion } from 'framer-motion'
import { useState } from 'react'
import { Heart, Shield, CheckCircle, IndianRupee } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { usePageContent } from '../hooks/usePageContent'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void }
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id?: string
  handler: (response: RazorpayResponse) => void
  prefill: { name: string; email: string; contact: string }
  theme: { color: string }
  modal: { ondismiss: () => void }
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id?: string
  razorpay_signature?: string
}

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000]

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key'

const DEFAULT_TIERS = [
  { amount: '₹500/month', name: 'Educate a Child',    desc: 'Covers school fees, books, and uniform for one child throughout the academic year.' },
  { amount: '₹2,000',     name: 'Medical Emergency',  desc: 'Contributes to treatment costs for a cancer patient or medical emergency case.' },
  { amount: '₹1,000/month',name: 'Elderly Care',      desc: 'Supports one elderly person in a care home with essentials and regular visits.' },
  { amount: '₹300',       name: 'School Kit',          desc: 'Provides a complete school kit with stationery and learning materials for one child.' },
]

export default function Donate() {
  const [amount, setAmount] = useState<number>(1000)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [paymentId, setPaymentId] = useState('')
  const { getTitle, get } = usePageContent('donate')

  const finalAmount = isCustom ? parseInt(customAmount) || 0 : amount

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise(resolve => {
      if (window.Razorpay) { resolve(true); return }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) {
      toast.error('Please enter your name and email')
      return
    }
    if (finalAmount < 100) {
      toast.error('Minimum donation amount is ₹100')
      return
    }

    setProcessing(true)
    const loaded = await loadRazorpay()
    if (!loaded) {
      toast.error('Failed to load payment gateway. Please try again.')
      setProcessing(false)
      return
    }

    const options: RazorpayOptions = {
      key: RAZORPAY_KEY,
      amount: finalAmount * 100,
      currency: 'INR',
      name: 'FECT - Friends Educational & Charitable Trust',
      description: 'Donation to support underprivileged communities',
      handler: async (response: RazorpayResponse) => {
        const { error } = await supabase.from('donations').insert([{
          name: form.name,
          email: form.email,
          phone: form.phone,
          amount: finalAmount,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id || '',
          status: 'success',
        }])
        if (!error) {
          setPaymentId(response.razorpay_payment_id)
          setSuccess(true)
        } else {
          toast.success('Payment received! (ID: ' + response.razorpay_payment_id + ')')
        }
        setProcessing(false)
      },
      prefill: { name: form.name, email: form.email, contact: form.phone },
      theme: { color: getComputedStyle(document.documentElement).getPropertyValue('--site-primary').trim() || '#c0392b' },
      modal: { ondismiss: () => setProcessing(false) },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-12 shadow-xl text-center max-w-md w-full"
        >
          <CheckCircle size={80} className="mx-auto mb-6" style={{ color: 'var(--site-primary)' }} />
          <h2 className="text-3xl font-extrabold mb-3" style={{ color: 'var(--site-heading-color)' }}>
            Thank You, {form.name}!
          </h2>
          <p className="text-gray-600 mb-4">
            Your donation of <strong>₹{finalAmount.toLocaleString('en-IN')}</strong> has been received.
          </p>
          <p className="text-sm text-gray-400 mb-8">Payment ID: {paymentId}</p>
          <button
            onClick={() => { setSuccess(false); setForm({ name: '', email: '', phone: '' }) }}
            className="px-8 py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: 'var(--site-primary)' }}
          >
            Donate Again
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section
        className="py-28 relative"
        style={{ background: 'linear-gradient(135deg, var(--site-heading-color) 0%, #2d3748 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <Heart size={56} className="mx-auto mb-5 opacity-80" style={{ color: 'var(--site-primary)' }} />
          <h1 className="text-5xl font-extrabold mb-4 text-white">{getTitle('hero', 'Make a Donation')}</h1>
          <p className="text-xl text-gray-300">
            {get('hero', 'Your generosity directly transforms lives. Every rupee funds education, medical aid, and care for the vulnerable.')}
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Donation Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-extrabold mb-7" style={{ color: 'var(--site-heading-color)' }}>
                  Choose Your Donation
                </h2>

                {/* Amount selection */}
                <div className="mb-7">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Select Amount</p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                    {PRESET_AMOUNTS.map(a => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => { setAmount(a); setIsCustom(false) }}
                        className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                          !isCustom && amount === a
                            ? 'text-white border-transparent'
                            : 'border-gray-200 text-gray-700 hover:border-[var(--site-primary)]'
                        }`}
                        style={!isCustom && amount === a ? { backgroundColor: 'var(--site-primary)', borderColor: 'var(--site-primary)' } : {}}
                      >
                        ₹{a.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCustom(true)}
                      className={`flex-shrink-0 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                        isCustom ? 'text-white border-transparent' : 'border-gray-200 text-gray-700'
                      }`}
                      style={isCustom ? { backgroundColor: 'var(--site-primary)' } : {}}
                    >
                      Custom
                    </button>
                    {isCustom && (
                      <div className="flex-1 flex items-center gap-2 border-2 border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-[var(--site-primary)]">
                        <IndianRupee size={16} className="text-gray-400" />
                        <input
                          type="number"
                          value={customAmount}
                          onChange={e => setCustomAmount(e.target.value)}
                          placeholder="Enter amount"
                          min="100"
                          className="flex-1 outline-none text-gray-800 text-sm"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Donor details */}
                <form onSubmit={handleDonate}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Details</h3>
                  <div className="space-y-4 mb-7">
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Full Name *"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-800"
                      required
                    />
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="Email Address *"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-800"
                      required
                    />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="Phone Number"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-800"
                    />
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl p-4 mb-6 bg-gray-50 border border-gray-100 flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Total Donation</span>
                    <span className="text-2xl font-extrabold" style={{ color: 'var(--site-primary)' }}>
                      ₹{finalAmount > 0 ? finalAmount.toLocaleString('en-IN') : '0'}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={processing || finalAmount < 100}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-white font-bold text-lg transition-all hover:-translate-y-0.5 disabled:opacity-60"
                    style={{ backgroundColor: 'var(--site-primary)' }}
                  >
                    {processing ? (
                      <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <><Heart size={22} /> Donate ₹{finalAmount > 0 ? finalAmount.toLocaleString('en-IN') : ''} Now</>
                    )}
                  </button>

                  <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                    <Shield size={12} /> Secure payment via Razorpay. 80G tax exemption available.
                  </p>
                </form>
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {DEFAULT_TIERS.map((d, i) => {
                const raw = get(`tier_${i + 1}`, `${d.name}|${d.desc}`)
                const [namePart, descPart] = raw.includes('|') ? raw.split('|') : [d.name, raw]
                const card = { title: namePart, amount: getTitle(`tier_${i + 1}`, d.amount), desc: descPart }
                return (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold" style={{ color: 'var(--site-heading-color)' }}>{card.title}</h4>
                    <span className="text-sm font-bold" style={{ color: 'var(--site-primary)' }}>{card.amount}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                </div>
              )})}

              <div
                className="rounded-2xl p-5 text-white"
                style={{ backgroundColor: 'var(--site-primary)' }}
              >
                <h4 className="font-bold mb-2">Tax Benefits</h4>
                <p className="text-sm text-red-100 leading-relaxed">
                  FECT is registered under Section 80G. Donations are eligible for tax deduction. We provide 80G certificates on request.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
