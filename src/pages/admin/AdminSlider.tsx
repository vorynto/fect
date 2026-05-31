import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Pencil, Trash2, Save, X, GripVertical, Eye, EyeOff, Upload, Link as LinkIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import type { SliderItem } from '../../types'

const empty: Omit<SliderItem, 'id'> = {
  title: '',
  description: '',
  button_text: 'Learn More',
  button_link: '/',
  image_url: '',
  sort_order: 0,
  is_active: true,
}

export default function AdminSlider() {
  const [items, setItems] = useState<SliderItem[]>([])
  const [editing, setEditing] = useState<SliderItem | null>(null)
  const [form, setForm] = useState<Omit<SliderItem, 'id'>>(empty)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('upload')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    const ext = file.name.split('.').pop()
    const path = `sliders/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('fect-uploads').upload(path, file, { upsert: true })
    if (error) {
      toast.error('Upload failed: ' + error.message)
      setUploadingImage(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('fect-uploads').getPublicUrl(path)
    setForm(f => ({ ...f, image_url: publicUrl }))
    setUploadingImage(false)
    toast.success('Image uploaded!')
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const fetch = async () => {
    const { data } = await supabase.from('slider_items').select('*').order('sort_order')
    if (data) setItems(data)
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const openEdit = (item: SliderItem) => {
    setEditing(item)
    const { id: _id, ...rest } = item
    setForm(rest)
  }

  const openNew = () => {
    setEditing({ id: '__new__' } as SliderItem)
    setForm({ ...empty, sort_order: items.length + 1 })
  }

  const handleSave = async () => {
    if (!form.title || !form.image_url) {
      toast.error('Title and image URL are required')
      return
    }
    setSaving(true)
    if (editing?.id === '__new__') {
      const { error } = await supabase.from('slider_items').insert([form])
      if (error) toast.error(error.message)
      else toast.success('Slide added!')
    } else if (editing) {
      const { error } = await supabase.from('slider_items').update(form).eq('id', editing.id)
      if (error) toast.error(error.message)
      else toast.success('Slide updated!')
    }
    setSaving(false)
    setEditing(null)
    fetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slide?')) return
    const { error } = await supabase.from('slider_items').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Deleted'); fetch() }
  }

  const toggleActive = async (item: SliderItem) => {
    await supabase.from('slider_items').update({ is_active: !item.is_active }).eq('id', item.id)
    fetch()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Hero Slider</h1>
          <p className="text-gray-500 text-sm">Manage homepage slider images and content</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold"
          style={{ backgroundColor: 'var(--site-primary)' }}
        >
          <Plus size={16} /> Add Slide
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center">
              <GripVertical size={18} className="text-gray-300 shrink-0" />
              <img
                src={item.image_url}
                alt={item.title}
                className="w-24 h-16 rounded-lg object-cover shrink-0"
                onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96x64' }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                <p className="text-sm text-gray-500 truncate">{item.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">Button: {item.button_text}</span>
                  <span className="text-xs text-gray-400">→ {item.button_link}</span>
                  <span className="text-xs text-gray-400">Order: {item.sort_order}</span>
                </div>
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
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                {editing.id === '__new__' ? 'Add New Slide' : 'Edit Slide'}
              </h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
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
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Background Image *</label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${imageMode === 'upload' ? 'text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                      style={imageMode === 'upload' ? { backgroundColor: 'var(--site-primary)' } : {}}
                    >
                      <Upload size={12} /> Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${imageMode === 'url' ? 'text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                      style={imageMode === 'url' ? { backgroundColor: 'var(--site-primary)' } : {}}
                    >
                      <LinkIcon size={12} /> URL
                    </button>
                  </div>
                </div>

                {imageMode === 'upload' ? (
                  <label className={`flex flex-col items-center justify-center gap-2 w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${uploadingImage ? 'opacity-60 cursor-not-allowed' : 'hover:border-[var(--site-primary)] hover:bg-red-50'} ${form.image_url ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                    {uploadingImage ? (
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-[var(--site-primary)] animate-spin" />
                        Uploading…
                      </div>
                    ) : form.image_url ? (
                      <div className="relative w-full h-full">
                        <img src={form.image_url} alt="Slide" className="w-full h-full object-cover rounded-xl" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-semibold">Click to replace</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-sm text-gray-500">Click to upload image</span>
                        <span className="text-xs text-gray-400">JPG, PNG, WebP — max 10MB</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                ) : (
                  <input
                    value={form.image_url}
                    onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800"
                  />
                )}

                {imageMode === 'url' && form.image_url && (
                  <img src={form.image_url} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Button Text</label>
                  <input
                    value={form.button_text}
                    onChange={e => setForm(f => ({ ...f, button_text: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Button Link</label>
                  <input
                    value={form.button_link}
                    onChange={e => setForm(f => ({ ...f, button_link: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sort Order</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800"
                  />
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">Active (visible)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold disabled:opacity-60"
                style={{ backgroundColor: 'var(--site-primary)' }}
              >
                <Save size={16} /> {saving ? 'Saving...' : 'Save Slide'}
              </button>
              <button onClick={() => setEditing(null)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
