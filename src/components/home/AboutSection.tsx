import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { PageContent } from '../../types'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6 } }),
}

export default function AboutSection() {
  const [content, setContent] = useState<PageContent | null>(null)

  useEffect(() => {
    supabase
      .from('page_content')
      .select('*')
      .eq('page_key', 'home')
      .eq('section_key', 'about')
      .single()
      .then(({ data }) => { if (data) setContent(data) })
  }, [])

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1526958097901-5e6d742d3371?w=800&q=80"
                alt="FECT community work"
                className="w-full h-[460px] object-cover"
              />
              <div
                className="absolute inset-0 opacity-10"
                style={{ background: 'linear-gradient(to bottom right, var(--site-primary), transparent)' }}
              />
            </div>
            {/* Floating badge */}
            <div
              className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl"
              style={{ backgroundColor: 'var(--site-primary)' }}
            >
              <span className="text-3xl font-extrabold">15+</span>
              <span className="text-xs text-center font-medium">Years of<br/>Service</span>
            </div>
          </motion.div>

          {/* Text side */}
          <div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              custom={0}
            >
              <span
                className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full mb-4 text-white"
                style={{ backgroundColor: 'var(--site-primary)' }}
              >
                Who We Are
              </span>
              <h2 className="text-4xl font-extrabold mb-6 leading-tight" style={{ color: 'var(--site-heading-color)' }}>
                {content?.title || 'About FECT'}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {content?.content || 'Friends Educational and Charitable Trust (FECT) was founded by a group of computer engineering graduates who believed the best way to eliminate poverty is through education. Registered in 2009 (Reg No: TN-09/184), we have grown to over 40 active members dedicated to transforming lives across suburban and rural Tamil Nadu.'}
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Our work spans education sponsorship for school and college students, financial aid for medical emergencies especially cancer patients, and care support for orphanages and the elderly — always driven by the belief that empowering one individual transforms their entire community.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              custom={1}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/our-story"
                className="px-6 py-3 rounded-md text-white font-semibold transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--site-primary)' }}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = 'var(--site-primary-dark)')}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = 'var(--site-primary)')}
              >
                About Us
              </Link>
              <Link
                to="/services"
                className="px-6 py-3 rounded-md border-2 font-semibold transition-all hover:-translate-y-0.5"
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
                Our Programs
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
