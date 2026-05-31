import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Program } from '../../types'

const ICONS = ['GraduationCap','Heart','Home','Users','BookOpen','Star','Globe','Award']

const empty: Omit<Program, 'id'> = {
  title: '', description: '', icon: 'GraduationCap', sort_order: 0, is_active: true,
}

export default function AdminPrograms() {
  const [items, setItems] = useState<Program[]>([])
  const [editing, setEditing] = useState<Program | null>(null)
  const [form, setForm] = useState<Omit<Program, 'id'>>(empty)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    const { data } = await supabase.from('programs').select('*').order('sort_order')
    if (data) setItems(data)
  }

  useEffect(() => { fetch() }, [])

  const openEdit = (item: Program) => {
    setEditing(item)
    const { id: _id, ...rest } = item
    setForm(rest)
  }

  const openNew = () => {
    setEditing({ id: '__new__' } as Program)
    setForm({ ...empty, sort_order: items.length + 1 })
  }

  const handleSave = async () => {
    if (!form.title || !form.description) { toast.error('Title and description required'); return }
    setSaving(true)
    if (editing?.id === '__new__') {
      const { error } = await supabase.from('programs').insert([form])
      if (error) toast.error(error.message); else toast.success('Program added!')
    } else if (editing) {
      const { error } = await supabase.from('programs').update(form).eq('id', editing.id)
      if (error) toast.error(error.message); else toast.success('Updated!')
    }
    setSaving(false)
    setEditing(null)
    fetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this program?')) return
    await supabase.from('programs').delete().eq('id', id)
    toast.success('Deleted'); fetch()
  }

  const toggleActive = async (item: Program) => {
    await supabase.from('programs').update({ is_active: !item.is_active }).eq('id', item.id)
    fetch()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Programs / Services</h1>
          <p className="text-gray-500 text-sm">Manage the programs shown on the homepage and services page</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold" style={{ backgroundColor: 'var(--site-primary)' }}>
          <Plus size={16} /> Add Program
        </button>
      </div>

      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-4 items-center">
            <GripVertical size={18} className="text-gray-300 shrink-0" />
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0" style={{ backgroundColor: 'var(--site-primary)' }}>
              {item.sort_order}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-500 truncate">{item.description}</p>
              <span className="text-xs text-gray-400">Icon: {item.icon}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggleActive(item)} className={`p-2 rounded-lg ${item.is_active ? 'text-green-500 bg-green-50' : 'text-gray-400 bg-gray-50'}`}>
                {item.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button onClick={() => openEdit(item)} className="p-2 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100">
                <Pencil size={16} />
              </button>
              <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-red-500 bg-red-50 hover:bg-red-100">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">{editing.id === '__new__' ? 'Add Program' : 'Edit Program'}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Education Support" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800 resize-none" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Icon</label>
                  <select value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800 bg-white">
                    {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 rounded" />
                <span className="text-sm font-semibold text-gray-700">Active (visible on website)</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold disabled:opacity-60" style={{ backgroundColor: 'var(--site-primary)' }}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Program'}
              </button>
              <button onClick={() => setEditing(null)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
