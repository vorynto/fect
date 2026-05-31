import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { GraduationCap, Heart, Home, Users, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { usePageContent } from '../hooks/usePageContent'
import type { Program } from '../types'

const iconMap: Record<string, React.ReactNode> = {
  GraduationCap: <GraduationCap size={36} />,
  Heart: <Heart size={36} />,
  Home: <Home size={36} />,
  Users: <Users size={36} />,
}

const iconBullets: Record<string, string[]> = {
  GraduationCap: ['School fees & books','Uniforms & supplies','College tuition','Exam support'],
  Heart:         ['Hospital bills','Medicine costs','Emergency treatment','Cancer care'],
  Home:          ['Orphanage sponsorship','Elderly care homes','Mentally challenged care','Regular visits'],
  Users:         ['School kit distribution','Essential supplies','Homeless support','Disaster relief'],
}

export default function Services() {
  const [programs, setPrograms] = useState<Program[]>([])
  const { getTitle, get } = usePageContent('services')

  useEffect(() => {
    supabase.from('programs').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => { if (data && data.length > 0) setPrograms(data) })
  }, [])

  const heroTitle = getTitle('hero', 'Our Services')
  const heroDesc  = get('hero', 'Four focused programs — education, medical, elderly care, and community support — transforming lives across Tamil Nadu.')
  const ctaTitle  = getTitle('cta_title',   'Want to Refer Someone?')
  const ctaDesc   = get('cta_content', 'Know someone who needs support? Refer a student, a patient, or a care home to FECT today.')

  const processSteps = [
    { key: 'process_1', defaultTitle: 'Gathering Referrals',    defaultDesc: 'Students and patients are referred by community members, schools, hospitals, and social workers across Tamil Nadu.' },
    { key: 'process_2', defaultTitle: 'Verification',            defaultDesc: 'Our team conducts telephonic and direct field visits to verify the genuine needs of every referred case.' },
    { key: 'process_3', defaultTitle: 'Fund Raising',            defaultDesc: 'We raise funds through donations, member contributions, and corporate partnerships for verified cases.' },
    { key: 'process_4', defaultTitle: 'Disbursal & Monitoring', defaultDesc: 'Funds are disbursed directly to schools, hospitals, or institutions and we monitor impact over time.' },
  ]

  const displayPrograms = programs.length > 0 ? programs : [
    { id: '1', title: 'Education Support',    description: 'Full sponsorship for underprivileged students from school through graduation.', icon: 'GraduationCap', sort_order: 1, is_active: true },
    { id: '2', title: 'Medical Assistance',   description: 'Emergency financial assistance for cancer patients and medical crises.', icon: 'Heart', sort_order: 2, is_active: true },
    { id: '3', title: 'Orphanage & Elderly',  description: 'Sponsorship and regular support for orphanages, elderly homes, and care institutions.', icon: 'Home', sort_order: 3, is_active: true },
    { id: '4', title: 'Community Support',    description: 'Distribution of essentials, school kits, and relief materials to vulnerable communities.', icon: 'Users', sort_order: 4, is_active: true },
  ]

  const images = ['1503676260728-1c00da094a0b','1584515933487-779824d29309','1529156069898-49953e39b3ac','1488521787991-ed7bbaae773c']

  return (
    <div>
      <section className="py-28 relative bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1600&q=80)' }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <h1 className="text-5xl font-extrabold mb-4 text-white">{heroTitle}</h1>
          <p className="text-xl text-gray-200">{heroDesc}</p>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full mb-4 text-white" style={{ backgroundColor: 'var(--site-primary)' }}>Our Programs</span>
            <h2 className="text-4xl font-extrabold" style={{ color: 'var(--site-heading-color)' }}>How We Help</h2>
          </motion.div>

          <div className="space-y-16">
            {displayPrograms.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }} className="grid lg:grid-cols-2 gap-12 items-center">
                <div className={i % 2 !== 0 ? 'lg:order-2' : ''}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-5" style={{ backgroundColor: 'var(--site-primary)' }}>
                    {iconMap[p.icon] || <GraduationCap size={36} />}
                  </div>
                  <h3 className="text-3xl font-bold mb-4" style={{ color: 'var(--site-heading-color)' }}>{p.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">{p.description}</p>
                  <ul className="space-y-2 text-gray-600">
                    {(iconBullets[p.icon] || iconBullets['Users']).map(item => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle size={16} style={{ color: 'var(--site-primary)' }} /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`rounded-2xl overflow-hidden shadow-xl ${i % 2 !== 0 ? 'lg:order-1' : ''}`}>
                  <img src={`https://images.unsplash.com/photo-${images[i] || images[0]}?w=800&q=80`} alt={p.title} className="w-full h-72 object-cover" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl font-extrabold" style={{ color: 'var(--site-heading-color)' }}>Our Work Process</h2>
          </motion.div>
          <div className="relative">
            <div className="hidden lg:block absolute top-10 left-0 right-0 h-0.5 bg-gray-200 mx-20" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {processSteps.map((step, i) => (
                <motion.div key={step.key} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-5 border-4 border-white shadow-lg" style={{ backgroundColor: 'var(--site-primary)' }}>
                    {i + 1}
                  </div>
                  <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--site-heading-color)' }}>
                    {getTitle(step.key, step.defaultTitle)}
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {get(step.key, step.defaultDesc)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-white text-center" style={{ backgroundColor: 'var(--site-primary)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-4">{ctaTitle}</h2>
          <p className="text-red-100 mb-8">{ctaDesc}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="px-8 py-3 bg-white rounded-md font-semibold text-gray-900 hover:-translate-y-0.5 transition-all">Refer Now</Link>
            <Link to="/donate" className="px-8 py-3 rounded-md border-2 border-white text-white font-semibold hover:bg-white hover:text-gray-900 transition-all">Donate</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
