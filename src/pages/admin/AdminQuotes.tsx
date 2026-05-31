import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import type { TopBarQuote } from '../../types'

const empty: Omit<TopBarQuote, 'id'> = { quote_text: '', is_active: true, sort_order: 0 }

export default function AdminQuotes() {
  const [items, setItems] = useState<TopBarQuote[]>([])
  const [editing, setEditing] = useState<TopBarQuote | null>(null)
  const [form, setForm] = useState<Omit<TopBarQuote, 'id'>>(empty)
  const [saving, setSaving] = useState(false)
  const [inlineEdit, setInlineEdit] = useState<string | null>(null)

  const fetch = async () => {
    const { data } = await supabase.from('top_bar_quotes').select('*').order('sort_order')
    if (data) setItems(data)
  }

  useEffect(() => { fetch() }, [])

  const openEdit = (item: TopBarQuote) => {
    setEditing(item)
    const { id: _id, ...rest } = item
    setForm(rest)
  }

  const openNew = () => {
    setEditing({ id: '__new__' } as TopBarQuote)
    setForm({ ...empty, sort_order: items.length + 1 })
  }

  const handleSave = async () => {
    if (!form.quote_text.trim()) { toast.error('Quote text is required'); return }
    setSaving(true)
    if (editing?.id === '__new__') {
      const { error } = await supabase.from('top_bar_quotes').insert([form])
      if (error) toast.error(error.message); else toast.success('Quote added!')
    } else if (editing) {
      const { error } = await supabase.from('top_bar_quotes').update(form).eq('id', editing.id)
      if (error) toast.error(error.message); else toast.success('Updated!')
    }
    setSaving(false); setEditing(null); fetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this quote?')) return
    await supabase.from('top_bar_quotes').delete().eq('id', id)
    toast.success('Deleted'); fetch()
  }

  const toggleActive = async (item: TopBarQuote) => {
    await supabase.from('top_bar_quotes').update({ is_active: !item.is_active }).eq('id', item.id)
    fetch()
  }

  const saveInline = async (item: TopBarQuote, text: string) => {
    await supabase.from('top_bar_quotes').update({ quote_text: text }).eq('id', item.id)
    setInlineEdit(null); fetch(); toast.success('Saved!')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Top Bar Quotes</h1>
          <p className="text-gray-500 text-sm">Rotating donation quotes shown in the top banner</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold" style={{ backgroundColor: 'var(--site-primary)' }}>
          <Plus size={16} /> Add Quote
        </button>
      </div>

      {/* Live preview */}
      <div className="mb-6 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 flex items-center justify-between text-white text-xs font-medium" style={{ backgroundColor: 'var(--site-primary)' }}>
          <span>Reg No: TN-09/184, dt 06.02.2009</span>
          <span>✦ {items[0]?.quote_text || 'Your quotes appear here and rotate automatically'} ✦</span>
          <span className="flex gap-2 items-center">f ▶ ig</span>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-3 items-center group">
            <GripVertical size={16} className="text-gray-300 shrink-0" />
            <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--site-primary)' }}>
              {i + 1}
            </span>

            {/* Inline edit */}
            {inlineEdit === item.id ? (
              <input
                autoFocus
                defaultValue={item.quote_text}
                onBlur={e => saveInline(item, e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveInline(item, (e.target as HTMLInputElement).value) }}
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none text-gray-800 text-sm"
              />
            ) : (
              <p
                className="flex-1 text-sm text-gray-700 cursor-text hover:text-gray-900 italic"
                onClick={() => setInlineEdit(item.id)}
                title="Click to edit inline"
              >
                "{item.quote_text}"
              </p>
            )}

            <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => toggleActive(item)} className={`p-1.5 rounded-lg ${item.is_active ? 'text-green-500 bg-green-50' : 'text-gray-400 bg-gray-50'}`} title={item.is_active ? 'Active' : 'Hidden'}>
                {item.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-red-500 bg-red-50 hover:bg-red-100">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm mb-3">No quotes yet</p>
            <button onClick={openNew} className="text-sm font-medium" style={{ color: 'var(--site-primary)' }}>
              + Add your first quote
            </button>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-400">💡 Click any quote text to edit it inline. Quotes rotate every 4.5 seconds on the live site.</p>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">{editing.id === '__new__' ? 'Add Quote' : 'Edit Quote'}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quote Text *</label>
                <textarea
                  value={form.quote_text}
                  onChange={e => setForm(f => ({ ...f, quote_text: e.target.value }))}
                  rows={3}
                  placeholder="Your donation today can put a child through school tomorrow"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800 resize-none"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800" />
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 rounded" />
                    <span className="text-sm font-semibold text-gray-700">Active (show on site)</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold disabled:opacity-60" style={{ backgroundColor: 'var(--site-primary)' }}>
                <Save size={16} /> {saving ? 'Saving…' : 'Save Quote'}
              </button>
              <button onClick={() => setEditing(null)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
