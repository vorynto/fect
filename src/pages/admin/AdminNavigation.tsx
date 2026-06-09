import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff, Link as LinkIcon, Star, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import type { NavItem } from '../../types'

const empty: Omit<NavItem, 'id' | 'children'> = {
  label: '', path: '', parent_id: null, sort_order: 0, is_active: true, is_button: false, open_in_new: false,
}

const DEFAULT_PARENTS = [
  { label: 'Home',            path: '/',                sort_order: 1, is_button: false },
  { label: 'Our Story',       path: '/our-story',       sort_order: 2, is_button: false },
  { label: 'What You Can Do', path: '/what-you-can-do', sort_order: 3, is_button: false },
  { label: 'Gallery',         path: '/gallery',         sort_order: 4, is_button: false },
  { label: 'Testimonials',    path: '/testimonials',    sort_order: 5, is_button: false },
  { label: 'Contact',         path: '/contact',         sort_order: 6, is_button: false },
  { label: 'Donate Now',      path: '/donate',          sort_order: 7, is_button: true  },
]

const DEFAULT_CHILDREN: { label: string; path: string; parent_label: string; sort_order: number }[] = [
  { label: 'Our Mission',      path: '/our-mission',      parent_label: 'Our Story',       sort_order: 1 },
  { label: 'Our Work Process', path: '/our-work-process', parent_label: 'Our Story',       sort_order: 2 },
  { label: 'Who We Are',       path: '/who-we-are',       parent_label: 'Our Story',       sort_order: 3 },
  { label: 'Refer a Student',  path: '/refer-a-student',  parent_label: 'What You Can Do', sort_order: 1 },
  { label: 'Refer a Home',     path: '/refer-a-home',     parent_label: 'What You Can Do', sort_order: 2 },
  { label: 'Donate',           path: '/donate',           parent_label: 'What You Can Do', sort_order: 3 },
  { label: 'Become a Member',  path: '/become-a-member',  parent_label: 'What You Can Do', sort_order: 4 },
  { label: 'Spread the Word',  path: '/spread-the-word',  parent_label: 'What You Can Do', sort_order: 5 },
]

export default function AdminNavigation() {
  const [items, setItems] = useState<NavItem[]>([])
  const [editing, setEditing] = useState<NavItem | null>(null)
  const [form, setForm] = useState<Omit<NavItem, 'id' | 'children'>>(empty)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    const { data } = await supabase.from('nav_items').select('*').order('sort_order')
    if (data) setItems(data)
  }

  useEffect(() => { fetch() }, [])

  const parents = items.filter(i => !i.parent_id)
  const children = (parentId: string) => items.filter(i => i.parent_id === parentId)

  const openEdit = (item: NavItem) => {
    setEditing(item)
    const { id: _id, children: _c, ...rest } = item as NavItem & { children?: NavItem[] }
    setForm(rest)
  }

  const openNew = (parentId: string | null = null) => {
    setEditing({ id: '__new__' } as NavItem)
    setForm({ ...empty, parent_id: parentId, sort_order: items.length + 1 })
  }

  const handleSave = async () => {
    if (!form.label || !form.path) { toast.error('Label and path are required'); return }
    setSaving(true)
    const payload = { ...form, parent_id: form.parent_id || null }
    if (editing?.id === '__new__') {
      const { error } = await supabase.from('nav_items').insert([payload])
      if (error) toast.error(error.message); else toast.success('Nav item added!')
    } else if (editing) {
      const { error } = await supabase.from('nav_items').update(payload).eq('id', editing.id)
      if (error) toast.error(error.message); else toast.success('Updated!')
    }
    setSaving(false); setEditing(null); fetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this nav item? Child items will also be removed.')) return
    await supabase.from('nav_items').delete().eq('id', id)
    toast.success('Deleted'); fetch()
  }

  const toggleActive = async (item: NavItem) => {
    await supabase.from('nav_items').update({ is_active: !item.is_active }).eq('id', item.id)
    fetch()
  }

  const handleReset = async () => {
    if (!confirm('This will delete ALL current nav items and replace them with the default structure. Continue?')) return
    setSaving(true)
    // Delete children first (FK constraint), then parents
    await supabase.from('nav_items').delete().not('parent_id', 'is', null)
    await supabase.from('nav_items').delete().is('parent_id', null)
    // Insert parents
    const { data: inserted, error: pe } = await supabase
      .from('nav_items')
      .insert(DEFAULT_PARENTS.map(p => ({ ...p, is_active: true, open_in_new: false, parent_id: null })))
      .select('id, label')
    if (pe || !inserted) { toast.error('Reset failed: ' + pe?.message); setSaving(false); return }
    // Build label→id map
    const idMap: Record<string, string> = {}
    inserted.forEach((r: { id: string; label: string }) => { idMap[r.label] = r.id })
    // Insert children
    const childRows = DEFAULT_CHILDREN.map(c => ({
      label: c.label, path: c.path, sort_order: c.sort_order,
      parent_id: idMap[c.parent_label] ?? null,
      is_active: true, is_button: false, open_in_new: false,
    }))
    const { error: ce } = await supabase.from('nav_items').insert(childRows)
    setSaving(false)
    if (ce) toast.error('Children insert failed: ' + ce.message)
    else { toast.success('Nav reset to default!'); fetch() }
  }

  const NavRow = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 flex items-center gap-3 group mb-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 text-xs font-bold ${item.is_button ? '' : 'bg-gray-400'}`}
          style={item.is_button ? { backgroundColor: 'var(--site-primary)' } : {}}>
          {item.is_button ? <Star size={12} /> : <LinkIcon size={12} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{item.label}</span>
            {item.is_button && <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: 'var(--site-primary)' }}>CTA Button</span>}
            {item.open_in_new && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Opens new tab</span>}
          </div>
          <p className="text-xs text-gray-400">{item.path}</p>
        </div>
        <span className="text-xs text-gray-400 shrink-0">#{item.sort_order}</span>
        <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {!item.is_button && !item.parent_id && (
            <button onClick={() => openNew(item.id)} className="p-1.5 rounded-lg text-green-500 bg-green-50 hover:bg-green-100" title="Add child item">
              <Plus size={13} />
            </button>
          )}
          <button onClick={() => toggleActive(item)} className={`p-1.5 rounded-lg ${item.is_active ? 'text-green-500 bg-green-50' : 'text-gray-400 bg-gray-50'}`}>
            {item.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100">
            <Pencil size={13} />
          </button>
          <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-red-500 bg-red-50 hover:bg-red-100">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {/* Children */}
      {children(item.id).map(child => (
        <NavRow key={child.id} item={child} depth={depth + 1} />
      ))}
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Navigation Menu</h1>
          <p className="text-gray-500 text-sm">Manage header nav links, dropdowns, and the donate button</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-400 disabled:opacity-60"
          >
            <RotateCcw size={15} /> Reset to Default
          </button>
          <button onClick={() => openNew(null)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold" style={{ backgroundColor: 'var(--site-primary)' }}>
            <Plus size={16} /> Add Link
          </button>
        </div>
      </div>

      {/* Live preview strip */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 overflow-x-auto">
        <span className="text-xs text-gray-400 shrink-0">Preview:</span>
        {parents.filter(p => p.is_active).map(p => (
          <span
            key={p.id}
            className={`text-sm font-medium shrink-0 px-3 py-1.5 rounded-md ${p.is_button ? 'text-white' : 'text-gray-700'}`}
            style={p.is_button ? { backgroundColor: 'var(--site-primary)' } : {}}
          >
            {p.label} {children(p.id).length > 0 && '▾'}
          </span>
        ))}
      </div>

      <div className="space-y-1">
        {parents.map(item => <NavRow key={item.id} item={item} />)}
        {items.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No navigation items yet. <button onClick={() => openNew()} className="font-medium" style={{ color: 'var(--site-primary)' }}>Add one</button>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-400">💡 Click <Plus size={10} className="inline" /> on a parent item to add a dropdown child link. Mark an item as "CTA Button" to make it the header's call-to-action button.</p>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">{editing.id === '__new__' ? 'Add Nav Item' : 'Edit Nav Item'}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Label *</label>
                  <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Our Story" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Path / URL *</label>
                  <input value={form.path} onChange={e => setForm(f => ({ ...f, path: e.target.value }))} placeholder="/our-story or https://..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Parent Item (for dropdown)</label>
                <select
                  value={form.parent_id || ''}
                  onChange={e => setForm(f => ({ ...f, parent_id: e.target.value || null }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800 bg-white"
                >
                  <option value="">— Top-level link (no parent) —</option>
                  {parents.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800" />
                </div>
                <div className="space-y-2 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 rounded" />
                    <span className="text-sm font-medium text-gray-700">Active (visible)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_button} onChange={e => setForm(f => ({ ...f, is_button: e.target.checked }))} className="w-4 h-4 rounded" />
                    <span className="text-sm font-medium text-gray-700">CTA Button style</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.open_in_new} onChange={e => setForm(f => ({ ...f, open_in_new: e.target.checked }))} className="w-4 h-4 rounded" />
                    <span className="text-sm font-medium text-gray-700">Open in new tab</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold disabled:opacity-60" style={{ backgroundColor: 'var(--site-primary)' }}>
                <Save size={16} /> {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setEditing(null)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
