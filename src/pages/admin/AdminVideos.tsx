import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff, GripVertical, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { youtubeId, youtubeThumb } from '../../lib/youtube'
import type { Video } from '../../types'

const empty: Omit<Video, 'id' | 'created_at'> = {
  title: '', description: '', youtube_url: '', is_active: true, sort_order: 0,
}

export default function AdminVideos() {
  const [items, setItems] = useState<Video[]>([])
  const [editing, setEditing] = useState<Video | null>(null)
  const [form, setForm] = useState<Omit<Video, 'id' | 'created_at'>>(empty)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    const { data } = await supabase.from('videos').select('*').order('sort_order')
    if (data) setItems(data)
  }

  useEffect(() => { fetch() }, [])

  const openEdit = (item: Video) => {
    setEditing(item)
    const { id: _id, created_at: _c, ...rest } = item
    setForm(rest)
  }

  const openNew = () => {
    setEditing({ id: '__new__' } as Video)
    setForm({ ...empty, sort_order: items.length + 1 })
  }

  const handleSave = async () => {
    if (!form.title || !form.youtube_url) { toast.error('Title and YouTube link are required'); return }
    if (!youtubeId(form.youtube_url)) { toast.error('That does not look like a valid YouTube link'); return }
    setSaving(true)
    if (editing?.id === '__new__') {
      const { error } = await supabase.from('videos').insert([form])
      if (error) toast.error(error.message); else toast.success('Video added!')
    } else if (editing) {
      const { error } = await supabase.from('videos').update(form).eq('id', editing.id)
      if (error) toast.error(error.message); else toast.success('Updated!')
    }
    setSaving(false); setEditing(null); fetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return
    await supabase.from('videos').delete().eq('id', id)
    toast.success('Deleted'); fetch()
  }

  const toggleActive = async (item: Video) => {
    await supabase.from('videos').update({ is_active: !item.is_active }).eq('id', item.id)
    fetch()
  }

  const previewThumb = youtubeThumb(form.youtube_url)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Video Gallery</h1>
          <p className="text-gray-500 text-sm">Add YouTube videos to show on the website's Video Gallery page</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold" style={{ backgroundColor: 'var(--site-primary)' }}>
          <Plus size={16} /> Add Video
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
            <div className="relative aspect-video bg-gray-100">
              <img
                src={youtubeThumb(item.youtube_url) || 'https://via.placeholder.com/480x270'}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              {!item.is_active && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold px-2 py-1 rounded-full bg-gray-700">Hidden</span>
                </div>
              )}
              <a href={item.youtube_url} target="_blank" rel="noreferrer"
                className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-black/60">
                <ExternalLink size={14} />
              </a>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-2">
                <GripVertical size={16} className="text-gray-300 shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{item.title}</p>
                  {item.description && <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">Order: {item.sort_order}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => toggleActive(item)} className={`p-2 rounded-lg ${item.is_active ? 'text-green-500 bg-green-50' : 'text-gray-400 bg-gray-50'}`}>
                  {item.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button onClick={() => openEdit(item)} className="p-2 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100">
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-red-500 bg-red-50 hover:bg-red-100">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <p className="text-sm mb-3">No videos yet</p>
            <button onClick={openNew} className="text-sm font-medium" style={{ color: 'var(--site-primary)' }}>+ Add your first video</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">{editing.id === '__new__' ? 'Add Video' : 'Edit Video'}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">YouTube Link *</label>
                <input
                  value={form.youtube_url}
                  onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800"
                />
                {previewThumb && (
                  <img src={previewThumb} alt="Preview" className="mt-2 w-full aspect-video object-cover rounded-lg" />
                )}
                {form.youtube_url && !previewThumb && (
                  <p className="text-xs text-red-500 mt-1">Could not read a video ID from that link.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Education Support Camp 2024"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
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
                    <span className="text-sm font-semibold text-gray-700">Active (visible)</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold disabled:opacity-60" style={{ backgroundColor: 'var(--site-primary)' }}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Video'}
              </button>
              <button onClick={() => setEditing(null)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
