import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, Users, BookOpen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { PageContent } from '../../types'

export default function DonateCTA() {
  const [content, setContent] = useState<PageContent | null>(null)

  useEffect(() => {
    supabase
      .from('page_content')
      .select('*')
      .eq('page_key', 'home')
      .eq('section_key', 'donate_cta')
      .single()
      .then(({ data }) => { if (data) setContent(data) })
  }, [])

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, var(--site-heading-color) 0%, #2d3748 100%)' }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ backgroundColor: 'var(--site-primary)' }} />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10" style={{ backgroundColor: 'var(--site-primary)' }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-extrabold text-white mb-5 leading-tight">
              {content?.title || 'Make a Difference Today'}
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              {content?.content || 'Your donation directly transforms lives. FECT is a registered charitable trust — donations are eligible for tax exemption under Section 80G.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-md text-white font-semibold text-lg transition-all hover:-translate-y-0.5 shadow-lg"
                style={{ backgroundColor: 'var(--site-primary)' }}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = 'var(--site-primary-dark)')}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = 'var(--site-primary)')}
              >
                <Heart size={20} /> Donate Now
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-md border-2 border-white text-white font-semibold text-lg transition-all hover:bg-white hover:text-gray-900"
              >
                <Users size={20} /> Become a Member
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-5"
          >
            {[
              { icon: <BookOpen size={28} />, title: 'Educate a Child', amount: '₹500/month', desc: 'Sponsor school fees, books, and uniform for one child.' },
              { icon: <Heart size={28} />, title: 'Medical Aid', amount: '₹2,000', desc: 'Contribute to emergency medical treatment for one patient.' },
              { icon: <Users size={28} />, title: 'Elderly Care', amount: '₹1,000/month', desc: 'Support one elderly person in an orphanage or care home.' },
              { icon: <Heart size={28} />, title: 'Any Amount', amount: 'Your choice', desc: 'Every rupee counts. Give what you can and change a life.' },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur rounded-xl p-5 text-white border border-white/20"
              >
                <div className="mb-3 opacity-80">{card.icon}</div>
                <div className="text-lg font-bold mb-1">{card.title}</div>
                <div className="text-sm font-semibold mb-2" style={{ color: 'var(--site-primary)' }}>
                  {card.amount}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
