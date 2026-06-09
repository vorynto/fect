import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Save, Upload, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import type { PageContent } from '../../types'

const SECTIONS: Record<string, { key: string; label: string; titleLabel?: string; contentLabel?: string; image?: boolean }[]> = {
  Home: [
    { key: 'about',     label: 'About FECT',        titleLabel: 'Section Heading', contentLabel: 'Body Text' },
    { key: 'donate_cta',label: 'Donate CTA',         titleLabel: 'Heading',         contentLabel: 'Description' },
    { key: 'stat_1',    label: 'Stat 1',             titleLabel: 'Value (e.g. 1200+)', contentLabel: 'Label (e.g. Students Supported)' },
    { key: 'stat_2',    label: 'Stat 2',             titleLabel: 'Value',           contentLabel: 'Label' },
    { key: 'stat_3',    label: 'Stat 3',             titleLabel: 'Value',           contentLabel: 'Label' },
    { key: 'stat_4',    label: 'Stat 4',             titleLabel: 'Value',           contentLabel: 'Label' },
    { key: 'process_1', label: 'Process Step 1',     titleLabel: 'Step Title',      contentLabel: 'Description' },
    { key: 'process_2', label: 'Process Step 2',     titleLabel: 'Step Title',      contentLabel: 'Description' },
    { key: 'process_3', label: 'Process Step 3',     titleLabel: 'Step Title',      contentLabel: 'Description' },
    { key: 'process_4', label: 'Process Step 4',     titleLabel: 'Step Title',      contentLabel: 'Description' },
  ],
  'Our Story': [
    { key: 'hero',      label: 'Hero Banner',        titleLabel: 'Page Title',      contentLabel: 'Subtitle', image: true },
    { key: 'founding',  label: 'Founding Story',     titleLabel: 'Section Heading', contentLabel: 'Body Text' },
    { key: 'mission',   label: 'Our Mission',        titleLabel: 'Heading',         contentLabel: 'Mission Statement' },
    { key: 'vision',    label: 'Our Vision',         titleLabel: 'Heading',         contentLabel: 'Vision Statement' },
    { key: 'value_1',   label: 'Core Value 1',       titleLabel: 'Value Name',      contentLabel: 'Description' },
    { key: 'value_2',   label: 'Core Value 2',       titleLabel: 'Value Name',      contentLabel: 'Description' },
    { key: 'value_3',   label: 'Core Value 3',       titleLabel: 'Value Name',      contentLabel: 'Description' },
    { key: 'reg_number',label: 'Registration Number',titleLabel: 'Value',           contentLabel: '' },
    { key: 'reg_date',  label: 'Registration Date',  titleLabel: 'Value',           contentLabel: '' },
    { key: 'reg_type',  label: 'Trust Type',         titleLabel: 'Value',           contentLabel: '' },
    { key: 'reg_section',label: '80G Note',          titleLabel: 'Value',           contentLabel: '' },
  ],
  'Our Mission': [
    { key: 'hero',         label: 'Hero Banner',      titleLabel: 'Page Title',      contentLabel: 'Subtitle', image: true },
    { key: 'mission',      label: 'Mission Statement',titleLabel: 'Heading',         contentLabel: 'Body Text' },
    { key: 'vision',       label: 'Vision Statement', titleLabel: 'Heading',         contentLabel: 'Body Text' },
    { key: 'values_intro', label: 'Goals Section',    titleLabel: 'Section Heading', contentLabel: 'Description' },
    { key: 'goal_1',       label: 'Goal 1',           titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'goal_2',       label: 'Goal 2',           titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'goal_3',       label: 'Goal 3',           titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'goal_4',       label: 'Goal 4',           titleLabel: 'Title',           contentLabel: 'Description' },
  ],
  'Our Work Process': [
    { key: 'hero',         label: 'Hero Banner',          titleLabel: 'Page Title',      contentLabel: 'Subtitle', image: true },
    { key: 'step_1',       label: 'Stage 1',              titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'step_2',       label: 'Stage 2',              titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'step_3',       label: 'Stage 3',              titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'step_4',       label: 'Stage 4',              titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'detail_1',     label: 'Detail Step 1',        titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'detail_2',     label: 'Detail Step 2',        titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'detail_3',     label: 'Detail Step 3',        titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'detail_4',     label: 'Detail Step 4',        titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'detail_5',     label: 'Detail Step 5',        titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'detail_6',     label: 'Detail Step 6',        titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'detail_7',     label: 'Detail Step 7',        titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'detail_8',     label: 'Detail Step 8',        titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'homes_title',  label: 'Homes Section Heading',titleLabel: 'Heading',         contentLabel: '' },
    { key: 'homes_content',label: 'Homes Section Body',   titleLabel: '',                contentLabel: 'Body Text' },
  ],
  'Who We Are': [
    { key: 'hero',    label: 'Hero Banner',      titleLabel: 'Page Title',      contentLabel: 'Subtitle', image: true },
    { key: 'origin',  label: 'Origin Story',     titleLabel: 'Section Heading', contentLabel: 'Body Text' },
    { key: 'growth',  label: 'Growth Section',   titleLabel: 'Section Heading', contentLabel: 'Body Text' },
    { key: 'today',   label: 'FECT Today',       titleLabel: 'Section Heading', contentLabel: 'Body Text' },
    { key: 'stat_founded',  label: 'Stat: Founded',   titleLabel: 'Value (e.g. 2009)',  contentLabel: 'Label' },
    { key: 'stat_members',  label: 'Stat: Members',   titleLabel: 'Value (e.g. 40+)',   contentLabel: 'Label' },
    { key: 'stat_students', label: 'Stat: Students',  titleLabel: 'Value (e.g. 1,200+)',contentLabel: 'Label' },
    { key: 'stat_districts',label: 'Stat: Districts', titleLabel: 'Value (e.g. 12+)',   contentLabel: 'Label' },
    { key: 'value_1', label: 'Value 1', titleLabel: 'Title', contentLabel: 'Description' },
    { key: 'value_2', label: 'Value 2', titleLabel: 'Title', contentLabel: 'Description' },
    { key: 'value_3', label: 'Value 3', titleLabel: 'Title', contentLabel: 'Description' },
    { key: 'value_4', label: 'Value 4', titleLabel: 'Title', contentLabel: 'Description' },
  ],
  'What You Can Do': [
    { key: 'hero',          label: 'Hero Banner',         titleLabel: 'Page Title',      contentLabel: 'Subtitle', image: true },
    { key: 'intro',         label: 'Intro Section',       titleLabel: 'Heading',         contentLabel: 'Body Text' },
    { key: 'refer_student', label: 'Refer a Student Card',titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'refer_home',    label: 'Refer a Home Card',   titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'donate',        label: 'Donate Card',         titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'become_member', label: 'Become a Member Card',titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'spread_word',   label: 'Spread the Word Card',titleLabel: 'Title',           contentLabel: 'Description' },
  ],
  'Refer a Student': [
    { key: 'hero',  label: 'Hero Banner', titleLabel: 'Page Title', contentLabel: 'Subtitle', image: true },
    { key: 'intro', label: 'Intro Text',  titleLabel: '',           contentLabel: 'Body Text' },
  ],
  'Refer a Home': [
    { key: 'hero',  label: 'Hero Banner', titleLabel: 'Page Title', contentLabel: 'Subtitle', image: true },
    { key: 'intro', label: 'Intro Text',  titleLabel: '',           contentLabel: 'Body Text' },
  ],
  'Become a Member': [
    { key: 'hero',        label: 'Hero Banner',         titleLabel: 'Page Title',  contentLabel: 'Subtitle', image: true },
    { key: 'intro',       label: 'Intro Text',          titleLabel: '',            contentLabel: 'Body Text' },
    { key: 'req_title',   label: 'Requirements Heading',titleLabel: 'Heading',     contentLabel: '' },
    { key: 'req_content', label: 'Requirements Body',   titleLabel: '',            contentLabel: 'Body Text' },
  ],
  'Spread the Word': [
    { key: 'hero',    label: 'Hero Banner',     titleLabel: 'Page Title',      contentLabel: 'Subtitle', image: true },
    { key: 'intro',   label: 'Intro Text',      titleLabel: '',                contentLabel: 'Body Text' },
    { key: 'share_1', label: 'Share Method 1',  titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'share_2', label: 'Share Method 2',  titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'share_3', label: 'Share Method 3',  titleLabel: 'Title',           contentLabel: 'Description' },
    { key: 'share_4', label: 'Share Method 4',  titleLabel: 'Title',           contentLabel: 'Description' },
  ],
  Gallery: [
    { key: 'hero', label: 'Hero Banner', titleLabel: 'Page Title', contentLabel: 'Subtitle', image: true },
  ],
  Testimonials: [
    { key: 'hero', label: 'Hero Banner', titleLabel: 'Page Title', contentLabel: 'Subtitle', image: true },
  ],
  Contact: [
    { key: 'hero',           label: 'Hero Banner',        titleLabel: 'Page Title',  contentLabel: 'Subtitle', image: true },
    { key: 'info',           label: 'Intro Text',         titleLabel: 'Heading',     contentLabel: 'Body Text' },
    { key: 'member_title',   label: 'Membership Card',    titleLabel: 'Card Heading',contentLabel: '' },
    { key: 'member_content', label: 'Membership Body',    titleLabel: '',            contentLabel: 'Body Text' },
  ],
  Donate: [
    { key: 'hero',   label: 'Hero Banner',   titleLabel: 'Page Title',    contentLabel: 'Subtitle', image: true },
    { key: 'intro',  label: 'Intro Section', titleLabel: 'Heading',       contentLabel: 'Description' },
    { key: 'tier_1', label: 'Donation Tier 1', titleLabel: 'Amount (e.g. ₹500/month)', contentLabel: 'Name|Description  (pipe-separated, e.g. Educate a Child|Sponsor school fees...)' },
    { key: 'tier_2', label: 'Donation Tier 2', titleLabel: 'Amount', contentLabel: 'Name|Description' },
    { key: 'tier_3', label: 'Donation Tier 3', titleLabel: 'Amount', contentLabel: 'Name|Description' },
    { key: 'tier_4', label: 'Donation Tier 4', titleLabel: 'Amount', contentLabel: 'Name|Description' },
  ],
}

const PAGE_KEY_MAP: Record<string, string> = {
  Home: 'home',
  'Our Story': 'our_story',
  'Our Mission': 'our_mission',
  'Our Work Process': 'our_work_process',
  'Who We Are': 'who_we_are',
  'What You Can Do': 'what_you_can_do',
  'Refer a Student': 'refer_student',
  'Refer a Home': 'refer_home',
  'Become a Member': 'become_a_member',
  'Spread the Word': 'spread_the_word',
  Gallery: 'gallery',
  Testimonials: 'testimonials',
  Contact: 'contact',
  Donate: 'donate',
}

export default function AdminPages() {
  const [data, setData] = useState<Record<string, PageContent>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('Home')
  const tabs = Object.keys(SECTIONS)

  useEffect(() => {
    supabase.from('page_content').select('*').then(({ data: rows }) => {
      if (!rows) return
      const map: Record<string, PageContent> = {}
      rows.forEach(r => { map[`${r.page_key}.${r.section_key}`] = r })
      setData(map)
    })
  }, [])

  const update = (key: string, field: 'title' | 'content' | 'image_url', value: string) => {
    setData(d => ({ ...d, [key]: { ...(d[key] || {} as PageContent), [field]: value } }))
  }

  const uploadHeroImage = async (mapKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(mapKey)
    const ext = file.name.split('.').pop()
    const path = `headers/${mapKey.replace('.', '-')}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('fect-uploads').upload(path, file, { upsert: true })
    if (error) { toast.error('Upload failed: ' + error.message); setUploading(null); return }
    const { data: { publicUrl } } = supabase.storage.from('fect-uploads').getPublicUrl(path)
    update(mapKey, 'image_url', publicUrl)
    setUploading(null)
    toast.success('Header image uploaded! Click Save to apply.')
    e.target.value = ''
  }

  const handleSave = async (pageTab: string, sectionKey: string) => {
    const pageKey = PAGE_KEY_MAP[pageTab]
    const mapKey = `${pageKey}.${sectionKey}`
    const item = data[mapKey]
    if (!item) return
    setSaving(mapKey)
    const { error } = await supabase.from('page_content').upsert(
      { page_key: pageKey, section_key: sectionKey, title: item.title || '', content: item.content || '', image_url: item.image_url || '', updated_at: new Date().toISOString() },
      { onConflict: 'page_key,section_key' }
    )
    setSaving(null)
    if (error) toast.error(error.message)
    else toast.success('Saved!')
  }

  const handleSaveAll = async (pageTab: string) => {
    const pageKey = PAGE_KEY_MAP[pageTab]
    setSaving(`${pageKey}.__all__`)
    const upserts = SECTIONS[pageTab].map(s => {
      const item = data[`${pageKey}.${s.key}`]
      return { page_key: pageKey, section_key: s.key, title: item?.title || '', content: item?.content || '', image_url: item?.image_url || '', updated_at: new Date().toISOString() }
    })
    const { error } = await supabase.from('page_content').upsert(upserts, { onConflict: 'page_key,section_key' })
    setSaving(null)
    if (error) toast.error(error.message)
    else toast.success(`All ${pageTab} content saved!`)
  }

  const sections = SECTIONS[activeTab] || []
  const pageKey = PAGE_KEY_MAP[activeTab]

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Page Content</h1>
          <p className="text-gray-500 text-sm">Edit every text section across all website pages</p>
        </div>
        <button
          onClick={() => handleSaveAll(activeTab)}
          disabled={saving === `${pageKey}.__all__`}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold disabled:opacity-60"
          style={{ backgroundColor: 'var(--site-primary)' }}
        >
          <Save size={16} />
          {saving === `${pageKey}.__all__` ? 'Saving...' : `Save All ${activeTab}`}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
            style={activeTab === tab ? { backgroundColor: 'var(--site-primary)' } : {}}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map(section => {
          const mapKey = `${pageKey}.${section.key}`
          const item = data[mapKey] || { title: '', content: '' } as PageContent
          const isSaving = saving === mapKey
          const showTitle   = section.titleLabel !== ''
          const showContent = section.contentLabel !== ''

          return (
            <div key={section.key} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-sm">{section.label}</h3>
                <button
                  onClick={() => handleSave(activeTab, section.key)}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-xs font-semibold disabled:opacity-60"
                  style={{ backgroundColor: 'var(--site-primary)' }}
                >
                  <Save size={12} /> {isSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {showTitle && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      {section.titleLabel || 'Title'}
                    </label>
                    <input
                      value={item.title || ''}
                      onChange={e => update(mapKey, 'title', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-gray-800 text-sm"
                    />
                  </div>
                )}
                {showContent && (
                  <div className={!showTitle ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      {section.contentLabel || 'Content'}
                    </label>
                    <textarea
                      value={item.content || ''}
                      onChange={e => update(mapKey, 'content', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none text-gray-800 text-sm resize-none"
                    />
                  </div>
                )}

                {/* Header / banner background image */}
                {section.image && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
                      <ImageIcon size={13} /> Header Background Image
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Preview */}
                      <div
                        className="w-full sm:w-44 h-24 rounded-lg bg-cover bg-center border border-gray-200 shrink-0 flex items-center justify-center text-xs text-gray-400 relative overflow-hidden"
                        style={item.image_url ? { backgroundImage: `url(${item.image_url})` } : {}}
                      >
                        {!item.image_url && 'Default image'}
                        {item.image_url && <div className="absolute inset-0 bg-black/30" />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed cursor-pointer text-sm font-medium transition-colors ${uploading === mapKey ? 'opacity-60' : 'border-gray-300 text-gray-500 hover:border-[var(--site-primary)] hover:text-[var(--site-primary)]'}`}>
                          {uploading === mapKey ? (
                            <><div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-[var(--site-primary)] animate-spin" /> Uploading…</>
                          ) : (
                            <><Upload size={14} /> Upload image</>
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={e => uploadHeroImage(mapKey, e)} disabled={uploading === mapKey} />
                        </label>
                        <input
                          value={item.image_url || ''}
                          onChange={e => update(mapKey, 'image_url', e.target.value)}
                          placeholder="…or paste an image URL"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none text-gray-800 text-xs"
                        />
                        {item.image_url && (
                          <button
                            type="button"
                            onClick={() => update(mapKey, 'image_url', '')}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove (use default)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
