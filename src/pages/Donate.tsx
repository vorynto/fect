import { motion } from 'framer-motion'
import { useState } from 'react'
import { Heart, Shield, CheckCircle, IndianRupee, QrCode, Phone, Mail, CreditCard, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { usePageContent } from '../hooks/usePageContent'
import { useSettings } from '../contexts/SettingsContext'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void }
    loadBillDeskSdk: (flowType: string, config: BillDeskConfig) => void
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

interface BillDeskConfig {
  responseHandler: (txn: BillDeskTxn) => void
  flowConfig: {
    merchantId: string
    bdOrderId: string
    authToken: string
    childWindow: boolean
    retryCount: number
    prefs: { payment_categories: string[] }
  }
  flowType: string
}

interface BillDeskTxn {
  txnResponse?: {
    txnStatus?: string
    transactionId?: string
    bdOrderId?: string
  }
}

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000]
const ENV_RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || ''

const DEFAULT_TIERS = [
  { amount: '₹500/month', name: 'Educate a Child',    desc: 'Covers school fees, books, and uniform for one child throughout the academic year.' },
  { amount: '₹2,000',     name: 'Medical Emergency',  desc: 'Contributes to treatment costs for a cancer patient or medical emergency case.' },
  { amount: '₹1,000/month',name: 'Elderly Care',      desc: 'Supports one elderly person in a care home with essentials and regular visits.' },
  { amount: '₹300',       name: 'School Kit',          desc: 'Provides a complete school kit with stationery and learning materials for one child.' },
]

function loadScript(src: string): Promise<boolean> {
  return new Promise(resolve => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) { resolve(true); return }
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

function loadModuleScript(src: string): Promise<boolean> {
  return new Promise(resolve => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) { resolve(true); return }
    const s = document.createElement('script')
    s.src = src
    s.type = 'module'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

export default function Donate() {
  const { getTitle, get, getImage } = usePageContent('donate')
  const { settings } = useSettings()

  const gw = (settings.payment_gateway || 'razorpay') as 'razorpay' | 'billdesk' | 'qr' | 'none'
  const razorpayKey = settings.razorpay_key_id?.trim() || ENV_RAZORPAY_KEY

  const [amount, setAmount] = useState<number>(1000)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [paymentId, setPaymentId] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // QR-specific
  const [qrStep, setQrStep] = useState(false)
  const [utr, setUtr] = useState('')

  const finalAmount = isCustom ? parseInt(customAmount) || 0 : amount

  // ─── Razorpay ───────────────────────────────────────────────────────────────
  const handleRazorpay = async () => {
    if (!razorpayKey) {
      toast.error('Payment gateway is not configured. Please contact us to donate.')
      setProcessing(false)
      return
    }
    const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js')
    if (!loaded) {
      toast.error('Failed to load payment gateway. Please try again.')
      setProcessing(false)
      return
    }
    const options: RazorpayOptions = {
      key: razorpayKey,
      amount: finalAmount * 100,
      currency: 'INR',
      name: 'FECT - Friends Educational & Charitable Trust',
      description: 'Donation to support underprivileged communities',
      handler: async (response: RazorpayResponse) => {
        await supabase.from('donations').insert([{
          name: form.name, email: form.email, phone: form.phone,
          amount: finalAmount,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id || '',
          status: 'success',
        }])
        setPaymentId(response.razorpay_payment_id)
        setSuccessMsg('Your payment has been received. Thank you for your generous contribution!')
        setSuccess(true)
        setProcessing(false)
      },
      prefill: { name: form.name, email: form.email, contact: form.phone },
      theme: { color: getComputedStyle(document.documentElement).getPropertyValue('--site-primary').trim() || '#c0392b' },
      modal: { ondismiss: () => setProcessing(false) },
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  // ─── BillDesk ────────────────────────────────────────────────────────────────
  const handleBilldesk = async () => {
    const sdkUrl = (settings.billdesk_env || 'production') === 'uat'
      ? 'https://uat1.billdesk.com/merchant-uat/sdk/dist/billdesksdk/billdesksdk.esm.js'
      : 'https://pay.billdesk.com/web/merchantd/sdk/dist/billdesksdk/billdesksdk.esm.js'

    try {
      const { data, error } = await supabase.functions.invoke('billdesk-create-order', {
        body: {
          amount: finalAmount,
          name: form.name,
          email: form.email,
          phone: form.phone,
          merchantId: settings.billdesk_merchant_id,
          env: settings.billdesk_env || 'production',
        },
      })
      if (error || !data?.bdOrderId) {
        throw new Error(
          error?.message ||
          'Could not create order. Ensure the billdesk-create-order Supabase Edge Function is deployed.'
        )
      }

      const loaded = await loadModuleScript(sdkUrl)
      if (!loaded || !window.loadBillDeskSdk) {
        throw new Error('Failed to load BillDesk payment SDK. Check your network connection.')
      }

      window.loadBillDeskSdk('payments', {
        responseHandler: async (txn: BillDeskTxn) => {
          const resp = txn.txnResponse
          if (resp?.txnStatus === 'COMPLETE') {
            await supabase.from('donations').insert([{
              name: form.name, email: form.email, phone: form.phone,
              amount: finalAmount,
              razorpay_payment_id: resp.transactionId || resp.bdOrderId || '',
              razorpay_order_id: resp.bdOrderId || '',
              status: 'success',
            }])
            setPaymentId(resp.transactionId || resp.bdOrderId || '')
            setSuccessMsg('Your payment via BillDesk has been received. Thank you!')
            setSuccess(true)
          } else {
            toast.error('Payment was not completed. Please try again.')
          }
          setProcessing(false)
        },
        flowConfig: {
          merchantId: settings.billdesk_merchant_id || '',
          bdOrderId: data.bdOrderId,
          authToken: data.authToken,
          childWindow: false,
          retryCount: 0,
          prefs: {
            payment_categories: ['card', 'emi', 'nb', 'upi', 'wallets', 'qr'],
          },
        },
        flowType: 'payments',
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment failed. Please try again.'
      toast.error(msg)
      setProcessing(false)
    }
  }

  // ─── QR confirm ──────────────────────────────────────────────────────────────
  const handleQrConfirm = async () => {
    if (!utr.trim()) { toast.error('Please enter your UTR / Transaction Reference Number'); return }
    setProcessing(true)
    const { error } = await supabase.from('donations').insert([{
      name: form.name, email: form.email, phone: form.phone,
      amount: finalAmount,
      razorpay_payment_id: utr.trim(),
      razorpay_order_id: 'qr',
      status: 'qr_pending',
    }])
    setProcessing(false)
    if (error) { toast.error('Could not save your record. Please contact us.'); return }
    setPaymentId(utr.trim())
    setSuccessMsg("We've noted your payment. Our team will verify it within 24 hours and send a confirmation to your email.")
    setSuccess(true)
  }

  // ─── Form submit dispatcher ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) { toast.error('Please enter your name and email'); return }
    if (finalAmount < 100) { toast.error('Minimum donation amount is ₹100'); return }
    setProcessing(true)
    if (gw === 'razorpay') await handleRazorpay()
    else if (gw === 'billdesk') await handleBilldesk()
    else if (gw === 'qr') { setProcessing(false); setQrStep(true) }
  }

  // ─── Success screen ──────────────────────────────────────────────────────────
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
            Your donation of <strong>₹{finalAmount.toLocaleString('en-IN')}</strong> is recorded.
          </p>
          {successMsg && <p className="text-sm text-gray-500 mb-4 leading-relaxed">{successMsg}</p>}
          {paymentId && <p className="text-xs text-gray-400 mb-8">Ref: {paymentId}</p>}
          <button
            onClick={() => {
              setSuccess(false)
              setQrStep(false)
              setUtr('')
              setForm({ name: '', email: '', phone: '' })
            }}
            className="px-8 py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: 'var(--site-primary)' }}
          >
            Donate Again
          </button>
        </motion.div>
      </div>
    )
  }

  // ─── QR step: show QR image + UTR input ─────────────────────────────────────
  if (qrStep) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full"
        >
          <div className="text-center mb-6">
            <QrCode size={32} className="mx-auto mb-3" style={{ color: 'var(--site-primary)' }} />
            <h2 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--site-heading-color)' }}>Scan & Pay</h2>
            <p className="text-gray-500 text-sm">Scan the QR code with any UPI app to complete your donation</p>
          </div>

          {/* Amount badge */}
          <div
            className="rounded-2xl px-6 py-4 text-center text-white mb-6"
            style={{ backgroundColor: 'var(--site-primary)' }}
          >
            <p className="text-sm opacity-90 mb-0.5">Donation Amount</p>
            <p className="text-4xl font-extrabold">₹{finalAmount.toLocaleString('en-IN')}</p>
            <p className="text-sm opacity-80 mt-1">for {form.name}</p>
          </div>

          {/* QR Image */}
          {settings.donation_qr_url ? (
            <div className="flex justify-center mb-6">
              <div className="border-2 border-gray-200 rounded-2xl p-3 bg-white inline-block shadow-sm">
                <img
                  src={settings.donation_qr_url}
                  alt="Donation QR Code"
                  className="w-56 h-56 object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-6">
              <div className="w-56 h-56 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 text-sm">
                <QrCode size={36} className="mb-2 opacity-40" />
                QR not configured yet
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-500 mb-6 leading-relaxed">
            After payment, enter the <strong>UTR / Transaction Reference Number</strong> from your UPI app below.
          </p>

          {/* UTR input */}
          <input
            type="text"
            value={utr}
            onChange={e => setUtr(e.target.value)}
            placeholder="UTR / Transaction Reference No."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-800 mb-4"
          />

          <button
            onClick={handleQrConfirm}
            disabled={processing || !utr.trim()}
            className="w-full py-3.5 rounded-xl text-white font-bold disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--site-primary)' }}
          >
            {processing ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <>
              <CheckCircle size={18} /> Confirm Donation
            </>}
          </button>

          <button
            onClick={() => setQrStep(false)}
            className="w-full mt-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
          >
            Back
          </button>
        </motion.div>
      </div>
    )
  }

  // ─── Main donate page ────────────────────────────────────────────────────────
  return (
    <div>
      {/* Hero */}
      <section
        className="py-28 relative bg-cover bg-center"
        style={getImage('hero')
          ? { backgroundImage: `url(${getImage('hero')})` }
          : { background: 'linear-gradient(135deg, var(--site-heading-color) 0%, #2d3748 100%)' }}
      >
        {getImage('hero') && <div className="absolute inset-0 bg-black/60" />}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
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
                            : 'border-gray-200 text-gray-700 hover:border-(--site-primary)'
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
                      className={`shrink-0 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                        isCustom ? 'text-white border-transparent' : 'border-gray-200 text-gray-700'
                      }`}
                      style={isCustom ? { backgroundColor: 'var(--site-primary)' } : {}}
                    >
                      Custom
                    </button>
                    {isCustom && (
                      <div className="flex-1 flex items-center gap-2 border-2 border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-(--site-primary)">
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

                {/* Donor details + submit */}
                {gw === 'none' ? (
                  <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center space-y-4">
                    <AlertCircle size={36} className="mx-auto text-gray-400" />
                    <p className="text-gray-600 font-medium">Online payments are temporarily unavailable.</p>
                    <p className="text-sm text-gray-500">Please reach out to us directly to make your donation.</p>
                    <div className="flex flex-col gap-2 items-center text-sm font-medium" style={{ color: 'var(--site-primary)' }}>
                      {settings.phone && (
                        <a href={`tel:${settings.phone}`} className="flex items-center gap-2">
                          <Phone size={15} /> {settings.phone}
                        </a>
                      )}
                      {settings.email && (
                        <a href={`mailto:${settings.email}`} className="flex items-center gap-2">
                          <Mail size={15} /> {settings.email}
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Details</h3>
                    <div className="space-y-4 mb-7">
                      <input
                        type="text" value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Full Name *"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-800"
                        required
                      />
                      <input
                        type="email" value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="Email Address *"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-800"
                        required
                      />
                      <input
                        type="tel" value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="Phone Number"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-800"
                      />
                    </div>

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
                      ) : gw === 'qr' ? (
                        <><QrCode size={22} /> Pay ₹{finalAmount > 0 ? finalAmount.toLocaleString('en-IN') : ''} via QR</>
                      ) : (
                        <><Heart size={22} /> Donate ₹{finalAmount > 0 ? finalAmount.toLocaleString('en-IN') : ''} Now</>
                      )}
                    </button>

                    <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                      {gw === 'razorpay' && <><Shield size={12} /> Secure payment via Razorpay. 80G tax exemption available.</>}
                      {gw === 'billdesk' && <><CreditCard size={12} /> Secure payment via BillDesk. 80G tax exemption available.</>}
                      {gw === 'qr' && <><QrCode size={12} /> Scan the QR on the next step. 80G tax exemption available.</>}
                    </p>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* QR preview on sidebar if QR mode */}
              {gw === 'qr' && settings.donation_qr_url && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Scan to Pay</p>
                  <img src={settings.donation_qr_url} alt="Donation QR" className="w-48 h-48 object-contain mx-auto" />
                  <p className="text-xs text-gray-400 mt-3">Fill the form and click "Pay via QR" for step-by-step instructions</p>
                </div>
              )}

              {DEFAULT_TIERS.map((d, i) => {
                const raw = get(`tier_${i + 1}`, `${d.name}|${d.desc}`)
                const [namePart, descPart] = raw.includes('|') ? raw.split('|') : [d.name, raw]
                const card = { title: namePart, amount: getTitle(`tier_${i + 1}`, d.amount), desc: descPart }
                return (
                  <div key={card.title} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold" style={{ color: 'var(--site-heading-color)' }}>{card.title}</h4>
                      <span className="text-sm font-bold" style={{ color: 'var(--site-primary)' }}>{card.amount}</span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                  </div>
                )
              })}

              <div className="rounded-2xl p-5 text-white" style={{ backgroundColor: 'var(--site-primary)' }}>
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
