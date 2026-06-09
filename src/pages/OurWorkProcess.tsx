import { motion } from 'framer-motion'
import { Search, CheckCircle, HandCoins, GraduationCap, Home, ArrowRight } from 'lucide-react'
import { usePageContent } from '../hooks/usePageContent'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
}

export default function OurWorkProcess() {
  const { getTitle, get, getImage } = usePageContent('our_work_process')

  const heroTitle = getTitle('hero', 'Our Work Process')
  const heroDesc  = get('hero', 'A transparent, step-by-step approach ensuring every rupee reaches those who truly need it.')

  const mainSteps = [
    { key: 'step_1', icon: Search,     defaultTitle: 'Gathering Referrals',    defaultDesc: 'We receive referrals from community members, schools, hospitals, volunteers, and direct applicants across Tamil Nadu.' },
    { key: 'step_2', icon: CheckCircle,defaultTitle: 'Verification',            defaultDesc: 'Our team conducts telephonic checks followed by in-person field visits to confirm genuine need and assess the situation.' },
    { key: 'step_3', icon: HandCoins,  defaultTitle: 'Fund Raising',            defaultDesc: 'Verified cases are shared with our donor network and members who contribute directly to the specific cause.' },
    { key: 'step_4', icon: GraduationCap,defaultTitle: 'Direct Payment & Monitoring', defaultDesc: 'Funds are paid directly to institutions (schools, hospitals) with receipts. We continue to monitor each beneficiary\'s progress.' },
  ]

  const detailedSteps = [
    { key: 'detail_1', defaultTitle: 'Case Intake',          defaultDesc: 'Student or patient referred by community member, school, hospital, or direct application.' },
    { key: 'detail_2', defaultTitle: 'Contact Verification', defaultDesc: 'Telephonic contact to verify information and initial assessment of the case.' },
    { key: 'detail_3', defaultTitle: 'Volunteer Engagement', defaultDesc: 'Direct volunteer interaction with students and families to understand circumstances.' },
    { key: 'detail_4', defaultTitle: 'On-site Visit',         defaultDesc: 'Field visit to confirm circumstances, gather academic records and supporting documents.' },
    { key: 'detail_5', defaultTitle: 'Funding Request',       defaultDesc: 'Case details shared across donor network and FECT membership for contributions.' },
    { key: 'detail_6', defaultTitle: 'Direct Payment',        defaultDesc: 'Donations collected and paid directly to the institution — receipts documented and shared.' },
    { key: 'detail_7', defaultTitle: 'Progress Update',       defaultDesc: 'Donors receive updates about the student\'s academic progress via email or network.' },
    { key: 'detail_8', defaultTitle: 'Ongoing Monitoring',    defaultDesc: 'Continuous academic monitoring with remedial support provided to students who struggle.' },
  ]

  const homesTitle   = getTitle('homes_title',   'Support for Homes & Institutions')
  const homesContent = get('homes_content', 'For homes serving elderly, disabled, or orphaned individuals, FECT provides assistance 4–6 times annually. We identify genuinely struggling organisations, engage with management and residents, and create customised wish lists addressing provisions, medical needs, and activity materials.')

  return (
    <div>
      {/* Hero */}
      <section
        className="py-28 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${getImage('hero', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=80')})` }}
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

      {/* 4 Main Stages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full mb-4 text-white" style={{ backgroundColor: 'var(--site-primary)' }}>
              How We Work
            </span>
            <h2 className="text-4xl font-extrabold" style={{ color: 'var(--site-heading-color)' }}>4 Core Stages</h2>
            <p className="text-gray-500 mt-3">Our policy is implemented through four clearly defined stages</p>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute top-10 left-0 right-0 h-0.5 bg-gray-200 mx-24" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {mainSteps.map((step, i) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={step.key}
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                    className="text-center"
                  >
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-white mx-auto mb-5 border-4 border-white shadow-lg" style={{ backgroundColor: 'var(--site-primary)' }}>
                      <Icon size={32} />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold mx-auto mb-4" style={{ color: 'var(--site-primary)' }}>
                      {i + 1}
                    </div>
                    <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--site-heading-color)' }}>
                      {getTitle(step.key, step.defaultTitle)}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {get(step.key, step.defaultDesc)}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 8-Step Detailed Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full mb-4 text-white" style={{ backgroundColor: 'var(--site-primary)' }}>
              Student Support
            </span>
            <h2 className="text-4xl font-extrabold" style={{ color: 'var(--site-heading-color)' }}>8-Step Student Assistance</h2>
            <p className="text-gray-500 mt-3">A detailed look at how we support each student from referral to ongoing monitoring</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {detailedSteps.map((step, i) => (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 text-5xl font-extrabold text-gray-100 select-none leading-none">{i + 1}</div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mb-4 relative z-10" style={{ backgroundColor: 'var(--site-primary)' }}>
                  {i + 1}
                </div>
                <h4 className="font-bold mb-2 text-sm relative z-10" style={{ color: 'var(--site-heading-color)' }}>
                  {getTitle(step.key, step.defaultTitle)}
                </h4>
                <p className="text-gray-500 text-xs leading-relaxed relative z-10">
                  {get(step.key, step.defaultDesc)}
                </p>
                {i < detailedSteps.length - 1 && (
                  <ArrowRight size={14} className="absolute bottom-4 right-4 text-gray-300" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Homes Support */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6" style={{ backgroundColor: 'var(--site-primary)' }}>
                <Home size={28} />
              </div>
              <h2 className="text-3xl font-extrabold mb-5" style={{ color: 'var(--site-heading-color)' }}>{homesTitle}</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">{homesContent}</p>
              <ul className="space-y-3">
                {[
                  'Assisted 4–6 times per year per institution',
                  'Identifies genuinely struggling organisations',
                  'Custom wish lists: provisions, medical, activities',
                  'Direct engagement with management and residents',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-600">
                    <CheckCircle size={18} style={{ color: 'var(--site-primary)' }} className="shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80"
                alt="Home support"
                className="w-full h-80 object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
