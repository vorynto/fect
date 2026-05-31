import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, X, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { GalleryAlbum as Album, GalleryImage } from '../types'

export default function GalleryAlbumPage() {
  const { id } = useParams()
  const [album, setAlbum] = useState<Album | null>(null)
  const [images, setImages] = useState<GalleryImage[]>([])
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('gallery_albums').select('*').eq('id', id).single(),
      supabase.from('gallery_images').select('*').eq('album_id', id).order('sort_order'),
    ]).then(([albumRes, imagesRes]) => {
      if (albumRes.data) setAlbum(albumRes.data)
      if (imagesRes.data) setImages(imagesRes.data)
      setLoading(false)
    })
  }, [id])

  const navLightbox = (dir: number) => {
    if (lightbox === null) return
    const next = (lightbox + dir + images.length) % images.length
    setLightbox(next)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') navLightbox(1)
      if (e.key === 'ArrowLeft') navLightbox(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, images.length])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 animate-spin" style={{ borderTopColor: 'var(--site-primary)' }} />
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-500">Album not found.</p>
        <Link to="/gallery" className="text-sm font-medium" style={{ color: 'var(--site-primary)' }}>← Back to Gallery</Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <Link to="/gallery" className="inline-flex items-center gap-2 text-sm font-medium mb-6" style={{ color: 'var(--site-primary)' }}>
            <ChevronLeft size={16} /> Back to Gallery
          </Link>
          <h1 className="text-4xl font-extrabold mb-3" style={{ color: 'var(--site-heading-color)' }}>{album.title}</h1>
          {album.description && <p className="text-gray-500 text-lg">{album.description}</p>}
          <p className="text-sm text-gray-400 mt-2">{images.length} photos</p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {images.length === 0 ? (
            <p className="text-center text-gray-500 py-20">No images in this album yet.</p>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
              {images.map((img, i) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 4) * 0.05 }}
                  className="break-inside-avoid cursor-pointer group rounded-lg overflow-hidden"
                  onClick={() => setLightbox(i)}
                >
                  <img
                    src={img.image_url}
                    alt={img.caption || album.title}
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-4 text-white p-2 hover:text-gray-300"
              onClick={() => setLightbox(null)}
            >
              <X size={28} />
            </button>
            <button
              className="absolute left-4 text-white p-2 hover:text-gray-300"
              onClick={e => { e.stopPropagation(); navLightbox(-1) }}
            >
              <ChevronLeft size={36} />
            </button>
            <motion.img
              key={lightbox}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={images[lightbox].image_url}
              alt={images[lightbox].caption}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
              onClick={e => e.stopPropagation()}
            />
            <button
              className="absolute right-4 text-white p-2 hover:text-gray-300"
              onClick={e => { e.stopPropagation(); navLightbox(1) }}
            >
              <ChevronRight size={36} />
            </button>
            {images[lightbox].caption && (
              <div className="absolute bottom-8 text-center text-white text-sm px-8">
                {images[lightbox].caption}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
