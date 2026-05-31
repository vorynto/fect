import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Quote } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { usePageContent } from '../hooks/usePageContent'
import type { Testimonial } from '../types'

export default function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const { getTitle, get } = usePageContent('testimonials')

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data) setItems(data)
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <section className="py-28 relative bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80)' }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <h1 className="text-5xl font-extrabold mb-4 text-white">{getTitle('hero', 'Voices of Change')}</h1>
          <p className="text-xl text-gray-200">{get('hero', 'What our beneficiaries, volunteers, and donors say about FECT.')}</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {items.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: (i % 3) * 0.1 }}
                  className="card-hover bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                >
                  <Quote size={32} className="mb-5 opacity-20" style={{ color: 'var(--site-primary)' }} />
                  <p className="text-gray-600 leading-relaxed mb-6 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                      style={{ backgroundColor: 'var(--site-primary)' }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: 'var(--site-heading-color)' }}>{t.name}</p>
                      <p className="text-sm text-gray-500">{t.designation}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
