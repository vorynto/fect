import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { SliderItem } from '../../types'

const fallbackSlides: SliderItem[] = [
  {
    id: '1',
    title: 'Transforming Society by Transforming Individuals',
    description: 'We help underprivileged children and students with education, medical aid, and support in rural Tamil Nadu.',
    button_text: 'About Us',
    button_link: '/our-story',
    image_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=80',
    sort_order: 1, is_active: true,
  },
  {
    id: '2',
    title: 'Education is a Right, Not a Choice',
    description: 'Supporting school dropouts, college students, and the underprivileged to build a brighter future for Tamil Nadu.',
    button_text: 'Our Services',
    button_link: '/services',
    image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80',
    sort_order: 2, is_active: true,
  },
  {
    id: '3',
    title: 'Every Donation Transforms a Life',
    description: 'Your contribution directly funds education, medical emergencies, and care for the vulnerable across Tamil Nadu.',
    button_text: 'Donate Now',
    button_link: '/donate',
    image_url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1600&q=80',
    sort_order: 3, is_active: true,
  },
]

const contentVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  exit:   { opacity: 0, transition: { duration: 0.3 } },
}
const itemVariants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -15 },
}

export default function HeroSlider() {
  const [slides, setSlides] = useState<SliderItem[]>(fallbackSlides)
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    supabase
      .from('slider_items').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => { if (data && data.length > 0) setSlides(data) })
  }, [])

  const go = useCallback((index: number) => {
    setCurrent((index + slides.length) % slides.length)
    setProgress(0)
  }, [slides.length])

  const next = useCallback(() => go(current + 1), [current, go])

  useEffect(() => {
    if (isPaused) return
    setProgress(0)
    const INTERVAL = 5500
    const TICK = 50
    let elapsed = 0
    const id = setInterval(() => {
      elapsed += TICK
      setProgress(Math.min((elapsed / INTERVAL) * 100, 100))
      if (elapsed >= INTERVAL) { next(); elapsed = 0 }
    }, TICK)
    return () => clearInterval(id)
  }, [next, isPaused, current])

  const slide = slides[current]

  return (
    <section
      className="relative w-full overflow-hidden bg-gray-950"
      style={{ height: 'clamp(420px, 68vh, 680px)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/*
        ── BACKGROUND LAYER ──
        All slides are ALWAYS in the DOM stacked on top of each other.
        Only opacity changes — the bg-gray-950 base ensures no white flash ever.
      */}
      {slides.map((s, i) => (
        <motion.div
          key={s.id}
          className="absolute inset-0"
          animate={{ opacity: i === current ? 1 : 0 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
          style={{ zIndex: i === current ? 1 : 0 }}
        >
          {/* Ken Burns zoom only on the active image */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{ backgroundImage: `url(${s.image_url})` }}
            animate={i === current ? { scale: [1, 1.07] } : { scale: 1 }}
            transition={
              i === current
                ? { duration: 8, ease: 'linear' as const, repeat: Infinity, repeatType: 'mirror' as const }
                : { duration: 0.01 }
            }
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-black/72 via-black/45 to-black/15" />
        </motion.div>
      ))}

      {/*
        ── CONTENT LAYER ──
        AnimatePresence here is safe because the bg is always covered above.
        mode="wait" gives a clean exit before the new content enters.
      */}
      <div className="absolute inset-0 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${current}`}
            className="h-full flex items-center"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
              <div className="max-w-2xl">

                {/* Eyebrow */}
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-5">
                  <span className="w-8 h-px bg-(--site-primary)" />
                  <span
                    className="text-xs font-bold tracking-[0.2em] uppercase"
                    style={{ color: 'var(--site-primary)' }}
                  >
                    Making a Difference
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h1
                  variants={itemVariants}
                  className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.4rem] font-extrabold text-white leading-[1.1] mb-5"
                >
                  {slide.title}
                </motion.h1>

                {/* Description */}
                <motion.p
                  variants={itemVariants}
                  className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed max-w-xl"
                >
                  {slide.description}
                </motion.p>

                {/* Buttons */}
                <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                  <Link
                    to={slide.button_link}
                    className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold text-base shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    style={{ backgroundColor: 'var(--site-primary)' }}
                    onMouseOver={e => (e.currentTarget.style.backgroundColor = 'var(--site-primary-dark)')}
                    onMouseOut={e => (e.currentTarget.style.backgroundColor = 'var(--site-primary)')}
                  >
                    {slide.button_text}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/donate"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-white/60 text-white font-semibold text-base transition-all hover:bg-white hover:text-gray-900 hover:-translate-y-1"
                  >
                    Donate Now
                  </Link>
                </motion.div>

              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide counter — bottom left */}
      <div className="absolute bottom-6 left-6 lg:left-12 z-20 flex items-center gap-3">
        <span className="text-white font-bold text-2xl tabular-nums leading-none">
          {String(current + 1).padStart(2, '0')}
        </span>
        <div className="w-px h-5 bg-white/40" />
        <span className="text-white/50 text-sm tabular-nums leading-none">
          {String(slides.length).padStart(2, '0')}
        </span>
      </div>

      {/* Progress indicator dots — bottom centre */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="relative overflow-hidden rounded-full transition-all duration-300"
            style={{
              width: i === current ? '32px' : '8px',
              height: '8px',
              backgroundColor: i === current ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.35)',
            }}
            aria-label={`Go to slide ${i + 1}`}
          >
            {i === current && (
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ backgroundColor: 'var(--site-primary)' }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={() => go(current - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/35 flex items-center justify-center text-white transition-all hover:-translate-x-0.5"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => go(current + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/35 flex items-center justify-center text-white transition-all hover:translate-x-0.5"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>
    </section>
  )
}
