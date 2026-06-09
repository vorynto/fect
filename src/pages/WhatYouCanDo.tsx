import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { GraduationCap, Home, Heart, Users, Share2, ArrowRight } from 'lucide-react'
import { usePageContent } from '../hooks/usePageContent'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
}

const actions = [
  {
    icon: GraduationCap,
    key: 'refer_student',
    defaultTitle: 'Refer a Student',
    defaultDesc: 'Know an academically promising child from a financially struggling family? Refer them to us and we will take care of their education — fees, books, uniforms, and more.',
    link: '/refer-a-student',
    linkLabel: 'Refer a Student',
    color: 'bg-blue-50 border-blue-100',
    iconBg: '#3b82f6',
  },
  {
    icon: Home,
    key: 'refer_home',
    defaultTitle: 'Refer a Home',
    defaultDesc: 'Know a local orphanage, elderly home, or care institution that needs support? Help us find organisations where we can extend our helping hands.',
    link: '/refer-a-home',
    linkLabel: 'Refer a Home',
    color: 'bg-green-50 border-green-100',
    iconBg: '#22c55e',
  },
  {
    icon: Heart,
    key: 'donate',
    defaultTitle: 'Donate',
    defaultDesc: 'Every rupee you donate goes directly to a student\'s fees, medical treatment, or care home supplies. We maintain full financial transparency with receipts shared for every disbursement.',
    link: '/donate',
    linkLabel: 'Donate Now',
    color: 'bg-red-50 border-red-100',
    iconBg: 'var(--site-primary)',
  },
  {
    icon: Users,
    key: 'become_member',
    defaultTitle: 'Become a Member',
    defaultDesc: 'Join our growing family of 40+ committed members. Members contribute monthly, quarterly, or annually and can participate in field visits, awareness drives, and events.',
    link: '/become-a-member',
    linkLabel: 'Join Us',
    color: 'bg-purple-50 border-purple-100',
    iconBg: '#a855f7',
  },
  {
    icon: Share2,
    key: 'spread_word',
    defaultTitle: 'Spread the Word',
    defaultDesc: 'Even if you cannot contribute financially, your voice matters. Share our story with friends, family, and on social media — awareness is the first step to change.',
    link: '/spread-the-word',
    linkLabel: 'Spread the Word',
    color: 'bg-orange-50 border-orange-100',
    iconBg: '#f97316',
  },
]

export default function WhatYouCanDo() {
  const { getTitle, get, getImage } = usePageContent('what_you_can_do')

  const heroTitle = getTitle('hero', 'What You Can Do')
  const heroDesc  = get('hero', 'There are many ways to make a difference — choose what suits you best and join the FECT family.')
  const introTitle = getTitle('intro', 'Every Action Counts')
  const introText  = get('intro', 'We understand that not everyone can contribute in the same way. Whether you have time, money, connections, or simply a social media account — there is a meaningful role for you at FECT. Here are five powerful ways you can help transform lives.')

  return (
    <div>
      {/* Hero */}
      <section
        className="py-28 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${getImage('hero', 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1600&q=80')})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-extrabold mb-4 text-white">
            {heroTitle}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-gray-200">
            {heroDesc}
          </motion.p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full mb-5 text-white" style={{ backgroundColor: 'var(--site-primary)' }}>
              Get Involved
            </span>
            <h2 className="text-3xl font-extrabold mb-5" style={{ color: 'var(--site-heading-color)' }}>{introTitle}</h2>
            <p className="text-gray-600 leading-relaxed text-lg">{introText}</p>
          </motion.div>
        </div>
      </section>

      {/* Action Cards */}
      <section className="py-10 pb-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {actions.map((action, i) => {
              const Icon = action.icon
              const title = getTitle(action.key, action.defaultTitle)
              const desc  = get(action.key, action.defaultDesc)
              return (
                <motion.div
                  key={action.key}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                  className={`bg-white rounded-2xl p-8 shadow-sm border hover:shadow-lg transition-all group ${action.color}`}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: action.iconBg }}
                  >
                    <Icon size={26} />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--site-heading-color)' }}>{title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{desc}</p>
                  <Link
                    to={action.link}
                    className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:gap-3"
                    style={{ color: 'var(--site-primary)' }}
                  >
                    {action.linkLabel} <ArrowRight size={16} />
                  </Link>
                </motion.div>
              )
            })}

            {/* Impact card */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={5}
              className="rounded-2xl p-8 text-white lg:col-span-1 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--site-primary)' }}
            >
              <div>
                <h3 className="text-2xl font-extrabold mb-4">Together We&#39;ve Achieved</h3>
                <ul className="space-y-4">
                  {[
                    { value: '1,200+', label: 'Students Supported' },
                    { value: '40+',    label: 'Active Members' },
                    { value: '15+',    label: 'Years of Service' },
                    { value: '12+',    label: 'Districts Covered' },
                  ].map(s => (
                    <li key={s.label} className="flex justify-between items-center border-b border-white/20 pb-3">
                      <span className="text-red-100 text-sm">{s.label}</span>
                      <span className="font-extrabold text-xl">{s.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/donate"
                className="mt-8 block text-center py-3 bg-white rounded-xl text-sm font-bold transition-all hover:bg-red-50"
                style={{ color: 'var(--site-primary)' }}
              >
                Donate Now
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
