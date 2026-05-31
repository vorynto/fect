import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Images } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { usePageContent } from '../hooks/usePageContent'
import type { GalleryAlbum } from '../types'

export default function Gallery() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [loading, setLoading] = useState(true)
  const { getTitle, get } = usePageContent('gallery')

  useEffect(() => {
    supabase
      .from('gallery_albums')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setAlbums(data)
        setLoading(false)
      })
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="py-28 relative bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&q=80)' }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <h1 className="text-5xl font-extrabold mb-4 text-white">{getTitle('hero', 'Our Gallery')}</h1>
          <p className="text-xl text-gray-200">{get('hero', 'Moments of impact from our work across Tamil Nadu.')}</p>
        </div>
      </section>

      {/* Albums */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : albums.length === 0 ? (
            <div className="text-center py-20">
              <Images size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No galleries yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {albums.map((album, i) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: (i % 3) * 0.1 }}
                  className="card-hover"
                >
                  <Link to={`/gallery/${album.id}`} className="block rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
                    <div className="relative overflow-hidden">
                      <img
                        src={album.cover_image_url || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80'}
                        alt={album.title}
                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-5">
                          <span className="text-white text-sm font-medium">View Album</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--site-heading-color)' }}>{album.title}</h3>
                      {album.description && (
                        <p className="text-gray-500 text-sm line-clamp-2">{album.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(album.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
