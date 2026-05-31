import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import type { PageContent } from '../../types'

const SECTIONS: Record<string, { key: string; label: string; titleLabel?: string; contentLabel?: string; titleHint?: string; contentHint?: string }[]> = {
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
  'About Us': [
    { key: 'hero',      label: 'Hero Banner',        titleLabel: 'Page Title',      contentLabel: 'Subtitle' },
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
  'Our Services': [
    { key: 'hero',      label: 'Hero Banner',        titleLabel: 'Page Title',      contentLabel: 'Subtitle' },
    { key: 'process_1', label: 'Process Step 1',     titleLabel: 'Step Title',      contentLabel: 'Description' },
    { key: 'process_2', label: 'Process Step 2',     titleLabel: 'Step Title',      contentLabel: 'Description' },
    { key: 'process_3', label: 'Process Step 3',     titleLabel: 'Step Title',      contentLabel: 'Description' },
    { key: 'process_4', label: 'Process Step 4',     titleLabel: 'Step Title',      contentLabel: 'Description' },
    { key: 'cta_title',  label: 'Bottom CTA Title',  titleLabel: 'Heading',         contentLabel: '' },
    { key: 'cta_content',label: 'Bottom CTA Text',   titleLabel: '',                contentLabel: 'Body Text' },
  ],
  Gallery: [
    { key: 'hero', label: 'Hero Banner', titleLabel: 'Page Title', contentLabel: 'Subtitle' },
  ],
  Testimonials: [
    { key: 'hero', label: 'Hero Banner', titleLabel: 'Page Title', contentLabel: 'Subtitle' },
  ],
  Contact: [
    { key: 'hero',           label: 'Hero Banner',        titleLabel: 'Page Title',  contentLabel: 'Subtitle' },
    { key: 'info',           label: 'Intro Text',         titleLabel: 'Heading',     contentLabel: 'Body Text' },
    { key: 'member_title',   label: 'Membership Card',    titleLabel: 'Card Heading',contentLabel: '' },
    { key: 'member_content', label: 'Membership Body',    titleLabel: '',            contentLabel: 'Body Text' },
  ],
  Donate: [
    { key: 'hero',   label: 'Hero Banner',   titleLabel: 'Page Title',    contentLabel: 'Subtitle' },
    { key: 'intro',  label: 'Intro Section', titleLabel: 'Heading',       contentLabel: 'Description' },
    { key: 'tier_1', label: 'Donation Tier 1', titleLabel: 'Amount (e.g. ₹500/month)', contentLabel: 'Name|Description  (pipe-separated, e.g. Educate a Child|Sponsor school fees...)' },
    { key: 'tier_2', label: 'Donation Tier 2', titleLabel: 'Amount', contentLabel: 'Name|Description' },
    { key: 'tier_3', label: 'Donation Tier 3', titleLabel: 'Amount', contentLabel: 'Name|Description' },
    { key: 'tier_4', label: 'Donation Tier 4', titleLabel: 'Amount', contentLabel: 'Name|Description' },
  ],
}

const PAGE_KEY_MAP: Record<string, string> = {
  Home: 'home',
  'About Us': 'our_story',
  'Our Services': 'services',
  Gallery: 'gallery',
  Testimonials: 'testimonials',
  Contact: 'contact',
  Donate: 'donate',
}

export default function AdminPages() {
  const [data, setData] = useState<Record<string, PageContent>>({})
  const [saving, setSaving] = useState<string | null>(null)
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

  const update = (key: string, field: 'title' | 'content', value: string) => {
    setData(d => ({ ...d, [key]: { ...(d[key] || {} as PageContent), [field]: value } }))
  }

  const handleSave = async (pageTab: string, sectionKey: string) => {
    const pageKey = PAGE_KEY_MAP[pageTab]
    const mapKey = `${pageKey}.${sectionKey}`
    const item = data[mapKey]
    if (!item) return
    setSaving(mapKey)
    const { error } = await supabase.from('page_content').upsert(
      { page_key: pageKey, section_key: sectionKey, title: item.title || '', content: item.content || '', updated_at: new Date().toISOString() },
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
      return { page_key: pageKey, section_key: s.key, title: item?.title || '', content: item?.content || '', updated_at: new Date().toISOString() }
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
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
