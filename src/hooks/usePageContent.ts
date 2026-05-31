import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { PageContent } from '../types'

export function usePageContent(pageKey: string) {
  const [content, setContent] = useState<Record<string, PageContent>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('page_content')
      .select('*')
      .eq('page_key', pageKey)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, PageContent> = {}
          data.forEach(d => { map[d.section_key] = d })
          setContent(map)
        }
        setLoading(false)
      })
  }, [pageKey])

  const get = (key: string, fallback = '') =>
    content[key]?.content ?? fallback

  const getTitle = (key: string, fallback = '') =>
    content[key]?.title ?? fallback

  const getSection = (key: string) => content[key] ?? null

  return { content, loading, get, getTitle, getSection }
}
