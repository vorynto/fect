import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { IndianRupee, Download } from 'lucide-react'
import type { Donation } from '../../types'

export default function AdminDonations() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setDonations(data)
          setTotal(data.filter(d => d.status === 'success').reduce((sum, d) => sum + d.amount, 0))
        }
        setLoading(false)
      })
  }, [])

  const exportCsv = () => {
    const headers = 'Name,Email,Phone,Amount,Status,Payment ID,Date\n'
    const rows = donations.map(d =>
      `"${d.name}","${d.email}","${d.phone}",${d.amount},"${d.status}","${d.razorpay_payment_id}","${new Date(d.created_at).toLocaleDateString()}"`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'donations.csv'; a.click()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Donations</h1>
          <p className="text-gray-500 text-sm">Track all Razorpay donation transactions</p>
        </div>
        <button onClick={exportCsv} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Total Received', value: `₹${total.toLocaleString('en-IN')}`, color: 'var(--site-primary)' },
          { label: 'Total Donations', value: donations.filter(d => d.status === 'success').length.toString(), color: '#2980b9' },
          { label: 'Pending', value: donations.filter(d => d.status !== 'success').length.toString(), color: '#e67e22' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Donor', 'Email', 'Phone', 'Amount', 'Status', 'Payment ID', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <IndianRupee size={32} className="mx-auto mb-2 opacity-30" />
                    No donations yet
                  </td>
                </tr>
              ) : (
                donations.map(d => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">{d.name}</td>
                    <td className="px-4 py-3 text-gray-600">{d.email}</td>
                    <td className="px-4 py-3 text-gray-600">{d.phone || '—'}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: 'var(--site-primary)' }}>
                      ₹{d.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        d.status === 'success' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{d.razorpay_payment_id || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(d.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
