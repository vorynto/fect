import { motion } from 'framer-motion'
import { Users, Heart, Calendar, MapPin } from 'lucide-react'
import { usePageContent } from '../hooks/usePageContent'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
}

export default function WhoWeAre() {
  const { getTitle, get, getImage } = usePageContent('who_we_are')

  const heroTitle    = getTitle('hero', 'Who We Are')
  const heroDesc     = get('hero', 'Engineers turned social workers — a team that chose purpose over profit.')
  const originTitle  = getTitle('origin', 'How It All Began')
  const originText   = get('origin', 'FECT began as a group of computer engineering students who shared a common purpose beyond their studies. The founders initially pursued separate careers but later reunited with determination to establish an organisation dedicated to social impact. The group\'s philosophy centres on a straightforward principle: the best possible way to eliminate poverty is to inherit education to our younger generation.')
  const growthTitle  = getTitle('growth', 'Growth & Development')
  const growthText   = get('growth', 'The organisation experienced significant challenges during its formation but persevered through collaborative support. The team gradually identified and assisted disadvantaged youth while expanding operations. The group was officially registered as Friends Educational and Charitable Trust (FECT) in February 2009 to formalise their charitable work.')
  const todayTitle   = getTitle('today', 'FECT Today')
  const todayText    = get('today', 'Currently, the organisation comprises approximately 40 members from various professional backgrounds — committed to improving children\'s educational opportunities and life prospects. Together we have touched the lives of over 1,200 students and supported numerous care homes across Tamil Nadu.')

  const stats = [
    { key: 'stat_founded', defaultTitle: '2009', defaultDesc: 'Year Founded' },
    { key: 'stat_members', defaultTitle: '40+', defaultDesc: 'Active Members' },
    { key: 'stat_students', defaultTitle: '1,200+', defaultDesc: 'Students Supported' },
    { key: 'stat_districts', defaultTitle: '12+', defaultDesc: 'Districts Covered' },
  ]

  const values = [
    { key: 'value_1', icon: Heart,    defaultTitle: 'Compassion',     defaultDesc: 'We treat every beneficiary with dignity — behind every case is a human story that deserves our best.' },
    { key: 'value_2', icon: Users,    defaultTitle: 'Community',      defaultDesc: 'We believe in the collective power of ordinary people doing extraordinary things together.' },
    { key: 'value_3', icon: Calendar, defaultTitle: 'Commitment',     defaultDesc: 'Our members have sustained this mission for over 15 years through consistent personal effort.' },
    { key: 'value_4', icon: MapPin,   defaultTitle: 'On-the-ground',  defaultDesc: 'We do the field work ourselves — visiting families, schools, and homes rather than operating remotely.' },
  ]

  return (
    <div>
      {/* Hero */}
      <section
        className="py-28 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${getImage('hero', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80')})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center mb-5">
            <Users size={56} className="opacity-80" style={{ color: 'var(--site-primary)' }} />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-extrabold mb-4 text-white">
            {heroTitle}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-gray-200">
            {heroDesc}
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center py-6"
              >
                <div className="text-4xl font-extrabold mb-1" style={{ color: 'var(--site-primary)' }}>
                  {getTitle(s.key, s.defaultTitle)}
                </div>
                <div className="text-gray-500 text-sm font-medium">
                  {get(s.key, s.defaultDesc)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Text */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-10">
              {[
                { title: originTitle, text: originText },
                { title: growthTitle, text: growthText },
                { title: todayTitle,  text: todayText },
              ].map((s, i) => (
                <motion.div
                  key={s.title}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                >
                  <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--site-heading-color)' }}>{s.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{s.text}</p>
                </motion.div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
                className="rounded-2xl overflow-hidden shadow-lg"
              >
                <img
                  src={getImage('sidebar_image', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80')}
                  alt="FECT volunteers"
                  className="w-full h-52 object-cover"
                />
              </motion.div>

              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
                className="rounded-2xl p-6 text-white"
                style={{ backgroundColor: 'var(--site-primary)' }}
              >
                <h4 className="font-bold text-lg mb-3">Registration Details</h4>
                <ul className="space-y-2 text-sm text-red-100">
                  <li><strong className="text-white">Reg No:</strong> TN-09/184</li>
                  <li><strong className="text-white">Date:</strong> 06.02.2009</li>
                  <li><strong className="text-white">Location:</strong> Chennai, Tamil Nadu</li>
                  <li><strong className="text-white">Type:</strong> Charitable Trust</li>
                  <li><strong className="text-white">80G:</strong> Donations tax exempt</li>
                </ul>
              </motion.div>

              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3}
                className="rounded-2xl p-6 bg-gray-50 border border-gray-100"
              >
                <h4 className="font-bold text-lg mb-3" style={{ color: 'var(--site-heading-color)' }}>Our Members</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Our ~40 members come from engineering, medicine, law, business, and education. What unites us is not our profession — it is our belief that each of us has the power to change a life.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl font-extrabold" style={{ color: 'var(--site-heading-color)' }}>What We Stand For</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <motion.div
                  key={v.key}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                  className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 text-center"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white mx-auto mb-5" style={{ backgroundColor: 'var(--site-primary)' }}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--site-heading-color)' }}>
                    {getTitle(v.key, v.defaultTitle)}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {get(v.key, v.defaultDesc)}
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
