import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Video as VideoIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { usePageContent } from '../hooks/usePageContent'
import { youtubeEmbed } from '../lib/youtube'
import type { Video } from '../types'

export default function VideoGallery() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const { getTitle, get, getImage } = usePageContent('videos')

  useEffect(() => {
    supabase
      .from('videos')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data) setVideos(data)
        setLoading(false)
      })
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="py-28 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${getImage('hero', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1600&q=80')})` }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <h1 className="text-5xl font-extrabold mb-4 text-white">{getTitle('hero', 'Video Gallery')}</h1>
          <p className="text-xl text-gray-200">{get('hero', 'Watch our work in action — stories, events, and impact from across Tamil Nadu.')}</p>
        </div>
      </section>

      {/* Videos */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
                  <div className="aspect-video bg-gray-100 animate-pulse" />
                  <div className="p-5 space-y-2">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20">
              <VideoIcon size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No videos yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((v, i) => {
                const embed = youtubeEmbed(v.youtube_url)
                return (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ delay: (i % 3) * 0.1 }}
                    className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white flex flex-col"
                  >
                    <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
                      {embed ? (
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={embed}
                          title={v.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">Invalid video link</div>
                      )}
                    </div>
                    <div className="p-5 flex-1">
                      <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--site-heading-color)' }}>{v.title}</h3>
                      {v.description && <p className="text-gray-500 text-sm leading-relaxed">{v.description}</p>}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
