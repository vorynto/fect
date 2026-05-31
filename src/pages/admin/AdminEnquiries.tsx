import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Mail, Phone, Eye, Trash2, CheckCheck, Download, Search } from 'lucide-react'
import type { ContactMessage } from '../../types'

export default function AdminEnquiries() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ContactMessage | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [search, setSearch] = useState('')

  const fetch = async () => {
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setMessages(data)
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const markRead = async (id: string) => {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id)
    setMessages(m => m.map(msg => msg.id === id ? { ...msg, is_read: true } : msg))
    if (selected?.id === id) setSelected(s => s ? { ...s, is_read: true } : s)
  }

  const markAllRead = async () => {
    await supabase.from('contact_messages').update({ is_read: true }).eq('is_read', false)
    setMessages(m => m.map(msg => ({ ...msg, is_read: true })))
  }

  const deleteMsg = async (id: string) => {
    if (!confirm('Delete this message?')) return
    await supabase.from('contact_messages').delete().eq('id', id)
    setMessages(m => m.filter(msg => msg.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const exportCsv = () => {
    const headers = 'Name,Email,Phone,Subject,Message,Date,Status\n'
    const rows = filtered.map(m =>
      `"${m.name}","${m.email}","${m.phone || ''}","${m.subject || ''}","${m.message.replace(/"/g, '""')}","${new Date(m.created_at).toLocaleDateString()}","${m.is_read ? 'Read' : 'Unread'}"`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    Object.assign(document.createElement('a'), { href: url, download: 'enquiries.csv' }).click()
  }

  const filtered = messages
    .filter(m => filter === 'all' || (filter === 'unread' ? !m.is_read : m.is_read))
    .filter(m => !search || [m.name, m.email, m.subject, m.message].some(f => f?.toLowerCase().includes(search.toLowerCase())))

  const unreadCount = messages.filter(m => !m.is_read).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
            Enquiries
            {unreadCount > 0 && (
              <span className="text-sm font-bold text-white px-2.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--site-primary)' }}>
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm">Contact form submissions from website visitors</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50">
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
          <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white text-sm font-semibold">
          {(['all', 'unread', 'read'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 capitalize transition-colors ${filter === f ? 'text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              style={filter === f ? { backgroundColor: 'var(--site-primary)' } : {}}
            >
              {f} {f === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search name, email, message..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm text-gray-800 bg-transparent"
          />
        </div>
        <span className="text-sm text-gray-400">{filtered.length} of {messages.length}</span>
      </div>

      <div className="flex gap-5" style={{ minHeight: '500px' }}>
        {/* Table */}
        <div className={`${selected ? 'hidden lg:block lg:w-[55%]' : 'w-full'} bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}>
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Mail size={40} className="mb-3 opacity-30" />
              <p className="text-sm">{search || filter !== 'all' ? 'No messages match your filter' : 'No enquiries yet'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-4" />
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sender</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Subject</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(msg => (
                    <tr
                      key={msg.id}
                      onClick={() => { setSelected(msg); markRead(msg.id) }}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${selected?.id === msg.id ? 'bg-red-50' : ''}`}
                    >
                      <td className="px-4 py-3.5">
                        <div className={`w-2 h-2 rounded-full ${msg.is_read ? 'bg-gray-200' : ''}`}
                          style={!msg.is_read ? { backgroundColor: 'var(--site-primary)' } : {}} />
                      </td>
                      <td className="px-4 py-3.5">
                        <p className={`font-semibold ${!msg.is_read ? 'text-gray-900' : 'text-gray-600'}`}>{msg.name}</p>
                        <p className="text-xs text-gray-400">{msg.email}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-gray-600 max-w-[180px]">
                        <p className="truncate">{msg.subject || '—'}</p>
                        <p className="text-xs text-gray-400 truncate">{msg.message}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-gray-400 whitespace-nowrap text-xs">
                        {new Date(msg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={e => { e.stopPropagation(); deleteMsg(msg.id) }}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-y-auto">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selected.name}</h3>
                <p className="text-sm text-gray-400">
                  {new Date(selected.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => deleteMsg(selected.id)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100">
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setSelected(null)} className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 text-xs font-bold">
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail size={15} className="text-gray-400 shrink-0" />
                <a href={`mailto:${selected.email}`} className="text-sm font-medium hover:underline" style={{ color: 'var(--site-primary)' }}>
                  {selected.email}
                </a>
              </div>
              {selected.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone size={15} className="text-gray-400 shrink-0" />
                  <a href={`tel:${selected.phone}`} className="text-sm font-medium">{selected.phone}</a>
                </div>
              )}
              {selected.subject && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-0.5">Subject</p>
                  <p className="text-sm font-semibold text-gray-800">{selected.subject}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Message</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
            </div>

            <div className="mt-5 flex gap-3">
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your enquiry to FECT'}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ backgroundColor: 'var(--site-primary)' }}
              >
                <Mail size={15} /> Reply via Email
              </a>
              {!selected.is_read && (
                <button
                  onClick={() => markRead(selected.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                >
                  <Eye size={15} /> Mark as Read
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
