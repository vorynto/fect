import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Testimonial } from '../../types'

const fallback: Testimonial[] = [
  { id: '1', name: 'Kavitha R.', designation: 'FECT Beneficiary – Education Program', quote: 'FECT changed my life. Without their support I would have dropped out of school. Today I am pursuing my engineering degree thanks to their continuous sponsorship.', image_url: '', is_active: true, sort_order: 1 },
  { id: '2', name: 'Rajesh M.', designation: 'FECT Volunteer', quote: 'Being part of FECT for over 5 years has been incredibly rewarding. We see real change in the communities we serve. The transparency and dedication of the team is inspiring.', image_url: '', is_active: true, sort_order: 2 },
  { id: '3', name: 'Priya S.', designation: 'Donor since 2015', quote: 'I have been donating to FECT for almost a decade. The impact reports and direct engagement with beneficiaries gives me confidence that every rupee is used wisely.', image_url: '', is_active: true, sort_order: 3 },
  { id: '4', name: 'Anbu K.', designation: 'FECT Beneficiary – Medical Aid', quote: 'When my father was diagnosed with cancer, FECT stepped in immediately with financial support. Their compassion and speed during our crisis was beyond words.', image_url: '', is_active: true, sort_order: 4 },
]

export default function TestimonialsSection() {
  const [items, setItems] = useState<Testimonial[]>(fallback)
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => { if (data && data.length > 0) setItems(data) })
  }, [])

  const go = useCallback((idx: number) => {
    setDirection(idx > current ? 1 : -1)
    setCurrent((idx + items.length) % items.length)
  }, [current, items.length])

  useEffect(() => {
    const id = setInterval(() => go(current + 1), 6000)
    return () => clearInterval(id)
  }, [current, go])

  const item = items[current]

  return (
    <section className="py-20 bg-gray-50">
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
            Testimonials
          </span>
          <h2 className="text-4xl font-extrabold mb-4" style={{ color: 'var(--site-heading-color)' }}>
            Voices of Change
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={item.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 60 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-10 shadow-lg border border-gray-100 text-center"
            >
              <Quote size={40} className="mx-auto mb-6 opacity-20" style={{ color: 'var(--site-primary)' }} />
              <p className="text-gray-600 text-lg leading-relaxed mb-8 italic">
                "{item.quote}"
              </p>
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: 'var(--site-primary)' }}
                >
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold" style={{ color: 'var(--site-heading-color)' }}>{item.name}</p>
                  <p className="text-sm text-gray-500">{item.designation}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <button
            onClick={() => go(current - 1)}
            className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-all border border-gray-100"
            style={{ color: 'var(--site-primary)' }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => go(current + 1)}
            className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-all border border-gray-100"
            style={{ color: 'var(--site-primary)' }}
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 h-2.5' : 'w-2.5 h-2.5 bg-gray-300'
                }`}
                style={i === current ? { backgroundColor: 'var(--site-primary)', width: '24px', height: '10px' } : {}}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
