import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Pencil, Trash2, Save, X, Upload, Images, Image, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { GalleryAlbum, GalleryImage } from '../../types'

type View = 'albums' | 'album-detail'

export default function AdminGallery() {
  const [view, setView] = useState<View>('albums')
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null)
  const [albumImages, setAlbumImages] = useState<GalleryImage[]>([])
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null)
  const [albumForm, setAlbumForm] = useState({ title: '', description: '', cover_image_url: '' })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchAlbums = async () => {
    const { data } = await supabase.from('gallery_albums').select('*').order('created_at', { ascending: false })
    if (data) setAlbums(data)
  }

  const fetchImages = async (albumId: string) => {
    const { data } = await supabase.from('gallery_images').select('*').eq('album_id', albumId).order('sort_order')
    if (data) setAlbumImages(data)
  }

  useEffect(() => { fetchAlbums() }, [])

  const openAlbum = (album: GalleryAlbum) => {
    setSelectedAlbum(album)
    fetchImages(album.id)
    setView('album-detail')
  }

  const openNewAlbum = () => {
    setEditingAlbum({ id: '__new__' } as GalleryAlbum)
    setAlbumForm({ title: '', description: '', cover_image_url: '' })
  }

  const openEditAlbum = (album: GalleryAlbum) => {
    setEditingAlbum(album)
    setAlbumForm({ title: album.title, description: album.description, cover_image_url: album.cover_image_url })
  }

  const saveAlbum = async () => {
    if (!albumForm.title) { toast.error('Title is required'); return }
    setSaving(true)
    if (editingAlbum?.id === '__new__') {
      const { error } = await supabase.from('gallery_albums').insert([albumForm])
      if (error) toast.error(error.message)
      else toast.success('Album created!')
    } else if (editingAlbum) {
      const { error } = await supabase.from('gallery_albums').update(albumForm).eq('id', editingAlbum.id)
      if (error) toast.error(error.message)
      else toast.success('Album updated!')
    }
    setSaving(false)
    setEditingAlbum(null)
    fetchAlbums()
  }

  const deleteAlbum = async (id: string) => {
    if (!confirm('Delete this album and all its images?')) return
    const { error } = await supabase.from('gallery_albums').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Album deleted'); fetchAlbums() }
  }

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !selectedAlbum) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const path = `gallery/${selectedAlbum.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('fect-uploads').upload(path, file, { upsert: true })
      if (uploadError) { toast.error('Upload failed: ' + uploadError.message); continue }
      const { data: { publicUrl } } = supabase.storage.from('fect-uploads').getPublicUrl(path)
      await supabase.from('gallery_images').insert([{
        album_id: selectedAlbum.id,
        image_url: publicUrl,
        sort_order: albumImages.length,
        caption: '',
      }])
    }
    setUploading(false)
    fetchImages(selectedAlbum.id)
    toast.success('Images uploaded!')
  }

  const addImageUrl = async (url: string) => {
    if (!selectedAlbum || !url) return
    await supabase.from('gallery_images').insert([{
      album_id: selectedAlbum.id,
      image_url: url,
      sort_order: albumImages.length,
      caption: '',
    }])
    fetchImages(selectedAlbum.id)
  }

  const deleteImage = async (id: string) => {
    if (!confirm('Delete image?')) return
    await supabase.from('gallery_images').delete().eq('id', id)
    if (selectedAlbum) fetchImages(selectedAlbum.id)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        {view === 'album-detail' && (
          <button onClick={() => { setView('albums'); setSelectedAlbum(null) }} className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--site-primary)' }}>
            ← Back
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-gray-900">
            {view === 'albums' ? 'Gallery Albums' : selectedAlbum?.title}
          </h1>
          <p className="text-gray-500 text-sm">
            {view === 'albums' ? 'Manage gallery albums and images' : 'Manage images in this album'}
          </p>
        </div>
        {view === 'albums' ? (
          <button onClick={openNewAlbum} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold" style={{ backgroundColor: 'var(--site-primary)' }}>
            <Plus size={16} /> New Album
          </button>
        ) : (
          <label className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold cursor-pointer ${uploading ? 'opacity-60' : ''}`} style={{ backgroundColor: 'var(--site-primary)' }}>
            <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Images'}
            <input type="file" multiple accept="image/*" className="hidden" onChange={uploadImage} disabled={uploading} />
          </label>
        )}
      </div>

      {/* Albums view */}
      {view === 'albums' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {albums.map(album => (
            <div key={album.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div
                className="h-40 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${album.cover_image_url || 'https://via.placeholder.com/400x160'})` }}
              >
                <div className="absolute inset-0 bg-black/30 flex items-end p-3 gap-2">
                  <button
                    onClick={() => openAlbum(album)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur text-white text-xs font-medium hover:bg-white/40"
                  >
                    <Images size={13} /> Manage
                  </button>
                  <Link to={`/gallery/${album.id}`} target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur text-white text-xs font-medium hover:bg-white/40">
                    <Eye size={13} /> Preview
                  </Link>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">{album.title}</h3>
                {album.description && <p className="text-sm text-gray-500 line-clamp-2">{album.description}</p>}
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => openEditAlbum(album)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100">
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={() => deleteAlbum(album.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Album detail view */}
      {view === 'album-detail' && selectedAlbum && (
        <div>
          {/* Add by URL */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5 flex gap-3">
            <input
              type="text"
              placeholder="Or paste image URL here..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm text-gray-800"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  addImageUrl((e.target as HTMLInputElement).value)
                  ;(e.target as HTMLInputElement).value = ''
                }
              }}
            />
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
              style={{ backgroundColor: 'var(--site-primary)' }}
              onClick={e => {
                const input = (e.currentTarget.previousSibling as HTMLInputElement)
                addImageUrl(input.value)
                input.value = ''
              }}
            >
              <Plus size={15} /> Add
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {albumImages.map(img => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden bg-gray-100">
                <img src={img.image_url} alt={img.caption} className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => deleteImage(img.id)} className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                    {img.caption}
                  </div>
                )}
              </div>
            ))}
            {albumImages.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
                <Image size={40} className="mb-3 opacity-30" />
                <p className="text-sm">No images yet. Upload or add by URL above.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Album modal */}
      {editingAlbum && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                {editingAlbum.id === '__new__' ? 'Create Album' : 'Edit Album'}
              </h3>
              <button onClick={() => setEditingAlbum(null)} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Album Title *</label>
                <input
                  value={albumForm.title}
                  onChange={e => setAlbumForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Education Support Camp 2024"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={albumForm.description}
                  onChange={e => setAlbumForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cover Image URL</label>
                <input
                  value={albumForm.cover_image_url}
                  onChange={e => setAlbumForm(f => ({ ...f, cover_image_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-gray-800"
                />
                {albumForm.cover_image_url && (
                  <img src={albumForm.cover_image_url} alt="" className="mt-2 w-full h-32 object-cover rounded-lg" />
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={saveAlbum} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold disabled:opacity-60" style={{ backgroundColor: 'var(--site-primary)' }}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Album'}
              </button>
              <button onClick={() => setEditingAlbum(null)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
