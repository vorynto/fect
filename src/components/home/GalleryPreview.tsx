import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { GalleryAlbum } from '../../types'

const fallback: GalleryAlbum[] = [
  { id: '1', title: 'Education Support Camp 2023', description: '', cover_image_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&q=80', created_at: '', is_active: true },
  { id: '2', title: 'Medical Aid Program', description: '', cover_image_url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80', created_at: '', is_active: true },
  { id: '3', title: 'Covid-19 Support 2020', description: '', cover_image_url: 'https://images.unsplash.com/photo-1584036561584-b03c19da874c?w=600&q=80', created_at: '', is_active: true },
  { id: '4', title: 'Annual Gathering 2023', description: '', cover_image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80', created_at: '', is_active: true },
]

export default function GalleryPreview() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>(fallback)

  useEffect(() => {
    supabase
      .from('gallery_albums')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => { if (data && data.length > 0) setAlbums(data) })
  }, [])

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span
            className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full mb-4 text-white"
            style={{ backgroundColor: 'var(--site-primary)' }}
          >
            Gallery
          </span>
          <h2 className="text-4xl font-extrabold mb-4" style={{ color: 'var(--site-heading-color)' }}>
            Moments of Impact
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Real stories, real change. Browse through our work across Tamil Nadu.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {albums.map((album, i) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1 }}
              className="card-hover"
            >
              <Link to={`/gallery/${album.id}`} className="block rounded-2xl overflow-hidden group relative">
                <img
                  src={album.cover_image_url}
                  alt={album.title}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-sm leading-snug">{album.title}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/gallery"
            className="inline-block px-8 py-3 rounded-md border-2 font-semibold transition-all hover:-translate-y-0.5"
            style={{ borderColor: 'var(--site-primary)', color: 'var(--site-primary)' }}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor = 'var(--site-primary)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--site-primary)'
            }}
          >
            View Full Gallery
          </Link>
        </div>
      </div>
    </section>
  )
}
