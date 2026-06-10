import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Heart, Shield, CheckCircle, IndianRupee, QrCode,
  Phone, Mail, CreditCard, AlertCircle,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { usePageContent } from '../hooks/usePageContent'
import { useSettings } from '../contexts/SettingsContext'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void }
    loadBillDeskSdk: (flowType: string, config: BillDeskConfig) => void
  }
}

interface RazorpayOptions {
  key: string; amount: number; currency: string; name: string; description: string
  order_id?: string
  handler: (r: RazorpayResponse) => void
  prefill: { name: string; email: string; contact: string }
  theme: { color: string }
  modal: { ondismiss: () => void }
}
interface RazorpayResponse {
  razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature?: string
}
interface BillDeskConfig {
  responseHandler: (txn: BillDeskTxn) => void
  flowConfig: {
    merchantId: string; bdOrderId: string; authToken: string
    childWindow: boolean; retryCount: number
    prefs: { payment_categories: string[] }
  }
  flowType: string
}
interface BillDeskTxn {
  txnResponse?: { txnStatus?: string; transactionId?: string; bdOrderId?: string }
}

type GatewayKey = 'razorpay' | 'billdesk' | 'qr'

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000]
const ENV_RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || ''

const GATEWAY_META: Record<GatewayKey, { label: string; desc: string; color: string; Icon: React.ElementType }> = {
  razorpay: { label: 'Razorpay',  desc: 'Cards · UPI · Net Banking · Wallets',      color: '#3395ff', Icon: CreditCard },
  billdesk: { label: 'BillDesk',  desc: 'Cards · UPI · Net Banking',                color: '#e65c00', Icon: CreditCard },
  qr:       { label: 'Scan QR',   desc: 'UPI QR Code — pay with any UPI app',       color: '#27ae60', Icon: QrCode     },
}

const DEFAULT_TIERS = [
  { amount: '₹500/month',  name: 'Educate a Child',   desc: 'Covers school fees, books, and uniform for one child throughout the academic year.' },
  { amount: '₹2,000',      name: 'Medical Emergency', desc: 'Contributes to treatment costs for a cancer patient or medical emergency case.' },
  { amount: '₹1,000/month',name: 'Elderly Care',      desc: 'Supports one elderly person in a care home with essentials and regular visits.' },
  { amount: '₹300',        name: 'School Kit',         desc: 'Provides a complete school kit with stationery and learning materials for one child.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseGateways(raw: string | undefined): GatewayKey[] {
  if (!raw) return []
  return raw.split(',')
    .map(s => s.trim())
    .filter((s): s is GatewayKey => ['razorpay', 'billdesk', 'qr'].includes(s))
}

function loadScript(src: string): Promise<boolean> {
  return new Promise(resolve => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(true); return }
    const s = document.createElement('script')
    s.src = src; s.onload = () => resolve(true); s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

function loadModuleScript(src: string): Promise<boolean> {
  return new Promise(resolve => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(true); return }
    const s = document.createElement('script')
    s.src = src; s.type = 'module'; s.onload = () => resolve(true); s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Donate() {
  const { getTitle, get, getImage } = usePageContent('donate')
  const { settings } = useSettings()

  const enabledGateways = parseGateways(settings.payment_gateway)
  const razorpayKey = settings.razorpay_key_id?.trim() || ENV_RAZORPAY_KEY

  // Shared state
  const [amount, setAmount] = useState<number>(1000)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [selectedGw, setSelectedGw] = useState<GatewayKey | null>(null)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [paymentId, setPaymentId] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // QR-specific
  const [qrStep, setQrStep] = useState(false)
  const [utr, setUtr] = useState('')

  const finalAmount = isCustom ? parseInt(customAmount) || 0 : amount

  // Auto-select gateway when list changes
  useEffect(() => {
    if (enabledGateways.length > 0) setSelectedGw(prev => prev && enabledGateways.includes(prev) ? prev : enabledGateways[0])
    else setSelectedGw(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.payment_gateway])

  // ── Razorpay ────────────────────────────────────────────────────────────────
  const handleRazorpay = async () => {
    if (!razorpayKey) {
      toast.error('Razorpay is not configured. Please contact us to donate.')
      setProcessing(false); return
    }
    const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js')
    if (!loaded) { toast.error('Could not load payment gateway. Try again.'); setProcessing(false); return }
    new window.Razorpay({
      key: razorpayKey,
      amount: finalAmount * 100,
      currency: 'INR',
      name: 'FECT - Friends Educational & Charitable Trust',
      description: 'Donation to support underprivileged communities',
      handler: async (response) => {
        await supabase.from('donations').insert([{
          name: form.name, email: form.email, phone: form.phone, amount: finalAmount,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id || '',
          status: 'success',
        }])
        setPaymentId(response.razorpay_payment_id)
        setSuccessMsg('Your payment has been received. Thank you for your generous contribution!')
        setSuccess(true); setProcessing(false)
      },
      prefill: { name: form.name, email: form.email, contact: form.phone },
      theme: { color: getComputedStyle(document.documentElement).getPropertyValue('--site-primary').trim() || '#c0392b' },
      modal: { ondismiss: () => setProcessing(false) },
    }).open()
  }

  // ── BillDesk ─────────────────────────────────────────────────────────────────
  const handleBilldesk = async () => {
    const sdkUrl = (settings.billdesk_env || 'production') === 'uat'
      ? 'https://uat1.billdesk.com/merchant-uat/sdk/dist/billdesksdk/billdesksdk.esm.js'
      : 'https://pay.billdesk.com/web/merchantd/sdk/dist/billdesksdk/billdesksdk.esm.js'
    try {
      const { data, error } = await supabase.functions.invoke('billdesk-create-order', {
        body: { amount: finalAmount, name: form.name, email: form.email, phone: form.phone,
                merchantId: settings.billdesk_merchant_id, env: settings.billdesk_env || 'production' },
      })
      if (error || !data?.bdOrderId)
        throw new Error(error?.message || 'Order creation failed. Check the billdesk-create-order Edge Function.')
      const loaded = await loadModuleScript(sdkUrl)
      if (!loaded || !window.loadBillDeskSdk)
        throw new Error('Failed to load BillDesk SDK. Check your network connection.')
      window.loadBillDeskSdk('payments', {
        responseHandler: async (txn) => {
          const resp = txn.txnResponse
          if (resp?.txnStatus === 'COMPLETE') {
            await supabase.from('donations').insert([{
              name: form.name, email: form.email, phone: form.phone, amount: finalAmount,
              razorpay_payment_id: resp.transactionId || resp.bdOrderId || '',
              razorpay_order_id: resp.bdOrderId || '',
              status: 'success',
            }])
            setPaymentId(resp.transactionId || resp.bdOrderId || '')
            setSuccessMsg('Your BillDesk payment has been received. Thank you!')
            setSuccess(true)
          } else {
            toast.error('Payment not completed. Please try again.')
          }
          setProcessing(false)
        },
        flowConfig: {
          merchantId: settings.billdesk_merchant_id || '',
          bdOrderId: data.bdOrderId, authToken: data.authToken,
          childWindow: false, retryCount: 0,
          prefs: { payment_categories: ['card', 'emi', 'nb', 'upi', 'wallets', 'qr'] },
        },
        flowType: 'payments',
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payment failed. Please try again.')
      setProcessing(false)
    }
  }

  // ── QR confirm ───────────────────────────────────────────────────────────────
  const handleQrConfirm = async () => {
    if (!utr.trim()) { toast.error('Please enter the UTR / Transaction Reference Number'); return }
    setProcessing(true)
    const { error } = await supabase.from('donations').insert([{
      name: form.name, email: form.email, phone: form.phone, amount: finalAmount,
      razorpay_payment_id: utr.trim(), razorpay_order_id: 'qr', status: 'qr_pending',
    }])
    setProcessing(false)
    if (error) { toast.error('Could not save record. Please contact us.'); return }
    setPaymentId(utr.trim())
    setSuccessMsg("We've noted your payment reference. Our team will verify it within 24 hours and send you a confirmation.")
    setSuccess(true)
  }

  // ── Submit dispatcher ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) { toast.error('Please enter your name and email'); return }
    if (finalAmount < 100) { toast.error('Minimum donation is ₹100'); return }
    if (!selectedGw) { toast.error('Please choose a payment method'); return }
    setProcessing(true)
    if (selectedGw === 'razorpay') await handleRazorpay()
    else if (selectedGw === 'billdesk') await handleBilldesk()
    else if (selectedGw === 'qr') { setProcessing(false); setQrStep(true) }
  }

  const resetAll = () => {
    setSuccess(false); setQrStep(false); setUtr(''); setPaymentId(''); setSuccessMsg('')
    setForm({ name: '', email: '', phone: '' })
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-20">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-12 shadow-xl text-center max-w-md w-full"
        >
          <CheckCircle size={80} className="mx-auto mb-6" style={{ color: 'var(--site-primary)' }} />
          <h2 className="text-3xl font-extrabold mb-3" style={{ color: 'var(--site-heading-color)' }}>
            Thank You, {form.name}!
          </h2>
          <p className="text-gray-600 mb-3">
            Donation of <strong>₹{finalAmount.toLocaleString('en-IN')}</strong> recorded.
          </p>
          {successMsg && <p className="text-sm text-gray-500 mb-4 leading-relaxed">{successMsg}</p>}
          {paymentId && <p className="text-xs text-gray-400 mb-8 font-mono">Ref: {paymentId}</p>}
          <button onClick={resetAll} className="px-8 py-3 rounded-xl text-white font-semibold" style={{ backgroundColor: 'var(--site-primary)' }}>
            Donate Again
          </button>
        </motion.div>
      </div>
    )
  }

  // ── QR step ──────────────────────────────────────────────────────────────────
  if (qrStep) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full"
        >
          <div className="text-center mb-6">
            <QrCode size={34} className="mx-auto mb-3" style={{ color: '#27ae60' }} />
            <h2 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--site-heading-color)' }}>Scan & Pay</h2>
            <p className="text-gray-500 text-sm">Open any UPI app, scan the QR, and complete your payment</p>
          </div>
          <div className="rounded-2xl px-6 py-4 text-center text-white mb-6" style={{ backgroundColor: 'var(--site-primary)' }}>
            <p className="text-sm opacity-90 mb-0.5">Donation Amount</p>
            <p className="text-4xl font-extrabold">₹{finalAmount.toLocaleString('en-IN')}</p>
            <p className="text-sm opacity-80 mt-1">for {form.name}</p>
          </div>
          <div className="flex justify-center mb-6">
            {settings.donation_qr_url ? (
              <div className="border-2 border-gray-200 rounded-2xl p-3 bg-white shadow-sm">
                <img src={settings.donation_qr_url} alt="Donation QR Code" className="w-56 h-56 object-contain" />
              </div>
            ) : (
              <div className="w-56 h-56 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 text-sm">
                <QrCode size={40} className="mb-2 opacity-30" /> QR not configured
              </div>
            )}
          </div>
          <p className="text-center text-xs text-gray-500 mb-5 leading-relaxed">
            After paying, enter the <strong>UTR / Transaction Reference</strong> shown in your UPI app below.
          </p>
          <input
            type="text" value={utr} onChange={e => setUtr(e.target.value)}
            placeholder="UTR / Transaction Reference No."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-800 mb-4"
          />
          <button
            onClick={handleQrConfirm}
            disabled={processing || !utr.trim()}
            className="w-full py-3.5 rounded-xl text-white font-bold disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--site-primary)' }}
          >
            {processing
              ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              : <><CheckCircle size={18} /> Confirm Donation</>}
          </button>
          <button onClick={() => setQrStep(false)} className="w-full mt-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
            Back
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Main page ────────────────────────────────────────────────────────────────
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

            {/* ── Donation form ── */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3">
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
                        key={a} type="button"
                        onClick={() => { setAmount(a); setIsCustom(false) }}
                        className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${!isCustom && amount === a ? 'text-white border-transparent' : 'border-gray-200 text-gray-700 hover:border-(--site-primary)'}`}
                        style={!isCustom && amount === a ? { backgroundColor: 'var(--site-primary)', borderColor: 'var(--site-primary)' } : {}}
                      >
                        ₹{a.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button" onClick={() => setIsCustom(true)}
                      className={`shrink-0 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${isCustom ? 'text-white border-transparent' : 'border-gray-200 text-gray-700'}`}
                      style={isCustom ? { backgroundColor: 'var(--site-primary)' } : {}}
                    >
                      Custom
                    </button>
                    {isCustom && (
                      <div className="flex-1 flex items-center gap-2 border-2 border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-(--site-primary)">
                        <IndianRupee size={16} className="text-gray-400" />
                        <input type="number" value={customAmount} onChange={e => setCustomAmount(e.target.value)}
                          placeholder="Enter amount" min="100"
                          className="flex-1 outline-none text-gray-800 text-sm" autoFocus />
                      </div>
                    )}
                  </div>
                </div>

                {enabledGateways.length === 0 ? (
                  /* No gateways enabled */
                  <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center space-y-4">
                    <AlertCircle size={36} className="mx-auto text-gray-400" />
                    <p className="text-gray-600 font-medium">Online payments are temporarily unavailable.</p>
                    <p className="text-sm text-gray-500">Please reach out to us directly to make your donation.</p>
                    <div className="flex flex-col gap-2 items-center text-sm font-medium" style={{ color: 'var(--site-primary)' }}>
                      {settings.phone && <a href={`tel:${settings.phone}`} className="flex items-center gap-2"><Phone size={15} /> {settings.phone}</a>}
                      {settings.email && <a href={`mailto:${settings.email}`} className="flex items-center gap-2"><Mail size={15} /> {settings.email}</a>}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {/* Donor details */}
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Details</h3>
                    <div className="space-y-4 mb-7">
                      <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Full Name *"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-800" required />
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="Email Address *"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-800" required />
                      <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="Phone Number"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-gray-800" />
                    </div>

                    {/* Payment method selector */}
                    {enabledGateways.length > 1 && (
                      <div className="mb-6">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Choose Payment Method</p>
                        <div className={`grid gap-3 ${enabledGateways.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                          <AnimatePresence>
                            {enabledGateways.map(gw => {
                              const meta = GATEWAY_META[gw]
                              const Icon = meta.Icon
                              const active = selectedGw === gw
                              return (
                                <motion.button
                                  key={gw}
                                  type="button"
                                  onClick={() => setSelectedGw(gw)}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all ${
                                    active ? 'border-transparent shadow-lg text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-gray-50'
                                  }`}
                                  style={active ? { backgroundColor: meta.color, borderColor: meta.color } : {}}
                                >
                                  <Icon size={24} />
                                  <div>
                                    <p className="font-bold text-sm leading-tight">{meta.label}</p>
                                    <p className={`text-xs mt-0.5 leading-tight ${active ? 'opacity-80' : 'text-gray-400'}`}>{meta.desc}</p>
                                  </div>
                                </motion.button>
                              )
                            })}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {/* Total + CTA */}
                    <div className="rounded-xl p-4 mb-6 bg-gray-50 border border-gray-100 flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Total Donation</span>
                      <span className="text-2xl font-extrabold" style={{ color: 'var(--site-primary)' }}>
                        ₹{finalAmount > 0 ? finalAmount.toLocaleString('en-IN') : '0'}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={processing || finalAmount < 100 || !selectedGw}
                      className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-white font-bold text-lg transition-all hover:-translate-y-0.5 disabled:opacity-60"
                      style={selectedGw ? { backgroundColor: GATEWAY_META[selectedGw].color } : { backgroundColor: 'var(--site-primary)' }}
                    >
                      {processing
                        ? <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        : selectedGw === 'qr'
                          ? <><QrCode size={22} /> Pay ₹{finalAmount > 0 ? finalAmount.toLocaleString('en-IN') : ''} via QR</>
                          : <><Heart size={22} /> Donate ₹{finalAmount > 0 ? finalAmount.toLocaleString('en-IN') : ''} Now</>
                      }
                    </button>

                    <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                      {selectedGw === 'qr'
                        ? <><QrCode size={12} /> Scan QR on the next screen. 80G tax exemption available.</>
                        : <><Shield size={12} /> Secure payment via {selectedGw ? GATEWAY_META[selectedGw].label : 'gateway'}. 80G tax exemption available.</>
                      }
                    </p>
                  </form>
                )}
              </div>
            </motion.div>

            {/* ── Sidebar ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* QR preview in sidebar when QR is one of the options */}
              {enabledGateways.includes('qr') && settings.donation_qr_url && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Scan to Pay</p>
                  <img src={settings.donation_qr_url} alt="Donation QR" className="w-44 h-44 object-contain mx-auto" />
                  <p className="text-xs text-gray-400 mt-3">
                    {enabledGateways.length > 1 ? 'Select "Scan QR" and click Pay for step-by-step instructions' : 'Fill the form and click Pay via QR for full instructions'}
                  </p>
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
