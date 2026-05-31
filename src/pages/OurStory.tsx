import { motion } from 'framer-motion'
import { usePageContent } from '../hooks/usePageContent'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
}

export default function OurStory() {
  const { getTitle, get, getImage } = usePageContent('our_story')

  const heroTitle   = getTitle('hero', 'About Us')
  const heroDesc    = get('hero', 'From three friends with a vision to an organisation that has touched thousands of lives across Tamil Nadu.')
  const foundTitle  = getTitle('founding', 'How It All Began')
  const foundText   = get('founding', 'FECT began in the summer of 2006 as casual discussions among three computer engineering friends who called themselves "Friends to Care." After two years of building their careers, they reunited with a shared mission: to use education as the most powerful tool to eliminate poverty. The trust was formally registered on February 6, 2009.')
  const missionTitle = getTitle('mission', 'Our Mission')
  const missionText  = get('mission', 'To empower underprivileged children and youth through quality education, and to provide compassionate support for medical emergencies, elderly care, and the mentally challenged — building a self-sustaining cycle where today\'s beneficiaries become tomorrow\'s contributors.')
  const visionTitle  = getTitle('vision', 'Our Vision')
  const visionText   = get('vision', 'A Tamil Nadu where no child is denied education due to poverty, where no family faces a medical crisis alone, and where every individual regardless of background has the opportunity to thrive.')

  const regNumber  = getTitle('reg_number',  'TN-09/184')
  const regDate    = getTitle('reg_date',    '06.02.2009')
  const regType    = getTitle('reg_type',    'Charitable Trust')
  const regSection = getTitle('reg_section', 'Donations tax exempt 80G')

  const values = [
    { key: 'value_1', defaultTitle: 'Transparency',   defaultDesc: 'Every rupee is accounted for. We publish impact reports and maintain complete financial transparency with our donors.' },
    { key: 'value_2', defaultTitle: 'Compassion',     defaultDesc: 'We treat every beneficiary with dignity and empathy, recognising that behind every case is a human story deserving respect.' },
    { key: 'value_3', defaultTitle: 'Sustainability', defaultDesc: 'We aim to create lasting change — not just immediate relief — by building educational legacies across generations.' },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="py-28 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${getImage('hero', 'https://images.unsplash.com/photo-1526958097901-5e6d742d3371?w=1600&q=80')})` }}>
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

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full mb-5 text-white" style={{ backgroundColor: 'var(--site-primary)' }}>
                  Established 2009
                </span>
                {[
                  { title: foundTitle,   text: foundText },
                  { title: missionTitle, text: missionText },
                  { title: visionTitle,  text: visionText },
                ].map(s => (
                  <div key={s.title} className="mb-10">
                    <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--site-heading-color)' }}>{s.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">{s.text}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="rounded-2xl overflow-hidden shadow-lg">
                <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80" alt="FECT Team" className="w-full h-52 object-cover" />
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2} className="rounded-2xl p-6 text-white" style={{ backgroundColor: 'var(--site-primary)' }}>
                <h4 className="font-bold text-lg mb-3">Registration Details</h4>
                <ul className="space-y-2 text-sm text-red-100">
                  <li><strong className="text-white">Reg No:</strong> {regNumber}</li>
                  <li><strong className="text-white">Date:</strong> {regDate}</li>
                  <li><strong className="text-white">Location:</strong> Chennai, Tamil Nadu</li>
                  <li><strong className="text-white">Type:</strong> {regType}</li>
                  <li><strong className="text-white">80G:</strong> {regSection}</li>
                </ul>
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3} className="rounded-2xl p-6 bg-gray-50 border border-gray-100">
                <h4 className="font-bold text-lg mb-3" style={{ color: 'var(--site-heading-color)' }}>Key Stats</h4>
                <ul className="space-y-3">
                  {[
                    { label: 'Students Supported', value: '1200+' },
                    { label: 'Active Members',      value: '40+' },
                    { label: 'Years of Service',    value: '15+' },
                    { label: 'Districts Covered',   value: '12+' },
                  ].map(s => (
                    <li key={s.label} className="flex justify-between text-sm">
                      <span className="text-gray-600">{s.label}</span>
                      <span className="font-bold" style={{ color: 'var(--site-primary)' }}>{s.value}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl font-extrabold" style={{ color: 'var(--site-heading-color)' }}>Our Core Values</h2>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <motion.div key={v.key} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-5" style={{ backgroundColor: 'var(--site-primary)' }}>
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--site-heading-color)' }}>
                  {getTitle(v.key, v.defaultTitle)}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {get(v.key, v.defaultDesc)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
