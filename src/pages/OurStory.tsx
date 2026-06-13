import { motion } from 'framer-motion'
import { usePageContent } from '../hooks/usePageContent'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
}

const DEFAULT_STORY = `FECT was born from a simple but powerful idea shared by a group of computer engineering friends — that no one should be held back by poverty when education can set them free. As students they dreamed of giving back to society; after graduation, life took each of them down their own career path, but the dream never faded.

A few years later they reconnected, united by a single conviction: that education is the most powerful weapon against poverty. They did not just want to send children to school — they wanted those children to grow up and lift their own families and communities in turn, creating a cycle of change that carries across generations.

What began informally — quietly identifying underprivileged children and sponsoring their education — soon gained momentum. The group that started as "FRIENDS" grew into "Friends to Care", and in February 2009 it was formally registered as the Friends Educational and Charitable Trust (FECT).

Today that small founding circle has grown into a team of around 40 dedicated members, working across Tamil Nadu to give underprivileged children the education, dignity, and opportunity every child deserves.`

// Extract a YouTube video ID from a full URL or a raw 11-char id
function youtubeId(input: string): string {
  const v = (input || '').trim()
  if (!v) return ''
  if (/^[\w-]{11}$/.test(v)) return v
  const m = v.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/)
  return m ? m[1] : ''
}

export default function OurStory() {
  const { getTitle, get, getImage } = usePageContent('our_story')

  const heroTitle = getTitle('hero', 'About Us')
  const heroDesc  = get('hero', 'From a few friends with a vision to an organisation that has touched thousands of lives across Tamil Nadu.')
  const foundTitle = getTitle('founding', 'Our Story')
  const storyText  = get('founding', DEFAULT_STORY)
  const paragraphs = storyText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)

  const regNumber  = getTitle('reg_number',  'TN-09/184')
  const regDate    = getTitle('reg_date',    '06.02.2009')
  const regType    = getTitle('reg_type',    'Charitable Trust')
  const regSection = getTitle('reg_section', 'Donations tax exempt 80G')

  const video1 = youtubeId(getTitle('video_1', ''))
  const video2 = youtubeId(getTitle('video_2', ''))
  const video1Caption = get('video_1', '')
  const video2Caption = get('video_2', '')
  const hasVideos = !!(video1 || video2)

  const values = [
    { key: 'value_1', defaultTitle: 'Transparency',   defaultDesc: 'Every rupee is accounted for. We publish impact reports and maintain complete financial transparency with our donors.' },
    { key: 'value_2', defaultTitle: 'Compassion',     defaultDesc: 'We treat every beneficiary with dignity and empathy, recognising that behind every case is a human story deserving respect.' },
    { key: 'value_3', defaultTitle: 'Sustainability', defaultDesc: 'We aim to create lasting change — not just immediate relief — by building educational legacies across generations.' },
  ]

  const VideoEmbed = ({ id, caption }: { id: string; caption: string }) => (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="rounded-2xl overflow-hidden shadow-lg bg-black">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${id}`}
          title={caption || 'FECT video'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      {caption && <p className="text-sm text-gray-600 px-4 py-3 bg-white">{caption}</p>}
    </motion.div>
  )

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
            {/* Story */}
            <div className="lg:col-span-2">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full mb-5 text-white" style={{ backgroundColor: 'var(--site-primary)' }}>
                  Established 2009
                </span>
                <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--site-heading-color)' }}>{foundTitle}</h2>
                <div className="space-y-5">
                  {paragraphs.map((p, i) => (
                    <p key={i} className="text-gray-600 leading-relaxed text-lg">{p}</p>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* YouTube videos (admin-editable) */}
              {video1 && <VideoEmbed id={video1} caption={video1Caption} />}
              {video2 && <VideoEmbed id={video2} caption={video2Caption} />}

              {/* Fallback image only when no videos are set */}
              {!hasVideos && (
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="rounded-2xl overflow-hidden shadow-lg">
                  <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80" alt="FECT Team" className="w-full h-52 object-cover" />
                </motion.div>
              )}

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
            </div>
          </div>

          {/* Key Stats — horizontal card below the story */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-14 rounded-2xl bg-gray-50 border border-gray-100 p-8"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 lg:divide-x divide-gray-200">
              {[
                { label: 'Students Supported', value: '1200+' },
                { label: 'Active Members',      value: '40+' },
                { label: 'Years of Service',    value: '15+' },
                { label: 'Districts Covered',   value: '12+' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center lg:px-4"
                >
                  <div className="text-3xl sm:text-4xl font-extrabold mb-1" style={{ color: 'var(--site-primary)' }}>{s.value}</div>
                  <div className="text-sm font-medium text-gray-500">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
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
