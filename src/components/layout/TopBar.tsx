import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useSettings } from '../../contexts/SettingsContext'
import type { TopBarQuote } from '../../types'

const FALLBACK_QUOTES: TopBarQuote[] = [
  { id: '1', quote_text: 'Your donation today can put a child through school tomorrow', is_active: true, sort_order: 1 },
  { id: '2', quote_text: 'Education is the most powerful weapon to change the world', is_active: true, sort_order: 2 },
  { id: '3', quote_text: 'One act of generosity can ripple across generations', is_active: true, sort_order: 3 },
]

const SocialIcon = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    aria-label={label}
    className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white text-[10px] font-bold transition-colors"
  >
    {label === 'Facebook' ? 'f' : label === 'YouTube' ? '▶' : 'ig'}
  </a>
)

export default function TopBar() {
  const { settings } = useSettings()
  const [quotes, setQuotes] = useState<TopBarQuote[]>(FALLBACK_QUOTES)
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    supabase
      .from('top_bar_quotes')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => { if (data && data.length > 0) setQuotes(data) })
  }, [])

  useEffect(() => {
    if (quotes.length <= 1) return
    const id = setInterval(() => {
      setDirection(1)
      setIndex(i => (i + 1) % quotes.length)
    }, 4500)
    return () => clearInterval(id)
  }, [quotes.length])

  if (!settings.top_bar_enabled) return null

  const hasSocial = settings.facebook_url || settings.youtube_url || settings.instagram_url

  return (
    <div
      className="w-full py-1.5 px-4 z-50 relative"
      style={{ backgroundColor: 'var(--site-primary)' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 min-h-[28px]">

        {/* Left — Registration number */}
        <div className="shrink-0 text-xs font-semibold text-white/90 whitespace-nowrap hidden sm:block">
          {settings.top_bar_reg_no || 'Reg No: TN-09/184'}
        </div>

        {/* Centre — Y-axis rotating quote */}
        <div
          className="flex-1 text-center overflow-hidden"
          style={{ perspective: '400px', perspectiveOrigin: '50% 50%' }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.p
              key={index}
              custom={direction}
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0,   opacity: 1 }}
              exit={{    rotateX:  90, opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeInOut' }}
              className="text-xs text-white font-medium truncate"
              style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
            >
              ✦ {quotes[index]?.quote_text} ✦
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Right — Social icons */}
        <div className="flex items-center gap-2 shrink-0">
          {settings.facebook_url && (
            <SocialIcon href={settings.facebook_url} label="Facebook" />
          )}
          {settings.youtube_url && (
            <SocialIcon href={settings.youtube_url} label="YouTube" />
          )}
          {settings.instagram_url && (
            <SocialIcon href={settings.instagram_url} label="Instagram" />
          )}
          {!hasSocial && (
            <span className="text-xs text-white/70 hidden sm:block">
              {settings.email || 'info@fect.in'}
            </span>
          )}
        </div>

      </div>
    </div>
  )
}
