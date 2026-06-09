import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Heart, Stethoscope, Users, Star, UtensilsCrossed, TreePine, CheckCircle } from 'lucide-react'
import { usePageContent } from '../hooks/usePageContent'

const TABS = [
  {
    key: 'education',
    label: 'Education',
    icon: GraduationCap,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80',
    defaultTitle: 'Education Support',
    defaultDesc: 'FECT has a reliable network to identify and support academically strong students who require financial assistance. We believe no child should be denied education due to poverty.',
    bullets: [
      'School fees, uniforms, stationery, and notebooks for poor students',
      'Semester fees, hostel charges, and career guidance for graduates',
      'Special initiatives for orphans and children with special needs',
      'Annual camps offering yoga, health checkups, games, and meals',
      'Remote village school support with educational supplies',
    ],
  },
  {
    key: 'village_camps',
    label: 'Village Camps',
    icon: TreePine,
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&q=80',
    defaultTitle: 'Camp for Village Students',
    defaultDesc: 'We reach out to remote and underserved schools in villages, providing infrastructure improvements, one-day engagement activities, and annual educational supply distribution.',
    bullets: [
      'Identifies underserved remote schools across Tamil Nadu',
      'Infrastructure improvements including floors and school furniture',
      'One-day engagement activities and games for children',
      'Annual educational supply distribution to students',
      'Building lasting connections with rural communities',
    ],
  },
  {
    key: 'medical',
    label: 'Medical',
    icon: Stethoscope,
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=900&q=80',
    defaultTitle: 'Medical Services',
    defaultDesc: 'We extend financial and logistical support for emergency medical cases, surgical treatments, and ongoing care for critically ill patients including cancer survivors.',
    bullets: [
      'Emergency medical treatment and surgical assistance',
      'Blood donation coordination and awareness drives',
      'Annual support for cancer patients — food and necessities',
      'Connecting patients with the right medical facilities',
      'Financial aid for families facing medical crises',
    ],
  },
  {
    key: 'aged',
    label: 'Aged & Challenged',
    icon: Heart,
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80',
    defaultTitle: 'Support for Aged & Challenged',
    defaultDesc: 'We provide consistent, compassionate support to orphanages and homes for elderly and mentally challenged individuals — ensuring dignity and comfort through regular visits and provisions.',
    bullets: [
      'Monthly sponsorship of 4–5 orphanage and care facilities',
      'Food provisions tailored to the preferences of residents',
      'Clothing and essential items like cots and bedsheets',
      'Regular personal visits to maintain human connection',
      'Coordinating volunteers for on-ground assistance',
    ],
  },
  {
    key: 'special_children',
    label: 'Special Children',
    icon: Star,
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&q=80',
    defaultTitle: 'Support for Special Children',
    defaultDesc: 'Children with special needs deserve the same opportunities and joys as any other child. FECT provides educational sponsorship, meals, toys, and home facility support tailored to their unique needs.',
    bullets: [
      'Educational sponsorship for children with special needs',
      'Homemade nutritious meals delivered with care',
      'Specially designed toys and stimulating clothing',
      'Home facility support and accessibility improvements',
      'Engaging activities and events to build joy and confidence',
    ],
  },
  {
    key: 'annadanam',
    label: 'Annadanam',
    icon: UtensilsCrossed,
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=900&q=80',
    defaultTitle: 'Food Sponsor / Annadanam',
    defaultDesc: 'We cook and serve delicious, wholesome meals ourselves — feeding approximately 100 people daily including elders, children, and individuals on the roadside who have no other means.',
    bullets: [
      'Daily meal service for approximately 100 people',
      'Serves elders, children, and roadside individuals',
      'Meals cooked personally by FECT volunteers',
      'Festival special meal events and distributions',
      'Nutritionally balanced, home-style cooking',
    ],
  },
  {
    key: 'elders',
    label: 'Elders Support',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=900&q=80',
    defaultTitle: 'Support for Elders & Roadside Residents',
    defaultDesc: 'We ensure the elderly and roadside residents are not forgotten — providing seasonal clothing, bedsheets during monsoon, food provisions, and fulfilling their personalised wishlists.',
    bullets: [
      'Festival clothing distributions for elders',
      'Monsoon season bedsheet and blanket sponsorship',
      'Regular food provisions and grocery deliveries',
      'Personalised wishlist fulfilment for residents',
      'Compassionate visits and community engagement',
    ],
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function OurServices() {
  const { getTitle, get, getImage } = usePageContent('our_services')
  const [activeTab, setActiveTab] = useState(0)

  const heroTitle = getTitle('hero', 'Our Services')
  const heroDesc  = get('hero', 'Seven focused programmes — education, medical care, village outreach, and community support — transforming lives across Tamil Nadu.')

  const tab = TABS[activeTab]
  const Icon = tab.icon
  const title = getTitle(tab.key, tab.defaultTitle)
  const desc  = get(tab.key, tab.defaultDesc)

  const bullets: string[] = (() => {
    const raw = get(`${tab.key}_bullets`, '')
    if (raw) return raw.split('\n').map(s => s.trim()).filter(Boolean)
    return tab.bullets
  })()

  return (
    <div>
      {/* Hero */}
      <section
        className="py-28 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${getImage('hero', 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1600&q=80')})` }}
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

      {/* Tab Navigation */}
      <section className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-0 scrollbar-hide">
            {TABS.map((t, i) => {
              const TIcon = t.icon
              const isActive = activeTab === i
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(i)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all shrink-0 ${
                    isActive
                      ? 'border-[var(--site-primary)] text-[var(--site-primary)]'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                  }`}
                >
                  <TIcon size={16} />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-16 bg-gray-50 min-h-[520px]">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              variants={fadeUp}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              {/* Image */}
              <div className="rounded-3xl overflow-hidden shadow-xl order-2 lg:order-1">
                <img
                  src={getImage(tab.key, tab.image)}
                  alt={title}
                  className="w-full h-80 lg:h-96 object-cover"
                />
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6"
                  style={{ backgroundColor: 'var(--site-primary)' }}
                >
                  <Icon size={28} />
                </div>

                <span
                  className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full mb-4 text-white"
                  style={{ backgroundColor: 'var(--site-primary)' }}
                >
                  {tab.label}
                </span>

                <h2 className="text-3xl font-extrabold mb-4" style={{ color: 'var(--site-heading-color)' }}>
                  {title}
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg mb-8">{desc}</p>

                <ul className="space-y-3">
                  {bullets.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <CheckCircle size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--site-primary)' }} />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Tab Switcher — mobile-friendly card grid */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-xl font-bold text-center mb-8" style={{ color: 'var(--site-heading-color)' }}>
            All Our Programmes
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {TABS.map((t, i) => {
              const TIcon = t.icon
              const isActive = activeTab === i
              return (
                <button
                  key={t.key}
                  onClick={() => { setActiveTab(i); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center ${
                    isActive ? 'text-white border-transparent shadow-lg' : 'border-gray-100 text-gray-600 hover:border-[var(--site-primary)] hover:text-[var(--site-primary)] bg-gray-50'
                  }`}
                  style={isActive ? { backgroundColor: 'var(--site-primary)' } : {}}
                >
                  <TIcon size={22} />
                  <span className="text-xs font-semibold leading-tight">{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
