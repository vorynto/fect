import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { GraduationCap, Heart, Home, Users, Search, CheckCircle, TrendingUp, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { usePageContent } from '../../hooks/usePageContent'
import type { Program } from '../../types'

const iconMap: Record<string, React.ReactNode> = {
  GraduationCap: <GraduationCap size={32} />,
  Heart: <Heart size={32} />,
  Home: <Home size={32} />,
  Users: <Users size={32} />,
}

const fallback: Program[] = [
  { id: '1', title: 'Education', description: 'Full sponsorship for underprivileged students from school through graduation — fees, books, uniforms, and tuition.', icon: 'GraduationCap', sort_order: 1, is_active: true },
  { id: '2', title: 'Medical Aid', description: 'Emergency financial assistance for cancer patients and medical crises, covering hospital and treatment costs.', icon: 'Heart', sort_order: 2, is_active: true },
  { id: '3', title: 'Orphanage & Elderly', description: 'Sponsorship and regular support for orphanages, elderly homes, and care institutions for the mentally challenged.', icon: 'Home', sort_order: 3, is_active: true },
  { id: '4', title: 'Community Support', description: 'Distribution of essentials, school kits, and relief materials to homeless and vulnerable communities.', icon: 'Users', sort_order: 4, is_active: true },
]

const DEFAULT_STEPS = ['Gathering Referrals', 'Verification', 'Fund Raising', 'Disbursal & Monitoring']

export default function ServicesSection() {
  const [programs, setPrograms] = useState<Program[]>(fallback)
  const { getTitle } = usePageContent('home')

  const processSteps = DEFAULT_STEPS.map((d, i) => getTitle(`process_${i + 1}`, d))

  useEffect(() => {
    supabase
      .from('programs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => { if (data && data.length > 0) setPrograms(data) })
  }, [])

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span
            className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full mb-4 text-white"
            style={{ backgroundColor: 'var(--site-primary)' }}
          >
            Our Services
          </span>
          <h2 className="text-4xl font-extrabold mb-4" style={{ color: 'var(--site-heading-color)' }}>
            Our Programs
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Four focused programs addressing the most critical needs of underprivileged communities across Tamil Nadu.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {programs.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="card-hover bg-white rounded-2xl p-7 text-center shadow-sm border border-gray-100 group"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white transition-all duration-300 group-hover:scale-110"
                style={{ backgroundColor: 'var(--site-primary)' }}
              >
                {iconMap[p.icon] || <GraduationCap size={32} />}
              </div>
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--site-heading-color)' }}>
                {p.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{p.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Process — redesigned */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-extrabold" style={{ color: 'var(--site-heading-color)' }}>
              How We Work
            </h3>
            <p className="text-gray-500 mt-2 text-base">From referral to impact — a transparent 4-step process</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 relative">
            {/* Connector line (desktop only) */}
            <div
              className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 z-0"
              style={{ background: 'linear-gradient(to right, var(--site-primary), var(--site-primary))' }}
            />

            {[
              { icon: <Search size={22} />, color: 'from-red-500 to-red-700' },
              { icon: <CheckCircle size={22} />, color: 'from-red-600 to-red-800' },
              { icon: <TrendingUp size={22} />, color: 'from-red-700 to-red-900' },
              { icon: <Send size={22} />, color: 'from-red-800 to-red-950' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative z-10 flex flex-col items-center text-center px-4 group"
              >
                {/* Icon circle with number badge */}
                <div className="relative mb-5">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl"
                    style={{ backgroundColor: 'var(--site-primary)' }}
                  >
                    {item.icon}
                  </div>
                  <span
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white text-xs font-extrabold flex items-center justify-center border-2 border-white shadow"
                    style={{ backgroundColor: 'var(--site-primary-dark, #962d22)' }}
                  >
                    {i + 1}
                  </span>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-full group-hover:shadow-md transition-shadow">
                  <h4
                    className="font-bold text-base mb-2"
                    style={{ color: 'var(--site-heading-color)' }}
                  >
                    {processSteps[i]}
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {[
                      'Community members, schools & hospitals refer those in need',
                      'Our team verifies cases via phone and direct field visits',
                      'We raise funds through donors, members & corporate partners',
                      'Funds disbursed directly with ongoing impact monitoring',
                    ][i]}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="text-center mt-10">
          <Link
            to="/services"
            className="inline-block px-8 py-3 rounded-md text-white font-semibold transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--site-primary)' }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = 'var(--site-primary-dark)')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = 'var(--site-primary)')}
          >
            Learn More About Our Work
          </Link>
        </div>
      </div>
    </section>
  )
}
