import { motion } from 'framer-motion'
import { Target, Eye, BookOpen, Users, Shield, Lightbulb } from 'lucide-react'
import { usePageContent } from '../hooks/usePageContent'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
}

export default function OurMission() {
  const { getTitle, get, getImage } = usePageContent('our_mission')

  const heroTitle   = getTitle('hero', 'Our Mission')
  const heroDesc    = get('hero', 'Channelling collective compassion into lasting change — one student, one family, one community at a time.')
  const missionTitle = getTitle('mission', 'Our Mission')
  const missionText  = get('mission', 'We are a group of members from various fields who joined hands together to provide education to the deserving poor and needy children. Our aim is to motivate these students so that when they become leaders of tomorrow, they will help their fellow brethren to pursue education — creating a self-sustaining cycle of upliftment.')
  const visionTitle  = getTitle('vision', 'Our Vision')
  const visionText   = get('vision', 'Education is the only panacea for poverty. A society in which every child, regardless of economic background, has access to quality education and the opportunity to build a dignified life. When youthful energy is channelled productively through education, it becomes a shield against destitution, violence, and addiction.')
  const valueTitle   = getTitle('values_intro', 'What Drives Us')
  const valueDesc    = get('values_intro', 'Three principles guide every decision we make at FECT — from selecting beneficiaries to managing donations.')

  const goals = [
    { key: 'goal_1', icon: BookOpen, defaultTitle: 'Education for All', defaultDesc: 'Sponsor school and college fees, books, and uniforms for underprivileged children who show academic promise but lack financial means.' },
    { key: 'goal_2', icon: Users,    defaultTitle: 'Community Strength', defaultDesc: 'Build a network of committed members and donors who act as a collective safety net for families facing crises beyond their control.' },
    { key: 'goal_3', icon: Shield,   defaultTitle: 'Long-term Impact',   defaultDesc: 'Ensure our beneficiaries do not just survive but thrive — monitoring progress and providing mentorship alongside financial support.' },
    { key: 'goal_4', icon: Lightbulb,defaultTitle: 'Awareness & Advocacy', defaultDesc: 'Spread the message that a single act of generosity multiplies across generations and encourages others to join our cause.' },
  ]

  return (
    <div>
      {/* Hero */}
      <section
        className="py-28 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${getImage('hero', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=80')})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-5">
            <Target size={56} className="opacity-80" style={{ color: 'var(--site-primary)' }} />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-extrabold mb-4 text-white">
            {heroTitle}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-gray-200">
            {heroDesc}
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="rounded-3xl p-10 border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6" style={{ backgroundColor: 'var(--site-primary)' }}>
                <Target size={28} />
              </div>
              <h2 className="text-3xl font-extrabold mb-5" style={{ color: 'var(--site-heading-color)' }}>{missionTitle}</h2>
              <p className="text-gray-600 leading-relaxed text-lg">{missionText}</p>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
              className="rounded-3xl p-10 text-white"
              style={{ backgroundColor: 'var(--site-primary)' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <Eye size={28} className="text-white" />
              </div>
              <h2 className="text-3xl font-extrabold mb-5">{visionTitle}</h2>
              <p className="text-red-100 leading-relaxed text-lg">{visionText}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quote Banner */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.blockquote
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="text-3xl font-bold italic leading-relaxed"
            style={{ color: 'var(--site-heading-color)' }}
          >
            "The best possible way to eliminate poverty is to inherit education to our younger generation."
          </motion.blockquote>
          <p className="mt-4 text-gray-500 font-medium">— FECT Founding Principle</p>
        </div>
      </section>

      {/* Our Goals */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full mb-4 text-white" style={{ backgroundColor: 'var(--site-primary)' }}>
              What Drives Us
            </span>
            <h2 className="text-4xl font-extrabold" style={{ color: 'var(--site-heading-color)' }}>{valueTitle}</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">{valueDesc}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {goals.map((g, i) => {
              const Icon = g.icon
              return (
                <motion.div
                  key={g.key}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                  className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:border-[var(--site-primary)] hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--site-primary)' }}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--site-heading-color)' }}>
                    {getTitle(g.key, g.defaultTitle)}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {get(g.key, g.defaultDesc)}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
