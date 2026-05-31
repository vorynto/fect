import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { usePageContent } from '../../hooks/usePageContent'

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const steps = 50
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, 2000 / steps)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

const DEFAULTS = [
  { title: '1200+', content: 'Students Supported' },
  { title: '15+',   content: 'Years of Service' },
  { title: '40+',   content: 'Active Members' },
  { title: '12+',   content: 'Districts Covered' },
]

export default function StatsSection() {
  const { getTitle, get } = usePageContent('home')

  const stats = DEFAULTS.map((d, i) => {
    const key = `stat_${i + 1}`
    const raw = getTitle(key, d.title)
    const label = get(key, d.content)
    const num = parseInt(raw.replace(/\D/g, '')) || parseInt(d.title)
    const suffix = raw.replace(/[0-9]/g, '') || d.title.replace(/[0-9]/g, '')
    return { raw, label, num, suffix }
  })

  return (
    <section className="py-16" style={{ backgroundColor: 'var(--site-primary)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center text-white"
            >
              <div className="text-4xl sm:text-5xl font-extrabold mb-2">
                <CountUp target={stat.num} suffix={stat.suffix} />
              </div>
              <div className="text-sm sm:text-base font-medium text-red-100">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
